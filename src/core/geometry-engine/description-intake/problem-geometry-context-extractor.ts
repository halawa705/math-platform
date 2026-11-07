/**
 * @file problem-geometry-context-extractor.ts
 * @description جامع السياق الهندسي الموحد (المرحلة 2):
 * يدمج وسم [رسم هندسي: ...] مع نص المسألة الكامل (promptAr) ليستخرج كل حقيقة هندسية،
 * بما فيها علاقات التشابه والتطابق بترتيب الرؤوس المتناظرة الدقيق، والأطوال الترتيبية والجبرية،
 * حتى لو كان وسم الرسم غائباً أو مختصراً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً (< 250 سطراً وفق AGENTS.md).
 */

import { convertGeometryLatexToPlainText } from "./geometry-latex-to-plain-normalizer";
import { matchPrepGrade3TrigonometryFigure } from "../curriculum-catalogs/prep-stage/grade-3/prep-grade3-trigonometry-catalog";
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
    .replace(/(?:أوجد|اوجد|احسب|لإيجاد|لايجاد|لحساب|أثبت\s*أن|اثبت\s*ان|برهن\s*أن)\s+[^؛;\n]*?(?=\s(?:حيث|إذا\s*كان|اذا\s*كان|علماً\s*بأن|علما\s*بأن|وفيه)\s|$)/gi, " ");
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
  const assertionsClean = stripGoalClausesForAssertions(clean);

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
    /(?<![A-Za-zء-ي])([A-Za-z]{2}|[أ-ي]ـ?\s*[أ-ي]ـ?)\s*=\s*([0-9]+(?:\.[0-9]+)?|[0-9.xسصy+\-\s]*[0-9xسصy][0-9.xسصy+\-\s]*?)\s*(?:سم|م|كم|مم|ديسم|وحدة)?(?!\s*(?:[A-Z]{2,4}|[أ-ي]ـ?\s*[أ-ي]ـ?))(?=[\s،,;؛|.)]|$)/gi
  );
  for (const lm of lengthMatches) {
    const segRaw = lm[1].replace(/\s+/g, "");
    const valRaw = lm[2].trim();
    if (/^(sin|cos|tan)$/i.test(segRaw)) continue;
    if (valRaw && !facts.some((f) => f.startsWith(`${segRaw} =`))) {
      facts.push(`${segRaw} = ${valRaw} سم`);
    }
  }

  // 4. قياسات الزوايا: m(∠A) = 40° أو ق(∠ب) = 65° أو ق(∠أ ب جـ) = 90° (من المعطيات فقط لا المطلوب)
  const angleMatches = assertionsClean.matchAll(
    /(?:ق\s*\(\s*∠?\s*([A-Za-z]{1,3}|[أ-ي]ـ?(?:\s*[أ-ي]ـ?){0,2})\s*\)|m\s*\(\s*∠?\s*([A-Za-z]{1,3})\s*\)|∠\s*([A-Za-z]{1,3}|[أ-ي]ـ?))\s*=\s*([0-9]+(?:\.[0-9]+)?|[0-9.xسصy+\-\s]*[0-9xسصy][0-9.xسصy+\-\s]*?)(?:°|\^\\circ|درجة)?(?=[\s،,;؛|.)و]|$|\n)/gi
  );
  for (const am of angleMatches) {
    const angRaw = (am[1] || am[2] || am[3] || "").replace(/\s+/g, "");
    const degVal = am[4].trim();
    if (angRaw && degVal && !facts.some((f) => f.includes(`∠${angRaw}`) || f.includes(`∠ ${angRaw}`))) {
      facts.push(`ق(∠${angRaw}) = ${degVal}°`);
    }
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

  // 9. استخراج أذرع زاوية المطلوب لضمان عدم سقوط أي شعاع ذُكر في المطلوب فقط (مثل m(∠CMD))
  const goalAngMatches = clean.matchAll(/(?:أوجد|احسب|قياس|قيمة)\s+.*?(?:ق\s*\(\s*∠?\s*([A-Za-z]{3})\s*\)|m\s*\(\s*∠?\s*([A-Za-z]{3})\s*\)|∠\s*([A-Za-z]{3}))/gi);
  for (const gm of goalAngMatches) {
    const targetAng = (gm[1] || gm[2] || gm[3] || "").replace(/\s+/g, "");
    if (targetAng.length === 3) {
      const goalArmStr = `الشعاع ${targetAng[1]}${targetAng[0]} و ${targetAng[1]}${targetAng[2]}`;
      if (!facts.includes(goalArmStr)) facts.push(goalArmStr);
    }
  }

  // 10. المثلث القائم في رأس (بترتيبيْ الكلمات) أو المتساوي الساقين
  const rightTriMatch =
    clean.match(/(?:المثلث|مثلث|Δ)\s*([A-Za-z]{3})\s*(?:ال)?قائم(?:\s*الزاوية)?\s*(?:في|عند)\s*([A-Za-z])/i) ??
    clean.match(/\b([A-Za-z]{3})\s*مثلث\s*قائم(?:\s*الزاوية)?\s*(?:في|عند)\s*([A-Za-z])/i);
  if (rightTriMatch) {
    facts.push(`مثلث ${rightTriMatch[1]} قائم في ${rightTriMatch[2]}`);
  }
  const isoTriMatch = clean.match(/(?:المثلث|مثلث|Δ)\s*([A-Za-z]{3})\s*(?:ال)?متساوي\s*الساقين/i);
  if (isoTriMatch) {
    facts.push(`مثلث ${isoTriMatch[1]} متساوي الساقين`);
  }

  return facts;
}

/**
 * يدمج وسم الرسم الهندسي مع نص المسألة الكامل في سلسلة حقائق موحدة خالية من التكرار.
 */
export function combineProblemAndTagGeometryContext(
  tagDescription?: string,
  promptText?: string
): string {
  let effectiveTag = tagDescription?.trim();
  const effectivePrompt = promptText?.trim();

  // إزالة وسم [رسم هندسي: ...] المحيط بالوسم لمنع تكوين وسوم مكسورة لاحقاً
  if (effectiveTag) {
    effectiveTag = effectiveTag
      .replace(/^\[\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*/i, "")
      .replace(/\s*\]\s*$/i, "")
      .trim();
  }

  // إذا لم يُمرر وسم رسم مستقل وكان نص المسألة يحتوي على وسم [رسم هندسي: ...]
  if (!effectiveTag && effectivePrompt) {
    const embeddedMatch = effectivePrompt.match(/\[\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*([^\]]+)\]/i);
    if (embeddedMatch) {
      effectiveTag = embeddedMatch[1].trim();
    }
  }

  // إذا وُجد نص مسألة يطابق مباشرة سجل القواعد الذهبية لحساب المثلثات (3ع)، نحتفظ بسياقه الكامل مع الوسم
  if (effectivePrompt && matchPrepGrade3TrigonometryFigure(effectivePrompt)) {
    const cleanPromptForTrig = effectivePrompt
      .replace(/(?<![mqق∠\\])\s*\([أ-دABCD]\)(?!\s*=)[^()]*/gi, " ")
      .replace(/[\[\]]/g, "")
      .trim();
    return effectiveTag ? `${cleanPromptForTrig} ؛ ${effectiveTag}` : cleanPromptForTrig;
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

  // إذا وُجد وسم رسم، ندمج فقراته غير المكررة بعد تنظيف الأقواس
  if (effectiveTag) {
    // فواصل الآلاف (13,000) ليست فواصل حقائق: تُحمى قبل التقسيم وإلا تحوّل 13,000 إلى حقيقتين «13» و«000».
    const cleanTag = convertGeometryLatexToPlainText(effectiveTag).replace(/(?<=\d),(?=\d{3}(?!\d))/g, "");
    const tagClauses = cleanTag
      .replace(/(تصنع\s+زوايا\s+[^;؛\n]+)/g, (m) => m.replace(/[,،]/g, "§COMMA§"))
      .split(/\s*(?:[;؛\n]+|[,،]+(?![^()]*\)))\s*/)
      .map((c) => c.replace(/§COMMA§/g, "،").replace(/[\[\]]/g, "").trim())
      .filter(Boolean);
    for (const clause of tagClauses) {
      const normClause = clause.replace(/\s+/g, "");
      const isDuplicate = parts.some((p) => {
        const normP = p.replace(/\s+/g, "");
        return normP === normClause || (normP.length === normClause.length && normP.includes(normClause));
      });
      if (!isDuplicate) {
        parts.push(clause);
      }
    }
  }

  // تنظيف شامل لأي أقواس معقوفة لمنع وسوم مشوهة
  const sanitized = parts.map((p) => p.replace(/[\[\]]/g, "").trim()).filter(Boolean);
  if (sanitized.length === 0) {
    return (effectiveTag || effectivePrompt || "").replace(/[\[\]]/g, "").trim();
  }

  // ترتيب الحقائق: التشابه/التطابق أولاً، ثم النقاط والخطوط، ثم الأطوال، ثم الزوايا
  const simFacts = sanitized.filter((p) => p.includes("~") || p.includes("≅") || p.includes("تشابه"));
  const otherFacts = sanitized.filter((p) => !simFacts.includes(p));

  const deduplicated = Array.from(new Set([...simFacts, ...otherFacts]));
  return deduplicated.join(" ؛ ");
}
