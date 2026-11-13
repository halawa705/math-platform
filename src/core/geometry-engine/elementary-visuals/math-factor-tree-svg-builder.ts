/**
 * @file math-factor-tree-svg-builder.ts
 * @description مصيّر شجرة العوامل الأولية (Factor Tree) لعدد واحد أو عددين أو ثلاثة أعداد مع حساب ع.م.أ و م.م.أ.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 260 سطراً).
 */

import {
  formatNumeralsByModeSSOT,
  type NumeralDisplayMode,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_MATH_FACTOR_TREE_SVG_BUILDER =
  "math_factor_tree_svg_builder" as const;

export interface MathFactorTreeOptions {
  readonly numbers: readonly number[];
  readonly width?: number;
  readonly height?: number;
  readonly numeralMode?: NumeralDisplayMode;
  readonly showSummary?: boolean;
  readonly title?: string;
}

interface FactorTreeNode {
  readonly value: number;
  readonly isPrime: boolean;
  left?: FactorTreeNode;
  right?: FactorTreeNode;
  x?: number;
  y?: number;
}

function isPrimeNumber(n: number): boolean {
  if (n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

function getSmallestPrimeFactor(n: number): number {
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return i;
  }
  return n;
}

export function getPrimeFactorsForTree(n: number): number[] {
  const factors: number[] = [];
  let d = 2;
  let temp = Math.abs(Math.round(n));
  if (temp <= 1) return [temp];
  while (temp >= 2) {
    if (temp % d === 0) {
      factors.push(d);
      temp /= d;
    } else {
      d += 1;
      if (d * d > temp && temp > 1) {
        factors.push(temp);
        break;
      }
    }
  }
  return factors;
}

function buildTreeNode(n: number): FactorTreeNode {
  const num = Math.abs(Math.round(n));
  if (num <= 1 || isPrimeNumber(num)) {
    return { value: num, isPrime: true };
  }
  const p = getSmallestPrimeFactor(num);
  return {
    value: num,
    isPrime: false,
    left: { value: p, isPrime: true },
    right: buildTreeNode(Math.round(num / p)),
  };
}

function calculateGcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function calculateLcm(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : Math.abs(Math.round((a * b) / calculateGcd(a, b)));
}

function getTreeDepth(node: FactorTreeNode): number {
  if (!node.left || !node.right) return 1;
  return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
}

function layoutTree(node: FactorTreeNode, depth: number, minX: number, maxX: number, yStep: number, startY: number): void {
  node.y = startY + depth * yStep;
  node.x = (minX + maxX) / 2;
  if (node.left && node.right) {
    const mid = (minX + maxX) / 2;
    layoutTree(node.left, depth + 1, minX, mid, yStep, startY);
    layoutTree(node.right, depth + 1, mid, maxX, yStep, startY);
  }
}

function renderNodes(node: FactorTreeNode, numeralMode: NumeralDisplayMode, lines: string[], shapes: string[], r: number): void {
  const nx = node.x ?? 0;
  const ny = node.y ?? 0;
  const valStr = formatNumeralsByModeSSOT(node.value, numeralMode);
  const fontSize = r <= 12 ? 10 : 12;

  if (node.left?.x !== undefined && node.left?.y !== undefined) {
    lines.push(`<line x1="${nx}" y1="${ny + r - 1}" x2="${node.left.x}" y2="${node.left.y - r + 1}" stroke="#64748b" stroke-width="1.8" stroke-linecap="round"/>`);
    renderNodes(node.left, numeralMode, lines, shapes, r);
  }
  if (node.right?.x !== undefined && node.right?.y !== undefined) {
    lines.push(`<line x1="${nx}" y1="${ny + r - 1}" x2="${node.right.x}" y2="${node.right.y - r + 1}" stroke="#64748b" stroke-width="1.8" stroke-linecap="round"/>`);
    renderNodes(node.right, numeralMode, lines, shapes, r);
  }

  if (node.isPrime) {
    shapes.push(`<circle cx="${nx}" cy="${ny}" r="${r}" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/><text x="${nx}" y="${ny + Math.round(fontSize / 3)}" font-family="Cairo, Arial, sans-serif" font-size="${fontSize}" font-weight="900" fill="#047857" text-anchor="middle">${valStr}</text>`);
  } else {
    const rw = Math.round(r * 2.4);
    const rh = Math.round(r * 1.7);
    shapes.push(`<rect x="${nx - Math.round(rw / 2)}" y="${ny - Math.round(rh / 2)}" width="${rw}" height="${rh}" rx="6" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.8"/><text x="${nx}" y="${ny + Math.round(fontSize / 3)}" font-family="Cairo, Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#1d4ed8" text-anchor="middle">${valStr}</text>`);
  }
}

export function renderMathFactorTreeSVG(options: MathFactorTreeOptions): string {
  const nums = options.numbers.filter((n) => Number.isFinite(n) && n > 1);
  const effectiveNums = nums.length > 0 ? nums.slice(0, 3) : [12];
  const isTriple = effectiveNums.length === 3;
  const isDual = effectiveNums.length === 2;
  const numeralMode = options.numeralMode ?? "western";
  const showSummary = options.showSummary !== false;

  const width = options.width ?? (isTriple ? 500 : isDual ? 380 : 220);
  const height = options.height ?? (isTriple ? 260 : isDual ? 250 : 220);
  const paddingTop = options.title ? 38 : 24;
  const paddingBottom = showSummary ? 48 : 20;
  const treeHeight = height - paddingTop - paddingBottom;

  const trees = effectiveNums.map(buildTreeNode);
  const maxDepth = Math.max(...trees.map(getTreeDepth));
  const yStep = Math.min(46, Math.max(26, treeHeight / Math.max(maxDepth, 3)));
  const r = isTriple ? 12 : maxDepth >= 4 ? 13 : 15;

  const extras: string[] = [];
  if (options.title) {
    extras.push(`<text x="${width / 2}" y="18" font-family="Cairo, Arial, sans-serif" font-size="12" font-weight="bold" fill="#1e293b" text-anchor="middle">${options.title}</text>`);
  }

  const lines: string[] = [];
  const shapes: string[] = [];
  const fmt = (v: number) => formatNumeralsByModeSSOT(v, numeralMode);

  if (isTriple) {
    const colW = width / 3;
    layoutTree(trees[0], 0, 2 * colW + 8, width - 12, yStep, paddingTop + 10);
    layoutTree(trees[1], 0, colW + 8, 2 * colW - 8, yStep, paddingTop + 10);
    layoutTree(trees[2], 0, 12, colW - 8, yStep, paddingTop + 10);
    trees.forEach((t) => renderNodes(t, numeralMode, lines, shapes, r));
    extras.push(
      `<line x1="${Math.round(2 * colW)}" y1="${paddingTop}" x2="${Math.round(2 * colW)}" y2="${height - paddingBottom + 5}" stroke="#e2e8f0" stroke-width="1.2" stroke-dasharray="3,3"/>`,
      `<line x1="${Math.round(colW)}" y1="${paddingTop}" x2="${Math.round(colW)}" y2="${height - paddingBottom + 5}" stroke="#e2e8f0" stroke-width="1.2" stroke-dasharray="3,3"/>`
    );
    if (showSummary) {
      const gcd = calculateGcd(calculateGcd(effectiveNums[0], effectiveNums[1]), effectiveNums[2]);
      const lcm = calculateLcm(calculateLcm(effectiveNums[0], effectiveNums[1]), effectiveNums[2]);
      extras.push(`<text x="${width / 2}" y="${height - 10}" font-family="Cairo, Arial, sans-serif" font-size="11" font-weight="900" fill="#0f172a" text-anchor="middle">ع.م.أ = ${fmt(gcd)}  |  م.م.أ = ${fmt(lcm)}</text>`);
    }
  } else if (isDual) {
    layoutTree(trees[0], 0, width / 2 + 10, width - 15, yStep, paddingTop + 10);
    layoutTree(trees[1], 0, 15, width / 2 - 10, yStep, paddingTop + 10);
    trees.forEach((t) => renderNodes(t, numeralMode, lines, shapes, r));
    extras.push(`<line x1="${width / 2}" y1="${paddingTop}" x2="${width / 2}" y2="${height - paddingBottom + 5}" stroke="#e2e8f0" stroke-width="1.2" stroke-dasharray="3,3"/>`);
    if (showSummary) {
      const f1 = getPrimeFactorsForTree(effectiveNums[0]).map(fmt).join(" × ");
      const f2 = getPrimeFactorsForTree(effectiveNums[1]).map(fmt).join(" × ");
      const gcd = calculateGcd(effectiveNums[0], effectiveNums[1]);
      const lcm = calculateLcm(effectiveNums[0], effectiveNums[1]);
      extras.push(
        `<text x="${width * 0.75}" y="${height - 24}" font-family="Cairo, Arial, sans-serif" font-size="11" font-weight="bold" fill="#334155" text-anchor="middle">${fmt(effectiveNums[0])} = ${f1}</text>`,
        `<text x="${width * 0.25}" y="${height - 24}" font-family="Cairo, Arial, sans-serif" font-size="11" font-weight="bold" fill="#334155" text-anchor="middle">${fmt(effectiveNums[1])} = ${f2}</text>`,
        `<text x="${width / 2}" y="${height - 8}" font-family="Cairo, Arial, sans-serif" font-size="11" font-weight="900" fill="#0f172a" text-anchor="middle">ع.م.أ = ${fmt(gcd)}  |  م.م.أ = ${fmt(lcm)}</text>`
      );
    }
  } else {
    layoutTree(trees[0], 0, 20, width - 20, yStep, paddingTop + 10);
    renderNodes(trees[0], numeralMode, lines, shapes, r);
    if (showSummary) {
      const f = getPrimeFactorsForTree(effectiveNums[0]).map(fmt).join(" × ");
      extras.push(`<text x="${width / 2}" y="${height - 12}" font-family="Cairo, Arial, sans-serif" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">${fmt(effectiveNums[0])} = ${f}</text>`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none" style="background:#ffffff">${extras.join("")}<g>${lines.join("")}</g><g>${shapes.join("")}</g></svg>`;
}
