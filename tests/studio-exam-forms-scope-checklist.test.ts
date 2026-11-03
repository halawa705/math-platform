/**
 * @file studio-exam-forms-scope-checklist.test.ts
 * @description اختبارات التحقق من قائمة اختيار الوحدات والدروس بالشيك بوكس في النماذج المتعددة
 * وصياغة النطاق النصي الموجه لـ NotebookLM وترويسة الامتحان مع كتابة أسماء الوحدات والدروس المستثناة ومراعاة حجم البرومبت.
 */

import { describe, expect, it } from "vitest";
import { formatSelectedCurriculumScopeArabic } from "@/features/generation-studio-hub/studio-curriculum-units-checklist";
import { buildExamFormsNotebookLMPrompt } from "@/core/prompts/exam-forms-notebooklm-prompt-builder";
import type { CurriculumUnitNode } from "@/core/ssot/curriculum-hierarchy-ssot";

describe("قائمة شيك بوكس الوحدات والدروس في النماذج (Exam Forms Curriculum Checklist)", () => {
  const sampleUnits: readonly CurriculumUnitNode[] = [
    {
      id: "prep-3-t1-u1",
      gradeId: "prep-3",
      termNumber: 1,
      branchId: "algebra",
      orderIndex: 1,
      titleArabic: "العلاقات والدوال",
      lessons: [
        { id: "l1", unitId: "prep-3-t1-u1", orderIndex: 1, titleArabic: "حاصل الضرب الديكارتي", coreConcepts: [] },
        { id: "l2", unitId: "prep-3-t1-u1", orderIndex: 2, titleArabic: "العلاقة والدالة", coreConcepts: [] },
        { id: "l3", unitId: "prep-3-t1-u1", orderIndex: 3, titleArabic: "دوال كثيرات الحدود", coreConcepts: [] },
      ],
    },
    {
      id: "prep-3-t1-u2",
      gradeId: "prep-3",
      termNumber: 1,
      branchId: "algebra",
      orderIndex: 2,
      titleArabic: "النسبة والتناسب",
      lessons: [
        { id: "l4", unitId: "prep-3-t1-u2", orderIndex: 1, titleArabic: "النسبة والتناسب", coreConcepts: [] },
        { id: "l5", unitId: "prep-3-t1-u2", orderIndex: 2, titleArabic: "التغير الطردي والعكسي", coreConcepts: [] },
      ],
    },
    {
      id: "prep-3-t1-u3",
      gradeId: "prep-3",
      termNumber: 1,
      branchId: "statistics_probability",
      orderIndex: 3,
      titleArabic: "الإحصاء والبيانات",
      lessons: [
        { id: "l6", unitId: "prep-3-t1-u3", orderIndex: 1, titleArabic: "التشتت والانحراف المعياري", coreConcepts: [] },
      ],
    },
  ];

  it("تكتب اسم كل وحدة كاملة عندما يتم تحديد جميع دروسها", () => {
    const unitIds = ["prep-3-t1-u1", "prep-3-t1-u2"];
    const lessonIds = ["l1", "l2", "l3", "l4", "l5"];

    const text = formatSelectedCurriculumScopeArabic(sampleUnits, unitIds, lessonIds);
    expect(text).toContain("الوحدة 1 (العلاقات والدوال) كاملة");
    expect(text).toContain("الوحدة 2 (النسبة والتناسب) كاملة");
  });

  it("تُرجع سلسلة فارغة عندما لا يتم تحديد أي وحدة أو درس", () => {
    const text = formatSelectedCurriculumScopeArabic(sampleUnits, [], []);
    expect(text).toBe("");
  });

  it("تكتب اسم الوحدة وتذكر نصاً أسماء الدروس المستثناة بدقة", () => {
    // تم اختيار الدرس 1 والدرس 2 فقط، واستثناء الدرس 3 (دوال كثيرات الحدود)
    const unitIds = [];
    const lessonIds = ["l1", "l2"];

    const text = formatSelectedCurriculumScopeArabic(sampleUnits, unitIds, lessonIds);
    expect(text).toContain("الوحدة 1 (العلاقات والدوال)");
    expect(text).toContain("[باستثناء: دوال كثيرات الحدود]");
  });

  it("تُنسق وحدات متعددة يجمع بين وحدات كاملة ووحدات بها دروس مستثناة", () => {
    // الوحدة الأولى كاملة، الوحدة الثانية مستثنى منها التغير الطردي والعكسي
    const unitIds = ["prep-3-t1-u1"];
    const lessonIds = ["l1", "l2", "l3", "l4"];

    const text = formatSelectedCurriculumScopeArabic(sampleUnits, unitIds, lessonIds);
    expect(text).toContain("الوحدة 1 (العلاقات والدوال) كاملة");
    expect(text).toContain("الوحدة 2 (النسبة والتناسب) [باستثناء: التغير الطردي والعكسي]");
  });

  it("تتحقق من حجم البرومبت بعد إضافة الوحدات والدروس المستثناة لضمان عدم ضخامته", () => {
    const unitIds = ["prep-3-t1-u1", "prep-3-t1-u2", "prep-3-t1-u3"];
    const lessonIds = ["l1", "l2", "l4", "l6"]; // مستثنى l3 و l5

    const scopeDesc = formatSelectedCurriculumScopeArabic(sampleUnits, unitIds, lessonIds);
    expect(scopeDesc).toContain("[باستثناء: دوال كثيرات الحدود]");
    expect(scopeDesc).toContain("[باستثناء: التغير الطردي والعكسي]");

    const prompt = buildExamFormsNotebookLMPrompt({
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "algebra",
      scopeKind: "monthly_exam",
      scopeDescriptionArabic: scopeDesc,
      formsCount: 5,
      mcqQuestionsCount: 6,
      essayAndProofQuestionsCount: 4,
      totalMarksPerForm: 18,
      durationTextArabic: "ساعة ونصف",
      difficultyProfile: "standard_balanced",
    });

    // التأكد من تضمين أسماء الوحدات والدروس المستثناة داخل البرومبت
    expect(prompt).toContain("العلاقات والدوال");
    expect(prompt).toContain("النسبة والتناسب");
    expect(prompt).toContain("دوال كثيرات الحدود");
    expect(prompt).toContain("التغير الطردي والعكسي");
    expect(prompt).toContain("يُحظر تماماً وضع أي مسألة من أي درس تم النص على استثنائه");

    // التحقق من ميزانية حجم البرومبت: البرومبت مضغوط ورشيق وغير متضخم
    expect(prompt.length).toBeLessThan(4000);
  });
});
