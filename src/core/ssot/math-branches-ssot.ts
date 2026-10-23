/**
 * @file math-branches-ssot.ts
 * @description المصدر الوحيد للحقيقة (SSOT) لجميع فروع مادة الرياضيات الأحد عشر في المنصة.
 * يُمنع تعريف أسماء الفروع أو ألوانها أو خصائصها في أي ملف آخر.
 */

export type MathBranchId =
  | "numbers"
  | "algebra"
  | "functions"
  | "trigonometry"
  | "plane_geometry"
  | "analytic_geometry"
  | "solid_geometry"
  | "statistics_probability"
  | "calculus"
  | "statics"
  | "dynamics";

export type SchoolStageId = "primary" | "preparatory" | "secondary";

export interface MathBranchDefinition {
  readonly id: MathBranchId;
  readonly nameArabic: string;
  readonly nameEnglish: string;
  readonly symbolBadge: string;
  readonly accentHexLight: string;
  readonly accentHexDark: string;
  readonly stages: readonly SchoolStageId[];
  readonly requiresGeometryEngine: boolean;
  readonly requiresStatisticsEngine: boolean;
  readonly defaultPromptGuidance: string;
}

export const MATH_BRANCHES_SSOT: Record<MathBranchId, MathBranchDefinition> = {
  numbers: {
    id: "numbers",
    nameArabic: "الأعداد والعمليات الحسابية",
    nameEnglish: "Numbers & Operations",
    symbolBadge: "ℕ÷",
    accentHexLight: "#2563EB",
    accentHexDark: "#60A5FA",
    stages: ["primary", "preparatory"],
    requiresGeometryEngine: false,
    requiresStatisticsEngine: false,
    defaultPromptGuidance: "التركيز على الحس العددي، الكسور، العشريات، القوى والأسس، الجذور، والنسبة والتناسب.",
  },
  algebra: {
    id: "algebra",
    nameArabic: "الجبر والفترات والمتباينات",
    nameEnglish: "Algebra & Intervals",
    symbolBadge: "𝑥²",
    accentHexLight: "#3730A3",
    accentHexDark: "#818CF8",
    stages: ["preparatory", "secondary"],
    requiresGeometryEngine: true,
    requiresStatisticsEngine: false,
    defaultPromptGuidance: "التركيز على المقادير الجبرية، التحليل، المعادلات، المتباينات، والعمليات على الفترات الحقيقية.",
  },
  functions: {
    id: "functions",
    nameArabic: "الدوال والتمثيل البياني",
    nameEnglish: "Functions & Graphs",
    symbolBadge: "𝑓(𝑥)",
    accentHexLight: "#0D9488",
    accentHexDark: "#2DD4BF",
    stages: ["preparatory", "secondary"],
    requiresGeometryEngine: true,
    requiresStatisticsEngine: false,
    defaultPromptGuidance: "التركيز على المجال والمدى والاطراد، وجداول القيم، ومنحنيات الدوال الخطية والتربيعية والكسرية.",
  },
  trigonometry: {
    id: "trigonometry",
    nameArabic: "حساب المثلثات",
    nameEnglish: "Trigonometry",
    symbolBadge: "sinθ",
    accentHexLight: "#7C3AED",
    accentHexDark: "#A78BFA",
    stages: ["preparatory", "secondary"],
    requiresGeometryEngine: true,
    requiresStatisticsEngine: false,
    defaultPromptGuidance: "التركيز على النسب المثلثية، الزوايا الخاصة والمنتسبة، المتطابقات، وحل المثلث.",
  },
  plane_geometry: {
    id: "plane_geometry",
    nameArabic: "الهندسة المستوية والبرهان",
    nameEnglish: "Plane Euclidean Geometry",
    symbolBadge: "△◯",
    accentHexLight: "#059669",
    accentHexDark: "#34D399",
    stages: ["primary", "preparatory", "secondary"],
    requiresGeometryEngine: true,
    requiresStatisticsEngine: false,
    defaultPromptGuidance: "التركيز على المعطيات والمطلوب وخطوات البرهان الاستدلالي (بما أن ∵ / إذن ∴) والأشكال الهندسية الدقيقة.",
  },
  analytic_geometry: {
    id: "analytic_geometry",
    nameArabic: "الهندسة التحليلية والإحداثية",
    nameEnglish: "Analytic Coordinate Geometry",
    symbolBadge: "(𝑥,𝑦)",
    accentHexLight: "#0284C7",
    accentHexDark: "#38BDF8",
    stages: ["preparatory", "secondary"],
    requiresGeometryEngine: true,
    requiresStatisticsEngine: false,
    defaultPromptGuidance: "التركيز على البعد بين نقطتين، المنتصف، الميل، معادلة الخط المستقيم، والشبكة الإحداثية.",
  },
  solid_geometry: {
    id: "solid_geometry",
    nameArabic: "الهندسة الفراغية والمجسمات",
    nameEnglish: "Solid & Spatial Geometry",
    symbolBadge: "xyz",
    accentHexLight: "#D97706",
    accentHexDark: "#FBBF24",
    stages: ["primary", "preparatory", "secondary"],
    requiresGeometryEngine: true,
    requiresStatisticsEngine: false,
    defaultPromptGuidance: "التركيز على المساحات الجانبية والكلية والحجوم للمجسمات، والمستويات والمتجهات في الفراغ.",
  },
  statistics_probability: {
    id: "statistics_probability",
    nameArabic: "الإحصاء والاحتمالات",
    nameEnglish: "Statistics & Probability",
    symbolBadge: "∑📊",
    accentHexLight: "#E11D48",
    accentHexDark: "#FB7185",
    stages: ["primary", "preparatory", "secondary"],
    requiresGeometryEngine: false,
    requiresStatisticsEngine: true,
    defaultPromptGuidance: "التركيز على مقاييس النزعة المركزية والتشتت، الجداول التكرارية، المدرجات والقطاعات، والاحتمالات.",
  },
  calculus: {
    id: "calculus",
    nameArabic: "التفاضل والتكامل",
    nameEnglish: "Calculus",
    symbolBadge: "∫𝑑𝑥",
    accentHexLight: "#9333EA",
    accentHexDark: "#C084FC",
    stages: ["secondary"],
    requiresGeometryEngine: true,
    requiresStatisticsEngine: false,
    defaultPromptGuidance: "التركيز على النهايات، الاتصال، الاشتقاق، تطبيقات القيم العظمى والصغرى، والتكامل المحدد وغير المحدد.",
  },
  statics: {
    id: "statics",
    nameArabic: "الاستاتيكا واتزان القوى",
    nameEnglish: "Statics",
    symbolBadge: "∑𝐹=0",
    accentHexLight: "#B45309",
    accentHexDark: "#F59E0B",
    stages: ["secondary"],
    requiresGeometryEngine: true,
    requiresStatisticsEngine: false,
    defaultPromptGuidance: "التركيز على محصلة القوى، الاتزان، العزوم، الاحتكاك على المستوى الأفقي والمائل، والازدواج.",
  },
  dynamics: {
    id: "dynamics",
    nameArabic: "الديناميكا وقوانين الحركة",
    nameEnglish: "Dynamics",
    symbolBadge: "𝐹=𝑚𝑎",
    accentHexLight: "#BE123C",
    accentHexDark: "#F43F5E",
    stages: ["secondary"],
    requiresGeometryEngine: true,
    requiresStatisticsEngine: false,
    defaultPromptGuidance: "التركيز على السرعة والعجلة، قوانين نيوتن للحركة، البكرات، الدفع والتصادم، والشغل والطاقة.",
  },
};

export const ALL_MATH_BRANCHES_LIST: readonly MathBranchDefinition[] = Object.values(MATH_BRANCHES_SSOT);
