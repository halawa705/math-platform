/**
 * @file geo-baseline-measurement-runner.test.ts
 * @description مشغّل القياس (المرحلة 0): يشغّل المجموعة الذهبية على المسار الحالي ويولّد docs/qa/geometry-baseline-report.md.
 * لا يفشل على جودة النظام الحالية (هدفه القياس)، بل على سلامة المجموعة وأدوات القياس.
 */
import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { loadGoldenGeometryCorpus } from "@/core/geometry-engine/baseline-measurement/golden-corpus-json-directory-loader";
import { classifyBaselineCase } from "@/core/geometry-engine/baseline-measurement/baseline-case-outcome-classifier";
import { summarizeBaselineResults } from "@/core/geometry-engine/baseline-measurement/baseline-coverage-report-aggregator";
import { renderBaselineReportMarkdown } from "@/core/geometry-engine/baseline-measurement/baseline-coverage-report-markdown-writer";

describe("Geometry baseline measurement (Phase 0)", () => {
  it("يقيس المجموعة الذهبية ويكتب لوحة التغطية", () => {
    const cases = loadGoldenGeometryCorpus();
    expect(cases.length).toBeGreaterThan(0);
    const results = cases.map(classifyBaselineCase);
    const summary = summarizeBaselineResults(cases, results);
    expect(summary.total).toBe(cases.length);
    const md = renderBaselineReportMarkdown(summary, results, new Date().toISOString());
    const out = path.resolve("docs/qa/geometry-baseline-report.md");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, md, "utf8");
  });
});
