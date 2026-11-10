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
  boldProseText = false,
}: {
  readonly item: PrintableMathQuestionItem;
  readonly palette: PrintThemePaletteTokens;
  readonly numeralMode: NumeralDisplayMode;
  readonly notationLanguage: MathNotationLanguage;
  readonly ideaIndex?: number;
  readonly boldProseText?: boolean;
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
  const isWorksheetSection = bannerKind === "worksheet";
  const displayTitle = rawBanner;

  const hasBothConceptAndRule =
    Boolean(item.conceptExplanationAr && item.framedRuleAr) &&
    !(isWorksheetSection && item.framedRuleAr?.includes("---"));

  const bannerAccentHex = isHomeworkSection
    ? "#BE185D"
    : isWorksheetSection
      ? "#4338CA"
      : palette.primaryHex;

  return (
    <div
      style={{ breakInside: "avoid" }}
      className="pedagogical-idea-capsule w-full min-w-0 my-0.5 space-y-1"
    >
      {item.ideaBannerTitleAr && (
        <div
          style={{
            breakInside: "avoid",
            backgroundColor: "#FFFFFF",
            borderColor: bannerAccentHex,
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
          }}
          className="rounded-lg border-2 border-r-8 px-2 py-1 bg-white text-slate-900 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {isWorksheetSection ? (
              <span
                style={{ backgroundColor: "#4338CA" }}
                className="px-2 py-0.5 rounded-md text-white text-[0.8em] font-black shrink-0 shadow-2xs"
              >
                ⚡ ورقة عمل وتطبيق شامل
              </span>
            ) : isPlainSection ? null : !isHomeworkSection ? (
              <span
                style={{ backgroundColor: palette.primaryHex }}
                className="text-white px-2 py-0.5 rounded-md text-[0.82em] font-black shrink-0 shadow-2xs"
              >
                الفكرة ({formatNumeralsByModeSSOT(ideaNumberText, numeralMode)})
              </span>
            ) : (
              <span
                style={{ backgroundColor: "#BE185D" }}
                className="text-white px-2 py-0.5 rounded-md text-[0.82em] font-black shrink-0 shadow-2xs"
              >
                📚 الواجب المنزلي
              </span>
            )}
            <span
              style={{ color: bannerAccentHex }}
              className="font-black text-[0.9em] break-words leading-snug"
            >
              {formatNumeralsByModeSSOT(
                isWorksheetSection
                  ? displayTitle.replace(/^ورقة\s*عمل\s*[:\-–]?\s*/i, "")
                  : displayTitle,
                numeralMode
              )}
            </span>
          </div>
          <span
            style={{
              backgroundColor: "#FFFFFF",
              color: bannerAccentHex,
              borderColor: bannerAccentHex,
            }}
            className="px-2 py-0.2 rounded-md border text-[0.74em] font-black shrink-0"
          >
            {item.branchBadgeAr || "المستوى: متوسط"}
          </span>
        </div>
      )}

      {(item.conceptExplanationAr || item.framedRuleAr) && (
        <div
          className={
            hasBothConceptAndRule
              ? "grid grid-cols-2 gap-1.5 items-stretch w-full min-w-0"
              : "flex flex-col space-y-1 w-full min-w-0"
          }
        >
          {item.conceptExplanationAr && (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: isWorksheetSection ? "#10B981" : "#F59E0B",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
              }}
              className="px-2 py-1 rounded-lg border border-r-4 bg-white text-[0.82em] text-slate-900 leading-[1.85] min-w-0"
            >
              <span
                style={{
                  backgroundColor: "#FFFFFF",
                  color: isWorksheetSection ? "#047857" : "#B45309",
                  borderColor: isWorksheetSection ? "#6EE7B7" : "#FCD34D",
                }}
                className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded border font-black text-[0.82em] ml-1.5 align-middle"
              >
                <span>💡</span>
                <span>{isWorksheetSection ? "الفكرة العامة:" : "المفهوم والشرح:"}</span>
              </span>
              <span
                className={`text-slate-900 break-words leading-[1.85] ${
                  boldProseText ? "font-extrabold" : "font-normal"
                }`}
              >
                <SafeKaTeXBiDiMathRenderer
                  text={item.conceptExplanationAr}
                  numeralMode={numeralMode}
                  notationLanguage={notationLanguage}
                />
              </span>
            </div>
          )}

          {item.framedRuleAr && (
            <>
              {isWorksheetSection && item.framedRuleAr.includes("---") ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 w-full min-w-0">
                  {item.framedRuleAr
                    .split(/\s*---\s*/)
                    .map((c) => c.trim())
                    .filter(Boolean)
                    .map((cardContent, cIdx) => (
                      <div
                        key={cIdx}
                        style={{
                          backgroundColor: "#FFFFFF",
                          borderColor: "#6366F1",
                          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                        }}
                        className="p-1.5 rounded-lg border border-r-4 bg-white text-[0.80em] font-medium text-slate-900 min-w-0 flex flex-col justify-between leading-[1.85]"
                      >
                        <SafeKaTeXBiDiMathRenderer
                          text={cardContent}
                          numeralMode={numeralMode}
                          notationLanguage={notationLanguage}
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: isWorksheetSection ? "#2563EB" : "#6366F1",
                    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                  }}
                  className="px-2 py-1 rounded-lg border border-r-4 bg-white text-[0.82em] font-bold text-slate-900 leading-[1.85] min-w-0 overflow-hidden"
                >
                  <span
                    style={{
                      backgroundColor: "#FFFFFF",
                      color: palette.primaryHex,
                      borderColor: "#A5B4FC",
                    }}
                    className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded border font-black text-[0.82em] ml-1.5 align-middle"
                  >
                    <span>📐</span>
                    <span>{isWorksheetSection ? "مفاتيح الحل:" : "القاعدة والقانون:"}</span>
                  </span>
                  <span
                    className={`text-slate-900 max-w-full overflow-hidden break-words leading-[1.85] ${
                      boldProseText ? "font-extrabold" : "font-normal"
                    }`}
                  >
                    <SafeKaTeXBiDiMathRenderer
                      text={item.framedRuleAr}
                      numeralMode={numeralMode}
                      notationLanguage={notationLanguage}
                    />
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
