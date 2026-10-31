import { Compass } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Not found');
  return (
    <EmptyState
      className="mx-auto max-w-xl"
      icon={<Compass className="h-8 w-8" />}
      headingLevel="h1"
        title="This street isn’t on the map"
      description="The page you’re looking for doesn’t exist or was moved."
      action={
        <div className="flex gap-2">
          <ButtonLink to="/dashboard">Dashboard</ButtonLink>
          <ButtonLink to="/world" variant="secondary">Open the world map</ButtonLink>
        </div>
      }
    />
  );
}
