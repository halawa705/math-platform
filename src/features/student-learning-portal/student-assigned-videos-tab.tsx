"use client";

/**
 * @file student-assigned-videos-tab.tsx
 * @description تبويب محاضرات الفيديو الحقيقية التي أضافها المعلم لصف الطالب فقط.
 */

import { useEffect, useState } from "react";
import {
  loadVideoLecturesSSOT,
  resolveYoutubeEmbedUrl,
  type PublishedVideoLecture,
} from "@/features/electronic-exams-hub/published-video-lectures-store";

export const MODULE_ID_STUDENT_ASSIGNED_VIDEOS_TAB =
  "student_assigned_videos_tab" as const;

export default function StudentAssignedVideosTab({
  gradeId,
}: {
  readonly gradeId?: string;
}) {
  const [lectures, setLectures] = useState<readonly PublishedVideoLecture[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const list = loadVideoLecturesSSOT(gradeId);
    setLectures(list);
    setActiveId(list[0]?.lectureId || "");
  }, [gradeId]);

  if (lectures.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-[#111827] border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-1.5">
        <div className="text-2xl">🎬</div>
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
          لا توجد محاضرات مضافة لصفك بعد
        </h3>
        <p className="text-xs font-bold text-slate-500">
          ستظهر المحاضرات هنا فور إضافتها من المعلم.
        </p>
      </div>
    );
  }

  const current = lectures.find((l) => l.lectureId === activeId) || lectures[0];
  const embedUrl = resolveYoutubeEmbedUrl(current.videoUrl);

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm sm:text-base font-black">{current.titleAr}</h3>
        {embedUrl ? (
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
            <iframe
              src={embedUrl}
              title={current.titleAr}
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <a
            href={current.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] px-5 items-center rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black"
          >
            ▶ فتح المحاضرة ↗
          </a>
        )}
      </div>

      {lectures.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {lectures.map((l) => (
            <button
              key={l.lectureId}
              type="button"
              onClick={() => setActiveId(l.lectureId)}
              className={`p-3.5 rounded-2xl border text-right text-xs font-black cursor-pointer transition ${
                l.lectureId === current.lectureId
                  ? "border-teal-600 bg-teal-50/70 dark:bg-teal-950/30"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]"
              }`}
            >
              {l.titleAr}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
