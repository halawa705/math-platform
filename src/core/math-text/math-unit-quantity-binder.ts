/**
 * @file math-unit-quantity-binder.ts
 * @description المرحلة 8: قاعدة واحدة صارمة لوحدات القياس: **الوحدة بعد العدد دائماً**، ملتصقة به بمسافة غير قابلة للكسر
 * (`$20$ + NBSP + سم²`)، فلا تنفصل ولا تنقلب في RTL. يعالج:
 * وحدة داخل الرياضيات في آخرها، `سم$^2$` المنفصلة، الوحدة قبل العدد، الوحدات الإنجليزية، والعدد العادي مع وحدته.
 */

import {
  ARABIC_SWAPPABLE_UNIT_ALTERNATION_SRC,
  ARABIC_UNIT_ALTERNATION_SRC,
  ENGLISH_UNIT_KEY_TO_ARABIC,
  NOT_FOLLOWED_BY_ARABIC_LETTER_SRC,
  NOT_PRECEDED_BY_ARABIC_LETTER_SRC,
  SUPERSCRIPT_DIGIT_TO_UNICODE,
} from "../ssot/arabic-measurement-units-ssot";
import { replaceOutsideMath, splitDollarSegments } from "./math-dollar-segment-utils";

export const MODULE_ID_MATH_UNIT_QUANTITY_BINDER = "math_unit_quantity_binder" as const;

export const NON_BREAKING_SPACE = "\u00A0";

const UNIT = `(${ARABIC_UNIT_ALTERNATION_SRC})${NOT_FOLLOWED_BY_ARABIC_LETTER_SRC}`;
const SWAP_UNIT = `${NOT_PRECEDED_BY_ARABIC_LETTER_SRC}(${ARABIC_SWAPPABLE_UNIT_ALTERNATION_SRC})${NOT_FOLLOWED_BY_ARABIC_LETTER_SRC}`;
const PLAIN_NUMBER = "(\\d+(?:\\.\\d+)?|[٠-٩]+(?:\\.[٠-٩]+)?)";
const ENGLISH_UNIT =
  /(\$|[0-9٠-٩])\s*(cm\s*(?:\^\s*\{?[23]\}?|[²³])?|mm|km|kg|m\s*\/\s*s\s*(?:\^\s*\{?2\}?|²)?)(?![A-Za-z])/g;
const ENDS_LIKE_A_NUMBER = /[0-9٠-٩}\)]$/;

/** `cm^2` ← `سم²` وغيرها، قبل أي معالجة أخرى. */
export function convertEnglishUnitsToArabic(line: string): string {
  return line.replace(ENGLISH_UNIT, (_m, lead: string, unit: string) => {
    const key = unit.replace(/\s/g, "").replace(/[\^{}]/g, "");
    return `${lead} ${ENGLISH_UNIT_KEY_TO_ARABIC[key] ?? unit}`;
  });
}

export function bindMeasurementUnits(line: string): string {
  const segs = splitDollarSegments(line);
  const endsWithUnit = new RegExp(`${UNIT}\\s*$`);

  // 1) `سم` + `$^2$`  ←  `سم²`
  for (let i = 1; i < segs.length - 1; i += 2) {
    const power = segs[i].slice(1, -1).match(/^\s*\^\s*\{?([23])\}?\s*$/);
    const prev = segs[i - 1];
    if (power && i >= 2 && endsWithUnit.test(prev)) {
      segs[i - 1] = prev.replace(endsWithUnit, (_m, unit: string) => `${unit}${SUPERSCRIPT_DIGIT_TO_UNICODE[power[1]]}`);
      segs[i] = "";
    }
  }

  // 2) وحدة محبوسة في آخر الرياضيات، 3) رياضيات يتبعها نص يبدأ بوحدة
  const insideTail = new RegExp(`^(.*[0-9٠-٩}\\)])\\s*\\\\text\\{\\s*${UNIT}\\s*\\}$`);
  const startsWithUnit = new RegExp(`^[ ${NON_BREAKING_SPACE}]*${UNIT}`);
  for (let i = 1; i < segs.length; i += 2) {
    if (!segs[i]) continue;
    let inner = segs[i].slice(1, -1);
    const tail = inner.match(insideTail);
    if (tail) {
      inner = tail[1];
      segs[i + 1] = `${NON_BREAKING_SPACE}${tail[2]}${segs[i + 1] ?? ""}`;
    }
    const next = segs[i + 1] ?? "";
    if (ENDS_LIKE_A_NUMBER.test(inner) && startsWithUnit.test(next)) {
      segs[i + 1] = NON_BREAKING_SPACE + next.replace(/^[ \u00A0]+/, "");
    }
    segs[i] = `$${inner}$`;
  }

  let out = segs.join("");
  out = out.replace(new RegExp(`${NOT_PRECEDED_BY_ARABIC_LETTER_SRC}(${ARABIC_UNIT_ALTERNATION_SRC})\\^\\{?([23])\\}?`, "g"),
    (_m, unit: string, p: string) => `${unit}${SUPERSCRIPT_DIGIT_TO_UNICODE[p]}`);
  // 4) الوحدة قبل العدد ← بعده   5) العدد العادي + وحدته بمسافة غير قابلة للكسر
  out = replaceOutsideMath(out, new RegExp(`${SWAP_UNIT}\\s+${PLAIN_NUMBER}(?![\\d٠-٩.])`, "g"),
    (_m, unit: string, num: string) => `${num}${NON_BREAKING_SPACE}${unit}`);
  out = replaceOutsideMath(out, new RegExp(`(?<![\\w.])${PLAIN_NUMBER} +${UNIT}`, "g"),
    (_m, num: string, unit: string) => `${num}${NON_BREAKING_SPACE}${unit}`);
  return out;
}
