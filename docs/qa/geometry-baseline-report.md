# تقرير خط الأساس لدقة الأشكال الهندسية (المرحلة 0)

> تاريخ التوليد: 2026-11-06T18:07:26.950Z — يُولَّد آلياً بواسطة `tests/geo-baseline-measurement-runner.test.ts`. لا تعدّله يدوياً.

> [!IMPORTANT]
> العلامات الآلية **مؤشرات خطر وليست حكماً نهائياً**. الدقة الحقيقية لا تُحسب إلا من خانة `humanVerdict` بعد المراجعة البشرية.

## الملخص

- إجمالي الحالات: **375**
- أنتج النظام شكلاً في: **275** (73.3%)
- شكل بلا أي علامة خطر آلية: **164** (43.7%)
- شكل بعلامات خطر: **111** (29.6%)
- 🔴 شكل رُسم لمسألة لا يجب أن يُرسم لها: **0**
- شكل مفقود لمسألة تستحق شكلاً: **60**
- رفض صحيح (لا شكل): **40**
- الدقة المُثبتة بشرياً: **لم تُراجَع أي حالة بعد**

## علامات الخطر

| العلامة | العدد |
|---|---|
| `from_fixed_catalog` | 109 |
| `missing_given_on_figure` | 8 |

### حسب الصف

| المفتاح | الإجمالي | شكل بلا علامات | شكل بعلامات خطر | شكل على حالة بلا شكل | شكل مفقود | رفض صحيح |
|---|---|---|---|---|---|---|
| prep-1 | 120 | 35 | 60 | 0 | 19 | 6 |
| prep-2 | 89 | 14 | 43 | 0 | 32 | 0 |
| prep-3 | 33 | 15 | 7 | 0 | 9 | 2 |
| primary-4 | 49 | 21 | 0 | 0 | 0 | 28 |
| primary-6 | 29 | 25 | 0 | 0 | 0 | 4 |
| unassigned | 55 | 54 | 1 | 0 | 0 | 0 |

### حسب الفرع

| المفتاح | الإجمالي | شكل بلا علامات | شكل بعلامات خطر | شكل على حالة بلا شكل | شكل مفقود | رفض صحيح |
|---|---|---|---|---|---|---|
| numbers | 49 | 21 | 0 | 0 | 0 | 28 |
| plane_geometry | 297 | 118 | 111 | 0 | 60 | 8 |
| statistics_probability | 29 | 25 | 0 | 0 | 0 | 4 |

## الحالات التي تستحق الفحص أولاً

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
| prep-1-prep-grade1-parallelism-catalog-12 | missed_figure | — | none | — | — |
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
| prep-2-prep-grade2-isosceles-triangle-catalog-12 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-13 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-1 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-2 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 3 | — |
| prep-2-prep-grade2-parallel-applications-catalog-3 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-6 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-7 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-8 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 90 | — |
| prep-2-prep-grade2-parallel-applications-catalog-9 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-10 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-11 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-12 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-1 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-2 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-3 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-7 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-8 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-9 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-10 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-1 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-2 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-5 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-7 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-8 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-9 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-10 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-11 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-12 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-7 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-8 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-13 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-16 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-1 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-2 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-7 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-8 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-9 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-10 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-11 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-13 | missed_figure | — | none | — | — |
| prep-3-geometry-similarity-catalogs-and-smart-prompt-1 | missed_figure | — | none | — | — |
| prep-3-geometry-similarity-catalogs-and-smart-prompt-2 | missed_figure | — | none | — | — |
| prep-3-geometry-similarity-catalogs-and-smart-prompt-3 | missed_figure | — | none | — | — |
| prep-3-geometry-similarity-catalogs-and-smart-prompt-4 | missed_figure | — | none | — | — |
| prep-3-geometry-similarity-catalogs-and-smart-prompt-5 | missed_figure | — | none | — | — |
| prep-3-geometry-similarity-catalogs-and-smart-prompt-6 | missed_figure | — | none | — | — |
| prep-3-geometry-similarity-catalogs-and-smart-prompt-7 | missed_figure | — | none | — | — |
| prep-3-geometry-similarity-catalogs-and-smart-prompt-11 | missed_figure | — | none | — | — |
| prep-3-prep-grade3-line-equation-catalog-1 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-3-prep-grade3-line-equation-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-3-prep-grade3-line-equation-catalog-4 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 1 | — |
| prep-3-prep-grade3-line-equation-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-3-prep-grade3-line-equation-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-3-prep-grade3-line-equation-catalog-7 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-3-prep-grade3-line-equation-catalog-8 | missed_figure | — | none | — | — |
| prep-3-prep-grade3-line-equation-catalog-10 | figure_flagged | from_fixed_catalog | catalog | — | — |
| intake-09 | figure_flagged | from_fixed_catalog | catalog | — | — |
