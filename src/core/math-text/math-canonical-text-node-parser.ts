/**
 * @file math-canonical-text-node-parser.ts
 * @description يحوّل النص القانوني إلى عقد عرض صريحة (نص / رياضيات / كمية بوحدة / سطر جديد) دون أي regex تطبيعي.
 * الكمية = كتلة رياضية يتبعها NBSP + وحدة، فتُرسم كوحدة واحدة غير قابلة للكسر.
 */

import { NON_BREAKING_SPACE } from "./math-unit-quantity-binder";
import { splitDollarSegments } from "./math-dollar-segment-utils";

export const MODULE_ID_MATH_CANONICAL_TEXT_NODE_PARSER =
  "math_canonical_text_node_parser" as const;

export type MathRenderNode =
  | { readonly kind: "text"; readonly value: string }
  | { readonly kind: "math"; readonly latex: string }
  | { readonly kind: "quantity"; readonly latex: string; readonly unit: string }
  | { readonly kind: "newline" };

const LEADING_UNIT = new RegExp(`^${NON_BREAKING_SPACE}([^\\s${NON_BREAKING_SPACE}]+)`);

export function parseCanonicalTextToNodes(canonical: string): MathRenderNode[] {
  const nodes: MathRenderNode[] = [];
  canonical.split("\n").forEach((line, lineIndex) => {
    if (lineIndex > 0) nodes.push({ kind: "newline" });
    const segs = splitDollarSegments(line);
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      if (i % 2 === 0) {
        if (seg) nodes.push({ kind: "text", value: seg });
        continue;
      }
      const latex = seg.slice(1, -1);
      const unitMatch = (segs[i + 1] ?? "").match(LEADING_UNIT);
      if (unitMatch) {
        nodes.push({ kind: "quantity", latex, unit: unitMatch[1] });
        segs[i + 1] = segs[i + 1].slice(unitMatch[0].length);
      } else {
        nodes.push({ kind: "math", latex });
      }
    }
  });
  return nodes;
}
