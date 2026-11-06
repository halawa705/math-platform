/**
 * @file studio-geometry-lab-quick-samples-data.ts
 * @description نماذج الفحص السريع لمناهج الابتدائي والإعدادي في معمل الأشكال الهندسية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 160 سطراً).
 */

export const MODULE_ID_STUDIO_GEOMETRY_LAB_QUICK_SAMPLES_DATA =
  "studio_geometry_lab_quick_samples_data" as const;

export interface GeometryLabQuickSample {
  readonly id: string;
  readonly label: string;
  readonly sampleText: string;
}

export const CURRICULUM_QUICK_SAMPLES: readonly GeometryLabQuickSample[] = [
  {
    id: "tri_sim_butterfly",
    label: "تشابه مثلثات: فراشة ومقص ΔABC ~ ΔADE",
    sampleText: "تشابه مثلثين متقابلين بالرأس عند A شكل مقص ΔABC ~ ΔADE وأطوال 10 سم و 12 سم و 8 سم و 18 سم",
  },
  {
    id: "tri_sim_nested_common",
    label: "تشابه مثلثات: زاوية مشتركة B (مثال 7)",
    sampleText: "تشابه مثلثين بزاوية مشتركة B وقاطع داخلي ΔABC ~ ΔDBA وقاعدة B-D-C وأطوال BD = 9 سم و DC = 27 سم و AB = 18 سم و AD = 12 سم",
  },
  {
    id: "tri_sim_thales_xy",
    label: "تشابه مثلثات: توازي طاليس XY || BC",
    sampleText: "تشابه مثلثين بتوازي طاليس XY || BC و ΔAXY ~ ΔABC وأطوال XY = 5 سم و BC = 10 سم",
  },
  {
    id: "tri_sim_euclid_alt",
    label: "تشابه مثلثات: إقليدس والقائم ΔADB ~ ΔBDC",
    sampleText: "تشابه المثلثات القائمة بإسقاط عمود BD ⊥ AC من رأس القائمة ونظرية إقليدس ΔADB ~ ΔBDC أطوال BD = 4.8 سم و AD = 6.4 سم",
  },
  {
    id: "tri_sim_antiparallel",
    label: "تشابه مثلثات: قاطع عكسي ΔABC ~ ΔADH",
    sampleText: "تشابه مثلثين بقاطع عكسي غير موازي ΔABC ~ ΔADH حيث زاوية C تطابق زاوية ADH وأطوال AD = 7 سم و AH = 6 سم و HB = 8 سم",
  },
  {
    id: "tri_sim_separate_120",
    label: "تشابه مثلثات: منفصلان بزاوية 120° (مثال 6)",
    sampleText: "تشابه مثلثين منفصلين بزاوية 120° ΔABC ~ ΔDEF أطوال الأول 7.5 سم و 4.5 سم و 10.5 سم والثاني 5 سم و 3 سم",
  },
  {
    id: "sim_quad_radicals",
    label: "تشابه مضلعات: جذور وزوايا (مثال 2)",
    sampleText: "مضلعان رباعيان متشابهان ABCD ~ EFGH ، أطوال الأول AB = 6.5 سم و BC = 8 سم و CD = 5 سم و DA = 1.5√3 سم وزاوية A قائمة وزاوية C = 60° وزاوية B = x° ، والثاني EF = (y - 1/3) سم و FG = z سم و HE = √3 سم وزاوية E قائمة وزاوية H = 150°",
  },
  {
    id: "sim_trapezoid_vars",
    label: "تشابه مضلعات: شبه منحرف بمجاهيل X و Y",
    sampleText: "شبه منحرف قائم الزاوية متشابه بمجاهيل جبرية أطوال قاعدتيه X - 3 و Y + 1 وارتفاع 12 سم وقاعدة 16 سم وارتفاع 8 سم",
  },
  {
    id: "sim_house_pentagon",
    label: "تشابه مضلعات: خماسيان شكل منزل",
    sampleText: "مضلعان خماسيان متشابهان ABCDE ~ KFGHJ على شكل منزل قاعدة الأول 6 سم وقواعد الثاني 18 سم و 15 سم و 12 سم و 9 سم",
  },
  {
    id: "line_eq_intercepts",
    label: "هندسة 3ع: مستقيم يقطع جزأين متساويين",
    sampleText: "الشكل المقابل يمثل AB الذي معادلته y = k X + c ويقطع من محوري الإحداثيات جزأين متساويين في الطول ويمر بالنقطة (2 , 3)",
  },
  {
    id: "line_eq_rhombus",
    label: "هندسة 3ع: معين OADB ومعادلة OD",
    sampleText: "النقط O(0,0) ، A(2,6) ، B(6,2) ، D رؤوس معين أوجد معادلة OD و m(∠ DOH)",
  },
  {
    id: "g4_rect_area_perim",
    label: "هندسة 4ب: مستطيل لحساب المساحة والمحيط",
    sampleText: "مستطيل أبعاده 12 سم و 4 سم لحساب المحيط والمساحة",
  },
  {
    id: "g4_square_rotated",
    label: "هندسة 4ب: مربع مائل 8 سم",
    sampleText: "مربع مائل طول ضلعه 8 سم لحساب المحيط",
  },
  {
    id: "g4_unknown_rect_perimeter",
    label: "هندسة 4ب: مجهول x بمحيط المستطيل 24 سم",
    sampleText: "أوجد طول الضلع المجهول x في المستطيل الذي محيطه 24 سم وطوله 8 سم",
  },
  {
    id: "g4_unknown_rect_area",
    label: "هندسة 4ب: مجهول x بمساحة المستطيل 30 سم²",
    sampleText: "أوجد طول الضلع المجهول x في المستطيل الذي مساحته 30 سم² وعرضه 5 سم",
  },
  {
    id: "g4_unknown_square_perimeter",
    label: "هندسة 4ب: مجهول y بمحيط المربع 28 سم",
    sampleText: "أوجد طول الضلع المجهول y في المربع الذي محيطه 28 سم",
  },
  {
    id: "g4_composite_l_shape",
    label: "هندسة 4ب: شكل مركب حرف L بمجاهيل a و b",
    sampleText: "شكل مركب حرف L أبعاده 8 سم و 9 سم و 3 سم و 1 سم والضلعان المجهولان a و b",
  },
  {
    id: "g4_composite_t_shape",
    label: "هندسة 4ب: شكل مركب حرف T (11 سم)",
    sampleText: "شكل مركب حرف T عرضه العلوي 11 سم وارتفاع رأسه 2 سم وساقه 5 سم و 5 سم لحساب المحيط والمساحة",
  },
  {
    id: "g4_composite_arch_u",
    label: "هندسة 4ب: قوس مجوف U مقلوب (10 كم)",
    sampleText: "شكل قوس مجوف U مقلوب عرضه العلوي 10 كم وارتفاعه 8 كم وتجويف وسطي مجهول b وقاعدتان 4 كم ومجهول a",
  },
  {
    id: "g4_composite_adjacent_rects",
    label: "هندسة 4ب: مستطيلان ملتصقان (شكل الدرج)",
    sampleText: "شكل مركب من مستطيلين ملتصقين أبعادهما 5 سم و 5 سم و 3 سم و 3 سم لحساب المساحة والمحيط",
  },
  {
    id: "g6_stat_boxplot",
    label: "إحصاء 6ب: مخطط الصندوق والربيعيات (الخماسي القياسي)",
    sampleText: "مخطط الصندوق والطرفين للبيانات بتدريج من 5 إلى 50 والحد الأدنى 10 والربع الأول 20 والوسيط 25 والربع الثالث 40 والحد الأقصى 50",
  },
  {
    id: "g6_stat_dotplot_time",
    label: "إحصاء 6ب: مخطط التمثيل بالنقاط (الزمن المستغرق)",
    sampleText: "مخطط التمثيل بالنقاط يوضح الزمن المستغرق في إنجاز الواجبات المنزلية بالدقائق",
  },
  {
    id: "g6_stat_dotplot_siblings",
    label: "إحصاء 6ب: مخطط النقاط والقيمة المتطرفة (عدد الإخوة)",
    sampleText: "مخطط التمثيل بالنقاط لعدد الإخوة لكل تلميذ وتحديد القيمة المتطرفة عند 10",
  },
  {
    id: "g6_stat_histogram_scores",
    label: "إحصاء 6ب: المدرج التكراري (درجات الاختبار)",
    sampleText: "المدرج التكراري يمثل درجات الاختبار بالفترات 51-60 و 61-70 و 71-80 و 81-90 و 91-100",
  },
  {
    id: "g6_stat_histogram_ages",
    label: "إحصاء 6ب: المدرج التكراري (أعمار بعض الأشخاص)",
    sampleText: "المدرج التكراري يمثل أعمار بعض الأشخاص بالفترات وفترة تكرارها صفر 31-37",
  },
  {
    id: "g6_stat_barchart_tv",
    label: "إحصاء 6ب: التمثيل البياني بالأعمدة (عروض التليفزيون)",
    sampleText: "التمثيل البياني بالأعمدة المنفصلة يوضح عروض التليفزيون المفضلة",
  },
] as const;
