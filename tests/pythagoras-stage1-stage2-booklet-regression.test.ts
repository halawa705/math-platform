/**
 * @file pythagoras-stage1-stage2-booklet-regression.test.ts
 * @description اختبارات منع التراجع لإصلاحات مذكرة فيثاغورس (المرحلتين 1 و 2) ودقة رسم الزوايا والمربعات والأشكال الرباعية المركبة.
 */
import { describe, expect, it } from "vitest";
import { mergeBookletThreeStagesRepliesToPrintableItems } from "@/core/ingestion/notebooklm-booklet-stages-merger";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { measureAngleDegrees } from "@/core/geometry-engine/verification/figure-vector-measure-helpers";
import { verifyGeometryFigure } from "@/core/geometry-engine/verification/geometry-figure-verification-orchestrator";

describe("Pythagoras Stage 1 & Stage 2 Regression Suite", () => {
  it("renders a 100 degree obtuse triangle angle with accurate vector geometry", () => {
    const res = matchGeometryWithDiagnostics(
      "[رسم هندسي: مثلث ABC فيه ق(∠ A) = 100° ; AB = 6 سم ; AC = 8 سم]",
      "reg_obtuse_100",
      "english"
    );
    expect(res.figure, "figure must be produced").toBeDefined();
    expect(res.warnings).toEqual([]);
    const vMap = new Map(res.figure!.vertices.map((v) => [v.label, v]));
    const a = vMap.get("A")!;
    const b = vMap.get("B")!;
    const c = vMap.get("C")!;
    const measuredA = measureAngleDegrees(a.position, b.position, c.position);
    expect(measuredA).toBeCloseTo(100, 1);
  });

  it("handles algebraic side lengths symbolically without false triangle-inequality rejection", () => {
    const cases = [
      "[رسم هندسي: مثلث ABC قائم الزاوية في B ; AB = x سم ; BC = 8 سم ; AC = 17 سم]",
      "[رسم هندسي: مثلث ABC قائم الزاوية في B ; AB = 2x - 1 سم ; BC = 12 سم ; AC = 13 سم]",
      "[رسم هندسي: مثلث XYZ قائم في Y ; XY = 3x سم ; YZ = 4x سم ; XZ = 25 سم]",
    ];
    cases.forEach((desc, idx) => {
      const res = matchGeometryWithDiagnostics(desc, `reg_alg_${idx}`, "english");
      expect(res.figure, `case ${idx} should render`).toBeDefined();
      expect(res.warnings).toEqual([]);
      const labels = res.figure!.segments.map((s) => s.lengthLabel?.value).filter(Boolean);
      expect(labels.some((v) => typeof v === "string" && /[x]/.test(v))).toBe(true);
    });
  });

  it("renders outward squares on triangle sides for areaOnSide facts", () => {
    const desc =
      "في الشكل المقابل $\\triangle LMN$ قائم الزاوية في $M$. `[رسم هندسي: مثلث LMN قائم الزاوية في M ; مساحة المربع على LN = 169 سم^2 ; مساحة المربع على MN = 25 سم^2 ; المطلوب: مساحة المربع المنشأ على LM وطول LM]`";
    const res = matchGeometryWithDiagnostics(desc, "reg_area_on_side", "english");
    expect(res.figure).toBeDefined();
    expect(res.warnings).toEqual([]);
    expect((res.figure!.shadedRegions || []).length).toBeGreaterThanOrEqual(2);
    expect((res.figure!.interiorBadges || []).length).toBeGreaterThanOrEqual(2);
    expect(res.figure!.segments.length).toBeGreaterThanOrEqual(9);
  });

  it("builds general composite quads with two right angles, radical lengths, and oriented isosceles trapezoids", () => {
    const compositeQuad =
      "في الشكل المقابل، $ABCD$ شكل رباعي فيه $m(\\angle C) = 90^\\circ$، $BC = 12\\text{ سم}$، $CD = 5\\text{ سم}$، $AB = 13\\text{ سم}$، $AD = 13\\sqrt{2}\\text{ سم}$. أوجد طول $BD$، وأثبت أن $\\triangle ABD$ قائم الزاوية في $B$. `[رسم هندسي: شكل رباعي ABCD ; m(∠C) = 90° ; BC = 12 سم ; CD = 5 سم ; AB = 13 سم ; AD = 13*جذر(2) سم ; القطر BD واصل بين B و D ; المطلوب: طول BD وإثبات أن m(∠ABD) = 90°]`";
    const r1 = matchGeometryWithDiagnostics(compositeQuad, "reg_comp_quad_rad", "english");
    expect(r1.figure).toBeDefined();
    expect(r1.warnings).toEqual([]);
    const r1Verify = verifyGeometryFigure(r1.figure!);
    expect(r1Verify.issues.filter((x) => x.severity === "error")).toEqual([]);

    const radicalQuad =
      "[رسم هندسي: شكل رباعي ABCD فيه AB = 2 سم ; BC = 4 سم ; AD = 8 سم ; DC = 2*جذر(42) سم ; ∠ B = 90° ; ∠ ACD = 90° ; AC قطر واصل بين A و C]";
    const r2 = matchGeometryWithDiagnostics(radicalQuad, "reg_comp_quad_r2", "english");
    expect(r2.figure).toBeDefined();
    expect(r2.warnings).toEqual([]);

    const isoTrap =
      "[رسم هندسي: شبه منحرف متساوي الساقين ABCD ; AD // BC ; AD = 10 سم ; BC = 22 سم ; AB = 10 سم ; DC = 10 سم]";
    const r3 = matchGeometryWithDiagnostics(isoTrap, "reg_iso_trap", "english");
    expect(r3.figure).toBeDefined();
    expect(r3.warnings).toEqual([]);
  });

  it("keeps 2nd-prep ladder Pythagoras problems out of Grade 3 Trigonometry catalog", () => {
    const ladderDesc =
      "سلم طوله 10 أمتار يستند بطرفه العلوي على حائط رأسي بحيث يبعد طرفه السفلي عن قاعدة الحائط مسافة 6 أمتار. `[رسم هندسي: مثلث ABC قائم الزاوية في B ; AC يمثل السلم وطوله 10 م ; BC يمثل المسافة الأفقية وطولها 6 م ; AB يمثل ارتفاع الحائط]`";
    const res = matchGeometryWithDiagnostics(ladderDesc, "reg_ladder_pyth", "english");
    expect(res.figure).toBeDefined();
    expect(res.warnings).toEqual([]);
    expect(res.figure!.branchId).not.toContain("trig");
  });

  it("preserves Stage 2 multi-part (1)(2)(3) sub-questions inside one question and adjacent squares", () => {
    const stage1 = `### الفكرة العاشرة: مساحات مركبة | معرف الفكرة: idea-10
**مفهوم الفكرة:** تطبيق فيثاغورس مرتين.
**القاعدة الرياضية:** $a^2 + b^2 = c^2$
#### المثال 1 | معرف المثال: example-10-01
**نص المسألة:** مثلث $ABC$ قائم في $B$ فيه $AB = 3$ سم، $BC = 4$ سم. أوجد $AC$.
\`[رسم هندسي: مثلث ABC قائم في B ; AB = 3 سم ; BC = 4 سم]\`
**خطوات الحل:**
1. $AC = 5$ سم.
**الناتج النهائي:** $5$ سم.`;

    const stage2 = `### الفكرة العاشرة: مساحات مركبة | معرف الفكرة: idea-10
#### حاول بنفسك:
 المربعان $ABCD$ ضلعه $6$ سم والمربع $DEFG$ ضلعه $8$ سم متجاوران على استقامة واحدة $C, D, E$ أوجد $BE$.
\`[رسم هندسي: المربع ABCD ضلعه 6 سم والمربع DEFG ضلعه 8 سم متجاوران ; C و D و E على استقامة واحدة]\` | معرف السؤال: practice-10-01

#### تمارين الواجب المنزلي:
#1 [مقالي] في الشكل المقابل شكل رباعي $ABCD$ فيه $AB = 6$ سم، $BC = 8$ سم، $CD = 24$ سم، $AD = 26$ سم، $m(\\angle B) = 90^\\circ$.
(1) أوجد طول $AC$.
(2) أثبت أن $m(\\angle ACD) = 90^\\circ$.
(3) احسب مساحة الشكل $ABCD$.
\`[رسم هندسي: شكل رباعي ABCD فيه AB = 6 سم ; BC = 8 سم ; CD = 24 سم ; AD = 26 سم ; ∠ B = 90° ; AC قطر في الشكل]\` | معرف السؤال: homework-10-01`;

    const items = mergeBookletThreeStagesRepliesToPrintableItems({
      stage1Raw: stage1,
      stage2Raw: stage2,
      branchId: "plane_geometry",
      branchNameAr: "الهندسة المستوية",
      unitId: "u3",
      lessonId: "l1",
      lessonTitleArabic: "نظرية فيثاغورس",
    });

    const drills = items.filter((i) => i.id.includes("-drill-"));
    const hw = items.filter((i) => i.id.includes("-hw-"));
    expect(drills).toHaveLength(1);
    expect(hw).toHaveLength(1);
    expect(hw[0].promptAr).toContain("(1)");
    expect(hw[0].promptAr).toContain("(2)");
    expect(hw[0].promptAr).toContain("(3)");
    expect(drills[0].geometryFigure).toBeDefined();
    expect(hw[0].geometryFigure).toBeDefined();
    expect(hw[0].figureDiagnosticsAr ?? []).toEqual([]);
  });
});
