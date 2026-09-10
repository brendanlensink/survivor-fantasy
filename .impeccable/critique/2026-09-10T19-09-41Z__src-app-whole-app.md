---
target: whole app
total_score: 18
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
timestamp: 2026-09-10T19-09-41Z
slug: src-app-whole-app
---
Method: dual-agent (A: a7bc9566f3a00359e · B: a1622d4d44d0705d6)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Draft save shows a "Saving…" state, but the spoiler-mode toggle gives zero feedback that the cookie changed — no toast, no highlight, just a re-render. |
| 2 | Match Between System and Real World | 2 | "ChW / VFB / VAP" column headers ([contestant/[id]/page.tsx:78-85](src/app/contestant/[id]/page.tsx:78)) are internal scoring shorthand, not vocabulary a Survivor fan would recognize. |
| 3 | User Control and Freedom | 2 | No visible way to edit tiebreaker picks before "Save picks"; no cancel/reset affordance in DraftForm. |
| 4 | Consistency and Standards | 2 | The mobile drawer highlights the active page ([NavMenu.tsx:128](src/components/NavMenu.tsx:128)); the desktop nav row has no equivalent — same nav, inconsistent behavior. |
| 5 | Error Prevention | 3 | Draft form disables Save until the roster is complete and validates the idol-guess as a non-negative integer — a real guardrail. |
| 6 | Recognition Rather Than Recall | 2 | Tribe pick counts ("2/2") are shown, but nothing surfaces which tribes are already complete from elsewhere in the app. |
| 7 | Flexibility and Efficiency of Use | 1 | No keyboard shortcuts, no bulk actions — notable since this is a repeat-use utility a handful of people open weekly, not a one-off. |
| 8 | Aesthetic and Minimalist Design | 2 | Confirmed live: the standings page renders one narrow card in a large blurred void at both desktop and mobile widths — reads unfinished, not minimal. The detector's repeated `radial-spotlight-glow` finding on every page is likely intentional (fits the ember/torch theme) rather than a defect. |
| 9 | Error Recovery | 1 | DraftForm surfaces the raw API error string (`data.error ?? "Draft failed"`) with no guidance on how to fix it. |
| 10 | Help and Documentation | 1 | The abbreviated stat columns have no legend, tooltip, or glossary anywhere in the app. |
| **Total** | | **18/40** | **Poor** — significant improvements needed before the core experience feels finished |

## Design Specificity Verdict

**LLM assessment**: The theming is real but shallow. Oswald uppercase headings, ember/blood accents, the blurred Fiji photo, and tribe-colored badges are genuinely Survivor-flavored and wouldn't survive a copy-paste into an unrelated app. But the interaction language underneath — checkbox grids, a plain `<select>`, a generic data table with cryptic column abbreviations — is boilerplate CRUD UI wearing a tribal-council skin. Nothing about the draft flow, the spoiler mechanic, or the standings page feels *invented* for this specific game; it reads as "admin dashboard, orange edition."

**Deterministic scan**: `detect.mjs` against `src/app` and `src/components` returned exit code 2 (findings present):

- `side-tab` (warning, slop category) × 1 — [Leaderboard.tsx:45](src/components/Leaderboard.tsx:45), the `border-l-4` rank accent. This exact line was flagged and reviewed earlier in this conversation; it's pre-existing design from before this session's changes, and the call at the time was to leave it as the app's established visual language rather than a fresh defect. Repeating it here for completeness, not as a new ask.

Browser-injected detector runs across `/`, `/draft`, `/contestants`, and `/sign-in` added, on top of the static scan:
- `radial-spotlight-glow` on every page (the `.fiji-overlay` radial gradient in `globals.css`) — thematically consistent, likely intentional, flag only if you want it toned down.
- `low-contrast` × 3 on `/draft`: `#8a7d6a` (parchment-dim) on `#211a13` (wood-800) at **4.3:1**, just under the 4.5:1 WCAG AA text minimum.
- `low-contrast` on `/contestants`: `#f0e6d2` (parchment) on a tribe badge background `#8a5a9e` at **4.2:1** — also under AA.
- `flat-type-hierarchy` on `/sign-in`: type sizes 14/16/20/24px, a 1.7:1 ratio (a low-stakes page, but noted).
- `line-length` ~114 characters on `/draft`'s subtitle copy (aim under ~80 for comfortable reading).

No findings were judged false positives — every one maps to a literal class, a measured contrast ratio, or a measured type scale, not a heuristic guess.

**Visual overlays**: injection succeeded and the detector ran live in the page (confirmed via console output), but the browser tab's session was inadvertently cleared mid-scan while testing the signed-out `/sign-in` state (see Minor Observations), and the live-server used for injection has since been stopped. No overlay is reliably still visible in your browser pane right now — treat the findings above as the record of what the scan found, not something to go look at on-screen.

## Overall Impression

The Survivor-specific *skin* is convincing — torch icon, tribe colors, blurred beach photo, the spoiler-free mechanic itself is a genuinely clever product idea. But the *structure* underneath hasn't caught up: the standings page (the app's front door, checked weekly) currently looks like a debug view with one card floating in empty space, contrast fails WCAG AA in two places, and the scoring vocabulary (ChW/VFB/VAP) is never explained anywhere a first-time player would find it. The biggest opportunity is making the weekly "check the standings" moment actually feel like a payoff instead of a placeholder.

## What's Working

- **[Leaderboard.tsx](src/components/Leaderboard.tsx)**: alphabetizing teams (instead of ranking) and swapping point totals for a lock icon in spoiler-free mode is a genuinely clever, product-specific solution — it hides the spoiler without making the list useless.
- **[EmptyState.tsx](src/components/EmptyState.tsx)**: a small, consistent, on-theme empty-state pattern (torch icon, compact/standalone modes) reused across contestant and team pages instead of ad-hoc "No data" text.
- **[tribeColors.ts](src/lib/tribeColors.ts)**: deterministic hash-based tribe coloring means new tribes get a consistent badge color with zero config — pragmatic and low-maintenance for a show that reshuffles tribes mid-season.

## Priority Issues

**[P0] Contestant IDs are raw names used as unencoded URL path segments**
- Why it matters: [contestants/page.tsx:31](src/app/contestants/page.tsx:31) links to `/contestant/Contestant 1` — an un-encoded space in the href. Real cast names with apostrophes, accents, or other special characters will break routing or trigger `notFound()` in production. This is placeholder-seed-data debt about to become a real bug once the actual Survivor 51 cast is loaded.
- Fix: encode the id in the href (`encodeURIComponent`), and confirm the contestant page's `decodeURIComponent(params.id)` round-trips correctly for names with punctuation.
- Suggested command: `/impeccable harden`

**[P1] Color contrast fails WCAG AA in two places**
- Why it matters: measured live — `#8a7d6a` on `#211a13` (4.3:1) on `/draft`, and `#f0e6d2` on a purple tribe badge (`#8a5a9e`, 4.2:1) on `/contestants`. Both are under the 4.5:1 text minimum; low-vision users and anyone in bright light will struggle to read them.
- Fix: darken/lighten the tribe badge palette in `tribeColors.ts` until badge text clears 4.5:1 against its background, and bump `parchment-dim` a shade lighter (or use `parchment-muted`) wherever it sits directly on `wood-800`.
- Suggested command: `/impeccable audit`

**[P1] Standings page composition looks unfinished, not minimal**
- Why it matters: confirmed at both desktop (1280px) and mobile (375px) — a single narrow team card sits at the top of a large expanse of blurred background. This is the page people check every week; right now it reads as a debug view rather than a payoff screen.
- Fix: either cap the content wrapper's height/positioning so it doesn't imply missing content, or fill the remaining space with something that belongs there — an episode countdown, a rules/scoring summary, recent activity.
- Suggested command: `/impeccable layout`

**[P1] No active-page indicator on desktop nav**
- Why it matters: [NavMenu.tsx](src/components/NavMenu.tsx) computes an `active` highlight only inside the mobile drawer (line 128); the desktop link row (lines 92-102) has no equivalent. Signed-in users on a laptop/desktop lose track of which page they're on.
- Fix: reuse the same `pathname`-based active check for the desktop `<a>` links.
- Suggested command: `/impeccable layout`

**[P2] Scoring jargon has no legend anywhere**
- Why it matters: `ChW / VFB / VAP` column headers on `/contestant/[id]` and `/team/[id]` assume the reader already knows the scoring model. A new player (or a league member's spouse checking scores) has no way to decode it in-app.
- Fix: add a hover title/tooltip on each header, or a one-line legend beneath the table (e.g., "ChW = Challenge Wins, VFB = Votes For Bootee, VAP = Votes Against Player").
- Suggested command: `/impeccable clarify`

## Persona Red Flags

**Jordan (Confused First-Timer)**: Lands on `/contestant/[id]` and sees "ChW 0 / VFB 2 / VAP 1" with zero explanation of what any of it means or how it becomes points — no tooltip, no link to a scoring-rules page. Likely to bounce rather than puzzle it out.

**Sam (Accessibility-Dependent User)**: The hamburger toggle correctly sets `aria-expanded`, but the tribe-color dots on `/contestants` and `/draft` (`<span style={{backgroundColor}}>`) carry no text/aria-label — the tribe name comes from the adjacent heading, but the color-coding itself conveys nothing to anyone who can't perceive it. Combined with the two measured contrast failures above, this page has real accessibility debt, not just a nice-to-fix.

**Casey (Distracted Mobile User)**: `DraftForm.tsx`'s tribe pick grid uses `grid-cols-3` at all widths, including 375px — three columns of checkbox + contestant name in ~110px-wide columns will cram longer names and shrink tap targets well below comfortable touch-target size. Not directly measured this run (agent lost its session mid-scan before reaching this state), but visible in source and worth a manual check.

## Minor Observations

- The spoiler-mode toggle ([SpoilerBanner.tsx](src/components/SpoilerBanner.tsx) / `SpoilerToggle`) submits a server action with no client-side pending state — on a slow connection, a tap gives no immediate feedback that it registered.
- `AuthButtons.tsx`'s initials avatar (`<span>TP</span>`) has no `aria-label`; fine visually, weak for screen-reader users navigating by role.
- The tribe badge on `/contestant/[id]` (lines 60-64) uses inline `style` for background/text color instead of a Tailwind token — inconsistent with the rest of the theme's utility-class approach.
- `/sign-in` is a dead route that immediately defers to the root layout's fallback — functionally fine, but a bookmarked or shared link produces a brief flash of nothing before `SignInRequired` renders. Its own type scale (14/16/20/24px, 1.7:1 ratio) is flatter than the rest of the app, though it's a low-stakes page.
- `/draft`'s subtitle copy runs ~114 characters per line at desktop width — comfortably over the ~80-character readability guideline.
- One of the two assessments lost its authenticated test session mid-run while probing the signed-out `/sign-in` state (clearing the shared session cookie logged the tab out entirely), so the mobile hamburger menu's *opened* state and the draft page's mobile-width tribe grid weren't directly captured by the detector this run — flagged above from source reading instead of live measurement.

## Questions to Consider

- If spoiler-free mode is the app's whole emotional hook, why does the draft page — the highest-stakes screen, picks lock permanently — do nothing thematically different from a plain form? Where's the tribal-council tension in committing a roster?
- Is a flat checkbox grid really the best way to draft 6 contestants out of 12, or is there room for something that feels more like an actual draft, even in a self-service, no-turn-order model?
- The standings page is the front door people check every week — why does its current layout look like a debug view instead of the payoff screen?
