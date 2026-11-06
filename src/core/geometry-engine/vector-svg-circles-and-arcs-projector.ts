/**
 * @file vector-svg-circles-and-arcs-projector.ts
 * @description مصير الدوائر والأقواس والمناطق المظللة والشبكة الإحداثية لـ IR v2 (المرحلة 2):
 * - يرسم الدوائر الصريحة (`figure.circles`) مع دعم أكثر من دائرة متقاطعة أو متماسة.
 * - يرسم الأقواس الدائرية (`figure.arcs`) مع ملصقاتها (`given` أو `unknown` بعلامة «؟»).
 * - يرسم المناطق المظللة المخصصة (`figure.shadedRegions`) والشارات النصية عليها.
 * - يرسم خطوط الشبكة الإحداثية الخلفية (`figure.coordinateGrid`) عند تفعيلها.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 220 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage, NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import { localizeFigureLabelText } from "./figure-label-symbol-localizer";

export const MODULE_ID_VECTOR_SVG_CIRCLES_AND_ARCS_PROJECTOR =
  "vector_svg_circles_and_arcs_projector" as const;

export interface CirclesAndArcsScreenVertex {
  readonly id: string;
  readonly label: string;
  readonly position: { readonly x: number; readonly y: number };
  readonly screen: { readonly sx: number; readonly sy: number };
}

export interface CirclesAndArcsProjectorOptions {
  readonly figure: CanonicalGeometryFigureIR;
  readonly vertexMap: ReadonlyMap<string, CirclesAndArcsScreenVertex>;
  readonly toScreen: (x: number, y: number) => { readonly sx: number; readonly sy: number };
  readonly scale: number;
  readonly width: number;
  readonly height: number;
  readonly padding: number;
  readonly strokeColor: string;
  readonly accentColor: string;
  readonly numeralMode: NumeralDisplayMode;
  readonly notation: MathNotationLanguage;
}

export function projectCirclesArcsAndRegionsSVGMarkup(
  opts: CirclesAndArcsProjectorOptions
): string {
  const {
    figure,
    vertexMap,
    toScreen,
    scale,
    width,
    height,
    padding,
    strokeColor,
    accentColor,
    numeralMode,
    notation,
  } = opts;

  const parts: string[] = [];

  // 1. الشبكة الإحداثية الخلفية (Coordinate Grid) إن كانت مفعلة في IR v2
  if (figure.coordinateGrid?.enabled) {
    const stepPx = Math.max(14, Math.round((figure.coordinateGrid.step ?? 1) * scale));
    const gridLines: string[] = [];
    for (let x = padding; x <= width - padding; x += stepPx) {
      gridLines.push(
        `<line x1="${x.toFixed(1)}" y1="${padding}" x2="${x.toFixed(1)}" y2="${height - padding}" stroke="#E2E8F0" stroke-width="0.6" data-furniture="true" />`
      );
    }
    for (let y = padding; y <= height - padding; y += stepPx) {
      gridLines.push(
        `<line x1="${padding}" y1="${y.toFixed(1)}" x2="${width - padding}" y2="${y.toFixed(1)}" stroke="#E2E8F0" stroke-width="0.6" data-furniture="true" />`
      );
    }
    parts.push(`<g class="geometry-coordinate-grid">${gridLines.join("")}</g>`);
  }

  // 2. المناطق المظللة المخصصة (Shaded Regions) في IR v2
  if (figure.shadedRegions && figure.shadedRegions.length > 0) {
    for (const reg of figure.shadedRegions) {
      const screenPts = reg.vertexIds
        .map((id) => vertexMap.get(id)?.screen)
        .filter((pt): pt is { readonly sx: number; readonly sy: number } => Boolean(pt));
      if (screenPts.length < 3) continue;

      const pointsAttr = screenPts.map((p) => `${p.sx.toFixed(1)},${p.sy.toFixed(1)}`).join(" ");
      const fillHex = reg.fillColorHex ?? "#0D9488";
      const fillOp = reg.fillOpacity ?? 0.16;
      parts.push(
        `<polygon points="${pointsAttr}" fill="${fillHex}" fill-opacity="${fillOp}" stroke="${fillHex}" stroke-opacity="0.45" stroke-width="1" />`
      );

      if (reg.regionLabel) {
        const cx = screenPts.reduce((acc, p) => acc + p.sx, 0) / screenPts.length;
        const cy = screenPts.reduce((acc, p) => acc + p.sy, 0) / screenPts.length;
        const isUnknown = reg.labelKind === "unknown" || reg.regionLabel.includes("؟") || reg.regionLabel.includes("?");
        const badgeColor = isUnknown ? "#D97706" : accentColor;
        const badgeBg = isUnknown ? "#FFFBEB" : "#F0FDFA";
        const formatted = localizeFigureLabelText(reg.regionLabel, notation, numeralMode);
        const pillW = Math.max(formatted.length * 5.8 + 10, 22);
        parts.push(
          `<rect x="${(cx - pillW / 2).toFixed(1)}" y="${(cy - 8).toFixed(1)}" width="${pillW.toFixed(1)}" height="14" rx="3.5" fill="${badgeBg}" stroke="${badgeColor}" stroke-width="0.9" opacity="0.96" /><text x="${cx.toFixed(1)}" y="${(cy + 2.2).toFixed(1)}" text-anchor="middle" font-size="8.2" font-weight="800" fill="${badgeColor}">${formatted}</text>`
        );
      }
    }
  }

  // 3. الدوائر الصريحة المتعددة (Explicit Multi-Circles IR v2) أو التوافق العكسي لعائلة الدائرة
  if (figure.circles && figure.circles.length > 0) {
    for (const c of figure.circles) {
      const centerNode = vertexMap.get(c.centerVertexId);
      if (!centerNode) continue;
      let rPx = c.radius * scale;
      if (c.rimVertexId) {
        const rimNode = vertexMap.get(c.rimVertexId);
        if (rimNode) {
          rPx = Math.hypot(
            rimNode.screen.sx - centerNode.screen.sx,
            rimNode.screen.sy - centerNode.screen.sy
          );
        }
      }
      const dashAttr =
        c.strokeStyle === "dashed"
          ? `stroke-dasharray="4,3"`
          : c.strokeStyle === "dotted"
            ? `stroke-dasharray="2,2"`
            : "";
      const fillAttr = c.fillColorHex
        ? `fill="${c.fillColorHex}" fill-opacity="${c.fillOpacity ?? 0.08}"`
        : `fill="none"`;
      parts.push(
        `<circle cx="${centerNode.screen.sx.toFixed(1)}" cy="${centerNode.screen.sy.toFixed(1)}" r="${Math.max(4, rPx).toFixed(1)}" ${fillAttr} stroke="${strokeColor}" stroke-width="1.8" ${dashAttr} />`
      );
    }
  } else if (figure.familyId === "circle_family") {
    const allNodes = Array.from(vertexMap.values());
    const centerNode = allNodes.find((v) => v.id.includes("center")) || allNodes[0];
    const rimPoint = allNodes.find((v) => v.id !== centerNode?.id && !v.id.includes("_ext_") && !v.id.includes("_mid_")) || allNodes.find((v) => v.id !== centerNode?.id);
    if (centerNode && rimPoint) {
      const rPx = Math.hypot(
        rimPoint.screen.sx - centerNode.screen.sx,
        rimPoint.screen.sy - centerNode.screen.sy
      );
      parts.push(
        `<circle cx="${centerNode.screen.sx.toFixed(1)}" cy="${centerNode.screen.sy.toFixed(1)}" r="${rPx.toFixed(1)}" fill="none" stroke="${strokeColor}" stroke-width="1.8" />`
      );
    }
  }

  // 4. الأقواس الدائرية الصريحة (Explicit Circular Arcs IR v2)
  if (figure.arcs && figure.arcs.length > 0) {
    for (const arc of figure.arcs) {
      const centerNode = vertexMap.get(arc.centerVertexId);
      if (!centerNode) continue;
      const rWorld = arc.radius;
      const startRad = (arc.startAngleDeg * Math.PI) / 180;
      const endRad = (arc.endAngleDeg * Math.PI) / 180;
      const pStart = toScreen(
        centerNode.position.x + rWorld * Math.cos(startRad),
        centerNode.position.y + rWorld * Math.sin(startRad)
      );
      const pEnd = toScreen(
        centerNode.position.x + rWorld * Math.cos(endRad),
        centerNode.position.y + rWorld * Math.sin(endRad)
      );
      const rPx = Math.max(4, rWorld * scale);
      let spanDeg = ((arc.endAngleDeg - arc.startAngleDeg) % 360 + 360) % 360;
      if (spanDeg === 0) spanDeg = 180;
      const largeArcFlag = spanDeg > 180 ? 1 : 0;
      // في إحداثيات الشاشة محور Y مقلوب، لذلك السير عكس عقارب الساعة رياضياً يقابل sweepFlag = 0
      const sweepFlag = arc.counterClockwise === false ? 1 : 0;
      const dashAttr =
        arc.strokeStyle === "dashed"
          ? `stroke-dasharray="4,3"`
          : arc.strokeStyle === "dotted"
            ? `stroke-dasharray="2,2"`
            : "";

      parts.push(
        `<path d="M ${pStart.sx.toFixed(1)} ${pStart.sy.toFixed(1)} A ${rPx.toFixed(1)} ${rPx.toFixed(1)} 0 ${largeArcFlag} ${sweepFlag} ${pEnd.sx.toFixed(1)} ${pEnd.sy.toFixed(1)}" fill="none" stroke="${accentColor}" stroke-width="2.2" ${dashAttr} />`
      );

      if (arc.arcLabel) {
        const midDeg = arc.startAngleDeg + spanDeg / 2;
        const midRad = (midDeg * Math.PI) / 180;
        const labelPt = toScreen(
          centerNode.position.x + rWorld * 1.16 * Math.cos(midRad),
          centerNode.position.y + rWorld * 1.16 * Math.sin(midRad)
        );
        const isUnknown = arc.arcLabel.labelKind === "unknown" || arc.arcLabel.value.includes("؟") || arc.arcLabel.value.includes("?");
        const color = isUnknown ? "#D97706" : accentColor;
        const formatted = localizeFigureLabelText(arc.arcLabel.value, notation, numeralMode);
        parts.push(
          `<text x="${labelPt.sx.toFixed(1)}" y="${labelPt.sy.toFixed(1)}" text-anchor="middle" font-size="8.2" font-weight="800" fill="${color}">${formatted}</text>`
        );
      }
    }
  }

  return parts.join("");
}
