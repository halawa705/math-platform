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

  // 2. استخراج الأطوال الحقيقية (بالمتر عادة) من النص أو الخريطة
  let personH = "1.8 م";
  let shadowL = "2.4 م";
  let distBase = "2 م";
  let postH = "؟";

  // فحص النص للأطوال الحياتية
  const personMatch = problemText.match(/(?:رجل|شخص|طالب|عمود|سارية|شجرة)[^0-9\n]{0,25}طول[هـا]?\s*([0-9]+(?:\.[0-9]+)?)\s*م?/i);
  if (personMatch) personH = `${personMatch[1]} م`;

  const shadowMatch = problemText.match(/ظل(?:ه|ها)?[^0-9\n]{0,20}([0-9]+(?:\.[0-9]+)?)\s*م?/i);
  if (shadowMatch) shadowL = `${shadowMatch[1]} م`;

  const distMatch = problemText.match(/(?:المسافة|يبعد)[^0-9\n]{0,35}([0-9]+(?:\.[0-9]+)?)\s*م?/i);
  if (distMatch) distBase = `${distMatch[1]} م`;

  // التحقق من المعطيات من givenLengths إذا توفرت
  for (const [k, v] of givenLengths.entries()) {
    const val = v.text || (v.numeric ? `${v.numeric} م` : "");
    if (!val) continue;
    if (k.includes(pHead) && k.includes(pFoot)) personH = val;
    else if (k.includes(tip) && k.includes(pFoot)) shadowL = val;
    else if (k.includes(pFoot) && k.includes(bFoot)) distBase = val;
    else if (k.includes(bTop) && k.includes(bFoot)) postH = val;
  }

  // 3. حساب الإحداثيات الهندسية الحتمية المتوازية
  // C = طرف الظل على الأرض
  // D = قاعدة الرجل، E = رأس الرجل
  // B = قاعدة العمود، A = قمة العمود
  const groundY = 175;
  const cX = 35;
  const dX = 135;
  const bX = 250;

  // زاوية شعاع الضوء
  const shadowSpan = dX - cX; // 100
  const personSpanY = 65;
  const eY = groundY - personSpanY; // 110

  // امتداد الخط المستقيم من C(35, 175) عبر E(135, 110) إلى B(250)
  const slope = -personSpanY / shadowSpan; // -0.65
  const aY = groundY + slope * (bX - cX); // 175 - 0.65 * 215 = 35.25

  const keyId = (v: string) => `${figureId}_v_${v}`;

  const vertexList: CanonicalVertexNode[] = [
    { id: keyId(tip), label: toDisplayLabel(tip, notationLanguage), position: { x: cX, y: groundY } },
    { id: keyId(pFoot), label: toDisplayLabel(pFoot, notationLanguage), position: { x: dX, y: groundY } },
    { id: keyId(bFoot), label: toDisplayLabel(bFoot, notationLanguage), position: { x: bX, y: groundY } },
    { id: keyId(pHead), label: toDisplayLabel(pHead, notationLanguage), position: { x: dX, y: eY } },
    { id: keyId(bTop), label: toDisplayLabel(bTop, notationLanguage), position: { x: bX, y: Math.round(aY) } },
  ];

  // 4. الأضلاع والقطع المستقيمة
  const segments: CanonicalSegmentNode[] = [
    // خط الأرض: C -> D (الظل)
    {
      id: `${figureId}_s_ground_shadow`,
      fromVertexId: keyId(tip),
      toVertexId: keyId(pFoot),
      lengthLabel: { value: shadowL, unit: "" },
    },
    // خط الأرض: D -> B (المسافة بين الرجل وقاعدة العمود)
    {
      id: `${figureId}_s_ground_dist`,
      fromVertexId: keyId(pFoot),
      toVertexId: keyId(bFoot),
      lengthLabel: { value: distBase, unit: "" },
    },
    // الرجل: D -> E (رأسي قائم)
    {
      id: `${figureId}_s_person`,
      fromVertexId: keyId(pFoot),
      toVertexId: keyId(pHead),
      lengthLabel: { value: personH, unit: "" },
    },
    // العمود: B -> A (رأسي قائم)
    {
      id: `${figureId}_s_post`,
      fromVertexId: keyId(bFoot),
      toVertexId: keyId(bTop),
      lengthLabel: { value: postH, unit: "" },
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
