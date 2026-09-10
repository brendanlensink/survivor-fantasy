import { db } from "@/lib/db";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  const players = await db.player.findMany({
    include: { teams: { include: { contestants: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h2 className="font-display text-xl uppercase tracking-wide text-parchment mb-3">Teams</h2>
      <p className="text-parchment-dim text-sm mb-4">
        Override any player&apos;s roster or tiebreakers — no lock-date restriction here.
      </p>
      {players.length === 0 ? (
        <EmptyState>No players have signed in yet.</EmptyState>
      ) : (
        <ul className="space-y-1">
          {players.map((p) => {
            const team = p.teams[0];
            return (
              <li key={p.id} className="flex justify-between border-b border-wood-700 py-2 text-sm">
                <a href={`/admin/teams/${p.id}`} className="text-parchment hover:text-ember transition-colors">
                  {p.name}
                </a>
                <span className="text-parchment-dim">
                  {team ? `${team.contestants.length} picked` : "no team yet"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
