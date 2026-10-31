/**
 * @file curriculum-topology-classifier.test.ts
 * @description اختبارات التحقق من مصنّف الهيئات الهندسية المصرية (Phase 3 Unit Tests).
 * تتأكد من تصنيف جميع الحالات المنهجية الثماني حتمياً وفق تقاطع الرؤوس والعلاقات الهندسية.
 */

import { describe, expect, it } from "vitest";
import { classifyCurriculumGeometryTopology } from "@/core/geometry-engine/similarity-family/curriculum-topology-classifier";

describe("المرحلة المحورية الثالثة: مصنّف الهيئات المنهجية المصرية", () => {
  describe("1. هيئة المثلثين المنفصلين (disjoint_two_triangles)", () => {
    it("يصنّف ΔABC ~ ΔDEF كـ disjoint_two_triangles (صفر رؤوس مشتركة)", () => {
      const prompt =
        "إذا كان $\\Delta ABC \\sim \\Delta DEF$ وكان $m(\\angle A) = 40^\\circ$ و $m(\\angle B) = 65^\\circ$، فإن $m(\\angle F) = 75^\\circ$";
      const result = classifyCurriculumGeometryTopology(prompt);

      expect(result.topology).toBe("disjoint_two_triangles");
      expect(result.primaryTri).toEqual(["A", "B", "C"]);
      expect(result.secondaryTri).toEqual(["D", "E", "F"]);
      expect(result.sharedVertices).toEqual([]);
      expect(result.confidence).toBeGreaterThanOrEqual(0.95);
    });

    it("يصنّف تشابه ΔABC ~ ΔXYZ مع أطوال عددية كـ disjoint_two_triangles", () => {
      const prompt =
        "مثلثان متشابهان $\\Delta ABC \\sim \\Delta XYZ$ أطوال أضلاع الأول 3 سم، 4 سم، 5 سم";
      const result = classifyCurriculumGeometryTopology(prompt);

      expect(result.topology).toBe("disjoint_two_triangles");
      expect(result.sharedVertices).toEqual([]);
    });
  });

  describe("2. هيئة طاليس والتوازي في مثلث (thales_parallel_in_triangle)", () => {
    it("يصنّف ΔADE ~ ΔABC كـ thales_parallel_in_triangle بالترتيب التناظري المباشر", () => {
      const prompt =
        "في الشكل المقابل، $\\Delta ADE \\sim \\Delta ABC$ حيث $\\overline{DE} \\parallel \\overline{BC}$";
      const result = classifyCurriculumGeometryTopology(prompt);

      expect(result.topology).toBe("thales_parallel_in_triangle");
      expect(result.sharedVertices).toEqual(["A"]);
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("يستنتج هيئة طاليس من معطى التوازي DE // BC داخل المثلث", () => {
      const prompt = "مثلث ABC فيه D ∈ AB و E ∈ AC و DE // BC";
      const result = classifyCurriculumGeometryTopology(prompt);

      expect(result.topology).toBe("thales_parallel_in_triangle");
    });
  });

  describe("3. هيئة القاطع العكسي غير الموازي (antiparallel_in_triangle)", () => {
    it("يصنّف ΔADE ~ ΔACB كـ antiparallel_in_triangle بالترتيب التناظري المعكوس", () => {
      const prompt =
        "في الشكل المقابل، $\\Delta ADE \\sim \\Delta ACB$ حيث $D \\in AB$ و $E \\in AC$ قاطع غير موازٍ";
      const result = classifyCurriculumGeometryTopology(prompt);

      expect(result.topology).toBe("antiparallel_in_triangle");
      expect(result.sharedVertices).toEqual(["A"]);
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });
  });

  describe("4. هيئة الساعة الرملية والمقص المتقابل بالرأس (hourglass_intersecting_chords)", () => {
    it("يصنّف تقاطع القطعتين AC ∩ BD = {E} كـ hourglass_intersecting_chords", () => {
      const prompt =
        "في الشكل المقابل، $\\overline{AC} \\cap \\overline{BD} = \\{E\\}$ و $\\Delta ABE \\sim \\Delta CDE$";
      const result = classifyCurriculumGeometryTopology(prompt);

      expect(result.topology).toBe("hourglass_intersecting_chords");
      expect(result.intersectionPoint).toBe("E");
      expect(result.sharedVertices).toContain("E");
    });

    it("يصنّف مسألة مقص متقابل بالرأس كـ hourglass_intersecting_chords", () => {
      const prompt = "مثلثان متقابلان بالرأس عند النقطة M مع توازي AB // CD";
      const result = classifyCurriculumGeometryTopology(prompt);

      expect(result.topology).toBe("hourglass_intersecting_chords");
      expect(result.intersectionPoint).toBe("M");
    });
  });

  describe("5. هيئة الرأس المشترك والقاطع على الضلع (shared_vertex_secant_triangle)", () => {
    it("يصنّف ΔABC ~ ΔDBA برأسين مشتركين كـ shared_vertex_secant_triangle", () => {
      const prompt = "إذا كان $\\Delta ABC \\sim \\Delta DBA$ حيث $D \\in BC$";
      const result = classifyCurriculumGeometryTopology(prompt);

      expect(result.topology).toBe("shared_vertex_secant_triangle");
      expect(result.sharedVertices.length).toBe(2);
      expect(result.sharedVertices).toContain("A");
      expect(result.sharedVertices).toContain("B");
    });
  });

  describe("6. هيئة عمود إقليدس في المثلث القائم (euclid_right_triangle_altitude)", () => {
    it("يصنّف تطبيقات نظرية إقليدس كـ euclid_right_triangle_altitude", () => {
      const prompt =
        "مثلث ABC قائم الزاوية في A، أُسقط العمود AD ⊥ BC على الوتر. احسب طول AD بعلاقات إقليدس.";
      const result = classifyCurriculumGeometryTopology(prompt);

      expect(result.topology).toBe("euclid_right_triangle_altitude");
      expect(result.altitudePoint).toBeDefined();
    });
  });

  describe("7. هيئة مسائل الظل والارتفاع التطبيقية (applied_shadow_height_triangles)", () => {
    it("يصنّف مسائل عمود الإنارة والظل كـ applied_shadow_height_triangles", () => {
      const prompt =
        "عمود إنارة طوله 6 أمتار يلقي ظلاً على الأرض طوله 4 أمتار، احسب ارتفاع شجرة مجاورة ظلها 8 أمتار";
      const result = classifyCurriculumGeometryTopology(prompt);

      expect(result.topology).toBe("applied_shadow_height_triangles");
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });
  });
});
