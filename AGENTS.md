# Supreme AI Agent Constitution (Math Platform)

> [!CAUTION]
> **ABSOLUTE, UNBYPASSABLE MANDATE FOR EVERY AI AGENT:**
> This document is the supreme law and exclusive architectural authority for this project (`Math Platform`). You MUST read and strictly obey every single clause herein before touching any file or writing a single line of code. Violating any clause of this Constitution constitutes a total failure of the mission.
> **CRITICAL EXECUTION RULE:** NEVER start writing or modifying application code immediately upon receiving a request. You MUST strictly follow the **4-Phase Plan-Execute-Remind-Eradicate Protocol** defined in Section 3.

---

## 1. Project Identity & Scope Invariants

1. **Single-Subject Exclusivity (100% Mathematics Only):**
   - This platform is dedicated **exclusively to Mathematics** across its eleven canonical branches:
     1. Numbers & Operations (`numbers`)
     2. Algebra & Intervals (`algebra`)
     3. Functions & Analysis (`functions`)
     4. Trigonometry (`trigonometry`)
     5. Plane & Euclidean Geometry (`plane_geometry`)
     6. Analytic & Coordinate Geometry (`analytic_geometry`)
     7. Solid & 3D Geometry (`solid_geometry`)
     8. Statistics & Probability (`statistics_probability`)
     9. Calculus (`calculus`)
     10. Statics (`statics`)
     11. Dynamics (`dynamics`)
   - **STRICTLY FORBIDDEN:** Adding any code, conditionals, or options related to any subject other than Mathematics.

2. **Single-Owner Teacher & Students Architecture:**
   - There is NO multi-teacher tenancy and NO complex `Super Admin` panel. There is **exactly one owner-teacher** and **students** who watch video lectures, study booklets, solve homework drills, and take live electronic exams.
   - **Unified Login with Stealth Teacher Access:**
     * There is **only ONE login page** across the entire application (`src/app/login/page.tsx`).
     * The publicly visible interface is the simple Student Login form (Student Code or Phone Number).
     * The Owner-Teacher authenticates from the **exact same page** via a **hidden stealth trigger (`Stealth Trigger`)** completely invisible to students (e.g., 5 rapid taps on the summation symbol logo $\sum$ or typing a secret teacher prefix into the code field), which reveals the Owner-Teacher's secret password input.
     * **STRICTLY FORBIDDEN:** Creating separate login pages for students and the teacher.

3. **The 5 Platform Pillars:**
   - The project tree is engineered to accommodate present and future capabilities without structural refactoring:
     1. **Generation & Print Studio:** Lesson booklets, official exams, final/monthly reviews, and worksheets.
     2. **Video Lectures Hub:** Protected video player linked to every lesson and mathematical idea.
     3. **Homework & Drills Hub:** Interactive and printable homework linked to lessons and videos with automated grading.
     4. **Live Electronic Exams:** Timed online assessments with a virtual mathematical keypad and instant grading.
     5. **Parametric Geometry & Stats Engine:** Deterministic vector SVG engine for textbook and external exam figures.

---

## 2. Atomic File & Unique Naming Law

> [!IMPORTANT]
> **THE GOLDEN RULE TO PREVENT CODE BLOAT AND GUARANTEE EFFORTLESS FUTURE EDITS:**
> **"Every Micro-Feature = Its Own Dedicated Atomic File with a Globally Unique Filename Across the Entire Repository."**

1. **Strict Atomic Separation (`One Micro-Feature = One File`):**
   - **STRICTLY FORBIDDEN:** Combining two micro-features or two UI controls inside a single file, even if each feature is only 20 lines of code!
   - **Mandatory Applied Example (PDF Preview & Print Controls):**
     * Switching between Western (`0-9`) and Eastern (`٠-٩`) numerals $\rightarrow$ dedicated atomic file: `pdf-numeral-system-switch.tsx`.
     * Changing font family (`Cairo`, `Almarai`, etc.) $\rightarrow$ dedicated atomic file: `pdf-font-family-selector.tsx`.
     * Changing answer visibility mode (Questions Only / Questions with Answers / Answer Key Only) $\rightarrow$ dedicated atomic file: `pdf-answer-visibility-mode.tsx`.
     * Controlling exact point font size (`12pt`, `13pt`, `14pt`, `15pt`) $\rightarrow$ dedicated atomic file: `pdf-exact-fontsize-control.tsx`.
     * Controlling page density and column layout $\rightarrow$ dedicated atomic files: `pdf-density-budget-selector.tsx` and `pdf-columns-layout-toggle.tsx`.
     * Editing page header and teacher branding $\rightarrow$ dedicated atomic file: `pdf-header-branding-editor.tsx`.
     * All atomic control files are orchestrated via a single coordinator (`pdf-preview-orchestrator.tsx`) bound to the Single Source of Truth (`pdf-print-settings-ssot.ts`).
   - With this architecture, whenever the Owner requests modifying, removing, or adding a micro-feature, the AI agent opens a single small file (30–80 lines) and updates it in seconds with **zero side effects** and **minimal token consumption**.

2. **Global Unique Filename Invariant:**
   - **STRICTLY FORBIDDEN:** Using generic or repeated filenames anywhere in the repository, such as: `index.ts`, `types.ts`, `utils.ts`, `helpers.ts`, `styles.ts`, `actions.ts`, `modal.tsx`, `card.tsx`.
   - Every file in the project MUST have a **globally unique 3-to-5-word descriptive filename** that precisely states its responsibility and never collides with any other filename in any other directory.

3. **Hard Line Limit (`Max 300 Lines per File`):**
   - No file in the repository may exceed **300 lines of code** (with an absolute emergency ceiling of 350 lines). Any file approaching or exceeding this limit MUST be decomposed immediately into atomic sub-files.

---

## 3. Mandatory 4-Phase Execution, Human Review & Legacy Eradication Protocol

> [!CAUTION]
> **UNBYPASSABLE LIFECYCLE FOR EVERY FEATURE, REDESIGN, OR REFACTORING REQUEST:**
> You are **STRICTLY FORBIDDEN** from jumping straight into writing or editing application code. Every task MUST pass sequentially through the following four mandatory phases:

### Phase 1: Deep Codebase Study & Comprehensive Engineering Plan First (`Study & Plan Before Any Code`)
1. **Search & Inspect First (`Search-Read-Verify`):**
   - Search the project tree first to locate all existing atomic files and SSOT modules related to the request.
   - Read the actual target files thoroughly to understand their exact data contracts, props, callers, and rendering flow.
2. **Produce a Complete Architectural Plan Before Coding:**
   - Before writing or modifying any application code, you MUST present a complete, concrete engineering plan resulting from your real study of the codebase.
   - The plan MUST explicitly list:
     * Every file to be created or modified and its exact responsibility.
     * Every legacy/old file, function, branch, or style block that will be superseded by the new design and is scheduled for deletion after human review.
     * How existing architecture and unrelated features are preserved intact.
   - **STOP and wait for user approval of the plan** (unless the user has already approved the plan in the current turn).

### Phase 2: Atomic Implementation & Strict Type Verification (`Build & Verify`)
1. **Inspect Before Edit:**
   - If the dedicated file exists as a stub, implement inside it directly without creating duplicate files.
   - If creating a new micro-feature, isolate it in a new atomic file with a globally unique name (`<= 300 lines`).
2. **Real Verification (`Zero Hallucination`):**
   - Run `npx tsc --noEmit` and relevant `vitest` suites to verify zero compilation or regression errors. Never claim a build or test passed without actually executing the command.

### Phase 3: Mandatory Continuous Reminder of Pending Legacy Code Deletion (`Persistent Deletion Reminder Gate`)
1. **Do NOT Leave Old Code Forgotten:**
   - When a new design or system is built and presented for **Human Review**, you MUST explicitly and prominently remind the user in **every single response** that:
     > ⚠️ **REMINDER — PENDING LEGACY CLEANUP STEP:** The old/superseded code and files (`[list exact file/function names]`) are still pending final deletion and will be completely eradicated immediately upon your human review confirmation.
2. **Continuous Tracking:**
   - You MUST keep repeating this reminder across turns until the human review is confirmed and the legacy deletion step is executed.

### Phase 4: Total Legacy Eradication After Human Confirmation (`Zero Orphan / Dead Code Law`)
1. **Complete Removal Upon Confirmation:**
   - Once the user confirms after human review that the new system/design is approved, you MUST immediately delete 100% of the replaced legacy code, unused branches, dead functions, and orphaned files.
   - **STRICTLY FORBIDDEN:** Leaving a single unused line of code, commented-out legacy block, unused prop, or orphaned file anywhere in the repository.
2. **Safe Deletion Verification:**
   - Before and after deleting any file, function, or symbol, verify across the entire repository (`grep` + `npx tsc --noEmit` + `vitest`) that zero active references remain and no other feature is broken.
3. **Mandatory Cloud Git Push (`Mandatory Git Push Law`):**
   - After every verified code change or legacy cleanup (`npx tsc --noEmit`), you MUST immediately execute `git add`, `git commit`, and `git push origin main` without waiting for the user to ask, ensuring live deployment synchronization at all times.

---

## 4. Single Sources of Truth Hierarchy (`src/core/ssot/`)

Defining any shared state or reference data in more than one place is **STRICTLY FORBIDDEN**. All components and engines MUST derive their truth exclusively from **`src/core/ssot/`**:

| SSOT File | Exclusive Platform Responsibility | Dependents |
|---|---|---|
| `curriculum-hierarchy-ssot.ts` | NotebookLM curriculum-splitting prompt + parser building the hierarchy (`Grades` $\rightarrow$ `11 Branches` $\rightarrow$ `Units` $\rightarrow$ `Lessons`). | All pages, prompt builders, question banks, booklets, videos, and homework. |
| `theme-mode-ssot.ts` | Unified color mode state (Light `Ivory` / Dark `Obsidian`) and toggle control. | All pages, tabs, and modals. |
| `math-branches-ssot.ts` | Definitions of the 11 Mathematics branches, icons, colors, and semantic properties. | Context ribbon, curriculum explorer, filters, and prompt builders. |
| `numeral-and-unit-ssot.ts` | Unified conversion for numerals (`0-9` / `٠-٩`), notation variables (`x,y` / `س,ص`), and Arabic measurement units (`سم`, `سم²`, `درجة`, `نيوتن`...). | All math renderers, PDF preview, and online exams. |
| `teacher-identity-ssot.ts` | Owner-Teacher profile (name, title, phone, platform name, watermark, stealth login configuration). | PDF headers/footers, unified login page, and student certificates. |
| `pdf-print-settings-ssot.ts` | Unified contract for PDF print settings (selected font, exact size `12pt-16pt`, numerals, answer visibility, density, columns, paper template). | All atomic PDF preview and print control files. |
| `geometry-archetype-ssot.ts` | Central registry of canonical geometric families (Triangle, Circle, Quadrilateral, Solids, Coordinate Plane) and their resolvers. | Natural Arabic geometry matcher, SVG projector, and Geometry Lab. |
| `statistics-archetype-ssot.ts` | Central registry of statistical tables and charts (Histogram, Polygon/Curve, Pie Chart, Box Plot, Scatter). | Statistical data parser and chart renderer. |

---

## 5. Unbreakable Mathematical & Print Invariants

1. **Zero-DSL Policy in AI Prompts:**
   - The LLM (NotebookLM) NEVER outputs `[GEOMETRY: ...]` DSL tags, SVG code, HTML, or CSS.
   - Geometric and statistical figures are described strictly in clear natural Arabic: `[رسم هندسي: مثلث أ ب جـ قائم في ب، د منتصف أ ب، هـ منتصف أ جـ]`, and `geometry-archetype-ssot` deterministically infers and renders them as pure Vector SVG.
2. **A4 PDF Sheet Invariants:**
   - Printed sheet background is ALWAYS pure white (`#ffffff !important`).
   - Minimum body font size for printed questions is **`12pt`** (`fontSizePt >= 12` in standard manual selection), with fine-grained control (`12pt`, `12.5pt`, `13pt`, `14pt`, `15pt`, `16pt`) via the dedicated atomic control.
   - Approved print fonts: **`Almarai`**, **`Cairo`**, **`IBM Plex Sans Arabic`**, **`Readex Pro`**, and **`Tajawal`**.
   - Measurement units MUST be written in Arabic and placed after the number (`5 سم`, never `سم 5`).
3. **Zero AI Branding:**
   - Never mention "AI" or "Artificial Intelligence" in student-facing UIs or printed documents. All outputs are presented as official educational materials authored by the Owner-Teacher.
4. **Tech Stack Standard:**
   - **Language:** `TypeScript 5+` in strict mode (`strict: true` — zero `any`).
   - **Framework:** `Next.js (App Router)` + `React 19` + `Tailwind CSS`.
   - **Math & Graphics:** `KaTeX` (with `BiDi` isolation) + `Pure Deterministic SVG` for geometry and statistics.
   - **Automated Testing:** `Vitest` for unit and regression tests prior to every commit.

---

## 6. 99% Mobile-First Mandatory Invariant

> [!CAUTION]
> **GOVERNING DESIGN REALITY:**
> **99% of platform users (students and the teacher on the go) access the platform via mobile phone screens (`360px - 430px`).**
> Building any screen, tab, control, or PDF preview that assumes a wide desktop monitor is **STRICTLY FORBIDDEN**.

1. **Mobile-First Responsive Design:**
   - Every component MUST be designed and tested for a `360px` viewport first, scaling up progressively via `sm:`, `md:`, and `lg:`.
   - Unintended horizontal page scrolling is strictly forbidden (`overflow-x-hidden` is mandatory on the root container).
2. **Thumb-Friendly Bottom Dock:**
   - On mobile viewports, a fixed glassmorphic bottom navigation bar provides one-thumb switching across the main hubs, with every interactive touch target having a minimum height of **`44px`**.
3. **Swipeable Pill Bars:**
   - All segmented tabs and PDF toolbars MUST use smooth horizontal touch-scrolling pill bars (`overflow-x-auto no-scrollbar whitespace-nowrap`) without vertical stacking that consumes screen height.
4. **Mobile A4 Auto-Scale Engine:**
   - An A4 sheet has a natural width of `210mm` ($\approx 794\text{px}$). On mobile screens, the preview engine automatically computes the proportional scale factor (`scale = (window.innerWidth - 24) / 794`) so the full A4 sheet fits the mobile viewport cleanly without horizontal clipping, while printing at 100% full vector `210mm × 297mm` dimensions.
5. **Mobile Studio Mode Switcher:**
   - On mobile screens, the Generation Studio provides instant one-tap floating switching between `[⚙️ Builder & Setup]` and `[📄 A4 Sheet Preview]`.

---

## 7. Mandatory Stop-and-Advise Partner Gate (Unbypassable)

> [!WARNING]
> **CRITICAL CONSTITUTIONAL CLAUSE — NEVER BYPASS UNDER ANY CIRCUMSTANCE:**
> The AI agent is a senior architectural partner and advisor to the Platform Owner, NOT a blind order-taker executing instructions silently.

1. **Mandatory Stop on Risks or Superior Alternatives (`Stop, Warn & Propose Before Coding`):**
   - Whenever the user requests something that entails **technical or architectural risks**, could **degrade or break an existing feature**, creates **security/performance/UX issues**, or when the agent sees a **significantly smarter engineering approach** to achieve the user's goal:
     - **STRICTLY FORBIDDEN:** Executing the risky or suboptimal request immediately.
     - You MUST **STOP immediately**, clearly and honestly explain the exact risks and system impact.
     - You MUST present the **superior engineering alternative** (*"Instead of doing X which causes Y, let us implement it via Z so you achieve your exact goal with zero regressions"*).
     - You MUST **request explicit user confirmation** before writing or modifying code.
2. **Zero Silent Execution on Risky Requests:**
   - Silently executing a command that introduces an architectural flaw or breaks another feature without warning the user and obtaining confirmation first is a severe violation of this Constitution.

---

## 8. Absolute Honesty, Conciseness & Zero-Embellishment Mandate (Unbypassable)

> [!CAUTION]
> **STRICT TRUTHFULNESS LAW (`عدم الكذب أو التجميل نهائياً`):**
> Every response to the Platform Owner MUST be concise, direct, and grounded **100% in real, verified facts and measured outputs**.

1. **Zero Lying, Zero Fabrication, Zero Sugarcoating:**
   - **STRICTLY FORBIDDEN:** Guessing, inventing, exaggerating, softening failures, or claiming a file, symbol, figure, build, or test worked when it was not directly verified in tool output during the current session.
   - Report exact counts, exact failures, exact diagnostics, and honest gaps plainly—without promotional fluff or defensive rationalization.
2. **Concise Signal Only:**
   - Keep every reply brief and high-signal, presenting real evidence cleanly.



<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
