import { NextResponse } from "next/server";
import { syncEpisodeFromTdt } from "@/lib/episodeSync";
import { isCurrentUserAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// Trigger manually for now (visit /api/scrape or POST to it, e.g. from an
// admin button). Wire up Vercel Cron to hit this weekly once you trust it.
//
// Syncs TDT's latest episode by default. Pass ?episode=N to sync (or
// re-sync) a specific one.
const SEASON_NUMBER = Number(process.env.SEASON_NUMBER ?? 51);

export async function POST(req: Request) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 403 });
  }

  const episodeParam = new URL(req.url).searchParams.get("episode");
  const episodeNumber = episodeParam === null ? undefined : Number(episodeParam);
  if (episodeNumber !== undefined && (!Number.isInteger(episodeNumber) || episodeNumber < 1)) {
    return NextResponse.json({ ok: false, error: "episode must be a positive integer" }, { status: 400 });
  }

  try {
    const result = await syncEpisodeFromTdt(SEASON_NUMBER, episodeNumber);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Scrape failed:", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  // Convenience for manually triggering from a browser during dev.
  return POST(req);
}
