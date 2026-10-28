"use client";

/**
 * @file use-flow-staging-live-measurer.ts
 * @description قياس حي لمنصة القياس الخفية: يقرأ ارتفاع كل كائن تدفق (data-flow-item-id) والترويسة والتذييل (data-flow-chrome)
 * ويعيد القياس تلقائياً عبر ResizeObserver كلما تغيّر حجم أي عنصر لأي سبب (تبديل وضع الإجابات، مساحة الحل، الخط، الأرقام،
 * تحميل الخطوط أو الشعار). كان القياس السابق يعتمد على قائمة اعتماديات يدوية فينسى بعض الإعدادات فتبقى ارتفاعات قديمة وتنكسر الصفحات.
 */

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import type { FlowChromeHeightsPx } from "./flow-page-budget-resolver";

export const MODULE_ID_USE_FLOW_STAGING_LIVE_MEASURER = "use_flow_staging_live_measurer" as const;

export interface FlowMeasureSnapshot {
  readonly heights: ReadonlyMap<string, number>;
  readonly chrome: FlowChromeHeightsPx | undefined;
}

const EMPTY_SNAPSHOT: FlowMeasureSnapshot = { heights: new Map(), chrome: undefined };
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function readNodeHeightPx(node: HTMLElement): number {
  return Math.ceil(node.getBoundingClientRect().height);
}

function isSameSnapshot(a: FlowMeasureSnapshot, b: FlowMeasureSnapshot): boolean {
  if (a.heights.size !== b.heights.size) return false;
  for (const [id, h] of b.heights) if (a.heights.get(id) !== h) return false;
  return (
    a.chrome?.firstHeaderPx === b.chrome?.firstHeaderPx &&
    a.chrome?.runningHeaderPx === b.chrome?.runningHeaderPx &&
    a.chrome?.footerPx === b.chrome?.footerPx
  );
}

function readSnapshot(container: HTMLElement): FlowMeasureSnapshot {
  const heights = new Map<string, number>();
  container.querySelectorAll<HTMLElement>("[data-flow-item-id]").forEach((node) => {
    const id = node.getAttribute("data-flow-item-id");
    if (id) heights.set(id, readNodeHeightPx(node));
  });
  const chromeOf = (name: string) => {
    const node = container.querySelector<HTMLElement>(`[data-flow-chrome="${name}"]`);
    return node ? readNodeHeightPx(node) : 0;
  };
  return {
    heights,
    chrome: { firstHeaderPx: chromeOf("first"), runningHeaderPx: chromeOf("running"), footerPx: chromeOf("footer") },
  };
}

/** @param observeKey يتغيّر كلما تغيّرت مجموعة العقد المقاسة (قائمة الكائنات) ليُعاد ربط المراقب. */
export function useFlowStagingLiveMeasurer(
  stagingRef: RefObject<HTMLDivElement | null>,
  observeKey: unknown
): FlowMeasureSnapshot {
  const [snapshot, setSnapshot] = useState<FlowMeasureSnapshot>(EMPTY_SNAPSHOT);
  const frameRef = useRef<number>(0);

  useIsomorphicLayoutEffect(() => {
    const container = stagingRef.current;
    if (!container) return;

    const measure = () => {
      const next = readSnapshot(container);
      setSnapshot((prev) => (isSameSnapshot(prev, next) ? prev : next));
    };
    const schedule = () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(measure);
    };

    measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    container.querySelectorAll<HTMLElement>("[data-flow-item-id], [data-flow-chrome]").forEach((n) => observer?.observe(n));
    document.fonts?.ready.then(schedule).catch(() => {});
    container.addEventListener("load", schedule, true);

    return () => {
      observer?.disconnect();
      container.removeEventListener("load", schedule, true);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [stagingRef, observeKey]);

  return snapshot;
}
