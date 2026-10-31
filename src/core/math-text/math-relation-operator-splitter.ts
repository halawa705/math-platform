/**
 * @file math-relation-operator-splitter.ts
 * @description يقسّم تعبيراً رياضياً عند علامات العلاقة في المستوى الأعلى فقط (خارج الأقواس)،
 * ويحوّل علامات العلاقة والعمليات الحدّية إلى رموز Unicode لتُكتب في سياق RTL الطبيعي.
 */

export const MODULE_ID_MATH_RELATION_OPERATOR_SPLITTER =
  "math_relation_operator_splitter" as const;

import { isEscapedAt } from "./math-balanced-brace-scanner";

export const RELATION_LATEX_TO_UNICODE: ReadonlyArray<readonly [string, string]> = [
  ["\\Leftrightarrow", "⇔"], ["\\Rightarrow", "⇒"], ["\\implies", "⇒"], ["\\approx", "≈"],
  ["\\iff", "⇔"], ["\\neq", "≠"], ["\\leq", "≤"], ["\\geq", "≥"], ["\\le", "≤"],
  ["\\ge", "≥"], ["\\ne", "≠"], ["=", "="], ["<", "<"], [">", ">"],
];

export type RelationSplitPart =
  | { readonly kind: "expr"; readonly latex: string }
  | { readonly kind: "relation"; readonly symbol: string };

export function splitAtTopLevelRelations(latex: string): RelationSplitPart[] {
  const parts: RelationSplitPart[] = [];
  let buffer = "";
  let depth = 0;
  let i = 0;
  while (i < latex.length) {
    const ch = latex[i];
    if ((ch === "{" || ch === "}") && !isEscapedAt(latex, i)) depth += ch === "{" ? 1 : -1;
    const hit =
      depth === 0
        ? RELATION_LATEX_TO_UNICODE.find(
            ([token]) =>
              latex.startsWith(token, i) &&
              !(token.startsWith("\\") && /[A-Za-z]/.test(latex[i + token.length] ?? ""))
          )
        : undefined;
    if (hit) {
      parts.push({ kind: "expr", latex: buffer });
      parts.push({ kind: "relation", symbol: hit[1] });
      buffer = "";
      i += hit[0].length;
      continue;
    }
    buffer += ch;
    i++;
  }
  parts.push({ kind: "expr", latex: buffer });
  return parts;
}

const OPERATOR_TO_TEXT: Readonly<Record<string, string>> = {
  "\\times": "×", "\\div": "÷", "\\cdot": "·", "+": "+", "-": "−",
};

/** يقسم مقطعاً رياضياً قبل `\therefore` أو `\because` في المستوى الأعلى لفصل جواب الشرط عن فعل الجملة العربية السابق له. */
export function splitAtTopLevelThereforeBecause(latex: string): string[] {
  const parts: string[] = [];
  let buffer = "";
  let depth = 0;
  let i = 0;
  while (i < latex.length) {
    const ch = latex[i];
    if ((ch === "{" || ch === "}" || ch === "(" || ch === ")") && !isEscapedAt(latex, i)) {
      depth += ch === "{" || ch === "(" ? 1 : -1;
    }
    if (depth === 0 && buffer.trim().length > 0) {
      const rest = latex.slice(i);
      const hit = rest.match(/^(\\therefore|\\because|∴|∵)(?![A-Za-z])/);
      if (hit) {
        parts.push(buffer.trim());
        buffer = hit[0];
        i += hit[0].length;
        continue;
      }
    }
    buffer += ch;
    i++;
  }
  if (buffer.trim()) parts.push(buffer.trim());
  return parts.length > 0 ? parts : [latex];
}

function matchLeadingRelation(s: string): readonly [string, string] | undefined {
  return RELATION_LATEX_TO_UNICODE.find(
    ([token]) =>
      s.startsWith(token) &&
      !(token.startsWith("\\") && /[A-Za-z]/.test(s[token.length] ?? ""))
  );
}

function matchTrailingRelation(s: string): readonly [string, string] | undefined {
  return RELATION_LATEX_TO_UNICODE.find(([token]) => s.endsWith(token));
}

/** يفصل العلاقات والعمليات الحدّية الزائدة على طرفي التعبير فقط (دون كسر المعادلة الداخلية) لتكتب نصاً بجوار العربي. */
export function peelDanglingEdgeOperators(expr: string): {
  readonly leading: readonly string[];
  readonly core: string;
  readonly trailing: readonly string[];
} {
  let core = expr.trim();
  const leading: string[] = [];
  const trailing: string[] = [];
  let changed = true;
  while (changed) {
    changed = false;
    const noise = core.match(/^(?:\\qquad|\\quad|\\,|,)\s*/);
    if (noise) { core = core.slice(noise[0].length).trim(); changed = true; continue; }
    const leadRel = matchLeadingRelation(core);
    if (leadRel) {
      leading.push(leadRel[1]);
      core = core.slice(leadRel[0].length).trim();
      changed = true;
      continue;
    }
    const lead = core.match(/^(\\times|\\div|\\cdot)(?![A-Za-z])\s*|^([+-])\s+/);
    if (lead) {
      leading.push(OPERATOR_TO_TEXT[lead[1] ?? lead[2]]);
      core = core.slice(lead[0].length).trim();
      changed = true;
      continue;
    }
    const tailNoise = core.match(/\s*(?:\\qquad|\\quad|,)\s*$/);
    if (tailNoise) { core = core.slice(0, core.length - tailNoise[0].length).trim(); changed = true; continue; }
    const tailRel = matchTrailingRelation(core);
    if (tailRel) {
      trailing.unshift(tailRel[1]);
      core = core.slice(0, core.length - tailRel[0].length).trim();
      changed = true;
      continue;
    }
    const tail = core.match(/\s*(\\times|\\div|\\cdot|[+-])\s*$/);
    if (tail) {
      trailing.unshift(OPERATOR_TO_TEXT[tail[1]]);
      core = core.slice(0, core.length - tail[0].length).trim();
      changed = true;
    }
  }
  return { leading, core: core.trim(), trailing };
}
