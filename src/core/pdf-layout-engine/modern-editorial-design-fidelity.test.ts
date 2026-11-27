import { describe, expect, it } from "vitest";
import { projectGeometryFigureToSVGMarkup } from "../geometry-engine/vector-svg-figure-projector";
import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import { computeFigureBoxSizePx } from "./question-figure-box-size";
import { buildFlowItems } from "./flow-items-builder";
import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";

const SAMPLE_TRIANGLE_IR: CanonicalGeometryFigureIR = {
  figureId: "fig-editorial-test-1",
  familyId: "triangle_family",
  branchId: "triangle_base_general",
  titleArabic: "مثلث أ ب جـ",
  notationLanguage: "arabic",
  vertices: [
    { id: "A", label: "أ", position: { x: 0, y: 0 } },
    { id: "B", label: "ب", position: { x: 8, y: 0 } },
    { id: "C", label: "جـ", position: { x: 3, y: 5 } },
  ],
  segments: [
    { id: "s-ab", fromVertexId: "A", toVertexId: "B", lengthLabel: { value: "8", unit: "سم", labelKind: "given" } },
    { id: "s-bc", fromVertexId: "B", toVertexId: "C", lengthLabel: { value: "؟", labelKind: "unknown" } },
    { id: "s-ca", fromVertexId: "C", toVertexId: "A" },
  ],
  angles: [
    { id: "ang-a", vertexId: "A", arm1VertexId: "C", arm2VertexId: "B", degrees: 50, labelKind: "given" },
    { id: "ang-c", vertexId: "C", arm1VertexId: "A", arm2VertexId: "B", degreesLabel: "؟", labelKind: "unknown" },
  ],
};

describe("Modern Editorial Handout Design Fidelity", () => {
  it("projects frameless black-and-crimson textbook SVG without halos or dashed boxes when editorialTextbookStyle=true", () => {
    const svg = projectGeometryFigureToSVGMarkup(SAMPLE_TRIANGLE_IR, {
      widthPx: 220,
      heightPx: 150,
      accentColorHex: "#C81E1E",
      backgroundColorHex: "transparent",
      numeralMode: "eastern",
      notationLanguage: "arabic",
      editorialTextbookStyle: true,
    });

    expect(svg).toContain('stroke="#0F172A"');
    expect(svg).toContain('fill="#C81E1E"');
    expect(svg).toContain('font-size="11.2"');
    expect(svg).toContain('font-size="10.0"');
    expect(svg).not.toContain("#6366F1");
    expect(svg).not.toContain("#D97706");
    expect(svg).not.toContain("<rect ");
  });

  it("preserves legacy classic SVG styling when editorialTextbookStyle is omitted", () => {
    const svg = projectGeometryFigureToSVGMarkup(SAMPLE_TRIANGLE_IR, {
      widthPx: 180,
      heightPx: 130,
      strokeColorHex: "#1D4ED8",
      accentColorHex: "#0D9488",
      numeralMode: "eastern",
      notationLanguage: "arabic",
    });

    expect(svg).toContain("#6366F1");
    expect(svg).toContain("#D97706");
    expect(svg).toContain("<rect ");
  });

  it("scales textbook figures larger with zero padding when editorialTextbook=true", () => {
    const edBox = computeFigureBoxSizePx({ aspect: 1.4, figureScale: 0.94, columnsCount: 2, editorialTextbook: true });
    const legacyBox = computeFigureBoxSizePx({ aspect: 1.4, figureScale: 0.82, columnsCount: 2 });

    expect(edBox.boxWidthPx).toBe(edBox.svgWidthPx);
    expect(edBox.svgWidthPx).toBeGreaterThanOrEqual(170);
    expect(edBox.svgWidthPx).toBeGreaterThan(legacyBox.svgWidthPx);
  });

  it("assigns algebra and geometry zoneVariants to editorial sub-question banners", () => {
    const qs: PrintableMathQuestionItem[] = [
      { id: "alg1", questionNumber: 1, kind: "essay_algebra", branchBadgeAr: "الجبر", marks: 2, promptAr: "أوجد مجموعة حل المعادلة $2س + 1 = 7$", modelAnswerAr: "س = 3" },
      { id: "geo1", questionNumber: 2, kind: "essay_geometry", branchBadgeAr: "الهندسة", marks: 3, promptAr: "أوجد قياس الزاوية المجهولة", modelAnswerAr: "80°", geometryFigure: SAMPLE_TRIANGLE_IR },
    ];
    const { items } = buildFlowItems({
      questions: qs,
      columnsCount: 2,
      includeAnswerKey: false,
      paperTemplateId: "modern_editorial_handout",
    });
    const subBanners = items.filter((it) => it.kind === "editorial_sub_banner");

    expect(subBanners).toHaveLength(2);
    expect(subBanners[0]?.kind === "editorial_sub_banner" ? subBanners[0].zoneVariant : undefined).toBe("algebra");
    expect(subBanners[1]?.kind === "editorial_sub_banner" ? subBanners[1].zoneVariant : undefined).toBe("geometry");
  });
});
