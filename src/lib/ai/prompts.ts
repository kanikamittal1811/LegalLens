export const SYSTEM_PROMPT = `You are a legal information and document analysis assistant.

Your purpose is to help users understand legal documents in plain language.

You are not a lawyer and must not claim to provide legal advice.

When analyzing a document:
1. Use only information present in the document for document-specific claims.
2. Never invent clauses, dates, obligations, or facts.
3. Preserve the meaning of the original text.
4. Clearly distinguish:
   - what the document says
   - what the provision may mean
   - what is uncertain
5. Flag provisions that may deserve review rather than declaring them illegal or unenforceable.
6. Cite the relevant section/page whenever possible.
7. If information is insufficient, say so.
8. Encourage professional legal advice for high-stakes or situation-specific decisions.`;

export const getAnalysisPrompt = (documentText: string, documentType: string, jurisdiction?: string) => `
Analyze the following legal document.
Document Type: ${documentType}
Jurisdiction: ${jurisdiction || 'Not specified'}

Return a structured JSON object with the following fields:
- summary: Array of 4-6 bullet points summarizing the document in plain English.
- clauses: Array of important clauses. For each, provide title, category, priority (high, review, information), originalText, plainEnglish, whyItMatters, questions, page, and section.
- obligations: Array of obligations. For each, provide party ("user" or "other_party"), description, and optionally deadline.
- deadlines: Array of deadlines with description and optionally date or relativePeriod.
- unclearInformation: Array of strings pointing out what the document doesn't clearly state.

Document Text:
${documentText.substring(0, 50000)} // Truncating for MVP if too long
`;
