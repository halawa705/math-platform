/**
 * @file notebooklm-stage-envelope-cleaner.ts
 * @description منظف غلاف ردود NotebookLM: يزيل ترويسات المراحل والبيانات الوصفية في أعلى الرد
 * (### مراجعة...، الفرع:، الصف:، النطاق:، العدد:) وكذلك إحصاءات توزيع البدائل والعبارات الحوارية الختامية
 * لمنع تسربها كسؤال #1 أو كسؤال وهمي إضافي في المراجعة والاختبار والمذكرة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 115 سطراً).
 */

export const MODULE_ID_NOTEBOOKLM_STAGE_ENVELOPE_CLEANER =
  "notebooklm_stage_envelope_cleaner" as const;

const HEADER_TITLE_LINE_RE =
  /^\s*#{1,6}\s*(?:مراجعة|اختبار|امتحان|نموذج|مذكرة|ورقة\s*عمل|المرحلة|بنك\s*أسئلة|أسئلة\s+(?:الاختيار|مقالية))[^\n]*$/i;

const METADATA_LINE_RE =
  /^\s*(?:[-•*]\s*)?(?:\*{0,2})(?:الفرع|الصف|المادة|النطاق(?:\s*الحصري)?|العدد(?:\s*الإلزامي)?|الزمن|الدرجة(?:\s*الكلية)?|الفصل\s*الدراسي)(?:\*{0,2})\s*:[^\n]*$/i;

const HORIZONTAL_RULE_LINE_RE = /^\s*[-*_]{3,}\s*$/;

const TRAILING_STATS_AND_CHAT_PATTERNS: readonly RegExp[] = [
  /(?:^|\n)\s*(?:[-*_]{3,}\s*\n+\s*)?\*{0,2}إحصاء\s+توزيع\s+مفاتيح\s+الإجابة[\s\S]*$/i,
  /(?:^|\n)\s*(?:[-•*]\s*)?\*{0,2}التكرار\s+المتتالي\*{0,2}\s*:[\s\S]*$/i,
  /(?:^|\n)\s*(?:🎯|📋|💡|✨|📝)?\s*\*{0,2}(?:الخطوة\s+التالية(?:\s+المتاحة)?|خطوة\s+تالية\s+اقتراحية|اقتراح\s+الخطوة\s+التالية|خطوة\s+اقتراحية|جاهز\s+لنقلك(?:\s+فوراً)?|يمكننا\s+الآن\s+تجميع|هل\s+ترغب\s+في\s+(?:البدء|الانتقال)|هل\s+تود\s+(?:البدء|الانتقال)|بانتظار\s+تعليماتك|إذا\s+كنت\s+مستعداً)[\s\S]*$/i,
];

const NON_QUESTION_BLOCK_START_RE =
  /^(?:\*{0,2}إحصاء\s+توزيع|[-•*]?\s*الحرف\s*\([أابجد]\)\s*:\s*\d+|[-•*]?\s*التكرار\s+المتتالي\s*:|جاهز\s+لنقلك|الخطوة\s+التالية|يمكننا\s+الآن\s+تجميع|هل\s+ترغب\s+في\s+(?:البدء|الانتقال)|مراجعة\s+مقرر|المرحلة\s+[١٢٣123])/i;

function isEnvelopeHeaderOrMetaLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (HEADER_TITLE_LINE_RE.test(trimmed)) return true;
  if (METADATA_LINE_RE.test(trimmed)) return true;
  if (HORIZONTAL_RULE_LINE_RE.test(trimmed)) return true;
  if (/^\*{1,2}(?:الفرع|الصف|النطاق|العدد)/i.test(trimmed)) return true;
  return false;
}

/** يطهر أعلى وأسفل رد NotebookLM من عناوين المراحل وإحصاءات البدائل والخواتيم الحوارية. */
export function stripNotebookLMStageEnvelope(raw: string): string {
  if (!raw) return "";
  let text = raw.replace(/\r\n?/g, "\n").trim();
  text = text.replace(/^[\s"“«]+|[\s"”»]+$/g, "").trim();

  // إزالة ترويسة المرحلة والبيانات الوصفية من بداية الرد (وقد يفصلها خط أفقي ---)
  const lines = text.split("\n");
  let startIdx = 0;
  let sawEnvelopeHeader = false;
  while (startIdx < lines.length) {
    const line = lines[startIdx];
    const trimmed = line.trim();
    if (!trimmed) {
      startIdx++;
      continue;
    }
    if (HEADER_TITLE_LINE_RE.test(trimmed) || METADATA_LINE_RE.test(trimmed)) {
      sawEnvelopeHeader = true;
      startIdx++;
      continue;
    }
    if (HORIZONTAL_RULE_LINE_RE.test(trimmed) && (sawEnvelopeHeader || startIdx <= 8)) {
      startIdx++;
      continue;
    }
    break;
  }
  text = lines.slice(startIdx).join("\n").trim();

  // إزالة إحصاء توزيع البدائل وخاتمة التوجيه الحوارية من نهاية الرد
  for (const pat of TRAILING_STATS_AND_CHAT_PATTERNS) {
    text = text.replace(pat, "").trim();
  }
  text = text.replace(/(?:\n\s*[-*_]{3,}\s*)+$/g, "").trim();
  return text;
}

/** يتحقق من أن الكتلة مجرد بيانات وصفية أو إحصاء حواري وليس سؤالاً حقيقياً. */
export function isNonQuestionMetaBlock(block: string): boolean {
  const trimmed = (block || "").trim();
  if (!trimmed || trimmed.length < 4) return true;
  if (NON_QUESTION_BLOCK_START_RE.test(trimmed)) return true;
  const nonEmptyLines = trimmed
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (nonEmptyLines.length === 0) return true;
  return nonEmptyLines.every((l) => isEnvelopeHeaderOrMetaLine(l));
}
