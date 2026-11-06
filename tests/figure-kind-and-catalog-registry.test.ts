/**
 * @file figure-kind-and-catalog-registry.test.ts
 * @description اختبارات تصنيف نوع الشكل (FigureKind) وسجل المطابقات الموحد لكشف الالتباس (المرحلة 2):
 * يتحقق من دقة التوجيه المبكر وخلو الكتالوجات من التنافس بحسب الأسبقية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 300 سطر).
 */

import { describe, it, expect } from "vitest";
import {
  resolveFigureKind,
} from "../src/core/geometry-engine/description-intake/figure-kind-resolver";
import {
  isSimilarityGeometryContext,
} from "../src/core/geometry-engine/similarity-family/similarity-context-detector";
import {
  matchFromCatalogRegistry,
  GEOMETRY_CATALOG_MATCHERS,
} from "../src/core/geometry-engine/curriculum-catalogs/geometry-catalog-match-registry";
import {
  isEuclideanFigureKind,
  isCartesianFigureKind,
  isStatisticsFigureKind,
  isVisualModelFigureKind,
  isSpatial3DFigureKind,
} from "../src/core/ssot/figure-kind-ssot";

describe("Phase 2 Task 2.1: FigureKind Resolution", () => {
  it("resolves euclidean plane kind from geometry text and entities", () => {
    const kind = resolveFigureKind({
      rawText: "في الشكل المقابل: مثلث أ ب جـ قائم في ب ؛ أ ب = 6 سم ؛ ب جـ = 8 سم",
      branchId: "plane_geometry",
    });
    expect(kind).toBe("euclidean_plane");
    expect(isEuclideanFigureKind(kind)).toBe(true);
  });

  it("resolves cartesian function kind for function graphs", () => {
    const kind = resolveFigureKind({
      rawText: "ارسم منحنى الدالة ص = س² - 4 في الفترة [-3 ، 3]",
      branchId: "functions",
    });
    expect(kind).toBe("cartesian_function");
    expect(isCartesianFigureKind(kind)).toBe(true);
  });

  it("resolves statistics chart kind for boxplots and histograms", () => {
    const kind = resolveFigureKind({
      rawText: "من مخطط الصندوق المقابل أوجد قيمة الوسيط",
      branchId: "statistics_probability",
    });
    expect(kind).toBe("statistics_chart");
    expect(isStatisticsFigureKind(kind)).toBe(true);
  });

  it("resolves spatial 3D kind for pyramid and cube descriptions", () => {
    const kind = resolveFigureKind({
      rawText: "هرم رباعي منتظم طول ضلع قاعدته 8 سم وارتفاعه 10 سم",
      branchId: "solid_geometry",
    });
    expect(kind).toBe("spatial_3d");
    expect(isSpatial3DFigureKind(kind)).toBe(true);
  });

  it("resolves number line kind for intervals", () => {
    const kind = resolveFigureKind({
      rawText: "مثل الفترة المغلقة [2 ، 5] على خط الأعداد",
    });
    expect(kind).toBe("number_line");
    expect(isCartesianFigureKind(kind)).toBe(true);
  });

  it("resolves arithmetic visual model for area models", () => {
    const kind = resolveFigureKind({
      rawText: "أوجد ناتج الضرب باستخدام نموذج مساحة المستطيل: 24 × 15",
      branchId: "numbers",
    });
    expect(kind).toBe("arithmetic_visual_model");
    expect(isVisualModelFigureKind(kind)).toBe(true);
  });

  it("resolves none for purely theoretical problems", () => {
    const kind = resolveFigureKind({
      rawText: "أثبت أن مجموع قياسات زوايا المثلث الداخلة تساوي 180° بالبرهان النظري",
    });
    expect(kind).toBe("none");
  });
});

describe("Phase 2 Task 2.2: Unified Similarity Context Detector", () => {
  it("detects similarity from explicit keywords and symbols", () => {
    expect(isSimilarityGeometryContext("إذا كان Δ ABC ~ Δ DEF")).toBe(true);
    expect(isSimilarityGeometryContext("مضلعان متشابهان نسبة التشابه بينهما 3 : 2")).toBe(true);
    expect(isSimilarityGeometryContext("سارية علم ظلها 6 أمتار")).toBe(true);
  });

  it("detects Euclid altitude configuration as similarity context", () => {
    expect(isSimilarityGeometryContext("مثلث أ ب جـ قائم في أ ؛ أ د ⊥ ب جـ")).toBe(true);
  });

  it("detects Thales parallel segments as similarity context", () => {
    expect(isSimilarityGeometryContext("مثلث أ ب جـ ؛ د ∈ أ ب ؛ هـ ∈ أ جـ ؛ د هـ // ب جـ")).toBe(true);
  });

  it("rejects analytic coordinate problems from similarity context", () => {
    expect(isSimilarityGeometryContext("معادلة الخط المستقيم المار بالنقطتين (2 ، 3) و (4 ، 5)")).toBe(false);
  });

  it("rejects pure arithmetic or unrelated problems", () => {
    expect(isSimilarityGeometryContext("احسب محيط المستطيل الذي بعداه 5 سم و 3 سم")).toBe(false);
  });
});

describe("Phase 2 Task 2.3: Geometry Catalog Match Registry", () => {
  it("registry contains all 24 curriculum catalogs across primary and prep", () => {
    expect(GEOMETRY_CATALOG_MATCHERS.length).toBe(24);
    const stages = new Set(GEOMETRY_CATALOG_MATCHERS.map((c) => c.stage));
    expect(stages.has("primary")).toBe(true);
    expect(stages.has("preparatory")).toBe(true);
  });

  it("matches a valid prep 1 congruence description without ambiguity", () => {
    const desc = "في الشكل المقابل أ ب جـ د متوازي أضلاع قطراه يتقاطعان في م";
    const res = matchFromCatalogRegistry(desc, "test_cat");

    expect(res.ambiguity).toBe(false);
    if (res.figure) {
      expect(res.matchedCatalogId).toBeDefined();
    }
  });

  it("returns no ambiguity and empty result for unrecognized non-geometry text", () => {
    const res = matchFromCatalogRegistry("احسب ناتج جمع 15 + 27", "test_cat");
    expect(res.figure).toBeUndefined();
    expect(res.ambiguity).toBe(false);
    expect(res.candidateCatalogIds).toHaveLength(0);
  });

  it("prevents triangle congruence catalog from hijacking explicit similarity contexts", () => {
    const simDesc = "مثلثان متشابهان ABC ~ DEF فيهما زاوية B = 60°";
    const res = matchFromCatalogRegistry(simDesc, "test_cat", "english", true);

    expect(res.candidateCatalogIds).not.toContain("prep-2-triangle-congruence");
  });
});
