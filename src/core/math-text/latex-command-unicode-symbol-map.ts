/**
 * @file latex-command-unicode-symbol-map.ts
 * @description خريطة واحدة من أوامر LaTeX البسيطة إلى رموز Unicode، تُستخدم في النص الخارجي
 * وفي التدهور الآمن عند فشل KaTeX (لا يظهر backslash أبداً).
 */

export const MODULE_ID_LATEX_COMMAND_UNICODE_SYMBOL_MAP =
  "latex_command_unicode_symbol_map" as const;

export const LATEX_COMMAND_TO_UNICODE: Readonly<Record<string, string>> = {
  times: "×", div: "÷", pm: "±", mp: "∓", cdot: "·",
  le: "≤", leq: "≤", ge: "≥", geq: "≥", ne: "≠", neq: "≠", approx: "≈", equiv: "≡",
  cong: "≅", sim: "∼", perp: "⊥", parallel: "∥", angle: "∠", triangle: "△", Delta: "Δ",
  Rightarrow: "⇒", implies: "⇒", iff: "⇔", Leftrightarrow: "⇔", rightarrow: "→", to: "→",
  in: "∈", notin: "∉", subset: "⊂", subseteq: "⊆", cup: "∪", cap: "∩",
  infty: "∞", pi: "π", theta: "θ", alpha: "α", beta: "β", gamma: "γ", sigma: "σ", mu: "μ",
  lambda: "λ", omega: "ω", sum: "Σ", therefore: "∴", because: "∵", dots: "…", ldots: "…",
  circ: "°", degree: "°", emptyset: "∅", varnothing: "∅", phi: "∅",
  quad: " ", qquad: " ", left: "", right: "", displaystyle: "", limits: "",
  sin: "sin", cos: "cos", tan: "tan", cot: "cot", sec: "sec", csc: "csc", log: "log", ln: "ln",
};

export function latexCommandToUnicode(commandName: string): string {
  return LATEX_COMMAND_TO_UNICODE[commandName] ?? "";
}
