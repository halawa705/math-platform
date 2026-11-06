/**
 * @file probability-tree-svg-builder.ts
 * @description مصيّر شجرة الاحتمالات وفضاء العينة كمتجه SVG حتمي (المرحلة 4.7):
 * يرسم تفرعات التجربة العشوائية على مرحلتين مع احتمالات الفروع ونواتج فضاء العينة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (< 150 سطراً).
 */

import type { ParsedStatisticsSpec } from "./statistics-tag-parser";

export const MODULE_ID_PROBABILITY_TREE_SVG_BUILDER =
  "probability_tree_svg_builder" as const;

export interface ProbabilityBranchNode {
  readonly label: string;
  readonly probText: string;
}

export function buildProbabilityTreeSvgMarkup(
  spec: ParsedStatisticsSpec
): string {
  const width = 290;
  const height = 180;

  // استخراج فروع المرحلة الأولى
  const rawCats = spec.categories.length >= 2
    ? spec.categories
    : [
        { label: "صورة (H)", value: 0.5 },
        { label: "كتابة (T)", value: 0.5 },
      ];

  const stage1Nodes: ProbabilityBranchNode[] = rawCats.slice(0, 2).map((c) => ({
    label: c.label,
    probText: c.value <= 1 ? `${c.value}` : "½",
  }));

  const treeSvg: string[] = [];

  // عنوان الرسم
  treeSvg.push(
    `<text x="${(width / 2).toFixed(1)}" y="18" text-anchor="middle" font-size="11" font-weight="900" fill="#0F172A">${spec.titleArabic}</text>`
  );

  const rootX = 30;
  const rootY = 95;

  // عقدة البداية
  treeSvg.push(
    `<circle cx="${rootX}" cy="${rootY}" r="4" fill="#1E293B" />
    <text x="${rootX - 8}" y="${rootY + 4}" text-anchor="end" font-size="8" font-weight="900" fill="#1E293B">البداية</text>`
  );

  // المرحلة الأولى (فرعان رئيسيان)
  const s1X = 110;
  const s1Ys = [55, 135];

  // المرحلة الثانية (4 فروع فرعية)
  const s2X = 200;
  const s2Ys = [35, 75, 115, 155];

  stage1Nodes.forEach((node1, idx1) => {
    const y1 = s1Ys[idx1];
    // فرع من البداية للمرحلة 1
    treeSvg.push(
      `<line x1="${rootX}" y1="${rootY}" x2="${s1X}" y2="${y1}" stroke="#2563EB" stroke-width="1.8" />
      <text x="${(rootX + s1X) / 2 - 4}" y="${(rootY + y1) / 2 - 4}" font-size="7.5" font-weight="800" fill="#2563EB">${node1.probText}</text>
      <circle cx="${s1X}" cy="${y1}" r="3.5" fill="#2563EB" />
      <text x="${s1X + 6}" y="${y1 + 3}" font-size="8.5" font-weight="900" fill="#0F172A">${node1.label}</text>`
    );

    // فرعان لكل عقدة في المرحلة 2
    stage1Nodes.forEach((node2, idx2) => {
      const branchIndex = idx1 * 2 + idx2;
      const y2 = s2Ys[branchIndex];
      const outcome = `${node1.label[0]}, ${node2.label[0]}`;

      treeSvg.push(
        `<line x1="${s1X + 28}" y1="${y1}" x2="${s2X}" y2="${y2}" stroke="#059669" stroke-width="1.4" />
        <text x="${(s1X + 28 + s2X) / 2 - 2}" y="${(y1 + y2) / 2 - 3}" font-size="7" font-weight="700" fill="#059669">${node2.probText}</text>
        <circle cx="${s2X}" cy="${y2}" r="3" fill="#059669" />
        <text x="${s2X + 6}" y="${y2 + 3}" font-size="7.5" font-weight="700" fill="#334155">${node2.label}</text>
        <text x="${s2X + 54}" y="${y2 + 3}" font-size="8" font-weight="900" fill="#7C3AED">(${outcome})</text>`
      );
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none">${treeSvg.join("")}</svg>`;
}
