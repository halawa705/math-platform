/**
 * @file primary-grade6-geometry-catalog.ts
 * @description السجل المركزي لأشكال ومفاهيم الهندسة والحجوم القياسية للصف السادس الابتدائي:
 * - الدائرة ومحيطها ومساحتها ونصف قطرها.
 * - المكعب ومتوازي المستطيلات والمجسمات البسيطة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 190 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "../../../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  toWesternNumeralsSSOT,
  type MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";
import { matchPrimaryGrade6StatisticsFigure } from "./primary-grade6-statistics-catalog";

export const MODULE_ID_PRIMARY_GRADE6_GEOMETRY_CATALOG =
  "primary_grade6_geometry_catalog" as const;

export interface Grade6FigureBuildOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
  readonly radiusVal?: number;
  readonly diameterVal?: number;
  readonly unit?: string;
}

/**
 * دائرة للصف السادس الابتدائي مع نصف قطر r أو قطر كامل d (IR v2) بدون تسريب أرقام غير واردة
 */
function buildGrade6CircleRadiusFigure(
  opts: Grade6FigureBuildOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const unit = opts.unit || "سم";

  const vCenter: CanonicalVertexNode = { id: `${opts.figureId}_center`, label: localizeGeometricVertexLabelSSOT("م", notation), position: { x: 5, y: 5 } };
  const vRimRight: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 8.5, y: 5 } };
  const vRimLeft: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1.5, y: 5 } };

  const isDiameterGiven = opts.diameterVal !== undefined && opts.radiusVal === undefined;
  const segments: CanonicalSegmentNode[] = isDiameterGiven
    ? [
        {
          id: `${opts.figureId}_sDiameter`,
          fromVertexId: vRimLeft.id,
          toVertexId: vRimRight.id,
          lengthLabel: { value: opts.diameterVal!, unit, labelKind: "given" },
        },
      ]
    : [
        {
          id: `${opts.figureId}_sRadius`,
          fromVertexId: vCenter.id,
          toVertexId: vRimRight.id,
          lengthLabel: opts.radiusVal !== undefined ? { value: opts.radiusVal, unit, labelKind: "given" } : undefined,
        },
      ];

  return {
    figureId: opts.figureId,
    familyId: "circle_family",
    branchId: "circle_base_radius_chord",
    titleArabic: "الدائرة: نصف القطر ومحيط ومساحة الدائرة",
    notationLanguage: notation,
    vertices: isDiameterGiven ? [vCenter, vRimRight, vRimLeft] : [vCenter, vRimRight],
    segments,
    angles: [],
    circles: [
      {
        id: `${opts.figureId}_circle_main`,
        centerVertexId: vCenter.id,
        radius: 3.5,
        rimVertexId: vRimRight.id,
      },
    ],
  };
}

export function matchPrimaryGrade6GeometryFigure(
  description: string,
  figureId = "primary6_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = toWesternNumeralsSSOT(description.trim());
  if (!d) return undefined;
  // «الربع الأول» في المستوى الإحداثي ليس ربيعاً إحصائياً
  if (/مستوى\s*(?:ال)?إحداثي/i.test(d)) return undefined;

  const statFigure = matchPrimaryGrade6StatisticsFigure(d, figureId, notationLanguage);
  if (statFigure) return statFigure;

  if (/دائرة.*(?:نصف\s*(?:ال)?قطر|قطر(?:ها|ه)?)|محيط\s*الدائرة|مساحة\s*الدائرة|ط\s*نق/i.test(d)) {
    // يسمح باسم القطعة بعد الكلمة: «نصف القطر م أ = 7 سم» / «القطر أ ب = 14 سم»
    const segName = "(?:[أ-ي]ـ?\\s*[أ-ي]ـ?\\s*)?";
    const radM = d.match(new RegExp(`(?:نصف\\s*(?:ال)?قطر(?:ها|ه)?|نق)\\s*${segName}=?\\s*(\\d+(?:\\.\\d+)?)\\s*(سم|م|ديسم|مم)?`, "i"));
    const diaM = !radM ? d.match(new RegExp(`(?:طول\\s*)?(?:ال)?قطر(?:ها|ه)?\\s*${segName}=?\\s*(\\d+(?:\\.\\d+)?)\\s*(سم|م|ديسم|مم)?`, "i")) : null;
    const radiusVal = radM ? Number(radM[1]) : undefined;
    const diameterVal = diaM ? Number(diaM[1]) : undefined;
    const unit = radM?.[2] || diaM?.[2] || "سم";
    return buildGrade6CircleRadiusFigure({ figureId, notationLanguage, radiusVal, diameterVal, unit });
  }

  return undefined;
}
