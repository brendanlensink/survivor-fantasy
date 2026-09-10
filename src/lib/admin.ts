import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Simple email-allowlist admin gate — matches the README's "don't over-build
 * auth" philosophy. Set ADMIN_EMAILS to a comma-separated list of Google
 * account emails (see .env.example).
 */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email) return false;
  return adminEmails().includes(email);
}
