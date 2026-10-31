/**
 * @file shared-math-prompt-invariants.ts
 * @description القواعد الحاكمة المكثفة لجميع برومبتات الرياضيات الموجهة إلى NotebookLM شاملة التفكيك الذكي للأفكار وترتيب المصادر.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 95 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import { MATH_BRANCHES_SSOT } from "../ssot/math-branches-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";
import { buildSmartGeometryPromptGuidance } from "./smart-geometry-prompt-director";

export const MODULE_ID_SHARED_MATH_PROMPT_INVARIANTS =
  "shared_math_prompt_invariants" as const;

export const SOURCE_PRIORITY_HIERARCHY_RULE_AR =
  "📚 ترتيب المصادر الإلزامي: (١) كتاب التقييمات الوزارية ← (٢) كتاب المدرسة ← (٣) الكتب الخارجية (بأولوية تدريباتها وامتحانات الإدارات والمحافظات) ← (٤) كآخر حل عند انعدام الفكرة بالمصادر: توليد مباشر من NotebookLM مطابق للفكرة.";

export const EXHAUSTIVE_IDEA_SPECTRUM_RULE_AR =
  "🔬 التفكيك الذكي والحصر الشامل للأفكار: افحص بذكاء كامل المصادر (الشرح، التدريبات، والاختبارات الشهرية والنهائية للمحافظات) واحصر جميع الأفكار الحقيقية للدرس (كل قانون أو حالة أو فكرة تمرين) متدرجة من (البسيط التأسيسي ← المتوسط ← المتقدم ← المتفوقين) بدون إهمال أي فكرة في المصادر، وبدون حشو أو اختلاق أفكار خارج الدرس أو تكرار الفكرة بصياغة أخرى.";

const COMPACT_MATH_PROMPT_INVARIANTS_EN: readonly string[] = [
  "1. منع التكرار: يُمنع تكرار أي سؤال؛ كل سؤال يختبر فكرة رياضية مستقلة ومختلفة (وليس نفس الفكرة بأرقام أخرى).",
  "2. دقة الاختيار (MCQ): 4 بدائل (أ، ب، جـ، د) بإجابة واحدة فقط صحيحة رياضياً (وليس شكلياً) + 3 مشتتات ذكية ومعقولة رياضياً.",
  "3. الصياغة: المعادلات بـ `$...$` فقط، الفترات `$]a, b[$`، فرق المجموعات `-` (`$\\mathbb{R}-\\{3\\}$`)، الوحدات بالعربية بعد العدد (`$5$ سم`)، البرهان بـ ($\\because$/$\\therefore$)، بلا مراجع `[1]` أو `【...】` أو اختلاق محافظات أو رسم لمسألة جبرية/لفظية.",
] as const;

const COMPACT_MATH_PROMPT_INVARIANTS_AR: readonly string[] = [
  "1. منع التكرار: يُمنع تكرار أي سؤال؛ كل سؤال يختبر فكرة رياضية مستقلة ومختلفة (وليس نفس الفكرة بأرقام أخرى).",
  "2. دقة الاختيار (MCQ): ٤ بدائل (أ، ب، جـ، د) بإجابة واحدة فقط صحيحة رياضياً (وليس شكلياً) + ٣ مشتتات ذكية ومعقولة رياضياً.",
  "3. الصياغة: المعادلات بـ `$...$` فقط، الفترات `$]أ, ب[$`، فرق المجموعات `-` (`$ح-\\{3\\}$`)، الوحدات بالعربية بعد العدد (`$5$ سم`)، البرهان بـ ($\\because$/$\\therefore$)، بلا مراجع `[1]` أو `【...】` أو اختلاق محافظات أو رسم لمسألة جبرية/لفظية.",
] as const;

export function buildSharedMathInvariantsPromptBlock(params: {
  readonly branchId: MathBranchId;
  readonly notationLanguage?: MathNotationLanguage;
  readonly lessonTitleArabic?: string;
  readonly unitTitleArabic?: string;
}): string {
  const branchSpec = MATH_BRANCHES_SSOT[params.branchId];
  const effectiveNotation: MathNotationLanguage = params.notationLanguage ?? "english";
  const notationRule =
    effectiveNotation === "english"
      ? "إنجليزية مطابقة للمنهج الجديد بالمصادر (الأرقام 0-9، المجاهيل x, y, z، ورؤوس الأشكال A, B, C, D, M — يُمنع تعريبها إلى أ، ب، جـ، م، س، ص)"
      : "عربية (س، ص، أ، ب، جـ، ح، جا، جتا، ظا)";

  const geometryDirective = buildSmartGeometryPromptGuidance({
    branchId: params.branchId,
    notationLanguage: effectiveNotation,
    lessonTitleArabic: params.lessonTitleArabic,
    unitTitleArabic: params.unitTitleArabic,
  });

  const compactRules =
    effectiveNotation === "english"
      ? COMPACT_MATH_PROMPT_INVARIANTS_EN
      : COMPACT_MATH_PROMPT_INVARIANTS_AR;

  return [
    SOURCE_PRIORITY_HIERARCHY_RULE_AR,
    EXHAUSTIVE_IDEA_SPECTRUM_RULE_AR,
    `📌 الفرع (${branchSpec.nameArabic}) | الرموز: ${notationRule}.`,
    ...(geometryDirective ? [geometryDirective] : []),
    ...compactRules,
  ].join("\n");
}
