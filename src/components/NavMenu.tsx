"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AuthButtons from "./AuthButtons";
import { toggleSpoilerMode } from "@/lib/spoilerModeActions";

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M7 4h10v4a5 5 0 0 1-5 5 5 5 0 0 1-5-5V4Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 5H4v1a4 4 0 0 0 4 4M17 5h3v1a4 4 0 0 1-4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 13v3M9 20h6M10 20v-2.5a2 2 0 0 1 2-2 2 2 0 0 1 2 2V20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DraftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="5" y="4" width="14" height="17" rx="1.5" />
      <path d="M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1Z" />
      <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" strokeLinecap="round" />
    </svg>
  );
}

function CastIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" strokeLinecap="round" />
      <path d="M16 5.5a3 3 0 0 1 0 5.8M20.5 19.5a5 5 0 0 0-4-4.9" strokeLinecap="round" />
    </svg>
  );
}

function AdminIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 13a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 5.6 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H10a1.65 1.65 0 0 0 1-1.51V2.5a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V8.5a1.65 1.65 0 0 0 1.51 1H20a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const LINKS = [
  { href: "/", label: "Standings", icon: TrophyIcon },
  { href: "/draft", label: "Draft", icon: DraftIcon },
  { href: "/contestants", label: "Cast", icon: CastIcon },
];

const linkClass =
  "font-display uppercase tracking-wide text-sm text-parchment-dim hover:text-ember transition-colors";

function SpoilerToggle() {
  return (
    <form action={toggleSpoilerMode}>
      <button
        type="submit"
        className="font-display uppercase tracking-wide text-xs text-parchment-dim hover:text-ember transition-colors border border-wood-600 rounded px-2 py-1"
      >
        Spoilers on — turn off
      </button>
    </form>
  );
}

export default function NavMenu({
  admin,
  user,
  spoilerFree,
}: {
  admin: boolean;
  user: { name: string | null; email: string | null } | null;
  spoilerFree: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const links = admin ? [...LINKS, { href: "/admin", label: "Admin", icon: AdminIcon }] : LINKS;

  // Signed-out visitors can't see anything else on the site, so there's
  // nothing to navigate to — the sign-in prompt in the body covers it.
  if (!user) return null;

  return (
    <>
      <div className="hidden md:flex items-center gap-6 flex-1">
        {links.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
          return (
            <a
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`${linkClass} border-b-2 pb-0.5 ${
                active ? "border-ember text-ember" : "border-transparent"
              }`}
            >
              {l.label}
            </a>
          );
        })}
        <div className="ml-auto flex items-center gap-4">
          {!spoilerFree && <SpoilerToggle />}
          <AuthButtons user={user} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="md:hidden ml-auto text-parchment p-1"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.75">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-wood-950 border-t border-ember/60 shadow-xl px-3 py-3 flex flex-col gap-1 z-20 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="pb-2 flex flex-col gap-3 [&>*]:w-full [&>button]:w-full [&>button]:justify-start [&>button]:py-3">
            <AuthButtons user={user} />
            {!spoilerFree && <SpoilerToggle />}
          </div>

          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
            const Icon = l.icon;
            return (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-3 font-display uppercase tracking-wide text-sm transition-colors ${
                  active ? "bg-wood-800 text-ember" : "text-parchment-dim hover:bg-wood-900 hover:text-ember"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {l.label}
              </a>
            );
          })}
        </div>
      )}
    </>
  );
}
