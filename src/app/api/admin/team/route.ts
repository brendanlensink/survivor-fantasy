import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isCurrentUserAdmin } from "@/lib/admin";
import { PICKS_PER_TRIBE } from "@/lib/draftLock";

// Admin override of any player's team — same roster rule as the normal
// draft (exactly PICKS_PER_TRIBE per tribe), but no ownership check and no
// lock-date restriction, so admins can fix a player's picks after the fact
// (e.g. they emailed in changes instead of using the site).
export async function POST(req: Request) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 403 });
  }

  const body = await req.json();
  const { playerId, contestantIds, winnerPredictionId, idolsPlayedGuess } = body as {
    playerId?: string;
    contestantIds?: string[];
    winnerPredictionId?: string | null;
    idolsPlayedGuess?: number | null;
  };

  if (!playerId) {
    return NextResponse.json({ ok: false, error: "playerId is required" }, { status: 400 });
  }
  const player = await db.player.findUnique({ where: { id: playerId } });
  if (!player) {
    return NextResponse.json({ ok: false, error: "Player not found" }, { status: 404 });
  }
  if (!Array.isArray(contestantIds) || contestantIds.length === 0) {
    return NextResponse.json({ ok: false, error: "contestantIds is required" }, { status: 400 });
  }

  const contestants = await db.contestant.findMany({ where: { id: { in: contestantIds } } });
  if (contestants.length !== contestantIds.length) {
    return NextResponse.json({ ok: false, error: "One or more contestants not found" }, { status: 404 });
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

  const existingTeam = await db.team.findFirst({ where: { playerId } });
  const team = existingTeam
    ? await db.team.update({
        where: { id: existingTeam.id },
        data: { winnerPredictionId: winnerPredictionId ?? null, idolsPlayedGuess: idolsPlayedGuess ?? null },
      })
    : await db.team.create({
        data: {
          name: `${player.name}'s Team`,
          playerId,
          winnerPredictionId: winnerPredictionId ?? null,
          idolsPlayedGuess: idolsPlayedGuess ?? null,
        },
      });

  await db.teamContestant.deleteMany({ where: { teamId: team.id } });
  await db.teamContestant.createMany({
    data: contestantIds.map((contestantId) => ({ teamId: team.id, contestantId })),
  });

  return NextResponse.json({ ok: true, teamId: team.id });
}
