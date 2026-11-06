/**
 * @file geometry-phase4-expansion.test.ts
 * @description اختبارات المرحلة 4 (التوسع بالمواد: الابتدائي ← الإحصاء ← الدوال والفترات ← الإحداثيات) عبر المسار الموحد.
 * يلتزم بحدود الأسطر (< 260 سطراً) وTypeScript الصارم وفق دستور المنصة (AGENTS.md).
 */

import { describe, expect, it } from "vitest";
import {
  matchArabicDescriptionToCanonicalGeometryFigure,
  matchGeometryWithDiagnostics,
} from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { buildCoordinatePlanePolygonFigure } from "../src/core/geometry-engine/analytic-function-family/coordinate-plane-polygon-plotter";
import { verifyNoSolutionLeakOnFigure } from "../src/core/geometry-engine/verification/geometry-solution-leak-guard";

describe("Phase 4 — Subject Expansion (Primary → Statistics → Functions → Coordinates)", () => {
  describe("1. Primary Stage (Grades 4, 5, 6)", () => {
    it("renders Grade 4 angle types without leaking unmentioned 45° or 125° when degrees are not in the prompt", () => {
      const prompt = "حدد نوع الزاوية المرسومة: زاوية حادة أ ب جـ";
      const res = matchGeometryWithDiagnostics(prompt, "p4_angle_acute");
      expect(res.figure).toBeDefined();
      expect(res.decision).toBe("green");
      const leakReport = verifyNoSolutionLeakOnFigure(res.figure!, prompt);
      expect(leakReport.passed).toBe(true);
    });

    it("renders Grade 4 angle types with explicit degrees when given in the prompt", () => {
      const prompt = "ارسم زاوية منفرجة قياسها 115°";
      const fig = matchArabicDescriptionToCanonicalGeometryFigure(prompt, "p4_angle_115");
      expect(fig).toBeDefined();
      expect(fig?.angles[0]?.degreesLabel).toBe("115°");
    });

    it("renders Grade 4 triangle classification by sides (equilateral, isosceles, scalene)", () => {
      const eqFig = matchArabicDescriptionToCanonicalGeometryFigure(
        "صنف المثلث المقابل حسب أطوال أضلاعه: مثلث متساوي الأضلاع طول ضلعه 5 سم",
        "p4_tri_eq"
      );
      expect(eqFig).toBeDefined();
      expect(eqFig?.segments.every((s) => s.tickMarks === 1)).toBe(true);

      const isoFig = matchArabicDescriptionToCanonicalGeometryFigure(
        "مثلث متساوي الساقين أ ب جـ",
        "p4_tri_iso"
      );
      expect(isoFig).toBeDefined();
      expect(isoFig?.segments.filter((s) => s.tickMarks === 1).length).toBe(2);
    });

    it("renders Grade 5 triangle area with actual prompt dimensions and '؟' for unknown height", () => {
      const prompt = "مثلث طول قاعدته 10 سم وارتفاعه المناظر 6 سم، أوجد مساحة المثلث";
      const fig = matchArabicDescriptionToCanonicalGeometryFigure(prompt, "p5_tri_area");
      expect(fig).toBeDefined();
      const labels = fig?.segments.map((s) => s.lengthLabel?.value).filter((v) => v !== undefined);
      expect(labels).toContain(10);
      expect(labels).toContain(6);

      const unknownPrompt = "مثلث مساحته 24 سم² وطول قاعدته 8 سم، أوجد الارتفاع المناظر";
      const unknownFig = matchArabicDescriptionToCanonicalGeometryFigure(unknownPrompt, "p5_tri_unk");
      expect(unknownFig).toBeDefined();
      const unkLabels = unknownFig?.segments.map((s) => s.lengthLabel?.value).filter((v) => v !== undefined);
      expect(unkLabels).toContain(8);
      expect(unkLabels).toContain("؟");
    });

    it("renders Grade 5 parallelogram area with real base and altitude", () => {
      const prompt = "أوجد مساحة متوازي الأضلاع الذي طول قاعدته 12 سم وارتفاعه المناظر 7 سم";
      const fig = matchArabicDescriptionToCanonicalGeometryFigure(prompt, "p5_para_area");
      expect(fig).toBeDefined();
      const labels = fig?.segments.map((s) => s.lengthLabel?.value).filter((v) => v !== undefined);
      expect(labels).toContain(12);
      expect(labels).toContain(7);
    });

    it("renders Grade 6 circle using IR v2 circles array with dynamic radius/diameter", () => {
      const prompt = "دائرة مركزها م وطول نصف قطرها 5 سم، أوجد محيط الدائرة";
      const fig = matchArabicDescriptionToCanonicalGeometryFigure(prompt, "p6_circle_r5");
      expect(fig).toBeDefined();
      expect(fig?.circles?.length).toBe(1);
      expect(fig?.segments[0]?.lengthLabel?.value).toBe(5);
      expect(fig?.segments[0]?.lengthLabel?.unit).toBe("سم");
    });
  });

  describe("2. Statistics (Primary 6 & Prep)", () => {
    it("passes all Primary 6 statistics archetypes (dot plot, bar chart, histogram, boxplot) through the unified pipeline with 0 flags", () => {
      const prompts = [
        "من مخطط التمثيل بالنقاط لعدد الكتب التي قرأها التلاميذ: أوجد المنوال",
        "التمثيل البياني بالأعمدة التالي يوضح الأنشطة الرياضية المفضلة لدى التلاميذ",
        "المدرج التكراري التالي يوضح درجات الاختبار في الفترات 51-60، 61-70، 71-80",
        "من مخطط الصندوق التالي للبيانات حيث الحد الأدنى 10 والربيع الأول 20 والوسيط 25 والربيع الثالث 40 والحد الأقصى 50",
      ];

      for (const p of prompts) {
        const res = matchGeometryWithDiagnostics(p, "p4_stats_check");
        expect(res.figure).toBeDefined();
        expect(res.figure?.familyId).toBe("statistics_family");
        expect(res.decision).toBe("green");
      }
    });
  });

  describe("3. Functions & Number Line Intervals", () => {
    it("renders quadratic function curve with actual vertex/shift from prompt without leaking hardcoded (-2, 0), (0, -3)", () => {
      const prompt = "مثل بيانياً منحنى الدالة التربيعية د(س) = س² - 4 في الفترة [-3, 3]";
      const res = matchGeometryWithDiagnostics(prompt, "p4_quad_curve");
      expect(res.figure).toBeDefined();
      expect(res.figure?.coordinateGrid?.enabled).toBe(true);
      expect(res.decision).toBe("green");
      const leakReport = verifyNoSolutionLeakOnFigure(res.figure!, prompt);
      expect(leakReport.passed).toBe(true);
    });

    it("renders number line intervals with actual bounds from the prompt", () => {
      const prompt = "مثل على خط الأعداد الفترة [-2, 5]";
      const res = matchGeometryWithDiagnostics(prompt, "p4_num_line");
      expect(res.figure).toBeDefined();
      expect(res.decision).toBe("green");
      const vLabels = res.figure?.vertices.map((v) => v.label);
      expect(vLabels).toContain("[-2");
      expect(vLabels).toContain("5]");
    });
  });

  describe("4. Coordinates & Analytic Geometry", () => {
    it("renders Prep 1 coordinate projections without leaking projection lengths when asked", () => {
      const prompt = "إذا كان A(3, -2) و B(-4, 4) ارسم AB في المستوى الإحداثي ثم أوجد طول مسقطها على المحور X والمحور y";
      const res = matchGeometryWithDiagnostics(prompt, "p4_coord_proj");
      expect(res.figure).toBeDefined();
      expect(res.figure?.coordinateGrid?.enabled).toBe(true);
      expect(res.decision).toBe("green");
      const leakReport = verifyNoSolutionLeakOnFigure(res.figure!, prompt);
      expect(leakReport.passed).toBe(true);
    });

    it("renders Prep 1 segment midpoint with M(؟, ؟) when midpoint coordinates are asked", () => {
      const prompt = "أوجد إحداثيي منتصف القطعة المستقيمة AB حيث A(1, 2) و B(5, 6)";
      const res = matchGeometryWithDiagnostics(prompt, "p4_coord_mid");
      expect(res.figure).toBeDefined();
      expect(res.decision).toBe("green");
      const mVertex = res.figure?.vertices.find((v) => v.id.endsWith("_vM"));
      expect(mVertex?.label).toBe("M(؟, ؟)");
      const leakReport = verifyNoSolutionLeakOnFigure(res.figure!, prompt);
      expect(leakReport.passed).toBe(true);
    });

    it("plots arbitrary polygon on Cartesian plane via buildCoordinatePlanePolygonFigure", () => {
      const prompt = "في المستوى الإحداثي، ارسم المضلع أ ب جـ حيث أ(1, 2)، ب(4, 2)، جـ(4, 6)";
      const fig = buildCoordinatePlanePolygonFigure({
        figureId: "p4_poly_plot",
        description: prompt,
      });
      expect(fig).toBeDefined();
      expect(fig?.coordinateGrid?.enabled).toBe(true);
      expect(fig?.polygons?.length).toBe(1);
      expect(fig?.vertices.some((v) => v.label === "أ(1, 2)")).toBe(true);
      expect(fig?.vertices.some((v) => v.label === "ب(4, 2)")).toBe(true);
      expect(fig?.vertices.some((v) => v.label === "جـ(4, 6)")).toBe(true);
    });
  });
});
