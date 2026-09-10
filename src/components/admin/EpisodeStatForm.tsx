"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Contestant {
  id: string;
  name: string;
  tribe: string;
  isEliminated: boolean;
}

interface StatRow {
  contestantId: string;
  challengeWins: number;
  votesForBootee: number;
  votesAgainstPlayer: number;
  idolFound: boolean;
  idolPlayed: boolean;
  wentToTribal: boolean;
  wasBooted: boolean;
  wasImmune: boolean;
}

export default function EpisodeStatForm({
  episodeNumber,
  contestants,
  initialStats,
}: {
  episodeNumber: number;
  contestants: Contestant[];
  initialStats: StatRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<StatRow[]>(initialStats);
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "error" | "ok"; message?: string }>({
    kind: "idle",
  });

  function update<K extends keyof StatRow>(contestantId: string, key: K, value: StatRow[K]) {
    setRows((prev) => prev.map((r) => (r.contestantId === contestantId ? { ...r, [key]: value } : r)));
  }

  async function save() {
    setStatus({ kind: "saving" });
    const res = await fetch("/api/admin/episode-stat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episodeNumber, rows }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setStatus({ kind: "error", message: data.error ?? "Save failed" });
      return;
    }
    setStatus({ kind: "ok" });
    router.refresh();
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse">
          <thead>
            <tr className="border-b border-wood-600 text-parchment-dim text-xs">
              <th className="py-2 pr-3 text-left">Contestant</th>
              <th className="py-2 px-2">ChW</th>
              <th className="py-2 px-2">VFB</th>
              <th className="py-2 px-2">VAP</th>
              <th className="py-2 px-2">Idol found</th>
              <th className="py-2 px-2">Idol played</th>
              <th className="py-2 px-2">Tribal</th>
              <th className="py-2 px-2">Booted</th>
              <th className="py-2 px-2">Immune</th>
            </tr>
          </thead>
          <tbody>
            {contestants.map((c) => {
              const row = rows.find((r) => r.contestantId === c.id);
              if (!row) return null;
              return (
                <tr key={c.id} className="border-b border-wood-700">
                  <td className={`py-1.5 pr-3 ${c.isEliminated ? "text-parchment-dim line-through" : "text-parchment"}`}>
                    {c.name} <span className="text-parchment-dim text-xs">({c.tribe})</span>
                  </td>
                  <td className="py-1.5 px-2">
                    <input
                      type="number"
                      step="0.01"
                      className="w-16 bg-wood-800 border border-wood-600 rounded px-1 py-0.5 text-parchment"
                      value={row.challengeWins}
                      onChange={(e) => update(c.id, "challengeWins", Number(e.target.value))}
                    />
                  </td>
                  <td className="py-1.5 px-2">
                    <input
                      type="number"
                      className="w-14 bg-wood-800 border border-wood-600 rounded px-1 py-0.5 text-parchment"
                      value={row.votesForBootee}
                      onChange={(e) => update(c.id, "votesForBootee", Number(e.target.value))}
                    />
                  </td>
                  <td className="py-1.5 px-2">
                    <input
                      type="number"
                      className="w-14 bg-wood-800 border border-wood-600 rounded px-1 py-0.5 text-parchment"
                      value={row.votesAgainstPlayer}
                      onChange={(e) => update(c.id, "votesAgainstPlayer", Number(e.target.value))}
                    />
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <input
                      type="checkbox"
                      className="accent-ember"
                      checked={row.idolFound}
                      onChange={(e) => update(c.id, "idolFound", e.target.checked)}
                    />
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <input
                      type="checkbox"
                      className="accent-ember"
                      checked={row.idolPlayed}
                      onChange={(e) => update(c.id, "idolPlayed", e.target.checked)}
                    />
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <input
                      type="checkbox"
                      className="accent-ember"
                      checked={row.wentToTribal}
                      onChange={(e) => update(c.id, "wentToTribal", e.target.checked)}
                    />
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <input
                      type="checkbox"
                      className="accent-blood"
                      checked={row.wasBooted}
                      onChange={(e) => update(c.id, "wasBooted", e.target.checked)}
                    />
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <input
                      type="checkbox"
                      className="accent-ember"
                      checked={row.wasImmune}
                      onChange={(e) => update(c.id, "wasImmune", e.target.checked)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-parchment-dim text-xs mt-2">
        Checking &quot;Booted&quot; also marks the contestant eliminated (episode {episodeNumber}) everywhere else in
        the app.
      </p>

      <button
        onClick={save}
        disabled={status.kind === "saving"}
        className="mt-3 bg-ember text-wood-950 rounded px-4 py-1.5 text-sm font-medium hover:bg-ember-light transition-colors disabled:opacity-40"
      >
        {status.kind === "saving" ? "Saving..." : `Save episode ${episodeNumber}`}
      </button>

      {status.kind === "error" && <p className="text-blood text-sm mt-2">{status.message}</p>}
      {status.kind === "ok" && <p className="text-ember text-sm mt-2">Saved.</p>}
    </div>
  );
}
