"use client";

/**
 * @file trig-special-angles-pedagogical-table.tsx
 * @description ظ…ظƒظˆظ† ط°ط±ظٹ ظ…ط³طھظ‚ظ„ ظ„ط¹ط±ط¶ ط¬ط¯ظˆظ„ ط§ظ„ظ†ط³ط¨ ط§ظ„ظ…ط«ظ„ط«ظٹط© ظ„ظ„ط²ظˆط§ظٹط§ ط§ظ„ط®ط§طµط© (30آ°طŒ 60آ°طŒ 45آ°) ط¨طھط¸ظ„ظٹظ„ ظ‡ط§ط¯ط¦ ظˆطھظ†ط³ظٹظ‚ ظ…ظ†ط¸ظ… ظ…ط±ظٹط­ ظ„ظ„ط¹ظٹظ† ظپظٹ ظƒط¨ط³ظˆظ„ط© ط§ظ„ظ‚ط§ظ†ظˆظ†.
 * @invariant ظ…ظ„ظپ ط°ط±ظٹ ظ…ط³طھظ‚ظ„ ط¨ط§ط³ظ… ظپط±ظٹط¯ ط¹ط§ظ„ظ…ظٹط§ظ‹ ظˆظپظ‚ ط¯ط³طھظˆط± ط§ظ„ظ…ظ†طµط© (AGENTS.md) (< 160 ط³ط·ط±ط§ظ‹).
 */

import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import {
  formatNumeralsByModeSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";
import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_TRIG_SPECIAL_ANGLES_PEDAGOGICAL_TABLE =
  "trig_special_angles_pedagogical_table" as const;

/**
 * ظپط­طµ ط°ظƒظٹ ظ…ط§ ط¥ط°ط§ ظƒط§ظ† ظ†طµ ط§ظ„ظ‚ط§ط¹ط¯ط© ظٹطھط¶ظ…ظ† ط§ظ„ظ†ط³ط¨ ط§ظ„ظ…ط«ظ„ط«ظٹط© ظ„ظ„ط²ظˆط§ظٹط§ ط§ظ„ط®ط§طµط© (30آ°طŒ 60آ°طŒ 45آ°).
 */
export function isSpecialAnglesTrigRule(text?: string): boolean {
  if (!text) return false;
  const hasAngle30 = /30|ظ£ظ /.test(text);
  const hasAngle60 = /60|ظ¦ظ /.test(text);
  const hasTrigFunction = /(?:sin|cos|tan|ط¬ط§|ط¬طھط§|ط¸ط§)/i.test(text);
  return hasAngle30 && hasAngle60 && hasTrigFunction;
}

interface TrigAngleRow {
  readonly angleDeg: number;
  readonly sinMath: string;
  readonly cosMath: string;
  readonly tanMath: string;
  readonly noteAr?: string;
  readonly isShaded?: boolean;
}

const SPECIAL_ANGLES_DATA: readonly TrigAngleRow[] = [
  {
    angleDeg: 30,
    sinMath: "\\frac{1}{2}",
    cosMath: "\\frac{\\sqrt{3}}{2}",
    tanMath: "\\frac{1}{\\sqrt{3}} = \\frac{\\sqrt{3}}{3}",
    noteAr: "ظ…طھظ…ظ…ط© ظ¦ظ آ°",
    isShaded: false,
  },
  {
    angleDeg: 60,
    sinMath: "\\frac{\\sqrt{3}}{2}",
    cosMath: "\\frac{1}{2}",
    tanMath: "\\sqrt{3}",
    noteAr: "ظ…طھظ…ظ…ط© ظ£ظ آ°",
    isShaded: true,
  },
  {
    angleDeg: 45,
    sinMath: "\\frac{1}{\\sqrt{2}} = \\frac{\\sqrt{2}}{2}",
    cosMath: "\\frac{1}{\\sqrt{2}} = \\frac{\\sqrt{2}}{2}",
    tanMath: "1",
    noteAr: "ط¬ط§ = ط¬طھط§",
    isShaded: false,
  },
];

export function TrigSpecialAnglesPedagogicalTable({
  palette,
  numeralMode,
  notationLanguage,
}: {
  readonly palette: PrintThemePaletteTokens;
  readonly numeralMode: NumeralDisplayMode;
  readonly notationLanguage: MathNotationLanguage;
}) {
  const isArabicNotation = notationLanguage === "arabic";

  return (
    <div className="w-full my-1 rounded-lg border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
      <table className="w-full text-center border-collapse text-[0.84em]">
        <thead>
          <tr
            style={{
              backgroundColor: "#F8FAFC",
              borderBottom: "1.5px solid #E2E8F0",
            }}
            className="text-slate-800 font-black"
          >
            <th className="py-1 px-1.5 border-l border-slate-200/80 font-black text-slate-900 w-1/5">
              ط§ظ„ط²ط§ظˆظٹط© ($\theta$)
            </th>
            <th className="py-1 px-1.5 border-l border-slate-200/80 font-black text-slate-900 w-1/4">
              {isArabicNotation ? "ط¬ط§ $\\theta$ (الجيب)" : "$\\sin\\theta$"}
            </th>
            <th className="py-1 px-1.5 border-l border-slate-200/80 font-black text-slate-900 w-1/4">
              {isArabicNotation ? "ط¬طھط§ $\\theta$ (جيب التمام)" : "$\\cos\\theta$"}
            </th>
            <th className="py-1 px-1.5 font-black text-slate-900 w-[30%]">
              {isArabicNotation ? "ط¸ط§ $\\theta$ (الظل)" : "$\\tan\\theta$"}
            </th>
          </tr>
        </thead>
        <tbody>
          {SPECIAL_ANGLES_DATA.map((row) => {
            const formattedAngle = `${formatNumeralsByModeSSOT(row.angleDeg, numeralMode)}°`;
            const rowBg = row.isShaded ? "#F1F5F9" : "#FFFFFF";

            return (
              <tr
                key={row.angleDeg}
                style={{ backgroundColor: rowBg }}
                className="border-b border-slate-200/70 transition-colors"
              >
                {/* عمود الزاوية */}
                <td className="py-1 px-1.5 font-black text-slate-900 border-l border-slate-200/80 whitespace-nowrap">
                  <span
                    style={{
                      borderColor: palette.primaryHex,
                      color: palette.primaryHex,
                    }}
                    className="inline-block px-1.5 py-0.2 rounded border bg-white font-black text-[0.92em] shadow-2xs"
                  >
                    ${formattedAngle}$
                  </span>
                  {row.noteAr && (
                    <span className="block text-[0.74em] font-normal text-slate-500 mt-0.5">
                      {row.noteAr}
                    </span>
                  )}
                </td>

                {/* عمود الجيب (sin) */}
                <td className="py-1 px-1.5 border-l border-slate-200/80 text-slate-950 font-bold leading-normal">
                  <SafeKaTeXBiDiMathRenderer
                    text={`$${row.sinMath}$`}
                    numeralMode={numeralMode}
                    notationLanguage={notationLanguage}
                  />
                </td>

                {/* عمود جيب التمام (cos) */}
                <td className="py-1 px-1.5 border-l border-slate-200/80 text-slate-950 font-bold leading-normal">
                  <SafeKaTeXBiDiMathRenderer
                    text={`$${row.cosMath}$`}
                    numeralMode={numeralMode}
                    notationLanguage={notationLanguage}
                  />
                </td>

                {/* عمود الظل (tan) */}
                <td className="py-1 px-1.5 text-slate-950 font-bold leading-normal">
                  <SafeKaTeXBiDiMathRenderer
                    text={`$${row.tanMath}$`}
                    numeralMode={numeralMode}
                    notationLanguage={notationLanguage}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
