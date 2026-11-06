"use client";

/**
 * @file studio-geometry-understood-facts-editor.tsx
 * @description محرر قائمة الحقائق التفاعلي للأشكال الصفراء والمبهمة (المهمة 7.1):
 * يعرض «ما فهمه النظام» من وصف NotebookLM كعناصر قابلة للنقر والتعديل الفوري،
 * يتيح للمعلم تصحيح خطأ إملائي أو إضافة ضلع مفقود، ويُعيد فحص الشكل لحظياً ليتحول الأصفر إلى أخضر
 * دون الحاجة لإعادة التوليد أو استهلاك توكنز إضافية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 220 سطراً).
 */

import { useState } from "react";
import { splitDescriptionIntoFactStrings } from "@/core/geometry-engine/fact-compositor/geo-fact-splitter";
import { parseGeoFactString } from "@/core/geometry-engine/fact-compositor/geo-fact-parser";
import {
  extractAngleFanSpecFromDescription,
  splitAngleFanClauses,
} from "@/core/geometry-engine/angle-fan-family/angle-fan-fact-extractor";
import { recomposeFactsToGeometricDescription } from "@/core/geometry-engine/fact-compositor/geo-facts-recomposer";

export const MODULE_ID_STUDIO_GEOMETRY_UNDERSTOOD_FACTS_EDITOR =
  "studio_geometry_understood_facts_editor" as const;

export interface StudioGeometryUnderstoodFactsEditorProps {
  readonly description: string;
  readonly onChangeDescription: (nextDescription: string) => void;
}

export default function StudioGeometryUnderstoodFactsEditor({
  description,
  onChangeDescription,
}: StudioGeometryUnderstoodFactsEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [newFactText, setNewFactText] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  const embeddedTag = description.match(/\[\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*([^\]]+)\]/i)?.[1]?.trim();
  const effectiveDesc = embeddedTag || description;

  const isStatistics =
    /مخطط\s*الصندوق|الربيعيات|مخطط\s*(?:التمثيل\s*بالنقاط|النقاط)|تمثيل\s*بالنقاط|مدرج\s*تكراري|المدرج\s*التكراري|أعمدة\s*بيانية|عروض\s*التليفزيون|وجبات\s*الغذاء|أعمار\s*بعض\s*الأشخاص|درجات\s*الاختبار|عدد\s*الإخوة/i.test(
      effectiveDesc
    );
  const isAngleFan = !isStatistics && extractAngleFanSpecFromDescription(effectiveDesc) !== null;

  const rawFacts: string[] = isStatistics
    ? ["نموذج إحصاء بياني معتمد"]
    : isAngleFan
    ? [...splitAngleFanClauses(effectiveDesc)]
    : [...splitDescriptionIntoFactStrings(effectiveDesc)];

  const factsWithStatus = rawFacts.map((text) => ({
    text,
    ok: isStatistics || isAngleFan || parseGeoFactString(text) !== null,
  }));

  const handleStartEdit = (index: number, currentText: string) => {
    setEditingIndex(index);
    setEditText(currentText);
    setIsAddingNew(false);
  };

  const handleSaveEdit = (index: number) => {
    const updated = [...rawFacts];
    if (editText.trim().length > 0) {
      updated[index] = editText.trim();
    } else {
      updated.splice(index, 1);
    }
    setEditingIndex(null);
    setEditText("");
    onChangeDescription(recomposeFactsToGeometricDescription(updated));
  };

  const handleDeleteFact = (index: number) => {
    const updated = rawFacts.filter((_, i) => i !== index);
    setEditingIndex(null);
    onChangeDescription(recomposeFactsToGeometricDescription(updated));
  };

  const handleAddNewFact = () => {
    if (newFactText.trim().length === 0) return;
    const updated = [...rawFacts, newFactText.trim()];
    setNewFactText("");
    setIsAddingNew(false);
    onChangeDescription(recomposeFactsToGeometricDescription(updated));
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-200">
          <span>🧠 ما فهمه النظام من المعطيات</span>
          <span className="text-[10px] font-bold text-slate-500">(انقر على أي حقيقة لتعديلها فورياً)</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsAddingNew(true);
            setEditingIndex(null);
          }}
          className="min-h-[32px] px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-black text-indigo-900 dark:text-teal-300 hover:bg-indigo-100 cursor-pointer"
        >
          + إضافة حقيقة
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {factsWithStatus.map((f, i) => {
          const isThisEditing = editingIndex === i;

          if (isThisEditing) {
            return (
              <div
                key={i}
                className="flex items-center gap-1.5 p-1.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-slate-900 w-full sm:w-auto"
              >
                <input
                  type="text"
                  dir="auto"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(i)}
                  className="px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-xs font-bold min-w-[180px] flex-1"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleSaveEdit(i)}
                  className="min-h-[36px] px-3 rounded-lg bg-emerald-600 text-white text-xs font-black cursor-pointer hover:bg-emerald-700"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteFact(i)}
                  className="min-h-[36px] px-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-black cursor-pointer hover:bg-rose-100"
                  title="حذف هذه الحقيقة"
                >
                  🗑️
                </button>
                <button
                  type="button"
                  onClick={() => setEditingIndex(null)}
                  className="min-h-[36px] px-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            );
          }

          return (
            <button
              key={`${i}-${f.text}`}
              type="button"
              onClick={() => handleStartEdit(i, f.text)}
              dir="auto"
              className={`min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-transform hover:scale-[1.02] cursor-pointer ${
                f.ok
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                  : "bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 animate-pulse"
              }`}
              title="انقر لتعديل هذه الحقيقة"
            >
              <span>{f.ok ? "✓" : "⚠"}</span>
              <span>{f.text}</span>
            </button>
          );
        })}
      </div>

      {isAddingNew && (
        <div className="flex items-center gap-1.5 p-2 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/30 dark:bg-slate-900/50">
          <input
            type="text"
            dir="auto"
            placeholder="مثال: أ ب = 7 سم أو زاوية ب قائمة..."
            value={newFactText}
            onChange={(e) => setNewFactText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNewFact()}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-xs font-bold flex-1"
            autoFocus
          />
          <button
            type="button"
            onClick={handleAddNewFact}
            className="min-h-[36px] px-3 rounded-lg bg-indigo-900 dark:bg-indigo-700 text-white text-xs font-black cursor-pointer hover:bg-indigo-800"
          >
            إضافة
          </button>
          <button
            type="button"
            onClick={() => setIsAddingNew(false)}
            className="min-h-[36px] px-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      )}
    </div>
  );
}
