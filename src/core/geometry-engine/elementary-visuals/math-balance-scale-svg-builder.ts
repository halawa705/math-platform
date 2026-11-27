/**
 * @file math-balance-scale-svg-builder.ts
 * @description راسم متجهي حتمي للميزان ذي الكفتين المتزن في مسائل المعادلات الجبرية والابتدائي/الإعدادي
 * (كفتان متزنتان تحويان كتلاً مجهولة x أو س وأثقالاً عددية بالجرام/كجم) كـ Vector SVG نقي شفاف.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 140 سطراً).
 */

import {
  formatNumeralsByModeSSOT,
  toWesternNumeralsSSOT,
  type NumeralDisplayMode,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_MATH_BALANCE_SCALE_SVG_BUILDER =
  "math_balance_scale_svg_builder" as const;

interface PanContent {
  readonly varCount: number;
  readonly varSymbol: string;
  readonly constLabel?: string;
}

function parsePanSpec(clause: string, defaultSym: string): PanContent {
  const norm = toWesternNumeralsSSOT(clause || "");
  let varCount = 0;
  let constLabel: string | undefined;

  if (/قطعتان|كفتان|مكعبان|صندوقان|كتلتان/i.test(norm)) {
    varCount = 2;
  } else {
    const varMatch = norm.match(
      /(\d+)\s*(?:قطع(?:ة)?|مكعب(?:ات)?|صناديق|صندوق|أكياس|كيس|كتل(?:ة)?)/i
    );
    if (varMatch?.[1]) varCount = Math.min(5, Math.max(1, Number(varMatch[1])));
  }

  const unitWeightMatch = norm.match(/(\d+)\s*أثقال\s*من\s*فئة\s*(\d+(?:\.\d+)?)\s*(جرام|جم|كجم)?/i);
  if (unitWeightMatch?.[1]) {
    const cnt = Number(unitWeightMatch[1]);
    const val = Number(unitWeightMatch[2] || "1");
    const total = cnt * val;
    const unit = unitWeightMatch[3] === "جرام" ? "جم" : (unitWeightMatch[3] || "");
    constLabel = unit ? `${total} ${unit}` : `${total}`;
  } else {
    const weightMatch = norm.match(
      /(?:ثقل(?:\s*(?:وزنه|قدره))?|وزن[ها]?)\s*(\d+(?:\.\d+)?)\s*(كجم|كيلوجرام|جرام|جم)?/i
    );
    if (weightMatch?.[1]) {
      const unit =
        weightMatch[2] === "كيلوجرام" ? "كجم" : weightMatch[2] === "جرام" ? "جم" : (weightMatch[2] || "");
      constLabel = unit ? `${weightMatch[1]} ${unit}` : weightMatch[1];
    }
  }

  const symMatch = norm.match(/\b([xyz])\b|([سصع])(?![أ-ي])/i);
  const varSymbol = symMatch?.[1] || symMatch?.[2] || defaultSym;
  return { varCount, varSymbol, constLabel };
}

function renderPanItemsSvg(pan: PanContent, cx: number, panY: number, fmt: (s: string) => string): string {
  const blocks: Array<{ kind: "var" | "const"; text: string; w: number }> = [];
  for (let i = 0; i < pan.varCount; i++) {
    blocks.push({ kind: "var", text: fmt(pan.varSymbol), w: 20 });
  }
  if (pan.constLabel) {
    const cw = Math.max(26, Math.min(48, pan.constLabel.length * 6.5 + 8));
    blocks.push({ kind: "const", text: fmt(pan.constLabel), w: cw });
  }
  if (blocks.length === 0) blocks.push({ kind: "const", text: "؟", w: 24 });

  const gap = 3;
  const totalW = blocks.reduce((acc, b) => acc + b.w, 0) + gap * (blocks.length - 1);
  let curX = cx - totalW / 2;
  const h = 21;
  const y = panY - h;

  return blocks
    .map((b) => {
      const rx = curX;
      curX += b.w + gap;
      const fill = b.kind === "var" ? "#E0F2FE" : "#FEF2F2";
      const stroke = b.kind === "var" ? "#0284C7" : "#C81E1E";
      const textFill = b.kind === "var" ? "#0369A1" : "#C81E1E";
      return `<rect x="${rx.toFixed(1)}" y="${y}" width="${b.w}" height="${h}" rx="3.5" fill="${fill}" stroke="${stroke}" stroke-width="1.5" /><text x="${(rx + b.w / 2).toFixed(1)}" y="${y + 14.5}" text-anchor="middle" font-size="10.5" font-weight="900" font-family="system-ui, sans-serif" fill="${textFill}">${b.text}</text>`;
    })
    .join("");
}

/** يبني SVG لميزان ذي كفتين متزن إذا كان الوصف يصف مسألة ميزان معادلات. */
export function tryBuildMathBalanceScaleSvg(
  description: string,
  numeralMode: NumeralDisplayMode = "western"
): string | null {
  if (!description || !/ميزان\s*(?:ذو\s*)?كفتين|كفتي\s*الميزان|الاتزان\s*بالميزان/i.test(description)) {
    return null;
  }

  const symHint = description.match(/\b([xyz])\b|([سصع])(?![أ-ي])/i);
  const defaultSym = symHint?.[1] || symHint?.[2] || "x";

  const rightMatch = description.match(/الكفة\s*اليمنى([^،.;\n\]]+)/i);
  const leftMatch = description.match(/الكفة\s*اليسرى([^،.;\n\]]+)/i);
  const rightPan = parsePanSpec(rightMatch?.[1] || "", defaultSym);
  const leftPan = parsePanSpec(leftMatch?.[1] || "", defaultSym);

  const fmt = (s: string) => formatNumeralsByModeSSOT(s, numeralMode);
  const leftCx = 56;
  const rightCx = 184;
  const panY = 72;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 116" width="100%" height="100%" style="display:block;margin:auto;background:transparent;">
    <line x1="88" y1="108" x2="152" y2="108" stroke="#0F172A" stroke-width="3" stroke-linecap="round" />
    <line x1="120" y1="22" x2="120" y2="108" stroke="#0F172A" stroke-width="2.6" stroke-linecap="round" />
    <polygon points="120,17 113,29 127,29" fill="#0F172A" />
    <line x1="${leftCx}" y1="26" x2="${rightCx}" y2="26" stroke="#0F172A" stroke-width="2.6" stroke-linecap="round" />
    <line x1="${leftCx}" y1="26" x2="${leftCx - 26}" y2="${panY}" stroke="#475569" stroke-width="1.2" />
    <line x1="${leftCx}" y1="26" x2="${leftCx + 26}" y2="${panY}" stroke="#475569" stroke-width="1.2" />
    <line x1="${rightCx}" y1="26" x2="${rightCx - 26}" y2="${panY}" stroke="#475569" stroke-width="1.2" />
    <line x1="${rightCx}" y1="26" x2="${rightCx + 26}" y2="${panY}" stroke="#475569" stroke-width="1.2" />
    <path d="M ${leftCx - 34} ${panY} Q ${leftCx} ${panY + 12} ${leftCx + 34} ${panY} Z" fill="#E2E8F0" stroke="#0F172A" stroke-width="1.6" />
    <path d="M ${rightCx - 34} ${panY} Q ${rightCx} ${panY + 12} ${rightCx + 34} ${panY} Z" fill="#E2E8F0" stroke="#0F172A" stroke-width="1.6" />
    ${renderPanItemsSvg(leftPan, leftCx, panY, fmt)}
    ${renderPanItemsSvg(rightPan, rightCx, panY, fmt)}
  </svg>`;
}
