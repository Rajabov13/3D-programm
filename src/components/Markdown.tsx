import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import type { CodeLanguage } from '@/types';
import { CodeBlock } from './CodeBlock';

/**
 * Minimal, safe Markdown renderer for course content: paragraphs, ### headings,
 * lists, fenced code, `code`, **bold**, *italic* and [links](url).
 * Output is React elements — raw HTML in content is rendered as text.
 */
export function Markdown({ source, className }: { source: string; className?: string }) {
  return <div className={cn('prose-cw', className)}>{renderBlocks(source)}</div>;
}

const KNOWN_LANGS: CodeLanguage[] = ['html', 'css', 'javascript', 'python', 'jsx', 'bash', 'text'];

function renderBlocks(source: string): ReactNode[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const fence = /^```\s*([\w-]*)\s*$/.exec(line);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++]);
      i++;
      const lang = (KNOWN_LANGS.includes(fence[1] as CodeLanguage) ? fence[1] : 'text') as CodeLanguage;
      if (lang === 'text') {
        nodes.push(
          <pre key={key++} className="my-3 overflow-x-auto rounded-lg border border-white/[0.08] bg-[#060b16] px-4 py-3 font-mono text-[13px] leading-6 text-slate-200">
            {body.join('\n')}
          </pre>,
        );
      } else nodes.push(<CodeBlock key={key++} code={body.join('\n')} language={lang} />);
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      const Tag = heading[1].length <= 3 ? 'h3' : 'h4';
      nodes.push(<Tag key={key++}>{renderInline(heading[2])}</Tag>);
      i++;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      const itemRe = ordered ? /^\s*\d+\.\s+(.*)$/ : /^\s*[-*]\s+(.*)$/;
      while (i < lines.length && itemRe.test(lines[i])) {
        items.push(itemRe.exec(lines[i])![1]);
        i++;
      }
      const ListTag = ordered ? 'ol' : 'ul';
      nodes.push(
        <ListTag key={key++}>
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ListTag>,
      );
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{1,4}\s|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i])) para.push(lines[i++].trim());
    nodes.push(<p key={key++}>{renderInline(para.join(' '))}</p>);
  }
  return nodes;
}

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(\[[^\]]+\]\([^)\s]+\))/g;

export function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(INLINE)) {
    const index = match.index ?? 0;
    if (index > last) out.push(text.slice(last, index));
    const token = match[0];
    if (match[1]) out.push(<code key={key++} className="inline-code">{token.slice(1, -1)}</code>);
    else if (match[2]) out.push(<strong key={key++}>{renderInline(token.slice(2, -2))}</strong>);
    else if (match[3]) out.push(<em key={key++}>{renderInline(token.slice(1, -1))}</em>);
    else if (match[4]) {
      const [, label, href] = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token) ?? [];
      if (href?.startsWith('/')) out.push(<Link key={key++} to={href}>{label}</Link>);
      else if (href && /^https?:\/\//.test(href))
        out.push(
          <a key={key++} href={href} target="_blank" rel="noreferrer noopener">
            {label}
          </a>,
        );
      else out.push(<Fragment key={key++}>{label}</Fragment>);
    }
    last = index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
