import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { BookOpen, FlaskConical, Image as ImageIcon, Play, Terminal } from 'lucide-react';
import { useL, useT, type L10n } from '@/i18n';
import { highlight } from '@/lib/highlight';
import { cn } from '@/lib/cn';
import { sfx } from '../sound';
import type { BrowserView, Cell, ExampleResult, LearnCard, Picture } from '../types';
import { CodeView, LANG_MAP } from './CodeView';
import { LookPreview } from './Tasks';

const PART_COLORS = [
  { mark: 'bg-cyan-400/20 text-cyan-100 ring-cyan-300/60', dot: 'bg-cyan-300' },
  { mark: 'bg-amber-400/20 text-amber-100 ring-amber-300/60', dot: 'bg-amber-300' },
  { mark: 'bg-pink-400/20 text-pink-100 ring-pink-300/60', dot: 'bg-pink-300' },
  { mark: 'bg-lime-400/20 text-lime-100 ring-lime-300/60', dot: 'bg-lime-300' },
];

// ─── Sandboxed page preview ───────────────────────────────────────────────

const PAGE_CSS =
  ':host{display:block}.page{font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#0f172a;background:#fff;padding:14px 16px;min-height:44px;overflow:auto}img{max-width:100%;vertical-align:middle}';

function placeholder(alt: string): string {
  const label = (alt || 'image').replace(/[<>&"]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="96"><rect width="160" height="96" rx="10" fill="#e0f2fe"/><text x="80" y="44" font-size="30" text-anchor="middle">🖼️</text><text x="80" y="76" font-family="system-ui,sans-serif" font-size="13" fill="#0369a1" text-anchor="middle">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Renders example HTML/CSS inside a shadow root: styles stay isolated from the app,
 * nothing executes (inert template, no scripts or inline handlers), links and forms
 * don't navigate, and images become local placeholders (no network requests).
 */
function PagePreview({ html, css }: { html: string; css?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    const template = document.createElement('template');
    template.innerHTML = html;
    const content = template.content;
    content.querySelectorAll('script, iframe, object, embed, link, meta, base').forEach((el) => el.remove());
    content.querySelectorAll('*').forEach((el) => {
      for (const attr of Array.from(el.attributes)) if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
    });
    content.querySelectorAll('img').forEach((img) => img.setAttribute('src', placeholder(img.getAttribute('alt') ?? '')));
    content.querySelectorAll('video, audio, source').forEach((el) => el.removeAttribute('src'));
    content.querySelectorAll('video').forEach((el) => el.setAttribute('style', 'width:220px;max-width:100%;background:#0f172a;border-radius:8px'));
    const style = document.createElement('style');
    style.textContent = PAGE_CSS + (css ?? '');
    const page = document.createElement('div');
    page.className = 'page';
    page.append(content);
    root.replaceChildren(style, page);
  }, [html, css]);
  useEffect(() => {
    const root = ref.current?.shadowRoot;
    if (!root) return;
    const stop = (e: Event) => {
      if (e.type === 'submit' || (e.target as Element | null)?.closest?.('a')) e.preventDefault();
    };
    root.addEventListener('click', stop);
    root.addEventListener('submit', stop);
    return () => {
      root.removeEventListener('click', stop);
      root.removeEventListener('submit', stop);
    };
  }, []);
  return <div ref={ref} />;
}

export function BrowserMock({ view, fallbackHtml, fallbackCss }: { view: BrowserView; fallbackHtml?: string; fallbackCss?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-200 shadow-lg shadow-black/30">
      <div className="flex items-center gap-2 bg-slate-300/80 px-3 py-1.5" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 min-w-0 flex-1 truncate rounded-md bg-white/80 px-2.5 py-0.5 text-[11px] text-slate-600">{view.title ?? 'index.html'}</span>
      </div>
      <PagePreview html={view.html ?? fallbackHtml ?? ''} css={view.css ?? fallbackCss} />
    </div>
  );
}

export function TerminalMock({ lines }: { lines: string[] }) {
  const t = useT();
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-300/20 bg-[#030806]">
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-emerald-300/80">
        <Terminal className="h-3.5 w-3.5" aria-hidden /> {t('editor.console')}
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[14px] leading-6 text-emerald-200">
        {lines.map((line, i) => (
          <div key={i}>
            <span className="select-none text-emerald-500/50">› </span>
            {line}
          </div>
        ))}
      </pre>
    </div>
  );
}

// ─── Pictures ─────────────────────────────────────────────────────────────

function useCell(): (c: Cell) => string {
  const l = useL();
  return (c) => (typeof c === 'string' ? c : l(c as L10n));
}

function PartsPicture({ picture }: { picture: Extract<Picture, { kind: 'parts' }> }) {
  const l = useL();
  // Split the code into plain segments and highlighted parts (found in order).
  const segments: Array<{ text: string; part?: number }> = [];
  let rest = picture.code;
  picture.parts.forEach((p, i) => {
    const at = rest.indexOf(p.text);
    if (at < 0) return;
    if (at > 0) segments.push({ text: rest.slice(0, at) });
    segments.push({ text: p.text, part: i });
    rest = rest.slice(at + p.text.length);
  });
  if (rest) segments.push({ text: rest });
  return (
    <div className="space-y-3">
      <pre className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#060a14] p-4 font-mono text-[15px] leading-8 text-slate-200">
        <code>
          {segments.map((s, i) =>
            s.part === undefined ? (
              <span key={i}>{highlight(s.text, LANG_MAP[picture.lang])}</span>
            ) : (
              <mark key={i} className={cn('rounded-md px-0.5 ring-1', PART_COLORS[s.part % PART_COLORS.length].mark)}>
                {s.text}
              </mark>
            ),
          )}
        </code>
      </pre>
      <ul className="grid gap-2 sm:grid-cols-2">
        {picture.parts.map((p, i) => (
          <li key={i} className="flex items-start gap-2.5 rounded-xl bg-white/[0.03] px-3 py-2">
            <span className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', PART_COLORS[i % PART_COLORS.length].dot)} aria-hidden />
            <span className="min-w-0 text-sm">
              <code className="mr-1.5 break-all font-mono text-[13px] text-white">{p.text.trim()}</code>
              <span className="text-slate-300">— {l(p.label)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BoxesPicture({ picture }: { picture: Extract<Picture, { kind: 'boxes' }> }) {
  return (
    <ul className="flex flex-wrap gap-4">
      {picture.items.map((it) => (
        <li key={it.name} className="flex flex-col items-center">
          <span className="rounded-t-lg bg-cyan-300 px-3 py-0.5 font-mono text-[13px] font-bold text-night-950">{it.name}</span>
          <span className="grid min-h-[64px] min-w-[96px] place-items-center rounded-xl border-2 border-cyan-300/60 bg-cyan-300/[0.07] px-4 font-mono text-xl font-semibold text-white shadow-[inset_0_-6px_0_rgba(34,211,238,0.12)]">
            {it.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ListPicture({ picture }: { picture: Extract<Picture, { kind: 'list' }> }) {
  const t = useT();
  const n = picture.items.length;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-mono text-lg text-cyan-200">{picture.name} =</span>
      <div className="flex">
        {picture.items.map((item, i) => (
          <div key={i} className="flex flex-col items-center">
            <span
              className={cn(
                'grid h-14 min-w-[64px] place-items-center border-2 border-violet-300/60 bg-violet-400/[0.08] px-3 font-mono text-lg font-semibold text-white',
                i > 0 && 'border-l-0',
                i === 0 && 'rounded-l-xl',
                i === n - 1 && 'rounded-r-xl',
              )}
            >
              {item}
            </span>
            <span className="mt-1 font-mono text-[13px] font-bold text-amber-300">{i}</span>
            {picture.negative && <span className="font-mono text-[12px] text-pink-300">{i - n}</span>}
          </div>
        ))}
      </div>
      <span className="text-xs text-slate-500">↑ {t('learn.index')}</span>
    </div>
  );
}

function TablePicture({ picture }: { picture: Extract<Picture, { kind: 'table' }> }) {
  const t = useT();
  const cell = useCell();
  const head = picture.head ? [cell(picture.head[0]), cell(picture.head[1])] : [t('learn.code'), t('learn.means')];
  return (
    <table className="w-full overflow-hidden rounded-2xl border border-white/10 text-left text-[15px]">
      <thead className="bg-white/[0.05] text-xs uppercase tracking-wider text-slate-400">
        <tr>
          <th scope="col" className="px-4 py-2 font-semibold">
            {head[0]}
          </th>
          <th scope="col" className="px-4 py-2 font-semibold">
            {head[1]}
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/[0.06]">
        {picture.rows.map(([left, right], i) => (
          <tr key={i}>
            <td className="px-4 py-2.5 font-mono text-[14px] text-cyan-100">{left}</td>
            <td className={cn('px-4 py-2.5 text-slate-100', typeof right === 'string' && 'font-mono text-[15px]')}>{cell(right)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ComparePicture({ picture }: { picture: Extract<Picture, { kind: 'compare' }> }) {
  return (
    <ul className={cn('grid gap-3', picture.items.length > 3 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3', picture.items.length === 2 && 'sm:grid-cols-2')}>
      {picture.items.map((it) => (
        <li key={it.code} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <div className="grid min-h-[72px] place-items-center rounded-xl bg-night-950/60 p-2">
            <LookPreview option={it.style} kind={picture.preview} />
          </div>
          <code className="text-center font-mono text-[12.5px] text-cyan-100">{it.code}</code>
        </li>
      ))}
    </ul>
  );
}

function BoxModelPicture() {
  const layer = (label: string, cls: string, children: ReactNode) => (
    <div className={cn('relative rounded-xl border-2 px-4 pb-4 pt-6 sm:px-6', cls)}>
      <span className="absolute left-2 top-1 font-mono text-[11px] font-bold uppercase tracking-wider">{label}</span>
      {children}
    </div>
  );
  return layer(
    'margin',
    'border-dashed border-orange-300/70 bg-orange-400/[0.06] text-orange-200',
    layer(
      'border',
      'border-amber-300 bg-amber-300/[0.10] text-amber-200',
      layer('padding', 'border-emerald-300/50 bg-emerald-400/[0.10] text-emerald-200', <div className="grid h-12 place-items-center rounded-lg bg-sky-400/30 font-mono text-sm font-bold text-sky-100">content</div>),
    ),
  );
}

export function PictureView({ picture }: { picture: Picture }) {
  switch (picture.kind) {
    case 'parts':
      return <PartsPicture picture={picture} />;
    case 'boxes':
      return <BoxesPicture picture={picture} />;
    case 'list':
      return <ListPicture picture={picture} />;
    case 'table':
      return <TablePicture picture={picture} />;
    case 'compare':
      return <ComparePicture picture={picture} />;
    case 'boxmodel':
      return <BoxModelPicture />;
    case 'browser':
      return <BrowserMock view={picture} />;
  }
}

function ResultView({ result, code, lang }: { result: ExampleResult; code: string; lang: LearnCard['example']['lang'] }) {
  if (result.kind === 'terminal') return <TerminalMock lines={result.lines} />;
  return <BrowserMock view={result} fallbackHtml={lang === 'html' ? code : undefined} fallbackCss={lang === 'css' ? code : undefined} />;
}

// ─── Card ─────────────────────────────────────────────────────────────────

function SectionLabel({ icon, children, color }: { icon: ReactNode; children: ReactNode; color: string }) {
  return <p className={cn('mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest', color)}>{icon}{children}</p>;
}

/**
 * One learning card: short info + a picture, then a code example with its result.
 * In `compact` mode (review sheet during the test) the result is always shown.
 */
export function LearnCardView({ card, accent, compact = false }: { card: LearnCard; accent: string; compact?: boolean }) {
  const t = useT();
  const l = useL();
  const [shown, setShown] = useState(compact);
  const { example } = card;
  return (
    <article className="space-y-5">
      <header className="flex items-center gap-4">
        <span
          className={cn('grid shrink-0 place-items-center rounded-2xl', compact ? 'h-12 w-12 text-2xl' : 'h-16 w-16 animate-pop-in text-4xl')}
          style={{ background: `${accent}22`, boxShadow: `inset 0 0 0 2px ${accent}66` }}
          aria-hidden
        >
          {card.icon}
        </span>
        <h2 className={cn('font-bold leading-tight', compact ? 'text-xl' : 'text-2xl sm:text-3xl')}>{l(card.title)}</h2>
      </header>

      <section>
        <SectionLabel icon={<BookOpen className="h-3.5 w-3.5" aria-hidden />} color="text-sky-300">
          {t('learn.info')}
        </SectionLabel>
        <p className="text-[17px] leading-relaxed text-slate-100">{l(card.text)}</p>
      </section>

      {card.picture && (
        <section aria-label={t('learn.picture')}>
          <SectionLabel icon={<ImageIcon className="h-3.5 w-3.5" aria-hidden />} color="text-violet-300">
            {t('learn.picture')}
          </SectionLabel>
          <PictureView picture={card.picture} />
        </section>
      )}

      <section>
        <SectionLabel icon={<FlaskConical className="h-3.5 w-3.5" aria-hidden />} color="text-amber-300">
          {t('learn.example')}
        </SectionLabel>
        <CodeView code={example.code} lang={example.lang} />
        <div className="mt-3">
          {shown ? (
            <div className={cn(!compact && 'animate-rise-in')}>
              <p className="mb-2 text-xs font-semibold text-slate-400">
                ↓ {t('learn.result')}
                {example.caption && <span className="font-normal"> · {l(example.caption)}</span>}
              </p>
              <ResultView result={example.result} code={example.code} lang={example.lang} />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                sfx.tap();
                setShown(true);
              }}
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-300/40 bg-amber-300/[0.06] py-4 font-semibold text-amber-100 transition-colors hover:border-amber-300/70 hover:bg-amber-300/10"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden /> {t('learn.run')}
            </button>
          )}
        </div>
      </section>
    </article>
  );
}
