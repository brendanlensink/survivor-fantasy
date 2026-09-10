"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { tribeColor } from "@/lib/tribeColors";

interface Contestant {
  id: string;
  name: string;
  tribe: string;
}

const PICKS_PER_TRIBE = 2;

export default function AdminTeamForm({
  playerId,
  contestants,
  tribes,
  initialPicks,
  initialWinnerPredictionId,
  initialIdolsPlayedGuess,
}: {
  playerId: string;
  contestants: Contestant[];
  tribes: string[];
  initialPicks: string[];
  initialWinnerPredictionId: string | null;
  initialIdolsPlayedGuess: number | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(initialPicks));
  const [winnerPredictionId, setWinnerPredictionId] = useState(initialWinnerPredictionId ?? "");
  const [idolsPlayedGuess, setIdolsPlayedGuess] = useState(
    initialIdolsPlayedGuess !== null ? String(initialIdolsPlayedGuess) : ""
  );
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "error" | "ok"; message?: string }>({
    kind: "idle",
  });

  function toggle(contestantId: string, tribe: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(contestantId)) {
        next.delete(contestantId);
        return next;
      }
      const pickedInTribe = contestants.filter((c) => next.has(c.id) && c.tribe === tribe).length;
      if (pickedInTribe >= PICKS_PER_TRIBE) return prev;
      next.add(contestantId);
      return next;
    });
  }

  const countByTribe = (tribe: string) =>
    contestants.filter((c) => selected.has(c.id) && c.tribe === tribe).length;
  const complete = tribes.every((t) => countByTribe(t) === PICKS_PER_TRIBE);

  async function save() {
    if (!complete) return;
    setStatus({ kind: "saving" });

    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId,
        contestantIds: Array.from(selected),
        winnerPredictionId: winnerPredictionId || null,
        idolsPlayedGuess: idolsPlayedGuess === "" ? null : Number(idolsPlayedGuess),
      }),
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
      <div className="grid grid-cols-3 gap-4 mb-6">
        {tribes.map((tribe) => {
          const color = tribeColor(tribe);
          return (
            <div key={tribe} className="bg-wood-800 rounded p-3">
              <h3 className="text-xs font-medium uppercase tracking-wide text-parchment-dim mb-2 flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color.bg }}
                  aria-hidden="true"
                />
                {tribe} ({countByTribe(tribe)}/{PICKS_PER_TRIBE})
              </h3>
              <ul className="space-y-1 text-sm">
                {contestants
                  .filter((c) => c.tribe === tribe)
                  .map((c) => (
                    <li key={c.id}>
                      <label className="flex items-center gap-2 text-parchment">
                        <input
                          type="checkbox"
                          className="accent-ember"
                          checked={selected.has(c.id)}
                          onChange={() => toggle(c.id, c.tribe)}
                        />
                        {c.name}
                      </label>
                    </li>
                  ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="border-t border-wood-700 pt-4 mb-4 space-y-3 max-w-sm">
        <h3 className="text-xs font-medium uppercase tracking-wide text-parchment-dim">Tiebreakers</h3>

        <div>
          <label htmlFor="admin-winner-prediction" className="block text-sm text-parchment-dim mb-1">
            Winner pick
          </label>
          <select
            id="admin-winner-prediction"
            className="w-full bg-wood-800 border border-wood-600 rounded px-2 py-1.5 text-parchment"
            value={winnerPredictionId}
            onChange={(e) => setWinnerPredictionId(e.target.value)}
          >
            <option value="">(none)</option>
            {contestants.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="admin-idols-played-guess" className="block text-sm text-parchment-dim mb-1">
            Idols played guess
          </label>
          <input
            id="admin-idols-played-guess"
            type="number"
            min={0}
            step={1}
            className="w-full bg-wood-800 border border-wood-600 rounded px-2 py-1.5 text-parchment"
            value={idolsPlayedGuess}
            onChange={(e) => setIdolsPlayedGuess(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={save}
        disabled={status.kind === "saving" || !complete}
        className="bg-ember text-wood-950 rounded px-4 py-1.5 text-sm font-medium hover:bg-ember-light transition-colors disabled:opacity-40"
      >
        {status.kind === "saving" ? "Saving..." : "Save"}
      </button>
      {!complete && (
        <p className="text-parchment-dim text-sm mt-2">Pick exactly {PICKS_PER_TRIBE} from every tribe to save.</p>
      )}

      {status.kind === "error" && <p className="text-blood text-sm mt-2">{status.message}</p>}
      {status.kind === "ok" && <p className="text-ember text-sm mt-2">Saved.</p>}
    </div>
  );
}
