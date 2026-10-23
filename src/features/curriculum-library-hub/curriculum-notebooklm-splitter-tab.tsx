"use client";

/**
 * @file curriculum-notebooklm-splitter-tab.tsx
 * @description تبويب تقسيم المنهج واستيراد الوحدات والدروس عبر جسر NotebookLM
 * مربوط مباشرة بمصدر الحقيقة `curriculum-hierarchy-ssot.ts`.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import React, { useState } from "react";
import {
  EGYPTIAN_MATH_GRADES_SSOT,
  buildCurriculumSplitterPrompt,
  parseCurriculumSplitterResponse,
  saveImportedCurriculumUnitsSSOT,
  type CurriculumUnitNode,
} from "@/core/ssot/curriculum-hierarchy-ssot";
import {
  ALL_MATH_BRANCHES_LIST,
  MATH_BRANCHES_SSOT,
  type MathBranchId,
} from "@/core/ssot/math-branches-ssot";

export const MODULE_ID_CURRICULUM_NOTEBOOKLM_SPLITTER_TAB =
  "curriculum_notebooklm_splitter_tab" as const;

const SAMPLE_NOTEBOOKLM_RESPONSE = `=== [UNIT: 1] | الفرع: الجبر والدوال | العنوان: العلاقات والدوال التربيعية ===
- [LESSON: 1] حاصل الضرب الديكارتي | المفاهيم: الزوج المرتب، الشبكة البيانية المتعامدة
- [LESSON: 2] دوال كثيرات الحدود والتمثيل البياني للدالة التربيعية | المفاهيم: رأس المنحنى، محور التماثل، القيمة العظمى والصغرى
=== [UNIT: 2] | الفرع: الهندسة المستوية | العنوان: التشابه ونظريات المثلث القائم ===
- [LESSON: 1] القطعة الواصلة بين منتصفي ضلعين في مثلث | المفاهيم: التنصيف، التوازي، نصف طول الضلع الثالث
- [LESSON: 2] نظرية إقليدس وعلاقات المساقط العمودية | المفاهيم: مسقط قطعة مستقيمة، مربع طول ضلع القائمة`;

export default function CurriculumNotebooklmSplitterTab() {
  const [gradeId, setGradeId] = useState<string>("prep-3");
  const [termNumber, setTermNumber] = useState<1 | 2>(1);
  const [branchId, setBranchId] = useState<MathBranchId>("plane_geometry");
  const [rawInput, setRawInput] = useState<string>(SAMPLE_NOTEBOOKLM_RESPONSE);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedToSSOT, setSavedToSSOT] = useState<boolean>(false);

  const selectedGrade =
    EGYPTIAN_MATH_GRADES_SSOT.find((g) => g.id === gradeId) ||
    EGYPTIAN_MATH_GRADES_SSOT[5];

  const promptText = buildCurriculumSplitterPrompt({
    gradeName: selectedGrade.nameArabic,
    termNumber,
    branchId,
  });

  const parsedUnits: readonly CurriculumUnitNode[] =
    parseCurriculumSplitterResponse(rawInput, gradeId, termNumber, branchId);

  return (
    <div className="space-y-4">
      {/* إعداد أمر استخراج الفهرس من الكتب المدرسية */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              🧭 مستكشف وتقسيم المنهج الرياضي (المصدر الوحيد للحقيقة SSOT)
            </h3>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              يستخرج الوحدات والدروس من المصدر المرفوع ليغذي كافة برومبتات وصفحات المنصة
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(promptText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black cursor-pointer"
            >
              {copied ? "✓ تم نسخ أمر التقسيم" : "📋 نسخ أمر تقسيم المنهج"}
            </button>
            <button
              type="button"
              onClick={() => {
                saveImportedCurriculumUnitsSSOT(parsedUnits);
                setSavedToSSOT(true);
                setTimeout(() => setSavedToSSOT(false), 2500);
              }}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black cursor-pointer"
            >
              {savedToSSOT ? "✓ تم الاعتماد في كل المنصة" : "💾 اعتماد كشجرة المنهج الرسمية"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <select
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
            className="min-h-[42px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black"
          >
            {EGYPTIAN_MATH_GRADES_SSOT.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nameArabic}
              </option>
            ))}
          </select>

          <select
            value={termNumber}
            onChange={(e) => setTermNumber(Number(e.target.value) as 1 | 2)}
            className="min-h-[42px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black"
          >
            <option value={1}>الفصل الدراسي الأول</option>
            <option value={2}>الفصل الدراسي الثاني</option>
          </select>

          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value as MathBranchId)}
            className="min-h-[42px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black"
          >
            {ALL_MATH_BRANCHES_LIST.map((b) => (
              <option key={b.id} value={b.id}>
                {b.symbolBadge} {b.nameArabic}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-slate-500 mb-1">
            الصق رد استخراج الوحدات والدروس لتحويله فوراً إلى شجرة منهج حية:
          </label>
          <textarea
            rows={4}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold leading-relaxed"
          />
        </div>
      </div>

      {/* عرض شجرة الوحدات والدروس المستخرجة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {parsedUnits.map((unit) => {
          const branchInfo = MATH_BRANCHES_SSOT[unit.branchId];
          return (
            <div
              key={unit.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-teal-500/15 text-teal-800 dark:text-teal-300 text-[11px] font-black">
                  {branchInfo.symbolBadge} {branchInfo.nameArabic}
                </span>
                <span className="text-[11px] font-extrabold text-slate-400">
                  الوحدة {unit.orderIndex}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {unit.titleArabic}
              </h4>
              <ul className="space-y-1.5 pt-1">
                {unit.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 text-xs"
                  >
                    <div className="font-black text-slate-800 dark:text-slate-100">
                      {lesson.orderIndex}. {lesson.titleArabic}
                    </div>
                    {lesson.coreConcepts.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {lesson.coreConcepts.map((c, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
