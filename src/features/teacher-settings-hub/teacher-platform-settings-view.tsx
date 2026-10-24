"use client";

/**
 * @file teacher-platform-settings-view.tsx
 * @description مركز إعدادات المعلم ومصدر الحقيقة الموحد (`/settings`):
 * ١. تعديل اسم المنصة/السنتر (منصة الفارس)، وتغيير اللوجو (رفع صورة من الجهاز أو وضع رابط أو اختيار رمز).
 * ٢. تعديل اسم المعلم، اسم الشهرة، الهاتف، التذييل (Footer)، والعلامة المائية.
 * ٣. تعديل اسم/كود الدخول السري للمعلم المالك.
 * ٤. تحديد الصفوف الدراسية المفعّلة لهذا العام وربط كل صف بدفتر NotebookLM الخاص به.
 */

import React, { useState, useEffect } from "react";
import TopFourCentersNavigationBar from "@/components/global-ui/top-four-centers-navigation-bar";
import { EGYPTIAN_MATH_GRADES_SSOT } from "@/core/ssot/curriculum-hierarchy-ssot";
import {
  DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
  loadTeacherIdentitySSOT,
  refreshTeacherIdentityFromSupabaseSSOT,
  saveTeacherIdentitySSOT,
  type OwnerTeacherIdentity,
} from "@/core/ssot/teacher-identity-ssot";

const LOGO_SYMBOL_PRESETS = ["🛡️", "🐎", "∑", "👑", "📐", "🏆"] as const;

function compressImageFileToDataUrl(file: File, maxDim = 256): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!rawDataUrl) {
        resolve("");
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
          const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/png", 0.9));
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

export default function TeacherPlatformSettingsView() {
  const [formState, setFormState] = useState<OwnerTeacherIdentity>(
    DEFAULT_OWNER_TEACHER_IDENTITY_SSOT
  );
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  const applyAndPersistIdentity = (next: OwnerTeacherIdentity) => {
    setFormState(next);
    saveTeacherIdentitySSOT(next);
  };

  useEffect(() => {
    const localLoaded = loadTeacherIdentitySSOT();
    setFormState(localLoaded);
    void refreshTeacherIdentityFromSupabaseSSOT().then((synced) => {
      setFormState(synced);
    });
  }, []);

  const toggleGradeEnabled = (gradeId: string) => {
    const exists = formState.enabledGradeIds.includes(gradeId);
    const updated = exists
      ? formState.enabledGradeIds.filter((id) => id !== gradeId)
      : [...formState.enabledGradeIds, gradeId];
    if (updated.length === 0) return;
    applyAndPersistIdentity({ ...formState, enabledGradeIds: updated });
  };

  const updateNotebookUrl = (gradeId: string, url: string) => {
    applyAndPersistIdentity({
      ...formState,
      notebookLmUrlsByGrade: {
        ...formState.notebookLmUrlsByGrade,
        [gradeId]: url,
      },
    });
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressedDataUrl = await compressImageFileToDataUrl(file, 256);
    if (compressedDataUrl) {
      applyAndPersistIdentity({
        ...formState,
        platformLogoUrl: compressedDataUrl,
      });
    }
  };

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const ok = saveTeacherIdentitySSOT(formState);
    if (ok) {
      setSaveBanner(
        "✓ تم حفظ جميع الإعدادات واللوجو واسم المنصة والكنية والهاتف وروابط NotebookLM وتعميمها فوراً!"
      );
      setTimeout(() => setSaveBanner(null), 5000);
    }
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
              ⚙️ إعدادات الهوية واللوجو والصفوف وروابط NotebookLM
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              أي تعديل هنا يُحفظ فوراً كمصدر وحيد للحقيقة (SSOT) وينعكس في الشريط العلوي والتذييل والمطبوعات.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleSaveSettings()}
            className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer"
          >
            💾 حفظ سريع للإعدادات الآن
          </button>
        </div>

        {saveBanner && (
          <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm font-black shadow-md flex items-center justify-between">
            <span>{saveBanner}</span>
            <span>✅</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* ١. بطاقة شعار المنصة (اللوجو) وهوية المعلم والمنصة والتذييل */}
          <section className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <h2 className="text-base font-black text-indigo-900 dark:text-teal-300">
              ١. شعار المنصة (اللوجو) وبيانات المعلم والتذييل وكود الدخول
            </h2>

            {/* قسم تغيير اللوجو (رفع صورة أو رابط أو رمز) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
              {/* معاينة اللوجو الحي */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-teal-600 text-white flex items-center justify-center text-3xl font-black shadow-md overflow-hidden shrink-0 border-2 border-white dark:border-slate-700">
                {formState.platformLogoUrl ? (
                  <img
                    src={formState.platformLogoUrl}
                    alt="شعار المنصة"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{formState.platformLogoSymbol || "🛡️"}</span>
                )}
              </div>

              <div className="flex-1 w-full space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black cursor-pointer shadow-xs">
                    📁 رفع صورة اللوجو من جهازك
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                  {formState.platformLogoUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        applyAndPersistIdentity({ ...formState, platformLogoUrl: "" })
                      }
                      className="px-3 py-2 rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-200 text-xs font-black cursor-pointer"
                    >
                      حذف الصورة واستخدام الرمز
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      أو ضع رابط مباشر لصورة اللوجو (اختياري):
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={
                        formState.platformLogoUrl.startsWith("data:")
                          ? ""
                          : formState.platformLogoUrl
                      }
                      onChange={(e) =>
                        applyAndPersistIdentity({
                          ...formState,
                          platformLogoUrl: e.target.value,
                        })
                      }
                      placeholder="https://example.com/logo.png"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      أو اختر رمز الشعار (عند عدم وجود صورة):
                    </label>
                    <div className="flex items-center gap-1.5">
                      {LOGO_SYMBOL_PRESETS.map((sym) => (
                        <button
                          key={sym}
                          type="button"
                          onClick={() =>
                            applyAndPersistIdentity({
                              ...formState,
                              platformLogoUrl: "",
                              platformLogoSymbol: sym,
                            })
                          }
                          className={`w-9 h-9 rounded-xl border text-base flex items-center justify-center cursor-pointer ${
                            !formState.platformLogoUrl &&
                            formState.platformLogoSymbol === sym
                              ? "border-indigo-900 bg-indigo-900 text-white"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                          }`}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  اسم المنصة أو السنتر:
                </label>
                <input
                  type="text"
                  value={formState.platformBrandName}
                  onChange={(e) =>
                    applyAndPersistIdentity({ ...formState, platformBrandName: e.target.value })
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
                    applyAndPersistIdentity({ ...formState, teacherFullName: e.target.value })
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
                    applyAndPersistIdentity({ ...formState, teacherNickname: e.target.value })
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
                    applyAndPersistIdentity({ ...formState, teacherPhone: e.target.value })
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
                    applyAndPersistIdentity({ ...formState, footerText: e.target.value })
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
                    applyAndPersistIdentity({
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
                    applyAndPersistIdentity({ ...formState, watermarkText: e.target.value })
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
                ضع رابط الدفتر الذي رفعت فيه كتب ومصادر كل صف على NotebookLM؛ عند الضغط على زر «نسخ البرومبت وفتح NotebookLM» في أي أداة سيفتح لك هذا الرابط تلقائياً!
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

          {saveBanner && (
            <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm font-black shadow-md text-center">
              {saveBanner}
            </div>
          )}

          <button
            type="submit"
            onClick={() => handleSaveSettings()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-l from-teal-600 to-indigo-800 hover:from-teal-500 hover:to-indigo-700 text-white font-black text-sm shadow-lg cursor-pointer"
          >
            💾 حفظ وتعميم جميع الإعدادات واللوجو في المنصة الآن
          </button>
        </form>
      </main>
    </div>
  );
}
