/**
 * @file golden-corpus-correction-converter.ts
 * @description تحويل تصحيحات المعلم للأشكال في الاستوديو إلى حالات في المجموعة الذهبية (المهمة 7.3):
 * يحفظ التصحيح كحالة مرجعية جديدة بصيغة GoldenCorpusCase مع علامة الاعتماد البشري humanVerdict = 'correct'،
 * لتصديرها بصيغة JSON أو حفظها محلياً لحماية النظام من التراجع المستقبلي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 90 سطراً).
 */

import type { GoldenCorpusCase } from "./golden-corpus-case-types-ssot";
import type { MathBranchId } from "../../ssot/math-branches-ssot";

export const MODULE_ID_GOLDEN_CORPUS_CORRECTION_CONVERTER =
  "golden_corpus_correction_converter" as const;

export interface BuildGoldenCaseCorrectionParams {
  readonly problemText: string;
  readonly correctedDescription: string;
  readonly gradeId: string;
  readonly branchId: MathBranchId;
  readonly teacherNotes?: string;
  readonly authenticSourceCitation?: string;
}

/**
 * ينشئ كائن حالة ذهبية موثقاً من تعديل المعلم.
 */
export function buildGoldenCorpusCaseFromCorrection(
  params: BuildGoldenCaseCorrectionParams
): GoldenCorpusCase {
  const timestamp = Date.now();
  const id = `custom_case_${params.gradeId}_${timestamp}`;

  return {
    id,
    gradeId: params.gradeId,
    branchId: params.branchId,
    source: params.authenticSourceCitation || "تعديل واعتمد يدوي من المعلم في الاستوديو",
    problemText: params.problemText,
    geometryRaw: `[رسم هندسي: ${params.correctedDescription}]`,
    expectedOutcome: "figure",
    expectedGivenNumbers: [],
    humanVerdict: "correct",
    humanNotes: params.teacherNotes || "تم التحقق والاعتماد يدوياً بواسطة المعلم",
    reviewedAtIso: new Date(timestamp).toISOString(),
    expectedFigureSpec: {
      expectedFamilyId: params.branchId === "statistics_probability" ? "statistics_family" : "triangle_family",
      vertices: [],
      displayedLengths: [],
      displayedAngles: [],
    },
  };
}
