/**
 * @file geometry-solution-leak-guard.ts
 * @description حارس منع تسريب الحل على الشكل الهندسي (المرحلة 2 - فحص 3.6):
 * يتأكد من أن كل قيمة عددية مكتوبة على الشكل (ضلع، زاوية، شارة داخلية، قوس) هي معطى في متن المسألة،
 * وليست قيمة مستنتجة أو إجابة واردة في ذيل الحل/المطلوب فقط (مثل: «أوجد طول أ جـ = 10 سم»).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 140 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import { toWesternNumeralsSSOT } from "../../ssot/numeral-and-unit-ssot";
import { extractNumbersShownOnFigure } from "../baseline-measurement/baseline-figure-number-extractor";

export const MODULE_ID_GEOMETRY_SOLUTION_LEAK_GUARD =
  "geometry_solution_leak_guard" as const;

export interface SolutionLeakCheckResult {
  readonly passed: boolean;
  readonly leakedSolutionValues: readonly string[];
  readonly reasons: readonly string[];
}

function extractNumbersSet(raw: string): Set<string> {
  const norm = toWesternNumeralsSSOT(raw)
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, "")
    .replace(/٫/g, ".")
    .replace(/(?<=\d),(?=\d{3}(?!\d))/g, "");
  const set = new Set<string>();
  for (const m of norm.matchAll(/\d+(?:\.\d+)?/g)) {
    const parsed = parseFloat(m[0]);
    if (!Number.isNaN(parsed)) {
      set.add(String(parsed));
    }
  }
  return set;
}

/**
 * يفصل نص المسألة إلى جزأين:
 * 1. جزء المعطيات قبل فعل الطلب («أوجد / احسب / استنتج...»)
 * 2. ذيل المطلوب أو الحل المدمج إن وُجد بعد فعل الطلب
 */
export function splitGivensAndAskedTail(rawPrompt: string): {
  readonly givensPart: string;
  readonly askedTail: string;
} {
  if (!rawPrompt) return { givensPart: "", askedTail: "" };
  const match = rawPrompt.match(
    /(?:أوجد|اوجد|احسب|لإيجاد|لايجاد|لحساب|استنتج)\s+[^؛;\n]*$/i
  );
  if (!match || match.index === undefined) {
    return { givensPart: rawPrompt, askedTail: "" };
  }
  const tailRaw = match[0];
  // إذا كان فعل «احسب/أوجد» متبوعاً بـ «حيث / إذا كان / علماً بأن»، فما بعد «حيث» هو معطيات وليس إجابة مسربة
  const whereMatch = tailRaw.match(/\s(?:حيث|إذا\s*كان|اذا\s*كان|علماً\s*بأن|علما\s*بأن|وفيه)\s+([\s\S]*)$/i);
  const pureAskedTail = whereMatch && whereMatch.index !== undefined ? tailRaw.slice(0, whereMatch.index) : tailRaw;
  const embeddedGivens = whereMatch ? whereMatch[1] : "";
  const givensPart =
    rawPrompt.slice(0, match.index) +
    " " +
    embeddedGivens +
    " " +
    rawPrompt.slice(match.index + match[0].length);
  return {
    givensPart,
    askedTail: pureAskedTail,
  };
}

/**
 * يفحص الشكل للتأكد من خلوه من أي رقم محسوب أو مسرّب من ذيل الإجابة غير وارد في المعطيات.
 */
export function verifyNoSolutionLeakOnFigure(
  figure: CanonicalGeometryFigureIR,
  rawPromptOrDescription: string
): SolutionLeakCheckResult {
  if (figure.familyId === "statistics_family" || Boolean(figure.rawSvgMarkup)) {
    return { passed: true, leakedSolutionValues: [], reasons: [] };
  }

  const { givensPart, askedTail } = splitGivensAndAskedTail(rawPromptOrDescription);
  const givenNums = extractNumbersSet(givensPart);
  const fullNums = extractNumbersSet(rawPromptOrDescription);
  const tailNums = extractNumbersSet(askedTail);
  const shownOnFigure = extractNumbersShownOnFigure(figure);

  const leaked: string[] = [];

  for (const num of shownOnFigure) {
    if (num === "90") continue;
    // حالة 1: رقم غير موجود إطلاقاً في نص المسألة (محسوب داخلياً مثل وتر فيثاغورس 5 لـ 3 و 4)
    if (!fullNums.has(num)) {
      leaked.push(num);
      continue;
    }
    // حالة 2: رقم ورد فقط في ذيل «أوجد ... = 40» ولم يرد في معطيات المسألة
    if (tailNums.has(num) && !givenNums.has(num)) {
      leaked.push(num);
    }
  }

  return {
    passed: leaked.length === 0,
    leakedSolutionValues: leaked,
    reasons:
      leaked.length > 0
        ? [`تسريب حل على الشكل: القيم (${leaked.join("، ")}) هي نواتج محسوبة أو إجابات وليست من معطيات المسألة.`]
        : [],
  };
}
