/**
 * @file primary-grade6-dot-plot-catalog.ts
 * @description منشئ نماذج مخطط التمثيل بالنقاط والقيم المتطرفة (Dot Plot & Outliers) للصف السادس الابتدائي:
 * يحلل البيانات الديناميكية من النص أولاً، ثم يطابق مجموعات كتاب الوزارة وسلاح التلميذ القياسية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import { buildGrade6DotPlotSvgMarkup } from "../../../../statistics-engine/primary-grade6-dot-plot-svg-builder";
import { parseDotPlotSpecFromText } from "./primary-grade6-statistics-fact-parser";

export const MODULE_ID_PRIMARY_GRADE6_DOT_PLOT_CATALOG =
  "primary_grade6_dot_plot_catalog" as const;

export function buildGrade6DotPlotFigure(
  description: string,
  figureId = "grade6_dotplot_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR {
  const d = description.trim();
  const numMode = notationLanguage === "arabic" ? "eastern" : "western";

  // 1. المحلل الديناميكي للبيانات الصريحة في النص
  const parsed = parseDotPlotSpecFromText(d);
  if (parsed) {
    const svg = buildGrade6DotPlotSvgMarkup(parsed, { numeralMode: numMode });
    return {
      figureId,
      familyId: "statistics_family",
      branchId: "stats_dot_plot",
      titleArabic: parsed.titleArabic,
      notationLanguage,
      vertices: [{ id: `${figureId}_v0`, label: String(parsed.minVal), position: { x: parsed.minVal, y: 0 } }],
      segments: [],
      angles: [],
      rawSvgMarkup: svg,
    };
  }

  // 2. نموذج عدد الكتب التي قرأها كل تلميذ (س1 ص174 سلاح التلميذ)
  if (/عدد\s*الكتب|الكتب\s*التي\s*قرأها/i.test(d)) {
    const svg = buildGrade6DotPlotSvgMarkup(
      {
        titleArabic: "عدد الكتب التي قرأها كل تلميذ",
        xLabelArabic: "عدد الكتب",
        minVal: 1,
        maxVal: 11,
        step: 1,
        points: [
          { value: 1, count: 2 },
          { value: 2, count: 3 },
          { value: 3, count: 3 },
          { value: 4, count: 5 },
          { value: 5, count: 2 },
          { value: 6, count: 1 },
          { value: 7, count: 2 },
          { value: 10, count: 1, isOutlier: true },
        ],
      },
      { numeralMode: numMode }
    );
    return {
      figureId,
      familyId: "statistics_family",
      branchId: "stats_dot_plot",
      titleArabic: "مخطط التمثيل بالنقاط: عدد الكتب التي قرأها كل تلميذ",
      notationLanguage,
      vertices: [{ id: `${figureId}_v0`, label: "1", position: { x: 1, y: 0 } }],
      segments: [],
      angles: [],
      rawSvgMarkup: svg,
    };
  }

  // 3. نموذج عدد الإخوة (يحتوي على قيمة متطرفة عند 10)
  if (/إخوة|اخوة|أخ|قيمة\s*متطرفة.*10/i.test(d)) {
    const svg = buildGrade6DotPlotSvgMarkup(
      {
        titleArabic: "عدد الإخوة لكل تلميذ",
        xLabelArabic: "عدد الإخوة",
        minVal: 0,
        maxVal: 11,
        step: 1,
        points: [
          { value: 0, count: 4 },
          { value: 1, count: 5 },
          { value: 2, count: 4 },
          { value: 3, count: 2 },
          { value: 4, count: 1 },
          { value: 10, count: 1, isOutlier: true },
        ],
      },
      { numeralMode: numMode }
    );
    return {
      figureId,
      familyId: "statistics_family",
      branchId: "stats_dot_plot",
      titleArabic: "مخطط التمثيل بالنقاط: عدد الإخوة والقيمة المتطرفة",
      notationLanguage,
      vertices: [{ id: `${figureId}_v0`, label: "0", position: { x: 0, y: 0 } }],
      segments: [],
      angles: [],
      rawSvgMarkup: svg,
    };
  }

  // 4. نموذج درجات الحرارة (قيمة متطرفة عند 2)
  if (/حرارة|درجات\s*الحرارة/i.test(d)) {
    const svg = buildGrade6DotPlotSvgMarkup(
      {
        titleArabic: "درجات الحرارة العظمى في بعض المدن",
        xLabelArabic: "الدرجات (بالسليزيوس)",
        minVal: 0,
        maxVal: 24,
        step: 2,
        points: [
          { value: 2, count: 3, isOutlier: true },
          { value: 14, count: 7 },
          { value: 15, count: 6 },
          { value: 16, count: 5 },
          { value: 17, count: 4 },
        ],
      },
      { numeralMode: numMode }
    );
    return {
      figureId,
      familyId: "statistics_family",
      branchId: "stats_dot_plot",
      titleArabic: "مخطط التمثيل بالنقاط: درجات الحرارة وقيمة متطرفة",
      notationLanguage,
      vertices: [{ id: `${figureId}_v0`, label: "0", position: { x: 0, y: 0 } }],
      segments: [],
      angles: [],
      rawSvgMarkup: svg,
    };
  }

  // 5. نموذج أطوال التلاميذ في الفصل
  if (/أطوال|طول|فصلنا|138.*160/i.test(d)) {
    const svg = buildGrade6DotPlotSvgMarkup(
      {
        titleArabic: "الأطوال في فصلنا",
        xLabelArabic: "الطول (سم)",
        minVal: 138,
        maxVal: 160,
        step: 2,
        points: [
          { value: 138, count: 1 },
          { value: 146, count: 2 },
          { value: 150, count: 3 },
          { value: 152, count: 2 },
          { value: 156, count: 2 },
          { value: 158, count: 2 },
        ],
      },
      { numeralMode: numMode }
    );
    return {
      figureId,
      familyId: "statistics_family",
      branchId: "stats_dot_plot",
      titleArabic: "مخطط التمثيل بالنقاط: الأطوال في الفصل",
      notationLanguage,
      vertices: [{ id: `${figureId}_v0`, label: "138", position: { x: 138, y: 0 } }],
      segments: [],
      angles: [],
      rawSvgMarkup: svg,
    };
  }

  // 6. الافتراضي القياسي: الزمن المستغرق في إنجاز الواجبات المنزلية
  const svg = buildGrade6DotPlotSvgMarkup(
    {
      titleArabic: "الزمن المستغرق في إنجاز الواجبات المنزلية",
      xLabelArabic: "الزمن (بالدقيقة)",
      minVal: 0,
      maxVal: 60,
      step: 10,
      points: [
        { value: 10, count: 2 },
        { value: 20, count: 3 },
        { value: 30, count: 5 },
        { value: 40, count: 4 },
        { value: 50, count: 3 },
        { value: 60, count: 2 },
      ],
    },
    { numeralMode: numMode }
  );

  return {
    figureId,
    familyId: "statistics_family",
    branchId: "stats_dot_plot",
    titleArabic: "مخطط التمثيل بالنقاط: الزمن بالدقائق",
    notationLanguage,
    vertices: [{ id: `${figureId}_v0`, label: "0", position: { x: 0, y: 0 } }],
    segments: [],
    angles: [],
    rawSvgMarkup: svg,
  };
}
