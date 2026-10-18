/* Wetinburg Days — random events (weighted by location, time, weather, stats) */
(function (G) {
'use strict';
const D = G.DATA;
const say = (h) => G.say(h), ch = (l, f, o) => G.ch(l, f, o);
const back = () => G.goto(G.here);
const E = G.Events = { list: [] };
const loc = () => G.S.loc, L = () => D.LOCATIONS[G.S.loc];
const wt = () => G.weather().type, out = () => !!L().outdoor, h = () => G.hour();
const at = (...ids) => ids.includes(loc());
const inSchool = () => L().area === 'school';
const met = (id) => G.rel(id).met;
const town = () => at('square', 'shopping', 'street', 'park', 'school_gate');
const food = () => Object.keys(G.S.inv).filter(i => D.ITEMS[i] && D.ITEMS[i].cat === 'food' && D.ITEMS[i].eat);
const def = (id, ctx, w, cond, run, cd) => E.list.push({ id, ctx, w, cond, run, cd: cd === undefined ? 2 : cd });
const intro = (o, title) => { if (o && o.after) say(o.after); G.hr('✦ ' + title); };
const good = () => { G.cnt('goodDeed'); G.att('kindness', 2); };
const BASE = { arrive: 0.22, idle: 0.14, class: 1, work: 1, wake: 0.18, library: 0.35, forest: 0.4, volunteer: 0.35 };

E.maybe = function (ctx, opts) {
  const S = G.S; if (!S || !S.started) return false;
  if (S.pending.length) return false;
  const rate = (BASE[ctx] || 0.15) * (S.settings.eventRate || 1);
  if (!G.chance(rate)) return false;
  const d = G.day();
  const pool = E.list.filter(e => e.ctx.includes(ctx) && (S.evCooldown[e.id] === undefined || d - S.evCooldown[e.id] >= e.cd)).map(e => { let w = 0; try { w = e.cond() ? (typeof e.w === 'function' ? e.w() : e.w) : 0; } catch (err) { console.error('event cond', e.id, err); } return { e, w }; }).filter(x => x.w > 0);
  if (!pool.length) return false;
  const pick = G.weighted(pool).e;
  S.evCooldown[pick.id] = d; G.cnt('events');
  G.lastEvent = pick.id;
  G.goto(() => pick.run(opts || {}));
  return true;
};
E.force = function (id, opts, ignoreCond) { const e = E.list.find(x => x.id === id); if (!e) return false; if (!ignoreCond) { let ok = false; try { ok = e.cond(); } catch (err) { ok = false; } if (!ok) return false; } G.S.evCooldown[id] = G.day(); G.goto(() => e.run(opts || {})); return true; };

const A = ['arrive', 'idle'];
/* 1 */ def('found_coin', A, 6, () => out(), (o) => { intro(o, 'Something shiny'); const m = G.ri(1, 5); say(`<p>Something glints between the cobbles — a ${G.money(m)} coin!</p>`); ch('Pocket it', () => { G.earn(m); G.result('<p>Finders keepers. Today is a good day.</p>'); }); ch('Drop it in the charity box nearby', () => { G.gain('purity', 0.6); good(); G.result('<p>You drop it in a charity box. Warm fuzzy feeling acquired.</p>'); }); }, 1);
/* 2 */ def('found_wallet', A, 3, () => town() && !G.has('lost_wallet'), (o) => {
  intro(o, 'A lost wallet'); say('<p>A brown leather wallet lies on the pavement. Inside: an ID card for a fisherman called Gareth Pike, and £30 in notes.</p>');
  ch('Keep the cash, ditch the wallet', () => { G.earn(30); G.gain('purity', -3); G.att('honesty', -6); G.mod('stress', 4); G.result('<p>You pocket the money and drop the wallet in a bin. It doesn\'t feel great.</p>'); }, { cls: 'risky' });
  ch('Take it to the police station later', () => { G.give('lost_wallet'); G.att('honesty', 2); G.result('<p>You tuck it safely away to hand in at the police station.</p>'); });
  ch('Try to track down the owner yourself', () => { G.advance(45); if (G.S.stats.awareness + G.ri(0, 40) > 50) { G.earn(10); G.gain('purity', 3); G.att('honesty', 6); G.mod('rep', 4); good(); G.result('<p>You find Gareth at the docks, frantically searching. He nearly cries and insists on giving you £10.</p>'); } else { G.give('lost_wallet'); G.result('<p>You can\'t find him. Best to hand it in at the police station.</p>'); } }, { time: 45 });
}, 6);
/* 3 */ def('lost_pet', A, 3, () => at('park', 'square', 'street') && h() > 7 && h() < 20, (o) => {
  intro(o, 'Lost dog'); say('<p>A tearful kid is pinning up posters: "LOST — BISCUIT, small scruffy terrier." "Have you seen him?"</p>');
  ch('Help search', () => { G.advance(60, { walk: true }); if (G.S.stats.awareness + G.ri(0, 50) > 45) { G.earn(15); G.gain('purity', 2); G.mod('rep', 3); good(); G.result('<p>You find Biscuit under a bench, eating a sandwich that isn\'t his. The reunion is loud and wet. The kid\'s mum insists on a £15 reward.</p>'); } else { G.gain('purity', 1); good(); G.result('<p>You search for an hour without luck — but later you hear Biscuit was found. Your help didn\'t go unnoticed.</p>'); } }, { time: 60 });
  ch('Promise to keep an eye out', () => { G.att('kindness', 1); G.result('<p>The kid gives you a hopeful nod.</p>'); });
});
/* 4 */ def('rain_soaked', ['arrive'], 7, () => out() && ['rain', 'storm'].includes(wt()) && !G.rainProof(), (o) => {
  intro(o, 'Caught in the rain'); say(`<p>The ${wt() === 'storm' ? 'storm' : 'rain'} gets heavier. Without an umbrella you're soaked to the skin within seconds.</p>`);
  ch('Shelter in a doorway until it eases', () => { G.advance(25); G.mod('stress', 2); G.result('<p>You huddle in a shop doorway, dripping. Eventually it eases to a drizzle.</p>'); }, { time: 25 });
  ch('Dance in the rain', () => { G.mod('hygiene', -10); G.mod('mood', 10); G.xp('dancing', 10); G.mod('stress', -5); if (G.chance(0.15)) G.S.ill.cold = 2; G.result('<p>Forget it — you spin and splash through the puddles. A passing old man applauds.</p>'); });
  ch('Run for it', () => { G.mod('stamina', -6); G.gain('physique', 0.2); G.mod('hygiene', -6); G.result('<p>You sprint, shoes squelching. You arrive breathless and drenched.</p>'); });
});
/* 5 */ def('bully_encounter', A, () => 3 + (G.S.stats.physique < 30 ? 2 : 0), () => (inSchool() || at('park', 'docks')) && !G.flag('dexReformed') && h() > 7 && h() < 20, (o) => {
  intro(o, 'Bully!'); G.rel('dex').met = true;
  say(`<p>Dex Harlow plants himself in your path, cracking ${G.his('dex')} knuckles. "Lunch money, new kid. Or else."</p>`.replace('himself', G.npcPron('dex').self));
  const S = G.S;
  if (G.hasTf('demon')) ch('Let your horns catch the light and smile', () => { G.friend('dex', -1); G.mod('stress', -3); G.result('<p>Dex takes one look at your horns and the glint in your eye. "…Never mind." He backs away fast.</p>'.replace('He', G.He('dex'))); });
  ch('Hand over some money', () => { const m = Math.min(S.money, G.ri(3, 8)); G.earn(-m); G.mod('stress', 8); G.mod('mood', -6); G.att('confront', -3); G.result(`<p>You hand over ${G.money(m)}. Dex smirks and saunters off. You feel small.</p>`); });
  ch('Stand your ground (Willpower)', () => { G.att('confront', 3); if (S.stats.willpower + G.ri(0, 40) > 55) { G.gain('willpower', 1); G.friend('dex', 2); G.result('<p>You meet ' + G.his('dex') + ' eyes and say "No." Calm. Flat. Dex blinks, then laughs uncertainly and leaves. Your heart is racing, but you did it.</p>'); } else { G.mod('stress', 10); G.mod('health', -3); G.result('<p>Your voice shakes. Dex shoves you into the wall and takes your snack. Ow.</p>'); } });
  ch('Push back physically (Physique)', () => { G.att('confront', 4); G.att('rules', -2); if (S.stats.physique + G.ri(0, 40) > 60) { G.gain('physique', 0.5); G.friend('dex', 3); G.result('<p>You shove back hard enough that Dex stumbles. ' + G.He('dex') + ' stares at you with something like respect. "…Fine."</p>'); } else { G.mod('health', -6); G.mod('stress', 8); if (inSchool() && G.chance(0.5)) G.School.giveDetention('fighting'); G.result('<p>It doesn\'t go well. You end up on the ground with a bruised elbow.</p>'); } }, { cls: 'risky' });
  ch('Outsmart him (Awareness)', () => { if (S.stats.awareness + G.ri(0, 40) > 50) { G.gain('awareness', 0.5); G.result(`<p>"Is that ${G.nm('okoro')} behind you?" Dex spins round. You're gone before ${G.he('dex')} turn${G.s('dex')} back.</p>`); } else { G.mod('stress', 6); G.result('<p>"Nice try." Dex flicks your ear and leaves, laughing.</p>'); } });
  ch('Run!', () => { G.mod('stamina', -6); G.att('confront', -2); G.result('<p>You bolt. Dex can\'t be bothered to chase you.</p>'); });
}, 3);
/* 6 */ def('festival_flyer', A, 4, () => at('square', 'shopping', 'school_gate') && [1, 2, 3, 4, 5, 6, 7].some(i => G.specialDay(G.day() + i)), (o) => { intro(o, 'A colourful flyer'); let n = 1; while (!G.specialDay(G.day() + n)) n++; const sp = G.specialDay(G.day() + n); say(`<p>A flyer flutters into your hands: <b>${G.SPECIAL_NAMES[sp]}</b> — in ${n} day${n > 1 ? 's' : ''}! ${sp === 'winter_fair' ? 'Wetinburg Square, 16:00–22:00.' : sp === 'summer_fireworks' ? 'Gull Bay Beach, from 19:00.' : 'At Wetinburg High.'}</p>`); G.mod('mood', 3); ch('Pin it to your noticeboard', () => { G.log(`Upcoming: ${G.SPECIAL_NAMES[sp]} on ${G.shortDate(G.day() + n)}.`); back(); }); }, 5);
/* 7 */ def('stray_cat', A, 5, () => at('square', 'docks', 'street', 'park', 'school_courtyard') && wt() !== 'storm', (o) => {
  intro(o, 'A stray cat'); const silver = G.count('catFed') >= 2; say(`<p>A scruffy grey cat ${silver ? 'with startling silver eyes ' : ''}winds around your ankles, meowing hopefully.</p>`);
  const f = food(); if (f.length) ch(`Feed it some ${D.ITEMS[f[0]].name}`, () => { G.take(f[0]); G.cnt('catFed'); G.gain('purity', 0.5); good(); G.mod('mood', 5); G.result(`<p>The cat eats delicately, then headbutts your hand. ${G.count('catFed') >= 5 ? 'Its silver eyes hold yours for a long moment, unnervingly intelligent.' : 'It purrs like a little engine.'}</p>`); });
  ch('Give it a scratch behind the ears', () => { G.mod('stress', -4); G.mod('mood', 3); G.result('<p>The cat purrs and flops over for belly rubs. It\'s a trap. You fall for it.</p>'); });
  ch('Leave it be', back);
}, 1);
/* 8 */ def('cat_speaks', A, 30, () => G.count('catFed') >= 5 && G.isDark() && at('docks', 'square', 'street') && !G.hasTf('cat'), (o) => {
  intro(o, 'The silver-eyed cat'); say('<p>Under a flickering streetlamp sits the grey cat, eyes glowing silver. It speaks — clearly, calmly. <i>"You fed me when no one else did. I can give you a little of what I am: soft feet, sharp eyes, a nose for mischief. Will you have it?"</i></p>');
  ch('Accept the cat\'s gift', () => { G.give('cat_collar'); G.addTf('cat'); G.gain('awareness', 3); G.result('<p>A tingle runs from your scalp to the base of your spine. Furry ears twitch on your head; a tail curls behind you. The night suddenly seems so much brighter. The cat is gone.</p>'); });
  ch('Politely refuse', () => { G.result('<p>The cat blinks slowly. <i>"As you wish."</i> It pads away into the dark.</p>'); });
}, 3);
/* 9 */ def('pop_quiz', ['class'], 6, () => true, (o) => {
  intro(o, 'Pop quiz!'); const sub = o.subj || 'maths'; say(`<p>${G.nm(o.teacher || D.SUBJECTS[sub].teacher)} grins evilly. "Pens out. Pop quiz."</p>`);
  const sit = (bonus) => { const sc = G.grade(sub) / 12 + G.S.stats.awareness / 3 + bonus + G.ri(-10, 15); G.S.school.popQuizzes++; if (sc > 45) { G.gradeXP(sub, 10); G.mod('schoolRep', 2); G.result('<p>You ace it. Ten out of ten!</p>'); } else if (sc > 30) { G.gradeXP(sub, 3); G.result('<p>Six out of ten. Not bad, not great.</p>'); } else { G.gradeXP(sub, -5); G.mod('stress', 5); G.result('<p>Two out of ten. Yikes.</p>'); } };
  ch('Concentrate hard', () => { G.mod('stamina', -4); sit(8); });
  ch('Answer quickly and hope', () => sit(0));
  ch('Peek at your neighbour\'s answers', () => { G.att('honesty', -3); G.gain('purity', -1); if (G.chance(0.3)) { G.mod('schoolRep', -5); G.gradeXP(sub, -10); G.result('<p class="warn">"Eyes on your OWN paper!" Zero marks and a disappointed look.</p>'); } else sit(15); }, { cls: 'risky' });
});
/* 10 */ def('street_musician', A, 4, () => at('square', 'shopping') && h() > 9 && h() < 21 && wt() !== 'storm', (o) => {
  intro(o, 'Street musician'); say('<p>A busker with a battered accordion plays a jaunty sea shanty. A small crowd sways along.</p>');
  ch('Tip £1', () => { if (G.pay(1)) { G.att('kindness', 1); G.mod('mood', 4); G.gain('purity', 0.2); } G.result('<p>She winks and plays a flourish just for you.</p>'); }, { req: G.S.money >= 1 });
  ch('Sing along', () => { G.xp('music', 10); G.mod('mood', 6); G.result('<p>You sing along. People clap. Your cheeks are hot, but you\'re grinning.</p>'); });
  ch('Dance to the music', () => { G.xp('dancing', 12); G.mod('stress', -5); G.result('<p>You and an old couple dance a ridiculous jig together.</p>'); });
  ch('Walk on', back);
});
/* 11 */ def('elderly_help', A, 4, () => at('street', 'square', 'shopping') && h() > 8 && h() < 19, (o) => {
  intro(o, 'Heavy shopping'); say('<p>An elderly man is struggling with four heavy shopping bags and a walking stick.</p>');
  ch('Offer to carry them home for him', () => { G.advance(25, { walk: true }); G.gain('purity', 1.5); G.gain('physique', 0.2); G.mod('rep', 2); good(); const tip = G.chance(0.4); if (tip) G.earn(3); G.result(`<p>He chats the whole way about the old days in Wetinburg.${tip ? ' He presses £3 into your hand and won\'t take no for an answer.' : ''}</p>`); }, { time: 25 });
  ch('Hurry past', () => { G.att('kindness', -1); back(); });
});
/* 12 */ def('ice_cream_truck', A, 5, () => at('park', 'beach', 'square') && (G.seasonIdx() === 3 || wt() === 'heatwave') && !G.isDark(), (o) => {
  intro(o, 'Ice cream van!'); say('<p>The tinny chime of an ice-cream van! A queue forms instantly.</p>');
  ch('Buy a cone (£3)', () => { if (G.pay(3)) G.apply(D.ITEMS.ice_cream.eat); G.result('<p>Mint choc chip. Bliss.</p>'); }, { req: G.S.money >= 3 });
  const here = G.NPC.peersHere().filter(met); if (here.length) ch(`Treat ${G.nm(here[0])} too (£6)`, () => { if (G.pay(6)) { G.friend(here[0], 4); G.apply(D.ITEMS.ice_cream.eat); } G.result(`<p>You and ${G.nm(here[0])} sit on the kerb, racing the drips.</p>`); }, { req: G.S.money >= 6 });
  ch('Resist', () => { G.gain('willpower', 0.3); back(); });
});
/* 13 */ def('snowball_fight', A, 7, () => wt() === 'snow' && at('park', 'school_courtyard', 'school_gate', 'street'), (o) => {
  intro(o, 'Snowball fight!'); say('<p>A snowball explodes against your back. Laughter erupts — a full-blown snowball war has broken out!</p>');
  ch('Join the battle', () => { G.advance(20, { rate: 2 }); G.gain('physique', 0.4); G.mod('mood', 12); G.mod('stress', -8); G.mod('hygiene', -5); G.NPC.peersHere().forEach(id => G.friend(id, 2, true)); G.result('<p>You build a fort, lead a charge and get absolutely pelted. Best twenty minutes of the week.</p>'); }, { time: 20 });
  ch('Duck and escape', back);
});
/* 14 */ def('fog_figure', A, 6, () => wt() === 'fog' && at('forest', 'docks', 'river', 'lighthouse', 'park'), (o) => {
  intro(o, 'A shape in the fog'); say('<p>A tall figure stands in the mist, holding a lantern. When you blink, it\'s gone — but a faint light bobs away toward ' + (at('forest') ? 'the deep woods' : 'the sea') + '.</p>');
  ch('Follow the light (Awareness)', () => { G.advance(20); G.gain('awareness', 0.8); if (at('forest')) { G.flag('foxLegend', true); G.result('<p>The light leads you to a mossy stone fox. You feel watched — kindly. (You\'ve learned something about the shrine.)</p>'); } else { G.flag('lighthouseLegend', true); G.result('<p>The light leads you to the foot of the Old Lighthouse, then winks out. The door has an old brass lock with the initials "L.H."</p>'); } }, { time: 20 });
  ch('Nope. Walk the other way.', () => { G.mod('stress', 3); back(); });
}, 4);
/* 15 */ def('thunder_shelter', ['arrive'], 6, () => wt() === 'storm' && out(), (o) => {
  intro(o, 'Thunderstorm!'); const pool = G.NPC.peersAll().filter(met); const p = pool.length ? G.pick(pool) : null;
  say(`<p>CRACK! Thunder splits the sky. You dash under a shop awning${p ? ` — and collide with ${G.nm(p)}, who had the same idea` : ''}.</p>`);
  if (p) ch(`Wait it out with ${G.nm(p)}`, () => { G.advance(30); G.friend(p, 5); if (D.NPCS[p].romance && G.rel(p).fr > 30) G.romance(p, 2); G.mod('stress', -3); G.result(`<p>You watch the rain bounce off the pavement together. ${G.nm(p)} tells you the story of ${G.his(p)} most embarrassing moment. You laugh until the storm passes.</p>`); }, { time: 30 });
  ch('Wait alone', () => { G.advance(30); G.result('<p>You watch the lightning flicker over the rooftops until it passes.</p>'); }, { time: 30 });
});
/* 16 */ def('sale_flyer', A, 4, () => at('shopping', 'square') && !(G.S.discount && G.S.discount.day === G.day()), (o) => { intro(o, 'Flash sale!'); G.S.discount = { day: G.day(), pct: 0.25 }; say('<p>A shop assistant hands you a flyer: <b>25% off everything in Lantern Lane — today only!</b></p>'); ch('Nice!', back); }, 5);
/* 17 */ def('dropped_homework', ['arrive', 'idle'], 4, () => inSchool() && G.NPC.peersHere().filter(id => id !== 'dex').length > 0, (o) => {
  const p = G.pick(G.NPC.peersHere().filter(id => id !== 'dex')); intro(o, 'Scattered papers');
  say(`<p>${G.rel(p).met ? G.nm(p) : 'A classmate'} trips and a whole folder of homework flutters across the floor.</p>`);
  ch('Help gather them', () => { G.advance(5); G.rel(p).met = true; G.friend(p, 5); G.att('kindness', 1); G.result(`<p>You gather every sheet. ${G.nm(p)} beams. "You're a lifesaver!"</p>`); }, { time: 5 });
  ch('Keep walking', back);
});
/* 18 */ def('lunch_trade', A, 5, () => loc() === 'school_cafeteria' && G.NPC.peersHere().length > 0, (o) => {
  const p = G.pick(G.NPC.peersHere()); intro(o, 'Lunch swap'); G.rel(p).met = true;
  say(`<p>${G.nm(p)} eyes your tray. "Swap you my ${G.pick(['chocolate pudding', 'sushi roll', 'homemade cookies', 'apple'])} for your chips?"</p>`);
  ch('Deal!', () => { G.friend(p, 3); G.mod('hunger', -15); G.mod('mood', 4); G.result('<p>A fine trade. You both feel like winners.</p>'); });
  ch('Share yours for free', () => { G.friend(p, 4); G.att('kindness', 2); G.result(`<p>"Seriously? You're the best." ${G.nm(p)} shares ${G.his(p)} dessert anyway.</p>`); });
  ch('No thanks', back);
});
/* 19 */ def('sketchy_package', A, 3, () => at('docks', 'square') && (G.isDark() || G.chance(0.3)), (o) => {
  intro(o, 'An "easy job"'); say('<p>A man in a long coat sidles up. "You look like you could use twenty quid. Just carry this parcel to the warehouse by the lighthouse. No questions."</p>');
  ch('Decline firmly', () => { G.gain('willpower', 0.5); G.att('rules', 2); G.result('<p>"No thanks." You walk away without looking back. Smart.</p>'); });
  ch('Report him to the police', () => { G.att('rules', 4); G.gain('purity', 1.5); G.friend('reyes', 4); G.trust('reyes', 6); G.mod('rep', 3); good(); G.result(`<p>You find ${G.nm('reyes')}. ${G.He('reyes')} nod${G.s('reyes')} grimly. "We've been after that one. Thank you."</p>`); });
  ch('Take the money and the parcel', () => { G.att('rules', -6); G.gain('purity', -4); if (G.chance(0.5)) { G.Crime.police('Halfway there, a police car pulls up. The parcel is full of stolen phones.'); return; } G.earn(20); G.mod('stress', 10); G.result('<p>You drop it at the warehouse. The £20 burns a hole in your pocket.</p>'); }, { cls: 'risky' });
}, 6);
/* 20 */ def('kite_stuck', A, 4, () => loc() === 'park' && ['sunny', 'cloudy'].includes(wt()) && !G.isDark(), (o) => {
  intro(o, 'Kite in a tree'); say('<p>A little girl wails: her red dragon kite is tangled high in an oak tree.</p>');
  ch('Climb up and get it (Physique)', () => { G.advance(15); if (G.S.stats.physique + G.ri(0, 40) > 45) { G.gain('physique', 0.4); G.gain('purity', 1); good(); G.result('<p>You shimmy up and free the kite. The girl hugs your legs. Her dad shakes your hand.</p>'); } else { G.mod('health', -4); G.result('<p>You slip and land in a bush. Her dad gets it down with a rake. At least you tried.</p>'); } }, { time: 15 });
  ch('Knock it loose with a long stick (Awareness)', () => { G.advance(10); if (G.S.stats.awareness + G.ri(0, 40) > 40) { G.gain('purity', 1); good(); G.result('<p>A well-aimed nudge and the kite floats down. Applause!</p>'); } else G.result('<p>The stick gets stuck too. Now there\'s a stick AND a kite up there.</p>'); }, { time: 10 });
  ch('Leave it to the adults', back);
});
/* 21 */ def('rainbow', ['arrive'], 6, () => out() && !G.isDark() && G.S.weather[G.day() - 1] && ['rain', 'storm'].includes(G.S.weather[G.day() - 1].type) && ['sunny', 'cloudy'].includes(wt()), (o) => { intro(o, 'Rainbow'); say('<p>A huge double rainbow arcs over Wetinburg, from the docks all the way to Whisperwood. People stop in the street to take photos.</p>'); G.mod('mood', 8); G.mod('stress', -4); ch('Make a wish', back); }, 4);
/* 22 */ def('heatstroke', ['arrive'], 7, () => wt() === 'heatwave' && out() && !G.isDark() && (G.S.cond.stamina < 50 || G.S.cond.hunger > 50), (o) => {
  intro(o, 'Too hot!'); say('<p>The heat hits you like a wall. Your head swims and black spots dance at the edge of your vision.</p>');
  ch('Rest in the shade', () => { G.advance(30); G.mod('stamina', 6); G.result('<p>You sit under a tree until the dizziness passes.</p>'); }, { time: 30 });
  ch('Buy a cold drink (£2)', () => { if (G.pay(2)) { G.mod('stamina', 10); G.mod('health', 2); } G.result('<p>The ice-cold drink is the best thing you\'ve ever tasted.</p>'); }, { req: G.S.money >= 2 });
  ch('Push through it', () => { G.mod('health', -8); G.mod('stamina', -8); G.result('<p>You push on, feeling terrible. Not your wisest moment.</p>'); });
});
/* 23 */ def('fisherman_lesson', A, 4, () => at('docks', 'river') && h() > 5 && h() < 19, (o) => {
  intro(o, 'An old angler'); say('<p>A weathered old angler waves you over. "Ever caught a fish, young\'un? Here, hold this."</p>');
  ch('Give it a go', () => { G.advance(40); G.gain('willpower', 0.4); G.mod('stress', -6); G.cnt('fishLesson'); if (G.chance(0.6)) G.give('fish'); if (G.count('fishLesson') >= 3 && !G.has('fishing_rod')) { G.give('fishing_rod'); G.result('<p>"You\'ve got the knack. Keep it," he says, handing you his spare rod.</p>'); return; } G.result('<p>He teaches you to cast and wait. Mostly wait.</p>'); }, { time: 40 });
  ch('Politely decline', back);
});
/* 24 */ def('lost_tourist', A, 4, () => at('square', 'shopping', 'school_gate', 'docks') && h() > 8 && h() < 20, (o) => {
  intro(o, 'Lost tourist'); const dest = G.pick(['the Old Lighthouse', 'Meadowlark Farm', 'Gull Bay Beach', 'the Mossy Shrine']);
  say(`<p>A tourist with an upside-down map asks how to get to ${dest}.</p>`);
  ch('Give clear directions (Awareness)', () => { if (G.S.stats.awareness + G.ri(0, 40) > 40) { G.mod('rep', 2); G.gain('awareness', 0.3); good(); G.result('<p>You give perfect directions. They thank you warmly.</p>'); } else G.result('<p>You confidently send them the wrong way. Oops.</p>'); });
  ch('Walk them partway there', () => { G.advance(20, { walk: true }); G.mod('rep', 3); G.gain('purity', 1); good(); G.result('<p>You chat as you walk. They\'re from far away and love the town.</p>'); }, { time: 20 });
});
/* 25 */ def('bike_crash', A, 3, () => at('street', 'park', 'square'), (o) => {
  intro(o, 'Crash!'); say('<p>A cyclist swerves to avoid a pigeon and goes flying over the handlebars. They\'re sitting up, clutching a bleeding knee.</p>');
  if (G.has('first_aid_kit')) ch('Use your first-aid kit', () => { G.take('first_aid_kit'); G.gain('purity', 2); G.mod('rep', 3); good(); G.result('<p>You clean and bandage the cut like a pro. "You\'re a star," they say.</p>'); });
  ch('Help them up and call for help', () => { G.advance(15); G.gain('purity', 1); good(); G.result('<p>You help them to a bench and wait until a friend arrives.</p>'); }, { time: 15 });
  ch('Pretend you didn\'t see', () => { G.att('kindness', -2); G.gain('purity', -0.5); back(); });
});
/* 26 */ def('blackout', ['arrive', 'idle', 'wake'], 8, () => loc() === 'home' && wt() === 'storm' && G.isDark(), (o) => {
  intro(o, 'Power cut'); say('<p>The lights flicker and die. The whole street is dark; rain hammers the window.</p>');
  ch('Read by candlelight', () => { G.advance(60); G.gain('awareness', 0.5); G.mod('stress', -6); G.result('<p>It\'s cosy, actually. The power comes back just as you finish a chapter.</p>'); }, { time: 60 });
  ch('Play music in the dark', () => { G.advance(45); G.xp('music', 12); G.mod('mood', 6); G.result('<p>You play by feel. It sounds better than usual.</p>'); }, { time: 45 });
  ch('Go to bed early', () => G.Actions.sleepMenu());
}, 3);
/* 27 */ def('library_whisper', ['library', 'idle'], 6, () => at('library', 'school_library'), (o) => {
  intro(o, 'A note in a book'); say('<p>A folded note slips from between the pages of an old book: <i>"The keeper\'s key rests where the tides are written down."</i></p>');
  ch('Search the shelves of tide tables', () => { G.advance(30); G.gain('awareness', 0.6); if (!G.has('old_key') && !G.flag('lighthouseOpen') && G.chance(0.5 + G.S.stats.awareness / 200)) { G.give('old_key'); G.flag('lighthouseLegend', true); G.log('You found the old brass key "L.H." hidden in the tide tables!'); G.result('<p>Behind a row of ancient tide almanacs: a small brass key engraved <b>"L.H."</b>.</p>'); } else { G.flag('lighthouseLegend', true); G.result('<p>Dust, damp and a very old sandwich. Nothing yet. Perhaps another day.</p>'); } }, { time: 30 });
  ch('Keep the note as a curiosity', () => { G.flag('lighthouseLegend', true); back(); });
}, 4);
/* 28 */ def('farm_escape', A, 6, () => loc() === 'farm' && !G.isDark(), (o) => {
  intro(o, 'Escape artist'); const a = G.pick(['Pepper the pony', 'Clover the goat', 'half the hens']); say(`<p>"THE GATE!" ${a} ${a.startsWith('half') ? 'have' : 'has'} escaped into the lane!</p>`);
  ch('Calmly coax them back (Tending)', () => { G.advance(20); if (G.skill('animalcare') / 6 + G.S.stats.willpower / 2 + G.ri(0, 40) > 40) { G.xp('animalcare', 15); G.friend('tom', 3); G.result('<p>Slow movements, soft voice, a handful of feed. They trot back in like nothing happened. Tom gives you a nod.</p>'); } else { G.mod('stamina', -6); G.result('<p>It takes forty minutes and three neighbours, but everyone ends up home.</p>'); } }, { time: 20 });
  ch('Chase after them!', () => { G.advance(25, { rate: 2 }); G.gain('physique', 0.5); G.mod('hygiene', -10); G.result('<p>You chase them through a muddy field. You catch them. You are now 40% mud.</p>'); }, { time: 25 });
});
/* 29 */ def('injured_bird', A, 4, () => at('park', 'forest', 'beach', 'river', 'school_courtyard'), (o) => {
  intro(o, 'An injured bird'); say('<p>A small bird flutters helplessly in the grass, one wing held at a wrong angle.</p>');
  ch('Carefully take it to the hospital\'s wildlife volunteer', () => { G.advance(40, { walk: true }); G.gain('purity', 2.5); G.att('kindness', 3); good(); G.result('<p>The volunteer splints its wing. "It\'ll fly again, thanks to you." You get a photo of it a week later, healed.</p>'); }, { time: 40 });
  ch('Make it a little nest and keep watch', () => { G.advance(30); G.gain('purity', 1); good(); G.result('<p>You line a box with leaves. By evening, it hops out and flutters into a bush. It might just make it.</p>'); }, { time: 30 });
  ch('Leave it to nature', back);
});
/* 30 */ def('graffiti_dare', A, 3, () => met('sasha') && at('school_rooftop', 'docks', 'square', 'arcade') && G.NPC.where('sasha') === loc(), (o) => {
  intro(o, 'A dare'); say('<p>Sasha tosses you a spray can. "Dare you to tag the wall. Something small. Unless you\'re chicken."</p>');
  ch('Do it', () => { G.att('rules', -5); G.gain('purity', -2); G.friend('sasha', 4); G.xp('art', 6); if (G.chance(0.25)) { G.Crime.police('A torch beam hits the wall. "Hands where I can see them!"'); return; } G.result('<p>You spray a little star. Sasha whoops. Your heart pounds all the way home.</p>'); }, { cls: 'risky' });
  ch('Refuse, but laugh it off', () => { G.att('rules', 2); G.gain('purity', 0.5); G.friend('sasha', 1); G.result('<p>"Chicken." But Sasha grins and pockets the can.</p>'); });
  ch('Suggest a legal mural instead', () => { G.friend('sasha', 3); G.trust('sasha', 3); G.result('<p>"…Huh. Fine. But I\'m designing it."</p>'); }, { req: G.S.att.confront >= 0, why: 'Too avoidant' });
}, 4);
/* 31 */ def('charity_drive', A, 4, () => at('square', 'shopping', 'school_gate'), (o) => {
  intro(o, 'Charity collection'); say('<p>Volunteers are collecting for St. Brigid\'s children\'s ward, rattling tins.</p>');
  ch('Donate £5', () => { if (G.pay(5)) { G.gain('purity', 2); G.att('kindness', 3); G.mod('rep', 2); good(); } G.result('<p>You get a sticker and a heartfelt thank-you.</p>'); }, { req: G.S.money >= 5 });
  ch('Donate £1', () => { if (G.pay(1)) { G.gain('purity', 0.6); G.att('kindness', 1); } G.result('<p>Every little helps.</p>'); }, { req: G.S.money >= 1 });
  ch('Volunteer to rattle a tin for an hour', () => { G.advance(60); G.gain('purity', 1.5); G.mod('rep', 3); good(); G.result('<p>You raise £43 for the ward. Your arm is tired, your heart is full.</p>'); }, { time: 60 });
  ch('Not today', back);
}, 4);
/* 32 */ def('busker_dance', A, 3, () => loc() === 'square' && h() > 11 && h() < 20 && !['storm', 'rain'].includes(wt()), (o) => {
  intro(o, 'Dance circle'); say('<p>A street dance crew has formed a circle by the fountain, beats booming. "Anyone brave enough?"</p>');
  ch('Jump in (Dancing)', () => { G.advance(15, { rate: 2 }); G.xp('dancing', 20); if (G.skill('dancing') >= 250 || G.chance(0.3)) { G.earn(G.ri(3, 10)); G.mod('rep', 3); G.mod('mood', 10); G.result('<p>You nail it. The crowd roars and coins rain into the hat — the crew shares them with you!</p>'); } else { G.mod('mood', 4); G.result('<p>You trip on your own feet, but commit to it so hard the crowd cheers anyway.</p>'); } }, { time: 15 });
  ch('Just watch', () => { G.mod('mood', 3); back(); });
});
/* 33 */ def('lost_child', A, 3, () => at('shopping', 'square', 'beach'), (o) => {
  intro(o, 'A lost child'); say('<p>A little boy stands alone, lip trembling. "I can\'t find my mummy."</p>');
  ch('Stay with him and look together', () => { G.advance(20); G.gain('purity', 2); G.mod('rep', 2); good(); G.result('<p>You hold his hand and ask around. His mum comes running, frantic, and hugs you both.</p>'); }, { time: 20 });
  ch('Take him to a shop assistant', () => { G.advance(5); G.gain('purity', 1); good(); G.result('<p>The assistant makes an announcement. Mum arrives in two minutes.</p>'); }, { time: 5 });
});
/* 34 */ def('rival_race', A, 4, () => met('mira') && G.NPC.where('mira') === loc() && at('park', 'school_gym', 'beach', 'school_courtyard'), (o) => {
  intro(o, 'Mira\'s challenge'); say('<p>Mira bounces on her toes. "Race you! To the big tree and back. Loser buys smoothies!"'.replace('her toes', G.his('mira') + ' toes') + '</p>');
  ch('You\'re on!', () => { G.advance(10, { rate: 3 }); G.xp('athletics', 15); G.gain('physique', 0.4); const win = G.skill('athletics') / 10 + G.S.stats.physique / 2 + G.ri(0, 30) > 65; G.friend('mira', win ? 5 : 3); if (!win) G.pay(Math.min(G.S.money, 3)); G.result(win ? '<p>You win by a nose! Mira demands a rematch immediately.</p>' : '<p>Mira laps you. Twice. You buy the smoothies.</p>'); }, { time: 10 });
  ch('Maybe later', back);
});
/* 35 */ def('bake_sale', A, 4, () => inSchool() && G.isSchoolDay() && G.School.periodNow() && G.School.periodNow().free, (o) => {
  intro(o, 'Bake sale'); say(`<p>The student council has set up a bake sale. Priya is selling cupcakes with alarming efficiency.</p>`);
  ch('Buy a cupcake (£2)', () => { if (G.pay(2)) { G.mod('hunger', -12); G.mod('mood', 6); G.friend('priya', 1, true); } G.result('<p>Lemon drizzle. Excellent.</p>'); }, { req: G.S.money >= 2 });
  if (G.has('home_meal')) ch('Donate a home-cooked dish', () => { G.take('home_meal'); G.xp('cooking', 10); G.mod('schoolRep', 3); G.friend('priya', 3); good(); G.result('<p>Your dish sells out first. Priya is impressed.</p>'); });
  ch('Walk on', back);
});
/* 36 */ def('starry_night', A, 5, () => G.isDark() && ['sunny', 'cloudy'].includes(wt()) && at('park', 'beach', 'river', 'farm', 'school_rooftop', 'lighthouse', 'shrine'), (o) => {
  intro(o, 'Stars'); say('<p>The clouds part and the sky is suddenly thick with stars. The Milky Way smears across the dark.</p>');
  ch('Lie back and stargaze', () => { G.advance(30); G.gain('awareness', 0.6); G.mod('stress', -10); G.mod('mood', 6); G.result('<p>You find the Plough, Orion, and one you decide to name after yourself.</p>'); }, { time: 30 });
  ch('Head on', back);
});
/* 37 */ def('meteor_shower', A, 2, () => G.isDark() && wt() === 'sunny' && at('beach', 'lighthouse', 'park', 'farm', 'shrine'), (o) => {
  intro(o, 'Shooting stars'); say('<p>A streak of light. Then another. Then dozens — a meteor shower is pouring over Wetinburg!</p>');
  ch('Make a wish', () => { G.advance(20); G.mod('mood', 15); G.mod('stress', -10); G.cnt('wishes'); G.result('<p>You close your eyes and wish with your whole heart. You won\'t tell anyone what for.</p>'); }, { time: 20 });
}, 7);
/* 38 */ def('ghost_story', A, 4, () => G.isDark() && at('forest', 'lighthouse', 'docks', 'shrine'), (o) => {
  intro(o, 'Something in the dark'); say('<p>A long, low moan drifts through the dark. Then footsteps. Then nothing.</p>');
  ch('Investigate (Willpower)', () => { G.advance(10); if (G.S.stats.willpower + G.ri(0, 40) > 45) { G.gain('willpower', 1); G.result('<p>You creep forward… it\'s an owl and a loose shutter. You laugh shakily. Brave!</p>'); } else { G.mod('stress', 10); G.result('<p>Something white flaps toward you and you SCREAM. It was a carrier bag. Your heart takes ages to slow.</p>'); } }, { time: 10 });
  ch('Leave. Now.', () => { G.mod('stress', 4); G.S.loc = at('shrine') ? 'forest' : at('lighthouse') ? 'docks' : G.S.loc; back(); });
});
/* 39 */ def('crow_gift', A, 3, () => out() && !G.isDark() && G.count('catFed') + G.count('goodDeed') > 3, (o) => { intro(o, 'A gift from a crow'); say('<p>A crow lands on a railing beside you, caws, and drops something shiny at your feet before flapping away.</p>'); G.give('crow_trinket'); ch('Thank the crow', back); }, 5);
/* 40 */ def('puddle_splash', ['arrive'], 5, () => ['rain', 'storm'].includes(wt()) && at('street', 'square', 'shopping', 'school_gate'), (o) => {
  intro(o, 'SPLASH'); say('<p>A van roars through a puddle and drenches you from head to toe.</p>'); G.mod('hygiene', -12); G.mod('mood', -5);
  ch('Shout after it', () => { G.att('confront', 2); G.mod('stress', -2); G.result('<p>"OI!" The van doesn\'t care, but you feel slightly better.</p>'); });
  ch('Laugh it off', () => { G.mod('mood', 4); G.gain('willpower', 0.3); G.result('<p>You can\'t get wetter. Might as well laugh.</p>'); });
});
/* 41 */ def('free_sample', A, 4, () => at('cafe', 'shopping') && G.Travel.isOpen(loc()), (o) => { intro(o, 'Free sample'); say(`<p>${at('cafe') ? 'Bea' : 'A shop assistant'} holds out a tray: "Free sample! Try our new ${G.pick(['cinnamon swirl', 'lemon shortbread', 'cheese scone', 'honey flapjack'])}."</p>`); ch('Yes please!', () => { G.mod('hunger', -6); G.mod('mood', 5); G.result('<p>Delicious. You may have to come back for a whole one.</p>'); }); }, 3);
/* 42 */ def('arcade_highscore', A, 5, () => loc() === 'arcade' && G.Travel.isOpen('arcade'), (o) => {
  intro(o, 'Challenger approaches'); say('<p>A kid with a backwards cap points at you. "You. Me. Neon Drift. Loser pays the winner five tokens."</p>');
  ch('Accept (Awareness)', () => { G.advance(15); const win = G.S.stats.awareness + G.ri(0, 50) > 50; if (win) { G.earn(5); G.mod('mood', 6); G.result('<p>You win by a hair. The kid demands a rematch next week.</p>'); } else { G.pay(Math.min(5, G.S.money)); G.result('<p>Absolutely destroyed. The kid does a victory dance.</p>'); } }, { time: 15 });
  ch('Decline', back);
});
/* 43 */ def('seagull_theft', A, 6, () => at('beach', 'docks') && food().length > 0 && !G.isDark(), (o) => { intro(o, 'Seagull attack!'); const f = food()[0]; G.take(f); say(`<p>A massive seagull swoops out of nowhere and snatches your ${D.ITEMS[f].name} right out of your bag! It cackles from a lamppost.</p>`); G.mod('mood', -3); ch('Shake your fist at the sky', back); }, 3);
/* 44 */ def('fox_sighting', ['arrive', 'idle', 'forest'], 6, () => at('forest') && ((h() >= 5 && h() < 8) || (h() >= 17 && h() < 20)), (o) => {
  intro(o, 'A fox'); say('<p>A russet fox pauses on the path ahead, looks back at you, then trots off between the trees — almost as if it wants you to follow.</p>');
  ch('Follow the fox', () => { G.flag('foxLegend', true); G.Travel.go('shrine'); }, { time: G.Travel.walkTime('forest', 'shrine') });
  ch('Watch it go', () => { G.mod('mood', 4); back(); });
});
/* 45 */ def('change_mistake', A, 3, () => at('shopping', 'cafe', 'square'), (o) => {
  intro(o, 'Too much change'); say('<p>The cashier, flustered by a long queue, hands you a £10 note too many in change.</p>');
  ch('Point out the mistake', () => { G.gain('purity', 2); G.att('honesty', 5); G.mod('rep', 2); G.result('<p>"Oh my goodness, thank you! You\'ve no idea how much trouble I\'d have been in."</p>'); });
  ch('Keep quiet and pocket it', () => { G.earn(10); G.gain('purity', -2); G.att('honesty', -5); G.result('<p>You walk out £10 richer and a little heavier inside.</p>'); }, { cls: 'risky' });
}, 4);
/* 46 */ def('cheat_offer', ['arrive', 'idle'], 8, () => inSchool() && G.seasonIdx() < 3 && G.seasonDay() >= 19 && G.seasonDay() <= 24 && !G.S.flags.cheatSheet, (o) => {
  intro(o, 'Exam answers'); say('<p>A Year 12 student pulls you aside. "Got the answers to this week\'s exams. A tenner. Want them?"</p>');
  ch('Refuse', () => { G.gain('purity', 1); G.att('honesty', 2); G.gain('willpower', 0.5); G.result('<p>"Your loss." Maybe — but it\'s your win too.</p>'); });
  ch('Report it to a teacher', () => { G.att('rules', 4); G.mod('schoolRep', 4); G.gain('purity', 1); G.result(`<p>${G.nm('hart')} thanks you quietly. The exams are rewritten overnight.</p>`); });
  ch('Buy them (£10)', () => { if (!G.pay(10)) return; G.S.flags.cheatSheet = true; G.att('honesty', -4); G.gain('purity', -2); G.result('<p>A folded sheet changes hands. You hide it in your sleeve.</p>'); }, { req: G.S.money >= 10, cls: 'risky' });
}, 10);
/* 47 */ def('newspaper_headline', ['wake'], 5, () => true, (o) => {
  intro(o, 'Morning news');
  const lines = ['WETINBURG GOAT RIDES BUS FOR THIRD TIME', 'CLOCK TOWER STILL WRONG, SAYS COUNCIL', 'LIGHTHOUSE "STRANGE LIGHTS" REPORTED BY FISHERMEN', `CAFÉ OWNER SEEN DANCING WITH MUSIC TEACHER`, 'GIANT PUMPKIN CONTEST: MEADOWLARK FARM FAVOURITE', 'FOX SPOTTED NEAR WHISPERWOOD SHRINE AT DAWN', 'POLICE APPEAL: PICKPOCKETS ACTIVE IN LANTERN LANE'];
  say(`<p>Aunt Nell left the paper on the table. Headline: <b>${G.pick(lines)}</b></p>`); G.gain('awareness', 0.2); ch('Turn the page', back);
}, 1);
/* 48 */ def('curfew_patrol', ['arrive', 'idle'], 12, () => (h() >= 23 || h() < 4.5) && out() && G.S.player.age < 18, (o) => {
  intro(o, 'Curfew'); G.rel('reyes').met = true; say(`<p>A torch beam finds you. ${G.nm('reyes')} steps out of a patrol car. "Bit late for you to be out, isn't it, ${G.pn()}?"</p>`);
  ch('Apologise and accept a lift home', () => { G.S.loc = 'home'; G.advance(15); G.mod('rep', -1); G.att('rules', 2); G.result(`<p>${G.nm('reyes')} drops you at your door. "Get some sleep."</p>`); });
  ch('Lie: "I\'m on my way home right now!"', () => { G.att('honesty', -2); if (G.chance(0.5)) G.result('<p>"Hmm. Straight there, then." You got away with it.</p>'); else { G.S.loc = 'home'; G.mod('rep', -3); G.friend('reyes', -2); G.result('<p>"Nice try. In the car."</p>'); } }, { req: G.S.att.honesty <= 20, why: 'Too honest to lie' });
}, 2);
/* 49 */ def('hospital_story', ['volunteer'], 5, () => true, (o) => {
  intro(o, 'A patient\'s tale'); say('<p>An old woman on the ward grips your hand. "When I was a girl, I saw a fox at the shrine that spoke. And my brother swore the old lighthouse keeper flew away on wings of light. You believe me, don\'t you?"</p>');
  ch('"I believe you."', () => { G.flag('foxLegend', true); G.flag('lighthouseLegend', true); G.gain('purity', 1); good(); G.result('<p>She smiles and falls asleep, peaceful. (Legends noted in your journal.)</p>'); });
});
/* 50 */ def('wild_berries', ['forest', 'idle'], 5, () => at('forest') && [0, 3].includes(G.seasonIdx()) && !G.isDark(), (o) => { intro(o, 'Berry bushes'); say('<p>You stumble on bushes heavy with ripe blackberries.</p>'); ch('Pick a handful', () => { G.give('wild_berries', G.ri(2, 4)); G.result('<p>Purple fingers, happy stomach.</p>'); }); }, 2);
/* 51 */ def('work_rush', ['work'], 10, () => true, (o) => {
  intro(o, 'Workplace drama'); const j = o.job;
  const t = { cafe: 'A customer snaps that their latte is "an insult to coffee" and demands a refund.', farm: 'Black clouds roll in fast — the hay needs covering NOW.', library: 'A toddler has escaped its parent and is pulling books off the shelves.', paper: 'A dog guards the last house on your route, growling.' }[j];
  say(`<p>${t}</p>`);
  ch('Stay calm and handle it (Willpower)', () => { if (G.S.stats.willpower + G.ri(0, 40) > 45) { G.earn(5); G.gain('willpower', 0.6); G.result('<p>You handle it perfectly. Your boss slips you a £5 bonus.</p>'); } else { G.mod('stress', 8); G.result('<p>It\'s a struggle, but you get through it. You need a sit-down.</p>'); } });
  ch('Ask for help', () => { G.mod('stress', 2); G.result('<p>Teamwork saves the day.</p>'); });
});
/* 52 */ def('class_partner', ['class'], 6, () => G.NPC.peersAll().length > 0, (o) => {
  intro(o, 'Group work'); const p = G.pick(G.NPC.peersAll()); G.rel(p).met = true; say(`<p>The teacher pairs you with ${G.nm(p)} for a project.</p>`);
  ch('Work well together', () => { G.friend(p, 4); G.gradeXP(o.subj || 'english', 4); G.result(`<p>You make a surprisingly good team. ${G.nm(p)} high-fives you.</p>`); });
  ch('Do all the work yourself', () => { G.gradeXP(o.subj || 'english', 8); G.friend(p, -1); G.mod('stress', 4); G.result('<p>A great result. Your partner looks slightly put out.</p>'); });
});
/* 53 */ def('compliment_outfit', ['arrive', 'idle'], () => G.effBeauty() > 50 ? 5 : 1, () => inSchool() || at('square', 'shopping', 'cafe'), (o) => { intro(o, 'Noticed'); const p = G.NPC.peersHere().filter(met)[0]; say(`<p>${p ? G.nm(p) : 'A passer-by'} stops you. "Hey — you look really nice today!"</p>`); G.mod('mood', 6); G.gain('beauty', 0.3); if (p) G.friend(p, 1); ch('Say thanks', back); }, 3);
/* 54 */ def('partner_text', ['wake', 'idle'], 8, () => !!G.partner(), (o) => { intro(o, 'A message'); const p = G.partner(); say(`<p>Your phone buzzes: a message from ${G.nm(p)}. "${G.pick(['Morning! Thinking about you :)', 'Saw a dog that looked like you. Cute. The dog AND you.', 'Want to hang out this weekend?', 'Good luck today!!'])}"</p>`); ch('Reply with something sweet', () => { G.romance(p, 2); G.rel(p).lastTalk = G.day(); G.mod('mood', 6); G.result('<p>You can\'t stop smiling.</p>'); }); }, 2);
/* 55 */ def('sick_day', ['wake'], 30, () => !!G.S.ill.cold && G.isSchoolDay(), (o) => {
  intro(o, 'Under the weather'); say('<p>Your nose is blocked, your head is pounding. You have a cold.</p>');
  ch('Stay home and rest (Aunt Nell calls the school)', () => { G.advance(240, { sleep: true }); G.S.ill.cold = Math.max(0, G.S.ill.cold - 1); G.flag('sickNote' + G.day(), true); G.S.school.attended[G.day()] = { reg: true, p1: true, p2: true, p3: true, p4: true, p5: true }; G.result('<p>You sleep most of the morning. Aunt Nell has phoned the school, so you\'re excused for today.</p>'); });
  ch('Drag yourself to school anyway', () => { G.gain('willpower', 0.8); G.mod('stamina', -10); back(); });
});
/* 56 */ def('shared_umbrella', ['arrive'], 6, () => ['rain', 'storm'].includes(wt()) && !G.rainProof() && (at('school_gate', 'square')) && G.NPC.peersAll().some(met), (o) => {
  const p = G.pick(G.NPC.peersAll().filter(met)); intro(o, 'Shared umbrella'); say(`<p>An umbrella appears over your head. It's ${G.nm(p)}. "You'll catch a cold. Get under here."</p>`);
  ch('Walk together under it', () => { G.friend(p, 4); if (D.NPCS[p].romance && G.rel(p).fr > 30) G.romance(p, 3); G.mod('mood', 5); G.result('<p>Squished together under one umbrella, you laugh at how wet your shoes still get.</p>'); });
});
/* 57 */ def('gossip_overheard', ['arrive', 'idle'], 3, () => inSchool() || at('cafe'), (o) => { intro(o, 'Overheard'); say(`<p>You overhear two students whispering: "${G.pick([`Apparently ${G.nm('fenwick')} plays piano at The Copper Kettle every Friday night!`, 'Someone saw lights in the old lighthouse!', 'There\'s a cat at the docks that STARES at you.', `${G.nm('vale')}'s jar moved by itself. I swear.`, 'Priya ran for council unopposed. Nobody dared.'])}"</p>`); G.gain('awareness', 0.2); ch('Interesting…', back); }, 2);
})(window.G);
