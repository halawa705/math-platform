"use client";

/**
 * @file student-assigned-videos-tab.tsx
 * @description تبويب محاضرات الفيديو المسجلة المخصصة للطالب مع الفصول الزمنية للنظريات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 150 سطراً).
 */

import React, { useState } from "react";

export const MODULE_ID_STUDENT_ASSIGNED_VIDEOS_TAB =
  "student_assigned_videos_tab" as const;

const STUDENT_VIDEO_LECTURES = [
  {
    id: "vid_1",
    titleAr: "شرح نظرية القطعة الواصلة بين منتصفي ضلعين في مثلث",
    branchAr: "هندسة مستوية",
    durationAr: "٢٤ دقيقة",
    chapters: [
      { time: "٠٠:٠٠", label: "منطوق النظرية والبرهان الاستدلالي" },
      { time: "٠٨:٣٠", label: "عكس النظرية وشروط التوازي" },
      { time: "١٦:١٥", label: "حل مسائل كتاب الوزارة والمحافظات" },
    ],
  },
  {
    id: "vid_2",
    titleAr: "حل معادلات الدرجة الثانية في متغير واحد جبرياً وبيانياً",
    branchAr: "جبر ودوال",
    durationAr: "٢٨ دقيقة",
    chapters: [
      { time: "٠٠:٠٠", label: "التحليل والقانون العام" },
      { time: "١٢:٠٠", label: "نقاط تقاطع منحنى الدالة مع محور السينات" },
    ],
  },
] as const;

export default function StudentAssignedVideosTab() {
  const [activeVideoId, setActiveVideoId] = useState<string>("vid_1");
  const currentVideo =
    STUDENT_VIDEO_LECTURES.find((v) => v.id === activeVideoId) ||
    STUDENT_VIDEO_LECTURES[0];

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-2xl bg-indigo-950 text-white space-y-2 shadow-lg">
        <div className="flex items-center justify-between text-xs font-black text-teal-300">
          <span>🎬 {currentVideo.branchAr}</span>
          <span>المدة: {currentVideo.durationAr}</span>
        </div>
        <h3 className="text-sm sm:text-base font-black">{currentVideo.titleAr}</h3>
        <div className="pt-2 flex flex-wrap gap-1.5">
          {currentVideo.chapters.map((ch, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-xl bg-white/10 text-[11px] font-bold"
            >
              ⏱️ {ch.time} — {ch.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {STUDENT_VIDEO_LECTURES.map((vid) => (
          <button
            key={vid.id}
            type="button"
            onClick={() => setActiveVideoId(vid.id)}
            className={`p-3.5 rounded-2xl border text-right cursor-pointer transition ${
              vid.id === activeVideoId
                ? "border-teal-600 bg-teal-50/70 dark:bg-teal-950/30"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]"
            }`}
          >
            <div className="text-xs font-black text-slate-900 dark:text-white">
              {vid.titleAr}
            </div>
            <div className="text-[11px] font-bold text-slate-500 mt-1">
              {vid.branchAr} • {vid.durationAr}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
