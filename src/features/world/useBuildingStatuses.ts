import { useMemo } from 'react';
import { buildings, type BuildingDef, type BuildingId } from '@/data/buildings';
import { BADGES, QUESTS, zoneById } from '@/game/content';
import { isZoneUnlocked, levelForXp, questProgress, zoneStars } from '@/game/engine';
import { useGame } from '@/game/store';
import type { Zone } from '@/game/types';
import { useLang, useT } from '@/i18n';
import type { BuildingStatus } from '@/three/buildings/Building';

export interface BuildingInfo {
  def: BuildingDef;
  name: string;
  status: BuildingStatus;
  zone?: Zone;
  stars?: number;
  maxStars?: number;
  bossDefeated?: boolean;
  summary: string;
}

/** Derives lock/progress state for every building from the player's game state. */
export function useBuildingInfo() {
  const t = useT();
  const lang = useLang();
  const game = useGame((s) => s.game);
  const infos = useMemo(() => {
    const map = {} as Record<BuildingId, BuildingInfo>;
    for (const def of buildings) {
      const name = t(def.nameKey);
      if (def.kind === 'zone') {
        const zone = zoneById(def.zoneId);
        if (!zone) continue;
        const locked = !isZoneUnlocked(zone, game.xp);
        const stars = zoneStars(game, zone);
        const maxStars = zone.stages.length * 3;
        const label = locked ? t('common.unlocksAt', { n: zone.requiredLevel }) : `⭐ ${stars}/${maxStars}`;
        map[def.id] = {
          def,
          name,
          zone,
          stars,
          maxStars,
          bossDefeated: Boolean(game.bosses[zone.id]),
          status: { locked, requiredLevel: zone.requiredLevel, progressLabel: label },
          summary: label,
        };
      } else if (def.kind === 'missions') {
        const ready = QUESTS.filter((q) => {
          const p = questProgress(game, q);
          return p.met && !p.claimed;
        }).length;
        const label = ready ? t('world.questsReady', { n: ready }) : t('world.questsNone');
        map[def.id] = { def, name, status: { locked: false, progressLabel: label }, summary: label };
      } else if (def.kind === 'achievements') {
        const label = t('world.badgesSum', { n: Object.keys(game.badges).length, total: BADGES.length });
        map[def.id] = { def, name, status: { locked: false, progressLabel: label }, summary: label };
      } else {
        const label = `${t('common.levelN', { n: levelForXp(game.xp) })} · ${game.xp} XP`;
        map[def.id] = { def, name, status: { locked: false, progressLabel: label }, summary: label };
      }
    }
    return map;
    // `lang` re-labels everything when the language changes.
  }, [game, t, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const statusById = useMemo(() => {
    const out: Partial<Record<BuildingId, BuildingStatus>> = {};
    for (const [id, info] of Object.entries(infos)) out[id as BuildingId] = info.status;
    return out;
  }, [infos]);
  return { infos, statusById, level: levelForXp(game.xp) };
}
