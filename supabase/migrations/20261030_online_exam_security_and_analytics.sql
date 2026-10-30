-- 1) جداول مفاتيح الإجابات ومحاولات الاختبار وتوسيع جدول التسليمات لتحليلات نقاط القوة والضعف
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

-- 2) تفعيل الحماية على مستوى الصفوف (RLS)
alter table public.exam_answer_keys enable row level security;
alter table public.exam_attempts   enable row level security;
alter table public.electronic_exams enable row level security;
alter table public.exam_submissions enable row level security;

-- 3) سياسات القراءة فقط للمفتاح العام (anon)، والكتابة حصراً عبر الخادم
drop policy if exists "anon_read_exams" on public.electronic_exams;
create policy "anon_read_exams" on public.electronic_exams for select to anon using (true);

drop policy if exists "anon_read_submissions" on public.exam_submissions;
create policy "anon_read_submissions" on public.exam_submissions for select to anon using (true);
