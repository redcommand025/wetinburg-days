/* Wetinburg Days — systems: travel, school, farm, jobs, shops, skulduggery */
(function (G) {
'use strict';
const D = G.DATA;
const say = (h) => G.say(h), ch = (l, f, o) => G.ch(l, f, o);
const back = () => G.goto(G.here);

/* ================= TRAVEL ================= */
const T = G.Travel = {};
T.coords = (id) => { const L = D.LOCATIONS[id]; if (L.area === 'school') return D.LOCATIONS.school_gate; return L; };
T.dist = (a, b) => { const A = T.coords(a), B = T.coords(b); return Math.hypot(A.x - B.x, A.y - B.y); };
T.walkTime = function (a, b) {
  const A = D.LOCATIONS[a], B = D.LOCATIONS[b];
  if (A.area && A.area === B.area) return 2;
  let t = T.dist(a, b) * 0.95 + 2;
  t *= G.wx().travel;
  if (G.hasTf('wings')) t *= 0.75;
  if (G.S.cond.stamina < 15) t *= 1.25;
  return Math.max(3, Math.round(t));
};
T.busTime = (a, b) => Math.max(6, Math.round(5 + T.dist(a, b) * 0.32 * (1 + (G.wx().travel - 1) * 0.4)));
T.bikeTime = (a, b) => Math.max(3, Math.round(T.dist(a, b) * 0.45 + 1));
T.isOpen = function (id) {
  const L = D.LOCATIONS[id]; const h = G.hour();
  if (L.area === 'school' || id === 'school_gate') { if (id === 'school_gate') return true; const sp = G.specialDay(); return (G.isSchoolDay() || sp === 'school_festival' || sp === 'sports_day') && h >= D.SCHOOL_HOURS[0] && h < D.SCHOOL_HOURS[1]; }
  if (!L.hours) return true;
  return h >= L.hours[0] && h < L.hours[1];
};
T.hoursStr = (id) => { const L = D.LOCATIONS[id]; if (!L.hours) return 'Always open'; return `${G.timeStr(L.hours[0] * 60)}–${G.timeStr(L.hours[1] * 60)}`; };
T.options = function (dest) {
  const here = G.S.loc; const out = [];
  out.push({ mode: 'walk', label: `Walk ${T.walkTime(here, dest)}m`, ok: true });
  const A = T.coords(here), B = T.coords(dest);
  if (A.bus && B.bus && A !== B) {
    const h = G.hour(); const free = G.S.flags.busPassUntil >= G.day();
    const ok = h >= 6 && h < 23 && (free || G.S.money >= 2);
    out.push({ mode: 'bus', label: `Bus ${T.busTime(here, dest)}m${free ? ' (pass)' : ' £2'}`, ok, why: h < 6 || h >= 23 ? 'Buses run 06:00–23:00' : 'Not enough money' });
  }
  if (G.has('bicycle')) { const wt = G.weather().type; out.push({ mode: 'bike', label: `Cycle ${T.bikeTime(here, dest)}m`, ok: wt !== 'storm' && wt !== 'snow', why: 'Too dangerous to cycle in this weather' }); }
  return out;
};
T.edges = function () {
  if (T._edges) return T._edges;
  const nodes = Object.keys(D.LOCATIONS).filter(id => !D.LOCATIONS[id].inner); const set = {};
  nodes.forEach(a => { nodes.filter(b => b !== a).sort((x, y) => T.dist(a, x) - T.dist(a, y)).slice(0, 2).forEach(b => { const k = [a, b].sort().join('|'); set[k] = [a, b]; }); });
  return (T._edges = Object.values(set));
};
T.go = function (dest, mode) {
  const S = G.S; const from = S.loc; mode = mode || 'walk';
  let t;
  if (mode === 'bus') { const free = S.flags.busPassUntil >= G.day(); if (!free && !G.pay(2)) { G.result('You can\'t afford the bus fare.'); return; } t = T.busTime(from, dest); G.cnt('bus'); }
  else if (mode === 'bike') { t = T.bikeTime(from, dest); G.gain('physique', 0.15, true); G.xp('athletics', 2, true); }
  else { t = T.walkTime(from, dest); if (!D.LOCATIONS[dest].area || D.LOCATIONS[dest].area !== D.LOCATIONS[from].area) { G.gain('physique', t / 200, true); } }
  const inner = D.LOCATIONS[from].area && D.LOCATIONS[from].area === D.LOCATIONS[dest].area;
  G.advance(t, { walk: mode === 'walk' });
  S.loc = dest;
  if (!inner) T.arriveEffects(mode, t);
  G.cnt('travel');
  if (!inner && G.Events && G.Events.maybe('arrive')) return;
  back();
};
T.arriveEffects = function (mode, t) {
  const S = G.S, w = G.weather().type;
  if (mode === 'bus') return;
  if ((w === 'rain' || w === 'storm') && t > 4) {
    if (G.rainProof()) { if (G.chance(0.3)) G.note('Your umbrella keeps you dry', 'info'); }
    else { G.mod('hygiene', -6); G.mod('mood', -4); G.mod('stress', 2); S.flags.soaked = G.day(); if (G.chance(w === 'storm' ? 0.12 : 0.05) && !S.ill.cold) { S.ill.cold = G.ri(2, 4); G.log('You caught a cold from getting soaked.'); G.note('Caught a cold!', 'down'); } }
  }
  if (w === 'snow' && t > 6 && G.warmth() < 3) { G.mod('health', -3); G.mod('stress', 3); G.note('Brr! You need warmer clothes', 'down'); if (G.chance(0.06) && !S.ill.cold) { S.ill.cold = G.ri(2, 4); G.log('The cold got to you. You caught a cold.'); } }
  if (w === 'heatwave' && t > 10 && !G.isDark()) { G.mod('stamina', -4); G.mod('hygiene', -4); }
  if (w === 'sunny' && !G.isDark()) G.mod('mood', 1, true);
};

/* ================= SCHOOL ================= */
const Sc = G.School = {};
Sc.periodNow = function () {
  if (!G.isSchoolDay() || G.specialDay() === 'sports_day' || G.specialDay() === 'school_festival') return null;
  const m = G.mod_();
  const idx = D.PERIODS.findIndex(p => m >= p.start && m < p.end);
  if (idx < 0) return null;
  const p = Object.assign({}, D.PERIODS[idx]);
  if (p.id[0] === 'p') p.subj = D.TIMETABLE[G.weekday()][+p.id[1] - 1];
  return p;
};
Sc.nextPeriod = function () {
  if (!G.isSchoolDay()) return null; const m = G.mod_();
  const p = D.PERIODS.find(p => p.start > m && !p.free);
  if (!p) return null; const r = Object.assign({}, p); if (r.id[0] === 'p') r.subj = D.TIMETABLE[G.weekday()][+r.id[1] - 1]; return r;
};
Sc.att = () => { const d = G.day(); G.S.school.attended[d] = G.S.school.attended[d] || {}; return G.S.school.attended[d]; };
Sc.schoolDayEnd = G.schoolDayEnd = function () {
  const S = G.S; const sp = G.specialDay();
  if (sp === 'sports_day' || sp === 'school_festival') return;
  const a = Sc.att(); const missed = ['p1', 'p2', 'p3', 'p4', 'p5'].filter(p => !a[p]).length;
  for (const k in S.school.attended) if (+k < G.day() - 7) delete S.school.attended[k];
  if (missed > 0) {
    S.school.absences += missed;
    G.mod('schoolRep', -2.5 * missed, true);
    G.gain('purity', -0.3 * missed, true);
    G.att('rules', -2 * missed);
    for (const sub of D.TIMETABLE[G.weekday()]) G.gradeXP(sub, -3, true);
    if (missed === 5) G.log('You skipped school entirely today. The office will have noticed.');
    else G.log(`You missed ${missed} lesson${missed > 1 ? 's' : ''} today.`);
    if (missed >= 3 || (S.school.absences > 12 && G.chance(0.5))) { Sc.giveDetention('truancy'); }
  }
};
Sc.nextSchoolDay = function () { let d = G.day() + 1; while (!G.isSchoolDay(d)) d++; return d; };
Sc.giveDetention = function (why) {
  const S = G.S; if (S.school.detention !== null && S.school.detention !== undefined && S.school.detention >= G.day()) return;
  const d = G.hour() < 15 && G.isSchoolDay() ? G.day() : Sc.nextSchoolDay();
  S.school.detention = d; S.school.detServed = false;
  G.log(`<b>Detention</b> for ${why}: ${G.shortDate(d)}, 15:30 in Classroom 2B.`); G.note('Detention!', 'down');
};
Sc.lateness = function (p) {
  const S = G.S; const m = G.mod_(); const late = m - p.start;
  if (late <= (p.reg ? 5 : 3)) return 0;
  if (G.hasTrait('teachers_pet') && G.day() - S.school.lastLateForgive >= 7) { S.school.lastLateForgive = G.day(); return -1; }
  if (G.hasTrait('early_bird') && G.chance(0.3)) return -1;
  S.school.late++; G.mod('schoolRep', -1.5); G.att('rules', -1);
  if (S.school.late % 5 === 0) Sc.giveDetention('repeated lateness');
  return late;
};
Sc.uniformCheck = function (teacher) {
  if (G.inUniform()) return '';
  G.mod('schoolRep', -2); G.S.school.warnings++;
  if (G.S.school.warnings % 4 === 0) Sc.giveDetention('uniform violations');
  return `<p class="warn">${G.nm(teacher)} frowns at your clothes. "${G.surnameP()}, that is not the school uniform. Sort it out."</p>`;
};
Sc.classScene = function (p) {
  const S = G.S; const sub = D.SUBJECTS[p.subj]; const tid = sub.teacher;
  if (S.loc !== sub.room) { G.advance(2); S.loc = sub.room; }
  const a = Sc.att(); if (a[p.id]) { G.result('You already attended this lesson.'); return; }
  const lateBy = Sc.lateness(p);
  a[p.id] = true; G.rel(tid).met = true;
  const peers = G.NPC.peersHere().filter(id => id !== 'dex' || G.chance(0.7));
  G.goto(() => {
    G.hr(`${sub.name} with ${G.nm(tid)}`);
    if (lateBy > 0) say(`<p class="warn">You slip in ${lateBy} minutes late. ${G.nm(tid)} pauses mid-sentence. "${G.pick(['How kind of you to join us.', 'Late again? Sit down, quickly.', 'We started without you. Obviously.', 'Find your seat, please. Quietly.'])}"</p>`);
    else if (lateBy < 0) say(`<p>You arrive a little late, but ${G.nm(tid)} just gives you an understanding nod.</p>`);
    say(Sc.uniformCheck(tid));
    // homework due
    const due = S.school.homework.filter(h => h.subj === (sub.gradeAs || p.subj) && h.due <= G.day());
    due.forEach(hw => {
      if (hw.done) { say(`<p>You hand in your ${sub.name} homework. ${G.nm(tid)} skims it and nods. "${hw.q > 60 ? 'Excellent work.' : 'Good, thank you.'}"</p>`); G.gradeXP(p.subj, 6 + hw.q / 8); G.mod('schoolRep', 1); }
      else { say(`<p class="warn">${G.nm(tid)} collects homework. You have nothing to hand in. "See me if this becomes a habit."</p>`); G.gradeXP(p.subj, -8); G.mod('schoolRep', -2); G.cnt('missedHW'); if (G.count('missedHW') % 3 === 0) Sc.giveDetention('missing homework'); }
    });
    S.school.homework = S.school.homework.filter(h => !due.includes(h));
    if (G.examDay()) { Sc.examChoices(p, sub, tid); return; }
    say(Sc.lessonText(p.subj, tid));
    const left = Math.max(10, p.end - G.mod_());
    const finish = (gradeAmt, statAmt, stam, stress, extra) => {
      G.advance(left, { rate: 0.7 });
      G.gradeXP(p.subj, gradeAmt);
      G.gain(sub.stat, statAmt);
      if (sub.skill) G.xp(sub.skill, gradeAmt * 0.8);
      G.mod('stamina', -stam); G.mod('stress', stress);
      let txt = extra || '';
      if (G.chance(0.45) && !G.examDay()) {
        const due = Sc.nextSchoolDay(); const key = sub.gradeAs || p.subj;
        if (!S.school.homework.some(h => h.subj === key && !h.done)) { S.school.homework.push({ subj: key, due, done: false, q: 0 }); txt += `<p>The bell rings. "Homework for ${G.shortDate(due)}," ${G.nm(tid)} calls over the noise. You note it down.</p>`; }
      }
      if (!txt) txt = '<p>The bell rings and the room fills with the scrape of chairs.</p>';
      G.checkTraits();
      if (G.Events && G.chance(0.18 * S.settings.eventRate)) { if (G.Events.maybe('class', { subj: p.subj, teacher: tid, after: txt })) return; }
      G.result(txt);
    };
    ch('Pay close attention', () => finish(16 + S.stats.awareness / 8, 0.5, 6, 3, ''), { time: left, tip: 'Best for grades, a little tiring' });
    ch('Take it easy and follow along', () => finish(9, 0.25, 3, 0, ''), { time: left });
    if (peers.length) {
      const f = G.pick(peers.filter(x => x !== 'dex').length ? peers.filter(x => x !== 'dex') : peers);
      ch(`Pass notes with ${G.nm(f)}`, () => {
        let extra;
        if (G.chance(0.25 + (S.att.rules > 20 ? 0.1 : 0) - S.stats.awareness / 400)) { extra = `<p class="warn">${G.nm(tid)} intercepts your note and reads it to the class. Your face burns. ${G.nm(f)} grins sheepishly.</p>`; G.mod('schoolRep', -3); G.att('rules', -2); if (G.chance(0.4)) Sc.giveDetention('passing notes'); G.friend(f, 2); }
        else { extra = `<p>You and ${G.nm(f)} trade doodles and terrible jokes on a scrap of paper. ${G.He(f)} stifle${G.s(f)} a laugh.</p>`; G.friend(f, 3.5); G.mod('stress', -4); G.att('rules', -1); }
        finish(5, 0.1, 2, -2, extra);
      }, { time: left, tip: 'Friendship up, small risk' });
    }
    ch('Daydream / doze off', () => {
      let extra = '';
      if (G.chance(0.35)) { extra = `<p class="warn">"${G.surnameP()}! Is my lesson boring you?" ${G.nm(tid)} raps on your desk. Snickers ripple around the room.</p>`; G.mod('schoolRep', -2); }
      else extra = '<p>You drift away on thoughts of weekends and warm beds. Nobody notices.</p>';
      G.mod('stamina', 8); finish(3, 0, -4, -4, extra);
    }, { time: left });
    ch('Sneak out of class', () => { G.att('rules', -4); G.gain('purity', -0.4); a[p.id] = false; G.mod('schoolRep', -2); S.loc = 'school_courtyard'; G.result(`You mutter something about the toilet and don't come back. The corridors are eerily quiet.`); }, { cls: 'risky' });
  });
};
Sc.lessonText = function (subj, tid) {
  const t = G.nm(tid);
  const L = {
    maths: [`${t} fills the board with quadratic equations, chalk squeaking. "Elegant, isn't it?"`, `Today is probability. ${t} rolls a pair of dice at the front desk, over and over.`, `Simultaneous equations. ${t} insists there is only ever one right answer.`],
    science: [`${t} lights a Bunsen burner with theatrical flair. "Safety goggles ON, everyone."`, `You dissect a flower under magnifying lenses while ${t} hums happily.`, `${t} explains the water cycle while pointing — a little too enthusiastically — at the weather outside.`],
    english: [`${t} reads a passage of poetry aloud and asks what the rain in it might mean.`, `Persuasive writing today. ${t} asks you to argue for longer lunch breaks.`, `You discuss a novel's heroine and whether she was right to lie. ${t} looks pointedly at the class.`],
    history: [`${t} tells the story of how Wetinburg was founded by fishermen sheltering from a storm.`, `A lesson on the old lighthouse and the shipwreck of 1887. ${t} lowers ${G.his(tid)} voice for the spooky part.`, `Timelines, dates, and an enthusiastic tangent about medieval bread.`],
    art: [`${t} sets up a still life: three apples, a teapot and a very confused-looking plant.`, `Watercolours! ${t} flicks paint across a page and calls it "freedom".`, `Charcoal portraits — you sketch the person beside you. Everyone looks a bit like a potato.`],
    pe: [`${t} blows the whistle. "Five laps! Then dodgeball!"`, `Circuit training. ${t} counts push-ups like a drill sergeant.`, `Football on the field. ${t} referees with intense seriousness.`],
    music: [`${t} plays a gentle piece on the piano and asks you to describe its colour.`, `Rhythm games with drums. The room becomes gloriously loud.`, `You learn a round. Somehow the class ends up singing it in four different keys.`],
    swim: [`${t} supervises lengths in the school pool, whistle echoing off the tiles.`, `Water safety day: treading water and floating practice.`, `Relay races in the pool. Chlorine everywhere.`],
  };
  return '<p>' + G.pick(L[subj]) + '</p>';
};
Sc.examChoices = function (p, sub, tid) {
  const S = G.S; const left = Math.max(10, p.end - G.mod_());
  say(`<p><b>Exam: ${sub.name}.</b> Desks are spaced apart. ${G.nm(tid)} hands out papers face down. "You may begin."</p>`);
  const sit = (effort) => {
    G.advance(left, { rate: 1.1 });
    const g = G.grade(p.subj);
    let score = 25 + g / 15 + S.stats.awareness / 5 + S.stats.willpower / 8 + effort * 6 - S.cond.stress / 6 - (S.cond.stamina < 25 ? 8 : 0) + G.ri(-8, 8);
    score = Math.round(G.clamp(score, 5, 100));
    const tier = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F';
    G.gradeXP(p.subj, (score - 50) * 1.6);
    G.mod('stress', effort * 3 + 3); G.mod('stamina', -6);
    G.mod('schoolRep', (score - 55) / 10);
    S.school.exams.push(`${G.shortDate(G.day())} — ${sub.name}: ${score}% (${tier})`);
    G.log(`Exam result — ${sub.name}: <b>${score}%</b> (${tier}).`);
    G.result(`<p>You put down your pen as time is called. Later, the results go up: <b>${score}% (${tier})</b>.</p>` + (score >= 80 ? `<p>${G.nm(tid)} gives you a rare smile.</p>` : score < 50 ? `<p>${G.nm(tid)} writes "Let's talk" at the top of your paper.</p>` : ''));
  };
  ch('Work carefully through every question', () => sit(2), { time: left });
  ch('Do your best without overthinking', () => sit(1), { time: left });
  if (S.flags.cheatAnswers === G.day() || S.flags.cheatSheet) ch('Use the answers you were slipped…', () => {
    delete S.flags.cheatSheet; G.att('honesty', -6); G.att('rules', -6); G.gain('purity', -3);
    if (G.chance(0.35 - S.skills.shoplifting / 3000)) { G.advance(left); G.gradeXP(p.subj, -60); G.mod('schoolRep', -15); Sc.giveDetention('cheating in an exam'); S.school.exams.push(`${G.shortDate(G.day())} — ${sub.name}: DISQUALIFIED`); G.result(`<p class="warn">${G.nm(tid)} spots the paper in your sleeve. Your exam is torn in half in front of everyone. The silence is unbearable.</p>`); }
    else { G.advance(left); G.gradeXP(p.subj, 40); S.school.exams.push(`${G.shortDate(G.day())} — ${sub.name}: 88% (A) *`); G.result('<p>You copy the answers. It works. The 88% doesn\'t feel as good as you thought it would.</p>'); }
  }, { cls: 'risky' });
};
Sc.registration = function () {
  const S = G.S; const p = D.PERIODS[0]; const a = Sc.att();
  if (a.reg) { G.result('You\'ve already been registered today.'); return; }
  S.loc = 'school_classroom';
  const late = Sc.lateness(p); a.reg = true; G.rel('hart').met = true;
  G.advance(Math.max(3, p.end - G.mod_()));
  const u = Sc.uniformCheck('hart');
  const lines = [`${G.nm('hart')} calls names in ${G.his('hart')} calm voice. "${G.pn()}?" "Here!"`, `Announcements: the canteen has run out of custard, and ${G.SPECIAL_NAMES.sports_day} sign-ups are on the noticeboard.`, `${G.nm('hart')} reminds everyone that the library returns box is not a bin.`, `Morning registration. Someone at the back is already asleep.`];
  G.result((late > 0 ? `<p class="warn">You burst in ${late} minutes late. ${G.nm('hart')} marks it without comment, which is somehow worse.</p>` : '') + u + '<p>' + G.pick(lines) + '</p>');
};
Sc.club = function (cid) {
  const S = G.S, c = D.CLUBS[cid];
  G.advance(90, { rate: 1.2 });
  G.xp(c.skill || 'housekeeping', c.skill ? 30 : 0, !c.skill);
  if (!c.skill) { G.gain('awareness', 0.8); G.cnt('study'); }
  G.gain(c.stat, 0.6); G.mod('stress', -6); G.mod('mood', 6); G.mod('schoolRep', 1);
  c.members.forEach(m => { G.friend(m, 2.5, true); G.rel(m).met = true; });
  const flav = { athletics: 'You sprint intervals until your lungs burn. Mira times you with a stopwatch and yells encouragement.', art: 'The art room is golden with afternoon light. Jun silently slides you a better brush.', swim: 'Lengths, flip turns, more lengths. Kai floats on {his:kai} back between sets, utterly serene.', music: 'Eli strums chords while the club argues about which song to learn next.', dance: 'Mirror, music, eight-count. Priya counts out loud with frightening precision.', garden: 'Rosie shows you how to thin seedlings and laughs when you get mud on your nose.', books: 'This week\'s book sparks a heated debate. Theo, unexpectedly, wins it.' }[cid];
  G.log(`Attended ${c.name}.`);
  G.result(`<p>${G.ptext(c.members[0], flav)}</p><p class="small dim">Club members: ${c.members.map(G.nm).join(', ')}</p>`);
};
Sc.sportsDay = function () {
  const S = G.S;
  if (G.today().sportsDone) { G.result('Sports Day is winding down. Parents fold picnic blankets.'); return; }
  G.goto(() => {
    G.hr('Sports Day!');
    say(`<p>Bunting flaps over the field. ${G.nm('okoro')} bellows through a megaphone. Mira is already doing stretches that look physically impossible.</p>`);
    const race = (kind) => {
      G.today().sportsDone = true; G.advance(120, { rate: 1.6 });
      const skill = kind === 'relay' ? G.skill('athletics') : kind === 'swim' ? G.skill('swimming') : G.skill('athletics');
      const score = skill / 10 + S.stats.physique / 2 + S.stats.willpower / 5 + G.ri(-15, 15);
      const place = score > 75 ? 1 : score > 55 ? 2 : score > 40 ? 3 : 5;
      G.xp(kind === 'swim' ? 'swimming' : 'athletics', 40); G.gain('physique', 1);
      G.mod('schoolRep', place === 1 ? 8 : place <= 3 ? 4 : 1);
      if (place === 1) G.give('crow_trinket');
      G.friend('mira', 3); G.friend('okoro', place <= 3 ? 4 : 1);
      G.log(`Sports Day: you came ${G.ord(place)} in the ${kind}.`);
      G.result(`<p>You give it everything. You finish <b>${G.ord(place)}</b>!</p>` + (place === 1 ? '<p>The crowd roars. Mira tackles you in a hug. You receive a shiny medal.</p>' : '<p>Your house cheers anyway. Ice lollies are handed out to everyone.</p>'));
    };
    ch('Run the 200m sprint', () => race('sprint'), { time: 120 });
    ch('Join the relay team', () => race('relay'), { time: 120 });
    ch('Compete in the swimming gala', () => race('swim'), { time: 120 });
    ch('Cheer from the sidelines', () => { G.today().sportsDone = true; G.advance(120); G.mod('stress', -8); G.mod('mood', 8); G.NPC.peersAll().forEach(id => G.friend(id, 1, true)); G.result('<p>You cheer until your voice is hoarse. It\'s honestly the best day of term.</p>'); }, { time: 120 });
  });
};
Sc.festival = function () {
  const S = G.S;
  if (G.today().festDone) { G.result('The festival is in full swing — stalls, music, the smell of takoyaki and candyfloss.'); return; }
  G.goto(() => {
    G.hr('School Culture Festival');
    say('<p>Classroom 2B has been turned into a café; the gym has a stage; the art room is a gallery. Everyone is wearing something ridiculous.</p>');
    const done = (txt, fx) => { G.today().festDone = true; G.advance(150); fx(); G.result(txt); };
    ch('Perform music on stage', () => done(G.skill('music') >= 300 ? '<p>Your performance gets a standing ovation. {nm:fenwick} dabs at {his:fenwick} eyes.</p>' : '<p>Your hands shake but you get through it. The applause is kind.</p>', () => { G.xp('music', 40); G.mod('schoolRep', G.skill('music') >= 300 ? 10 : 3); G.friend('eli', 4); }), { time: 150 });
    ch('Dance in the gym show', () => done(G.skill('dancing') >= 300 ? '<p>You nail every step. Priya, in the wings, actually squeals.</p>' : '<p>You miss a step, then improvise. Somehow it works.</p>', () => { G.xp('dancing', 40); G.mod('schoolRep', G.skill('dancing') >= 300 ? 9 : 3); G.friend('priya', 4); }), { time: 150 });
    ch('Exhibit art in the gallery', () => done(G.skill('art') >= 300 ? '<p>A visiting parent asks if your piece is for sale. Jun quietly points at it and gives you a thumbs-up.</p>' : '<p>Your painting hangs next to Jun\'s. People are generous.</p>', () => { G.xp('art', 40); G.mod('schoolRep', G.skill('art') >= 300 ? 8 : 3); G.friend('jun', 4); if (G.skill('art') >= 300) G.earn(20); }), { time: 150 });
    ch('Work the class café', () => done('<p>You serve tea and cake for hours. Your class raises the most money in the school!</p>', () => { G.xp('cooking', 25); G.mod('schoolRep', 5); G.NPC.peersAll().forEach(id => G.friend(id, 1.5, true)); }), { time: 150 });
    const p = G.partner(); if (p) ch(`Explore the festival with ${G.nm(p)}`, () => done(`<p>You and ${G.nm(p)} visit every stall, win a goldfish-shaped balloon and share a crepe. ${G.He(p)} hold${G.s(p)} your hand in the haunted-house queue.</p>`, () => { G.romance(p, 8); G.friend(p, 4); G.rel(p).lastDate = G.day(); G.mod('mood', 15); }), { time: 150, cls: 'love' });
  });
};

/* ================= FARM ================= */
const F = G.Farm = {};
F.overnight = function () {
  const S = G.S; const y = G.day() - 1; const wy = S.weather[y] ? S.weather[y].type : 'cloudy';
  const season = G.seasonIdx();
  S.farm.plots.forEach((p, i) => {
    if (!p.crop) return;
    const cr = D.CROPS[p.crop];
    if (cr.season !== season) { p.dead = true; }
    if (p.dead) return;
    if (p.growth >= cr.days) return;
    const wet = p.watered === y || wy === 'rain' || wy === 'storm' || wy === 'snow';
    if (wet) { p.growth++; p.dry = 0; if (G.hasTrait('green_thumb') && G.chance(0.25)) p.growth++; if (G.hasTf('fox') && G.chance(0.1)) p.growth++; }
    else { p.dry++; if (p.dry >= 3) { p.dead = true; G.log(`Your ${cr.name} at the farm withered from lack of water.`); } }
  });
  for (const a in S.farm.animals) { const an = S.farm.animals[a]; if (an.fed < y) an.happy = Math.max(0, an.happy - 4); }
};
F.plotsHTML = function () {
  const S = G.S;
  return '<div class="plots">' + S.farm.plots.slice(0, S.farm.plotsOwned).map((p, i) => {
    let st = 'Empty soil';
    if (p.crop) { const cr = D.CROPS[p.crop]; st = p.dead ? `Withered ${cr.name} 🥀` : p.growth >= cr.days ? `${cr.name} — ready! 🌟` : `${cr.name} ${'🌱'.repeat(1)} ${p.growth}/${cr.days} days ${p.watered === G.day() ? '💧' : '(needs water)'}`; }
    return `<div class="plot ${p.crop ? (p.dead ? 'dead' : 'grow') : ''}"><b>Plot ${i + 1}</b><br>${st}</div>`;
  }).join('') + '</div>';
};
F.scene = function () {
  const S = G.S;
  G.goto(() => {
    G.hr('Your Plots');
    const sIdx = G.seasonIdx();
    say(`<p>Season: <b>${G.season()}</b>. Crops that grow now: ${Object.keys(D.CROPS).filter(c => D.CROPS[c].season === sIdx).map(c => D.CROPS[c].name).join(', ')}. Rain waters everything for free; three dry days and crops wither.</p>`);
    say(F.plotsHTML());
    const seeds = Object.keys(S.inv).filter(id => D.ITEMS[id] && D.ITEMS[id].cat === 'seed');
    S.farm.plots.slice(0, S.farm.plotsOwned).forEach((p, i) => {
      if (!p.crop || p.dead) {
        if (p.dead) ch(`Clear plot ${i + 1}`, () => { Object.assign(p, { crop: null, growth: 0, dead: false, dry: 0 }); G.advance(10); G.xp('tending', 2); F.scene(); }, { time: 10 });
        else seeds.forEach(sid => { const cr = D.CROPS[D.ITEMS[sid].crop]; const ok = cr.season === sIdx; ch(`Plant ${cr.name} in plot ${i + 1}`, () => { G.take(sid); Object.assign(p, { crop: D.ITEMS[sid].crop, growth: 0, watered: G.day(), planted: G.day(), dry: 0, dead: false }); G.advance(20, { rate: 1.3 }); G.xp('tending', 8); G.gain('physique', 0.1, true); F.scene(); }, { time: 20, req: ok, why: ok ? '' : `Only grows in ${D.SEASONS[cr.season]}` }); });
      } else {
        const cr = D.CROPS[p.crop];
        if (p.growth >= cr.days) ch(`Harvest ${cr.name} (plot ${i + 1})`, () => F.harvest(i), { time: 15 });
        else if (p.watered !== G.day()) ch(`Water plot ${i + 1}`, () => { p.watered = G.day(); G.advance(8); G.xp('tending', 4); F.scene(); }, { time: 8 });
      }
    });
    if (!seeds.length) say('<p class="small dim">You have no seeds. Hollis Hardware in Lantern Lane sells seasonal seeds.</p>');
    if (S.farm.plotsOwned < 6) ch(`Rent another plot from Tom (£20)`, () => { if (G.pay(20)) { S.farm.plotsOwned++; G.log('You rented another farm plot.'); } F.scene(); }, { cost: 20, req: S.money >= 20, why: 'Need £20' });
    ch('Back to the farmyard', back);
  });
};
F.harvest = function (i) {
  const S = G.S, p = S.farm.plots[i], cr = D.CROPS[p.crop];
  let n = G.ri(cr.yield[0], cr.yield[1]) + Math.floor(G.skill('tending') / 400) + (G.hasTrait('green_thumb') ? 1 : 0);
  G.give(p.crop, n);
  if (p.crop === 'sunflower' && G.skill('tending') >= 400 && G.chance(0.3)) { G.give('golden_sunflower'); G.log('One of your sunflowers is perfect — a Golden Sunflower!'); }
  G.cnt('harvest', 1); G.xp('tending', 15 + cr.days * 2); G.gain('willpower', 0.3);
  G.log(`Harvested ${n}× ${cr.name}.`);
  Object.assign(p, { crop: null, growth: 0, dead: false, dry: 0 });
  G.advance(15); G.checkTraits(); F.scene();
};
F.animals = function () {
  const S = G.S; const d = G.day();
  G.goto(() => {
    G.hr('The Animals');
    say(`<p>The barn smells of hay and warm animals. ${G.isDark() ? 'Most of them are dozing.' : 'Hooves shift and hens mutter.'}</p>`);
    say('<div class="plots">' + Object.keys(D.ANIMALS).map(a => { const A = D.ANIMALS[a], s = S.farm.animals[a]; return `<div class="plot"><b>${A.name}</b> <span class="dim">(${A.kind})</span><br>Happiness ${Math.round(s.happy)} ${s.happy > 70 ? '😊' : s.happy > 40 ? '🙂' : '😟'}${s.fed === d ? ' · fed' : ''}${s.brushed === d ? ' · groomed' : ''}</div>`; }).join('') + '</div>');
    for (const a in D.ANIMALS) {
      const A = D.ANIMALS[a], s = S.farm.animals[a];
      if (s.fed !== d) ch(`Feed ${A.name}`, () => { s.fed = d; s.happy = Math.min(100, s.happy + 8); G.advance(10); G.xp('animalcare', 5); G.cnt('animalCare'); F.animals(); }, { time: 10 });
      if (s.brushed !== d && a !== 'hens') ch(`Groom ${A.name}`, () => { s.brushed = d; s.happy = Math.min(100, s.happy + 6); G.advance(15); G.xp('animalcare', 7); G.mod('stress', -3); G.cnt('animalCare'); F.animals(); }, { time: 15 });
      ch(`Soothe ${A.name}`, () => F.soothe(a), { time: 15, tip: 'Calm and bond with the animal — uses Tending/Animal Care' });
      if (A.product && s.collected !== d && (A.product !== 'wool' || (G.day() % 7 === 0))) ch(`Collect ${D.ITEMS[A.product].name.toLowerCase()} from ${A.name}`, () => {
        s.collected = d; G.advance(15);
        if (s.happy < 35) { G.result(`<p>${A.name} is too unsettled to cooperate today. Maybe some care first.</p>`, F.animals); return; }
        const n = A.product === 'egg' ? G.ri(2, 5) : 1 + (s.happy > 80 ? 1 : 0); G.give(A.product, n); G.xp('animalcare', 6); F.animals();
      }, { time: 15 });
    }
    ch('Back to the farmyard', back);
  });
};
F.soothe = function (a) {
  const S = G.S, A = D.ANIMALS[a], s = S.farm.animals[a];
  G.advance(15); G.cnt('animalCare');
  const score = G.skill('animalcare') / 8 + G.skill('tending') / 20 + S.stats.willpower / 3 + s.happy / 4 + G.ri(0, 40);
  if (G.hasTrait('animal_whisperer') || score > A.temper + 20) {
    s.happy = Math.min(100, s.happy + 12); G.xp('animalcare', 12); G.mod('stress', -6); G.gain('willpower', 0.2);
    const t = { cow: `Buttercup leans her enormous head into your hands and sighs contentedly.`, pony: `Pepper stops stamping and nuzzles your pocket, looking for apples.`, goat: `Clover stops chewing your sleeve and settles down beside you.`, chickens: `The hens cluck softly and one hops into your lap.`, sheep: `Woolly leans against your legs like a big, warm cloud.` }[A.kind];
    G.result(`<p>You speak softly and move slowly. ${t}</p>`, F.animals);
  } else {
    s.happy = Math.max(0, s.happy - 3); G.xp('animalcare', 5); G.mod('stress', 4);
    const t = { cow: 'Buttercup swings her head and knocks you into the hay.', pony: 'Pepper snorts and sidesteps onto your foot. Ow.', goat: 'Clover headbutts you squarely in the thigh and bleats triumphantly.', chickens: 'The hens erupt in a flurry of feathers and indignation.', sheep: 'Woolly bolts to the far side of the pen.' }[A.kind];
    if (A.kind !== 'chickens') G.mod('health', -2);
    G.result(`<p>${t} Animals can sense nerves. Try again when you're calmer.</p>`, F.animals);
  }
};
F.sell = function (mult, where) {
  const S = G.S; mult = mult || 1;
  G.goto(() => {
    G.hr(`Sell produce — ${where}`);
    const goods = Object.keys(S.inv).filter(id => D.ITEMS[id] && D.ITEMS[id].sell);
    if (!goods.length) say('<p>You have nothing to sell.</p>');
    goods.forEach(id => { const price = Math.round(D.ITEMS[id].sell * mult * (1 + G.skill('tending') / 4000) * 10) / 10; ch(`Sell ${D.ITEMS[id].name} (×${S.inv[id]}) for ${G.money(price)} each`, () => { G.take(id); G.earn(price); G.cnt('sold'); F.sell(mult, where); }); });
    if (goods.length > 1) ch('Sell everything', () => { let tot = 0; goods.forEach(id => { const price = Math.round(D.ITEMS[id].sell * mult * (1 + G.skill('tending') / 4000) * 10) / 10; tot += price * S.inv[id]; delete S.inv[id]; }); G.earn(tot); G.result(`You sell everything for ${G.money(tot)}.`); });
    ch('Done', back);
  });
};

/* ================= JOBS ================= */
const J = G.Jobs = {};
J.hired = (j) => G.S.jobs[j] && G.S.jobs[j].hired;
J.inHours = (j) => { const h = G.hour(), jb = D.JOBS[j]; return h >= jb.hours[0] && h + jb.shift / 60 <= jb.hours[1] + 0.01; };
J.apply = function (j) {
  const S = G.S, jb = D.JOBS[j];
  const fails = Object.keys(jb.req).filter(k => S.stats[k] < jb.req[k]);
  G.advance(15);
  if (fails.length) { G.result(`<p>"${G.pick(['Sorry, love, I need someone a bit more', 'Come back when you\'re a bit more'])} ${fails.map(k => D.STATS[k].name.toLowerCase()).join(' and ')}-ready," you're told kindly. (Need ${fails.map(k => D.STATS[k].name + ' ' + jb.req[k]).join(', ')}.)</p>`); return; }
  S.jobs[j] = { hired: true, shifts: 0, perf: 50 };
  if (jb.boss) G.friend(jb.boss, 3);
  G.log(`You got a part-time job: <b>${jb.name}</b>.`);
  G.result(`<p>You're hired as a <b>${jb.name}</b>! ${jb.desc} Shifts are flexible within ${G.timeStr(jb.hours[0] * 60)}–${G.timeStr(jb.hours[1] * 60)}.</p>`);
};
J.work = function (j) {
  const S = G.S, jb = D.JOBS[j], job = S.jobs[j];
  if (S.cond.stamina < 15) { G.result('You\'re far too tired to work a shift right now.'); return; }
  const flav = {
    cafe: ['The lunch rush hits like a wave. You balance three plates and a smile.', 'A regular orders "the usual" and you actually remember it. Bea beams.', 'You learn to draw a heart in latte foam. It looks more like a potato. Close enough.', '{nm:fenwick} comes in, orders tea, and Bea suddenly needs to fix {his:bea} hair.'],
    farm: ['You haul feed sacks until your arms shake. Tom nods once — high praise.', 'Mucking out the stables. Glamorous it is not, but the work is honest.', 'You mend a fence with Tom, who teaches you three knots and no small talk.', 'Rosie races you to finish the egg round. {He:rosie} win{s:rosie}. {He:rosie} always win{s:rosie}.'],
    library: ['You reshelve a mountain of returns. The quiet is soothing.', 'A small child asks for "the book with the blue dragon". You find it. Hero.', 'Mrs. Pell teaches you the mysteries of the Dewey Decimal System.', 'You repair torn spines with tape and patience.'],
    paper: ['You pedal through the misty streets as Wetinburg wakes up, tossing papers onto doorsteps.', 'A dog chases you for two streets. You deliver every paper anyway.', 'The sunrise over the bay is so beautiful you almost miss a house.'],
  }[j];
  const time = jb.shift;
  G.advance(time, { rate: j === 'farm' || j === 'paper' ? 1.6 : 1.2 });
  let pay = Math.round((jb.flat || jb.pay * time / 60) * G.diff().wage * 100) / 100;
  let tips = 0;
  if (j === 'cafe') tips = Math.round((G.effBeauty() / 12 + S.cond.mood / 20 + G.ri(0, 4)) * 10) / 10;
  if (jb.skill) G.xp(jb.skill, 20);
  G.gain(jb.stat, 0.5);
  if (j === 'farm') { G.xp('animalcare', 10); for (const a in S.farm.animals) S.farm.animals[a].happy = Math.min(100, S.farm.animals[a].happy + 2); }
  if (j === 'library') { G.gain('awareness', 0.4); G.mod('stress', -2); }
  G.mod('stress', j === 'cafe' ? 5 : j === 'library' ? 0 : 3);
  job.shifts++;
  if (jb.boss) G.friend(jb.boss, 1.5, true);
  if (job.shifts % 10 === 0) { pay += 10; G.log(`Your boss gave you a £10 bonus for ${job.shifts} shifts of good work.`); }
  G.earn(Math.round((pay + tips) * 100) / 100);
  G.cnt('shifts');
  const txt = `<p>${G.pick(flav)}</p><p>Shift complete. You earned <b>${G.money(pay)}</b>${tips ? ` plus <b>${G.money(tips)}</b> in tips` : ''}.</p>`;
  if (G.Events && G.chance(0.15 * S.settings.eventRate) && G.Events.maybe('work', { job: j, after: txt })) return;
  G.result(txt);
};

/* ================= SHOPS ================= */
const Sh = G.Shops = {};
Sh.price = (id, base) => { const d = G.S.discount; let p = base; if (d && d.day === G.day()) p = Math.round(p * (1 - d.pct) * 10) / 10; return p; };
Sh.open = function (sid) {
  const S = G.S, shop = D.SHOPS[sid];
  const h = G.hour(); if (h < shop.hours[0] || h >= shop.hours[1]) { G.result(`${shop.name} is closed. Opening hours: ${G.timeStr(shop.hours[0] * 60)}–${G.timeStr(shop.hours[1] * 60)}.`); return; }
  G.goto(() => {
    G.hr(shop.name);
    say(`<p>${{ grocer: 'Crates of fruit, a humming fridge, and a cat asleep on the potatoes.', gifts: 'Wind chimes tinkle over shelves of cute, useless and wonderful things.', hardware: 'Smells of sawdust and seed packets. Mr. Hollis peers over his spectacles.', books: 'Creaky floorboards, towering shelves, and a reading nook with a sleeping dog.', pharmacy: 'Bright, clean, and quiet.', kiosk: 'A little green kiosk by the fountain, run by a cheerful old man.', cafe: 'Copper kettles steam behind the counter. The cakes look incredible.', canteen: 'The canteen ladies ladle and serve with military efficiency.' }[sid]}</p><p class="small">You have <b>${G.money(S.money)}</b>.${S.discount && S.discount.day === G.day() ? ` <span class="okmsg">Sale today: ${Math.round(S.discount.pct * 100)}% off!</span>` : ''}</p>`);
    let items = shop.items.slice();
    if (items.includes('seasonal_seeds')) { items = items.filter(i => i !== 'seasonal_seeds'); Object.keys(D.ITEMS).filter(i => D.ITEMS[i].cat === 'seed' && D.CROPS[D.ITEMS[i].crop].season === G.seasonIdx()).forEach(i => items.push(i)); }
    items.forEach(id => {
      const it = D.ITEMS[id]; const p = Sh.price(id, it.price);
      if (id === 'bicycle' && G.has('bicycle')) return;
      ch(`Buy ${it.name}`, () => { if (!G.pay(p)) return; if (id === 'bus_pass') { S.flags.busPassUntil = G.day() + 28; G.note('Bus pass active for 28 days', 'item'); } else G.give(id); G.cnt('bought'); Sh.open(sid); }, { cost: p, req: S.money >= p, why: 'Not enough money', tip: it.desc });
    });
    if (sid === 'grocer') ch('Sell produce to the grocer', () => F.sell(1.1, shop.name));
    if (sid !== 'canteen' && sid !== 'cafe') ch('Try to pocket something…', () => G.Crime.shoplift(sid), { cls: 'risky', tip: 'Shoplifting — risky and dishonest' });
    ch('Leave', back);
  });
};
Sh.clothes = function () {
  const S = G.S;
  G.goto(() => {
    G.hr('Threads & Co. — Clothing');
    say(`<p>Racks of colourful clothes and a fitting room with a squeaky curtain. You can change here. You have <b>${G.money(S.money)}</b>.</p>`);
    D.SHOP_CLOTHES.filter(id => !G.ownCloth(id)).forEach(id => {
      const c = D.CLOTHES[id]; const p = Sh.price(id, c.price);
      ch(`Buy ${c.name} <span class="dim small">(${c.slot}${c.beauty ? ', +' + c.beauty + ' beauty' : ''}${c.warmth ? ', warmth ' + c.warmth : ''}${c.rain ? ', rainproof' : ''})</span>`, () => { if (G.pay(p)) { S.wardrobe.push(id); G.note('Bought ' + c.name, 'item'); G.gain('beauty', 0.3); } Sh.clothes(); }, { cost: p, req: S.money >= p, why: 'Not enough money' });
    });
    ch('Open your wardrobe (fitting room)', () => { G.menu('wardrobe'); Sh.clothes(); });
    ch('Try to slip something into your bag…', () => G.Crime.shoplift('clothes'), { cls: 'risky' });
    ch('Leave', back);
  });
};
Sh.salon = function () {
  const S = G.S, L = S.player.look;
  G.goto(() => {
    G.hr('Snip & Style Salon');
    say(`<p>Hairdryers whirr. The stylist, a cheerful woman with lilac hair, pats the chair. Currently: <b>${L.hairColor} ${L.hair}</b>. Cut £15, colour £20.</p>`);
    D.HAIR_STYLES.filter(h => h !== L.hair).forEach(h => ch(`Restyle: ${h}`, () => { if (G.pay(15)) { L.hair = h; G.advance(45); G.gain('beauty', 1); G.mod('mood', 5); } Sh.salon(); }, { cost: 15, time: 45, req: S.money >= 15, why: 'Need £15' }));
    Object.keys(D.HAIR_COLORS).filter(c => c !== L.hairColor).forEach(c => ch(`Colour: ${c}`, () => { if (G.pay(20)) { L.hairColor = c; G.advance(60); G.gain('beauty', 0.8); G.mod('mood', 5); } Sh.salon(); }, { cost: 20, time: 60, req: S.money >= 20, why: 'Need £20' }));
    ch('Leave', back);
  });
};
Sh.tattoo = function () {
  const S = G.S;
  const h = G.hour(); if (h < 11 || h >= 20) { G.result('Inkwell Studio is closed (11:00–20:00).'); return; }
  G.goto(() => {
    G.hr('Inkwell Studio — Tattoo & Henna');
    say(`<p>Walls covered in flash art; a tidy, spotless studio. The artist, Marlow, has kind eyes and a firm rule: <i>"Permanent ink is for adults only, 18 and up, no exceptions. But henna? Henna's for everyone — it fades in about two weeks."</i></p>`);
    say(`<p class="small">You are ${S.player.age}. Henna £12 · Permanent tattoo £45 (18+). You have ${S.player.tattoos.length} marking(s).</p>`);
    ch('Get a small henna design', () => Sh.tattooPick(false), { cost: 12, req: S.money >= 12, why: 'Need £12' });
    ch('Get a permanent tattoo', () => Sh.tattooPick(true), { cost: 45, req: S.player.age >= 18 && S.money >= 45, why: S.player.age < 18 ? 'Must be 18 or older' : 'Need £45' });
    if (S.player.tattoos.some(t => t.perm)) ch('Ask about laser removal (£60)', () => { if (!G.pay(60)) return; S.player.tattoos = S.player.tattoos.filter(t => !t.perm); G.advance(60); G.result('After a few stinging sessions the ink is gone.'); }, { cost: 60, req: S.money >= 60 });
    ch('Leave', back);
  });
};
Sh.tattooPick = function (perm) {
  const S = G.S; G.goto(() => {
    G.hr(perm ? 'Choose a tattoo' : 'Choose a henna design');
    const taken = S.player.tattoos.map(t => t.place);
    const places = Object.keys(D.TATTOO_PLACES).filter(p => !taken.includes(p));
    if (!places.length) { say('<p>You\'ve no room left for more designs!</p>'); ch('Back', Sh.tattoo); return; }
    const place = places[0];
    say(`<p>Placement: <b>${D.TATTOO_PLACES[place]}</b> (next free spot). Pick a design:</p>`);
    Object.keys(D.TATTOO_DESIGNS).forEach(dz => ch(`${D.TATTOO_DESIGNS[dz]} ${dz}`, () => {
      if (!G.pay(perm ? 45 : 12)) return;
      S.player.tattoos.push({ design: dz, place, perm, expires: perm ? 99999 : G.day() + 14 });
      G.advance(perm ? 90 : 40); G.gain('beauty', perm ? 1.5 : 0.8); G.mod('mood', 6);
      G.log(`You got a ${perm ? 'tattoo' : 'henna design'}: ${dz} on your ${D.TATTOO_PLACES[place].toLowerCase()}.`);
      G.result(`<p>${perm ? 'The needle buzzes. It stings, then it\'s done.' : 'The cool henna paste is piped on in delicate swirls.'} A little ${dz} now decorates your ${D.TATTOO_PLACES[place].toLowerCase()}.</p>`, Sh.tattoo);
    }));
    ch('Never mind', Sh.tattoo);
  });
};
Sh.cinema = function () {
  const S = G.S; const h = G.hour();
  if (h < 13 || h >= 22) { G.result('The Lantern Picture House shows films from 13:00 to 22:00.'); return; }
  const films = ['a heartwarming animated film about a lost robot', 'a mystery about a stolen painting', 'a goofy comedy about a talking goat', 'an epic space adventure', 'a sweet coming-of-age story set by the sea'];
  G.goto(() => {
    G.hr('Lantern Picture House');
    say(`<p>Red velvet seats and the smell of popcorn. Today: ${G.pick(films)}.</p>`);
    ch('Watch the film alone (£8)', () => { if (!G.pay(8)) return; G.advance(120); G.mod('stress', -12); G.mod('mood', 10); G.gain('awareness', 0.2); G.result('<p>You lose yourself in the story for two hours. When the lights come up, you feel lighter.</p>'); }, { cost: 8, time: 120, req: S.money >= 8 });
    ch('Leave', back);
  });
};

/* ================= SKULDUGGERY ================= */
const Cr = G.Crime = {};
Cr.successBonus = () => (G.hasTrait('sticky_fingers') ? 0.1 : 0) + (G.hasTf('cat') ? 0.15 : 0);
Cr.onSuccess = function (amt) { G.cnt('crimeOK'); G.gain('purity', -amt); G.att('rules', -3); G.att('honesty', -1.5); G.mod('stress', 3); G.checkTraits(); };
Cr.pickpocket = function () {
  const S = G.S;
  const targets = [
    { name: `a distracted tourist`, alert: 0.25, cash: [5, 18], pur: 2 },
    { name: `a businessman on his phone`, alert: 0.4, cash: [10, 35], pur: 2.5 },
    { name: `a sharp-eyed shopper`, alert: 0.6, cash: [8, 25], pur: 2.5 },
    { name: `an old lady with a handbag`, alert: 0.2, cash: [3, 10], pur: 5 },
  ];
  G.goto(() => {
    G.hr('Pickpocketing');
    say(`<p>You scan the crowd. Your heart pounds. This is wrong, and you know it — but the wallets are <i>right there</i>.</p><p class="small dim">Pickpocketing: ${G.skillTier('pickpocketing')}. Awareness ${Math.round(S.stats.awareness)}.</p>`);
    targets.forEach(t => ch(`Target ${t.name}`, () => Cr.ppApproach(t), { cls: 'risky' }));
    ch('Think better of it', () => { G.att('honesty', 1); G.gain('willpower', 0.3); G.result('You shove your hands in your pockets and walk away. Good call.'); });
  });
};
Cr.ppApproach = function (t) {
  G.goto(() => {
    say(`<p>You drift closer to ${t.name}. How do you go about it?</p>`);
    const go = (mod, txt) => Cr.ppResolve(t, mod, txt);
    ch('Bump into them and apologise', () => go(0.05, 'bump'));
    ch('Wait for a distraction', () => { G.advance(10); go(G.chance(0.5) ? 0.15 : -0.05, 'wait'); }, { time: 10 });
    ch('Reach in while they look away', () => go(-0.05 + G.S.stats.awareness / 500, 'reach'));
    ch('Back off', back);
  });
};
Cr.ppResolve = function (t, mod, how) {
  const S = G.S; G.advance(5);
  const p = G.clamp(0.35 + G.skill('pickpocketing') / 1600 + S.stats.awareness / 400 - t.alert * 0.6 + mod + Cr.successBonus() - (G.isDark() ? 0 : 0.03), 0.05, 0.92);
  G.xp('pickpocketing', 12);
  if (G.chance(p)) {
    const cash = G.ri(t.cash[0], t.cash[1]); G.earn(cash); Cr.onSuccess(t.pur);
    G.result(`<p>Your fingers close on a few notes and you melt back into the crowd. <b>${G.money(cash)}</b>. ${t.pur > 3 ? 'Your stomach twists when you think of the old lady\'s face.' : 'Your hands are shaking.'}</p>`);
  } else Cr.caught(`${G.cap(t.name)} feels your hand and spins around: "Hey! THIEF!"`);
};
Cr.shoplift = function (sid) {
  const S = G.S;
  const pool = sid === 'clothes' ? D.SHOP_CLOTHES.filter(id => !G.ownCloth(id) && D.CLOTHES[id].price <= 30).map(id => ({ id, c: true, price: D.CLOTHES[id].price, name: D.CLOTHES[id].name })) : (D.SHOPS[sid].items.filter(id => D.ITEMS[id] && D.ITEMS[id].price > 0 && D.ITEMS[id].price <= 25).map(id => ({ id, price: D.ITEMS[id].price, name: D.ITEMS[id].name })));
  G.goto(() => {
    G.hr('Shoplifting');
    say(`<p>You browse casually, watching the staff from the corner of your eye. Bigger items are riskier. <span class="small dim">(Shoplifting ${G.skillTier('shoplifting')})</span></p>`);
    pool.slice(0, 8).forEach(it => ch(`Pocket the ${it.name} <span class="small dim">(${G.money(it.price)})</span>`, () => {
      G.advance(10); G.xp('shoplifting', 10 + it.price / 3);
      const p = G.clamp(0.55 + G.skill('shoplifting') / 1500 + S.stats.awareness / 500 - it.price / 60 + Cr.successBonus(), 0.05, 0.92);
      if (G.chance(p)) { if (it.c) S.wardrobe.push(it.id); else G.give(it.id); Cr.onSuccess(1.5 + it.price / 15); G.result(`<p>You walk out with the ${it.name} hidden away. Nobody stops you. Your heart is going a hundred miles an hour.</p>`); }
      else Cr.caught('A hand lands on your shoulder. "I think you\'d better empty your bag."');
    }, { cls: 'risky' }));
    ch('Lose your nerve and leave', () => { G.gain('willpower', 0.2); back(); });
  });
};
Cr.lockpick = function (target) {
  const S = G.S;
  const T2 = { shed: { name: 'a padlocked storage shed', diff: 3, loot: () => { const m = G.ri(5, 25); G.earn(m); return `Inside, among nets and buoys, you find a tin with ${G.money(m)} in it.`; }, pur: 3 },
    hut: { name: 'an old locked beach hut', diff: 2, loot: () => { G.give('seashell'); const m = G.ri(2, 10); G.earn(m); return `Deckchairs, a cool-box, and ${G.money(m)} in loose change.`; }, pur: 2.5 },
    practice: { name: 'your practice padlock', diff: 1, loot: () => 'The shackle pops open. Satisfying!', pur: 0 } }[target];
  if (target !== 'practice' && !G.has('bobby_pins')) { G.result('You need something to pick with — bobby pins, perhaps (Hollis Hardware).'); return; }
  const pins = G.ri(2, 3) + (T2.diff > 2 ? 1 : 0); let cur = 0, mistakes = 0;
  const feel = { gentle: ['springy', 'light and bouncy'], firm: ['stiff', 'gritty and heavy'], wiggle: ['sticky', 'catching on something'] };
  const keys = Object.keys(feel);
  const step = () => {
    const correct = G.pick(keys); const clarity = G.skill('lockpicking') / 10 + S.stats.awareness;
    G.goto(() => {
      G.hr(`Picking ${T2.name} — pin ${cur + 1}/${pins}`);
      const hint = clarity > 40 || G.chance(0.6) ? `The pin feels <b>${G.pick(feel[correct])}</b>.` : `The pin feels… ${G.pick(['odd', 'hard to read', 'like a pin'])}.`;
      say(`<p>${hint}${mistakes ? ` <span class="warn">(${mistakes} slip${mistakes > 1 ? 's' : ''})</span>` : ''}</p><p class="small dim">Springy → gentle pressure. Stiff → firm push. Sticky → wiggle.</p>`);
      keys.forEach(k => ch({ gentle: 'Apply gentle pressure', firm: 'Push firmly', wiggle: 'Wiggle and rake' }[k], () => {
        G.advance(3); G.xp('lockpicking', target === 'practice' ? 4 : 7);
        if (k === correct || G.chance(G.skill('lockpicking') / 3000)) { cur++; if (cur >= pins) finish(true); else step(); }
        else { mistakes++; if (target !== 'practice' && G.chance(0.25)) { G.take('bobby_pins'); G.note('A bobby pin snapped', 'down'); if (!G.has('bobby_pins')) { finish(false, 'Your last pin snaps.'); return; } } if (mistakes >= 3) finish(false); else step(); }
      }));
      ch('Give up', back);
    });
  };
  const finish = (ok, why) => {
    if (ok) {
      const txt = T2.loot(); if (T2.pur) Cr.onSuccess(T2.pur); else { G.gain('willpower', 0.2); G.cnt('lockPractice'); }
      G.xp('lockpicking', 15); G.result(`<p>Click. ${txt}</p>`);
    } else {
      if (target !== 'practice' && G.chance(0.45)) Cr.caught(`${why || 'The pins jam.'} A torch beam hits you. "Oi! What are you doing to that lock?"`);
      else G.result(`<p>${why || 'The pins jam and the lock refuses to budge.'} You'll have to try again later.</p>`);
    }
  };
  step();
};
Cr.caught = function (line) {
  const S = G.S;
  G.goto(() => {
    G.hr('Caught!');
    say(`<p class="warn">${line}</p>`);
    ch('Run for it!', () => {
      G.advance(5); G.mod('stamina', -10);
      const p = 0.25 + S.stats.physique / 160 + G.skill('athletics') / 2500 + (G.hasTf('cat') ? 0.1 : 0);
      if (G.chance(p)) { G.mod('stress', 8); G.gain('purity', -1); G.mod('rep', -2); G.att('rules', -3); G.result('<p>You bolt, weaving through the crowd, and don\'t stop until your lungs give out. You got away… this time.</p>'); }
      else Cr.police('You make it ten metres before you\'re grabbed.');
    }, { tip: 'Physique check' });
    ch('Spin a convincing lie', () => {
      G.att('honesty', -5); G.advance(5);
      if (G.chance(0.25 + S.stats.awareness / 250 + (S.att.honesty < -30 ? 0.15 : 0))) { G.gain('purity', -1.5); G.result('<p>"Oh my gosh, I am SO sorry — I thought it was my friend\'s!" It works. Somehow, it works.</p>'); }
      else Cr.police('"Nice try."');
    }, { req: S.att.honesty <= 10, why: 'You\'re too honest to lie convincingly', tip: 'Requires a less-than-honest attitude' });
    ch('Apologise honestly and give it back', () => {
      G.att('honesty', 4); G.advance(10);
      if (G.chance(0.45 + S.stats.purity / 250)) { G.mod('rep', -3); G.gain('purity', -0.5); G.gain('willpower', 0.5); G.result('<p>Your honesty catches them off guard. After a stern lecture, they let you go with a warning. You feel sick with shame — and relieved.</p>'); }
      else Cr.police('"Sorry doesn\'t cut it. I\'m calling the police."');
    });
  });
};
Cr.police = function (line) {
  const S = G.S; S.record.caught++;
  const fine = 15 + S.record.caught * 10;
  G.advance(90);
  G.mod('rep', -8); G.mod('schoolRep', -5); G.gain('purity', -3); G.mod('stress', 15); G.mod('mood', -15);
  G.rel('reyes').met = true; G.friend('reyes', -3, true); G.trust('reyes', -5);
  let txt = `<p class="warn">${line}</p><p>Officer Reyes drives you to the station and sits you down with a paper cup of water. "${G.pn()}… this is ${S.record.caught === 1 ? 'your first time, so let\'s make it your last' : 'not the first time. I\'m worried about you'}."</p>`;
  if (G.pay(fine)) txt += `<p>You pay a <b>${G.money(fine)}</b> fine on the spot.</p>`;
  else { S.record.unpaid += fine; txt += `<p>You can't pay the <b>${G.money(fine)}</b> fine. It goes on record — pay it off at the station.</p>`; }
  if (S.record.caught >= 3) { S.flags.communityRequired = true; txt += '<p>"You\'ll be doing community service. Come by the station and we\'ll set it up."</p>'; }
  G.log(`Caught by the police. Fined ${G.money(fine)}. Record: ${S.record.caught}.`);
  S.loc = 'police';
  G.result(txt);
};
})(window.G);
