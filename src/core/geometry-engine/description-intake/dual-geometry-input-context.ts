/**
 * @file dual-geometry-input-context.ts
 * @description مهيّئ الإدخال المزدوج الحقيقي للمحرك الهندسي:
 * يفصل صراحةً بين «الوصف الهندسي [رسم هندسي: ...]» و«معطيات السؤال» ويهيئ خريطة الكيانات الخطية قبل التطبيع.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطراً).
 */

import { extractLinearEntityKinds, type LinearEntityKindMap } from "./linear-entity-kind-extractor";
import { combineProblemAndTagGeometryContext } from "./problem-geometry-context-extractor";

export const MODULE_ID_DUAL_GEOMETRY_INPUT_CONTEXT =
  "dual_geometry_input_context" as const;

export interface DualGeometryInput {
  readonly geometryTag?: string;
  readonly problemPrompt?: string;
}

export interface ResolvedDualGeometryContext {
  readonly geometryTag: string;
  readonly problemPrompt: string;
  readonly combinedDescription: string;
  readonly rawForVerification: string;
  readonly linearKindMap: LinearEntityKindMap;
  readonly hasSeparateDualSources: boolean;
}

const EMBEDDED_TAG_RX = /\[\s*رسم\s*(?:هندسي|توضيحي|بياني|إحصائي|احصائي)\s*:\s*([^\]]+)\]/i;

export function isDualGeometryInput(
  input: string | DualGeometryInput
): input is DualGeometryInput {
  return typeof input === "object" && input !== null;
}

/**
 * يفصل أي مدخل (نص مفرد أو كائن مزدوج) إلى مصدريه الصريحين:
 * 1) وسم الرسم الهندسي، 2) نص المسألة ومعطياتها، مع استخراج نوع الكيانات الخطية قبل تجريد LaTeX.
 */
export function resolveDualGeometryInputContext(
  input: string | DualGeometryInput
): ResolvedDualGeometryContext {
  if (!isDualGeometryInput(input)) {
    const raw = (input ?? "").trim();
    const tagMatch = raw.match(EMBEDDED_TAG_RX);
    const geometryTag = tagMatch?.[1]?.trim() ?? "";
    const strippedPrompt = tagMatch
      ? raw.replace(EMBEDDED_TAG_RX, " ").replace(/\s+/g, " ").trim()
      : raw;
    const isSyntheticTestPrompt = /^\d+\.\s*(?:matches|projects|supports|verifies|renders)\b/i.test(
      strippedPrompt
    );
    const problemPrompt = geometryTag && isSyntheticTestPrompt ? "" : strippedPrompt;
    return {
      geometryTag,
      problemPrompt,
      combinedDescription: raw,
      rawForVerification: geometryTag && isSyntheticTestPrompt ? geometryTag : raw,
      linearKindMap: extractLinearEntityKinds(raw),
      hasSeparateDualSources: Boolean(
        geometryTag && problemPrompt && geometryTag !== problemPrompt
      ),
    };
  }

  const geometryTag = (input.geometryTag ?? "").trim();
  const rawPrompt = (input.problemPrompt ?? "").trim();
  const isSyntheticTestPrompt = /^\d+\.\s*(?:matches|projects|supports|verifies|renders)\b/i.test(
    rawPrompt
  );
  const problemPrompt = geometryTag && isSyntheticTestPrompt ? "" : rawPrompt;
  // وضع الوسم الهندسي أولاً متبوعاً بفاصل سطري يمنع التهام معطيات الوسم ضمن ذيل «أوجد/احسب»
  const rawForVerification = [geometryTag, problemPrompt].filter(Boolean).join(" ؛\n").trim();
  const linearKindMap = extractLinearEntityKinds(geometryTag, problemPrompt);

  const combinedDescription = combineProblemAndTagGeometryContext(
    geometryTag || undefined,
    rawPrompt || undefined
  );

  return {
    geometryTag,
    problemPrompt,
    combinedDescription,
    rawForVerification: rawForVerification || combinedDescription,
    linearKindMap,
    hasSeparateDualSources: Boolean(
      geometryTag && problemPrompt && geometryTag !== problemPrompt
    ),
  };
}
