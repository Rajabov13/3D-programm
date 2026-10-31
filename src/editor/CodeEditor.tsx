import { useEffect, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { Spinner } from '@/components/ui/Feedback';
import { useSettings } from '@/features/settings/settingsStore';
import { tNow } from '@/i18n';
import './monaco';

export type EditorLanguage = 'html' | 'css' | 'javascript' | 'python' | 'json';

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: EditorLanguage;
  /** Model path — `.jsx` enables JSX syntax in the JavaScript service. */
  path: string;
  ariaLabel: string;
  onRun?: () => void;
  onCheck?: () => void;
  readOnly?: boolean;
}

export function CodeEditor({ value, onChange, language, path, ariaLabel, onRun, onCheck, readOnly }: CodeEditorProps) {
  const { editorFontSize, editorWordWrap, editorMinimap } = useSettings();
  const runRef = useRef(onRun);
  const checkRef = useRef(onCheck);
  runRef.current = onRun;
  checkRef.current = onCheck;
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  useEffect(() => {
    editorRef.current?.updateOptions({ fontSize: editorFontSize, wordWrap: editorWordWrap ? 'on' : 'off', minimap: { enabled: editorMinimap } });
  }, [editorFontSize, editorWordWrap, editorMinimap]);

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.addAction({
      id: 'codeworld.run',
      label: tNow('editor.sc.run'),
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => runRef.current?.(),
    });
    editor.addAction({
      id: 'codeworld.check',
      label: tNow('editor.sc.check'),
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter],
      run: () => checkRef.current?.(),
    });
  };

  return (
    <Editor
      theme="codeworld"
      path={path}
      language={language}
      value={value}
      onChange={(v) => onChange(v ?? '')}
      onMount={onMount}
      loading={<Spinner label={tNow('editor.loading')} />}
      options={{
        readOnly,
        ariaLabel,
        fontSize: editorFontSize,
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        // Ligatures would render syntax such as <!-- --> or => as arrows — confusing while learning it.
        fontLigatures: false,
        wordWrap: editorWordWrap ? 'on' : 'off',
        minimap: { enabled: editorMinimap },
        tabSize: language === 'python' ? 4 : 2,
        insertSpaces: true,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 14, bottom: 14 },
        renderLineHighlight: 'all',
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: 'active', indentation: true },
        accessibilitySupport: 'auto',
        fixedOverflowWidgets: true,
        stickyScroll: { enabled: false },
        quickSuggestions: { other: true, comments: false, strings: false },
        tabCompletion: 'on',
      }}
    />
  );
}

/** Plain textarea used if Monaco fails to load (e.g. very old browsers). */
export function FallbackEditor({ value, onChange, ariaLabel }: { value: string; onChange: (v: string) => void; ariaLabel: string }) {
  return (
    <textarea
      aria-label={ariaLabel}
      value={value}
      spellCheck={false}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Tab' && !e.shiftKey) {
          e.preventDefault();
          const el = e.currentTarget;
          const { selectionStart, selectionEnd } = el;
          const next = value.slice(0, selectionStart) + '  ' + value.slice(selectionEnd);
          onChange(next);
          requestAnimationFrame(() => el.setSelectionRange(selectionStart + 2, selectionStart + 2));
        }
      }}
      className="h-full w-full resize-none bg-[#070c17] p-4 font-mono text-[13px] leading-6 text-slate-100 outline-none"
    />
  );
}
