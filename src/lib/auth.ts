import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    // Expose the User id on the session so server components/routes can
    // look up the matching Player without an extra round trip by email.
    async session({ session, user }) {
      if (session.user) (session.user as { id?: string }).id = user.id;
      return session;
    },
  },
  events: {
    // First login: auto-provision the app-domain Player row for this
    // User, so signing in is the entire "sign up" flow.
    async createUser({ user }) {
      await db.player.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          name: user.name ?? user.email ?? "Player",
          email: user.email,
          userId: user.id,
        },
      });
    },
  },
};

/** The signed-in user's Player row, or null if not signed in / not yet provisioned. */
export async function getCurrentPlayer() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;

  return db.player.findUnique({ where: { userId } });
}
