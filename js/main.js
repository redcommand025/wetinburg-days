/* Wetinburg Days — boot, title screen, character creation */
(function (G) {
'use strict';
const D = G.DATA;
const $ = (s) => document.querySelector(s);

G.showGame = function () { $('#title').classList.add('hidden'); $('#creator').classList.add('hidden'); $('#game').classList.remove('hidden'); };
G.showTitle = function () {
  $('#game').classList.add('hidden'); $('#creator').classList.add('hidden'); $('#title').classList.remove('hidden');
  $('#btn-continue').disabled = !G.store.get('wetinburg_days_slot_auto');
};

/* ---------- world creation (tabs: Your Character / Named NPCs / World) ---------- */
const freshNpcCfg = () => { const c = {}; for (const id in D.NPCS) c[id] = { sex: D.NPCS[id].sex, pres: D.NPCS[id].pres, pron: D.NPCS[id].pron }; return c; };
const draft = { name: '', sex: 'female', pres: 'fem', pron: 'she', height: 'average', build: 'average', hair: 'long', hairColor: 'brown', eyes: 'brown', skin: 'light', bottom: 'uniform_skirt', outfit: 'tee_jeans', background: 'bookish', npcCfg: freshNpcCfg(), season: 0, difficulty: 'normal', eventRate: 1 };
let ccTab = 'character', ccPreview = 'uniform';
G._draft = draft;
function previewPlayer() {
  const o = D.OUTFITS[draft.outfit] || D.OUTFITS.tee_jeans;
  const worn = ccPreview === 'casual' ? Object.assign({ top: null, bottom: null, full: null, shoes: null }, o.worn) : { top: 'uniform_blazer', bottom: draft.bottom, full: null, shoes: 'school_shoes' };
  return { look: { hair: draft.hair, hairColor: draft.hairColor, eyes: draft.eyes, skin: draft.skin, height: draft.height, build: draft.build }, worn, tattoos: [], transforms: [] };
}
const label = (arr, v) => (arr.find(a => a[0] === v) || [v, G.cap(v)])[1];
function summary() {
  const changed = Object.keys(D.NPCS).filter(id => ['sex', 'pres', 'pron'].some(k => draft.npcCfg[id][k] !== D.NPCS[id][k])).length;
  return `<b>${G.esc(draft.name || 'Unnamed')}</b><br>${label(D.SEX_OPTS, draft.sex)} · ${label(D.PRES_OPTS, draft.pres)} · ${label(D.PRON_OPTS, draft.pron)}<br>${G.cap(draft.height)}, ${draft.build} build<br>${D.BACKGROUNDS[draft.background].name}<hr>
  World: starts <b>${D.SEASONS[draft.season]}</b>, Year 1<br>Difficulty: <b>${G.DIFF[draft.difficulty].name}</b><br>Events: <b>${({ 0.5: 'Low', 1: 'Normal', 1.6: 'High' })[draft.eventRate]}</b><br>NPCs customised: ${changed}`;
}
G.openCreator = function () {
  $('#title').classList.add('hidden'); $('#creator').classList.remove('hidden');
  const TABS = [['character', 'Your Character'], ['npcs', 'Named NPCs'], ['world', 'World']];
  $('#creator-tabs').innerHTML = TABS.map(([k, l]) => `<button type="button" role="tab" class="tab ${ccTab === k ? 'on' : ''}" data-t="${k}" aria-selected="${ccTab === k}">${l}</button>`).join('');
  $('#creator-tabs').querySelectorAll('.tab').forEach(b => b.onclick = () => { ccTab = b.dataset.t; G.openCreator(); });
  const sel = (id, arr, cur) => `<select id="${id}">${arr.map(([v, l]) => `<option value="${v}" ${String(v) === String(cur) ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  const sw = (obj, key) => Object.keys(obj).map(k => `<button type="button" class="swatch ${draft[key] === k ? 'on' : ''}" data-k="${key}" data-v="${k}" title="${k}" style="background:${obj[k]}"></button>`).join('');
  const f = $('#creator-form');
  if (ccTab === 'character') {
    f.innerHTML = `
    <label>Name <input id="cc-name" maxlength="20" placeholder="Your name" value="${G.esc(draft.name)}"></label>
    <div class="row3"><label>Sex ${sel('cc-sex', D.SEX_OPTS, draft.sex)}</label>
    <label>Presentation ${sel('cc-pres', D.PRES_OPTS, draft.pres)}</label>
    <label>Pronouns ${sel('cc-pron', D.PRON_OPTS, draft.pron)}</label></div>
    <div class="row3"><label>Height ${sel('cc-height', Object.keys(D.HEIGHTS).map(k => [k, G.cap(k)]), draft.height)}</label>
    <label>Build ${sel('cc-build', Object.keys(D.BUILDS).map(k => [k, G.cap(k)]), draft.build)}</label>
    <label>Hair style ${sel('cc-hair', D.HAIR_STYLES.map(k => [k, G.cap(k)]), draft.hair)}</label></div>
    <div class="row3"><label>School uniform ${sel('cc-bottom', [['uniform_skirt', 'Blazer & skirt (knee-length)'], ['uniform_trousers', 'Blazer & trousers']], draft.bottom)}</label>
    <label>Weekend outfit ${sel('cc-outfit', Object.keys(D.OUTFITS).map(k => [k, D.OUTFITS[k].name]), draft.outfit)}</label>
    <label>Preview ${sel('cc-preview', [['uniform', 'Uniform'], ['casual', 'Weekend outfit']], ccPreview)}</label></div>
    <div class="lbl">Hair colour</div><div class="swatches">${sw(D.HAIR_COLORS, 'hairColor')}</div>
    <div class="lbl">Eye colour</div><div class="swatches">${sw(D.EYE_COLORS, 'eyes')}</div>
    <div class="lbl">Skin tone</div><div class="swatches">${sw(D.SKIN_TONES, 'skin')}</div>
    <div class="lbl">Background</div><div class="bgs">${Object.keys(D.BACKGROUNDS).map(b => `<label class="bg ${draft.background === b ? 'on' : ''}"><input type="radio" name="bg" value="${b}" ${draft.background === b ? 'checked' : ''}><b>${D.BACKGROUNDS[b].name}</b><span>${D.BACKGROUNDS[b].desc}</span></label>`).join('')}</div>`;
    f.querySelector('#cc-name').oninput = (e) => { draft.name = e.target.value; $('#creator-sum').innerHTML = summary(); };
    f.querySelector('#cc-sex').onchange = (e) => { draft.sex = e.target.value; G.openCreator(); };
    f.querySelector('#cc-pres').onchange = (e) => { draft.pres = e.target.value; G.openCreator(); };
    f.querySelector('#cc-pron').onchange = (e) => { draft.pron = e.target.value; G.openCreator(); };
    [['cc-height', 'height'], ['cc-build', 'build'], ['cc-hair', 'hair'], ['cc-bottom', 'bottom']].forEach(([id, k]) => f.querySelector('#' + id).onchange = (e) => { draft[k] = e.target.value; ccPreview = k === 'bottom' ? 'uniform' : ccPreview; G.openCreator(); });
    f.querySelector('#cc-outfit').onchange = (e) => { draft.outfit = e.target.value; ccPreview = 'casual'; G.openCreator(); };
    f.querySelector('#cc-preview').onchange = (e) => { ccPreview = e.target.value; G.openCreator(); };
    f.querySelectorAll('.swatch').forEach(b => b.onclick = () => { draft[b.dataset.k] = b.dataset.v; G.openCreator(); });
    f.querySelectorAll('input[name=bg]').forEach(r => r.onchange = () => { draft.background = r.value; G.openCreator(); });
  } else if (ccTab === 'npcs') {
    f.innerHTML = `<p class="small">Choose how Wetinburg's named characters are presented. <b>Names are fixed</b> (they stay the same across updates); you can change each character's sex, presentation and pronouns. Teachers' titles (Mr./Ms./Mx.) follow their pronouns. You can also change these later in Settings → NPCs.</p>
    <div class="cc-npc-actions"><button type="button" class="ghost mini" id="cc-npc-reset">Reset all to defaults</button></div>
    <div class="npct-wrap">${G.npcCfgTable(draft.npcCfg)}</div>`;
    G.bindNpcCfg(f, draft.npcCfg, G.openCreator);
    f.querySelector('#cc-npc-reset').onclick = () => { draft.npcCfg = freshNpcCfg(); G.openCreator(); };
  } else {
    f.innerHTML = `
    <label>Starting season ${sel('cc-season', D.SEASONS.map((s, i) => [i, s + (i === 3 ? ' (school holidays)' : '')]), draft.season)}</label>
    <p class="small dim">${['Autumn: a fresh school year, harvest crops and sports day.', 'Winter: frosty mornings, snow days and the winter fair.', 'Spring: blossom, planting season and the school festival.', 'Summer: no school — beaches, fireworks and long days. Term starts in Autumn.'][draft.season]}</p>
    <label>Difficulty ${sel('cc-diff', Object.keys(G.DIFF).map(k => [k, G.DIFF[k].name]), draft.difficulty)}</label>
    <p class="small dim">${G.DIFF[draft.difficulty].desc}</p>
    <label>Random event frequency ${sel('cc-ev', [[0.5, 'Low'], [1, 'Normal'], [1.6, 'High']], draft.eventRate)}</label>
    <p class="small dim">How often surprises happen as you go about your day. Event frequency can be changed later in Settings; season and difficulty are saved with this game.</p>`;
    f.querySelector('#cc-season').onchange = (e) => { draft.season = +e.target.value; G.openCreator(); };
    f.querySelector('#cc-diff').onchange = (e) => { draft.difficulty = e.target.value; G.openCreator(); };
    f.querySelector('#cc-ev').onchange = (e) => { draft.eventRate = +e.target.value; G.openCreator(); };
  }
  $('#creator-doll').innerHTML = G.paperdoll(previewPlayer(), 200);
  $('#creator-sum').innerHTML = summary();
  const A = $('#creator-actions');
  const idx = TABS.findIndex(t => t[0] === ccTab);
  A.innerHTML = `<button type="button" class="ghost" id="cc-back">Back to title</button><button type="button" class="ghost" id="cc-random">Randomise look</button>${idx < 2 ? `<button type="button" class="ghost" id="cc-next">Next: ${TABS[idx + 1][1]} →</button>` : ''}<button type="button" id="cc-start">Begin your story in ${D.TOWN} →</button>`;
  A.querySelector('#cc-back').onclick = G.showTitle;
  A.querySelector('#cc-random').onclick = () => { draft.hair = G.pick(D.HAIR_STYLES); draft.hairColor = G.pick(Object.keys(D.HAIR_COLORS)); draft.eyes = G.pick(Object.keys(D.EYE_COLORS)); draft.skin = G.pick(Object.keys(D.SKIN_TONES)); draft.height = G.pick(Object.keys(D.HEIGHTS)); draft.build = G.pick(Object.keys(D.BUILDS)); draft.outfit = G.pick(Object.keys(D.OUTFITS)); draft.background = G.pick(Object.keys(D.BACKGROUNDS)); if (!draft.name) draft.name = G.pick(D.GEN_FIRST); G.openCreator(); };
  const nx = A.querySelector('#cc-next'); if (nx) nx.onclick = () => { ccTab = TABS[idx + 1][0]; G.openCreator(); };
  A.querySelector('#cc-start').onclick = () => { if (!draft.name.trim()) draft.name = G.pick(D.GEN_FIRST); G.startNew(JSON.parse(JSON.stringify(Object.assign({}, draft, { name: draft.name.trim().slice(0, 20) })))); };
};
G.startNew = function (o) {
  G.S = G.newState(o);
  G.S.started = true;
  G.S.settings.theme = document.documentElement.dataset.theme || 'dark';
  G.applySettings(); G.showGame();
  G.log(`You arrived in ${D.TOWN} to live with Aunt Nell and start at Wetinburg High.`);
  G.goto(() => {
    G.hr(`Welcome to ${D.TOWN}`);
    G.say(`<p>The removal van left yesterday. Your new bedroom still smells of fresh paint, and boxes are stacked against the wall. Outside your window, the little seaside town of <b>${D.TOWN}</b> is waking up: gulls over the docks, the clock tower in the square, and far off, the dark green line of Whisperwood.</p>`);
    const first = G.isSchoolDay() ? 'first day at Wetinburg High today! Registration is at 08:45, don\'t be late. Your uniform is on the chair.' : G.seasonIdx() === 3 ? 'it\'s the summer holidays, so no school until Autumn — go and explore!' : 'no school today, so settle in — Wetinburg High starts tomorrow. Your uniform is on the chair.';
    G.say(`<p>Aunt Nell — a nurse at St. Brigid's who works far too many night shifts — has left a note on the kitchen table:</p><blockquote>"${G.pn()}, love — ${first} There's bread for toast, and pocket money every Monday. Be good, be kind, and have fun. — N. x"</blockquote>`);
    G.say(`<p class="small dim">It is ${G.dateStr()}. Difficulty: ${G.diff().name}.</p>`);
    G.say(`<p class="small dim">Tip: Choices appear below. Menus at the top show your Characteristics, Inventory, Relationships, Map and more. Time passes as you act. Number keys 1–9 pick choices. Your game autosaves after every choice.</p>`);
    G.ch('Get up and start the day', () => G.goto(G.here), { cls: 'main' });
  });
  G.autosave();
};

/* ---------- boot ---------- */
G.boot = function () {
  G.applySettings();
  $('#btn-new').onclick = () => { ccTab = 'character'; G.openCreator(); };
  $('#btn-continue').onclick = () => { try { G.loadFrom('auto'); } catch (e) { console.error(e); alert('Could not load autosave: ' + e.message); } };
  $('#btn-load').onclick = () => G.menus.save();
  $('#btn-theme-title').onclick = () => { const t = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; document.documentElement.dataset.theme = t; G.store.set('wd_theme', t); };
  document.querySelectorAll('[data-menu]').forEach(b => b.onclick = () => G.menu(b.dataset.menu));
  $('#btn-title').onclick = () => { if (confirm('Return to the title screen? (Your game is autosaved.)')) { if (G.S) G.autosave(); G.showTitle(); } };
  $('#btn-themetoggle').onclick = () => { if (!G.S) return; G.S.settings.theme = G.S.settings.theme === 'light' ? 'dark' : 'light'; G.applySettings(); };
  $('#modal-close').onclick = G.closeModal;
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') G.closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (e.key === 'Escape') { G.closeModal(); return; }
    if ($('#modal').classList.contains('open') || $('#game').classList.contains('hidden')) return;
    const n = parseInt(e.key, 10); if (n >= 1 && n <= 9) { const b = document.querySelectorAll('#choices .choice')[n - 1]; if (b && !b.disabled) b.click(); }
    const map = { c: 'stats', i: 'inventory', w: 'wardrobe', r: 'relationships', m: 'map', j: 'journal', t: 'traits', s: 'save' };
    if (map[e.key]) G.menu(map[e.key]);
  });
  window.addEventListener('error', (e) => { G.lastError = e.error || e.message; });
  G.showTitle();
};
document.addEventListener('DOMContentLoaded', G.boot);
})(window.G);
