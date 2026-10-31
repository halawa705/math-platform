/**
 * @file overmath-google-drive-vault.ts
 * @description محرك خزينة الموقع السحابية (In-Platform Cloud Document Vault):
 * يحفظ المذكرات والمراجعات النهائية والاختبارات المولدة داخل قاعدة بيانات المنصة السحابية (Supabase)
 * والمتصفح مع أسئلتها وإعدادات طباعتها وروابطها الداخلية (`/library?doc=...`) لمعاينتها وطباعتها مباشرة داخل الموقع.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import type { PDFPrintSettingsStateSSOT } from "@/core/ssot/pdf-print-settings-ssot";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from "@/core/supabase/supabase-config-ssot";

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
  /** الرابط الداخلي للمذكرة داخل الموقع نفسه */
  readonly driveViewUrl: string;
  readonly driveDownloadUrl: string;
  readonly syncedAtIso: string;
  readonly questions?: readonly PrintableMathQuestionItem[];
  readonly settings?: PDFPrintSettingsStateSSOT;
  readonly htmlContent?: string;
}

const STORAGE_KEY_OVERMATH_DRIVE_ARCHIVE =
  "math_platform_overmath_drive_archive_v1" as const;

const SUPABASE_VAULT_STATE_ID = "vault_archive_v2" as const;

export const OVERMATH_DRIVE_UPDATED_EVENT =
  "overmath_drive_archive_updated" as const;

function buildSupabaseHeaders(): HeadersInit {
  return {
    apikey: SUPABASE_PUBLIC_KEY,
    Authorization: `Bearer ${SUPABASE_PUBLIC_KEY}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates",
  };
}

/**
 * استرجاع قائمة المذكرات والمراجعات والاختبارات المحفوظة محلياً
 */
export function loadOvermathDriveArchive(): readonly OvermathDriveArchivedRecord[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_OVERMATH_DRIVE_ARCHIVE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OvermathDriveArchivedRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * مزامنة سجل الخزينة إلى قاعدة بيانات المنصة السحابية (Supabase)
 */
export async function syncVaultArchiveToSupabaseCloud(
  records: readonly OvermathDriveArchivedRecord[]
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    // نخزن الأسئلة والإعدادات والبيانات الوصفية دون تكرار htmlContent الثقيل إذا كانت الأسئلة موجودة
    const cloudRecords = records.map((r) => ({
      ...r,
      htmlContent: r.questions && r.questions.length > 0 ? undefined : r.htmlContent,
    }));
    const res = await fetch(`${SUPABASE_URL}/rest/v1/platform_ssot_state?on_conflict=id`, {
      method: "POST",
      headers: buildSupabaseHeaders(),
      body: JSON.stringify({
        id: SUPABASE_VAULT_STATE_ID,
        identity_json: { records: cloudRecords },
        updated_at: new Date().toISOString(),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * سحب المذكرات والاختبارات المحفوظة من سحابة المنصة (Supabase) ودمجها مع النسخة المحلية
 */
export async function pullVaultArchiveFromSupabaseCloud(): Promise<
  readonly OvermathDriveArchivedRecord[]
> {
  const local = loadOvermathDriveArchive();
  if (typeof window === "undefined") return local;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/platform_ssot_state?id=eq.${SUPABASE_VAULT_STATE_ID}&select=identity_json`,
      { method: "GET", headers: buildSupabaseHeaders() }
    );
    if (!res.ok) return local;
    const rows = (await res.json()) as Array<{
      identity_json?: { records?: OvermathDriveArchivedRecord[] };
    }>;
    const cloudRecords = rows[0]?.identity_json?.records;
    if (!Array.isArray(cloudRecords)) return local;

    const byId = new Map<string, OvermathDriveArchivedRecord>();
    for (const c of cloudRecords) byId.set(c.id, c);
    for (const l of local) {
      const existing = byId.get(l.id);
      byId.set(l.id, existing ? { ...existing, htmlContent: l.htmlContent ?? existing.htmlContent } : l);
    }
    const merged = [...byId.values()].sort(
      (a, b) => Date.parse(b.syncedAtIso || "") - Date.parse(a.syncedAtIso || "")
    );
    try {
      window.localStorage.setItem(STORAGE_KEY_OVERMATH_DRIVE_ARCHIVE, JSON.stringify(merged));
    } catch {
      // ignore quota limits
    }
    return merged;
  } catch {
    return local;
  }
}

/**
 * حذف ملف محفوظ من سجل الخزينة المحلية والسحابية
 */
export function deleteDocumentFromOvermathDriveVault(
  recordId: string
): readonly OvermathDriveArchivedRecord[] {
  if (typeof window === "undefined") return [];
  const next = loadOvermathDriveArchive().filter((r) => r.id !== recordId);
  try {
    window.localStorage.setItem(STORAGE_KEY_OVERMATH_DRIVE_ARCHIVE, JSON.stringify(next));
    window.dispatchEvent(new Event(OVERMATH_DRIVE_UPDATED_EVENT));
  } catch {
    // ignore storage quota errors
  }
  void syncVaultArchiveToSupabaseCloud(next);
  return next;
}

/**
 * حفظ وثيقة جديدة (مذكرة / مراجعة نهائية / اختبار) داخل خزينة الموقع السحابية وتوليد رابطها الداخلي
 */
export function saveDocumentToOvermathDriveVault(input: {
  readonly titleAr: string;
  readonly docKind: VaultDocumentKind;
  readonly branchAr: string;
  readonly gradeAr: string;
  readonly pagesCount: number;
  readonly fontUsed: string;
  readonly questions?: readonly PrintableMathQuestionItem[];
  readonly settings?: PDFPrintSettingsStateSSOT;
  readonly htmlContent?: string;
}): OvermathDriveArchivedRecord {
  const kindFolderAr =
    input.docKind === "booklet"
      ? "المذكرات"
      : input.docKind === "final_review"
      ? "المراجعات النهائية"
      : "الاختبارات";

  const docId = `doc_${Date.now()}`;
  const inSiteLink = `/library?tab=archive&doc=${docId}`;

  const newRecord: OvermathDriveArchivedRecord = {
    id: docId,
    titleAr: input.titleAr,
    docKind: input.docKind,
    branchAr: input.branchAr,
    gradeAr: input.gradeAr,
    pagesCount: input.pagesCount,
    fontUsed: input.fontUsed,
    driveOwnerEmail: OVERMATH_GOOGLE_DRIVE_ACCOUNT_EMAIL,
    driveFolderPathAr: `خزينة المنصة / ${input.gradeAr} / ${input.branchAr} / ${kindFolderAr}`,
    syncStatus: "synced_in_drive",
    driveViewUrl: inSiteLink,
    driveDownloadUrl: inSiteLink,
    syncedAtIso: new Date().toISOString(),
    questions: input.questions,
    settings: input.settings,
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
    } catch {
      const slimUpdated = [
        { ...newRecord, htmlContent: undefined },
        ...current.map((r) => ({ ...r, htmlContent: undefined })),
      ];
      try {
        window.localStorage.setItem(
          STORAGE_KEY_OVERMATH_DRIVE_ARCHIVE,
          JSON.stringify(slimUpdated)
        );
      } catch {
        // ignore quota errors
      }
    }
    window.dispatchEvent(new Event(OVERMATH_DRIVE_UPDATED_EVENT));
    void syncVaultArchiveToSupabaseCloud(updated);
  }

  return newRecord;
}
