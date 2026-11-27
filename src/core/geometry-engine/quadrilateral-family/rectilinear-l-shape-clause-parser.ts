/**
 * @file rectilinear-l-shape-clause-parser.ts
 * @description محلل دلالي لأوصاف الشكل المركب على هيئة حرف L بالاتجاهات الصريحة
 * (رأسي أيسر، أفقي سفلي، رأسي أيمن، أفقي علوي، داخلي) مع تحديد الاتجاه البصري الدقيق ومنع تسريب المجاهيل.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 175 سطراً).
 */

import { toWesternNumeralsSSOT, type ArabicMathUnit } from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_RECTILINEAR_L_SHAPE_CLAUSE_PARSER =
  "rectilinear_l_shape_clause_parser" as const;

export type LShapeOrientation =
  | "upright_top_right_notch"
  | "topbar_bottom_right_notch"
  | "topbar_bottom_left_notch";

export interface ParsedRectilinearLShapeSpec {
  readonly orientation: LShapeOrientation;
  readonly coords: readonly (readonly [number, number])[];
  readonly labels: readonly (string | undefined)[];
  readonly titleSummary: string;
}

type EdgeDimValue = number | string | undefined;

function extractValueFromClause(clause: string): number | string | undefined {
  const numMatch = clause.match(/(?<![0-9.])\d+(?:\.\d+)?(?![0-9.])/);
  if (numMatch?.[0]) {
    const val = Number(numMatch[0]);
    if (!Number.isNaN(val) && val > 0 && val !== 90) return val;
  }
  const varMatch = clause.match(
    /(?:=|المجهول|طوله|طول[هـا]?\s*=?\s*)(?<![A-Za-z\u0621-\u064A])([a-zA-Z]|؟|\?)(?![A-Za-z\u0621-\u064A])/
  );
  if (varMatch?.[1]) return varMatch[1] === "?" ? "؟" : varMatch[1];
  const bareUnknown = clause.match(/(?<![A-Za-z0-9])([؟?])(?![A-Za-z0-9])/);
  if (bareUnknown?.[1] && /مجهول|ضلع|بعد|طول/i.test(clause)) return "؟";
  return undefined;
}

function numericOrDefault(v: EdgeDimValue, fallback: number): number {
  return typeof v === "number" && v > 0 ? v : fallback;
}

function clampRatio(val: number, minVal: number, maxVal: number): number {
  return Math.max(minVal, Math.min(maxVal, val));
}

export function parseRectilinearLShapeDescription(
  description: string,
  unit: ArabicMathUnit
): ParsedRectilinearLShapeSpec | null {
  const normalized = toWesternNumeralsSSOT(description)
    .replace(/\\+\(|\\+\)|\$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (
    !/(?:رأسي|أفقي|الأيسر|الأيمن|السفلي|العلوي|داخلي)/i.test(normalized)
  ) {
    return null;
  }

  const clauses = normalized
    .split(/[،,؛;.]|\s+و(?=(?:الضلع|الجزء|البعد|الطول|العرض|القاعدة|الارتفاع|المطلوب))/i)
    .map((c) => c.trim())
    .filter(Boolean);

  let leftVertical: EdgeDimValue;
  let rightVertical: EdgeDimValue;
  let bottomHorizontal: EdgeDimValue;
  let topHorizontal: EdgeDimValue;
  let innerHorizontal: EdgeDimValue;
  let innerVertical: EdgeDimValue;

  for (const clause of clauses) {
    if (/^\s*المطلوب\s*[:：]/i.test(clause) && !/[؟?]/.test(clause)) continue;
    const val = extractValueFromClause(clause);
    if (val === undefined) continue;

    if (/(?:رأسي|(?:ال)?أيسر|يسار)/i.test(clause) && /(?:ال)?أيسر|يسار/i.test(clause) && !/(?:ال)?داخلي/i.test(clause)) {
      leftVertical ??= val;
    } else if (/(?:رأسي|(?:ال)?أيمن|يمين)/i.test(clause) && /(?:ال)?أيمن|يمين/i.test(clause) && !/(?:ال)?داخلي/i.test(clause)) {
      rightVertical ??= val;
    } else if (/أفقي.*(?:ال)?سفلي|(?:ال)?سفلي|قاعدة\s*سفلية|أسفل/i.test(clause)) {
      bottomHorizontal ??= val;
    } else if (/(?:أفقي\s*(?:ال)?(?:أوسط|داخلي)|(?:ال)?(?:داخلي|أوسط)\s*(?:ال)?أفقي)/i.test(clause)) {
      innerHorizontal ??= val;
    } else if (/(?:رأسي\s*(?:ال)?(?:داخلي|أوسط)|(?:ال)?(?:داخلي|أوسط)\s*(?:ال)?رأسي)/i.test(clause)) {
      innerVertical ??= val;
    } else if (/أفقي\s*(?:ال)?علوي|(?:ال)?علوي/i.test(clause)) {
      topHorizontal ??= val;
    }
  }

  const assignedCount = [
    leftVertical,
    rightVertical,
    bottomHorizontal,
    topHorizontal,
    innerHorizontal,
    innerVertical,
  ].filter((v) => v !== undefined).length;

  if (assignedCount < 2) return null;

  const numTop = typeof topHorizontal === "number" ? topHorizontal : undefined;
  const numBot = typeof bottomHorizontal === "number" ? bottomHorizontal : undefined;
  const numLeft = typeof leftVertical === "number" ? leftVertical : undefined;
  const numRight = typeof rightVertical === "number" ? rightVertical : undefined;

  let orientation: LShapeOrientation = "upright_top_right_notch";
  if (numTop !== undefined && ((numBot !== undefined && numTop > numBot) || (numBot === undefined && innerHorizontal !== undefined && numTop > numericOrDefault(innerHorizontal, 0)))) {
    orientation =
      numRight !== undefined && numLeft !== undefined && numRight > numLeft
        ? "topbar_bottom_left_notch"
        : "topbar_bottom_right_notch";
  }

  const fmt = (v: EdgeDimValue): string | undefined => (v !== undefined ? `${v}` : undefined);

  if (orientation === "topbar_bottom_right_notch") {
    const wTot = numTop ?? 10;
    const hTot = numLeft ?? 5;
    const wLegVal = numBot ?? (typeof innerHorizontal === "number" ? Math.max(1, wTot - innerHorizontal) : wTot * 0.42);
    const hBarVal = numRight ?? (typeof innerVertical === "number" ? Math.max(1, hTot - innerVertical) : hTot * 0.45);
    const wRatio = clampRatio(wLegVal / wTot, 0.25, 0.65);
    const hRatio = clampRatio(hBarVal / hTot, 0.25, 0.65);
    const xStep = Number((1.5 + 7.0 * wRatio).toFixed(2));
    const yNotch = Number((8.5 - 7.0 * hRatio).toFixed(2));
    return {
      orientation,
      coords: [[1.5, 1.5], [xStep, 1.5], [xStep, yNotch], [8.5, yNotch], [8.5, 8.5], [1.5, 8.5]],
      labels: [fmt(bottomHorizontal), fmt(innerVertical), fmt(innerHorizontal), fmt(rightVertical), fmt(topHorizontal), fmt(leftVertical)],
      titleSummary: `شكل مركب حرف L (${wTot} × ${hTot} ${unit})`,
    };
  }

  if (orientation === "topbar_bottom_left_notch") {
    const wTot = numTop ?? 10;
    const hTot = numRight ?? 5;
    const wLegVal = numBot ?? wTot * 0.42;
    const hBarVal = numLeft ?? hTot * 0.45;
    const wRatio = clampRatio(wLegVal / wTot, 0.25, 0.65);
    const hRatio = clampRatio(hBarVal / hTot, 0.25, 0.65);
    const xStep = Number((8.5 - 7.0 * wRatio).toFixed(2));
    const yNotch = Number((8.5 - 7.0 * hRatio).toFixed(2));
    return {
      orientation,
      coords: [[xStep, 1.5], [8.5, 1.5], [8.5, 8.5], [1.5, 8.5], [1.5, yNotch], [xStep, yNotch]],
      labels: [fmt(bottomHorizontal), fmt(rightVertical), fmt(topHorizontal), fmt(leftVertical), fmt(innerHorizontal), fmt(innerVertical)],
      titleSummary: `شكل مركب حرف L (${wTot} × ${hTot} ${unit})`,
    };
  }

  const wTot = numericOrDefault(bottomHorizontal, 8);
  const hTot = numericOrDefault(leftVertical, 8);
  const wTopVal = numericOrDefault(topHorizontal, Math.max(1, wTot * 0.42));
  const hRightVal = numericOrDefault(rightVertical, Math.max(1, hTot * 0.38));
  const wRatio = clampRatio(wTopVal / wTot, 0.25, 0.68);
  const hRatio = clampRatio(hRightVal / hTot, 0.22, 0.65);
  const xStep = Number((1.5 + 7.0 * wRatio).toFixed(2));
  const yStep = Number((1.5 + 7.0 * hRatio).toFixed(2));

  return {
    orientation,
    coords: [[1.5, 1.5], [8.5, 1.5], [8.5, yStep], [xStep, yStep], [xStep, 8.5], [1.5, 8.5]],
    labels: [fmt(bottomHorizontal), fmt(rightVertical), fmt(innerHorizontal), fmt(innerVertical), fmt(topHorizontal), fmt(leftVertical)],
    titleSummary: `شكل مركب حرف L (${wTot} × ${hTot} ${unit})`,
  };
}
