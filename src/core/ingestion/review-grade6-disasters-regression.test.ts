import { describe, expect, it } from "vitest";
import { mergeFinalReviewThreeStagesToPrintableItems } from "./notebooklm-final-review-parser";
import { parseNotebookLMExamQuestionsToIR } from "./notebooklm-exam-questions-parser";
import { parseGradeRibbonInfo } from "../pdf-layout-engine/modern-editorial-page-chrome";
import { buildFlowItems } from "../pdf-layout-engine/flow-items-builder";
import { dropTrailingAccreditationOnlyPage, type FlowPage } from "../pdf-layout-engine/flow-item-model";
import { buildStandardDocumentTitleSSOT } from "../ssot/curriculum-document-title-builder";

const SAMPLE_STAGE1_UNNUMBERED = `"### مراجعة مقرر الشهر (المرحلة ١: أسئلة اختيار من متعدد وإجاباتها)
**الفرع:** الجبر والفترات والمتباينات | **الصف:** السادس الابتدائي (الفصل الدراسي الأول)
**النطاق:** الوحدة الثالثة + الوحدة الرابعة

---

 أي مما يلي يمثل مقداراً جبرياً؟
(أ) $3 \\times 5 - 4$
(ب) $2x + 7$
(جـ) $12 \\div (4 + 2)$
(د) $5^2 - 10$
الإجابة الصحيحة: (ب) $2x + 7$

 [رسم هندسي: ميزان ذو كفتين متزن، الكفة اليمنى بها قطعتان كل منهما \\(x\\)، والكفة اليسرى بها \\(8\\) أثقال من فئة \\(1\\) جرام]، فإن المعادلة وقيمة \\(x\\) هما:
(أ) \\(x + 2 = 8\\)
(ب) \\(2x = 16\\)
(جـ) \\(x - 2 = 8\\)
(د) \\(2x = 8\\)
الإجابة الصحيحة: (د) \\(2x = 8\\)

 [رسم هندسي: خط أعداد صحيح مظلل عليه النقطة \\(-1\\) وجميع الأعداد الواقعة على يمينها: \\(0, 1, 2, 3, \\dots\\) بسهم متصل]، المتباينة الممثلة هي:
(أ) \\(x > -1\\)
(ب) \\(x \\le -1\\)
(جـ) \\(x \\ge -1\\)
(د) \\(x < -1\\)
الإجابة الصحيحة: (جـ) \\(x \\ge -1\\)

---

*إحصاء توزيع مفاتيح الإجابة:*
- الحرف (أ): 12 سؤالاً (24%)

---

🎯 جاهز لنقلك فوراً إلى المرحلة الثانية!"`;

const SAMPLE_STAGE2_UNNUMBERED = `"### مراجعة مقرر الشهر (المرحلة ٢: الأسئلة المقالية)
**الفرع:** الجبر والفترات والمتباينات | **الصف:** السادس الابتدائي

---

 اكتب تعبيراً لفظياً مناسباً لكل مقدار جبري من المقادير التالية:
(1) \\(5(x - 2)\\)
(2) \\(\\frac{y}{4} + 7\\)

 مستطيل طوله ثلاثة أمثال عرضه. إذا كان العرض يرمز له بالرمز \\(w\\):
اكتب مقداراً جبرياً يعبر عن مساحة المستطيل بدلالة \\(w\\)، ثم احسب المساحة إذا كان \\(w = 4\\) سم.

 بالاعتماد على جدول القيم الآتي:
| \\(x\\) | \\(1\\) | \\(2\\) |
| :---: | :---: | :---: |
| \\(y\\) | \\(6\\) | \\(11\\) |
أولاً: اكتشف القاعدة الرياضية.
ثانياً: اكتب المعادلة الجبرية.

---

📋 **الخطوة التالية المتاحة:** هل ترغب في البدء في المرحلة ٣؟"`;

const SAMPLE_STAGE3_UNNUMBERED = `"### مراجعة مقرر الشهر (المرحلة ٣: الإجابات النموذجية)
**الفرع:** الجبر | **الصف:** السادس

---

#### حل السؤال:
- **خطوات الحل:**
  - (1) خمسة أمثال ناتج طرح 2 من العدد \\(x\\).
- **الناتج النهائي:** \\(5(x - 2)\\)

---

#### حل السؤال:
- **خطوات الحل:**
  - الطول = \\(3w\\)، المساحة = \\(3w^2\\).
  - حل المعادلة: \\(3(16) = 48\\)
- **الناتج النهائي:** \\(48\\) سم²

---

#### حل السؤال:
- **خطوات الحل:**
  - القاعدة: اضرب في 5 ثم أضف 1.
- **الناتج النهائي:** \\(y = 5x + 1\\)

---

💡 يمكننا الآن تجميع المراجعة!"`;

describe("Review Grade 6 Disasters End-to-End Regression", () => {
  it("strips stage envelope, avoids fake #51 card, renders balance scale & number line without leading comma", () => {
    const mcqs = parseNotebookLMExamQuestionsToIR({
      rawText: SAMPLE_STAGE1_UNNUMBERED,
      branchId: "algebra",
      unitId: "u3",
      lessonId: "rev",
      lessonTitleArabic: "مراجعة",
      gradeId: "prim-6",
    });

    expect(mcqs).toHaveLength(3);
    expect(mcqs[0].promptArabic).not.toContain("###");
    expect(mcqs[0].promptArabic).not.toContain("الفرع");
    expect(mcqs[1].attachedGeometryFigure?.rawSvgMarkup).toContain("<svg");
    expect(mcqs[1].promptArabic.startsWith("،")).toBe(false);
    expect(mcqs[2].attachedGeometryFigure?.rawSvgMarkup).toContain("<svg");
    expect(mcqs[2].promptArabic.startsWith("،")).toBe(false);
  });

  it("splits unnumbered essays cleanly without breaking (1)/(2), preserves Markdown tables, avoids Area Model hallucination, and links Stage 3 solutions", () => {
    const merged = mergeFinalReviewThreeStagesToPrintableItems({
      stage1Raw: SAMPLE_STAGE1_UNNUMBERED,
      stage2Raw: SAMPLE_STAGE2_UNNUMBERED,
      stage3Raw: SAMPLE_STAGE3_UNNUMBERED,
      branchId: "algebra",
      branchNameAr: "الجبر",
      titleArabic: "مراجعة مقرر الشهر",
    });

    const mcqs = merged.filter((q) => q.kind === "mcq");
    const essays = merged.filter((q) => q.kind !== "mcq");
    expect(mcqs).toHaveLength(3);
    expect(essays).toHaveLength(3);
    expect(essays[0].promptAr).toContain("(1)");
    expect(essays[0].promptAr).toContain("(2)");
    expect(essays[1].rawSvgMarkup).toBeUndefined();
    expect(essays[1].geometryFigure).toBeUndefined();
    expect(essays[2].promptAr).toContain("| :---: | :---: |");
    expect(essays[0].solutionStepsAr?.join(" ")).toContain("خمسة أمثال");
    expect(essays[1].solutionStepsAr?.join(" ")).toContain("48");
    expect(essays[2].solutionStepsAr?.join(" ")).toContain("5x + 1");

    const { items } = buildFlowItems({
      questions: merged,
      columnsCount: 2,
      includeAnswerKey: false,
      paperTemplateId: "modern_editorial_handout",
    });
    expect(items.some((it) => it.kind === "idea_capsule")).toBe(false);
    expect(items.some((it) => it.kind === "editorial_ribbon_banner")).toBe(true);
  });

  it("detects grade 6 primary correctly even when title mentions الوحدة الثالثة", () => {
    expect(parseGradeRibbonInfo("الصف السادس الابتدائي", "1 - 6ب - الوحدة الثالثة: الهندسة والقياس")).toEqual({
      gradeNumber: "6",
      stageLabelAr: "ابتدائي",
    });
    const revTitle = buildStandardDocumentTitleSSOT({
      gradeId: "prim-6",
      unitTitleInput: "",
      lessonTitleInput: "تطبيقات الوحدات (3، 4، 5)",
    });
    expect(revTitle).not.toContain("الهندسة والقياس");
  });

  it("drops an empty trailing page that contains only accreditation_footer while keeping question pages", () => {
    const basePage: FlowPage = {
      pageNumber: 1,
      isFirstPage: true,
      segments: [{ kind: "full", item: { id: "b1", kind: "editorial_ribbon_banner", span: "full", titleArabic: "اختر" }, heightPx: 34 }],
      usedHeightPx: 900,
      budgetHeightPx: 920,
      gapPx: 4,
      targetHeightPxById: {},
      overflowsBudget: false,
    };
    const loneFooterPage: FlowPage = {
      pageNumber: 2,
      isFirstPage: false,
      segments: [{ kind: "full", item: { id: "flow-accreditation-footer", kind: "accreditation_footer", span: "full" }, heightPx: 95 }],
      usedHeightPx: 95,
      budgetHeightPx: 920,
      gapPx: 0,
      targetHeightPxById: {},
      overflowsBudget: false,
    };
    const contentFooterPage: FlowPage = {
      ...loneFooterPage,
      segments: [
        { kind: "full", item: { id: "ans-key", kind: "mcq_answer_key", span: "full" }, heightPx: 260 },
        { kind: "full", item: { id: "flow-accreditation-footer", kind: "accreditation_footer", span: "full" }, heightPx: 95 },
      ],
    };
    expect(dropTrailingAccreditationOnlyPage([basePage, loneFooterPage])).toHaveLength(1);
    expect(dropTrailingAccreditationOnlyPage([basePage, contentFooterPage])).toHaveLength(2);
  });
});
