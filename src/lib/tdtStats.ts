import type { ScrapeResult } from "./scraper";

/**
 * Turns one parsed TDT episode page into EpisodeStat values. Pure, so it
 * can be tested against saved pages without a DB.
 *
 * TDT only covers some of what we score:
 * - challenges and votes come straight from the table
 * - the boot comes from the vote-count notes (see parseBootedNames)
 * - individual immunity is an immunity-challenge ChW of a full 1 (tribal
 *   wins are split between the tribe, so they're always fractional)
 * - idols aren't in the table at all, so they're left for manual entry
 */

export interface ContestantRef {
  id: string;
  name: string;
}

export interface MappedStat {
  contestantId: string;
  tdtName: string;
  challengeWins: number;
  challengeAppearances: number;
  votesForBootee: number;
  votesAgainstPlayer: number;
  wentToTribal: boolean;
  wasBooted: boolean;
  wasImmune: boolean;
  raw: Record<string, string>;
}

export interface MappedEpisode {
  stats: MappedStat[];
  unmatchedNames: string[]; // TDT names that matched zero or several contestants
}

// Per-episode stat columns. A row with none of these filled in is someone
// who wasn't in play this episode (already booted, or on exile).
const STAT_COLUMNS = ["ChW", "ChA", "SO", "VFB", "VAP", "TotV", "TCA"];

export function mapScrapedStats(result: ScrapeResult, contestants: ContestantRef[]): MappedEpisode {
  const unmatchedNames: string[] = [];
  const stats: MappedStat[] = [];

  const keysNamed = (name: string) => result.headers.filter((h) => result.columns[h]?.name === name);
  const sum = (raw: Record<string, string>, name: string) =>
    keysNamed(name).reduce((total, key) => total + parseCell(raw[key]), 0);

  const bootedIds = new Set<string>();
  for (const name of result.bootedNames) {
    const match = matchContestant(name, contestants);
    if (match) bootedIds.add(match.id);
    else unmatchedNames.push(name);
  }

  const immunityWinKeys = keysNamed("ChW").filter((h) => /immunity/i.test(result.columns[h].group));

  for (const row of result.rows) {
    const played = result.headers.some((h) => STAT_COLUMNS.includes(result.columns[h]?.name) && hasValue(row.raw[h]));
    if (!played) continue;

    const contestant = matchContestant(row.name, contestants);
    if (!contestant) {
      unmatchedNames.push(row.name);
      continue;
    }

    stats.push({
      contestantId: contestant.id,
      tdtName: row.name,
      challengeWins: round(sum(row.raw, "ChW")),
      challengeAppearances: round(sum(row.raw, "ChA")),
      votesForBootee: sum(row.raw, "VFB"),
      votesAgainstPlayer: sum(row.raw, "VAP"),
      wentToTribal: sum(row.raw, "TCA") > 0,
      wasBooted: bootedIds.has(contestant.id),
      wasImmune: immunityWinKeys.some((key) => parseCell(row.raw[key]) >= 1),
      raw: row.raw,
    });
  }

  return { stats, unmatchedNames };
}

/**
 * TDT uses short names ("Kilby", "Thien An"), so match on the full name,
 * its leading words, or its last word. Ambiguous matches count as no
 * match, rather than guessing which contestant was meant.
 */
export function matchContestant(tdtName: string, contestants: ContestantRef[]): ContestantRef | null {
  const name = tdtName.replace(/\*+$/, "").trim().toLowerCase();
  if (!name) return null;

  const matches = contestants.filter((c) => {
    const full = c.name.toLowerCase();
    return full === name || full.startsWith(`${name} `) || full.endsWith(` ${name}`);
  });
  return matches.length === 1 ? matches[0] : null;
}

// Cells look like "0.10", "1", "0*" (footnoted), "-" or "NA" (nothing).
function parseCell(text: string | undefined): number {
  const n = parseFloat((text ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function hasValue(text: string | undefined): boolean {
  return /\d/.test(text ?? "");
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
