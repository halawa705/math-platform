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
  "د": "D", "ه": "E", "هـ": "E", "و": "F", "ز": "G", "ح": "H",
  "خ": "I", "ي": "J", "ك": "K", "ل": "L", "م": "M", "ن": "N",
  "ف": "P", "ق": "Q", "ر": "R", "ش": "S", "ط": "T", "ت": "U",
  "ث": "V", "غ": "W", "س": "X", "ص": "Y", "ع": "Z",
};

export const LATIN_TO_ARABIC_VERTEX: Readonly<Record<string, string>> = {
  A: "أ", B: "ب", C: "جـ", D: "د", E: "هـ", F: "و", G: "ز",
  H: "ح", I: "خ", J: "ي", K: "ك", L: "ل", M: "م", N: "ن",
  O: "و", P: "ف", Q: "ق", R: "ر", S: "ش", T: "ط", U: "ت",
  V: "ث", W: "غ", X: "س", Y: "ص", Z: "ع",
};

const GEOMETRIC_VERTEX_CHAR_REGEX = "[أإابجدهوزحخيكلمنفقرشطتثغسصع](?:ـ)?";
const SPACED_ARABIC_VERTICES_SRC =
  "(?:[أإابجدهوزحخيكلمنفقرشطتثغسصع]\\u0640?(?:\\s+[أإابجدهوزحخيكلمنفقرشطتثغسصع]\\u0640?){1,4}|أب|بج|جد|أج|دهـ|سص|صع)";
const ANGLE_VERTICES_3_OR_1_SRC = `(?:${GEOMETRIC_VERTEX_CHAR_REGEX}\\s+${GEOMETRIC_VERTEX_CHAR_REGEX}\\s+${GEOMETRIC_VERTEX_CHAR_REGEX}|(?!ق\\s*[\\(∠\\u2220])${GEOMETRIC_VERTEX_CHAR_REGEX})`;
const LATIN_VERTEX_SEQ_REGEX = "[A-Z](?:\\s*[A-Z]){0,4}";
const ARABIC_WORD_END_LOOKAHEAD = "(?=[\\s،,.;:!?()\\[\\]{}]|$)";

const CHOICE_AR_TO_EN: Readonly<Record<string, string>> = {
  "أ": "A", "ا": "A", "ب": "B", "ج": "C", "جـ": "C", "د": "D",
};
const CHOICE_EN_TO_AR: Readonly<Record<string, string>> = {
  A: "أ", B: "ب", C: "جـ", D: "د",
};

/** يحول تسلسلاً من الحروف الهندسية (مثل "أ ب جـ" أو "أب") إلى نظيرتها اللاتينية (مثل "ABC" أو "AB") */
export function convertArabicVerticesToLatin(raw: string): string {
  const cleaned = raw.replace(/\u0640/g, "").trim();
  const chars = cleaned.match(/[أإابجدهوزحخيكلمنفقرشطتثغسصع]/g);
  if (!chars || chars.length === 0) return raw.trim();
  return chars.map((ch) => ARABIC_TO_LATIN_VERTEX[ch] || ch).join("");
}

/** يحول تسلسلاً لاتينياً (مثل "ABC") إلى تسلسل عربي قياسي (مثل "أ ب جـ") */
export function convertLatinVerticesToArabic(raw: string): string {
  const chars = raw.toUpperCase().match(/[A-Z]/g);
  if (!chars || chars.length === 0) return raw;
  return chars.map((ch) => LATIN_TO_ARABIC_VERTEX[ch] || ch).join(" ");
}

function localizeLatinEntitiesInPlainTextToArabic(text: string): string {
  let out = text;
  // 0. (الاختيار C) ← (الاختيار جـ)
  out = out.replace(
    /(الاختيار|الإجابة)\s*(\(\s*)?([ABCD])(\s*\))?/g,
    (_m, w: string, o: string | undefined, ch: string, c: string | undefined) =>
      `${w} ${o ?? ""}${CHOICE_EN_TO_AR[ch] || ch}${c ?? ""}`
  );
  // 1. m(∠ ABC) أو m(ABC) ← ق(∠ أ ب جـ)
  out = out.replace(
    /(?<![A-Za-z])m\s*\(\s*([∠\u2220])?\s*([A-Z]{1,3})(?:\s+(المنعكسة))?\s*\)/g,
    (_m, sym: string | undefined, verts: string, reflex: string | undefined) =>
      `ق(${sym || "∠"} ${convertLatinVerticesToArabic(verts)}${reflex ? " المنعكسة" : ""})`
  );
  // 2. ق(∠ ABC) أو ق(ABC)
  out = out.replace(
    /ق\s*\(\s*([∠\u2220])?\s*([A-Z]{1,3})(?:\s+(المنعكسة))?\s*\)/g,
    (_m, sym: string | undefined, verts: string, reflex: string | undefined) =>
      `ق(${sym || "∠"} ${convertLatinVerticesToArabic(verts)}${reflex ? " المنعكسة" : ""})`
  );
  // 3. ∠ ABC أو Δ ABC
  out = out.replace(
    new RegExp(`([∠\\u2220Δ△])\\s*(${LATIN_VERTEX_SEQ_REGEX})${ARABIC_WORD_END_LOOKAHEAD}`, "g"),
    (_m, sym: string, verts: string) => `${sym} ${convertLatinVerticesToArabic(verts)}`
  );
  // 4. أي متتالية حروف لاتينية كبيرة منفردة (رؤوس/أضلاع/مضلعات مثل ABC, AB, M, X)
  out = out.replace(/(?<![A-Za-z\\])([A-Z]{1,5})(?![A-Za-z])/g, (_m, verts: string) =>
    convertLatinVerticesToArabic(verts)
  );
  // 5. المتغيرات الصغيرة المنفردة (x, y, z, k, n, m)
  const lowerMap: Record<string, string> = { x: "س", y: "ص", z: "ع", k: "ك", n: "ن", m: "م" };
  out = out.replace(/(?<![A-Za-z\\])([xyzkmn])(?![A-Za-z])/g, (_m, ch: string) => lowerMap[ch] || ch);
  return out;
}

/**
 * يوطن أسماء المضلعات والزوايا والأضلاع في النص العربي العادي (خارج كتل LaTeX).
 */
export function localizeGeometricEntitiesInPlainText(
  text: string,
  notation: MathNotationLanguage
): string {
  if (!text) return "";
  if (notation === "arabic") return localizeLatinEntitiesInPlainTextToArabic(text);

  let out = text;

  // 0. (الاختيار جـ) ← (الاختيار C)
  out = out.replace(
    new RegExp(`(الاختيار|الإجابة)\\s*(\\(\\s*)?(أ|ا|ب|جـ|ج|د)(\\s*\\))?${ARABIC_WORD_END_LOOKAHEAD}`, "g"),
    (_m, w: string, o: string | undefined, ch: string, c: string | undefined) =>
      `${w} ${o ?? ""}${CHOICE_AR_TO_EN[ch] || ch}${c ?? ""}`
  );

  // 1. المثلثات (3 رؤوس) والرباعيات والمضلعات (3-5 رؤوس مع عدم ابتلاع حرف العطف "و")
  const triRegex = new RegExp(
    `(المثلثان|المثلثين|المثلث|مثلث)\\s+(${GEOMETRIC_VERTEX_CHAR_REGEX}\\s+${GEOMETRIC_VERTEX_CHAR_REGEX}\\s+${GEOMETRIC_VERTEX_CHAR_REGEX})${ARABIC_WORD_END_LOOKAHEAD}`,
    "g"
  );
  out = out.replace(triRegex, (_m, prefix: string, verts: string) => `${prefix} ${convertArabicVerticesToLatin(verts)}`);

  const polyRegex = new RegExp(
    `(المضلعان|المضلعين|المضلع|مضلع|متوازي الأضلاع|المستطيل|المربع|المعين|شبه المنحرف|الشكل الرباعي|الشكل)\\s+(${GEOMETRIC_VERTEX_CHAR_REGEX}(?:\\s+(?!و\\s+(?:المثلث|المضلع|الشكل|الضلع|الشعاع))${GEOMETRIC_VERTEX_CHAR_REGEX}){1,4})${ARABIC_WORD_END_LOOKAHEAD}`,
    "g"
  );
  out = out.replace(polyRegex, (_m, prefix: string, verts: string) => `${prefix} ${convertArabicVerticesToLatin(verts)}`);

  // 2. قوائم الأشعة أو المستقيمات المتعددة (مثل "الأشعة م أ، م ب" أو "الشعاعين ب أ و ب جـ")
  const rayListRegex = new RegExp(
    `(الأشعة|الشعاعان|الشعاعين|المستقيمان|المستقيمين|القطعتان|القطعتين|الأضلاع|الضلعان|الضلعين)\\s+((?:${GEOMETRIC_VERTEX_CHAR_REGEX}\\s+${GEOMETRIC_VERTEX_CHAR_REGEX})(?:\\s*(?:،|,|\\s+و\\s*)\\s*${GEOMETRIC_VERTEX_CHAR_REGEX}\\s+${GEOMETRIC_VERTEX_CHAR_REGEX})+)`,
    "g"
  );
  out = out.replace(rayListRegex, (_m, prefix: string, list: string) => {
    const converted = list.replace(
      new RegExp(`(${GEOMETRIC_VERTEX_CHAR_REGEX}\\s+${GEOMETRIC_VERTEX_CHAR_REGEX})`, "g"),
      (pair) => convertArabicVerticesToLatin(pair)
    );
    return `${prefix} ${converted}`;
  });

  // 3. الأضلاع والقطع المستقيمة والأوتار والأشعة (مثل "الضلع أ ب"، "الشعاع م هـ")
  const segRegex = new RegExp(
    `(الضلع|ضلع|القطعة المستقيمة|القطعة|قطعة|الشعاع|شعاع|المستقيم|مستقيم|الوتر|وتر|القطر|قطر|نصف القطر|محور التماثل)\\s+(${GEOMETRIC_VERTEX_CHAR_REGEX}\\s+${GEOMETRIC_VERTEX_CHAR_REGEX})${ARABIC_WORD_END_LOOKAHEAD}`,
    "g"
  );
  out = out.replace(segRegex, (_m, prefix: string, verts: string) => `${prefix} ${convertArabicVerticesToLatin(verts)}`);

  // 4. قوائم النقاط (مثل "النقاط أ، ب، جـ") والنقاط المنفردة (مثل "النقطة م"، "نقطة م")
  const pointListRegex = new RegExp(
    `(النقاط|النقط|نقاط|نقط|الرؤوس|رؤوس)\\s+(${GEOMETRIC_VERTEX_CHAR_REGEX}(?:\\s*(?:،|,|\\s+و\\s*)\\s*${GEOMETRIC_VERTEX_CHAR_REGEX})+)${ARABIC_WORD_END_LOOKAHEAD}`,
    "g"
  );
  out = out.replace(pointListRegex, (_m, prefix: string, list: string) => {
    const converted = list.replace(
      new RegExp(GEOMETRIC_VERTEX_CHAR_REGEX, "g"),
      (v) => convertArabicVerticesToLatin(v)
    );
    return `${prefix} ${converted}`;
  });

  const pointRegex = new RegExp(
    `(النقطة|نقطة|المركز|مركز|الرأس|رأس|الدائرة|دائرة)\\s+(${GEOMETRIC_VERTEX_CHAR_REGEX})${ARABIC_WORD_END_LOOKAHEAD}`,
    "g"
  );
  out = out.replace(pointRegex, (_m, prefix: string, v: string) => `${prefix} ${convertArabicVerticesToLatin(v)}`);

  // 5. المتغيرات الجبرية في النص (مثل "قيمة س"، "المجهول ص")
  const varWordRegex = new RegExp(
    `(قيمة|المتغير|المجهول)\\s+([سصعكنم])${ARABIC_WORD_END_LOOKAHEAD}`,
    "g"
  );
  out = out.replace(varWordRegex, (_m, prefix: string, v: string) => `${prefix} ${ARABIC_TO_LATIN_VERTEX[v] || v}`);

  // 6. قياس الزوايا مع ق(∠ أ) أو m(∠ أ م جـ)
  const qAngleRegex = new RegExp(
    `(?:ق|m)\\s*\\(\\s*([∠\\u2220])\\s*(${ANGLE_VERTICES_3_OR_1_SRC})(?:\\s+(المنعكسة))?\\s*\\)`,
    "g"
  );
  out = out.replace(qAngleRegex, (_m, sym: string, verts: string, reflex: string | undefined) =>
    `m(${sym} ${convertArabicVerticesToLatin(verts)}${reflex ? " المنعكسة" : ""})`
  );

  // 7. ق(أ) أو ق(أ المنعكسة)
  const qBareRegex = new RegExp(
    `ق\\s*\\(\\s*(${ANGLE_VERTICES_3_OR_1_SRC})(?:\\s+(المنعكسة))?\\s*\\)`,
    "g"
  );
  out = out.replace(qBareRegex, (_m, verts: string, reflex: string | undefined) =>
    `m(∠ ${convertArabicVerticesToLatin(verts)}${reflex ? " المنعكسة" : ""})`
  );

  // 8. رمز الزاوية المنفرد أو الثلاثي: ∠ أ أو ∠ أ المنعكسة أو ∠ أ ب جـ
  const angleSymRegex = new RegExp(
    `([∠\\u2220])\\s*(${ANGLE_VERTICES_3_OR_1_SRC})(?:\\s+(المنعكسة))?${ARABIC_WORD_END_LOOKAHEAD}`,
    "g"
  );
  out = out.replace(angleSymRegex, (_m, sym: string, verts: string, reflex: string | undefined) =>
    `${sym} ${convertArabicVerticesToLatin(verts)}${reflex ? " المنعكسة" : ""}`
  );

  // 9. كلمة زاوية أو الزاوية بالاسم: زاوية أ أو زاوية أ ب جـ (3 رؤوس أو رأس واحد، دون تحويل "زاوية ق(" إلى "Q")
  const wordAngleRegex = new RegExp(
    `(قياس\\s+)?(زاوية|الزاوية)\\s+(${ANGLE_VERTICES_3_OR_1_SRC})(?:\\s+(المنعكسة))?${ARABIC_WORD_END_LOOKAHEAD}`,
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
      .replace(/(?<![A-Za-z\\])m\s*\(/g, "\\text{ق}(")
      .replace(/\\triangle\s*([A-Z]{3})/g, (_m, v: string) => `\\triangle \\text{${convertLatinVerticesToArabic(v)}}`)
      .replace(
        /\\angle\s*([A-Z]{1,3})\s*\\text\{\s*المنعكسة\s*\}/g,
        (_m, v: string) => `\\angle \\text{${convertLatinVerticesToArabic(v)} المنعكسة}`
      )
      .replace(/\\angle\s*([A-Z]{1,3})/g, (_m, v: string) => `\\angle \\text{${convertLatinVerticesToArabic(v)}}`);
  }

  let out = latex;

  // 1. تحويل ق(...) إلى m(...) في LaTeX
  out = out.replace(/\\text\{\s*ق\s*\}\s*\(/g, "m(").replace(/(?<![\u0621-\u064A])ق\s*\(/g, "m(");

  // 2. الزوايا مع المنعكسة: \angle \text{أ المنعكسة} أو m(\angle \text{أ ب جـ المنعكسة})
  out = out.replace(
    new RegExp(`\\\\angle\\s*\\\\text\\{\\s*(${SPACED_ARABIC_VERTICES_SRC}|${GEOMETRIC_VERTEX_CHAR_REGEX})\\s+المنعكسة\\s*\\}`, "g"),
    (_m, v: string) => `\\angle ${convertArabicVerticesToLatin(v)}\\text{ المنعكسة}`
  );

  // 3. الزوايا العادية: \angle \text{أ} أو \angle \text{أ ب جـ} (دون المساس بـ \angle \text{المنعكسة})
  out = out.replace(
    new RegExp(`\\\\angle\\s*\\\\text\\{\\s*(${SPACED_ARABIC_VERTICES_SRC}|${GEOMETRIC_VERTEX_CHAR_REGEX})\\s*\\}`, "g"),
    (_m, verts: string) => `\\angle ${convertArabicVerticesToLatin(verts)}`
  );

  // 3b. قياس زاوية بدون \angle: m(\text{هـ ب جـ}) ← m(\angle EBC)
  out = out.replace(
    new RegExp(`m\\(\\s*\\\\text\\{\\s*(${SPACED_ARABIC_VERTICES_SRC})\\s*\\}\\s*\\)`, "g"),
    (_m, verts: string) => `m(\\angle ${convertArabicVerticesToLatin(verts)})`
  );

  // 4. رمز \angle متبوعاً بحرف أو ثلاثية عربية مباشرة: \angle أ م جـ
  out = out.replace(
    new RegExp(`\\\\angle\\s*(${SPACED_ARABIC_VERTICES_SRC}|${GEOMETRIC_VERTEX_CHAR_REGEX})(?![\\u0621-\\u064A])`, "g"),
    (_m, v: string) => `\\angle ${convertArabicVerticesToLatin(v)}`
  );

  // 5. المثلثات: \triangle \text{أ ب جـ} أو \triangle أ ب جـ
  out = out.replace(
    new RegExp(`\\\\triangle\\s*\\\\text\\{\\s*(${SPACED_ARABIC_VERTICES_SRC})\\s*\\}`, "g"),
    (_m, verts: string) => `\\triangle ${convertArabicVerticesToLatin(verts)}`
  );
  out = out.replace(
    new RegExp(`\\\\triangle\\s*(${SPACED_ARABIC_VERTICES_SRC})(?![\\u0621-\\u064A])`, "g"),
    (_m, verts: string) => `\\triangle ${convertArabicVerticesToLatin(verts)}`
  );

  // 6. القطع والأشعة والمستقيمات: \overline / \overleftrightarrow / \overrightarrow / \vec / \widehat
  out = out.replace(
    new RegExp(`\\\\(overline|overleftrightarrow|overrightarrow|vec|widehat)\\{\\s*\\\\text\\{\\s*(${SPACED_ARABIC_VERTICES_SRC})\\s*\\}\\s*\\}`, "g"),
    (_m, cmd: string, verts: string) => `\\${cmd === "vec" ? "overrightarrow" : cmd}{${convertArabicVerticesToLatin(verts)}}`
  );
  out = out.replace(
    new RegExp(`\\\\(overline|overleftrightarrow|overrightarrow|vec|widehat)\\{\\s*(${SPACED_ARABIC_VERTICES_SRC})\\s*\\}`, "g"),
    (_m, cmd: string, verts: string) => `\\${cmd === "vec" ? "overrightarrow" : cmd}{${convertArabicVerticesToLatin(verts)}}`
  );

  // 7. أسماء القطع والمضلعات المباشرة المفصولة بمسافات: \text{أ ب} أو \text{أ ب جـ}
  out = out.replace(
    new RegExp(`\\\\text\\{\\s*(${SPACED_ARABIC_VERTICES_SRC})\\s*\\}`, "g"),
    (_m, verts: string) => convertArabicVerticesToLatin(verts)
  );

  // 8. الأحرف الهندسية الفردية داخل \text{أ} أو \text{ب} أو \text{جـ}
  out = out.replace(
    /\\text\{\s*([أإابجدهوزحخيكلمنفقرشطتثغسصع][\u0640]?)\s*\}/g,
    (_m, ch: string) => ARABIC_TO_LATIN_VERTEX[ch.replace(/\u0640/g, "")] || _m
  );

  return out;
}

