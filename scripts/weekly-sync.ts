/**
 * Standalone weekly sync — run via `npm run sync`, or point a cron job
 * (Vercel Cron, GitHub Actions schedule, whatever) at this instead of the
 * API route if you'd rather keep scraping out of your web process.
 *
 * Usage: tsx scripts/weekly-sync.ts [episodeNumber]
 * With no episode number, syncs the latest episode on TDT.
 */
import { syncEpisodeFromTdt } from "../src/lib/episodeSync";
import { db } from "../src/lib/db";

const SEASON_NUMBER = Number(process.env.SEASON_NUMBER ?? 51);

async function main() {
  const episodeNumber = process.argv[2] ? Number(process.argv[2]) : undefined;
  const result = await syncEpisodeFromTdt(SEASON_NUMBER, episodeNumber);

  console.log(`Synced episode ${result.episodeNumber} from ${result.sourceUrl}`);
  console.log(`Saved ${result.savedCount} stat rows`);
  console.log(`Booted: ${result.booted.join(", ") || "nobody (mark by hand if someone left without a vote)"}`);
  console.log(`Individual immunity: ${result.immune.join(", ") || "nobody"}`);
  console.log("Idols aren't on TDT's box score, so enter those at /admin/episodes.");
}

main()
  .catch((err) => {
    console.error("Sync failed:", err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
