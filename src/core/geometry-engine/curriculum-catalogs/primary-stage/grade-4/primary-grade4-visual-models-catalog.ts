/**
 * @file primary-grade4-visual-models-catalog.ts
 * @description مطابق نماذج الصف الرابع الابتدائي البصرية (النموذج الشريطي + الساعة التناظرية).
 * مبني على الحقائق المُحلَّلة من النص فقط؛ عند أي نقص يعيد undefined (لا شكل).
 */
import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import { parseBarModelFacts } from "./primary-grade4-bar-model-fact-parser";
import { buildGrade4BarModelSvgMarkup } from "./primary-grade4-bar-model-svg-builder";
import { parseAnalogClockTime, buildGrade4AnalogClockSvgMarkup } from "./primary-grade4-analog-clock-svg-builder";

export const MODULE_ID_PRIMARY_GRADE4_VISUAL_MODELS_CATALOG = "primary_grade4_visual_models_catalog" as const;

export function matchPrimaryGrade4VisualModelsFigure(
  description: string,
  figureId = "primary4_visual_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = (description || "").trim();
  if (!d) return undefined;
  const numeralMode = notationLanguage === "arabic" ? "eastern" : "western";
  const base = {
    figureId,
    familyId: "primary_visual_models_family" as const,
    notationLanguage,
    vertices: [{ id: `${figureId}_v0`, label: "0", position: { x: 0, y: 0 } }],
    segments: [],
    angles: [],
  };

  const bar = parseBarModelFacts(d);
  if (bar) {
    return { ...base, branchId: "primary_bar_model", titleArabic: "النموذج الشريطي", rawSvgMarkup: buildGrade4BarModelSvgMarkup(bar, numeralMode) } as CanonicalGeometryFigureIR;
  }
  const clock = parseAnalogClockTime(d);
  if (clock) {
    return { ...base, branchId: "primary_analog_clock", titleArabic: "الساعة التناظرية", rawSvgMarkup: buildGrade4AnalogClockSvgMarkup(clock) } as CanonicalGeometryFigureIR;
  }
  return undefined;
}
