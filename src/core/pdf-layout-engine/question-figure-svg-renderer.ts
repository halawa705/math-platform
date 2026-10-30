/**
 * @file question-figure-svg-renderer.ts
 * @description مصيّر موحد يختار بين الشكل الهندسي (CanonicalGeometryFigureIR) أو الرسم البياني (CartesianGraphSpec) ويعيد SVG.
 */
import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import type { CartesianGraphSpec } from "../ssot/cartesian-graph-spec-ssot";
import type { NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import { projectGeometryFigureToSVGMarkup } from "../geometry-engine/vector-svg-figure-projector";
import { projectCartesianGraphToSVGMarkup } from "../geometry-engine/graph-compositor/graph-svg-projector";

export const MODULE_ID_QUESTION_FIGURE_SVG_RENDERER = "question_figure_svg_renderer" as const;

export interface RenderQuestionFigureSvgOptions {
  readonly widthPx?: number;
  readonly heightPx?: number;
  readonly strokeColorHex?: string;
  readonly accentColorHex?: string;
  readonly numeralMode?: NumeralDisplayMode;
}

export function renderQuestionFigureSvg(
  question: {
    readonly geometryFigure?: CanonicalGeometryFigureIR;
    readonly attachedGeometryFigure?: CanonicalGeometryFigureIR;
    readonly graphSpec?: CartesianGraphSpec;
  },
  options: RenderQuestionFigureSvgOptions = {}
): string | null {
  const geo = question.geometryFigure ?? question.attachedGeometryFigure;
  if (geo) {
    return projectGeometryFigureToSVGMarkup(geo, options);
  }
  if (question.graphSpec) {
    return projectCartesianGraphToSVGMarkup(question.graphSpec, options);
  }
  return null;
}
