import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scoreSeason, scoreTeam, type StatLine } from "@/lib/scoring";
import { rankLeaderboard } from "@/lib/leaderboard";
import { getActualSeasonOutcome } from "@/lib/seasonOutcome";

export async function GET() {
  const [stats, teams, { actualWinnerId, actualIdolsPlayed }] = await Promise.all([
    db.episodeStat.findMany({ include: { episode: true } }),
    db.team.findMany({
      include: { player: true, contestants: { include: { contestant: true } } },
    }),
    getActualSeasonOutcome(),
  ]);

  const statLines: StatLine[] = stats.map((s) => ({
    contestantId: s.contestantId,
    episodeNumber: s.episode.number,
    challengeWins: s.challengeWins,
    votesForBootee: s.votesForBootee,
    votesAgainstPlayer: s.votesAgainstPlayer,
    idolFound: s.idolFound,
    idolPlayed: s.idolPlayed,
    wentToTribal: s.wentToTribal,
    wasBooted: s.wasBooted,
    wasImmune: s.wasImmune,
  }));

  const contestantTotals = scoreSeason(statLines);

  const leaderboard = teams.map((team) => ({
    teamId: team.id,
    teamName: team.name,
    playerName: team.player.name,
    points: scoreTeam(
      team.contestants.map((tc) => tc.contestantId),
      contestantTotals
    ),
    winnerPredictionId: team.winnerPredictionId,
    idolsPlayedGuess: team.idolsPlayedGuess,
    roster: team.contestants.map((tc) => ({
      name: tc.contestant.name,
      isEliminated: tc.contestant.isEliminated,
      points: contestantTotals[tc.contestantId] ?? 0,
    })),
  }));

  const ranked = rankLeaderboard(leaderboard, actualWinnerId, actualIdolsPlayed);

  return NextResponse.json({ leaderboard: ranked });
}
