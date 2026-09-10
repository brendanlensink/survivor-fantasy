/**
 * Leaderboard tiebreak ordering. Pure function — no DB calls — so it's
 * unit-testable the same way scoring.ts is. Takes the actual season
 * outcome (winner + total idols played) as plain values so callers decide
 * how to derive them (Contestant.isWinner, sum of EpisodeStat.idolPlayed).
 */

export interface LeaderboardEntry {
  teamId: string;
  points: number;
  winnerPredictionId: string | null;
  idolsPlayedGuess: number | null;
}

/**
 * Sort order: points descending, then (among ties) whoever correctly
 * predicted the season winner, then (among remaining ties) whoever's
 * idols-played guess is closest to the actual total. Entries that still
 * tie after both tiebreakers keep their relative order (stable sort).
 */
export function rankLeaderboard<T extends LeaderboardEntry>(
  entries: T[],
  actualWinnerId: string | null,
  actualIdolsPlayed: number
): T[] {
  return [...entries].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    const aCorrect = actualWinnerId !== null && a.winnerPredictionId === actualWinnerId;
    const bCorrect = actualWinnerId !== null && b.winnerPredictionId === actualWinnerId;
    if (aCorrect !== bCorrect) return aCorrect ? -1 : 1;

    const aDiff = a.idolsPlayedGuess === null ? Infinity : Math.abs(a.idolsPlayedGuess - actualIdolsPlayed);
    const bDiff = b.idolsPlayedGuess === null ? Infinity : Math.abs(b.idolsPlayedGuess - actualIdolsPlayed);
    if (aDiff !== bDiff) return aDiff - bDiff;

    return 0;
  });
}
