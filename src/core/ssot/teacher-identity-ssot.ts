/**
 * @file teacher-identity-ssot.ts
 * @description المصدر الوحيد للحقيقة (SSOT) لهوية المعلم المالك الوحيد للمنصة،
 * وآلية البوابة السرية للدخول (Stealth Teacher Access) + بيانات الطالب التجريبي المدمجة.
 */

export interface OwnerTeacherIdentity {
  readonly teacherFullName: string;
  readonly teacherTitle: string;
  readonly teacherPhone: string;
  readonly platformBrandName: string;
  readonly watermarkText: string;
  readonly governorateName: string;
  readonly stealthTriggerCodes: readonly string[];
  readonly stealthEmblemClicksRequired: number;
}

export interface DemoStudentAccountSSOT {
  readonly studentCode: string;
  readonly altNumericCode: string;
  readonly studentPhone: string;
  readonly fullNameAr: string;
  readonly gradeNameAr: string;
  readonly gradeId: string;
}

export const DEFAULT_OWNER_TEACHER_IDENTITY_SSOT: OwnerTeacherIdentity = {
  teacherFullName: "أ/ إسلام حلاوة",
  teacherTitle: "خبير تدريس الرياضيات للمرحلتين الإعدادية والثانوية",
  teacherPhone: "01000000000",
  platformBrandName: "منصة الخوارزمي للرياضيات",
  watermarkText: "منصة الخوارزمي للرياضيات — أ/ إسلام حلاوة",
  governorateName: "جمهورية مصر العربية",
  stealthTriggerCodes: ["19842026", "Halawa#77.", "halawa#77", "#MATH-MASTER#"],
  stealthEmblemClicksRequired: 5,
};

export const DEFAULT_DEMO_STUDENT_ACCOUNT_SSOT: DemoStudentAccountSSOT = {
  studentCode: "MATH-1001",
  altNumericCode: "1001",
  studentPhone: "01012345678",
  fullNameAr: "أحمد محمد علي (طالب تجريبي)",
  gradeNameAr: "الصف الثالث الإعدادي",
  gradeId: "prep_3",
};

/**
 * يفحص ما إذا كان الإدخال المكتوب هو أحد الأكواد السرية الخاصة بالمعلم المالك (الأدمن).
 */
export function isStealthTeacherTriggerCodeSSOT(
  rawInput: string,
  identity: OwnerTeacherIdentity = DEFAULT_OWNER_TEACHER_IDENTITY_SSOT
): boolean {
  if (!rawInput) return false;
  const trimmed = rawInput.trim();
  return identity.stealthTriggerCodes.some(
    (code) => code.toLowerCase() === trimmed.toLowerCase()
  );
}
