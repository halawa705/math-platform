"use client";

/**
 * @file studio-single-stage-paste-panel.tsx
 * @description لوحة المرحلة الواحدة النشطة: خطوتان واضحتان فقط —
 * (١) نسخ البرومبت وفتح NotebookLM (مع إمكانية عرض/تعديل نص البرومبت بنقرة)،
 * (٢) لصق رد NotebookLM الخاص بهذه المرحلة في صندوق مستقل.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { useState } from "react";

export const MODULE_ID_STUDIO_SINGLE_STAGE_PASTE_PANEL =
  "studio_single_stage_paste_panel" as const;

export interface StudioSingleStagePastePanelProps {
  readonly stageTitleAr: string;
  readonly stageHintAr: string;
  readonly promptText: string;
  readonly onChangePrompt: (next: string) => void;
  readonly onCopyPromptAndOpenNotebook: () => void;
  readonly isPromptCopied: boolean;
  readonly replyValue: string;
  readonly onChangeReply: (next: string) => void;
  readonly replyPlaceholderAr: string;
  readonly contextNoteAr?: string;
  readonly opensNotebook?: boolean;
}

export default function StudioSingleStagePastePanel({
  stageTitleAr,
  stageHintAr,
  promptText,
  onChangePrompt,
  onCopyPromptAndOpenNotebook,
  isPromptCopied,
  replyValue,
  onChangeReply,
  replyPlaceholderAr,
  contextNoteAr,
  opensNotebook = true,
}: StudioSingleStagePastePanelProps) {
  const [isPromptVisible, setIsPromptVisible] = useState<boolean>(false);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 space-y-4">
      <div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white">{stageTitleAr}</h3>
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
          {stageHintAr}
        </p>
        {contextNoteAr && (
          <p className="mt-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-[11px] font-black text-emerald-800 dark:text-emerald-300">
            ✓ {contextNoteAr}
          </p>
        )}
      </div>

      {/* الخطوة ١: نسخ البرومبت */}
      <div className="space-y-2">
        <div className="text-xs font-black text-indigo-900 dark:text-indigo-300">
          {opensNotebook
            ? "١. انسخ البرومبت والصقه في NotebookLM"
            : "١. انسخ برومبت هذه المرحلة والصقه في محادثة NotebookLM المفتوحة"}
        </div>
        <button
          type="button"
          onClick={onCopyPromptAndOpenNotebook}
          className="w-full min-h-[48px] rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white text-sm font-black cursor-pointer shadow-sm transition-all"
        >
          {opensNotebook
            ? isPromptCopied
              ? "✓ تم النسخ وفتح NotebookLM"
              : "📋 نسخ البرومبت وفتح NotebookLM ↗"
            : isPromptCopied
            ? "✓ تم نسخ البرومبت للحافظة"
            : "📋 نسخ البرومبت فقط (الدفتر مفتوح بالفعل)"}
        </button>
        <button
          type="button"
          onClick={() => setIsPromptVisible((v) => !v)}
          className="text-[11px] font-black text-slate-500 underline underline-offset-2 cursor-pointer"
        >
          {isPromptVisible ? "إخفاء نص البرومبت" : "عرض / تعديل نص البرومبت"}
        </button>
        {isPromptVisible && (
          <textarea
            rows={8}
            value={promptText}
            onChange={(e) => onChangePrompt(e.target.value)}
            className="w-full p-3 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-slate-950 text-xs font-bold leading-relaxed"
          />
        )}
      </div>

      {/* الخطوة ٢: لصق الرد */}
      <div className="space-y-2">
        <div className="text-xs font-black text-teal-800 dark:text-teal-300">
          ٢. الصق رد NotebookLM لهذه المرحلة هنا
        </div>
        <textarea
          rows={6}
          value={replyValue}
          onChange={(e) => onChangeReply(e.target.value)}
          placeholder={replyPlaceholderAr}
          className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold leading-relaxed"
        />
        {replyValue.trim().length > 5 && (
          <p className="text-[11px] font-black text-emerald-700 dark:text-emerald-400">
            ✓ تم استلام الرد ({replyValue.trim().length} حرفاً)
          </p>
        )}
      </div>
    </div>
  );
}
