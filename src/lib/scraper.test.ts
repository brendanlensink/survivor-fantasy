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
