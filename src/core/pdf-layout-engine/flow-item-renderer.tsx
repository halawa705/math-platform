"use client";

/**
 * @file flow-item-renderer.tsx
 * @description مصيّر كائن التدفق المفرد (كبسولة فكرة، سؤال/مثال/تدريب، فاصل، جدول إجابات، اعتماد).
 * هو نفسه المستخدم في القياس الخفي وفي الصفحة الفعلية فتتطابق الارتفاعات المقاسة مع المعروضة.
 */

import React from "react";
import type { PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import type { OwnerTeacherIdentity } from "../ssot/teacher-identity-ssot";
import { formatNumeralsByModeSSOT } from "../ssot/numeral-and-unit-ssot";
import type { PrintThemePaletteTokens, PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";
import { OfficialMcqAnswerKeySummaryTable, PedagogicalIdeaAndRuleCapsule } from "./a4-pedagogical-capsule-and-key-table";
import SideBySideDiagramDocker from "./side-by-side-diagram-docker";
import type { FlowItem } from "./flow-item-model";
import { SovereignDocumentAccreditationBox } from "./sovereign-a4-page-chrome-elements";

export const MODULE_ID_FLOW_ITEM_RENDERER = "flow_item_renderer" as const;

export interface FlowItemRendererProps {
  readonly item: FlowItem;
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly palette: PrintThemePaletteTokens;
  readonly identity: OwnerTeacherIdentity;
  readonly questions: readonly PrintableMathQuestionItem[];
}

export function FlowItemRenderer({ item, settings, palette, identity, questions }: FlowItemRendererProps) {
  switch (item.kind) {
    case "idea_capsule":
      return (
        <PedagogicalIdeaAndRuleCapsule
          item={item.anchorQuestion}
          palette={palette}
          numeralMode={settings.numeralMode}
          notationLanguage={settings.notationLanguage}
          ideaIndex={item.ideaIndex}
        />
      );
    case "question":
      return (
        <div className="w-full min-w-0">
          <SideBySideDiagramDocker question={item.question} settings={settings} />
        </div>
      );
    case "idea_divider":
      return (
        <div className="py-0.5 flex items-center justify-center gap-2 text-[7.8pt] font-black text-slate-500">
          <span className="w-12 border-t border-dashed border-slate-300" />
          <span>نهاية الفكرة ({formatNumeralsByModeSSOT(item.ideaIndex, settings.numeralMode)})</span>
          <span className="w-12 border-t border-dashed border-slate-300" />
        </div>
      );
    case "mcq_answer_key":
      return (
        <OfficialMcqAnswerKeySummaryTable
          questions={questions}
          palette={palette}
          numeralMode={settings.numeralMode}
          notationLanguage={settings.notationLanguage}
        />
      );
    default:
      return (
        <SovereignDocumentAccreditationBox identity={identity} palette={palette} numeralMode={settings.numeralMode} />
      );
  }
}
