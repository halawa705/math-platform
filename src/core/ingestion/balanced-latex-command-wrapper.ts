/**
 * @file balanced-latex-command-wrapper.ts
 * @description محرك استخراج وتأطير أوامر LaTeX المتوازنة ومنع تسرب الرموز المكسورة والشرطات المائلة:
 * - يستخرج الأقواس المعقوفة المتوازنة `{...}` للكسور والجذور حتى مع الكسور المركبة والمعادلات المتسلسلة.
 * - يطهر الشرطات المائلة اليتيمة (`\ = $` أو `\div k\`) ويوازن علامات الدولار `$`.
 * - يربط علامة التشابه بين المضلعين (`ABCD ~ XYZW`) داخل صيغة رياضية موحدة `$ABCD \sim XYZW$` لمنع انزلاقها في BiDi.
 * - يربط قياسات الأطوال (`AB = 4 سم`) كوحدة رياضية واحدة متماسكة تمنع ظهور السنتيمتر بجانب الرمز اللاتيني.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

export const MODULE_ID_BALANCED_LATEX_COMMAND_WRAPPER =
  "balanced_latex_command_wrapper" as const;

export function extractBalancedCurlyBraces(
  str: string,
  startIndex: number
): { content: string; endIndex: number } | null {
  if (str[startIndex] !== "{") return null;
  let depth = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === "{") depth++;
    else if (str[i] === "}") {
      depth--;
      if (depth === 0) {
        return { content: str.slice(startIndex + 1, i), endIndex: i };
      }
    }
  }
  return null;
}

export function cleanStrayLatexArtifacts(input: string): string {
  if (!input) return "";
  if (input.includes("\n")) {
    return input
      .split("\n")
      .map((line) => cleanStrayLatexArtifacts(line))
      .join("\n");
  }
  let s = input
    .replace(/\\text\{\s*([\u0600-\u06FF\s،؛:.!؟ـ]{2,})\s*\}/g, " $1 ")
    .replace(/\\+\s*=\s*\$+?|\\+\s*=/g, " = ")
    .replace(/\$+\s*\\+\s*=\s*\$+/g, " = ")
    .replace(/=\s*\\+/g, " = ")
    .replace(/(?:\$+\s*)?\\div\s*([a-zA-Z0-9٠-٩]+)\\+/g, " \\div $1 ")
    .replace(/\\+(?=\s|$|[.,،؛:!؟])/g, " ")
    .replace(/\\quad\b|\\qquad\b/g, " ");

  const dollarCount = (s.match(/\$/g) || []).length;
  if (dollarCount % 2 !== 0) {
    s = s.replace(/(?<=[=+\-*/])\s*\$/g, "").replace(/\$\s*(?=[=+\-*/])/g, "");
    s = s.replace(/^\s*\$(?!\$)/, "").replace(/(?<!\$)\$\s*$/, "");
  }
  return s;
}

export function wrapBalancedLatexCommands(str: string): string {
  if (!str) return "";
  const cleanedInput = cleanStrayLatexArtifacts(str);
  const parts = cleanedInput.split(/(\${1,2}[^\$]+\${1,2})/g);

  for (let p = 0; p < parts.length; p += 2) {
    if (!parts[p]) continue;
    let seg = parts[p];
    let out = "";
    let idx = 0;

    while (idx < seg.length) {
      if (
        seg.startsWith("frac{", idx) &&
        (idx === 0 || /[\s:،(=\-]/.test(seg[idx - 1]))
      ) {
        seg = seg.slice(0, idx) + "\\" + seg.slice(idx);
      }
      if (
        seg.startsWith("sqrt{", idx) &&
        (idx === 0 || /[\s:،(=\-]/.test(seg[idx - 1]))
      ) {
        seg = seg.slice(0, idx) + "\\" + seg.slice(idx);
      }

      if (seg.startsWith("\\frac{", idx) || seg.startsWith("\\sqrt{", idx)) {
        const isFrac = seg.startsWith("\\frac{", idx);
        let currentIdx = idx + 5;
        const firstArg = extractBalancedCurlyBraces(seg, currentIdx);

        if (firstArg) {
          currentIdx = firstArg.endIndex + 1;
          let fullLatex = seg.slice(idx, currentIdx);

          if (isFrac) {
            while (currentIdx < seg.length && /\s/.test(seg[currentIdx])) currentIdx++;
            if (currentIdx < seg.length && seg[currentIdx] === "{") {
              const secondArg = extractBalancedCurlyBraces(seg, currentIdx);
              if (secondArg) {
                currentIdx = secondArg.endIndex + 1;
                fullLatex = seg.slice(idx, currentIdx);
              }
            }
          }

          let scanIdx = currentIdx;
          while (scanIdx < seg.length) {
            while (scanIdx < seg.length && /\s/.test(seg[scanIdx])) scanIdx++;
            const opMatch = seg
              .slice(scanIdx)
              .match(/^(?:[=+\-*\/^]|\\(?:times|div|pm|cdot|le|ge|ne|approx|implies|iff)\b)\s*/);
            if (!opMatch) break;

            let nextIdx = scanIdx + opMatch[0].length;
            if (seg.startsWith("\\frac{", nextIdx) || seg.startsWith("frac{", nextIdx)) {
              if (seg.startsWith("frac{", nextIdx)) {
                seg = seg.slice(0, nextIdx) + "\\" + seg.slice(nextIdx);
              }
              const f1 = extractBalancedCurlyBraces(seg, nextIdx + 5);
              if (!f1) break;
              let afterF1 = f1.endIndex + 1;
              while (afterF1 < seg.length && /\s/.test(seg[afterF1])) afterF1++;
              if (seg[afterF1] !== "{") break;
              const f2 = extractBalancedCurlyBraces(seg, afterF1);
              if (!f2) break;
              scanIdx = f2.endIndex + 1;
            } else if (seg.startsWith("\\sqrt{", nextIdx) || seg.startsWith("sqrt{", nextIdx)) {
              if (seg.startsWith("sqrt{", nextIdx)) {
                seg = seg.slice(0, nextIdx) + "\\" + seg.slice(nextIdx);
              }
              const s1 = extractBalancedCurlyBraces(seg, nextIdx + 5);
              if (!s1) break;
              scanIdx = s1.endIndex + 1;
            } else {
              const termMatch = seg.slice(nextIdx).match(/^(?:[0-9٠-٩a-zA-Z_.]+|\([^()]*\))/);
              if (termMatch) {
                scanIdx = nextIdx + termMatch[0].length;
              } else {
                break;
              }
            }
          }

          if (scanIdx > currentIdx) {
            fullLatex = seg.slice(idx, scanIdx);
            currentIdx = scanIdx;
          }
          out += ` $${fullLatex.trim()}$ `;
          idx = currentIdx;
          continue;
        }
      }
      out += seg[idx];
      idx++;
    }
    parts[p] = out;
  }
  return parts.join("");
}

export function sanitizePolygonSimilarityAndUnitBiDi(input: string): string {
  if (!input) return "";

  // 1. ترويض التشابه المنزلق في BiDi بكل أنماطه (يشابه / ~ / متشابهان / يتشابهان)
  let text = input.replace(
    /(?:(?:المضلعين|المضلع|المثلثين|المثلث)\s+)?([A-Za-z]{2,6})\s*(?:يشابه|\\sim|~|∼)\s*(?:المضلع\s+|المثلث\s+)?([A-Za-z]{2,6})\b/g,
    (_m, p1: string, p2: string) => `المضلع $${p1} \\sim ${p2}$`
  );

  text = text.replace(
    /(?:(?:المضلعين|المضلع|المثلثين|المثلث)\s+)?([A-Za-z]{2,6})\s*و\s*(?:المضلع\s+|المثلث\s+)?([A-Za-z]{2,6})\s*(?:متشابهان|متشابهين|يتشابهان)/g,
    (_m, p1: string, p2: string) => `المضلع $${p1} \\sim ${p2}$`
  );

  text = text.replace(
    /(?:(?:المضلعين|المضلع|متوازيا أضلاع|المثلثين|المثلث)\s+)?(?:~|∼|\\sim)\s*([A-Za-z]{2,6})\s*(?:و|\s)\s*(?:المضلع\s+)?([A-Za-z]{2,6})\b/g,
    (_m, p1: string, p2: string) => `المضلع $${p1} \\sim ${p2}$`
  );

  text = text.replace(
    /(?:المضلع\s+)?([A-Za-z]{2,6})\s+(?:المضلع\s+)?([A-Za-z]{2,6})\s*(?:~|∼|\\sim)(?=$|[\s,،؛:!?.])/g,
    (_m, p1: string, p2: string) => `المضلع $${p1} \\sim ${p2}$`
  );

  text = text.replace(
    /(?<!\$)\b([A-Za-z]{2,6})\s*(?:~|∼|\\sim)\s*(?:المضلع\s+)?([A-Za-z]{2,6})\b(?!\$)/g,
    (_m, p1: string, p2: string) => `$${p1} \\sim ${p2}$`
  );

  text = text.replace(/المضلع\s+المضلع\s+/g, "المضلع ");

  // 2. إصلاح علامة = الملتصقة في بداية كتل $ لتفادي انعكاس BiDi (مثل: محيط الأكبر $= 80$)
  text = text.replace(/\$\s*=\s*([^$]+)\$/g, " = $$$1$$");

  // 3. ربط قياسات الأضلاع والزوايا بوحداتها لتبقى في صيغة LTR منضبطة
  text = text.replace(
    /(?<!\$)\b([A-Za-z]{1,4}\s*=\s*[-+]?[0-9٠-٩]+(?:\.[0-9٠-٩]+)?)\s*(سم²|سم³|م²|م³|سم|مم|كم|متر|لتر|جم|كجم|درجة|دقيقة|ثانية|نيوتن|داين|جول|وات|م\/ث²|م\/ث|كم\/س)(?=$|[\s,،؛:!?.])(?!\$)/g,
    (_m, p1: string, p2: string) => `$${p1}\\text{ ${p2}}$`
  );

  // 4. ربط أي كتلة رياضية تسبق وحدة القياس العربية مباشرة (مثل: $80$ سم أو $5 \times 16 = 80$ سم)
  text = text.replace(
    /\$\s*([^$]+?=[^$]*?[0-9٠-٩]+|[0-9٠-٩]+(?:\.[0-9٠-٩]+)?)\s*\$\s*(سم²|سم³|م²|م³|سم|مم|كم|متر|لتر|جم|كجم|درجة|دقيقة|ثانية|نيوتن|داين|جول|وات|م\/ث²|م\/ث|كم\/س)(?=$|[\s,،؛:!?.])/g,
    "$$$1\\text{ $2}$$"
  );

  return text;
}
