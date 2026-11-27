import { describe, expect, it } from "vitest";
import { projectGeometryFigureToSVGMarkup } from "../geometry-engine/vector-svg-figure-projector";
import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import { loadPersistedPDFPrintSettingsSSOT } from "../ssot/pdf-print-settings-ssot";
import { computeFigureBoxSizePx } from "./question-figure-box-size";

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
    { id: "s-ab", fromVertexId: "A", toVertexId: "B", tickMarks: 2, lengthLabel: { value: "8", unit: "سم", labelKind: "given" } },
    { id: "s-bc", fromVertexId: "B", toVertexId: "C", tickMarks: 2, lengthLabel: { value: "؟", labelKind: "unknown" } },
    { id: "s-ca", fromVertexId: "C", toVertexId: "A" },
  ],
  angles: [
    { id: "ang-a", vertexId: "A", arm1VertexId: "C", arm2VertexId: "B", degrees: 50, labelKind: "given" },
    { id: "ang-c", vertexId: "C", arm1VertexId: "A", arm2VertexId: "B", degreesLabel: "؟", labelKind: "unknown" },
  ],
};

describe("Modern Editorial Geometry Contrast & Settings Migration Fidelity", () => {
  it("projects large frameless #0F172A lines with high-contrast #C81E1E vertices, labels, and tick marks", () => {
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
    expect(svg).toContain('stroke="#C81E1E"');
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

  it("migrates legacy v3 classic_sovereign settings to modern_editorial_handout while keeping watermark preferences", () => {
    const store = new Map<string, string>([
      [
        "math_platform_pdf_print_settings_ssot_v3",
        JSON.stringify({
          paperTemplateId: "classic_sovereign",
          colorThemeId: "math_teal",
          watermarkText: "أ/ إسلام محمد",
          watermarkOpacityPct: 24,
        }),
      ],
    ]);
    const prevWindow = globalThis.window;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { localStorage: { getItem: (k: string) => store.get(k) ?? null } },
    });
    try {
      const migrated = loadPersistedPDFPrintSettingsSSOT();
      expect(migrated.paperTemplateId).toBe("modern_editorial_handout");
      expect(migrated.colorThemeId).toBe("sky_editorial");
      expect(migrated.watermarkText).toBe("أ/ إسلام محمد");
      expect(migrated.watermarkOpacityPct).toBe(24);
    } finally {
      Object.defineProperty(globalThis, "window", { configurable: true, value: prevWindow });
    }
  });
});
