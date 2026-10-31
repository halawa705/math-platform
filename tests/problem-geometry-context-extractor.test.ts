/**
 * @file problem-geometry-context-extractor.test.ts
 * @description اختبارات التحقق الشاملة لجامع السياق الهندسي الموحد (Phase 2 Unit Tests).
 * تتأكد من دمج وسم الرسم مع نص المسألة، استخراج ترتيب الرؤوس التناظري الدقيق،
 * تفكيك الأطوال الترتيبية والجبرية، وتحليل نسب التشابه والتطابق.
 */

import { describe, expect, it } from "vitest";
import {
  combineProblemAndTagGeometryContext,
  extractGeometryFactsFromPrompt,
  extractOrderedSimilarityTriangles,
  unpackSequentialSideLengths,
} from "@/core/geometry-engine/description-intake/problem-geometry-context-extractor";
import { parseGeoFactString } from "@/core/geometry-engine/fact-compositor/geo-fact-parser";

describe("المرحلة المحورية الثانية: جامع السياق الهندسي الموحد", () => {
  describe("1. استخراج علاقات التشابه والتطابق وترتيب الرؤوس المتناظرة", () => {
    it("يستخرج الرؤوس المتناظرة بالترتيب الدقيق من صيغة LaTeX مع معامل التشابه", () => {
      const text = "إذا كان $\\Delta ABC \\sim \\Delta DEF$ وكانت نسبة التشابه تساوي 2";
      const sim = extractOrderedSimilarityTriangles(text);

      expect(sim).not.toBeNull();
      expect(sim?.tri1).toEqual(["A", "B", "C"]);
      expect(sim?.tri2).toEqual(["D", "E", "F"]);
      expect(sim?.isCongruence).toBe(false);
      expect(sim?.ratio).toBe(2);
    });

    it("يحفظ الترتيب التناظري المعكوس للرؤوس مثل ADE ~ ACB", () => {
      const text = "في الشكل المقابل، $\\Delta ADE \\sim \\Delta ACB$";
      const sim = extractOrderedSimilarityTriangles(text);

      expect(sim).not.toBeNull();
      expect(sim?.tri1).toEqual(["A", "D", "E"]);
      expect(sim?.tri2).toEqual(["A", "C", "B"]);
    });

    it("يستخرج علاقة التطابق بالترتيب الدقيق", () => {
      const text = "المثلث أ ب جـ ≅ المثلث د هـ و";
      const cong = extractOrderedSimilarityTriangles(text);

      expect(cong).not.toBeNull();
      expect(cong?.tri1).toEqual(["A", "B", "C"]);
      expect(cong?.tri2).toEqual(["D", "E", "F"]);
      expect(cong?.isCongruence).toBe(true);
    });
  });

  describe("2. تفكيك الأطوال الترتيبية والجبرية", () => {
    it("يُفكك 'أطوال أضلاع ΔABC هي 3 سم، 4 سم، 5 سم' إلى 3 أطوال مستقلة", () => {
      const text = "أطوال أضلاع $\\Delta ABC$ هي $3\\text{ سم}، 4\\text{ سم}، 5\\text{ سم}$";
      const unpacked = unpackSequentialSideLengths(text);

      expect(unpacked).toEqual(["AB = 3 سم", "BC = 4 سم", "AC = 5 سم"]);
    });

    it("يستخدم المثلث المستخرج من التشابه كمرجع للأطوال إن لم يُذكر اسم المثلث في جملة الأطوال", () => {
      const text = "أطوال أضلاعه هي 6 ، 8 ، 10";
      const unpacked = unpackSequentialSideLengths(text, ["X", "Y", "Z"]);

      expect(unpacked).toEqual(["XY = 6 سم", "YZ = 8 سم", "XZ = 10 سم"]);
    });
  });

  describe("3. استخراج الحقائق الهندسية من متن السؤال (Prompt Extraction)", () => {
    it("يستخرج الزوايا والأطوال الصريحة من سؤال تشابه نموذجي", () => {
      const prompt =
        "إذا كان $\\Delta ABC \\sim \\Delta DEF$ وكان $m(\\angle A) = 40^\\circ$ و $m(\\angle B) = 65^\\circ$، فإن $m(\\angle F) = ........$";
      const facts = extractGeometryFactsFromPrompt(prompt);

      expect(facts).toContain("مثلث ABC ~ مثلث DEF");
      expect(facts.some((f) => f.includes("A") && f.includes("40"))).toBe(true);
      expect(facts.some((f) => f.includes("B") && f.includes("65"))).toBe(true);
    });

    it("يستخرج أطوال الأضلاع المتعددة من سؤال أطوال", () => {
      const prompt =
        "إذا كان $\\Delta ABC \\sim \\Delta DEF$ وكان $AB = 6\\text{ سم}$، $BC = 8\\text{ سم}$، $AC = 10\\text{ سم}$، وطول $DE = 3\\text{ سم}$";
      const facts = extractGeometryFactsFromPrompt(prompt);

      expect(facts).toContain("مثلث ABC ~ مثلث DEF");
      expect(facts.some((f) => f.includes("AB = 6"))).toBe(true);
      expect(facts.some((f) => f.includes("BC = 8"))).toBe(true);
      expect(facts.some((f) => f.includes("AC = 10"))).toBe(true);
      expect(facts.some((f) => f.includes("DE = 3"))).toBe(true);
    });
  });

  describe("4. جامع السياق الموحد (Problem & Tag Context Fusion)", () => {
    it("يدمج وسم رسم مختصر مع معطيات السؤال الحيّة خالية من التكرار", () => {
      const tag = "مثلثان ΔABC و ΔDEF متطابقا الزوايا متناظراً، m(∠A) = 40°";
      const prompt =
        "[رسم هندسي: مثلثان متطابقا الزوايا] إذا كان $\\Delta ABC \\sim \\Delta DEF$ وكان $m(\\angle A) = 40^\\circ$ و $m(\\angle B) = 65^\\circ$";

      const combined = combineProblemAndTagGeometryContext(tag, prompt);

      expect(combined).toContain("مثلث ABC ~ مثلث DEF");
      expect(combined).toContain("40");
      expect(combined).toContain("65");
      // التشابه يأتي في المقدمة
      expect(combined.indexOf("مثلث ABC ~ مثلث DEF")).toBeLessThan(combined.indexOf("65"));
    });
  });

  describe("5. دعم مفردات الحقائق الهندسية الموسعة في geo-fact-parser", () => {
    it("يحلل حقيقة التشابه إلى GeoFact من النوع similarity", () => {
      const parsed = parseGeoFactString("مثلث ABC ~ مثلث DEF نسبة التشابه = 2");
      expect(parsed).not.toBeNull();
      expect(parsed?.k).toBe("similarity");
      if (parsed?.k === "similarity") {
        expect(parsed.tri1).toEqual(["A", "B", "C"]);
        expect(parsed.tri2).toEqual(["D", "E", "F"]);
        expect(parsed.ratio).toBe(2);
      }
    });

    it("يحلل حقيقة التطابق إلى GeoFact من النوع congruence", () => {
      const parsed = parseGeoFactString("مثلث ABC ≅ مثلث DEF");
      expect(parsed).not.toBeNull();
      expect(parsed?.k).toBe("congruence");
      if (parsed?.k === "congruence") {
        expect(parsed.tri1).toEqual(["A", "B", "C"]);
        expect(parsed.tri2).toEqual(["D", "E", "F"]);
      }
    });

    it("يحلل الأطوال الجبرية مع توفير قيمة تقريبية موجبة للرسم (numeric)", () => {
      const parsed = parseGeoFactString("AB = x + 2 سم");
      expect(parsed).not.toBeNull();
      expect(parsed?.k).toBe("length");
      if (parsed?.k === "length") {
        expect(parsed.seg).toEqual(["A", "B"]);
        expect(parsed.text).toBe("x + 2");
        expect(parsed.numeric).toBeGreaterThan(0);
      }
    });

    it("يحلل نسب الأطوال مثل AD : DB = 2 : 3", () => {
      const parsed = parseGeoFactString("AD : DB = 2 : 3");
      expect(parsed).not.toBeNull();
      expect(parsed?.k).toBe("ratio");
      if (parsed?.k === "ratio") {
        expect(parsed.a).toEqual(["A", "D"]);
        expect(parsed.b).toEqual(["D", "B"]);
        expect(parsed.num).toBe(2);
        expect(parsed.den).toBe(3);
      }
    });
  });
});
