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

const ARABIC_ANGLE_LABEL_SRC =
  "(?:[أإابجدهوزحخيكلمنفقرشطتثغسصع]\\u0640?(?:\\s+[أإابجدهوزحخيكلمنفقرشطتثغسصع]\\u0640?){0,4}(?:\\s+(?:المنعكسة|المتممة|المكملة))?|المنعكسة|المتممة|المكملة|حول\\s+نقطة(?:\\s+واحدة)?)";

/** يلتئم أي كسر سابق في `ق(∠...)` أو `m(∠...)` أو المعادلات المقسومة عبر حدود `$` لتعود كتلة رياضية متزنة. */
export function healShatteredAnglesAndEquations(text: string): string {
  let out = text
    .replace(
      /(?:زاوية\s+)?(?:ق|m)\s*\$\s*\(\s*(?:\\angle|∠)/g,
      "$m(\\angle "
    )
    .replace(
      /(?:زاوية\s+)?(?:ق|m)\s*\(\s*\$\s*(?:\\angle|∠)\s*([^$\n]+?)\s*\$\s*(المنعكسة)?\s*\)/g,
      (_m, v: string, r: string | undefined) => `$m(\\angle ${v.trim()}${r ? " \\text{المنعكسة}" : ""})$`
    )
    .replace(
      new RegExp(`(\\\\angle|∠)\\s*([A-Za-z0-9]*)\\s*\\$\\s*(${ARABIC_ANGLE_LABEL_SRC})\\s*\\$\\s*\\)`, "g"),
      (_m, _sym: string, lat: string, ar: string) =>
        `\\angle ${lat ? `${lat} ` : ""}\\text{${ar.trim()}})`
    )
    .replace(
      new RegExp(`\\+\\s*\\(\\s*\\$\\s*(${ARABIC_ANGLE_LABEL_SRC})\\s*\\$\\s*\\)`, "g"),
      (_m, ar: string) => `+ m(\\angle \\text{${ar.trim()}})`
    )
    .replace(
      /(\\angle|∠)\s*\$\s*((?:[أإابجدهوزحخيكلمنفقرشطتثغسصع]\u0640?\s+){2}[أإابجدهوزحخيكلمنفقرشطتثغسصع]\u0640?|[أإابجدهوزحخيكلمنفقرشطتثغسصع]\u0640?)(?=[\s،,.;:!?()\[\]{}]|$)/g,
      "\\angle \\text{$2}$"
    )
    .replace(
      /\$(m\(\\angle\s*[^$\n)]+?)\)?\$\s*المنعكسة(?:\s*\$\s*\)\s*(?:(\$)|(=[^$\n]+\$)))?/g,
      (_m, inner: string, _closeOnly: string | undefined, eqTail: string | undefined) =>
        eqTail
          ? `$${inner.trim()} \\text{ المنعكسة}) ${eqTail.trim()}`
          : `$${inner.trim()} \\text{ المنعكسة})$`
    );

  for (let pass = 0; pass < 4; pass++) {
    out = out.replace(
      /\$([^$\n]+)\$\s*(=|⇒|⟹|⇔)\s*\$([^$\n]+)\$/g,
      (_m, lhs: string, rel: string, rhs: string) => {
        const op = rel === "⇒" || rel === "⟹" ? "\\implies" : rel === "⇔" ? "\\iff" : "=";
        return `$${lhs.trim()} ${op} ${rhs.trim()}$`;
      }
    );
  }
  return out;
}

export function unifyMathDelimiters(raw: string): string {
  if (!raw) return "";
  const unified = raw
    .replace(/\r\n?/g, "\n")
    .replace(/\*\*([^*\n]+)\*\*/g, "$1")
    .replace(/\\+\$/g, "$")
    .replace(/\$\$([\s\S]*?)\$\$/g, (_m, inner: string) => asInlineMath(inner))
    .replace(/\\+\(([\s\S]*?)\\+\)/g, (_m, inner: string) => asInlineMath(inner))
    .replace(/\\+\[([\s\S]*?)\\+\]/g, (_m, inner: string) => asInlineMath(inner))
    .replace(/(سم|مم|كم|م)(\s*\})\s*\^\s*\{?2\}?/g, "$1²$2")
    .replace(/(سم|مم|كم|م)(\s*\})\s*\^\s*\{?3\}?/g, "$1³$2")
    .replace(/(سم|مم|كم|م)\s*(?:\$\s*\^\s*\{?2\}?\s*\$|\^\s*\{?2\}?)/g, "$1²")
    .replace(/(سم|مم|كم|م)\s*(?:\$\s*\^\s*\{?3\}?\s*\$|\^\s*\{?3\}?)/g, "$1³");
  return healShatteredAnglesAndEquations(unified);
}
