/**
 * @file prep-grade1-parallel-transversal-spec-parser.ts
 * @description يستخرج من وصف مسألة (مستقيمان متوازيان + قاطع) مواصفة بارامترية: أسماء المستقيمين المتوازيين، نقطتي تقاطع القاطع،
 * والزوايا المعطاة (عددية أو جبرية خطية) والمطلوبة، ونوع العلاقة (تبادل/تناظر/تداخل) وما إذا كان التوازي مطلوب إثباته.
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
  readonly intersections?: readonly [string, string];
  readonly isProofGoal: boolean;
  readonly relationHint?: "alternate" | "corresponding" | "consecutive_interior";
  readonly angles: readonly ParallelAngleSpec[];
}

const PAR = "(?:\\/\\/|\\\\parallel|\\|\\||∥|⫽)";

/** يحلل تعبيراً خطياً مثل (9x - 5) أو (4x) أو 5x+15 أو 70. */
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
  const given = /∠\s*([A-Z])\s*([A-Z])\s*([A-Z])\s*\)?\s*=\s*([^،,;؛\n]+?)\s*(?:°|\\circ|(?=[،,;؛]|\s+و|\s+فأوجد|\s+أوجد|\s+بالتبادل|\s+بالتناظر|$))/g;
  for (const m of d.matchAll(given)) {
    const cleanExpr = m[4].replace(/\s*(?:بالتبادل|بالتناظر|بالتداخل|داخلياً|خارجياً).*$/i, "").trim();
    const expr = parseParallelLinearExpression(cleanExpr);
    if (!expr) continue;
    const rawTrim = cleanExpr.replace(/[°()]/g, "").trim();
    const label = expr.a === 0 ? `${expr.b}°` : `(${rawTrim})°`;
    out.push({ arm1: m[1], vertex: m[2], arm2: m[3], label, expr, asked: false });
  }
  const seen = new Set(out.map((x) => x.arm1 + x.vertex + x.arm2));
  for (const m of d.matchAll(/∠\s*([A-Z])\s*([A-Z])\s*([A-Z])(?!\s*\)?\s*=)/g)) {
    const key = m[1] + m[2] + m[3];
    const rev = m[3] + m[2] + m[1];
    if (!seen.has(key) && !seen.has(rev)) {
      seen.add(key);
      out.push({ arm1: m[1], vertex: m[2], arm2: m[3], label: "؟", asked: true });
    }
  }
  return out;
}

function extractIntersections(d: string, top: string, bottom: string): readonly [string, string] | undefined {
  const m1 = d.match(/في\s+(?:النقطتين\s+)?([A-Z])\s*(?:و|[،,])\s*([A-Z])(?![A-Z])/);
  if (m1) return [m1[1], m1[2]];
  const m2 = d.match(new RegExp(`${top}\\s+في\\s+([A-Z]).*?${bottom}\\s+في\\s+([A-Z])`));
  if (m2) return [m2[1], m2[2]];
  return undefined;
}

export function extractParallelTransversalSpec(d: string): ParallelTransversalSpec | undefined {
  // استبعاد مسائل الثلاثة مستقيمات المتوازية، أو زوجين من المتوازيات، أو المنصفات، أو الزوايا المنكسرة
  if (/ينصف|منكسرة|المنعكسة|نقطة\s*بينهما|تقع\s*بين/i.test(d)) return undefined;
  const parMatches = [...d.matchAll(new RegExp(`([A-Z]{2})\\s*${PAR}\\s*([A-Z]{2})`, "g"))];
  const distinctPairs = new Set(parMatches.map((m) => `${m[1]}//${m[2]}`));
  if (distinctPairs.size !== 1) return undefined;
  const pm = parMatches[0];
  const angles = extractAngles(d);
  if (angles.filter((x) => !x.asked).length === 0) return undefined;
  // إذا وُجد رأس مثل E لا ينتمي للمستقيمين ولا للقاطع ويظهر كرأس زاوية بينهما (مثل AEC مع BAE و ECD) فهي زاوية منكسرة
  const tm = d.match(/(?:المستقيم|القاطع|قاطع|الخط|القطعة)\s*([A-Z]{2})(?![A-Z])|([A-Z]{2})\s*(?:قاطع|قاطعة|يقطع|قاطعاً|قاطعا)/);
  const tn = tm ? (tm[1] ?? tm[2]) : undefined;
  const isProofGoal = new RegExp(`(?:أثبت|اثبت|إثبات|اثبات|برهن)\\s*(?:بالبرهان\\s*)?أن\\s*(?:الشعاع\\s*|المستقيم\\s*)?${pm[1]}\\s*${PAR}\\s*${pm[2]}`, "i").test(d);
  const relationHint = /داخليتان|متداخلتان|جهة\s*واحدة|تداخل/i.test(d)
    ? "consecutive_interior"
    : /تناظر|متناظرتان/i.test(d)
      ? "corresponding"
      : /تبادل|متبادلتان/i.test(d)
        ? "alternate"
        : undefined;
  return {
    top: [pm[1][0], pm[1][1]],
    bottom: [pm[2][0], pm[2][1]],
    transversal: tn && tn !== pm[1] && tn !== pm[2] ? [tn[0], tn[1]] : undefined,
    intersections: extractIntersections(d, pm[1], pm[2]),
    isProofGoal,
    relationHint,
    angles,
  };
}
