/* Wetinburg Days — NPCs: schedules, presence, dialogue, gifts, romance, dates */
(function (G) {
'use strict';
const D = G.DATA;
const say = (h) => G.say(h), ch = (l, f, o) => G.ch(l, f, o);
const back = () => G.goto(G.here);
const N = G.NPC = {};

/* ---------- schedules ---------- */
// rule: [days, from, to, loc, cond]. days: 'S' school day, 'W' weekend/holiday, 'A' any, or array of weekday numbers. loc 'CLASS' = current lesson room
const PEER_SCHOOL = (morning, brk, lunch, after) => [
  ['S', 7.6, 8.75, morning], ['S', 8.75, 9, 'school_classroom'], ['S', 9, 11, 'CLASS'], ['S', 11, 11.34, brk], ['S', 11.34, 12.34, 'CLASS'], ['S', 12.34, 13.34, lunch], ['S', 13.34, 15.34, 'CLASS'],
].concat(after || []);
const SCHED = {
  mira: PEER_SCHOOL('school_gym', 'school_courtyard', 'school_cafeteria', [[[1, 4], 15.5, 17, 'school_gym'], ['S', 15.5, 17, 'park'], ['A', 17, 19, 'park', 'dry'], ['A', 17, 19, 'school_gym', 'wet'], ['W', 8, 12, 'park', 'dry'], ['W', 8, 12, 'square', 'wet'], ['W', 13, 17, 'square']]),
  theo: PEER_SCHOOL('school_library', 'school_library', 'school_library', [[[0], 15.5, 17, 'school_library'], ['S', 15.5, 20, 'library'], ['W', 10, 14, 'library'], ['W', 14, 17, 'shopping']]),
  jun: PEER_SCHOOL('school_artroom', 'school_rooftop', 'school_rooftop', [[[2], 15.5, 17, 'school_artroom'], ['S', 15.5, 19, 'river', 'dry'], ['S', 15.5, 19, 'cafe', 'wet'], ['W', 10, 14, 'park', 'dry'], ['W', 10, 14, 'library', 'wet'], ['W', 14, 18, 'shopping']]),
  sasha: [['S', 8.9, 9, 'school_classroom'], ['S', 9, 11, 'CLASS'], ['S', 11, 11.34, 'school_rooftop'], ['S', 11.34, 12.34, 'school_rooftop', 'skip'], ['S', 11.34, 12.34, 'CLASS'], ['S', 12.34, 13.34, 'school_rooftop'], ['S', 13.34, 15.34, 'CLASS'], ['S', 15.5, 22, 'arcade'], ['W', 12, 22, 'arcade'], ['A', 22, 23.5, 'docks']],
  eli: PEER_SCHOOL('school_musicroom', 'school_musicroom', 'school_cafeteria', [[[0], 15.5, 17, 'school_musicroom'], [[4], 16, 21, 'cafe'], ['S', 16, 19, 'square', 'dry'], ['W', 9, 17, 'cafe'], ['W', 17, 20, 'square', 'dry']]),
  rosie: [['A', 5.5, 7.5, 'farm']].concat(PEER_SCHOOL('school_courtyard', 'school_courtyard', 'school_cafeteria', [[[3], 15.5, 17, 'school_courtyard'], ['S', 16, 20, 'farm'], [[5], 8, 12, 'square'], ['W', 7, 20, 'farm']])),
  kai: PEER_SCHOOL('school_pool', 'school_cafeteria', 'school_cafeteria', [[[2], 15.5, 17, 'school_pool'], ['S', 15.5, 19, 'beach', 'nice'], ['S', 15.5, 18, 'school_pool'], ['W', 8, 17, 'beach', 'nice'], ['W', 12, 18, 'arcade']]),
  priya: PEER_SCHOOL('school_office', 'school_office', 'school_cafeteria', [[[0], 15.5, 17, 'school_library'], [[4], 15.5, 17, 'school_gym'], ['S', 15.5, 17, 'school_office'], ['S', 17, 19, 'library'], ['W', 9, 12, 'library'], ['W', 13, 17, 'shopping']]),
  dex: PEER_SCHOOL('school_courtyard', 'school_courtyard', 'school_cafeteria', [[[1], 15.5, 17, 'school_gym'], ['S', 15.5, 17, 'school_classroom', 'detention'], ['S', 17, 20, 'docks'], ['W', 11, 15, 'park'], ['W', 15, 20, 'docks']]),
  hart: [['S', 7.75, 16.6, 'TEACH'], [[1, 3], 17, 18.5, 'library'], ['W', 10, 13, 'library'], ['W', 14, 16, 'cafe']],
  bose: [['S', 7.75, 16.6, 'TEACH'], [[5], 8, 11, 'cafe'], [[6], 9, 12, 'park']],
  vale: [['S', 7.75, 16.6, 'TEACH'], ['W', 9, 13, 'beach', 'nice'], ['W', 14, 17, 'library']],
  abernathy: [['S', 7.75, 16.6, 'TEACH'], ['W', 10, 16, 'library'], ['A', 17, 18, 'square', 'dry']],
  ricci: [['S', 7.75, 16.6, 'TEACH'], ['W', 10, 15, 'park', 'dry'], ['W', 10, 15, 'cafe', 'wet']],
  fenwick: [['S', 7.75, 16.6, 'TEACH'], [[4], 19, 21, 'cafe'], [[5], 10, 13, 'cafe'], [[6], 11, 15, 'park', 'dry']],
  okoro: [['A', 6, 7, 'park'], ['S', 7.75, 17, 'TEACH'], ['W', 9, 12, 'park']],
  tom: [['A', 5, 20, 'farm']],
  bea: [['A', 7, 21, 'cafe']],
  reyes: [['A', 8, 16, 'police'], ['A', 16, 22, 'square']],
  pell: [['A', 9, 20, 'library']],
};
const condOK = (c, id) => {
  if (!c) return true; const w = G.weather().type;
  if (c === 'dry') return !['rain', 'storm', 'snow'].includes(w);
  if (c === 'wet') return ['rain', 'storm', 'snow'].includes(w);
  if (c === 'nice') return ['sunny', 'cloudy', 'heatwave'].includes(w) && G.seasonIdx() !== 1;
  if (c === 'skip') return (G.day() + 3) % 4 === 0; // Sasha skips sometimes
  if (c === 'detention') return G.S.school.detention === G.day();
  return true;
};
const dayOK = (d) => d === 'A' || (d === 'S' ? G.isSchoolDay() : d === 'W' ? !G.isSchoolDay() : (Array.isArray(d) && G.isSchoolDay() ? d.includes(G.weekday()) : false));
N.where = function (id) {
  const h = G.hour(); const sp = G.specialDay();
  const n = D.NPCS[id];
  if ((sp === 'sports_day' || sp === 'school_festival') && (n.peer || ['hart', 'bose', 'vale', 'abernathy', 'ricci', 'fenwick', 'okoro'].includes(id)) && h >= 9 && h < 15.5) return sp === 'sports_day' ? 'school_courtyard' : (n.peer ? 'school_classroom' : 'school_gym');
  if (sp === 'winter_fair' && h >= 16 && h < 22 && (n.peer || ['bea', 'fenwick', 'reyes', 'abernathy'].includes(id))) return 'square';
  if (sp === 'summer_fireworks' && h >= 19 && h < 23 && (n.peer || ['bea', 'fenwick', 'vale', 'tom'].includes(id))) return 'beach';
  for (const r of SCHED[id] || []) {
    if (!dayOK(r[0])) continue;
    if (h < r[1] || h >= r[2]) continue;
    if (!condOK(r[4], id)) continue;
    let loc = r[3];
    if (loc === 'CLASS') { const p = G.School.periodNow(); if (!p) continue; loc = p.subj ? D.SUBJECTS[p.subj].room : 'school_classroom'; }
    if (loc === 'TEACH') { const p = G.School.periodNow(); if (id === 'hart' && h >= 15.5 && h < 16.6 && G.S.school.detention === G.day()) return 'school_classroom'; if (id === 'hart' && p && p.reg) return 'school_classroom'; if (p && p.subj && D.SUBJECTS[p.subj].teacher === id) return D.SUBJECTS[p.subj].room; return 'school_office'; }
    if (!G.Travel.isOpen(loc)) continue;
    return loc;
  }
  return null;
};
N.here = (loc) => Object.keys(D.NPCS).filter(id => N.where(id) === (loc || G.S.loc));
N.peersHere = () => N.here().filter(id => D.NPCS[id].peer);
N.peersAll = () => Object.keys(D.NPCS).filter(id => D.NPCS[id].peer);
N.usualSpots = function (id) {
  const s = SCHED[id] || []; const locs = {};
  s.forEach(r => { if (r[3] !== 'CLASS' && r[3] !== 'TEACH') locs[D.LOCATIONS[r[3]].name.replace('Wetinburg High — ', 'School ')] = 1; });
  if (s.some(r => r[3] === 'TEACH')) locs['Teaching at school / staff room (Main Office)'] = 1;
  return Object.keys(locs).slice(0, 5).join(', ');
};
N.chapterCount = (id) => (G.Story && G.Story.CHAPTERS[id] ? G.Story.CHAPTERS[id].length : 0);

/* ---------- generic crowd ---------- */
N.crowd = function () {
  const loc = G.S.loc; const L = D.LOCATIONS[loc]; const roles = D.GEN_ROLES[loc] || (L.area === 'school' ? ['student chatting with friends', 'prefect with a clipboard', 'Year 7 kid', 'sixth-former'] : null);
  if (!roles) return '';
  const h = G.hour(); if (h < 6 || h > 22) return '';
  const w = G.weather().type; let busy = (w === 'storm' ? 0 : w === 'rain' && L.outdoor ? 1 : 2) + (G.isWeekend() ? 1 : 0);
  if (busy <= 0) return '<p class="dim">The place is nearly deserted.</p>';
  const seed = (G.day() * 31 + Math.floor(h) * 7 + loc.length) % 997;
  const ppl = []; for (let i = 0; i < Math.min(3, busy, roles.length); i++) { const nm = D.GEN_FIRST[(seed + i * 13) % D.GEN_FIRST.length]; const rl = roles[(seed + i) % roles.length]; const tr = D.GEN_TRAITS[(seed + i * 3) % D.GEN_TRAITS.length]; ppl.push(`a ${tr} ${rl}${i === 0 ? ` (someone calls them "${nm}")` : ''}`); }
  return `<p class="dim">Around you: ${ppl.join(', ')}.</p>`;
};
N.chatGeneric = function () {
  const loc = G.S.loc; const roles = D.GEN_ROLES[loc] || ['passer-by'];
  const nm = G.pick(D.GEN_FIRST), rl = G.pick(roles);
  const lines = [`"Lovely ${G.wx().name.toLowerCase()} day, isn't it? Well — sort of."`, `"Have you tried the cakes at The Copper Kettle? Life-changing."`, `"They say there's a shrine deep in Whisperwood. My gran swore a fox spirit lived there."`, `"Watch your pockets around the docks, love."`, `"The old lighthouse? Haunted, they say. Or just draughty."`, `"Meadowlark Farm sells the best eggs. Tom's a grump, but a sweet one."`, `"I lost my cat once. Found her at the library, asleep on the radiator."`, `"Festival's coming up! Don't miss it."`, `"Kids these days, always on their phones. You seem alright, though."`];
  G.advance(10); G.mod('stress', -1); G.gain('awareness', 0.1, true);
  if (G.chance(0.15)) G.mod('rep', 1);
  G.result(`<p>You chat with ${nm}, a ${rl}. ${G.pick(lines)}</p>`);
};

/* ---------- dialogue content ---------- */
const GREET = {
  mira: ['"Heyyy! Race you to the end of the corridor? No? Coward."', '"Oh good, it\'s you! I have SO much to tell you."', '"Did you eat breakfast? You need fuel! Here, half my banana."'],
  theo: ['"Oh. Hi." {He} mark{s} {his} page carefully before looking up.', '"Hello. I was just— no, it\'s fine, sit down."', '"You again. That\'s… actually nice."'],
  jun: ['Jun pulls off one headphone and gives you a small nod.', '"…Hey." A faint smile.', 'Jun closes the sketchbook a little too quickly. "Oh — hi."'],
  sasha: ['"Sup." Sasha flips the skateboard up into one hand.', '"Look who it is. Bored yet?"', '"If you\'re here to tell me to go to class, don\'t."'],
  eli: ['"Hey hey! I\'ve got a melody stuck in my head and it\'s your fault somehow."', 'Eli taps a rhythm on the table. "What\'s the news?"', '"Ah, my favourite audience member."'],
  rosie: ['"Hiya! Clover ate my homework. Actually ate it. Again."', '"Oh, hello! You look like you need a hug or a scone. Or both."', '"Morning! Well, afternoon. I\'ve been up since five, it\'s all one big day to me."'],
  kai: ['"Yo." Kai shakes water out of {his} hair like a dog.', '"Hey. Waves are flat today. Tragic."', '"Oh hey, didn\'t see you there. Chillin\'?"'],
  priya: ['"Hello! Do you have five minutes? Actually, I have four. Go."', 'Priya looks up from a colour-coded planner. "Oh! Hi. Sorry, I was scheduling."', '"Hi there. Did you hear about the council meeting? No? Good, it was boring."'],
  dex: ['"What are you looking at?"', '"Ugh. You."', 'Dex grunts. "Whatever."'],
  hart: [`"Good to see you, ${'NAME'}. How are you finding things?"`, '"Ah, my favourite question-asker."', '"Everything alright? You can always talk to me."'],
  bose: ['"Punctual today, I hope?"', '"Hm. Yes? Questions are welcome. Excuses are not."', '"Good day."'],
  vale: ['"Ah! A fresh mind. Have you ever wondered why toast lands butter-side down?"', '"Careful — that jar is… resting."', '"Hello hello. Science waits for no one!"'],
  abernathy: ['"Did you know this very spot was once a fish market? 1792."', '"Hello, dear. Sit down, sit down."', '"Ah! The new face. Wetinburg suits you."'],
  ricci: ['"Ciao! You look inspired today. Or tired. Both are good for art!"', '"Ah, my artist! Come, come."', '"Look at this light! Can you see it?"'],
  fenwick: ['"Hello there," {he} say{s} softly, still humming.', '"Ah, good afternoon. Do you play?"', '"Lovely to see you."'],
  okoro: ['"You! Drop and give me— no, I\'m kidding. Mostly."', '"Stand up straight. Good. How\'s training?"', '"Effort! That\'s what I like to see."'],
  tom: ['Tom grunts and nods.', '"Mm. Boots on, then."', '"Animals need feeding. Talking can wait. …What is it?"'],
  bea: ['"Hello, sweetheart! The usual? Oh, you don\'t have a usual yet. We\'ll fix that."', '"Come in, come in, it\'s miserable out — well, it might be."', '"There\'s my favourite customer!"'],
  reyes: ['"Afternoon. Staying out of trouble?"', '"Hey. Everything okay?"', '"Need something?"'],
  pell: ['"Shh." A pause. "…Hello."', 'A nod over half-moon spectacles.', '"Quietly, please. What can I find for you?"'],
};
const TOPIC_NAMES = { sports: 'sports', food: 'food', gossip: 'school gossip', books: 'books', science: 'science', history: 'local history', art: 'art', music: 'music', nature: 'nature', games: 'video games', animals: 'animals', school: 'school' };
const TOPIC_LINES = {
  sports: ['talks about the upcoming match with real passion', 'describes a perfect sprint start in exhausting detail'],
  food: ['rhapsodises about the best sandwiches in Wetinburg', 'admits to a secret love of pickled onions'],
  gossip: ['whispers that someone saw {nm:fenwick} and Bea Calloway holding hands by the fountain', 'tells you the canteen\'s mystery stew is just Monday\'s leftovers'],
  books: ['recommends a mystery novel set in a lighthouse', 'argues that the book is always better than the film'],
  science: ['explains why the sky goes orange at sunset', 'talks about the strange jar on {nm:vale}\'s desk'],
  history: ['tells you about the shipwreck of 1887 and the old lighthouse', 'mentions a legend about a fox spirit in Whisperwood'],
  art: ['talks about how light changes colours in the rain', 'shows you a doodle on the back of a receipt'],
  music: ['hums the tune {he} can\'t get out of {his} head', 'debates the best album of all time with you'],
  nature: ['describes the herons by the River Wetin at dawn', 'points out which clouds mean rain'],
  games: ['brags about a new high score at Pixel Palace', 'explains a ridiculously complicated game strategy'],
  animals: ['tells a story about a goat who escaped onto the bus', 'shows you a photo of a very fat cat'],
  school: ['worries about exams', 'complains about the homework load'],
};
const UNIQUE = {
  mira: { sports: '"Coach says if I shave a tenth off my 200m I could go to regionals. A TENTH. Do you know how small that is?"', food: '"Okay but have you had the chips at the docks? With vinegar? Life-changing."', gossip: '"Dex got detention AGAIN. I think he likes it there."' },
  theo: { books: '"I\'ve read this one four times. It gets sadder every time, which shouldn\'t be possible."', science: '"Did you know octopuses have three hearts? I think about that a lot."', history: '"Mrs. Abernathy says there\'s a sealed room in the lighthouse. I want to see it."' },
  jun: { art: '"I don\'t really show people my sketches. They\'re… private. Maybe someday."', music: '"I draw to music. Different songs, different lines."', nature: '"The river at dusk turns this colour nobody has a name for."' },
  sasha: { games: '"I\'m three hundred points off the top score on Neon Drift. Some kid called \'XXX\' has it. I\'m going to destroy them."', music: '"Real music is loud and played in garages. Fight me."', gossip: '"Everyone thinks I don\'t care. It\'s easier that way."' },
  eli: { music: '"I wrote a song about the rain. It\'s called \'Rain\'. I\'m working on the title."', food: '"Bea lets me take home the day-old croissants. Best perk of any job ever."', art: '"Songs are just paintings you can\'t see, right? …Was that deep or dumb?"' },
  rosie: { nature: '"The swallows come back in spring. {Kin:tom} marks it on the barn wall every year."', animals: '"Pepper the pony bites everyone except me. It\'s a sign of love. Probably."', food: '"Fresh eggs, toast and our honey. You haven\'t lived."' },
  kai: { sports: '"Swimming\'s just… quiet, you know? Underwater, nothing\'s loud."', nature: '"There\'s a sandbar off Gull Bay that only shows at low tide. Secret spot."', games: '"I\'m terrible at games. Sasha won\'t let me forget it."' },
  priya: { school: '"If I don\'t get an S in every subject my parents won\'t say anything. They\'ll just look at me. That\'s worse."', books: '"I read self-improvement books. …Okay, and fantasy romances. Don\'t tell anyone."', history: '"I\'m campaigning to restore the lighthouse as a museum. It\'s a disgrace."' },
  dex: { sports: '"Football\'s the only thing I\'m good at. Coach says so."', games: '"Pfft. Games are for nerds. …Which arcade machine though?"' },
};

N.interact = function (id) {
  const S = G.S, n = D.NPCS[id], r = G.rel(id); G._ctx = id;
  G.goto(() => {
    G.hr(`${G.fullName(id)} <span class="small dim">— ${n.role}</span>`);
    say(`<div class="npc-head">${G.npcAvatar(id, 54)}<div><span class="badge">${G.relLabel(id)}</span><div class="small dim">${G.ptext(id, n.desc)}</div></div></div>`);
    if (!r.met) { N.introduce(id); return; }
    // storyline
    const chapter = G.Story && G.Story.availableChapter(id);
    if (chapter) ch(`💬 ${G.He(id)} seem${G.s(id)} to have something on ${G.his(id)} mind…`, () => G.Story.playChapter(id), { cls: 'story' });
    const g = GREET[id] || ['"Hello."'];
    say(`<p>${G.pick(g).replace('NAME', G.pn())}</p>`);
    if (r.status === 'dating') say(`<p class="love">${G.He(id)} smile${G.s(id)} at you — the special smile ${G.he(id)} save${G.s(id)} for you.</p>`);
    N.options(id);
  });
};
N.introduce = function (id) {
  const n = D.NPCS[id], r = G.rel(id); r.met = true;
  const intro = {
    mira: '"New kid! I\'m Mira. I run. Like, a lot. You should join Athletics Club. Monday and Thursday. I\'m not asking."',
    theo: '"I\'m Theo." A long pause. "You can sit here. If you want. The library\'s not mine."',
    jun: 'The artist glances up. "Jun." That\'s it. But {he} shift{s} {his} bag so you can sit.',
    sasha: '"Sasha. Don\'t call me Sash. Don\'t touch my board. We\'ll get along fine."',
    eli: '"Eli! I play guitar, badly, and work at The Copper Kettle, well. Come by, I\'ll sneak you a biscuit."',
    rosie: '"Oh, you\'re new! I\'m Rosie — I live at Meadowlark Farm with {Kin:tom} Tom. You must come meet the goats!"',
    kai: '"Kai. Swim team. You surf? No? We can fix that."',
    priya: '"Priya Sharma, student council president. Welcome to Wetinburg High! Here\'s a leaflet. And another one."',
    dex: '"Out of my way, new kid." Dex shoulders past you. Charming.',
    hart: `"Welcome, ${G.pn()}. I'm ${G.nm('hart')}, your homeroom and English teacher. My door is always open."`,
    bose: `"${G.nm('bose')}. Maths. Arrive on time, do the homework, and we will get along."`,
    vale: `"${G.nm('vale')}! Science! Don't touch the jar."`,
    abernathy: `"I'm ${G.nm('abernathy')}, dear. History and Geography. Ask me anything about this town — anything at all."`,
    ricci: `"${G.nm('ricci')}! Art is for everyone. Even you. ESPECIALLY you."`,
    fenwick: `"I'm ${G.nm('fenwick')}. I teach music. Do you sing? Everyone sings, really."`,
    okoro: `"${G.nm('okoro')}. PE. I expect effort, nothing more, nothing less."`,
    tom: '"Tom Fairweather. This is my farm. You Rosie\'s friend? Mm. Don\'t leave the gates open."',
    bea: '"Welcome to The Copper Kettle! I\'m Bea. Sit anywhere — the window seat is the best when it rains."',
    reyes: `"${G.nm('reyes')}. I look after this town. Anything worries you, come find me."`,
    pell: `"${G.nm('pell')}, librarian. Books are borrowed for three weeks. Noise is borrowed never."`,
  }[id];
  G.friend(id, 3);
  G.log(`You met <b>${G.fullName(id)}</b> (${n.role}).`);
  say(`<p>${G.ptext(id, intro)}</p>`);
  N.options(id);
};
N.options = function (id) {
  const S = G.S, n = D.NPCS[id], r = G.rel(id); const t = G.today(); const key = 'talk_' + id;
  ch('Chat', () => N.chat(id), { time: 10 });
  if (G.NPC.giftables().length) ch('Give a gift', () => N.giftMenu(id), { req: r.lastGift !== G.day(), why: 'Already gave a gift today' });
  ch('Compliment ' + G.him(id), () => N.compliment(id), { time: 3, req: !t['comp_' + id], why: 'Once a day' });
  if (r.fr >= 12 && n.peer) ch('Hang out together', () => N.hangout(id), { time: 45, req: S.cond.stamina > 10, why: 'Too tired' });
  if (n.adult && ['hart', 'bose', 'vale', 'abernathy', 'ricci', 'fenwick', 'okoro'].includes(id)) {
    const subj = Object.keys(D.SUBJECTS).find(k => D.SUBJECTS[k].teacher === id && !D.SUBJECTS[k].gradeAs);
    ch(`Ask for help with ${D.SUBJECTS[subj].name}`, () => { G.advance(30); G.gradeXP(subj, 12 + r.fr / 10); G.friend(id, 1.5); G.mod('schoolRep', 1); G.cnt('study'); G.result(`<p>${G.nm(id)} walks you through the parts you were stuck on. ${G.He(id)} ${G.is(id)} a surprisingly good explainer one-on-one.</p>`); }, { time: 30, req: !t['help_' + id], why: 'Once a day' });
    t['help_' + id] && 0;
  }
  if (n.romance) {
    const p = G.partner();
    if (r.status !== 'dating' && r.fr >= 25) ch('Flirt a little', () => N.flirt(id), { time: 5, cls: 'love', req: !t['flirt_' + id], why: 'Once a day' });
    if (r.status !== 'dating') ch('Confess your feelings 💌', () => N.confess(id), { cls: 'love', req: !p && r.fr >= 35 && (r.lastConfess === undefined || G.day() - r.lastConfess >= 7), why: p ? `You're dating ${G.nm(p)}` : r.fr < 35 ? 'Get closer first (friendship 35+)' : 'Give it some time' });
    if (r.status === 'dating') {
      ch('Ask on a date', () => N.dateMenu(id), { cls: 'love' });
      ch('Hold hands', () => N.holdHands(id), { cls: 'love', time: 10, req: r.ro >= 45 && !t['hands_' + id], why: r.ro < 45 ? 'Romance 45+ needed' : 'Once a day' });
      ch('Break up', () => N.breakup(id), { cls: 'risky' });
    }
  }
  if (id === 'dex' && r.fr < 0) ch('Stand up to Dex', () => N.standUp(id), { req: S.att.confront >= 10 || S.stats.willpower >= 45, why: 'Requires an Assertive attitude or Willpower 45', cls: 'risky' });
  if (r.fr < -5) ch('Apologise for any trouble', () => { G.advance(5); G.friend(id, 4); G.att('kindness', 2); G.result(`<p>${G.nm(id)} looks at you for a long moment. "…Fine. Apology accepted."</p>`); }, { req: !t['apol_' + id], why: 'Once a day' });
  // role-specific
  if (id === 'bea' && !G.Jobs.hired('cafe')) ch('Ask Bea about a job', () => G.Jobs.apply('cafe'));
  if (id === 'pell' && !G.Jobs.hired('library')) ch('Ask about the library assistant job', () => G.Jobs.apply('library'));
  if (id === 'tom' && !G.Jobs.hired('farm')) ch('Ask Tom for farm work', () => G.Jobs.apply('farm'));
  if (id === 'tom' && !S.farm.access) ch('Ask about growing your own crops', () => { S.farm.access = true; G.advance(10); G.friend('tom', 2); G.log('Tom lets you use two farm plots.'); G.result('<p>Tom looks you up and down. "Two plots by the fence. You plant it, you water it, you harvest it. Weeds are your problem." That\'s a yes. You can now use the plots at Meadowlark Farm.</p>'); });
  if (id === 'reyes' && S.record.unpaid > 0) ch(`Pay fines (${G.money(S.record.unpaid)})`, () => G.Actions.payFines());
  ch('Leave', back);
};
N.giftables = () => Object.keys(G.S.inv).filter(i => D.ITEMS[i] && (D.ITEMS[i].cat === 'gift' || D.ITEMS[i].gift));
N.chat = function (id) {
  const S = G.S, n = D.NPCS[id], r = G.rel(id); const t = G.today(); const k = 'talk_' + id;
  G.advance(10);
  const firstToday = !t[k]; t[k] = (t[k] || 0) + 1;
  r.lastTalk = G.day(); r.talks++;
  const allTopics = Object.keys(TOPIC_NAMES);
  const opts = [...new Set([G.pick(n.topics), ...[0, 1, 2].map(() => G.pick(allTopics))])].slice(0, 3);
  G.goto(() => {
    G.hr(`Chatting with ${G.nm(id)}`);
    say(`<p>${G.pick(['You fall into easy conversation.', 'You lean in to talk.', 'There\'s a comfortable moment, then you start chatting.'])} What do you bring up?</p>`);
    opts.forEach(tp => ch(`Talk about ${TOPIC_NAMES[tp]}`, () => N.topic(id, tp, firstToday)));
    ch('Ask how they\'re really doing', () => N.topic(id, 'personal', firstToday));
  });
};
N.topic = function (id, tp, fresh) {
  const S = G.S, n = D.NPCS[id], r = G.rel(id);
  const liked = n.topics.includes(tp);
  let line;
  if (tp === 'personal') {
    line = r.tr >= 40 ? `${G.nm(id)} hesitates, then actually tells you — about stress, about home, about little worries. It means something that ${G.he(id)} trust${G.s(id)} you with it.` : r.fr >= 20 ? `"I'm alright," ${G.nm(id)} says, then adds, "Thanks for asking. Really."` : `"Fine?" ${G.nm(id)} looks a little surprised you asked.`;
  } else if (UNIQUE[id] && UNIQUE[id][tp]) line = `${G.nm(id)} brightens. ${UNIQUE[id][tp]}`;
  else line = `${G.nm(id)} ${G.pick(TOPIC_LINES[tp])}${liked ? ' — clearly a favourite subject.' : '.'}`;
  if (tp === 'gossip' && n.adult) line = `${G.nm(id)} raises an eyebrow. "I don't gossip about students." But ${G.he(id)} smile${G.s(id)}.`;
  G.goto(() => {
    say(`<p>${line}</p><p>How do you respond?</p>`);
    const end = (fr, tr, txt, att) => {
      let mult = fresh ? 1 : 0.35;
      G.friend(id, (fr + (liked ? 2 : 0)) * mult); G.trust(id, tr * mult);
      if (att) G.att(att[0], att[1]);
      G.mod('stress', -2, true); G.mod('mood', 2, true);
      G.result(`<p>${txt}</p>` + (!fresh ? '<p class="small dim">(You\'ve already talked a lot today; it matters a little less.)</p>' : ''));
    };
    const pers = n.personality;
    ch('Share your honest opinion', () => end(2.5, 3, ['shy', 'driven', 'fair', 'strict', 'kind', 'quiet'].includes(pers) ? `${G.nm(id)} nods slowly. "I like that you just say what you think."` : `${G.nm(id)} considers it. "Huh. Fair point."`, ['honesty', 2]));
    ch('Say what they want to hear', () => end(3.5, -1, `${G.nm(id)} looks pleased. You feel a tiny bit fake.`, ['honesty', -2]), { req: S.att.honesty <= 30, why: 'Too honest for flattery' });
    ch('Playfully tease', () => { const likes = ['energetic', 'rebel', 'laidback', 'cheerful', 'dreamy', 'tough', 'bully', 'warm'].includes(pers); end(likes ? 4 : -2, likes ? 1 : -2, likes ? `${G.nm(id)} laughs and shoves your shoulder. "Oh, you're on."` : `${G.nm(id)} goes a bit quiet. Teasing wasn't the right call.`, ['confront', 1]); }, { req: S.att.confront >= -10, why: 'You\'re too avoidant to tease' });
    ch('Just listen', () => end(2, 4, `You let ${G.nm(id)} talk. ${G.He(id)} seem${G.s(id)} lighter afterwards.`, ['kindness', 1.5]));
    if (S.att.confront >= 30) ch('Push back and debate', () => end(['driven', 'rebel', 'strict', 'eccentric'].includes(pers) ? 4 : -1, 1, ['driven', 'rebel', 'strict', 'eccentric'].includes(pers) ? `A spirited argument! ${G.nm(id)} grins. "You're the first person to actually argue with me properly."` : `${G.nm(id)} frowns. "Okay, okay, no need to get intense."`, ['confront', 2]));
  });
};
N.compliment = function (id) {
  const S = G.S, n = D.NPCS[id]; G.today()['comp_' + id] = 1; G.advance(3);
  const lines = n.adult ? [`You tell ${G.nm(id)} that ${G.his(id)} ${n.title || n.fixedTitle ? 'lessons are' : 'work is'} really helpful.`] : [`You tell ${G.nm(id)} ${G.his(id)} laugh is contagious.`, `You say ${G.nm(id)} is really talented.`, `You tell ${G.nm(id)} you're glad you met ${G.him(id)}.`];
  G.friend(id, 2.5); G.att('kindness', 1);
  if (n.romance && G.rel(id).fr > 30) G.romance(id, 1.5);
  G.result(`<p>${G.pick(lines)} ${G.He(id)} ${n.personality === 'shy' || n.personality === 'quiet' ? 'turn' + G.s(id) + ' pink and mumble' + G.s(id) + ' thanks' : 'beam' + G.s(id)}.</p>`);
};
N.giftMenu = function (id) {
  const S = G.S;
  G.goto(() => {
    G.hr(`Give ${G.nm(id)} a gift`);
    N.giftables().forEach(it => ch(`${D.ITEMS[it].name} (×${S.inv[it]})`, () => N.give(id, it)));
    ch('Never mind', () => N.interact(id));
  });
};
N.give = function (id, it) {
  const S = G.S, n = D.NPCS[id], r = G.rel(id);
  G.take(it); r.lastGift = G.day(); G.advance(5); G.cnt('gifts');
  r.known = r.known || []; r.dislikedKnown = r.dislikedKnown || [];
  let txt, fr, ro = 0;
  if (n.loves && n.loves.includes(it)) { fr = 12; ro = 6; txt = `${G.nm(id)}'s eyes go wide. "No WAY. How did you know?!" ${G.He(id)} ${G.is(id)} genuinely moved.`; if (!r.known.includes(it)) r.known.push(it); }
  else if (n.likes.includes(it)) { fr = 6; ro = 3; txt = `${G.nm(id)} smiles warmly. "Oh, I love these! Thank you!"`; if (!r.known.includes(it)) r.known.push(it); }
  else if (n.dislikes.includes(it)) { fr = -4; txt = `${G.nm(id)} takes it politely, but ${G.his(id)} smile doesn't reach ${G.his(id)} eyes. Not ${G.his(id)} thing.`; if (!r.dislikedKnown.includes(it)) r.dislikedKnown.push(it); }
  else { fr = 2.5; ro = 1; txt = `"Oh — thanks!" ${G.nm(id)} seems pleasantly surprised.`; }
  if (n.adult) { fr *= 0.6; ro = 0; txt += ' ' + (n.title || n.fixedTitle ? `"You didn't have to do that," ${G.he(id)} say${G.s(id)}.` : ''); }
  G.friend(id, fr); G.att('kindness', 1.5); G.gain('purity', 0.2, true);
  if (n.romance && r.fr > 25 && ro) G.romance(id, ro);
  G.result(`<p>You give ${G.nm(id)} the ${D.ITEMS[it].name}. ${txt}</p>`, () => N.interact(id));
};
N.hangout = function (id) {
  const S = G.S, loc = S.loc; const L = D.LOCATIONS[loc];
  G.advance(45); G.mod('stamina', -3);
  const acts = {
    park: `You and ${G.nm(id)} wander the paths of Riverside Park, feeding the ducks and talking about nothing.`,
    cafe: `You share a pot of tea at the window seat with ${G.nm(id)} and watch the street go by.`,
    arcade: `You and ${G.nm(id)} burn through a pocketful of tokens. ${G.He(id)} absolutely destroy${G.s(id)} you at air hockey.`,
    library: `You study side by side with ${G.nm(id)}, occasionally passing silly notes.`,
    beach: `You walk along Gull Bay with ${G.nm(id)}, skimming stones and dodging gulls.`,
    square: `You sit on the rim of the fountain with ${G.nm(id)}, people-watching and inventing stories about strangers.`,
    farm: `You help ${G.nm(id)} with the chores; it's more fun with company.`,
    docks: `You sit on the harbour wall with ${G.nm(id)}, legs dangling, watching the fishing boats come in.`,
    river: `You sit on the riverbank with ${G.nm(id)}, tossing pebbles into the current.`,
    shopping: `You browse Lantern Lane with ${G.nm(id)}, trying on silly hats.`,
  }[loc] || `You spend some time with ${G.nm(id)}, chatting and laughing.`;
  G.friend(id, 4.5); G.trust(id, 2); G.mod('stress', -6); G.mod('mood', 6);
  G.rel(id).lastTalk = G.day();
  if (loc === 'library' || L.area === 'school') { G.gain('awareness', 0.2, true); }
  if (D.NPCS[id].romance && G.rel(id).fr > 40) G.romance(id, 1);
  G.result(`<p>${acts}</p>`);
};
N.jealousyCheck = function (target) {
  const p = G.partner(); if (!p || p === target) return '';
  const pr = G.rel(p);
  const seen = N.where(p) === G.S.loc || G.chance(0.25);
  if (!seen) return '';
  pr.ro -= 8; pr.jealous += 3; G.trust(p, -6);
  if (pr.jealous >= 6) { pr.status = 'ex'; pr.fr -= 15; pr.jealous = 0; G.log(`${G.nm(p)} broke up with you after seeing you flirt with ${G.nm(target)}.`); return `<p class="warn">${G.nm(p)} saw that. ${G.His(p)} face falls. Later you get a message: "I can't do this. We're done." You and ${G.nm(p)} are no longer dating.</p>`; }
  return `<p class="warn">You catch ${G.nm(p)} watching from across the way. ${G.He(p)} look${G.s(p)} hurt and turn${G.s(p)} away. You'll need to make that up to ${G.him(p)}.</p>`;
};
N.flirt = function (id) {
  const S = G.S, r = G.rel(id); G.today()['flirt_' + id] = 1; G.advance(5);
  const p = 0.35 + r.fr / 200 + G.effBeauty() / 300 + r.ro / 300;
  const lines = [`You tell ${G.nm(id)} that ${G.he(id)} look${G.s(id)} really nice today.`, `You hold ${G.nm(id)}'s gaze a moment longer than usual and smile.`, `You make a terrible pun just to make ${G.nm(id)} laugh.`];
  let txt = `<p>${G.pick(lines)}</p>`;
  if (G.chance(p)) { G.romance(id, 5); G.friend(id, 1); txt += `<p class="love">${G.nm(id)} goes slightly pink. "${G.pick(['Stop it,', 'You\'re ridiculous,', 'Oh — um,'])}" ${G.he(id)} say${G.s(id)}, but ${G.he(id)} ${G.is(id)} smiling.</p>`; }
  else { G.friend(id, -1); txt += `<p>${G.nm(id)} blinks. "…Okay?" It's a bit awkward. Maybe another time.</p>`; }
  txt += N.jealousyCheck(id);
  G.result(txt, () => N.interact(id));
};
N.confess = function (id) {
  const S = G.S, r = G.rel(id); r.lastConfess = G.day(); G.advance(10);
  G.goto(() => {
    G.hr('A confession');
    say(`<p>Your heart is hammering. "${G.nm(id)}, can I tell you something? I… really like you. Like, <i>like</i> like you."</p>`);
    if (r.ro >= 45 && r.fr >= 40) {
      r.status = 'dating'; r.lastDate = G.day(); G.romance(id, 8); G.friend(id, 5); G.mod('mood', 25); G.mod('stress', -10);
      G.log(`<b>You and ${G.nm(id)} are now dating!</b> 💕`);
      say(`<p class="love">${G.nm(id)} stares at you. Then ${G.he(id)} laugh${G.s(id)} — a nervous, happy laugh. "I've been wondering if you'd ever say it. Yes. I like you too." ${G.He(id)} shyly hold${G.s(id)} out ${G.his(id)} hand. You take it.</p><p>You're dating ${G.nm(id)}!</p>`);
    } else {
      G.romance(id, -4); G.mod('mood', -12); G.mod('stress', 6); G.gain('willpower', 1);
      say(`<p>${G.nm(id)} looks surprised, then gentle. "That's really brave of you. I… I don't feel that way right now. But I really like being your friend. Is that okay?"</p><p class="small dim">(Romance needs to be higher — try spending more time together, flirting and giving gifts.)</p>`);
    }
    ch('Continue', () => N.interact(id));
  });
};
N.holdHands = function (id) {
  G.today()['hands_' + id] = 1; G.advance(10); G.romance(id, 3); G.mod('mood', 8); G.mod('stress', -5);
  G.result(`<p class="love">You reach for ${G.nm(id)}'s hand. ${G.He(id)} lace${G.s(id)} ${G.his(id)} fingers through yours without a word, and for a while you just walk together like that.</p>`, () => N.interact(id));
};
N.breakup = function (id) {
  G.goto(() => {
    say(`<p>Are you sure you want to break up with ${G.nm(id)}?</p>`);
    ch('Yes, gently end it', () => { const r = G.rel(id); r.status = 'ex'; r.ro = Math.max(0, r.ro - 30); G.friend(id, -12); G.mod('stress', 8); G.mod('mood', -10); G.att('honesty', 2); G.log(`You broke up with ${G.nm(id)}.`); G.result(`<p>It's a hard conversation. ${G.nm(id)} nods, eyes shining. "I understand. I hope we can still be friends… someday."</p>`); });
    ch('No, never mind', () => N.interact(id));
  });
};
N.standUp = function (id) {
  const S = G.S; G.advance(5);
  const p = 0.3 + S.stats.willpower / 150 + S.stats.physique / 300 + (G.hasTf('demon') ? 0.2 : 0);
  G.att('confront', 4);
  if (G.chance(p)) { G.friend('dex', 6); G.trust('dex', 5); G.gain('willpower', 1); G.mod('schoolRep', 2); G.result('<p>"Leave people alone, Dex." You say it steadily, without blinking. Dex opens his mouth… and closes it. "…Whatever." But he seems to look at you differently after that.</p>'); }
  else { G.mod('stress', 8); G.mod('mood', -6); G.friend('dex', -2); G.result('<p>Your voice wobbles. Dex just laughs and walks off. Your cheeks burn — but at least you tried.</p>'); }
};

/* ---------- dates ---------- */
N.dateMenu = function (id) {
  const S = G.S, w = G.weather().type, h = G.hour(); const dry = !['rain', 'storm', 'snow'].includes(w);
  G.goto(() => {
    G.hr(`A date with ${G.nm(id)}`);
    say(`<p>"A date? With me? …Yes, obviously yes." Where do you want to go?</p>`);
    ch('Coffee and cake at The Copper Kettle', () => N.date(id, 'cafe'), { cost: 8, time: 90, req: S.money >= 8 && h >= 7 && h < 20, why: S.money < 8 ? 'Need £8' : 'Café is closed' });
    ch('A film at the Lantern Picture House', () => N.date(id, 'cinema'), { cost: 16, time: 150, req: S.money >= 16 && h >= 13 && h < 21, why: S.money < 16 ? 'Need £16' : 'Not showing now' });
    ch('A walk in Riverside Park', () => N.date(id, 'park'), { time: 90, req: dry && h >= 7 && h < 21, why: dry ? 'Too late or early' : 'The weather is awful for a walk' });
    ch('Games at Pixel Palace Arcade', () => N.date(id, 'arcade'), { cost: 6, time: 90, req: S.money >= 6 && h >= 12 && h < 22, why: S.money < 6 ? 'Need £6' : 'Arcade closed' });
    ch('Sunset at Gull Bay Beach', () => N.date(id, 'beach'), { time: 90, req: dry && h >= 16 && h < 21, why: !dry ? 'Bad weather' : 'Best around 16:00–21:00' });
    ch('Stargazing on the hill', () => N.date(id, 'stars'), { time: 90, req: (w === 'sunny' || w === 'cloudy') && G.isDark() && h < 23.5 && h > 17, why: 'Needs a clear evening' });
    ch('Not right now', () => N.interact(id));
  });
};
N.date = function (id, where) {
  const S = G.S, r = G.rel(id);
  const cost = { cafe: 8, cinema: 16, arcade: 6 }[where] || 0;
  if (cost && !G.pay(cost)) return;
  const locMap = { cafe: 'cafe', cinema: 'shopping', park: 'park', arcade: 'arcade', beach: 'beach', stars: 'park' };
  const dest = locMap[where]; if (S.loc !== dest) { G.advance(G.Travel.walkTime(S.loc, dest)); S.loc = dest; }
  const scenes = {
    cafe: [`You and ${G.nm(id)} squeeze into the window seat. Bea winks at you and brings two slices of cake "on the house — well, half on the house".`, 'Rain or shine, the café glows warm and gold.'],
    cinema: [`The lights go down. ${G.nm(id)} shares ${G.his(id)} popcorn without being asked.`, 'The film is good, but you keep sneaking looks sideways.'],
    park: [`You walk under the trees with ${G.nm(id)}. Ducks squabble. Somewhere, a busker plays.`, 'Petals, leaves or frost — whatever the season, the park is lovely.'],
    arcade: [`Neon lights and bleeps. ${G.nm(id)} wins you a lopsided plush from the claw machine.`, 'You laugh until your sides ache at the dance machine.'],
    beach: [`The sun sinks into Gull Bay, painting everything orange and pink. ${G.nm(id)} draws a heart in the sand, then pretends ${G.he(id)} didn't.`, 'The waves hush in and out.'],
    stars: [`You lie on the grassy hill above the park with ${G.nm(id)}, naming constellations — mostly wrongly.`, 'The town lights twinkle below.'],
  }[where];
  G.advance(where === 'cinema' ? 150 : 90);
  r.lastDate = G.day(); r.lastTalk = G.day(); G.cnt('dates');
  G.goto(() => {
    G.hr(`Date: ${{ cafe: 'The Copper Kettle', cinema: 'Lantern Picture House', park: 'Riverside Park', arcade: 'Pixel Palace', beach: 'Gull Bay at sunset', stars: 'Stargazing' }[where]}`);
    say(`<p>${scenes[0]}</p><p>${scenes[1]}</p>`);
    const fin = (ro, txt) => { G.romance(id, ro); G.friend(id, 3); G.mod('mood', 15); G.mod('stress', -12); G.result(`<p class="love">${txt}</p>`, back); };
    ch('Ask about their dreams for the future', () => fin(6, `${G.nm(id)} talks for ages, eyes bright. "Nobody ever asks me that." You learn so much about ${G.him(id)}.`));
    ch('Make them laugh', () => fin(5, `${G.nm(id)} laughs so hard ${G.he(id)} snort${G.s(id)}, then laughs harder because of the snort. Perfect.`));
    if (r.ro >= 45) ch('Reach for their hand', () => fin(8, `You take ${G.nm(id)}'s hand. ${G.He(id)} squeeze${G.s(id)} it gently. Neither of you lets go for the rest of the date.`));
    ch('Give them a small surprise gift', () => { const g = N.giftables(); if (!g.length) { fin(3, `You realise you forgot to bring anything. ${G.nm(id)} just laughs. "You're the gift, dummy."`); return; } const it = g[0]; G.take(it); fin(D.NPCS[id].likes.includes(it) || (D.NPCS[id].loves || []).includes(it) ? 10 : 5, `You hand over the ${D.ITEMS[it].name}. ${G.nm(id)} hugs it to ${G.his(id)} chest. "You're the sweetest."`); });
  });
};
})(window.G);
