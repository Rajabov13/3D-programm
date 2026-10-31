import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Cpu, Keyboard, ListChecks, LoaderCircle, MonitorPlay, Play, RotateCcw, ShieldCheck, Terminal } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useT, type DictKey } from '@/i18n';
import { cn } from '@/lib/cn';
import { config } from '@/services/config';
import type { ExerciseFiles, ExerciseMode, FileKey } from '@shared/checks';
import { CodeEditor, FallbackEditor } from './CodeEditor';
import { ConsolePanel } from './ConsolePanel';
import { MODE_FILES } from './files';
import { PreviewFrame } from './PreviewFrame';
import { SplitPane } from './SplitPane';
import { usePythonRuntimeState, type Runner } from './useRunner';

type OutputTab = 'preview' | 'console' | 'checks';
type MobileTab = 'task' | 'code' | 'output';

export interface WorkspaceProps {
  mode: ExerciseMode;
  files: ExerciseFiles;
  onFileChange: (key: FileKey, value: string) => void;
  runner: Runner;
  onRun: () => void;
  onReset: () => void;
  onCheck?: () => void;
  checking?: boolean;
  checksPanel?: ReactNode;
  /** Bump to bring the Checks tab to the front (e.g. after Check). */
  checksSignal?: number;
  sidebar?: ReactNode;
  toolbarStart?: ReactNode;
  stdin?: string;
  onStdinChange?: (value: string) => void;
  storageKey: string;
}

const SHORTCUTS: Array<[string, DictKey]> = [
  ['Ctrl/⌘ + Enter', 'editor.sc.run'],
  ['Ctrl/⌘ + Shift + Enter', 'editor.sc.check'],
  ['Ctrl/⌘ + S', 'editor.sc.save'],
  ['Ctrl + M', 'editor.sc.tab'],
  ['F1', 'editor.sc.palette'],
  ['Ctrl/⌘ + F', 'editor.sc.find'],
  ['← → ↑ ↓', 'editor.sc.resize'],
];

export function Workspace(props: WorkspaceProps) {
  const { mode, files, onFileChange, runner, onRun, onReset, onCheck, checking, checksPanel, checksSignal, sidebar, toolbarStart, stdin, onStdinChange, storageKey } = props;
  const t = useT();
  const desktop = useIsDesktop();
  const tabs = MODE_FILES[mode];
  const [activeFile, setActiveFile] = useState<FileKey>(tabs[0].key);
  const hasPreview = mode === 'web' || mode === 'react';
  const [outputTab, setOutputTab] = useState<OutputTab>(hasPreview ? 'preview' : 'console');
  const [mobileTab, setMobileTab] = useState<MobileTab>(sidebar ? 'task' : 'code');
  const [confirmReset, setConfirmReset] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const python = usePythonRuntimeState(mode === 'python');

  useEffect(() => {
    if (!tabs.some((t) => t.key === activeFile)) setActiveFile(tabs[0].key);
    setOutputTab(hasPreview ? 'preview' : 'console');
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (checksSignal) {
      setOutputTab('checks');
      if (!desktop) setMobileTab('output');
    }
  }, [checksSignal, desktop]);

  // Shortcuts when focus is outside Monaco (Monaco registers its own actions).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const inMonaco = (e.target as HTMLElement | null)?.closest?.('.monaco-editor');
      if (e.key === 's') {
        e.preventDefault();
        onRun();
        return;
      }
      if (inMonaco || e.key !== 'Enter') return;
      e.preventDefault();
      if (e.shiftKey) onCheck?.();
      else onRun();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onRun, onCheck]);

  const run = () => {
    if (!desktop) setMobileTab('output');
    if (outputTab === 'checks') setOutputTab(hasPreview ? 'preview' : 'console');
    onRun();
  };

  const current = tabs.find((t) => t.key === activeFile) ?? tabs[0];
  const editor = (
    <div className="flex h-full min-h-0 flex-col bg-[#070c17]">
      <div role="tablist" aria-label={t('editor.files')} className="flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-white/[0.06] bg-night-900/80 px-1.5 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={tab.key === current.key}
            onClick={() => setActiveFile(tab.key)}
            className={cn(
              'focus-ring relative my-1 rounded-md px-3 py-1.5 font-mono text-[12px] transition-colors',
              tab.key === current.key ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-300',
            )}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        <ErrorBoundary
          fallback={() => <FallbackEditor value={files[current.key] ?? ''} onChange={(v) => onFileChange(current.key, v)} ariaLabel={`${current.name} — ${t('editor.code')}`} />}
        >
          <CodeEditor
            key={`${storageKey}:${current.key}`}
            path={`file:///${storageKey}/${current.name}`}
            language={current.language}
            value={files[current.key] ?? ''}
            onChange={(v) => onFileChange(current.key, v)}
            ariaLabel={`${current.name} — ${t('editor.code')}`}
            onRun={run}
            onCheck={onCheck}
          />
        </ErrorBoundary>
      </div>
    </div>
  );

  const outputTabs = useMemo(
    () =>
      [
        hasPreview && { id: 'preview' as const, label: t('editor.preview'), icon: MonitorPlay },
        { id: 'console' as const, label: t('editor.console'), icon: Terminal },
        checksPanel && { id: 'checks' as const, label: t('editor.checks'), icon: ListChecks },
      ].filter(Boolean) as Array<{ id: OutputTab; label: string; icon: typeof Terminal }>,
    [hasPreview, checksPanel, t],
  );

  const output = (
    <div className="flex h-full min-h-0 flex-col bg-night-950">
      <div role="tablist" aria-label={t('editor.output')} className="flex shrink-0 items-center gap-0.5 border-b border-white/[0.06] bg-night-900/80 px-1.5">
        {outputTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={outputTab === id}
            onClick={() => setOutputTab(id)}
            className={cn(
              'focus-ring my-1 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors',
              outputTab === id ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-300',
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {label}
            {id === 'console' && runner.entries.some((e) => e.level === 'error') && <span className="h-1.5 w-1.5 rounded-full bg-rose-400" aria-label={t('editor.hasErrors')} />}
          </button>
        ))}
        {runner.lastRun && (
          <span className="ml-auto pr-2 text-[11px] text-slate-500">
            {t(runner.lastRun.status === 'ok' ? 'editor.s.ok' : runner.lastRun.status === 'timeout' ? 'editor.s.timeout' : runner.lastRun.status === 'unavailable' ? 'editor.s.unavailable' : 'editor.s.error')}
            {runner.lastRun.durationMs !== undefined && ` · ${runner.lastRun.durationMs} ms`}
          </span>
        )}
      </div>
      <div className="relative min-h-0 flex-1">
        {hasPreview && (
          <div className={cn('absolute inset-0', outputTab !== 'preview' && 'invisible')}>
            <PreviewFrame ref={runner.previewRef} doc={runner.preview?.doc ?? null} runId={runner.preview?.runId ?? null} onConsole={runner.push} title={t('editor.previewTitle')} />
          </div>
        )}
        <div className={cn('absolute inset-0 flex flex-col', outputTab !== 'console' && 'invisible')}>
          <div className="min-h-0 flex-1">
            <ConsolePanel entries={runner.entries} onClear={runner.clear} emptyHint={t('editor.emptyConsole')} />
          </div>
          {mode === 'python' && onStdinChange && (
            <div className="border-t border-white/[0.06] p-2">
              <label htmlFor={`${storageKey}-stdin`} className="mb-1 block text-[11px] font-medium text-slate-400">
                {t('editor.stdin')}
              </label>
              <textarea
                id={`${storageKey}-stdin`}
                value={stdin}
                onChange={(e) => onStdinChange(e.target.value)}
                rows={2}
                className="w-full resize-y rounded-lg border border-white/10 bg-night-900 px-2.5 py-1.5 font-mono text-[12px] text-slate-200 focus:border-cyan-300/50 focus:outline-none"
              />
            </div>
          )}
        </div>
        {checksPanel && <div className={cn('absolute inset-0 overflow-auto', outputTab !== 'checks' && 'invisible')}>{checksPanel}</div>}
      </div>
    </div>
  );

  const toolbar = (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/[0.06] bg-night-900/90 px-3 py-2">
      {toolbarStart}
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {mode === 'python' && config.pythonRunner === 'pyodide' && (python.state === 'loading' || python.state === 'error') && (
          <span className={cn('inline-flex items-center gap-1.5 text-[11px]', python.state === 'error' ? 'text-rose-300' : 'text-slate-400')} role="status">
            {python.state === 'loading' ? <LoaderCircle className="h-3 w-3 animate-spin" aria-hidden /> : <Cpu className="h-3 w-3" aria-hidden />}
            {python.state === 'loading' ? t('editor.pyLoading') : t('editor.pyFailed')}
          </span>
        )}
        <Button variant="ghost" size="icon" onClick={() => setShowShortcuts(true)} aria-label={t('editor.shortcuts')} title={t('editor.shortcuts')}>
          <Keyboard className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setConfirmReset(true)} icon={<RotateCcw className="h-3.5 w-3.5" />}>
          <span className="hidden sm:inline">{t('common.reset')}</span>
        </Button>
        <Button variant="secondary" size="sm" onClick={run} loading={runner.running && !checking} icon={<Play className="h-3.5 w-3.5" />} title="Ctrl/⌘ + Enter">
          {t('common.run')}
        </Button>
        {onCheck && (
          <Button size="sm" onClick={onCheck} loading={checking} icon={<ShieldCheck className="h-3.5 w-3.5" />} title="Ctrl/⌘ + Shift + Enter">
            {t('common.check')}
          </Button>
        )}
      </div>
    </div>
  );

  const dialogs = (
    <>
      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title={t('editor.resetTitle')}
        description={t('editor.resetBody')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmReset(false);
                onReset();
              }}
            >
              {t('common.reset')}
            </Button>
          </>
        }
      />
      <Modal open={showShortcuts} onClose={() => setShowShortcuts(false)} title={t('editor.shortcuts')} size="md">
        <dl className="space-y-2 text-sm">
          {SHORTCUTS.map(([keys, action]) => (
            <div key={keys} className="flex justify-between gap-4 border-b border-white/[0.05] pb-2">
              <dt className="font-mono text-[12px] text-cyan-200">{keys}</dt>
              <dd className="text-right text-slate-400">{t(action)}</dd>
            </div>
          ))}
        </dl>
      </Modal>
    </>
  );

  if (desktop) {
    const main = <SplitPane first={editor} second={output} initial={0.55} min={0.25} max={0.8} storageKey={`${storageKey}-main`} label={t('editor.resize')} />;
    return (
      <div className="flex h-full min-h-0 flex-col">
        {toolbar}
        <div className="min-h-0 flex-1">
          {sidebar ? (
            <SplitPane first={sidebar} second={main} initial={0.28} min={0.18} max={0.45} storageKey={`${storageKey}-side`} label={t('editor.resize')} />
          ) : (
            main
          )}
        </div>
        {dialogs}
      </div>
    );
  }

  const mobileTabs: Array<{ id: MobileTab; label: string }> = [
    ...(sidebar ? [{ id: 'task' as const, label: t('editor.task') }] : []),
    { id: 'code', label: t('editor.code') },
    { id: 'output', label: t('editor.output') },
  ];
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div role="tablist" aria-label={t('editor.files')} className="flex shrink-0 border-b border-white/[0.06] bg-night-900">
        {mobileTabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={mobileTab === tab.id}
            onClick={() => setMobileTab(tab.id)}
            className={cn('focus-ring flex-1 py-2.5 text-sm font-medium', mobileTab === tab.id ? 'border-b-2 border-cyan-300 text-white' : 'text-slate-500')}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {toolbar}
      <div className="relative min-h-0 flex-1">
        {sidebar && <div className={cn('absolute inset-0 overflow-auto', mobileTab !== 'task' && 'hidden')}>{sidebar}</div>}
        <div className={cn('absolute inset-0', mobileTab !== 'code' && 'invisible')}>{editor}</div>
        <div className={cn('absolute inset-0', mobileTab !== 'output' && 'invisible')}>{output}</div>
      </div>
      {dialogs}
    </div>
  );
}
