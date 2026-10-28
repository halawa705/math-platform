/**
 * @file math-delimiter-unifier.ts
 * @description المرحلة 1 في خط الأنابيب: توحيد كل محددات الرياضيات القادمة من NotebookLM
 * (`\\( .. \\)` و`\( .. \)` و`\[ .. \]` و`$$ .. $$` و`\$`) إلى `$ .. $` أحادي السطر.
 */

export const MODULE_ID_MATH_DELIMITER_UNIFIER = "math_delimiter_unifier" as const;

function collapseToSingleLine(inner: string): string {
  return inner.replace(/\s*\n\s*/g, " ").trim();
}

function asInlineMath(inner: string): string {
  const flat = collapseToSingleLine(inner);
  return flat ? `$${flat}$` : " ";
}

export function unifyMathDelimiters(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/\*\*([^*\n]+)\*\*/g, "$1")
    .replace(/\\+\$/g, "$")
    .replace(/\$\$([\s\S]*?)\$\$/g, (_m, inner: string) => asInlineMath(inner))
    .replace(/\\+\(([\s\S]*?)\\+\)/g, (_m, inner: string) => asInlineMath(inner))
    .replace(/\\+\[([\s\S]*?)\\+\]/g, (_m, inner: string) => asInlineMath(inner));
}
