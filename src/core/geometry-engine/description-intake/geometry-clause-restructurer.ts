/**
 * @file geometry-clause-restructurer.ts
 * @description المرحلة 2 من استقبال وصف NotebookLM: يفكّك الجمل المركّبة («مثلث ABC فيه AB = 7 و BC = 9 والزاوية B = 40»)
 * إلى حقائق مفصولة بـ «؛» ويعيد ترتيب صيغ الإعلان («ABCD متوازي أضلاع» ← «متوازي أضلاع ABCD») ويحذف مقدمات الإنشاء.
 */
import { parseLabelList } from "../fact-compositor/geo-label-utils";

export const MODULE_ID_GEOMETRY_CLAUSE_RESTRUCTURER = "geometry_clause_restructurer" as const;

const SEP = " ؛ ";
/** جمل «المطلوب» ليست حقائق رسم فتُحذف. */
const GOAL_CLAUSE = /^(?:أوجد|اوجد|احسب|أثبت|اثبت|برهن|استنتج|علل|بين\s*أن|ما\s*(?:هو|هي|قيمة)|المطلوب|هل|ثم\s*أوجد)/;
const SHAPE = "(?:مثلث|مستطيل|مربع|معين|متوازي\\s*أضلاع|شبه\\s*منحرف|رباعي|دائرة)";
const AR = "[أ-ي]ـ?";
const LABELS_ONE_SEG = "[A-Z]{2}";
const LABELS = `(?:[A-Z]{2,5}|(?:${AR}\\s+){1,4}${AR})`;
const FACT_START = `(?:ق\\s*\\(|∠|(?:ال)?زاوية|قياس|[A-Z]{1,5}\\s*(?:=|//|⊥|∈|∩|منتصف|وتر|قطر|مماس|ينصف|منصف|متوسط)|${AR}\\s*${AR}\\s*(?:=|//|⊥)|نصف|طول|نق\\b)`;
const QUAD_DIMENSIONS = new RegExp(`(?:^\\s*|${SEP.trim()}\\s*)((?:مستطيل|مربع)\\s*(${LABELS}))([^؛;]*)`, "g");

function dimensionFacts(shapeHead: string, labelsRaw: string, tail: string): string {
  const k = parseLabelList(labelsRaw);
  if (!k || k.length !== 4) return `${shapeHead}${tail}`;
  const num = "(\\d+(?:\\.\\d+)?)";
  const len = tail.match(new RegExp(`(?:طوله|طولها|بعداه|الطول)\\s*=?\\s*${num}`));
  const wid = tail.match(new RegExp(`(?:عرضه|عرضها|العرض)\\s*=?\\s*${num}`));
  const side = tail.match(new RegExp(`(?:ضلعه|ضلعها|طول\\s*ضلعه)\\s*=?\\s*${num}`));
  const extra: string[] = [];
  if (len) extra.push(`${k[0]}${k[1]} = ${len[1]}`);
  if (wid) extra.push(`${k[1]}${k[2]} = ${wid[1]}`);
  if (side) extra.push(`${k[0]}${k[1]} = ${side[1]}`);
  const rest = tail.replace(/(?:طوله|طولها|بعداه|الطول|عرضه|عرضها|العرض|ضلعه|ضلعها|طول\s*ضلعه)\s*=?\s*\d+(?:\.\d+)?\s*(?:سم)?/g, " ").replace(/\sو\s*$|\sو\s+(?=قطرا)/g, " ");
  return [shapeHead + rest, ...extra].join(SEP);
}

export function restructureGeometryClauses(plain: string): string {
  let t = ` ${plain} `;
  t = t
    .replace(/(وتر|قطر)\s+فيها/g, "$1")
    .replace(/(?:في\s*)?(?:ال)?(?:شكل|رسم)\s*(?:ال)?(?:مقابل|آتي|الآتي|التالي|تالي)\s*[:：،]?/g, SEP)
    .replace(/\s(?:فيه|فيها|حيث|بحيث|وكان|إذا\s*كان|اذا\s*كان|علماً\s*بأن|علما\s*بأن|وفيه)\s/g, SEP)
    .replace(/[:：]/g, SEP)
    .replace(/\sو(?=\s*نصف\s*قطرها)/g, " ")
    .replace(new RegExp(`(${LABELS_ONE_SEG})\\s*(?:ال)?(?:مستقيم|قطعة\\s*مستقيمة)?\\s*(?:و?يقطع)\\s*(${LABELS_ONE_SEG})\\s*في\\s*([A-Z]|${AR})`, "g"), "$1 ؛ $3 ∈ $2")
    .replace(/(?:ال)?نقطة\s+(?=[A-Z]\b)/g, " ")
    .replace(new RegExp(`(?:ال)?نقطة\\s+(${AR})(?=\\s+(?:على|∈|منتصف|تنتمي))`, "g"), "$1")
    .replace(/([A-Z]|[أ-ي]ـ?)\s*(?:هي\s*)?نقطة\s*تقاطع\s*(?:ال)?قطر(?:يه|يها|ي|ان|اه)\s*/g, " قطراه يتقاطعان في $1 ")
    .replace(new RegExp(`(${LABELS_ONE_SEG})\\s+([^؛;]*?)(?:طوله|طولها)\\s*=?\\s*(\\d+(?:\\.\\d+)?)\\s*(?:سم)?`, "g"), "$1 $2 ؛ $1 = $3 سم ")
    .replace(new RegExp(`\\sو(?:\\s*)(?=${FACT_START})`, "g"), SEP)
    .replace(/\sو(?=(?:ال)?زاوية|قياس)/g, SEP)
    .replace(/\sو(?=\s*(?:عرضه|عرضها|ضلعه))/g, SEP)
    .replace(/\sو(?=نصف)/g, " ")
    .replace(/(نصف\s*قطرها)\s+(?=\d)/g, "$1 = ")
    .replace(/(?:^|\s)ال(?=(?:مثلث|مستطيل|مربع|معين|متوازي|شبه|رباعي))/g, " ")
    .replace(new RegExp(`(^\\s*|[؛;]\\s*)في\\s+(?=${SHAPE})`, "g"), "$1")
    .replace(new RegExp(`(^\\s*|[؛;]\\s*)(${LABELS})\\s+(${SHAPE})`, "g"), "$1$3 $2")
    .replace(/(^\s*|[؛;]\s*)([A-Z]{3})\s+(?=قائم|متساوي)/g, "$1مثلث $2 ")
    .replace(new RegExp(`(?:قياس\\s*)?(?:ال)?زاوية\\s*(${LABELS}|[A-Z]|${AR})\\s*=`, "g"), "ق(∠ $1) =")
    .replace(/\s*(?:،|,(?=\s))\s*/g, SEP);
  t = t.replace(QUAD_DIMENSIONS, (_m, head: string, labels: string, tail: string) => SEP + dimensionFacts(head, labels, tail));
  t = t.split(/\s*؛\s*/).filter((c) => !GOAL_CLAUSE.test(c.trim())).join(SEP);
  return t.replace(/(\s*؛\s*)+/g, SEP).replace(/^\s*؛\s*|\s*؛\s*$/g, "").replace(/\s+/g, " ").trim();
}




