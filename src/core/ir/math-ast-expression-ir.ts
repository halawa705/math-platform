/**
 * @file math-ast-expression-ir.ts
 * @description العقد الموحد لشجرة التعبيرات والمعادلات والفترات والدوال والتفاضل والمتجهات (Math AST IR).
 * يمثل المصدر الوحيد للحقيقة لتمثيل أي بنية جبرية أو عددية أو تحليلية قبل تصييرها.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 200 سطر).
 */

import type { ArabicMathUnit, MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_MATH_AST_EXPRESSION_IR = "math_ast_expression_ir" as const;

export type MathRelationalOperator = "=" | "≠" | "<" | ">" | "≤" | "≥" | "≡" | "≈";

export type MathIntervalSetOperation = "union" | "intersection" | "difference" | "complement";

export type MathTrigonometricRatio = "sin" | "cos" | "tan" | "cot" | "sec" | "csc";

export interface MathNumberLiteralNode {
  readonly kind: "number_literal";
  readonly value: number;
  readonly isDecimal?: boolean;
  readonly unit?: ArabicMathUnit;
}

export interface MathFractionNode {
  readonly kind: "fraction";
  readonly numerator: MathASTNode;
  readonly denominator: MathASTNode;
  readonly wholePart?: number;
  readonly unit?: ArabicMathUnit;
}

export interface MathRadicalNode {
  readonly kind: "radical";
  readonly radicand: MathASTNode;
  readonly degree: 2 | 3 | number;
  readonly coefficient?: number;
}

export interface MathPowerExponentNode {
  readonly kind: "power_exponent";
  readonly base: MathASTNode;
  readonly exponent: MathASTNode;
}

export interface MathPolynomialTerm {
  readonly coefficient: number;
  readonly variableSymbol: string;
  readonly power: number;
}

export interface MathPolynomialNode {
  readonly kind: "polynomial";
  readonly terms: readonly MathPolynomialTerm[];
}

export interface MathEquationOrInequalityNode {
  readonly kind: "equation_or_inequality";
  readonly leftHandSide: MathASTNode;
  readonly operator: MathRelationalOperator;
  readonly rightHandSide: MathASTNode;
  readonly domainSetSymbol?: "ℕ" | "ℤ" | "ℚ" | "ℝ";
}

export interface MathRealIntervalNode {
  readonly kind: "real_interval";
  readonly leftBound: number | "-∞";
  readonly rightBound: number | "+∞";
  readonly isLeftClosed: boolean;
  readonly isRightClosed: boolean;
}

export interface MathIntervalBinaryOpNode {
  readonly kind: "interval_binary_operation";
  readonly leftInterval: MathRealIntervalNode;
  readonly operation: MathIntervalSetOperation;
  readonly rightInterval: MathRealIntervalNode;
}

export interface MathTrigExpressionNode {
  readonly kind: "trigonometric_expression";
  readonly ratio: MathTrigonometricRatio;
  readonly angleExpression: MathASTNode;
  readonly power?: number;
}

export interface MathCalculusDerivativeNode {
  readonly kind: "calculus_derivative";
  readonly order: 1 | 2 | 3;
  readonly variableSymbol: string;
  readonly targetExpression: MathASTNode;
  readonly evaluateAtValue?: number;
}

export interface MathCalculusIntegralNode {
  readonly kind: "calculus_integral";
  readonly isDefinite: boolean;
  readonly lowerLimit?: MathASTNode;
  readonly upperLimit?: MathASTNode;
  readonly integrand: MathASTNode;
  readonly differentialVariable: string;
}

export interface MathVectorSpatialNode {
  readonly kind: "vector_spatial";
  readonly vectorSymbol: string;
  readonly components: readonly [number, number] | readonly [number, number, number];
  readonly unit?: ArabicMathUnit;
}

export type MathASTNode =
  | MathNumberLiteralNode
  | MathFractionNode
  | MathRadicalNode
  | MathPowerExponentNode
  | MathPolynomialNode
  | MathEquationOrInequalityNode
  | MathRealIntervalNode
  | MathIntervalBinaryOpNode
  | MathTrigExpressionNode
  | MathCalculusDerivativeNode
  | MathCalculusIntegralNode
  | MathVectorSpatialNode;

export interface MathVerifiedExpressionEnvelope {
  readonly expressionId: string;
  readonly ast: MathASTNode;
  readonly canonicalLatex: string;
  readonly notationLanguage: MathNotationLanguage;
  readonly isDeterministicallyVerified: boolean;
}
