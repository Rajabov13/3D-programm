import { Info, Lightbulb, TriangleAlert } from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';
import { Markdown } from '@/components/Markdown';
import { cn } from '@/lib/cn';
import type { ContentBlock } from '@/types';

const CALLOUTS = {
  tip: { icon: Lightbulb, cls: 'border-emerald-300/20 bg-emerald-400/[0.05]', iconCls: 'text-emerald-300', label: 'Tip' },
  info: { icon: Info, cls: 'border-sky-300/20 bg-sky-400/[0.05]', iconCls: 'text-sky-300', label: 'Note' },
  warning: { icon: TriangleAlert, cls: 'border-amber-300/25 bg-amber-400/[0.06]', iconCls: 'text-amber-300', label: 'Watch out' },
} as const;

export function LessonBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2 key={i} className="mb-2 mt-9 text-xl">
                {block.text}
              </h2>
            );
          case 'text':
            return <Markdown key={i} source={block.md} />;
          case 'code':
            return <CodeBlock key={i} code={block.code} language={block.language} caption={block.caption} />;
          case 'callout': {
            const c = CALLOUTS[block.variant] ?? CALLOUTS.info;
            const Icon = c.icon;
            return (
              <aside key={i} className={cn('my-5 flex gap-3 rounded-xl border p-4', c.cls)} aria-label={block.title ?? c.label}>
                <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', c.iconCls)} aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{block.title ?? c.label}</p>
                  <Markdown source={block.md} className="text-sm [&_p]:my-1" />
                </div>
              </aside>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
