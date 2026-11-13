import { describe, it, expect } from "vitest";
import { synthesizeEmptyMcqChoices } from "@/core/ingestion/mcq-empty-choice-synthesizer";
import {
  isDiagramJustifiedForQuestion,
  shouldTriggerGeometryDiagramForPrompt,
} from "@/core/ingestion/unsolicited-diagram-guard";
import { mergeBookletThreeStagesRepliesToPrintableItems } from "@/core/ingestion/notebooklm-booklet-stages-merger";
import { combineProblemAndTagGeometryContext } from "@/core/geometry-engine/description-intake/problem-geometry-context-extractor";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";

describe("11-Idea Triangle Booklet Permanent Regression Suite", () => {
  it("synthesizes a structurally matching wrong sibling for blank MCQ options (#33)", () => {
    const res = synthesizeEmptyMcqChoices({
      choices: ["$]4, 10[$", "$$", "$]3, 7[$", "$]4, 10]$"],
      solutionText: "الفترة الصحيحة هي ]4, 10[",
    });
    expect(res.synthesizedIndices).toEqual([1]);
    expect(res.choices[1]).not.toBe("$$");
    expect(res.choices[1]).not.toBe("$]4, 10[$");
    expect(res.choices[1]).toMatch(/^(\$[\[\]()].+[\[\]()]\$|[\[\]()].+[\[\]()])$/);
  });

  it("synthesizes helpful diagrams for Prep verbal geometry problems without leaked solutions", () => {
    const verbalCases = [
      {
        prompt: "إذا كانت النسبة بين قياسات الزوايا الداخلة لمثلث هي $2 : 3 : 4$. أوجد قياس كل زاوية.",
        forbiddenSubstrings: ["40°", "60°", "80°"],
        expectedSubstrings: ["2x", "3x", "4x"],
      },
      {
        prompt: "حظيرة مثلثة الشكل، طولا ضلعين فيها $12$ م و $18$ م. أوجد أصغر عدد صحيح لطول الضلع الثالث.",
        forbiddenSubstrings: ["7"],
        expectedSubstrings: ["12 م", "18 م"],
      },
      {
        prompt: "في المثلث $XYZ$، إذا كان قياس الزاوية الخارجة عند $Z$ هو $(4x + 20)^\\circ$، والزاويتان الداخلتان غير المجاورتين لها $m(\\angle X) = (2x + 10)^\\circ$ و $m(\\angle Y) = (x + 30)^\\circ$. أوجد قيمة $x$.",
        forbiddenSubstrings: ["20°"],
        expectedSubstrings: ["(4x + 20)°", "(2x + 10)°", "(x + 30)°"],
      },
      {
        id: "verbal-bow-tie-intersection",
        prompt: "تقاطع المستقيمان في النقطة $M$ ليكوّنا مثلثين متقابلين بالرأس فيهما $m(\\angle A) = 50^\\circ$ و $m(\\angle B) = 70^\\circ$ و $m(\\angle D) = 45^\\circ$. احسب قياس الزاوية المجهولة.",
        forbiddenSubstrings: ["60°", "75°"],
        expectedSubstrings: ["50°", "70°", "45°"],
      },
      {
        id: "drill-03-02-unparenthesized-algebraic",
        prompt: "مثلث قياسات زواياه هي $2x^\\circ$ و $3x^\\circ$ و $5x^\\circ$. أوجد قيمة $x$ ونوع المثلث.",
        forbiddenSubstrings: ["18°", "36°", "54°", "90°"],
        expectedSubstrings: ["2x°", "3x°", "5x°"],
      },
      {
        id: "drill-04-02-exterior-verbal",
        prompt: "إذا كان قياس إحدى الزوايا الخارجة عن مثلث يساوي $135^\\circ$، وقياس إحدى الزاويتين الداخلتين غير المجاورة لها يساوي $55^\\circ$. أوجد قياس الزاوية الداخلة الأخرى.",
        forbiddenSubstrings: ["80°"],
        expectedSubstrings: ["135°", "55°"],
      },
    ];

    for (const testCase of verbalCases) {
      expect(
        shouldTriggerGeometryDiagramForPrompt({
          promptArabic: testCase.prompt,
          branchId: "plane_geometry",
          gradeId: "prep_grade_1",
          lessonTitleArabic: "المثلث",
        })
      ).toBe(true);

      const combined = combineProblemAndTagGeometryContext(undefined, testCase.prompt);
      const matched = matchGeometryWithDiagnostics(combined, "verbal_test", "english");
      expect(matched.figure).toBeDefined();
      expect(matched.warnings).toEqual([]);

      const svg = projectGeometryFigureToSVGMarkup(matched.figure!, {
        numeralMode: "western",
        notationLanguage: "english",
      });
      const renderedLabels = Array.from(svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g)).map((m) => m[1]);
      for (const expected of testCase.expectedSubstrings) {
        expect(svg).toContain(expected);
      }
      for (const forbidden of testCase.forbiddenSubstrings) {
        expect(renderedLabels).not.toContain(forbidden);
      }
    }
  });

  it("blocks unsolicited diagrams on conceptual, student-must-draw, impossibility, and Secondary prompts", () => {
    const blockedPrepPrompts = [
      "قياس الزاوية الخارجة عن المثلث المتساوي الأضلاع يساوي:",
      "إذا كانت أطوال أضلاع مثلث هي $x$ سم و $6$ سم و $10$ سم . فهل يمكن أن تكون قيمة $x = 4$؟ وضّح السبب.",
      "هل يمكن أن تكون الأعداد $2.5$ سم و $3.5$ سم و $6.5$ سم أطوال أضلاع لمثلث؟ برر إجابتك.",
      "أي من مجموعات الأطوال الآتية تصلح أن تكون أطوال أضلاع مثلث:",
      "لا يمكن رسم مثلث أطوال أضلاعه هي:",
      "ارسم الشكل الهندسي لمثلث أ ب جـ فيه أ ب = 5 سم، ب جـ = 6 سم، أ جـ = 7 سم.",
    ];

    for (const promptArabic of blockedPrepPrompts) {
      expect(
        shouldTriggerGeometryDiagramForPrompt({
          promptArabic,
          branchId: "plane_geometry",
          gradeId: "prep_grade_1",
          lessonTitleArabic: "المثلث",
        })
      ).toBe(false);
      expect(
        isDiagramJustifiedForQuestion({
          promptArabic,
          rawDiagramTagText: promptArabic,
          hasExplicitTag: false,
          branchId: "plane_geometry",
          gradeId: "prep_grade_1",
          lessonTitleArabic: "المثلث",
        })
      ).toBe(false);
    }

    expect(
      shouldTriggerGeometryDiagramForPrompt({
        promptArabic: "مثلث أ ب جـ فيه أ ب = 6 سم، ب جـ = 8 سم، أوجد طول أ جـ.",
        branchId: "plane_geometry",
        gradeId: "sec_grade_1",
        lessonTitleArabic: "التشابه",
      })
    ).toBe(false);
  });

  it("places vertices, angles, parallel rays, intersections, and exterior extensions accurately across tricky figures", () => {
    const trickyCases = [
      {
        id: "example-01-02",
        prompt: "$ABC$ مثلث قائم الزاوية في $B$، فإذا كان $m(\\angle A) = 35^\\circ$، فأوجد بالبرهان قياس $\\angle C$.",
        tag: "الرؤوس (مثلث ABC قائم في B) ؛ الزوايا والتعامد (m(∠B) = 90° ; m(∠A) = 35°) ؛ المطلوب: قياس ∠C",
        assertFn: (svg: string, fig: NonNullable<ReturnType<typeof matchGeometryWithDiagnostics>["figure"]>) => {
          const thirtyFives = fig.angles.filter((a) => a.degrees === 35 || a.degreesLabel === "35°");
          expect(thirtyFives).toHaveLength(1);
          expect(svg).toContain("35°");
        },
      },
      {
        id: "practice-03-03",
        prompt: "في المثلث $DEF$ قائم الزاوية في $E$، إذا كان $m(\\angle D) = (3x - 12)^\\circ$ و $m(\\angle F) = (x + 6)^\\circ$.",
        tag: undefined,
        assertFn: (svg: string) => {
          expect(svg).toContain("(3x - 12)°");
          expect(svg).toContain("(x + 6)°");
        },
      },
      {
        id: "homework-04-04",
        prompt: "في الشكل المقابل، $\\angle ABX$ زاوية خارجة عن المثلث $ABC$ قياسها $140^\\circ$، فإذا كان $m(\\angle A) = m(\\angle C)$، فأوجد قياس $\\angle C$.",
        tag: "مثلث ABC ؛ X ∈ امتداد CB ؛ m(∠ABX) = 140° ؛ m(∠A) = m(∠C) ؛ المطلوب: قياس ∠C",
        assertFn: (svg: string, fig: NonNullable<ReturnType<typeof matchGeometryWithDiagnostics>["figure"]>) => {
          expect(fig.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "X"]));
          expect(fig.angles.filter((a) => a.markSymbol === "dot").length).toBeGreaterThanOrEqual(2);
          expect(svg).toContain("140°");
        },
      },
      {
        id: "example-06-01",
        prompt: "في الشكل المقابل، $ABC$ مثلث، $\\overrightarrow{AD} \\parallel \\overline{BC}$، بحيث $m(\\angle DAB) = 60^\\circ$ و $m(\\angle A) = 80^\\circ$.",
        tag: "مثلث ABC ؛ الشعاع AD // الضلع BC ؛ m(∠DAB) = 60° ؛ m(∠BAC) = 80° ؛ المطلوب: قياس ∠C",
        assertFn: (svg: string, fig: NonNullable<ReturnType<typeof matchGeometryWithDiagnostics>["figure"]>) => {
          expect(fig.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D"]));
          expect(svg).toContain("60°");
          expect(svg).toContain("80°");
          const vMap = new Map(fig.vertices.map((v) => [v.label, v.position]));
          const A = vMap.get("A")!;
          const B = vMap.get("B")!;
          const C = vMap.get("C")!;
          const dot = (B.x - A.x) * (C.x - A.x) + (B.y - A.y) * (C.y - A.y);
          const mag = Math.hypot(B.x - A.x, B.y - A.y) * Math.hypot(C.x - A.x, C.y - A.y);
          const degA = (Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI;
          expect(degA).toBeGreaterThan(70);
          expect(degA).toBeLessThan(90);
        },
      },
      {
        id: "practice-06-03",
        prompt: "في الشكل المقابل، $\\overline{AB} \\parallel \\overline{CD}$، النقطة $C \\in \\overline{BE}$، حيث $m(\\angle B) = 55^\\circ$، و $m(\\angle DCE) = 70^\\circ$ في المثلث $CDE$.",
        tag: "AB // CD ؛ C ∈ BE ؛ m(∠B) = 55° ؛ مثلث CDE ؛ m(∠DCE) = 70°",
        assertFn: (svg: string, fig: NonNullable<ReturnType<typeof matchGeometryWithDiagnostics>["figure"]>) => {
          expect(fig.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E"]));
          expect(svg).toContain("55°");
          expect(svg).toContain("70°");
        },
      },
      {
        id: "practice-06-04",
        prompt: "في الشكل المقابل، $ABC$ مثلث، رسم من $A$ مستقيم $\\overleftrightarrow{XY} \\parallel \\overline{BC}$، إذا كان $m(\\angle XAB) = 55^\\circ$ و $m(\\angle YAC) = 65^\\circ$.",
        tag: "مثلث ABC ؛ XY // BC ؛ A ∈ XY ؛ m(∠XAB) = 55° ؛ m(∠YAC) = 65°",
        assertFn: (svg: string, fig: NonNullable<ReturnType<typeof matchGeometryWithDiagnostics>["figure"]>) => {
          expect(fig.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "X", "Y"]));
          expect(svg).toContain("55°");
          expect(svg).toContain("65°");
        },
      },
      {
        id: "example-07-01",
        prompt: "في الشكل المقابل، المستقيمان $\\overline{BD}$ و $\\overline{CE}$ يتقاطعان في $A$.",
        tag: "BD ∩ CE = {A} ؛ مثلث ABC فيه m(∠B)=50°, m(∠C)=60° ؛ مثلث ADE فيه m(∠D)=45°",
        assertFn: (svg: string, fig: NonNullable<ReturnType<typeof matchGeometryWithDiagnostics>["figure"]>) => {
          expect(fig.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E"]));
          expect(svg).toContain("50°");
          expect(svg).toContain("60°");
          expect(svg).toContain("45°");
        },
      },
    ];

    for (const tc of trickyCases) {
      const combined = combineProblemAndTagGeometryContext(tc.tag, tc.prompt);
      const matched = matchGeometryWithDiagnostics(combined, tc.id, "english");
      expect(matched.warnings).toEqual([]);
      expect(matched.figure).toBeDefined();
      const svg = projectGeometryFigureToSVGMarkup(matched.figure!, {
        numeralMode: "western",
        notationLanguage: "english",
      });
      tc.assertFn(svg, matched.figure!);
    }
  });

  it("parses Stage 1 + Stage 2 booklet items end-to-end preserving blank MCQ highlighting", () => {
    const stage1Raw = `فهرس أفكار الدرس:
- idea-01: [زوايا المثلث] - [حساب زاوية مجهولة - المستوى: تأسيسي]

---
الفكرة الأولى: حساب زاوية مجهولة | المستوى: تأسيسي | نوع المسألة: مسائل هندسية مباشرة | معرف الفكرة: idea-01
مفهوم الفكرة: مجموع قياسات زوايا المثلث يساوي 180.
القاعدة الرياضية: $180^\\circ$
المثال 1 | معرف المثال: example-01-01
نص المسألة: في المثلث $ABC$، $m(\\angle A)=50^\\circ$ و $m(\\angle B)=70^\\circ$. احسب $m(\\angle C)$.
خطوات الحل:
1. $180 - 120 = 60$.
الناتج النهائي: $60^\\circ$.
نهاية الفكرة الأولى

قسم التدريبات الموجهة:
التمرين 1 (تأسيسي) | الفكرة: idea-01 | الكود: drill-01-01
أوجد قياس الزاوية الثالثة في مثلث قياسا زاويتين فيه $40^\\circ$ و $60^\\circ$.`;

    const stage2Raw = `الفكرة الأولى: حساب زاوية مجهولة | معرف الفكرة: idea-01

ثانياً: تمارين الواجب المنزلي:
السؤال 1 (المستوى: تأسيسي) | الفكرة: idea-01 | الكود: hw-33
مثلث طولا ضلعين فيه $3$ سم و $7$ سم، فإن طول الضلع الثالث ينتمي إلى:
(أ) $]4, 10[$
(ب) $$
(ج) $]3, 7[$
(د) $]4, 10]$

السؤال 2 (المستوى: تأسيسي) | الفكرة: idea-01 | الكود: hw-13
قياس الزاوية الخارجة عن المثلث المتساوي الأضلاع يساوي:
(أ) $60^\\circ$
(ب) $90^\\circ$
(ج) $120^\\circ$
(د) $180^\\circ$
نهاية الفكرة الأولى

---
قسم الحلول النهائية للواجب المنزلي:
1. $]4, 10[$
2. $120^\\circ$`;

    const items = mergeBookletThreeStagesRepliesToPrintableItems({
      stage1Raw,
      stage2Raw,
      branchId: "plane_geometry",
      branchNameAr: "الهندسة المستوية",
      unitId: "unit-3",
      lessonId: "lesson-tri",
      lessonTitleArabic: "المثلث",
      gradeId: "prep_grade_1",
      stage: "preparatory",
    });

    const hw33 = items.find((i) => i.id.includes("hw") && i.mcqChoicesAr?.length === 4);
    expect(hw33?.synthesizedMcqIndices).toEqual([1]);
    expect(hw33?.mcqChoicesAr?.[1]).not.toBe("$$");
    expect(hw33?.geometryFigure).toBeDefined();

    const hw13 = items.filter((i) => i.id.includes("hw"))[1];
    expect(hw13?.geometryFigure).toBeUndefined();
    expect(hw13?.figureDiagnosticsAr).toBeUndefined();
  });
});
