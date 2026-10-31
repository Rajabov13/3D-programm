import type { ExerciseFiles, ExerciseMode, FileKey } from '@shared/checks';
import type { EditorLanguage } from './CodeEditor';

export interface FileTab {
  key: FileKey;
  name: string;
  language: EditorLanguage;
}

export const MODE_FILES: Record<ExerciseMode, FileTab[]> = {
  web: [
    { key: 'html', name: 'index.html', language: 'html' },
    { key: 'css', name: 'styles.css', language: 'css' },
    { key: 'js', name: 'script.js', language: 'javascript' },
  ],
  console: [{ key: 'js', name: 'main.js', language: 'javascript' }],
  python: [{ key: 'py', name: 'main.py', language: 'python' }],
  react: [
    { key: 'jsx', name: 'App.jsx', language: 'javascript' },
    { key: 'css', name: 'styles.css', language: 'css' },
  ],
};

export const MODE_LABELS: Record<ExerciseMode, string> = {
  web: 'HTML · CSS · JS (live preview)',
  console: 'JavaScript (console)',
  python: 'Python',
  react: 'React (JSX)',
};

export function filesForMode(mode: ExerciseMode, files: ExerciseFiles): ExerciseFiles {
  const out: ExerciseFiles = {};
  for (const tab of MODE_FILES[mode]) out[tab.key] = files[tab.key] ?? '';
  return out;
}
