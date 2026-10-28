"use client";

/**
 * @file video-lectures-quick-manager-tab.tsx
 * @description تبويب محاضرات الفيديو لكل صف: نموذج إضافة مختصر + قائمة المحاضرات مع حذف.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { useEffect, useState } from "react";
import CalmEmptyStateCard from "@/components/global-ui/calm-empty-state-card";
import CalmLabeledInputField from "@/components/global-ui/calm-labeled-input-field";
import { loadEnabledGradesSSOT } from "@/core/ssot/teacher-identity-ssot";
import {
  addVideoLectureSSOT,
  loadVideoLecturesSSOT,
  removeVideoLectureSSOT,
  type PublishedVideoLecture,
} from "./published-video-lectures-store";

export const MODULE_ID_VIDEO_LECTURES_QUICK_MANAGER_TAB =
  "video_lectures_quick_manager_tab" as const;

export default function VideoLecturesQuickManagerTab() {
  const [videos, setVideos] = useState<readonly PublishedVideoLecture[]>([]);
  const [grades, setGrades] = useState(() => loadEnabledGradesSSOT());
  const [gradeId, setGradeId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const g = loadEnabledGradesSSOT();
    setGrades(g);
    setGradeId(g[0]?.id || "");
    setVideos(loadVideoLecturesSSOT());
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeId || !title.trim() || !url.trim()) return;
    addVideoLectureSSOT({ gradeId, titleAr: title, videoUrl: url });
    setTitle("");
    setUrl("");
    setVideos(loadVideoLecturesSSOT());
  };

  return (
    <div className="space-y-3">
      <form
        onSubmit={handleAdd}
        className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-3"
      >
        <label className="block">
          <span className="block text-[11px] font-bold text-slate-500 mb-1">الصف</span>
          <select
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
            className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black"
          >
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nameArabic}
              </option>
            ))}
          </select>
        </label>
        <CalmLabeledInputField labelAr="عنوان المحاضرة" value={title} onChange={setTitle} />
        <CalmLabeledInputField
          labelAr="رابط الفيديو"
          isLtr
          placeholder="https://youtu.be/..."
          value={url}
          onChange={setUrl}
        />
        <button
          type="submit"
          className="w-full min-h-[44px] rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black cursor-pointer"
        >
          إضافة المحاضرة
        </button>
      </form>

      {videos.length === 0 ? (
        <CalmEmptyStateCard icon="🎬" titleAr="لم تُضف أي محاضرة بعد" />
      ) : (
        <ul className="space-y-2">
          {videos.map((v) => (
            <li
              key={v.lectureId}
              className="px-4 py-2 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-xs font-black truncate">{v.titleAr}</div>
                <div className="text-[11px] font-bold text-slate-500">
                  {grades.find((g) => g.id === v.gradeId)?.nameArabic || v.gradeId}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  removeVideoLectureSSOT(v.lectureId);
                  setVideos(loadVideoLecturesSSOT());
                }}
                className="min-h-[44px] px-3 text-xs font-black text-rose-600 cursor-pointer shrink-0"
              >
                حذف
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
