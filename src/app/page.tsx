import Leaderboard from "@/components/Leaderboard";
import PageHeading from "@/components/PageHeading";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
import { scoreSeason, scoreTeam, type StatLine } from "@/lib/scoring";
import { rankLeaderboard } from "@/lib/leaderboard";
import { getActualSeasonOutcome } from "@/lib/seasonOutcome";
import { isSpoilerFreeMode } from "@/lib/spoilerMode";

// Server component: fetch + score at request time. Fine for a friend-group
// scale app; add caching/ISR later if it matters.
export default async function HomePage() {
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
  }));

  const ranked = rankLeaderboard(leaderboard, actualWinnerId, actualIdolsPlayed);
  const spoilerFree = isSpoilerFreeMode();

  return (
    <div>
      <PageHeading>League Standings</PageHeading>
      <Leaderboard entries={ranked} spoilerFree={spoilerFree} />
    </div>
  );
}
