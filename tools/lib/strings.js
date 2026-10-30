// A small JavaScript lexer that finds string and template literals, skipping comments and regular
// expressions. Used by the content check (C12) to find player-facing prose written into code.
'use strict';
function literals(src) {
  const out = []; let i = 0, line = 1, prev = '';
  const push = (text, kind, at) => out.push({ text, kind, line: at });
  const regexOk = () => !prev || /[(,=:[!&|?{};+\-*%<>~^]$/.test(prev) || /\b(return|typeof|case|in|of|new|delete|void|throw)$/.test(prev);
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (c === '\n') { line++; i++; continue; }
    if (/\s/.test(c)) { i++; continue; }
    if (c === '/' && d === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; } i += 2; continue; }
    if (c === '"' || c === "'") { const at = line; let j = i + 1, s = ''; while (j < src.length && src[j] !== c) { if (src[j] === '\\') { s += src[j + 1]; j += 2; continue; } s += src[j++]; } push(s, 'str', at); i = j + 1; prev = 'x'; continue; }
    if (c === '`') { const at = line; let j = i + 1, s = '', depth = 0; const parts = [];
      while (j < src.length) { const ch = src[j];
        if (ch === '\\') { s += src[j + 1]; j += 2; continue; }
        if (ch === '`') break;
        if (ch === '$' && src[j + 1] === '{') { parts.push(s); s = ''; j += 2; depth = 1; let inner = '';
          while (j < src.length && depth) { const k = src[j]; if (k === '{') depth++; else if (k === '}') { depth--; if (!depth) break; } else if (k === '`') { let q = j + 1; let dd = 0; while (q < src.length && !(src[q] === '`' && !dd)) { if (src[q] === '$' && src[q + 1] === '{') dd++; else if (src[q] === '}' && dd) dd--; q++; } inner += src.slice(j, q + 1); j = q + 1; continue; } else if (k === '\n') line++; inner += k; j++; }
          for (const x of literals(inner)) push(x.text, x.kind, at);
          j++; s += '\u0000'; continue; }
        if (ch === '\n') line++; s += ch; j++; }
      parts.push(s); push(parts.join('').replace(/\u0000/g, ''), 'tpl', at); push(s, 'tpl-raw', at); out.pop(); i = j + 1; prev = 'x'; continue; }
    if (c === '/' && regexOk()) { let j = i + 1, cls = false; while (j < src.length) { const ch = src[j]; if (ch === '\\') { j += 2; continue; } if (ch === '[') cls = true; else if (ch === ']') cls = false; else if (ch === '/' && !cls) break; else if (ch === '\n') break; j++; } j++; while (/[a-z]/i.test(src[j] || '')) j++; i = j; prev = 'x'; continue; }
    if (/[A-Za-z0-9_$]/.test(c)) { let j = i; while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++; prev = src.slice(i, j); i = j; continue; }
    prev = c; i++;
  }
  return out;
}
// Prose: visible words a player reads. Markup is stripped; selectors, ids, class lists and code fragments are not prose.
function prose(text) {
  const t = text.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
  if (!t) return '';
  const words = t.match(/[A-Za-zÀ-ÿĀ-ž]{2,}/g) || [];
  if (words.length < 2) return /^[A-Z][a-zĀ-ž]{2,}/.test(t) && words.length === 1 && !/[#.:=()]/.test(t) && t.length > 3 ? t : '';
  if (/^[.#]?[a-z][\w-]*([ .#>:][\w-]+)*$/.test(t)) return ''; // selectors and class lists
  if (/^[a-z_]+(\s[a-z_]+)*$/.test(t) && !/\s(the|a|to|of|and|is|you|your|in|on)\s/.test(' ' + t + ' ')) return ''; // id lists
  if (/[{};]|=>|\bvar\(|px\b|rgba?\(|translate|0 0/.test(t)) return '';
  return t;
}
module.exports = { literals, prose };
