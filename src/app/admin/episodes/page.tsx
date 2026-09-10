import { db } from "@/lib/db";
import EpisodeStatForm from "@/components/admin/EpisodeStatForm";

export default async function AdminEpisodesPage({
  searchParams,
}: {
  searchParams: { ep?: string };
}) {
  const [contestants, episodes] = await Promise.all([
    db.contestant.findMany({ orderBy: [{ tribe: "asc" }, { name: "asc" }] }),
    db.episode.findMany({ orderBy: { number: "asc" } }),
  ]);

  const maxEpisodeNumber = episodes.reduce((max, e) => Math.max(max, e.number), 0);
  const selectedEpisodeNumber = searchParams.ep ? Number(searchParams.ep) : maxEpisodeNumber + 1 || 1;

  const selectedEpisode = episodes.find((e) => e.number === selectedEpisodeNumber);
  const existingStats = selectedEpisode
    ? await db.episodeStat.findMany({ where: { episodeId: selectedEpisode.id } })
    : [];
  const statsByContestant = new Map(existingStats.map((s) => [s.contestantId, s]));

  return (
    <div>
      <h2 className="font-display text-xl uppercase tracking-wide text-parchment mb-3">Episode stats</h2>

      <div className="flex gap-2 mb-4 text-sm flex-wrap">
        {episodes.map((e) => (
          <a
            key={e.id}
            href={`/admin/episodes?ep=${e.number}`}
            className={`px-2 py-1 rounded border ${
              e.number === selectedEpisodeNumber
                ? "border-ember text-ember"
                : "border-wood-600 text-parchment-dim hover:border-wood-500"
            }`}
          >
            Ep {e.number}
          </a>
        ))}
        <a
          href={`/admin/episodes?ep=${maxEpisodeNumber + 1}`}
          className={`px-2 py-1 rounded border border-dashed ${
            selectedEpisodeNumber === maxEpisodeNumber + 1
              ? "border-ember text-ember"
              : "border-wood-600 text-parchment-dim hover:border-wood-500"
          }`}
        >
          + New (Ep {maxEpisodeNumber + 1})
        </a>
      </div>

      <EpisodeStatForm
        key={selectedEpisodeNumber}
        episodeNumber={selectedEpisodeNumber}
        contestants={contestants.map((c) => ({
          id: c.id,
          name: c.name,
          tribe: c.tribe,
          isEliminated: c.isEliminated,
        }))}
        initialStats={contestants.map((c) => {
          const s = statsByContestant.get(c.id);
          return {
            contestantId: c.id,
            challengeWins: s?.challengeWins ?? 0,
            votesForBootee: s?.votesForBootee ?? 0,
            votesAgainstPlayer: s?.votesAgainstPlayer ?? 0,
            idolFound: s?.idolFound ?? false,
            idolPlayed: s?.idolPlayed ?? false,
            wentToTribal: s?.wentToTribal ?? false,
            wasBooted: s?.wasBooted ?? false,
            wasImmune: s?.wasImmune ?? false,
          };
        })}
      />
    </div>
  );
}
