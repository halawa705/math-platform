/**
 * @file prompt-midpoint-and-quad-extractor.ts
 * @description مستخرج مساعد لحقائق الأشكال الرباعية والمنتصفات المتعددة والمحيط/المساحة من متن المسألة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً (< 120 سطراً وفق AGENTS.md).
 */

import { extractPromptMediansAndRaysFacts } from "./prompt-medians-and-rays-extractor";

export const MODULE_ID_PROMPT_MIDPOINT_AND_QUAD_EXTRACTOR =
  "prompt_midpoint_and_quad_extractor" as const;

/**
 * يستخرج الأشكال الرباعية الصريحة، المحيط/المساحة، أطوال الأضلاع بالمتر، ومنتصفات الأضلاع المتعددة من النص النظيف.
 */
export function extractPromptQuadMidpointAndMeasureFacts(
  cleanPrompt: string,
  assertionsClean: string
): string[] {
  const facts: string[] = [];
  const normClean = cleanPrompt.replace(/\u00a0/g, " ");
  const normAssert = assertionsClean.replace(/\u00a0/g, " ");

  // 1. الأشكال الرباعية الصريحة (شبه منحرف ABCD، أو ABCD شبه منحرف، متوازي أضلاع EFGH...)
  for (const qm of normAssert.matchAll(
    /(شبه\s*منحرف|متوازي\s*أضلاع|مستطيل|معين|مربع|شكل\s*رباعي)\s*(?:قائم[^A-Z]{0,18})?\b([A-Z]{4})\b/g
  )) {
    const kind = qm[1].replace(/\s+/g, " ").trim();
    const lbl = qm[2].toUpperCase();
    const f = `${kind} ${lbl}`;
    if (!facts.includes(f)) facts.push(f);
  }
  for (const rqm of normAssert.matchAll(
    /\b([A-Z]{4})\s+(شبه\s*منحرف|متوازي\s*أضلاع|مستطيل|معين|مربع|شكل\s*رباعي)/g
  )) {
    const lbl = rqm[1].toUpperCase();
    const kind = rqm[2].replace(/\s+/g, " ").trim();
    const f = `${kind} ${lbl}`;
    if (!facts.includes(f)) facts.push(f);
  }

  // 2. أطوال بالمتر الصريح مثل AD = 30 متراً أو طول BC = 50 متراً
  for (const lm of normAssert.matchAll(
    /\b([A-Z]{2})\s*=\s*(\d+(?:\.\d+)?)\s*(متراً|مترا|أمتار|امتار|متر|م)(?![أ-يa-zA-Z])/g
  )) {
    const f = `${lm[1]} = ${lm[2]} م`;
    if (!facts.includes(f)) facts.push(f);
  }

  // 3. المحيط والمساحة الصريحة من المعطيات
  const perimM = normAssert.match(
    /محيط(?:ه|ها|\s*(?:ال)?(?:مثلث|مربع|مستطيل|شبه\s*منحرف|متوازي\s*أضلاع)\s*[A-Z]{0,4})?\s*(?:يساوي|=|تساوي)?\s*(\d+(?:\.\d+)?)\s*(سم|م)(?![أ-يa-zA-Z])/
  );
  if (perimM) {
    facts.push(`محيط = ${perimM[1]} ${perimM[2] === "م" ? "م" : "سم"}`);
  }
  const areaM = normAssert.match(
    /مساح(?:ة|ته|تها)(?:\s*الكلية|\s*سطح|\s*(?:ال)?(?:مثلث|مربع|مستطيل|شبه\s*منحرف|متوازي\s*أضلاع)\s*[A-Z]{0,4})*\s*(?:تساوي|يساوي|=)?\s*(\d+(?:\.\d+)?)\s*(سم|م)\s*[²2]?/
  );
  if (areaM) {
    facts.push(`مساحة = ${areaM[1]} ${areaM[2] === "م" ? "م²" : "سم²"}`);
  }

  // 4. مثلث مرسوم بربط منتصفات أضلاع مثلث آخر (مثل △DEF مرسوم بربط منتصفات أضلاع المثلث ABC)
  const nestedMidTriM = normClean.match(
    /(?:ال)?مثلث\s*([A-Z]{3})\s+(?:هو\s*)?(?:مثلث\s*)?(?:مرسوم\s*بربط|رؤوسه|الناتج\s*من\s*توصيل|بداخل)\s*(?:منتصفات\s*أضلاع\s*)?(?:ال)?مثلث\s*(?:الأصلي\s*|الأكبر\s*)?([A-Z]{3})\b/
  );
  if (nestedMidTriM) {
    const [D, E, F] = nestedMidTriM[1].split("");
    const [A, B, C] = nestedMidTriM[2].split("");
    facts.push(
      `مثلث ${A}${B}${C}`,
      `${D} منتصف ${A}${B}`,
      `${E} منتصف ${B}${C}`,
      `${F} منتصف ${A}${C}`,
      `ارسم ${D}${E}`,
      `ارسم ${E}${F}`,
      `ارسم ${F}${D}`
    );
  }

  // 4ب. منتصفات رباعية في شكل رباعي: K, L, M, N منتصفات الأضلاع AB, BC, CD, DA على الترتيب
  const quadVertexM = normAssert.match(/(?:شبه\s*منحرف|متوازي\s*أضلاع|مستطيل|معين|مربع|شكل\s*رباعي)\s*([A-Z]{4})\b/)
    ?? normAssert.match(/\b([A-Z]{4})\s+(?:شبه\s*منحرف|متوازي\s*أضلاع|مستطيل|معين|مربع|شكل\s*رباعي)/);
  const fourSidesMidM = normAssert.match(
    /([A-Z])\s*[,،]\s*([A-Z])\s*[,،]\s*([A-Z])\s*[,،و]\s*([A-Z])\s*(?:هي\s*|ك)?منتصفات\s*(?:أضلاعه(?:\s*الأربعة)?|الأضلاع|للأضلاع)(?:\s*(?:ال)?([A-Z]{2})\s*[,،]\s*([A-Z]{2})\s*[,،]\s*([A-Z]{2})\s*[,،و]\s*([A-Z]{2}))?/
  );
  if (fourSidesMidM) {
    const [, p1, p2, p3, p4, s1, s2, s3, s4] = fourSidesMidM;
    const q = quadVertexM ? quadVertexM[1] : "ABCD";
    const a = s1 ?? `${q[0]}${q[1]}`;
    const b = s2 ?? `${q[1]}${q[2]}`;
    const c = s3 ?? `${q[2]}${q[3]}`;
    const d = s4 ?? `${q[3]}${q[0]}`;
    facts.push(
      `${p1} منتصف ${a}`,
      `${p2} منتصف ${b}`,
      `${p3} منتصف ${c}`,
      `${p4} منتصف ${d}`,
      `ارسم ${p1}${p2}`,
      `ارسم ${p2}${p3}`,
      `ارسم ${p3}${p4}`,
      `ارسم ${p4}${p1}`
    );
  }

  // 4ج. منتصفات ثلاثية في مثلث: النقط X, Y, Z هي منتصفات أضلاعه الثلاثة / للأضلاع AB, BC, AC
  const triVertexM = nestedMidTriM ? [nestedMidTriM[0], nestedMidTriM[2]] : normAssert.match(/(?:مثلث|Δ)\s*([A-Z]{3})\b/);
  const explicitSidesMidM = !fourSidesMidM
    ? normAssert.match(
        /(?<![A-Z]\s*[,،]\s*)([A-Z])\s*[,،]\s*([A-Z])\s*[,،و]\s*([A-Z])\s*(?:هي\s*|ك)?منتصفات\s*(?:أضلاعه|الأضلاع|للأضلاع)\s*(?:ال)?([A-Z]{2})\s*[,،و]\s*([A-Z]{2})\s*[,،و]\s*([A-Z]{2})/
      )
    : null;
  if (explicitSidesMidM) {
    facts.push(
      `${explicitSidesMidM[1]} منتصف ${explicitSidesMidM[4]}`,
      `${explicitSidesMidM[2]} منتصف ${explicitSidesMidM[5]}`,
      `${explicitSidesMidM[3]} منتصف ${explicitSidesMidM[6]}`,
      `ارسم ${explicitSidesMidM[1]}${explicitSidesMidM[2]}`,
      `ارسم ${explicitSidesMidM[2]}${explicitSidesMidM[3]}`,
      `ارسم ${explicitSidesMidM[3]}${explicitSidesMidM[1]}`
    );
  } else if (triVertexM && !fourSidesMidM && !nestedMidTriM) {
    const [A, B, C] = triVertexM[1].split("");
    const threeMidM = normAssert.match(
      /(?<![A-Z]\s*[,،]\s*)([A-Z])\s*[,،]\s*([A-Z])\s*[,،و]\s*([A-Z])\s*(?:هي\s*)?منتصفات\s*أضلاعه(?:\s*الثلاثة)?/
    );
    if (threeMidM) {
      facts.push(
        `${threeMidM[1]} منتصف ${A}${B}`,
        `${threeMidM[2]} منتصف ${B}${C}`,
        `${threeMidM[3]} منتصف ${A}${C}`,
        `ارسم ${threeMidM[1]}${threeMidM[2]}`,
        `ارسم ${threeMidM[2]}${threeMidM[3]}`,
        `ارسم ${threeMidM[3]}${threeMidM[1]}`
      );
    }
  }

  // 5. ممر / كابل / قطعة تصل بين منتصفي ضلعين أو جانبي جسر أو نقطة في منتصف ممر موصلة بركنين
  const parallelBasesM = normClean.match(
    /(?:القاعدتان|الدعامتان|الضلعان)\s*المتوازيت?ان[^.؛;]*?\b([A-Z]{2})\b[^.؛;]*?\b([A-Z]{2})\b/
  );
  if (parallelBasesM) {
    facts.push(`${parallelBasesM[1]} // ${parallelBasesM[2]}`);
  }
  const bridgeMidM = normClean.match(
    /\b([A-Z])([A-Z])\s*(?:يصل|تصل)\s*بين\s*منتصفي\s*[^A-Z.؛;]{0,30}?\b([A-Z]{2})\s*[,،و]\s*([A-Z]{2})/
  );
  if (bridgeMidM) {
    facts.push(
      `${bridgeMidM[1]} منتصف ${bridgeMidM[3]}`,
      `${bridgeMidM[2]} منتصف ${bridgeMidM[4]}`,
      `ارسم ${bridgeMidM[1]}${bridgeMidM[2]}`
    );
    const poleMidM = normClean.match(
      /في\s*منتصف\s*(?:هذا\s*الممر|القطعة|[A-Z]{2})\s*([A-Z])\s*ووصل[^.]*?(?:الركنين|النقطتين)\s*([A-Z])\s*و\s*([A-Z])/
    );
    if (poleMidM) {
      facts.push(
        `${poleMidM[1]} منتصف ${bridgeMidM[1]}${bridgeMidM[2]}`,
        `ارسم ${poleMidM[1]}${poleMidM[2]}`,
        `ارسم ${poleMidM[1]}${poleMidM[3]}`
      );
    }
  }

  // 5أ-2. برج رأسي AB ودعامة رأسية DE تصل بين منتصف السلك D والأرض E
  const towerSupportM = normClean.match(
    /(?:دعامة|قطعة|عارضة)\s*(?:رأسية\s*|أفقية\s*)?([A-Z])([A-Z])\s*(?:تصل|يصل)\s*بين\s*منتصف\s*(?:السلك|الوتر|الضلع)?\s*([A-Z])\s*و\s*(?:الأرض|القاعدة|الحائط)\s*([A-Z])/
  );
  if (towerSupportM) {
    const [, D1, E1] = towerSupportM;
    if (!facts.some((f) => f.startsWith("مثلث "))) facts.unshift("مثلث ABC قائم في B");
    facts.push(`${D1} منتصف AC`, `${E1} منتصف BC`, `ارسم ${D1}${E1}`);
  }

  // 5ب. منتصفا ضلعين صريحين: E, F منتصفي AB, CD على الترتيب
  const twoMidM = normClean.match(
    /\b([A-Z])\s*[,،و]\s*([A-Z])\s*(?:هما\s*)?(?:منتصفا|منتصفي)\s*(?:الضلعين\s*|الساقين\s*)?([A-Z]{2})\s*[,،و]\s*([A-Z]{2})/
  );
  if (twoMidM) {
    facts.push(
      `${twoMidM[1]} منتصف ${twoMidM[3]}`,
      `${twoMidM[2]} منتصف ${twoMidM[4]}`,
      `ارسم ${twoMidM[1]}${twoMidM[2]}`
    );
  }

  // 5ج. تقسيم ضلع مثلث إلى 4 أجزاء متساوية بمستقيمات توازي القاعدة (مثل D, E, F على AB و X, Y, Z على AC)
  const fourPartM = normClean.match(
    /([A-Z])\s*[,،و]\s*([A-Z])\s*[,،و]\s*([A-Z])\s*تقسم\s*(?:الضلع\s*)?([A-Z])([A-Z])\s*إلى\s*4\s*أجزاء\s*متساوية[\s\S]{0,80}?(?:لتقطع|تقطع)\s*(?:الضلع\s*)?([A-Z])([A-Z])\s*في\s*([A-Z])\s*[,،و]\s*([A-Z])\s*[,،و]\s*([A-Z])/
  );
  if (fourPartM) {
    const [, D, E, F, A1, B1, A2, C2, X, Y, Z] = fourPartM;
    facts.push(
      `${E} منتصف ${A1}${B1}`,
      `${D} منتصف ${A1}${E}`,
      `${F} منتصف ${E}${B1}`,
      `${Y} منتصف ${A2}${C2}`,
      `${X} منتصف ${A2}${Y}`,
      `${Z} منتصف ${Y}${C2}`,
      `ارسم ${D}${X}`,
      `ارسم ${E}${Y}`,
      `ارسم ${F}${Z}`
    );
  }

  for (const mf of extractPromptMediansAndRaysFacts(normClean, normAssert)) {
    if (!facts.includes(mf)) facts.push(mf);
  }

  // 6. مستقيم أو شعاع يقطع ضلعاً في نقطة، أو توازي يقطع ضلعاً في نقطة (داخل مضلع معلن فقط، لتجنب قواطع التوازي الصرفة)
  const hasDeclaredPolygon = /(?:مثلث|△|Δ|شبه\s+منحرف|متوازي\s+أضلاع|مستطيل|مربع|معين|شكل\s+رباعي)/.test(
    normClean
  );
  if (hasDeclaredPolygon) {
    for (const cm of normClean.matchAll(
      /(?:([A-Z]{2})\s*\/\/\s*[A-Z]{2}|(?<!توازي\s|يوازي\s)\b([A-Z]{2}))\s*(?:ليقطع|يقطع|لتقطع|تقطع)\s*(?:الضلع\s*|المستقيم\s*|القطعة\s*)?([A-Z]{2})\s*في\s*(?:النقطة\s*)?([A-Z])\b(?:\s*(?:و|ثم)\s*(?:ليقطع|يقطع|لتقطع|تقطع)\s*(?:الضلع\s*|المستقيم\s*|القطعة\s*)?([A-Z]{2})\s*في\s*(?:النقطة\s*)?([A-Z])\b)?(?![\s,،و]*[A-Z]\b)/g
    )) {
      if (cm[1]) {
        const f = `${cm[4]} ∈ ${cm[3]}`;
        if (!facts.includes(f)) facts.push(f);
      } else if (cm[2]) {
        for (const extra of [`ارسم ${cm[2]}`, `ارسم ${cm[3]}`, `${cm[2]} ∩ ${cm[3]} = {${cm[4]}}`]) {
          if (!facts.includes(extra)) facts.push(extra);
        }
        if (cm[5] && cm[6]) {
          for (const extra2 of [`ارسم ${cm[5]}`, `${cm[2]} ∩ ${cm[5]} = {${cm[6]}}`]) {
            if (!facts.includes(extra2)) facts.push(extra2);
          }
        }
      }
    }
  }

  return facts;
}

export function mergeCleanedTagClausesIntoParts(
  cleanTag: string,
  parts: string[]
): void {
  const canonicalFactKey = (f: string) =>
    f.replace(/\s+/g, "").replace(/m\(∠/gi, "ق(∠").replace(/°/g, "");
  const normalizedTag = cleanTag.replace(
    /(?:ال)?مثلث\s*([A-Z]{3})\s+(?:بداخل|مرسوم\s*بربط\s*منتصفات\s*أضلاع)\s*(?:ال)?مثلث\s*([A-Z]{3})/g,
    (_, inner: string, outer: string) =>
      `مثلث ${outer} ؛ ${inner[0]} منتصف ${outer[0]}${outer[1]} ؛ ${inner[1]} منتصف ${outer[1]}${outer[2]} ؛ ${inner[2]} منتصف ${outer[2]}${outer[0]} ؛ ارسم ${inner[0]}${inner[1]} ؛ ارسم ${inner[1]}${inner[2]} ؛ ارسم ${inner[2]}${inner[0]}`
  );
  const tagClauses = normalizedTag
    .replace(/(تصنع\s+زوايا\s+[^;؛\n]+)/g, (m) => m.replace(/[,،]/g, "§COMMA§"))
    .replace(/((?:النقط|النقاط)\s+[^؛;\n.]*?على\s+استقامة\s+واحدة)/g, (m) => m.replace(/[,،]/g, " "))
    .split(/\s*(?:[;؛\n]+|[,،]+(?![^()]*\)))\s*/)
    .map((c) => c.replace(/§COMMA§/g, "،").replace(/[\[\]]/g, "").trim())
    .filter(Boolean);
  for (const clause of tagClauses) {
    const segEq = clause.match(/^([A-Za-z]{2})\s*=/);
    if (segEq) {
      const segId = segEq[1].toUpperCase();
      for (let idx = parts.length - 1; idx >= 0; idx--) {
        if (
          new RegExp(`^${segId}\\s*=`, "i").test(parts[idx]) &&
          canonicalFactKey(parts[idx]) !== canonicalFactKey(clause)
        ) {
          parts.splice(idx, 1);
        }
      }
    }
    const normClause = canonicalFactKey(clause);
    const plainTri = clause.match(/^(?:ال)?مثلث\s+([A-Z]{3})$/i);
    if (plainTri && parts.some((p) => new RegExp(`مثلث\\s+${plainTri[1]}\\b`, "i").test(p))) {
      continue;
    }
    const isDuplicate = parts.some((p) => {
      const normP = canonicalFactKey(p);
      return (
        normP === normClause ||
        (normP.length === normClause.length && normP.includes(normClause))
      );
    });
    if (!isDuplicate) parts.push(clause);
  }
}
