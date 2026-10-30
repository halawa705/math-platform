/**
 * @file geometry-notebooklm-intake-corpus.test.ts
 * @description مجموعة أوصاف بصيغة ردود NotebookLM (عربي/لاتيني/LaTeX مختلط): كلها يجب أن تُفهم وتُرسم وتجتاز التحقق القياسي بلا تحذيرات.
 */
import { describe, it, expect } from "vitest";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { verifyGeometryFigure } from "@/core/geometry-engine/verification/geometry-figure-verification-orchestrator";

const DESCRIPTIONS: readonly string[] = [
 "مثلث $ABC$ قائم الزاوية في $B$ ، $AB = 6$ سم ، $BC = 8$ سم",
 "$\\triangle ABC$ فيه $m(\\angle B) = 90^\\circ$ و $AB = 6$ cm و $BC = 8$ cm و $D$ منتصف $\\overline{AC}$",
 "مثلث أ ب جـ متساوي الساقين فيه أ ب = أ جـ = 5 سم ، ب جـ = 6 سم ، د منتصف ب جـ",
 "ABC مثلث ، D ∈ AB ، E ∈ AC ، DE // BC ، AD = 3 سم ، DB = 2 سم ، DE = 4 سم",
 "دائرة مركزها M ، AB وتر فيها ، AB = 8 سم ، نصف القطر = 5 سم",
 "ABCD متوازي أضلاع فيه m(∠A) = 65° و AB = 8 و AD = 5",
 "مثلث ABC فيه AB = 7 و BC = 9 و AC = 5 والزاوية B = 40",
 "في الشكل المقابل: ABCD شبه منحرف فيه AB // DC ، AB = 10 ، DC = 6 ، AD = 5",
 "مستطيل ABCD طوله 8 وعرضه 6 وقطراه يتقاطعان في M",
 "مثلث ABC قائم في B ، BD ⊥ AC ، AD = 4 ، DC = 9",

 "المثلث ABC قائم الزاوية في B حيث AB = 5 سم و BC = 12 سم ، أوجد AC",
 "في المثلث $ABC$ : $D$ منتصف $\\overline{AB}$ ، $E$ منتصف $\\overline{AC}$ ، $DE = 4$ cm",
 "مثلث ABC فيه m(∠ A) = 70° ، m(∠ B) = 50° ، AB = 8 سم",
 "ABC مثلث متساوي الأضلاع طول ضلعه ٦ سم ، D منتصف BC",
 "مثلث ABC متساوي الساقين فيه AB = AC ، D منتصف BC ، AD ⊥ BC",
 "في المثلث ABC ، BD ينصف ∠ABC ويقطع AC في D ، AB = 6 ، BC = 9",
 "مثلث ABC فيه AD متوسط ، AB = 7 ، AC = 9 ، BC = 8",
 "ABCD مستطيل فيه AB = 8 سم ، BC = 6 سم ، AC قطر",
 "ABCD معين قطراه يتقاطعان في M ، AC = 8 ، BD = 6",
 "ABCD مربع طول ضلعه 5 سم وقطراه يتقاطعان في M",
 "ABCD شبه منحرف فيه AB // DC ، m(∠ A) = 90° ، AB = 9 ، DC = 5 ، AD = 4",
 "ABCD متوازي أضلاع ، قطراه يتقاطعان في M ، m(∠ ABC) = 110°",
 "دائرة مركزها M ونصف قطرها 5 سم ، AB وتر فيها طوله 8 سم",
 "دائرة مركزها O ، AB قطر فيها ، C تنتمي إلى الدائرة",
 "دائرة مركزها M ، النقطة A على الدائرة ، AB مماس للدائرة عند A",
 "مثلث ABC فيه D ∈ BC ، AD ⊥ BC ، AD = 4 ، BD = 3 ، DC = 6",
 "$\\triangle ABC$ قائم الزاوية في $A$ و $AD \\perp BC$ حيث $D \\in BC$ ، $AB = 6$ ، $AC = 8$",
 "مثلث أ ب جـ قائم الزاوية في ب ، د منتصف أ جـ ، ب د = 5 سم",
 "ΔABC فيه DE // BC حيث D ∈ AB و E ∈ AC ، AD = 4 ، DB = 6 ، AE = 3",
 "مثلث ABC ، مدّ BC إلى D ، m(∠ ACD) = 120° ، m(∠ A) = 70°",
 "في الشكل المقابل ABCD رباعي دائري ، m(∠ A) = 100°",
 "مثلث ABC فيه AB = AC = 10 ، BC = 12",
 "المستقيم AB يقطع المستقيمين المتوازيين CD و EF في M و N ، m(∠ AMD) = 65°",
 "مثلثان ABC و DEF متشابهان ، AB = 6 ، DE = 9",
 "ABCD مستطيل ، M نقطة تقاطع قطريه ، m(∠ AMB) = 60°",
];

describe("NotebookLM geometry description intake", () => {
  DESCRIPTIONS.forEach((desc, i) => {
    it(`#${i + 1}: ${desc.slice(0, 48)}`, () => {
      const res = matchGeometryWithDiagnostics(desc, `intake_${i}`, "english");
      expect(res.figure, "figure should be produced").toBeDefined();
      expect(res.warnings).toEqual([]);
      const report = verifyGeometryFigure(res.figure!);
      expect(report.issues.filter((x) => x.severity === "error")).toEqual([]);
    });
  });
});
