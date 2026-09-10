import { db } from "@/lib/db";
import ContestantAdminTable from "@/components/admin/ContestantAdminTable";

export const dynamic = "force-dynamic";

export default async function AdminContestantsPage() {
  const contestants = await db.contestant.findMany({ orderBy: [{ tribe: "asc" }, { name: "asc" }] });

  return (
    <div>
      <h2 className="font-display text-xl uppercase tracking-wide text-parchment mb-3">Contestants</h2>
      <p className="text-parchment-dim text-sm mb-4">
        Direct status overrides — for the normal weekly flow, use Episode stats (checking
        &quot;Booted&quot; there does this automatically). Only one contestant can be the winner at a
        time.
      </p>
      <ContestantAdminTable
        contestants={contestants.map((c) => ({
          id: c.id,
          name: c.name,
          tribe: c.tribe,
          isEliminated: c.isEliminated,
          bootedEp: c.bootedEp,
          isWinner: c.isWinner,
        }))}
      />
    </div>
  );
}
