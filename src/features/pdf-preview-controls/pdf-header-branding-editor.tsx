"use client";

/**
 * @file pdf-header-branding-editor.tsx
 * @description خاصية ذرية مستقلة (Micro-Feature): تحرير عنوان الورقة المطبوعة والزمن المخصص
 * داخل الترويسة المدمجة (42pt).
 */


export interface PDFHeaderBrandingEditorProps {
  readonly documentTitle: string;
  readonly durationText: string;
  readonly onChangeTitle: (title: string) => void;
  readonly onChangeDuration: (duration: string) => void;
}

export default function PDFHeaderBrandingEditor({
  documentTitle,
  durationText,
  onChangeTitle,
  onChangeDuration,
}: PDFHeaderBrandingEditorProps) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={documentTitle}
        onChange={(e) => onChangeTitle(e.target.value)}
        placeholder="عنوان الاختبار أو المذكرة..."
        className="px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white w-52"
      />
      <input
        type="text"
        value={durationText}
        onChange={(e) => onChangeDuration(e.target.value)}
        placeholder="الزمن (مثال: ساعة ونصف)"
        className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white w-32"
      />
    </div>
  );
}
