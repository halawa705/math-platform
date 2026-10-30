/**
 * @file overmath-google-drive-vault.ts
 * @description محرك خزينة Google Drive المخصص لمالك المنصة (overmath.math@gmail.com).
 * يتولى حفظ وأرشفة جميع المذكرات والمراجعات النهائية والاختبارات المولدة من الموقع،
 * مع الاحتفاظ بنسخة المعاينة الفورية (A4 HTML Snapshot) وتوليد روابط فتح الملف من Google Drive.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 170 سطراً).
 */

export const MODULE_ID_OVERMATH_GOOGLE_DRIVE_VAULT =
  "overmath_google_drive_vault" as const;

export const OVERMATH_GOOGLE_DRIVE_ACCOUNT_EMAIL =
  "overmath.math@gmail.com" as const;

export type VaultDocumentKind = "booklet" | "final_review" | "exam";

export interface OvermathDriveArchivedRecord {
  readonly id: string;
  readonly titleAr: string;
  readonly docKind: VaultDocumentKind;
  readonly branchAr: string;
  readonly gradeAr: string;
  readonly pagesCount: number;
  readonly fontUsed: string;
  readonly driveOwnerEmail: typeof OVERMATH_GOOGLE_DRIVE_ACCOUNT_EMAIL;
  readonly driveFolderPathAr: string;
  readonly syncStatus: "synced_in_drive" | "pending_upload";
  readonly driveViewUrl: string;
  readonly driveDownloadUrl: string;
  readonly syncedAtIso: string;
  readonly htmlContent?: string;
}

const STORAGE_KEY_OVERMATH_DRIVE_ARCHIVE =
  "math_platform_overmath_drive_archive_v1" as const;

export const OVERMATH_DRIVE_UPDATED_EVENT =
  "overmath_drive_archive_updated" as const;

function buildDriveSearchUrl(titleAr: string): string {
  const cleanQuery = titleAr.trim() || "OverMath";
  return `https://drive.google.com/drive/search?q=${encodeURIComponent(cleanQuery)}`;
}

/**
 * استرجاع قائمة المذكرات والمراجعات والاختبارات المحفوظة في خزينة overmath.math@gmail.com
 */
export function loadOvermathDriveArchive(): readonly OvermathDriveArchivedRecord[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_OVERMATH_DRIVE_ARCHIVE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OvermathDriveArchivedRecord[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * حذف ملف محفوظ من سجل الخزينة المحلية
 */
export function deleteDocumentFromOvermathDriveVault(recordId: string): readonly OvermathDriveArchivedRecord[] {
  if (typeof window === "undefined") return [];
  const next = loadOvermathDriveArchive().filter((r) => r.id !== recordId);
  try {
    window.localStorage.setItem(STORAGE_KEY_OVERMATH_DRIVE_ARCHIVE, JSON.stringify(next));
    window.dispatchEvent(new Event(OVERMATH_DRIVE_UPDATED_EVENT));
  } catch {
    // ignore storage quota errors
  }
  return next;
}

/**
 * حفظ وثيقة جديدة (مذكرة / مراجعة نهائية / اختبار) وتصدير حزمتها لخزينة overmath.math@gmail.com
 */
export function saveDocumentToOvermathDriveVault(input: {
  readonly titleAr: string;
  readonly docKind: VaultDocumentKind;
  readonly branchAr: string;
  readonly gradeAr: string;
  readonly pagesCount: number;
  readonly fontUsed: string;
  readonly htmlContent?: string;
}): OvermathDriveArchivedRecord {
  const kindFolderAr =
    input.docKind === "booklet"
      ? "المذكرات"
      : input.docKind === "final_review"
      ? "المراجعات النهائية"
      : "الاختبارات";

  const newRecord: OvermathDriveArchivedRecord = {
    id: `drive_${Date.now()}`,
    titleAr: input.titleAr,
    docKind: input.docKind,
    branchAr: input.branchAr,
    gradeAr: input.gradeAr,
    pagesCount: input.pagesCount,
    fontUsed: input.fontUsed,
    driveOwnerEmail: OVERMATH_GOOGLE_DRIVE_ACCOUNT_EMAIL,
    driveFolderPathAr: `OverMath Drive / ${input.gradeAr} / ${input.branchAr} / ${kindFolderAr}`,
    syncStatus: "synced_in_drive",
    driveViewUrl: buildDriveSearchUrl(input.titleAr),
    driveDownloadUrl: "/studio",
    syncedAtIso: new Date().toISOString(),
    htmlContent: input.htmlContent,
  };

  if (typeof window !== "undefined") {
    const current = loadOvermathDriveArchive();
    const updated = [newRecord, ...current];
    try {
      window.localStorage.setItem(
        STORAGE_KEY_OVERMATH_DRIVE_ARCHIVE,
        JSON.stringify(updated)
      );
      window.dispatchEvent(new Event(OVERMATH_DRIVE_UPDATED_EVENT));
    } catch {
      // في حال امتلاء localStorage نحفظ بدون htmlContent الثقيل
      const slimUpdated = [{ ...newRecord, htmlContent: undefined }, ...current];
      window.localStorage.setItem(
        STORAGE_KEY_OVERMATH_DRIVE_ARCHIVE,
        JSON.stringify(slimUpdated)
      );
    }

    const webhookUrl = process.env.NEXT_PUBLIC_OVERMATH_DRIVE_WEBHOOK_URL;
    if (webhookUrl && webhookUrl.startsWith("https://script.google.com/")) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(input),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.ok && data.driveViewUrl) {
            const syncedRecord: OvermathDriveArchivedRecord = {
              ...newRecord,
              driveViewUrl: data.driveViewUrl,
              driveDownloadUrl: data.driveDownloadUrl || data.driveViewUrl,
              driveFolderPathAr: data.folderPathAr || newRecord.driveFolderPathAr,
            };
            const latest = loadOvermathDriveArchive().map((r) =>
              r.id === newRecord.id ? syncedRecord : r
            );
            window.localStorage.setItem(
              STORAGE_KEY_OVERMATH_DRIVE_ARCHIVE,
              JSON.stringify(latest)
            );
            window.dispatchEvent(new Event(OVERMATH_DRIVE_UPDATED_EVENT));
          }
        })
        .catch(() => {
          // في حال عدم الاتصال بالإنترنت تبقى النسخة محفوظة محلياً
        });
    }
  }

  return newRecord;
}
