"use client";

/**
 * @file student-proof-photo-capture-box.tsx
 * @description أداة تصوير ورفع صورة خطوات الحل/البرهان للأسئلة المقالية مع ضغط فوري وتدوير 90° وتكبير بملء الشاشة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 175 سطراً).
 */

import { useRef, useState } from "react";
import {
  compressStudentProofPhotoFile,
  rotateAngleQuarterTurn,
} from "./student-proof-photo-compressor";

export const MODULE_ID_STUDENT_PROOF_PHOTO_CAPTURE_BOX =
  "student_proof_photo_capture_box" as const;

export interface StudentProofPhotoCaptureBoxProps {
  readonly imageDataUrl?: string;
  readonly rotationDeg?: number;
  readonly deletedAfterGrading?: boolean;
  readonly isSubmitted: boolean;
  readonly onUpdatePhoto: (patch: {
    readonly proofImageDataUrl?: string;
    readonly proofImageRotationDeg?: number;
  }) => void;
}

export default function StudentProofPhotoCaptureBox({
  imageDataUrl,
  rotationDeg = 0,
  deletedAfterGrading = false,
  isSubmitted,
  onUpdatePhoto,
}: StudentProofPhotoCaptureBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCompressing(true);
    setErrorText(null);
    try {
      const compressed = await compressStudentProofPhotoFile(file);
      onUpdatePhoto({
        proofImageDataUrl: compressed.dataUrl,
        proofImageRotationDeg: 0,
      });
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : "تعذر ضغط الصورة.");
    } finally {
      setCompressing(false);
    }
  };

  if (isSubmitted && deletedAfterGrading && !imageDataUrl) {
    return (
      <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs font-black text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
        <span>🧹</span>
        <span>تمت مراجعة وتصحيح صورة خطوات حلك بواسطة المعلم وحذفها تلقائياً لتوفير المساحة.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-dashed border-indigo-300 dark:border-teal-700">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-black text-indigo-950 dark:text-teal-200 flex items-center gap-1.5">
          <span>📷</span>
          <span>صورة خطوات الحل / البرهان في كراستك</span>
        </span>
        {!isSubmitted && (
          <div className="flex items-center gap-1.5">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={compressing}
              onClick={() => inputRef.current?.click()}
              className="min-h-[44px] px-3.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 dark:bg-teal-600 text-white text-xs font-black cursor-pointer disabled:opacity-50"
            >
              {compressing
                ? "جارٍ الضغط..."
                : imageDataUrl
                  ? "📷 استبدال الصورة"
                  : "📸 تصوير / اختيار صورة"}
            </button>
          </div>
        )}
      </div>

      {errorText && (
        <div className="text-xs font-black text-rose-600">⚠️ {errorText}</div>
      )}

      {imageDataUrl && (
        <div className="space-y-2">
          <div
            onClick={() => setZoomOpen(true)}
            className="w-full max-h-60 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-2 cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageDataUrl}
              alt="صورة خطوات حل الطالب"
              style={{ transform: `rotate(${rotationDeg}deg)` }}
              className="max-h-56 w-auto object-contain transition-transform duration-200"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="min-h-[40px] px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              🔍 تكبير الصورة
            </button>
            {!isSubmitted && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onUpdatePhoto({
                      proofImageDataUrl: imageDataUrl,
                      proofImageRotationDeg: rotateAngleQuarterTurn(rotationDeg),
                    })
                  }
                  className="min-h-[40px] px-3 rounded-xl bg-amber-100 text-amber-900 text-xs font-black cursor-pointer"
                >
                  ↻ تدوير 90°
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdatePhoto({
                      proofImageDataUrl: undefined,
                      proofImageRotationDeg: 0,
                    })
                  }
                  className="min-h-[40px] px-3 rounded-xl bg-rose-100 text-rose-700 text-xs font-black cursor-pointer"
                >
                  🗑️ حذف
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {zoomOpen && imageDataUrl && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-black">معاينة خطوات الحل</span>
              <button
                type="button"
                onClick={() => setZoomOpen(false)}
                className="min-h-[40px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black cursor-pointer"
              >
                ✕ إغلاق
              </button>
            </div>
            <div className="max-h-[72vh] overflow-auto flex items-center justify-center bg-slate-50 rounded-2xl p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageDataUrl}
                alt="صورة خطوات حل الطالب مكبرة"
                style={{ transform: `rotate(${rotationDeg}deg)` }}
                className="max-w-full max-h-[68vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
