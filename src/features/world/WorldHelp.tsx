import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

const rows: Array<[string, string]> = [
  ['W A S D / Arrow keys', 'Walk (Explore mode)'],
  ['Shift', 'Run'],
  ['Mouse', 'Look around (after enabling mouse look) — or click and drag'],
  ['E', 'Enter the building in front of you'],
  ['Esc', 'Release the mouse cursor / close panels'],
  ['V', 'Switch between Overview and Explore'],
  ['1 – 8', 'Travel to a location'],
  ['M', 'Toggle the 2D map'],
  ['R', 'Reset the camera'],
  ['H', 'Show this help'],
];

export function WorldHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Welcome to Code World"
      description="Each building is a learning area. Explore the city in 3D, or use the Locations menu and 2D map if you prefer."
      footer={<Button onClick={onClose}>Start exploring</Button>}
      size="lg"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm text-white">Keyboard & mouse</h3>
          <dl className="space-y-1.5 text-sm">
            {rows.map(([key, action]) => (
              <div key={key} className="flex items-start justify-between gap-3 border-b border-white/[0.05] pb-1.5">
                <dt className="font-mono text-[12px] text-cyan-200">{key}</dt>
                <dd className="text-right text-slate-400">{action}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="space-y-4 text-sm text-slate-400">
          <div>
            <h3 className="mb-1 text-sm text-white">Touch</h3>
            <p>Drag with one finger to orbit (Overview) or look around (Explore). Use the on-screen joystick to walk. Pinch to zoom in Overview.</p>
          </div>
          <div>
            <h3 className="mb-1 text-sm text-white">Prefer not to use 3D?</h3>
            <p>Open <strong className="text-slate-200">Locations</strong> to jump anywhere with one click, switch to the <strong className="text-slate-200">2D map</strong>, or choose “2D map only” in Settings → Graphics.</p>
          </div>
          <div>
            <h3 className="mb-1 text-sm text-white">Locked buildings</h3>
            <p>Courses unlock as you level up. Earn XP by passing knowledge checks, exercises and missions.</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
