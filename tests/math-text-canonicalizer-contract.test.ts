import { describe, it, expect } from "vitest";
import { canonicalizeMathText } from "../src/core/math-text/math-text-canonicalizer";
import { findResidualLeaks } from "../src/core/math-text/math-leak-final-gate";
import { NOTEBOOKLM_REAL_AND_SYNTHETIC_MATH_LINES } from "./fixtures/notebooklm-real-and-synthetic-math-lines-fixture";

const NBSP = "\u00A0";

describe("M1 — canonical math text contract (all fixture lines)", () => {
  for (const [i, line] of NOTEBOOKLM_REAL_AND_SYNTHETIC_MATH_LINES.entries()) {
    const label = `#${i} [${line.branch}] ${line.raw.slice(0, 40)}`;
    it(`idempotent + leak-free: ${label}`, () => {
      const once = canonicalizeMathText(line.raw);
      expect(canonicalizeMathText(once)).toBe(once);
      expect(findResidualLeaks(once)).toEqual([]);
      const outside = once.replace(/\$[^$\n]*\$/g, " ");
      expect(outside).not.toMatch(/(?:^|\s)(?:سم²?|سم³?|مم|كم|متر|جم|كجم|لتر)\s+[0-9٠-٩]/);
    });
  }
});

describe("M1 — targeted behaviours", () => {
  it("unifies \\\\( \\\\) delimiters", () => {
    expect(canonicalizeMathText("إذا كان \\\\(k = 2\\\\) فإن")).toBe("إذا كان $k = 2$ فإن");
  });
  it("binds polygon similarity as one block, once", () => {
    const out = canonicalizeMathText("المضلع ABCD يشابه المضلع XYZW بنسبة 2");
    expect(out).toContain("المضلع $ABCD \\sim XYZW$");
    expect(out).not.toMatch(/المضلع\s+المضلع/);
    expect(canonicalizeMathText("إذا كان ABCD ~ XYZW")).toContain("$ABCD \\sim XYZW$");
  });
  it("units always after the number, glued", () => {
    expect(canonicalizeMathText("$20$ سم$^2$")).toBe(`$20$${NBSP}سم²`);
    expect(canonicalizeMathText("الطول سم 8")).toBe(`الطول 8${NBSP}سم`);
    expect(canonicalizeMathText("AB = 4 سم")).toBe(`$AB = 4$${NBSP}سم`);
    expect(canonicalizeMathText("$16 \\text{ سم}$")).toBe(`$16$${NBSP}سم`);
    expect(canonicalizeMathText("16 cm^2")).toBe(`16${NBSP}سم²`);
  });
  it("Egyptian intervals", () => {
    expect(canonicalizeMathText("$x \\in [-1, 4)$")).toBe("$x \\in [-1, 4[$");
    expect(canonicalizeMathText("الفترة $(2, 5)$")).toBe("الفترة $]2, 5[$");
    expect(canonicalizeMathText("$(-\\infty, 3)$")).toBe("$]-\\infty, 3[$");
    expect(canonicalizeMathText("النقطة $(2, -3)$")).toBe("النقطة $(2, -3)$");
  });
  it("Arabic prose inside an equation leaves math as RTL atoms", () => {
    const out = canonicalizeMathText("$\\text{محيط الصورة} = k \\times \\text{محيط الأصل}$");
    expect(out).toBe("محيط الصورة = $k$ × محيط الأصل");
  });
  it("keeps Arabic labels inside fractions as \\text", () => {
    const out = canonicalizeMathText("$k = \\frac{\\text{طول الصورة}}{\\text{طول الأصل}}$");
    expect(out).toBe("$k = \\frac{\\text{طول الصورة}}{\\text{طول الأصل}}$");
  });
  it("moves a leading relation out of the math block and binds the unit", () => {
    expect(canonicalizeMathText("$= 2$ كم")).toBe(`= $2$${NBSP}كم`);
  });
  it("wraps naked LaTeX and drops stray backslashes", () => {
    expect(canonicalizeMathText("قيمة frac{12}{4} تساوي")).toContain("$\\frac{12}{4}$");
    expect(canonicalizeMathText("$\\ = $ 5")).not.toMatch(/\\\s*=/);
  });
});
