"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TEAM_NAME_MAX_LENGTH, graphemeLength } from "@/lib/teamName";

// Standalone from DraftForm so it keeps working after the draft locks.
export default function TeamNameForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [savedName, setSavedName] = useState(initialName);
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "error" | "ok"; message?: string }>({
    kind: "idle",
  });

  const trimmed = name.trim();
  const tooLong = graphemeLength(trimmed) > TEAM_NAME_MAX_LENGTH;
  const canSave = trimmed.length > 0 && !tooLong && trimmed !== savedName && status.kind !== "saving";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setStatus({ kind: "saving" });

    const res = await fetch("/api/team/name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      setStatus({ kind: "error", message: data.error ?? "Couldn't save team name" });
      return;
    }

    setName(data.name);
    setSavedName(data.name);
    setStatus({ kind: "ok" });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mb-2 max-w-sm">
      <label htmlFor="team-name" className="block text-xs font-medium uppercase tracking-wide text-parchment-dim mb-1">
        Team name
      </label>
      <div className="flex gap-2">
        <input
          id="team-name"
          type="text"
          className="flex-1 min-w-0 bg-wood-800 border border-wood-600 rounded px-2 py-1.5 text-parchment"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (status.kind !== "saving") setStatus({ kind: "idle" });
          }}
        />
        <button
          type="submit"
          disabled={!canSave}
          className="bg-ember text-wood-950 rounded px-4 py-1.5 text-sm font-medium hover:bg-ember-light transition-colors disabled:opacity-40 disabled:hover:bg-ember"
        >
          {status.kind === "saving" ? "Saving..." : "Rename"}
        </button>
      </div>
      <p className="text-parchment-dim text-xs mt-1">You can change this any time, even after the draft locks. Emoji welcome.</p>
      {tooLong && (
        <p className="text-blood text-sm mt-1">Keep it to {TEAM_NAME_MAX_LENGTH} characters or fewer.</p>
      )}
      {status.kind === "error" && <p className="text-blood text-sm mt-1">{status.message}</p>}
      {status.kind === "ok" && <p className="text-ember text-sm mt-1">Team name saved.</p>}
    </form>
  );
}
