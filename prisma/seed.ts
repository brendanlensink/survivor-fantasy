/**
 * Placeholder seed data so the UI can be built before Survivor 51's real
 * cast/tribes are announced. Swap CAST for the real roster once it drops —
 * see README "suggested build order" step 1.
 *
 * Players/Teams are NOT seeded here anymore: they're created for real via
 * Google sign-in (see lib/auth.ts) + the self-service draft flow. This
 * script seeds one fake signed-in-style user/team purely so the
 * leaderboard/team pages have something to render in dev.
 */
import { PrismaClient } from "@prisma/client";
import { DEFAULT_SCORING_RULES } from "../src/lib/scoring";

const db = new PrismaClient();

// 3 tribes of 4 — draft rule is "pick 2 per tribe" (6-person roster).
const CAST: { name: string; tribe: string }[] = [
  { name: "Contestant 1", tribe: "Tribe A" },
  { name: "Contestant 2", tribe: "Tribe A" },
  { name: "Contestant 3", tribe: "Tribe A" },
  { name: "Contestant 4", tribe: "Tribe A" },
  { name: "Contestant 5", tribe: "Tribe B" },
  { name: "Contestant 6", tribe: "Tribe B" },
  { name: "Contestant 7", tribe: "Tribe B" },
  { name: "Contestant 8", tribe: "Tribe B" },
  { name: "Contestant 9", tribe: "Tribe C" },
  { name: "Contestant 10", tribe: "Tribe C" },
  { name: "Contestant 11", tribe: "Tribe C" },
  { name: "Contestant 12", tribe: "Tribe C" },
];

async function main() {
  for (const [key, points] of Object.entries(DEFAULT_SCORING_RULES)) {
    await db.scoringRule.upsert({
      where: { key },
      update: { points },
      create: { key, points },
    });
  }

  const contestants = [];
  for (const { name, tribe } of CAST) {
    contestants.push(
      await db.contestant.upsert({
        where: { id: name }, // placeholder cast has no stable natural key; reuse name as id for idempotent seeding
        update: { tribe },
        create: { id: name, name, tribe },
      })
    );
  }

  const episode1 = await db.episode.upsert({
    where: { number: 1 },
    update: {},
    create: { number: 1, title: "Episode 1" },
  });

  // A couple of sample stat rows so the leaderboard isn't all zeroes.
  await db.episodeStat.upsert({
    where: { contestantId_episodeId: { contestantId: contestants[0].id, episodeId: episode1.id } },
    update: {},
    create: {
      contestantId: contestants[0].id,
      episodeId: episode1.id,
      challengeWins: 1,
      wentToTribal: false,
      wasImmune: true,
    },
  });
  await db.episodeStat.upsert({
    where: { contestantId_episodeId: { contestantId: contestants[1].id, episodeId: episode1.id } },
    update: {},
    create: {
      contestantId: contestants[1].id,
      episodeId: episode1.id,
      votesAgainstPlayer: 4,
      wentToTribal: true,
      wasBooted: true,
    },
  });
  await db.contestant.update({
    where: { id: contestants[1].id },
    data: { isEliminated: true, bootedEp: 1 },
  });

  // Fake test user/player/team — NOT a real Google account. Only here so
  // there's something to look at in dev; delete freely.
  const testUser = await db.user.upsert({
    where: { id: "seed-test-user" },
    update: {},
    create: { id: "seed-test-user", name: "Test Player", email: "test@example.com" },
  });
  const testPlayer = await db.player.upsert({
    where: { userId: testUser.id },
    update: {},
    create: { id: "seed-test-player", name: "Test Player", userId: testUser.id },
  });
  const testTeam = await db.team.upsert({
    where: { id: "seed-test-team" },
    update: { winnerPredictionId: contestants[0].id, idolsPlayedGuess: 6 },
    create: {
      id: "seed-test-team",
      name: "Test Player's Team",
      playerId: testPlayer.id,
      winnerPredictionId: contestants[0].id,
      idolsPlayedGuess: 6,
    },
  });

  // 2 per tribe: contestants 1-2 (Tribe A), 5-6 (Tribe B), 9-10 (Tribe C).
  const roster = [contestants[0], contestants[1], contestants[4], contestants[5], contestants[8], contestants[9]];
  for (const c of roster) {
    await db.teamContestant.upsert({
      where: { teamId_contestantId: { teamId: testTeam.id, contestantId: c.id } },
      update: {},
      create: { teamId: testTeam.id, contestantId: c.id },
    });
  }

  console.log(`Seeded ${contestants.length} contestants across 3 tribes, 1 test team.`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
