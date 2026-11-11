"use client";

/**
 * @file trig-special-angles-pedagogical-table.tsx
 * @description مكون ذري مستقل لعرض جدول النسب المثلثية للزوايا الخاصة (30°، 60°، 45°) بتظليل هادئ وتنسيق منظم ومريح للعين في كبسولة القانون.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 165 سطراً).
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
 * فحص ذكي ما إذا كان نص القاعدة يتضمن النسب المثلثية للزوايا الخاصة (30°، 60°، 45°).
 */
export function isSpecialAnglesTrigRule(text?: string): boolean {
  if (!text) return false;
  const hasAngle30 = /30|٣٠/.test(text);
  const hasAngle60 = /60|٦٠/.test(text);
  const hasTrigFunction = /(?:sin|cos|tan|جا|جتا|ظا)/i.test(text);
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
    noteAr: "متممة 60°",
    isShaded: false,
  },
  {
    angleDeg: 60,
    sinMath: "\\frac{\\sqrt{3}}{2}",
    cosMath: "\\frac{1}{2}",
    tanMath: "\\sqrt{3}",
    noteAr: "متممة 30°",
    isShaded: true,
  },
  {
    angleDeg: 45,
    sinMath: "\\frac{1}{\\sqrt{2}} = \\frac{\\sqrt{2}}{2}",
    cosMath: "\\frac{1}{\\sqrt{2}} = \\frac{\\sqrt{2}}{2}",
    tanMath: "1",
    noteAr: "جا = جتا",
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
    <div className="w-full my-0.5 rounded-md border-2 border-slate-300 bg-white overflow-hidden shadow-2xs">
      <table className="w-full text-center border-collapse text-[0.82em]">
        <thead>
          <tr
            style={{
              backgroundColor: "#F8FAFC",
              borderBottom: "2px solid #CBD5E1",
            }}
            className="text-slate-800 font-black"
          >
            <th className="py-1 px-1 border-l-2 border-slate-300 font-black text-slate-900 w-[22%]">
              <SafeKaTeXBiDiMathRenderer
                text="الزاوية ($\theta$)"
                numeralMode={numeralMode}
                notationLanguage={notationLanguage}
              />
            </th>
            <th className="py-1 px-1 border-l-2 border-slate-300 font-black text-slate-900 w-[26%]">
              <SafeKaTeXBiDiMathRenderer
                text={isArabicNotation ? "جا $\\theta$ (الجيب)" : "$\\sin\\theta$"}
                numeralMode={numeralMode}
                notationLanguage={notationLanguage}
              />
            </th>
            <th className="py-1 px-1 border-l-2 border-slate-300 font-black text-slate-900 w-[26%]">
              <SafeKaTeXBiDiMathRenderer
                text={isArabicNotation ? "جتا $\\theta$ (جيب التمام)" : "$\\cos\\theta$"}
                numeralMode={numeralMode}
                notationLanguage={notationLanguage}
              />
            </th>
            <th className="py-1 px-1 font-black text-slate-900 w-[26%]">
              <SafeKaTeXBiDiMathRenderer
                text={isArabicNotation ? "ظا $\\theta$ (الظل)" : "$\\tan\\theta$"}
                numeralMode={numeralMode}
                notationLanguage={notationLanguage}
              />
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
                className="border-b-2 border-slate-200 transition-colors"
              >
                {/* عمود الزاوية */}
                <td className="py-0.5 px-1 font-black text-slate-900 border-l-2 border-slate-200 whitespace-nowrap">
                  <span
                    style={{
                      borderColor: palette.primaryHex,
                      color: palette.primaryHex,
                    }}
                    className="inline-block px-1.5 py-0.2 rounded border bg-white font-black text-[0.9em] shadow-2xs"
                  >
                    {formattedAngle}
                  </span>
                  {row.noteAr && (
                    <span className="block text-[0.72em] font-normal text-slate-500 mt-0.5">
                      {row.noteAr}
                    </span>
                  )}
                </td>

                {/* عمود الجيب (sin) */}
                <td className="py-0.5 px-1 border-l-2 border-slate-200 text-slate-950 font-bold leading-normal">
                  <SafeKaTeXBiDiMathRenderer
                    text={`$${row.sinMath}$`}
                    numeralMode={numeralMode}
                    notationLanguage={notationLanguage}
                  />
                </td>

                {/* عمود جيب التمام (cos) */}
                <td className="py-0.5 px-1 border-l-2 border-slate-200 text-slate-950 font-bold leading-normal">
                  <SafeKaTeXBiDiMathRenderer
                    text={`$${row.cosMath}$`}
                    numeralMode={numeralMode}
                    notationLanguage={notationLanguage}
                  />
                </td>

                {/* عمود الظل (tan) */}
                <td className="py-0.5 px-1 text-slate-950 font-bold leading-normal">
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
