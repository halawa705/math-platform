/**
 * @file mcq-empty-choice-synthesizer.ts
 * @description يكتشف أي خيار فارغ أو ناقص من المصدر في أسئلة الاختيار من متعدد (MCQ)،
 * ويملؤه تلقائياً بقيمة مشابهة هيكلياً لبقية الخيارات لكنها خاطئة ومنفصلة، مع إرجاع فهارس الخيارات المولّدة لتلوينها بالأخضر للمعلم.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import { toWesternNumeralsSSOT } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_MCQ_EMPTY_CHOICE_SYNTHESIZER = "mcq_empty_choice_synthesizer" as const;

export function isChoiceSlotBlank(raw: string | undefined): boolean {
  if (!raw) return true;
  const stripped = raw
    .replace(/\$/g, "")
    .replace(/\\(?:quad|qquad|,|;|!|\s+)/g, "")
    .replace(/[\u00A0\s]/g, "")
    .trim();
  if (!stripped) return true;
  return /^(?:[؟?!….—\-_]+|\[?\s*فارغ\s*\]?)$/i.test(stripped);
}

function normKey(s: string): string {
  return toWesternNumeralsSSOT(s)
    .replace(/\$/g, "")
    .replace(/\\text\{([^}]*)\}/g, "$1")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function generateWrongSiblingDistractor(
  siblings: readonly string[],
  used: Set<string>
): string {
  const usesDollar = siblings.some((s) => /\$/.test(s));
  const wrap = (body: string) => (usesDollar && !body.includes("$") ? `$${body}$` : body);

  for (const sample of siblings) {
    const inner = toWesternNumeralsSSOT(sample).replace(/^\$+|\$+$/g, "").trim();

    // 1. صيغة الفترات المصرية أو العادية: ]4, 10[ أو [3, 7]
    const intervalMatch = inner.match(/^([\]\[()])\s*(-?\d+(?:\.\d+)?)\s*([,،;])\s*(-?\d+(?:\.\d+)?)\s*([\]\[()])$/);
    if (intervalMatch) {
      const [, lBr, aStr, sep, bStr, rBr] = intervalMatch;
      const a = Number(aStr);
      const b = Number(bStr);
      const candidates: string[] = [];
      const flipL = lBr === "]" ? "[" : lBr === "[" ? "]" : lBr === "(" ? "[" : "(";
      const flipR = rBr === "[" ? "]" : rBr === "]" ? "[" : rBr === ")" ? "]" : ")";
      candidates.push(`${flipL}${a}${sep} ${b}${rBr}`);
      candidates.push(`${lBr}${a}${sep} ${b}${flipR}`);
      candidates.push(`${flipL}${a}${sep} ${b}${flipR}`);
      for (const da of [-1, 1, -2, 2]) {
        for (const db of [1, -1, 2, -2]) {
          if (a + da < b + db) {
            candidates.push(`${lBr}${a + da}${sep} ${b + db}${rBr}`);
          }
        }
      }
      for (const cand of candidates) {
        const wrapped = wrap(cand);
        if (!used.has(normKey(wrapped))) return wrapped;
      }
    }

    // 2. قياسات الزوايا بالدرجات: 60^\circ أو 60°
    const degMatch = inner.match(/^(-?\d+(?:\.\d+)?)\s*(\^\s*\\circ|°|درجة)$/);
    if (degMatch) {
      const val = Number(degMatch[1]);
      const unit = degMatch[2];
      for (const delta of [-15, 15, -30, 30, -10, 10, 45, -20, 20]) {
        const nextVal = val + delta;
        if (nextVal > 0 && nextVal < 360) {
          const wrapped = wrap(`${nextVal}${unit}`);
          if (!used.has(normKey(wrapped))) return wrapped;
        }
      }
    }

    // 3. الكسور الجبرية \frac{a}{b} أو a/b
    const fracMatch = inner.match(/^(-?)\\frac\{(-?\d+)\}\{(-?\d+)\}(.*)$/);
    if (fracMatch) {
      const [, sign, nStr, dStr, tail] = fracMatch;
      const n = Number(nStr);
      const d = Number(dStr);
      for (const dn of [1, -1, 2, -2]) {
        const nextN = n + dn;
        if (nextN > 0 && nextN !== d) {
          const wrapped = wrap(`${sign}\\frac{${nextN}}{${d}}${tail}`);
          if (!used.has(normKey(wrapped))) return wrapped;
        }
      }
    }

    // 4. كمية عددية + وحدة عربية مثل 3\text{ سم} أو 5 سم²
    const qtyMatch = inner.match(/^(-?\d+(?:\.\d+)?)(\s*(?:\\text\{[^}]+\}|سم²|م²|سم|مم|كم|متر|م|وحدة(?:\s*طول)?|وحدات)?(?:\^2|\^\s*\{2\}|²)?)$/);
    if (qtyMatch && qtyMatch[1] !== "") {
      const val = Number(qtyMatch[1]);
      const unitTail = qtyMatch[2] || "";
      for (const delta of [1, -1, 2, -2, 3, -3, 4, 5]) {
        const nextVal = Number((val + delta).toFixed(2));
        if (nextVal > 0 || val < 0) {
          const wrapped = wrap(`${nextVal}${unitTail}`);
          if (!used.has(normKey(wrapped))) return wrapped;
        }
      }
    }

    // 5. أي تعبير يحتوي رقماً (مثل 2x + 3)
    const anyNum = inner.match(/(\d+)/);
    if (anyNum) {
      const base = Number(anyNum[1]);
      for (const delta of [1, 2, -1, 3, 4]) {
        const nextN = Math.max(1, base + delta);
        const replaced = inner.replace(/\d+/, String(nextN));
        const wrapped = wrap(replaced);
        if (!used.has(normKey(wrapped))) return wrapped;
      }
    }
  }

  // احتياط نصي مضمون عدم التكرار
  const fallbackPool = usesDollar ? ["$0$", "$1$", "$-1$", "$2$"] : ["غير ذلك", "٠", "١", "٢"];
  for (const fb of fallbackPool) {
    if (!used.has(normKey(fb))) return fb;
  }
  return wrap("0");
}

export function synthesizeEmptyMcqChoices(params: {
  readonly choices: readonly [string, string, string, string];
  readonly correctMcqIndex?: 0 | 1 | 2 | 3;
  readonly solutionText?: string;
}): {
  readonly choices: readonly [string, string, string, string];
  readonly synthesizedIndices: readonly number[];
} {
  const blankFlags = params.choices.map((c) => isChoiceSlotBlank(c));
  if (!blankFlags.some(Boolean)) {
    return { choices: params.choices, synthesizedIndices: [] };
  }

  const nonEmpty = params.choices.filter((_, idx) => !blankFlags[idx]);
  const used = new Set<string>(nonEmpty.map(normKey));
  if (params.solutionText) {
    for (const seg of params.solutionText.split(/\s+/)) {
      if (seg.length > 0) used.add(normKey(seg));
    }
  }

  const filled: [string, string, string, string] = [
    params.choices[0],
    params.choices[1],
    params.choices[2],
    params.choices[3],
  ];
  const synthesizedIndices: number[] = [];

  for (let i = 0; i < 4; i++) {
    if (blankFlags[i]) {
      const distractor = generateWrongSiblingDistractor(nonEmpty, used);
      filled[i] = distractor;
      used.add(normKey(distractor));
      synthesizedIndices.push(i);
    }
  }

  return { choices: filled, synthesizedIndices };
}
