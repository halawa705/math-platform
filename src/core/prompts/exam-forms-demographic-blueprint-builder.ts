/**
 * @file exam-forms-demographic-blueprint-builder.ts
 * @description حاسبة التوزيع الديموجرافي المتوازن للأسئلة على الدروس ومستويات الصعوبة المتكافئة أو المتدرجة للنماذج.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 175 سطراً).
 */

import type { CurriculumLessonNode, CurriculumUnitNode } from "../ssot/curriculum-hierarchy-ssot";
import type {
  ExamFormsDifficultyProfile,
  ExamFormsProgressionMode,
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
  readonly scopeDescriptionArabic?: string;
}): readonly ResolvedTargetedLessonInfo[] {
  const units = params.units ?? [];
  const selectedUnitIds = params.selectedUnitIds ?? [];
  const selectedLessonIds = params.selectedLessonIds ?? [];
  const resolved: ResolvedTargetedLessonInfo[] = [];

  for (const unit of units) {
    const unitSelected = selectedUnitIds.includes(unit.id);
    const chosenLessons: readonly CurriculumLessonNode[] =
      selectedLessonIds.length > 0
        ? unit.lessons.filter((l) => selectedLessonIds.includes(l.id))
        : unitSelected
          ? unit.lessons
          : [];

    const effectiveLessons =
      chosenLessons.length > 0
        ? chosenLessons
        : unitSelected
          ? unit.lessons
          : [];

    for (const lesson of effectiveLessons) {
      resolved.push({
        lessonTitleArabic: lesson.titleArabic,
        unitTitleArabic: `الوحدة ${unit.orderIndex}: ${unit.titleArabic}`,
        coreConcepts: lesson.coreConcepts,
      });
    }
  }

  if (resolved.length > 0) return resolved;

  const fallbackText = (params.scopeDescriptionArabic ?? "").trim();
  if (!fallbackText) return [];

  const withoutExcluded = fallbackText.replace(/\[باستثناء:[^\]]+\]/g, "");
  const explicitLessonsMatches = Array.from(withoutExcluded.matchAll(/\[دروس:\s*([^\]]+)\]/g));
  const rawList =
    explicitLessonsMatches.length > 0
      ? explicitLessonsMatches.map((m) => m[1]).join("، ")
      : withoutExcluded;
  return rawList
    .split(/[،,+]+/)
    .map((s) => s.replace(/الوحدة\s*\d+\s*\([^)]*\)\s*(?:كاملة)?/g, "").trim())
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
      return "تأسيسي متدرج (٦٠٪ تطبيق مباشر وتأسيسي، ٣٠٪ فهم متوسط، ١٠٪ تمييز)";
    case "comprehensive_rigorous":
      return "شامل ودقيق (٥٠٪ تطبيقي، ٣٠٪ برهان واستدلال، ٢٠٪ مستويات عليا)";
    case "olympiad_challenge":
      return "مستويات عليا وتحدي للمتفوقين (٤٠٪ تطبيقي عميق، ٦٠٪ برهان مركب وتفكير ابتكاري)";
    default:
      return "متوازن رسمي مطابق للمواصفات الوزارية (٣٠٪ تذكر وتطبيق مباشر، ٥٠٪ فهم وبرهان، ٢٠٪ تمييز)";
  }
}

function buildDifficultyAndProgressionSection(
  formsCount: number,
  difficultyProfile: ExamFormsDifficultyProfile,
  progressionMode: ExamFormsProgressionMode
): readonly string[] {
  const baseLabel = resolveDifficultyArabicLabel(difficultyProfile);
  if (formsCount <= 1 || progressionMode === "uniform_equivalent") {
    return [
      `⚖️ سياسة الصعوبة والتكافؤ: جميع النماذج (${formsCount}) بنفس مستوى الصعوبة تماماً [${baseLabel}]، مع تكافؤ الوزن النسبي والزمن والدرجات بحيث لا يكون نموذج أسهل أو أصعب من الآخر.`,
    ];
  }

  const levelsAr = Array.from({ length: formsCount }, (_, i) => {
    const letter = getArabicFormLetter(i);
    const ratio = formsCount > 1 ? i / (formsCount - 1) : 0;
    const desc =
      ratio <= 0.25
        ? "تأسيسي مباشر متدرج (٧٠٪ تطبيق مباشر، ٣٠٪ فهم متوسط)"
        : ratio <= 0.55
          ? "متوسط متوازن وزاري (٣٥٪ مباشر، ٤٥٪ فهم وبرهان، ٢٠٪ تمييز)"
          : ratio <= 0.8
            ? "متقدم وشامل دقيق (٢٠٪ مباشر، ٤٥٪ برهان استدلالي، ٣٥٪ تمييز)"
            : "تحدٍ ومستويات عليا للمتفوقين (٣٥٪ تطبيقي مركب، ٦٥٪ برهان ومستويات عليا)";
    return `   • النموذج (${letter}): ${desc}.`;
  });

  return [
    `📈 سياسة الصعوبة المتدرجة تصاعدياً عبر النماذج (سقف المستوى المختار: ${baseLabel}):`,
    ...levelsAr,
  ];
}

export function buildExamFormsDemographicAndDifficultyBlueprint(
  params: DemographicBlueprintParams
): string {
  const totalQPerForm = Math.max(1, params.mcqCount + params.essayCount);
  const totalAllForms = Math.max(1, params.formsCount * totalQPerForm);
  const progressionMode: ExamFormsProgressionMode = params.progressionMode ?? "uniform_equivalent";
  const lessons = resolveTargetedLessonsForBlueprint(params);

  const lines: string[] = [
    ...buildDifficultyAndProgressionSection(
      params.formsCount,
      params.difficultyProfile,
      progressionMode
    ),
  ];

  if (lessons.length > 0) {
    const lessonCount = lessons.length;
    lines.push(
      `📊 جدول التوزيع الديموجرافي الإلزامي للدروس (${lessonCount} دروس مستهدفة ← ${totalQPerForm} سؤالاً/نموذج × ${params.formsCount} نماذج = ${totalAllForms} سؤالاً إجمالاً):`
    );

    if (lessonCount <= totalQPerForm) {
      const basePerForm = Math.floor(totalQPerForm / lessonCount);
      const remPerForm = totalQPerForm % lessonCount;
      const totalBase = Math.floor(totalAllForms / lessonCount);
      const totalRem = totalAllForms % lessonCount;

      lessons.forEach((lesson, idx) => {
        const expectedTotalAcrossForms = totalBase + (idx < totalRem ? 1 : 0);
        const perFormRange =
          remPerForm === 0 ? `${basePerForm} أسئلة بكل نموذج` : `${basePerForm}–${basePerForm + 1} سؤالاً/نموذج`;
        const conceptsNote =
          lesson.coreConcepts.length > 0
            ? ` | أفكار الدرس: ${lesson.coreConcepts.slice(0, 3).join("، ")}`
            : "";
        lines.push(
          `   ${idx + 1}. «${lesson.lessonTitleArabic}»: ${perFormRange} (إجمالي عبر النماذج ≈ ${expectedTotalAcrossForms} أسئلة)${conceptsNote}.`
        );
      });
      lines.push(
        "   ⚠️ ممنوع تركيز الأسئلة على درس وتهميش غيره: التزم بتساوي الأوزان وتدوير الأسئلة الإضافية بين النماذج."
      );
    } else {
      const totalBase = Math.floor(totalAllForms / lessonCount);
      const totalRem = totalAllForms % lessonCount;
      lines.push(
        `   ⚠️ عدد الدروس (${lessonCount}) أكبر من أسئلة النموذج (${totalQPerForm}): يُحظر تكرار أي درس مرتين داخل نفس النموذج؛ وزّع الدروس بالتناوب الدائري (Round-Robin) على النماذج لتغطية كل الدروس بلا استثناء:`
      );
      lessons.forEach((lesson, idx) => {
        const expectedTotalAcrossForms = Math.max(1, totalBase + (idx < totalRem ? 1 : 0));
        const conceptsNote =
          lesson.coreConcepts.length > 0
            ? ` | أفكار: ${lesson.coreConcepts.slice(0, 2).join("، ")}`
            : "";
        lines.push(
          `   ${idx + 1}. «${lesson.lessonTitleArabic}» (إجمالي عبر النماذج ≈ ${expectedTotalAcrossForms})${conceptsNote}.`
        );
      });
    }
  } else {
    lines.push(
      "📊 التوزيع الديموجرافي الإلزامي: وزّع الأسئلة بالتساوي التام على جميع دروس النطاق المحدد دون تركيز على درس مقابل درس آخر."
    );
  }

  if (params.unitFocusWeights && params.unitFocusWeights.length > 1) {
    lines.push(
      `⚖️ مراعاة أوزان الوحدات المحددة: ${params.unitFocusWeights.map((w) => `${w.unitTitle} (${w.percentage}%)`).join(" | ")}.`
    );
  }

  return lines.join("\n");
}
