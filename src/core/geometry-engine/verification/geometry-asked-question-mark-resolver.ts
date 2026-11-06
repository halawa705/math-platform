/**
 * @file geometry-asked-question-mark-resolver.ts
 * @description محلل المطلوب الهندسي ومطبّق قواعد علامة الاستفهام «؟» (المرحلة 2 - IR v2):
 * يستخرج المطلوب (`asked`) من نص المسألة أو وسم الرسم:
 * - «أوجد طول س ص»: يضع «؟» على الضلع س ص (إلا إذا كان الضلع يحمل بالفعل المتغير الجبري المطلوب مثل `x`).
 * - «احسب ق(∠ب)» أو «ق(∠أ ب جـ)»: يضع «؟» داخل قوس الزاوية.
 * - «احسب مساحة ...»: يضع شارة داخلية `المساحة = ؟` داخل منطقة الشكل.
 * - «أوجد النسبة بين ...»: يعلّم القطعتين أو يصنف المطلوب كنسبة (`ratio`).
 * - «أثبت أن / برهن أن»: يصنف المطلوب كبرهان (`proof`) ولا يضيف «؟» إطلاقاً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 240 سطراً).
 */

import type {
  CanonicalAngleNode,
  CanonicalGeometryFigureIR,
  CanonicalInteriorBadgeNode,
  CanonicalSegmentNode,
  GeometryAskedTargetSpec,
} from "../../ssot/geometry-archetype-ssot";
import { convertGeometryLatexToPlainText } from "../description-intake/geometry-latex-to-plain-normalizer";
import { normalizeLabelKey, pairKey, parseLabelList } from "../fact-compositor/geo-label-utils";
import { extractAskedClauseFromTagContent } from "../../ssot/figure-tag-grammar-ssot";

export const MODULE_ID_GEOMETRY_ASKED_QUESTION_MARK_RESOLVER =
  "geometry_asked_question_mark_resolver" as const;

const PROOF_PATTERNS = /(?:أثبت|اثبت|برهن|بين\s*أن|هل\b|اذكر\s*شروط|علل)/i;

/**
 * يستخرج توصيف المطلوب الهندسي (`GeometryAskedTargetSpec`) من نص المسألة الكامل أو الوصف.
 */
export function extractGeometryAskedSpecFromPrompt(rawText: string): GeometryAskedTargetSpec | undefined {
  if (!rawText || !rawText.trim()) return undefined;
  // فحص مباشر لتعيين المجهول بعلامة استفهام داخل الوسم: ب جـ = ؟ أو BC = ؟
  const directQMatch = rawText.match(/([A-Za-z]{2}|[أ-ي]ـ?\s*[أ-ي]ـ?)\s*=\s*[؟?]/i);
  if (directQMatch) {
    const segLabels = parseLabelList(directQMatch[1]);
    if (segLabels && segLabels.length === 2) {
      return {
        kind: "length",
        targetKey: `${segLabels[0]}${segLabels[1]}`,
        rawAskedClause: directQMatch[0],
      };
    }
  }

  const tagAskedClause = extractAskedClauseFromTagContent(rawText);
  const withoutTags = rawText.replace(/\[\s*(?:رسم\s*(?:هندسي|توضيحي|بياني|إحصائي)?|نموذج\s*بصري)\s*:\s*[^\]]+\]/gi, " ");
  const clean = convertGeometryLatexToPlainText(withoutTags);

  // استخراج جملة المطلوب الأخيرة (أوجد / احسب / اثبت / ما قيمة / فإن ...)
  const askedClauseMatch = clean.match(
    /(?:أوجد|اوجد|احسب|لإيجاد|لايجاد|لحساب|أثبت|اثبت|برهن|ما\s*(?:هي|هو)?\s*(?:قيمة|طول|قياس|مساحة)|فإن)\s+([^؛;\n|]+)/i
  );
  const clause = tagAskedClause || (askedClauseMatch ? askedClauseMatch[0].trim() : "");

  if (PROOF_PATTERNS.test(clause || clean)) {
    return {
      kind: "proof",
      rawAskedClause: clause || clean,
    };
  }

  if (!clause) return undefined;

  // 1. فحص المساحة المطلوبة
  if (/مساحة/i.test(clause)) {
    const polyM = clause.match(/مساحة\s*(?:ال)?(?:مثلث|مستطيل|مربع|معين|شبه\s*منحرف|متوازي\s*أضلاع|رباعي|شكل)?\s*([A-Za-z]{3,4}|(?:[أ-ي]ـ?\s*){3,4})?/i);
    const parsed = polyM?.[1] ? parseLabelList(polyM[1]) : null;
    return {
      kind: "area",
      targetKey: parsed ? parsed.join("") : undefined,
      rawAskedClause: clause,
    };
  }

  // 2. فحص النسبة المطلوبة
  if (/نسبة|معامل\s*التشابه/i.test(clause)) {
    return {
      kind: "ratio",
      rawAskedClause: clause,
    };
  }

  // 3. فحص إحداثيات نقطة مطلوبة
  if (/إحداثي|احداثي/i.test(clause)) {
    const ptM = clause.match(/(?:النقطة|منتصف)\s*([A-Za-z]|[أ-ي]ـ?)/i);
    return {
      kind: "coordinates",
      targetKey: ptM ? normalizeLabelKey(ptM[1]) : undefined,
      rawAskedClause: clause,
    };
  }

  // 4. فحص قياس الزاوية المطلوبة: ق(∠ABC) أو ق(∠B) أو قياس زاوية جـ
  const angMatch =
    clause.match(/ق\s*\(\s*∠?\s*([A-Za-z]{1,3}|(?:[أ-ي]ـ?\s*){1,3})\s*\)/i) ||
    clause.match(/(?:قياس\s*)?(?:ال)?زاوية\s*∠?\s*([A-Za-z]{1,3}|(?:[أ-ي]ـ?\s*){1,3})(?![A-Za-zء-ي])/i) ||
    clause.match(/∠\s*([A-Za-z]{1,3}|(?:[أ-ي]ـ?\s*){1,3})(?![A-Za-zء-ي])/i);
  if (angMatch) {
    const labels = parseLabelList(angMatch[1]);
    if (labels && (labels.length === 1 || labels.length === 3)) {
      return {
        kind: "angle",
        targetKey: labels.join(""),
        rawAskedClause: clause,
      };
    }
  }

  // 5. فحص متغير جبري مطلوب: أوجد قيمة س / قيمة x
  const varMatch = clause.match(/قيمة\s*(?:المجهول|الرمز|المتغير)?\s*([xXyYسصعa-dA-D])\b/i);
  if (varMatch && !/طول/.test(clause)) {
    return {
      kind: "length",
      variableSymbol: varMatch[1],
      rawAskedClause: clause,
    };
  }

  // 6. فحص طول ضلع أو قطعة مستقيمة مطلوبة: أوجد طول أ جـ / احسب طول BC / فإن DE = ...
  const lenMatch =
    clause.match(/(?:طول|البعد|المسافة)\s*(?:القطعة\s*|الضلع\s*|الوتر\s*)?([A-Za-z]{2}|[أ-ي]ـ?\s*[أ-ي]ـ?)(?![A-Za-zء-ي])/i) ||
    clause.match(/(?:أوجد|اوجد|احسب|فإن)\s+([A-Za-z]{2}|[أ-ي]ـ?\s*[أ-ي]ـ?)(?:\s*=|\s*$)/i);
  if (lenMatch) {
    const segLabels = parseLabelList(lenMatch[1]);
    if (segLabels && segLabels.length === 2) {
      return {
        kind: "length",
        targetKey: `${segLabels[0]}${segLabels[1]}`,
        rawAskedClause: clause,
      };
    }
  }

  return undefined;
}

function vertexKeyFromNodeId(vertexId: string, label: string): string {
  const fromId = vertexId.match(/_(?:v|center)_([A-Za-z0-9]+)$/)?.[1];
  if (fromId && /^[A-Za-z]$/.test(fromId)) return fromId.toUpperCase();
  const baseChar = label.match(/[A-Za-z]|[أإابجدهوزحخيكلمنفقرشطتثغسصع]/)?.[0];
  return baseChar ? normalizeLabelKey(baseChar) : "";
}

/**
 * يطبّق قواعد «؟» للمطلوب وتصنيف `labelKind` (`given` | `unknown` | `name`) على الشكل الهندسي:
 * - لا يضيف «؟» إذا كان الشكل يحتوي أصلاً على المتغير الجبري المطلوب (مثل `x` أو `س`) أو علامة «؟».
 * - في مسائل البرهان (`proof`) يكتفي بالمعطيات فقط دون أي «؟».
 */
export function applyAskedQuestionMarkToFigure(
  figure: CanonicalGeometryFigureIR,
  rawPromptOrDescription: string
): CanonicalGeometryFigureIR {
  if (figure.familyId === "statistics_family" || Boolean(figure.rawSvgMarkup)) {
    return figure;
  }

  const askedSpec = figure.askedSpec ?? extractGeometryAskedSpecFromPrompt(rawPromptOrDescription);
  const vKeyById = new Map<string, string>();
  for (const v of figure.vertices) {
    vKeyById.set(v.id, vertexKeyFromNodeId(v.id, v.label));
  }

  // وسم جميع الملصقات الحالية بنوعها الدلالي (given أو unknown إن كانت تحمل ؟)
  let segments: CanonicalSegmentNode[] = figure.segments.map((s) => {
    if (!s.lengthLabel) return s;
    const valStr = String(s.lengthLabel.value).trim();
    const isQ = valStr === "؟" || valStr === "?";
    return {
      ...s,
      lengthLabel: {
        ...s.lengthLabel,
        labelKind: s.lengthLabel.labelKind ?? (isQ ? "unknown" : "given"),
      },
    };
  });

  let angles: CanonicalAngleNode[] = figure.angles.map((a) => {
    const isQ = a.degreesLabel?.includes("؟") || a.degreesLabel?.includes("?");
    return {
      ...a,
      labelKind: a.labelKind ?? (isQ ? "unknown" : a.degreesLabel || a.degrees !== undefined ? "given" : undefined),
    };
  });

  let interiorBadges: CanonicalInteriorBadgeNode[] = (figure.interiorBadges ?? []).map((b) => ({
    ...b,
    labelKind: b.labelKind ?? (b.text.includes("؟") || b.text.includes("?") ? "unknown" : "given"),
  }));

  if (!askedSpec || askedSpec.kind === "proof") {
    return { ...figure, segments, angles, interiorBadges, askedSpec };
  }

  // إذا كان الشكل يحتوي بالفعل على علامة «؟» أو على المتغير الجبري المطلوب، لا نكرر «؟»
  const alreadyHasUnknown =
    segments.some((s) => s.lengthLabel?.labelKind === "unknown") ||
    angles.some((a) => a.labelKind === "unknown") ||
    interiorBadges.some((b) => b.labelKind === "unknown");

  if (alreadyHasUnknown) {
    return { ...figure, segments, angles, interiorBadges, askedSpec };
  }

  if (askedSpec.variableSymbol) {
    return { ...figure, segments, angles, interiorBadges, askedSpec };
  }

  // تطبيق «؟» على طول الضلع المطلوب
  if (askedSpec.kind === "length" && askedSpec.targetKey && askedSpec.targetKey.length === 2) {
    const targetPair = pairKey(askedSpec.targetKey[0], askedSpec.targetKey[1]);
    segments = segments.map((s) => {
      const k1 = vKeyById.get(s.fromVertexId) ?? "";
      const k2 = vKeyById.get(s.toVertexId) ?? "";
      if (pairKey(k1, k2) === targetPair && !s.lengthLabel) {
        return {
          ...s,
          lengthLabel: {
            value: "؟",
            labelKind: "unknown",
          },
        };
      }
      return s;
    });
  }

  // تطبيق «؟» داخل قوس الزاوية المطلوبة
  if (askedSpec.kind === "angle" && askedSpec.targetKey) {
    const t = askedSpec.targetKey;
    const targetVertexKey = t.length === 3 ? t[1] : t[0];
    const armA = t.length === 3 ? t[0] : undefined;
    const armB = t.length === 3 ? t[2] : undefined;

    let matchedExisting = false;
    angles = angles.map((a) => {
      const vk = vKeyById.get(a.vertexId) ?? "";
      const ak1 = vKeyById.get(a.arm1VertexId) ?? "";
      const ak2 = vKeyById.get(a.arm2VertexId) ?? "";
      const armsMatch =
        !armA || !armB || pairKey(ak1, ak2) === pairKey(armA, armB);
      if (vk === targetVertexKey && armsMatch && !a.isRightAngle && !a.degreesLabel && a.degrees === undefined) {
        matchedExisting = true;
        return {
          ...a,
          degreesLabel: "؟",
          labelKind: "unknown",
        };
      }
      return a;
    });

    if (!matchedExisting && armA && armB && (figure.polygons?.length ?? 0) > 0) {
      const vNode = figure.vertices.find((v) => vKeyById.get(v.id) === targetVertexKey);
      const a1Node = figure.vertices.find((v) => vKeyById.get(v.id) === armA);
      const a2Node = figure.vertices.find((v) => vKeyById.get(v.id) === armB);
      if (vNode && a1Node && a2Node) {
        const hasIntermediateRay = figure.angles.some(
          (a) =>
            a.vertexId === vNode.id &&
            (a.arm1VertexId === a1Node.id ||
              a.arm2VertexId === a1Node.id ||
              a.arm1VertexId === a2Node.id ||
              a.arm2VertexId === a2Node.id)
        );
        if (!hasIntermediateRay) {
          angles = [
            ...angles,
            {
              id: `${figure.figureId}_ang_asked_${t}`,
              vertexId: vNode.id,
              arm1VertexId: a1Node.id,
              arm2VertexId: a2Node.id,
              degreesLabel: "؟",
              labelKind: "unknown",
            },
          ];
        }
      }
    }
  }

  // تطبيق «؟» للمساحة المطلوبة داخل مركز ثقل الشكل
  if (askedSpec.kind === "area" && interiorBadges.length === 0 && figure.vertices.length >= 3) {
    const cx = figure.vertices.reduce((acc, v) => acc + v.position.x, 0) / figure.vertices.length;
    const cy = figure.vertices.reduce((acc, v) => acc + v.position.y, 0) / figure.vertices.length;
    interiorBadges = [
      ...interiorBadges,
      {
        id: `${figure.figureId}_badge_asked_area`,
        text: "المساحة = ؟",
        position: { x: Number(cx.toFixed(2)), y: Number(cy.toFixed(2)) },
        badgeType: "area",
        labelKind: "unknown",
      },
    ];
  }

  return {
    ...figure,
    segments,
    angles,
    interiorBadges: interiorBadges.length > 0 ? interiorBadges : figure.interiorBadges,
    askedSpec,
  };
}
