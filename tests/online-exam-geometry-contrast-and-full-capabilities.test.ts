import { describe, it, expect } from "vitest";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";
import { projectCartesianGraphToSVGMarkup } from "@/core/geometry-engine/graph-compositor/graph-svg-projector";
import { renderQuestionFigureSvg } from "@/core/pdf-layout-engine/question-figure-svg-renderer";
import { parseNotebookLMExamQuestionsToIR } from "@/core/ingestion/notebooklm-exam-questions-parser";
import { splitExamIntoPublicAndKey } from "@/core/exam-grading/online-exam-public-key-splitter";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { parseCartesianGraphDescription } from "@/core/geometry-engine/graph-compositor/graph-fact-parser";

describe("الاختبارات الإلكترونية: وضوح خلفية الأشكال الهندسية وكامل قدرات المنصة", () => {
  it("تتضمن رسومات الهندسة والرسم البياني خلفية بيضاء صريحة تضمن التباين مع الخطوط الداكنة", () => {
    const geo = matchGeometryWithDiagnostics(
      "مثلث أ ب جـ قائم في ب، أ ب = 3 سم، ب جـ = 4 سم",
      "test_tri"
    ).figure;
    expect(geo).toBeDefined();
    const geoSvg = projectGeometryFigureToSVGMarkup(geo!, {
      widthPx: 300,
      heightPx: 200,
      strokeColorHex: "#0F172A",
    });
    expect(geoSvg).toContain('<rect x="0" y="0" width="300" height="200" rx="8" fill="#FFFFFF" />');
    expect(geoSvg).toContain('stroke="#0F172A"');

    const graphSpec = parseCartesianGraphDescription("د(س) = س^2 - 4")!;
    expect(graphSpec).toBeDefined();
    const graphSvg = projectCartesianGraphToSVGMarkup(graphSpec, {
      widthPx: 280,
      heightPx: 190,
      strokeColorHex: "#0F172A",
    });
    expect(graphSvg).toContain('<rect x="0" y="0" width="280" height="190" rx="8" fill="#FFFFFF" />');
    expect(graphSvg).toContain("#0F172A");
  });

  it("يدعم المحلل جميع أنواع الرسوم في الاختبار الإلكتروني (هندسي، بياني، إحصائي، ونموذج مساحة) وينظف الوسوم", () => {
    const raw = `
=== [QUESTION: 1] | النوع: MCQ | الدرس: فيثاغورس | الدرجة: 2 ===
النص: في الشكل المقابل مثلث أ ب جـ قائم في ب حيث أ ب = 3 سم، ب جـ = 4 سم، ما طول أ جـ؟ [رسم هندسي: مثلث أ ب جـ قائم في ب، طول أ ب = 3 سم، طول ب جـ = 4 سم]
المعطيات: أ ب = 3 سم | ب جـ = 4 سم | ق(∠ ب) = 90°
المطلوب: طول أ جـ
الرسم: [رسم هندسي: مثلث أ ب جـ قائم في ب، أ ب = 3 سم، ب جـ = 4 سم]
البدائل: 5 سم | 7 سم | 6 سم | 12 سم
الإجابة_الصحيحة: 5 سم
خطوات_الحل: أ جـ = جذر(9 + 16) = 5 سم

=== [QUESTION: 2] | النوع: SHORT | الدرس: الدالة التربيعية | الدرجة: 3 ===
النص: من الرسم البياني للدالة التربيعية، أوجد نقطة رأس المنحنى [رسم بياني: د(س) = س^2 - 4]
الرسم: [رسم بياني: د(س) = س^2 - 4]
الإجابة_الصحيحة: (0, -4)
الإجابات_المقبولة: (0, -4) | (٠, -٤)

=== [QUESTION: 3] | النوع: MCQ | الدرس: القطاعات الدائرية | الدرجة: 2 ===
النص: يوضح القطاع الدائري توزيع الطلاب: علمي 60%، أدبي 40%.
الرسم: [رسم إحصائي: قطاعات دائرية | علمي=60 | أدبي=40]
البدائل: 216° | 180° | 144° | 90°
الإجابة_الصحيحة: 216°

=== [QUESTION: 4] | النوع: SHORT | الدرس: الضرب بنموذج مساحة المستطيل | الدرجة: 2 ===
النص: استخدم نموذج مساحة المستطيل لإيجاد ناتج: 23 × 14 [نموذج بصري: نموذج مساحة المستطيل للضرب 23 × 14]
الرسم: نموذج مساحة المستطيل 23 × 14
الإجابة_الصحيحة: 322
الإجابات_المقبولة: 322 | ٣٢٢
    `.trim();

    const parsed = parseNotebookLMExamQuestionsToIR({
      rawText: raw,
      branchId: "plane_geometry",
      unitId: "u1",
      lessonId: "l1",
      lessonTitleArabic: "اختبار شامل",
      gradeId: "prep-3",
      notationLanguage: "arabic",
      numeralMode: "western",
    });

    expect(parsed.length).toBe(4);

    // 1. Geometry question with clean prompt & Arabic notation preserved
    expect(parsed[0].attachedGeometryFigure).toBeDefined();
    expect(parsed[0].promptArabic).not.toContain("[رسم هندسي");
    expect(parsed[0].givenDataArabic?.length).toBe(3);
    expect(parsed[0].requiredToProveOrFindArabic).toBe("طول أ جـ");
    expect(parsed[0].notationLanguage).toBe("arabic");

    // 2. Cartesian graph
    expect(parsed[1].graphSpec).toBeDefined();
    expect(parsed[1].promptArabic).not.toContain("[رسم بياني");

    // 3. Statistics figure rendered cleanly
    expect(parsed[2].attachedGeometryFigure?.familyId).toBe("statistics_family");
    const statsSvg = renderQuestionFigureSvg(parsed[2], { backgroundColorHex: "#FFFFFF" });
    expect(statsSvg).toContain("<svg");

    // 4. Primary arithmetic area model rawSvgMarkup
    expect(parsed[3].rawSvgMarkup).toContain("<svg");
    expect(parsed[3].promptArabic).not.toContain("[نموذج بصري");
    expect(renderQuestionFigureSvg(parsed[3])).toContain("<svg");

    // Public/Key splitter preserves all figure/context fields without leaking answers
    const split = splitExamIntoPublicAndKey(parsed);
    expect(split.publicQuestions.length).toBe(4);
    expect(split.publicQuestions[0].givenDataArabic).toEqual(parsed[0].givenDataArabic);
    expect(split.publicQuestions[0].requiredToProveOrFindArabic).toBe("طول أ جـ");
    expect(split.publicQuestions[0].notationLanguage).toBe("arabic");
    expect(split.publicQuestions[0].numeralMode).toBe("western");
    expect(split.publicQuestions[3].rawSvgMarkup).toContain("<svg");

    const publicJson = JSON.stringify(split.publicQuestions);
    expect(publicJson).not.toContain("correctMcqChoiceIndex");
    expect(publicJson).not.toContain("acceptedAnswersArabic");
  });
});
