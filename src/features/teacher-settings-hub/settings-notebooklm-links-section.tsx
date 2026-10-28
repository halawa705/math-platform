"use client";

/**
 * @file settings-notebooklm-links-section.tsx
 * @description قسم ربط كل صف مفعّل برابط دفتر NotebookLM الخاص به.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import CalmLabeledInputField from "@/components/global-ui/calm-labeled-input-field";
import { EGYPTIAN_MATH_GRADES_SSOT } from "@/core/ssot/curriculum-hierarchy-ssot";
import type { OwnerTeacherIdentity } from "@/core/ssot/teacher-identity-ssot";

export const MODULE_ID_SETTINGS_NOTEBOOKLM_LINKS_SECTION =
  "settings_notebooklm_links_section" as const;

export interface SettingsNotebooklmLinksSectionProps {
  readonly identity: OwnerTeacherIdentity;
  readonly onChange: (next: OwnerTeacherIdentity) => void;
}

export default function SettingsNotebooklmLinksSection({
  identity,
  onChange,
}: SettingsNotebooklmLinksSectionProps) {
  const enabledGrades = EGYPTIAN_MATH_GRADES_SSOT.filter((g) =>
    identity.enabledGradeIds.includes(g.id)
  );

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold text-slate-500">
        زر «نسخ البرومبت وفتح NotebookLM» في أي أداة سيفتح رابط دفتر الصف تلقائياً.
      </p>
      {enabledGrades.map((grade) => (
        <CalmLabeledInputField
          key={grade.id}
          inputType="url"
          isLtr
          labelAr={grade.nameArabic}
          placeholder="https://notebooklm.google.com/notebook/..."
          value={identity.notebookLmUrlsByGrade[grade.id] || ""}
          onChange={(url) =>
            onChange({
              ...identity,
              notebookLmUrlsByGrade: { ...identity.notebookLmUrlsByGrade, [grade.id]: url },
            })
          }
        />
      ))}
    </div>
  );
}
