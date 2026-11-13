/**
 * @file geometry-figure-fidelity-gate.ts
 * @description بوابة الصدق البصري الصارمة: تتحقق من أن الشكل الهندسي المولد يطابق مسألته تماماً،
 * وترفض أي شكل يحتوي على رؤوس أو أرقام أو زوايا دخيلة غير مذكورة في المسألة،
 * وتحجب الرسم في المسائل النظرية اللفظية العامة التي لا تتطلب شكلاً هندسياً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 220 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import { normalizeLabelKey } from "../fact-compositor/geo-label-utils";
import { toWesternNumeralsSSOT } from "../../ssot/numeral-and-unit-ssot";
import { findMissingDimensionalGivensOnFigure } from "./geometry-figure-completeness-checker";
import { verifyNoSolutionLeakOnFigure } from "./geometry-solution-leak-guard";
import {
  isPurelyTheoreticalNoDiagramProblem,
  THEORETICAL_PROMPT_PATTERNS,
} from "./geometry-theoretical-prompt-detector";
import {
  extractAllNumbersFromText,
  extractAllVerticesFromText,
} from "./geometry-fidelity-text-token-extractor";

export { isPurelyTheoreticalNoDiagramProblem, THEORETICAL_PROMPT_PATTERNS };

export const MODULE_ID_GEOMETRY_FIGURE_FIDELITY_GATE =
  "geometry_figure_fidelity_gate" as const;

export interface FigureFidelityCheckResult {
  readonly passed: boolean;
  readonly alienVertices: readonly string[];
  readonly alienNumbers: readonly string[];
  readonly missingNumbers: readonly string[];
  readonly isPurelyTheoretical: boolean;
  readonly reasons: readonly string[];
}

/**
 * يفحص صدق الشكل الهندسي مقابل نص المسألة ووصفها.
 */
export function checkFigureFidelityToPrompt(
  figure: CanonicalGeometryFigureIR,
  rawPromptOrDescription: string
): FigureFidelityCheckResult {
  const reasons: string[] = [];
  const alienVertices: string[] = [];
  const alienNumbers: string[] = [];

  if (figure.familyId === "statistics_family" || Boolean(figure.rawSvgMarkup)) {
    return {
      passed: true,
      alienVertices: [],
      alienNumbers: [],
      missingNumbers: [],
      isPurelyTheoretical: false,
      reasons: [],
    };
  }

  if (isPurelyTheoreticalNoDiagramProblem(rawPromptOrDescription)) {
    return {
      passed: false,
      alienVertices: [],
      alienNumbers: [],
      missingNumbers: [],
      isPurelyTheoretical: true,
      reasons: ["المسألة نظرية لفظية عامة ولا تتطلب شكلاً هندسياً."],
    };
  }

  const promptNumbers = extractAllNumbersFromText(rawPromptOrDescription);
  const promptVertices = extractAllVerticesFromText(rawPromptOrDescription);
  const normalizeRadicals = (s: string) =>
    s
      .replace(/\*?\s*(?:جذر|\\?sqrt)\s*[({]?\s*(\d+(?:\.\d+)?)\s*[)}]?/gi, "√$1")
      .replace(/\s*√\s*/g, "√");
  const normPrompt = normalizeRadicals(toWesternNumeralsSSOT(rawPromptOrDescription).toLowerCase());
  const normPromptUnifiedVars = normPrompt
    .replace(/س/g, "x")
    .replace(/ص/g, "y")
    .replace(/ع/g, "z");

  // فحص الرؤوس
  if (promptVertices.size >= 3) {
    const isNamedPolygon = /(?:سداسي|خماسي|مضلع|شبه\s*منحرف|متوازي\s*أضلاع)/i.test(rawPromptOrDescription);
    for (const v of figure.vertices) {
      if (!v.label) continue;
      const baseChar = v.label.match(/[A-Za-z]|[أإابجدهوزحخيكلمنفقرشطتثغسصع]/)?.[0] ?? "";
      const vKey = normalizeLabelKey(baseChar);
      if (
        !promptVertices.has(vKey) &&
        vKey !== "M" &&
        vKey !== "O" &&
        vKey !== "X" &&
        vKey !== "Y" &&
        vKey !== "Z" &&
        !(isNamedPolygon && /^[A-F]$/.test(vKey) && figure.vertices.length <= 6)
      ) {
        alienVertices.push(v.label);
      }
    }

    if (alienVertices.length > 0 && figure.vertices.length > 0) {
      const alienRatio = alienVertices.length / figure.vertices.length;
      if (alienRatio >= 0.35) {
        reasons.push(
          `الشكل يحتوي على رؤوس دخيلة غير مذكورة في السؤال: (${alienVertices.join("، ")})`
        );
      }
    }
  }

  const stripUnits = (s: string) =>
    s.replace(/(?:سم²|م²|سم|مم|كم|ديسم|متر|م|وحدات\s*طول|وحدة\s*طول|وحدات|وحدة|درجة|°)/gi, "").trim();

  // فحص الأرقام المكتوبة على الأضلاع
  for (const seg of figure.segments) {
    if (!seg.lengthLabel) continue;
    const rawVal = String(seg.lengthLabel.value);
    const cleanNum = stripUnits(toWesternNumeralsSSOT(rawVal));
    if (!cleanNum || cleanNum === "؟" || cleanNum === "?") continue;

    const normVal = normalizeRadicals(cleanNum.toLowerCase().replace(/\s+/g, ""));
    const normValUnified = normVal.replace(/س/g, "x").replace(/ص/g, "y").replace(/ع/g, "z");
    if (normVal && (normPrompt.includes(normVal) || normPromptUnifiedVars.includes(normValUnified))) {
      continue;
    }

    if (/[a-zA-Zسصع]/.test(cleanNum)) {
      const varChar = cleanNum.match(/[a-zA-Zسصع]/)?.[0]?.toLowerCase() ?? "";
      const varCharUnified = varChar === "س" ? "x" : varChar === "ص" ? "y" : varChar === "ع" ? "z" : varChar;
      if (!normPromptUnifiedVars.includes(varCharUnified)) {
        alienNumbers.push(rawVal);
      }
      continue;
    }

    const pureDigits = cleanNum.replace(/[^0-9.]/g, "");
    if (pureDigits && !promptNumbers.has(pureDigits)) {
      const parsed = parseFloat(pureDigits);
      if (!Number.isNaN(parsed) && !promptNumbers.has(String(parsed))) {
        alienNumbers.push(rawVal);
      }
    }
  }

  // فحص قياسات الزوايا المكتوبة
  for (const ang of figure.angles) {
    if (ang.degreesLabel) {
      const labelText = stripUnits(toWesternNumeralsSSOT(ang.degreesLabel));
      if (!labelText || labelText === "؟" || labelText === "?") continue;

      const normLabel = labelText.toLowerCase().replace(/\s+/g, "");
      const normLabelUnified = normLabel.replace(/س/g, "x").replace(/ص/g, "y").replace(/ع/g, "z");
      if (normLabel && (normPrompt.includes(normLabel) || normPromptUnifiedVars.includes(normLabelUnified))) {
        continue;
      }

      if (/[a-zA-Zسصع]/.test(labelText)) {
        const varChar = labelText.match(/[a-zA-Zسصع]/)?.[0]?.toLowerCase() ?? "";
        const varCharUnified = varChar === "س" ? "x" : varChar === "ص" ? "y" : varChar === "ع" ? "z" : varChar;
        if (!normPromptUnifiedVars.includes(varCharUnified)) {
          alienNumbers.push(ang.degreesLabel);
        }
        continue;
      }

      const pureDigits = labelText.replace(/[^0-9.]/g, "");
      if (pureDigits && pureDigits !== "90" && !promptNumbers.has(pureDigits)) {
        alienNumbers.push(ang.degreesLabel);
      }
    }
  }

  const solutionLeak = verifyNoSolutionLeakOnFigure(figure, rawPromptOrDescription);
  for (const leakedVal of solutionLeak.leakedSolutionValues) {
    if (!alienNumbers.includes(leakedVal)) {
      alienNumbers.push(leakedVal);
    }
  }

  if (alienNumbers.length >= 1) {
    reasons.push(
      `الشكل يحتوي على أرقام أو أبعاد دخيلة أو مسربة للحل غير واردة في معطيات المسألة: (${alienNumbers.join("، ")})`
    );
  }

  const missingNumbers = findMissingDimensionalGivensOnFigure(figure, rawPromptOrDescription);
  if (missingNumbers.length >= 1) {
    reasons.push(
      `الشكل ينقصه معطيات هندسية واردة في المسألة لم تظهر على الرسم: (${missingNumbers.join("، ")})`
    );
  }

  const passed = reasons.length === 0;
  return {
    passed,
    alienVertices,
    alienNumbers,
    missingNumbers,
    isPurelyTheoretical: false,
    reasons,
  };
}

/**
 * دالة منطقية سريعة: هل الشكل مطابق وصادق مع نص مسألته؟
 */
export function isFigureFaithfulToPrompt(
  figure: CanonicalGeometryFigureIR,
  rawPromptOrDescription: string
): boolean {
  return checkFigureFidelityToPrompt(figure, rawPromptOrDescription).passed;
}
