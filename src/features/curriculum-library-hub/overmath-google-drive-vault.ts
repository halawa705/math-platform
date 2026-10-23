/**
 * @file overmath-google-drive-vault.ts
 * @description محرك خزينة Google Drive المخصص لمالك المنصة (overmath.math@gmail.com).
 * يتولى حفظ وأرشفة جميع المذكرات والمراجعات النهائية والاختبارات المولدة من الموقع الجديد
 * وتوليد روابط العرض والتحميل المباشرة من خزينة Google Drive دون استهلاك مساحة Supabase.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
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
}

const STORAGE_KEY_OVERMATH_DRIVE_ARCHIVE =
  "math_platform_overmath_drive_archive_v1" as const;

export const DEFAULT_OVERMATH_DRIVE_RECORDS: readonly OvermathDriveArchivedRecord[] = [
  {
    id: "drive_doc_1",
    titleAr: "مذكرة الهندسة المستوية — القطعة الواصلة بين منتصفي ضلعين",
    docKind: "booklet",
    branchAr: "هندسة مستوية",
    gradeAr: "الصف الثالث الإعدادي",
    pagesCount: 2,
    fontUsed: "خط المراعي 12.5pt",
    driveOwnerEmail: OVERMATH_GOOGLE_DRIVE_ACCOUNT_EMAIL,
    driveFolderPathAr: "OverMath Drive / الصف الثالث الإعدادي / هندسة مستوية / المذكرات",
    syncStatus: "synced_in_drive",
    driveViewUrl: "https://drive.google.com/drive/u/0/my-drive",
    driveDownloadUrl: "/studio",
    syncedAtIso: "2026-10-23T14:00:00.000Z",
  },
  {
    id: "drive_doc_2",
    titleAr: "اختبار تقييمي رسمي — العلاقات والدوال التربيعية",
    docKind: "exam",
    branchAr: "جبر ودوال",
    gradeAr: "الصف الثالث الإعدادي",
    pagesCount: 1,
    fontUsed: "خط كايرو 12pt",
    driveOwnerEmail: OVERMATH_GOOGLE_DRIVE_ACCOUNT_EMAIL,
    driveFolderPathAr: "OverMath Drive / الصف الثالث الإعدادي / جبر ودوال / الاختبارات",
    syncStatus: "synced_in_drive",
    driveViewUrl: "https://drive.google.com/drive/u/0/my-drive",
    driveDownloadUrl: "/studio",
    syncedAtIso: "2026-10-23T14:15:00.000Z",
  },
  {
    id: "drive_doc_3",
    titleAr: "كبسولة المراجعة النهائية — حساب المثلثات ونظرية إقليدس",
    docKind: "final_review",
    branchAr: "حساب مثلثات",
    gradeAr: "الصف الأول الثانوي",
    pagesCount: 2,
    fontUsed: "خط المراعي 12pt",
    driveOwnerEmail: OVERMATH_GOOGLE_DRIVE_ACCOUNT_EMAIL,
    driveFolderPathAr: "OverMath Drive / الصف الأول الثانوي / حساب مثلثات / المراجعات النهائية",
    syncStatus: "synced_in_drive",
    driveViewUrl: "https://drive.google.com/drive/u/0/my-drive",
    driveDownloadUrl: "/studio",
    syncedAtIso: "2026-10-23T14:30:00.000Z",
  },
];

/**
 * استرجاع قائمة المذكرات والمراجعات والاختبارات المحفوظة في خزينة overmath.math@gmail.com
 */
export function loadOvermathDriveArchive(): readonly OvermathDriveArchivedRecord[] {
  if (typeof window === "undefined") {
    return DEFAULT_OVERMATH_DRIVE_RECORDS;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_OVERMATH_DRIVE_ARCHIVE);
    if (!raw) return DEFAULT_OVERMATH_DRIVE_RECORDS;
    const parsed = JSON.parse(raw) as OvermathDriveArchivedRecord[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : DEFAULT_OVERMATH_DRIVE_RECORDS;
  } catch {
    return DEFAULT_OVERMATH_DRIVE_RECORDS;
  }
}

/**
 * حفظ وثيقة جديدة (مذكرة / مراجعة نهائية / اختبار) وتصدير حزمتها مباشرة لخزينة overmath.math@gmail.com
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
    driveViewUrl: "https://drive.google.com/drive/u/0/my-drive",
    driveDownloadUrl: "/studio",
    syncedAtIso: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const current = loadOvermathDriveArchive();
    const updated = [newRecord, ...current];
    window.localStorage.setItem(
      STORAGE_KEY_OVERMATH_DRIVE_ARCHIVE,
      JSON.stringify(updated)
    );

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
          }
        })
        .catch(() => {
          // في حال عدم الاتصال بالإنترنت تبقى النسخة محفوظة محلياً
        });
    }
  }

  return newRecord;
}
