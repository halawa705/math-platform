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
