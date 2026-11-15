/**
 * @file prompt-medians-and-rays-extractor.ts
 * @description مستخرج ذري متخصص في متوسطات المثلث، نقطة تلاقي المتوسطات بنسبة (2:1)،
 * تعامد المتوسطات، تقاطع أقطار الأشكال الرباعية، والنسب الجبرية (مثل AN = 2NM)،
 * وقواطع الأشعة والمستقيمات، مرتبة طوبولوجياً قبل تجميع الحقائق.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 240 سطراً).
 */

export const MODULE_ID_PROMPT_MEDIANS_AND_RAYS_EXTRACTOR =
  "prompt_medians_and_rays_extractor" as const;

function pushUniqueFact(facts: string[], fact: string): void {
  const clean = fact.replace(/\s+/g, " ").trim();
  if (clean && !facts.includes(clean)) facts.push(clean);
}

function inferTriangleMedianApexAndOpposite(
  seg: string,
  triLabels: readonly [string, string, string] | null
): { apex: string; foot: string; opp: readonly [string, string] | null } {
  const a = seg[0].toUpperCase();
  const b = seg[1].toUpperCase();
  if (!triLabels) return { apex: a, foot: b, opp: null };
  const inA = triLabels.includes(a);
  const inB = triLabels.includes(b);
  if (inA && !inB) {
    const rest = triLabels.filter((v) => v !== a);
    return { apex: a, foot: b, opp: [rest[0], rest[1]] };
  }
  if (inB && !inA) {
    const rest = triLabels.filter((v) => v !== b);
    return { apex: b, foot: a, opp: [rest[0], rest[1]] };
  }
  return { apex: a, foot: b, opp: null };
}

/**
 * يستخرج حقائق المتوسطات وتقاطع الأقطار والنسب والأشعة القاطعة بترتيب اعتمادي سليم.
 */
export function extractPromptMediansAndRaysFacts(
  normClean: string,
  normAssert: string
): string[] {
  const facts: string[] = [];
  const combined = `${normAssert}\n${normClean}`;

  const triM = combined.match(/(?:مثلث|Δ|△)\s*([A-Z]{3})\b/);
  const triLabels: readonly [string, string, string] | null = triM
    ? [triM[1][0], triM[1][1], triM[1][2]]
    : null;
  const quadM = combined.match(
    /(?:متوازي\s*أضلاع|مستطيل|معين|مربع|شبه\s*منحرف|شكل\s*رباعي)\s*(?:قائم[^A-Z]{0,18})?\b([A-Z]{4})\b/
  );
  const quadLabels = quadM?.[1] ?? "";

  // 1. تقاطع قطري الشكل الرباعي أولاً لتعريف نقطة المركز M قبل أي نسب أو أشعة عليها
  if (quadLabels.length === 4) {
    const diagMeet = combined.match(
      /(?:تقاطع\s*(?:القطران|قطراه|قطراها)|قطراه\s*(?:ن|يت)تقاطعان)\s*(?:في|عند)\s*(?:النقطة\s*)?([A-Z])\b/
    );
    if (diagMeet?.[1]) {
      const mPt = diagMeet[1].toUpperCase();
      pushUniqueFact(facts, `قطرا الشكل يتقاطعان في ${mPt}`);
      pushUniqueFact(facts, `ارسم ${quadLabels[0]}${quadLabels[2]}`);
      pushUniqueFact(facts, `ارسم ${quadLabels[1]}${quadLabels[3]}`);
    }
  }

  // 2. استخلاص المتوسطات ونقطة تلاقيها M/G وتعريف منتصفات الأضلاع المقابلة
  const discoveredMedians: string[] = [];
  const registerMedian = (segRaw: string) => {
    const seg = segRaw.toUpperCase();
    if (seg.length !== 2 || seg[0] === seg[1]) return;
    if (!discoveredMedians.includes(seg)) discoveredMedians.push(seg);
    const { apex, foot, opp } = inferTriangleMedianApexAndOpposite(seg, triLabels);
    if (opp) {
      pushUniqueFact(facts, `${foot} منتصف ${opp[0]}${opp[1]}`);
      pushUniqueFact(facts, `${apex}${foot} متوسط`);
    } else {
      pushUniqueFact(facts, `${seg} متوسط`);
    }
  };

  let declaredCentroid: string | null = null;
  const centroidDecl = combined.match(
    /\b([A-Z])\s*(?:هي\s*)?نقطة\s*(?:تلاقي|تقاطع)\s*(?:ال)?متوسطات/
  );
  if (centroidDecl?.[1]) declaredCentroid = centroidDecl[1].toUpperCase();

  for (const pm of combined.matchAll(
    /(?:المتوسطان|متوسطان)\s*([A-Z]{2})\s*(?:و|،|,)\s*([A-Z]{2})(?:[^؛.\n]{0,35}?(?:تقاطعا|يتقاطعان|لتقاطعا)\s*(?:في|عند)\s*(?:النقطة\s*)?([A-Z])\b)?/g
  )) {
    registerMedian(pm[1]);
    registerMedian(pm[2]);
    const meet = (pm[3] || declaredCentroid)?.toUpperCase();
    if (meet) {
      declaredCentroid = meet;
      pushUniqueFact(facts, `${pm[1].toUpperCase()} ∩ ${pm[2].toUpperCase()} = {${meet}}`);
    }
  }

  for (const tm of combined.matchAll(
    /(?:متوسطاته\s*الثلاثة|المتوسطات\s*الثلاثة)\s*([A-Z]{2})\s*[,،و]\s*([A-Z]{2})\s*[,،و]\s*([A-Z]{2})(?:[^؛.\n]{0,35}?(?:في|عند)\s*(?:النقطة\s*)?([A-Z])\b)?/g
  )) {
    registerMedian(tm[1]);
    registerMedian(tm[2]);
    registerMedian(tm[3]);
    const meet = (tm[4] || declaredCentroid)?.toUpperCase();
    if (meet) {
      declaredCentroid = meet;
      pushUniqueFact(facts, `${tm[1].toUpperCase()} ∩ ${tm[2].toUpperCase()} = {${meet}}`);
    }
  }

  for (const sm of combined.matchAll(
    /(?:رُسم\s*|رسم\s*)?(?:ال)?متوسط(?:اً|ا)?\s+([A-Z]{2})\b|\b([A-Z]{2})\s+متوسط(?:اً|ا)?\b/g
  )) {
    registerMedian(sm[1] || sm[2]);
  }

  // تعامد متوسطين عند نقطة التلاقي: AD ⊥ BE عند M
  const hasMedianCtx = /متوسط|نقطة\s*(?:تلاقي|تقاطع)\s*(?:ال)?متوسطات/.test(combined);
  if (hasMedianCtx) {
    for (const perpm of combined.matchAll(
      /\b([A-Z]{2})\s*(?:⊥|عمودي\s*على|متعامد(?:ان|ين)?)\s*(?:على|مع)?\s*([A-Z]{2})\s*(?:عند|في)\s*(?:النقطة\s*)?([A-Z])\b/g
    )) {
      registerMedian(perpm[1]);
      registerMedian(perpm[2]);
      const meet = perpm[3].toUpperCase();
      declaredCentroid = meet;
      pushUniqueFact(facts, `${perpm[1].toUpperCase()} ⊥ ${perpm[2].toUpperCase()}`);
      pushUniqueFact(facts, `${perpm[1].toUpperCase()} ∩ ${perpm[2].toUpperCase()} = {${meet}}`);
    }
  }

  // إذا تقاطع المتوسطان بدون ذكر كلمة "تقاطعا" وكانت نقطة التلاقي M/G مذكورة
  if (declaredCentroid && discoveredMedians.length >= 2) {
    pushUniqueFact(facts, `${discoveredMedians[0]} ∩ ${discoveredMedians[1]} = {${declaredCentroid}}`);
  } else if (declaredCentroid && discoveredMedians.length === 1) {
    const { apex, foot } = inferTriangleMedianApexAndOpposite(discoveredMedians[0], triLabels);
    pushUniqueFact(facts, `${declaredCentroid} ∈ ${apex}${foot}`);
    pushUniqueFact(facts, `${apex}${declaredCentroid} : ${declaredCentroid}${foot} = 2 : 1`);
  }

  // 3. نسب تقسيم نقطة على قطعة/متوسط: M ∈ AD بنسبة 2:1 من جهة الرأس A، أو معادلة مثل AN = 2NM
  for (const rm of combined.matchAll(
    /\b([A-Z])\s*∈\s*([A-Z]{2})[^؛.\n]{0,50}?بنسبة\s*(\d+)\s*:\s*(\d+)(?:\s*من\s*جهة\s*(?:ال)?(رأس|قاعدة)(?:\s*([A-Z]))?)?/g
  )) {
    const p = rm[1].toUpperCase();
    const s = rm[2].toUpperCase();
    const n1 = Number(rm[3]);
    const n2 = Number(rm[4]);
    const sideWord = rm[5] || "رأس";
    const explicitEnd = rm[6]?.toUpperCase();
    const defaultHead = triLabels && triLabels.includes(s[1]) && !triLabels.includes(s[0]) ? s[1] : s[0];
    const head = explicitEnd && s.includes(explicitEnd) ? explicitEnd : defaultHead;
    const tail = head === s[0] ? s[1] : s[0];
    const ratioLeft = sideWord === "قاعدة" ? n2 : n1;
    const ratioRight = sideWord === "قاعدة" ? n1 : n2;
    pushUniqueFact(facts, `${p} ∈ ${s}`);
    pushUniqueFact(facts, `${head}${p} : ${p}${tail} = ${ratioLeft} : ${ratioRight}`);
  }

  for (const eqm of combined.matchAll(/\b([A-Z]{2})\s*=\s*(\d+(?:\.\d+)?)\s*([A-Z]{2})\b/g)) {
    const s1 = eqm[1].toUpperCase();
    const factor = Number(eqm[2]);
    const s2 = eqm[3].toUpperCase();
    if (s1 === s2 || !(factor > 0)) continue;
    const shared = [s1[0], s1[1]].filter((ch) => s2.includes(ch));
    if (shared.length !== 1) continue;
    const p = shared[0];
    const a = s1[0] === p ? s1[1] : s1[0];
    const b = s2[0] === p ? s2[1] : s2[0];
    if (a === b || a === p || b === p) continue;
    pushUniqueFact(facts, `ارسم ${a}${b}`);
    pushUniqueFact(facts, `${p} ∈ ${a}${b}`);
    pushUniqueFact(facts, `${a}${p} : ${p}${b} = ${factor} : 1`);
  }

  // 4. الأشعة المارة من رأس عبر نقطة التلاقي وتقاطعات المتوسطات داخل مثلث أو شكل رباعي معلن فقط
  if (triLabels || quadLabels.length === 4) {
    for (const raym of combined.matchAll(
      /(?:الشعاع|المستقيم|القطعة)?\s*(?:المار\s*(?:من|بـ?)\s*([A-Z])\s*(?:عبر|مروراً\s*بـ?)\s*([A-Z])|(?<!توازي\s|يوازي\s|موازياً\s|موازيا\s)\b([A-Z]{2}))\s*(?:ل?يقطع|ل?تقطع)\s*(?:الضلع\s*|المستقيم\s*|القطعة\s*|القطر\s*)?([A-Z]{2})\s*(?:في|عند)\s*(?:النقطة\s*)?([A-Z])\b(?![\s,،و]*[A-Z]\b)(?!\s*(?:و|ثم)\s*(?:ل?يقطع|ل?تقطع))/g
    )) {
      if (!raym[1] && !/(?:الشعاع|المستقيم|القطعة)\s+[A-Z]{2}/.test(raym[0])) continue;
      const cutter = raym[1] && raym[2] ? `${raym[1]}${raym[2]}`.toUpperCase() : raym[3]?.toUpperCase();
      const target = raym[4]?.toUpperCase();
      const pt = raym[5]?.toUpperCase();
      if (!cutter || !target || !pt || cutter === target) continue;
      pushUniqueFact(facts, `ارسم ${cutter}`);
      pushUniqueFact(facts, `ارسم ${target}`);
      pushUniqueFact(facts, `${cutter} ∩ ${target} = {${pt}}`);
    }

    for (const inter of combined.matchAll(
      /(?:تقاطعت?|يتقاطع)\s*(?:القطعة\s*|الشعاع\s*|المستقيم\s*)?([A-Z]{2})\s*(?:مع|و)\s*(?:القطر\s*|الضلع\s*|القطعة\s*|المستقيم\s*)?([A-Z]{2})\s*(?:في|عند)\s*(?:النقطة\s*)?([A-Z])\b/g
    )) {
      const s1 = inter[1].toUpperCase();
      const s2 = inter[2].toUpperCase();
      const pt = inter[3].toUpperCase();
      if (s1 === s2) continue;
      pushUniqueFact(facts, `ارسم ${s1}`);
      pushUniqueFact(facts, `ارسم ${s2}`);
      pushUniqueFact(facts, `${s1} ∩ ${s2} = {${pt}}`);
    }
  }

  return facts;
}
