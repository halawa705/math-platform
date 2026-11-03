/**
 * @file studio-exam-forms-scope-checklist.test.ts
 * @description اختبارات التحقق من قائمة اختيار الوحدات والدروس بالشيك بوكس في النماذج المتعددة
 * وصياغة النطاق النصي الموجه لـ NotebookLM وترويسة الامتحان.
 */

import { describe, expect, it } from "vitest";
import { formatSelectedCurriculumScopeArabic } from "@/features/generation-studio-hub/studio-curriculum-units-checklist";
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
        { id: "l5", unitId: "prep-3-t1-u2", orderIndex: 2, titleArabic: "التغير الطردي والتغير العكسي", coreConcepts: [] },
      ],
    },
  ];

  it("تُرجع كامل المنهج عندما يتم تحديد جميع الوحدات وجميع الدروس", () => {
    const unitIds = ["prep-3-t1-u1", "prep-3-t1-u2"];
    const lessonIds = ["l1", "l2", "l3", "l4", "l5"];

    const text = formatSelectedCurriculumScopeArabic(sampleUnits, unitIds, lessonIds);
    expect(text).toBe("كامل المنهج المقرر (جميع الوحدات والدروس)");
  });

  it("تُرجع سلسلة فارغة عندما لا يتم تحديد أي وحدة أو درس", () => {
    const text = formatSelectedCurriculumScopeArabic(sampleUnits, [], []);
    expect(text).toBe("");
  });

  it("تُنسق وحدة واحدة كاملة بدقة", () => {
    const unitIds = ["prep-3-t1-u1"];
    const lessonIds = ["l1", "l2", "l3"];

    const text = formatSelectedCurriculumScopeArabic(sampleUnits, unitIds, lessonIds);
    expect(text).toBe("الوحدة 1 (العلاقات والدوال) كاملة");
  });

  it("تُنسق دروساً محددة داخل وحدة بدقة", () => {
    const unitIds = [];
    const lessonIds = ["l1", "l2"];

    const text = formatSelectedCurriculumScopeArabic(sampleUnits, unitIds, lessonIds);
    expect(text).toBe("الوحدة 1 (العلاقات والدوال): [حاصل الضرب الديكارتي، العلاقة والدالة]");
  });

  it("تُنسق وحدتين مختلفتين (الأولى كاملة والثانية درس واحد) مع الربط بـ +", () => {
    const unitIds = ["prep-3-t1-u1"];
    const lessonIds = ["l1", "l2", "l3", "l4"];

    const text = formatSelectedCurriculumScopeArabic(sampleUnits, unitIds, lessonIds);
    expect(text).toBe("الوحدة 1 (العلاقات والدوال) كاملة + الوحدة 2 (النسبة والتناسب): [النسبة والتناسب]");
  });
});
