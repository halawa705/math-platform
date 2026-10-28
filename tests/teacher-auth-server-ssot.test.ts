import { describe, it, expect } from "vitest";
import {
  verifyTeacherCredentials,
  createTeacherSessionToken,
  verifyTeacherSessionToken,
  TEACHER_ADMIN_DEFAULT_USER,
  TEACHER_ADMIN_DEFAULT_PASS,
} from "../src/core/auth/teacher-auth-server-ssot";

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
});
