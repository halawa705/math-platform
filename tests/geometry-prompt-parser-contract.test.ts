/**
 * @file geometry-prompt-parser-contract.test.ts
 * @description اختبار العقد الشامل بين الموجه والمحلل ومصادر الحقيقة للوسوم (المهمة 1.4):
 * يتحقق من أن كل بنية وسم ينتجها الموجه الذكي تفهمها المحللات الحتمية بنسبة 100%.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 300 سطر).
 */

import { describe, it, expect } from "vitest";
import {
  buildSmartGeometryPromptGuidance,
  isGeometryContext,
} from "../src/core/prompts/smart-geometry-prompt-director";
import { buildPrimaryStageFigurePromptGuidance } from "../src/core/prompts/geometry-prompt-guidance-primary";
import { buildPrepStageFigurePromptGuidance } from "../src/core/prompts/geometry-prompt-guidance-prep";
import { buildStatisticsFigurePromptGuidance } from "../src/core/prompts/geometry-prompt-guidance-statistics";
import { buildCartesianFunctionsPromptGuidance } from "../src/core/prompts/geometry-prompt-guidance-functions";
import {
  extractFirstFigureTagPayload,
  stripFigureTagsFromPromptText,
  classifyFigureTagKind,
  extractAskedClauseFromTagContent,
} from "../src/core/ssot/figure-tag-grammar-ssot";
import { matchGeometryWithDiagnostics } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { parseCartesianGraphDescription } from "../src/core/geometry-engine/graph-compositor/graph-fact-parser";
import { isDiagramJustifiedForQuestion } from "../src/core/ingestion/unsolicited-diagram-guard";

describe("Phase 1 Contract: Figure Tag Grammar SSOT", () => {
  it("classifies all 4 figure tag families accurately", () => {
    expect(classifyFigureTagKind("رسم هندسي")).toBe("geometry");
    expect(classifyFigureTagKind("رسم بياني")).toBe("graph");
    expect(classifyFigureTagKind("رسم إحصائي")).toBe("statistics");
    expect(classifyFigureTagKind("رسم احصائي")).toBe("statistics");
    expect(classifyFigureTagKind("نموذج بصري")).toBe("visual_model");
  });

  it("extracts payload and asked clause from geometry tag", () => {
    const raw = "في الشكل المقابل: [رسم هندسي: مثلث أ ب جـ قائم في ب ؛ أ ب = 6 سم ؛ ب جـ = 8 سم ؛ المطلوب: طول أ جـ] أوجد طول أ جـ.";
    const parsed = extractFirstFigureTagPayload(raw);

    expect(parsed).not.toBeNull();
    expect(parsed?.kind).toBe("geometry");
    expect(parsed?.content).toContain("مثلث أ ب جـ");
    expect(parsed?.askedClause).toBe("طول أ جـ");

    const stripped = stripFigureTagsFromPromptText(raw);
    expect(stripped).not.toContain("[رسم هندسي");
    expect(stripped).toContain("في الشكل المقابل:");
    expect(stripped).toContain("أوجد طول أ جـ.");
  });

  it("extracts payload and asked clause with question mark format", () => {
    const raw = "[رسم هندسي: أ ب جـ د مستطيل ؛ أ ب = 6 سم ؛ ب جـ = 4 سم ؛ س = ؟]";
    const parsed = extractFirstFigureTagPayload(raw);

    expect(parsed).not.toBeNull();
    expect(parsed?.kind).toBe("geometry");
    expect(parsed?.askedClause).toBeUndefined(); // س = ؟ is handled by question mark resolver
  });

  it("extracts payload from cartesian graph tag", () => {
    const raw = "ارسم منحنى الدالة [رسم بياني: ص = س² - 4 ؛ المدى س من -3 إلى 3] ثم عين رأس المنحنى.";
    const parsed = extractFirstFigureTagPayload(raw);

    expect(parsed).not.toBeNull();
    expect(parsed?.kind).toBe("graph");
    expect(parsed?.content).toContain("ص = س² - 4");
  });

  it("extracts payload from statistics tag", () => {
    const raw = "البيانات التالية توضح درجات الطلاب [رسم إحصائي: نوع=مخطط صندوق ; أدنى=10 ; ربيع1=18 ; وسيط=25 ; ربيع3=32 ; أقصى=40].";
    const parsed = extractFirstFigureTagPayload(raw);

    expect(parsed).not.toBeNull();
    expect(parsed?.kind).toBe("statistics");
    expect(parsed?.content).toContain("نوع=مخطط صندوق");
  });

  it("extracts payload from visual model tag", () => {
    const raw = "أوجد ناتج ما يلي مستعيناً بالنموذج [نموذج بصري: شريط مقسم إلى 5 أجزاء متساوية ؛ ظلل 3 أجزاء].";
    const parsed = extractFirstFigureTagPayload(raw);

    expect(parsed).not.toBeNull();
    expect(parsed?.kind).toBe("visual_model");
    expect(parsed?.content).toContain("شريط مقسم إلى 5 أجزاء");
  });
});

describe("Phase 1 Contract: Prompt Guidance Brevity and Zero-DSL", () => {
  it("primary prompt guidance is compact and under 500 characters", () => {
    const arPrompt = buildPrimaryStageFigurePromptGuidance("arabic");
    const enPrompt = buildPrimaryStageFigurePromptGuidance("english");

    expect(arPrompt.length).toBeLessThan(500);
    expect(enPrompt.length).toBeLessThan(500);
    expect(arPrompt).toContain("[نموذج بصري: ...]");
    expect(arPrompt).toContain("المطلوب:");
    expect(arPrompt).not.toContain("<svg");
    expect(arPrompt).not.toContain("[GEOMETRY");
  });

  it("prep prompt guidance is compact and under 550 characters", () => {
    const arPrompt = buildPrepStageFigurePromptGuidance("arabic");
    const enPrompt = buildPrepStageFigurePromptGuidance("english");

    expect(arPrompt.length).toBeLessThan(550);
    expect(enPrompt.length).toBeLessThan(550);
    expect(arPrompt).toContain("[رسم هندسي: ...]");
    expect(arPrompt).toContain("المطلوب:");
    expect(arPrompt).not.toContain("<svg");
    expect(arPrompt).not.toContain("[GEOMETRY");
  });

  it("statistics prompt guidance is compact and under 450 characters", () => {
    const statPrompt = buildStatisticsFigurePromptGuidance();

    expect(statPrompt.length).toBeLessThan(450);
    expect(statPrompt).toContain("[رسم إحصائي: نوع=... ; ...]");
    expect(statPrompt).toContain("مخطط صندوق");
    expect(statPrompt).not.toContain("<svg");
  });

  it("functions prompt guidance is compact and under 450 characters", () => {
    const funcPromptAr = buildCartesianFunctionsPromptGuidance("arabic");
    const funcPromptEn = buildCartesianFunctionsPromptGuidance("english");

    expect(funcPromptAr.length).toBeLessThan(450);
    expect(funcPromptEn.length).toBeLessThan(450);
    expect(funcPromptAr).toContain("[رسم بياني: ...]");
    expect(funcPromptAr).not.toContain("<svg");
  });

  it("smart prompt director routes correctly to each stage guidance", () => {
    // Primary Stage
    const primaryGuidance = buildSmartGeometryPromptGuidance({
      stage: "primary",
      gradeId: "prim_grade_4",
      branchId: "plane_geometry",
    });
    expect(primaryGuidance).toContain("توجيه الرسوم والنماذج للابتدائي");

    // Prep Stage
    const prepGuidance = buildSmartGeometryPromptGuidance({
      stage: "preparatory",
      gradeId: "prep_grade_1",
      branchId: "plane_geometry",
    });
    expect(prepGuidance).toContain("توجيه الإخراج الهندسي للإعدادي");

    // Statistics Branch
    const statGuidance = buildSmartGeometryPromptGuidance({
      branchId: "statistics_probability",
    });
    expect(statGuidance).toContain("توجيه الرسوم الإحصائية");

    // Functions Branch
    const funcGuidance = buildSmartGeometryPromptGuidance({
      branchId: "functions",
    });
    expect(funcGuidance).toContain("توجيه الرسوم البيانية للدوال");
  });
});

describe("Phase 1 Contract: Parsers Consume Prompt Syntax Cleanly", () => {
  it("consumes right triangle geometry tag with asked segment", () => {
    const tagText = "مثلث أ ب جـ قائم في ب ؛ أ ب = 6 سم ؛ ب جـ = 8 سم ؛ المطلوب: طول أ جـ";
    const result = matchGeometryWithDiagnostics(tagText, "prep_test");

    expect(result).toBeDefined();
    expect(result.figure).toBeDefined();
    expect(result.figure?.familyId).toBe("triangle_family");
    expect(result.figure?.vertices.length).toBe(3);
  });

  it("consumes rectangle geometry tag with lengths", () => {
    const tagText = "مستطيل أ ب جـ د ؛ أ ب = 6 سم ؛ ب جـ = 4 سم ؛ المطلوب: محيط المستطيل";
    const result = matchGeometryWithDiagnostics(tagText, "primary_test");

    expect(result).toBeDefined();
    expect(result.figure).toBeDefined();
    expect(result.figure?.vertices.length).toBe(4);
  });

  it("consumes circle geometry tag with radius and chord", () => {
    const tagText = "دائرة مركزها م ; نق = 5 ; أ ب وتر ; م د ⊥ أ ب";
    const result = matchGeometryWithDiagnostics(tagText, "prep_grade_3", "arabic");

    expect(result).toBeDefined();
    expect(result.figure).toBeDefined();
    expect(result.figure?.familyId).toBe("circle_family");
    expect(result.figure?.vertices.length).toBe(4);
  });

  it("consumes cartesian function tag with range", () => {
    const tagText = "ص = 2س + 1 ; المدى س من -3 إلى 3";
    const spec = parseCartesianGraphDescription(tagText);

    expect(spec).not.toBeNull();
    expect(spec?.functions.length).toBeGreaterThan(0);
    expect(spec?.functions[0].kind).toBe("linear");
    expect(spec?.xMin).toBe(-3);
    expect(spec?.xMax).toBe(3);
  });

  it("diagram guard protects arithmetic questions from unsolicited diagrams", () => {
    const justified = isDiagramJustifiedForQuestion({
      promptArabic: "احسب ناتج: 25 × 14",
      rawDiagramTagText: "مثلث أ ب جـ",
      branchId: "numbers",
    });
    expect(justified).toBe(false);

    const justifiedGeometry = isDiagramJustifiedForQuestion({
      promptArabic: "في الشكل المقابل: أوجد طول ب جـ",
      rawDiagramTagText: "مثلث أ ب جـ قائم في ب",
      branchId: "plane_geometry",
    });
    expect(justifiedGeometry).toBe(true);
  });
});
