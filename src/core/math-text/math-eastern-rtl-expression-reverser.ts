/**
 * @file math-eastern-rtl-expression-reverser.ts
 * @description عاكس اتجاه التعبيرات الحسابية والرياضية عند اختيار الأرقام المشرقية (٠-٩):
 * لأن KaTeX يرصّ الرموز من اليسار لليمين داخل <bdi dir="ltr">، فإن `738 - 218 = \dots`
 * كانت تظهر بصرياً من اليمين لليسار مقلوبة (`... = ٢١٨ - ٧٣٨`). يقوم هذا المحرك بعكس ترتيب
 * الحدود والعمليات الثنائية والعلاقات (مع قلب اتجاه المتباينات والأسهم) لتُقرأ من اليمين لليسار
 * (`٧٣٨ - ٢١٨ = ...`) بدقة رياضية تامة في الطرح والقسمة والمعادلات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 160 سطراً).
 */

import { extractBalancedBraces, isEscapedAt } from "./math-balanced-brace-scanner";

export const MODULE_ID_MATH_EASTERN_RTL_EXPRESSION_REVERSER =
  "math_eastern_rtl_expression_reverser" as const;

const COMMAND_OPERATORS_LONGEST_FIRST: readonly string[] = [
  "\\Longleftrightarrow", "\\Leftrightarrow", "\\longrightarrow", "\\longleftarrow",
  "\\Rightarrow", "\\Leftarrow", "\\leftrightarrow", "\\rightarrow", "\\leftarrow",
  "\\implies", "\\iff", "\\approx", "\\equiv", "\\times", "\\div", "\\cdot",
  "\\neq", "\\leq", "\\geq", "\\sim", "\\cong", "\\ne", "\\le", "\\ge", "\\pm", "\\mp", "\\to",
];

const SYMBOL_OPERATORS_LONGEST_FIRST: readonly string[] = [
  "<=", ">=", "!=", "=", "<", ">", "+", "-", "−", "×", "÷", "±", "≠", "≤", "≥", "≈", "→", "←", ",", "،",
];

const UNARY_CAPABLE_OPERATORS: ReadonlySet<string> = new Set(["+", "-", "−", "\\pm", "\\mp", "±"]);

const DIRECTIONAL_OPERATOR_MIRROR: Readonly<Record<string, string>> = {
  "<": ">",
  ">": "<",
  "<=": ">=",
  ">=": "<=",
  "≤": "≥",
  "≥": "≤",
  "\\le": "\\ge",
  "\\leq": "\\geq",
  "\\ge": "\\le",
  "\\geq": "\\leq",
  "\\rightarrow": "\\leftarrow",
  "\\to": "\\leftarrow",
  "\\leftarrow": "\\rightarrow",
  "\\longrightarrow": "\\longleftarrow",
  "\\longleftarrow": "\\longrightarrow",
  "\\Rightarrow": "\\Leftarrow",
  "\\implies": "\\Leftarrow",
  "\\Leftarrow": "\\Rightarrow",
  "→": "←",
  "←": "→",
};

/** يتحقق من أن التعبير حسابي عددي خالص (بلا متغيرات جبرية أو رموز هندسية) ليعكس اتجاهه في وضع الأرقام المشرقية. */
export function shouldReverseForEasternRtl(latex: string): boolean {
  if (!latex) return false;
  if (/\\(?:angle|triangle|overline|overrightarrow|overleftrightarrow|widehat|vec)\b|[∠△]/.test(latex)) {
    return false;
  }
  if (/[\u0621-\u064A]/.test(latex)) {
    return false;
  }
  const stripped = latex.replace(/\\[a-zA-Z]+/g, " ");
  return !/[a-zA-Z]/.test(stripped);
}

function matchOperatorAt(src: string, index: number): string | null {
  const slice = src.slice(index);
  for (const cmd of COMMAND_OPERATORS_LONGEST_FIRST) {
    if (slice.startsWith(cmd) && !/[a-zA-Z]/.test(slice[cmd.length] ?? "")) {
      return cmd;
    }
  }
  for (const sym of SYMBOL_OPERATORS_LONGEST_FIRST) {
    if (slice.startsWith(sym)) return sym;
  }
  return null;
}

function reverseInnerGroups(src: string): string {
  let out = "";
  let i = 0;
  while (i < src.length) {
    const fracMatch = src.slice(i).match(/^\\(d?frac|tfrac)\s*(?=\{)/);
    if (fracMatch) {
      const cmd = fracMatch[0];
      const numGroup = extractBalancedBraces(src, i + cmd.length);
      if (numGroup) {
        let nextIdx = numGroup.endIndex + 1;
        while (nextIdx < src.length && /\s/.test(src[nextIdx])) nextIdx++;
        const denGroup = extractBalancedBraces(src, nextIdx);
        if (denGroup) {
          out += `\\${fracMatch[1]}{${reverseSegment(numGroup.content)}}{${reverseSegment(denGroup.content)}}`;
          i = denGroup.endIndex + 1;
          continue;
        }
      }
    }

    const sqrtMatch = src.slice(i).match(/^\\sqrt(\s*\[[^\]]*\])?\s*(?=\{)/);
    if (sqrtMatch) {
      const grp = extractBalancedBraces(src, i + sqrtMatch[0].length);
      if (grp) {
        out += `\\sqrt${sqrtMatch[1] ?? ""}{${reverseSegment(grp.content)}}`;
        i = grp.endIndex + 1;
        continue;
      }
    }

    if (src.slice(i).startsWith("\\{")) {
      const closeIdx = src.indexOf("\\}", i + 2);
      if (closeIdx > i + 2) {
        out += `\\{${reverseSegment(src.slice(i + 2, closeIdx))}\\}`;
        i = closeIdx + 2;
        continue;
      }
    }

    if (src[i] === "(" && !isEscapedAt(src, i)) {
      let depth = 1;
      let j = i + 1;
      while (j < src.length && depth > 0) {
        if (src[j] === "(" && !isEscapedAt(src, j)) depth++;
        else if (src[j] === ")" && !isEscapedAt(src, j)) depth--;
        j++;
      }
      if (depth === 0) {
        out += `(${reverseSegment(src.slice(i + 1, j - 1))})`;
        i = j;
        continue;
      }
    }

    out += src[i];
    i++;
  }
  return out;
}

function reverseSegment(raw: string): string {
  const src = reverseInnerGroups(raw.trim());
  const operands: string[] = [];
  const operators: string[] = [];
  let current = "";
  let braceDepth = 0;
  let bracketDepth = 0;
  let parenDepth = 0;

  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if ((ch === "{" || ch === "}") && !isEscapedAt(src, i)) {
      braceDepth = Math.max(0, braceDepth + (ch === "{" ? 1 : -1));
      current += ch;
      i++;
      continue;
    }
    if ((ch === "[" || ch === "]") && !isEscapedAt(src, i)) {
      bracketDepth = Math.max(0, bracketDepth + (ch === "[" ? 1 : -1));
      current += ch;
      i++;
      continue;
    }
    if ((ch === "(" || ch === ")") && !isEscapedAt(src, i)) {
      parenDepth = Math.max(0, parenDepth + (ch === "(" ? 1 : -1));
      current += ch;
      i++;
      continue;
    }

    if (braceDepth === 0 && bracketDepth === 0 && parenDepth === 0) {
      const op = matchOperatorAt(src, i);
      if (op) {
        const isUnary = UNARY_CAPABLE_OPERATORS.has(op) && current.trim() === "";
        if (!isUnary) {
          operands.push(current.trim());
          operators.push(op);
          current = "";
          i += op.length;
          continue;
        }
      }
    }

    current += ch;
    i++;
  }
  operands.push(current.trim());

  if (operators.length === 0) return src;

  const resultParts: string[] = [];
  for (let k = operands.length - 1; k >= 0; k--) {
    if (operands[k]) resultParts.push(operands[k]);
    if (k > 0) {
      const rawOp = operators[k - 1];
      const mirrored = DIRECTIONAL_OPERATOR_MIRROR[rawOp] ?? rawOp;
      resultParts.push(mirrored);
    }
  }
  return resultParts.join(" ");
}

export function reverseLatexForEasternRtl(latex: string): string {
  if (!shouldReverseForEasternRtl(latex)) return latex;
  const hasDisplay = /^\s*\\displaystyle\b/.test(latex);
  const core = latex.replace(/^\s*\\displaystyle\s*/, "");
  const reversed = reverseSegment(core);
  return hasDisplay ? `\\displaystyle ${reversed}` : reversed;
}
