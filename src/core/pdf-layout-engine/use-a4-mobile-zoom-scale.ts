"use client";

/**
 * @file use-a4-mobile-zoom-scale.ts
 * @description خطّاف معامل التحجيم التلقائي لورقة A4 (794px) على الهاتف: `scale = (عرض الحاوية - 16) / 794`
 * بحد أدنى 0.42، ويبقى 1 على الشاشات العريضة (≥ 820px).
 */

import { useEffect, useState } from "react";
import type React from "react";

export const MODULE_ID_USE_A4_MOBILE_ZOOM_SCALE = "use_a4_mobile_zoom_scale" as const;

export function useA4MobileZoomScale(viewportRef: React.RefObject<HTMLDivElement | null>): number {
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const update = () => {
      const width = viewportRef.current?.clientWidth || window.innerWidth;
      setScale(width < 820 ? Number(Math.max(0.42, Math.min(1, (width - 16) / 794)).toFixed(2)) : 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [viewportRef]);

  return scale;
}
