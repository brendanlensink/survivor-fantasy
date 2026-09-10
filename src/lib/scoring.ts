/**
 * Pure scoring functions — no DB calls in here, so this can be unit tested
 * directly against known historical data (e.g. Survivor 50's finished
 * table) before you ever trust it on a live season.
 */

export interface StatLine {
  contestantId: string;
  episodeNumber: number;
  challengeWins: number; // fractional, e.g. 0.2 for a 5-person tribe win
  votesForBootee: number;
  votesAgainstPlayer: number;
  idolFound: boolean;
  idolPlayed: boolean;
  wentToTribal: boolean;
  wasBooted: boolean;
  wasImmune: boolean;
}

export type ScoringRules = Record<string, number>;

export const DEFAULT_SCORING_RULES: ScoringRules = {
  challengeWinPoint: 5, // multiplied by fractional challengeWins
  survivedEpisode: 1, // didn't get booted this episode
  correctVote: 2, // per vote cast for the person who ended up going home
  votedAgainst: -1, // per vote received against you
  idolFound: 5,
  idolPlayed: 2, // playing it at all, independent of whether it was "needed"
  immunityWin: 3, // individual immunity specifically, on top of challengeWinPoint
  wasBootedPenalty: -3,
};

export function scoreEpisode(
  stat: StatLine,
  rules: ScoringRules = DEFAULT_SCORING_RULES
): number {
  let points = 0;

  points += stat.challengeWins * rules.challengeWinPoint;
  points += stat.votesForBootee * rules.correctVote;
  points += stat.votesAgainstPlayer * rules.votedAgainst;

  if (stat.idolFound) points += rules.idolFound;
  if (stat.idolPlayed) points += rules.idolPlayed;
  if (stat.wasImmune) points += rules.immunityWin;
  if (stat.wasBooted) {
    points += rules.wasBootedPenalty;
  } else if (stat.wentToTribal) {
    points += rules.survivedEpisode;
  }

  return Math.round(points * 100) / 100;
}

export function scoreSeason(
  stats: StatLine[],
  rules: ScoringRules = DEFAULT_SCORING_RULES
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const stat of stats) {
    totals[stat.contestantId] =
      (totals[stat.contestantId] ?? 0) + scoreEpisode(stat, rules);
  }
  return totals;
}

/** Sum a team's contestants' totals for a given scored-totals map. */
export function scoreTeam(
  contestantIds: string[],
  totals: Record<string, number>
): number {
  return contestantIds.reduce((sum, id) => sum + (totals[id] ?? 0), 0);
}
