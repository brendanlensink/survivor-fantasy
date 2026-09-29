import { describe, it, expect } from "vitest";
import { parseTeamName, graphemeLength, TEAM_NAME_MAX_LENGTH } from "./teamName";

describe("parseTeamName", () => {
  it("accepts emoji and trims whitespace", () => {
    expect(parseTeamName("  🔥 Torch Bearers 🏝️  ")).toEqual({ ok: true, name: "🔥 Torch Bearers 🏝️" });
  });

  it("collapses newlines and repeated spaces", () => {
    expect(parseTeamName("Blindside\n\n  Brigade")).toEqual({ ok: true, name: "Blindside Brigade" });
  });

  it("rejects blank and non-string names", () => {
    expect(parseTeamName("   ").ok).toBe(false);
    expect(parseTeamName(undefined).ok).toBe(false);
    expect(parseTeamName(42).ok).toBe(false);
  });

  it("counts multi-part emoji as one character", () => {
    expect(graphemeLength("👨‍👩‍👧")).toBe(1);
    expect(parseTeamName("👨‍👩‍👧".repeat(TEAM_NAME_MAX_LENGTH)).ok).toBe(true);
    expect(parseTeamName("👨‍👩‍👧".repeat(TEAM_NAME_MAX_LENGTH + 1)).ok).toBe(false);
  });
});
