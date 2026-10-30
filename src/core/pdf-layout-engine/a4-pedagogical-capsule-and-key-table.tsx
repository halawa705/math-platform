"use client";

/**
 * @file a4-pedagogical-capsule-and-key-table.tsx
 * @description مكون ذري مستقل لتصيير كبسولة الفكرة والمفهوم الرياضي والقانون المؤطر (`PedagogicalIdeaAndRuleCapsule`) بعرض كامل للورقة (`col-span-full`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import {
  formatNumeralsByModeSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";
import type {
  PrintableMathQuestionItem,
  PrintThemePaletteTokens,
} from "./a4-vector-html-sheet-renderer";
import { resolveFlowBannerKind } from "./flow-banner-kind-resolver";

export const MODULE_ID_A4_PEDAGOGICAL_CAPSULE_AND_KEY_TABLE =
  "a4_pedagogical_capsule_and_key_table" as const;

const ARABIC_ORDINAL_MAP: Record<string, string> = {
  "الأولى": "1", "الاولى": "1", "الأول": "1", "الاول": "1", "الثانية": "2", "الثاني": "2", "الثالثة": "3", "الثالث": "3",
  "الرابعة": "4", "الرابع": "4", "الخامسة": "5", "الخامس": "5", "السادسة": "6", "السادس": "6", "السابعة": "7", "السابع": "7",
  "الثامنة": "8", "الثامن": "8", "التاسعة": "9", "التاسع": "9", "العاشرة": "10", "العاشر": "10",
  "الحادية عشرة": "11", "الحادية عشر": "11", "الثانية عشرة": "12", "الثانية عشر": "12",
  "الثالثة عشرة": "13", "الثالثة عشر": "13", "الرابعة عشرة": "14", "الرابعة عشر": "14", "الخامسة عشرة": "15", "الخامسة عشر": "15",
};

export function PedagogicalIdeaAndRuleCapsule({
  item,
  palette,
  numeralMode,
  notationLanguage,
  ideaIndex,
}: {
  readonly item: PrintableMathQuestionItem;
  readonly palette: PrintThemePaletteTokens;
  readonly numeralMode: NumeralDisplayMode;
  readonly notationLanguage: MathNotationLanguage;
  readonly ideaIndex?: number;
}) {
  if (!item.ideaBannerTitleAr && !item.conceptExplanationAr && !item.framedRuleAr) {
    return null;
  }

  const rawBanner = item.ideaBannerTitleAr || "";
  let ideaNumberText = ideaIndex !== undefined ? String(ideaIndex) : "";
  if (!ideaNumberText) {
    const numMatch = rawBanner.match(/الفكرة\s*\(?(\d+|[٠-٩]+)\)?/);
    if (numMatch?.[1]) {
      ideaNumberText = numMatch[1];
    } else {
      for (const [word, val] of Object.entries(ARABIC_ORDINAL_MAP)) {
        if (rawBanner.includes(word)) {
          ideaNumberText = val;
          break;
        }
      }
    }
  }
  if (!ideaNumberText) ideaNumberText = "1";

  const bannerKind = resolveFlowBannerKind(rawBanner);
  const isHomeworkSection = bannerKind === "homework";
  const isPlainSection = bannerKind === "section";
  const displayTitle = rawBanner;

  return (
    <div
      style={{ breakInside: "avoid" }}
      className="pedagogical-idea-capsule w-full min-w-0 my-1 space-y-1.5"
    >
      {item.ideaBannerTitleAr && (
        <div
          style={{
            breakInside: "avoid",
            background: isHomeworkSection
              ? "linear-gradient(90deg, #FDF2F8 0%, #9D174D 100%)"
              : palette.headerGradientCss,
            borderColor: isHomeworkSection ? "#BE185D" : palette.primaryHex,
          }}
          className="rounded-xl border-2 p-1.5 text-white flex items-center justify-between gap-2 shadow-xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            {isPlainSection ? null : !isHomeworkSection ? (
              <span
                style={{ color: palette.primaryHex }}
                className="bg-white px-2.5 py-0.5 rounded-lg text-[0.88em] font-black shrink-0 shadow-2xs border border-slate-200"
              >
                الفكرة ({formatNumeralsByModeSSOT(ideaNumberText, numeralMode)})
              </span>
            ) : (
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[0.88em] font-black shrink-0">
                📚 الواجب المنزلي
              </span>
            )}
            <span className="font-black text-[0.95em] break-words">
              {formatNumeralsByModeSSOT(displayTitle, numeralMode)}
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-lg bg-white/15 border border-white/25 text-white text-[0.76em] font-black shrink-0">
            {item.branchBadgeAr || "المستوى: متوسط"}
          </span>
        </div>
      )}

      {(item.conceptExplanationAr || item.framedRuleAr) && (
        <div
          className={`grid ${
            item.conceptExplanationAr && item.framedRuleAr ? "grid-cols-2" : "grid-cols-1"
          } gap-1.5 items-stretch w-full min-w-0`}
        >
          {item.conceptExplanationAr && (
            <div
              style={{ backgroundColor: "#FFFDF5", borderColor: "#F59E0B" }}
              className="p-1.5 px-2 rounded-xl border-2 text-[0.85em] text-slate-900 leading-snug min-w-0 shadow-2xs"
            >
              <div className="text-[#92400E] font-black mb-0.5 pb-0.5 border-b border-amber-200/80 flex items-center gap-1 text-[0.88em]">
                <span>💡</span>
                <span>المفهوم الرياضي والشرح:</span>
              </div>
              <div className="font-bold text-slate-800 break-words">
                <SafeKaTeXBiDiMathRenderer
                  text={item.conceptExplanationAr}
                  numeralMode={numeralMode}
                  notationLanguage={notationLanguage}
                />
              </div>
            </div>
          )}

          {item.framedRuleAr && (
            <div
              style={{ backgroundColor: "#F5F7FF", borderColor: "#818CF8" }}
              className="p-1.5 px-2 rounded-xl border-2 text-[0.78em] sm:text-[0.81em] font-bold text-slate-900 leading-snug min-w-0 shadow-2xs overflow-hidden"
            >
              <div
                style={{ color: palette.primaryHex }}
                className="font-black mb-0.5 pb-0.5 border-b border-indigo-200/80 flex items-center gap-1 text-[0.88em]"
              >
                <span>📐</span>
                <span>القاعدة والقانون المعتمد:</span>
              </div>
              <div className="font-extrabold text-slate-900 max-w-full overflow-hidden break-words">
                <SafeKaTeXBiDiMathRenderer
                  text={item.framedRuleAr}
                  numeralMode={numeralMode}
                  notationLanguage={notationLanguage}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { StructuredStepByStepSolutionBox } from "./structured-step-by-step-solution-box";
export { OfficialMcqAnswerKeySummaryTable } from "./official-mcq-answer-key-summary-table";
