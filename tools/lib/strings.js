// A small JavaScript lexer that finds string and template literals, skipping comments and regular
// expressions. Used by the content check (C12) to find player-facing prose written into code, and by
// migration scripts, which need exact offsets. Each literal: { text, kind, line, start, end, parts }.
// For template literals, parts alternates { s: text } and { e: expression source }.
'use strict';
function literals(src, base, baseLine) {
  base = base || 0; const out = []; let i = 0, line = baseLine || 1, prev = '';
  const regexOk = () => !prev || /[(,=:[!&|?{};+\-*%<>~^]$/.test(prev) || /\b(return|typeof|case|in|of|new|delete|void|throw)$/.test(prev);
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (c === '\n') { line++; i++; continue; }
    if (/\s/.test(c)) { i++; continue; }
    if (c === '/' && d === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; } i += 2; continue; }
    if (c === '"' || c === "'") { const at = line, st = i; let j = i + 1, s = ''; while (j < src.length && src[j] !== c) { if (src[j] === '\\') { s += src[j + 1]; j += 2; continue; } s += src[j++]; } out.push({ text: s, kind: 'str', quote: c, line: at, start: base + st, end: base + j + 1 }); i = j + 1; prev = 'x'; continue; }
    if (c === '`') { const at = line, st = i; let j = i + 1, s = ''; const parts = []; const inner = [];
      while (j < src.length) { const ch = src[j];
        if (ch === '\\') { s += src[j + 1]; j += 2; continue; }
        if (ch === '`') break;
        if (ch === '$' && src[j + 1] === '{') { parts.push({ s }); s = ''; j += 2; let depth = 1; const es = j;
          while (j < src.length && depth) { const k = src[j];
            if (k === '`') { let q = j + 1, dd = 0; while (q < src.length && !(src[q] === '`' && !dd)) { if (src[q] === '\\') { q += 2; continue; } if (src[q] === '$' && src[q + 1] === '{') dd++; else if (src[q] === '}' && dd) dd--; q++; } j = q + 1; continue; }
            if (k === "'" || k === '"') { let q = j + 1; while (q < src.length && src[q] !== k) { if (src[q] === '\\') q++; q++; } j = q + 1; continue; }
            if (k === '{') depth++; else if (k === '}') { depth--; if (!depth) break; } else if (k === '\n') line++;
            j++; }
          const expr = src.slice(es, j); parts.push({ e: expr }); inner.push(...literals(expr, base + es, line)); j++; continue; }
        if (ch === '\n') line++; s += ch; j++; }
      parts.push({ s });
      out.push({ text: parts.map(p => p.s !== undefined ? p.s : '').join(''), kind: 'tpl', line: at, start: base + st, end: base + j + 1, parts });
      out.push(...inner); i = j + 1; prev = 'x'; continue; }
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
  if (/^#[0-9a-f]{3,8}$/i.test(t) || (/^[.A-Za-z]+$/.test(t) && /\.\./.test(t))) return ''; // colours and sprite rows
  const words = t.match(/[A-Za-zÀ-ÿĀ-ž]{2,}/g) || [];
  if (words.length < 2) return /^[A-Z][a-zĀ-ž]{2,}/.test(t) && words.length === 1 && !/[#.:=()]/.test(t) && t.length > 3 ? t : '';
  if (/^[.#]?[a-z][\w-]*([ .#>:][\w-]+)*$/.test(t)) return ''; // selectors and class lists
  if (/^[a-z_]+(\s[a-z_]+)*$/.test(t) && !/\s(the|a|to|of|and|is|you|your|in|on)\s/.test(' ' + t + ' ')) return ''; // id lists
  if (/[{};]|=>|\bvar\(|px\b|rgba?\(|translate|0 0/.test(t)) return '';
  return t;
}
module.exports = { literals, prose };
