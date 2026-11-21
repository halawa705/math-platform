import { describe, expect, it } from "vitest";
import {
  createStudentSessionToken,
  STUDENT_AUTH_COOKIE_MAX_AGE,
  verifyStudentSessionToken,
} from "./student-auth-server-ssot";
import { mergeDraftPreservingLockedQuestions } from "./exam-attempt-state-server-store";
import {
  normalizeArabicFullNameForComparison,
  normalizeStudentPhoneNumber,
} from "./student-phone-and-name-normalizer";

describe("student phone normalization, 90-day session cookie & one-way training lock", () => {
  it("normalizes Eastern Arabic digits, spaces, and +20 prefix on phone numbers", () => {
    expect(normalizeStudentPhoneNumber("٠١٠ ١٢٣٤-٥٦٧٨")).toBe("01012345678");
    expect(normalizeStudentPhoneNumber("+201012345678")).toBe("01012345678");
  });

  it("normalizes Arabic full names cleanly to catch duplicate sibling registrations", () => {
    expect(normalizeArabicFullNameForComparison("أحمد  محمد عبد الله")).toBe(
      normalizeArabicFullNameForComparison("احمد محمد   عبد الله")
    );
    expect(normalizeArabicFullNameForComparison("فاطمة علي محمود")).toBe(
      normalizeArabicFullNameForComparison("فاطمه علي محمود")
    );
  });

  it("signs and verifies 90-day HttpOnly student tokens including sibling claim and rejects tampering", async () => {
    expect(STUDENT_AUTH_COOKIE_MAX_AGE).toBe(60 * 60 * 24 * 90);
    const token = await createStudentSessionToken("MATH-482910", "prep-3", {
      fullNameAr: "يوسف محمد علي",
      isSibling: true,
    });
    const verified = await verifyStudentSessionToken(token);
    expect(verified).toEqual({
      studentCode: "MATH-482910",
      gradeId: "prep-3",
      fullNameAr: "يوسف محمد علي",
      isSibling: true,
    });

    const tampered = `${token.slice(0, -4)}AAAA`;
    expect(await verifyStudentSessionToken(tampered)).toBeNull();
  });

  it("never overwrites locked training questions during draft auto-save", () => {
    const merged = mergeDraftPreservingLockedQuestions({
      existingDraft: { q1: { choiceIndex: 1 }, q2: { text: "٥" } },
      incomingDraft: { q1: { choiceIndex: 3 }, q2: { text: "١٢" }, q3: { choiceIndex: 0 } },
      lockedQuestionIds: ["q1"],
    });

    expect(merged.q1).toEqual({ choiceIndex: 1 });
    expect(merged.q2).toEqual({ text: "١٢" });
    expect(merged.q3).toEqual({ choiceIndex: 0 });
  });
});
