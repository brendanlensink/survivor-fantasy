import { describe, it, expect } from "vitest";
import { rankLeaderboard } from "./leaderboard";

describe("rankLeaderboard", () => {
  it("sorts by points descending when there's no tie", () => {
    const ranked = rankLeaderboard(
      [
        { teamId: "a", points: 10, winnerPredictionId: null, idolsPlayedGuess: null },
        { teamId: "b", points: 20, winnerPredictionId: null, idolsPlayedGuess: null },
      ],
      null,
      0
    );
    expect(ranked.map((e) => e.teamId)).toEqual(["b", "a"]);
  });

  it("breaks a points tie in favor of the correct winner pick", () => {
    const ranked = rankLeaderboard(
      [
        { teamId: "wrong", points: 10, winnerPredictionId: "contestant-2", idolsPlayedGuess: null },
        { teamId: "right", points: 10, winnerPredictionId: "contestant-1", idolsPlayedGuess: null },
      ],
      "contestant-1",
      0
    );
    expect(ranked.map((e) => e.teamId)).toEqual(["right", "wrong"]);
  });

  it("falls back to closest idols-played guess when winner picks tie (both right or both wrong)", () => {
    const ranked = rankLeaderboard(
      [
        { teamId: "far", points: 10, winnerPredictionId: "contestant-1", idolsPlayedGuess: 2 },
        { teamId: "close", points: 10, winnerPredictionId: "contestant-1", idolsPlayedGuess: 5 },
      ],
      "contestant-1",
      6
    );
    expect(ranked.map((e) => e.teamId)).toEqual(["close", "far"]);
  });

  it("treats a missing idols guess as an infinitely bad tiebreak", () => {
    const ranked = rankLeaderboard(
      [
        { teamId: "no-guess", points: 10, winnerPredictionId: null, idolsPlayedGuess: null },
        { teamId: "has-guess", points: 10, winnerPredictionId: null, idolsPlayedGuess: 100 },
      ],
      null,
      6
    );
    expect(ranked.map((e) => e.teamId)).toEqual(["has-guess", "no-guess"]);
  });

  it("doesn't apply the winner tiebreak when the actual winner is unknown yet", () => {
    const ranked = rankLeaderboard(
      [
        { teamId: "a", points: 10, winnerPredictionId: "contestant-1", idolsPlayedGuess: 10 },
        { teamId: "b", points: 10, winnerPredictionId: "contestant-2", idolsPlayedGuess: 1 },
      ],
      null,
      1
    );
    // Winner unknown -> both "incorrect" -> falls through to idols guess.
    expect(ranked.map((e) => e.teamId)).toEqual(["b", "a"]);
  });
});
