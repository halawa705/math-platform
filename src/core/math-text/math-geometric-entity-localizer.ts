/**
 * @file math-geometric-entity-localizer.ts
 * @description محول الكيانات الهندسية (المضلعات، الزوايا، والقطع المستقيمة) بين العربية والإنجليزية.
 * يضمن تحويل كافة الحروف في المسائل والشرح والقوانين والأشكال عند اختيار الترميز الإنجليزي أو العربي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_MATH_GEOMETRIC_ENTITY_LOCALIZER =
  "math_geometric_entity_localizer" as const;

export const ARABIC_TO_LATIN_VERTEX: Readonly<Record<string, string>> = {
  "أ": "A", "ا": "A", "إ": "A", "ب": "B", "ج": "C", "جـ": "C",
  "د": "D", "ه": "E", "هـ": "E", "و": "F", "ز": "Z", "ح": "H",
  "ط": "T", "ك": "K", "ل": "L", "م": "M", "ن": "N", "س": "X",
  "ص": "Y", "ع": "Z",
};

export const LATIN_TO_ARABIC_VERTEX: Readonly<Record<string, string>> = {
  A: "أ", B: "ب", C: "جـ", D: "د", E: "هـ", F: "و", Z: "ع",
  H: "ح", T: "ط", K: "ك", L: "ل", M: "م", N: "ن", X: "س", Y: "ص",
};

const GEOMETRIC_VERTEX_CHAR_REGEX = "[أإابجدهوزحطكلمنسصع](?:ـ)?";
const ARABIC_WORD_END_LOOKAHEAD = "(?=[\\s،,.;:!?()\\[\\]{}]|$)";

/** يحول تسلسلاً من الحروف الهندسية (مثل "أ ب جـ" أو "أب") إلى نظيرتها اللاتينية (مثل "ABC" أو "AB") */
export function convertArabicVerticesToLatin(raw: string): string {
  const cleaned = raw.replace(/\u0640/g, "").trim();
  const chars = cleaned.match(/[أإابجدهوزحطكلمنسصع]/g);
  if (!chars || chars.length === 0) return raw.trim();
  return chars.map((ch) => ARABIC_TO_LATIN_VERTEX[ch] || ch).join("");
}

/** يحول تسلسلاً لاتينياً (مثل "ABC") إلى تسلسل عربي قياسي (مثل "أ ب جـ") */
export function convertLatinVerticesToArabic(raw: string): string {
  const chars = raw.toUpperCase().match(/[A-Z]/g);
  if (!chars || chars.length === 0) return raw;
  return chars.map((ch) => LATIN_TO_ARABIC_VERTEX[ch] || ch).join(" ");
}

/**
 * يوطن أسماء المضلعات والزوايا والأضلاع في النص العربي العادي (خارج كتل LaTeX).
 */
export function localizeGeometricEntitiesInPlainText(
  text: string,
  notation: MathNotationLanguage
): string {
  if (!text) return "";
  if (notation === "arabic") return text;

  let out = text;

  // 1. المضلعات والمثلثات والأشكال (مثل "المثلث أ ب جـ"، "المضلع أ ب جـ د")
  const polyRegex = new RegExp(
    `(المثلث|مثلث|المضلع|مضلع|متوازي الأضلاع|المستطيل|المربع|المعين|شبه المنحرف|الشكل الرباعي|الشكل)\\s+(${GEOMETRIC_VERTEX_CHAR_REGEX}(?:\\s+${GEOMETRIC_VERTEX_CHAR_REGEX}){1,4})${ARABIC_WORD_END_LOOKAHEAD}`,
    "g"
  );
  out = out.replace(polyRegex, (_m, prefix: string, verts: string) => `${prefix} ${convertArabicVerticesToLatin(verts)} `);

  // 2. الأضلاع والقطع المستقيمة والأوتار والأشعة (مثل "الضلع أ ب"، "الوتر أ ب")
  const segRegex = new RegExp(
    `(الضلع|ضلع|القطعة المستقيمة|القطعة|قطعة|الشعاع|شعاع|المستقيم|مستقيم|الوتر|وتر|القطر|قطر|نصف القطر|محور التماثل)\\s+(${GEOMETRIC_VERTEX_CHAR_REGEX}\\s+${GEOMETRIC_VERTEX_CHAR_REGEX})${ARABIC_WORD_END_LOOKAHEAD}`,
    "g"
  );
  out = out.replace(segRegex, (_m, prefix: string, verts: string) => `${prefix} ${convertArabicVerticesToLatin(verts)} `);

  // 3. قياس الزوايا مع ق(∠ أ) أو ق(∠ أ المنعكسة)
  const qAngleRegex = new RegExp(
    `ق\\s*\\(\\s*([∠\\u2220])\\s*(${GEOMETRIC_VERTEX_CHAR_REGEX}(?:\\s+${GEOMETRIC_VERTEX_CHAR_REGEX}){0,2})(?:\\s+(المنعكسة))?\\s*\\)`,
    "g"
  );
  out = out.replace(qAngleRegex, (_m, sym: string, verts: string, reflex: string | undefined) =>
    `m(${sym} ${convertArabicVerticesToLatin(verts)}${reflex ? " المنعكسة" : ""})`
  );

  // 4. ق(أ) أو ق(أ المنعكسة)
  const qBareRegex = new RegExp(
    `ق\\s*\\(\\s*(${GEOMETRIC_VERTEX_CHAR_REGEX}(?:\\s+${GEOMETRIC_VERTEX_CHAR_REGEX}){0,2})(?:\\s+(المنعكسة))?\\s*\\)`,
    "g"
  );
  out = out.replace(qBareRegex, (_m, verts: string, reflex: string | undefined) =>
    `m(∠ ${convertArabicVerticesToLatin(verts)}${reflex ? " المنعكسة" : ""})`
  );

  // 5. رمز الزاوية المنفرد أو الثلاثي: ∠ أ أو ∠ أ المنعكسة أو ∠ أ ب جـ
  const angleSymRegex = new RegExp(
    `([∠\\u2220])\\s*(${GEOMETRIC_VERTEX_CHAR_REGEX}(?:\\s+${GEOMETRIC_VERTEX_CHAR_REGEX}){0,2})(?:\\s+(المنعكسة))?${ARABIC_WORD_END_LOOKAHEAD}`,
    "g"
  );
  out = out.replace(angleSymRegex, (_m, sym: string, verts: string, reflex: string | undefined) =>
    `${sym} ${convertArabicVerticesToLatin(verts)}${reflex ? " المنعكسة" : ""}`
  );

  // 6. كلمة زاوية أو الزاوية بالاسم: زاوية أ أو زاوية أ ب جـ
  const wordAngleRegex = new RegExp(
    `(قياس\\s+)?(زاوية|الزاوية)\\s+(${GEOMETRIC_VERTEX_CHAR_REGEX}(?:\\s+${GEOMETRIC_VERTEX_CHAR_REGEX}){0,2})(?:\\s+(المنعكسة))?${ARABIC_WORD_END_LOOKAHEAD}`,
    "g"
  );
  out = out.replace(wordAngleRegex, (_m, q: string | undefined, w: string, verts: string, reflex: string | undefined) =>
    `${q || ""}${w} ${convertArabicVerticesToLatin(verts)}${reflex ? " المنعكسة" : ""}`
  );

  return out.replace(/[ \t]{2,}/g, " ");
}

/**
 * يوطن الكيانات الهندسية داخل كتل LaTeX (الزوايا، المثلثات، الخطوط فوق الأحرف).
 */
export function localizeGeometricEntitiesInLatex(
  latex: string,
  notation: MathNotationLanguage
): string {
  if (!latex) return "";
  if (notation === "arabic") {
    return latex
      .replace(/\\triangle\s*([A-Z]{3})/g, (_m, v: string) => `\\triangle \\text{${convertLatinVerticesToArabic(v)}}`)
      .replace(/\\angle\s*([A-Z]{1,3})/g, (_m, v: string) => `\\angle \\text{${convertLatinVerticesToArabic(v)}}`);
  }

  let out = latex;

  // 1. تحويل ق(...) إلى m(...) في LaTeX
  out = out.replace(/\\text\{ق\}\s*\(/g, "m(").replace(/\bق\s*\(/g, "m(");

  // 2. الزوايا مع المنعكسة: \angle \text{أ المنعكسة} أو m(\angle \text{أ المنعكسة})
  out = out.replace(
    /\\angle\s*\\text\{\s*([أإابجدهوزحطكلمنسصع][\u0640]?)\s*المنعكسة\s*\}/g,
    (_m, v: string) => `\\angle ${convertArabicVerticesToLatin(v)}\\text{ المنعكسة}`
  );

  // 3. الزوايا العادية: \angle \text{أ} أو \angle \text{أ ب جـ}
  out = out.replace(
    /\\angle\s*\\text\{\s*([أإابجدهوزحطكلمنسصع\s\u0640]+?)\s*\}/g,
    (_m, verts: string) => `\\angle ${convertArabicVerticesToLatin(verts)}`
  );

  // 4. رمز \angle متبوعاً بحرف عربي مباشر
  out = out.replace(
    /\\angle\s*([أإابجدهوزحطكلمنسصع][\u0640]?)/g,
    (_m, v: string) => `\\angle ${convertArabicVerticesToLatin(v)}`
  );

  // 5. المثلثات: \triangle \text{أ ب جـ}
  out = out.replace(
    /\\triangle\s*\\text\{\s*([أإابجدهوزحطكلمنسصع\s\u0640]+?)\s*\}/g,
    (_m, verts: string) => `\\triangle ${convertArabicVerticesToLatin(verts)}`
  );

  // 6. القطع المستقيمة فوقها خط: \overline{\text{أ ب}} أو \overline{أ ب}
  out = out.replace(
    /\\overline\{\s*\\text\{\s*([أإابجدهوزحطكلمنسصع\s\u0640]+?)\s*\}\s*\}/g,
    (_m, verts: string) => `\\overline{${convertArabicVerticesToLatin(verts)}}`
  );
  out = out.replace(
    /\\overline\{\s*([أإابجدهوزحطكلمنسصع\s\u0640]{1,8})\s*\}/g,
    (_m, verts: string) => `\\overline{${convertArabicVerticesToLatin(verts)}}`
  );

  // 7. أسماء القطع والمضلعات المباشرة: \text{أ ب} أو \text{أ ب جـ}
  out = out.replace(
    /\\text\{\s*([أإابجدهوزحطكلمنسصع](?:[\u0640]?\s*[أإابجدهوزحطكلمنسصع]){1,3}[\u0640]?)\s*\}/g,
    (_m, verts: string) => convertArabicVerticesToLatin(verts)
  );

  // 8. الأحرف الهندسية الفردية داخل \text{أ} أو \text{ب} أو \text{جـ}
  out = out.replace(
    /\\text\{\s*([أإابجدهوزحطكلمنسصع][\u0640]?)\s*\}/g,
    (_m, ch: string) => ARABIC_TO_LATIN_VERTEX[ch.replace(/\u0640/g, "")] || _m
  );

  return out;
}

