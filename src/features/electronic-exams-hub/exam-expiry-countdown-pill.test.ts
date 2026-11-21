import { describe, expect, it } from "vitest";
import { formatExamCountdownParts } from "./exam-expiry-countdown-pill";

describe("formatExamCountdownParts", () => {
  const baseNowMs = Date.parse("2026-11-21T12:00:00.000Z");

  it("displays days and hours when remaining availability is >= 24 hours", () => {
    const expiresAtIso = new Date(baseNowMs + (3 * 24 + 4) * 3_600_000).toISOString();
    const parts = formatExamCountdownParts(expiresAtIso, baseNowMs);
    expect(parts.isExpired).toBe(false);
    expect(parts.isUnderOneDay).toBe(false);
    expect(parts.labelAr).toContain("يوم");
    expect(parts.labelAr).toContain("ساعة");
  });

  it("switches to hours and minutes when remaining availability drops below 24 hours", () => {
    const expiresAtIso = new Date(baseNowMs + (5 * 60 + 32) * 60_000).toISOString();
    const parts = formatExamCountdownParts(expiresAtIso, baseNowMs);
    expect(parts.isExpired).toBe(false);
    expect(parts.isUnderOneDay).toBe(true);
    expect(parts.hoursRemaining).toBe(5);
    expect(parts.minutesRemaining).toBe(32);
    expect(parts.labelAr).toContain("ساعة");
    expect(parts.labelAr).toContain("دقيقة");
  });

  it("displays minutes when less than 1 hour remains", () => {
    const expiresAtIso = new Date(baseNowMs + 18 * 60_000).toISOString();
    const parts = formatExamCountdownParts(expiresAtIso, baseNowMs);
    expect(parts.isExpired).toBe(false);
    expect(parts.isUnderOneDay).toBe(true);
    expect(parts.hoursRemaining).toBe(0);
    expect(parts.minutesRemaining).toBe(18);
    expect(parts.labelAr).toContain("دقيقة");
  });

  it("marks exam as expired when expiresAtIso is in the past", () => {
    const expiresAtIso = new Date(baseNowMs - 60_000).toISOString();
    const parts = formatExamCountdownParts(expiresAtIso, baseNowMs);
    expect(parts.isExpired).toBe(true);
  });
});
