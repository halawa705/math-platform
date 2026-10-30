"use client";

/**
 * @file studio-geometry-understood-facts-panel.tsx
 * @description لوحة «ما فهمه النظام» في معمل الأشكال: تعرض كل حقيقة هندسية استُخرجت من وصف NotebookLM
 * (✓ مفهومة / ⚠ غير مفهومة) ليعرف المعلم فوراً ما الذي يحتاج إعادة صياغة.
 */
import { splitDescriptionIntoFactStrings } from "@/core/geometry-engine/fact-compositor/geo-fact-splitter";
import { parseGeoFactString } from "@/core/geometry-engine/fact-compositor/geo-fact-parser";
import {
  extractAngleFanSpecFromDescription,
  splitAngleFanClauses,
} from "@/core/geometry-engine/angle-fan-family/angle-fan-fact-extractor";

export const MODULE_ID_STUDIO_GEOMETRY_UNDERSTOOD_FACTS_PANEL = "studio_geometry_understood_facts_panel" as const;

export default function StudioGeometryUnderstoodFactsPanel({ description }: { readonly description: string }) {
  const embeddedTag = description.match(/\[\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*([^\]]+)\]/i)?.[1]?.trim();
  const effectiveDesc = embeddedTag || description;
  const isAngleFan = extractAngleFanSpecFromDescription(effectiveDesc) !== null;
  const facts = isAngleFan
    ? splitAngleFanClauses(effectiveDesc).map((text) => ({ text, ok: true }))
    : splitDescriptionIntoFactStrings(effectiveDesc).map((text) => ({
        text,
        ok: parseGeoFactString(text) !== null,
      }));
  if (facts.length === 0) return null;
  return (
    <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-3 space-y-1.5">
      <div className="text-[11px] font-black text-slate-700 dark:text-slate-300">ما فهمه النظام من الوصف:</div>
      <div className="flex flex-wrap gap-1.5">
        {facts.map((f, i) => (
          <span
            key={`${i}-${f.text}`}
            dir="auto"
            className={`px-2 py-1 rounded-lg text-[10.5px] font-bold border ${
              f.ok ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-amber-50 border-amber-300 text-amber-900"
            }`}
          >
            {f.ok ? "✓" : "⚠"} {f.text}
          </span>
        ))}
      </div>
    </div>
  );
}
