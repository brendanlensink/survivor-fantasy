import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentPlayer } from "@/lib/auth";
import { parseTeamName } from "@/lib/teamName";

// Rename the signed-in player's team. Deliberately NOT gated on the draft
// lock: the name is cosmetic, so players can change it all season.
export async function POST(req: Request) {
  const player = await getCurrentPlayer();
  if (!player) {
    return NextResponse.json({ ok: false, error: "Sign in to name your team" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = parseTeamName((body as { name?: unknown }).name);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  // Teams are created on the first draft save; an empty team would show up
  // on the leaderboard with no roster, so don't create one just for a name.
  const team = await db.team.findFirst({ where: { playerId: player.id } });
  if (!team) {
    return NextResponse.json({ ok: false, error: "Save your picks first, then name your team" }, { status: 404 });
  }

  await db.team.update({ where: { id: team.id }, data: { name: parsed.name } });
  return NextResponse.json({ ok: true, name: parsed.name });
}
