/**
 * @file prep-grade1-coordinates-catalog.test.ts
 * @description اختبارات شاملة لفهرس ومنشئات درس الإحداثيات (المساقط ومنتصف القطعة المستقيمة) (1ع).
 * @invariant يلتزم بحدود الأسطر (< 200 سطر) وTypeScript الصارم وفق دستور المنصة (AGENTS.md).
 */

import { describe, expect, it } from "vitest";
import {
  matchPrepGrade1CoordinatesFigure,
} from "../src/core/geometry-engine/curriculum-catalogs/prep-stage/grade-1/prep-grade1-coordinates-catalog";
import {
  buildSegmentProjectionOnXAxisFigure,
  buildSegmentProjectionOnYAxisFigure,
  buildSegmentProjectionsBothAxesFigure,
} from "../src/core/geometry-engine/curriculum-catalogs/prep-stage/grade-1/prep-grade1-coordinate-projections-builder";
import {
  buildSegmentMidpointCoordinatesFigure,
  buildSegmentMidpointNumericalFigure,
} from "../src/core/geometry-engine/curriculum-catalogs/prep-stage/grade-1/prep-grade1-segment-midpoint-coordinates-builder";
import {
  matchArabicDescriptionToCanonicalGeometryFigure,
  matchGeometryWithDiagnostics,
} from "../src/core/geometry-engine/natural-arabic-geometry-matcher";

describe("Prep Grade 1 Coordinates and Projections Geometry Catalog", () => {
  it("1. matches Problem 1 p.253: Segment AB projection on X-axis with A(2, 3) and B(-4, -1) length = 6", () => {
    const fig = matchArabicDescriptionToCanonicalGeometryFigure(
      "نرسم AB في المستوى الإحداثي حيث A(2, 3) و B(-4, -1) ثم نوجد مسقط AB على محور X وطوله = 6 وحدات"
    );

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("مسقط القطعة AB على محور السينات");
    expect(fig?.titleArabic).toContain("6 وحدات");
    expect(fig?.familyId).toBe("analytic_coordinate_family");
  });

  it("2. matches Problem 2 p.253: Segment CD projection on Y-axis with C(1, 4) and D(5, 1) length = 3", () => {
    const fig = matchArabicDescriptionToCanonicalGeometryFigure(
      "نرسم CD في المستوى الإحداثي حيث C(1, 4) و D(5, 1) ثم نوجد مسقط CD على محور y وطوله = 3 وحدات"
    );

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("مسقط القطعة CD على محور الصادات");
    expect(fig?.titleArabic).toContain("3 وحدات");
  });

  it("3. matches Try by yourself 2 p.253: Segment projections on both axes with A(3, -2) and B(-4, 4)", () => {
    const fig = matchArabicDescriptionToCanonicalGeometryFigure(
      "إذا كان A(3, -2) و B(-4, 4) ارسم AB في المستوى الإحداثي ثم أوجد طول مسقطها على المحور X والمحور y"
    );

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("المسقط السيني = 7 وحدات");
    expect(fig?.titleArabic).toContain("المسقط الصادي = 6 وحدات");
  });

  it("4. matches Midpoint coordinates general formula M = ((x1+x2)/2, (y1+y2)/2)", () => {
    const fig = matchArabicDescriptionToCanonicalGeometryFigure(
      "إحداثيا منتصف قطعة مستقيمة M هي نقطة تنتمي للمستقيمة وتكون على بعدين متساويين من طرفيها"
    );

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("إحداثيا منتصف قطعة مستقيمة");
    expect(fig?.segments.some(s => s.strokeStyle === "dashed")).toBe(true);
  });

  it("5. matches numerical midpoint coordinates A(1, 2) and B(5, 6) -> M(3, 4)", () => {
    const fig = matchArabicDescriptionToCanonicalGeometryFigure(
      "أوجد إحداثيي منتصف القطعة المستقيمة AB حيث A(1, 2) و B(5, 6)"
    );

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("M(3, 4)");
    expect(fig?.vertices.length).toBe(8);
  });

  it("6. matches general coordinates lesson description", () => {
    const fig = matchPrepGrade1CoordinatesFigure("درس الإحداثيات والمساقط في المستوى الإحداثي أولى إعدادي");

    expect(fig).toBeDefined();
    expect(fig?.familyId).toBe("analytic_coordinate_family");
  });

  it("7. matches with diagnostics cleanly", () => {
    const res = matchGeometryWithDiagnostics(
      "مسقط AB على محور X حيث A(2, 3) و B(-4, -1)",
      "diag_coord_fig"
    );

    expect(res.figure).toBeDefined();
    expect(res.source).toBe("catalog");
  });

  it("8. supports Arabic notation language for axes cleanly", () => {
    const fig = buildSegmentProjectionOnXAxisFigure({
      figureId: "ar_coord",
      notationLanguage: "arabic",
    });

    expect(fig.vertices[1].label).toBe("س");
    expect(fig.vertices[3].label).toBe("ص");
    expect(fig.vertices[4].label).toBe("و");
  });

  it("9. verifies dashed projection lines exist in midpoint figure", () => {
    const fig = buildSegmentMidpointCoordinatesFigure({ figureId: "mid_fig" });

    const dashed = fig.segments.filter(s => s.strokeStyle === "dashed");
    expect(dashed.length).toBeGreaterThanOrEqual(6);
  });

  it("10. verifies tickMarks on midpoint halves", () => {
    const fig = buildSegmentMidpointNumericalFigure({ figureId: "num_mid" });

    const ticked = fig.segments.filter(s => s.tickMarks === 1);
    expect(ticked.length).toBe(2);
  });
});
