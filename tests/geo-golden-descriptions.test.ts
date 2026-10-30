import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { composeFigureFromGeometryDescription } from "@/core/geometry-engine/fact-compositor/geo-figure-composer";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";

export interface GoldenGeoCase {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly expectedVertices: number;
}

export const GOLDEN_GEO_DESCRIPTIONS: readonly GoldenGeoCase[] = [
  { id: "01-right-tri", title: "مثلث قائم فيثاغورس", description: "مثلث أ ب جـ قائم في ب ; أ ب = 6 سم ; ب جـ = 8 سم", expectedVertices: 3 },
  { id: "02-iso-tri", title: "مثلث متساوي الساقين", description: "مثلث أ ب جـ متساوي الساقين رأسه أ ; أ ب = 5 سم ; ب جـ = 6 سم", expectedVertices: 3 },
  { id: "03-equi-tri", title: "مثلث متساوي الأضلاع", description: "مثلث أ ب جـ متساوي الأضلاع ; أ ب = 6 سم", expectedVertices: 3 },
  { id: "04-thales", title: "توازي طاليس", description: "مثلث أ ب جـ ; د على أ ب ; هـ على أ جـ ; د هـ // ب جـ ; أ د = 2 سم ; د ب = 3 سم ; ب جـ = 10 سم", expectedVertices: 5 },
  { id: "05-midsegment", title: "قطعة واصلة بين منتصفي ضلعين", description: "مثلث أ ب جـ ; د منتصف أ ب ; هـ منتصف أ جـ ; د هـ // ب جـ", expectedVertices: 5 },
  { id: "06-euclid", title: "نظرية إقليدس", description: "مثلث أ ب جـ قائم في أ ; أ د ⊥ ب جـ ; أ ب = 6 سم ; أ جـ = 8 سم", expectedVertices: 4 },
  { id: "07-bisector", title: "منصف زاوية داخلية", description: "مثلث أ ب جـ ; أ د ينصف ∠ أ ; أ ب = 6 سم ; أ جـ = 9 سم ; ب جـ = 10 سم", expectedVertices: 4 },
  { id: "08-median", title: "متوسط في مثلث", description: "مثلث أ ب جـ ; أ د متوسط ; أ ب = 7 سم ; ب جـ = 8 سم ; أ جـ = 9 سم", expectedVertices: 4 },
  { id: "09-two-medians", title: "تقاطع متوسطين في مثلث", description: "مثلث أ ب جـ ; أ د متوسط ; ب هـ متوسط ; أ د ∩ ب هـ = {م}", expectedVertices: 6 },
  { id: "10-ext-angle", title: "زاوية خارجة لمثلث", description: "مثلث أ ب جـ ; نمد ب جـ إلى د ; ق(∠أ) = 50° ; ق(∠ب) = 60°", expectedVertices: 4 },
  { id: "11-sim-triangles", title: "تشابه مثلثين منفصلين", description: "Δ ABC ~ Δ DEF ; AB = 4 سم ; BC = 6 سم ; CA = 8 سم ; DE = 2 سم ; EF = 3 سم ; FD = 4 سم", expectedVertices: 6 },
  { id: "12-sim-quads", title: "تشابه مضلعين رباعيين", description: "مستطيل أ ب جـ د ~ مستطيل هـ و ز ح ; أ ب = 6 سم ; ب جـ = 4 سم ; هـ و = 3 سم ; و ز = 2 سم", expectedVertices: 8 },
  { id: "13-rectangle-diag", title: "مستطيل وقطراه", description: "مستطيل أ ب جـ د ; أ ب = 8 سم ; ب جـ = 6 سم ; قطراه يتقاطعان في م", expectedVertices: 5 },
  { id: "14-square-diag", title: "مربع وقطراه", description: "مربع أ ب جـ د ; أ ب = 5 سم ; قطراه يتقاطعان في م", expectedVertices: 5 },
  { id: "15-rhombus", title: "معين وزاوية", description: "معين أ ب جـ د ; أ ب = 6 سم ; ق(∠أ) = 60° ; قطراه يتقاطعان في م", expectedVertices: 5 },
  { id: "16-parallelogram", title: "متوازي أضلاع", description: "متوازي أضلاع أ ب جـ د ; أ ب = 8 سم ; أ د = 5 سم ; ق(∠أ) = 65°", expectedVertices: 4 },
  { id: "17-trapezoid", title: "شبه منحرف متساوي الساقين", description: "شبه منحرف أ ب جـ د ; أ ب = 10 سم ; جـ د = 6 سم ; أ د = ب جـ", expectedVertices: 4 },
  { id: "18-algebraic-angle", title: "مثلث بزوايا جبرية", description: "مثلث أ ب جـ ; ق(∠أ) = 2س ; ق(∠ب) = 3س ; ق(∠جـ) = 40°", expectedVertices: 3 },
  { id: "19-circle-chord", title: "دائرة ووتر وعمود من المركز", description: "دائرة مركزها م ; نق = 5 ; أ ب وتر ; م د ⊥ أ ب", expectedVertices: 4 },
  { id: "20-circle-tangent", title: "دائرة ومماس وقطر", description: "دائرة مركزها م ; نق = 5 ; أ ب قطر ; أ جـ مماس للدائرة عند أ", expectedVertices: 4 },
];

describe("Golden Geometry Descriptions Suite (G-11)", () => {
  for (const item of GOLDEN_GEO_DESCRIPTIONS) {
    it(`${item.id}: ${item.title}`, () => {
      const res = composeFigureFromGeometryDescription(item.description, `golden_${item.id}`, "arabic");
      expect(res.warnings).toEqual([]);
      expect(res.figure).not.toBeNull();
      expect(res.figure?.vertices.length).toBe(item.expectedVertices);

      const matched = matchGeometryWithDiagnostics(item.description, `match_${item.id}`, "arabic");
      expect(matched.source).toBe("compositor");
      expect(matched.figure).toBeDefined();

      const outDir = path.resolve("docs/qa/figures");
      fs.mkdirSync(outDir, { recursive: true });
      const svg = projectGeometryFigureToSVGMarkup(res.figure!, { widthPx: 260, heightPx: 190, numeralMode: "eastern" });
      fs.writeFileSync(path.join(outDir, `${item.id}.svg`), svg, "utf8");
    });
  }
});
