# ملخص التنظيف الشامل وإزالة الكود الميت (Phase 7: `C-0` … `C-8`)

**تاريخ التنفيذ:** `2026-10-30`

## 1. جدول المؤشرات الكمية (قبل التنظيف مقابل بعد التنظيف)

| المؤشر الهندسي | قبل التنظيف (`C-0`) | بعد التنظيف (`C-8`) | الأثر الصافي |
|---|---|---|---|
| **عدد ملفات الكود المصدري (`src/**/*.ts, *.tsx`)** | `265` ملفاً | `271` ملفاً (حذف ملفين ميتين + تفكيك `8` ملفات كبيرة إلى ملفات ذرية) | التزام 100% بقانون الذرية (`AGENTS.md` §2) |
| **إجمالي عدد الأسطر البرمجية في `src/`** | `25,945` سطراً | `24,290` سطراً | **توفير صافي قدره `1,655` سطراً برمجياً (-6.4%)** |
| **عدد الملفات المتجاوزة لسقف `200` سطر** | `27` ملفاً (منها ملف `466` سطراً) | **`0` ملفات** | 100% من ملفات `src/` تحت سقف `200` سطر |
| **رموز ميتة تماماً (`Section 3: fullyDead`)** | `14` رمزاً ميتاً | **`1`** (`app/layout.tsx :: metadata` الخاص بـ Next.js فقط) | تصفير كامل للدوال والثوابت الميتة |
| **تصدير داخلي فائض (`Section 4: internalOnly`)** | `191` رمزاً | `143` (واجهات `Props`/`Types` ودوال مختبرة في `tests/` فقط) | إزالة `export` من `31` دالة وثابت داخلي |
| **تحذيرات `tsc --noUnusedLocals --noUnusedParameters`** | استيرادات ودوال غير مستعملة في `16` ملفاً | **`0` أخطاء أو تحذيرات** | نظافة تامة للاستيرادات والمتغيرات |
| **تعليقات مؤقتة (`TODO|FIXME|XXX|HACK`)** | `1` (`"XXXXXX"`) | **`0`** | خلو كامل من القيم المؤقتة |

---

## 2. الملفات والرموز الميتة التي تم حذفها نهائياً (`C-1`)

### أ. الملفات المحذوفة بالكامل:
1. `src/features/electronic-exams-hub/live-exam-countdown-timer.tsx` — مكون مؤقت قديم غير مستورد في أي مكان (تم استبداله بشريط التقدم الموحد `exam-top-progress-bar.tsx` المتزامن مع وقت الخادم).
2. `src/core/ir/booklet-lesson-content-ir.ts` — ملف أنواع IR قديم للمذكرات لم يعد مستخدماً بعد توحيد خط أنابيب التصيير عبر `PrintableMathQuestionItem`.
3. (في المرحلة 0): حذف الملفات الـ 4 الفارغة في `src/features/video-lectures-hub/` بناءً على قرار مالك المنصة بتأجيل الفيديوهات المرئية.

### ب. الدوال والثوابت والأنواع الميتة التي أُزيلت من الملفات الحية:
- `isServiceKeyConfigured` من `src/core/supabase/supabase-service-client.ts`
- `SimilarityFigureBuildOptions` من `src/core/geometry-engine/curriculum-catalogs/prep-stage/grade-3/prep-similarity-geometry-catalog.ts`
- `A4PaginatedDocumentIR`, `A4ColumnNewspaperBlockIR`, `A4SinglePageLayoutIR`, `A4SovereignPageHeaderSpec`, `A4SovereignPageFooterSpec` من `src/core/ir/a4-paginated-layout-ir.ts`
- `DEFAULT_SEEDED_CURRICULUM_UNITS_SSOT` و `clearCurriculumUnitsForGradeSSOT` من `src/core/ssot/curriculum-hierarchy-ssot.ts`
- `ALL_MATH_BRANCHES_LIST` من `src/core/ssot/math-branches-ssot.ts`
- `authenticateStudentCodeOrPhoneSSOT` من `src/core/ssot/teacher-identity-ssot.ts`
- `THEME_PALETTES_SSOT` و `ThemePaletteTokens` من `src/core/ssot/theme-mode-ssot.ts`
- `parseBookletResponseToPrintableItems` و `mergeNotebookLMBookletThreeStagesToIR` من `src/core/ingestion/notebooklm-booklet-stages-merger.ts`
- `parseNotebookLMFinalReviewResponse` و `parseFinalReviewResponseToPrintableItems` من `src/core/ingestion/notebooklm-final-review-parser.ts`
- `syncPublishedExamToSupabaseCloud` من `src/core/supabase/supabase-cloud-sync-ssot.ts`

---

## 3. توحيد المكررات (`C-3`)

1. **`ARABIC_CHOICE_LETTERS` (`C-3.1`):**
   - تم تعريفه مرة واحدة في `src/core/ssot/numeral-and-unit-ssot.ts` واستيراده في الملفات الأربعة:
     - `official-mcq-answer-key-summary-table.tsx`
     - `adaptive-mcq-choices-card.tsx`
     - `structured-step-by-step-solution-box.tsx`
     - `exam-question-card.tsx`
2. **`SUPABASE_URL` و `SUPABASE_PUBLIC_KEY` (`C-3.2`):**
   - تم توحيدهما في ملف `src/core/supabase/supabase-config-ssot.ts` واستيرادهما في جميع مسارات الـ API وملفات المزامنة السحابية الـ 6.
3. **دالة `heightOf` (`C-3.3`):**
   - بعد الفحص الدقيق تبين اختلاف سلوك الدالتين (`flow-layout-quality-audit.ts` تقرأ `page.targetHeightPxById[item.id] ?? heights.get(item.id) ?? 0` بينما `flow-page-packer.ts` تقرأ `heights.get(item.id) ?? fallbackFlowItemHeightPx(item)`)، فتم الإبقاء على كل دالة في ملفها وفق تعليمات `C-3.3`.

---

## 4. الملفات اليتيمة المهمة التي تم وصلها أو إبقاؤها (`C-2`)

### أ. ملفات تم وصلها فعلياً بخط الأنابيب:
1. `src/core/ingestion/unsolicited-diagram-guard.ts` — موصول داخل `notebooklm-exam-questions-parser.ts` لمنع إرفاق رسوم هندسية وهمية للمسائل الجبرية أو اللفظية غير المبررة.
2. `src/core/validation/question-options-integrity-auditor.ts` — موصول داخل `online-exam-public-key-splitter.ts` لرفض نشر أي سؤال اختر من متعدد يحتوي على بدائل مكررة أو فارغة في الاختبار الإلكتروني، ومغطى باختبار `tests/splitter-options-audit.test.ts`.

### ب. ملفات أُبقيت عمداً كركائز معمارية مستقبلية (مقررة في `C-2`):
| الملف / المجموعة | عدد الملفات | سبب الإبقاء الهندسي |
|---|---|---|
| `src/core/validation/*-validator.ts` + `math-ast-expression-ir.ts` | `8 + 1` | مدققات الفروع الرياضية الصارمة (الجبر، التفاضل، الهندسة الإقليدية، الدوال، الميكانيكا، الفترات، الإحصاء، حساب المثلثات) جاهزة للربط مع محرك التحقق الرمزي المتقدم. |
| `src/core/statistics-engine/*.ts` | `5 + 1` | الركن الخامس من أركان المنصة التوسعية (محرك الرسوم والجداول الإحصائية: المدرج التكراري، المضلع المتجمع، القطاعات الدائرية، الصندوق والتشتت) المؤجل تفعيله لمرحلة `G-10`. |
| `src/core/geometry-engine/analytic-function-family/rational-piecewise-trig-curve-branch.ts` | `1` | فرع رسم منحنيات الدوال الكسرية والمثلثية ومتعددة التعريف للمرحلة الثانوية. |
| `src/core/pdf-layout-engine/local-woff2-fonts-stylesheet.ts` | `1` | مولد تضمين خطوط الطباعة المحلية (`WOFF2`) عند التصدير للطباعة دون اتصال بالإنترنت. |
