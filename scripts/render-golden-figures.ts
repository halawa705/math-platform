/**
 * @file render-golden-figures.ts
 * @description يولّد ملفات SVG للأوصاف الذهبية العشرين (G-12) في مجلد docs/qa/figures/ للمراجعة البصرية.
 */
import fs from "node:fs";
import path from "node:path";
import { composeFigureFromGeometryDescription } from "../src/core/geometry-engine/fact-compositor/geo-figure-composer";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";
import { GOLDEN_GEO_DESCRIPTIONS } from "../tests/geo-golden-descriptions.test";

const outDir = path.resolve("docs/qa/figures");
fs.mkdirSync(outDir, { recursive: true });

for (const item of GOLDEN_GEO_DESCRIPTIONS) {
  const res = composeFigureFromGeometryDescription(item.description, `golden_${item.id}`, "arabic");
  if (!res.figure) {
    throw new Error(`Failed to compose ${item.id}: ${res.warnings.join(", ")}`);
  }
  const svg = projectGeometryFigureToSVGMarkup(res.figure, {
    widthPx: 260,
    heightPx: 190,
    numeralMode: "eastern",
  });
  fs.writeFileSync(path.join(outDir, `${item.id}.svg`), svg, "utf8");
}

console.log(`Rendered ${GOLDEN_GEO_DESCRIPTIONS.length} golden SVG figures to docs/qa/figures/`);
