import EmptyState from "./EmptyState";
import EyeOffIcon from "./EyeOffIcon";

interface Entry {
  teamId: string;
  teamName: string;
  playerName: string;
  points: number;
}

const RANK_ACCENT = ["border-ember", "border-wood-500", "border-blood"];

export default function Leaderboard({
  entries,
  spoilerFree,
}: {
  entries: Entry[];
  spoilerFree: boolean;
}) {
  if (entries.length === 0) {
    return (
      <EmptyState>
        No teams yet — head to{" "}
        <a href="/draft" className="text-ember hover:underline">
          the draft page
        </a>{" "}
        to set up rosters.
      </EmptyState>
    );
  }

  // Standings are derived straight from episode results, so both the point
  // totals and their rank order are spoilers. Alphabetize instead of
  // ranking, and hide the points, while spoiler-free mode is on.
  const displayEntries = spoilerFree
    ? [...entries].sort((a, b) => a.teamName.localeCompare(b.teamName))
    : entries;

  return (
    <ul className="space-y-2">
      {displayEntries.map((entry, i) => (
        <li key={entry.teamId}>
          <a
            href={`/team/${entry.teamId}`}
            className={`flex items-center gap-4 bg-wood-800 border-l-4 ${
              spoilerFree ? "border-wood-600" : RANK_ACCENT[i] ?? "border-wood-600"
            } rounded px-4 py-3 hover:bg-wood-700 transition-colors`}
          >
            <span className="font-display text-2xl text-parchment-dim w-8 text-center shrink-0">
              {spoilerFree ? "–" : i + 1}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-medium truncate">{entry.teamName}</span>
              <span className="block text-sm text-parchment-dim truncate">{entry.playerName}</span>
            </span>
            {!spoilerFree && i === 0 && (
              <span className="shrink-0" aria-hidden="true">
                🏆
              </span>
            )}
            {!spoilerFree && displayEntries.length > 1 && i === displayEntries.length - 1 && (
              <span className="shrink-0" aria-hidden="true">
                🏝️
              </span>
            )}
            <span
              className={`font-display text-xl tabular-nums shrink-0 ${
                !spoilerFree && entry.points < 0 ? "text-blood" : "text-ember"
              }`}
            >
              {spoilerFree ? <EyeOffIcon className="w-5 h-5 inline-block" /> : entry.points.toFixed(1)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
