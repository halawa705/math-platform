"use client";

/**
 * @file sovereign-block-renderer.tsx
 * @description مصير الكتل والصفوف المستقلة لصفحات A4 (Sovereign A4 Block Renderer):
 * - يصيّر كبسولات الأفكار والقواعد، أزواج الأسئلة والتدريبات، فواصل الأفكار، وجداول نماذج الإجابة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import React from "react";
import type { PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import type { OwnerTeacherIdentity } from "../ssot/teacher-identity-ssot";
import { formatNumeralsByModeSSOT } from "../ssot/numeral-and-unit-ssot";
import type {
  PrintThemePaletteTokens,
  PrintableMathQuestionItem,
} from "./a4-vector-html-sheet-renderer";
import {
  OfficialMcqAnswerKeySummaryTable,
  PedagogicalIdeaAndRuleCapsule,
} from "./a4-pedagogical-capsule-and-key-table";
import SideBySideDiagramDocker from "./side-by-side-diagram-docker";
import type { SovereignA4RowBlock } from "./sovereign-a4-page-blocks-builder";
import { SovereignDocumentAccreditationBox } from "./sovereign-a4-page-chrome-elements";

export const MODULE_ID_SOVEREIGN_BLOCK_RENDERER =
  "sovereign_block_renderer" as const;

export interface SovereignBlockRendererProps {
  readonly block: SovereignA4RowBlock;
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly palette: PrintThemePaletteTokens;
  readonly identity: OwnerTeacherIdentity;
  readonly questions: readonly PrintableMathQuestionItem[];
}

export function SovereignBlockRenderer({
  block,
  settings,
  palette,
  identity,
  questions,
}: SovereignBlockRendererProps) {
  const densityGap =
    settings.densityMode === "ultra_compact"
      ? "gap-1.5"
      : settings.densityMode === "standard_balanced"
        ? "gap-2"
        : "gap-2.5";

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
}
