/**
 * @file parametric-similarity-description-parser.ts
 * @description المحلل التركيبي البارامتري الذكي لأوصاف تشابه المضلعات:
 * - يستخرج أسماء الرؤوس، أطوال الأضلاع (بما فيها الجذور والرموز الجبرية)، وقياسات الزوايا من الوصف العربي الطبيعي.
 * - يركب شكلاً هندسياً حتمياً CanonicalGeometryFigureIR يحمل التفاصيل المذكورة بدقة متناهية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
  CanonicalAngleNode,
} from "../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PARAMETRIC_SIMILARITY_DESCRIPTION_PARSER =
  "parametric_similarity_description_parser" as const;

export interface ParsedSimilaritySpecs {
  readonly quad1Name: string;
  readonly quad2Name: string;
  readonly sideLengths: Map<string, string>;
  readonly angles: Map<string, { degrees?: number; label?: string; isRight?: boolean }>;
}

export function parseNaturalGeometryTextSpecs(description: string): ParsedSimilaritySpecs {
  const sideLengths = new Map<string, string>();
  const angles = new Map<string, { degrees?: number; label?: string; isRight?: boolean }>();

  // استخراج أطوال الأضلاع: AB = 6.5 أو أ ب = 6.5 سم أو EF = (y - 1/3) أو GH = 5√3
  const sideRegex = /([A-Za-z]{2}|[أ-ي]{2})\s*=\s*([^،,؛;\n\r]+?)(?:\s*سم|\s*م|\s*وحدة|$|[,،؛])/gu;
  let match: RegExpExecArray | null;
  while ((match = sideRegex.exec(description)) !== null) {
    const edge = match[1].trim().toUpperCase();
    const val = match[2].trim();
    if (val && !sideLengths.has(edge)) {
      sideLengths.set(edge, val);
    }
  }

  // استخراج الزوايا القائمة: زاوية A قائمة أو الزاوية أ قائمة
  const rightAngleRegex = /(?:زاوية|الزاوية|∠)\s*([A-Za-z]|[أ-ي])\s*(?:=\s*90|قائمة)/gu;
  while ((match = rightAngleRegex.exec(description)) !== null) {
    const v = match[1].trim().toUpperCase();
    angles.set(v, { isRight: true, degrees: 90 });
  }

  // استخراج قياسات الزوايا: ق(∠B) = 60 أو زاوية ب = 120 أو زاوية D = x
  const angleMeasureRegex = /(?:ق\s*\(\s*[∠\s]*([A-Za-z]|[أ-ي])\s*\)|(?:زاوية|الزاوية|∠)\s*([A-Za-z]|[أ-ي]))\s*=\s*(\d+|[a-zA-Zxyz\u0621-\u064A]+)(?:°|درجة)?/gu;
  while ((match = angleMeasureRegex.exec(description)) !== null) {
    const v = (match[1] || match[2]).trim().toUpperCase();
    const valStr = match[3].trim();
    const num = Number.parseInt(valStr, 10);
    if (!Number.isNaN(num)) {
      angles.set(v, { degrees: num, label: `${num}°`, isRight: num === 90 });
    } else {
      angles.set(v, { label: `${valStr}°` });
    }
  }

  return {
    quad1Name: "ABCD",
    quad2Name: "EFGH",
    sideLengths,
    angles,
  };
}

/**
 * يركب مضلعين رباعيين متشابهين بارامترياً بالكامل من الوصف العربي المستخرج
 */
export function composeParametricSimilarQuadsFigure(
  description: string,
  figureId = "param_sim_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = description.trim();
  if (!d) return undefined;

  // شرط احتواء الوصف على تشابه وأضلاع أو زوايا مفصلة
  const isSimilarity = /تشابه|متشابه|يشابه|~/i.test(d);
  if (!isSimilarity) return undefined;

  const specs = parseNaturalGeometryTextSpecs(d);
  if (specs.sideLengths.size === 0 && specs.angles.size === 0) {
    return undefined;
  }

  const notation = notationLanguage || "english";

  // مضلع 1 (ABCD)
  const vA: CanonicalVertexNode = { id: `${figureId}_pA`, label: notation === "english" ? "A" : "أ", position: { x: 1, y: 1 } };
  const vB: CanonicalVertexNode = { id: `${figureId}_pB`, label: notation === "english" ? "B" : "ب", position: { x: 7, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${figureId}_pC`, label: notation === "english" ? "C" : "جـ", position: { x: 5, y: 7.5 } };
  const vD: CanonicalVertexNode = { id: `${figureId}_pD`, label: notation === "english" ? "D" : "د", position: { x: 1, y: 4.5 } };

  // مضلع 2 (EFGH)
  const vE: CanonicalVertexNode = { id: `${figureId}_pE`, label: notation === "english" ? "E" : "هـ", position: { x: 15, y: 7 } };
  const vF: CanonicalVertexNode = { id: `${figureId}_pF`, label: notation === "english" ? "F" : "و", position: { x: 9.5, y: 7 } };
  const vG: CanonicalVertexNode = { id: `${figureId}_pG`, label: notation === "english" ? "G" : "ع", position: { x: 13, y: 1 } };
  const vH: CanonicalVertexNode = { id: `${figureId}_pH`, label: notation === "english" ? "H" : "ح", position: { x: 15, y: 4.5 } };

  const getLen = (k1: string, k2: string, fallback?: string) => {
    return specs.sideLengths.get(k1) || specs.sideLengths.get(k2) || fallback;
  };

  const lenAB = getLen("AB", "أب");
  const lenBC = getLen("BC", "بج");
  const lenCD = getLen("CD", "جد");
  const lenDA = getLen("DA", "دأ") || getLen("AD", "أد");

  const lenEF = getLen("EF", "هو");
  const lenFG = getLen("FG", "وع");
  const lenGH = getLen("GH", "عح");
  const lenHE = getLen("HE", "حه") || getLen("EH", "هح");

  const segments: CanonicalSegmentNode[] = [
    { id: `${figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, ...(lenAB ? { lengthLabel: { value: lenAB, unit: "سم" } } : {}) },
    { id: `${figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, ...(lenBC ? { lengthLabel: { value: lenBC, unit: "سم" } } : {}) },
    { id: `${figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, ...(lenCD ? { lengthLabel: { value: lenCD, unit: "سم" } } : {}) },
    { id: `${figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, ...(lenDA ? { lengthLabel: { value: lenDA, unit: "سم" } } : {}) },

    { id: `${figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id, ...(lenEF ? { lengthLabel: { value: lenEF, unit: "سم" } } : {}) },
    { id: `${figureId}_sFG`, fromVertexId: vF.id, toVertexId: vG.id, ...(lenFG ? { lengthLabel: { value: lenFG, unit: "سم" } } : {}) },
    { id: `${figureId}_sGH`, fromVertexId: vG.id, toVertexId: vH.id, ...(lenGH ? { lengthLabel: { value: lenGH, unit: "سم" } } : {}) },
    { id: `${figureId}_sHE`, fromVertexId: vH.id, toVertexId: vE.id, ...(lenHE ? { lengthLabel: { value: lenHE, unit: "سم" } } : {}) },
  ];

  const canonicalAngles: CanonicalAngleNode[] = [];

  const addAngleIfPresent = (vId: string, arm1: string, arm2: string, keyEng: string, keyAr: string) => {
    const spec = specs.angles.get(keyEng) || specs.angles.get(keyAr);
    if (spec) {
      canonicalAngles.push({
        id: `${figureId}_ang_${keyEng}`,
        vertexId: vId,
        arm1VertexId: arm1,
        arm2VertexId: arm2,
        isRightAngle: spec.isRight,
        degrees: spec.degrees,
        degreesLabel: spec.label,
      });
    }
  };

  addAngleIfPresent(vA.id, vB.id, vD.id, "A", "أ");
  addAngleIfPresent(vB.id, vA.id, vC.id, "B", "ب");
  addAngleIfPresent(vC.id, vB.id, vD.id, "C", "جـ");
  addAngleIfPresent(vD.id, vA.id, vC.id, "D", "د");

  addAngleIfPresent(vE.id, vF.id, vH.id, "E", "هـ");
  addAngleIfPresent(vF.id, vE.id, vG.id, "F", "و");
  addAngleIfPresent(vG.id, vF.id, vH.id, "G", "ع");
  addAngleIfPresent(vH.id, vE.id, vG.id, "H", "ح");

  return {
    figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "مضلعان رباعيان متشابهان مركب حتمياً من الوصف",
    notationLanguage,
    vertices: [vA, vB, vC, vD, vE, vF, vG, vH],
    segments,
    angles: canonicalAngles,
  };
}
