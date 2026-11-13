/**
 * @file math-venn-diagram-svg-builder.ts
 * @description مصيّر مخططات فن المتجهية النقية (SVG) لتحليل العوامل الأولية ومجموعات الأعداد ونظرية المجموعات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 220 سطراً).
 */

import {
  formatNumeralsByModeSSOT,
  type NumeralDisplayMode,
} from "../../ssot/numeral-and-unit-ssot";
import type { NestedVennLayerSpec } from "./math-venn-diagram-parser-helpers";

export const MODULE_ID_MATH_VENN_DIAGRAM_SVG_BUILDER =
  "math_venn_diagram_svg_builder" as const;

export interface MathVennDiagramOptions {
  readonly labelA?: string;
  readonly labelB?: string;
  readonly labelU?: string;
  readonly setA?: readonly (number | string)[];
  readonly setB?: readonly (number | string)[];
  readonly intersection?: readonly (number | string)[];
  readonly universalSet?: readonly (number | string)[];
  readonly complement?: readonly (number | string)[];
  readonly isSetTheory?: boolean;
  readonly isNestedSets?: boolean;
  readonly nestedLayers?: readonly NestedVennLayerSpec[];
  readonly numeralMode?: NumeralDisplayMode;
  readonly width?: number;
  readonly height?: number;
}

function getNestedLayerPalette(sym: string, name: string, idx: number) {
  if (sym === "C" || name.includes("العد")) return { border: "#059669", fill: "rgba(5,150,105,0.07)", badgeBg: "#ecfdf5", badgeBorder: "#a7f3d0", text: "#047857", symbolMath: "𝕮" };
  if (sym === "N" || name.includes("الطبيعية")) return { border: "#8b5cf6", fill: "rgba(139,92,246,0.07)", badgeBg: "#f5f3ff", badgeBorder: "#ddd6fe", text: "#6d28d9", symbolMath: "ℕ" };
  if (sym === "Z" || name.includes("الصحيحة")) return { border: "#4f46e5", fill: "rgba(79,70,229,0.06)", badgeBg: "#eef2ff", badgeBorder: "#c7d2fe", text: "#3730a3", symbolMath: "ℤ" };
  if (sym === "Q" || name.includes("النسبية")) return { border: "#0284c7", fill: "rgba(2,132,199,0.05)", badgeBg: "#f0f9ff", badgeBorder: "#bae6fd", text: "#0369a1", symbolMath: "ℚ" };
  if (sym === "R" || name.includes("الحقيقية")) return { border: "#d97706", fill: "rgba(217,119,6,0.06)", badgeBg: "#fffbeb", badgeBorder: "#fde68a", text: "#b45309", symbolMath: "ℝ" };
  const fallbacks = [
    { border: "#059669", fill: "rgba(5,150,105,0.07)", badgeBg: "#ecfdf5", badgeBorder: "#a7f3d0", text: "#047857", symbolMath: "𝕮" },
    { border: "#4f46e5", fill: "rgba(79,70,229,0.06)", badgeBg: "#eef2ff", badgeBorder: "#c7d2fe", text: "#3730a3", symbolMath: "ℤ" },
    { border: "#0284c7", fill: "rgba(2,132,199,0.05)", badgeBg: "#f0f9ff", badgeBorder: "#bae6fd", text: "#0369a1", symbolMath: "ℚ" },
  ];
  return fallbacks[idx % fallbacks.length];
}

export function renderNestedNumberSetsVennSVG(options: MathVennDiagramOptions): string {
  const numeralMode = options.numeralMode ?? "western";
  const layers = options.nestedLayers?.length
    ? options.nestedLayers
    : [
        { name: "أعداد العد", symbol: "C", elements: [] },
        { name: "الأعداد الصحيحة", symbol: "Z", elements: [] },
        { name: "الأعداد النسبية", symbol: "Q", elements: [] },
      ];
  const w = options.width ?? 440;
  const h = options.height ?? 260;
  const totalLayers = Math.max(1, layers.length);
  const fmt = (v: number | string) => formatNumeralsByModeSSOT(v, numeralMode);

  const shapes: string[] = [];
  const badges: string[] = [];
  const elems: string[] = [];

  for (let i = totalLayers - 1; i >= 0; i--) {
    const layer = layers[i];
    const pal = getNestedLayerPalette(layer.symbol, layer.name, i);
    const depth = totalLayers - 1 - i;
    const insetX = 14 + depth * (116 / totalLayers);
    const insetTop = 14 + depth * (76 / totalLayers);
    const insetBottom = 14 + depth * (24 / totalLayers);
    const lw = w - 2 * insetX;
    const lh = h - insetTop - insetBottom;
    const rx = Math.max(14, 26 - depth * 4);

    shapes.push(`<rect x="${insetX}" y="${insetTop}" width="${lw}" height="${lh}" rx="${rx}" fill="${pal.fill}" stroke="${pal.border}" stroke-width="2" />`);

    const bw = Math.min(150, Math.max(105, lw - 30));
    const bx = insetX + (lw - bw) / 2;
    const by = insetTop + 8;
    badges.push(
      `<g><rect x="${bx}" y="${by}" width="${bw}" height="22" rx="5" fill="${pal.badgeBg}" stroke="${pal.badgeBorder}" stroke-width="1.2" /><text x="${bx + bw / 2}" y="${by + 11.5}" text-anchor="middle" dominant-baseline="central" font-family="Cairo, sans-serif" font-weight="800" font-size="11.5" fill="${pal.text}">${layer.name} (${pal.symbolMath})</text></g>`
    );

    layer.elements.forEach((el, eIdx) => {
      const px = depth > 0
        ? (eIdx % 2 === 0 ? insetX + 35 + ((eIdx * 25) % 40) : insetX + lw - 35 - ((eIdx * 25) % 40))
        : insetX + 30 + (eIdx + 1) * ((lw - 60) / Math.max(1, layer.elements.length + 1));
      const py = depth > 0 ? insetTop + 45 + ((eIdx * 30) % Math.max(30, lh - 60)) : insetTop + lh / 2 + 10;
      elems.push(`<g><circle cx="${px}" cy="${py}" r="11" fill="#ffffff" stroke="${pal.border}" stroke-width="1.5" /><text x="${px}" y="${py + 0.5}" text-anchor="middle" dominant-baseline="central" font-family="Cairo, sans-serif" font-weight="900" font-size="11.5" fill="${pal.text}">${fmt(el)}</text></g>`);
    });
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="w-full h-auto select-none" style="background:#ffffff">${shapes.join("")}${badges.join("")}${elems.join("")}</svg>`;
}

function placeVennItems(items: readonly (number | string)[], cx: number, cy: number, numeralMode: NumeralDisplayMode, maxSpreadY = 28) {
  const fmt = (v: number | string) => formatNumeralsByModeSSOT(v, numeralMode);
  if (items.length === 0) return [];
  if (items.length === 1) return [{ val: fmt(items[0]), x: cx, y: cy }];
  if (items.length === 2) return [{ val: fmt(items[0]), x: cx, y: cy - maxSpreadY / 1.5 }, { val: fmt(items[1]), x: cx, y: cy + maxSpreadY / 1.5 }];
  if (items.length === 3) return [{ val: fmt(items[0]), x: cx, y: cy - maxSpreadY }, { val: fmt(items[1]), x: cx, y: cy }, { val: fmt(items[2]), x: cx, y: cy + maxSpreadY }];
  const half = Math.ceil(items.length / 2);
  const col1 = items.slice(0, half);
  const col2 = items.slice(half);
  const s1 = (maxSpreadY * 2) / Math.max(1, col1.length - 1);
  const s2 = (maxSpreadY * 2) / Math.max(1, col2.length - 1);
  return [
    ...col1.map((it, idx) => ({ val: fmt(it), x: cx - 10, y: cy - maxSpreadY + idx * s1 })),
    ...col2.map((it, idx) => ({ val: fmt(it), x: cx + 10, y: cy - maxSpreadY + idx * s2 })),
  ];
}

export function renderMathVennDiagramSVG(options: MathVennDiagramOptions): string {
  if (options.isNestedSets || (options.nestedLayers && options.nestedLayers.length > 0)) {
    return renderNestedNumberSetsVennSVG(options);
  }
  const numeralMode = options.numeralMode ?? "western";
  const labelA = options.labelA ?? "A";
  const labelB = options.labelB ?? "B";
  const setA = options.setA ?? [];
  const setB = options.setB ?? [];
  const intersection = options.intersection ?? [];
  const complement = options.complement ?? [];
  const hasU = Boolean(options.universalSet || options.labelU || options.isSetTheory || complement.length > 0);
  const labelU = options.labelU ?? "U";

  const w = options.width ?? (hasU ? 350 : 320);
  const h = options.height ?? (hasU ? 210 : 180);
  const cRadius = hasU ? 62 : 60;
  const cAy = hasU ? 116 : 100;
  const cAx = hasU ? 122 : 110;
  const cBx = hasU ? 218 : 210;

  const placedA = placeVennItems(setA, cAx - 32, cAy, numeralMode, 30);
  const placedI = placeVennItems(intersection, (cAx + cBx) / 2, cAy, numeralMode, 30);
  const placedB = placeVennItems(setB, cBx + 32, cAy, numeralMode, 30);
  const compSlots = [
    { x: 32, y: 36 }, { x: 32, y: 176 }, { x: (cAx + cBx) / 2, y: h - 22 }, { x: w - 32, y: 176 },
  ];
  const placedC = complement.map((it, idx) => ({
    val: formatNumeralsByModeSSOT(it, numeralMode),
    x: compSlots[idx % compSlots.length].x,
    y: compSlots[idx % compSlots.length].y,
  }));

  const badgesSvg = (items: ReadonlyArray<{ val: string; x: number; y: number }>, borderHex: string, textHex = "#0f172a") =>
    items.map((it) => `<g><circle cx="${it.x}" cy="${it.y}" r="11" fill="#ffffff" stroke="${borderHex}" stroke-width="1.5" /><text x="${it.x}" y="${it.y + 0.5}" text-anchor="middle" dominant-baseline="central" font-family="Cairo, sans-serif" font-weight="900" font-size="12" fill="${textHex}">${it.val}</text></g>`).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="w-full h-auto select-none" style="background:#ffffff">
  ${hasU ? `<rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="8" fill="#f8fafc" stroke="#334155" stroke-width="2" /><rect x="${w - 44}" y="14" width="30" height="20" rx="4" fill="#1e293b" /><text x="${w - 29}" y="24.5" text-anchor="middle" dominant-baseline="central" font-family="Cairo, sans-serif" font-weight="900" font-size="12" fill="#ffffff">${labelU}</text>` : ""}
  <circle cx="${cAx}" cy="${cAy}" r="${cRadius}" fill="rgba(37,99,235,0.07)" stroke="#2563eb" stroke-width="2" />
  <circle cx="${cBx}" cy="${cAy}" r="${cRadius}" fill="rgba(234,88,12,0.07)" stroke="#ea580c" stroke-width="2" />
  <rect x="${cAx - 34}" y="${hasU ? 22 : 12}" width="68" height="20" rx="5" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.2" />
  <text x="${cAx}" y="${hasU ? 32.5 : 22.5}" text-anchor="middle" dominant-baseline="central" font-family="Cairo, sans-serif" font-weight="800" font-size="11" fill="#1d4ed8">${formatNumeralsByModeSSOT(labelA, numeralMode)}</text>
  <rect x="${cBx - 34}" y="${hasU ? 22 : 12}" width="68" height="20" rx="5" fill="#fff7ed" stroke="#fed7aa" stroke-width="1.2" />
  <text x="${cBx}" y="${hasU ? 32.5 : 22.5}" text-anchor="middle" dominant-baseline="central" font-family="Cairo, sans-serif" font-weight="800" font-size="11" fill="#c2410c">${formatNumeralsByModeSSOT(labelB, numeralMode)}</text>
  ${badgesSvg(placedA, "#93c5fd")}
  ${badgesSvg(placedI, "#a855f7")}
  ${badgesSvg(placedB, "#fdba74")}
  ${hasU && placedC.length > 0 ? badgesSvg(placedC, "#94a3b8", "#334155") : ""}
</svg>`;
}
