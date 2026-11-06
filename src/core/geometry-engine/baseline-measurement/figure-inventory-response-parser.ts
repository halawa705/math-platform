/**
 * @file figure-inventory-response-parser.ts
 * @description محلل رد NotebookLM لجرد الأشكال المنهجية (المرحلة 0.3):
 * يحول النص المجدول الوارد من استجابة برومبت الجرد إلى كائنات قياسية CurriculumFigureArchetype.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 160 سطراً).
 */

import type {
  CurriculumFigureArchetype,
  InventoryFigureCategory,
  InventoryUnknownTargetKind,
} from "../../ssot/figure-archetype-inventory-ssot";

export const MODULE_ID_FIGURE_INVENTORY_RESPONSE_PARSER =
  "figure_inventory_response_parser" as const;

function sanitizeArchetypeId(gradeId: string, nameArabic: string, index: number): string {
  const asciiKey = nameArabic
    .replace(/[^\w\u0600-\u06FF]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 30);
  return `${gradeId}_arch_${index}_${asciiKey}`;
}

function parseCategoryField(raw: string): InventoryFigureCategory {
  const clean = raw.trim().toLowerCase();
  if (clean.includes("cartesian") || clean.includes("function") || clean.includes("بياني")) {
    return "cartesian_function";
  }
  if (clean.includes("stat") || clean.includes("إحصاء") || clean.includes("مدرج") || clean.includes("صندوق")) {
    return "statistics_chart";
  }
  if (clean.includes("primary") || clean.includes("شريط") || clean.includes("ساعة") || clean.includes("بصري")) {
    return "primary_visual_model";
  }
  if (clean.includes("solid") || clean.includes("فراغ") || clean.includes("مجسم") || clean.includes("هرم")) {
    return "solid_geometry";
  }
  return "plane_geometry";
}

function parseUnknownTargetKind(raw: string): InventoryUnknownTargetKind {
  const clean = raw.trim().toLowerCase();
  if (clean.includes("length") || clean.includes("طول") || clean.includes("ضلع")) return "length";
  if (clean.includes("angle") || clean.includes("زاوية") || clean.includes("قياس")) return "angle";
  if (clean.includes("area") || clean.includes("مساحة")) return "area";
  if (clean.includes("perimeter") || clean.includes("محيط")) return "perimeter";
  if (clean.includes("volume") || clean.includes("حجم")) return "volume";
  if (clean.includes("ratio") || clean.includes("نسبة")) return "ratio";
  if (clean.includes("coord") || clean.includes("إحداثي")) return "coordinates";
  if (clean.includes("proof") || clean.includes("برهان") || clean.includes("أثبت")) return "proof";
  return "none";
}

export function parseFigureInventoryResponse(
  rawText: string,
  fallbackGradeId = "prep-1"
): CurriculumFigureArchetype[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const archetypes: CurriculumFigureArchetype[] = [];
  let itemCounter = 1;

  for (const line of lines) {
    if (!line.includes("[ARCHETYPE]")) continue;

    // تفكيك السطر على أساس الفاصل |
    const segments = line.split("|").map((s) => s.trim());
    const fieldMap = new Map<string, string>();

    for (const seg of segments) {
      const colonIdx = seg.indexOf(":");
      if (colonIdx > 0) {
        const key = seg.slice(0, colonIdx).trim().toUpperCase();
        const val = seg.slice(colonIdx + 1).trim();
        fieldMap.set(key, val);
      }
    }

    const gradeId = fieldMap.get("GRADE") || fallbackGradeId;
    const unitTitleArabic = fieldMap.get("UNIT") || "وحدة عامة";
    const lessonTitleArabic = fieldMap.get("LESSON") || "درس عام";
    const archetypeNameArabic = fieldMap.get("NAME") || `شكل قياسي ${itemCounter}`;
    const category = parseCategoryField(fieldMap.get("KIND") || "plane_geometry");
    const canonicalTagExample = fieldMap.get("TAG") || `[رسم هندسي: ${archetypeNameArabic}]`;
    const givensSummary = fieldMap.get("GIVENS") || "معطيات المسألة";
    const unknownKind = parseUnknownTargetKind(fieldMap.get("UNKNOWN") || "length");

    archetypes.push({
      id: sanitizeArchetypeId(gradeId, archetypeNameArabic, itemCounter),
      gradeId,
      unitTitleArabic,
      lessonTitleArabic,
      archetypeNameArabic,
      category,
      canonicalTagExample,
      givensSummary,
      unknownKind,
      isApprovedByTeacher: false, // يحتاج اعتماد المالك
    });

    itemCounter++;
  }

  return archetypes;
}
