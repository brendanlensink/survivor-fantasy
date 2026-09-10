import { db } from "./db";

/** The real-world answers to the two tiebreaker questions, for scoring them against picks. */
export async function getActualSeasonOutcome() {
  const [winner, idolsPlayedCount] = await Promise.all([
    db.contestant.findFirst({ where: { isWinner: true } }),
    db.episodeStat.count({ where: { idolPlayed: true } }),
  ]);

  return {
    actualWinnerId: winner?.id ?? null,
    actualIdolsPlayed: idolsPlayedCount,
  };
}
