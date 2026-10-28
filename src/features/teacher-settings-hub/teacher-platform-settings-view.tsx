"use client";

/**
 * @file teacher-platform-settings-view.tsx
 * @description مركز إعدادات المعلم (`/settings`) بتصميم هادئ: أقسام قابلة للطي (الشعار، بيانات المعلم، الصفوف، روابط NotebookLM)
 * تُحفظ تلقائياً كمصدر وحيد للحقيقة (SSOT) مع زر حفظ واحد أسفل الصفحة.
 */

import { useEffect, useState } from "react";
import TopFourCentersNavigationBar from "@/components/global-ui/top-four-centers-navigation-bar";
import CalmPageTitleHeader from "@/components/global-ui/calm-page-title-header";
import StudioCollapsibleSectionCard from "@/features/generation-studio-hub/studio-collapsible-section-card";
import {
  DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
  loadTeacherIdentitySSOT,
  refreshTeacherIdentityFromSupabaseSSOT,
  saveTeacherIdentitySSOT,
  type OwnerTeacherIdentity,
} from "@/core/ssot/teacher-identity-ssot";
import SettingsPlatformLogoSection from "./settings-platform-logo-section";
import SettingsTeacherIdentitySection from "./settings-teacher-identity-section";
import SettingsEnabledGradesSection from "./settings-enabled-grades-section";
import SettingsNotebooklmLinksSection from "./settings-notebooklm-links-section";

export const MODULE_ID_TEACHER_PLATFORM_SETTINGS_VIEW =
  "teacher_platform_settings_view" as const;

export default function TeacherPlatformSettingsView() {
  const [identity, setIdentity] = useState<OwnerTeacherIdentity>(
    DEFAULT_OWNER_TEACHER_IDENTITY_SSOT
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    setIdentity(loadTeacherIdentitySSOT());
    void refreshTeacherIdentityFromSupabaseSSOT().then((synced) => setIdentity(synced));
  }, []);

  const applyAndPersist = (next: OwnerTeacherIdentity) => {
    setIdentity(next);
    saveTeacherIdentitySSOT(next);
  };

  const handleSave = () => {
    if (saveTeacherIdentitySSOT(identity)) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden pb-28 md:pb-12 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100"
    >
      <TopFourCentersNavigationBar activeCenter="settings" />

      <main className="max-w-3xl mx-auto px-3 sm:px-5 pt-4 space-y-3">
        <CalmPageTitleHeader
          titleAr="الإعدادات والصفوف"
          hintAr="كل تعديل يُحفظ فوراً وينعكس في الشريط العلوي والتذييل والمطبوعات"
        />

        <StudioCollapsibleSectionCard
          icon="🛡️"
          titleAr="شعار المنصة"
          summaryAr={identity.platformBrandName}
          defaultOpen
        >
          <SettingsPlatformLogoSection identity={identity} onChange={applyAndPersist} />
        </StudioCollapsibleSectionCard>

        <StudioCollapsibleSectionCard
          icon="👤"
          titleAr="بيانات المعلم والمطبوعات"
          summaryAr={identity.teacherFullName}
        >
          <SettingsTeacherIdentitySection identity={identity} onChange={applyAndPersist} />
        </StudioCollapsibleSectionCard>

        <StudioCollapsibleSectionCard
          icon="🎓"
          titleAr="الصفوف الدراسية"
          summaryAr={`${identity.enabledGradeIds.length} صفوف مفعّلة هذا العام`}
        >
          <SettingsEnabledGradesSection identity={identity} onChange={applyAndPersist} />
        </StudioCollapsibleSectionCard>

        <StudioCollapsibleSectionCard
          icon="📘"
          titleAr="روابط دفاتر NotebookLM"
          summaryAr="رابط واحد لكل صف مفعّل"
        >
          <SettingsNotebooklmLinksSection identity={identity} onChange={applyAndPersist} />
        </StudioCollapsibleSectionCard>

        <button
          type="button"
          onClick={handleSave}
          className="w-full min-h-[48px] rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-black cursor-pointer"
        >
          {isSaved ? "✓ تم الحفظ" : "حفظ الإعدادات"}
        </button>
      </main>
    </div>
  );
}
