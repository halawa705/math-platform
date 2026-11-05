/**
 * @file primary-grade4-analog-clock-svg-builder.ts
 * @description يحلل «ساعة عقارب» (H:MM) ويرسم قرص ساعة تناظرية حتمياً مع شاشة رقمية فارغة «: ».
 * لا يُطبع الوقت نصاً أبداً (هو المطلوب في السؤال)؛ أرقام القرص 1–12 أثاث ثابت (data-furniture) لا تُحتسب تسريباً.
 */
import { toWesternNumeralsSSOT } from "../../../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PRIMARY_GRADE4_ANALOG_CLOCK_SVG_BUILDER = "primary_grade4_analog_clock_svg_builder" as const;

export interface AnalogClockTime {
  readonly hour: number;
  readonly minute: number;
}

export function parseAnalogClockTime(description: string): AnalogClockTime | null {
  if (!/ساعة/.test(description) || !/عقارب|تناظرية/.test(description)) return null;
  const m = toWesternNumeralsSSOT(description).match(/(\d{1,2})\s*[:：]\s*(\d{2})/);
  if (!m) return null;
  const hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  if (hour < 1 || hour > 12 || minute > 59) return null;
  return { hour, minute };
}

function polar(cx: number, cy: number, r: number, deg: number): { x: number; y: number } {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: +(cx + r * Math.cos(rad)).toFixed(2), y: +(cy + r * Math.sin(rad)).toFixed(2) };
}

export function buildGrade4AnalogClockSvgMarkup(time: AnalogClockTime): string {
  const cx = 70;
  const cy = 70;
  const ticks: string[] = [];
  for (let i = 0; i < 60; i++) {
    const long = i % 5 === 0;
    const a = polar(cx, cy, long ? 52 : 56, i * 6);
    const b = polar(cx, cy, 60, i * 6);
    ticks.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#0F172A" stroke-width="${long ? 1.6 : 0.7}"/>`);
  }
  const numerals: string[] = [];
  for (let n = 1; n <= 12; n++) {
    const p = polar(cx, cy, 43, n * 30);
    numerals.push(`<text data-furniture="1" x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="11" font-weight="700" font-family="Cairo, sans-serif" fill="#0F172A">${n}</text>`);
  }
  const hourDeg = (time.hour % 12) * 30 + time.minute * 0.5;
  const hourTip = polar(cx, cy, 28, hourDeg);
  const minTip = polar(cx, cy, 46, time.minute * 6);
  const digital = `<rect x="40" y="136" width="60" height="22" rx="4" fill="#fff" stroke="#0F172A" stroke-width="1.4"/><text data-furniture="1" x="70" y="152" text-anchor="middle" font-size="14" font-weight="700" fill="#0F172A">:</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 162" width="140" height="162" direction="ltr">` +
    `<circle cx="${cx}" cy="${cy}" r="64" fill="#fff" stroke="#EA580C" stroke-width="4"/>${ticks.join("")}${numerals.join("")}` +
    `<line x1="${cx}" y1="${cy}" x2="${hourTip.x}" y2="${hourTip.y}" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/>` +
    `<line x1="${cx}" y1="${cy}" x2="${minTip.x}" y2="${minTip.y}" stroke="#0D9488" stroke-width="2.4" stroke-linecap="round"/>` +
    `<circle cx="${cx}" cy="${cy}" r="3" fill="#0F172A"/>${digital}</svg>`;
}
