import { describe, it, expect, beforeEach } from "vitest";
import {
  loadStudioGlobalContextSSOT,
  saveStudioGlobalContextSSOT,
  loadStudioBookletSettingsSSOT,
  saveStudioBookletSettingsSSOT,
  loadStudioExamSettingsSSOT,
  saveStudioExamSettingsSSOT,
  loadStudioReviewSettingsSSOT,
  saveStudioReviewSettingsSSOT,
  loadStudioWorksheetSettingsSSOT,
  saveStudioWorksheetSettingsSSOT,
  clearStudioStateStorageSSOT,
  DEFAULT_STUDIO_GLOBAL_CONTEXT,
  DEFAULT_STUDIO_BOOKLET_SETTINGS,
} from "@/core/ssot/studio-state-persistence-ssot";

describe("Studio State Persistence SSOT — Browser State Memory", () => {
  beforeEach(() => {
    clearStudioStateStorageSSOT();
  });

  it("returns default values when storage is empty", () => {
    const globalState = loadStudioGlobalContextSSOT();
    expect(globalState.activeTabId).toBe(DEFAULT_STUDIO_GLOBAL_CONTEXT.activeTabId);
    expect(globalState.gradeId).toBe(DEFAULT_STUDIO_GLOBAL_CONTEXT.gradeId);
    expect(globalState.unitTitle).toBe(DEFAULT_STUDIO_GLOBAL_CONTEXT.unitTitle);
    expect(globalState.lessonTitle).toBe(DEFAULT_STUDIO_GLOBAL_CONTEXT.lessonTitle);

    const bookletState = loadStudioBookletSettingsSSOT();
    expect(bookletState.examplesPerIdea).toBe(DEFAULT_STUDIO_BOOKLET_SETTINGS.examplesPerIdea);
    expect(bookletState.drillsPerIdea).toBe(DEFAULT_STUDIO_BOOKLET_SETTINGS.drillsPerIdea);
    expect(bookletState.hwMcq).toBe(DEFAULT_STUDIO_BOOKLET_SETTINGS.hwMcq);
    expect(bookletState.hwEssay).toBe(DEFAULT_STUDIO_BOOKLET_SETTINGS.hwEssay);
  });

  it("persists and updates global studio context across calls", () => {
    saveStudioGlobalContextSSOT({
      gradeId: "prep-1",
      unitTitle: "الوحدة الثالثة: الهندسة والقياس",
      lessonTitle: "أنواع الزوايا والعلاقات بين الزوايا",
      lessonOrder: 1,
      activeTabId: "booklet",
    });

    const updated = loadStudioGlobalContextSSOT();
    expect(updated.gradeId).toBe("prep-1");
    expect(updated.unitTitle).toBe("الوحدة الثالثة: الهندسة والقياس");
    expect(updated.lessonTitle).toBe("أنواع الزوايا والعلاقات بين الزوايا");
    expect(updated.lessonOrder).toBe(1);
    expect(updated.activeTabId).toBe("booklet");
  });

  it("persists booklet question counts and toggle flags", () => {
    saveStudioBookletSettingsSSOT({
      examplesPerIdea: 3,
      examplesEnabled: true,
      drillsPerIdea: 1,
      drillsEnabled: false,
      hwMcq: 0,
      hwMcqEnabled: false,
      hwEssay: 4,
      hwEssayEnabled: true,
    });

    const updated = loadStudioBookletSettingsSSOT();
    expect(updated.examplesPerIdea).toBe(3);
    expect(updated.drillsEnabled).toBe(false);
    expect(updated.hwMcqEnabled).toBe(false);
    expect(updated.hwEssay).toBe(4);
    expect(updated.hwEssayEnabled).toBe(true);
  });

  it("persists exam settings, online mode, and difficulty", () => {
    saveStudioExamSettingsSSOT({
      mcqCount: 10,
      mcqEnabled: true,
      proofCount: 0,
      proofEnabled: false,
      isOnlineMode: true,
      difficulty: "olympiad_challenge",
    });

    const exam = loadStudioExamSettingsSSOT();
    expect(exam.mcqCount).toBe(10);
    expect(exam.proofEnabled).toBe(false);
    expect(exam.isOnlineMode).toBe(true);
    expect(exam.difficulty).toBe("olympiad_challenge");
  });

  it("persists review and worksheet settings", () => {
    saveStudioReviewSettingsSSOT({
      scope: "monthly_revision",
      mcqCount: 20,
      essayCount: 5,
    });
    expect(loadStudioReviewSettingsSSOT().scope).toBe("monthly_revision");
    expect(loadStudioReviewSettingsSSOT().mcqCount).toBe(20);

    saveStudioWorksheetSettingsSSOT({
      mcqCount: 8,
      essayCount: 3,
      durationMinutes: 30,
    });
    expect(loadStudioWorksheetSettingsSSOT().durationMinutes).toBe(30);
    expect(loadStudioWorksheetSettingsSSOT().mcqCount).toBe(8);
  });
});
