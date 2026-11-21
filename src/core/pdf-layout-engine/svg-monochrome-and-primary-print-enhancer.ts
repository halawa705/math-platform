/**
 * @file svg-monochrome-and-primary-print-enhancer.ts
 * @description محسّن التباين الليزري للطباعة بالأبيض والأسود (بأنماط تهشير SVG متباينة بديلاً للألوان)
 * ومضاعفة سُمك الخطوط للمرحلة الابتدائية (14pt/15pt) دون الإخلال بالأبعاد الهندسية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 95 سطراً).
 */

export const MODULE_ID_SVG_MONOCHROME_AND_PRIMARY_PRINT_ENHANCER =
  "svg_monochrome_and_primary_print_enhancer" as const;

export interface SvgPrintEnhanceOptions {
  readonly monochromePrintSafe?: boolean;
  readonly strokeWidthMultiplier?: number;
}

const PRINT_HATCH_DEFS =
  `<defs data-print-hatch="1">` +
  `<pattern id="print_hatch_s1" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">` +
  `<rect width="6" height="6" fill="#1E293B" /><line x1="0" y1="0" x2="0" y2="6" stroke="#E2E8F0" stroke-width="1.6" /></pattern>` +
  `<pattern id="print_hatch_s2" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">` +
  `<rect width="6" height="6" fill="#F8FAFC" /><line x1="0" y1="0" x2="0" y2="6" stroke="#334155" stroke-width="1.8" /></pattern>` +
  `</defs>`;

export function enhanceQuestionFigureSvgForPrint(
  svg: string,
  opts: SvgPrintEnhanceOptions
): string {
  if (!svg) return svg;
  let out = svg;

  if (opts.monochromePrintSafe) {
    if (!out.includes("print_hatch_s1")) {
      out = out.replace(/<svg([^>]*)>/i, `<svg$1>${PRINT_HATCH_DEFS}`);
    }
    out = out
      .replace(/fill="#2563EB"/gi, 'fill="url(#print_hatch_s1)"')
      .replace(/fill="#10B981"/gi, 'fill="url(#print_hatch_s2)"')
      .replace(/fill="#(?!FFFFFF|F8FAFC|F1F5F9|E2E8F0|0F172A|1E293B|334155|475569|64748B)[0-9A-F]{6}"/gi, 'fill="#334155"')
      .replace(/stroke="#(?!FFFFFF|F8FAFC|F1F5F9|E2E8F0|CBD5E1|94A3B8|0F172A|1E293B|334155|475569|64748B)[0-9A-F]{6}"/gi, 'stroke="#0F172A"');
  }

  const mult = opts.strokeWidthMultiplier;
  if (mult && Number.isFinite(mult) && mult > 1.02) {
    out = out.replace(/stroke-width="(\d+(?:\.\d+)?)"/g, (_m, rawW: string) => {
      const w = parseFloat(rawW);
      if (!Number.isFinite(w) || w <= 0) return `stroke-width="${rawW}"`;
      const scaled = Math.min(3.2, Number((w * mult).toFixed(2)));
      return `stroke-width="${scaled}"`;
    });
  }

  return out;
}
