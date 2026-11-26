import { describe, expect, it } from "vitest";
import type { CurriculumUnitNode } from "../ssot/curriculum-hierarchy-ssot";
import { buildExamFormsNotebookLMPrompt } from "./exam-forms-notebooklm-prompt-builder";
import { buildSmartGeometryPromptGuidance } from "./smart-geometry-prompt-director";
import { parseNotebookLMExamForms } from "../ingestion/notebooklm-exam-forms-parser";
import { resolveDocAutoFitDefaults } from "../pdf-layout-engine/pdf-doc-autofit-defaults-resolver";
import { buildFlowItems } from "../pdf-layout-engine/flow-items-builder";
import { packFlowItemsIntoPages } from "../pdf-layout-engine/flow-page-packer";
import type { PrintableMathQuestionItem } from "../pdf-layout-engine/a4-vector-html-sheet-renderer";
import { DEFAULT_PDF_PRINT_SETTINGS_SSOT } from "../ssot/pdf-print-settings-ssot";

const SAMPLE_UNITS: readonly CurriculumUnitNode[] = [
  {
    id: "u1",
    gradeId: "prep-3",
    termNumber: 1,
    branchId: "plane_geometry",
    orderIndex: 1,
    titleArabic: "الدائرة وتعاريفها",
    lessons: [
      { id: "l1", unitId: "u1", orderIndex: 1, titleArabic: "تعاريف ومفاهيم أساسية على الدائرة", coreConcepts: ["نصف القطر", "محور التماثل"] },
      { id: "l2", unitId: "u1", orderIndex: 2, titleArabic: "موضع نقطة ومستقيم بالنسبة لدائرة", coreConcepts: ["بعد المستقيم عن المركز"] },
      { id: "l3", unitId: "u1", orderIndex: 3, titleArabic: "تعيين الدائرة", coreConcepts: ["عدد الدوائر المارة بنقطتين"] },
      { id: "l4", unitId: "u1", orderIndex: 4, titleArabic: "علاقة أوتار الدائرة بمركزها", coreConcepts: ["الأوتار المتساوية على أبعاد متساوية"] },
      { id: "l5", unitId: "u1", orderIndex: 5, titleArabic: "الزاوية المركزية وقياس الأقواس", coreConcepts: ["الزاوية المركزية", "طول القوس"] },
    ],
  },
];

describe("Exam Forms 5-Point Verification Suite", () => {
  it("1. distributes MCQ + Essay demographically across selected lessons and never fakes 1 lesson from generic scope text", () => {
    const prompt5 = buildExamFormsNotebookLMPrompt({
      gradeId: "prep-3",
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "plane_geometry",
      scopeKind: "monthly_exam",
      scopeDescriptionArabic: "الوحدة الأولى كاملة",
      units: SAMPLE_UNITS,
      selectedUnitIds: ["u1"],
      selectedLessonIds: ["l1", "l2", "l3", "l4", "l5"],
      formsCount: 3,
      mcqQuestionsCount: 9,
      essayAndProofQuestionsCount: 8,
      totalMarksPerForm: 33,
      durationTextArabic: "ساعة ونصف",
      difficultyProfile: "standard_balanced",
      progressionMode: "uniform_equivalent",
    });

    expect(prompt5).toContain("التوزيع الديموجرافي الإلزامي للدروس (5 دروس");
    expect(prompt5).toContain("يُوزّع الاختر والمقالي معاً بعدالة بين الدروس");
    expect(prompt5).toContain("«تعاريف ومفاهيم أساسية على الدائرة»");
    expect(prompt5).toContain("«الزاوية المركزية وقياس الأقواس»");

    // Generic scope without loaded curriculum units must NOT treat "كامل وحدات ودروس المنهج" as 1 lesson!
    const genericPrompt = buildExamFormsNotebookLMPrompt({
      gradeId: "prep-3",
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "plane_geometry",
      scopeKind: "end_of_term",
      scopeDescriptionArabic: "كامل وحدات ودروس المنهج المقرر",
      formsCount: 3,
      mcqQuestionsCount: 9,
      essayAndProofQuestionsCount: 8,
      totalMarksPerForm: 33,
      durationTextArabic: "ساعة ونصف",
      difficultyProfile: "standard_balanced",
    });
    expect(genericPrompt).not.toContain("1 دروس");
    expect(genericPrompt).toContain("احصر جميع دروس النطاق المحدد من الكتب المرفوعة، ووزّع أسئلة (اختر) و(المقالي) بالتساوي العادل");
    expect(genericPrompt).not.toContain("| الفكرة:");
  });

  it("2. supports uniform vs progressive difficulty anchored to selected ceiling & single-form [FORM: 1] parsing", () => {
    const balancedProgressive = buildExamFormsNotebookLMPrompt({
      gradeId: "prep-3",
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "plane_geometry",
      scopeKind: "monthly_exam",
      scopeDescriptionArabic: "الوحدة الأولى",
      formsCount: 3,
      mcqQuestionsCount: 9,
      essayAndProofQuestionsCount: 8,
      totalMarksPerForm: 33,
      durationTextArabic: "ساعة ونصف",
      difficultyProfile: "standard_balanced",
      progressionMode: "progressive_escalating",
    });

    expect(balancedProgressive).toContain("سياسة الصعوبة المتدرجة تصاعدياً عبر النماذج");
    expect(balancedProgressive).toContain("النموذج (أ): تأسيسي مباشر");
    expect(balancedProgressive).toContain("النموذج (جـ): متوازن وزاري رسمي");
    expect(balancedProgressive).not.toContain("٦٥٪ برهان وتفكير ابتكاري");

    const singleFormReply = `
=== [FORM: 1] | النموذج: (أ) ===
=== [QUESTION: 1] | النموذج: [أ] | النوع: [MCQ] | الدرس: [تعاريف الدائرة] | الدرجة: [1] ===
النص: عدد محاور تماثل الدائرة هو:
الرسم: فارغ
البدائل: (أ) 1 | (ب) 2 | (جـ) 4 | (د) عدد لا نهائي
الإجابة_الصحيحة: (د) عدد لا نهائي
البرهان_والخطوات: أي مستقيم يمر بمركز الدائرة هو محور تماثل لها.
`;
    const parsedOne = parseNotebookLMExamForms({
      rawText: singleFormReply,
      branchId: "plane_geometry",
      unitId: "u1",
      lessonId: "l1",
      lessonTitleArabic: "تعاريف الدائرة",
      expectedFormsCount: 1,
      gradeId: "prep-3",
      notationLanguage: "english",
      numeralMode: "western",
    });
    expect(parsedOne.length).toBe(1);
    expect(parsedOne[0].questions.length).toBe(1);
    expect(parsedOne[0].questions[0].lessonTitleArabic).toBe("تعاريف الدائرة");
    expect(parsedOne[0].questions[0].figureDiagnosticsAr).toBeUndefined();
    expect(parsedOne[0].questions[0].attachedGeometryFigure).toBeUndefined();
  });

  it("3. preserves Geometry [رسم هندسي: ...] alongside Statistics/Functions in mixed & end-of-term prompts", () => {
    const mixedGuidance = buildSmartGeometryPromptGuidance({
      branchId: "algebra",
      gradeId: "prep-2",
      notationLanguage: "english",
      lessonTitleArabic: "اختبار نهاية الترم: الوحدة 1 (الدوال) + الوحدة 2 (المثلثات والهندسة) + الوحدة 3 (الإحصاء)",
    });

    expect(mixedGuidance).toContain("[رسم هندسي: ...]");
    expect(mixedGuidance).toContain("[رسم إحصائي:");
    expect(mixedGuidance).toContain("[رسم بياني:");
  });

  it("4. enforces official_school_exam + targetMaxPages=2 on Exam Forms and packs 9 MCQ + 8 Essay in 2 pages", () => {
    const defaults = resolveDocAutoFitDefaults("مراجعة تدريبية — الصف الثالث الإعدادي — النموذج (أ)", undefined, [
      { formId: "form-1", formIndex: 0, formLetterAr: "أ", formTitleAr: "النموذج (أ)", fullDocumentTitleAr: "مراجعة — النموذج (أ)", questions: [] },
    ]);
    expect(defaults.isExamDoc).toBe(true);
    expect(defaults.isBookletOrReview).toBe(false);

    const mcqs: PrintableMathQuestionItem[] = Array.from({ length: 9 }, (_, i) => ({
      id: `q-form-1-${i + 1}`,
      questionNumber: i + 1,
      kind: "mcq",
      branchBadgeAr: "الهندسة",
      marks: 1,
      promptAr: `اختر الإجابة الصحيحة في المسألة رقم ${i + 1}: قياس الزاوية المركزية المقابلة لقوس يمثل ربع الدائرة يساوي:`,
      mcqChoicesAr: ["45°", "90°", "180°", "120°"],
      correctMcqIndex: 1,
      modelAnswerAr: "90°",
      answerLinesCount: 0,
    }));
    const essays: PrintableMathQuestionItem[] = Array.from({ length: 8 }, (_, i) => ({
      id: `q-form-1-${10 + i}`,
      questionNumber: 10 + i,
      kind: "essay_geometry",
      branchBadgeAr: "الهندسة",
      marks: 3,
      promptAr: `في الشكل المقابل رقم ${i + 1}: أثبت أن المثلث متساوي الساقين وأوجد قياس الزاوية المطلوبة.`,
      modelAnswerAr: "البرهان المطلوب",
      answerLinesCount: 2,
    }));

    const { items } = buildFlowItems({
      questions: [...mcqs, ...essays],
      columnsCount: 1,
      includeAnswerKey: false,
      includeAccreditation: false,
      paperTemplateId: "official_school_exam",
      answerVisibilityMode: "questions_only",
    });

    const heights = new Map<string, number>();
    items.forEach((it) => {
      if (it.kind === "exam_section_banner") heights.set(it.id, 34);
      else if (it.kind === "exam_wish_banner") heights.set(it.id, 28);
      else if (it.kind === "question") {
        heights.set(it.id, it.question.kind === "mcq" ? 54 : 112);
      }
    });

    const pages = packFlowItemsIntoPages(items, heights, {
      budgets: { firstPagePx: 925, nextPagePx: 1030 },
      density: { gapMinPx: 1, gapMaxPx: 3, maxStretchPerItemPx: 0, maxStretchRatio: 0 },
    });

    expect(pages.length).toBeLessThanOrEqual(2);
    expect(DEFAULT_PDF_PRINT_SETTINGS_SSOT.exactFontSizePt).toBeGreaterThanOrEqual(12);
  });

  it("5. wires geometry figure extraction into Exam Forms with lesson-level diagram support in mixed branches", () => {
    const geoFormReply = `
=== [FORM: 1] | النموذج: (أ) ===
=== [QUESTION: 1] | النوع: [PROOF] | الدرس: [توازي وتقاطع المستقيمات] | الدرجة: [3] ===
النص: في الشكل المقابل، أربعة أشعة تخرج من النقطة $M$. إذا كان $MA \\perp MD$، وكان $m(\\angle BMC) = 100^\\circ$ و $m(\\angle AMB) = 130^\\circ$، فأوجد بالبرهان $m(\\angle CMD)$.
الرسم: [رسم هندسي: أربعة أشعة MA و MB و MC و MD تخرج من النقطة M حيث MA عمودي على MD وقياس زاوية AMB يساوي 130 درجة وقياس زاوية BMC يساوي 100 درجة]
الإجابة_الصحيحة: $40^\\circ$
البرهان_والخطوات: مجموع قياسات الزوايا المتجمعة حول نقطة = 360° | إذن قياس زاوية CMD = 40°
`;
    const parsed = parseNotebookLMExamForms({
      rawText: geoFormReply,
      branchId: "algebra",
      unitId: "u-mix",
      lessonId: "l-mix",
      lessonTitleArabic: "اختبار مجمع",
      expectedFormsCount: 1,
      gradeId: "prep-1",
      notationLanguage: "english",
      numeralMode: "western",
    });

    expect(parsed.length).toBe(1);
    const q = parsed[0].questions[0];
    expect(q.lessonTitleArabic).toBe("توازي وتقاطع المستقيمات");
    expect(q.attachedGeometryFigure).toBeDefined();
    expect(q.attachedGeometryFigure!.vertices.length).toBeGreaterThanOrEqual(4);
  });
});
