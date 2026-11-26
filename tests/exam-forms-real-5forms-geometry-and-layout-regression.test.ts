import { describe, expect, it } from "vitest";
import { parseNotebookLMExamForms } from "@/core/ingestion/notebooklm-exam-forms-parser";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { shouldTriggerGeometryDiagramForPrompt } from "@/core/ingestion/unsolicited-diagram-guard";
import { evaluatePageCandidate } from "@/core/pdf-layout-engine/flow-page-break-cost-evaluator";
import { FLOW_DENSITY_PROFILES } from "@/core/pdf-layout-engine/flow-page-geometry-constants";
import type { FlowItem } from "@/core/pdf-layout-engine/flow-item-model";

describe("real 5-form NotebookLM parser, layout, and geometry regressions", () => {
  it("parses form letters cleanly without [FORM: 1] bleed and strips duplicate (ب)/(جـ)/(د) choice prefixes", () => {
    const sample = [
      "=== [FORM: 1] | النموذج: أ ===",
      "=== [QUESTION: 1] | النموذج: أ | النوع: MCQ | الدرس: المربع الكامل | الدرجة: 1 ===",
      "النص: إذا كان المقدار $4x^2 + kx + 25$ مربعاً كاملاً، فإن قيمة $k$ تساوي:",
      "الرسم: ",
      "البدائل: (أ) $\\pm 10$ | (ب) $\\pm 20$ | (جـ) $20$ | (د) $\\pm 100$",
      "الإجابة_الصحيحة: (ب) $\\pm 20$",
      "=== [FORM: 5] | النموذج: هـ ===",
      "=== [QUESTION: 1] | النموذج: هـ | النوع: MCQ | الدرس: المربع الكامل | الدرجة: 1 ===",
      "النص: إذا كان المقدار $25x^2 + kx + 1$ مربعاً كاملاً، فإن القيمة الموجبة لـ $k$ هي:",
      "الرسم: ",
      "البدائل: (أ) $5$ | (ب) $10$ | (جـ) $20$ | (د) $50$",
      "الإجابة_الصحيحة: (ب) $10$",
    ].join("\n");

    const forms = parseNotebookLMExamForms({
      rawText: sample,
      branchId: "plane_geometry",
      unitId: "u1",
      lessonId: "l1",
      lessonTitleArabic: "اختبار شهر",
      expectedFormsCount: 2,
      gradeId: "prep2",
      notationLanguage: "english",
      numeralMode: "western",
    });

    expect(forms).toHaveLength(2);
    expect(forms[0].formTitleAr).toBe("النموذج (أ)");
    expect(forms[1].formTitleAr).toBe("النموذج (هـ)");
    expect(forms[0].questions[0].mcqChoicesArabic).toEqual([
      "$\\pm 10$",
      "$\\pm 20$",
      "$20$",
      "$\\pm 100$",
    ]);
    expect(forms[0].questions[0].attachedGeometryFigure).toBeUndefined();
  });

  it("suppresses unsolicited empty diagrams on theoretical geometry and algebra factoring MCQs", () => {
    const prompts = [
      "في $\\triangle ABC$ إذا كان $(AC)^2 = (AB)^2 + (BC)^2 + 5$ ، فإن $\\angle B$ تكون:",
      "الأعداد التي تصلح أن تكون أطوال أضلاع مثلث قائم الزاوية هي:",
      "الشعاع المرسوم من منتصف أحد أضلاع مثلث موازياً أحد الضلعين الآخرين:",
      "عدد متوسطات المثلث القائم الزاوية يساوي:",
      "نقطة تقاطع متوسطات المثلث تقسم كلاً منها بنسبة .......... من جهة القاعدة.",
      "القطعة المستقيمة الواصلة بين منتصفي ضلعين في مثلث .......... الضلع الثالث.",
      "النسبة بين طول متوسط المثلث القائم الخارج من رأس القائمة وطول وتر هذا المثلث هي:",
      "حلل بإكمال المربع تحليلاً كاملاً: $x^4 + 4y^4$",
    ];
    for (const p of prompts) {
      expect(
        shouldTriggerGeometryDiagramForPrompt({
          promptArabic: p,
          hasExplicitTag: false,
          branchId: "plane_geometry",
          gradeId: "prep2",
        }),
        p
      ).toBe(false);
    }
  });

  it("penalizes orphaned exam_section_banner at the bottom of a non-last page", () => {
    const banner: FlowItem = { kind: "exam_section_banner", id: "sec2", title: "السؤال الثاني", subtitle: "" };
    const dummyQ: FlowItem = {
      kind: "question",
      id: "q1",
      span: "column",
      question: {} as never,
      displayNumber: 1,
      isWorkedExample: false,
    };
    const res = evaluatePageCandidate(
      {
        heights: new Map([["sec2", 34], ["q1", 100]]),
        heightOf: (it) => (it.id === "sec2" ? 34 : 100),
        stretchRoomOf: () => 0,
        budgets: { firstPagePx: 900, firstPageCompactPx: 940, nextPagePx: 960, headerStdPx: 80, headerCompactPx: 50, footerPx: 25, sheetHeightPx: 1122 },
        density: FLOW_DENSITY_PROFILES.standard_balanced,
      },
      [dummyQ, banner],
      { isFirstPage: true, isLastPage: false }
    );
    expect(res.cost).toBeGreaterThanOrEqual(500);
  });

  it("renders all 5 previously missing proof figures cleanly", () => {
    const cases = [
      {
        prompt: "في الشكل المقابل، احسب محيط $\\triangle EMD$.",
        tag: "مثلث ABC فيه BE و CD متوسطان يتقاطعان في M ; BM = 6 سم ; CD = 12 سم ; BC = 14 سم",
      },
      {
        prompt: "في الشكل المقابل، إذا كان $BD$ متوسطاً في $\\triangle ABC$ ، وكان $BD = AD = CD = 6$ سم، $AB = 7$ سم، $BC = \\sqrt{95}$ سم. أثبت أن $m(\\angle ABC) = 90^\\circ$.",
        tag: "مثلث ABC فيه D منتصف AC ; BD متوسط ; BD = 6 سم ; AC = 12 سم",
      },
      {
        prompt: "في الشكل المقابل، $\\triangle ABC$ قائم الزاوية في $B$ ، $D$ منتصف $AC$ ، رسم $DE \\perp AC$ ليقطع $BC$ في $E$. فإذا كان $BD = 7.5$ سم، $AB = 9$ سم، احسب طول $BC$.",
        tag: "مثلث ABC قائم في B ; D منتصف AC ; BD متوسط = 7.5 سم ; AB = 9 سم",
      },
      {
        prompt: "سلم طوله $10$ أمتار يستند على حائط رأسي، وقاعدته تبعد عن الحائط مسافة $6$ أمتار. احسب ارتفاع قمة السلم عن الأرض.",
        tag: "مثلث قائم الزاوية ABC قائم في B ; الوتر AC = 10 م يمثل السلم ; BC = 6 م بعد القاعدة عن الحائط ; AB يمثل الارتفاع",
      },
      {
        prompt: "$\\triangle ABC$ قائم الزاوية في $B$ ، $m(\\angle C) = 30^\\circ$. رسم مثلث آخر $ACD$ قائم في $D$ ومتساوي الساقين فيه $AD = CD = 8$ سم.",
        tag: "مثلثان يشتركان في الضلع AC ; مثلث ABC قائم في B و m(∠C) = 30° ; مثلث ACD قائم في D وفيه AD = CD = 8 سم",
      },
    ];
    for (const c of cases) {
      const res = matchGeometryWithDiagnostics({ problemPrompt: c.prompt, geometryTag: c.tag }, "test_fig", "english");
      expect(res.decision, c.tag).toBe("green");
      expect(res.figure, c.tag).toBeDefined();
    }
  });

  it("fixes all 9 malformed figures structurally across quads, parallel transversals, medians, and kites", () => {
    const q14 = matchGeometryWithDiagnostics(
      {
        problemPrompt: "احسب طول $AC$ ، ثم أثبت أن $m(\\angle ACD) = 90^\\circ$.",
        geometryTag: "ABCD شكل رباعي ; مثلث ABC قائم الزاوية في B ; AB = 4 سم ; BC = 3 سم ; CD = 12 سم ; AD = 13 سم",
      },
      "f1q14",
      "english"
    );
    expect(q14.decision).toBe("green");
    expect(q14.figure?.angles.some((a) => a.isRightAngle && a.vertexId.endsWith("_B"))).toBe(true);

    const q15 = matchGeometryWithDiagnostics(
      {
        problemPrompt: "أثبت أن $CY = HY$.",
        geometryTag: "ABCD متوازي أضلاع ; تقاطع قطراه في M ; H تنتمي إلى الشعاع BA بحيث AB = AH ; المستقيم HM يقطع BC في Y",
      },
      "f1q15",
      "english"
    );
    expect(q15.decision).toBe("green");
    const hPt = q15.figure?.vertices.find((v) => v.label === "H")?.position;
    const aPt = q15.figure?.vertices.find((v) => v.label === "A")?.position;
    const bPt = q15.figure?.vertices.find((v) => v.label === "B")?.position;
    expect(hPt && aPt && bPt && (hPt.x - aPt.x) * (aPt.x - bPt.x) > 0).toBe(true);

    const f2q15 = matchGeometryWithDiagnostics(
      {
        problemPrompt: "المستقيمات $l_1 // l_2 // l_3 // l_4$ ، القاطعان $t_1$ و $t_2$ يقطعانهما بحيث $AB = BC = CD$. فإذا كان $EF = 2x - 1$ سم، $FG = 7$ سم، $GH = y + 2$ سم.",
        geometryTag: "أربعة مستقيمات متوازية ; قاطعان لها أجزاء القاطع الأول متساوية AB = BC = CD ; أجزاء القاطع الثاني EF = 2x - 1 و FG = 7 و GH = y + 2",
      },
      "f2q15",
      "english"
    );
    expect(f2q15.decision).toBe("green");
    const efLabel = f2q15.figure?.segments.find((s) => String(s.lengthLabel?.value).includes("2x - 1"))?.lengthLabel?.value;
    expect(efLabel).toBe("2x - 1");

    const f2q16 = matchGeometryWithDiagnostics(
      {
        problemPrompt: "احسب محيط $\\triangle BGD$.",
        geometryTag: "مثلث ABC فيه AD و BE متوسطان يتقاطعان في G ; AD = 15 سم ; BG = 8 سم ; BC = 12 سم",
      },
      "f2q16",
      "english"
    );
    expect(f2q16.decision).toBe("green");
    const pB = f2q16.figure?.vertices.find((v) => v.label === "B")?.position;
    const pC = f2q16.figure?.vertices.find((v) => v.label === "C")?.position;
    expect(Math.abs((pB?.y ?? 0) - (pC?.y ?? 99))).toBeLessThan(0.05);

    const f3q15 = matchGeometryWithDiagnostics(
      {
        problemPrompt: "في الشكل المقابل، $\\triangle ABC$ فيه $D$ منتصف $AB$ ، $E$ منتصف $AC$. رُسم $DE // BC$ ثم رُسم $EF // AB$ ليقطع $BC$ في $F$.",
        geometryTag: "مثلث ABC فيه D منتصف AB ; E منتصف AC ; DE // BC ; EF // AB و F تنتمي إلى BC",
      },
      "f3q15",
      "english"
    );
    expect(f3q15.decision).toBe("green");
    expect(f3q15.figure?.vertices.some((v) => v.label === "F")).toBe(true);

    const f4q13 = matchGeometryWithDiagnostics(
      {
        problemPrompt: "إذا كان $AB = AC$ ، $BD = CD$. برهن أن $\\triangle ABD \\cong \\triangle ACD$.",
        geometryTag: "ABCD شكل طائرة ورقية فيه AB = AC ; BD = CD ; AD ضلع مشترك",
      },
      "f4q13",
      "english"
    );
    expect(f4q13.decision).toBe("green");
    expect(f4q13.figure?.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D"]));

    const f4q14 = matchGeometryWithDiagnostics(
      {
        problemPrompt: "حديقة على شكل مستطيل $ABCD$ بعداها $AB = 9$ أمتار، $BC = 12$ متراً.",
        geometryTag: "مستطيل ABCD أبعاده AB = 9 م و BC = 12 م ; المطلوب: طول القطر AC",
      },
      "f4q14",
      "english"
    );
    expect(f4q14.decision).toBe("green");
    expect(f4q14.figure?.segments.some((s) => s.fromVertexId.endsWith("_A") && s.toVertexId.endsWith("_C"))).toBe(true);

    const f4q16 = matchGeometryWithDiagnostics(
      {
        problemPrompt: "إذا كانت $M$ نقطة تلاقي متوسطات $\\triangle ABC$ ، وكان $AM \\perp BM$ حيث $AM = 6$ سم، $BM = 8$ سم.",
        geometryTag: "مثلث ABC فيه المتوسطان AD و BE يتقاطعان في M ; AM ⊥ BM ; AM = 6 سم ; BM = 8 سم",
      },
      "f4q16",
      "english"
    );
    expect(f4q16.decision).toBe("green");
    expect(f4q16.figure?.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["D", "E", "M"]));
    expect(f4q16.figure?.angles.some((a) => a.isRightAngle && a.vertexId.endsWith("_M"))).toBe(true);

    const f5q15 = matchGeometryWithDiagnostics(
      {
        problemPrompt: "شبه منحرف $ABCD$ فيه $AB // DC$ ، $E$ منتصف $AD$ ، رُسم $EF // AB$ ليقطع $BC$ في $F$.",
        geometryTag: "شبه منحرف ABCD فيه AB // DC رسم قطره AC يقطع EF في M ; E منتصف AD ; EF // AB // DC",
      },
      "f5q15",
      "english"
    );
    expect(f5q15.decision).toBe("green");
    expect(f5q15.figure?.vertices.some((v) => v.label === "M")).toBe(true);
    expect(f5q15.figure?.segments.some((s) => s.fromVertexId.endsWith("_A") && s.toVertexId.endsWith("_C"))).toBe(true);
  });
});
