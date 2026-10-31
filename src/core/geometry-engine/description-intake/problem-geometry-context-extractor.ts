/**
 * @file problem-geometry-context-extractor.ts
 * @description جامع السياق الهندسي الموحد (المرحلة 2):
 * يدمج وسم [رسم هندسي: ...] مع نص المسألة الكامل (promptAr) ليستخرج كل حقيقة هندسية،
 * بما فيها علاقات التشابه والتطابق بترتيب الرؤوس المتناظرة الدقيق، والأطوال الترتيبية والجبرية،
 * حتى لو كان وسم الرسم غائباً أو مختصراً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً (< 250 سطراً وفق AGENTS.md).
 */

import { convertGeometryLatexToPlainText } from "./geometry-latex-to-plain-normalizer";
import { normalizeLabelKey, parseLabelList } from "../fact-compositor/geo-label-utils";
import { toWesternNumeralsSSOT } from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PROBLEM_GEOMETRY_CONTEXT_EXTRACTOR =
  "problem_geometry_context_extractor" as const;

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
    /(?:(?:ال)?مثلث\s*)?([A-Za-z]{3}|(?:[أ-ي]ـ?\s*){3})\s*(?:~|∼|يشابه|تشابه)\s*(?:(?:ال)?مثلث\s*)?([A-Za-z]{3}|(?:[أ-ي]ـ?\s*){3})/i
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
    /(?:(?:ال)?مثلث\s*)?([A-Za-z]{3}|(?:[أ-ي]ـ?\s*){3})\s*(?:≅|يطابق|تطابق)\s*(?:(?:ال)?مثلث\s*)?([A-Za-z]{3}|(?:[أ-ي]ـ?\s*){3})/i
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

/**
 * يستخرج الحقائق الهندسية الصريحة من متن السؤال (قياسات زوايا، أطوال، توازٍ، تعامد).
 */
export function extractGeometryFactsFromPrompt(promptText: string): string[] {
  const facts: string[] = [];
  if (!promptText) return facts;

  // إزالة وسم [رسم هندسي: ...] إن وُجد داخل النص لمنع التكرار
  const rawClean = promptText
    .replace(/\[\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*[^\]]+\]/gi, " ")
    .replace(/\([أ-دABCD]\)[^()]*(?=\([أ-دABCD]\)|$)/g, " ") // إزالة خيارات MCQ
    .replace(/\|\s*معرف\s*[^|\n]*/g, " ");

  const clean = convertGeometryLatexToPlainText(rawClean);

  // 1. علاقة التشابه أو التطابق
  const sim = extractOrderedSimilarityTriangles(clean);
  if (sim) {
    const symbol = sim.isCongruence ? "≅" : "~";
    let simStr = `مثلث ${sim.tri1.join("")} ${symbol} مثلث ${sim.tri2.join("")}`;
    if (sim.ratio !== undefined) {
      simStr += ` نسبة التشابه = ${sim.ratio}`;
    }
    facts.push(simStr);
  }

  // 2. الأطوال الترتيبية
  const seqLengths = unpackSequentialSideLengths(clean, sim?.tri1);
  facts.push(...seqLengths);

  // 3. أطوال الأضلاع الفردية الصريحة: AB = 6 سم أو س ص = 8
  const lengthMatches = clean.matchAll(
    /(?<![A-Za-zء-ي])([A-Za-z]{2}|[أ-ي]ـ?\s*[أ-ي]ـ?)\s*=\s*([0-9.]+|[0-9.xسصy+\-\s]+?)\s*(?:سم|م|وحدة)?(?=[\s،,;؛|)]|$)/gi
  );
  for (const lm of lengthMatches) {
    const segRaw = lm[1].replace(/\s+/g, "");
    const valRaw = lm[2].trim();
    if (/^(sin|cos|tan)$/i.test(segRaw)) continue;
    if (valRaw && !facts.some((f) => f.startsWith(`${segRaw} =`))) {
      facts.push(`${segRaw} = ${valRaw} سم`);
    }
  }

  // 4. قياسات الزوايا: m(∠A) = 40° أو ق(∠ب) = 65° أو ق(∠أ ب جـ) = 90°
  const angleMatches = clean.matchAll(
    /(?:ق\s*\(\s*∠?\s*([A-Za-z]{1,3}|[أ-ي]ـ?(?:\s*[أ-ي]ـ?){0,2})\s*\)|m\s*\(\s*∠?\s*([A-Za-z]{1,3})\s*\)|∠\s*([A-Za-z]{1,3}|[أ-ي]ـ?))\s*=\s*([0-9.xسصy+\-\s]+?)(?:°|\^\\circ|درجة)?(?=[\s،,;؛|)]|$)/gi
  );
  for (const am of angleMatches) {
    const angRaw = (am[1] || am[2] || am[3] || "").replace(/\s+/g, "");
    const degVal = am[4].trim();
    if (angRaw && degVal && !facts.some((f) => f.includes(`∠${angRaw}`) || f.includes(`∠ ${angRaw}`))) {
      facts.push(`ق(∠${angRaw}) = ${degVal}°`);
    }
  }

  // 5. التوازي والتعامد والنقاط: DE // BC أو AD ⊥ BC أو D ∈ AB
  const relMatches = clean.matchAll(
    /(?<![A-Za-zء-ي])([A-Za-z]{2})\s*(\/\/|⊥|∈|منتصف)\s*([A-Za-z]{2}|[A-Za-z])(?=[\s،,;؛|)]|$)/gi
  );
  for (const rm of relMatches) {
    const left = rm[1];
    const op = rm[2];
    const right = rm[3];
    const relStr = `${left} ${op} ${right}`;
    if (!facts.includes(relStr)) {
      facts.push(relStr);
    }
  }

  return facts;
}

/**
 * يدمج وسم الرسم الهندسي مع نص المسألة الكامل في سلسلة حقائق موحدة خالية من التكرار.
 */
export function combineProblemAndTagGeometryContext(
  tagDescription?: string,
  promptText?: string
): string {
  const parts: string[] = [];

  // إذا وُجد نص المسألة، نستخرج منه كل الحقائق الحية
  if (promptText) {
    const promptFacts = extractGeometryFactsFromPrompt(promptText);
    parts.push(...promptFacts);
  }

  // إذا وُجد وسم رسم، ندمج فقراته غير المكررة
  if (tagDescription && tagDescription.trim()) {
    const cleanTag = convertGeometryLatexToPlainText(tagDescription.trim());
    const tagClauses = cleanTag.split(/\s*[;؛\n]+\s*/).map((c) => c.trim()).filter(Boolean);
    for (const clause of tagClauses) {
      if (!parts.some((p) => p.includes(clause) || clause.includes(p))) {
        parts.push(clause);
      }
    }
  }

  if (parts.length === 0) {
    return tagDescription?.trim() || "";
  }

  // ترتيب الحقائق: التشابه/التطابق أولاً، ثم النقاط والخطوط، ثم الأطوال، ثم الزوايا
  const simFacts = parts.filter((p) => p.includes("~") || p.includes("≅") || p.includes("تشابه"));
  const otherFacts = parts.filter((p) => !simFacts.includes(p));

  const deduplicated = Array.from(new Set([...simFacts, ...otherFacts]));
  return deduplicated.join(" ؛ ");
}
