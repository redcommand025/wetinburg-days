/* Wetinburg Days — core engine: state, time, weather, stats, skills, helpers */
(function (G) {
'use strict';
const D = G.DATA;

/* ---------- random & util ---------- */
G.rnd = () => Math.random();
G.ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
G.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
G.chance = (p) => Math.random() < p;
G.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
G.weighted = (list) => { // [{w, ...}]
  const tot = list.reduce((s, e) => s + Math.max(0, e.w), 0);
  if (tot <= 0) return null;
  let r = Math.random() * tot;
  for (const e of list) { r -= Math.max(0, e.w); if (r <= 0) return e; }
  return list[list.length - 1];
};
G.cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
G.money = (n) => '£' + (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0);
G.esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- difficulty ---------- */
G.DIFF = {
  relaxed: { name: 'Relaxed', money: 20, drain: 0.8, wage: 1.25, desc: 'More starting money, slower hunger/stamina/stress, better pay.' },
  normal: { name: 'Normal', money: 0, drain: 1, wage: 1, desc: 'The intended balance.' },
  challenging: { name: 'Challenging', money: -15, drain: 1.2, wage: 0.85, desc: 'Less money, faster needs, lower pay.' },
};
G.diff = () => G.DIFF[(G.S && G.S.settings.difficulty) || 'normal'] || G.DIFF.normal;

/* ---------- new state ---------- */
G.newState = function (o) {
  const S = {
    v: 4,
    player: {
      name: o.name || 'Alex', sex: o.sex || 'female', pres: o.pres || 'fem', pron: o.pron || 'she', age: 16, background: o.background || 'bookish',
      look: { hair: o.hair || 'long', hairColor: o.hairColor || 'brown', eyes: o.eyes || 'brown', skin: o.skin || 'light', height: o.height || 'average', build: o.build || 'average' },
      worn: { top: 'uniform_blazer', bottom: o.bottom || 'uniform_skirt', full: null, shoes: 'school_shoes', head: null, face: null, neck: null },
      outfit: o.outfit || 'tee_jeans',
      tattoos: [], transforms: [], traits: [],
    },
    time: ((o.season || 0) * D.SEASON_LEN) * 1440 + 7 * 60, // 07:00 Monday 1st of the chosen season, Year 1
    loc: 'home',
    stats: {}, base: {}, skills: {}, grades: {},
    cond: { health: 100, stamina: 90, stress: 15, mood: 60, hunger: 20, hygiene: 85, rep: 50, schoolRep: 50 },
    money: 30,
    att: { honesty: 0, rules: 0, confront: 0, kindness: 0 },
    inv: { bread_roll: 1, apple: 2 }, wardrobe: ['uniform_blazer', 'uniform_trousers', 'uniform_skirt', 'school_shoes', 'tshirt', 'jeans', 'sneakers'],
    npcs: {}, npcCfg: {},
    weather: {},
    school: { attended: {}, late: 0, absences: 0, homework: [], detention: null, detentionsServed: 0, detentionsMissed: 0, clubs: [], exams: [], warnings: 0, lastLateForgive: -99, popQuizzes: 0 },
    farm: { plots: [], plotsOwned: 2, animals: {}, access: false },
    jobs: {},
    record: { caught: 0, fines: 0, community: 0, unpaid: 0 },
    flags: {}, counters: {}, log: [], evCooldown: {}, ill: {}, quests: {},
    settings: { theme: 'dark', eventRate: o.eventRate || 1, fontSize: 16, autosave: true, difficulty: o.difficulty || 'normal' },
    world: { startSeason: o.season || 0, difficulty: o.difficulty || 'normal', eventRate: o.eventRate || 1 },
    sleeping: false, pending: [], lastWake: ((o.season || 0) * D.SEASON_LEN) * 1440 + 7 * 60, discount: null,
  };
  for (const k in D.STATS) { S.stats[k] = D.STATS[k].base; S.base[k] = D.STATS[k].base; }
  S.stats.purity = 70;
  for (const k in D.SKILLS) S.skills[k] = 0;
  const bg = D.BACKGROUNDS[S.player.background];
  for (const sub in D.SUBJECTS) if (!D.SUBJECTS[sub].gradeAs) S.grades[sub] = 150 + G.ri(0, 80) + (bg.grades || 0);
  if (bg.stats) for (const k in bg.stats) { S.stats[k] += bg.stats[k]; S.base[k] += Math.round(bg.stats[k] * 0.7); }
  if (bg.skills) for (const k in bg.skills) S.skills[k] = bg.skills[k];
  S.money += bg.money || 0;
  S.money = Math.max(5, S.money + (G.DIFF[S.settings.difficulty] || G.DIFF.normal).money);
  const oft = D.OUTFITS[S.player.outfit] || D.OUTFITS.tee_jeans;
  oft.items.forEach(it => { if (!S.wardrobe.includes(it)) S.wardrobe.push(it); });
  for (const id in D.NPCS) {
    const n = D.NPCS[id];
    S.npcs[id] = { fr: 0, tr: 10, ro: 0, met: false, status: 'none', chapter: 0, lastTalk: -1, lastGift: -1, talks: 0, lastSeen: -1, lastDate: -99, jealous: 0 };
    const c = (o.npcCfg && o.npcCfg[id]) || n;
    S.npcCfg[id] = { sex: c.sex || n.sex, pres: c.pres || n.pres, pron: c.pron || n.pron };
  }
  for (let i = 0; i < 6; i++) S.farm.plots.push({ crop: null, growth: 0, watered: -1, planted: -1, dry: 0 });
  for (const a in D.ANIMALS) S.farm.animals[a] = { happy: 50, fed: -1, brushed: -1, collected: -1 };
  const d0 = (o.season || 0) * D.SEASON_LEN;
  for (let d = d0; d < d0 + 4; d++) G.genWeather(S, d);
  return S;
};

/* ---------- time ---------- */
G.day = () => Math.floor(G.S.time / 1440);
G.mod_ = () => G.S.time % 1440;           // minute of day
G.hour = () => G.mod_() / 60;
G.weekday = (d) => ((d === undefined ? G.day() : d) % 7);
G.seasonIdx = (d) => Math.floor(((d === undefined ? G.day() : d) % (D.SEASON_LEN * 4)) / D.SEASON_LEN);
G.season = (d) => D.SEASONS[G.seasonIdx(d)];
G.seasonDay = (d) => ((d === undefined ? G.day() : d) % D.SEASON_LEN) + 1;
G.year = (d) => Math.floor((d === undefined ? G.day() : d) / (D.SEASON_LEN * 4)) + 1;
G.isWeekend = (d) => G.weekday(d) >= 5;
G.ord = (n) => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');
G.timeStr = (m) => { m = m === undefined ? G.mod_() : m; const h = Math.floor(m / 60) % 24, mm = Math.floor(m % 60); return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); };
G.dateStr = (d) => { d = d === undefined ? G.day() : d; return `${D.DAYS[G.weekday(d)]}, ${G.ord(G.seasonDay(d))} of ${G.season(d)}, Year ${G.year(d)}`; };
G.shortDate = (d) => `${D.DAYS[G.weekday(d)].slice(0, 3)} ${G.seasonDay(d)} ${G.season(d).slice(0, 3)} Y${G.year(d)}`;
G.phase = () => { const h = G.hour(); return h < 5 ? 'night' : h < 7 ? 'dawn' : h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 20.5 ? 'evening' : 'night'; };
G.isDark = () => { const h = G.hour(), s = G.seasonIdx(); const set = [18.5, 17, 19.5, 21][s], rise = [7, 7.8, 6.2, 5.2][s]; return h < rise || h >= set; };
G.holiday = (d) => { d = d === undefined ? G.day() : d; const s = G.seasonIdx(d), sd = G.seasonDay(d); return s === 3 || (s === 1 && sd >= 26) || (s === 2 && sd === 1); };
G.isSchoolDay = (d) => !G.isWeekend(d) && !G.holiday(d);
G.examDay = (d) => { d = d === undefined ? G.day() : d; return G.isSchoolDay(d) && G.seasonIdx(d) < 3 && G.seasonDay(d) >= 22 && G.seasonDay(d) <= 25; };
G.specialDay = (d) => {
  d = d === undefined ? G.day() : d; const s = G.seasonIdx(d), sd = G.seasonDay(d);
  if (s === 0 && sd === 19) return 'sports_day';
  if (s === 0 && sd === 31 - 3) return null;
  if (s === 1 && sd === 21) return 'winter_fair';
  if (s === 2 && sd === 19) return 'school_festival';
  if (s === 3 && sd === 14) return 'summer_fireworks';
  return null;
};
G.SPECIAL_NAMES = { sports_day: 'Sports Day', winter_fair: 'Winter Lantern Fair', school_festival: 'School Culture Festival', summer_fireworks: 'Gull Bay Fireworks Night' };

/* ---------- weather ---------- */
G.WEATHER = {
  sunny: { name: 'Sunny', icon: '☀️', travel: 1.0, mood: 0.6, stress: -0.2 },
  cloudy: { name: 'Cloudy', icon: '☁️', travel: 1.0, mood: 0, stress: 0 },
  rain: { name: 'Rain', icon: '🌧️', travel: 1.2, mood: -0.4, stress: 0.1, wet: true },
  storm: { name: 'Thunderstorm', icon: '⛈️', travel: 1.5, mood: -0.8, stress: 0.4, wet: true },
  snow: { name: 'Snow', icon: '❄️', travel: 1.4, mood: 0.2, stress: 0, cold: true },
  fog: { name: 'Fog', icon: '🌫️', travel: 1.15, mood: -0.2, stress: 0.1 },
  heatwave: { name: 'Heatwave', icon: '🔥', travel: 1.1, mood: -0.2, stress: 0.3, hot: true },
};
const WW = [
  { sunny: 25, cloudy: 30, rain: 25, storm: 8, fog: 12 },
  { sunny: 15, cloudy: 30, rain: 15, snow: 28, storm: 4, fog: 8 },
  { sunny: 35, cloudy: 25, rain: 28, storm: 5, fog: 7 },
  { sunny: 45, cloudy: 15, rain: 10, storm: 8, heatwave: 22 },
];
G.genWeather = function (S, d) {
  if (S.weather[d]) return S.weather[d];
  const w = WW[G.seasonIdx(d)];
  const prev = S.weather[d - 1];
  let type;
  if (prev && w[prev.type] && Math.random() < 0.35) type = prev.type;
  else type = G.weighted(Object.keys(w).map(k => ({ k, w: w[k] }))).k;
  const baseT = [12, 3, 13, 23][G.seasonIdx(d)];
  const temp = baseT + G.ri(-3, 3) + (type === 'heatwave' ? 9 : type === 'snow' ? -4 : type === 'sunny' ? 2 : type === 'storm' ? -2 : 0);
  S.weather[d] = { type, temp };
  return S.weather[d];
};
G.weather = (d) => G.genWeather(G.S, d === undefined ? G.day() : d);
G.wx = () => G.WEATHER[G.weather().type];
G.weatherLine = function () {
  const w = G.weather().type, p = G.phase(), dark = G.isDark();
  const L = {
    sunny: dark ? ['The sky is clear and full of stars.', 'A cloudless night; the moon is bright.'] : ['Sunlight spills across everything.', 'The sky is a clean, cheerful blue.', 'Warm sunshine lifts your spirits.'],
    cloudy: ['Grey clouds drift low overhead.', 'The sky is a flat, pearly grey.', 'Clouds roll slowly across the sky.'],
    rain: ['Rain patters steadily on every surface.', 'Puddles gather in the gutters as it rains.', 'A cold drizzle hangs in the air.'],
    storm: ['Thunder rumbles; rain lashes sideways.', 'Lightning flickers over the rooftops.', 'The wind howls and the rain is relentless.'],
    snow: ['Snow falls softly, muffling the town.', 'Everything is dusted white.', 'Your breath fogs in the snowy air.'],
    fog: ['Thick fog swallows everything beyond a few metres.', 'Shapes loom out of the mist and vanish again.'],
    heatwave: dark ? ['Even at night the air is thick and hot.'] : ['The heat shimmers off the pavement.', 'The air is heavy and blazing hot.'],
  };
  return G.pick(L[w]) + (p === 'dawn' ? ' The day is just beginning.' : p === 'evening' ? ' Evening light softens the edges of things.' : '');
};

/* ---------- names & pronouns ---------- */
const PR = {
  he: { he: 'he', him: 'him', his: 'his', hers: 'his', self: 'himself', is: 'is', s: 's', was: 'was', has: 'has' },
  she: { he: 'she', him: 'her', his: 'her', hers: 'hers', self: 'herself', is: 'is', s: 's', was: 'was', has: 'has' },
  they: { he: 'they', him: 'them', his: 'their', hers: 'theirs', self: 'themself', is: 'are', s: '', was: 'were', has: 'have' },
};
G.PR = PR;
G.npcPron = (id) => PR[(G.S.npcCfg[id] || D.NPCS[id]).pron] || PR.they;
G.he = (id) => G.npcPron(id).he; G.He = (id) => G.cap(G.he(id));
G.him = (id) => G.npcPron(id).him; G.his = (id) => G.npcPron(id).his; G.His = (id) => G.cap(G.his(id));
G.is = (id) => G.npcPron(id).is; G.s = (id) => G.npcPron(id).s; G.has = (id) => G.npcPron(id).has;
G.kin = (id, kind) => { const p = G.S.npcCfg[id].pron; const m = { grand: ['grandad', 'grandma', 'grandparent'], parent: ['dad', 'mum', 'parent'], sib: ['brother', 'sister', 'sibling'] }[kind || 'grand']; return p === 'he' ? m[0] : p === 'she' ? m[1] : m[2]; };
G.honor = (id) => { const n = D.NPCS[id]; if (n.fixedTitle) return n.fixedTitle; const p = G.S.npcCfg[id].pron; return p === 'he' ? 'Mr.' : p === 'she' ? 'Ms.' : 'Mx.'; };
G.nm = (id) => { const n = D.NPCS[id]; if (!n) return id; if (n.title || n.fixedTitle) return G.honor(id) + ' ' + n.last; return n.nick || n.first; };
G.fullName = (id) => { const n = D.NPCS[id]; return (n.title || n.fixedTitle ? G.honor(id) + ' ' : '') + n.first + ' ' + n.last; };
G.ptext = function (id, str) {
  if (!str || str.indexOf('{') < 0) return str;
  return str.replace(/\{(he|him|his|He|His|self|s|es|ies|is|has|was|kin|Kin|nm):?([a-z_]*)\}/g, (m, k, oid) => {
    const who = oid || id; if (!who || !D.NPCS[who]) return m;
    if (k === 'nm') return G.nm(who);
    const P = G.npcPron(who), they = P.he === 'they';
    switch (k) {
      case 'he': return P.he; case 'He': return G.cap(P.he); case 'him': return P.him; case 'his': return P.his; case 'His': return G.cap(P.his); case 'self': return P.self;
      case 's': return they ? '' : 's'; case 'es': return they ? '' : 'es'; case 'ies': return they ? 'y' : 'ies';
      case 'is': return P.is; case 'has': return P.has; case 'was': return P.was;
      case 'kin': return G.kin(who, 'grand'); case 'Kin': return G.cap(G.kin(who, 'grand'));
    }
    return m;
  });
};
G.pp = () => PR[G.S.player.pron] || PR.they; // player pronouns (used by NPCs talking about you)
G.addr = (formal) => { const g = ({ he: 'male', she: 'female' })[G.S.player.pron] || 'x'; if (formal) return g === 'male' ? 'young man' : g === 'female' ? 'young lady' : 'young one'; return g === 'male' ? 'dude' : g === 'female' ? 'girl' : 'friend'; };
G.pn = () => G.esc(G.S.player.name);
G.honorP = () => { const g = ({ he: 'male', she: 'female' })[G.S.player.pron] || 'x'; return g === 'male' ? 'Mr.' : g === 'female' ? 'Ms.' : 'Mx.'; };
G.surnameP = () => G.honorP() + ' ' + G.pn();

/* ---------- stats ---------- */
G.stat = (k) => G.S.stats[k];
G.statTier = (k) => { const t = D.STATS[k].tiers; return t[Math.min(t.length - 1, Math.floor(G.S.stats[k] / (100 / t.length)))]; };
G.gain = function (k, amt, quiet) {
  const S = G.S; if (amt === 0) return 0;
  let a = amt;
  if (a > 0) {
    if (k === 'physique' && G.hasTrait('athlete')) a *= 1.2;
    if (k === 'purity' && G.hasTf('demon')) a *= 0.6;
    if (k === 'awareness' && G.hasTrait('night_owl') && G.isDark()) a *= 1.2;
    a *= Math.max(0.15, 1 - S.stats[k] / 115);
  }
  const before = S.stats[k];
  S.stats[k] = G.clamp(S.stats[k] + a, 0, 100);
  if (a > 0) S.base[k] = G.clamp(S.base[k] + a * 0.22, 0, 90);
  else S.base[k] = G.clamp(S.base[k] + a * 0.1, 5, 90);
  const d = S.stats[k] - before;
  if (!quiet && Math.abs(d) >= 0.05) G.note(`${D.STATS[k].name} ${d > 0 ? '+' : ''}${d.toFixed(1)}`, d > 0 ? 'up' : 'down');
  return d;
};
G.tierOf = (xp) => D.TIERS[G.clamp(Math.floor(xp / 100), 0, 10)];
G.tierIdx = (xp) => G.clamp(Math.floor(xp / 100), 0, 10);
G.skill = (k) => G.S.skills[k] || 0;
G.skillTier = (k) => G.tierOf(G.skill(k));
G.xp = function (k, amt, quiet) {
  const S = G.S; const sk = D.SKILLS[k]; if (!sk) return;
  let a = amt * (0.7 + S.stats[sk.stat] / 100);
  if (sk.group === 'Skulduggery' && G.hasTrait('sticky_fingers')) a *= 1.1;
  if (k === 'tending' && G.hasTf('fox')) a *= 1.2;
  a *= Math.max(0.25, 1 - S.skills[k] / 1300);
  const t0 = G.tierOf(S.skills[k]);
  S.skills[k] = G.clamp(S.skills[k] + a, 0, 1100);
  const t1 = G.tierOf(S.skills[k]);
  if (!quiet) G.note(`${sk.name} +${a.toFixed(0)}xp`, 'up');
  if (t0 !== t1) { G.note(`${sk.name} reached ${t1}!`, 'big'); G.log(`Your ${sk.name} skill improved to ${t1}.`); }
};
G.gradeKey = (sub) => D.SUBJECTS[sub].gradeAs || sub;
G.grade = (sub) => G.S.grades[G.gradeKey(sub)] || 0;
G.gradeXP = function (sub, amt, quiet) {
  const k = G.gradeKey(sub); let a = amt;
  if (a > 0) { if (G.hasTrait('bookworm')) a *= 1.25; if (G.hasTrait('teachers_pet')) a *= 1.1; a *= Math.max(0.3, 1 - G.S.grades[k] / 1300); }
  const t0 = G.tierOf(G.S.grades[k]);
  G.S.grades[k] = G.clamp(G.S.grades[k] + a, 0, 1100);
  const t1 = G.tierOf(G.S.grades[k]);
  if (!quiet) G.note(`${D.SUBJECTS[k].name} grade ${a >= 0 ? '+' : ''}${a.toFixed(0)}`, a >= 0 ? 'up' : 'down');
  if (t0 !== t1) G.log(`Your ${D.SUBJECTS[k].name} grade is now ${t1}.`);
};

/* ---------- condition ---------- */
G.c = (k) => G.S.cond[k];
G.mod = function (k, amt, quiet) {
  const S = G.S; let a = amt;
  if (k === 'stress' && a > 0) { if (G.hasTrait('iron_will')) a *= 0.8; a *= 1.15 - S.stats.willpower / 200; }
  const before = S.cond[k];
  S.cond[k] = G.clamp(S.cond[k] + a, 0, 100);
  const d = S.cond[k] - before;
  if (!quiet && Math.abs(d) >= 1) {
    const good = (k === 'stress' || k === 'hunger') ? d < 0 : d > 0;
    const label = { health: 'Health', stamina: 'Stamina', stress: 'Stress', mood: 'Mood', hunger: 'Hunger', hygiene: 'Hygiene', rep: 'Reputation', schoolRep: 'School rep' }[k];
    G.note(`${label} ${d > 0 ? '+' : ''}${Math.round(d)}`, good ? 'up' : 'down');
  }
  return d;
};
G.apply = function (fx) { if (!fx) return; for (const k in fx) { if (k in G.S.cond) G.mod(k, fx[k]); else if (k in G.S.stats) G.gain(k, fx[k]); else if (k === 'money') G.earn(fx[k]); } };
G.earn = (n) => { G.S.money = Math.round((G.S.money + n) * 100) / 100; if (n) G.note(`${n > 0 ? '+' : '−'}${G.money(Math.abs(n))}`, n > 0 ? 'up' : 'down'); };
G.canPay = (n) => G.S.money >= n;
G.pay = (n) => { if (G.S.money < n) return false; G.earn(-n); return true; };
G.att = (k, amt) => { const S = G.S; const b = S.att[k]; S.att[k] = G.clamp(S.att[k] + amt, -100, 100); if (Math.abs(S.att[k] - b) >= 1) G.note(`${D.ATTITUDES[k].name}: ${amt > 0 ? D.ATTITUDES[k].hi : D.ATTITUDES[k].lo}`, 'att'); };

/* ---------- inventory ---------- */
G.has = (id, n) => (G.S.inv[id] || 0) >= (n || 1);
G.give = (id, n) => { n = n || 1; G.S.inv[id] = (G.S.inv[id] || 0) + n; G.note(`+${n} ${D.ITEMS[id] ? D.ITEMS[id].name : id}`, 'item'); };
G.take = (id, n) => { n = n || 1; if (!G.has(id, n)) return false; G.S.inv[id] -= n; if (G.S.inv[id] <= 0) delete G.S.inv[id]; return true; };
G.ownCloth = (id) => G.S.wardrobe.includes(id);

/* ---------- traits & transforms ---------- */
G.hasTrait = (t) => G.S && G.S.player.traits.includes(t);
G.hasTf = (t) => G.S && G.S.player.transforms.includes(t);
G.cnt = (k, n) => { G.S.counters[k] = (G.S.counters[k] || 0) + (n === undefined ? 1 : n); return G.S.counters[k]; };
G.count = (k) => G.S.counters[k] || 0;
G.flag = (k, v) => { if (v === undefined) return G.S.flags[k]; G.S.flags[k] = v; };
G.unlockTrait = function (t) { if (G.hasTrait(t)) return; G.S.player.traits.push(t); G.note(`Trait unlocked: ${D.TRAITS[t].name}`, 'big'); G.log(`<b>Trait gained — ${D.TRAITS[t].name}.</b> ${D.TRAITS[t].bonus}`); };
G.checkTraits = function () {
  const S = G.S;
  if (G.count('earlyWake') >= 7) G.unlockTrait('early_bird');
  if (G.count('lateNight') >= 7) G.unlockTrait('night_owl');
  if (G.count('study') >= 20) G.unlockTrait('bookworm');
  if (G.count('harvest') >= 15) G.unlockTrait('green_thumb');
  if (G.count('crimeOK') >= 10) G.unlockTrait('sticky_fingers');
  if (G.skill('athletics') >= 400) G.unlockTrait('athlete');
  if (Object.values(S.npcs).filter(r => r.fr >= 50).length >= 5) G.unlockTrait('social_butterfly');
  if (S.att.honesty >= 60) G.unlockTrait('honest_soul');
  if (G.count('animalCare') >= 20) G.unlockTrait('animal_whisperer');
  if (S.cond.schoolRep >= 80) G.unlockTrait('teachers_pet');
  if (G.skill('swimming') >= 500) G.unlockTrait('water_baby');
  if (G.skill('cooking') >= 400) G.unlockTrait('home_chef');
  if (G.skill('art') >= 400 || G.skill('music') >= 400) G.unlockTrait('artist_soul');
  if (S.stats.willpower >= 70) G.unlockTrait('iron_will');
};
G.addTf = function (t) { if (G.hasTf(t)) return; G.S.player.transforms.push(t); G.note(`Transformation: ${D.TRANSFORMS[t].name}`, 'big'); G.log(`<b>Transformation — ${D.TRANSFORMS[t].name}.</b> You gained: ${D.TRANSFORMS[t].parts}. ${D.TRANSFORMS[t].perk}`); };
G.removeTf = function (t) { G.S.player.transforms = G.S.player.transforms.filter(x => x !== t); G.log(`The ${D.TRANSFORMS[t].parts.toLowerCase()} fade away.`); };

/* ---------- relationships ---------- */
G.rel = (id) => G.S.npcs[id];
G.friend = function (id, amt, quiet) {
  const r = G.rel(id); let a = amt;
  if (a > 0) { if (G.hasTrait('social_butterfly')) a *= 1.2; if (G.hasTf('fox')) a *= 1.1; a *= Math.max(0.3, 1 - Math.max(0, r.fr) / 140); }
  r.fr = G.clamp(r.fr + a, -100, 100); r.met = true;
  if (!quiet && Math.abs(a) >= 0.5) G.note(`${G.nm(id)} friendship ${a > 0 ? '+' : ''}${a.toFixed(0)}`, a > 0 ? 'heart' : 'down');
};
G.trust = function (id, amt) { const r = G.rel(id); let a = amt; if (a > 0 && G.hasTrait('honest_soul')) a *= 1.25; r.tr = G.clamp(r.tr + a, 0, 100); if (Math.abs(a) >= 1) G.note(`${G.nm(id)} trust ${a > 0 ? '+' : ''}${a.toFixed(0)}`, a > 0 ? 'heart' : 'down'); };
G.romance = function (id, amt) { const n = D.NPCS[id]; if (!n.romance) return; const r = G.rel(id); let a = amt; if (a > 0) a *= Math.max(0.3, 1 - r.ro / 150); r.ro = G.clamp(r.ro + a, 0, 100); if (Math.abs(a) >= 0.5) G.note(`${G.nm(id)} romance ${a > 0 ? '+' : ''}${a.toFixed(0)}`, a > 0 ? 'love' : 'down'); };
G.relLabel = function (id) {
  const r = G.rel(id); if (!r.met) return 'Stranger';
  if (r.status === 'dating') return 'Dating 💕';
  const f = r.fr;
  let s = f <= -40 ? 'Rival' : f < -10 ? 'Unfriendly' : f < 15 ? 'Acquaintance' : f < 40 ? 'Friendly' : f < 65 ? 'Friend' : f < 85 ? 'Close friend' : 'Best friend';
  if (r.status === 'crush' || (D.NPCS[id].romance && r.ro >= 35 && r.status !== 'ex')) s += ' · has a crush';
  if (r.status === 'ex') s += ' · ex';
  return s;
};
G.partner = () => Object.keys(G.S.npcs).find(id => G.S.npcs[id].status === 'dating');

/* ---------- journal & notes ---------- */
G.log = function (text) { G.S.log.unshift({ t: G.S.time, text }); if (G.S.log.length > 300) G.S.log.length = 300; };
G._notes = [];
G.note = function (text, kind) { G._notes.push({ text, kind: kind || 'info' }); };

/* ---------- outfit ---------- */
G.wornItems = () => { const w = G.S.player.worn; return Object.keys(w).map(k => w[k]).filter(Boolean); };
G.inUniform = () => { const w = G.S.player.worn; return !w.full && D.CLOTHES[w.top] && D.CLOTHES[w.top].uniform && D.CLOTHES[w.bottom] && D.CLOTHES[w.bottom].uniform; };
G.outfitBeauty = () => G.wornItems().reduce((s, id) => s + ((D.CLOTHES[id] && D.CLOTHES[id].beauty) || 0), 0);
G.warmth = () => G.wornItems().reduce((s, id) => s + ((D.CLOTHES[id] && D.CLOTHES[id].warmth) || 0), 0);
G.rainProof = () => G.has('umbrella') || G.wornItems().some(id => D.CLOTHES[id] && D.CLOTHES[id].rain);
G.effBeauty = () => G.clamp(G.S.stats.beauty + G.outfitBeauty() * 1.2 + (G.S.cond.hygiene - 60) / 6 + (G.hasTf('fox') ? 5 : 0), 0, 120);

/* ---------- time advance ---------- */
G.advance = function (mins, opts) {
  opts = opts || {}; const S = G.S;
  let left = Math.max(0, Math.round(mins));
  while (left > 0) {
    const step = Math.min(left, 5); left -= step;
    const prevMod = S.time % 1440, prevDay = G.day();
    S.time += step;
    const sleeping = opts.sleep;
    const w = G.wx();
    // rates per minute
    const mult = opts.rate || 1, dm = G.diff().drain;
    S.cond.hunger = G.clamp(S.cond.hunger + step * (sleeping ? 0.025 : 0.055) * dm, 0, 100);
    S.cond.hygiene = G.clamp(S.cond.hygiene - step * (sleeping ? 0.01 : 0.022) * (w.hot ? 1.6 : 1), 0, 100);
    if (sleeping) {
      S.cond.stamina = G.clamp(S.cond.stamina + step * 0.22, 0, 100);
      S.cond.stress = G.clamp(S.cond.stress - step * 0.02, 0, 100);
      S.cond.health = G.clamp(S.cond.health + step * 0.02, 0, 100);
    } else {
      let drain = 0.05 * mult * (w.hot ? 1.2 : 1) * dm;
      if (G.hasTrait('athlete') && opts.walk) drain *= 0.8;
      S.cond.stamina = G.clamp(S.cond.stamina - step * drain, 0, 100);
      let st = (w.stress || 0) * 0.01 + (S.cond.hunger > 80 ? 0.03 : 0) + (S.cond.stamina < 15 ? 0.03 : 0) - 0.006;
      if (G.isDark() && G.hasTrait('night_owl')) st -= 0.005;
      S.cond.stress = G.clamp(S.cond.stress + step * (st > 0 ? st * dm : st), 0, 100);
    }
    // mood drift toward a target shaped by stress, weather, hunger
    const target = G.clamp(55 + (w.mood || 0) * 15 - S.cond.stress * 0.35 - (S.cond.hunger > 75 ? 12 : 0) + (S.cond.hygiene < 25 ? -8 : 0) + (G.hasTf('wings') && G.weather().type === 'sunny' ? 6 : 0), 5, 95);
    S.cond.mood += (target - S.cond.mood) * 0.004 * step;
    if (S.cond.hunger >= 95) S.cond.health = G.clamp(S.cond.health - step * 0.04, 0, 100);
    else if (S.cond.hunger < 60 && !sleeping) S.cond.health = G.clamp(S.cond.health + step * 0.004, 0, 100);
    if (S.ill.cold) S.cond.health = G.clamp(S.cond.health - step * 0.004, 0, 100);
    // thresholds crossed
    const mod = S.time % 1440;
    if (G.day() !== prevDay) G.newDay(sleeping);
    const crossed = (t) => prevMod < t && mod >= t;
    if (G.isSchoolDay() && crossed(15 * 60 + 20)) G.schoolDayEnd();
    if (crossed(16 * 60 + 35) && S.school.detention === G.day() && !S.school.detServed) { S.school.detentionsMissed++; S.school.detention = null; G.mod('schoolRep', -6, true); G.log('You skipped detention. That will not go unnoticed.'); S.flags.skippedDetention = (S.flags.skippedDetention || 0) + 1; }
    if (!sleeping && S.cond.stamina <= 0 && !S.pending.includes('passout')) S.pending.push('passout');
    if (S.cond.health <= 0 && !S.pending.includes('collapse')) S.pending.push('collapse');
  }
};
G.newDay = function (sleeping) {
  const S = G.S; const d = G.day();
  for (let i = 0; i < 4; i++) G.genWeather(S, d + i);
  // clean old weather
  for (const k in S.weather) if (+k < d - 2) delete S.weather[k];
  if (!sleeping) G.cnt('lateNight');
  // stat decay toward baseline
  for (const k in S.stats) {
    let rate = 0.04;
    if (k === 'purity' && (G.hasTrait('honest_soul') || G.hasTf('angel'))) rate = 0.015;
    S.stats[k] += (S.base[k] - S.stats[k]) * rate;
  }
  // grades slowly fade
  for (const k in S.grades) S.grades[k] = Math.max(0, S.grades[k] - 0.6);
  // farm growth
  if (G.Farm) G.Farm.overnight();
  // illness
  if (S.ill.cold) { S.ill.cold--; if (S.ill.cold <= 0) { delete S.ill.cold; G.log('Your cold has cleared up.'); } }
  // tattoos (henna fades)
  S.player.tattoos = S.player.tattoos.filter(t => { if (!t.perm && t.expires <= d) { G.log(`Your henna ${t.design} on your ${D.TATTOO_PLACES[t.place].toLowerCase()} has faded away.`); return false; } return true; });
  // relationships: decay of neglected bonds, partner neglect
  for (const id in S.npcs) {
    const r = S.npcs[id];
    if (r.met && d - r.lastTalk > 5 && r.fr > 20) r.fr -= 0.3;
    if (r.status === 'dating' && d - Math.max(r.lastTalk, r.lastDate) > 6) { r.ro -= 1.5; if (r.ro < 25) { r.status = 'ex'; r.fr -= 10; G.log(`${G.nm(id)} sent you a message: "I feel like we've drifted apart. I think we should just be friends." You are no longer dating.`); } }
    if (r.jealous > 0) r.jealous = Math.max(0, r.jealous - 1);
  }
  // birthday / new year
  if (d % (D.SEASON_LEN * 4) === 0 && d > 0) { S.player.age++; G.log(`A new school year begins. You are now ${S.player.age}.`); }
  // season change log
  if (G.seasonDay(d) === 1) G.log(`<b>${G.season(d)} has arrived in Wetinburg.</b>`);
  // daily resets
  S.flags.today = {};
  S.discount = (S.discount && S.discount.day === d) ? S.discount : null;
  if (S.flags.busPassUntil && S.flags.busPassUntil < d) { delete S.flags.busPassUntil; G.log('Your bus pass has expired.'); }
  if (G.specialDay(d)) G.log(`Today is the <b>${G.SPECIAL_NAMES[G.specialDay(d)]}</b>!`);
  if (G.examDay(d) && G.seasonDay(d) === 22) G.log('<b>Exam week begins today.</b> Every lesson this week is an exam.');
  if (S.record.unpaid > 0 && d % 7 === 0) { G.mod('rep', -2, true); G.log(`You still owe ${G.money(S.record.unpaid)} in fines at the police station.`); }
  G.checkTraits();
};
G.today = () => { G.S.flags.today = G.S.flags.today || {}; return G.S.flags.today; };
})(window.G);
