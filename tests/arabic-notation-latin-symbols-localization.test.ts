/**
 * @file arabic-notation-latin-symbols-localization.test.ts
 * @description عند اختيار الترميز العربي لا يبقى أي حرف لاتيني (رؤوس/متغيرات) في المعادلات ولا في تسميات الأشكال.
 */
import { describe, it, expect } from "vitest";
import { localizeCanonicalLatex } from "@/core/math-text/math-latex-notation-and-numeral-localizer";
import { localizeGeometricEntitiesInPlainText } from "@/core/math-text/math-geometric-entity-localizer";
import { localizeFigureLabelText } from "@/core/geometry-engine/figure-label-symbol-localizer";
import { buildTriangleMidsegmentFigure } from "@/core/geometry-engine/triangle-family/triangle-midsegment-branch";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";
import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";

const LATIN = /[A-Za-z]/;
const stripCommands = (s: string) => s.replace(/\\[A-Za-z]+/g, "");

describe("Arabic notation: Latin symbols are localized", () => {
  it("converts all A-Z vertices and lowercase variables inside LaTeX", () => {
    for (const src of [
      "AB = 12",
      "\\overline{AB} = 2x + 3",
      "y = 2x + 1",
      "\\triangle ABC \\sim \\triangle DEF",
      "\\angle ABC = 60^\\circ",
      "x^2 + y^2 = 25",
      "\\frac{x}{2}",
      "PQRS",
      "O(0,0)",
      "f(x) = 2x + k",
    ]) {
      const out = localizeCanonicalLatex(src, "western", "arabic");
      expect(LATIN.test(stripCommands(out.replace(/\\text\{[^{}]*\}/g, "")))).toBe(false);
    }
    expect(localizeCanonicalLatex("AB = 2x + 3", "western", "arabic")).toContain("\\text{س}");
    expect(localizeCanonicalLatex("PQRS", "western", "arabic")).toContain("\\text{ف ق ر ش}");
    expect(localizeCanonicalLatex("f(x) = 2x + 1", "western", "arabic")).toContain("\\text{د}(\\text{س})");
  });

  it("localizes plain text Latin vertices and variables to Arabic when notation is arabic", () => {
    const plain = "في المثلث ABC حيث D منتصف AB و PQ // BC و m(∠ ABC) = 60° أوجد قيمة x";
    const localized = localizeGeometricEntitiesInPlainText(plain, "arabic");
    expect(localized).toContain("أ ب جـ");
    expect(localized).toContain("ف ق");
    expect(localized).toContain("ق(∠ أ ب جـ)");
    expect(localized).toContain("قيمة س");
    expect(LATIN.test(localized)).toBe(false);
  });

  it("keeps commands and round-trips back to English", () => {
    expect(localizeCanonicalLatex("\\sin 30^\\circ", "western", "arabic")).toContain("جا");
    expect(localizeCanonicalLatex("\\text{س} + 2 = 5", "western", "english")).toBe("X + 2 = 5");
  });

  it("localizes figure labels (lengths and algebraic angles) for all letters", () => {
    expect(localizeFigureLabelText("X", "arabic", "eastern")).toBe("س");
    expect(localizeFigureLabelText("P", "arabic", "eastern")).toBe("ف");
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

