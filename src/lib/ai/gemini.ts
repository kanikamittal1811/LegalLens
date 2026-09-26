import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, getAnalysisPrompt } from "./prompts";
import { DocumentAnalysis } from "./schemas";
import { sanitizeTextField } from "../security/validation";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

export async function analyzeDocumentText(
  text: string,
  documentType: string,
  jurisdiction: string
): Promise<DocumentAnalysis> {
  const prompt = getAnalysisPrompt(text, documentType, jurisdiction);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    const jsonString = response.text || "{}";
    const analysis: DocumentAnalysis = JSON.parse(jsonString);
    return analysis;
  } catch (error) {
    console.error("[Gemini] Error analyzing document:", error instanceof Error ? error.message : "Unknown error");
    throw new Error("Failed to analyze document");
  }
}

/**
 * Analyze a document by sending the raw file bytes directly to Gemini.
 * Gemini natively supports PDF parsing.
 */
export async function analyzeDocumentBuffer(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
  documentType: string,
  jurisdiction: string
): Promise<DocumentAnalysis> {
  const base64Data = buffer.toString("base64");
  const safeDocType = sanitizeTextField(documentType, 100, "Legal Document");
  const safeJurisdiction = sanitizeTextField(jurisdiction, 100, "not specified");

  const promptText = `Analyze this legal document (${safeDocType}, jurisdiction: ${safeJurisdiction}).
  
Return a JSON object with:
- "summary": array of plain-English bullet points summarizing the key points
- "clauses": array of important clauses, each with: title, section, page, originalText, plainEnglish, whyItMatters, priority ("high", "review", or "standard"), and questions (array of strings)
- "obligations": array of obligations, each with: description, party ("user" or "other"), section
- "deadlines": array of deadlines, each with: description, date (if specific), relativePeriod (e.g. "30 days"), section
- "unclearInformation": array of strings describing what the document doesn't clearly state`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "application/pdf",
                data: base64Data,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    const jsonString = response.text || "{}";
    const analysis: DocumentAnalysis = JSON.parse(jsonString);
    return analysis;
  } catch (error) {
    console.error("[Gemini] Error analyzing document buffer:", error instanceof Error ? error.message : "Unknown error");
    throw new Error("Failed to analyze document");
  }
}
