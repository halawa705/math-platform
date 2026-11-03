import { describe, expect, it } from "vitest";
import {
  DEFAULT_PDF_PRINT_SETTINGS_SSOT,
  loadPersistedPDFPrintSettingsSSOT,
} from "../ssot/pdf-print-settings-ssot";
import { buildFlowItems } from "./flow-items-builder";
import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";

const SAMPLE_QUESTIONS: readonly PrintableMathQuestionItem[] = [
  {
    id: "q-exam-1",
    questionNumber: 1,
    kind: "mcq",
    branchBadgeAr: "الجبر",
    marks: 1,
    promptAr: "في عملية القسمة 12 ÷ 4 = 3 ، فإن المقسوم هو:",
    mcqChoicesAr: ["3", "12", "4", "16"],
    correctMcqIndex: 1,
    modelAnswerAr: "المقسوم هو 12",
  },
  {
    id: "q-exam-2",
    questionNumber: 2,
    kind: "mcq",
    branchBadgeAr: "الأعداد",
    marks: 1,
    promptAr: "ناتج جمع 5275 + 2438 = ...",
    mcqChoicesAr: ["7613", "7703", "7713", "8713"],
    correctMcqIndex: 2,
    modelAnswerAr: "الناتج 7713",
  },
  {
    id: "q-exam-3",
    questionNumber: 3,
    kind: "essay_algebra",
    branchBadgeAr: "الأعداد",
    marks: 2,
    promptAr: "وزعت ندى 15 كجم من السكر على 5 أكياس بالتساوي. كم كيلوجراماً في كل كيس؟",
    modelAnswerAr: "15 ÷ 5 = 3 كجم",
  },
];

describe("Official School Exam Template & Flow Items Builder", () => {
  it("defaults to classic_sovereign in settings without changing existing behavior", () => {
    expect(DEFAULT_PDF_PRINT_SETTINGS_SSOT.paperTemplateId).toBe("classic_sovereign");
    const loaded = loadPersistedPDFPrintSettingsSSOT();
    expect(["classic_sovereign", "official_school_exam"]).toContain(loaded.paperTemplateId);
  });

  it("builds standard idea groups in classic_sovereign mode", () => {
    const { items } = buildFlowItems({
      questions: SAMPLE_QUESTIONS,
      columnsCount: 1,
      includeAnswerKey: false,
      includeAccreditation: true,
      paperTemplateId: "classic_sovereign",
    });

    // In classic sovereign, no exam_section_banner or exam_wish_banner
    expect(items.some((it) => it.kind === "exam_section_banner")).toBe(false);
    expect(items.some((it) => it.kind === "exam_wish_banner")).toBe(false);
    expect(items.some((it) => it.kind === "accreditation_footer")).toBe(true);

    const { items: col2Items } = buildFlowItems({
      questions: SAMPLE_QUESTIONS,
      columnsCount: 2,
      includeAnswerKey: false,
      includeAccreditation: true,
      paperTemplateId: "classic_sovereign",
    });
    const col2Q = col2Items.find((it) => it.kind === "question");
    expect(col2Q?.span).toBe("column");
  });

  it("builds official school exam sections and local question numbers in official_school_exam mode, strictly full width (span=full)", () => {
    // Even if columnsCount is 2, official_school_exam forces span: "full" for every question!
    const { items, totalIdeasCount } = buildFlowItems({
      questions: SAMPLE_QUESTIONS,
      columnsCount: 2,
      includeAnswerKey: false,
      paperTemplateId: "official_school_exam",
    });

    expect(totalIdeasCount).toBe(2);

    // Section 1: MCQ banner
    const sec1 = items[0];
    expect(sec1.kind).toBe("exam_section_banner");
    if (sec1.kind === "exam_section_banner") {
      expect(sec1.sectionOrdinalArabic).toBe("الأول");
      expect(sec1.sectionTitleArabic).toContain("اختر الإجابة الصحيحة");
      expect(sec1.questionsCount).toBe(2);
    }

    // Question 1 & 2 in MCQ section with sectionLocalNumber 1 and 2, AND span === "full"
    const q1 = items[1];
    expect(q1.kind).toBe("question");
    if (q1.kind === "question") {
      expect(q1.span).toBe("full");
      expect(q1.sectionLocalNumber).toBe(1);
      expect(q1.question.promptAr).toContain("المقسوم هو");
    }

    const q2 = items[2];
    expect(q2.kind).toBe("question");
    if (q2.kind === "question") {
      expect(q2.span).toBe("full");
      expect(q2.sectionLocalNumber).toBe(2);
    }

    // Section 2: Essay banner
    const sec2 = items[3];
    expect(sec2.kind).toBe("exam_section_banner");
    if (sec2.kind === "exam_section_banner") {
      expect(sec2.sectionOrdinalArabic).toBe("الثاني");
      expect(sec2.sectionTitleArabic).toContain("أجب عن الأسئلة الآتية");
      expect(sec2.questionsCount).toBe(1);
    }

    // Question 3 (first essay question) with sectionLocalNumber 1, AND span === "full"
    const q3 = items[4];
    expect(q3.kind).toBe("question");
    if (q3.kind === "question") {
      expect(q3.span).toBe("full");
      expect(q3.sectionLocalNumber).toBe(1);
      expect(q3.question.promptAr).toContain("وزعت ندى");
    }

    // Last item is the wish banner
    const wish = items[items.length - 1];
    expect(wish.kind).toBe("exam_wish_banner");
  });
});
