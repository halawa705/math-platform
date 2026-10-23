import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * @file route.ts
 * @description أداة إبقاء قاعدة بيانات Supabase نشطة دائماً (Keep-Alive Heartbeat) لمنصة الرياضيات.
 * يتم استدعاؤها يومياً تلقائياً عبر Vercel Cron لمنع إيقاف المشروع المجاني بعد 7 أيام من عدم الدخول.
 */
export async function GET() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://ribcyosvoiwtrpynyzjp.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_-_NDzAmrswsChgitYYrIKw_iEmWYIqD";

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your-project-id")) {
    return NextResponse.json({
      ok: true,
      mode: "LOCAL_SSOT_STANDBY",
      message: "منصة الرياضيات جاهزة؛ سيتم تفعيل نبضة Supabase فور إضافة مفاتيح الربط في Vercel.",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const res = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      cache: "no-store",
    });

    return NextResponse.json({
      ok: res.ok,
      status: "SUPABASE_HEARTBEAT_ALIVE",
      httpStatus: res.status,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Heartbeat ping failed" },
      { status: 500 }
    );
  }
}
