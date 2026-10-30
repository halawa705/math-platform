"use client";

/**
 * @file embedded-geometry-svg-docker.tsx
 * @description مصير وتضمين الشكل الهندسي المتجهي (Vector SVG) داخل بطاقة السؤال الرياضي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 60 سطراً).
 */

import React from "react";
import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import { projectGeometryFigureToSVGMarkup } from "../geometry-engine/vector-svg-figure-projector";
import type { NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import { computeFigureAspectFromVertices, computeFigureBoxSizePx } from "./question-figure-box-size";

export interface EmbeddedGeometrySVGDockerProps {
  readonly geometryFigure?: CanonicalGeometryFigureIR;
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
  borderHex,
  softSurfaceHex,
  primaryHex,
  accentHex,
  numeralMode,
  figureScale = 1,
  columnsCount = 2,
}: EmbeddedGeometrySVGDockerProps) {
  if (!geometryFigure) return null;

  const aspect = computeFigureAspectFromVertices(geometryFigure.vertices);
  const box = computeFigureBoxSizePx({ aspect, figureScale, columnsCount });

  return (
    <div
      style={{
        width: `${box.boxWidthPx}px`,
        minWidth: `${box.boxWidthPx}px`,
        borderColor: borderHex,
        backgroundColor: softSurfaceHex,
      }}
      className="border rounded-lg p-1 flex items-center justify-center shrink-0 overflow-hidden"
      dangerouslySetInnerHTML={{
        __html: projectGeometryFigureToSVGMarkup(geometryFigure, {
          widthPx: box.svgWidthPx,
          heightPx: box.svgHeightPx,
          strokeColorHex: primaryHex,
          accentColorHex: accentHex,
          numeralMode,
        }),
      }}
    />
  );
}
