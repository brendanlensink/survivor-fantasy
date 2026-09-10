import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isCurrentUserAdmin } from "@/lib/admin";

interface StatRow {
  contestantId: string;
  challengeWins: number;
  votesForBootee: number;
  votesAgainstPlayer: number;
  idolFound: boolean;
  idolPlayed: boolean;
  wentToTribal: boolean;
  wasBooted: boolean;
  wasImmune: boolean;
}

// Bulk upsert of one episode's stat rows, entered by hand until the
// scraper's write path is wired up (see README Phase 1). Marking a
// contestant `wasBooted` for this episode also flips their season status
// (Contestant.isEliminated / bootedEp) so the rest of the app stays in sync
// without a separate manual step.
export async function POST(req: Request) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 403 });
  }

  const body = await req.json();
  const { episodeNumber, episodeTitle, rows } = body as {
    episodeNumber?: number;
    episodeTitle?: string;
    rows?: StatRow[];
  };

  if (!Number.isInteger(episodeNumber) || (episodeNumber as number) < 1) {
    return NextResponse.json({ ok: false, error: "episodeNumber must be a positive integer" }, { status: 400 });
  }
  if (!Array.isArray(rows)) {
    return NextResponse.json({ ok: false, error: "rows is required" }, { status: 400 });
  }

  const episode = await db.episode.upsert({
    where: { number: episodeNumber },
    update: episodeTitle ? { title: episodeTitle } : {},
    create: { number: episodeNumber as number, title: episodeTitle || null },
  });

  for (const row of rows) {
    await db.episodeStat.upsert({
      where: { contestantId_episodeId: { contestantId: row.contestantId, episodeId: episode.id } },
      update: {
        challengeWins: row.challengeWins,
        votesForBootee: row.votesForBootee,
        votesAgainstPlayer: row.votesAgainstPlayer,
        idolFound: row.idolFound,
        idolPlayed: row.idolPlayed,
        wentToTribal: row.wentToTribal,
        wasBooted: row.wasBooted,
        wasImmune: row.wasImmune,
      },
      create: {
        contestantId: row.contestantId,
        episodeId: episode.id,
        challengeWins: row.challengeWins,
        votesForBootee: row.votesForBootee,
        votesAgainstPlayer: row.votesAgainstPlayer,
        idolFound: row.idolFound,
        idolPlayed: row.idolPlayed,
        wentToTribal: row.wentToTribal,
        wasBooted: row.wasBooted,
        wasImmune: row.wasImmune,
      },
    });

    if (row.wasBooted) {
      await db.contestant.update({
        where: { id: row.contestantId },
        data: { isEliminated: true, bootedEp: episodeNumber },
      });
    }
  }

  return NextResponse.json({ ok: true, episodeId: episode.id });
}
