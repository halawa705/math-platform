/**
 * @file prompt-collinear-and-composite-extractor.ts
 * @description مستخرج ذري مستقل لعلاقات الاستقامة الواحدة، امتدادات الأضلاع، المثلثات المتعددة، والمضلعات (خماسي/سداسي/...)
 * من متن المسألة لدعم الأشكال المركّبة تلقائياً بدون كتالوجات ثابتة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 160 سطراً).
 */

import { normalizeLabelKey } from "../fact-compositor/geo-label-utils";

export const MODULE_ID_PROMPT_COLLINEAR_AND_COMPOSITE_EXTRACTOR =
  "prompt_collinear_and_composite_extractor" as const;

const AR_PT = "[أإاآبجدهوزحخيكلمنفقرشطتثغسصع]ـ?";

function normalizePointToken(raw: string): string {
  const cleaned = raw.replace(/\s+/g, "").replace(/ـ/g, "");
  return normalizeLabelKey(cleaned);
}

/**
 * يستخرج علاقات الاستقامة، الامتداد، المثلثات المتعددة، والمضلعات الخماسية/السداسية/السباعية/الثمانية.
 */
export function extractPromptCollinearAndCompositeFacts(
  cleanPrompt: string,
  assertionsClean: string
): string[] {
  const facts: string[] = [];
  const pushUnique = (fact: string) => {
    if (fact && !facts.includes(fact)) facts.push(fact);
  };

  // 1. الاستقامة الواحدة (Latin: B, C, E على استقامة واحدة | Arabic: ب، جـ، هـ على استقامة واحدة)
  const latinCollinearRx =
    /(?:(?:النقط|النقاط)\s+)?([A-Z])(?:\s*[،,]\s*|\s+و\s+|\s+)([A-Z])(?:\s*[،,]\s*|\s+و\s+|\s+)([A-Z])(?:(?:\s*[،,]\s*|\s+و\s+|\s+)([A-Z]))?\s+على\s+استقامة\s+واحدة/g;
  for (const m of cleanPrompt.matchAll(latinCollinearRx)) {
    const pts = [m[1], m[2], m[3], m[4]].filter((x): x is string => Boolean(x));
    if (pts.length >= 3) pushUnique(`${pts.join(" ")} على استقامة واحدة`);
  }

  const arabicCollinearRx = new RegExp(
    `(?:(?:النقط|النقاط)\\s+)?(${AR_PT})(?:\\s*[،,]\\s*|\\s+و\\s+|\\s+)(${AR_PT})(?:\\s*[،,]\\s*|\\s+و\\s+|\\s+)(${AR_PT})(?:(?:\\s*[،,]\\s*|\\s+و\\s+|\\s+)(${AR_PT}))?\\s+على\\s+استقامة\\s+واحدة`,
    "gu"
  );
  for (const m of cleanPrompt.matchAll(arabicCollinearRx)) {
    const pts = [m[1], m[2], m[3], m[4]]
      .filter((x): x is string => Boolean(x))
      .map(normalizePointToken);
    if (pts.length >= 3) pushUnique(`${pts.join(" ")} على استقامة واحدة`);
  }

  // 2. امتدادات الأضلاع الصريحة: نمد BC إلى E / E ∈ امتداد BC / تقع على امتداد الضلع BC
  const extendLatinRx =
    /(?:نمد|مد|امدد)\s*(?:الضلع\s*|القطعة(?:\s*المستقيمة)?\s*|الشعاع\s*)?([A-Z]{2})\s*(?:إلى|حتى|لنقطة|إلى\s+النقطة)\s*([A-Z])\b/g;
  for (const m of cleanPrompt.matchAll(extendLatinRx)) {
    pushUnique(`نمد ${m[1].toUpperCase()} إلى ${m[2].toUpperCase()}`);
  }

  const pointOnExtRx =
    /\b([A-Z])\s*(?:∈|تقع\s+على|يقع\s+على|على)\s+امتداد\s+(?:الضلع\s*|القطعة(?:\s*المستقيمة)?\s*|الشعاع\s*|المستقيم\s*)?([A-Z]{2})\b/g;
  for (const m of cleanPrompt.matchAll(pointOnExtRx)) {
    pushUnique(`نمد ${m[2].toUpperCase()} إلى ${m[1].toUpperCase()}`);
  }

  // 3. المثلثات المتعددة (بما فيها الثاني والثالث أو الموصوف بـ متساوي الأضلاع)
  const nestedMidMatch = cleanPrompt.match(
    /(?:ال)?مثلث\s*([A-Z]{3})\s+(?:هو\s*)?(?:مثلث\s*)?(?:مرسوم\s*بربط|رؤوسه|الناتج\s*من\s*توصيل|بداخل)\s*(?:منتصفات\s*أضلاع\s*)?(?:ال)?مثلث/
  );
  const nestedInnerTri = nestedMidMatch?.[1];
  const triRx =
    /(?:ال)?(?:مثلث|Δ|△)\s*([A-Z]{3})\b(?:\s*(?:ال)?(قائم(?:\s*الزاوية)?\s*(?:في|عند)\s*[A-Z]|متساوي\s*الساقين(?:\s*(?:رأسه|رأس)\s*(?:هو|عند|في)?\s*[A-Z])?|متساوي\s*الأضلاع))?/g;
  let triMatchCount = 0;
  for (const tm of assertionsClean.matchAll(triRx)) {
    const triName = tm[1].toUpperCase();
    if (nestedInnerTri && triName === nestedInnerTri) continue;
    const qualifier = tm[2]?.replace(/\s+/g, " ").trim();
    const isEqui = Boolean(qualifier && /متساوي\s*الأضلاع/.test(qualifier));
    // الأول المجرد يلتقطه المستخرج الرئيسي؛ نصدر الثاني فأعلى أو الموصوف بمتساوي الأضلاع
    if (triMatchCount > 0 || qualifier) {
      pushUnique(qualifier ? `مثلث ${triName} ${qualifier}` : `مثلث ${triName}`);
    } else if (isEqui) {
      pushUnique(`مثلث ${triName} متساوي الأضلاع`);
    }
    triMatchCount++;
  }

  // 4. المضلعات الخماسية والسداسية والسباعية والثمانية (مثل خماسي ABCDE أو ABCDEF سداسي منتظم)
  const polyWordPat = "(?:ال)?(خماسي|سداسي|سباعي|ثماني)(?:\\s+(?:ال)?منتظم)?";
  const polyFwdRx = new RegExp(`${polyWordPat}\\s+([A-Z]{5,8})\\b`, "g");
  for (const pm of assertionsClean.matchAll(polyFwdRx)) {
    const isRegular = /منتظم/.test(pm[0]);
    const kindWord = pm[1].replace(/^ال/, "");
    pushUnique(`${kindWord}${isRegular ? " منتظم" : ""} ${pm[2].toUpperCase()}`);
  }
  const polyRevRx = new RegExp(`\\b([A-Z]{5,8})\\s+${polyWordPat}`, "g");
  for (const pm of assertionsClean.matchAll(polyRevRx)) {
    const isRegular = /منتظم/.test(pm[0]);
    const kindWord = pm[2].replace(/^ال/, "");
    pushUnique(`${kindWord}${isRegular ? " منتظم" : ""} ${pm[1].toUpperCase()}`);
  }

  return facts;
}

/**
 * يستخرج حقائق الزاوية الخارجة بالاسم الصريح (∠ABD خارجة عن ABC) أو عند رأس محدد بدون وسم امتداد.
 */
export function extractExteriorAngleFactsForTriangle(
  clean: string,
  assertionsClean: string,
  plainTriName: string | undefined,
  existingFacts: readonly string[]
): string[] {
  const out: string[] = [];
  const explicitExtMatch = clean.match(
    /(?:الزاوية\s+|∠\s*)([A-Za-z]{3})\s*(?:زاوية\s+)?خارجة\s*(?:عن\s*(?:ال)?مثلث\s*([A-Za-z]{3}))?(?:[^.،؛\n]{0,24}?(?:و?قياسها|يساوي|تساوي|=|هو|هي)\s*(\([^()]{1,28}\)|\d+(?:\.\d+)?)\s*(?:°|درجة)?)?/i
  );
  if (explicitExtMatch) {
    const angRaw = explicitExtMatch[1].toUpperCase();
    const angChars = angRaw.split("");
    const triChars = (explicitExtMatch[2] || plainTriName || "").toUpperCase().split("");
    const extVertex = angChars[1];
    const extPt = angChars.find((c) => !triChars.includes(c));
    const intArm = angChars[0] === extVertex ? angChars[2] : angChars[0];
    const fromPt = triChars.find((c) => c !== extVertex && c !== intArm);
    if (triChars.length === 3 && extPt && fromPt && triChars.includes(extVertex) && !existingFacts.some((f) => f.startsWith("نمد "))) {
      out.push(`نمد ${fromPt}${extVertex} إلى ${extPt}`);
    }
    const extDegVal = explicitExtMatch[3]?.trim();
    if (extDegVal && !existingFacts.some((f) => f.includes(`∠${angRaw}`))) {
      out.push(`ق(∠${angRaw}) = ${extDegVal}°`);
    }
  }
  const extAtVertexMatch = assertionsClean.match(
    /(?:ال)?زاوية\s*(?:ال)?خارجة\s*(?:عن\s*المثلث\s*)?عند\s*(?:الرأس\s*)?([A-Za-z])\s*(?:هو|هي|تساوي|يساوي|=|قياسها)?\s*(\([^()]{1,28}\)|\d+(?:\.\d+)?)\s*(?:°|درجة)?/i
  );
  if (extAtVertexMatch && plainTriName) {
    const extV = extAtVertexMatch[1].toUpperCase();
    const extVal = extAtVertexMatch[2].trim();
    const triChars = plainTriName.split("");
    if (triChars.includes(extV)) {
      const others = triChars.filter((c) => c !== extV);
      const extEnd = ["W", "D", "K", "M"].find((ch) => !triChars.includes(ch)) ?? "W";
      if (others.length === 2 && !existingFacts.some((f) => f.startsWith("نمد ")) && !out.some((f) => f.startsWith("نمد "))) {
        out.push(`نمد ${others[1]}${extV} إلى ${extEnd}`, `ق(∠${others[0]}${extV}${extEnd}) = ${extVal}°`);
      }
    }
  }
  return out;
}
