import { QUALITY_PRESETS, useQuality } from './quality';
import { CityCanvas } from './CityCanvas';
import { CityScene } from './CityScene';
import { HeroCamera } from './controls/HeroCamera';

/** Non-interactive cinematic city for the landing page hero. */
export default function HeroScene({ animate, onReady }: { animate: boolean; onReady?: () => void }) {
  const { preset } = useQuality();
  // The landing page stays lighter than the full world: never above "medium".
  const heroPreset = preset.level === 'high' ? { ...QUALITY_PRESETS.medium, shadows: false } : { ...preset, shadows: false };
  return (
    <CityCanvas preset={heroPreset} fov={42} className="!absolute inset-0" label="Animated 3D skyline of Code World">
      <HeroCamera animate={animate} />
      <CityScene preset={heroPreset} animate={animate} interactive={false} onReady={onReady} />
    </CityCanvas>
  );
}
