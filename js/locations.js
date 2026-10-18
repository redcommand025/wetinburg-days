/* Wetinburg Days — locations: the main "here" scene and per-location actions */
(function (G) {
'use strict';
const D = G.DATA;
const say = (h) => G.say(h), ch = (l, f, o) => G.ch(l, f, o);
const back = () => G.goto(G.here);
const A = G.Actions = {};
const NURSE = 'the school nurse';

/* ---------- interrupts ---------- */
G.handlePending = function () {
  const S = G.S; if (!S.pending.length) return false;
  const p = S.pending.shift();
  if (p === 'passout') {
    S.pending = S.pending.filter(x => x !== 'passout');
    const home = S.loc === 'home';
    G.goto(() => {
      G.hr('You collapse from exhaustion');
      say(`<p>The world tilts. Your legs give way and everything goes dark…</p>`);
      const wake = () => {
        if (home) { G.advance(240, { sleep: true }); G.result('<p>You wake up on your bedroom floor hours later, stiff and groggy.</p>'); return; }
        G.advance(180, { sleep: true }); G.mod('health', -5); G.mod('rep', -2); G.mod('stress', 8);
        if (G.chance(0.5) || D.LOCATIONS[S.loc].area === 'school') { const fee = D.LOCATIONS[S.loc].area === 'school' ? 0 : 15; S.loc = D.LOCATIONS[S.loc].area === 'school' ? 'school_nurse' : 'hospital'; if (fee) { if (!G.pay(fee)) S.record.unpaid += 0; } G.result(`<p>You come round in ${S.loc === 'hospital' ? "a bed at St. Brigid's Hospital. A nurse tuts kindly: \"Sleep, food, water. In that order.\"" + (fee ? ` You're charged ${G.money(fee)}.` : '') : "the nurse's office. " + NURSE + ' hands you a juice box and a stern look.'}</p>`); }
        else { const lost = Math.min(S.money, G.ri(0, 8)); if (lost) G.earn(-lost); S.loc = 'home'; G.result(`<p>A kind stranger helped you home. You wake on the sofa${lost ? `, but your pockets are ${G.money(lost)} lighter` : ''}.</p>`); }
      };
      ch('…', wake);
    });
    return true;
  }
  if (p === 'collapse') {
    G.goto(() => {
      G.hr('Medical emergency');
      say('<p>Pain. Sirens. Bright lights. You wake in a hospital bed at St. Brigid\'s, hooked up to a drip, feeling hollow but alive.</p>');
      ch('Recover', () => { G.advance(600, { sleep: true }); S.cond.health = 55; S.cond.hunger = 30; S.cond.stamina = 60; S.loc = 'hospital'; const bill = 40; if (!G.pay(bill)) { S.record.unpaid += 0; G.log('The hospital waived your bill out of kindness.'); } G.mod('stress', 10); G.log('You were hospitalised.'); G.result(`<p>After a long rest you're discharged with strict instructions to eat properly and sleep. ${S.money >= 0 ? '' : ''}</p>`); });
    });
    return true;
  }
  return false;
};

/* ---------- location descriptions ---------- */
const DESC = {
  home: () => G.isDark() ? 'Your small bedroom glows under a desk lamp. Aunt Nell is working a night shift at the hospital again; the house is quiet.' : 'Your bedroom: a bed, a desk piled with schoolbooks, a window looking over Maple Street. The kitchen downstairs smells faintly of toast.',
  street: () => 'Maple Street, lined with terraced houses and trees that change with the seasons.',
  school_gate: () => G.Travel.isOpen('school_classroom') ? 'The red-brick front of Wetinburg High. Students stream through the gates; a prefect checks ties.' : 'The gates of Wetinburg High are chained shut. The building is dark.',
  school_classroom: () => 'Classroom 2B: rows of desks, a whiteboard, and posters about apostrophes. Your homeroom.',
  school_lab: () => 'Benches, sinks, gas taps and a skeleton named Gerald. Dr. Vale\'s jar sits ominously on a shelf.',
  school_artroom: () => 'Paint-splattered tables, drying racks, and tall windows full of light.',
  school_musicroom: () => 'An upright piano, a drum kit, a rack of guitars, and soundproofed walls.',
  school_gym: () => 'Polished floors, climbing ropes and the eternal smell of rubber and effort. Changing rooms at the side.',
  school_pool: () => 'The indoor pool echoes with every splash. The lifeguard chair is empty unless there\'s a lesson.',
  school_library: () => 'Rows of shelves, beanbags in the corner, and a strict "no food" sign that everyone ignores.',
  school_cafeteria: () => 'Long tables, clattering trays, and the roar of a hundred conversations.',
  school_courtyard: () => 'A paved courtyard with benches, a big oak tree and the school vegetable beds.',
  school_rooftop: () => 'The rooftop is technically off-limits. The view over Wetinburg is worth it.',
  school_office: () => 'The main office and staff room. A noticeboard lists clubs and events; a secretary types furiously.',
  school_nurse: () => 'A small white room with a cot, a first-aid cabinet and a poster about washing hands.',
  square: () => 'Wetinburg Square: cobbles, a bronze fountain of a fisherman, a clock tower and a green kiosk.' + (G.isDark() ? ' Street lamps hum.' : ''),
  cafe: () => G.Travel.isOpen('cafe') ? 'The Copper Kettle: mismatched chairs, gleaming copper pots, and the smell of cinnamon.' : 'The Copper Kettle is closed; chairs are stacked on tables.',
  library: () => G.Travel.isOpen('library') ? 'A grand old building with creaky floors, green lamps and the hush of a thousand books.' : 'The library doors are locked.',
  park: () => ({ 0: 'Golden leaves drift across the paths of Riverside Park.', 1: 'Bare trees and frosted grass. The duck pond is half frozen.', 2: 'Blossoms everywhere; the park is bursting with colour.', 3: 'Lush green lawns, picnics and the chime of an ice-cream van.' })[G.seasonIdx()],
  shopping: () => 'Lantern Lane: a cobbled street of shops strung with paper lanterns — grocer, gift shop, hardware, bookshop, pharmacy, clothing, a salon, a tattoo & henna studio and the old cinema.',
  arcade: () => G.Travel.isOpen('arcade') ? 'Pixel Palace: flashing cabinets, a dance machine, claw machines and the clatter of tokens.' : 'The arcade\'s shutters are down.',
  hospital: () => 'St. Brigid\'s Hospital: bright corridors, a reception desk and a coffee machine that has seen things.',
  police: () => 'A small, tidy police station with a front desk and a noticeboard of lost pets.',
  river: () => 'The River Wetin winds lazily between willows. Anglers dot the bank.',
  beach: () => ({ 0: 'Gull Bay is grey and wild in autumn; the wind whips the sand.', 1: 'An empty winter beach. Waves crash hard against the rocks.', 2: 'The sand is warming up; a few brave swimmers test the water.', 3: 'Gull Bay is packed: umbrellas, ice cream, shrieking kids.' })[G.seasonIdx()],
  docks: () => 'Fishing boats, stacked crates, coiled ropes and screaming gulls. Smells of salt and diesel.',
  lighthouse: () => 'The Old Lighthouse stands on the rocks, paint peeling, its lamp long dark. The door is sealed with an old brass lock.',
  forest: () => G.isDark() ? 'Whisperwood at night is pitch black and full of rustles. Something hoots.' : 'Tall pines and mossy oaks. Shafts of light; birdsong; the crunch of the path.',
  shrine: () => 'A tiny moss-covered shrine in a clearing, with a stone fox statue and a little offering bowl.',
  farm: () => 'Meadowlark Farm: a red barn, fields, a vegetable plot and a chorus of animals.',
};

/* ---------- main location scene ---------- */
G.here = function () {
  const S = G.S; G._ctx = null;
  if (G.handlePending()) return;
  const loc = S.loc, L = D.LOCATIONS[loc];
  G.hr(`${L.icon || ''} ${L.name}`);
  say(`<p>${DESC[loc] ? DESC[loc]() : ''}</p>`);
  if (L.outdoor) say(`<p class="wxline">${G.weatherLine()}</p>`);
  const sp = G.specialDay(); if (sp) say(`<p class="special">🎉 Today is the ${G.SPECIAL_NAMES[sp]}!</p>`);
  if (L.hours && !G.Travel.isOpen(loc)) say(`<p class="warn">Closed right now. Opening hours: ${G.Travel.hoursStr(loc)}.</p>`);
  // school status
  if (L.area === 'school' && G.isSchoolDay()) {
    const p = G.School.periodNow(), nx = G.School.nextPeriod();
    if (p && p.subj) say(`<p class="small">📌 Now: <b>${p.name} — ${D.SUBJECTS[p.subj].name}</b> in ${D.LOCATIONS[D.SUBJECTS[p.subj].room].name.replace('Wetinburg High — ', '')} (until ${G.timeStr(p.end)})${G.School.att()[p.id] ? ' ✔ attended' : ''}.</p>`);
    else if (p) say(`<p class="small">📌 ${p.name} (until ${G.timeStr(p.end)}).${nx && nx.subj ? ` Next: ${D.SUBJECTS[nx.subj].name} at ${G.timeStr(nx.start)}.` : ''}</p>`);
    else if (nx) say(`<p class="small">📌 Next: ${nx.name}${nx.subj ? ' — ' + D.SUBJECTS[nx.subj].name : ''} at ${G.timeStr(nx.start)}.</p>`);
  }
  // NPCs
  const here = G.NPC.here();
  if (here.length) say(`<p class="npcs">👥 ${here.map(id => `<b>${G.rel(id).met ? G.nm(id) : D.NPCS[id].role.split(' · ')[1] || D.NPCS[id].role}</b>`).join(', ')} ${here.length > 1 ? 'are' : (here.length === 1 && G.npcPron(here[0]).is === 'are' ? 'are' : 'is')} here.</p>`);
  say(G.NPC.crowd());
  // status hints
  if (S.cond.hunger > 75) say('<p class="warn small">Your stomach growls loudly. You should eat something.</p>');
  if (S.cond.stamina < 20) say('<p class="warn small">You can barely keep your eyes open.</p>');
  if (S.cond.hygiene < 25) say('<p class="warn small">You really need a wash.</p>');
  // actions
  if (L.area === 'school') lessonShortcut();
  const fn = LOC[loc] || LOC._area;
  fn(loc);
  here.forEach(id => ch(`Talk to ${G.rel(id).met ? G.nm(id) : 'the ' + (D.NPCS[id].role.split(' · ')[1] || D.NPCS[id].role).toLowerCase()}`, () => G.NPC.interact(id), { cls: 'npc' }));
  if (D.GEN_ROLES[loc] && G.hour() >= 7 && G.hour() < 22 && G.weather().type !== 'storm') ch('Chat with a local', () => G.NPC.chatGeneric(), { time: 10 });
  if (L.area === 'school') schoolNav(loc);
  ch('Wait 15 minutes', () => { G.advance(15); if (!G.Events.maybe('idle')) back(); }, { time: 15 });
  ch('Wait an hour', () => { G.advance(60); if (!G.Events.maybe('idle')) back(); }, { time: 60 });
  if (L.area === 'school') ch('Leave school grounds (map)', () => G.menu('map'), { cls: 'travel' });
  else ch('🗺️ Travel…', () => G.menu('map'), { cls: 'travel' });
};
function lessonShortcut() {
  if (!G.Travel.isOpen('school_classroom')) return;
  const p = G.School.periodNow();
  if (p && p.subj && !G.School.att()[p.id]) ch(`📚 Go to ${D.SUBJECTS[p.subj].name} (${G.nm(D.SUBJECTS[p.subj].teacher)})`, () => G.School.classScene(p), { cls: 'main', time: Math.max(1, p.end - G.mod_()) });
  if (G.isSchoolDay() && G.mod_() >= 8 * 60 + 30 && G.mod_() < 9 * 60 && !G.School.att().reg) ch('📋 Go to registration', () => G.School.registration(), { cls: 'main' });
}
function schoolNav(loc) {
  if (!G.Travel.isOpen('school_classroom')) return;
  const rooms = Object.keys(D.LOCATIONS).filter(id => D.LOCATIONS[id].area === 'school' && id !== loc && id !== 'school_gate');
  rooms.forEach(r => ch(`→ ${D.LOCATIONS[r].name.replace('Wetinburg High — ', '')}`, () => { G.Travel.go(r); }, { cls: 'nav', time: 2 }));
  if (loc !== 'school_gate') ch('→ Front Gate', () => G.Travel.go('school_gate'), { cls: 'nav', time: 2 });
}

/* ---------- common actions ---------- */
A.study = function (where, mins) {
  const S = G.S; mins = mins || 60;
  const hw = S.school.homework.filter(h => !h.done);
  G.goto(() => {
    G.hr('Study');
    hw.forEach(h => ch(`Do ${D.SUBJECTS[h.subj].name} homework (due ${G.shortDate(h.due)})`, () => {
      G.advance(45, { rate: 1.1 }); h.done = true; h.q = G.clamp(S.stats.awareness + G.grade(h.subj) / 15 + G.ri(-10, 10) + (where === 'library' ? 10 : 0), 0, 100);
      G.gradeXP(h.subj, 6); G.gain('awareness', 0.3); G.gain('willpower', 0.2); G.mod('stress', 3); G.cnt('study');
      G.result(`<p>You work through the ${D.SUBJECTS[h.subj].name} homework${h.q > 60 ? ' and feel proud of it' : ', more or less'}.</p>`, () => A.study(where, mins));
    }, { time: 45 }));
    Object.keys(S.grades).forEach(sub => ch(`Revise ${D.SUBJECTS[sub].name} <span class="small dim">(${G.tierOf(S.grades[sub])})</span>`, () => {
      G.advance(mins, { rate: 1.1 }); G.gradeXP(sub, (where === 'library' ? 16 : 12) + S.stats.awareness / 10); G.gain('awareness', 0.4); G.gain('willpower', 0.3); G.mod('stress', 4); G.cnt('study'); G.checkTraits();
      if (G.has('study_guide') && G.chance(0.5)) G.gradeXP(sub, 8);
      G.result(`<p>${G.pick(['You fill pages with notes and diagrams.', 'You test yourself with flashcards until it sticks.', 'Slowly, the fog lifts and it starts making sense.', 'You re-read your notes, highlighter in hand.'])}</p>`, () => A.study(where, mins));
    }, { time: mins }));
    ch('Stop studying', back);
  });
};
A.readBook = function (id) {
  const S = G.S, it = D.ITEMS[id];
  G.advance(45);
  if (it.read.awareness) G.gain('awareness', it.read.awareness);
  if (it.read.stress) G.mod('stress', it.read.stress);
  if (it.read.skill) G.xp(it.read.skill, it.read.xp);
  if (it.read.grade) { const weak = Object.keys(S.grades).sort((a, b) => S.grades[a] - S.grades[b])[0]; G.gradeXP(weak, it.read.grade); }
  G.cnt('study'); G.cnt('read'); G.checkTraits();
  G.result(`<p>You spend a while reading the ${it.name}. ${id === 'novel' ? 'The mystery twists delightfully — you didn\'t see the ending coming.' : 'You pick up a few useful things.'}</p>`);
};
A.eatCheap = function (txt, hunger, mood) { G.advance(15); G.mod('hunger', -hunger); if (mood) G.mod('mood', mood); G.result(txt); };
A.sleepMenu = function () {
  const S = G.S; const h = G.hour();
  G.goto(() => {
    G.hr('Bedtime');
    say(`<p>${h >= 20 || h < 5 ? 'You pull back the covers.' : 'A nap sounds tempting.'} When do you want to wake up?</p>`);
    const wakeAt = (hh) => { let m = hh * 60 - G.mod_(); if (m <= 30) m += 1440; return m; };
    [5.5, 6, 6.5, 7, 7.5, 8, 9, 10].forEach(hh => { const m = wakeAt(hh); if (m > 14 * 60) return; ch(`Sleep until ${G.timeStr(hh * 60)}${G.isSchoolDay(G.day() + (G.mod_() > hh * 60 ? 1 : 0)) && hh >= 8 ? ' <span class="warn small">(late for school!)</span>' : ''}`, () => A.sleep(m, hh), { time: m }); });
    ch('Nap for 1 hour', () => A.sleep(60), { time: 60 });
    ch('Nap for 3 hours', () => A.sleep(180), { time: 180 });
    ch('Not yet', back);
  });
};
A.sleep = function (mins, wakeHour) {
  const S = G.S; const startDay = G.day();
  const quality = G.clamp(1 - S.cond.stress / 200 - (S.cond.hunger > 80 ? 0.2 : 0), 0.4, 1);
  S.sleeping = true; G.advance(mins, { sleep: true }); S.sleeping = false;
  G.mod('stamina', -((1 - quality) * mins * 0.06), true);
  if (mins >= 300) { G.mod('stress', -8); if (wakeHour !== undefined && wakeHour <= 6.5) { G.cnt('earlyWake'); if (G.hasTrait('early_bird')) G.mod('stamina', 10); } }
  S.lastWake = S.time;
  G.checkTraits();
  const dreams = ['You dream of swimming through clouds.', 'You dream about an exam in a language you don\'t speak.', 'A fox with silver eyes watches you in your dream.', 'You dream of the lighthouse lamp burning bright again.', 'A dreamless, perfect sleep.', 'You dream you\'re late for school. Classic.'];
  let txt = `<p>${G.pick(dreams)}</p><p>You wake at ${G.timeStr()}. ${quality < 0.7 ? 'You tossed and turned — stress and hunger kept you up.' : 'You feel rested.'}</p>`;
  if (G.day() !== startDay || mins >= 300) {
    txt += `<p class="small">${G.dateStr()}. Weather: ${G.WEATHER[G.weather().type].icon} ${G.WEATHER[G.weather().type].name}, ${G.weather().temp}°C.</p>`;
    if (G.weekday() === 0 && G.day() !== S.flags.allowanceDay) { S.flags.allowanceDay = G.day(); const a = 15 + (S.cond.schoolRep > 60 ? 5 : 0); G.earn(a); txt += `<p>Aunt Nell has left a note and ${G.money(a)} pocket money on the kitchen table: "Have a good week, love! x"</p>`; }
    if (G.isSchoolDay()) txt += `<p class="small">School today. Registration at 08:45. ${S.school.detention === G.day() ? '<b class="warn">You have detention after school!</b>' : ''}</p>`;
  }
  if (G.Events.maybe('wake', { after: txt })) return;
  G.result(txt);
};

/* ---------- per-location action builders ---------- */
const LOC = {};
LOC.home = function () {
  const S = G.S; const h = G.hour(); const t = G.today();
  ch('🛏️ Go to bed / nap', () => A.sleepMenu(), { cls: 'main' });
  ch('🚿 Take a shower', () => { G.advance(20); S.cond.hygiene = 100; G.mod('stress', -3); G.gain('beauty', 0.2, true); G.result('<p>Hot water, steam and peace. You feel human again.</p>'); }, { time: 20 });
  ch('🛁 Have a long bath', () => { G.advance(50); S.cond.hygiene = 100; G.mod('stress', -10); G.mod('mood', 6); G.gain('beauty', 0.4); G.result('<p>Bubbles up to your chin. You think about absolutely nothing for a glorious while.</p>'); }, { time: 50 });
  ch('🍞 Make toast & tea (free)', () => { t.toast = (t.toast || 0) + 1; A.eatCheap('<p>You make a stack of buttery toast and a mug of tea. Simple. Perfect.</p>', 25, 2); }, { time: 15, req: (t.toast || 0) < 3, why: 'The bread has run out today' });
  ch('🍳 Cook a proper meal', () => {
    if (!G.take('groceries')) return;
    G.advance(50); const q = G.skill('cooking');
    G.xp('cooking', 22); G.xp('housekeeping', 4, true);
    const good = q + G.ri(0, 300) > 250; const n = 1 + (q >= 400 ? 1 : 0);
    G.give('home_meal', n); G.mod('mood', good ? 6 : 1);
    if (G.hasTrait('home_chef')) G.mod('stress', -5);
    G.result(`<p>${good ? 'The kitchen fills with a wonderful smell. You plate up something you\'re genuinely proud of.' : 'It\'s… edible. The smoke alarm only went off once.'} (${n} meal${n > 1 ? 's' : ''} added to your bag.)</p>`);
  }, { time: 50, req: G.has('groceries'), why: 'Need Groceries (Green Basket Grocer)' });
  ch('📚 Study / homework at your desk', () => A.study('home', 60));
  ch('🧹 Do household chores', () => { G.advance(60, { rate: 1.3 }); G.xp('housekeeping', 20); G.gain('willpower', 0.3); G.mod('mood', 3); let txt = '<p>You vacuum, wash up and fold laundry. The house sparkles.</p>'; if (!t.chores) { t.chores = 1; G.earn(5); txt += '<p>Aunt Nell\'s note says chores earn £5 a day. You claim it.</p>'; } G.gain('purity', 0.2, true); G.result(txt); }, { time: 60 });
  ch('💪 Work out in your room', () => { G.advance(40, { rate: 2 }); G.gain('physique', 0.8); G.xp('athletics', 10); G.mod('hygiene', -10); G.mod('stress', -4); G.result('<p>Push-ups, sit-ups, planks. Your arms are jelly, but in a good way.</p>'); }, { time: 40, req: S.cond.stamina > 15, why: 'Too tired' });
  ch('💃 Dance to music in your room', () => { G.advance(30, { rate: 1.5 }); G.xp('dancing', 14); G.gain('beauty', 0.3); G.mod('stress', -6); G.mod('mood', 5); G.result('<p>You turn the music up and dance like nobody is watching. Nobody is. Probably.</p>'); }, { time: 30 });
  ch('🎹 Practise on the old keyboard', () => { G.advance(45); G.xp('music', 16); G.gain('willpower', 0.3); G.mod('stress', G.hasTrait('artist_soul') ? -8 : -3); G.result(`<p>${G.pick(['Scales, then a melody, then something that might become a song.', 'You finally get through the tricky bit without a mistake.', 'Your fingers stumble, but you keep going.'])}</p>`); }, { time: 45 });
  ch('✏️ Sketch and paint', () => { G.advance(45); G.xp('art', 16); G.gain('awareness', 0.2); G.mod('stress', G.hasTrait('artist_soul') ? -8 : -3); G.result(`<p>${G.pick(['You sketch the view from your window.', 'You paint a stormy sea in blues and greys.', 'You draw a self-portrait. It looks like you, after a long day.'])}</p>`); }, { time: 45 });
  if (G.has('practice_lock')) ch('🔒 Practise on your padlock', () => G.Crime.lockpick('practice'), { tip: 'Legal practice — no risk' });
  ch('📺 Watch TV', () => { G.advance(60); G.mod('stress', -6); G.mod('mood', 4); G.mod('stamina', 2); const shows = ['a baking competition', 'a nature documentary about otters', 'the local news (a goat escaped onto the bus again)', 'a quiz show', 'a cartoon you\'re technically too old for']; G.result(`<p>You flop on the sofa and watch ${G.pick(shows)}.</p>`); }, { time: 60 });
  ch('👕 Open wardrobe', () => { G.menu('wardrobe'); back(); });
  ch('🪞 Groom yourself in the mirror', () => { t.groom = 1; G.advance(15); G.gain('beauty', 0.4); G.mod('hygiene', 5); G.result('<p>You fix your hair and tidy yourself up. Not bad.</p>'); }, { time: 15, req: !t.groom, why: 'Already done today' });
};
LOC.street = function () { ch('Stroll down the street', () => { G.advance(20, { walk: true }); G.gain('physique', 0.1, true); G.mod('stress', -2); if (!G.Events.maybe('idle')) G.result('<p>You stroll past gardens and parked bikes. A cat watches from a wall.</p>'); }, { time: 20 }); };
LOC.school_gate = function () {
  const S = G.S;
  const sp = G.specialDay();
  if (sp === 'sports_day' && G.hour() >= 9 && G.hour() < 15.5) ch('🏅 Join Sports Day on the field', () => { S.loc = 'school_courtyard'; G.School.sportsDay(); }, { cls: 'main' });
  if (sp === 'school_festival' && G.hour() >= 9 && G.hour() < 16) ch('🎪 Enter the Culture Festival', () => { S.loc = 'school_classroom'; G.School.festival(); }, { cls: 'main' });
  if (!G.Travel.isOpen('school_classroom')) say('<p class="small dim">School hours: weekdays 07:30–18:00 during term.</p>');
};
LOC.school_classroom = function () {
  const S = G.S;
  if (S.school.detention === G.day() && G.mod_() >= 15 * 60 + 15 && G.mod_() < 16 * 60 + 35 && !S.school.detServed) ch('⏳ Serve detention', () => { S.school.detServed = true; S.school.detention = null; S.school.detentionsServed++; G.advance(60); G.mod('stress', 6); G.gain('willpower', 0.6); G.att('rules', 2); G.mod('schoolRep', 2); const dex = G.NPC.where('dex') === 'school_classroom'; G.result(`<p>An hour of silence, lines and the clock ticking. ${G.nm('hart')} marks essays at the front.${dex ? ' Dex sits two rows over, flicking paper. At one point he catches your eye and shrugs, almost friendly.' : ''}</p>`); if (dex) G.friend('dex', 3, true); }, { cls: 'main', time: 60 });
  if (!G.School.periodNow() || G.School.periodNow().free) ch('Do homework at your desk', () => A.study('school', 45));
};
LOC.school_lab = function () { if (!G.School.periodNow() || G.School.periodNow().free || G.hour() >= 15.4) ch('Examine Dr. Vale\'s mysterious jar', () => { G.advance(5); G.gain('awareness', 0.3); G.result(G.pick(['<p>Something inside the jar blinks at you. Probably a reflection. Probably.</p>', '<p>The label says "DO NOT FEED". You decide not to.</p>', '<p>It\'s a sourdough starter. Its name, per the label, is "Kevin".</p>'])); }, { time: 5 }); };
LOC.school_artroom = function () { if (!G.School.periodNow() || G.School.periodNow().free || G.hour() >= 15.4) ch('Paint at an easel', () => { G.advance(40); G.xp('art', 18); G.mod('stress', -5); G.result('<p>You lose track of time mixing colours.</p>'); }, { time: 40 }); clubAct('art'); };
LOC.school_musicroom = function () { if (!G.School.periodNow() || G.School.periodNow().free || G.hour() >= 15.4) ch('Play the piano', () => { G.advance(40); G.xp('music', 18); G.mod('stress', -5); G.result('<p>The old piano is slightly out of tune, which somehow makes it better.</p>'); }, { time: 40 }); clubAct('music'); };
LOC.school_gym = function () {
  if (!G.School.periodNow() || G.School.periodNow().free || G.hour() >= 15.4) { ch('Train in the gym', () => { G.advance(45, { rate: 2 }); G.xp('athletics', 18); G.gain('physique', 0.8); G.mod('hygiene', -12); G.mod('stress', -5); G.result('<p>Sprints, ropes and the rowing machine. You\'re dripping.</p>'); }, { time: 45, req: G.S.cond.stamina > 15, why: 'Too tired' }); ch('Practise dance routines', () => { G.advance(40, { rate: 1.6 }); G.xp('dancing', 16); G.gain('beauty', 0.3); G.result('<p>You practise in front of the big mirror.</p>'); }, { time: 40 }); }
  ch('Shower in the changing rooms', () => { G.advance(15); G.S.cond.hygiene = Math.max(G.S.cond.hygiene, 90); G.result('<p>The showers are lukewarm, but you\'re clean.</p>'); }, { time: 15 });
  ch('👕 Change clothes (changing room)', () => { G.menu('wardrobe'); back(); });
  clubAct('athletics'); clubAct('dance');
};
LOC.school_pool = function () {
  if (!G.School.periodNow() || G.School.periodNow().free || G.hour() >= 15.4) ch('Swim lengths', () => { G.advance(40, { rate: 1.8 }); G.xp('swimming', 20); G.gain('physique', 0.6); G.mod('stress', G.hasTrait('water_baby') ? -10 : -5); G.S.cond.hygiene = Math.max(G.S.cond.hygiene, 70); G.result('<p>Up and down, up and down. The water is cool and quiet.</p>'); }, { time: 40, req: G.S.cond.stamina > 15, why: 'Too tired' });
  ch('👕 Change clothes (changing room)', () => { G.menu('wardrobe'); back(); });
  clubAct('swim');
};
LOC.school_library = function () { ch('Study in the school library', () => A.study('library', 60)); ch('Read on a beanbag', () => { G.advance(40); G.gain('awareness', 0.4); G.mod('stress', -5); G.cnt('read'); G.cnt('study'); G.result('<p>You sink into a beanbag with a random book. It\'s about bees. It\'s fascinating.</p>'); }, { time: 40 }); clubAct('books'); };
LOC.school_cafeteria = function () { ch('Buy food at the canteen', () => G.Shops.open('canteen')); };
LOC.school_courtyard = function () {
  ch('Sit under the oak tree', () => { G.advance(15); G.mod('stress', -4); G.result('<p>You lean against the old oak. Leaves rustle overhead.</p>'); }, { time: 15 });
  clubAct('garden');
};
LOC.school_rooftop = function () {
  ch('Take in the view', () => { G.advance(15); G.mod('stress', -7); G.gain('awareness', 0.2); G.att('rules', -0.5); G.result('<p>From up here you can see the whole town: the square, the docks, the lighthouse, and the dark line of Whisperwood. The wind tugs your hair.</p>'); }, { time: 15 });
};
LOC.school_office = function () {
  const S = G.S;
  ch('📌 Read the noticeboard (clubs)', () => {
    G.goto(() => {
      G.hr('Clubs Noticeboard');
      say('<p>Clubs meet 15:30–17:00 on their day. Join as many as you like.</p>');
      for (const c in D.CLUBS) { const C = D.CLUBS[c]; const on = S.school.clubs.includes(c); ch(`${on ? 'Leave' : 'Join'} ${C.name} <span class="small dim">(${D.DAYS[C.day]}s, ${D.LOCATIONS[C.room].name.replace('Wetinburg High — ', '')})</span>`, () => { if (on) S.school.clubs = S.school.clubs.filter(x => x !== c); else { S.school.clubs.push(c); G.log(`Joined ${C.name}.`); } G.School && G.goto(G._cur); }); }
      ch('Done', back);
    });
  });
  ch('Ask the secretary about your record', () => { G.advance(5); G.result(`<p>"Let's see… ${S.school.absences} missed lessons, ${S.school.late} late marks, ${S.school.detentionsMissed} skipped detentions." She peers at you. "${S.cond.schoolRep > 65 ? 'Good, keep it up!' : S.cond.schoolRep > 40 ? 'Could be better, dear.' : 'You\'re on thin ice.'}"</p>`); }, { time: 5 });
};
LOC.school_nurse = function () {
  const S = G.S;
  ch('Lie down and rest', () => { G.advance(30, { sleep: true }); G.mod('health', 6); G.mod('stamina', 6); G.mod('stress', -4); G.result('<p>The nurse lets you lie down. The paper sheet crinkles. You doze.</p>'); }, { time: 30 });
  if (S.ill.cold) ch('Ask for cold medicine', () => { delete S.ill.cold; G.advance(10); G.result('<p>The nurse gives you a spoonful of something orange and vile. Your cold clears up.</p>'); }, { time: 10 });
  if (S.cond.health < 80) ch('Get patched up', () => { G.advance(15); G.mod('health', 12); G.result('<p>Plasters, antiseptic and a sticker for being brave.</p>'); }, { time: 15 });
};
function clubAct(cid) {
  const S = G.S, c = D.CLUBS[cid];
  if (!S.school.clubs.includes(cid) || !G.isSchoolDay() || G.weekday() !== c.day) return;
  const m = G.mod_(); if (m < 15 * 60 + 25 || m > 16 * 60 + 30) return;
  if (G.today()['club_' + cid]) return;
  ch(`⭐ Attend ${c.name}`, () => { G.today()['club_' + cid] = 1; G.School.club(cid); }, { cls: 'main', time: 90 });
}
LOC.square = function () {
  const S = G.S; const h = G.hour(); const sp = G.specialDay();
  if (sp === 'winter_fair' && h >= 16 && h < 22) ch('🏮 Explore the Winter Lantern Fair', () => G.Story.winterFair(), { cls: 'main' });
  ch('🛒 Square Kiosk', () => G.Shops.open('kiosk'));
  ch('Sit by the fountain', () => { G.advance(20); G.mod('stress', -4); G.gain('awareness', 0.15, true); G.result('<p>You sit on the fountain\'s edge. Pigeons strut. The clock tower chimes.</p>'); }, { time: 20 });
  ch('People-watch', () => { G.advance(30); G.gain('awareness', 0.5); G.result(`<p>${G.pick(['A man argues with a pigeon over a sandwich. The pigeon wins.', 'Two old friends meet and hug like it\'s been years.', 'A child drops an ice cream and a stranger instantly buys another.', 'Officer Reyes helps a lady across the cobbles.'])}</p>`); }, { time: 30 });
  if (G.skill('music') >= 200 && h >= 9 && h < 20 && G.weather().type !== 'storm') ch('🎸 Busk for coins', () => { G.advance(60); G.xp('music', 15); const m = Math.round((G.skill('music') / 60 + G.effBeauty() / 20 + G.ri(0, 6)) * (G.wx().wet ? 0.4 : 1)); G.earn(m); G.mod('rep', 0.5); G.result(`<p>You play for an hour. A small crowd gathers and drifts away. Your hat collects ${G.money(m)}.</p>`); }, { time: 60 });
  if (h >= 5 && h < 7.5) { if (!G.Jobs.hired('paper')) ch('📰 Sign up for newspaper delivery', () => G.Jobs.apply('paper')); else ch('📰 Do the newspaper round', () => G.Jobs.work('paper'), { cls: 'main', time: 90, req: !G.today().paper, why: 'Done today' }); if (G.Jobs.hired('paper')) G.today().paperShown = 1; }
  else if (!G.Jobs.hired('paper')) say('<p class="small dim">A sign on the kiosk reads: "Paper rounds — early risers wanted! Sign up 5:00–7:30."</p>');
  if (h >= 9 && h < 20) ch('🫳 Pick a pocket…', () => G.Crime.pickpocket(), { cls: 'risky' });
};
LOC.cafe = function () {
  const S = G.S; if (!G.Travel.isOpen('cafe')) return;
  ch('☕ Order at the counter', () => G.Shops.open('cafe'));
  ch('Sit and study with a drink', () => { if (!G.pay(2)) return; A.study('cafe', 60); }, { cost: 2, req: S.money >= 2, why: 'Need £2 for a drink' });
  if (G.Jobs.hired('cafe')) ch('☕ Work a shift', () => G.Jobs.work('cafe'), { cls: 'main', time: 180, req: G.Jobs.inHours('cafe'), why: 'Shift must end by 21:00' });
  if (G.weekday() === 4 && G.hour() >= 19 && G.hour() < 21) ch('🎹 Listen to the Friday piano', () => { G.advance(45); G.mod('stress', -10); G.mod('mood', 8); G.xp('music', 6); G.result(`<p>${G.nm('fenwick')} plays soft jazz on the café\'s upright piano. Bea leans on the counter, chin in hand, watching ${G.him('fenwick')} with a soppy smile. The whole café is warm and golden.</p>`); }, { time: 45 });
};
LOC.library = function () {
  const S = G.S; if (!G.Travel.isOpen('library')) return;
  ch('📚 Study', () => A.study('library', 60));
  ch('Read in the reading room', () => { G.advance(60); G.gain('awareness', 0.8); G.mod('stress', -6); G.cnt('read'); G.cnt('study'); G.checkTraits(); if (!G.Events.maybe('library')) G.result(`<p>You read ${G.pick(['a history of Wetinburg', 'a book of folk tales about fox spirits', 'an atlas of the stars', 'a guide to coastal birds', 'a novel about a girl who lives in a lighthouse'])}.</p>`); }, { time: 60 });
  ch('Research local legends', () => G.Story.research(), { time: 45 });
  if (G.Jobs.hired('library')) ch('📖 Work a shift', () => G.Jobs.work('library'), { cls: 'main', time: 120, req: G.Jobs.inHours('library'), why: 'Shift must end by 19:00' });
};
LOC.park = function () {
  const S = G.S; const w = G.weather().type; const s = G.seasonIdx();
  if (w !== 'storm') ch('🏃 Go for a jog', () => { G.advance(40, { rate: 2.2 }); G.xp('athletics', 18); G.gain('physique', 0.9); G.mod('hygiene', -12); G.mod('stress', -6); if (!G.Events.maybe('idle')) G.result('<p>You jog the loop around the duck pond. Your lungs burn, then settle into rhythm.</p>'); }, { time: 40, req: S.cond.stamina > 15, why: 'Too tired' });
  ch('Relax on a bench', () => { G.advance(30); G.mod('stress', -7); G.mod('mood', 3); G.result('<p>You sit and watch the world go by.</p>'); }, { time: 30 });
  if (w !== 'storm' && w !== 'rain') ch('Feed the ducks', () => { G.advance(15); G.mod('mood', 5); G.att('kindness', 0.5); G.result('<p>The ducks swarm you with great enthusiasm and no manners.</p>'); }, { time: 15 });
  if (w === 'snow') ch('☃️ Build a snowman', () => { G.advance(40); G.mod('mood', 12); G.mod('stress', -8); G.gain('physique', 0.2); G.result('<p>Your snowman has a carrot nose, pebble eyes and a slightly menacing grin. Perfect.</p>'); }, { time: 40 });
  if (s === 2 && w !== 'storm') ch('🌸 Gather fallen blossoms to press', () => { G.today().blossom = 1; G.advance(20); G.give('pressed_flower'); G.mod('mood', 3); G.result('<p>You find a perfect blossom and press it carefully between pages.</p>'); }, { time: 20, req: !G.today().blossom, why: 'Already gathered today' });
  if (s === 3 && (w === 'sunny' || w === 'heatwave')) ch('🍦 Buy from the ice cream van (£3)', () => { if (!G.pay(3)) return; G.advance(10); G.apply(D.ITEMS.ice_cream.eat); G.result('<p>Strawberry swirl, dripping down your wrist. Worth it.</p>'); }, { cost: 3, req: S.money >= 3 });
  if (w !== 'storm' && !G.isDark()) ch('🎨 Sketch the scenery', () => { G.advance(40); G.xp('art', 14); G.gain('awareness', 0.3); G.mod('stress', -4); G.result('<p>You sketch the bandstand and the willows.</p>'); }, { time: 40 });
};
LOC.shopping = function () {
  const S = G.S; const h = G.hour();
  const shop = (sid, label) => { const sh = D.SHOPS[sid]; const open = h >= sh.hours[0] && h < sh.hours[1]; ch(label, () => G.Shops.open(sid), { req: open, why: `Closed (${G.timeStr(sh.hours[0] * 60)}–${G.timeStr(sh.hours[1] * 60)})` }); };
  shop('grocer', '🥕 Green Basket Grocer'); shop('gifts', '🎁 Twinkle Gifts'); shop('hardware', '🔨 Hollis Hardware & Seeds'); shop('books', '📕 Dog-Ear Books'); shop('pharmacy', '💊 Pharmacy');
  ch('👗 Threads & Co. (clothes)', () => G.Shops.clothes(), { req: h >= 9 && h < 19, why: 'Closed (09:00–19:00)' });
  ch('💇 Snip & Style Salon', () => G.Shops.salon(), { req: h >= 9 && h < 18, why: 'Closed (09:00–18:00)' });
  ch('🖋️ Inkwell Studio (tattoo & henna)', () => G.Shops.tattoo(), { req: h >= 11 && h < 20, why: 'Closed (11:00–20:00)' });
  ch('🎬 Lantern Picture House', () => G.Shops.cinema(), { req: h >= 13 && h < 22, why: 'Closed (13:00–22:00)' });
  ch('Window-shop', () => { G.advance(30); G.mod('mood', 3); G.gain('beauty', 0.1, true); G.result('<p>You browse displays and imagine what you\'d buy with a lottery win.</p>'); }, { time: 30 });
  if (h >= 9 && h < 20) ch('🫳 Pick a pocket…', () => G.Crime.pickpocket(), { cls: 'risky' });
};
LOC.arcade = function () {
  const S = G.S; if (!G.Travel.isOpen('arcade')) return;
  ch('🕹️ Play arcade games (£2)', () => { if (!G.pay(2)) return; G.advance(40); G.mod('stress', -8); G.mod('mood', 6); G.gain('awareness', 0.2); const hs = G.chance(0.15 + S.stats.awareness / 300); G.result(hs ? '<p>NEW HIGH SCORE! You enter your initials with trembling fingers.</p>' : `<p>You play ${G.pick(['Neon Drift', 'Galaxy Bash', 'Pixel Pirates', 'Turbo Turtle'])} until your tokens run out.</p>`); if (hs) G.mod('rep', 1); }, { cost: 2, time: 40, req: S.money >= 2 });
  ch('💃 Dance machine (£2)', () => { if (!G.pay(2)) return; G.advance(20, { rate: 2 }); G.xp('dancing', 18); G.gain('physique', 0.3); G.mod('stress', -6); G.result(`<p>Arrows fly up the screen. You ${G.skill('dancing') >= 300 ? 'nail a perfect combo, and a small crowd claps' : 'stomp along, mostly on beat'}.</p>`); }, { cost: 2, time: 20, req: S.money >= 2 });
  ch('🧸 Claw machine (£1)', () => { if (!G.pay(1)) return; G.advance(5); if (G.chance(0.12 + S.stats.awareness / 500)) { G.give('plush_cat'); G.result('<p>The claw grips… lifts… and DROPS IT IN THE CHUTE! You won a plush cat!</p>'); } else G.result('<p>The claw strokes the plushie tenderly and lets it go. Rigged.</p>'); }, { cost: 1, time: 5, req: S.money >= 1 });
  ch('🫳 Pick a pocket…', () => G.Crime.pickpocket(), { cls: 'risky' });
};
LOC.hospital = function () {
  const S = G.S;
  ch('Get treated (£20)', () => { if (!G.pay(20)) return; G.advance(60); S.cond.health = 100; delete S.ill.cold; G.result('<p>A doctor checks you over, patches you up and sends you on your way.</p>'); }, { cost: 20, time: 60, req: S.money >= 20 && (S.cond.health < 95 || S.ill.cold), why: S.money < 20 ? 'Need £20' : 'You\'re healthy' });
  ch('🤝 Volunteer on the wards', () => { G.advance(120, { rate: 1.2 }); G.gain('purity', 1.5); G.att('kindness', 3); G.mod('rep', 2); G.mod('stress', G.hasTf('angel') ? -6 : 2); G.cnt('volunteer'); G.cnt('goodDeed'); if (!G.Events.maybe('volunteer')) G.result(`<p>${G.pick(['You read the newspaper aloud to an old sailor who laughs at all the wrong parts.', 'You push the tea trolley around and learn everyone\'s sugar preferences.', 'You play cards with a girl recovering from a broken leg. She cheats. Brilliantly.'])}</p>`); }, { time: 120, req: G.hour() >= 9 && G.hour() < 18, why: 'Volunteering 09:00–18:00' });
  ch('Visit the gift shop & café', () => { G.advance(15); G.result('<p>Overpriced grapes and tired visitors. You buy nothing.</p>'); }, { time: 15 });
};
LOC.police = function () {
  const S = G.S;
  if (S.record.unpaid > 0) ch(`Pay your fines (${G.money(S.record.unpaid)})`, () => A.payFines());
  if (G.has('lost_wallet')) ch('Hand in the lost wallet', () => { G.take('lost_wallet'); G.advance(15); G.gain('purity', 2.5); G.att('honesty', 6); G.mod('rep', 4); G.friend('reyes', 4); G.trust('reyes', 6); G.cnt('goodDeed'); const reward = 10; G.earn(reward); G.result(`<p>The desk sergeant checks the ID. "This belongs to a fisherman from the docks — he\'s been frantic." Later, a reward of ${G.money(reward)} is passed along with a thank-you note.</p>`); }, { time: 15 });
  if (S.record.caught > 0 || S.flags.communityRequired) ch('🧤 Do community service', () => { G.advance(150, { rate: 1.5 }); S.record.caught = Math.max(0, S.record.caught - 1); if (S.record.caught < 3) delete S.flags.communityRequired; G.gain('purity', 1.5); G.att('rules', 4); G.mod('rep', 3); G.friend('reyes', 3); G.gain('physique', 0.4); G.result('<p>You pick litter in the park and scrub graffiti off the bandstand with a few other teens. It\'s tiring, but you feel lighter. Your record improves.</p>'); }, { time: 150 });
  ch('Read the lost-pets noticeboard', () => { G.advance(5); G.result(`<p>${G.pick(['"MISSING: Biscuit, ginger cat, very fat, answers to \'dinner\'."', '"FOUND: one tortoise. Unbothered."', '"LOST: Pepper the pony\'s halter. Return to Meadowlark Farm."'])}</p>`); }, { time: 5 });
};
A.payFines = function () { const S = G.S; const amt = Math.min(S.money, S.record.unpaid); if (amt <= 0) { G.result('You don\'t have any money to pay with.'); return; } G.earn(-amt); S.record.unpaid -= amt; G.mod('rep', 2); G.att('rules', 2); G.result(`<p>You pay ${G.money(amt)}. ${S.record.unpaid > 0 ? `You still owe ${G.money(S.record.unpaid)}.` : 'Your fines are cleared.'}</p>`); };
LOC.river = function () {
  const S = G.S; const w = G.weather().type;
  if (G.has('fishing_rod')) ch('🎣 Fish', () => A.fish('river'), { time: 60 });
  ch('Skim stones', () => { G.advance(15); G.mod('stress', -4); const n = G.ri(1, 4 + Math.floor(S.stats.physique / 25)); G.result(`<p>Your best stone skips ${n} times. ${n >= 6 ? 'Incredible!' : ''}</p>`); }, { time: 15 });
  if ((G.seasonIdx() === 3 || w === 'heatwave') && w !== 'storm') ch('🏊 Swim in the river', () => { G.advance(40, { rate: 1.8 }); G.xp('swimming', 18); G.gain('physique', 0.6); G.mod('stress', -8); G.result('<p>The river is cool and green. Little fish dart around your ankles.</p>'); }, { time: 40, req: S.cond.stamina > 15 });
  ch('Sit under a willow', () => { G.advance(30); G.mod('stress', -8); G.gain('awareness', 0.2); G.result('<p>Dragonflies, birdsong, the murmur of water. Bliss.</p>'); }, { time: 30 });
};
A.fish = function (where) {
  const S = G.S; G.advance(60);
  const w = G.weather().type; const p = 0.35 + S.stats.awareness / 300 + (w === 'rain' || w === 'cloudy' ? 0.1 : 0) - (w === 'storm' ? 0.2 : 0);
  G.mod('stress', -6); G.gain('willpower', 0.3);
  if (G.chance(p)) { const n = G.chance(0.2) ? 2 : 1; G.give('fish', n); G.result(`<p>A tug! You reel in ${n > 1 ? 'two fat fish' : 'a lovely silver fish'}.</p>`); }
  else if (G.chance(0.15)) { G.give('seashell'); G.result('<p>No fish, but you hook a pretty shell somehow.</p>'); }
  else G.result('<p>An hour of peaceful nothing. The fish win this round.</p>');
};
LOC.beach = function () {
  const S = G.S; const w = G.weather().type; const s = G.seasonIdx(); const h = G.hour();
  const sp = G.specialDay();
  if (sp === 'summer_fireworks' && h >= 19 && h < 23) ch('🎆 Watch the fireworks', () => G.Story.fireworks(), { cls: 'main' });
  if (w !== 'storm') ch('🏊 Swim in the sea', () => {
    const cold = s === 1 || (s !== 3 && w !== 'heatwave' && G.weather().temp < 14);
    G.advance(40, { rate: 2 }); G.xp('swimming', 22); G.gain('physique', 0.7);
    if (cold) { G.gain('willpower', 1); G.mod('health', -3); G.mod('stress', -3); G.result('<p>The water is BRUTALLY cold. You shriek, swim, and stagger out feeling alive and possibly hypothermic.</p>'); }
    else { G.mod('stress', G.hasTrait('water_baby') ? -14 : -9); G.mod('mood', 6); G.result('<p>You dive under a wave. Salt water, sunshine, freedom.</p>'); }
  }, { time: 40, req: S.cond.stamina > 15 && h >= 6 && h < 21, why: S.cond.stamina <= 15 ? 'Too tired' : 'Too dark to swim safely' });
  if ((w === 'sunny' || w === 'heatwave') && !G.isDark()) ch('😎 Sunbathe under an umbrella', () => { G.advance(45); G.mod('stress', -8); G.mod('mood', 6); G.result('<p>You lie on a towel and let the warmth soak in, sun cream applied responsibly.</p>'); }, { time: 45 });
  ch('🐚 Comb the beach for shells', () => { G.advance(30); G.gain('awareness', 0.3); if (G.chance(0.6)) { G.give('seashell'); G.result('<p>You find a perfect pink spiral shell.</p>'); } else G.result('<p>Mostly seaweed and a single flip-flop.</p>'); }, { time: 30 });
  if (w !== 'rain' && w !== 'storm') ch('🏰 Build a sandcastle', () => { G.advance(40); G.mod('mood', 8); G.xp('art', 8); G.result('<p>Turrets, a moat, a seaweed flag. A seagull lands on top like a tiny king.</p>'); }, { time: 40 });
  if (G.isDark()) ch('🔐 Pick the lock on an old beach hut…', () => G.Crime.lockpick('hut'), { cls: 'risky' });
};
LOC.docks = function () {
  const S = G.S; const h = G.hour();
  if (G.has('fishing_rod')) ch('🎣 Fish off the pier', () => A.fish('docks'), { time: 60 });
  if (h >= 6 && h < 18) ch('📦 Help unload crates (cash in hand)', () => { G.advance(60, { rate: 2.2 }); G.gain('physique', 1); G.earn(10); G.mod('hygiene', -10); G.result('<p>A dock foreman hands you £10 for an hour of hauling crates of fish. Your back aches.</p>'); }, { time: 60, req: S.cond.stamina > 20 && S.stats.physique >= 25, why: S.stats.physique < 25 ? 'Need Physique 25' : 'Too tired' });
  ch('Watch the boats', () => { G.advance(20); G.mod('stress', -5); G.result('<p>Fishing boats bob and creak. A seal pops its head up, judges you, and vanishes.</p>'); }, { time: 20 });
  ch('🗼 Walk the rocky path to the Old Lighthouse', () => G.Travel.go('lighthouse'), { cls: 'nav', time: G.Travel.walkTime('docks', 'lighthouse') });
  if (h >= 9 && h < 20) ch('🫳 Pick a pocket…', () => G.Crime.pickpocket(), { cls: 'risky' });
  if (G.isDark()) ch('🔐 Pick the lock on a storage shed…', () => G.Crime.lockpick('shed'), { cls: 'risky' });
};
LOC.lighthouse = function () { G.Story.lighthouseActions(); };
LOC.forest = function () {
  const S = G.S; const s = G.seasonIdx(); const dark = G.isDark();
  ch('🥾 Hike the trails', () => { G.advance(60, { rate: 2 }); G.gain('physique', 0.8); G.xp('athletics', 10); G.mod('stress', -6); if (!G.Events.maybe('forest')) G.result('<p>The path climbs through ferns and roots. You emerge on a ridge with the whole valley below.</p>'); }, { time: 60, req: S.cond.stamina > 20, why: 'Too tired' });
  if ((s === 0 || s === 3) && !dark) ch('🫐 Forage', () => { G.advance(40); G.gain('awareness', 0.3); G.xp('tending', 6); if (s === 3 || G.chance(0.5)) G.give('wild_berries', G.ri(1, 3)); if (s === 0 && G.chance(0.6)) G.give('mushrooms'); G.result('<p>You fill your pockets with nature\'s snacks, checking everything carefully.</p>'); }, { time: 40 });
  if (!dark) ch('🐦 Birdwatch', () => { G.advance(30); G.gain('awareness', 0.5); G.mod('stress', -5); G.result(`<p>You spot ${G.pick(['a woodpecker', 'a pair of jays', 'a buzzard circling', 'a tiny wren', 'an owl dozing in a hollow'])}.</p>`); }, { time: 30 });
  ch('⛩️ Follow the mossy path deeper', () => G.Travel.go('shrine'), { cls: 'nav', time: G.Travel.walkTime('forest', 'shrine') });
};
LOC.shrine = function () { G.Story.shrineActions(); };
LOC.farm = function () {
  const S = G.S; if (!G.Travel.isOpen('farm')) { say('<p class="small dim">The farm gate is shut for the night.</p>'); return; }
  if (S.farm.access) ch('🌱 Tend your plots', () => G.Farm.scene(), { cls: 'main' });
  else say('<p class="small dim">You could ask Tom about growing your own crops here.</p>');
  ch('🐄 Visit the animals', () => G.Farm.animals());
  ch('🧺 Sell produce at the farm stand', () => G.Farm.sell(1, 'Meadowlark farm stand'));
  if (G.Jobs.hired('farm')) ch('🚜 Work a farmhand shift', () => G.Jobs.work('farm'), { cls: 'main', time: 180, req: G.Jobs.inHours('farm') && S.cond.stamina > 20, why: S.cond.stamina <= 20 ? 'Too tired' : 'Shift must end by 19:00' });
  ch('Buy fresh honey (£7)', () => { if (G.pay(7)) G.give('honey_jar'); back(); }, { cost: 7, req: S.money >= 7 });
};
LOC._area = function () {};
})(window.G);
