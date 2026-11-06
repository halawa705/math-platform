# تقرير خط الأساس لدقة الأشكال الهندسية والرسوم (لوحة القياس v2 - المرحلة 0)

> تاريخ التوليد: 2026-11-06T21:04:06.751Z — يُولَّد آلياً بواسطة `tests/geo-baseline-measurement-runner.test.ts`. لا تعدّله يدوياً.

> [!IMPORTANT]
> العلامات الآلية **مؤشرات خطر ونظافة وليست حكماً نهائياً**. الدقة الحقيقية تُحسب فقط من خانة `humanVerdict` بعد المراجعة البشرية الصريحة.

## 1. الملخص التنفيذي ومؤشرات الدقة

- إجمالي الحالات في المجموعة الذهبية: **437** حالة (تغطي ابتدائي 3–6 وإعدادي 1–3)
- أنتج النظام شكلاً في: **308** (70.5%)
- شكل بلا أي علامة خطر آلية: **173** (39.6%)
- شكل بعلامات خطر آلية: **131** (30.0%)
- 🔴 شكل رُسم لمسألة لا يجب أن يُرسم لها (هلوسة زائدة): **4**
- شكل مفقود لمسألة تستحق شكلاً: **75**
- رفض صحيح لمسائل نظرية (لا شكل): **54**
- **الدقة المُثبتة بالمراجعة البشرية (Human Accuracy):** **لم تُراجَع أي حالة بعد**
- **مطابقة المواصفة المرجعية الآلية (expectedFigureSpec):** **72/111** (64.9%)

## 2. مؤشرات وعلامات الخطر الآلية

| العلامة الآلية | العدد |
|---|---|
| `from_fixed_catalog` | 131 |
| `missing_given_on_figure` | 13 |
| `leaked_number_not_in_text` | 4 |

### لوحة التغطية والدقة حسب الصف الدراسي

| المفتاح | الإجمالي | شكل بلا علامات | شكل بعلامات خطر | شكل على حالة بلا شكل | شكل مفقود | رفض صحيح | معتمد بشرياً | دقة مثبتة |
|---|---|---|---|---|---|---|---|---|
| prep-1 | 120 | 35 | 61 | 0 | 18 | 6 | 0/0 | — |
| prep-2 | 89 | 14 | 43 | 0 | 32 | 0 | 0/0 | — |
| prep-3 | 33 | 15 | 7 | 0 | 9 | 2 | 0/0 | — |
| primary-3 | 30 | 7 | 10 | 0 | 5 | 8 | 0/0 | — |
| primary-4 | 49 | 21 | 0 | 0 | 0 | 28 | 0/0 | — |
| primary-5 | 30 | 1 | 10 | 4 | 9 | 6 | 0/0 | — |
| primary-6 | 31 | 25 | 0 | 0 | 2 | 4 | 0/0 | — |
| unassigned | 55 | 55 | 0 | 0 | 0 | 0 | 0/0 | — |

### لوحة التغطية حسب الفرع الرياضي

| المفتاح | الإجمالي | شكل بلا علامات | شكل بعلامات خطر | شكل على حالة بلا شكل | شكل مفقود | رفض صحيح | معتمد بشرياً | دقة مثبتة |
|---|---|---|---|---|---|---|---|---|
| analytic_geometry | 3 | 0 | 0 | 0 | 3 | 0 | 0/0 | — |
| numbers | 67 | 21 | 3 | 1 | 5 | 37 | 0/0 | — |
| plane_geometry | 324 | 122 | 122 | 2 | 66 | 12 | 0/0 | — |
| primary_visual_models | 4 | 4 | 0 | 0 | 0 | 0 | 0/0 | — |
| solid_geometry | 5 | 0 | 2 | 1 | 1 | 1 | 0/0 | — |
| statistics_probability | 34 | 26 | 4 | 0 | 0 | 4 | 0/0 | — |

## 3. أبرز الحالات التي تستحق الفحص والتحسين

| الحالة | النتيجة | العلامات | المصدر | أرقام ناقصة | أرقام مسرّبة |
|---|---|---|---|---|---|
| prep-1-prep-grade1-angles-followup-catalog-1 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-followup-catalog-2 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-angles-followup-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-followup-catalog-4 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-angles-followup-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-followup-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-followup-catalog-7 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-angles-followup-catalog-8 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-followup-catalog-9 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-angles-followup-catalog-10 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-angles-followup-catalog-11 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-1 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-2 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-6 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-7 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-8 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-9 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-10 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-11 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-coordinates-catalog-1 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-coordinates-catalog-2 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-coordinates-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-coordinates-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-coordinates-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-coordinates-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-1 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-2 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-parallelism-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-6 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-parallelism-catalog-7 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-8 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-parallelism-catalog-9 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-10 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-11 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-12 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-13 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-polygons-catalog-1 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-polygons-catalog-2 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-polygons-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-polygons-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-polygons-catalog-5 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 5 | — |
| prep-1-prep-grade1-polygons-catalog-6 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 3 | — |
| prep-1-prep-grade1-polygons-catalog-7 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 6 | — |
| prep-1-prep-grade1-polygons-catalog-8 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-quadrilaterals-catalog-1 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-quadrilaterals-catalog-2 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-quadrilaterals-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-quadrilaterals-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-quadrilaterals-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-quadrilaterals-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-quadrilaterals-catalog-7 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-quadrilaterals-catalog-8 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-quadrilaterals-catalog-10 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-quadrilaterals-catalog-11 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-quadrilaterals-catalog-12 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-special-quads-followup-catalog-2 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-special-quads-followup-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-special-quads-followup-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-special-quads-followup-catalog-6 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-special-quads-followup-catalog-7 | figure_flagged | missing_given_on_figure | compositor | 7، 11، 5، 1 | — |
| prep-1-prep-grade1-special-quads-followup-catalog-8 | figure_flagged | missing_given_on_figure | compositor | 4، 5، 3 | — |
| prep-1-prep-grade1-triangle-angles-catalog-1 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-2 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-4 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-7 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-8 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-9 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-10 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-11 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-12 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-angle-fan-12 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-1 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-2 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-3 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-7 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-8 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-9 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-10 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-11 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-12 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-1 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-2 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-3 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-5 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-8 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-9 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-10 | missed_figure | — | none | — | — |
