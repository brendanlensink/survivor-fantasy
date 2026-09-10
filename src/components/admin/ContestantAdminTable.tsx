"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Contestant {
  id: string;
  name: string;
  tribe: string;
  isEliminated: boolean;
  bootedEp: number | null;
  isWinner: boolean;
}

function ContestantRow({ contestant }: { contestant: Contestant }) {
  const router = useRouter();
  const [tribe, setTribe] = useState(contestant.tribe);
  const [isEliminated, setIsEliminated] = useState(contestant.isEliminated);
  const [bootedEp, setBootedEp] = useState(contestant.bootedEp !== null ? String(contestant.bootedEp) : "");
  const [isWinner, setIsWinner] = useState(contestant.isWinner);
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "ok">("idle");

  async function save() {
    setStatus("saving");
    const res = await fetch("/api/admin/contestant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: contestant.id,
        tribe,
        isEliminated,
        bootedEp: bootedEp === "" ? null : Number(bootedEp),
        isWinner,
      }),
    });
    setStatus(res.ok ? "ok" : "error");
    router.refresh();
  }

  return (
    <tr className="border-b border-wood-700">
      <td className="py-1.5 pr-3 text-parchment">{contestant.name}</td>
      <td className="py-1.5 px-2">
        <input
          aria-label={`Tribe for ${contestant.name}`}
          className="w-24 bg-wood-800 border border-wood-600 rounded px-1 py-0.5 text-parchment"
          value={tribe}
          onChange={(e) => setTribe(e.target.value)}
        />
      </td>
      <td className="py-1.5 px-2 text-center">
        <input
          type="checkbox"
          aria-label={`Eliminated: ${contestant.name}`}
          className="accent-blood"
          checked={isEliminated}
          onChange={(e) => setIsEliminated(e.target.checked)}
        />
      </td>
      <td className="py-1.5 px-2">
        <input
          type="number"
          aria-label={`Booted episode for ${contestant.name}`}
          className="w-14 bg-wood-800 border border-wood-600 rounded px-1 py-0.5 text-parchment"
          value={bootedEp}
          onChange={(e) => setBootedEp(e.target.value)}
        />
      </td>
      <td className="py-1.5 px-2 text-center">
        <input
          type="checkbox"
          aria-label={`Winner: ${contestant.name}`}
          className="accent-ember"
          checked={isWinner}
          onChange={(e) => setIsWinner(e.target.checked)}
        />
      </td>
      <td className="py-1.5 px-2">
        <button
          onClick={save}
          disabled={status === "saving"}
          className="text-xs bg-ember text-wood-950 rounded px-2 py-1 hover:bg-ember-light transition-colors disabled:opacity-40"
        >
          {status === "saving" ? "..." : "Save"}
        </button>
        {status === "ok" && <span className="text-ember text-xs ml-2">Saved</span>}
        {status === "error" && <span className="text-blood text-xs ml-2">Failed</span>}
      </td>
    </tr>
  );
}

export default function ContestantAdminTable({ contestants }: { contestants: Contestant[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-sm border-collapse">
        <thead>
          <tr className="border-b border-wood-600 text-parchment-dim text-xs">
            <th className="py-2 pr-3 text-left">Name</th>
            <th className="py-2 px-2 text-left">Tribe</th>
            <th className="py-2 px-2">Eliminated</th>
            <th className="py-2 px-2">Booted ep</th>
            <th className="py-2 px-2">Winner</th>
            <th className="py-2 px-2"></th>
          </tr>
        </thead>
        <tbody>
          {contestants.map((c) => (
            // Keying on the full row (not just id) forces a remount when
            // server data changes (e.g. another row's "Winner" save clears
            // this one) so local edit state doesn't go stale after refresh().
            <ContestantRow key={`${c.id}-${c.tribe}-${c.isEliminated}-${c.bootedEp}-${c.isWinner}`} contestant={c} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
