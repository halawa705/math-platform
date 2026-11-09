/**
 * @file studio-multi-units-scope-and-focus-weights.test.ts
 * @description اختبارات التحقق من التحديد المتعدد للوحدات والدروس بالشيك بوكس،
 * واقتصاد التوكنز والكلمات في صياغة النطاق، ونسب تركيز الأسئلة على الوحدات في الاختبار.
 */

import { describe, expect, it } from "vitest";
import {
  formatSelectedCurriculumScopeArabic,
  formatUnitFocusWeightsForPrompt,
  type UnitFocusWeightItem,
} from "@/features/generation-studio-hub/studio-curriculum-units-checklist";
import { buildOfficialExamNotebookLMPrompt } from "@/core/prompts/official-exam-prompt-builder";
import { buildOnlineExamNotebookLMPrompt } from "@/core/prompts/online-exam-prompt-builder";
import type { CurriculumUnitNode } from "@/core/ssot/curriculum-hierarchy-ssot";

describe("استوديو التوليد: التحديد المتعدد للوحدات والدروس ونسب التركيز", () => {
  const sampleCurriculum: readonly CurriculumUnitNode[] = [
    {
      id: "u1",
      gradeId: "prep-3",
      termNumber: 1,
      branchId: "algebra",
      orderIndex: 1,
      titleArabic: "العلاقات والدوال",
      lessons: [
        { id: "l1", unitId: "u1", orderIndex: 1, titleArabic: "حاصل الضرب الديكارتي", coreConcepts: [] },
        { id: "l2", unitId: "u1", orderIndex: 2, titleArabic: "العلاقة والدالة", coreConcepts: [] },
        { id: "l3", unitId: "u1", orderIndex: 3, titleArabic: "دوال كثيرات الحدود", coreConcepts: [] },
        { id: "l4", unitId: "u1", orderIndex: 4, titleArabic: "الدالة الخطية والتربيعية", coreConcepts: [] },
      ],
    },
    {
      id: "u2",
      gradeId: "prep-3",
      termNumber: 1,
      branchId: "algebra",
      orderIndex: 2,
      titleArabic: "النسبة والتناسب",
      lessons: [
        { id: "l5", unitId: "u2", orderIndex: 1, titleArabic: "النسبة والتناسب", coreConcepts: [] },
        { id: "l6", unitId: "u2", orderIndex: 2, titleArabic: "التغير الطردي والعكسي", coreConcepts: [] },
      ],
    },
    {
      id: "u3",
      gradeId: "prep-3",
      termNumber: 1,
      branchId: "statistics_probability",
      orderIndex: 3,
      titleArabic: "الإحصاء والبيانات",
      lessons: [
        { id: "l7", unitId: "u3", orderIndex: 1, titleArabic: "التشتت والانحراف المعياري", coreConcepts: [] },
      ],
    },
  ];

  it("تختصر كامل المنهج بعبارة مكثفة عند تحديد جميع وحدات ودروس المنهج", () => {
    const allUnitIds = ["u1", "u2", "u3"];
    const allLessonIds = ["l1", "l2", "l3", "l4", "l5", "l6", "l7"];

    const scopeText = formatSelectedCurriculumScopeArabic(sampleCurriculum, allUnitIds, allLessonIds);
    expect(scopeText).toBe("كامل وحدات ودروس المنهج المقرر");
  });

  it("تكتب الدروس المستهدفة فقط عندما تكون أقل عدداً من المستثناة لتوفير الكلمات (Token Economy)", () => {
    // الوحدة الأولى بها 4 دروس، اختار درساً واحداً فقط (l1)، واستثنى 3 دروس
    const unitIds = ["u1"];
    const lessonIds = ["l1"];

    const scopeText = formatSelectedCurriculumScopeArabic(sampleCurriculum, unitIds, lessonIds);
    expect(scopeText).toContain("الوحدة 1 (العلاقات والدوال) [دروس: حاصل الضرب الديكارتي]");
    expect(scopeText).not.toContain("باستثناء");
  });

  it("تكتب الدروس المستثناة فقط عندما تكون أقل أو تساوي المستهدفة لتوفير الكلمات", () => {
    // الوحدة الأولى بها 4 دروس، اختار 3 دروس واستثنى درساً واحداً (l4)
    const unitIds = ["u1"];
    const lessonIds = ["l1", "l2", "l3"];

    const scopeText = formatSelectedCurriculumScopeArabic(sampleCurriculum, unitIds, lessonIds);
    expect(scopeText).toContain("الوحدة 1 (العلاقات والدوال) [باستثناء: الدالة الخطية والتربيعية]");
    expect(scopeText).not.toContain("[دروس:");
  });

  it("تصيغ نسب التركيز وتوزيع الأسئلة على الوحدات بشكل صارم ومحسوب بدقة", () => {
    const weights: readonly UnitFocusWeightItem[] = [
      { unitId: "u1", unitTitle: "الوحدة 1 (الجبر)", unitOrderIndex: 1, percentage: 20, questionCount: 2 },
      { unitId: "u2", unitTitle: "الوحدة 2 (النسبة والتناسب)", unitOrderIndex: 2, percentage: 30, questionCount: 3 },
      { unitId: "u3", unitTitle: "الوحدة 3 (الإحصاء)", unitOrderIndex: 3, percentage: 50, questionCount: 5 },
    ];

    const block = formatUnitFocusWeightsForPrompt(weights);
    expect(block).toContain("⚖️ نسب التركيز وتوزيع الأسئلة الإلزامي على الوحدات");
    expect(block).toContain("الوحدة 1 (الجبر): 20% (2 أسئلة)");
    expect(block).toContain("الوحدة 2 (النسبة والتناسب): 30% (3 أسئلة)");
    expect(block).toContain("الوحدة 3 (الإحصاء): 50% (5 أسئلة)");
    expect(block).toContain("ممنوع الإخلال بهذه الأوزان");
  });

  it("تدمج النطاق المتعدد ونسب التركيز في برومبت الاختبار الرسمي مع الحفاظ على سقف الحجم", () => {
    const weights: readonly UnitFocusWeightItem[] = [
      { unitId: "u1", unitTitle: "الوحدة الأولى", unitOrderIndex: 1, percentage: 40, questionCount: 4 },
      { unitId: "u2", unitTitle: "الوحدة الثانية", unitOrderIndex: 2, percentage: 60, questionCount: 6 },
    ];

    const prompt = buildOfficialExamNotebookLMPrompt({
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "algebra",
      targetedLessonTitlesArabic: [],
      targetedScopeArabic: "الوحدة 1 كاملة + الوحدة 2 كاملة",
      unitFocusWeights: weights,
      mcqQuestionsCount: 6,
      essayAndProofQuestionsCount: 4,
      totalMarks: 20,
      durationTextArabic: "ساعتان",
      difficultyProfile: "standard_balanced",
    });

    expect(prompt).toContain("🎯 النطاق الحصري (ممنوع الخروج عنه): [الوحدة 1 كاملة + الوحدة 2 كاملة]");
    expect(prompt).toContain("نسب التركيز وتوزيع الأسئلة الإلزامي");
    expect(prompt).toContain("الوحدة الأولى: 40%");
    expect(prompt).toContain("الوحدة الثانية: 60%");
    expect(prompt.length).toBeLessThanOrEqual(2400);
  });

  it("تدمج النطاق المتعدد ونسب التركيز في برومبت الاختبار الإلكتروني", () => {
    const weights: readonly UnitFocusWeightItem[] = [
      { unitId: "u1", unitTitle: "الوحدة الأولى", unitOrderIndex: 1, percentage: 50, questionCount: 5 },
      { unitId: "u2", unitTitle: "الوحدة الثانية", unitOrderIndex: 2, percentage: 50, questionCount: 5 },
    ];

    const prompt = buildOnlineExamNotebookLMPrompt({
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "algebra",
      targetedLessonTitlesArabic: [],
      targetedScopeArabic: "الوحدة 1 كاملة + الوحدة 2 كاملة",
      unitFocusWeights: weights,
      mcqQuestionsCount: 6,
      shortAnswerQuestionsCount: 4,
      totalMarks: 20,
      durationTextArabic: "ساعة",
      difficultyProfile: "standard_balanced",
    });

    expect(prompt).toContain("🎯 النطاق الحصري (ممنوع الخروج عنه): [الوحدة 1 كاملة + الوحدة 2 كاملة]");
    expect(prompt).toContain("الوحدة الأولى: 50%");
    expect(prompt).toContain("الوحدة الثانية: 50%");
    expect(prompt).toContain("ممنوع أسئلة البرهان والمقالي");
    expect(prompt.length).toBeLessThanOrEqual(2400);
  });

  it("تستبعد كتلة نسب التركيز تماماً من البرومبت عند إلغاء التشيك بوكس ليكون الاختبار متوازناً طبيعياً", () => {
    const prompt = buildOfficialExamNotebookLMPrompt({
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "algebra",
      targetedLessonTitlesArabic: [],
      targetedScopeArabic: "الوحدة 1 (العلاقات والدوال) [دروس: حاصل الضرب الديكارتي] + الوحدة 2 (النسبة والتناسب) [دروس: النسبة والتناسب]",
      unitFocusWeights: [], // فارغ عند إلغاء التشيك بوكس
      mcqQuestionsCount: 6,
      essayAndProofQuestionsCount: 4,
      totalMarks: 20,
      durationTextArabic: "ساعتان",
      difficultyProfile: "standard_balanced",
    });

    // لا تحتوي على أي كتل نسب مئوية أو أوزان إلزامية
    expect(prompt).not.toContain("نسب التركيز وتوزيع الأسئلة الإلزامي");
    expect(prompt).not.toContain("⚖️");
    // تحتوي على النطاق الدقيق متوازناً
    expect(prompt).toContain("🎯 النطاق الحصري (ممنوع الخروج عنه): [الوحدة 1 (العلاقات والدوال) [دروس: حاصل الضرب الديكارتي] + الوحدة 2 (النسبة والتناسب) [دروس: النسبة والتناسب]]");
  });

  it("تحتسب الوحدة ضمن الوحدات النشطة إذا تم اختيار درس واحد فقط منها", () => {
    // محاكاة منطق فحص الوحدات النشطة
    const selectedLessonIds = ["l1", "l5"]; // l1 من u1 و l5 من u2
    const selectedUnitIds: string[] = []; // لا توجد وحدات محددة كلياً

    const activeUnits = sampleCurriculum.filter((u) => {
      const isExplicit = selectedUnitIds.includes(u.id);
      const hasAnySelectedLesson = u.lessons.some((l) => selectedLessonIds.includes(l.id));
      return isExplicit || hasAnySelectedLesson;
    });

    expect(activeUnits.length).toBe(2);
    expect(activeUnits.map((u) => u.id)).toEqual(["u1", "u2"]);
  });
});
