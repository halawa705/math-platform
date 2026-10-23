/**
 * @file published-video-lectures-store.ts
 * @description مخزن محاضرات الفيديو الحقيقية التي يضيفها المعلم لكل صف دراسي (بدون أي محاضرات وهمية).
 */

export interface PublishedVideoLecture {
  readonly lectureId: string;
  readonly gradeId: string;
  readonly titleAr: string;
  readonly videoUrl: string;
  readonly addedAtIso: string;
}

const VIDEOS_STORAGE_KEY = "math_platform_video_lectures_v1" as const;

export function loadVideoLecturesSSOT(gradeId?: string): readonly PublishedVideoLecture[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(VIDEOS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PublishedVideoLecture[];
    if (!Array.isArray(parsed)) return [];
    return gradeId ? parsed.filter((v) => v.gradeId === gradeId) : parsed;
  } catch {
    return [];
  }
}

function persist(list: readonly PublishedVideoLecture[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore storage write error
  }
}

export function addVideoLectureSSOT(input: {
  readonly gradeId: string;
  readonly titleAr: string;
  readonly videoUrl: string;
}): void {
  persist([
    {
      lectureId: `vid_${Date.now()}`,
      gradeId: input.gradeId,
      titleAr: input.titleAr.trim(),
      videoUrl: input.videoUrl.trim(),
      addedAtIso: new Date().toISOString(),
    },
    ...loadVideoLecturesSSOT(),
  ]);
}

export function removeVideoLectureSSOT(lectureId: string): void {
  persist(loadVideoLecturesSSOT().filter((v) => v.lectureId !== lectureId));
}

/** يحول روابط يوتيوب إلى رابط تضمين؛ وإلا يرجع null (يُفتح الرابط في صفحة جديدة). */
export function resolveYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}
