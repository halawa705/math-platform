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

  it("parses division area model with divisor and partial quotients and div symbol", () => {
    const text = "في مسألة القسمة $8,757 \\div 63$ باستخدام نموذج مساحة المستطيل، إذا كانت الأعداد المكتوبة أعلى المستطيل هي $100$ و $30$ و $9$";
    const spec = parseAreaModelSpecFromText(text);
    expect(spec).not.toBeNull();
    expect(spec?.kind).toBe("division");
    if (spec?.kind === "division") {
      expect(spec.divisor).toBe("63");
      expect(spec.topQuotients).toEqual(["100", "30", "9"]);
      expect(spec.cellProducts).toEqual(["6300", "1890", "567"]);
    }

    const svg = detectAndBuildAreaModelSvg(text);
    expect(svg).toContain("<svg");
    expect(svg).toContain("63");
    expect(svg).toContain("100");
    expect(svg).toContain("6300");
  });

  it("parses decimal area model with vertical and horizontal dimensions", () => {
    const text = "المثال: أوجد حاصل ضرب $1.6 \\times 3.8$ باستخدام نموذج مساحة المستطيل. | الرسم: [رسم هندسي: مستطيل أبعاده الرأسية $1$ و $0.6$ والأفقية $3$ و $0.8$]";
    const spec = parseAreaModelSpecFromText(text);
    expect(spec).not.toBeNull();
    expect(spec?.kind).toBe("multiplication");
    if (spec?.kind === "multiplication") {
      expect(spec.sideRows).toEqual(["1", "0.6"]);
      expect(spec.topColumns).toEqual(["3", "0.8"]);
      expect(spec.cellValues[0]).toEqual(["3", "0.8"]);
      expect(spec.cellValues[1]).toEqual(["1.8", "0.48"]);
    }

    const svg = detectAndBuildAreaModelSvg(text);
    expect(svg).toContain("<svg");
    expect(svg).toContain("1.8");
    expect(svg).toContain("0.48");
  });

  it("parses 3-column multi-digit multiplication with parens", () => {
    const text = "أكمل نموذج مساحة المستطيل المقابل لإيجاد حاصل ضرب $246 \\times 35$ مقسم إلى صفين للعدد $35$ ($30$ و $5$) وثلاثة أعمدة للعدد $246$ ($200$ و $40$ و $6$)";
    const spec = parseAreaModelSpecFromText(text);
    expect(spec).not.toBeNull();
    expect(spec?.kind).toBe("multiplication");
    if (spec?.kind === "multiplication") {
      expect(spec.sideRows).toEqual(["30", "5"]);
      expect(spec.topColumns).toEqual(["200", "40", "6"]);
      expect(spec.cellValues[0]).toEqual(["6000", "1200", "180"]);
      expect(spec.cellValues[1]).toEqual(["1000", "200", "30"]);
    }
  });

  it("auto-decomposes multiplication operation when explicit parts are omitted", () => {
    const text = "نموذج مساحة المستطيل لحاصل ضرب $2.5 \\times 3.4$ المقابل";
    const spec = parseAreaModelSpecFromText(text);
    expect(spec).not.toBeNull();
    expect(spec?.kind).toBe("multiplication");
    if (spec?.kind === "multiplication") {
      expect(spec.topColumns).toEqual(["2", "0.5"]);
      expect(spec.sideRows).toEqual(["3", "0.4"]);
      expect(spec.cellValues[0]).toEqual(["6", "1.5"]);
      expect(spec.cellValues[1]).toEqual(["0.8", "0.2"]);
    }
  });
});
