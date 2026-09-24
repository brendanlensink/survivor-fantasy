import PageHeading from "@/components/PageHeading";
import { scoreEpisode, type StatLine } from "@/lib/scoring";
import { getScoringRules } from "@/lib/scoringRules";

export const dynamic = "force-dynamic";

// Plain-language explanation of each rule key, in display order. Point
// values come from the ScoringRule table, so they're never written here.
const RULE_DETAILS: { key: string; label: string; description: string; unit?: string }[] = [
  {
    key: "challengeWinPoint",
    label: "Challenge win",
    description:
      "Split across everyone who won, so each member of a 5-person tribe that wins gets a fifth of this. Covers reward and immunity challenges.",
    unit: "per win",
  },
  {
    key: "immunityWin",
    label: "Individual immunity",
    description: "A bonus for winning individual immunity, on top of the challenge win itself.",
  },
  {
    key: "correctVote",
    label: "Voting with the boot",
    description: "For each vote cast for the person who went home.",
    unit: "per vote",
  },
  {
    key: "votedAgainst",
    label: "Votes against",
    description: "For each vote cast against the contestant, whether or not they went home.",
    unit: "per vote",
  },
  { key: "idolFound", label: "Idol found", description: "Finding a hidden immunity idol." },
  {
    key: "idolPlayed",
    label: "Idol played",
    description: "Playing an idol at tribal, whether or not it ended up saving anyone.",
  },
  {
    key: "survivedEpisode",
    label: "Survived tribal",
    description:
      "Going to tribal council and not being voted out. Skipping tribal (e.g. your tribe won immunity) doesn't earn this.",
  },
  { key: "wasBootedPenalty", label: "Voted out", description: "Being voted out of the game." },
];

const BASE_STAT: Omit<StatLine, "contestantId" | "episodeNumber"> = {
  challengeWins: 0,
  votesForBootee: 0,
  votesAgainstPlayer: 0,
  idolFound: false,
  idolPlayed: false,
  wentToTribal: false,
  wasBooted: false,
  wasImmune: false,
};

// Worked examples, scored live with the current rules so they can't drift.
const EXAMPLES: { title: string; description: string; stat: Partial<StatLine> }[] = [
  {
    title: "Post-merge immunity winner",
    description: "Wins individual immunity, goes to tribal, votes with the majority and gets no votes.",
    stat: { challengeWins: 1, wasImmune: true, wentToTribal: true, votesForBootee: 1 },
  },
  {
    title: "Tribe wins immunity",
    description: "A member of a 5-person tribe that wins immunity and skips tribal.",
    stat: { challengeWins: 0.2 },
  },
  {
    title: "Voted out 5–1",
    description: "Goes to tribal, votes for someone else, and goes home with 5 votes against.",
    stat: { wentToTribal: true, wasBooted: true, votesAgainstPlayer: 5 },
  },
];

function formatPoints(points: number) {
  const rounded = Math.round(points * 100) / 100;
  return rounded > 0 ? `+${rounded}` : rounded < 0 ? `−${Math.abs(rounded)}` : "0";
}

export default async function ScoringPage() {
  const rules = await getScoringRules();

  return (
    <div>
      <PageHeading subtitle="Every contestant earns points each episode from what they did on the show. Your team's score is the total for everyone you drafted.">
        Scoring
      </PageHeading>

      <div className="space-y-6">
        <section className="bg-wood-800 rounded p-4">
          <h2 className="text-xs font-medium uppercase tracking-wide text-parchment-dim mb-3">Points per episode</h2>
          <table className="text-left border-collapse text-sm w-full">
            <tbody>
              {RULE_DETAILS.map((rule) => {
                const points = rules[rule.key] ?? 0;
                return (
                  <tr key={rule.key} className="border-b border-wood-700 last:border-b-0 align-top">
                    <td className="py-2.5 pr-4">
                      <div className="text-parchment font-medium">{rule.label}</div>
                      <div className="text-parchment-dim text-xs mt-0.5 max-w-prose">{rule.description}</div>
                    </td>
                    <td className="py-2.5 pl-3 text-right whitespace-nowrap">
                      <span className={`font-mono ${points < 0 ? "text-blood" : "text-ember"}`}>
                        {formatPoints(points)}
                      </span>
                      {rule.unit && <div className="text-parchment-dim text-xs">{rule.unit}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="bg-wood-800 rounded p-4">
          <h2 className="text-xs font-medium uppercase tracking-wide text-parchment-dim mb-3">Examples</h2>
          <ul className="space-y-3 text-sm">
            {EXAMPLES.map((example) => {
              const points = scoreEpisode(
                { contestantId: "example", episodeNumber: 0, ...BASE_STAT, ...example.stat },
                rules
              );
              return (
                <li key={example.title} className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-parchment font-medium">{example.title}</div>
                    <div className="text-parchment-dim text-xs mt-0.5">{example.description}</div>
                  </div>
                  <span className={`font-mono whitespace-nowrap ${points < 0 ? "text-blood" : "text-ember"}`}>
                    {formatPoints(points)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="bg-wood-800 rounded p-4">
          <h2 className="text-xs font-medium uppercase tracking-wide text-parchment-dim mb-3">Ties in the standings</h2>
          <p className="text-sm text-parchment-muted mb-2">Teams with the same points are ordered by:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-parchment-muted">
            <li>Whoever correctly picked the season winner.</li>
            <li>Whoever's guess for the total number of idols played is closest.</li>
          </ol>
          <p className="text-parchment-dim text-xs mt-3">
            You answer both when you submit your draft. They're settled after the finale.
          </p>
        </section>
      </div>
    </div>
  );
}
