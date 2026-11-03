"use client";

/**
 * @file math-markdown-table-block-renderer.tsx
 * @description محلل ومصير ذري للجداول المضمنة داخل نصوص المسائل والاختبارات (Markdown Pipe Tables).
 * يكتشف الجداول تلقائياً (حتى لو حُذفت منها فواصل --- أو الشرطات النهائية) ويحولها إلى جدول HTML
 * رسمي منسق باتجاه RTL يعمل في كلٍّ من ورق الـ PDF A4 والاختبارات الإلكترونية التفاعلية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 140 سطراً).
 */

import React from "react";

export const MODULE_ID_MATH_MARKDOWN_TABLE_BLOCK_RENDERER =
  "math_markdown_table_block_renderer" as const;

export type TextOrTableSegment =
  | { readonly kind: "prose"; readonly text: string }
  | { readonly kind: "table"; readonly rows: readonly (readonly string[])[] };

function isTableSeparatorLine(line: string): boolean {
  const trimmed = line.trim();
  return /^\|[\s\-:|]+\|?$/.test(trimmed) && trimmed.includes("-");
}

function isStrayBrokenPipeLine(line: string): boolean {
  return /^\s*\|\s*$/.test(line);
}

function isTableDataRowLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) return false;
  if (isTableSeparatorLine(trimmed) || isStrayBrokenPipeLine(trimmed)) return false;
  const pipeCount = (trimmed.match(/\|/g) ?? []).length;
  return pipeCount >= 2;
}

function parseTableRowCells(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

/**
 * يفصل النص إلى فقرات نصية عادية وكتل جداول منظمة، مع التئام الجداول التي تضررت فواصلها سابقاً.
 */
export function splitTextIntoProseAndTableSegments(rawText: string): TextOrTableSegment[] {
  if (!rawText || !rawText.includes("|")) {
    return [{ kind: "prose", text: rawText }];
  }

  const lines = rawText.split("\n");
  const segments: TextOrTableSegment[] = [];
  let proseBuffer: string[] = [];
  let tableRows: string[][] = [];

  const flushProse = () => {
    const joined = proseBuffer.join("\n").trim();
    if (joined) segments.push({ kind: "prose", text: joined });
    proseBuffer = [];
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const maxCols = Math.max(...tableRows.map((r) => r.length));
      const normalized = tableRows.map((r) =>
        r.length < maxCols ? [...r, ...Array(maxCols - r.length).fill("")] : r
      );
      segments.push({ kind: "table", rows: normalized });
      tableRows = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (isTableDataRowLine(line)) {
      flushProse();
      tableRows.push(parseTableRowCells(line));
      i++;
      continue;
    }

    if (tableRows.length > 0 && (isTableSeparatorLine(line) || isStrayBrokenPipeLine(line) || line.trim() === "")) {
      let lookahead = i + 1;
      while (
        lookahead < lines.length &&
        (isTableSeparatorLine(lines[lookahead]) ||
          isStrayBrokenPipeLine(lines[lookahead]) ||
          lines[lookahead].trim() === "")
      ) {
        lookahead++;
      }
      if (lookahead < lines.length && isTableDataRowLine(lines[lookahead])) {
        i = lookahead;
        continue;
      }
    }

    flushTable();
    proseBuffer.push(line);
    i++;
  }

  flushTable();
  flushProse();

  return segments.length > 0 ? segments : [{ kind: "prose", text: rawText }];
}

export interface MathMarkdownTableBlockRendererProps {
  readonly rows: readonly (readonly string[])[];
  readonly renderCell: (cellText: string) => React.ReactNode;
}

export function MathMarkdownTableBlockRenderer({
  rows,
  renderCell,
}: MathMarkdownTableBlockRendererProps) {
  if (rows.length === 0) return null;
  const headerRow = rows[0];
  const bodyRows = rows.slice(1);

  return (
    <div className="my-2 w-full overflow-x-auto" dir="rtl">
      <table className="w-full border-collapse rounded-lg overflow-hidden border-2 border-slate-400 bg-white text-slate-900 text-[0.9em]">
        <thead>
          <tr className="bg-slate-100 border-b-2 border-slate-400">
            {headerRow.map((cell, cIdx) => (
              <th
                key={cIdx}
                className="border border-slate-300 px-2.5 py-1.5 text-center font-black text-slate-900"
              >
                {renderCell(cell)}
              </th>
            ))}
          </tr>
        </thead>
        {bodyRows.length > 0 && (
          <tbody>
            {bodyRows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={rIdx % 2 === 0 ? "bg-white" : "bg-slate-50/80"}
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className={`border border-slate-300 px-2.5 py-1.5 text-center ${
                      cIdx === 0 ? "font-black bg-slate-50/60" : "font-bold"
                    } text-slate-900`}
                  >
                    {renderCell(cell || "......")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}
