/**
 * @file prep-grade1-angles-relationships-catalog.ts
 * @description منسق ومطابق أشكال درس أنواع الزوايا والعلاقات بينها للصف الأول الإعدادي (الوحدة 3 - الدرس 1).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import {
  buildComplementaryTwoAngles25Figure,
  buildRightAngleTrisectedFigure,
  buildComplementaryAlgebraic2XFigure,
  buildCrossingBarrierGateFigure,
} from "./prep-grade1-complementary-right-angles-builder";
import {
  buildSupplementaryTwoAngles35Figure,
  buildCollinearRaysTest144Figure,
  buildSupplementaryAlgebraic5X4XFigure,
  buildThreeAnglesOnStraightLineFigure,
} from "./prep-grade1-supplementary-straight-angles-builder";
import {
  buildVerticallyOppositeAnglesAlgebraicFigure,
  buildStraightLineBisectedAngleNOZFigure,
  buildSquashBallWallReboundFigure,
} from "./prep-grade1-vertically-opposite-concurrent-angles-builder";

export function matchPrepGrade1AnglesRelationshipsFigure(
  arabicDescription: string,
  figureId = "prep1_angles_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = (arabicDescription || "").trim();
  if (!d) return undefined;

  // 1. زاويتان متتامتان AC ⊥ AB بزاوية 25° لحساب X = 65° (مسألة 6-1 ص 163)
  if (/AC\s*⊥\s*AB.*25°|25°.*AC\s*⊥\s*AB.*X/i.test(d)) {
    return buildComplementaryTwoAngles25Figure({ figureId, notationLanguage });
  }

  // 2. زاوية قائمة مقسمة إلى 3 زوايا متساوية لحساب EAD = 30° (مسألة 6-2 ص 163)
  if (/AC\s*⊥\s*AB.*EAD|EAD.*30°|قائمة\s*مقسمة.*ثلاث/i.test(d)) {
    return buildRightAngleTrisectedFigure({ figureId, notationLanguage });
  }

  // 3. زاويتان متتامتان جبرياً (2X+2)° و (X+1)° لحساب X = 29° (مسألة 7 ص 165)
  if (/2X\s*\+\s*2.*X\s*\+\s*1|AC\s*⊥\s*AB.*2X\s*\+\s*2/i.test(d)) {
    return buildComplementaryAlgebraic2XFigure({ figureId, notationLanguage });
  }

  // 4. ذراع بوابة العبور بزاوية 42° مع الرأسي و (3X+3)° مع الأفقي لحساب X = 15 (مسألة 14 ص 165)
  if (/ذراع\s*بوابة\s*العبور|42°.*3X\s*\+\s*3|3X\s*\+\s*3.*48°/i.test(d)) {
    return buildCrossingBarrierGateFigure({ figureId, notationLanguage });
  }

  // 5. زاويتان متكاملتان على خط مستقيم بزاوية 35° لحساب X = 145° (مسألة 7-1 ص 163)
  if (/A\s*∈\s*BC.*35°|35°.*X.*مستقيم.*145/i.test(d)) {
    return buildSupplementaryTwoAngles35Figure({ figureId, notationLanguage });
  }

  // 6. استقامة الشعاعين OA و OB بزاويتين 144° و 36° (مسألة 12-1 ص 164)
  if (/OA.*OB.*استقامة.*144|144°.*36°.*استقامة/i.test(d)) {
    return buildCollinearRaysTest144Figure({ figureId, notationLanguage });
  }

  // 7. زاويتان متكاملتان جبرياً (5X+2)° و (4X-2)° على خط مستقيم لحساب X = 20° (مسألة 8 ص 165)
  if (/5X\s*\+\s*2.*4X\s*-\s*2|B\s*∈\s*AC.*5X\s*\+\s*2/i.test(d)) {
    return buildSupplementaryAlgebraic5X4XFigure({ figureId, notationLanguage });
  }

  // 8. ثلاث زوايا متجاورة على خط مستقيم 5X° و 3X° و 2X° لإيجاد X = 18° (مسألة 11 ص 165)
  if (/5X.*3X.*2X.*مستقيم|A\s*∈\s*CB.*5X/i.test(d)) {
    return buildThreeAnglesOnStraightLineFigure({ figureId, notationLanguage });
  }

  // 9. زاويتان متقابلتان بالرأس (2X+26)° = (3X-21)° لحساب X = 47° (مسألة 13-5 ص 164)
  if (/2X\s*\+\s*26.*3X\s*-\s*21|متقابلتان\s*بالرأس.*3X\s*-\s*21/i.test(d)) {
    return buildVerticallyOppositeAnglesAlgebraicFigure({ figureId, notationLanguage });
  }

  // 10. خط مستقيم ومنصف OM للزاوية NOZ مع YOX = 50° لحساب MOX = 160° (مسألة 10 ص 164)
  if (/OM\s*ينصف.*NOZ|NOZ.*YOX\s*=\s*50°|MOX.*160/i.test(d)) {
    return buildStraightLineBisectedAngleNOZFigure({ figureId, notationLanguage });
  }

  // 11. ارتطام كرة الإسكواش بالحائط بزاوية 50° وزاويتين (4X+21)° و (6X-1)° لحساب X = 11 (مسألة 15 ص 165)
  if (/إسكواش.*حائط|4X\s*\+\s*21.*6X\s*-\s*1|ارتطمت\s*بالحائط/i.test(d)) {
    return buildSquashBallWallReboundFigure({ figureId, notationLanguage });
  }

  // 12. مطابقة عامة لدرس أنواع الزوايا والعلاقات بينها في 1 إعدادي
  if (/أنواع\s*الزوايا|العلاقات\s*بين\s*الزوايا|الزاويتان\s*المتتامتان|الزاويتان\s*المتكاملتان/i.test(d)) {
    return buildComplementaryTwoAngles25Figure({ figureId, notationLanguage });
  }

  return undefined;
}
