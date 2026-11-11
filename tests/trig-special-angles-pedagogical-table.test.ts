import { describe, expect, it } from "vitest";
import { isSpecialAnglesTrigRule } from "@/core/pdf-layout-engine/trig-special-angles-pedagogical-table";

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
});
