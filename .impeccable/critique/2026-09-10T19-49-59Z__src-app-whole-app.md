---
target: whole app
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
timestamp: 2026-09-10T19-49-59Z
slug: src-app-whole-app
---
Method: dual-agent (A: a2d03190b9bb35959 · B: a3c5173d801f5b21b) + parent verification pass

This is a re-critique. The previous run (2026-09-10T19:09:41Z) scored **18/40 (Poor)** with 1 P0 and 3 P1. A round of fixes shipped since (routing encoding, contrast, desktop nav active state, standings/draft redesign, scoring legend, accessibility polish). Both assessments re-scored from scratch rather than assuming the fixes worked — and in synthesis, several of Assessment B's headline findings turned out not to hold up under my own direct verification. Details below.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Revised up from Assessment A's 2 — see **Verification note** below; the underlying "wrong state" finding was a misread, not a bug. Draft save and the spoiler toggle both show real pending/success feedback now. |
| 2 | Match Between System and Real World | 3 | Copy is plain and correctly scoped ("Hidden until the draft locks", the ChW/VFB/VAP legend). |
| 3 | User Control and Freedom | 3 | Picks freely toggle pre-lock; no undo needed since state is just checkbox toggles. |
| 4 | Consistency and Standards | 2 | Confirmed real: negative episode points (e.g. a booted contestant's -7.0) render in ember, the same color as positive scores, despite DESIGN.md reserving blood-red for negative/elimination state. |
| 5 | Error Prevention | 3 | Draft "Save picks" stays disabled until exactly 2-per-tribe + both tiebreakers are filled. |
| 6 | Recognition Rather Than Recall | 3 | Per-tribe torch pips and inline "X of 2 picked" remove the need to count manually. |
| 7 | Flexibility and Efficiency of Use | 2 | No filter/search on the cast list or draft picker; fine at 12 placeholder contestants, won't scale past a real ~18-20 person cast. |
| 8 | Aesthetic and Minimalist Design | 3 | Flat cards, single accent, restrained type scale — matches its own now-documented system well. |
| 9 | Help Users Recognize/Diagnose/Recover from Errors | 2 | Draft error path shows only the raw `data.error` string, no recovery guidance. Pre-existing, not new this round. |
| 10 | Help and Documentation | 1 | No contextual help beyond the one stat-table legend — no tooltip on tiebreakers, no "what do points mean" link. |
| **Total** | | **25/40** | **Acceptable** — up from 18/40 (Poor) last run |

## Design Specificity Verdict

**LLM assessment**: Genuinely specific now, not a generic template with a paint job. The tribal-council night palette, hairline-flat cards, torch iconography, and — most importantly — spoiler-free mode as a structural constraint (hiding rank order, points, and stat tables outright, not just blurring the standings) are decisions a generic "fantasy tracker" wouldn't make. The tribe color-dot system paired with `<abbr>`-tooltipped stat headers reads as built for this exact domain.

**Deterministic scan**: `detect.mjs` against `src/app` and `src/components` — exit code 2, one finding, unchanged from last run:
- `side-tab` (warning) × 1 — [Leaderboard.tsx:45](src/components/Leaderboard.tsx:45), `border-l-4`. Reviewed twice now (this run and last) and deliberately kept; DESIGN.md documents it explicitly as legacy, not a pattern to extend.

**Verification note — three reported findings did not hold up:**
- Assessment A flagged the nav's spoiler toggle as showing the wrong state ("reads 'Spoilers on — turn off' while spoiler-free mode is disabled"). I read [NavMenu.tsx:60-66](src/components/NavMenu.tsx:60) directly: the button only renders `{!spoilerFree && ...}` — i.e. exactly when real spoilers are currently showing, correctly labeled "Spoilers on — turn off" to mean "click to hide them again." This is correct by design, not a bug — the agent conflated "spoiler-free mode" with "spoilers."
- Assessment B reported the mobile hamburger button navigating straight to `/` instead of opening the drawer, and a `text-occlusion` finding from the drawer staying open across a route change. I tested both directly: clicking the actual button via JS toggles `aria-expanded` correctly with no navigation, and every nav link is a plain `<a href>` (not client-side routed), so a full page load always resets the drawer to closed — it structurally cannot stay open across a navigation. Neither reproduced; most likely tool/coordinate-click artifacts from the agent's browser automation, not app defects.
- Assessment B's `low-contrast` 4.3:1 finding (the same one from last run) initially looked unfixed when I checked it myself — computed style showed the *old* color (`rgb(138,125,106)` / `#8a7d6a`) even though `tailwind.config.ts` on disk correctly has this session's fix (`#8f8270`). Root cause: this session's long-running dev server hadn't picked up the Tailwind config change. I restarted it (cleared `.next`, relaunched) and re-verified — computed style now correctly reads `rgb(143,130,112)` / `#8f8270`, which clears AA (4.58:1). Real defect, but in the dev environment's cache, not the code; a fresh production build would never have shown it.

**Browser overlays**: injection ran and returned console findings across multiple pages, but per the notes above, several of those readings were stale or misattributed. No overlay is currently visible in your browser pane — the tab was reloaded during verification.

## Overall Impression

Meaningfully better than last time, and honestly so — not just a higher number. The standings page stopped looking like a debug view, the draft flow's contestant cards replaced a bare checkbox list, the scoring jargon has a legend, and the P0 routing bug is gone. The score moved from Poor to Acceptable on real, verified fixes. What's left is smaller and more specific: one color-consistency miss (negative points), a missing mobile-drawer backdrop, and the long-standing lack of in-app help for a first-time player. Nothing found this round threatens the "spoiler safety" promise the product is actually built around.

## What's Working

- **Contestant Picker Card** ([DraftForm.tsx](src/components/DraftForm.tsx)): a `<label>`-wrapped `sr-only` checkbox with all visual state carried by border/background — accessible by construction, not a custom ARIA widget bolted on afterward.
- **Spoiler-free mode holds up under direct inspection**: verified live on `/contestant/[id]` that the stat table is fully replaced by placeholder copy, not partially redacted — the app lives up to its own cross-cutting constraint rather than only enforcing it on the standings page.
- **The stat-table legend** (`<abbr>` + a plain-text line below): a real accommodation for touch users who can't hover, not just a hover tooltip that quietly excludes them.

## Priority Issues

**[P2] Negative episode points render in the positive-coded accent color**
- Why it matters: [contestant/[id]/page.tsx:113](src/app/contestant/[id]/page.tsx:113) and [team/[id]/page.tsx:92](src/app/team/[id]/page.tsx:92) render every per-episode point value in `text-ember` regardless of sign. `scoring.ts` can genuinely produce negative episode totals (a booted contestant nets `wasBootedPenalty: -3` plus `votedAgainst` per vote). DESIGN.md explicitly reserves blood-red for negative/elimination state; this is the one place a negative number doesn't get it.
- Fix: conditionally class per-episode point cells `text-blood` when the value is negative.
- Suggested command: `/impeccable polish`

**[P2] Mobile nav drawer has no backdrop scrim**
- Why it matters: confirmed in [NavMenu.tsx](src/components/NavMenu.tsx) — the open drawer has no dimming overlay behind it, so page content sits directly against its bottom edge with nothing separating "menu" from "page" visually, and no tap-outside-to-close affordance.
- Fix: add a `bg-black/50` backdrop element under the drawer (`z-10`, below the drawer's `z-20`) that also closes the menu on click.
- Suggested command: `/impeccable polish`

**[P3] Cast/tribe lists sort contestant names lexicographically, not numerically**
- Why it matters: with the current placeholder cast, Tribe C lists as "Contestant 10, 11, 12, 9" — a naive string sort. Harmless now and very likely moot once real Survivor 51 names replace the placeholders, but visible today on `/contestants` and the draft picker.
- Fix: low priority — only worth a real fix if any future ordering is meant to imply something (draft priority, etc.); otherwise this resolves itself with real cast data.
- Suggested command: `/impeccable polish` (low priority)

**[P3] Draft save error path is underspecified**
- Why it matters: `DraftForm.tsx` surfaces only `data.error ?? "Draft failed"` with no guidance on what to do next (retry vs. contact commissioner). Rare path (e.g. picks locked mid-submit) but a real dead end when it happens. Carried over from the original critique, not newly found.
- Fix: add one line of recovery copy alongside the raw error.
- Suggested command: `/impeccable clarify`

## Persona Red Flags

**Jordan (Confused First-Timer)**: still no in-app explanation of how points are earned beyond the one stat-table legend — no link from the draft or standings pages to "how scoring works." Unchanged from last run.

**Sam (Accessibility-Dependent User)**: the contrast fix is real and verified (4.58:1) once the dev server serves current code — worth a production-build sanity check before relying on this, given how easily a stale local cache masked it here. No new accessibility regressions found this round.

**Casey (Distracted Mobile User)**: the signed-in user row in the mobile drawer ("Test Player" + avatar + sign-out icon) lays out cleanly at 375px with no wrapping — the earlier fix held. The missing backdrop scrim (P2 above) is this persona's actual remaining friction point, not anything that broke.

## Minor Observations

- The `Leaderboard.tsx` rank-accent left border remains the single most "template-y" visual element in the app, per its own DESIGN.md callout — reviewed and kept twice now, but worth a fresh look if you ever revisit `Leaderboard.tsx` for other reasons.
- `/team/[id]`'s "Hidden until the draft locks" tiebreaker copy is a good, quiet reassurance pattern — more of this at the draft-lock moment specifically (the highest-stakes screen) would reinforce it.
- No filter/search exists on the cast or draft picker lists — fine at today's 12-contestant placeholder scale, worth revisiting once a real ~18-20 person cast loads.

## Questions to Consider

- Was the negative-points color gap a deliberate stance (blood reserved only for booted/eliminated *status*, not point deltas) or simply missed when the picker cards got their pass this session? Worth settling explicitly either way.
- If picks stay private until the draft locks (per PRODUCT.md), is that privacy a comfort for your 9-20 person league, or a source of end-of-draft anxiety worth designing for (e.g. a "how many people have finished drafting" count with no names)?
- Given how easily a stale dev-server cache masked a real, already-fixed contrast issue in this very re-critique — is it worth a quick production-build check before treating any "still failing" detector finding as gospel going forward?
