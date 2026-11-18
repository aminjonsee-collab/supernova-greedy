(function (root) {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const KW = new Set(('abstract assert break case catch class const continue default do else enum extends final finally for goto if implements import instanceof interface native new package private protected public return static strictfp super switch synchronized this throw throws transient try volatile while record true false null').split(' '));
  const PRIM = new Set('boolean byte char double float int long short void var'.split(' '));

  function hlJava(code) {
    const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])+')|(@\w+)|(\b0x[0-9a-fA-F_]+[lL]?\b|\b\d[\d_]*(?:\.\d+)?(?:e\d+)?[lLfFdD]?\b)|([A-Za-z_$][\w$]*)/g;
    let out = '', last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      const t = m[0];
      let cls = null;
      if (m[1]) cls = 'c';
      else if (m[2]) cls = 's';
      else if (m[3]) cls = 'a';
      else if (m[4]) cls = 'n';
      else if (m[5]) {
        if (KW.has(t)) cls = 'k';
        else if (PRIM.has(t)) cls = 'p';
        else if (/^[A-Z]/.test(t)) cls = /^[A-Z0-9_]+$/.test(t) && t.length > 1 ? 'cn' : 't';
        else {
          const rest = code.slice(re.lastIndex);
          if (/^\s*\(/.test(rest)) cls = 'f';
        }
      }
      out += cls ? `<span class="t-${cls}">${esc(t)}</span>` : esc(t);
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  function hlShell(code) {
    const re = /(#[^\n]*)|("(?:\\.|[^"\\])*")|(\$\(?[\w{}]+\)?)|\b(for|in|do|done|if|then|fi|echo|break|cat|java|javac|cmp)\b/g;
    let out = '', last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'n' : 'k';
      out += `<span class="t-${cls}">${esc(m[0])}</span>`;
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  function highlight(code, lang) {
    if (lang === 'java') return hlJava(code);
    if (lang === 'bash' || lang === 'sh') return hlShell(code);
    return esc(code);
  }

  function inline(text) {
    const codes = [];
    let s = String(text).replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return '\u0001' + (codes.length - 1) + '\u0002'; });
    s = esc(s);
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\[([^\]]+)\]\((#[^)]+|https?:[^)]+)\)/g, '<a href="$2">$1</a>');
    return s.replace(/\u0001(\d+)\u0002/g, (_, i) => `<code>${esc(codes[i])}</code>`);
  }

  const slug = s => s.toLowerCase().replace(/[`*'"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  function codeBlock(code, lang) {
    const label = lang || 'text';
    return `<div class="code" data-lang="${esc(label)}"><div class="code-bar"><span>${esc(label)}</span><button class="code-copy" data-act="copy" type="button">Nusxa olish</button></div><pre><code>${highlight(code, lang)}</code></pre></div>`;
  }

  function splitRow(line) {
    const s = line.trim().replace(/^\|/, '').replace(/\|$/, '').replace(/\\\|/g, '\u0000');
    return s.split('|').map(c => c.replace(/\u0000/g, '|').trim());
  }

  const CALLOUT = { TIP: ['tip', 'Maslahat'], WARN: ['warn', 'Diqqat'], NOTE: ['note', 'Eslatma'] };

  function render(md, opts) {
    opts = opts || {};
    const lines = String(md).replace(/\r/g, '').split('\n');
    const out = [];
    const toc = [];
    let i = 0;
    const isBlockStart = l => /^(```|#{1,4}\s|>\s?|\|)/.test(l) || /^\s*[-*]\s/.test(l) || /^\d+\.\s/.test(l);

    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }

      const f = line.match(/^```(\w*)/);
      if (f) {
        const buf = [];
        i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
        i++;
        out.push(codeBlock(buf.join('\n'), f[1]));
        continue;
      }

      const hm = line.match(/^(#{1,4})\s+(.*)$/);
      if (hm) {
        const lvl = Math.min(4, hm[1].length + (opts.shift || 0));
        const id = (opts.prefix || 's') + '-' + slug(hm[2]);
        if (lvl === 2) toc.push({ id, text: hm[2] });
        out.push(`<h${lvl} id="${id}">${inline(hm[2])}</h${lvl}>`);
        i++;
        continue;
      }

      if (/^>\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
        let text = buf.join(' ');
        const cm = text.match(/^\[!(TIP|WARN|NOTE)\]\s*/);
        const kind = cm ? CALLOUT[cm[1]] : CALLOUT.NOTE;
        if (cm) text = text.slice(cm[0].length);
        out.push(`<aside class="callout ${kind[0]}"><span class="callout-label">${kind[1]}</span><p>${inline(text)}</p></aside>`);
        continue;
      }

      if (/^\|/.test(line) && i + 1 < lines.length && /^\|?\s*:?-{2,}/.test(lines[i + 1])) {
        const head = splitRow(line);
        i += 2;
        const rows = [];
        while (i < lines.length && /^\|/.test(lines[i])) rows.push(splitRow(lines[i++]));
        out.push(`<div class="table-wrap"><table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
        continue;
      }

      if (/^\s*[-*]\s/.test(line)) {
        const items = [];
        while (i < lines.length && (/^\s*[-*]\s/.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
          const l = lines[i];
          if (/^\s{2,}[-*]\s/.test(l)) {
            const last = items[items.length - 1];
            (last.sub = last.sub || []).push(l.replace(/^\s*[-*]\s/, ''));
          } else if (/^\s*[-*]\s/.test(l)) items.push({ t: l.replace(/^\s*[-*]\s/, '') });
          else items[items.length - 1].t += ' ' + l.trim();
          i++;
        }
        out.push('<ul>' + items.map(it => `<li>${inline(it.t)}${it.sub ? '<ul>' + it.sub.map(s => `<li>${inline(s)}</li>`).join('') + '</ul>' : ''}</li>`).join('') + '</ul>');
        continue;
      }

      if (/^\d+\.\s/.test(line)) {
        const items = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i])) items.push(lines[i++].replace(/^\d+\.\s/, ''));
        out.push('<ol>' + items.map(t => `<li>${inline(t)}</li>`).join('') + '</ol>');
        continue;
      }

      const buf = [line];
      i++;
      while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) buf.push(lines[i++]);
      out.push(`<p>${inline(buf.join(' '))}</p>`);
    }
    return { html: out.join('\n'), toc };
  }

  const api = { render, inline, highlight, esc, codeBlock };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MD = api;
})(this);
