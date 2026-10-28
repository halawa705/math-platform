"use client";

/**
 * @file settings-platform-logo-section.tsx
 * @description قسم شعار المنصة في الإعدادات: معاينة، رفع صورة، رابط مباشر، أو اختيار رمز.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import type { ChangeEvent } from "react";
import CalmLabeledInputField from "@/components/global-ui/calm-labeled-input-field";
import type { OwnerTeacherIdentity } from "@/core/ssot/teacher-identity-ssot";
import { compressImageFileToDataUrl } from "./logo-image-compression-util";

export const MODULE_ID_SETTINGS_PLATFORM_LOGO_SECTION =
  "settings_platform_logo_section" as const;

const LOGO_SYMBOL_PRESETS = ["🛡️", "🐎", "∑", "👑", "📐", "🏆"] as const;

export interface SettingsPlatformLogoSectionProps {
  readonly identity: OwnerTeacherIdentity;
  readonly onChange: (next: OwnerTeacherIdentity) => void;
}

export default function SettingsPlatformLogoSection({
  identity,
  onChange,
}: SettingsPlatformLogoSectionProps) {
  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImageFileToDataUrl(file, 256);
    if (dataUrl) onChange({ ...identity, platformLogoUrl: dataUrl });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl font-black overflow-hidden shrink-0">
          {identity.platformLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={identity.platformLogoUrl} alt="شعار المنصة" className="w-full h-full object-cover" />
          ) : (
            <span>{identity.platformLogoSymbol || "🛡️"}</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center min-h-[44px] px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black cursor-pointer">
            رفع صورة
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
          {identity.platformLogoUrl && (
            <button
              type="button"
              onClick={() => onChange({ ...identity, platformLogoUrl: "" })}
              className="min-h-[44px] px-3 rounded-xl text-xs font-black text-rose-600 cursor-pointer"
            >
              حذف الصورة
            </button>
          )}
        </div>
      </div>

      <div>
        <span className="block text-[11px] font-bold text-slate-500 mb-1.5">
          أو اختر رمزاً (عند عدم وجود صورة)
        </span>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {LOGO_SYMBOL_PRESETS.map((sym) => {
            const isOn = !identity.platformLogoUrl && identity.platformLogoSymbol === sym;
            return (
              <button
                key={sym}
                type="button"
                onClick={() => onChange({ ...identity, platformLogoUrl: "", platformLogoSymbol: sym })}
                className={`w-11 h-11 shrink-0 rounded-xl border text-base flex items-center justify-center cursor-pointer ${
                  isOn
                    ? "border-slate-900 dark:border-slate-100 bg-slate-100 dark:bg-slate-800"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                {sym}
              </button>
            );
          })}
        </div>
      </div>

      <CalmLabeledInputField
        labelAr="أو رابط مباشر لصورة الشعار (اختياري)"
        isLtr
        placeholder="https://example.com/logo.png"
        value={identity.platformLogoUrl.startsWith("data:") ? "" : identity.platformLogoUrl}
        onChange={(v) => onChange({ ...identity, platformLogoUrl: v })}
      />
    </div>
  );
}
