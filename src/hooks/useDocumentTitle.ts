import { useEffect } from 'react';

export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = `${title} · 3D Code World`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
