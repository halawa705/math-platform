import { describe, it, expect } from "vitest";
import { splitDescriptionIntoFactStrings as sp } from "@/core/geometry-engine/fact-compositor/geo-fact-splitter";
import { parseGeoFactString as pf } from "@/core/geometry-engine/fact-compositor/geo-fact-parser";
import { composeFigureFromGeometryDescription as c } from "@/core/geometry-engine/fact-compositor/geo-figure-composer";

const parse = (s: string) => sp(s).map(pf);
describe("fact parser", () => {
  it("مثلث قائم", () => expect(parse("مثلث أ ب جـ قائم في ب")[0]).toMatchObject({ k: "triangle", labels: ["A", "B", "C"], right: "B" }));
  it("طول", () => expect(parse("أ ب = 6 سم")[0]).toMatchObject({ k: "length", seg: ["A", "B"], numeric: 6 }));
  it("توازي", () => expect(parse("د هـ // ب جـ")[0]).toMatchObject({ k: "parallel" }));
  it("تشابه ينتج مثلثين", () => expect(parse("Δ ABC ~ Δ DEF").map((f) => f?.k)).toEqual(["triangle", "triangle"]));
  it("سلسلة تساوي", () => expect(sp("أ ب = أ جـ = 7").length).toBe(3));
  it("سطر غير مفهوم = null", () => expect(parse("كلام عشوائي")[0]).toBeNull());
});
describe("composer", () => {
  it("مثلث قائم 6-8-10", () => {
    const r = c("مثلث أ ب جـ قائم في ب ; أ ب = 6 ; ب جـ = 8", "f", "english");
    expect(r.figure?.vertices.length).toBe(3); expect(r.figure?.angles[0].isRightAngle).toBe(true);
  });
  it("طاليس: النقطة د عند 2/5", () => {
    const r = c("مثلث أ ب جـ ; د على أ ب ; هـ على أ جـ ; د هـ // ب جـ ; أ د = 2 ; د ب = 3", "f", "english");
    const v = (l: string) => r.figure!.vertices.find((x) => x.label === l)!.position;
    const A = v("A"), B = v("B"), D = v("D");
    expect(Math.hypot(D.x - A.x, D.y - A.y) / Math.hypot(B.x - A.x, B.y - A.y)).toBeCloseTo(0.4, 2);
    const C = v("C"), E = v("E"); // DE ∥ BC
    expect((D.x - E.x) * (B.y - C.y) - (D.y - E.y) * (B.x - C.x)).toBeCloseTo(0, 5);
  });
  it("إقليدس: أ د عمودي على ب جـ", () => {
    const r = c("مثلث أ ب جـ قائم في أ ; أ د ⊥ ب جـ ; أ ب = 6 ; أ جـ = 8", "f", "english");
    const v = (l: string) => r.figure!.vertices.find((x) => x.label === l)!.position;
    const A = v("A"), B = v("B"), C = v("C"), D = v("D");
    expect((D.x - A.x) * (C.x - B.x) + (D.y - A.y) * (C.y - B.y)).toBeCloseTo(0, 5);
  });
  it("مثلثان متشابهان = 6 رؤوس + polygons", () => {
    const r = c("Δ ABC ~ Δ DEF ; AB = 4 ; BC = 6 ; CA = 8 ; DE = 2 ; EF = 3 ; FD = 4", "f", "english");
    expect(r.figure?.vertices.length).toBe(6); expect(r.figure?.polygons?.length).toBe(2);
  });
  it("وصف بلا شكل = null + تحذير", () => { const r = c("شكل غريب", "f"); expect(r.figure).toBeNull(); expect(r.warnings.length).toBeGreaterThan(0); });
  it("تدوين عربي", () => expect(c("مثلث A B C", "f", "arabic").figure?.vertices.map((v) => v.label)).toEqual(["أ", "ب", "جـ"]));
});
describe("circle composer (G-7)", () => {
  it("نقاط على بعد r من المركز", () => {
    const r = c("دائرة مركزها م ; نق = 5 ; أ ب جـ على الدائرة", "f", "english");
    expect(r.figure?.familyId).toBe("circle_family");
    const M = r.figure!.vertices.find((x) => x.id.includes("center"))!.position;
    const A = r.figure!.vertices.find((x) => x.label === "A")!.position;
    expect(Math.hypot(A.x - M.x, A.y - M.y)).toBeCloseTo(5, 5);
  });
  it("القطر يمر بالمركز", () => {
    const r = c("دائرة مركزها م ; نق = 6 ; أ ب قطر", "f", "english");
    const v = (l: string) => r.figure!.vertices.find((x) => x.label === l)!.position;
    const A = v("A"), B = v("B");
    expect((A.x + B.x) / 2).toBeCloseTo(0, 5);
    expect((A.y + B.y) / 2).toBeCloseTo(0, 5);
  });
  it("المماس عمودي على نصف القطر", () => {
    const r = c("دائرة مركزها م ; نق = 5 ; أ جـ مماس للدائرة عند أ", "f", "english");
    const v = (l: string) => r.figure!.vertices.find((x) => x.label === l)!.position;
    const M = v("M"), A = v("A"), C = v("C");
    expect((A.x - M.x) * (C.x - A.x) + (A.y - M.y) * (C.y - A.y)).toBeCloseTo(0, 5);
  });
  it("وصف دائرة بلا نقاط إضافية لا يسقط", () => {
    const r = c("دائرة مركزها م", "f", "english");
    expect(r.figure?.familyId).toBe("circle_family");
    expect(r.figure?.vertices.length).toBeGreaterThanOrEqual(2);
  });
});
