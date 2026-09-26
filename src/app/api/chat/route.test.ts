import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies with vi.hoisted
const { mockGenerateContent, mockOnce, mockRef } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
  mockOnce: vi.fn(),
  mockRef: vi.fn(),
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
}));

vi.mock('@/lib/firebase/admin', () => ({
  adminDb: {
    ref: (...args: unknown[]) => mockRef(...args),
  },
}));

import { POST } from './route';

describe('POST /api/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRef.mockReturnValue({
      once: mockOnce,
    });
  });

  it('returns 400 if documentId or message is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ documentId: 'doc-123' }), // Missing message
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Missing documentId or message');
  });

  it('returns 404 if the document does not exist in Firebase', async () => {
    mockOnce.mockResolvedValueOnce({
      exists: () => false,
      val: () => null,
    });

    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        documentId: 'non-existent-doc',
        userId: 'user-1',
        message: 'Can I terminate early?',
      }),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Document not found');
  });

  it('generates chat answer using extracted document clauses and returns 200', async () => {
    mockOnce.mockResolvedValueOnce({
      exists: () => true,
      val: () => ({
        documentType: 'Employment Contract',
        jurisdiction: 'New York',
        clauses: {
          clause_0: {
            title: 'Termination for Convenience',
            originalText: 'Either party may terminate upon 30 days notice.',
            section: 'Section 8.1',
            page: 4,
          },
        },
      }),
    });

    const mockAiReply = `SHORT ANSWER
Yes, with 30 days notice.

WHAT THE DOCUMENT SAYS
Section 8.1 states either party may terminate upon 30 days notice.

WHAT THIS MEANS
You can leave or be let go with 30 days notice.

WHAT IS UNCLEAR
Whether notice must be in writing.

QUESTIONS TO CONSIDER
• How should notice be delivered?

SOURCE
Section 8.1 — Page 4`;

    mockGenerateContent.mockResolvedValueOnce({
      text: mockAiReply,
    });

    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        documentId: 'doc-123',
        userId: 'user-99',
        message: 'Can I terminate early?',
      }),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.reply).toBe(mockAiReply);

    expect(mockRef).toHaveBeenCalledWith('users/user-99/documents/doc-123');
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-2.5-pro',
        contents: expect.stringContaining('Can I terminate early?'),
      })
    );
  });

  it('handles exceptions and returns 500 error response', async () => {
    mockOnce.mockRejectedValueOnce(new Error('Database network timeout'));

    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        documentId: 'doc-123',
        message: 'Hello?',
      }),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Database network timeout');
  });
});
