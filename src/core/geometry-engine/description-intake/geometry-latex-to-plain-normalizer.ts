/**
 * @file geometry-latex-to-plain-normalizer.ts
 * @description المرحلة 1 من استقبال وصف NotebookLM: يحوّل لغة LaTeX المختلطة بالعربية (`$\triangle ABC$`, `m(\angle B)=90^\circ`,
 * `\overline{AB}`, `\parallel`...) إلى نص رمزي بسيط يفهمه محلل الحقائق (مثلث ABC، ق(∠ B) = 90°، AB، //).
 */
import { healFourRaysHallucination } from "@/core/ingestion/notebooklm-citation-latex-sanitizer";

export const MODULE_ID_GEOMETRY_LATEX_TO_PLAIN_NORMALIZER = "geometry_latex_to_plain_normalizer" as const;

const WRAPPER_COMMANDS = /\\(?:overline|overrightarrow|overleftrightarrow|overleftarrow|vec|bar|underline|text|textbf|mathrm|mathit|mathbf|operatorname)\s*\{([^{}]*)\}/g;

export function convertGeometryLatexToPlainText(raw: string): string {
  const healed = healFourRaysHallucination(String(raw ?? ""));
  let t = healed.replace(/[\u064B-\u0652\u0670]/g, "");
  t = t
    .replace(/\\(?:left|right|displaystyle)\b/g, "")
    .replace(/\\[,;:! ]/g, " ")
    .replace(/\\\{/g, "{").replace(/\\\}/g, "}")
    .replace(/\\%/g, "%");
  // أغلفة تُفرَّغ إلى محتواها (قد تكون متداخلة)
  for (let i = 0; i < 3; i++) t = t.replace(WRAPPER_COMMANDS, "$1");
  t = t
    .replace(/\\(?:widehat|hat)\s*\{([^{}]*)\}/g, "∠$1")
    .replace(/\\(?:bigtriangleup|triangle|Delta)\b|[Δ▲△]/g, " مثلث ")
    .replace(/\\(?:measuredangle|angle)\b/g, " ∠ ")
    .replace(/\^\s*(?:\{\s*\\circ\s*\}|\\circ)\b|\\circ\b|°/g, "°")
    .replace(/°(?=[^\s،,;؛|.)])/g, "° ")
    .replace(/\\(?:parallel|mid)\b|[∥⫽]/g, " // ")
    .replace(/\\perp\b/g, " ⊥ ")
    .replace(/\\in\b/g, " ∈ ")
    .replace(/\\cap\b/g, " ∩ ")
    .replace(/\\(?:sim)\b|[∼～]/g, " ~ ")
    .replace(/\\cong\b|[≅⩯]/g, " ≅ ")
    .replace(/\\(?:cdot|times)\b/g, " × ")
    .replace(/\\sqrt\s*\{([^{}]*)\}/g, "√$1")
    .replace(/\\sqrt\s*(\d+)/g, "√$1")
    .replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "($1)/($2)")
    .replace(/\\(?:ldots|dots|cdots)\b|\.{2,}/g, " ")
    .replace(/\bm\s*\(\s*(?=∠)/g, "ق(")
    .replace(/\bm\s*∠\s*/g, "ق(∠ ").replace(/\bm\s*\(\s*([A-Z]{1,3})\s*\)\s*=/g, "ق(∠ $1) =")
    .replace(/\\[A-Za-z]+/g, " ")
    .replace(/\$+/g, " ")
    .replace(/\bcm\b/gi, " سم ")
    .replace(/\bmm\b/gi, " مم ")
    .replace(/\bkm\b/gi, " كم ")
    .replace(/\bdm\b/gi, " ديسم ")
    .replace(/(?<=\d\s*)m\b(?!\s*\()/gi, " م ")
    .replace(/(?<![A-Za-zء-ي])(سم|مم|كم|ديسم|متر)\s+(\d+(?:\.\d+)?)/g, "$2 $1")
    .replace(/[“”«»]/g, " ")
    .replace(/مثلثان\s+([A-Z]{3})\s*و\s*([A-Z]{3})\s*متشابهان/g, "مثلث $1 ~ $2")
    .replace(/نسبة\s*تشابه\s*(?:مثلث\s*)?([A-Z]{3})\s*(?:إلى|الى|على|لـ?)\s*(?:مثلث\s*)?([A-Z]{3})/g, "مثلث $1 ~ مثلث $2")
    .replace(/\s+/g, " ")
    .trim();
  return t;
}


