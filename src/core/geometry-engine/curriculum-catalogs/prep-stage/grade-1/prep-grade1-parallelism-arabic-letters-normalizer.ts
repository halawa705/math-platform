/**
 * @file prep-grade1-parallelism-arabic-letters-normalizer.ts
 * @description يحوّل أسماء النقاط العربية (أ ب جـ د هـ و ز ح) والمجهول (س ص) في وصف مسألة التوازي إلى الحروف
 * اللاتينية المقابلة قبل مطابقة كتالوج التوازي، لأن قواعد الكتالوج مكتوبة بالحروف اللاتينية بينما المذكرة العربية تستخدم الحروف العربية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { ARABIC_TO_LATIN_VERTEX } from "../../../../math-text/math-geometric-entity-localizer";

const LETTER = "[أإابجدهوزحخيكلمنفقرشطتثغسصع]";
const TOKEN = `${LETTER}\\u0640?`;
const SEQUENCE_REGEX = new RegExp(`(?<![\\u0621-\\u064A])(${TOKEN}(?:\\s+${TOKEN})+)(?![\\u0621-\\u064A\\u0640])`, "g");
const SINGLE_AFTER_ANGLE_REGEX = new RegExp(`(∠\\s*)(${TOKEN})(?![\\u0621-\\u064A\\u0640])`, "g");

function toLatin(token: string): string {
  const bare = token.replace(/\u0640/g, "");
  return ARABIC_TO_LATIN_VERTEX[bare] ?? bare;
}

function convertSequence(seq: string): string {
  const tokens = seq.trim().split(/\s+/);
  // «ز و ح» = نقطتان بينهما حرف العطف «و» وليس ثلاث نقاط
  if (tokens.length === 3 && tokens[1] === "و") return `${toLatin(tokens[0])} و ${toLatin(tokens[2])}`;
  return tokens.map(toLatin).join("");
}

/** يحوّل الوصف العربي إلى صيغة لاتينية للمطابقة فقط (لا يُعرض للمستخدم). */
export function normalizeParallelismArabicLettersToLatin(description: string): string {
  let out = description;
  out = out.replace(SEQUENCE_REGEX, (m) => convertSequence(m));
  out = out.replace(SINGLE_AFTER_ANGLE_REGEX, (_m, pre: string, tk: string) => `${pre}${toLatin(tk)}`);
  out = out.replace(/(\d)\s*س(?![\u0621-\u064A])/g, "$1X").replace(/(\d)\s*ص(?![\u0621-\u064A])/g, "$1y");
  out = out.replace(/(?<![\u0621-\u064A])س(?![\u0621-\u064A])/g, "X");
  return out;
}
