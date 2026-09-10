import "./globals.css";
import { Oswald } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isCurrentUserAdmin } from "@/lib/admin";
import AuthButtons from "@/components/AuthButtons";
import TorchIcon from "@/components/TorchIcon";

const oswald = Oswald({ subsets: ["latin"], variable: "--font-display" });

export const metadata = {
  title: "Survivor Fantasy",
  description: "Friend-group fantasy league for Survivor 51",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, admin] = await Promise.all([getServerSession(authOptions), isCurrentUserAdmin()]);
  const user = session?.user ? { name: session.user.name ?? null, email: session.user.email ?? null } : null;

  return (
    <html lang="en" className={oswald.variable}>
      <body className="min-h-screen bg-wood-900 text-parchment">
        <div className="fiji-bg" aria-hidden="true" />
        <div className="fiji-overlay" aria-hidden="true" />
        <nav className="bg-black/60 border-b border-wood-600 px-6 py-4 flex gap-6 items-center">
          <a href="/" className="font-display text-xl tracking-wide uppercase flex items-center gap-2 text-parchment">
            <TorchIcon className="w-5 h-5 text-ember" />
            Survivor Fantasy
          </a>
          <a href="/draft" className="font-display uppercase tracking-wide text-sm text-parchment-dim hover:text-ember transition-colors">
            Draft
          </a>
          <a href="/contestants" className="font-display uppercase tracking-wide text-sm text-parchment-dim hover:text-ember transition-colors">
            Cast
          </a>
          {admin && (
            <a href="/admin" className="font-display uppercase tracking-wide text-sm text-parchment-dim hover:text-ember transition-colors">
              Admin
            </a>
          )}
          <div className="ml-auto">
            <AuthButtons user={user} />
          </div>
        </nav>
        <main className="max-w-4xl mx-auto p-6">
          <div className="bg-black/40 rounded-lg p-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
