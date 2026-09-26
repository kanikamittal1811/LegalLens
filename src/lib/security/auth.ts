import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export interface AuthVerificationResult {
  isValid: boolean;
  userId: string;
  isAnonymous: boolean;
  errorMessage?: string;
}

/**
 * Validates request authentication and enforces that a claimed userId matches the verified token.
 * Protects against IDOR (Insecure Direct Object References) and forged user IDs.
 */
export async function verifyRequestAuth(
  req: NextRequest,
  claimedUserId?: string | null
): Promise<AuthVerificationResult> {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;

  if (token) {
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      const verifiedUid = decodedToken.uid;

      // If a userId was claimed in the request body/form, ensure it matches the token
      if (claimedUserId && claimedUserId !== "anonymous" && claimedUserId !== verifiedUid) {
        return {
          isValid: false,
          userId: "",
          isAnonymous: false,
          errorMessage: "Forbidden: Claimed user ID does not match authenticated credentials.",
        };
      }

      return {
        isValid: true,
        userId: verifiedUid,
        isAnonymous: false,
      };
    } catch {
      return {
        isValid: false,
        userId: "",
        isAnonymous: false,
        errorMessage: "Unauthorized: Invalid or expired authentication token.",
      };
    }
  }

  // If no token is provided:
  // If the request specifically claims a non-anonymous user ID without credentials, reject it
  if (claimedUserId && claimedUserId !== "anonymous") {
    return {
      isValid: false,
      userId: "",
      isAnonymous: false,
      errorMessage: "Unauthorized: Authentication token is required to access or modify this user's resources.",
    };
  }

  // Unauthenticated requests are allowed for guest/anonymous trial usage only
  return {
    isValid: true,
    userId: "anonymous",
    isAnonymous: true,
  };
}
