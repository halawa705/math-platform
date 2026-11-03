"use client";

/**
 * @file curriculum-notebooklm-splitter-tab.tsx
 * @description تبويب تقسيم المنهج واستيراد الوحدات والدروس الحقيقية عبر جسر NotebookLM
 * مربوط مباشرة بمصدر الحقيقة `curriculum-hierarchy-ssot.ts` وروابط NotebookLM في `teacher-identity-ssot.ts`.
 * يضمن عزلاً تاماً لكل صف دراسي وتفريغ المسودة عند الاعتماد أو تغيير الصف لمنع التداخل بين المناهج.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 260 سطراً).
 */

import { useEffect, useState } from "react";
import StudioCollapsibleSectionCard from "@/features/generation-studio-hub/studio-collapsible-section-card";
import CalmLabeledInputField from "@/components/global-ui/calm-labeled-input-field";
import {
  CURRICULUM_UNITS_UPDATED_EVENT,
  buildCurriculumSplitterPrompt,
  deleteCurriculumUnitsForGradeSSOT,
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

export interface CurriculumNotebooklmSplitterTabProps {
  readonly initialGradeId?: string;
}

export default function CurriculumNotebooklmSplitterTab({
  initialGradeId,
}: CurriculumNotebooklmSplitterTabProps = {}) {
  const [enabledGrades, setEnabledGrades] = useState(() => loadEnabledGradesSSOT());
  const [gradeId, setGradeId] = useState<string>(() => {
    const list = loadEnabledGradesSSOT();
    if (initialGradeId && list.some((g) => g.id === initialGradeId)) return initialGradeId;
    return list[0]?.id || "prep-3";
  });
  const [termNumber, setTermNumber] = useState<1 | 2>(1);
  const [gradeNotebookUrl, setGradeNotebookUrl] = useState<string>("");
  const [customEditablePrompt, setCustomEditablePrompt] = useState<string>("");
  const [rawInput, setRawInput] = useState<string>("");
  const [savedUnits, setSavedUnits] = useState<readonly CurriculumUnitNode[]>([]);
  const [copiedAndOpened, setCopiedAndOpened] = useState<boolean>(false);
  const [savedToSSOT, setSavedToSSOT] = useState<boolean>(false);

  // مزامنة سحابية أولية لمرة واحدة عند تحميل المكون إن لم تكن هناك بيانات محلية
  useEffect(() => {
    void pullCurriculumUnitsFromSupabaseCloud().then((cloudUnits) => {
      if (cloudUnits && cloudUnits.length > 0) {
        const local = loadActiveCurriculumUnitsSSOT();
        const hasBad = local.some((u) => u.titleArabic.length <= 18 || (u.orderIndex > 1 && u.lessons[0]?.titleArabic?.includes("الكسور العشرية")));
        if (local.length === 0 || hasBad) {
          saveImportedCurriculumUnitsSSOT(cloudUnits);
          setSavedUnits(loadActiveCurriculumUnitsSSOT(gradeId));
        }
      }
    });
  }, [gradeId]);

  // تحديث بيانات الصف المحدد
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

    const generatedPrompt = buildCurriculumSplitterPrompt({
      gradeId: targetGrade?.id || gradeId,
      gradeName: targetGrade?.nameArabic || "الصف الثالث الإعدادي",
      termNumber,
    });
    setCustomEditablePrompt(generatedPrompt);
  }, [gradeId, termNumber]);

  // الاستماع لتحديثات الـ SSOT
  useEffect(() => {
    const refresh = () => setSavedUnits(loadActiveCurriculumUnitsSSOT(gradeId));
    window.addEventListener(CURRICULUM_UNITS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CURRICULUM_UNITS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [gradeId]);

  // عند تغيير الصف: تفريغ حقل اللصق لمنع تسريب وحدات صف لصف آخر
  const handleGradeChange = (newGradeId: string) => {
    setGradeId(newGradeId);
    setRawInput("");
    setSavedUnits(loadActiveCurriculumUnitsSSOT(newGradeId));
  };

  const parsedPreviewUnits: readonly CurriculumUnitNode[] = rawInput.trim()
    ? parseCurriculumSplitterResponse(rawInput, gradeId, termNumber)
    : [];

  const handleSaveGradeNotebookUrl = (url: string) => {
    setGradeNotebookUrl(url);
    const identity = loadTeacherIdentitySSOT();
    saveTeacherIdentitySSOT({
      ...identity,
      notebookLmUrlsByGrade: { ...identity.notebookLmUrlsByGrade, [gradeId]: url },
    });
  };

  const handleApproveCurriculum = () => {
    if (parsedPreviewUnits.length === 0) return;
    saveImportedCurriculumUnitsSSOT(parsedPreviewUnits);
    setRawInput(""); // تفريغ حقل اللصق فوراً بعد الاعتماد
    setSavedUnits(loadActiveCurriculumUnitsSSOT(gradeId));
    setSavedToSSOT(true);
    setTimeout(() => setSavedToSSOT(false), 3000);
  };

  const handleDeleteGradeUnits = () => {
    if (!window.confirm(`هل أنت متأكد من مسح جميع وحدات (${selectedGrade?.nameArabic || "هذا الصف"})؟`)) return;
    deleteCurriculumUnitsForGradeSSOT(gradeId);
    setSavedUnits([]);
  };

  const selectedGrade = enabledGrades.find((g) => g.id === gradeId) || enabledGrades[0];
  const gradeName = selectedGrade?.nameArabic || "";

  return (
    <div className="space-y-4">
      {/* تنبيه واضح للصف المستهدف بالتقسيم */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
        <span className="text-xl">🎯</span>
        <div>
          <p className="text-xs font-black text-amber-900 dark:text-amber-200">
            أنت تقوم حالياً بتقسيم واستيراد منهج: {gradeName} ({termNumber === 1 ? "الفصل الأول" : "الفصل الثاني"})
          </p>
          <p className="text-[11px] font-bold text-amber-700/90 dark:text-amber-400">
            كود المنهج: <code className="px-1 py-0.5 rounded bg-amber-500/20 font-mono text-[10px]">{gradeId}</code> — الوحدات التي تُعتمد هنا ستُسجل حصراً لهذا الصف دون تداخل مع صفوف أخرى.
          </p>
        </div>
      </div>

      {/* الخطوة ١: اختيار الصف وربط NotebookLM ونسخ البرومبت */}
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
              <select
                value={gradeId}
                onChange={(e) => handleGradeChange(e.target.value)}
                className={SELECT_CLASS}
              >
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
              البرومبت الموجه لـ NotebookLM (يمكنك تعديله)
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
            className="w-full min-h-[48px] rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-black cursor-pointer hover:opacity-90 transition-opacity"
          >
            {copiedAndOpened ? "✓ تم النسخ وفتح NotebookLM" : "نسخ البرومبت وفتح NotebookLM ↗"}
          </button>
        </div>
      </StudioCollapsibleSectionCard>

      {/* الخطوة ٢: لصق رد NotebookLM */}
      <StudioCollapsibleSectionCard
        icon="📥"
        titleAr={`٢. لصق رد تقسيم المنهج لـ (${gradeName})`}
        summaryAr="الصق الرد النصي المستخرج من نوت بوك لاعتماده في المنصة"
        defaultOpen
      >
        <div className="space-y-3 pt-2">
          <textarea
            rows={5}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={`الصق هنا رد NotebookLM لتقسيم منهج ${gradeName}... مثال:\n=== [UNIT: 1] | الفرع: الجبر | العنوان: العلاقات والدوال ===\n- [LESSON: 1] حاصل الضرب الديكارتي | المفاهيم: الزوج المرتب، الشبكة البيانية`}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold leading-relaxed"
          />

          {parsedPreviewUnits.length > 0 && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 dark:text-emerald-200">
                  تم استخراج {parsedPreviewUnits.length} وحدة جاهزة للاعتماد
                </span>
                <button
                  type="button"
                  onClick={() => setRawInput("")}
                  className="text-[11px] font-bold text-slate-500 hover:text-rose-500 cursor-pointer"
                >
                  إلغاء وتفريغ
                </button>
              </div>

              <button
                type="button"
                onClick={handleApproveCurriculum}
                className="w-full min-h-[48px] rounded-2xl bg-emerald-700 text-white text-sm font-black cursor-pointer hover:bg-emerald-800 transition-colors"
              >
                {savedToSSOT ? "✓ تم اعتماد الوحدات بنجاح!" : `اعتماد كشجرة المنهج الرسمية لـ (${gradeName})`}
              </button>
            </div>
          )}
        </div>
      </StudioCollapsibleSectionCard>

      {/* الخطوة ٣: عرض الوحدات المعتمدة فعلياً في المنصة لهذا الصف */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">
              الوحدات والدروس المعتمدة حالياً لـ ({gradeName})
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              ({savedUnits.length} وحدة)
            </span>
          </div>

          {savedUnits.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteGradeUnits}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              مسح وحدات هذا الصف
            </button>
          )}
        </div>

        <CurriculumSavedUnitsList units={savedUnits} gradeNameAr={gradeName} />
      </section>
    </div>
  );
}