/**
 * @file prep-grade3-trigonometry-catalog.test.ts
 * @description اختبارات التحقق الشاملة للقواعد الذهبية العشر لدرس «النسب المثلثية الأساسية للزاوية الحادة» (حساب المثلثات - 3 إعدادي)
 * وتشديد الالتزام الحصري بالمصادر ومنع اختلاق الأفكار والقوانين.
 */

import { describe, expect, it } from "vitest";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { mergeBookletThreeStagesRepliesToPrintableItems } from "@/core/ingestion/notebooklm-booklet-stages-merger";
import { buildBookletStageNotebookLMPrompt } from "@/core/prompts/booklet-three-stages-prompt-builder";
import { buildSmartGeometryPromptGuidance } from "@/core/prompts/smart-geometry-prompt-director";

describe("Grade 3 Prep Trigonometry — Golden Rules & Strict Source-Only Prompt Invariants", () => {
  it("1. enforces strict zero-hallucination of out-of-source ideas or laws in Stage 1 prompt", () => {
    const prompt = buildBookletStageNotebookLMPrompt({
      stageNumber: 1,
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "trigonometry",
      unitTitleArabic: "حساب المثلثات",
      lessonTitleArabic: "النسب المثلثية الأساسية للزاوية الحادة",
      solvedExamplesPerIdea: 2,
    });

    expect(prompt).toContain("حظر قاطع لاختلاق الأفكار أو القوانين");
    expect(prompt).toContain("ممنوع اختلاق أفكار أو قوانين غير موجودة في الدرس");
    expect(prompt).toContain("تحويل خطوة حل/إثبات فرعي إلى قانون مستقل وفكرة جديدة");
  });

  it("2. activates smart geometry guidance for trigonometry branch and lessons", () => {
    const guidance = buildSmartGeometryPromptGuidance({
      branchId: "trigonometry",
      lessonTitleArabic: "النسب المثلثية الأساسية للزاوية الحادة",
    });
    expect(guidance).toContain("توجيه الإخراج الهندسي للإعدادي وحساب المثلثات");
    expect(guidance).toContain("[رسم هندسي: ...]");
  });

  it("3. Golden Rule 1: draws parametric right triangles (ABC, XYZ, DEF, LMN, PQR) with 3, 2, 1, or 0 given sides", () => {
    // 3 sides given (Example 1)
    const ex1 = matchGeometryWithDiagnostics(
      "في المثلث ABC القائم الزاوية في B، إذا كان AB = 3 سم، BC = 4 سم، AC = 5 سم، فإن sin C يساوي",
      "trig_ex1"
    );
    expect(ex1.decision).toBe("green");
    expect(ex1.figure).toBeDefined();
    expect(ex1.figure?.vertices.map((v) => v.label)).toEqual(["A", "B", "C"]);

    // 2 sides given (Example 7 - Pythagoras)
    const ex7 = matchGeometryWithDiagnostics(
      "في المثلث ABC القائم الزاوية في B، إذا كان AB = 6 سم و BC = 8 سم، فإن cos C = ....",
      "trig_ex7"
    );
    expect(ex7.decision).toBe("green");
    expect(ex7.figure).toBeDefined();

    // 1 side + trig ratio given (Example 25 - no false missing number for 5/13)
    const ex25 = matchGeometryWithDiagnostics(
      "في الشكل المقابل، ABC مثلث قائم الزاوية في B، فيه طول الوتر AC = 26 سم، و sin C = 5/13. أوجد طول كل من AB و BC.",
      "trig_ex25"
    );
    expect(ex25.decision).toBe("green");
    expect(ex25.figure).toBeDefined();

    // 0 numeric sides given - symbolic complementary angle proof (Example 14 / Drill 16)
    const dr16 = matchGeometryWithDiagnostics(
      "في المثلث ABC القائم الزاوية في B، أثبت أن sin A - cos C = 0.",
      "trig_dr16"
    );
    expect(dr16.decision).toBe("green");
    expect(dr16.figure).toBeDefined();
  });

  it("4. Golden Rule 2: draws nested right triangles ΔADE (right at D) and ΔABC (right at B) sharing ∠A (Example 26)", () => {
    const ex26 = matchGeometryWithDiagnostics(
      "في الشكل المقابل، ΔADE قائم في D، و ΔABC قائم في B، حيث ∠A زاوية مشتركة. إذا كان AD = 8 سم، ED = 6 سم، BC = 12 سم، فاحسب طول كل من AB و BD.",
      "trig_ex26"
    );
    expect(ex26.decision).toBe("green");
    expect(ex26.figure).toBeDefined();
    expect(ex26.figure?.vertices).toHaveLength(5);
  });

  it("5. Golden Rule 3: draws isosceles triangle with altitude to base (AD ⊥ BC and XW ⊥ YZ) (Examples 43, 44 & Drill 47)", () => {
    const ex43 = matchGeometryWithDiagnostics(
      "في المثلث ABC المتساوي الساقين، إذا كان AB = AC = 10 سم، و BC = 12 سم، ورسم AD ⊥ BC حيث D ∈ BC، فإن cos B = ....",
      "trig_ex43"
    );
    expect(ex43.decision).toBe("green");
    expect(ex43.figure).toBeDefined();

    const dr47 = matchGeometryWithDiagnostics(
      "في المثلث XYZ المتساوي الساقين، إذا كان XY = XZ = 25 سم، YZ = 30 سم، ورسم XW ⊥ YZ، احسب cos Y و sin(∠YXW).",
      "trig_dr47"
    );
    expect(dr47.decision).toBe("green");
    expect(dr47.figure).toBeDefined();
  });

  it("6. Golden Rules 4, 5, 6, 7, 8: draws square with midpoint E, coordinate rectangle OABC, rectangle diagonal, adjacent squares, and rhombus", () => {
    // Square ABCD with E midpoint AD (Example 31)
    const ex31 = matchGeometryWithDiagnostics(
      "في المربع ABCD، إذا كانت E منتصف الضلع AD، فإن tan(∠BCE) تساوي:",
      "trig_ex31"
    );
    expect(ex31.decision).toBe("green");
    expect(ex31.figure).toBeDefined();

    // Coordinate Rectangle OABC (Example 32)
    const ex32 = matchGeometryWithDiagnostics(
      "في المستوى الإحداثي المتعامد، إذا كانت نقطتا رؤوس المستطيل OABC هما A(6, 0) و B(6, 3)، فإن tan(∠ABO) تساوي:",
      "trig_ex32"
    );
    expect(ex32.decision).toBe("green");
    expect(ex32.figure).toBeDefined();

    // Rectangle ABCD with AB = 6, BC = 8 (Drill 34)
    const dr34 = matchGeometryWithDiagnostics(
      "في المستطيل ABCD، إذا كان AB = 6 سم و BC = 8 سم، احسب sin(∠ACD) و cos(∠ACD).",
      "trig_dr34"
    );
    expect(dr34.decision).toBe("green");
    expect(dr34.figure).toBeDefined();

    // 4 Congruent Adjacent Squares forming Rectangle ABCD (Drill 35)
    const dr35 = matchGeometryWithDiagnostics(
      "أربعة مربعات متطابقة طول ضلع كل منها 1 وحدة طول، وضعت جنباً إلى جنب لتكوين المستطيل ABCD، احسب tan(∠CAB).",
      "trig_dr35"
    );
    expect(dr35.decision).toBe("green");
    expect(dr35.figure).toBeDefined();

    // Rhombus ABCD with diagonals intersecting at M (HW #24)
    const hw24 = matchGeometryWithDiagnostics(
      "في المعين ABCD الذي قطراه AC و BD يتقاطعان في النقطة M، إذا كان AC = 12 سم و BD = 16 سم، احسب طول الضلع AB، ثم أوجد sin(∠ABM) و cos(∠ABM).",
      "trig_hw24"
    );
    expect(hw24.decision).toBe("green");
    expect(hw24.figure).toBeDefined();
  });

  it("7. Golden Rule 9: draws isosceles trapezoid and right trapezoid (Examples 49 & 50)", () => {
    const ex49 = matchGeometryWithDiagnostics(
      "في الشكل المقابل، ABCD شبه منحرف متساوي الساقين فيه AD // BC، AD = 4 سم، AB = CD = 5 سم، BC = 12 سم. أثبت أن: (5 tan B cos C)/(sin^2 C + cos^2 B) = 3.",
      "trig_ex49"
    );
    expect(ex49.decision).toBe("green");
    expect(ex49.figure).toBeDefined();

    const ex50 = matchGeometryWithDiagnostics(
      "في الشكل المقابل، ABCD شبه منحرف فيه AD // BC، m(∠B) = 90°، AB = 3 سم، AD = 6 سم، BC = 10 سم. أثبت أن: cos(∠DCB) - tan(∠ACB) = 1/2.",
      "trig_ex50"
    );
    expect(ex50.decision).toBe("green");
    expect(ex50.figure).toBeDefined();
  });

  it("8. Golden Rule 10: draws applied life right triangles (kite, ladder, lamp post & shadow, tower & rope)", () => {
    const ex55 = matchGeometryWithDiagnostics(
      "طائرة ورقية مربوطة بخيط طوله 20 متراً، فإذا كان الخيط يميل على المستوى الأفقي للأرض بزاوية θ بحيث sin θ = 3/5، فاحسب الارتفاع الرأسي للطائرة عن سطح الأرض.",
      "trig_ex55"
    );
    expect(ex55.decision).toBe("green");
    expect(ex55.figure).toBeDefined();

    const ex56 = matchGeometryWithDiagnostics(
      "سلم طوله 10 أمتار يستند بطرفه العلوي على حائط رأسي وبطرفه السفلي على أرض أفقية، وصنع السلم زاوية θ مع الأرض بحيث كان cos θ = 0.6. احسب ارتفاع قمة السلم عن سطح الأرض.",
      "trig_ex56"
    );
    expect(ex56.decision).toBe("green");
    expect(ex56.figure).toBeDefined();

    const dr59 = matchGeometryWithDiagnostics(
      "عمود إنارة ارتفاعه 6 أمتار، يلقي ظلاً على أرض أفقية طوله 8 أمتار، فإذا كانت θ هي زاوية ميل شعاع الشمس على الأرض، احسب قيم النسب المثلثية الأساسية للزاوية θ.",
      "trig_dr59"
    );
    expect(dr59.decision).toBe("green");
    expect(dr59.figure).toBeDefined();

    const dr60 = matchGeometryWithDiagnostics(
      "حبل مشدود من قمة برج ارتفاعه 24 متراً إلى نقطة تثبيت على الأرض تبعد 7 أمتار عن قاعدة البرج، احسب طول الحبل، ثم أوجد قيمة sin θ حيث θ هي زاوية ميل الحبل على الأرض.",
      "trig_dr60"
    );
    expect(dr60.decision).toBe("green");
    expect(dr60.figure).toBeDefined();
  });

  it("9. automatically attaches figures to booklet stage 1 & stage 2 items even without explicit [رسم هندسي] tags", () => {
    const stage1Raw = [
      "الفكرة الأولى: إيجاد النسب المثلثية الأساسية لزاوية حادة في مثلث قائم معلوم الأضلاع | معرف الفكرة: idea-01",
      "مفهوم الفكرة: النسب المثلثية الأساسية للزاوية الحادة.",
      "القاعدة الرياضية: $\\sin C = \\frac{AB}{AC}$",
      "المثال 1 | معرف المثال: example-01-01",
      "نص المسألة: في المثلث $ABC$ القائم الزاوية في $B$، إذا كان $AB = 3$ سم، $BC = 4$ سم، $AC = 5$ سم، فإن $\\sin C$ يساوي: (أ) 4/5 (ب) 3/5 (جـ) 3/4 (د) 4/3",
      "خطوات الحل:",
      "1. نحدد الضلع المقابل والوتر.",
      "الناتج النهائي: 3/5",
      "نهاية الفكرة الأولى",
    ].join("\n");

    const stage2Raw = [
      "الفكرة الأولى: إيجاد النسب المثلثية | معرف الفكرة: idea-01",
      "حاول بنفسك:",
      "[1] في المثلث $XYZ$ القائم الزاوية في $Z$، إذا كان $XY = 13$ سم، $YZ = 12$ سم، $XZ = 5$ سم، احسب قيم النسب المثلثية الأساسية للزاوية $X$. | معرف السؤال: practice-01-01",
      "تمارين الواجب المنزلي:",
      "#1 [اختر] في شبه المنحرف المتساوي الساقين $ABCD$ فيه $AD // BC$، $AD = 4$ سم، $AB = CD = 5$ سم، $BC = 10$ سم، فإن $\\cos B$ تساوي: (أ) 3/5 (ب) 4/5 (جـ) 3/4 (د) 5/3 | معرف السؤال: homework-01-01",
      "نهاية الفكرة الأولى",
    ].join("\n");

    const items = mergeBookletThreeStagesRepliesToPrintableItems({
      stage1Raw,
      stage2Raw,
      branchId: "numbers", // حتى لو ترك المعلم الفرع الافتراضي numbers بالخطأ!
      branchNameAr: "حساب المثلثات",
      unitId: "u-trig",
      lessonId: "l-trig-1",
      lessonTitleArabic: "النسب المثلثية للزاوية الحادة",
    });

    expect(items).toHaveLength(3);
    expect(items[0].geometryFigure).toBeDefined();
    expect(items[1].geometryFigure).toBeDefined();
    expect(items[2].geometryFigure).toBeDefined();
  });
});
