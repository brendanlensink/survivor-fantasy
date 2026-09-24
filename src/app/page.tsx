import Leaderboard from "@/components/Leaderboard";
import PageHeading from "@/components/PageHeading";
import SeasonStatus from "@/components/SeasonStatus";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
import { scoreSeason, scoreTeam, type StatLine } from "@/lib/scoring";
import { rankLeaderboard } from "@/lib/leaderboard";
import { getActualSeasonOutcome } from "@/lib/seasonOutcome";
import { isSpoilerFreeMode } from "@/lib/spoilerMode";
import { draftLockAt, isDraftLocked } from "@/lib/draftLock";

// Server component: fetch + score at request time. Fine for a friend-group
// scale app; add caching/ISR later if it matters.
export default async function HomePage() {
  const [stats, teams, { actualWinnerId, actualIdolsPlayed }, airedEpisodes] = await Promise.all([
    db.episodeStat.findMany({ include: { episode: true } }),
    db.team.findMany({
      include: { player: true, contestants: { include: { contestant: true } } },
    }),
    getActualSeasonOutcome(),
    // Episodes that have at least one stat row recorded, i.e. have actually
    // aired and been scored — newest first.
    db.episode.findMany({
      where: { stats: { some: {} } },
      orderBy: { number: "desc" },
      take: 1,
    }),
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

  const latestEpisode = airedEpisodes[0] ?? null;
  const nextEpisodeAt =
    latestEpisode?.airDate != null ? new Date(latestEpisode.airDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null;

  return (
    <div>
      <PageHeading>League Standings</PageHeading>
      <div className="grid md:grid-cols-[1fr_280px] gap-6 items-start">
        <Leaderboard entries={ranked} spoilerFree={spoilerFree} />
        <SeasonStatus
          locked={isDraftLocked()}
          lockAt={draftLockAt()}
          latestEpisodeNumber={latestEpisode?.number ?? null}
          nextEpisodeAt={nextEpisodeAt}
        />
      </div>
    </div>
  );
}
