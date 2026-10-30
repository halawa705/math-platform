/**
 * @file studio-state-persistence-ssot.ts
 * @description المصدر الوحيد لحفظ واسترجاع الحالة الأخيرة للاستوديو وتوجيهات المعلم عبر التخزين المحلي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 175 سطراً).
 */

import type { MathBranchId } from "./math-branches-ssot";
import type { BookletPromptStageNumber } from "../prompts/booklet-three-stages-prompt-builder";
import type { FinalReviewScopeKind, FinalReviewStageNumber } from "../prompts/final-review-prompt-builder";

export const MODULE_ID_STUDIO_STATE_PERSISTENCE_SSOT = "studio_state_persistence_ssot" as const;

const KEYS = {
  GLOBAL: "math_platform_studio_global_context_v1",
  BOOKLET: "math_platform_studio_booklet_settings_v1",
  EXAM: "math_platform_studio_exam_settings_v1",
  REVIEW: "math_platform_studio_review_settings_v1",
  WORKSHEET: "math_platform_studio_worksheet_settings_v1",
} as const;

const inMemoryFallback = new Map<string, string>();
const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = isBrowser() ? window.localStorage.getItem(key) : inMemoryFallback.get(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function safeSet<T>(key: string, value: T): void {
  try {
    const s = JSON.stringify(value);
    if (isBrowser()) window.localStorage.setItem(key, s);
    inMemoryFallback.set(key, s);
  } catch { /* quota error */ }
}

export function clearStudioStateStorageSSOT(): void {
  inMemoryFallback.clear();
  if (isBrowser()) {
    try { Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k)); } catch { /* ignore */ }
  }
}

export interface StudioGlobalContextState {
  readonly activeTabId: string;
  readonly gradeId: string;
  readonly branchId: MathBranchId;
  readonly unitTitle: string;
  readonly lessonTitle: string;
  readonly lessonOrder: number;
  readonly sheetTitle: string;
}

export const DEFAULT_STUDIO_GLOBAL_CONTEXT: StudioGlobalContextState = {
  activeTabId: "booklet", gradeId: "prep-3", branchId: "plane_geometry",
  unitTitle: "الوحدة الثالثة", lessonTitle: "تشابه المضلعات", lessonOrder: 15,
  sheetTitle: "15 - 3ع - الوحدة الثالثة - تشابه المضلعات",
};

export const loadStudioGlobalContextSSOT = (): StudioGlobalContextState => safeGet(KEYS.GLOBAL, DEFAULT_STUDIO_GLOBAL_CONTEXT);
export const saveStudioGlobalContextSSOT = (updates: Partial<StudioGlobalContextState>): StudioGlobalContextState => {
  const next = { ...loadStudioGlobalContextSSOT(), ...updates };
  safeSet(KEYS.GLOBAL, next);
  return next;
};

export interface StudioBookletSettingsState {
  readonly activeStage: BookletPromptStageNumber;
  readonly examplesPerIdea: number;
  readonly examplesEnabled: boolean;
  readonly drillsPerIdea: number;
  readonly drillsEnabled: boolean;
  readonly hwMcq: number;
  readonly hwMcqEnabled: boolean;
  readonly hwEssay: number;
  readonly hwEssayEnabled: boolean;
  readonly customDirectives?: string;
}

export const DEFAULT_STUDIO_BOOKLET_SETTINGS: StudioBookletSettingsState = {
  activeStage: 1, examplesPerIdea: 2, examplesEnabled: true, drillsPerIdea: 2,
  drillsEnabled: true, hwMcq: 4, hwMcqEnabled: true, hwEssay: 2, hwEssayEnabled: true, customDirectives: "",
};

export const loadStudioBookletSettingsSSOT = (): StudioBookletSettingsState => safeGet(KEYS.BOOKLET, DEFAULT_STUDIO_BOOKLET_SETTINGS);
export const saveStudioBookletSettingsSSOT = (updates: Partial<StudioBookletSettingsState>): StudioBookletSettingsState => {
  const next = { ...loadStudioBookletSettingsSSOT(), ...updates };
  safeSet(KEYS.BOOKLET, next);
  return next;
};

export interface StudioExamSettingsState {
  readonly mcqCount: number;
  readonly mcqEnabled: boolean;
  readonly proofCount: number;
  readonly proofEnabled: boolean;
  readonly isOnlineMode: boolean;
  readonly difficulty: "standard_balanced" | "olympiad_challenge";
  readonly customDirectives?: string;
}

export const DEFAULT_STUDIO_EXAM_SETTINGS: StudioExamSettingsState = {
  mcqCount: 6, mcqEnabled: true, proofCount: 3, proofEnabled: true, isOnlineMode: false, difficulty: "standard_balanced", customDirectives: "",
};

export const loadStudioExamSettingsSSOT = (): StudioExamSettingsState => safeGet(KEYS.EXAM, DEFAULT_STUDIO_EXAM_SETTINGS);
export const saveStudioExamSettingsSSOT = (updates: Partial<StudioExamSettingsState>): StudioExamSettingsState => {
  const next = { ...loadStudioExamSettingsSSOT(), ...updates };
  safeSet(KEYS.EXAM, next);
  return next;
};

export interface StudioReviewSettingsState {
  readonly scope: FinalReviewScopeKind;
  readonly activeStage: FinalReviewStageNumber;
  readonly mcqCount: number;
  readonly mcqEnabled: boolean;
  readonly essayCount: number;
  readonly essayEnabled: boolean;
  readonly customDirectives?: string;
}

export const DEFAULT_STUDIO_REVIEW_SETTINGS: StudioReviewSettingsState = {
  scope: "final_exam_night_capsule", activeStage: 1, mcqCount: 15, mcqEnabled: true, essayCount: 8, essayEnabled: true, customDirectives: "",
};

export const loadStudioReviewSettingsSSOT = (): StudioReviewSettingsState => safeGet(KEYS.REVIEW, DEFAULT_STUDIO_REVIEW_SETTINGS);
export const saveStudioReviewSettingsSSOT = (updates: Partial<StudioReviewSettingsState>): StudioReviewSettingsState => {
  const next = { ...loadStudioReviewSettingsSSOT(), ...updates };
  safeSet(KEYS.REVIEW, next);
  return next;
};

export interface StudioWorksheetSettingsState {
  readonly mcqCount: number;
  readonly mcqEnabled: boolean;
  readonly essayCount: number;
  readonly essayEnabled: boolean;
  readonly durationMinutes: number;
  readonly customDirectives?: string;
}

export const DEFAULT_STUDIO_WORKSHEET_SETTINGS: StudioWorksheetSettingsState = {
  mcqCount: 5, mcqEnabled: true, essayCount: 2, essayEnabled: true, durationMinutes: 20, customDirectives: "",
};

export const loadStudioWorksheetSettingsSSOT = (): StudioWorksheetSettingsState => safeGet(KEYS.WORKSHEET, DEFAULT_STUDIO_WORKSHEET_SETTINGS);
export const saveStudioWorksheetSettingsSSOT = (updates: Partial<StudioWorksheetSettingsState>): StudioWorksheetSettingsState => {
  const next = { ...loadStudioWorksheetSettingsSSOT(), ...updates };
  safeSet(KEYS.WORKSHEET, next);
  return next;
};
