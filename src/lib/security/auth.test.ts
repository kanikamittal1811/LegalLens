import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockVerifyIdToken } = vi.hoisted(() => ({
  mockVerifyIdToken: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  adminAuth: {
    verifyIdToken: (...args: unknown[]) => mockVerifyIdToken(...args),
  },
}));

import { verifyRequestAuth } from "./auth";

describe("auth security utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verifies valid token and returns matching user id", async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: "user_valid_123" });

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      headers: { Authorization: "Bearer valid-firebase-jwt-token" },
    });

    const result = await verifyRequestAuth(req, "user_valid_123");
    expect(result.isValid).toBe(true);
    expect(result.userId).toBe("user_valid_123");
    expect(result.isAnonymous).toBe(false);
  });

  it("rejects request with 403 when claimed userId does not match token (IDOR prevention)", async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: "attacker_user_id" });

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      headers: { Authorization: "Bearer attacker-valid-token" },
    });

    const result = await verifyRequestAuth(req, "victim_user_id");
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("Forbidden");
  });

  it("rejects request when token is invalid or expired", async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error("auth/id-token-expired"));

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      headers: { Authorization: "Bearer expired-token" },
    });

    const result = await verifyRequestAuth(req);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("Unauthorized: Invalid or expired");
  });

  it("rejects unauthenticated requests that attempt to claim a specific user ID without token", async () => {
    const req = new NextRequest("http://localhost:3000/api/analyze"); // No auth header

    const result = await verifyRequestAuth(req, "target_user_without_token");
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("Unauthorized: Authentication token is required");
  });

  it("permits anonymous guest trial requests when no specific user is claimed", async () => {
    const req = new NextRequest("http://localhost:3000/api/analyze");

    const result = await verifyRequestAuth(req, "anonymous");
    expect(result.isValid).toBe(true);
    expect(result.userId).toBe("anonymous");
    expect(result.isAnonymous).toBe(true);
  });
});
