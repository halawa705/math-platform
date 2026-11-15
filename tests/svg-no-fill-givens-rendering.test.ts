import { describe, expect, it } from "vitest";
import { matchGeometryWithDiagnostics } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";
import {
  GIVEN_LABEL_BACKGROUND_FILL,
  GIVEN_LABEL_HALO_STROKE,
  GIVEN_LABEL_HALO_WIDTH,
  UNKNOWN_LABEL_BORDER,
} from "../src/core/geometry-engine/svg-given-label-style-constants";

describe("SVG No-Fill Givens Rendering with Crisp Text Halo (Track C)", () => {
  it("renders given segment lengths without opaque white <rect> fill and applies paint-order stroke halo", () => {
    const prompt =
      "في الشكل المقابل، أربعة مستقيمات متوازية AL // BM // CN // DK يقطعها قاطعان AD و LK ; AB = BC = CD = 5 سم ; LM = 4 سم ; المطلوب: طول LK";
    const res = matchGeometryWithDiagnostics(prompt, "fig_no_fill", "english");
    expect(res.figure).toBeDefined();

    const svg = projectGeometryFigureToSVGMarkup(res.figure!, {
      numeralMode: "western",
      notationLanguage: "english",
    });

    expect(GIVEN_LABEL_BACKGROUND_FILL).toBe("none");
    // عدم وجود أي مستطيل معطى (height="11") بخلفية بيضاء مصمتة أو صفراء مصمتة يغطي خطوط الشكل
    expect(svg).not.toMatch(/<rect[^>]*height="11"[^>]*fill="#FFFFFF"/i);
    expect(svg).not.toMatch(/<rect[^>]*height="11"[^>]*fill="#FFFBEB"/i);
    // وجود الهالة النصية البيضاء الدقيقة
    expect(svg).toContain(`stroke="${GIVEN_LABEL_HALO_STROKE}"`);
    expect(svg).toContain(`stroke-width="${GIVEN_LABEL_HALO_WIDTH}"`);
    expect(svg).toContain(`paint-order="stroke"`);
    // علامة الاستفهام للمطلوب تحاط بإطار متقطع شفاف بدون تعبئة
    if (svg.includes("؟")) {
      expect(svg).toContain(`fill="none" stroke="${UNKNOWN_LABEL_BORDER}"`);
    }
  });
});
