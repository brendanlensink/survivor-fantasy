/**
 * Draft lock date: picks are editable up until this instant (e.g. season
 * premiere), then frozen. Set via env so it's a config change, not code —
 * see .env.example.
 */
export function draftLockAt(): Date | null {
  const raw = process.env.DRAFT_LOCK_AT;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isDraftLocked(now: Date = new Date()): boolean {
  const lockAt = draftLockAt();
  return lockAt !== null && now >= lockAt;
}

export const PICKS_PER_TRIBE = 2;
