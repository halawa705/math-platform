import { describe, expect, it } from "vitest";
import { isSpecialAnglesTrigRule } from "@/core/pdf-layout-engine/trig-special-angles-pedagogical-table";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { cleanStudentFacingMathPromptSSOT } from "@/core/ingestion/notebooklm-citation-latex-sanitizer";

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

  it("checks geometry matcher decisions and prompt cleaning for Idea 8 drills", () => {
    const rawDrill1 =
      "- **** [رسم هندسي: مثلثان DBC و ABD مشتركان في الضلع BD ; m(∠C) = 90° ; m(∠CBD) = 60° ; DC = 6√3 سم ; m(∠ADB) = 90° ; m(∠A) = 45° ; المطلوب: طول AB]. | معرف السؤال: practice-08-01";
    const rawDrill3 =
      "- **** [رسم هندسي: ABCD شبه منحرف فيه AB = AD = DC = 10 سم ; BC = 22 سم ; AD // BC ; المطلوب: قياس ∠C لأقرب دقيقة، ومساحة شبه المنحرف ABCD]. | معرف السؤال: practice-08-03";
    const rawDrill4 =
      "- **** [رسم هندسي: ABCD مستطيل فيه AB = 15 سم ; AC = 25 سم ; المطلوب: m(∠ACB) بالدرجات والدقائق والثواني، ومساحة المستطيل]. | معرف السؤال: practice-08-04";

    // 1. Verify cleanStudentFacingMathPromptSSOT extracts natural question text instead of empty string
    const cleanedPrompt1 = cleanStudentFacingMathPromptSSOT(rawDrill1);
    expect(cleanedPrompt1).toContain("في الشكل المقابل");
    expect(cleanedPrompt1).toContain("مثلثان DBC و ABD");
    expect(cleanedPrompt1).toContain("المطلوب: طول AB");

    const cleanedPrompt3 = cleanStudentFacingMathPromptSSOT(rawDrill3);
    expect(cleanedPrompt3).toContain("في الشكل المقابل");
    expect(cleanedPrompt3).toContain("ABCD شبه منحرف");

    const cleanedPrompt4 = cleanStudentFacingMathPromptSSOT(rawDrill4);
    expect(cleanedPrompt4).toContain("في الشكل المقابل");
    expect(cleanedPrompt4).toContain("ABCD مستطيل");

    // 2. Verify natural Arabic geometry matcher generates green figures with 0 leak warnings
    const t1 = "مثلثان DBC و ABD مشتركان في الضلع BD ; m(∠C) = 90° ; m(∠CBD) = 60° ; DC = 6√3 سم ; m(∠ADB) = 90° ; m(∠A) = 45° ; المطلوب: طول AB";
    const t2 = "ABCD شبه منحرف فيه AB = AD = DC = 10 سم ; BC = 22 سم ; AD // BC ; المطلوب: قياس ∠C لأقرب دقيقة، ومساحة شبه المنحرف ABCD";
    const t3 = "ABCD مستطيل فيه AB = 15 سم ; AC = 25 سم ; المطلوب: m(∠ACB) بالدرجات والدقائق والثواني، ومساحة المستطيل";

    const d1 = matchGeometryWithDiagnostics(t1, "t1");
    const d2 = matchGeometryWithDiagnostics(t2, "t2");
    const d3 = matchGeometryWithDiagnostics(t3, "t3");

    expect(d1.decision).toBe("green");
    expect(d1.figure).toBeDefined();

    expect(d2.decision).toBe("green");
    expect(d2.figure).toBeDefined();

    expect(d3.decision).toBe("green");
    expect(d3.figure).toBeDefined();
    expect(d3.warnings).toHaveLength(0);
  });
});

