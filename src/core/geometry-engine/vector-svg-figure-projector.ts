/**
 * @file vector-svg-figure-projector.ts
 * @description المصير المتجهي النقي (Pure Vector SVG Projector) الذي يحول CanonicalGeometryFigureIR
 * المنبثقة من أصول العائلات الهندسية (`triangle-root-core.ts` وغيرها) إلى رسم SVG متجهي فائق الدقة
 * للشاشة والطباعة الورقية مع دعم علامات التساوي (Ticks)، أسهم التوازي، والأرقام العربية/المشرقية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import {
  formatNumeralsByModeSSOT,
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";
import { projectGeometryAnglesSVGMarkup } from "./vector-svg-angle-projector";
import { localizeFigureLabelText } from "./figure-label-symbol-localizer";
import { projectGeometrySurfaceShadingSVGMarkup } from "./vector-svg-surface-shading-projector";
import { projectCirclesArcsAndRegionsSVGMarkup } from "./vector-svg-circles-and-arcs-projector";

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
  const bgRectSvg =
    backgroundColor && backgroundColor !== "transparent"
      ? `<rect x="0" y="0" width="${width}" height="${height}" rx="8" fill="${backgroundColor}" />`
      : "";

  if (figure.rawSvgMarkup) {
    return figure.rawSvgMarkup;
  }

  if (figure.vertices.length === 0) {
    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%"></svg>`;
  }

  const xs = figure.vertices.map((v) => v.position.x);
  const ys = figure.vertices.map((v) => v.position.y);
  for (const c of figure.circles ?? []) {
    const cv = figure.vertices.find((v) => v.id === c.centerVertexId);
    if (cv && c.radius > 0) {
      xs.push(cv.position.x - c.radius, cv.position.x + c.radius);
      ys.push(cv.position.y - c.radius, cv.position.y + c.radius);
    }
  }
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const scale = Math.min(
    (width - padding * 2) / spanX,
    (height - padding * 2) / spanY
  );
  const offsetX = (width - spanX * scale) / 2;
  const offsetY = (height - spanY * scale) / 2;

  const toScreen = (x: number, y: number) => ({
    sx: Number((offsetX + (x - minX) * scale).toFixed(1)),
    sy: Number((height - offsetY - (y - minY) * scale).toFixed(1)),
  });

  const vertexMap = new Map(
    figure.vertices.map((v) => [
      v.id,
      { ...v, screen: toScreen(v.position.x, v.position.y) },
    ])
  );

  // حساب مركز ثقل الشكل لإزاحة تسميات الرؤوس للخارج بعيداً عن الأضلاع
  const centerSx = Array.from(vertexMap.values()).reduce((acc, v) => acc + v.screen.sx, 0) / figure.vertices.length;
  const centerSy = Array.from(vertexMap.values()).reduce((acc, v) => acc + v.screen.sy, 0) / figure.vertices.length;

  const circleRimSvg = projectCirclesArcsAndRegionsSVGMarkup({
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
  });

  const segmentsSvg = figure.segments
    .map((seg) => {
      const fromV = vertexMap.get(seg.fromVertexId);
      const toV = vertexMap.get(seg.toVertexId);
      if (!fromV || !toV) return "";

      const x1 = fromV.screen.sx;
      const y1 = fromV.screen.sy;
      const x2 = toV.screen.sx;
      const y2 = toV.screen.sy;
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;

      const dashAttr =
        seg.strokeStyle === "dashed"
          ? `stroke-dasharray="4,3"`
          : seg.strokeStyle === "dotted"
          ? `stroke-dasharray="2,2"`
          : "";

      let decorations = "";

      // علامات تساوي الأضلاع (Tick Marks)
      if (seg.tickMarks) {
        const count = seg.tickMarks;
        for (let i = 0; i < count; i++) {
          const offset = (i - (count - 1) / 2) * 4;
          const tx = mx + (dx / len) * offset;
          const ty = my + (dy / len) * offset;
          decorations += `<line x1="${(tx - nx * 4).toFixed(1)}" y1="${(
            ty -
            ny * 4
          ).toFixed(1)}" x2="${(tx + nx * 4).toFixed(1)}" y2="${(
            ty +
            ny * 4
          ).toFixed(1)}" stroke="${accentColor}" stroke-width="1.5" />`;
        }
      }

      // أسهم التوازي (Parallel Arrows)
      if (seg.parallelArrows) {
        const ux = dx / len;
        const uy = dy / len;
        const ax = mx - ux * 3;
        const ay = my - uy * 3;
        decorations += `<path d="M ${(ax - ux * 4 + nx * 3).toFixed(1)} ${(
          ay -
          uy * 4 +
          ny * 3
        ).toFixed(1)} L ${(ax + ux * 2.5).toFixed(1)} ${(ay + uy * 2.5).toFixed(
          1
        )} L ${(ax - ux * 4 - nx * 3).toFixed(1)} ${(
          ay -
          uy * 4 -
          ny * 3
        ).toFixed(
          1
        )}" fill="none" stroke="${accentColor}" stroke-width="1.5" stroke-linecap="round"/>`;
      }

      // أسهم الأشعة والمتجهات والخطوط المستقيمة (Ray & Line Vector Arrowheads)
      const arrowLen = 7.5;
      const arrowHalfW = 3.2;
      const ux = dx / len;
      const uy = dy / len;

      if (seg.arrowAtEnd || seg.isRay) {
        const pLeftX = x2 - ux * arrowLen + nx * arrowHalfW;
        const pLeftY = y2 - uy * arrowLen + ny * arrowHalfW;
        const pRightX = x2 - ux * arrowLen - nx * arrowHalfW;
        const pRightY = y2 - uy * arrowLen - ny * arrowHalfW;
        decorations += `<polygon points="${x2.toFixed(1)},${y2.toFixed(1)} ${pLeftX.toFixed(1)},${pLeftY.toFixed(1)} ${pRightX.toFixed(1)},${pRightY.toFixed(1)}" fill="${strokeColor}" />`;
      }

      if (seg.arrowAtStart || seg.isLine) {
        const pLeftX = x1 + ux * arrowLen + nx * arrowHalfW;
        const pLeftY = y1 + uy * arrowLen + ny * arrowHalfW;
        const pRightX = x1 + ux * arrowLen - nx * arrowHalfW;
        const pRightY = y1 + uy * arrowLen - ny * arrowHalfW;
        decorations += `<polygon points="${x1.toFixed(1)},${y1.toFixed(1)} ${pLeftX.toFixed(1)},${pLeftY.toFixed(1)} ${pRightX.toFixed(1)},${pRightY.toFixed(1)}" fill="${strokeColor}" />`;
      }

      // تسمية طول الضلع داخل كبسولة عائمة بيضاء أنيقة تمنع التداخل (Floating Pill Badge)
      if (seg.lengthLabel) {
        const rawVal = seg.lengthLabel.value;
        const isUnknown =
          seg.lengthLabel.labelKind === "unknown" ||
          String(rawVal).trim() === "؟" ||
          String(rawVal).trim() === "?";
        const formattedVal = localizeFigureLabelText(String(rawVal), notation, numeralMode);
        const unitText = !isUnknown && seg.lengthLabel.unit ? ` ${seg.lengthLabel.unit}` : "";
        const textStr = `${formattedVal}${unitText}`;
        const pillW = Math.max(textStr.length * 5.2 + 6, 16);
        const lx = mx + nx * 7;
        const ly = my + ny * 7 + 2.5;
        const pillBg = isUnknown ? "#FFFBEB" : "#FFFFFF";
        const pillBorder = isUnknown ? "#F59E0B" : "#E2E8F0";
        const pillTextCol = isUnknown ? "#D97706" : accentColor;

        decorations += `<rect x="${(lx - pillW / 2).toFixed(1)}" y="${(ly - 7.5).toFixed(1)}" width="${pillW.toFixed(1)}" height="10.5" rx="3" fill="${pillBg}" stroke="${pillBorder}" stroke-width="0.7" opacity="0.95" /><text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="7.8" font-weight="800" font-family="system-ui, sans-serif" fill="${pillTextCol}">${textStr}</text>`;
      }

      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" ${dashAttr} />${decorations}`;
    })
    .join("");

  const surfaceTintsSvg = projectGeometrySurfaceShadingSVGMarkup({ figure, vertexMap });

  // شارات النصوص التوضيحية داخل مساحة الشكل (مثل: المحيط = 24 سم أو المساحة = 30 سم²)
  let interiorBadgesSvg = "";
  if (figure.interiorBadges && figure.interiorBadges.length > 0) {
    interiorBadgesSvg = figure.interiorBadges
      .map((b) => {
        const { sx, sy } = toScreen(b.position.x, b.position.y);
        const localizedText = localizeFigureLabelText(b.text, notation, numeralMode);
        const badgeW = Math.max(localizedText.length * 6.2 + 14, 48);
        const badgeH = 18;
        const fontSz = b.fontSize ?? 8.5;
        const strokeTint = b.badgeType === "area" ? "#0D9488" : b.badgeType === "perimeter" ? "#4F46E5" : "#64748B";
        const bgTint = b.badgeType === "area" ? "#F0FDFA" : b.badgeType === "perimeter" ? "#EEF2FF" : "#F8FAFC";

        return `<rect x="${(sx - badgeW / 2).toFixed(1)}" y="${(sy - badgeH / 2).toFixed(1)}" width="${badgeW.toFixed(1)}" height="${badgeH}" rx="4" fill="${bgTint}" stroke="${strokeTint}" stroke-width="0.8" opacity="0.95" /><text x="${sx.toFixed(1)}" y="${(sy + 3.2).toFixed(1)}" text-anchor="middle" font-size="${fontSz}" font-weight="700" font-family="system-ui, sans-serif" fill="${strokeTint}">${localizedText}</text>`;
      })
      .join("");
  }

  const anglesSvg = projectGeometryAnglesSVGMarkup({
    angles: figure.angles,
    vertexMap,
    strokeColor,
    accentColor,
    numeralMode,
    notation,
  });

  const arrowTipVertexIds = new Set<string>();
  const outgoingCount = new Map<string, number>();
  for (const seg of figure.segments) {
    outgoingCount.set(seg.fromVertexId, (outgoingCount.get(seg.fromVertexId) ?? 0) + 1);
    if (seg.arrowAtEnd || seg.isRay) arrowTipVertexIds.add(seg.toVertexId);
    if (seg.arrowAtStart || seg.isLine) arrowTipVertexIds.add(seg.fromVertexId);
  }

  const verticesSvg = Array.from(vertexMap.values())
    .map((v) => {
      const cleanLabel = (v.label || "").trim();
      const isRayTip = v.hideVertexDot || (arrowTipVertexIds.has(v.id) && (outgoingCount.get(v.id) ?? 0) <= 0);
      if (v.hideVertexDot && !cleanLabel) {
        return "";
      }
      const vx = v.screen.sx - centerSx;
      const vy = v.screen.sy - centerSy;
      const vLen = Math.hypot(vx, vy) || 1;
      const labelOffset = isRayTip ? 11 : 9;
      const labelX = v.screen.sx + (vx / vLen) * labelOffset;
      const labelY = v.screen.sy + (vy / vLen) * labelOffset + 3;

      const dotsSvg = isRayTip
        ? ""
        : `<circle cx="${v.screen.sx}" cy="${v.screen.sy}" r="4" fill="#6366F1" fill-opacity="0.16" /><circle cx="${v.screen.sx}" cy="${v.screen.sy}" r="2" fill="${strokeColor}" />`;

      const textSvg = cleanLabel
        ? `<text x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="900" font-family="system-ui, sans-serif" fill="${strokeColor}">${localizeGeometricVertexLabelSSOT(cleanLabel, notation)}</text>`
        : "";

      return `${dotsSvg}${textSvg}`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none">${bgRectSvg}${circleRimSvg}${surfaceTintsSvg}${segmentsSvg}${interiorBadgesSvg}${anglesSvg}${verticesSvg}</svg>`;
}

