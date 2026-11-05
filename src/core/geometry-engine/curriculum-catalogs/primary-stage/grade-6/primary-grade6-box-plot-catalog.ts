/**
 * @file primary-grade6-box-plot-catalog.ts
 * @description منشئ نماذج مخطط الصندوق والطرفين (Box-and-Whisker Plot) للصف السادس الابتدائي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import { buildGrade6BoxPlotSvgMarkup } from "../../../../statistics-engine/primary-grade6-box-plot-svg-builder";

export const MODULE_ID_PRIMARY_GRADE6_BOX_PLOT_CATALOG =
  "primary_grade6_box_plot_catalog" as const;

export function buildGrade6BoxPlotFigure(
  description: string,
  figureId = "grade6_boxplot_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR {
  const d = description.trim();
  const numMode = notationLanguage === "arabic" ? "eastern" : "western";

  let minVal = 10;
  let q1Val = 20;
  let medianVal = 25;
  let q3Val = 40;
  let maxVal = 50;
  let axisMin = 5;
  let axisMax = 50;
  let axisStep = 5;

  if (/32.*40|36\.5|38\.5/i.test(d)) {
    minVal = 32; q1Val = 34; medianVal = 36.5; q3Val = 38.5; maxVal = 40;
    axisMin = 32; axisMax = 40; axisStep = 1;
  } else if (/10.*24|14.*16.*22/i.test(d)) {
    minVal = 11; q1Val = 14; medianVal = 16; q3Val = 22; maxVal = 23;
    axisMin = 10; axisMax = 24; axisStep = 2;
  } else if (/2.*10|6\.5|4\.5/i.test(d)) {
    minVal = 2.5; q1Val = 4.5; medianVal = 6.5; q3Val = 8.5; maxVal = 9.5;
    axisMin = 2; axisMax = 10; axisStep = 1;
  } else if (/1.*2.*4.*8.*10|الترتيب\s*التصاعدي.*10/i.test(d)) {
    minVal = 1; q1Val = 2; medianVal = 4; q3Val = 8; maxVal = 10;
    axisMin = 0; axisMax = 10; axisStep = 1;
  } else if (/1.*3.*5\.5.*7.*8/i.test(d)) {
    minVal = 1; q1Val = 3; medianVal = 5.5; q3Val = 7; maxVal = 8;
    axisMin = 1; axisMax = 10; axisStep = 1;
  }

  const svgMarkup = buildGrade6BoxPlotSvgMarkup(
    {
      titleArabic: "مخطط الصندوق والطرفين",
      minVal, q1Val, medianVal, q3Val, maxVal,
      axisMin, axisMax, axisStep,
      xLabelArabic: "القيم العددية والربيعيات",
    },
    { numeralMode: numMode }
  );

  return {
    figureId,
    familyId: "statistics_family",
    branchId: "stats_boxplot_and_quartiles",
    titleArabic: "مخطط الصندوق: الحد الأدنى، الأقصى والربيعيات",
    notationLanguage,
    vertices: [
      { id: `${figureId}_min`, label: "Min", position: { x: minVal, y: 0 } },
      { id: `${figureId}_q1`, label: "Q1", position: { x: q1Val, y: 0 } },
      { id: `${figureId}_med`, label: "Med", position: { x: medianVal, y: 0 } },
      { id: `${figureId}_q3`, label: "Q3", position: { x: q3Val, y: 0 } },
      { id: `${figureId}_max`, label: "Max", position: { x: maxVal, y: 0 } },
    ],
    segments: [],
    angles: [],
    rawSvgMarkup: svgMarkup,
  };
}
