/**
 * @file verbal-geometry-figure-synthesizer.ts
 * @description مولّد الحقائق الهندسية للمسائل اللفظية غير الموسومة في الابتدائية والإعدادية:
 * يحوّل المسألة اللفظية (نسب زوايا، ضلعان وزاوية، مثلث قائم/متساوي الساقين، زاوية خارجة)
 * إلى حقائق هندسية معيارية برؤوس `ABC` دون تسريب النواتج أو أضلاع مستحيلة الرسم.
 * @invariant ملف ذري مستقل باسم فريد عالمياً (< 180 سطراً وفق AGENTS.md).
 */

import { convertGeometryLatexToPlainText } from "./geometry-latex-to-plain-normalizer";
import { parseLabelList } from "../fact-compositor/geo-label-utils";

export const MODULE_ID_VERBAL_GEOMETRY_FIGURE_SYNTHESIZER =
  "verbal_geometry_figure_synthesizer" as const;

const IMPOSSIBLE_OR_THEORETICAL_REGEX =
  /(?:هل\s+(?:يمكن|تصلح)|اختبر\s+(?:أي|إمكانية)|أيهما\s+يصلح|متباينة\s+المثلث\s+لا|مجموع\s+قياسات\s+زوايا\s+(?:المثلث|الشكل)|عدد\s+محاور\s+التماثل)/i;

function stripPromptGoalsAndChoices(text: string): string {
  return text
    .replace(/(?<![mqق∠\\])\s*\([أ-دABCD]\)(?!\s*=)[^()]*/gi, " ")
    .replace(
      /(?:أوجد|اوجد|احسب|فاحسب|حدد\s+نوع|بيّن\s*نوع|بين\s*نوع|المطلوب|فإن|فان|كم\s+يبلغ|أيهما|أي\s+مما\s+يلي|اختبر)(?:\s*[:：]?\s*|\s+)[\s\S]*?(?=\s(?:حيث|إذا\s*كان|اذا\s*كان|فإذا\s*كان)\s|[؛;]|$)/gi,
      " "
    );
}

function extractMeasuredLengths(text: string): Array<{ value: number; unit: string }> {
  const out: Array<{ value: number; unit: string }> = [];
  for (const m of text.matchAll(/(\d+(?:\.\d+)?)\s*(سم|م|كم|مم|ديسم)(?![أ-يa-zA-Z²])/gi)) {
    const value = Number(m[1]);
    if (Number.isFinite(value) && value > 0) {
      out.push({ value, unit: m[2] });
    }
  }
  return out;
}

function extractStandaloneDegrees(text: string): number[] {
  const degs: number[] = [];
  for (const m of text.matchAll(/(?<![+\-*/\w(])(\d+(?:\.\d+)?)\s*°/g)) {
    const v = Number(m[1]);
    if (Number.isFinite(v) && v > 0 && v < 180) degs.push(v);
  }
  return degs;
}

function extractAlgebraicAngleExprs(text: string): string[] {
  const exprs: string[] = [];
  const tokenRe = /(\([^()]{2,26}\))\s*°?|(\d*[xXyY]|(?<![أ-يA-Za-z])\d*[سص](?![أ-يA-Za-z]))\s*°/g;
  for (const m of text.matchAll(tokenRe)) {
    const inner = (m[1] ?? m[2] ?? "").trim();
    if (inner && /[xXyYسص]/.test(inner) && !exprs.includes(inner)) exprs.push(inner);
  }
  return exprs;
}

/**
 * يولّد حقائق هندسية مبدئية لمسألة لفظية لا تحتوي وسم رسم صريح.
 * يعيد مصفوفة فارغة إذا كان الشكل معلناً بالفعل أو كانت المسألة غير صالحة للرسم التوضيحي.
 */
export function synthesizeVerbalGeometryFacts(
  promptText: string,
  existingFacts: readonly string[]
): string[] {
  if (!promptText || !promptText.trim()) return [];
  if (
    existingFacts.some((f) =>
      /^(?:ال)?(?:مثلث|مستطيل|مربع|معين|متوازي|شبه|رباعي|دائرة)/.test(f.trim())
    )
  ) {
    return [];
  }

  const plain = convertGeometryLatexToPlainText(promptText);
  if (
    /(?:المثلث|مثلث|Δ)\s*(?:[A-Za-z]{3}|[أ-ي]ـ?(?:\s+[أ-ي]ـ?){2})(?![أ-ي])|\b[A-Za-z]{3}\s+مثلث\s+(?:قائم|متساوي)|(?:مستطيل|مربع|معين|متوازي\s*أضلاع|شبه\s*منحرف)\s*(?:[A-Za-z]{4}|[أ-ي]ـ?(?:\s+[أ-ي]ـ?){3})/i.test(
      plain
    )
  ) {
    return [];
  }
  if (IMPOSSIBLE_OR_THEORETICAL_REGEX.test(plain)) return [];

  // دعم تقاطع مستقيمين لمثلثين متقابلين بالرأس دون إعلان صريح (مثل عند M مع ∠A و ∠B و ∠D)
  const vertexVertOppMatch = plain.match(
    /(?:تقاطع\s*(?:ال)?مستقيم(?:ين|ان)\s*(?:في|عند)|بالرأس\s*(?:في|عند))\s*(?:النقطة\s*)?([A-Z])\b/
  );
  if (vertexVertOppMatch) {
    const mV = vertexVertOppMatch[1];
    const angLetters = Array.from(new Set([...plain.matchAll(/∠\s*([A-Z])\b/g)].map((m) => m[1]))).filter((l) => l !== mV);
    if (angLetters.length >= 3) {
      const [l0, l1, l2, l3] = [angLetters[0], angLetters[1], angLetters[2], angLetters[3] || (mV === "E" ? "F" : "E")];
      return [`مثلث ${l0}${l1}${mV}`, `مثلث ${l2}${l3}${mV}`, `${l0}${l2} ∩ ${l1}${l3} = {${mV}}`];
    }
  }

  const body = stripPromptGoalsAndChoices(plain);
  const out: string[] = [];

  // 1. المسائل اللفظية للمثلث بدون رموز رؤوس معلنة
  if (/مثلث|حظيرة\s+مثلثة/i.test(plain)) {
    const isRight = /قائم(?:\s*الزاوية)?/i.test(body);
    const isIso = /متساوي\s*الساقين/i.test(body);
    const isEqui = /متساوي\s*الأضلاع/i.test(body);

    const triDecl = isRight
      ? "مثلث ABC قائم في B"
      : isEqui
        ? "مثلث ABC متساوي الأضلاع"
        : isIso
          ? "مثلث ABC متساوي الساقين رأسه A"
          : "مثلث ABC";
    out.push(triDecl);

    const hasExistingAngles = existingFacts.some((f) => f.includes("∠"));
    const ratioMatch = body.match(/(\d+)\s*:\s*(\d+)\s*:\s*(\d+)/);
    const algExprs = extractAlgebraicAngleExprs(body);
    const degs = extractStandaloneDegrees(body);
    const isExteriorVerbal = /(?:ال)?زاوية\s*(?:ال)?خارجة|(?:ال)?زوايا\s*(?:ال)?خارجة/i.test(plain);

    if (isExteriorVerbal && !hasExistingAngles) {
      out.push("نمد BC إلى D");
      if (algExprs.length >= 2) {
        out.push(`ق(∠ACD) = ${algExprs[0]}°`);
        out.push(`ق(∠A) = ${algExprs[1]}°`);
        if (degs.length >= 1) out.push(`ق(∠B) = ${degs[0]}°`);
      } else {
        const extBeforeInt =
          /(?:ال)?زاوية\s+(?:ال)?خارجة|الزوايا\s+الخارجة/i.test(plain) &&
          degs.length >= 2 &&
          degs[0] >= degs[1];
        if (extBeforeInt) {
          out.push(`ق(∠ACD) = ${degs[0]}°`, `ق(∠A) = ${degs[1]}°`, "ق(∠B) = ؟");
        } else {
          if (degs[0] !== undefined) out.push(`ق(∠A) = ${degs[0]}°`);
          if (degs[1] !== undefined) out.push(`ق(∠B) = ${degs[1]}°`);
          if (/خارجة/i.test(plain)) out.push("ق(∠ACD) = ؟");
        }
      }
    } else if (!hasExistingAngles) {
      if (ratioMatch) {
        out.push(`ق(∠A) = ${ratioMatch[1]}x`, `ق(∠B) = ${ratioMatch[2]}x`, `ق(∠C) = ${ratioMatch[3]}x`);
      } else if (algExprs.length >= 3) {
        out.push(`ق(∠A) = ${algExprs[0]}°`, `ق(∠B) = ${algExprs[1]}°`, `ق(∠C) = ${algExprs[2]}°`);
      } else if (degs.length >= 2 && degs[0] + degs[1] < 180) {
        out.push(`ق(∠A) = ${degs[0]}°`, `ق(∠B) = ${degs[1]}°`);
      } else if (isRight && degs.length === 1 && degs[0] < 90) {
        out.push(`ق(∠A) = ${degs[0]}°`);
      } else if (isIso && degs.length === 1 && !/زاوية\s*خارجة/.test(body)) {
        const isVertexAngle = /زاوية\s*الرأس|رأسه/i.test(body);
        out.push(isVertexAngle ? `ق(∠A) = ${degs[0]}°` : `ق(∠B) = ${degs[0]}°`);
      }
    }

    const lens = extractMeasuredLengths(body);
    const hasExistingLengths = existingFacts.some((f) => /^[A-Z]{2}\s*=/.test(f));
    if (!hasExistingLengths && lens.length > 0) {
      if (lens.length >= 3 && lens[0].value + lens[1].value > lens[2].value) {
        out.push(
          `AB = ${lens[0].value} ${lens[0].unit}`,
          `BC = ${lens[1].value} ${lens[1].unit}`,
          `AC = ${lens[2].value} ${lens[2].unit}`
        );
      } else if (lens.length === 2) {
        out.push(
          `AB = ${lens[0].value} ${lens[0].unit}`,
          `BC = ${lens[1].value} ${lens[1].unit}`
        );
        if (/ضلع\s*ثالث|الضلع\s*الثالث|أكبر\s*محيط|أصغر\s*محيط|فترة|ينتمي/i.test(plain)) {
          out.push("AC = ؟");
        }
      } else if (lens.length === 1) {
        out.push(`AB = ${lens[0].value} ${lens[0].unit}`);
      }
    }
    return out;
  }

  // 2. أشكال رباعية ودوائر لفظية بلا تسمية رؤوس
  const namedQuad = plain.match(/(مستطيل|مربع|معين|متوازي\s*أضلاع|شبه\s*منحرف)\s*([A-Z]{4})/);
  if (namedQuad) {
    const parsed = parseLabelList(namedQuad[2]);
    if (parsed?.length === 4) out.push(`${namedQuad[1]} ${parsed.join("")}`);
    return out;
  }
  if (/(?:مستطيل|مربع|معين|متوازي\s*أضلاع)/i.test(plain)) {
    const shape = plain.match(/مستطيل|مربع|معين|متوازي\s*أضلاع/i)![0];
    const lens = extractMeasuredLengths(body);
    out.push(`${shape} ABCD`);
    if (lens[0]) out.push(`AB = ${lens[0].value} ${lens[0].unit}`);
    if (lens[1]) out.push(`BC = ${lens[1].value} ${lens[1].unit}`);
    return out;
  }
  if (/دائرة/i.test(plain)) {
    const rMatch = body.match(/نصف\s*قطرها\s*=?\s*(\d+(?:\.\d+)?)\s*(سم|م|كم|مم)?/i);
    out.push(rMatch ? `دائرة مركزها M ونصف قطرها = ${rMatch[1]} ${rMatch[2] || "سم"}` : "دائرة مركزها M");
  }

  return out;
}
