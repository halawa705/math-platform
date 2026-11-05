# تقرير خط الأساس لدقة الأشكال الهندسية (المرحلة 0)

> تاريخ التوليد: 2026-11-05T20:29:12.925Z — يُولَّد آلياً بواسطة `tests/geo-baseline-measurement-runner.test.ts`. لا تعدّله يدوياً.

> [!IMPORTANT]
> العلامات الآلية **مؤشرات خطر وليست حكماً نهائياً**. الدقة الحقيقية لا تُحسب إلا من خانة `humanVerdict` بعد المراجعة البشرية.

## الملخص

- إجمالي الحالات: **274**
- أنتج النظام شكلاً في: **220** (80.3%)
- شكل بلا أي علامة خطر آلية: **38** (13.9%)
- شكل بعلامات خطر: **182** (66.4%)
- 🔴 شكل رُسم لمسألة لا يجب أن يُرسم لها: **0**
- شكل مفقود لمسألة تستحق شكلاً: **25**
- رفض صحيح (لا شكل): **29**
- الدقة المُثبتة بشرياً: **لم تُراجَع أي حالة بعد**

## علامات الخطر

| العلامة | العدد |
|---|---|
| `from_fixed_catalog` | 152 |
| `missing_given_on_figure` | 119 |
| `compositor_warnings` | 25 |
| `verification_error` | 22 |
| `leaked_number_not_in_text` | 10 |

### حسب الصف

| المفتاح | الإجمالي | شكل بلا علامات | شكل بعلامات خطر | شكل على حالة بلا شكل | شكل مفقود | رفض صحيح |
|---|---|---|---|---|---|---|
| prep-1 | 93 | 1 | 82 | 0 | 10 | 0 |
| prep-2 | 89 | 1 | 79 | 0 | 9 | 0 |
| prep-3 | 23 | 4 | 12 | 0 | 6 | 1 |
| primary-4 | 45 | 17 | 0 | 0 | 0 | 28 |
| primary-6 | 4 | 0 | 4 | 0 | 0 | 0 |
| unassigned | 20 | 15 | 5 | 0 | 0 | 0 |

### حسب الفرع

| المفتاح | الإجمالي | شكل بلا علامات | شكل بعلامات خطر | شكل على حالة بلا شكل | شكل مفقود | رفض صحيح |
|---|---|---|---|---|---|---|
| numbers | 45 | 17 | 0 | 0 | 0 | 28 |
| plane_geometry | 225 | 21 | 178 | 0 | 25 | 1 |
| statistics_probability | 4 | 0 | 4 | 0 | 0 | 0 |

## الحالات التي تستحق الفحص أولاً

| الحالة | النتيجة | العلامات | المصدر | أرقام ناقصة | أرقام مسرّبة |
|---|---|---|---|---|---|
| prep-1-prep-grade1-angles-followup-catalog-1 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 3، 18، 2، 12، 26 | — |
| prep-1-prep-grade1-angles-followup-catalog-2 | figure_flagged | missing_given_on_figure | compositor | 140، 110 | — |
| prep-1-prep-grade1-angles-followup-catalog-3 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 5، 7، 3، 57، 25 | — |
| prep-1-prep-grade1-angles-followup-catalog-4 | figure_flagged | missing_given_on_figure | compositor | 80، 2 | — |
| prep-1-prep-grade1-angles-followup-catalog-5 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 10، 11 | — |
| prep-1-prep-grade1-angles-followup-catalog-6 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 110 | — |
| prep-1-prep-grade1-angles-followup-catalog-7 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 101 | — |
| prep-1-prep-grade1-angles-followup-catalog-8 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 3، 5، 4، 2، 63، 21 | — |
| prep-1-prep-grade1-angles-followup-catalog-9 | figure_flagged | missing_given_on_figure، verification_error، from_fixed_catalog | catalog | 124 | — |
| prep-1-prep-grade1-angles-followup-catalog-10 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-followup-catalog-11 | figure_flagged | missing_given_on_figure | compositor | 120، 60 | — |
| prep-1-prep-grade1-angles-followup-catalog-12 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-angles-followup-catalog-13 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 3، 18، 2، 12، 26 | — |
| prep-1-prep-grade1-angles-relationships-catalog-1 | figure_flagged | missing_given_on_figure | compositor | 25 | — |
| prep-1-prep-grade1-angles-relationships-catalog-2 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-3 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 1، 29 | — |
| prep-1-prep-grade1-angles-relationships-catalog-4 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 3، 15 | — |
| prep-1-prep-grade1-angles-relationships-catalog-5 | figure_flagged | missing_given_on_figure | compositor | 35، 145 | — |
| prep-1-prep-grade1-angles-relationships-catalog-6 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-7 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 5، 2، 4، 20 | — |
| prep-1-prep-grade1-angles-relationships-catalog-8 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-9 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 26، 3، 21، 47 | — |
| prep-1-prep-grade1-angles-relationships-catalog-10 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 160 | — |
| prep-1-prep-grade1-angles-relationships-catalog-11 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 4، 21، 6، 1، 11 | — |
| prep-1-prep-grade1-angles-relationships-catalog-12 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-angles-relationships-catalog-13 | figure_flagged | missing_given_on_figure | compositor | 25 | — |
| prep-1-prep-grade1-coordinates-catalog-1 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 3، 4، 1، 6 | — |
| prep-1-prep-grade1-coordinates-catalog-2 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 1، 4، 5، 3 | — |
| prep-1-prep-grade1-coordinates-catalog-3 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 3، 2، 4 | — |
| prep-1-prep-grade1-coordinates-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-coordinates-catalog-5 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-coordinates-catalog-6 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 3، 4، 1 | — |
| prep-1-prep-grade1-parallelism-catalog-1 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-2 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-3 | figure_flagged | missing_given_on_figure، verification_error، from_fixed_catalog | catalog | 6، 40 | — |
| prep-1-prep-grade1-parallelism-catalog-4 | figure_flagged | missing_given_on_figure، verification_error، from_fixed_catalog | catalog | 50 | — |
| prep-1-prep-grade1-parallelism-catalog-5 | figure_flagged | missing_given_on_figure، verification_error، from_fixed_catalog | catalog | 95 | — |
| prep-1-prep-grade1-parallelism-catalog-6 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-7 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2 | — |
| prep-1-prep-grade1-parallelism-catalog-8 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-9 | figure_flagged | missing_given_on_figure، verification_error، from_fixed_catalog | catalog | 3، 15، 20 | — |
| prep-1-prep-grade1-parallelism-catalog-10 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 9، 5، 15 | — |
| prep-1-prep-grade1-parallelism-catalog-11 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-12 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-parallelism-catalog-13 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-parallelism-catalog-14 | figure_flagged | leaked_number_not_in_text، verification_error، from_fixed_catalog | catalog | — | 63 |
| prep-1-prep-grade1-parallelism-catalog-15 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-polygons-catalog-1 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-polygons-catalog-2 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-polygons-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-polygons-catalog-4 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 24 | — |
| prep-1-prep-grade1-polygons-catalog-5 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 5 | — |
| prep-1-prep-grade1-polygons-catalog-6 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 3 | — |
| prep-1-prep-grade1-polygons-catalog-7 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 6 | — |
| prep-1-prep-grade1-polygons-catalog-8 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-quadrilaterals-catalog-1 | figure_flagged | missing_given_on_figure، compositor_warnings، from_fixed_catalog | catalog | 110 | — |
| prep-1-prep-grade1-quadrilaterals-catalog-2 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-quadrilaterals-catalog-3 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 11، 2، 5، 1 | — |
| prep-1-prep-grade1-quadrilaterals-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-quadrilaterals-catalog-5 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-quadrilaterals-catalog-6 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 5، 11، 2، 1، 10، 6، 3 | — |
| prep-1-prep-grade1-quadrilaterals-catalog-7 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 3، 4، 2، 10 | — |
| prep-1-prep-grade1-quadrilaterals-catalog-8 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 10، 7 | — |
| prep-1-prep-grade1-quadrilaterals-catalog-9 | figure_flagged | missing_given_on_figure | compositor | 50 | — |
| prep-1-prep-grade1-quadrilaterals-catalog-10 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 48 | — |
| prep-1-prep-grade1-quadrilaterals-catalog-11 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 4، 25 | — |
| prep-1-prep-grade1-quadrilaterals-catalog-12 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 3، 55، 2، 70 | — |
| prep-1-prep-grade1-quadrilaterals-catalog-13 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-quadrilaterals-catalog-14 | figure_flagged | missing_given_on_figure، compositor_warnings، from_fixed_catalog | catalog | 110 | — |
| prep-1-prep-grade1-special-quads-followup-catalog-1 | figure_flagged | missing_given_on_figure | compositor | 105 | — |
| prep-1-prep-grade1-special-quads-followup-catalog-2 | figure_flagged | missing_given_on_figure، compositor_warnings، from_fixed_catalog | catalog | 88 | — |
| prep-1-prep-grade1-special-quads-followup-catalog-3 | figure_flagged | missing_given_on_figure، compositor_warnings، from_fixed_catalog | catalog | 97 | — |
| prep-1-prep-grade1-special-quads-followup-catalog-5 | figure_flagged | missing_given_on_figure، compositor_warnings، from_fixed_catalog | catalog | 56 | — |
| prep-1-prep-grade1-special-quads-followup-catalog-6 | figure_flagged | missing_given_on_figure، leaked_number_not_in_text، compositor_warnings، from_fixed_catalog | catalog | 5، 4، 2، 1، 6 | 90 |
| prep-1-prep-grade1-special-quads-followup-catalog-7 | figure_flagged | missing_given_on_figure | compositor | 7، 11، 5، 1، 6 | — |
| prep-1-prep-grade1-special-quads-followup-catalog-8 | figure_flagged | missing_given_on_figure | compositor | 4، 5، 3 | — |
| prep-1-prep-grade1-special-quads-followup-catalog-9 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-special-quads-followup-catalog-10 | figure_flagged | missing_given_on_figure | compositor | 105 | — |
| prep-1-prep-grade1-triangle-angles-catalog-1 | figure_flagged | missing_given_on_figure | compositor | 126، 72 | — |
| prep-1-prep-grade1-triangle-angles-catalog-2 | figure_flagged | missing_given_on_figure، verification_error، from_fixed_catalog | catalog | 70 | — |
| prep-1-prep-grade1-triangle-angles-catalog-3 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-4 | figure_flagged | verification_error، compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-5 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 3، 10، 40 | — |
| prep-1-prep-grade1-triangle-angles-catalog-6 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 3، 7، 24 | — |
| prep-1-prep-grade1-triangle-angles-catalog-7 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 16، 1، 65 | — |
| prep-1-prep-grade1-triangle-angles-catalog-8 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 5، 3، 4، 8، 76 | — |
| prep-1-prep-grade1-triangle-angles-catalog-9 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 3، 5، 20 | — |
| prep-1-prep-grade1-triangle-angles-catalog-10 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 104 | — |
| prep-1-prep-grade1-triangle-angles-catalog-11 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 120 | — |
| prep-1-prep-grade1-triangle-angles-catalog-12 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 34 | — |
| prep-1-prep-grade1-triangle-angles-catalog-13 | missed_figure | — | none | — | — |
| prep-1-prep-grade1-triangle-angles-catalog-14 | figure_flagged | missing_given_on_figure | compositor | 126، 72 | — |
| prep-2-prep-grade2-isosceles-followup-catalog-1 | figure_flagged | missing_given_on_figure، compositor_warnings، from_fixed_catalog | catalog | 40، 45 | — |
| prep-2-prep-grade2-isosceles-followup-catalog-2 | figure_flagged | missing_given_on_figure، leaked_number_not_in_text، from_fixed_catalog | catalog | 18، 9 | 13 |
| prep-2-prep-grade2-isosceles-followup-catalog-3 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-5 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 5، 2، 32، 3 | — |
| prep-2-prep-grade2-isosceles-followup-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-7 | figure_flagged | compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-8 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 3 | — |
| prep-2-prep-grade2-isosceles-followup-catalog-9 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 5 | — |
| prep-2-prep-grade2-isosceles-followup-catalog-10 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-11 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-followup-catalog-12 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-1 | figure_flagged | missing_given_on_figure، compositor_warnings، from_fixed_catalog | catalog | 130 | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-2 | figure_flagged | missing_given_on_figure، compositor_warnings، from_fixed_catalog | catalog | 55 | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-3 | figure_flagged | missing_given_on_figure | compositor | 30، 70 | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-4 | figure_flagged | leaked_number_not_in_text، verification_error، compositor_warnings | compositor | — | 5 |
| prep-2-prep-grade2-isosceles-triangle-catalog-5 | figure_flagged | missing_given_on_figure | compositor | 120، 85 | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-6 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-8 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 13، 3، 17، 73، 34 | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-9 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 4 | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-10 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 5، 2 | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-11 | figure_flagged | compositor_warnings، from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-12 | figure_flagged | missing_given_on_figure، verification_error، compositor_warnings، from_fixed_catalog | catalog | 90 | — |
| prep-2-prep-grade2-isosceles-triangle-catalog-13 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 13، 3، 17 | — |
| prep-2-prep-grade2-parallel-applications-catalog-1 | figure_flagged | missing_given_on_figure، verification_error، from_fixed_catalog | catalog | 2 | — |
| prep-2-prep-grade2-parallel-applications-catalog-2 | figure_flagged | missing_given_on_figure، verification_error، from_fixed_catalog | catalog | 1، 2، 3، 4 | — |
| prep-2-prep-grade2-parallel-applications-catalog-3 | figure_flagged | verification_error، from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-4 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-5 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 1، 5 | — |
| prep-2-prep-grade2-parallel-applications-catalog-6 | figure_flagged | missing_given_on_figure، compositor_warnings، from_fixed_catalog | catalog | 90 | — |
| prep-2-prep-grade2-parallel-applications-catalog-7 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-8 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 90 | — |
| prep-2-prep-grade2-parallel-applications-catalog-9 | figure_flagged | missing_given_on_figure، compositor_warnings، from_fixed_catalog | catalog | 3 | — |
| prep-2-prep-grade2-parallel-applications-catalog-10 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 4 | — |
| prep-2-prep-grade2-parallel-applications-catalog-11 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-parallel-applications-catalog-12 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-1 | figure_flagged | from_fixed_catalog | catalog | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-2 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 108 | — |
| prep-2-prep-grade2-polygon-angles-catalog-3 | missed_figure | — | none | — | — |
| prep-2-prep-grade2-polygon-angles-catalog-4 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 144 | — |
| prep-2-prep-grade2-polygon-angles-catalog-5 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 31، 2، 32، 3، 50 | — |
| prep-2-prep-grade2-polygon-angles-catalog-6 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 3، 4، 36 | — |
| prep-2-prep-grade2-polygon-angles-catalog-7 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 19، 2، 41 | — |
| prep-2-prep-grade2-polygon-angles-catalog-8 | figure_flagged | missing_given_on_figure، from_fixed_catalog | catalog | 2، 4، 3، 5، 20، 120 | — |
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
| prep-2-prep-grade2-triangle-medians-catalog-5 | figure_flagged | missing_given_on_figure، compositor_warnings، from_fixed_catalog | catalog | 2، 3، 8 | — |
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
| p6-probe-dot | figure_flagged | missing_given_on_figure، leaked_number_not_in_text، from_fixed_catalog | catalog | 3، 4، 7، 2، 5، 1 | 0، 10، 20، 30، 40، 50، 60 |
| p6-probe-bar | figure_flagged | missing_given_on_figure، leaked_number_not_in_text، from_fixed_catalog | catalog | 12، 20، 9 | 0، 1، 2، 3، 4، 5، 6 |
| p6-probe-histogram | figure_flagged | missing_given_on_figure، leaked_number_not_in_text، from_fixed_catalog | catalog | 9، 19، 20، 29، 3، 5 | 2، 4، 6، 51، 60، 61، 70، 71، 80، 81، 90، 91، 100 |
| p6-probe-boxplot | figure_flagged | missing_given_on_figure، leaked_number_not_in_text، from_fixed_catalog | catalog | 12، 26، 31 | 5، 10، 25، 30، 35، 40، 45، 50 |
| seed-07-bisector | figure_flagged | missing_given_on_figure | compositor | 10 | — |
| seed-08-median | figure_flagged | missing_given_on_figure | compositor | 8 | — |
| seed-18-algebraic-angle | figure_flagged | missing_given_on_figure | compositor | 2، 3 | — |
| seed-19-circle-chord | figure_flagged | missing_given_on_figure | compositor | 5 | — |
| seed-20-circle-tangent | figure_flagged | missing_given_on_figure | compositor | 5 | — |
