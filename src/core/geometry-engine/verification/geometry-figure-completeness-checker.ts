/**
 * @file geometry-figure-completeness-checker.ts
 * @description فاحص اكتمال المعطيات الهندسية على الشكل (المرحلة 1 - سد الثغرات الخطرة):
 * يتأكد من أن كل معطى عددي بُعدي صريح في نص المسألة أو وسم الرسم (طول، نصف قطر، زاوية، إحداثي)
 * ظاهر فعلياً على الشكل المرسوم، ويرصد أي معطيات مفقودة لمنع رسم أشكال ناقصة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 150 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import { toWesternNumeralsSSOT } from "../../ssot/numeral-and-unit-ssot";
import { extractNumbersShownOnFigure } from "../baseline-measurement/baseline-figure-number-extractor";

export const MODULE_ID_GEOMETRY_FIGURE_COMPLETENESS_CHECKER =
  "geometry_figure_completeness_checker" as const;

function normalizeNumericToken(raw: string): string {
  const parsed = parseFloat(raw);
  return Number.isNaN(parsed) ? raw : String(parsed);
}

/**
 * يستخرج الأرقام البُعدية المعطاة صراحة في الوصف الهندسي (الأطوال، الزوايا، الإحداثيات)
 * مع استبعاد أرقام الفهرسة المرجعية (ص 210، مسألة 8، شكل 3-1) وجمل المطلوب/الجواب.
 */
export function extractExplicitDimensionalGivensFromPrompt(rawText: string): Set<string> {
  const givens = new Set<string>();
  if (!rawText) return givens;

  const clean = toWesternNumeralsSSOT(rawText)
    .replace(/٫/g, ".")
    // حذف ترويسات الاختبارات وأرقام الصفحات والمسائل والأشكال المرجعية
    .replace(/NotebookLM\s+intake\s+#\d+/gi, " ")
    .replace(/(?:مسألة|مثال|تدريب|سؤال|صفحة|ص|شكل|رقم)\s*\(?\s*\d+(?:\s*[-–]\s*\d+)?\s*\)?/g, " ")
    // حذف عبارات عدد محاور التماثل أو عدد الأضلاع/الزوايا/المستقيمات الوصفية
    .replace(/(?:عدد\s*محاور\s*تماثل[هـا]?|محاور\s*تماثل\s*عددها|عددها)\s*\d+/g, " ")
    .replace(/\d+\s*(?:محاور|أضلاع|زوايا|رؤوس|مستقيمات|دوائر|مثلثات|قطع)/g, " ")
    // حذف الصيغ الرمزية العامة مثل x1, x2, y1, y2 والأدلة السفلية (₁, ₂)
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, " ")
    .replace(/[xyسص]_[12]|[xyسص][12]/gi, " ")
    // حذف معادلات مجموع الزوايا أو محيطات المثلثات لأنها علاقات جبرية وليست بطاقة ضلع أو زاوية مفردة
    .replace(/(?:مجموع|محيط)\s+[^؛;\n=]*?(?:=|يساوي|تساوي|هو|هي)\s*\d+(?:\.\d+)?\s*(?:سم|م|°|\^?\\circ|درجة)?/g, " ")
    .replace(/(?:ق|m|\\angle|∠)[^؛;\n=]*?\+\s*(?:ق|m|\\angle|∠)[^؛;\n=]*?=\s*\d+(?:\.\d+)?\s*(?:°|\^?\\circ|درجة)?/gi, " ")
    // حذف ذيل المطلوب/الإجابة حتى لا يُطالب الشكل بإظهار الجواب النهائي
    .replace(/(?:أوجد|اوجد|احسب|لإيجاد|لايجاد|لحساب|أثبت\s*أن|اثبت\s*ان|برهن\s*أن)\s+[^؛;\n]*$/i, " ");

  // 1. أطوال أو زوايا بصيغة مساواة أو قياس (= 8، = 63°، طوله 5، عرضه 6، نق = 5، بزاوية 70°)
  const measureMatches = clean.matchAll(
    /(?:=|طول[هـا]?|عرض[هـا]?|ارتفاع[هـا]?|نصف\s*قطر[هـا]?|قطر[هـا]?|ظل[هـا]?|يبعد|المسافة\s*بين[^\d]{0,20}|بزاوية|قياس[هـا]?|زواياه)\s*\(?\s*(\d+(?:\.\d+)?)/g
  );
  for (const m of measureMatches) {
    const token = normalizeNumericToken(m[1]);
    if (token !== "90" && token !== "180" && token !== "360") {
      givens.add(token);
    }
  }

  // 2. أي رقم متبوع مباشرة بوحدة طول أو رمز درجة (مثل 12 سم، 1.8 م، 65°، 110 درجة)
  const unitMatches = clean.matchAll(/(\d+(?:\.\d+)?)\s*(?:سم²|م²|سم|مم|كم|ديسم|متر|وحدات|وحدة|°|درجة)(?![أ-يa-zA-Z])/gi);
  for (const m of unitMatches) {
    const token = normalizeNumericToken(m[1]);
    if (token !== "90" && token !== "180" && token !== "360") {
      givens.add(token);
    }
  }

  // 3. إحداثيات النقاط الصريحة مثل A(2, 3) أو B(-4, -1)
  const coordMatches = clean.matchAll(/[A-Za-zأ-ي]\s*\(\s*(-?\d+(?:\.\d+)?)\s*[,،]\s*(-?\d+(?:\.\d+)?)\s*\)/g);
  for (const m of coordMatches) {
    const x = normalizeNumericToken(m[1].replace(/^-/, ""));
    const y = normalizeNumericToken(m[2].replace(/^-/, ""));
    if (x !== "0" || y !== "0") {
      givens.add(x);
      givens.add(y);
    }
  }

  return givens;
}

/**
 * يتحقق من أن جميع المعطيات البُعدية الصريحة في الوصف ظاهرة على الشكل المرسوم.
 */
export function findMissingDimensionalGivensOnFigure(
  figure: CanonicalGeometryFigureIR,
  rawPromptOrDescription: string
): readonly string[] {
  if (figure.familyId === "statistics_family" || Boolean(figure.rawSvgMarkup)) {
    return [];
  }
  const expectedGivens = extractExplicitDimensionalGivensFromPrompt(rawPromptOrDescription);
  if (expectedGivens.size === 0) return [];

  const shownOnFigure = extractNumbersShownOnFigure(figure);
  const missing: string[] = [];
  for (const num of expectedGivens) {
    if (!shownOnFigure.has(num)) {
      missing.push(num);
    }
  }
  return missing;
}
