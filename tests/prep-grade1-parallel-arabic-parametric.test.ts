/**
 * @file prep-grade1-parallel-arabic-parametric.test.ts
 * @description اختبار شامل لرسم جميع أفكار درس التوازي الستة (أولى إعدادي) بارامترياً من مخرجات NotebookLM الحقيقية:
 * 1. الفكرة 1: حساب زوايا التبادل والتناظر والتداخل (قاطع ممتد وقاطع مباشر وتوازي ضلعين متعاقبين).
 * 2. الفكرة 2: المعادلات الجبرية في التوازي.
 * 3. الفكرة 3: الزاوية المنكسرة بين مستقيمين متوازيين (حادة، منفرجة، منعكسة، ومعلومية المنكسرة).
 * 4. الفكرة 4: إثبات توازي مستقيمين.
 * 5. الفكرة 5: التوازي مع منصفات الزوايا.
 * 6. الفكرة 6: نتائج ونظريات التوازي (ثلاثة متوازيات والمستقيمات العمودية).
 */
import { describe, expect, it } from "vitest";
import { matchGeometryWithDiagnostics } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { combineProblemAndTagGeometryContext } from "../src/core/geometry-engine/description-intake/problem-geometry-context-extractor";
import { verifyGeometryFigure } from "../src/core/geometry-engine/verification/geometry-figure-verification-orchestrator";

const REAL_NOTEBOOKLM_CASES: readonly { readonly id: string; readonly tag?: string; readonly prompt: string }[] = [
  {
    id: "idea1-ex1",
    prompt: "في الشكل المقابل، إذا كان AB \\parallel CD، والمستقيم EF يقطع AB في G ويقطع CD في H، وكان m(\\angle EGB) = 70^{\\circ}، فأوجد بالبرهان m(\\angle GHD) و m(\\angle GHC).",
    tag: "AB // CD ; EF قاطع لـ AB في G ولـ CD في H ; m(∠EGB) = 70° ; المطلوب: m(∠GHD) و m(∠GHC)",
  },
  {
    id: "idea1-ex2",
    prompt: "في الشكل المقابل، إذا كان AB \\parallel CD، والقطعة AC قاطعة لهما، وكان m(\\angle BAC) = 55^{\\circ}، فأوجد بالبرهان m(\\angle ACD).",
    tag: "AB // CD ; AC قاطع لهما ; m(∠BAC) = 55° ; المطلوب: m(∠ACD)",
  },
  {
    id: "idea1-drill3",
    prompt: "في الشكل المقابل، إذا كان AB \\parallel CD والقطعة BC قاطعة لهما، وكان m(\\angle ABC) = 115^{\\circ}، فأوجد قياس \\angle BCD.",
    tag: "AB // CD ; BC قاطع لهما ; m(∠ABC) = 115° ; المطلوب: m(∠BCD)",
  },
  {
    id: "idea1-drill4",
    prompt: "في الشكل المقابل، إذا كان AB \\parallel CD و BC \\parallel DE، وكان m(\\angle B) = 50^{\\circ}، فأوجد بالبرهان قياس \\angle D.",
    tag: "AB // CD ; BC // DE ; m(∠B) = 50° ; المطلوب: m(∠D)",
  },
  {
    id: "idea2-drill1",
    prompt: "في الشكل المقابل، إذا كان AB \\parallel CD وكان m(\\angle BAC) = (4x)^{\\circ} و m(\\angle ACD) = 120^{\\circ} بالتبادل الداخلي، فأوجد قيمة x.",
    tag: "AB // CD ; AC قاطع لهما ; m(∠BAC) = (4x)° ; m(∠ACD) = 120° ; المطلوب: قيمة x",
  },
  {
    id: "idea2-drill4",
    prompt: "في الشكل المقابل، إذا كان AB \\parallel CD وكان m(\\angle BAF) = (5x - 15)^{\\circ} و m(\\angle CGE) = (3x + 25)^{\\circ} في وضع تبادل خارجي، فأوجد قيمة x.",
    tag: "AB // CD ; EF قاطع لهما في A و C ; m(∠BAF) = (5x-15)° ; m(∠CGE) = (3x+25)° ; المطلوب: قيمة x",
  },
  {
    id: "idea2-hw4",
    prompt: "في الشكل المقابل، إذا كان AB \\parallel CD والقطعة BC قاطعة لهما، وكان m(\\angle ABC) = (3x + 15)^{\\circ} و m(\\angle BCD) = (2x + 40)^{\\circ}، فاحسب قيمة x بالبرهان إذا علمت أن الزاويتين متداخلتان وفي جهة واحدة من القاطع.",
    tag: "AB // CD ; BC قاطع لهما ; m(∠ABC) = (3x+15)° ; m(∠BCD) = (2x+40)° ; المطلوب: قيمة x بالبرهان",
  },
  {
    id: "idea3-ex1",
    prompt: "في الشكل المقابل، إذا كان AB \\parallel CD، وكان m(\\angle BAE) = 45^{\\circ} و m(\\angle ECD) = 35^{\\circ}، حيث النقطة E تقع بين المستقيمين المتوازيين، فأوجد بالبرهان قياس الزاوية المنكسرة m(\\angle AEC).",
    tag: "AB // CD ; E نقطة بينهما ; m(∠BAE) = 45° ; m(∠ECD) = 35° ; المطلوب: m(∠AEC)",
  },
  {
    id: "idea3-ex2",
    prompt: "في الشكل المقابل، إذا كان AB \\parallel CD، وكان m(\\angle BAE) = 120^{\\circ} و m(\\angle ECD) = 130^{\\circ}، حيث الزاوية المنكسرة \\angle AEC في الجهة الداخلية بين المستقيمين، فأوجد بالبرهان قياس \\angle AEC.",
    tag: "AB // CD ; m(∠BAE) = 120° ; m(∠ECD) = 130° ; المطلوب: m(∠AEC)",
  },
  {
    id: "idea3-drill3",
    prompt: "في الشكل المقابل، إذا كان AB \\parallel CD وكان m(\\angle BAE) = 55^{\\circ} و m(\\angle AEC) = 95^{\\circ}، فأوجد بالبرهان قياس \\angle ECD.",
    tag: "AB // CD ; m(∠BAE) = 55° ; m(∠AEC) = 95° ; المطلوب: m(∠ECD)",
  },
  {
    id: "idea3-drill4",
    prompt: "في الشكل المقابل، إذا كان الشعاع AB \\parallel CD والزاوية المنكسرة المنعكسة m(\\angle AEC) = 290^{\\circ}، وكان m(\\angle BAE) = 130^{\\circ}، فأوجد قياس \\angle ECD.",
    tag: "AB // CD ; m(∠AEC) المنعكسة = 290° ; m(∠BAE) = 130° ; المطلوب: m(∠ECD)",
  },
  {
    id: "idea4-ex1",
    prompt: "في الشكل المقابل، إذا كان m(\\angle BAC) = 65^{\\circ} و m(\\angle ACD) = 65^{\\circ}، والقطعة AC قاطعة لهما، فأثبت بالبرهان أن الشعاع AB \\parallel CD.",
    tag: "m(∠BAC) = 65° ; m(∠ACD) = 65° ; AC قاطع لهما ; المطلوب: إثبات أن AB // CD",
  },
  {
    id: "idea4-drill4",
    prompt: "في الشكل المقابل، إذا كان m(\\angle A) = 120^{\\circ} و m(\\angle B) = 60^{\\circ} و m(\\angle C) = 120^{\\circ}، فأثبت أن AD \\parallel BC و AB \\parallel CD.",
    tag: "m(∠A) = 120° ; m(∠B) = 60° ; m(∠C) = 120° ; المطلوب: إثبات أن AD // BC و AB // CD",
  },
  {
    id: "idea5-ex1",
    prompt: "في الشكل المقابل، إذا كان AB \\parallel CD، والقطعة BC قاطعة لهما، وكان الشعاع BE ينصف \\angle ABC والشعاع CF ينصف \\angle BCD، فأثبت بالبرهان أن BE \\parallel CF.",
    tag: "AB // CD ; BC قاطع لهما ; BE ينصف ∠ABC ; CF ينصف ∠BCD ; المطلوب: إثبات أن BE // CF",
  },
  {
    id: "idea5-ex2",
    prompt: "في الشكل المقابل، إذا كان AB \\parallel CD و AD \\parallel BC (شكل متوازي أضلاع ABCD)، وكان m(\\angle ABC) = 80^{\\circ}، وكان الشعاع DE ينصف \\angle ADC، فأوجد بالبرهان m(\\angle CDE).",
    tag: "ABCD متوازي أضلاع فيه AB // CD ; AD // BC ; m(∠ABC) = 80° ; DE ينصف ∠ADC ; المطلوب: m(∠CDE)",
  },
  {
    id: "idea5-drill4",
    prompt: "في الشكل المقابل، إذا كان AB \\parallel CD وكان الشعاع BE ينصف \\angle ABC والشعاع CE ينصف \\angle BCD حيث التقيا في النقطة E، فأثبت أن m(\\angle BEC) = 90^{\\circ}.",
    tag: "AB // CD ; BE ينصف ∠ABC ; CE ينصف ∠BCD ; E نقطة تقاطعهما ; المطلوب: إثبات أن m(∠BEC) = 90°",
  },
  {
    id: "idea6-ex1",
    prompt: "في الشكل المقابل، إذا كان AB \\parallel CD و CD \\parallel EF، وكان m(\\angle BAC) = 50^{\\circ} و m(\\angle CFE) = 130^{\\circ}، فأثبت أن AB \\parallel EF، ثم أوجد قياس \\angle ACE.",
    tag: "AB // CD ; CD // EF ; m(∠BAC) = 50° ; m(∠CFE) = 130° ; المطلوب: إثبات أن AB // EF و حساب m(∠ACE)",
  },
  {
    id: "idea6-hw4",
    prompt: "في الشكل المقابل، إذا كان L_1 \\parallel L_2 والمستقيم L_3 \\perp L_1 عند النقطة A، والمستقيم L_4 \\parallel L_3 يقطع L_2 في النقطة C، فأثبت بالبرهان أن L_4 \\perp L_2.",
    tag: "L1 // L2 ; L3 ⊥ L1 ; L4 // L3 ; المطلوب: إثبات أن L4 ⊥ L2",
  },
];

describe("Prep Grade 1 Parallelism — Full 6 Ideas Parametric Coverage", () => {
  REAL_NOTEBOOKLM_CASES.forEach((tc) => {
    it(`${tc.id}: يولد شكلاً هندسياً أخضر بصفر تحذيرات وصفر أخطاء قياس`, () => {
      const combined = combineProblemAndTagGeometryContext(tc.tag, tc.prompt);
      const res = matchGeometryWithDiagnostics(combined, `fig_${tc.id}`, "english");
      expect(res.decision).toBe("green");
      expect(res.warnings).toEqual([]);
      expect(res.figure).toBeDefined();
      expect(verifyGeometryFigure(res.figure!).issues.filter((x) => x.severity === "error")).toEqual([]);
    });
  });
});
