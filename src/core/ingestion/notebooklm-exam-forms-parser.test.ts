import { describe, expect, it } from "vitest";
import { buildExamFormsNotebookLMPrompt } from "../prompts/exam-forms-notebooklm-prompt-builder";
import { parseNotebookLMExamForms } from "./notebooklm-exam-forms-parser";
import { convertQuestionAssessmentIRToPrintableItem } from "../pdf-layout-engine/a4-vector-html-sheet-renderer";

const SAMPLE_NOTEBOOKLM_FORMS_REPLY = `
=== [FORM: 1] | النموذج: (أ) ===
=== [QUESTION: 1] | النموذج: [أ] | النوع: [MCQ] | الدرس: [موضع نقطة ودائرة] | الدرجة: [1] ===
النص: دائرة $M$ طول نصف قطرها $5$ سم، $A$ نقطة في مستواها حيث $MA = 3$ سم، فإن النقطة $A$ تقع: { محافظة القاهرة }
البدائل: (أ) داخل الدائرة | (ب) خارج الدائرة | (جـ) على الدائرة | (د) مركز الدائرة
الإجابة_الصحيحة: (أ) داخل الدائرة
البرهان_والخطوات: بما أن $MA < r$ فإن النقطة $A$ تقع داخل الدائرة.
=== [QUESTION: 2] | النموذج: [أ] | النوع: [PROOF] | الدرس: [الزاوية المركزية والوتر] | الدرجة: [3] ===
النص: في الدائرة $M$، $AB$ وتر، $C$ منتصف $AB$. أثبت أن $MC \\perp AB$.
الرسم: [رسم هندسي: دائرة مركزها م فيها وتر أ ب وجـ منتصف أ ب]
الإجابة_الصحيحة: الزاوية قياسها $90^\\circ$
البرهان_والخطوات: بما أن جـ منتصف أ ب | إذن م جـ عمودي على أ ب

=== [FORM: 2] | النموذج: (ب) ===
=== [QUESTION: 1] | النموذج: [ب] | النوع: [MCQ] | الدرس: [موضع مستقيم ودائرة] | الدرجة: [1] ===
النص: دائرة قطرها $10$ سم، والمستقيم $L$ يبعد عن مركزها $5$ سم، فإن المستقيم $L$ يكون: { محافظة الجيزة }
البدائل: (أ) قاطعاً للدائرة | (ب) مماساً للدائرة | (جـ) خارجاً عن الدائرة | (د) محور تماثل
الإجابة_الصحيحة: (ب) مماساً للدائرة
البرهان_والخطوات: نصف القطر $r = 5$ سم والبعد يساوي نصف القطر إذن المستقيم مماس.
=== [QUESTION: 2] | النموذج: [ب] | النوع: [PROOF] | الدرس: [الأوتار المتساوية وأبعادها] | الدرجة: [3] ===
النص: في الدائرة $M$، $AB = CD$ وتران متساويان. أثبت أن بعديهما عن المركز متساويان.
الرسم: [رسم هندسي: دائرة مركزها م فيها وتران متساويان أ ب وجـ د]
الإجابة_الصحيحة: الأبعاد متساوية
البرهان_والخطوات: الأوتار المتساوية في الطول تكون على أبعاد متساوية من المركز
`;

describe("Exam Forms NotebookLM Prompt & Parser Invariants", () => {
  it("builds an airtight prompt enforcing multiple forms, strict difference, and source alignment", () => {
    const prompt = buildExamFormsNotebookLMPrompt({
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "plane_geometry",
      scopeKind: "monthly_exam",
      scopeDescriptionArabic: "الوحدة الأولى والثانية (الدائرة وتعاريفها)",
      formsCount: 3,
      mcqQuestionsCount: 5,
      essayAndProofQuestionsCount: 3,
      totalMarksPerForm: 14,
      durationTextArabic: "ساعة ونصف",
      difficultyProfile: "standard_balanced",
    });

    expect(prompt).toContain("(3) نماذج امتحانية ورقية متكافئة");
    expect(prompt).toContain("النموذج (أ)");
    expect(prompt).toContain("النموذج (ب)");
    expect(prompt).toContain("النموذج (جـ)");
    expect(prompt).toContain("التكافؤ التام والاختلاف الحقيقي");
    expect(prompt).toContain("يُمنع منعاً باتاً تكرار أي سؤال بنفس الفكرة");
    expect(prompt).toContain("المطابقة الصارمة والتامة للمصادر");
    expect(prompt).toContain("=== [FORM: رقم_النموذج]");
  });

  it("parses multi-form NotebookLM output into isolated form blocks with distinct questions", () => {
    const forms = parseNotebookLMExamForms({
      rawText: SAMPLE_NOTEBOOKLM_FORMS_REPLY,
      branchId: "plane_geometry",
      unitId: "circle-unit",
      lessonId: "circle-basics",
      lessonTitleArabic: "الدائرة",
      expectedFormsCount: 2,
    });

    expect(forms.length).toBe(2);

    // Form 1 (أ)
    expect(forms[0].formLetterAr).toBe("أ");
    expect(forms[0].formTitleAr).toBe("النموذج (أ)");
    expect(forms[0].questions.length).toBe(2);
    expect(forms[0].questions[0].patternKind).toBe("mcq");
    expect(forms[0].questions[0].mcqChoicesArabic).toBeDefined();
    expect(forms[0].questions[1].patternKind).toBe("proof_reasoning");

    // Form 2 (ب)
    expect(forms[1].formLetterAr).toBe("ب");
    expect(forms[1].formTitleAr).toBe("النموذج (ب)");
    expect(forms[1].questions.length).toBe(2);
    expect(forms[1].questions[0].promptArabic).toContain("دائرة قطرها $10$ سم");
    expect(forms[1].questions[0].mcqChoicesArabic?.[1]).toContain("مماساً للدائرة");

    // Printable conversion
    const printableFormA = forms[0].questions.map((q) =>
      convertQuestionAssessmentIRToPrintableItem(q, "الهندسة المستوية")
    );
    expect(printableFormA.length).toBe(2);
    expect(printableFormA[0].branchBadgeAr).toBe("الهندسة المستوية");
  });

  it("falls back gracefully when questions are not prefixed with form headers and splits evenly", () => {
    const unformattedQuestions = `
=== [QUESTION: 1] | النوع: [MCQ] | الدرجة: [1] ===
النص: قياس القوس الذي يمثل نصف قياس الدائرة يساوي:
البدائل: (أ) $90^\\circ$ | (ب) $180^\\circ$ | (جـ) $270^\\circ$ | (د) $360^\\circ$
الإجابة_الصحيحة: (ب) $180^\\circ$
=== [QUESTION: 2] | النوع: [MCQ] | الدرجة: [1] ===
النص: قياس الزاوية المحيطية المرسومة في نصف دائرة يساوي:
البدائل: (أ) حادة | (ب) منفرجة | (جـ) قائمة | (د) مستقيمة
الإجابة_الصحيحة: (جـ) قائمة
=== [QUESTION: 3] | النوع: [MCQ] | الدرجة: [1] ===
النص: عدد محاور التماثل لأي دائرة هو:
البدائل: (أ) 1 | (ب) 2 | (جـ) 3 | (د) عدد لا نهائي
الإجابة_الصحيحة: (د) عدد لا نهائي
=== [QUESTION: 4] | النوع: [MCQ] | الدرجة: [1] ===
النص: أوتار الدائرة المتساوية في الطول تكون على أبعاد:
البدائل: (أ) مختلفة | (ب) متساوية من المركز | (جـ) متوازية | (د) متعامدة
الإجابة_الصحيحة: (ب) متساوية من المركز
`;

    const forms = parseNotebookLMExamForms({
      rawText: unformattedQuestions,
      branchId: "plane_geometry",
      unitId: "circle-unit",
      lessonId: "circle-basics",
      lessonTitleArabic: "الدائرة",
      expectedFormsCount: 2,
    });

    expect(forms.length).toBe(2);
    expect(forms[0].formLetterAr).toBe("أ");
    expect(forms[0].questions.length).toBe(2);
    expect(forms[1].formLetterAr).toBe("ب");
    expect(forms[1].questions.length).toBe(2);
  });

  it("supports large form counts (e.g. 15 forms) and adjusts prompt rules for high-yield ideas", () => {
    const prompt = buildExamFormsNotebookLMPrompt({
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "plane_geometry",
      scopeKind: "end_of_term",
      scopeDescriptionArabic: "كامل منهج الترم الأول",
      formsCount: 15,
      mcqQuestionsCount: 6,
      essayAndProofQuestionsCount: 4,
      totalMarksPerForm: 18,
      durationTextArabic: "ساعتان",
      difficultyProfile: "standard_balanced",
    });

    expect(prompt).toContain("(15) نماذج امتحانية ورقية متكافئة");
    expect(prompt).toContain("إجمالي 15 نماذج متتالية");
    expect(prompt).toContain("استثناء النماذج الضخمة والأفكار الأكثر تكراراً");
    expect(prompt).toContain("المطلوب 15 نماذج");
    expect(prompt).toContain("الأفكار الجوهرية الكبرى الأكثر تكراراً وشهرة");

    // Test partitioning 30 questions into 15 forms
    const thirtyQuestionsText = Array.from({ length: 30 }, (_, i) => `
=== [QUESTION: ${i + 1}] | النوع: [MCQ] | الدرجة: [1] ===
النص: مسألة رقم ${i + 1} في الهندسة.
البدائل: (أ) 1 | (ب) 2 | (جـ) 3 | (د) 4
الإجابة_الصحيحة: (أ) 1
`).join("\n");

    const parsed15 = parseNotebookLMExamForms({
      rawText: thirtyQuestionsText,
      branchId: "plane_geometry",
      unitId: "geo-term1",
      lessonId: "all-term1",
      lessonTitleArabic: "هندسة الترم الأول",
      expectedFormsCount: 15,
    });

    expect(parsed15.length).toBe(15);
    expect(parsed15[0].formTitleAr).toBe("النموذج (أ)");
    expect(parsed15[14].formTitleAr).toContain("النموذج");
    expect(parsed15.every((f) => f.questions.length === 2)).toBe(true);
  });
});
