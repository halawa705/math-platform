/**
 * @file prompt-dual-rays-and-segments-extractor.ts
 * @description مستخرج ذري متخصص في التقاطعات المزدوجة على الأقطار والأضلاع، والموازي المرسوم من نقطة،
 * والقطع المستقيمة المرسومة صراحةً، ومسائل التطبيقات الحياتية للمتوسطات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 170 سطراً).
 */

export const MODULE_ID_PROMPT_DUAL_RAYS_AND_SEGMENTS_EXTRACTOR =
  "prompt_dual_rays_and_segments_extractor" as const;

function pushFact(facts: string[], fact: string): void {
  const clean = fact.replace(/\s+/g, " ").trim();
  if (clean && !facts.includes(clean)) facts.push(clean);
}

/**
 * يستخرج حقائق التقاطع المزدوج، الموازي من منتصف، والقطع المرسومة، وتطبيقات المتوسطات اللفظية.
 */
export function extractPromptDualRaysAndSegmentsFacts(
  normClean: string,
  normAssert: string,
  triLabels: readonly [string, string, string] | null,
  quadLabels: string
): string[] {
  const facts: string[] = [];
  const combined = `${normAssert}\n${normClean}`;

  // 1. منتصفات بصياغات موسّعة («D منتصف الضلع BC»، «X هي نقطة منتصف الضلع LM»، «D منتصف الوتر AC»)
  for (const mm of normAssert.matchAll(
    /\b([A-Z])\s*(?:هي\s*)?(?:نقطة\s*)?منتصف\s*(?:الضلع|القطعة(?:\s*المستقيمة)?|الوتر|القاعدة|الحافة(?:\s*المقابلة)?)\s*([A-Z]{2})\b/g
  )) {
    pushFact(facts, `${mm[1].toUpperCase()} منتصف ${mm[2].toUpperCase()}`);
  }

  // 1ب. أطوال المتوسطات الموصوفة بـ «طوله / طوله الكلي» والمثلث متساوي الأضلاع
  for (const medLenM of normAssert.matchAll(
    /\b([A-Z]{2})\s+متوسط(?:[^.،؛;\n]{0,35}?)\s*طوله(?:\s*الكلي)?\s*(?:يساوي|=)?\s*(\([^()]{1,28}\)|\d+(?:\.\d+)?(?:\s*√\s*\d+)?)\s*(سم|متر|متراً|م)?/g
  )) {
    const u = /متر|متراً|^م$/.test(medLenM[3] || "") ? "م" : "سم";
    pushFact(facts, `${medLenM[1].toUpperCase()} = ${medLenM[2].trim()} ${u}`);
  }
  const equiSideM = normAssert.match(
    /مثلث\s*([A-Z]{3})\s*متساوي\s*الأضلاع\s*(?:طول\s*)?ضلعه\s*(?:يساوي|=)?\s*(\d+(?:\.\d+)?)\s*(سم|م)?/
  );
  if (equiSideM) {
    const tri = equiSideM[1].toUpperCase();
    const u = equiSideM[3] === "م" ? "م" : "سم";
    pushFact(facts, `${tri[0]}${tri[1]} = ${equiSideM[2]} ${u}`);
    const singleMedM = normAssert.match(
      /طول\s*المتوسط(?:\s*الواحد)?\s*(?:يساوي|=)?\s*(\d+(?:\.\d+)?\s*√\s*\d+|\d+(?:\.\d+)?)\s*(سم|م)?/
    );
    if (singleMedM) {
      pushFact(facts, `${tri[0]}D = ${singleMedM[1].replace(/\s+/g, "")} ${singleMedM[2] === "م" ? "م" : "سم"}`);
    }
  }

  // 2. دعامة أو قطعة تمتد من رأس القائمة B إلى منتصف الحافة المقابلة D (حاول 59)
  if (triLabels) {
    for (const oppMid of normAssert.matchAll(
      /من\s*(?:الرأس\s*(?:القائم\s*)?)?([A-Z])\s*إلى\s*منتصف\s*(?:الحافة|الضلع|القاعدة)\s*(?:المقابلة?\s*)?([A-Z])\b/g
    )) {
      const apex = oppMid[1].toUpperCase();
      const foot = oppMid[2].toUpperCase();
      if (triLabels.includes(apex) && !triLabels.includes(foot)) {
        const opp = triLabels.filter((v) => v !== apex);
        pushFact(facts, `${foot} منتصف ${opp[0]}${opp[1]}`);
        pushFact(facts, `${apex}${foot} متوسط`);
        pushFact(facts, `ارسم ${apex}${foot}`);
      }
    }
  }

  // 3. تقاطع قطعتين مرسومتين مع قطر أو ضلع في نقطتين على الترتيب (حاول 52، واجب 17)
  // مثال: «رُسمت القطعتان DX و BY لتقطعا القطر AC في P و Q على الترتيب»
  for (const dualCut of combined.matchAll(
    /(?:رسمت|وصلت)?\s*(?:القطعتان|المستقيمان|الشعاعان)?\s*\b([A-Z]{2})\s*(?:و|،|,)\s*([A-Z]{2})\s*(?:ل?تقطعا|ل?يقطعا|تقطعان|يقطعان)\s*(?:القطر|الضلع|القطعة|المستقيم)?\s*\b([A-Z]{2})\s*في\s*(?:النقطتين\s*|النقط\s*)?\b([A-Z])\s*(?:و|،|,)\s*([A-Z])\b/g
  )) {
    const s1 = dualCut[1].toUpperCase();
    const s2 = dualCut[2].toUpperCase();
    const target = dualCut[3].toUpperCase();
    const p1 = dualCut[4].toUpperCase();
    const p2 = dualCut[5].toUpperCase();
    pushFact(facts, `ارسم ${target}`);
    pushFact(facts, `ارسم ${s1}`);
    pushFact(facts, `ارسم ${s2}`);
    pushFact(facts, `${s1} ∩ ${target} = {${p1}}`);
    pushFact(facts, `${s2} ∩ ${target} = {${p2}}`);
  }

  // 4. رسم من نقطة D خط/شعاع/قطعة يوازي AB ليقطع BC في E (واجب 8)
  for (const parCut of combined.matchAll(
    /(?:رسم|نرسم)?\s*من\s*(?:النقطة\s*)?\b([A-Z])\s*(?:خط|مستقيم|شعاع|قطعة)?\s*(?:يوازي|توازي|\/\/)\s*(?:الضلع\s*|القطعة\s*)?\b([A-Z]{2})\s*(?:ل?يقطع|ل?تقطع|و?يقطع|و?تقطع)\s*(?:الضلع\s*|القطعة\s*)?\b([A-Z]{2})\s*في\s*(?:النقطة\s*)?\b([A-Z])\b/g
  )) {
    const fromPt = parCut[1].toUpperCase();
    const baseSeg = parCut[2].toUpperCase();
    const targetSeg = parCut[3].toUpperCase();
    const hitPt = parCut[4].toUpperCase();
    pushFact(facts, `${hitPt} ∈ ${targetSeg}`);
    pushFact(facts, `${fromPt}${hitPt} // ${baseSeg}`);
    pushFact(facts, `ارسم ${fromPt}${hitPt}`);
  }

  // 5. القطع المستقيمة المرسومة صراحةً («ورُسمت القطعة المستقيمة KX»، «رُسمت القطعة AE»)
  for (const drawn of combined.matchAll(
    /(?:رسمت?|نرسم|وصلت?)\s+(?:القطعة(?:\s*المستقيمة)?|الشعاع|المستقيم)\s+\b([A-Z]{2})\b/g
  )) {
    pushFact(facts, `ارسم ${drawn[1].toUpperCase()}`);
  }

  // 6. الأشعة المارة من رأس عبر نقطة التلاقي وتقاطعات المتوسطات داخل مثلث أو شكل رباعي
  if (triLabels || quadLabels.length === 4) {
    for (const raym of combined.matchAll(
      /(?:مد\s*|رسم\s*)?(?:الشعاع|المستقيم|القطعة|المتوسط)?\s*(?:المار\s*(?:من|بـ?)\s*([A-Z])\s*(?:عبر|مرورا\s*بـ?)\s*([A-Z])|(?<!توازي\s|يوازي\s|موازيا\s)\b([A-Z]{2}))\s*(?:ل?يقطع|ل?تقطع)\s*(?:الضلع\s*|المستقيم\s*|القطعة\s*|القطر\s*)?([A-Z]{2})\s*(?:في|عند)\s*(?:النقطة\s*)?([A-Z])\b(?![\s,،و]*[A-Z]\b)(?!\s*(?:و|ثم)\s*(?:ل?يقطع|ل?تقطع))/g
    )) {
      if (!raym[1] && !/(?:الشعاع|المستقيم|القطعة|المتوسط)\s+[A-Z]{2}/.test(raym[0])) continue;
      const cutter = raym[1] && raym[2] ? `${raym[1]}${raym[2]}`.toUpperCase() : raym[3]?.toUpperCase();
      const target = raym[4]?.toUpperCase(); const pt = raym[5]?.toUpperCase();
      if (!cutter || !target || !pt || cutter === target) continue;
      pushFact(facts, `ارسم ${cutter}`);
      pushFact(facts, `ارسم ${target}`);
      pushFact(facts, `${cutter} ∩ ${target} = {${pt}}`);
    }

    for (const inter of combined.matchAll(
      /(?:تقاطعت?|فتقاطعت?|يتقاطع)\s*(?:القطعة\s*|الشعاع\s*|المستقيم\s*)?([A-Z]{2})?\s*مع\s*(?:القطر\s*|الضلع\s*|القطعة\s*|المستقيم\s*)?([A-Z]{2})\s*(?:في|عند)\s*(?:النقطة\s*)?([A-Z])\b/g
    )) {
      const s2 = inter[2].toUpperCase(); const pt = inter[3].toUpperCase();
      let s1 = inter[1]?.toUpperCase();
      if (!s1 && inter.index !== undefined) {
        const before = combined.slice(Math.max(0, inter.index - 45), inter.index);
        const prevSegs = [...before.matchAll(/(?:القطعة|الشعاع|المستقيم)\s+([A-Z]{2})\b/g)];
        if (prevSegs.length > 0) s1 = prevSegs[prevSegs.length - 1][1].toUpperCase();
      }
      if (!s1 || s1 === s2) continue;
      pushFact(facts, `ارسم ${s1}`);
      pushFact(facts, `ارسم ${s2}`);
      pushFact(facts, `${s1} ∩ ${s2} = {${pt}}`);
    }
  }

  // 7. عند ذكر زاوية بثلاثة أحرف في شكل رباعي (مثل m(∠CAD) = 90°) أو مثلث مطلوب في مسألة متوسطات نضمن توصيل أضلاعه
  if (quadLabels.length === 4) {
    for (const angRef of normClean.matchAll(/(?:∠|زاوية)\s*([A-Z]{3})\b/g)) {
      const [u, v, w] = angRef[1].toUpperCase().split("");
      if (u !== v) pushFact(facts, `ارسم ${u}${v}`);
      if (v !== w) pushFact(facts, `ارسم ${v}${w}`);
    }
  }
  if (triLabels && /متوسط|نقطة\s*(?:تلاقي|تقاطع)\s*(?:ال)?متوسطات/.test(combined)) {
    for (const triRef of normClean.matchAll(/(?:محيط|مساحة(?:\s*سطح)?)\s*(?:ال)?مثلث\s*([A-Z]{3})\b/g)) {
      const [u, v, w] = triRef[1].toUpperCase().split("");
      if ([u, v, w].sort().join("") === [...triLabels].sort().join("")) continue;
      pushFact(facts, `ارسم ${u}${v}`);
      pushFact(facts, `ارسم ${v}${w}`);
      pushFact(facts, `ارسم ${u}${w}`);
    }
  }

  return facts;
}
