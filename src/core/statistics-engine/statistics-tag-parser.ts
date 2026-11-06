/**
 * @file statistics-tag-parser.ts
 * @description محلل وسوم الرسوم والجداول الإحصائية [رسم إحصائي: ...] (المرحلة 4.1):
 * يحلل مختلف الأشكال الإحصائية المقررة في الابتدائي والإعدادي:
 * - جدول توزيع تكراري (frequency_table)
 * - قطاعات دائرية (pie_chart)
 * - مضلع ومنحنى تكراري (frequency_polygon / frequency_curve)
 * - منحنى متجمع صاعد ونازل (ascending_ogive / descending_ogive)
 * - شجرة الاحتمالات (probability_tree)
 * - بالإضافة إلى الأشكال الأربعة للصف السادس (أعمدة، مدرج، صندوق، نقاط).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (< 200 سطر).
 */

import { toWesternNumeralsSSOT } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_STATISTICS_TAG_PARSER = "statistics_tag_parser" as const;

export type ParsedStatisticsChartType =
  | "frequency_table"
  | "pie_chart"
  | "frequency_polygon"
  | "frequency_curve"
  | "ascending_ogive"
  | "descending_ogive"
  | "probability_tree"
  | "histogram"
  | "bar_chart"
  | "box_plot"
  | "dot_plot";

export interface ParsedStatisticsCategoryItem {
  readonly label: string;
  readonly value: number;
  readonly angleDeg?: number;
  readonly percentage?: number;
}

export interface ParsedStatisticsSpec {
  readonly chartType: ParsedStatisticsChartType;
  readonly titleArabic: string;
  readonly xLabelArabic?: string;
  readonly yLabelArabic?: string;
  readonly categories: readonly ParsedStatisticsCategoryItem[];
  readonly rawText: string;
}

function norm(text: string): string {
  return toWesternNumeralsSSOT(text).replace(/٫/g, ".").replace(/\s+/g, " ").trim();
}

function detectChartType(text: string): ParsedStatisticsChartType {
  if (/قطاع(?:ات)?\s*دائري/i.test(text)) return "pie_chart";
  if (/صاعد/i.test(text)) return "ascending_ogive";
  if (/نازل|هابط/i.test(text)) return "descending_ogive";
  if (/مضلع\s*تكراري/i.test(text)) return "frequency_polygon";
  if (/منحنى\s*تكراري/i.test(text)) return "frequency_curve";
  if (/شجر(?:ة)?\s*(?:ال)?احتمال/i.test(text)) return "probability_tree";
  if (/مدرج/i.test(text)) return "histogram";
  if (/صندوق/i.test(text)) return "box_plot";
  if (/نقاط/i.test(text)) return "dot_plot";
  if (/أعمدة|اعمدة/i.test(text)) return "bar_chart";
  return "frequency_table";
}

const STATS_EXPLICIT_REGEX =
  /(?:\[\s*رسم\s*(?:إحصائي|احصائي|بياني)|مدرج|صندوق|تمثيل\s*بالنقاط|أعمدة\s*بيانية|قطاع(?:ات)?\s*دائري|جدول\s*(?:توزيع\s*)?تكراري|مضلع\s*تكراري|منحنى\s*تكراري|منحنى\s*صاعد|منحنى\s*نازل|شجر(?:ة)?\s*(?:ال)?احتمال|فضاء\s*العينة)/i;

export function parseStatisticsTagDescription(rawText: string): ParsedStatisticsSpec | null {
  if (!STATS_EXPLICIT_REGEX.test(rawText)) {
    return null;
  }

  const clean = norm(rawText)
    .replace(/^\[?\s*رسم\s*(?:إحصائي|احصائي|بياني)\s*[:：]?\s*/i, "")
    .replace(/\]$/i, "")
    .trim();

  if (!clean) return null;

  const chartType = detectChartType(clean);

  // استخراج العنوان إن ذُكر
  const titleM = clean.match(/عنوان\s*[:=]?\s*([^؛;\n]+)/);
  const titleArabic = titleM
    ? titleM[1].trim()
    : chartType === "pie_chart"
    ? "التمثيل بالقطاعات الدائرية"
    : chartType === "frequency_table"
    ? "جدول التوزيع التكراري"
    : chartType === "frequency_polygon"
    ? "المضلع التكراري"
    : chartType === "frequency_curve"
    ? "المنحنى التكراري"
    : chartType === "ascending_ogive"
    ? "المنحنى المتجمع الصاعد"
    : chartType === "descending_ogive"
    ? "المنحنى المتجمع النازل"
    : chartType === "probability_tree"
    ? "شجرة الاحتمالات"
    : "تمثيل إحصائي";

  const categories: ParsedStatisticsCategoryItem[] = [];

  // 1. نمط القوائم المتوازية: فئات = أ ، ب ، ج ؛ تكرار/قيم = 10 ، 20 ، 30
  const parallelMatch = clean.match(
    /(?:ال)?(?:فئات|مجموعات|أقسام|عناصر|حدود)\s*[:=]?\s*([^؛;\n]+?)\s*[؛;\n]\s*(?:ال)?(?:تكرار|قيم|نسب|زوايا)(?:ات)?\s*[:=]?\s*([^؛;\n]+)/i
  );
  if (parallelMatch) {
    const rawCats = parallelMatch[1].split(/[,،؛;]/).map((s) => s.trim()).filter(Boolean);
    const rawVals = (parallelMatch[2].match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
    if (rawCats.length >= 2 && rawCats.length === rawVals.length) {
      for (let i = 0; i < rawCats.length; i++) {
        categories.push({ label: rawCats[i], value: rawVals[i] });
      }
    }
  }

  // 2. نمط الأزواج: فئة: قيمة أو فئة (قيمة) أو فئة 40%
  if (categories.length === 0) {
    const clauses = clean.split(/[؛;\n]/).map((s) => s.trim()).filter(Boolean);
    for (const clause of clauses) {
      if (/^(?:نوع|عنوان|المحور)/.test(clause)) continue;
      // رياضة 40% أو أ: 15 أو 10- (5)
      const m = clause.match(/^([^\d:：=()]+?|\d+[-–]?)\s*[:：=]?\s*(?:\(\s*(\d+(?:\.\d+)?)\s*\)|(\d+(?:\.\d+)?)\s*(%|درجة|°)?)$/);
      if (m) {
        const lbl = m[1].trim();
        const num = Number(m[2] ?? m[3]);
        const unit = m[4] ?? "";
        if (lbl && !Number.isNaN(num)) {
          const item: ParsedStatisticsCategoryItem = {
            label: lbl,
            value: num,
            percentage: unit === "%" ? num : undefined,
            angleDeg: unit === "°" || unit === "درجة" ? num : undefined,
          };
          categories.push(item);
        }
      }
    }
  }

  // 3. نمط الأزواج السريع المفصول بفواصل: فئة 20 ، فئة 30
  if (categories.length === 0) {
    const pairRegex = /([^\d,،؛;:\n]+?)\s*[:：=]?\s*(\d+(?:\.\d+)?)\s*(%|°|درجة)?/g;
    for (const m of clean.matchAll(pairRegex)) {
      const lbl = m[1].trim().replace(/^(?:فئات|مجموعات|تكرار)\s*/, "");
      if (lbl && !/^(?:نوع|عنوان)/.test(lbl)) {
        categories.push({
          label: lbl,
          value: Number(m[2]),
          percentage: m[3] === "%" ? Number(m[2]) : undefined,
          angleDeg: m[3] === "°" || m[3] === "درجة" ? Number(m[2]) : undefined,
        });
      }
    }
  }

  if (categories.length < 2 && chartType !== "probability_tree") {
    return null;
  }

  return {
    chartType,
    titleArabic,
    categories,
    rawText: clean,
  };
}
