/**
 * @file question-figure-svg-renderer.ts
 * @description مصيّر موحد يختار بين الشكل الهندسي (CanonicalGeometryFigureIR) أو الرسم البياني (CartesianGraphSpec) ويعيد SVG.
 */
import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import type { CartesianGraphSpec } from "../ssot/cartesian-graph-spec-ssot";
import type { MathNotationLanguage, NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import { projectGeometryFigureToSVGMarkup } from "../geometry-engine/vector-svg-figure-projector";
import { projectCartesianGraphToSVGMarkup } from "../geometry-engine/graph-compositor/graph-svg-projector";
import { enhanceQuestionFigureSvgForPrint } from "./svg-monochrome-and-primary-print-enhancer";

export const MODULE_ID_QUESTION_FIGURE_SVG_RENDERER = "question_figure_svg_renderer" as const;

export interface RenderQuestionFigureSvgOptions {
  readonly widthPx?: number;
  readonly heightPx?: number;
  readonly strokeColorHex?: string;
  readonly accentColorHex?: string;
  readonly backgroundColorHex?: string;
  readonly numeralMode?: NumeralDisplayMode;
  readonly notationLanguage?: MathNotationLanguage;
  readonly monochromePrintSafe?: boolean;
  readonly strokeWidthMultiplier?: number;
}

export function renderQuestionFigureSvg(
  question: {
    readonly geometryFigure?: CanonicalGeometryFigureIR;
    readonly attachedGeometryFigure?: CanonicalGeometryFigureIR;
    readonly graphSpec?: CartesianGraphSpec;
    readonly rawSvgMarkup?: string;
  },
  options: RenderQuestionFigureSvgOptions = {}
): string | null {
  let rawSvg: string | null = null;
  if (question.rawSvgMarkup) {
    rawSvg = question.rawSvgMarkup;
  } else {
    const geo = question.geometryFigure ?? question.attachedGeometryFigure;
    if (geo) {
      rawSvg = projectGeometryFigureToSVGMarkup(geo, options);
    } else if (question.graphSpec) {
      rawSvg = projectCartesianGraphToSVGMarkup(question.graphSpec, options);
    }
  }
  if (!rawSvg) return null;
  return options.monochromePrintSafe || (options.strokeWidthMultiplier && options.strokeWidthMultiplier > 1)
    ? enhanceQuestionFigureSvgForPrint(rawSvg, {
        monochromePrintSafe: options.monochromePrintSafe,
        strokeWidthMultiplier: options.strokeWidthMultiplier,
      })
    : rawSvg;
}
