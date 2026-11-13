/**
 * @file math-elementary-visuals-dispatcher.ts
 * @description المنسق الحتمي للرسوم البصرية التمهيدية للرياضيات فقط (الساعة، مخطط فن، شجرة العوامل، النموذج الشريطي، مصفوفة النقاط، القيمة المكانية، شبكة العشري، خط المنتصف).
 * ممنوع تماماً إضافة أي خرائط جغرافية أو اجتماعية — رياضيات 100% فقط.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 175 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import {
  toWesternNumeralsSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "../../ssot/numeral-and-unit-ssot";
import { parseMathClockDescriptor, renderMathClockSVG } from "./math-clock-visual-svg-builder";
import { parseMathVennDescriptor } from "./math-venn-diagram-parser-helpers";
import { renderMathVennDiagramSVG } from "./math-venn-diagram-svg-builder";
import { renderMathFactorTreeSVG } from "./math-factor-tree-svg-builder";
import { renderMathTapeModelSVG } from "./math-tape-model-svg-builder";
import { renderMathDotArraySVG } from "./math-dot-array-svg-builder";
import { renderMathPlaceValueTableSVG } from "./math-place-value-table-builder";
import { renderMathDecimalGridSVG } from "./math-decimal-grid-svg-builder";
import { renderMathMidpointRoundingSVG } from "./math-midpoint-rounding-svg-builder";

export const MODULE_ID_MATH_ELEMENTARY_VISUALS_DISPATCHER =
  "math_elementary_visuals_dispatcher" as const;

function buildFigureWrapper(
  figureId: string,
  branchId: "primary_bar_model" | "primary_analog_clock",
  titleArabic: string,
  notationLanguage: MathNotationLanguage,
  rawSvgMarkup: string
): CanonicalGeometryFigureIR {
  return {
    figureId,
    familyId: "primary_visual_models_family",
    branchId,
    titleArabic,
    notationLanguage,
    vertices: [],
    segments: [],
    angles: [],
    rawSvgMarkup,
  };
}

export function detectAndBuildMathElementaryVisualFigure(
  description: string,
  figureId = "prim_math_visual",
  notationLanguage: MathNotationLanguage = "arabic",
  numeralMode: NumeralDisplayMode = notationLanguage === "arabic" ? "eastern" : "western"
): CanonicalGeometryFigureIR | undefined {
  const norm = toWesternNumeralsSSOT((description || "").trim());
  if (!norm) return undefined;

  // استبعاد صريح لأي خريطة جغرافية/اجتماعية
  if (/خريطة|قارة|دولة|نهر|محيط|تضاريس/i.test(norm)) {
    return undefined;
  }

  // 1. مخطط فن (مجموعات الأعداد المتداخلة أو نظرية المجموعات أو العوامل الأولية)
  if (/(?:مخطط\s*(?:ال)?ف(?:ن|[ا]?ين)|شكل\s*ف(?:ن|[ا]?ين)|مجموعات\s*الأعداد|المجموعة\s*الشاملة)/i.test(norm)) {
    const data = parseMathVennDescriptor(norm);
    return buildFigureWrapper(
      figureId,
      "primary_bar_model",
      data.title ?? "مخطط فن",
      notationLanguage,
      renderMathVennDiagramSVG({ ...data, numeralMode })
    );
  }

  // 2. شجرة العوامل الأولية
  if (/شجرة\s*العوامل(?:\s*الأولية)?/i.test(norm)) {
    const nums = (norm.match(/\b\d+\b/g) ?? []).map((n) => parseInt(n, 10)).filter((n) => n > 1 && n <= 10000);
    if (nums.length >= 1) {
      return buildFigureWrapper(
        figureId,
        "primary_bar_model",
        "شجرة العوامل الأولية",
        notationLanguage,
        renderMathFactorTreeSVG({ numbers: nums.slice(0, 3), numeralMode })
      );
    }
  }

  // 3. الساعة التناظرية / الرقمية (تشمل أوصاف العقارب أو الساعة اللفظية)
  if (/(?:ساعة\s*(?:حائط|عقارب|دائرية|رقمية)|عقرب\s*الساعات|عقرب\s*الدقائق|تشير\s*الساعة)/i.test(norm)) {
    const parsed = parseMathClockDescriptor(norm);
    return buildFigureWrapper(
      figureId,
      "primary_analog_clock",
      parsed.clockType === "digital" ? "الساعة الرقمية" : "الساعة التناظرية",
      notationLanguage,
      renderMathClockSVG({ hours: parsed.hours, minutes: parsed.minutes, clockType: parsed.clockType, numeralMode })
    );
  }

  // 4. استراتيجية نقطة المنتصف للتقريب
  if (/نقطة\s*المنتصف.*(?:تقريب|لأقرب)|(?:خط\s*أعداد\s*رأسي|خط\s*المنتصف).*تقريب/i.test(norm)) {
    const nums = (norm.match(/\b\d+(?:\.\d+)?\b/g) ?? []).map(Number).filter(Number.isFinite);
    if (nums.length >= 3) {
      const sorted = [...nums.slice(0, 3)].sort((a, b) => a - b);
      return buildFigureWrapper(
        figureId,
        "primary_bar_model",
        "استراتيجية نقطة المنتصف للتقريب",
        notationLanguage,
        renderMathMidpointRoundingSVG({ lowerBound: sorted[0], targetValue: sorted[1], upperBound: sorted[2], numeralMode })
      );
    }
  }

  // 5. مصفوفة النقاط وخاصية التوزيع
  if (/مصفوفة\s*(?:نقاط|النقاط)|(?:أعمدة|صفوف).*مصفوفة/i.test(norm)) {
    const dimM = norm.match(/(\d+)\s*(?:×|x|\*|في)\s*(\d+)/i);
    if (dimM) {
      const rows = Math.max(1, Math.min(12, parseInt(dimM[1], 10)));
      const cols = Math.max(1, Math.min(20, parseInt(dimM[2], 10)));
      const splitM = norm.match(/(?:مقسمة\s*إلى|توزيع)\s*(\d+)\s*[+و]\s*(\d+)/i);
      const splitCols = splitM && parseInt(splitM[1], 10) + parseInt(splitM[2], 10) === cols
        ? [parseInt(splitM[1], 10), parseInt(splitM[2], 10)]
        : undefined;
      return buildFigureWrapper(
        figureId,
        "primary_bar_model",
        "مصفوفة النقاط",
        notationLanguage,
        renderMathDotArraySVG({ rows, cols, splitCols, numeralMode })
      );
    }
  }

  // 6. جدول القيمة المكانية
  if (/جدول\s*القيمة\s*المكانية/i.test(norm)) {
    const valM = norm.match(/\b(\d{2,12}(?:\.\d{1,3})?)\b/);
    if (valM) {
      return buildFigureWrapper(
        figureId,
        "primary_bar_model",
        "جدول القيمة المكانية",
        notationLanguage,
        renderMathPlaceValueTableSVG({ numberValue: valM[1], numeralMode })
      );
    }
  }

  // 7. شبكة المائة العشرية والأجزاء من عشرة
  if (/شبكة\s*(?:المائة|المئة|عشرية|الأجزاء)/i.test(norm)) {
    const decM = norm.match(/\b0\.(\d{1,2})\b/);
    const countM = norm.match(/مظلل\s*(\d{1,3})/);
    const isTenths = /من\s*عشرة|عشر\s*أجزاء/i.test(norm) && (!decM || decM[1].length === 1);
    const decimalValue = decM ? parseFloat(`0.${decM[1]}`) : undefined;
    const shadedCount = countM ? parseInt(countM[1], 10) : undefined;
    if (decimalValue !== undefined || shadedCount !== undefined) {
      return buildFigureWrapper(
        figureId,
        "primary_bar_model",
        isTenths ? "شبكة الأجزاء من عشرة" : "شبكة المائة العشرية",
        notationLanguage,
        renderMathDecimalGridSVG({
          type: isTenths ? "tenths_bar" : "hundred_grid",
          decimalValue,
          shadedCount,
          numeralMode,
        })
      );
    }
  }

  // 8. النموذج الشريطي الصريح بذكر الكل والأجزاء
  if (/نموذج\s*شريطي.*الكل|مخطط\s*شريطي/i.test(norm)) {
    const totalM = norm.match(/الكل\s*[:=]?\s*([0-9]+|؟|x|س)/i);
    const partMs = Array.from(norm.matchAll(/الجزء\s*(?:الأول|الثاني|\d)?\s*[:=]?\s*([0-9]+|؟|x|س)/gi));
    if (totalM && partMs.length >= 2) {
      const totalVal = totalM[1];
      return buildFigureWrapper(
        figureId,
        "primary_bar_model",
        "النموذج الشريطي",
        notationLanguage,
        renderMathTapeModelSVG({
          total: totalVal,
          totalIsUnknown: totalVal === "؟" || totalVal === "x" || totalVal === "س",
          parts: partMs.map((m) => ({
            label: m[1],
            isUnknown: m[1] === "؟" || m[1] === "x" || m[1] === "س",
          })),
          numeralMode,
        })
      );
    }
  }

  return undefined;
}
