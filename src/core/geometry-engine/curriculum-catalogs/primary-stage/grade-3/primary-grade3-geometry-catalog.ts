/**
 * @file primary-grade3-geometry-catalog.ts
 * @description السجل المركزي لأشكال ومفاهيم الرياضيات للصف الثالث الابتدائي (المرحلة 5.2):
 * - نماذج الكسور (شرائح الكسور ودوائر الكسور)
 * - محيط ومساحة الأشكال على الشبكة التربيعية
 * - تصنيف الزوايا وساعة العقارب
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (< 160 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";
import { toWesternNumeralsSSOT, type MathNotationLanguage } from "@/core/ssot/numeral-and-unit-ssot";
import { buildGrade3FractionFigure } from "./primary-grade3-fraction-models-builder";
import { buildGrade3GridAreaFigure } from "./primary-grade3-grid-area-builder";
import { buildGrade4AnalogClockSvgMarkup } from "../grade-4/primary-grade4-analog-clock-svg-builder";

export const MODULE_ID_PRIMARY_GRADE3_GEOMETRY_CATALOG =
  "primary_grade3_geometry_catalog" as const;

export function matchPrimaryGrade3GeometryFigure(
  description: string,
  figureId = "grade3_fig",
  notationLanguage: MathNotationLanguage = "arabic"
): CanonicalGeometryFigureIR | undefined {
  const d = toWesternNumeralsSSOT(description.trim());
  if (!d) return undefined;

  // استبعاد مصطلحات المراحل الأعلى
  if (/(?:برهان|أثبت|معادلة|إحداثي|احداثي|ميل|متوسط|فيثاغورس|إقليدس|طاليس|تشابه|تطابق|محيطية|مركزية|مماس|قاطع|وتر|قطراه|[A-Z]{2,4})/i.test(d)) {
    return undefined;
  }

  // 1. نماذج الكسور: شريحة أو دائرة
  const fracMatch =
    d.match(/(?:كسر|ظلل|مظلل)?\s*(\d+)\s*[\/على]\s*(\d+)/i) ||
    d.match(/(\d+)\s*أجزاء\s*من\s*(\d+)/i);

  const dividedMatch = d.match(/مقسم[ةه]\s*إلى\s*(\d+)\s*أجزاء.*?(?:مظلل|ظلل)\s*(?:منها)?\s*(\d+)/i);

  if ((fracMatch || dividedMatch) && /(?:كسر|شريحة|دائرة|أجزاء|مظلل|مقام|بسط)/i.test(d)) {
    const num = dividedMatch ? Number(dividedMatch[2]) : Number(fracMatch![1]);
    const den = dividedMatch ? Number(dividedMatch[1]) : Number(fracMatch![2]);
    const isCircle = /دائرة|قرص|قطاع/i.test(d);
    return buildGrade3FractionFigure(
      {
        numerator: num,
        denominator: den,
        shape: isCircle ? "circle" : "strip",
      },
      figureId,
      notationLanguage
    );
  }

  // 2. المحيط والمساحة على الشبكة التربيعية
  if (/شبكة\s*تربيعية|وحدات\s*مربعة|محيط.*شبكة|مساحة.*شبكة/i.test(d)) {
    const dimMatch = d.match(/(\d+)\s*(?:في|×|x)\s*(\d+)/i);
    const sW = dimMatch ? Number(dimMatch[1]) : 4;
    const sH = dimMatch ? Number(dimMatch[2]) : 3;
    return buildGrade3GridAreaFigure(
      {
        gridCols: Math.max(sW + 2, 6),
        gridRows: Math.max(sH + 2, 5),
        shapeWidth: sW,
        shapeHeight: sH,
      },
      figureId,
      notationLanguage
    );
  }

  // 3. قراءة الوقت بالساعة
  const timeMatch = d.match(/(?:الساعة|الوقت)\s*[:=]?\s*(\d{1,2})\s*[:：]\s*(\d{2})/);
  if (timeMatch || /ساعة\s*عقارب|قراءة\s*الساعة/i.test(d)) {
    const hour = timeMatch ? Number(timeMatch[1]) : 3;
    const minute = timeMatch ? Number(timeMatch[2]) : 15;
    const svg = buildGrade4AnalogClockSvgMarkup({ hour, minute });
    return {
      figureId,
      familyId: "primary_visual_models_family",
      branchId: "primary_analog_clock",
      titleArabic: `ساعة العقارب: ${hour}:${String(minute).padStart(2, "0")}`,
      notationLanguage,
      vertices: [],
      segments: [],
      angles: [],
      rawSvgMarkup: svg,
    };
  }

  return undefined;
}
