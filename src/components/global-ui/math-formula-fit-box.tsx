"use client";

/**
 * @file math-formula-fit-box.tsx
 * @description صندوق ملاءمة المعادلة: كائن مرن يقيس عرض معادلته الفعلي مقابل عرض حاويته ويقرّر تلقائياً:
 * (1) يصغّر الخط بدرجات حتى 78% (2) إن لم يكفِ يسمح بكسر المعادلة عند علامات العلاقة والعمليات
 * (3) لا تخرج المعادلة عن حدود العمود أبداً. يُعاد الضبط عند تغيّر العرض أو بعد تحميل الخطوط.
 */

import { useEffect, useLayoutEffect, useRef } from "react";

export const MODULE_ID_MATH_FORMULA_FIT_BOX = "math_formula_fit_box" as const;

const FIT_SCALE_STEPS_DESCENDING: readonly number[] = [1, 0.92, 0.85, 0.78];
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface MathFormulaFitBoxProps {
  readonly html: string;
  readonly isBlock?: boolean;
}

function fitFormulaIntoContainer(box: HTMLElement): void {
  box.classList.remove("math-fit-wrap");
  for (const scale of FIT_SCALE_STEPS_DESCENDING) {
    box.style.fontSize = scale === 1 ? "" : `${scale}em`;
    if (box.scrollWidth <= box.clientWidth + 1) return;
  }
  box.classList.add("math-fit-wrap");
}

export default function MathFormulaFitBox({ html, isBlock = false }: MathFormulaFitBoxProps) {
  const boxRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const refit = () => fitFormulaIntoContainer(box);
    refit();
    const observer = typeof ResizeObserver !== "undefined" && box.parentElement
      ? new ResizeObserver(refit)
      : null;
    if (observer && box.parentElement) observer.observe(box.parentElement);
    document.fonts?.ready.then(refit).catch(() => {});
    return () => observer?.disconnect();
  }, [html]);

  return (
    <bdi
      dir="ltr"
      style={{ unicodeBidi: "isolate" }}
      className={isBlock ? "block w-full" : "inline-block max-w-full align-middle"}
    >
      <span
        ref={boxRef}
        className="math-fit-box inline-block max-w-full overflow-hidden align-middle font-bold"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </bdi>
  );
}
