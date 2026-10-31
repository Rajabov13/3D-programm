import { useMemo } from 'react';
import { buildings, type BuildingDef } from '@/data/buildings';
import { courseProgress, isCourseUnlocked, levelForXp, requirementProgress } from '@/features/progress/engine';
import { useProgress } from '@/features/progress/hooks';
import type { BuildingId, Course } from '@/types';
import type { BuildingStatus } from '@/three/buildings/Building';

export interface BuildingInfo {
  def: BuildingDef;
  status: BuildingStatus;
  course?: Course;
  completed?: number;
  total?: number;
  unavailable?: boolean;
  summary: string;
}

/** Derives lock/progress state for every building from the catalog and the learner's progress. */
export function useBuildingInfo() {
  const { snapshot, stats, catalog, isLoading } = useProgress();
  const infos = useMemo(() => {
    const level = snapshot ? levelForXp(snapshot.xp) : 1;
    const map = {} as Record<BuildingId, BuildingInfo>;
    for (const def of buildings) {
      if (def.kind === 'course') {
        const course = catalog?.courses.find((c) => c.id === def.courseId);
        if (!course) {
          map[def.id] = { def, status: { locked: true }, unavailable: true, summary: 'Not available yet' };
          continue;
        }
        const locked = !isCourseUnlocked(course, level);
        const prog = snapshot && catalog ? courseProgress(catalog, snapshot, course.id) : { completed: 0, total: 0 };
        map[def.id] = {
          def,
          course,
          completed: prog.completed,
          total: prog.total,
          status: { locked, requiredLevel: course.requiredLevel, progressLabel: `${prog.completed}/${prog.total} lessons complete` },
          summary: locked ? `Unlocks at level ${course.requiredLevel}` : `${prog.completed}/${prog.total} lessons complete`,
        };
      } else if (def.kind === 'missions') {
        const ready =
          stats && catalog && snapshot
            ? catalog.missions.filter((m) => !snapshot.missions[m.id] && requirementProgress(m.requirement, stats).met).length
            : 0;
        const label = ready ? `${ready} mission${ready === 1 ? '' : 's'} ready to claim` : 'Browse active missions';
        map[def.id] = { def, status: { locked: false, progressLabel: label }, summary: label };
      } else if (def.kind === 'achievements') {
        const earned = snapshot ? Object.keys(snapshot.achievements).length : 0;
        const label = `${earned}/${catalog?.achievements.length ?? 0} badges earned`;
        map[def.id] = { def, status: { locked: false, progressLabel: label }, summary: label };
      } else {
        const label = snapshot ? `Level ${level} · ${snapshot.xp.toLocaleString()} XP` : 'Your stats';
        map[def.id] = { def, status: { locked: false, progressLabel: label }, summary: label };
      }
    }
    return map;
  }, [snapshot, stats, catalog]);
  const statusById = useMemo(() => {
    const out: Partial<Record<BuildingId, BuildingStatus>> = {};
    for (const [id, info] of Object.entries(infos)) out[id as BuildingId] = info.status;
    return out;
  }, [infos]);
  return { infos, statusById, isLoading, level: snapshot ? levelForXp(snapshot.xp) : 1, catalog };
}
