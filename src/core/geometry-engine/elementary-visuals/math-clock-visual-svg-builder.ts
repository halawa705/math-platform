/**
 * @file math-clock-visual-svg-builder.ts
 * @description مصيّر ومحلل الساعة التناظرية والرقمية كرسم SVG متجهي حتمي للمرحلة الابتدائية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 290 سطراً).
 */

import {
  formatNumeralsByModeSSOT,
  toWesternNumeralsSSOT,
  type NumeralDisplayMode,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_MATH_CLOCK_VISUAL_SVG_BUILDER =
  "math_clock_visual_svg_builder" as const;

export interface MathClockVisualOptions {
  readonly hours?: number;
  readonly minutes?: number;
  readonly seconds?: number;
  readonly showSeconds?: boolean;
  readonly showNumbers?: boolean;
  readonly showTicks?: boolean;
  readonly clockType?: "analog" | "digital";
  readonly label?: string;
  readonly showTimeText?: boolean;
  readonly width?: number;
  readonly height?: number;
  readonly numeralMode?: NumeralDisplayMode;
}

export interface ParsedMathClockInfo {
  readonly hours: number;
  readonly minutes: number;
  readonly clockType: "analog" | "digital";
}

const ARABIC_WORD_HOUR_MAP: Readonly<Record<string, number>> = {
  "واحدة": 1,
  "أولى": 1,
  "ثانية": 2,
  "اثنين": 2,
  "ثالثة": 3,
  "ثلاث": 3,
  "رابعة": 4,
  "أربع": 4,
  "خامسة": 5,
  "خمس": 5,
  "سادسة": 6,
  "ست": 6,
  "سابعة": 7,
  "سبع": 7,
  "ثامنة": 8,
  "ثمان": 8,
  "تاسعة": 9,
  "تسع": 9,
  "عاشرة": 10,
  "عشر": 10,
  "حادية عشرة": 11,
  "حادي عشر": 11,
  "إحدى عشرة": 11,
  "ثانية عشرة": 12,
  "ثاني عشر": 12,
  "اثنتا عشرة": 12,
};

function parseArabicWordHour(word: string): number | null {
  const clean = word.trim().replace(/^(?:الساعة\s+)?(?:ال)?/, "");
  return ARABIC_WORD_HOUR_MAP[clean] ?? null;
}

function padTwoDigits(num: number): string {
  return num < 10 ? `0${num}` : String(num);
}

export function parseMathClockDescriptor(rawText: string): ParsedMathClockInfo {
  const text = toWesternNumeralsSSOT(
    rawText
      .replace(/\$/g, "")
      .replace(/\[?(?:ساعة|ساعة حائط|ساعة عقارب|ساعة دائرية|ساعة رقمية|CLOCK|clock|رسم هندسي|شكل توضيحي|رسم توضيحي):\s*/gi, "")
      .replace(/\]$/g, "")
      .trim()
  );

  const isExplicitDigital = /ساعة\s*رقمية|digital\s*clock|شاشة\s*رقمية/i.test(rawText);
  let hours = 3;
  let minutes = 0;
  let detected = false;

  const betweenHandsMatch = text.match(
    /عقرب\s*الساعات\s*(?:يشير\s*إلى|عند|على)?\s*(?:ما\s*بين|بين)\s*(\d{1,2})\s*و\s*(\d{1,2})[\s\S]*?عقرب\s*الدقائق\s*(?:يشير\s*إلى|عند|على)?\s*(\d{1,2})/u
  );
  if (betweenHandsMatch) {
    const h1 = parseInt(betweenHandsMatch[1], 10);
    const h2 = parseInt(betweenHandsMatch[2], 10);
    const minHandPos = parseInt(betweenHandsMatch[3], 10);
    minutes = minHandPos <= 12 ? (minHandPos === 12 ? 0 : minHandPos * 5) : Math.min(59, minHandPos);
    hours = Math.min(h1, h2) || 12;
    detected = true;
  }

  if (!detected) {
    const singleHandsMatch = text.match(
      /عقرب\s*الساعات\s*(?:يشير\s*إلى|عند|على)?\s*(\d{1,2})[\s\S]*?عقرب\s*الدقائق\s*(?:يشير\s*إلى|عند|على)?\s*(\d{1,2})/u
    );
    if (singleHandsMatch) {
      hours = parseInt(singleHandsMatch[1], 10) % 12 || 12;
      const minVal = parseInt(singleHandsMatch[2], 10);
      minutes =
        text.includes("دقيقة") && minVal > 12
          ? minVal % 60
          : minVal <= 12
            ? minVal === 12 ? 0 : minVal * 5
            : minVal % 60;
      detected = true;
    }
  }

  if (!detected) {
    const timeMatch = text.match(/\b(\d{1,2})\s*:\s*(\d{1,2})\b/);
    if (timeMatch) {
      const p1 = parseInt(timeMatch[1], 10);
      const p2 = parseInt(timeMatch[2], 10);
      if ((p1 > 12 && p2 <= 12) || (p1 === 0 && p2 <= 12)) {
        hours = p2 % 12 || 12;
        minutes = p1 % 60;
      } else {
        hours = p1 % 12 || 12;
        minutes = p2 % 60;
      }
      detected = true;
    }
  }

  if (!detected) {
    const hourWordMatch = text.match(
      /(?:الساعة\s+)?(الواحدة|الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|السابعة|الثامنة|التاسعة|العاشرة|الحادية\s*عشرة|الثانية\s*عشرة)/u
    );
    if (hourWordMatch) {
      const parsedH = parseArabicWordHour(hourWordMatch[1]);
      if (parsedH !== null) {
        hours = parsedH;
        detected = true;
        if (text.includes("إلا ربع")) {
          hours = hours - 1 <= 0 ? 12 : hours - 1;
          minutes = 45;
        } else if (text.includes("إلا ثلث")) {
          hours = hours - 1 <= 0 ? 12 : hours - 1;
          minutes = 40;
        } else if (text.includes("إلا عشر")) {
          hours = hours - 1 <= 0 ? 12 : hours - 1;
          minutes = 50;
        } else if (text.includes("إلا خمس")) {
          hours = hours - 1 <= 0 ? 12 : hours - 1;
          minutes = 55;
        } else if (text.includes("والنصف")) {
          minutes = 30;
        } else if (text.includes("والثلث")) {
          minutes = 20;
        } else if (text.includes("والربع")) {
          minutes = 15;
        } else if (text.includes("وعشر دقائق") || text.includes("وعشرة دقائق")) {
          minutes = 10;
        } else if (text.includes("وخمس دقائق") || text.includes("وخمسة دقائق")) {
          minutes = 5;
        } else if (text.includes("تماماً") || text.includes("تماما")) {
          minutes = 0;
        }
      }
    }
  }

  if (!detected) {
    hours = 3;
    minutes = 45;
  }

  return {
    hours,
    minutes,
    clockType: isExplicitDigital ? "digital" : "analog",
  };
}

export function renderMathClockSVG(options: MathClockVisualOptions): string {
  const width = options.width ?? 240;
  const height = options.height ?? 240;
  const numeralMode = options.numeralMode ?? "western";
  const hours = Math.max(1, Math.min(12, options.hours ?? 3));
  const minutes = Math.max(0, Math.min(59, options.minutes ?? 0));
  const seconds = options.seconds ?? 0;
  const showSeconds = Boolean(options.showSeconds);
  const showNumbers = options.showNumbers !== false;
  const showTicks = options.showTicks !== false;
  const clockType = options.clockType ?? "analog";

  if (clockType === "digital") {
    const dispH = formatNumeralsByModeSSOT(padTwoDigits(hours), numeralMode);
    const dispM = formatNumeralsByModeSSOT(padTwoDigits(minutes), numeralMode);
    const digH = Math.min(height, 120);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${digH}" viewBox="0 0 ${width} ${digH}" class="w-full h-auto select-none">
  <rect x="12" y="10" width="${width - 24}" height="90" rx="16" fill="#0f172a" stroke="#334155" stroke-width="2.5" />
  <rect x="22" y="18" width="${width - 44}" height="74" rx="10" fill="#020617" stroke="#1e293b" stroke-width="1.5" />
  <g dir="ltr" text-anchor="middle" dominant-baseline="central">
    <text x="${width / 2 - 42}" y="55" font-family="Cairo, monospace" font-size="34" font-weight="900" fill="#38bdf8">${dispH}</text>
    <text x="${width / 2}" y="53" font-family="Cairo, monospace" font-size="32" font-weight="900" fill="#38bdf8">:</text>
    <text x="${width / 2 + 42}" y="55" font-family="Cairo, monospace" font-size="34" font-weight="900" fill="#38bdf8">${dispM}</text>
  </g>
</svg>`;
  }

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 14;
  const parts: string[] = [
    `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="#ffffff" stroke="#0f172a" stroke-width="3.5" />`,
    `<circle cx="${cx}" cy="${cy}" r="${radius - 4}" fill="none" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="2 3" opacity="0.6" />`,
  ];

  if (showTicks) {
    for (let i = 0; i < 60; i++) {
      const isHour = i % 5 === 0;
      const angleRad = (i * 6 - 90) * (Math.PI / 180);
      const tickLen = isHour ? 10 : 5;
      const xO = cx + (radius - 5) * Math.cos(angleRad);
      const yO = cy + (radius - 5) * Math.sin(angleRad);
      const xI = cx + (radius - 5 - tickLen) * Math.cos(angleRad);
      const yI = cy + (radius - 5 - tickLen) * Math.sin(angleRad);
      parts.push(`<line x1="${xI.toFixed(1)}" y1="${yI.toFixed(1)}" x2="${xO.toFixed(1)}" y2="${yO.toFixed(1)}" stroke="${isHour ? "#0f172a" : "#94a3b8"}" stroke-width="${isHour ? 2.5 : 1}" stroke-linecap="round" />`);
    }
  }

  if (showNumbers) {
    const numR = radius - 24;
    for (let n = 1; n <= 12; n++) {
      const rad = (n * 30 - 90) * (Math.PI / 180);
      const nx = cx + numR * Math.cos(rad);
      const ny = cy + numR * Math.sin(rad);
      const disp = formatNumeralsByModeSSOT(n, numeralMode);
      parts.push(`<text x="${nx.toFixed(1)}" y="${ny.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="Cairo, Arial, sans-serif" font-size="${n >= 10 ? 14 : 14.5}" font-weight="900" fill="#0f172a">${disp}</text>`);
    }
  }

  const minuteAngle = (minutes + seconds / 60) * 6;
  const hourAngle = ((hours % 12) + minutes / 60 + seconds / 3600) * 30;
  const hLen = radius * 0.52;
  const mLen = radius * 0.76;

  parts.push(
    `<g transform="rotate(${hourAngle.toFixed(2)}, ${cx}, ${cy})"><line x1="${cx}" y1="${cy + 8}" x2="${cx}" y2="${cy - hLen + 6}" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round" /><polygon points="${cx},${cy - hLen} ${cx - 4.5},${cy - hLen + 8} ${cx + 4.5},${cy - hLen + 8}" fill="#0f172a" /></g>`,
    `<g transform="rotate(${minuteAngle.toFixed(2)}, ${cx}, ${cy})"><line x1="${cx}" y1="${cy + 12}" x2="${cx}" y2="${cy - mLen + 6}" stroke="#2563eb" stroke-width="3" stroke-linecap="round" /><polygon points="${cx},${cy - mLen} ${cx - 3.5},${cy - mLen + 8} ${cx + 3.5},${cy - mLen + 8}" fill="#2563eb" /></g>`
  );

  if (showSeconds) {
    const secAngle = seconds * 6;
    parts.push(`<g transform="rotate(${secAngle.toFixed(2)}, ${cx}, ${cy})"><line x1="${cx}" y1="${cy + 16}" x2="${cx}" y2="${cy - radius * 0.82}" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" /></g>`);
  }

  parts.push(
    `<circle cx="${cx}" cy="${cy}" r="6" fill="#0f172a" />`,
    `<circle cx="${cx}" cy="${cy}" r="3" fill="#2563eb" />`,
    `<circle cx="${cx}" cy="${cy}" r="1.5" fill="#ffffff" />`
  );

  if (options.showTimeText) {
    const timeLabel = options.label ?? `${padTwoDigits(hours)}:${padTwoDigits(minutes)}`;
    parts.push(`<text x="${cx}" y="${height - 4}" text-anchor="middle" font-family="Cairo, monospace" font-size="11" font-weight="bold" fill="#64748b">${formatNumeralsByModeSSOT(timeLabel, numeralMode)}</text>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="w-full h-auto select-none" style="background:#ffffff">${parts.join("")}</svg>`;
}
