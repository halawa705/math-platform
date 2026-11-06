/**
 * @file primary-stage-print-policy-ssot.ts
 * @description سياسة الطباعة والتخطيط الخاصة بالمرحلة الابتدائية (الصفوف 3–6) (المرحلة 5.1):
 * - حجم خط أكبر (14pt–15pt) لسهولة القراءة لطلاب الابتدائي.
 * - عمود واحد (Single Column) افتراضياً لمنع تشتت الطالب.
 * - مساحات إجابة أوسع (3 أسطر) للكتابة اليدوية بالقلم الرصاص.
 * - حدود أسمك للرسوم الهندسية والرموز (+40% سمك خط).
 * - توافق تام مع الطباعة بالأبيض والأسود وتصوير الليزر.
 * @invariant ملف SSOT ذري مستقل باسم فريد عالمياً وفق دستور المنصة (< 120 سطراً).
 */

import type {
  PDFPrintSettingsStateSSOT,
} from "../ssot/pdf-print-settings-ssot";

export const MODULE_ID_PRIMARY_STAGE_PRINT_POLICY_SSOT =
  "primary_stage_print_policy_ssot" as const;

export interface PrimaryPrintPolicyPreset {
  readonly exactFontSizePt: 14 | 15 | 16;
  readonly columnsCount: 1 | 2;
  readonly answerSpaceLines: 2 | 3;
  readonly answerSpaceStyle: "dotted" | "lined" | "grid";
  readonly strokeWidthMultiplier: number;
  readonly preferredFont: "readex_pro" | "cairo";
}

export function getPrimaryStagePrintPreset(gradeId?: string): PrimaryPrintPolicyPreset {
  if (gradeId === "prim_grade_3" || gradeId === "prim_grade_4") {
    return {
      exactFontSizePt: 15,
      columnsCount: 1,
      answerSpaceLines: 3,
      answerSpaceStyle: "lined",
      strokeWidthMultiplier: 1.5,
      preferredFont: "readex_pro",
    };
  }

  // الصف الخامس والسادس
  return {
    exactFontSizePt: 14,
    columnsCount: 1,
    answerSpaceLines: 2,
    answerSpaceStyle: "dotted",
    strokeWidthMultiplier: 1.3,
    preferredFont: "cairo",
  };
}

export function applyPrimaryStagePrintPolicy(
  currentSettings: PDFPrintSettingsStateSSOT,
  gradeId?: string
): PDFPrintSettingsStateSSOT {
  const isPrimary = gradeId && gradeId.startsWith("prim_");
  if (!isPrimary) return currentSettings;

  const preset = getPrimaryStagePrintPreset(gradeId);

  return {
    ...currentSettings,
    exactFontSizePt: preset.exactFontSizePt,
    columnsCount: preset.columnsCount,
    answerSpaceLines: preset.answerSpaceLines,
    answerSpaceStyle: preset.answerSpaceStyle,
    fontFamilyId: preset.preferredFont,
    showColumnDivider: preset.columnsCount === 2,
    densityMode: "booklet_relaxed",
  };
}
