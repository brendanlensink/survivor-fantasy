"use client";

import { signIn, signOut } from "next-auth/react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" className="w-4 h-4 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.95v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.95a9 9 0 0 0 0 8.08l3.02-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.96l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export default function AuthButtons({
  user,
}: {
  user: { name: string | null; email: string | null } | null;
}) {
  if (!user) {
    return (
      <button
        onClick={() => signIn("google")}
        className="flex items-center gap-2 text-sm bg-parchment text-wood-950 rounded px-3 py-1.5 font-medium hover:bg-white transition-colors shadow-sm whitespace-nowrap shrink-0"
      >
        <GoogleIcon />
        Sign in with Google
      </button>
    );
  }

  const displayName = user.name ?? user.email ?? "Player";

  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className="w-7 h-7 rounded-full bg-ember text-wood-950 font-display flex items-center justify-center text-xs shrink-0"
        aria-hidden="true"
      >
        {initials(displayName)}
      </span>
      <span className="text-parchment-dim truncate">{displayName}</span>
      <button
        onClick={() => signOut()}
        className="text-parchment-dim hover:text-ember transition-colors ml-auto pl-2 shrink-0"
        title="Sign out"
      >
        <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M13 15l4-5-4-5M17 10H7M9 3H4v14h5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
