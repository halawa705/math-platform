/**
 * @file angle-linear-expression-parser.ts
 * @description محلل التعبيرات الخطية لقياسات الزوايا (الأرقام المباشرة والتعبيرات الجبرية مثل 2س° و (3س - 10)°).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطراً).
 */

import type { LinearAngleExpr } from "./angle-fan-fact-types";

export const MODULE_ID_ANGLE_LINEAR_EXPRESSION_PARSER =
  "angle_linear_expression_parser" as const;

const EASTERN_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function normalizeAsciiDigits(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(EASTERN_DIGITS.indexOf(d)))
    .replace(/٫/g, ".")
    .replace(/−/g, "-");
}

/**
 * ينظف نص قياس الزاوية من العبارات الوصفية اللاحقة مثل «بالتقابل بالرأس» أو «درجة».
 */
export function cleanAngleValueText(raw: string): string {
  const ascii = normalizeAsciiDigits(raw)
    .replace(/\s*(?:بالتقابل\s*بالرأس|بالتناظر|بالتبادل|درجات|درجة|قائمة)\s*$/g, "")
    .trim();
  const matchExpr = ascii.match(/^(\([^)]+\)\s*°?|[0-9.]+\s*[أ-يa-zA-Z]*\s*°?|[أ-يa-zA-Z]\s*°?)/);
  const core = (matchExpr ? matchExpr[1] : ascii).trim();
  return core.endsWith("°") ? core : `${core}°`;
}

/**
 * يحلل تعبير قياس زاوية إلى معامل خطي وثابت (a * س + b).
 */
export function parseLinearAngleExpression(rawText: string): LinearAngleExpr | null {
  const cleanedLabel = cleanAngleValueText(rawText);
  const core = normalizeAsciiDigits(cleanedLabel)
    .replace(/°/g, "")
    .replace(/^\(|\)$/g, "")
    .trim();

  if (!core) return null;

  // 1. رقم صريح فقط مثل "50" أو "57.5"
  if (/^[+-]?\d+(?:\.\d+)?$/.test(core)) {
    const val = Number(core);
    if (!Number.isFinite(val)) return null;
    return {
      constant: val,
      coeff: 0,
      varName: null,
      rawLabel: `${val}°`,
      isPureNumeric: true,
    };
  }

  // 2. حد جبري مع ثابت اختياري: مثل "2س" أو "3س - 10" أو "س + 2" أو "2X + 5"
  const linearMatch = core.match(
    /^([+-]?\d+(?:\.\d+)?)?\s*([سصعأ-يa-zA-Z])\s*(?:([+-])\s*(\d+(?:\.\d+)?))?$/
  );
  if (linearMatch) {
    const rawCoeff = linearMatch[1];
    const varName = linearMatch[2];
    const sign = linearMatch[3];
    const rawConst = linearMatch[4];

    const coeff =
      rawCoeff === undefined || rawCoeff === "" || rawCoeff === "+"
        ? 1
        : rawCoeff === "-"
        ? -1
        : Number(rawCoeff);
    const constant =
      rawConst !== undefined ? (sign === "-" ? -Number(rawConst) : Number(rawConst)) : 0;

    return {
      constant,
      coeff,
      varName,
      rawLabel: cleanedLabel,
      isPureNumeric: false,
    };
  }

  return null;
}

/** يحسب القيمة الرقمية للتعبير الخطي عند تعويض قيمة المجهول */
export function evaluateLinearAngleExpr(expr: LinearAngleExpr, varValue: number): number {
  return expr.constant + expr.coeff * varValue;
}
