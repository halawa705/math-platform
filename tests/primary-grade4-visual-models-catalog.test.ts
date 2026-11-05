/**
 * @file primary-grade4-visual-models-catalog.test.ts
 * @description اختبارات النموذج الشريطي والساعة التناظرية للصف الرابع: الحقائق من النص، المجهول لا يُكشف، الرفض عند النقص/التناقض.
 */
import { describe, it, expect } from "vitest";
import { parseBarModelFacts } from "@/core/geometry-engine/curriculum-catalogs/primary-stage/grade-4/primary-grade4-bar-model-fact-parser";
import { parseAnalogClockTime, buildGrade4AnalogClockSvgMarkup } from "@/core/geometry-engine/curriculum-catalogs/primary-stage/grade-4/primary-grade4-analog-clock-svg-builder";
import { matchPrimaryGrade4VisualModelsFigure } from "@/core/geometry-engine/curriculum-catalogs/primary-stage/grade-4/primary-grade4-visual-models-catalog";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { combineProblemAndTagGeometryContext } from "@/core/geometry-engine/description-intake/problem-geometry-context-extractor";

describe("Grade 4 bar model", () => {
  it("يحلل كلاً وجزأين مع رمز مجهول", () => {
    const f = parseBarModelFacts("نموذج شريطي: الكل = 985 ؛ الجزء الأول = d ؛ الجزء الثاني = 285");
    expect(f?.whole).toEqual({ kind: "number", value: "985", unit: undefined });
    expect(f?.parts[0]).toEqual({ kind: "symbol", symbol: "d", unit: undefined });
  });
  it("يدعم الفراغ المنقط بوحدة (تحويل الوحدات)", () => {
    const f = parseBarModelFacts("نموذج شريطي: الكل = 5,816 م ؛ الجزء الأول = ... كم ؛ الجزء الثاني = ... م");
    expect(f?.parts[0]).toEqual({ kind: "blank", unit: "كم" });
  });
  it("يرفض التناقض الحسابي بنفس الوحدة", () => {
    expect(parseBarModelFacts("نموذج شريطي: الكل = 900 ؛ الجزء الأول = 460 ؛ الجزء الثاني = 400")).toBeNull();
  });
  it("يرفض النقص ويرفض غير النموذج الشريطي", () => {
    expect(parseBarModelFacts("نموذج شريطي: الكل = 900 ؛ الجزء الأول = 460")).toBeNull();
    expect(parseBarModelFacts("الكل = 900 ؛ الجزء الأول = 460 ؛ الجزء الثاني = c")).toBeNull();
  });
  it("لا يكشف الحل: المجهول لا يظهر كعدد على الرسم", () => {
    const fig = matchPrimaryGrade4VisualModelsFigure("نموذج شريطي: الكل = 900 ؛ الجزء الأول = 460 ؛ الجزء الثاني = c");
    expect(fig?.rawSvgMarkup).toContain(">c<");
    expect(fig?.rawSvgMarkup).not.toContain("440");
  });
  it("المسار الإنتاجي يعيده من المطابق العام", () => {
    const r = matchGeometryWithDiagnostics("نموذج شريطي: الكل = 900 ؛ الجزء الأول = 460 ؛ الجزء الثاني = c", "t", "arabic");
    expect(r.figure?.branchId).toBe("primary_bar_model");
  });
  it("انحدار: فاصل الآلاف (13,000) لا يتحول إلى حقيقتين في دمج السياق", () => {
    const combined = combineProblemAndTagGeometryContext("نموذج شريطي: الكل = 13,000 ؛ الجزء الأول = b ؛ الجزء الثاني = 5,300", "قيمة b =");
    expect(combined).toContain("13000");
    expect(combined).toContain("5300");
    const r = matchGeometryWithDiagnostics(combined, "t", "english");
    expect(r.figure?.rawSvgMarkup).toContain(">13000<");
  });
});

describe("Grade 4 analog clock", () => {
  it("يحلل الوقت ويرفض القيم غير الصالحة", () => {
    expect(parseAnalogClockTime("ساعة عقارب: 1:35")).toEqual({ hour: 1, minute: 35 });
    expect(parseAnalogClockTime("ساعة عقارب: 13:35")).toBeNull();
    expect(parseAnalogClockTime("ساعة عقارب: 4:75")).toBeNull();
    expect(parseAnalogClockTime("الساعة 4:30")).toBeNull();
  });
  it("لا يطبع الوقت نصاً ويضع العقارب في الزاوية الصحيحة", () => {
    const svg = buildGrade4AnalogClockSvgMarkup({ hour: 3, minute: 0 });
    expect(svg).not.toContain("3:00");
    // عقرب الدقائق عند 12 (رأسي للأعلى)، عقرب الساعات عند 3 (أفقي لليمين)
    expect(svg).toMatch(/x2="70"\s+y2="24"/);
    expect(svg).toMatch(/x2="98"\s+y2="70"/);
  });
});
