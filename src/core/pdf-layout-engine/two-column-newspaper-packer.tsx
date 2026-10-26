"use client";

/**
 * @file two-column-newspaper-packer.tsx
 * @description المحرك السيادي لصفحات A4 المنفصلة والمقاسة حياً (Sovereign Measured Discrete A4 Pages Engine):
 * - يقيس الارتفاع الفعلي بالبيكسل لكل كبسولة فكرة ولكل صف ثنائي من الأمثلة/التدريبات بعد تحميل الخطوط ومعادلات KaTeX.
 * - يوزع المحتوى حتمياً على أوراق A4 مستقلة (`794px × 1123px` = `210mm × 297mm`) مرقمة (`صفحة X من Y`).
 * - يمنع تماماً انفصال كبسولة الفكرة عن أمثلتها، ويمنع انقسام خطوات المثال أفقياً، ويقضي على الفراغات البيضاء العملاقة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 198 سطراً).
 */

import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  PRINT_FONT_FAMILIES_SSOT,
  type PDFPrintSettingsStateSSOT,
} from "../ssot/pdf-print-settings-ssot";
import {
  DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
  IDENTITY_UPDATED_EVENT_NAME,
  loadTeacherIdentitySSOT,
} from "../ssot/teacher-identity-ssot";
import { formatNumeralsByModeSSOT } from "../ssot/numeral-and-unit-ssot";
import {
  resolvePrintThemePalette,
  type PrintableMathQuestionItem,
} from "./a4-vector-html-sheet-renderer";
import {
  OfficialMcqAnswerKeySummaryTable,
  PedagogicalIdeaAndRuleCapsule,
} from "./a4-pedagogical-capsule-and-key-table";
import SideBySideDiagramDocker from "./side-by-side-diagram-docker";
import {
  buildSovereignA4RowBlocks,
  packMeasuredBlocksIntoDiscreteA4Pages,
  type SovereignA4RowBlock,
} from "./sovereign-a4-page-blocks-builder";
import {
  SovereignDocumentAccreditationBox,
  SovereignFirstPageHeader,
  SovereignPageNumberFooterBar,
  SovereignRunningPageHeader,
} from "./sovereign-a4-page-chrome-elements";

export const MODULE_ID_TWO_COLUMN_NEWSPAPER_PACKER =
  "two_column_newspaper_packer" as const;

export interface TwoColumnNewspaperPackerProps {
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly questions: readonly PrintableMathQuestionItem[];
  readonly subtitleAr?: string;
  readonly sheetContainerRef: React.RefObject<HTMLDivElement | null>;
  readonly children?: React.ReactNode;
}

export default function TwoColumnNewspaperPacker({
  settings,
  questions,
  subtitleAr = "",
  sheetContainerRef,
  children,
}: TwoColumnNewspaperPackerProps) {
  const [mobileZoomScale, setMobileZoomScale] = useState<number>(1);
  const [identity, setIdentity] = useState(DEFAULT_OWNER_TEACHER_IDENTITY_SSOT);
  const [heightsMap, setHeightsMap] = useState<ReadonlyMap<string, number>>(
    () => new Map()
  );
  const viewportWrapperRef = useRef<HTMLDivElement>(null);
  const stagingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIdentity(loadTeacherIdentitySSOT());
    const sync = () => setIdentity(loadTeacherIdentitySSOT());
    window.addEventListener(IDENTITY_UPDATED_EVENT_NAME, sync);
    return () => window.removeEventListener(IDENTITY_UPDATED_EVENT_NAME, sync);
  }, []);

  useEffect(() => {
    const updateScale = () => {
      const w = viewportWrapperRef.current?.clientWidth || window.innerWidth;
      setMobileZoomScale(
        w < 820 ? Number(Math.max(0.42, Math.min(1, (w - 16) / 794)).toFixed(2)) : 1
      );
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const activeFont = PRINT_FONT_FAMILIES_SSOT[settings.fontFamilyId];
  const palette = resolvePrintThemePalette(settings.colorThemeId);
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const isSolvedMode =
    settings.answerVisibilityMode !== "questions_only" ||
    questions.some((q) => q.id.startsWith("booklet-s1-"));
  const densityGap =
    settings.densityMode === "ultra_compact"
      ? "gap-1.5"
      : settings.densityMode === "standard_balanced"
        ? "gap-2"
        : "gap-2.5";

  const { blocks, totalIdeasCount } = React.useMemo(
    () =>
      buildSovereignA4RowBlocks({
        questions,
        columnsCount: settings.columnsCount,
        includeAnswerKey: isSolvedMode,
      }),
    [questions, settings.columnsCount, isSolvedMode]
  );

  // قياس الارتفاع الفعلي بالبيكسل لكل صف ذري بعد تصيير الخطوط ومعادلات KaTeX
  useLayoutEffect(() => {
    const measureAll = () => {
      const container = stagingRef.current;
      if (!container) return;
      const nextMap = new Map<string, number>();
      const nodes = container.querySelectorAll<HTMLElement>("[data-sovereign-block-id]");
      nodes.forEach((node) => {
        const id = node.getAttribute("data-sovereign-block-id");
        if (id) nextMap.set(id, Math.ceil(node.offsetHeight));
      });
      setHeightsMap(nextMap);
    };

    measureAll();
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measureAll).catch(() => {});
    }
    const timer = setTimeout(measureAll, 180);
    return () => clearTimeout(timer);
  }, [blocks, settings.fontFamilyId, settings.exactFontSizePt, settings.densityMode, settings.numeralMode, settings.notationLanguage]);

  const discretePages = React.useMemo(
    () => packMeasuredBlocksIntoDiscreteA4Pages(blocks, heightsMap),
    [blocks, heightsMap]
  );

  const renderBlockContent = (block: SovereignA4RowBlock) => {
    if (block.kind === "idea_capsule") {
      return (
        <PedagogicalIdeaAndRuleCapsule
          item={block.anchorQuestion}
          palette={palette}
          numeralMode={settings.numeralMode}
          notationLanguage={settings.notationLanguage}
          ideaIndex={block.ideaIndex}
        />
      );
    }
    if (block.kind === "question_pair") {
      const isTwoCols = settings.columnsCount === 2 && block.items.length > 1;
      return (
        <div
          className={`grid ${isTwoCols ? "grid-cols-2" : "grid-cols-1"} ${densityGap} items-start w-full min-w-0`}
        >
          {block.items.map((q) => (
            <SideBySideDiagramDocker key={q.id} question={q} settings={settings} />
          ))}
        </div>
      );
    }
    if (block.kind === "idea_divider") {
      return (
        <div className="py-0.5 flex items-center justify-center gap-2 text-[7.8pt] font-black text-slate-500">
          <span className="w-12 border-t border-dashed border-slate-300" />
          <span>نهاية الفكرة ({formatNumeralsByModeSSOT(block.ideaIndex, settings.numeralMode)})</span>
          <span className="w-12 border-t border-dashed border-slate-300" />
        </div>
      );
    }
    if (block.kind === "mcq_answer_key") {
      return (
        <OfficialMcqAnswerKeySummaryTable
          questions={questions}
          palette={palette}
          numeralMode={settings.numeralMode}
          notationLanguage={settings.notationLanguage}
        />
      );
    }
    return (
      <SovereignDocumentAccreditationBox
        identity={identity}
        palette={palette}
        numeralMode={settings.numeralMode}
      />
    );
  };

  return (
    <div
      ref={viewportWrapperRef}
      className="w-full overflow-hidden flex flex-col items-center bg-slate-200/70 dark:bg-slate-900/60 rounded-3xl p-2 sm:p-5 border border-slate-300/80 dark:border-slate-800 relative"
    >
      {/* شريط معلومات محرك الصفحات السيادي */}
      {questions.length > 0 && (
        <div className="mb-3 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-black flex flex-wrap items-center gap-3 shadow-md">
          <span>📄 نظام إنتاج صفحات A4 السيادي المستقل</span>
          <span className="text-amber-300">
            إجمالي الورق: {formatNumeralsByModeSSOT(discretePages.length, settings.numeralMode)} صفحة A4
          </span>
          <span className="text-emerald-300">
            المسائل: {formatNumeralsByModeSSOT(questions.length, settings.numeralMode)}
          </span>
        </div>
      )}

      {/* منصة القياس الخفية لحساب الارتفاعات الحقيقية بالبيكسل */}
      <div
        ref={stagingRef}
        dir="rtl"
        aria-hidden="true"
        style={{
          width: "754px",
          position: "absolute",
          top: "-99999px",
          left: "-99999px",
          visibility: "hidden",
          pointerEvents: "none",
          fontFamily: activeFont.cssFontStack,
          fontSize: `${settings.exactFontSizePt}pt`,
          lineHeight: activeFont.optimalLineHeight,
        }}
      >
        {blocks.map((b) => (
          <div key={b.id} data-sovereign-block-id={b.id} className="w-full min-w-0">
            {renderBlockContent(b)}
          </div>
        ))}
      </div>

      {/* عرض وتصدير صفحات A4 المنفصلة والمضبوطة */}
      <div
        style={{
          width: "794px",
          transform: `scale(${mobileZoomScale})`,
          transformOrigin: "top center",
          marginBottom:
            mobileZoomScale < 1
              ? `${Math.round((mobileZoomScale - 1) * 1123 * Math.max(1, discretePages.length))}px`
              : "0px",
        }}
        className="transition-transform duration-200"
      >
        <div ref={sheetContainerRef} dir="rtl" className="flex flex-col gap-5 print:gap-0">
          {questions.length === 0 ? (
            <div className="w-[794px] min-h-[500px] bg-white rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300">
              <div className="text-3xl">📄</div>
              <div className="text-sm font-black text-slate-600">لا توجد أسئلة في الورقة بعد</div>
            </div>
          ) : (
            discretePages.map((page) => (
              <section
                key={page.pageNumber}
                style={{
                  backgroundColor: "#ffffff",
                  color: "#0f172a",
                  fontFamily: activeFont.cssFontStack,
                  fontSize: `${Number((settings.exactFontSizePt * page.contentScale).toFixed(2))}pt`,
                  lineHeight: activeFont.optimalLineHeight,
                }}
                className="sovereign-a4-page-sheet w-[794px] h-[1123px] bg-white text-slate-950 shadow-2xl px-[20px] py-[18px] flex flex-col justify-between relative overflow-hidden rounded-sm border border-slate-300 print:border-0 print:rounded-none print:shadow-none"
              >
                <div className="w-full min-w-0 flex-1 flex flex-col">
                  {page.isFirstPage ? (
                    <SovereignFirstPageHeader
                      identity={identity}
                      palette={palette}
                      documentTitle={settings.customDocumentTitle}
                      subtitleAr={subtitleAr}
                      isSolvedMode={isSolvedMode}
                      totalIdeasCount={totalIdeasCount}
                      totalQuestionsCount={questions.length}
                      totalMarks={totalMarks}
                      numeralMode={settings.numeralMode}
                    />
                  ) : (
                    <SovereignRunningPageHeader
                      identity={identity}
                      palette={palette}
                      documentTitle={settings.customDocumentTitle}
                      subtitleAr={subtitleAr}
                      pageNumber={page.pageNumber}
                      totalPages={discretePages.length}
                      numeralMode={settings.numeralMode}
                    />
                  )}

                  <div className="space-y-1.5 w-full min-w-0">
                    {page.blocks.map((block) => (
                      <div key={block.id} className="w-full min-w-0">
                        {renderBlockContent(block)}
                      </div>
                    ))}
                  </div>
                </div>

                <SovereignPageNumberFooterBar
                  identity={identity}
                  palette={palette}
                  pageNumber={page.pageNumber}
                  totalPages={discretePages.length}
                  numeralMode={settings.numeralMode}
                />
              </section>
            ))
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
