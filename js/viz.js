(function () {
  'use strict';
  const nums = s => String(s).split(/[\s,;]+/).filter(Boolean).map(Number).filter(x => Number.isFinite(x));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const range = n => Array.from({ length: n }, (_, i) => i);
  const clone = o => JSON.parse(JSON.stringify(o));
  const pairs = s => { const out = []; const re = /(-?\d+)\s*[-–:]\s*(-?\d+)/g; let m; while ((m = re.exec(String(s)))) out.push([+m[1], +m[2]]); return out; };
  const triples = s => String(s).split(/[,;\n]+/).map(t => nums(t)).filter(t => t.length === 3);

  const W = 720;
  function axis(tmin, tmax, x, y, h) {
    const span = tmax - tmin;
    const step = span <= 20 ? 1 : span <= 40 ? 2 : span <= 100 ? 5 : Math.ceil(span / 20);
    let s = `<line class="ax" x1="${x(tmin)}" x2="${x(tmax)}" y1="${y}" y2="${y}"/>`;
    for (let t = Math.ceil(tmin / step) * step; t <= tmax; t += step) {
      s += `<line class="tick" x1="${x(t)}" x2="${x(t)}" y1="${y}" y2="${y + 4}"/><text class="tl" x="${x(t)}" y="${y + 16}" text-anchor="middle">${t}</text>`;
      if (h) s += `<line class="grid" x1="${x(t)}" x2="${x(t)}" y1="${h}" y2="${y}"/>`;
    }
    return s;
  }
  const svg = (h, inner, cls, w) => `<svg class="vz-svg${cls ? ' ' + cls : ''}" viewBox="0 0 ${w || W} ${h}" preserveAspectRatio="xMinYMin meet" role="img">${inner}</svg>`;
  const defs = '<defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" class="hatch"/></pattern></defs>';

  const VIZ = {};

  /* ---------- 1. Activity selection ---------- */
  VIZ.intervals = {
    title: 'Activity selection',
    lesson: 'l03',
    blurb: 'Tugash vaqti bo\'yicha saralab, oxirgi tanlangandan keyin boshlanadiganlarni olamiz.',
    inputs: [{ k: 'a', label: 'Intervallar [s, e)', def: '1-4 3-5 0-6 5-7 3-9 5-9 6-10 8-11 8-12 2-14 12-16' }],
    legend: [['take', 'olindi'], ['skip', 'tashlandi'], ['cur', 'ko\'rilmoqda'], ['sweep', 'oxirgi tugash']],
    code: 'Arrays.sort(a, (x, y) -> Integer.compare(x[1], y[1]));\nint cnt = 0, lastEnd = Integer.MIN_VALUE;\nfor (int[] it : a)\n    if (it[0] >= lastEnd) { cnt++; lastEnd = it[1]; }',
    build(v) {
      let iv = pairs(v.a).filter(p => p[1] > p[0]).slice(0, 14);
      if (iv.length < 2) iv = pairs(VIZ.intervals.inputs[0].def);
      const n = iv.length;
      const init = { order: range(n), st: Array(n).fill(''), sweep: null, cnt: 0 };
      const steps = [];
      const order = range(n).sort((a, b) => iv[a][1] - iv[b][1] || iv[a][0] - iv[b][0]);
      let s = clone(init);
      s.order = order;
      steps.push({ s: clone(s), text: 'Tugash vaqti bo\'yicha saraladik. Endi yuqoridan pastga bir marta o\'tamiz.' });
      let last = -Infinity;
      for (const i of order) {
        const [a, b] = iv[i];
        s.st[i] = 'cur';
        if (a >= last) {
          steps.push({ s: clone(s), text: `[${a}, ${b}): ${a} ≥ ${last === -Infinity ? '−∞' : last} — kesishmaydi.` });
          s.st[i] = 'take';
          last = b;
          s.sweep = b;
          s.cnt++;
          steps.push({ s: clone(s), text: `Olamiz. Oxirgi tugash endi ${b}. Jami: ${s.cnt}.` });
        } else {
          steps.push({ s: clone(s), text: `[${a}, ${b}): ${a} < ${last} — oxirgi tanlangan bilan kesishadi.` });
          s.st[i] = 'skip';
          steps.push({ s: clone(s), text: `Tashlaymiz. Jami o'zgarmadi: ${s.cnt}.` });
        }
      }
      const taken = order.filter(i => s.st[i] === 'take').map(i => `[${iv[i][0]}, ${iv[i][1]})`);
      return { init, steps, iv, intro: `${n} ta interval. Maqsad — kesishmaydiganlarning eng ko'pi.`, answer: `${taken.length} ta interval: ${taken.join(', ')}.`, draw: drawIntervals };
    },
  };

  function drawIntervals(m, s, opts) {
    const iv = m.iv;
    const tmin = Math.min(...iv.map(p => p[0])), tmax = Math.max(...iv.map(p => p[1]));
    const left = opts && opts.mini ? 12 : 78;
    const x = t => left + (t - tmin) / Math.max(1, tmax - tmin) * (W - left - 14);
    const rh = opts && opts.mini ? 28 : 26, top = 22;
    const H = top + s.order.length * rh + 30;
    let g = defs + axis(tmin, tmax, x, H - 26, top - 6);
    s.order.forEach((i, r) => {
      const [a, b] = iv[i];
      const y = top + r * rh;
      const st = s.st[i] || 'none';
      if (!(opts && opts.mini)) g += `<text class="rl ${st}" x="${left - 10}" y="${y + rh / 2 + 4}" text-anchor="end">[${a}, ${b})</text>`;
      g += `<rect class="ivb ${st}" x="${x(a)}" y="${y + 5}" width="${Math.max(2, x(b) - x(a))}" height="${rh - 11}" rx="2"/>`;
      if (st === 'skip') g += `<line class="strike" x1="${x(a) - 2}" x2="${x(b) + 2}" y1="${y + rh / 2}" y2="${y + rh / 2}"/>`;
    });
    if (s.sweep != null) {
      const sx = x(s.sweep), nearR = sx > W - 40;
      g += `<line class="sweep" x1="${sx}" x2="${sx}" y1="6" y2="${H - 26}"/><text class="sweep-l" x="${nearR ? sx - 6 : sx + 6}" y="14" text-anchor="${nearR ? 'end' : 'start'}">${s.sweep}</text>`;
    }
    return svg(H, g, opts && opts.mini ? 'mini' : '');
  }

  /* ---------- 2. Minimal xonalar ---------- */
  VIZ.rooms = {
    title: 'Minimal xonalar (interval partitioning)',
    lesson: 'l03',
    blurb: 'Boshlanish bo\'yicha saralab, eng erta bo\'shaydigan xonani min-heap\'dan olamiz.',
    inputs: [{ k: 'a', label: 'Tadbirlar [s, e)', def: '0-30 5-10 15-20 10-25 25-35 20-40 35-45 30-38' }],
    legend: [['take', 'joylashtirildi'], ['cur', 'joriy tadbir'], ['free', 'bo\'sh xona']],
    code: 'Arrays.sort(a, (x, y) -> Integer.compare(x[0], y[0]));\nPriorityQueue<Integer> ends = new PriorityQueue<>();\nfor (int[] it : a) {\n    if (!ends.isEmpty() && ends.peek() <= it[0]) ends.poll();\n    ends.add(it[1]);\n}',
    build(v) {
      let iv = pairs(v.a).filter(p => p[1] > p[0]).slice(0, 12);
      if (iv.length < 2) iv = pairs(VIZ.rooms.inputs[0].def);
      const order = range(iv.length).sort((a, b) => iv[a][0] - iv[b][0] || iv[a][1] - iv[b][1]);
      const init = { room: Array(iv.length).fill(-1), cur: -1, heap: [], rooms: 0, free: -1 };
      const steps = [];
      const s = clone(init);
      for (const i of order) {
        const [a, b] = iv[i];
        s.cur = i;
        s.free = -1;
        s.heap.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
        const top = s.heap[0];
        let text;
        if (top && top[0] <= a) {
          s.free = top[1];
          steps.push({ s: clone(s), text: `[${a}, ${b}): eng erta bo'shaydigan — ${top[1] + 1}-xona (${top[0]} da). ${top[0]} ≤ ${a}, demak bo'sh.` });
          s.heap.shift();
          s.room[i] = top[1];
          text = `${top[1] + 1}-xonaga joylashtiramiz, u endi ${b} da bo'shaydi.`;
        } else {
          steps.push({ s: clone(s), text: top ? `[${a}, ${b}): eng erta bo'shaydigan xona ${top[0]} da — ${a} dan kech. Bo'sh xona yo'q.` : `[${a}, ${b}): hali xona yo'q.` });
          s.room[i] = s.rooms++;
          text = `Yangi ${s.rooms}-xona ochamiz.`;
        }
        s.heap.push([b, s.room[i]]);
        s.heap.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
        s.free = -1;
        steps.push({ s: clone(s), text });
      }
      return { init, steps, iv, order, intro: `${iv.length} ta tadbir, boshlanish bo'yicha ko'rib chiqamiz.`, answer: `Minimal ${s.rooms} ta xona kerak.`, draw: drawRooms };
    },
  };

  function drawRooms(m, s) {
    const iv = m.iv;
    const tmin = Math.min(...iv.map(p => p[0])), tmax = Math.max(...iv.map(p => p[1]));
    const left = 78;
    const x = t => left + (t - tmin) / Math.max(1, tmax - tmin) * (W - left - 14);
    const needNew = s.cur >= 0 && s.room[s.cur] < 0 && s.free < 0;
    const R = Math.max(1, s.rooms + (needNew ? 1 : 0)), rh = 34, top = 10;
    const H = top + R * rh + 34;
    let g = defs + axis(tmin, tmax, x, H - 26, top);
    for (let r = 0; r < R; r++) {
      const y = top + r * rh;
      g += `<text class="rl${r === s.free ? ' free' : ''}" x="${left - 10}" y="${y + rh / 2 + 4}" text-anchor="end">${r + 1}-xona</text><line class="lane${r === s.free ? ' free' : ''}" x1="${left}" x2="${W - 14}" y1="${y + rh - 2}" y2="${y + rh - 2}"/>`;
    }
    iv.forEach(([a, b], i) => {
      const r = s.room[i];
      if (r < 0) return;
      const y = top + r * rh;
      g += `<rect class="ivb take${i === s.cur ? ' cur' : ''}" x="${x(a)}" y="${y + 6}" width="${x(b) - x(a)}" height="${rh - 14}" rx="2"/><text class="bl" x="${x(a) + 5}" y="${y + rh / 2 + 3}">${a}–${b}</text>`;
    });
    if (s.cur >= 0 && s.room[s.cur] < 0) {
      const [a, b] = iv[s.cur];
      const y = top + (s.free >= 0 ? s.free : R - 1) * rh;
      g += `<rect class="ivb cur ghost" x="${x(a)}" y="${y + 6}" width="${x(b) - x(a)}" height="${rh - 14}" rx="2"/>`;
    }
    const heap = s.heap.map(([e, r]) => `<span class="chip${r === s.free ? ' hl' : ''}">${e}<small>${r + 1}-xona</small></span>`).join('');
    return svg(H, g) + `<div class="vz-row"><span class="vz-k">Min-heap (bo'shash vaqtlari):</span>${heap || '<span class="muted">bo\'sh</span>'}</div>`;
  }

  /* ---------- 3. Tangalar: greedy vs optimal ---------- */
  VIZ.coins = {
    title: 'Tangalar: greedy va optimal',
    lesson: 'l01',
    blurb: 'Eng katta mos tangani olish qachon to\'g\'ri, qachon xato — DP bilan solishtiramiz.',
    inputs: [{ k: 'c', label: 'Tangalar', def: '1 3 4' }, { k: 'x', label: 'Summa (≤ 60)', def: '6' }],
    legend: [['take', 'greedy tangasi'], ['opt', 'optimal tanga']],
    code: 'Arrays.sort(coins);\nfor (int i = coins.length - 1; i >= 0; i--) {\n    cnt += x / coins[i];\n    x %= coins[i];\n}',
    build(v) {
      let c = [...new Set(nums(v.c).map(Math.round).filter(t => t >= 1 && t <= 60))].sort((a, b) => b - a).slice(0, 6);
      if (!c.length) c = [4, 3, 1];
      const x = clamp(parseInt(v.x, 10) || 6, 1, 60);
      const dp = Array(x + 1).fill(Infinity), pick = Array(x + 1).fill(0);
      dp[0] = 0;
      for (let s = 1; s <= x; s++) for (const k of c) if (k <= s && dp[s - k] + 1 < dp[s]) { dp[s] = dp[s - k] + 1; pick[s] = k; }
      const opt = [];
      if (dp[x] < Infinity) for (let s = x; s > 0; s -= pick[s]) opt.push(pick[s]);
      const init = { g: [], rem: x, cur: null, opt: null, verdict: null };
      const steps = [];
      const s = clone(init);
      while (s.rem > 0) {
        const k = c.find(t => t <= s.rem);
        if (!k) { steps.push({ s: clone(s), text: `Qoldiq ${s.rem} — hech bir tanga sig'maydi. Greedy tiqilib qoldi.` }); break; }
        s.cur = k;
        steps.push({ s: clone(s), text: `Qoldiq ${s.rem}. Eng katta mos tanga — ${k}.` });
        s.g.push(k);
        s.rem -= k;
        s.cur = null;
        steps.push({ s: clone(s), text: `${k} ni oldik. Qoldiq ${s.rem}.` });
      }
      s.opt = opt;
      const gOk = s.rem === 0;
      s.verdict = !gOk ? (dp[x] < Infinity ? 'bad' : 'none') : s.g.length === opt.length ? 'ok' : 'bad';
      const vt = s.verdict === 'ok' ? `Greedy ${s.g.length} ta, optimal ham ${opt.length} ta — bu holatda greedy to'g'ri.` : s.verdict === 'none' ? `${x} ni bu tangalar bilan umuman yig'ib bo'lmaydi.` : `Greedy ${gOk ? s.g.length + ' ta' : 'yig\'olmadi'}, optimal esa ${opt.length} ta (${opt.join(' + ')}). Qarshi misol topildi.`;
      steps.push({ s: clone(s), text: 'DP bilan optimal javobni hisoblaymiz…' });
      return { init, steps, x, intro: `Summa ${x}, tangalar {${c.slice().reverse().join(', ')}}.`, answer: vt, draw: drawCoins };
    },
  };

  function drawCoins(m, s) {
    const coin = (k, cls) => `<span class="coin${cls ? ' ' + cls : ''}">${k}</span>`;
    let h = `<div class="cv-row"><span class="vz-k">Greedy</span><div class="coins">${s.g.map(k => coin(k)).join('')}${s.cur ? coin(s.cur, 'ghost') : ''}</div><span class="cv-rem">qoldiq <b>${s.rem}</b></span></div>`;
    h += `<div class="cv-row${s.opt ? '' : ' dim'}"><span class="vz-k">Optimal</span><div class="coins">${s.opt ? s.opt.map(k => coin(k, 'oc')).join('') || '<span class="muted">—</span>' : '<span class="muted">oxirida ko\'rinadi</span>'}</div><span class="cv-rem">${s.opt ? `<b>${s.opt.length}</b> ta` : ''}</span></div>`;
    if (s.verdict) h += `<p class="verdict ${s.verdict}">${s.verdict === 'ok' ? 'Greedy optimal' : s.verdict === 'none' ? 'Yechim yo\'q' : 'Greedy xato'}</p>`;
    return `<div class="coins-viz">${h}</div>`;
  }

  /* ---------- 4. Fractional knapsack ---------- */
  VIZ.frac = {
    title: 'Fractional knapsack',
    lesson: 'l04',
    blurb: 'Bir birlik og\'irlik eng qimmat bo\'lgan buyumdan boshlab sumkani to\'ldiramiz.',
    inputs: [{ k: 'w', label: 'Og\'irliklar', def: '10 20 30 15' }, { k: 'v', label: 'Qiymatlar', def: '60 100 120 45' }, { k: 'W', label: 'Sig\'im W', def: '50' }],
    legend: [['take', 'to\'liq olindi'], ['part', 'qisman'], ['skip', 'sig\'madi']],
    code: 'Arrays.sort(it, (x, y) -> Long.compare(y.v * x.w, x.v * y.w));\nfor (Item b : it) {\n    long take = Math.min(cap, b.w);\n    total += (double) b.v * take / b.w;\n    cap -= take;\n}',
    build(v) {
      let w = nums(v.w).map(Math.round).filter(t => t > 0).slice(0, 6), val = nums(v.v).map(Math.round).slice(0, 6);
      const n0 = Math.min(w.length, val.length);
      if (!n0) { w = [10, 20, 30, 15]; val = [60, 100, 120, 45]; } else { w = w.slice(0, n0); val = val.slice(0, n0); }
      const Wc = clamp(parseInt(v.W, 10) || 50, 1, 1000);
      const order = range(w.length).sort((a, b) => val[b] * w[a] - val[a] * w[b]);
      const init = { order: range(w.length), taken: Array(w.length).fill(0), cap: Wc, cur: -1, total: 0, sorted: false };
      const steps = [];
      const s = clone(init);
      s.order = order;
      s.sorted = true;
      steps.push({ s: clone(s), text: `Nisbat v/w bo'yicha kamayish tartibida saraladik: ${order.map(i => (val[i] / w[i]).toFixed(2)).join(' ≥ ')}.` });
      for (const i of order) {
        s.cur = i;
        if (s.cap === 0) { steps.push({ s: clone(s), text: `Sumka to'la — #${i + 1} ga joy yo'q.` }); continue; }
        const t = Math.min(s.cap, w[i]);
        s.taken[i] = t;
        s.cap -= t;
        s.total += val[i] * t / w[i];
        steps.push({ s: clone(s), text: t === w[i] ? `#${i + 1} (w=${w[i]}, v=${val[i]}) to'liq olindi. Qolgan sig'im ${s.cap}.` : `#${i + 1} dan faqat ${t}/${w[i]} qismi sig'di: +${(val[i] * t / w[i]).toFixed(2)}. Sumka to'ldi.` });
      }
      s.cur = -1;
      return { init, steps, w, val, Wc, intro: `Sig'im ${Wc}. Buyumlarni bo'lib olish mumkin.`, answer: `Maksimal qiymat: ${s.total.toFixed(2)}.`, draw: drawFrac };
    },
  };

  function drawFrac(m, s) {
    const { w, val, Wc } = m;
    const L = 20, R = W - 20, x = t => L + t / Wc * (R - L);
    let g = `<rect class="sack" x="${L}" y="16" width="${R - L}" height="40" rx="3"/>`;
    let off = 0;
    s.order.forEach(i => {
      if (!s.taken[i]) return;
      const part = s.taken[i] < w[i];
      g += `<rect class="fseg${part ? ' part' : ''}${i === s.cur ? ' cur' : ''}" x="${x(off)}" y="16" width="${x(off + s.taken[i]) - x(off)}" height="40"/><text class="bl" x="${x(off) + 6}" y="40">#${i + 1}${part ? ' (qism)' : ''}</text>`;
      off += s.taken[i];
    });
    g += `<text class="tl" x="${L}" y="74">0</text><text class="tl" x="${R}" y="74" text-anchor="end">W = ${Wc}</text>`;
    const rows = s.order.map(i => {
      const st = s.taken[i] === w[i] ? 'take' : s.taken[i] > 0 ? 'part' : s.sorted && s.cur !== -1 && s.order.indexOf(i) < s.order.indexOf(s.cur) ? 'skip' : '';
      return `<tr class="${st}${i === s.cur ? ' cur' : ''}"><td>#${i + 1}</td><td>${w[i]}</td><td>${val[i]}</td><td>${(val[i] / w[i]).toFixed(2)}</td><td>${s.taken[i] ? s.taken[i] + '/' + w[i] : '—'}</td></tr>`;
    }).join('');
    return svg(84, g) + `<table class="vz-table"><thead><tr><th>Buyum</th><th>w</th><th>v</th><th>v/w</th><th>olindi</th></tr></thead><tbody>${rows}</tbody></table><p class="vz-sum">Jami qiymat: <b>${s.total.toFixed(2)}</b></p>`;
  }

  /* ---------- 5. Huffman ---------- */
  VIZ.huffman = {
    title: 'Huffman: arqonlarni ulash',
    lesson: 'l06',
    blurb: 'Min-heap\'dan har safar ikki eng kichigini olib, yig\'indisini qaytaramiz.',
    inputs: [{ k: 'a', label: 'Uzunliklar (≤ 10 ta)', def: '4 3 2 6 8 1' }],
    legend: [['cur', 'olinayotgan ikkitasi'], ['new', 'yangi arqon']],
    code: 'while (pq.size() > 1) {\n    long s = pq.poll() + pq.poll();\n    cost += s;\n    pq.add(s);\n}',
    build(v) {
      let a = nums(v.a).map(Math.round).filter(t => t > 0).slice(0, 10);
      if (a.length < 2) a = [4, 3, 2, 6, 8, 1];
      const init = { heap: a.slice().sort((p, q) => p - q), pick: 0, made: null, cost: 0, hist: [] };
      const steps = [];
      const s = clone(init);
      while (s.heap.length > 1) {
        s.pick = 2;
        s.made = null;
        steps.push({ s: clone(s), text: `Heap'dagi ikki eng kichik: ${s.heap[0]} va ${s.heap[1]}.` });
        const x = s.heap.shift(), y = s.heap.shift();
        const z = x + y;
        s.cost += z;
        s.hist.push([x, y, z, s.cost]);
        s.heap.push(z);
        s.heap.sort((p, q) => p - q);
        s.pick = 0;
        s.made = z;
        steps.push({ s: clone(s), text: `${x} + ${y} = ${z}. Narxga ${z} qo'shildi, jami ${s.cost}. ${z} heap'ga qaytdi.` });
      }
      return { init, steps, intro: `${a.length} ta arqon. Heap: ${init.heap.join(', ')}.`, answer: `Minimal umumiy narx: ${s.cost}.`, draw: drawHuff };
    },
  };

  function drawHuff(m, s) {
    let madeShown = false;
    const chips = s.heap.map((x, i) => {
      let cls = i < s.pick ? ' hl' : '';
      if (!madeShown && s.made === x) { cls += ' new'; madeShown = true; }
      return `<span class="chip big${cls}">${x}</span>`;
    }).join('');
    const hist = s.hist.map(([x, y, z, c], i) => `<li${i === s.hist.length - 1 && s.made ? ' class="last"' : ''}><span>${x} + ${y} = <b>${z}</b></span><span class="muted">jami ${c}</span></li>`).join('');
    return `<div class="vz-row"><span class="vz-k">Min-heap</span>${chips}</div><p class="vz-sum">Umumiy narx: <b>${s.cost}</b></p>${hist ? `<ol class="vz-hist">${hist}</ol>` : ''}`;
  }

  /* ---------- 6. Jump Game II ---------- */
  VIZ.jump = {
    title: 'Jump Game II — qatlamlar',
    lesson: 'l09',
    blurb: 'Joriy qatlam oxiriga yetganda sakraymiz; keyingi qatlam — hozirgacha topilgan eng uzoq nuqta.',
    inputs: [{ k: 'a', label: 'a[i] (≤ 14 ta)', def: '2 3 1 1 4 2 1 3 1 1' }],
    legend: [['cur', 'i'], ['layer', 'joriy qatlam'], ['far', 'eng uzoq yetish']],
    code: 'for (int i = 0; i < n - 1; i++) {\n    far = Math.max(far, i + a[i]);\n    if (i == curEnd) { jumps++; curEnd = far; }\n}',
    build(v) {
      let a = nums(v.a).map(t => clamp(Math.round(t), 0, 9)).slice(0, 14);
      if (a.length < 2) a = [2, 3, 1, 1, 4, 2, 1, 3, 1, 1];
      const n = a.length;
      const init = { i: -1, far: 0, curEnd: 0, layerStart: 0, jumps: 0, lvl: Array(n).fill(-1), stuck: false };
      init.lvl[0] = 0;
      const steps = [];
      const s = clone(init);
      for (let i = 0; i < n - 1; i++) {
        if (i > s.far) { s.stuck = true; steps.push({ s: clone(s), text: `${i}-indeksga yetib bo'lmaydi — oxirgisi ham yetilmaydi.` }); break; }
        s.i = i;
        const nf = Math.max(s.far, i + a[i]);
        const txt = `i = ${i}: i + a[i] = ${i + a[i]}, eng uzoq = ${nf}.`;
        s.far = nf;
        if (i === s.curEnd) {
          s.jumps++;
          for (let j = s.curEnd + 1; j <= Math.min(n - 1, s.far); j++) s.lvl[j] = s.jumps;
          s.layerStart = s.curEnd + 1;
          s.curEnd = s.far;
          steps.push({ s: clone(s), text: `${txt} Qatlam oxiriga yetdik → sakrash #${s.jumps}, yangi qatlam [${s.layerStart}, ${Math.min(n - 1, s.curEnd)}].` });
          if (s.curEnd >= n - 1) break;
        } else steps.push({ s: clone(s), text: txt });
      }
      s.i = -1;
      return { init, steps, a, intro: `${n} ta pozitsiya, 0 dan ${n - 1} gacha.`, answer: s.stuck || s.far < n - 1 ? 'Oxirigacha yetib bo\'lmaydi.' : `Minimal sakrashlar: ${s.jumps}.`, draw: drawJump };
    },
  };

  function drawJump(m, s) {
    const a = m.a, n = a.length;
    const cw = Math.min(56, (W - 40) / n), L = (W - cw * n) / 2, top = 34;
    let g = '';
    for (let i = 0; i < n; i++) {
      const x = L + i * cw;
      const inLayer = s.lvl[i] >= 0;
      const cls = [inLayer ? 'l' + (s.lvl[i] % 2) : '', i === s.i ? 'cur' : '', i > s.curEnd && i <= s.far ? 'next' : ''].join(' ');
      g += `<rect class="cell ${cls}" x="${x + 2}" y="${top}" width="${cw - 4}" height="${cw - 4}" rx="3"/><text class="cv" x="${x + cw / 2}" y="${top + cw / 2 + 4}" text-anchor="middle">${a[i]}</text><text class="tl" x="${x + cw / 2}" y="${top + cw + 12}" text-anchor="middle">${i}</text>`;
      if (inLayer) g += `<text class="lv" x="${x + cw / 2}" y="${top - 8}" text-anchor="middle">${s.lvl[i]}</text>`;
    }
    if (s.i >= 0) {
      const x1 = L + s.i * cw + cw / 2, x2 = L + Math.min(n - 1, s.i + a[s.i]) * cw + cw / 2;
      if (x2 > x1) g += `<path class="arc" d="M${x1} ${top + cw + 18} Q ${(x1 + x2) / 2} ${top + cw + 18 + Math.min(46, (x2 - x1) / 2)} ${x2} ${top + cw + 18}"/>`;
    }
    const fx = L + Math.min(n - 1, s.far) * cw;
    g += `<rect class="farbox" x="${fx + 1}" y="${top - 1}" width="${cw - 2}" height="${cw - 2}" rx="4"/>`;
    return svg(top + cw + 72, g) + `<div class="vz-row"><span class="vz-k">Sakrashlar</span><b class="big-n">${s.jumps}</b><span class="vz-k">qatlam oxiri</span><b class="big-n">${Math.min(n - 1, s.curEnd)}</b><span class="vz-k">eng uzoq</span><b class="big-n">${Math.min(n - 1, s.far)}</b></div>`;
  }

  /* ---------- 7. Monoton stek ---------- */
  VIZ.stack = {
    title: 'Remove K Digits — monoton stek',
    lesson: 'l10',
    blurb: 'Kichikroq raqam kelganda, stek tepasidagi kattaroq raqamni o\'chiramiz — chapdagi pozitsiya kichrayadi.',
    inputs: [{ k: 'num', label: 'Son', def: '1432219' }, { k: 'k', label: 'k', def: '3' }],
    legend: [['cur', 'joriy raqam'], ['skip', 'o\'chirildi'], ['take', 'stekda']],
    code: 'for (char c : num.toCharArray()) {\n    while (k > 0 && st.length() > 0 && last(st) > c) { pop(st); k--; }\n    st.append(c);\n}\nst.setLength(st.length() - k);',
    build(v) {
      let num = String(v.num).replace(/\D/g, '').slice(0, 14);
      if (!num) num = '1432219';
      let k = clamp(parseInt(v.k, 10) || 1, 1, num.length);
      const init = { i: -1, st: [], del: [], k, tail: false };
      const steps = [];
      const s = clone(init);
      for (let i = 0; i < num.length; i++) {
        s.i = i;
        const c = num[i];
        while (s.k > 0 && s.st.length && num[s.st[s.st.length - 1]] > c) {
          const top = s.st.pop();
          s.del.push(top);
          s.k--;
          steps.push({ s: clone(s), text: `'${c}' < tepadagi '${num[top]}' → '${num[top]}' ni o'chiramiz. Qolgan k = ${s.k}.` });
        }
        s.st.push(i);
        steps.push({ s: clone(s), text: `'${c}' ni stekka qo'shamiz.` });
      }
      while (s.k > 0) {
        const top = s.st.pop();
        s.del.push(top);
        s.k--;
        s.tail = true;
        steps.push({ s: clone(s), text: `Oxirida k = ${s.k + 1} qoldi — eng o'ngdagi '${num[top]}' ni kesamiz.` });
      }
      s.i = -1;
      const res = s.st.map(i => num[i]).join('').replace(/^0+(?=.)/, '') || '0';
      return { init, steps, num, intro: `${num} dan ${k} ta raqam o'chiriladi.`, answer: `Natija: ${res}.`, draw: drawStack };
    },
  };

  function drawStack(m, s) {
    const num = m.num;
    const cells = num.split('').map((c, i) => `<span class="dg${i === s.i ? ' cur' : ''}${s.del.includes(i) ? ' del' : ''}${s.st.includes(i) ? ' in' : ''}">${c}<small>${i}</small></span>`).join('');
    const stack = s.st.map(i => `<span class="chip big">${num[i]}</span>`).join('');
    return `<div class="vz-row digits">${cells}</div><div class="vz-row"><span class="vz-k">Stek (chapdan o'ngga — pastdan tepaga)</span>${stack || '<span class="muted">bo\'sh</span>'}</div><p class="vz-sum">Qolgan o'chirishlar: <b>${s.k}</b></p>`;
  }

  /* ---------- graf yordamchilari ---------- */
  const GW = 480;
  function layout(n) {
    const cx = GW / 2, cy = 172, r = 135;
    return range(n).map(i => {
      const t = -Math.PI / 2 + i * 2 * Math.PI / n;
      return [cx + r * 1.25 * Math.cos(t), cy + r * Math.sin(t)];
    });
  }
  function drawGraph(n, edges, pos, edgeCls, nodeCls, nodeLabel) {
    let g = '';
    edges.forEach((e, k) => {
      const [u, v, w] = e;
      const [x1, y1] = pos[u], [x2, y2] = pos[v];
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      g += `<line class="edge ${edgeCls(k)}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><rect class="wbg ${edgeCls(k)}" x="${mx - 12}" y="${my - 10}" width="24" height="18" rx="3"/><text class="wl ${edgeCls(k)}" x="${mx}" y="${my + 3}" text-anchor="middle">${w}</text>`;
    });
    pos.forEach(([x, y], i) => {
      g += `<circle class="node ${nodeCls(i)}" cx="${x}" cy="${y}" r="18"/><text class="nl" x="${x}" y="${y + 5}" text-anchor="middle">${i + 1}</text>`;
      const lb = nodeLabel ? nodeLabel(i) : '';
      if (lb !== '') g += `<text class="nd ${nodeCls(i)}" x="${x}" y="${y - 25}" text-anchor="middle">${lb}</text>`;
    });
    return svg(350, g, 'graph', GW);
  }
  function parseGraph(str, def) {
    let e = triples(str).map(t => [Math.round(t[0]) - 1, Math.round(t[1]) - 1, Math.round(t[2])]).filter(t => t[0] >= 0 && t[1] >= 0 && t[0] !== t[1] && t[0] < 9 && t[1] < 9);
    if (!e.length) e = triples(def).map(t => [t[0] - 1, t[1] - 1, t[2]]);
    e = e.slice(0, 16);
    const n = Math.max(...e.map(t => Math.max(t[0], t[1]))) + 1;
    return { n, e };
  }

  /* ---------- 8. Kruskal ---------- */
  VIZ.kruskal = {
    title: 'Kruskal — minimal spanning tree',
    lesson: 'l11',
    blurb: 'Qirralar yengildan og\'irga; sikl hosil qilmaydiganini olamiz (DSU).',
    inputs: [{ k: 'e', label: 'Qirralar "u v w" (≤ 9 tugun)', def: '1 2 3, 2 3 5, 2 4 2, 3 4 8, 5 1 7, 5 4 4, 1 3 6', area: true }],
    legend: [['take', 'MST qirrasi'], ['skip', 'sikl — tashlandi'], ['cur', 'joriy qirra']],
    code: 'Arrays.sort(e, (x, y) -> Integer.compare(x[2], y[2]));\nfor (int[] ed : e)\n    if (union(ed[0], ed[1])) total += ed[2];',
    build(v) {
      const { n, e } = parseGraph(v.e, VIZ.kruskal.inputs[0].def);
      const order = range(e.length).sort((a, b) => e[a][2] - e[b][2]);
      const par = range(n);
      const find = x => { while (par[x] !== x) x = par[x]; return x; };
      const init = { st: Array(e.length).fill(''), comp: range(n), total: 0, cur: -1, order: range(e.length) };
      const steps = [];
      const s = clone(init);
      s.order = order;
      steps.push({ s: clone(s), text: `Qirralarni og'irlik bo'yicha saraladik: ${order.map(k => e[k][2]).join(', ')}.` });
      for (const k of order) {
        const [u, w2, w] = e[k];
        s.cur = k;
        s.st[k] = 'cur';
        const a = find(u), b = find(w2);
        steps.push({ s: clone(s), text: `Qirra ${u + 1}–${w2 + 1} (${w}): ${a === b ? 'ikkala uchi bitta komponentda.' : 'uchlari har xil komponentda.'}` });
        if (a === b) {
          s.st[k] = 'skip';
          steps.push({ s: clone(s), text: 'Sikl hosil qiladi — tashlaymiz.' });
        } else {
          par[b] = a;
          s.st[k] = 'take';
          s.total += w;
          s.comp = range(n).map(find);
          steps.push({ s: clone(s), text: `Olamiz, komponentlar birlashdi. Jami: ${s.total}.` });
        }
      }
      s.cur = -1;
      const used = s.st.filter(x => x === 'take').length;
      return { init, steps, n, e, pos: layout(n), intro: `${n} ta tugun, ${e.length} ta qirra.`, answer: used === n - 1 ? `MST og'irligi: ${s.total} (${used} ta qirra).` : `Graf bog'lanmagan: ${used} ta qirra, o'rmon og'irligi ${s.total}.`, draw: drawKruskal };
    },
  };

  const PALETTE = 8;
  function drawKruskal(m, s) {
    const roots = [...new Set(s.comp)];
    const g = drawGraph(m.n, m.e, m.pos, k => s.st[k] || '', i => {
      const size = s.comp.filter(c => c === s.comp[i]).length;
      return size > 1 ? 'c' + (roots.indexOf(s.comp[i]) % PALETTE) : '';
    });
    const list = s.order.map(k => `<span class="chip ${s.st[k] || ''}">${m.e[k][0] + 1}–${m.e[k][1] + 1}<small>${m.e[k][2]}</small></span>`).join('');
    return g + `<div class="vz-row wrap"><span class="vz-k">Qirralar</span>${list}</div><p class="vz-sum">MST og'irligi: <b>${s.total}</b></p>`;
  }

  /* ---------- 9. Dijkstra ---------- */
  VIZ.dijkstra = {
    title: 'Dijkstra — eng yaqinini birinchi',
    lesson: 'l12',
    blurb: 'Heap\'dan eng kichik masofali tugunni olib yakunlaymiz va qo\'shnilarini yangilaymiz.',
    inputs: [{ k: 'e', label: 'Qirralar "u v w" (yo\'naltirilmagan)', def: '1 2 7, 1 3 9, 1 6 14, 2 3 10, 2 4 15, 3 4 11, 3 6 2, 4 5 6, 5 6 9', area: true }, { k: 's', label: 'Manba', def: '1' }],
    legend: [['done', 'yakunlangan'], ['cur', 'joriy tugun'], ['relax', 'yangilangan qirra']],
    code: 'long[] cur = pq.poll();\nif (cur[0] > dist[v]) continue;\nfor (Edge e : adj[v])\n    if (dist[v] + e.w < dist[e.to]) {\n        dist[e.to] = dist[v] + e.w;\n        pq.add(new long[]{dist[e.to], e.to});\n    }',
    build(v) {
      const { n, e } = parseGraph(v.e, VIZ.dijkstra.inputs[0].def);
      const src = clamp((parseInt(v.s, 10) || 1) - 1, 0, n - 1);
      const adj = range(n).map(() => []);
      e.forEach(([a, b, w], k) => { adj[a].push([b, w, k]); adj[b].push([a, w, k]); });
      const init = { dist: Array(n).fill(null), done: Array(n).fill(false), cur: -1, edge: -1, ok: -1, heap: [], tree: Array(e.length).fill(false) };
      init.dist[src] = 0;
      init.heap = [[0, src]];
      const parEdge = Array(n).fill(-1);
      const steps = [];
      const s = clone(init);
      while (s.heap.length) {
        s.heap.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
        const [d, u] = s.heap.shift();
        s.edge = -1;
        if (s.done[u] || d > s.dist[u]) {
          s.cur = -1;
          steps.push({ s: clone(s), text: `Heap'dan (${d}, ${u + 1}) — eskirgan yozuv, tashlaymiz.` });
          continue;
        }
        s.cur = u;
        s.done[u] = true;
        if (parEdge[u] >= 0) s.tree[parEdge[u]] = true;
        steps.push({ s: clone(s), text: `Heap'dagi eng kichik: ${u + 1}-tugun, masofa ${d}. Uni yakunlaymiz.` });
        for (const [to, w, k] of adj[u]) {
          if (s.done[to]) continue;
          s.edge = k;
          const nd = d + w;
          if (s.dist[to] === null || nd < s.dist[to]) {
            const old = s.dist[to];
            s.dist[to] = nd;
            parEdge[to] = k;
            s.heap.push([nd, to]);
            s.ok = 1;
            steps.push({ s: clone(s), text: `${u + 1} → ${to + 1}: ${d} + ${w} = ${nd} < ${old === null ? '∞' : old} → yangilaymiz.` });
          } else {
            s.ok = 0;
            steps.push({ s: clone(s), text: `${u + 1} → ${to + 1}: ${d} + ${w} = ${nd} ≥ ${s.dist[to]} → o'zgarmaydi.` });
          }
        }
      }
      s.cur = -1;
      s.edge = -1;
      return { init, steps, n, e, src, pos: layout(n), intro: `Manba — ${src + 1}-tugun.`, answer: `Masofalar: ${s.dist.map((d, i) => `${i + 1}: ${d === null ? '∞' : d}`).join(', ')}.`, draw: drawDijkstra };
    },
  };

  function drawDijkstra(m, s) {
    const g = drawGraph(m.n, m.e, m.pos, k => (k === s.edge ? (s.ok ? 'relax' : 'cur') : s.tree[k] ? 'take' : ''), i => (i === s.cur ? 'cur' : s.done[i] ? 'done' : ''), i => (s.dist[i] === null ? '∞' : s.dist[i]));
    const heap = s.heap.slice().sort((p, q) => p[0] - q[0]).map(([d, u]) => `<span class="chip">${d}<small>${u + 1}</small></span>`).join('');
    return g + `<div class="vz-row wrap"><span class="vz-k">Heap (masofa, tugun)</span>${heap || '<span class="muted">bo\'sh</span>'}</div>`;
  }

  /* ---------- player ---------- */
  class Player {
    constructor(host, model, opts) {
      this.host = host;
      this.m = model;
      this.o = Object.assign({ speed: 600, mini: false, onFinish: null, onStep: null }, opts || {});
      this.k = 0;
      this.timer = null;
      this.finished = false;
      this.go(0);
    }

    state(k) { return k === 0 ? this.m.init : this.m.steps[k - 1].s; }

    go(k) {
      k = clamp(k, 0, this.m.steps.length);
      this.k = k;
      const done = k === this.m.steps.length;
      this.host.innerHTML = this.m.draw(this.m, this.state(k), { mini: this.o.mini });
      this.host.classList.toggle('done', done);
      if (done) {
        if (!this.finished) { this.finished = true; if (this.o.onFinish) this.o.onFinish(); }
        this.pause();
      }
      if (this.o.onStep) this.o.onStep(k, k > 0 ? this.m.steps[k - 1] : null, done);
    }

    next() { this.go(this.k + 1); }
    prev() { this.pause(); this.go(this.k - 1); }
    end() { this.pause(); this.go(this.m.steps.length); }
    reset() { this.pause(); this.go(0); }
    get playing() { return !!this.timer; }

    play() {
      if (this.timer) return;
      if (this.k >= this.m.steps.length) this.go(0);
      this.timer = setInterval(() => this.next(), this.o.speed);
      if (this.o.onStep) this.o.onStep(this.k, this.k > 0 ? this.m.steps[this.k - 1] : null, false, true);
    }

    pause() {
      if (!this.timer) return;
      clearInterval(this.timer);
      this.timer = null;
      if (this.o.onStep) this.o.onStep(this.k, this.k > 0 ? this.m.steps[this.k - 1] : null, this.k === this.m.steps.length, false);
    }

    setSpeed(ms) {
      this.o.speed = ms;
      if (this.timer) { clearInterval(this.timer); this.timer = setInterval(() => this.next(), ms); }
    }

    destroy() { this.pause(); }
  }

  window.VIZ = VIZ;
  window.VizPlayer = Player;
})();
