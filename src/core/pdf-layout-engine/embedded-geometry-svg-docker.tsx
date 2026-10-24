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

export interface EmbeddedGeometrySVGDockerProps {
  readonly geometryFigure?: CanonicalGeometryFigureIR;
  readonly borderHex: string;
  readonly softSurfaceHex: string;
  readonly primaryHex: string;
  readonly accentHex: string;
  readonly numeralMode: NumeralDisplayMode;
}

export function EmbeddedGeometrySVGDocker({
  geometryFigure,
  borderHex,
  softSurfaceHex,
  primaryHex,
  accentHex,
  numeralMode,
}: EmbeddedGeometrySVGDockerProps) {
  if (!geometryFigure) return null;

  return (
    <div
      style={{
        width: "132px",
        minWidth: "132px",
        borderColor: borderHex,
        backgroundColor: softSurfaceHex,
      }}
      className="border-2 rounded-lg p-1 flex items-center justify-center shrink-0"
      dangerouslySetInnerHTML={{
        __html: projectGeometryFigureToSVGMarkup(geometryFigure, {
          widthPx: 124,
          heightPx: 88,
          strokeColorHex: primaryHex,
          accentColorHex: accentHex,
          numeralMode,
        }),
      }}
    />
  );
}
