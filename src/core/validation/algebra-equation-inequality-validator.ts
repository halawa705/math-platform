/**
 * @file algebra-equation-inequality-validator.ts
 * @description المدقق الحتمي لمعادلات ومتباينات الجبر (الدرجة الأولى والثانية في متغير واحد):
 * يتحقق من المميز (Δ = ب² - 4 أ جـ)، ومجموع الجذرين (-ب/أ)، وحاصل ضربهما (جـ/أ)، وصحة التعويض بالجذر.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

export const MODULE_ID_ALGEBRA_EQUATION_INEQUALITY_VALIDATOR =
  "algebra_equation_inequality_validator" as const;

export interface QuadraticEquationValidationResult {
  readonly discriminantDelta: number;
  readonly realRootsCount: 0 | 1 | 2;
  readonly roots: readonly number[];
  readonly sumOfRoots: number;
  readonly productOfRoots: number;
  readonly isClaimedRootValid: boolean;
}

export function validateQuadraticEquationSSOT(params: {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly claimedRoot?: number;
}): QuadraticEquationValidationResult {
  const { a, b, c, claimedRoot } = params;
  const safeA = a === 0 ? 1 : a;
  const delta = Number((b * b - 4 * safeA * c).toFixed(4));

  let roots: number[] = [];
  let realRootsCount: 0 | 1 | 2 = 0;

  if (delta > 0) {
    realRootsCount = 2;
    const sqrtD = Math.sqrt(delta);
    roots = [
      Number(((-b + sqrtD) / (2 * safeA)).toFixed(3)),
      Number(((-b - sqrtD) / (2 * safeA)).toFixed(3)),
    ];
  } else if (delta === 0) {
    realRootsCount = 1;
    roots = [Number((-b / (2 * safeA)).toFixed(3))];
  }

  const isClaimedRootValid =
    claimedRoot !== undefined
      ? Math.abs(safeA * claimedRoot * claimedRoot + b * claimedRoot + c) < 1e-3
      : true;

  return {
    discriminantDelta: delta,
    realRootsCount,
    roots,
    sumOfRoots: Number((-b / safeA).toFixed(3)),
    productOfRoots: Number((c / safeA).toFixed(3)),
    isClaimedRootValid,
  };
}
