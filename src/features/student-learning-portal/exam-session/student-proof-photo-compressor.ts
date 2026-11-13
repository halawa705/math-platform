/**
 * @file student-proof-photo-compressor.ts
 * @description ضاغط صور إجابات الطالب في المتصفح (Canvas Resize بحد أقصى 1400px وجودة JPEG 0.68) قبل الرفع، مع تدوير 90°.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 95 سطراً).
 */

export const MODULE_ID_STUDENT_PROOF_PHOTO_COMPRESSOR =
  "student_proof_photo_compressor" as const;

export const PROOF_PHOTO_MAX_DIMENSION_PX = 1400 as const;
export const PROOF_PHOTO_JPEG_QUALITY = 0.68 as const;

export interface CompressedProofPhotoResult {
  readonly dataUrl: string;
  readonly width: number;
  readonly height: number;
  readonly approxBytes: number;
}

export function rotateAngleQuarterTurn(currentDeg = 0): number {
  return (Math.round(currentDeg) + 90) % 360;
}

export function computeScaledPhotoDimensions(
  naturalWidth: number,
  naturalHeight: number,
  maxDim: number = PROOF_PHOTO_MAX_DIMENSION_PX
): { readonly width: number; readonly height: number } {
  const safeW = Math.max(1, Math.round(naturalWidth));
  const safeH = Math.max(1, Math.round(naturalHeight));
  if (safeW <= maxDim && safeH <= maxDim) {
    return { width: safeW, height: safeH };
  }
  const scale = maxDim / Math.max(safeW, safeH);
  return {
    width: Math.max(1, Math.round(safeW * scale)),
    height: Math.max(1, Math.round(safeH * scale)),
  };
}

export function compressStudentProofPhotoFile(
  file: File
): Promise<CompressedProofPhotoResult> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("يرجى اختيار ملف صورة صالح فقط (JPG / PNG / WebP)."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("تعذر قراءة ملف الصورة."));
    reader.onload = () => {
      const srcUrl = typeof reader.result === "string" ? reader.result : "";
      if (!srcUrl) {
        reject(new Error("بيانات الصورة غير صالحة."));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error("تعذر معالجة الصورة المختارة."));
      img.onload = () => {
        const dims = computeScaledPhotoDimensions(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = dims.width;
        canvas.height = dims.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("متصفحك لا يدعم ضغط الصور حالياً."));
          return;
        }
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, dims.width, dims.height);
        ctx.drawImage(img, 0, 0, dims.width, dims.height);

        const dataUrl = canvas.toDataURL("image/jpeg", PROOF_PHOTO_JPEG_QUALITY);
        resolve({
          dataUrl,
          width: dims.width,
          height: dims.height,
          approxBytes: Math.round((dataUrl.length * 3) / 4),
        });
      };
      img.src = srcUrl;
    };
    reader.readAsDataURL(file);
  });
}
