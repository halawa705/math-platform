import { describe, it, expect } from "vitest";
import {
  parseAreaModelSpecFromText,
  renderAreaModelToSvg,
  detectAndBuildAreaModelSvg,
} from "./area-model-arithmetic-svg-builder";

describe("area-model-arithmetic-svg-builder", () => {
  it("parses multiplication area model with unknown variable س", () => {
    const text = "نموذج مساحة المستطيل مكون من صفين (10، 7) وعمودين (30، 8)، الخانة الأولى أعلى اليمين تحتوي على المتغير س، والخلايا الأخرى تحتوي الأعداد 80، 210، 56";
    const spec = parseAreaModelSpecFromText(text);
    expect(spec).not.toBeNull();
    expect(spec?.kind).toBe("multiplication");
    if (spec?.kind === "multiplication") {
      expect(spec.topColumns).toEqual(["30", "8"]);
      expect(spec.sideRows).toEqual(["10", "7"]);
      expect(spec.cellValues[0][0]).toBe("س");
    }

    const svg = detectAndBuildAreaModelSvg(text);
    expect(svg).toContain("<svg");
    expect(svg).toContain("س");
    expect(svg).toContain("30");
    expect(svg).toContain("10");
  });

  it("parses division area model with divisor and partial quotients", () => {
    const text = "في مسألة القسمة 8,757 ÷ 63 باستخدام نموذج مساحة المستطيل، إذا كانت الأعداد المكتوبة أعلى المستطيل هي 100 و 30 و 9";
    const spec = parseAreaModelSpecFromText(text);
    expect(spec).not.toBeNull();
    expect(spec?.kind).toBe("division");
    if (spec?.kind === "division") {
      expect(spec.divisor).toBe("63");
      expect(spec.topQuotients).toEqual(["100", "30", "9"]);
    }

    const svg = detectAndBuildAreaModelSvg(text);
    expect(svg).toContain("<svg");
    expect(svg).toContain("63");
    expect(svg).toContain("100");
  });
});
