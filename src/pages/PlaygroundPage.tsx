import { useEffect, useState } from 'react';
import type { ExerciseMode } from '@shared/checks';
import { Workspace } from '@/editor/Workspace';
import { EXAMPLES } from '@/editor/examples';
import { filesForMode, MODE_LABELS } from '@/editor/files';
import { useRunner } from '@/editor/useRunner';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useDraft } from '@/hooks/useDraft';
import { useL, useT } from '@/i18n';
import { readJSON, writeJSON } from '@/lib/storage';

const MODES: ExerciseMode[] = ['web', 'console', 'python', 'react'];

/** Free-form code lab: write anything, run it in the sandbox. */
export default function PlaygroundPage() {
  const t = useT();
  const l = useL();
  useDocumentTitle(t('lab.title'));
  const [mode, setMode] = useState<ExerciseMode>(() => {
    const saved = readJSON<ExerciseMode>('cw.playground.mode', 'web');
    return MODES.includes(saved) ? saved : 'web';
  });
  const draft = useDraft(`playground.${mode}`, filesForMode(mode, EXAMPLES[mode][0].files));
  const runner = useRunner(mode);
  const [stdin, setStdin] = useState('');
  const [autoRun, setAutoRun] = useState(true);

  useEffect(() => {
    writeJSON('cw.playground.mode', mode);
  }, [mode]);

  // Live preview for web/React: re-run shortly after typing stops.
  const live = autoRun && (mode === 'web' || mode === 'react');
  const files = draft.files;
  useEffect(() => {
    if (!live) return;
    const timer = window.setTimeout(() => void runner.run(files), 700);
    return () => window.clearTimeout(timer);
  }, [files, live]); // eslint-disable-line react-hooks/exhaustive-deps

  const toolbarStart = (
    <div className="flex flex-wrap items-center gap-2">
      <h1 className="sr-only">{t('lab.title')}</h1>
      <label htmlFor="pg-language" className="sr-only">
        {t('lab.language')}
      </label>
      <select
        id="pg-language"
        value={mode}
        onChange={(e) => setMode(e.target.value as ExerciseMode)}
        className="focus-ring h-8 rounded-lg border border-white/10 bg-night-950 px-2.5 text-[13px] text-slate-200"
      >
        {MODES.map((m) => (
          <option key={m} value={m}>
            {MODE_LABELS[m]}
          </option>
        ))}
      </select>
      <label htmlFor="pg-example" className="sr-only">
        {t('lab.example')}
      </label>
      <select
        id="pg-example"
        value=""
        onChange={(e) => {
          const example = EXAMPLES[mode].find((x) => x.id === e.target.value);
          if (example) draft.replace(filesForMode(mode, example.files));
        }}
        className="focus-ring h-8 max-w-[11rem] rounded-lg border border-white/10 bg-night-950 px-2.5 text-[13px] text-slate-300"
      >
        <option value="" disabled>
          {t('lab.example')}
        </option>
        {EXAMPLES[mode].map((x) => (
          <option key={x.id} value={x.id}>
            {l(x.title)}
          </option>
        ))}
      </select>
      {(mode === 'web' || mode === 'react') && (
        <label className="flex items-center gap-1.5 text-[12px] text-slate-400">
          <input type="checkbox" checked={autoRun} onChange={(e) => setAutoRun(e.target.checked)} className="accent-cyan-400" />
          {t('lab.live')}
        </label>
      )}
    </div>
  );

  return (
    <Workspace
      mode={mode}
      files={draft.files}
      onFileChange={draft.setFile}
      runner={runner}
      onRun={() => void runner.run(draft.files, { stdin })}
      onReset={() => draft.replace(filesForMode(mode, EXAMPLES[mode][0].files))}
      stdin={stdin}
      onStdinChange={setStdin}
      storageKey={`playground-${mode}`}
      toolbarStart={toolbarStart}
    />
  );
}
