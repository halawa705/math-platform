/**
 * @file flow-page-segments-builder.ts
 * @description يحوّل شريحة متصلة من الكائنات إلى مقاطع صفحة: الكائنات ذات العرض الكامل تُكدَّس رأسياً، والأسئلة المتتالية بعرض العمود
 * تُجمَّع في مقطع أعمدة متوازن (يمين ثم يسار). يحافظ على ثنائية العمودين للأمثلة المحلولة والتدريبات والواجب مع تدفق مرن
 * للتدريب أسفل المثال الأقصر عند التفاوت الكبير في الطول، دون تمديد عرض كامل عشوائي يفسد تخطيط الصفحة.
 */

import { solveBalancedColumnSplit, stackHeightPx } from "./flow-column-balance-solver";
import { fullWidthHeightKey, type FlowItem, type FlowPageSegment } from "./flow-item-model";

export const MODULE_ID_FLOW_PAGE_SEGMENTS_BUILDER = "flow_page_segments_builder" as const;

export type FlowHeightLookup = (item: FlowItem) => number;

/** فرق الارتفاع الأدنى (px) بين المثال الأيمن والأيسر لامتصاص تدريب لاحق أسفل المثال الأقصر. */
const ASYMMETRIC_PAIR_ABSORB_THRESHOLD_PX = 85;
const ASYMMETRIC_MIN_GAIN_PX = 20;
const ASYMMETRIC_MAX_OVERSHOOT_PX = 35;

function evaluateColumnsOption(
  subGroup: readonly FlowItem[],
  heightOf: FlowHeightLookup,
  gapPx: number,
  stretchRoomOf: (item: FlowItem) => number
): {
  readonly segment: FlowPageSegment;
  readonly heightPx: number;
  readonly unabsorbedPx: number;
} {
  const split = solveBalancedColumnSplit(subGroup.map(heightOf), gapPx);
  const right = subGroup.slice(0, split.rightCount);
  const left = subGroup.slice(split.rightCount);
  const rightH = stackHeightPx(right.map(heightOf), gapPx);
  const leftH = stackHeightPx(left.map(heightOf), gapPx);
  const shorter = rightH < leftH ? right : left;
  const absorbable = shorter.reduce((sum, g) => sum + stretchRoomOf(g), 0);
  const unabsorbedPx = Math.max(0, Math.abs(rightH - leftH) - absorbable);
  return {
    segment: { kind: "columns", rightItems: right, leftItems: left, heightPx: split.heightPx },
    heightPx: split.heightPx,
    unabsorbedPx,
  };
}

function isSiblingColumnQuestion(a: FlowItem, b: FlowItem | undefined): boolean {
  if (a.kind !== "question" || b?.kind !== "question") return false;
  if (b.span !== "column" || b.isWorkedExample) return false;
  if (Boolean(a.isAnswerCard) !== Boolean(b.isAnswerCard)) return false;
  if (a.ideaIndex === b.ideaIndex) return true;
  return (
    (a.question.id.includes("-hw-") && b.question.id.includes("-hw-")) ||
    (a.question.id.startsWith("booklet-s2-") && b.question.id.startsWith("booklet-s2-"))
  );
}

export function buildSegmentsForSlice(
  items: readonly FlowItem[],
  heightOf: FlowHeightLookup,
  fullWidthHeights: ReadonlyMap<string, number>,
  gapPx: number,
  stretchRoomOf: (item: FlowItem) => number,
  nextItemAfterPage?: FlowItem
): readonly FlowPageSegment[] {
  const segments: FlowPageSegment[] = [];
  let group: FlowItem[] = [];

  const closeGroup = (followingItem: FlowItem | undefined) => {
    if (group.length === 0) return;

    // أ) ثنائية الأمثلة المحلولة في الفكرة: المثال ١ يميناً والمثال ٢ يساراً متجاورين، مع تدفق مرن أسفل الأقصر عند التفاوت
    if (
      group.length >= 2 &&
      group[0].kind === "question" &&
      group[0].isWorkedExample &&
      group[1].kind === "question" &&
      group[1].isWorkedExample &&
      group[0].ideaIndex !== undefined &&
      group[0].ideaIndex === group[1].ideaIndex
    ) {
      const exRight = group[0];
      const exLeft = group[1];
      const hRight = heightOf(exRight);
      const hLeft = heightOf(exLeft);
      const absorbed: FlowItem[] = [];
      let leftStackH = hLeft;

      if (hRight - hLeft > ASYMMETRIC_PAIR_ABSORB_THRESHOLD_PX && group.length >= 3) {
        for (const cand of group.slice(2)) {
          if (
            cand.kind !== "question" ||
            cand.isWorkedExample ||
            cand.solutionSlice ||
            cand.ideaIndex !== exRight.ideaIndex
          ) {
            break;
          }
          const nextLeftH = leftStackH + gapPx + heightOf(cand);
          if (nextLeftH > hRight + ASYMMETRIC_MAX_OVERSHOOT_PX) break;
          if (Math.abs(hRight - leftStackH) - Math.abs(hRight - nextLeftH) < ASYMMETRIC_MIN_GAIN_PX) break;
          absorbed.push(cand);
          leftStackH = nextLeftH;
        }
      }

      segments.push({
        kind: "columns",
        rightItems: [exRight],
        leftItems: [exLeft, ...absorbed],
        heightPx: Math.max(hRight, leftStackH),
      });

      const remainder = group.slice(2 + absorbed.length);
      group = [];
      if (remainder.length > 0) {
        group = [...remainder];
        closeGroup(followingItem);
      }
      return;
    }

    // ب) سؤال فردي يتيم: يُسمح بعرض كامل فقط إذا كان آخر تدريب فعلي في نهاية الفكرة/القسم (وليس مسروقاً قبل شقيقه)
    if (group.length === 1) {
      const sole = group[0];
      const fullH = fullWidthHeights.get(fullWidthHeightKey(sole.id));
      const isSolitaryIdeaEnd =
        sole.kind === "question" &&
        !sole.isWorkedExample &&
        !sole.solutionSlice &&
        !isSiblingColumnQuestion(sole, followingItem);
      if (isSolitaryIdeaEnd && fullH !== undefined) {
        segments.push({ kind: "full", item: sole, heightPx: fullH });
      } else {
        segments.push({ kind: "columns", rightItems: [sole], leftItems: [], heightPx: heightOf(sole) });
      }
      group = [];
      return;
    }

    // ج) مجموعة من سؤالين فأكثر: تبقى دائماً بنظام العمودين المتجاورين، مع استثناء الذيل الفردي الحقيقي في نهاية الفكرة فقط
    const pureCols = evaluateColumnsOption(group, heightOf, gapPx, stretchRoomOf);
    let bestSegments: readonly FlowPageSegment[] = [pureCols.segment];

    const hasWorkedOrSliced = group.some((g) => g.kind === "question" && (g.isWorkedExample || g.solutionSlice));
    if (
      group.length >= 3 &&
      group.length % 2 === 1 &&
      !hasWorkedOrSliced &&
      !isSiblingColumnQuestion(group[group.length - 1], followingItem)
    ) {
      const lastIdx = group.length - 1;
      const tailFullH = fullWidthHeights.get(fullWidthHeightKey(group[lastIdx].id));
      if (pureCols.unabsorbedPx > 68 && tailFullH !== undefined) {
        const headCols = evaluateColumnsOption(group.slice(0, lastIdx), heightOf, gapPx, stretchRoomOf);
        const tailHybridH = headCols.heightPx + gapPx + tailFullH;
        const tailHybridScore = tailHybridH + headCols.unabsorbedPx * 1.35;
        const pureScore = pureCols.heightPx + pureCols.unabsorbedPx * 1.35;
        if (tailHybridH <= pureCols.heightPx + 12 && tailHybridScore < pureScore - 4) {
          bestSegments = [headCols.segment, { kind: "full", item: group[lastIdx], heightPx: tailFullH }];
        }
      }
    }

    segments.push(...bestSegments);
    group = [];
  };

  for (const item of items) {
    if (item.kind === "question" && item.span === "column") {
      group.push(item);
    } else {
      closeGroup(item);
      segments.push({ kind: "full", item, heightPx: heightOf(item) });
    }
  }
  closeGroup(nextItemAfterPage);
  return segments;
}

function segmentHeightPx(segment: FlowPageSegment, heightOf: FlowHeightLookup, gapPx: number): number {
  if (segment.kind === "full") return segment.heightPx;
  return Math.max(
    stackHeightPx(segment.rightItems.map(heightOf), gapPx),
    stackHeightPx(segment.leftItems.map(heightOf), gapPx)
  );
}

export function pageContentHeightPx(
  segments: readonly FlowPageSegment[],
  heightOf: FlowHeightLookup,
  gapPx: number
): number {
  return stackHeightPx(segments.map((s) => segmentHeightPx(s, heightOf, gapPx)), gapPx);
}

/** مجموع عدم تساوي الأعمدة (px) في مقاطع الأعمدة — يُستخدم للمفاضلة بين التوزيعات وللتدقيق. */
export function columnsImbalancePx(
  segments: readonly FlowPageSegment[],
  heightOf: FlowHeightLookup,
  gapPx: number
): number {
  return segments.reduce((sum, s) => {
    if (s.kind !== "columns") return sum;
    return sum + Math.abs(stackHeightPx(s.rightItems.map(heightOf), gapPx) - stackHeightPx(s.leftItems.map(heightOf), gapPx));
  }, 0);
}
