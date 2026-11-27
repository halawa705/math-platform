"use client";

/**
 * @file modern-editorial-idea-capsule.tsx
 * @description كبسولة الفكرة والمفهوم والقانون المسطحة المتوافقة مع الهوية البصرية للقالب المدرسي الحديث (مذكرة الدحيح / المعاصر):
 * شريط جانبي عريض بدون صناديق كارتونية ثقيلة، بأرضية شبه شفافة تسمح بمرور العلامة المائية بوضوح وتدعم جدول الزوايا الخاصة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 140 سطراً).
 */

import React from "react";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import {
  formatNumeralsByModeSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";
import type { PrintableMathQuestionItem, PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";
import { resolveFlowBannerKind } from "./flow-banner-kind-resolver";
import {
  TrigSpecialAnglesPedagogicalTable,
  isSpecialAnglesTrigRule,
} from "./trig-special-angles-pedagogical-table";

export const MODULE_ID_MODERN_EDITORIAL_IDEA_CAPSULE = "modern_editorial_idea_capsule" as const;

export function ModernEditorialIdeaCapsule({
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
  const bannerKind = resolveFlowBannerKind(rawBanner);
  const isHomework = bannerKind === "homework";
  const isWorksheet = bannerKind === "worksheet";
  const isPlain = bannerKind === "section";
  const isPhotocopy = palette.primaryHex === "#000000";

  const mainHex = isPhotocopy ? "#0F172A" : isHomework ? palette.accentHex : palette.primaryHex;
  const subBarHex = isPhotocopy ? "#0F172A" : isWorksheet ? palette.primaryHex : palette.secondaryHex;
  const ideaNum = formatNumeralsByModeSSOT(String(ideaIndex ?? 1), numeralMode);

  const hasBoth = Boolean(item.conceptExplanationAr && item.framedRuleAr) && !(isWorksheet && item.framedRuleAr?.includes("---"));

  return (
    <div style={{ breakInside: "avoid" }} className="w-full min-w-0 my-0.5 space-y-1">
      {item.ideaBannerTitleAr && (
        <div
          style={{
            backgroundColor: isPhotocopy ? "#F8FAFC" : `${palette.softSurfaceHex}B8`,
            borderRight: `9px solid ${subBarHex}`,
            borderBottom: `1px solid ${palette.borderHex}88`,
            padding: "2.5px 8px",
          }}
          className="w-full flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            {!isPlain && (
              <span
                style={{
                  border: `1.3px solid ${mainHex}`,
                  color: mainHex,
                  backgroundColor: "rgba(255,255,255,0.92)",
                  borderRadius: "9999px",
                  padding: "0px 8px",
                }}
                className="text-[0.8em] font-black shrink-0"
              >
                {isWorksheet ? "ورقة عمل" : isHomework ? "الواجب المنزلي" : `الفكرة (${ideaNum})`}
              </span>
            )}
            <span style={{ color: mainHex }} className="text-[0.94em] font-black break-words leading-snug">
              <SafeKaTeXBiDiMathRenderer
                text={isWorksheet ? rawBanner.replace(/^ورقة\s*عمل\s*[:\-–]?\s*/i, "") : rawBanner}
                numeralMode={numeralMode}
                notationLanguage={notationLanguage}
              />
            </span>
          </div>
          {item.branchBadgeAr && (
            <span style={{ color: palette.accentHex }} className="text-[0.74em] font-black shrink-0">
              {item.branchBadgeAr}
            </span>
          )}
        </div>
      )}

      {(item.conceptExplanationAr || item.framedRuleAr) && (
        <div className={hasBoth ? "grid grid-cols-2 gap-1.5 items-stretch w-full" : "flex flex-col gap-1 w-full"}>
          {item.conceptExplanationAr && (
            <div
              style={{
                backgroundColor: isPhotocopy ? "transparent" : `${palette.softSurfaceHex}66`,
                borderRight: `3.5px solid ${palette.secondaryHex}`,
                borderBottom: `1px solid ${palette.borderHex}66`,
              }}
              className="px-2 py-1 text-[0.83em] text-slate-950 leading-[1.48] min-w-0"
            >
              <span style={{ color: palette.secondaryHex }} className="font-black ml-1.5">
                {isWorksheet ? "الفكرة العامة:" : "المفهوم والشرح:"}
              </span>
              <span className={boldProseText ? "font-extrabold" : "font-bold"}>
                <SafeKaTeXBiDiMathRenderer text={item.conceptExplanationAr} numeralMode={numeralMode} notationLanguage={notationLanguage} />
              </span>
            </div>
          )}

          {item.framedRuleAr && (
            <div
              style={{
                backgroundColor: isPhotocopy ? "transparent" : `${palette.badgeBgHex}55`,
                borderRight: `3.5px solid ${mainHex}`,
                borderBottom: `1px solid ${palette.borderHex}66`,
              }}
              className="px-2 py-1 text-[0.83em] text-slate-950 leading-[1.48] min-w-0 overflow-hidden"
            >
              <span style={{ color: isPhotocopy ? "#0F172A" : palette.accentHex }} className="font-black ml-1.5">
                {isWorksheet ? "مفاتيح الحل:" : "القاعدة والقانون:"}
              </span>
              {isSpecialAnglesTrigRule(item.framedRuleAr) ? (
                <TrigSpecialAnglesPedagogicalTable palette={palette} numeralMode={numeralMode} notationLanguage={notationLanguage} />
              ) : (
                <span className={boldProseText ? "font-extrabold" : "font-bold"}>
                  <SafeKaTeXBiDiMathRenderer text={item.framedRuleAr} numeralMode={numeralMode} notationLanguage={notationLanguage} />
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
