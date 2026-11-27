"use client";

/**
 * @file embedded-geometry-svg-docker.tsx
 * @description مصير وتضمين الشكل الهندسي المتجهي أو الرسم البياني (Vector SVG) داخل بطاقة السؤال الرياضي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 70 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import type { CartesianGraphSpec } from "../ssot/cartesian-graph-spec-ssot";
import type { MathNotationLanguage, NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import { computeFigureAspectFromVertices, computeFigureBoxSizePx } from "./question-figure-box-size";
import { renderQuestionFigureSvg } from "./question-figure-svg-renderer";

export interface EmbeddedGeometrySVGDockerProps {
  readonly geometryFigure?: CanonicalGeometryFigureIR;
  readonly graphSpec?: CartesianGraphSpec;
  readonly rawSvgMarkup?: string;
  readonly borderHex: string;
  readonly softSurfaceHex: string;
  readonly primaryHex: string;
  readonly accentHex: string;
  readonly numeralMode: NumeralDisplayMode;
  readonly notationLanguage?: MathNotationLanguage;
  readonly figureScale?: number;
  readonly columnsCount?: 1 | 2;
  readonly monochromePrintSafe?: boolean;
  readonly strokeWidthMultiplier?: number;
  readonly editorialFrameless?: boolean;
}

export function EmbeddedGeometrySVGDocker({
  geometryFigure,
  graphSpec,
  rawSvgMarkup,
  borderHex,
  softSurfaceHex: _softSurfaceHex,
  primaryHex,
  accentHex,
  numeralMode,
  notationLanguage,
  figureScale = 1,
  columnsCount = 2,
  monochromePrintSafe = false,
  strokeWidthMultiplier = 1,
  editorialFrameless = false,
}: EmbeddedGeometrySVGDockerProps) {
  if (!geometryFigure && !graphSpec && !rawSvgMarkup) return null;

  const aspect = geometryFigure ? computeFigureAspectFromVertices(geometryFigure.vertices) : 1.4;
  const box = computeFigureBoxSizePx({
    aspect,
    figureScale,
    columnsCount,
    editorialTextbook: editorialFrameless,
  });
  const svgMarkup = renderQuestionFigureSvg(
    { geometryFigure, graphSpec, rawSvgMarkup },
    {
      widthPx: box.svgWidthPx,
      heightPx: box.svgHeightPx,
      strokeColorHex: editorialFrameless ? "#0F172A" : primaryHex,
      accentColorHex: editorialFrameless && !monochromePrintSafe ? accentHex : monochromePrintSafe ? "#0F172A" : accentHex,
      backgroundColorHex: editorialFrameless ? "transparent" : "#FFFFFF",
      numeralMode,
      notationLanguage,
      monochromePrintSafe,
      strokeWidthMultiplier,
      editorialTextbookStyle: editorialFrameless,
    }
  );
  if (!svgMarkup) return null;

  if (editorialFrameless) {
    return (
      <div
        style={{
          width: `${box.boxWidthPx}px`,
          minWidth: `${box.boxWidthPx}px`,
          maxHeight: `${Math.round(box.boxHeightPx * 1.28)}px`,
          backgroundColor: "transparent",
        }}
        className="flex items-center justify-center shrink-0 overflow-visible"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    );
  }

  return (
    <div
      style={{
        width: `${box.boxWidthPx}px`,
        minWidth: `${box.boxWidthPx}px`,
        maxHeight: `${Math.round(box.boxHeightPx * 1.32)}px`,
        borderColor: borderHex,
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
      }}
      className="border rounded-lg p-1 bg-white flex items-center justify-center shrink-0 overflow-hidden"
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
