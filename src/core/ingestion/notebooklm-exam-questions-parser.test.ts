import { describe, expect, it } from "vitest";
import { parseNotebookLMExamQuestionsToIR } from "./notebooklm-exam-questions-parser";
import { splitExamIntoPublicAndKey } from "../exam-grading/online-exam-public-key-splitter";

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
});
