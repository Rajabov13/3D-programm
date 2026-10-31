/**
 * Monaco is bundled locally (no CDN loader) with just the features and languages
 * Code World needs. This module is only imported by lazily-loaded editor pages.
 */
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/editor/edcore.main';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import 'monaco-editor/esm/vs/basic-languages/html/html.contribution';
import 'monaco-editor/esm/vs/basic-languages/css/css.contribution';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
import 'monaco-editor/esm/vs/language/css/monaco.contribution';
import 'monaco-editor/esm/vs/language/html/monaco.contribution';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { loader } from '@monaco-editor/react';

window.MonacoEnvironment = {
  getWorker(_id: string, label: string) {
    switch (label) {
      case 'json':
        return new JsonWorker();
      case 'css':
      case 'scss':
      case 'less':
        return new CssWorker();
      case 'html':
      case 'handlebars':
      case 'razor':
        return new HtmlWorker();
      case 'typescript':
      case 'javascript':
        return new TsWorker();
      default:
        return new EditorWorker();
    }
  },
};

const ts = (monaco.languages as unknown as { typescript: typeof import('monaco-editor').languages.typescript }).typescript;
ts.javascriptDefaults.setCompilerOptions({
  target: ts.ScriptTarget.ESNext,
  allowJs: true,
  allowNonTsExtensions: true,
  jsx: ts.JsxEmit.React,
  module: ts.ModuleKind.ESNext,
});
// Learners get syntax errors; semantic diagnostics ("cannot find module 'react'") would only confuse.
ts.javascriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: false });

monaco.editor.defineTheme('codeworld', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'c4b5fd' },
    { token: 'string', foreground: '86efac' },
    { token: 'number', foreground: 'fcd34d' },
    { token: 'type', foreground: '67e8f9' },
    { token: 'tag', foreground: '7dd3fc' },
    { token: 'attribute.name', foreground: 'c4b5fd' },
    { token: 'attribute.value', foreground: '86efac' },
    { token: 'delimiter', foreground: '94a3b8' },
  ],
  colors: {
    'editor.background': '#070c17',
    'editor.foreground': '#e2e8f0',
    'editor.lineHighlightBackground': '#0d162899',
    'editor.selectionBackground': '#1d3b5f',
    'editor.inactiveSelectionBackground': '#16294299',
    'editorCursor.foreground': '#5ce1ff',
    'editorLineNumber.foreground': '#334155',
    'editorLineNumber.activeForeground': '#94a3b8',
    'editorIndentGuide.background1': '#1e293b',
    'editorIndentGuide.activeBackground1': '#334155',
    'editorWidget.background': '#0b1220',
    'editorWidget.border': '#1e293b',
    'editorSuggestWidget.background': '#0b1220',
    'editorSuggestWidget.selectedBackground': '#16294f',
    'scrollbarSlider.background': '#33415555',
    'scrollbarSlider.hoverBackground': '#47556988',
    'editorGutter.background': '#070c17',
  },
});

loader.config({ monaco: monaco as unknown as typeof import('monaco-editor') });

export { monaco };
