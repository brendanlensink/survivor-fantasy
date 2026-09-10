import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AdminTeamForm from "@/components/admin/AdminTeamForm";

export default async function AdminTeamEditPage({ params }: { params: { playerId: string } }) {
  const player = await db.player.findUnique({
    where: { id: params.playerId },
    include: { teams: { include: { contestants: true } } },
  });
  if (!player) notFound();

  const contestants = await db.contestant.findMany({
    orderBy: [{ tribe: "asc" }, { name: "asc" }],
  });
  const tribes = Array.from(new Set(contestants.map((c) => c.tribe)));

  const team = player.teams[0];

  return (
    <div>
      <h2 className="font-display text-xl uppercase tracking-wide text-parchment mb-1">{player.name}</h2>
      <p className="text-parchment-dim text-sm mb-4">{player.email}</p>

      <AdminTeamForm
        playerId={player.id}
        contestants={contestants.map((c) => ({ id: c.id, name: c.name, tribe: c.tribe }))}
        tribes={tribes}
        initialPicks={team?.contestants.map((tc) => tc.contestantId) ?? []}
        initialWinnerPredictionId={team?.winnerPredictionId ?? null}
        initialIdolsPlayedGuess={team?.idolsPlayedGuess ?? null}
      />
    </div>
  );
}
