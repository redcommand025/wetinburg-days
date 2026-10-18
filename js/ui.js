/* Wetinburg Days — UI: scene system, sidebar, paperdoll, menus, save/load */
(function (G) {
'use strict';
const D = G.DATA;
const $ = (s) => document.querySelector(s);
G.$ = $;

/* ---------- scene system ---------- */
let buf = [], chs = [];
G._gen = 0;
G.say = (h) => { if (!h) return; h = G.ptext(G._ctx, h); buf.push(h.startsWith('<') ? h : '<p>' + h + '</p>'); };
G.hr = (t) => buf.push(`<h3 class="sub">${t}</h3>`);
G.ch = (label, fn, o) => chs.push({ label: G.ptext(G._ctx, label), fn, o: o || {} });
G.goto = function (fn) {
  G._gen++; buf = []; chs = []; G._cur = fn;
  try { fn(); } catch (e) { console.error(e); buf.push('<p class="err">Something went wrong in this scene. You blink, and find yourself back on track.</p>'); chs = []; G.ch('Continue', () => G.goto(G.here)); G.lastError = e; }
  if (!chs.length) G.ch('Continue', () => G.goto(G.here));
  G.render();
};
G.result = function (html, next, label) { G.goto(() => { G.say(html); G.ch(label || 'Continue', next || (() => G.goto(G.here))); }); };
G.choose = function (i) {
  const c = chs[i]; if (!c || c.o.req === false) return;
  const gen = G._gen;
  try { c.fn(); } catch (e) { console.error(e); G.lastError = e; }
  if (G._gen === gen) G.goto(G.here);
  if (G.S && G.S.settings.autosave && G.S.started) G.autosave();
};
G.render = function () {
  const p = $('#passage'), c = $('#choices');
  if (!p) return;
  let notes = '';
  if (G._notes.length) {
    const seen = {};
    const ns = G._notes.filter(n => { if (seen[n.text]) return false; seen[n.text] = 1; return true; }).slice(0, 14);
    notes = '<div class="notes">' + ns.map(n => `<span class="note ${n.kind}">${G.esc(n.text)}</span>`).join('') + '</div>';
    G._notes = [];
  }
  p.innerHTML = notes + buf.join('');
  c.innerHTML = '';
  chs.forEach((ch, i) => {
    const b = document.createElement('button');
    b.className = 'choice' + (ch.o.cls ? ' ' + ch.o.cls : '') + (ch.o.req === false ? ' locked' : '');
    let meta = '';
    if (ch.o.time) meta += `<span class="meta">${ch.o.time >= 60 ? (Math.floor(ch.o.time / 60) + 'h' + (ch.o.time % 60 ? ch.o.time % 60 + 'm' : '')) : ch.o.time + 'm'}</span>`;
    if (ch.o.cost) meta += `<span class="meta cost">${G.money(ch.o.cost)}</span>`;
    if (ch.o.req === false && ch.o.why) meta += `<span class="meta why">${G.esc(ch.o.why)}</span>`;
    b.innerHTML = `<span class="lbl">${ch.label}</span>${meta}`;
    if (ch.o.tip) b.title = ch.o.tip;
    b.disabled = ch.o.req === false;
    b.dataset.idx = i;
    b.addEventListener('click', () => G.choose(i));
    c.appendChild(b);
  });
  p.scrollTop = 0; const main = $('#main'); if (main) main.scrollTop = 0;
  G.renderSidebar();
};
G.choiceCount = () => chs.length;

/* ---------- sidebar ---------- */
function bar(label, val, cls, invert, text) {
  const v = Math.round(val);
  const lvl = invert ? (v > 70 ? 'bad' : v > 40 ? 'mid' : 'good') : (v < 30 ? 'bad' : v < 60 ? 'mid' : 'good');
  return `<div class="bar ${cls}"><div class="bl"><span>${label}</span><span>${text || v}</span></div><div class="track"><div class="fill ${lvl}" style="width:${G.clamp(v, 0, 100)}%"></div></div></div>`;
}
G.condWord = {
  hunger: (v) => v < 20 ? 'Full' : v < 45 ? 'Fine' : v < 70 ? 'Peckish' : v < 90 ? 'Hungry' : 'Starving',
  stamina: (v) => v > 75 ? 'Energetic' : v > 50 ? 'Okay' : v > 25 ? 'Tired' : v > 10 ? 'Exhausted' : 'Dead on your feet',
  stress: (v) => v < 20 ? 'Calm' : v < 45 ? 'Uneasy' : v < 70 ? 'Stressed' : 'Overwhelmed',
  mood: (v) => v > 75 ? 'Joyful' : v > 55 ? 'Content' : v > 35 ? 'Meh' : v > 20 ? 'Down' : 'Miserable',
  hygiene: (v) => v > 75 ? 'Fresh' : v > 50 ? 'Clean' : v > 25 ? 'Grubby' : 'Filthy',
  health: (v) => v > 80 ? 'Healthy' : v > 50 ? 'Okay' : v > 25 ? 'Hurt' : 'Critical',
};
G.renderSidebar = function () {
  const S = G.S; const sb = $('#sidebar'); if (!S || !sb) return;
  const w = G.weather(), W = G.WEATHER[w.type];
  const loc = D.LOCATIONS[S.loc];
  const sp = G.specialDay();
  const per = G.School && G.School.periodNow();
  const cond = S.cond;
  sb.innerHTML = `
  <div class="clock ${G.isDark() ? 'night' : 'day'}">
    <div class="time">${G.timeStr()}</div>
    <div class="date">${G.dateStr()}</div>
    <div class="wx"><span class="wxi">${G.isDark() && w.type === 'sunny' ? '🌙' : W.icon}</span> ${W.name}, ${w.temp}°C · ${G.cap(G.phase())}</div>
    ${sp ? `<div class="special">🎉 ${G.SPECIAL_NAMES[sp]}</div>` : ''}
    ${G.isSchoolDay() && per ? `<div class="period">🏫 ${per.name}${per.subj ? ': ' + D.SUBJECTS[per.subj].name : ''}</div>` : (G.holiday() ? '<div class="period">🏖️ School holiday</div>' : '')}
  </div>
  <div class="locname">${loc.icon || ''} ${loc.name}</div>
  <div class="doll-wrap" title="Click to open your Characteristics">${G.paperdoll(S.player, 170)}</div>
  <div class="pname">${G.pn()} <small>· ${S.player.age} · ${S.player.pron}/${G.PR[S.player.pron].him}</small></div>
  <div class="moneyline">💷 <b>${G.money(S.money)}</b>${S.record.unpaid ? ` <span class="warn">owes ${G.money(S.record.unpaid)}</span>` : ''}</div>
  <div class="bars">
    ${bar('Health', cond.health, 'health', false, G.condWord.health(cond.health))}
    ${bar('Stamina', cond.stamina, 'stamina', false, G.condWord.stamina(cond.stamina))}
    ${bar('Stress', cond.stress, 'stress', true, G.condWord.stress(cond.stress))}
    ${bar('Mood', cond.mood, 'mood', false, G.condWord.mood(cond.mood))}
    ${bar('Hunger', cond.hunger, 'hunger', true, G.condWord.hunger(cond.hunger))}
    ${bar('Hygiene', cond.hygiene, 'hygiene', false, G.condWord.hygiene(cond.hygiene))}
    ${bar('Reputation', cond.rep, 'rep')}
    ${bar('School rep', cond.schoolRep, 'srep')}
  </div>
  ${S.ill.cold ? '<div class="status-ill">🤧 You have a cold</div>' : ''}
  ${G.partner() ? `<div class="status-love">💕 Dating ${G.nm(G.partner())}</div>` : ''}`;
  const dw = sb.querySelector('.doll-wrap'); if (dw) dw.onclick = () => G.menu('stats');
};

/* ---------- paperdoll ---------- */
G.paperdoll = function (P, width, opts) {
  opts = opts || {};
  const L = P.look; const skin = D.SKIN_TONES[L.skin] || '#e5b896', hair = D.HAIR_COLORS[L.hairColor] || '#6b4423', eye = D.EYE_COLORS[L.eyes] || '#5b3a1e';
  const C = (id) => D.CLOTHES[id];
  const w = P.worn; const tf = P.transforms || [];
  const top = w.full ? null : C(w.top), bot = w.full ? null : C(w.bottom), full = w.full ? C(w.full) : null;
  const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; r = Math.round(G.clamp(r * f, 0, 255)); g = Math.round(G.clamp(g * f, 0, 255)); b = Math.round(G.clamp(b * f, 0, 255)); return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); };
  const out = [];
  out.push(`<svg class="doll" viewBox="0 0 200 320" width="${width}" height="${width * 1.6}" xmlns="http://www.w3.org/2000/svg">`);
  // height & build: scale the whole (always-clothed) figure, anchored at the feet
  const hy = D.HEIGHTS[L.height] || D.HEIGHTS.average, bx = (D.BUILDS[L.build] || 1) * (hy < 0.9 ? 0.97 : 1);
  out.push(`<g transform="translate(100 304) scale(${(bx * hy / 0.95).toFixed(3)} ${hy.toFixed(3)}) translate(-100 -304)">`);
  // back: wings & tails
  if (tf.includes('angel')) out.push(`<g opacity=".95"><path d="M70 115 C30 90 20 140 40 165 C50 150 60 140 72 135Z" fill="#fff" stroke="#ddd"/><path d="M130 115 C170 90 180 140 160 165 C150 150 140 140 128 135Z" fill="#fff" stroke="#ddd"/></g>`);
  if (tf.includes('wings')) out.push(`<g opacity=".75"><path d="M72 120 C20 70 10 130 50 150 C20 170 50 200 74 150Z" fill="#9be7ff" stroke="#c77dff" stroke-width="2"/><path d="M128 120 C180 70 190 130 150 150 C180 170 150 200 126 150Z" fill="#9be7ff" stroke="#c77dff" stroke-width="2"/></g>`);
  if (tf.includes('fox')) out.push(`<path d="M120 195 C170 200 185 150 160 130 C175 170 140 185 118 185Z" fill="#e07a2f" stroke="#b5561b"/><path d="M160 130 C172 140 172 152 166 160 C160 150 158 140 160 130Z" fill="#fff"/>`);
  if (tf.includes('cat')) out.push(`<path d="M118 195 C150 200 160 170 150 145" stroke="${hair}" stroke-width="7" fill="none" stroke-linecap="round"/>`);
  if (tf.includes('demon')) out.push(`<path d="M118 195 C150 205 165 185 158 165" stroke="#5a1a2a" stroke-width="4" fill="none"/><path d="M152 160 L166 158 L160 172Z" fill="#5a1a2a"/>`);
  // back hair
  const longBack = { long: `<path d="M66 50 C60 120 70 150 78 160 L122 160 C130 150 140 120 134 50Z" fill="${hair}"/>`, braids: `<path d="M70 70 L66 160" stroke="${hair}" stroke-width="12" stroke-linecap="round"/><path d="M130 70 L134 160" stroke="${hair}" stroke-width="12" stroke-linecap="round"/>`, ponytail: `<path d="M130 40 C160 60 150 120 140 140 C135 110 135 70 125 50Z" fill="${hair}"/>`, pigtails: `<path d="M68 50 C40 70 45 110 56 120 C60 95 64 75 74 60Z" fill="${hair}"/><path d="M132 50 C160 70 155 110 144 120 C140 95 136 75 126 60Z" fill="${hair}"/>`, bob: `<path d="M66 50 C62 85 66 95 72 98 L128 98 C134 95 138 85 134 50Z" fill="${hair}"/>`, curly: `<g fill="${hair}"><circle cx="70" cy="70" r="14"/><circle cx="130" cy="70" r="14"/><circle cx="72" cy="92" r="11"/><circle cx="128" cy="92" r="11"/></g>`, bun: `<circle cx="100" cy="20" r="14" fill="${hair}"/>` };
  if (longBack[L.hair]) out.push(longBack[L.hair]);
  // legs & arms (skin)
  out.push(`<rect x="80" y="200" width="17" height="96" rx="7" fill="${skin}"/><rect x="103" y="200" width="17" height="96" rx="7" fill="${skin}"/>`);
  out.push(`<rect x="52" y="108" width="15" height="92" rx="7" fill="${skin}"/><rect x="133" y="108" width="15" height="92" rx="7" fill="${skin}"/>`);
  out.push(`<circle cx="59" cy="204" r="8" fill="${skin}"/><circle cx="141" cy="204" r="8" fill="${skin}"/>`);
  out.push(`<rect x="92" y="82" width="16" height="22" fill="${shade(skin, 0.92)}"/>`);
  out.push(`<path d="M68 104 Q100 94 132 104 L130 205 L70 205Z" fill="${skin}"/>`);
  // basic undershirt so the doll is always clothed
  out.push(`<path d="M68 104 Q100 94 132 104 L131 190 L69 190Z" fill="#f1f1f1"/><path d="M71 190 L129 190 L129 214 L71 214Z" fill="#cfd4dc"/>`);
  // clothing
  const sleeves = (col, len) => `<rect x="51" y="104" width="17" height="${len}" rx="7" fill="${col}"/><rect x="132" y="104" width="17" height="${len}" rx="7" fill="${col}"/>`;
  const torso = (col, toY) => `<path d="M67 103 Q100 92 133 103 L132 ${toY} L68 ${toY}Z" fill="${col}"/>`;
  const trousers = (col, len) => `<path d="M70 188 L130 188 L130 210 L70 210Z" fill="${col}"/><rect x="78" y="200" width="21" height="${len}" rx="5" fill="${col}"/><rect x="101" y="200" width="21" height="${len}" rx="5" fill="${col}"/>`;
  const skirt = (col, toY) => `<path d="M70 186 L130 186 L142 ${toY} L58 ${toY}Z" fill="${col}"/><path d="M80 190 L76 ${toY} M100 190 L100 ${toY} M120 190 L124 ${toY}" stroke="${shade(col, 0.8)}" stroke-width="1.5"/>`;
  if (bot) {
    if (bot.style === 'skirt') out.push(skirt(bot.color, 252));
    else if (bot.style === 'shorts') out.push(trousers(bot.color, 36));
    else out.push(trousers(bot.color, 92));
  }
  if (top) {
    const len = { tee: 30, shirt: 92, blazer: 92, hoodie: 92, sweater: 92, coat: 94 }[top.style] || 40;
    out.push(sleeves(top.color, len));
    out.push(torso(top.color, top.style === 'coat' ? 222 : 194));
    if (top.style === 'blazer') out.push(`<path d="M100 100 L92 140 L100 190 L108 140Z" fill="#f4f4f4"/><path d="M100 104 L97 112 L100 150 L103 112Z" fill="#b22234"/><circle cx="114" cy="130" r="5" fill="#d4af37"/>`);
    if (top.style === 'hoodie') out.push(`<path d="M80 100 Q100 120 120 100" stroke="${shade(top.color, 0.75)}" stroke-width="5" fill="none"/><rect x="84" y="155" width="32" height="18" rx="4" fill="${shade(top.color, 0.85)}"/>`);
    if (top.style === 'shirt') out.push(`<path d="M100 100 L100 192" stroke="${shade(top.color, 0.7)}"/><g fill="#fff"><circle cx="100" cy="120" r="2"/><circle cx="100" cy="145" r="2"/><circle cx="100" cy="170" r="2"/></g>`);
    if (top.style === 'coat') out.push(`<path d="M100 100 L100 222" stroke="${shade(top.color, 0.65)}" stroke-width="2"/><g fill="${shade(top.color, 0.6)}"><circle cx="106" cy="130" r="3"/><circle cx="106" cy="160" r="3"/><circle cx="106" cy="190" r="3"/></g>`);
    if (top.style === 'sweater') out.push(`<path d="M68 185 L132 185" stroke="${shade(top.color, 0.75)}" stroke-width="5"/><path d="M85 100 Q100 110 115 100" stroke="${shade(top.color, 0.75)}" stroke-width="4" fill="none"/>`);
    if (top.style === 'tee' && w.top === 'band_tee') out.push(`<text x="100" y="150" font-size="16" text-anchor="middle" fill="#ffd60a">★</text>`);
  }
  if (full) {
    const c = full.color;
    if (full.style === 'dress') { out.push(sleeves(c, 26)); out.push(torso(c, 190)); out.push(skirt(c, 258)); out.push(`<path d="M70 186 L130 186" stroke="${shade(c, 0.7)}" stroke-width="5"/>`); }
    else if (full.style === 'overalls') { out.push(sleeves('#f1f1f1', 28)); out.push(trousers(c, 92)); out.push(`<path d="M78 130 L122 130 L128 192 L72 192Z" fill="${c}"/><path d="M80 130 L72 102 M120 130 L128 102" stroke="${c}" stroke-width="5"/>`); }
    else if (full.style === 'tracksuit') { out.push(trousers(c, 92)); out.push(sleeves(c, 92)); out.push(torso(c, 195)); out.push(`<path d="M100 100 L100 195" stroke="#fff" stroke-width="2"/><path d="M53 110 L53 190 M147 110 L147 190" stroke="#fff" stroke-width="2"/>`); }
    else if (full.style === 'suit') { out.push(trousers(c, 92)); out.push(sleeves(c, 92)); out.push(torso(c, 200)); out.push(`<path d="M100 100 L90 140 L100 196 L110 140Z" fill="#fff"/><path d="M100 104 L96 114 L100 160 L104 114Z" fill="#9d0208"/>`); }
  }
  // shoes
  const sh = C(w.shoes);
  if (sh) out.push(`<ellipse cx="88" cy="298" rx="14" ry="7" fill="${sh.color}" stroke="#0003"/><ellipse cx="112" cy="298" rx="14" ry="7" fill="${sh.color}" stroke="#0003"/>`);
  else out.push(`<ellipse cx="88" cy="298" rx="11" ry="5" fill="${skin}"/><ellipse cx="112" cy="298" rx="11" ry="5" fill="${skin}"/>`);
  // tattoos / henna (small, tasteful)
  const tpos = { wrist: [59, 192], forearm: [141, 172], hand: [59, 207], ankle: [90, 284], shoulder: [141, 122] };
  (P.tattoos || []).forEach(t => { const p = tpos[t.place]; if (p) out.push(`<text x="${p[0]}" y="${p[1]}" font-size="10" text-anchor="middle" fill="${t.perm ? '#1d3557' : '#8b4513'}" opacity=".9">${D.TATTOO_DESIGNS[t.design] || '•'}</text>`); });
  // neck accessory
  const nk = C(w.neck);
  if (nk) {
    if (w.neck === 'scarf') out.push(`<rect x="84" y="92" width="32" height="14" rx="6" fill="${nk.color}"/><rect x="104" y="100" width="10" height="34" rx="4" fill="${nk.color}"/><path d="M104 112 L114 112 M104 122 L114 122" stroke="#fff" stroke-width="2"/>`);
    else if (w.neck === 'headphones') out.push(`<path d="M78 98 Q100 118 122 98" stroke="${nk.color}" stroke-width="5" fill="none"/><circle cx="78" cy="98" r="7" fill="${nk.color}"/><circle cx="122" cy="98" r="7" fill="${nk.color}"/>`);
    else out.push(`<path d="M88 100 Q100 118 112 100" stroke="#d4af37" stroke-width="1.5" fill="none"/><text x="100" y="124" font-size="10" text-anchor="middle" fill="${nk.color}">★</text>`);
  }
  // head
  out.push(`<ellipse cx="100" cy="56" rx="30" ry="33" fill="${skin}"/>`);
  if (!tf.includes('cat') && !tf.includes('fox')) out.push(`<ellipse cx="70" cy="60" rx="5" ry="8" fill="${shade(skin, 0.93)}"/><ellipse cx="130" cy="60" rx="5" ry="8" fill="${shade(skin, 0.93)}"/>`);
  // face
  const mood = G.S ? G.S.cond.mood : 60;
  out.push(`<ellipse cx="89" cy="60" rx="6" ry="5" fill="#fff"/><ellipse cx="111" cy="60" rx="6" ry="5" fill="#fff"/><circle cx="89" cy="60.5" r="3.4" fill="${eye}"/><circle cx="111" cy="60.5" r="3.4" fill="${eye}"/><circle cx="90" cy="59.5" r="1" fill="#fff"/><circle cx="112" cy="59.5" r="1" fill="#fff"/>`);
  out.push(`<path d="M82 50 Q89 47 95 50 M105 50 Q111 47 118 50" stroke="${shade(hair, 0.8)}" stroke-width="2" fill="none" stroke-linecap="round"/>`);
  out.push(mood > 55 ? `<path d="M91 74 Q100 82 109 74" stroke="#a0524d" stroke-width="2.2" fill="none" stroke-linecap="round"/>` : mood > 30 ? `<path d="M92 76 L108 76" stroke="#a0524d" stroke-width="2.2" stroke-linecap="round"/>` : `<path d="M91 79 Q100 72 109 79" stroke="#a0524d" stroke-width="2.2" fill="none" stroke-linecap="round"/>`);
  out.push(`<ellipse cx="82" cy="70" rx="5" ry="2.5" fill="#ff8fa3" opacity=".35"/><ellipse cx="118" cy="70" rx="5" ry="2.5" fill="#ff8fa3" opacity=".35"/>`);
  // front hair
  const fr = {
    short: `<path d="M70 52 C68 20 132 20 130 52 C120 38 85 36 70 52Z" fill="${hair}"/>`,
    bob: `<path d="M68 60 C62 18 138 18 132 60 C128 42 110 36 100 40 C90 36 74 42 68 60Z" fill="${hair}"/>`,
    long: `<path d="M68 70 C60 16 140 16 132 70 C128 44 112 34 100 40 C88 34 72 44 68 70Z" fill="${hair}"/>`,
    ponytail: `<path d="M70 52 C66 18 134 18 130 52 C118 36 82 36 70 52Z" fill="${hair}"/><circle cx="128" cy="44" r="4" fill="#ff4d6d"/>`,
    curly: `<g fill="${hair}"><circle cx="78" cy="36" r="12"/><circle cx="92" cy="28" r="12"/><circle cx="108" cy="28" r="12"/><circle cx="122" cy="36" r="12"/><circle cx="70" cy="50" r="9"/><circle cx="130" cy="50" r="9"/></g>`,
    buzz: `<path d="M71 48 C72 24 128 24 129 48 C118 36 82 36 71 48Z" fill="${hair}" opacity=".85"/>`,
    braids: `<path d="M68 62 C62 18 138 18 132 62 C126 40 74 40 68 62Z" fill="${hair}"/>`,
    bun: `<path d="M70 52 C66 22 134 22 130 52 C118 38 82 38 70 52Z" fill="${hair}"/>`,
    spiky: `<path d="M68 52 L72 26 L82 36 L88 18 L98 32 L106 16 L114 32 L124 20 L126 38 L132 52 C118 40 82 40 68 52Z" fill="${hair}"/>`,
    pigtails: `<path d="M68 58 C62 18 138 18 132 58 C124 40 76 40 68 58Z" fill="${hair}"/><circle cx="70" cy="50" r="4" fill="#ffd166"/><circle cx="130" cy="50" r="4" fill="#ffd166"/>`,
  };
  out.push(fr[L.hair] || fr.short);
  // ears / horns / halo
  if (tf.includes('cat')) out.push(`<path d="M72 34 L76 8 L92 26Z" fill="${hair}"/><path d="M128 34 L124 8 L108 26Z" fill="${hair}"/><path d="M76 28 L78 14 L87 25Z" fill="#ffb3c6"/><path d="M124 28 L122 14 L113 25Z" fill="#ffb3c6"/>`);
  if (tf.includes('fox')) out.push(`<path d="M70 38 L70 2 L94 26Z" fill="#e07a2f"/><path d="M130 38 L130 2 L106 26Z" fill="#e07a2f"/><path d="M74 30 L74 12 L87 25Z" fill="#fff"/><path d="M126 30 L126 12 L113 25Z" fill="#fff"/>`);
  if (tf.includes('demon')) out.push(`<path d="M80 28 C74 14 78 6 84 4 C82 12 84 20 88 26Z" fill="#3c1518"/><path d="M120 28 C126 14 122 6 116 4 C118 12 116 20 112 26Z" fill="#3c1518"/>`);
  if (tf.includes('angel')) out.push(`<ellipse cx="100" cy="10" rx="24" ry="6" fill="none" stroke="#ffd60a" stroke-width="4" opacity=".9"/>`);
  // head accessory
  const hd = C(w.head);
  if (hd) {
    if (w.head === 'cap') out.push(`<path d="M70 40 C70 14 130 14 130 40Z" fill="${hd.color}"/><path d="M100 38 L145 42 L130 36Z" fill="${shade(hd.color, 0.8)}"/>`);
    else if (w.head === 'beanie') out.push(`<path d="M68 44 C68 10 132 10 132 44Z" fill="${hd.color}"/><rect x="66" y="38" width="68" height="9" rx="4" fill="${shade(hd.color, 0.8)}"/><circle cx="100" cy="12" r="6" fill="#fff"/>`);
    else if (w.head === 'sunhat') out.push(`<ellipse cx="100" cy="36" rx="48" ry="10" fill="${hd.color}"/><path d="M76 36 C76 12 124 12 124 36Z" fill="${hd.color}"/><rect x="76" y="28" width="48" height="5" fill="#e76f51"/>`);
    else if (w.head === 'hair_ribbon') out.push(`<path d="M112 24 L100 30 L112 36Z M124 24 L136 30 L124 36Z" fill="${hd.color}" transform="translate(-6,-4)"/><circle cx="118" cy="26" r="3" fill="${hd.color}"/>`);
    else out.push(`<g transform="translate(122,34)"><circle r="4" fill="${hd.color}"/><circle cx="5" r="4" fill="${hd.color}"/><circle cx="2.5" cy="-4.5" r="4" fill="${hd.color}"/><circle cx="2.5" cy="-1.5" r="2" fill="#ffd166"/></g>`);
  }
  const fc = C(w.face);
  if (fc) {
    if (w.face === 'sunglasses') out.push(`<rect x="80" y="54" width="18" height="11" rx="4" fill="#111"/><rect x="102" y="54" width="18" height="11" rx="4" fill="#111"/><path d="M98 58 L102 58" stroke="#111" stroke-width="2"/>`);
    else out.push(`<circle cx="89" cy="60" r="9" fill="none" stroke="${fc.color}" stroke-width="1.8"/><circle cx="111" cy="60" r="9" fill="none" stroke="${fc.color}" stroke-width="1.8"/><path d="M98 60 L102 60" stroke="${fc.color}" stroke-width="1.8"/>`);
  }
  out.push('</g></svg>');
  return out.join('');
};
G.npcAvatar = function (id, size, cfgMap) {
  const n = D.NPCS[id], cfg = (cfgMap || G.S.npcCfg)[id]; size = size || 46;
  const hairLen = cfg.pres === 'fem' ? `<path d="M10 22 C6 48 10 52 14 54 L36 54 C40 52 44 48 40 22Z" fill="${n.hair}"/>` : cfg.pres === 'andro' ? `<path d="M11 22 C9 38 12 42 14 42 L36 42 C38 42 41 38 39 22Z" fill="${n.hair}"/>` : '';
  return `<svg viewBox="0 0 50 60" width="${size}" height="${size * 1.2}" class="avatar"><rect width="50" height="60" rx="10" fill="${n.color}" opacity=".35"/>${hairLen}<path d="M8 60 C8 46 42 46 42 60Z" fill="${n.color}"/><ellipse cx="25" cy="28" rx="13" ry="15" fill="${n.skin}"/><path d="M12 26 C10 8 40 8 38 26 C32 18 18 18 12 26Z" fill="${n.hair}"/><circle cx="20" cy="29" r="1.8" fill="#222"/><circle cx="30" cy="29" r="1.8" fill="#222"/><path d="M21 36 Q25 39 29 36" stroke="#a0524d" stroke-width="1.4" fill="none"/></svg>`;
};

/* ---------- modal / menus ---------- */
G.modal = function (title, html, after) {
  const m = $('#modal'); m.classList.add('open');
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = html;
  if (after) after($('#modal-body'));
};
G.closeModal = function () { $('#modal').classList.remove('open'); G.renderSidebar(); };
const tierBadge = (xp) => `<span class="tier t${G.tierIdx(xp)}">${G.tierOf(xp)}</span>`;
const pbar = (v, max, cls) => `<div class="track sm"><div class="fill ${cls || ''}" style="width:${G.clamp(v / max * 100, 0, 100)}%"></div></div>`;
G.menu = function (which) {
  if (!G.S || !G.S.started) return;
  const fn = G.menus[which]; if (fn) fn();
};
G.menus = {};
G.menus.stats = function (tab) {
  const S = G.S; tab = tab || 'stats';
  const tabs = ['stats', 'skills', 'school', 'attitudes', 'body'];
  let h = '<div class="tabs">' + tabs.map(t => `<button class="tab ${t === tab ? 'on' : ''}" data-t="${t}">${G.cap(t)}</button>`).join('') + '</div>';
  if (tab === 'stats') {
    h += '<div class="grid2">';
    for (const k in D.STATS) {
      const v = S.stats[k];
      h += `<div class="card"><div class="row"><b>${D.STATS[k].name}</b><span class="badge">${G.statTier(k)}</span></div>${pbar(v, 100, 'good')}<div class="small">${v.toFixed(1)} / 100 · baseline ${S.base[k].toFixed(1)}</div><div class="small dim">${D.STATS[k].desc}</div></div>`;
    }
    h += `<div class="card"><b>Effective appearance</b><div class="small">Outfit beauty +${G.outfitBeauty()} · Hygiene ${Math.round(S.cond.hygiene)} → overall ${Math.round(G.effBeauty())}</div></div></div>`;
  } else if (tab === 'skills') {
    const groups = {};
    for (const k in D.SKILLS) (groups[D.SKILLS[k].group] = groups[D.SKILLS[k].group] || []).push(k);
    for (const g in groups) {
      h += `<h3 class="sub">${g === 'Main' ? 'Main Skills' : g}</h3><div class="grid3">`;
      groups[g].forEach(k => { const xp = S.skills[k]; h += `<div class="card"><div class="row"><b>${D.SKILLS[k].name}</b>${tierBadge(xp)}</div>${pbar(xp % 100, 100, 'good')}<div class="small dim">${Math.floor(xp)} xp · uses ${D.STATS[D.SKILLS[k].stat].name}</div></div>`; });
      h += '</div>';
    }
    h += '<p class="small dim">Tiers: F, F+, D, D+, C, C+, B, B+, A, A+, S (every 100 xp).</p>';
  } else if (tab === 'school') {
    const sc = S.school;
    h += '<h3 class="sub">School Grades</h3><div class="grid3">';
    for (const k in S.grades) { const t = D.NPCS[D.SUBJECTS[k].teacher]; h += `<div class="card"><div class="row"><b>${D.SUBJECTS[k].name}</b>${tierBadge(S.grades[k])}</div>${pbar(S.grades[k] % 100, 100, 'good')}<div class="small dim">${G.nm(D.SUBJECTS[k].teacher)}</div></div>`; }
    h += '</div>';
    h += `<div class="card"><b>Record</b><div class="small">Lateness: ${sc.late} · Missed lessons: ${sc.absences} · Detentions served: ${sc.detentionsServed} · skipped: ${sc.detentionsMissed}<br>School reputation: ${Math.round(S.cond.schoolRep)} · Clubs: ${sc.clubs.map(c => D.CLUBS[c].name).join(', ') || 'none'}<br>${sc.detention !== null && sc.detention !== undefined ? `<b class="warn">Detention due: ${G.shortDate(sc.detention)} after school (15:30, Classroom 2B)</b><br>` : ''}Homework due: ${sc.homework.length ? sc.homework.map(hw => `${D.SUBJECTS[hw.subj].name} (${hw.done ? 'done ✔' : 'not done'}, due ${G.shortDate(hw.due)})`).join('; ') : 'none'}</div></div>`;
    h += '<h3 class="sub">Timetable</h3><table class="tt"><tr><th></th>' + ['P1 9:00', 'P2 10:00', 'P3 11:20', 'P4 13:20', 'P5 14:20'].map(x => `<th>${x}</th>`).join('') + '</tr>';
    D.TIMETABLE.forEach((row, i) => { h += `<tr class="${G.weekday() === i ? 'today' : ''}"><th>${D.DAYS[i].slice(0, 3)}</th>` + row.map(s => `<td>${D.SUBJECTS[s].name}</td>`).join('') + '</tr>'; });
    h += '</table><p class="small dim">Registration 8:45 (late after 8:50). Break 11:00–11:20. Lunch 12:20–13:20. Clubs 15:30–17:00. Exam week: days 22–25 of Autumn, Winter and Spring. Summer is a holiday.</p>';
    if (sc.exams.length) h += '<h3 class="sub">Exam results</h3><ul class="small">' + sc.exams.slice(-12).map(e => `<li>${e}</li>`).join('') + '</ul>';
  } else if (tab === 'attitudes') {
    h += '<p class="small dim">Attitudes shift with your choices and unlock or lock certain dialogue options.</p>';
    for (const k in D.ATTITUDES) { const v = S.att[k], A = D.ATTITUDES[k]; h += `<div class="card"><div class="row"><b>${A.name}</b><span>${v > 25 ? A.hi : v < -25 ? A.lo : 'Neutral'} (${Math.round(v)})</span></div><div class="slider"><span>${A.lo}</span><div class="strack"><div class="knob" style="left:${(v + 100) / 2}%"></div></div><span>${A.hi}</span></div></div>`; }
  } else if (tab === 'body') {
    const P = S.player, L = P.look;
    h += `<div class="bodyrow"><div>${G.paperdoll(P, 200)}</div><div class="card grow"><b>${G.pn()}</b><div class="small">Sex: ${G.cap(P.sex || '—')} · Presentation: ${({ masc: 'Masculine', fem: 'Feminine', andro: 'Androgynous' })[P.pres] || '—'} · Pronouns: ${P.pron}/${G.PR[P.pron].him} · Age ${P.age}<br>Height: ${G.cap(L.height || 'average')} · Build: ${G.cap(L.build || 'average')}<br>Background: ${D.BACKGROUNDS[P.background].name}<br>Hair: ${L.hairColor} ${L.hair} · Eyes: ${L.eyes} · Skin: ${L.skin}</div>
    <h4>Tattoos & henna</h4><div class="small">${P.tattoos.length ? P.tattoos.map(t => `${D.TATTOO_DESIGNS[t.design]} ${t.design} on ${D.TATTOO_PLACES[t.place].toLowerCase()} (${t.perm ? 'permanent' : 'henna, fades ' + G.shortDate(t.expires)})`).join('<br>') : 'None.'}</div>
    <h4>Transformations</h4><div class="small">${P.transforms.length ? P.transforms.map(t => `<b>${D.TRANSFORMS[t].name}</b> — ${D.TRANSFORMS[t].parts}. <span class="dim">${D.TRANSFORMS[t].perk}</span>`).join('<br>') : 'None yet. Wetinburg is said to hide a little magic for the curious…'}</div>
    <h4>Appearance</h4><div class="small">Change your hairstyle at the salon in Lantern Lane. Change clothes from the Wardrobe menu.</div></div></div>`;
  }
  G.modal('Characteristics', h, (b) => b.querySelectorAll('.tab').forEach(t => t.onclick = () => G.menus.stats(t.dataset.t)));
};
G.canChange = () => ['home', 'school_gym', 'school_pool'].includes(G.S.loc) || (G.S.loc === 'shopping' && G.hour() >= 9 && G.hour() < 19);
G.menus.inventory = function () {
  const S = G.S; const cats = {};
  for (const id in S.inv) { const it = D.ITEMS[id]; if (!it) continue; (cats[it.cat] = cats[it.cat] || []).push(id); }
  const names = { food: 'Food & Drink', gift: 'Gifts', seed: 'Seeds', produce: 'Produce', tool: 'Tools', book: 'Books', medicine: 'Medicine', misc: 'Miscellaneous', quest: 'Special Items' };
  let h = `<p class="small">Money: <b>${G.money(S.money)}</b>. Items are used from here; gifts are given when talking to people; seeds are planted at the farm.</p>`;
  if (!Object.keys(cats).length) h += '<p class="dim">Your bag is empty.</p>';
  for (const c in names) {
    if (!cats[c]) continue;
    h += `<h3 class="sub">${names[c]}</h3><div class="inv">`;
    cats[c].forEach(id => {
      const it = D.ITEMS[id]; let btn = '';
      if (it.eat && !it.noEat) btn = `<button class="mini" data-act="eat" data-id="${id}">${c === 'food' && /drink|coffee|tea|cocoa/i.test(it.name) ? 'Drink' : 'Eat'}</button>`;
      if (it.use) btn = `<button class="mini" data-act="use" data-id="${id}">Use</button>`;
      if (it.read) btn = `<button class="mini" data-act="read" data-id="${id}">Read (45m)</button>`;
      h += `<div class="item"><div><b>${it.name}</b> ×${S.inv[id]}<div class="small dim">${it.desc || ''}${it.sell ? ` · sells ~${G.money(it.sell)}` : ''}</div></div><div>${btn}${it.cat !== 'quest' ? `<button class="mini ghost" data-act="drop" data-id="${id}">Drop</button>` : ''}</div></div>`;
    });
    h += '</div>';
  }
  G.modal('Inventory', h, (b) => b.querySelectorAll('button.mini').forEach(btn => btn.onclick = () => {
    const id = btn.dataset.id, it = D.ITEMS[id];
    if (btn.dataset.act === 'drop') { G.take(id); G.menus.inventory(); return; }
    if (btn.dataset.act === 'eat') { G.take(id); G.apply(it.eat); G.advance(5); G.cnt('ate'); }
    if (btn.dataset.act === 'use') { G.take(id); G.apply({ health: it.use.health || 0, stress: it.use.stress || 0 }); if (it.use.cure && G.S.ill[it.use.cure]) { delete G.S.ill[it.use.cure]; G.note('Cold cured', 'up'); } G.advance(5); }
    if (btn.dataset.act === 'read') { G.closeModal(); G.Actions.readBook(id); return; }
    G.menus.inventory(); G.renderSidebar(); G.flushNotesToast();
  }));
};
G.flushNotesToast = function () {
  if (!G._notes.length) return; const t = $('#toast');
  t.innerHTML = G._notes.slice(0, 6).map(n => `<span class="note ${n.kind}">${G.esc(n.text)}</span>`).join(''); G._notes = [];
  t.classList.add('show'); clearTimeout(G._tt); G._tt = setTimeout(() => t.classList.remove('show'), 2600);
};
G.menus.wardrobe = function () {
  const S = G.S, w = S.player.worn; const can = G.canChange();
  const slots = { top: 'Top', bottom: 'Bottom', full: 'Full outfit', shoes: 'Shoes', head: 'Head', face: 'Face', neck: 'Neck' };
  let h = `<div class="bodyrow"><div>${G.paperdoll(S.player, 180)}</div><div class="grow">`;
  h += can ? '<p class="small">You can change here.</p>' : '<p class="small warn">You can only change clothes at home, in the school changing rooms (gym/pool) or a shop fitting room in Lantern Lane.</p>';
  h += `<p class="small">Outfit beauty: +${G.outfitBeauty()} · Warmth: ${G.warmth()} · ${G.inUniform() ? 'In school uniform ✔' : 'Not in uniform'}</p>`;
  for (const s in slots) {
    const owned = S.wardrobe.filter(id => D.CLOTHES[id] && D.CLOTHES[id].slot === s);
    if (!owned.length) continue;
    h += `<div class="slot"><b>${slots[s]}:</b> `;
    owned.forEach(id => { const on = w[s] === id; h += `<button class="mini ${on ? 'on' : ''}" ${can ? '' : 'disabled'} data-s="${s}" data-id="${id}">${D.CLOTHES[id].name}</button>`; });
    if (['head', 'face', 'neck', 'full'].includes(s) && w[s]) h += `<button class="mini ghost" ${can ? '' : 'disabled'} data-s="${s}" data-id="">Remove</button>`;
    h += '</div>';
  }
  h += '<p class="small dim">Tops and bottoms can be swapped but never removed entirely; wearing a full outfit replaces both.</p></div></div>';
  G.modal('Wardrobe', h, (b) => b.querySelectorAll('button.mini').forEach(btn => btn.onclick = () => {
    const s = btn.dataset.s, id = btn.dataset.id;
    if (s === 'full') { w.full = id || null; }
    else if (s === 'top' || s === 'bottom') { w[s] = id; w.full = null; }
    else w[s] = id || null;
    G.menus.wardrobe(); G.renderSidebar();
  }));
};
G.menus.relationships = function (sel) {
  const S = G.S; const met = Object.keys(D.NPCS).filter(id => S.npcs[id].met);
  let h = '<p class="small dim">People you have met in Wetinburg. Friendship ranges −100 to 100; trust and romance 0–100. Romance is only possible with classmates your own age.</p>';
  if (!met.length) h += '<p>You haven\'t met anyone yet. Try talking to people at school!</p>';
  h += '<div class="rels">';
  met.forEach(id => {
    const n = D.NPCS[id], r = S.npcs[id];
    const where = r.fr >= 15 && G.NPC ? G.NPC.usualSpots(id) : 'Get to know them better to learn their routine.';
    const known = (r.known || []).map(x => D.ITEMS[x] ? D.ITEMS[x].name : x);
    h += `<div class="rel card">${G.npcAvatar(id, 46)}<div class="grow"><div class="row"><b>${G.fullName(id)}</b><span class="badge">${G.relLabel(id)}</span></div><div class="small dim">${n.role} · ${G.ptext(id, n.desc)}</div>
      <div class="mbar"><span>Friendship</span>${pbar(r.fr + 100, 200, r.fr >= 0 ? 'good' : 'bad')}<span>${Math.round(r.fr)}</span></div>
      <div class="mbar"><span>Trust</span>${pbar(r.tr, 100, 'mid')}<span>${Math.round(r.tr)}</span></div>
      ${n.romance ? `<div class="mbar"><span>Romance</span>${pbar(r.ro, 100, 'love')}<span>${Math.round(r.ro)}</span></div>` : ''}
      <div class="small">Story: chapter ${r.chapter}/${G.NPC ? G.NPC.chapterCount(id) : '?'} · ${known.length ? 'Known likes: ' + known.join(', ') : 'Likes: unknown — try giving gifts'}${r.dislikedKnown && r.dislikedKnown.length ? ' · Dislikes: ' + r.dislikedKnown.map(x => D.ITEMS[x].name).join(', ') : ''}</div>
      <div class="small dim">Often found: ${where}</div></div></div>`;
  });
  h += '</div>';
  G.modal('Relationships', h);
};
G.menus.traits = function () {
  const S = G.S; let h = '<h3 class="sub">Traits</h3><div class="grid2">';
  for (const t in D.TRAITS) { const on = G.hasTrait(t); h += `<div class="card ${on ? '' : 'lockedc'}"><b>${on ? '✨' : '🔒'} ${D.TRAITS[t].name}</b><div class="small">${on ? D.TRAITS[t].bonus : 'Requirement: ' + D.TRAITS[t].desc}</div></div>`; }
  h += '</div><h3 class="sub">Transformations</h3><div class="grid2">';
  for (const t in D.TRANSFORMS) { const on = G.hasTf(t); h += `<div class="card ${on ? '' : 'lockedc'}"><b>${on ? '🌟' : '❔'} ${on ? D.TRANSFORMS[t].name : '???'}</b><div class="small">${on ? D.TRANSFORMS[t].parts + ' — ' + D.TRANSFORMS[t].perk : G.Story ? G.Story.tfHint(t) : 'Undiscovered.'}</div></div>`; }
  h += '</div>';
  G.modal('Traits & Transformations', h);
};
G.menus.journal = function (tab) {
  const S = G.S; tab = tab || 'log';
  let h = '<div class="tabs">' + ['log', 'goals', 'calendar'].map(t => `<button class="tab ${t === tab ? 'on' : ''}" data-t="${t}">${G.cap(t)}</button>`).join('') + '</div>';
  if (tab === 'log') h += '<div class="log">' + S.log.slice(0, 120).map(e => `<div class="le"><span class="lt">${G.shortDate(Math.floor(e.t / 1440))} ${G.timeStr(e.t % 1440)}</span> ${e.text}</div>`).join('') + '</div>';
  if (tab === 'goals') h += G.Story ? G.Story.goalsHTML() : '';
  if (tab === 'calendar') {
    h += '<h3 class="sub">Forecast</h3><div class="grid3">';
    for (let i = 0; i < 3; i++) { const d = G.day() + i, w = G.weather(d); h += `<div class="card"><b>${i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : D.DAYS[G.weekday(d)]}</b><div>${G.WEATHER[w.type].icon} ${G.WEATHER[w.type].name}, ${w.temp}°C</div></div>`; }
    h += '</div><h3 class="sub">Upcoming</h3><ul class="small">';
    for (let i = 0; i < 40; i++) { const d = G.day() + i; const sp = G.specialDay(d); if (sp) h += `<li>${G.shortDate(d)} — ${G.SPECIAL_NAMES[sp]}</li>`; if (G.examDay(d) && G.seasonDay(d) === 22) h += `<li>${G.shortDate(d)} — Exam week begins</li>`; if (G.seasonDay(d) === 26 && G.seasonIdx(d) === 1) h += `<li>${G.shortDate(d)} — Winter holidays begin</li>`; if (G.seasonIdx(d) === 3 && G.seasonDay(d) === 1) h += `<li>${G.shortDate(d)} — Summer holidays begin</li>`; }
    h += '</ul>';
  }
  G.modal('Journal', h, (b) => b.querySelectorAll('.tab').forEach(t => t.onclick = () => G.menus.journal(t.dataset.t)));
};
G.menus.map = function () {
  const S = G.S; const cur = D.LOCATIONS[S.loc]; const here = cur.area === 'school' ? 'school_gate' : S.loc;
  const nodes = Object.keys(D.LOCATIONS).filter(id => !D.LOCATIONS[id].inner);
  let svg = `<svg viewBox="0 0 104 74" class="map">`;
  svg += `<path d="M0 66 C20 62 30 58 40 60 C50 62 60 68 104 66 L104 74 L0 74Z" class="water"/><path d="M75 74 C78 60 92 52 104 48 L104 74Z" class="water"/><path d="M0 52 C12 56 22 54 30 58 C38 62 36 70 40 74" class="river"/>`;
  svg += `<rect x="1" y="1" width="26" height="28" rx="6" class="forest"/>`;
  const edges = G.Travel.edges();
  edges.forEach(([a, b]) => { const A = D.LOCATIONS[a], B = D.LOCATIONS[b]; svg += `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="road"/>`; });
  nodes.forEach(id => { const L = D.LOCATIONS[id]; const open = G.Travel.isOpen(id); svg += `<g class="node ${id === here ? 'here' : ''} ${open ? '' : 'closed'}" data-id="${id}"><circle cx="${L.x}" cy="${L.y}" r="${id === here ? 3.2 : 2.4}"/>${L.bus ? `<circle cx="${L.x + 2.4}" cy="${L.y - 2.4}" r="0.9" class="busdot"/>` : ''}<text x="${L.x}" y="${L.y + 5.2}">${id === 'school_gate' ? 'Wetinburg High' : L.name.replace('Wetinburg ', '').replace(' — Front Gate', '').replace('Lantern Lane ', '').replace(' District', '').replace('The Copper Kettle ', '').replace("St. Brigid's ", '').replace(' Arcade', '')}</text></g>`; });
  svg += '</svg>';
  let list = '<div class="travel-list">';
  nodes.filter(id => id !== here).sort((a, b) => G.Travel.walkTime(here, a) - G.Travel.walkTime(here, b)).forEach(id => {
    const L = D.LOCATIONS[id], o = G.Travel.options(id);
    list += `<div class="tl"><span>${L.icon} ${L.name}${G.Travel.isOpen(id) ? '' : ' <span class="warn small">(closed now)</span>'}</span><span>` + o.map((op, i) => `<button class="mini" data-id="${id}" data-m="${op.mode}" ${op.ok ? '' : 'disabled title="' + G.esc(op.why || '') + '"'}>${op.label}</button>`).join('') + '</span></div>';
  });
  list += '</div>';
  G.modal(`Map of ${D.TOWN}`, `<p class="small">You are at <b>${cur.name}</b>. Blue dots are bus stops (£2, 06:00–23:00). Weather today: ${G.wx().name} (travel ×${G.wx().travel}).</p>` + svg + list, (b) => {
    b.querySelectorAll('button.mini').forEach(btn => btn.onclick = () => { G.closeModal(); G.Travel.go(btn.dataset.id, btn.dataset.m); });
    b.querySelectorAll('.node').forEach(n => n.onclick = () => { const id = n.dataset.id; if (id === here) return; const btn = b.querySelector(`button.mini[data-id="${id}"]:not([disabled])`); if (btn) btn.click(); });
  });
};
/* shared NPC presentation editor (creation screen + Settings). Names are fixed; only sex, presentation, pronouns change. */
G.npcCfgTitle = (id, cfg) => { const n = D.NPCS[id]; if (n.fixedTitle) return n.fixedTitle + ' '; if (!n.title) return ''; const p = cfg[id].pron; return (p === 'he' ? 'Mr.' : p === 'she' ? 'Ms.' : 'Mx.') + ' '; };
G.npcCfgTable = function (cfg) {
  let h = '<table class="npct"><tr><th></th><th>Name (fixed)</th><th>Sex</th><th>Presentation</th><th>Pronouns</th></tr>';
  for (const id in D.NPCS) {
    const c = cfg[id], n = D.NPCS[id];
    const sel = (k, opts) => `<select data-id="${id}" data-k="${k}" aria-label="${n.first} ${k}">` + opts.map(([v, l]) => `<option value="${v}" ${c[k] === v ? 'selected' : ''}>${l}</option>`).join('') + '</select>';
    h += `<tr><td>${G.npcAvatar(id, 26, cfg)}</td><td><b>${G.npcCfgTitle(id, cfg)}${n.first} ${n.last}</b><div class="small dim">${n.role}${n.romance ? ' · ♡ classmate' : ''}</div></td><td>${sel('sex', D.NPC_SEX_OPTS)}</td><td>${sel('pres', D.PRES_OPTS)}</td><td>${sel('pron', D.PRON_OPTS)}</td></tr>`;
  }
  return h + '</table>';
};
G.bindNpcCfg = function (root, cfg, rerender) {
  root.querySelectorAll('select[data-id]').forEach(s => s.onchange = () => { cfg[s.dataset.id][s.dataset.k] = s.value; rerender(); });
};
G.menus.settings = function (tab) {
  const S = G.S; tab = tab || 'general';
  let h = '<div class="tabs">' + ['general', 'npcs'].map(t => `<button class="tab ${t === tab ? 'on' : ''}" data-t="${t}">${t === 'npcs' ? 'NPCs' : 'General'}</button>`).join('') + '</div>';
  if (tab === 'general') {
    h += `<div class="form"><label>Theme <select id="set-theme"><option value="dark">Dark</option><option value="light">Light</option></select></label>
    <label>Text size <input id="set-font" type="range" min="13" max="21" value="${S.settings.fontSize}"></label>
    <label>Random event frequency <select id="set-ev"><option value="0.5">Low</option><option value="1">Normal</option><option value="1.6">High</option></select></label>
    <div class="small">World: started in <b>${D.SEASONS[(S.world && S.world.startSeason) || 0]}</b> · Difficulty: <b>${G.diff().name}</b> <span class="dim">(${G.diff().desc} Set at world creation.)</span></div>
    <label><input type="checkbox" id="set-auto" ${S.settings.autosave ? 'checked' : ''}> Autosave after every choice</label></div>
    <p class="small dim">Wetinburg Days is a wholesome slice-of-life game. Romance is only ever between classmates your own age, and never goes beyond hand-holding.</p>`;
  } else {
    h += '<p class="small">Adjust how named characters are presented. <b>Names are fixed</b> and cannot be changed. Teachers\' titles (Mr./Ms./Mx.) follow their pronouns.</p>' + G.npcCfgTable(S.npcCfg);
  }
  G.modal('Settings', h, (b) => {
    b.querySelectorAll('.tab').forEach(t => t.onclick = () => G.menus.settings(t.dataset.t));
    const th = b.querySelector('#set-theme'); if (th) { th.value = S.settings.theme; th.onchange = () => { S.settings.theme = th.value; G.applySettings(); }; }
    const fo = b.querySelector('#set-font'); if (fo) fo.oninput = () => { S.settings.fontSize = +fo.value; G.applySettings(); };
    const ev = b.querySelector('#set-ev'); if (ev) { ev.value = String(S.settings.eventRate); ev.onchange = () => { S.settings.eventRate = +ev.value; }; }
    const au = b.querySelector('#set-auto'); if (au) au.onchange = () => { S.settings.autosave = au.checked; };
    G.bindNpcCfg(b, S.npcCfg, () => G.menus.settings('npcs'));
  });
};
/* ---------- safe storage: localStorage can be missing or throw (Safari private mode,
   cookies/site data blocked, sandboxed iframes). Fall back to an in-memory store so the game still runs. ---------- */
G.store = (function () {
  const mem = {};
  let ls = null;
  try { ls = window.localStorage; const t = '__wd_test__'; ls.setItem(t, '1'); ls.removeItem(t); } catch (e) { ls = null; }
  G.storageOk = !!ls;
  return {
    get(k) { if (ls) { try { return ls.getItem(k); } catch (e) { /* fall through */ } } return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
    set(k, v) { v = String(v); if (ls) { try { ls.setItem(k, v); return true; } catch (e) { /* quota/blocked: keep in memory */ } } mem[k] = v; return !ls; },
    remove(k) { if (ls) { try { ls.removeItem(k); } catch (e) { /* */ } } delete mem[k]; },
  };
})();
G.applySettings = function () {
  const s = (G.S && G.S.settings) || { theme: G.store.get('wd_theme') || 'dark', fontSize: 16 };
  document.documentElement.dataset.theme = s.theme;
  document.documentElement.style.setProperty('--fs', s.fontSize + 'px');
  G.store.set('wd_theme', s.theme);
};

/* ---------- save / load ---------- */
const KEY = 'wetinburg_days_slot_';
G.saveTo = function (slot) {
  try {
    const data = JSON.stringify(G.S);
    if (!G.store.set(KEY + slot, data)) throw new Error('storage unavailable or full');
    G.store.set(KEY + slot + '_meta', JSON.stringify({ name: G.S.player.name, date: G.shortDate(G.day()), time: G.timeStr(), loc: D.LOCATIONS[G.S.loc].name, saved: new Date().toLocaleString() }));
    return true;
  } catch (e) { console.warn('save failed', e); return false; }
};
G.autosave = () => G.saveTo('auto');
G.migrate = function (S) {
  if (S.player && !S.player.sex) { // pre-v4 saves stored a single "gender"
    const g = S.player.gender; S.player.sex = g === 'male' || g === 'female' ? g : 'unspecified';
    S.player.pres = g === 'male' ? 'masc' : g === 'female' ? 'fem' : 'andro';
  }
  if (!S.world) S.world = { startSeason: 0, difficulty: (S.settings && S.settings.difficulty) || 'normal', eventRate: (S.settings && S.settings.eventRate) || 1 };
  const fresh = G.newState({ name: S.player && S.player.name });
  const fill = (dst, src) => { for (const k in src) { if (dst[k] === undefined) dst[k] = src[k]; else if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k]) && typeof dst[k] === 'object' && !Array.isArray(dst[k])) fill(dst[k], src[k]); } };
  fill(S, fresh);
  for (const id in D.NPCS) { if (!S.npcs[id]) S.npcs[id] = fresh.npcs[id]; if (!S.npcCfg[id]) S.npcCfg[id] = fresh.npcCfg[id]; }
  S.pending = []; S.sleeping = false;
  return S;
};
G.loadState = function (S) {
  if (!S || !S.player || typeof S.time !== 'number') throw new Error('Not a Wetinburg Days save');
  G.S = G.migrate(S); G.S.started = true; G.applySettings(); G.showGame();
  G.note('Game loaded', 'info'); G.goto(G.here);
};
G.loadFrom = function (slot) { const d = G.store.get(KEY + slot); if (!d) return false; G.loadState(JSON.parse(d)); return true; };
G.slotMeta = (slot) => { try { return JSON.parse(G.store.get(KEY + slot + '_meta')); } catch (e) { return null; } };
G.anySave = () => ['auto', 1, 2, 3, 4, 5].some(s => G.store.get(KEY + s));
G.menus.save = function (msg) {
  const inGame = G.S && G.S.started;
  let h = msg ? `<p class="okmsg">${msg}</p>` : '';
  h += '<div class="slots">';
  ['auto', 1, 2, 3, 4, 5].forEach(s => {
    const m = G.slotMeta(s);
    h += `<div class="slotrow card"><div><b>${s === 'auto' ? 'Autosave' : 'Slot ' + s}</b><div class="small dim">${m ? `${G.esc(m.name)} — ${m.date} ${m.time} @ ${G.esc(m.loc)}<br>saved ${G.esc(m.saved)}` : 'Empty'}</div></div><div>
      ${inGame && s !== 'auto' ? `<button class="mini" data-a="save" data-s="${s}">Save</button>` : ''}
      ${m ? `<button class="mini" data-a="load" data-s="${s}">Load</button><button class="mini ghost" data-a="del" data-s="${s}">Delete</button>` : ''}</div></div>`;
  });
  h += '</div><h3 class="sub">Export / Import</h3>';
  h += `${inGame ? '<button class="mini" id="exp-file">Export save as JSON file</button> <button class="mini" id="exp-text">Show save JSON</button>' : ''}
    <label class="mini filebtn">Import JSON file<input type="file" id="imp-file" accept=".json,application/json" hidden></label>
    <textarea id="imp-text" placeholder="Paste exported save JSON here…" rows="5"></textarea><button class="mini" id="imp-go">Import pasted JSON</button>`;
  G.modal('Save / Load', h, (b) => {
    b.querySelectorAll('button[data-a]').forEach(btn => btn.onclick = () => {
      const s = btn.dataset.s, a = btn.dataset.a;
      if (a === 'save') { G.menus.save(G.saveTo(s) ? `Saved to slot ${s}.` : 'Saving failed (storage full or disabled).'); }
      if (a === 'load') { G.closeModal(); G.loadFrom(s); }
      if (a === 'del') { G.store.remove(KEY + s); G.store.remove(KEY + s + '_meta'); G.menus.save('Deleted.'); }
    });
    const ef = b.querySelector('#exp-file'); if (ef) ef.onclick = () => {
      const blob = new Blob([JSON.stringify(G.S, null, 1)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `wetinburg-days-${G.S.player.name}-${G.shortDate(G.day()).replace(/ /g, '_')}.json`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    };
    const et = b.querySelector('#exp-text'); if (et) et.onclick = () => { b.querySelector('#imp-text').value = JSON.stringify(G.S); b.querySelector('#imp-text').select(); };
    b.querySelector('#imp-file').onchange = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { G.closeModal(); G.loadState(JSON.parse(r.result)); } catch (err) { G.menus.save('Import failed: ' + G.esc(err.message)); } }; r.readAsText(f); };
    b.querySelector('#imp-go').onclick = () => { try { const j = JSON.parse(b.querySelector('#imp-text').value); G.closeModal(); G.loadState(j); } catch (err) { G.menus.save('Import failed: ' + G.esc(err.message)); } };
  });
};
})(window.G);
