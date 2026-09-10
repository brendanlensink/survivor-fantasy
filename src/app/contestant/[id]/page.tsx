import { db } from "@/lib/db";
import { scoreEpisode, type StatLine } from "@/lib/scoring";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { tribeColor } from "@/lib/tribeColors";
import EmptyState from "@/components/EmptyState";
import { isSpoilerFreeMode } from "@/lib/spoilerMode";

export default async function ContestantPage({ params }: { params: { id: string } }) {
  const spoilerFree = isSpoilerFreeMode();
  const id = decodeURIComponent(params.id);
  const contestant = await db.contestant.findUnique({ where: { id } });
  if (!contestant) notFound();

  const stats = await db.episodeStat.findMany({
    where: { contestantId: id },
    include: { episode: true },
    orderBy: { episode: { number: "asc" } },
  });

  const rows = stats.map((s) => {
    const line: StatLine = {
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
    };
    return { episodeNumber: s.episode.number, stat: s, points: scoreEpisode(line) };
  });
  const total = rows.reduce((sum, r) => sum + r.points, 0);

  const status = contestant.isWinner
    ? "Sole Survivor"
    : contestant.isEliminated
      ? `Voted out — Episode ${contestant.bootedEp ?? "?"}`
      : "Still in the game";
  const statusColor = contestant.isWinner ? "text-ember" : contestant.isEliminated ? "text-blood" : "text-parchment-muted";

  const color = tribeColor(contestant.tribe);

  return (
    <div>
      <div className="mb-6">
        <h1
          className={`font-display text-3xl uppercase tracking-wide ${
            !spoilerFree && contestant.isEliminated ? "text-parchment-dim line-through" : "text-parchment"
          }`}
        >
          {contestant.name}
        </h1>
        <div className="w-16 h-1 bg-ember mt-2 mb-3" />
        <p className="text-sm flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {contestant.tribe}
          </span>
          {!spoilerFree && <span className={statusColor}>{status}</span>}
        </p>
      </div>

      {spoilerFree ? (
        <EmptyState compact>Episode stats are hidden in spoiler-free mode.</EmptyState>
      ) : (
      <div className="overflow-x-auto bg-wood-800 rounded p-4">
        <table className="text-left border-collapse text-sm w-full">
          <thead>
            <tr className="border-b border-wood-600 text-parchment-dim text-xs">
              <th className="py-2 pr-3">Ep</th>
              <th className="py-2 px-2 text-right">
                <abbr title="Challenge Wins — fractional, e.g. 0.2 for a 5-person tribe win" className="cursor-help decoration-dotted">
                  ChW
                </abbr>
              </th>
              <th className="py-2 px-2 text-right">
                <abbr title="Votes For Bootee — votes you cast for whoever got voted out" className="cursor-help decoration-dotted">
                  VFB
                </abbr>
              </th>
              <th className="py-2 px-2 text-right">
                <abbr title="Votes Against Player — votes cast against you" className="cursor-help decoration-dotted">
                  VAP
                </abbr>
              </th>
              <th className="py-2 px-2 text-center">Idol found</th>
              <th className="py-2 px-2 text-center">Idol played</th>
              <th className="py-2 px-2 text-center">Tribal</th>
              <th className="py-2 px-2 text-center">Booted</th>
              <th className="py-2 px-2 text-center">Immune</th>
              <th className="py-2 pl-3 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.episodeNumber} className="border-b border-wood-700">
                <td className="py-1.5 pr-3 font-medium text-parchment">{r.episodeNumber}</td>
                <td className="py-1.5 px-2 text-right font-mono text-parchment-muted">{r.stat.challengeWins}</td>
                <td className="py-1.5 px-2 text-right font-mono text-parchment-muted">{r.stat.votesForBootee}</td>
                <td className="py-1.5 px-2 text-right font-mono text-parchment-muted">{r.stat.votesAgainstPlayer}</td>
                <td className="py-1.5 px-2 text-center text-ember">{r.stat.idolFound ? "✓" : ""}</td>
                <td className="py-1.5 px-2 text-center text-ember">{r.stat.idolPlayed ? "✓" : ""}</td>
                <td className="py-1.5 px-2 text-center text-parchment-muted">{r.stat.wentToTribal ? "✓" : ""}</td>
                <td className="py-1.5 px-2 text-center text-blood">{r.stat.wasBooted ? "✓" : ""}</td>
                <td className="py-1.5 px-2 text-center text-ember">{r.stat.wasImmune ? "✓" : ""}</td>
                <td className="py-1.5 pl-3 text-right font-mono text-ember">{r.points.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={9} className="py-2 pr-3 text-right text-parchment-dim">
                  Total
                </td>
                <td className="py-2 pl-3 text-right font-mono font-medium text-ember">{total.toFixed(1)}</td>
              </tr>
            </tfoot>
          )}
        </table>
        {rows.length === 0 && <EmptyState compact>No episode stats yet.</EmptyState>}
        {rows.length > 0 && (
          <p className="text-parchment-dim text-xs mt-2">
            ChW = Challenge Wins · VFB = Votes For Bootee · VAP = Votes Against Player
          </p>
        )}
      </div>
      )}
    </div>
  );
}
