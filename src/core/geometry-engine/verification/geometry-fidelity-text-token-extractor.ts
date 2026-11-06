/**
 * @file geometry-fidelity-text-token-extractor.ts
 * @description مستخرج الأرقام والرؤوس الهندسية الدقيقة من نصوص المسائل لبوابة التحقق من الصدق (Fidelity Gate).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 160 سطراً).
 */

import { toWesternNumeralsSSOT } from "../../ssot/numeral-and-unit-ssot";
import { normalizeLabelKey } from "../fact-compositor/geo-label-utils";

export const MODULE_ID_GEOMETRY_FIDELITY_TEXT_TOKEN_EXTRACTOR =
  "geometry_fidelity_text_token_extractor" as const;

/**
 * يستخرج جميع الأرقام والمصطلحات الجبرية من نص المسألة.
 */
export function extractAllNumbersFromText(text: string): Set<string> {
  const norm = toWesternNumeralsSSOT(text);
  const result = new Set<string>();

  const numMatches = norm.match(/(?<![0-9.])\d+(?:\.\d+)?(?![0-9.])/g);
  if (numMatches) {
    for (const n of numMatches) {
      result.add(n);
      const parsed = parseFloat(n);
      if (!Number.isNaN(parsed)) {
        result.add(String(parsed));
      }
    }
  }

  const algMatches = norm.match(/\d+[a-zA-Zسصع]/g);
  if (algMatches) {
    for (const a of algMatches) {
      result.add(a.toLowerCase());
      result.add(toWesternNumeralsSSOT(a).toLowerCase());
    }
  }

  return result;
}

/**
 * يستخرج جميع الرؤوس المعلنة في نص المسألة بدقة عالية ودون التقاط حروف الجر أو الكلمات العادية.
 */
export function extractAllVerticesFromText(text: string): Set<string> {
  const result = new Set<string>();
  const clean = text
    .replace(/^\d+\.\s*(?:matches\s+Problem|projects\s+to|supports\s+Arabic|verifies\s+that)[^:\n]*:?/gi, " ")
    .replace(/\[\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*/i, "")
    .replace(/\]/g, "");

  // 1. أي كلمة لاتينية كبيرة من 2-6 أحرف تمثل مضلعاً أو قطعة (مثل ABC, DBE, ABCD, AB, CD)
  const capitalWordMatches = clean.matchAll(/\b[A-Z]{2,6}\b/g);
  for (const cwm of capitalWordMatches) {
    const word = cwm[0];
    if (/^(SIN|COS|TAN|SEC|CSC|COT|LOG|EXP|MAX|MIN|AVG|SUM|PDF|SVG)$/i.test(word)) continue;
    for (const ch of word) {
      result.add(ch);
    }
  }

  // 2. مضلعات باللغة العربية بحروف منفصلة: مثلث أ ب جـ
  const polyMatches = clean.matchAll(
    /(?:مثلث|Δ|مستطيل|مربع|معين|شبه\s*منحرف|متوازي\s*أضلاع|رباعي|خماسي|سداسي|شكل\s*رباعي)\s*([A-Za-z]{3,6}|(?:[أ-ي]ـ?\s+){2,5}[أ-ي]ـ?)/gi
  );
  for (const pm of polyMatches) {
    const raw = pm[1].replace(/\s+/g, "");
    for (const ch of raw) {
      const k = normalizeLabelKey(ch);
      if (k) result.add(k);
    }
  }

  // 3. قطع مستقيمة عربية بحروف مفصولة: أ ب أو أـ ب (مع استبعاد حرف العطف «و» والمتر «م»)
  const segMatches = clean.matchAll(/(?<!\d\s*)(?<![A-Za-zء-ي])(?:[أ-ي]ـ?\s+[أ-ي]ـ?|[أ-ي]ـ[أ-ي]ـ?)(?![A-Za-zء-ي])/g);
  for (const sm of segMatches) {
    const raw = sm[0].replace(/\s+/g, "");
    if (raw.includes("و") || raw.includes("م")) continue;
    for (const ch of raw) {
      const k = normalizeLabelKey(ch);
      if (k) result.add(k);
    }
  }

  // 4. زوايا: ∠A أو قياس A أو ق(∠أ ب جـ) - مع مراعاة حدود الكلمات
  const angleMatches = clean.matchAll(
    /(?:ق\s*\(\s*∠?\s*([A-Za-z]{1,3}|[أ-ي]ـ?(?:\s*[أ-ي]ـ?){0,2})\s*\)|m\s*\(\s*∠?\s*([A-Za-z]{1,3})\s*\)|∠\s*([A-Za-z]{1,3}|[أ-ي]ـ?)|(?:قياس|زاوية)\s+([A-Z]|[أ-ي]ـ?)(?![أ-يa-zA-Z]))/g
  );
  for (const am of angleMatches) {
    const raw = (am[1] || am[2] || am[3] || am[4] || "").replace(/\s+/g, "");
    for (const ch of raw) {
      const k = normalizeLabelKey(ch);
      if (k) result.add(k);
    }
  }

  // 5. نقاط مفردة: النقطة A أو رأس أ أو منتصف D أو D منتصف / د منتصف
  const singlePoints = clean.matchAll(
    /(?:(?:النقطة|نقطة|الرأس|رأس|مركز|منتصف)\s+([A-Za-z]|[أ-ي]ـ?)|(?<![أ-يa-zA-Z])([A-Za-z]|[أ-ي]ـ?)\s+(?:منتصف|منتصفا|منتصفي|منتصفات|تنصف|ينصف|مركز))(?![أ-يa-zA-Z])/g
  );
  for (const sp of singlePoints) {
    const rawChar = sp[1] || sp[2];
    if (!rawChar || rawChar === "و") continue;
    const k = normalizeLabelKey(rawChar);
    if (k) result.add(k);
  }

  // 6. قائمة منتصفات: E ، F منتصفي أو D ، E ، F منتصفات
  const midListMatches = clean.matchAll(
    /([A-Za-z]|[أ-ي]ـ?)(?:\s*[,،]\s*([A-Za-z]|[أ-ي]ـ?))+\s*(?:منتصف|منتصفا|منتصفي|منتصفات)/g
  );
  for (const ml of midListMatches) {
    const letters = ml[0].match(/[A-Za-z]|[أ-ي]ـ?/g) || [];
    for (const l of letters) {
      if (/^(منتصف|منتصفا|منتصفي|منتصفات)$/.test(l)) continue;
      const k = normalizeLabelKey(l);
      if (k) result.add(k);
    }
  }

  // 7. حروف لاتينية مفردة محاطة بسياق عربي أو علامات ترقيم رياضية: E ، F أو في M (مع استبعاد المتغيرات المسبوقة بقيمة أو مجهول)
  const isolatedLatinMatches = clean.matchAll(
    /(?<!(?:قيمة|مجهول|متغير)\s*)(?<=[\s:،,(]|^)([A-HJ-NP-Z])(?=[(\s:،,)|]|$)/g
  );
  for (const ilm of isolatedLatinMatches) {
    result.add(ilm[1].toUpperCase());
  }

  // 8. نقاط ذات إحداثيات مثل A(2,6) أو O(0,0) أو B(-4,3)
  const coordPointMatches = clean.matchAll(/\b([A-Za-z]|[أ-ي]ـ?)\s*\(\s*-?\d+/g);
  for (const cpm of coordPointMatches) {
    const k = normalizeLabelKey(cpm[1]);
    if (k) result.add(k);
    if (cpm[1].toUpperCase() === "O") {
      result.add("O");
      result.add("F");
    }
  }

  return result;
}
