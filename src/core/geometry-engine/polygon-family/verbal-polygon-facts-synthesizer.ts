/**
 * @file verbal-polygon-facts-synthesizer.ts
 * @description مولّد الحقائق للمضلعات اللفظية (5 إلى 10 أضلاع: منتظمة، زوايا معلومة، نسب، وزوايا منعكسة)
 * ومستخرج أقطار وامتدادات المضلعات من متن المسألة لتجنب فقدانها عند اختصار وسم الرسم.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 220 سطراً).
 */

export const MODULE_ID_VERBAL_POLYGON_FACTS_SYNTHESIZER =
  "verbal_polygon_facts_synthesizer" as const;

const POLY_NAMES: ReadonlyArray<readonly [RegExp, number, string]> = [
  [/خماسي/i, 5, "خماسي"],
  [/سداسي/i, 6, "سداسي"],
  [/سباعي/i, 7, "سباعي"],
  [/ثماني/i, 8, "ثماني"],
  [/تساعي/i, 9, "تساعي"],
  [/عشاري/i, 10, "عشاري"],
];

const NO_SYNTH_REGEX =
  /(?:أقطار|قطراً|قطرا\b|تماثل|محور|مثلثات\s+الناتجة|ينقسم[^.\n]{0,40}مثلثات|تبليط|قارن|اذكر|هل\s+يمكن|عدد\s+أضلاع(?:ه|\s+هذا)?|تجتمع\s+حول|لكل\s+(?:مضلع|شكل\s+)?من|نجمة\s+(?:خماسية|سداسية|ثمانية)|اثناعشري|اثنا\s*عشري|\b(?:1[1-9]|[2-9]\d)\s*(?:ضلع|أضلاع|زاوية))/i;

/** يستخرج إعلان المضلع المسمى والأقطار/الامتدادات المذكورة في نص المسألة (إن غابت عن الوسم). */
export function extractPolygonDiagonalAndExtensionFactsFromPrompt(cleanPrompt: string): string[] {
  const out: string[] = [];
  if (!cleanPrompt) return out;
  const push = (f: string) => { if (f && !out.includes(f)) out.push(f); };

  // 1. مضلع مسمى بـ 5..10 أحرف (مثل الخماسي المنتظم ABCDE أو السداسي المنتظم ABCDEF)
  const namedM = cleanPrompt.match(
    /(?:ال)?(خماسي|سداسي|سباعي|ثماني|تساعي|عشاري)(?:\s+(?:ال)?(منتظم|مقعر|محدب))?\s+([A-Z]{5,10})\b/
  );
  if (namedM) {
    const expected = POLY_NAMES.find(([rx]) => rx.test(namedM[1]))?.[1];
    if (expected && namedM[3].length === expected) {
      push(`${namedM[1]}${namedM[2] ? ` ${namedM[2]}` : ""} ${namedM[3]}`);
    }
  }

  // 2. تقاطع قطرين: تقاطع القطران AC و BD في النقطة M
  for (const dm of cleanPrompt.matchAll(/تقاطع\s+(?:ال)?قطر(?:ان|ين)\s+([A-Z]{2})\s*و\s*([A-Z]{2})\s+في\s+(?:النقطة\s+)?([A-Z])\b/g)) {
    push(`ارسم ${dm[1]}`);
    push(`ارسم ${dm[2]}`);
    push(`قطراه ${dm[1]} و ${dm[2]} يتقاطعان في ${dm[3]}`);
  }

  // 3. قطران صريحان: رُسم القطران AC و AD
  for (const m2 of cleanPrompt.matchAll(/(?:ر[َُ]?سم|نرسم|ارسم|وصل)\s+(?:ال)?قطر(?:ان|ين)\s+([A-Z]{2})\s*و\s*([A-Z]{2})/g)) {
    push(`ارسم ${m2[1]}`);
    push(`ارسم ${m2[2]}`);
  }

  // 4. قطر مفرد أو علاقة ضلع بقطر: رُسم القطر AC / بين الضلع AB والقطر AC
  for (const m1 of cleanPrompt.matchAll(/(?:(?:ر[َُ]?سم|نرسم|ارسم|وصل)\s+(?:ال)?قطر\s+|بين\s+(?:ال)?ضلع\s+[A-Z]{2}\s+و(?:ال)?قطر\s+)([A-Z]{2})(?![A-Z])/g)) {
    push(`ارسم ${m1[1]}`);
  }

  // 5. توصيل 3 رؤوس بالأقطار: توصيل الرؤوس A, C, E بالأقطار
  for (const cm of cleanPrompt.matchAll(/توصيل\s+الرؤوس\s+([A-Z])\s*[,،]\s*([A-Z])\s*[,،و]\s*([A-Z])\s+بالأقطار/g)) {
    push(`ارسم ${cm[1]}${cm[2]}`);
    push(`ارسم ${cm[2]}${cm[3]}`);
    push(`ارسم ${cm[1]}${cm[3]}`);
  }

  // 6. امتداد أضلاع سداسي لتكوين مثلث كبير (HW-40)
  for (const xm of cleanPrompt.matchAll(/(?:مُدت|مدت)\s+أضلاعه(?:\s+البديلة)?\s+([A-Z]{2})\s*[,،و]\s*([A-Z]{2})\s*[,،و]\s*([A-Z]{2})[^؛.\n]*?مثلث(?:اً|ا)?(?:\s+كبير(?:اً|ا)?)?\s+([A-Z]{3})\b/g)) {
    const [, s1, s2, s3, tri] = xm;
    push(`${s1} ∩ ${s2} = {${tri[0]}}`);
    push(`${s2} ∩ ${s3} = {${tri[1]}}`);
    push(`${s3} ∩ ${s1} = {${tri[2]}}`);
  }

  return out;
}

function detectPolygonCountAndWord(plain: string): { n: number; word: string } | null {
  for (const [rx, n, word] of POLY_NAMES) {
    if (rx.test(plain)) return { n, word };
  }
  const numSides = plain.match(/(?:ذي|ذو|مكوّن\s+من|يتكون\s+من)\s*([5-9]|10)\s*أضلاع/i);
  if (numSides) {
    const n = Number(numSides[1]);
    const word = POLY_NAMES.find(([, cnt]) => cnt === n)?.[2];
    if (word) return { n, word };
  }
  return null;
}

/** يولّد حقائق رسم حتمية للمسائل اللفظية الخاصة بالمضلعات (5..10 أضلاع) متى أمكن رسمها بدقة. */
export function synthesizeVerbalPolygonFacts(
  plain: string,
  body: string,
  existingFacts: readonly string[]
): string[] {
  if (
    existingFacts.some((f) =>
      /^(?:ال)?(?:مثلث|مستطيل|مربع|معين|متوازي|شبه|رباعي|خماسي|سداسي|سباعي|ثماني|تساعي|عشاري|دائرة)/.test(f.trim())
    )
  ) {
    return [];
  }
  if (NO_SYNTH_REGEX.test(plain)) return [];

  const info = detectPolygonCountAndWord(plain);
  if (!info) return [];
  const { n, word } = info;
  const lbls = "ABCDEFGHIJ".slice(0, n);
  const hasExistingAngles = existingFacts.some((f) => f.includes("∠"));

  // الحالة أ: مضلع مقعر بزاوية أو زاويتين منعكستين وبقية الزوايا متطابقة/متساوية
  if (/مقعر/.test(plain) && /متطابق|متساوي/.test(plain)) {
    const reflexDegs = [...plain.matchAll(/(\d+(?:\.\d+)?)\s*°/g)]
      .map((m) => Number(m[1]))
      .filter((v) => v > 180 && v < 340);
    if (reflexDegs.length >= 1 && reflexDegs.length <= 2) {
      const sumR = reflexDegs.reduce((s, v) => s + v, 0);
      const remEach = ((n - 2) * 180 - sumR) / (n - reflexDegs.length);
      if (remEach >= 25 && remEach <= 172) {
        const out = [`${word} مقعر ${lbls}`];
        if (!hasExistingAngles) {
          const indices = reflexDegs.length === 1 ? [Math.floor(n / 2)] : [2, Math.min(n - 2, 5)];
          reflexDegs.forEach((deg, idx) => out.push(`ق(∠${lbls[indices[idx]]}) المنعكسة = ${deg}°`));
        }
        return out;
      }
    }
  }

  // الحالة ب: نَسَب زوايا (كاملة أو مع عدة زوايا متساوية مثل HW-16)
  const ratioChainM = plain.match(/(\d+(?:\s*:\s*\d+){2,9})/);
  if (ratioChainM) {
    const parts = ratioChainM[1].split(":").map((s) => Number(s.trim())).filter((v) => v > 0);
    const fixedPair = plain.match(/([1-9])\s*زوايا\s*قياس\s*كل\s*منها(?:\s*يساوي)?\s*(\d+(?:\.\d+)?)\s*°/);
    if (fixedPair) {
      const kFixed = Number(fixedPair[1]);
      const fixedVal = Number(fixedPair[2]);
      if (kFixed + parts.length === n && !hasExistingAngles) {
        const out = [`${word} ${lbls}`];
        for (let i = 0; i < kFixed; i++) out.push(`ق(∠${lbls[i]}) = ${fixedVal}°`);
        parts.forEach((r, idx) => out.push(`ق(∠${lbls[kFixed + idx]}) = ${r}x`));
        return out;
      }
    } else if (parts.length === n && !hasExistingAngles) {
      return [`${word} ${lbls}`, ...parts.map((r, i) => `ق(∠${lbls[i]}) = ${r}x`)];
    }
  }

  // الحالة ب-2: n زوايا جبرية صريحة مثل x°, 2x°, 3x°, 4x°, 5x° (HW-13)
  const algTokens = [...plain.matchAll(/((?:\d*[+\-*/]?\s*[xXyY]|(?<![أ-يA-Za-z])\d*[سص])(?:\s*[+\-]\s*\d+)?)\s*°/g)].map((m) =>
    m[1].replace(/[()]/g, "").trim()
  );
  if (algTokens.length === n && !hasExistingAngles) {
    return [`${word} ${lbls}`, ...algTokens.map((tok, i) => `ق(∠${lbls[i]}) = ${tok}°`)];
  }

  // الحالة ج: (n - 1) زوايا رقمية معلومة (تحديد المضلع + إشارة للزاوية المجهولة ؟)
  const degs = [...plain.matchAll(/(?<![+\-*/\w(])(\d+(?:\.\d+)?)\s*°/g)]
    .map((m) => Number(m[1]))
    .filter((v) => Number.isFinite(v) && v >= 15 && v < 340);
  if (degs.length === n - 1 && !hasExistingAngles) {
    const sum = degs.reduce((s, v) => s + v, 0);
    const rem = (n - 2) * 180 - sum;
    if (rem >= 18 && rem <= 340) {
      return [
        `${word}${rem > 180 ? " مقعر" : ""} ${lbls}`,
        ...degs.map((d, i) => `ق(∠${lbls[i]}) = ${d}°`),
        `ق(∠${lbls[n - 1]}) = ؟`,
      ];
    }
    return [];
  }

  // الحالة د: مضلع منتظم بطول ضلع صريح (دون محيط أو حساب زاوية مجرد)
  if (/منتظم/.test(plain)) {
    const cleanLenSrc = body.replace(/محيط[هـا]?[^،؛.\n]{0,30}\d+(?:\.\d+)?\s*(?:سم|م)/g, " ");
    const sideM = cleanLenSrc.match(/طول\s+ضلع[هـا]?\s*(?:يساوي|=)?\s*(\d+(?:\.\d+)?)\s*(سم|م|كم|مم|ديسم)?/);
    if (sideM) {
      return [`${word} منتظم ${lbls}`, `AB = ${sideM[1]} ${sideM[2] || "سم"}`];
    }
  }

  return [];
}
