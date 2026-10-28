/**
 * @file math-latin-name-and-similarity-binder.ts
 * @description المرحلة 7: يربط الرموز اللاتينية داخل الجملة العربية بمقاطع رياضية معزولة LTR:
 * - أسماء الرؤوس والمضلعات (`ABCD`) والمتغيرات المنفردة (`x`) تُلف بـ `$..$`.
 * - التشابه والتطابق بين مضلعين يصبح كتلة واحدة `$ABCD \sim XYZW$` (أو `\cong`) بغض النظر عن موضع العلامة.
 * - قياس الزاوية `m(∠A) = 50°` والدرجات `30°` والمعادلة القصيرة `AB = 4` كتل رياضية مستقلة.
 */

import { replaceOutsideMath } from "./math-dollar-segment-utils";

export const MODULE_ID_MATH_LATIN_NAME_AND_SIMILARITY_BINDER =
  "math_latin_name_and_similarity_binder" as const;

const NAME = "[A-Z]{2,6}'*";
const POLYGON_NOUN = "(?:المضلعين|المضلعان|المضلع|المثلثين|المثلثان|المثلث|متوازيا الأضلاع)";
const SIMILARITY_OPERATOR = "(~|∼|\\\\sim|يشابه|تشابه|≅|\\\\cong|يطابق|تطابق)";
const NUMBER = "-?[0-9٠-٩]+(?:\\.[0-9٠-٩]+)?";

function similarityLatex(operator: string): string {
  return /≅|cong|يطابق|تطابق/.test(operator) ? "\\cong" : "\\sim";
}

export function bindLatinNamesAndSimilarity(line: string): string {
  let out = line;

  out = replaceOutsideMath(
    out,
    new RegExp(`m\\s*\\(\\s*(?:∠|\\\\angle|<)\\s*([A-Z]'*)\\s*\\)\\s*=\\s*(${NUMBER})\\s*(?:°|درجة)?`, "g"),
    (_m, vertex: string, value: string) => ` $m(\\angle ${vertex}) = ${value}^\\circ$ `
  );
  out = replaceOutsideMath(
    out,
    new RegExp(`(${NUMBER})\\s*°`, "g"),
    (_m, value: string) => ` $${value}^\\circ$ `
  );

  out = replaceOutsideMath(
    out,
    new RegExp(`(${POLYGON_NOUN}\\s+)?(${NAME})\\s*${SIMILARITY_OPERATOR}\\s*(?:${POLYGON_NOUN}\\s+)?(${NAME})(?![A-Za-z'])`, "g"),
    (_m, noun: string | undefined, a: string, op: string, b: string) =>
      `${noun ?? ""}$${a} ${similarityLatex(op)} ${b}$`
  );
  out = replaceOutsideMath(
    out,
    new RegExp(`${SIMILARITY_OPERATOR}\\s*(${NAME})\\s+(?:و\\s*)?(${NAME})(?![A-Za-z'])`, "g"),
    (_m, op: string, a: string, b: string) => `$${a} ${similarityLatex(op)} ${b}$`
  );

  out = replaceOutsideMath(
    out,
    new RegExp(`(?<![A-Za-z\\\\])([A-Z]{1,6}'*|[a-z])\\s*=\\s*(${NUMBER})(?![0-9٠-٩.])`, "g"),
    (_m, name: string, value: string) => `$${name} = ${value}$`
  );

  out = replaceOutsideMath(
    out,
    /(?<![A-Za-z0-9\\_^'-])([A-Z]{1,6}'*)(?![A-Za-z0-9_'-])/g,
    (_m, name: string) => `$${name}$`
  );
  out = replaceOutsideMath(
    out,
    /(?<![A-Za-z0-9\\_^'-])([a-z])(?![A-Za-z0-9_'-])/g,
    (_m, name: string) => `$${name}$`
  );
  return out;
}
