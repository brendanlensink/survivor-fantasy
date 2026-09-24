import { db } from "./db";
import { DEFAULT_SCORING_RULES, type ScoringRules } from "./scoring";

/**
 * Point values from the ScoringRule table, layered over the defaults so a
 * missing row (e.g. a rule added in code but not seeded yet) still scores
 * instead of producing NaN.
 */
export async function getScoringRules(): Promise<ScoringRules> {
  const rows = await db.scoringRule.findMany();
  const rules: ScoringRules = { ...DEFAULT_SCORING_RULES };
  for (const row of rows) {
    rules[row.key] = row.points;
  }
  return rules;
}
