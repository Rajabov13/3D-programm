import { tx } from '@/i18n';
import type { Badge, Quest, Stage, Zone, ZoneId } from '../types';
import { cssZone } from './css';
import { htmlZone } from './html';
import { jsZone } from './js';
import { pythonZone } from './python';
import { reactZone } from './react';

/** Worlds in display order. */
export const ZONES: Zone[] = [htmlZone, cssZone, pythonZone, jsZone, reactZone];

export const STAGES: Stage[] = ZONES.flatMap((z) => z.stages);

export const zoneById = (id: string | undefined): Zone | undefined => ZONES.find((z) => z.id === id);
export const stageById = (id: string | undefined): Stage | undefined => STAGES.find((s) => s.id === id);
export const zoneOfStage = (stageId: string): Zone | undefined => ZONES.find((z) => z.stages.some((s) => s.id === stageId));

export const TOTAL_STARS = STAGES.length * 3;

export const BADGES: Badge[] = [
  {
    id: 'first',
    icon: 'Sparkles',
    tier: 'bronze',
    xp: 10,
    goal: { type: 'stages', n: 1 },
    title: tx('Birinchi qadam', 'Первый шаг', 'First step'),
    desc: tx('Birinchi bosqichni oʻting', 'Пройди первый этап', 'Clear your first stage'),
  },
  {
    id: 'flawless',
    icon: 'Target',
    tier: 'bronze',
    xp: 10,
    goal: { type: 'perfect', n: 1 },
    title: tx('Benuqson', 'Безупречно', 'Flawless'),
    desc: tx('Bosqichni 3 yulduz bilan oʻting', 'Пройди этап на 3 звезды', 'Get 3 stars on a stage'),
  },
  {
    id: 'stars-15',
    icon: 'Star',
    tier: 'silver',
    xp: 20,
    goal: { type: 'stars', n: 15 },
    title: tx('Yulduz terimchisi', 'Собиратель звёзд', 'Star collector'),
    desc: tx('15 ta yulduz toʻplang', 'Собери 15 звёзд', 'Collect 15 stars'),
  },
  {
    id: 'boss-1',
    icon: 'Swords',
    tier: 'silver',
    xp: 25,
    goal: { type: 'bosses', n: 1 },
    title: tx('Boss ovchisi', 'Охотник на боссов', 'Boss hunter'),
    desc: tx('Birinchi bossni yenging', 'Победи первого босса', 'Defeat your first boss'),
  },
  {
    id: 'explorer',
    icon: 'Compass',
    tier: 'silver',
    xp: 20,
    goal: { type: 'zones', n: 3 },
    title: tx('Sayohatchi', 'Путешественник', 'Explorer'),
    desc: tx('3 ta olamda oʻynang', 'Сыграй в 3 мирах', 'Play in 3 worlds'),
  },
  {
    id: 'master',
    icon: 'Crown',
    tier: 'gold',
    xp: 40,
    goal: { type: 'zonePerfect', n: 1 },
    title: tx('Olam ustasi', 'Мастер мира', 'World master'),
    desc: tx('Bir olamning hamma bosqichida 3 yulduz', 'Все этапы одного мира на 3 звезды', 'Three stars on every stage of a world'),
  },
  {
    id: 'streak-3',
    icon: 'Flame',
    tier: 'gold',
    xp: 30,
    goal: { type: 'streak', n: 3 },
    title: tx('Olovli', 'В ударе', 'On fire'),
    desc: tx('3 kun ketma-ket oʻynang', 'Играй 3 дня подряд', 'Play 3 days in a row'),
  },
  {
    id: 'xp-1000',
    icon: 'Gem',
    tier: 'gold',
    xp: 50,
    goal: { type: 'xp', n: 1000 },
    title: tx('Kilobayt', 'Килобайт', 'Kilobyte'),
    desc: tx('1000 XP toʻplang', 'Набери 1000 XP', 'Earn 1000 XP'),
  },
  {
    id: 'hero',
    icon: 'Trophy',
    tier: 'platinum',
    xp: 100,
    goal: { type: 'bosses', n: 5 },
    title: tx('Kod qahramoni', 'Герой кода', 'Code hero'),
    desc: tx('Barcha bosslarni yenging', 'Победи всех боссов', 'Defeat every boss'),
  },
];

export const QUESTS: Quest[] = [
  { id: 'stages', labelKey: 'quests.levels', goal: { type: 'stages', n: 2 }, xp: 15 },
  { id: 'perfect', labelKey: 'quests.perfect', goal: { type: 'perfect', n: 1 }, xp: 15 },
  { id: 'xp', labelKey: 'quests.xp', goal: { type: 'xp', n: 50 }, xp: 20 },
];

export const ZONE_IDS: ZoneId[] = ZONES.map((z) => z.id);
