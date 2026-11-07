/**
 * @file prep-grade1-parallel-arabic-parametric.test.ts
 * @description اختبار رسم مسائل التوازي بالحروف العربية (أ ب جـ د هـ و ز ح) وبأي زوايا عددية أو جبرية.
 */
import { describe, expect, it } from "vitest";
import { matchGeometryWithDiagnostics } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { verifyGeometryFigure } from "../src/core/geometry-engine/verification/geometry-figure-verification-orchestrator";

const CASES: readonly string[] = [
  "في الشكل المقابل: أ ب // جـ د ، المستقيم هـ و يقطعهما في ز و ح ، ق(∠أ ز ح) = (9س - 5)° ، ق(∠ز ح د) = (5س + 15)° ، أوجد قيمة س",
  "أ ب // جـ د ، هـ و قاطع لهما في ز ، ح ، ق(∠أ ز ح) = 70° ، أوجد ق(∠ز ح د)",
  "المستقيمان أ ب // جـ د والمستقيم هـ و قاطع لهما في ز و ح ، ق(∠ هـ ز ب) = 63° ، أوجد ق(∠ ز ح د)",
  "AB // CD ، EF قاطع لهما في G و H ، m(∠AGH) = 70° ، أوجد m(∠GHD)",
  "AB // CD ، EF يقطعهما في G و H ، m(∠BGH) = (3x + 15)° ، m(∠GHD) = 75° ، أوجد x",
  "أ ب // جـ د ، المستقيم هـ و يقطعهما في ز و ح ، ق(∠أ ز ح) = (2س + 10)° ، ق(∠جـ ح ز) = (3س - 20)° ، أوجد س",
];

describe("Prep Grade 1 parallel + transversal parametric drawing (Arabic letters)", () => {
  CASES.forEach((desc, i) => {
    it(`#${i + 1} يرسم الشكل أخضر بلا أخطاء تحقق`, () => {
      const r = matchGeometryWithDiagnostics(desc, `par_ar_${i}`, "arabic");
      expect(r.decision).toBe("green");
      expect(r.figure).toBeDefined();
      expect(r.figure!.segments.some((s) => (s.parallelArrows ?? 0) > 0)).toBe(true);
      expect(verifyGeometryFigure(r.figure!).issues.filter((x) => x.severity === "error")).toEqual([]);
    });
  });
});
