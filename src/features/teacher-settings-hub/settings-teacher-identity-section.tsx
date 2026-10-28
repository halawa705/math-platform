"use client";

/**
 * @file settings-teacher-identity-section.tsx
 * @description قسم بيانات المعلم والمنصة: الاسم، اللقب، الهاتف، التذييل، العلامة المائية، وكود الدخول السري.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import CalmLabeledInputField from "@/components/global-ui/calm-labeled-input-field";
import type { OwnerTeacherIdentity } from "@/core/ssot/teacher-identity-ssot";

export const MODULE_ID_SETTINGS_TEACHER_IDENTITY_SECTION =
  "settings_teacher_identity_section" as const;

export interface SettingsTeacherIdentitySectionProps {
  readonly identity: OwnerTeacherIdentity;
  readonly onChange: (next: OwnerTeacherIdentity) => void;
}

export default function SettingsTeacherIdentitySection({
  identity,
  onChange,
}: SettingsTeacherIdentitySectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <CalmLabeledInputField
        labelAr="اسم المنصة أو السنتر"
        value={identity.platformBrandName}
        onChange={(v) => onChange({ ...identity, platformBrandName: v })}
      />
      <CalmLabeledInputField
        labelAr="اسم المعلم"
        value={identity.teacherFullName}
        onChange={(v) => onChange({ ...identity, teacherFullName: v })}
      />
      <CalmLabeledInputField
        labelAr="اسم الشهرة / اللقب"
        placeholder="مثال: عميد الرياضيات"
        value={identity.teacherNickname}
        onChange={(v) => onChange({ ...identity, teacherNickname: v })}
      />
      <CalmLabeledInputField
        labelAr="رقم الهاتف / الواتساب (يظهر في ترويسة المذكرات)"
        value={identity.teacherPhone}
        onChange={(v) => onChange({ ...identity, teacherPhone: v })}
      />
      <div className="sm:col-span-2">
        <CalmLabeledInputField
          labelAr="نص التذييل الموحد (أسفل صفحات المنصة والمطبوعات)"
          value={identity.footerText}
          onChange={(v) => onChange({ ...identity, footerText: v })}
        />
      </div>
      <CalmLabeledInputField
        labelAr="العلامة المائية للمطبوعات"
        value={identity.watermarkText}
        onChange={(v) => onChange({ ...identity, watermarkText: v })}
      />
      <CalmLabeledInputField
        labelAr="🔐 كود الدخول السري للمعلم"
        placeholder="مثال: 19842026 أو اسم سري خاص بك"
        value={identity.customSecretLoginCode}
        onChange={(v) => onChange({ ...identity, customSecretLoginCode: v })}
      />
    </div>
  );
}
