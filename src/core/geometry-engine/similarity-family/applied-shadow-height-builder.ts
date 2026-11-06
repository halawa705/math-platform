/**
 * @file applied-shadow-height-builder.ts
 * @description مركّب بارامتري لمسائل الظل والارتفاع الحياتية (عمود إنارة، شجرة، سارية علم، رجل وظله).
 * ينشئ مثلثين قائمين متشابهين على خط أرضي مشترك أو متجاورين مع زاوية ميل أشعة الشمس والارتفاعات الحقيقية.
 */

import type {
  CanonicalAngleNode,
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "@/core/ssot/geometry-archetype-ssot";
import { toDisplayLabel } from "../fact-compositor/geo-label-utils";

export interface AppliedShadowHeightInput {
  readonly figureId: string;
  readonly notationLanguage?: "english" | "arabic";
  readonly problemText?: string;
  readonly vertices?: {
    readonly shadowTip?: string;
    readonly personFoot?: string;
    readonly postFoot?: string;
    readonly personHead?: string;
    readonly postTop?: string;
  };
  readonly givenLengths?: ReadonlyMap<string, { readonly text: string; readonly numeric?: number }>;
}

export function buildAppliedShadowHeightFigure(
  input: AppliedShadowHeightInput
): CanonicalGeometryFigureIR {
  const {
    figureId,
    notationLanguage = "english",
    problemText = "",
    vertices = {},
    givenLengths = new Map(),
  } = input;

  // 1. تحديد أسماء الرؤوس
  const tip = vertices.shadowTip || "C";
  const pFoot = vertices.personFoot || "D";
  const bFoot = vertices.postFoot || "B";
  const pHead = vertices.personHead || "E";
  const bTop = vertices.postTop || "A";

  // 2. استخراج الأطوال الحقيقية (بالمتر عادة) من النص أو الخريطة دون اختلاق أرقام غير واردة
  let personHVal: string | undefined;
  let shadowLVal: string | undefined;
  let distBaseVal: string | undefined;
  let postHVal = "؟";

  const personMatch = problemText.match(/(?:رجل|شخص|طالب|فتاة|ولد)[^0-9\n]{0,25}طول[هـا]?\s*([0-9]+(?:\.[0-9]+)?)\s*م?/i);
  if (personMatch) personHVal = personMatch[1];

  const shadowMatch = problemText.match(/ظل(?:ه|ها)?[^0-9\n]{0,20}([0-9]+(?:\.[0-9]+)?)\s*م?/i);
  if (shadowMatch) shadowLVal = shadowMatch[1];

  const distMatch = problemText.match(/(?:المسافة|يبعد|على\s*بعد)[^0-9\n]{0,35}([0-9]+(?:\.[0-9]+)?)\s*م?/i);
  if (distMatch) distBaseVal = distMatch[1];

  // التحقق من المعطيات من givenLengths إذا توفرت
  for (const [k, v] of givenLengths.entries()) {
    const rawNum = v.numeric !== undefined ? String(v.numeric) : v.text.replace(/\s*م$/, "").trim();
    if (!rawNum) continue;
    if (k.includes(pHead) && k.includes(pFoot)) personHVal = rawNum;
    else if (k.includes(tip) && k.includes(pFoot)) shadowLVal = rawNum;
    else if (k.includes(pFoot) && k.includes(bFoot)) distBaseVal = rawNum;
    else if (k.includes(bTop) && k.includes(bFoot)) postHVal = rawNum;
  }

  // 3. حساب الإحداثيات الهندسية الحتمية المتناسبة مع الأبعاد المعطاة
  const pNum = personHVal ? parseFloat(personHVal) || 1.8 : 1.8;
  const sNum = shadowLVal ? parseFloat(shadowLVal) || 2.4 : 2.4;
  const dNum = distBaseVal ? parseFloat(distBaseVal) || 2.4 : sNum * 1.1;
  const totalGround = sNum + dNum;
  const scale = 7.5 / Math.max(totalGround, 1);

  const groundY = 1.0;
  const cX = 1.0;
  const dX = Number((cX + sNum * scale).toFixed(2));
  const bX = Number((dX + dNum * scale).toFixed(2));

  const eY = Number((groundY + pNum * scale).toFixed(2));
  const slope = (eY - groundY) / Math.max(dX - cX, 0.5);
  const aY = Number((groundY + slope * (bX - cX)).toFixed(2));

  const keyId = (v: string) => `${figureId}_v_${v}`;

  const vertexList: CanonicalVertexNode[] = [
    { id: keyId(tip), label: toDisplayLabel(tip, notationLanguage), position: { x: cX, y: groundY } },
    { id: keyId(pFoot), label: toDisplayLabel(pFoot, notationLanguage), position: { x: dX, y: groundY } },
    { id: keyId(bFoot), label: toDisplayLabel(bFoot, notationLanguage), position: { x: bX, y: groundY } },
    { id: keyId(pHead), label: toDisplayLabel(pHead, notationLanguage), position: { x: dX, y: eY } },
    { id: keyId(bTop), label: toDisplayLabel(bTop, notationLanguage), position: { x: bX, y: aY } },
  ];

  // 4. الأضلاع والقطع المستقيمة (تُكتب الأبعاد المعطاة فقط)
  const segments: CanonicalSegmentNode[] = [
    // خط الأرض: C -> D (الظل)
    {
      id: `${figureId}_s_ground_shadow`,
      fromVertexId: keyId(tip),
      toVertexId: keyId(pFoot),
      lengthLabel: shadowLVal ? { value: shadowLVal, unit: "م" } : undefined,
    },
    // خط الأرض: D -> B (المسافة بين الرجل وقاعدة العمود)
    {
      id: `${figureId}_s_ground_dist`,
      fromVertexId: keyId(pFoot),
      toVertexId: keyId(bFoot),
      lengthLabel: distBaseVal ? { value: distBaseVal, unit: "م" } : undefined,
    },
    // الرجل: D -> E (رأسي قائم)
    {
      id: `${figureId}_s_person`,
      fromVertexId: keyId(pFoot),
      toVertexId: keyId(pHead),
      lengthLabel: personHVal ? { value: personHVal, unit: "م" } : undefined,
    },
    // العمود: B -> A (رأسي قائم)
    {
      id: `${figureId}_s_post`,
      fromVertexId: keyId(bFoot),
      toVertexId: keyId(bTop),
      lengthLabel: { value: postHVal, unit: postHVal === "؟" ? "" : "م" },
    },
    // شعاع الضوء والوتر: C -> E
    {
      id: `${figureId}_s_ray_lower`,
      fromVertexId: keyId(tip),
      toVertexId: keyId(pHead),
      strokeStyle: "dashed",
    },
    // شعاع الضوء والوتر: E -> A
    {
      id: `${figureId}_s_ray_upper`,
      fromVertexId: keyId(pHead),
      toVertexId: keyId(bTop),
      strokeStyle: "dashed",
    },
  ];

  // 5. الزوايا القائمة على الأرض
  const angles: CanonicalAngleNode[] = [
    // زاوية قائمة عند قاعدة الرجل D
    {
      id: `${figureId}_ang_right_d`,
      vertexId: keyId(pFoot),
      arm1VertexId: keyId(tip),
      arm2VertexId: keyId(pHead),
      isRightAngle: true,
      degrees: 90,
    },
    // زاوية قائمة عند قاعدة العمود B
    {
      id: `${figureId}_ang_right_b`,
      vertexId: keyId(bFoot),
      arm1VertexId: keyId(pFoot),
      arm2VertexId: keyId(bTop),
      isRightAngle: true,
      degrees: 90,
    },
    // زاوية ميل الشمس عند C (مشتركة)
    {
      id: `${figureId}_ang_sun_c`,
      vertexId: keyId(tip),
      arm1VertexId: keyId(pFoot),
      arm2VertexId: keyId(pHead),
      arcCount: 1,
    },
  ];

  return {
    figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "تطبيق حياتي: الظل والارتفاع وتشابه المثلثين القائمين",
    notationLanguage,
    vertices: vertexList,
    segments,
    angles,
    polygons: [
      [keyId(tip), keyId(pFoot), keyId(pHead)],
      [keyId(tip), keyId(bFoot), keyId(bTop)],
    ],
  };
}
