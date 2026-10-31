import { Flag } from 'lucide-react';
import { ErrorState, InlineAlert, PageLoader } from '@/components/ui/Feedback';
import { PageHeader } from '@/components/ui/Panel';
import { MissionRow } from '@/features/progress/components';
import { requirementProgress } from '@/features/progress/engine';
import { useProgress, useProgressActions } from '@/features/progress/hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { errorMessage } from '@/lib/errors';

export default function MissionsPage() {
  useDocumentTitle('Mission Center');
  const { snapshot, stats, catalog, isLoading, error, refetch } = useProgress();
  const { claimMission } = useProgressActions();
  if (isLoading) return <PageLoader label="Loading missions…" />;
  if (error || !snapshot || !stats || !catalog) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const open = catalog.missions.filter((m) => !snapshot.missions[m.id]);
  const ready = open.filter((m) => requirementProgress(m.requirement, stats).met);
  const active = open.filter((m) => !requirementProgress(m.requirement, stats).met);
  const done = catalog.missions.filter((m) => snapshot.missions[m.id]);

  const row = (m: (typeof catalog.missions)[number]) => (
    <MissionRow
      key={m.id}
      mission={m}
      stats={stats}
      catalog={catalog}
      claimedAt={snapshot.missions[m.id]}
      canClaim
      claiming={claimMission.isPending && claimMission.variables?.missionId === m.id}
      onClaim={() => claimMission.mutate({ missionId: m.id, title: m.title })}
    />
  );

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Mission Center"
        title="Missions"
        description="Objectives that reward real progress. Each reward can be claimed once, after the requirement is met."
      />
      {claimMission.isError && <InlineAlert tone="error" className="mb-6" title="Couldn’t claim mission">{errorMessage(claimMission.error)}</InlineAlert>}
      <div className="space-y-10">
        {ready.length > 0 && (
          <section aria-labelledby="ready-title">
            <h2 id="ready-title" className="mb-3 flex items-center gap-2 text-lg">
              <Flag className="h-4 w-4 text-pink-300" aria-hidden /> Ready to claim
            </h2>
            <div className="space-y-3">{ready.map(row)}</div>
          </section>
        )}
        <section aria-labelledby="active-title">
          <h2 id="active-title" className="mb-3 text-lg">
            In progress
          </h2>
          {active.length ? <div className="space-y-3">{active.map(row)}</div> : <p className="text-sm text-slate-400">No missions in progress.</p>}
        </section>
        {done.length > 0 && (
          <section aria-labelledby="done-title">
            <h2 id="done-title" className="mb-3 text-lg">
              Completed
            </h2>
            <div className="space-y-3">{done.map(row)}</div>
          </section>
        )}
      </div>
    </div>
  );
}
