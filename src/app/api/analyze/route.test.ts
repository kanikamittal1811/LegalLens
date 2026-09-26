import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies with vi.hoisted
const { mockAnalyzeDocumentText, mockPush, mockSet, mockRef, mockExtractText, mockVerifyIdToken } = vi.hoisted(() => ({
  mockAnalyzeDocumentText: vi.fn(),
  mockPush: vi.fn(),
  mockSet: vi.fn(),
  mockRef: vi.fn(),
  mockExtractText: vi.fn(),
  mockVerifyIdToken: vi.fn(),
}));

vi.mock('@/lib/ai/gemini', () => ({
  analyzeDocumentText: (...args: unknown[]) => mockAnalyzeDocumentText(...args),
}));

vi.mock('@/lib/firebase/admin', () => ({
  adminDb: {
    ref: (...args: unknown[]) => mockRef(...args),
  },
  adminAuth: {
    verifyIdToken: (...args: unknown[]) => mockVerifyIdToken(...args),
  },
}));

vi.mock('unpdf', () => ({
  extractText: (...args: unknown[]) => mockExtractText(...args),
}));

import { POST } from './route';

describe('POST /api/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockReturnValue({
      key: 'test-doc-id-123',
      set: mockSet,
    });
    mockRef.mockReturnValue({
      push: mockPush,
    });
    mockSet.mockResolvedValue(undefined);
    mockVerifyIdToken.mockResolvedValue({ uid: 'user-456' });
  });

  it('returns 400 when file or documentType is missing', async () => {
    const formData = new FormData();
    formData.append('documentType', 'Employment Contract');
    // Missing file

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('Missing required fields');
  });

  it('successfully analyzes a document and saves structured data to Firebase', async () => {
    const file = new File(['%PDF-1.4 sample'], 'contract.pdf', { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', 'Service Agreement');
    formData.append('jurisdiction', 'Delaware');
    formData.append('userId', 'user-456');

    mockExtractText.mockResolvedValueOnce({
      text: 'Simple extracted contract text',
    });

    const mockAnalysis = {
      summary: ['Test summary point 1'],
      clauses: [
        {
          title: 'Payment Terms',
          category: 'Finance',
          priority: 'review' as const,
          originalText: 'Net 30 days',
          plainEnglish: 'Pay within 30 days',
          whyItMatters: 'Late fees may apply',
          questions: ['What is the interest rate?'],
          page: 1,
          section: 'Sec 2',
        },
      ],
      obligations: [
        {
          party: 'user' as const,
          description: 'Deliver milestones on time',
        },
      ],
      deadlines: [
        {
          description: 'Payment due date',
          relativePeriod: '30 days',
        },
      ],
      unclearInformation: ['Invoice dispute mechanism is missing'],
    };

    mockAnalyzeDocumentText.mockResolvedValueOnce(mockAnalysis);

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid-user-token' },
      body: formData,
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.documentId).toBe('test-doc-id-123');
    expect(json.analysis).toEqual(mockAnalysis);

    expect(mockAnalyzeDocumentText).toHaveBeenCalledWith(
      'Simple extracted contract text',
      'Service Agreement',
      'Delaware'
    );
    expect(mockRef).toHaveBeenCalledWith('users/user-456/documents');
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-456',
        name: 'contract.pdf',
        documentType: 'Service Agreement',
        jurisdiction: 'Delaware',
        status: 'completed',
        summary: mockAnalysis.summary,
      })
    );
  });

  it('extracts text from PDF files using unpdf and handles array of pages', async () => {
    const pdfBytes = new Uint8Array([37, 80, 68, 70, 45]); // %PDF-
    const file = new File([pdfBytes], 'agreement.pdf', { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', 'NDA');

    mockExtractText.mockResolvedValueOnce({
      text: ['Page 1 NDA text', 'Page 2 confidentiality terms'],
    });

    mockAnalyzeDocumentText.mockResolvedValueOnce({
      summary: ['NDA Summary'],
      clauses: [],
      obligations: [],
      deadlines: [],
    });

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockAnalyzeDocumentText).toHaveBeenCalledWith(
      'Page 1 NDA text\nPage 2 confidentiality terms',
      'NDA',
      'Not specified'
    );
  });

  it('returns 400 when text extraction yields empty content', async () => {
    const pdfBytes = new Uint8Array([37, 80, 68, 70, 45]);
    const file = new File([pdfBytes], 'scanned_image.pdf', { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', 'Lease');

    mockExtractText.mockResolvedValueOnce({ text: '   ' });

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('Could not extract text from document');
  });

  it('rejects unsupported file formats', async () => {
    const file = new File(['echo hello'], 'script.sh', { type: 'application/x-sh' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', 'NDA');

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('Unsupported file type');
  });

  it('returns 500 when an unhandled error occurs during analysis', async () => {
    const file = new File(['%PDF-1.4 sample'], 'doc.pdf', { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', 'NDA');

    mockExtractText.mockResolvedValueOnce({ text: 'Valid extracted text' });
    mockAnalyzeDocumentText.mockRejectedValueOnce(new Error('AI server unavailable'));

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toContain('unexpected error occurred');
  });
});
