import { db } from "./db";
import { scrapeSeasonTable, seasonEpisodeUrl, seasonInProgressUrl } from "./scraper";
import { mapScrapedStats } from "./tdtStats";

export interface EpisodeSyncResult {
  episodeNumber: number;
  sourceUrl: string;
  savedCount: number;
  booted: string[]; // contestant names
  immune: string[];
}

/**
 * Scrapes one episode's TDT box score and upserts its EpisodeStat rows.
 * With no episodeNumber, syncs whichever episode TDT's index page is
 * currently showing (the latest one).
 *
 * Numbers from the table are overwritten on every run, so re-syncing picks
 * up TDT's corrections. The boot and immunity flags are only ever set, never
 * cleared, and idols aren't touched, so manual fixes from /admin/episodes
 * survive a re-sync.
 */
export async function syncEpisodeFromTdt(seasonNumber: number, episodeNumber?: number): Promise<EpisodeSyncResult> {
  const url = episodeNumber ? seasonEpisodeUrl(seasonNumber, episodeNumber) : seasonInProgressUrl(seasonNumber);
  const result = await scrapeSeasonTable(url);

  if (result.episodeNumber === null) {
    throw new Error(`Couldn't find an episode number in the page title at ${url}`);
  }
  if (episodeNumber && result.episodeNumber !== episodeNumber) {
    throw new Error(`Asked for episode ${episodeNumber} but ${url} is episode ${result.episodeNumber}`);
  }
  const number = result.episodeNumber;

  const contestants = await db.contestant.findMany({ select: { id: true, name: true } });
  const { stats, unmatchedNames } = mapScrapedStats(result, contestants);

  // Saving everyone else would quietly score these contestants as zero, so
  // bail before writing anything.
  if (unmatchedNames.length > 0) {
    throw new Error(
      `Couldn't match these TDT names to exactly one contestant: ${unmatchedNames.join(", ")}. Nothing was saved.`
    );
  }

  const episode = await db.episode.upsert({
    where: { number },
    update: {},
    create: { number, title: `Episode ${number}` },
  });

  await db.$transaction([
    ...stats.map((stat) => {
      const numbers = {
        challengeWins: stat.challengeWins,
        challengeAppearances: stat.challengeAppearances,
        votesForBootee: stat.votesForBootee,
        votesAgainstPlayer: stat.votesAgainstPlayer,
        wentToTribal: stat.wentToTribal,
        rawSource: JSON.stringify({ sourceUrl: result.sourceUrl, scrapedAt: result.scrapedAt, raw: stat.raw }),
      };
      return db.episodeStat.upsert({
        where: { contestantId_episodeId: { contestantId: stat.contestantId, episodeId: episode.id } },
        update: {
          ...numbers,
          ...(stat.wasBooted ? { wasBooted: true } : {}),
          ...(stat.wasImmune ? { wasImmune: true } : {}),
        },
        create: {
          contestantId: stat.contestantId,
          episodeId: episode.id,
          ...numbers,
          wasBooted: stat.wasBooted,
          wasImmune: stat.wasImmune,
        },
      });
    }),
    ...stats
      .filter((stat) => stat.wasBooted)
      .map((stat) =>
        db.contestant.update({
          where: { id: stat.contestantId },
          data: { isEliminated: true, bootedEp: number },
        })
      ),
  ]);

  const nameOf = (id: string) => contestants.find((c) => c.id === id)?.name ?? id;
  return {
    episodeNumber: number,
    sourceUrl: result.sourceUrl,
    savedCount: stats.length,
    booted: stats.filter((s) => s.wasBooted).map((s) => nameOf(s.contestantId)),
    immune: stats.filter((s) => s.wasImmune).map((s) => nameOf(s.contestantId)),
  };
}
