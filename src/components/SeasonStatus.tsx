import TorchIcon from "./TorchIcon";

function daysUntil(target: Date, now: Date): number {
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export default function SeasonStatus({
  locked,
  lockAt,
  latestEpisodeNumber,
  nextEpisodeAt,
}: {
  locked: boolean;
  lockAt: Date | null;
  latestEpisodeNumber: number | null;
  nextEpisodeAt: Date | null;
}) {
  const now = new Date();

  return (
    <div className="bg-wood-800 rounded p-4">
      <h2 className="text-xs font-medium uppercase tracking-wide text-parchment-dim mb-3 flex items-center gap-2">
        <TorchIcon className="w-3.5 h-3.5 text-ember" />
        Season Status
      </h2>

      <div className="space-y-3 text-sm text-parchment">
        {!locked && lockAt && (
          <p>
            Picks lock in <span className="text-ember font-medium">{daysUntil(lockAt, now)} days</span> —{" "}
            {formatDate(lockAt)}.
          </p>
        )}
        {!locked && !lockAt && <p className="text-parchment-dim">Picks are open with no lock date set yet.</p>}
        {locked && (
          <p>
            Picks are locked
            {lockAt && <> as of {formatDate(lockAt)}</>}.
          </p>
        )}

        {latestEpisodeNumber !== null ? (
          <p>
            Through <span className="text-ember font-medium">Episode {latestEpisodeNumber}</span>
            {nextEpisodeAt && (
              <>
                . Next episode in <span className="text-ember font-medium">{daysUntil(nextEpisodeAt, now)} days</span>{" "}
                — {formatDate(nextEpisodeAt)}.
              </>
            )}
          </p>
        ) : (
          <p className="text-parchment-dim">No episodes tracked yet.</p>
        )}
      </div>
    </div>
  );
}
