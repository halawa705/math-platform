import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { OfficialSchoolFirstPageHeader } from "../src/core/pdf-layout-engine/official-school-exam-page-chrome";
import {
  OfficialSchoolCornerCropMarks,
  OfficialSchoolEndWishBanner,
  OfficialSchoolPageFooterBar,
} from "../src/core/pdf-layout-engine/official-school-exam-frame-and-footer";
import { PedagogicalIdeaAndRuleCapsule } from "../src/core/pdf-layout-engine/a4-pedagogical-capsule-and-key-table";
import { QuestionCardBadgeHeader } from "../src/core/pdf-layout-engine/question-card-badge-header";
import { StructuredStepByStepSolutionBox } from "../src/core/pdf-layout-engine/structured-step-by-step-solution-box";
import { OfficialMcqAnswerKeySummaryTable } from "../src/core/pdf-layout-engine/official-mcq-answer-key-summary-table";
import { CompactTextbookMcqRow } from "../src/core/pdf-layout-engine/compact-textbook-mcq-row";
import {
  resolvePrintThemePalette,
  type PrintableMathQuestionItem,
} from "../src/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import { DEFAULT_OWNER_TEACHER_IDENTITY_SSOT } from "../src/core/ssot/teacher-identity-ssot";
import { DEFAULT_PDF_PRINT_SETTINGS_SSOT } from "../src/core/ssot/pdf-print-settings-ssot";

const EMOJI_PATTERN = /[\u{1F300}-\u{1FAFF}\u2600-\u27BF\u270D\u26A1\u2B50\u2705\u26A0\u274C\u2714\u2716]/u;

describe("PDF Size Optimization #1 & #4 (Lightweight SVG Chrome & Vector Icons)", () => {
  const palette = resolvePrintThemePalette("math_teal");

  it("renders OfficialSchoolCornerCropMarks with a single SVG dashed <rect> instead of CSS border:dashed tessellation", () => {
    const html = renderToStaticMarkup(
      React.createElement(OfficialSchoolCornerCropMarks, {
        primaryHex: palette.primaryHex,
        accentHex: palette.accentHex,
      })
    );

    expect(html).toContain("<svg");
    expect(html).toContain("<rect");
    expect(html).toContain('stroke-dasharray="5 3.5"');
    expect(html).not.toContain("dashed");
  });

  it("renders lightweight inline SVG icons instead of bitmap/Type3 emojis across printable PDF cards & chrome", () => {
    const sampleQuestion: PrintableMathQuestionItem = {
      id: "q-sample-1",
      questionNumber: 1,
      kind: "mcq",
      branchBadgeAr: "الهندسة",
      marks: 2,
      promptAr: "نقطة تقاطع متوسطات المثلث تقسم كل منها بنسبة ..... من جهة القاعدة.",
      mcqChoicesAr: ["$1 : 2$", "$2 : 1$", "$1 : 3$", "$3 : 1$"],
      correctMcqIndex: 0,
      modelAnswerAr: "$1 : 2$",
      solutionStepsAr: ["بما أن نقطة التقاطع تقسم المتوسط بنسبة $1:2$ من القاعدة."],
      citationBadgeAr: "الدقهلية ٢٠٢٤",
      ideaBannerTitleAr: "الفكرة الأولى: خواص نقطة تقاطع المتوسطات",
      conceptExplanationAr: "تتلاقى المتوسطات في نقطة واحدة داخل المثلث.",
      framedRuleAr: "نسبة التقسيم من القاعدة تساوي $1:2$.",
      studentDrillPromptAr: "أوجد طول الجزء الأكبر إذا كان طول المتوسط $9$ سم.",
      isWorkedExample: true,
    };

    const nonExampleMcq: PrintableMathQuestionItem = {
      ...sampleQuestion,
      id: "q-mcq-1",
      isWorkedExample: false,
    };

    const fragments = [
      renderToStaticMarkup(
        React.createElement(OfficialSchoolFirstPageHeader, {
          identity: {
            ...DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
            teacherPhone: "01000000000",
          },
          documentTitle: "مذكرة الهندسة",
          subtitleAr: "الصف الثاني الإعدادي",
          palette,
        })
      ),
      renderToStaticMarkup(
        React.createElement(OfficialSchoolPageFooterBar, {
          identity: {
            ...DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
            teacherPhone: "01000000000",
          },
          pageNumber: 1,
          totalPages: 5,
          palette,
        })
      ),
      renderToStaticMarkup(React.createElement(OfficialSchoolEndWishBanner, { palette })),
      renderToStaticMarkup(
        React.createElement(PedagogicalIdeaAndRuleCapsule, {
          item: sampleQuestion,
          palette,
          numeralMode: "eastern",
          notationLanguage: "arabic_ar",
          ideaIndex: 1,
        })
      ),
      renderToStaticMarkup(
        React.createElement(PedagogicalIdeaAndRuleCapsule, {
          item: { ...sampleQuestion, ideaBannerTitleAr: "ورقة عمل: مراجعة شاملة" },
          palette,
          numeralMode: "eastern",
          notationLanguage: "arabic_ar",
        })
      ),
      renderToStaticMarkup(
        React.createElement(PedagogicalIdeaAndRuleCapsule, {
          item: { ...sampleQuestion, ideaBannerTitleAr: "تمارين الواجب المنزلي على الدرس" },
          palette,
          numeralMode: "eastern",
          notationLanguage: "arabic_ar",
        })
      ),
      renderToStaticMarkup(
        React.createElement(QuestionCardBadgeHeader, {
          isBookletSolvedExample: true,
          isBookletDrill: false,
          formattedQNum: "١",
          exampleRoleLabel: "محلول",
          badgeBgColorHex: palette.primaryHex,
          cardBorderColorHex: palette.borderHex,
          palette,
          citationBadgeAr: "الدقهلية ٢٠٢٤",
        })
      ),
      renderToStaticMarkup(
        React.createElement(QuestionCardBadgeHeader, {
          isBookletSolvedExample: false,
          isBookletDrill: true,
          formattedQNum: "٢",
          exampleRoleLabel: "حاول بنفسك",
          badgeBgColorHex: palette.primaryHex,
          cardBorderColorHex: palette.borderHex,
          palette,
        })
      ),
      renderToStaticMarkup(
        React.createElement(StructuredStepByStepSolutionBox, {
          item: sampleQuestion,
          palette,
          numeralMode: "eastern",
          notationLanguage: "arabic_ar",
        })
      ),
      renderToStaticMarkup(
        React.createElement(OfficialMcqAnswerKeySummaryTable, {
          questions: [nonExampleMcq],
          palette,
          numeralMode: "eastern",
          notationLanguage: "arabic_ar",
        })
      ),
      renderToStaticMarkup(
        React.createElement(CompactTextbookMcqRow, {
          question: nonExampleMcq,
          settings: DEFAULT_PDF_PRINT_SETTINGS_SSOT,
          palette,
        })
      ),
    ];

    for (const html of fragments) {
      expect(html).toContain("<svg");
      expect(EMOJI_PATTERN.test(html)).toBe(false);
    }
  });
});
