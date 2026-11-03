import { describe, expect, it } from "vitest";
import { parseNotebookLMExamQuestionsToIR } from "./notebooklm-exam-questions-parser";
import { splitExamIntoPublicAndKey } from "../exam-grading/online-exam-public-key-splitter";
import { localizeCanonicalLatex } from "../math-text/math-latex-notation-and-numeral-localizer";
import { canonicalizeMathText } from "../math-text/math-text-canonicalizer";
import { splitTextIntoProseAndTableSegments } from "../../components/global-ui/math-markdown-table-block-renderer";

const USER_ACTUAL_25_QUESTIONS_REPLY = `### [Q: 1]
[TYPE]: multiple_choice
[MARKS]: 1
[TEXT]: المعامل في المقدار الجبري \\(6x + 7\\) هو: { محافظة القاهرة }
[OPTIONS]: (أ) \\(7\\) | (ب) \\(6\\) | (جـ) \\(x\\) | (د) \\(13\\)
[ANSWER]: (ب) \\(6\\)
[SOLUTION]: المعامل هو العدد المضروب في المتغير \\(x\\)، وهو العدد \\(6\\).
---
### [Q: 2]
[TYPE]: multiple_choice
[MARKS]: 1
[TEXT]: قيمة التعبير العددي \\(5^2 - 10 \\div 2\\) تساوي: { محافظة الجيزة }
[OPTIONS]: (أ) \\(20\\) | (ب) \\(15\\) | (جـ) \\(10\\) | (د) \\(25\\)
[ANSWER]: (أ) \\(20\\)
[SOLUTION]: نتبع ترتيب العمليات: أولاً فك الأس \\(5^2 = 25\\)، ثم القسمة \\(10 \\div 2 = 5\\)، ثم الطرح \\(25 - 5 = 20\\).
---
### [Q: 3]
[TYPE]: multiple_choice
[MARKS]: 1
[TEXT]: قيمة المقدار الجبري \\(2x + 5\\) عندما \\(x = 3\\) هي: { محافظة الشرقية }
[OPTIONS]: (أ) \\(8\\) | (ب) \\(10\\) | (جـ) \\(12\\) | (د) \\(11\\)
[ANSWER]: (د) \\(11\\)
[SOLUTION]: بالتعويض عن \\(x = 3\\) في المقدار الجبري: \\(2(3) + 5 = 6 + 5 = 11\\).
---
### [Q: 25]
[TYPE]: multiple_choice
[MARKS]: 1
[TEXT]: إذا كان أقصى ارتفاع مسموح به لمرور الشاحنات أسفل كوبري هو \\(4.5\\) أمتار، فإن المتباينة التي تعبر عن الارتفاع \\(h\\) للمرور الآمن هي: { محافظة البحر الأحمر }
[OPTIONS]: (أ) \\(h > 4.5\\) | (ب) \\(h \\ge 4.5\\) | (جـ) \\(h < 4.5\\) | (د) \\(h \\le 4.5\\)
[ANSWER]: (د) \\(h \\le 4.5\\)
[SOLUTION]: أقصى ارتفاع تعني أن الارتفاع المسموح به يجب ألا يتجاوز \\(4.5\\) أمتار، أي يكون أقل من أو يساوي \\(4.5\\) (\\(h \\le 4.5\\)).
---

[نموذج الإجابة الرسمي وسلّم الدرجات]
- أسئلة اختر من متعدد (25 سؤالاً): درجة واحدة لكل المفردات [25 درجة] (بواقع 1 درجة لكل سؤال).`;

describe("parseNotebookLMExamQuestionsToIR — English bracketed tags & governorate citations", () => {
  it("parses all questions cleanly without tag leaks or pipe characters in choices", () => {
    const parsed = parseNotebookLMExamQuestionsToIR({
      rawText: USER_ACTUAL_25_QUESTIONS_REPLY,
      branchId: "algebra",
      unitId: "exam-unit",
      lessonId: "exam-lesson",
      lessonTitleArabic: "المقادير الجبرية",
    });

    expect(parsed.length).toBe(4);

    for (const q of parsed) {
      expect(q.patternKind).toBe("mcq");
      expect(q.allocatedMarks).toBe(1);
      expect(q.promptArabic).not.toMatch(/TYPE|MARKS|OPTIONS|\[Q/i);
      expect(q.promptArabic).not.toMatch(/\{\s*محافظة/);
      expect(q.mcqChoicesArabic).toBeDefined();
      expect(q.mcqChoicesArabic?.length).toBe(4);
      for (const ch of q.mcqChoicesArabic ?? []) {
        expect(ch).not.toContain("|");
        expect(ch.length).toBeGreaterThan(0);
      }
      expect(q.authenticCitation?.governorateNameArabic).toMatch(/^محافظة\s+/);
      expect(q.modelSolutionStepsArabic.join(" ")).not.toContain("نموذج الإجابة الرسمي");
    }

    expect(parsed[0].correctMcqChoiceIndex).toBe(1); // (ب)
    expect(parsed[1].correctMcqChoiceIndex).toBe(0); // (أ)
    expect(parsed[2].correctMcqChoiceIndex).toBe(3); // (د)
    expect(parsed[3].correctMcqChoiceIndex).toBe(3); // (د)

    const split = splitExamIntoPublicAndKey(parsed);
    expect(split.publicQuestions.length).toBe(4);
    expect(split.excludedQuestionNumbers.length).toBe(0);
  });

  it("reverses non-commutative arithmetic expressions for RTL reading when Eastern numerals (٠-٩) are selected", () => {
    // في وضع الأرقام المشرقية: 738 - 218 = \dots يجب أن تُعكس داخل KaTeX إلى \dots = ٢١٨ - ٧٣٨ لتظهر من اليمين لليسار: ٧٣٨ - ٢١٨ = ...
    expect(localizeCanonicalLatex("738 - 218 = \\dots", "eastern", "english")).toBe("\\dots = ٢١٨ - ٧٣٨");
    expect(localizeCanonicalLatex("1000 - 347 = \\dots", "eastern", "english")).toBe("\\dots = ٣٤٧ - ١٠٠٠");
    expect(localizeCanonicalLatex("24 \\div 6 = 4", "eastern", "english")).toBe("٤ = ٦ \\div ٢٤");
    expect(localizeCanonicalLatex("5^2 - 10 \\div 2", "eastern", "english")).toBe("٢ \\div ١٠ - ٥^٢");
    expect(localizeCanonicalLatex("7 > 5", "eastern", "english")).toBe("٥ < ٧");

    // بينما في وضع الأرقام الغربية تظل كما هي من اليسار لليمين
    expect(localizeCanonicalLatex("738 - 218 = \\dots", "western", "english")).toBe("738 - 218 = \\dots");
    // والمعادلات ذات المتغيرات اللاتينية لا تُعكس
    expect(localizeCanonicalLatex("2x + 5 = 11", "eastern", "english")).toBe("٢x + ٥ = ١١");
  });

  it("preserves Arabic meter unit (م) and converts English m unit without turning it into Latin vertex M", () => {
    const q2 = canonicalizeMathText("\\(4\\text{ كم و }600\\text{ م} = \\dots\\text{ م}\\)");
    expect(q2).toContain("كم");
    expect(q2).toContain("م");
    expect(q2).not.toContain("M");

    // حتى لو بقيت داخل \text{ م} في تعبير كسري، لا تتحول إلى M عند التوطين
    expect(localizeCanonicalLatex("600\\text{ م} = \\dots\\text{ م}", "eastern", "english")).not.toContain("M");

    const englishMeter = canonicalizeMathText("4 كم و 600 m = ... m");
    expect(englishMeter).toContain("600\u00A0م");
    expect(englishMeter).not.toMatch(/\bm\b/i);
  });

  it("preserves Markdown tables in questions without mangling --- separators or swallowing rows into MCQ options", () => {
    const grade3TableReply = `### [Q: 13]
[TYPE]: essay
[MARKS]: 2
[TEXT]: يوضح الجدول التالي عدد الكتب التي قرأها تلاميذ الصف الثالث الابتدائي في ثلاثة فصول مختلفة:
| الكتب المقروءة | الفصل (1) | الفصل (2) | الفصل (3) | المجموع |
|---|---|---|---|---|
| القصص | 12 | 7 | 5 | (أ) |
| العلوم | 5 | 10 | 6 | 21 |
| المعلومات العامة | 4 | 3 | 8 | 15 |
| المجموع | 21 | 20 | (ب) | (جـ) |
[SOLUTION]: (أ) مجموع القصص = 24 | (ب) مجموع الفصل الثالث = 19 | (جـ) المجموع الكلي = 60`;

    const parsed = parseNotebookLMExamQuestionsToIR({
      rawText: grade3TableReply,
      branchId: "statistics_probability",
      unitId: "u1",
      lessonId: "l1",
      lessonTitleArabic: "تمثيل البيانات",
    });

    expect(parsed.length).toBe(1);
    const q13 = parsed[0];
    expect(q13.patternKind).toBe("proof_reasoning");
    expect(q13.mcqChoicesArabic).toBeUndefined();

    const segments = splitTextIntoProseAndTableSegments(q13.promptArabic);
    const tableSeg = segments.find((s) => s.kind === "table");
    expect(tableSeg).toBeDefined();
    if (tableSeg?.kind === "table") {
      expect(tableSeg.rows.length).toBe(5);
      expect(tableSeg.rows[0][0]).toContain("الكتب المقروءة");
      expect(tableSeg.rows[1][0]).toContain("القصص");
      expect(tableSeg.rows[2][0]).toContain("العلوم");
      expect(tableSeg.rows[3][0]).toContain("المعلومات العامة");
      expect(tableSeg.rows[4][0]).toContain("المجموع");
    }
  });
});
