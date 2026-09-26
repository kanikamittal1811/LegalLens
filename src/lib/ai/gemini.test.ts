import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentAnalysis } from './schemas';

const { mockGenerateContent } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
}));

// Import after mocking
import { analyzeDocumentText, analyzeDocumentBuffer } from './gemini';

describe('gemini AI service', () => {
  const mockAnalysisResponse: DocumentAnalysis = {
    summary: ['Contract between Party A and Party B', 'Term is 12 months'],
    clauses: [
      {
        title: 'Non-Compete',
        category: 'Restrictive Covenants',
        priority: 'high',
        originalText: 'Employee shall not compete for 2 years.',
        plainEnglish: 'You cannot work for a competitor for 2 years after leaving.',
        whyItMatters: 'Limits your future employment options.',
        questions: ['Is the geographic scope defined?'],
        page: 2,
        section: 'Section 4',
      },
    ],
    obligations: [
      {
        party: 'user',
        description: 'Provide 30 days written notice before termination.',
        deadline: '30 days',
      },
    ],
    deadlines: [
      {
        description: 'Annual review notice',
        relativePeriod: '30 days prior to year end',
      },
    ],
    unclearInformation: ['Severance amount is not specified.'],
  };

  beforeEach(() => {
    mockGenerateContent.mockReset();
  });

  describe('analyzeDocumentText', () => {
    it('successfully parses and returns DocumentAnalysis JSON', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(mockAnalysisResponse),
      });

      const result = await analyzeDocumentText('Contract text', 'Employment Agreement', 'New York');

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-3.1-flash-lite',
          config: expect.objectContaining({
            responseMimeType: 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockAnalysisResponse);
      expect(result.clauses).toHaveLength(1);
      expect(result.clauses[0].priority).toBe('high');
    });

    it('handles empty response gracefully by falling back to empty object', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: '',
      });

      const result = await analyzeDocumentText('Contract text', 'NDA', 'California');
      expect(result).toEqual({});
    });

    it('throws "Failed to analyze document" when the AI API fails', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('API quota exceeded'));

      await expect(
        analyzeDocumentText('Contract text', 'NDA', 'California')
      ).rejects.toThrow('Failed to analyze document');
    });
  });

  describe('analyzeDocumentBuffer', () => {
    it('sends base64 encoded buffer data and parses document analysis', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(mockAnalysisResponse),
      });

      const buffer = Buffer.from('Mock PDF content');
      const result = await analyzeDocumentBuffer(
        buffer,
        'application/pdf',
        'contract.pdf',
        'Lease',
        'Texas'
      );

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      const callArg = mockGenerateContent.mock.calls[0][0];
      expect(callArg.model).toBe('gemini-3.1-flash-lite');
      expect(callArg.contents[0].parts[0].inlineData).toEqual({
        mimeType: 'application/pdf',
        data: buffer.toString('base64'),
      });
      expect(result).toEqual(mockAnalysisResponse);
    });

    it('defaults mimeType to application/pdf when not provided', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(mockAnalysisResponse),
      });

      const buffer = Buffer.from('Binary data');
      await analyzeDocumentBuffer(
        buffer,
        '',
        'doc.bin',
        'Agreement',
        'General'
      );

      const callArg = mockGenerateContent.mock.calls[0][0];
      expect(callArg.contents[0].parts[0].inlineData.mimeType).toBe('application/pdf');
    });

    it('throws "Failed to analyze document" when buffer analysis fails', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('Model error'));

      const buffer = Buffer.from('Bad document');
      await expect(
        analyzeDocumentBuffer(buffer, 'application/pdf', 'bad.pdf', 'NDA', 'DE')
      ).rejects.toThrow('Failed to analyze document');
    });
  });
});
