import { describe, it, expect } from "vitest";
import { isDiagramJustifiedForQuestion as ok } from "@/core/ingestion/unsolicited-diagram-guard";

describe("unsolicited-diagram-guard", () => {
  it("سؤال جبري لفظي: لا رسم", () => expect(ok({ promptArabic: "أوجد مجموعة حل المعادلة", rawDiagramTagText: "مثلث أ ب جـ", branchId: "algebra" })).toBe(false));
  it("نص صريح «في الشكل المقابل»: رسم", () => expect(ok({ promptArabic: "في الشكل المقابل أوجد س", rawDiagramTagText: "مثلث", branchId: "algebra" })).toBe(true));
  it("فرع هندسي بوسم صحيح: رسم", () => expect(ok({ promptArabic: "احسب مساحة المثلث", rawDiagramTagText: "مثلث", branchId: "plane_geometry" })).toBe(true));
  it("وسم فارغ: لا رسم", () => expect(ok({ promptArabic: "أي شيء", rawDiagramTagText: "  ", branchId: "plane_geometry" })).toBe(false));
});
