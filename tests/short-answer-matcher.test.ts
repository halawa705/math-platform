import { describe, it, expect } from "vitest";
import { isStudentShortAnswerCorrect as ok } from "@/core/exam-grading/short-answer-matcher";
import { evaluateSimpleMathExpression as ev } from "@/core/exam-grading/math-simple-expression-evaluator";

describe("short-answer-matcher", () => {
  const cases: Array<[string, string[], boolean]> = [
    ["٥", ["5"], true], ["15", ["5"], false], ["x = 5", ["5"], true], ["س=٥ سم", ["5"], true],
    ["0.5", ["\\frac{1}{2}"], true], ["١/٢", ["0.5"], true], ["1/2", ["$\\frac{1}{2}$"], true],
    ["2√3", ["sqrt(12)"], true], ["√12", ["2\\sqrt{3}"], true], ["3.14", ["3.15"], false],
    ["{2,3}", ["{3, 2}"], true], ["2 و 3", ["{2,3}"], true], ["2", ["{2,3}"], false],
    ["", ["5"], false], ["المثلثان متشابهان", ["المثلثان متشابهان"], true], ["أي كلام", ["المثلثان متشابهان"], false],
    ["-3", ["−3"], true], ["24 سم²", ["24"], true], ["60°", ["60"], true], ["]2,5[", ["]2,5["], true],
    ["4ط", ["4\\pi"], true], ["2π", ["2ط"], true],
  ];
  it.each(cases)("%s vs %j => %s", (s, acc, exp) => expect(ok(s, acc)).toBe(exp));
  it("evaluator", () => {
    expect(ev("2*(3+4)^2")).toBe(98); expect(ev("-3+5")).toBe(2); expect(ev("1/0")).toBeNull(); expect(ev("(1")).toBeNull();
  });
});
