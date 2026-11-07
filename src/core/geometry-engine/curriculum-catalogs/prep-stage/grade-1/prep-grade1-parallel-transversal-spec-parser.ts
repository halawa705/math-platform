/**
 * @file prep-grade1-parallel-transversal-spec-parser.ts
 * @description يستخرج من وصف مسألة (مستقيمان متوازيان + قاطع) مواصفة بارامترية: أسماء المستقيمين المتوازيين، نقطتي تقاطع القاطع،
 * والزوايا المعطاة (عددية أو جبرية خطية) ويحل المجهول لتحديد ميل القاطع.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

export interface ParallelLinearExpr { readonly a: number; readonly b: number; readonly v: string }

export interface ParallelAngleSpec {
  readonly arm1: string;
  readonly vertex: string;
  readonly arm2: string;
  readonly label: string;
  readonly expr?: ParallelLinearExpr;
  readonly asked: boolean;
}

export interface ParallelTransversalSpec {
  readonly top: readonly [string, string];
  readonly bottom: readonly [string, string];
  readonly transversal?: readonly [string, string];
  readonly angles: readonly ParallelAngleSpec[];
}

const PAR = "(?:\\/\\/|\\\\parallel|\\|\\||∥|⫽)";

/** يحلل تعبيراً خطياً مثل (9x - 5) أو 5x+15 أو 70. */
export function parseParallelLinearExpression(raw: string): ParallelLinearExpr | undefined {
  const s = raw.replace(/[°()\s]/g, "").replace(/\\circ|\^/g, "").replace(/-/g, "+-");
  if (!s) return undefined;
  let a = 0; let b = 0; let v = "x";
  for (const term of s.split("+").filter(Boolean)) {
    const m = term.match(/^(-?\d*\.?\d*)\*?([xyXY])?$/);
    if (!m) return undefined;
    if (m[2]) { v = m[2].toLowerCase(); a += m[1] === "" ? 1 : m[1] === "-" ? -1 : Number(m[1]); }
    else if (m[1] !== "" && m[1] !== "-") b += Number(m[1]);
    else return undefined;
  }
  return { a, b, v };
}

function extractAngles(d: string): ParallelAngleSpec[] {
  const out: ParallelAngleSpec[] = [];
  const given = /∠\s*([A-Z])\s*([A-Z])\s*([A-Z])\s*\)?\s*=\s*([^،,;؛\n]+?)\s*(?:°|\\circ|(?=[،,;؛]|\s+و|\s+فأوجد|\s+أوجد|$))/g;
  for (const m of d.matchAll(given)) {
    const expr = parseParallelLinearExpression(m[4]);
    if (!expr) continue;
    out.push({ arm1: m[1], vertex: m[2], arm2: m[3], label: expr.a === 0 ? `${expr.b}°` : `(${m[4].replace(/[°()]/g, "").trim()})°`, expr, asked: false });
  }
  const seen = new Set(out.map((x) => x.arm1 + x.vertex + x.arm2));
  const askedRe = /(?:أوجد|احسب|فأوجد|أثبت)[^.؟?]*?∠\s*([A-Z])\s*([A-Z])\s*([A-Z])/g;
  for (const m of d.matchAll(askedRe)) {
    const key = m[1] + m[2] + m[3];
    if (!seen.has(key)) { seen.add(key); out.push({ arm1: m[1], vertex: m[2], arm2: m[3], label: "؟", asked: true }); }
  }
  return out;
}

export function extractParallelTransversalSpec(d: string): ParallelTransversalSpec | undefined {
  const pm = d.match(new RegExp(`([A-Z]{2})\\s*${PAR}\\s*([A-Z]{2})`));
  if (!pm) return undefined;
  const angles = extractAngles(d);
  if (angles.filter((x) => !x.asked).length === 0) return undefined;
  const tm = d.match(/(?:المستقيم|القاطع|قاطع|الخط)\s*([A-Z]{2})(?![A-Z])|([A-Z]{2})\s*(?:قاطع|يقطع|قاطعاً|قاطعا)/);
  const tn = tm ? (tm[1] ?? tm[2]) : undefined;
  return {
    top: [pm[1][0], pm[1][1]], bottom: [pm[2][0], pm[2][1]],
    transversal: tn && tn !== pm[1] && tn !== pm[2] ? [tn[0], tn[1]] : undefined,
    angles,
  };
}
