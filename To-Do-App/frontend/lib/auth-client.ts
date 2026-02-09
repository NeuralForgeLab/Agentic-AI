// Task: T2-006 - Better Auth client configuration
// From: specs/phase2-web/spec.md §5
import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
  plugins: [jwtClient()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

// Helper to get JWT token for API calls using Better Auth's token() method
export async function getJwtToken(): Promise<string | null> {
  try {
    // Use Better Auth's token() method from the JWT client plugin
    const result = await authClient.token();

    if (result.error) {
      console.error("Failed to get JWT token:", result.error);
      return null;
    }

    return result.data?.token || null;
  } catch (error) {
    console.error("Error getting JWT token:", error);
    return null;
  }
}
