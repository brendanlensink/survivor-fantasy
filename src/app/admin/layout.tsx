import { isCurrentUserAdmin } from "@/lib/admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PageHeading from "@/components/PageHeading";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [admin, session] = await Promise.all([isCurrentUserAdmin(), getServerSession(authOptions)]);

  if (!admin) {
    return (
      <div>
        <PageHeading>Admin</PageHeading>
        <p className="text-parchment-dim">
          {session?.user
            ? "Your account isn't on the admin list."
            : "Sign in with Google (top right) to access admin."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeading>Admin</PageHeading>
      <nav className="flex gap-4 mb-6 text-sm font-display uppercase tracking-wide border-b border-wood-600 pb-4">
        <a href="/admin/episodes" className="text-parchment-dim hover:text-ember transition-colors">
          Episode stats
        </a>
        <a href="/admin/contestants" className="text-parchment-dim hover:text-ember transition-colors">
          Contestants
        </a>
        <a href="/admin/teams" className="text-parchment-dim hover:text-ember transition-colors">
          Teams
        </a>
      </nav>
      {children}
    </div>
  );
}
