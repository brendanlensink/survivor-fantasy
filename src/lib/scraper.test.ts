import { describe, it, expect } from "vitest";
import { parseSeasonTable } from "./scraper";

// Header layouts copied from the real TDT pages; data rows are made up.
const IN_SEASON_HTML = `
<table id="boxscore">
  <thead>
    <tr><th></th><th colspan="2">Reward challenge</th><th colspan="2">Immunity challenge</th><th colspan="4">Tribal Council stats</th><th colspan="2">Overall scores</th></tr>
    <tr><th>Contestant</th><th>ChW</th><th>ChA</th><th>ChW</th><th>ChA</th><th>VFB</th><th>VAP</th><th>TotV</th><th>TCA</th><th>SurvSc</th><th>SurvAv</th></tr>
  </thead>
  <tbody>
    <tr><td><a href="/p/brady">Brady</a></td><td>0.5</td><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>2.1</td><td>2.1</td></tr>
  </tbody>
</table>`;

const FINISHED_HTML = `
<table id="boxscore">
  <thead>
    <tr><th></th><th colspan="2">Overall scores</th><th colspan="4">Challenge stats</th><th colspan="2">Tribal council stats</th></tr>
    <tr><th>Contestant</th><th>SurvSc</th><th>SurvAv</th><th>ChW</th><th>ChA</th><th>ChW%</th><th>SO</th><th>VFB</th><th>VAP</th></tr>
  </thead>
  <tbody>
    <tr><td>Rob</td><td>5.0</td><td>0.4</td><td>3.5</td><td>10</td><td>35%</td><td>0</td><td>4</td><td>2</td></tr>
  </tbody>
</table>`;

// Post-merge pages split the box score into two tables that both use
// id="boxscore", and only list booted players in the second one.
const POST_MERGE_HTML = `
<html><head><title>Survivor 50, Episode 11 boxscore</title></head><body>
<table id="boxscore">
  <thead>
    <tr><th></th><th colspan="4">Immunity challenge</th><th colspan="1">Overall score</th></tr>
    <tr><th>Contestant</th><th>ChW</th><th>ChA</th><th>Plc</th><th>% Fin</th><th>MPF</th></tr>
  </thead>
  <tbody>
    <tr><td>Jonathan</td><td>1</td><td>1</td><td>1</td><td>1.00</td><td>68.0%</td></tr>
    <tr><td>Ozzy</td><td>0</td><td>1</td><td>4</td><td>0.57</td><td>84.5%</td></tr>
  </tbody>
</table>
<table id="boxscore">
  <thead>
    <tr><th></th><th colspan="4">Tribal Council stats</th><th colspan="2">Overall scores</th></tr>
    <tr><th>Contestant</th><th>VFB</th><th>VAP</th><th>TotV</th><th>TCA</th><th>SurvSc</th><th>SurvAv</th></tr>
  </thead>
  <tbody>
    <tr><td>Jonathan</td><td>1</td><td>-</td><td>11</td><td>2</td><td>0.77</td><td>5.19</td></tr>
    <tr><td>Ozzy</td><td>0</td><td>4</td><td>5</td><td>1</td><td>0.77</td><td>2.81</td></tr>
    <tr><td>Kyle*</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-0.25</td><td>0.19</td></tr>
  </tbody>
</table>
<p>Vote count (1st Tribal): Emily received 2 votes, from Cirie and Cirie (voted out, 2-2-[0]; 4-2).
Cirie received 2 votes, from Emily and Rick.</p>
<p>Vote count (2nd Tribal): Ozzy received 4 votes, from Aubry, Joe, Jonathan, and Rizo (voted out, 4-1).
Aubry received 1 vote, from Ozzy.</p>
</body></html>`;

describe("parseSeasonTable", () => {
  it("keeps reward and immunity challenge columns separate on the in-season page", () => {
    const result = parseSeasonTable(IN_SEASON_HTML, "test");
    const brady = result.rows[0];

    expect(result.headers).toContain("Reward challenge ChW");
    expect(result.headers).toContain("Immunity challenge ChW");
    expect(result.headers).not.toContain("ChW");
    expect(brady.raw["Reward challenge ChW"]).toBe("0.5");
    expect(brady.raw["Immunity challenge ChW"]).toBe("1");
    expect(brady.raw["VFB"]).toBe("0");
    expect(brady.profileUrl).toBe("/p/brady");
  });

  it("leaves unique column names bare on the finished-season page", () => {
    const result = parseSeasonTable(FINISHED_HTML, "test");

    expect(result.headers).toEqual(["Contestant", "SurvSc", "SurvAv", "ChW", "ChA", "ChW%", "SO", "VFB", "VAP"]);
    expect(result.rows[0].raw["ChW"]).toBe("3.5");
  });

  it("joins the split post-merge tables on contestant name", () => {
    const result = parseSeasonTable(POST_MERGE_HTML, "test");

    expect(result.headers).toEqual([
      "Contestant", "ChW", "ChA", "Plc", "% Fin", "MPF", "VFB", "VAP", "TotV", "TCA", "SurvSc", "SurvAv",
    ]);
    expect(result.columns["ChW"].group).toBe("Immunity challenge");
    expect(result.rows.map((r) => r.name)).toEqual(["Jonathan", "Ozzy", "Kyle*"]);
    expect(result.rows[1].raw).toMatchObject({ ChW: "0", VAP: "4", TCA: "1" });
  });

  it("reads the episode number from the title and boots from the vote counts", () => {
    const result = parseSeasonTable(POST_MERGE_HTML, "test");

    expect(result.episodeNumber).toBe(11);
    // Cirie's sentence sits between the two boots but isn't one.
    expect(result.bootedNames).toEqual(["Emily", "Ozzy"]);
  });

  it("fails loudly when repeated columns have no group to tell them apart", () => {
    const html = `
      <table id="boxscore">
        <tr><th>Contestant</th><th>ChW</th><th>ChW</th><th>SurvSc</th><th>VFB</th><th>VAP</th></tr>
        <tr><td>Ana</td><td>1</td><td>0</td><td>1</td><td>0</td><td>0</td></tr>
      </table>`;

    expect(() => parseSeasonTable(html, "test")).toThrow(/repeated columns/);
  });

  it("fails loudly when expected columns are missing", () => {
    const html = `<table id="boxscore"><tr><th>Contestant</th><th>Foo</th></tr></table>`;

    expect(() => parseSeasonTable(html, "test")).toThrow(/missing expected headers/);
  });
});
