# تقرير خط الأساس لدقة الأشكال الهندسية (المرحلة 0)

> تاريخ التوليد: 2026-11-05T20:49:35.650Z — يُولَّد آلياً بواسطة `tests/geo-baseline-measurement-runner.test.ts`. لا تعدّله يدوياً.

> [!IMPORTANT]
> العلامات الآلية **مؤشرات خطر وليست حكماً نهائياً**. الدقة الحقيقية لا تُحسب إلا من خانة `humanVerdict` بعد المراجعة البشرية.

## الملخص

- إجمالي الحالات: **375**
- أنتج النظام شكلاً في: **314** (83.7%)
- شكل بلا أي علامة خطر آلية: **123** (32.8%)
- شكل بعلامات خطر: **191** (50.9%)
- 🔴 شكل رُسم لمسألة لا يجب أن يُرسم لها: **0**
- شكل مفقود لمسألة تستحق شكلاً: **21**
- رفض صحيح (لا شكل): **40**
- الدقة المُثبتة بشرياً: **لم تُراجَع أي حالة بعد**

## علامات الخطر

| العلامة | العدد |
|---|---|
| `from_fixed_catalog` | 144 |
| `missing_given_on_figure` | 63 |
| `compositor_warnings` | 24 |
| `verification_error` | 20 |
| `leaked_number_not_in_text` | 16 |

### حسب الصف

| المفتاح | الإجمالي | شكل بلا علامات | شكل بعلامات خطر | شكل على حالة بلا شكل | شكل مفقود | رفض صحيح |
|---|---|---|---|---|---|---|
| prep-1 | 120 | 25 | 83 | 0 | 6 | 6 |
| prep-2 | 89 | 1 | 79 | 0 | 9 | 0 |
| prep-3 | 33 | 11 | 14 | 0 | 6 | 2 |
| primary-4 | 49 | 21 | 0 | 0 | 0 | 28 |
| primary-6 | 29 | 25 | 0 | 0 | 0 | 4 |
| unassigned | 55 | 40 | 15 | 0 | 0 | 0 |

### حسب الفرع

| المفتاح | الإجمالي | شكل بلا علامات | شكل بعلامات خطر | شكل على حالة بلا شكل | شكل مفقود | رفض صحيح |
|---|---|---|---|---|---|---|
| numbers | 49 | 21 | 0 | 0 | 0 | 28 |
| plane_geometry | 297 | 77 | 191 | 0 | 21 | 8 |
| statistics_probability | 29 | 25 | 0 | 0 | 0 | 4 |

## الحالات التي تستحق الفحص أولاً

| الحالة | النتيجة | العلامات | المصدر | أرقام ناقصة | أرقام مسرّبة |
|---|---|---|---|---|---|
| prep-1-prep-grade1-angles-followup-catalog-1 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-followup-catalog-2 | figure_flagged | missing_given_on_figure | compositor | 140 | — |
| prep-1-prep-grade1-angles-followup-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-followup-catalog-4 | figure_flagged | missing_given_on_figure | compositor | 80، 2 | — |
| prep-1-prep-grade1-angles-followup-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-followup-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-followup-catalog-7 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-followup-catalog-8 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-followup-catalog-9 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-followup-catalog-10 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-followup-catalog-11 | figure_flagged | missing_given_on_figure | compositor | 120 | — |
| prep-1-prep-grade1-angles-relationships-catalog-1 | figure_flagged | missing_given_on_figure | compositor | 25 | — |
| prep-1-prep-grade1-angles-relationships-catalog-2 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-5 | figure_flagged | missing_given_on_figure | compositor | 35 | — |
| prep-1-prep-grade1-angles-relationships-catalog-6 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-7 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-8 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-9 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-10 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-11 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-coordinates-catalog-1 | figure_flagged | leaked_number_not_in_text، from_fixed_catalog | catalog | — | 0 |
| prep-1-prep-grade1-coordinates-catalog-2 | figure_flagged | leaked_number_not_in_text، from_fixed_catalog | catalog | — | 0 |
| prep-1-prep-grade1-coordinates-catalog-3 | figure_flagged | leaked_number_not_in_text، from_fixed_catalog | catalog | — | 1، 0، 6 |
| prep-1-prep-grade1-coordinates-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-coordinates-catalog-5 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-coordinates-catalog-6 | figure_flagged | leaked_number_not_in_text، from_fixed_catalog | catalog | — | 0، 6 |
| prep-1-prep-grade1-parallelism-catalog-1 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-2 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-3 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-4 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-5 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-6 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-7 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-8 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-9 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-10 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-11 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-12 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-parallelism-catalog-13 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-polygons-catalog-1 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-polygons-catalog-2 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-polygons-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-polygons-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-polygons-catalog-5 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 5 | — |
| prep-1-prep-grade1-polygons-catalog-6 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 3 | — |
| prep-1-prep-grade1-polygons-catalog-7 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 6 | — |
| prep-1-prep-grade1-polygons-catalog-8 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-quadrilaterals-catalog-1 | figure_flagged | compositor_warnings، from_fixed_catalog | catalog | — | — |
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
| prep-1-prep-grade1-special-quads-followup-catalog-2 | figure_flagged | compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-special-quads-followup-catalog-3 | figure_flagged | compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-special-quads-followup-catalog-5 | figure_flagged | compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-special-quads-followup-catalog-6 | figure_flagged | missing_given_on_figure، leaked_number_not_in_text، compositor_warnings، from_fixed_catalog | catalog | 5، 4، 2، 1 | 90 |
| prep-1-prep-grade1-special-quads-followup-catalog-7 | figure_flagged | missing_given_on_figure | compositor | 7، 11، 5، 1 | — |
| prep-1-prep-grade1-special-quads-followup-catalog-8 | figure_flagged | missing_given_on_figure | compositor | 4، 5، 3 | — |
| prep-1-prep-grade1-triangle-angles-catalog-1 | figure_flagged | missing_given_on_figure | compositor | 126 | — |
| prep-1-prep-grade1-triangle-angles-catalog-2 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-4 | figure_flagged | verification_error، compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-7 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-8 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-9 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-10 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-11 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 120 | — |
| prep-1-prep-grade1-triangle-angles-catalog-12 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-angle-fan-05 | figure_flagged | missing_given_on_figure | compositor | 90 | — |
| prep-1-angle-fan-07 | figure_flagged | leaked_number_not_in_text | compositor | — | 20 |
| prep-1-angle-fan-08 | figure_flagged | leaked_number_not_in_text | compositor | — | 57.5 |
| prep-1-angle-fan-11 | figure_flagged | missing_given_on_figure | compositor | 90 | — |
| prep-1-angle-fan-12 | missed_figure | — | none | — | — |
| prep-1-angle-fan-20 | figure_flagged | missing_given_on_figure | compositor | 90 | — |
| prep-1-angle-fan-24 | figure_flagged | leaked_number_not_in_text | compositor | — | 55 |
| prep-1-angle-fan-26 | figure_flagged | leaked_number_not_in_text | compositor | — | 45 |
| prep-1-angle-fan-29 | figure_flagged | leaked_number_not_in_text | compositor | — | 55 |
| prep-1-angle-fan-30 | figure_flagged | missing_given_on_figure | compositor | 90 | — |
| prep-1-angle-fan-33 | figure_flagged | missing_given_on_figure، leaked_number_not_in_text | compositor | 140 | 45 |
| prep-2-prep-grade2-isosceles-followup-catalog-1 | figure_flagged | compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-2 | figure_flagged | missing_given_on_figure، leaked_number_not_in_text، from_fixed_catalog | catalog | 18 | 13 |
| prep-2-prep-grade2-isosceles-followup-catalog-3 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-7 | figure_flagged | compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-8 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-9 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-10 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-11 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-12 | figure_flagged | leaked_number_not_in_text، from_fixed_catalog | catalog | — | 5، 2 |
| prep-2-prep-grade2-isosceles-triangle-catalog-1 | figure_flagged | compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-2 | figure_flagged | compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-3 | figure_flagged | missing_given_on_figure | compositor | 30 | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-4 | figure_flagged | leaked_number_not_in_text، verification_error، compositor_warnings | compositor | — | 5 |
| prep-2-prep-grade2-isosceles-triangle-catalog-5 | figure_flagged | missing_given_on_figure | compositor | 120 | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-8 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-9 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-10 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-11 | figure_flagged | compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-12 | figure_flagged | missing_given_on_figure، verification_error، compositor_warnings، from_fixed_catalog | catalog | 90 | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-13 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-1 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-2 | figure_flagged | missing_given_on_figure، verification_error، from_fixed_catalog | catalog | 2، 3 | — |
| prep-2-prep-grade2-parallel-applications-catalog-3 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-6 | figure_flagged | missing_given_on_figure، compositor_warnings، from_fixed_catalog | catalog | 90 | — |
| prep-2-prep-grade2-parallel-applications-catalog-7 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-8 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 90 | — |
| prep-2-prep-grade2-parallel-applications-catalog-9 | figure_flagged | missing_given_on_figure، compositor_warnings، from_fixed_catalog | catalog | 3 | — |
| prep-2-prep-grade2-parallel-applications-catalog-10 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 4 | — |
| prep-2-prep-grade2-parallel-applications-catalog-11 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-12 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-1 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-2 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-3 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-7 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-8 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-9 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-10 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-1 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-2 | figure_flagged | missing_given_on_figure | compositor | 90، 7، 24، 20، 15 | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-3 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 90 | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-7 | figure_flagged | leaked_number_not_in_text، from_fixed_catalog | catalog | — | 5 |
| prep-2-prep-grade2-pythagoras-converse-catalog-8 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-9 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 90 | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-10 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 90 | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-11 | figure_flagged | missing_given_on_figure، compositor_warnings، from_fixed_catalog | catalog | 90 | — |
| prep-2-prep-grade2-pythagoras-converse-catalog-12 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-1 | figure_flagged | compositor_warnings | compositor | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-2 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-7 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-8 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-9 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-10 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-11 | figure_flagged | leaked_number_not_in_text، from_fixed_catalog | catalog | — | 1 |
| prep-2-prep-grade2-triangle-congruence-catalog-12 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-13 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-14 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-15 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-16 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-congruence-catalog-17 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-1 | figure_flagged | missing_given_on_figure | compositor | 9، 8 | — |
| prep-2-prep-grade2-triangle-medians-catalog-2 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-4 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 36 | — |
| prep-2-prep-grade2-triangle-medians-catalog-5 | figure_flagged | compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-6 | figure_flagged | compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-7 | figure_flagged | compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-8 | figure_flagged | compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-9 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-10 | figure_flagged | missing_given_on_figure | compositor | 9 | — |
| prep-2-prep-grade2-triangle-medians-catalog-11 | figure_flagged | missing_given_on_figure | compositor | 2 | — |
| prep-2-prep-grade2-triangle-medians-catalog-12 | figure_flagged | compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-triangle-medians-catalog-13 | figure_flagged | missing_given_on_figure | compositor | 9 | — |
| prep-3-geometry-similarity-catalogs-and-smart-prompt-1 | missed_figure | — | none | — | — |
| prep-3-geometry-similarity-catalogs-and-smart-prompt-2 | missed_figure | — | none | — | — |
| prep-3-geometry-similarity-catalogs-and-smart-prompt-3 | missed_figure | — | none | — | — |
| prep-3-geometry-similarity-catalogs-and-smart-prompt-4 | missed_figure | — | none | — | — |
| prep-3-geometry-similarity-catalogs-and-smart-prompt-5 | missed_figure | — | none | — | — |
| prep-3-geometry-similarity-catalogs-and-smart-prompt-6 | missed_figure | — | none | — | — |
| prep-3-geometry-similarity-catalogs-and-smart-prompt-7 | figure_flagged | missing_given_on_figure | compositor | 10، 12 | — |
| prep-3-geometry-similarity-catalogs-and-smart-prompt-11 | figure_flagged | missing_given_on_figure | compositor | 120 | — |
| prep-3-prep-grade3-line-equation-catalog-1 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 3 | — |
| prep-3-prep-grade3-line-equation-catalog-2 | figure_flagged | compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-3-prep-grade3-line-equation-catalog-3 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 0، 2، 6 | — |
| prep-3-prep-grade3-line-equation-catalog-4 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 1، 0 | — |
| prep-3-prep-grade3-line-equation-catalog-5 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 0، 8، 4، 3 | — |
| prep-3-prep-grade3-line-equation-catalog-6 | figure_flagged | missing_given_on_figure | compositor | 4، 3، 2 | — |
| prep-3-prep-grade3-line-equation-catalog-7 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 4 | — |
| prep-3-prep-grade3-line-equation-catalog-8 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 9 | — |
| prep-3-prep-grade3-line-equation-catalog-10 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-3-prep-grade3-line-equation-catalog-11 | figure_flagged | compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-3-sim-notebooklm-03 | figure_flagged | missing_given_on_figure | compositor | 2 | — |
| prep-3-sim-notebooklm-06 | figure_flagged | missing_given_on_figure | compositor | 4، 6، 3 | — |
| seed-07-bisector | figure_flagged | missing_given_on_figure | compositor | 10 | — |
| seed-08-median | figure_flagged | missing_given_on_figure | compositor | 8 | — |
| seed-19-circle-chord | figure_flagged | missing_given_on_figure | compositor | 5 | — |
| seed-20-circle-tangent | figure_flagged | missing_given_on_figure | compositor | 5 | — |
| intake-02 | figure_flagged | missing_given_on_figure | compositor | 90 | — |
| intake-03 | figure_flagged | missing_given_on_figure | compositor | 6 | — |
| intake-05 | figure_flagged | missing_given_on_figure | compositor | 5 | — |
| intake-09 | figure_flagged | missing_given_on_figure | compositor | 6 | — |
| intake-12 | figure_flagged | missing_given_on_figure | compositor | 4 | — |
| intake-14 | figure_flagged | missing_given_on_figure | compositor | 6 | — |
| intake-17 | figure_flagged | missing_given_on_figure | compositor | 8 | — |
| intake-19 | figure_flagged | missing_given_on_figure | compositor | 8، 6 | — |
| intake-21 | figure_flagged | missing_given_on_figure | compositor | 90 | — |
| intake-23 | figure_flagged | missing_given_on_figure | compositor | 5 | — |
| intake-28 | figure_flagged | missing_given_on_figure | compositor | 5 | — |
