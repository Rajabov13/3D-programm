import { NavLink, Outlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { RotateCcw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InlineAlert } from '@/components/ui/Feedback';
import { toast } from '@/components/ui/toast';
import { getContentRepository } from '@/features/content';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/cn';

const TABS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/courses', label: 'Courses & lessons' },
  { to: '/admin/achievements', label: 'Achievements' },
  { to: '/admin/missions', label: 'Missions' },
];

export default function AdminLayout() {
  useDocumentTitle('Administration');
  const queryClient = useQueryClient();
  const repo = getContentRepository();

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1 flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3" aria-hidden /> Administration
          </p>
          <h1 className="text-3xl">Content & platform</h1>
        </div>
        <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw className="h-3.5 w-3.5" />}
            onClick={async () => {
              repo.resetToBundled();
              await queryClient.invalidateQueries();
              toast.info('Content reset to the bundled courses');
            }}
          >
            Reset demo content
        </Button>
      </header>
      <InlineAlert tone="warning" className="mb-6" title="Demo administration">
        This demo version has no backend, so there is no access control here and edits are saved only in this browser. A production deployment must protect
        these operations with server-side authorization.
      </InlineAlert>
      <nav aria-label="Administration sections" className="mb-8 flex gap-1 overflow-x-auto border-b border-white/[0.06] no-scrollbar">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              cn('focus-ring -mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium', isActive ? 'border-cyan-300 text-white' : 'border-transparent text-slate-400 hover:text-slate-200')
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
