/**
 * @file golden-metamorphic-variant-generator.test.ts
 * @description اختبارات وحدة مولّد المتغيرات الصامدة للمجموعة الذهبية (المهمة 0.2).
 */

import { describe, it, expect } from "vitest";
import {
  generateMetamorphicVariant,
  generateVariantsForCase,
  expandCorpusWithMetamorphicVariants,
} from "@/core/geometry-engine/baseline-measurement/golden-metamorphic-variant-generator";
import { loadGoldenGeometryCorpus } from "@/core/geometry-engine/baseline-measurement/golden-corpus-json-directory-loader";
import type { GoldenCorpusCase } from "@/core/geometry-engine/baseline-measurement/golden-corpus-case-types-ssot";

describe("Golden Metamorphic Variant Generator (Task 0.2)", () => {
  const sampleCase: GoldenCorpusCase = {
    id: "sample_right_triangle",
    gradeId: "prep-1",
    branchId: "plane_geometry",
    problemText: "مثلث أ ب جـ قائم في ب احسب مساحته",
    geometryRaw: "مثلث أ ب جـ قائم في ب ; أ ب = 6 سم ; ب جـ = 8 سم",
    expectedOutcome: "figure",
    expectedGivenNumbers: ["6", "8"],
    source: "test-fixtures",
    humanVerdict: "unreviewed",
    expectedFigureSpec: {
      vertices: ["أ", "ب", "جـ"],
      displayedLengths: ["6", "8"],
      displayedAngles: ["90"],
    },
  };

  it("يولّد متغير إعادة ترتيب الحقائق (reordered_facts)", () => {
    const v = generateMetamorphicVariant(sampleCase, "reordered_facts");
    expect(v.id).toBe("sample_right_triangle_meta_reorder");
    expect(v.geometryRaw).toContain("ب جـ = 8 سم ; أ ب = 6 سم");
  });

  it("يولّد متغير تدوير الحروف (relettered_vertices)", () => {
    const v = generateMetamorphicVariant(sampleCase, "relettered_vertices");
    expect(v.id).toBe("sample_right_triangle_meta_reletter");
    expect(v.geometryRaw).toContain("س");
    expect(v.geometryRaw).toContain("ص");
    expect(v.geometryRaw).toContain("ع");
  });

  it("يولّد متغير تحجيم الأرقام المتسق (scaled_metrics)", () => {
    const v = generateMetamorphicVariant(sampleCase, "scaled_metrics");
    expect(v.id).toBe("sample_right_triangle_meta_scaled");
    expect(v.geometryRaw).toContain("12");
    expect(v.geometryRaw).toContain("16");
    expect(v.expectedGivenNumbers).toEqual(["12", "16"]);
  });

  it("يولّد متغير تبديل الأرقام بين المشرقية والغربية (notation_numerals_toggle)", () => {
    const v = generateMetamorphicVariant(sampleCase, "notation_numerals_toggle");
    expect(v.id).toBe("sample_right_triangle_meta_notation");
    expect(v.geometryRaw).toMatch(/[٠-٩]/);
  });

  it("يولّد >= 3 متغيرات صامدة صالحة لكل حالة", () => {
    const variants = generateVariantsForCase(sampleCase, 3);
    expect(variants.length).toBeGreaterThanOrEqual(3);
    const ids = new Set(variants.map((v) => v.id));
    expect(ids.size).toBe(variants.length);
  });

  it("يوسّع المجموعة الذهبية الحالية لتتجاوز >= 1,500 حالة (375 أساسية + 3 متغيرات لكل حالة)", () => {
    const baseCorpus = loadGoldenGeometryCorpus();
    expect(baseCorpus.length).toBeGreaterThanOrEqual(375);

    const expanded = expandCorpusWithMetamorphicVariants(baseCorpus, 3);
    expect(expanded.length).toBeGreaterThanOrEqual(1500);

    // التحقق من تفرد المعرفات في المجموعة الموسعة
    const seenIds = new Set<string>();
    for (const c of expanded) {
      expect(seenIds.has(c.id)).toBe(false);
      seenIds.add(c.id);
    }
  });
});
