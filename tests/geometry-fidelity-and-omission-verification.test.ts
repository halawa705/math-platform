import { describe, it, expect } from "vitest";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";

describe("Geometry Fidelity and Omission Verification", () => {
  it("verifies explicit figures are drawn correctly and non-figure questions have zero diagrams", () => {
    // 1. مسائل تطلب شكلاً هندسياً صريحاً (يجب توليد رسم دقيق ومطابق)
    const explicitFigureCases = [
      {
        name: "Example 13 (Antiparallel)",
        input: "[رسم هندسي: ΔADE ~ ΔACB، m(∠AED) = m(∠B)، AE = 5 سم، EC = 3 سم، AD = 4 سم، DE = 6 سم] في الشكل المقابل، أثبت أن ΔADE ~ ΔACB ، ثم أوجد طول كل من BC و DB.",
        expectedVertices: ["A", "B", "C", "D", "E"],
        expectedLengths: ["4", "5", "3", "6"],
      },
      {
        name: "Example 14 (Thales Parallel)",
        input: "[رسم هندسي: DE // BC، AD = 3 سم، DB = 6 سم، AE = 4 سم، DE = 5 سم] في الشكل المقابل، إذا كان DE // BC ، فأثبت أن ΔADE ~ ΔABC ، ثم أوجد طول كل من EC و BC.",
        expectedVertices: ["A", "B", "C", "D", "E"],
        expectedLengths: ["3", "6", "4", "5"],
      },
      {
        name: "Example 25 (Hourglass / Bowtie)",
        input: "[رسم هندسي: AB // CD، AC ∩ BD = {E}، AB = 6 سم، CD = 4 سم، AE = 7.5 سم، BD = 7 سم] في الشكل المقابل، AB // CD و AC ∩ BD = {E} ، إذا كان AB = 6 سم، CD = 4 سم، AE = 7.5 سم، BD = 7 سم ، فأثبت أن ΔABE ~ ΔCDE ، ثم أوجد طول كل من EC و DE.",
        expectedVertices: ["E", "A", "B", "C", "D"],
        expectedLengths: ["6", "4", "7.5"],
      },
      {
        name: "Example 61 (Euclid's Theorem)",
        input: "[رسم هندسي: ΔABC قائم في A، AD ⊥ BC، BD = 9 سم، CD = 16 سم] في الشكل المقابل، ΔABC مثلث قائم الزاوية في A، وفيه AD ⊥ BC ، إذا كان BD = 9 سم و CD = 16 سم ، فأثبت أن ΔABD ~ ΔCAD ، ثم احسب طول كل من AD و AB.",
        expectedVertices: ["A", "B", "C", "D"],
        expectedLengths: ["9", "16"],
      },
      {
        name: "Example 79 (Shadow & Lamppost)",
        input: "[رسم هندسي: رجل طوله 1.8 م يقف أمام عمود إنارة وعلى بعد 2 م من قاعدته، طول الظل 2.4 م] في الشكل المقابل، رجل طوله 1.8 متر يقف أمام عمود إنارة وعلى بعد 2 متر من قاعدته، فإذا كان طول ظل الرجل الناتج عن إنارة العمود هو 2.4 متر، فاحسب ارتفاع عمود الإنارة.",
        expectedVertices: ["A", "B", "C", "D", "E"],
        expectedLengths: ["1.8", "2.4"],
      },
    ];

    for (const ef of explicitFigureCases) {
      const diag = matchGeometryWithDiagnostics(ef.input, "test_fig", "english");
      expect(diag.figure, `Figure must be produced for ${ef.name}`).toBeDefined();
      const fig = diag.figure!;
      const labels = fig.vertices.map((v) => v.label);
      for (const ev of ef.expectedVertices) {
        expect(labels, `${ef.name} must contain vertex ${ev}`).toContain(ev);
      }
      const svg = projectGeometryFigureToSVGMarkup(fig, { numeralMode: "western" });
      for (const el of ef.expectedLengths) {
        expect(svg, `${ef.name} svg must contain length ${el}`).toContain(el);
      }
    }

    // 2. مسائل مباشرة وحسابية ونظرية بدون رسم (يجب أن يكون الناتج source = none وبلا رسم)
    const noFigureCases = [
      {
        name: "Example 8 (Perimeter ratio)",
        input: "إذا كانت النسبة بين طولي ضلعين متناظرين في مثلثين متشابهين هي 2 : 5 وكان محيط المثلث الأكبر يساوي 40 سم، فإن محيط المثلث الأصغر يساوي ........ سم.",
      },
      {
        name: "Try 10 (Perimeter ratio)",
        input: "إذا كانت النسبة بين طولي ضلعين متناظرين في مثلثين متشابهين هي 3 : 4 وكان محيط المثلث الأصغر 18 سم، فإن محيط المثلث الأكبر يساوي ........ سم.",
      },
      {
        name: "Homework #3 (Theoretical similarity factor)",
        input: "إذا كان معامل تشابه المثلث الأول للمثلث الثاني يساوي k وكان 0 < k < 1 فإن المثلث الأول يكون ........ للمثلث الثاني: (أ) تكبيراً (ب) تصغيراً (جـ) مطابقاً (د) مساوياً",
      },
      {
        name: "Homework #6 (Perimeter ratio)",
        input: "إذا كانت النسبة بين محيطي مثلثين متشابهين هي 2 : 5 وكان محيط المثلث الأكبر 50 سم، فإن محيط المثلث الأصغر يساوي ........ سم.",
      },
      {
        name: "Homework #8 (Dilation factor)",
        input: "إذا كان ΔABC ~ ΔDEF وكان AB = 1/3 DE، فإن محيط ΔABC / محيط ΔDEF = ........",
      },
      {
        name: "Homework #32 (Theoretical)",
        input: "إذا تناسبت أطوال أضلاع مثلثين، فإن الزوايا المتناظرة تكون: (أ) متناسبة (ب) متكاملة (جـ) متساوية في القياس (د) متتامة",
      },
    ];

    for (const nf of noFigureCases) {
      const diag = matchGeometryWithDiagnostics(nf.input, "test_no_fig", "english");
      expect(diag.figure, `Question "${nf.name}" should NOT have a figure`).toBeUndefined();
      expect(diag.source).toBe("none");
    }
  });
});
