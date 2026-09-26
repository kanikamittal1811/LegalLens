import { NextRequest, NextResponse } from "next/server";
import { analyzeDocumentText } from "@/lib/ai/gemini";
import { adminDb } from "@/lib/firebase/admin";
import { extractText } from "unpdf";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as string;
    const jurisdiction = formData.get("jurisdiction") as string;
    const userId = formData.get("userId") as string;

    if (!file || !documentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Extract text from the PDF using unpdf
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let text = "";
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      const pdfData = new Uint8Array(buffer);
      const result = await extractText(pdfData);
      console.log("unpdf result type:", typeof result.text, Array.isArray(result.text));
      // result.text may be a string or an array of strings (one per page)
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
        { error: "Could not extract text from document. The PDF may be image-based." },
        { status: 400 }
      );
    }

    // 2. Send extracted text to Gemini
    const analysis = await analyzeDocumentText(text, documentType, jurisdiction);
    
    console.log("[Route] Analysis received. Clauses:", analysis.clauses?.length, "Obligations:", analysis.obligations?.length);

    // 3. Save to Realtime Database
    console.log("[DB] Saving to Realtime Database...");
    const userRef = adminDb.ref(`users/${userId || "anonymous"}/documents`).push();
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

    await userRef.set({
      userId: userId || "anonymous",
      name: file.name,
      documentType,
      jurisdiction,
      status: "completed",
      createdAt: new Date().toISOString(),
      summary: analysis.summary,
      unclearInformation: analysis.unclearInformation || [],
      clauses: clausesObj,
      obligations: obligationsObj,
      deadlines: deadlinesObj
    });

    console.log("[DB] Saved! docId:", docId);

    return NextResponse.json({
      success: true,
      documentId: docId,
      analysis,
    });
  } catch (error: unknown) {
    console.error("Analysis Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred during analysis";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
