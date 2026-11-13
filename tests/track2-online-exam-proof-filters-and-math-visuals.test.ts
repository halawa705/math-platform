import { describe, it, expect } from "vitest";
import { detectAndBuildMathElementaryVisualFigure } from "@/core/geometry-engine/elementary-visuals/math-elementary-visuals-dispatcher";
import { splitExamIntoPublicAndKey } from "@/core/exam-grading/online-exam-public-key-splitter";
import { gradeOnlineExam } from "@/core/exam-grading/online-exam-grader";
import { applyManualGradesAndWipePhotos } from "@/core/exam-grading/manual-essay-grading-and-wipe";
import {
  computeScaledPhotoDimensions,
  rotateAngleQuarterTurn,
} from "@/features/student-learning-portal/exam-session/student-proof-photo-compressor";
import {
  computePostExamReviewCounts,
  doesQuestionMatchReviewFilter,
} from "@/features/student-learning-portal/exam-session/post-exam-review-filter-bar";
import type { QuestionAssessmentIR } from "@/core/ir/question-assessment-ir";

describe("Track 2: Math Platform — Proof Photo, Review Filters & Math-Only Elementary Visuals", () => {
  it("1. يرسم جميع النماذج البصرية الرياضية الـ 8 (الساعة، فن، شجرة العوامل، النموذج الشريطي، المصفوفة، القيمة المكانية، شبكة العشري، خط المنتصف) بأرقام SSOT ويمنع الخرائط الجغرافية", () => {
    const cases: Array<[string, string]> = [
      ["ساعة حائط دائرية يشير فيها عقرب الساعات إلى ما بين 3 و 4 وعقرب الدقائق يشير إلى 9", "analog_clock"],
      ["مخطط فن للعوامل الأولية للعددين 12 و 18", "venn_prime"],
      ["شجرة العوامل الأولية للعددين 24 و 36", "factor_tree"],
      ["نموذج شريطي يمثل الكل = 100 والجزء الأول = 35 والجزء الثاني = ؟", "tape_model"],
      ["مصفوفة نقاط 6 × 7 مقسمة إلى 2 + 5", "dot_array"],
      ["جدول القيمة المكانية للعدد 5423.72", "place_value"],
      ["شبكة المائة العشرية لتمثيل 0.35", "decimal_grid"],
      ["استراتيجية نقطة المنتصف لتقريب العدد 37 بين 30 و 40", "midpoint"],
    ];

    for (const [prompt, tag] of cases) {
      const fig = detectAndBuildMathElementaryVisualFigure(prompt, `fig_${tag}`, "arabic", "eastern");
      expect(fig, `Missing visual for ${tag}`).toBeDefined();
      expect(fig?.rawSvgMarkup).toContain("<svg");
      expect(fig?.familyId).toBe("primary_visual_models_family");
    }

    // 100% Mathematics only — block social studies / geography maps strictly
    const geoMapAttempt = detectAndBuildMathElementaryVisualFigure("خريطة قارة أفريقيا والأنهار", "map_blocked");
    expect(geoMapAttempt).toBeUndefined();
  });

  it("2. يضغط ويدور صور الحل بدون تشويه الأبعاد وبحد أقصى 1400px", () => {
    expect(computeScaledPhotoDimensions(4000, 2000)).toEqual({ width: 1400, height: 700 });
    expect(computeScaledPhotoDimensions(800, 600)).toEqual({ width: 800, height: 600 });
    expect(rotateAngleQuarterTurn(0)).toBe(90);
    expect(rotateAngleQuarterTurn(270)).toBe(0);
  });

  it("3. يدعم أسئلة البرهان بالصورة + التصحيح اليدوي مع الحذف الفوري للصورة بعد حفظ المعلم + حفظ imageUrl البديل", () => {
    const essayQ: QuestionAssessmentIR = {
      questionId: "q_proof_1",
      displayOrderNumber: 1,
      branchId: "plane_geometry",
      unitId: "u1",
      lessonId: "l1",
      lessonTitleArabic: "التشابه",
      patternKind: "proof_reasoning",
      cognitiveDepth: "deductive_proof",
      allocatedMarks: 5,
      estimatedSolveMinutes: 5,
      promptArabic: "أثبت أن المثلثين متشابهان.",
      modelSolutionStepsArabic: ["الخطوة 1"],
      finalCanonicalAnswerArabic: "بما أن الزاويتين متساويتان إذن المثلثان متشابهان",
      allowPhotoUpload: true,
      imageUrl: "https://example.com/fallback-diagram.png",
    };

    const mcqQ: QuestionAssessmentIR = {
      questionId: "q_mcq_1",
      displayOrderNumber: 2,
      branchId: "algebra",
      unitId: "u2",
      lessonId: "l2",
      lessonTitleArabic: "المعادلات",
      patternKind: "mcq",
      cognitiveDepth: "direct_application",
      allocatedMarks: 5,
      estimatedSolveMinutes: 1,
      promptArabic: "إذا كان س + 2 = 5 فإن س =",
      mcqChoicesArabic: ["1", "2", "3", "4"],
      correctMcqChoiceIndex: 2,
      modelSolutionStepsArabic: ["س = 5 - 2 = 3"],
      finalCanonicalAnswerArabic: "3",
    };

    const split = splitExamIntoPublicAndKey([essayQ, mcqQ]);
    expect(split.publicQuestions).toHaveLength(2);
    expect(split.publicQuestions[0].answerMode).toBe("essay_photo");
    expect(split.publicQuestions[0].imageUrl).toBe("https://example.com/fallback-diagram.png");

    const studentAnswers = {
      q_proof_1: { proofImageDataUrl: "data:image/jpeg;base64,FAKE_LARGE_PAYLOAD_HERE", proofImageRotationDeg: 90, text: "الإثبات مرفق" },
      q_mcq_1: { choiceIndex: 2 },
    };

    const autoResult = gradeOnlineExam(split.answerKey, studentAnswers);
    expect(autoResult.percentage).toBe(50);
    expect(autoResult.items[0].pendingTeacherReview).toBe(true);
    expect(autoResult.items[1].isCorrect).toBe(true);

    // تحقق فلاتر المراجعة بعد التسليم
    const counts = computePostExamReviewCounts(split.publicQuestions, autoResult.items);
    expect(counts).toEqual({ all: 2, correct: 1, wrong: 0, pending: 1 });
    expect(doesQuestionMatchReviewFilter(autoResult.items[0], "pending")).toBe(true);
    expect(doesQuestionMatchReviewFilter(autoResult.items[1], "correct")).toBe(true);

    // التصحيح اليدوي من المعلم -> تحديث الدرجة إلى 90% + مسح صورة الحل فوراً
    const manualWiped = applyManualGradesAndWipePhotos({
      answersJson: studentAnswers,
      resultJson: autoResult,
      gradesByQuestionId: {
        q_proof_1: { earnedMarks: 4, teacherFeedback: "برهان ممتاز ينقصه ذكر سبب التطابق فقط" },
      },
    });

    expect(manualWiped.wipedImagesCount).toBe(1);
    expect(manualWiped.updatedAnswersJson.q_proof_1?.proofImageDataUrl).toBeUndefined();
    expect(manualWiped.updatedAnswersJson.q_proof_1?.proofImageDeletedAfterGrading).toBe(true);
    expect(manualWiped.updatedResultJson.totalEarnedMarks).toBe(9);
    expect(manualWiped.updatedResultJson.percentage).toBe(90);
    expect(manualWiped.updatedResultJson.items[0].pendingTeacherReview).toBe(false);
    expect(manualWiped.updatedResultJson.items[0].isCorrect).toBe(true);
  });
});
