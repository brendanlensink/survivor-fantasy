# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Brendan, who both runs the league (commissioner, gated via `ADMIN_EMAILS`) and plays in it (drafts a roster like everyone else), plus a private friend group of roughly 9–20 people. Each player signs in with Google, drafts a 6-person roster once before the season locks, and checks the standings weekly while Survivor 51 airs. Nobody outside this invite-only, real-life friend group is a target user.

## Product Purpose

A private fantasy-league app for Survivor. It replaces a hand-tallied spreadsheet with automated weekly scoring pulled from real episode data, so the league doesn't have to manually compute points, and it keeps players who fall behind on episodes safe from spoilers everywhere in the app, not just on the standings page.

## Positioning

Two things a generic "fantasy league tracker" template wouldn't have baked in: (1) scoring sourced from True Dork Times' published per-episode stat tables (`truedorktimes.com`) rather than someone manually tallying challenge wins and votes, and (2) a default-on, app-wide spoiler-free mode that hides scores and episode outcomes until a player explicitly reveals them — built for a group where not everyone watches live.

## Operating Context

Runs on Survivor's weekly broadcast rhythm: an episode airs, its stats get recorded (currently hand-entered at `/admin/episodes`; auto-scraping True Dork Times is still the plan, not yet wired — see Capabilities), standings update, the league checks in. The draft happens once, before or at season premiere, and freezes at `DRAFT_LOCK_AT`. The whole site sits behind Google sign-in — there's no public/unauthenticated view.

## Capabilities and Constraints

- Self-service draft: each player picks exactly 2 contestants per starting tribe (6 total). Contestants aren't exclusive — multiple players can draft the same person. Picks are private until the draft locks.
- Two required tiebreakers at draft time: predict the season winner (exact match) and guess the season's total idols played (closest guess wins).
- Scoring is config-driven (`ScoringRule` table / `DEFAULT_SCORING_RULES`), not hardcoded, so point values can change season to season without a code change.
- **Data pipeline is mid-build**: `src/lib/scraper.ts` / `src/app/api/scrape/route.ts` parse True Dork Times' box-score table but are still a stub (log what they'd scrape, don't yet write `EpisodeStat` rows). Confirmed this is still the intended path to finish before the season premiere — manual entry at `/admin/episodes` is the stopgap, not the permanent workflow.
- Admin access is a simple email allowlist (`ADMIN_EMAILS`), deliberately not a roles/permissions system — matches the project's own "don't over-build auth" philosophy.
- Currently seeded with placeholder cast data (`Contestant 1`–`12` across `Tribe A/B/C`). The real Survivor 51 cast and tribes are not loaded yet — pending the season's cast announcement.
- Deployed on Railway with Postgres (switched from local SQLite for deploy).

## Brand Commitments

Name: "Survivor Fantasy". Visual identity ("Tribal Council" theme) is already implemented, not just aspirational: charcoal/wood-brown surfaces, torch-orange ("ember") and blood-red accents, cream/parchment text, Oswald display font set in uppercase for headings, a blurred Fiji beach photo background, and deterministic per-tribe color badges.

## Evidence on Hand

- `public/images/fiji-beach.jpg` — the background photo asset.
- No real Survivor 51 cast, stats, or standings exist yet — the season hasn't aired. Every contestant name, stat, and standing currently visible in the app is placeholder/seed data and must not be treated as real content in future design work.
- True Dork Times (`truedorktimes.com`) is the external data source once the scraper is finished; no scraped data exists yet.

## Product Principles

1. Weekly stats (hand-entered or scraped) are the single source of truth — fantasy points are always re-derived from them, never hand-edited directly.
2. Spoiler safety is a default-on, app-wide constraint, not a standings-page feature — any surface that could reveal an episode outcome must respect spoiler-free mode.
3. Keep auth and permissions minimal for a friend-group scale — an email allowlist beats a roles system.
4. Self-service over commissioner bottleneck — players manage their own draft and roster on their own time rather than the commissioner assigning teams.
5. Config over hardcoding for anything that plausibly changes season to season (scoring rules, draft lock date, cast/tribes).
