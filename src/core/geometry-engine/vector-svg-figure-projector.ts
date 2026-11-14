/**
 * @file vector-svg-figure-projector.ts
 * @description المصير المتجهي النقي (Pure Vector SVG Projector) الذي يحول CanonicalGeometryFigureIR
 * إلى رسم SVG متجهي فائق الدقة للشاشة والطباعة مع منع التداخل ثنائي الأبعاد وتوسيع viewBox تلقائياً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 270 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";
import { projectGeometryAnglesSVGMarkup } from "./vector-svg-angle-projector";
import { localizeFigureLabelText } from "./figure-label-symbol-localizer";
import { projectGeometrySurfaceShadingSVGMarkup } from "./vector-svg-surface-shading-projector";
import { projectCirclesArcsAndRegionsSVGMarkup } from "./vector-svg-circles-and-arcs-projector";
import {
  computeExpandedSvgViewBox,
  createCenteredBox,
  isCompositeCollinearSpan,
  solveInteriorBadgePlacement,
  solveSegmentPillOrBracketPlacement,
  solveVertexLabelPlacement,
  type PlacedPointLike,
  type ScreenBox,
  type ScreenSegmentObstacle,
} from "./svg-label-collision-layout-solver";

export const MODULE_ID_VECTOR_SVG_FIGURE_PROJECTOR =
  "vector_svg_figure_projector" as const;

export interface SVGProjectorOptions {
  readonly widthPx?: number;
  readonly heightPx?: number;
  readonly strokeColorHex?: string;
  readonly accentColorHex?: string;
  readonly backgroundColorHex?: string;
  readonly numeralMode?: NumeralDisplayMode;
  readonly notationLanguage?: MathNotationLanguage;
}

export function projectGeometryFigureToSVGMarkup(
  figure: CanonicalGeometryFigureIR,
  options: SVGProjectorOptions = {}
): string {
  const width = options.widthPx ?? 230;
  const height = options.heightPx ?? 165;
  const strokeColor = options.strokeColorHex ?? "#1E293B";
  const accentColor = options.accentColorHex ?? "#0D9488";
  const backgroundColor = options.backgroundColorHex ?? "#FFFFFF";
  const numeralMode = options.numeralMode ?? "western";
  const notation = options.notationLanguage || "english";
  const padding = Math.max(16, Math.min(22, Math.round(Math.min(width, height) * 0.14)));

  if (figure.rawSvgMarkup) return figure.rawSvgMarkup;
  if (figure.vertices.length === 0) return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%"></svg>`;

  const xs = figure.vertices.map((v) => v.position.x);
  const ys = figure.vertices.map((v) => v.position.y);
  for (const c of figure.circles ?? []) {
    const cv = figure.vertices.find((v) => v.id === c.centerVertexId);
    if (cv && c.radius > 0) xs.push(cv.position.x - c.radius, cv.position.x + c.radius), ys.push(cv.position.y - c.radius, cv.position.y + c.radius);
  }
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const scale = Math.min((width - padding * 2) / spanX, (height - padding * 2) / spanY);
  const offsetX = (width - spanX * scale) / 2;
  const offsetY = (height - spanY * scale) / 2;
  const toScreen = (x: number, y: number) => ({
    sx: Number((offsetX + (x - minX) * scale).toFixed(1)),
    sy: Number((height - offsetY - (y - minY) * scale).toFixed(1)),
  });

  const vertexMap = new Map(figure.vertices.map((v) => [v.id, { ...v, screen: toScreen(v.position.x, v.position.y) }]));
  const centerSx = Array.from(vertexMap.values()).reduce((a, v) => a + v.screen.sx, 0) / figure.vertices.length;
  const centerSy = Array.from(vertexMap.values()).reduce((a, v) => a + v.screen.sy, 0) / figure.vertices.length;
  const geomXs = Array.from(vertexMap.values()).map((v) => v.screen.sx);
  const geomYs = Array.from(vertexMap.values()).map((v) => v.screen.sy);
  const geomBounds: ScreenBox = { minX: Math.min(...geomXs), minY: Math.min(...geomYs), maxX: Math.max(...geomXs), maxY: Math.max(...geomYs) };

  const circleRimSvg = projectCirclesArcsAndRegionsSVGMarkup({ figure, vertexMap, toScreen, scale, width, height, padding, strokeColor, accentColor, numeralMode, notation });

  const arrowTipVertexIds = new Set<string>();
  const outgoingCount = new Map<string, number>();
  for (const seg of figure.segments) {
    outgoingCount.set(seg.fromVertexId, (outgoingCount.get(seg.fromVertexId) ?? 0) + 1);
    if (seg.arrowAtEnd || seg.isRay) arrowTipVertexIds.add(seg.toVertexId);
    if (seg.arrowAtStart || seg.isLine) arrowTipVertexIds.add(seg.fromVertexId);
  }

  const occupiedBoxes: ScreenBox[] = [];
  const obstacleSegments: ScreenSegmentObstacle[] = [];
  const segmentMeta = figure.segments.map((seg) => {
    const fromV = vertexMap.get(seg.fromVertexId);
    const toV = vertexMap.get(seg.toVertexId);
    if (!fromV || !toV) return null;
    const isCompositeSpan = Boolean(seg.lengthLabel) && isCompositeCollinearSpan(seg.fromVertexId, seg.toVertexId, fromV.screen, toV.screen, vertexMap.values());
    const obs: ScreenSegmentObstacle = {
      fromId: seg.fromVertexId, toId: seg.toVertexId,
      x1: fromV.screen.sx, y1: fromV.screen.sy, x2: toV.screen.sx, y2: toV.screen.sy,
      hasMidDecor: Boolean(seg.tickMarks || seg.parallelArrows),
      isCompositeSpan,
    };
    obstacleSegments.push(obs);
    if (!isCompositeSpan && (seg.tickMarks || seg.parallelArrows)) {
      occupiedBoxes.push(createCenteredBox((obs.x1 + obs.x2) / 2, (obs.y1 + obs.y2) / 2, 12, 10));
    }
    return { seg, obs };
  }).filter((m): m is NonNullable<typeof m> => Boolean(m));

  for (const v of vertexMap.values()) {
    const isRayTip = v.hideVertexDot || (arrowTipVertexIds.has(v.id) && (outgoingCount.get(v.id) ?? 0) <= 0);
    if (!isRayTip) occupiedBoxes.push(createCenteredBox(v.screen.sx, v.screen.sy, 8, 8));
  }

  const segmentLinesSvg = segmentMeta.map(({ seg, obs }) => {
    if (obs.isCompositeSpan) return "";
    const { x1, y1, x2, y2 } = obs;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const ux = dx / len;
    const uy = dy / len;
    const dashAttr = seg.strokeStyle === "dashed" ? `stroke-dasharray="4,3"` : seg.strokeStyle === "dotted" ? `stroke-dasharray="2,2"` : "";
    let decorations = "";
    if (seg.tickMarks) {
      for (let i = 0; i < seg.tickMarks; i++) {
        const off = (i - (seg.tickMarks - 1) / 2) * 4;
        const tx = mx + ux * off;
        const ty = my + uy * off;
        decorations += `<line x1="${(tx - nx * 4).toFixed(1)}" y1="${(ty - ny * 4).toFixed(1)}" x2="${(tx + nx * 4).toFixed(1)}" y2="${(ty + ny * 4).toFixed(1)}" stroke="${accentColor}" stroke-width="1.5" />`;
      }
    }
    if (seg.parallelArrows) {
      const ax = mx - ux * 3;
      const ay = my - uy * 3;
      decorations += `<path d="M ${(ax - ux * 4 + nx * 3).toFixed(1)} ${(ay - uy * 4 + ny * 3).toFixed(1)} L ${(ax + ux * 2.5).toFixed(1)} ${(ay + uy * 2.5).toFixed(1)} L ${(ax - ux * 4 - nx * 3).toFixed(1)} ${(ay - uy * 4 - ny * 3).toFixed(1)}" fill="none" stroke="${accentColor}" stroke-width="1.5" stroke-linecap="round"/>`;
    }
    const aLen = 7.5;
    const aW = 3.2;
    if (seg.arrowAtEnd || seg.isRay) {
      decorations += `<polygon points="${x2.toFixed(1)},${y2.toFixed(1)} ${(x2 - ux * aLen + nx * aW).toFixed(1)},${(y2 - uy * aLen + ny * aW).toFixed(1)} ${(x2 - ux * aLen - nx * aW).toFixed(1)},${(y2 - uy * aLen - ny * aW).toFixed(1)}" fill="${strokeColor}" />`;
    }
    if (seg.arrowAtStart || seg.isLine) {
      decorations += `<polygon points="${x1.toFixed(1)},${y1.toFixed(1)} ${(x1 + ux * aLen + nx * aW).toFixed(1)},${(y1 + uy * aLen + ny * aW).toFixed(1)} ${(x1 + ux * aLen - nx * aW).toFixed(1)},${(y1 + uy * aLen - ny * aW).toFixed(1)}" fill="${strokeColor}" />`;
    }
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" ${dashAttr} />${decorations}`;
  }).join("");

  const surfaceTintsSvg = projectGeometrySurfaceShadingSVGMarkup({ figure, vertexMap });
  const anglesSvg = projectGeometryAnglesSVGMarkup({
    angles: figure.angles, vertexMap, strokeColor, accentColor, numeralMode, notation, occupiedBoxes, obstacleSegments,
  });

  const verticesSvg = Array.from(vertexMap.values()).map((v) => {
    const cleanLabel = (v.label || "").trim();
    const isRayTip = v.hideVertexDot || (arrowTipVertexIds.has(v.id) && (outgoingCount.get(v.id) ?? 0) <= 0);
    if (v.hideVertexDot && !cleanLabel) return "";
    const dotsSvg = isRayTip ? "" : `<circle cx="${v.screen.sx}" cy="${v.screen.sy}" r="4" fill="#6366F1" fill-opacity="0.16" /><circle cx="${v.screen.sx}" cy="${v.screen.sy}" r="2" fill="${strokeColor}" />`;
    if (!cleanLabel) return dotsSvg;
    const localized = localizeGeometricVertexLabelSSOT(cleanLabel, notation);
    const placed = solveVertexLabelPlacement({
      sx: v.screen.sx, sy: v.screen.sy, label: localized, centerSx, centerSy, isRayTip, occupiedBoxes, segments: obstacleSegments, bounds: { width, height },
    });
    return `${dotsSvg}<text x="${placed.lx.toFixed(1)}" y="${placed.ly.toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="900" font-family="system-ui, sans-serif" fill="${strokeColor}" paint-order="stroke" stroke="#ffffff" stroke-width="2.4" stroke-linejoin="round">${localized}</text>`;
  }).join("");

  const extraPointsForBounds: PlacedPointLike[] = Array.from(vertexMap.values()).map((v) => v.screen);
  const lengthLabelsSvg = segmentMeta.map(({ seg, obs }) => {
    if (!seg.lengthLabel) return "";
    const rawVal = seg.lengthLabel.value;
    const isUnknown = seg.lengthLabel.labelKind === "unknown" || String(rawVal).trim() === "؟" || String(rawVal).trim() === "?";
    const formattedVal = localizeFigureLabelText(String(rawVal), notation, numeralMode);
    const unitText = !isUnknown && seg.lengthLabel.unit ? ` ${seg.lengthLabel.unit}` : "";
    const textStr = `${formattedVal}${unitText}`;
    const placement = solveSegmentPillOrBracketPlacement({
      seg: obs, textStr, centerSx, centerSy, occupiedBoxes, allSegments: obstacleSegments, bounds: { width, height },
    });
    const pillBg = isUnknown ? "#FFFBEB" : "#FFFFFF";
    const pillBorder = isUnknown ? "#F59E0B" : "#CBD5E1";
    const pillTextCol = isUnknown ? "#D97706" : accentColor;
    let bracketSvg = "";
    if (placement.mode === "bracket" && placement.bracket) {
      const { x1, y1, x2, y2, nx, ny, offset } = placement.bracket;
      const sx1 = x1 + nx * 4;
      const sy1 = y1 + ny * 4;
      const sx2 = x2 + nx * 4;
      const sy2 = y2 + ny * 4;
      const bx1 = x1 + nx * offset;
      const by1 = y1 + ny * offset;
      const bx2 = x2 + nx * offset;
      const by2 = y2 + ny * offset;
      extraPointsForBounds.push({ sx: bx1, sy: by1 }, { sx: bx2, sy: by2 });
      bracketSvg = `<path d="M ${sx1.toFixed(1)} ${sy1.toFixed(1)} L ${bx1.toFixed(1)} ${by1.toFixed(1)} L ${bx2.toFixed(1)} ${by2.toFixed(1)} L ${sx2.toFixed(1)} ${sy2.toFixed(1)}" fill="none" stroke="${accentColor}" stroke-width="1" stroke-dasharray="3,2" opacity="0.85" />`;
    }
    return `${bracketSvg}<rect x="${(placement.lx - placement.pillW / 2).toFixed(1)}" y="${(placement.ly - 8).toFixed(1)}" width="${placement.pillW.toFixed(1)}" height="11" rx="3" fill="${pillBg}" stroke="${pillBorder}" stroke-width="0.7" opacity="0.97" /><text x="${placement.lx.toFixed(1)}" y="${placement.ly.toFixed(1)}" text-anchor="middle" font-size="7.8" font-weight="800" font-family="system-ui, sans-serif" fill="${pillTextCol}">${textStr}</text>`;
  }).join("");

  const interiorBadgesSvg = (figure.interiorBadges ?? []).map((b) => {
    const { sx, sy } = toScreen(b.position.x, b.position.y);
    const localizedText = localizeFigureLabelText(b.text, notation, numeralMode);
    const badgeW = Math.max(localizedText.length * 6.0 + 14, 48);
    const badgeH = 16.5;
    const fontSz = b.fontSize ?? 8.2;
    const placed = solveInteriorBadgePlacement({ targetCx: sx, targetCy: sy, badgeW, badgeH, geomBounds, occupiedBoxes, allSegments: obstacleSegments });
    const strokeTint = b.badgeType === "area" ? "#0D9488" : b.badgeType === "perimeter" ? "#4F46E5" : "#475569";
    const bgTint = b.badgeType === "area" ? "#F0FDFA" : b.badgeType === "perimeter" ? "#EEF2FF" : "#F8FAFC";
    return `<rect x="${(placed.cx - badgeW / 2).toFixed(1)}" y="${(placed.cy - badgeH / 2).toFixed(1)}" width="${badgeW.toFixed(1)}" height="${badgeH}" rx="4" fill="${bgTint}" stroke="${strokeTint}" stroke-width="0.8" opacity="0.97" /><text x="${placed.cx.toFixed(1)}" y="${(placed.cy + 3).toFixed(1)}" text-anchor="middle" font-size="${fontSz}" font-weight="700" font-family="system-ui, sans-serif" fill="${strokeTint}">${localizedText}</text>`;
  }).join("");

  const vb = computeExpandedSvgViewBox({ baseWidth: width, baseHeight: height, points: extraPointsForBounds, boxes: occupiedBoxes });
  const bgRectSvg = backgroundColor && backgroundColor !== "transparent"
    ? `<rect x="${vb.minX}" y="${vb.minY}" width="${vb.width}" height="${vb.height}" rx="8" fill="${backgroundColor}" />`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.minX} ${vb.minY} ${vb.width} ${vb.height}" class="w-full h-auto select-none">${bgRectSvg}${circleRimSvg}${surfaceTintsSvg}${segmentLinesSvg}${anglesSvg}${verticesSvg}${lengthLabelsSvg}${interiorBadgesSvg}</svg>`;
}
