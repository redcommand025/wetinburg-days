/* Wetinburg Days — storylines (NPC chapters), legends, transformation quests, festivals */
(function (G) {
'use strict';
const D = G.DATA;
const say = (h) => G.say(h), ch = (l, f, o) => G.ch(l, f, o);
const back = () => G.goto(G.here);
const St = G.Story = {};

// helper: build a chapter
const C = (min, title, text, choices) => ({ min, title, text, choices });
// choice: [label, fn(id) -> resultText, opts]
const fx = (o) => (id) => { if (o.fr) G.friend(id, o.fr); if (o.tr) G.trust(id, o.tr); if (o.ro) G.romance(id, o.ro); if (o.apply) G.apply(o.apply); if (o.att) G.att(o.att[0], o.att[1]); if (o.xp) G.xp(o.xp[0], o.xp[1]); if (o.give) G.give(o.give); if (o.time) G.advance(o.time); if (o.flag) G.flag(o.flag, true); if (o.f) o.f(id); return typeof o.t === 'function' ? o.t(id) : o.t; };

St.CHAPTERS = {
  mira: [
    C(15, 'Sore Ankle', (id) => `Mira is limping but trying to hide it. "It's nothing! Regionals are in three weeks, I can't stop now."`, [
      ['Tell {him} to rest — honestly', fx({ tr: 6, fr: 3, att: ['honesty', 2], t: '"…Ugh. You\'re right. Coach would kill me." {He} actually rest{s}. A week later, the ankle is fine.' })],
      ['Cheer {him} on to keep running', fx({ fr: 4, tr: -3, t: '"YES! That\'s what I needed!" {He} run{s} on it. {He} wince{s} for days afterwards.' })],
      ['Offer to train with {him} once it heals', fx({ fr: 5, xp: ['athletics', 20], t: '"Deal. And you\'re not allowed to go easy on me." You shake on it.' })],
    ]),
    C(35, 'Dawn Time Trial', (id) => `Mira asks you to time {his} 200m in the park at dawn. {He} miss{es} {his} target by half a second and sit{s} down hard on the grass, eyes wet. "What if I'm just… not good enough?"`, [
      ['Sit with {him} and listen', fx({ tr: 8, fr: 5, att: ['kindness', 2], time: 20, t: '{He} talk{s}. You listen. By the time the sun is fully up, {he} {is} laughing again.' })],
      ['Point out {his} start is slow — honestly', fx({ tr: 5, fr: 2, att: ['honesty', 2], t: '"…Wait. You\'re right. I\'m late off the line." {He} run{s} again — and hit{s} {his} target.' })],
      ['Make {him} laugh with a terrible impression of Coach', fx({ fr: 6, t: '"STAND UP STRAIGHT—" {He} cr{ies} laughing. Problem solved, temporarily.' })],
    ]),
    C(60, 'Regionals', (id) => `"It's TODAY. Will you come? Please? I run better when I know someone's there for me." The regional championships are a bus ride away.`, [
      ['Go and cheer your loudest', fx({ fr: 10, tr: 6, ro: 4, time: 180, apply: { mood: 15 }, give: 'friendship_bracelet', t: 'You scream yourself hoarse. Mira wins SILVER. Afterwards {he} tie{s} a bracelet around your wrist. "For my lucky charm."' })],
      ['Make her a good-luck banner first', fx({ fr: 12, tr: 6, ro: 5, time: 220, xp: ['art', 15], t: 'Your banner — "GO MIRA GO (FAST)" — gets on the local news. {He} win{s} silver and refuse{s} to stop hugging you.' })],
    ]),
  ],
  theo: [
    C(15, 'The Lost Bookmark', (id) => `Theo is frantically searching the library shelves. "My bookmark. It was my grandmother's — a pressed violet. I can't lose it."`, [
      ['Help search methodically', fx({ time: 30, f: (id) => { if (G.S.stats.awareness >= 35 || G.chance(0.5)) { G.friend(id, 8); G.trust(id, 6); G.flag('theoBookmark', true); } else G.friend(id, 4); }, t: (id) => G.flag('theoBookmark') ? 'You spot it tucked in the returns trolley. Theo holds it like it\'s made of glass. "Thank you. You don\'t know what this means."' : 'You search for half an hour. No luck — but Theo is touched you tried. (It turns up the next day.)' })],
      ['Comfort {him} first', fx({ tr: 6, fr: 4, att: ['kindness', 2], t: '"Sorry. It\'s silly." It isn\'t, you tell {him}. {He} breathe{s} again, and find{s} it ten minutes later in {his} own coat pocket.' })],
    ]),
    C(35, 'Dex and Theo', (id) => `You find Theo with {his} books scattered on the floor. Dex is walking away, laughing. Theo won't meet your eyes. "It's fine. It happens."`, [
      ['Confront Dex together', fx({ fr: 6, tr: 6, att: ['confront', 5], f: () => G.friend('dex', -3), t: 'You march after Dex. {He:dex} bluster{s:dex}, but back{s:dex} off when you both stand firm. Theo is shaking — and grinning.' })],
      [`Tell ${'TEACHER'} about it`, fx({ tr: 8, att: ['rules', 4], f: () => { G.friend('hart', 3); G.friend('dex', -4); }, t: (id) => `${G.nm('hart')} listens carefully and promises to handle it. Dex gets a week of detention. Theo whispers, "Thank you for not making it a big scene."` })],
      ['Help {him} pick up {his} books and walk with {him}', fx({ fr: 5, tr: 5, att: ['kindness', 2], t: 'You walk {him} to every class for a week. Dex finds someone else to bother.' })],
    ]),
    C(60, 'Theo\'s Story', (id) => `Theo hands you a notebook, cheeks red. "I wrote a story. You're… sort of in it. The hero. You can laugh."`, [
      ['Read it and give honest feedback', fx({ tr: 8, fr: 8, ro: 4, att: ['honesty', 2], time: 30, t: 'It\'s good. Really good. You tell {him} the ending is rushed; {he} nod{s} seriously and say{s}, "Nobody\'s ever taken it seriously before."' })],
      ['Tell {him} it\'s perfect', fx({ fr: 7, ro: 5, time: 30, t: '{He} glow{s}. The story is pinned on the English board a week later, with {nm:hart}\'s "Superb!" in green ink.' })],
    ]),
  ],
  jun: [
    C(15, 'The Sketchbook', (id) => `Jun's sketchbook slides off the bench and falls open at your feet. It's full of drawings — the town, the river, classmates… and one of you.`, [
      ['Close it without looking and hand it back', fx({ tr: 10, fr: 4, att: ['kindness', 2], t: 'Jun stares at you. "You didn\'t look?" A real smile. "…Thanks."' })],
      ['Say it\'s amazing', fx({ fr: 5, tr: 2, t: 'Jun goes scarlet and snatches it back — but later, {he} leave{s} a tiny doodle of a cat in your locker.' })],
    ]),
    C(35, 'Real Subjects', (id) => `Jun is quiet, even for Jun. "My parents want me to drop art. Focus on 'real subjects'. Maybe they're right."`, [
      ['Tell Jun art IS real', fx({ fr: 6, tr: 6, att: ['confront', 2], t: '"…Yeah. It is." Jun clenches a paintbrush like a sword. "I\'ll talk to them."' })],
      ['Suggest showing them the work', fx({ fr: 5, tr: 7, xp: ['art', 10], t: 'You help pick the best pieces. A week later Jun tells you, voice wobbling, that {his} mum cried and bought a frame.' })],
    ]),
    C(60, 'Portrait', (id) => `"Would you… sit for me? For a portrait. For the festival." Jun won't look at you.`, [
      ['Of course', fx({ fr: 10, ro: 6, tr: 5, time: 90, give: 'pressed_flower', t: 'You sit for an hour in the golden art room. The finished portrait is breathtaking. Jun hands you a pressed flower that was tucked behind it.' })],
      ['Only if Jun sits for one of yours too', fx({ fr: 12, ro: 5, time: 120, xp: ['art', 25], t: 'You paint each other, laughing at your clumsy brushwork. Jun keeps your terrible painting forever.' })],
    ]),
  ],
  sasha: [
    C(15, 'Lookout', (id) => `Sasha shakes a spray can. "Old warehouse wall. Nobody cares about it. Be my lookout?"`, [
      ['Refuse — it\'s vandalism', fx({ fr: -2, tr: 4, att: ['rules', 4], apply: { purity: 1 }, t: '"Ugh, fine, goody-two-shoes." But Sasha puts the can away. "…Maybe you\'re right."' })],
      ['Keep watch', fx({ fr: 7, att: ['rules', -5], apply: { purity: -2 }, t: 'Sasha paints a huge, beautiful phoenix. Nobody catches you. Your heart is pounding.' })],
      ['Suggest the legal wall by the skate park', fx({ fr: 6, tr: 6, att: ['kindness', 1], t: '"There\'s a LEGAL wall?" Sasha\'s phoenix ends up being featured in the local paper.' })],
    ]),
    C(35, 'Broken Board', (id) => `Sasha's skateboard is snapped in half. {He} {is} sitting on the kerb, staring at it. "Saved for a year for that."`, [
      ['Chip in £20 towards a new one', fx({ fr: 10, tr: 6, f: () => G.earn(-Math.min(20, G.S.money)), att: ['kindness', 4], t: '{He} stare{s} at the money. "…Nobody does stuff like this for me." {He} do{es}n\'t cry. Definitely not.' }), { req: () => G.S.money >= 20 }],
      ['Help {him} fix it with glue and screws', fx({ fr: 7, xp: ['housekeeping', 15], time: 60, t: 'It\'s ugly and wobbly and Sasha loves it more than the original.' })],
      ['Take {him} to the arcade to forget about it', fx({ fr: 5, apply: { stress: -5 }, time: 60, t: 'You lose spectacularly at every game. Sasha laughs for the first time all day.' })],
    ]),
    C(60, 'The Real Reason', (id) => `"You wanna know why I skip third period?" Sasha says quietly. "My little brother. Mum works mornings. Someone has to get him to nursery. Don't tell anyone."`, [
      ['Promise to keep it secret', fx({ tr: 12, fr: 6, t: '"…Thanks." {He} bump{s} your shoulder. That\'s Sasha for "I trust you with my life."' })],
      [`Gently suggest telling ${'HART'}`, fx({ tr: 6, fr: 4, att: ['honesty', 2], f: () => G.friend('hart', 2), t: (id) => `{He} hate{s} the idea. Then {he} do{es} it. ${G.nm('hart')} arranges a later start for {him}. Sasha actually starts coming to third period.` })],
    ]),
  ],
  eli: [
    C(15, 'New Song', (id) => `Eli corners you with a guitar. "Okay, I wrote a thing. Brutal honesty. Go."`, [
      ['Give honest, kind feedback', fx({ tr: 7, fr: 5, att: ['honesty', 2], t: '"The chorus drags? …It totally drags." Eli rewrites it on the spot. It\'s better.' })],
      ['Say it\'s the best thing you\'ve ever heard', fx({ fr: 6, t: 'Eli whoops so loudly Bea throws a tea towel at {him}.' })],
      ['Hum a harmony along with it', fx({ fr: 8, xp: ['music', 15], t: 'The harmony works. Eli stares. "Okay, you\'re in the band now. We don\'t have a band. We do now."' })],
    ]),
    C(35, 'Open Mic Nerves', (id) => `Eli is pale behind the café counter. "Open mic tonight. I signed up. Why did I sign up?"`, [
      ['Give a pep talk', fx({ fr: 6, tr: 5, t: 'You tell Eli the audience wants {him} to win. {He} play{s}. {His} hands shake for the first verse, then {he} {is} flying.' })],
      ['Offer to play with {him}', fx({ fr: 10, tr: 5, xp: ['music', 25], time: 60, t: 'You play together. You mess up once, Eli covers it, and the café erupts in applause.' }), { req: () => G.skill('music') >= 200 }],
    ]),
    C(60, 'A Song for a Friend', (id) => `On Friday night, Eli steps up after {nm:fenwick}'s set. "This one's for someone who's been there for me." {He} look{s} right at you.`, [
      ['Listen, heart full', fx({ fr: 10, ro: 8, tr: 5, apply: { mood: 15 }, time: 30, t: 'It\'s about rain, and cafés, and someone who listens. Bea is crying into a tea towel. So, possibly, are you.' })],
    ]),
  ],
  rosie: [
    C(15, 'Goat on the Loose', (id) => `"CLOVER! COME BACK!" A goat thunders past, with Rosie in hot pursuit. "Help me catch her!"`, [
      ['Sprint after the goat', fx({ time: 30, f: (id) => { G.gain('physique', 0.8); if (G.S.stats.physique > 35 || G.chance(0.5)) G.friend(id, 7); else G.friend(id, 4); G.xp('animalcare', 10); }, t: 'After an epic chase through the cabbage patch, you tackle Clover into a hay bale. Rosie laughs so hard {he} {has} to sit down.' })],
      ['Lure her with an apple', fx({ time: 15, f: (id) => { G.friend(id, 6); G.xp('animalcare', 15); }, t: 'Clover trots straight up and eats the apple. And your sleeve. Rosie applauds.' })],
    ]),
    C(35, 'Tom\'s Cold', (id) => `Rosie looks exhausted. "{Kin:tom} Tom's poorly and won't admit it. There's SO much to do."`, [
      ['Spend the afternoon helping with chores', fx({ fr: 10, tr: 8, time: 180, xp: ['tending', 30], f: () => { G.friend('tom', 6); G.gain('physique', 1); G.gain('purity', 1); G.cnt('goodDeed'); }, t: 'You feed, muck out and collect eggs until sunset. Tom, wrapped in a blanket, grunts "Good work, kid." from the porch. High praise.' })],
      ['Bring Tom soup and medicine', fx({ fr: 7, tr: 6, f: () => { G.friend('tom', 8); G.cnt('goodDeed'); }, t: 'Tom pretends to be annoyed and eats every drop.' })],
    ]),
    C(60, 'The Fair Ribbon', (id) => `Rosie bursts in with a blue rosette. "Our honey won first prize at the county fair! And {Kin:tom} says — since you've helped so much — you can have two more plots. Free. Forever."`, [
      ['Hug {him}', fx({ fr: 10, ro: 4, f: () => { G.S.farm.plotsOwned = Math.min(6, G.S.farm.plotsOwned + 2); G.S.farm.access = true; G.give('honey_jar'); }, t: '{He} squeeze{s} you breathless. You now have extra farm plots and a jar of prize-winning honey.' })],
    ]),
  ],
  kai: [
    C(15, 'Surf Lesson', (id) => `"So you can't surf. Today we fix that." Kai hands you a foam board.`, [
      ['Give it a go', fx({ time: 90, xp: ['swimming', 30], f: (id) => { G.friend(id, 7); G.gain('physique', 1); }, t: 'You fall off forty times. On the forty-first, you stand for three whole seconds. Kai cheers like you won the Olympics.' })],
      ['Watch from the shore with snacks', fx({ fr: 4, apply: { mood: 5 }, t: 'Kai surfs, you heckle. It\'s a great day.' })],
    ]),
    C(35, 'Storm Fear', (id) => `Thunder cracks overhead and Kai flinches hard. "Sorry. I got pulled out by a rip current when I was eight. In a storm. Stupid, right?"`, [
      ['Stay with {him} until it passes', fx({ tr: 12, fr: 6, time: 40, att: ['kindness', 2], t: 'You sit together, counting seconds between lightning and thunder. Eventually Kai is laughing at your counting.' })],
      ['Tell {him} it isn\'t stupid at all', fx({ tr: 8, fr: 5, att: ['honesty', 1], t: '"…Thanks." {He} breathe{s} out slowly. "Nobody knows that. Not even Sasha."' })],
    ]),
    C(60, 'The Sandbar', (id) => `"Low tide tonight. Wanna see my secret spot?" Kai leads you across wet sand to a sandbar glowing gold in the sunset.`, [
      ['Watch the sunset together', fx({ fr: 10, ro: 8, tr: 6, apply: { stress: -15, mood: 15 }, time: 60, give: 'seashell', t: 'You sit in silence as the sun drops into the sea. Kai presses a perfect shell into your hand. "So you remember this."' })],
    ]),
  ],
  priya: [
    C(15, 'The Lost Planner', (id) => `Priya is white as a sheet. "My planner. It has EVERYTHING in it. My whole life. Gone."`, [
      ['Retrace her steps', fx({ time: 25, f: (id) => { G.friend(id, 7); G.trust(id, 5); G.gain('awareness', 0.5); }, t: 'You find it in the canteen, under a tray of custard. {He} hug{s} it, then you. "I owe you. I\'m writing it down."' })],
      ['Help {him} calm down first', fx({ tr: 7, fr: 4, att: ['kindness', 1], t: 'Breathing exercises in the corridor. Then {he} remember{s} exactly where {he} left it.' })],
    ]),
    C(35, 'Burnout', (id) => `Priya has dark circles under her eyes. "I haven't had a day off in… I don't remember."`, [
      ['Convince {him} to skip study club for ice cream', fx({ fr: 8, tr: 5, att: ['rules', -2], apply: { stress: -6 }, time: 60, t: '{He} protest{s} for ten minutes, then has the best afternoon of her year. "We\'re doing this again. Scheduled. Wednesdays."' })],
      ['Help {him} plan proper breaks', fx({ fr: 5, tr: 7, t: 'You add "REST" in big letters to {his} planner. {He} look{s} at it like it\'s a foreign language, then smile{s}.' })],
    ]),
    C(60, 'Her Own Path', (id) => `"My parents want me to be a doctor. I want to study history. Restore old buildings. The lighthouse, maybe." {He} look{s} terrified to have said it.`, [
      ['Help {him} practise telling them', fx({ tr: 10, fr: 8, ro: 4, t: 'You role-play the conversation until {he} can say it without shaking. {He} tell{s} them. It\'s hard. But they listen.' })],
      ['Tell {him} {he}\'d be brilliant at it', fx({ fr: 8, ro: 5, t: '"You really think so?" You do. {He} write{s} it in {his} planner: GOAL — BE MYSELF.' })],
    ]),
  ],
  dex: [
    C(10, 'The Stray Dog', (id) => `Behind the docks you catch Dex feeding a skinny stray dog half {his} sandwich, murmuring to it. {He} jump{s}. "You didn't see this."`, [
      ['Promise not to tell', fx({ fr: 8, tr: 8, t: '"…Good." {He} hesitate{s}. "Her name\'s Rusty." It\'s the most {he} {has} ever said to you.' })],
      ['Offer to help find Rusty a home', fx({ fr: 6, tr: 6, att: ['kindness', 2], f: () => { G.friend('reyes', 2); G.cnt('goodDeed'); }, t: 'Officer Reyes knows a family looking for a dog. Dex visits Rusty every weekend.' })],
    ]),
    C(30, 'Trouble at Home', (id) => `Dex is slumped against the wall, maths homework crumpled in his fist. "Dad lost his job. I'm working nights at the docks. I'm failing everything. Happy?"`, [
      ['Offer to tutor {him}', fx({ fr: 10, tr: 8, time: 60, f: () => G.gradeXP('maths', 10), t: 'You go through equations together on the harbour wall. {He} {is} not stupid — just exhausted. {He} get{s} a C on the next test and won\'t stop showing people.' })],
      ['Tell {him} you\'re sorry and you\'re there for {him}', fx({ fr: 6, tr: 6, t: '"…Yeah. Whatever." But {he} do{es}n\'t walk away.' })],
    ]),
    C(55, 'Apology', (id) => `In the corridor, Dex walks right up to Theo. Everyone freezes. "Sorry. For… all of it." Then {he} look{s} at you. "Told you I'd do it."`, [
      ['Smile at {him}', fx({ fr: 10, tr: 8, f: () => { G.flag('dexReformed', true); G.friend('theo', 3); G.log('Dex has turned over a new leaf. No more bullying at Wetinburg High.'); }, t: 'Dex has changed. The bully encounters at school stop for good.' })],
    ]),
  ],
  hart: [
    C(20, 'Settling In', (id) => `${G.nm(id)} ask${G.s(id)} you to stay a moment after registration. "How are you really finding Wetinburg? New schools are hard."`, [
      ['Be honest about the hard parts', fx({ tr: 10, fr: 5, att: ['honesty', 2], apply: { stress: -8 }, t: (id) => `${G.He(id)} listen${G.s(id)} without interrupting, then give${G.s(id)} practical advice and a biscuit. You feel much better.` })],
      ['Say everything\'s great', fx({ fr: 3, t: (id) => `"Good," ${G.he(id)} say${G.s(id)}, not entirely convinced. "The door\'s always open."` })],
    ]),
    C(50, 'The Writing Competition', (id) => `${G.nm(id)} hand${G.s(id)} you a battered paperback. "I loved this at your age. And — there's a county writing competition. I think you should enter."`, [
      ['Enter the competition', fx({ time: 120, f: () => { G.gradeXP('english', 40); G.gain('awareness', 1); G.give('novel'); const won = G.chance(0.4 + G.S.stats.awareness / 200); if (won) { G.earn(30); G.mod('schoolRep', 8); G.log('You won a prize in the county writing competition!'); } G.flag('writingWon', won); }, t: () => G.flag('writingWon') ? 'Weeks later — you WON third place, and £30! It\'s read out in assembly.' : 'You don\'t place, but the judges\' notes are glowing. Your English improves hugely.' })],
      ['Thank {him} for the book', fx({ fr: 5, give: 'novel', t: 'You read it in one night. It\'s wonderful.' })],
    ]),
  ],
  bose: [
    C(20, 'The Puzzle', (id) => `${G.nm(id)} slide${G.s(id)} a puzzle box across the desk. "Open it without forcing it. Logic only."`, [
      ['Study it carefully', fx({ time: 20, f: (id) => { const ok = G.S.stats.awareness + G.ri(0, 30) > 45; G.flag('bosePuzzle', ok); if (ok) { G.gradeXP('maths', 25); G.friend(id, 6); } else G.friend(id, 3); }, t: (id) => G.flag('bosePuzzle') ? `Click. It opens. ${G.nm(id)} laugh${G.s(id)} — a surprisingly warm laugh. "Excellent."` : `You can\'t crack it. "Take it home," ${G.he(id)} says. "Some problems need sleep."` })],
    ]),
    C(50, 'Confession of a Maths Teacher', (id) => `"I failed maths twice at your age," ${G.nm(id)} say${G.s(id)} out of nowhere. "Do you know what changed? Someone believed I could do it."`, [
      ['Ask what it was like', fx({ tr: 8, fr: 6, f: () => G.gradeXP('maths', 20), t: (id) => `${G.He(id)} tell${G.s(id)} you about late nights, a patient teacher, and the joy of finally understanding. You'll never see ${G.him(id)} the same way.` })],
    ]),
  ],
  vale: [
    C(20, 'The Jar', (id) => `"You want to know what's in the jar, don't you?" ${G.nm(id)} grin${G.s(id)} wildly. "It's Kevin. My sourdough starter. Forty years old. Would you like a piece?"`, [
      ['Accept a piece of Kevin', fx({ fr: 7, give: 'bread_roll', xp: ['cooking', 15], t: 'You bake bread with Kevin at home. It\'s the best bread you\'ve ever made.' })],
      ['Ask about the science of it', fx({ fr: 6, f: () => G.gradeXP('science', 20), t: 'A forty-minute lecture on yeast. You are genuinely fascinated.' })],
    ]),
    C(50, 'Rockpools', (id) => `"Saturday. Gull Bay. Low tide. Bring a bucket." ${G.nm(id)} hand${G.s(id)} you a field guide.`, [
      ['Go rockpooling', fx({ time: 120, f: () => { G.gradeXP('science', 30); G.gain('awareness', 1.2); G.give('seashell'); }, t: 'Crabs, anemones and a tiny octopus. {nm:vale} shriek{s:vale} with delight at every one.' })],
    ]),
  ],
  abernathy: [
    C(20, 'Legends of Wetinburg', (id) => `"Have I told you about the fox of Whisperwood, dear? They say a fox spirit lives at the Mossy Shrine and blesses those who bring offerings three days running. And the lighthouse — oh, the lighthouse keeper's key went missing in 1887…"`, [
      ['Listen to every story', fx({ time: 40, f: () => { G.flag('foxLegend', true); G.flag('lighthouseLegend', true); G.gradeXP('history', 20); }, t: 'You leave with your head full of foxes, shipwrecks and lost keys. (Journal updated.)' })],
    ]),
    C(50, 'The Old Map', (id) => `${G.nm(id)} unroll${G.s(id)} an ancient map. "See this note? The keeper donated his papers to the town library. If the key survived… it'd be among the old books."`, [
      ['Thank {him} and resolve to look', fx({ fr: 5, f: () => { G.flag('keyClue', true); G.gradeXP('history', 15); }, t: 'The library. Of course. (Try researching legends there.)' })],
    ]),
  ],
  ricci: [
    C(20, 'An Exhibition', (id) => `${G.nm(id)} hold${G.s(id)} up one of your sketches. "This! This has heart! I am putting it in the town exhibition."`, [
      ['Agree, nervous but proud', fx({ fr: 6, xp: ['art', 25], apply: { mood: 10 }, f: () => G.mod('rep', 3), t: 'Your sketch hangs in the town hall for a week. Aunt Nell takes forty photos.' })],
    ]),
    C(50, 'Watercolour Secrets', (id) => `"Come. I show you the wet-on-wet technique. Nobody taught me — I had to steal it from a painter in Venice!"`, [
      ['Learn the technique', fx({ time: 60, xp: ['art', 40], give: 'fine_paints', f: () => G.gradeXP('art', 20), t: 'Blooms of colour spread across the paper like magic. {He} press{es} a set of fine paints into your hands. "For you. Paint everything."' })],
    ]),
  ],
  fenwick: [
    C(20, 'Which Song?', (id) => `${G.nm(id)} ${G.is(id)} flustered. "I want to play something special at the café on Friday. For… someone. Which is better — the waltz or the ballad?"`, [
      ['The ballad', fx({ fr: 5, xp: ['music', 10], t: 'On Friday, Bea Calloway listens to the ballad with both hands pressed to {his:bea} heart.' })],
      ['The waltz', fx({ fr: 5, xp: ['music', 10], t: 'On Friday, the waltz has Bea swaying behind the counter, laughing.' })],
    ]),
    C(50, 'An Announcement', (id) => `At the café, ${G.nm(id)} tap${G.s(id)} a glass. "Bea and I — well — we're getting married." The café erupts.`, [
      ['Cheer loudest of all', fx({ fr: 6, f: () => { G.friend('bea', 6); G.mod('mood', 15); G.log(`${G.nm('fenwick')} and Bea Calloway are engaged!`); }, t: 'Bea hugs you. Everyone gets free cake. Wetinburg is a little brighter.' })],
    ]),
  ],
  okoro: [
    C(20, 'Effort Noticed', (id) => `"I see you working," ${G.nm(id)} say${G.s(id)} gruffly. "Want extra training? Six a.m. in the park. Don't be late."`, [
      ['Accept the challenge', fx({ fr: 6, time: 60, xp: ['athletics', 30], f: () => G.gain('physique', 1.5), t: 'It is brutal. It is also the best you\'ve ever felt.' })],
    ]),
    C(50, 'The Dream', (id) => `${G.nm(id)} show${G.s(id)} you an old photo: a young sprinter on a podium. "Nearly made the national team. Injury. Now I coach. Best decision I never made."`, [
      ['Ask what keeps {him} going', fx({ tr: 8, fr: 6, f: () => G.gain('willpower', 1.5), t: '"Watching kids like you find out they\'re stronger than they thought." You stand up straighter.' })],
    ]),
  ],
  tom: [
    C(20, 'Reading the Sky', (id) => `Tom points a gnarled finger at the clouds. "Mackerel sky. Rain by tomorrow. Learn to read it and the farm reads easier."`, [
      ['Learn from him', fx({ fr: 6, xp: ['tending', 30], f: () => G.gain('awareness', 0.6), t: 'An hour of clouds, wind and old sayings. Tom almost smiles.' })],
    ]),
    C(50, 'The Almanac', (id) => `Tom hands you a battered book. "My father's almanac. You'll use it better than me."`, [
      ['Accept it with thanks', fx({ fr: 8, give: 'farm_almanac', xp: ['tending', 20], t: 'It\'s full of handwritten notes about every season. A treasure.' })],
    ]),
  ],
  bea: [
    C(20, 'The Secret Scone', (id) => `"Want to know my secret scone recipe? Grated frozen butter. Don't tell a soul."`, [
      ['Bake with Bea', fx({ time: 45, xp: ['cooking', 35], give: 'cake_slice', fr: 5, t: 'Flour everywhere. The scones are perfect. Bea sends you home with extras.' })],
    ]),
    C(50, 'A Note', (id) => `Bea is pink-cheeked. "Could you take this note to Oliver — {nm:fenwick} — at school? I'm too nervous to give it myself!"`, [
      ['Deliver it', fx({ fr: 6, f: () => G.friend('fenwick', 6), t: (id) => `${G.nm('fenwick')} reads it and goes the colour of a tomato. "Tell her… yes. Tell her yes." (A background romance blossoms.)` })],
    ]),
  ],
  reyes: [
    C(20, 'Neighbourhood Watch', (id) => `"You get around," ${G.nm(id)} say${G.s(id)}. "Seen anything odd at the docks lately?"`, [
      ['Tell {him} what you\'ve noticed', fx({ tr: 8, fr: 5, att: ['honesty', 2], f: () => G.mod('rep', 2), t: '"Useful. Thanks." {He} write{s} it down.' })],
      ['Say you don\'t like snitching', fx({ fr: 1, att: ['rules', -2], t: '"Fair enough. Offer stands."' })],
    ]),
    C(50, 'Community Day', (id) => `"We're running a community clean-up on Saturday. Could use someone the other kids look up to."`, [
      ['Help organise', fx({ time: 120, fr: 6, f: () => { G.mod('rep', 6); G.gain('purity', 2); G.cnt('goodDeed', 2); }, t: 'Fifty people turn up. The beach sparkles. The local paper prints your photo.' })],
    ]),
  ],
  pell: [
    C(20, 'The Archive Room', (id) => `${G.nm(id)} catch${G.npcPron(id).s ? 'es' : ''} you reading past closing. Instead of scolding, ${G.he(id)} unlock${G.s(id)} a small door. "The archive. Don't touch anything without gloves."`, [
      ['Explore the archive', fx({ time: 40, f: () => { G.gain('awareness', 1); G.flag('archive', true); }, t: 'Old maps, ledgers, a lighthouse keeper\'s logbook… (Researching legends here is now more fruitful.)' })],
    ]),
    C(50, 'A Rare Gift', (id) => `${G.nm(id)} hand${G.s(id)} you a wrapped parcel. "Withdrawn from circulation. It deserves a reader."`, [
      ['Open it', fx({ give: 'rare_book', fr: 6, t: 'A first-edition novel. You\'re speechless.' })],
    ]),
  ],
};
// fix tokens in labels that need runtime names
St.CHAPTERS.theo[1].choices[1][0] = 'Tell your homeroom teacher about it';
St.CHAPTERS.sasha[2].choices[1][0] = 'Gently suggest telling your homeroom teacher';

St.availableChapter = function (id) {
  const list = St.CHAPTERS[id]; if (!list) return null; const r = G.rel(id);
  if (r.chapter >= list.length) return null;
  if (r.lastChapter === G.day()) return null;
  const c = list[r.chapter]; return r.fr >= c.min ? c : null;
};
St.playChapter = function (id) {
  G._ctx = id; const r = G.rel(id); const c = St.availableChapter(id); if (!c) { back(); return; }
  G.goto(() => {
    G.hr(`${G.nm(id)}: “${c.title}”`);
    say(`<p>${c.text(id)}</p>`);
    c.choices.forEach(([label, fn, o]) => {
      const ok = !o || !o.req || o.req();
      ch(label, () => { G.advance(10); const txt = fn(id); r.chapter++; r.lastChapter = G.day(); r.lastTalk = G.day(); G.log(`Story — ${G.nm(id)}: "${c.title}" (chapter ${r.chapter}/${St.CHAPTERS[id].length}).`); G.result(`<p>${txt}</p>`, () => G.NPC.interact(id)); }, { req: ok, why: ok ? '' : 'Requirement not met', cls: 'story' });
    });
  });
};

/* ---------- legends & research ---------- */
St.research = function () {
  const S = G.S; G.advance(45); G.gain('awareness', 0.6); G.cnt('study'); G.cnt('research');
  const n = G.count('research');
  let txt;
  if (!G.flag('foxLegend')) { G.flag('foxLegend', true); txt = 'You find a crumbling book of folk tales: <i>"The fox of Whisperwood rewards those who leave an offering at the Mossy Shrine on three separate days, and who come at the turning of the light — dawn or dusk."</i>'; }
  else if (!G.flag('lighthouseLegend')) { G.flag('lighthouseLegend', true); txt = 'A newspaper from 1887: the lighthouse keeper vanished the night of the great shipwreck. His key — "a brass key engraved L.H." — was never found. Some say he was carried off on "wings of light".'; }
  else if (!G.flag('catLegend')) { G.flag('catLegend', true); txt = 'A sailor\'s journal mentions "the silver-eyed cats of the docks — feed one five times, and it may one night speak to you."'; }
  else if (!G.has('old_key') && !G.flag('lighthouseOpen') && (G.flag('archive') || G.flag('keyClue') || n > 5) && G.chance(0.5)) { G.give('old_key'); G.log('You found the lighthouse keeper\'s brass key hidden in a library book!'); txt = 'Inside a hollowed-out ledger in the archive section, wrapped in oilcloth: <b>an old brass key engraved "L.H."</b> Your heart skips.'; }
  else if (!G.flag('angelLegend')) { G.flag('angelLegend', true); txt = 'A hymn-book margin note: <i>"To the truly kind and pure of heart, the dawn at the shrine brings a white feather."</i>'; }
  else if (!G.flag('emberLegend')) { G.flag('emberLegend', true); txt = 'A cautionary tale: <i>"Those who walk the docks at night with a heavy conscience may find an ember stone, and wear its mark."</i>'; }
  else txt = G.pick(['You read about the founding of Wetinburg by storm-sheltering fishermen.', 'You learn the clock tower was built in 1902 and has been wrong ever since.', 'A dusty book claims the River Wetin once flowed backwards for a day.', 'You find a recipe for 1800s fish pie. It\'s horrifying.']);
  G.result(`<p>${txt}</p>`);
};
St.tfHint = function (t) {
  return {
    cat: G.flag('catLegend') ? `Feed the stray silver-eyed cats (${G.count('catFed')}/5), then look for one at night.` : 'Sailors tell tales about the cats at the docks…',
    fox: G.flag('foxLegend') ? `Leave offerings at the Mossy Shrine on 3 days (${Math.min(3, G.count('foxOffer'))}/3), then visit at dawn or dusk.` : 'Old folk tales speak of a fox in Whisperwood. (Research at the library.)',
    angel: G.flag('angelLegend') ? `Be truly kind (good deeds ${G.count('goodDeed')}/12, Purity 80+) and greet the dawn at the shrine.` : 'Something about kindness and the dawn…',
    demon: G.flag('emberLegend') ? 'Walk the docks at night with a heavy conscience (Purity 30 or less).' : 'Not everything in Wetinburg is gentle…',
    wings: G.flag('lighthouseLegend') ? (G.has('old_key') ? 'You have the keeper\'s key. Visit the lighthouse after dark.' : 'Find the lighthouse keeper\'s lost key.') : 'The Old Lighthouse holds a secret.',
  }[t];
};
St.goalsHTML = function () {
  const S = G.S; let h = '<h3 class="sub">Right now</h3><ul class="small">';
  const hw = S.school.homework.filter(x => !x.done); if (hw.length) h += `<li>Homework to do: ${hw.map(x => D.SUBJECTS[x.subj].name + ' (due ' + G.shortDate(x.due) + ')').join(', ')}</li>`;
  if (S.school.detention !== null && S.school.detention !== undefined) h += `<li class="warn">Detention on ${G.shortDate(S.school.detention)} at 15:30 in Classroom 2B.</li>`;
  if (S.record.unpaid) h += `<li class="warn">Unpaid fines: ${G.money(S.record.unpaid)} (police station).</li>`;
  if (S.flags.communityRequired) h += '<li class="warn">Community service required at the police station.</li>';
  if (!S.farm.access) h += '<li>Visit Meadowlark Farm and ask Tom about growing crops.</li>';
  const jobs = Object.keys(D.JOBS).filter(j => G.Jobs.hired(j)); h += `<li>Jobs: ${jobs.length ? jobs.map(j => D.JOBS[j].name).join(', ') : 'none yet — try the café (Bea), library (Mrs. Pell), farm (Tom) or the paper round (square, 5:00–7:30).'}</li>`;
  if (G.examDay(G.day()) || (G.seasonDay() < 22 && G.seasonIdx() < 3)) h += `<li>Next exams: day 22 of ${G.season()}.</li>`;
  h += '</ul><h3 class="sub">Stories</h3><ul class="small">';
  for (const id in D.NPCS) { const r = G.rel(id); if (!r.met) continue; const L = St.CHAPTERS[id] || []; const next = L[r.chapter]; h += `<li><b>${G.nm(id)}</b>: ${r.chapter}/${L.length} chapters${next ? ` — next at friendship ${next.min}${r.fr >= next.min ? ' <span class="okmsg">(ready! talk to them)</span>' : ''}` : ' — complete ✔'}</li>`; }
  h += '</ul><h3 class="sub">Legends & mysteries</h3><ul class="small">';
  const leg = [['foxLegend', 'The Fox of Whisperwood'], ['lighthouseLegend', 'The Lighthouse Keeper\'s Key'], ['catLegend', 'The Silver-eyed Cats'], ['angelLegend', 'The White Feather'], ['emberLegend', 'The Ember Stone']];
  const any = leg.filter(([f]) => G.flag(f));
  if (!any.length) h += '<li>No legends discovered yet. Try researching at the Public Library, or chatting to Mrs. Abernathy.</li>';
  any.forEach(([f, n]) => h += `<li>${n}</li>`);
  h += '</ul>';
  return h;
};

/* ---------- shrine ---------- */
St.shrineActions = function () {
  const S = G.S; const h = G.hour(); const dawnDusk = (h >= 5 && h < 7.5) || (h >= 17 && h < 20);
  ch('🙏 Pray quietly', () => { G.advance(15); G.mod('stress', -8); G.gain('purity', 0.4); G.gain('willpower', 0.3); G.result('<p>You close your eyes. The forest is utterly still. Something in you settles.</p>'); }, { time: 15 });
  ch('🧘 Meditate', () => { G.advance(40); G.gain('willpower', 0.9); G.mod('stress', -10); G.result('<p>Breath in, breath out. Moss, birdsong, the creak of trees.</p>'); }, { time: 40 });
  const food = Object.keys(S.inv).filter(i => D.ITEMS[i] && (D.ITEMS[i].eat || D.ITEMS[i].cat === 'produce'));
  if (food.length) ch(`🍙 Leave an offering (${D.ITEMS[food[0]].name})`, () => { G.take(food[0]); G.advance(10); if (S.flags.lastOffer !== G.day()) { S.flags.lastOffer = G.day(); G.cnt('foxOffer'); } G.gain('purity', 0.3); G.result(`<p>You place the ${D.ITEMS[food[0]].name.toLowerCase()} in the stone bowl and bow. ${G.count('foxOffer') >= 3 ? 'The fox statue\'s eyes seem to gleam.' : 'A breeze stirs the leaves.'}</p>`); }, { time: 10 });
  // fox transformation
  if (!G.hasTf('fox') && G.count('foxOffer') >= 3 && dawnDusk && G.flag('foxLegend')) ch('🦊 A real fox is sitting by the statue…', () => {
    G.goto(() => {
      say('<p>A fox with fur like embers and eyes like moonlight sits by the shrine, watching you. It speaks — not aloud, but in your head. <i>"You have been generous, little one. Would you carry a piece of the forest with you?"</i></p>');
      ch('Accept the fox\'s blessing', () => { G.give('fox_charm'); G.addTf('fox'); G.gain('beauty', 3); G.result('<p>Warmth floods through you. When you touch your head, you feel soft, pointed ears — and behind you, a fluffy tail swishes. You laugh out loud.</p>'); });
      ch('Politely decline', () => { G.gain('willpower', 1); G.result('<p>The fox dips its head and vanishes into the ferns. Perhaps another time.</p>'); });
    });
  }, { cls: 'story' });
  // angel
  if (!G.hasTf('angel') && h >= 5 && h < 7.5 && S.stats.purity >= 80 && G.count('goodDeed') >= 12) ch('🪶 A white feather drifts down in the dawn light…', () => {
    G.goto(() => {
      say('<p>A feather, impossibly white, spirals down and lands in your open palm. It glows faintly. You feel the warmth of every kind thing you\'ve ever done.</p>');
      ch('Hold it to your heart', () => { G.give('white_feather'); G.addTf('angel'); G.mod('stress', -20); G.result('<p>Light blooms around you. A soft halo hums above your head, and small feathered wings unfold at your back. Somehow, it feels right.</p>'); });
      ch('Let it drift away', () => G.result('<p>The feather floats off into the trees.</p>'));
    });
  }, { cls: 'story' });
  if (S.player.transforms.length) ch('🍃 Ask the spirits to undo a transformation', () => {
    G.goto(() => {
      say('<p>You kneel and ask. Which change would you return?</p>');
      S.player.transforms.forEach(t => ch(`Undo ${D.TRANSFORMS[t].name}`, () => { G.removeTf(t); G.advance(30); G.result('<p>A gentle wind rushes through you, and you are as you were.</p>'); }));
      ch('Never mind', back);
    });
  });
};

/* ---------- lighthouse ---------- */
St.lighthouseActions = function () {
  const S = G.S;
  ch('Look out to sea', () => { G.advance(20); G.mod('stress', -6); G.gain('awareness', 0.3); G.result('<p>Waves crash on the rocks below. Far out, a ship\'s lights crawl along the horizon.</p>'); }, { time: 20 });
  if (!G.flag('lighthouseOpen')) {
    if (G.has('old_key')) ch('🗝️ Try the brass key in the door', () => {
      if (!G.isDark()) { G.result('<p>The key turns stiffly — but something tells you to wait until dark. You lock it again.</p>'); return; }
      G.flag('lighthouseOpen', true); G.take('old_key');
      G.goto(() => {
        say('<p>The door groans open. You climb the spiral stairs, round and round, until you reach the lamp room. Dust, cobwebs — and a journal on the desk: <i>"If you are reading this, light the lamp once more."</i></p>');
        ch('Light the old lamp', () => {
          G.advance(30);
          const ok = S.stats.awareness >= 35 || S.stats.willpower >= 40;
          if (!ok) { G.flag('lighthouseOpen', false); G.give('old_key'); G.result('<p>You fumble with the mechanism but can\'t figure it out. Perhaps with more awareness or willpower… You lock up and keep the key.</p>'); return; }
          G.goto(() => {
            say('<p>Light pours from the lamp for the first time in over a century, sweeping across the bay. From the glow, a cloud of shimmering moths and butterflies spirals around you — and settles on your back.</p>');
            ch('Embrace the light', () => { G.addTf('wings'); G.mod('mood', 20); G.mod('rep', 5); G.log('The Old Lighthouse shone again for one night. The whole town talked about it.'); G.result('<p>When the light fades, you have wings — delicate, iridescent and very much yours. They flutter when you\'re happy.</p>'); });
            ch('Just watch the light', () => { G.mod('mood', 15); G.result('<p>The butterflies scatter into the night. The lamp dims. What a night.</p>'); });
          });
        });
      });
    }, { cls: 'story' });
    else ch('Try the sealed door', () => { G.advance(5); G.result('<p>Locked tight with an old brass lock. You\'d need the original key — or very good lockpicking skills, but this feels like a place to respect.</p>'); }, { time: 5 });
  } else say('<p class="small dim">The lighthouse door stands unlocked now. The lamp room is peaceful.</p>');
  // demon
  if (!G.hasTf('demon') && G.isDark() && S.stats.purity <= 30 && G.flag('emberLegend')) ch('🔥 Something glows red among the rocks…', () => {
    G.goto(() => {
      say('<p>A small stone glows like a coal between the rocks, warm in your hand. It whispers that you don\'t need to be good to be strong.</p>');
      ch('Keep the ember stone', () => { G.give('ember_stone'); G.addTf('demon'); G.gain('willpower', 3); G.result('<p>Heat runs up your arm. Two small horns push through your hair, and a slim, pointed tail curls behind you. You feel… bolder.</p>'); });
      ch('Throw it into the sea', () => { G.gain('purity', 2); G.gain('willpower', 1); G.result('<p>It hisses as it hits the water. You feel lighter.</p>'); });
    });
  }, { cls: 'story' });
};

/* ---------- festivals ---------- */
St.winterFair = function () {
  const S = G.S; if (G.today().fair) { G.result('<p>The fair glows with lanterns. You\'ve already made a night of it.</p>'); return; }
  G.goto(() => {
    G.hr('Winter Lantern Fair');
    say('<p>Wetinburg Square glitters with hundreds of paper lanterns. Stalls sell hot chestnuts, mulled apple juice and knitted everything. A brass band plays carols; {nm:fenwick} and Bea are slow-dancing by the fountain.</p>');
    const p = G.partner();
    const end = (t, f) => { G.today().fair = 1; G.advance(120); f(); G.result(t); };
    if (p) ch(`Release a lantern with ${G.nm(p)}`, () => end(`<p class="love">You and ${G.nm(p)} write wishes on a paper lantern and let it rise. ${G.He(p)} won't tell you what ${G.he(p)} wished for, but ${G.he(p)} hold${G.s(p)} your hand the whole time it floats away.</p>`, () => { G.romance(p, 10); G.friend(p, 5); G.rel(p).lastDate = G.day(); G.mod('mood', 20); }), { cls: 'love' });
    ch('Wander the stalls with friends', () => end('<p>You eat too many chestnuts, win a knitted hat at the tombola and sing carols badly with half your class.</p>', () => { G.NPC.peersAll().forEach(id => { if (G.rel(id).met) G.friend(id, 2, true); }); G.mod('mood', 15); G.mod('stress', -12); }));
    ch('Volunteer at the charity stall', () => end('<p>You serve hot drinks for the hospital charity. Your fingers freeze, your heart warms.</p>', () => { G.gain('purity', 2); G.mod('rep', 4); G.cnt('goodDeed'); G.att('kindness', 3); }));
  });
};
St.fireworks = function () {
  const S = G.S; if (G.today().fw) { G.result('<p>The last fireworks fizzle over the bay.</p>'); return; }
  G.goto(() => {
    G.hr('Gull Bay Fireworks Night');
    say('<p>The whole town is on the beach. Blankets, picnics, sparklers. Then — BOOM — the sky over Gull Bay explodes into colour.</p>');
    const p = G.partner();
    const end = (t, f) => { G.today().fw = 1; G.advance(90); f(); G.result(t); };
    if (p) ch(`Watch with ${G.nm(p)}`, () => end(`<p class="love">You and ${G.nm(p)} share a blanket. When the golden finale rains down, ${G.he(p)} lean${G.s(p)} ${G.his(p)} head on your shoulder.</p>`, () => { G.romance(p, 10); G.rel(p).lastDate = G.day(); G.mod('mood', 20); }), { cls: 'love' });
    ch('Watch with your friends', () => end('<p>Mira shrieks at every bang, Kai is asleep somehow, Sasha writes {his:sasha} name with a sparkler. Perfect.</p>', () => { G.NPC.peersAll().forEach(id => { if (G.rel(id).met) G.friend(id, 2, true); }); G.mod('mood', 18); G.mod('stress', -15); }));
  });
};
})(window.G);
