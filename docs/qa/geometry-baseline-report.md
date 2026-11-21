# تقرير خط الأساس لدقة الأشكال الهندسية والرسوم (لوحة القياس v2 - المرحلة 0)

> تاريخ التوليد: 2026-11-21T18:04:48.222Z — يُولَّد آلياً بواسطة `tests/geo-baseline-measurement-runner.test.ts`. لا تعدّله يدوياً.

> [!IMPORTANT]
> العلامات الآلية **مؤشرات خطر ونظافة وليست حكماً نهائياً**. الدقة الحقيقية تُحسب فقط من خانة `humanVerdict` بعد المراجعة البشرية الصريحة.

## 1. الملخص التنفيذي ومؤشرات الدقة

- إجمالي الحالات في المجموعة الذهبية: **305** حالة (تغطي ابتدائي 3–6 وإعدادي 1–3)
- أنتج النظام شكلاً في: **247** (81.0%)
- شكل بلا أي علامة خطر آلية: **215** (70.5%)
- شكل بعلامات خطر آلية: **32** (10.5%)
- 🔴 شكل رُسم لمسألة لا يجب أن يُرسم لها (هلوسة زائدة): **0**
- شكل مفقود لمسألة تستحق شكلاً: **0**
- رفض صحيح لمسائل نظرية (لا شكل): **58**
- **الدقة المُثبتة بالمراجعة البشرية (Human Accuracy):** **لم تُراجَع أي حالة بعد**
- **مطابقة المواصفة المرجعية الآلية (expectedFigureSpec):** **98/105** (93.3%)

## 2. مؤشرات وعلامات الخطر الآلية

| العلامة الآلية | العدد |
|---|---|
| `from_fixed_catalog` | 32 |
| `missing_given_on_figure` | 4 |

### لوحة التغطية والدقة حسب الصف الدراسي

| المفتاح | الإجمالي | شكل بلا علامات | شكل بعلامات خطر | شكل على حالة بلا شكل | شكل مفقود | رفض صحيح | معتمد بشرياً | دقة مثبتة |
|---|---|---|---|---|---|---|---|---|
| prep-1 | 56 | 47 | 3 | 0 | 0 | 6 | 0/0 | — |
| prep-2 | 34 | 30 | 4 | 0 | 0 | 0 | 0/0 | — |
| prep-3 | 20 | 16 | 2 | 0 | 0 | 2 | 0/0 | — |
| primary-3 | 30 | 17 | 5 | 0 | 0 | 8 | 0/0 | — |
| primary-4 | 49 | 21 | 0 | 0 | 0 | 28 | 0/0 | — |
| primary-5 | 30 | 4 | 16 | 0 | 0 | 10 | 0/0 | — |
| primary-6 | 31 | 25 | 2 | 0 | 0 | 4 | 0/0 | — |
| unassigned | 55 | 55 | 0 | 0 | 0 | 0 | 0/0 | — |

### لوحة التغطية حسب الفرع الرياضي

| المفتاح | الإجمالي | شكل بلا علامات | شكل بعلامات خطر | شكل على حالة بلا شكل | شكل مفقود | رفض صحيح | معتمد بشرياً | دقة مثبتة |
|---|---|---|---|---|---|---|---|---|
| analytic_geometry | 5 | 2 | 3 | 0 | 0 | 0 | 0/0 | — |
| numbers | 67 | 26 | 3 | 0 | 0 | 38 | 0/0 | — |
| plane_geometry | 189 | 153 | 22 | 0 | 0 | 14 | 0/0 | — |
| primary_visual_models | 4 | 4 | 0 | 0 | 0 | 0 | 0/0 | — |
| solid_geometry | 5 | 0 | 3 | 0 | 0 | 2 | 0/0 | — |
| statistics_probability | 34 | 29 | 1 | 0 | 0 | 4 | 0/0 | — |
| trigonometry | 1 | 1 | 0 | 0 | 0 | 0 | 0/0 | — |

## 3. أبرز الحالات التي تستحق الفحص والتحسين

| الحالة | النتيجة | العلامات | المصدر | أرقام ناقصة | أرقام مسرّبة |
|---|---|---|---|---|---|
| prep-1-prep-grade1-triangle-angles-catalog-5 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 3، 10، 60، 70 | — |
| prep-1-prep-grade1-triangle-angles-catalog-7 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 16، 1، 80 | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-12 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 90 | — |
| prep-3-geometry-similarity-catalogs-and-smart-prompt-3 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 3، 1 | — |
| prep-1-prep-grade1-special-quads-followup-catalog-1 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-12 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-9 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-3-sim-notebooklm-06 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim3-grid-03 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim3-grid-05 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim3-geom-01 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim3-geom-02 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim3-geom-03 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim5-tri-01 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim5-tri-03 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim5-tri-05 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim5-para-01 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim5-para-02 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim5-para-03 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim5-coord-01 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim5-coord-02 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim5-coord-03 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim5-solid-01 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim5-solid-02 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim5-solid-03 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim5-numline-01 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim5-numline-02 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim5-numline-03 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prim5-stat-02 | figure_flagged | from_fixed_catalog | catalog | — | — |
| p6-geom-30-circle-radius | figure_flagged | from_fixed_catalog | catalog | — | — |
| p6-geom-31-circle-diameter | figure_flagged | from_fixed_catalog | catalog | — | — |

## 4. حالات عدم تطابق المواصفة المرجعية (`expectedFigureSpec`)

| الحالة | الملخص | التفاصيل |
|---|---|---|
| prep-3-geometry-similarity-catalogs-and-smart-prompt-3 | يوجد 5 تباين(ات): الرأس المتوقع (X) غير موجود بالشكل المولد ؛ الرأس المتوقع (Y) غير موجود بالشكل المولد ؛ الطول المتوقع (3) لم يُعرض كبطاقة على أي ضلع بالشكل ؛ الطول المتوقع (1) لم يُعرض كبطاقة على أي ضلع بالشكل ؛ الزاوية المتوقعة (90°) لم تُعرض كقوس قياس بالشكل | الرأس المتوقع (X) غير موجود بالشكل المولد ؛ الرأس المتوقع (Y) غير موجود بالشكل المولد ؛ الطول المتوقع (3) لم يُعرض كبطاقة على أي ضلع بالشكل ؛ الطول المتوقع (1) لم يُعرض كبطاقة على أي ضلع بالشكل ؛ الزاوية المتوقعة (90°) لم تُعرض كقوس قياس بالشكل |
| prep-3-sim-notebooklm-01 | يوجد 4 تباين(ات): الطول المتوقع (40) لم يُعرض كبطاقة على أي ضلع بالشكل ؛ الطول المتوقع (65) لم يُعرض كبطاقة على أي ضلع بالشكل ؛ الطول المتوقع (40) لم يُعرض كبطاقة على أي ضلع بالشكل ؛ الطول المتوقع (65) لم يُعرض كبطاقة على أي ضلع بالشكل | الطول المتوقع (40) لم يُعرض كبطاقة على أي ضلع بالشكل ؛ الطول المتوقع (65) لم يُعرض كبطاقة على أي ضلع بالشكل ؛ الطول المتوقع (40) لم يُعرض كبطاقة على أي ضلع بالشكل ؛ الطول المتوقع (65) لم يُعرض كبطاقة على أي ضلع بالشكل |
| prep-3-sim-notebooklm-08 | يوجد 1 تباين(ات): عائلة الشكل (triangle_family) تخالف المتوقع (circle_family) | عائلة الشكل (triangle_family) تخالف المتوقع (circle_family) |
| prim3-grid-01 | يوجد 1 تباين(ات): عائلة الشكل (primary_visual_models_family) تخالف المتوقع (quadrilateral_family) | عائلة الشكل (primary_visual_models_family) تخالف المتوقع (quadrilateral_family) |
| prim3-grid-02 | يوجد 1 تباين(ات): عائلة الشكل (primary_visual_models_family) تخالف المتوقع (quadrilateral_family) | عائلة الشكل (primary_visual_models_family) تخالف المتوقع (quadrilateral_family) |
| seed-18-algebraic-angle | يوجد 2 تباين(ات): الطول المتوقع (2) لم يُعرض كبطاقة على أي ضلع بالشكل ؛ الطول المتوقع (3) لم يُعرض كبطاقة على أي ضلع بالشكل | الطول المتوقع (2) لم يُعرض كبطاقة على أي ضلع بالشكل ؛ الطول المتوقع (3) لم يُعرض كبطاقة على أي ضلع بالشكل |
| intake-07 | يوجد 1 تباين(ات): الطول المتوقع (40) لم يُعرض كبطاقة على أي ضلع بالشكل | الطول المتوقع (40) لم يُعرض كبطاقة على أي ضلع بالشكل |
