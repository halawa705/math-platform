/**
 * @file baseline-figure-number-extractor.ts
 * @description يستخرج الأرقام الهندسية من نص المسألة ومن الشكل المرسوم لمقارنتهما (فحصا الاكتمال والتسريب).
 */
import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import { toWesternNumeralsSSOT } from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_BASELINE_FIGURE_NUMBER_EXTRACTOR = "baseline_figure_number_extractor" as const;

function normalizeNumberToken(raw: string): string {
  const parsed = parseFloat(raw);
  return Number.isNaN(parsed) ? raw : String(parsed);
}

/** كل الأعداد الواردة في النص (بعد توحيد الأرقام المشرقية وإزالة فواصل الآلاف). */
export function extractNumbersFromProblemText(text: string): Set<string> {
  const western = toWesternNumeralsSSOT(text)
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, "")
    .replace(/٫/g, ".")
    .replace(/(?<=\d),(?=\d{3}(?!\d))/g, "");
  const found = western.match(/\d+(?:\.\d+)?/g) ?? [];
  return new Set(found.map(normalizeNumberToken));
}

/** الأعداد المعطاة في نص المسألة (مع استبعاد جملة المطلوب/الجواب مثل «أوجد قيمة X = 25°» حتى لا يُطالَب الشكل بتسريب الحل). */
export function extractGivenNumbersFromProblemText(text: string): Set<string> {
  const withoutAnswerTail = text
    .replace(/\b\d+\.\s*matches\b|\bProblem\s*\d+(?:-\d+)?\b|\bp\.\s*\d+\b/gi, " ")
    .replace(/\b[LlMm]\s*[1-9]\b/g, " ")
    .replace(/(?:عدد\s*محاور\s*تماثل[هـا]?|محاور\s*تماثل[هـا]?\s*(?:عددها)?)\s*\d+|\d+\s*(?:محاور|axes)/gi, " ")
    .replace(/\b[A-Z]{2}\s*=\s*\d+\s*[A-Z]{2}\b/g, " ")
    .replace(/\b(?:to\s+(?:find|prove|calculate|show|determine))\b[^;؛\n]*/gi, " ")
    .replace(/(?:أوجد|اوجد|احسب|لإيجاد|لايجاد|لحساب|أثبت|اثبت|فأثبت|فاثبت|برهن|لإثبات|لاثبات|حدد\s+موضع)\s+[^؛;\n]*/gi, " ")
    .replace(/(?:مجموع|محيط)\s+[^؛;\n=]*?(?:=|يساوي|تساوي|هو|هي)\s*\d+(?:\.\d+)?\s*(?:سم|م|°|\^?\\circ|درجة)?/g, " ")
    .replace(/(?:نسبة\s*التشابه|معامل\s*التشابه)\s*(?:=|تساوي|يساوي|هي|هو)?\s*(?:\\frac\{\d+\}\{\d+\}|\d+\s*[/:]\s*\d+|\d+(?:\.\d+)?)/gi, " ")
    .replace(/\^\s*\d+/g, " ")
    .replace(
      /(?:sin|cos|tan|cot|sec|csc|جا|جتا|ظا|قتا|قا|ظتا)\s*(?:\([^)]*\)|[A-Za-zθβأ-ي0-9°]+)\s*=\s*(?:\\frac\{\d+\}\{\d+\}|\(?\s*-?\d+(?:\.\d+)?\s*\)?(?:\s*\/\s*\(?\s*-?\d+(?:\.\d+)?\s*\)?)?)/gi,
      " "
    )
    .replace(/(?:ق|m|\\angle|∠)[^؛;\n=]*?\+\s*(?:ق|m|\\angle|∠)[^؛;\n=]*?=\s*\d+(?:\.\d+)?\s*(?:°|\^?\\circ|درجة)?/gi, " ");
  return extractNumbersFromProblemText(withoutAnswerTail);
}

function addAllNumbersFromText(raw: string | number | undefined, into: Set<string>): void {
  if (raw === undefined) return;
  const clean = toWesternNumeralsSSOT(raw)
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, "")
    .replace(/٫/g, ".")
    .replace(/(?<=\d),(?=\d{3}(?!\d))/g, "");
  for (const n of clean.match(/\d+(?:\.\d+)?/g) ?? []) {
    into.add(normalizeNumberToken(n));
  }
}

/** الأعداد المعروضة على الشكل (أطوال، زوايا عددية أو جبرية، إحداثيات رؤوس، وعناصر SVG البيانية). */
export function extractNumbersShownOnFigure(figure: CanonicalGeometryFigureIR): Set<string> {
  const shown = new Set<string>();
  if (figure.rawSvgMarkup) {
    addNumbersFromRawSvgText(figure.rawSvgMarkup, shown);
    return shown;
  }
  for (const v of figure.vertices) {
    const cleanLabel = toWesternNumeralsSSOT(v.label);
    // نستخرج فقط الإحداثيات الصريحة داخل أقواس مثل A(2, 3) ونتجاهل الإحداثي الصفري للمسقط A'(2, 0)
    const isProjectedPrime = cleanLabel.includes("'");
    for (const coordMatch of cleanLabel.matchAll(/\(\s*(-?\d+(?:\.\d+)?)\s*[,،]\s*(-?\d+(?:\.\d+)?)\s*\)/g)) {
      const x = normalizeNumberToken(coordMatch[1].replace(/^-/, ""));
      const y = normalizeNumberToken(coordMatch[2].replace(/^-/, ""));
      if (!isProjectedPrime || x !== "0") shown.add(x);
      if (!isProjectedPrime || y !== "0") shown.add(y);
    }
    if (cleanLabel.includes("=") || /^[\[\]()]?\s*-?\d+(?:\.\d+)?\s*[\[\]()]?$/.test(cleanLabel.trim())) {
      addAllNumbersFromText(cleanLabel, shown);
    }
  }
  for (const seg of figure.segments) addAllNumbersFromText(seg.lengthLabel?.value, shown);
  for (const badge of figure.interiorBadges ?? []) addAllNumbersFromText(badge.text, shown);
  for (const ang of figure.angles) {
    if (ang.isRightAngle || ang.degrees === 90) shown.add("90");
    if (ang.degreesLabel !== undefined) addAllNumbersFromText(ang.degreesLabel, shown);
    else if (
      ang.degrees !== undefined &&
      !ang.isRightAngle &&
      ang.markSymbol !== "dot" &&
      ang.markSymbol !== "cross" &&
      !ang.arcCount
    ) {
      addAllNumbersFromText(ang.degrees, shown);
    }
  }
  return shown;
}

/** الأعداد المطبوعة أو الممثلة بيانياً داخل SVG جاهز، مع تجاهل أثاث المحاور الثابت (data-furniture). */
function addNumbersFromRawSvgText(svg: string | undefined, into: Set<string>): void {
  if (!svg) return;
  for (const m of svg.matchAll(/data-given-values="([^"]*)"/g)) {
    addAllNumbersFromText(m[1], into);
  }
  for (const m of svg.matchAll(/<text([^>]*)>([^<]*)<\/text>/g)) {
    if (m[1].includes("data-furniture")) continue;
    addAllNumbersFromText(m[2], into);
  }
}
