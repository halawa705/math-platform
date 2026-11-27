/**
 * @file nested-rectangles-frame-builder.ts
 * @description منشئ بارامتري لأشكال المستطيل والمربع المتداخل (حديقة يتوسطها مسبح، فناء بممر، صورة وإطار)
 * بحيث يولّد إطاراً هندسياً ثنائي المضلع بملصقات واضحة بدون أي أرقام دخيلة أو تسريب للحل.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 165 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "../../ssot/geometry-archetype-ssot";
import { localizeGeometricVertexLabelSSOT, toWesternNumeralsSSOT } from "../../ssot/numeral-and-unit-ssot";
import { extractArabicLengthUnit } from "./rectangle-square-perimeter-area-builder";
import type { RectilinearCompositeOptions } from "./rectilinear-composite-orthogonal-builders";

export const MODULE_ID_NESTED_RECTANGLES_FRAME_BUILDER =
  "nested_rectangles_frame_builder" as const;

const NESTED_RECT_PATTERN =
  /(?:مستطيل[ة]?|مربع[ة]?)[\s\S]{0,80}(?:يتوسط[هـا]?|بداخل[هـا]?|داخل[هـا]|مسبح\s*مستطيل|نافورة\s*مربعة|صورة\s*مستطيلة|محاط[ة]?\s*بـ?\s*ممر)/i;

function extractNumbers(text: string): number[] {
  const matches = text.match(/(?<![0-9.])\d+(?:\.\d+)?(?![0-9.])/g);
  return matches ? matches.map(Number).filter((n) => !Number.isNaN(n) && n > 0 && n !== 90) : [];
}

function clamp(val: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, val));
}

export function matchNestedRectanglesFrameFigure(
  description: string,
  opts: RectilinearCompositeOptions
): CanonicalGeometryFigureIR | undefined {
  const raw = (description || "").trim();
  if (!raw || !NESTED_RECT_PATTERN.test(raw)) return undefined;

  const clean = toWesternNumeralsSSOT(raw).replace(/\\+\(|\\+\)|\$/g, "").trim();
  const parts = clean.split(/(?=يتوسط[هـا]?|بداخل[هـا]?|محاط[ة]?\s*بـ?\s*ممر)/i);
  if (parts.length < 2) return undefined;

  const outerNums = extractNumbers(parts[0]);
  const innerNums = extractNumbers(parts.slice(1).join(" "));
  if (outerNums.length < 1 || innerNums.length < 1) return undefined;

  const isOuterSquare = /مربع[ة]?/i.test(parts[0]) && !/مستطيل[ة]?/i.test(parts[0]);
  const isWalkwayFrame = /ممر/i.test(parts[1]) && innerNums.length === 1;

  const wOuter = outerNums.length >= 2 ? Math.max(outerNums[0], outerNums[1]) : outerNums[0];
  const hOuter = isOuterSquare
    ? wOuter
    : outerNums.length >= 2
      ? Math.min(outerNums[0], outerNums[1])
      : Math.max(1, Math.round(wOuter * 0.65));

  const unit = extractArabicLengthUnit(clean);
  const notation = opts.notationLanguage ?? "english";

  // استخراج حروف الرؤوس الخارجية الاختيارية مثل ABCD أو أ ب جـ د
  const latinVertsMatch = parts[0].match(/\b([A-Z]{4})\b/);
  const arabicVertsMatch = parts[0].match(/\b([أإابجدهوزحيكلمنصع]\s+[أإابجدهوزحيكلمنصع]\s+[أإابجدهوزحيكلمنصع]\s+[أإابجدهوزحيكلمنصع])\b/);
  const outerLabels: readonly string[] = latinVertsMatch
    ? latinVertsMatch[1].split("").map((ch) => localizeGeometricVertexLabelSSOT(ch, notation))
    : arabicVertsMatch
      ? arabicVertsMatch[1].split(/\s+/).map((ch) => localizeGeometricVertexLabelSSOT(ch, notation))
      : ["", "", "", ""];

  const hideOuterDots = outerLabels.every((l) => !l);

  const aspect = clamp(wOuter / (hOuter || 1), 0.75, 2.0);
  const frameW = aspect >= 1 ? 7.6 : clamp(7.0 * aspect, 4.2, 7.6);
  const frameH = aspect >= 1 ? clamp(7.6 / aspect, 4.0, 6.8) : 6.8;
  const ox0 = Number((5 - frameW / 2).toFixed(2));
  const oy0 = Number((5 - frameH / 2).toFixed(2));
  const ox1 = Number((ox0 + frameW).toFixed(2));
  const oy1 = Number((oy0 + frameH).toFixed(2));

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_nA`, label: outerLabels[0], hideVertexDot: hideOuterDots, position: { x: ox0, y: oy1 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_nB`, label: outerLabels[1], hideVertexDot: hideOuterDots, position: { x: ox1, y: oy1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_nC`, label: outerLabels[2], hideVertexDot: hideOuterDots, position: { x: ox1, y: oy0 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_nD`, label: outerLabels[3], hideVertexDot: hideOuterDots, position: { x: ox0, y: oy0 } };

  const wInnerVal = isWalkwayFrame ? wOuter : innerNums.length >= 2 ? Math.max(innerNums[0], innerNums[1]) : innerNums[0];
  const hInnerVal = isWalkwayFrame ? hOuter : innerNums.length >= 2 ? Math.min(innerNums[0], innerNums[1]) : innerNums[0];

  const inWScale = isWalkwayFrame ? 0.68 : clamp(wInnerVal / Math.max(wOuter, 1), 0.34, 0.68);
  const inHScale = isWalkwayFrame ? 0.68 : clamp(hInnerVal / Math.max(hOuter, 1), 0.34, 0.68);
  const inW = Number((frameW * inWScale).toFixed(2));
  const inH = Number((frameH * inHScale).toFixed(2));
  const ix0 = Number((5 - inW / 2).toFixed(2));
  const iy0 = Number((5 - inH / 2).toFixed(2));
  const ix1 = Number((ix0 + inW).toFixed(2));
  const iy1 = Number((iy0 + inH).toFixed(2));

  const vE: CanonicalVertexNode = { id: `${opts.figureId}_nE`, label: "", hideVertexDot: true, position: { x: ix0, y: iy1 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_nF`, label: "", hideVertexDot: true, position: { x: ix1, y: iy1 } };
  const vG: CanonicalVertexNode = { id: `${opts.figureId}_nG`, label: "", hideVertexDot: true, position: { x: ix1, y: iy0 } };
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_nH`, label: "", hideVertexDot: true, position: { x: ix0, y: iy0 } };

  const segments: CanonicalSegmentNode[] = isWalkwayFrame
    ? [
        { id: `${opts.figureId}_so1`, fromVertexId: vA.id, toVertexId: vB.id },
        { id: `${opts.figureId}_so2`, fromVertexId: vB.id, toVertexId: vC.id },
        { id: `${opts.figureId}_so3`, fromVertexId: vC.id, toVertexId: vD.id },
        { id: `${opts.figureId}_so4`, fromVertexId: vD.id, toVertexId: vA.id },
        { id: `${opts.figureId}_si1`, fromVertexId: vE.id, toVertexId: vF.id, lengthLabel: { value: wOuter, unit } },
        { id: `${opts.figureId}_si2`, fromVertexId: vF.id, toVertexId: vG.id, lengthLabel: { value: hOuter, unit } },
        { id: `${opts.figureId}_si3`, fromVertexId: vG.id, toVertexId: vH.id },
        { id: `${opts.figureId}_si4`, fromVertexId: vH.id, toVertexId: vE.id },
        { id: `${opts.figureId}_sw`, fromVertexId: vF.id, toVertexId: vB.id, strokeStyle: "dashed", lengthLabel: { value: innerNums[0], unit } },
      ]
    : [
        { id: `${opts.figureId}_so1`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: wOuter, unit } },
        { id: `${opts.figureId}_so2`, fromVertexId: vB.id, toVertexId: vC.id },
        { id: `${opts.figureId}_so3`, fromVertexId: vC.id, toVertexId: vD.id },
        { id: `${opts.figureId}_so4`, fromVertexId: vD.id, toVertexId: vA.id, lengthLabel: { value: hOuter, unit } },
        { id: `${opts.figureId}_si1`, fromVertexId: vE.id, toVertexId: vF.id, lengthLabel: { value: wInnerVal, unit } },
        { id: `${opts.figureId}_si2`, fromVertexId: vF.id, toVertexId: vG.id, lengthLabel: { value: hInnerVal, unit } },
        { id: `${opts.figureId}_si3`, fromVertexId: vG.id, toVertexId: vH.id },
        { id: `${opts.figureId}_si4`, fromVertexId: vH.id, toVertexId: vE.id },
      ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_composite_rectilinear_shape",
    titleArabic: `مستطيلان متداخلان (${wOuter}×${hOuter} ${unit})`,
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF, vG, vH],
    segments,
    angles: [{ id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vC.id, arm2VertexId: vA.id, isRightAngle: true }],
    polygons: [
      [vA.id, vB.id, vC.id, vD.id],
      [vE.id, vF.id, vG.id, vH.id],
    ],
  };
}
