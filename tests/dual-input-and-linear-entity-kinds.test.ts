/**
 * @file dual-input-and-linear-entity-kinds.test.ts
 * @description اختبارات الانحدار الشاملة لبنية الإدخال المزدوج والتمييز الهندسي الدقيق بين الشعاع والمستقيم والقطعة المستقيمة،
 * إضافةً إلى التحقق الآلي من تجاوز عتبة الدقة المرجعية (> 90%) على كامل المجموعة الذهبية.
 */

import { describe, it, expect } from "vitest";
import { extractLinearEntityKinds } from "@/core/geometry-engine/description-intake/linear-entity-kind-extractor";
import { resolveDualGeometryInputContext } from "@/core/geometry-engine/description-intake/dual-geometry-input-context";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";
import { loadGoldenGeometryCorpus } from "@/core/geometry-engine/baseline-measurement/golden-corpus-json-directory-loader";
import { classifyBaselineCase } from "@/core/geometry-engine/baseline-measurement/baseline-case-outcome-classifier";
import { summarizeBaselineResults } from "@/core/geometry-engine/baseline-measurement/baseline-coverage-report-aggregator";

describe("Dual-Input Pipeline & Linear Entity Kinds (Ray / Line / Segment)", () => {
  it("يميز بدقة بين الشعاع (\\overrightarrow) والمستقيم (\\overleftrightarrow) والقطعة المستقيمة (\\overline) قبل التطبيع", () => {
    const map = extractLinearEntityKinds(
      "الشعاع \\overrightarrow{AB} يقطع المستقيم \\overleftrightarrow{CD} وتصل القطعة \\overline{EF}"
    );
    expect(map.get("AB")).toEqual({ kind: "ray", from: "A", to: "B" });
    expect(map.get("CD")).toEqual({ kind: "line", from: "C", to: "D" });
    expect(map.get("EF")).toEqual({ kind: "segment", from: "E", to: "F" });
  });

  it("يرسم الشعاع بسهم طرفي واحد والمستقيم بسهمين والقطعة المستقيمة بلا أسهم في SVG النهائي", () => {
    const diag = matchGeometryWithDiagnostics(
      {
        geometryTag: "المستقيم \\overleftrightarrow{AB} يتقاطع مع الشعاع \\overrightarrow{MC} عند M",
        problemPrompt: "إذا كان m(\\angle AMC) = 48° فأوجد m(\\angle CMB)",
      },
      "dual_linear_fig",
      "english"
    );

    expect(diag.warnings).toEqual([]);
    expect(diag.decision).toBe("green");
    expect(diag.figure).toBeDefined();

    const segs = diag.figure!.segments;
    const lineSegs = segs.filter((s) => s.isLine && s.arrowAtStart && s.arrowAtEnd);
    const raySegs = segs.filter((s) => s.isRay && (s.arrowAtEnd || s.arrowAtStart));
    expect(lineSegs.length).toBeGreaterThanOrEqual(1);
    expect(raySegs.length).toBeGreaterThanOrEqual(1);

    const svg = projectGeometryFigureToSVGMarkup(diag.figure!, { numeralMode: "western" });
    const arrowPolygons = svg.match(/<polygon points="/g) ?? [];
    expect(arrowPolygons.length).toBeGreaterThanOrEqual(3); // سهمان للمستقيم + سهم للشعاع
  });

  it("يبني مستقيمان متعامدان واستقامة واحدة وشعاعات بلا أي مضلع وهمي", () => {
    const perpDiag = matchGeometryWithDiagnostics(
      {
        geometryTag: "المستقيم AB ⊥ المستقيم CD عند النقطة M",
        problemPrompt: "ارسم المستقيمين المتعامدين وحدد الزاوية القائمة عند M.",
      },
      "standalone_perp",
      "english"
    );
    expect(perpDiag.decision).toBe("green");
    expect(perpDiag.figure?.angles.some((a) => a.isRightAngle)).toBe(true);
    expect(perpDiag.figure?.segments.some((s) => s.isLine)).toBe(true);

    const collinearDiag = matchGeometryWithDiagnostics(
      {
        geometryTag: "النقط أ، ب، جـ على استقامة واحدة",
        problemPrompt: "عيّن الشعاع ب أ والشعاع ب جـ على استقامة واحدة.",
      },
      "standalone_collinear",
      "arabic"
    );
    expect(collinearDiag.warnings).toEqual([]);
    expect(collinearDiag.decision).toBe("green");
    expect(collinearDiag.figure?.vertices.length).toBeGreaterThanOrEqual(3);
  });

  it("يدمج الإدخال المزدوج { geometryTag, problemPrompt } لاستكمال الأطوال والزوايا والمطلوب «؟»", () => {
    const ctx = resolveDualGeometryInputContext({
      geometryTag: "مثلث ABC قائم في B",
      problemPrompt: "إذا كان AB = 6 سم و BC = 8 سم فأوجد طول AC.",
    });
    expect(ctx.hasSeparateDualSources).toBe(true);

    const diag = matchGeometryWithDiagnostics(
      {
        geometryTag: "مثلث ABC قائم في B",
        problemPrompt: "إذا كان AB = 6 سم و BC = 8 سم فأوجد طول AC.",
      },
      "dual_merge_tri",
      "english"
    );

    expect(diag.warnings).toEqual([]);
    expect(diag.warnings).toEqual([]);
    expect(diag.decision).toBe("green");
    expect(diag.figure).toBeDefined();
    const sAC = diag.figure!.segments.find(
      (s) =>
        (s.fromVertexId.endsWith("_A") && s.toVertexId.endsWith("_C")) ||
        (s.fromVertexId.endsWith("_C") && s.toVertexId.endsWith("_A"))
    );
    expect(sAC?.lengthLabel?.value).toBe("؟");
    const svg = projectGeometryFigureToSVGMarkup(diag.figure!, { numeralMode: "western" });
    expect(svg).toContain("6");
    expect(svg).toContain("8");
  });

  it("يرفض التعارض الرقمي الصريح بين الوصف الهندسي ومعطيات السؤال بقرار أصفر ويمنع الرسم النظري بقرار أحمر", () => {
    const conflict = matchGeometryWithDiagnostics(
      {
        geometryTag: "مثلث ABC فيه AB = 5 سم و BC = 7 سم",
        problemPrompt: "في الشكل المقابل AB = 9 سم، أوجد محيط المثلث.",
      },
      "dual_conflict",
      "english"
    );
    expect(conflict.figure).toBeUndefined();
    expect(conflict.decision).toBe("yellow");

    const theoretical = matchGeometryWithDiagnostics(
      {
        geometryTag: "",
        problemPrompt: "المربع هو شكل رباعي أضلاعه الأربعة متساوية في الطول وجميع زواياه قائمة.",
      },
      "dual_theory",
      "arabic"
    );
    expect(theoretical.figure).toBeUndefined();
    expect(theoretical.decision).toBe("red");
  });

  it("يحقق دقة إنتاج > 90% وصفر أشكال مفقودة أو هلوسات على المجموعة الذهبية الكاملة", () => {
    const cases = loadGoldenGeometryCorpus();
    const results = cases.map(classifyBaselineCase);
    const summary = summarizeBaselineResults(cases, results);

    expect(summary.total).toBeGreaterThanOrEqual(437);
    expect(summary.byOutcome.false_figure_on_no_figure_case).toBe(0);
    expect(summary.byOutcome.missed_figure).toBe(0);
    expect(summary.specTotalCount).toBeGreaterThan(100);
    const specMatchRate = summary.specMatchedCount / summary.specTotalCount;
    expect(specMatchRate).toBeGreaterThanOrEqual(0.9);
  });
});
