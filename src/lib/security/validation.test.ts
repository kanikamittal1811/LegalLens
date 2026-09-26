import { describe, it, expect } from "vitest";
import {
  validateUploadedFile,
  validateDocumentId,
  sanitizeTextField,
  sanitizeChatMessage,
  MAX_FILE_SIZE_BYTES,
} from "./validation";

describe("validation security utilities", () => {
  describe("validateUploadedFile", () => {
    it("accepts valid PDF file with valid header", () => {
      const pdfBuffer = Buffer.from("%PDF-1.4 sample content");
      const file = new File([pdfBuffer], "contract.pdf", { type: "application/pdf" });

      const result = validateUploadedFile(file, pdfBuffer);
      expect(result.isValid).toBe(true);
      expect(result.isPdf).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("accepts valid DOCX and TXT files", () => {
      const txtFile = new File(["sample text"], "notes.txt", { type: "text/plain" });
      expect(validateUploadedFile(txtFile).isValid).toBe(true);

      const docxFile = new File(["sample binary"], "agreement.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      expect(validateUploadedFile(docxFile).isValid).toBe(true);
    });

    it("rejects empty files (0 bytes)", () => {
      const emptyFile = new File([], "empty.pdf", { type: "application/pdf" });
      const result = validateUploadedFile(emptyFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Empty file");
    });

    it("rejects files exceeding maximum size (15MB)", () => {
      const largeFile = new File(["test"], "huge.pdf", { type: "application/pdf" });
      Object.defineProperty(largeFile, "size", { value: MAX_FILE_SIZE_BYTES + 1024 });

      const result = validateUploadedFile(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("exceeds maximum allowed size");
    });

    it("rejects forbidden file extensions like .exe, .sh, .svg, .js", () => {
      const exeFile = new File(["malicious"], "run.exe", { type: "application/x-msdownload" });
      expect(validateUploadedFile(exeFile).isValid).toBe(false);

      const svgFile = new File(["<svg></svg>"], "image.svg", { type: "image/svg+xml" });
      expect(validateUploadedFile(svgFile).isValid).toBe(false);

      const noExtFile = new File(["data"], "noextension", { type: "application/octet-stream" });
      expect(validateUploadedFile(noExtFile).isValid).toBe(false);
    });

    it("rejects PDF files with corrupted or forged headers", () => {
      const fakePdfBuffer = Buffer.from("NOT_A_PDF_HEADER_DATA");
      const file = new File([fakePdfBuffer], "fake.pdf", { type: "application/pdf" });

      const result = validateUploadedFile(file, fakePdfBuffer);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("PDF file header verification failed");
    });
  });

  describe("validateDocumentId", () => {
    it("accepts valid alphanumeric, hyphen, and underscore IDs", () => {
      expect(validateDocumentId("-Nx123abc_-XYZ")).toBe(true);
      expect(validateDocumentId("doc_12345")).toBe(true);
    });

    it("rejects path traversal and invalid characters", () => {
      expect(validateDocumentId("../etc/passwd")).toBe(false);
      expect(validateDocumentId("doc/subpath")).toBe(false);
      expect(validateDocumentId("doc;DROP TABLE")).toBe(false);
      expect(validateDocumentId("")).toBe(false);
      expect(validateDocumentId(null)).toBe(false);
    });
  });

  describe("sanitizeTextField", () => {
    it("strips ASCII control characters and limits length", () => {
      const dirty = "Confidential\x00 Agreement\x1F Document";
      const clean = sanitizeTextField(dirty, 20);
      expect(clean).toBe("Confidential Agreeme");
      expect(clean).not.toContain("\x00");
    });

    it("uses fallback when input is invalid or empty", () => {
      expect(sanitizeTextField("", 50, "Default")).toBe("Default");
      expect(sanitizeTextField(null, 50, "Default")).toBe("Default");
    });
  });

  describe("sanitizeChatMessage", () => {
    it("trims and strips control characters", () => {
      const message = "  What are my obligations?\x00  ";
      expect(sanitizeChatMessage(message)).toBe("What are my obligations?");
    });
  });
});
