/**
 * @file primary-grade3-geometry.test.ts
 * @description اختبارات شاملة لمنهج الصف الثالث الابتدائي وسياسة الطباعة للابتدائي (المرحلة 5):
 * - نماذج شرائح الكسور
 * - نماذج دوائر الكسور
 * - المحيط والمساحة على الشبكة التربيعية
 * - قراءة الوقت بساعة العقارب
 * - التكامل مع السجل المركزي للمطابقات
 * - سياسة الطباعة والتخطيط للمرحلة الابتدائية (حجم 15pt، عمود واحد، أسطر إجابة أوسع)
 */

import { describe, it, expect } from "vitest";
import {
  buildMathFractionModelFigure,
  buildMathFractionStripSvgMarkup,
  buildMathFractionCircleSvgMarkup,
} from "@/core/geometry-engine/elementary-visuals/math-fraction-models-svg-builder";
import {
  buildMathGridAreaFigure,
  buildMathGridAreaSvgMarkup,
} from "@/core/geometry-engine/elementary-visuals/math-grid-area-perimeter-svg-builder";
import { detectAndBuildMathElementaryVisualFigure } from "@/core/geometry-engine/elementary-visuals/math-elementary-visuals-dispatcher";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { applyPrimaryStagePrintPolicy, getPrimaryStagePrintPreset } from "@/core/pdf-layout-engine/primary-stage-print-policy-ssot";
import { DEFAULT_PDF_PRINT_SETTINGS_SSOT } from "@/core/ssot/pdf-print-settings-ssot";

describe("Primary Grade 3 & Primary Print Policy (Phase 5)", () => {
  describe("Task 5.1: Primary Stage Print & Layout Policy", () => {
    it("returns 15pt and 1-column layout for Grade 3/4 preset", () => {
      const preset = getPrimaryStagePrintPreset("prim_grade_3");
      expect(preset.exactFontSizePt).toBe(15);
      expect(preset.columnsCount).toBe(1);
      expect(preset.answerSpaceLines).toBe(3);
      expect(preset.strokeWidthMultiplier).toBe(1.5);
    });

    it("applies primary print policy to default settings", () => {
      const updated = applyPrimaryStagePrintPolicy(DEFAULT_PDF_PRINT_SETTINGS_SSOT, "prim_grade_3");
      expect(updated.exactFontSizePt).toBe(15);
      expect(updated.columnsCount).toBe(1);
      expect(updated.answerSpaceLines).toBe(3);
      expect(updated.fontFamilyId).toBe("readex_pro");
    });
  });

  describe("Task 5.2: Grade 3 Fractions Models", () => {
    it("builds fraction strip for 3/4", () => {
      const svg = buildMathFractionStripSvgMarkup({
        numerator: 3,
        denominator: 4,
        shape: "strip",
      });
      expect(svg).toContain("<svg");
      expect(svg).toContain("#3B82F6");
      expect(svg).toContain("3 / 4");
    });

    it("builds fraction circle for 2/5", () => {
      const svg = buildMathFractionCircleSvgMarkup({
        numerator: 2,
        denominator: 5,
        shape: "circle",
      });
      expect(svg).toContain("<svg");
      expect(svg).toContain("<path");
      expect(svg).toContain("2 / 5");
    });

    it("matches fraction description through core elementary visuals engine", () => {
      const desc = "نموذج شريحة كسر 3 / 8 مع تظليل 3 أجزاء من 8";
      const fig = detectAndBuildMathElementaryVisualFigure(desc, "fig_p3_frac");
      expect(fig).toBeDefined();
      expect(fig?.familyId).toBe("primary_visual_models_family");
      expect(fig?.rawSvgMarkup).toContain("<svg");
    });

    it("matches circular fraction description", () => {
      const desc = "دائرة كسور مقسمة إلى 6 أجزاء مظلل منها 4";
      const fig = detectAndBuildMathElementaryVisualFigure(desc, "fig_p3_circle");
      expect(fig).toBeDefined();
      expect(fig?.rawSvgMarkup).toContain("<path");
    });

    it("builds explicit fraction figure wrapper cleanly", () => {
      const fig = buildMathFractionModelFigure({ numerator: 1, denominator: 4, shape: "strip" }, "f1");
      expect(fig.rawSvgMarkup).toContain("1 / 4");
    });
  });

  describe("Task 5.2: Grid Perimeter & Area", () => {
    it("renders square grid with shaded rectangle 4x3", () => {
      const svg = buildMathGridAreaSvgMarkup({
        gridCols: 6,
        gridRows: 5,
        shapeWidth: 4,
        shapeHeight: 3,
      });
      expect(svg).toContain("<svg");
      expect(svg).toContain("4 وحدات");
      expect(svg).toContain("3 وحدات");
      expect(svg).toContain("الشبكة التربيعية");
    });

    it("matches grid perimeter & area description via core engine", () => {
      const desc = "احسب محيط ومساحة الشكل على الشبكة التربيعية بأبعاد 5 في 3";
      const fig = detectAndBuildMathElementaryVisualFigure(desc, "fig_p3_grid");
      expect(fig).toBeDefined();
      expect(fig?.rawSvgMarkup).toContain("5 وحدات");
      expect(fig?.rawSvgMarkup).toContain("3 وحدات");
      const direct = buildMathGridAreaFigure({ gridCols: 7, gridRows: 5, shapeWidth: 5, shapeHeight: 3 }, "g");
      expect(direct.familyId).toBe("quadrilateral_family");
    });
  });

  describe("Task 5.2: Analog Clock Reading", () => {
    it("matches analog clock at 4:30", () => {
      const desc = "ساعة عقارب تشير إلى الساعة 4:30";
      const fig = detectAndBuildMathElementaryVisualFigure(desc, "fig_p3_clock");
      expect(fig).toBeDefined();
      expect(fig?.branchId).toBe("primary_analog_clock");
      expect(fig?.rawSvgMarkup).toContain("<svg");
    });
  });

  describe("Core Compositor Integration", () => {
    it("routes Grade 3 problems cleanly through compositor without catalogs", () => {
      const desc = "نموذج كسر 5/6 مستطيل مقسم إلى 6 أجزاء";
      const res = matchGeometryWithDiagnostics(desc, "test_p3_reg", "arabic");
      expect(res.source).toBe("compositor");
      expect(res.figure?.familyId).toBe("primary_visual_models_family");
    });
  });
});
