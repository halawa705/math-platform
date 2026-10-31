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
  matchGeometryWithDiagnostics,
  matchOptionalGeometryFigureFromArabicDescription,
} from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { buildCongruenceReflectionInDBFigure } from "@/core/geometry-engine/curriculum-catalogs/prep-stage/grade-2/prep-grade2-congruence-shared-base-builder";
import { buildTriangleButterflyAtApexAFigure } from "@/core/geometry-engine/curriculum-catalogs/prep-stage/grade-3/prep-grade3-triangle-butterfly-similarity-builder";

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
      const alienKiteFigure = buildCongruenceReflectionInDBFigure({
        figureId: "alien_kite",
        notationLanguage: "english",
      });

      const similarityPrompt =
        "إذا كان ΔABC ~ ΔDEF وكان m(∠A) = 40° و m(∠B) = 65°، فإن m(∠F) = 75°";

      const check = checkFigureFidelityToPrompt(alienKiteFigure, similarityPrompt);
      expect(check.passed).toBe(false);
      expect(check.alienNumbers.length).toBeGreaterThan(0);
      expect(isFigureFaithfulToPrompt(alienKiteFigure, similarityPrompt)).toBe(false);
    });

    it("ترفض شكل الفراشة بأبعاد 8 و 12 و 18 إذا أُرفق بمسألة أبعادها 3 و 4 و 5", () => {
      const alienButterfly = buildTriangleButterflyAtApexAFigure({
        figureId: "alien_butterfly",
        notationLanguage: "arabic",
      });

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
});
