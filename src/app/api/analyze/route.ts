import { NextRequest, NextResponse } from "next/server";
import { analyzeDocumentText } from "@/lib/ai/gemini";
import { adminDb } from "@/lib/firebase/admin";
import { extractText } from "unpdf";
import { verifyRequestAuth } from "@/lib/security/auth";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/rate-limit";
import { validateUploadedFile, sanitizeTextField, MAX_TEXT_LENGTH } from "@/lib/security/validation";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("documentType") as string | null;
    const jurisdiction = formData.get("jurisdiction") as string | null;
    const rawUserId = formData.get("userId") as string | null;

    if (!file || !documentType) {
      return NextResponse.json(
        { error: "Missing required fields (file and document classification)." },
        { status: 400 }
      );
    }

    // 1. Authenticate request and prevent IDOR / user spoofing
    const authResult = await verifyRequestAuth(req, rawUserId);
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: authResult.errorMessage || "Authentication failed." },
        { status: authResult.errorMessage?.startsWith("Forbidden") ? 403 : 401 }
      );
    }
    const targetUserId = authResult.userId;

    // 2. Rate limit to protect AI quotas & prevent DoS (10 document analyses per minute)
    const clientId = getClientIdentifier(req, targetUserId);
    const rateLimit = checkRateLimit(clientId, { limit: 10, windowMs: 60 * 1000 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before analyzing another document." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.resetSeconds) },
        }
      );
    }

    // 3. Extract and validate file buffer & MIME/header integrity
    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);
    if (buffer.length === 0 && typeof file.text === "function") {
      const textContent = await file.text();
      if (textContent.length > 0) {
        buffer = Buffer.from(textContent);
      }
    }

    const fileValidation = validateUploadedFile(file, buffer);
    if (!fileValidation.isValid) {
      return NextResponse.json(
        { error: fileValidation.error || "Invalid file." },
        { status: 400 }
      );
    }

    // 4. Extract text safely
    let text = "";
    if (fileValidation.isPdf) {
      const pdfData = new Uint8Array(buffer);
      const result = await extractText(pdfData);
      if (Array.isArray(result.text)) {
        text = result.text.join("\n");
      } else {
        text = String(result.text || "");
      }
    } else {
      text = buffer.toString("utf-8");
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from document. The PDF may be image-based or empty." },
        { status: 400 }
      );
    }

    // Truncate excessively long document text to avoid memory/quota exhaustion
    if (text.length > MAX_TEXT_LENGTH) {
      text = text.substring(0, MAX_TEXT_LENGTH);
    }

    const safeDocType = sanitizeTextField(documentType, 100, "Legal Document");
    const safeJurisdiction = sanitizeTextField(jurisdiction, 100, "Not specified");

    // 5. Send extracted text to Gemini
    const analysis = await analyzeDocumentText(text, safeDocType, safeJurisdiction);

    // 6. Save to Realtime Database under verified user space
    const userRef = adminDb.ref(`users/${targetUserId}/documents`).push();
    const docId = userRef.key;

    const clausesObj = (analysis.clauses || []).reduce((acc, clause, i) => {
      let questionsList: string[] = [];
      if (typeof clause.questions === "string") {
        questionsList = [clause.questions];
      } else if (Array.isArray(clause.questions)) {
        questionsList = clause.questions.map((q) => String(q));
      } else if (clause.questions && typeof clause.questions === "object") {
        questionsList = Object.values(clause.questions).map((q) => String(q));
      }
      acc[`clause_${i}`] = {
        ...clause,
        questions: questionsList,
      };
      return acc;
    }, {} as Record<string, unknown>);

    const obligationsObj = (analysis.obligations || []).reduce((acc, ob, i) => {
      acc[`obligation_${i}`] = ob;
      return acc;
    }, {} as Record<string, unknown>);

    const deadlinesObj = (analysis.deadlines || []).reduce((acc, dl, i) => {
      acc[`deadline_${i}`] = dl;
      return acc;
    }, {} as Record<string, unknown>);

    // Sanitize file name for persistence
    const sanitizedFileName = sanitizeTextField(file.name, 255, "document.pdf");

    await userRef.set({
      userId: targetUserId,
      name: sanitizedFileName,
      documentType: safeDocType,
      jurisdiction: safeJurisdiction,
      status: "completed",
      createdAt: new Date().toISOString(),
      summary: analysis.summary || [],
      unclearInformation: analysis.unclearInformation || [],
      clauses: clausesObj,
      obligations: obligationsObj,
      deadlines: deadlinesObj,
    });

    return NextResponse.json({
      success: true,
      documentId: docId,
      analysis,
    });
  } catch (error: unknown) {
    console.error("Analysis Error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "An unexpected error occurred during document analysis. Please try again." },
      { status: 500 }
    );
  }
}
