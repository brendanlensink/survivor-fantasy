import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// RootLayout already renders the sign-in prompt in place of `children`
// whenever there's no session, so this route has nothing of its own to
// show — it just needs to exist as a redirect target for middleware.
export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/");
  return null;
}
