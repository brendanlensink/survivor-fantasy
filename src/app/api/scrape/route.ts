import { NextResponse } from "next/server";
import { scrapeSeasonTable, seasonInProgressUrl } from "@/lib/scraper";
import { db } from "@/lib/db";

// Trigger manually for now (visit /api/scrape or POST to it, e.g. from an
// admin button). Wire up Vercel Cron to hit this weekly once you trust it.
//
// SEASON_NUMBER should move to an env var once S51 is actually airing.
const SEASON_NUMBER = 51;

export async function POST() {
  try {
    const url = seasonInProgressUrl(SEASON_NUMBER);
    const result = await scrapeSeasonTable(url);

    // TODO: map result.rows -> Contestant/EpisodeStat upserts.
    // This is intentionally left as a stub: the exact column names to pull
    // from `raw` depend on what TDT's in-season table looks like once S51
    // airs (their finished-season table and in-season table have slightly
    // different columns). Log one row and check `raw` before wiring this up.

    return NextResponse.json({
      ok: true,
      rowCount: result.rows.length,
      headers: result.headers,
      sample: result.rows[0] ?? null,
    });
  } catch (err) {
    console.error("Scrape failed:", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Convenience for manually triggering from a browser during dev.
  return POST();
}
