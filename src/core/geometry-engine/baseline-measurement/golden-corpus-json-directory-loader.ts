/**
 * @file golden-corpus-json-directory-loader.ts
 * @description يحمّل كل ملفات المجموعة الذهبية (*.json) من tests/golden-corpus/geometry ويتحقق من سلامة مخططها ومواصفات الأشكال المتوقعة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 60 سطراً).
 */
import fs from "node:fs";
import path from "node:path";
import type { GoldenCorpusCase } from "./golden-corpus-case-types-ssot";

export const MODULE_ID_GOLDEN_CORPUS_JSON_DIRECTORY_LOADER = "golden_corpus_json_directory_loader" as const;

export const GOLDEN_CORPUS_GEOMETRY_DIRECTORY = path.resolve("tests/golden-corpus/geometry");

function validateCaseShape(value: unknown, file: string): GoldenCorpusCase {
  const c = value as Partial<GoldenCorpusCase>;
  const ok =
    typeof c.id === "string" && typeof c.gradeId === "string" && typeof c.branchId === "string" &&
    typeof c.problemText === "string" && typeof c.geometryRaw === "string" &&
    (c.expectedOutcome === "figure" || c.expectedOutcome === "no_figure") &&
    Array.isArray(c.expectedGivenNumbers) && typeof c.source === "string" &&
    (c.humanVerdict === "correct" || c.humanVerdict === "wrong" || c.humanVerdict === "unreviewed") &&
    (c.expectedFigureSpec === undefined || (typeof c.expectedFigureSpec === "object" && c.expectedFigureSpec !== null));
  if (!ok) throw new Error(`حالة ذهبية غير صالحة في ${file}: ${JSON.stringify(value).slice(0, 120)}`);
  return c as GoldenCorpusCase;
}

export function loadGoldenGeometryCorpus(directory: string = GOLDEN_CORPUS_GEOMETRY_DIRECTORY): GoldenCorpusCase[] {
  if (!fs.existsSync(directory)) return [];
  const cases: GoldenCorpusCase[] = [];
  const seen = new Set<string>();
  for (const file of fs.readdirSync(directory).filter((f) => f.endsWith(".json")).sort()) {
    const parsed: unknown = JSON.parse(fs.readFileSync(path.join(directory, file), "utf8"));
    if (!Array.isArray(parsed)) throw new Error(`${file}: يجب أن يكون مصفوفة حالات`);
    for (const item of parsed) {
      const c = validateCaseShape(item, file);
      if (seen.has(c.id)) throw new Error(`معرّف مكرر في المجموعة الذهبية: ${c.id}`);
      seen.add(c.id);
      cases.push(c);
    }
  }
  return cases;
}
