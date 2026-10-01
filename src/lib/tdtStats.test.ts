import { describe, it, expect } from "vitest";
import { parseSeasonTable } from "./scraper";
import { mapScrapedStats, matchContestant } from "./tdtStats";

const CAST = [
  { id: "1", name: "Danny Kilby" },
  { id: "2", name: "Thien An Nguyen" },
  { id: "3", name: "Aaliyah Puglia" },
  { id: "4", name: "Lewis Kelly" },
  { id: "5", name: "Rob Antonson" },
];

// Header layout from S51 episode 1 (no reward challenge); rows trimmed.
const EPISODE_HTML = `
<html><head><title>Survivor 51, Episode 1 boxscore</title></head><body>
<table id="boxscore">
  <thead>
    <tr><th></th><th colspan="2">Immunity challenge</th><th colspan="4">Tribal Council stats</th><th colspan="2">Overall scores</th></tr>
    <tr><th>Contestant</th><th>ChW</th><th>ChA</th><th>VFB</th><th>VAP</th><th>TotV</th><th>TCA</th><th>SurvSc</th><th>SurvAv</th></tr>
  </thead>
  <tbody>
    <tr><td>Kilby</td><td>0.00</td><td>0.10</td><td>1</td><td>-</td><td>8</td><td>1</td><td>1.00</td><td>7.00</td></tr>
    <tr><td>Thien An</td><td>0.00</td><td>0.10</td><td>1</td><td>-</td><td>8</td><td>1</td><td>1.00</td><td>7.00</td></tr>
    <tr><td>Aaliyah</td><td>0.00</td><td>0.10</td><td>0*</td><td>6</td><td>8</td><td>1</td><td>-0.75</td><td>0.00</td></tr>
    <tr><td>Lewis</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>NA</td><td>NA</td></tr>
    <tr><td>Rob</td><td>0.10</td><td>0.10</td><td>-</td><td>-</td><td>-</td><td>-</td><td>NA</td><td>NA</td></tr>
  </tbody>
</table>
<p>Vote count: Aaliyah received 6 votes, from Brady, Kilby, Maggie, Mike, Patt, and Thien An (voted out, 6-2).</p>
</body></html>`;

describe("mapScrapedStats", () => {
  it("maps a pre-merge episode", () => {
    const { stats, unmatchedNames } = mapScrapedStats(parseSeasonTable(EPISODE_HTML, "test"), CAST);

    expect(unmatchedNames).toEqual([]);
    // Lewis was on exile with every stat blank, so he gets no row.
    expect(stats.map((s) => s.contestantId)).toEqual(["1", "2", "3", "5"]);

    const [kilby, , aaliyah, rob] = stats;
    expect(kilby).toMatchObject({ votesForBootee: 1, votesAgainstPlayer: 0, wentToTribal: true, wasBooted: false });
    expect(aaliyah).toMatchObject({ votesForBootee: 0, votesAgainstPlayer: 6, wentToTribal: true, wasBooted: true });
    // A tribe immunity win is fractional, so it isn't individual immunity.
    expect(rob).toMatchObject({ challengeWins: 0.1, challengeAppearances: 0.1, wentToTribal: false, wasImmune: false });
  });

  it("sums reward and immunity wins, and flags a full immunity win", () => {
    const html = `
      <table id="boxscore">
        <thead>
          <tr><th></th><th colspan="2">Reward challenge</th><th colspan="2">Immunity challenge</th><th colspan="4">Tribal Council stats</th><th>Overall scores</th></tr>
          <tr><th>Contestant</th><th>ChW</th><th>ChA</th><th>ChW</th><th>ChA</th><th>VFB</th><th>VAP</th><th>TotV</th><th>TCA</th><th>SurvSc</th></tr>
        </thead>
        <tbody>
          <tr><td>Rob</td><td>0.5</td><td>1</td><td>1</td><td>1</td><td>1</td><td>-</td><td>6</td><td>1</td><td>2.1</td></tr>
        </tbody>
      </table>`;
    const { stats } = mapScrapedStats(parseSeasonTable(html, "test"), CAST);

    expect(stats[0]).toMatchObject({ challengeWins: 1.5, challengeAppearances: 2, wasImmune: true });
  });

  it("reports names it can't match, including boots", () => {
    const html = EPISODE_HTML.replace("Kilby</td>", "Q</td>").replace("Aaliyah received", "Zed received");
    const { unmatchedNames } = mapScrapedStats(parseSeasonTable(html, "test"), CAST);

    expect(unmatchedNames.sort()).toEqual(["Q", "Zed"]);
  });
});

describe("matchContestant", () => {
  it("matches first names, multi-word first names, and last names", () => {
    expect(matchContestant("Rob", CAST)?.id).toBe("5");
    expect(matchContestant("Thien An", CAST)?.id).toBe("2");
    expect(matchContestant("Kilby", CAST)?.id).toBe("1");
    expect(matchContestant("Kyle*", [{ id: "9", name: "Kyle Fraser" }])?.id).toBe("9");
  });

  it("refuses to guess between two contestants", () => {
    const cast = [...CAST, { id: "6", name: "Rob Mariano" }];
    expect(matchContestant("Rob", cast)).toBeNull();
  });
});
