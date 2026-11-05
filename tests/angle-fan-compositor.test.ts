/**
 * @file angle-fan-compositor.test.ts
 * @description اختبارات شاملة لعائلة مراوح الأشعة والزوايا (Angle-Fan Family) على جميع الأشكال الـ 33
 * الواردة في مذكرة «الزوايا والعلاقات بينها» للصف الأول الإعدادي (المرحلة 1 والمرحلة 2:
 * متتامتان، متكاملتان على مستقيم، متقابلتان بالرأس، متجمعة حول نقطة 360°، منصف زاوية، ومعادلات جبرية بالمجهول س).
 */

import { describe, expect, it } from "vitest";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { extractAngleFanSpecFromDescription } from "@/core/geometry-engine/angle-fan-family/angle-fan-fact-extractor";
import { solveAngleFanDirections } from "@/core/geometry-engine/angle-fan-family/angle-fan-direction-solver";
import { verifyGeometryFigure } from "@/core/geometry-engine/verification/geometry-figure-verification-orchestrator";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";
import { sanitizeNotebookLMCitationsAndLatex } from "@/core/ingestion/notebooklm-citation-latex-sanitizer";
import { mergeBookletThreeStagesRepliesToPrintableItems } from "@/core/ingestion/notebooklm-booklet-stages-merger";

const PREP1_ANGLES_ALL_33_DESCRIPTIONS: readonly string[] = [
  "الشعاع جـ أ ⊥ الشعاع جـ ب ; الشعاع جـ د شعاع بينهما ; ق(∠أ جـ د) = 50° ; ق(∠د جـ ب) = 2س°",
  "الشعاع أ جـ ⊥ الشعاع أ ب ; الشعاع أ د ينصف المنطقة بينهما ; ق(∠د أ جـ) = (3س - 10)° ; ق(∠د أ ب) = (2س + 5)°",
  "ب تنتمي للمستقيم أ جـ ; الشعاع ب د يقطع المستقيم ; ق(∠أ ب د) = 120° ; ق(∠د ب جـ) = 3س°",
  "ب تنتمي للمستقيم أ جـ ; الشعاع ب د بينهما ; ق(∠أ ب د) = (4س + 8)° ; ق(∠د ب جـ) = (س + 2)°",
  "أ، ب، جـ نقط متتالية ; الشعاع ب د والشعاع ب هـ بينهما ; ق(∠أ ب د) = 35° ; ق(∠د ب هـ) = 90° ; ق(∠هـ ب جـ) = 55°",
  "أ ب جـ زاوية مقسمة لشعاعين ب د و ب هـ ; ق(∠أ ب د) = 32° ; ق(∠د ب هـ) = 39° ; ق(∠هـ ب جـ) = 19°",
  "جـ تنتمي للمستقيم أ ب ; الشعاع جـ د والشعاع جـ س بينهما ; ق(∠د جـ ب) = 40° ; ق(∠أ جـ س) = 100° ; الشعاع جـ هـ ينصف ∠د جـ س",
  "ب تنتمي للمستقيم أ جـ ; الشعاع ب د يخرج من ب ; ق(∠أ ب د) = 65° ; الشعاع ب هـ ينصف ∠جـ ب د",
  "تقاطع المستقيم أ ب والمستقيم جـ د في م ; ق(∠أ م د) = 140° ; ق(∠ب م جـ) = (3س + 20)° بالتقابل بالرأس",
  "تقاطع المستقيم أ ب والمستقيم جـ د في م ; ق(∠أ م جـ) = (6س + 15)° ; ق(∠ب م د) = (2س + 75)° بالتقابل بالرأس",
  "الزوايا متجمعة حول النقطة م ; الشعاع م أ متعامد على الشعاع م هـ (90°) ; ق(∠أ م ب) = 140° ; ق(∠ب م د) = 100°",
  "نقطة م حولها أربعة أشعة تصنع زوايا 2س°، 3س°، 4س°، 6س°",
  "تقاطع مستقيمين يمثلان ذراعي مقص ; الزاويتان المتقابلتان بالرأس هما (3س - 18)° و (2س + 12)°",
  "الشعاع جـ أ ⊥ الشعاع جـ ب;الشعاع جـ د بينهما;ق(∠أ جـ د)=(2س + 10)°;ق(∠د جـ ب)=40°",
  "الشعاع أ ب ⊥ الشعاع أ جـ;الشعاع أ د بينهما;ق(∠ب أ د)=3س°;ق(∠د أ جـ)=6س°",
  "الشعاع ب أ ⊥ الشعاع ب جـ;الشعاع ب د بينهما;ق(∠أ ب د)=(س + 15)°;ق(∠د ب جـ)=(2س - 15)°",
  "ب تنتمي للمستقيم أ جـ;الشعاع ب د يقطع المستقيم;ق(∠أ ب د)=5س°;ق(∠د ب جـ)=80°",
  "د تنتمي للمستقيم س ص;الشعاع د هـ يقطع المستقيم;ق(∠س د هـ)=(3س - 10)°;ق(∠هـ د ص)=(2س + 10)°",
  "جـ تنتمي للمستقيم أ ب;الشعاع جـ د يخرج من جـ;ق(∠أ جـ د)=4س°;ق(∠د جـ ب)=2س°",
  "ب تنتمي للمستقيم أ جـ;الشعاع ب د والشعاع ب هـ بينهما;ق(∠أ ب د)=2س°;ق(∠د ب هـ)=90°;ق(∠هـ ب جـ)=3س°",
  "الزوايا متجاورة عند ب;ق(∠أ ب د)=40°;ق(∠د ب هـ)=25°;ق(∠هـ ب جـ)=25°",
  "أ، ب، جـ نقط متتالية;الشعاع ب د والشعاع ب هـ بينهما;ق(∠أ ب د)=52°;ق(∠د ب هـ)=68°;ق(∠هـ ب جـ)=60°",
  "النقاط أ، ب، جـ متتالية;الأشعة ب د و ب هـ بينهما;ق(∠أ ب د)=2س°;ق(∠د ب هـ)=3س°;ق(∠هـ ب جـ)=4س°",
  "ب تنتمي للمستقيم أ جـ;الشعاع ب هـ بينهما;ق(∠هـ ب جـ)=70°;الشعاع ب د ينصف ∠أ ب هـ",
  "الشعاع ب أ ⊥ الشعاع ب جـ;الشعاع ب هـ بينهما;ق(∠هـ ب جـ)=30°;الشعاع ب د ينصف ∠أ ب هـ",
  "ب تنتمي للمستقيم أ جـ;الشعاع ب هـ يخرج من ب;الشعاع ب د ينصف ∠أ ب هـ;الشعاع ب و ينصف ∠هـ ب جـ",
  "تقاطع المستقيم أ ب والمستقيم جـ د في م;ق(∠أ م جـ)=80°",
  "تقاطع المستقيم أ ب والمستقيم جـ د في م;ق(∠أ م جـ)=(2س + 10)°;ق(∠ب م د)=70°",
  "تقاطع المستقيم أ ب والمستقيم جـ د في م;ق(∠جـ م ب)=110°;الشعاع م هـ ينصف ∠أ م د",
  "نقطة م حولها الأشعة م أ، م ب، م جـ;ق(∠أ م ب)=90°;ق(∠ب م جـ)=2س°;ق(∠جـ م أ)=3س°",
  "نقطة م حولها الأشعة م أ، م ب، م جـ، م د;م أ ⊥ م د;ق(∠أ م ب)=60°;ق(∠ب م جـ)=110°;ق(∠جـ م د)=(2س - 10)°",
  "تقاطع المستقيم أ ب والمستقيم جـ د في م;الشعاع م هـ ⊥ المستقيم أ ب;ق(∠د م هـ)=35°",
  "تقاطع المستقيم أ ب والمستقيم جـ د في م;الشعاع م و ينصف ∠جـ م ب;مجموع الزاويتين المتقابلتين بالرأس (∠أ م جـ و ∠ب م د) يساوي 140°",
];

describe("Angle-Fan Family Compositor (Prep Grade 1 Angles & Relationships - All 33 Cases)", () => {
  it("يركب جميع الأشكال الـ 33 من الوصف العربي الخام وبعد التطهير بصفر تحذيرات ويجتاز المدقق الهندسي", () => {
    PREP1_ANGLES_ALL_33_DESCRIPTIONS.forEach((rawDesc, idx) => {
      const diagRaw = matchGeometryWithDiagnostics(rawDesc, `ang_raw_${idx}`, "arabic");
      expect(diagRaw.source, `case #${idx} raw source`).toBe("compositor");
      expect(diagRaw.warnings, `case #${idx} raw warnings`).toEqual([]);
      expect(diagRaw.figure).toBeDefined();

      const verification = verifyGeometryFigure(diagRaw.figure!);
      expect(verification.passed, `case #${idx} verification`).toBe(true);

      const svg = projectGeometryFigureToSVGMarkup(diagRaw.figure!, {
        notationLanguage: "arabic",
      });
      expect(svg).toContain("<svg");
      expect(svg).not.toContain("NaN");
      expect(svg).toContain("<polygon");

      const cleaned = sanitizeNotebookLMCitationsAndLatex(`[رسم هندسي: ${rawDesc}]`).cleanedText;
      const inner = cleaned.match(/\[\s*رسم\s*هندسي\s*:\s*([^\]]+)\]/i)?.[1] ?? rawDesc;
      const diagCleaned = matchGeometryWithDiagnostics(inner, `ang_clean_${idx}`, "arabic");
      expect(diagCleaned.source, `case #${idx} cleaned source`).toBe("compositor");
      expect(diagCleaned.warnings, `case #${idx} cleaned warnings`).toEqual([]);
    });
  });

  it("يحل المعادلات الجبرية للزوايا المتتامة والمتكاملة والمتقابلة بالرأس والمتجمعة حول نقطة بدقة", () => {
    const s0 = solveAngleFanDirections(extractAngleFanSpecFromDescription(PREP1_ANGLES_ALL_33_DESCRIPTIONS[0])!);
    expect(s0.solvedVarValue).toBeCloseTo(20, 5);

    const s1 = solveAngleFanDirections(extractAngleFanSpecFromDescription(PREP1_ANGLES_ALL_33_DESCRIPTIONS[1])!);
    expect(s1.solvedVarValue).toBeCloseTo(19, 5);

    const s3 = solveAngleFanDirections(extractAngleFanSpecFromDescription(PREP1_ANGLES_ALL_33_DESCRIPTIONS[3])!);
    expect(s3.solvedVarValue).toBeCloseTo(34, 5);

    const s9 = solveAngleFanDirections(extractAngleFanSpecFromDescription(PREP1_ANGLES_ALL_33_DESCRIPTIONS[9])!);
    expect(s9.solvedVarValue).toBeCloseTo(15, 5);

    const s11 = solveAngleFanDirections(extractAngleFanSpecFromDescription(PREP1_ANGLES_ALL_33_DESCRIPTIONS[11])!);
    expect(s11.solvedVarValue).toBeCloseTo(24, 5);

    const s30 = solveAngleFanDirections(extractAngleFanSpecFromDescription(PREP1_ANGLES_ALL_33_DESCRIPTIONS[30])!);
    expect(s30.solvedVarValue).toBeCloseTo(55, 5);
  });

  it("يدمج مراحل المذكرة ويرفق الأشكال الهندسية للأمثلة المحلولة وتمارين حاول بنفسك والواجب المنزلي", () => {
    const combinedReply = `
الفكرة الأولى: إيجاد مجهول جبري في الزاويتين المتتامتين المتجاورتين | المستوى: متوسط | نوع المسألة: مقالي | معرف الفكرة: idea-05
مفهوم الفكرة: إذا كانت الزاويتان المتجاورتان متتامتين فإن مجموع قياسيهما 90 درجة.
القاعدة الرياضية: ق(∠1) + ق(∠2) = 90°

المثال 1 | معرف المثال: example-05-01
نص المسألة: في الشكل المقابل أوجد قيمة س. [رسم هندسي: الشعاع جـ أ ⊥ الشعاع جـ ب ; الشعاع جـ د شعاع بينهما ; ق(∠أ جـ د) = 50° ; ق(∠د جـ ب) = 2س°]
خطوات الحل:
1. بما أن الشعاع جـ أ عمودي على الشعاع جـ ب إذن 50 + 2س = 90.
الناتج النهائي: س = 20°
نهاية الفكرة الأولى

💡 هل ترغب في إجراء تعديل أو التجهيز للمرحلة التالية (المرحلة ٢: التقييمات والاختبارات التراكمية)؟

الفكرة الأولى: إيجاد مجهول جبري في الزاويتين المتتامتين المتجاورتين | معرف الفكرة: idea-05
حاول بنفسك:
 في الشكل المقابل أوجد قيمة س. [رسم هندسي: الشعاع جـ أ ⊥ الشعاع جـ ب;الشعاع جـ د بينهما;ق(∠أ جـ د)=(2س + 10)°;ق(∠د جـ ب)=40°] | معرف السؤال: practice-05-01
 في الشكل المقابل أوجد قيمة س. [رسم هندسي: الشعاع أ ب ⊥ الشعاع أ جـ;الشعاع أ د بينهما;ق(∠ب أ د)=3س°;ق(∠د أ جـ)=6س°] | معرف السؤال: practice-05-02
تمارين الواجب المنزلي:
#1 [مقالي] في الشكل المقابل أوجد قيمة س. [رسم هندسي: الشعاع ب أ ⊥ الشعاع ب جـ;الشعاع ب د بينهما;ق(∠أ ب د)=(س + 15)°;ق(∠د ب جـ)=(2س - 15)°] | معرف السؤال: homework-05-02
نهاية الفكرة الأولى
`;
    const items = mergeBookletThreeStagesRepliesToPrintableItems({
      stage1Raw: combinedReply,
      branchId: "plane_geometry",
      branchNameAr: "الهندسة المستوية",
      unitId: "u3",
      lessonId: "l1",
      lessonTitleArabic: "الزوايا والعلاقات بينها",
    });

    expect(items.length).toBe(4);
    items.forEach((item, i) => {
      expect(item.geometryFigure, `item #${i} (${item.id}) geometryFigure`).toBeDefined();
      expect(item.figureDiagnosticsAr, `item #${i} (${item.id}) diagnostics`).toBeUndefined();
    });
  });

  it("يفهم نص المسألة الكامل المنسوخ من NotebookLM (بما فيه LaTeX ووسم الرسم المدمج أو بدونه) بصفر تحذيرات", () => {
    const fullQuestionWithTag =
      "في الشكل المقابل، $\\overleftrightarrow{أ ب} \\cap \\overleftrightarrow{جـ د} = \\{م\\}$، الشعاع $\\vec{م و}$ ينصف $\\angle جـ م ب$. إذا كان $ق(\\angle أ م جـ) + ق(\\angle ب م د) = 140^\\circ$، فأوجد بالبرهان المنظم والخطوات قياس $\\angle و م د$. [رسم هندسي: تقاطع المستقيم أ ب والمستقيم جـ د في م;الشعاع م و ينصف ∠جـ م ب;مجموع الزاويتين المتقابلتين بالرأس (∠أ م جـ و ∠ب م د) يساوي 140°] |";
    const d1 = matchGeometryWithDiagnostics(fullQuestionWithTag, "q_with_tag", "arabic");
    expect(d1.source).toBe("compositor");
    expect(d1.warnings).toEqual([]);
    expect(d1.figure).toBeDefined();
    expect(verifyGeometryFigure(d1.figure!).passed).toBe(true);

    // نفس السؤال بدون وسم [رسم هندسي: ...] بالاعتماد فقط على نص المسألة ورموز LaTeX
    const fullQuestionWithoutTag =
      "في الشكل المقابل، $\\overleftrightarrow{أ ب} \\cap \\overleftrightarrow{جـ د} = \\{م\\}$، الشعاع $\\vec{م و}$ ينصف $\\angle جـ م ب$. إذا كان $ق(\\angle أ م جـ) + ق(\\angle ب م د) = 140^\\circ$، فأوجد بالبرهان المنظم والخطوات قياس $\\angle و م د$.";
    const d2 = matchGeometryWithDiagnostics(fullQuestionWithoutTag, "q_no_tag", "arabic");
    expect(d2.source).toBe("compositor");
    expect(d2.warnings).toEqual([]);
    expect(d2.figure).toBeDefined();
    expect(verifyGeometryFigure(d2.figure!).passed).toBe(true);

    // سؤال متتامتين كامل برموز LaTeX فقط بدون وسم رسم هندسي
    const compQuestionWithoutTag =
      "في الشكل المقابل، $\\vec{أ ب} \\perp \\vec{أ جـ}$، والشعاع $\\vec{أ د}$ يقسم $\\angle ب أ جـ$ بحيث $ق(\\angle ب أ د) = 3 س^\\circ$ و $ق(\\angle د أ جـ) = 6 س^\\circ$. أوجد قيمة $س$ و $ق(\\angle د أ جـ)$.";
    const d3 = matchGeometryWithDiagnostics(compQuestionWithoutTag, "q_comp_no_tag", "arabic");
    expect(d3.source).toBe("compositor");
    expect(d3.warnings).toEqual([]);
    expect(d3.figure).toBeDefined();
    expect(verifyGeometryFigure(d3.figure!).passed).toBe(true);
  });

  it("يضمن دقة رسم الأسئلة 5 و 6 و 7: أسهم متجهة، زوايا معطاة، وحجب قياس الزاوية المطلوب إيجادها تماماً", () => {
    // السؤال 5: منصف زاوية + زاوية 70° + المطلوب ABD (يجب عدم كتابة 55° أو 62.5° في الرسم)
    const q5 =
      "في الشكل المقابل، إذا كان B ∈ AC، وكان الشعاع BD ينصف ∠ABE. إذا كان m(∠EBC) = 70°، فأوجد بالبرهان الهندسي قياس ∠ABD.";
    const d5 = matchGeometryWithDiagnostics(q5, "q5_test", "english");
    expect(d5.source).toBe("compositor");
    expect(d5.figure).toBeDefined();
    expect(d5.figure!.segments.length).toBe(4);
    const svg5 = projectGeometryFigureToSVGMarkup(d5.figure!, { numeralMode: "western" });
    expect(svg5).toContain("<polygon"); // أسهم الأشعة
    expect(svg5).toContain("70°"); // الزاوية المعطاة
    expect(svg5).not.toContain("55°"); // حجب الحل
    expect(svg5).not.toContain("62.5°");

    // السؤال 6: مستقيمان متقاطعان + منصف زاوية + CMB = 130° (يجب عدم كتابة 65° في الرسم)
    const q6 =
      "في الشكل المقابل، إذا تقاطع المستقيمان AB و CD في النقطة M، وكان الشعاع ME ينصف ∠AMD. إذا كان m(∠CMB) = 130°، فأوجد بالبرهان الهندسي m(∠AMC) و m(∠AME).";
    const d6 = matchGeometryWithDiagnostics(q6, "q6_test", "english");
    expect(d6.source).toBe("compositor");
    expect(d6.figure).toBeDefined();
    expect(d6.figure!.segments.length).toBe(5);
    const svg6 = projectGeometryFigureToSVGMarkup(d6.figure!, { numeralMode: "western" });
    expect(svg6).toContain("<polygon");
    expect(svg6).toContain("130°");
    expect(svg6).not.toContain("65°"); // حجب الحل

    // السؤال 7: أربعة أشعة تخرج من النقطة M + تعامد MA ⊥ ME + زاويتان 100° و 130° + المطلوب CMD (يجب عدم كتابة 40°)
    const q7 =
      "في الشكل المقابل، أربعة أشعة تخرج من النقطة M. إذا كان \\vec{MA} \\perp \\vec{ME}. وكان m(\\angle BMC) = 100^\\circ و m(\\angle AMB) = 130^\\circ، فأوجد بالبرهان الهندسي m(\\angle CMD).";
    const d7 = matchGeometryWithDiagnostics(q7, "q7_test", "english");
    expect(d7.source).toBe("compositor");
    expect(d7.figure).toBeDefined();
    expect(d7.figure!.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["M", "A", "D", "B", "C"]));
    expect(d7.figure!.segments.length).toBe(4);
    const angles = d7.figure!.angles;
    expect(angles.length).toBe(3);
    const rightAng = angles.find((a) => a.isRightAngle);
    expect(rightAng).toBeDefined();
    expect(angles.some((a) => a.degreesLabel === "100°")).toBe(true);
    expect(angles.some((a) => a.degreesLabel === "130°")).toBe(true);
    expect(angles.some((a) => a.degreesLabel === "40°")).toBe(false); // حجب الحل
    const svg7 = projectGeometryFigureToSVGMarkup(d7.figure!, { numeralMode: "western" });
    expect(svg7).toContain("<polygon");
    expect(svg7).toContain("100°");
    expect(svg7).toContain("130°");
    expect(svg7).not.toContain("40°"); // حجب الحل
  });
});
