import * as cheerio from "cheerio";

/**
 * Scrapes a True Dork Times season box-score page.
 *
 * During a live season, the in-season page is at:
 *   https://truedorktimes.com/s{N}/boxscores/index.htm
 * The finished/cumulative page (good for testing against past seasons) is:
 *   https://truedorktimes.com/survivor/boxscores/s{N}.htm
 *
 * NOTE: parses the `#boxscore` table specifically (the page also has a
 * second "individual challenges" table). That table's header is two rows
 * (a grouped category row, then real column names) — we use the last
 * <thead> row. Validate `headers` against EXPECTED_HEADER_SAMPLE before
 * trusting the parsed rows — if TDT ever restructures the page, this
 * should fail loudly rather than silently importing garbage.
 */

export interface ScrapedContestantRow {
  name: string;
  profileUrl: string | null;
  raw: Record<string, string>; // column header -> cell text, unparsed
}

export interface ScrapeResult {
  headers: string[];
  rows: ScrapedContestantRow[];
  sourceUrl: string;
  scrapedAt: string;
}

const EXPECTED_HEADER_SAMPLE = ["Contestant", "SurvSc", "ChW", "VFB", "VAP"];

export async function scrapeSeasonTable(url: string): Promise<ScrapeResult> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; survivor-fantasy-app/1.0; personal use)",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  // TDT's main scoring table is `#boxscore`; the page also has a second
  // "individual challenges" table, so we can't just grab the first <table>.
  const table = $("table#boxscore").length ? $("table#boxscore").first() : $("table").first();
  if (table.length === 0) {
    throw new Error(`No <table> found at ${url} — page structure may have changed`);
  }

  // The header lives in <thead>, and is itself two rows: a grouped
  // category row (colspans like "Overall scores"), then the actual
  // per-column headers ("Contestant", "SurvSc", ...). Take the last
  // <thead> row — falls back to the first <tr> if there's no <thead>.
  const headerRow = table.find("thead tr").length
    ? table.find("thead tr").last()
    : table.find("tr").first();

  const headers: string[] = [];
  headerRow.find("th, td").each((_, el) => {
    headers.push($(el).text().trim());
  });

  const missing = EXPECTED_HEADER_SAMPLE.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    throw new Error(
      `Table at ${url} is missing expected headers: ${missing.join(", ")}. ` +
        `Got: ${headers.join(", ")}. Page structure likely changed — check before trusting this data.`
    );
  }

  // Data rows live in <tbody>; fall back to "all <tr> minus the header
  // rows we already consumed" if the page has no explicit <tbody>.
  const dataRows = table.find("tbody tr").length
    ? table.find("tbody tr")
    : table.find("tr").slice(table.find("thead tr").length || 1);

  const rows: ScrapedContestantRow[] = [];
  dataRows.each((_, tr) => {
    const cells = $(tr).find("td");
    if (cells.length === 0) return;

    const raw: Record<string, string> = {};
    let name = "";
    let profileUrl: string | null = null;

    cells.each((i, td) => {
      const header = headers[i] ?? `col_${i}`;
      const text = $(td).text().trim();
      raw[header] = text;

      if (i === 0) {
        name = text;
        const link = $(td).find("a").attr("href") ?? null;
        profileUrl = link;
      }
    });

    if (name) rows.push({ name, profileUrl, raw });
  });

  return {
    headers,
    rows,
    sourceUrl: url,
    scrapedAt: new Date().toISOString(),
  };
}

/** Convenience builders for the two URL shapes described above. */
export function seasonFinalUrl(seasonNumber: number) {
  return `https://truedorktimes.com/survivor/boxscores/s${seasonNumber}.htm`;
}

export function seasonInProgressUrl(seasonNumber: number) {
  return `https://truedorktimes.com/s${seasonNumber}/boxscores/index.htm`;
}
