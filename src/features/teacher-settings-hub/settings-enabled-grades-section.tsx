"use client";

/**
 * @file settings-enabled-grades-section.tsx
 * @description قسم تفعيل الصفوف الدراسية لهذا العام: شرائح اختيار هادئة (لا يُسمح بإلغاء آخر صف مفعّل).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { EGYPTIAN_MATH_GRADES_SSOT } from "@/core/ssot/curriculum-hierarchy-ssot";
import type { OwnerTeacherIdentity } from "@/core/ssot/teacher-identity-ssot";

export const MODULE_ID_SETTINGS_ENABLED_GRADES_SECTION =
  "settings_enabled_grades_section" as const;

export interface SettingsEnabledGradesSectionProps {
  readonly identity: OwnerTeacherIdentity;
  readonly onChange: (next: OwnerTeacherIdentity) => void;
}

export default function SettingsEnabledGradesSection({
  identity,
  onChange,
}: SettingsEnabledGradesSectionProps) {
  const toggleGrade = (gradeId: string) => {
    const exists = identity.enabledGradeIds.includes(gradeId);
    const updated = exists
      ? identity.enabledGradeIds.filter((id) => id !== gradeId)
      : [...identity.enabledGradeIds, gradeId];
    if (updated.length === 0) return;
    onChange({ ...identity, enabledGradeIds: updated });
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold text-slate-500">
        الصفوف غير المحددة تختفي من الاستوديو والامتحانات وتسجيل الطلاب.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {EGYPTIAN_MATH_GRADES_SSOT.map((grade) => {
          const isOn = identity.enabledGradeIds.includes(grade.id);
          return (
            <button
              key={grade.id}
              type="button"
              aria-pressed={isOn}
              onClick={() => toggleGrade(grade.id)}
              className={`min-h-[44px] px-3 rounded-xl border text-xs font-black text-right flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                isOn
                  ? "border-slate-900 dark:border-slate-200 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "border-slate-200 dark:border-slate-800 text-slate-500"
              }`}
            >
              <span>{grade.nameArabic}</span>
              <span className="text-[11px]">{isOn ? "✓" : ""}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
