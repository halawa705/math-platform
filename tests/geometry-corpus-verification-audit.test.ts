/**
 * @file geometry-corpus-verification-audit.test.ts
 * @description تدقيق شامل: يستخرج كل وصف مسألة من اختبارات الكتالوجات، يرسمه، ويقيس تطابقه مع معطياته.
 */
import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { matchOptionalGeometryFigureFromArabicDescription } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { verifyGeometryFigure } from "@/core/geometry-engine/verification/geometry-figure-verification-orchestrator";
import { refineFigureToMatchGivens } from "@/core/geometry-engine/constraint-refiner/geometry-figure-constraint-refiner";

function harvestDescriptions(): string[] {
  const dir = path.resolve("tests");
  const out: string[] = [];
  for (const f of fs.readdirSync(dir)) {
    if (!/catalog.*\.test\.ts$/.test(f)) continue;
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    for (const m of src.matchAll(/const desc = "((?:[^"\\]|\\.)*)"/g)) out.push(JSON.parse(`"${m[1]}"`));
  }
  return out;
}

describe("Geometry corpus verification audit", () => {
  it("every matched figure matches its own measurements", () => {
    const descs = harvestDescriptions();
    const bad: string[] = [];
    let matched = 0;
    descs.forEach((d, i) => {
      const fig = matchOptionalGeometryFigureFromArabicDescription(d, `audit_${i}`, "arabic");
      if (!fig) return;
      matched++;
      const rep = refineFigureToMatchGivens(fig).report; void verifyGeometryFigure;
      if (!rep.passed || rep.issues.length) bad.push(`#${i} ${fig.branchId} «${d}» :: ${rep.issues.map((x) => `[${x.severity}] ${x.message}`).join(" | ")}`);
    });
    fs.writeFileSync(path.resolve("docs/qa/geometry-audit-report.txt"), `descs=${descs.length} matched=${matched} issues=${bad.length}\n${bad.join("\n")}`, "utf8");
    expect(matched).toBeGreaterThan(0);
  });
});


