/**
 * @file math-safe-solution-steps-splitter.ts
 * @description مقسّم خطوات الحل النموذجي الآمن رياضياً: يفصل الخطوات عند الأسطر الجديدة أو الفاصل ` | `
 * خارج محددات الصيغ الرياضية (`$...$` / `$$...$$`) فقط، لمنع تمزيق القيمة المطلقة مثل `$|-2| = 2$`
 * أو رموز التوازي والانقسام الرياضي داخل الخطوة الواحدة.
 */

export const MODULE_ID_MATH_SAFE_SOLUTION_STEPS_SPLITTER =
  "math_safe_solution_steps_splitter" as const;

/**
 * يقسم نص خطوات الحل إلى مصفوفة أسطر خام مع احترام حدود `$` و`$$` وعدم كسر `$|x|$`.
 */
export function splitRawSolutionStepsMathSafe(rawStepsText: string): string[] {
  if (!rawStepsText) return [];

  const result: string[] = [];
  let current = "";
  let inMath = false;
  let mathDelimiterLen: 1 | 2 = 1;
  const len = rawStepsText.length;

  for (let i = 0; i < len; i++) {
    const ch = rawStepsText[i];

    // تجاهل المحارف المهربة بـ backslash مثل \$
    if (ch === "\\" && i + 1 < len) {
      current += ch + rawStepsText[i + 1];
      i++;
      continue;
    }

    // تتبع محددات LaTeX ($ أو $$)
    if (ch === "$") {
      const isDouble = rawStepsText[i + 1] === "$";
      if (!inMath) {
        inMath = true;
        mathDelimiterLen = isDouble ? 2 : 1;
      } else if (mathDelimiterLen === 2 && isDouble) {
        inMath = false;
      } else if (mathDelimiterLen === 1 && !isDouble) {
        inMath = false;
      }
      current += isDouble ? "$$" : "$";
      if (isDouble) i++;
      continue;
    }

    // كسر السطر الفعلي (إذا لم نكن داخل معادلة مفتوحة غير مغلقة؛ أو إذا أغلقناها)
    if (ch === "\r" || ch === "\n") {
      if (!inMath) {
        result.push(current);
        current = "";
        while (i + 1 < len && (rawStepsText[i + 1] === "\r" || rawStepsText[i + 1] === "\n")) {
          i++;
        }
        continue;
      }
      // إن كان هناك سطر جديد حقيقي وسط $ مفتوحة بالخطأ من المصدر، نغلق حالة المعادلة على السطر حتى لا يبتلع بقية الخطوات
      inMath = false;
      result.push(current);
      current = "";
      while (i + 1 < len && (rawStepsText[i + 1] === "\r" || rawStepsText[i + 1] === "\n")) {
        i++;
      }
      continue;
    }

    // فاصل الجدول/القائمة ` | ` خارج الرياضيات فقط (وليس `||`)
    if (
      !inMath &&
      ch === "|" &&
      rawStepsText[i + 1] !== "|" &&
      rawStepsText[i - 1] !== "|" &&
      /\s/.test(rawStepsText[i - 1] ?? "") &&
      /\s/.test(rawStepsText[i + 1] ?? "")
    ) {
      result.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  if (current.length > 0) {
    result.push(current);
  }

  return result;
}
