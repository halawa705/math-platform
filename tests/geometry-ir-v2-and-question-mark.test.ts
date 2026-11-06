/**
 * @file geometry-ir-v2-and-question-mark.test.ts
 * @description اختبارات الوحدة الشاملة للمرحلة 2 (IR v2، علامة الاستفهام «؟» للمطلوب، حارس تسريب الحل، القرار الثلاثي، الدوائر المتعددة، والمجسمات ثلاثية الأبعاد).
 */

import { describe, expect, it } from "vitest";
import { buildCircleIntersectingPairFigure } from "../src/core/geometry-engine/circle-family/circle-intersecting-pair-branch";
import { matchGeometryWithDiagnostics } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { buildCubeCuboid3DFigure } from "../src/core/geometry-engine/spatial-3d-family/cube-cuboid-prism-branch";
import { buildRightCircularCone3DFigure } from "../src/core/geometry-engine/spatial-3d-family/cylinder-cone-sphere-branch";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";
import {
  applyAskedQuestionMarkToFigure,
  extractGeometryAskedSpecFromPrompt,
} from "../src/core/geometry-engine/verification/geometry-asked-question-mark-resolver";
import { verifyNoSolutionLeakOnFigure } from "../src/core/geometry-engine/verification/geometry-solution-leak-guard";
import { evaluateFigureTriStateDecision } from "../src/core/geometry-engine/verification/geometry-tri-state-decision-gate";

describe("Phase 2 — IR v2, Question Mark («؟»), Solution Leak Guard & Tri-State Decision", () => {
  it("يضع علامة «؟» بنوع unknown على الضلع المطلوب إيجاد طوله في المسألة ويصيّرها في الـ SVG", () => {
    const prompt =
      "مثلث أ ب جـ قائم في ب فيه أ ب = 6 سم، ب جـ = 8 سم، أوجد طول أ جـ.";
    const res = matchGeometryWithDiagnostics(prompt, "fig_asked_len", "arabic");
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    expect(res.figure!.askedSpec?.kind).toBe("length");
    expect(res.figure!.askedSpec?.targetKey).toBe("AC");

    const unknownSeg = res.figure!.segments.find(
      (s) => s.lengthLabel?.labelKind === "unknown"
    );
    expect(unknownSeg).toBeDefined();
    expect(unknownSeg!.lengthLabel?.value).toBe("؟");

    const svg = projectGeometryFigureToSVGMarkup(res.figure!, {
      numeralMode: "western",
    });
    expect(svg).toContain(">؟<");
    expect(svg).not.toContain(">10 سم<"); // لا تسريب لوتر فيثاغورس المحسوب 10
  });

  it("لا يستبدل المتغير الجبري x بعلامة «؟» عندما تستخدم المسألة متغيراً صريحاً", () => {
    const prompt = "أوجد قيمة المجهول x في النموذج الشريطي حيث الكل 900 والجزءان x و 460.";
    const spec = extractGeometryAskedSpecFromPrompt(prompt);
    expect(spec?.kind).toBe("length");
    expect(spec?.variableSymbol).toBe("x");
  });

  it("يضع شارة «المساحة = ؟» داخل الشكل عندما يكون المطلوب حساب المساحة", () => {
    const prompt =
      "[رسم هندسي: مثلث أ ب جـ قائم في ب;أ ب = 6 سم;ب جـ = 8 سم] احسب مساحة المثلث أ ب جـ.";
    const res = matchGeometryWithDiagnostics(prompt, "fig_asked_area", "arabic");
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    expect(res.figure!.askedSpec?.kind).toBe("area");
    const areaBadge = res.figure!.interiorBadges?.find(
      (b) => b.labelKind === "unknown"
    );
    expect(areaBadge).toBeDefined();
    expect(areaBadge!.text).toContain("؟");
  });

  it("يصنف مسائل البرهان كـ proof ولا يضيف أي علامة «؟» على الشكل", () => {
    const prompt =
      "[رسم هندسي: مثلث أ ب جـ;د منتصف أ ب;هـ منتصف أ جـ;ب جـ = 10 سم] أثبت أن د هـ يوازي ب جـ.";
    const res = matchGeometryWithDiagnostics(prompt, "fig_proof", "arabic");
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    expect(res.figure!.askedSpec?.kind).toBe("proof");
    const hasUnknown =
      res.figure!.segments.some((s) => s.lengthLabel?.labelKind === "unknown") ||
      res.figure!.angles.some((a) => a.labelKind === "unknown") ||
      (res.figure!.interiorBadges ?? []).some((b) => b.labelKind === "unknown");
    expect(hasUnknown).toBe(false);
  });

  it("يرفض الشكل فوراً بقرار أحمر (red) عند تسريب الحل على الضلع من ذيل السؤال أو حساب داخلي", () => {
    const prompt =
      "مثلث أ ب جـ قائم في ب فيه أ ب = 6 سم، ب جـ = 8 سم، أوجد طول أ جـ = 10 سم.";
    const cleanRes = matchGeometryWithDiagnostics(
      "مثلث أ ب جـ قائم في ب فيه أ ب = 6 سم، ب جـ = 8 سم، أوجد طول أ جـ.",
      "fig_leak_test",
      "arabic"
    );
    expect(cleanRes.figure).toBeDefined();

    // نحقن القيمة المحسوبة 10 سم على الضلع الثالث لاختبار حارس تسريب الحل
    const leakedFig = {
      ...cleanRes.figure!,
      segments: cleanRes.figure!.segments.map((s) =>
        s.lengthLabel?.value === "؟"
          ? { ...s, lengthLabel: { value: 10, unit: "سم", labelKind: "given" as const } }
          : s
      ),
    };

    const leakReport = verifyNoSolutionLeakOnFigure(leakedFig, prompt);
    expect(leakReport.passed).toBe(false);
    expect(leakReport.leakedSolutionValues).toContain("10");

    const tri = evaluateFigureTriStateDecision(leakedFig, prompt);
    expect(tri.decision).toBe("red");
    expect(tri.check3NoExtrasOrLeakPassed).toBe(false);
  });

  it("يرسم دائرتين متقاطعتين حقيقيتين عبر مصفوفة circles في IR v2", () => {
    const fig = buildCircleIntersectingPairFigure({
      figureId: "two_circles",
      notationLanguage: "arabic",
    });
    expect(fig.circles).toBeDefined();
    expect(fig.circles!.length).toBe(2);

    const svg = projectGeometryFigureToSVGMarkup(fig, { numeralMode: "western" });
    const circleTagsCount = (svg.match(/<circle\b/g) ?? []).length;
    // على الأقل دائرتان رئيسيتان + نقاط الرؤوس
    expect(circleTagsCount).toBeGreaterThanOrEqual(6);
  });

  it("يبني المجسمات ثلاثية الأبعاد بأبعاد حقيقية من المعطيات وبدون أرقام ثابتة دخيلة عند عدم إعطائها", () => {
    const coneNoDims = buildRightCircularCone3DFigure({
      figureId: "cone_clean",
      notationLanguage: "arabic",
    });
    expect(coneNoDims.segments.every((s) => s.lengthLabel === undefined)).toBe(true);

    const coneWithDims = buildRightCircularCone3DFigure({
      figureId: "cone_dims",
      notationLanguage: "arabic",
      radiusCm: 6,
      heightCm: 8,
      slantCm: 10,
    });
    const labels = coneWithDims.segments
      .map((s) => s.lengthLabel?.value)
      .filter((v) => v !== undefined);
    expect(labels).toEqual(expect.arrayContaining([6, 8, 10]));

    const cuboid = buildCubeCuboid3DFigure({
      figureId: "cuboid_dims",
      notationLanguage: "arabic",
      lengthCm: 12,
      widthCm: 5,
      heightCm: 7,
    });
    const cuboidLabels = cuboid.segments
      .map((s) => s.lengthLabel?.value)
      .filter((v) => v !== undefined);
    expect(cuboidLabels).toEqual(expect.arrayContaining([12, 5, 7]));
  });
});
