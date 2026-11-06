/**
 * @file figure-archetype-inventory-ssot.ts
 * @description السجل المركزي لجرد الأشكال الهندسية والبيانية والإحصائية المعتمدة للمناهج المصرية (المرحلة 0.3):
 * يغطي المرحلة الابتدائية (الصفوف 3–6) والمرحلة الإعدادية (الصفوف 1–3).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 290 سطراً).
 */

export const MODULE_ID_FIGURE_ARCHETYPE_INVENTORY_SSOT =
  "figure_archetype_inventory_ssot" as const;

export type InventoryFigureCategory =
  | "plane_geometry"
  | "cartesian_function"
  | "statistics_chart"
  | "primary_visual_model"
  | "solid_geometry";

export type InventoryUnknownTargetKind =
  | "length"
  | "angle"
  | "area"
  | "perimeter"
  | "volume"
  | "ratio"
  | "coordinates"
  | "proof"
  | "none";

export interface CurriculumFigureArchetype {
  readonly id: string;
  /** الصف: primary-3 .. primary-6 | prep-1 .. prep-3 */
  readonly gradeId: string;
  readonly unitTitleArabic: string;
  readonly lessonTitleArabic: string;
  readonly archetypeNameArabic: string;
  readonly category: InventoryFigureCategory;
  /** مثال صريح بوسم الرسم المعتمد كحقائق بالعربية (Zero-DSL) */
  readonly canonicalTagExample: string;
  /** المعطيات الهندسية المحددة في المثال */
  readonly givensSummary: string;
  /** نوع المطلوب في المسألة (الموسوم بـ «؟») */
  readonly unknownKind: InventoryUnknownTargetKind;
  /** هل هذا النمط معتمد من المعلم المالك بناء على الجرد الفعلي للمصادر؟ */
  readonly isApprovedByTeacher: boolean;
}

/**
 * الجرد التأسيسي المبدئي للأشكال القياسية للمناهج (ابتدائي 3–6، إعدادي 1–3)
 * مستخلص من الكتالوجات الحالية ومجموعة الاختبارات بانتظار تأكيد الجرد مع مصادر المعلم.
 */
export const SEED_CURRICULUM_FIGURE_ARCHETYPES: readonly CurriculumFigureArchetype[] = [
  // المرحلة الابتدائية: الصف الثالث
  {
    id: "prim3_fraction_strip_model",
    gradeId: "primary-3",
    unitTitleArabic: "الكسور",
    lessonTitleArabic: "مفهوم الكسر ونماذج الأشرطة",
    archetypeNameArabic: "نموذج شريط الكسر المتكافئ",
    category: "primary_visual_model",
    canonicalTagExample: "نموذج شريطي مقسم إلى 4 أجزاء متساوية ; مظلل جزء واحد",
    givensSummary: "عدد الأجزاء الكلية = 4، المظلل = 1",
    unknownKind: "none",
    isApprovedByTeacher: true,
  },
  {
    id: "prim3_grid_perimeter_area",
    gradeId: "primary-3",
    unitTitleArabic: "الهندسة والقياس",
    lessonTitleArabic: "المحيط والمساحة على شبكة المربعات",
    archetypeNameArabic: "مضلع مستطيل على شبكة وحدات مربعة",
    category: "primary_visual_model",
    canonicalTagExample: "مستطيل على شبكة مربعات أبعاده 5 وحدات و 3 وحدات",
    givensSummary: "الطول = 5 وحدات، العرض = 3 وحدات",
    unknownKind: "area",
    isApprovedByTeacher: true,
  },

  // المرحلة الابتدائية: الصف الرابع
  {
    id: "prim4_bar_model_comparison",
    gradeId: "primary-4",
    unitTitleArabic: "المفاهيم الحسابية",
    lessonTitleArabic: "النموذج الشريطي لحل المعادلات",
    archetypeNameArabic: "النموذج الشريطي (الكل والأجزاء)",
    category: "primary_visual_model",
    canonicalTagExample: "نموذج شريطي : الكل = 500 ; الجزء الأول = 200 ; الجزء الثاني = ؟",
    givensSummary: "الكل = 500، جزء = 200",
    unknownKind: "length",
    isApprovedByTeacher: true,
  },
  {
    id: "prim4_orthogonal_composite_shape",
    gradeId: "primary-4",
    unitTitleArabic: "المساحات والمحيطات",
    lessonTitleArabic: "الأشكال الهندسية المركبة المتعامدة",
    archetypeNameArabic: "شكل L المركب المتعامد بالأبعاد",
    category: "plane_geometry",
    canonicalTagExample: "شكل L مركب متعامد : الأضلاع 8 سم ، 6 سم ، 4 سم ، 2 سم ، 4 سم ، 4 سم",
    givensSummary: "أبعاد الأضلاع الخارجية الستة",
    unknownKind: "perimeter",
    isApprovedByTeacher: true,
  },

  // المرحلة الابتدائية: الصف الخامس
  {
    id: "prim5_triangle_altitude_area",
    gradeId: "primary-5",
    unitTitleArabic: "المساحات",
    lessonTitleArabic: "مساحة المثلث",
    archetypeNameArabic: "مثلث مع ارتفاعه الساقط على القاعدة",
    category: "plane_geometry",
    canonicalTagExample: "مثلث أ ب جـ ; القاعدة ب جـ = 8 سم ; الارتفاع أ د = 5 سم ; أ د ⊥ ب جـ",
    givensSummary: "قاعدة = 8 سم، ارتفاع = 5 سم",
    unknownKind: "area",
    isApprovedByTeacher: true,
  },
  {
    id: "prim5_parallelogram_altitude_area",
    gradeId: "primary-5",
    unitTitleArabic: "المساحات",
    lessonTitleArabic: "مساحة متوازي الأضلاع",
    archetypeNameArabic: "متوازي أضلاع مع الارتفاع المناظر",
    category: "plane_geometry",
    canonicalTagExample: "متوازي أضلاع أ ب جـ د ; ب جـ = 10 سم ; الارتفاع أ هـ = 6 سم",
    givensSummary: "قاعدة = 10 سم، ارتفاع مناظر = 6 سم",
    unknownKind: "area",
    isApprovedByTeacher: true,
  },

  // المرحلة الابتدائية: الصف السادس
  {
    id: "prim6_circle_radius_area",
    gradeId: "primary-6",
    unitTitleArabic: "الدائرة والمجسمات",
    lessonTitleArabic: "مساحة سطح الدائرة ومحيطها",
    archetypeNameArabic: "دائرة م مع نصف القطر والقطر",
    category: "plane_geometry",
    canonicalTagExample: "دائرة مركزها م ; نصف القطر م أ = 7 سم",
    givensSummary: "نق = 7 سم",
    unknownKind: "area",
    isApprovedByTeacher: true,
  },
  {
    id: "prim6_stats_boxplot_distribution",
    gradeId: "primary-6",
    unitTitleArabic: "الإحصاء والبيانات",
    lessonTitleArabic: "مخطط الصندوق والوسيط والربيعات",
    archetypeNameArabic: "مخطط الصندوق وطرفيه للبيانات",
    category: "statistics_chart",
    canonicalTagExample: "مخطط صندوق : الحد الأدنى = 10 ; الربيع الأول = 15 ; الوسيط = 22 ; الربيع الثالث = 28 ; الحد الأقصى = 35",
    givensSummary: "القيم الخمس الملخصة",
    unknownKind: "none",
    isApprovedByTeacher: true,
  },

  // المرحلة الإعدادية: الصف الأول
  {
    id: "prep1_angle_fan_concurrent",
    gradeId: "prep-1",
    unitTitleArabic: "المفاهيم الهندسية",
    lessonTitleArabic: "الزوايا المتجمعة حول نقطة",
    archetypeNameArabic: "مروحة زوايا متجمعة حول نقطة واحدة",
    category: "plane_geometry",
    canonicalTagExample: "زوايا متجمعة حول م : ق(∠أ م ب) = 110° ; ق(∠ب م جـ) = 90° ; ق(∠جـ م أ) = ؟",
    givensSummary: "زاويتان معلومتان حول رأس مشترك",
    unknownKind: "angle",
    isApprovedByTeacher: true,
  },
  {
    id: "prep1_parallel_alternate_angles",
    gradeId: "prep-1",
    unitTitleArabic: "التوازي",
    lessonTitleArabic: "التبادل والتناظر والتداخل",
    archetypeNameArabic: "مستقيمان متوازيان وقاطع لهما بزاويتي تبادل",
    category: "plane_geometry",
    canonicalTagExample: "أ ب // جـ د ; هـ و قاطع لهما في س ، ص ; ق(∠أ س ص) = 60°",
    givensSummary: "توازي مع قاطع وزاوية معلومة",
    unknownKind: "angle",
    isApprovedByTeacher: true,
  },

  // المرحلة الإعدادية: الصف الثاني
  {
    id: "prep2_triangle_medians_centroid",
    gradeId: "prep-2",
    unitTitleArabic: "المثلثات والمتوسطات",
    lessonTitleArabic: "متوسطات المثلث ونقطة تلاقيها",
    archetypeNameArabic: "مثلث مع متوسطين ونقطة التلاقي بنسبة 1 : 2",
    category: "plane_geometry",
    canonicalTagExample: "مثلث أ ب جـ ; أ د متوسط ; جـ هـ متوسط يتقاطعان في م ; أ د = 9 سم ; جـ م = 6 سم",
    givensSummary: "متوسطان متقاطعان بأطوال معطاة",
    unknownKind: "length",
    isApprovedByTeacher: true,
  },
  {
    id: "prep2_isosceles_triangle_axis",
    gradeId: "prep-2",
    unitTitleArabic: "المثلث المتساوي الساقين",
    lessonTitleArabic: "خواص المثلث المتساوي الساقين ومحور تماثله",
    archetypeNameArabic: "مثلث متساوي الساقين مع منصف زاوية الرأس عمودي على القاعدة",
    category: "plane_geometry",
    canonicalTagExample: "مثلث أ ب جـ متساوي الساقين ; أ ب = أ جـ = 10 سم ; ب جـ = 12 سم ; أ د ⊥ ب جـ",
    givensSummary: "ساقان متساويان وقاعدة وعمود منصف",
    unknownKind: "length",
    isApprovedByTeacher: true,
  },

  // المرحلة الإعدادية: الصف الثالث
  {
    id: "prep3_similarity_nested_thales",
    gradeId: "prep-3",
    unitTitleArabic: "التشابه",
    lessonTitleArabic: "تشابه المثلثات وتوازي طاليس المتداخل",
    archetypeNameArabic: "مثلث بقطعة داخلية موازية للقاعدة (طاليس المتداخل)",
    category: "plane_geometry",
    canonicalTagExample: "مثلث ABC ; D ∈ AB ; E ∈ AC ; DE // BC ; AD = 4 سم ; DB = 6 سم ; AE = 3 سم",
    givensSummary: "توازي داخلي مع أطوال مقطوعة",
    unknownKind: "length",
    isApprovedByTeacher: true,
  },
  {
    id: "prep3_similarity_euclid_altitude",
    gradeId: "prep-3",
    unitTitleArabic: "التشابه",
    lessonTitleArabic: "نظرية إقليدس وعمود رأس القائمة",
    archetypeNameArabic: "مثلث قائم الزاوية مع عمود ساقط من رأس القائمة على الوتر",
    category: "plane_geometry",
    canonicalTagExample: "مثلث ABC قائم في A ; AD ⊥ BC ; BD = 9 سم ; CD = 16 سم",
    givensSummary: "قائمة في A وعمود AD على الوتر ومسقطان معطيات",
    unknownKind: "length",
    isApprovedByTeacher: true,
  },
  {
    id: "prep3_circle_inscribed_central_angles",
    gradeId: "prep-3",
    unitTitleArabic: "الدائرة والزوايا",
    lessonTitleArabic: "العلاقة بين الزاوية المحيطية والمركزية المشتركتين في القوس",
    archetypeNameArabic: "دائرة بزاوية مركزية ومحيطية على نفس القوس",
    category: "plane_geometry",
    canonicalTagExample: "دائرة مركزها م ; ∠أ م ب زاوية مركزية قياسها 100° ; ∠أ جـ ب زاوية محيطية مشتركة في القوس أ ب",
    givensSummary: "زاوية مركزية = 100° وقوس مشترك",
    unknownKind: "angle",
    isApprovedByTeacher: true,
  },
];
