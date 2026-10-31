/**
 * Script injected first into every preview document. It runs inside the sandboxed
 * (opaque-origin) iframe and:
 *  - forwards console output, errors and unhandled rejections to the parent,
 *  - replaces blocking dialogs (alert/confirm/prompt) with console messages,
 *  - blocks in-frame navigation,
 *  - defines the loop guard used by loop-protected code,
 *  - evaluates `dom_runtime` checks on request (clicks/typing, then DOM assertions).
 * It is plain ES2017 so it works in every supported browser without transpiling.
 */
export function bridgeScript(runId: string): string {
  return `(function () {
  var RUN_ID = ${JSON.stringify(runId)};
  function send(msg) {
    msg.__cw = true; msg.runId = RUN_ID;
    try { window.parent.postMessage(msg, '*'); } catch (e) {}
  }
  function fmt(value, depth) {
    depth = depth || 0;
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    var t = typeof value;
    if (t === 'string') return depth ? JSON.stringify(value) : value;
    if (t === 'number' || t === 'boolean' || t === 'bigint') return String(value);
    if (t === 'symbol') return value.toString();
    if (t === 'function') return '[Function ' + (value.name || 'anonymous') + ']';
    if (value instanceof Error) return value.name + ': ' + value.message;
    if (typeof Element !== 'undefined' && value instanceof Element) {
      return '<' + value.tagName.toLowerCase() + (value.id ? '#' + value.id : '') + (value.className && typeof value.className === 'string' ? '.' + value.className.trim().split(/\\s+/).join('.') : '') + '>';
    }
    if (depth > 2) return Array.isArray(value) ? '[…]' : '{…}';
    try {
      if (Array.isArray(value)) return '[' + value.slice(0, 50).map(function (v) { return fmt(v, depth + 1); }).join(', ') + (value.length > 50 ? ', …' : '') + ']';
      if (value instanceof Map) return 'Map(' + value.size + ')';
      if (value instanceof Set) return 'Set(' + value.size + ')';
      var keys = Object.keys(value).slice(0, 30);
      return '{ ' + keys.map(function (k) { return k + ': ' + fmt(value[k], depth + 1); }).join(', ') + (keys.length ? ' ' : '') + '}';
    } catch (e) { return String(value); }
  }
  ['log', 'info', 'warn', 'error', 'debug'].forEach(function (level) {
    var original = console[level];
    console[level] = function () {
      var args = Array.prototype.slice.call(arguments);
      send({ type: 'console', level: level === 'debug' ? 'log' : level, text: args.map(function (a) { return fmt(a, 0); }).join(' ') });
      try { original.apply(console, args); } catch (e) {}
    };
  });
  console.table = function (data) { console.log(data); };
  window.alert = function (m) { send({ type: 'console', level: 'info', text: '[alert] ' + String(m) }); };
  window.confirm = function (m) { send({ type: 'console', level: 'info', text: '[confirm] ' + String(m) + ' → false' }); return false; };
  window.prompt = function (m) { send({ type: 'console', level: 'info', text: '[prompt] ' + String(m) + ' → null' }); return null; };
  function userLine(e) {
    var stack = e && e.error && e.error.stack;
    var m = stack && /(?:script\\.js|App\\.jsx):(\\d+):\\d+/.exec(stack);
    if (m) return Number(m[1]);
    var start = window.__cwScriptLine;
    if (start && e && e.lineno >= start) return e.lineno - start + 1;
    return undefined;
  }
  window.addEventListener('error', function (e) {
    send({ type: 'error', message: (e && e.message) || 'Script error', line: userLine(e) });
  });
  window.addEventListener('unhandledrejection', function (e) {
    send({ type: 'error', message: 'Unhandled promise rejection: ' + fmt(e.reason, 0) });
  });
  window.__cwLoopGuard = function (start) {
    if (Date.now() - start > 1500) throw new RangeError('Potential infinite loop: a loop ran for more than 1.5 s and was stopped.');
  };
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (a && (a.getAttribute('href') || '').charAt(0) !== '#') {
      e.preventDefault();
      send({ type: 'console', level: 'info', text: '[navigation blocked in preview] ' + a.getAttribute('href') });
    }
  }, true);
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    send({ type: 'console', level: 'info', text: '[form submission blocked in preview]' });
  }, true);

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function textOf(el) { return (el.textContent || '').replace(/\\s+/g, ' ').trim(); }
  function setValue(el, value) {
    var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var desc = Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && desc.set) desc.set.call(el, value); else el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  async function runChecks(checks) {
    var results = {};
    for (var i = 0; i < checks.length; i++) {
      var c = checks[i];
      try {
        var failed = null;
        var actions = c.before || [];
        for (var a = 0; a < actions.length && !failed; a++) {
          var act = actions[a];
          var target = document.querySelector(act.selector);
          if (!target) { failed = 'Could not find ' + act.selector + ' to ' + act.type + '.'; break; }
          if (act.type === 'click') {
            for (var n = 0; n < (act.times || 1); n++) { target.click(); await sleep(25); }
          } else if (act.type === 'input') { setValue(target, act.value); await sleep(25); }
        }
        if (failed) { results[c.id] = { pass: false, message: failed }; continue; }
        await sleep(60);
        var els = Array.prototype.slice.call(document.querySelectorAll(c.selector));
        var min = c.min || 1;
        if (els.length < min) {
          results[c.id] = { pass: false, message: els.length === 0 ? 'Nothing in the preview matches ' + c.selector + '.' : 'Found ' + els.length + ' × ' + c.selector + ', expected at least ' + min + '.' };
          continue;
        }
        if (c.textEquals !== undefined && !els.some(function (el) { return textOf(el) === c.textEquals; })) {
          results[c.id] = { pass: false, message: c.selector + ' shows “' + textOf(els[0]) + '”, expected “' + c.textEquals + '”.' };
          continue;
        }
        if (c.textIncludes !== undefined && !els.some(function (el) { return textOf(el).toLowerCase().indexOf(String(c.textIncludes).toLowerCase()) !== -1; })) {
          results[c.id] = { pass: false, message: c.selector + ' shows “' + textOf(els[0]) + '”, expected it to include “' + c.textIncludes + '”.' };
          continue;
        }
        results[c.id] = { pass: true };
      } catch (err) {
        results[c.id] = { pass: false, message: 'Error while checking: ' + (err && err.message) };
      }
    }
    return results;
  }
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || d.__cw !== true || d.type !== 'run-checks' || e.source !== window.parent) return;
    runChecks(d.checks || []).then(function (results) { send({ type: 'runtime-results', results: results }); });
  });
  window.addEventListener('load', function () { setTimeout(function () { send({ type: 'ready' }); }, 0); });
})();`;
}
