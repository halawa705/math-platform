/**
 * @file prep-grade1-angles-followup-catalog.ts
 * @description منسق ومطابق أشكال درس تابع العلاقات بين الزوايا للصف الأول الإعدادي (الوحدة 3 - الدرس 1 تابع).
 * @invariant يلتزم بحدود الأسطر (< 200 سطر) وTypeScript الصارم وفق دستور المنصة (AGENTS.md).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import {
  buildScissorsAngleProblemFigure,
  buildBisectedVerticalOppositeCMDFigure,
  buildVerticallyOppositeAlgebraic5X7Figure,
  buildVerticallyOpposite2X80Figure,
} from "./prep-grade1-vertically-opposite-followup-builder";
import {
  buildConcurrentAnglesFourWith10XFigure,
  buildConcurrentAnglesThreeWith140Figure,
  buildConcurrentAnglesDoubleAngle101Figure,
  buildConcurrentAnglesAlgebraicWithRightAngleFigure,
} from "./prep-grade1-concurrent-angles-around-point-builder";
import {
  buildCollinearABCDIntersectingXYFigure,
  buildIntersectingLinesWithMultipleRaysFigure,
  buildIntersectingLinesBisectedEMDFigure,
} from "./prep-grade1-collinear-intersecting-rays-builder";

export function matchPrepGrade1AnglesFollowupFigure(
  arabicDescription: string,
  figureId = "prep1_angles_followup_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = (arabicDescription || "").trim();
  if (!d) return undefined;

  // 1. مسألة المقص (تفكير ناقد 8 ص 176): (3X-18)° = (2X+12)° وتقليلها بمقدار (X+16)° لإيجاد y = 26°
  if (/مقص|ذراعي\s*المقص|3X\s*-\s*18.*2X\s*\+\s*12/i.test(d)) {
    return buildScissorsAngleProblemFigure({ figureId, notationLanguage });
  }

  // 2. مسألة 3 ص 175: AC ∩ BD = {M} مع CMD = 140° والشعاع MX ينصف AMB لحساب DMX = 110°
  if (/CMD\s*=\s*140°|MX\s*ينصف.*AMB|DMX.*110/i.test(d)) {
    return buildBisectedVerticalOppositeCMDFigure({ figureId, notationLanguage });
  }

  // 3. مسألة 7-3 ص 176: تقابل بالرأس جبري (5X+7)° و (3X+57)° لحساب X = 25°
  if (/5X\s*\+\s*7.*3X\s*\+\s*57/i.test(d)) {
    return buildVerticallyOppositeAlgebraic5X7Figure({ figureId, notationLanguage });
  }

  // 4. مسألة 1-1 ص 174: AB ∩ CD = {M} مع AMC = 80° و DMB = 2X° لحساب X = 40°
  if (/2X.*80°.*AB\s*∩\s*CD|DMB\s*=\s*2X.*AMC\s*=\s*80°|80°.*2X°/i.test(d)) {
    return buildVerticallyOpposite2X80Figure({ figureId, notationLanguage });
  }

  // 5. مسألة 1-6 ص 174: زوايا متجمعة حول M: 70° و 100° و 80° و 10X° لإيجاد X = 11°
  if (/10X.*70°.*100°|70°.*100°.*80°.*10X|10X°.*360°/i.test(d)) {
    return buildConcurrentAnglesFourWith10XFigure({ figureId, notationLanguage });
  }

  // 6. مسألة 1-8 ص 174: ثلاث زوايا متجمعة إحداها 140° واثنتان متساويتان X° لإيجاد X = 110°
  if (/140°.*X°.*X°|140°.*متجمعة.*نقطة.*110|140°.*زاويتان\s*متساويتان/i.test(d)) {
    return buildConcurrentAnglesThreeWith140Figure({ figureId, notationLanguage });
  }

  // 7. مسألة 5 ص 175: BMC = 2 AMB مع AMB = 48° و DMC = 115° لحساب AMD = 101°
  if (/BMC\s*=\s*2\s*m\(?∠?\s*AMB\)?|DMC\s*=\s*115°.*AMB\s*=\s*48°|AMD.*101/i.test(d)) {
    return buildConcurrentAnglesDoubleAngle101Figure({ figureId, notationLanguage });
  }

  // 8. مسألة 7-5 ص 176: زاوية قائمة 90° مع (3X-5)° و (4X+2)° و (3X+63)° لإيجاد X = 21°
  if (/3X\s*-\s*5.*4X\s*\+\s*2.*3X\s*\+\s*63|قائمة.*3X\s*-\s*5/i.test(d)) {
    return buildConcurrentAnglesAlgebraicWithRightAngleFigure({ figureId, notationLanguage });
  }

  // 9. مسألة 6 ص 175: مستقيم ABCD مع ABE = 56° وتقاطع XY مع BD في C لحساب DCY = 124°
  if (/A\s*،?\s*B\s*،?\s*C\s*،?\s*D.*مستقيم.*56°|ABE\s*=\s*56°.*DCY|DCY.*124/i.test(d)) {
    return buildCollinearABCDIntersectingXYFigure({ figureId, notationLanguage });
  }

  // 10. مسألة 4 ص 175: CMX = 90° و AMY = 80° و XMB = 35° لحساب AMD = 125°
  if (/CMX\s*=\s*90°.*AMY\s*=\s*80°|CMX.*90°.*XMB.*35°/i.test(d)) {
    return buildIntersectingLinesWithMultipleRaysFigure({ figureId, notationLanguage });
  }

  // 11. مسألة 1-2 ص 174: AC ∩ BD = {M} مع BMC = 120° و ME ينصف AMD لحساب EMD = 60°
  if (/AC\s*∩\s*BD.*120°.*ME|ME\s*ينصف.*AMD.*120°|EMD.*60°/i.test(d)) {
    return buildIntersectingLinesBisectedEMDFigure({ figureId, notationLanguage });
  }

  // 12. مطابقة عامة للدرس
  if (/تابع\s*العلاقات\s*بين\s*الزوايا|المتجمعة\s*حول\s*نقطة/i.test(d)) {
    return buildConcurrentAnglesFourWith10XFigure({ figureId, notationLanguage });
  }

  return undefined;
}
