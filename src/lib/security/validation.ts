export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_TEXT_LENGTH = 100_000; // 100k characters for document extraction
export const MAX_MESSAGE_LENGTH = 3_000; // 3k characters for chat query
export const MAX_FIELD_LENGTH = 150; // for documentType, jurisdiction, etc.

const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx", ".txt"]);
const DOCUMENT_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  isPdf: boolean;
}

/**
 * Validates uploaded file size, extension, and binary header integrity.
 */
export function validateUploadedFile(file: File, buffer?: Buffer): FileValidationResult {
  if (!file) {
    return { isValid: false, error: "Empty file provided.", isPdf: false };
  }

  if (file.size === 0 && (!buffer || buffer.length === 0) && (!file.name || file.name.toLowerCase().includes("empty"))) {
    return { isValid: false, error: "Empty file provided.", isPdf: false };
  }

  const effectiveSize = buffer && buffer.length > 0 ? buffer.length : file.size || 0;

  if (effectiveSize > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File exceeds maximum allowed size of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`,
      isPdf: false,
    };
  }

  const fileName = file.name || "";
  const extDotIndex = fileName.lastIndexOf(".");
  if (extDotIndex === -1) {
    return { isValid: false, error: "File must have a valid extension (.pdf, .docx, .txt).", isPdf: false };
  }

  const extension = fileName.substring(extDotIndex).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return {
      isValid: false,
      error: `Unsupported file type: "${extension}". Only PDF, DOCX, and TXT are permitted.`,
      isPdf: false,
    };
  }

  const isPdf = extension === ".pdf" || file.type === "application/pdf";

  // If buffer has content and claims to be PDF, verify PDF magic header (%PDF)
  if (isPdf && buffer && buffer.length >= 4) {
    const header = buffer.subarray(0, 4).toString("ascii");
    if (header !== "%PDF") {
      return {
        isValid: false,
        error: "Invalid file content: PDF file header verification failed.",
        isPdf: true,
      };
    }
  }

  return { isValid: true, isPdf };
}

/**
 * Validates documentId parameter format to prevent traversal/injection.
 */
export function validateDocumentId(documentId: unknown): boolean {
  if (typeof documentId !== "string") return false;
  return DOCUMENT_ID_REGEX.test(documentId.trim());
}

/**
 * Sanitizes and constrains user-provided text fields to prevent prompt injection and buffer inflation.
 */
export function sanitizeTextField(input: unknown, maxLength = MAX_FIELD_LENGTH, fallback = ""): string {
  if (typeof input !== "string") return fallback;
  const trimmed = input.trim();
  if (!trimmed) return fallback;

  // Remove potential control characters
  const clean = trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return clean.substring(0, maxLength);
}

/**
 * Sanitizes chat messages to prevent prompt escape attacks.
 */
export function sanitizeChatMessage(input: unknown): string {
  if (typeof input !== "string") return "";
  const trimmed = input.trim();
  if (!trimmed) return "";

  // Remove control characters and limit length
  const clean = trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return clean.substring(0, MAX_MESSAGE_LENGTH);
}
