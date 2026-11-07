/**
 * @file primary-grade4-geometry-catalog.ts
 * @description السجل المركزي لأشكال ومفاهيم الهندسة القياسية للصف الرابع الابتدائي:
 * - الخطوط والقطع والأشعة (متوازية، متعامدة، متقاطعة).
 * - تصنيف الزوايا (حادة، قائمة، منفرجة، مستقيمة).
 * - حساب المحيط والمساحة للمستطيل والمربع واستخراج الأبعاد الحقيقية والوحدات.
 * - إيجاد البعد المجهول في المستطيل والمربع (بالمحيط أو المساحة).
 * - تركيب الأشكال الهندسية والأشكال المركبة (L، T، U مقلوب، الدرج، والمقتطع).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 160 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalVertexNode,
} from "../../../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  toWesternNumeralsSSOT,
  type MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";
import { matchGrade4PerimeterAreaFigure } from "./primary-grade4-perimeter-area-builder";
import { matchGrade4UnknownDimensionFigure } from "./primary-grade4-unknown-dimension-builder";
import { matchGrade4CompositeFigure } from "./primary-grade4-composite-shapes-builder";

export const MODULE_ID_PRIMARY_GRADE4_GEOMETRY_CATALOG =
  "primary_grade4_geometry_catalog" as const;

export interface Grade4FigureBuildOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * خطوط مستقيمة متوازية أو متعامدة
 */
function buildGrade4LinesRelationFigure(
  relation: "parallel" | "perpendicular" | "intersecting",
  opts: Grade4FigureBuildOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  if (relation === "perpendicular") {
    const vCenter: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: localizeGeometricVertexLabelSSOT("م", notation), position: { x: 5, y: 5 } };
    const vTop: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 9 } };
    const vBottom: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 5, y: 1 } };
    const vLeft: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 5 } };
    const vRight: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 9, y: 5 } };

    return {
      figureId: opts.figureId,
      familyId: "triangle_family",
      branchId: "triangle_base_general",
      titleArabic: "مستقيمان متعامدان يصنعان 4 زوايا قائمة",
      notationLanguage: notation,
      vertices: [vCenter, vTop, vBottom, vLeft, vRight],
      segments: [
        { id: `${opts.figureId}_sAB`, fromVertexId: vTop.id, toVertexId: vBottom.id },
        { id: `${opts.figureId}_sCD`, fromVertexId: vLeft.id, toVertexId: vRight.id },
      ],
      angles: [{ id: `${opts.figureId}_aM`, vertexId: vCenter.id, arm1VertexId: vTop.id, arm2VertexId: vRight.id, isRightAngle: true }],
    };
  }

  // متوازيان
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1, y: 7 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 9, y: 7 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 3 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 9, y: 3 } };

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "مستقيمان متوازيان لا يتقاطعان أبداً",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments: [
      { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, parallelArrows: 1 },
      { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, parallelArrows: 1 },
    ],
    angles: [],
  };
}

/**
 * زاوية محددة النوع (قائمة، حادة، منفرجة، مستقيمة) مع استخراج القياس الصريح إن وُجد دون تسريب أرقام غريبة
 */
function buildGrade4AngleTypeFigure(
  kind: "right" | "acute" | "obtuse" | "straight",
  opts: Grade4FigureBuildOptions,
  explicitDeg?: number
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const drawDeg = explicitDeg ?? (kind === "right" ? 90 : kind === "acute" ? 50 : kind === "obtuse" ? 130 : 180);
  const rad = (drawDeg * Math.PI) / 180;
  const armLen = 4.2;

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 5, y: 2.5 } };
  const vA: CanonicalVertexNode = {
    id: `${opts.figureId}_vA`,
    label: localizeGeometricVertexLabelSSOT("أ", notation),
    position: {
      x: Number((5 + armLen * Math.cos(rad)).toFixed(2)),
      y: Number((2.5 + armLen * Math.sin(rad)).toFixed(2)),
    },
  };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9.2, y: 2.5 } };

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: `زاوية ${kind === "right" ? "قائمة" : kind === "acute" ? "حادة" : kind === "obtuse" ? "منفرجة" : "مستقيمة"}`,
    notationLanguage: notation,
    vertices: [vB, vA, vC],
    segments: [
      { id: `${opts.figureId}_sBA`, fromVertexId: vB.id, toVertexId: vA.id },
      { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    ],
    angles: [
      {
        id: `${opts.figureId}_aB`,
        vertexId: vB.id,
        arm1VertexId: vA.id,
        arm2VertexId: vC.id,
        degrees: explicitDeg ?? (kind === "right" ? 90 : undefined),
        degreesLabel: explicitDeg ? `${explicitDeg}°` : undefined,
        isRightAngle: kind === "right" || explicitDeg === 90,
        arcCount: kind === "right" || explicitDeg === 90 ? undefined : 1,
      },
    ],
  };
}

/**
 * تصنيف المثلثات حسب أطوال الأضلاع (متساوي الأضلاع، متساوي الساقين، مختلف الأضلاع)
 */
function buildGrade4TriangleSideClassificationFigure(
  kind: "equilateral" | "isosceles" | "scalene",
  opts: Grade4FigureBuildOptions,
  sideVal?: number
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const vA: CanonicalVertexNode = {
    id: `${opts.figureId}_vA`,
    label: localizeGeometricVertexLabelSSOT("أ", notation),
    position: kind === "scalene" ? { x: 3.8, y: 7.5 } : { x: 5, y: 7.8 },
  };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1.5, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 8.5, y: 2 } };

  const sideLbl = sideVal ? { value: sideVal, unit: "سم" } : undefined;
  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: `مثلث ${kind === "equilateral" ? "متساوي الأضلاع" : kind === "isosceles" ? "متساوي الساقين" : "مختلف الأضلاع"}`,
    notationLanguage: notation,
    vertices: [vA, vB, vC],
    segments: [
      { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1, lengthLabel: sideLbl },
      {
        id: `${opts.figureId}_sBC`,
        fromVertexId: vB.id,
        toVertexId: vC.id,
        tickMarks: kind === "equilateral" ? 1 : kind === "isosceles" ? undefined : 2,
        lengthLabel: kind === "equilateral" ? sideLbl : undefined,
      },
      {
        id: `${opts.figureId}_sCA`,
        fromVertexId: vC.id,
        toVertexId: vA.id,
        tickMarks: kind === "scalene" ? 3 : 1,
        lengthLabel: sideLbl,
      },
    ],
    angles: [],
    polygons: [[vA.id, vB.id, vC.id]],
  };
}

/**
 * مطابقة الأسئلة والأوصاف الخاصة بالصف الرابع الابتدائي
 */
export function matchPrimaryGrade4GeometryFigure(
  description: string,
  figureId = "grade4_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = toWesternNumeralsSSOT(description.trim());
  if (!d) return undefined;
  if (/(?:معادلة|إحداثي|احداثي|ميل|متوسط|فيثاغورس|إقليدس|اقليدس|طاليس|تشابه|تطابق|محيطية|مركزية|مماس|قاطع|وتر|رباعي\s*دائري|قطراه|أقطار|قطرا\s*(?:المتوازي|المستطيل|المربع|المعين|الشكل)|زاويتا\s*قاعدت|(?:ال)?خارج(?:ي)?ة|محاور|تماثل|استقامة\s*واحدة|تناظر|تبادل|تداخل|حرف\s*[ZFUE]|[A-Z]{2,4}|\b[a-zA-Z]\b\s*=|(?:\d+[a-zA-Z])|كسر|كسور|أجزاء\s*من|بسط|مقام)/i.test(d)) {
    return undefined;
  }
  // المجسمات (متوازي مستطيلات/مكعب) ليست أشكالاً مستوية: يرسمها محرك المجسمات لا هذا الكتالوج
  if (/متوازي\s*(?:ال)?مستطيلات|مكعب|مجسم/i.test(d)) return undefined;

  // 1. الأشكال المركبة (L, T, U مقلوب، مستطيلان ملتصقان، مقتطع)
  const compositeRes = matchGrade4CompositeFigure(d, { figureId, notationLanguage });
  if (compositeRes) return compositeRes;

  // 2. إيجاد البعد المجهول (بالمحيط أو المساحة)
  const unknownRes = matchGrade4UnknownDimensionFigure(d, { figureId, notationLanguage });
  if (unknownRes) return unknownRes;

  // 3. المحيط والمساحة للمستطيل والمربع
  const perimeterAreaRes = matchGrade4PerimeterAreaFigure(d, { figureId, notationLanguage });
  if (perimeterAreaRes) return perimeterAreaRes;

  // 4. الخطوط المتعامدة والمتوازية
  if (/متعامد|تعامد|قائمة/i.test(d) && /مستقيم|ضلع/i.test(d)) {
    return buildGrade4LinesRelationFigure("perpendicular", { figureId, notationLanguage });
  }
  if (/متوازي|توازي/i.test(d) && /مستقيم|خطين/i.test(d)) {
    return buildGrade4LinesRelationFigure("parallel", { figureId, notationLanguage });
  }

  // 5. تصنيف الزوايا مع استخراج الدرجة الصريحة إن ذُكرت
  const degMatch = d.match(/(\d+(?:\.\d+)?)\s*(?:°|درجة)/);
  const explicitDeg = degMatch ? Number(degMatch[1]) : undefined;
  if (/زاوية\s*حادة/i.test(d)) {
    return buildGrade4AngleTypeFigure("acute", { figureId, notationLanguage }, explicitDeg);
  }
  if (/زاوية\s*منفرجة/i.test(d)) {
    return buildGrade4AngleTypeFigure("obtuse", { figureId, notationLanguage }, explicitDeg);
  }
  if (/زاوية\s*قائمة/i.test(d)) {
    return buildGrade4AngleTypeFigure("right", { figureId, notationLanguage }, explicitDeg);
  }
  if (/زاوية\s*مستقيمة/i.test(d)) {
    return buildGrade4AngleTypeFigure("straight", { figureId, notationLanguage }, explicitDeg);
  }

  // 6. تصنيف المثلثات للصف الرابع
  const sideM = d.match(/(?:طول\s*ضلعه|ضلعه)\s*=?\s*(\d+(?:\.\d+)?)/);
  const sideVal = sideM ? Number(sideM[1]) : undefined;
  if (/مثلث\s*متساوي\s*الأضلاع/i.test(d)) {
    return buildGrade4TriangleSideClassificationFigure("equilateral", { figureId, notationLanguage }, sideVal);
  }
  if (/مثلث\s*متساوي\s*الساقين/i.test(d)) {
    return buildGrade4TriangleSideClassificationFigure("isosceles", { figureId, notationLanguage }, sideVal);
  }
  if (/مثلث\s*مختلف\s*الأضلاع/i.test(d)) {
    return buildGrade4TriangleSideClassificationFigure("scalene", { figureId, notationLanguage });
  }

  return undefined;
}
