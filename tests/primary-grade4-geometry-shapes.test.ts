/**
 * @file primary-grade4-geometry-shapes.test.ts
 * @description اختبارات شاملة لأشكال هندسة الصف الرابع الابتدائي:
 * - المساحة والمحيط للمستطيل والمربع واستخراج الأبعاد الحقيقية والوحدات.
 * - إيجاد البعد المجهول (المستطيل والمربع بمعلومية المحيط أو المساحة).
 * - تركيب الأشكال الهندسية (L، T، U مقلوب، المستطيلات المتجاورة، المقتطع).
 * - التحقق من صدق الشكل البصري وتوليد SVG نقي متطابق مع كتب سلاح التلميذ والامتحانات.
 */

import { describe, expect, it } from "vitest";
import { matchPrimaryGrade4GeometryFigure } from "@/core/geometry-engine/curriculum-catalogs/primary-stage/grade-4/primary-grade4-geometry-catalog";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";
import { isFigureFaithfulToPrompt } from "@/core/geometry-engine/verification/geometry-figure-fidelity-gate";

describe("Grade 4 Primary - Geometry Figures Catalog & Engine", () => {
  describe("1. المساحة والمحيط للمستطيل والمربع (Perimeter & Area)", () => {
    it("يبني مستطيلاً دقيق الأبعاد 12 سم × 4 سم لحساب المساحة والمحيط", () => {
      const prompt = "مستطيل أبعاده 12 سم و 4 سم لحساب المحيط والمساحة";
      const fig = matchPrimaryGrade4GeometryFigure(prompt, "g4_rect_1");

      expect(fig).toBeDefined();
      expect(fig?.familyId).toBe("quadrilateral_family");
      expect(fig?.segments.some((s) => s.lengthLabel?.value === 12)).toBe(true);
      expect(fig?.segments.some((s) => s.lengthLabel?.value === 4)).toBe(true);

      const svg = projectGeometryFigureToSVGMarkup(fig!);
      expect(svg).toContain("<svg");
      expect(svg).toContain("12");
      expect(svg).toContain("4");
      expect(isFigureFaithfulToPrompt(fig!, prompt)).toBe(true);
    });

    it("يدعم الوحدات المختلفة مثل ديسم ومم وم وكيلومتر", () => {
      const prompt = "أوجد محيط المستطيل الذي أبعاده 8 ديسم و 3 ديسم";
      const fig = matchPrimaryGrade4GeometryFigure(prompt, "g4_rect_units");

      expect(fig).toBeDefined();
      expect(fig?.segments.some((s) => s.lengthLabel?.unit === "ديسم")).toBe(true);
      expect(fig?.segments.some((s) => s.lengthLabel?.value === 8)).toBe(true);
      expect(fig?.segments.some((s) => s.lengthLabel?.value === 3)).toBe(true);
    });

    it("يبني مربعاً طول ضلعه 5 مم", () => {
      const prompt = "مربع طول ضلعه 5 مم لحساب المحيط";
      const fig = matchPrimaryGrade4GeometryFigure(prompt, "g4_sq_1");

      expect(fig).toBeDefined();
      expect(fig?.segments.some((s) => s.lengthLabel?.value === 5)).toBe(true);
      expect(fig?.segments.some((s) => s.lengthLabel?.unit === "مم")).toBe(true);
    });

    it("يبني مربعاً مائلاً (Rotated Diamond) 45 درجة كما في سلاح التلميذ", () => {
      const prompt = "مربع مائل طول ضلعه 8 سم لحساب المحيط";
      const fig = matchPrimaryGrade4GeometryFigure(prompt, "g4_sq_rot");

      expect(fig).toBeDefined();
      expect(fig?.titleArabic).toContain("مائل");
      expect(fig?.vertices.length).toBe(4);
      expect(fig?.segments.some((s) => s.lengthLabel?.value === 8)).toBe(true);

      const svg = projectGeometryFigureToSVGMarkup(fig!);
      expect(svg).toContain("<svg");
      expect(svg).toContain("8");
    });
  });

  describe("2. إيجاد البعد المجهول (Unknown Dimension with Interior Badge)", () => {
    it("يبني مستطيلاً بمحيط معطى 24 سم وطول 8 سم والبعد المجهول x مع شارة داخلية", () => {
      const prompt = "أوجد طول الضلع المجهول x في المستطيل الذي محيطه 24 سم وطوله 8 سم";
      const fig = matchPrimaryGrade4GeometryFigure(prompt, "g4_unk_rect_p");

      expect(fig).toBeDefined();
      expect(fig?.interiorBadges).toBeDefined();
      expect(fig?.interiorBadges?.[0].text).toBe("المحيط = 24 سم");
      expect(fig?.segments.some((s) => String(s.lengthLabel?.value).includes("x"))).toBe(true);
      expect(fig?.segments.some((s) => String(s.lengthLabel?.value).includes("8"))).toBe(true);

      const svg = projectGeometryFigureToSVGMarkup(fig!);
      expect(svg).toContain("المحيط = 24 سم");
      expect(svg).toContain("8 سم");
    });

    it("يبني مستطيلاً بمساحة معطاة 30 سم² وعرض 5 سم والبعد المجهول x", () => {
      const prompt = "أوجد طول الضلع المجهول x في المستطيل الذي مساحته 30 سم² وعرضه 5 سم";
      const fig = matchPrimaryGrade4GeometryFigure(prompt, "g4_unk_rect_a");

      expect(fig).toBeDefined();
      expect(fig?.interiorBadges?.[0].text).toBe("المساحة = 30 سم²");
      expect(fig?.segments.some((s) => String(s.lengthLabel?.value).includes("x"))).toBe(true);
      expect(fig?.segments.some((s) => String(s.lengthLabel?.value).includes("5"))).toBe(true);

      const svg = projectGeometryFigureToSVGMarkup(fig!);
      expect(svg).toContain("المساحة = 30 سم²");
    });

    it("يبني مربعاً بمحيط معطى 28 سم وطول الضلع المجهول y", () => {
      const prompt = "أوجد طول الضلع المجهول y في المربع الذي محيطه 28 سم";
      const fig = matchPrimaryGrade4GeometryFigure(prompt, "g4_unk_sq_p");

      expect(fig).toBeDefined();
      expect(fig?.interiorBadges?.[0].text).toBe("المحيط = 28 سم");
      expect(fig?.segments.some((s) => String(s.lengthLabel?.value).includes("y"))).toBe(true);
    });

    it("يبني مربعاً بمساحة معطاة 64 م² وطول الضلع المجهول y", () => {
      const prompt = "أوجد طول الضلع المجهول y في المربع الذي مساحته 64 م²";
      const fig = matchPrimaryGrade4GeometryFigure(prompt, "g4_unk_sq_a");

      expect(fig).toBeDefined();
      expect(fig?.interiorBadges?.[0].text).toBe("المساحة = 64 م²");
      expect(fig?.segments.some((s) => String(s.lengthLabel?.value).includes("y"))).toBe(true);
    });
  });

  describe("3. تركيب الأشكال الهندسية (Composite Figures)", () => {
    it("يبني شكل حرف L بأبعاده 8 سم و 9 سم والمجاهيل a و b", () => {
      const prompt = "شكل مركب حرف L أبعاده 8 سم و 9 سم و 3 سم و 1 سم والضلعان المجهولان a و b";
      const fig = matchPrimaryGrade4GeometryFigure(prompt, "g4_comp_l");

      expect(fig).toBeDefined();
      expect(fig?.branchId).toBe("quad_composite_rectilinear_shape");
      expect(fig?.vertices.length).toBe(6);
      expect(fig?.segments.some((s) => String(s.lengthLabel?.value).includes("a"))).toBe(true);
      expect(fig?.segments.some((s) => String(s.lengthLabel?.value).includes("b"))).toBe(true);

      const svg = projectGeometryFigureToSVGMarkup(fig!);
      expect(svg).toContain("<svg");
      expect(svg).toContain("a");
      expect(svg).toContain("b");
    });

    it("يبني شكل حرف T برأس أفقي وساق رأسية", () => {
      const prompt = "شكل مركب حرف T عرضه العلوي 11 سم وارتفاع رأسه 2 سم وساقه 5 سم و 5 سم";
      const fig = matchPrimaryGrade4GeometryFigure(prompt, "g4_comp_t");

      expect(fig).toBeDefined();
      expect(fig?.vertices.length).toBe(8);
      expect(fig?.segments.some((s) => String(s.lengthLabel?.value).includes("11"))).toBe(true);
    });

    it("يبني شكل قوس مجوف U مقلوب (Inverted U Arch)", () => {
      const prompt = "شكل قوس مجوف U مقلوب عرضه العلوي 10 كم وارتفاعه 8 كم وتجويف وسطي مجهول b وقاعدتان 4 كم ومجهول a";
      const fig = matchPrimaryGrade4GeometryFigure(prompt, "g4_comp_arch");

      expect(fig).toBeDefined();
      expect(fig?.vertices.length).toBe(8);
      expect(fig?.segments.some((s) => String(s.lengthLabel?.value).includes("10"))).toBe(true);
      expect(fig?.segments.some((s) => String(s.lengthLabel?.value).includes("8"))).toBe(true);
      expect(fig?.segments.some((s) => String(s.lengthLabel?.value).includes("4"))).toBe(true);
      expect(fig?.segments.some((s) => String(s.lengthLabel?.value).includes("b"))).toBe(true);
      expect(fig?.segments.some((s) => String(s.lengthLabel?.value).includes("a"))).toBe(true);
    });

    it("يبني شكل مستطيلين ملتصقين (الدرج)", () => {
      const prompt = "شكل مركب من مستطيلين ملتصقين أبعادهما 5 سم و 5 سم و 3 سم و 3 سم لحساب المساحة والمحيط";
      const fig = matchPrimaryGrade4GeometryFigure(prompt, "g4_comp_adjacent");

      expect(fig).toBeDefined();
      expect(fig?.polygons?.length).toBe(2);
      expect(fig?.segments.some((s) => s.strokeStyle === "dashed")).toBe(true);
    });
  });
});
