// Team names are free text (emoji welcome), editable any time, even after
// the draft locks. Length is counted in graphemes rather than UTF-16 code
// units, so a family emoji like 👨‍👩‍👧 counts as 1 character, not 8.
export const TEAM_NAME_MAX_LENGTH = 40;

export function graphemeLength(value: string): number {
  return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(value)).length;
}

/** Normalizes a submitted team name, or returns an error message. */
export function parseTeamName(raw: unknown): { ok: true; name: string } | { ok: false; error: string } {
  if (typeof raw !== "string") return { ok: false, error: "Team name is required" };

  // Drop control characters (newlines, tabs, etc.) but keep zero-width
  // joiners and variation selectors, which multi-part emoji depend on.
  const name = raw.replace(/[\p{Cc}]/gu, " ").replace(/\s+/g, " ").trim();

  if (name.length === 0) return { ok: false, error: "Team name can't be blank" };
  if (graphemeLength(name) > TEAM_NAME_MAX_LENGTH) {
    return { ok: false, error: `Team name must be ${TEAM_NAME_MAX_LENGTH} characters or fewer` };
  }
  return { ok: true, name };
}
