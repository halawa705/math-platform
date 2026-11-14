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
  /^(?:ثم\s+)?[فو]?\s*(?:أوجد|اوجد|احسب|أثبت|اثبت|برهن|استنتج|علل|بين\s*أن|بيّن\s*نوع|بين\s*نوع|حدد|اذكر|ما\s*(?:هو|هي|قيمة|نوع)|المطلوب|هل\b|منشأ\s*على\s*أضلاعه|المربع\s*\(\d+\)\s*منشأ)/;
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

function expandNestedAndMultiMidpoints(input: string): string {
  const nearestTri = (prefix: string): string => {
    const matches = [...prefix.matchAll(/مثلث\s*([A-Z]{3})\b/g)];
    return matches.length > 0 ? matches[matches.length - 1][1] : "ABC";
  };
  const nearestQuad = (prefix: string): string => {
    const matches = [
      ...prefix.matchAll(
        /(?:متوازي\s*أضلاع|شبه\s*منحرف|مستطيل|معين|مربع|شكل\s*رباعي)\s*([A-Z]{4})\b/g
      ),
    ];
    return matches.length > 0 ? matches[matches.length - 1][1] : "ABCD";
  };

  let out = input.replace(
    /(?:ال)?مثلث\s*([A-Z]{3})\s+(?:هو\s*)?(?:مثلث\s*)?(?:مرسوم\s*بربط|رؤوسه)\s*منتصفات\s*أضلاع\s*(?:ال)?مثلث\s*(?:الأصلي\s*)?([A-Z]{3})/g,
    (_, inner: string, outer: string) =>
      `مثلث ${outer}${SEP}${inner[0]} منتصف ${outer[0]}${outer[1]}${SEP}${inner[1]} منتصف ${outer[1]}${outer[2]}${SEP}${inner[2]} منتصف ${outer[2]}${outer[0]}${SEP}ارسم ${inner[0]}${inner[1]}${SEP}ارسم ${inner[1]}${inner[2]}${SEP}ارسم ${inner[2]}${inner[0]}`
  );

  out = out.replace(
    /(?:النقط\s+)?([A-Z])\s*[,،]\s*([A-Z])\s*[,،]\s*([A-Z])\s*[,،و]\s*([A-Z])\s*(?:هي\s*)?منتصفات\s*(?:الأضلاع|أضلاعه(?:\s*الأربعة)?)(?:\s*([A-Z]{2})\s*[,،]\s*([A-Z]{2})\s*[,،]\s*([A-Z]{2})\s*[,،و]\s*([A-Z]{2}))?(?:\s*على\s*الترتيب)?/g,
    (_m, p1: string, p2: string, p3: string, p4: string, s1: string | undefined, s2: string | undefined, s3: string | undefined, s4: string | undefined, offset: number) => {
      const q = nearestQuad(out.slice(0, offset));
      const a = s1 ?? `${q[0]}${q[1]}`;
      const b = s2 ?? `${q[1]}${q[2]}`;
      const c = s3 ?? `${q[2]}${q[3]}`;
      const d = s4 ?? `${q[3]}${q[0]}`;
      return `${SEP}${p1} منتصف ${a}${SEP}${p2} منتصف ${b}${SEP}${p3} منتصف ${c}${SEP}${p4} منتصف ${d}${SEP}ارسم ${p1}${p2}${SEP}ارسم ${p2}${p3}${SEP}ارسم ${p3}${p4}${SEP}ارسم ${p4}${p1}`;
    }
  );

  out = out.replace(
    /(?:النقط\s+)?([A-Z])\s*[,،]\s*([A-Z])\s*[,،و]\s*([A-Z])\s*(?:هي\s*)?منتصفات\s*(?:الأضلاع|أضلاعه(?:\s*الثلاثة)?)(?:\s*([A-Z]{2})\s*[,،]\s*([A-Z]{2})\s*[,،و]\s*([A-Z]{2}))?(?:\s*على\s*الترتيب)?/g,
    (_m, p1: string, p2: string, p3: string, s1: string | undefined, s2: string | undefined, s3: string | undefined, offset: number) => {
      const tri = nearestTri(out.slice(0, offset));
      const a = s1 ?? `${tri[0]}${tri[1]}`;
      const b = s2 ?? `${tri[1]}${tri[2]}`;
      const c = s3 ?? `${tri[2]}${tri[0]}`;
      return `${SEP}${p1} منتصف ${a}${SEP}${p2} منتصف ${b}${SEP}${p3} منتصف ${c}${SEP}ارسم ${p1}${p2}${SEP}ارسم ${p2}${p3}${SEP}ارسم ${p3}${p1}`;
    }
  );

  return out;
}

export function restructureGeometryClauses(plain: string): string {
  let t = ` ${plain.replace(/`/g, " ")} `
    .replace(/\[\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:/gi, SEP)
    .replace(/\]\s*(?:\|.*)?$/g, " ")
    .replace(/\]/g, SEP)
    .replace(/\|\s*(?:معرف|نوع)\s*[^؛;\n]*/g, " ")
    .replace(/\|\s*$/g, " ")
    .replace(/(?:؛|;|\s)*المطلوب\s*[:：][^؛;\n]*/g, SEP);
  t = expandNestedAndMultiMidpoints(t);
  t = unwrapStructuredCategoryHeaders(t)
    .replace(/(?<!\d)\.(?!\d)/g, SEP);
  t = t
    .replace(new RegExp(`(^|${SEP.trim()}\\s*)[^؛;]{2,35}?على\\s+شكل\\s+(?=${SHAPE})`, "g"), "$1")
    .replace(/(?:خط\s*العمل|العارضة|ممر\s*المشاة|الرف|السلك)\s+(?=[A-Z]{2}\b)/g, "")
    .replace(/(^|[؛;]\s*)(?:و)?(?:رسم|يرسم|أخذت|نصل|أقيم)\s+(?=[A-Z]{1,2}\b)/g, "$1")
    .replace(/طول\s+ضلعه\s+\d+(?:\.\d+)?\s*أمتار\s*\(\s*(\d+(?:\.\d+)?)\s*سم\s*\)/g, "AB = $1 سم")
    .replace(/القواعد\s+المتوازية\s+([A-Z]{2}\s*=\s*[^؛;و]+?)\s+و\s+([A-Z]{2}\s*=\s*[^؛;]+)/g, "$1 ؛ $2")
    .replace(/(?:^|[؛;])\s*طول\s+([A-Z]{2}\s*=)/g, "؛ $1")
    .replace(/قطر(?:ه|ا[هـا]?)\s*([A-Z]{2})\s*=\s*([^؛;]+)/g, "؛ $1 = $2 ؛ ارسم $1")
    .replace(/(?:ال)?قطران\s*([A-Z]{2})\s*و\s*([A-Z]{2})\s*مرسومان/g, "؛ ارسم $1 ؛ ارسم $2")
    .replace(/قطر(?:اه|اها)\s*متعامدان\s*([A-Z]{2})\s*⊥\s*([A-Z]{2})/g, "؛ ارسم $1 ؛ ارسم $2 ؛ $1 ⊥ $2")
    .replace(/قطر(?:اه|اها)\s*متساويان\s*([A-Z]{2})\s*=\s*([A-Z]{2})/g, "؛ ارسم $1 ؛ ارسم $2 ؛ $1 = $2")
    .replace(/تقاطع\s*قطرا(?:ه|ها)\s*في\s*([A-Z])/g, "؛ قطراه يتقاطعان في $1")
    .replace(/([A-Z])\s*[,،و]\s*([A-Z])\s*(?:∈|تنتميان\s*إلى)\s*([A-Z]{2})/g, "$1 ∈ $3 ؛ $2 ∈ $3")
    .replace(/([A-Z])\s*[,،و]\s*([A-Z])\s*(?:هما\s*)?منتصفا\s*(?:الضلعين\s*)?([A-Z]{2})\s*و\s*([A-Z]{2})(?:\s*على\s*الترتيب)?/g, "$1 منتصف $3 ؛ $2 منتصف $4")
    .replace(/([A-Z])\s+على\s+استقامة\s+([A-Z]{2})(?:\s+بحيث\s+([A-Z]{2})\s*=\s*([A-Z]{2}))?/g, (_m, p: string, s: string, e1?: string, e2?: string) =>
      `نمد ${s} إلى ${p}${e1 && e2 ? `${SEP}${e1} = ${e2}` : ""}`
    )
    .replace(/(?:ال)?(?:مستقيم|شعاع|قطعة(?:\s*مستقيمة)?|خط)\s*([A-Z]{4})\s+يوازي\s+القواعد\s+ويقطع\s+([A-Z]{2})\s+في\s+([A-Z])\s+و\s*([A-Z]{2})\s+في\s+([A-Z])\s+و\s*([A-Z]{2})\s+في\s+([A-Z])/g,
      (_m, q: string, s1: string, p1: string, s2: string, p2: string, s3: string, p3: string) =>
        `${q[0]}${q[3]} // AD${SEP}${q[0]}${q[3]} // BC${SEP}${p1} ∈ ${s1}${SEP}${p2} ∈ ${s2}${SEP}${p3} ∈ ${s3}${SEP}ارسم ${q[0]}${q[3]}`
    )
    .replace(/(?:ال)?مستقيم\s+([A-Z]{2})\s+يوازي\s+([A-Z]{2})\s+و\s+([A-Z]{2})\s*[؛;,]\s*يقطع\s+([A-Z]{2})\s+في\s+([A-Z])\s+ويقطع\s+([A-Z]{2})\s+في\s+([A-Z])/g,
      `$1 // $2${SEP}$1 // $3${SEP}$5 ∈ $4${SEP}$7 ∈ $6${SEP}ارسم $1`
    )
    .replace(/(?:ال)?خطان\s+([A-Z]{2})\s+و\s+([A-Z]{2})\s+يقطعان\s+(?:الضلع\s+|القطر\s+)?([A-Z]{2})\s+في\s+([A-Z])\s+و\s+([A-Z])/g,
      `$1 ∩ $3 = $4${SEP}$2 ∩ $3 = $5`
    )
    .replace(/(?:ال)?قطر\s+([A-Z]{2})\s+يقطعه\s+([A-Z]{2})\s+في\s+([A-Z])\s+ويقطعه\s+([A-Z]{2})\s+في\s+([A-Z])/g,
      `$2 ∩ $1 = $3${SEP}$4 ∩ $1 = $5`
    )
    .replace(/(?:(?:ال)?شعاع|(?:ال)?مستقيم)?\s*([A-Z]{2})\s*(?:\/\/|يوازي)\s*([A-Z]{2})\s*(?:و|ل|ول)?(?:يقطع|تقطع)\s+(?:الضلع\s+|القطر\s+)?([A-Z]{2})\s+في\s+([A-Z])\b/g,
      `$1 // $2${SEP}$4 ∈ $3`
    )
    .replace(/مع\s+(?=[A-Z]\s*(?:∈|تنتمي|على))/g, SEP)
    .replace(/(?:محيط\s*(?:ال)?مثلث\s*(?:الأصغر\s*)?[A-Z]{3}|محيط[هـا]?)\s*(?:يساوي|=)?\s*(\d+(?:\.\d+)?)\s*(سم|متراً|مترا|متر|م)?/g,
      (_m, val: string, u?: string) => `${SEP}محيط = ${val} ${u || "سم"}`
    )
    .replace(/(?:مساحة\s*(?:ال)?مثلث\s*[A-Z]{3}|مساحت[هـا]?)\s*(?:تساوي|=)?\s*(\d+(?:\.\d+)?)\s*(سم²|سم\^2|م²)?/g,
      (_m, val: string, u?: string) => `${SEP}مساحة = ${val} ${(u || "سم²").replace(/\^2/g, "²")}`
    )
    .replace(/(وتر|قطر)\s+فيها/g, "$1")
    .replace(/(?:في\s*)?(?:ال)?(?:شكل|رسم)\s*(?:ال)?(?:مقابل|آتي|الآتي|التالي|تالي)\s*[:：،]?/g, SEP)
    .replace(/\s(?:فيه|فيها|حيث|بحيث|وكان|فإذا\s*كان|وإذا\s*كان|إذا\s*كان|اذا\s*كان|علماً\s*بأن|علما\s*بأن|وفيه)\s/g, SEP)
    .replace(/[:：]/g, SEP)
    .replace(/\sو(?=\s*نصف\s*قطرها)/g, " ")
    .replace(new RegExp(`(?:المستقيم|الشعاع|القطعة(?:\\s*المستقيمة)?|الخط)?\\s*\\b(${LABELS_ONE_SEG})\\b\\s*(?:ال)?(?:مستقيم|قطعة\\s*مستقيمة)?\\s*(?:و|ل|ول)?(?:يقطع|تقطع)\\s*(?:الضلع\\s+|القطر\\s+|القطعة\\s+)?\\b(${LABELS_ONE_SEG})\\b\\s*في\\s*(?:النقطة\\s+)?([A-Z]|${AR})(?:\\s*(?:و|ل|ول)?(?:يقطع|تقطع)\\s*(?:الضلع\\s+|القطر\\s+)?\\b(${LABELS_ONE_SEG})\\b\\s*في\\s*(?:النقطة\\s+)?([A-Z]|${AR}))?`, "g"),
      (_m, s1: string, s2: string, p1: string, s3?: string, p2?: string) =>
        `${s1} ∩ ${s2} = ${p1}${s3 && p2 ? `${SEP}${s1} ∩ ${s3} = ${p2}` : ""}`
    )
    .replace(/(?:ال)?نقطة\s+(?=[A-Z]\b)/g, " ")
    .replace(new RegExp(`(?:ال)?نقطة\\s+(${AR})(?=\\s+(?:على|∈|منتصف|تنتمي))`, "g"), "$1")
    .replace(new RegExp(`([A-Z]|${AR})\\s*(?:∈|على)?\\s*(?:لـ|إلى|على)?\\s*امتداد\\s*(?:القطعة\\s*|الشعاع\\s*|المستقيم\\s*|الضلع\\s*)?(${LABELS_ONE_SEG}|${AR}\\s*${AR})`, "g"), "نمد $2 إلى $1")
    .replace(/مثلثان\s*([A-Z]{3})\s*و\s*([A-Z]{3})(?:\s*(?:يتقاطعان|متقاطعان))?(?:\s*(?:في|عند)\s*(?:الرأس|النقطة)?\s*([A-Z]))?/g, "مثلث $1 ؛ مثلث $2")
    .replace(/(مثلث\s*[A-Z]{3})\s+(?:يمثل|تمثل|يمثّل)\s+[^؛;]+/g, "$1")
    .replace(/([A-Z]|[أ-ي]ـ?)\s*(?:هي\s*)?نقطة\s*تقاطع\s*(?:ال)?قطر(?:ين|يه|يها|ي|ان|اه)(?:\s*[A-Z]{2}\s*و\s*[A-Z]{2})?\s*/g, " قطراه يتقاطعان في $1 ")
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
    .replace(/(?:قس[ّ]?مت\s+الحديقة\s+بـ?)?ممر\s+مشاة\s+(?:مستقيم\s+)?([A-Z])([A-Z])\s+يصل\s+بين\s+منتصفي\s*(?:السياجين\s*الجانبيين|الضلعين)\s*([A-Z]{2})\s*و\s*([A-Z]{2})/g, "$1 منتصف $3 ؛ $2 منتصف $4 ؛ ارسم $1$2")
    .replace(/(?:و\s*إذا\s+|إذا\s+)?أ[ُ]?قيم\s+عمود\s+إنارة\s+في\s+منتصف\s+(?:هذا\s+الممر|القطعة|[A-Z]{2})\s+([A-Z])\s+ووصل\s+بأسلاك\s+مستقيمة\s+إلى\s+الركنين\s+([A-Z])\s+و\s+([A-Z])/g, "ارسم $1$2 ؛ ارسم $1$3")
    .replace(/\bطول\s+(?=[A-Z]{2}\s*=)/g, "")
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




