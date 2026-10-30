/**
 * @file angle-fan-fact-types.ts
 * @description العقود والأنواع الذرية لعائلة مراوح الأشعة والزوايا (Angle-Fan Family)
 * التي تشترك في رأس واحد (الزوايا المتتامة، المتكاملة على مستقيم، المتقابلة بالرأس، المتجمعة حول نقطة، ومنصفات الزوايا).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

export const MODULE_ID_ANGLE_FAN_FACT_TYPES = "angle_fan_fact_types" as const;

/** تعبير خطي لقياس زاوية بالدرجات: مثل 50° أو 2س° أو (3س - 10)° */
export interface LinearAngleExpr {
  readonly constant: number;
  readonly coeff: number;
  readonly varName: string | null;
  readonly rawLabel: string;
  readonly isPureNumeric: boolean;
}

/** حقيقة قياس زاوية بين شعاعين يخرجان من الرأس المشترك */
export interface AngleFanMeasureFact {
  readonly arm1: string;
  readonly arm2: string;
  readonly expr: LinearAngleExpr;
}

/** حقيقة منصف زاوية: الشعاع bisectorRay ينصف الزاوية بين arm1 و arm2 */
export interface AngleFanBisectorFact {
  readonly bisectorRay: string;
  readonly arm1: string;
  readonly arm2: string;
}

/** حقيقة بينية: شعاع (أو أشعة) يقع بين شعاعين حديين */
export interface AngleFanBetweenFact {
  readonly midRays: readonly string[];
  readonly bound1: string;
  readonly bound2: string;
}

/** حقيقة مجموع قياسي زاويتين معلوم رقمياً (مثل مجموع زاويتين متقابلتين بالرأس = 140°) */
export interface AngleFanSumFact {
  readonly angles: readonly (readonly [string, string])[];
  readonly sumDeg: number;
}

/** المواصفة الكاملة المستخلصة لمروحة أشعة تشترك في رأس واحد */
export interface AngleFanSpec {
  readonly vertex: string;
  readonly rays: readonly string[];
  readonly oppositePairs: readonly (readonly [string, string])[];
  readonly perpPairs: readonly (readonly [string, string])[];
  readonly angles: readonly AngleFanMeasureFact[];
  readonly bisectors: readonly AngleFanBisectorFact[];
  readonly betweenness: readonly AngleFanBetweenFact[];
  readonly sumEquations: readonly AngleFanSumFact[];
  readonly isFullCircleAroundVertex: boolean;
  readonly consecutiveFanOrder?: readonly string[];
}

/** نتيجة حل اتجاهات الأشعة وقيمة المجهول الجبري */
export interface SolvedAngleFanLayout {
  readonly vertex: string;
  /** زوايا اتجاه كل شعاع بالدرجات في المدى [0, 360) بعكس عقارب الساعة */
  readonly rayAnglesDeg: ReadonlyMap<string, number>;
  /** قيمة المجهول الجبري (مثل س أو X) بعد حل المعادلات الهندسية */
  readonly solvedVarValue: number | null;
  /** القياسات الرقمية المحسوبة لكل زاوية معطاة */
  readonly evaluatedAngles: readonly {
    readonly arm1: string;
    readonly arm2: string;
    readonly degrees: number;
    readonly rawLabel: string;
  }[];
}
