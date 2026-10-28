"use client";

/**
 * @file stealth-teacher-unlock-trigger.tsx
 * @description خاصية ذرية مستقلة: البوابة الخفية للمعلم المالك الوحيد للمنصة.
 * لا يظهر أي زر "دخول المعلم" للطلاب؛ يتم التفعيل عبر نقر شعار (∑) 5 مرات متتالية
 * أو كتابة البادئة السرية في حقل كود الطالب، فينبثق حقل الدخول للمعلم المالك (halawa / 123451).
 * يتحقق مباشرة عبر نقطة الخادم الآمنة `/api/auth/teacher-login`.
 */

import { useEffect, useState } from "react";
import {
  DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
  IDENTITY_UPDATED_EVENT_NAME,
  loadTeacherIdentitySSOT,
} from "@/core/ssot/teacher-identity-ssot";

export interface StealthTeacherUnlockTriggerProps {
  readonly isUnlocked: boolean;
  readonly onUnlockSuccess: () => void;
  readonly onTeacherAuthenticated: () => void;
}

export default function StealthTeacherUnlockTrigger({
  isUnlocked,
  onUnlockSuccess,
  onTeacherAuthenticated,
}: StealthTeacherUnlockTriggerProps) {
  const [clickCount, setClickCount] = useState(0);
  const [username, setUsername] = useState("halawa");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [identity, setIdentity] = useState(DEFAULT_OWNER_TEACHER_IDENTITY_SSOT);

  useEffect(() => {
    setIdentity(loadTeacherIdentitySSOT());
    const sync = () => setIdentity(loadTeacherIdentitySSOT());
    window.addEventListener(IDENTITY_UPDATED_EVENT_NAME, sync);
    return () => window.removeEventListener(IDENTITY_UPDATED_EVENT_NAME, sync);
  }, []);

  const handleEmblemClick = () => {
    const next = clickCount + 1;
    if (next >= DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.stealthEmblemClicksRequired) {
      setClickCount(0);
      onUnlockSuccess();
    } else {
      setClickCount(next);
    }
  };

  const handleTeacherSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    if (!password.trim()) {
      setAuthError("يرجى إدخال كلمة المرور");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/teacher-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = (await res.json()) as { success: boolean; error?: string };
      if (res.ok && data.success) {
        onTeacherAuthenticated();
      } else {
        setAuthError(data.error || "بيانات الدخول غير صحيحة");
      }
    } catch {
      setAuthError("تعذر التحقق من الخادم، يرجى المحاولة لاحقاً");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* الشعار الرياضي ∑ الذي يعمل كبوابة سرية عند النقر الخماسي */}
      <div
        onClick={handleEmblemClick}
        className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-700 to-teal-600 text-white flex items-center justify-center text-3xl font-black shadow-lg select-none mb-3 overflow-hidden cursor-pointer hover:scale-105 active:scale-95 transition-transform"
      >
        {identity.platformLogoUrl ? (
          <img
            src={identity.platformLogoUrl}
            alt={identity.platformBrandName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{identity.platformLogoSymbol || "🛡️"}</span>
        )}
      </div>

      {isUnlocked && (
        <form
          onSubmit={handleTeacherSubmit}
          className="w-full mt-3 p-4 rounded-2xl border-2 border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/40 space-y-2.5 shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-amber-900 dark:text-amber-200">
              🔐 بوابة المعلم المالك الحصري
            </p>
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
              أ/ إسلام حلاوة
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="اسم المستخدم (halawa)..."
              className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور (123451)..."
              autoFocus
              className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          {authError && (
            <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
              ⚠️ {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-black cursor-pointer transition disabled:opacity-50"
          >
            {isSubmitting ? "جاري التحقق الآمن..." : "فتح استوديو المعلم المالك ⬅"}
          </button>
        </form>
      )}
    </div>
  );
}
