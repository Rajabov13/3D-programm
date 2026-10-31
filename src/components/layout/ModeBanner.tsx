import { Info } from 'lucide-react';

export function ModeBanner() {
  return (
    <div role="note" className="border-b border-amber-300/10 bg-amber-300/[0.04]">
      <p className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 text-[12.5px] text-amber-100/80 sm:px-6">
        <Info className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden />
        <span>
          <strong className="font-medium text-amber-100">Demo version:</strong> there are no accounts — your progress, XP and admin edits are saved only in this
          browser.
        </span>
      </p>
    </div>
  );
}
