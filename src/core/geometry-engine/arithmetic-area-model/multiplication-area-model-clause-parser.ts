/**
 * @file multiplication-area-model-clause-parser.ts
 * @description محلل حتمي لمسائل ووسوم نموذج مساحة المستطيل للضرب (أعداد صحيحة وعشرية، شبكات حتى 3×3)،
 * مع استخراج الأبعاد الرأسية والأفقية ومواقع الخلايا الصريحة والمجاهيل دون اختلاق أرقام افتراضية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 195 سطراً).
 */

export const MODULE_ID_MULTIPLICATION_AREA_MODEL_CLAUSE_PARSER =
  "multiplication_area_model_clause_parser" as const;

export interface AreaModelMultiplicationSpec {
  readonly kind: "multiplication";
  readonly topColumns: readonly string[];
  readonly sideRows: readonly string[];
  readonly cellValues: readonly (readonly string[])[];
}

const EASTERN_TO_WESTERN_DIGITS: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

export function normalizeDigitsToWestern(val: string): string {
  return val.replace(/[٠-٩]/g, (d) => EASTERN_TO_WESTERN_DIGITS[d] ?? d);
}

export function sanitizeMathToken(raw: string): string {
  return raw
    .replace(/[`$\\]/g, "")
    .replace(/(?<=\d),(?=\d{3}\b)/g, "")
    .replace(/[،\s]/g, "")
    .replace(/[.;:]+$/g, "")
    .trim();
}

function sanitizeCellValueToken(raw: string): string {
  return raw
    .replace(/[`$\\]/g, "")
    .replace(/(?<=\d),(?=\d{3}\b)/g, "")
    .replace(/[\s،]+$/g, "")
    .replace(/[.;:]+$/g, "")
    .trim();
}

export function isSymbolicAreaModelUnknown(val: string): boolean {
  const clean = val.replace(/[`$\s]/g, "").trim();
  if (!clean) return false;
  if (/^[0-9٠-٩]+(?:[.,][0-9٠-٩]+)?$/.test(clean)) return false;
  return /^(?:[?؟]|[A-Za-z]|س|ص|ع|ك|م|ن|أ|ب|جـ?)$/.test(clean);
}

function decomposeInteger(intStr: string): string[] {
  const parts: string[] = [];
  const len = intStr.length;
  for (let i = 0; i < len; i++) {
    const digit = intStr[i];
    if (digit !== "0") {
      parts.push(digit + "0".repeat(len - 1 - i));
    }
  }
  return parts.length > 0 ? parts : [intStr];
}

export function decomposeNumberToExpandedForm(valRaw: string): string[] {
  const clean = normalizeDigitsToWestern(sanitizeMathToken(valRaw));
  if (!clean) return [];

  if (clean.includes(".")) {
    const [intPart, decPart] = clean.split(".");
    const parts: string[] = [];
    if (intPart && intPart !== "0") {
      parts.push(...decomposeInteger(intPart));
    }
    if (decPart) {
      for (let i = 0; i < decPart.length; i++) {
        const digit = decPart[i];
        if (digit !== "0") {
          parts.push("0." + "0".repeat(i) + digit);
        }
      }
    }
    return parts.length > 0 ? parts : [clean];
  }

  return decomposeInteger(clean);
}

function extractDimensionTokens(segment: string): string[] {
  const tokens = segment.match(/[0-9]+(?:\.[0-9]+)?|[A-Za-z]|س|ص|ع|؟|\?/g);
  return tokens ? tokens.map(sanitizeMathToken).filter(Boolean) : [];
}

function formatComputedProduct(rowVal: string, colVal: string): string {
  if (isSymbolicAreaModelUnknown(rowVal) || isSymbolicAreaModelUnknown(colVal)) {
    return "؟";
  }
  const nR = Number(rowVal);
  const nC = Number(colVal);
  if (!Number.isFinite(nR) || !Number.isFinite(nC)) return "؟";
  const prod = nR * nC;
  if (Number.isInteger(prod)) return String(prod);
  return parseFloat(prod.toFixed(6)).toString();
}

export function parseMultiplicationAreaModelClauses(
  rawText: string
): AreaModelMultiplicationSpec | null {
  if (!rawText) return null;
  const normalized = normalizeDigitsToWestern(
    rawText
      .replace(/[`]/g, " ")
      .replace(/\\times/gi, "×")
      .replace(/\\\(|\\\)/g, " ")
      .replace(/\$/g, " ")
  );

  // إزالة واصف أبعاد الشبكة مثل "مقسم 2x2" حتى لا يُقرأ كعملية ضرب 2 × 2
  const textWithoutGridDims = normalized.replace(
    /(?:مقسم(?:\s*إلى)?|شبكة|أجزاء|خانات)\s*[0-9]+\s*[×x*]\s*[0-9]+/gi,
    " "
  );

  let sideRows: string[] = [];
  let topColumns: string[] = [];

  const verticalMatch = normalized.match(
    /(?:الأبعاد\s*الرأسية|أبعاده\s*الرأسية|العرض\s*الرأسي|يسار\s*المستطيل)\s*[:=]?\s*([^\n;؛\]]+?)(?=\s*(?:[;؛]|و?\s*(?:الأبعاد\s*الأفقية|أبعاده\s*الأفقية|الأفقية|الطول\s*الأفقي|مساحات|نواتج|المطلوب|\]|$)))/i
  );
  if (verticalMatch?.[1]) {
    sideRows = extractDimensionTokens(verticalMatch[1]);
  }

  const horizontalMatch = normalized.match(
    /(?:الأبعاد\s*الأفقية|أبعاده\s*الأفقية|الأفقية|الطول\s*الأفقي|أعلى\s*المستطيل)\s*[:=]?\s*([^\n;؛\]]+?)(?=\s*(?:[;؛]|مساحات|نواتج|المطلوب|\]|$))/i
  );
  if (horizontalMatch?.[1]) {
    topColumns = extractDimensionTokens(horizontalMatch[1]);
  }

  if (sideRows.length === 0) {
    const rowsMatch = normalized.match(
      /صفين\s*(?:للعدد[^\(]*)?\s*(?:\(([^\)]+)\)|([0-9.\s]+و\s*[0-9.\s]+))/i
    );
    const rawRows = rowsMatch?.[1] ?? rowsMatch?.[2];
    if (rawRows) sideRows = extractDimensionTokens(rawRows);
  }

  if (topColumns.length === 0) {
    const colsMatch = normalized.match(
      /(?:عمودين|ثلاثة\s*أعمدة|أربعة\s*أعمدة)\s*(?:للعدد[^\(]*)?\s*(?:\(([^\)]+)\)|([0-9.\s]+و\s*[0-9.\s]+))/i
    );
    const rawCols = colsMatch?.[1] ?? colsMatch?.[2];
    if (rawCols) topColumns = extractDimensionTokens(rawCols);
  }

  if (topColumns.length === 0 || sideRows.length === 0) {
    const mulMatch = textWithoutGridDims.match(
      /([0-9]+(?:\.[0-9]+)?)\s*(?:[×*]|\sx\s)\s*([0-9]+(?:\.[0-9]+)?)/i
    );
    if (!mulMatch) return null;
    const d1 = decomposeNumberToExpandedForm(mulMatch[1]);
    const d2 = decomposeNumberToExpandedForm(mulMatch[2]);
    if (d1.length === 0 || d2.length === 0) return null;
    if (d1.length >= d2.length) {
      topColumns = d1;
      sideRows = d2;
    } else {
      topColumns = d2;
      sideRows = d1;
    }
  }

  if (topColumns.length === 0 || sideRows.length === 0) return null;

  const cellGrid: string[][] = sideRows.map((r) =>
    topColumns.map((c) => formatComputedProduct(r, c))
  );

  const numRows = sideRows.length;
  const numCols = topColumns.length;
  let hasPositionalCell = false;

  const applyPositional = (re: RegExp, rIdx: number, cIdx: number) => {
    const m = normalized.match(re);
    if (!m?.[1] || rIdx < 0 || rIdx >= numRows || cIdx < 0 || cIdx >= numCols) return;
    const tok = sanitizeCellValueToken(m[1]);
    if (tok) {
      cellGrid[rIdx][cIdx] = tok;
      hasPositionalCell = true;
    }
  };

  applyPositional(/أعلى\s*يسار\s*[:=]\s*([^\s;؛،\]]+)/i, 0, 0);
  if (numCols >= 3) applyPositional(/أعلى\s*(?:وسط|منتصف)\s*[:=]\s*([^\s;؛،\]]+)/i, 0, 1);
  applyPositional(/أعلى\s*يمين\s*[:=]\s*([^\s;؛،\]]+)/i, 0, numCols - 1);
  applyPositional(/أسفل\s*يسار\s*[:=]\s*([^\s;؛،\]]+)/i, numRows - 1, 0);
  if (numCols >= 3) applyPositional(/أسفل\s*(?:وسط|منتصف)\s*[:=]\s*([^\s;؛،\]]+)/i, numRows - 1, 1);
  applyPositional(/أسفل\s*يمين\s*[:=]\s*([^\s;؛،\]]+)/i, numRows - 1, numCols - 1);

  if (
    !hasPositionalCell &&
    numRows === 2 &&
    numCols === 2 &&
    /(?:الخانة\s*(?:الأولى|أعلى)[\s\S]*?(?:المتغير|المجهول))/i.test(normalized)
  ) {
    const unknownVar = normalized.match(/(?:المتغير|المجهول)\s*([^\s،,;؛\]]+)/i)?.[1];
    const otherNumsMatch = normalized.match(
      /(?:تحتوي(?:\s*على)?\s*الأعداد|الأخرى\s*تحتوي(?:\s*على)?(?:\s*الأعداد)?)\s*([0-9.\s،,]+)/i
    );
    const otherNums = otherNumsMatch?.[1]?.match(/[0-9]+(?:\.[0-9]+)?/g);
    if (unknownVar) {
      const cleanVar = sanitizeCellValueToken(unknownVar);
      cellGrid[0][0] = cleanVar;
      if (otherNums && otherNums.length >= 3) {
        cellGrid[0][1] = otherNums[0];
        cellGrid[1][0] = otherNums[1];
        cellGrid[1][1] = otherNums[2];
      }
    }
  }

  return {
    kind: "multiplication",
    topColumns,
    sideRows,
    cellValues: cellGrid,
  };
}
