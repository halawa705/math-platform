/**
 * @file notebooklm-unnumbered-questions-splitter.ts
 * @description مقسم ذكي للأسئلة غير المرقمة أو المرقمة جزئياً في ردود NotebookLM:
 * يميّز بين الترقيم التسلسلي للأسئلة وبين الفروع الداخلية `(1)` و`(2)` داخل سؤال واحد،
 * ويلحم الفقرات التابعة (أولاً/ثانياً، المعادلات المستقلة، جداول Markdown، و`مع بيان/ثم تحقق`) بسؤالها الأب.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 150 سطراً).
 */

import { isNonQuestionMetaBlock } from "./notebooklm-stage-envelope-cleaner";

export const MODULE_ID_NOTEBOOKLM_UNNUMBERED_QUESTIONS_SPLITTER =
  "notebooklm_unnumbered_questions_splitter" as const;

const CONTINUATION_CLAUSE_RE =
  /^(?:[-•*]\s*)?(?:أولاً|ثانياً|ثالثاً|رابعاً|خامساً|\(\d+\)|[1-4]\)|\(\s*(?:أ|ب|جـ?|د)\s*\))\s*[:.-]?/i;

const DEPENDENT_TAIL_RE =
  /^(?:واكتب\s+|ثم\s+(?:احسب|أوجد|تحقق|اكتب|حدد|مث[ّل]|مثل)|مع\s+(?:بيان|ذكر|كتابة|اعتبار|التحقق)|أثبت\s+صحة\s+إجابتك|كوّ?ن\s+المعادلة|بفرض\s+أن\b|حيث\b)/i;

/** يحدد هل ترقيم `(1)` `(2)` `(3)` في النص يمثل أسئلة رئيسية متسلسلة فعلاً أم فروعاً داخلية مكررة داخل الأسئلة. */
export function hasTrueSequentialParenthesesNumbering(text: string): boolean {
  const nums: number[] = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*\((\d+)\)\s+/);
    if (m?.[1]) nums.push(Number(m[1]));
  }
  if (nums.length < 3 || nums[0] !== 1 || !nums.includes(3)) return false;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] <= nums[i - 1]) return false;
  }
  return true;
}

/** يحدد هل الترقيم الرقمي `1.` / `1)` يمثل أسئلة مستقلة أم خطوات حساب داخل حل سؤال واحد. */
export function hasTrueSequentialDotNumbering(text: string): boolean {
  if (/(?:^|\n)\s*(?:السؤال|سؤال)\s+(?:\[\d+\]|\(\d+\)|\d+|الأول|الثاني|الثالث)/i.test(text)) {
    return true;
  }
  const nums: number[] = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*(\d+)[.)-]\s+/);
    if (m?.[1]) nums.push(Number(m[1]));
  }
  if (nums.length < 2 || nums[0] !== 1) return false;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] <= nums[i - 1]) return false;
  }
  return true;
}

function isStandaloneMathOrTableParagraph(para: string): boolean {
  const t = para.trim();
  if (!t) return false;
  const nonEmptyLines = t
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (nonEmptyLines.length > 0 && nonEmptyLines.every((l) => l.startsWith("|"))) {
    return true;
  }
  if (/^(?:\$[^$\n]+\$|\\\[[\s\S]+?\\\])[.,،؛؟?!]?$/.test(t)) return true;
  return false;
}

/** يقسم الرد غير المرقم إلى أسئلة مستقلة مع حماية الفروع والجداول والمعادلات التابعة. */
export function splitUnnumberedQuestionParagraphs(cleanedText: string): string[] {
  if (!cleanedText || !cleanedText.trim()) return [];

  const mcqAnswerMatches = cleanedText.match(
    /(?:^|\n)\s*(?:الإجابة[_\s]*الصحيحة|إجابة[_\s]*الصحيحة|الإجابة[_\s]*النهائية)\s*:/gi
  );
  if (mcqAnswerMatches && mcqAnswerMatches.length > 1) {
    const mcqSplits = cleanedText
      .split(
        /(?<=(?:^|\n)\s*(?:الإجابة[_\s]*الصحيحة|إجابة[_\s]*الصحيحة|الإجابة[_\s]*النهائية)\s*:[^\n]*)(?:\r?\n)+/i
      )
      .map((b) => b.trim())
      .filter((b) => b.length > 8 && !isNonQuestionMetaBlock(b));
    if (mcqSplits.length > 1) return mcqSplits;
  }

  const rawParagraphs = cleanedText
    .split(/(?:\r?\n)[ \t]*(?:\r?\n)+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 3 && !isNonQuestionMetaBlock(p));

  const stitched: string[] = [];
  for (const para of rawParagraphs) {
    if (stitched.length === 0) {
      stitched.push(para);
      continue;
    }

    const prev = stitched[stitched.length - 1];
    const prevEndsColon = /[:：]\s*$/.test(prev);
    const shouldMergeIntoPrev =
      isStandaloneMathOrTableParagraph(para) ||
      CONTINUATION_CLAUSE_RE.test(para) ||
      DEPENDENT_TAIL_RE.test(para) ||
      (prevEndsColon && para.length < 180 && !/(?:^|\s)\[(?:رسم|سؤال)/i.test(para));

    if (shouldMergeIntoPrev) {
      stitched[stitched.length - 1] = `${prev}\n${para}`;
    } else {
      stitched.push(para);
    }
  }

  return stitched.filter((b) => !isNonQuestionMetaBlock(b));
}
