/**
 * @file short-answer-matcher.ts
 * @description يطبّع إجابة الطالب النصية الرياضية ويقارنها بقائمة الإجابات المقبولة (عددياً أولاً ثم نصياً).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */
import { evaluateSimpleMathExpression } from "./math-simple-expression-evaluator";

export const MODULE_ID_SHORT_ANSWER_MATCHER = "short_answer_matcher" as const;

const EASTERN = "٠١٢٣٤٥٦٧٨٩";
const UNIT_WORDS = ["سنتيمتر", "سم²", "سم³", "سم2", "سم3", "سم", "متر", "م²", "م³", "م/ث²", "م/ث", "كجم", "جم", "نيوتن", "درجة", "درجات", "وحدة مربعة", "وحدة", "ثانية", "°"];

function digitsToWestern(s: string): string {
  return s.replace(/[٠-٩]/g, (d) => String(EASTERN.indexOf(d))).replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

function replaceLatexFractionsAndRoots(src: string): string {
  let s = src;
  for (let i = 0; i < 6; i++) {
    s = s.replace(/\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "(($1)/($2))");
    s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, "sqrt($1)");
  }
  return s;
}

function normalizeMathAnswerText(raw: string): string {
  let s = digitsToWestern(String(raw ?? ""));
  s = s.replace(/\\text\s*\{([^{}]*)\}/g, "$1").replace(/\\left|\\right|\\,|\\;|\\!/g, "");
  s = replaceLatexFractionsAndRoots(s);
  s = s.replace(/\$/g, "").replace(/\\cdot|\\times|×|·/g, "*").replace(/÷/g, "/").replace(/[−–—]/g, "-");
  s = s.replace(/√\s*\(([^()]*)\)/g, "sqrt($1)").replace(/√\s*(\d+(?:\.\d+)?)/g, "sqrt($1)");
  s = s.replace(/٫/g, ".").replace(/،/g, ",").replace(/\\pi|π|ط(?![ء-ي])/g, "pi");
  for (const u of UNIT_WORDS) s = s.split(u).join("");
  s = s.replace(/\\{/g, "{").replace(/\\}/g, "}").replace(/\s+/g, "");
  s = s.replace(/^[a-zA-Zسصع]=/, ""); // حذف "س=" من البداية
  s = s.replace(/[.،,]+$/, "");
  return s.toLowerCase();
}

function splitList(s: string): string[] {
  const inner = s.replace(/^[{[(\]]|[}\])[]$/g, "");
  return inner.split(/,|;|و(?=[\d-])|أو|or/).filter(Boolean);
}

function numericEqual(a: string, b: string): boolean {
  const x = evaluateSimpleMathExpression(a);
  const y = evaluateSimpleMathExpression(b);
  if (x === null || y === null) return false;
  return Math.abs(x - y) <= 1e-6 * Math.max(1, Math.abs(y));
}

function sameOne(student: string, accepted: string): boolean {
  if (student === accepted) return true;
  return numericEqual(student, accepted);
}

export function isStudentShortAnswerCorrect(studentRaw: string, acceptedRaw: readonly string[]): boolean {
  const student = normalizeMathAnswerText(studentRaw);
  if (!student) return false;
  for (const acc of acceptedRaw) {
    const a = normalizeMathAnswerText(acc);
    if (!a) continue;
    if (sameOne(student, a)) return true;
    const isSet = (x: string) => /^\{.*\}$/.test(x);
    if (isSet(a) || isSet(student) || /[,;]/.test(a)) {
      const la = splitList(a).map((p) => p.trim());
      const ls = splitList(student).map((p) => p.trim());
      if (la.length === ls.length && la.length > 1 && la.every((p) => ls.some((q) => sameOne(q, p))) && ls.every((q) => la.some((p) => sameOne(q, p)))) return true;
    }
  }
  return false;
}
