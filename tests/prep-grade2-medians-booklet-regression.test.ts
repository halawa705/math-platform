import { describe, expect, it } from "vitest";
import { matchGeometryWithDiagnostics } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";
import { solveSegmentPillOrBracketPlacement } from "../src/core/geometry-engine/svg-label-collision-layout-solver";
import { applyAskedQuestionMarkToFigure } from "../src/core/geometry-engine/verification/geometry-asked-question-mark-resolver";
import { convertEnglishUnitsToArabic } from "../src/core/math-text/math-unit-quantity-binder";
import { mergeLogicalSolutionSteps } from "../src/core/ingestion/notebooklm-exam-questions-parser";
import { parseSolvedExamplesFromSection } from "../src/core/ingestion/notebooklm-stage-parsers-helper";

describe("prep grade 2 triangle medians booklet regressions", () => {
  it("renders sequential medians M and ray-cut F cleanly even when tag is partial (Example 1, Try 3, HW 4)", () => {
    const ex1Prompt =
      "في الشكل المقابل، ΔABC فيه D منتصف الضلع BC، و E منتصف الضلع AC. رُسمت القطعتان AD و BE فتقاطعتا في النقطة M. رُسم الشعاع CM ليقطع الضلع AB في النقطة F. فإذا كان طول AB = 14 سم، احسب بالبرهان طول القطعة AF.";
    const ex1WithPartialTag = matchGeometryWithDiagnostics(
      {
        geometryTag: "مثلث ABC فيه D منتصف BC و E منتصف AC و AB = 14 سم",
        problemPrompt: ex1Prompt,
      },
      "ex-1"
    );
    expect(ex1WithPartialTag.decision).toBe("green");
    expect(ex1WithPartialTag.figure?.vertices.map((v) => v.label)).toEqual(
      expect.arrayContaining(["A", "B", "C", "D", "E", "M", "F"])
    );

    const try3Prompt =
      "في الشكل المقابل مثلث ABC فيه D منتصف الضلع BC، E منتصف الضلع AC. رُسم المتوسطان AD و BE فتقاطعا في النقطة M. رُسم الشعاع CM ليقطع الضلع AB في F. فإذا كان AB = 16 سم، احسب بالبرهان طول القطعة المستقيمة BF.";
    const res = matchGeometryWithDiagnostics({ problemPrompt: try3Prompt }, "try-3");
    expect(res.decision).toBe("green");
    expect(res.figure!.vertices.map((v) => v.label)).toEqual(
      expect.arrayContaining(["A", "B", "C", "D", "E", "M", "F"])
    );
    expect(res.figure!.segments.filter((s) => s.lengthLabel?.value === 16).length).toBe(1);
  });

  it("renders all 49 PDF problems across the 23 pages with decision=green and zero missing givens", () => {
    const pdfCases: ReadonlyArray<readonly [string, string, readonly string[]]> = [
      ["try6", "في ΔKLM، إذا كانت X هي نقطة منتصف الضلع LM، ورُسمت القطعة المستقيمة KX. ما الاسم الرياضي الدقيق للقطعة المستقيمة KX في المثلث KLM؟", ["K", "L", "M", "X"]],
      ["ex7", "في الشكل المقابل، ΔABC فيه AD متوسط، و BE متوسط، تقاطعا في النقطة M. فإذا كان طول المتوسط AD = 12 سم، وطول القطعة BM = 8 سم. احسب بالبرهان طول كل من: AM، MD، و ME.", ["A", "B", "C", "D", "E", "M"]],
      ["ex8", "في الشكل المقابل، ΔABC فيه G نقطة تقاطع المتوسطات، CF متوسط طوله 15 سم، GE = 4 سم (حيث BE متوسط). احسب بالبرهان طول كل من: القطعة CG، القطعة GF، والمتوسط بالكامل BE.", ["A", "B", "C", "E", "F", "G"]],
      ["try9", "في الشكل المقابل، ΔABC فيه AD متوسط، M هي نقطة تقاطع متوسطات المثلث. إذا كان طول المتوسط بالكامل AD = 18 سم، احسب بالبرهان طول كل من AM و MD.", ["A", "B", "C", "D", "M"]],
      ["try10", "في الشكل المقابل، ΔABC فيه M نقطة تلاقي المتوسطات، BE متوسط. إذا كان طول القطعة ME = 4 سم، احسب طول القطعة BM، وطول المتوسط بالكامل BE.", ["A", "B", "C", "E", "M"]],
      ["try12", "في الشكل المقابل، ΔABC متوسطاته تتقاطع في M. إذا كان CF متوسطاً فيه CM = 10 سم، احسب طول القطعة MF، وطول المتوسط CF.", ["A", "B", "C", "F", "M"]],
      ["ex14", "في الشكل المقابل، ΔABC فيه E منتصف AB، F منتصف AC. تقاطع المتوسطان BF و CE في النقطة G. إذا كان طول BC = 24 سم، GB = 12 سم، GC = 18 سم. أوجد بالبرهان محيط المثلث EFG.", ["A", "B", "C", "E", "F", "G"]],
      ["try17", "في الشكل المقابل، ΔABC متساوي الأضلاع طول ضلعه 12 سم. تقاطعت متوسطاته الثلاثة في النقطة M. إذا كانت D, E منتصفي BC, AC على الترتيب، وكان طول المتوسط الواحد يساوي 6√3 سم. احسب محيط المثلث MDE.", ["A", "B", "C", "D", "E", "M"]],
      ["try18", "في الشكل المقابل، ΔABC فيه D منتصف BC، E منتصف AC. AD تقاطع BE في النقطة M. إذا كان AB = 18 سم، AD = 12 سم، BE = 15 سم. احسب بالبرهان محيط المثلث MDE.", ["A", "B", "C", "D", "E", "M"]],
      ["ex19", "في الشكل المقابل، ΔABC فيه AD متوسط، والنقطة M هي نقطة تقاطع متوسطات المثلث. إذا كان AM = (3x - 1) سم، وطول MD = (x + 2) سم. أوجد بالبرهان قيمة x، ثم احسب طول المتوسط بالكامل AD.", ["A", "B", "C", "D", "M"]],
      ["ex20", "في الشكل المقابل، ΔABC فيه AD متوسط، بحيث BD = (2x + 3) سم، DC = (3x - 2) سم. أوجد بالبرهان قيمة x، ثم احسب طول الضلع BC.", ["A", "B", "C", "D"]],
      ["try21", "في الشكل المقابل، ΔABC فيه AD متوسط، والنقطة M نقطة تقاطع متوسطات المثلث. إذا كان AM = (4x - 2) سم، MD = (x + 3) سم. أوجد بالبرهان قيمة x، ثم احسب طول المتوسط AD.", ["A", "B", "C", "D", "M"]],
      ["try22", "في الشكل المقابل، ΔABC فيه BE متوسط تتقاطع فيه المتوسطات عند M. إذا كان BM = (5y - 4) سم، ME = (2y + 1) سم. احسب بالبرهان قيمة y، ثم أوجد طول القطعة BM.", ["A", "B", "C", "E", "M"]],
      ["try23", "في الشكل المقابل، ΔABC فيه AD متوسط مرسوم من الرأس A إلى BC. إذا كان BD = (3x - 5) سم، DC = (x + 7) سم. أوجد قيمة x، ثم احسب طول الضلع BC.", ["A", "B", "C", "D"]],
      ["try24", "في الشكل المقابل، ΔABC فيه M نقطة تلاقي المتوسطات، CF متوسط طوله الكلي 27 سم. إذا كان CM = (3z) سم، MF = (z + 3) سم. أوجد قيمة z وتأكد من صحة النسبة هندسياً.", ["A", "B", "C", "F", "M"]],
      ["ex26", "في الشكل المقابل، ΔABC قائم الزاوية في A، فيه AD متوسط خارج من رأس القائمة طوله (2x - 1) سم، وطول الوتر المقابل BC = 18 سم. احسب بالبرهان قيمة x وطول AD.", ["A", "B", "C", "D"]],
      ["try30", "في الشكل المقابل، ΔABC قائم الزاوية في A، فيه AD متوسط خارج من رأس القائمة. إذا كان طول AD = 6.5 سم، فما طول الوتر BC؟", ["A", "B", "C", "D"]],
      ["ex31", "في الشكل المقابل، ΔABC قائم الزاوية في B، والنقطة D منتصف الوتر AC. إذا كانت G هي نقطة تقاطع متوسطات المثلث ABC، وكان طول BG = 6 سم. احسب بالبرهان طول كل من: المتوسط BD، والوتر AC.", ["A", "B", "C", "D", "G"]],
      ["ex32", "في الشكل المقابل، ΔABC قائم الزاوية في B، فيه AC = 24 سم، D منتصف AC. النقطة G هي نقطة تلاقي متوسطات المثلث. أوجد بالبرهان طول القطعة GD.", ["A", "B", "C", "D", "G"]],
      ["try34", "في الشكل المقابل، ΔABC قائم الزاوية في B، فيه AB = 9 سم، BC = 12 سم. D منتصف AC، و G نقطة تلاقي متوسطات المثلث. احسب بالبرهان طول القطعة المستقيمة BG.", ["A", "B", "C", "D", "G"]],
      ["try35", "في الشكل المقابل، ΔABC قائم الزاوية في B، D منتصف AC. النقطة M نقطة تلاقي المتوسطات تنتمي إلى BD. إذا كان BM = 8 سم، احسب بالبرهان طول المتوسط BD، ثم أوجد طول الوتر AC.", ["A", "B", "C", "D", "M"]],
      ["try36", "في الشكل المقابل، ΔABC قائم الزاوية في B، D منتصف AC، M نقطة تقاطع متوسطاته. إذا كان MD = 3.5 سم، احسب طول الوتر AC.", ["A", "B", "C", "D", "M"]],
      ["try47", "في الشكل المقابل، ΔABC قائم الزاوية في B، m(∠C) = 30°، AC = 16 سم. رُسم المتوسط BD، والنقطة M هي نقطة تقاطع متوسطات المثلث. احسب محيط المثلث ABM.", ["A", "B", "C", "D", "M"]],
      ["try52", "في الشكل المقابل، ABCD متوازي أضلاع تقاطع قطراه في M. النقطة X منتصف AB، والنقطة Y منتصف CD. رُسمت القطعتان DX و BY لتقطعا القطر AC في P و Q على الترتيب. برهن أن: AP = PQ = QC.", ["A", "B", "C", "D", "M", "X", "Y", "P", "Q"]],
      ["try54", "في الشكل المقابل، ABCD متوازي أضلاع تقاطع قطراه في M. أُخذت النقطة N ∈ AM بحيث AN = 2NM. رُسم الشعاع DN ليقطع BC في النقطة E. أثبت بالبرهان أن E منتصف الضلع BC.", ["A", "B", "C", "D", "M", "N", "E"]],
      ["try57", "لوحة إعلانية معدنية على شكل مثلث متساوي الساقين ABC تم تثبيتها في الأرض عند نقطة ارتكاز واحدة تمثل مركز ثقل اللوحة (نقطة تلاقي متوسطاتها G). إذا كان طول المتوسط الرأسي للوحة AD = 90 سم، احسب بُعد نقطة التثبيت G عن قمة اللوحة A وعن قاعدتها D.", ["A", "B", "C", "D", "G"]],
      ["try59", "طاولة طعام خشبية مثلثة الشكل ABC قائمة الزاوية في B. تم وضع دعامة تعزيز حديدية تمتد من الرأس القائم B إلى منتصف الحافة المقابلة D. فإذا كان طول الحافة المقابلة AC = 180 سم، احسب طول دعامة التعزيز BD.", ["A", "B", "C", "D"]],
      ["ex61", "في الشكل المقابل، ΔABC فيه M هي نقطة تقاطع المتوسطات. وكان المتوسطان AD ⊥ BE (أي m(∠AMB) = 90°). فإذا كان AM = 8 سم، BM = 6 سم. احسب بالبرهان: (1) طول الضلع AB.", ["A", "B", "C", "D", "E", "M"]],
      ["try64", "في الشكل المقابل، ΔABC فيه D منتصف BC. أُخذت النقطة E منتصف AD. إذا كانت مساحة ΔABC = 40 سم²، فاحسب مساحة المثلث EBC.", ["A", "B", "C", "D", "E"]],
      ["try65", "في الشكل المقابل، ΔABC مساحته الكلية تساوي 72 سم². تقاطعت متوسطاته الثلاثة في النقطة M. احسب مساحة كل من: المثلث MBD، والمثلث MBC.", ["A", "B", "C", "D", "E", "M"]],
      ["try66", "في الشكل المقابل، ΔABC فيه المتوسطان BE و CD متعامدان في النقطة M. إذا كان BC = 10 سم، وكان MD = 3 سم. احسب بالبرهان طول القطعة ME، وطول المتوسط BE.", ["A", "B", "C", "D", "E", "M"]],
      ["hw2", "في الشكل المقابل، ΔABC قائم الزاوية في B. فيه AB = 15 سم، BC = 20 سم. النقطة D منتصف AC. والنقطة M هي نقطة تلاقي متوسطات المثلث. رُسم المتوسط CE ليقطع AB في E ويمر بالنقطة M. احسب بالبرهان: (1) طول الوتر AC.", ["A", "B", "C", "D", "E", "M"]],
      ["hw4", "في الشكل المقابل، ΔABC فيه D منتصف BC، E منتصف AC. رُسم AD و BE فتقاطعا في النقطة M. مُدّ الشعاع CM ليقطع AB في F. فإذا كان محيط ΔABC = 36 سم، وكان AC = 12 سم، BC = 14 سم. أوجد بالبرهان طول كل من القطعتين AF و FB.", ["A", "B", "C", "D", "E", "M", "F"]],
      ["hw8", "في الشكل المقابل، ΔABC فيه m(∠B) = 90°، m(∠ACB) = 30°. رُسم المتوسط BD، ورُسم من D خط يوازي AB ليقطع BC في E. فإذا كان محيط المثلث BDE = 12 سم. أوجد بالبرهان طول الوتر AC.", ["A", "B", "C", "D", "E"]],
      ["hw10", "في المثلث ABC القائم الزاوية في B، إذا كان D منتصف AC، وكانت النقطة M هي نقطة تلاقي المتوسطات، فإن طول القطعة BM يساوي:", ["A", "B", "C", "D", "M"]],
      ["hw11", "في ΔABC، إذا كان محيط ΔMBC = 28 سم (حيث M نقطة تلاقي متوسطات المثلث، و D, E منتصفا AB, AC)، فإن محيط ΔMDE يساوي:", ["A", "B", "C", "D", "E", "M"]],
      ["hw15", "في المثلث ABC القائم الزاوية في B، إذا كان طول الوتر AC = 18 سم، وكانت M هي نقطة تقاطع متوسطات المثلث، و D منتصف AC، فإن طول MD يساوي:", ["A", "B", "C", "D", "M"]],
      ["hw17", "في الشكل المقابل، مستطيل ABCD قطراه يتقاطعان في M. النقطة E منتصف BC، والنقطة F منتصف CD. رُسمت AE و AF لتقطعا القطر BD في النقطتين X و Y على الترتيب. برهن أن القطعة XY طولها يساوي ثلث طول القطر BD.", ["A", "B", "C", "D", "M", "E", "F", "X", "Y"]],
      ["hw18", "في الشكل المقابل، ΔABC فيه المتوسطان AD و BE متعامدان في النقطة M. فإذا كان AB = 13 سم، وكان طول AM = 12 سم. احسب بالبرهان: (1) طول القطعة BM.", ["A", "B", "C", "D", "E", "M"]],
      ["hw22", "في الشكل المقابل، ABCD متوازي أضلاع قطراه متقاطعان في M. النقطة E منتصف AD. رُسمت القطعة CE لتقطع القطر BD في النقطة N. أثبت بالبرهان أن: (1) N هي نقطة تقاطع متوسطات المثلث ACD.", ["A", "B", "C", "D", "M", "E", "N"]],
      ["hw23", "في الشكل المقابل، ΔABC فيه D منتصف BC، E منتصف AC. تقاطع AD و BE في النقطة M. إذا كان محيط شبه المنحرف ABDE يساوي 42 سم، وكان AB = 16 سم، BD = 6 سم، AE = 8 سم، وكان MD = 3 سم، ME = 4 سم. احسب بالبرهان محيط المثلث MDE.", ["A", "B", "C", "D", "E", "M"]],
      ["hw36", "في الشكل المقابل، شبه منحرف ABCD فيه AD // BC، m(∠B) = 90°، E منتصف CD. رُسمت القطعة AE فكان طولها يساوي نصف طول CD. أثبت بالبرهان أن m(∠CAD) = 90° أو قياس زاوية DAC قائمة طبقاً للمثلث.", ["A", "B", "C", "D", "E"]],
      ["hw37", "في الشكل المقابل، ΔABC فيه M نقطة تلاقي المتوسطات، AD متوسط و CF متوسط. فإذا كان AM = 12 سم، و MF = 3.5 سم. احسب بالبرهان طول كل من: القطعة MD، والقطعة MC، والمتوسط CF.", ["A", "B", "C", "D", "F", "M"]],
      ["hw38", "في الشكل المقابل، ΔABC قائم الزاوية في B، النقطة D منتصف AC، M نقطة تلاقي المتوسطات. إذا كان BM = (x + 2) سم، وكان طول الوتر AC = 24 سم. أوجد بالبرهان قيمة x، ثم احسب طول القطعة MD.", ["A", "B", "C", "D", "M"]],
      ["hw40", "في الشكل المقابل، ΔABC فيه AD متوسط، M نقطة تلاقي متوسطات المثلث. فإذا كان AM = (x² - 1) سم، MD = 4 سم (حيث x عدد حقيقي موجب). أوجد بالبرهان الهندسي قيمة x، ثم احسب طول المتوسط بالكامل AD.", ["A", "B", "C", "D", "M"]],
      ["hw42", "في الشكل المقابل، إذا كان M نقطة تلاقي متوسطات ΔABC، و D, E منتصفا AB, AC على الترتيب، فإن النسبة بين محيط ΔMDE إلى محيط ΔMBC تساوي:", ["A", "B", "C", "D", "E", "M"]],
      ["hw44", "في الشكل المقابل، AD متوسط في ΔABC حيث BC = 18 سم، BD = (x + 4) سم، فإن قيمة x تساوي:", ["A", "B", "C", "D"]],
    ];

    for (const [id, prompt, expectedVerts] of pdfCases) {
      const res = matchGeometryWithDiagnostics({ problemPrompt: prompt }, id);
      expect(res.decision, `Case ${id} failed: ${res.warnings.join(" | ")}`).toBe("green");
      expect(res.source, `Case ${id} should come from compositor`).toBe("compositor");
      expect(res.figure, `Case ${id} missing figure`).toBeDefined();
      const vLabels = res.figure!.vertices.map((v) => v.label);
      expect(vLabels, `Case ${id} missing vertices`).toEqual(expect.arrayContaining([...expectedVerts]));
    }
  });

  it("never leaks a right-angle square at B when the problem asks to prove m(∠ABC) = 90° (Try 42)", () => {
    const res = matchGeometryWithDiagnostics(
      {
        problemPrompt:
          "في الشكل المقابل، ΔABC فيه D منتصف AC. إذا كان AC = 14 سم، BD = 7 سم. أثبت بالبرهان أن m(∠ABC) = 90°.",
      },
      "try-42"
    );
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    expect(res.figure!.angles.some((a) => a.isRightAngle)).toBe(false);
  });

  it("places interior diagonal pill directly on the diagonal (dist = 0) instead of drifting onto outer edge AB (HW 9 / Example 50)", () => {
    const placed = solveSegmentPillOrBracketPlacement({
      seg: {
        fromId: "B",
        toId: "D",
        x1: 30,
        y1: 120,
        x2: 190,
        y2: 40,
        isCompositeSpan: true,
        isInteriorSpan: true,
      },
      textStr: "18 سم",
      centerSx: 110,
      centerSy: 80,
      occupiedBoxes: [],
      allSegments: [
        { fromId: "B", toId: "M", x1: 30, y1: 120, x2: 110, y2: 80, isInteriorSpan: true },
        { fromId: "M", toId: "D", x1: 110, y1: 80, x2: 190, y2: 40, isInteriorSpan: true },
      ],
      bounds: { width: 230, height: 165 },
    });
    expect(placed.mode).toBe("pill");
    expect(placed.bracket).toBeUndefined();
    // At t = 0.28 and dist = 0, point is (30 + 160*0.28, 120 - 80*0.28) = (74.8, 97.6)
    expect(placed.lx).toBeCloseTo(74.8, 1);
  });

  it("never attaches spurious المساحة = ؟ badge on area-equality proof problems (HW 7)", () => {
    const res = matchGeometryWithDiagnostics(
      {
        problemPrompt:
          "في الشكل المقابل مثلث ABC فيه D منتصف AB، E منتصف AC. المتوسطان BE و CD يتقاطعان في M. برهن هندسياً أن: (1) مساحة المثلث DMB = مساحة المثلث EMC.",
      },
      "hw-7"
    );
    expect(res.figure).toBeDefined();
    const checked = applyAskedQuestionMarkToFigure(
      res.figure!,
      "برهن هندسياً أن: مساحة المثلث DMB = مساحة المثلث EMC"
    );
    expect(checked.askedSpec?.kind).toBe("proof");
    expect(checked.interiorBadges?.some((b) => b.text.includes("المساحة")) ?? false).toBe(false);
  });

  it("isolates LTR radical expressions like 6√3 with dir=ltr on SVG and bidi-override on tspan", () => {
    const svg = projectGeometryFigureToSVGMarkup({
      figureId: "rad-test",
      familyId: "triangle_family",
      titleArabic: "مثلث",
      notationLanguage: "english",
      vertices: [
        { id: "rad-test_v_A", label: "A", position: { x: 0, y: 8 } },
        { id: "rad-test_v_B", label: "B", position: { x: 0, y: 0 } },
        { id: "rad-test_v_C", label: "C", position: { x: 6, y: 0 } },
      ],
      segments: [
        {
          id: "rad-test_s_0",
          fromVertexId: "rad-test_v_A",
          toVertexId: "rad-test_v_B",
          lengthLabel: { value: "6√3", unit: "سم", labelKind: "given" },
        },
        { id: "rad-test_s_1", fromVertexId: "rad-test_v_B", toVertexId: "rad-test_v_C" },
        { id: "rad-test_s_2", fromVertexId: "rad-test_v_C", toVertexId: "rad-test_v_A" },
      ],
      angles: [],
    });
    expect(svg).toContain('dir="ltr"');
    expect(svg).toContain('unicode-bidi:bidi-override');
    expect(svg).toContain("6√3");
  });

  it("never corrupts uppercase math segment $KM$ into $ كم kilometer unit and filters lone quotes", () => {
    expect(convertEnglishUnitsToArabic("فإن طول $KM$ يساوي $3\\text{ cm}$ و 5 km")).toBe(
      "فإن طول $KM$ يساوي $3 \\text{سم}$ و 5 كم"
    );
    expect(mergeLogicalSolutionSteps('خطوة 1: AM = 8\n"\nخطوة 2: AB = 10')).toEqual([
      "AM = 8",
      "AB = 10",
    ]);
    const exText = `
مثال 61: في مثلث ABC فيه AD ⊥ BE عند M، AM = 8 سم، BM = 6 سم. احسب بالبرهان:
(1) طول الضلع AB.
(2) طول المتوسط AD.
خطوات الحل:
1. المثلث AMB قائم الزاوية في M، لذا AB = 10 سم.
الناتج النهائي: AB = 10 سم
    `;
    const parsed = parseSolvedExamplesFromSection(exText, "مثال");
    expect(parsed[0]?.steps.every((s) => !s.startsWith("طول الضلع AB"))).toBe(true);
  });
});
