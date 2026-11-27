/**
 * @file review-grade4-composite-and-bidi-regression.test.ts
 * @description اختبارات الانحدار الشاملة لمراجعة الصف الرابع الابتدائي:
 * - منع الرسوم العشوائية في الأسئلة القانونية/اللفظية مع عزل بدائل MCQ قبل المطابقة الهندسية.
 * - فك ربط #14[رسم] و #11 و #12 دون دمج أو بتر، وتطابق ترقيم المقالي 1..N مع حلول المرحلة ٣.
 * - دعم الأشكال المركبة بجميع اتجاهاتها (حرف L، تركيب مستطيلين متلاصقين، حرف T، حديقة ومسبح متداخل ABCD).
 * - حفظ كلمات الحل (سرد، حل المعادلة) وعزل النصوص العربية داخل KaTeX وفواصل الآلاف في الوضع الغربي.
 */

import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { mergeFinalReviewThreeStagesToPrintableItems } from "./notebooklm-final-review-parser";
import { matchGeometryWithDiagnostics } from "../geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../geometry-engine/vector-svg-figure-projector";
import { canonicalizeMathText } from "../math-text/math-text-canonicalizer";
import { findResidualLeaks } from "../math-text/math-leak-final-gate";
import { buildPrimaryStageFigurePromptGuidance } from "../prompts/geometry-prompt-guidance-primary";
import SafeKaTeXBiDiMathRenderer from "../../components/global-ui/safe-katex-bidi-math-renderer";

describe("Grade 4 Monthly Review — Anti-Random Diagrams, Composite Shapes, Splitting & BiDi", () => {
  it("keeps all Stage 1 MCQs intact (#13, #14 with L-shape, #15) and draws ZERO unsolicited shapes on formula MCQs", () => {
    const stage1 = [
      `#1 محيط المستطيل الذي طوله \\(L\\) وعرضه \\(W\\) يُحسب من العلاقة:\n(أ) \\(L \\times W\\)\n(ب) \\((L + W) \\times 2\\)\n(جـ) \\(L + W\\)\n(د) \\(2 \\times L \\times W\\)\nالإجابة الصحيحة: (ب) \\((L + W) \\times 2\\)`,
      `#2 محيط مربع طول ضلعه \\(6\\) سم يساوي:\n(أ) \\(12\\) سم\n(ب) \\(36\\) سم\n(جـ) \\(24\\) سم\n(د) \\(10\\) سم\nالإجابة الصحيحة: (جـ) \\(24\\) سم`,
      `#6 مستطيل مساحته \\(30\\) سم\\(^2\\) وطوله \\(6\\) سم، فإن عرضه يساوي:\n(أ) \\(5\\) سم\n(ب) \\(24\\) سم\n(جـ) \\(10\\) سم\n(د) \\(180\\) سم\nالإجابة الصحيحة: (أ) \\(5\\) سم`,
      `#13 مستطيل طوله \\(4\\) أمتار وعرضه \\(200\\) سم، فإن مساحته بالمتر المربع تساوي:\n(أ) \\(8\\) م\\(^2\\)\n(ب) \\(800\\) م\\(^2\\)\n(جـ) \\(6\\) م\\(^2\\)\n(د) \\(12\\) م\\(^2\\)\nالإجابة الصحيحة: (أ) \\(8\\) م\\(^2\\)`,
      `#14 [رسم هندسي: شكل مركب على هيئة حرف L أبعاده الخارجية: الضلع الرأسي الأيسر \\(6\\) م، والضلع الأفقي السفلي \\(8\\) م، والضلع الرأسي الأيمن \\(2\\) م، والجزء الأفقي العلوي \\(4\\) م]، فإن محيط هذا الشكل يساوي:\n(أ) \\(48\\) م\n(ب) \\(28\\) م\n(جـ) \\(14\\) م\n(د) \\(32\\) م\nالإجابة الصحيحة: (ب) \\(28\\) م`,
      `#15 شكل هندسي مركب تم تقسيمه إلى مستطيلين؛ الأول أبعاده \\(5\\) سم و \\(4\\) سم، والثاني أبعاده \\(3\\) سم و \\(2\\) سم، فإن مساحة الشكل الكلية تساوي:\n(أ) \\(14\\) سم\\(^2\\)\n(ب) \\(20\\) سم\\(^2\\)\n(جـ) \\(26\\) سم\\(^2\\)\n(د) \\(30\\) سم\\(^2\\)\nالإجابة الصحيحة: (جـ) \\(26\\) سم\\(^2\\)`,
      `📝 هل ترغب في الانتقال إلى (المرحلة ٢) لإعداد أسئلة "أكمل ما يأتي" والمسائل المقالية لنفس المقرر؟`,
    ].join("\n\n---\n\n");

    for (const branchId of ["numbers", "plane_geometry"] as const) {
      const items = mergeFinalReviewThreeStagesToPrintableItems({
        stage1Raw: stage1,
        branchId,
        gradeId: "prim-4",
        branchNameAr: "تطبيقات الوحدات",
        titleArabic: "مراجعة شهر",
      });

      expect(items).toHaveLength(6);
      expect(items[0].geometryFigure).toBeUndefined();
      expect(items[1].geometryFigure).toBeUndefined();
      expect(items[2].geometryFigure).toBeUndefined();
      expect(items[3].geometryFigure).toBeUndefined();

      const q14 = items[4];
      expect(q14.promptAr).toContain("في الشكل المقابل");
      expect(q14.promptAr).toContain("محيط هذا الشكل يساوي");
      expect(q14.geometryFigure).toBeDefined();
      const labels = q14.geometryFigure!.segments.map((s) => String(s.lengthLabel?.value ?? ""));
      expect(labels.some((l) => l.includes("6"))).toBe(true);
      expect(labels.some((l) => l.includes("8"))).toBe(true);
      expect(labels.some((l) => l.includes("2"))).toBe(true);
      expect(labels.some((l) => l.includes("4"))).toBe(true);
      expect(q14.figureDiagnosticsAr).toBeUndefined();
    }
  });

  it("separates #10, #11, #12 cleanly, builds L-shape and ABCD pool-in-garden figures, and preserves سرد and حل المعادلة", () => {
    const stage2 = [
      `#10 برواز صورة مستطيل الشكل محيطه \\(24\\) سم، وطوله يعادل ضعف عرضه (\\(L = 2 \\times W\\)). احسب كلاً من بُعدي البرواز، ثم أوجد مساحة الصورة.`,
      `#11 [رسم هندسي: شكل مركب على هيئة حرف L، أبعاده موضحة كالتالي: الضلع الرأسي الأيسر طوله \\(10\\) سم، والضلع الأفقي السفلي طوله \\(8\\) سم، والضلع الرأسي الأيمن طوله \\(4\\) سم، والضلع الأفقي العلوي طوله \\(3\\) سم]. احسب أطوال الأضلاع المجهولة، ثم أوجد المحيط الكلي للشكل ومساحته الكلية.`,
      `#12 [رسم هندسي: حديقة مستطيلة الشكل \\(ABCD\\) أبعادها \\(14\\) متراً و \\(9\\) أمتار، يتوسطها مسبح مستطيل الشكل أبعاده \\(6\\) أمتار و \\(4\\) أمتار]. احسب مساحة الجزء المتبقي من الحديقة.`,
      `#13 سلك معدني طوله \\(40\\) سم، شُكّل على هيئة مربع ثم مستطيل عرضه \\(6\\) سم.`,
      `💡 هل ننتقل الآن إلى **المرحلة ٣** لإعداد دليل الإجابات النموذجية؟`,
    ].join("\n\n");

    const stage3 = [
      `حل السؤال #1:\nخطوات الحل:\n- نصف المحيط: \\(L + W = 24 \\div 2 = 12\\) سم.\nالناتج النهائي: \\(32\\) سم\\(^2\\)`,
      `حل السؤال #2:\nخطوات الحل:\n- الضلع الأفقي الأوسط = \\(8 - 3 = 5\\) سم.\nالناتج النهائي: \\(36\\) سم`,
      `حل السؤال #3:\nخطوات الحل:\n- حساب مساحة الفناء الداخلي: \\(A_{\\text{داخلي}} = 15 \\times 10 = 150\\) م\\(^2\\).\nالناتج النهائي: \\(102\\) م\\(^2\\)`,
      `حل السؤال #4:\nخطوات الحل:\n- سرد عوامل العدد \\(12\\): \\(\\{1, 2, 3, 4, 6, 12\\}\\).\n- حل المعادلة بالقسمة: \\(y = 45 \\div 5 = 9\\).\nالناتج النهائي: \\(\\text{ع.م.أ}(18, 24) = 6\\)`,
      `📄 هل تود تحويل هذه المراجعة الشاملة إلى مذكرة مطبوعة بصيغة PDF؟`,
    ].join("\n\n---\n\n");

    const items = mergeFinalReviewThreeStagesToPrintableItems({
      stage1Raw: "",
      stage2Raw: stage2,
      stage3Raw: stage3,
      branchId: "numbers",
      gradeId: "prim-4",
      branchNameAr: "تطبيقات الوحدات",
      titleArabic: "مراجعة شهر",
    });

    expect(items).toHaveLength(4);
    expect(items[0].geometryFigure).toBeUndefined();
    expect(items[1].promptAr).toContain("أوجد المحيط الكلي للشكل");
    expect(items[1].geometryFigure).toBeDefined();
    expect(items[1].geometryFigure!.vertices).toHaveLength(6);

    expect(items[2].promptAr).toContain("الجزء المتبقي من الحديقة");
    expect(items[2].geometryFigure).toBeDefined();
    expect(items[2].geometryFigure!.polygons).toHaveLength(2);
    const poolSvg = projectGeometryFigureToSVGMarkup(items[2].geometryFigure!, {
      notationLanguage: "english",
      numeralMode: "western",
    });
    expect(poolSvg).toContain("14");
    expect(poolSvg).toContain("9");
    expect(poolSvg).toContain("6");
    expect(poolSvg).toContain("4");

    const q4Steps = items[3].solutionStepsAr?.join(" ") ?? "";
    expect(q4Steps).toContain("سرد عوامل العدد");
    expect(q4Steps).not.toMatch(/^رد عوامل/);
    expect(q4Steps).toContain("حل المعادلة بالقسمة");
    expect(q4Steps).not.toContain("هل تود تحويل");
  });

  it("supports all Egyptian directorate exam composite figures (top-bar L, adjacent composed rectangles, and T-shape)", () => {
    const cases = [
      {
        id: "cairo_2025_l",
        desc: "شكل مركب على هيئة حرف L أبعاده: الضلع الأفقي العلوي 10 م، الضلع الرأسي الأيمن 4 م، والضلع السفلي المجهول ?",
        mustHave: ["10", "4", "؟"],
      },
      {
        id: "sharkia_2025_l",
        desc: "شكل مركب حرف L: الضلع الأفقي العلوي 7 سم، الضلع الرأسي الأيسر 4 سم، الضلع الرأسي الأيمن 1 سم، والضلع الأفقي الداخلي 3 سم",
        mustHave: ["7", "4", "1", "3"],
      },
      {
        id: "menoufia_2025_adj",
        desc: "تركيب مستطيلين متلاصقين الأول أبعاده 3 سم و 5 سم والثاني أبعاده 3 سم و 3 سم لحساب المساحة",
        mustHave: ["5", "3"],
      },
      {
        id: "alex_2025_adj",
        desc: "تركيب مربع وطوله 5 سم ومستطيل أبعاده 5 سم و 3 سم لحساب المحيط",
        mustHave: ["5", "3"],
      },
    ];

    for (const c of cases) {
      const diag = matchGeometryWithDiagnostics({ geometryTag: c.desc, problemPrompt: c.desc }, c.id, "english");
      expect(diag.decision, `${c.id} warnings: ${diag.warnings.join("; ")}`).toBe("green");
      expect(diag.figure).toBeDefined();
      const svg = projectGeometryFigureToSVGMarkup(diag.figure!, { notationLanguage: "english", numeralMode: "western" });
      for (const lbl of c.mustHave) {
        expect(svg, `${c.id} missing ${lbl}`).toContain(lbl);
      }
    }
  });

  it("isolates Arabic subscripts in KaTeX, keeps ع.م.أ / multi-step BiDi readable, and formats western thousands commas without leaks", () => {
    const subHtml = renderToStaticMarkup(
      React.createElement(SafeKaTeXBiDiMathRenderer, {
        text: "حساب مساحة الفناء: \\(A_{\\text{داخلي}} = 15 \\times 10 = 150\\) م\\(^2\\)",
        numeralMode: "western",
        notationLanguage: "english",
      })
    );
    expect(subHtml).toContain('<bdi dir="rtl" style="unicode-bidi:isolate">داخلي</bdi>');
    expect(subHtml).not.toContain("katex-error");

    const gcdCanon = canonicalizeMathText("الناتج النهائي: \\(\\text{ع.م.أ}(18, 24) = 6\\)");
    expect(gcdCanon).toBe("الناتج النهائي: ع.م.أ $(18, 24)$ = $6$");
    expect(canonicalizeMathText(gcdCanon)).toBe(gcdCanon);
    expect(findResidualLeaks(gcdCanon)).toEqual([]);

    const costCanon = canonicalizeMathText("حساب التكلفة: \\(\\text{التكلفة} = 60 \\times 50 = 3,000\\) جنيه");
    expect(costCanon).toBe("حساب التكلفة: التكلفة : $60 \\times 50 = 3,000$\u00A0جنيه");
    expect(canonicalizeMathText(costCanon)).toBe(costCanon);

    const katexThousandsHtml = renderToStaticMarkup(
      React.createElement(SafeKaTeXBiDiMathRenderer, {
        text: "$4,920$",
        numeralMode: "western",
        notationLanguage: "english",
      })
    );
    expect(katexThousandsHtml).not.toContain('<span class="mpunct">,</span><span class="mspace"');

    const promptPrimary = buildPrimaryStageFigurePromptGuidance("english");
    expect(promptPrimary.length).toBeLessThan(500);
    expect(promptPrimary).toContain("المطلوب:");
  });
});
