/**
 * @file geometry-tri-state-decision-gate.ts
 * @description بوابة القرار الثلاثي الصارم (المرحلة 2 - الفحوص الثلاثة 3.7 والقرار الثلاثي 3.8):
 * تجمع نتائج الفحوص الثلاثة:
 * 1. إعادة قياس الأبعاد والزوايا من الشكل المرسوم (`verifyGeometryFigure`).
 * 2. فحص اكتمال جميع المعطيات وعدم نقصانها (`findMissingDimensionalGivensOnFigure`).
 * 3. فحص عدم وجود زيادات أو تسريب للحل (`checkFigureFidelityToPrompt` + `verifyNoSolutionLeakOnFigure`).
 * ثم تصدر القرار الثلاثي الموحد:
 * - `green`: معتمد فوراً للتصدير والطباعة.
 * - `yellow`: نقص أو التباس قابل للإصلاح السريع بتحرير قائمة الحقائق.
 * - `red`: مرفوض نهائياً (بلا شكل) مع السبب الدقيق.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 140 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  FigureTriStateDecision,
} from "../../ssot/geometry-archetype-ssot";
import { checkFigureFidelityToPrompt } from "./geometry-figure-fidelity-gate";
import { verifyGeometryFigure } from "./geometry-figure-verification-orchestrator";
import { verifyNoSolutionLeakOnFigure } from "./geometry-solution-leak-guard";

export const MODULE_ID_GEOMETRY_TRI_STATE_DECISION_GATE =
  "geometry_tri_state_decision_gate" as const;

export interface TriStateFigureEvaluation {
  readonly decision: FigureTriStateDecision;
  readonly passedAllThreeChecks: boolean;
  readonly check1MeasurementPassed: boolean;
  readonly check2CompletenessPassed: boolean;
  readonly check3NoExtrasOrLeakPassed: boolean;
  readonly reasons: readonly string[];
}

/**
 * يقيّم الشكل الهندسي عبر الفحوص الثلاثة الصارمة ويُصدر القرار الثلاثي (`green` | `yellow` | `red`).
 */
export function evaluateFigureTriStateDecision(
  figure: CanonicalGeometryFigureIR | undefined | null,
  rawPromptOrDescription: string,
  compositorWarnings: readonly string[] = [],
  ignoreScaleErrorForLockedBranch = false
): TriStateFigureEvaluation {
  if (!figure) {
    const hasFixableFactWarning = compositorWarnings.some((w) =>
      w.includes("لم يُفهم السطر") || w.includes("غير معرّفتين") || w.includes("غير معرّفة")
    );
    return {
      decision: hasFixableFactWarning ? "yellow" : "red",
      passedAllThreeChecks: false,
      check1MeasurementPassed: false,
      check2CompletenessPassed: false,
      check3NoExtrasOrLeakPassed: false,
      reasons:
        compositorWarnings.length > 0
          ? compositorWarnings
          : ["تعذر توليد شكل هندسي مطابق للمسألة."],
    };
  }

  // الفحص 1: إعادة القياس الهندسي والبصري
  const verificationReport = verifyGeometryFigure(figure);
  const measurementErrors = verificationReport.issues.filter(
    (i) =>
      i.severity === "error" &&
      (!ignoreScaleErrorForLockedBranch || (i.rule !== "length-scale" && i.rule !== "length-order"))
  );
  const check1MeasurementPassed = measurementErrors.length === 0;

  // الفحص 2 و 3: الاكتمال وعدم الزيادات وعدم تسريب الحل
  const fidelity = checkFigureFidelityToPrompt(figure, rawPromptOrDescription);
  const leakCheck = verifyNoSolutionLeakOnFigure(figure, rawPromptOrDescription);

  const check2CompletenessPassed = fidelity.missingNumbers.length === 0;
  const check3NoExtrasOrLeakPassed =
    !fidelity.isPurelyTheoretical &&
    fidelity.alienNumbers.length === 0 &&
    fidelity.alienVertices.length / Math.max(figure.vertices.length, 1) < 0.35 &&
    leakCheck.passed;

  const hasParallelProofGoal =
    /(?:أثبت|اثبت|بيّن|بين|برهن).*?(?:توازي|\\parallel|\/\/|\|\|)/i.test(rawPromptOrDescription);
  const hasParallelPremise =
    (/(?:[A-Z]{2}|[أ-ي]ـ?\s*[أ-ي]ـ?)\s*(?:\/\/|\\parallel|\|\|)/i.test(rawPromptOrDescription) ||
      /إذا\s*كان.*?(?:توازي|متوازيان|متوازيين|يوازي)/i.test(rawPromptOrDescription)) &&
    !hasParallelProofGoal;
  const parallelCheckPassed =
    !hasParallelPremise || figure.segments.some((s) => (s.parallelArrows ?? 0) > 0);

  const passedAllThreeChecks =
    check1MeasurementPassed &&
    check2CompletenessPassed &&
    check3NoExtrasOrLeakPassed &&
    parallelCheckPassed &&
    compositorWarnings.length === 0;

  if (passedAllThreeChecks) {
    return {
      decision: "green",
      passedAllThreeChecks: true,
      check1MeasurementPassed: true,
      check2CompletenessPassed: true,
      check3NoExtrasOrLeakPassed: true,
      reasons: [],
    };
  }

  const reasons: string[] = [
    ...compositorWarnings,
    ...fidelity.reasons,
    ...leakCheck.reasons.filter((r) => !fidelity.reasons.includes(r)),
    ...measurementErrors.map((e) => `تحقق القياس: ${e.message}`),
  ];
  if (!parallelCheckPassed) {
    reasons.push("المسألة تتضمن مستقيمات متوازية ولكن الشكل لا يحتوي على علامات أو أسهم التوازي.");
  }

  // المسائل النظرية أو تسريب الحل أو تشوه الرؤوس ← أحمر قاطع (red)
  // أما نقص معطى أو سطر غير مفهوم قابل لإعادة الصياغة في قائمة الحقائق ← أصفر (yellow)
  const isHardRed =
    fidelity.isPurelyTheoretical ||
    !check3NoExtrasOrLeakPassed ||
    !check1MeasurementPassed ||
    !parallelCheckPassed;

  return {
    decision: isHardRed ? "red" : "yellow",
    passedAllThreeChecks: false,
    check1MeasurementPassed,
    check2CompletenessPassed,
    check3NoExtrasOrLeakPassed,
    reasons,
  };
}
