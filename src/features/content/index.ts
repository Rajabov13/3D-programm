import { LocalContentRepository } from './localRepository';
import type { ContentRepository } from './repository';

let repository: LocalContentRepository | null = null;

/** Bundled course content plus any edits made in the admin area (stored in this browser). */
export function getContentRepository(): LocalContentRepository {
  if (!repository) repository = new LocalContentRepository();
  return repository;
}

export type { ContentRepository };
export { LocalContentRepository } from './localRepository';
