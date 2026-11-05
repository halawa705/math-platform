/**
 * @file primary-grade6-histogram-bar-catalog.ts
 * @description منشئ نماذج المدرج التكراري والأعمدة البيانية للصف السادس الابتدائي:
 * يحلل الفترات والفئات والتكرارات من النص مباشرة أولاً، ثم يطابق نماذج الكتاب القياسية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 230 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import { buildGrade6HistogramSvgMarkup } from "../../../../statistics-engine/primary-grade6-histogram-svg-builder";
import { buildGrade6BarChartSvgMarkup } from "../../../../statistics-engine/primary-grade6-bar-chart-svg-builder";
import {
  parseBarChartSpecFromText,
  parseHistogramSpecFromText,
} from "./primary-grade6-statistics-fact-parser";

export const MODULE_ID_PRIMARY_GRADE6_HISTOGRAM_BAR_CATALOG =
  "primary_grade6_histogram_bar_catalog" as const;

export function buildGrade6HistogramFigure(
  description: string,
  figureId = "grade6_histogram_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR {
  const d = description.trim();
  const numMode = notationLanguage === "arabic" ? "eastern" : "western";

  // 1. المحلل الديناميكي للفترات والتكرارات الصريحة في النص
  const parsed = parseHistogramSpecFromText(d);
  if (parsed) {
    const svg = buildGrade6HistogramSvgMarkup(parsed, { numeralMode: numMode });
    return {
      figureId,
      familyId: "statistics_family",
      branchId: "stats_histogram_columns",
      titleArabic: parsed.titleArabic,
      notationLanguage,
      vertices: [{ id: `${figureId}_v0`, label: "0", position: { x: 0, y: 0 } }],
      segments: [],
      angles: [],
      rawSvgMarkup: svg,
    };
  }

  // 2. نموذج أعمار بعض الأشخاص (فترة تكرارها صفر 31-37)
  if (/أعمار|اعمار|شخص|31\s*[-–]\s*37/i.test(d)) {
    const svg = buildGrade6HistogramSvgMarkup(
      {
        titleArabic: "أعمار بعض الأشخاص",
        xLabelArabic: "الأعمار (بالسنوات)",
        yLabelArabic: "التكرار (عدد الأشخاص)",
        intervals: [
          { intervalLabel: "10-16", frequency: 11 },
          { intervalLabel: "17-23", frequency: 9 },
          { intervalLabel: "24-30", frequency: 6 },
          { intervalLabel: "31-37", frequency: 0 },
          { intervalLabel: "38-44", frequency: 3 },
        ],
        yMax: 12,
        yStep: 2,
      },
      { numeralMode: numMode }
    );
    return {
      figureId,
      familyId: "statistics_family",
      branchId: "stats_histogram_columns",
      titleArabic: "المدرج التكراري: أعمار بعض الأشخاص",
      notationLanguage,
      vertices: [{ id: `${figureId}_v0`, label: "0", position: { x: 0, y: 0 } }],
      segments: [],
      angles: [],
      rawSvgMarkup: svg,
    };
  }

  // 3. نموذج ساعات المذاكرة
  if (/ساعات|مذاكرة|يذاكر/i.test(d)) {
    const svg = buildGrade6HistogramSvgMarkup(
      {
        titleArabic: "عدد الساعات التي يذاكرها بعض التلاميذ",
        xLabelArabic: "عدد الساعات",
        yLabelArabic: "التكرار (عدد التلاميذ)",
        intervals: [
          { intervalLabel: "2-3", frequency: 4 },
          { intervalLabel: "4-5", frequency: 6 },
          { intervalLabel: "6-7", frequency: 5 },
          { intervalLabel: "8-9", frequency: 7 },
        ],
        yMax: 8,
        yStep: 2,
      },
      { numeralMode: numMode }
    );
    return {
      figureId,
      familyId: "statistics_family",
      branchId: "stats_histogram_columns",
      titleArabic: "المدرج التكراري: ساعات المذاكرة",
      notationLanguage,
      vertices: [{ id: `${figureId}_v0`, label: "0", position: { x: 0, y: 0 } }],
      segments: [],
      angles: [],
      rawSvgMarkup: svg,
    };
  }

  // 4. الافتراضي القياسي: درجات الاختبار
  const svg = buildGrade6HistogramSvgMarkup(
    {
      titleArabic: "درجات الاختبار",
      xLabelArabic: "الدرجات",
      yLabelArabic: "عدد التلاميذ",
      intervals: [
        { intervalLabel: "51-60", frequency: 2 },
        { intervalLabel: "61-70", frequency: 4 },
        { intervalLabel: "71-80", frequency: 10 },
        { intervalLabel: "81-90", frequency: 8 },
        { intervalLabel: "91-100", frequency: 6 },
      ],
      yMax: 10,
      yStep: 2,
    },
    { numeralMode: numMode }
  );

  return {
    figureId,
    familyId: "statistics_family",
    branchId: "stats_histogram_columns",
    titleArabic: "المدرج التكراري: درجات الاختبار",
    notationLanguage,
    vertices: [{ id: `${figureId}_v0`, label: "0", position: { x: 0, y: 0 } }],
    segments: [],
    angles: [],
    rawSvgMarkup: svg,
  };
}

export function buildGrade6BarChartFigure(
  description: string,
  figureId = "grade6_barchart_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR {
  const d = description.trim();
  const numMode = notationLanguage === "arabic" ? "eastern" : "western";

  // 1. المحلل الديناميكي للفئات والتكرارات الصريحة في النص
  const parsed = parseBarChartSpecFromText(d);
  if (parsed) {
    const svg = buildGrade6BarChartSvgMarkup(parsed, { numeralMode: numMode });
    return {
      figureId,
      familyId: "statistics_family",
      branchId: "stats_bar_chart",
      titleArabic: parsed.titleArabic,
      notationLanguage,
      vertices: [{ id: `${figureId}_v0`, label: "0", position: { x: 0, y: 0 } }],
      segments: [],
      angles: [],
      rawSvgMarkup: svg,
    };
  }

  // 2. نموذج وجبات الغداء المشتراة
  if (/وجبات|غذاء|غداء|أسبوع|اسبوع/i.test(d)) {
    const svg = buildGrade6BarChartSvgMarkup(
      {
        titleArabic: "عدد وجبات الغداء المشتراة لكل أسبوع",
        xLabelArabic: "عدد وجبات الغداء المشتراة",
        yLabelArabic: "عدد التلاميذ",
        bars: [
          { categoryLabel: "0", frequency: 3 },
          { categoryLabel: "1", frequency: 6 },
          { categoryLabel: "2", frequency: 4 },
          { categoryLabel: "3", frequency: 2 },
          { categoryLabel: "4", frequency: 2 },
          { categoryLabel: "5", frequency: 1 },
        ],
        yMax: 8,
        yStep: 1,
      },
      { numeralMode: numMode }
    );
    return {
      figureId,
      familyId: "statistics_family",
      branchId: "stats_bar_chart",
      titleArabic: "الأعمدة البيانية: وجبات الغداء المشتراة",
      notationLanguage,
      vertices: [{ id: `${figureId}_v0`, label: "0", position: { x: 0, y: 0 } }],
      segments: [],
      angles: [],
      rawSvgMarkup: svg,
    };
  }

  // 3. الافتراضي القياسي: عروض التليفزيون المفضلة
  const svg = buildGrade6BarChartSvgMarkup(
    {
      titleArabic: "عروض التليفزيون المفضلة",
      xLabelArabic: "عروض التليفزيون",
      yLabelArabic: "عدد التلاميذ",
      bars: [
        { categoryLabel: "برامج الألعاب", frequency: 6, barColorHex: "#10B981" },
        { categoryLabel: "برامج المنوعات", frequency: 4, barColorHex: "#3B82F6" },
        { categoryLabel: "البرامج الرياضية", frequency: 3, barColorHex: "#F43F5E" },
        { categoryLabel: "الأفلام الكوميدية", frequency: 5, barColorHex: "#F59E0B" },
      ],
      yMax: 6,
      yStep: 1,
    },
    { numeralMode: numMode }
  );

  return {
    figureId,
    familyId: "statistics_family",
    branchId: "stats_bar_chart",
    titleArabic: "التمثيل البياني بالأعمدة: عروض التليفزيون",
    notationLanguage,
    vertices: [{ id: `${figureId}_v0`, label: "0", position: { x: 0, y: 0 } }],
    segments: [],
    angles: [],
    rawSvgMarkup: svg,
  };
}
