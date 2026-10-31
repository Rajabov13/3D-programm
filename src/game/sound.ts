import { useSettings } from '@/features/settings/settingsStore';

/**
 * Tiny synthesized sound effects (Web Audio) — no audio files to download.
 * They only ever play in response to a user action and respect the Sound setting.
 */
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (!useSettings.getState().sound) return null;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx ??= new AC();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, at: number, duration: number, type: OscillatorType = 'sine', volume = 0.07) {
  const ac = audio();
  if (!ac) return;
  const start = ac.currentTime + at;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

export const sfx = {
  tap: () => tone(520, 0, 0.06, 'triangle', 0.03),
  correct: () => {
    tone(660, 0, 0.12, 'triangle');
    tone(990, 0.09, 0.18, 'triangle');
  },
  wrong: () => {
    tone(220, 0, 0.16, 'sawtooth', 0.035);
    tone(165, 0.12, 0.22, 'sawtooth', 0.035);
  },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.28, 'triangle', 0.06)),
  lose: () => [392, 330, 262].forEach((f, i) => tone(f, i * 0.14, 0.3, 'sine', 0.05)),
  star: (n: number) => tone(880 + n * 160, 0, 0.14, 'sine', 0.05),
};
