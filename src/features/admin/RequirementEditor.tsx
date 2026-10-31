import { Select, TextField } from '@/components/ui/Field';
import type { Catalog, Requirement } from '@/types';

const TYPES: Array<{ value: Requirement['type']; label: string; course?: 'optional' | 'required'; count: boolean }> = [
  { value: 'lessons_completed', label: 'Lessons completed', course: 'optional', count: true },
  { value: 'exercises_completed', label: 'Exercises passed', course: 'optional', count: true },
  { value: 'course_completed', label: 'Course completed', course: 'required', count: false },
  { value: 'perfect_quizzes', label: 'Perfect knowledge checks', count: true },
  { value: 'courses_started', label: 'Courses started', count: true },
  { value: 'streak_days', label: 'Daily streak', count: true },
  { value: 'level', label: 'Level reached', count: true },
  { value: 'xp_total', label: 'Total XP', count: true },
  { value: 'missions_completed', label: 'Missions completed', count: true },
];

export function RequirementEditor({ value, onChange, catalog, label }: { value: Requirement; onChange: (r: Requirement) => void; catalog: Catalog; label: string }) {
  const meta = TYPES.find((t) => t.value === value.type) ?? TYPES[0];
  const courseId = 'courseId' in value ? value.courseId : undefined;
  const count = 'count' in value ? value.count : 1;

  const build = (type: Requirement['type'], next: { courseId?: string; count?: number }): Requirement => {
    const m = TYPES.find((t) => t.value === type)!;
    if (type === 'course_completed') return { type, courseId: next.courseId ?? catalog.courses[0]?.id ?? '' };
    const req = { type, count: Math.max(1, next.count ?? 1) } as Requirement;
    if (m.course === 'optional' && next.courseId) (req as { courseId?: string }).courseId = next.courseId;
    return req;
  };

  return (
    <fieldset className="grid gap-3 rounded-xl border border-white/[0.08] p-4 sm:grid-cols-3">
      <legend className="px-1 text-[13px] font-medium text-slate-200">{label}</legend>
      <Select label="Type" value={value.type} onChange={(e) => onChange(build(e.target.value as Requirement['type'], { courseId, count }))}>
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </Select>
      {meta.count && <TextField label="Target" type="number" min={1} value={count} onChange={(e) => onChange(build(value.type, { courseId, count: Number(e.target.value) }))} />}
      {meta.course && (
        <Select label={meta.course === 'required' ? 'Course' : 'Course (optional)'} value={courseId ?? ''} onChange={(e) => onChange(build(value.type, { courseId: e.target.value || undefined, count }))}>
          {meta.course === 'optional' && <option value="">Any course</option>}
          {catalog.courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
      )}
    </fieldset>
  );
}
