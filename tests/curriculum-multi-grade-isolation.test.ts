/**
 * @file curriculum-multi-grade-isolation.test.ts
 * @description اختبارات التحقق الصارمة من عزل المناهج المصرية لكل صف دراسي على حدة
 * ومنع التداخل بين الصفوف عند الاستيراد والحفظ والفلترة (Grade Isolation SSOT).
 */

import { describe, expect, it, beforeEach } from "vitest";
import {
  detectGradeIdFromArabic,
  parseCurriculumSplitterResponse,
  saveImportedCurriculumUnitsSSOT,
  loadActiveCurriculumUnitsSSOT,
  deleteCurriculumUnitsForGradeSSOT,
  type CurriculumUnitNode,
} from "@/core/ssot/curriculum-hierarchy-ssot";

describe("عزل المناهج والصفوف المصرية في شجرة المنهج (Curriculum Multi-Grade Isolation)", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  describe("1. تمييز الصف الدراسي بدقة من النصوص العربية (detectGradeIdFromArabic)", () => {
    it("يميز الصف السادس الابتدائي بصيغه المختلفة", () => {
      expect(detectGradeIdFromArabic("منهج الصف السادس الابتدائي")).toBe("prim-6");
      expect(detectGradeIdFromArabic("سادس ابتدائي - الفصل الدراسي الأول")).toBe("prim-6");
      expect(detectGradeIdFromArabic("6 ب")).toBe("prim-6");
      expect(detectGradeIdFromArabic("prim-6")).toBe("prim-6");
    });

    it("يميز باقي الصفوف بدقة", () => {
      expect(detectGradeIdFromArabic("الصف الأول الإعدادي")).toBe("prep-1");
      expect(detectGradeIdFromArabic("الصف الثالث الابتدائي")).toBe("prim-3");
      expect(detectGradeIdFromArabic("الصف الثالث الإعدادي")).toBe("prep-3");
      expect(detectGradeIdFromArabic("الصف الأول الثانوي")).toBe("sec-1");
    });
  });

  describe("2. المحلل الحتمي واستخراج الوحدات لكل صف (parseCurriculumSplitterResponse)", () => {
    it("يخصص الوحدات للصف المختار عند عدم وجود ترويسة صف أخرى", () => {
      const rawText = `
=== [UNIT: 1] | الفرع: الأعداد والعمليات | العنوان: عملية القسمة والعوامل ===
- [LESSON: 1] استخدام القسمة المطولة | المفاهيم: المقسوم، المقسوم عليه
- [LESSON: 2] العوامل المشتركة | المفاهيم: ع.م.أ، م.م.أ
=== [UNIT: 2] | الفرع: الأعداد والعمليات | العنوان: الأعداد النسبية ===
- [LESSON: 1] استكشاف الأعداد النسبية | المفاهيم: خط الأعداد
`;
      const units = parseCurriculumSplitterResponse(rawText, "prim-6", 1);
      expect(units).toHaveLength(2);
      expect(units[0].gradeId).toBe("prim-6");
      expect(units[1].gradeId).toBe("prim-6");
      expect(units[0].lessons).toHaveLength(2);
      expect(units[1].lessons).toHaveLength(1);
    });

    it("يعزل الصفوف عندما يحتوي النص على أكثر من صف دراسي", () => {
      const multiGradeText = `
# منهج الصف السادس الابتدائي
=== [UNIT: 1] | الفرع: الأعداد | العنوان: النسبة والكسور ===
- [LESSON: 1] مفهوم النسبة | المفاهيم: النسبة والمعدل

# منهج الصف الأول الإعدادي
=== [UNIT: 1] | الفرع: الجبر | العنوان: الأعداد النسبية ===
- [LESSON: 1] مجموعة الأعداد النسبية | المفاهيم: الصورة العشرية
`;
      const units = parseCurriculumSplitterResponse(multiGradeText, "prim-6", 1);
      expect(units).toHaveLength(2);
      expect(units[0].gradeId).toBe("prim-6");
      expect(units[0].titleArabic).toBe("النسبة والكسور");
      expect(units[1].gradeId).toBe("prep-1");
      expect(units[1].titleArabic).toBe("الأعداد النسبية");
    });
  });

  describe("3. الحفظ والفلترة المعزولة في الـ SSOT (loadActiveCurriculumUnitsSSOT & save)", () => {
    it("يعيد فقط وحدات الصف السادس الابتدائي عند تحديد gradeId=prim-6", () => {
      const sampleUnits: readonly CurriculumUnitNode[] = [
        {
          id: "prim-6-t1-u1",
          gradeId: "prim-6",
          termNumber: 1,
          branchId: "numbers",
          orderIndex: 1,
          titleArabic: "القسمة والأعداد الصحيحة",
          lessons: [{ id: "l1", unitId: "prim-6-t1-u1", orderIndex: 1, titleArabic: "القسمة المطولة", coreConcepts: [] }],
        },
        {
          id: "prep-1-t1-u1",
          gradeId: "prep-1",
          termNumber: 1,
          branchId: "algebra",
          orderIndex: 1,
          titleArabic: "الأعداد النسبية للإعدادي",
          lessons: [{ id: "l2", unitId: "prep-1-t1-u1", orderIndex: 1, titleArabic: "خواص الجمع", coreConcepts: [] }],
        },
      ];

      saveImportedCurriculumUnitsSSOT(sampleUnits);

      // طلب وحدات الصف السادس فقط
      const prim6Units = loadActiveCurriculumUnitsSSOT("prim-6");
      expect(prim6Units).toHaveLength(1);
      expect(prim6Units[0].id).toBe("prim-6-t1-u1");
      expect(prim6Units[0].gradeId).toBe("prim-6");
      expect(prim6Units[0].titleArabic).toBe("القسمة والأعداد الصحيحة");

      // التأكد التام من عدم تسرب وحدات أولى إعدادي إليها
      expect(prim6Units.some((u) => u.gradeId === "prep-1")).toBe(false);

      // طلب وحدات أولى إعدادي
      const prep1Units = loadActiveCurriculumUnitsSSOT("prep-1");
      expect(prep1Units).toHaveLength(1);
      expect(prep1Units[0].gradeId).toBe("prep-1");
    });

    it("يمسح وحدات صف واحد دون المساس بوحدات الصفوف الأخرى (deleteCurriculumUnitsForGradeSSOT)", () => {
      const sampleUnits: readonly CurriculumUnitNode[] = [
        {
          id: "prim-6-u1",
          gradeId: "prim-6",
          termNumber: 1,
          branchId: "numbers",
          orderIndex: 1,
          titleArabic: "وحدة 6 ب",
          lessons: [],
        },
        {
          id: "prep-1-u1",
          gradeId: "prep-1",
          termNumber: 1,
          branchId: "algebra",
          orderIndex: 1,
          titleArabic: "وحدة 1 ع",
          lessons: [],
        },
      ];

      saveImportedCurriculumUnitsSSOT(sampleUnits);

      // مسح وحدات السادس فقط
      deleteCurriculumUnitsForGradeSSOT("prim-6");

      expect(loadActiveCurriculumUnitsSSOT("prim-6")).toHaveLength(0);
      expect(loadActiveCurriculumUnitsSSOT("prep-1")).toHaveLength(1);
      expect(loadActiveCurriculumUnitsSSOT("prep-1")[0].titleArabic).toBe("وحدة 1 ع");
    });
  });
});
