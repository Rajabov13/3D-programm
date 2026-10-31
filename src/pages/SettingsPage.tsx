import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { SegmentedControl, Select, Switch } from '@/components/ui/Field';
import { InlineAlert } from '@/components/ui/Feedback';
import { PageHeader, Panel } from '@/components/ui/Panel';
import { toast } from '@/components/ui/toast';
import { useSettings, type GraphicsQuality, type MotionPreference } from '@/features/settings/settingsStore';
import { useProgress, useProgressActions } from '@/features/progress/hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { detectTimeZone } from '@/lib/dates';
import { errorMessage } from '@/lib/errors';
import { detectQuality } from '@/three/quality';
import { isWebGLAvailable } from '@/three/webgl';

const GOALS = [20, 50, 100, 150];

function timeZones(): string[] {
  try {
    const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
    return intl.supportedValuesOf?.('timeZone') ?? [detectTimeZone(), 'UTC'];
  } catch {
    return [detectTimeZone(), 'UTC'];
  }
}

export default function SettingsPage() {
  useDocumentTitle('Settings');
  const settings = useSettings();
  const { snapshot } = useProgress();
  const { updateAccountSettings } = useProgressActions();
  const zones = useMemo(timeZones, []);
  const webgl = useMemo(isWebGLAvailable, []);

  const saveAccount = async (patch: { dailyGoalXp?: number; timezone?: string }) => {
    try {
      await updateAccountSettings.mutateAsync(patch);
      toast.success('Learning settings saved');
    } catch (e) {
      toast.error('Couldn’t save settings', errorMessage(e));
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Preferences" title="Settings" description="Graphics, motion, accessibility, editor and learning preferences — all saved on this device." />
      <div className="space-y-6">
        <Panel className="space-y-5 p-6">
          <h2 className="text-base">Graphics</h2>
          {!webgl && <InlineAlert tone="warning">WebGL is unavailable on this device — the world uses the 2D map automatically.</InlineAlert>}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-200">3D quality</p>
            <SegmentedControl<GraphicsQuality>
              label="3D quality"
              value={settings.graphicsQuality}
              onChange={(graphicsQuality) => settings.update({ graphicsQuality })}
              options={[
                { value: 'auto', label: `Auto (${detectQuality()})` },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
                { value: '2d', label: '2D map only' },
              ]}
            />
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Low disables shadows and reflections and lowers resolution. “2D map only” never starts WebGL — best for older devices and long battery life. Resolution
              also adapts automatically when frame rate drops.
            </p>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-slate-200">Motion</p>
            <SegmentedControl<MotionPreference>
              label="Motion"
              value={settings.motion}
              onChange={(motion) => settings.update({ motion })}
              options={[
                { value: 'system', label: 'Follow system' },
                { value: 'reduce', label: 'Reduce motion' },
                { value: 'full', label: 'Full motion' },
              ]}
            />
            <p className="mt-2 text-xs text-slate-500">Reduced motion stops ambient animation and makes camera transitions instant.</p>
          </div>
        </Panel>

        <Panel className="space-y-5 p-6">
          <h2 className="text-base">Explore-mode controls</h2>
          <div>
            <label htmlFor="sensitivity" className="mb-2 block text-sm font-medium text-slate-200">
              Look sensitivity: {settings.lookSensitivity.toFixed(1)}×
            </label>
            <input
              id="sensitivity"
              type="range"
              min={0.3}
              max={2.5}
              step={0.1}
              value={settings.lookSensitivity}
              onChange={(e) => settings.update({ lookSensitivity: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>
          <Switch checked={settings.invertLookY} onChange={(invertLookY) => settings.update({ invertLookY })} label="Invert vertical look" />
          <Button variant="ghost" size="sm" onClick={() => settings.update({ hasSeenWorldIntro: false })}>
            Show the world introduction again
          </Button>
        </Panel>

        <Panel className="space-y-5 p-6">
          <h2 className="text-base">Code editor</h2>
          <Select label="Font size" value={settings.editorFontSize} onChange={(e) => settings.update({ editorFontSize: Number(e.target.value) })}>
            {[12, 13, 14, 15, 16, 18, 20, 22].map((n) => (
              <option key={n} value={n}>
                {n}px
              </option>
            ))}
          </Select>
          <Switch checked={settings.editorWordWrap} onChange={(editorWordWrap) => settings.update({ editorWordWrap })} label="Wrap long lines" />
          <Switch checked={settings.editorMinimap} onChange={(editorMinimap) => settings.update({ editorMinimap })} label="Show minimap" />
        </Panel>

        <Panel className="space-y-5 p-6">
          <h2 className="text-base">Learning</h2>
          <>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-200">Daily XP goal</p>
                <SegmentedControl<string>
                  label="Daily XP goal"
                  value={String(snapshot?.dailyGoalXp ?? 50)}
                  onChange={(v) => void saveAccount({ dailyGoalXp: Number(v) })}
                  options={GOALS.map((g) => ({ value: String(g), label: `${g} XP` }))}
                />
                <p className="mt-2 text-xs text-slate-500">Reaching your goal earns a +10 XP bonus once per day and keeps your streak alive.</p>
              </div>
              <Select
                label="Time zone"
                hint="Used to decide when your day (and streak) starts."
                value={snapshot?.timezone ?? 'UTC'}
                onChange={(e) => void saveAccount({ timezone: e.target.value })}
              >
                {zones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-slate-500">Learning settings are stored in this browser.</p>
          </>
        </Panel>

        <Button variant="ghost" onClick={() => settings.reset()}>
          Restore default device settings
        </Button>
      </div>
    </div>
  );
}
