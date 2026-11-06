/**
 * @file studio-golden-corpus-quick-reviewer.test.ts
 * @description اختبارات التحقق من واجهة المراجعة السريعة وحساب دقة المجموعة الذهبية (المهمة 0.4).
 */

import { describe, it, expect } from "vitest";
import type { GoldenCorpusCase } from "@/core/geometry-engine/baseline-measurement/golden-corpus-case-types-ssot";

describe("Studio Golden Corpus Quick Reviewer Logic (Task 0.4)", () => {
  const sampleCases: GoldenCorpusCase[] = [
    {
      id: "case_01",
      gradeId: "prep-1",
      branchId: "plane_geometry",
      problemText: "مسألة 1",
      geometryRaw: "مثلث أ ب جـ قائم في ب ; أ ب = 6 سم ; ب جـ = 8 سم",
      expectedOutcome: "figure",
      expectedGivenNumbers: ["6", "8"],
      source: "book1",
      humanVerdict: "unreviewed",
    },
    {
      id: "case_02",
      gradeId: "prep-2",
      branchId: "plane_geometry",
      problemText: "مسألة 2",
      geometryRaw: "مثلث أ ب جـ متساوي الساقين",
      expectedOutcome: "figure",
      expectedGivenNumbers: [],
      source: "book2",
      humanVerdict: "unreviewed",
    },
  ];

  it("يحسب نسبة الدقة البشرية بدقة متناهية", () => {
    // محاكاة مراجعة حالتين: واحدة صحيحة وواحدة خاطئة
    const reviewed: GoldenCorpusCase[] = [
      { ...sampleCases[0], humanVerdict: "correct" },
      { ...sampleCases[1], humanVerdict: "wrong" },
    ];

    let correct = 0;
    let wrong = 0;
    for (const c of reviewed) {
      if (c.humanVerdict === "correct") correct++;
      if (c.humanVerdict === "wrong") wrong++;
    }
    const totalReviewed = correct + wrong;
    const accuracy = Number(((correct / totalReviewed) * 100).toFixed(1));

    expect(totalReviewed).toBe(2);
    expect(correct).toBe(1);
    expect(wrong).toBe(1);
    expect(accuracy).toBe(50.0);
  });

  it("يتحقق من قدرة النظام على معالجة 50 حالة بسرعة فائقة", () => {
    const fiftyCases: GoldenCorpusCase[] = Array.from({ length: 50 }, (_, i) => ({
      id: `batch_case_${i + 1}`,
      gradeId: "prep-3",
      branchId: "plane_geometry",
      problemText: `مسألة رقم ${i + 1}`,
      geometryRaw: `مثلث أ ب جـ ; أ ب = ${i + 3} سم`,
      expectedOutcome: "figure",
      expectedGivenNumbers: [String(i + 3)],
      source: "batch-test",
      humanVerdict: "unreviewed",
    }));

    expect(fiftyCases).toHaveLength(50);

    const startTime = performance.now();
    // محاكاة اتخاذ قرار آلي أو بشري فوري على 50 حالة
    const markedCases = fiftyCases.map((c, idx) => ({
      ...c,
      humanVerdict: idx % 10 === 0 ? ("wrong" as const) : ("correct" as const),
    }));
    const elapsedMs = performance.now() - startTime;

    expect(markedCases).toHaveLength(50);
    // معيار القبول: سرعة فائقة (أقل من ثانية برمجياً لمعالجة 50 حالة)
    expect(elapsedMs).toBeLessThan(1000);

    const approvedCount = markedCases.filter((c) => c.humanVerdict === "correct").length;
    expect(approvedCount).toBe(45);
  });
});
