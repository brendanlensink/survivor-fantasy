# Survivor Fantasy — Build Plan

A small fantasy-league webapp for Survivor 51, for a private group of friends.
Weekly stats sourced from True Dork Times (truedorktimes.com), scraped into a
local DB, run through a configurable scoring engine.

## Stack

- **Next.js 14 (App Router) + TypeScript** — single deployable app, API routes
  double as your backend, no separate server needed.
- **Prisma + SQLite** — dead simple for a friend-group-scale app. Swap to
  Postgres later if you ever need to (Prisma makes that a config change, not
  a rewrite).
- **Tailwind** — fast styling, matches your frontend-design constraints if you
  later hand pages to an agent to restyle.
- **Vercel** (or any Node host) for deploy, with **Vercel Cron** (or a manual
  trigger button, see Phase 1) to run the weekly scrape.

## Data model (see prisma/schema.prisma)

- `Contestant` — one row per Survivor 51 cast member, tagged with its
  starting `tribe` (drives the "2 per tribe" draft rule)
- `Episode` — one row per aired episode
- `EpisodeStat` — raw scraped numbers per contestant per episode (challenge
  wins, votes for/against, idol notes, boot status) — this is your source of
  truth, kept separate from computed fantasy points so you can re-score
  retroactively if you tweak the rules
- `Player` — a person in your friend league, linked 1:1 to a `User`
- `User`/`Account`/`Session`/`VerificationToken` — standard NextAuth (Auth.js
  v4) Prisma-adapter models for Google sign-in; kept separate from `Player`
  so auth bookkeeping doesn't tangle with app-domain data
- `Team` — a `Player`'s drafted roster (list of `Contestant`s)
- `ScoringRule` — point values per stat category, so scoring is config, not
  hardcoded

## Phases

**Phase 1 — Data pipeline (build first, before anyone cares about UI)**

- `src/lib/scraper.ts`: fetch + parse the True Dork Times season table into
  `EpisodeStat` rows. Build and test this against **Survivor 50's** finished
  page now — it's real data with a stable, final table, and lets you validate
  parsing logic months before S51 airs.
- `src/app/api/scrape/route.ts`: an API route that runs the scraper and
  upserts into the DB. Trigger it manually (a button in an admin page, or
  just hitting the URL) for week 1 — wire up Vercel Cron once you trust it.
  Still a stub (logs what it scraped, doesn't write `EpisodeStat` rows) —
  the in-season TDT page's exact columns aren't knowable until S51 airs.
  Until that's wired up, enter stats by hand at `/admin/episodes`.
- Add a sanity check: bail loudly if the parsed table doesn't have the
  expected column count/headers, per the earlier caveat about depending on
  someone else's static page.

**Phase 2 — Scoring engine**

- `src/lib/scoring.ts`: pure function, `(EpisodeStat[], ScoringRule[]) =>
points`. Keep it pure/testable — no DB calls inside it — so you can unit
  test scoring logic against known S50 data before trusting it on live data.
- Decide your rules (reward win, immunity win, idol find, vote correctly,
  survive the episode, etc.) — the True Dork Times glossary maps well onto
  most of these.

**Phase 3 — Draft & teams**

- Simple draft: Each player picks 2 players from each of the starting tribes to form their team.
  Contestants aren't exclusive — multiple players can pick the same person — and picks stay
  private (no player can see another's roster) until the draft locks.
- Two tiebreakers, required to submit: predict the season winner (exact match), and guess the
  total number of idols played all season (closest guess). Both resolve near/at season end and
  are unlikely to tie against each other, so together they reliably break standings ties.
- `src/app/draft/page.tsx` + `src/components/DraftForm.tsx` — the picking UI.

**Phase 4 — Leaderboard & team pages**

- `src/app/page.tsx` — league standings, ranked by points then the two tiebreakers
  (`src/lib/leaderboard.ts`'s `rankLeaderboard`, unit-tested). The actual winner is marked via
  `Contestant.isWinner` once the finale airs (set manually, same pattern as `isEliminated`); the
  actual idols-played count is derived from `EpisodeStat.idolPlayed`, no separate field needed.
- `src/app/team/[id]/page.tsx` — one team's roster + weekly point breakdown, plus that team's
  tiebreaker answers once the draft locks.

**Phase 5 — Polish**

- Auth: Google sign-in via NextAuth, so players sign up and edit their own
  roster on their own time (no admin assigning). First sign-in
  auto-provisions a `Player` row — see `src/lib/auth.ts`. Requires a Google
  OAuth client (`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` in `.env`, see
  `.env.example` for setup).
- Draft lock: `DRAFT_LOCK_AT` env var freezes picks after a given timestamp
  (e.g. season premiere) — enforced in both the UI and
  `src/app/api/draft/route.ts`.
- Weekly recap view per contestant — `src/app/contestant/[id]/page.tsx`, episode-by-episode stat
  history and points pulled straight from `EpisodeStat`. Linked from the team page roster and a
  public `/contestants` cast index (`src/app/contestants/page.tsx`).
- Admin section (`/admin`, gated by `ADMIN_EMAILS` in `.env` — a comma-separated allowlist of
  Google account emails, same "don't over-build auth" philosophy as the rest of the app):
  - `/admin/episodes` — hand-enter a week's stats per contestant; checking "Booted" also flips
    `Contestant.isEliminated`/`bootedEp` so the rest of the app stays in sync automatically.
  - `/admin/contestants` — direct corrections (tribe, eliminated, winner) outside the weekly flow.
  - `/admin/teams` — override any player's roster/tiebreakers, no lock-date restriction.

## Suggested build order

1. Prisma schema + local SQLite, seed with Survivor 51 cast once announced
   (placeholder/dummy cast for now so you can build UI before the real cast
   drops).
2. Scraper against S50's finished page, unit-tested.
3. Scoring engine, unit-tested against the same S50 data.
4. Wire scraper → DB → scoring → a bare leaderboard page.
5. Draft flow.
6. Styling pass.

## Things intentionally left out of this skeleton

- Postgres/hosting config (SQLite file is fine until you deploy somewhere
  that doesn't have a persistent disk, e.g. serverless — then swap to
  Postgres via Prisma's datasource config, one line)
- Retry/backoff logic on the scrape — add once you've seen it fail once
