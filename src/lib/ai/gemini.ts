import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, getAnalysisPrompt } from "./prompts";
import { DocumentAnalysis } from "./schemas";

// In a real app, instantiate this with an API key from env vars.
// We assume GOOGLE_GENAI_API_KEY is set in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

export async function analyzeDocumentText(
  text: string,
  documentType: string,
  jurisdiction: string
): Promise<DocumentAnalysis> {
  const prompt = getAnalysisPrompt(text, documentType, jurisdiction);

  try {
    console.log(`[Gemini] Sending ${text.length} chars to gemini-3.1-flash-lite...`);
    const startTime = Date.now();
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Gemini] Response received in ${elapsed}s`);

    const jsonString = response.text || "{}";
    console.log(`[Gemini] Response length: ${jsonString.length} chars`);
    const analysis: DocumentAnalysis = JSON.parse(jsonString);
    return analysis;
  } catch (error) {
    console.error("[Gemini] Error analyzing document:", error);
    throw new Error("Failed to analyze document");
  }
}

/**
 * Analyze a document by sending the raw file bytes directly to Gemini.
 * Gemini natively supports PDF parsing, so no need for pdf-parse.
 */
export async function analyzeDocumentBuffer(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
  documentType: string,
  jurisdiction: string
): Promise<DocumentAnalysis> {
  const base64Data = buffer.toString("base64");

  const promptText = `Analyze this legal document (${documentType}, jurisdiction: ${jurisdiction || "not specified"}).
  
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
    console.error("Error analyzing document:", error);
    throw new Error("Failed to analyze document");
  }
}

