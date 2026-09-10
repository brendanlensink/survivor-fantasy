import { db } from "@/lib/db";
import { tribeColor } from "@/lib/tribeColors";
import PageHeading from "@/components/PageHeading";
import { isSpoilerFreeMode } from "@/lib/spoilerMode";

export const dynamic = "force-dynamic";

export default async function ContestantsPage() {
  const contestants = await db.contestant.findMany({ orderBy: [{ tribe: "asc" }, { name: "asc" }] });
  const tribes = Array.from(new Set(contestants.map((c) => c.tribe)));
  const spoilerFree = isSpoilerFreeMode();

  return (
    <div>
      <PageHeading>Cast</PageHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tribes.map((tribe) => {
          const color = tribeColor(tribe);
          return (
            <div key={tribe} className="bg-wood-800 rounded p-3">
              <h2 className="text-xs font-medium uppercase tracking-wide text-parchment-dim mb-2 flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color.bg }}
                  aria-hidden="true"
                />
                {tribe}
              </h2>
              <ul className="space-y-1 text-sm">
                {contestants
                  .filter((c) => c.tribe === tribe)
                  .map((c) => (
                    <li key={c.id}>
                      <a
                        href={`/contestant/${encodeURIComponent(c.id)}`}
                        className={`hover:text-ember transition-colors ${
                          !spoilerFree && c.isEliminated ? "text-parchment-dim line-through" : "text-parchment"
                        }`}
                      >
                        {c.name}
                      </a>
                      {!spoilerFree && c.isWinner && <span className="text-ember text-xs ml-1">★</span>}
                    </li>
                  ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
