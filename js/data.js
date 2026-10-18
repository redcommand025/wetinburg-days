/* Wetinburg Days — static game data. All ids are stable; do not rename. */
window.G = window.G || {};
(function (G) {
'use strict';
const D = G.DATA = {};
D.TOWN = 'Wetinburg';

D.SEASONS = ['Autumn', 'Winter', 'Spring', 'Summer'];
D.DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
D.SEASON_LEN = 28;
D.TIERS = ['F', 'F+', 'D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', 'S'];

D.STATS = {
  purity:    { name: 'Purity', base: 60, desc: 'Innocence, moral integrity and good name. Lowered by lying, stealing and delinquency; raised by honest, kind acts.', tiers: ['Disgraced', 'Tarnished', 'Questionable', 'Decent', 'Good-hearted', 'Virtuous', 'Saintly'] },
  beauty:    { name: 'Beauty', base: 30, desc: 'Grooming, style and presence. Improved by hygiene, nice clothes and confidence.', tiers: ['Scruffy', 'Plain', 'Neat', 'Pleasant', 'Attractive', 'Striking', 'Radiant'] },
  physique:  { name: 'Physique', base: 30, desc: 'Strength, fitness and endurance. Trained through exercise, sports and hard work.', tiers: ['Frail', 'Weak', 'Average', 'Fit', 'Strong', 'Athletic', 'Powerful'] },
  willpower: { name: 'Willpower', base: 30, desc: 'Resolve and self-control. Grows by facing difficulties, studying hard and resisting temptation.', tiers: ['Fickle', 'Wavering', 'Steady', 'Determined', 'Resolute', 'Unshakable', 'Iron-willed'] },
  awareness: { name: 'Awareness', base: 30, desc: 'Perception, knowledge and street smarts. Raised by reading, studying and observing.', tiers: ['Oblivious', 'Distracted', 'Attentive', 'Observant', 'Perceptive', 'Insightful', 'Sage'] },
};

D.SKILLS = {
  athletics:    { name: 'Athletics', group: 'Main', stat: 'physique' },
  swimming:     { name: 'Swimming', group: 'Main', stat: 'physique' },
  dancing:      { name: 'Dancing', group: 'Main', stat: 'beauty' },
  housekeeping: { name: 'Housekeeping', group: 'Main', stat: 'willpower' },
  cooking:      { name: 'Cooking', group: 'Main', stat: 'awareness' },
  art:          { name: 'Art', group: 'Main', stat: 'awareness' },
  music:        { name: 'Music', group: 'Main', stat: 'willpower' },
  pickpocketing:{ name: 'Pickpocketing', group: 'Skulduggery', stat: 'awareness' },
  shoplifting:  { name: 'Shoplifting', group: 'Skulduggery', stat: 'awareness' },
  lockpicking:  { name: 'Lockpicking', group: 'Skulduggery', stat: 'willpower' },
  tending:      { name: 'Tending', group: 'Tending', stat: 'willpower' },
  animalcare:   { name: 'Animal Care', group: 'Tending', stat: 'awareness' },
};

D.ATTITUDES = {
  honesty:  { name: 'Honesty', lo: 'Deceptive', hi: 'Honest' },
  rules:    { name: 'Rule-following', lo: 'Rebellious', hi: 'Law-abiding' },
  confront: { name: 'Confrontation', lo: 'Avoidant', hi: 'Assertive' },
  kindness: { name: 'Kindness', lo: 'Selfish', hi: 'Generous' },
};

/* ---------- Named NPCs (ids are permanent) ---------- */
// sex: m/f/i (male/female/intersex) ; pres: masc/fem/andro ; pron: he/she/they — user may change these in Settings > NPCs. Names are fixed.
D.NPCS = {
  mira:  { first: 'Mira', last: 'Okafor', role: 'Classmate · Track star', peer: true, romance: true, sex: 'f', pres: 'fem', pron: 'she',
    personality: 'energetic', desc: 'Loud laugh, quick feet, and an inability to sit still. Mira captains the Athletics Club and treats every hallway as a race track.',
    likes: ['sports_drink', 'energy_bar', 'friendship_bracelet', 'cake_slice'], loves: ['running_shoes_gift'], dislikes: ['novel', 'sheet_music', 'scented_candle'],
    topics: ['sports', 'food', 'gossip'], color: '#e8743b', hair: '#1b1b1b', skin: '#7a4a2e' },
  theo:  { first: 'Theo', last: 'Lindqvist', role: 'Classmate · Bookworm', peer: true, romance: true, sex: 'm', pres: 'masc', pron: 'he',
    personality: 'shy', desc: 'Wire-rimmed glasses, an ever-present paperback, and a dry wit that only appears once {he} trusts you.',
    likes: ['novel', 'puzzle_box', 'tea', 'hot_cocoa'], loves: ['rare_book'], dislikes: ['energy_drink', 'sports_drink'],
    topics: ['books', 'science', 'history'], color: '#4a6fa5', hair: '#d8c27a', skin: '#f1d3bd' },
  jun:   { first: 'Jun', last: 'Park', role: 'Classmate · Artist', peer: true, romance: true, sex: 'm', pres: 'andro', pron: 'he',
    personality: 'quiet', desc: 'Paint under the fingernails, headphones around the neck. Jun sketches everyone and shows no one.',
    likes: ['sketchbook', 'pressed_flower', 'tea', 'seashell'], loves: ['fine_paints'], dislikes: ['comic_book', 'energy_drink'],
    topics: ['art', 'music', 'nature'], color: '#7b5ea7', hair: '#2a2a2a', skin: '#e9c9a7' },
  sasha: { first: 'Sasha', last: 'Petrova', role: 'Classmate · Rebel', peer: true, romance: true, sex: 'f', pres: 'andro', pron: 'she',
    personality: 'rebel', desc: 'Skateboard, scuffed boots and a habit of skipping third period. Under the attitude, fiercely loyal.',
    likes: ['video_game', 'energy_drink', 'comic_book', 'cat_bell'], loves: ['vintage_patch'], dislikes: ['flower_bouquet', 'scented_candle', 'novel'],
    topics: ['games', 'music', 'gossip'], color: '#3c3c3c', hair: '#b03060', skin: '#f3d9c4' },
  eli:   { first: 'Eli', last: 'Moreau', role: 'Classmate · Musician', peer: true, romance: true, sex: 'm', pres: 'masc', pron: 'he',
    personality: 'dreamy', desc: 'Hums constantly, works weekend shifts at the café, and writes songs on napkins.',
    likes: ['sheet_music', 'guitar_picks', 'coffee', 'cake_slice'], loves: ['vinyl_record'], dislikes: ['sports_drink', 'puzzle_box'],
    topics: ['music', 'food', 'art'], color: '#c0883b', hair: '#5a3a22', skin: '#d7a77f' },
  rosie: { first: 'Rosie', last: 'Fairweather', role: 'Classmate · Farm kid', peer: true, romance: true, sex: 'f', pres: 'fem', pron: 'she',
    personality: 'cheerful', desc: 'Freckles, wellington boots and endless stories about the goats at {his} family\'s farm. Rosie lives at Meadowlark Farm with Tom Fairweather.',
    likes: ['honey_jar', 'flower_bouquet', 'pressed_flower', 'apple'], loves: ['golden_sunflower'], dislikes: ['video_game', 'energy_drink'],
    topics: ['nature', 'animals', 'food'], color: '#6a994e', hair: '#c25b2a', skin: '#f6dcc8' },
  kai:   { first: 'Kai', last: 'Nakamura', role: 'Classmate · Swimmer', peer: true, romance: true, sex: 'm', pres: 'masc', pron: 'he',
    personality: 'laidback', desc: 'Sun-bleached hair, chlorine smell, unbothered by everything except a bad wave.',
    likes: ['seashell', 'ice_cream', 'sports_drink', 'onigiri'], loves: ['surf_wax'], dislikes: ['novel', 'scented_candle'],
    topics: ['sports', 'nature', 'games'], color: '#2a9d8f', hair: '#e0c27a', skin: '#c99a73' },
  priya: { first: 'Priya', last: 'Sharma', role: 'Classmate · Student council', peer: true, romance: true, sex: 'f', pres: 'fem', pron: 'she',
    personality: 'driven', desc: 'Student council president, colour-coded planner, and secretly terrible at relaxing.',
    likes: ['novel', 'tea', 'scented_candle', 'chocolate_box'], loves: ['fountain_pen'], dislikes: ['comic_book', 'video_game'],
    topics: ['school', 'books', 'history'], color: '#b5466b', hair: '#1d1410', skin: '#b07a52' },
  dex:   { first: 'Dex', last: 'Harlow', role: 'Classmate · Troublemaker', peer: true, romance: false, sex: 'm', pres: 'masc', pron: 'he',
    personality: 'bully', desc: 'Big, loud and constantly in detention. Dex picks on whoever looks easiest — but there is more going on at home than he lets on.',
    likes: ['energy_bar', 'sandwich', 'comic_book'], loves: ['football'], dislikes: ['flower_bouquet', 'sheet_music'],
    topics: ['sports', 'games'], color: '#8b3a3a', hair: '#6b4a2a', skin: '#efcfb5' },
  hart:  { first: 'Eleanor', last: 'Hart', title: true, role: 'Teacher · English & Homeroom', peer: false, adult: true, sex: 'f', pres: 'fem', pron: 'she',
    personality: 'kind', desc: 'Your homeroom teacher. Patient, perceptive, and quietly fierce about {his} students.',
    likes: ['novel', 'tea', 'flower_bouquet'], dislikes: ['energy_drink'], topics: ['books', 'school'], color: '#7a5c8a', hair: '#8a8a8a', skin: '#efd2bd' },
  bose:  { first: 'Arjun', last: 'Bose', title: true, role: 'Teacher · Maths', peer: false, adult: true, sex: 'm', pres: 'masc', pron: 'he',
    personality: 'strict', desc: 'Precise, punctual and allergic to excuses. Has a surprisingly warm laugh when a student finally "gets it".',
    likes: ['puzzle_box', 'coffee'], dislikes: ['comic_book'], topics: ['school', 'science'], color: '#3d5a80', hair: '#222', skin: '#9c6b48' },
  vale:  { first: 'Ingrid', last: 'Vale', fixedTitle: 'Dr.', role: 'Teacher · Science', peer: false, adult: true, sex: 'f', pres: 'andro', pron: 'she',
    personality: 'eccentric', desc: 'Lab coat, wild grey hair, and a jar of something that might be alive on {his} desk.',
    likes: ['puzzle_box', 'seashell', 'coffee'], dislikes: ['scented_candle'], topics: ['science', 'nature'], color: '#4f772d', hair: '#cfcfcf', skin: '#f3dcc9' },
  abernathy: { first: 'Margaret', last: 'Abernathy', title: true, role: 'Teacher · History & Geography', peer: false, adult: true, sex: 'f', pres: 'fem', pron: 'she',
    personality: 'storyteller', desc: 'Has taught at Wetinburg High for thirty years and knows every legend about the town.',
    likes: ['tea', 'pressed_flower', 'novel'], dislikes: ['video_game'], topics: ['history', 'books'], color: '#8c6d46', hair: '#e5e5e5', skin: '#f1d6c3' },
  ricci: { first: 'Lucia', last: 'Ricci', title: true, role: 'Teacher · Art', peer: false, adult: true, sex: 'f', pres: 'fem', pron: 'she',
    personality: 'passionate', desc: 'Paint-splattered apron, big gestures, believes everyone is an artist.',
    likes: ['sketchbook', 'flower_bouquet', 'coffee'], dislikes: ['energy_drink'], topics: ['art'], color: '#d1495b', hair: '#2b1a12', skin: '#e6b998' },
  fenwick: { first: 'Oliver', last: 'Fenwick', title: true, role: 'Teacher · Music', peer: false, adult: true, sex: 'm', pres: 'masc', pron: 'he',
    personality: 'gentle', desc: 'Soft-spoken music teacher who plays piano at the café on Friday nights — and has been seeing Bea Calloway for a while now.',
    likes: ['sheet_music', 'tea', 'vinyl_record'], dislikes: ['energy_drink'], topics: ['music'], color: '#5e548e', hair: '#a0522d', skin: '#f0d0b8' },
  okoro: { first: 'Samuel', last: 'Okoro', fixedTitle: 'Coach', role: 'Teacher · PE', peer: false, adult: true, sex: 'm', pres: 'masc', pron: 'he',
    personality: 'tough', desc: 'Whistle, clipboard, booming voice. Demands effort, respects anyone who gives it.',
    likes: ['sports_drink', 'energy_bar'], dislikes: ['scented_candle'], topics: ['sports'], color: '#264653', hair: '#111', skin: '#5c3a21' },
  tom:   { first: 'Tom', last: 'Fairweather', role: 'Farmer · Meadowlark Farm', peer: false, adult: true, sex: 'm', pres: 'masc', pron: 'he',
    personality: 'gruff', desc: 'Rosie\'s {kin}. Weathered hands, few words, and an unshakeable belief that hard work fixes most things.',
    likes: ['coffee', 'sandwich', 'honey_jar'], dislikes: ['video_game'], topics: ['nature', 'animals'], color: '#6b4f2a', hair: '#ddd', skin: '#e2b896' },
  bea:   { first: 'Beatrice', nick: 'Bea', last: 'Calloway', role: 'Owner · The Copper Kettle café', peer: false, adult: true, sex: 'f', pres: 'fem', pron: 'she',
    personality: 'warm', desc: 'Runs the café with a laugh you can hear from the street. Hums along whenever Mr. Fenwick plays.',
    likes: ['flower_bouquet', 'honey_jar', 'chocolate_box'], dislikes: ['energy_drink'], topics: ['food', 'gossip', 'music'], color: '#bc6c25', hair: '#f4d35e', skin: '#f2cfb3' },
  reyes: { first: 'Dana', last: 'Reyes', fixedTitle: 'Officer', role: 'Police officer', peer: false, adult: true, sex: 'f', pres: 'andro', pron: 'she',
    personality: 'fair', desc: 'Wetinburg\'s community officer. Firm but fair, and far more interested in second chances than punishment.',
    likes: ['coffee', 'sandwich'], dislikes: ['comic_book'], topics: ['gossip', 'school'], color: '#1d3557', hair: '#2b2b2b', skin: '#c48b5f' },
  pell:  { first: 'Harriet', last: 'Pell', title: true, role: 'Librarian · Wetinburg Library', peer: false, adult: true, sex: 'f', pres: 'fem', pron: 'she',
    personality: 'quiet', desc: 'Sharp-eyed librarian who can locate any book in under a minute and silence any noise in under a second.',
    likes: ['novel', 'tea', 'pressed_flower'], dislikes: ['energy_drink', 'video_game'], topics: ['books', 'history'], color: '#6d597a', hair: '#9c9c9c', skin: '#f3d6c5' },
};

/* ---------- School ---------- */
D.SUBJECTS = {
  maths:   { name: 'Maths', teacher: 'bose', room: 'school_classroom', stat: 'awareness' },
  science: { name: 'Science', teacher: 'vale', room: 'school_lab', stat: 'awareness' },
  english: { name: 'English', teacher: 'hart', room: 'school_classroom', stat: 'awareness' },
  history: { name: 'History', teacher: 'abernathy', room: 'school_classroom', stat: 'awareness' },
  art:     { name: 'Art', teacher: 'ricci', room: 'school_artroom', stat: 'beauty', skill: 'art' },
  pe:      { name: 'PE', teacher: 'okoro', room: 'school_gym', stat: 'physique', skill: 'athletics' },
  music:   { name: 'Music', teacher: 'fenwick', room: 'school_musicroom', stat: 'willpower', skill: 'music' },
  swim:    { name: 'Swimming', teacher: 'okoro', room: 'school_pool', stat: 'physique', skill: 'swimming', gradeAs: 'pe' },
};
D.PERIODS = [
  { id: 'reg', name: 'Registration', start: 8 * 60 + 45, end: 9 * 60, reg: true },
  { id: 'p1', name: 'Period 1', start: 9 * 60, end: 10 * 60 },
  { id: 'p2', name: 'Period 2', start: 10 * 60, end: 11 * 60 },
  { id: 'break', name: 'Morning Break', start: 11 * 60, end: 11 * 60 + 20, free: true },
  { id: 'p3', name: 'Period 3', start: 11 * 60 + 20, end: 12 * 60 + 20 },
  { id: 'lunch', name: 'Lunch', start: 12 * 60 + 20, end: 13 * 60 + 20, free: true },
  { id: 'p4', name: 'Period 4', start: 13 * 60 + 20, end: 14 * 60 + 20 },
  { id: 'p5', name: 'Period 5', start: 14 * 60 + 20, end: 15 * 60 + 20 },
];
D.TIMETABLE = [ // Mon..Fri : p1..p5
  ['maths', 'english', 'science', 'history', 'pe'],
  ['science', 'maths', 'art', 'english', 'music'],
  ['english', 'history', 'maths', 'swim', 'art'],
  ['history', 'science', 'english', 'music', 'maths'],
  ['pe', 'art', 'maths', 'science', 'english'],
];
D.CLUBS = {
  athletics: { name: 'Athletics Club', day: 1, room: 'school_gym', skill: 'athletics', stat: 'physique', members: ['mira', 'dex'] },
  art:       { name: 'Art Club', day: 2, room: 'school_artroom', skill: 'art', stat: 'beauty', members: ['jun'] },
  swim:      { name: 'Swim Club', day: 3, room: 'school_pool', skill: 'swimming', stat: 'physique', members: ['kai'] },
  music:     { name: 'Music Club', day: 0, room: 'school_musicroom', skill: 'music', stat: 'willpower', members: ['eli'] },
  dance:     { name: 'Dance Club', day: 4, room: 'school_gym', skill: 'dancing', stat: 'beauty', members: ['priya', 'mira'] },
  garden:    { name: 'Gardening Club', day: 3, room: 'school_courtyard', skill: 'tending', stat: 'willpower', members: ['rosie'] },
  books:     { name: 'Book Club', day: 0, room: 'school_library', skill: null, stat: 'awareness', members: ['theo', 'priya'] },
};

/* ---------- Locations ---------- */
// x,y: map coords (0-100 by 0-70). hours: [open, close] in hours (close may exceed 24). bus: has bus stop.
D.LOCATIONS = {
  home:        { name: 'Home', x: 18, y: 38, outdoor: false, bus: true, icon: '🏠' },
  street:      { name: 'Maple Street', x: 26, y: 36, outdoor: true, icon: '🛣️' },
  school_gate: { name: 'Wetinburg High — Front Gate', x: 38, y: 22, area: 'school', outdoor: true, bus: true, icon: '🏫' },
  school_classroom: { name: 'Wetinburg High — Classroom 2B', area: 'school', inner: true, outdoor: false, icon: '📚' },
  school_lab:  { name: 'Wetinburg High — Science Lab', area: 'school', inner: true, outdoor: false, icon: '🧪' },
  school_artroom: { name: 'Wetinburg High — Art Room', area: 'school', inner: true, outdoor: false, icon: '🎨' },
  school_musicroom: { name: 'Wetinburg High — Music Room', area: 'school', inner: true, outdoor: false, icon: '🎵' },
  school_gym:  { name: 'Wetinburg High — Gymnasium', area: 'school', inner: true, outdoor: false, icon: '🏀' },
  school_pool: { name: 'Wetinburg High — Swimming Pool', area: 'school', inner: true, outdoor: false, icon: '🏊' },
  school_library: { name: 'Wetinburg High — School Library', area: 'school', inner: true, outdoor: false, icon: '📖' },
  school_cafeteria: { name: 'Wetinburg High — Cafeteria', area: 'school', inner: true, outdoor: false, icon: '🍱' },
  school_courtyard: { name: 'Wetinburg High — Courtyard', area: 'school', inner: true, outdoor: true, icon: '🌳' },
  school_rooftop: { name: 'Wetinburg High — Rooftop', area: 'school', inner: true, outdoor: true, icon: '🏙️' },
  school_office: { name: 'Wetinburg High — Main Office', area: 'school', inner: true, outdoor: false, icon: '🗂️' },
  school_nurse: { name: 'Wetinburg High — Nurse\'s Office', area: 'school', inner: true, outdoor: false, icon: '🩹' },
  square:      { name: 'Wetinburg Square', x: 50, y: 38, outdoor: true, bus: true, icon: '⛲' },
  cafe:        { name: 'The Copper Kettle Café', x: 54, y: 33, outdoor: false, hours: [7, 21], icon: '☕' },
  library:     { name: 'Wetinburg Public Library', x: 44, y: 45, outdoor: false, hours: [9, 20], icon: '🏛️' },
  park:        { name: 'Riverside Park', x: 34, y: 50, outdoor: true, icon: '🌷' },
  shopping:    { name: 'Lantern Lane Shopping District', x: 63, y: 43, outdoor: true, bus: true, icon: '🛍️' },
  arcade:      { name: 'Pixel Palace Arcade', x: 67, y: 35, outdoor: false, hours: [12, 23], icon: '🕹️' },
  hospital:    { name: 'St. Brigid\'s Hospital', x: 60, y: 22, outdoor: false, bus: true, icon: '🏥' },
  police:      { name: 'Wetinburg Police Station', x: 52, y: 26, outdoor: false, icon: '🚓' },
  river:       { name: 'River Wetin Banks', x: 28, y: 58, outdoor: true, icon: '🎣' },
  beach:       { name: 'Gull Bay Beach', x: 82, y: 63, outdoor: true, bus: true, icon: '🏖️' },
  docks:       { name: 'Wetinburg Docks', x: 88, y: 50, outdoor: true, bus: true, icon: '⚓' },
  lighthouse:  { name: 'Old Lighthouse', x: 97, y: 60, outdoor: true, icon: '🗼' },
  forest:      { name: 'Whisperwood Forest', x: 12, y: 16, outdoor: true, icon: '🌲' },
  shrine:      { name: 'Mossy Shrine', x: 5, y: 5, outdoor: true, icon: '⛩️' },
  farm:        { name: 'Meadowlark Farm', x: 8, y: 60, outdoor: true, bus: true, hours: [5, 21], icon: '🐄' },
};
D.SCHOOL_HOURS = [7.5, 18];

/* ---------- Items ---------- */
// cat: food, gift, seed, produce, tool, book, medicine, misc, quest
D.ITEMS = {
  bread_roll: { name: 'Bread Roll', cat: 'food', price: 2, eat: { hunger: -20 }, desc: 'Soft and plain.' },
  apple: { name: 'Apple', cat: 'food', price: 1, eat: { hunger: -10, health: 1 }, desc: 'Crisp and red.', gift: true },
  sandwich: { name: 'Sandwich', cat: 'food', price: 4, eat: { hunger: -35 }, desc: 'Cheese and pickle.', gift: true },
  onigiri: { name: 'Rice Ball', cat: 'food', price: 3, eat: { hunger: -25 }, desc: 'Wrapped in seaweed.', gift: true },
  bento: { name: 'Bento Box', cat: 'food', price: 6, eat: { hunger: -50, mood: 3 }, desc: 'A complete, balanced lunch.' },
  energy_bar: { name: 'Energy Bar', cat: 'food', price: 2, eat: { hunger: -15, stamina: 8 }, desc: 'Chewy oats and honey.', gift: true },
  sports_drink: { name: 'Sports Drink', cat: 'food', price: 3, eat: { stamina: 12, hunger: -3 }, desc: 'Electric blue and refreshing.', gift: true },
  energy_drink: { name: 'Energy Drink', cat: 'food', price: 3, eat: { stamina: 22, health: -2, stress: 3 }, desc: 'Fizzy. Probably bad for you.', gift: true },
  coffee: { name: 'Coffee', cat: 'food', price: 3, eat: { stamina: 12, hunger: -2 }, desc: 'Fresh from The Copper Kettle.', gift: true },
  tea: { name: 'Herbal Tea', cat: 'food', price: 2, eat: { stress: -6, hunger: -2 }, desc: 'Chamomile and honey.', gift: true },
  hot_cocoa: { name: 'Hot Cocoa', cat: 'food', price: 3, eat: { mood: 8, stress: -4, hunger: -5 }, desc: 'Topped with marshmallows.', gift: true },
  cake_slice: { name: 'Cake Slice', cat: 'food', price: 4, eat: { hunger: -15, mood: 10 }, desc: 'Victoria sponge.', gift: true },
  ice_cream: { name: 'Ice Cream', cat: 'food', price: 3, eat: { hunger: -8, mood: 8, stress: -3 }, desc: 'Strawberry swirl.', gift: true },
  groceries: { name: 'Groceries', cat: 'food', price: 9, desc: 'Ingredients for a home-cooked meal. Use in the kitchen.', noEat: true },
  home_meal: { name: 'Home-cooked Meal', cat: 'food', price: 0, eat: { hunger: -60, mood: 8, health: 3 }, desc: 'Made with your own hands.' },
  fish: { name: 'Fresh Fish', cat: 'produce', price: 0, sell: 6, desc: 'Caught in the River Wetin.' },
  // gifts
  flower_bouquet: { name: 'Flower Bouquet', cat: 'gift', price: 8, desc: 'Seasonal flowers wrapped in paper.' },
  chocolate_box: { name: 'Box of Chocolates', cat: 'gift', price: 6, desc: 'Assorted truffles.' },
  comic_book: { name: 'Comic Book', cat: 'gift', price: 5, desc: 'Issue #42 of Captain Comet.' },
  sketchbook: { name: 'Sketchbook', cat: 'gift', price: 7, desc: 'Thick, creamy pages.' },
  guitar_picks: { name: 'Guitar Picks', cat: 'gift', price: 4, desc: 'A tin of colourful picks.' },
  plush_cat: { name: 'Plush Cat', cat: 'gift', price: 10, desc: 'Unreasonably soft.' },
  scented_candle: { name: 'Scented Candle', cat: 'gift', price: 6, desc: 'Lavender and vanilla.' },
  friendship_bracelet: { name: 'Friendship Bracelet', cat: 'gift', price: 5, desc: 'Woven in bright thread.' },
  video_game: { name: 'Video Game', cat: 'gift', price: 20, desc: 'The new Starfall cartridge.' },
  sheet_music: { name: 'Sheet Music', cat: 'gift', price: 6, desc: 'A collection of folk songs.' },
  puzzle_box: { name: 'Puzzle Box', cat: 'gift', price: 9, desc: 'A wooden box with a hidden latch.' },
  cat_bell: { name: 'Little Bell', cat: 'gift', price: 3, desc: 'A tiny silver bell on a ribbon.' },
  vinyl_record: { name: 'Vintage Vinyl', cat: 'gift', price: 18, desc: 'A rare jazz pressing.' },
  fine_paints: { name: 'Fine Watercolour Set', cat: 'gift', price: 22, desc: 'Professional-grade pigments.' },
  fountain_pen: { name: 'Fountain Pen', cat: 'gift', price: 20, desc: 'Elegant, weighty and smooth.' },
  surf_wax: { name: 'Coconut Surf Wax', cat: 'gift', price: 8, desc: 'Smells like summer.' },
  vintage_patch: { name: 'Vintage Band Patch', cat: 'gift', price: 9, desc: 'From a band nobody has heard of.' },
  running_shoes_gift: { name: 'Racing Spikes', cat: 'gift', price: 25, desc: 'Lightweight sprinting shoes.' },
  football: { name: 'Football', cat: 'gift', price: 12, desc: 'Regulation size.' },
  rare_book: { name: 'First-edition Novel', cat: 'gift', price: 30, desc: 'Found only in the bookshop\'s locked cabinet.' },
  golden_sunflower: { name: 'Golden Sunflower', cat: 'gift', price: 0, sell: 25, desc: 'A perfect bloom grown with care.' },
  seashell: { name: 'Pretty Seashell', cat: 'gift', price: 0, sell: 2, desc: 'Pink and spiralled, found on Gull Bay.' },
  pressed_flower: { name: 'Pressed Flower', cat: 'gift', price: 0, sell: 3, desc: 'A delicate keepsake.' },
  honey_jar: { name: 'Jar of Honey', cat: 'gift', price: 7, sell: 5, desc: 'Meadowlark Farm wildflower honey.' },
  // seeds
  seed_carrot: { name: 'Carrot Seeds', cat: 'seed', price: 3, crop: 'carrot' },
  seed_pumpkin: { name: 'Pumpkin Seeds', cat: 'seed', price: 6, crop: 'pumpkin' },
  seed_spinach: { name: 'Spinach Seeds', cat: 'seed', price: 3, crop: 'spinach' },
  seed_kale: { name: 'Winter Kale Seeds', cat: 'seed', price: 4, crop: 'kale' },
  seed_garlic: { name: 'Garlic Bulbs', cat: 'seed', price: 5, crop: 'garlic' },
  seed_strawberry: { name: 'Strawberry Runners', cat: 'seed', price: 6, crop: 'strawberry' },
  seed_lettuce: { name: 'Lettuce Seeds', cat: 'seed', price: 3, crop: 'lettuce' },
  seed_peas: { name: 'Pea Seeds', cat: 'seed', price: 3, crop: 'peas' },
  seed_tomato: { name: 'Tomato Seeds', cat: 'seed', price: 4, crop: 'tomato' },
  seed_sunflower: { name: 'Sunflower Seeds', cat: 'seed', price: 5, crop: 'sunflower' },
  seed_corn: { name: 'Sweetcorn Seeds', cat: 'seed', price: 5, crop: 'corn' },
  // produce
  carrot: { name: 'Carrots', cat: 'produce', sell: 6, desc: 'Earthy and sweet.', eat: { hunger: -8 } },
  pumpkin: { name: 'Pumpkin', cat: 'produce', sell: 18, desc: 'Big and round.' },
  spinach: { name: 'Spinach', cat: 'produce', sell: 5, desc: 'Leafy greens.' },
  kale: { name: 'Winter Kale', cat: 'produce', sell: 8, desc: 'Hardy, frost-sweetened leaves.' },
  garlic: { name: 'Garlic', cat: 'produce', sell: 10, desc: 'Pungent bulbs.' },
  strawberry: { name: 'Strawberries', cat: 'produce', sell: 12, desc: 'Ruby red.', eat: { hunger: -6, mood: 4 }, gift: true },
  lettuce: { name: 'Lettuce', cat: 'produce', sell: 5, desc: 'Crunchy.' },
  peas: { name: 'Peas', cat: 'produce', sell: 6, desc: 'Sweet pods.' },
  tomato: { name: 'Tomatoes', cat: 'produce', sell: 9, desc: 'Sun-ripened.' },
  sunflower: { name: 'Sunflower', cat: 'produce', sell: 12, desc: 'Tall and cheerful.', gift: true },
  corn: { name: 'Sweetcorn', cat: 'produce', sell: 11, desc: 'Golden cobs.' },
  egg: { name: 'Fresh Eggs', cat: 'produce', sell: 4, desc: 'Still warm.' },
  milk: { name: 'Fresh Milk', cat: 'produce', sell: 5, desc: 'From Buttercup the cow.' },
  wool: { name: 'Wool Bundle', cat: 'produce', sell: 9, desc: 'Soft fleece.' },
  // tools
  umbrella: { name: 'Umbrella', cat: 'tool', price: 12, desc: 'Keeps the rain off. Automatically used when it rains.' },
  fishing_rod: { name: 'Fishing Rod', cat: 'tool', price: 25, desc: 'Lets you fish at the river and docks.' },
  practice_lock: { name: 'Practice Padlock', cat: 'tool', price: 10, desc: 'A clear acrylic lock for learning how locks work.' },
  bobby_pins: { name: 'Bobby Pins', cat: 'tool', price: 2, desc: 'Useful for hair... and other things.' },
  bicycle: { name: 'Bicycle', cat: 'tool', price: 80, desc: 'Cuts walking time considerably (not in storms or snow).' },
  bus_pass: { name: 'Bus Pass', cat: 'tool', price: 30, desc: 'Free bus rides for 28 days from purchase.' },
  first_aid_kit: { name: 'First Aid Kit', cat: 'medicine', price: 8, use: { health: 15 }, desc: 'Bandages and antiseptic.' },
  painkillers: { name: 'Painkillers', cat: 'medicine', price: 4, use: { health: 6, stress: -3 }, desc: 'For headaches.' },
  cold_medicine: { name: 'Cold Medicine', cat: 'medicine', price: 6, use: { health: 10, cure: 'cold' }, desc: 'Cures a cold.' },
  // books
  novel: { name: 'Paperback Novel', cat: 'book', price: 8, read: { awareness: 1.2, stress: -8 }, desc: 'A cosy mystery.', gift: true },
  study_guide: { name: 'Study Guide', cat: 'book', price: 10, read: { awareness: 0.6, grade: 25 }, desc: 'Boosts a random weak subject when studied.' },
  cookbook: { name: 'Cookbook', cat: 'book', price: 12, read: { skill: 'cooking', xp: 30 }, desc: 'Recipes from around the world.' },
  farm_almanac: { name: 'Farmer\'s Almanac', cat: 'book', price: 9, read: { skill: 'tending', xp: 30 }, desc: 'Planting wisdom for every season.' },
  // misc / quest
  lost_wallet: { name: 'Lost Wallet', cat: 'quest', desc: 'A brown leather wallet with an ID card inside.' },
  old_key: { name: 'Old Brass Key', cat: 'quest', desc: 'Found inside a library book. Engraved "L.H."' },
  fox_charm: { name: 'Fox Charm', cat: 'quest', desc: 'A carved wooden fox, warm to the touch.' },
  white_feather: { name: 'White Feather', cat: 'quest', desc: 'Impossibly white and faintly glowing.' },
  ember_stone: { name: 'Ember Stone', cat: 'quest', desc: 'A dark stone that is always warm.' },
  cat_collar: { name: 'Silver-bell Collar', cat: 'quest', desc: 'Given by a very unusual cat.' },
  crow_trinket: { name: 'Shiny Trinket', cat: 'misc', sell: 4, desc: 'A crow left this for you.' },
  wild_berries: { name: 'Wild Berries', cat: 'food', price: 0, sell: 3, eat: { hunger: -8, mood: 3 }, desc: 'Foraged in Whisperwood.' },
  mushrooms: { name: 'Forest Mushrooms', cat: 'produce', sell: 5, desc: 'Safe ones, according to the almanac.' },
};

/* ---------- Clothing ---------- */
// slot: top/bottom/full/shoes/head/face/neck ; color ; beauty ; warmth ; tags
D.CLOTHES = {
  uniform_blazer: { name: 'School Blazer', slot: 'top', color: '#1f3b63', beauty: 2, warmth: 1, uniform: true, price: 0, style: 'blazer' },
  uniform_trousers: { name: 'Uniform Trousers', slot: 'bottom', color: '#2a2f3a', beauty: 1, warmth: 1, uniform: true, price: 0, style: 'trousers' },
  uniform_skirt: { name: 'Uniform Skirt (knee-length)', slot: 'bottom', color: '#2a2f3a', beauty: 1, warmth: 0, uniform: true, price: 0, style: 'skirt' },
  tshirt: { name: 'Plain T-shirt', slot: 'top', color: '#e8e8e8', beauty: 0, warmth: 0, price: 8, style: 'tee' },
  band_tee: { name: 'Band T-shirt', slot: 'top', color: '#333', beauty: 2, warmth: 0, price: 14, style: 'tee' },
  hoodie: { name: 'Cosy Hoodie', slot: 'top', color: '#7d8597', beauty: 1, warmth: 2, price: 22, style: 'hoodie' },
  sweater: { name: 'Knit Sweater', slot: 'top', color: '#a44a3f', beauty: 3, warmth: 2, price: 26, style: 'sweater' },
  cardigan: { name: 'Pastel Cardigan', slot: 'top', color: '#f2b5d4', beauty: 4, warmth: 1, price: 24, style: 'sweater' },
  button_shirt: { name: 'Button-up Shirt', slot: 'top', color: '#9ad1d4', beauty: 4, warmth: 0, price: 20, style: 'shirt' },
  raincoat: { name: 'Yellow Raincoat', slot: 'top', color: '#f4d03f', beauty: 2, warmth: 1, rain: true, price: 30, style: 'coat' },
  winter_coat: { name: 'Winter Coat', slot: 'top', color: '#4a4e69', beauty: 3, warmth: 3, price: 45, style: 'coat' },
  sundress: { name: 'Summer Sundress', slot: 'full', color: '#ffd166', beauty: 6, warmth: 0, price: 32, style: 'dress' },
  overalls: { name: 'Denim Overalls', slot: 'full', color: '#3d6b9a', beauty: 2, warmth: 1, farm: true, price: 28, style: 'overalls' },
  tracksuit: { name: 'Tracksuit', slot: 'full', color: '#2b9348', beauty: 1, warmth: 2, sport: true, price: 30, style: 'tracksuit' },
  formal_suit: { name: 'Smart Suit', slot: 'full', color: '#22223b', beauty: 8, warmth: 1, price: 70, style: 'suit' },
  festival_yukata: { name: 'Festival Yukata', slot: 'full', color: '#5390d9', beauty: 7, warmth: 0, price: 50, style: 'dress' },
  jeans: { name: 'Blue Jeans', slot: 'bottom', color: '#355c8a', beauty: 2, warmth: 1, price: 25, style: 'trousers' },
  shorts: { name: 'Shorts', slot: 'bottom', color: '#b08968', beauty: 1, warmth: 0, price: 14, style: 'shorts' },
  pleated_skirt: { name: 'Pleated Skirt (knee-length)', slot: 'bottom', color: '#9d4edd', beauty: 3, warmth: 0, price: 22, style: 'skirt' },
  cargo_pants: { name: 'Cargo Trousers', slot: 'bottom', color: '#606c38', beauty: 1, warmth: 1, price: 24, style: 'trousers' },
  sneakers: { name: 'Sneakers', slot: 'shoes', color: '#f8f9fa', beauty: 1, price: 30, sport: true },
  school_shoes: { name: 'School Shoes', slot: 'shoes', color: '#111', beauty: 1, price: 0, uniform: true },
  boots: { name: 'Rain Boots', slot: 'shoes', color: '#2d6a4f', beauty: 0, warmth: 1, rain: true, price: 20 },
  sandals: { name: 'Sandals', slot: 'shoes', color: '#c68b59', beauty: 1, price: 12 },
  glasses: { name: 'Round Glasses', slot: 'face', color: '#222', beauty: 1, price: 18 },
  sunglasses: { name: 'Sunglasses', slot: 'face', color: '#111', beauty: 2, price: 15 },
  cap: { name: 'Baseball Cap', slot: 'head', color: '#d62828', beauty: 1, price: 12 },
  beanie: { name: 'Woolly Beanie', slot: 'head', color: '#e76f51', beauty: 1, warmth: 1, price: 12 },
  sunhat: { name: 'Straw Sun Hat', slot: 'head', color: '#e9c46a', beauty: 2, price: 16 },
  hair_ribbon: { name: 'Hair Ribbon', slot: 'head', color: '#ff4d6d', beauty: 2, price: 6 },
  flower_pin: { name: 'Flower Hairpin', slot: 'head', color: '#ffafcc', beauty: 2, price: 8 },
  scarf: { name: 'Striped Scarf', slot: 'neck', color: '#c1121f', beauty: 1, warmth: 1, price: 14 },
  headphones: { name: 'Headphones', slot: 'neck', color: '#14213d', beauty: 1, price: 28 },
  pendant: { name: 'Star Pendant', slot: 'neck', color: '#ffd60a', beauty: 3, price: 20 },
};
// starting casual outfits (character creation)
D.OUTFITS = {
  tee_jeans: { name: 'T-shirt & jeans', items: ['tshirt', 'jeans', 'sneakers'], worn: { top: 'tshirt', bottom: 'jeans', shoes: 'sneakers' } },
  hoodie_cargo: { name: 'Hoodie & cargo trousers', items: ['hoodie', 'cargo_pants', 'sneakers'], worn: { top: 'hoodie', bottom: 'cargo_pants', shoes: 'sneakers' } },
  cardigan_skirt: { name: 'Cardigan & pleated skirt', items: ['cardigan', 'pleated_skirt', 'sandals'], worn: { top: 'cardigan', bottom: 'pleated_skirt', shoes: 'sandals' } },
  shirt_shorts: { name: 'Button-up shirt & shorts', items: ['button_shirt', 'shorts', 'sandals'], worn: { top: 'button_shirt', bottom: 'shorts', shoes: 'sandals' } },
  sundress: { name: 'Summer sundress', items: ['sundress', 'sandals'], worn: { full: 'sundress', shoes: 'sandals' } },
  overalls: { name: 'Denim overalls', items: ['overalls', 'tshirt', 'boots'], worn: { full: 'overalls', shoes: 'boots' } },
};
D.HEIGHTS = { petite: 0.88, average: 0.95, tall: 1.0 };
D.BUILDS = { slim: 0.9, average: 1, athletic: 1.07, sturdy: 1.14 };
D.SEX_OPTS = [['male', 'Male'], ['female', 'Female'], ['intersex', 'Intersex']];
D.NPC_SEX_OPTS = [['m', 'Male'], ['f', 'Female'], ['i', 'Intersex']];
D.PRES_OPTS = [['masc', 'Masculine'], ['fem', 'Feminine'], ['andro', 'Androgynous']];
D.PRON_OPTS = [['he', 'he/him'], ['she', 'she/her'], ['they', 'they/them']];
D.SHOP_CLOTHES = ['tshirt', 'band_tee', 'hoodie', 'sweater', 'cardigan', 'button_shirt', 'raincoat', 'winter_coat', 'sundress', 'overalls', 'tracksuit', 'formal_suit', 'festival_yukata', 'jeans', 'shorts', 'pleated_skirt', 'cargo_pants', 'sneakers', 'boots', 'sandals', 'glasses', 'sunglasses', 'cap', 'beanie', 'sunhat', 'hair_ribbon', 'flower_pin', 'scarf', 'headphones', 'pendant'];

D.SHOPS = {
  grocer: { name: 'Green Basket Grocer', loc: 'shopping', hours: [8, 20], items: ['bread_roll', 'apple', 'sandwich', 'onigiri', 'bento', 'energy_bar', 'sports_drink', 'energy_drink', 'groceries', 'honey_jar'] },
  gifts: { name: 'Twinkle Gifts', loc: 'shopping', hours: [10, 19], items: ['flower_bouquet', 'chocolate_box', 'comic_book', 'sketchbook', 'guitar_picks', 'plush_cat', 'scented_candle', 'friendship_bracelet', 'video_game', 'sheet_music', 'puzzle_box', 'cat_bell', 'vinyl_record', 'fine_paints', 'fountain_pen', 'surf_wax', 'vintage_patch', 'running_shoes_gift', 'football'] },
  hardware: { name: 'Hollis Hardware & Seeds', loc: 'shopping', hours: [8, 18], items: ['umbrella', 'fishing_rod', 'practice_lock', 'bobby_pins', 'bicycle', 'first_aid_kit', 'seasonal_seeds'] },
  books: { name: 'Dog-Ear Books', loc: 'shopping', hours: [9, 19], items: ['novel', 'study_guide', 'cookbook', 'farm_almanac', 'rare_book'] },
  pharmacy: { name: 'Wetinburg Pharmacy', loc: 'shopping', hours: [8, 21], items: ['first_aid_kit', 'painkillers', 'cold_medicine'] },
  kiosk: { name: 'Square Kiosk', loc: 'square', hours: [6, 22], items: ['bread_roll', 'sandwich', 'onigiri', 'sports_drink', 'ice_cream', 'bus_pass'] },
  cafe: { name: 'The Copper Kettle Counter', loc: 'cafe', hours: [7, 21], items: ['coffee', 'tea', 'hot_cocoa', 'cake_slice', 'sandwich'] },
  canteen: { name: 'School Canteen', loc: 'school_cafeteria', hours: [8, 15], items: ['bento', 'onigiri', 'sandwich', 'apple', 'sports_drink'] },
};

/* ---------- Farming ---------- */
D.CROPS = {
  carrot: { name: 'Carrots', season: 0, days: 5, yield: [2, 4] },
  pumpkin: { name: 'Pumpkin', season: 0, days: 10, yield: [1, 2] },
  spinach: { name: 'Spinach', season: 0, days: 4, yield: [2, 3] },
  kale: { name: 'Winter Kale', season: 1, days: 6, yield: [2, 3] },
  garlic: { name: 'Garlic', season: 1, days: 8, yield: [2, 4] },
  strawberry: { name: 'Strawberries', season: 2, days: 6, yield: [2, 5] },
  lettuce: { name: 'Lettuce', season: 2, days: 4, yield: [2, 3] },
  peas: { name: 'Peas', season: 2, days: 5, yield: [2, 4] },
  tomato: { name: 'Tomatoes', season: 3, days: 7, yield: [3, 5] },
  sunflower: { name: 'Sunflower', season: 3, days: 8, yield: [1, 2] },
  corn: { name: 'Sweetcorn', season: 3, days: 9, yield: [2, 4] },
};
D.ANIMALS = {
  buttercup: { name: 'Buttercup', kind: 'cow', product: 'milk', temper: 20 },
  pepper: { name: 'Pepper', kind: 'pony', product: null, temper: 50 },
  clover: { name: 'Clover', kind: 'goat', product: null, temper: 60 },
  hens: { name: 'The Hens', kind: 'chickens', product: 'egg', temper: 30 },
  woolly: { name: 'Woolly', kind: 'sheep', product: 'wool', temper: 35 },
};

/* ---------- Jobs ---------- */
D.JOBS = {
  cafe: { name: 'Café Server', loc: 'cafe', boss: 'bea', hours: [7, 21], pay: 8, shift: 180, skill: 'cooking', stat: 'beauty', req: { beauty: 25 }, desc: 'Take orders, carry trays, smile a lot. Tips depend on beauty and mood.' },
  farm: { name: 'Farmhand', loc: 'farm', boss: 'tom', hours: [5, 19], pay: 7, shift: 180, skill: 'tending', stat: 'physique', req: { physique: 20 }, desc: 'Muck out, feed animals, haul feed sacks.' },
  library: { name: 'Library Assistant', loc: 'library', boss: 'pell', hours: [10, 19], pay: 6, shift: 120, skill: null, stat: 'awareness', req: { awareness: 30 }, desc: 'Shelve books and help visitors. Quiet and calming.' },
  paper: { name: 'Newspaper Delivery', loc: 'square', boss: null, hours: [5, 7.5], pay: 0, flat: 16, shift: 90, skill: 'athletics', stat: 'physique', req: {}, desc: 'Early-morning route around Wetinburg. Fixed pay per route.' },
};

/* ---------- Traits ---------- */
D.TRAITS = {
  early_bird: { name: 'Early Bird', desc: 'Woke before 6:30 on 7 mornings.', bonus: '+10 stamina when waking early; lateness is rarer.' },
  night_owl: { name: 'Night Owl', desc: 'Stayed up past midnight 7 times.', bonus: 'Stress builds slower at night; +awareness gains after dark.' },
  bookworm: { name: 'Bookworm', desc: 'Studied or read 20 times.', bonus: '+25% school grade gains.' },
  green_thumb: { name: 'Green Thumb', desc: 'Harvested 15 crops.', bonus: 'Crops sometimes grow an extra stage overnight; +1 yield.' },
  sticky_fingers: { name: 'Sticky Fingers', desc: '10 successful skulduggery acts.', bonus: '+10% skulduggery success.' },
  athlete: { name: 'Athlete', desc: 'Athletics reached C.', bonus: '+20% physique gains; less stamina used walking.' },
  social_butterfly: { name: 'Social Butterfly', desc: 'Have 5 friends (friendship 50+).', bonus: '+20% friendship gains.' },
  honest_soul: { name: 'Honest Soul', desc: 'Honesty attitude reached 60.', bonus: 'Purity decays slower; trust gains +25%.' },
  animal_whisperer: { name: 'Animal Whisperer', desc: 'Cared for animals 20 times.', bonus: 'Animals are always soothed.' },
  teachers_pet: { name: 'Teacher\'s Pet', desc: 'School reputation reached 80.', bonus: 'Teachers forgive one lateness a week; +grade gains.' },
  water_baby: { name: 'Water Baby', desc: 'Swimming reached C+.', bonus: 'Swimming relieves extra stress.' },
  home_chef: { name: 'Home Chef', desc: 'Cooking reached C.', bonus: 'Home meals restore more and lift mood.' },
  artist_soul: { name: 'Artist\'s Soul', desc: 'Art or Music reached C.', bonus: 'Creative activities relieve stress.' },
  iron_will: { name: 'Iron Will', desc: 'Willpower reached 70.', bonus: 'Stress gains reduced by 20%.' },
};

/* ---------- Transformations ---------- */
D.TRANSFORMS = {
  cat: { name: 'Cat-touched', parts: 'Cat ears & tail', perk: '+Awareness at night, +15% skulduggery, land on your feet (fewer injuries).' },
  fox: { name: 'Fox-blessed', parts: 'Fox ears & bushy tail', perk: '+Beauty, +Tending, charm bonus in conversations.' },
  angel: { name: 'Haloed', parts: 'Soft halo & small feathered wings', perk: 'Purity decays slower, stress relief when helping others.' },
  demon: { name: 'Ember-marked', parts: 'Little horns & pointed tail', perk: '+Willpower, bullies back off, but Purity gains are reduced.' },
  wings: { name: 'Sky-kissed', parts: 'Iridescent butterfly wings', perk: 'Walking time reduced by 25%; +mood on sunny days.' },
};

/* ---------- Appearance ---------- */
D.HAIR_STYLES = ['short', 'bob', 'long', 'ponytail', 'curly', 'buzz', 'braids', 'bun', 'spiky', 'pigtails'];
D.HAIR_COLORS = { black: '#1b1b1b', 'dark brown': '#3b2414', brown: '#6b4423', auburn: '#8d3b1f', ginger: '#c25b2a', blonde: '#e3c16f', platinum: '#efe6d0', grey: '#a8a8a8', pink: '#ef8fb3', blue: '#4f7cd9', green: '#4c9a6a', purple: '#8a5cc2' };
D.EYE_COLORS = { brown: '#5b3a1e', hazel: '#8e7344', green: '#3d8b4f', blue: '#3b74c4', grey: '#7a8790', amber: '#c98a1b', violet: '#7d4fb3' };
D.SKIN_TONES = { porcelain: '#f8e1d2', fair: '#f1cfb5', light: '#e5b896', medium: '#c99068', tan: '#a8714a', brown: '#7d4f30', deep: '#5a3620' };
D.BACKGROUNDS = {
  bookish: { name: 'Bookish transfer', desc: 'You read everything. +Awareness, better starting grades, +£20.', stats: { awareness: 12 }, grades: 120, money: 20 },
  country: { name: 'Country kid', desc: 'Grew up near fields. +Physique, Tending C-, knows animals.', stats: { physique: 10 }, skills: { tending: 250, animalcare: 200 }, money: 15 },
  city: { name: 'City kid', desc: 'Street smart and stylish. +Beauty, +Awareness, +£40.', stats: { beauty: 8, awareness: 5 }, money: 45 },
  sporty: { name: 'Sporty', desc: 'Always moving. +Physique, Athletics & Swimming D.', stats: { physique: 12 }, skills: { athletics: 220, swimming: 200 }, money: 15 },
  artsy: { name: 'Artsy', desc: 'Sketches and songs. Art & Music D, +Beauty.', stats: { beauty: 6 }, skills: { art: 220, music: 200, dancing: 100 }, money: 15 },
};

/* ---------- Tattoo / henna ---------- */
D.TATTOO_DESIGNS = { star: '★', moon: '☾', heart: '♥', flower: '✿', paw: '🐾', wave: '〰', swallow: '🕊', note: '♪', leaf: '❦' };
D.TATTOO_PLACES = { wrist: 'Left wrist', forearm: 'Right forearm', hand: 'Back of left hand', ankle: 'Ankle', shoulder: 'Upper arm' };

/* ---------- Generic NPC generation ---------- */
D.GEN_FIRST = ['Alex', 'Sam', 'Jordan', 'Robin', 'Casey', 'Morgan', 'Riley', 'Quinn', 'Avery', 'Jamie', 'Charlie', 'Frankie', 'Hayden', 'Rowan', 'Skyler', 'Emery', 'Toby', 'Lena', 'Omar', 'Ines', 'Marek', 'Yuki', 'Nadia', 'Felix'];
D.GEN_ROLES = { square: ['shopper', 'pensioner feeding pigeons', 'busker', 'office worker', 'tourist with a map'], shopping: ['shop assistant', 'teenager with shopping bags', 'mum with a pram', 'delivery driver'], park: ['jogger', 'dog walker', 'kid on a scooter', 'couple on a bench'], docks: ['fisherman', 'dock worker', 'sailor', 'gull-feeding old man'], beach: ['surfer', 'family with buckets', 'lifeguard', 'sunbather under an umbrella'], cafe: ['student with a laptop', 'regular reading a paper', 'barista'], library: ['retiree', 'university student', 'child with a picture book'], arcade: ['gamer', 'ticket-hoarding kid', 'arcade attendant'], school_gate: ['student', 'prefect', 'caretaker'], farm: ['farm volunteer', 'egg customer'], hospital: ['nurse', 'visitor with flowers', 'porter'], police: ['desk sergeant', 'citizen reporting a lost dog'], forest: ['hiker', 'birdwatcher'], river: ['angler', 'rower'] };
D.GEN_TRAITS = ['cheerful', 'grumpy', 'distracted', 'chatty', 'sleepy', 'nervous', 'friendly', 'hurried'];
})(window.G);
