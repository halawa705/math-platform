/**
 * @file prep-grade1-parallelism-catalog.ts
 * @description منسق ومطابق أشكال درس التوازي للصف الأول الإعدادي (الوحدة 3 - الدرس 3).
 * يغطي كافة الأفكار النموذجية لمذكرة الشرح والامتحانات (التبادل والتناظر والتداخل والزوايا المنكسرة وبراهين التوازي والتطبيقات المركبة).
 * @invariant يلتزم بحدود الأسطر (< 250 سطراً) وTypeScript الصارم وفق دستور المنصة (AGENTS.md).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import {
  buildParallelCorrespondingAnglesFigure,
  buildParallelAlternateAnglesFigure,
  buildParallelConsecutiveInteriorAnglesFigure,
  buildParallelAlgebraicAlternate3X15Figure,
  buildParallelAlgebraicCorresponding9XFigure,
  buildParallelTransversalAlternateGHFigure,
  buildParallelConsecutiveInteriorBCFigure,
} from "./prep-grade1-parallel-basic-transversal-builder";
import {
  buildParallelBrokenZigzagClassicFigure,
  buildParallelBrokenThreeRaysAEC130Figure,
  buildParallelBrokenRightAngleFigure,
  buildParallelBrokenReflexAlgebraicFigure,
  buildParallelBrokenZigzag40And25Figure,
  buildParallelBrokenThreeRays45And130Figure,
} from "./prep-grade1-parallel-broken-zigzag-builder";
import {
  buildParallelProofTransversalZFigure,
  buildParallelProofConsecutiveInteriorFigure,
  buildParallelTwoVariablesXYFigure,
  buildParallelNonParallelCheckFigure,
  buildParallelProofAlternate55And125Figure,
  buildParallelProofCorresponding110Figure,
} from "./prep-grade1-parallel-proof-conditions-builder";
import { buildParallelTransversalParametricFromDescription } from "./prep-grade1-parallel-transversal-parametric-builder";
import { normalizeParallelismArabicLettersToLatin } from "./prep-grade1-parallelism-arabic-letters-normalizer";
import {
  buildParallelBisectorCorrespondingFigure,
  buildParallelPerpendicularTransversalFigure,
} from "./prep-grade1-parallel-applications-builder";

export function matchPrepGrade1ParallelismFigure(
  arabicDescription: string,
  figureId = "prep1_parallel_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = normalizeParallelismArabicLettersToLatin((arabicDescription || "").trim());
  if (!d) return undefined;

  // حماية: استبعاد المضلعات والرباعيات ونظريات 2ع و 3ع كي لا يحدث التباس في السجل الموحد
  if (/شكل\s*رباعي|متوازي\s*الأضلاع|متوازي\s*اضلاع|مستطيل|مربع|معين|شبه\s*منحرف|سداسي|خماسي|معادلة|إحداثي|l3|l4|أربعة\s*مستقيمات|متوسطات|مثلث.*قائم/i.test(d)) {
    return undefined;
  }

  // 0. رسم بارامتري عام: مستقيمان متوازيان وقاطع في نقطتين مع زوايا معطاة (عددية/جبرية) بأي أسماء نقاط
  const parametricFig = buildParallelTransversalParametricFromDescription(d, figureId, notationLanguage);
  if (parametricFig) return parametricFig;

  // 1. مثال 1 ص 1 ومسائل التبادل الجبري: AB // CD وقاطع EF في G و H مع (9x-5)° و (5x+15)°
  if (
    /(?:AGH|GHD|قاطع.*[GH]|قاطع.*[Gز].*[Hح]|تبادل.*(?:AGH|GHD)|متبادلتان.*(?:AGH|GHD)|EF\s*قاطعاً.*[GH])/i.test(d) ||
    (/(?:9[xX]\s*-\s*5.*5[xX]\s*\+\s*15|5[xX]\s*\+\s*15.*9[xX]\s*-\s*5)/i.test(d) && !/تناظر|متناظر/i.test(d))
  ) {
    return buildParallelTransversalAlternateGHFigure({ figureId, notationLanguage });
  }

  // 2. مثال 2 ص 2: توازي وتداخل حرف U: مستقيمان BA // CD وقاطع BC مع زاوية داخلة 60°
  if (/(?:BA\s*(?:\/\/|\\parallel|\|\|)\s*CD.*BC|BC\s*قاطع.*(?:BA|CD)|BA.*CD.*BC.*داخلة|BC.*قاطع.*داخلة)/i.test(d)) {
    return buildParallelConsecutiveInteriorBCFigure({ figureId, notationLanguage, degC: 60 });
  }

  // 3. مثال 3 ص 2: AB // DE مع زاوية منكسرة عند C من CA و CD و 40° و 25° لحساب ∠ACE = 65°
  if (/(?:AB\s*(?:\/\/|\\parallel|\|\|)\s*DE.*(?:40|25)|40°.*25°|25°.*40°|CAB.*40.*CDE.*25|ACE.*40.*25)/i.test(d)) {
    return buildParallelBrokenZigzag40And25Figure({ figureId, notationLanguage, degA: 40, degD: 25 });
  }

  // 4. مثال 4 ص 3: AB // CD مع نقطة E تقع بين المستقيمين و 45° و 130° لحساب AEC = 95°
  if (/(?:E\s*تقع\s*بين|تقع\s*بين\s*المستقيمين|45°.*130°|130°.*45°|AEC.*45.*130|A\s*=\s*45°.*C\s*=\s*130°)/i.test(d)) {
    return buildParallelBrokenThreeRays45And130Figure({ figureId, notationLanguage, degA: 45, degC: 130 });
  }

  // 5. مثال 5 ص 3: إثبات AB // CD بمعلومية CA // BE مع 125° و 55° و 55°
  if (/(?:CA\s*(?:\/\/|\\parallel|\|\|)\s*BE|125°.*55°.*55°|55°.*55°.*125°|CA.*BE.*125|CA.*BE.*55)/i.test(d)) {
    return buildParallelProofAlternate55And125Figure({ figureId, notationLanguage, degC: 125, degB: 55, degA: 55 });
  }

  // 6. مثال 6 ص 4: إثبات AB // CD بمعلومية قاطع EC مع زاويتي تناظر 110° و 110°
  if (/(?:EC\s*يقطع.*AB.*CD|EBA.*110.*BCD.*110|110°.*110°.*تناظر|EC.*قاطع.*110)/i.test(d)) {
    return buildParallelProofCorresponding110Figure({ figureId, notationLanguage, degEBA: 110, degBCD: 110 });
  }

  // 7. مثال 7 ص 5: AB // CD مع منصف الزاوية BF حيث FBA = 55° و DCB = (2x+10)° بالتناظر
  if (/(?:BF\s*ينصف.*EBA|ينصف.*EBA.*55|FBA.*55°.*(?:2[xX]|DCB)|2[xX]\s*\+\s*10.*55°)/i.test(d)) {
    return buildParallelBisectorCorrespondingFigure({ figureId, notationLanguage, degFBA: 55 });
  }

  // 8. مثال 8 ص 5: نظرية المستقيم العمودي على أحد مستقيمين متوازيين l1 // l2 و n ⊥ l1
  if (
    /(?:(?:l1|l_1)\s*(?:\/\/|\\parallel|\|\|)\s*(?:l2|l_2).*(?:⊥|عمود)|n\s*⊥\s*(?:l1|l_1)|عمود(?:ياً|ي)?\s*على\s*أحد\s*مستقيمين\s*متوازيين|المستقيمان\s*الموازيان\s*لثالث)/i.test(d)
  ) {
    return buildParallelPerpendicularTransversalFigure({ figureId, notationLanguage });
  }

  // 9. مسألة 10 ص 194: AB // CD و EF // CD مع A = 70° و C = 120° لإيجاد AEC = 130°
  if (/AEC.*130|AB\s*\/\/\s*CD.*EF\s*\/\/\s*CD.*70°.*120°|70°.*120°.*AEC/i.test(d)) {
    return buildParallelBrokenThreeRaysAEC130Figure({ figureId, notationLanguage });
  }

  // 10. مسألة 11 ص 194: AB // EF مع D = 100° و E = 115° و DAE = 35° لإثبات AB // DC
  if (/AB\s*\/\/\s*EF.*100°.*115°.*35°|DAE\s*=\s*35°.*AB\s*\/\/\s*DC/i.test(d)) {
    return buildParallelProofTransversalZFigure({ figureId, notationLanguage });
  }

  // 11. مسألة 14-6 ص 196: زاوية منعكسة جبرية (6X+40)° = 280° مع 30° و 50° لإيجاد X = 40°
  if (/6X\s*\+\s*40|منعكسة.*6X\s*\+\s*40|30°.*50°.*6X\s*\+\s*40/i.test(d)) {
    return buildParallelBrokenReflexAlgebraicFigure({ figureId, notationLanguage });
  }

  // 12. مسألة 14-3 ص 196: زاوية منكسرة قائمة 90° مع 40° لحساب X = 50°
  if (/منكسرة\s*قائمة|قائمة.*40°.*X|40°.*90°.*X.*توازي/i.test(d)) {
    return buildParallelBrokenRightAngleFigure({ figureId, notationLanguage });
  }

  // 13. مسألة 5-1 ص 192: زاوية منكسرة كلاسيكية بين متوازيين 40° و 55° لحساب X = 95°
  if (/40°.*55°.*X|منكسرة.*40°.*55°/i.test(d)) {
    return buildParallelBrokenZigzagClassicFigure({ figureId, notationLanguage });
  }

  // 14. مسألة 7-1 ص 193: إثبات AB // CD بزاويتين داخلتين 100° + 80° = 180°
  if (/100°.*80°.*AB\s*\/\/\s*CD|لماذا\s*يكون\s*AB\s*\/\/\s*CD.*100|100°.*80°.*داخلتان/i.test(d)) {
    return buildParallelProofConsecutiveInteriorFigure({ figureId, notationLanguage });
  }

  // 15. مسألة 9 ص 193: BA // CD مع B = 80° و C = 2y° و D = X° لحساب y = 50° و X = 80°
  if (/BA\s*\/\/\s*CD.*80°.*2y|2y.*X.*BA\s*\/\/\s*CD|B\s*=\s*80°.*2y.*X/i.test(d)) {
    return buildParallelTwoVariablesXYFigure({ figureId, notationLanguage });
  }

  // 16. مسألة 6-1 ص 193: اختبار هل p // q أم لا مع زاويتين 57° و 122°
  if (/هل\s*p\s*\/\/\s*q|57°.*122°.*هل/i.test(d)) {
    return buildParallelNonParallelCheckFigure({ figureId, notationLanguage });
  }

  // 17. شكل 4-7 ص 192: توازي وتبادل جبري (3X+15)° = 75° لإيجاد X = 20°
  if (/3X\s*\+\s*15.*75°|75°.*3X\s*\+\s*15/i.test(d)) {
    return buildParallelAlgebraicAlternate3X15Figure({ figureId, notationLanguage });
  }

  // 18. شكل 4-8 ص 192: توازي وتناظر جبري (9X-5)° = (5X+15)° بالتناظر لإيجاد X = 5°
  if (/9X\s*-\s*5.*5X\s*\+\s*15.*تناظر|تناظر.*9X\s*-\s*5/i.test(d)) {
    return buildParallelAlgebraicCorresponding9XFigure({ figureId, notationLanguage });
  }

  // 19. شكل 3-2 ص 191: تداخل حرف U زاويتان داخلتان 70° و 110°
  if (/(?:توازي|متوازي|جهة\s*واحدة|حرف\s*U).*داخلتان.*70°|داخلتان.*70°.*(?:توازي|متوازي)|تداخل.*70°|110°.*70°.*تداخل/i.test(d)) {
    return buildParallelConsecutiveInteriorAnglesFigure({ figureId, notationLanguage });
  }

  // 20. شكل 3-3 ص 191: تبادل حرف Z بزاوية 64°
  if (/تبادل.*64°|Z.*64°|64°.*تبادل.*X/i.test(d)) {
    return buildParallelAlternateAnglesFigure({ figureId, notationLanguage });
  }

  // 21. شكل 3-1 ص 191: تناظر حرف F بزاوية 63°
  if (/تناظر.*63°|F.*63°|63°.*تناظر/i.test(d)) {
    return buildParallelCorrespondingAnglesFigure({ figureId, notationLanguage });
  }

  // 22. مطابقة عامة للتوازي في أولى إعدادي
  if (/(?:التوازي|مستقيم(?:ان|ين|ات)?\s*(?:ال)?متوازي(?:ان|ين|ة)?)/i.test(d) && !/تطبيقات\s*التوازي/i.test(d)) {
    const degMatch = d.match(/(\d+(?:\.\d+)?)\s*°/);
    const deg = degMatch ? Number(degMatch[1]) : undefined;
    return buildParallelCorrespondingAnglesFigure({ figureId, notationLanguage, deg });
  }

  return undefined;
}
