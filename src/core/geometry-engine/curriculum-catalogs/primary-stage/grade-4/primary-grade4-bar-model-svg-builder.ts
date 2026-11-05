/**
 * @file primary-grade4-bar-model-svg-builder.ts
 * @description مصيّر SVG متجهي حتمي للنموذج الشريطي (الكل أعلى + جزءان أسفل). المجهول يُرسم رمزاً/«؟»/فراغاً منقطاً ولا تُطبع قيمة محسوبة.
 */
import { formatNumeralsByModeSSOT, type NumeralDisplayMode } from "../../../../ssot/numeral-and-unit-ssot";
import type { BarModelCell, BarModelFacts } from "./primary-grade4-bar-model-fact-parser";

export const MODULE_ID_PRIMARY_GRADE4_BAR_MODEL_SVG_BUILDER = "primary_grade4_bar_model_svg_builder" as const;

const W = 260;
const H = 92;
const FONT = 'font-family="Cairo, Almarai, sans-serif"';

function cellLabel(cell: BarModelCell, mode: NumeralDisplayMode): { text: string; dotted: boolean } {
  const unit = cell.unit ? ` ${cell.unit}` : "";
  if (cell.kind === "number") return { text: `${formatNumeralsByModeSSOT(cell.value, mode)}${unit}`, dotted: false };
  if (cell.kind === "symbol") return { text: `${cell.symbol}${unit}`, dotted: false };
  if (cell.kind === "question") return { text: `؟${unit}`, dotted: false };
  return { text: unit.trim(), dotted: true };
}

function drawCell(cell: BarModelCell, x: number, y: number, w: number, h: number, mode: NumeralDisplayMode): string {
  const { text, dotted } = cellLabel(cell, mode);
  const cx = x + w / 2;
  const cy = y + h / 2 + 5;
  const dots = dotted ? `<line x1="${x + 10}" y1="${cy}" x2="${x + w * 0.55}" y2="${cy}" stroke="#334155" stroke-width="1.2" stroke-dasharray="2 3"/>` : "";
  const textX = dotted ? x + w * 0.78 : cx;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#0F172A" stroke-width="1.6" rx="3"/>${dots}` +
    (text ? `<text x="${textX}" y="${cy}" text-anchor="middle" font-size="14" font-weight="700" ${FONT} fill="#0F172A">${text}</text>` : "");
}

export function buildGrade4BarModelSvgMarkup(facts: BarModelFacts, numeralMode: NumeralDisplayMode = "western"): string {
  const x0 = 10;
  const totalW = W - 20;
  const half = totalW / 2;
  const topH = 38;
  const botH = 38;
  const parts = [
    drawCell(facts.whole, x0, 8, totalW, topH, numeralMode),
    // الجزء الأول على اليمين، الثاني على اليسار
    drawCell(facts.parts[0], x0 + half, 8 + topH, half, botH, numeralMode),
    drawCell(facts.parts[1], x0, 8 + topH, half, botH, numeralMode),
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" direction="ltr">${parts.join("")}</svg>`;
}
