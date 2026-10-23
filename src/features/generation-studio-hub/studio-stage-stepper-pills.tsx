"use client";

/**
 * @file studio-stage-stepper-pills.tsx
 * @description شريط خطوات المراحل (١ ← ٢ ← ٣) بدوائر مرقمة وعلامة ✓ عند اكتمال لصق رد المرحلة؛
 * يعرض مرحلة واحدة نشطة في كل مرة لتقليل الزحام، ويدعم المرحلة الاختيارية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

export const MODULE_ID_STUDIO_STAGE_STEPPER_PILLS =
  "studio_stage_stepper_pills" as const;

export interface StudioStageStepItem {
  readonly stageNum: number;
  readonly shortTitleAr: string;
  readonly isFilled: boolean;
  readonly isOptional?: boolean;
}

export interface StudioStageStepperPillsProps {
  readonly steps: readonly StudioStageStepItem[];
  readonly activeStageNum: number;
  readonly onSelectStage: (stageNum: number) => void;
}

export default function StudioStageStepperPills({
  steps,
  activeStageNum,
  onSelectStage,
}: StudioStageStepperPillsProps) {
  return (
    <div
      role="tablist"
      aria-label="مراحل التوليد"
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      {steps.map((step) => {
        const isActive = step.stageNum === activeStageNum;
        return (
          <button
            key={step.stageNum}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectStage(step.stageNum)}
            className={`min-h-[56px] px-1.5 py-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
              isActive
                ? "border-teal-600 bg-teal-50 dark:bg-teal-950/30"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                step.isFilled
                  ? "bg-emerald-500 text-white"
                  : isActive
                    ? "bg-teal-700 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {step.isFilled ? "✓" : step.stageNum}
            </span>
            <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-tight text-center">
              {step.shortTitleAr}
            </span>
            {step.isOptional && !step.isFilled && (
              <span className="text-[9px] font-bold text-slate-400">اختيارية</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
