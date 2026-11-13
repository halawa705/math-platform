/**
 * @file prep-grade3-trigonometry-catalog.ts
 * @description السجل المركزي ومنسق القواعد الذهبية العشر لدرس «النسب المثلثية الأساسية للزاوية الحادة»
 * ودروس حساب المثلثات للصف الثالث الإعدادي:
 * 1. المثلث القائم الزاوية القياسي (بأي تسمية رؤوس وأي أضلاع معطاة أو إثباتات مثلثية).
 * 2. المثلثان القائمان المتداخلان المشتركان في زاوية حادة (ΔADE و ΔABC).
 * 3. المثلث المتساوي الساقين والعمود الساقط من الرأس على القاعدة (AD ⊥ BC و XW ⊥ YZ).
 * 4. المربع ABCD الذي فيه E منتصف AD لحساب tan(∠BCE) أو tan(∠ECD).
 * 5. المستطيل OABC في المستوى الإحداثي المتعامد لحساب tan(∠ABO).
 * 6. المستطيل ABCD المعلوم البعدين مع القطر AC.
 * 7. المربعات المتطابقة المتجاورة المكونة للمستطيل ABCD مع القطر AC.
 * 8. المعين ABCD المتقاطع قطراه AC و BD في النقطة M.
 * 9. شبه المنحرف المتساوي الساقين وشبه المنحرف القائم الزاوية.
 * 10. التطبيقات الحياتية والعملية (طائرة ورقية، سلم على حائط، عمود إنارة وظل، برج وحبل).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 160 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import {
  toWesternNumeralsSSOT,
  type MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";
import { convertGeometryLatexToPlainText } from "../../../description-intake/geometry-latex-to-plain-normalizer";
import {
  buildTrigIsoscelesAltitudeTriangleFigure,
  buildTrigNestedRightTrianglesFigure,
  buildTrigParametricRightTriangleFigure,
} from "./prep-grade3-trig-triangles-builder";
import {
  buildTrigAdjacentCongruentSquaresFigure,
  buildTrigCoordinateRectangleOABCFigure,
  buildTrigRectangleDiagonalFigure,
  buildTrigRhombusDiagonalsFigure,
  buildTrigSquareMidpointFigure,
} from "./prep-grade3-trig-quads-builder";
import {
  buildTrigAppliedLifeRightTriangleFigure,
  buildTrigIsoscelesTrapezoidFigure,
  buildTrigRightTrapezoidFigure,
} from "./prep-grade3-trig-trapezoids-and-applied-builder";
import { buildTrigTwoConnectedRightTrianglesFigure } from "./prep-grade3-trig-shared-hypotenuse-triangles-builder";

export const MODULE_ID_PREP_GRADE3_TRIGONOMETRY_CATALOG =
  "prep_grade3_trigonometry_catalog" as const;

export function matchPrepGrade3TrigonometryFigure(
  description: string,
  figureId = "prep3_trig_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const raw = (description || "").trim();
  if (!raw) return undefined;

  const clean = convertGeometryLatexToPlainText(toWesternNumeralsSSOT(raw));
  const opts = { figureId, description: raw, notationLanguage };
  const hasTrigToken =
    /(?:\b(?:sin|cos|tan|cot|sec|csc)\b|جا|جتا|ظا|النسب\s*المثلثية|نسبة\s*مثلثية)/i.test(clean);

  // 1. التطبيقات الحياتية والعملية (طائرة ورقية، سلم، عمود إنارة وظل، برج وحبل مشدود في مسائل حساب المثلثات)
  const hasLifeTrigAngle = hasTrigToken || /θ|\\theta|زاوية\s*(?:ميل|ارتفاع|انخفاض)/i.test(clean);
  if (
    hasLifeTrigAngle &&
    /طائرة\s*ورقية.*خيط|خيط.*طائرة\s*ورقية|سلم\s*طوله.*(?:يستند|أرض|حائط)|يستند\s*سلم\s*طوله|عمود\s*إنارة.*ظل|حبل\s*مشدود\s*من\s*قمة\s*برج/i.test(
      clean
    )
  ) {
    return buildTrigAppliedLifeRightTriangleFigure(opts);
  }

  // 2. المربعات المتطابقة المتجاورة المكونة للمستطيل ABCD
  if (/مربعات\s*متطابقة.*(?:لتكوين\s*المستطيل|مكونة\s*مستطيلاً?)/i.test(clean)) {
    return buildTrigAdjacentCongruentSquaresFigure(opts);
  }

  // 3. المربع ABCD فيه E منتصف AD لحساب tan(∠BCE) أو tan(∠ECD)
  if (/مربع\s*ABCD.*E\s*منتصف/i.test(clean) && (hasTrigToken || /BCE|ECD/i.test(clean))) {
    return buildTrigSquareMidpointFigure(opts);
  }

  // 4. المستطيل OABC في المستوى الإحداثي المتعامد
  if (/مستطيل\s*OABC/i.test(clean) && (hasTrigToken || /ABO|A\s*\(\s*[68]\s*[,،]\s*0\s*\)/i.test(clean))) {
    return buildTrigCoordinateRectangleOABCFigure(opts);
  }

  // 5. المستطيل ABCD المعلوم البعدين مع النسب المثلثية لزاوية القطر
  if (
    /(?:مستطيل\s*ABCD|ABCD\s*مستطيل)/i.test(clean) &&
    (/AB\s*=\s*\d+/i.test(clean) || /BC\s*=\s*\d+/i.test(clean)) &&
    (hasTrigToken || /AC\s*=\s*\d+/i.test(clean) || /ACB/i.test(clean))
  ) {
    return buildTrigRectangleDiagonalFigure(opts);
  }

  // 6. المعين ABCD المتقاطع قطراه في النقطة M
  if (/معين\s*ABCD.*قطراه/i.test(clean) && (hasTrigToken || /ABM/i.test(clean))) {
    return buildTrigRhombusDiagonalsFigure(opts);
  }

  // 7. شبه المنحرف القائم الزاوية ABCD
  if (
    /شبه\s*(?:ال)?منحرف/i.test(clean) &&
    /ABCD/i.test(clean) &&
    (/قائم|(?:m|ق)?\s*\(?\s*∠\s*[AB]\s*\)?\s*=\s*90|AB\s*⊥\s*BC/i.test(clean)) &&
    !/AB\s*\/\/\s*(?:DC|CD)/i.test(clean) &&
    !/~|تشابه|متشابه|[XY]\s*[+\-]/i.test(clean)
  ) {
    return buildTrigRightTrapezoidFigure(opts);
  }

  // 8. شبه المنحرف المتساوي الساقين ABCD
  if (
    /شبه\s*(?:ال)?منحرف/i.test(clean) &&
    /ABCD/i.test(clean) &&
    (/متساوي\s*الساقين/i.test(clean) ||
      /AB\s*=\s*(?:AD\s*=\s*)?CD/i.test(clean) ||
      /AB\s*=\s*(?:AD\s*=\s*)?DC/i.test(clean) ||
      /AD\s*\/\/\s*BC/i.test(clean)) &&
    !/AB\s*\/\/\s*(?:DC|CD)/i.test(clean) &&
    !/~|تشابه|متشابه/i.test(clean)
  ) {
    return buildTrigIsoscelesTrapezoidFigure(opts);
  }

  // 9. مثلثان قائمان مشتركان في الضلع BD
  if (
    (/مثلثان.*مشتركان\s*في\s*الضلع\s*BD/i.test(clean) ||
      (/مشتركان\s*في\s*الضلع\s*BD/i.test(clean) && /قائم/i.test(clean))) &&
    !/~|تشابه|متشابه/i.test(clean)
  ) {
    return buildTrigTwoConnectedRightTrianglesFigure(opts);
  }

  // 9. مثلثان قائمان متداخلان يشتركان في زاوية حادة (ΔADE قائم في D و ΔABC قائم في B)
  if (/ADE\s*قائم\s*في\s*D.*ABC\s*قائم\s*في\s*B/i.test(clean)) {
    return buildTrigNestedRightTrianglesFigure(opts);
  }

  // 10. المثلث المتساوي الساقين والعمود الساقط من الرأس على القاعدة (AD ⊥ BC أو XW ⊥ YZ)
  if (
    /متساوي\s*الساقين/i.test(clean) &&
    (/AD\s*⊥\s*BC|XW\s*⊥\s*YZ|العمود\s*النازل\s*من\s*A\s*على\s*BC/i.test(clean)) &&
    (hasTrigToken || /(?:AB\s*=\s*AC|XY\s*=\s*XZ)\s*=\s*(?:5|10|13|15|17|20|25)\b/i.test(clean)) &&
    !/AB\s*=\s*AC\s*=\s*15.*BC\s*=\s*18/i.test(clean)
  ) {
    return buildTrigIsoscelesAltitudeTriangleFigure(opts);
  }

  // 11. المثلث القائم الزاوية القياسي في مسائل النسب المثلثية
  if (
    hasTrigToken &&
    (/(?:المثلث|مثلث|Δ)\s*[A-Za-zأ-ي\s]{3,6}\s*(?:ال)?قائم|\b[A-Za-z]{3}\s*مثلث\s*قائم/i.test(clean)) &&
    !/إقليدس|تشابه|~|متوسط|دائرة|مماس|محور\s*y|محور\s*x|معادلة/i.test(clean)
  ) {
    return buildTrigParametricRightTriangleFigure(opts);
  }

  return undefined;
}
