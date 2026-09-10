import { db } from "@/lib/db";
import { scoreEpisode, scoreSeason, type StatLine } from "@/lib/scoring";
import { isDraftLocked } from "@/lib/draftLock";

export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import PageHeading from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";

export default async function TeamPage({ params }: { params: { id: string } }) {
  const team = await db.team.findUnique({
    where: { id: params.id },
    include: { player: true, contestants: { include: { contestant: true } }, winnerPrediction: true },
  });

  if (!team) notFound();

  // Tiebreaker answers stay private, same as roster picks, until the draft locks.
  const locked = isDraftLocked();

  const stats = await db.episodeStat.findMany({ include: { episode: true } });
  const statLines: StatLine[] = stats.map((s) => ({
    contestantId: s.contestantId,
    episodeNumber: s.episode.number,
    challengeWins: s.challengeWins,
    votesForBootee: s.votesForBootee,
    votesAgainstPlayer: s.votesAgainstPlayer,
    idolFound: s.idolFound,
    idolPlayed: s.idolPlayed,
    wentToTribal: s.wentToTribal,
    wasBooted: s.wasBooted,
    wasImmune: s.wasImmune,
  }));
  const totals = scoreSeason(statLines);

  // Per-episode points, for the weekly breakdown table below.
  const episodeNumbers = Array.from(new Set(statLines.map((s) => s.episodeNumber))).sort((a, b) => a - b);
  const pointsByContestantEpisode = new Map<string, Map<number, number>>();
  for (const line of statLines) {
    const byEpisode = pointsByContestantEpisode.get(line.contestantId) ?? new Map<number, number>();
    byEpisode.set(line.episodeNumber, scoreEpisode(line));
    pointsByContestantEpisode.set(line.contestantId, byEpisode);
  }

  return (
    <div>
      <PageHeading subtitle={<>Drafted by {team.player.name}</>}>{team.name}</PageHeading>

      <div className="overflow-x-auto bg-wood-800 rounded p-4">
        <table className="text-left border-collapse text-sm w-full">
          <thead>
            <tr className="border-b border-wood-600 text-parchment-dim">
              <th className="py-2 pr-4">Contestant</th>
              {episodeNumbers.map((n) => (
                <th key={n} className="py-2 px-3 text-right font-normal">
                  Ep {n}
                </th>
              ))}
              <th className="py-2 pl-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {team.contestants.map((tc) => {
              const byEpisode = pointsByContestantEpisode.get(tc.contestantId);
              return (
                <tr key={tc.id} className="border-b border-wood-700">
                  <td className={`py-2 pr-4 ${tc.contestant.isEliminated ? "text-parchment-dim line-through" : ""}`}>
                    <a href={`/contestant/${tc.contestantId}`} className="hover:text-ember transition-colors">
                      {tc.contestant.name}
                    </a>
                  </td>
                  {episodeNumbers.map((n) => {
                    const pts = byEpisode?.get(n);
                    return (
                      <td key={n} className="py-2 px-3 text-right font-mono text-parchment-muted">
                        {pts !== undefined ? pts.toFixed(1) : "–"}
                      </td>
                    );
                  })}
                  <td className="py-2 pl-3 text-right font-mono font-medium text-ember">
                    {(totals[tc.contestantId] ?? 0).toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {episodeNumbers.length === 0 && <EmptyState compact>No episode stats yet.</EmptyState>}
      </div>

      <div className="mt-6 bg-wood-800 rounded p-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-parchment-dim mb-2">Tiebreakers</h2>
        {locked ? (
          <ul className="space-y-1 text-sm">
            <li>
              Winner pick: <span className="text-parchment">{team.winnerPrediction?.name ?? "—"}</span>
            </li>
            <li>
              Idols played guess: <span className="text-parchment">{team.idolsPlayedGuess ?? "—"}</span>
            </li>
          </ul>
        ) : (
          <p className="text-parchment-dim text-sm">Hidden until the draft locks.</p>
        )}
      </div>
    </div>
  );
}
