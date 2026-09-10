import { describe, it, expect } from "vitest";
import { scoreEpisode, scoreSeason, scoreTeam, DEFAULT_SCORING_RULES } from "./scoring";

describe("scoreEpisode", () => {
  it("rewards challenge wins and correct votes", () => {
    const points = scoreEpisode({
      contestantId: "a",
      episodeNumber: 1,
      challengeWins: 1,
      votesForBootee: 1,
      votesAgainstPlayer: 0,
      idolFound: false,
      idolPlayed: false,
      wentToTribal: true,
      wasBooted: false,
      wasImmune: false,
    });

    // 1 * 5 (challengeWin) + 2 (correctVote) + 1 (survived) = 8
    expect(points).toBe(8);
  });

  it("penalizes being voted out", () => {
    const points = scoreEpisode({
      contestantId: "a",
      episodeNumber: 1,
      challengeWins: 0,
      votesForBootee: 0,
      votesAgainstPlayer: 4,
      idolFound: false,
      idolPlayed: false,
      wentToTribal: true,
      wasBooted: true,
      wasImmune: false,
    });

    // 4 * -1 (votedAgainst) + -3 (booted) = -7
    expect(points).toBe(-7);
  });

  it("respects custom scoring rules", () => {
    const rules = { ...DEFAULT_SCORING_RULES, idolFound: 100 };
    const points = scoreEpisode(
      {
        contestantId: "a",
        episodeNumber: 1,
        challengeWins: 0,
        votesForBootee: 0,
        votesAgainstPlayer: 0,
        idolFound: true,
        idolPlayed: false,
        wentToTribal: false,
        wasBooted: false,
        wasImmune: false,
      },
      rules
    );
    expect(points).toBe(100);
  });
});

describe("scoreSeason + scoreTeam", () => {
  it("sums a team's contestants across multiple episodes", () => {
    const totals = scoreSeason([
      {
        contestantId: "a",
        episodeNumber: 1,
        challengeWins: 1,
        votesForBootee: 0,
        votesAgainstPlayer: 0,
        idolFound: false,
        idolPlayed: false,
        wentToTribal: false,
        wasBooted: false,
        wasImmune: false,
      },
      {
        contestantId: "a",
        episodeNumber: 2,
        challengeWins: 0,
        votesForBootee: 1,
        votesAgainstPlayer: 0,
        idolFound: false,
        idolPlayed: false,
        wentToTribal: true,
        wasBooted: false,
        wasImmune: false,
      },
      {
        contestantId: "b",
        episodeNumber: 1,
        challengeWins: 0.5,
        votesForBootee: 0,
        votesAgainstPlayer: 2,
        idolFound: false,
        idolPlayed: false,
        wentToTribal: true,
        wasBooted: false,
        wasImmune: false,
      },
    ]);

    const teamScore = scoreTeam(["a", "b"], totals);
    // a: 5 + (2 + 1) = 8, b: 2.5 + (-2) + 1 = 1.5 -> team total 9.5
    expect(teamScore).toBe(9.5);
  });
});
