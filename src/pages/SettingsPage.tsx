import { useMemo, type ReactNode } from 'react';
import { Code2, Gamepad2, Languages, MonitorCog, Moon, Palette, Smartphone, Sun, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SegmentedControl, Select, Switch } from '@/components/ui/Field';
import { InlineAlert } from '@/components/ui/Feedback';
import { useSettings, type GraphicsQuality, type MotionPreference, type ThemePreference } from '@/features/settings/settingsStore';
import { sfx } from '@/game/sound';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { LANGS, useLangStore, useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { detectQuality } from '@/three/quality';
import { isWebGLAvailable } from '@/three/webgl';

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="glass space-y-5 rounded-3xl p-6">
      <h2 className="flex items-center gap-2.5 text-lg">
        <span className="text-cyan-300">{icon}</span> {title}
      </h2>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const t = useT();
  const settings = useSettings();
  const { lang, setLang } = useLangStore();
  const webgl = useMemo(isWebGLAvailable, []);
  useDocumentTitle(t('settings.title'));

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-3xl">{t('settings.title')}</h1>

      <Section icon={<Languages className="h-5 w-5" />} title={t('common.language')}>
        <div role="radiogroup" aria-label={t('common.language')} className="grid grid-cols-3 gap-2">
          {LANGS.map((l) => (
            <button
              key={l.id}
              type="button"
              role="radio"
              aria-checked={lang === l.id}
              lang={l.id}
              onClick={() => setLang(l.id)}
              className={cn(
                'focus-ring rounded-2xl border-2 px-3 py-3 text-center font-semibold transition-colors',
                lang === l.id ? 'border-primary bg-primary/10 text-white' : 'border-white/10 text-slate-400 hover:border-white/25 hover:text-white',
              )}
            >
              <span className="block text-xs font-black tracking-widest text-cyan-300">{l.short}</span>
              {l.label}
            </button>
          ))}
        </div>
      </Section>

      <Section icon={<Palette className="h-5 w-5" />} title={t('settings.theme')}>
        <div role="radiogroup" aria-label={t('settings.theme')} className="grid grid-cols-3 gap-2">
          {(
            [
              ['light', Sun, 'settings.t.light'],
              ['dark', Moon, 'settings.t.dark'],
              ['system', Smartphone, 'settings.t.system'],
            ] as const
          ).map(([value, Icon, key]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={settings.theme === value}
              onClick={() => settings.update({ theme: value as ThemePreference })}
              className={cn(
                'focus-ring flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-3 text-center text-sm font-semibold transition-colors',
                settings.theme === value ? 'border-primary bg-primary/10 text-white' : 'border-white/10 text-slate-400 hover:border-white/25 hover:text-white',
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {t(key)}
            </button>
          ))}
        </div>
      </Section>

      <Section icon={<Volume2 className="h-5 w-5" />} title={t('settings.sound')}>
        <Switch
          checked={settings.sound}
          onChange={(sound) => {
            settings.update({ sound });
            if (sound) sfx.correct();
          }}
          label={t('settings.sound')}
        />
      </Section>

      <Section icon={<MonitorCog className="h-5 w-5" />} title={t('settings.graphics')}>
        {!webgl && <InlineAlert tone="warning">{t('world.noWebgl')}</InlineAlert>}
        <SegmentedControl<GraphicsQuality>
          label={t('settings.graphics')}
          value={settings.graphicsQuality}
          onChange={(graphicsQuality) => settings.update({ graphicsQuality })}
          options={[
            { value: 'auto', label: `${t('settings.q.auto')} (${t(`settings.q.${detectQuality()}`)})` },
            { value: 'high', label: t('settings.q.high') },
            { value: 'medium', label: t('settings.q.medium') },
            { value: 'low', label: t('settings.q.low') },
            { value: '2d', label: t('settings.q.2d') },
          ]}
        />
        <div>
          <p className="mb-2 text-sm font-medium text-slate-200">{t('settings.motion')}</p>
          <SegmentedControl<MotionPreference>
            label={t('settings.motion')}
            value={settings.motion}
            onChange={(motion) => settings.update({ motion })}
            options={[
              { value: 'system', label: t('settings.m.system') },
              { value: 'reduce', label: t('settings.m.reduce') },
              { value: 'full', label: t('settings.m.full') },
            ]}
          />
        </div>
      </Section>

      <Section icon={<Gamepad2 className="h-5 w-5" />} title={t('world.title')}>
        <div>
          <label htmlFor="sensitivity" className="mb-2 block text-sm font-medium text-slate-200">
            {t('settings.sensitivity')}: {settings.lookSensitivity.toFixed(1)}×
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
        <Switch checked={settings.invertLookY} onChange={(invertLookY) => settings.update({ invertLookY })} label={t('settings.invertY')} />
        <Button variant="ghost" size="sm" onClick={() => settings.update({ hasSeenWorldIntro: false })}>
          {t('settings.intro')}
        </Button>
      </Section>

      <Section icon={<Code2 className="h-5 w-5" />} title={t('nav.lab')}>
        <Select label={t('settings.fontSize')} value={settings.editorFontSize} onChange={(e) => settings.update({ editorFontSize: Number(e.target.value) })}>
          {[12, 13, 14, 15, 16, 18, 20, 22].map((n) => (
            <option key={n} value={n}>
              {n}px
            </option>
          ))}
        </Select>
        <Switch checked={settings.editorWordWrap} onChange={(editorWordWrap) => settings.update({ editorWordWrap })} label={t('settings.wordWrap')} />
      </Section>

      <Button variant="ghost" onClick={() => settings.reset()}>
        {t('common.reset')}
      </Button>
    </div>
  );
}
