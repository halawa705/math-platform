/**
 * @file partial-quotients-division-svg-builder.ts
 * @description محلل ومصيّر Vector SVG نقي لخوارزمية القسمة بالتجزئة (نموذج التجزئة للقسمة)
 * مع عرض المقسوم والمقسوم عليه وخطوات الطرح المتتالية والنواتج الجزئية جهة اليمين والمجاهيل (x, y, س).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 210 سطراً).
 */

import {
  formatNumeralsByModeSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "../../ssot/numeral-and-unit-ssot";
import {
  isSymbolicAreaModelUnknown,
  normalizeDigitsToWestern,
  sanitizeMathToken,
} from "./multiplication-area-model-clause-parser";

export const MODULE_ID_PARTIAL_QUOTIENTS_DIVISION_SVG_BUILDER =
  "partial_quotients_division_svg_builder" as const;

export interface PartialQuotientsStep {
  readonly partialQuotient: string;
  readonly subtracted?: string;
  readonly remainderAfter?: string;
}

export interface PartialQuotientsDivisionSpec {
  readonly dividend: string;
  readonly divisor: string;
  readonly steps: readonly PartialQuotientsStep[];
  readonly finalRemainder?: string;
}

export interface PartialQuotientsSvgOptions {
  readonly numeralMode?: NumeralDisplayMode;
  readonly notationLanguage?: MathNotationLanguage;
  readonly primaryHex?: string;
}

function cleanToken(raw: string): string {
  return raw
    .replace(/[`$\\]/g, "")
    .replace(/(?<=\d),(?=\d{3}\b)/g, "")
    .replace(/[،\s.;:]+$/g, "")
    .trim();
}

export function parsePartialQuotientsDivisionFromText(
  rawText: string
): PartialQuotientsDivisionSpec | null {
  if (!rawText) return null;
  if (
    !/(?:نموذج\s*التجزئة|خوارزمية\s*التجزئة|القسمة\s*بالتجزئة|النواتج\s*الجزئية\s*جهة\s*اليمين)/i.test(
      rawText
    )
  ) {
    return null;
  }
  if (!/(?:المقسوم|المقسوم\s*عليه|قسمة|÷|\\div)/i.test(rawText)) {
    return null;
  }

  const normalized = normalizeDigitsToWestern(
    rawText
      .replace(/[`]/g, " ")
      .replace(/\\\(|\\\)/g, " ")
      .replace(/\$/g, " ")
  );

  const dividendMatch = normalized.match(/المقسوم(?!\s*(?:عليه|الجزئي))\s*[:=]\s*([0-9,]+)/i);
  const divisorMatch = normalized.match(/المقسوم\s*عليه\s*[:=]\s*([0-9,]+)/i);
  const divOpMatch = normalized.match(/([0-9,]+)\s*(?:÷|\\div)\s*([0-9,]+)/i);

  const dividend = sanitizeMathToken(dividendMatch?.[1] || divOpMatch?.[1] || "");
  const divisor = sanitizeMathToken(divisorMatch?.[1] || divOpMatch?.[2] || "");
  if (!dividend || !divisor) return null;

  const stepChunks = normalized
    .split(/(?=الخطوة\s*(?:الأولى|الثانية|الثالثة|الرابعة|الخامسة|[1-5])\s*[:=]?)/i)
    .filter((c) => /^الخطوة\s*(?:الأولى|الثانية|الثالثة|الرابعة|الخامسة|[1-5])/i.test(c.trim()));

  const steps: PartialQuotientsStep[] = [];
  for (const chunk of stepChunks) {
    const qMatch = chunk.match(
      /^الخطوة\s*(?:الأولى|الثانية|الثالثة|الرابعة|الخامسة|[1-5])\s*[:=]?\s*([0-9,]+|[A-Za-z]|س|ص|؟|\?)/i
    );
    if (!qMatch?.[1]) continue;
    const partialQuotient = cleanToken(qMatch[1]);
    const subMatch = chunk.match(/(?:مطروحاً?(?:\s*منه)?|الطرح)\s*[:=]?\s*([0-9,]+)/i);
    const remMatch = chunk.match(/(?:فيتبقى|يتبقى|المتبقي|الباقي)\s*[:=]?\s*([0-9,]+)/i);
    steps.push({
      partialQuotient,
      subtracted: subMatch?.[1] ? sanitizeMathToken(subMatch[1]) : undefined,
      remainderAfter: remMatch?.[1] ? sanitizeMathToken(remMatch[1]) : undefined,
    });
  }

  if (steps.length === 0) return null;

  const finalRemMatch = normalized.match(/الباقي\s*النهائي\s*[:=]?\s*([0-9,]+)/i);
  const finalRemainder = finalRemMatch?.[1] ? sanitizeMathToken(finalRemMatch[1]) : undefined;

  return { dividend, divisor, steps, finalRemainder };
}

export function renderPartialQuotientsDivisionToSvg(
  spec: PartialQuotientsDivisionSpec,
  options: PartialQuotientsSvgOptions = {}
): string {
  const numeralMode = options.numeralMode ?? "western";
  const primaryHex = options.primaryHex ?? "#1E293B";
  const fmt = (v: string) => formatNumeralsByModeSSOT(v, numeralMode);

  const leftPad = 10;
  const divisorW = Math.max(32, fmt(spec.divisor).length * 8 + 14);
  const wallX = leftPad + divisorW;
  const dividendColW = 92;
  const rightWallX = wallX + dividendColW;
  const quotientColW = 54;
  const totalW = rightWallX + quotientColW + 10;

  const topY = 20;
  const rowStepH = 38;
  const rowsCount = spec.steps.length;
  const bottomY = topY + 24 + rowsCount * rowStepH + (spec.finalRemainder !== undefined ? 18 : 8);
  const totalH = bottomY + 10;

  const bodyMarkup: string[] = [];
  let cursorY = topY + 18;

  // المقسوم في الأعلى
  bodyMarkup.push(
    `<text x="${wallX + dividendColW / 2}" y="${cursorY}" text-anchor="middle" font-size="12" font-weight="900" fill="#0F172A">${fmt(spec.dividend)}</text>`
  );

  spec.steps.forEach((step, idx) => {
    const qVal = step.partialQuotient;
    const isUnknown = isSymbolicAreaModelUnknown(qVal);
    const qCenterX = rightWallX + quotientColW / 2;
    const qRowY = cursorY + 14;

    if (isUnknown) {
      bodyMarkup.push(
        `<rect x="${rightWallX + 9}" y="${qRowY - 12}" width="${quotientColW - 18}" height="17" rx="3" fill="#FEF08A" stroke="#EAB308" stroke-width="1.5" stroke-dasharray="3 2" />`,
        `<text x="${qCenterX}" y="${qRowY}" text-anchor="middle" font-size="12" font-weight="900" fill="#854D0E">${fmt(qVal)}</text>`
      );
    } else {
      bodyMarkup.push(
        `<text x="${qCenterX}" y="${qRowY}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#1E293B">${fmt(qVal)}</text>`
      );
    }

    if (step.subtracted) {
      bodyMarkup.push(
        `<text x="${wallX + dividendColW / 2}" y="${qRowY}" text-anchor="middle" font-size="11" font-weight="800" fill="#475569">− ${fmt(step.subtracted)}</text>`,
        `<line x1="${wallX + 12}" y1="${qRowY + 5}" x2="${rightWallX - 10}" y2="${qRowY + 5}" stroke="#64748B" stroke-width="1" />`
      );
      if (step.remainderAfter) {
        bodyMarkup.push(
          `<text x="${wallX + dividendColW / 2}" y="${qRowY + 19}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#0F172A">${fmt(step.remainderAfter)}</text>`
        );
      }
      cursorY += rowStepH;
    } else {
      bodyMarkup.push(
        `<text x="${wallX + dividendColW / 2}" y="${qRowY}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#94A3B8">− •••</text>`
      );
      if (idx === spec.steps.length - 1 && spec.finalRemainder !== undefined) {
        bodyMarkup.push(
          `<line x1="${wallX + 12}" y1="${qRowY + 5}" x2="${rightWallX - 10}" y2="${qRowY + 5}" stroke="#64748B" stroke-width="1" />`,
          `<text x="${wallX + dividendColW / 2}" y="${qRowY + 19}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#0F172A">${fmt(spec.finalRemainder)}</text>`
        );
      }
      cursorY += rowStepH - 6;
    }
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" direction="ltr" viewBox="0 0 ${totalW} ${totalH}" width="100%" height="100%" style="direction: ltr; unicode-bidi: isolate; max-height: 130px; display: block; margin: auto;">
      <!-- إطار كرسي القسمة بالتجزئة -->
      <rect x="${leftPad}" y="${topY}" width="${divisorW - 6}" height="24" rx="4" fill="#EEF2FF" stroke="#6366F1" stroke-width="1.2" />
      <text x="${leftPad + (divisorW - 6) / 2}" y="${topY + 16}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#312E81">${fmt(spec.divisor)}</text>
      <line x1="${wallX}" y1="${topY}" x2="${rightWallX}" y2="${topY}" stroke="${primaryHex}" stroke-width="1.8" />
      <line x1="${wallX}" y1="${topY}" x2="${wallX}" y2="${topY + 26}" stroke="${primaryHex}" stroke-width="1.8" />
      <line x1="${rightWallX}" y1="${topY}" x2="${rightWallX}" y2="${bottomY}" stroke="${primaryHex}" stroke-width="1.8" />
      ${bodyMarkup.join("\n")}
    </svg>
  `;
}

export function detectAndBuildPartialQuotientsDivisionSvg(
  text: string,
  options: PartialQuotientsSvgOptions = {}
): string | null {
  const spec = parsePartialQuotientsDivisionFromText(text);
  if (!spec) return null;
  return renderPartialQuotientsDivisionToSvg(spec, options);
}
