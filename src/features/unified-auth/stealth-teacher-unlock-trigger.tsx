"use client";

/**
 * @file stealth-teacher-unlock-trigger.tsx
 * @description خاصية ذرية مستقلة: البوابة الخفية للمعلم المالك الوحيد للمنصة.
 * لا يظهر أي زر "دخول المعلم" للطلاب؛ يتم التفعيل عبر نقر شعار (∑) 5 مرات متتالية
 * أو كتابة البادئة السرية في حقل كود الطالب، فينبثق حقل المفتاح السري للمعلم المالك.
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
  readonly onTeacherAuthenticated: (masterPasskey: string) => void;
}

export default function StealthTeacherUnlockTrigger({
  isUnlocked,
  onUnlockSuccess,
  onTeacherAuthenticated,
}: StealthTeacherUnlockTriggerProps) {
  const [clickCount, setClickCount] = useState(0);
  const [passkey, setPasskey] = useState("");
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

  return (
    <div className="flex flex-col items-center">
      {/* الشعار الرياضي ∑ الذي يعمل كبوابة سرية عند النقر الخماسي */}
      <div
        onClick={handleEmblemClick}
        className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-700 to-teal-600 text-white flex items-center justify-center text-3xl font-black shadow-lg select-none mb-3 overflow-hidden cursor-pointer"
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
        <div className="w-full mt-3 p-4 rounded-2xl border-2 border-amber-500/40 bg-amber-50/60 dark:bg-amber-950/30 space-y-2.5">
          <p className="text-xs font-black text-amber-800 dark:text-amber-300">
            🔐 بوابة المعلم المالك الخاصة
          </p>
          <input
            type="password"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            placeholder="أدخل مفتاح المالك السري..."
            className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-xs font-bold"
          />
          <button
            type="button"
            onClick={() => onTeacherAuthenticated(passkey)}
            className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black cursor-pointer"
          >
            فتح استوديو المعلم المالك
          </button>
        </div>
      )}
    </div>
  );
}
