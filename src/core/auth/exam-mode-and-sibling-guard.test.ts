import { describe, expect, it, vi } from "vitest";
import {
  createStudentSessionToken,
  STUDENT_AUTH_COOKIE_MAX_AGE,
  verifyStudentSessionToken,
} from "./student-auth-server-ssot";
import {
  deleteExamAttemptMetaServer,
  loadExamAttemptMetaServer,
  mergeDraftPreservingLockedQuestions,
  saveExamAttemptMetaServer,
} from "./exam-attempt-state-server-store";
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

  it("deletes attempt metadata cleanly (including RLS tombstone protection) when teacher resets a student's attempt", async () => {
    const fakeStateStore = new Map<string, unknown>();
    const fetchSpy = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method || "GET").toUpperCase();
      if (method === "POST") {
        const body = JSON.parse(String(init?.body || "{}")) as { id: string; identity_json: unknown };
        fakeStateStore.set(body.id, body.identity_json);
        return new Response("", { status: 201 });
      }
      if (method === "DELETE") {
        // محاكاة منع الحذف المباشر بسياسات RLS لإثبات أن علامة التعطيل (Tombstone) تحمي إعادة الفتح
        return new Response("", { status: 204 });
      }
      const match = /id=eq\.([^&]+)/.exec(url);
      const id = match ? decodeURIComponent(match[1]) : "";
      const hit = fakeStateStore.get(id);
      return new Response(JSON.stringify(hit ? [{ identity_json: hit }] : []), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchSpy);
    try {
      await saveExamAttemptMetaServer({
        examCode: "exam_reset_test",
        studentCode: "MATH-999111",
        examMode: "training",
        startedAtIso: "2026-11-21T10:00:00.000Z",
        draftAnswers: { q1: { choiceIndex: 2 } },
        lockedQuestionIds: ["q1"],
        lockedFeedbackByQuestion: {},
        updatedAtIso: "2026-11-21T10:05:00.000Z",
      });
      expect(await loadExamAttemptMetaServer("exam_reset_test", "MATH-999111")).not.toBeNull();
      await deleteExamAttemptMetaServer("exam_reset_test", "MATH-999111");
      expect(await loadExamAttemptMetaServer("exam_reset_test", "MATH-999111")).toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
