"use client";

/**
 * @file teacher-platform-settings-view.tsx
 * @description مركز إعدادات المعلم ومصدر الحقيقة الموحد (`/settings`):
 * ١. تعديل اسم المنصة/السنتر، اسم المعلم، اسم الشهرة، الهاتف، التذييل (Footer)، والعلامة المائية.
 * ٢. تعديل اسم/كود الدخول السري للمعلم المالك.
 * ٣. تحديد الصفوف الدراسية المفعّلة لهذا العام (من الثالث الابتدائي حتى الثالث الثانوي) لتكون المصدر الوحيد للحقيقة في الموقع كله.
 * ٤. ربط كل صف دراسي مفعّل برابط دفتر NotebookLM الخاص به.
 */

import { useState, useEffect } from "react";
import TopFourCentersNavigationBar from "@/components/global-ui/top-four-centers-navigation-bar";
import { EGYPTIAN_MATH_GRADES_SSOT } from "@/core/ssot/curriculum-hierarchy-ssot";
import {
  DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
  loadTeacherIdentitySSOT,
  saveTeacherIdentitySSOT,
  type OwnerTeacherIdentity,
} from "@/core/ssot/teacher-identity-ssot";
import { pullTeacherIdentityFromSupabaseCloud } from "@/core/supabase/supabase-cloud-sync-ssot";

export default function TeacherPlatformSettingsView() {
  const [formState, setFormState] = useState<OwnerTeacherIdentity>(
    DEFAULT_OWNER_TEACHER_IDENTITY_SSOT
  );
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  useEffect(() => {
    setFormState(loadTeacherIdentitySSOT());
    void pullTeacherIdentityFromSupabaseCloud().then((cloudIdentity) => {
      if (cloudIdentity) {
        setFormState(cloudIdentity);
        saveTeacherIdentitySSOT(cloudIdentity);
      }
    });
  }, []);

  const toggleGradeEnabled = (gradeId: string) => {
    const exists = formState.enabledGradeIds.includes(gradeId);
    const updated = exists
      ? formState.enabledGradeIds.filter((id) => id !== gradeId)
      : [...formState.enabledGradeIds, gradeId];
    if (updated.length === 0) return; // ضمان بقاء صف واحد على الأقل مفعلاً
    setFormState({ ...formState, enabledGradeIds: updated });
  };

  const updateNotebookUrl = (gradeId: string, url: string) => {
    setFormState({
      ...formState,
      notebookLmUrlsByGrade: {
        ...formState.notebookLmUrlsByGrade,
        [gradeId]: url,
      },
    });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveTeacherIdentitySSOT(formState);
    setSaveBanner("✓ تم حفظ إعدادات الهوية والصفوف وروابط NotebookLM وتعميمها كمصدر وحيد للحقيقة في المنصة!");
    setTimeout(() => setSaveBanner(null), 4000);
  };

  const enabledGradesList = EGYPTIAN_MATH_GRADES_SSOT.filter((g) =>
    formState.enabledGradeIds.includes(g.id)
  );

  return (
    <div
      dir="rtl"
      className="min-h-screen pb-24 md:pb-14 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100"
    >
      <TopFourCentersNavigationBar activeCenter="settings" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              ⚙️ إعدادات الهوية والصفوف وروابط NotebookLM
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              أي تعديل هنا يُحفظ كمصدر وحيد للحقيقة (SSOT) وينعكس فوراً في التذييل والمطبوعات وقوائم الصفوف.
            </p>
          </div>
          {saveBanner && (
            <div className="px-4 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-black shadow-md">
              {saveBanner}
            </div>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* ١. بطاقة هوية المعلم والمنصة والتذييل وكود الدخول */}
          <section className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-black text-indigo-900 dark:text-teal-300">
              ١. بيانات المعلم والمنصة والتذييل ورمز الدخول السري
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  اسم المنصة أو السنتر:
                </label>
                <input
                  type="text"
                  value={formState.platformBrandName}
                  onChange={(e) =>
                    setFormState({ ...formState, platformBrandName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  اسم المعلم:
                </label>
                <input
                  type="text"
                  value={formState.teacherFullName}
                  onChange={(e) =>
                    setFormState({ ...formState, teacherFullName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  اسم الشهرة / اللقب (يظهر في الهيدر والتذييل):
                </label>
                <input
                  type="text"
                  value={formState.teacherNickname}
                  onChange={(e) =>
                    setFormState({ ...formState, teacherNickname: e.target.value })
                  }
                  placeholder="مثال: عميد الرياضيات"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  رقم الهاتف / الواتساب (يظهر في ترويسة المذكرات):
                </label>
                <input
                  type="text"
                  value={formState.teacherPhone}
                  onChange={(e) =>
                    setFormState({ ...formState, teacherPhone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  نص التذييل الموحد (Footer — يظهر أسفل جميع صفحات المنصة والمطبوعات):
                </label>
                <input
                  type="text"
                  value={formState.footerText}
                  onChange={(e) =>
                    setFormState({ ...formState, footerText: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
                  🔐 اسم أو كود الدخول السري الخاص بك للمنصة:
                </label>
                <input
                  type="text"
                  value={formState.customSecretLoginCode}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      customSecretLoginCode: e.target.value,
                    })
                  }
                  placeholder="مثال: 19842026 أو اسم سري خاص بك"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 text-xs font-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  العلامة المائية للمطبوعات (Watermark):
                </label>
                <input
                  type="text"
                  value={formState.watermarkText}
                  onChange={(e) =>
                    setFormState({ ...formState, watermarkText: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                />
              </div>
            </div>
          </section>

          {/* ٢. بطاقة تحديد الصفوف الدراسية المفعّلة لهذا العام الدراسي */}
          <section className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-black text-indigo-900 dark:text-teal-300">
                ٢. الصفوف الدراسية التي تعمل بها هذا العام (مصدر الحقيقة الموحد)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                اختر فقط الصفوف التي تدرسها هذا العام (بما فيها الصف الثالث الابتدائي)؛ الصفوف غير المحددة ستختفي تماماً من قوائم الاستوديو والامتحانات وتسجيل الطلاب.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {EGYPTIAN_MATH_GRADES_SSOT.map((grade) => {
                const isSelected = formState.enabledGradeIds.includes(grade.id);
                return (
                  <button
                    key={grade.id}
                    type="button"
                    onClick={() => toggleGradeEnabled(grade.id)}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-indigo-900 text-white border-indigo-900 dark:bg-teal-600 dark:border-teal-500 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <span className="text-xs font-black">{grade.nameArabic}</span>
                    <span className="text-sm">{isSelected ? "✅" : "⬜"}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ٣. بطاقة ربط كل صف دراسي مفعّل بصفحة NotebookLM الخاصة به */}
          <section className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-black text-indigo-900 dark:text-teal-300">
                ٣. ربط كل صف دراسي مفعّل برابط دفتر NotebookLM الخاص به
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ضع رابط الدفتر الذي رفعت فيه كتب ومصادر كل صف على NotebookLM؛ عند الضغط على زر «نسخ البرومبت وفتح NotebookLM» في أي أداة سيفتح لك هذا الرابط تلقائياً ويكون البرومبت منسوخاً في حافظتك!
              </p>
            </div>

            <div className="space-y-3">
              {enabledGradesList.map((grade) => (
                <div
                  key={grade.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <span className="sm:w-48 text-xs font-black text-slate-800 dark:text-slate-200 shrink-0">
                    📘 {grade.nameArabic}:
                  </span>
                  <input
                    type="url"
                    dir="ltr"
                    value={formState.notebookLmUrlsByGrade[grade.id] || ""}
                    onChange={(e) => updateNotebookUrl(grade.id, e.target.value)}
                    placeholder="https://notebooklm.google.com/notebook/..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-800 dark:text-slate-200"
                  />
                </div>
              ))}
            </div>
          </section>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-l from-teal-600 to-indigo-800 hover:from-teal-500 hover:to-indigo-700 text-white font-black text-sm shadow-lg cursor-pointer"
          >
            💾 حفظ وتعميم جميع الإعدادات في المنصة الآن
          </button>
        </form>
      </main>
    </div>
  );
}
