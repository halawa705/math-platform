/**
 * @file vector-svg-angle-projector.ts
 * @description مصير الزوايا المتجهي (Vector SVG Angle Projector):
 * - يرسم علامة الزاوية القائمة (مربع زاوية قائمة دقيق).
 * - يرسم أقواس الزوايا مع قياساتها بالدرجات (مثل 60°، 120°، 45°، 150°، أو مجاهيل مثل x°).
 * - يرسم علامات تطابق الزوايا (نقطة • أو علامة ×) المتطابقة مع الكتب المدرسية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 160 سطراً).
 */

import type { CanonicalAngleNode } from "../ssot/geometry-archetype-ssot";
import { formatNumeralsByModeSSOT, type NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_VECTOR_SVG_ANGLE_PROJECTOR =
  "vector_svg_angle_projector" as const;

export interface AngleProjectorScreenVertex {
  readonly sx: number;
  readonly sy: number;
}

export interface AngleProjectorOptions {
  readonly angles: readonly CanonicalAngleNode[];
  readonly vertexMap: Map<string, { readonly screen: AngleProjectorScreenVertex }>;
  readonly strokeColor: string;
  readonly accentColor: string;
  readonly numeralMode: NumeralDisplayMode;
}

export function projectGeometryAnglesSVGMarkup(
  opts: AngleProjectorOptions
): string {
  if (!opts.angles || opts.angles.length === 0) return "";

  const elements: string[] = [];

  for (const ang of opts.angles) {
    const vNode = opts.vertexMap.get(ang.vertexId);
    const a1Node = opts.vertexMap.get(ang.arm1VertexId);
    const a2Node = opts.vertexMap.get(ang.arm2VertexId);

    if (!vNode || !a1Node || !a2Node) continue;

    const vx = vNode.screen.sx;
    const vy = vNode.screen.sy;

    const dx1 = a1Node.screen.sx - vx;
    const dy1 = a1Node.screen.sy - vy;
    const len1 = Math.hypot(dx1, dy1) || 1;
    const u1x = dx1 / len1;
    const u1y = dy1 / len1;

    const dx2 = a2Node.screen.sx - vx;
    const dy2 = a2Node.screen.sy - vy;
    const len2 = Math.hypot(dx2, dy2) || 1;
    const u2x = dx2 / len2;
    const u2y = dy2 / len2;

    // 1. زاوية قائمة (Right Angle Box مع تظليل ناعم)
    if (ang.isRightAngle) {
      const boxSize = 8.5;
      const p1x = vx + u1x * boxSize;
      const p1y = vy + u1y * boxSize;
      const cornerX = vx + (u1x + u2x) * boxSize;
      const cornerY = vy + (u1y + u2y) * boxSize;
      const p2x = vx + u2x * boxSize;
      const p2y = vy + u2y * boxSize;

      elements.push(
        `<path d="M ${vx.toFixed(1)} ${vy.toFixed(1)} L ${p1x.toFixed(1)} ${p1y.toFixed(1)} L ${cornerX.toFixed(1)} ${cornerY.toFixed(1)} L ${p2x.toFixed(1)} ${p2y.toFixed(1)} Z" fill="${opts.accentColor}" fill-opacity="0.15" stroke="${opts.strokeColor}" stroke-width="1.3" />`
      );
      continue;
    }

    // 2. حساب زوايا الأذرع بالراديان للقوس
    let ang1 = Math.atan2(dy1, dx1);
    let ang2 = Math.atan2(dy2, dx2);

    let diff = ang2 - ang1;
    while (diff <= -Math.PI) diff += 2 * Math.PI;
    while (diff > Math.PI) diff -= 2 * Math.PI;

    const startAng = ang1;
    const endAng = ang1 + diff;
    const sweepFlag = diff > 0 ? 1 : 0;
    const rArc = 14;

    const sx = vx + Math.cos(startAng) * rArc;
    const sy = vy + Math.sin(startAng) * rArc;
    const ex = vx + Math.cos(endAng) * rArc;
    const ey = vy + Math.sin(endAng) * rArc;

    // قطاع زاوي ممتلئ بلون شفاف مضيء + قوس ناصع
    elements.push(
      `<path d="M ${vx.toFixed(1)} ${vy.toFixed(1)} L ${sx.toFixed(1)} ${sy.toFixed(1)} A ${rArc} ${rArc} 0 0 ${sweepFlag} ${ex.toFixed(1)} ${ey.toFixed(1)} Z" fill="${opts.accentColor}" fill-opacity="0.14" stroke="none" />`
    );
    elements.push(
      `<path d="M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${rArc} ${rArc} 0 0 ${sweepFlag} ${ex.toFixed(1)} ${ey.toFixed(1)}" fill="none" stroke="${opts.accentColor}" stroke-width="1.4" />`
    );

    // المنصف الزاوي لوضع النص أو العلامة
    const midAng = ang1 + diff / 2;
    const labelDist = rArc + 9;
    const lx = vx + Math.cos(midAng) * labelDist;
    const ly = vy + Math.sin(midAng) * labelDist + 3;

    // 3. كتابة قياس الزاوية (نص أو درجات)
    const labelText =
      ang.degreesLabel ||
      (ang.degrees !== undefined
        ? `${formatNumeralsByModeSSOT(ang.degrees, opts.numeralMode)}°`
        : undefined);

    if (labelText) {
      elements.push(
        `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="8" font-weight="bold" fill="${opts.accentColor}">${labelText}</text>`
      );
    }

    // 4. علامات التطابق الرمزية (نقطة • أو علامة ×)
    if (ang.markSymbol === "dot") {
      const mx = vx + Math.cos(midAng) * (rArc - 4);
      const my = vy + Math.sin(midAng) * (rArc - 4);
      elements.push(
        `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="1.8" fill="${opts.accentColor}" />`
      );
    } else if (ang.markSymbol === "cross") {
      const mx = vx + Math.cos(midAng) * (rArc - 4);
      const my = vy + Math.sin(midAng) * (rArc - 4);
      const s = 2.2;
      elements.push(
        `<path d="M ${(mx - s).toFixed(1)} ${(my - s).toFixed(1)} L ${(mx + s).toFixed(1)} ${(my + s).toFixed(1)} M ${(mx - s).toFixed(1)} ${(my + s).toFixed(1)} L ${(mx + s).toFixed(1)} ${(my - s).toFixed(1)}" stroke="${opts.accentColor}" stroke-width="1.3" />`
      );
    }
  }

  return `<g class="geometry-figure-angles">${elements.join("")}</g>`;
}
