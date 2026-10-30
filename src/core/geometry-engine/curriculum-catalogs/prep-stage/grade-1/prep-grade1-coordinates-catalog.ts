/**
 * @file prep-grade1-coordinates-catalog.ts
 * @description منسق ومطابق أشكال وفهرس درس الإحداثيات (المساقط ومنتصف القطعة المستقيمة) للصف الأول الإعدادي.
 * @invariant يلتزم بحدود الأسطر (< 200 سطر) وTypeScript الصارم وفق دستور المنصة (AGENTS.md).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import {
  buildSegmentProjectionOnXAxisFigure,
  buildSegmentProjectionOnYAxisFigure,
  buildSegmentProjectionsBothAxesFigure,
} from "./prep-grade1-coordinate-projections-builder";
import {
  buildSegmentMidpointCoordinatesFigure,
  buildSegmentMidpointNumericalFigure,
} from "./prep-grade1-segment-midpoint-coordinates-builder";

export function matchPrepGrade1CoordinatesFigure(
  arabicDescription: string,
  figureId = "prep1_coord_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = (arabicDescription || "").trim();
  if (!d) return undefined;

  // 1. مسألة 1: مسقط القطعة AB على محور السينات X مع A(2, 3) و B(-4, -1)
  if (/A\(2\s*,\s*3\).*B\(-4\s*,\s*-1\)|مسقط.*AB.*محور\s*(?:السينات|X)|طول\s*المسقط.*6\s*وحدات/i.test(d)) {
    return buildSegmentProjectionOnXAxisFigure({ figureId, notationLanguage });
  }

  // 2. مسألة 2: مسقط القطعة CD على محور الصادات Y مع C(1, 4) و D(5, 1)
  if (/C\(1\s*,\s*4\).*D\(5\s*,\s*1\)|مسقط.*CD.*محور\s*(?:الصادات|y|Y)|طول\s*المسقط.*3\s*وحدات/i.test(d)) {
    return buildSegmentProjectionOnYAxisFigure({ figureId, notationLanguage });
  }

  // 3. مسألة حاول بنفسك 2: مسقط القطعة على المحورين مع A(3, -2) و B(-4, 4)
  if (/A\(3\s*,\s*-2\).*B\(-4\s*,\s*4\)|مسقط.*المحورين|المحور\s*X.*المحور\s*y.*مسقط/i.test(d)) {
    return buildSegmentProjectionsBothAxesFigure({ figureId, notationLanguage });
  }

  // 4. إحداثيا منتصف قطعة مستقيمة (القانون العام والتطبيقي)
  if (/إحداثيا\s*منتصف|منتصف\s*قطعة\s*مستقيمة.*M|x1\s*\+\s*x2.*y1\s*\+\s*y2|قانون\s*منتصف\s*القطعة/i.test(d)) {
    return buildSegmentMidpointCoordinatesFigure({ figureId, notationLanguage });
  }

  // 5. مسألة عددية لمنتصف قطعة مستقيمة A(1, 2) و B(5, 6)
  if (/منتصف.*A\(1\s*,\s*2\)|A\(1\s*,\s*2\).*B\(5\s*,\s*6\)|M\(3\s*,\s*4\)/i.test(d)) {
    return buildSegmentMidpointNumericalFigure({ figureId, notationLanguage });
  }

  // 6. مطابقة عامة لدرس الإحداثيات والمساقط في أولى إعدادي
  if (/المستوى\s*الإحداثي.*مسقط|درس\s*الإحداثيات|إحداثيات\s*أولى\s*إعدادي|مسقط\s*قطعة\s*مستقيمة/i.test(d)) {
    return buildSegmentProjectionOnXAxisFigure({ figureId, notationLanguage });
  }

  return undefined;
}
