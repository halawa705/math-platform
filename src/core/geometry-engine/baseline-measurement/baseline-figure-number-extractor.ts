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

/** كل الأعداد الواردة في النص (بعد توحيد الأرقام المشرقية). */
export function extractNumbersFromProblemText(text: string): Set<string> {
  const western = toWesternNumeralsSSOT(text).replace(/٫/g, ".");
  const found = western.match(/\d+(?:\.\d+)?/g) ?? [];
  return new Set(found.map(normalizeNumberToken));
}

/** الأعداد الصرفة المعروضة على الشكل (أطوال الأضلاع وقياسات الزوايا؛ التعبيرات الجبرية تُهمل). */
export function extractNumbersShownOnFigure(figure: CanonicalGeometryFigureIR): Set<string> {
  const shown = new Set<string>();
  const addIfPureNumber = (raw: string | number | undefined): void => {
    if (raw === undefined) return;
    const clean = toWesternNumeralsSSOT(raw).replace(/[°\s]/g, "");
    if (/^\d+(?:\.\d+)?$/.test(clean)) shown.add(normalizeNumberToken(clean));
  };
  for (const seg of figure.segments) addIfPureNumber(seg.lengthLabel?.value);
  for (const ang of figure.angles) {
    if (ang.degreesLabel !== undefined) addIfPureNumber(ang.degreesLabel);
    else if (ang.degrees !== undefined && !ang.isRightAngle) addIfPureNumber(ang.degrees);
  }
  return shown;
}
