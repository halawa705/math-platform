/**
 * @file flow-banner-kind-resolver.ts
 * @description مصدر واحد لتصنيف عنوان الكبسولة: «فكرة» (شارة الفكرة + فاصل نهاية الفكرة)، «واجب منزلي» (شارة وردية بلا فاصل)،
 * أو «قسم» (عنوان قسم في المراجعة النهائية مثل «أولاً: أسئلة الاختيار من متعدد» — بلا شارة فكرة وبلا فاصل).
 * كان التصنيف السابق يعدّ كل عنوان يحوي «ثانياً» واجباً منزلياً، فتظهر أقسام المراجعة بشارة خاطئة.
 */

export const MODULE_ID_FLOW_BANNER_KIND_RESOLVER = "flow_banner_kind_resolver" as const;

export type FlowBannerKind = "idea" | "homework" | "section";

const HOMEWORK_TITLE_RE = /الواجب\s*المنزلي|واجبات\s*منزلية/;
const SECTION_TITLE_RE = /^\s*(?:[^\p{L}\p{N}]*)(?:أولاً|ثانياً|ثالثاً|رابعاً|خامساً)\s*[:：—-]/u;

export function resolveFlowBannerKind(bannerTitleAr: string | undefined): FlowBannerKind {
  const title = bannerTitleAr ?? "";
  if (HOMEWORK_TITLE_RE.test(title)) return "homework";
  if (SECTION_TITLE_RE.test(title)) return "section";
  return "idea";
}
