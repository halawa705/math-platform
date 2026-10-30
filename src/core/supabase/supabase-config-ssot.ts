/**
 * @file supabase-config-ssot.ts
 * @description المصدر الوحيد لرابط ومفتاح Supabase العام (كان مكرراً في 5 ملفات).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 50 سطراً).
 */
export const MODULE_ID_SUPABASE_CONFIG_SSOT = "supabase_config_ssot" as const;

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ribcyosvoiwtrpynyzjp.supabase.co";

export const SUPABASE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_-_NDzAmrswsChgitYYrIKw_iEmWYIqD";
