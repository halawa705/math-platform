/**
 * @file prompt-v2-ingestion-resilience.test.ts
 * @description اختبار صلابة استيعاب استجابات البرومبت 2 ضد العينات السليمة والمشوهة والنظرية (المهمة 1.6):
 * يتحقق من فهم $\ge 95\%$ للاستجابات السليمة والرفض النظيف للوسوم المشوهة وعدم توليد رسوم عشوائية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 300 سطر).
 */

import { describe, it, expect } from "vitest";
import {
  PROMPT_V2_WELL_FORMED_SAMPLES,
  PROMPT_V2_MALFORMED_SAMPLES,
  PROMPT_V2_THEORETICAL_SAMPLES,
} from "./fixtures/prompt-v2-responses-fixtures";
import {
  extractFirstFigureTagPayload,
  stripFigureTagsFromPromptText,
} from "../src/core/ssot/figure-tag-grammar-ssot";
import { matchGeometryWithDiagnostics } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { parseCartesianGraphDescription } from "../src/core/geometry-engine/graph-compositor/graph-fact-parser";
import { isDiagramJustifiedForQuestion } from "../src/core/ingestion/unsolicited-diagram-guard";
import { isPurelyTheoreticalNoDiagramProblem } from "../src/core/geometry-engine/verification/geometry-figure-fidelity-gate";

describe("Phase 1 Task 1.6: Prompt v2 Ingestion Resilience", () => {
  describe("Well-Formed Responses (Target: >= 95% Comprehension)", () => {
    let successCount = 0;

    for (const sample of PROMPT_V2_WELL_FORMED_SAMPLES) {
      it(`correctly digests well-formed sample: ${sample.id} (${sample.notes})`, () => {
        const payload = extractFirstFigureTagPayload(sample.rawText);
        expect(payload).not.toBeNull();
        expect(payload?.content.length).toBeGreaterThan(0);

        if (payload?.kind === "geometry") {
          const res = matchGeometryWithDiagnostics(payload.content, sample.id, "arabic");
          expect(res.figure).toBeDefined();
          if (sample.expectedDecision) {
            expect(res.decision).toBe(sample.expectedDecision);
          }
          successCount++;
        } else if (payload?.kind === "graph") {
          const spec = parseCartesianGraphDescription(payload.content);
          expect(spec).not.toBeNull();
          expect(spec?.functions.length).toBeGreaterThan(0);
          successCount++;
        } else if (payload?.kind === "statistics") {
          expect(payload.content).toContain("نوع=");
          expect(payload.content).toContain("مخطط صندوق");
          successCount++;
        }
      });
    }

    it("achieves >= 95% comprehension rate across all well-formed fixtures", () => {
      const rate = (successCount / PROMPT_V2_WELL_FORMED_SAMPLES.length) * 100;
      expect(rate).toBeGreaterThanOrEqual(95);
    });
  });

  describe("Malformed Responses (Target: Clean Rejection & Fallback)", () => {
    it("gracefully rejects floating tag without geometric vertices", () => {
      const sample = PROMPT_V2_MALFORMED_SAMPLES.find((s) => s.id === "mf-floating-tag-no-vertices")!;
      const payload = extractFirstFigureTagPayload(sample.rawText);

      expect(payload).not.toBeNull();
      const res = matchGeometryWithDiagnostics(payload!.content, sample.id);
      expect(res.figure).toBeUndefined();
      expect(["red", "yellow"]).toContain(res.decision);
      expect(res.warnings.length).toBeGreaterThan(0);
    });

    it("guards against unsolicited diagram tag leaked into arithmetic question", () => {
      const sample = PROMPT_V2_MALFORMED_SAMPLES.find((s) => s.id === "mf-unsolicited-arithmetic-tag")!;
      const payload = extractFirstFigureTagPayload(sample.rawText);

      expect(payload).not.toBeNull();
      const justified = isDiagramJustifiedForQuestion({
        promptArabic: sample.rawText,
        rawDiagramTagText: payload!.content,
        branchId: sample.branchId,
      });

      expect(justified).toBe(false);
    });

    it("handles empty tag cleanly without thrown exceptions", () => {
      const sample = PROMPT_V2_MALFORMED_SAMPLES.find((s) => s.id === "mf-empty-tag")!;
      const payload = extractFirstFigureTagPayload(sample.rawText);

      // Either returns null or empty payload that yields no figure
      if (payload) {
        const res = matchGeometryWithDiagnostics(payload.content, sample.id);
        expect(res.figure).toBeUndefined();
      }
    });

    it("recovers text safely from unclosed tag syntax without hanging", () => {
      const sample = PROMPT_V2_MALFORMED_SAMPLES.find((s) => s.id === "mf-unclosed-tag-syntax")!;
      const payload = extractFirstFigureTagPayload(sample.rawText);

      expect(payload).not.toBeNull();
      expect(payload?.content).toContain("مستطيل أ ب جـ د");
    });
  });

  describe("Pure Theoretical Responses (Target: Zero Random Figures)", () => {
    for (const sample of PROMPT_V2_THEORETICAL_SAMPLES) {
      it(`confirms no spurious diagrams generated for theoretical question: ${sample.id}`, () => {
        const payload = extractFirstFigureTagPayload(sample.rawText);
        expect(payload).toBeNull();

        const cleanedPrompt = stripFigureTagsFromPromptText(sample.rawText);
        expect(cleanedPrompt).toBe(sample.rawText.trim());

        const isTheoretical = isPurelyTheoreticalNoDiagramProblem(sample.rawText);
        const isGuarded = isDiagramJustifiedForQuestion({
          promptArabic: sample.rawText,
          rawDiagramTagText: "",
          branchId: sample.branchId,
        });

        // Either detected as purely theoretical or has no diagram justified
        expect(!isGuarded || isTheoretical).toBe(true);
      });
    }
  });
});
