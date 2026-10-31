import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useT, type DictKey } from '@/i18n';

const rows: Array<[string, DictKey]> = [
  ['W A S D', 'world.h.move'],
  ['Shift', 'world.h.run'],
  ['🖱', 'world.h.look'],
  ['E', 'world.h.enter'],
  ['Esc', 'world.h.release'],
  ['V', 'world.h.switch'],
  ['1 – 8', 'world.h.travel'],
  ['M', 'world.h.map'],
  ['R', 'world.h.reset'],
  ['H', 'world.h.help'],
];

export function WorldHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  return (
    <Modal open={open} onClose={onClose} title={t('world.helpTitle')} footer={<Button onClick={onClose}>{t('world.go')}</Button>} size="md">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        {rows.map(([key, action]) => (
          <div key={key} className="flex items-center justify-between gap-3 border-b border-white/[0.05] pb-1.5">
            <dt>
              <kbd className="kbd">{key}</kbd>
            </dt>
            <dd className="text-right text-slate-300">{t(action)}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-slate-400">📱 {t('world.helpTouch')}</p>
      <p className="mt-1 text-sm text-slate-400">🗺 {t('world.helpNo3d')}</p>
    </Modal>
  );
}
