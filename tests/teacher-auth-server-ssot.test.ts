import { describe, it, expect } from "vitest";
import {
  verifyTeacherCredentials,
  createTeacherSessionToken,
  verifyTeacherSessionToken,
} from "../src/core/auth/teacher-auth-server-ssot";
import {
  createStudentSessionToken,
  verifyStudentSessionToken,
} from "../src/core/auth/student-auth-server-ssot";

describe("teacher-auth-server-ssot", () => {
  it("authenticates teacher with exact username and password", () => {
    expect(verifyTeacherCredentials("halawa", "123451")).toBe(true);
    expect(verifyTeacherCredentials("HALAWA", "123451")).toBe(true);
    expect(verifyTeacherCredentials(" halawa ", " 123451 ")).toBe(true);
  });

  it("authenticates stealth trigger with password only", () => {
    expect(verifyTeacherCredentials("", "123451")).toBe(true);
    expect(verifyTeacherCredentials(null, "123451")).toBe(true);
  });

  it("rejects wrong password or wrong username", () => {
    expect(verifyTeacherCredentials("halawa", "wrong-pass")).toBe(false);
    expect(verifyTeacherCredentials("other_user", "123451")).toBe(false);
    expect(verifyTeacherCredentials("", "")).toBe(false);
    expect(verifyTeacherCredentials("halawa", "")).toBe(false);
  });

  it("creates and verifies a valid HMAC session token", async () => {
    const token = await createTeacherSessionToken("teacher_halawa");
    expect(token).toBeDefined();
    expect(token).toContain(".");

    const isValid = await verifyTeacherSessionToken(token);
    expect(isValid).toBe(true);
  });

  it("rejects tampered or malformed tokens", async () => {
    const validToken = await createTeacherSessionToken("teacher_halawa");
    const [payload, sig] = validToken.split(".");
    const tamperedToken = `${payload}.tampered${sig.slice(8)}`;

    expect(await verifyTeacherSessionToken(tamperedToken)).toBe(false);
    expect(await verifyTeacherSessionToken("invalid.token")).toBe(false);
    expect(await verifyTeacherSessionToken("")).toBe(false);
    expect(await verifyTeacherSessionToken(null)).toBe(false);
  });

  it("creates and verifies a valid student HMAC session token and rejects tampered tokens", async () => {
    const studentToken = await createStudentSessionToken("MATH-1001", "prep-3");
    expect(studentToken).toContain(".");

    const session = await verifyStudentSessionToken(studentToken);
    expect(session).toEqual({ studentCode: "MATH-1001", gradeId: "prep-3" });

    // تعديل حرف واحد في التوقيع يجب أن يرجع null
    const [sPayload, sSig] = studentToken.split(".");
    const flippedFirst = sSig[0] === "A" ? "B" : "A";
    const tampered = `${sPayload}.${flippedFirst}${sSig.slice(1)}`;
    expect(await verifyStudentSessionToken(tampered)).toBeNull();

    // توكن المعلم لا يُقبل كتوكن طالب
    const teacherToken = await createTeacherSessionToken("teacher_halawa");
    expect(await verifyStudentSessionToken(teacherToken)).toBeNull();
  });
});
