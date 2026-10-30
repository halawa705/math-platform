/**
 * @file verification-report-types-ssot.ts
 * @description عقد تقرير التحقق الهندسي: كل مخالفة قياسية بين الشكل المرسوم ومعطياته.
 */
export const MODULE_ID_VERIFICATION_REPORT_TYPES = "verification_report_types" as const;

export type VerificationSeverity = "error" | "warning";

export interface VerificationIssue {
  readonly rule: string;
  readonly severity: VerificationSeverity;
  readonly message: string;
}

export interface FigureVerificationReport {
  readonly figureId: string;
  readonly passed: boolean;
  readonly issues: readonly VerificationIssue[];
}
