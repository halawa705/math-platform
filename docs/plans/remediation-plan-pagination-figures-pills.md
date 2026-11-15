# خطة العلاج: ترقيم الصفحات، دقة الأشكال، وشكل المعطيات على الرسم

> **لمن هذه الخطة؟** لأي منفّذ (إنسان أو ذكاء اصطناعي مهما كانت قدرته). كل مهمة مستقلة، فيها: الهدف، الملفات، الخطوات الحرفية، ومعيار قبول يمكن قياسه بأمر واحد.
> **قواعد ثابتة قبل أي مهمة** (من `AGENTS.md`):
> 1. كل ملف ≤ 300 سطر، واسمه فريد عالمياً من 3–5 كلمات. ممنوع `any`.
> 2. لا تُعدّل ملفاً دون قراءته أولاً. لا تحذف كوداً قديماً قبل تأكيد المالك.
> 3. بعد كل مهمة شغّل: `npx tsc --noEmit` ثم `npx vitest run`. لا تكتب "نجح" دون رؤية المخرج.
> 4. لا تُخفِ فشلاً ولا تُجمّل رقماً. الأرقام تُنقل كما ظهرت في المخرج.
> 5. نفّذ مهمة واحدة ثم `git add` + `git commit` + `git push origin main` (قاعدة المنصة)، ولا تدمج مهمتين في commit.

---

## المشاكل المُبلَغ عنها (من صور المالك)

| # | المشكلة | الدليل في الصور |
|---|---|---|
| 1 | عدد الصفحات زاد وعدد الصفحات الممتلئة قل، والامتلاء المعروض وهمي | شريط الامتلاء يعرض: `25 صفحة`، ونسب مثل `59%` و`58%` و`51%` و`76%` و`92%`... مع كروت نصف فارغة (فراغ كبير فوق نص السؤال) |
| 2 | القاطع في «حاول بنفسك (5)» مرسوم منكسراً لا مستقيماً، وبعض الأسئلة بلا رسم | صورة الصفحة 2 |
| 3 | مستطيل أبيض خلف كل معطى على الرسم يغطي أجزاء من الشكل | صورة الصفحة 2 (كبسولات `5 سم`، `4 سم`، `18 سم`، `21 سم`) |

## ما تم التحقق منه في الكود (حقائق وليست تخميناً)

- شريط الامتلاء يعتمد على `fillRatio` (الامتلاء بعد التمديد). الملف [flow-layout-quality-audit.ts](../../src/core/pdf-layout-engine/flow-layout-quality-audit.ts) يحسب أيضاً `rawFillRatio` (المحتوى الحقيقي قبل أي تمديد). **الفرق بين الرقمين هو سبب «الامتلاء الوهمي».**
- [flow-page-slack-distributor.ts](../../src/core/pdf-layout-engine/flow-page-slack-distributor.ts) يمدّد بطاقات الأسئلة (`stretchColumn`) ويوسّع المسافات لتلامس الصفحة تذييلها. هذا ما يصنع الفراغ فوق النص داخل الكرت.
- [autofit-decision.ts](../../src/core/pdf-layout-engine/autofit-decision.ts) يختار «أقل عدد صفحات أولاً ثم أكبر خط»، ويُفترض أن يمنع زيادة الصفحات.
- مستطيل المعطى على الرسم يُرسم في [vector-svg-figure-projector.ts](../../src/core/geometry-engine/vector-svg-figure-projector.ts) السطر 205 (`pillBg = "#FFFFFF"` عند السطر 188)، وشارات المحيط/المساحة في السطر 217 من الملف نفسه، وشارات المناطق في [vector-svg-circles-and-arcs-projector.ts](../../src/core/geometry-engine/vector-svg-circles-and-arcs-projector.ts) السطر 99.
- ارتفاع أي رسم يتحدد من `computeExpandedSvgViewBox` في [svg-label-collision-layout-solver.ts](../../src/core/geometry-engine/svg-label-collision-layout-solver.ts) السطر 250 (يوسّع `viewBox` عند الحاجة).
- الأسئلة التي لا يُنتج لها شكل حالياً (من فحص سابق، 11 من 100): `booklet-s1-drill-1-4`, `drill-2-4`, `drill-9-4`, `booklet-s2-hw-1`, `hw-10`, `hw-25`, `hw-26`, `hw-29`, `hw-30`, `hw-34`, `hw-38`. بعضها لفظي فعلاً (`hw-25`, `hw-29`) وبعضها يحتاج رسماً.

## فرضيات تحتاج قياساً (لا تُعامل كحقائق)

- (ف1) زيادة الصفحات سببها أن الأشكال صارت أطول (توسيع `viewBox`) أو أن حدّ الخط 12pt / الكثافة غيّر الكسر. **المهمة A1 تحسم هذا بالقياس.**
- (ف2) انكسار القاطع في سؤال 5 سببه أن الشكل لم يُبنَ بواضع المتوازيات والقواطع [geo-parallel-transversals-placer.ts](../../src/core/geometry-engine/fact-compositor/geo-parallel-transversals-placer.ts) (الذي يرسم كل قاطع نقاطاً على خط مستقيم بالمعادلة `x1 = 2.2 - frac*1.1`) بل بمُنشئ آخر. **المهمة B1 تحسم هذا.**

---

# المسار A — الصفحات

### A1. قياس الأساس (قبل أي تعديل)
**الهدف:** رقم موثوق: كم صفحة كانت قبل التعديلات وكم الآن؟
**الخطوات:**
1. أنشئ سكربت قياس في `scratch/` (ليس داخل `src/`) يحمّل كتيّب «تطبيقات التوازي» (100 عنصر، مرحلتان) ويمرره على `auditFlowPages` ويطبع لكل صفحة: `pageNumber, rawFillRatio, fillRatio` ثم **عدد الصفحات** و**متوسط rawFillRatio** و**عدد الصفحات ذات raw < 0.85**.
2. شغّله على الحالة الحالية (`HEAD`).
3. أنشئ worktree للحالة القديمة: `git worktree add ../mp-baseline f1e0e07^` (قبل commit «page-economy stage 1»)، ثم شغّل **نفس السكربت** هناك. إن لم تُرسم الأشكال بنفس الطريقة فاستخدم نفس بيانات الإدخال من ملف الاختبار `src/core/pdf-layout-engine/flow-page-packer-fill-quality.test.ts` كمرجع للاستدعاء.
4. سجّل الجدول الثلاثي (قديم/حالي/فرق) في `docs/plans/layout-baseline-measurements-record.md`.
**القبول:** الملف موجود ويحوي الأرقام كما طُبعت، ويقول صراحة إن كانت الفرضية ف1 صحيحة أم لا (قارن ارتفاع الأشكال قديماً/حالياً بطباعة `viewBox` لـ10 أشكال).

### A2. إظهار الامتلاء الحقيقي في الواجهة
**الهدف:** الشريط يعرض `rawFillRatio` لا `fillRatio`.
**الملفات:** [page-fill-report-chip.tsx](../../src/core/pdf-layout-engine/page-fill-report-chip.tsx) ومكوّن شريط «امتلاء الصفحات» (ابحث عن النص `امتلاء الصفحات` بالأمر: `Select-String -Path src -Pattern "امتلاء الصفحات" -Recurse`—أو `git grep "امتلاء الصفحات"`).
**الخطوات:** 1) حدّد الدالة التي تغذّي الشريط. 2) غيّر مصدر النسبة إلى `rawFillRatio` من `auditFlowPages`. 3) أضف بجانب كل نسبة لوناً: ≥ 90% أخضر، 75–89% أصفر، < 75% أحمر.
**القبول:** اختبار وحدة يمرر صفحتين (إحداهما ممدّدة) ويتحقق أن المعروض = الخام. وفي الواجهة تظهر نسب أقل من الحالية (هذا متوقع وصحيح: الرقم أصبح صادقاً).

### A3. إيقاف تمديد الكروت من الداخل
**الهدف:** لا فراغ داخل الكرت فوق نص السؤال.
**الملفات:** [flow-page-slack-distributor.ts](../../src/core/pdf-layout-engine/flow-page-slack-distributor.ts)، [flow-page-geometry-constants.ts](../../src/core/pdf-layout-engine/flow-page-geometry-constants.ts) (`maxStretchPerItemPx`, `maxStretchRatio`), [flow-item-renderer.tsx](../../src/core/pdf-layout-engine/flow-item-renderer.tsx).
**الخطوات:**
1. في ملف الثوابت اجعل `maxStretchPerItemPx` و`maxStretchRatio` صفراً لكروت «حاول بنفسك» والواجب (أو اجعل `isStretchableFlowItem` تُرجع `false` لهذه الأنواع).
2. في `flow-item-renderer.tsx` تأكد أن محتوى الكرت `justify-content: flex-start` (النص يبدأ من أعلى الكرت)، وأن الفراغ الزائد إن وُجد يذهب **تحت** سطور الإجابة لا فوق النص.
3. اجعل الفراغ المتبقي يُوزَّع كمسافة بين الكروت فقط (حتى حد الكثافة الموجود) وليس داخلها.
**القبول:** سكربت A1 يُظهر أن `bottomSlackPx` لم يزد، والصورة المرئية للصفحة لا تُظهر فراغاً فوق السؤال. اختبارات `flow-page-packer-fill-quality.test.ts` تنجح (عدّل فقط توقعات التمديد إن كانت تتحقق من التمديد نفسه، ودوّن ذلك في الـcommit).

### A4. تصغير ارتفاع الأشكال (إن أثبتت A1 أنها السبب)
**الهدف:** الرسم يأخذ عرض نصف الكرت كاملاً بارتفاع معقول، لا صندوقاً صغيراً وسط فراغ.
**الملفات:** [question-figure-svg-renderer.ts](../../src/core/pdf-layout-engine/question-figure-svg-renderer.ts)، [embedded-geometry-svg-docker.tsx](../../src/core/pdf-layout-engine/embedded-geometry-svg-docker.tsx)، `computeExpandedSvgViewBox` (السطر 250 في solver).
**الخطوات:**
1. في `computeExpandedSvgViewBox` اجعل التوسّع الرأسي مقيَّداً: `height <= baseHeight * 1.15`؛ ما زاد يُعالج بنقل الكبسولة لا بتكبير `viewBox`.
2. في `embedded-geometry-svg-docker.tsx` اجعل الرسم `width: 100%` من عمود الكرت و`max-height` ثابتاً (احسبه من ثابت في `flow-page-geometry-constants.ts` ولا تكتب رقماً سحرياً).
**القبول:** متوسط ارتفاع الشكل المقاس في A1 ≤ القيمة القديمة × 1.1، و`SVG COLLISION AUDIT: overlaps=0, clipped=0` (أعد إنشاء سكربت فحص التداخل: يمرّ على الأشكال المعروفة ويفحص تقاطع صناديق النصوص).

### A5. قفل النتيجة باختبار انحدار
**الهدف:** لا تزيد الصفحات مستقبلاً دون إنذار.
**الخطوات:** أضف ملف اختبار `tests/flow-booklet-page-count-regression.test.ts` يمرّر كتيّب التوازي ويتحقق: `pages <= <الرقم الأساس من A1>` و`متوسط rawFillRatio >= <الأساس>`.
**القبول:** الاختبار ينجح الآن ويفشل لو رُفع الارتفاع (جرّب بتعديل مؤقت ثم تراجع).

---

# المسار B — الأشكال

### B1. إيجاد سبب انكسار القاطع في «حاول بنفسك (5)»
**نص السؤال:** `AL // BM // CN // DK`، القاطع `AD` فيه `AB = BC = CD = 5`، القاطع `LK` فيه `LM = 4`، أوجد `LK`.
**الخطوات:**
1. اكتب سكربت `scratch/trace-figure-builder.ts` يمرر هذا الوصف على `matchGeometryWithDiagnostics` (من `natural-arabic-geometry-matcher.ts`) ويطبع `res.figure.branchId` وإحداثيات نقاط `A,B,C,D` و`L,M,N,K`.
2. اعرف أي مُنشئ أنتج الشكل (واضع المتوازيات والقواطع أم مُنشئ في `curriculum-catalogs`).
3. احسب هل `A,B,C,D` على خط واحد: استخدم `cross((B-A),(C-A)) ≈ 0`.
**القبول:** تقرير سطرين يذكر الملف والدالة المسؤولة وإحداثيات النقاط.

### B2. إصلاح المنشئ وجعل القاطع مستقيماً دائماً
**الخطوات:** (حسب نتيجة B1)
- إن كان من [geo-parallel-transversals-placer.ts](../../src/core/geometry-engine/fact-compositor/geo-parallel-transversals-placer.ts): تحقق أن `x1/x2` خطيان في `frac` (هما كذلك في السطرين 139–140) وأن المستقيمات المسماة `AL, BM, CN, DK` تستخدم **نفس ترتيب** نقاط القاطعين وأن `n` صحيح (4). إن كان الانكسار بسبب أن نقاط القاطع الثاني أُدخلت بترتيب مختلف، رتّبها حسب ترتيب أسماء المتوازيات.
- إن كان من مُنشئ آخر: اجعله يمرّ عبر الواضع أعلاه، أو أصلح إحداثياته لتكون خطية.
**القبول:** اختبار جديد `tests/parallel-transversal-straightness-guard.test.ts` يتأكد لأي شكل يحوي مستقيمين متقاطعين مع ≥ 3 متوازيات أن كل قاطع «خطي» (انحراف أي نقطة عن الخط الواصل بين طرفيه < 0.01 وحدة). يشمل الاختبار هذه المسألة وسؤالي (4) و(6) في الصورة.

### B3. حارس عام ضد القواطع المنكسرة
**الهدف:** لا يعود الخطأ أبداً.
**الخطوات:** أنشئ دالة `assertTransversalCollinearity` في ملف جديد `src/core/geometry-engine/verification/geometry-transversal-collinearity-checker.ts` (≤ 100 سطر) تأخذ `CanonicalGeometryFigureIR` وتفحص كل سلسلة قطع متتالية تشترك في رؤوس وعلامات تساوٍ/أطوال، وتُرجع قائمة مخالفات. استدعها من `isFigureFaithfulToPrompt` في [geometry-figure-fidelity-gate.ts](../../src/core/geometry-engine/verification/geometry-figure-fidelity-gate.ts) كشرط إضافي (يُسقط الشكل إلى «لم يُفهم» بدل رسم شكل خاطئ).
**القبول:** اختبار يمرر شكلاً مكسوراً متعمداً ويفشل، وشكلاً سليماً وينجح.

### B4. الأسئلة التي تقول «في الشكل المقابل» بلا رسم
**الخطوات:**
1. أعد إنشاء سكربت تشخيص يمر على كل عناصر الكتيّب (100) ويطبع من لا شكل لها مع النص الكامل (كان اسمه `diag_parallel_full.ts` وحُذف).
2. صنّف كل واحد: (أ) لفظي حقاً لا يحتاج رسماً (مثل `hw-25`, `hw-29`: «ما نوع الشكل الرباعي..»، «طول القطعة الواصلة بين منتصفي ساقي شبه المنحرف يساوي») فيبقى بلا رسم؛ (ب) يحتاج رسماً.
3. للفئة (ب): `drill-1-4`, `drill-2-4`, `drill-9-4`, `hw-1`: قواطع بأجزاء متساوية بلا أسماء نقاط → استخدم واضع القواطع المتوازية مع نقاط مولّدة تلقائياً (`t1_i`, `t2_i` كما في الواضع). `hw-10`, `hw-26`, `hw-30`, `hw-38`: مثلث/شبه منحرف مع منتصفات وتوازٍ → أضف حقائق الاستخراج في `prompt-midpoint-and-quad-extractor.ts` (نمط مشابه لما أُضيف للبند 5 و6). `hw-34`: عمود إنارة وحبلان متوازيان → تحويله إلى توازي قاطعين بالمنطق نفسه.
4. لكل سؤال يُضاف: اختبار `it("...")` في `tests/prep-grade2-parallel-applications-catalog.test.ts` يتحقق من وجود `figure` بصفر تحذيرات.
**القبول:** قائمة (ب) كلها لها شكل، وSUMMARY في سكربت التشخيص يعرض `missing=0` و`nonGeo` = عدد الأسئلة اللفظية فقط.

### B5. حارس «الشكل المقابل»
**الخطوات:** أضف اختباراً عاماً: لكل سؤال هندسي في الكتيّب نصّه يحوي `في الشكل المقابل` أو `[رسم هندسي:` ويُحسب غير لفظي، يجب أن يكون `figure` غير `undefined`. الفشل يطبع معرّف السؤال.
**القبول:** الاختبار موجود وينجح، ويفشل إن أُزيل شكل مقصود.

---

# المسار C — المعطيات بلا خلفية

**القرار المقترح (يمكن للمالك عكسه بتغيير ثابت واحد):** كبسولة المعطى تفقد الخلفية البيضاء تماماً، ويبقى النص ملوناً وسميكاً مع «هالة» بيضاء رفيعة حول الحروف (`paint-order: stroke`) للحفاظ على القراءة فوق الخطوط دون مستطيل يخفي الشكل. كبسولة «المطلوب» (المجهول) تبقى بحدّ عنبري متقطع بلا تعبئة.

### C1. ثابت واحد يتحكم بالشكل
**الملف الجديد:** `src/core/geometry-engine/svg-given-label-style-constants.ts` (≤ 40 سطراً) يصدّر:
```ts
export const GIVEN_LABEL_BACKGROUND_FILL = "none" as const;
export const GIVEN_LABEL_HALO_STROKE = "#FFFFFF" as const;
export const GIVEN_LABEL_HALO_WIDTH = 2.2 as const;
export const UNKNOWN_LABEL_BORDER = "#F59E0B" as const;
```

### C2. تعديل رسم كبسولة الأطوال
**الملف:** [vector-svg-figure-projector.ts](../../src/core/geometry-engine/vector-svg-figure-projector.ts) (الأسطر 188–205).
**الخطوات:**
1. استبدل `pillBg = isUnknown ? "#FFFBEB" : "#FFFFFF"` بـ`GIVEN_LABEL_BACKGROUND_FILL` للحالتين.
2. للمعطى (غير المجهول): لا ترسم `<rect>` أبداً؛ اجعل `<text>` بالخصائص: `stroke="#FFFFFF" stroke-width="2.2" paint-order="stroke" stroke-linejoin="round"`.
3. للمجهول: ارسم `<rect ... fill="none" stroke="#F59E0B" stroke-dasharray="2,1.5">` + النص.
4. **لا تغيّر** `placement.pillW` ولا `occupiedBoxes` (محرك منع التداخل يعتمد عليها؛ إزالة الخلفية لا تعني إزالة الحجز).
**القبول:** `verify` التداخل `overlaps=0, clipped=0`، والصورة المجمّعة (تُنشأ بسكربت يحوّل 15 SVG إلى PNG عبر `sharp`) لا تُظهر أي مستطيل أبيض.

### C3. شارات المحيط والمساحة وشارات المناطق
**الملفان:** نفس `vector-svg-figure-projector.ts` السطر 217 (`bgTint`)، و`vector-svg-circles-and-arcs-projector.ts` السطر 99 (`badgeBg`).
**الخطوات:** اجعل `fill="none"` وأبقِ الحد الملون الرفيع (هذه نتائج مطلوبة لا معطيات، ويبقى تمييزها مفيداً). أضف هالة بيضاء للنص بالطريقة نفسها.
**القبول:** لا `fill="#...` غير `none` في `<rect>` الكبسولات. أمر التحقق: `Select-String -Path src/core/geometry-engine/*.ts -Pattern 'rect.*fill="\$\{(pillBg|bgTint|badgeBg)'` يعيد صفراً.

### C4. المسارات المشتركة (الامتحان الإلكتروني والطباعة)
**الخطوات:** تأكد أن [question-figure-svg-renderer.ts](../../src/core/pdf-layout-engine/question-figure-svg-renderer.ts) هو المسار الوحيد للجميع (يستورده `embedded-geometry-svg-docker.tsx` و`published-exam-settings-editor-modal.tsx` و`studio-exam-questions-inspector-card.tsx`). **لا تنشئ نسخة ثانية.** بعد التعديل افحص يدوياً صفحة الامتحان الإلكتروني بخلفية داكنة؛ إن كانت خلفية الشكل بيضاء دائماً (`backgroundColorHex: "#FFFFFF"` كما في الاستدعاء الحالي) فلا مشكلة هالة.
**القبول:** صورة من الامتحان الإلكتروني وصورة من الـ PDF يُظهران النص مقروءاً بلا مستطيل.

---

# المسار D — الإغلاق

### D1. التحقق الشامل
`npx tsc --noEmit` ثم `npx vitest run` ثم سكربتا A1 وB4 وفحص التداخل. دوّن الأرقام الحرفية في `docs/plans/remediation-results-record.md`.

### D2. مراجعة المالك ثم التنظيف
بعد موافقة المالك فقط: احذف سكربتات `scratch/` والـworktree (`git worktree remove ../mp-baseline`)، وأي كود لم يعد مستخدماً (تحقق بـ`git grep` + `tsc --noEmit` قبل الحذف وبعده).

## ترتيب التنفيذ المقترح

`A1 → A2 → A3 → (A4 إن لزم) → A5` ثم `B1 → B2 → B3 → B4 → B5` ثم `C1 → C2 → C3 → C4` ثم `D1 → D2`.
المسار C (المعطيات بلا خلفية) صغير وآمن ويمكن تنفيذه أولاً إن أراد المالك نتيجة بصرية سريعة.

## تنبيه صريح
- لم أنفّذ أي تعديل في الكود ضمن هذه الخطة؛ هي وثيقة فقط.
- ما كُتب كـ«حقائق» أعلاه مبني على قراءة الملفات المذكورة في هذه الجلسة. أما (ف1) و(ف2) فلم تُثبت بعد.
