/**
 * @file prompt-midpoint-and-quad-extractor.ts
 * @description مستخرج مساعد لحقائق الأشكال الرباعية والمنتصفات المتعددة والمحيط/المساحة من متن المسألة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً (< 120 سطراً وفق AGENTS.md).
 */

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

  // 1. الأشكال الرباعية الصريحة (شبه منحرف ABCD، متوازي أضلاع EFGH...)
  for (const qm of normAssert.matchAll(
    /(شبه\s*منحرف|متوازي\s*أضلاع|مستطيل|معين|مربع|شكل\s*رباعي)\s*(?:قائم[^A-Z]{0,18})?\b([A-Z]{4})\b/g
  )) {
    const kind = qm[1].replace(/\s+/g, " ").trim();
    const lbl = qm[2].toUpperCase();
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
    /مساحت?(?:ه|ها|\s*(?:ال)?(?:مثلث|مربع|مستطيل|شبه\s*منحرف)\s*[A-Z]{0,4})?\s*(?:تساوي|يساوي|=)?\s*(\d+(?:\.\d+)?)\s*(سم|م)\s*[²2]?/
  );
  if (areaM) {
    facts.push(`مساحة = ${areaM[1]} ${areaM[2] === "م" ? "م²" : "سم²"}`);
  }

  // 4. منتصفات ثلاثية في مثلث: النقط X, Y, Z هي منتصفات أضلاعه الثلاثة / للأضلاع AB, BC, AC
  const triVertexM = normAssert.match(/(?:مثلث|Δ)\s*([A-Z]{3})\b/);
  const explicitSidesMidM = normAssert.match(
    /([A-Z])\s*,\s*([A-Z])\s*,\s*([A-Z])\s*(?:هي\s*|ك)?منتصفات\s*(?:أضلاعه|الأضلاع|للأضلاع)\s*(?:ال)?([A-Z]{2})\s*[,،و]\s*([A-Z]{2})\s*[,،و]\s*([A-Z]{2})/
  );
  if (explicitSidesMidM) {
    facts.push(
      `${explicitSidesMidM[1]} منتصف ${explicitSidesMidM[4]}`,
      `${explicitSidesMidM[2]} منتصف ${explicitSidesMidM[5]}`,
      `${explicitSidesMidM[3]} منتصف ${explicitSidesMidM[6]}`,
      `مثلث ${explicitSidesMidM[1]}${explicitSidesMidM[2]}${explicitSidesMidM[3]}`
    );
  } else if (triVertexM) {
    const [A, B, C] = triVertexM[1].split("");
    const threeMidM = normAssert.match(
      /([A-Z])\s*,\s*([A-Z])\s*,\s*([A-Z])\s*(?:هي\s*)?منتصفات\s*أضلاعه(?:\s*الثلاثة)?/
    );
    if (threeMidM) {
      facts.push(
        `${threeMidM[1]} منتصف ${A}${B}`,
        `${threeMidM[2]} منتصف ${B}${C}`,
        `${threeMidM[3]} منتصف ${A}${C}`,
        `مثلث ${threeMidM[1]}${threeMidM[2]}${threeMidM[3]}`
      );
    }
  }

  // 5. ممر / قطعة تصل بين منتصفي ضلعين أو نقطة في منتصف ممر موصلة بركنين (مسألة الحديقة وغيرها)
  const bridgeMidM = normClean.match(
    /\b([A-Z])([A-Z])\s*يصل\s*بين\s*منتصفي\s*(?:السياجين\s*الجانبيين|الضلعين)\s*([A-Z]{2})\s*و\s*([A-Z]{2})/
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

  // 6. مستقيم أو شعاع يقطع ضلعاً في نقطة، أو توازي يقطع ضلعاً في نقطة (داخل مضلع معلن فقط، لتجنب قواطع التوازي الصرفة)
  const hasDeclaredPolygon = /(?:مثلث|△|Δ|شبه\s+منحرف|متوازي\s+أضلاع|مستطيل|مربع|معين|شكل\s+رباعي)/.test(
    normClean
  );
  if (hasDeclaredPolygon) {
    for (const cm of normClean.matchAll(
      /(?:([A-Z]{2})\s*\/\/\s*[A-Z]{2}|([A-Z]{2}))\s*(?:ليقطع|يقطع|لتقطع|تقطع)\s*(?:الضلع\s*|المستقيم\s*|القطعة\s*)?([A-Z]{2})\s*في\s*(?:النقطة\s*)?([A-Z])\b/g
    )) {
      const f = cm[1] ? `${cm[4]} ∈ ${cm[3]}` : `${cm[2]} ∩ ${cm[3]} = {${cm[4]}}`;
      if (!facts.includes(f)) facts.push(f);
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
  const tagClauses = cleanTag
    .replace(/(تصنع\s+زوايا\s+[^;؛\n]+)/g, (m) => m.replace(/[,،]/g, "§COMMA§"))
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
