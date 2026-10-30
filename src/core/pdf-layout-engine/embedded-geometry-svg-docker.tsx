"use client";

/**
 * @file embedded-geometry-svg-docker.tsx
 * @description مصير وتضمين الشكل الهندسي المتجهي أو الرسم البياني (Vector SVG) داخل بطاقة السؤال الرياضي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 70 سطراً).
 */

import React from "react";
import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import type { CartesianGraphSpec } from "../ssot/cartesian-graph-spec-ssot";
import type { NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import { computeFigureAspectFromVertices, computeFigureBoxSizePx } from "./question-figure-box-size";
import { renderQuestionFigureSvg } from "./question-figure-svg-renderer";

export interface EmbeddedGeometrySVGDockerProps {
  readonly geometryFigure?: CanonicalGeometryFigureIR;
  readonly graphSpec?: CartesianGraphSpec;
  readonly borderHex: string;
  readonly softSurfaceHex: string;
  readonly primaryHex: string;
  readonly accentHex: string;
  readonly numeralMode: NumeralDisplayMode;
  readonly figureScale?: number;
  readonly columnsCount?: 1 | 2;
}

export function EmbeddedGeometrySVGDocker({
  geometryFigure,
  graphSpec,
  borderHex,
  softSurfaceHex,
  primaryHex,
  accentHex,
  numeralMode,
  figureScale = 1,
  columnsCount = 2,
}: EmbeddedGeometrySVGDockerProps) {
  if (!geometryFigure && !graphSpec) return null;

  const aspect = geometryFigure ? computeFigureAspectFromVertices(geometryFigure.vertices) : 1.3;
  const box = computeFigureBoxSizePx({ aspect, figureScale, columnsCount });
  const svgMarkup = renderQuestionFigureSvg(
    { geometryFigure, graphSpec },
    {
      widthPx: box.svgWidthPx,
      heightPx: box.svgHeightPx,
      strokeColorHex: primaryHex,
      accentColorHex: accentHex,
      numeralMode,
    }
  );
  if (!svgMarkup) return null;

  return (
    <div
      style={{
        width: `${box.boxWidthPx}px`,
        minWidth: `${box.boxWidthPx}px`,
        borderColor: borderHex,
        backgroundColor: softSurfaceHex,
      }}
      className="border rounded-lg p-1 flex items-center justify-center shrink-0 overflow-hidden"
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
