import { db } from "@/lib/db";
import { getCurrentPlayer } from "@/lib/auth";
import { draftLockAt, isDraftLocked, PICKS_PER_TRIBE } from "@/lib/draftLock";

export const dynamic = "force-dynamic";
import DraftForm from "@/components/DraftForm";
import PageHeading from "@/components/PageHeading";
import AuthButtons from "@/components/AuthButtons";

// Self-service draft (README Phase 3, as refined for this league): each
// signed-in player picks their own roster on their own time — no turn
// order — subject to "exactly 2 per tribe" and a lock date after which
// picks freeze. Picks are private: contestants aren't exclusive, and
// players can't see who else has picked whom until the lock date.
export default async function DraftPage() {
  const player = await getCurrentPlayer();

  const contestants = await db.contestant.findMany({
    orderBy: [{ tribe: "asc" }, { name: "asc" }],
  });

  const contestantRows = contestants.map((c) => ({
    id: c.id,
    name: c.name,
    tribe: c.tribe,
  }));

  const tribes = Array.from(new Set(contestantRows.map((c) => c.tribe)));
  const locked = isDraftLocked();
  const lockAt = draftLockAt();

  const myTeam = player
    ? await db.team.findFirst({
        where: { playerId: player.id },
        include: { contestants: true },
      })
    : null;
  const myPicks = myTeam?.contestants.map((tc) => tc.contestantId) ?? [];

  return (
    <div>
      <PageHeading
        subtitle={
          <>
            Pick exactly {PICKS_PER_TRIBE} contestants from each tribe ({tribes.join(", ") || "no tribes seeded yet"}).
            Picks are private — you won&apos;t see anyone else&apos;s roster until the draft locks.
            {lockAt && (
              <>
                {" "}
                Picks {locked ? "locked as of" : "lock at"}{" "}
                <span className="text-parchment">{lockAt.toLocaleString()}</span>.
              </>
            )}
          </>
        }
      >
        Draft
      </PageHeading>

      {!player && (
        <div className="flex flex-col items-start gap-3 mb-6">
          <p className="text-parchment-dim">You need to sign in to draft your team.</p>
          <AuthButtons user={null} />
        </div>
      )}

      {player && (
        <DraftForm
          contestants={contestantRows}
          tribes={tribes}
          initialPicks={myPicks}
          initialWinnerPredictionId={myTeam?.winnerPredictionId ?? null}
          initialIdolsPlayedGuess={myTeam?.idolsPlayedGuess ?? null}
          locked={locked}
        />
      )}
    </div>
  );
}
