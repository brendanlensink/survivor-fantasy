/**
 * Standalone weekly sync — run via `npm run sync`, or point a cron job
 * (Vercel Cron, GitHub Actions schedule, whatever) at this instead of the
 * API route if you'd rather keep scraping out of your web process.
 *
 * Usage: tsx scripts/weekly-sync.ts
 */
import { scrapeSeasonTable, seasonInProgressUrl } from "../src/lib/scraper";
import { db } from "../src/lib/db";

const SEASON_NUMBER = Number(process.env.SEASON_NUMBER ?? 51);

async function main() {
  const url = seasonInProgressUrl(SEASON_NUMBER);
  console.log(`Scraping ${url} ...`);

  const result = await scrapeSeasonTable(url);
  console.log(`Parsed ${result.rows.length} rows, headers:`, result.headers);

  // TODO: once you've confirmed the shape of `result.rows[i].raw` for a
  // real in-season page, map it into Contestant/Episode/EpisodeStat
  // upserts here. Left unimplemented deliberately — see api/scrape/route.ts
  // for the same TODO.

  console.log("Sync complete (data mapping not yet implemented).");
}

main()
  .catch((err) => {
    console.error("Sync failed:", err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
