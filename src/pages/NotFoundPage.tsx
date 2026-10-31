import { Compass, Map as MapIcon } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useT } from '@/i18n';

export default function NotFoundPage() {
  const t = useT();
  useDocumentTitle(t('common.notFound'));
  return (
    <EmptyState
      className="mx-auto max-w-xl"
      icon={<Compass className="h-10 w-10" />}
      headingLevel="h1"
      title={t('common.notFound')}
      action={
        <ButtonLink to="/map" icon={<MapIcon className="h-4 w-4" />}>
          {t('play.toMap')}
        </ButtonLink>
      }
    />
  );
}
