/**
 * @file similarity-congruence-fact-extractor.ts
 * @description مستخرج علاقات التشابه والتطابق والأطوال الترتيبية من نصوص المسائل الهندسية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import { convertGeometryLatexToPlainText } from "./geometry-latex-to-plain-normalizer";
import { parseLabelList } from "../fact-compositor/geo-label-utils";

export const MODULE_ID_SIMILARITY_CONGRUENCE_FACT_EXTRACTOR =
  "similarity_congruence_fact-extractor" as const;

export interface ExtractedSimilarityCorrespondence {
  readonly tri1: readonly [string, string, string];
  readonly tri2: readonly [string, string, string];
  readonly isCongruence: boolean;
  readonly ratio?: number;
}

/**
 * يستخرج علاقات التشابه أو التطابق الصريحة مع ترتيب الرؤوس التناظري الدقيق.
 */
export function extractOrderedSimilarityTriangles(
  text: string
): ExtractedSimilarityCorrespondence | null {
  if (!text) return null;
  const clean = convertGeometryLatexToPlainText(text);

  // 1. صيغة التشابه: ΔABC ~ ΔDEF أو مثلث ABC يشابه مثلث DEF
  const mSim = clean.match(
    /(?<![A-Za-zء-ي])(?:(?:ال)?مثلث\s*)?([A-Za-z]{3}|(?:[أ-ي]ـ?\s+){2}[أ-ي]ـ?)\s*(?:~|∼|\\sim|(?<![أ-ي])(?:يشابه|تشابه)(?![أ-ي]))\s*(?:(?:ال)?مثلث\s*)?([A-Za-z]{3}|(?:[أ-ي]ـ?\s+){2}[أ-ي]ـ?)(?![A-Za-zء-ي])/i
  );
  if (mSim) {
    const t1 = parseLabelList(mSim[1]);
    const t2 = parseLabelList(mSim[2]);
    if (t1 && t1.length === 3 && t2 && t2.length === 3) {
      const mRatio = clean.match(/(?:نسبة|معامل)\s*(?:التشابه)?\s*(?:تساوي|=)\s*(\d+(?:\.\d+)?)/i);
      const ratio = mRatio ? Number(mRatio[1]) : undefined;
      return {
        tri1: [t1[0], t1[1], t1[2]],
        tri2: [t2[0], t2[1], t2[2]],
        isCongruence: false,
        ratio: ratio && Number.isFinite(ratio) ? ratio : undefined,
      };
    }
  }

  // 2. صيغة التطابق: ΔABC ≅ ΔDEF أو مثلث ABC يطابق مثلث DEF
  const mCong = clean.match(
    /(?<![A-Za-zء-ي])(?:(?:ال)?مثلث\s*)?([A-Za-z]{3}|(?:[أ-ي]ـ?\s+){2}[أ-ي]ـ?)\s*(?:≅|\\cong|(?<![أ-ي])(?:يطابق|تطابق)(?![أ-ي]))\s*(?:(?:ال)?مثلث\s*)?([A-Za-z]{3}|(?:[أ-ي]ـ?\s+){2}[أ-ي]ـ?)(?![A-Za-zء-ي])/i
  );
  if (mCong) {
    const t1 = parseLabelList(mCong[1]);
    const t2 = parseLabelList(mCong[2]);
    if (t1 && t1.length === 3 && t2 && t2.length === 3) {
      return {
        tri1: [t1[0], t1[1], t1[2]],
        tri2: [t2[0], t2[1], t2[2]],
        isCongruence: true,
      };
    }
  }

  return null;
}

/**
 * يحلل جمل الأطوال الترتيبية الشائعة في المنهج المصري:
 * «أطوال أضلاع ΔABC هي 3 سم، 4 سم، 5 سم» ← AB = 3 سم، BC = 4 سم، AC = 5 سم.
 */
export function unpackSequentialSideLengths(
  text: string,
  defaultTri?: readonly [string, string, string]
): string[] {
  const result: string[] = [];
  if (!text) return result;

  const clean = convertGeometryLatexToPlainText(text);
  const mSeq = clean.match(
    /أطوال\s*أضلاع\s*(?:مثلث\s*)?([A-Za-z]{3}|(?:[أ-ي]ـ?\s*){3})?\s*(?:هي\s*)?([0-9.xسصy+\-\s]+?)(?:سم)?\s*[,،؛و]\s*([0-9.xسصy+\-\s]+?)(?:سم)?\s*[,،؛و]\s*([0-9.xسصy+\-\s]+?)(?:سم)?(?=[,،؛؛.\s]|$)/i
  );

  if (mSeq) {
    let tri = defaultTri;
    if (mSeq[1]) {
      const parsed = parseLabelList(mSeq[1]);
      if (parsed && parsed.length === 3) {
        tri = [parsed[0], parsed[1], parsed[2]];
      }
    }
    if (tri) {
      const l1 = mSeq[2].trim();
      const l2 = mSeq[3].trim();
      const l3 = mSeq[4].trim();
      result.push(`${tri[0]}${tri[1]} = ${l1} سم`);
      result.push(`${tri[1]}${tri[2]} = ${l2} سم`);
      result.push(`${tri[0]}${tri[2]} = ${l3} سم`);
    }
  }

  return result;
}
