/**
 * @file teacher-identity-ssot.ts
 * @description المصدر الوحيد للحقيقة (SSOT) لهوية المعلم المالك الوحيد للمنصة،
 * وآلية البوابة السرية للدخول (Stealth Teacher Access) المدمجة داخل صفحة دخول الطلاب الموحدة.
 */

export interface OwnerTeacherIdentity {
  readonly teacherFullName: string;
  readonly teacherTitle: string;
  readonly teacherPhone: string;
  readonly platformBrandName: string;
  readonly watermarkText: string;
  readonly governorateName: string;
  /**
   * البادئة أو الكود السري الذي إذا كُتب في خانة كود الطالب أو تم تفعيله بالرمز الرياضي (∑)
   * يفتح خانة كلمة المرور الخاصة بالمعلم المالك دون أن يظهر للطلاب العاديين.
   */
  readonly stealthTriggerPrefix: string;
  readonly stealthEmblemClicksRequired: number;
}

export const DEFAULT_OWNER_TEACHER_IDENTITY_SSOT: OwnerTeacherIdentity = {
  teacherFullName: "أستاذ الرياضيات",
  teacherTitle: "خبير تدريس الرياضيات للمرحلتين الإعدادية والثانوية",
  teacherPhone: "01000000000",
  platformBrandName: "منصة الخوارزمي للرياضيات",
  watermarkText: "منصة الخوارزمي للرياضيات",
  governorateName: "جمهورية مصر العربية",
  stealthTriggerPrefix: "#MATH-MASTER#",
  stealthEmblemClicksRequired: 5,
};

/**
 * يفحص ما إذا كان الإدخال المكتوب في خانة كود الطالب هو المفتاح السري لإظهار بوابة المعلم المالك.
 */
export function isStealthTeacherTriggerCodeSSOT(
  rawInput: string,
  identity: OwnerTeacherIdentity = DEFAULT_OWNER_TEACHER_IDENTITY_SSOT
): boolean {
  if (!rawInput) return false;
  return rawInput.trim() === identity.stealthTriggerPrefix;
}
