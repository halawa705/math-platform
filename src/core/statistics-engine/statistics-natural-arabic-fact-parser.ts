/**
 * @file statistics-natural-arabic-fact-parser.ts
 * @description المحلل الحتمي الموحد للبيانات الإحصائية من النص العربي (الابتدائي والإعدادي):
 * يستخرج مواصفات التمثيل بالنقاط، الأعمدة المفردة والمزدوجة، المدرج التكراري، ومخطط الصندوق مباشرة من معطيات المسألة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 270 سطراً).
 */

import type {
  StatisticalBarChartSpec,
  StatisticalBarItem,
  StatisticalBoxPlotSpec,
  StatisticalDotPlotSpec,
  StatisticalDoubleBarChartSpec,
  StatisticalDoubleBarItem,
  StatisticalHistogramInterval,
  StatisticalHistogramSpec,
} from "../ssot/statistics-archetype-ssot";
import { toWesternNumeralsSSOT } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_STATISTICS_NATURAL_ARABIC_FACT_PARSER =
  "statistics_natural_arabic_fact_parser" as const;

function norm(text: string): string {
  return toWesternNumeralsSSOT(text).replace(/٫/g, ".").replace(/(?<=\d),(?=\d{3}(?!\d))/g, "");
}

function extractTitle(text: string, fallback: string): string {
  const m = text.match(/عنوان\s*[:=]?\s*([^؛;\n]+)/);
  return m ? m[1].trim() : fallback;
}

export function parseDotPlotSpecFromText(raw: string): StatisticalDotPlotSpec | null {
  const t = norm(raw);
  const points: { value: number; count: number; isOutlier?: boolean }[] = [];

  const valMatch = t.match(/القيم\s*[:=؛;]?\s*([\d.\s،,؛;]+?)\s*[؛;،,\s]*التكرار(?:ات)?\s*[:=؛;]?\s*([\d.\s،,؛;]+)/);
  if (valMatch) {
    const vals = (valMatch[1].match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
    const counts = (valMatch[2].match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
    if (vals.length >= 2 && vals.length === counts.length) {
      for (let i = 0; i < vals.length; i++) points.push({ value: vals[i], count: counts[i] });
    }
  }

  if (points.length === 0) {
    for (const m of t.matchAll(/(\d+(?:\.\d+)?)\s*\(\s*(\d+)\s*\)/g)) {
      points.push({ value: Number(m[1]), count: Number(m[2]) });
    }
  }

  if (points.length === 0 && /نقاط/i.test(t)) {
    const rangeM = t.match(/من\s*(\d+(?:\.\d+)?)\s*إلى\s*(\d+(?:\.\d+)?)/i);
    if (rangeM && Number(rangeM[2]) > Number(rangeM[1])) {
      points.push({ value: Number(rangeM[1]), count: 1 }, { value: Number(rangeM[2]), count: 1 });
    }
  }

  if (points.length < 2) return null;

  const values = points.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  const diffs: number[] = [];
  for (let i = 1; i < sorted.length; i++) diffs.push(sorted[i] - sorted[i - 1]);
  const minDiff = diffs.length > 0 ? Math.min(...diffs) : 1;
  const step = minDiff >= 10 ? 10 : minDiff >= 5 ? 5 : minDiff >= 2 && maxVal - minVal >= 16 ? 2 : 1;

  if (sorted.length >= 3) {
    const firstGap = sorted[1] - sorted[0];
    const lastGap = sorted[sorted.length - 1] - sorted[sorted.length - 2];
    for (let i = 0; i < points.length; i++) {
      if ((points[i].value === sorted[0] && firstGap >= 4 * step) || (points[i].value === sorted[sorted.length - 1] && lastGap >= 4 * step)) {
        points[i] = { ...points[i], isOutlier: true };
      }
    }
  }

  return { titleArabic: extractTitle(t, "مخطط التمثيل بالنقاط"), xLabelArabic: "القيم", minVal, maxVal, step, points };
}

export function parseBarChartSpecFromText(raw: string): StatisticalBarChartSpec | null {
  if (/مزدوج/i.test(raw)) return null;
  const t = norm(raw).replace(/^.*?(?:تمثيل\s*بياني\s*بالأعمدة|أعمدة\s*بيانية|بالأعمدة\s*المنفصلة)\s*[:：]?\s*/i, "");
  const bars: StatisticalBarItem[] = [];

  for (const clause of t.split(/\s*[؛;،,]+\s*/).map((c) => c.trim()).filter(Boolean)) {
    if (/^(?:عنوان|المحور)/.test(clause)) continue;
    const m = clause.match(/^([^\d:：=()]+?)\s*[:：=]?\s*(?:\(\s*(\d+(?:\.\d+)?)\s*\)|(\d+(?:\.\d+)?))$/);
    if (m) {
      const label = m[1].trim();
      const freq = Number(m[2] ?? m[3]);
      if (label && !Number.isNaN(freq)) {
        bars.push({ categoryLabel: label, frequency: freq });
        continue;
      }
    }
    const numCat = clause.match(/^(\d+)\s*(?:[:：=]\s*(\d+(?:\.\d+)?)|\(\s*(\d+(?:\.\d+)?)\s*\))$/);
    if (numCat) bars.push({ categoryLabel: numCat[1], frequency: Number(numCat[2] ?? numCat[3]) });
  }

  if (bars.length < 2) return null;
  return { titleArabic: extractTitle(t, "التمثيل البياني بالأعمدة"), xLabelArabic: "الفئات", yLabelArabic: "التكرار", bars };
}

export function parseDoubleBarChartSpecFromText(raw: string): StatisticalDoubleBarChartSpec | null {
  if (!/أعمدة\s*مزدوجة|مزدوج/i.test(raw)) return null;
  const t = norm(raw);
  const bars: StatisticalDoubleBarItem[] = [];
  let s1Label = "المجموعة 1";
  let s2Label = "المجموعة 2";

  const catsM = t.match(/الفئات\s*(?:[:=]|\s)\s*([^؛;\n]+)/);
  const ser1M = t.match(/(?:السلسلة\s*1|الأول(?:ى)?|الصف\s*الأول)\s*(?:\(\s*([^)]+)\s*\))?\s*(?:[:=]|\s)\s*([^؛;\n]+)/);
  const ser2M = t.match(/(?:السلسلة\s*2|الثاني(?:ة)?|الصف\s*الثاني)\s*(?:\(\s*([^)]+)\s*\))?\s*(?:[:=]|\s)\s*([^؛;\n]+)/);

  if (catsM && ser1M && ser2M) {
    const cats = catsM[1].split(/[،,]/).map((s) => s.trim()).filter(Boolean);
    const v1 = (ser1M[2].match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
    const v2 = (ser2M[2].match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
    if (ser1M[1]) s1Label = ser1M[1].trim();
    if (ser2M[1]) s2Label = ser2M[1].trim();
    if (cats.length >= 2 && cats.length === v1.length && cats.length === v2.length) {
      for (let i = 0; i < cats.length; i++) bars.push({ categoryLabel: cats[i], series1Value: v1[i], series2Value: v2[i] });
    }
  }

  if (bars.length === 0) {
    for (const m of t.matchAll(/([^\d:：;؛،,\n/]{2,25})\s*[:：=]?\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/g)) {
      bars.push({ categoryLabel: m[1].trim(), series1Value: Number(m[2]), series2Value: Number(m[3]) });
    }
  }

  if (bars.length >= 2) {
    return { titleArabic: extractTitle(t, "التمثيل البياني بالأعمدة المزدوجة"), xLabelArabic: "الفئات", yLabelArabic: "القيم", series1Label: s1Label, series2Label: s2Label, bars };
  }

  // شكل مفاهيمي خالٍ من الأرقام المسربة عند غياب البيانات الرقمية في السؤال
  if (!/\d/.test(t.replace(/5ب|6ب/, ""))) {
    return {
      titleArabic: "التمثيل البياني بالأعمدة المزدوجة",
      xLabelArabic: "المواد الدراسية",
      yLabelArabic: "الدرجات",
      series1Label: "الاختبار الأول",
      series2Label: "الاختبار الثاني",
      omitDataGivenValues: true,
      bars: [
        { categoryLabel: "العلوم", series1Value: 7, series2Value: 9 },
        { categoryLabel: "الرياضيات", series1Value: 8, series2Value: 10 },
        { categoryLabel: "العربية", series1Value: 6, series2Value: 8 },
      ],
    };
  }
  return null;
}

export function parseHistogramSpecFromText(raw: string): StatisticalHistogramSpec | null {
  const t = norm(raw);
  const intervals: StatisticalHistogramInterval[] = [];

  const parallelMatch = t.match(/الفترات\s*[:=؛;]?\s*([\d\s\-–،,؛;]+?)\s*[؛;،,\s]*التكرار(?:ات)?\s*[:=؛;]?\s*([\d.\s،,؛;]+)/);
  if (parallelMatch) {
    const ivs = parallelMatch[1].match(/\d+\s*[-–]\s*\d+/g) ?? [];
    const freqs = (parallelMatch[2].match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
    if (ivs.length >= 2 && ivs.length === freqs.length) {
      for (let i = 0; i < ivs.length; i++) {
        const [lo, hi] = ivs[i].split(/[-–]/).map((s) => Number(s.trim()));
        intervals.push({ intervalLabel: `${lo}-${hi}`, frequency: freqs[i], lowerBound: lo, upperBound: hi });
      }
    }
  }

  if (intervals.length === 0) {
    for (const m of t.matchAll(/(\d+)\s*[-–]\s*(\d+)\s*(?:[:：=]\s*(\d+(?:\.\d+)?)|\(\s*(\d+(?:\.\d+)?)\s*\))/g)) {
      intervals.push({ intervalLabel: `${Number(m[1])}-${Number(m[2])}`, frequency: Number(m[3] ?? m[4]), lowerBound: Number(m[1]), upperBound: Number(m[2]) });
    }
  }

  if (intervals.length === 0) {
    for (const m of t.matchAll(/(\d+)\s*[-–]\s*[:：=]\s*(\d+(?:\.\d+)?)/g)) {
      intervals.push({ intervalLabel: `${Number(m[1])}-`, frequency: Number(m[2]), lowerBound: Number(m[1]) });
    }
  }

  if (intervals.length < 2) return null;
  return { titleArabic: extractTitle(t, "المدرج التكراري"), xLabelArabic: "الفترات", yLabelArabic: "التكرار", intervals };
}

function medianOfSorted(arr: readonly number[]): number {
  const n = arr.length;
  const mid = Math.floor(n / 2);
  return n % 2 === 1 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

export function parseBoxPlotSpecFromText(raw: string): StatisticalBoxPlotSpec | null {
  const t = norm(raw);
  const grab = (pattern: string): number | null => {
    const m = t.match(new RegExp(`${pattern}\\s*[:=]?\\s*(\\d+(?:\\.\\d+)?)`));
    return m ? Number(m[1]) : null;
  };

  const minExplicit = grab("الحد\\s*الأدنى");
  const q1Explicit = grab("(?:الربع|الربيع)\\s*(?:الأول|السفلي)");
  const medExplicit = grab("الوسيط");
  const q3Explicit = grab("(?:الربع|الربيع)\\s*(?:الثالث|العلوي)");
  const maxExplicit = grab("الحد\\s*الأقصى");

  if (minExplicit !== null && q1Explicit !== null && medExplicit !== null && q3Explicit !== null && maxExplicit !== null &&
    minExplicit <= q1Explicit && q1Explicit <= medExplicit && medExplicit <= q3Explicit && q3Explicit <= maxExplicit) {
    const span = Math.max(maxExplicit - minExplicit, 1);
    const axisStep = span > 25 ? 5 : span > 14 ? 2 : 1;
    return {
      titleArabic: "مخطط الصندوق والطرفين",
      minVal: minExplicit, q1Val: q1Explicit, medianVal: medExplicit, q3Val: q3Explicit, maxVal: maxExplicit,
      axisMin: Math.floor(minExplicit / axisStep) * axisStep,
      axisMax: Math.ceil(maxExplicit / axisStep) * axisStep,
      axisStep,
      xLabelArabic: "القيم العددية والربيعيات",
    };
  }

  const rawDataMatch = t.match(/(?:البيانات(?:\s*التالية)?|للقيم)\s*[:：؛;=]?\s*([\d.,،؛;\s]+)/);
  if (rawDataMatch) {
    const nums = (rawDataMatch[1].match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
    if (nums.length >= 5) {
      const sorted = [...nums].sort((a, b) => a - b);
      const n = sorted.length;
      const minVal = sorted[0]; const maxVal = sorted[n - 1];
      const medianVal = medianOfSorted(sorted);
      const q1Val = medianOfSorted(sorted.slice(0, Math.floor(n / 2)));
      const q3Val = medianOfSorted(sorted.slice(Math.ceil(n / 2)));
      const span = Math.max(maxVal - minVal, 1);
      const axisStep = span > 25 ? 5 : span > 14 ? 2 : 1;
      return {
        titleArabic: "مخطط الصندوق والطرفين",
        minVal, q1Val, medianVal, q3Val, maxVal,
        axisMin: Math.floor(minVal / axisStep) * axisStep,
        axisMax: Math.ceil(maxVal / axisStep) * axisStep,
        axisStep,
        xLabelArabic: "القيم العددية والربيعيات",
      };
    }
  }

  return null;
}
