import { describe, expect, it } from "vitest";
import { isSpecialAnglesTrigRule } from "@/core/pdf-layout-engine/trig-special-angles-pedagogical-table";
import {
  parseSolvedExamplesFromSection,
  extractConceptAndRule,
} from "@/core/ingestion/notebooklm-stage-parsers-helper";

describe("Trig Special Angles Pedagogical Table & Rules", () => {
  it("detects special angles rule text in both Arabic and English numerals", () => {
    // English numerals
    expect(
      isSpecialAnglesTrigRule(
        "النسب المثلثية للزوايا الخاصة 30° و 60°: sin 30 = 1/2, cos 60 = 1/2, tan 60 = sqrt(3)"
      )
    ).toBe(true);

    // Arabic numerals with Arabic function names
    expect(
      isSpecialAnglesTrigRule(
        "النسب المثلثية للزوايا الخاصة ٣٠° و ٦٠°: جا ٣٠ = ١/٢، جتا ٦٠ = ١/٢، ظا ٦٠ = جذر ٣"
      )
    ).toBe(true);

    // Missing angle 60
    expect(isSpecialAnglesTrigRule("جا 30 = 1/2")).toBe(false);

    // Missing trig function
    expect(isSpecialAnglesTrigRule("الزوايا 30 و 60")).toBe(false);

    // Undefined or empty
    expect(isSpecialAnglesTrigRule(undefined)).toBe(false);
    expect(isSpecialAnglesTrigRule("")).toBe(false);
  });

  it("correctly extracts both examples when NotebookLM uses level 4 markdown headers (#### المثال)", () => {
    const rawSection = `#### المثال 1 | معرف المثال: example-01-01
**نص المسألة:** بدون استخدام الآلة الحاسبة، احسب قيمة المقدار: cos 60

**خطوات الحل:**
1. cos 60 = 1/2

**الناتج النهائي:** -1/2

#### المثال 2 | معرف المثال: example-01-02
**نص المسألة:** احسب في أبسط صورة وبدون استخدام الآلة الحاسبة قيمة: كذا

**خطوات الحل:**
1. حساب قيمة البسط: 2

**الناتج النهائي:** 2
نهاية الفكرة الأولى`;

    const parsed = parseSolvedExamplesFromSection(rawSection, "الفكرة الأولى", "المفهوم");
    expect(parsed.length).toBe(2);
    expect(parsed[0].promptAr).toContain("بدون استخدام الآلة الحاسبة");
    expect(parsed[1].promptAr).toContain("احسب في أبسط صورة");
  });
});

