/**
 * @file exam-server-supabase-helper.ts
 * @description مساعد خادم فقط للتحدث مع Supabase بمفتاح الخدمة (مع ذاكرة خادم احتياطية قبل تفعيل جداول SQL الجديدة).
 * ممنوع استيراده من أي ملف "use client".
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 140 سطراً).
 */

import {
  SUPABASE_PUBLIC_KEY,
  SUPABASE_URL,
} from "@/core/supabase/supabase-config-ssot";

export const MODULE_ID_EXAM_SERVER_SUPABASE_HELPER =
  "exam_server_supabase_helper" as const;

const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_PUBLIC_KEY;

const memoryFallbackTables: Record<string, Array<Record<string, unknown>>> = {
  exam_answer_keys: [],
  exam_attempts: [],
};

function headers(prefer?: string): Record<string, string> {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

function buildStateFallbackId(table: string, rowOrParams: Record<string, string>): string | null {
  if (table === "exam_answer_keys" && rowOrParams.exam_code) {
    return `exam_key__${rowOrParams.exam_code}`;
  }
  if (table === "exam_attempts" && rowOrParams.exam_code && rowOrParams.student_code) {
    return `exam_attempt__${rowOrParams.exam_code}__${rowOrParams.student_code}`;
  }
  return null;
}

export async function sbSelect<T>(pathAndQuery: string): Promise<T[] | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
      headers: headers(),
      cache: "no-store",
    });
    if (res.ok) {
      return (await res.json()) as T[];
    }
  } catch {
    // fallback to state table or memory
  }

  const [table, queryStr] = pathAndQuery.split("?");
  if (table && table in memoryFallbackTables) {
    const params = new URLSearchParams(queryStr || "");
    const eqMap: Record<string, string> = {};
    for (const [k, v] of params.entries()) {
      if (v.startsWith("eq.")) eqMap[k] = v.slice(3);
    }
    const stateId = buildStateFallbackId(table, eqMap);
    if (stateId) {
      try {
        const stRes = await fetch(
          `${SUPABASE_URL}/rest/v1/platform_ssot_state?id=eq.${encodeURIComponent(stateId)}&select=identity_json`,
          { headers: headers(), cache: "no-store" }
        );
        if (stRes.ok) {
          const stRows = (await stRes.json()) as Array<{ identity_json?: T }>;
          if (stRows[0]?.identity_json) return [stRows[0].identity_json];
        }
      } catch {
        // continue to memory fallback
      }
    }
    const rows = memoryFallbackTables[table].filter((r) =>
      Object.entries(eqMap).every(([k, expected]) => String(r[k] ?? "") === expected)
    );
    return rows as unknown as T[];
  }
  return null;
}

async function saveToStateFallback(table: string, row: Record<string, unknown>): Promise<boolean> {
  const strMap: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === "string") strMap[k] = v;
  }
  const stateId = buildStateFallbackId(table, strMap);
  if (!stateId) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/platform_ssot_state?on_conflict=id`, {
      method: "POST",
      headers: headers("resolution=merge-duplicates,return=minimal"),
      body: JSON.stringify({ id: stateId, identity_json: row, updated_at: new Date().toISOString() }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sbInsert(
  table: string,
  row: Record<string, unknown>,
  onConflict?: string
): Promise<boolean> {
  if (table in memoryFallbackTables) {
    const list = memoryFallbackTables[table];
    const conflictCols = onConflict ? onConflict.split(",") : [];
    const existingIdx =
      conflictCols.length > 0
        ? list.findIndex((item) => conflictCols.every((c) => item[c] === row[c]))
        : -1;
    if (existingIdx >= 0) list[existingIdx] = { ...list[existingIdx], ...row };
    else list.push({ ...row });
  }

  try {
    const q = onConflict ? `?on_conflict=${onConflict}` : "";
    const prefer = onConflict
      ? "resolution=merge-duplicates,return=minimal"
      : "return=minimal";
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${q}`, {
      method: "POST",
      headers: headers(prefer),
      body: JSON.stringify(row),
    });
    if (res.ok) return true;
  } catch {
    // fallback below
  }
  if (table in memoryFallbackTables) {
    await saveToStateFallback(table, row);
    return true;
  }
  return false;
}

export async function sbInsertIgnore(
  table: string,
  row: Record<string, unknown>,
  onConflict: string
): Promise<boolean> {
  if (table in memoryFallbackTables) {
    const list = memoryFallbackTables[table];
    const conflictCols = onConflict.split(",");
    const exists = list.some((item) => conflictCols.every((c) => item[c] === row[c]));
    if (!exists) list.push({ ...row });
  }

  try {
    const q = `?on_conflict=${onConflict}`;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${q}`, {
      method: "POST",
      headers: headers("resolution=ignore-duplicates,return=minimal"),
      body: JSON.stringify(row),
    });
    if (res.ok) return true;
  } catch {
    // fallback below
  }
  if (table in memoryFallbackTables) {
    await saveToStateFallback(table, row);
    return true;
  }
  return false;
}

export async function sbPatch(
  pathAndQuery: string,
  patch: unknown
): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
      method: "PATCH",
      headers: headers("return=minimal"),
      body: JSON.stringify(patch),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function readCookieFromRequest(
  req: Request,
  name: string
): string | undefined {
  const raw = req.headers.get("cookie") || "";
  const hit = raw
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : undefined;
}
