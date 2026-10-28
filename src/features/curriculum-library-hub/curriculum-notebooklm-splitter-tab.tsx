"use client";

/**
 * @file curriculum-notebooklm-splitter-tab.tsx
 * @description تبويب تقسيم المنهج واستيراد الوحدات والدروس الحقيقية عبر جسر NotebookLM
 * مربوط مباشرة بمصدر الحقيقة `curriculum-hierarchy-ssot.ts` وروابط NotebookLM في `teacher-identity-ssot.ts`.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { useEffect, useState } from "react";
import StudioCollapsibleSectionCard from "@/features/generation-studio-hub/studio-collapsible-section-card";
import CalmLabeledInputField from "@/components/global-ui/calm-labeled-input-field";
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
import CurriculumSavedUnitsList from "./curriculum-saved-units-list";

export const MODULE_ID_CURRICULUM_NOTEBOOKLM_SPLITTER_TAB =
  "curriculum_notebooklm_splitter_tab" as const;

const SELECT_CLASS =
  "w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black";

export default function CurriculumNotebooklmSplitterTab() {
  const [enabledGrades, setEnabledGrades] = useState(() => loadEnabledGradesSSOT());
  const [gradeId, setGradeId] = useState<string>("prep-3");
  const [termNumber, setTermNumber] = useState<1 | 2>(1);
  const [gradeNotebookUrl, setGradeNotebookUrl] = useState<string>("");
  const [customEditablePrompt, setCustomEditablePrompt] = useState<string>("");
  const [rawInput, setRawInput] = useState<string>("");
  const [savedUnits, setSavedUnits] = useState<readonly CurriculumUnitNode[]>([]);
  const [copiedAndOpened, setCopiedAndOpened] = useState<boolean>(false);
  const [savedToSSOT, setSavedToSSOT] = useState<boolean>(false);

  const selectedGrade = enabledGrades.find((g) => g.id === gradeId) || enabledGrades[0];

  useEffect(() => {
    const activeGrades = loadEnabledGradesSSOT();
    setEnabledGrades(activeGrades);
    const targetGrade = activeGrades.find((g) => g.id === gradeId) || activeGrades[0];
    if (targetGrade && targetGrade.id !== gradeId) {
      setGradeId(targetGrade.id);
    }
    const identity = loadTeacherIdentitySSOT();
    setGradeNotebookUrl(identity.notebookLmUrlsByGrade?.[targetGrade?.id || gradeId] || "");
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

  const unitsToDisplay = parsedPreviewUnits.length > 0 ? parsedPreviewUnits : savedUnits;

  const handleSaveGradeNotebookUrl = (url: string) => {
    setGradeNotebookUrl(url);
    const identity = loadTeacherIdentitySSOT();
    saveTeacherIdentitySSOT({
      ...identity,
      notebookLmUrlsByGrade: { ...identity.notebookLmUrlsByGrade, [gradeId]: url },
    });
  };

  const gradeName = selectedGrade?.nameArabic || "";

  return (
    <div className="space-y-3">
      {/* الخطوة ١: اختيار الصف وربط NotebookLM ونسخ البرومبت القابل للتعديل */}
      <StudioCollapsibleSectionCard
        icon="🧭"
        titleAr="١. استخراج المنهج من NotebookLM"
        summaryAr={`${gradeName} • الفصل ${termNumber === 1 ? "الأول" : "الثاني"}`}
        defaultOpen
      >
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-[11px] font-bold text-slate-500 mb-1">الصف الدراسي</span>
              <select value={gradeId} onChange={(e) => setGradeId(e.target.value)} className={SELECT_CLASS}>
                {enabledGrades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nameArabic}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-[11px] font-bold text-slate-500 mb-1">الفصل الدراسي</span>
              <select
                value={termNumber}
                onChange={(e) => setTermNumber(Number(e.target.value) as 1 | 2)}
                className={SELECT_CLASS}
              >
                <option value={1}>الفصل الأول</option>
                <option value={2}>الفصل الثاني</option>
              </select>
            </label>
          </div>

          <CalmLabeledInputField
            inputType="url"
            isLtr
            labelAr={`رابط دفتر NotebookLM (${gradeName})`}
            placeholder="https://notebooklm.google.com/notebook/..."
            value={gradeNotebookUrl}
            onChange={handleSaveGradeNotebookUrl}
          />

          <label className="block">
            <span className="block text-[11px] font-bold text-slate-500 mb-1">
              البرومبت الذي سيُنسخ (يمكنك تعديله)
            </span>
            <textarea
              rows={4}
              value={customEditablePrompt}
              onChange={(e) => setCustomEditablePrompt(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold leading-relaxed"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              copyPromptAndOpenGradeNotebookLmSSOT(customEditablePrompt, gradeId);
              setCopiedAndOpened(true);
              setTimeout(() => setCopiedAndOpened(false), 3000);
            }}
            className="w-full min-h-[48px] rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-black cursor-pointer"
          >
            {copiedAndOpened ? "✓ تم النسخ وفتح NotebookLM" : "نسخ البرومبت وفتح NotebookLM ↗"}
          </button>
        </div>
      </StudioCollapsibleSectionCard>

      {/* الخطوة ٢: لصق رد NotebookLM واعتماد الوحدات الحقيقية */}
      <StudioCollapsibleSectionCard
        icon="📥"
        titleAr="٢. لصق الرد واعتماده"
        summaryAr="الوحدات المعتمدة هي الوحيدة التي تظهر في المنصة"
      >
        <div className="space-y-3 pt-2">
          <textarea
            rows={5}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={`الصق هنا رد NotebookLM لتقسيم المنهج... مثال:\n=== [UNIT: 1] | الفرع: الجبر | العنوان: العلاقات والدوال ===\n- [LESSON: 1] حاصل الضرب الديكارتي | المفاهيم: الزوج المرتب، الشبكة البيانية`}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold leading-relaxed"
          />
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
            className="w-full min-h-[48px] rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 disabled:opacity-40 text-sm font-black cursor-pointer"
          >
            {savedToSSOT ? "✓ تم اعتماد وحدات هذا الصف" : "اعتماد كشجرة المنهج الرسمية"}
          </button>
        </div>
      </StudioCollapsibleSectionCard>

      <CurriculumSavedUnitsList units={unitsToDisplay} gradeNameAr={gradeName} />
    </div>
  );
}
