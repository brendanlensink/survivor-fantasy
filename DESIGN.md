---
name: Survivor Fantasy
description: A private Survivor fantasy league app, themed as a nighttime tribal council — wood, torch-ember, and parchment.
colors:
  wood-950: "#120d09"
  wood-900: "#1a1410"
  wood-800: "#211a13"
  wood-700: "#2a2118"
  wood-600: "#3a2f22"
  wood-500: "#584a37"
  ember: "#e8791a"
  ember-light: "#f0954a"
  ember-dark: "#c96513"
  blood: "#b23a1f"
  parchment: "#f0e6d2"
  parchment-muted: "#c9bfae"
  parchment-dim: "#8f8270"
  tribe-teal: "#3d6b8a"
  tribe-moss: "#7a8a3d"
  tribe-gold: "#c9a63d"
  tribe-violet: "#7a4a8e"
typography:
  display:
    fontFamily: "Oswald, sans-serif"
    fontWeight: 400
    letterSpacing: "0.02em"
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    lineHeight: "1.5"
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    letterSpacing: "0.05em"
  mono:
    fontFamily: "ui-monospace, monospace"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.ember}"
    textColor: "{colors.wood-950}"
    rounded: "{rounded.sm}"
    padding: "6px 16px"
  button-primary-hover:
    backgroundColor: "{colors.ember-light}"
  button-google:
    backgroundColor: "{colors.parchment}"
    textColor: "{colors.wood-950}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.parchment-dim}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  button-ghost-hover:
    textColor: "{colors.ember}"
  card:
    backgroundColor: "{colors.wood-800}"
    textColor: "{colors.parchment}"
    rounded: "{rounded.sm}"
    padding: "16px"
  tribe-badge:
    textColor: "{colors.parchment}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
---

# Design System: Survivor Fantasy

## Overview

**Creative North Star: "Tribal Council"**

The app is lit like a night tribal council: a near-black wood floor, one live torch (ember orange), and pale parchment for everything that needs to be read. It sits over a fixed, blurred photo of a Fiji beach — the world the app is about, kept out of focus so it never competes with the interface on top of it.

The system is deliberately utilitarian. Color is spent on one thing at a time — the active nav link's underline, a selected draft card's border, the one primary action on a screen — never spread across a page decoratively. Display type (Oswald, uppercase, tall and condensed even at its default weight) is reserved for headings, labels, and short bursts of ceremony; everything a player actually reads at length stays in a plain, compact sans body face. Flat by default: shadows appear only where something must visually float above the page (a dropdown menu), not as generic card depth.

Confirmed visual rejection: no second accent color competing with ember, no drop shadows as default card treatment, no "hero metric" widgets (a countdown is a sentence fragment, not an isolated number-and-label tile).

**Key Characteristics:**
- One accent color (ember) used sparingly and consistently for "this is active / selected / primary"
- Display type is condensed-caps Oswald at regular weight, not bold — the letterforms carry the weight, not the font-weight property
- Flat surfaces, hairline borders for separation, shadow reserved for floating overlays only
- A fixed, blurred photographic background behind an otherwise flat UI — atmosphere without competing for attention
- Numerals that matter (points, stats) always render in a monospace face for tabular alignment

## Colors

Predominantly a two-temperature palette — cold, dark wood neutrals against one warm ember accent — plus a small deterministic palette used only for tribe identity.

### Primary
- **Torch Ember** (`#e8791a`): the one accent. Active states, primary buttons, selected items, "this matters right now." Used on a small minority of any given screen — its rarity is what makes it legible as a signal.
- **Torch Ember Light** (`#f0954a`): hover state for ember surfaces.
- **Torch Ember Dark** (`#c96513`): reserved, currently unused in code but defined for a pressed/active variant.

### Secondary
- **Tribal Blood** (`#b23a1f`): the one other saturated color in the system, reserved for negative/elimination states (voted out, booted) — never used decoratively.

### Tertiary
The tribe-badge palette (`src/lib/tribeColors.ts`), assigned deterministically by hashing the tribe's name so the same tribe always gets the same color without a lookup table. Two of its six slots reuse Primary/Secondary (ember, blood); the other four are unique to this role:
- **Tribe Teal** (`#3d6b8a`)
- **Tribe Moss** (`#7a8a3d`)
- **Tribe Gold** (`#c9a63d`)
- **Tribe Violet** (`#7a4a8e`) — nudged from its original `#8a5a9e` this session to clear WCAG AA contrast against parchment text.

### Neutral
- **Deep Camp Char** (`#120d09`): the darkest wood step — currently unused directly (reserved for a future deepest-layer need).
- **Camp Char** (`#1a1410`): the page background.
- **Card Char** (`#211a13`): card and panel surfaces — the system's dominant "content sits here" color.
- **Ash Border** (`#2a2118`): hairline borders and row dividers inside cards.
- **Warm Border** (`#3a2f22`): slightly lighter borders, used for input/nav borders that need more separation than a row divider.
- **Parchment** (`#f0e6d2`): primary text on dark surfaces.
- **Parchment Muted** (`#c9bfae`): secondary text needing strong contrast (9.45:1 on Card Char).
- **Parchment Dim** (`#8f8270`): tertiary/de-emphasized text — captions, helper copy, table headers. Tuned this session to 4.58:1 against Card Char, clearing WCAG AA; do not darken it back toward its original `#8a7d6a` (4.27:1, fails AA).

### Named Rules
**The One Ember Rule.** The accent color marks exactly one thing per view: the active nav link, the selected card, the primary button. If a screen needs a second color to feel finished, that's a sign the hierarchy is unresolved, not a reason to add a color.

## Typography

**Display Font:** Oswald (with sans-serif fallback)
**Body Font:** the platform default sans-serif stack — no custom body font is loaded
**Label/Mono Font:** the platform default monospace stack, used only for numerals

**Character:** Oswald is condensed and tall; set in uppercase with wide tracking, it reads assertively even at its default weight (400) — the system never bolds it. Body text stays in a plain, unstyled sans face so it never competes with the display voice; the two are meant to feel like different registers (a headline versus a ledger entry), not a matched pair.

### Hierarchy
- **Display / Headline** (400, `text-3xl`/30px, uppercase, tracking-wide): page titles (`PageHeading`), the nav wordmark.
- **Title** (400, `text-xl`/20px, uppercase): section headings ("Your Picks", "Draft"), nav logo at smaller contexts.
- **Rank Numeral** (400, `text-2xl`/24px, Oswald, tabular): the standings list's position number — the one place display type sits inline with body content.
- **Body** (400, `text-sm`/14px): the dominant size for everything a player reads — labels, list items, table cells, helper copy.
- **Label** (500, `text-xs`/12px, `text-parchment-dim`, sometimes uppercase with tracking): table headers, captions, tribe/status tags.

No `text-base` or `text-lg` step is used anywhere — the scale deliberately skips the middle, jumping from label/body straight to title/display.

### Named Rules
**The Mono Numerals Rule.** Any number that represents a score, stat, or point value renders in the monospace stack (`font-mono`), never the body sans face — it's what makes columns of stats actually line up and read as data.

## Layout

A single centered column, capped at `max-w-4xl` (896px), padded `p-6`, sitting inside a semi-transparent black card (`bg-black/40 rounded-lg`) that floats over the fixed blurred photo background. The nav is a full-width bar above it, not part of the centered column.

Within that column, content is normally single-column and stacked. The one deliberate multi-column layout is the standings page: a `[1fr_280px]` grid pairing the team list with a Season Status side panel on `md` and above, collapsing to a single stacked column below it. Tribe/contestant grids (`/contestants`, the draft picker, admin team override) use a `1 → 2 → 3` column progression (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) rather than a fixed column count, so they never cram at narrow widths.

Spacing runs on Tailwind's default 4px-based scale, used almost entirely at the 8px/12px/16px/24px steps (`gap-2`/`gap-3`, `p-3`/`p-4`, `gap-4`/`gap-6`) — tight gaps within a card's own content, a full step up between sibling cards.

## Elevation & Depth

Flat by design. No card, button, or panel carries a shadow at rest — separation comes from a hairline border or a change in surface color (`wood-900` page vs. `wood-800` card), not depth cues. The two exceptions are both overlays that must visually float above page content: the mobile nav dropdown (`shadow-xl`) and the Google sign-in button (`shadow-sm`, matching Google's own brand button convention, not this system's).

### Named Rules
**The Flat-Unless-Floating Rule.** A surface gets a shadow only when it needs to read as detached from the page (a dropdown, an overlay) — never as decoration on an ordinary card.

## Shapes

Corners run a small, deliberate scale: `rounded` (4px) is the default for nearly everything — buttons, cards, inputs, badges. `rounded-md` (6px) marks the newer interactive surfaces built this session (draft contestant cards, the desktop nav's active-link pairing). `rounded-lg` (8px) is reserved for exactly one thing: the outermost page content container. `rounded-full` makes circular elements — the avatar-initials badge, tribe-color dots, tribe-badge pills.

Borders are 1px hairlines throughout (`border`, `border-wood-600`/`border-wood-700`), used generously for row and card separation in place of shadow. The one flagged exception is the standings list's `border-l-4` rank accent (`Leaderboard.tsx`) — a thicker colored left border, which the project's own design detector calls out as a common AI-generated-UI tell. It predates this file and was reviewed and deliberately kept as the app's existing rank-indicator language; it is not a pattern to extend elsewhere.

## Components

### Buttons
- **Shape:** `rounded` (4px) on every variant.
- **Primary:** `bg-ember` / `text-wood-950`, `px-4 py-1.5`, `text-sm font-medium`. Hover → `bg-ember-light`. Disabled → 40% opacity. The only button style used for a page's one primary action (Save picks, admin Save).
- **Google Sign-in:** `bg-parchment` / `text-wood-950`, `shadow-sm` — the one place this system borrows another brand's button convention rather than its own, because it must still read as "Sign in with Google."
- **Ghost / Toggle:** transparent background, `text-parchment-dim`, hover → `text-ember`. Used for the spoiler-mode toggle and nav links. The toggle variant shows a disabled + "…" pending state while its server action is in flight (`SpoilerToggleButton`).
- **Destructive:** no dedicated destructive button exists yet; `text-blood` marks destructive/negative *state* (booted, error text), not a button variant.

### Tribe Badges (signature)
- **Style:** small filled pill (`rounded`, `px-2 py-0.5`) on the contestant detail page; a bare `w-2.5 h-2.5 rounded-full` dot everywhere else (lists, headers, draft cards).
- **Color:** deterministic hash of the tribe name into the 6-color tribe palette (see Colors → Tertiary) — same tribe always gets the same color with no manual mapping.
- **Accessibility:** the dot form is `aria-hidden` — it's always paired with the tribe's name as visible text, so the color itself carries no information alone.

### Contestant Picker Card (signature)
- **Corner Style:** `rounded-md` (6px).
- **Default:** `border-wood-600`, `bg-wood-900/40`, `text-parchment-dim`.
- **Selected:** `border-ember`, `bg-wood-700`, `text-parchment`, plus a trailing ✓.
- **Structure:** a `<label>` wrapping a visually-hidden (`sr-only`) native checkbox, so keyboard/screen-reader behavior comes from the real form control while the card's border/background carries the visual state — not a custom ARIA widget.

### Cards / Containers
- **Corner Style:** `rounded` (4px); the one outer page wrapper uses `rounded-lg` (8px).
- **Background:** `bg-wood-800` almost universally — the system's one "content lives here" surface color.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** none by default; hairline `border-wood-600`/`border-wood-700` only where content needs internal division (table rows, tiebreaker section).
- **Internal Padding:** `p-3` for compact/grouped cards (tribe groups), `p-4` for standalone content cards.

### Inputs / Fields
- **Style:** `bg-wood-800`, `border border-wood-600`, `rounded`, `px-2 py-1.5`, `text-parchment`.
- **Labels:** persistent, associated via `htmlFor`/`id` (not placeholder-as-label).
- **Focus:** browser-default focus ring — not yet re-themed to the palette; a known gap, not a decision.
- **Disabled:** `opacity-40`, paired with a locked-state message rather than just visual dimming.

### Navigation (signature)
- **Style:** top bar, `bg-black/60`, wordmark in display type + `TorchIcon`.
- **Desktop:** plain text links; the active page gets a `border-b-2 border-ember` underline plus `text-ember` — no filled background, kept light for a top-level row.
- **Mobile:** collapses to a hamburger toggle; the drawer uses filled `rounded-md` rows (icon + label), with the active page getting `bg-wood-800`/`text-ember` — a heavier treatment than desktop's underline, appropriate for a drawer where rows already read as a list.
- **Icons:** a small set of hand-authored single-stroke SVGs (Trophy, Draft/clipboard, Cast/people, Admin/gear, Torch) — one consistent stroke weight (1.6–1.75), no icon library.

### Spoiler Banner (signature)
- **Style:** solid `bg-ember`/`text-wood-950` full-width bar — the one place the accent color fills a large area rather than marking a single element, because the banner's whole job is to be impossible to miss.
- **Behavior:** shown only while spoiler-free mode is on (the default); its toggle button shows a disabled/"…" pending state during the round-trip rather than no feedback at all.

### Season Status Panel (signature)
- **Style:** a plain `card`-style panel, text-only — deliberately not a "hero metric" widget (no isolated big number + small label). Countdown values (`21 days`) appear as `text-ember font-medium` spans inline within a sentence, not as a standalone stat tile.

### Stat Table
- **Style:** `border-collapse`, hairline `border-wood-700` row dividers, no zebra striping.
- **Numerals:** always `font-mono` (see Typography → Named Rules).
- **Jargon headers:** abbreviated headers (ChW/VFB/VAP) wrap in `<abbr title="…">` for a native hover tooltip, paired with a plain-text legend line below the table for touch users who can't hover.

## Do's and Don'ts

### Do:
- **Do** spend the ember accent on exactly one thing per view — an active link, a selected card, a primary button (The One Ember Rule).
- **Do** keep display type (Oswald, uppercase) to headings, labels, and the rank numeral; leave body copy in the plain sans stack at `text-sm`.
- **Do** render any score, stat, or point value in `font-mono` for tabular alignment (The Mono Numerals Rule).
- **Do** keep cards and panels flat at rest; reserve shadow for things that must visually float above the page (The Flat-Unless-Floating Rule).
- **Do** build any grid of cards/tiles as a `1 → 2 → 3` responsive progression (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), never a fixed column count.
- **Do** treat spoiler-free mode as a constraint on every new surface that could show an episode outcome, not just the standings page — hide behind a lock icon or placeholder copy, don't just omit the check.

### Don't:
- **Don't** add a colored left/right border as a card accent — the project's own detector flags this as a common AI-slop tell; the one existing instance (`Leaderboard.tsx`) was reviewed and kept as legacy, not license to add more.
- **Don't** introduce a second saturated accent color competing with ember for attention; blood-red stays reserved for negative/elimination state only.
- **Don't** build a "hero metric" tile (big isolated number, small label underneath) — write counts and countdowns as inline sentence fragments instead, as the Season Status panel does.
- **Don't** bold the display font for emphasis — Oswald's condensed letterforms already carry the weight at regular (400); reach for size or the ember accent instead.
