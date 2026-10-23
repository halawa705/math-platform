-- ============================================================================
-- قاعدة بيانات منصة الرياضيات المتكاملة (Math-eslam - Zero-Error Schema)
-- مصممة بدون قيود ترتيب خارجية (No Foreign-Key Order Lock) لضمان التنفيذ من أول مرة
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.curriculum_tree (
  id TEXT PRIMARY KEY,
  grade_id TEXT NOT NULL,
  grade_name_ar TEXT NOT NULL,
  term_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  unit_title_ar TEXT NOT NULL,
  lesson_title_ar TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  notebooklm_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  grade_id TEXT NOT NULL,
  phone TEXT,
  parent_phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.electronic_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_code TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  grade_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  unit_title_ar TEXT,
  lesson_title_ar TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  pass_percentage INTEGER NOT NULL DEFAULT 50,
  questions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exam_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL,
  student_code TEXT NOT NULL,
  student_name TEXT NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  total_marks NUMERIC NOT NULL DEFAULT 0,
  percentage NUMERIC NOT NULL DEFAULT 0,
  answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  mistakes_summary_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.homework_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_code TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  grade_id TEXT NOT NULL,
  term_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  unit_title_ar TEXT NOT NULL,
  lesson_title_ar TEXT NOT NULL,
  questions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.homework_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id UUID NOT NULL,
  student_code TEXT NOT NULL,
  student_name TEXT NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  total_marks NUMERIC NOT NULL DEFAULT 0,
  percentage NUMERIC NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.drive_archived_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  doc_kind TEXT NOT NULL,
  grade_ar TEXT NOT NULL,
  branch_ar TEXT NOT NULL,
  pages_count INTEGER NOT NULL DEFAULT 1,
  font_used TEXT,
  drive_owner_email TEXT NOT NULL DEFAULT 'overmath.math@gmail.com',
  drive_file_id TEXT,
  drive_view_url TEXT NOT NULL,
  drive_download_url TEXT NOT NULL,
  drive_folder_path_ar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.curriculum_tree (id, grade_id, grade_name_ar, term_id, branch_id, unit_title_ar, lesson_title_ar, order_index)
VALUES ('init_keepalive_row', 'prep_3', 'الصف الثالث الإعدادي', 'term_1', 'algebra', 'الوحدة الأولى: العلاقات والدوال', 'حاصل الضرب الديكارتي', 1)
ON CONFLICT (id) DO NOTHING;
