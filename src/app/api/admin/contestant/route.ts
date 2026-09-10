import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isCurrentUserAdmin } from "@/lib/admin";

// Direct contestant status edits — corrections/overrides outside the normal
// "check Booted on the episode form" flow (e.g. fixing a typo'd tribe, or
// marking the finale winner via isWinner, which isn't tied to any one
// episode's stat row).
export async function POST(req: Request) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 403 });
  }

  const body = await req.json();
  const { id, tribe, isEliminated, bootedEp, isWinner } = body as {
    id?: string;
    tribe?: string;
    isEliminated?: boolean;
    bootedEp?: number | null;
    isWinner?: boolean;
  };

  if (!id) {
    return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });
  }

  const contestant = await db.contestant.findUnique({ where: { id } });
  if (!contestant) {
    return NextResponse.json({ ok: false, error: "Contestant not found" }, { status: 404 });
  }

  // Only one winner at a time — setting isWinner clears it on everyone else.
  if (isWinner) {
    await db.contestant.updateMany({ where: { isWinner: true }, data: { isWinner: false } });
  }

  await db.contestant.update({
    where: { id },
    data: { tribe, isEliminated, bootedEp: bootedEp ?? null, isWinner },
  });

  return NextResponse.json({ ok: true });
}
