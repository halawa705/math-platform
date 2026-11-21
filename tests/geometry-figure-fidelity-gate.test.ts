/**
 * @file geometry-figure-fidelity-gate.test.ts
 * @description اختبارات التحقق من بوابة الصدق البصري الصارمة ومنع خطف المسائل (Phase 1 Unit Tests).
 * تتأكد من حجب الأشكال الدخيلة، رفض القوالب العمياء، حجب الأسئلة النظرية،
 * وضمان عدم انحراف مسائل التشابه إلى كتالوجات التطابق.
 */

import { describe, expect, it } from "vitest";
import {
  checkFigureFidelityToPrompt,
  isFigureFaithfulToPrompt,
  isPurelyTheoreticalNoDiagramProblem,
} from "@/core/geometry-engine/verification/geometry-figure-fidelity-gate";
import {
  matchArabicDescriptionToCanonicalGeometryFigure,
  matchGeometryWithDiagnostics,
  matchOptionalGeometryFigureFromArabicDescription,
} from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { localizeFigureLabelText } from "@/core/geometry-engine/figure-label-symbol-localizer";
import { verifySegmentLengthScaleRule } from "@/core/geometry-engine/verification/verify-segment-length-scale-rule";
import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";

function makeAlienKiteFigure(): CanonicalGeometryFigureIR {
  return {
    figureId: "alien_kite",
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "شكل رباعي طائرة ورقية",
    notationLanguage: "english",
    vertices: [
      { id: "vA", label: "A", position: { x: 2, y: 8 } },
      { id: "vB", label: "B", position: { x: 6, y: 5 } },
      { id: "vC", label: "C", position: { x: 2, y: 1 } },
      { id: "vD", label: "D", position: { x: 0, y: 5 } },
    ],
    segments: [
      { id: "sAB", fromVertexId: "vA", toVertexId: "vB", lengthLabel: { value: 30, unit: "سم" } },
      { id: "sBC", fromVertexId: "vB", toVertexId: "vC", lengthLabel: { value: 20, unit: "سم" } },
      { id: "sCD", fromVertexId: "vC", toVertexId: "vD" },
      { id: "sDA", fromVertexId: "vD", toVertexId: "vA" },
    ],
    angles: [
      { id: "aA", vertexId: "vA", arm1VertexId: "vD", arm2VertexId: "vB", degrees: 100, degreesLabel: "100°" },
      { id: "aC", vertexId: "vC", arm1VertexId: "vB", arm2VertexId: "vD", degreesLabel: "(2y)°" },
    ],
  };
}

function makeAlienButterflyFigure(): CanonicalGeometryFigureIR {
  return {
    figureId: "alien_butterfly",
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "فراشة متشابهة",
    notationLanguage: "arabic",
    vertices: [
      { id: "vA", label: "أ", position: { x: 5, y: 5 } },
      { id: "vB", label: "ب", position: { x: 2, y: 8 } },
      { id: "vC", label: "جـ", position: { x: 8, y: 8 } },
      { id: "vD", label: "د", position: { x: 2, y: 2 } },
      { id: "vE", label: "هـ", position: { x: 8, y: 2 } },
    ],
    segments: [
      { id: "sAB", fromVertexId: "vA", toVertexId: "vB", lengthLabel: { value: 8, unit: "سم" } },
      { id: "sAC", fromVertexId: "vA", toVertexId: "vC", lengthLabel: { value: 12, unit: "سم" } },
      { id: "sBC", fromVertexId: "vB", toVertexId: "vC", lengthLabel: { value: 18, unit: "سم" } },
      { id: "sAD", fromVertexId: "vA", toVertexId: "vD" },
      { id: "sAE", fromVertexId: "vA", toVertexId: "vE" },
      { id: "sDE", fromVertexId: "vD", toVertexId: "vE" },
    ],
    angles: [],
  };
}

describe("المرحلة المحورية الأولى: بوابة الصدق البصري ومنع خطف المسائل", () => {
  describe("1. فحص المسائل النظرية الصرفة (Purely Theoretical No-Diagram Problems)", () => {
    it("يحجب الرسم في الأسئلة النظرية اللفظية العامة التي لا تحتاج لشكل", () => {
      const theoreticalPrompts = [
        "النسبة بين محيطي مثلثين متشابهين تساوي النسبة بين طولي أي ضلعين متناظرين فيهما (معامل التشابه)",
        "إذا كان المثلثان متشابهين فإن قياسات الزوايا المتناظرة تكون متساوية في القياس",
        "إذا تشابه مثلثان فإن أطوال أضلاعهما المتناظرة تكون متناسبة، ومعامل التشابه بينهما يساوي k",
        "إذا تناسبت أطوال أضلاع مثلثين، فإن الزوايا المتناظرة تكون متطابقة",
        "أطوال أضلاع مثلثين متداخلين تتناسب متناظراً",
      ];

      for (const prompt of theoreticalPrompts) {
        expect(
          isPurelyTheoreticalNoDiagramProblem(prompt),
          `يجب تصنيف المسألة كنظرية: ${prompt}`
        ).toBe(true);

        const diag = matchGeometryWithDiagnostics(prompt, "fig_theo", "arabic");
        expect(diag.source, `المسألة النظرية لا تنتج شكلاً: ${prompt}`).toBe("none");
        expect(diag.figure).toBeUndefined();
      }
    });

    it("لا يحجب الرسم في المسائل الهندسية التطبيقية ذات المعطيات والأبعاد", () => {
      const concretePrompts = [
        "مثلث أ ب جـ قائم في ب، أ ب = 6 سم، ب جـ = 8 سم",
        "تقاطع المستقيم أ ب والمستقيم جـ د في م ; ق(∠أ م جـ) = 80°",
        "مثلثان متشابهان أ ب جـ و د هـ و فيهما أ ب = 6 سم، د هـ = 3 سم",
      ];

      for (const prompt of concretePrompts) {
        expect(isPurelyTheoreticalNoDiagramProblem(prompt)).toBe(false);
      }
    });
  });

  describe("2. بوابة كشف الأرقام والرؤوس الدخيلة (Fidelity Check against Alien Artifacts)", () => {
    it("ترفض شكل الانعكاس ذي الزاوية (2y)° و 100° و 30 و 20 إذا أُرفق بمسألة زواياها 40° و 65°", () => {
      const alienKiteFigure = makeAlienKiteFigure();

      const similarityPrompt =
        "إذا كان ΔABC ~ ΔDEF وكان m(∠A) = 40° و m(∠B) = 65°، فإن m(∠F) = 75°";

      const check = checkFigureFidelityToPrompt(alienKiteFigure, similarityPrompt);
      expect(check.passed).toBe(false);
      expect(check.alienNumbers.length).toBeGreaterThan(0);
      expect(isFigureFaithfulToPrompt(alienKiteFigure, similarityPrompt)).toBe(false);
    });

    it("ترفض شكل الفراشة بأبعاد 8 و 12 و 18 إذا أُرفق بمسألة أبعادها 3 و 4 و 5", () => {
      const alienButterfly = makeAlienButterflyFigure();

      const promptWithSmallDims =
        "مثلثان متشابهان أطوال أضلاع الأول هي 3 سم، 4 سم، 5 سم، ونسبة التشابه تساوي 2";

      const check = checkFigureFidelityToPrompt(alienButterfly, promptWithSmallDims);
      expect(check.passed).toBe(false);
      expect(isFigureFaithfulToPrompt(alienButterfly, promptWithSmallDims)).toBe(false);
    });
  });

  describe("3. فك التصادم بين التطابق والتشابه ومنع خطف المسائل (Anti-Hijacking Invariant)", () => {
    it("مسألة تشابه تحتوي على 'متطابقا الزوايا' لا تُخطف إلى كتالوج تطابق الصف الثاني الإعدادي", () => {
      const similarityWithAnglesCongruentText =
        "[رسم هندسي: مثلثان ΔABC و ΔDEF متطابقا الزوايا متناظراً، m(∠A) = 40°، m(∠B) = 65°] إذا كان ΔABC ~ ΔDEF";

      const legacyResult = matchOptionalGeometryFigureFromArabicDescription(
        similarityWithAnglesCongruentText,
        "sim_test",
        "english"
      );

      // يجب ألا تعيد شكل الانعكاس الخاص بـ prep2-congruence
      if (legacyResult) {
        expect(legacyResult.figureId).not.toContain("reflection");
        const fid = isFigureFaithfulToPrompt(legacyResult, similarityWithAnglesCongruentText);
        expect(fid).toBe(true);
      }
    });

    it("المسائل التي تحتوي على رمز التشابه ~ تستبعد فوراً من كتالوج التطابق", () => {
      const similarityPrompt = "ΔABC ~ ΔDEF أطوال الأضلاع 6 سم، 8 سم";
      const legacy = matchOptionalGeometryFigureFromArabicDescription(
        similarityPrompt,
        "sim_test_2",
        "arabic"
      );
      if (legacy) {
        expect(legacy.figureId).not.toContain("prep2_triangle_congruence");
      }
    });
  });

  describe("4. ضمانات المرحلة 1: سد الثغرات الخطرة (Phase 1 Invariants)", () => {
    it("يرفض الشكل فوراً عند وجود رقم دخيل أو مسرب واحد فقط (صفر تسامح مع تسريب الحل)", () => {
      const diag = matchGeometryWithDiagnostics("مثلث أ ب جـ قائم في ب، أ ب = 3 سم، ب جـ = 4 سم", "rt_leak_check", "arabic");
      expect(diag.figure).toBeDefined();
      const leakedFig = {
        ...diag.figure!,
        segments: diag.figure!.segments.map((s, idx) =>
          idx === 2 ? { ...s, lengthLabel: { value: 5, unit: "سم" as const } } : s
        ),
      };
      const check = checkFigureFidelityToPrompt(leakedFig, "مثلث أ ب جـ قائم في ب، أ ب = 3 سم، ب جـ = 4 سم");
      expect(check.passed).toBe(false);
      expect(check.alienNumbers).toContain("5");
    });

    it("يرفض الشكل عند غياب معطى بُعدي صريح وارد في نص المسألة (فحص الاكتمال الصارم)", () => {
      const diag = matchGeometryWithDiagnostics("مثلث أ ب جـ قائم في ب، أ ب = 6 سم، ب جـ = 8 سم", "rt_missing_check", "arabic");
      expect(diag.figure).toBeDefined();
      const incompleteFig = {
        ...diag.figure!,
        segments: diag.figure!.segments.map((s) =>
          String(s.lengthLabel?.value) === "8" ? { ...s, lengthLabel: undefined } : s
        ),
      };
      const check = checkFigureFidelityToPrompt(incompleteFig, "مثلث أ ب جـ قائم في ب، أ ب = 6 سم، ب جـ = 8 سم");
      expect(check.passed).toBe(false);
      expect(check.missingNumbers).toContain("8");
    });

    it("يحمي وحدات القياس العربية (م، مم، كم، سم) من التحول الخاطئ إلى حروف رؤوس لاتينية", () => {
      expect(localizeFigureLabelText("1.8 م", "english", "western")).toBe("1.8 م");
      expect(localizeFigureLabelText("15 مم", "english", "western")).toBe("15 مم");
      expect(localizeFigureLabelText("12 كم", "english", "western")).toBe("12 كم");
      expect(localizeFigureLabelText("6 cm", "arabic", "eastern_arabic")).toBe("٦ cm");
    });

    it("يرفع مخالفة تناسب أطوال الأضلاع وترتيبها إلى خطأ (error) لا مجرد تحذير", () => {
      const diag = matchGeometryWithDiagnostics("مثلث أ ب جـ فيه أ ب = 3 سم، ب جـ = 4 سم، أ جـ = 5 سم", "scale_err_check", "arabic");
      expect(diag.figure).toBeDefined();
      const distortedFig = {
        ...diag.figure!,
        segments: diag.figure!.segments.map((s) =>
          String(s.lengthLabel?.value) === "3" ? { ...s, lengthLabel: { value: 15, unit: "سم" as const } } : s
        ),
      };
      const issues = verifySegmentLengthScaleRule(distortedFig);
      expect(issues.some((i) => i.severity === "error")).toBe(true);
    });

    it("يوقف الدالة الاحتياطية لمثلث القطعة الواصلة عند فشل المطابقة ويعيد undefined بدلاً من شكل عشوائي", () => {
      const res = matchArabicDescriptionToCanonicalGeometryFigure(
        "مسألة جبرية عامة لا تحتوي على أي شكل هندسي معروف",
        "no_fallback_check",
        "arabic"
      );
      expect(res).toBeUndefined();
    });
  });
});
