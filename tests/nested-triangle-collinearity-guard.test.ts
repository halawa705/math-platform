import { describe, it, expect } from "vitest";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";

function pos(fig: { vertices: readonly { label: string; position: { x: number; y: number } }[] }, l: string) {
  return fig.vertices.find((v) => v.label === l)!.position;
}
function collinear(a: { x: number; y: number }, m: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.abs((m.x - a.x) * (b.y - a.y) - (m.y - a.y) * (b.x - a.x)) < 0.05;
}

describe("Nested triangle figures keep true triangle sides", () => {
  it("ΔAEC ~ ΔDEB with AC // DB: A on ED and C on EB (real triangle EDB)", () => {
    const d = matchGeometryWithDiagnostics("[رسم هندسي: ΔAEC ~ ΔDEB، AC // DB، EA = 6، AC = 9] أثبت أن ΔAEC ~ ΔDEB ثم احسب طول CE.", "t", "english");
    const f = d.figure!;
    expect(collinear(pos(f, "E"), pos(f, "A"), pos(f, "D"))).toBe(true);
    expect(collinear(pos(f, "E"), pos(f, "C"), pos(f, "B"))).toBe(true);
  });

  it("similarity ratio phrased with «نسبة تشابه ΔADE إلى ΔABC» draws nested triangles", () => {
    const d = matchGeometryWithDiagnostics("في الشكل المقابل، إذا كان DE // BC وكانت نسبة تشابه ΔADE إلى ΔABC هي 2/3 وكان محيط ΔABC = 24 سم، فأوجد محيط ΔADE.", "t", "english");
    const f = d.figure!;
    expect(f.vertices.map((v) => v.label).sort()).toEqual(["A", "B", "C", "D", "E"]);
    expect(collinear(pos(f, "A"), pos(f, "D"), pos(f, "B"))).toBe(true);
    expect(collinear(pos(f, "A"), pos(f, "E"), pos(f, "C"))).toBe(true);
  });
});
