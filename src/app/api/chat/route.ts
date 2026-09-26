import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentId, userId, message } = body;

    if (!documentId || !message) {
      return NextResponse.json({ error: "Missing documentId or message" }, { status: 400 });
    }

    // 1. Fetch document and its clauses
    const docRef = adminDb.ref(`users/${userId || "anonymous"}/documents/${documentId}`);
    const snapshot = await docRef.once("value");

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const docData = snapshot.val();
    const clausesMap = docData.clauses || {};
    const clauses = Object.values(clausesMap) as Array<{
      title?: string;
      originalText?: string;
      section?: string;
      page?: string | number;
    }>;

    // 2. Build context from clauses (Simple MVP Retrieval)
    // In MVP, we just feed all important clauses as context to avoid complex embeddings
    const context = clauses.map(c => `
      Clause: ${c.title}
      Text: ${c.originalText}
      Section: ${c.section || 'Unknown'}
      Page: ${c.page || 'Unknown'}
    `).join("\n\n");

    const prompt = `
      You are a legal document assistant answering questions about the uploaded document.
      
      Document Type: ${docData?.documentType}
      Jurisdiction: ${docData?.jurisdiction}
      
      Relevant Extracted Clauses from Document:
      ${context}

      User Question: ${message}

      Answer the user's question using ONLY the provided clauses. If the answer cannot be found in the clauses, say "I couldn't find enough information in the document to answer that." Do not invent answers.

      Format your response strictly as follows (do NOT use markdown syntax like \`\`\` for the structure, just the text sections):
      
      SHORT ANSWER
      [Your short answer]

      WHAT THE DOCUMENT SAYS
      [What the text says]

      WHAT THIS MEANS
      [Practical meaning]

      WHAT IS UNCLEAR
      [Anything ambiguous]

      QUESTIONS TO CONSIDER
      • [Question 1]
      • [Question 2]

      SOURCE
      [Citation, e.g., Section 9.2 — Page 8]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });

    return NextResponse.json({
      success: true,
      reply: response.text,
    });
  } catch (error: unknown) {
    console.error("Chat Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred during chat generation";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
