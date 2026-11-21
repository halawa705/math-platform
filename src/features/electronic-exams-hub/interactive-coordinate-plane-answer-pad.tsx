"use client";

/**
 * @file interactive-coordinate-plane-answer-pad.tsx
 * @description أداة لوحة الشبكة الإحداثية التفاعلية للطالب (Mobile-First):
 * تتيح النقر على نقاط المستوى (أو الربع الأول)، معاينة المضلع المتصل، التراجع أو المسح، وإدراج الإحداثيات في حقل الإجابة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 210 سطراً).
 */

import { useState, type MouseEvent } from "react";
import {
  formatNumeralsByModeSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_INTERACTIVE_COORDINATE_PLANE_ANSWER_PAD =
  "interactive_coordinate_plane_answer_pad" as const;

export interface InteractiveCoordinatePlaneAnswerPadProps {
  readonly quadrantMode?: "first_quadrant" | "four_quadrant";
  readonly notationLanguage?: MathNotationLanguage;
  readonly numeralMode?: NumeralDisplayMode;
  readonly onInsertAnswerText: (formattedCoords: string) => void;
}

interface GridPoint {
  readonly x: number;
  readonly y: number;
}

export default function InteractiveCoordinatePlaneAnswerPad({
  quadrantMode: initialMode = "four_quadrant",
  notationLanguage = "arabic",
  numeralMode = "western",
  onInsertAnswerText,
}: InteractiveCoordinatePlaneAnswerPadProps) {
  const [mode, setMode] = useState<"first_quadrant" | "four_quadrant">(initialMode);
  const [points, setPoints] = useState<GridPoint[]>([]);

  const isFirst = mode === "first_quadrant";
  const minBound = isFirst ? 0 : -4;
  const maxBound = isFirst ? 7 : 4;
  const span = maxBound - minBound;
  const svgSize = 230;
  const pad = 22;
  const inner = svgSize - 2 * pad;

  const toPx = (gx: number, gy: number) => ({
    sx: Number((pad + ((gx - minBound) / span) * inner).toFixed(1)),
    sy: Number((svgSize - pad - ((gy - minBound) / span) * inner).toFixed(1)),
  });

  const handleSvgClick = (e: MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const relX = ((e.clientX - rect.left) / rect.width) * svgSize;
    const relY = ((e.clientY - rect.top) / rect.height) * svgSize;
    const gx = Math.max(minBound, Math.min(maxBound, Math.round(minBound + ((relX - pad) / inner) * span)));
    const gy = Math.max(minBound, Math.min(maxBound, Math.round(minBound + ((svgSize - pad - relY) / inner) * span)));
    setPoints((prev) => (prev.some((p) => p.x === gx && p.y === gy) ? prev.filter((p) => !(p.x === gx && p.y === gy)) : [...prev, { x: gx, y: gy }]));
  };

  const origin = toPx(0, 0);
  const xStart = toPx(minBound, 0);
  const xEnd = toPx(maxBound, 0);
  const yStart = toPx(0, minBound);
  const yEnd = toPx(0, maxBound);
  const coordsList = points.map((p) => `(${p.x}, ${p.y})`).join("، ");
  const polyPointsAttr = points.map((p) => { const px = toPx(p.x, p.y); return `${px.sx},${px.sy}`; }).join(" ");

  const ticks: number[] = [];
  for (let v = minBound; v <= maxBound; v += 1) ticks.push(v);

  return (
    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-black text-indigo-950 dark:text-indigo-200">
          📍 انقر على التقاطعات لتعيين النقاط ({isFirst ? "الربع الأول" : "الأرباع الأربعة"})
        </span>
        <button
          type="button"
          onClick={() => { setMode((m) => (m === "first_quadrant" ? "four_quadrant" : "first_quadrant")); setPoints([]); }}
          className="min-h-[44px] px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-[11px] font-black text-slate-700 dark:text-slate-200 cursor-pointer"
        >
          {isFirst ? "تبديل إلى ٤ أرباع" : "تبديل إلى الربع الأول"}
        </button>
      </div>

      <div className="flex justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          onClick={handleSvgClick}
          className="w-full max-w-[260px] h-auto bg-white rounded-xl border border-slate-200 cursor-crosshair select-none touch-manipulation"
        >
          {ticks.map((v) => {
            const pX1 = toPx(v, minBound); const pX2 = toPx(v, maxBound);
            const pY1 = toPx(minBound, v); const pY2 = toPx(maxBound, v);
            return (
              <g key={v}>
                <line data-coord-grid="1" x1={pX1.sx} y1={pX1.sy} x2={pX2.sx} y2={pX2.sy} stroke="#E2E8F0" strokeWidth="0.8" />
                <line data-coord-grid="1" x1={pY1.sx} y1={pY1.sy} x2={pY2.sx} y2={pY2.sy} stroke="#E2E8F0" strokeWidth="0.8" />
                {v !== 0 && (
                  <>
                    <text data-furniture="1" x={pX1.sx} y={origin.sy + 10} textAnchor="middle" fontSize="7" fontWeight="700" fill="#64748B">
                      {formatNumeralsByModeSSOT(v, numeralMode)}
                    </text>
                    <text data-furniture="1" x={origin.sx - 5} y={pY1.sy + 2.5} textAnchor="end" fontSize="7" fontWeight="700" fill="#64748B">
                      {formatNumeralsByModeSSOT(v, numeralMode)}
                    </text>
                  </>
                )}
              </g>
            );
          })}
          <line data-coord-axis="x" x1={xStart.sx} y1={xStart.sy} x2={xEnd.sx} y2={xEnd.sy} stroke="#334155" strokeWidth="1.5" />
          <line data-coord-axis="y" x1={yStart.sx} y1={yStart.sy} x2={yEnd.sx} y2={yEnd.sy} stroke="#334155" strokeWidth="1.5" />
          <text data-furniture="1" x={xEnd.sx - 2} y={xEnd.sy - 5} textAnchor="end" fontSize="8.5" fontWeight="800" fill="#0F172A">
            {notationLanguage === "arabic" ? "س" : "X"}
          </text>
          <text data-furniture="1" x={yEnd.sx + 6} y={yEnd.sy + 6} textAnchor="start" fontSize="8.5" fontWeight="800" fill="#0F172A">
            {notationLanguage === "arabic" ? "ص" : "Y"}
          </text>
          {points.length >= 2 && (
            <polygon points={polyPointsAttr} fill="#0D9488" fillOpacity="0.16" stroke="#0D9488" strokeWidth="1.8" />
          )}
          {points.map((pt, idx) => {
            const px = toPx(pt.x, pt.y);
            return (
              <g key={`${pt.x}_${pt.y}`}>
                <circle cx={px.sx} cy={px.sy} r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.2" />
                <text x={px.sx + 5} y={px.sy - 4} fontSize="7.5" fontWeight="800" fill="#1E3A8A">
                  {formatNumeralsByModeSSOT(`(${pt.x}, ${pt.y})`, numeralMode)}
                  {idx === points.length - 1 ? "" : ""}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {points.length > 0 && (
        <div className="flex flex-wrap gap-1.5 text-[11px] font-black text-teal-800 dark:text-teal-300" dir="ltr">
          {points.map((pt) => (
            <span key={`tag_${pt.x}_${pt.y}`} className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
              {formatNumeralsByModeSSOT(`(${pt.x}, ${pt.y})`, numeralMode)}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={points.length === 0}
          onClick={() => setPoints((prev) => prev.slice(0, -1))}
          className="min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-black disabled:opacity-40 cursor-pointer"
        >
          تراجع ↶
        </button>
        <button
          type="button"
          disabled={points.length === 0}
          onClick={() => setPoints([])}
          className="min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-black disabled:opacity-40 cursor-pointer"
        >
          مسح
        </button>
        <button
          type="button"
          disabled={points.length === 0}
          onClick={() => { if (coordsList) onInsertAnswerText(coordsList); }}
          className="flex-1 min-h-[44px] px-3 rounded-xl bg-teal-700 text-white text-xs font-black disabled:opacity-40 cursor-pointer shadow-xs"
        >
          إدراج الإحداثيات في الإجابة ✓
        </button>
      </div>
    </div>
  );
}
