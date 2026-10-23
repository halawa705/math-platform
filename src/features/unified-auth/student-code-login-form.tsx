"use client";

/**
 * @file student-code-login-form.tsx
 * @description خاصية ذرية مستقلة: نموذج دخول الطالب الموحد (باستخدام كود الطالب أو رقم الهاتف).
 * إذا أدخل المعلم المالك الكود السري المباشر (`19842026` أو `Halawa#77.`) يتم توجيهه فوراً لاستوديو المعلم
 * دون إظهار أي أزرار خاصة بالمعلم أمام الطلاب.
 */

import { useState } from "react";
import { isStealthTeacherTriggerCodeSSOT } from "@/core/ssot/teacher-identity-ssot";

export interface StudentCodeLoginFormProps {
  readonly onStudentSubmit: (studentCode: string) => void;
  readonly onStealthCodeDetected: () => void;
  readonly onDirectTeacherLogin?: () => void;
}

export default function StudentCodeLoginForm({
  onStudentSubmit,
  onStealthCodeDetected,
  onDirectTeacherLogin,
}: StudentCodeLoginFormProps) {
  const [codeInput, setCodeInput] = useState("");

  const handleInputChange = (val: string) => {
    setCodeInput(val);
    if (val.trim() === "#MATH-MASTER#") {
      setCodeInput("");
      onStealthCodeDetected();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = codeInput.trim();
    if (!trimmed) return;

    if (isStealthTeacherTriggerCodeSSOT(trimmed)) {
      setCodeInput("");
      if (onDirectTeacherLogin) {
        onDirectTeacherLogin();
      } else {
        onStealthCodeDetected();
      }
      return;
    }

    onStudentSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          كود الطالب أو رقم الهاتف المسجل:
        </label>
        <input
          type="text"
          value={codeInput}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="مثال: 1001 أو MATH-1001 أو رقم الهاتف..."
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white font-black text-sm shadow-md transition-all cursor-pointer"
      >
        دخول للمنصة التعليمية ⬅
      </button>
    </form>
  );
}
