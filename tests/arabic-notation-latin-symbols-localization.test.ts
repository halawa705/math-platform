/**
 * @file arabic-notation-latin-symbols-localization.test.ts
 * @description عند اختيار الترميز العربي لا يبقى أي حرف لاتيني (رؤوس/متغيرات) في المعادلات ولا في تسميات الأشكال.
 */
import { describe, it, expect } from "vitest";
import { localizeCanonicalLatex } from "@/core/math-text/math-latex-notation-and-numeral-localizer";
import { localizeFigureLabelText } from "@/core/geometry-engine/figure-label-symbol-localizer";
import { buildTriangleMidsegmentFigure } from "@/core/geometry-engine/triangle-family/triangle-midsegment-branch";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";
import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";

const LATIN = /[A-Za-z]/;
const stripCommands = (s: string) => s.replace(/\\[A-Za-z]+/g, "");

describe("Arabic notation: Latin symbols are localized", () => {
  it("converts vertices and variables inside LaTeX", () => {
    for (const src of ["AB = 12", "\\overline{AB} = 2x + 3", "y = 2x + 1", "\\triangle ABC \\sim \\triangle DEF", "\\angle ABC = 60^\\circ", "x^2 + y^2 = 25", "\\frac{x}{2}"]) {
      const out = localizeCanonicalLatex(src, "western", "arabic");
      expect(LATIN.test(stripCommands(out.replace(/\\text\{[^{}]*\}/g, "")))).toBe(false);
    }
    expect(localizeCanonicalLatex("AB = 2x + 3", "western", "arabic")).toContain("\\text{س}");
  });

  it("keeps commands and round-trips back to English", () => {
    expect(localizeCanonicalLatex("\\sin 30^\\circ", "western", "arabic")).toContain("جا");
    expect(localizeCanonicalLatex("\\text{س} + 2 = 5", "western", "english")).toBe("X + 2 = 5");
  });

  it("localizes figure labels (lengths and algebraic angles)", () => {
    expect(localizeFigureLabelText("X", "arabic", "eastern")).toBe("س");
    expect(localizeFigureLabelText("(3X-18)°", "arabic", "eastern")).toBe("(٣س-١٨)°");
    expect(localizeFigureLabelText("(3س-18)°", "english", "western")).toBe("(3X-18)°");
    expect(localizeFigureLabelText("12", "arabic", "western")).toBe("12");
  });

  it("figure SVG shows Arabic variable in length pill", () => {
    const base = buildTriangleMidsegmentFigure({ figureId: "t", notationLanguage: "arabic" });
    const fig: CanonicalGeometryFigureIR = {
      ...base,
      segments: base.segments.map((s, i) => (i === 0 ? { ...s, lengthLabel: { value: "X", unit: "سم" } } : s)),
    };
    const svg = projectGeometryFigureToSVGMarkup(fig, { notationLanguage: "arabic", numeralMode: "eastern" });
    expect(svg).toContain(">س سم<");
    expect(svg).not.toContain(">X");
  });
});

