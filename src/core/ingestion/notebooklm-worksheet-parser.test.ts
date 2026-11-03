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
    expect(first.conceptExplanationAr).toContain("💡 الفكرة العامة");
    expect(first.conceptExplanationAr).toContain("معامل التشابه");
    expect(first.framedRuleAr).toContain("k = \\frac{s_1}{s_2}");
    expect(first.promptAr).toContain("مثال توضيحي");

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
});
