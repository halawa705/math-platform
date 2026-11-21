/**
 * @file prep-grade2-parallel-applications-catalog.test.ts
 * @description اختبارات الانحدار لرسوم مذكرات تطبيقات التوازي والمنتصفات في المركب العام (2ع).
 */

import { describe, it, expect } from "vitest";
import { matchGeometryWithDiagnostics } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";

describe("Prep Grade 2 Parallel Applications — Parametric Booklet Regressions", () => {
  it("resolves the 6 booklet diagram regressions (nested DEF, tower DE, bridge EF, parallelogram G/K, non-collapsed 2D triangles, 4 midpoints KLMN)", () => {
    // 1. حاول بنفسك 28: مثلث DEF مرسوم بربط منتصفات أضلاع المثلث ABC (يجب ألا يرسم مثلثين منفصلين)
    const p28 = matchGeometryWithDiagnostics(
      "إذا كان △DEF هو مثلث مرسوم بربط منتصفات أضلاع المثلث ABC، وكان محيط المثلث الأصغر DEF يساوي 18 سم، فما هو محيط المثلث الأكبر ABC؟",
      "fig_p28",
      "english"
    );
    expect(p28.figure, JSON.stringify(p28.warnings)).toBeDefined();
    expect(p28.figure!.polygons?.length).toBe(1);
    expect(p28.figure!.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E", "F"]));

    // 2. حاول بنفسك 51: برج اتصالات رأسي AB مع دعامة رأسية DE بين منتصف السلك D والأرض E
    const p51 = matchGeometryWithDiagnostics(
      "برج اتصالات رأسي AB ارتفاعه 30 متراً مقام على أرض أفقية. دُعّم البرج بسلك مشدود يصل من قمته A إلى نقطة C على الأرض. قام المهندسون بتثبيت دعامة رأسية DE تصل بين منتصف السلك D والأرض E. احسب طول الدعامة DE.",
      "fig_p51",
      "english"
    );
    expect(p51.figure, JSON.stringify(p51.warnings)).toBeDefined();
    expect(p51.figure!.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E"]));

    // 3. حاول بنفسك 53: جسر مشاة شبه منحرف ABCD مع الدعامتين المتوازيتين AD = 14 و BC = 22 وكابل EF
    const p53 = matchGeometryWithDiagnostics(
      "صمم مهندس جسراً مشاة على شكل شبه منحرف ABCD، حيث الدعامتان المتوازيتان قياسهما AD = 14 متراً و BC = 22 متراً. ولزيادة الأمان، تم تركيب كابل فولاذي وسيط EF يصل بين منتصفي جانبي الجسر AB و CD. احسب طول الكابل الفولاذي EF.",
      "fig_p53",
      "english"
    );
    expect(p53.figure).toBeDefined();
    const vA = p53.figure!.vertices.find((v) => v.label === "A")!;
    const vD = p53.figure!.vertices.find((v) => v.label === "D")!;
    const vB = p53.figure!.vertices.find((v) => v.label === "B")!;
    const vC = p53.figure!.vertices.find((v) => v.label === "C")!;
    expect(Math.abs(vA.position.y - vD.position.y)).toBeLessThan(0.5);
    expect(Math.abs(vB.position.y - vC.position.y)).toBeLessThan(0.5);

    // 4. مثال 56: متوازي أضلاع ABCD مع E منتصف BC و F منتصف AD والقطر AC يقطع BF في G و DE في K
    const ex56 = matchGeometryWithDiagnostics(
      "في الشكل المقابل، ABCD متوازي أضلاع. النقطة E منتصف BC، والنقطة F منتصف AD. رُسم القطر AC ليقطع BF في النقطة G ويقطع DE في النقطة K. أثبت بالبرهان أن AG = GK = KC.",
      "fig_ex56",
      "english"
    );
    expect(ex56.figure, JSON.stringify(ex56.warnings)).toBeDefined();
    expect(ex56.figure!.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E", "F", "G", "K"]));

    // 5. حاول بنفسك 57 و واجب 11: عدم انهيار المثلث ثنائي الأبعاد إلى خط أفقي أحادي البعد
    for (const [id, text] of [
      [
        "fig_p57",
        "في الشكل المقابل، △ABC فيه D منتصف AB، E منتصف AC. رُسم DF // AC ليقطع BC في F. أُخذت النقطة M منتصف DF، ورُسم المستقيم المار بالنقطة M موازياً BC ليقطع AC في N. أثبت أن طول MN = 1/4 BC.",
      ],
      [
        "fig_hw11",
        "في الشكل المقابل، △ABC فيه D منتصف AB، رُسم الشعاع DE // BC يقطع AC في E. ثم رُسم الشعاع EF // AB يقطع BC في F. إذا كان BC = 14 سم، فإن طول BF يساوي:",
      ],
    ] as const) {
      const res = matchGeometryWithDiagnostics(text, id, "english");
      expect(res.figure, `${id}: ${JSON.stringify(res.warnings)}`).toBeDefined();
      const xs = res.figure!.vertices.map((v) => v.position.x);
      const ys = res.figure!.vertices.map((v) => v.position.y);
      const spanX = Math.max(...xs) - Math.min(...xs);
      const spanY = Math.max(...ys) - Math.min(...ys);
      expect(Math.min(spanX, spanY) / Math.max(spanX, spanY)).toBeGreaterThan(0.22);
    }

    // 6. حاول بنفسك 47: شكل رباعي ABCD مع النقط K, L, M, N منتصفات الأضلاع الأربعة (عدم سقوط النقطة الأولى K)
    const p47 = matchGeometryWithDiagnostics(
      "في الشكل المقابل، ABCD شكل رباعي فيه AC = BD. النقط K, L, M, N منتصفات الأضلاع AB, BC, CD, DA على الترتيب. أثبت أن الشكل KLMN معين.",
      "fig_p47",
      "english"
    );
    expect(p47.figure).toBeDefined();
    expect(p47.figure!.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "K", "L", "M", "N"]));
  });
});
