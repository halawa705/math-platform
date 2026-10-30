"use client";

/**
 * @file student-code-login-form.tsx
 * @description خاصية ذرية مستقلة: بوابة دخول وتسجيل الطلاب الذاتية مع خيار «تذكرني».
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 200 سطر).
 */

import { useState, useEffect } from "react";
import {
  IDENTITY_UPDATED_EVENT_NAME,
  loadEnabledGradesSSOT,
  refreshTeacherIdentityFromSupabaseSSOT,
  type RegisteredStudentRecordSSOT,
} from "@/core/ssot/teacher-identity-ssot";
import type { CurriculumGradeNode } from "@/core/ssot/curriculum-hierarchy-ssot";
import {
  attemptNewStudentRegistration,
  attemptStudentOrTeacherLogin,
} from "./student-auth-submission-helper";

interface StudentCodeLoginFormProps {
  readonly onStudentSubmit: (student: RegisteredStudentRecordSSOT) => void;
  readonly onStealthCodeDetected: () => void;
  readonly onDirectTeacherLogin?: () => void;
}

export default function StudentCodeLoginForm({
  onStudentSubmit,
  onStealthCodeDetected,
  onDirectTeacherLogin,
}: StudentCodeLoginFormProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [enabledGrades, setEnabledGrades] = useState<readonly CurriculumGradeNode[]>([]);
  const [codeOrPhone, setCodeOrPhone] = useState("");
  const [passwordPin, setPasswordPin] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fullNameAr, setFullNameAr] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPin, setRegPin] = useState("");
  const [regGradeId, setRegGradeId] = useState("prep-3");
  const [newlyCreatedStudent, setNewlyCreatedStudent] = useState<RegisteredStudentRecordSSOT | null>(null);

  useEffect(() => {
    const syncGrades = () => {
      const grades = loadEnabledGradesSSOT();
      setEnabledGrades(grades);
      if (grades.length > 0) setRegGradeId((prev) => (grades.some((g) => g.id === prev) ? prev : grades[0].id));
    };
    syncGrades();
    void refreshTeacherIdentityFromSupabaseSSOT();
    window.addEventListener(IDENTITY_UPDATED_EVENT_NAME, syncGrades);
    return () => window.removeEventListener(IDENTITY_UPDATED_EVENT_NAME, syncGrades);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const out = await attemptStudentOrTeacherLogin({ codeOrPhone, passwordPin, rememberMe });
    if (out.kind === "teacher") {
      if (onDirectTeacherLogin) onDirectTeacherLogin();
      else onStealthCodeDetected();
      return;
    }
    if (out.kind === "error") {
      setErrorMsg(out.message);
      return;
    }
    onStudentSubmit(out.student);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const out = await attemptNewStudentRegistration({
      fullNameAr, studentPhone: regPhone, passwordPin: regPin, gradeId: regGradeId, rememberMe,
    });
    if (!out.ok) {
      setErrorMsg(out.message);
      return;
    }
    setNewlyCreatedStudent(out.student);
  };

  if (newlyCreatedStudent) {
    return (
      <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 space-y-4 text-center">
        <div className="text-3xl">🎉</div>
        <h3 className="text-base font-black text-emerald-900 dark:text-emerald-200">
          تم إنشاء حسابك بنجاح يا {newlyCreatedStudent.fullNameAr}!
        </h3>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold">الرقم السريع للدخول:</span>
            <span className="font-mono font-black text-base text-indigo-700 dark:text-teal-400">{newlyCreatedStudent.altNumericCode}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold">كود الطالب الرسمي:</span>
            <span className="font-mono font-black text-slate-900 dark:text-white">{newlyCreatedStudent.studentCode}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold">رقم الهاتف المسجل:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{newlyCreatedStudent.studentPhone}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onStudentSubmit(newlyCreatedStudent)}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md cursor-pointer"
        >
          الدخول الآن إلى منصتي التعليمية ⬅
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        {([{ id: "login", label: "🔑 دخول للمنصة" }, { id: "register", label: "📝 تسجيل طالب جديد" }] as const).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setMode(tab.id); setErrorMsg(null); }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              mode === tab.id ? "bg-white dark:bg-slate-800 text-indigo-900 dark:text-teal-300 shadow-xs" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
          {errorMsg}
        </div>
      )}

      {mode === "login" ? (
        <form onSubmit={handleLoginSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الهاتف أو الكود السريع للطالب:</label>
            <input type="text" value={codeOrPhone} onChange={(e) => setCodeOrPhone(e.target.value)} placeholder="مثال: 1001 أو رقم الهاتف 01012345678" className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الرقم السري (اختياري للدخول السريع):</label>
            <input type="password" value={passwordPin} onChange={(e) => setPasswordPin(e.target.value)} placeholder="••••" className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600" />
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none pt-0.5">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded accent-indigo-700 dark:accent-teal-500" />
            <span>تذكرني على هذا الجهاز (عدم طلب الكود في كل مرة)</span>
          </label>
          <button type="submit" className="w-full py-3 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white font-black text-sm shadow-md transition-all cursor-pointer">
            دخول للمنصة التعليمية ⬅
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم الطالب الثلاثي:</label>
            <input type="text" value={fullNameAr} onChange={(e) => setFullNameAr(e.target.value)} placeholder="اكتب اسمك الثلاثي باللغة العربية..." className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الهاتف:</label>
              <input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="010xxxxxxxx" className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الرقم السري الخاص بك:</label>
              <input type="password" value={regPin} onChange={(e) => setRegPin(e.target.value)} placeholder="٤ أرقام أو أكثر" className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الصف الدراسي:</label>
            <select value={regGradeId} onChange={(e) => setRegGradeId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white">
              {enabledGrades.map((g) => (<option key={g.id} value={g.id}>{g.nameArabic}</option>))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded accent-indigo-700 dark:accent-teal-500" />
            <span>تذكرني على هذا الجهاز دائماً</span>
          </label>
          <button type="submit" className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm shadow-md transition-all cursor-pointer">
            إنشاء حسابي واستلام كود الدخول ✨
          </button>
        </form>
      )}
    </div>
  );
}
