import { describe, it, expect } from "vitest";
import { parseNotebookLMWorksheetResponse } from "./notebooklm-worksheet-parser";

describe("notebooklm-worksheet-parser", () => {
  it("parses worksheet core, worked examples, and practice drills seamlessly", () => {
    const rawResponse = `
=== [WORKSHEET_CORE] ===
اسم_الدرس: تشابه المضلعات
الفكرة_العامة: التشابه هو تكبير أو تصغير للأشكال مع الحفاظ على نفس النسب والزوايا، وهو أساس الهندسة المعمارية ورسم الخرائط!
القوانين_الذكية:
- القانون: معامل التشابه | المقولة_اللفظية: نسبة طول أي ضلع في المضلع الأول إلى نظيره في الثاني | الصيغة_الرياضية: [$k = \\frac{s_1}{s_2}$] | سر_الحل: إذا كان $k > 1$ تكبير، وإذا كان $k < 1$ تصغير
- القانون: النسبة بين المحيطين | المقولة_اللفظية: النسبة بين محيطي مضلعين متشابهين تساوي معامل التشابه | الصيغة_الرياضية: [$\\frac{P_1}{P_2} = k$] | سر_الحل: انتبه النسبة بين المساحتين تكون $k^2$ وليست $k$

=== [CONCEPT_EXAMPLE: 1] | عنوان_الفكرة: إيجاد معامل التشابه ===
المثال: مضلعان متشابهان أطوال أضلاعهما المتناظرة $6\\text{ سم}$ و $9\\text{ سم}$، أوجد معامل التشابه.
الرسم: 
الحل_السريع: معامل التشابه $k = \\frac{6}{9} = \\frac{2}{3}$ وهو تصغير.

=== [QUESTION: 1] | النوع: MCQ | الدرجة: 2 ===
النص: مضلعان متشابهان النسبة بين محيطيهما $3 : 4$، فإن النسبة بين طولي ضلعين متناظرين تساوي:
البدائل: (أ) $3 : 4$ | (ب) $9 : 16$ | (جـ) $4 : 3$ | (د) $1 : 2$
الإجابة_الصحيحة: (أ)
البرهان_والخطوات: النسبة بين المحيطين تساوي النسبة بين الضلعين مباشرة وتساوي $3 : 4$

=== [QUESTION: 2] | النوع: ESSAY | الدرجة: 3 ===
النص: مضلعان متشابهان أطوال أضلاع الأول $3, 4, 5\\text{ سم}$، ومحيط الثاني $24\\text{ سم}$. أوجد أطوال أضلاع المضلع الثاني.
الإجابة_الصحيحة: أطوال الأضلاع هي $6, 8, 10\\text{ سم}$
البرهان_والخطوات: محيط الأول = $3 + 4 + 5 = 12\\text{ سم}$ | معامل التشابه = $24 / 12 = 2$ | أطوال الثاني = $3\\times 2 = 6$ ، $4\\times 2 = 8$ ، $5\\times 2 = 10\\text{ سم}$
    `;

    const items = parseNotebookLMWorksheetResponse({
      rawText: rawResponse,
      branchId: "plane_geometry",
      branchNameAr: "الهندسة المستوية",
      lessonTitleArabic: "تشابه المضلعات",
      includeAnswerLines: true,
    });

    expect(items.length).toBe(3); // 1 concept example + 2 practice questions

    // First item carries the capsule
    const first = items[0];
    expect(first.ideaBannerTitleAr).toContain("تشابه المضلعات");
    expect(first.conceptExplanationAr).toContain("التشابه هو تكبير أو تصغير");
    expect(first.framedRuleAr).toContain("معامل التشابه");
    expect(first.framedRuleAr).toContain("k = \\frac{s_1}{s_2}");
    expect(first.isWorkedExample).toBe(true);

    // MCQ question
    const mcq = items[1];
    expect(mcq.kind).toBe("mcq");
    expect(mcq.mcqChoicesAr?.length).toBe(4);
    expect(mcq.correctMcqIndex).toBe(0);

    // Essay question
    const essay = items[2];
    expect(essay.kind).toBe("essay_algebra");
    expect(essay.studentDrillPromptAr).toBe("مساحة إجابة الطالب:");
  });

  it("detects and renders area model SVGs on arithmetic multiplication and division without falling back to geometry", () => {
    const rawResponse = `
=== [WORKSHEET_CORE] ===
اسم_الدرس: ضرب وقسمة الأعداد
الفكرة_العامة: تمكين الطالب من مهارات الضرب والقسمة باستخدام نموذج مساحة المستطيل.
القوانين_الذكية:
- القانون: مساحة المستطيل | المقولة_اللفظية: فكك الأعداد واجمع المساحات | الصيغة_الرياضية: [$A = l \\times w$] | سر_الحل: حفظ الخانات بالأصفار

=== [CONCEPT_EXAMPLE: 1] | عنوان_الفكرة: ضرب الأعداد بنموذج مساحة المستطيل ===
المثال: أوجد حاصل ضرب $24 \\times 15$ باستخدام نموذج مساحة المستطيل. | الرسم: [رسم هندسي: نموذج مساحة المستطيل مقسم إلى صفين للعدد $15$ ($10$ و $5$) وعمودين للعدد $24$ ($20$ و $4$)] | الحل_السريع: تحليل العوامل: $24 = 20 + 4$ و $15 = 10 + 5$ | المساحات الجزئية: $200 + 40 + 100 + 20 = 360$

=== [QUESTION: 1] | النوع: MCQ | الدرجة: 1 ===
النص: في نموذج مساحة المستطيل المقابل لإيجاد حاصل ضرب $38 \\times 17$، ما قيمة المجهول $س$؟
الرسم: [رسم هندسي: نموذج مساحة المستطيل مكون من صفين ($10$، $7$) وعمودين ($30$، $8$)، الخانة الأولى أعلى اليمين تحتوي على المتغير $س$، والخلايا الأخرى تحتوي الأعداد $80$، $210$، $56$]
البدائل: (أ) $30$ | (ب) $300$ | (جـ) $3,000$ | (د) $30,000$
الإجابة_الصحيحة: (ب) $300$
البرهان_والخطوات: $س = 30 \\times 10 = 300$
    `;

    const items = parseNotebookLMWorksheetResponse({
      rawText: rawResponse,
      branchId: "numbers",
      branchNameAr: "الأعداد والعمليات",
      lessonTitleArabic: "ضرب وقسمة الأعداد",
    });

    expect(items.length).toBe(2);

    // Concept example has area model SVG
    const ex1 = items[0];
    expect(ex1.rawSvgMarkup).toBeDefined();
    expect(ex1.rawSvgMarkup).toContain("<svg");
    expect(ex1.rawSvgMarkup).toContain("20");
    expect(ex1.rawSvgMarkup).toContain("10");
    expect(ex1.geometryFigure).toBeUndefined(); // MUST NOT BE EUCLIDEAN GEOMETRY!

    // Question 1 has area model SVG with unknown س
    const q1 = items[1];
    expect(q1.rawSvgMarkup).toBeDefined();
    expect(q1.rawSvgMarkup).toContain("<svg");
    expect(q1.rawSvgMarkup).toContain("س");
    expect(q1.geometryFigure).toBeUndefined();
  });

  it("handles decimal area models, division, and 3-column multi-digit multiplication without failing", () => {
    const raw = `
=== [WORKSHEET_CORE] ===
اسم_الدرس: الوحدات (3، 4، 5)
الفكرة_العامة: تمكين الطالب من مهارات الضرب والقسمة للأعداد والكسور العشرية.
القوانين_الذكية:
- القانون: مساحة المستطيل | المقولة_اللفظية: فكك واجمع | الصيغة_الرياضية: [A = l \\times w] | سر_الحل: حفظ الخانات
- القانون: التحقق من القسمة | المقولة_اللفظية: المقسوم يساوي خارج القسمة في المقسوم عليه | الصيغة_الرياضية: [d = q \\times v] | سر_الحل: جمع الباقي

=== [CONCEPT_EXAMPLE: 1] | عنوان_الفكرة: قسمة عددين ===
المثال: أوجد خارج قسمة $1,620 \\div 36$ بنموذج مساحة المستطيل. | الرسم: [رسم هندسي: مستطيل داخل خانته الأولى المقسوم 1,620 وعلى يساره المقسوم عليه 36، وأعلاه الأعداد الجزئية 40 و 5] | الحل_السريع: خارج القسمة 45

=== [CONCEPT_EXAMPLE: 2] | عنوان_الفكرة: ضرب الكسور العشرية ===
المثال: أوجد حاصل ضرب $1.6 \\times 3.8$ بنموذج مساحة المستطيل. | الرسم: [رسم هندسي: مستطيل أبعاده الرأسية $1$ و $0.6$ والأفقية $3$ و $0.8$] | الحل_السريع: الناتج = 6.08

=== [QUESTION: 1] | النوع: MCQ | الدرجة: 1 ===
النص: في مسألة القسمة $8,757 \\div 63$ باستخدام نموذج مساحة المستطيل، إذا كانت الأعداد المكتوبة أعلى المستطيل هي $100$ و $30$ و $9$، فإن خارج القسمة الفعلي يساوي:
البدائل: (أ) 139 | (ب) 129 | (جـ) 149 | (د) 119
الإجابة_الصحيحة: (أ) 139
البرهان_والخطوات: 100 + 30 + 9 = 139

=== [QUESTION: 2] | النوع: ESSAY | الدرجة: 2 ===
النص: أكمل نموذج مساحة المستطيل لإيجاد حاصل ضرب $246 \\times 35$ المقابل.
الرسم: [رسم هندسي: نموذج مساحة المستطيل مقسم إلى صفين للعدد $35$ ($30$ و $5$) وثلاثة أعمدة للعدد $246$ ($200$ و $40$ و $6$)]
الإجابة_الصحيحة: 8,610
البرهان_والخطوات: حاصل الضرب الكلي = 8,610
    `;

    const items = parseNotebookLMWorksheetResponse({
      rawText: raw,
      branchId: "numbers",
      branchNameAr: "الأعداد والعمليات",
      lessonTitleArabic: "الوحدات (3، 4، 5)",
    });

    expect(items.length).toBe(4);

    // Division example
    expect(items[0].rawSvgMarkup).toBeDefined();
    expect(items[0].rawSvgMarkup).toContain("36");
    expect(items[0].rawSvgMarkup).toContain("40");

    // Decimal multiplication example
    expect(items[1].rawSvgMarkup).toBeDefined();
    expect(items[1].rawSvgMarkup).toContain("1.8");
    expect(items[1].rawSvgMarkup).toContain("0.48");

    // Question 1 division
    expect(items[2].rawSvgMarkup).toBeDefined();
    expect(items[2].rawSvgMarkup).toContain("63");
    expect(items[2].rawSvgMarkup).toContain("100");

    // Question 2 3-column multiplication
    expect(items[3].rawSvgMarkup).toBeDefined();
    expect(items[3].rawSvgMarkup).toContain("200");
    expect(items[3].rawSvgMarkup).toContain("6000");
  });
});
