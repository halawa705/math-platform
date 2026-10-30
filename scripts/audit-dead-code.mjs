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
