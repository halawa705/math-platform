"use client";

/**
 * @file curriculum-notebooklm-splitter-tab.tsx
 * @description تبويب تقسيم المنهج واستيراد الوحدات والدروس الحقيقية عبر جسر NotebookLM
 * مربوط مباشرة بمصدر الحقيقة `curriculum-hierarchy-ssot.ts` وروابط NotebookLM في `teacher-identity-ssot.ts`.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { useEffect, useState } from "react";
import {
  buildCurriculumSplitterPrompt,
  loadActiveCurriculumUnitsSSOT,
  parseCurriculumSplitterResponse,
  saveImportedCurriculumUnitsSSOT,
  type CurriculumUnitNode,
} from "@/core/ssot/curriculum-hierarchy-ssot";
import {
  copyPromptAndOpenGradeNotebookLmSSOT,
  loadEnabledGradesSSOT,
  loadTeacherIdentitySSOT,
  saveTeacherIdentitySSOT,
} from "@/core/ssot/teacher-identity-ssot";
import { pullCurriculumUnitsFromSupabaseCloud } from "@/core/supabase/supabase-cloud-sync-ssot";

export const MODULE_ID_CURRICULUM_NOTEBOOKLM_SPLITTER_TAB =
  "curriculum_notebooklm_splitter_tab" as const;

export default function CurriculumNotebooklmSplitterTab() {
  const [enabledGrades, setEnabledGrades] = useState(() =>
    loadEnabledGradesSSOT()
  );
  const [gradeId, setGradeId] = useState<string>("prep-3");
  const [termNumber, setTermNumber] = useState<1 | 2>(1);
  const [gradeNotebookUrl, setGradeNotebookUrl] = useState<string>("");
  const [customEditablePrompt, setCustomEditablePrompt] = useState<string>("");
  const [rawInput, setRawInput] = useState<string>("");
  const [savedUnits, setSavedUnits] = useState<readonly CurriculumUnitNode[]>(
    []
  );
  const [copiedAndOpened, setCopiedAndOpened] = useState<boolean>(false);
  const [savedToSSOT, setSavedToSSOT] = useState<boolean>(false);

  const selectedGrade =
    enabledGrades.find((g) => g.id === gradeId) || enabledGrades[0];

  useEffect(() => {
    const activeGrades = loadEnabledGradesSSOT();
    setEnabledGrades(activeGrades);
    const targetGrade =
      activeGrades.find((g) => g.id === gradeId) || activeGrades[0];
    if (targetGrade && targetGrade.id !== gradeId) {
      setGradeId(targetGrade.id);
    }
    const identity = loadTeacherIdentitySSOT();
    setGradeNotebookUrl(
      identity.notebookLmUrlsByGrade?.[targetGrade?.id || gradeId] || ""
    );
    setSavedUnits(loadActiveCurriculumUnitsSSOT(targetGrade?.id || gradeId));
    void pullCurriculumUnitsFromSupabaseCloud().then((cloudUnits) => {
      if (cloudUnits && cloudUnits.length > 0) {
        saveImportedCurriculumUnitsSSOT(cloudUnits);
        setSavedUnits(loadActiveCurriculumUnitsSSOT(targetGrade?.id || gradeId));
      }
    });

    const generatedPrompt = buildCurriculumSplitterPrompt({
      gradeName: targetGrade?.nameArabic || "الصف الثالث الإعدادي",
      termNumber,
    });
    setCustomEditablePrompt(generatedPrompt);
  }, [gradeId, termNumber]);

  const parsedPreviewUnits: readonly CurriculumUnitNode[] = rawInput.trim()
    ? parseCurriculumSplitterResponse(rawInput, gradeId, termNumber)
    : [];

  const unitsToDisplay =
    parsedPreviewUnits.length > 0 ? parsedPreviewUnits : savedUnits;

  const handleSaveGradeNotebookUrl = (url: string) => {
    setGradeNotebookUrl(url);
    const identity = loadTeacherIdentitySSOT();
    saveTeacherIdentitySSOT({
      ...identity,
      notebookLmUrlsByGrade: {
        ...identity.notebookLmUrlsByGrade,
        [gradeId]: url,
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* البطاقة الأولى: اختيار الصف وربط NotebookLM ونسخ البرومبت القابل للتعديل */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              🧭 الخطوة ١: تقسيم منهج الصف واستخراج الوحدات والفروع والدروس من NotebookLM
            </h3>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              المنصة خالية تماماً من أي وحدات وهمية — الوحدات التي تستخرجها هنا هي الوحيدة التي ستظهر في كل القوائم
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              copyPromptAndOpenGradeNotebookLmSSOT(
                customEditablePrompt,
                gradeId
              );
              setCopiedAndOpened(true);
              setTimeout(() => setCopiedAndOpened(false), 3000);
            }}
            className="min-h-[44px] px-4 py-2 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black shadow-sm cursor-pointer"
          >
            {copiedAndOpened
              ? "✓ تم نسخ البرومبت وفتح NotebookLM!"
              : "📋 نسخ البرومبت وفتح NotebookLM لهذا الصف ↗"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
              الصف الدراسي النشط:
            </label>
            <select
              value={gradeId}
              onChange={(e) => setGradeId(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black"
            >
              {enabledGrades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nameArabic}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
              الفصل الدراسي:
            </label>
            <select
              value={termNumber}
              onChange={(e) => setTermNumber(Number(e.target.value) as 1 | 2)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black"
            >
              <option value={1}>الفصل الدراسي الأول</option>
              <option value={2}>الفصل الدراسي الثاني</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
              رابط دفتر NotebookLM الخاص بـ ({selectedGrade?.nameArabic}):
            </label>
            <input
              type="url"
              dir="ltr"
              value={gradeNotebookUrl}
              onChange={(e) => handleSaveGradeNotebookUrl(e.target.value)}
              placeholder="https://notebooklm.google.com/notebook/..."
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
            />
          </div>
        </div>

        {/* نص البرومبت الصريح القابل للتعديل */}
        <div>
          <label className="block text-xs font-extrabold text-indigo-900 dark:text-indigo-300 mb-1">
            ✨ نص البرومبت الذي سيُنسخ إلى NotebookLM (يمكنك قراءته أو التعديل عليه بحرية):
          </label>
          <textarea
            rows={5}
            value={customEditablePrompt}
            onChange={(e) => setCustomEditablePrompt(e.target.value)}
            className="w-full p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-slate-950 text-xs font-bold leading-relaxed text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* البطاقة الثانية: لصق رد NotebookLM واعتماد الوحدات الحقيقية */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              📥 الخطوة ٢: الصق رد NotebookLM هنا لاعتماد وحدات ودروس ({selectedGrade?.nameArabic})
            </h3>
            <p className="text-xs font-bold text-slate-500">
              بمجرد الضغط على «اعتماد كشجرة المنهج الرسمية»، ستظهر هذه الوحدات والدروس في استوديو التوليد والواجبات
            </p>
          </div>
          <button
            type="button"
            disabled={parsedPreviewUnits.length === 0}
            onClick={() => {
              if (parsedPreviewUnits.length === 0) return;
              saveImportedCurriculumUnitsSSOT(parsedPreviewUnits);
              setSavedUnits(loadActiveCurriculumUnitsSSOT(gradeId));
              setSavedToSSOT(true);
              setTimeout(() => setSavedToSSOT(false), 3000);
            }}
            className="min-h-[44px] px-5 py-2 rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white text-xs font-black shadow-sm cursor-pointer"
          >
            {savedToSSOT
              ? "✓ تم حفظ واعتماد وحدات ودروس هذا الصف!"
              : "💾 اعتماد وحفظ كشجرة المنهج الرسمية لهذا الصف"}
          </button>
        </div>

        <textarea
          rows={5}
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder={`الصق هنا رد NotebookLM لتقسيم المنهج... مثال:\n=== [UNIT: 1] | الفرع: الجبر | العنوان: العلاقات والدوال ===\n- [LESSON: 1] حاصل الضرب الديكارتي | المفاهيم: الزوج المرتب، الشبكة البيانية`}
          className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold leading-relaxed"
        />
      </div>

      {/* عرض الوحدات الحقيقية المعتمدة لهذا الصف */}
      {unitsToDisplay.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
          <div className="text-2xl">📂</div>
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
            لا توجد وحدات محفوظة بعد لـ ({selectedGrade?.nameArabic})
          </h4>
          <p className="text-xs font-bold text-slate-500 max-w-lg mx-auto">
            اضغط على زر «نسخ البرومبت وفتح NotebookLM» بالأعلى، ثم الصق الرد هنا واضغط «اعتماد وحفظ» لتظهر وحداتك ودروسك الحقيقية في كامل المنصة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {unitsToDisplay.map((unit) => (
            <div
              key={unit.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-xl bg-teal-500/15 text-teal-800 dark:text-teal-300 text-xs font-black">
                  الفرع: {unit.branchNameArabic}
                </span>
                <span className="text-xs font-extrabold text-slate-400">
                  الوحدة {unit.orderIndex}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {unit.titleArabic}
              </h4>
              <ul className="space-y-2 pt-1">
                {unit.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 text-xs"
                  >
                    <div className="font-black text-slate-800 dark:text-slate-100">
                      {lesson.orderIndex}. {lesson.titleArabic}
                    </div>
                    {lesson.coreConcepts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {lesson.coreConcepts.map((c, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold"
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
          ))}
        </div>
      )}
    </div>
  );
}
