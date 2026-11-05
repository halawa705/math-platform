/**
 * @file baseline-case-outcome-classifier.ts
 * @description يشغّل المسار الإنتاجي الحالي (دمج السياق ← المطابقة ← التحقق) على حالة ذهبية ويصنّف النتيجة بعلامات آلية.
 * لا يعدّل المحرك؛ هو أداة قياس فقط (المرحلة 0).
 */
import type { GoldenCorpusCase } from "./golden-corpus-case-types-ssot";
import { combineProblemAndTagGeometryContext } from "../description-intake/problem-geometry-context-extractor";
import { matchGeometryWithDiagnostics } from "../natural-arabic-geometry-matcher";
import { verifyGeometryFigure } from "../verification/geometry-figure-verification-orchestrator";
import { extractNumbersFromProblemText, extractNumbersShownOnFigure } from "./baseline-figure-number-extractor";

export const MODULE_ID_BASELINE_CASE_OUTCOME_CLASSIFIER = "baseline_case_outcome_classifier" as const;

/** فروع تبني شكلها من حقائق النص نفسها (لا قوالب ثابتة)، فلا تُعلَّم «from_fixed_catalog». */
const DATA_DRIVEN_BRANCH_IDS: ReadonlySet<string> = new Set(["primary_bar_model", "primary_analog_clock"]);

export type BaselineOutcomeKind =
  | "true_negative_no_figure"
  | "false_figure_on_no_figure_case"
  | "missed_figure"
  | "figure_clean"
  | "figure_flagged";

export type BaselineRiskFlag =
  | "missing_given_on_figure"
  | "leaked_number_not_in_text"
  | "verification_error"
  | "compositor_warnings"
  | "from_fixed_catalog"
  | "crashed";

export interface BaselineCaseResult {
  readonly caseId: string;
  readonly gradeId: string;
  readonly branchId: string;
  readonly outcome: BaselineOutcomeKind;
  readonly flags: readonly BaselineRiskFlag[];
  readonly source: "compositor" | "catalog" | "none";
  readonly figureBranchId?: string;
  readonly missingNumbers: readonly string[];
  readonly leakedNumbers: readonly string[];
  readonly details: readonly string[];
}

function expectedNumbersOf(testCase: GoldenCorpusCase): Set<string> {
  if (testCase.expectedGivenNumbers.length > 0) {
    return extractNumbersFromProblemText(testCase.expectedGivenNumbers.join(" "));
  }
  return extractNumbersFromProblemText(testCase.geometryRaw);
}

function emptyResult(c: GoldenCorpusCase, outcome: BaselineOutcomeKind, flags: BaselineRiskFlag[], details: string[]): BaselineCaseResult {
  return { caseId: c.id, gradeId: c.gradeId, branchId: c.branchId, outcome, flags, source: "none", missingNumbers: [], leakedNumbers: [], details };
}

export function classifyBaselineCase(testCase: GoldenCorpusCase): BaselineCaseResult {
  try {
    const combined = combineProblemAndTagGeometryContext(testCase.geometryRaw || undefined, testCase.problemText);
    const diag = matchGeometryWithDiagnostics(combined, `baseline_${testCase.id}`, "arabic");
    const figure = diag.figure;

    if (!figure) {
      const outcome = testCase.expectedOutcome === "no_figure" ? "true_negative_no_figure" : "missed_figure";
      return { ...emptyResult(testCase, outcome, [], [...diag.warnings]), source: diag.source };
    }

    const flags: BaselineRiskFlag[] = [];
    const details: string[] = [...diag.warnings];
    const textNumbers = extractNumbersFromProblemText(`${testCase.problemText} ${testCase.geometryRaw}`);
    const shown = extractNumbersShownOnFigure(figure);
    const missing = [...expectedNumbersOf(testCase)].filter((n) => !shown.has(n));
    const leaked = [...shown].filter((n) => !textNumbers.has(n));

    if (missing.length > 0) flags.push("missing_given_on_figure");
    if (leaked.length > 0) flags.push("leaked_number_not_in_text");
    const errors = verifyGeometryFigure(figure).issues.filter((i) => i.severity === "error");
    if (errors.length > 0) {
      flags.push("verification_error");
      details.push(...errors.map((e) => e.message));
    }
    if (diag.warnings.length > 0) flags.push("compositor_warnings");
    if (diag.source === "catalog" && !DATA_DRIVEN_BRANCH_IDS.has(figure.branchId)) flags.push("from_fixed_catalog");

    const outcome: BaselineOutcomeKind =
      testCase.expectedOutcome === "no_figure" ? "false_figure_on_no_figure_case" : flags.length > 0 ? "figure_flagged" : "figure_clean";
    return { caseId: testCase.id, gradeId: testCase.gradeId, branchId: testCase.branchId, outcome, flags, source: diag.source, figureBranchId: figure.branchId, missingNumbers: missing, leakedNumbers: leaked, details };
  } catch (error) {
    return emptyResult(testCase, "figure_flagged", ["crashed"], [String(error)]);
  }
}
