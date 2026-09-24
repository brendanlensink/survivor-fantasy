/**
 * Seeds Survivor 51's real cast, starting tribes, and boots so far.
 * Stats come from TDT via the sync, not from here.
 *
 * Players/Teams aren't seeded: they're created for real via Google
 * sign-in (see lib/auth.ts) + the self-service draft flow.
 */
import { PrismaClient } from "@prisma/client";
import { DEFAULT_SCORING_RULES } from "../src/lib/scoring";

const db = new PrismaClient();

// Survivor 51 starting tribes. Draft rule is "pick 2 per tribe".
const CAST: { name: string; tribe: string }[] = [
  { name: "Aaliyah Puglia", tribe: "Toka" },
  { name: "Brady Booker", tribe: "Toka" },
  { name: "Danny Kilby", tribe: "Toka" },
  { name: "Devin Way", tribe: "Toka" },
  { name: "Jelly Loblack", tribe: "Toka" },
  { name: "Jenna Doore", tribe: "Toka" },
  { name: "Lewis Kelly", tribe: "Toka" },
  { name: "Maggie Nestor", tribe: "Toka" },
  { name: "Mike Pinsky", tribe: "Toka" },
  { name: "Patt Cannaday", tribe: "Toka" },
  { name: "Thien An Nguyen", tribe: "Toka" },
  { name: "Alexis Levine", tribe: "Savu" },
  { name: "Ana Sani", tribe: "Savu" },
  { name: "Carter Krull", tribe: "Savu" },
  { name: "Cristian Chavez", tribe: "Savu" },
  { name: "Eric Macksoud", tribe: "Savu" },
  { name: "Kristin Flickinger", tribe: "Savu" },
  { name: "Linnea Capobianco", tribe: "Savu" },
  { name: "Ori Jean-Charles", tribe: "Savu" },
  { name: "Rob Antonson", tribe: "Savu" },
  { name: "Sharonda Cox", tribe: "Savu" },
];

// Voted out so far, by episode.
const BOOTS: { name: string; episode: number }[] = [{ name: "Aaliyah Puglia", episode: 1 }];

async function main() {
  // Only fills in missing rules. Values edited in the DB are the live
  // config, so re-running the seed mustn't reset them to the defaults.
  for (const [key, points] of Object.entries(DEFAULT_SCORING_RULES)) {
    await db.scoringRule.upsert({
      where: { key },
      update: {},
      create: { key, points },
    });
  }

  // Clear out the pre-announcement placeholder cast ("Contestant 1".."12").
  const placeholderIds = (
    await db.contestant.findMany({ where: { id: { startsWith: "Contestant " } }, select: { id: true } })
  ).map((c) => c.id);
  if (placeholderIds.length > 0) {
    await db.team.updateMany({ where: { winnerPredictionId: { in: placeholderIds } }, data: { winnerPredictionId: null } });
    await db.teamContestant.deleteMany({ where: { contestantId: { in: placeholderIds } } });
    await db.episodeStat.deleteMany({ where: { contestantId: { in: placeholderIds } } });
    await db.contestant.deleteMany({ where: { id: { in: placeholderIds } } });
  }

  const contestants = [];
  for (const { name, tribe } of CAST) {
    contestants.push(
      await db.contestant.upsert({
        where: { id: name }, // no stable external id yet; reuse name as id for idempotent seeding
        update: { tribe },
        create: { id: name, name, tribe },
      })
    );
  }

  for (const { name, episode } of BOOTS) {
    const ep = await db.episode.upsert({
      where: { number: episode },
      update: {},
      create: { number: episode, title: `Episode ${episode}` },
    });
    await db.episodeStat.upsert({
      where: { contestantId_episodeId: { contestantId: name, episodeId: ep.id } },
      update: { wentToTribal: true, wasBooted: true },
      create: { contestantId: name, episodeId: ep.id, wentToTribal: true, wasBooted: true },
    });
    await db.contestant.update({ where: { id: name }, data: { isEliminated: true, bootedEp: episode } });
  }

  console.log(`Seeded ${contestants.length} contestants, ${BOOTS.length} boot(s).`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
