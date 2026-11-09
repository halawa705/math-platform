/**
 * @file flow-elastic-fit-resolver.ts
 * @description محلل المرونة الميكروية للصفحات (Knuth-Plass Elastic Glue):
 * عندما يفيض المحتوى عن ميزانية الصفحة بفارق يسير (حتى 55px) نتيجة تكبير الخط لـ 12.5pt أو 13pt،
 * يحسب قدرة الصفحة على امتصاص الفائض تلقائياً عبر:
 * 1. ضغط المسافات البينية بين المقاطع (Gap Elasticity).
 * 2. الضغط الميكروي لحواشي بطاقات الأسئلة وخطوات الحل (Padding Elasticity).
 * 3. ضبط تحجيم الرسم الهندسي في العمودين بنسبة خفيفة (Diagram Elasticity).
 * هذا يمنع انهيار التوزيع وترحيل كتل كاملة بسبب بكسلات يسيرة، ويحافظ على استقرار الصفحة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطراً).
 */

import type { FlowItem, FlowPageSegment } from "./flow-item-model";

export const MODULE_ID_FLOW_ELASTIC_FIT_RESOLVER = "flow_elastic_fit_resolver" as const;

/** أقصى فيض بكسلي يمكن للمرونة الميكروية امتصاصه دون أي تشويه بصري (حوالي 12-15px لكل بطاقة في الصفحات متعددة المسائل). */
export const MAX_ELASTIC_ABSORPTION_LIMIT_PX = 90;

export interface ElasticFitResult {
  readonly fits: boolean;
  readonly absorbedPx: number;
  readonly adjustedGapPx: number;
  readonly totalElasticCapacityPx: number;
}

/**
 * يفحص قابلية مقطع الصفحة لامتصاص الفائض الطفيف بمرونة تامة.
 */
export function resolveElasticPageFit(params: {
  readonly segments: readonly FlowPageSegment[];
  readonly usedHeightPx: number;
  readonly budgetPx: number;
  readonly gapPx: number;
}): ElasticFitResult {
  const { segments, usedHeightPx, budgetPx, gapPx } = params;

  // إذا كان المحتوى يتسع في الميزانية دون الحاجة لأي مرونة
  if (usedHeightPx <= budgetPx) {
    return {
      fits: true,
      absorbedPx: 0,
      adjustedGapPx: gapPx,
      totalElasticCapacityPx: 0,
    };
  }

  const overflowPx = usedHeightPx - budgetPx;

  // 1. مرونة المسافات البينية بين المقاطع
  const segmentsCount = segments.length;
  const gapsCount = Math.max(0, segmentsCount - 1);
  const minSafeGapPx = 2;
  const gapSavings = gapsCount * Math.max(0, gapPx - minSafeGapPx);

  // 2. مرونة الحواشي والخطوات للبطاقات
  let questionCardsCount = 0;
  let diagramCardsCount = 0;

  for (const seg of segments) {
    const items: FlowItem[] = seg.kind === "full" ? [seg.item] : [...seg.rightItems, ...seg.leftItems];
    for (const it of items) {
      if (it.kind === "question") {
        questionCardsCount++;
        const q = it.question;
        if (q.geometryFigure || q.graphSpec || q.rawSvgMarkup) {
          diagramCardsCount++;
        }
      }
    }
  }

  const paddingSavings = Math.min(45, questionCardsCount * 6);
  const diagramSavings = Math.min(45, diagramCardsCount * 8);

  const totalElasticCapacityPx = Math.min(
    MAX_ELASTIC_ABSORPTION_LIMIT_PX,
    gapSavings + paddingSavings + diagramSavings
  );

  if (overflowPx <= totalElasticCapacityPx) {
    const gapDeduction = gapsCount > 0 ? Math.min(gapPx - minSafeGapPx, Math.ceil(overflowPx / gapsCount)) : 0;
    const adjustedGapPx = Math.max(minSafeGapPx, gapPx - gapDeduction);

    return {
      fits: true,
      absorbedPx: overflowPx,
      adjustedGapPx,
      totalElasticCapacityPx,
    };
  }

  return {
    fits: false,
    absorbedPx: 0,
    adjustedGapPx: gapPx,
    totalElasticCapacityPx,
  };
}
