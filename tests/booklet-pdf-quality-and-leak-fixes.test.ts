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
    const input = "إذا كان المضلع ABCD المضلع XYZW ~ فإن";
    const normalized = normalizeToEgyptianSchoolMath(input);
    assert.match(normalized, /المضلع\s*\$ABCD\s*\\sim\s*XYZW\$/);
    assert.doesNotMatch(normalized, /XYZW\s*~/);
  });

  it("Issue 2 & 4: Cleans leaked LaTeX artifacts and normalizes fractions", () => {
    const leaked1 = "$\\ = $ 5 سم";
    const cleaned1 = cleanStrayLatexArtifacts(leaked1);
    assert.doesNotMatch(cleaned1, /\\\s*=\s*/);

    const leaked2 = "frac{12}{4}";
    const cleaned2 = wrapBalancedLatexCommands(leaked2);
    assert.match(cleaned2, /\\frac\{12\}\{4\}/);
  });

  it("Issue 3: Sub-requirements line breaks formatting", () => {
    const rawReqs = "أوجد: أولاً: طول أ ب ثانياً: قياس زاوية جـ";
    const cleaned = cleanStudentFacingMathPromptSSOT(rawReqs);
    assert.match(cleaned, /•\s*أولاً:/);
    assert.match(cleaned, /•\s*ثانياً:/);
  });

  it("Issue 6: Binds Latin variables with Arabic measurement units", () => {
    const input1 = "وكان AB = 4 سم و BC = 5 سم";
    const result1 = normalizeArabicUnitPlacementSSOT(input1);
    assert.match(result1, /\$AB = 4\\text\{ سم\}\$/);
    assert.match(result1, /\$BC = 5\\text\{ سم\}\$/);

    const input2 = "وقياس m(∠B) = 70°";
    const result2 = normalizeArabicUnitPlacementSSOT(input2);
    assert.match(result2, /\$m\(∠B\) = 70\^\\circ\$/);
  });

  it("Issue 4: Converts bare tilde in math to \\sim and strips stray div slashes", () => {
    const divLeak = "بالقسمة على k: \\div k\\";
    const divCleaned = cleanStrayLatexArtifacts(divLeak);
    assert.doesNotMatch(divCleaned, /\\div k\\/);
  });
});
