import { describe, it, expect } from "vitest";
import { buildStandardDocumentTitleSSOT } from "./curriculum-document-title-builder";

describe("curriculum-document-title-builder", () => {
  it("builds clean title for multi-unit scope without defaulting to unit 1", () => {
    const title = buildStandardDocumentTitleSSOT({
      gradeId: "prim-5",
      unitTitleInput: "الوحدات (3، 4، 5)",
      lessonTitleInput: "الوحدة 3 كاملة + الوحدة 4 كاملة + الوحدة 5 كاملة [باستثناء: الكسور العشرية والنظام المتري]",
      rawReplyText: "ضرب وقسمة الأعداد الصحيحة والكسور العشرية",
    });

    expect(title).toContain("5ب");
    expect(title).toContain("الوحدات (3، 4، 5)");
    expect(title).toContain("ضرب وقسمة الأعداد والكسور العشرية");
    expect(title).not.toContain("تشابه المضلعات");
    expect(title).not.toContain("الوحدة الأولى");
  });

  it("builds standard title for single lesson within primary grade 5", () => {
    const title = buildStandardDocumentTitleSSOT({
      gradeId: "prim-5",
      unitTitleInput: "الوحدة الثانية",
      lessonTitleInput: "المتغيرات في المعادلات",
      lessonOrderIndex: 2,
    });

    expect(title).toContain("5ب");
    expect(title).toContain("المتغيرات في المعادلات");
  });
});
