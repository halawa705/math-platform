/**
 * @file primary-grade4-bar-model-fact-parser.ts
 * @description يحلل وصف «النموذج الشريطي» (الكل + جزءان) من النص العربي إلى حقائق منظمة، دون أي قالب ثابت.
 * أي نقص أو تناقض ← يعيد null (لا شكل) بدل رسم قريب.
 * الصيغة المعتمدة: «نموذج شريطي: الكل = 985 ؛ الجزء الأول = d ؛ الجزء الثاني = 285».
 * الخلية: عدد بوحدة (340 سم)، أو رمز (x)، أو «؟»، أو فراغ منقط بوحدة («... كم»).
 */
import { toWesternNumeralsSSOT } from "../../../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PRIMARY_GRADE4_BAR_MODEL_FACT_PARSER = "primary_grade4_bar_model_fact_parser" as const;

export type BarModelCell =
  | { readonly kind: "number"; readonly value: string; readonly unit?: string }
  | { readonly kind: "symbol"; readonly symbol: string; readonly unit?: string }
  | { readonly kind: "question"; readonly unit?: string }
  | { readonly kind: "blank"; readonly unit?: string };

export interface BarModelFacts {
  readonly whole: BarModelCell;
  /** الجزء الأول يُرسم على اليمين (اتجاه الصفحة العربي). */
  readonly parts: readonly [BarModelCell, BarModelCell];
}

const KNOWN_UNITS: readonly string[] = [
  "كم", "م", "سم", "مم", "طن", "طنًا", "طنا", "كجم", "جم", "لتر", "لترات", "لترًا", "لترا", "ملل", "ساعة", "ساعات", "دقيقة", "دقائق", "ثانية", "ثانية", "يوم", "أيام", "جنيه", "قرش",
];

function parseCell(raw: string): BarModelCell | null {
  const text = toWesternNumeralsSSOT(raw).replace(/\s+/g, " ").trim();
  if (!text) return null;
  const words = text.split(" ");
  let unit: string | undefined;
  if (words.length > 1 && KNOWN_UNITS.includes(words[words.length - 1])) unit = words.pop();
  else if (words.length === 1 && KNOWN_UNITS.includes(words[0])) return { kind: "blank", unit: words[0] };
  const body = words.join("").replace(/,/g, "");
  if (/^\d+(?:\.\d+)?$/.test(body)) return { kind: "number", value: words.join("").replace(/\s/g, ""), unit };
  if (/^[؟?]$/.test(body)) return { kind: "question", unit };
  if (/^[.…·]+$/.test(body)) return { kind: "blank", unit };
  if (/^[A-Za-z\u0621-\u064A]$/.test(body)) return { kind: "symbol", symbol: body, unit };
  return null;
}

function grabAfterLabel(text: string, labelPattern: string): string | null {
  const m = text.match(new RegExp(`${labelPattern}\\s*[:=]\\s*([^؛;\\n\\]]+)`));
  return m ? m[1].trim() : null;
}

export function parseBarModelFacts(description: string): BarModelFacts | null {
  if (!/نموذج\s*شريطي/.test(description)) return null;
  const wholeRaw = grabAfterLabel(description, "الكل");
  let firstRaw = grabAfterLabel(description, "الجزء\\s*الأول");
  let secondRaw = grabAfterLabel(description, "الجزء\\s*الثاني");
  if (!firstRaw || !secondRaw) {
    const both = grabAfterLabel(description, "الجزءان");
    const pair = both?.split(/\s+و\s*/);
    if (pair && pair.length === 2) [firstRaw, secondRaw] = pair;
  }
  if (!wholeRaw || !firstRaw || !secondRaw) return null;
  const whole = parseCell(wholeRaw);
  const first = parseCell(firstRaw);
  const second = parseCell(secondRaw);
  if (!whole || !first || !second) return null;
  if (!isArithmeticallyConsistent(whole, first, second)) return null;
  return { whole, parts: [first, second] };
}

/** إن كانت الخلايا الثلاث أعداداً بوحدة واحدة فيجب أن يساوي الكل مجموع الجزأين، وإلا نرفض. */
function isArithmeticallyConsistent(whole: BarModelCell, a: BarModelCell, b: BarModelCell): boolean {
  if (whole.kind !== "number" || a.kind !== "number" || b.kind !== "number") return true;
  if (whole.unit !== a.unit || a.unit !== b.unit) return true;
  const n = (c: { value: string }): number => parseFloat(c.value.replace(/,/g, ""));
  return Math.abs(n(whole) - (n(a) + n(b))) < 1e-9;
}
