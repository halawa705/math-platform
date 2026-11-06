/**
 * @file flow-item-model.ts
 * @description نموذج «الكائن المرن» للتدفق: كل فكرة/قاعدة/مثال/تدريب/فاصل/جدول هو FlowItem مستقل له عرض (كامل أو عمود)،
 * وتتألف الصفحة من مقاطع: مقطع بعرض كامل، أو مقطع أعمدة متوازنة (يمين ثم يسار بترتيب القراءة).
 */

import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_FLOW_ITEM_MODEL = "flow_item_model" as const;

export interface FlowSolutionSlice {
  /** فهرس أول خطوة معروضة (0 = رأس البطاقة بسؤالها وشكلها). */
  readonly from: number;
  /** فهرس يلي آخر خطوة معروضة (حصري). */
  readonly to: number;
  readonly total: number;
}

export type FlowItem =
  | {
      readonly id: string;
      readonly kind: "idea_capsule";
      readonly span: "full";
      readonly anchorQuestion: PrintableMathQuestionItem;
      readonly ideaIndex: number;
    }
  | {
      readonly id: string;
      readonly kind: "question";
      readonly span: "full" | "column";
      readonly question: PrintableMathQuestionItem;
      /** ترقيم السؤال المحلي داخل القسم في القالب المدرسي (مثلاً: 1، 2، 3...). */
      readonly sectionLocalNumber?: number;
      /** شريحة من خطوات الحل لبطاقة مقسومة بين صفحتين (غير معرّفة = البطاقة كاملة). الخطوة لا تُجزَّأ أبداً. */
      readonly solutionSlice?: FlowSolutionSlice;
      /** إخفاء الحل حتى لو كانت النسخة مع الإجابات (تستخدم لنسخة الطالب أولاً). */
      readonly forceHideSolution?: boolean;
      /** بطاقة حل منفصلة في نهاية المذكرة (تظهر شارة إجابة سؤال X). */
      readonly isAnswerCard?: boolean;
    }
  | { readonly id: string; readonly kind: "idea_divider"; readonly span: "full"; readonly ideaIndex: number }
  | {
      readonly id: string;
      readonly kind: "exam_section_banner";
      readonly span: "full";
      readonly sectionOrdinalArabic: string;
      readonly sectionTitleArabic: string;
      readonly questionsCount: number;
    }
  | { readonly id: string; readonly kind: "exam_wish_banner"; readonly span: "full" }
  | {
      readonly id: string;
      readonly kind: "answer_section_banner";
      readonly span: "full";
      readonly titleArabic: string;
      readonly subtitleArabic?: string;
    }
  | { readonly id: string; readonly kind: "mcq_answer_key"; readonly span: "full" }
  | { readonly id: string; readonly kind: "accreditation_footer"; readonly span: "full" };

export type FlowPageSegment =
  | { readonly kind: "full"; readonly item: FlowItem; readonly heightPx: number }
  | {
      readonly kind: "columns";
      readonly rightItems: readonly FlowItem[];
      readonly leftItems: readonly FlowItem[];
      readonly heightPx: number;
    };

export interface FlowPage {
  readonly pageNumber: number;
  readonly isFirstPage: boolean;
  readonly segments: readonly FlowPageSegment[];
  readonly usedHeightPx: number;
  readonly budgetHeightPx: number;
  /** المسافة الفعلية بين الكائنات بعد توزيع الفراغ المتبقي. */
  readonly gapPx: number;
  /** الارتفاع المستهدف للبطاقات الممدَّدة فقط (id ← px)؛ البطاقة غير المذكورة تبقى بارتفاعها المقاس. */
  readonly targetHeightPxById: Readonly<Record<string, number>>;
  /** صحيح إن لم يتسع محتوى الصفحة لميزانيتها (كائن أطول من الصفحة) — يُبلَّغ عنه ولا يُخفى. */
  readonly overflowsBudget: boolean;
}

/** مفتاح الارتفاع المقاس لكائن سؤال إذا عُرض بعرض الصفحة كاملاً (يُستخدم للسؤال الوحيد في مقطع الأعمدة). */
export function fullWidthHeightKey(itemId: string): string {
  return `${itemId}::full`;
}

/** البطاقات التي يجوز تمديدها لملء الفراغ: الأسئلة فقط (الكبسولات والفواصل والجداول تبقى كما هي). */
export function isStretchableFlowItem(item: FlowItem): boolean {
  return item.kind === "question";
}

/** ارتفاع تقديري قبل اكتمال القياس الحي فقط. */
export function fallbackFlowItemHeightPx(item: FlowItem): number {
  switch (item.kind) {
    case "idea_capsule": return 98;
    case "idea_divider": return 22;
    case "exam_section_banner": return 38;
    case "exam_wish_banner": return 32;
    case "answer_section_banner": return 48;
    case "mcq_answer_key": return 260;
    case "accreditation_footer": return 95;
    default: return 190;
  }
}

