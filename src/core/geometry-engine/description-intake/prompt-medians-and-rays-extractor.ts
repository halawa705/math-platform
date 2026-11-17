/**
 * @file prompt-medians-and-rays-extractor.ts
 * @description مستخرج ذري متخصص في متوسطات المثلث، نقطة تلاقي المتوسطات بنسبة (2:1)،
 * تعامد المتوسطات، تقاطع أقطار الأشكال الرباعية، والنسب الجبرية (مثل AN = 2NM)،
 * وقواطع الأشعة والمستقيمات، مرتبة طوبولوجياً قبل تجميع الحقائق.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 255 سطراً).
 */

import { extractPromptDualRaysAndSegmentsFacts } from "./prompt-dual-rays-and-segments-extractor";

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

  const triM =
    combined.match(/(?:مثلثة?(?:\s*الشكل)?|Δ|△)\s*(?:متساوي\s*(?:الساقين|الأضلاع)\s*|قائم(?:\s*الزاوية)?\s*|مختلف\s*الأضلاع\s*)*\b([A-Z]{3})\b/) ??
    combined.match(/\b([A-Z]{3})\s+مثلث/);
  const triLabels: readonly [string, string, string] | null = triM
    ? [triM[1][0], triM[1][1], triM[1][2]]
    : null;
  if (triLabels) {
    const isIso = /متساوي\s*الساقين/.test(normAssert);
    const isEqui = /متساوي\s*الأضلاع/.test(normAssert);
    const rightM = normAssert.match(/قائمة?(?:\s*الزاوية)?\s*(?:في|عند)\s*([A-Z])\b/);
    if (rightM?.[1]) {
      pushUniqueFact(facts, `مثلث ${triLabels.join("")} قائم في ${rightM[1].toUpperCase()}`);
    } else if (isEqui) {
      pushUniqueFact(facts, `مثلث ${triLabels.join("")} متساوي الأضلاع`);
    } else if (isIso) {
      pushUniqueFact(facts, `مثلث ${triLabels.join("")} متساوي الساقين`);
      pushUniqueFact(facts, `${triLabels[0]}${triLabels[1]} = ${triLabels[0]}${triLabels[2]}`);
    } else {
      pushUniqueFact(facts, `مثلث ${triLabels.join("")}`);
    }
  }

  const quadM =
    combined.match(
      /(?:متوازي\s*أضلاع|مستطيل|معين|مربع|شبه\s*منحرف|شكل\s*رباعي)\s*(?:قائم[^A-Z]{0,18}|متساوي\s*الساقين\s*)?\b([A-Z]{4})\b/
    ) ??
    combined.match(
      /\b([A-Z]{4})\s+(?:متوازي\s*أضلاع|مستطيل|معين|مربع|شبه\s*منحرف|شكل\s*رباعي)/
    );
  const quadLabels = quadM?.[1] ?? "";

  // 1. تقاطع قطري الشكل الرباعي أولاً لتعريف نقطة المركز M قبل أي نسب أو أشعة عليها
  if (quadLabels.length === 4) {
    const diagMeet = combined.match(
      /(?:تقاطع\s*(?:القطران|قطراه|قطراها)|(?:القطران|قطراه|قطراها)\s*(?:متقاطعان|يتقاطعان))\s*(?:في|عند)\s*(?:النقطة\s*)?([A-Z])\b/
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
  const assignedFeet = new Set<string>();
  const registerMedian = (segRaw: string) => {
    const seg = segRaw.toUpperCase();
    if (seg.length !== 2 || seg[0] === seg[1]) return;
    const { apex, foot, opp } = inferTriangleMedianApexAndOpposite(seg, triLabels);
    if (assignedFeet.has(foot) && !discoveredMedians.includes(`${apex}${foot}`)) return;
    const canonicalSeg = `${apex}${foot}`;
    if (!discoveredMedians.includes(canonicalSeg)) discoveredMedians.push(canonicalSeg);
    assignedFeet.add(foot);
    if (opp) {
      pushUniqueFact(facts, `${foot} منتصف ${opp[0]}${opp[1]}`);
      pushUniqueFact(facts, `${apex}${foot} متوسط`);
    } else {
      pushUniqueFact(facts, `${seg} متوسط`);
    }
  };

  let declaredCentroid: string | null = null;
  const centroidDecl =
    combined.match(/\b([A-Z])\s*(?:هي\s*)?نقطة\s*(?:تلاقي|تقاطع)\s*(?:متوسطات(?:\s*المثلث)?|متوسطات[هـا]{1,2}|(?:ال)?متوسطات)/) ??
    combined.match(/(?:تقاطعت|تتقاطع|تتلاقى|تلاقت)\s*(?:متوسطات[هـا]{1,2}(?:\s*الثلاثة)?|المتوسطات(?:\s*الثلاثة)?|فيه\s*المتوسطات|جميعها)\s*(?:جميعها\s*)?(?:في|عند)\s*(?:النقطة\s*|(?:ال)?نوافير\s*المركزية\s*|(?:ال)?نافورة\s*المركزية\s*)?([A-Z])\b/) ??
    combined.match(/(?:متوسطات[هـا]{1,2}|المتوسطات)\s*(?:تتقاطع|تقاطعت|تتلاقى|تلاقت)\s*(?:في|عند)\s*(?:النقطة\s*)?([A-Z])\b/) ??
    combined.match(/نقطة\s*(?:تلاقي|تقاطع)\s*(?:متوسطات(?:\s*المثلث)?|متوسطات[هـا]{1,2}|(?:ال)?متوسطات)\s*\(?([A-Z])\)?/);
  if (centroidDecl?.[1]) declaredCentroid = centroidDecl[1].toUpperCase();

  for (const pm of combined.matchAll(
    /(?:(?:تقاطع|تقاطعت)\s*)?(?:المتوسطان|متوسطان|القطعتان|رسمت?\s*(?:القطعتان\s*)?)\s*\b([A-Z]{2})\s*(?:و|،|,)\s*([A-Z]{2})(?:[^؛.\n]{0,40}?(?:تقاطعا|فتقاطعا|فتقاطعتا|يتقاطعان|لتقاطعا|متعامدان|متعامدين|في|عند)\s*(?:في|عند)?\s*(?:النقطة\s*)?([A-Z])\b)?/g
  )) {
    if (!pm[3] && !/متوسط/.test(pm[0])) continue;
    registerMedian(pm[1]);
    registerMedian(pm[2]);
    const meet = (pm[3] || declaredCentroid)?.toUpperCase();
    if (meet) {
      declaredCentroid = meet;
      pushUniqueFact(facts, `${pm[1].toUpperCase()} ∩ ${pm[2].toUpperCase()} = {${meet}}`);
    }
    if (/متعامد/.test(pm[0])) {
      pushUniqueFact(facts, `${pm[1].toUpperCase()} ⊥ ${pm[2].toUpperCase()}`);
    }
  }

  for (const tm of combined.matchAll(
    /(?:متوسطاته\s*الثلاثة|المتوسطات\s*الثلاثة|تمثل\s*متوسطات\s*المثلث)\s*([A-Z]{2})\s*[,،و]\s*([A-Z]{2})\s*[,،و]\s*([A-Z]{2})(?:[^؛.\n]{0,45}?(?:في|عند)\s*(?:النقطة(?:\s*المركزية)?\s*)?([A-Z])\b)?/g
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
    /(?:رسم\s*)?(?:ال)?متوسط(?:ا)?(?:\s*الرأسي(?:\s*للوحة)?)?\s+\b([A-Z]{2})\b|\b([A-Z]{2})\s+متوسط(?:ا)?(?=$|[\s،,.;؛)!])/g
  )) {
    registerMedian(sm[1] || sm[2]);
  }
  if (!declaredCentroid && discoveredMedians.length >= 1) {
    const seqMeet = combined.match(/متوسط[^.\n]{0,35}?(?:تقاطعا|فتقاطعا|يتقاطعان|تتقاطع(?:\s*فيه\s*المتوسطات)?)\s*(?:في|عند)\s*(?:النقطة\s*)?([A-Z])\b/);
    if (seqMeet?.[1]) declaredCentroid = seqMeet[1].toUpperCase();
  }

  // تقاطع متوسطين بصيغة «AD تقاطع BE في النقطة M» أو «تقاطع AD و BE في النقطة M» داخل مثلث
  if (triLabels) {
    for (const dm of combined.matchAll(
      /(?:تقاطع\s+\b([A-Z]{2})\s*و\s*\b([A-Z]{2})|\b([A-Z]{2})\s+تقاطع\s+\b([A-Z]{2}))\s*(?:في|عند)\s*(?:النقطة\s*)?\b([A-Z])\b/g
    )) {
      const s1 = (dm[1] || dm[3]).toUpperCase();
      const s2 = (dm[2] || dm[4]).toUpperCase();
      const meet = dm[5].toUpperCase();
      if (triLabels.some((v) => s1.includes(v)) && triLabels.some((v) => s2.includes(v))) {
        registerMedian(s1);
        registerMedian(s2);
        declaredCentroid = declaredCentroid ?? meet;
        pushUniqueFact(facts, `${s1} ∩ ${s2} = {${meet}}`);
      }
    }
  }

  // تعامد متوسطين: AD ⊥ BE (عند M أو بوجود M نقطة تلاقي المتوسطات)
  const hasMedianCtx = /متوسط|نقطة\s*(?:تلاقي|تقاطع)\s*(?:ال)?متوسطات/.test(combined);
  if (hasMedianCtx) {
    for (const perpm of combined.matchAll(
      /\b([A-Z]{2})\s*(?:⊥|عمودي\s*على|متعامد(?:ان|ين)?)\s*(?:على|مع)?\s*([A-Z]{2})(?:\s*(?:عند|في)\s*(?:النقطة\s*)?([A-Z])\b)?/g
    )) {
      registerMedian(perpm[1]);
      registerMedian(perpm[2]);
      const meet = (perpm[3] || declaredCentroid)?.toUpperCase();
      if (meet) {
        declaredCentroid = meet;
        pushUniqueFact(facts, `${perpm[1].toUpperCase()} ∩ ${perpm[2].toUpperCase()} = {${meet}}`);
      }
      pushUniqueFact(facts, `${perpm[1].toUpperCase()} ⊥ ${perpm[2].toUpperCase()}`);
    }
  }

  // استكمال المتوسطات تلقائياً عند وجود نقطة تلاقي المتوسطات M/G في المثلث
  if (triLabels && declaredCentroid) {
    for (const midFact of combined.matchAll(/\b([A-Z])\s*(?:هي\s*)?(?:نقطة\s*)?منتصف\s*(?:الضلع|الوتر|القطعة)?\s*\b([A-Z]{2})\b/g)) {
      const foot = midFact[1].toUpperCase();
      const side = midFact[2].toUpperCase();
      const oppApex = triLabels.find((v) => !side.includes(v));
      if (oppApex && !triLabels.includes(foot)) registerMedian(`${oppApex}${foot}`);
    }
    for (const twoMid of combined.matchAll(/\b([A-Z])\s*[,،و]\s*([A-Z])\s*(?:هما\s*)?(?:منتصفا|منتصفي)\s*(?:الضلعين\s*)?\b([A-Z]{2})\s*[,،و]\s*\b([A-Z]{2})\b/g)) {
      const f1 = twoMid[1].toUpperCase(); const s1 = twoMid[3].toUpperCase();
      const f2 = twoMid[2].toUpperCase(); const s2 = twoMid[4].toUpperCase();
      const a1 = triLabels.find((v) => !s1.includes(v));
      const a2 = triLabels.find((v) => !s2.includes(v));
      if (a1) registerMedian(`${a1}${f1}`);
      if (a2) registerMedian(`${a2}${f2}`);
    }
    const defaultFootForApex: Record<string, string> = { [triLabels[0]]: "D", [triLabels[1]]: "E", [triLabels[2]]: "F" };
    const defaultApexForFoot: Record<string, string> = { D: triLabels[0], E: triLabels[1], F: triLabels[2] };
    for (const tok of combined.matchAll(/\b([A-Z]{2,3})\b/g)) {
      const w = tok[1].toUpperCase();
      if (!w.includes(declaredCentroid)) continue;
      for (const ch of w) {
        if (ch === declaredCentroid) continue;
        if (triLabels.includes(ch)) {
          const alreadyHasFromApex = discoveredMedians.some((m) => m.startsWith(ch));
          const candFoot: string | undefined = defaultFootForApex[ch];
          if (!alreadyHasFromApex && candFoot && !assignedFeet.has(candFoot) && candFoot !== declaredCentroid && !triLabels.includes(candFoot)) {
            const checkFootMentioned = new RegExp(`\\b[A-Z]*${candFoot}[A-Z]*\\b`).test(combined);
            if (checkFootMentioned || discoveredMedians.length === 0) registerMedian(`${ch}${candFoot}`);
          }
        } else if (defaultApexForFoot[ch] && !assignedFeet.has(ch)) {
          registerMedian(`${defaultApexForFoot[ch]}${ch}`);
        }
      }
    }
    if (discoveredMedians.length === 0 && /متوسطات[هـا]{1,2}\s*الثلاثة|المتوسطات\s*الثلاثة/.test(combined)) {
      registerMedian(`${triLabels[0]}D`);
      registerMedian(`${triLabels[1]}E`);
    }
  }

  if (declaredCentroid && discoveredMedians.length >= 2) {
    pushUniqueFact(facts, `${discoveredMedians[0]} ∩ ${discoveredMedians[1]} = {${declaredCentroid}}`);
  } else if (declaredCentroid && discoveredMedians.length === 1) {
    const { apex, foot } = inferTriangleMedianApexAndOpposite(discoveredMedians[0], triLabels);
    pushUniqueFact(facts, `${declaredCentroid} ∈ ${apex}${foot}`);
    pushUniqueFact(facts, `${apex}${declaredCentroid} / ${declaredCentroid}${foot} = 2 / 1`);
  }

  // 3. نسب تقسيم نقطة على قطعة/متوسط: M ∈ AD بنسبة 2:1 من جهة الرأس A، أو معادلة مثل AN = 2NM
  for (const rm of combined.matchAll(
    /\b([A-Z])\s*∈\s*([A-Z]{2})[^؛.\n]{0,50}?بنسبة\s*(\d+)\s*:\s*(\d+)(?:\s*من\s*جهة\s*(?:ال)?(رأس|قاعدة)(?:\s*([A-Z]))?)?/g
  )) {
    const p = rm[1].toUpperCase(); const s = rm[2].toUpperCase();
    const n1 = Number(rm[3]); const n2 = Number(rm[4]);
    const sideWord = rm[5] || "رأس"; const explicitEnd = rm[6]?.toUpperCase();
    const defaultHead = triLabels && triLabels.includes(s[1]) && !triLabels.includes(s[0]) ? s[1] : s[0];
    const head = explicitEnd && s.includes(explicitEnd) ? explicitEnd : defaultHead;
    const tail = head === s[0] ? s[1] : s[0];
    pushUniqueFact(facts, `${p} ∈ ${s}`);
    pushUniqueFact(facts, `${head}${p} / ${p}${tail} = ${sideWord === "قاعدة" ? n2 : n1} / ${sideWord === "قاعدة" ? n1 : n2}`);
  }

  for (const eqm of combined.matchAll(/\b([A-Z]{2})\s*=\s*(\d+(?:\.\d+)?)\s*([A-Z]{2})\b/g)) {
    const s1 = eqm[1].toUpperCase(); const factor = Number(eqm[2]); const s2 = eqm[3].toUpperCase();
    if (s1 === s2 || !(factor > 0)) continue;
    const shared = [s1[0], s1[1]].filter((ch) => s2.includes(ch));
    if (shared.length !== 1) continue;
    const p = shared[0]; const a = s1[0] === p ? s1[1] : s1[0]; const b = s2[0] === p ? s2[1] : s2[0];
    if (a === b || a === p || b === p) continue;
    pushUniqueFact(facts, `ارسم ${a}${b}`);
    pushUniqueFact(facts, `${p} ∈ ${a}${b}`);
    pushUniqueFact(facts, `${a}${p} / ${p}${b} = ${factor} / 1`);
  }

  for (const df of extractPromptDualRaysAndSegmentsFacts(normClean, normAssert, triLabels, quadLabels)) {
    pushUniqueFact(facts, df);
  }

  return facts;
}
