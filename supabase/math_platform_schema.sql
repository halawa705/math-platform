-- ============================================================================
-- قاعدة بيانات منصة الفارس للرياضيات (Math-eslam - Production Schema + RLS)
-- تشمل:
-- ١. جداول المزامنة السحابية للهوية والمنهج (platform_ssot_state, curriculum_units)
-- ٢. جداول الطلاب والاختبارات الإلكترونية بالمؤقت والتسليمات الفورية عبر الأجهزة
-- ٣. سياسات أمان الصفوف (Row-Level Security - RLS) لحماية البيانات مع المفتاح العام
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.platform_ssot_state (
  id TEXT PRIMARY KEY DEFAULT 'owner_ssot',
  identity_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.curriculum_units (
  id TEXT PRIMARY KEY,
  grade_id TEXT NOT NULL,
  term_number INTEGER NOT NULL DEFAULT 1,
  branch_id TEXT NOT NULL,
  branch_name_ar TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  lessons_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  alt_numeric_code TEXT,
  full_name TEXT NOT NULL,
  grade_id TEXT NOT NULL,
  grade_name_ar TEXT,
  phone TEXT,
  pin_code TEXT,
  parent_phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS alt_numeric_code TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS grade_name_ar TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS pin_code TEXT;

CREATE TABLE IF NOT EXISTS public.electronic_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_code TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  grade_id TEXT NOT NULL,
  grade_name_ar TEXT,
  branch_id TEXT NOT NULL DEFAULT 'general',
  unit_title_ar TEXT,
  lesson_title_ar TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  availability_days INTEGER NOT NULL DEFAULT 7,
  expires_at TIMESTAMPTZ,
  pass_percentage INTEGER NOT NULL DEFAULT 70,
  questions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.electronic_exams ADD COLUMN IF NOT EXISTS grade_name_ar TEXT;
ALTER TABLE public.electronic_exams ADD COLUMN IF NOT EXISTS availability_days INTEGER NOT NULL DEFAULT 7;
ALTER TABLE public.electronic_exams ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.electronic_exams ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

CREATE TABLE IF NOT EXISTS public.exam_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_code TEXT UNIQUE,
  exam_id UUID,
  exam_code TEXT,
  exam_title_ar TEXT,
  grade_id TEXT,
  student_code TEXT NOT NULL,
  student_name TEXT NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  total_marks NUMERIC NOT NULL DEFAULT 0,
  percentage NUMERIC NOT NULL DEFAULT 0,
  is_reviewed_by_teacher BOOLEAN NOT NULL DEFAULT FALSE,
  answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  mistakes_summary_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.exam_submissions ALTER COLUMN exam_id DROP NOT NULL;
ALTER TABLE public.exam_submissions ADD COLUMN IF NOT EXISTS submission_code TEXT UNIQUE;
ALTER TABLE public.exam_submissions ADD COLUMN IF NOT EXISTS exam_code TEXT;
ALTER TABLE public.exam_submissions ADD COLUMN IF NOT EXISTS exam_title_ar TEXT;
ALTER TABLE public.exam_submissions ADD COLUMN IF NOT EXISTS grade_id TEXT;
ALTER TABLE public.exam_submissions ADD COLUMN IF NOT EXISTS is_reviewed_by_teacher BOOLEAN NOT NULL DEFAULT FALSE;

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

-- ============================================================================
-- سياسات أمان الصفوف (Row-Level Security - RLS)
-- تتيح القراءة والإضافة والتحديث الآمن عبر الأجهزة، وتمنع الحذف العشوائي
-- ============================================================================

ALTER TABLE public.platform_ssot_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_tree ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.electronic_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drive_archived_documents ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO anon, authenticated;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'platform_ssot_state',
    'curriculum_units',
    'curriculum_tree',
    'students',
    'electronic_exams',
    'exam_submissions',
    'homework_assignments',
    'homework_submissions',
    'drive_archived_documents'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS allow_public_select ON public.%I', tbl);
    EXECUTE format('CREATE POLICY allow_public_select ON public.%I FOR SELECT TO anon, authenticated USING (true)', tbl);

    EXECUTE format('DROP POLICY IF EXISTS allow_public_insert ON public.%I', tbl);
    EXECUTE format('CREATE POLICY allow_public_insert ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)', tbl);

    EXECUTE format('DROP POLICY IF EXISTS allow_public_update ON public.%I', tbl);
    EXECUTE format('CREATE POLICY allow_public_update ON public.%I FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true)', tbl);
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
