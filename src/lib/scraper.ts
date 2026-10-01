import * as cheerio from "cheerio";

/**
 * Scrapes a True Dork Times season box-score page.
 *
 * During a live season, the in-season page is at:
 *   https://truedorktimes.com/s{N}/boxscores/index.htm
 * The finished/cumulative page (good for testing against past seasons) is:
 *   https://truedorktimes.com/survivor/boxscores/s{N}.htm
 *
 * Each episode also has its own page at s{N}/boxscores/e{ep}.htm, and the
 * in-season index.htm is just a copy of the latest one. Those pages are
 * per-episode numbers, not season totals (except SurvSc/SurvAv).
 *
 * NOTE: parses the `#boxscore` table(s) specifically (the page also has a
 * second "individual challenges" table). Post-merge episodes split it into
 * several tables that all reuse id="boxscore" (an immunity challenge table,
 * then a tribal council table), so their columns are combined and rows are
 * joined on contestant name. Each table's header is two rows (a grouped
 * category row, then real column names). Pages can repeat column names
 * across groups (ChW/ChA under both "Reward challenge" and "Immunity
 * challenge"), so repeated names are keyed as "<group> <name>", e.g.
 * "Reward challenge ChW". Unique names stay bare. Column names are checked
 * against EXPECTED_HEADER_SAMPLE before trusting the parsed rows — if TDT
 * ever restructures the page, this should fail loudly rather than silently
 * importing garbage.
 */

export interface ScrapedContestantRow {
  name: string;
  profileUrl: string | null;
  raw: Record<string, string>; // column key (see ScrapeResult.headers) -> cell text, unparsed
}

export interface ScrapeResult {
  headers: string[]; // column keys, group-prefixed where a column name repeats
  columns: Record<string, { name: string; group: string }>; // column key -> its bare name and header group
  rows: ScrapedContestantRow[];
  episodeNumber: number | null; // from the page title; null on the season totals page
  bootedNames: string[]; // names from the "(voted out, ...)" vote-count lines, as TDT writes them
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

  return parseSeasonTable(await res.text(), url);
}

/** Parses box-score page HTML. Split out from the fetch so it can be tested. */
export function parseSeasonTable(html: string, url: string): ScrapeResult {
  const $ = cheerio.load(html);

  // TDT's scoring tables are `#boxscore`; the page also has a second
  // "individual challenges" table, so we can't just grab every <table>.
  const tables = $("table#boxscore").length ? $("table#boxscore") : $("table").first();
  if (tables.length === 0) {
    throw new Error(`No <table> found at ${url} — page structure may have changed`);
  }

  // Column names and groups across every table, minus each table's
  // leading "Contestant" column after the first.
  const names: string[] = [];
  const groups: string[] = [];
  const parsed: { table: cheerio.Cheerio<any>; offset: number }[] = [];

  tables.each((t, tableEl) => {
    const table = $(tableEl);

    // The header lives in <thead>, and is itself two rows: a grouped
    // category row (colspans like "Overall scores"), then the actual
    // per-column names ("Contestant", "SurvSc", ...). Names come from the
    // last row; the group row (if any) is only used to disambiguate.
    const headerRows = table.find("thead tr").length ? table.find("thead tr") : table.find("tr").first();

    const tableNames: string[] = [];
    headerRows
      .last()
      .find("th, td")
      .each((_, el) => {
        tableNames.push($(el).text().trim());
      });

    // Expand the group row's colspans so each column knows its group.
    const tableGroups: string[] = [];
    if (headerRows.length > 1) {
      headerRows
        .first()
        .find("th, td")
        .each((_, el) => {
          const span = Number($(el).attr("colspan") ?? 1) || 1;
          const label = $(el).text().trim();
          for (let i = 0; i < span; i++) tableGroups.push(label);
        });
    }

    const skip = t === 0 ? 0 : 1;
    parsed.push({ table, offset: names.length - skip });
    names.push(...tableNames.slice(skip));
    groups.push(...tableNames.slice(skip).map((_, i) => tableGroups[i + skip] ?? ""));
  });

  const missing = EXPECTED_HEADER_SAMPLE.filter((h) => !names.includes(h));
  if (missing.length > 0) {
    throw new Error(
      `Table at ${url} is missing expected headers: ${missing.join(", ")}. ` +
        `Got: ${names.join(", ")}. Page structure likely changed — check before trusting this data.`
    );
  }

  const headers = disambiguateHeaders(names, groups, url);
  const columns: ScrapeResult["columns"] = {};
  headers.forEach((h, i) => (columns[h] = { name: names[i], group: groups[i] }));

  // Rows are joined on name, in first-seen order. Later tables can list
  // contestants the first one doesn't (e.g. booted players only appear in
  // the tribal council table post-merge).
  const byName = new Map<string, ScrapedContestantRow>();

  for (const { table, offset } of parsed) {
    // Data rows live in <tbody>; fall back to "all <tr> minus the header
    // rows we already consumed" if the page has no explicit <tbody>.
    const dataRows = table.find("tbody tr").length
      ? table.find("tbody tr")
      : table.find("tr").slice(table.find("thead tr").length || 1);

    dataRows.each((_, tr) => {
      const cells = $(tr).find("td");
      if (cells.length === 0) return;

      const first = cells.first();
      const name = first.text().trim();
      if (!name) return;

      let row = byName.get(name);
      if (!row) {
        row = { name, profileUrl: first.find("a").attr("href") ?? null, raw: {} };
        byName.set(name, row);
      }

      cells.each((i, td) => {
        const header = i === 0 ? headers[0] : (headers[offset + i] ?? `col_${offset + i}`);
        row!.raw[header] = $(td).text().trim();
      });
    });
  }

  return {
    headers,
    columns,
    rows: Array.from(byName.values()),
    episodeNumber: parseEpisodeNumber($("title").text()),
    bootedNames: parseBootedNames($("body").text()),
    sourceUrl: url,
    scrapedAt: new Date().toISOString(),
  };
}

function parseEpisodeNumber(title: string): number | null {
  const match = title.match(/Episode (\d+)/i);
  return match ? Number(match[1]) : null;
}

/**
 * The boot isn't in the table, only in TDT's vote-count notes, e.g.
 * "Aaliyah received 6 votes, from Brady, ... (voted out, 6-2)." A double
 * episode has one of these per Tribal. Boots without a vote (fire-making,
 * medevacs, quits) won't show up here and still need marking by hand.
 */
function parseBootedNames(text: string): string[] {
  const flat = text.replace(/\s+/g, " ");
  // The voter list stops at a period so it can't run on into the next
  // contestant's sentence ("Stephenie received 1 vote, from Angelina.").
  const pattern = /([A-Z][\w'-]*(?: [A-Z][\w'-]*)*) received \d+ votes?, from [^().]*\(voted out/g;
  const names = new Set<string>();
  for (const match of Array.from(flat.matchAll(pattern))) names.add(match[1]);
  return Array.from(names);
}

/**
 * Column names that appear once are kept as-is. Repeated ones get their
 * group prefixed ("Reward challenge ChW") so no column overwrites another
 * in `raw`. Throws if that still leaves duplicates.
 */
function disambiguateHeaders(names: string[], groups: string[], url: string): string[] {
  const counts = new Map<string, number>();
  for (const n of names) counts.set(n, (counts.get(n) ?? 0) + 1);

  const headers = names.map((n, i) => ((counts.get(n) ?? 0) > 1 && groups[i] ? `${groups[i]} ${n}` : n));

  const dupes = headers.filter((h, i) => headers.indexOf(h) !== i);
  if (dupes.length > 0) {
    throw new Error(
      `Table at ${url} has repeated columns that can't be told apart: ${Array.from(new Set(dupes)).join(", ")}. ` +
        `Page structure likely changed — check before trusting this data.`
    );
  }
  return headers;
}

/** Convenience builders for the URL shapes described above. */
export function seasonFinalUrl(seasonNumber: number) {
  return `https://truedorktimes.com/survivor/boxscores/s${seasonNumber}.htm`;
}

export function seasonInProgressUrl(seasonNumber: number) {
  return `https://truedorktimes.com/s${seasonNumber}/boxscores/index.htm`;
}

export function seasonEpisodeUrl(seasonNumber: number, episodeNumber: number) {
  return `https://truedorktimes.com/s${seasonNumber}/boxscores/e${episodeNumber}.htm`;
}
