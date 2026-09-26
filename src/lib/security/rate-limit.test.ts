import { describe, it, expect } from "vitest";
import { checkRateLimit, getClientIdentifier } from "./rate-limit";
import { NextRequest } from "next/server";

describe("rate limiter utility", () => {
  it("allows requests within configured limit and decrements remaining quota", () => {
    const key = `test-user-${Date.now()}`;
    const opts = { limit: 3, windowMs: 10000 };

    const first = checkRateLimit(key, opts);
    expect(first.success).toBe(true);
    expect(first.remaining).toBe(2);

    const second = checkRateLimit(key, opts);
    expect(second.success).toBe(true);
    expect(second.remaining).toBe(1);

    const third = checkRateLimit(key, opts);
    expect(third.success).toBe(true);
    expect(third.remaining).toBe(0);

    const fourth = checkRateLimit(key, opts);
    expect(fourth.success).toBe(false);
    expect(fourth.remaining).toBe(0);
    expect(fourth.resetSeconds).toBeGreaterThan(0);
  });

  describe("getClientIdentifier", () => {
    it("prefers custom user key when non-anonymous", () => {
      const req = new NextRequest("http://localhost:3000/api/analyze");
      expect(getClientIdentifier(req, "user_999")).toBe("user:user_999");
    });

    it("extracts forwarded IP header for anonymous users", () => {
      const req = new NextRequest("http://localhost:3000/api/analyze", {
        headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
      });
      expect(getClientIdentifier(req, "anonymous")).toBe("ip:203.0.113.195");
    });
  });
});
