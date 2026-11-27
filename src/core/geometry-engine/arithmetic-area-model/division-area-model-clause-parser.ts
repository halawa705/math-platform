/**
 * @file division-area-model-clause-parser.ts
 * @description محلل حتمي لمسائل ووسوم نموذج مساحة المستطيل للقسمة وفق المنهج المصري،
 * يدعم الأعمدة التفصيلية (المقسوم الجزئي - المطروح = المتبقي) أو نواتج القسمة العلوية أو التفكيك المكاني الحقيقي،
 * ويرفض توليد أي نموذج وهمي عند غياب المعطيات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 195 سطراً).
 */

import {
  isSymbolicAreaModelUnknown,
  normalizeDigitsToWestern,
  sanitizeMathToken,
} from "./multiplication-area-model-clause-parser";

export const MODULE_ID_DIVISION_AREA_MODEL_CLAUSE_PARSER =
  "division_area_model_clause_parser" as const;

export interface DivisionAreaColumnStep {
  readonly topQuotient: string;
  readonly partialDividend: string;
  readonly subtractedProduct?: string;
  readonly bottomRemainder?: string;
}

export interface AreaModelDivisionSpec {
  readonly kind: "division";
  readonly divisor: string;
  readonly topQuotients: readonly string[];
  readonly cellProducts: readonly string[];
  readonly totalDividend?: string;
  readonly columns?: readonly DivisionAreaColumnStep[];
  readonly finalRemainder?: string;
}

function cleanPartToken(raw: string): string {
  return raw
    .replace(/[`$\\]/g, "")
    .replace(/(?<=\d),(?=\d{3}\b)/g, "")
    .replace(/[،\s.;:]+$/g, "")
    .trim();
}

function extractPartToken(clause: string, re: RegExp): string | undefined {
  const m = clause.match(re);
  if (!m?.[1]) return undefined;
  const tok = cleanPartToken(m[1]);
  return tok.length > 0 ? tok : undefined;
}

function decomposeDividendByPlaceValue(
  totalDividend: number,
  divisor: number
): { readonly columns: DivisionAreaColumnStep[]; readonly finalRemainder: string } {
  const columns: DivisionAreaColumnStep[] = [];
  let rem = totalDividend;
  const placeMultipliers = [1000, 100, 10, 1];

  for (const place of placeMultipliers) {
    const stepUnit = divisor * place;
    if (rem >= stepUnit) {
      const digit = Math.min(9, Math.floor(rem / stepUnit));
      const qPart = digit * place;
      const sub = qPart * divisor;
      const nextRem = rem - sub;
      columns.push({
        topQuotient: String(qPart),
        partialDividend: String(rem),
        subtractedProduct: String(sub),
        bottomRemainder: String(nextRem),
      });
      rem = nextRem;
    }
  }

  return { columns, finalRemainder: String(rem) };
}

export function parseDivisionAreaModelClauses(
  rawText: string
): AreaModelDivisionSpec | null {
  if (!rawText) return null;
  const normalized = normalizeDigitsToWestern(
    rawText
      .replace(/[`]/g, " ")
      .replace(/\\div/gi, "÷")
      .replace(/\\\(|\\\)/g, " ")
      .replace(/\$/g, " ")
  );

  let divisor: string | undefined;
  let totalDividend: string | undefined;

  const divOpMatch = normalized.match(
    /([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)\s*[÷\/]\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)/i
  );
  if (divOpMatch) {
    totalDividend = sanitizeMathToken(divOpMatch[1]);
    divisor = sanitizeMathToken(divOpMatch[2]);
  }

  if (!divisor) {
    const explicitDivisorMatch = normalized.match(
      /(?:العرض\s*الأيسر|المقسوم\s*عليه|على\s*يسار(?:ه|\s*المستطيل)?|يساره)\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?|[A-Za-zسص؟?])|÷\s*([0-9]+(?:\.[0-9]+)?)/i
    );
    const rawDivisor = explicitDivisorMatch?.[1] || explicitDivisorMatch?.[2];
    if (rawDivisor) divisor = cleanPartToken(rawDivisor);
  }

  if (!totalDividend) {
    const explicitDividendMatch = normalized.match(
      /(?:^|[;؛\s])(?:المقسوم(?!\s*(?:عليه|الجزئي))|داخل\s*المستطيل\s*المقسوم)\s*[:=]?\s*([0-9,]+)/i
    );
    if (explicitDividendMatch?.[1]) {
      totalDividend = sanitizeMathToken(explicitDividendMatch[1]);
    }
  }

  if (!divisor) return null;

  // ١. تحليل الأجزاء التفصيلية (الجزء الأول: المقسوم الجزئي ... مطروحاً منه ... المتبقي أسفله ... القيمة بالأعلى = ...)
  if (/الجزء\s*(?:الأول|الثاني|الثالث|الرابع|[1-4])/i.test(normalized)) {
    const partChunks = normalized
      .split(/(?=الجزء\s*(?:الأول|الثاني|الثالث|الرابع|الخامس|[1-5])\s*[:=]?)/i)
      .filter((c) => /^الجزء\s*(?:الأول|الثاني|الثالث|الرابع|الخامس|[1-5])/i.test(c.trim()));

    const columns: DivisionAreaColumnStep[] = [];
    for (const chunk of partChunks) {
      const partialDividend = extractPartToken(
        chunk,
        /المقسوم\s*الجزئي\s*[:=]?\s*([0-9,.\w؟?]+)/i
      );
      const subtractedProduct = extractPartToken(
        chunk,
        /(?:مطروحاً?\s*منه|المطروح|ناقص)\s*[:=]?\s*([0-9,.\w؟?]+)/i
      );
      const bottomRemainder = extractPartToken(
        chunk,
        /(?:المتبقي(?:\s*أسفله)?|الباقي(?:\s*أسفله)?|الناتج\s*أسفله)\s*[:=]?\s*([0-9,.\w؟?]+)/i
      );
      const topQuotient = extractPartToken(
        chunk,
        /(?:القيمة\s*بالأعلى|خارج\s*القسمة\s*الجزئي|بالأعلى|أعلاه)\s*[:=]?\s*([0-9,.\w؟?]+)/i
      );
      if (partialDividend || topQuotient || subtractedProduct) {
        columns.push({
          topQuotient: topQuotient ?? "؟",
          partialDividend: partialDividend ?? subtractedProduct ?? "؟",
          subtractedProduct,
          bottomRemainder,
        });
      }
    }

    if (columns.length > 0) {
      const lastRem = columns[columns.length - 1].bottomRemainder;
      return {
        kind: "division",
        divisor,
        topQuotients: columns.map((c) => c.topQuotient),
        cellProducts: columns.map((c) => c.subtractedProduct || c.partialDividend),
        totalDividend: totalDividend ?? columns[0].partialDividend,
        columns,
        finalRemainder: lastRem && lastRem !== "0" ? lastRem : undefined,
      };
    }
  }

  // ٢. استخراج النواتج الجزئية العلوية الصريحة (أعلاه / الأعداد المكتوبة أعلى المستطيل)
  const topMatch = normalized.match(
    /(?:أعلاه|علويتين|الأعداد\s*المكتوبة\s*أعلى(?:\s*المستطيل)?|الأجزاء\s*العلوية|الأعداد\s*الجزئية|بالأعلى)\s*(?:الأعداد|هما|هي)?\s*[:=\s]*([^\n;؛\]]+)/i
  );
  let topQuotients: string[] = [];
  if (topMatch?.[1]) {
    const rawTokens = topMatch[1].match(/[0-9]+|[A-Za-z]|س|ص|؟|\?/g);
    if (rawTokens && rawTokens.length > 0) {
      topQuotients = rawTokens.map(cleanPartToken).filter(Boolean);
    }
  }

  if (topQuotients.length > 0) {
    let cellProducts: string[] = [];
    const insideMatch = normalized.match(
      /(?:داخل\s*(?:الأجزاء|المستطيل|الخانات))\s*[:=\s]*([^\n;؛\]]+)/i
    );
    if (insideMatch?.[1]) {
      const innerTokens = insideMatch[1].match(/[0-9,]+|[A-Za-z]|س|ص|؟|\?/g);
      if (innerTokens && innerTokens.length >= topQuotients.length) {
        cellProducts = innerTokens.slice(0, topQuotients.length).map(cleanPartToken);
      }
    }

    if (cellProducts.length === 0) {
      const nDiv = parseFloat(divisor) || 0;
      cellProducts = topQuotients.map((q) => {
        if (isSymbolicAreaModelUnknown(q) || !nDiv) return "؟";
        const nQ = parseFloat(q);
        return Number.isFinite(nQ) ? String(Math.round(nDiv * nQ)) : "؟";
      });
    }

    return {
      kind: "division",
      divisor,
      topQuotients,
      cellProducts,
      totalDividend,
    };
  }

  // ٣. تفكيك رياضي حتمي عند وجود مقسوم ومقسوم عليه عدديين صريحين فقط
  if (totalDividend) {
    const nDividend = parseInt(totalDividend, 10);
    const nDivisor = parseInt(divisor, 10);
    if (Number.isFinite(nDividend) && Number.isFinite(nDivisor) && nDivisor > 0 && nDividend >= nDivisor) {
      const { columns, finalRemainder } = decomposeDividendByPlaceValue(nDividend, nDivisor);
      if (columns.length > 0) {
        return {
          kind: "division",
          divisor,
          topQuotients: columns.map((c) => c.topQuotient),
          cellProducts: columns.map((c) => c.subtractedProduct || c.partialDividend),
          totalDividend,
          columns,
          finalRemainder: finalRemainder !== "0" ? finalRemainder : undefined,
        };
      }
    }
  }

  return null;
}
