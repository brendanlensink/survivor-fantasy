import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentPlayer } from "@/lib/auth";
import { isDraftLocked, PICKS_PER_TRIBE } from "@/lib/draftLock";

// Self-service draft: the signed-in player picks their own roster, no
// admin/turn order. Rule: exactly PICKS_PER_TRIBE contestants from every
// tribe. Editable (re-submit to replace) until the draft lock date.
// Contestants are NOT exclusive — multiple players can pick the same
// person, and picks stay private from each other until the lock date.
export async function POST(req: Request) {
  const player = await getCurrentPlayer();
  if (!player) {
    return NextResponse.json({ ok: false, error: "Sign in to draft a team" }, { status: 401 });
  }

  if (isDraftLocked()) {
    return NextResponse.json({ ok: false, error: "Draft is locked — picks can no longer be changed" }, { status: 403 });
  }

  const body = await req.json();
  const { contestantIds, winnerPredictionId, idolsPlayedGuess } = body as {
    contestantIds?: string[];
    winnerPredictionId?: string;
    idolsPlayedGuess?: number;
  };
  if (!Array.isArray(contestantIds) || contestantIds.length === 0) {
    return NextResponse.json({ ok: false, error: "contestantIds is required" }, { status: 400 });
  }
  if (!winnerPredictionId) {
    return NextResponse.json({ ok: false, error: "winnerPredictionId is required" }, { status: 400 });
  }
  if (!Number.isInteger(idolsPlayedGuess) || (idolsPlayedGuess as number) < 0) {
    return NextResponse.json({ ok: false, error: "idolsPlayedGuess must be a non-negative integer" }, { status: 400 });
  }

  const contestants = await db.contestant.findMany({
    where: { id: { in: contestantIds } },
  });
  if (contestants.length !== contestantIds.length) {
    return NextResponse.json({ ok: false, error: "One or more contestants not found" }, { status: 404 });
  }

  const winnerPick = await db.contestant.findUnique({ where: { id: winnerPredictionId } });
  if (!winnerPick) {
    return NextResponse.json({ ok: false, error: "winnerPredictionId not found" }, { status: 404 });
  }

  const allTribes = await db.contestant.findMany({ select: { tribe: true }, distinct: ["tribe"] });
  const tribeNames = allTribes.map((t) => t.tribe);

  const countByTribe = new Map<string, number>();
  for (const c of contestants) {
    countByTribe.set(c.tribe, (countByTribe.get(c.tribe) ?? 0) + 1);
  }
  const badTribes = tribeNames.filter((t) => (countByTribe.get(t) ?? 0) !== PICKS_PER_TRIBE);
  if (badTribes.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: `Pick exactly ${PICKS_PER_TRIBE} from every tribe. Off: ${badTribes
          .map((t) => `${t} (${countByTribe.get(t) ?? 0}/${PICKS_PER_TRIBE})`)
          .join(", ")}`,
      },
      { status: 400 }
    );
  }

  const existingTeam = await db.team.findFirst({ where: { playerId: player.id } });
  const team = existingTeam
    ? await db.team.update({
        where: { id: existingTeam.id },
        data: { winnerPredictionId, idolsPlayedGuess },
      })
    : await db.team.create({
        data: { name: `${player.name}'s Team`, playerId: player.id, winnerPredictionId, idolsPlayedGuess },
      });

  // Replace the roster wholesale — simplest correct behavior for re-picking.
  await db.teamContestant.deleteMany({ where: { teamId: team.id } });
  await db.teamContestant.createMany({
    data: contestantIds.map((contestantId) => ({ teamId: team.id, contestantId })),
  });

  return NextResponse.json({ ok: true, teamId: team.id });
}
