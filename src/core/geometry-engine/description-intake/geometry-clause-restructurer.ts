/**
 * @file geometry-clause-restructurer.ts
 * @description المرحلة 2 من استقبال وصف NotebookLM: يفكّك الجمل المركّبة («مثلث ABC فيه AB = 7 و BC = 9 والزاوية B = 40»)
 * إلى حقائق مفصولة بـ «؛» ويعيد ترتيب صيغ الإعلان («ABCD متوازي أضلاع» ← «متوازي أضلاع ABCD») ويحذف مقدمات الإنشاء.
 */
import { parseLabelList } from "../fact-compositor/geo-label-utils";

export const MODULE_ID_GEOMETRY_CLAUSE_RESTRUCTURER = "geometry_clause_restructurer" as const;

const SEP = " ؛ ";
const STRUCTURED_HEADER_REGEX =
  /(?:^|[؛;\s])(?:الرؤوس|الأشكال|الشكل|أطوال\s*الأضلاع(?:\s*ووحداتها)?|الأطوال|الزوايا(?:\s*والتعامد)?|التوازي(?:\s*والتعامد)?|الأشعة(?:\s*والامتداد)?|المعطيات|الأضلاع\s*والزوايا|النقاط)\s*\(/g;

/**
 * يفك أغلفة الأقواس الهيكلية مثل `الرؤوس (مثلث ABC)` و`الزوايا والتعامد (m(∠B) = 90° ; m(∠A) = 35°)`
 * مع احترام الأقواس المتداخلة كي لا تتبقى `)` زائدة أو يتلف التعبير `(x + 10)°`.
 */
export function unwrapStructuredCategoryHeaders(text: string): string {
  if (!text) return text;
  let out = text;
  for (let pass = 0; pass < 4; pass++) {
    STRUCTURED_HEADER_REGEX.lastIndex = 0;
    const match = STRUCTURED_HEADER_REGEX.exec(out);
    if (!match) break;
    const openParenIdx = out.indexOf("(", match.index);
    if (openParenIdx < 0) break;
    const prefixHasSep = /^[؛;\s]/.test(match[0]) ? SEP : "";
    let depth = 1;
    let i = openParenIdx + 1;
    while (i < out.length && depth > 0) {
      if (out[i] === "(") depth++;
      else if (out[i] === ")") depth--;
      i++;
    }
    if (depth === 0) {
      const inner = out.slice(openParenIdx + 1, i - 1).trim();
      out = out.slice(0, match.index) + prefixHasSep + inner + SEP + out.slice(i);
    } else {
      const inner = out.slice(openParenIdx + 1).trim();
      out = out.slice(0, match.index) + prefixHasSep + inner;
    }
  }
  return out;
}

/** جمل «المطلوب» وأوصاف التوضيح العامة ليست حقائق رسم فتُحذف. */
const GOAL_CLAUSE =
  /^(?:ثم\s+)?[فو]?\s*(?:أوجد|اوجد|احسب|أثبت|اثبت|برهن|استنتج|علل|بين\s*أن|حدد|اذكر|ما\s*(?:هو|هي|قيمة|نوع)|المطلوب|هل\b|منشأ\s*على\s*أضلاعه|المربع\s*\(\d+\)\s*منشأ)/;
const SHAPE = "(?:مثلث|مستطيل|مربع|معين|متوازي\\s*أضلاع|شبه\\s*منحرف|شكل\\s*رباعي|رباعي|دائرة)";
const AR = "[أ-ي]ـ?";
const LABELS_ONE_SEG = "[A-Z]{2}";
const LABELS = `(?:[A-Z]{2,5}|(?:${AR}\\s+){1,4}${AR})`;
const FACT_START = `(?:ق\\s*\\(|∠|(?:ال)?زاوية|قياس|[A-Z]{1,5}\\s*(?:=|//|⊥|∈|∩|منتصف|وتر|قطر|مماس|ينصف|منصف|متوسط)|${AR}\\s*${AR}\\s*(?:=|//|⊥)|نصف|طول|نق\\b|مساحة\\s*(?:ال)?مربع)`;
const QUAD_DIMENSIONS = new RegExp(`(?:^\\s*|${SEP.trim()}\\s*)((?:مستطيل|مربع)\\s*(${LABELS}))([^؛;]*)`, "g");
const TRI_SIDE_DIMENSION = new RegExp(`(?:^\\s*|${SEP.trim()}\\s*)(مثلث\\s*(${LABELS})\\s*متساوي\\s*الأضلاع)\\s*(?:طول\\s*)?ضلعه\\s*=?\\s*(\\d+(?:\\.\\d+)?)\\s*(?:سم|م)?`, "g");

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
  const rest = tail.replace(/(?:و\s*)?(?:طوله|طولها|بعداه|الطول|عرضه|عرضها|العرض|ضلعه|ضلعها|طول\s*ضلعه)\s*=?\s*\d+(?:\.\d+)?\s*(?:سم|م)?/g, " ").replace(/\sو\s*$|\sو\s+(?=قطرا)/g, " ");
  return [shapeHead + rest, ...extra].join(SEP);
}

export function restructureGeometryClauses(plain: string): string {
  let t = ` ${plain.replace(/`/g, " ")} `
    .replace(/\[\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:/gi, SEP)
    .replace(/\]\s*(?:\|.*)?$/g, " ")
    .replace(/\]/g, SEP)
    .replace(/\|\s*(?:معرف|نوع)\s*[^؛;\n]*/g, " ")
    .replace(/\|\s*$/g, " ")
    .replace(/(?:؛|;|\s)*المطلوب\s*[:：][^؛;\n]*/g, SEP);
  t = unwrapStructuredCategoryHeaders(t)
    .replace(/(?<!\d)\.(?!\d)/g, SEP);
  t = t
    .replace(/(وتر|قطر)\s+فيها/g, "$1")
    .replace(/(?:في\s*)?(?:ال)?(?:شكل|رسم)\s*(?:ال)?(?:مقابل|آتي|الآتي|التالي|تالي)\s*[:：،]?/g, SEP)
    .replace(/\s(?:فيه|فيها|حيث|بحيث|وكان|إذا\s*كان|اذا\s*كان|علماً\s*بأن|علما\s*بأن|وفيه)\s/g, SEP)
    .replace(/[:：]/g, SEP)
    .replace(/\sو(?=\s*نصف\s*قطرها)/g, " ")
    .replace(new RegExp(`\\b(${LABELS_ONE_SEG})\\b\\s*(?:ال)?(?:مستقيم|قطعة\\s*مستقيمة)?\\s*(?:و?يقطع)\\s*\\b(${LABELS_ONE_SEG})\\b\\s*في\\s*([A-Z]|${AR})`, "g"), "$1 ؛ $3 ∈ $2")
    .replace(/(?:ال)?نقطة\s+(?=[A-Z]\b)/g, " ")
    .replace(new RegExp(`(?:ال)?نقطة\\s+(${AR})(?=\\s+(?:على|∈|منتصف|تنتمي))`, "g"), "$1")
    .replace(new RegExp(`([A-Z]|${AR})\\s*(?:∈|على)?\\s*(?:لـ|إلى|على)?\\s*امتداد\\s*(?:القطعة\\s*|الشعاع\\s*|المستقيم\\s*|الضلع\\s*)?(${LABELS_ONE_SEG}|${AR}\\s*${AR})`, "g"), "نمد $2 إلى $1")
    .replace(/مثلثان\s*([A-Z]{3})\s*و\s*([A-Z]{3})(?:\s*(?:يتقاطعان|متقاطعان))?(?:\s*(?:في|عند)\s*(?:الرأس|النقطة)?\s*([A-Z]))?/g, "مثلث $1 ؛ مثلث $2")
    .replace(/(مثلث\s*[A-Z]{3})\s+(?:يمثل|تمثل|يمثّل)\s+[^؛;]+/g, "$1")
    .replace(/([A-Z]|[أ-ي]ـ?)\s*(?:هي\s*)?نقطة\s*تقاطع\s*(?:ال)?قطر(?:يه|يها|ي|ان|اه)\s*/g, " قطراه يتقاطعان في $1 ")
    .replace(
      /(?:ال)?مربع\s+([A-Z]{4})\s+ضلعه\s*=?\s*(\d+(?:\.\d+)?)\s*(سم|م)?\s*و(?:ال)?مربع\s+([A-Z]{4})\s+ضلعه\s*=?\s*(\d+(?:\.\d+)?)\s*(سم|م)?(?:\s*متجاوران)?/g,
      (_m, q1: string, l1: string, u1: string, q2: string, l2: string, u2: string) =>
        `مربع ${q1}${SEP}${q1[0]}${q1[1]} = ${l1} ${u1 || "سم"}${SEP}مربع ${q2}${SEP}${q2[0]}${q2[1]} = ${l2} ${u2 || "سم"}`
    )
    .replace(/\b([A-Z])\s*و\s*([A-Z])\s*(?:∈|تنتميان\s*إلى|تقعان\s*على|على)\s*([A-Z]{2})\b/g, `$1 ∈ $3${SEP}$2 ∈ $3`)
    .replace(/(?:أُسقط|أسقط|نسقط)\s*(?:ال)?عمود(?:ان|ين)?\s+(?=[A-Z]{2}\s*⊥)/g, "")
    .replace(/([A-Z])\s*و\s*([A-Z])\s*و\s*([A-Z])\s*على\s*استقامة\s*واحدة/g, "")
    .replace(/مساحة\s*(?:ال)?مربع\s*\(\s*1\s*\)\s*=\s*(\d+(?:\.\d+)?)/g, "مساحة مربع على AB = $1")
    .replace(/مساحة\s*(?:ال)?مربع\s*\(\s*2\s*\)\s*=\s*(\d+(?:\.\d+)?)/g, "مساحة مربع على BC = $1")
    .replace(
      new RegExp(`\\b(${LABELS_ONE_SEG})\\b\\s+(?:يمثل|يمثّل)\\s+[^؛;]*?(?:و\\s*)?(?:طوله|طولها)\\s*=?\\s*(\\d+(?:\\.\\d+)?)\\s*(سم|متراً|أمتار|امتار|متر|قدماً|أقدام|قدم|بوصة|بوصات|م)?`, "g"),
      (_m, segTok: string, numTok: string, unitTok: string) => {
        const u = /متر|أمتار|امتار/.test(unitTok || "") ? "م" : unitTok || "سم";
        return `${segTok} = ${numTok} ${u}`;
      }
    )
    .replace(new RegExp(`\\b(${LABELS_ONE_SEG})\\b\\s+(?:يمثل|يمثّل)\\s+[^؛;]*?قطر[^؛;]*`, "g"), "ارسم $1")
    .replace(new RegExp(`\\b(${LABELS_ONE_SEG})\\b\\s+(?:يمثل|يمثّل)\\s+[^؛;]*`, "g"), "")
    .replace(new RegExp(`(?:ال)?(?:قطر|قطعة)\\s+(${LABELS_ONE_SEG})\\s+(?:واصل(?:ة)?\\s+بين[^؛;]*|تصل\\s+بين[^؛;]*|ل(?:ل|لمثلث|لمربع|لمستطيل|لمعين|لشكل)[^؛;]*)`, "g"), "ارسم $1")
    .replace(new RegExp(`\\b(${LABELS_ONE_SEG})\\b\\s+قطر(?:\\s*ل(?:ل|لمستطيل|لمربع|لمعين|لشكل)[^؛;]*)?`, "g"), "ارسم $1")
    .replace(new RegExp(`\\b(${LABELS_ONE_SEG})\\b\\s+([^؛;]*?)(?:طوله|طولها)\\s*=?\\s*(\\d+(?:\\.\\d+)?)\\s*(?:سم)?`, "g"), "$1 $2 ؛ $1 = $3 سم ")
    .replace(new RegExp(`\\sو(?:\\s*)(?=${FACT_START})`, "g"), SEP)
    .replace(/\sو(?=(?:ال)?زاوية|قياس)/g, SEP)
    .replace(/\sو(?=نصف)/g, " ")
    .replace(/(نصف\s*قطرها)\s+(?=\d)/g, "$1 = ")
    .replace(/(?:^|\s)ال(?=(?:مثلث|مستطيل|مربع|معين|متوازي|شبه|رباعي|شكل\s*رباعي))/g, " ")
    .replace(new RegExp(`(^\\s*|[؛;]\\s*)في\\s+(?=${SHAPE})`, "g"), "$1")
    .replace(new RegExp(`(^\\s*|[؛;]\\s*)(${LABELS})\\s+(${SHAPE})`, "g"), "$1$3 $2")
    .replace(/(^\s*|[؛;]\s*)([A-Z]{3})\s+(?=قائم|متساوي)/g, "$1مثلث $2 ")
    .replace(new RegExp(`(?:قياس\\s*)?(?:ال)?زاوية\\s*(${LABELS}|[A-Z]|${AR})\\s*=`, "g"), "ق(∠ $1) =")
    .replace(/\s*(?:،|,(?=\s))(?![^()]*\))\s*/g, SEP);
  t = t.replace(QUAD_DIMENSIONS, (_m, head: string, labels: string, tail: string) => SEP + dimensionFacts(head, labels, tail));
  t = t.replace(TRI_SIDE_DIMENSION, (_m, head: string, labels: string, val: string) => {
    const k = parseLabelList(labels);
    return k && k.length === 3 ? `${SEP}${head}${SEP}${k[0]}${k[1]} = ${val} سم` : `${SEP}${head}`;
  });
  t = t.replace(/\s+(?:و\s*)?(?=قطرا[هـا]?\s+يتقاطعان)/g, SEP);
  t = t.split(/\s*؛\s*/).filter((c) => !GOAL_CLAUSE.test(c.trim())).join(SEP);
  return t.replace(/(\s*؛\s*)+/g, SEP).replace(/^\s*؛\s*|\s*؛\s*$/g, "").replace(/\s+/g, " ").trim();
}




