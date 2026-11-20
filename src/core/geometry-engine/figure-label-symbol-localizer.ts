/**
 * @file figure-label-symbol-localizer.ts
 * @description توطين نصوص تسميات الأشكال (أطوال/زوايا جبرية مثل X سم و (3X-18)°) وفق ترميز المستند:
 * عربي: X ← س، Y ← ص ...؛ إنجليزي: س ← X ... ، ثم تنسيق الأرقام. مستقل عن LaTeX لأن الـ SVG نص عادي.
 */
import {
  formatNumeralsByModeSSOT,
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_FIGURE_LABEL_SYMBOL_LOCALIZER = "figure_label_symbol_localizer" as const;

const LATIN_UNIT_TOKEN = /^(?:cm|mm|km|dm|m|hr|min|sec)$/i;
const ARABIC_UNIT_WORDS = /(?:سم²|م²|كم²|مم²|ديسم²|متراً|مترا|أمتاراً|أمتارا|أمتار|امتار|متر|ديسم|سم|مم|كم|وحدات|وحدة|ساعات|ساعة|دقائق|دقيقة|ثواني|ثانية|أيام|يوم|أسابيع|أسبوع|كجم|جم|طن|ملل|لتر)/g;
const LATIN_RUN = /(?<![A-Za-z])([A-Za-z]{1,4})(?![A-Za-z])/g;
const ARABIC_LETTER_RUN = /(?<![\u0621-\u064A])([أإابجدهوزحخيكلمنفقرشطتثغسصع]ـ?)(?![\u0621-\u064A])/g;

export function localizeFigureLabelText(text: string, notation: MathNotationLanguage, numeralMode: NumeralDisplayMode): string {
  // حماية وحدات القياس العربية (بما فيها «سم» أو «م» بعد رقم أو متغير لاتيني أو قوس مثل «2x سم» و«(x+1) م»)
  const unitPlaceholders: string[] = [];
  const protect = (u: string) => {
    unitPlaceholders.push(u);
    return `\uE000${unitPlaceholders.length - 1}\uE001`;
  };
  const protectedText = text
    .replace(ARABIC_UNIT_WORDS, protect)
    .replace(/(?<=[\d٠-٩A-Za-z)\]]\s+)م(?![\u0621-\u064A])/g, protect)
    .replace(/(?<=[\d٠-٩]\s*)م(?![\u0621-\u064A])/g, protect);

  const symbols =
    notation === "arabic"
      ? protectedText.replace(LATIN_RUN, (run) =>
          LATIN_UNIT_TOKEN.test(run)
            ? run
            : [...run.toUpperCase()].map((ch) => localizeGeometricVertexLabelSSOT(ch, "arabic")).join("")
        )
      : protectedText.replace(ARABIC_LETTER_RUN, (ch) => localizeGeometricVertexLabelSSOT(ch.replace(/\u0640/g, ""), "english"));

  const restored = symbols.replace(/\uE000(\d+)\uE001/g, (_m, idx) => unitPlaceholders[Number(idx)] ?? "");
  return formatNumeralsByModeSSOT(restored, numeralMode);
}
