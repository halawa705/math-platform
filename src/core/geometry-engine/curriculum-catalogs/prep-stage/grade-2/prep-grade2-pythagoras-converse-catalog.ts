/**
 * @file prep-grade2-pythagoras-converse-catalog.ts
 * @description السجل المركزي ومنسق أشكال درس نظرية فيثاغورس وعكسها (هندسة الصف الثاني الإعدادي - الوحدة 3 - الدرس 2):
 * يطابق كافة الأوصاف الطبيعية لمسائل كتاب المعاصر لامتحانات المحافظات:
 * 1. مثلث مقسوم بعمود AD ⊥ BC وأطوال 12 و 13 و 15 سم لحساب المساحة 84 سم² (مسألة 6).
 * 2. رباعي ABCD مع زاوية B قائمة وأطوال 7 و 24 و 20 و 15 سم لإثبات AD ⊥ CD (مسألة 23).
 * 3. رباعي ABCD مع زاوية B قائمة وأطوال 9 و 12 و 8 و 17 سم لحساب المساحة 114 سم² (مسألة 28).
 * 4. شبه منحرف قائم بأبعاد 4 و 3 سم لإيجاد الوتر X بفيثاغورس (مسألة 4-1).
 * 5. شبه منحرف قائم بقاعدتين 10 و 16 وساق 10 لحساب مساحته (مسألة 5-2).
 * 6. شبه منحرف قائم مع AB = 5 و AD = 13 و DC = 35 لإيجاد محيطه 90 سم (مسألة 7).
 * 7. مثلث مقسوم بعمود ارتفاعه 3 وقاعدة 11 سم (مسألة 4-2).
 * 8. مثلث مقسوم بعمود ارتفاعه 6 وقاعدة 12 سم (مسألة 4-3).
 * 9. عكس فيثاغورس بمثلث مقسوم بعمود 2 سم وأجزاء 1 و 4 سم لإثبات زاوية BAC قائمة (مسألة 25).
 * 10. مثلثان متعامدان XYZ و CDX مع D منتصف XZ لإثبات زاوية CXD قائمة (مسألة 27).
 * 11. رباعي بأبعاد 32 و 24 و 9 و 45 سم لإثبات أن مثلث ACD منفرج الزاوية (مسألة 29).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import {
  buildPythagorasRightTrapezoidEC3Figure,
  buildPythagorasRightTrapezoidArea10x16Figure,
  buildPythagorasTrapezoidPerimeter90Figure,
} from "./prep-grade2-pythagoras-trapezoids-builder";
import {
  buildPythagorasAltitudeArea84Figure,
  buildPythagorasAltitude3Base11Figure,
  buildPythagorasAltitude6Base12Figure,
  buildPythagorasConverseBACRightFigure,
} from "./prep-grade2-pythagoras-triangles-altitude-builder";
import {
  buildPythagorasQuad7x24x20x15Figure,
  buildPythagorasQuadArea114Figure,
  buildPythagorasDoubleTrianglesCXDFigure,
  buildPythagorasObtuseTriangleACDFigure,
} from "./prep-grade2-pythagoras-quadrilaterals-builder";

export const MODULE_ID_PREP_GRADE2_PYTHAGORAS_CONVERSE_CATALOG =
  "prep_grade2_pythagoras_converse_catalog" as const;

export function matchPrepGrade2PythagorasConverseFigure(
  description: string,
  figureId = "prep2_pyth_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = description.trim();
  if (!d) return undefined;

  // 1. مثلث ABC فيه AD ⊥ BC وأطوال 12 و 13 و 15 سم لحساب المساحة 84 سم² (مسألة 6)
  if (/AD\s*⊥\s*BC.*مساحة\s*المثلث\s*ABC|12\s*سم.*13\s*سم.*15\s*سم|AD\s*=\s*12.*AC\s*=\s*15/i.test(d)) {
    return buildPythagorasAltitudeArea84Figure({ figureId, notationLanguage });
  }

  // 2. رباعي ABCD مع زاوية B قائمة وأطوال 7 و 24 و 20 و 15 سم لإثبات AD ⊥ CD (مسألة 23)
  if (/AD\s*⊥\s*CD|7\s*سم.*24\s*سم.*20\s*سم.*15\s*سم|AB\s*=\s*7.*BC\s*=\s*24.*AD\s*=\s*15/i.test(d)) {
    return buildPythagorasQuad7x24x20x15Figure({ figureId, notationLanguage });
  }

  // 3. رباعي ABCD مع زاوية B قائمة وأطوال 9 و 12 و 8 و 17 سم لحساب المساحة 114 سم² (مسألة 28)
  if (/مساحة\s*الشكل\s*ABCD.*114|m\s*\(\s*∠?\s*DAC\s*\)\s*=\s*90°|AB\s*=\s*9.*BC\s*=\s*12.*CD\s*=\s*17/i.test(d)) {
    return buildPythagorasQuadArea114Figure({ figureId, notationLanguage });
  }

  // 4. شبه منحرف قائم مع AD = 4 و BC = 4 و EC = 3 لإيجاد الوتر X (مسألة 4-1)
  if (/EC\s*=\s*3|3\s*سم.*4\s*سم.*شبه\s*منحرف|قيمة\s*X.*EC\s*=\s*3/i.test(d)) {
    return buildPythagorasRightTrapezoidEC3Figure({ figureId, notationLanguage });
  }

  // 5. شبه منحرف قائم بقاعدتين 10 و 16 وساق 10 لحساب مساحته (مسألة 5-2)
  if (/10\s*سم.*16\s*سم.*10\s*سم|شبه\s*منحرف.*10\s*سم.*16\s*سم/i.test(d)) {
    return buildPythagorasRightTrapezoidArea10x16Figure({ figureId, notationLanguage });
  }

  // 6. شبه منحرف قائم مع AB = 5 و AD = 13 و DC = 35 لإيجاد محيطه 90 سم (مسألة 7)
  if (/AB\s*\/\/\s*DC.*محيط\s*المضلع\s*ABCD|DC\s*=\s*35.*AD\s*=\s*13|محيط.*ABCD.*90/i.test(d)) {
    return buildPythagorasTrapezoidPerimeter90Figure({ figureId, notationLanguage });
  }

  // 7. مثلث مقسوم بعمود ارتفاعه 3 وقاعدة 11 سم (مسألة 4-2)
  if (/قاعدة.*11.*ارتفاع.*3|3.*11.*فيثاغورس/i.test(d)) {
    return buildPythagorasAltitude3Base11Figure({ figureId, notationLanguage });
  }

  // 8. مثلث مقسوم بعمود ارتفاعه 6 وقاعدة 12 ووتر 10 (مسألة 4-3)
  if (/قاعدة.*12.*ارتفاع.*6|6.*12.*10.*فيثاغورس/i.test(d)) {
    return buildPythagorasAltitude6Base12Figure({ figureId, notationLanguage });
  }

  // 9. عكس فيثاغورس بمثلث مقسوم بعمود 2 سم وأجزاء 1 و 4 سم لإثبات زاوية BAC قائمة (مسألة 25)
  if (/m\s*\(\s*∠?\s*BAC\s*\)\s*=\s*90°|AD\s*=\s*2.*BD\s*=\s*1.*DC\s*=\s*4/i.test(d)) {
    return buildPythagorasConverseBACRightFigure({ figureId, notationLanguage });
  }

  // 10. مثلثان متعامدان XYZ و CDX مع D منتصف XZ لإثبات زاوية CXD قائمة (مسألة 27)
  if (/XD\s*=\s*DZ|CXD\s*=\s*90°|CX\s*=\s*6.*CD\s*=\s*6\.5/i.test(d)) {
    return buildPythagorasDoubleTrianglesCXDFigure({ figureId, notationLanguage });
  }

  // 11. رباعي بأبعاد 32 و 24 و 9 و 45 سم لإثبات أن مثلث ACD منفرج الزاوية (مسألة 29)
  if (/منفرج\s*الزاوية.*ACD|AB\s*=\s*32.*BC\s*=\s*24.*AD\s*=\s*45/i.test(d)) {
    return buildPythagorasObtuseTriangleACDFigure({ figureId, notationLanguage });
  }

  // 12. مطابقة عامة لنظرية فيثاغورس وعكسها في 2 إعدادي
  if (/فيثاغورس|عكس\s*فيثاغورس/i.test(d)) {
    return buildPythagorasAltitudeArea84Figure({ figureId, notationLanguage });
  }

  return undefined;
}
