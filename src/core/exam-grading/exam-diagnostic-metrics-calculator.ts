/**
 * @file exam-diagnostic-metrics-calculator.ts
 * @description محرك الحسابات التشخيصية والسيكومترية لنقاط القوة والضعف في اختبارات الرياضيات:
 * - تحليل الإتقان حسب الفروع الـ١١ (`MATH_BRANCHES_SSOT`) والدروس.
 * - معامل الصعوبة (Difficulty Index) ومعامل التمييز (Kelley 27% Discrimination Index) لكشف الأسئلة الغامضة.
 * - تحليل المشتتات، تقسيم الطلاب لأربع شرائح دعم، وخطة توصيات علاجية للمعلم والطالب.
 * @invariant ملف نقي مستقل بدون أي استيراد للمتصفح (< 245 سطراً).
 */

import { MATH_BRANCHES_SSOT, type MathBranchId } from "@/core/ssot/math-branches-ssot";
import type { PublishedOnlineExam, PublishedExamQuestionItem } from "@/features/electronic-exams-hub/published-online-exams-store";
import type { OnlineExamSubmissionRecord } from "@/features/teacher-home-dashboard/grade-honor-roll-ssot";

export const MODULE_ID_EXAM_DIAGNOSTIC_METRICS_CALCULATOR = "exam_diagnostic_metrics_calculator" as const;
const CHOICE_LETTERS = ["أ", "ب", "جـ", "د"] as const;

export interface BranchMasteryStat {
  readonly branchId: MathBranchId;
  readonly branchNameAr: string;
  readonly symbolBadge: string;
  readonly questionsCount: number;
  readonly totalAttempts: number;
  readonly masteryPct: number;
  readonly tone: "strong" | "moderate" | "weak";
}

export interface DistractorBreakdownItem {
  readonly choiceLetterAr: string;
  readonly count: number;
  readonly shareOfErrorsPct: number;
}

export interface PsychometricQuestionDiagnostic {
  readonly examId: string;
  readonly questionId: string;
  readonly displayOrderNumber: number;
  readonly promptSnippetAr: string;
  readonly lessonTitleAr: string;
  readonly branchId: MathBranchId;
  readonly branchNameAr: string;
  readonly totalAttempts: number;
  readonly masteryPct: number;
  readonly errorPct: number;
  readonly difficultyIndex: number;
  readonly difficultyLabelAr: string;
  readonly discriminationIndex: number | null;
  readonly qualityFlagAr: string;
  readonly isFlaggedAmbiguous: boolean;
  readonly distractorBreakdown: readonly DistractorBreakdownItem[];
}

export interface AtRiskStudentSummary {
  readonly studentCode: string;
  readonly studentNameAr: string;
  readonly averagePct: number;
  readonly weakestLessonAr: string;
  readonly isSibling: boolean;
}

export interface StudentMasteryTierBreakdown {
  readonly excellentCount: number;
  readonly goodCount: number;
  readonly needsSupportCount: number;
  readonly urgentInterventionCount: number;
  readonly totalUniqueStudents: number;
  readonly atRiskStudents: readonly AtRiskStudentSummary[];
}

export interface RemediationRecommendationItem {
  readonly priority: "high" | "medium" | "positive";
  readonly titleAr: string;
  readonly actionAr: string;
}

export interface ProfessionalDiagnosticMetrics {
  readonly branchStats: readonly BranchMasteryStat[];
  readonly psychometricQuestions: readonly PsychometricQuestionDiagnostic[];
  readonly studentTiers: StudentMasteryTierBreakdown;
  readonly remediationPlan: readonly RemediationRecommendationItem[];
}

export function inferMathBranchIdForQuestion(q: PublishedExamQuestionItem, examTitleAr: string): MathBranchId {
  const hay = `${q.lessonTitleArabic || ""} ${q.promptArabic || ""} ${examTitleAr}`;
  if (/(تفاضل|تكامل|نهايات|المشتقة|اشتقاق|عظمى وصغرى)/.test(hay)) return "calculus";
  if (/(استاتيكا|اتزان القوى|العزوم|احتكاك|محصلة القوى)/.test(hay)) return "statics";
  if (/(ديناميكا|العجلة|نيوتن|الدفع والتصادم|كمية الحركة)/.test(hay)) return "dynamics";
  if (/(حساب المثلثات|نسب مثلثية|(\s|^)(جا|جتا|ظا|قتا|قا|ظتا)(\s|$|[٠-٩0-9θ])|\b(sin|cos|tan)\b)/i.test(hay)) {
    return "trigonometry";
  }
  if (/(هرم|مخروط|أسطوانة|منشور|مكعب|متوازي مستطيلات|مجسم|فراغية|حجم المجسم)/.test(hay)) return "solid_geometry";
  if (/(إحداثي|ميل المستقيم|ميل الخط|بعد بين نقطتين|منتصف قطعة|خط مستقيم|شبكة|انعكاس|انتقال|دوران)/.test(hay)) return "analytic_geometry";
  if (/(دالة خطية|دالة تربيعية|الدوال|منحنى الدالة|مجال الدالة)/.test(hay)) return "functions";
  if (/(إحصاء|احتمال|منوال|وسيط|متوسط حسابي|وسط حسابي|تكرار|مدرج|أعمدة|قطاع|تشتت)/.test(hay)) return "statistics_probability";
  if (/(مثلث|مثلثات|دائرة|وتر|مماس|زاوية|متوازي أضلاع|معين|مستطيل|مربع|برهان|هندسة|تطابق|تشابه|فيثاغورس)/.test(hay)) return "plane_geometry";
  if (/(كسر|أعداد|عشري|نسبة|تناسب|مئوية|أولي|مضاعف|قاسم)/.test(hay)) return "numbers";
  return "algebra";
}

function computeKelleyDiscrimination(
  examSubs: readonly OnlineExamSubmissionRecord[],
  questionId: string
): number | null {
  if (examSubs.length < 4) return null;
  const sorted = [...examSubs].sort((a, b) => b.percentageScore - a.percentageScore);
  const groupN = Math.max(1, Math.round(sorted.length * 0.27));
  const rateInGroup = (group: readonly OnlineExamSubmissionRecord[]) => {
    let hit = 0;
    let total = 0;
    for (const s of group) {
      const it = s.resultJson?.items.find((i) => i.questionId === questionId);
      if (!it) continue;
      total += 1;
      if (it.isCorrect) hit += 1;
    }
    return total > 0 ? hit / total : 0;
  };
  return Number((rateInGroup(sorted.slice(0, groupN)) - rateInGroup(sorted.slice(-groupN))).toFixed(2));
}

export function computeProfessionalExamDiagnostics(params: {
  readonly exams: readonly PublishedOnlineExam[];
  readonly submissions: readonly OnlineExamSubmissionRecord[];
  readonly siblingCodes?: ReadonlySet<string>;
}): ProfessionalDiagnosticMetrics {
  const { exams, submissions, siblingCodes = new Set<string>() } = params;
  const psychometricQuestions: PsychometricQuestionDiagnostic[] = [];
  const branchAgg = new Map<MathBranchId, { qIds: Set<string>; correct: number; total: number }>();

  for (const exam of exams) {
    const eSubs = submissions.filter((s) => s.examId === exam.examId && s.resultJson?.items);
    if (eSubs.length === 0) continue;

    for (const q of exam.questions) {
      let correct = 0;
      let total = 0;
      const wrongChoices = new Map<number, number>();
      for (const sub of eSubs) {
        const item = sub.resultJson?.items.find((r) => r.questionId === q.questionId);
        if (!item) continue;
        total += 1;
        if (item.isCorrect) correct += 1;
        else {
          const picked = sub.answersJson?.[q.questionId]?.choiceIndex;
          if (typeof picked === "number") wrongChoices.set(picked, (wrongChoices.get(picked) || 0) + 1);
        }
      }
      if (total === 0) continue;
      const branchId = inferMathBranchIdForQuestion(q, exam.titleAr);
      const bEntry = branchAgg.get(branchId) ?? { qIds: new Set<string>(), correct: 0, total: 0 };
      bEntry.qIds.add(`${exam.examId}:${q.questionId}`);
      bEntry.correct += correct;
      bEntry.total += total;
      branchAgg.set(branchId, bEntry);

      const diffIdx = Number((correct / total).toFixed(2));
      const masteryPct = Math.round(diffIdx * 100);
      const errorPct = 100 - masteryPct;
      const discIdx = computeKelleyDiscrimination(eSubs, q.questionId);
      const isFlaggedAmbiguous = discIdx !== null && ((discIdx < 0.15 && errorPct >= 30) || discIdx < 0);
      const difficultyLabelAr = diffIdx >= 0.8 ? "سهل / متقن" : diffIdx >= 0.4 ? "صعوبة متوازنة" : "صعب / فجوة فهم";
      const qualityFlagAr =
        discIdx === null ? "عينة صغيرة (< ٤ طلاب)" : discIdx < 0 ? "تمييز عكسي (راجع صياغة السؤال)" : isFlaggedAmbiguous ? "تمييز ضعيف مع خطأ مرتفع (راجع الوضوح)" : discIdx >= 0.3 ? "تمييز ممتاز بين المستويات" : "أداء مقبول";

      const wrongTotal = Math.max(1, total - correct);
      const distractorBreakdown: DistractorBreakdownItem[] = Array.from(wrongChoices.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([idx, cnt]) => ({
          choiceLetterAr: `البديل (${CHOICE_LETTERS[idx] ?? idx + 1})`,
          count: cnt,
          shareOfErrorsPct: Math.round((cnt / wrongTotal) * 100),
        }));

      const cleanPrompt = q.promptArabic.replace(/\$[^$]*\$/g, " [معادلة] ").trim();
      psychometricQuestions.push({
        examId: exam.examId,
        questionId: q.questionId,
        displayOrderNumber: q.displayOrderNumber,
        promptSnippetAr: cleanPrompt.length > 52 ? `${cleanPrompt.slice(0, 52)}…` : cleanPrompt,
        lessonTitleAr: q.lessonTitleArabic || exam.titleAr.replace(/^اختبار\s*—\s*/, ""),
        branchId,
        branchNameAr: MATH_BRANCHES_SSOT[branchId].nameArabic,
        totalAttempts: total,
        masteryPct,
        errorPct,
        difficultyIndex: diffIdx,
        difficultyLabelAr,
        discriminationIndex: discIdx,
        qualityFlagAr,
        isFlaggedAmbiguous,
        distractorBreakdown,
      });
    }
  }

  const branchStats: BranchMasteryStat[] = Array.from(branchAgg.entries()).map(([branchId, agg]) => {
    const masteryPct = agg.total > 0 ? Math.round((agg.correct / agg.total) * 100) : 0;
    return {
      branchId,
      branchNameAr: MATH_BRANCHES_SSOT[branchId].nameArabic,
      symbolBadge: MATH_BRANCHES_SSOT[branchId].symbolBadge,
      questionsCount: agg.qIds.size,
      totalAttempts: agg.total,
      masteryPct,
      tone: masteryPct >= 75 ? ("strong" as const) : masteryPct >= 55 ? ("moderate" as const) : ("weak" as const),
    };
  }).sort((a, b) => a.masteryPct - b.masteryPct);

  const byStudent = new Map<string, { name: string; scores: number[]; wrongLessons: Map<string, number> }>();
  const examMap = new Map(exams.map((e) => [e.examId, e]));
  for (const s of submissions) {
    const k = s.studentCode.toUpperCase();
    const cur = byStudent.get(k) ?? { name: s.studentNameAr, scores: [], wrongLessons: new Map<string, number>() };
    cur.scores.push(s.percentageScore);
    const exam = examMap.get(s.examId);
    for (const it of s.resultJson?.items ?? []) {
      if (!it.isCorrect) {
        const q = exam?.questions.find((qq) => qq.questionId === it.questionId);
        const lTitle = q?.lessonTitleArabic || s.examTitleAr;
        cur.wrongLessons.set(lTitle, (cur.wrongLessons.get(lTitle) || 0) + 1);
      }
    }
    byStudent.set(k, cur);
  }

  let excellentCount = 0; let goodCount = 0; let needsSupportCount = 0; let urgentInterventionCount = 0;
  const atRiskStudents: AtRiskStudentSummary[] = [];
  byStudent.forEach((v, code) => {
    const avg = Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length);
    if (avg >= 85) excellentCount += 1;
    else if (avg >= 70) goodCount += 1;
    else if (avg >= 50) needsSupportCount += 1;
    else urgentInterventionCount += 1;
    if (avg < 70) {
      let weakestLessonAr = "مراجعة عامة"; let maxW = 0;
      v.wrongLessons.forEach((cnt, title) => { if (cnt > maxW) { maxW = cnt; weakestLessonAr = title; } });
      atRiskStudents.push({ studentCode: code, studentNameAr: v.name, averagePct: avg, weakestLessonAr, isSibling: siblingCodes.has(code) });
    }
  });
  atRiskStudents.sort((a, b) => a.averagePct - b.averagePct);

  const remediationPlan: RemediationRecommendationItem[] = [];
  const weakBranch = branchStats.find((b) => b.masteryPct < 65);
  if (weakBranch) {
    remediationPlan.push({
      priority: "high",
      titleAr: `أولوية مراجعة فرع: ${weakBranch.branchNameAr} (${weakBranch.masteryPct}٪ إتقان)`,
      actionAr: "خصّص ١٥ دقيقة في بداية الحصة القادمة لشرح أمثلة متدرجة في هذا الفرع مع ورقة عمل سريعة من الاستوديو.",
    });
  }
  const topDistractorQ = psychometricQuestions.find((q) => q.errorPct >= 40 && q.distractorBreakdown[0]?.shareOfErrorsPct >= 40);
  if (topDistractorQ) {
    const d0 = topDistractorQ.distractorBreakdown[0];
    remediationPlan.push({
      priority: "high",
      titleAr: `خطأ مفاهيمي شائع في س${topDistractorQ.displayOrderNumber} (${topDistractorQ.lessonTitleAr})`,
      actionAr: `${d0.shareOfErrorsPct}٪ من المخطئين اختاروا ${d0.choiceLetterAr} — اعرض هذا الفخ تحديداً على السبورة لتصحيح المفهوم.`,
    });
  }
  const ambiguousQ = psychometricQuestions.find((q) => q.isFlaggedAmbiguous);
  if (ambiguousQ) {
    remediationPlan.push({
      priority: "medium",
      titleAr: `تنبيه جودة صياغة في س${ambiguousQ.displayOrderNumber} (معامل تمييز ${ambiguousQ.discriminationIndex})`,
      actionAr: "حصل هذا السؤال على معامل تمييز منخفض رغم أخطاء الطلاب؛ راجع نص السؤال أو رسمه للتأكد من عدم وجود لبس للطلاب.",
    });
  }
  if (urgentInterventionCount > 0 || needsSupportCount > 0) {
    remediationPlan.push({
      priority: "medium",
      titleAr: `دعم ${urgentInterventionCount + needsSupportCount} طلاب دون ٧٠٪`,
      actionAr: "أرسل لهؤلاء الطلاب شيت واجب علاجي على الدروس المحددة أعلاه وتابعهم في الاختبار القادم.",
    });
  }
  if (remediationPlan.length === 0 && psychometricQuestions.length > 0) {
    remediationPlan.push({
      priority: "positive",
      titleAr: "أداء الصف ممتاز ومستقر عبر الفروع",
      actionAr: "يمكنك رفع مستوى التحدي بإضافة أسئلة مهارات عليا (تفكير إبداعي) في الاختبار القادم.",
    });
  }

  return {
    branchStats,
    psychometricQuestions,
    studentTiers: {
      excellentCount, goodCount, needsSupportCount, urgentInterventionCount,
      totalUniqueStudents: byStudent.size, atRiskStudents: atRiskStudents.slice(0, 8),
    },
    remediationPlan,
  };
}
