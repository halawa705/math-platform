/**
 * @file parent-edition-answer-section-flow.test.ts
 * @description اختبار دقيق لفصل كراسة الإجابة في نهاية المستند لنسخة ولي الأمر:
 * 1. نسخة الطالب (questions_only): أسئلة فقط بدون أي إجابات أو حلول أسفلها، مع إتاحة أسطر الإجابة.
 * 2. نسخة ولي الأمر (questions_with_answers): نسخة الطالب كاملة أولاً (أسئلة فقط)، ثم في النهاية كراسة الإجابة:
 *    - شريط عنوان فاصل رسمي (★★★ كراسة الإجابة ونماذج الحل الرسمية ★★★)
 *    - جدول إجابات الاختيار من متعدد السريع (OfficialMcqAnswerKeySummaryTable)
 *    - بطاقات حل كل سؤال مقالي/مسألة مع خطوات الحل والشرح وبطاقة (✍️ إجابة سؤال X)
 * 3. نسخة مفتاح الإجابة فقط (answer_key_only): كراسة الإجابة فقط بدون تكرار الأسئلة في البداية.
 */

import { describe, expect, it } from "vitest";
import { buildFlowItems } from "@/core/pdf-layout-engine/flow-items-builder";
import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";

const SAMPLE_QUESTIONS: readonly PrintableMathQuestionItem[] = [
  {
    id: "rev-mcq-1",
    questionNumber: 1,
    kind: "mcq",
    branchBadgeAr: "الأعداد",
    marks: 1,
    promptAr: "حاصل ضرب $38 \\times 17$ يساوي:",
    mcqChoicesAr: ["546", "646", "656", "556"],
    correctMcqIndex: 1,
    modelAnswerAr: "(ب) 646",
    solutionStepsAr: ["(ب) 646"],
  },
  {
    id: "rev-mcq-2",
    questionNumber: 2,
    kind: "mcq",
    branchBadgeAr: "الأعداد",
    marks: 1,
    promptAr: "ناتج تقدير حاصل ضرب $71 \\times 89$ بالتقريب لأقرب عشرة هو:",
    mcqChoicesAr: ["6,300", "6,000", "6,900", "7,000"],
    correctMcqIndex: 0,
    modelAnswerAr: "(أ) 6,300",
    solutionStepsAr: ["(أ) 6,300"],
  },
  {
    id: "rev-essay-3",
    questionNumber: 3,
    kind: "essay_algebra",
    branchBadgeAr: "الأعداد",
    marks: 3,
    promptAr: "اشترى تاجر $45$ جهازاً بسعر الجهاز $3,200$ جنيهاً، احسب المبلغ الكلي المدفوع.",
    modelAnswerAr: "المبلغ = 144,000 جنيهاً",
    solutionStepsAr: [
      "المبلغ الكلي المدفوع = $45 \\times 3,200$",
      "حاصل الضرب = $144,000$ جنيهاً",
    ],
  },
  {
    id: "rev-essay-4",
    questionNumber: 4,
    kind: "essay_geometry",
    branchBadgeAr: "الهندسة المستوية",
    marks: 3,
    promptAr: "مستطيل بعداه $8$ سم و $5$ سم، احسب محيطه ومساحته.",
    modelAnswerAr: "المحيط = 26 سم ، المساحة = 40 سم²",
    solutionStepsAr: [
      "المحيط = $(8 + 5) \\times 2 = 26$ سم",
      "المساحة = $8 \\times 5 = 40$ سم²",
    ],
  },
];

describe("Parent Edition — Detached Answer Key Flow", () => {
  it("Student Edition (questions_only) renders questions without answers or banners at end", () => {
    const { items } = buildFlowItems({
      questions: SAMPLE_QUESTIONS,
      columnsCount: 2,
      includeAnswerKey: false,
      answerVisibilityMode: "questions_only",
      paperTemplateId: "classic_sovereign",
    });

    const questionItems = items.filter((i) => i.kind === "question");
    expect(questionItems.length).toBe(4);
    questionItems.forEach((qItem) => {
      if (qItem.kind === "question") {
        expect(qItem.forceHideSolution).toBe(true);
        expect(qItem.isAnswerCard).toBeFalsy();
      }
    });

    expect(items.some((i) => i.kind === "answer_section_banner")).toBe(false);
    expect(items.some((i) => i.kind === "mcq_answer_key")).toBe(false);
    expect(items.some((i) => i.kind === "accreditation_footer")).toBe(true);
  });

  it("Parent Edition (questions_with_answers) renders student questions FIRST, then Answer Section at the end", () => {
    const { items } = buildFlowItems({
      questions: SAMPLE_QUESTIONS,
      columnsCount: 2,
      includeAnswerKey: true,
      answerVisibilityMode: "questions_with_answers",
      paperTemplateId: "classic_sovereign",
    });

    // 1. الجزء الأول: أسئلة الطالب بدون حلول
    const studentQuestionItems = items
      .filter((i) => i.kind === "question")
      .filter((i) => (i.kind === "question" && !i.isAnswerCard));
    expect(studentQuestionItems.length).toBe(4);
    studentQuestionItems.forEach((qItem) => {
      if (qItem.kind === "question") {
        expect(qItem.forceHideSolution).toBe(true);
      }
    });

    // 2. الجزء الثاني: فاصل كراسة الإجابة
    const bannerIdx = items.findIndex((i) => i.kind === "answer_section_banner");
    expect(bannerIdx).toBeGreaterThan(0);
    const banner = items[bannerIdx];
    if (banner.kind === "answer_section_banner") {
      expect(banner.titleArabic).toBe("كراسة الإجابة ونماذج الحل الرسمية");
    }

    // 3. جدول إجابات اختر
    const mcqKeyIdx = items.findIndex((i) => i.kind === "mcq_answer_key");
    expect(mcqKeyIdx).toBeGreaterThan(bannerIdx);

    // 4. بطاقات الحل للأسئلة المقالية (سؤال 3 وسؤال 4)
    const answerCards = items.filter((i) => i.kind === "question" && i.isAnswerCard);
    expect(answerCards.length).toBe(2);
    if (answerCards[0].kind === "question") {
      expect(answerCards[0].question.questionNumber).toBe(3);
      expect(answerCards[0].forceHideSolution).toBe(false);
    }
    if (answerCards[1].kind === "question") {
      expect(answerCards[1].question.questionNumber).toBe(4);
      expect(answerCards[1].forceHideSolution).toBe(false);
    }

    // 5. ختم الاعتماد في نهاية كراسة الإجابة
    expect(items[items.length - 1].kind).toBe("accreditation_footer");
  });

  it("Answer Key Only (answer_key_only) renders ONLY the answers section without question flow", () => {
    const { items } = buildFlowItems({
      questions: SAMPLE_QUESTIONS,
      columnsCount: 2,
      includeAnswerKey: true,
      answerVisibilityMode: "answer_key_only",
      paperTemplateId: "classic_sovereign",
    });

    // لا توجد أسئلة عادية في البداية
    const rawQuestions = items.filter((i) => i.kind === "question" && !i.isAnswerCard);
    expect(rawQuestions.length).toBe(0);

    // البداية مباشرة بشريط كراسة الإجابة
    expect(items[0].kind).toBe("answer_section_banner");
    expect(items.some((i) => i.kind === "mcq_answer_key")).toBe(true);

    const answerCards = items.filter((i) => i.kind === "question" && i.isAnswerCard);
    expect(answerCards.length).toBe(2);
  });
});
