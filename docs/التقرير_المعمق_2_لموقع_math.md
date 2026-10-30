# التقرير المعمق الشامل لمنصة الرياضيات المستقلة (Math Platform)
**الإصدار:** 2.0.0 — التقرير الفني الشامل + خطة التطوير التفصيلية (الجزء الثاني في نهاية الملف)  
**المعلم المالك الحصري:** أ/ إسلام حلاوة  
**تاريخ الفحص والتوثيق:** أكتوبر 2026  
**النطاق المعماري:** تشريح المنظومة البرمجية الكاملة، خريطة الملفات والمجلدات، تحليل كل أداة وزر، وفهرس العيوب وحلولها الجذرية.

---

## 1. الهوية والرؤية المعمارية العليا (Executive Architecture Overview)

### 1.1. المبادئ الجوهرية غير القابلة للكسر (Core Architectural Invariants)
1. **تخصص الرياضيات المطلق (100% Mathematics Exclusivity):**
   - صُممت المنصة حصرياً لتدريس مادة الرياضيات لجميع صفوف التعليم المصري (من الصف الثالث الابتدائي وحتى الثالث الثانوي).
   - تشمل الفروع الأحد عشر الكاملة: (الأعداد والعمليات، الجبر والفترات، الدوال والتحليل، حساب المثلثات، الهندسة المستوية والبرهان الإقليدي، الهندسة التحليلية والإحداثية، الهندسة الفراغية والمجسمات، الإحصاء والاحتمالات، التفاضل والتكامل، الاستاتيكا، الديناميكا).
   - حظر قاطع لأي مواد أو خيارات خارج تخصص الرياضيات.

2. **نموذج المعلم المالك الحصري + الطلاب (Single-Owner Teacher Paradigm):**
   - لا توجد تعددية معلمين ولا لوحات تحكم وسيطة؛ يوجد معلم واحد مالك للمنصة (`أ/ إسلام حلاوة`) يملك كامل الصلاحيات الإدارية، وطلابه المسجلون في صفوفه المختلفة.
   - **بوابة الدخول الموحدة ذات الوصول الخفي (`Stealth Teacher Access`):** واجهة تسجيل الدخول ظاهرياً هي بوابة دخول الطالب، والدخول الإداري للمعلم يتم عبر بوابة خفية (النقر الخماسي على شعار المجموع الرياضي $\sum$ أو كتابة بادئة المعلم في حقل الكود).

3. **دستور المنصة البرمجي الصارم (`AGENTS.md Compliance`):**
   - **قانون الذرية المطلقة (`One Micro-Feature = One File`):** كل خاصية فرعية تسكن في ملف مستقل باسم فريد عالمياً لا يتكرر في المشروع كله.
   - **السقف الأقصى للأسطر:** ألا يتجاوز أي ملف برمجي 200 سطر (والحد الاستثنائي للضرورة 250 سطراً).
   - **أولوية الهاتف المحمول الصارمة (99% Mobile-First):** المنصة مصممة ومختبرة لتعمل بسلاسة مطلقة على شاشات الهواتف المحمولة (`360px - 430px`) بأزرار لا يقل ارتفاعها عن `44px`، وشريط تنقل سفلي زجاجي (`Bottom Dock`)، وتحجيم تناسبي تلقائي لورقة الـ A4.

---

## 2. خريطة الهيكل الشاملة للشجرة البرمجية (Repository Architecture Map)

```
math-platform/
├── docs/                                 # التوثيقات الفنية والتقارير المعمارية
│   └── التقرير المعمق 1 لموقع math.md   # هذه الوثيقة المرجعية الشاملة
├── tests/                                # الاختبارات الآلية (Vitest)
│   ├── geometry-similarity-catalogs-and-smart-prompt.test.ts
│   ├── math-text-canonicalizer-contract.test.ts
│   ├── notebooklm-dilation-lesson-ingestion.test.ts
│   └── teacher-auth-server-ssot.test.ts
├── src/
│   ├── middleware.ts                     # جدار حماية المسارات الإدارية للمعلم بالخادم
│   ├── app/                              # مسارات Next.js (App Router)
│   │   ├── page.tsx                      # البوابة الموحدة للدخول والتسجيل
│   │   ├── layout.tsx                    # التغليف العام للمنصة والخطوط وثيم الألوان
│   │   ├── globals.css                   # التنسيقات العامة وقواعد KaTeX و Tailwind CSS
│   │   ├── dashboard/page.tsx            # لوحة تحكم المعلم التنفيذية والتحليلات
│   │   ├── studio/page.tsx               # استوديو التوليد وتصميم المذكرات والـ PDF
│   │   ├── library/page.tsx              # مستكشف المنهج، كبسولات الدروس، وروابط NotebookLM
│   │   ├── assessments/page.tsx          # مركز الامتحانات الإلكترونية وإصدار الشهادات
│   │   ├── settings/page.tsx             # مركز إعدادات وهوية المعلم والصفوف المفعّلة
│   │   ├── student/page.tsx              # بوابة الطالب التعليمية المتكاملة
│   │   └── api/auth/                     # نقاط المصادقة الآمنة على الخادم
│   │       ├── teacher-login/route.ts    # توثيق المعلم وإصدار كوكي HttpOnly
│   │       ├── teacher-logout/route.ts   # إنهاء جلسة المعلم وحذف الكوكي
│   │       ├── teacher-session-check/    # فحص صلاحية جلسة المعلم الحالية
│   │       ├── student-login/route.ts    # دخول الطالب الفردي بدون تسريب بيانات زملائه
│   │       └── student-register/route.ts # تسجيل طالب جديد سحابياً
│   ├── core/                             # النواة ومصادر الحقيقة والمحركات الحتمية
│   │   ├── ssot/                         # مصادر الحقيقة الموحدة (Single Sources of Truth)
│   │   │   ├── curriculum-hierarchy-ssot.ts     # شجرة المنهج المصري والصفوف والوحدات
│   │   │   ├── math-branches-ssot.ts            # الفروع الـ 11 وألوانها وأيقوناتها
│   │   │   ├── numeral-and-unit-ssot.ts         # تحويل الأرقام (0-9 / ٠-٩) والرموز
│   │   │   ├── arabic-measurement-units-ssot.ts # وحدات القياس الهندسية والفيزيائية العربية
│   │   │   ├── teacher-identity-ssot.ts         # هوية المعلم، اللقب، المنصة، والعلامة المائية
│   │   │   ├── theme-mode-ssot.ts               # وضع الألوان (Ivory / Obsidian)
│   │   │   ├── pdf-print-settings-ssot.ts       # إعدادات الطباعة وهوامش الـ A4 والخطوط
│   │   │   ├── geometry-archetype-ssot.ts       # السجل المركزي للأشكال الهندسية القياسية
│   │   │   └── statistics-archetype-ssot.ts     # السجل المركزي للرسوم والجداول الإحصائية
│   │   ├── auth/                         # مصادقة المعلم المالك الموقعة بـ HMAC-SHA256
│   │   │   └── teacher-auth-server-ssot.ts      # إدارة توكن الجلسة والكوكي الآمن
│   │   ├── geometry-engine/              # محرك الهندسة الإنشائية والإسقاط الفيكتوري SVG
│   │   │   ├── natural-arabic-geometry-matcher.ts
│   │   │   ├── parametric-similarity-description-parser.ts
│   │   │   ├── vector-svg-figure-projector.ts
│   │   │   ├── vector-svg-angle-projector.ts
│   │   │   ├── vector-svg-surface-shading-projector.ts
│   │   │   ├── triangle-family/          # عائلات المثلثات وعلاقات التشابه
│   │   │   ├── circle-family/            # عائلات الدوائر والأوتار والزوايا المحيطية
│   │   │   ├── quadrilateral-family/     # متوازيات الأضلاع وشبه المنحرف والمستطيل
│   │   │   ├── analytic-function-family/ # المستوى الإحداثي، الدوال التربيعية والخطية
│   │   │   ├── spatial-3d-family/        # المجسمات، الهرم، المخروط، والأسطوانة
│   │   │   └── curriculum-catalogs/      # قوالب الهندسة القياسية لكتب الوزارة
│   │   ├── pdf-layout-engine/            # محرك تخطيط وتعبئة صفحات الـ A4 الانسيابي
│   │   │   ├── flow-page-packer.ts       # تعبئة الصفحات ومنع الفراغات الزائدة
│   │   │   ├── flow-column-balance-solver.ts # موازنة العمودين في الورقة المطبوعة
│   │   │   ├── flow-measurement-staging-platform.tsx # القياس الحي لارتفاع الأسئلة
│   │   │   ├── sovereign-discrete-page-view.tsx # مصير ورقة الـ A4 البيضاء المستقلة
│   │   │   ├── adaptive-mcq-options-grid-solver.ts # توزيع خيارات الاختيار من متعدد
│   │   │   ├── flow-page-slack-distributor.ts # توزيع المسافات الرأسية المتوازنة
│   │   │   └── use-a4-mobile-zoom-scale.ts # التحجيم التناسبي التلقائي على الجوال
│   │   └── supabase/                     # التكامل السحابي وقنوات Realtime
│   │       ├── supabase-cloud-sync-ssot.ts # المزامنة مع جداول Supabase السحابية
│   │       └── supabase-realtime-submissions-channel.ts # استقبال التسليمات اللحظية
│   ├── features/                         # الحزم الوظيفية المستقلة
│   │   ├── unified-auth/                 # تسجيل الدخول، إنشاء الحساب، والبوابة الخفية
│   │   ├── teacher-home-dashboard/       # لوحة القيادة، التحليلات، وقاعة المتميزين
│   │   ├── generation-studio-hub/        # استوديو المذكرات والامتحانات ومعمل الهندسة
│   │   ├── curriculum-library-hub/       # مستكشف الدروس، كبسولات NotebookLM، وأرشيف Drive
│   │   ├── electronic-exams-hub/         # إدارة ونشر الامتحانات، الشهادات، والمؤقت
│   │   ├── homework-drills-hub/          # منشئ الواجبات والتصحيح الآلي
│   │   ├── video-lectures-hub/           # مشغل الفيديوهات المحمي والملاحظات التفاعلية
│   │   ├── teacher-settings-hub/         # تعديل بيانات المعلم، ضغط اللوجو، وإدارة الصفوف
│   │   ├── student-learning-portal/      # شاشات الطالب (امتحانات، واجبات، مذكرات، فيديوهات)
│   │   └── pdf-preview-controls/         # أدوات التحكم الـ 11 الذرية في ورقة الـ PDF
│   └── components/                       # المكونات المشتركة
│       └── global-ui/
│           ├── safe-katex-bidi-math-renderer.tsx # مفسر KaTeX ثنائي الاتجاه الآمن
│           ├── top-four-centers-navigation-bar.tsx # شريط التنقل العلوي والسفلي الموحد
│           ├── global-theme-mode-toggle-button.tsx # زر تبديل الوضع الليلي / النهاري
│           └── math-formula-fit-box.tsx # احتواء المعادلات الطويلة ومنع كسر التصميم
```

---

## 3. تشريح الصفحات السبع والمراكز الحيوية (Deep Hub Anatomy)

### 3.1. البوابة الموحدة للدخول والتسجيل (`/`)
- **الملف المسؤول:** `src/features/unified-auth/unified-portal-login-view.tsx`
- **المكونات الفرعية:**
  - `stealth-teacher-unlock-trigger.tsx`: البوابة الخفية للمعلم المالك.
  - `student-code-login-form.tsx`: نموذج دخول الطالب وتسجيل حساب جديد.
- **آلية العمل:**
  1. تفتح الصفحة بواجهة هادئة خالية من أي إشارات لوجود لوحة تحكم إدارية.
  2. في تبويب «دخول الطالب»، يدخل الطالب رقمه السريع أو هاتفه ورقم الـ PIN، فيتم توثيقه بالخادم عبر `/api/auth/student-login` وتوجيهه لصفحة `/student`.
  3. في تبويب «تسجيل طالب جديد»، يملأ الطالب اسمه ورقم هاتفه وصفه ورقم سري، فيصدر له كود فريد فوراً عبر `/api/auth/student-register`.
  4. دخول المعلم المالك: يتم بالنقر 5 مرات متتالية على أيقونة الشعار $\sum$؛ فتنفتح نافذة سرية تطلب اسم المستخدم وكلمة المرور (محجوبان عمداً من هذا التقرير لأسباب أمنية؛ يُضبطان عبر متغيرات البيئة — انظر المهمة S-2). عند الضغط على الزر، يُرسل الطلب للخادم عبر `/api/auth/teacher-login` الذي يصدر كوكي جلسة مشفر `HttpOnly`، ثم ينقله للرئيسية `/dashboard`.

---

### 3.2. لوحة تحكم المعلم التنفيذية والتحليلات (`/dashboard`)
- **الملف المسؤول:** `src/features/teacher-home-dashboard/teacher-executive-dashboard-view.tsx`
- **المكونات الفرعية:**
  - `honor-roll-podium.tsx`: منصة التتويج للمراكز الثلاثة الأولى في كل صف.
  - `grade-honor-roll-ssot.ts`: محرك حساب المتوسطات والتصنيفات وقاعة المتميزين.
- **الأدوات والمؤشرات الحية:**
  - **شريط المؤشرات الأربعة:** (إجمالي الطلاب المسجلين، عدد المسلّمين للامتحانات، إجابات بانتظار المراجعة، متوسط الدرجات العام).
  - **محدد الصفوف السريع:** شريط أفقي قابل للسحب باللمس للتبديل بين الصفوف الدراسية المفعّلة.
  - **منصة الشرف وقاعة المتميزين:** تعرض أصحاب المراكز (الذهبي، الفضي، البرونزي) الحاصلين على $\ge 70\%$ تلقائياً ومباشرة مع شارات متميزة.
  - **لوحة التحليلات التفاعلية (تبديل بنقرة):**
    - زر «مقارنة الصفوف»: رسم بياني بمعدل أداء كل صف.
    - زر «المشاركة»: نسبة الطلاب الذين أتموا الاختبارات مقارنة بإجمالي المسجلين.
    - زر «توزيع الدرجات»: مدرج تكراري يقسم النتائج إلى 4 فئات لونية (أقل من 50، 50–69، 70–84، 85 فأكثر).
  - **الاتصال اللحظي Realtime:** يستمع لقناة Supabase لتحديث الأرقام ومنصة الشرف فور قيام أي طالب بتسليم امتحانه من هاتفه دون الحاجة لعمل Refresh.

---

### 3.3. استوديو التوليد ومعاينة الـ PDF (`/studio`)
- **الملف المسؤول:** `src/features/generation-studio-hub/teacher-generation-studio-view.tsx`
- **الألسنة الخمسة المستقلة للاستوديو:**
  1. `studio-booklet-generator-tab.tsx`: استوديو توليد المذكرات الشاملة (شرح، أمثلة محلولة، تمارين).
  2. `studio-exam-generator-tab.tsx`: استوديو توليد الامتحانات المدرسية الشهرية والنهائية وتوزيع الدرجات.
  3. `studio-final-review-generator-tab.tsx`: استوديو كبسولات المراجعة المركزة ونماذج ليلة الامتحان.
  4. `studio-worksheet-generator-tab.tsx`: استوديو أوراق العمل المكثفة والتمارين السريعة للتدريب الصفي.
  5. `studio-visual-geometry-lab-tab.tsx`: معمل الهندسة البصري الحي لتجربة رسم وتحريك الأشكال الهندسية الإنشائية.
- **مراحل العمل الثلاث (Stage Stepper):**
  - المرحلة 1 `[الإدخال والمصدر]`: لصق رد NotebookLM أو كتابة محتوى الدرس.
  - المرحلة 2 `[التخصيص الفني]`: اختيار نوع المخرج، الصف، الفرع، وتوزيع الدرجات.
  - المرحلة 3 `[المعاينة والطباعة]`: ظهور ورقة الـ A4 التفاعلية وأدوات التحكم الـ 11.
- **محاكي الهاتف المحمول الذكي:** زر عائم يتيح للمعلم على شاشة الهاتف التبديل بلمسة واحدة بين لوح الإعدادات ولوح معاينة الورقة المطبوعة دون انضغاط أو تداخل.

---

### 3.4. مستكشف المنهج وأرشيف الكبسولات (`/library`)
- **الملف المسؤول:** `src/features/curriculum-library-hub/teacher-curriculum-library-view.tsx`
- **المكونات الفرعية:**
  - `curriculum-notebooklm-splitter-tab.tsx`: أداة توليد برومبتات NotebookLM الرسمية ونسخها بضغطة زر.
  - `curriculum-saved-units-list.tsx`: استعراض الشجرة الرسمية لمناهج الوزارة لجميع الصفوف الـ 7 المفعّلة.
  - `saved-booklets-reviews-archive-tab.tsx`: أرشيف المذكرات والاختبارات التي تم حفظها سابقاً.
  - `overmath-google-drive-vault.ts`: جسر المزامنة التلقائية مع Google Drive للمعلم لحفظ المذكرات سحابياً.

---

### 3.5. مركز إدارة الاختبارات الإلكترونية الحية (`/assessments`)
- **الملف المسؤول:** `src/features/electronic-exams-hub/electronic-exams-manager-view.tsx`
- **المكونات الفرعية:**
  - `published-exams-list-tab.tsx`: إدارة الاختبارات النشطة المنشورة للطلاب ومؤقتات انتهائها التلقائية.
  - `student-honor-certificate-generator.tsx`: محرك إصدار شهادات التقدير الرسمية الفورية عالية الدقة للطلاب المتفوقين.
  - `video-lectures-quick-manager-tab.tsx`: ربط المحاضرات المرئية بالدروس والواجبات.
- **الأزرار الحيوية:**
  - زر «نشر اختبار جديد»: يحول أي مذكرة أو امتحان تم إعداده في الاستوديو إلى اختبار تفاعلي حي للطلاب.
  - حقل «مدة صلاحية الاختبار بالساعات»: لضبط المؤقت الزمني لغلق الامتحان وأرشفته تلقائياً.

---

### 3.6. مركز الإعدادات وهوية المعلم والصفوف (`/settings`)
- **الملف المسؤول:** `src/features/teacher-settings-hub/teacher-platform-settings-view.tsx`
- **المكونات والأقسام الذرية:**
  - `settings-teacher-identity-section.tsx`: تعديل اسم المعلم، اللقب، الهاتف، المحافظة، ونص التذييل.
  - `settings-platform-logo-section.tsx`: رفع لوجو المنصة وضغطه محلياً لتقليل حجمه قبل الحفظ.
  - `settings-enabled-grades-section.tsx`: تفعيل وإلغاء تفعيل الصفوف الدراسية المتاحة لهذا العام.
  - `settings-notebooklm-links-section.tsx`: تعيين رابط دفتر NotebookLM المخصص لكل صف دراسي لفتحه مباشرة بضغطة زر.

---

### 3.7. بوابة الطالب التعليمية المتكاملة (`/student`)
- **الملف المسؤول:** `src/features/student-learning-portal/student-learning-portal-view.tsx`
- **التبويبات الأربعة المستقلة للطالب:**
  1. `student-assigned-exams-tab.tsx`: أداء الاختبارات الإلكترونية الحية المنشورة لصف الطالب مع مؤقت تنازلي.
  2. `student-virtual-math-keypad.tsx`: لوحة مفاتيح رياضية افتراضية لكتابة الرموز الرياضية المعقدة (الجذور، الكسور، الأسس، علامات الهندسة والزوايا) باللمس المباشر من الهاتف.
  3. `student-assigned-booklets-tab.tsx`: تصفح وقراءة مذكرات الشرح وتنزيلها كملفات PDF رسمية.
  4. `student-assigned-videos-tab.tsx`: مشاهدة الشروحات المرئية المحمية الخاصة بكل فكرة رياضية.

---

## 4. تشريح أدوات التحكم الـ 11 الذرية في ورقة الـ PDF A4

تتجمع أدوات التحكم المستقلة عبر المنسق المركزي `pdf-preview-orchestrator.tsx` لتعديل مظهر الورقة المطبوعة لحظياً دون إعادة تحميل الصفحة:

| الأداة وملفها الذري | وظيفتها والهدف من وجودها | الخيارات المتاحة |
|---|---|---|
| `pdf-numeral-system-switch.tsx` | التحويل اللحظي بين نظامي الأرقام في الطباعة والمسائل الرياضية. | **أرقام مشرقية عربية** (`٠-٩`) أو **أرقام غربية** (`0-9`). |
| `pdf-font-family-selector.tsx` | تبديل نوع الخط العربي المستخدم في متن الورقة والعناوين. | 5 خطوط عربية فائقة الوضوح: (`Almarai`, `Cairo`, `IBM Plex Sans Arabic`, `Readex Pro`, `Tajawal`). |
| `pdf-exact-fontsize-control.tsx` | التحكم الدقيق في حجم خط الأسئلة بالـ Point للطباعة المريحة للعين. | درجات حجم محددة ومحسوبة: (`12pt`, `12.5pt`, `13pt`, `14pt`, `15pt`, `16pt`). |
| `pdf-answer-visibility-mode.tsx` | تحديد نوع النسخة المراد طباعتها للمعلم أو الطالب. | 3 أوضاع: `أسئلة فقط للطلاب` / `أسئلة بإجابات نموذجية` / `نموذج إجابة فقط`. |
| `pdf-columns-layout-toggle.tsx` | التحكم في توزيع محتوى الصفحة وتوفير الورق. | **عمود واحد** كامل أو **عمودان صحفيان** مع خط فاصل جمالي وتوزيع متوازن. |
| `pdf-color-theme-selector.tsx` | اختيار الهوية اللونية للشريط والبراويز في المذكرة. | 4 أطقم لونية: `أزرق كلاسيكي ملكي`, `زمردي تعليمي`, `نيلي حديث`, `أحادي رمادي اقتصادي للطباعة`. |
| `pdf-density-budget-selector.tsx` | ميزانية الكثافة وضغط المسافات الرأسية في الصفحة. | 3 مستويات: `مريح (Relaxed)` / `قياسي (Standard)` / `مكثف لتوفير الورق (Compact)`. |
| `pdf-answer-space-style-selector.tsx` | شكل المساحة المخصصة لحل الطالب تحت كل سؤال مقالي. | 4 أشكال: `أسطر مسطرة للكتابة`, `شبكة مربعات هندسية بيانية`, `مربع إجابة مفتوح`, `بدون مساحة`. |
| `pdf-notation-direction-switch.tsx` | اتجاه التعبير الرياضي والرموز الجبرية. | `رياضيات عربية (س، ص، يمين-يسار)` أو `رياضيات لاتينية (x, y, LTR)`. |
| `pdf-header-branding-editor.tsx` | تخصيص الترويسة المطبوعة أعلى الورقة والعلامة المائية. | إظهار/إخفاء اللوجو، ترويسة مخصصة بالاسم واللقب، والعلامة المائية المائلة. |
| `pdf-isolated-print-trigger.ts` | زر أمر الطباعة المعزول عالي الدقة. | يستدعي دالة عزل الحاوية وطباعتها بأبعاد `210mm × 297mm` وجودة Vector 100%. |

---

## 5. المحركات التقنية والرياضية الداخلية العميقة

### 5.1. محرك تعبئة الصفحات الانسيابي (`Flow Page Packing Engine`)
- **الملفات:** `flow-page-packer.ts`, `flow-measurement-staging-platform.tsx`, `flow-page-slack-distributor.ts`
- **طريقة عمله:** 
  1. يقوم برسم عناصر المذكرة (العناوين، الأسئلة، الخيارات، الأشكال الهندسية) في مسرح قياس خفي بالخلفية (`Staging Platform`) لحساب الارتفاع الحقيقي الدقيق لكل عنصر بالبكسل.
  2. يقوم خوارزم التعبئة بحساب الميزانية المتبقية في صفحة الـ A4 (الحد الأقصى لارتفاع الصفحة مطروحاً منه الهوامش والترويسة والتذييل).
  3. يمنع قطع السؤال الواحد بين صفحتين (No Question Splitting). إذا لم يتسع السؤال في الصفحة الحالية، يُنقل كاملاً للصفحة التالية.
  4. تقوم أداة `flow-page-slack-distributor` بتوزيع المساحة البيضاء المتبقية أسفل الصفحة بتناسق هندسي بين الأسئلة لمنع الفراغات الشاذة.

### 5.2. محرك الهندسة الإنشائية والإسقاط الفيكتوري (`Vector SVG Geometry Engine`)
- **الملفات:** `natural-arabic-geometry-matcher.ts`, `vector-svg-figure-projector.ts`, ومجلدات العائلات الهندسية.
- **طريقة عمله:**
  - **مبدأ خلو الذكاء الاصطناعي من الأكواد (Zero-DSL):** نموذج NotebookLM لا يكتب أكواد رسم ولا SVG؛ بل يكتب وصفاً طبيعياً بالعربية: `[رسم هندسي: مثلث أ ب جـ قائم في ب، أ ب = ٦ سم، ب جـ = ٨ سم]`.
  - يقوم المحلل باستنتاج رؤوس الشكل وأطوال أضلاعه وزواياه حتمياً، ورسمه كملف متجهي Vector SVG نقي يحتوي على:
    - تسميات الحروف العربية مع خلفيات حماية لعدم تداخل الحروف مع الخطوط.
    - أقواس الزوايا وقيمها ومربعات الزوايا القائمة الحقيقية.
    - تظليل المساحات والمناطق الهندسية المطلوبة تلقائياً.

### 5.3. عازل الرياضيات ثنائي الاتجاه (`Safe KaTeX BiDi Math Renderer`)
- **الملف:** `safe-katex-bidi-math-renderer.tsx`
- **طريقة عمله:**
  - حل معضلة الرموز الرياضية في الواجهات العربية؛ فعند كتابة كسر أو معادلة لاتينية وسط جملة عربية يحدث عادة تشوه في ترتيب الأقواس وانعكاس للأرقام.
  - يقوم المكون بعزل كل كتلة معادلة رياضية داخل حاوية عزل اتجاهي (`dir="ltr" unicode-bidi="isolate"`) مع إتاحة معالجة المتغيرات العربية المخصصة بسلاسة.

---

## 6. سجل العيوب والمخاطر التقنية القائمة (Known Flaws & Technical Debt)

| العيب البرمجي / المعماري | موقعه في الكود | مستوى الخطورة | الأثر الفعلي على النظام |
|---|---|---|---|
| **1. تصحيح الامتحانات محلياً في هاتف الطالب** | `student-assigned-exams-tab.tsx` | 🟠 متوسط | نموذج الإجابة يصل للمتصفح مع الأسئلة، والدرجة تحسب محلياً. يستطيع طالب متمكن برمجياً التلاعب بالنتيجة وإرسال 100% لقاعة المتميزين. |
| **2. ملفات تتجاوز سقف الـ 200 سطر الدستوري** | `student-code-login-form.tsx` (465 سطر)، `teacher-executive-dashboard-view.tsx` (349 سطر) | 🟡 منخفض | صعوبة مراجعة الملف مستقبلاً واستهلاك زائد للتوكنز عند طلب تعديلات محددة. |
| **3. الاعتماد على Regex طويل لمخرجات NotebookLM** | `parametric-similarity-description-parser.ts` | 🟡 منخفض | إذا غيرت Google أسلوب صياغة NotebookLM أو وضع الرد علامات ترقيم غير متوقعة، قد يفشل المحلل في استخراج الشكل الهندسي بدقة. |
| **5. ثغرات خطيرة إضافية مكتشفة في الإصدار 2.0** | انظر البند B1 في الجزء الثاني (D1–D24): تصحيح خاطئ يمنح الدرجة الكاملة لأي نص، إجابات صحيحة مكشوفة، كتابة مباشرة في قاعدة البيانات من المتصفح، ثغرة PIN، رسوم قوالب ثابتة، `targetMaxPages` غير مستخدم | 🔴 حرج | تُعالج في المراحل 0–5 |
| **4. تثبيت عداد الصفحات في Drive (`pagesCount: 1`)** | `pdf-preview-orchestrator.tsx` | 🟢 طفيف | عند حفظ المذكرة تلقائياً في Google Drive، يسجل السجل عداد الصفحات كـ 1 دائماً حتى لو كانت المذكرة 5 صفحات. |

---

## 7. خارطة الطريق الهندسية وأفضل الحلول المعمارية (Roadmap & Solutions)

> **تنبيه:** خارطة الطريق في هذا القسم حلّت محلها الخطة التفصيلية في **الجزء الثاني (B0–B5)**؛ بند 7.1 مُنفَّذ فيها بمهام E-5 … E-9.

### 7.1. حل عيب تصحيح الامتحانات (المرحلة القادمة)
- **الحل الهندسي المقترح:**
  1. إنشاء نقطة خادم آمنة `/api/exams/submit`.
  2. عند فتح الطالب للامتحان، تُرسل له الأسئلة والخيارات **فقط** بدون أي إجابات صحيحة وبدون درجات التقييم.
  3. يرسل هاتف الطالب مصفوفة اختياراته فقط `{ questionId, selectedIndex }` إلى الخادم.
  4. يتولى الخادم مقارنة الإجابات بنموذج الإجابة المحفوظ في قاعدة البيانات، وحساب الدرجة المستحقة، وتسجيلها في جدول `exam_submissions` مباشرة، وإرجاع النتيجة والشهادة للطالب.

### 7.2. تفكيك الملفات الطويلة وفق قانون الذرية المطلقة
- تفكيك `student-code-login-form.tsx` إلى:
  - `student-login-credentials-tab.tsx`: لنموذج تسجيل الدخول للطلاب المسجلين.
  - `student-new-registration-tab.tsx`: لنموذج تسجيل الحساب الجديد.
  - `student-welcome-badge-card.tsx`: لبطاقة استلام الكود والترحيب.

### 7.3. تعزيز اختبارات المحللات الهندسية ومخرجات NotebookLM
- بناء مجموعة اختبارات تراجع حقيقية (`Golden Test Suite`) تحتوي على 20 نموذجاً حقيقياً من ردود NotebookLM لجميع الفروع الرياضية، والتأكد من نجاح تحليلها تلقائياً قبل كل اعتماد برمجي.

---

> **خلاصة الوثيقة:**
> هذا الملف يمثل المرجع الهندسي النهائي لتصميم وتشغيل وتطوير منصة الرياضيات الخاصة بالأستاذ إسلام حلاوة. تم إيداع هذا التقرير وتوثيقه ليكون دليلاً معمارياً دائماً يتيح فهم كل تفصيلة في النظام بسهولة وثقة تامة.

---
---

# الجزء الثاني — خطة التطوير المفصّلة (إصدار 2.0)
**تاريخ الإضافة:** 29 أكتوبر 2026 — **مصدر هذا الجزء:** فحص فعلي لكامل الكود (`src.zip`)، والدوال الحرجة المرفقة هنا **كُتبت واختُبرت فعلياً** (47 اختبار Vitest ناجح + `tsc` بلا أخطاء)، فانسخها كما هي.

> **الأهداف الأربعة المطلوبة:**
> 1. امتحانات إلكترونية من ردود NotebookLM: عرض + تصحيح دقيق + مؤثرات بصرية.
> 2. مذكرات ومراجعات نهائية PDF احترافية توفّر الورق وتملأ مساحة الورقة تلقائياً في أي درس وأي منهج.
> 3. اختبارات PDF بحد أقصى ورقتين مع مكان مرن للشكل/الرسم بجوار السؤال.
> 4. نظام ذكي لتركيب أشكال هندسية مركّبة من وصف NotebookLM (لا يقتصر على درسين).

---

## B0. قواعد إلزامية للمبرمج (اقرأها قبل كل مهمة)

1. نفّذ **مهمة واحدة فقط** في كل مرة وبالترتيب المكتوب. لا تبدأ مهمة قبل تحقق «معيار القبول» للسابقة.
2. **لا تعدّل أي ملف غير مذكور** في المهمة. الملفات الجديدة تُنشأ بالاسم والمسار المذكورين حرفياً.
3. ملفات «انسخ كما هي» (مكتوب فيها الكود كاملاً): انسخها **بدون أي تعديل أو تحسين**، حتى لو ظننت أن هناك طريقة أفضل.
4. سقف الملف 200 سطر. لا تغيّر أسماء دوال أو أنواع موجودة. أضف ولا تحذف إلا إذا قالت المهمة «احذف».
5. بعد كل مهمة شغّل: `npx tsc --noEmit` ثم `npx vitest run`. لا تنتقل إن فشل أيهما.
6. ممنوع تثبيت أي مكتبة npm جديدة. كل المؤثرات البصرية بـ CSS فقط.
7. كل نص يظهر للمستخدم بالعربية. أزرار لا تقل عن 44px. الهاتف أولاً.
8. ممنوع تخزين **الإجابات الصحيحة** في `localStorage` أو إرسالها للمتصفح قبل تسليم الطالب.
9. إن لم تفهم خطوة: لا تخمّن. اكتب سؤالك في آخر ردك وتوقف.
10. في نهاية كل مهمة اكتب فقط: (الملفات التي لمستها) + (نتيجة tsc) + (نتيجة vitest).
11. ممنوع «إعادة هيكلة» أو «تحسين» أي شيء لم يُطلب.
12. الاختبارات تُنسخ إلى مجلد `tests/` كما هي، وتُشغَّل بـ `npx vitest run`.

**متغيرات البيئة التي يضبطها المالك في Vercel/الاستضافة (ليست مهمة للمبرمج):**
`SUPABASE_SERVICE_ROLE_KEY` ، `TEACHER_ADMIN_PASSWORD` ، `TEACHER_SESSION_SECRET` ، `STUDENT_SESSION_SECRET`.

---

## B1. التشخيص: ما وجدته فعلياً في الكود

### أ) الامتحانات الإلكترونية
| # | الحقيقة المؤكدة | الملف | الخطورة |
|---|---|---|---|
| D1 | **تصحيح خاطئ للأسئلة غير الاختيارية:** `gradeStudentHomeworkAnswer` يحذف كل ما ليس رقماً من الإجابة الصحيحة. إن كانت الإجابة نصاً («المثلثان متشابهان») تصبح فارغة فيُمنح الطالب **الدرجة الكاملة على أي كلام يكتبه**. وإن كانت رقماً (5) يُقبل أي نص يحتوي الرقم 5 (مثل 15 أو 25). | `homework-auto-grading-engine.ts` | 🔴 حرجة |
| D2 | الإجابات الصحيحة وخطوات الحل تُخزَّن مع الأسئلة في `questions_json` وفي `localStorage` — أي طالب يراها من أدوات المتصفح. | `supabase-cloud-sync-ssot.ts` | 🔴 حرجة |
| D3 | المتصفح يكتب **مباشرة** في جدولي `electronic_exams` و`exam_submissions` بمفتاح عام: يمكن لأي شخص تزوير تسليم 100% أو نشر/أرشفة امتحان. | نفس الملف | 🔴 حرجة |
| D4 | التسليم يحفظ **النسبة فقط**؛ لا تُحفظ إجابات الطالب، فلا مراجعة للمعلم ولا للطالب لاحقاً. | `grade-honor-roll-ssot.ts` | 🟠 |
| D5 | المؤقت يبدأ من جديد عند تحديث الصفحة، ولا وقت بدء محفوظ؛ ومسح التخزين يسمح بإعادة الامتحان واستبدال الدرجة. | `live-exam-countdown-timer.tsx` + `student-assigned-exams-tab.tsx` | 🟠 |
| D6 | لا مؤثرات بصرية: لا شريط تقدم، لا تلوين صح/خطأ، شاشة النتيجة نص ثابت. بعد التسليم لا يُظهر الاختيار الصحيح. | `student-assigned-exams-tab.tsx` (309 سطر) | 🟡 |
| D7 | `live-exam-instant-evaluator.ts` ملف ميت (غير مستخدم في أي مكان) وبمنطق مختلف. | `electronic-exams-hub/` | 🟢 |
| D8 | برومبت الامتحان لا يطلب «الإجابات المقبولة»، ويسمح بمسائل برهان لا يمكن تصحيحها آلياً. | `official-exam-prompt-builder.ts` | 🟠 |
| D9 | **ثغرة دخول:** `if (studentRow.pin_code && pin && ...)` — إن ترك المهاجم خانة الـPIN فارغة يدخل بحساب أي طالب بمعرفة كوده/هاتفه فقط. | `api/auth/student-login/route.ts` | 🔴 حرجة |
| D10 | كلمة مرور المعلم الافتراضية ومفتاح التوقيع مكتوبان في الكود (`TEACHER_ADMIN_DEFAULT_PASS`, `DEFAULT_JWT_SECRET`)، وكانت كلمة المرور مكتوبة في التقرير الأول (**حُذفت منه الآن — غيّرها فوراً**). | `teacher-auth-server-ssot.ts` | 🔴 حرجة |
| D11 | لا توجد جلسة للطالب في الخادم، لذا لا يمكن للخادم معرفة من يُسلّم. | `student-login/route.ts` | 🟠 |

### ب) محرك الـ PDF
| # | الحقيقة المؤكدة | الملف |
|---|---|---|
| D12 | `targetMaxPages` معرّف في الإعدادات ولا يُستعمل في **أي** مكان. لا يوجد حد أقصى للصفحات. | `pdf-print-settings-ssot.ts` |
| D13 | المحرك يختار أقل عدد صفحات لكن **بخط ثابت**؛ لا يصغّر ولا يكبّر الخط تلقائياً، فتبقى آخر صفحة شبه فارغة أحياناً، وبعض الاختبارات تتجاوز ورقتين. | `flow-page-packer.ts` / `two-column-newspaper-packer.tsx` |
| D14 | الشكل بجوار السؤال **عرضه ثابت 152px** والرسم 146×102 مهما كان شكل الرسم أو ضغط الصفحة. لا مرونة. | `embedded-geometry-svg-docker.tsx` |
| D15 | مساحة إجابة الطالب ثابتة سطران (`h-3.5`) ولا يوجد وضع مضغوط. | `student-answer-space-docker.tsx` |
| D16 | الحد الأدنى للخط 12pt، وهذا لا يكفي لضغط اختبار طويل في ورقتين. | `pdf-print-settings-ssot.ts` |
| D17 | الترويسة الأولى وصندوق «الاعتماد» بحجم ثابت ولا يوجد وضع مضغوط لهما. | `sovereign-a4-page-chrome-elements.tsx` |
| D18 | عداد الصفحات المحفوظ في Drive ثابت `1`. | `pdf-preview-orchestrator.tsx` |

### ج) الرسومات
| # | الحقيقة المؤكدة | الملف |
|---|---|---|
| D19 | «المحرك الهندسي» فعلياً **قوالب جاهزة** تُختار بكلمات مفتاحية؛ كل قالب يحمل رؤوساً وأطوالاً ثابتة (مثلاً `baseLengthCm=10` و`ratio=0.4`) و`buildTriangleThalesParallelFigure` يُستدعى **دون تمرير أي رقم من الوصف**. لذلك ينجح في الدرسين اللذين بُنيت قوالبهما فقط، ويعطي شكلاً مختلفاً عن السؤال في أي درس آخر. | `natural-arabic-geometry-matcher.ts` |
| D20 | المحلل البارامتري الوحيد (`parametric-similarity-description-parser.ts`) يخص رباعيين متشابهين فقط ومواضع نقاطه ثابتة. | نفس المجلد |
| D21 | عند الفشل تُرجع الدالة `undefined` فيُطبع السؤال **بلا رسم وبلا أي تنبيه للمعلم**. ودالة `matchArabicDescriptionToCanonicalGeometryFigure` ترجع «مثلث منتصفات» لأي وصف غير مفهوم (شكل خاطئ بصمت). | نفس الملف |
| D22 | **الرسوم البيانية غير مدعومة فعلياً:** قائمة الاستبعاد في المطابق ترفض أوصافاً فيها «رسم بياني/إحداثيات/مستوى إحداثي» قبل أن تصل لفرع المنحنيات، ومجلد `statistics-engine` **غير موصول بأي ملف** (لا محلل ولا مصيّر)، و`PrintableMathQuestionItem` ليس فيه حقل رسم بياني. | `natural-arabic-geometry-matcher.ts` + `a4-vector-html-sheet-renderer.ts` |
| D23 | التظليل يُخمَّن من **عدد الرؤوس** (6 → مثلثان، 8 → رباعيان، 3/4/5 → مضلع واحد، غير ذلك → أول 4 رؤوس)، فتظهر أخطاء تظليل في الأشكال المركبة. | `vector-svg-surface-shading-projector.ts` |
| D24 | تسميات قريبة من حافة الرسم قد تُقصّ (padding بين 9 و13px فقط). | `vector-svg-figure-projector.ts` |

---

## B2. القرارات المعمارية (لماذا هذا الحل)

**1) التصحيح في الخادم فقط.** الطالب يستلم أسئلة بلا إجابات، ويرسل اختياراته، والخادم يصحح ويحفظ ويرجع النتيجة. الجلسة بكوكي موقّع للطالب مثل المعلم.

**2) الامتحان الإلكتروني أنواعه قابلة للتصحيح الآلي فقط:** اختيار من متعدد + إجابة قصيرة (رقم/تعبير/كلمة). المصحّح يطبّع الأرقام العربية والكسور والجذور والوحدات ويقارن **عددياً**. أسئلة البرهان/المقالي تبقى للـ PDF فقط، وتُستبعد من النشر الإلكتروني مع تنبيه للمعلم بأرقامها (لا نخمّن تصحيح البرهان).

**3) ملاءمة الصفحات تلقائياً (Auto-Fit):** بدل ضبط يدوي، المحرك يجرّب «سلّماً» من الإعدادات (خط، حجم الشكل، أسطر الإجابة، ترويسة مضغوطة…) من الأريح إلى الأضغط، ويقيس عدد الصفحات لكل درجة، ثم يختار **أريح درجة** تعطي أقل عدد صفحات (أو ≤ الحد الأقصى للامتحان). هذا يغطي المذكرات (ملء الورق وتوفيره) والامتحان (≤ ورقتين) بنفس الآلية.

**4) الأشكال بـ«قائمة حقائق» لا بقوالب.** بدل أن يخمّن الكود من جملة حرة، نطلب من NotebookLM كتابة الشكل كسطور حقائق قصيرة مفصولة بـ `;` من **مفردات مغلقة** (مثلث، أ ب = 6، د على أ ب، د هـ // ب جـ، أ د ⊥ ب جـ، قطراه يتقاطعان في م…). هذه ليست كود رسم ولا إحداثيات (فلا تخالف مبدأ Zero-DSL)، لكنها ثابتة الصياغة. ثم **مركّب هندسي** يحسب الإحداثيات رياضياً (أطوال حقيقية، نقطة على ضلع بالنسبة، توازي، عمود، منصف، تقاطع…) ويُخرج نفس `CanonicalGeometryFigureIR` الحالي، فيبقى المصيّر SVG كما هو. القوالب القديمة تبقى **احتياطياً**.

```
[رسم هندسي: مثلث أ ب جـ ; د على أ ب ; هـ على أ جـ ; د هـ // ب جـ ; أ د = 2 سم ; د ب = 3 سم ; ب جـ = 10 سم]
```

---

## B3. ترتيب التنفيذ (لا تغيّره)

| المرحلة | الاسم | المهام | تخدم الهدف |
|---|---|---|---|
| 0 | الأمان والأساس | S-1 … S-4 | 1 |
| 1 | الامتحانات الإلكترونية | E-1 … E-13 | 1 |
| 2 | محرك الملاءمة التلقائية | P-1 … P-9 | 2 ، 3 |
| 3 | المذكرات والمراجعات | B-1 … B-4 | 2 |
| 4 | اختبار PDF ≤ ورقتين | X-1 … X-5 | 3 |
| 5 | الرسم الذكي | G-1 … G-12 | 3 ، 4 |
| 6 | الفحص النهائي | Q-1 … Q-3 | الكل |
| 7 | تنظيف الكود (ميت/يتيم/مكرر/حشو) | C-0 … C-8 | الكل |

---

# المرحلة 0 — الأمان والأساس

### S-1: إصلاح ثغرة الـ PIN
- **الملف (تعديل):** `src/app/api/auth/student-login/route.ts`
- **الخطوات:**
  1. ابحث عن السطر: `if (studentRow.pin_code && pin && studentRow.pin_code !== pin) {`
  2. استبدله بـ: `if (studentRow.pin_code && studentRow.pin_code !== pin) {`
  3. ابحث عن fallback الدخول المحلي في `src/features/unified-auth/student-code-login-form.tsx` (حول السطر 156، المقارنة `s.studentCode.toLowerCase() === trimmed.toLowerCase()`). إن كان يسمح بالدخول **بدون التحقق من PIN**، أضف شرط تطابق الـPIN قبل `onLoginSuccess`/الحفظ.
- **ممنوع:** تغيير شكل الرد JSON.
- **معيار القبول:** الدخول بكود صحيح وPIN فارغ لحساب له PIN يرجع 401. الدخول بPIN صحيح ينجح.

### S-2: منع الأسرار الافتراضية في الإنتاج
- **الملف (تعديل):** `src/core/auth/teacher-auth-server-ssot.ts`
- **الخطوات:**
  1. في `getSecretKey()`: إن كان `process.env.NODE_ENV === "production"` ولا يوجد `TEACHER_SESSION_SECRET` ارجع نصاً عشوائياً ثابتاً داخل العملية: `return "missing-secret-" + (globalThis.__MISSING_SECRET__ ??= crypto.randomUUID());` (فلا يمكن لأحد تزوير توكن).
  2. في `getTeacherMasterCredentials()`: في الإنتاج وبدون `TEACHER_ADMIN_PASSWORD` ارجع `password: ""` (فيفشل أي دخول لأن `verifyTeacherCredentials` يرفض الكلمة الفارغة).
  3. أبقِ القيم الافتراضية للتطوير المحلي فقط (`NODE_ENV !== "production"`).
- **معيار القبول:** في وضع التطوير يعمل الدخول كما كان. اختبار وحدة بسيط يغيّر `process.env.NODE_ENV` ويتحقق من رفض الدخول.

### S-3: جلسة الطالب (كوكي موقّع)
- **الملفات:** تعديل `teacher-auth-server-ssot.ts` + جديد `src/core/auth/student-auth-server-ssot.ts` + تعديل `student-login/route.ts` و`student-register/route.ts`.
- **الخطوات:**
  1. في `teacher-auth-server-ssot.ts` أضف كلمة `export` قبل الدوال الداخلية الثلاث: `base64UrlEncode` و`base64UrlDecode` و`getHmacCryptoKey` (لا تغيّر محتواها).
  2. أنشئ `student-auth-server-ssot.ts` بنفس بنية `createTeacherSessionToken` / `verifyTeacherSessionToken` مع الفروق فقط:
     - اسم الكوكي: `export const STUDENT_AUTH_COOKIE_NAME = "math_platform_student_session"`.
     - السرّ: `process.env.STUDENT_SESSION_SECRET` (بنفس منطق S-2 في الإنتاج).
     - الحمولة: `{ sub: studentCode, gradeId, role: "student", iat, exp }` ومدة 30 يوماً.
     - `createStudentSessionToken(studentCode: string, gradeId: string): Promise<string>`.
     - `verifyStudentSessionToken(token?: string | null): Promise<{ studentCode: string; gradeId: string } | null>` — يرجع `null` إن فشل التوقيع أو انتهت الصلاحية أو `role !== "student"`.
  3. في `student-login/route.ts` و`student-register/route.ts`: بعد نجاح العملية اضبط الكوكي على الرد **بنفس الطريقة حرفياً** التي يضبط بها `api/auth/teacher-login/route.ts` كوكي المعلم (HttpOnly, SameSite, Secure في الإنتاج, Path=/, MaxAge)، بالتوكن الجديد.
- **معيار القبول:** بعد تسجيل دخول الطالب يظهر الكوكي في أدوات المتصفح (HttpOnly). دالة `verifyStudentSessionToken` ترجع `null` لتوكن معدَّل حرفاً واحداً.

### S-4: حذف الملف الميت
- نفّذ `grep -rn "live-exam-instant-evaluator\|evaluateStudentLiveExamSubmission" src` — إن لم تجد إلا الملف نفسه، **احذف** `src/features/electronic-exams-hub/live-exam-instant-evaluator.ts`.
- **معيار القبول:** `tsc` ناجح.

---

# المرحلة 1 — الامتحانات الإلكترونية

### E-1: المصحّح الرياضي (انسخ كما هي)
أنشئ هذه الملفات بالمحتوى التالي **حرفياً** ثم ملف الاختبار.

**`src/core/exam-grading/math-simple-expression-evaluator.ts`**
```ts
/**
 * @file math-simple-expression-evaluator.ts
 * @description مقيّم تعبيرات عددية بسيطة وآمن (بدون eval): + - * / ^ وأقواس و sqrt(x) والأعداد العشرية.
 */
export const MODULE_ID_MATH_SIMPLE_EXPRESSION_EVALUATOR = "math_simple_expression_evaluator" as const;

type Tok = { t: "num"; v: number } | { t: "op"; v: string } | { t: "fn" } | { t: "lp" } | { t: "rp" };

function tokenize(src: string): Tok[] | null {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\d|\./.test(ch)) {
      let j = i;
      while (j < src.length && /[\d.]/.test(src[j])) j++;
      const n = Number(src.slice(i, j));
      if (!Number.isFinite(n)) return null;
      out.push({ t: "num", v: n });
      i = j;
    } else if (src.startsWith("sqrt", i)) {
      out.push({ t: "fn" });
      i += 4;
    } else if (ch === "(") { out.push({ t: "lp" }); i++; }
    else if (ch === ")") { out.push({ t: "rp" }); i++; }
    else if ("+-*/^".includes(ch)) { out.push({ t: "op", v: ch }); i++; }
    else return null;
  }
  return out;
}

const PREC: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, u: 3, "^": 4 };
const RIGHT = new Set(["^", "u"]);

/** يعيد الناتج العددي أو null إن لم يكن التعبير عددياً صالحاً. */
export function evaluateSimpleMathExpression(input: string): number | null {
  const toks = tokenize(input);
  if (!toks || toks.length === 0) return null;
  const output: Array<number | string> = [];
  const stack: string[] = [];
  let prevIsValue = false;
  for (const tk of toks) {
    if (tk.t === "num") {
      if (prevIsValue) { // ضرب ضمني: 2(3)
        while (stack.length && stack[stack.length - 1] !== "(" && PREC[stack[stack.length - 1]] >= PREC["*"]) output.push(stack.pop()!);
        stack.push("*");
      }
      output.push(tk.v); prevIsValue = true;
    } else if (tk.t === "fn") {
      if (prevIsValue) stack.push("*");
      stack.push("sqrt"); prevIsValue = false;
    } else if (tk.t === "lp") {
      if (prevIsValue) stack.push("*");
      stack.push("("); prevIsValue = false;
    } else if (tk.t === "rp") {
      while (stack.length && stack[stack.length - 1] !== "(") output.push(stack.pop()!);
      if (!stack.length) return null;
      stack.pop();
      if (stack[stack.length - 1] === "sqrt") output.push(stack.pop()!);
      prevIsValue = true;
    } else {
      let op = tk.v;
      if (!prevIsValue) {
        if (op === "-") op = "u"; else if (op === "+") continue; else return null;
      }
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top === "(" || top === "sqrt") break;
        const higher = PREC[top] > PREC[op] || (PREC[top] === PREC[op] && !RIGHT.has(op));
        if (higher) output.push(stack.pop()!); else break;
      }
      stack.push(op); prevIsValue = false;
    }
  }
  while (stack.length) {
    const top = stack.pop()!;
    if (top === "(") return null;
    output.push(top);
  }
  const st: number[] = [];
  for (const item of output) {
    if (typeof item === "number") { st.push(item); continue; }
    if (item === "u" || item === "sqrt") {
      const a = st.pop(); if (a === undefined) return null;
      if (item === "sqrt" && a < 0) return null;
      st.push(item === "u" ? -a : Math.sqrt(a));
    } else {
      const b = st.pop(); const a = st.pop();
      if (a === undefined || b === undefined) return null;
      if (item === "+") st.push(a + b);
      else if (item === "-") st.push(a - b);
      else if (item === "*") st.push(a * b);
      else if (item === "/") { if (b === 0) return null; st.push(a / b); }
      else if (item === "^") st.push(Math.pow(a, b));
      else return null;
    }
  }
  return st.length === 1 && Number.isFinite(st[0]) ? st[0] : null;
}
```

**`src/core/exam-grading/short-answer-matcher.ts`**
```ts
/**
 * @file short-answer-matcher.ts
 * @description يطبّع إجابة الطالب النصية الرياضية ويقارنها بقائمة الإجابات المقبولة (عددياً أولاً ثم نصياً).
 */
import { evaluateSimpleMathExpression } from "./math-simple-expression-evaluator";

export const MODULE_ID_SHORT_ANSWER_MATCHER = "short_answer_matcher" as const;

const EASTERN = "٠١٢٣٤٥٦٧٨٩";
const UNIT_WORDS = ["سنتيمتر", "سم²", "سم³", "سم2", "سم3", "سم", "متر", "م²", "م³", "م/ث²", "م/ث", "كجم", "جم", "نيوتن", "درجة", "درجات", "وحدة مربعة", "وحدة", "ثانية", "°"];

function digitsToWestern(s: string): string {
  return s.replace(/[٠-٩]/g, (d) => String(EASTERN.indexOf(d))).replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

function replaceLatexFractionsAndRoots(src: string): string {
  let s = src;
  for (let i = 0; i < 6; i++) {
    s = s.replace(/\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "(($1)/($2))");
    s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, "sqrt($1)");
  }
  return s;
}

export function normalizeMathAnswerText(raw: string): string {
  let s = digitsToWestern(String(raw ?? ""));
  s = s.replace(/\\text\s*\{([^{}]*)\}/g, "$1").replace(/\\left|\\right|\\,|\\;|\\!/g, "");
  s = replaceLatexFractionsAndRoots(s);
  s = s.replace(/\$/g, "").replace(/\\cdot|\\times|×|·/g, "*").replace(/÷/g, "/").replace(/[−–—]/g, "-");
  s = s.replace(/√\s*\(([^()]*)\)/g, "sqrt($1)").replace(/√\s*(\d+(?:\.\d+)?)/g, "sqrt($1)");
  s = s.replace(/٫/g, ".").replace(/،/g, ",").replace(/\\pi|π|ط(?![ء-ي])/g, "pi");
  for (const u of UNIT_WORDS) s = s.split(u).join("");
  s = s.replace(/\\{/g, "{").replace(/\\}/g, "}").replace(/\s+/g, "");
  s = s.replace(/^[a-zA-Zسصع]=/, ""); // حذف "س=" من البداية
  s = s.replace(/[.،,]+$/, "");
  return s.toLowerCase();
}

function splitList(s: string): string[] {
  const inner = s.replace(/^[{[(\]]|[}\])[]$/g, "");
  return inner.split(/,|;|و(?=[\d-])|أو|or/).filter(Boolean);
}

function numericEqual(a: string, b: string): boolean {
  const x = evaluateSimpleMathExpression(a);
  const y = evaluateSimpleMathExpression(b);
  if (x === null || y === null) return false;
  return Math.abs(x - y) <= 1e-6 * Math.max(1, Math.abs(y));
}

function sameOne(student: string, accepted: string): boolean {
  if (student === accepted) return true;
  return numericEqual(student, accepted);
}

export function isStudentShortAnswerCorrect(studentRaw: string, acceptedRaw: readonly string[]): boolean {
  const student = normalizeMathAnswerText(studentRaw);
  if (!student) return false;
  for (const acc of acceptedRaw) {
    const a = normalizeMathAnswerText(acc);
    if (!a) continue;
    if (sameOne(student, a)) return true;
    const isSet = (x: string) => /^\{.*\}$/.test(x);
    if (isSet(a) || isSet(student) || /[,;]/.test(a)) {
      const la = splitList(a).map((p) => p.trim());
      const ls = splitList(student).map((p) => p.trim());
      if (la.length === ls.length && la.length > 1 && la.every((p) => ls.some((q) => sameOne(q, p))) && ls.every((q) => la.some((p) => sameOne(q, p)))) return true;
    }
  }
  return false;
}
```

**`tests/short-answer-matcher.test.ts`**
```ts
import { describe, it, expect } from "vitest";
import { isStudentShortAnswerCorrect as ok } from "@/core/exam-grading/short-answer-matcher";
import { evaluateSimpleMathExpression as ev } from "@/core/exam-grading/math-simple-expression-evaluator";

describe("short-answer-matcher", () => {
  const cases: Array<[string, string[], boolean]> = [
    ["٥", ["5"], true], ["15", ["5"], false], ["x = 5", ["5"], true], ["س=٥ سم", ["5"], true],
    ["0.5", ["\\frac{1}{2}"], true], ["١/٢", ["0.5"], true], ["1/2", ["$\\frac{1}{2}$"], true],
    ["2√3", ["sqrt(12)"], true], ["√12", ["2\\sqrt{3}"], true], ["3.14", ["3.15"], false],
    ["{2,3}", ["{3, 2}"], true], ["2 و 3", ["{2,3}"], true], ["2", ["{2,3}"], false],
    ["", ["5"], false], ["المثلثان متشابهان", ["المثلثان متشابهان"], true], ["أي كلام", ["المثلثان متشابهان"], false],
    ["-3", ["−3"], true], ["24 سم²", ["24"], true], ["60°", ["60"], true], ["]2,5[", ["]2,5["], true],
  ];
  it.each(cases)("%s vs %j => %s", (s, acc, exp) => expect(ok(s, acc)).toBe(exp));
  it("evaluator", () => {
    expect(ev("2*(3+4)^2")).toBe(98); expect(ev("-3+5")).toBe(2); expect(ev("1/0")).toBeNull(); expect(ev("(1")).toBeNull();
  });
});
```

- **معيار القبول:** `npx vitest run tests/short-answer-matcher.test.ts` ← 21 اختباراً ناجحاً.

### E-2: حقلان اختياريان في عقد السؤال
- **الملف (تعديل):** `src/core/ir/question-assessment-ir.ts`
- **الخطوة:** داخل `QuestionAssessmentIR` وبعد السطر `readonly finalCanonicalAnswerArabic: string;` أضف:
```ts
  /** إجابات مقبولة مكافئة للأسئلة القصيرة في الاختبار الإلكتروني (مثل: 5 | ٥ | خمسة). */
  readonly acceptedAnswersArabic?: readonly string[];
  /** تنبيهات تشخيص الرسم للمعلم (لا تُعرض للطالب). */
  readonly figureDiagnosticsAr?: readonly string[];
```
- **معيار القبول:** `tsc` ناجح.

### E-3: برومبت الامتحان الإلكتروني (ملف جديد)
- **الملف (جديد):** `src/core/prompts/online-exam-prompt-builder.ts`
- **الخطوات:** أنشئ دالة `buildOnlineExamNotebookLMPrompt(config)` تقبل نفس حقول `OfficialExamPromptBuilderConfig` **ما عدا** `essayAndProofQuestionsCount` (استبدله بـ `shortAnswerQuestionsCount: number`). قلّد بنية `official-exam-prompt-builder.ts` (استورد `buildSharedMathInvariantsPromptBlock`). نص البرومبت يجب أن يحتوي **حرفياً** على الأسطر التالية:
```
هذا اختبار إلكتروني يُصحَّح آلياً. ممنوع أسئلة البرهان والمقالي. الأنواع المسموحة فقط: MCQ أو SHORT.
- أسئلة SHORT: إجابتها النهائية قيمة قصيرة واحدة (عدد، كسر، جذر، مجموعة {٢، ٣}، فترة، أو كلمة قصيرة) وليست جملة.
=== [QUESTION: رقم_السؤال] | النوع: [MCQ أو SHORT] | الدرس: [اسم_الدرس] | الدرجة: [عدد_الدرجات] ===
النص: [نص السؤال كاملاً مع المعادلات داخل $...$]
الرسم: [اتركه فارغاً أو اكتب سطور حقائق بين [رسم هندسي: ... ] كما في التعليمات]
البدائل: (أ) [...] | (ب) [...] | (جـ) [...] | (د) [...]   (في MCQ فقط)
الإجابة_الصحيحة: [حرف البديل في MCQ، أو القيمة النهائية في SHORT]
الإجابات_المقبولة: [في SHORT فقط: كل الصيغ المكافئة مفصولة بـ | مثل: 0.5 | 1/2 | \frac{1}{2}]
البرهان_والخطوات: [خطوات الحل المختصرة]
```
  ثم عدّل `studio-exam-generator-tab.tsx` بإضافة مفتاح تبديل صغير «اختبار إلكتروني (تصحيح آلي)» يستعمل هذه الدالة بدل `buildOfficialExamNotebookLMPrompt` عند تفعيله، ويضبط `shortAnswerQuestionsCount` من حقل `proofCount` الموجود (غيّر تسمية الحقل لـ«أسئلة إجابة قصيرة» عند التفعيل).
- **معيار القبول:** النص الناتج يحتوي كلمة `الإجابات_المقبولة` ولا يحتوي كلمة «برهان» إلا في جملة المنع.

### E-4: المحلل يقرأ «الإجابات_المقبولة»
- **الملف (تعديل):** `src/core/ingestion/notebooklm-exam-questions-parser.ts`
- **الخطوات:**
  1. داخل نمط الـ lookahead في `extractFieldMultiline` أضف `الإجابات_المقبولة|الإجابات المقبولة` ضمن قائمة الكلمات التي توقف قراءة الحقل (بجانب `الإجابة_الصحيحة`).
  2. بعد سطر `const rawFinalAnswer = ...` أضف: `const rawAccepted = extractFieldMultiline(block, "الإجابات_المقبولة|الإجابات المقبولة");`
  3. في الكائن المُرجَع أضف: `acceptedAnswersArabic: rawAccepted ? rawAccepted.split("|").map((s) => s.trim()).filter(Boolean) : undefined,`
  4. في تحديد `patternKind`: إن كان `rawKind` يحتوي `short` فاجعله `"direct_answer"`.
- **ممنوع:** تغيير أي منطق آخر.
- **معيار القبول:** اختبار جديد يمرّر كتلة فيها `الإجابات_المقبولة: 0.5 | 1/2` ويتوقع `acceptedAnswersArabic` = `["0.5","1/2"]`.

### E-5: فاصل «عام/مفتاح» + المصحّح (انسخ كما هي)
**`src/core/exam-grading/online-exam-public-key-splitter.ts`**
```ts
/**
 * @file online-exam-public-key-splitter.ts
 * @description يفصل أسئلة الاختبار الإلكتروني إلى (أسئلة عامة بلا إجابات تُرسل للطالب) و(مفتاح إجابات يبقى في الخادم).
 * الأسئلة غير القابلة للتصحيح الآلي (برهان/مقالي بلا إجابة قصيرة) تُستبعد ويُبلَّغ المعلم بأرقامها.
 */
import type { QuestionAssessmentIR } from "@/core/ir/question-assessment-ir";
import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";

export const MODULE_ID_ONLINE_EXAM_PUBLIC_KEY_SPLITTER = "online_exam_public_key_splitter" as const;

export type OnlineAnswerMode = "mcq" | "short_answer";

export interface OnlinePublicQuestion {
  readonly questionId: string;
  readonly displayOrderNumber: number;
  readonly allocatedMarks: number;
  readonly promptArabic: string;
  readonly answerMode: OnlineAnswerMode;
  readonly mcqChoicesArabic?: readonly string[];
  readonly attachedGeometryFigure?: CanonicalGeometryFigureIR;
}

export interface OnlineAnswerKeyItem {
  readonly questionId: string;
  readonly answerMode: OnlineAnswerMode;
  readonly allocatedMarks: number;
  readonly correctMcqChoiceIndex?: number;
  readonly acceptedAnswers: readonly string[];
  readonly modelSolutionStepsArabic: readonly string[];
  readonly finalAnswerArabic: string;
}

export interface OnlineExamSplitResult {
  readonly publicQuestions: readonly OnlinePublicQuestion[];
  readonly answerKey: readonly OnlineAnswerKeyItem[];
  readonly excludedQuestionNumbers: readonly number[];
}

const MAX_AUTO_FINAL_ANSWER_CHARS = 40;

export function splitExamIntoPublicAndKey(questions: readonly QuestionAssessmentIR[]): OnlineExamSplitResult {
  const publicQuestions: OnlinePublicQuestion[] = [];
  const answerKey: OnlineAnswerKeyItem[] = [];
  const excluded: number[] = [];

  for (const q of questions) {
    const base = { questionId: q.questionId, displayOrderNumber: q.displayOrderNumber, allocatedMarks: q.allocatedMarks, promptArabic: q.promptArabic, attachedGeometryFigure: q.attachedGeometryFigure };
    const keyBase = { questionId: q.questionId, allocatedMarks: q.allocatedMarks, modelSolutionStepsArabic: q.modelSolutionStepsArabic, finalAnswerArabic: q.finalCanonicalAnswerArabic };

    if (q.patternKind === "mcq" && q.mcqChoicesArabic && q.correctMcqChoiceIndex !== undefined) {
      publicQuestions.push({ ...base, answerMode: "mcq", mcqChoicesArabic: [...q.mcqChoicesArabic] });
      answerKey.push({ ...keyBase, answerMode: "mcq", correctMcqChoiceIndex: q.correctMcqChoiceIndex, acceptedAnswers: [] });
      continue;
    }
    const explicit = (q.acceptedAnswersArabic ?? []).map((s) => s.trim()).filter(Boolean);
    const finalAns = (q.finalCanonicalAnswerArabic || "").trim();
    const accepted = explicit.length > 0 ? explicit : finalAns && finalAns.length <= MAX_AUTO_FINAL_ANSWER_CHARS ? [finalAns] : [];
    const isShortKind = q.patternKind === "completion" || q.patternKind === "direct_answer";
    if (isShortKind && accepted.length > 0) {
      publicQuestions.push({ ...base, answerMode: "short_answer" });
      answerKey.push({ ...keyBase, answerMode: "short_answer", acceptedAnswers: accepted });
    } else {
      excluded.push(q.displayOrderNumber);
    }
  }
  return { publicQuestions, answerKey, excludedQuestionNumbers: excluded };
}
```

**`src/core/exam-grading/online-exam-grader.ts`**
```ts
/**
 * @file online-exam-grader.ts
 * @description المصحّح النقي للاختبار الإلكتروني (يُستدعى في الخادم فقط): اختيار من متعدد + إجابة قصيرة. درجة كاملة أو صفر.
 */
import type { OnlineAnswerKeyItem } from "./online-exam-public-key-splitter";
import { isStudentShortAnswerCorrect } from "./short-answer-matcher";

export const MODULE_ID_ONLINE_EXAM_GRADER = "online_exam_grader" as const;

export interface StudentAnswerInput { readonly choiceIndex?: number | null; readonly text?: string }

export interface OnlineQuestionResult {
  readonly questionId: string;
  readonly isCorrect: boolean;
  readonly earnedMarks: number;
  readonly allocatedMarks: number;
}

export interface OnlineExamGradeResult {
  readonly items: readonly OnlineQuestionResult[];
  readonly totalEarnedMarks: number;
  readonly totalAllocatedMarks: number;
  readonly percentage: number;
}

export function gradeOnlineExam(
  answerKey: readonly OnlineAnswerKeyItem[],
  answers: Readonly<Record<string, StudentAnswerInput | undefined>>
): OnlineExamGradeResult {
  let earned = 0;
  let total = 0;
  const items = answerKey.map((k): OnlineQuestionResult => {
    const a = answers[k.questionId];
    const isCorrect =
      k.answerMode === "mcq"
        ? a?.choiceIndex !== undefined && a.choiceIndex !== null && a.choiceIndex === k.correctMcqChoiceIndex
        : isStudentShortAnswerCorrect(a?.text ?? "", k.acceptedAnswers);
    const got = isCorrect ? k.allocatedMarks : 0;
    earned += got;
    total += k.allocatedMarks;
    return { questionId: k.questionId, isCorrect, earnedMarks: got, allocatedMarks: k.allocatedMarks };
  });
  return { items, totalEarnedMarks: earned, totalAllocatedMarks: total, percentage: total > 0 ? Math.round((earned / total) * 100) : 0 };
}
```

**`tests/online-exam-grader.test.ts`**
```ts
import { describe, it, expect } from "vitest";
import { splitExamIntoPublicAndKey } from "@/core/exam-grading/online-exam-public-key-splitter";
import { gradeOnlineExam } from "@/core/exam-grading/online-exam-grader";
import type { QuestionAssessmentIR } from "@/core/ir/question-assessment-ir";

const base = { branchId: "algebra" as never, unitId: "u", lessonId: "l", lessonTitleArabic: "t", cognitiveDepth: "direct_application" as const, estimatedSolveMinutes: 2, modelSolutionStepsArabic: ["خطوة"] };
const mcq: QuestionAssessmentIR = { ...base, questionId: "q1", displayOrderNumber: 1, patternKind: "mcq", allocatedMarks: 2, promptArabic: "س؟", mcqChoicesArabic: ["1", "2", "3", "4"], correctMcqChoiceIndex: 2, finalCanonicalAnswerArabic: "3" };
const short: QuestionAssessmentIR = { ...base, questionId: "q2", displayOrderNumber: 2, patternKind: "completion", allocatedMarks: 3, promptArabic: "أكمل", finalCanonicalAnswerArabic: "5", acceptedAnswersArabic: ["5", "خمسة"] };
const proof: QuestionAssessmentIR = { ...base, questionId: "q3", displayOrderNumber: 3, patternKind: "proof_reasoning", allocatedMarks: 4, promptArabic: "أثبت", finalCanonicalAnswerArabic: "بما أن ... إذن ..." };

describe("online exam", () => {
  const sp = splitExamIntoPublicAndKey([mcq, short, proof]);
  it("يستبعد البرهان", () => { expect(sp.publicQuestions.length).toBe(2); expect(sp.excludedQuestionNumbers).toEqual([3]); });
  it("الأسئلة العامة بلا إجابات", () => { const s = JSON.stringify(sp.publicQuestions); expect(s).not.toContain("correctMcq"); expect(s).not.toContain("خمسة"); });
  it("كل صحيح = 100%", () => expect(gradeOnlineExam(sp.answerKey, { q1: { choiceIndex: 2 }, q2: { text: "٥" } }).percentage).toBe(100));
  it("نص عشوائي = صفر", () => expect(gradeOnlineExam(sp.answerKey, { q1: { choiceIndex: 0 }, q2: { text: "15" } }).percentage).toBe(0));
  it("بلا إجابات = صفر", () => expect(gradeOnlineExam(sp.answerKey, {}).percentage).toBe(0));
  it("جزئي", () => expect(gradeOnlineExam(sp.answerKey, { q1: { choiceIndex: 2 } }).percentage).toBe(40));
});
```

- **معيار القبول:** 6 اختبارات ناجحة. (يُثبت: البرهان يُستبعد، الأسئلة العامة بلا إجابات، نص عشوائي = صفر، «15» لا تطابق «5».)

### E-6: قاعدة البيانات (ينفّذها **المالك** يدوياً في Supabase → SQL Editor)
```sql
-- 1) جداول جديدة
create table if not exists public.exam_answer_keys (
  exam_code text primary key,
  answer_key jsonb not null,
  reveal_answers boolean not null default true,
  created_at timestamptz default now()
);
create table if not exists public.exam_attempts (
  exam_code text not null,
  student_code text not null,
  started_at timestamptz not null default now(),
  primary key (exam_code, student_code)
);
alter table public.exam_submissions
  add column if not exists answers_json jsonb,
  add column if not exists result_json jsonb,
  add column if not exists started_at timestamptz;

-- 2) تفعيل الحماية
alter table public.exam_answer_keys enable row level security;
alter table public.exam_attempts   enable row level security;
alter table public.electronic_exams enable row level security;
alter table public.exam_submissions enable row level security;

-- 3) احذف يدوياً من (Authentication → Policies) أي سياسة تسمح بـ INSERT أو UPDATE أو DELETE
--    لـ anon على electronic_exams و exam_submissions، ثم أنشئ سياسات القراءة فقط:
create policy "anon_read_exams" on public.electronic_exams for select to anon using (true);
create policy "anon_read_submissions" on public.exam_submissions for select to anon using (true);
-- لا سياسات لـ exam_answer_keys و exam_attempts: لا يصل إليهما إلا مفتاح الخادم (service role).
```
- **معيار القبول:** من المتصفح، محاولة `POST` على `exam_submissions` بالمفتاح العام ترجع خطأ 401/403.

### E-7: مساعد الخادم لـ Supabase (انسخ)
**`src/core/auth/exam-server-supabase-helper.ts`**
```ts
/**
 * @file exam-server-supabase-helper.ts
 * @description مساعد خادم فقط للتحدث مع Supabase بمفتاح الخدمة. ممنوع استيراده من أي ملف "use client".
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function isServiceKeyConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SERVICE_KEY.length > 0;
}

function headers(prefer?: string): Record<string, string> {
  return { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) };
}

export async function sbSelect<T>(pathAndQuery: string): Promise<T[] | null> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, { headers: headers(), cache: "no-store" });
  return res.ok ? ((await res.json()) as T[]) : null;
}

export async function sbInsert(table: string, row: unknown, onConflict?: string): Promise<boolean> {
  const q = onConflict ? `?on_conflict=${onConflict}` : "";
  const prefer = onConflict ? "resolution=merge-duplicates,return=minimal" : "return=minimal";
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${q}`, { method: "POST", headers: headers(prefer), body: JSON.stringify(row) });
  return res.ok;
}

export async function sbPatch(pathAndQuery: string, patch: unknown): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, { method: "PATCH", headers: headers("return=minimal"), body: JSON.stringify(patch) });
  return res.ok;
}

export function readCookieFromRequest(req: Request, name: string): string | undefined {
  const raw = req.headers.get("cookie") || "";
  const hit = raw.split(";").map((p) => p.trim()).find((p) => p.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : undefined;
}
```

### E-8: نقاط الخادم الأربع (ملف جديد لكل واحدة)

**(أ) `src/app/api/exams/publish/route.ts`** — للمعلم فقط.
1. اقرأ كوكي المعلم بـ `readCookieFromRequest(req, TEACHER_AUTH_COOKIE_NAME)` و`verifyTeacherSessionToken`؛ إن فشل ارجع 401.
2. اقرأ الجسم: `{ gradeId, gradeNameArabic, titleAr, durationMinutes, availabilityDays, revealAnswers, questions }` (الأسئلة بصيغة `QuestionAssessmentIR[]`).
3. استدعِ `splitExamIntoPublicAndKey(questions)`. إن كان `publicQuestions` فارغاً ارجع 400 برسالة «لا توجد أسئلة قابلة للتصحيح الآلي».
4. ابنِ `examCode = "exam_" + gradeId + "_" + Date.now()`.
5. `sbInsert("exam_answer_keys", { exam_code, answer_key: answerKey, reveal_answers: !!revealAnswers })` ثم `sbInsert("electronic_exams", {...نفس الحقول التي كانت ترسلها syncPublishedExamToSupabaseCloud..., questions_json: publicQuestions }, "exam_code")`.
6. ارجع `{ success: true, examCode, publishedCount, excludedQuestionNumbers }`.

**(ب) `src/app/api/exams/archive/route.ts`** — للمعلم فقط: يتحقق من كوكي المعلم ثم `sbPatch("electronic_exams?exam_code=eq.<code>", { status: "archived", is_published: false })`.

**(ج) `src/app/api/exams/start/route.ts`** — للطالب:
1. تحقق من كوكي الطالب (`verifyStudentSessionToken`) وإلا 401.
2. اجلب الامتحان: `sbSelect("electronic_exams?exam_code=eq.<code>&select=exam_code,grade_id,status,expires_at,duration_minutes")`؛ تأكد أن `grade_id === session.gradeId` وأن الحالة `active` وأنه لم ينتهِ، وإلا 403.
3. إن وُجد تسليم سابق (`exam_submissions?submission_code=eq.<code>__<student>`) ارجع 409 مع النتيجة المخزنة.
4. `sbInsert("exam_attempts", { exam_code, student_code }, "exam_code,student_code")` — **بدون تحديث started_at إن وُجد الصف** (استخدم `Prefer: resolution=ignore-duplicates` بدل merge: أضف دالة `sbInsertIgnore` مماثلة).
5. اقرأ الصف ثم ارجع `{ success: true, startedAtIso, serverNowIso, durationMinutes }`.

**(د) `src/app/api/exams/submit/route.ts`** — للطالب (القلب):
```ts
// الخطوات بالترتيب (اكتبها بالضبط):
// 1) session = await verifyStudentSessionToken(readCookieFromRequest(req, STUDENT_AUTH_COOKIE_NAME)); إن null → 401
// 2) const { examCode, answers } = await req.json()  // answers: Record<questionId, { choiceIndex?: number|null; text?: string }>
// 3) exam = sbSelect("electronic_exams?exam_code=eq.X&select=grade_id,status,expires_at,duration_minutes,title_ar")[0]
//    - غير موجود أو grade مختلف أو status !== "active" أو منتهي → 403
// 4) existing = sbSelect("exam_submissions?submission_code=eq.X__STUDENT&select=percentage,result_json")[0] → إن وُجد ارجع 409 { success:false, error:"سلّمت هذا الاختبار من قبل", percentage }
// 5) attempt = sbSelect("exam_attempts?exam_code=eq.X&student_code=eq.STUDENT&select=started_at")[0]
//    - غير موجود → 400 "ابدأ الاختبار أولاً"
//    - now > started_at + duration_minutes*60s + 90s (سماح) → 403 "انتهى وقت الاختبار"
// 6) keyRow = sbSelect("exam_answer_keys?exam_code=eq.X&select=answer_key,reveal_answers")[0]
// 7) result = gradeOnlineExam(keyRow.answer_key, answers ?? {})
// 8) sbInsert("exam_submissions", { submission_code, exam_code, exam_title_ar, grade_id, student_code, student_name (من جدول students بالكود)، percentage: result.percentage, score: result.totalEarnedMarks, total_marks: result.totalAllocatedMarks, is_reviewed_by_teacher: false, submitted_at: now, started_at, answers_json: answers, result_json: result })
// 9) review = keyRow.reveal_answers ? answer_key.map(k => ({ questionId, correctMcqChoiceIndex, finalAnswerArabic, modelSolutionStepsArabic })) : null
// 10) ارجع { success:true, percentage, totalEarnedMarks, totalAllocatedMarks, items: result.items, review }
```
- **ممنوع:** إرجاع `answer_key` كاملاً أو `acceptedAnswers` للطالب في أي حالة.
- **معيار القبول (يدوي):** نشر امتحان من الاستوديو ← فتحه من حساب طالب ← فحص رد `electronic_exams` في أدوات المتصفح: لا يظهر أي حقل `correct…` أو `finalCanonicalAnswerArabic`. تسليم ثانٍ لنفس الطالب يرجع 409.

### E-9: تحويل واجهة المعلم للنشر عبر الخادم
- **الملفات (تعديل):** `studio-exam-generator-tab.tsx` و`published-online-exams-store.ts` و`supabase-cloud-sync-ssot.ts`.
- **الخطوات:**
  1. في `handlePublish` (studio-exam-generator-tab): استبدل استدعاء `publishOnlineExamSSOT(...)` بـ `fetch("/api/exams/publish", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...}) })` وأظهر رسالة النجاح، وإن كان `excludedQuestionNumbers` غير فارغ أظهر: «⚠️ استُبعدت الأسئلة رقم … لأنها غير قابلة للتصحيح الآلي (برهان/مقالي).»
  2. في `archiveOnlineExamSSOT` اجعل الأرشفة تستدعي `/api/exams/archive` ثم تحدّث المخزن المحلي.
  3. في `supabase-cloud-sync-ssot.ts` **احذف** محتوى `syncPublishedExamToSupabaseCloud` و`syncExamSubmissionToSupabaseCloud` (اجعل كلاً منهما `return false;` مع تعليق «النشر والتسليم عبر /api/exams فقط»). أبقِ دوال `pull…` كما هي.
  4. في `publishOnlineExamSSOT` لا تُخزّن `questions` كاملة محلياً؛ فهي الآن الأسئلة العامة فقط (تأتي من الخادم عبر `pullPublishedExamsFromSupabaseCloud`).
- **معيار القبول:** لا يوجد أي `fetch` مباشر لـ `rest/v1/exam_submissions` بطريقة POST في كود المتصفح (`grep -rn "exam_submissions" src` يظهر دوال القراءة فقط).

### E-10: واجهة الطالب: تفكيك الملف + المؤثرات البصرية
الملف الحالي `student-assigned-exams-tab.tsx` (309 سطر) يُفكَّك إلى ملفات ذرية في `src/features/student-learning-portal/exam-session/`:

| الملف الجديد | وظيفته |
|---|---|
| `use-exam-session.ts` | خطاف: يستدعي `/api/exams/start` ويحسب الوقت المتبقي من `startedAtIso` و`serverNowIso` (لا من الساعة المحلية فقط)، ويحفظ المسودة (الإجابات غير المسلّمة) في `sessionStorage` فقط. |
| `exam-top-progress-bar.tsx` | شريط علوي ثابت: «س ٣ من ١٠» + شريط تقدم + المؤقت. |
| `exam-question-card.tsx` | بطاقة سؤال واحدة (نص + شكل + بدائل/حقل إجابة + لوحة الرموز) وتستقبل `reviewState`. |
| `exam-result-screen.tsx` | شاشة النتيجة المتحركة. |
| `exam-confetti-burst.tsx` | قصاصات ملونة CSS فقط. |

**السلوك المطلوب:**
1. **سؤال واحد في الشاشة** مع زري «السابق/التالي» (≥44px) ونقاط تنقل صغيرة تلوّن المجاب عليه؛ وزر «🚩 علّم للمراجعة».
2. اختيار بديل: تكبير خفيف `scale(1.02)` + حلقة لونية + اهتزاز هاتف `navigator.vibrate?.(15)`.
3. **التسليم:** نافذة تأكيد «أجبت ٨ من ١٠ — هل تسلّم؟». ثم `fetch("/api/exams/submit")`. لا تحسب أي درجة في المتصفح.
4. **المراجعة بعد التسليم** (من رد الخادم `items` و`review`): كل بطاقة تأخذ إطاراً أخضر (✓) أو أحمر (✗) ويُميَّز البديل الصحيح بالأخضر وبديل الطالب الخاطئ بالأحمر مع اهتزاز `shake` للخاطئ، ويظهر الحل النموذجي إن كان `review` غير فارغ.
5. **شاشة النتيجة:** حلقة SVG دائرية تمتلئ بحركة وعدّاد أرقام يعدّ من 0 للنتيجة خلال 1.2 ثانية؛ و≥ ٧٠٪ ← `ExamConfettiBurst` + شهادة التقدير الموجودة.
6. المؤقت يتحول للأحمر النابض في آخر 3 دقائق (موجود) ويُسلَّم تلقائياً عند الصفر.

**CSS (أضفه في آخر `src/app/globals.css` كما هو):**
```css
@keyframes exam-pop { 0% { transform: scale(.96); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }
@keyframes exam-shake { 0%,100% { transform: translateX(0) } 20%,60% { transform: translateX(-5px) } 40%,80% { transform: translateX(5px) } }
@keyframes exam-ring-fill { from { stroke-dashoffset: var(--ring-total) } to { stroke-dashoffset: var(--ring-offset) } }
@keyframes exam-confetti-fall { 0% { transform: translateY(-20px) rotate(0); opacity: 1 } 100% { transform: translateY(420px) rotate(540deg); opacity: 0 } }
.exam-pop { animation: exam-pop .28s ease-out both }
.exam-shake { animation: exam-shake .4s ease-in-out }
.exam-ring { animation: exam-ring-fill 1.2s ease-out both }
.exam-confetti-piece { position: absolute; top: 0; width: 8px; height: 14px; border-radius: 2px; animation: exam-confetti-fall 2.2s ease-in both }
@media (prefers-reduced-motion: reduce) { .exam-pop, .exam-shake, .exam-ring, .exam-confetti-piece { animation: none } }
```
**`exam-confetti-burst.tsx` (انسخ):**
```tsx
"use client";
const COLORS = ["#0D9488", "#F59E0B", "#6366F1", "#E11D48", "#10B981", "#3B82F6"];
export default function ExamConfettiBurst() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden">
      {Array.from({ length: 28 }).map((_, i) => (
        <span key={i} className="exam-confetti-piece"
          style={{ left: `${(i * 37) % 100}%`, backgroundColor: COLORS[i % COLORS.length], animationDelay: `${(i % 9) * 0.12}s` }} />
      ))}
    </div>
  );
}
```
- **معيار القبول:** كل ملف ≤ 200 سطر؛ التصحيح لا يحدث في المتصفح؛ تحديث الصفحة أثناء الامتحان **لا يعيد** المؤقت؛ مع `prefers-reduced-motion` لا حركة.

### E-11: عرض الشكل/الرسم داخل امتحان الطالب
- **الملف (تعديل):** `exam-question-card.tsx`. استعمل `projectGeometryFigureToSVGMarkup` بعرض 230×155 على الجوال (كما كان) داخل صندوق `max-w-full` بدون تمرير أفقي.
- **معيار القبول:** سؤال فيه شكل يظهر الشكل بجوار النص على الشاشات ≥ 640px وتحته على الهاتف.

### E-12: تفاصيل التسليم للمعلم
- **الملف (تعديل):** `published-exams-list-tab.tsx`.
- **الخطوات:** تحت كل امتحان زر «عرض التسليمات» يفتح قائمة (اسم الطالب، النسبة، الوقت، «متأخر؟»). عند الضغط على اسم طالب اجلب `answers_json` و`result_json` من `exam_submissions` (قراءة عامة مسموحة لأنها لا تحوي مفتاحاً) واعرض لكل سؤال: إجابة الطالب ✓/✗.
- **معيار القبول:** المعلم يرى إجابة كل طالب لكل سؤال.

### E-13: خيار «إظهار الحل بعد التسليم»
- **الملف (تعديل):** `studio-exam-online-publish-panel.tsx`.
- **الخطوات:** أضف حالة `revealAnswers` (افتراضي `true`) ومفتاح تبديل بنص «إظهار الحل النموذجي للطالب بعد التسليم» ومرّره في `onPublish` ثم إلى `/api/exams/publish`.
- **معيار القبول:** عند الإيقاف لا يرجع `review` من `/api/exams/submit` ويظهر فقط ✓/✗.

---

# المرحلة 2 — محرك الملاءمة التلقائية (Auto-Fit)

**الفكرة:** سلّم من «درجات» (Rungs)؛ كل درجة = (حجم الخط، معامل تحجيم الشكل، عدد أسطر الإجابة، ترويسة مضغوطة، إخفاء الاعتماد). المحرك يقيس عدد الصفحات عند كل درجة بالتتابع، ثم يختار **أريح درجة** تحقق أقل عدد صفحات (أو ≤ الحد الأقصى). هذا يعمل بلا تدخل المعلم وفي أي درس.

### P-1: ملفات المنطق النقي (انسخ كما هي)
**`src/core/pdf-layout-engine/autofit-ladders.ts`**
```ts
/**
 * @file autofit-ladders.ts
 * @description سلالم الضغط/التوسيع للصفحات: كل درجة (Rung) = مجموعة قيم تُطبَّق معاً. الدرجة 0 هي الأريح للقراءة، والأخيرة هي الأضغط.
 */
export const MODULE_ID_AUTOFIT_LADDERS = "autofit_ladders" as const;

export type AutoFitModeId = "off" | "booklet_fill" | "exam_max_pages";

export interface AutoFitRung {
  readonly fontPt: number;
  readonly figureScale: number;
  readonly answerLines: 1 | 2 | 3;
  readonly compactHeader: boolean;
  readonly hideAccreditation: boolean;
}

const r = (fontPt: number, figureScale: number, answerLines: 1 | 2 | 3, compactHeader: boolean, hideAccreditation: boolean): AutoFitRung =>
  ({ fontPt, figureScale, answerLines, compactHeader, hideAccreditation });

export const BOOKLET_FILL_LADDER: readonly AutoFitRung[] = [
  r(14, 1, 2, false, false), r(13.5, 1, 2, false, false), r(13, 1, 2, false, false),
  r(12.5, 1, 2, false, false), r(12, 1, 2, false, false), r(11.5, 1, 2, false, false),
];

export const EXAM_MAX_PAGES_LADDER: readonly AutoFitRung[] = [
  r(13, 1.15, 3, false, false), r(12.5, 1, 3, false, false), r(12, 1, 2, false, false),
  r(12, 0.9, 2, true, false), r(11.5, 0.85, 2, true, true), r(11.5, 0.8, 1, true, true),
  r(11, 0.75, 1, true, true), r(10.5, 0.7, 1, true, true),
];

export function getLadderForMode(mode: AutoFitModeId): readonly AutoFitRung[] {
  return mode === "exam_max_pages" ? EXAM_MAX_PAGES_LADDER : mode === "booklet_fill" ? BOOKLET_FILL_LADDER : [];
}
```

**`src/core/pdf-layout-engine/autofit-decision.ts`**
```ts
/**
 * @file autofit-decision.ts
 * @description دالة نقية تختار أريح درجة (Rung) تحقق أفضل عدد صفحات.
 */
export const MODULE_ID_AUTOFIT_DECISION = "autofit_decision" as const;

export interface AutoFitProbe {
  readonly rungIndex: number;
  readonly pages: number;
  readonly lastPageFill: number; // 0..1+
  readonly overflow: boolean;
}

export interface AutoFitDecision {
  readonly rungIndex: number;
  readonly pages: number;
  readonly status: "fit" | "fill" | "cannot_fit" | "no_data";
  readonly overBy: number;
}

export function decideBestAutoFitRung(probes: readonly AutoFitProbe[], targetMaxPages?: number): AutoFitDecision {
  if (probes.length === 0) return { rungIndex: 0, pages: 0, status: "no_data", overBy: 0 };
  const clean = probes.filter((p) => !p.overflow);
  const pool = (clean.length > 0 ? clean : probes).slice().sort((a, b) => a.rungIndex - b.rungIndex);
  const minPages = Math.min(...pool.map((p) => p.pages));
  if (targetMaxPages !== undefined && minPages > targetMaxPages) {
    const best = pool.find((p) => p.pages === minPages)!;
    return { rungIndex: best.rungIndex, pages: best.pages, status: "cannot_fit", overBy: minPages - targetMaxPages };
  }
  const limit = targetMaxPages !== undefined ? targetMaxPages : minPages;
  const chosen = pool.find((p) => p.pages <= limit)!;
  return { rungIndex: chosen.rungIndex, pages: chosen.pages, status: targetMaxPages !== undefined ? "fit" : "fill", overBy: 0 };
}
```

**`src/core/pdf-layout-engine/autofit-sweep-reducer.ts`**
```ts
/**
 * @file autofit-sweep-reducer.ts
 * @description آلة حالة نقية تمرّ على درجات السلّم واحدة واحدة (قياس كل درجة) ثم تقرر الدرجة النهائية.
 */
import { decideBestAutoFitRung, type AutoFitDecision, type AutoFitProbe } from "./autofit-decision";

export const MODULE_ID_AUTOFIT_SWEEP_REDUCER = "autofit_sweep_reducer" as const;

export interface AutoFitSweepState {
  readonly phase: "idle" | "sweeping" | "done";
  readonly probeRungIndex: number;       // الدرجة المستخدمة الآن في القياس الخفي
  readonly probes: readonly AutoFitProbe[];
  readonly decision: AutoFitDecision | null;
}

export type AutoFitSweepAction =
  | { readonly type: "START" }
  | { readonly type: "MEASURED"; readonly rungIndex: number; readonly pages: number; readonly lastPageFill: number; readonly overflow: boolean; readonly rungCount: number; readonly targetMaxPages?: number }
  | { readonly type: "STOP" };

export const INITIAL_AUTOFIT_SWEEP_STATE: AutoFitSweepState = { phase: "idle", probeRungIndex: 0, probes: [], decision: null };

export function autoFitSweepReducer(state: AutoFitSweepState, action: AutoFitSweepAction): AutoFitSweepState {
  if (action.type === "STOP") return INITIAL_AUTOFIT_SWEEP_STATE;
  if (action.type === "START") return { phase: "sweeping", probeRungIndex: 0, probes: [], decision: null };
  if (state.phase !== "sweeping" || action.rungIndex !== state.probeRungIndex) return state; // قياس قديم: تجاهل
  const probes = [...state.probes, { rungIndex: action.rungIndex, pages: action.pages, lastPageFill: action.lastPageFill, overflow: action.overflow }];
  const next = action.rungIndex + 1;
  if (next < action.rungCount) return { phase: "sweeping", probeRungIndex: next, probes, decision: null };
  const decision = decideBestAutoFitRung(probes, action.targetMaxPages);
  return { phase: "done", probeRungIndex: decision.rungIndex, probes, decision };
}
```

**`src/core/pdf-layout-engine/question-figure-box-size.ts`**
```ts
/**
 * @file question-figure-box-size.ts
 * @description يحسب مقاس صندوق الشكل بجوار السؤال بحسب نسبة أبعاد الشكل ومعامل التحجيم (figureScale) وعدد الأعمدة.
 */
export const MODULE_ID_QUESTION_FIGURE_BOX_SIZE = "question_figure_box_size" as const;

export interface FigureBoxSizePx {
  readonly boxWidthPx: number;
  readonly boxHeightPx: number;
  readonly svgWidthPx: number;
  readonly svgHeightPx: number;
}

const BASE_AREA_PX2 = 146 * 102; // مساحة الرسم الحالية (146×102) عند figureScale = 1
const BOX_PADDING_PX = 6;

/** @param aspect العرض ÷ الارتفاع للشكل (يُقصّ بين 0.6 و 2.6). */
export function computeFigureBoxSizePx(params: {
  readonly aspect: number;
  readonly figureScale: number;
  readonly columnsCount: 1 | 2;
}): FigureBoxSizePx {
  const aspect = Math.min(2.6, Math.max(0.6, Number.isFinite(params.aspect) ? params.aspect : 1.4));
  const scale = Math.min(1.6, Math.max(0.6, params.figureScale));
  const maxW = params.columnsCount === 2 ? 190 : 260;
  const area = BASE_AREA_PX2 * scale * scale;
  let w = Math.sqrt(area * aspect);
  let h = w / aspect;
  if (w > maxW) { w = maxW; h = w / aspect; }
  if (h > 170) { h = 170; w = h * aspect; }
  if (w < 84) { w = 84; h = w / aspect; }
  const svgWidthPx = Math.round(w);
  const svgHeightPx = Math.round(h);
  return { boxWidthPx: svgWidthPx + BOX_PADDING_PX, boxHeightPx: svgHeightPx + BOX_PADDING_PX, svgWidthPx, svgHeightPx };
}

/** نسبة أبعاد شكل من إحداثيات رؤوسه (عرض ÷ ارتفاع). */
export function computeFigureAspectFromVertices(vertices: readonly { readonly position: { readonly x: number; readonly y: number } }[]): number {
  if (vertices.length === 0) return 1.4;
  const xs = vertices.map((v) => v.position.x);
  const ys = vertices.map((v) => v.position.y);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  return w / Math.max(h, 1e-6);
}
```

**`tests/autofit-decision.test.ts`**
```ts
import { describe, it, expect } from "vitest";
import { decideBestAutoFitRung as d } from "@/core/pdf-layout-engine/autofit-decision";
import { autoFitSweepReducer as red, INITIAL_AUTOFIT_SWEEP_STATE as I } from "@/core/pdf-layout-engine/autofit-sweep-reducer";
const P = (rungIndex: number, pages: number, overflow = false) => ({ rungIndex, pages, lastPageFill: 0.5, overflow });

describe("autofit", () => {
  it("fill: أول درجة بأقل عدد صفحات", () => expect(d([P(0, 4), P(1, 3), P(2, 3)]).rungIndex).toBe(1));
  it("fit: أول درجة ≤ الهدف", () => expect(d([P(0, 3), P(1, 3), P(2, 2)], 2)).toMatchObject({ rungIndex: 2, status: "fit" }));
  it("cannot_fit", () => expect(d([P(0, 4), P(1, 3)], 2)).toMatchObject({ status: "cannot_fit", overBy: 1 }));
  it("يتجاهل الفائض", () => expect(d([P(0, 2, true), P(1, 2)], 2).rungIndex).toBe(1));
  it("reducer sweep", () => {
    let s = red(I, { type: "START" });
    [4, 3, 3, 2].forEach((pages) => { s = red(s, { type: "MEASURED", rungIndex: s.probeRungIndex, pages, lastPageFill: 0.5, overflow: false, rungCount: 4, targetMaxPages: 2 }); });
    expect(s.phase).toBe("done"); expect(s.decision?.rungIndex).toBe(3);
  });
});
```

**`tests/figure-box-size.test.ts`**
```ts
import { describe, it, expect } from "vitest";
import { computeFigureBoxSizePx as f } from "@/core/pdf-layout-engine/question-figure-box-size";
describe("figure box", () => {
  it("scale 1 قريب من 146×102", () => { const r = f({ aspect: 146 / 102, figureScale: 1, columnsCount: 2 }); expect(Math.abs(r.svgWidthPx - 146)).toBeLessThan(3); });
  it("أصغر مع scale أقل", () => expect(f({ aspect: 1.4, figureScale: 0.7, columnsCount: 2 }).svgWidthPx).toBeLessThan(f({ aspect: 1.4, figureScale: 1, columnsCount: 2 }).svgWidthPx));
  it("لا يتجاوز عرض العمود", () => expect(f({ aspect: 2.6, figureScale: 1.6, columnsCount: 2 }).svgWidthPx).toBeLessThanOrEqual(190));
});
```

- **معيار القبول:** 8 اختبارات ناجحة.

### P-2: توسيع الإعدادات (تعديل نوع فقط)
- **الملف:** `src/core/ssot/pdf-print-settings-ssot.ts`
- **الخطوات:**
  1. غيّر `export type ExactPrintFontSizePt = 12 | 12.5 | 13 | 13.5 | 14 | 15 | 16;` إلى `10.5 | 11 | 11.5 | 12 | 12.5 | 13 | 13.5 | 14 | 15 | 16`.
  2. داخل `PDFPrintSettingsStateSSOT` وبعد `targetMaxPages?` أضف (كلها اختيارية):
```ts
  readonly autoFitMode?: "off" | "booklet_fill" | "exam_max_pages";
  readonly figureScale?: number;
  readonly answerSpaceLines?: 1 | 2 | 3;
  readonly compactHeader?: boolean;
  readonly hideAccreditation?: boolean;
```
  3. **لا تغيّر** `loadPersistedPDFPrintSettingsSSOT` (التحقق 12–16 يبقى: القيم الأقل من 12 تأتي من Auto-Fit فقط ولا تُحفظ).
  4. في `DEFAULT_PDF_PRINT_SETTINGS_SSOT` أضف `autoFitMode: "booklet_fill"`.
- **معيار القبول:** `tsc` ناجح.

### P-3: ختم القياس في الخطاف
- **الملف (تعديل):** `src/core/pdf-layout-engine/use-flow-staging-live-measurer.ts`
- **الخطوات:**
  1. أضف إلى `FlowMeasureSnapshot` الحقل `readonly stamp: string;` وإلى `EMPTY_SNAPSHOT` القيمة `stamp: ""`.
  2. غيّر توقيع الدالة إلى `useFlowStagingLiveMeasurer(stagingRef, observeKey, stamp = "")`.
  3. في `readSnapshot` أضف وسيطاً `stamp` وأرجعه في الكائن؛ وفي `isSameSnapshot` أضف الشرط `a.stamp === b.stamp`.
  4. في `measure()` مرّر `stamp`، وأضف `stamp` إلى مصفوفة اعتماديات الـ effect.
- **سبب المهمة:** حتى نعرف أن القياس الذي وصلنا يخص الدرجة الحالية وليس قياساً قديماً.
- **معيار القبول:** `tsc` ناجح والمعاينة الحالية تعمل كما كانت.

### P-4: خطاف المتحكم (ملف جديد، انسخ)
**`src/core/pdf-layout-engine/use-autofit-sweep-controller.ts`**
```ts
"use client";

import { useEffect, useReducer } from "react";
import type { FlowPage } from "./flow-item-model";
import { autoFitSweepReducer, INITIAL_AUTOFIT_SWEEP_STATE, type AutoFitSweepState } from "./autofit-sweep-reducer";
import type { AutoFitModeId } from "./autofit-ladders";

export const MODULE_ID_USE_AUTOFIT_SWEEP_CONTROLLER = "use_autofit_sweep_controller" as const;

export function useAutoFitSweepController(params: {
  readonly mode: AutoFitModeId;
  readonly rungCount: number;
  readonly targetMaxPages?: number;
  /** نص يتغير كلما تغيّرت مدخلات تستدعي إعادة الفحص (الأسئلة، الأعمدة، الكثافة، الخط العائلة، وضع الإجابات...). */
  readonly inputSignature: string;
  /** ختم القياس الحالي القادم من useFlowStagingLiveMeasurer. */
  readonly measureStamp: string;
  readonly pages: readonly FlowPage[];
}): AutoFitSweepState {
  const { mode, rungCount, targetMaxPages, inputSignature, measureStamp, pages } = params;
  const [state, dispatch] = useReducer(autoFitSweepReducer, INITIAL_AUTOFIT_SWEEP_STATE);

  useEffect(() => {
    dispatch(mode === "off" || rungCount === 0 ? { type: "STOP" } : { type: "START" });
  }, [mode, rungCount, inputSignature]);

  useEffect(() => {
    if (state.phase !== "sweeping" || pages.length === 0) return;
    if (measureStamp !== `rung-${state.probeRungIndex}`) return;
    const last = pages[pages.length - 1];
    dispatch({
      type: "MEASURED",
      rungIndex: state.probeRungIndex,
      pages: pages.length,
      lastPageFill: last.budgetHeightPx > 0 ? last.usedHeightPx / last.budgetHeightPx : 0,
      overflow: pages.some((p) => p.overflowsBudget),
      rungCount,
      targetMaxPages,
    });
  }, [state.phase, state.probeRungIndex, measureStamp, pages, rungCount, targetMaxPages]);

  return state;
}
```
- **معيار القبول:** `tsc` ناجح.

### P-5: ربط المتحكم في `two-column-newspaper-packer.tsx`
هذه أدق مهمة. نفّذ الخطوات بالترتيب:
1. استورد: `getLadderForMode` من `autofit-ladders`، و`useAutoFitSweepController`.
2. بعد تعريف `activeFont` أضف:
```ts
const mode = settings.autoFitMode ?? "off";
const ladder = React.useMemo(() => getLadderForMode(mode), [mode]);
```
3. **قبل** `useFlowStagingLiveMeasurer` أنشئ حالة مؤقتة للمتحكم بطريقة لا تسبب حلقة: لأن المتحكم يحتاج `pages` الناتجة من القياس، استعمل `useState<number>(0)` اسمه `probeIdx` **لا**؛ بل ببساطة: اجعل المتحكم يُستدعى **بعد** حساب `discretePages` (كما في الترتيب الحالي)، وأنشئ قبله `const [activeRung, setActiveRung] = React.useState(0);` ثم بعد المتحكم أضف:
```ts
React.useEffect(() => { setActiveRung(sweep.phase === "idle" ? 0 : sweep.probeRungIndex); }, [sweep.phase, sweep.probeRungIndex]);
```
4. عرّف الإعدادات الفعلية **قبل** `buildFlowItems`:
```ts
const rung = mode === "off" ? undefined : ladder[Math.min(activeRung, ladder.length - 1)];
const effSettings = React.useMemo(() => rung
  ? { ...settings, exactFontSizePt: rung.fontPt as PDFPrintSettingsStateSSOT["exactFontSizePt"], figureScale: rung.figureScale, answerSpaceLines: rung.answerLines, compactHeader: rung.compactHeader, hideAccreditation: rung.hideAccreditation }
  : settings, [settings, rung]);
const measureStamp = rung ? `rung-${activeRung}` : "off";
```
5. استعمل `effSettings` بدل `settings` في: `buildFlowItems`، `FlowMeasurementStagingPlatform`، `FlowItemRenderer`، `SovereignDiscretePageView`. (ابحث عن كل `settings` داخل الملف واستبدلها ما عدا `settings.autoFitMode` و`settings.targetMaxPages`).
6. مرّر `measureStamp` كوسيط ثالث لـ `useFlowStagingLiveMeasurer`، وغيّر المفتاح الثاني إلى `` `${flowItems.length}:${effSettings.exactFontSizePt}:${measureStamp}` `` (نص) بدل `flowItems`.
7. استدعِ المتحكم بعد `discretePages`:
```ts
const inputSignature = `${questions.map((q) => q.id).join(",")}|${settings.columnsCount}|${settings.densityMode}|${settings.fontFamilyId}|${settings.answerVisibilityMode}|${settings.answerSpaceStyle}|${settings.numeralMode}|${settings.notationLanguage}|${settings.customDocumentTitle}`;
const sweep = useAutoFitSweepController({ mode, rungCount: ladder.length, targetMaxPages: settings.targetMaxPages, inputSignature, measureStamp, pages: discretePages });
```
8. **تجميد العرض أثناء المسح:** احفظ آخر صفحات مستقرة بـ `useRef`: عندما `sweep.phase !== "sweeping"` خزّن `discretePages` و`effSettings`؛ وأثناء `sweeping` اعرض المخزَّن (`viewPages`, `viewSettings`) مع طبقة شفافة عليها النص «⏳ جارٍ ضبط الصفحات تلقائياً…». استعمل `viewPages/viewSettings` في عرض `SovereignDiscretePageView`.
9. بعد انتهاء المسح (`done`) تصبح `activeRung = decision.rungIndex` تلقائياً من الخطوة 3.
- **ممنوع:** استدعاء `setState` داخل الـ render.
- **معيار القبول:** افتح مذكرة طويلة: بعد أقل من ثانيتين تستقر الصفحات؛ شارة «إجمالي الورق» لا تتذبذب؛ تغيير الأعمدة يعيد المسح تلقائياً. مع `autoFitMode="off"` السلوك القديم بالضبط.

### P-6: تطبيق قيم الدرجة في المكونات
(كل بند ملف مستقل)
1. **`embedded-geometry-svg-docker.tsx`:** أضف خصائص `figureScale: number` و`columnsCount: 1 | 2`. استبدل العرض الثابت 152/146×102 بـ:
```ts
const aspect = computeFigureAspectFromVertices(geometryFigure.vertices);
const box = computeFigureBoxSizePx({ aspect, figureScale, columnsCount });
// width/minWidth: box.boxWidthPx  ، widthPx: box.svgWidthPx ، heightPx: box.svgHeightPx
```
   ومرّر القيم من `side-by-side-diagram-docker.tsx`: `figureScale={settings.figureScale ?? 1}` و`columnsCount={settings.columnsCount}`.
2. **`student-answer-space-docker.tsx`:** أضف خاصية `lineCount?: 1 | 2 | 3` (افتراضي 2) واستبدل `[1, 2]` بـ `Array.from({ length: lineCount }, (_, i) => i + 1)`؛ ومرّر `settings.answerSpaceLines` من `side-by-side-diagram-docker.tsx`.
3. **`sovereign-a4-page-chrome-elements.tsx` / `SovereignFirstPageHeader`:** أضف خاصية `compact?: boolean`؛ عند `true`: غيّر `p-2` إلى `p-1` و`mb-2` إلى `mb-1` وأخفِ أي سطر فرعي (`subtitleAr`) وأي صف شارات إحصائية (عدد الأفكار). ومرّرها من `sovereign-discrete-page-view.tsx` ومنصة القياس بـ `settings.compactHeader`.
4. **`flow-items-builder.ts`:** أضف وسيطاً `includeAccreditation?: boolean` (افتراضي `true`) واجعل إضافة عنصر `flow-accreditation-footer` مشروطة به؛ ومرّر `!effSettings.hideAccreditation` من الـpacker.
- **معيار القبول:** مع `figureScale=0.7` الشكل أصغر بوضوح؛ مع `answerSpaceLines=1` سطر واحد فقط؛ مع `compactHeader` الترويسة أقصر بنحو 30%+.

### P-7: أداة اختيار وضع الملاءمة (ملف جديد)
- **الملف:** `src/features/pdf-preview-controls/pdf-autofit-mode-selector.tsx`
- **الخطوات:** مكوّن بثلاثة أزرار (≥44px): «تلقائي — ملء الورقة» (`booklet_fill`) / «اختبار — حد أقصى للصفحات» (`exam_max_pages`) / «يدوي» (`off`)، مع مكوّن عدّاد صغير لـ `targetMaxPages` (1 / 2 / 3) يظهر فقط في وضع الاختبار. قلّد بنية `pdf-columns-layout-toggle.tsx` في الخصائص (`settings`, `onChange`). أضفه في `pdf-controls-grouped-tool-panel.tsx` ضمن مجموعة «الصفحة».
- **معيار القبول:** تغيير الوضع يحدّث المعاينة ويُحفظ مع باقي التفضيلات.

### P-8: شارة حالة الملاءمة
- **الملف (جديد):** `src/core/pdf-layout-engine/autofit-status-badge.tsx`
- **الخطوات:** مكوّن يستقبل `sweep: AutoFitSweepState` ويعرض:
  - أثناء المسح: «⏳ جارٍ ضبط الصفحات…»
  - `fit`/`fill`: «✓ {pages} صفحة — خط {fontPt}pt» (بالأرقام حسب `numeralMode`).
  - `cannot_fit`: «⚠️ لا يتسع في {target} صفحة (يزيد {overBy}) — قلّل عدد الأسئلة أو اجعل الأسئلة أقصر.»
  ثم اعرضه في أعلى `two-column-newspaper-packer.tsx` بجانب شارة «إجمالي الورق».
- **معيار القبول:** الشارة تتحدث وحدها بعد كل تغيير.

### P-9: إصلاح عداد صفحات Drive
- **الملفات (تعديل):** `two-column-newspaper-packer.tsx` و`pdf-preview-orchestrator.tsx`.
- **الخطوات:** أضف إلى الـpacker خاصية اختيارية `onPagesCountChange?: (n: number) => void` تُستدعى في `useEffect` عند تغيّر `discretePages.length` وبعد استقرار المسح فقط (`sweep.phase !== "sweeping"`). في الـorchestrator خزّن العدد بـ `useState` واستعمله بدل `pagesCount: 1`.
- **معيار القبول:** مذكرة 5 صفحات تُحفظ في Drive بعدد 5.

---

# المرحلة 3 — المذكرات والمراجعات النهائية

### B-1: التفعيل التلقائي للوضع المناسب
- **الملف (تعديل):** `pdf-preview-orchestrator.tsx` (في `useState` الابتدائي وفي `useEffect` اللذين يحسبان `isBookletOrReview`).
- **الخطوات:** عند `isBookletOrReview` اجعل `autoFitMode: "booklet_fill"` و`targetMaxPages: undefined`. لا تكتب فوق اختيار المعلم إن غيّره يدوياً أثناء الجلسة (احتفظ بعلم `userChangedAutoFit` في `useRef`).
- **معيار القبول:** مذكرة جديدة تُفتح بالوضع التلقائي دون أي ضغطة.

### B-2: تقرير امتلاء الصفحات (للمعلم)
- **الملف (جديد):** `src/core/pdf-layout-engine/page-fill-report-chip.tsx`
- **الخطوات:** استعمل `auditFlowPages(discretePages, measured.heights)` (موجود في `flow-layout-quality-audit.ts`) واعرض شريحة صغيرة: «امتلاء الصفحات: ٩٦٪ ٩٤٪ ٧١٪». لون أخضر ≥ 85٪ وأصفر بين 60 و85 وأحمر أقل. لا تُطبع (`print:hidden`).
- **معيار القبول:** الشريحة تظهر في المعاينة ولا تظهر في ملف الطباعة.

### B-3: سمة طباعة فاخرة جديدة «كحلي وذهبي»
- **الملفات (تعديل):** `pdf-print-settings-ssot.ts` و`a4-vector-html-sheet-renderer.ts` و`pdf-color-theme-selector.tsx`.
- **الخطوات:**
  1. أضف `"navy_gold"` إلى `PrintColorThemeId`.
  2. في `resolvePrintThemePalette` أضف فرعاً قبل الافتراضي:
```ts
if (themeId === "navy_gold") {
  return {
    primaryHex: "#14213D", secondaryHex: "#1F3A68", accentHex: "#B8892B",
    badgeBgHex: "#FBF5E6", borderHex: "#B8892B", softSurfaceHex: "#FDFBF4",
    ruleBgHex: "#FBF5E6", ruleBorderHex: "#D4AF5A",
    solvedBgHex: "#F4F8F1", solvedBorderHex: "#9DBF8A", solvedTextHex: "#1F3D1A",
    headerGradientCss: "linear-gradient(135deg, #0B1530 0%, #14213D 55%, #1F3A68 100%)",
  };
}
```
  3. في `pdf-color-theme-selector.tsx` أضف خياراً `{ id: "navy_gold", label: "كحلي وذهبي (فاخر)", swatchHex: "#14213D" }`.
- **معيار القبول:** اختيار السمة يغيّر الترويسة والبراويز ويبقى النص مقروءاً.

### B-4: إطار الصفحة الفاخر (CSS فقط)
- **الملف (تعديل):** `sovereign-discrete-page-view.tsx` — على عنصر `<section>` الجذر أضف إلى الـ`style` الموجود: `boxShadow: \`inset 0 0 0 1px ${palette.borderHex}33\``. لا تغيّر أي أبعاد (لأن الارتفاعات مقيسة).
- **ممنوع:** إضافة `border` أو `padding` (تُفسد القياس).
- **معيار القبول:** إطار رفيع داخلي ولا تتغير أي صفحات أو أعداد صفحات لنفس المذكرة.

---

# المرحلة 4 — اختبار PDF بحد أقصى ورقتين

### X-1: تفعيل وضع الاختبار تلقائياً
- **الملف (تعديل):** `pdf-preview-orchestrator.tsx`.
- **الخطوات:** إن كان `customTitle` يحتوي «اختبار» (ولا يحتوي «مذكرة/مراجعة»): `autoFitMode: "exam_max_pages"` و`targetMaxPages: 2`.
- **معيار القبول:** اختبار جديد يُفتح بحد أقصى ورقتين دون ضبط يدوي.

### X-2: مساحة الشكل المرنة بجوار السؤال
بعد P-6 (1) يصبح الشكل مرناً. أضف هنا قاعدتين فقط في `side-by-side-diagram-docker.tsx`:
1. إن كان `settings.columnsCount === 2` والعمود ضيق ونص السؤال طويل جداً (`promptAr.length > 220`) ضع الشكل **تحت** النص بدل جانبه (غيّر `flex items-start justify-between` إلى `flex-col`).
2. اترك `shrink-0` للشكل حتى لا يُضغط عرضه.
- **معيار القبول:** مع `figureScale` من 0.7 إلى 1.15 يتغير حجم الشكل وعدد الصفحات، ولا يتشوّه الشكل (يحافظ على النسبة).

### X-3: بدائل الاختيار المدمجة في الاختبار
- **الملف (تعديل):** `adaptive-mcq-options-grid-solver.ts`.
- **الخطوات:** عند `settings.compactHeader === true` (أي الدرجات المضغوطة) فضّل 4 أعمدة إن كانت كل البدائل ≤ 12 حرفاً، وإلا 2. مرّر `compactHeader` كوسيط اختياري جديد للدالة `resolveAdaptiveMCQColumnsCount` (افتراضي `false`).
- **معيار القبول:** أسئلة الاختيار القصيرة تظهر صفاً واحداً في الوضع المضغوط.

### X-4: رسالة العجز الواضحة
- **الملف (تعديل):** `autofit-status-badge.tsx` (من P-8).
- **الخطوات:** في حالة `cannot_fit` أضف سطراً ثانياً: «اقتراح: احذف ≈ {ceil(overBy × عدد الأسئلة ÷ عدد الصفحات الحالية)} سؤال/أسئلة». (`overBy` من `sweep.decision`).
- **معيار القبول:** اختبار من 40 سؤالاً بالصيغة المقالية يعرض تحذيراً واقتراحاً بدل فيض صامت.

### X-5: فحص يدوي إلزامي
اطبع (PDF) اختباراً فيه: 8 أسئلة اختيار + 3 مقالية + 3 أسئلة بأشكال. تأكد: ≤ ورقتين، لا نص مقصوص، الأشكال بجوار الأسئلة، الخط ≥ 11pt. سجّل لقطة شاشة في `docs/qa/`.

---

# المرحلة 5 — الرسم الذكي (المركّب الهندسي)

### G-1: ملفات المركّب (انسخ كما هي — مجلد جديد `src/core/geometry-engine/fact-compositor/`)
**`geo-vector-math.ts`**
```ts
/**
 * @file geo-vector-math.ts
 * @description عمليات متجهات ثنائية البعد النقية للمركّب الهندسي.
 */
export const MODULE_ID_GEO_VECTOR_MATH = "geo_vector_math" as const;

export interface Vec2 { readonly x: number; readonly y: number }

export const vAdd = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const vSub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const vScale = (a: Vec2, k: number): Vec2 => ({ x: a.x * k, y: a.y * k });
export const vDot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;
export const vLen = (a: Vec2): number => Math.hypot(a.x, a.y);
export const vDist = (a: Vec2, b: Vec2): number => vLen(vSub(a, b));
/** نقطة على القطعة a→b عند النسبة t (0 = a ، 1 = b). */
export const vLerp = (a: Vec2, b: Vec2, t: number): Vec2 => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
export const vMid = (a: Vec2, b: Vec2): Vec2 => vLerp(a, b, 0.5);

/** مسقط النقطة p على المستقيم المار بـ a و b. */
export function footOfPerpendicular(p: Vec2, a: Vec2, b: Vec2): Vec2 {
  const ab = vSub(b, a);
  const len2 = vDot(ab, ab) || 1;
  const t = vDot(vSub(p, a), ab) / len2;
  return vLerp(a, b, t);
}

/** تقاطع مستقيمين (p1p2) و (p3p4)؛ يعيد null إن كانا متوازيين. */
export function lineIntersection(p1: Vec2, p2: Vec2, p3: Vec2, p4: Vec2): Vec2 | null {
  const d1 = vSub(p2, p1);
  const d2 = vSub(p4, p3);
  const den = d1.x * d2.y - d1.y * d2.x;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((p3.x - p1.x) * d2.y - (p3.y - p1.y) * d2.x) / den;
  return vLerp(p1, p2, t);
}

/** قدم منصف الزاوية عند a على الضلع المقابل bc (نظرية المنصف: bd/dc = ab/ac). */
export function angleBisectorFoot(a: Vec2, b: Vec2, c: Vec2): Vec2 {
  const ab = vDist(a, b);
  const ac = vDist(a, c);
  return vLerp(b, c, ab / (ab + ac || 1));
}
```

**`geo-triangle-placer.ts`**
```ts
/**
 * @file geo-triangle-placer.ts
 * @description يحسب إحداثيات رؤوس مثلث (A,B,C) من المعطيات المتاحة بقواعد ثابتة، ويعيد دائماً مثلثاً صالحاً.
 */
import type { Vec2 } from "./geo-vector-math";

export const MODULE_ID_GEO_TRIANGLE_PLACER = "geo_triangle_placer" as const;
export type TriVertexKey = "A" | "B" | "C";

export interface TriangleKnowns {
  readonly ab?: number; readonly bc?: number; readonly ca?: number;
  readonly angleDeg?: Partial<Record<TriVertexKey, number>>;
  readonly rightAt?: TriVertexKey;
  readonly isoscelesApex?: TriVertexKey;
  readonly equilateral?: boolean;
}
export interface TrianglePoints { readonly A: Vec2; readonly B: Vec2; readonly C: Vec2 }

const DEFAULT_SIDE = 6;
const rad = (d: number) => (d * Math.PI) / 180;

function fromThreeSides(ab: number, bc: number, ca: number): TrianglePoints | null {
  const x = (ab * ab + bc * bc - ca * ca) / (2 * bc);
  const y2 = ab * ab - x * x;
  if (y2 <= 1e-9) return null;
  return { A: { x, y: Math.sqrt(y2) }, B: { x: 0, y: 0 }, C: { x: bc, y: 0 } };
}

function placeRight(at: TriVertexKey, k: TriangleKnowns): TrianglePoints {
  if (at === "B") { const a = k.bc ?? DEFAULT_SIDE; const c = k.ab ?? (k.ca && k.ca > a ? Math.sqrt(k.ca * k.ca - a * a) : a * 0.75); return { A: { x: 0, y: c }, B: { x: 0, y: 0 }, C: { x: a, y: 0 } }; }
  if (at === "A") { const c = k.ab ?? DEFAULT_SIDE * 0.8; const b = k.ca ?? (k.bc && k.bc > c ? Math.sqrt(k.bc * k.bc - c * c) : c * 0.75); return { A: { x: 0, y: 0 }, B: { x: c, y: 0 }, C: { x: 0, y: b } }; }
  const a = k.bc ?? (k.ab && k.ca ? Math.sqrt(Math.max(k.ab * k.ab - k.ca * k.ca, 1)) : DEFAULT_SIDE); const b = k.ca ?? a * 0.75;
  return { A: { x: a, y: b }, B: { x: 0, y: 0 }, C: { x: a, y: 0 } };
}

function placeIsosceles(apex: TriVertexKey, k: TriangleKnowns): TrianglePoints {
  const legs = apex === "A" ? (k.ab ?? k.ca) : apex === "B" ? (k.ab ?? k.bc) : (k.bc ?? k.ca);
  const base = apex === "A" ? k.bc : apex === "B" ? k.ca : k.ab;
  const s = legs ?? DEFAULT_SIDE; const w = base ?? s * 0.8;
  const h = Math.sqrt(Math.max(s * s - (w / 2) ** 2, 0.25));
  const top = { x: w / 2, y: h }; const L = { x: 0, y: 0 }; const R = { x: w, y: 0 };
  return apex === "A" ? { A: top, B: L, C: R } : apex === "B" ? { A: L, B: top, C: R } : { A: L, B: R, C: top };
}

/** يعيد دائماً مثلثاً (أقرب شكل معقول إن كانت المعطيات ناقصة أو متناقضة). */
export function placeTriangleFromKnowns(k: TriangleKnowns): TrianglePoints {
  if (k.ab && k.bc && k.ca) { const t = fromThreeSides(k.ab, k.bc, k.ca); if (t) return t; }
  if (k.equilateral) { const s = k.ab ?? k.bc ?? k.ca ?? DEFAULT_SIDE; return { A: { x: s / 2, y: (s * Math.sqrt(3)) / 2 }, B: { x: 0, y: 0 }, C: { x: s, y: 0 } }; }
  const right = k.rightAt ?? (["A", "B", "C"] as const).find((v) => k.angleDeg?.[v] === 90);
  if (right) return placeRight(right, k);
  if (k.isoscelesApex) return placeIsosceles(k.isoscelesApex, k);
  const ang = k.angleDeg ?? {};
  if (k.ab && k.bc && ang.B) return { A: { x: k.ab * Math.cos(rad(ang.B)), y: k.ab * Math.sin(rad(ang.B)) }, B: { x: 0, y: 0 }, C: { x: k.bc, y: 0 } };
  if (k.ab && k.ca && ang.A) return { A: { x: 0, y: 0 }, B: { x: k.ab, y: 0 }, C: { x: k.ca * Math.cos(rad(ang.A)), y: k.ca * Math.sin(rad(ang.A)) } };
  if (k.bc && k.ca && ang.C) return { A: { x: k.bc - k.ca * Math.cos(rad(ang.C)), y: k.ca * Math.sin(rad(ang.C)) }, B: { x: 0, y: 0 }, C: { x: k.bc, y: 0 } };
  if (ang.B && ang.C && ang.B + ang.C < 179) {
    const a = k.bc ?? DEFAULT_SIDE; const aAng = 180 - ang.B - ang.C; const c = (a * Math.sin(rad(ang.C))) / Math.sin(rad(aAng));
    return { A: { x: c * Math.cos(rad(ang.B)), y: c * Math.sin(rad(ang.B)) }, B: { x: 0, y: 0 }, C: { x: a, y: 0 } };
  }
  const a = k.bc ?? DEFAULT_SIDE; const c = k.ab ?? a * 0.8; const b = k.ca ?? a * 0.9;
  return fromThreeSides(c, a, b) ?? { A: { x: a * 0.4, y: a * 0.8 }, B: { x: 0, y: 0 }, C: { x: a, y: 0 } };
}
```

**`geo-label-utils.ts`**
```ts
/**
 * @file geo-label-utils.ts
 * @description توحيد أسماء النقاط (عربي/لاتيني) وتحليل قوائم الأسماء مثل «أ ب جـ» أو «ABC».
 */
export const MODULE_ID_GEO_LABEL_UTILS = "geo_label_utils" as const;

const ARABIC_TO_LATIN: Record<string, string> = { أ: "A", ب: "B", ج: "C", د: "D", ه: "E", و: "F", ز: "G", ح: "H", ط: "I", ي: "J", ك: "K", ل: "L", م: "M", ن: "N" };
const LATIN_TO_ARABIC: Record<string, string> = Object.fromEntries(Object.entries(ARABIC_TO_LATIN).map(([ar, la]) => [la, ar]));
const ARABIC_DISPLAY: Record<string, string> = { ج: "جـ", ه: "هـ" };
const POINT_LETTERS = "أبجدهوزحطيكلمنسعفصقر";
const STOP_WORDS = new Set(["في", "من", "هو", "هي", "مع", "ثم", "أو", "لا", "ما", "عن", "إذا", "كل", "أي", "به", "له"]);

/** مفتاح داخلي موحّد: حرف لاتيني كبير دائماً إن وُجد له مقابل، وإلا الحرف العربي نفسه. */
export function normalizeLabelKey(raw: string): string {
  const ch = raw.replace(/ـ/g, "").replace(/[إآا]/g, "أ").trim();
  if (/^[a-zA-Z]$/.test(ch)) return ch.toUpperCase();
  return ARABIC_TO_LATIN[ch] ?? ch;
}

export function toDisplayLabel(key: string, notation: "english" | "arabic"): string {
  if (notation === "english") return key;
  const ar = LATIN_TO_ARABIC[key] ?? key;
  return ARABIC_DISPLAY[ar] ?? ar;
}

/** يحلل «أ ب جـ» أو «ABC» أو «أب» إلى مفاتيح. يعيد null إن لم يكن النص قائمة أسماء نقاط صالحة. */
export function parseLabelList(text: string): string[] | null {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;
  const keys: string[] = [];
  for (const tk of tokens) {
    const bare = tk.replace(/ـ/g, "");
    if (/^[A-Z]{1,4}$/.test(bare)) { for (const c of bare) keys.push(c); continue; }
    if (/^[a-z]$/.test(bare)) { keys.push(bare.toUpperCase()); continue; }
    if (STOP_WORDS.has(bare)) return null;
    const chars = [...bare].map((c) => c.replace(/[إآا]/g, "أ"));
    if (chars.length >= 1 && chars.length <= 2 && chars.every((c) => POINT_LETTERS.includes(c))) { for (const c of chars) keys.push(normalizeLabelKey(c)); continue; }
    return null;
  }
  return keys;
}

export const pairKey = (a: string, b: string): string => (a < b ? `${a}${b}` : `${b}${a}`);
```

**`geo-fact-types.ts`**
```ts
/**
 * @file geo-fact-types.ts
 * @description مفردات «الحقائق الهندسية» المغلقة التي يفهمها المركّب. كل حقيقة سطر واحد قصير.
 */
export const MODULE_ID_GEO_FACT_TYPES = "geo_fact_types" as const;

export type Seg = readonly [string, string];
export type QuadKind = "rectangle" | "square" | "rhombus" | "parallelogram" | "trapezoid" | "general";

export type GeoFact =
  | { readonly k: "triangle"; readonly labels: readonly string[]; readonly right?: string; readonly isoApex?: string; readonly equilateral?: boolean }
  | { readonly k: "quad"; readonly kind: QuadKind; readonly labels: readonly string[] }
  | { readonly k: "length"; readonly seg: Seg; readonly text: string; readonly numeric?: number }
  | { readonly k: "equal"; readonly a: Seg; readonly b: Seg }
  | { readonly k: "angle"; readonly arms?: readonly [string, string, string]; readonly vertex: string; readonly deg?: number; readonly text?: string; readonly right?: boolean }
  | { readonly k: "pointOn"; readonly p: string; readonly seg: Seg }
  | { readonly k: "midpoint"; readonly p: string; readonly seg: Seg }
  | { readonly k: "parallel"; readonly a: Seg; readonly b: Seg }
  | { readonly k: "perp"; readonly a: Seg; readonly b: Seg; readonly foot?: string }
  | { readonly k: "bisector"; readonly seg: Seg; readonly vertex: string }
  | { readonly k: "median"; readonly seg: Seg }
  | { readonly k: "intersect"; readonly a: Seg; readonly b: Seg; readonly p: string }
  | { readonly k: "diagonalsMeet"; readonly p: string }
  | { readonly k: "draw"; readonly seg: Seg }
  | { readonly k: "extend"; readonly from: string; readonly through: string; readonly to: string };
```

**`geo-fact-splitter.ts`**
```ts
/**
 * @file geo-fact-splitter.ts
 * @description يقسّم وصف الشكل إلى سطور حقائق، ويوحّد الرموز (≈ // ⊥ ∈ °) قبل التحليل.
 */
export const MODULE_ID_GEO_FACT_SPLITTER = "geo_fact_splitter" as const;

const EASTERN = "٠١٢٣٤٥٦٧٨٩";

export function normalizeGeometryText(raw: string): string {
  return String(raw ?? "")
    .replace(/[٠-٩]/g, (d) => String(EASTERN.indexOf(d)))
    .replace(/٫/g, ".")
    .replace(/[ΔΔ△∆▵]/g, " مثلث ")
    .replace(/∥|\\parallel|يوازي|موازٍ|موازي|متوازيان/g, " // ")
    .replace(/⊥|\\perp|عمودي\s*على|عمودية\s*على|يعامد|عمود\s*على/g, " ⊥ ")
    .replace(/تنتمي\s*إلى|ينتمي\s*إلى|تقع\s*على|يقع\s*على|∈/g, " ∈ ")
    .replace(/\bدرجة\b|\bدرجات\b/g, "°")
    .replace(/[−–—]/g, "-")
    .replace(/[∠]|\\angle/g, " ∠ ")
    .replace(/∼|\\sim|~|يشابه|تشابه/g, " ~ ")
    .replace(/\s+/g, " ")
    .trim();
}

const LEADING_CONNECTORS = /^(?:فيه|فيها|حيث|بحيث|إذا\s*كان|لتكن|ليكن|لتكن|ثم|و(?=\s))\s*/;

export function splitDescriptionIntoFactStrings(description: string): string[] {
  const text = normalizeGeometryText(description);
  const raw = text
    .split(/[;؛\n،]|(?<=\D)\.(?=\s)/)
    .map((s) => { let t = s.trim(); for (let i = 0; i < 2; i++) t = t.replace(LEADING_CONNECTORS, "").trim(); return t; })
    .filter((s) => s.length > 0);
  return raw.flatMap(splitSimilarityPair).flatMap(expandEqualityChain);
}

const SHAPE_WORD = /^(?:ال)?(?:مثلث|مستطيل|مربع|معين|متوازي\s*أضلاع|شبه\s*منحرف|رباعي)/;

/** «مثلث ABC ~ DEF» ← «مثلث ABC» و«مثلث DEF» (يرث كلمة الشكل من الجزء الأول). */
function splitSimilarityPair(fact: string): string[] {
  if (!fact.includes(" ~ ")) return [fact];
  const parts = fact.split(" ~ ").map((p) => p.trim()).filter(Boolean);
  const word = parts[0].match(SHAPE_WORD)?.[0];
  if (!word) return parts;
  return parts.map((p, i) => (i > 0 && !SHAPE_WORD.test(p) ? `${word} ${p}` : p));
}

const SEG_TOKEN = "(?:[A-Z]{2}|[أ-ي]ـ?\\s*[أ-ي]ـ?)";
const CHAIN = new RegExp(`^(${SEG_TOKEN})\\s*=\\s*(${SEG_TOKEN})\\s*=\\s*(.+)$`, "u");

/** «أ ب = أ جـ = 7» ← «أ ب = أ جـ» و«أ ب = 7» و«أ جـ = 7». */
function expandEqualityChain(fact: string): string[] {
  const m = fact.match(CHAIN);
  return m ? [`${m[1]} = ${m[2]}`, `${m[1]} = ${m[3]}`, `${m[2]} = ${m[3]}`] : [fact];
}
```

**`geo-fact-parser.ts`**
```ts
/**
 * @file geo-fact-parser.ts
 * @description يحوّل سطر حقيقة واحداً (بعد التطبيع) إلى GeoFact، أو null إن لم يفهمه.
 */
import type { GeoFact, QuadKind, Seg } from "./geo-fact-types";
import { normalizeLabelKey, parseLabelList } from "./geo-label-utils";
import { evaluateSimpleMathExpression } from "@/core/exam-grading/math-simple-expression-evaluator";

export const MODULE_ID_GEO_FACT_PARSER = "geo_fact_parser" as const;

const L = "(?:[A-Za-z]|[أ-ي]ـ?)";
const SEGRX = `(${L}\\s*${L})(?![A-Za-zء-ي])`;
const ONE = `(${L})(?![A-Za-zء-ي])`;
const LIST = `((?:${L}\\s+)+${L}|[A-Z]{2,5})(?![A-Za-zء-ي])`;
const LIST1 = `((?:${L}\\s+)*${L}|[A-Z]{1,5})(?![A-Za-zء-ي])`;
const re = (src: string) => new RegExp(`^${src}$`, "u");

function seg(raw: string): Seg | null { const k = parseLabelList(raw); return k && k.length === 2 ? [k[0], k[1]] : null; }
function one(raw: string): string { return normalizeLabelKey(raw.trim()); }

const QUAD_WORDS: Array<[RegExp, QuadKind]> = [
  [/^مستطيل/, "rectangle"], [/^مربع/, "square"], [/^معين/, "rhombus"], [/^متوازي\s*أضلاع/, "parallelogram"],
  [/^شبه\s*منحرف/, "trapezoid"], [/^رباعي/, "general"],
];

export function parseGeoFactString(s: string): GeoFact | null {
  let m: RegExpMatchArray | null;
  // مثلث
  if ((m = s.match(new RegExp(`^(?:ال)?مثلث\\s*${LIST}\\s*(.*)$`, "u")))) {
    const labels = parseLabelList(m[1]); const rest = m[2] || "";
    if (labels && labels.length === 3) {
      const right = rest.match(new RegExp(`قائم(?:\\s*الزاوية)?\\s*(?:في|عند)\\s*${ONE}`, "u"));
      const iso = rest.match(new RegExp(`متساوي\\s*الساقين(?:.*?(?:رأسه|رأس)\\s*(?:هو|عند|في)?\\s*${ONE})?`, "u"));
      return { k: "triangle", labels, right: right ? one(right[1]) : undefined, isoApex: iso ? (iso[1] ? one(iso[1]) : labels[0]) : undefined, equilateral: /متساوي\s*الأضلاع/.test(rest) || undefined };
    }
  }
  // رباعي
  for (const [word, kind] of QUAD_WORDS) {
    const q = s.match(new RegExp(`^${word.source.slice(1)}\\s*${LIST}`, "u"));
    if (q) { const labels = parseLabelList(q[1]); if (labels && labels.length === 4) return { k: "quad", kind, labels }; }
  }
  // قياس زاوية
  if ((m = s.match(new RegExp(`^ق\\s*\\(\\s*∠?\\s*${LIST1}\\s*\\)\\s*=\\s*(.+)$`, "u"))) || (m = s.match(new RegExp(`^∠\\s*${LIST1}\\s*=\\s*(.+)$`, "u")))) {
    const labels = parseLabelList(m[1]); const val = m[2].replace(/°/g, "").trim();
    if (labels && (labels.length === 1 || labels.length === 3)) {
      const num = Number(val);
      return { k: "angle", arms: labels.length === 3 ? [labels[0], labels[1], labels[2]] : undefined, vertex: labels.length === 3 ? labels[1] : labels[0], deg: Number.isFinite(num) ? num : undefined, text: Number.isFinite(num) ? undefined : val, right: num === 90 || undefined };
    }
  }
  if ((m = s.match(new RegExp(`^∠\\s*${LIST1}\\s*قائمة$`, "u"))) || (m = s.match(new RegExp(`^(?:زاوية\\s*)?${LIST1}\\s*قائمة$`, "u")))) {
    const labels = parseLabelList(m[1]);
    if (labels && (labels.length === 1 || labels.length === 3)) return { k: "angle", arms: labels.length === 3 ? [labels[0], labels[1], labels[2]] : undefined, vertex: labels.length === 3 ? labels[1] : labels[0], deg: 90, right: true };
  }
  // توازي / تعامد
  if ((m = s.match(re(`${SEGRX}\\s*//\\s*${SEGRX}`)))) { const a = seg(m[1]); const b = seg(m[2]); if (a && b) return { k: "parallel", a, b }; }
  if ((m = s.match(re(`${SEGRX}\\s*⊥\\s*${SEGRX}(?:\\s*(?:في|عند)\\s*${ONE})?`)))) { const a = seg(m[1]); const b = seg(m[2]); if (a && b) return { k: "perp", a, b, foot: m[3] ? one(m[3]) : undefined }; }
  // منصف / متوسط
  if ((m = s.match(re(`${SEGRX}\\s*(?:ينصف|منصف|منصفاً)\\s*(?:∠\\s*)?${LIST1}`)))) { const a = seg(m[1]); const v = parseLabelList(m[2]); if (a && v) return { k: "bisector", seg: a, vertex: v.length === 3 ? v[1] : v[0] }; }
  if ((m = s.match(re(`${SEGRX}\\s*متوسط(?:\\s*في\\s*المثلث.*)?`)))) { const a = seg(m[1]); if (a) return { k: "median", seg: a }; }
  // تقاطع
  if ((m = s.match(re(`${SEGRX}\\s*(?:∩|×)\\s*${SEGRX}\\s*=\\s*\\{?\\s*${ONE}\\s*\\}?`)))) { const a = seg(m[1]); const b = seg(m[2]); if (a && b) return { k: "intersect", a, b, p: one(m[3]) }; }
  if ((m = s.match(new RegExp(`قطرا.*يتقاطعان\\s*(?:في|عند)\\s*${ONE}`, "u")))) return { k: "diagonalsMeet", p: one(m[1]) };
  if ((m = s.match(re(`${SEGRX}\\s*(?:و|،|,)?\\s*${SEGRX}\\s*يتقاطعان\\s*(?:في|عند)\\s*${ONE}`)))) { const a = seg(m[1]); const b = seg(m[2]); if (a && b) return { k: "intersect", a, b, p: one(m[3]) }; }
  // نقطة على قطعة / منتصف
  if ((m = s.match(re(`${ONE}\\s*منتصف\\s*(?:القطعة\\s*)?${SEGRX}`)))) { const a = seg(m[2]); if (a) return { k: "midpoint", p: one(m[1]), seg: a }; }
  if ((m = s.match(re(`${ONE}\\s*∈\\s*(?:القطعة\\s*|الضلع\\s*|ال?وتر\\s*)?${SEGRX}`)))) { const a = seg(m[2]); if (a) return { k: "pointOn", p: one(m[1]), seg: a }; }
  if ((m = s.match(re(`${ONE}\\s*على\\s*(?:القطعة\\s*|الضلع\\s*)?${SEGRX}`)))) { const a = seg(m[2]); if (a) return { k: "pointOn", p: one(m[1]), seg: a }; }
  // مد وتوصيل
  if ((m = s.match(re(`(?:نمد|مد|امدد)\\s*${SEGRX}\\s*(?:إلى|حتى)\\s*${ONE}`)))) { const a = seg(m[1]); if (a) return { k: "extend", from: a[0], through: a[1], to: one(m[2]) }; }
  if ((m = s.match(re(`(?:نصل|ارسم|نرسم|وصل)\\s*${SEGRX}`)))) { const a = seg(m[1]); if (a) return { k: "draw", seg: a }; }
  // تساوي أضلاع / طول
  if ((m = s.match(re(`${SEGRX}\\s*=\\s*${SEGRX}`)))) { const a = seg(m[1]); const b = seg(m[2]); if (a && b) return { k: "equal", a, b }; }
  if ((m = s.match(re(`${SEGRX}\\s*=\\s*(.+?)\\s*(?:سم|م|وحدة|وحدات)?`)))) {
    const a = seg(m[1]); const text = m[2].trim();
    if (a && text) { const n = evaluateSimpleMathExpression(text.replace(/√\s*(\d+)/g, "sqrt($1)").replace(/\s+/g, "")); return { k: "length", seg: a, text, numeric: n === null ? undefined : n }; }
  }
  return null;
}
```

**`geo-shape-placers.ts`**
```ts
/**
 * @file geo-shape-placers.ts
 * @description يضع المضلعات المعلنة (مثلثات/رباعيات) على المستوى بأطوالها المعطاة، ويعيد النقاط والأضلاع.
 */
import type { GeoFact } from "./geo-fact-types";
import { pairKey } from "./geo-label-utils";
import { placeTriangleFromKnowns, type TriVertexKey } from "./geo-triangle-placer";
import type { Vec2 } from "./geo-vector-math";

export const MODULE_ID_GEO_SHAPE_PLACERS = "geo_shape_placers" as const;

export type LengthMap = ReadonlyMap<string, { readonly text: string; readonly numeric?: number }>;
export interface PlacedPolygon { readonly labels: readonly string[]; readonly kind: string; readonly rightAt?: string }

const rad = (d: number) => (d * Math.PI) / 180;

export function placeDeclaredShapes(
  facts: readonly GeoFact[],
  lengths: LengthMap,
  points: Map<string, Vec2>
): PlacedPolygon[] {
  const num = (a: string, b: string) => lengths.get(pairKey(a, b))?.numeric;
  const angleOf = (v: string) => { const f = facts.find((x) => x.k === "angle" && x.vertex === v && x.deg !== undefined); return f && f.k === "angle" ? f.deg : undefined; };
  const polygons: PlacedPolygon[] = [];
  let cursorX = 0;

  for (const f of facts) {
    if (f.k !== "triangle" && f.k !== "quad") continue;
    const labels = f.labels;
    let local: Vec2[];
    if (f.k === "triangle") {
      const [a, b, c] = labels;
      const keyOf = (l: string): TriVertexKey | undefined => (l === a ? "A" : l === b ? "B" : l === c ? "C" : undefined);
      const tri = placeTriangleFromKnowns({
        ab: num(a, b), bc: num(b, c), ca: num(c, a),
        angleDeg: { A: angleOf(a), B: angleOf(b), C: angleOf(c) },
        rightAt: f.right ? keyOf(f.right) : undefined,
        isoscelesApex: f.isoApex ? keyOf(f.isoApex) : undefined,
        equilateral: f.equilateral,
      });
      local = [tri.A, tri.B, tri.C];
    } else {
      const [a, b, c, d] = labels;
      const w = num(a, b) ?? num(c, d) ?? 6;
      const dPar = num(d, a) ?? num(b, c) ?? w * 0.6;
      const th = rad(angleOf(a) ?? 60);
      if (f.kind === "rectangle") local = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: dPar }, { x: 0, y: dPar }];
      else if (f.kind === "square") local = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: w }, { x: 0, y: w }];
      else if (f.kind === "rhombus") { const D = { x: w * Math.cos(th), y: w * Math.sin(th) }; local = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w + D.x, y: D.y }, D]; }
      else if (f.kind === "parallelogram") { const D = { x: dPar * Math.cos(th), y: dPar * Math.sin(th) }; local = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w + D.x, y: D.y }, D]; }
      else if (f.kind === "trapezoid") { const top = num(c, d) ?? w * 0.5; const h = w * 0.55; const o = (w - top) / 2; local = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: o + top, y: h }, { x: o, y: h }]; }
      else local = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w * 0.85, y: w * 0.7 }, { x: w * 0.1, y: w * 0.6 }];
    }
    const minX = Math.min(...local.map((p) => p.x));
    const maxX = Math.max(...local.map((p) => p.x));
    labels.forEach((l, i) => { if (!points.has(l)) points.set(l, { x: local[i].x - minX + cursorX, y: local[i].y }); });
    cursorX += maxX - minX + (maxX - minX) * 0.45;
    polygons.push({ labels, kind: f.k === "quad" ? f.kind : "triangle", rightAt: f.k === "triangle" ? f.right : undefined });
  }
  return polygons;
}
```

**`geo-figure-composer.ts`**
```ts
/**
 * @file geo-figure-composer.ts
 * @description المركّب الهندسي: يحوّل وصف الحقائق إلى CanonicalGeometryFigureIR (مثلثات/رباعيات + نقاط وخطوط مشتقة).
 */
import type { CanonicalAngleNode, CanonicalGeometryFigureIR, CanonicalSegmentNode, CanonicalVertexNode } from "@/core/ssot/geometry-archetype-ssot";
import type { GeoFact, Seg } from "./geo-fact-types";
import { splitDescriptionIntoFactStrings } from "./geo-fact-splitter";
import { parseGeoFactString } from "./geo-fact-parser";
import { pairKey, toDisplayLabel } from "./geo-label-utils";
import { placeDeclaredShapes, type PlacedPolygon } from "./geo-shape-placers";
import { angleBisectorFoot, footOfPerpendicular, lineIntersection, vAdd, vDist, vLerp, vMid, vScale, vSub, type Vec2 } from "./geo-vector-math";

export const MODULE_ID_GEO_FIGURE_COMPOSER = "geo_figure_composer" as const;

export interface ComposeResult { readonly figure: CanonicalGeometryFigureIR | null; readonly warnings: readonly string[] }
interface ExtraSeg { readonly a: string; readonly b: string; readonly dashed?: boolean }
const clamp = (t: number) => Math.min(0.92, Math.max(0.08, t));

export function composeFigureFromGeometryDescription(description: string, figureId: string, notation: "english" | "arabic" = "english"): ComposeResult {
  const warnings: string[] = [];
  const facts: GeoFact[] = [];
  for (const line of splitDescriptionIntoFactStrings(description)) {
    const f = parseGeoFactString(line);
    if (f) facts.push(f); else warnings.push(`لم يُفهم السطر: «${line}»`);
  }
  const lengths = new Map<string, { text: string; numeric?: number }>();
  for (const f of facts) if (f.k === "length") lengths.set(pairKey(f.seg[0], f.seg[1]), { text: f.text, numeric: f.numeric });
  const points = new Map<string, Vec2>();
  const polygons = placeDeclaredShapes(facts, lengths, points);
  if (polygons.length === 0) return { figure: null, warnings: [...warnings, "لا يوجد مثلث أو رباعي معلن في الوصف."] };

  const host = new Map<string, Seg>();
  const extras: ExtraSeg[] = [];
  const ticks = new Map<string, number>();
  const parallelMarks = new Map<string, number>();
  const angles: CanonicalAngleNode[] = [];
  let tickGroup = 0; let parallelGroup = 0;
  const P = (k: string) => points.get(k);
  const polyOf = (v: string): PlacedPolygon | undefined => polygons.find((p) => p.labels.includes(v));
  const trianglesSides = (apex: string): Seg | null => { const p = polyOf(apex); if (!p || p.labels.length !== 3) return null; const o = p.labels.filter((l) => l !== apex); return [o[0], o[1]]; };
  const addExtra = (a: string, b: string, dashed?: boolean) => { if (!extras.some((e) => pairKey(e.a, e.b) === pairKey(a, b))) extras.push({ a, b, dashed }); };
  const isPolygonSide = (a: string, b: string) => polygons.some((p) => p.labels.some((l, i) => pairKey(l, p.labels[(i + 1) % p.labels.length]) === pairKey(a, b)));
  const addAngle = (vertex: string, arm1: string, arm2: string, extra: Partial<CanonicalAngleNode> = {}) => angles.push({ id: `${figureId}_ang_${angles.length}`, vertexId: `${figureId}_v_${vertex}`, arm1VertexId: `${figureId}_v_${arm1}`, arm2VertexId: `${figureId}_v_${arm2}`, ...extra });

  for (const p of polygons) if (p.rightAt && p.labels.length === 3) addAngle(p.rightAt, ...(p.labels.filter((l) => l !== p.rightAt) as [string, string]), { isRightAngle: true, degrees: 90 });

  const ratioOnSeg = (p: string, a: string, b: string): number => {
    const ap = lengths.get(pairKey(a, p))?.numeric; const pb = lengths.get(pairKey(p, b))?.numeric; const ab = lengths.get(pairKey(a, b))?.numeric;
    if (ap && pb) return clamp(ap / (ap + pb));
    if (ap && ab) return clamp(ap / ab);
    if (pb && ab) return clamp(1 - pb / ab);
    const A = P(a); const B = P(b);
    if (ap && A && B) return clamp(ap / vDist(A, B));
    if (pb && A && B) return clamp(1 - pb / vDist(A, B));
    return 0.4;
  };

  for (const f of facts) {
    if (f.k === "pointOn" || f.k === "midpoint") {
      const [a, b] = f.seg; if (!P(a) || !P(b)) { warnings.push(`نقطتا ${a}${b} غير معرّفتين`); continue; }
      points.set(f.p, vLerp(P(a)!, P(b)!, f.k === "midpoint" ? 0.5 : ratioOnSeg(f.p, a, b))); host.set(f.p, f.seg);
      if (f.k === "midpoint") { ticks.set(pairKey(a, f.p), ++tickGroup); ticks.set(pairKey(f.p, b), tickGroup); }
    } else if (f.k === "parallel") {
      const [x, y] = f.a; const [p, q] = f.b; if (!P(x) || !P(y) || !P(p) || !P(q)) { warnings.push("توازي بنقاط غير معرّفة"); continue; }
      const d = vSub(P(q)!, P(p)!); const hy = host.get(y); const hx = host.get(x);
      if (hy) { const r = lineIntersection(P(x)!, vAdd(P(x)!, d), P(hy[0])!, P(hy[1])!); if (r) points.set(y, r); }
      else if (hx) { const r = lineIntersection(P(y)!, vAdd(P(y)!, d), P(hx[0])!, P(hx[1])!); if (r) points.set(x, r); }
      parallelGroup = Math.min(2, parallelGroup + 1);
      parallelMarks.set(pairKey(x, y), parallelGroup); parallelMarks.set(pairKey(p, q), parallelGroup); addExtra(x, y);
    } else if (f.k === "perp") {
      let [apex, foot] = f.a; if (f.foot) foot = f.foot; if (!P(apex) && P(foot)) [apex, foot] = [foot, apex];
      const [b0, b1] = f.b; if (!P(apex) || !P(b0) || !P(b1)) { warnings.push("تعامد بنقاط غير معرّفة"); continue; }
      points.set(foot, footOfPerpendicular(P(apex)!, P(b0)!, P(b1)!)); host.set(foot, f.b); addExtra(apex, foot);
      addAngle(foot, apex, vDist(P(foot)!, P(b1)!) >= vDist(P(foot)!, P(b0)!) ? b1 : b0, { isRightAngle: true, degrees: 90 });
    } else if (f.k === "bisector") {
      const opp = trianglesSides(f.vertex); const d = f.seg[0] === f.vertex ? f.seg[1] : f.seg[0]; if (!opp || !P(f.vertex)) continue;
      points.set(d, angleBisectorFoot(P(f.vertex)!, P(opp[0])!, P(opp[1])!)); host.set(d, opp); addExtra(f.vertex, d);
      addAngle(f.vertex, opp[0], d, { arcCount: 1 }); addAngle(f.vertex, d, opp[1], { arcCount: 1 });
    } else if (f.k === "median") {
      const apex = f.seg[0]; const d = f.seg[1]; const opp = trianglesSides(apex); if (!opp) continue;
      points.set(d, vMid(P(opp[0])!, P(opp[1])!)); host.set(d, opp); addExtra(apex, d);
      ticks.set(pairKey(opp[0], d), ++tickGroup); ticks.set(pairKey(d, opp[1]), tickGroup);
    } else if (f.k === "intersect") {
      const r = lineIntersection(P(f.a[0])!, P(f.a[1])!, P(f.b[0])!, P(f.b[1])!); if (!r) { warnings.push("مستقيمان متوازيان لا يتقاطعان"); continue; }
      points.set(f.p, r); for (const s of [f.a, f.b]) if (!isPolygonSide(s[0], s[1])) addExtra(s[0], s[1]);
    } else if (f.k === "diagonalsMeet") {
      const q = polygons.find((x) => x.labels.length === 4); if (!q) continue; const [a, b, c, d] = q.labels;
      const r = lineIntersection(P(a)!, P(c)!, P(b)!, P(d)!); if (r) { points.set(f.p, r); addExtra(a, c); addExtra(b, d); }
    } else if (f.k === "extend") {
      const A = P(f.from); const B = P(f.through); if (!A || !B) continue; const len = lengths.get(pairKey(f.through, f.to))?.numeric ?? vDist(A, B) * 0.4;
      points.set(f.to, vAdd(B, vScale(vSub(B, A), len / (vDist(A, B) || 1)))); addExtra(f.through, f.to, true);
    } else if (f.k === "draw") addExtra(f.seg[0], f.seg[1]);
    else if (f.k === "equal") { ticks.set(pairKey(f.a[0], f.a[1]), ++tickGroup); ticks.set(pairKey(f.b[0], f.b[1]), tickGroup); }
    else if (f.k === "angle") {
      const poly = polyOf(f.vertex); const labels = poly?.labels ?? []; const i = labels.indexOf(f.vertex);
      const arms = f.arms ? [f.arms[0], f.arms[2]] : i >= 0 ? [labels[(i + labels.length - 1) % labels.length], labels[(i + 1) % labels.length]] : null;
      if (arms) addAngle(f.vertex, arms[0], arms[1], { degrees: f.deg, degreesLabel: f.text ?? (f.deg !== undefined && !f.right ? `${f.deg}°` : undefined), isRightAngle: f.right });
    }
  }

  const keyId = (k: string) => `${figureId}_v_${k}`;
  const segments: CanonicalSegmentNode[] = [];
  const pushSeg = (a: string, b: string, baseKey: string, dashed?: boolean) => {
    const len = lengths.get(pairKey(a, b));
    segments.push({ id: `${figureId}_s_${segments.length}`, fromVertexId: keyId(a), toVertexId: keyId(b),
      ...(len ? { lengthLabel: { value: len.numeric ?? len.text, unit: "سم" } } : {}),
      ...(ticks.get(pairKey(a, b)) ? { tickMarks: Math.min(3, ticks.get(pairKey(a, b))!) as 1 | 2 | 3 } : {}),
      ...(parallelMarks.get(baseKey) ? { parallelArrows: parallelMarks.get(baseKey) as 1 | 2 } : {}), ...(dashed ? { strokeStyle: "dashed" as const } : {}) });
  };
  for (const poly of polygons) poly.labels.forEach((a, i) => {
    const b = poly.labels[(i + 1) % poly.labels.length]; const base = pairKey(a, b);
    const mids = [...host.entries()].filter(([, s]) => pairKey(s[0], s[1]) === base).map(([k]) => k).sort((m, n) => vDist(P(a)!, P(m)!) - vDist(P(a)!, P(n)!));
    const chain = [a, ...mids, b]; for (let j = 0; j + 1 < chain.length; j++) pushSeg(chain[j], chain[j + 1], base);
  });
  for (const e of extras) if (P(e.a) && P(e.b)) pushSeg(e.a, e.b, pairKey(e.a, e.b), e.dashed);

  const vertices: CanonicalVertexNode[] = [...points.entries()].map(([k, position]) => ({ id: keyId(k), label: toDisplayLabel(k, notation), position }));
  const hasQuad = polygons.some((p) => p.labels.length === 4);
  return { warnings, figure: { figureId, familyId: hasQuad ? "quadrilateral_family" : "triangle_family", branchId: hasQuad ? "quad_parallelogram_diagonals" : "triangle_base_general",
    titleArabic: description.slice(0, 60), notationLanguage: notation, vertices, segments, angles,
    polygons: polygons.map((p) => p.labels.map(keyId)) } };
}
```

**`tests/geo-figure-composer.test.ts`**
```ts
import { describe, it, expect } from "vitest";
import { splitDescriptionIntoFactStrings as sp } from "@/core/geometry-engine/fact-compositor/geo-fact-splitter";
import { parseGeoFactString as pf } from "@/core/geometry-engine/fact-compositor/geo-fact-parser";
import { composeFigureFromGeometryDescription as c } from "@/core/geometry-engine/fact-compositor/geo-figure-composer";

const parse = (s: string) => sp(s).map(pf);
describe("fact parser", () => {
  it("مثلث قائم", () => expect(parse("مثلث أ ب جـ قائم في ب")[0]).toMatchObject({ k: "triangle", labels: ["A", "B", "C"], right: "B" }));
  it("طول", () => expect(parse("أ ب = 6 سم")[0]).toMatchObject({ k: "length", seg: ["A", "B"], numeric: 6 }));
  it("توازي", () => expect(parse("د هـ // ب جـ")[0]).toMatchObject({ k: "parallel" }));
  it("تشابه ينتج مثلثين", () => expect(parse("Δ ABC ~ Δ DEF").map((f) => f?.k)).toEqual(["triangle", "triangle"]));
  it("سلسلة تساوي", () => expect(sp("أ ب = أ جـ = 7").length).toBe(3));
  it("سطر غير مفهوم = null", () => expect(parse("كلام عشوائي")[0]).toBeNull());
});
describe("composer", () => {
  it("مثلث قائم 6-8-10", () => {
    const r = c("مثلث أ ب جـ قائم في ب ; أ ب = 6 ; ب جـ = 8", "f", "english");
    expect(r.figure?.vertices.length).toBe(3); expect(r.figure?.angles[0].isRightAngle).toBe(true);
  });
  it("طاليس: النقطة د عند 2/5", () => {
    const r = c("مثلث أ ب جـ ; د على أ ب ; هـ على أ جـ ; د هـ // ب جـ ; أ د = 2 ; د ب = 3", "f", "english");
    const v = (l: string) => r.figure!.vertices.find((x) => x.label === l)!.position;
    const A = v("A"), B = v("B"), D = v("D");
    expect(Math.hypot(D.x - A.x, D.y - A.y) / Math.hypot(B.x - A.x, B.y - A.y)).toBeCloseTo(0.4, 2);
    const C = v("C"), E = v("E"); // DE ∥ BC
    expect((D.x - E.x) * (B.y - C.y) - (D.y - E.y) * (B.x - C.x)).toBeCloseTo(0, 5);
  });
  it("إقليدس: أ د عمودي على ب جـ", () => {
    const r = c("مثلث أ ب جـ قائم في أ ; أ د ⊥ ب جـ ; أ ب = 6 ; أ جـ = 8", "f", "english");
    const v = (l: string) => r.figure!.vertices.find((x) => x.label === l)!.position;
    const A = v("A"), B = v("B"), C = v("C"), D = v("D");
    expect((D.x - A.x) * (C.x - B.x) + (D.y - A.y) * (C.y - B.y)).toBeCloseTo(0, 5);
  });
  it("مثلثان متشابهان = 6 رؤوس + polygons", () => {
    const r = c("Δ ABC ~ Δ DEF ; AB = 4 ; BC = 6 ; CA = 8 ; DE = 2 ; EF = 3 ; FD = 4", "f", "english");
    expect(r.figure?.vertices.length).toBe(6); expect(r.figure?.polygons?.length).toBe(2);
  });
  it("وصف بلا شكل = null + تحذير", () => { const r = c("شكل غريب", "f"); expect(r.figure).toBeNull(); expect(r.warnings.length).toBeGreaterThan(0); });
  it("تدوين عربي", () => expect(c("مثلث A B C", "f", "arabic").figure?.vertices.map((v) => v.label)).toEqual(["أ", "ب", "جـ"]));
});
```

- **تنبيه:** هذه الملفات تعتمد على المهمتين E-1 (المقيّم الحسابي) و G-2 (حقل `polygons`). نفّذهما أولاً.
- **معيار القبول:** 12 اختباراً ناجحاً.

### G-2: حقل المضلعات الصريحة + إصلاح التظليل (D23)
1. **`src/core/ssot/geometry-archetype-ssot.ts`:** داخل `CanonicalGeometryFigureIR` وبعد `angles` أضف:
```ts
  /** مضلعات صريحة للتظليل (قوائم معرّفات رؤوس). إن غابت يُستعمل التخمين القديم حسب عدد الرؤوس. */
  readonly polygons?: readonly (readonly string[])[];
```
2. **`vector-svg-surface-shading-projector.ts`:** بعد السطر `const polygonGroups: string[][] = [];` أضف:
```ts
  if (figure.polygons && figure.polygons.length > 0) {
    figure.polygons.forEach((ids) => polygonGroups.push([...ids]));
  } else
```
   (أي أن الكتلة `if (vertices.length === 6) {...}` الحالية تصير `else if` بعدها مباشرة). لا تغيّر باقي الدالة.
- **معيار القبول:** أشكال القوالب القديمة تُظلَّل كما كانت (لا `polygons` فيها)، وأشكال المركّب تُظلَّل مضلعاتها فقط (لا خط شبحي مثل الذي ظهر في شكل طاليس).

### G-3: ربط المركّب بالمطابق
- **الملف (تعديل):** `src/core/geometry-engine/natural-arabic-geometry-matcher.ts`.
- **الخطوات:**
  1. استورد `composeFigureFromGeometryDescription` من `./fact-compositor/geo-figure-composer`.
  2. أضف دالة جديدة مصدّرة (لا تعدّل القديمة):
```ts
export function matchGeometryWithDiagnostics(
  desc: string, figureId: string, notation: MathNotationLanguage = "english"
): { readonly figure?: CanonicalGeometryFigureIR; readonly warnings: readonly string[]; readonly source: "compositor" | "catalog" | "none" } {
  const composed = composeFigureFromGeometryDescription(desc, figureId, notation);
  if (composed.figure && composed.warnings.length === 0) return { figure: composed.figure, warnings: [], source: "compositor" };
  const legacy = matchOptionalGeometryFigureFromArabicDescription(desc, figureId, notation);
  if (legacy) return { figure: legacy, warnings: composed.warnings, source: "catalog" };
  if (composed.figure) return { figure: composed.figure, warnings: composed.warnings, source: "compositor" };
  return { warnings: composed.warnings.length ? composed.warnings : ["لم يُتعرَّف على الشكل من الوصف."], source: "none" };
}
```
  3. **لا تغيّر** `matchArabicDescriptionToCanonicalGeometryFigure` الآن.
- **معيار القبول:** اختبار: وصف الدرسين المجرَّبين (تشابه المضلعات/المثلثات) ما زال ينتج شكلاً؛ وصف بحقائق جديدة ينتج `source: "compositor"`.

### G-4: استعمال الدالة في محللات الأسئلة والمذكرات
- **الملفات (تعديل):** `notebooklm-exam-questions-parser.ts` (و`notebooklm-stage-parsers-helper.ts` و`notebooklm-final-review-parser.ts` إن وُجد فيها استدعاء لـ `matchOptionalGeometryFigureFromArabicDescription`: نفّذ `grep -rn matchOptionalGeometryFigureFromArabicDescription src`).
- **الخطوات (في كل ملف):** استبدل الاستدعاء بـ `matchGeometryWithDiagnostics(...)`، وخذ `.figure` للحقل `attachedGeometryFigure`، وضع `.warnings` في `figureDiagnosticsAr` (فقط إن وُجد وسم `[رسم هندسي:` ولم يُنتج `figure` أو كانت `warnings` غير فارغة).
- **معيار القبول:** سؤال بوسم رسم غير مفهوم ينتج `figureDiagnosticsAr` غير فارغ.

### G-5: تنبيه المعلم في الاستوديو
- **الملف (تعديل):** `studio-exam-generator-tab.tsx` (وتبويب المذكرة/المراجعة المقابل).
- **الخطوات:** بعد التحليل اجمع `figureDiagnosticsAr` لكل سؤال واعرض صندوقاً أصفر: «⚠️ السؤال {n}: لم يُرسم الشكل كاملاً — {التحذير}. عدّل سطر الرسم في رد NotebookLM ثم أعد التصيير.» (لا يظهر في الـPDF).
- **معيار القبول:** وصف خاطئ يُظهر الصندوق؛ وصف سليم لا يُظهره.

### G-6: تعليمات NotebookLM الجديدة للرسم
- **الملف (تعديل):** `src/core/prompts/smart-geometry-prompt-director.ts` (داخل `buildSmartGeometryPromptGuidance`) وبند 5 في `shared-math-prompt-invariants.ts`.
- **الخطوات:** أضف إلى نص التوجيه الهندسي الفقرة التالية **حرفياً**:
```
📐 صيغة الرسم الإلزامية: اكتب كل شكل داخل [رسم هندسي: ...] كسطور حقائق قصيرة مفصولة بـ ; وبهذا المفردات فقط:
- الشكل: مثلث أ ب جـ | مثلث أ ب جـ قائم في ب | مثلث أ ب جـ متساوي الساقين رأسه أ | مثلث أ ب جـ متساوي الأضلاع | مستطيل أ ب جـ د | مربع أ ب جـ د | معين أ ب جـ د | متوازي أضلاع أ ب جـ د | شبه منحرف أ ب جـ د
- الأطوال: أ ب = 6 سم  (ويجوز تعبير مثل 5√3 أو س + 2)     الأضلاع المتساوية: أ ب = أ جـ
- الزوايا: ق(∠ب) = 60°  | ق(∠ أ ب جـ) = 50°  | ∠ ب قائمة
- النقاط: د على أ ب | د منتصف أ ب
- العلاقات: د هـ // ب جـ | أ د ⊥ ب جـ | أ د ينصف ∠ أ | أ د متوسط | أ جـ ∩ ب د = {م} | قطراه يتقاطعان في م | نمد أ ب إلى د | نصل أ د
- مثلثان متشابهان: Δ ABC ~ Δ DEF ثم أطوال كل منهما.
قواعد: لا تستعمل حرف «و» للفصل بين الحقائق (استعمل ; فقط). اذكر كل طول معروف في السؤال. لا تكتب أي إحداثيات أو كود.
مثال: [رسم هندسي: مثلث أ ب جـ ; د على أ ب ; هـ على أ جـ ; د هـ // ب جـ ; أ د = 2 سم ; د ب = 3 سم ; ب جـ = 10 سم]
```
- **معيار القبول:** البرومبت الناتج لدرس هندسي يحتوي «📐 صيغة الرسم الإلزامية».

### G-7: دعم الدائرة (مهمة موسّعة — نفّذها بعد نجاح G-1…G-6)
أضف مفردات الدائرة بنفس الأسلوب (ملفات جديدة صغيرة في نفس المجلد، لا تعدّل ملفات G-1 إلا بإضافة `case`):
- **حقائق جديدة في `geo-fact-types.ts`:** `circle` (مركز + نصف قطر اختياري)، `onCircle` (نقاط على الدائرة)، `chord` (وتر)، `diameter` (قطر)، `tangent` (مماس عند نقطة).
- **الصيغ:** `دائرة مركزها م ; نق = 5` ، `أ ب جـ د على الدائرة` ، `أ ب وتر` ، `أ ب قطر` ، `أ جـ مماس للدائرة عند أ`.
- **الحساب:** المركز `(0,0)` ونصف القطر `r` (افتراضي 5). النقطة على الدائرة بزاوية `θ`: `(r·cosθ, r·sinθ)`. توزَّع النقاط المعلنة على الدائرة بزوايا `90°, 210°, 330°, 150°…` بالترتيب؛ القطر: `θ` و`θ+180°`. المماس عند `P`: عمودي على نصف القطر `MP`؛ نقطة نهايته `P + 0.6r × (−sinθ, cosθ)`.
- **الإخراج:** `familyId: "circle_family"`؛ معرّف رأس المركز **يجب أن يحتوي كلمة `center`** (لأن المصيّر الحالي يرسم المحيط من الرأس الذي id فيه `center` وأول رأس آخر كنقطة على المحيط).
- **اختبارات:** 4 اختبارات (نقاط على بعد `r` من المركز، القطر يمر بالمركز، المماس عمودي على نصف القطر، وصف بلا مركز لا يسقط).
- **معيار القبول:** اختبارات Vitest الجديدة ناجحة + شكل دائرة بوتر ومماس يظهر صحيحاً.

### G-8: إصلاح حافة التسميات (D24)
- **الملف (تعديل):** `vector-svg-figure-projector.ts`.
- **الخطوة:** غيّر السطر `const padding = Math.max(9, Math.min(13, Math.round(Math.min(width, height) * 0.1)));` إلى `Math.max(16, Math.min(22, Math.round(Math.min(width, height) * 0.14)))`.
- **معيار القبول:** رقم الطول على الضلع الأيسر في شكل قائم الزاوية لا يُقصّ.

### G-9: الرسوم البيانية (الدوال) — مهمة موسّعة
> السبب (D22): لا يوجد أي مسار يوصل رسماً بيانياً للـPDF أو لامتحان الطالب اليوم.
1. **نوع جديد** `src/core/ssot/cartesian-graph-spec-ssot.ts`:
```ts
export type GraphFunctionKind = "linear" | "quadratic" | "absolute" | "vertical_line" | "horizontal_line";
export interface GraphFunctionSpec { readonly kind: GraphFunctionKind; readonly a: number; readonly b: number; readonly c: number; readonly label?: string; readonly dashed?: boolean }
export interface GraphPointSpec { readonly x: number; readonly y: number; readonly label?: string }
export interface CartesianGraphSpec {
  readonly xMin: number; readonly xMax: number; readonly yMin: number; readonly yMax: number;
  readonly functions: readonly GraphFunctionSpec[]; readonly points: readonly GraphPointSpec[];
}
```
   (الصيغ: linear: `y = a·x + b` ؛ quadratic: `y = a·x² + b·x + c` ؛ absolute: `y = a·|x − b| + c` ؛ vertical_line: `x = a` ؛ horizontal_line: `y = a`).
2. **محلل** `src/core/geometry-engine/graph-compositor/graph-fact-parser.ts`: يقرأ `[رسم بياني: ...]` بسطور مفصولة بـ `;`: `ص = ٢س + ١` ، `ص = س² − ٤` ، `ص = |س − ١| + ٢` ، `س = ٣` ، `نقطة (٢, ٣) أ` ، `المدى س من −٣ إلى ٣ ، ص من −٤ إلى ٦`. استعمل `normalizeGeometryText` ثم regex لكل صيغة؛ المدى الافتراضي إن غاب: `[-5,5]` ويتسع تلقائياً ليشمل النقاط وقمة القطع. + اختبارات (6 صيغ).
3. **مصيّر** `src/core/geometry-engine/graph-compositor/graph-svg-projector.ts`: دالة `projectCartesianGraphToSVGMarkup(spec, { widthPx, heightPx, strokeColorHex, accentColorHex, numeralMode })` تُخرج SVG: شبكة خفيفة، محوران بسهمين وتسمية `س` و`ص`، أرقام على المحورين كل وحدة (أو كل 2 إن ضاقت)، المنحنى كـ `<polyline>` بـ 80 نقطة عينات، النقاط كدوائر صغيرة مع التسمية. لا تستعمل مكتبات.
4. **توصيل:** أضف الحقل `graphSpec?: CartesianGraphSpec` إلى `QuestionAssessmentIR` و`PrintableMathQuestionItem` (واجعل `convertQuestionAssessmentIRToPrintableItem` ينسخه). في المحللات (G-4): إن وُجد وسم `[رسم بياني: ...]` استدعِ المحلل الجديد وضع الناتج في `graphSpec`. **احذف** `رسم\s*بياني|إحداثيات|مستوى\s*إحداثي` من قائمة الاستبعاد فقط إن لم تسبب رسماً خاطئاً لمسائل لفظية (اترك القائمة كما هي في هذه الخطوة؛ المسار الجديد منفصل).
5. **عرض:** أنشئ `src/core/pdf-layout-engine/question-figure-svg-renderer.ts` بدالة `renderQuestionFigureSvg(question, { widthPx, heightPx, ... })` تختار الهندسي أو البياني، واستعملها في `embedded-geometry-svg-docker.tsx` (للأسئلة المطبوعة) وفي `exam-question-card.tsx` (للطالب). وفي حساب `aspect` للرسم البياني استعمل `1.3`.
6. **برومبت:** أضف إلى توجيه الرسم فقرة صيغة `[رسم بياني: ...]` بنفس أسلوب G-6.
- **معيار القبول:** سؤال بـ `[رسم بياني: ص = ٢س + ١ ; نقطة (٠, ١) أ]` يظهر في الـPDF وفي امتحان الطالب بخط مستقيم صحيح المقطع والميل، بحجم يتبع `figureScale`.

### G-10: مخططات الإحصاء (اختيارية، بعد G-9)
مجلد `statistics-engine` غير موصول بأي ملف. إن احتجتها: مصيّر SVG لكل من (أعمدة، مدرج تكراري، دائرة قطاعات) يقرأ `CanonicalStatisticsDatasetIR` ويُوصَّل بنفس مسار G-9 (حقل `statisticsDataset` في `PrintableMathQuestionItem`). **لا تبدأها قبل أن يطلبها المالك.**

### G-11: مجموعة اختبارات ذهبية للرسم (Golden)
- **الملف (جديد):** `tests/geo-golden-descriptions.test.ts`.
- **الخطوات:** اجمع **20 وصفاً** حقيقياً من ردود NotebookLM لدروس مختلفة (مثلث قائم، فيثاغورس، طاليس، منصف، متوسطات، إقليدس، تشابه مثلثين، شبه منحرف وقطراه، متوازي أضلاع، معين، مربع وقطراه، مثلث متساوي الساقين، زوايا بمجهول `5س`، …) بصيغة الحقائق، واختبر لكل وصف: `figure !== null` و`warnings.length === 0` وعدد الرؤوس المتوقع. أضف إليها وصفي الدرسين المجرَّبين (التشابه) بصيغة الحقائق.
- **معيار القبول:** كل الاختبارات الذهبية ناجحة. **أي وصف جديد يفشل في الاستخدام الحقيقي يُضاف هنا أولاً ثم يُصلح المحلل.**

### G-12: لقطة بصرية للتحقق
- اكتب سكربت `scripts/render-golden-figures.ts` يمر على أوصاف G-11 ويكتب SVG لكل واحد في `docs/qa/figures/` باستعمال `projectGeometryFigureToSVGMarkup`، ليراجعها المالك بالعين بعد كل تعديل في المحرك.

---

# المرحلة 6 — الفحص النهائي

### Q-1: سيناريوهات القبول اليدوية (المالك ينفذها)
**الامتحان الإلكتروني:**
1. الصق رداً بصيغة `online-exam` فيه 6 اختيار + 3 قصيرة + 1 برهان ← انشر ← يظهر تحذير باستبعاد البرهان.
2. من هاتف طالب: ابدأ ← حدّث الصفحة وسط الامتحان ← **الوقت لا يعود لأول**.
3. اكتب في سؤال قصير إجابته 5 الإجابات: `٥` ✓ ، `x=5` ✓ ، `15` ✗ ، كلاماً عشوائياً ✗.
4. سلّم: تظهر الحلقة والعدّاد، والخطأ بإطار أحمر مع اهتزاز، والصحيح بأخضر. التسليم الثاني مرفوض.
5. افحص `Network` في المتصفح: لا إجابات صحيحة في أي رد قبل التسليم.
**المذكرة/المراجعة:** افتح 3 دروس مختلفة المنهج ← الصفحات ممتلئة ≥ 85% ما عدا الأخيرة، لا تغيّر في الأرقام بعد الاستقرار، والطباعة مطابقة للمعاينة.
**الاختبار PDF:** 40 سؤالاً ← تحذير واقتراح؛ 15 سؤالاً بأشكال ← ورقتان كحد أقصى والأشكال بجوار الأسئلة.
**الرسم:** 5 أوصاف جديدة لدروس لم تُجرَّب ← أشكال صحيحة أو تنبيه واضح للمعلم (لا شكل خاطئ صامت).

### Q-2: بوابة الجودة
- أضف في `package.json` السكربت `"verify": "tsc --noEmit && vitest run"`. **لا يُعتمد أي تعديل إلا بنجاح `npm run verify`.**

### Q-3: تحديث هذا التقرير
بعد إتمام كل مرحلة حدّث جدول «حالة المهام» أدناه (✅/⬜) ولا تحذف شيئاً.


---

# المرحلة 7 — المهمة C: تنظيف الكود بالكامل

**الهدف:** حذف الملفات الميتة، وتحديد اليتيمة المهمة (غير المربوطة) وربطها أو إبقائها بقرار واضح، وتوحيد المكرر، وإزالة الحشو، وتقليل الأسطر **بنفس النتيجة أو أفضل**.

**الأرقام الفعلية قبل التنظيف** (من فحص `src.zip` بأداة C-0.3؛ 227 ملفاً و21,617 سطراً):

| البند | العدد |
|---|---|
| ملفات يتيمة مباشرة (لا يستوردها أحد) | 22 |
| ملفات ميتة تسلسلياً (لا يستوردها إلا يتيم) | 2 |
| رموز معلنة ولا يستعملها أحد إطلاقاً | 13 (واحد منها إيجابي كاذب) |
| رموز مصدَّرة بلا داعٍ (تُستعمل داخل ملفها فقط) | 161 |
| ثوابت `MODULE_ID_` (لا يستعملها أي ملف آخر) | 171 |
| ملفات تتجاوز 200 سطر (مخالفة دستور المشروع) | 18 |
| ثابت أحرف الاختيار «أ ب جـ د» مكرر | 3 نسخ |
| إعداد اتصال Supabase (الرابط والمفتاح) مكرر | 5 ملفات |
| أزواج ملفات فيها كتل مكررة ≥ 7 أسطر | 4 أزواج |

> **متى تنفّذ؟** بعد إتمام المراحل 0–6 (وليس قبلها)، لأن تلك المراحل تحذف وتضيف ملفات، وبعضها يربط ملفات يتيمة.
> **ملاحظة مهمة:** إن ظهر في تقرير الأداة ملف جديد من ملفات هذه الخطة (مثل `autofit-*` أو `geo-*`) على أنه يتيم، فهذا يعني أن مهمة ربطه لم تكتمل. **عُد لتلك المهمة ولا تحذفه.**

---

## C-0: التحضير (إلزامي قبل أي حذف)

**C-0.1** افتح فرعاً جديداً: `git checkout -b cleanup/dead-code` ثم تأكد أن `git status` نظيف.

**C-0.2** شغّل `npm run verify` ثم `npx next build`. يجب أن ينجحا. إن فشل أحدهما **توقف** وأبلغ المالك (لا تبدأ التنظيف فوق مشروع مكسور).

**C-0.3** أنشئ أداة الفحص (للقراءة فقط، لا تعدّل شيئاً) بالمحتوى التالي **حرفياً**:

**`scripts/audit-dead-code.mjs`**
```js
/**
 * @file audit-dead-code.mjs
 * @description يفحص src ويطبع: (1) ملفات يتيمة (2) ملفات ميتة تسلسلياً (3) رموز مصدَّرة غير مستعملة. للقراءة فقط، لا يعدّل شيئاً.
 * التشغيل:  node scripts/audit-dead-code.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src");
const ENTRY = /(^|\/)(page|layout|route|loading|error|not-found|middleware|template|global-error|opengraph-image|icon|sitemap|robots|manifest)\.(ts|tsx)$/;
const IS_TEST = /\.test\.(ts|tsx)$/;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : /\.(ts|tsx)$/.test(e.name) ? [path.join(dir, e.name)] : []);
}
const files = walk(ROOT);
const fileSet = new Set(files);
const rel = (f) => path.relative(ROOT, f).split(path.sep).join("/");
const text = new Map(files.map((f) => [f, fs.readFileSync(f, "utf8")]));

function resolveSpec(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = path.join(ROOT, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return null;
  return [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts"), path.join(base, "index.tsx")].find((c) => fileSet.has(c)) ?? null;
}

const IMPORT_RE = /(?:from\s+|import\s*\(\s*|import\s+|require\(\s*)["']([^"']+)["']/g;
const inbound = new Map(files.map((f) => [f, new Set()]));
for (const f of files) for (const m of text.get(f).matchAll(IMPORT_RE)) {
  const r = resolveSpec(f, m[1]);
  if (r && r !== f) inbound.get(r).add(f);
}

const isRoot = (f) => ENTRY.test(rel(f)) || IS_TEST.test(rel(f));
const orphans = files.filter((f) => inbound.get(f).size === 0 && !isRoot(f));
const dead = new Set(orphans);
for (let changed = true; changed;) {
  changed = false;
  for (const f of files) {
    if (dead.has(f) || isRoot(f)) continue;
    const ins = [...inbound.get(f)];
    if (ins.length > 0 && ins.every((i) => dead.has(i))) { dead.add(f); changed = true; }
  }
}

const EXPORT_RE = /export\s+(?:async\s+)?(?:function|const|class|interface|type|enum)\s+(\w+)/g;
const count = (name, t) => (t.match(new RegExp(`\\b${name}\\b`, "g")) ?? []).length;
const fullyDead = []; const internalOnly = [];
for (const f of files) {
  if (dead.has(f)) continue;
  for (const m of text.get(f).matchAll(EXPORT_RE)) {
    const name = m[1];
    if (name.startsWith("MODULE_ID_")) continue;
    const usedElsewhere = files.some((g) => g !== f && count(name, text.get(g)) > 0);
    if (usedElsewhere) continue;
    (count(name, text.get(f)) > 1 ? internalOnly : fullyDead).push(`${rel(f)} :: ${name}`);
  }
}

const out = [];
out.push(`# تقرير الكود الميت (${new Date().toISOString().slice(0, 10)})`);
out.push(`\nإجمالي الملفات: ${files.length}`);
out.push(`\n## 1) ملفات يتيمة مباشرة (${orphans.length})`, ...orphans.map((f) => `- ${rel(f)}`));
out.push(`\n## 2) ملفات ميتة بسبب أن من يستوردها يتيم (${[...dead].filter((f) => !orphans.includes(f)).length})`, ...[...dead].filter((f) => !orphans.includes(f)).map((f) => `- ${rel(f)}`));
out.push(`\n## 3) رموز معلنة ولا يستعملها أحد إطلاقاً (${fullyDead.length})`, ...fullyDead.map((s) => `- ${s}`));
out.push(`\n## 4) رموز مصدَّرة لكن تُستعمل داخل ملفها فقط — احذف كلمة export (${internalOnly.length})`, ...internalOnly.map((s) => `- ${s}`));
fs.mkdirSync("docs/qa", { recursive: true });
fs.writeFileSync("docs/qa/dead-code-report.md", out.join("\n") + "\n");
console.log(`files=${files.length} orphans=${orphans.length} dead=${dead.size} fullyDead=${fullyDead.length} internalOnly=${internalOnly.length}`);
console.log("التقرير: docs/qa/dead-code-report.md");
```

**C-0.4** شغّلها: `node scripts/audit-dead-code.mjs`. ستكتب `docs/qa/dead-code-report.md`. احفظ الأرقام الأربعة (يتيمة / ميتة تسلسلياً / ميتة تماماً / تصدير زائد) في ملف `docs/qa/cleanup-summary.md` تحت عنوان «قبل».

**C-0.5** قواعد الشغل في كل المهام التالية:
1. **حذف واحد ثم فحص:** احذف رمزاً/ملفاً واحداً ← `npx tsc --noEmit` ← إن نجح أكمل. إن فشل: `git checkout -- .` وتراجع (لا تحاول «إصلاح» بتغييرات إضافية).
2. **دليل قبل الحذف:** قبل حذف أي ملف نفّذ `grep -rn "<اسم-الملف-بدون-الامتداد>" src tests` وتأكد أنه لا يظهر إلا الملف نفسه.
3. **commit مستقل لكل مهمة فرعية** برسالة `cleanup: C-x.y`.
4. **الأداة لا ترى** `tests/` ولا الاستيراد الديناميكي بنصوص مركّبة؛ لذلك الخطوة 2 (grep) إلزامية وليست اختيارية.
5. ممنوع حذف أي ملف مذكور في C-2 (يتيم مهم) بدون موافقة صريحة من المالك.

---

## C-1: حذف الملفات والرموز الميتة المؤكدة

### C-1.1 حذف مجلد الفيديو الفارغ (4 ملفات)
الملفات: `lesson-video-chapters-playlist.tsx` و`protected-video-stream-player.tsx` و`video-lectures-manager-view.tsx` و`video-timestamped-math-notes.tsx` داخل `src/features/video-lectures-hub/`.
- **الحالة:** كل ملف 7 أسطر، فيه تعليق وثابت `MODULE_ID_` فقط. لا مكوّن ولا دالة، ولا أحد يستوردها.
- **الخطوات:** (1) `grep -rn "video-lectures-hub" src` ← يجب ألا تظهر نتيجة خارج المجلد نفسه. (2) احذف المجلد كاملاً. (3) `npx tsc --noEmit`.
- **ملاحظة للمالك:** إن خططت لمركز فيديو مستقبلاً، فأغلفة فارغة لا قيمة لها، وتُنشأ حينها بمحتوى حقيقي.

### C-1.2 حذف المقيّم القديم
- `src/features/electronic-exams-hub/live-exam-instant-evaluator.ts` (96 سطراً): منطق تصحيح بالكلمات المفتاحية، استُبدل بالمصحّح الجديد في المرحلة 1. إن لم تحذفه في المهمة S-4 فاحذفه الآن بعد `grep` (لا يجب أن يستورده أحد).

### C-1.3 حذف الرموز الميتة (13 رمزاً)
نفّذ **رمزاً واحداً في كل مرة** حسب الجدول (الملف ← الرمز ← الإجراء):

| # | الملف | الرمز | الإجراء |
|---|---|---|---|
| 1 | `app/layout.tsx` | `metadata` | ⛔ **لا تلمسه** (إيجابي كاذب: Next.js يقرؤه تلقائياً). |
| 2 | `prep-similarity-geometry-catalog.ts` | `SimilarityFigureBuildOptions` | احذف تعريف النوع. |
| 3 | `core/ir/a4-paginated-layout-ir.ts` | `A4PaginatedDocumentIR` | احذف النوع؛ إن بقي الملف بلا محتوى مفيد احذف الملف (بعد grep). |
| 4 | `core/ssot/curriculum-hierarchy-ssot.ts` | `DEFAULT_SEEDED_CURRICULUM_UNITS_SSOT` | احذف (قيمته مصفوفة فارغة). |
| 5 | نفس الملف | `clearCurriculumUnitsForGradeSSOT` | احذف الدالة. |
| 6 | `core/ssot/math-branches-ssot.ts` | `ALL_MATH_BRANCHES_LIST` | احذف السطر. |
| 7 | `core/ssot/teacher-identity-ssot.ts` | `authenticateStudentCodeOrPhoneSSOT` | احذف الدالة (غير مستعملة؛ دخول الطالب يتم عبر `/api/auth/student-login`). |
| 8 | `core/ssot/theme-mode-ssot.ts` | `THEME_PALETTES_SSOT` | احذف؛ ثم إن صار النوع `ThemePaletteTokens` بلا استعمال (grep) فاحذفه أيضاً. |
| 9 | `published-online-exams-store.ts` | `loadActiveExamForGradeSSOT` | احذف (استُبدلت بجلب الخادم). |
| 10 | `notebooklm-booklet-stages-merger.ts` | `parseBookletResponseToPrintableItems` | احذف الدالة. |
| 11 | نفس الملف | `mergeNotebookLMBookletThreeStagesToIR` | احذف الدالة. |
| 12 | `notebooklm-final-review-parser.ts` | `parseNotebookLMFinalReviewResponse` | احذف الدالة. |
| 13 | نفس الملف | `parseFinalReviewResponseToPrintableItems` | احذف الدالة. |

بعد حذف 10–13 بالذات:
1. شغّل `node scripts/audit-dead-code.mjs` مرة أخرى.
2. إن ظهر `core/ir/booklet-lesson-content-ir.ts` (أو أي ملف) كيتيم جديد ← احذفه (بعد grep). هذا هو الملف الذي كان يكرر ثلاث كتل مع المدمج القديم.
3. احذف أي `import` صار غير مستعمل في الملفين (يخبرك `tsc` بالأمر عبر C-5.1).
- **معيار قبول C-1:** `npm run verify` و`npx next build` ناجحان، ومولّد المذكرة/المراجعة/الاختبار يعمل كما كان (افتح كلاً منها وولّد بنص تجريبي).

---

## C-2: ملفات يتيمة **مهمة** (لا تُحذف) — حكم وإجراء

| الملف | ما هو | الحكم | الإجراء |
|---|---|---|---|
| `core/ingestion/unsolicited-diagram-guard.ts` | يمنع إرفاق شكل هندسي بسؤال جبري لفظي لا يطلب شكلاً | **مهم وغير مربوط** (تعليق محلل الامتحان يقول إنه يستعمله لكنه لا يستدعيه) | **اربطه الآن (C-2.1)** |
| `core/validation/question-options-integrity-auditor.ts` | يتحقق: 4 بدائل غير فارغة وغير مكررة ومؤشر الإجابة صحيح | **مهم وغير مربوط** وضروري للامتحان الإلكتروني | **اربطه الآن (C-2.2)** |
| 8 مدققات في `core/validation/` (جبر، تفاضل وتكامل، هندسة إقليدية، دوال، ميكانيكا، فترات، إحصاء، مثلثات) | تتحقق حتمياً من صحة نتائج رياضية (جذور، مميز، مشتقة…) | **مهمة وغير مربوطة**؛ لا نقطة دخول تستدعيها | **أبقها**، ولا تربطها الآن (قرار المالك: مرحلة لاحقة «تدقيق إجابات NotebookLM آلياً»). لا تكلفة تشغيل لأنها لا تدخل حزمة الموقع. |
| `core/ir/math-ast-expression-ir.ts` | أنواع تخدم مدقق التفاضل فقط | تبقى مع مدققها | أبقه |
| `core/statistics-engine/` (5 فروع + `statistics-dataset-root-core.ts`) | بيانات المخططات الإحصائية (أعمدة، مدرج، قطاعات…) | **مهم وغير مربوط** (لا مصيّر له) | **أبقه**؛ ينتظر المهمة G-10 |
| `core/geometry-engine/analytic-function-family/rational-piecewise-trig-curve-branch.ts` | رسم الدوال الكسرية والمثلثية ومتعددة التعريف | **مهم وغير مربوط**؛ يخدم المهمة G-9 | **أبقه** |
| `core/pdf-layout-engine/local-woff2-fonts-stylesheet.ts` | خطوط محلية `@font-face` لثبات الطباعة بلا إنترنت | **مهم وغير مربوط**: الموقع الآن يحمّل الخطوط من Google Fonts في `layout.tsx`، وهذا الملف يحتاج ملفات `.woff2` في `public/fonts` | **قرار المالك:** (أ) يبقى للتفعيل لاحقاً (الافتراضي) أو (ب) يُحذف. لا تحذفه بدون موافقة. |
| `core/pdf-layout-engine/flow-page-packer-fill-quality.test.ts` | اختبار تراجع حقيقي لمحرك التوزيع | **ليس ميتاً** (يبدو يتيماً لأن الاختبارات لا يستوردها أحد) | شغّل `npx vitest run`؛ إن فشل **أصلحه أو أبلغ**، ولا تحذفه |
| `core/pdf-layout-engine/flow-layout-quality-audit.ts` | تدقيق امتلاء الصفحات | مستعمل من الاختبار أعلاه ومن B-2 | أبقه |

### C-2.1 ربط حارس الرسم غير المطلوب
- **الملف (تعديل):** `src/core/ingestion/notebooklm-exam-questions-parser.ts`
- **الخطوات:**
  1. أضف الاستيراد: `import { isDiagramJustifiedForQuestion } from "./unsolicited-diagram-guard";`
  2. ابحث عن السطر الذي يستدعي مطابق الرسم (حول السطر 153: `geoMatch ? matchOptionalGeometryFigureFromArabicDescription(...)` أو `matchGeometryWithDiagnostics(...)` إن نُفّذت G-4).
  3. قبله عرّف: `const diagramAllowed = isDiagramJustifiedForQuestion({ promptArabic: <متغير نص السؤال في نفس الدالة>, rawDiagramTagText: geoMatch?.[1], branchId: <المتغير الذي يحمل فرع الدرس ويُستعمل لبناء الـIR في نفس الدالة> });`
  4. اجعل شرط الاستدعاء `diagramAllowed && geoMatch?.[1]` بدل `geoMatch?.[1]` وحده. وإن كان الحارس رفض الرسم فلا تضع `figureDiagnosticsAr` (فالحجب مقصود).
  5. كرّر الأمر نفسه في `notebooklm-stage-parsers-helper.ts` **فقط إن** وُجد في دالة الاستدعاء نص السؤال وفرع الدرس؛ وإلا اتركه.
- **اختبار (انسخ كما هو):** `tests/unsolicited-diagram-guard.test.ts`
```ts
import { describe, it, expect } from "vitest";
import { isDiagramJustifiedForQuestion as ok } from "@/core/ingestion/unsolicited-diagram-guard";

describe("unsolicited-diagram-guard", () => {
  it("سؤال جبري لفظي: لا رسم", () => expect(ok({ promptArabic: "أوجد مجموعة حل المعادلة", rawDiagramTagText: "مثلث أ ب جـ", branchId: "algebra" })).toBe(false));
  it("نص صريح «في الشكل المقابل»: رسم", () => expect(ok({ promptArabic: "في الشكل المقابل أوجد س", rawDiagramTagText: "مثلث", branchId: "algebra" })).toBe(true));
  it("فرع هندسي بوسم صحيح: رسم", () => expect(ok({ promptArabic: "احسب مساحة المثلث", rawDiagramTagText: "مثلث", branchId: "plane_geometry" })).toBe(true));
  it("وسم فارغ: لا رسم", () => expect(ok({ promptArabic: "أي شيء", rawDiagramTagText: "  ", branchId: "plane_geometry" })).toBe(false));
});
```
- **معيار القبول:** الاختبارات الأربعة ناجحة؛ سؤال هندسي ما زال يحصل على شكله كما كان؛ سؤال جبري لفظي به وسم رسم عابر لا يطبع شكلاً.

### C-2.2 ربط مدقق البدائل في فاصل الامتحان الإلكتروني
- **الملف (تعديل):** `src/core/exam-grading/online-exam-public-key-splitter.ts`
- **الخطوات:**
  1. أضف الاستيراد: `import { auditMCQQuestionIntegrity } from "@/core/validation/question-options-integrity-auditor";`
  2. غيّر الشرط `if (q.patternKind === "mcq" && q.mcqChoicesArabic && q.correctMcqChoiceIndex !== undefined) {` إلى:
```ts
    if (q.patternKind === "mcq" && q.mcqChoicesArabic && q.correctMcqChoiceIndex !== undefined && auditMCQQuestionIntegrity(q).isQuestionReadyForExam) {
```
  (فسؤال بديلاه مكرران أو عدد بدائله ≠ 4 يُستبعد من النشر مع تنبيه المعلم برقمه، بدل أن يُنشر معيباً.)
- **اختبار (انسخ كما هو):** `tests/splitter-options-audit.test.ts`
```ts
import { describe, it, expect } from "vitest";
import { splitExamIntoPublicAndKey } from "@/core/exam-grading/online-exam-public-key-splitter";
import type { QuestionAssessmentIR } from "@/core/ir/question-assessment-ir";

describe("splitter + مدقق البدائل", () => {
  const q = { questionId: "m", displayOrderNumber: 1, patternKind: "mcq", allocatedMarks: 1, promptArabic: "س؟", mcqChoicesArabic: ["1", "1", "2", "3"], correctMcqChoiceIndex: 0, finalCanonicalAnswerArabic: "1", modelSolutionStepsArabic: [], branchId: "algebra", unitId: "u", lessonId: "l", lessonTitleArabic: "t", cognitiveDepth: "direct_application", estimatedSolveMinutes: 1 } as unknown as QuestionAssessmentIR;
  it("بديلان مكرران = مستبعد", () => expect(splitExamIntoPublicAndKey([q]).excludedQuestionNumbers).toEqual([1]));
});
```
- **معيار القبول:** هذا الاختبار + اختبارات `online-exam-grader.test.ts` السابقة (6) ناجحة كلها.

---

## C-3: توحيد الأكواد المكررة

### C-3.1 ثابت أحرف الاختيار (3 نسخ ← 1)
النسخ: `official-mcq-answer-key-summary-table.tsx` (سطر 24) و`adaptive-mcq-choices-card.tsx` (سطر 25، اسمه `CHOICE_LETTERS`) و`a4-pedagogical-capsule-and-key-table.tsx` (سطر 28). كلها `["أ", "ب", "جـ", "د"] as const`.
- **الخطوات:**
  1. في `src/core/ssot/numeral-and-unit-ssot.ts` أضف في آخر الملف: `export const ARABIC_CHOICE_LETTERS = ["أ", "ب", "جـ", "د"] as const;`
  2. في كل ملف من الثلاثة: احذف الثابت المحلي، وأضف `import { ARABIC_CHOICE_LETTERS } from "../ssot/numeral-and-unit-ssot";` (أضفه إلى سطر استيراد موجود من نفس الملف إن وُجد)، وبدّل اسم `CHOICE_LETTERS` إلى `ARABIC_CHOICE_LETTERS` في `adaptive-mcq-choices-card.tsx`.
- **معيار القبول:** `grep -rn '"أ", "ب", "جـ", "د"' src` ← نتيجة واحدة فقط. شكل بدائل الاختيار في المعاينة كما كان.

### C-3.2 إعداد اتصال Supabase (5 نسخ ← 1)
الملفات الخمسة: `app/api/auth/student-login/route.ts` و`app/api/auth/student-register/route.ts` و`app/api/cron/supabase-keepalive/route.ts` و`core/supabase/supabase-cloud-sync-ssot.ts` و`core/supabase/supabase-realtime-submissions-channel.ts`.
- **الخطوات:**
  1. أنشئ `src/core/supabase/supabase-config-ssot.ts`:
```ts
/**
 * @file supabase-config-ssot.ts
 * @description المصدر الوحيد لرابط ومفتاح Supabase العام (كان مكرراً في 5 ملفات).
 */
export const MODULE_ID_SUPABASE_CONFIG_SSOT = "supabase_config_ssot" as const;

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "<انسخ هنا حرفياً نفس رابط https://....supabase.co الموجود حالياً في الملفات>";
export const SUPABASE_PUBLIC_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "<انسخ هنا حرفياً نفس المفتاح العام الاحتياطي الموجود حالياً>";
```
  2. في كل ملف من الخمسة: ابحث عن الثابتين المحليين (الرابط والمفتاح)، احذفهما، واستورد من الملف الجديد. **حافظ على سلوك كل ملف**: الملفات الخادمية التي تستعمل `process.env.SUPABASE_SERVICE_ROLE_KEY` تبقى على نمطها: `const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_PUBLIC_KEY;`.
  3. في `src/core/auth/exam-server-supabase-helper.ts` (المهمة E-7) استورد `SUPABASE_URL` من الملف الجديد بدل قراءته من `process.env` مباشرة.
- **ممنوع:** حذف القيم الاحتياطية (قد لا تكون متغيرات البيئة مضبوطة في الاستضافة)، ولا تضع مفتاح الخدمة في هذا الملف أبداً.
- **معيار القبول:** `grep -rn "supabase.co" src` ← نتيجة واحدة. تسجيل دخول الطالب وتسجيله والنشر والـ keepalive تعمل كما كانت.

### C-3.3 دالة `heightOf` المكررة
- **الملفات:** `core/pdf-layout-engine/flow-layout-quality-audit.ts` و`flow-page-packer.ts`.
- **الخطوات:** افتح الدالتين. **إن كان جسماهما متطابقين حرفياً:** انقل الدالة إلى `flow-item-model.ts` مع `export` واستوردها في الملفين وامسح النسختين. **إن اختلفا بأي شيء فلا تلمسهما** واكتب في ردك أنهما مختلفتان.
- **معيار القبول:** `npx vitest run` (اختبار `flow-page-packer-fill-quality`) ناجح.

### C-3.4 (اختيارية، متوسطة الخطورة) كتلة الأزرار المكررة في تبويبي المذكرة والمراجعة
`studio-booklet-generator-tab.tsx` و`studio-final-review-generator-tab.tsx` يتطابق بينهما نحو 74 سطراً من ~205: خصوصاً غلاف شريط المراحل والأزرار (≈ الأسطر 145–186 في الأول و156–195 في الثاني) وزر البناء (≈ 197–204).
- **نفّذها فقط إذا** نجحت كل المهام السابقة، **وبعد** أخذ لقطة شاشة للتبويبين.
- **الخطوات:** (1) أنشئ `studio-three-stage-footer-actions.tsx` يحوي كتلة الأزرار السفلية ويستقبل خصائصها (النصوص ودوال النقر) كـ props. (2) استبدل الكتلة في الملفين بالمكوّن الجديد. (3) **لا تمس** منطق التحليل ولا الـhooks ولا ترتيبها.
- **معيار القبول:** لقطة الشاشة قبل/بعد متطابقة للتبويبين، وكل زر يعمل كما كان.

---

## C-4: إزالة `export` الزائدة (161 رمزاً)

رموز مصدَّرة لكنها لا تُستعمل إلا داخل ملفها: هي «واجهة عامة» بلا داعٍ.
- **الخطوات:**
  1. شغّل الأداة وافتح القسم 4 في `docs/qa/dead-code-report.md` (الصيغة `ملف :: رمز`).
  2. **نفّذ على `function` و`const` فقط. تخطَّ أي `interface` أو `type`** (قد تظهر في توقيع دالة مصدّرة فيحدث خطأ).
  3. لكل سطر: (أ) `grep -rn "<الرمز>" src tests` — إن ظهر خارج ملفه (خصوصاً في `tests/`) **لا تلمسه**. (ب) وإلا احذف كلمة `export` فقط من تعريفه. (ج) بعد كل 5 ملفات: `npx tsc --noEmit`.
  4. تخطَّ ملفات `app/**/page.tsx` و`route.ts` و`layout.tsx` تماماً.
- **ممنوع:** حذف الرمز نفسه أو تغيير اسمه أو إعادة ترتيب الملف.
- **معيار القبول:** القسم 4 في إعادة تشغيل الأداة لا يحوي إلا الأنواع (`interface`/`type`) والرموز التي تستعملها الاختبارات.

---

## C-5: الحشو الصغير

### C-5.1 الاستيرادات غير المستعملة
- معروفان: `student-code-login-form.tsx` ← `refreshRegisteredStudentsFromSupabaseSSOT` ، و`prep-grade2-euclid-areas-catalog.ts` ← `CanonicalAngleNode`. احذف الاسم من قوسي `import { ... }` (فإن صار القوسان فارغين احذف سطر الاستيراد كله).
- ثم شغّل `npx tsc --noEmit --noUnusedLocals 2>&1 | grep "TS6133"` وأصلح **فقط** الأسطر التي تقول إن استيراداً «declared but never used». **لا تحذف** متغيراً محلياً في هذه الخطوة (تلك C-7).

### C-5.2 ثوابت `MODULE_ID_` (171 ثابتاً)
- **القرار: لا تحذفها.** لا يستعملها أي ملف آخر ولا أثر لها في وقت التشغيل، لكنها جزء من دستور المشروع (`AGENTS.md`: ملف ذري بمعرّف فريد). حذفها يخالف الدستور. إن أراد المالك حذفها فليعدّل الدستور أولاً.

### C-5.3 TODO
- `grep -rnE "TODO|FIXME|XXX|HACK" src` ← يظهر واحد؛ إما أنجزه أو احذف التعليق إن لم يعد لازماً. لا توجد أكواد معلّقة (تم فحصها).

---

## C-6: تقسيم الملفات التي تتجاوز 200 سطر (دستور المشروع)

| الملف | الأسطر | ملاحظة |
|---|---|---|
| `features/unified-auth/student-code-login-form.tsx` | 465 | افصل دوال التحقق/الاتصال عن المكوّن |
| `core/ssot/teacher-identity-ssot.ts` | 440 | افصل البيانات الثابتة عن الدوال |
| `core/supabase/supabase-cloud-sync-ssot.ts` | 407 | **أعد القياس بعد المهمة E-9** (ستقل كثيراً) |
| `core/ssot/curriculum-hierarchy-ssot.ts` | 394 | افصل قوائم الصفوف/الوحدات عن الدوال |
| `features/teacher-home-dashboard/teacher-executive-dashboard-view.tsx` | 349 | استخرج المكوّنات الفرعية |
| `features/student-learning-portal/student-assigned-exams-tab.tsx` | 309 | **تخطَّه**: فُكّك في المهمة E-10 |
| `core/pdf-layout-engine/sovereign-a4-page-chrome-elements.tsx` | 279 | عنصر لكل ملف (ترويسة أولى / جارية / تذييل) |
| `features/teacher-home-dashboard/grade-honor-roll-ssot.ts` | 277 | **أعد القياس بعد E-8** |
| `features/homework-drills-hub/homework-assignment-builder.tsx` | 276 | استخرج الدوال النقية |
| `core/pdf-layout-engine/a4-pedagogical-capsule-and-key-table.tsx` | 268 | الكبسولة في ملف والجدول في ملف |
| `features/electronic-exams-hub/published-online-exams-store.ts` | 246 | **أعد القياس بعد E-9** |
| `features/student-learning-portal/student-learning-portal-view.tsx` | 229 | استخرج التبويبات |
| `components/global-ui/top-four-centers-navigation-bar.tsx` | 224 | |
| `studio-final-review-generator-tab.tsx` | 211 | **بعد C-3.4** قد ينزل تحت 200 |
| `student-homework-interactive-solver.tsx` | 209 | |
| `core/ingestion/notebooklm-booklet-stages-merger.ts` | 206 | **بعد C-1.3** سينزل تحت 200 |
| `studio-booklet-generator-tab.tsx` | 204 | **بعد C-3.4** |
| `studio-context-ribbon-bar.tsx` | 201 | |

**الخطوات لكل ملف (كرّرها حتى يصير ≤ 200):**
1. أعد قياس الأسطر: `wc -l <الملف>`؛ إن صار ≤ 200 فتخطَّه.
2. حدّد **كتلة مستقلة واحدة** (ثوابت/بيانات، أو دالة نقية، أو مكوّن فرعي لا يستعمل state الأب إلا عبر props).
3. انقلها حرفياً إلى ملف جديد باسم فريد: `<اسم-الأصل>-<وصف-الكتلة>.ts(x)` في نفس المجلد، وضع في أعلاه تعليق `@file/@description` وثابت `MODULE_ID_`.
4. استوردها في الملف الأصلي. `npx tsc --noEmit` + `npx vitest run`.
5. افتح الصفحة المعنية يدوياً وتأكد أنها تعمل.
- **ممنوع:** تغيير أي منطق، أو ترتيب الـhooks، أو أسماء الدوال المصدّرة، أو دمج ملفات.
- **معيار القبول:** لا ملف فوق 200 سطر (عدا ما قرر المالك استثناءه)، وكل الصفحات تعمل.

---

## C-7: تقليل الأسطر «بنفس النتيجة أو أفضل — وليس أقل»

> هذه المهمة الأخطر. افعلها **ملفاً واحداً في كل commit**، ولا تبدأها قبل نجاح C-0…C-6.

### C-7.1 شبكة الأمان (قبل لمس أي ملف)
- **ملف فيه دوال نقية:** اكتب اختبار Vitest بـ 3 مدخلات على الأقل (عادي/حدّي/فارغ) واجعله ينجح **قبل** التعديل، ثم أعد تشغيله بعد التعديل.
- **مكوّن واجهة:** لقطة شاشة قبل وبعد لنفس الحالة بنفس المدخلات؛ يجب أن تتطابقا.
- **PDF/طباعة:** اطبع المذكرة نفسها قبل وبعد؛ قارن عدد الصفحات والمظهر.
- **بدون شبكة أمان لا تعدّل.**

### C-7.2 التحسينات المسموحة فقط
| # | النمط | مثال |
|---|---|---|
| 1 | متغير أو معامل غير مستعمل | احذفه (`npx tsc --noEmit --noUnusedLocals --noUnusedParameters`) |
| 2 | فرعان `if` لهما نفس النتيجة | ادمجهما بشرط واحد `a \|\| b` |
| 3 | سلسلة `if/else if` تعيد قيمة حسب مفتاح | `const MAP: Record<string, X> = {...}; return MAP[key] ?? fallback;` |
| 4 | نفس التعبير ≥ 3 مرات في دالة | متغير واحد باسم واضح |
| 5 | `arr.filter(f).length > 0` | `arr.some(f)` |
| 6 | `x ? true : false` | `Boolean(x)` |
| 7 | حلقة `for` تبني مصفوفة فقط | `map` / `flatMap` إن بقي الكود مقروءاً |
| 8 | دالتان متطابقتان إلا قيمة واحدة | دالة واحدة بمعامل |

### C-7.3 الممنوعات
- حذف تعليق الترويسة `@file / @description / @invariant`.
- تغيير اسم دالة أو نوع مصدَّر.
- دمج ملفين ذريين، أو جعل السطر أطول من 120 حرفاً لتقليل العدد.
- حذف معالجة خطأ أو `try/catch` أو تحقق مدخلات أو `aria-*` أو نص عربي أو لون.
- لمس ملفات القياس والتوزيع في `pdf-layout-engine` (`flow-*`, `two-column-*`, `*-measurer`) إلا بعد تحقق طباعة كامل.

### C-7.4 القياس
لكل ملف: `wc -l` قبل وبعد. **إن زاد العدد أو تساوى فتراجع** (`git checkout -- <الملف>`). سجّل (الملف: قبل ← بعد) في `docs/qa/cleanup-summary.md`.

### C-7.5 ترتيب البدء المقترح
الأعلى تكراراً أولاً: `student-login/route.ts` و`student-register/route.ts` (بعد C-3.2)، ثم تبويبات الاستوديو الأربعة، ثم `homework-assignment-builder.tsx`، ثم `teacher-executive-dashboard-view.tsx`. أي ملف آخر يحتاج موافقة المالك.

---

## C-8: الفحص النهائي والتقرير

1. `node scripts/audit-dead-code.mjs` ← سجّل أرقام «بعد». **المتوقع:** القسم 1 يحوي فقط الملفات التي قرر المالك إبقاءها في C-2 (8 مدققات + إحصاء + منحنى الدوال + خطوط محلية)؛ القسم 3 يحوي `metadata` فقط؛ القسم 4 يحوي الأنواع فقط.
2. `npm run verify` ثم `npx next build` ← ناجحان.
3. نفّذ سيناريوهات Q-1 كاملة (امتحان إلكتروني، مذكرة، اختبار PDF، رسم).
4. اكتب `docs/qa/cleanup-summary.md` بجدول: (عدد الملفات قبل/بعد، إجمالي الأسطر قبل/بعد `find src -name "*.ts*" | xargs wc -l | tail -1`، قائمة الملفات المحذوفة، قائمة اليتيمة المهمة المتبقية وسبب إبقاء كلٍّ منها).
5. `git push` وافتح Pull Request باسم «cleanup: dead code + duplicates». **لا تدمج بنفسك:** المالك يراجع.

## B4. حالة المهام
| المرحلة | المهام | الحالة |
|---|---|---|
| 0 | S-1 … S-4 | ✅ |
| 1 | E-1 … E-13 | ⬜ |
| 2 | P-1 … P-9 | ⬜ |
| 3 | B-1 … B-4 | ⬜ |
| 4 | X-1 … X-5 | ⬜ |
| 5 | G-1 … G-12 | ⬜ |
| 6 | Q-1 … Q-3 | ⬜ |
| 7 | C-0 … C-8 | ⬜ |

## B5. ما لم يُغطَّ (قرارات تحتاج المالك)
- **تصحيح البرهان والمقالي آلياً:** غير موثوق بدون تدخل بشري؛ الخطة تُبقيه للـ PDF. إن أردت لاحقاً: «طابور تصحيح يدوي للمعلم» (مهمة مستقلة).
- **إعادة فتح محاولة طالب انتهى وقته:** يحتاج زر للمعلم يحذف صف `exam_attempts`؛ لم يُدرج.
- **رسوم الإحصاء:** G-10 مؤجلة حتى تطلبها.
