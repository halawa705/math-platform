/**
 * @file math-balanced-brace-scanner.ts
 * @description ماسح الأقواس المعقوفة المتوازنة لـ LaTeX (يتجاهل `\{` و`\}` المهرّبة).
 */

export const MODULE_ID_MATH_BALANCED_BRACE_SCANNER =
  "math_balanced_brace_scanner" as const;

/** هل الحرف عند الموضع مسبوق بعدد فردي من `\` (أي مهرَّب)؟ */
export function isEscapedAt(str: string, index: number): boolean {
  let count = 0;
  for (let k = index - 1; k >= 0 && str[k] === "\\"; k--) count++;
  return count % 2 === 1;
}

function isStructuralBrace(str: string, index: number): boolean {
  const c = str[index];
  return (c === "{" || c === "}") && !isEscapedAt(str, index);
}

export function extractBalancedBraces(
  str: string,
  startIndex: number
): { content: string; endIndex: number } | null {
  if (str[startIndex] !== "{" || isEscapedAt(str, startIndex)) return null;
  let depth = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (!isStructuralBrace(str, i)) continue;
    if (str[i] === "{") depth++;
    else {
      depth--;
      if (depth === 0) return { content: str.slice(startIndex + 1, i), endIndex: i };
    }
  }
  return null;
}

/** يحذف `}` الزائدة ويغلق `{` المفتوحة، فلا تفشل KaTeX بسبب قوس ناقص. */
export function repairBraceBalance(latex: string): string {
  let depth = 0;
  let out = "";
  for (let i = 0; i < latex.length; i++) {
    if (isStructuralBrace(latex, i)) {
      if (latex[i] === "{") depth++;
      else {
        if (depth === 0) continue;
        depth--;
      }
    }
    out += latex[i];
  }
  return out + "}".repeat(depth);
}
