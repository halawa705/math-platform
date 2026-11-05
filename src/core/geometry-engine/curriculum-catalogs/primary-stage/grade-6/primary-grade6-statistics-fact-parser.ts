/**
 * @file primary-grade6-statistics-fact-parser.ts
 * @description محلل حتمي للبيانات الإحصائية من النص العربي (الصف السادس الابتدائي):
 * يستخرج مواصفات التمثيل بالنقاط، الأعمدة البيانية، المدرج التكراري، ومخطط الصندوق من أرقام المسألة مباشرة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 250 سطراً).
 */

import type {
  StatisticalBarChartSpec,
  StatisticalBarItem,
  StatisticalBoxPlotSpec,
  StatisticalDotPlotSpec,
  StatisticalHistogramInterval,
  StatisticalHistogramSpec,
} from "../../../../ssot/statistics-archetype-ssot";
import { toWesternNumeralsSSOT } from "../../../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PRIMARY_GRADE6_STATISTICS_FACT_PARSER =
  "primary_grade6_statistics_fact_parser" as const;

function norm(text: string): string {
  return toWesternNumeralsSSOT(text).replace(/٫/g, ".").replace(/(?<=\d),(?=\d{3}(?!\d))/g, "");
}

function extractTitle(text: string, fallback: string): string {
  const m = text.match(/عنوان\s*[:=]?\s*([^؛;\n]+)/);
  return m ? m[1].trim() : fallback;
}

/**
 * يحلل مخطط التمثيل بالنقاط من صيغتين:
 * 1) قوائم متوازية: «القيم 3 ، 4 ، 7 ؛ التكرار 2 ، 5 ، 1»
 * 2) أزواج قيمة (تكرار) أو قيمة: تكرار: «1 (2) ، 2 (3) ، 4 (5)»
 */
export function parseDotPlotSpecFromText(raw: string): StatisticalDotPlotSpec | null {
  const t = norm(raw);
  const points: { value: number; count: number; isOutlier?: boolean }[] = [];

  const valMatch = t.match(
    /القيم\s*[:=؛;]?\s*([\d.\s،,؛;]+?)\s*[؛;،,\s]*التكرار(?:ات)?\s*[:=؛;]?\s*([\d.\s،,؛;]+)/
  );
  if (valMatch) {
    const vals = (valMatch[1].match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
    const counts = (valMatch[2].match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
    if (vals.length >= 2 && vals.length === counts.length) {
      for (let i = 0; i < vals.length; i++) {
        points.push({ value: vals[i], count: counts[i] });
      }
    }
  }

  if (points.length === 0) {
    const pairRegex = /(\d+(?:\.\d+)?)\s*\(\s*(\d+)\s*\)/g;
    for (const m of t.matchAll(pairRegex)) {
      points.push({ value: Number(m[1]), count: Number(m[2]) });
    }
  }

  if (points.length < 2) return null;

  const values = points.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const diffs: number[] = [];
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) diffs.push(sorted[i] - sorted[i - 1]);
  const minDiff = diffs.length > 0 ? Math.min(...diffs) : 1;
  const step = minDiff >= 10 ? 10 : minDiff >= 5 ? 5 : minDiff >= 2 && (maxVal - minVal) >= 16 ? 2 : 1;

  // تمييز القيمة المتطرفة إن بَعُدت عن أقرب جار بأكثر من 3 خطوات
  if (sorted.length >= 3) {
    const firstGap = sorted[1] - sorted[0];
    const lastGap = sorted[sorted.length - 1] - sorted[sorted.length - 2];
    for (let i = 0; i < points.length; i++) {
      if (points[i].value === sorted[0] && firstGap >= 4 * step) {
        points[i] = { ...points[i], isOutlier: true };
      } else if (points[i].value === sorted[sorted.length - 1] && lastGap >= 4 * step) {
        points[i] = { ...points[i], isOutlier: true };
      }
    }
  }

  return {
    titleArabic: extractTitle(t, "مخطط التمثيل بالنقاط"),
    xLabelArabic: "القيم",
    minVal,
    maxVal,
    step,
    points,
  };
}

/**
 * يحلل التمثيل البياني بالأعمدة من:
 * 1) قوائم متوازية: «الفئات أ ، ب ، ج ؛ التكرار 10 ، 20 ، 15»
 * 2) أزواج «فئة: عدد» أو «فئة عدد» مفصولة بـ «؛» أو «،»
 */
export function parseBarChartSpecFromText(raw: string): StatisticalBarChartSpec | null {
  const t = norm(raw)
    .replace(/^.*?(?:تمثيل\s*بياني\s*بالأعمدة|أعمدة\s*بيانية|بالأعمدة\s*المنفصلة)\s*[:：]?\s*/i, "");
  const bars: StatisticalBarItem[] = [];

  const clauses = t.split(/\s*[؛;،,]+\s*/).map((c) => c.trim()).filter(Boolean);
  for (const clause of clauses) {
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
    if (numCat) {
      bars.push({ categoryLabel: numCat[1], frequency: Number(numCat[2] ?? numCat[3]) });
    }
  }

  if (bars.length < 2) return null;
  return {
    titleArabic: extractTitle(t, "التمثيل البياني بالأعمدة"),
    xLabelArabic: "الفئات",
    yLabelArabic: "التكرار",
    bars,
  };
}

/**
 * يحلل المدرج التكراري من:
 * 1) «الفترات 0-9 ، 10-19 ، 20-29 ؛ التكرار 3 ، 8 ، 5»
 * 2) أزواج «0-9: 4 ؛ 10-19: 6» أو «0-9 (4) ، 10-19 (6)»
 */
export function parseHistogramSpecFromText(raw: string): StatisticalHistogramSpec | null {
  const t = norm(raw);
  const intervals: StatisticalHistogramInterval[] = [];

  const parallelMatch = t.match(
    /الفترات\s*[:=؛;]?\s*([\d\s\-–،,؛;]+?)\s*[؛;،,\s]*التكرار(?:ات)?\s*[:=؛;]?\s*([\d.\s،,؛;]+)/
  );
  if (parallelMatch) {
    const ivs = parallelMatch[1].match(/\d+\s*[-–]\s*\d+/g) ?? [];
    const freqs = (parallelMatch[2].match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
    if (ivs.length >= 2 && ivs.length === freqs.length) {
      for (let i = 0; i < ivs.length; i++) {
        const [lo, hi] = ivs[i].split(/[-–]/).map((s) => Number(s.trim()));
        intervals.push({
          intervalLabel: `${lo}-${hi}`,
          frequency: freqs[i],
          lowerBound: lo,
          upperBound: hi,
        });
      }
    }
  }

  if (intervals.length === 0) {
    const pairRegex = /(\d+)\s*[-–]\s*(\d+)\s*(?:[:：=]\s*(\d+(?:\.\d+)?)|\(\s*(\d+(?:\.\d+)?)\s*\))/g;
    for (const m of t.matchAll(pairRegex)) {
      const lo = Number(m[1]);
      const hi = Number(m[2]);
      const freq = Number(m[3] ?? m[4]);
      intervals.push({
        intervalLabel: `${lo}-${hi}`,
        frequency: freq,
        lowerBound: lo,
        upperBound: hi,
      });
    }
  }

  if (intervals.length < 2) return null;
  return {
    titleArabic: extractTitle(t, "المدرج التكراري"),
    xLabelArabic: "الفترات",
    yLabelArabic: "التكرار",
    intervals,
  };
}

function medianOfSorted(arr: readonly number[]): number {
  const n = arr.length;
  const mid = Math.floor(n / 2);
  return n % 2 === 1 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

/**
 * يحلل مخطط الصندوق من:
 * 1) الخمسة أعداد الصريحة (الحد الأدنى، الربع/الربيع الأول، الوسيط، الربع/الربيع الثالث، الحد الأقصى)
 * 2) قائمة بيانات خام («البيانات: 4 ، 2 ، 1 ، 8 ، 10 ، 2 ، 8») ويحسب الربيعيات الخمسة
 */
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

  if (
    minExplicit !== null &&
    q1Explicit !== null &&
    medExplicit !== null &&
    q3Explicit !== null &&
    maxExplicit !== null &&
    minExplicit <= q1Explicit &&
    q1Explicit <= medExplicit &&
    medExplicit <= q3Explicit &&
    q3Explicit <= maxExplicit
  ) {
    const span = Math.max(maxExplicit - minExplicit, 1);
    const axisStep = span > 25 ? 5 : span > 14 ? 2 : 1;
    const axisMin = Math.floor(minExplicit / axisStep) * axisStep;
    const axisMax = Math.ceil(maxExplicit / axisStep) * axisStep;
    return {
      titleArabic: "مخطط الصندوق والطرفين",
      minVal: minExplicit,
      q1Val: q1Explicit,
      medianVal: medExplicit,
      q3Val: q3Explicit,
      maxVal: maxExplicit,
      axisMin,
      axisMax,
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
      const minVal = sorted[0];
      const maxVal = sorted[n - 1];
      const medianVal = medianOfSorted(sorted);
      const q1Val = medianOfSorted(sorted.slice(0, Math.floor(n / 2)));
      const q3Val = medianOfSorted(sorted.slice(Math.ceil(n / 2)));
      const span = Math.max(maxVal - minVal, 1);
      const axisStep = span > 25 ? 5 : span > 14 ? 2 : 1;
      return {
        titleArabic: "مخطط الصندوق والطرفين",
        minVal,
        q1Val,
        medianVal,
        q3Val,
        maxVal,
        axisMin: Math.floor(minVal / axisStep) * axisStep,
        axisMax: Math.ceil(maxVal / axisStep) * axisStep,
        axisStep,
        xLabelArabic: "القيم العددية والربيعيات",
      };
    }
  }

  return null;
}
