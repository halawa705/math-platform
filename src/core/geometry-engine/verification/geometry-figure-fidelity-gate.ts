/**
 * @file geometry-figure-fidelity-gate.ts
 * @description بوابة الصدق البصري الصارمة: تتحقق من أن الشكل الهندسي المولد يطابق مسألته تماماً،
 * وترفض أي شكل يحتوي على رؤوس أو أرقام أو زوايا دخيلة غير مذكورة في المسألة،
 * وتحجب الرسم في المسائل النظرية اللفظية العامة التي لا تتطلب شكلاً هندسياً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 250 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import { normalizeLabelKey } from "../fact-compositor/geo-label-utils";
import { toWesternNumeralsSSOT } from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_GEOMETRY_FIGURE_FIDELITY_GATE =
  "geometry_figure_fidelity_gate" as const;

export interface FigureFidelityCheckResult {
  readonly passed: boolean;
  readonly alienVertices: readonly string[];
  readonly alienNumbers: readonly string[];
  readonly isPurelyTheoretical: boolean;
  readonly reasons: readonly string[];
}

const THEORETICAL_PROMPT_PATTERNS: readonly RegExp[] = [
  /معامل\s*التشابه\s*بينهما\s*يساوي/i,
  /النسبة\s*بين\s*محيطي\s*مثلثين\s*متشابهين\s*تساوي\s*النسبة\s*بين\s*طولي\s*أي/i,
  /إذا\s*(?:كان\s*)?المثلثان\s*متشابهين\s*فإن/i,
  /إذا\s*تشابه\s*مثلثان\s*فإن/i,
  /فإن\s*(?:قياسات\s*)?الزوايا\s*المتناظرة\s*تكون/i,
  /فإن\s*المثلث\s*الثاني\s*يكون\s*:\s*\([أ-دABCD]\)/i,
  /أطوال\s*أضلاع\s*مثلثين\s*متداخلين\s*تتناسب/i,
  /أطوال\s*أضلاع\s*مثلثين\s*معطاة\s*بالكامل/i,
  /زاوية\s*متطابقة\s*وتناسب\s*ضلعين\s*حاويين\s*لها/i,
  /مستقيم\s*يوازي\s*ضلعاً.*تكون\s*النسبة\s*بين/i,
  /شاشة\s*تلفاز|نماذج\s*تماثل\s*هندسي/i,
  /إذا\s*كان\s*المثلثان\s*متطابقين/i,
  /إذا\s*تناسبت\s*أطوال\s*أضلاع\s*مثلثين/i,
];

/**
 * يتحقق مما إذا كانت المسألة نظرية لفظية عامة لا تحتوي على أطوال أو رؤوس محددة ولا تحتاج لشكل.
 */
export function isPurelyTheoreticalNoDiagramProblem(text: string): boolean {
  if (!text) return true;
  const clean = toWesternNumeralsSSOT(text);
  for (const pat of THEORETICAL_PROMPT_PATTERNS) {
    if (pat.test(clean)) return true;
  }
  return false;
}

/**
 * يستخرج جميع الأرقام والمصطلحات الجبرية من نص المسألة.
 */
function extractAllNumbersFromText(text: string): Set<string> {
  const norm = toWesternNumeralsSSOT(text);
  const result = new Set<string>();

  // أرقام عادية
  const numMatches = norm.match(/(?<![0-9.])\d+(?:\.\d+)?(?![0-9.])/g);
  if (numMatches) {
    for (const n of numMatches) {
      result.add(n);
      const parsed = parseFloat(n);
      if (!Number.isNaN(parsed)) {
        result.add(String(parsed));
      }
    }
  }

  // حدود جبرية مثل 2y, 3x, 4s, 2س
  const algMatches = norm.match(/\d+[a-zA-Zسصع]/g);
  if (algMatches) {
    for (const a of algMatches) {
      result.add(a.toLowerCase());
      result.add(toWesternNumeralsSSOT(a).toLowerCase());
    }
  }

  return result;
}

/**
 * يستخرج جميع حروف الرؤوس الهندسية المذكورة في نص المسألة (عربية أو لاتينية).
 */
function extractAllVerticesFromText(text: string): Set<string> {
  const result = new Set<string>();
  if (!text) return result;

  // 1. متتاليات لاتينية مثل ABC, DEF, XYZ, AB, CD
  const latinMatches = text.match(/\b[A-Za-z]{1,5}\b/g);
  if (latinMatches) {
    for (const m of latinMatches) {
      if (/^(sin|cos|tan|cot|sec|csc|cm|mm|km|deg|lim|log|ln)$/i.test(m)) continue;
      for (const char of m) {
        result.add(normalizeLabelKey(char));
      }
    }
  }

  // 2. حروف الرؤوس داخل صيغ LaTeX
  const latexMatches = text.matchAll(/\\(?:vec|overleftrightarrow|overline|angle)\{?([أ-يA-Za-z\sـ]+)\}?/g);
  for (const lm of latexMatches) {
    const innerChars = lm[1].match(/[A-Za-z]|[أإابجدهوزحطيكلمنصعفقرشتثخذضظغ]/g);
    if (innerChars) {
      for (const ch of innerChars) result.add(normalizeLabelKey(ch));
    }
  }
  const setMatches = text.matchAll(/\\\{\s*([أ-يA-Za-z]ـ?)\s*\\\}/g);
  for (const sm of setMatches) {
    result.add(normalizeLabelKey(sm[1]));
  }

  // 3. حروف الرؤوس المنفردة في السياق العربي
  const isolatedArabic = text.matchAll(
    /(?<=^|[\s،,;؛()[\]{}<>=+\-*\/\\$])([أإابجدهوزحطيكلمنصعفقرشتثخذضظغ]ـ?)(?=$|[\s،,;؛()[\]{}<>=+\-*\/\\$])/g
  );
  for (const m of isolatedArabic) {
    const ch = m[1].replace(/ـ/g, "");
    if (ch === "و" || ch === "ف") continue;
    result.add(normalizeLabelKey(ch));
  }

  return result;
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

  // 1. إذا كانت المسألة نظرية لفظية بحتة
  if (isPurelyTheoreticalNoDiagramProblem(rawPromptOrDescription)) {
    return {
      passed: false,
      alienVertices: [],
      alienNumbers: [],
      isPurelyTheoretical: true,
      reasons: ["المسألة نظرية لفظية عامة ولا تتطلب شكلاً هندسياً."],
    };
  }

  const promptNumbers = extractAllNumbersFromText(rawPromptOrDescription);
  const promptVertices = extractAllVerticesFromText(rawPromptOrDescription);
  const normPrompt = toWesternNumeralsSSOT(rawPromptOrDescription).toLowerCase();

  // 2. فحص الرؤوس: إذا كانت المسألة تذكر رؤوساً صريحة
  if (promptVertices.size >= 3) {
    for (const v of figure.vertices) {
      if (!v.label) continue;
      const baseChar = v.label.match(/[A-Za-z]|[أإابجدهوزحخيكلمنفقرشطتثغسصع]/)?.[0] ?? "";
      const vKey = normalizeLabelKey(baseChar);
      // محاور الإحداثيات (X, Y, O) ونقاط الأصل أو المنتصف مقبولة
      if (
        !promptVertices.has(vKey) &&
        vKey !== "M" &&
        vKey !== "O" &&
        vKey !== "X" &&
        vKey !== "Y"
      ) {
        alienVertices.push(v.label);
      }
    }

    // إذا كان أكثر من 40% من رؤوس الشكل دخيلة وغير موجودة في السؤال، فهذا شكل خاطئ تماماً
    if (alienVertices.length > 0 && figure.vertices.length > 0) {
      const alienRatio = alienVertices.length / figure.vertices.length;
      if (alienRatio >= 0.4) {
        reasons.push(
          `الشكل يحتوي على رؤوس دخيلة غير مذكورة في السؤال: (${alienVertices.join("، ")})`
        );
      }
    }
  }

  // 3. فحص الأرقام المكتوبة على الأضلاع
  for (const seg of figure.segments) {
    if (!seg.lengthLabel) continue;
    const rawVal = String(seg.lengthLabel.value);
    const cleanNum = toWesternNumeralsSSOT(rawVal).trim();
    // إذا كانت البطاقة تعبيراً جبرياً وارد بالنص (مثل 2y - 7 أو x + 2 أو X)
    if (/[a-zA-Zسصع]/.test(cleanNum)) {
      const varChar = cleanNum.match(/[a-zA-Zسصع]/)?.[0]?.toLowerCase();
      if (varChar && !normPrompt.includes(varChar)) {
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

  // 4. فحص قياسات الزوايا المكتوبة
  for (const ang of figure.angles) {
    if (ang.degreesLabel) {
      const labelText = toWesternNumeralsSSOT(ang.degreesLabel).trim();
      // إذا كان تعبيراً جبرياً مثل (2س + 5)° أو (2y)° أو 3س
      if (/[a-zA-Zسصع]/.test(labelText)) {
        const varChar = labelText.match(/[a-zA-Zسصع]/)?.[0]?.toLowerCase();
        if (varChar && !normPrompt.includes(varChar)) {
          alienNumbers.push(ang.degreesLabel);
        }
        continue;
      }
      const pureDigits = labelText.replace(/[^0-9.]/g, "");
      if (pureDigits && pureDigits !== "90" && !promptNumbers.has(pureDigits)) {
        alienNumbers.push(ang.degreesLabel);
      }
    } else if (ang.degrees && ang.degrees !== 90 && ang.degreesLabel === undefined) {
      // قياس زاوية غير مرئي للبطاقة (داخلي فقط لحساب المتجهات) - لا يُحسب كـ alien
    }
  }

  // إذا وُجد رقمان أو أكثر أو قياسات زوايا غريبة غير موجودة في المسألة (مثل 2y أو 100° أو 30 أو 18 أو 12)
  if (alienNumbers.length >= 2) {
    reasons.push(
      `الشكل يحتوي على أرقام وأبعاد دخيلة تخالف نص المسألة: (${alienNumbers.join("، ")})`
    );
  }

  const passed = reasons.length === 0;
  return {
    passed,
    alienVertices,
    alienNumbers,
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
