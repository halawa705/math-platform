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
import { matchGeometryWithDiagnostics } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
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

describe("Phase 2 Task 2.3: Zero Legacy Fixed Catalogs — Parametric Compositor Routing", () => {
  it("routes prep parallelogram figures directly through parametric compositor without legacy catalogs", () => {
    const desc = "في الشكل المقابل أ ب جـ د متوازي أضلاع قطراه يتقاطعان في م";
    const res = matchGeometryWithDiagnostics(desc, "test_cat", "arabic");

    expect(res.source).toBe("compositor");
    expect(res.figure).toBeDefined();
    expect(res.decision).toBe("green");
  });

  it("returns no figure for unrecognized pure arithmetic non-geometry text", () => {
    const res = matchGeometryWithDiagnostics("احسب ناتج جمع 15 + 27", "test_cat");
    expect(res.figure).toBeUndefined();
    expect(res.source).toBe("none");
  });

  it("keeps similarity contexts routed parametrically with zero catalog fallback", () => {
    const simDesc =
      "في الشكل المقابل مثلثان متشابهان ABC ~ DEF فيها AB = 6 سم و BC = 8 سم و AC = 10 سم و DE = 3 سم";
    const res = matchGeometryWithDiagnostics(simDesc, "test_cat", "english");

    expect(res.source).not.toBe("catalog");
    expect(res.figure).toBeDefined();
  });
});
