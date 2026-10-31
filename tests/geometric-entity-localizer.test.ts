import { describe, it, expect } from "vitest";
import {
  localizeGeometricEntitiesInPlainText,
  localizeGeometricEntitiesInLatex,
  convertArabicVerticesToLatin,
  convertLatinVerticesToArabic,
} from "@/core/math-text/math-geometric-entity-localizer";
import {
  localizeCanonicalLatex,
} from "@/core/math-text/math-latex-notation-and-numeral-localizer";
import {
  getChoiceLetterByNotationSSOT,
  localizeGeometricVertexLabelSSOT,
} from "@/core/ssot/numeral-and-unit-ssot";
import {
  copyPromptAndOpenGradeNotebookLmSSOT,
} from "@/core/ssot/teacher-identity-ssot";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";
import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";

describe("Geometric Entity Localizer — Arabic <-> Latin Synchronization", () => {
  it("converts vertex sequence between Arabic and Latin accurately", () => {
    expect(convertArabicVerticesToLatin("أ ب جـ")).toBe("ABC");
    expect(convertArabicVerticesToLatin("أ ب")).toBe("AB");
    expect(convertArabicVerticesToLatin("س ص ع")).toBe("XYZ");
    expect(convertArabicVerticesToLatin("د هـ و")).toBe("DEF");
    expect(convertArabicVerticesToLatin("أ ب جـ د")).toBe("ABCD");

    expect(convertLatinVerticesToArabic("ABC")).toBe("أ ب جـ");
    expect(convertLatinVerticesToArabic("AB")).toBe("أ ب");
  });

  it("localizes plain text geometric entities when notation is English", () => {
    // 1. Single angle and reflex angle from user screenshot
    const prompt1 = "إذا كان قياس ∠ أ = 70° ، فإن قياس ∠ أ المنعكسة يساوي:";
    expect(localizeGeometricEntitiesInPlainText(prompt1, "english")).toBe(
      "إذا كان قياس ∠ A = 70° ، فإن قياس ∠ A المنعكسة يساوي:"
    );

    // 2. Measure notation with ق(∠ ...)
    const prompt2 = "إذا كان ق (∠ أ) = 110° ، فأوجد ق (∠ أ المنعكسة).";
    expect(localizeGeometricEntitiesInPlainText(prompt2, "english")).toBe(
      "إذا كان m(∠ A) = 110° ، فأوجد m(∠ A المنعكسة)."
    );

    const prompt3 = "إذا كان ق (∠ ب المنعكسة) = 240° ، فأوجد ق (∠ ب).";
    expect(localizeGeometricEntitiesInPlainText(prompt3, "english")).toBe(
      "إذا كان m(∠ B المنعكسة) = 240° ، فأوجد m(∠ B)."
    );

    // 3. Polygons and segments
    const prompt4 = "المثلث أ ب جـ فيه الضلع أ ب = 5 سم والضلع ب جـ = 7 سم";
    expect(localizeGeometricEntitiesInPlainText(prompt4, "english")).toBe(
      "المثلث ABC فيه الضلع AB = 5 سم والضلع BC = 7 سم"
    );

    // 4. Leave unchanged when notation is Arabic
    expect(localizeGeometricEntitiesInPlainText(prompt1, "arabic")).toBe(prompt1);
  });

  it("localizes LaTeX math expressions for angles, reflex angles, and triangles", () => {
    // LaTeX formula from user screenshot
    const latex1 = "m(\\angle \\text{أ المنعكسة}) = 360^\\circ - m(\\angle \\text{أ})";
    expect(localizeCanonicalLatex(latex1, "western", "english")).toContain(
      "m(\\angle A\\text{ المنعكسة}) = 360^\\circ - m(\\angle A)"
    );

    const latex2 = "\\angle \\text{ب} = 135.5^\\circ";
    expect(localizeCanonicalLatex(latex2, "western", "english")).toContain(
      "\\angle B = 135.5^\\circ"
    );

    const latex3 = "\\triangle \\text{أ ب جـ}";
    expect(localizeCanonicalLatex(latex3, "western", "english")).toContain(
      "\\triangle ABC"
    );

    const latex4 = "\\overline{\\text{أ ب}}";
    expect(localizeCanonicalLatex(latex4, "western", "english")).toContain(
      "\\overline{AB}"
    );

    const latex5 = "\\overleftrightarrow{\\text{أ ب}} \\cap \\overleftrightarrow{\\text{جـ د}} = \\{\\text{م}\\}";
    expect(localizeCanonicalLatex(latex5, "western", "english")).toContain(
      "\\overleftrightarrow{AB} \\cap \\overleftrightarrow{CD} = \\{M\\}"
    );

    const latex6 = "m(\\angle \\text{أ م جـ}) = 65^\\circ";
    expect(localizeCanonicalLatex(latex6, "western", "english")).toContain(
      "m(\\angle AMC) = 65^\\circ"
    );

    const latex7 = "\\vec{\\text{م و}}";
    expect(localizeCanonicalLatex(latex7, "western", "english")).toContain(
      "\\overrightarrow{MF}"
    );
  });

  it("localizes points and ray lists in plain text when notation is English", () => {
    const plain = "في الشكل المقابل، النقطة م متجمع حولها الأشعة م أ، م ب، م جـ، م د عند نقطة ن";
    expect(localizeGeometricEntitiesInPlainText(plain, "english")).toBe(
      "في الشكل المقابل، النقطة M متجمع حولها الأشعة MA، MB، MC، MD عند نقطة N"
    );
  });

  it("switches MCQ choice letters between Arabic and English based on notation", () => {
    expect(getChoiceLetterByNotationSSOT(0, "arabic")).toBe("أ");
    expect(getChoiceLetterByNotationSSOT(1, "arabic")).toBe("ب");
    expect(getChoiceLetterByNotationSSOT(2, "arabic")).toBe("جـ");
    expect(getChoiceLetterByNotationSSOT(3, "arabic")).toBe("د");

    expect(getChoiceLetterByNotationSSOT(0, "english")).toBe("A");
    expect(getChoiceLetterByNotationSSOT(1, "english")).toBe("B");
    expect(getChoiceLetterByNotationSSOT(2, "english")).toBe("C");
    expect(getChoiceLetterByNotationSSOT(3, "english")).toBe("D");
  });

  it("projects geometric figure SVG with localized vertex labels based on notation", () => {
    const dummyFigure: CanonicalGeometryFigureIR = {
      archetypeId: "triangle_isosceles",
      vertices: [
        { id: "v1", label: "أ", position: { x: 5, y: 10 } },
        { id: "v2", label: "ب", position: { x: 0, y: 0 } },
        { id: "v3", label: "جـ", position: { x: 10, y: 0 } },
      ],
      segments: [],
      angles: [],
    };

    const arabicSvg = projectGeometryFigureToSVGMarkup(dummyFigure, {
      notationLanguage: "arabic",
    });
    expect(arabicSvg).toContain(">أ<");
    expect(arabicSvg).toContain(">ب<");
    expect(arabicSvg).toContain(">جـ<");

    const englishSvg = projectGeometryFigureToSVGMarkup(dummyFigure, {
      notationLanguage: "english",
    });
    expect(englishSvg).toContain(">A<");
    expect(englishSvg).toContain(">B<");
    expect(englishSvg).toContain(">C<");
  });

  it("copies prompt without opening window when openNotebook option is false", async () => {
    const res = await copyPromptAndOpenGradeNotebookLmSSOT(
      "test prompt",
      "prep-1",
      { openNotebook: false }
    );
    expect(res.openedUrl).toBe("");
  });
});
