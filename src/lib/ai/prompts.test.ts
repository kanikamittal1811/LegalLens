import { describe, it, expect } from 'vitest';
import { SYSTEM_PROMPT, getAnalysisPrompt } from './prompts';

describe('prompts', () => {
  describe('SYSTEM_PROMPT', () => {
    it('contains core legal assistant boundaries and guidelines', () => {
      expect(SYSTEM_PROMPT).toContain('legal information and document analysis assistant');
      expect(SYSTEM_PROMPT).toContain('You are not a lawyer');
      expect(SYSTEM_PROMPT).toContain('Never invent clauses, dates, obligations, or facts');
      expect(SYSTEM_PROMPT).toContain('Encourage professional legal advice');
    });
  });

  describe('getAnalysisPrompt', () => {
    it('formats analysis prompt with provided document type and jurisdiction', () => {
      const docText = 'This is an employment agreement with non-compete clause.';
      const prompt = getAnalysisPrompt(docText, 'Employment Contract', 'California');

      expect(prompt).toContain('Document Type: Employment Contract');
      expect(prompt).toContain('Jurisdiction: California');
      expect(prompt).toContain(docText);
      expect(prompt).toContain('summary');
      expect(prompt).toContain('clauses');
      expect(prompt).toContain('obligations');
      expect(prompt).toContain('deadlines');
      expect(prompt).toContain('unclearInformation');
    });

    it('defaults jurisdiction to "Not specified" when omitted', () => {
      const docText = 'Sample NDA agreement text.';
      const prompt = getAnalysisPrompt(docText, 'Non-Disclosure Agreement');

      expect(prompt).toContain('Jurisdiction: Not specified');
      expect(prompt).toContain('Document Type: Non-Disclosure Agreement');
      expect(prompt).toContain(docText);
    });

    it('truncates document text exceeding 50,000 characters', () => {
      const longText = 'a'.repeat(60000);
      const prompt = getAnalysisPrompt(longText, 'Lease Agreement');

      expect(prompt.length).toBeLessThan(60000);
      expect(prompt).toContain('a'.repeat(50000));
      expect(prompt).not.toContain('a'.repeat(50001));
    });
  });
});
