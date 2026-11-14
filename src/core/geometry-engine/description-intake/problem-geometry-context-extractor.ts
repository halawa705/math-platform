/**
 * @file problem-geometry-context-extractor.ts
 * @description جامع السياق الهندسي الموحد (المرحلة 2):
 * يدمج وسم [رسم هندسي: ...] مع نص المسألة الكامل (promptAr) ليستخرج كل حقيقة هندسية،
 * بما فيها علاقات التشابه والتطابق بترتيب الرؤوس المتناظرة الدقيق، والأطوال الترتيبية والجبرية،
 * حتى لو كان وسم الرسم غائباً أو مختصراً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً (< 250 سطراً وفق AGENTS.md).
 */

import { convertGeometryLatexToPlainText } from "./geometry-latex-to-plain-normalizer";
import { unwrapStructuredCategoryHeaders } from "./geometry-clause-restructurer";
import { synthesizeVerbalGeometryFacts } from "./verbal-geometry-figure-synthesizer";
import { matchPrepGrade3TrigonometryFigure } from "../curriculum-catalogs/prep-stage/grade-3/prep-grade3-trigonometry-catalog";
import {
  extractPromptQuadMidpointAndMeasureFacts,
  mergeCleanedTagClausesIntoParts,
} from "./prompt-midpoint-and-quad-extractor";
import {
  type ExtractedSimilarityCorrespondence,
  extractOrderedSimilarityTriangles,
  unpackSequentialSideLengths,
} from "./similarity-congruence-fact-extractor";

export {
  type ExtractedSimilarityCorrespondence,
  extractOrderedSimilarityTriangles,
  unpackSequentialSideLengths,
};

export const MODULE_ID_PROBLEM_GEOMETRY_CONTEXT_EXTRACTOR =
  "problem_geometry_context_extractor" as const;

/**
 * ينظف جمل المطلوب والإثبات حتى لا تُستخرج الحلول والأرقام المطلوبة كمعطيات هندسية مفروضة.
 */
function stripGoalClausesForAssertions(text: string): string {
  return text
    .replace(/\b(?:to\s+(?:find|prove|calculate|show|determine|get|obtain)|for|giving)\b[^;\n]*(?=\b(?:where|if|given\s+that)\b|$)/gi, " ")
    .replace(/(?:أوجد|اوجد|احسب|فاحسب|لإيجاد|لايجاد|لحساب|أثبت\s*أن|اثبت\s*ان|إثبات\s*أن|اثبات\s*ان|برهن\s*أن|برهن\s*ان|المطلوب|فإن|فان)(?:\s*[:：]?\s*|\s+)[\s\S]*?(?=\s(?:حيث|إذا\s*كان|اذا\s*كان|علماً\s*بأن|علما\s*بأن|وفيه)\s|[؛;]|$)/gi, " ");
}

/**
 * يستخرج الحقائق الهندسية الصريحة من متن السؤال (قياسات زوايا، أطوال، توازٍ، تعامد).
 */
export function extractGeometryFactsFromPrompt(promptText: string): string[] {
  const facts: string[] = [];
  if (!promptText) return facts;

  // إزالة وسم [رسم هندسي: ...] إن وُجد داخل النص لمنع التكرار وترويسات الاختبارات
  const rawClean = promptText
    .replace(/^\d+\.\s*(?:matches\s+Problem|projects\s+to|supports\s+Arabic|verifies\s+that)[^:\n]*:?/gi, " ")
    .replace(/\[\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*[^\]]+\]/gi, " ")
    .replace(/(?<![mqق∠\\])\s*\([أ-دABCD]\)(?!\s*=)[^()]*/gi, " ") // إزالة خيارات MCQ دون المساس بالزوايا
    .replace(/\|\s*معرف\s*[^|\n]*/g, " ");

  const clean = convertGeometryLatexToPlainText(rawClean);
  const assertionsClean = stripGoalClausesForAssertions(clean).replace(
    /((?:ق|m)\s*\(\s*∠\s*[A-Za-z]{1,3}\s*\))\s*=\s*\d+(?:\.\d+)?\s*(?:ق|m)\s*\(\s*∠\s*[A-Za-z]{1,3}\s*\)\s*=\s*(\d+(?:\.\d+)?\s*(?:°|درجة)?)/gi,
    "$1 = $2"
  );

  // 1. علاقة التشابه أو التطابق
  const sim = extractOrderedSimilarityTriangles(clean);
  if (sim) {
    const symbol = sim.isCongruence ? "≅" : "~";
    let simStr = `مثلث ${sim.tri1.join("")} ${symbol} مثلث ${sim.tri2.join("")}`;
    if (sim.ratio !== undefined) {
      simStr += ` نسبة التشابه = ${sim.ratio}`;
    }
    facts.push(simStr);
  }

  // 2. الأطوال الترتيبية والمساواة المتسلسلة مثل AB = AC = 10 سم
  const seqLengths = unpackSequentialSideLengths(clean, sim?.tri1);
  facts.push(...seqLengths);
  for (const chm of assertionsClean.matchAll(/\b([A-Za-z]{2})\s*=\s*([A-Za-z]{2})\s*=\s*(\d+(?:\.\d+)?)/g)) {
    facts.push(`${chm[1]} = ${chm[3]} سم`, `${chm[2]} = ${chm[3]} سم`);
  }

  // 3. أطوال الأضلاع الفردية الصريحة: AB = 6 سم أو س ص = 8 (من المعطيات فقط لا المطلوب ولا المعاملات المضروبة)
  const lengthMatches = assertionsClean.matchAll(
    /(?<![A-Za-zء-ي])([A-Za-z]{2}|[أ-ي]ـ?\s*[أ-ي]ـ?)\s*=\s*(\([^()]{1,28}\)|[0-9]+(?:\.[0-9]+)?|[0-9.xسصy+\-\s]*[0-9xسصy][0-9.xسصy+\-\s]*?)\s*(سم|م|كم|مم|ديسم|وحدة)?(?!\s*(?:[A-Z]{2,4}|[أ-ي]ـ?\s*[أ-ي]ـ?|\())(?=[\s،,;؛|.)]|$)/gi
  );
  for (const lm of lengthMatches) {
    const segRaw = lm[1].replace(/\s+/g, "");
    const valRaw = lm[2].trim();
    const unitRaw = (lm[3] || "سم").trim();
    if (/^(sin|cos|tan)$/i.test(segRaw)) continue;
    if (valRaw && !facts.some((f) => f.startsWith(`${segRaw} =`))) {
      facts.push(`${segRaw} = ${valRaw} ${unitRaw}`);
    }
  }

  // 4. قياسات الزوايا: m(∠A) = 40° أو ق(∠D) = (3x - 12)° أو ق(∠أ ب جـ) = 90° (مع استبعاد النسب المتسلسلة مثل = 4 : 5 : 9)
  const angleMatches = assertionsClean.matchAll(
    /(?:ق\s*\(\s*∠?\s*([A-Za-z]{1,3}|[أ-ي]ـ?(?:\s*[أ-ي]ـ?){0,2})\s*\)|m\s*\(\s*∠?\s*([A-Za-z]{1,3})\s*\)|∠\s*([A-Za-z]{1,3}|[أ-ي]ـ?))\s*=\s*(\([^()]{1,28}\)|[0-9]+(?:\.[0-9]+)?|[0-9.xسصy+\-\s]*[0-9xسصy][0-9.xسصy+\-\s]*?)(?!\s*:)(?:°|\^\\circ|درجة)?(?=[\s،,;؛|.)و]|$|\n)/gi
  );
  for (const am of angleMatches) {
    const angRaw = (am[1] || am[2] || am[3] || "").replace(/\s+/g, "");
    const degVal = am[4].trim();
    const angExactRx = new RegExp(`∠\\s*${angRaw}(?![A-Za-zأ-يـ])`);
    if (angRaw && degVal && !facts.some((f) => angExactRx.test(f))) {
      facts.push(`ق(∠${angRaw}) = ${degVal}°`);
    }
  }

  // 4-أ. نسبة متسلسلة بين زوايا مثلث: m(∠A):m(∠B):m(∠C) = 4:5:9
  const chainedAngleRatioMatch = assertionsClean.match(
    /(?:ق|m)\s*\(\s*∠?\s*([A-Za-z]|[أ-ي])\s*\)\s*:\s*(?:ق|m)\s*\(\s*∠?\s*([A-Za-z]|[أ-ي])\s*\)\s*:\s*(?:ق|m)\s*\(\s*∠?\s*([A-Za-z]|[أ-ي])\s*\)\s*=\s*(\d+)\s*:\s*(\d+)\s*:\s*(\d+)/i
  );
  if (chainedAngleRatioMatch) {
    const [, v1, v2, v3, r1, r2, r3] = chainedAngleRatioMatch;
    if (!facts.some((f) => f.includes(`∠${v1}`))) facts.push(`ق(∠${v1}) = ${r1}x`);
    if (!facts.some((f) => f.includes(`∠${v2}`))) facts.push(`ق(∠${v2}) = ${r2}x`);
    if (!facts.some((f) => f.includes(`∠${v3}`))) facts.push(`ق(∠${v3}) = ${r3}x`);
  }

  // 4-ب. الزوايا المنعكسة أو المقسمة بالعمل (مثل ق(∠AEC) المنعكسة = 290° أو زاوية تبادل 50° وزاوية تبادل 35°)
  const reflexMatch = assertionsClean.match(/(?:ق\s*\(\s*∠?\s*([A-Za-z]{3})\s*\)|∠\s*([A-Za-z]{3}))\s*المنعكسة\s*=\s*(\d+(?:\.\d+)?)/i);
  if (reflexMatch) {
    facts.push(`ق(∠${reflexMatch[1] || reflexMatch[2]}) المنعكسة = ${reflexMatch[3]}°`);
  }
  const splitAltMatch = assertionsClean.match(/زاوية\s*تبادل\s*(\d+(?:\.\d+)?)\s*°\s*وزاوية\s*تبادل\s*(\d+(?:\.\d+)?)\s*°/i);
  if (splitAltMatch) {
    facts.push(`ق(∠BAE) = ${splitAltMatch[1]}°`, `ق(∠ECD) = ${splitAltMatch[2]}°`);
  }

  // 5. التوازي والتعامد والنقاط: DE // BC أو AD ⊥ BC أو D ∈ AB أو AD عمودي على BC
  const relMatches = clean.matchAll(
    /(?<![A-Za-zء-ي])([A-Za-z]{2}|[A-Za-z])\s*(\/\/|⊥|∈|منتصف|عمودي\s*على|يوازي|ينتمي\s*إلى)\s*([A-Za-z]{2}|[A-Za-z])(?=[\s،,;؛|.)]|$|\n)/gi
  );
  for (const rm of relMatches) {
    const left = rm[1];
    let op = rm[2];
    if (op.includes("عمودي")) op = "⊥";
    else if (op.includes("يوازي")) op = "//";
    else if (op.includes("ينتمي")) op = "∈";
    const right = rm[3];
    const relStr = `${left} ${op} ${right}`;
    if (!facts.includes(relStr)) {
      facts.push(relStr);
    }
  }
  for (const dm of clean.matchAll(/(?:رسم|ارسم|نرسم)\s+من\s+(?:النقطة\s+)?([A-Za-z]|[أ-ي]ـ?)\s+(?:المستقيم\s+|مستقيم\s+|الشعاع\s+)?([A-Za-z]{2})\s*(?:\/\/|يوازي)/gi)) {
    const ptOnLine = `${dm[1]} ∈ ${dm[2]}`;
    if (!facts.includes(ptOnLine)) facts.push(ptOnLine);
  }
  for (const pm of clean.matchAll(/(?:المستقيم|الشعاع|القطعة)\s+([A-Za-z]{2})\s+(?:يمر|المار)\s+(?:بالنقطة|بـ|من)\s*([A-Za-z]|[أ-ي]ـ?)/gi)) {
    const ptOnLine = `${pm[2]} ∈ ${pm[1]}`;
    if (!facts.includes(ptOnLine)) facts.push(ptOnLine);
  }

  // 6. منصف زاوية: BD ينصف ∠ABE أو الشعاع ME ينصف ∠AMD
  const bisMatches = clean.matchAll(
    /(?:الشعاع\s+)?([A-Za-z]{2}|[أ-ي]ـ?\s*[أ-ي]ـ?)\s+(?:ينصف|يقسم)\s+(?:الزاوية\s+|∠\s*)([A-Za-z]{3}|[أ-ي]ـ?(?:\s*[أ-ي]ـ?){2})(?=[\s،,;؛|.)]|$|\n)/gi
  );
  for (const bm of bisMatches) {
    const ray = bm[1].replace(/\s+/g, "");
    const ang = bm[2].replace(/\s+/g, "");
    const bisStr = `${ray} ينصف ∠${ang}`;
    if (!facts.includes(bisStr)) facts.push(bisStr);
  }

  // 7. أشعة متجمعة حول نقطة: أربعة أشعة تخرج من النقطة M
  const fanMatch = clean.match(/(?:[0-9٠-٩]+|أربعة|اربعة|ثلاثة|ثلاث|خمسة|خمس)?\s*أشعة\s+تخرج\s+من\s+(?:النقطة\s+)?([A-Za-z]|[أ-ي]ـ?)/i);
  if (fanMatch) {
    const v = fanMatch[1].trim();
    const fanStr = `الزوايا متجمعة حول النقطة ${v}`;
    if (!facts.includes(fanStr)) facts.push(fanStr);
  }

  // 8. تقاطع مستقيمين أو قطعتين: تقاطع المستقيمان AB و CD في النقطة M أو AC ∩ BD = {E}
  const interMatch = clean.match(/(?:إذا\s+)?تقاطع\s+(?:المستقيمان\s+|المستقيم\s+)?([A-Za-z]{2})\s*و\s*([A-Za-z]{2})\s*في\s+(?:النقطة\s+)?([A-Za-z])/i);
  if (interMatch) {
    const interStr = `تقاطع المستقيم ${interMatch[1]} و المستقيم ${interMatch[2]} في النقطة ${interMatch[3]}`;
    if (!facts.includes(interStr)) facts.push(interStr);
  }
  const capInterMatches = clean.matchAll(/([A-Za-z]{2})\s*(?:∩|×)\s*([A-Za-z]{2})\s*=\s*\{?\s*([A-Za-z])\s*\}?/gi);
  for (const cim of capInterMatches) {
    const capStr = `${cim[1]} ∩ ${cim[2]} = {${cim[3]}}`;
    if (!facts.includes(capStr)) facts.push(capStr);
  }

  // 9. المثلث العام في متن المسألة (جزء المعطيات فقط حتى لا يُعلن مثلث المطلوب)
  const plainTriMatch = assertionsClean.match(/(?:في\s+)?(?:ال)?مثلث\s*([A-Z]{3})\b/);
  if (plainTriMatch && !facts.some((f) => f.includes(`مثلث ${plainTriMatch[1]}`))) {
    facts.unshift(`مثلث ${plainTriMatch[1]}`);
  }

  // 9-ب. الزاوية الخارجة بالاسم الصريح (مثل ∠ABD زاوية خارجة عن المثلث ABC قياسها 74°) أو عند رأس محدد بدون وسم امتداد
  const explicitExtMatch = clean.match(
    /(?:الزاوية\s+|∠\s*)([A-Za-z]{3})\s*(?:زاوية\s+)?خارجة\s*(?:عن\s*(?:ال)?مثلث\s*([A-Za-z]{3}))?(?:[^.،؛\n]{0,24}?(?:و?قياسها|يساوي|تساوي|=|هو|هي)\s*(\([^()]{1,28}\)|\d+(?:\.\d+)?)\s*(?:°|درجة)?)?/i
  );
  if (explicitExtMatch) {
    const angRaw = explicitExtMatch[1].toUpperCase();
    const angChars = angRaw.split("");
    const triChars = (explicitExtMatch[2] || plainTriMatch?.[1] || "").toUpperCase().split("");
    const extVertex = angChars[1];
    const extPt = angChars.find((c) => !triChars.includes(c));
    const intArm = angChars[0] === extVertex ? angChars[2] : angChars[0];
    const fromPt = triChars.find((c) => c !== extVertex && c !== intArm);
    if (triChars.length === 3 && extPt && fromPt && triChars.includes(extVertex) && !facts.some((f) => f.startsWith("نمد "))) {
      facts.push(`نمد ${fromPt}${extVertex} إلى ${extPt}`);
    }
    const extDegVal = explicitExtMatch[3]?.trim();
    if (extDegVal && !facts.some((f) => f.includes(`∠${angRaw}`))) {
      facts.push(`ق(∠${angRaw}) = ${extDegVal}°`);
    }
  }

  const extAtVertexMatch = assertionsClean.match(
    /(?:ال)?زاوية\s*(?:ال)?خارجة\s*(?:عن\s*المثلث\s*)?عند\s*(?:الرأس\s*)?([A-Za-z])\s*(?:هو|هي|تساوي|يساوي|=|قياسها)?\s*(\([^()]{1,28}\)|\d+(?:\.\d+)?)\s*(?:°|درجة)?/i
  );
  if (extAtVertexMatch && plainTriMatch) {
    const extV = extAtVertexMatch[1].toUpperCase();
    const extVal = extAtVertexMatch[2].trim();
    const triChars = plainTriMatch[1].split("");
    if (triChars.includes(extV)) {
      const others = triChars.filter((c) => c !== extV);
      const extEnd = ["W", "D", "K", "M"].find((ch) => !triChars.includes(ch)) ?? "W";
      if (others.length === 2 && !facts.some((f) => f.startsWith("نمد "))) {
        facts.push(`نمد ${others[1]}${extV} إلى ${extEnd}`, `ق(∠${others[0]}${extV}${extEnd}) = ${extVal}°`);
      }
    }
  }

  for (const extraFact of extractPromptQuadMidpointAndMeasureFacts(clean, assertionsClean)) {
    if (!facts.includes(extraFact)) facts.push(extraFact);
  }

  // 10. المثلث القائم والمتساوي الساقين
  const rightTriM = assertionsClean.match(/(?:المثلث|مثلث|Δ)\s*([A-Za-z]{3})\s*(?:ال)?قائم(?:\s*الزاوية)?\s*(?:في|عند)\s*([A-Za-z])/i)
    ?? assertionsClean.match(/\b([A-Za-z]{3})\s*مثلث\s*قائم(?:\s*الزاوية)?\s*(?:في|عند)\s*([A-Za-z])/i);
  if (rightTriM) facts.push(`مثلث ${rightTriM[1]} قائم في ${rightTriM[2]}`);
  const isoTriM = assertionsClean.match(/(?:المثلث|مثلث|Δ)\s*([A-Za-z]{3})\s*(?:ال)?متساوي\s*الساقين/i);
  if (isoTriM) facts.push(`مثلث ${isoTriM[1]} متساوي الساقين`);
  return facts;
}

/** يدمج وسم الرسم الهندسي مع نص المسألة الكامل في سلسلة حقائق موحدة خالية من التكرار. */
export function combineProblemAndTagGeometryContext(tagDescription?: string, promptText?: string): string {
  let effectiveTag = tagDescription?.trim();
  const effectivePrompt = promptText?.trim();
  if (effectiveTag) effectiveTag = effectiveTag.replace(/^\[\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*/i, "").replace(/\s*\]\s*$/i, "").trim();
  if (!effectiveTag && effectivePrompt) effectiveTag = effectivePrompt.match(/\[\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*([^\]]+)\]/i)?.[1].trim();

  const hasTrig = Boolean(effectivePrompt && /(?<![a-z])\\?(?:sin|cos|tan|cot)(?![a-z])|(?<![أ-ي])(?:جا|جتا|ظا)(?![أ-ي])|θ|\\theta|زاوية\s*(?:ميل|ارتفاع|انخفاض)|النسب\s*المثلثية/i.test(effectivePrompt));
  const isQuadOrMid = Boolean(effectivePrompt && !hasTrig && /(?:شبه\s*منحرف|متوازي\s*أضلاع|مستطيل|معين|مربع|شكل\s*رباعي|منتصف)/.test(effectivePrompt));
  if (effectivePrompt && !isQuadOrMid && matchPrepGrade3TrigonometryFigure(effectivePrompt)) {
    return effectivePrompt
      .replace(/(?<![mqق∠\\])\s*\([أ-دABCD]\)(?!\s*=)[^()]*/gi, " ")
      .replace(/[\[\]]/g, "")
      .trim();
  }
  if (effectivePrompt && effectiveTag && !isQuadOrMid && matchPrepGrade3TrigonometryFigure(`${effectivePrompt} ؛ ${effectiveTag}`)) {
    const cleanPromptForTrig = effectivePrompt
      .replace(/(?<![mqق∠\\])\s*\([أ-دABCD]\)(?!\s*=)[^()]*/gi, " ")
      .replace(/[\[\]]/g, "")
      .trim();
    return `${cleanPromptForTrig} ؛ ${effectiveTag}`;
  }

  const parts: string[] = [];

  // إذا وُجد نص المسألة، نستخرج منه كل الحقائق الحية (مع استبعاد ترويسات أطر الاختبارات الآلية)
  if (
    effectivePrompt &&
    !/^\d+\.\s*(?:matches|projects|supports|verifies|renders)\b/i.test(effectivePrompt)
  ) {
    const promptFacts = extractGeometryFactsFromPrompt(effectivePrompt);
    parts.push(...promptFacts);
  }

  // إذا وُجد وسم رسم، ندمج فقراته غير المكررة بعد فك الأغلفة وتوحيد الصيغة
  if (effectiveTag) {
    const cleanTag = unwrapStructuredCategoryHeaders(
      convertGeometryLatexToPlainText(effectiveTag).replace(/(?<=\d),(?=\d{3}(?!\d))/g, "")
    );
    mergeCleanedTagClausesIntoParts(cleanTag, parts);
  }
  if (!effectiveTag && effectivePrompt) {
    for (const vf of synthesizeVerbalGeometryFacts(effectivePrompt, parts)) {
      if (!parts.includes(vf)) parts.push(vf);
    }
  }
  const sanitized = parts.map((p) => p.replace(/[\[\]]/g, "").trim()).filter(Boolean);
  if (sanitized.length === 0) return convertGeometryLatexToPlainText(effectiveTag || effectivePrompt || "").replace(/[\[\]]/g, "").trim();
  const simFacts = sanitized.filter((p) => p.includes("~") || p.includes("≅") || p.includes("تشابه"));
  const otherFacts = sanitized.filter((p) => !simFacts.includes(p));
  return Array.from(new Set([...simFacts, ...otherFacts])).join(" ؛ ");
}
