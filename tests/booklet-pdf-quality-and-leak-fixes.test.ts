import { describe, it, expect } from "vitest";
import assert from "node:assert/strict";
import { canonicalizeMathText } from "../src/core/math-text/math-text-canonicalizer";
import { cleanStudentFacingMathPromptSSOT } from "../src/core/ingestion/notebooklm-citation-latex-sanitizer";
import {
  extractConceptAndRule,
  parseSolvedExamplesFromSection,
} from "../src/core/ingestion/notebooklm-stage-parsers-helper";

const NBSP = "\u00A0";

describe("Booklet Quality & Surgical Fixes Suite (canonical pipeline)", () => {
  it("Issue 1: polygon similarity is one isolated LTR block in every phrasing", () => {
    for (const input of [
      "المضلع ABCD يشابه المضلع XYZW",
      "إذا كان المضلع ABCD ~ المضلع XYZW",
      "المضلع ~ ABCD XYZW",
    ]) {
      const out = canonicalizeMathText(input);
      assert.match(out, /\$ABCD \\sim XYZW\$/);
      assert.doesNotMatch(out, /المضلع\s+المضلع/);
    }
    const names = canonicalizeMathText("المضلعين ABCD و XYZW متشابهان");
    expect(names).toContain("$ABCD$");
    expect(names).toContain("$XYZW$");
  });

  it("Issue 2 & 4: leaked LaTeX artifacts never survive", () => {
    expect(canonicalizeMathText("$\\ = $ 5 سم")).not.toMatch(/\\/);
    expect(canonicalizeMathText("frac{12}{4}")).toContain("$\\frac{12}{4}$");
    const idea8 = canonicalizeMathText(
      "\\frac{P_1}{P_2} = \\frac{a}{b} \\implies \\text{قيمة الجزء} = \\frac{P_1 + P_2}{a + b}"
    );
    expect(idea8).not.toMatch(/\\text\{/);
    expect(idea8).toContain("قيمة الجزء");
    expect(canonicalizeMathText("بالقسمة على k: \\div k\\")).not.toMatch(/\\div k\\/);
  });

  it("Issue 3: Sub-requirements line breaks formatting", () => {
    const rawReqs = "أوجد: أولاً: طول أ ب ثانياً: قياس زاوية جـ";
    const cleaned = cleanStudentFacingMathPromptSSOT(rawReqs);
    assert.match(cleaned, /•\s*أولاً:/);
    assert.match(cleaned, /•\s*ثانياً:/);
  });

  it("Issue 6: Latin variables bind with Arabic units; relation sign never flips", () => {
    const lengths = canonicalizeMathText("وكان AB = 4 سم و BC = 5 سم");
    expect(lengths).toContain(`$AB = 4$${NBSP}سم`);
    expect(lengths).toContain(`$BC = 5$${NBSP}سم`);
    expect(canonicalizeMathText("وقياس m(∠B) = 70°")).toContain("$m(\\angle B) = 70^\\circ$");
    const perimeter = canonicalizeMathText("محيط الأكبر $= 80$ سم");
    expect(perimeter).toBe(`محيط الأكبر = $80$${NBSP}سم`);
  });

  it("Ingestion: Strictly isolates Rule from Examples and prevents Prompt steps duplication", () => {
    const testBlock = `الفكرة الأولى: المضلعان المتشابهان
مفهوم الفكرة: تشابه المضلعات هو تطابق الزوايا المتناظرة وتناسب أطوال الأضلاع.
القاعدة والقانون المعتمد: يتشابه المضلعان إذا وفقط إذا كانت الزوايا المتناظرة متطابقة والأضلاع المتناظرة متناسبة.
AB/XY = BC/YZ = k
المثال 1 معرف المثال: 01-example-01 نص المسألة: يتشابه المضلعان إذا كانت زواياهما المتناظرة ........ خطوات الحل: 1. نطبق التعريف الناتج النهائي: متساوية
المثال 2 معرف المثال: 02-example-01 نص المسألة: إذا كان ABCD ~ XYZW خطوات الحل: 1. نكون تناسب الأضلاع الناتج النهائي: 4 سم`;

    const { concept, rule, examplesPart } = extractConceptAndRule(testBlock);
    expect(concept).toContain("تشابه المضلعات");
    expect(rule).toContain("يتشابه المضلعان");
    expect(rule).not.toContain("المثال 1");
    expect(rule).not.toContain("المثال 2");

    const examples = parseSolvedExamplesFromSection(examplesPart, "الفكرة الأولى", concept);
    expect(examples.length).toBe(2);
    expect(examples[0].promptAr).not.toContain("خطوات الحل");
    expect(examples[1].promptAr).not.toContain("خطوات الحل");
    expect(examples[0].rawFinal).toBe("متساوية");
    expect(examples[1].rawFinal).toBe("4 سم");
  });
});
