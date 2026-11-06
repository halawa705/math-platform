/**
 * @file golden-figure-spec-comparator.ts
 * @description مقارِن آلي لمواصفة الشكل الهندسي المرجعي (المرحلة 0.1): يقارن الكائن IR بما هو متوقع في حالة المجموعة الذهبية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 250 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type {
  GoldenExpectedFigureSpec,
  GoldenExpectedOutcome,
} from "./golden-corpus-case-types-ssot";
import {
  toWesternNumeralsSSOT,
  localizeGeometricVertexLabelSSOT,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_GOLDEN_FIGURE_SPEC_COMPARATOR =
  "golden_figure_spec_comparator" as const;

export interface GoldenFigureSpecComparisonReport {
  readonly matches: boolean;
  readonly score: number;
  readonly vertexDiscrepancies: readonly string[];
  readonly lengthDiscrepancies: readonly string[];
  readonly angleDiscrepancies: readonly string[];
  readonly questionMarkMatched: boolean;
  readonly familyMatched: boolean;
  readonly branchMatched: boolean;
  readonly discrepancies: readonly string[];
  readonly summaryText: string;
}

/**
 * يوحّد تسمية الرأس إلى حرف إنجليزي كبير موحد للمقارنة المحايدة (مثلاً "أ" و "A" كلاهما "A").
 */
function normalizeVertexCanonicalLetter(label: string): string {
  const trimmed = label.trim();
  const english = localizeGeometricVertexLabelSSOT(trimmed, "english");
  return english.toUpperCase();
}

/**
 * يستخرج الأرقام الصريحة من أي نص هندسي موحد.
 */
function extractCanonicalNumber(raw: string | number | undefined): string | null {
  if (raw === undefined || raw === null) return null;
  const western = toWesternNumeralsSSOT(String(raw));
  const match = western.match(/\d+(?:\.\d+)?/);
  return match ? match[0] : null;
}

export function compareFigureAgainstExpectedSpec(params: {
  readonly figure?: CanonicalGeometryFigureIR | null;
  readonly expectedOutcome: GoldenExpectedOutcome;
  readonly expectedSpec?: GoldenExpectedFigureSpec;
}): GoldenFigureSpecComparisonReport {
  const { figure, expectedOutcome, expectedSpec } = params;

  // الحالة 1: المسألة لا تتطلب شكلاً (نظرية / لفظية صرفة)
  if (expectedOutcome === "no_figure") {
    if (!figure) {
      return {
        matches: true,
        score: 1,
        vertexDiscrepancies: [],
        lengthDiscrepancies: [],
        angleDiscrepancies: [],
        questionMarkMatched: true,
        familyMatched: true,
        branchMatched: true,
        discrepancies: [],
        summaryText: "مطابقة تامة: رُفض الرسم بشكل صحيح لمسألة نظرية.",
      };
    }
    return {
      matches: false,
      score: 0,
      vertexDiscrepancies: [],
      lengthDiscrepancies: [],
      angleDiscrepancies: [],
      questionMarkMatched: false,
      familyMatched: false,
      branchMatched: false,
      discrepancies: ["رُسم شكل هندسي لمسألة لا تتطلب شكلاً (شكل وهمي زائد)."],
      summaryText: "خطأ: وُلد شكل هندسي زائد لمسألة نظرية.",
    };
  }

  // الحالة 2: المسألة تستحق شكلاً ولكن لم يُولد شكل
  if (!figure) {
    return {
      matches: false,
      score: 0,
      vertexDiscrepancies: expectedSpec?.vertices?.map((v) => `رأس مفقود: ${v}`) ?? [],
      lengthDiscrepancies: expectedSpec?.displayedLengths?.map((l) => `طول مفقود: ${l}`) ?? [],
      angleDiscrepancies: expectedSpec?.displayedAngles?.map((a) => `زاوية مفقودة: ${a}`) ?? [],
      questionMarkMatched: false,
      familyMatched: false,
      branchMatched: false,
      discrepancies: ["تعذر توليد شكل هندسي للمسألة (شكل مفقود)."],
      summaryText: "فشل: المسألة تستحق شكلاً ولم يُولد شيء.",
    };
  }

  // الحالة 3: وُلد شكل وهناك مواصفة مرجعية
  const discrepancies: string[] = [];
  const vertexDiscrepancies: string[] = [];
  const lengthDiscrepancies: string[] = [];
  const angleDiscrepancies: string[] = [];

  // فحص الرؤوس
  const actualVertices = new Set(
    figure.vertices.map((v) => normalizeVertexCanonicalLetter(v.label))
  );

  if (expectedSpec?.vertices && expectedSpec.vertices.length > 0) {
    for (const expV of expectedSpec.vertices) {
      const canonicalExp = normalizeVertexCanonicalLetter(expV);
      if (!actualVertices.has(canonicalExp)) {
        const msg = `الرأس المتوقع (${expV}) غير موجود بالشكل المولد`;
        vertexDiscrepancies.push(msg);
        discrepancies.push(msg);
      }
    }
  }

  // فحص الأطوال المعروضة
  const actualLengths = new Set<string>();
  let actualHasQuestionMark = false;

  for (const seg of figure.segments) {
    if (seg.lengthLabel) {
      const valStr = String(seg.lengthLabel.value).trim();
      if (valStr === "؟" || valStr === "?" || seg.lengthLabel.labelKind === "unknown") {
        actualHasQuestionMark = true;
      }
      const num = extractCanonicalNumber(seg.lengthLabel.value);
      if (num) actualLengths.add(num);
    }
  }

  // فحص الشارات الداخلية عن علامات الاستفهام أو الأطوال
  if (figure.interiorBadges) {
    for (const badge of figure.interiorBadges) {
      if (badge.text.includes("؟") || badge.labelKind === "unknown") {
        actualHasQuestionMark = true;
      }
    }
  }

  if (expectedSpec?.displayedLengths && expectedSpec.displayedLengths.length > 0) {
    for (const expL of expectedSpec.displayedLengths) {
      const expNum = extractCanonicalNumber(expL);
      if (expNum && !actualLengths.has(expNum)) {
        const msg = `الطول المتوقع (${expL}) لم يُعرض كبطاقة على أي ضلع بالشكل`;
        lengthDiscrepancies.push(msg);
        discrepancies.push(msg);
      }
    }
  }

  // فحص الزوايا
  const actualAngles = new Set<string>();
  for (const ang of figure.angles) {
    if (ang.isRightAngle || ang.degrees === 90) actualAngles.add("90");
    if (ang.degrees !== undefined) actualAngles.add(String(ang.degrees));
    if (ang.degreesLabel) {
      if (ang.degreesLabel.includes("؟") || ang.degreesLabel.includes("?")) {
        actualHasQuestionMark = true;
      }
      const angNum = extractCanonicalNumber(ang.degreesLabel);
      if (angNum) actualAngles.add(angNum);
    }
  }

  if (expectedSpec?.displayedAngles && expectedSpec.displayedAngles.length > 0) {
    for (const expA of expectedSpec.displayedAngles) {
      const expNum = extractCanonicalNumber(expA);
      if (expNum && !actualAngles.has(expNum)) {
        const msg = `الزاوية المتوقعة (${expA}°) لم تُعرض كقوس قياس بالشكل`;
        angleDiscrepancies.push(msg);
        discrepancies.push(msg);
      }
    }
  }

  // فحص علامة الاستفهام للمطلوب
  let questionMarkMatched = true;
  if (expectedSpec?.questionMarkTarget) {
    questionMarkMatched = actualHasQuestionMark;
    if (!questionMarkMatched) {
      const msg = `المطلوب (${expectedSpec.questionMarkTarget}) لم يُوسم بعلامة الاستفهام «؟»`;
      discrepancies.push(msg);
    }
  }

  // فحص العائلة والفرع
  let familyMatched = true;
  if (expectedSpec?.expectedFamilyId) {
    familyMatched = figure.familyId === expectedSpec.expectedFamilyId;
    if (!familyMatched) {
      const msg = `عائلة الشكل (${figure.familyId}) تخالف المتوقع (${expectedSpec.expectedFamilyId})`;
      discrepancies.push(msg);
    }
  }

  let branchMatched = true;
  if (expectedSpec?.expectedBranchId) {
    branchMatched = figure.branchId === expectedSpec.expectedBranchId;
    if (!branchMatched) {
      const msg = `فرع الشكل (${figure.branchId}) يخالف المتوقع (${expectedSpec.expectedBranchId})`;
      discrepancies.push(msg);
    }
  }

  // حساب النتيجة التراكمية
  const totalChecks =
    (expectedSpec?.vertices?.length ?? 0) +
    (expectedSpec?.displayedLengths?.length ?? 0) +
    (expectedSpec?.displayedAngles?.length ?? 0) +
    (expectedSpec?.questionMarkTarget ? 1 : 0) +
    (expectedSpec?.expectedFamilyId ? 1 : 0) +
    (expectedSpec?.expectedBranchId ? 1 : 0);

  const failedChecks =
    vertexDiscrepancies.length +
    lengthDiscrepancies.length +
    angleDiscrepancies.length +
    (questionMarkMatched ? 0 : 1) +
    (familyMatched ? 0 : 1) +
    (branchMatched ? 0 : 1);

  const score = totalChecks === 0 ? 1 : Math.max(0, 1 - failedChecks / totalChecks);
  const matches = discrepancies.length === 0;

  const summaryText = matches
    ? "مطابقة تامة لمواصفة الشكل المتوقعة."
    : `يوجد ${discrepancies.length} تباين(ات): ${discrepancies.join(" ؛ ")}`;

  return {
    matches,
    score: Number(score.toFixed(2)),
    vertexDiscrepancies,
    lengthDiscrepancies,
    angleDiscrepancies,
    questionMarkMatched,
    familyMatched,
    branchMatched,
    discrepancies,
    summaryText,
  };
}
