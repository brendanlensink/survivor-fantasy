"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SyncResponse =
  | { ok: true; episodeNumber: number; sourceUrl: string; savedCount: number; booted: string[]; immune: string[] }
  | { ok: false; error: string };

export default function TdtSyncButton({ episodeNumber }: { episodeNumber: number }) {
  const router = useRouter();
  const [status, setStatus] = useState<
    { kind: "idle" } | { kind: "syncing" } | { kind: "error"; message: string } | { kind: "ok"; result: Extract<SyncResponse, { ok: true }> }
  >({ kind: "idle" });

  async function sync() {
    setStatus({ kind: "syncing" });
    try {
      const res = await fetch(`/api/scrape?episode=${episodeNumber}`, { method: "POST" });
      const data = (await res.json()) as SyncResponse;
      if (!data.ok) {
        setStatus({ kind: "error", message: data.error ?? "Sync failed" });
        return;
      }
      setStatus({ kind: "ok", result: data });
      router.push(`/admin/episodes?ep=${data.episodeNumber}`);
      router.refresh();
    } catch (err) {
      setStatus({ kind: "error", message: (err as Error).message });
    }
  }

  return (
    <div className="mb-4 rounded border border-wood-600 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={sync}
          disabled={status.kind === "syncing"}
          className="border border-ember text-ember rounded px-3 py-1 font-medium hover:bg-ember hover:text-wood-950 transition-colors disabled:opacity-40"
        >
          {status.kind === "syncing" ? "Syncing..." : `Sync episode ${episodeNumber} from TDT`}
        </button>
        <p className="text-parchment-dim text-xs flex-1 min-w-[16rem]">
          Replaces challenge and vote numbers with True Dork Times&apos; box score, and discards unsaved edits below.
          Idols and boots you&apos;ve checked by hand are kept.
        </p>
      </div>

      {status.kind === "error" && <p className="text-blood mt-2">{status.message}</p>}
      {status.kind === "ok" && (
        <div className="text-parchment mt-2 space-y-0.5">
          <p className="text-ember">
            Saved {status.result.savedCount} rows from{" "}
            <a href={status.result.sourceUrl} target="_blank" rel="noreferrer" className="underline">
              TDT
            </a>
            .
          </p>
          <p>
            Booted: {status.result.booted.join(", ") || "nobody found. If someone left without a vote, check Booted below."}
          </p>
          <p>Individual immunity: {status.result.immune.join(", ") || "nobody"}</p>
          <p className="text-parchment-dim">TDT doesn&apos;t list idols, so check those below and save.</p>
        </div>
      )}
    </div>
  );
}
