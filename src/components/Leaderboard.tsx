import TorchIcon from "./TorchIcon";
import EmptyState from "./EmptyState";

interface Entry {
  teamId: string;
  teamName: string;
  playerName: string;
  points: number;
}

const RANK_ACCENT = ["border-ember", "border-wood-500", "border-blood"];

export default function Leaderboard({ entries }: { entries: Entry[] }) {
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

  return (
    <ul className="space-y-2">
      {entries.map((entry, i) => (
        <li key={entry.teamId}>
          <a
            href={`/team/${entry.teamId}`}
            className={`flex items-center gap-4 bg-wood-800 border-l-4 ${
              RANK_ACCENT[i] ?? "border-wood-600"
            } rounded px-4 py-3 hover:bg-wood-700 transition-colors`}
          >
            <span className="font-display text-2xl text-parchment-dim w-8 text-center shrink-0">{i + 1}</span>
            <span className="flex-1 min-w-0">
              <span className="block font-medium truncate">{entry.teamName}</span>
              <span className="block text-sm text-parchment-dim truncate">{entry.playerName}</span>
            </span>
            {i === 0 && <TorchIcon className="w-4 h-4 text-ember shrink-0" />}
            <span className="font-display text-xl text-ember tabular-nums shrink-0">
              {entry.points.toFixed(1)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
