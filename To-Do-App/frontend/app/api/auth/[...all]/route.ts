// Task: T2-006 - Better Auth API route handler
// From: specs/phase2-web/spec.md §5
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
