"use client";

/**
 * @file studio-mobile-pane-floating-switch.tsx
 * @description زر عائم لتبديل العرض في الهاتف بين «⚙️ إعداد وتوليد» و«📄 معاينة الورقة A4» (بند 6.5 من الدستور).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

export const MODULE_ID_STUDIO_MOBILE_PANE_FLOATING_SWITCH =
  "studio_mobile_pane_floating_switch" as const;

export type StudioActivePane = "builder" | "preview";

export interface StudioMobilePaneFloatingSwitchProps {
  readonly activePane: StudioActivePane;
  readonly onChangePane: (pane: StudioActivePane) => void;
}

export default function StudioMobilePaneFloatingSwitch({
  activePane,
  onChangePane,
}: StudioMobilePaneFloatingSwitchProps) {
  const isBuilder = activePane === "builder";
  return (
    <button
      type="button"
      onClick={() => onChangePane(isBuilder ? "preview" : "builder")}
      className="fixed z-40 bottom-24 left-4 md:bottom-6 min-h-[48px] px-5 rounded-full bg-indigo-900 text-white shadow-xl text-xs font-black flex items-center gap-2 cursor-pointer active:scale-95"
    >
      <span>{isBuilder ? "📄" : "⚙️"}</span>
      <span>{isBuilder ? "معاينة الورقة A4" : "إعداد وتوليد"}</span>
    </button>
  );
}
