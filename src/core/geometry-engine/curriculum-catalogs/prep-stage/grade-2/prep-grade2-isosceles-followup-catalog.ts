/**
 * @file prep-grade2-isosceles-followup-catalog.ts
 * @description منسق ومطابق أشكال درس تابع المثلث المتساوي الساقين ومحاور التماثل والثلاثيني الستيني (2ع - الوحدة 3 - الدرس السادس).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import {
  buildRightIsoscelesAltitudeToHypotenuseFigure,
  buildIsoscelesAltitudePythagoras12Figure,
  buildTowerSymmetricCablesFigure,
  buildTrapezoidButterflyCommonAxisFigure,
} from "./prep-grade2-isosceles-altitude-axis-symmetry-builder";
import {
  buildThirtySixtyNinetyAlgebraicHypotenuseFigure,
  buildThirtySixtyNinetySharedHypotenuseMidsegmentFigure,
  buildThirtySixtyNinetyMediansGFigure,
  buildIsoscelesAltitudeThirtyDegreeFigure,
} from "./prep-grade2-thirty-sixty-ninety-triangle-builder";
import {
  buildDeltoidAxisOfSymmetryAlgebraicFigure,
  buildSharedBaseIsoscelesAxisProofFigure,
  buildPentagonPerpendicularAxisProofFigure,
} from "./prep-grade2-isosceles-axis-deltoid-proofs-builder";

export function matchPrepGrade2IsoscelesFollowupFigure(
  arabicDescription: string,
  figureId = "prep2_iso_followup_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = (arabicDescription || "").trim();
  if (!d) return undefined;

  // 1. مثلث قائم في C ومتساوي الساقين بارتفاع CD ⊥ AB مع AD = 20 سم لحساب AB = 40 سم (مسألة 4 ص 256)
  if (/قائم.*C.*متساوي\s*الساقين.*CD\s*⊥\s*AB|AD\s*=\s*20.*طول\s*AB.*40|DCB\s*=\s*45°/i.test(d)) {
    return buildRightIsoscelesAltitudeToHypotenuseFigure({ figureId, notationLanguage });
  }

  // 2. مثلث متساوي الساقين AB = AC = 15 سم مع BC = 18 سم وارتفاع AD لحساب BD = 9 و AD = 12 سم (مسألة 6 ص 256)
  if (/AB\s*=\s*AC\s*=\s*15.*BC\s*=\s*18|BD\s*=\s*9.*AD\s*=\s*12/i.test(d)) {
    return buildIsoscelesAltitudePythagoras12Figure({ figureId, notationLanguage });
  }

  // 3. برج اتصالات بسلكين متساويين وقاعدة 19 م و (2X-3) م لحساب X = 11 وزاوية y = 50° (مسألة 17 ص 258)
  if (/برج\s*اتصالات.*سلكين|19\s*م.*2X\s*-\s*3|قيمة\s*كل\s*من\s*X\s*،\s*y.*50°/i.test(d)) {
    return buildTowerSymmetricCablesFigure({ figureId, notationLanguage });
  }

  // 4. شبه منحرف بتوازي AD // BC و MB = MC لإثبات محور تماثل مشترك (مسألة 15 ص 258)
  if (/MB\s*=\s*MC.*AD\s*\/\/\s*BC|محور\s*تماثل\s*AMD\s*هو\s*نفسه\s*محور\s*تماثل\s*BMC/i.test(d)) {
    return buildTrapezoidButterflyCommonAxisFigure({ figureId, notationLanguage });
  }

  // 5. مثلث ثلاثيني ستيني بوتر 16 سم وضلع مقابل 5X-2 لحساب X = 2 ومساحة 32√3 سم² (مسألة 19 ص 259)
  if (/5X\s*-\s*2.*16\s*سم|32√3|ثلاثيني\s*ستيني.*5X\s*-\s*2/i.test(d)) {
    return buildThirtySixtyNinetyAlgebraicHypotenuseFigure({ figureId, notationLanguage });
  }

  // 6. مثلث ثلاثيني ستيني ABC مع مثلث ADC وقطعة FE = 6 سم لحساب BC = 6 سم (مسألة 20 ص 259)
  if (/FE\s*=\s*6.*CAB\s*=\s*30°|FE\s*=\s*6.*طول\s*BC\s*=\s*6/i.test(d)) {
    return buildThirtySixtyNinetySharedHypotenuseMidsegmentFigure({ figureId, notationLanguage });
  }

  // 7. مثلث ثلاثيني ستيني بوتر 12 سم ومتوسطين يلتقيان في G لإيجاد AB = 6 و EG = 2 سم (مسألة 23 ص 259)
  if (/AC\s*=\s*12.*C\s*=\s*30°.*EG|AB\s*=\s*6.*EG\s*=\s*2/i.test(d)) {
    return buildThirtySixtyNinetyMediansGFigure({ figureId, notationLanguage });
  }

  // 8. متساوي الساقين بارتفاع AD ⊥ BC وزاوية BAD = 30° وقاعدة 9 سم لحساب AD = 9/2 √3 سم (مسألة 22 ص 259)
  if (/BAD\s*=\s*30°.*BC\s*=\s*9|9\/2\s*√3/i.test(d)) {
    return buildIsoscelesAltitudeThirtyDegreeFigure({ figureId, notationLanguage });
  }

  // 9. شكل دلتون XAYB بأضلاع 15 و 13 سم ومحور تماثل بأجزاء 10 و (5+n) لحساب n = 5 (مسألة 10 ص 257)
  if (/15\s*سم.*13\s*سم.*5\s*\+\s*n|n\s*=\s*5.*15\s*سم.*13\s*سم/i.test(d)) {
    return buildDeltoidAxisOfSymmetryAlgebraicFigure({ figureId, notationLanguage });
  }

  // 10. مثلثان متساويا الساقين بقاعدة مشتركة لإثبات أن AD محور تماثل BC (مسألة 13 ص 257)
  if (/AB\s*=\s*AC.*ABD\s*=\s*ACD.*محور\s*تماثل|AD\s*هو\s*محور\s*تماثل\s*BC/i.test(d)) {
    return buildSharedBaseIsoscelesAxisProofFigure({ figureId, notationLanguage });
  }

  // 11. خماسي متماثل ABCDE بضلعين متساويين ومنتصف F لإثبات تعامد BF ⊥ DE (مسألة 16 ص 258)
  if (/AE\s*=\s*CD.*AB\s*=\s*BC.*BF\s*⊥\s*DE|BF\s*⊥\s*DE/i.test(d)) {
    return buildPentagonPerpendicularAxisProofFigure({ figureId, notationLanguage });
  }

  // 12. مطابقة عامة للمثلث الثلاثيني الستيني أو تابع المتساوي الساقين
  if (/(?:المثلث\s*)?ثلاثيني\s*ستيني|30°.*60°.*90°|محور\s*تماثل\s*المثلث\s*المتساوي\s*الساقين/i.test(d)) {
    return buildThirtySixtyNinetyAlgebraicHypotenuseFigure({ figureId, notationLanguage });
  }

  return undefined;
}
