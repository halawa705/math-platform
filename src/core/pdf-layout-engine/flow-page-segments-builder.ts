/**
 * @file flow-page-segments-builder.ts
 * @description يحوّل شريحة متصلة من الكائنات إلى مقاطع صفحة: الكائنات ذات العرض الكامل تُكدَّس رأسياً، والأسئلة المتتالية بعرض العمود
 * تُجمَّع في مقطع أعمدة متوازن (يمين ثم يسار). البطاقة مرنة العرض: السؤال الوحيد في المجموعة، أو مجموعة لا يمتصّ التمديدُ تفاوتَ
 * عمودَيها وتكون أقصر إن عُرضت بعرض الصفحة، تُعرض كبطاقات بعرض كامل بدل أن تترك فراغاً في أحد العمودين.
 */

import { solveBalancedColumnSplit, stackHeightPx } from "./flow-column-balance-solver";
import { fullWidthHeightKey, type FlowItem, type FlowPageSegment } from "./flow-item-model";

export const MODULE_ID_FLOW_PAGE_SEGMENTS_BUILDER = "flow_page_segments_builder" as const;

export type FlowHeightLookup = (item: FlowItem) => number;

/** أقصى تفاوت (px) بين العمودين يُقبل بعد التمديد قبل التحول إلى بطاقات بعرض كامل أو هجين. */
const UNABSORBED_IMBALANCE_TOLERANCE_PX = 42;

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

export function buildSegmentsForSlice(
  items: readonly FlowItem[],
  heightOf: FlowHeightLookup,
  fullWidthHeights: ReadonlyMap<string, number>,
  gapPx: number,
  stretchRoomOf: (item: FlowItem) => number
): readonly FlowPageSegment[] {
  const segments: FlowPageSegment[] = [];
  let group: FlowItem[] = [];

  const closeGroup = () => {
    if (group.length === 0) return;

    // حالة خاصة لثنائية الأمثلة المحلولة في الفكرة: المثال ١ يميناً والمثال ٢ يساراً متجاورين
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
      const pairHeight = Math.max(heightOf(exRight), heightOf(exLeft));
      segments.push({
        kind: "columns",
        rightItems: [exRight],
        leftItems: [exLeft],
        heightPx: pairHeight,
      });

      const remainder = group.slice(2);
      group = [];
      if (remainder.length > 0) {
        group = [...remainder];
        closeGroup();
      }
      return;
    }

    const fullHeights = group.map((g) => fullWidthHeights.get(fullWidthHeightKey(g.id)));
    const canGoFull = fullHeights.every((h): h is number => h !== undefined);

    if (canGoFull && group.length === 1) {
      segments.push({ kind: "full", item: group[0], heightPx: fullHeights[0] as number });
      group = [];
      return;
    }

    const pureCols = evaluateColumnsOption(group, heightOf, gapPx, stretchRoomOf);
    let bestSegments: readonly FlowPageSegment[] = [pureCols.segment];
    let bestScore = pureCols.heightPx + pureCols.unabsorbedPx * 1.35;

    if (canGoFull) {
      const stackH = stackHeightPx(fullHeights as number[], gapPx);
      const fullStackSegments: FlowPageSegment[] = group.map((g, i) => ({
        kind: "full",
        item: g,
        heightPx: fullHeights[i] as number,
      }));
      if (
        stackH <= pureCols.heightPx - 64 ||
        (pureCols.unabsorbedPx > UNABSORBED_IMBALANCE_TOLERANCE_PX + 24 && stackH < bestScore - 24)
      ) {
        bestSegments = fullStackSegments;
        bestScore = stackH;
      }

      if (group.length >= 3) {
        // خيار هجين ١: البطاقة الأولى بعرض كامل + الباقي في عمودين متوازنين
        const headFullH = fullHeights[0] as number;
        const tailCols = evaluateColumnsOption(group.slice(1), heightOf, gapPx, stretchRoomOf);
        const headHybridH = headFullH + gapPx + tailCols.heightPx;
        const headHybridScore = headHybridH + tailCols.unabsorbedPx * 1.35;
        if (headHybridH <= pureCols.heightPx + 12 && headHybridScore < bestScore - 4) {
          bestSegments = [{ kind: "full", item: group[0], heightPx: headFullH }, tailCols.segment];
          bestScore = headHybridScore;
        }

        // خيار هجين ٢: البداية في عمودين متوازنين + البطاقة الأخيرة بعرض كامل
        const lastIdx = group.length - 1;
        const tailFullH = fullHeights[lastIdx] as number;
        const headCols = evaluateColumnsOption(group.slice(0, lastIdx), heightOf, gapPx, stretchRoomOf);
        const tailHybridH = headCols.heightPx + gapPx + tailFullH;
        const tailHybridScore = tailHybridH + headCols.unabsorbedPx * 1.35;
        if (tailHybridH <= pureCols.heightPx + 12 && tailHybridScore < bestScore - 4) {
          bestSegments = [headCols.segment, { kind: "full", item: group[lastIdx], heightPx: tailFullH }];
          bestScore = tailHybridScore;
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
      closeGroup();
      segments.push({ kind: "full", item, heightPx: heightOf(item) });
    }
  }
  closeGroup();
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
