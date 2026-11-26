/**
 * @file exam-forms-demographic-blueprint-builder.ts
 * @description حاسبة التوزيع الديموجرافي المتوازن للأسئلة (اختر ومقالي معاً) على الدروس ومستويات الصعوبة المتكافئة أو المتدرجة للنماذج بصيغة مضغوطة لحدود NotebookLM.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 160 سطراً).
 */

import type { CurriculumLessonNode, CurriculumUnitNode } from "../ssot/curriculum-hierarchy-ssot";
import type {
  ExamFormsDifficultyProfile,
  ExamFormsProgressionMode,
  ExamFormsScopeKind,
} from "../ssot/studio-state-persistence-ssot";
import type { UnitFocusWeightItem } from "@/features/generation-studio-hub/studio-curriculum-units-checklist";
import { getArabicFormLetter } from "../pdf-layout-engine/printable-exam-forms-model";

export const MODULE_ID_EXAM_FORMS_DEMOGRAPHIC_BLUEPRINT_BUILDER =
  "exam_forms_demographic_blueprint_builder" as const;

export interface ResolvedTargetedLessonInfo {
  readonly lessonTitleArabic: string;
  readonly unitTitleArabic: string;
  readonly coreConcepts: readonly string[];
}

export interface DemographicBlueprintParams {
  readonly units?: readonly CurriculumUnitNode[];
  readonly selectedUnitIds?: readonly string[];
  readonly selectedLessonIds?: readonly string[];
  readonly scopeKind?: ExamFormsScopeKind;
  readonly scopeDescriptionArabic?: string;
  readonly formsCount: number;
  readonly mcqCount: number;
  readonly essayCount: number;
  readonly difficultyProfile: ExamFormsDifficultyProfile;
  readonly progressionMode?: ExamFormsProgressionMode;
  readonly unitFocusWeights?: readonly UnitFocusWeightItem[];
}

export function resolveTargetedLessonsForBlueprint(params: {
  readonly units?: readonly CurriculumUnitNode[];
  readonly selectedUnitIds?: readonly string[];
  readonly selectedLessonIds?: readonly string[];
  readonly scopeKind?: ExamFormsScopeKind;
  readonly scopeDescriptionArabic?: string;
}): readonly ResolvedTargetedLessonInfo[] {
  const units = params.units ?? [];
  const selectedUnitIds = params.selectedUnitIds ?? [];
  const selectedLessonIds = params.selectedLessonIds ?? [];
  const resolved: ResolvedTargetedLessonInfo[] = [];

  if (units.length > 0) {
    const useAllUnits =
      params.scopeKind === "end_of_term" &&
      selectedUnitIds.length === 0 &&
      selectedLessonIds.length === 0;

    for (const unit of units) {
      const unitSelected = useAllUnits || selectedUnitIds.includes(unit.id);
      const chosenLessons: readonly CurriculumLessonNode[] =
        selectedLessonIds.length > 0
          ? unit.lessons.filter((l) => selectedLessonIds.includes(l.id))
          : unitSelected
            ? unit.lessons
            : [];

      const effectiveLessons =
        chosenLessons.length > 0 ? chosenLessons : unitSelected ? unit.lessons : [];

      for (const lesson of effectiveLessons) {
        resolved.push({
          lessonTitleArabic: lesson.titleArabic,
          unitTitleArabic: `الوحدة ${unit.orderIndex}: ${unit.titleArabic}`,
          coreConcepts: lesson.coreConcepts,
        });
      }
    }
  }

  if (resolved.length > 0) return resolved;

  const fallbackText = (params.scopeDescriptionArabic ?? "").trim();
  if (!fallbackText) return [];

  const withoutExcluded = fallbackText.replace(/\[باستثناء:[^\]]+\]/g, "");
  const explicitLessonsMatches = Array.from(withoutExcluded.matchAll(/\[دروس:\s*([^\]]+)\]/g));
  if (explicitLessonsMatches.length === 0) return [];

  return explicitLessonsMatches
    .map((m) => m[1])
    .join("، ")
    .split(/[،,+]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2)
    .map((title) => ({
      lessonTitleArabic: title,
      unitTitleArabic: "",
      coreConcepts: [],
    }));
}

export function resolveDifficultyArabicLabel(profile: ExamFormsDifficultyProfile): string {
  switch (profile) {
    case "foundational_gradual":
      return "تأسيسي متدرج (٦٠٪ مباشر، ٣٠٪ فهم، ١٠٪ تمييز)";
    case "comprehensive_rigorous":
      return "شامل ودقيق (٥٠٪ تطبيقي، ٣٠٪ برهان، ٢٠٪ عليا)";
    case "olympiad_challenge":
      return "مستويات عليا وتحدي (٤٠٪ تطبيقي عميق، ٦٠٪ برهان وابتكار)";
    default:
      return "متوازن وزاري (٣٠٪ مباشر، ٥٠٪ فهم وبرهان، ٢٠٪ تمييز)";
  }
}

function getProgressiveRampDescs(profile: ExamFormsDifficultyProfile): readonly [string, string, string] {
  switch (profile) {
    case "foundational_gradual":
      return ["مباشر مبسط (٨٠٪ مباشر)", "تأسيسي متوسط (٧٠٪ مباشر)", "تأسيسي متدرج (٦٠٪ مباشر، ٣٠٪ فهم، ١٠٪ تمييز)"];
    case "comprehensive_rigorous":
      return ["متوازن وزاري (٣٥٪ مباشر)", "تطبيقي وبرهان (٢٥٪ مباشر)", "شامل ودقيق (٥٠٪ برهان، ٣٠٪ عليا)"];
    case "olympiad_challenge":
      return ["متوسط وتطبيقي (٣٠٪ مباشر)", "تطبيقي متقدم (٤٥٪ برهان، ٣٥٪ عليا)", "تحدٍ ومستويات عليا (٣٥٪ مركب، ٦٥٪ برهان وابتكار)"];
    default:
      return ["تأسيسي مباشر (٦٥٪ مباشر)", "تطبيقي متوسط (٤٥٪ فهم وبرهان)", "متوازن وزاري رسمي (٣٠٪ مباشر، ٥٠٪ برهان، ٢٠٪ تمييز)"];
  }
}

function buildDifficultyAndProgressionSection(
  formsCount: number,
  difficultyProfile: ExamFormsDifficultyProfile,
  progressionMode: ExamFormsProgressionMode
): string {
  const baseLabel = resolveDifficultyArabicLabel(difficultyProfile);
  if (formsCount <= 1 || progressionMode === "uniform_equivalent") {
    return `⚖️ سياسة الصعوبة والتكافؤ: كل النماذج (${formsCount}) بنفس المستوى [${baseLabel}].`;
  }

  const [lowDesc, midDesc, ceilDesc] = getProgressiveRampDescs(difficultyProfile);
  if (formsCount <= 4) {
    const chain = Array.from({ length: formsCount }, (_, i) => {
      const ratio = formsCount > 1 ? i / (formsCount - 1) : 1;
      const desc = ratio <= 0.3 ? lowDesc : ratio < 0.8 ? midDesc : ceilDesc;
      return `النموذج (${getArabicFormLetter(i)}): ${desc}`;
    }).join(" ← ");
    return `📈 سياسة الصعوبة المتدرجة تصاعدياً عبر النماذج: ${chain}.`;
  }

  return `📈 سياسة الصعوبة المتدرجة تصاعدياً عبر النماذج: من (${getArabicFormLetter(0)}) [${lowDesc}] حتى (${getArabicFormLetter(formsCount - 1)}) [${ceilDesc}].`;
}

export function buildExamFormsDemographicAndDifficultyBlueprint(
  params: DemographicBlueprintParams
): string {
  const totalQPerForm = Math.max(1, params.mcqCount + params.essayCount);
  const progressionMode: ExamFormsProgressionMode = params.progressionMode ?? "uniform_equivalent";
  const lessons = resolveTargetedLessonsForBlueprint(params);

  const lines: string[] = [
    buildDifficultyAndProgressionSection(params.formsCount, params.difficultyProfile, progressionMode),
  ];

  if (lessons.length > 0) {
    const lessonCount = lessons.length;
    const basePerForm = Math.floor(totalQPerForm / lessonCount);
    const remPerForm = totalQPerForm % lessonCount;
    const quotaText =
      lessonCount <= totalQPerForm
        ? remPerForm === 0
          ? `${basePerForm} س/درس`
          : `${basePerForm}–${basePerForm + 1} س/درس`
        : "يُحظر تكرار درس داخل النموذج؛ وزّعها بالتناوب الدائري";

    if (lessonCount <= 5) {
      const names = lessons.map((l) => `«${l.lessonTitleArabic}»`).join("، ");
      lines.push(
        `📊 التوزيع الديموجرافي للدروس (${lessonCount} دروس: ${names} ← ${quotaText}): وزّع الاختر والمقالي معاً بعدالة بلا تركيز على درس.`
      );
    } else {
      lines.push(
        `📊 التوزيع الديموجرافي للدروس (${lessonCount} درساً ← ${quotaText}): وزّع الاختر والمقالي معاً بالتساوي والتناوب الدائري على كل الدروس.`
      );
    }
  } else {
    lines.push(
      "📊 التوزيع الديموجرافي: احصر دروس النطاق من المصادر، ووزّع الاختر والمقالي معاً بالتساوي وتدوير الباقي بلا تركيز على درس."
    );
  }

  if (params.unitFocusWeights && params.unitFocusWeights.length > 1) {
    lines.push(
      `⚖️ أوزان الوحدات: ${params.unitFocusWeights.map((w) => `${w.unitTitle} (${w.percentage}%)`).join(" | ")}.`
    );
  }

  return lines.join("\n");
}
