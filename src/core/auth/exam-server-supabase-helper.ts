/**
 * @file exam-server-supabase-helper.ts
 * @description مساعد خادم فقط للتحدث مع Supabase بمفتاح الخدمة (مع ذاكرة خادم احتياطية قبل تفعيل جداول SQL الجديدة).
 * ممنوع استيراده من أي ملف "use client".
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 140 سطراً).
 */

export const MODULE_ID_EXAM_SERVER_SUPABASE_HELPER =
  "exam_server_supabase_helper" as const;

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ribcyosvoiwtrpynyzjp.supabase.co";

const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_-_NDzAmrswsChgitYYrIKw_iEmWYIqD";

const memoryFallbackTables: Record<string, Array<Record<string, unknown>>> = {
  exam_answer_keys: [],
  exam_attempts: [],
};

export function isServiceKeyConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SERVICE_KEY.length > 0;
}

function headers(prefer?: string): Record<string, string> {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
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
    // fallback to memory if network/table unavailable
  }

  const [table, queryStr] = pathAndQuery.split("?");
  if (table && table in memoryFallbackTables) {
    const params = new URLSearchParams(queryStr || "");
    const rows = memoryFallbackTables[table].filter((r) => {
      for (const [k, v] of params.entries()) {
        if (k === "select" || k === "order" || k === "limit") continue;
        if (v.startsWith("eq.")) {
          const expected = v.slice(3);
          if (String(r[k] ?? "") !== expected) return false;
        }
      }
      return true;
    });
    return rows as unknown as T[];
  }
  return null;
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
        ? list.findIndex((item) =>
            conflictCols.every((c) => item[c] === row[c])
          )
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
    return res.ok || table in memoryFallbackTables;
  } catch {
    return table in memoryFallbackTables;
  }
}

export async function sbInsertIgnore(
  table: string,
  row: Record<string, unknown>,
  onConflict: string
): Promise<boolean> {
  if (table in memoryFallbackTables) {
    const list = memoryFallbackTables[table];
    const conflictCols = onConflict.split(",");
    const exists = list.some((item) =>
      conflictCols.every((c) => item[c] === row[c])
    );
    if (!exists) list.push({ ...row });
  }

  try {
    const q = `?on_conflict=${onConflict}`;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${q}`, {
      method: "POST",
      headers: headers("resolution=ignore-duplicates,return=minimal"),
      body: JSON.stringify(row),
    });
    return res.ok || table in memoryFallbackTables;
  } catch {
    return table in memoryFallbackTables;
  }
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
