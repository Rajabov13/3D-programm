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
    { token: 'string', foreground: 'f0b27a' },
    { token: 'number', foreground: 'fcd34d' },
    { token: 'type', foreground: 'e5e5e5' },
    { token: 'tag', foreground: 'fca5a5' },
    { token: 'attribute.name', foreground: 'c4b5fd' },
    { token: 'attribute.value', foreground: 'f0b27a' },
    { token: 'delimiter', foreground: '94a3b8' },
  ],
  colors: {
    'editor.background': '#191b1d',
    'editor.foreground': '#e5e5e5',
    'editor.lineHighlightBackground': '#232527',
    'editor.selectionBackground': '#45474a',
    'editor.inactiveSelectionBackground': '#393b3d',
    'editorCursor.foreground': '#ffffff',
    'editorLineNumber.foreground': '#4a4a4a',
    'editorLineNumber.activeForeground': '#a3a3a3',
    'editorIndentGuide.background1': '#262626',
    'editorIndentGuide.activeBackground1': '#3a3a3a',
    'editorWidget.background': '#232527',
    'editorWidget.border': '#2a2a2a',
    'editorSuggestWidget.background': '#232527',
    'editorSuggestWidget.selectedBackground': '#45474a',
    'scrollbarSlider.background': '#33415555',
    'scrollbarSlider.hoverBackground': '#47556988',
    'editorGutter.background': '#191b1d',
  },
});

/** Light editor theme (GitHub-like syntax colours) for the light site theme. */
monaco.editor.defineTheme('codeworld-light', {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
    { token: 'keyword', foreground: '7c3aed' },
    { token: 'string', foreground: '047857' },
    { token: 'number', foreground: 'b45309' },
    { token: 'type', foreground: '1d4ed8' },
    { token: 'tag', foreground: '0369a1' },
    { token: 'attribute.name', foreground: '7c3aed' },
    { token: 'attribute.value', foreground: '047857' },
    { token: 'delimiter', foreground: '64748b' },
  ],
  colors: {
    'editor.background': '#f8fafc',
    'editor.foreground': '#0f172a',
    'editor.lineHighlightBackground': '#eef2f7',
    'editor.selectionBackground': '#bfdbfe',
    'editor.inactiveSelectionBackground': '#dbeafe',
    'editorCursor.foreground': '#2563eb',
    'editorLineNumber.foreground': '#94a3b8',
    'editorLineNumber.activeForeground': '#334155',
    'editorIndentGuide.background1': '#e2e8f0',
    'editorIndentGuide.activeBackground1': '#cbd5e1',
    'editorWidget.background': '#ffffff',
    'editorWidget.border': '#e2e8f0',
    'editorSuggestWidget.background': '#ffffff',
    'editorSuggestWidget.selectedBackground': '#dbeafe',
    'editorGutter.background': '#f8fafc',
  },
});

loader.config({ monaco: monaco as unknown as typeof import('monaco-editor') });

export { monaco };
