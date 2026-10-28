/**
 * @file notebooklm-real-and-synthetic-math-lines-fixture.ts
 * @description عينات M0: أسطر حقيقية حرفياً من درس «التمدد» (3 إعدادي) + أسطر اصطناعية لبقية الفروع
 * (أعداد، جبر، إحصاء، تشابه مضلعات، وحدات، فترات). تُستخدم في كاشف التسرب واختبار الـ idempotency.
 */

export interface MathFixtureLine {
  readonly branch: "geometry" | "algebra" | "numbers" | "statistics" | "analytic_geometry" | "trigonometry";
  readonly raw: string;
}

export const NOTEBOOKLM_REAL_AND_SYNTHETIC_MATH_LINES: readonly MathFixtureLine[] = [
  // ===== حقيقية من درس التمدد =====
  { branch: "geometry", raw: "مفهوم الفكرة: التمدد تحويل هندسي يحول الشكل إلى شكل آخر مشابه له؛ يكون تكبيراً إذا كان معامل التمدد \\\\(k > 1\\\\)، وتصغيراً إذا كان \\\\(0 < k < 1\\\\)، وتطابقاً إذا كان \\\\(k = 1\\\\)." },
  { branch: "geometry", raw: "القاعدة الرياضية: \\\\(k = \\frac{\\text{طول الضلع في الصورة}}{\\text{طول الضلع المناظر في الأصل}}\\\\)؛ إذا كان \\\\(k > 1 \\Rightarrow\\\\) تكبير، وإذا كان \\\\(0 < k < 1 \\Rightarrow\\\\) تصغير." },
  { branch: "geometry", raw: "القاعدة الرياضية: \\\\(k = \\frac{C P'}{C P} = \\frac{\\text{طول الضلع في الصورة}}{\\text{طول الضلع المناظر في الأصل}}\\\\)" },
  { branch: "geometry", raw: "2. نحسب معامل التمدد \\\\(k\\\\) من النسبة بين بعد النقطة الصورة والنقطة الأصل عن المركز \\\\(A\\\\): \\\\(k = \\frac{AD}{AB} = \\frac{3}{9} = \\frac{1}{3}\\\\)." },
  { branch: "geometry", raw: "3. نطبق نسبة معامل التمدد لحساب \\\\(BC\\\\): \\\\(\\frac{DE}{BC} = k \\Rightarrow \\frac{4}{BC} = \\frac{1}{3} \\Rightarrow BC = 4 \\times 3 = 12\\\\) سم." },
  { branch: "geometry", raw: "القاعدة الرياضية: \\\\((x, y) \\xrightarrow{\\text{تمدد }(O, k)} (kx, ky)\\\\)" },
  { branch: "geometry", raw: "القاعدة الرياضية: \\\\(k = \\frac{x'}{x} = \\frac{y'}{y} \\quad \\text{و} \\quad (x, y) = (\\frac{x'}{k}, \\frac{y'}{k})\\\\)" },
  { branch: "geometry", raw: "القاعدة الرياضية: \\\\(\\Delta A'B'C'\\\\) صورة \\\\(\\Delta ABC\\\\) بتمدد \\\\(\\Rightarrow \\overline{A'B'} // \\overline{AB}\\\\) و \\\\(\\overline{B'C'} // \\overline{BC}\\\\) و \\\\(\\overline{A'C'} // \\overline{AC}\\\\)" },
  { branch: "geometry", raw: "2. بالتعويض عن المعامل وطول \\\\(AB\\\\): \\\\(\\frac{A'B'}{6} = 2.5 \\Rightarrow A'B' = 6 \\times 2.5 = 15\\\\) سم." },
  { branch: "geometry", raw: "الناتج النهائي: معامل التمدد \\\\(k = \\frac{1}{3}\\\\)، وطول \\\\(BC = 12\\\\) سم" },
  { branch: "geometry", raw: "نص المسألة: أي من النسب التالية يمكن أن تمثل معامل تمدد لتصغير شكل هندسي؟ (أ) \\\\(120\\%\\\\) (ب) \\\\(\\frac{4}{3}\\\\) (ج) \\\\(75\\%\\\\) (د) \\\\(1.5\\\\)" },
  { branch: "geometry", raw: "2. نحول الخيارات المعطاة إلى أعداد عشرية ومقارنتها بالعدد \\\\(1\\\\): \\\\(120\\% = 1.2 > 1\\\\)، \\\\(\\frac{4}{3} \\approx 1.33 > 1\\\\)، \\\\(75\\% = 0.75 < 1\\\\)، \\\\(1.5 > 1\\\\)." },
  { branch: "geometry", raw: "نص المسألة: [رسم هندسي: المثلث \\\\(\\Delta A'B'C'\\\\) هو صورة المثلث \\\\(\\Delta ABC\\\\) بتمدد مركزه \\\\(C\\\\)، حيث طول الضلع الأصلي \\\\(AB = 10\\\\) سم وطول الضلع الصورة \\\\(A'B' = 4\\\\) سم] إذا كان المثلث \\\\(\\Delta A'B'C'\\\\) صورة المثلث \\\\(\\Delta ABC\\\\) بتمدد مركزه \\\\(C\\\\)، وكان \\\\(AB = 10\\\\) سم و \\\\(A'B' = 4\\\\) سم، فإن معامل التمدد يساوي ........" },
  { branch: "geometry", raw: "في الشكل المقابل، المثلث \\\\(\\Delta ADE\\\\) صورة المثلث \\\\(\\Delta ABC\\\\) بتمدد مركزه \\\\(A\\\\). أوجد معامل التمدد \\\\(k\\\\) ثم احسب طول الضلع \\\\(\\overline{BC}\\\\)." },
  { branch: "algebra", raw: "وكان \\\\(AB = 5\\\\) سم و \\\\(A'B' = 2x + 1\\\\) سم، فإن قيمة \\\\(x = ........\\\\)" },
  { branch: "algebra", raw: "2. نحل المعادلة الجبرية: \\\\(2x + 1 = 15 \\Rightarrow 2x = 14 \\Rightarrow x = 7\\\\)." },
  { branch: "algebra", raw: "2. نستخدم ضرب الطرفين بالوسطين: \\\\(x + 2 = \\frac{12 \\times 2}{3} = 8 \\Rightarrow x = 8 - 2 = 6\\\\)." },
  { branch: "geometry", raw: "2. بما أن المثلث \\\\(\\Delta ABC\\\\) هو صورة المثلث \\\\(\\Delta HDC\\\\) بتمدد مركزه \\\\(C\\\\)، وعليه فإن \\\\(\\overline{AB} // \\overline{DH}\\\\)." },
  { branch: "geometry", raw: "3. نحسب طول \\\\(BC\\\\): \\\\(\\frac{DE}{BC} = k \\Rightarrow \\frac{5.4}{BC} = \\frac{2}{5} \\Rightarrow BC = \\frac{5.4 \\times 5}{2} = 13.5\\\\) سم." },
  { branch: "geometry", raw: "القاعدة الرياضية: الشكل وصورته بتمدد متشابهان $\\Rightarrow m(\\angle A') = m(\\angle A)$, $m(\\angle B') = m(\\angle B)$, $m(\\angle C') = m(\\angle C)$" },
  { branch: "geometry", raw: "نص المسألة: [رسم هندسي: المثلث $\\Delta A'B'C'$ صورة المثلث $\\Delta ABC$ بتمدد مركزه $O$ ومعامله $k = 2$، قياس الزاوية $m(\\angle A) = 50^\\circ$] إذا كان المثلث $\\Delta A'B'C'$ صورة المثلث $\\Delta ABC$ بتمدد مركزه نقطة الأصل ومعامله $k = 2$ وكان $m(\\angle A) = 50^\\circ$، فإن $m(\\angle A') = ........$ (أ) $25^\\circ$ (ب) $50^\\circ$ (ج) $100^\\circ$ (د) $130^\\circ$" },
  { branch: "geometry", raw: "الناتج النهائي: \\\\(120^\\circ\\\\) (الاختيار ب)" },
  { branch: "geometry", raw: "2. في متوازي الأضلاع \\\\(A'B'C'D'\\\\)، الزاويتان المتتاليتان \\\\(\\angle A'\\\\) و \\\\(\\angle B'\\\\) متكاملتان، إذن \\\\(m(\\angle B') = 180^\\circ - 60^\\circ = 120^\\circ\\\\)." },
  { branch: "analytic_geometry", raw: "   - $A(1, 2) \\rightarrow A'(2(1), 2(2)) = A'(2, 4)$" },
  { branch: "analytic_geometry", raw: "   - $A(-4, 4) \\rightarrow A'(\\frac{1}{4} \\times (-4), \\frac{1}{4} \\times 4) = A'(-1, 1)$" },
  { branch: "analytic_geometry", raw: "1. نطبق قاعدة التمدد بتصغير معامله $k = \\frac{1}{4}$: $(x, y) \\rightarrow (\\frac{1}{4} x, \\frac{1}{4} y)$." },
  { branch: "analytic_geometry", raw: "1. نطبق قاعدة التمدد بضرب الإحداثيين في معامل التمدد \\\\(k = 3\\\\): \\\\(A' = (3 \\times (-2), 3 \\times 4)\\\\)." },
  { branch: "geometry", raw: "القاعدة الرياضية: $\\frac{\\text{محيط الصورة}}{\\text{محيط الأصل}} = k \\quad \\text{و} \\quad \\frac{\\text{مساحة الصورة}}{\\text{مساحة الأصل}} = k^2$" },
  { branch: "geometry", raw: "1. نطبق العلاقة بين محيط الصورة ومحيط الأصل: $\\text{محيط الصورة} = k \\times \\text{محيط الأصل}$." },
  { branch: "geometry", raw: "3. نحسب المساحة الجديدة: $\\text{مساحة الصورة} = \\frac{1}{4} \\times 20 = 5$ سم$^2$." },
  { branch: "geometry", raw: "الناتج النهائي: $5$ سم$^2$" },
  { branch: "geometry", raw: "نص المسألة: [رسم هندسي: مستطيل مساحته $20$ سم$^2$ أوجدت صورته بتمدد معامله $k = \\frac{1}{2}$] إذا كانت مساحة مستطيل تساوي $20$ سم$^2$، فإن مساحة صورته تساوي ........ سم$^2$." },
  { branch: "geometry", raw: "تحويل: إذا كان محيط مثلث يساوي $18$ سم، فإن محيط صورته يساوي ........ سم." },
  { branch: "geometry", raw: "القاعدة الرياضية: معامل التمدد العكسي $k' = \\frac{1}{k}$، معامل التمدد المركب المكافئ $k_{\\text{المكافئ}} = k_1 \\times k_2$." },
  { branch: "geometry", raw: "3. نتحقق: $(\\frac{1}{3} \\times 6, \\frac{1}{3} \\times 12) = (2, 4) = A$." },
  { branch: "geometry", raw: "الناتج النهائي: $P'' = (18, -12)$، ومعامل التمدد المكافئ $k = 6$" },
  { branch: "numbers", raw: "القاعدة الرياضية: $k = \\frac{\\text{الطول الظاهري في الصورة}}{\\text{الطول الحقيقي}} \\Rightarrow \\text{الطول الظاهري} = k \\times \\text{الطول الحقيقي}$" },
  { branch: "numbers", raw: "الناتج النهائي: معامل التمدد $k = 15$ (أو نسبة التكبير $15$ مرة)" },
  { branch: "numbers", raw: "   - $\\text{الطول الحقيقي} = 4 \\times 50000 = 200000$ سم $= 2$ كم." },
  { branch: "numbers", raw: "2. نحسب المساحة الحقيقية لقطعة الأرض: $\\text{المساحة الحقيقية} = 2 \\text{ كم} \\times 1.5 \\text{ كم} = 3$ كم$^2$." },
  { branch: "numbers", raw: "بمقياس رسم (معامل تمدد تصغير) يساوي $\\frac{1}{50000}$. احسب المساحة الحقيقية بالكيلومتر المربع ($1$ كم $= 100000$ سم)." },
  { branch: "numbers", raw: "نص المسألة: [رسم هندسي: خريطة جغرافية مرسومة بمقياس رسم $1 : 50000$، أبعاد قطعة أرض مستطيلة عليها هما $3$ سم و $4$ سم]" },
  { branch: "algebra", raw: "[رسم بياني: نقطة $P(-2, 4)$ أُجري لها تمدد أول معامله $k_1 = 3$ ثم تمدد ثانٍ معامله $k_2 = \\frac{1}{2}$ وكلاهما بمركز نقطة الأصل]" },
  { branch: "geometry", raw: "أثبت أن \\\\(\\overline{A'B'} // \\overline{AB}\\\\) وأن \\\\(\\Delta A'B'C' \\sim \\Delta ABC\\\\)." },
  { branch: "geometry", raw: "إذا كان \\\\(\\Delta A'B'C'\\\\) صورة \\\\(\\Delta ABC\\\\) بتمدد معامله \\\\(k = 3\\\\) وكان \\\\(m(\\angle B) = 65^\\circ\\\\)، فإن \\\\(m(\\angle B') = ........\\\\)" },

  // ===== اصطناعية: تشابه/تطابق مضلعات + وحدات + فترات + إحصاء =====
  { branch: "geometry", raw: "إذا كان المضلع ABCD ~ المضلع XYZW فإن محيط الأكبر 80 سم" },
  { branch: "geometry", raw: "المضلع ABCD يشابه المضلع XYZW بنسبة 2 : 3" },
  { branch: "geometry", raw: "المثلثان ABC و DEF متشابهان وفيهما AB = 4 سم" },
  { branch: "geometry", raw: "أثبت أن $\\triangle ABC \\cong \\triangle DEF$ ثم أوجد $BC$ إذا كان $AB = 5$ سم" },
  { branch: "geometry", raw: "طول الضلع سم 8 والارتفاع سم 5" },
  { branch: "geometry", raw: "مساحة المربع $= 16$ cm^2 ومحيطه 16 cm" },
  { branch: "numbers", raw: "تحرك جسم بسرعة 12 م/ث لمدة 5 ثانية فقطع $12 \\times 5 = 60$ م" },
  { branch: "algebra", raw: "مجال الدالة \\\\(f(x) = \\frac{1}{x-2}\\\\) هو \\\\(\\mathbb{R} \\setminus \\{2\\}\\\\)" },
  { branch: "algebra", raw: "الفترة (2, 5] تنتمي إليها \\\\(x\\\\) و $x \\in [-1, 4)$ و $(-\\infty, 3)$" },
  { branch: "algebra", raw: "حل المعادلة: $x^2 - 5x + 6 = 0 \\Rightarrow (x-2)(x-3) = 0 \\Rightarrow x = 2 \\text{ أو } x = 3$" },
  { branch: "algebra", raw: "$$\\frac{x^2 - 4}{x + 2} = \\frac{(x-2)(x+2)}{x + 2} = x - 2, \\quad x \\neq -2$$" },
  { branch: "algebra", raw: "$\\begin{cases} x + y = 5 \\\\ x - y = 1 \\end{cases}$" },
  { branch: "trigonometry", raw: "جا 30° = $\\frac{1}{2}$ ، $\\sin 60^\\circ = \\frac{\\sqrt{3}}{2}$ ، $\\tan 45^\\circ = 1$" },
  { branch: "statistics", raw: "المتوسط الحسابي $\\bar{x} = \\frac{\\sum x_i}{n} = \\frac{2 + 4 + 6 + 8}{4} = 5$ والانحراف المعياري $\\sigma \\approx 2.24$" },
  { branch: "statistics", raw: "احتمال ظهور عدد زوجي عند إلقاء حجر نرد $P(A) = \\frac{3}{6} = \\frac{1}{2} = 50\\%$" },
  { branch: "statistics", raw: "الوسيط = \\\\(\\frac{12 + 14}{2} = 13\\\\) والمنوال = 10 والمدى = 8" },
  { branch: "numbers", raw: "$\\sqrt{49} + \\sqrt[3]{27} = 7 + 3 = 10$ و $\\frac{3}{4} + \\frac{1}{6} = \\frac{11}{12}$" },
  { branch: "numbers", raw: "الناتج: \\$5 \\times 4 = 20\\$ جنيه" },
  { branch: "numbers", raw: "قوة: $2^3 \\times 2^4 = 2^{3+4} = 2^7 = 128$" },
  { branch: "geometry", raw: "حجم الأسطوانة $V = \\pi r^2 h = \\pi \\times 3^2 \\times 10 = 90\\pi$ سم$^3$" },
];
