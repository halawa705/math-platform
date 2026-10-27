import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  wrapBalancedLatexCommands,
  cleanStrayLatexArtifacts,
  sanitizePolygonSimilarityAndUnitBiDi,
} from "../src/core/ingestion/balanced-latex-command-wrapper";
import { normalizeToEgyptianSchoolMath } from "../src/core/ingestion/egyptian-math-notation-normalizer";
import { normalizeArabicUnitPlacementSSOT } from "../src/core/ssot/numeral-and-unit-ssot";
import { cleanStudentFacingMathPromptSSOT } from "../src/core/ingestion/notebooklm-citation-latex-sanitizer";

describe("Booklet Quality & Surgical Fixes Suite", () => {
  it("Issue 1: Fixes BiDi polygon similarity sign position between two polygons", () => {
    const inputAfter = "إذا كان المضلع ABCD المضلع XYZW ~ فإن";
    const normalizedAfter = normalizeToEgyptianSchoolMath(inputAfter);
    assert.match(normalizedAfter, /المضلع\s*\$ABCD\s*\\sim\s*XYZW\$/);

    const inputBefore = "إذا كان ~ ABCD XYZW فإن";
    const normalizedBefore = normalizeToEgyptianSchoolMath(inputBefore);
    assert.match(normalizedBefore, /المضلع\s*\$ABCD\s*\\sim\s*XYZW\$/);

    const inputVerb = "متوازيا أضلاع ABCD و XYZW يتشابهان وكان";
    const normalizedVerb = normalizeToEgyptianSchoolMath(inputVerb);
    assert.match(normalizedVerb, /المضلع\s*\$ABCD\s*\\sim\s*XYZW\$/);
  });

  it("Issue 2 & 4: Cleans leaked LaTeX artifacts and unescapes text blocks", () => {
    const leaked1 = "$\\ = $ 5 سم";
    const cleaned1 = cleanStrayLatexArtifacts(leaked1);
    assert.doesNotMatch(cleaned1, /\\\s*=\s*/);

    const leaked2 = "frac{12}{4}";
    const cleaned2 = wrapBalancedLatexCommands(leaked2);
    assert.match(cleaned2, /\\frac\{12\}\{4\}/);

    const idea8 = "\\frac{P_1}{P_2} = \\frac{a}{b} \\implies \\text{قيمة الجزء} = \\frac{P_1 + P_2}{a + b}";
    const cleanedIdea8 = normalizeToEgyptianSchoolMath(idea8);
    assert.doesNotMatch(cleanedIdea8, /\\text\{/);
  });

  it("Issue 3: Sub-requirements line breaks formatting", () => {
    const rawReqs = "أوجد: أولاً: طول أ ب ثانياً: قياس زاوية جـ";
    const cleaned = cleanStudentFacingMathPromptSSOT(rawReqs);
    assert.match(cleaned, /•\s*أولاً:/);
    assert.match(cleaned, /•\s*ثانياً:/);
  });

  it("Issue 6: Binds Latin variables with Arabic measurement units and prevents equal sign flip", () => {
    const input1 = "وكان AB = 4 سم و BC = 5 سم";
    const result1 = normalizeArabicUnitPlacementSSOT(input1);
    assert.match(result1, /\$AB = 4\\text\{ سم\}\$/);
    assert.match(result1, /\$BC = 5\\text\{ سم\}\$/);

    const input2 = "وقياس m(∠B) = 70°";
    const result2 = normalizeArabicUnitPlacementSSOT(input2);
    assert.match(result2, /\$m\(∠B\) = 70\^\\circ\$/);

    const input3 = "محيط الأكبر $= 80$ سم";
    const result3 = sanitizePolygonSimilarityAndUnitBiDi(input3);
    assert.match(result3, /=\s*\$80\\text\{ سم\}\$/);
    assert.doesNotMatch(result3, /80\s*=\s*سم/);
  });

  it("Issue 4: Converts bare tilde in math to \\sim and strips stray div slashes", () => {
    const divLeak = "بالقسمة على k: \\div k\\";
    const divCleaned = cleanStrayLatexArtifacts(divLeak);
    assert.doesNotMatch(divCleaned, /\\div k\\/);
  });

  it("Ingestion: Strictly isolates Rule from Examples and prevents Prompt steps duplication", () => {
    const { extractConceptAndRule, parseSolvedExamplesFromSection } = require("../src/core/ingestion/notebooklm-stage-parsers-helper");
    const testBlock = `الفكرة الأولى: المضلعان المتشابهان
مفهوم الفكرة: تشابه المضلعات هو تطابق الزوايا المتناظرة وتناسب أطوال الأضلاع.
القاعدة والقانون المعتمد: يتشابه المضلعان إذا وفقط إذا كانت الزوايا المتناظرة متطابقة والأضلاع المتناظرة متناسبة.
AB/XY = BC/YZ = k
المثال 1 معرف المثال: 01-example-01 نص المسألة: يتشابه المضلعان إذا كانت زواياهما المتناظرة ........ خطوات الحل: 1. نطبق التعريف الناتج النهائي: متساوية
المثال 2 معرف المثال: 02-example-01 نص المسألة: إذا كان ABCD ~ XYZW خطوات الحل: 1. نكون تناسب الأضلاع الناتج النهائي: 4 سم`;

    const { concept, rule, examplesPart } = extractConceptAndRule(testBlock);
    assert.ok(concept.includes("تشابه المضلعات"));
    assert.ok(rule.includes("يتشابه المضلعان"));
    assert.ok(!rule.includes("المثال 1"), "Rule must NOT contain Example 1");
    assert.ok(!rule.includes("المثال 2"), "Rule must NOT contain Example 2");

    const examples = parseSolvedExamplesFromSection(examplesPart, "الفكرة الأولى", concept);
    assert.equal(examples.length, 2);
    assert.ok(!examples[0].promptAr.includes("خطوات الحل"), "Prompt 1 must NOT contain solution steps");
    assert.ok(!examples[1].promptAr.includes("خطوات الحل"), "Prompt 2 must NOT contain solution steps");
    assert.equal(examples[0].rawFinal, "متساوية");
    assert.equal(examples[1].rawFinal, "4 سم");
  });
});
