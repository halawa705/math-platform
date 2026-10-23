"use client";

/**
 * @file student-honor-certificate-generator.tsx
 * @description مولد شهادات التقدير والتفوق الرياضي للطلاب بعد اجتياز الاختبار الإلكتروني (الهوية من الإعدادات الحية).
 */

import { useEffect, useState } from "react";
import {
  DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
  loadTeacherIdentitySSOT,
} from "@/core/ssot/teacher-identity-ssot";
import { toEasternNumeralsSSOT } from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_STUDENT_HONOR_CERTIFICATE_GENERATOR =
  "student_honor_certificate_generator" as const;

export interface StudentHonorCertificateGeneratorProps {
  readonly studentNameArabic: string;
  readonly examTitleArabic: string;
  readonly percentageScore: number;
}

export default function StudentHonorCertificateGenerator({
  studentNameArabic,
  examTitleArabic,
  percentageScore,
}: StudentHonorCertificateGeneratorProps) {
  const [identity, setIdentity] = useState(DEFAULT_OWNER_TEACHER_IDENTITY_SSOT);
  useEffect(() => setIdentity(loadTeacherIdentitySSOT()), []);

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-teal-50 dark:from-slate-900 dark:via-[#111827] dark:to-teal-950/40 border-2 border-amber-400/70 shadow-lg text-center space-y-2">
      <div className="text-2xl">🏆</div>
      <div className="text-xs font-black text-amber-700 dark:text-amber-400">
        شهادة تفوق وإتقان في الرياضيات — {identity.platformBrandName}
      </div>
      <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
        الطالب المتفوق: {studentNameArabic}
      </h4>
      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
        اجتاز بنجاح ({examTitleArabic}) بنسبة إتقان{" "}
        <span className="font-black text-teal-700 dark:text-teal-300">
          {toEasternNumeralsSSOT(percentageScore)}٪
        </span>
      </p>
      <div className="pt-1 text-[11px] font-extrabold text-slate-500">
        إشراف: {identity.teacherFullName}
      </div>
    </div>
  );
}
