import { describe, it, expect } from "vitest";
import {
  parseCurriculumSplitterResponse,
  loadActiveCurriculumUnitsSSOT,
  saveImportedCurriculumUnitsSSOT,
  type CurriculumUnitNode,
} from "@/core/ssot/curriculum-hierarchy-ssot";
import {
  deduplicateCurriculumUnitsSSOT,
  normalizeCurriculumSplitterRawText,
} from "@/core/ssot/curriculum-deduplication-engine";

describe("Curriculum Deduplication & Normalization Engine", () => {
  it("normalizes inline concatenated unit and lesson headers without newlines", () => {
    const brokenText = "- [LESSON: 1] تجربة | المفاهيم: س=== [UNIT: 2] | الفرع: الجبر | العنوان: الوحدة الثانية ===";
    const normalized = normalizeCurriculumSplitterRawText(brokenText);
    expect(normalized).toContain("\n=== [UNIT: 2]");
  });

  it("collapses multi-pass duplicated NotebookLM outputs to the exact unique units (Grade 5 real case)", () => {
    const repeatedResponse = `
=== [UNIT: 1] | الفرع: الحس العددي والعمليات | العنوان: الوحدة الأولى: القيمة المكانية للأعداد العشرية وحسابها ===
- [LESSON: 1] الكسور العشرية حتى جزء من الألف | المفاهيم: أجزاء الألف
- [LESSON: 2] تغيير القيم المكانية | المفاهيم: حركة الأرقام

=== [UNIT: 2] | الفرع: الحس العددي والعمليات | العنوان: الوحدة الثانية: العلاقات بين الأعداد ===
- [LESSON: 1] التعبيرات الرياضية | المفاهيم: المتغيرات

=== [UNIT: 6] | الفرع: العمليات الحسابية | العنوان: الوحدة السادسة: التعبيرات العددية والأنماط ===
- [LESSON: 1] ترتيب العمليات | المفاهيم: أسبقية العمليات

=== [UNIT: 1] | الفرع: الحس العددي والعمليات | العنوان: الوحدة الأولى: القيمة المكانية للأعداد العشرية وحسابها ===
- [LESSON: 1] الكسور العشرية حتى جزء من الألف | المفاهيم: قراءة وكتابة الأعداد العشرية، أجزاء الألف
- [LESSON: 2] تغيير القيم المكانية | المفاهيم: الضرب والقسمة في 10

=== [UNIT: 6] | الفرع: العمليات الحسابية | العنوان: الوحدة السادسة: الت=== [UNIT: 1] | الفرع: الحس العددي والعمليات | العنوان: الوحدة الأولى: القيمة المكانية للأعداد العشرية وحسابها ===
- [LESSON: 1] الكسور العشرية حتى جزء من الألف | المفاهيم: كاملة

=== [UNIT: 6] | الفرع: العمليات الحسابية | العنوان: الوحدة السادسة: التعبيرات العددية والأنماط ===
- [LESSON: 1] ترتيب إجراء العمليات الحسابية | المفاهيم: أسبقية الضرب والقسمة
- [LESSON: 2] تعبيرات عددية تتضمن أقواساً | المفاهيم: الأقواس المستديرة والمربعة
- [LESSON: 3] كتابة تعبير عددي | المفاهيم: التعبير بالرموز
- [LESSON: 4] تحديد الأنماط العددية | المفاهيم: قاعدة النمط
`;

    const units = parseCurriculumSplitterResponse(repeatedResponse, "prim-5", 1);
    expect(units).toHaveLength(3); // Units 1, 2, and 6
    expect(units.map((u) => u.orderIndex)).toEqual([1, 2, 6]);

    const unit6 = units.find((u) => u.orderIndex === 6);
    expect(unit6).toBeDefined();
    expect(unit6?.titleArabic).toBe("الوحدة السادسة: التعبيرات العددية والأنماط");
    expect(unit6?.lessons).toHaveLength(4);
  });

  it("self-heals existing bloated units when loaded through loadActiveCurriculumUnitsSSOT", () => {
    const bloatedUnits: CurriculumUnitNode[] = [
      {
        id: "prim-5-t1-u1",
        gradeId: "prim-5",
        termNumber: 1,
        branchId: "numbers",
        branchNameArabic: "الحس العددي",
        orderIndex: 1,
        titleArabic: "الوحدة الأولى: القيمة المكانية",
        lessons: [
          { id: "l1", unitId: "prim-5-t1-u1", orderIndex: 1, titleArabic: "درس 1", coreConcepts: [] },
        ],
      },
      {
        id: "prim-5-t1-u1-duplicate",
        gradeId: "prim-5",
        termNumber: 1,
        branchId: "numbers",
        branchNameArabic: "الحس العددي",
        orderIndex: 1,
        titleArabic: "الوحدة الأولى: القيمة المكانية للأعداد العشرية",
        lessons: [
          { id: "l1", unitId: "prim-5-t1-u1", orderIndex: 1, titleArabic: "درس 1", coreConcepts: ["مفهوم 1"] },
          { id: "l2", unitId: "prim-5-t1-u1", orderIndex: 2, titleArabic: "درس 2", coreConcepts: ["مفهوم 2"] },
        ],
      },
    ];

    const cleaned = deduplicateCurriculumUnitsSSOT(bloatedUnits);
    expect(cleaned).toHaveLength(1);
    expect(cleaned[0].orderIndex).toBe(1);
    expect(cleaned[0].lessons).toHaveLength(2);
    expect(cleaned[0].titleArabic).toBe("الوحدة الأولى: القيمة المكانية للأعداد العشرية");
  });

  it("automatically heals an existing corrupted Unit 6 with truncated title or stolen lessons", () => {
    const corruptedUnit6: CurriculumUnitNode = {
      id: "prim-5-t1-u6",
      gradeId: "prim-5",
      termNumber: 1,
      branchId: "numbers",
      branchNameArabic: "العمليات الحسابية والتفكير الجبري",
      orderIndex: 6,
      titleArabic: "الوحدة السادسة: الت",
      lessons: [
        {
          id: "prim-5-t1-u6-l1",
          unitId: "prim-5-t1-u6",
          orderIndex: 1,
          titleArabic: "الكسور العشرية حتى جزء من الألف",
          coreConcepts: [],
        },
      ],
    };

    const healed = deduplicateCurriculumUnitsSSOT([corruptedUnit6]);
    expect(healed).toHaveLength(1);
    expect(healed[0].titleArabic).toBe("الوحدة السادسة: التعبيرات العددية والأنماط");
    expect(healed[0].lessons).toHaveLength(4);
    expect(healed[0].lessons[0].titleArabic).toBe("ترتيب إجراء العمليات الحسابية");
    expect(healed[0].lessons[3].titleArabic).toBe("تحديد الأنماط العددية");
  });
});
