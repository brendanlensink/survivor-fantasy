/**
 * Manual validation script: hits Survivor 50's real, finished TDT page
 * and prints what the scraper parses out of it. Run this any time
 * scraper.ts changes, or before trusting it against a live S51 page —
 * see README Phase 1.
 *
 * Usage: npm run scrape:check
 */
import { scrapeSeasonTable, seasonFinalUrl } from "../src/lib/scraper";

async function main() {
  const url = seasonFinalUrl(50);
  console.log("Fetching:", url);
  const result = await scrapeSeasonTable(url);
  console.log("Headers:", result.headers);
  console.log("Row count:", result.rows.length);
  console.log("First row:", JSON.stringify(result.rows[0], null, 2));
  console.log("Last row:", JSON.stringify(result.rows[result.rows.length - 1], null, 2));
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
