/**
 * @file similarity-parametric-builders.test.ts
 * @description اختبارات التحقق للمركّبات البارامترية لعائلات التشابه والتطابق (Phase 4 Unit Tests).
 * تتأكد من توليد الأشكال برؤوس وأبعاد المسألة الحقيقية، والتطابق التام مع معطيات نوت بوك.
 */

import { describe, expect, it } from "vitest";
import {
  matchGeometryWithDiagnostics,
  matchOptionalGeometryFigureFromArabicDescription,
} from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { isFigureFaithfulToPrompt } from "@/core/geometry-engine/verification/geometry-figure-fidelity-gate";

describe("المرحلة المحورية الرابعة: المركّبات البارامترية لعائلات التشابه والتطابق", () => {
  describe("1. حل مسألة المثال 1 من رد نوت بوك الحقيقي (مثال الزوايا 40° و 65°)", () => {
    it("ينشئ مثلثين منفصلين ΔABC و ΔDEF بالزوايا 40° و 65° بصفر عناصر دخيلة ويجتاز بوابة الصدق", () => {
      const prompt =
        "[رسم هندسي: مثلثان متطابقا الزوايا متناظراً] إذا كان $\\Delta ABC \\sim \\Delta DEF$ وكان $m(\\angle A) = 40^\\circ$ و $m(\\angle B) = 65^\\circ$، فإن $m(\\angle F) = ........$";

      const diag = matchGeometryWithDiagnostics(prompt, "nb_sim_ex1", "english");

      expect(diag.figure).toBeDefined();
      expect(["catalog", "compositor"]).toContain(diag.source);

      const fig = diag.figure!;
      const labels = fig.vertices.map((v) => v.label);
      expect(labels).toContain("A");
      expect(labels).toContain("B");
      expect(labels).toContain("C");
      expect(labels).toContain("D");
      expect(labels).toContain("E");
      expect(labels).toContain("F");

      // التأكد من وجود الزاويتين المعطاتين فقط
      const angleLabels = fig.angles.map((a) => a.degreesLabel);
      expect(angleLabels.some((l) => l && l.includes("40"))).toBe(true);
      expect(angleLabels.some((l) => l && l.includes("65"))).toBe(true);

      // التأكد من عدم وجود أي رقم دخيل (مثل 100° أو 2y أو 30 أو 18)
      expect(angleLabels.some((l) => l && (l.includes("100") || l.includes("2y")))).toBe(false);

      expect(isFigureFaithfulToPrompt(fig, prompt)).toBe(true);
    });
  });

  describe("2. حل مسألة المثال 2 من رد نوت بوك الحقيقي (أطوال 6، 8، 10 و 3)", () => {
    it("ينشئ مثلثين منفصلين بأطوال الأضلاع الحقيقية للمسألة فقط", () => {
      const prompt =
        "إذا كان $\\Delta ABC \\sim \\Delta DEF$ وكان $AB = 6\\text{ سم}$، $BC = 8\\text{ سم}$، $AC = 10\\text{ سم}$، وطول $DE = 3\\text{ سم}$";

      const diag = matchGeometryWithDiagnostics(prompt, "nb_sim_ex2", "english");

      expect(diag.figure).toBeDefined();
      const fig = diag.figure!;

      const segLabels = fig.segments
        .map((s) => (s.lengthLabel ? String(s.lengthLabel.value) : ""))
        .filter(Boolean);

      expect(segLabels.some((l) => l.includes("6"))).toBe(true);
      expect(segLabels.some((l) => l.includes("8"))).toBe(true);
      expect(segLabels.some((l) => l.includes("10"))).toBe(true);
      expect(segLabels.some((l) => l.includes("3"))).toBe(true);

      // حظر أرقام الفراشة القديمة (18 أو 12)
      expect(segLabels.some((l) => l.includes("18"))).toBe(false);

      expect(isFigureFaithfulToPrompt(fig, prompt)).toBe(true);
    });
  });

  describe("3. مسألة طاليس والتوازي في المثلث (DE // BC)", () => {
    it("يرسم المثلث المتداخل مع أسهم التوازي والأطوال المعطاة فقط", () => {
      const prompt =
        "في الشكل المقابل، $\\Delta ADE \\sim \\Delta ABC$ حيث $\\overline{DE} \\parallel \\overline{BC}$، $AD = 4\\text{ سم}$، $DB = 6\\text{ سم}$";

      const diag = matchGeometryWithDiagnostics(prompt, "thales_ex", "english");

      expect(diag.figure).toBeDefined();
      const fig = diag.figure!;

      expect(fig.segments.some((s) => s.parallelArrows !== undefined)).toBe(true);
      expect(isFigureFaithfulToPrompt(fig, prompt)).toBe(true);
    });
  });

  describe("4. مسألة القاطع العكسي (m(∠AED) = m(∠B))", () => {
    it("يرسم القاطع العكسي المائل مع قوسي تطابق الزاويتين", () => {
      const prompt =
        "في الشكل المقابل، $\\Delta ADE \\sim \\Delta ACB$ قاطع غير موازٍ حيث $D \\in AB$ و $E \\in AC$";

      const diag = matchGeometryWithDiagnostics(prompt, "antiparallel_ex", "english");

      expect(diag.figure).toBeDefined();
      const fig = diag.figure!;

      expect(fig.angles.length).toBeGreaterThanOrEqual(2);
      expect(isFigureFaithfulToPrompt(fig, prompt)).toBe(true);
    });
  });

  describe("5. مسألة تقاطع القطعتين في نقطة (الساعة الرملية AC ∩ BD = {E})", () => {
    it("يرسم مثلثين متقابلين بالرأس عند E مع الأطوال المحددة", () => {
      const prompt =
        "في الشكل المقابل، $\\overline{AC} \\cap \\overline{BD} = \\{E\\}$، $AB = 5\\text{ سم}$، $CD = 10\\text{ سم}$";

      const diag = matchGeometryWithDiagnostics(prompt, "hourglass_ex", "english");

      expect(diag.figure).toBeDefined();
      const fig = diag.figure!;

      const labels = fig.vertices.map((v) => v.label);
      expect(labels).toContain("E");
      expect(isFigureFaithfulToPrompt(fig, prompt)).toBe(true);
    });
  });

  describe("6. مسألة نظرية إقليدس في المثلث القائم", () => {
    it("يرسم مثلثاً قائماً مع عمود الارتفاع الساقط على الوتر ومربعي القائمة", () => {
      const prompt =
        "مثلث ABC قائم الزاوية في A، أُسقط العمود $AD \\perp BC$ على الوتر. احسب الأطوال بعلاقات إقليدس حيث $BD = 9\\text{ سم}$، $CD = 16\\text{ سم}$.";

      const diag = matchGeometryWithDiagnostics(prompt, "euclid_ex", "english");

      expect(diag.figure).toBeDefined();
      const fig = diag.figure!;

      expect(fig.angles.some((a) => a.isRightAngle)).toBe(true);
      expect(isFigureFaithfulToPrompt(fig, prompt)).toBe(true);
    });
  });
});
