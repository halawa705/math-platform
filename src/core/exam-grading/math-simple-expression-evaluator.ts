/**
 * @file math-simple-expression-evaluator.ts
 * @description مقيّم تعبيرات عددية بسيطة وآمن (بدون eval): + - * / ^ وأقواس و sqrt(x) و pi والأعداد العشرية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 140 سطراً).
 */
export const MODULE_ID_MATH_SIMPLE_EXPRESSION_EVALUATOR = "math_simple_expression_evaluator" as const;

type Tok = { t: "num"; v: number } | { t: "op"; v: string } | { t: "fn" } | { t: "lp" } | { t: "rp" };

function tokenize(src: string): Tok[] | null {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\d|\./.test(ch)) {
      let j = i;
      while (j < src.length && /[\d.]/.test(src[j])) j++;
      const n = Number(src.slice(i, j));
      if (!Number.isFinite(n)) return null;
      out.push({ t: "num", v: n });
      i = j;
    } else if (src.startsWith("sqrt", i)) {
      out.push({ t: "fn" });
      i += 4;
    } else if (src.startsWith("pi", i)) {
      out.push({ t: "num", v: Math.PI });
      i += 2;
    } else if (ch === "(") { out.push({ t: "lp" }); i++; }
    else if (ch === ")") { out.push({ t: "rp" }); i++; }
    else if ("+-*/^".includes(ch)) { out.push({ t: "op", v: ch }); i++; }
    else return null;
  }
  return out;
}

const PREC: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, u: 3, "^": 4 };
const RIGHT = new Set(["^", "u"]);

/** يعيد الناتج العددي أو null إن لم يكن التعبير عددياً صالحاً. */
export function evaluateSimpleMathExpression(input: string): number | null {
  const toks = tokenize(input);
  if (!toks || toks.length === 0) return null;
  const output: Array<number | string> = [];
  const stack: string[] = [];
  let prevIsValue = false;
  for (const tk of toks) {
    if (tk.t === "num") {
      if (prevIsValue) { // ضرب ضمني: 2(3) أو 2pi
        while (stack.length && stack[stack.length - 1] !== "(" && PREC[stack[stack.length - 1]] >= PREC["*"]) output.push(stack.pop()!);
        stack.push("*");
      }
      output.push(tk.v); prevIsValue = true;
    } else if (tk.t === "fn") {
      if (prevIsValue) stack.push("*");
      stack.push("sqrt"); prevIsValue = false;
    } else if (tk.t === "lp") {
      if (prevIsValue) stack.push("*");
      stack.push("("); prevIsValue = false;
    } else if (tk.t === "rp") {
      while (stack.length && stack[stack.length - 1] !== "(") output.push(stack.pop()!);
      if (!stack.length) return null;
      stack.pop();
      if (stack[stack.length - 1] === "sqrt") output.push(stack.pop()!);
      prevIsValue = true;
    } else {
      let op = tk.v;
      if (!prevIsValue) {
        if (op === "-") op = "u"; else if (op === "+") continue; else return null;
      }
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top === "(" || top === "sqrt") break;
        const higher = PREC[top] > PREC[op] || (PREC[top] === PREC[op] && !RIGHT.has(op));
        if (higher) output.push(stack.pop()!); else break;
      }
      stack.push(op); prevIsValue = false;
    }
  }
  while (stack.length) {
    const top = stack.pop()!;
    if (top === "(") return null;
    output.push(top);
  }
  const st: number[] = [];
  for (const item of output) {
    if (typeof item === "number") { st.push(item); continue; }
    if (item === "u" || item === "sqrt") {
      const a = st.pop(); if (a === undefined) return null;
      if (item === "sqrt" && a < 0) return null;
      st.push(item === "u" ? -a : Math.sqrt(a));
    } else {
      const b = st.pop(); const a = st.pop();
      if (a === undefined || b === undefined) return null;
      if (item === "+") st.push(a + b);
      else if (item === "-") st.push(a - b);
      else if (item === "*") st.push(a * b);
      else if (item === "/") { if (b === 0) return null; st.push(a / b); }
      else if (item === "^") st.push(Math.pow(a, b));
      else return null;
    }
  }
  return st.length === 1 && Number.isFinite(st[0]) ? st[0] : null;
}
