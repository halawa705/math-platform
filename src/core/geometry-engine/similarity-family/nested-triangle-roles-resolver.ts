/**
 * @file nested-triangle-roles-resolver.ts
 * @description محلل حتمي لأدوار الرؤوس في المثلثات المتداخلة (طاليس والقاطع العكسي):
 * يضمن أن قاعدة المثلث الحاوي الأساسي تظل دائماً في الأسفل والقاطع داخلياً يقطع الضلعين دون انقلاب.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

export const MODULE_ID_NESTED_TRIANGLE_ROLES_RESOLVER =
  "nested_triangle_roles_resolver" as const;

export interface NestedTriangleRoles {
  readonly apex: string;
  readonly base1: string;
  readonly base2: string;
  readonly cut1: string;
  readonly cut2: string;
}

export function resolveNestedThalesAntiparallelRoles(
  t1: readonly [string, string, string],
  t2: readonly [string, string, string],
  commonApex: string,
  cleanText: string
): NestedTriangleRoles {
  const p1 = t1.filter((v) => v !== commonApex);
  const p2 = t2.filter((v) => v !== commonApex);

  let basePair = p1;
  let cutPair = p2;

  const isP2Base =
    (p2.includes("B") || p2.includes("C")) && (!p1.includes("B") || !p1.includes("C"));
  const isP1Base =
    (p1.includes("B") || p1.includes("C")) && (!p2.includes("B") || !p2.includes("C"));

  if (isP2Base) {
    basePair = p2;
    cutPair = p1;
  } else if (isP1Base) {
    basePair = p1;
    cutPair = p2;
  } else {
    const p1Str = p1.join("");
    const p2Str = p2.join("");
    if (new RegExp(`${p1Str}\\s*(?://|يوازي)\\s*${p2Str}`, "i").test(cleanText)) {
      cutPair = p1;
      basePair = p2;
    } else if (new RegExp(`${p2Str}\\s*(?://|يوازي)\\s*${p1Str}`, "i").test(cleanText)) {
      cutPair = p2;
      basePair = p1;
    }
  }

  let b1 = basePair[0] || "B";
  let b2 = basePair[1] || "C";
  if (b1 === "C" && b2 === "B") {
    b1 = "B";
    b2 = "C";
  }

  let c1 = cutPair[0] || "D";
  let c2 = cutPair[1] || "E";

  if (
    new RegExp(
      `${c2}\\s*(?:∈|ينتمي|على)\\s*(?:${commonApex}${b1}|${b1}${commonApex})`,
      "i"
    ).test(cleanText)
  ) {
    const tmp = c1;
    c1 = c2;
    c2 = tmp;
  } else if (c1 === "E" && c2 === "D" && b1 === "B" && b2 === "C") {
    c1 = "D";
    c2 = "E";
  }

  return { apex: commonApex, base1: b1, base2: b2, cut1: c1, cut2: c2 };
}
