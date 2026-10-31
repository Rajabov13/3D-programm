import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, Play } from 'lucide-react';
import { highlight } from '@/lib/highlight';
import type { CodeLanguage } from '@/types';
import type { PlaygroundLaunchState } from '@/editor/playgroundTypes';

const LABELS: Record<CodeLanguage, string> = {
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
  python: 'Python',
  jsx: 'React (JSX)',
  bash: 'Shell',
  text: 'Text',
};

function playgroundState(language: CodeLanguage, code: string): PlaygroundLaunchState | null {
  switch (language) {
    case 'html':
      return { mode: 'web', files: { html: code, css: '', js: '' } };
    case 'css':
      return { mode: 'web', files: { html: '<div class="panel">Style me</div>\n', css: code, js: '' } };
    case 'javascript':
      return /document\.|addEventListener|fetch\(/.test(code) ? null : { mode: 'console', files: { js: code } };
    case 'python':
      return { mode: 'python', files: { py: code } };
    case 'jsx':
      return /createRoot/.test(code) ? { mode: 'react', files: { jsx: code, css: '' } } : null;
    default:
      return null;
  }
}

export function CodeBlock({ code, language, caption }: { code: string; language: CodeLanguage; caption?: string }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const launch = playgroundState(language, code);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <figure className="my-5 overflow-hidden rounded-xl border border-white/[0.08] bg-[#060b16]">
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] bg-white/[0.02] px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{LABELS[language]}</span>
        <div className="flex items-center gap-1">
          {launch && (
            <button
              type="button"
              onClick={() => navigate('/playground', { state: launch })}
              className="focus-ring inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-cyan-200 hover:bg-cyan-300/10"
            >
              <Play className="h-3 w-3" aria-hidden /> Try it
            </button>
          )}
          <button
            type="button"
            onClick={copy}
            className="focus-ring inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label={copied ? 'Copied' : 'Copy code'}
          >
            {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-slate-200">
        <code>{highlight(code, language)}</code>
      </pre>
      {caption && <figcaption className="border-t border-white/[0.06] px-4 py-2 text-xs text-slate-500">{caption}</figcaption>}
    </figure>
  );
}
