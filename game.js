/* ═══════════════════════════════════════════════════════
   ARCHI'S SHELTER — Game Logic
═══════════════════════════════════════════════════════ */

'use strict';

// ────────────── CONSTANTS ──────────────

const DAY_LENGTH_MS    = 90_000;            // 90s/day
const PHASE_MORNING_MS = 8_000;
const PHASE_EVENING_MS = 12_000;
const PHASE_DAY_MS     = DAY_LENGTH_MS - PHASE_MORNING_MS - PHASE_EVENING_MS;
const VISITOR_INTERVAL = 22_000;            // ~3 visitors per day phase
const STARTING_MONEY   = 1500;
const STARTING_ANIMALS = 5;
const MAX_VISITORS     = 4;

const FOOD_COST = { dog: 15, cat: 10 };

// ────────────── DATA POOLS ──────────────

const DOG_NAMES = ['ARCHI','לוקה','לואי','בלה','דייזי','מילו','צ\'רלי','קוקו','ביילי','מקס','לולה','רוקי','שוקו','חופשי','ג\'ינג\'ר','פאצ\'י','בני','נלי','בלקי','נחשון'];
const CAT_NAMES = ['מיצי','שמש','תות','גרגיר','כרמל','לונה','מיאו','קליאו','פלאפי','ויסקי','חמוץ','פוצי','שוקו','מסקרה','זוזו','פרינסס','בובי','נמרוד'];

const DOG_BREEDS = ['לברדודל','לברדור','גולדן','פודל','בולדוג','האסקי','שיצו','בורדר קולי','מעורב','גורת רחוב','פומרניין','דאקסהונד'];
const CAT_BREEDS = ['פרסי','סיאמי','מעין כון','בריטי','בנגל','חתול בית','ראגדול','חתולת רחוב','אביסיני','מנקס'];

const FUR_COLORS = {
  dog: [
    {body: '#1a1a1a', accent: '#f0f0f0'},  // black + white (like ARCHI)
    {body: '#D4A574', accent: '#FFF8E1'},  // golden
    {body: '#FFFFFF', accent: '#FFE0B2'},  // white
    {body: '#8B6F47', accent: '#FFF8E1'},  // brown
    {body: '#3E2723', accent: '#D4A574'},  // dark brown + tan
    {body: '#BDBDBD', accent: '#F5F5F5'},  // grey
  ],
  cat: [
    {body: '#FF9800', accent: '#FFF8E1'},  // orange tabby
    {body: '#1a1a1a', accent: '#FFF8E1'},  // black
    {body: '#FFFFFF', accent: '#FFD1DC'},  // white + pink
    {body: '#9E9E9E', accent: '#F5F5F5'},  // grey
    {body: '#8B6F47', accent: '#D4A574'},  // brown tabby
    {body: '#FFF8E1', accent: '#8B6F47'},  // cream
  ]
};

const PERSONALITIES = ['friendly','shy','playful','lazy','cuddly','independent','protective','curious','calm','energetic'];

const ARRIVAL_STORIES = [
  'נמצא משוטט ברחוב, עיניים גדולות ולב חם 💛',
  'הבעלים הקודמים עברו דירה ולא יכלו לקחת',
  'נולד פה, מחכה למשפחה הראשונה שלו',
  'נמצא ליד פח, אבל היום מתחיל מחדש 🌸',
  'הגיע מהצפון, גדול וחזק עם נשמה רכה',
  'מופנה ממקלט אחר, מחפש בית קבוע',
  'זנוח אחרי לידת ילד במשפחה',
  'בעליו המבוגר נפטר, נשאר בלי בית',
  'נולד עם אחיו שכבר אומצו',
];

const VISITOR_AVATARS = ['👨','👩','🧑','👴','👵','👨‍🦰','👩‍🦰','👨‍🦱','👩‍🦱','🧔','👨‍🦳','👩‍🦳','🧑‍🦱'];

const VISITOR_NAMES = ['רחל','דנה','יוסי','מיכל','אבי','שירה','אמיר','נועה','גיל','תמר','רון','מיה','אסף','ליאת','עומר','אורית','עידן','שרון','איל','חני'];

const VISITOR_PROFILES = [
  {
    bio: 'משפחה עם 2 ילדים, גרים בבית עם חצר. רוצים כלב גדול וידידותי שיהיה חבר לילדים.',
    species: 'dog', tags: ['needs_yard','good_with_kids','friendly'], avoid: ['shy','aggressive','quiet'],
    age: ['young','adult'], experience: 'experienced'
  },
  {
    bio: 'סטודנטית בדירה קטנה. בבית רוב הזמן. פעם ראשונה עם חיה - רוצה משהו שקט ונחמד.',
    species: 'cat', tags: ['apartment_ok','quiet','calm','cuddly'], avoid: ['energetic','loud'],
    age: ['adult','senior'], experience: 'first_time'
  },
  {
    bio: 'זוג מבוגר, מחפשים חבר נאמן ורגוע. לא יכולים להתמודד עם חיה חולה או אנרגטית.',
    species: 'any', tags: ['calm','quiet','cuddly'], avoid: ['energetic','playful','protective'],
    age: ['adult','senior'], experience: 'experienced', healthMin: 70
  },
  {
    bio: 'אדם פעיל - רץ כל בוקר ומטייל. מחפש כלב אנרגטי שיהיה שותף הרפתקאות.',
    species: 'dog', tags: ['energetic','playful','needs_yard'], avoid: ['lazy','shy'],
    age: ['young','adult'], experience: 'experienced'
  },
  {
    bio: 'אוהבת חתולים מושבעת. גרה לבד עם בית גדול. רוצה חתול עצמאי וסקרן.',
    species: 'cat', tags: ['independent','curious','apartment_ok'], avoid: [],
    age: ['young','adult','senior'], experience: 'experienced'
  },
  {
    bio: 'מאמץ מנוסה, מוכן לקחת חיה עם בעיות בריאות או רקע קשה. רוצה לתת בית למישהו שצריך.',
    species: 'any', tags: ['friendly','cuddly','shy','calm'], avoid: [], allowSick: true,
    age: ['adult','senior'], experience: 'experienced', special: true
  },
  {
    bio: 'משפחה צעירה בדירה. רוצים חיה קטנה ושקטה שתסתדר במקום מצומצם.',
    species: 'any', tags: ['apartment_ok','quiet','calm'], avoid: ['needs_yard','energetic','protective'],
    age: ['adult','senior'], experience: 'first_time'
  },
  {
    bio: 'גרה בבית עם חתול אחר. מחפשת חיה שתסתדר עם חתולים ולא תפחיד אותו.',
    species: 'any', tags: ['good_with_pets','calm','friendly'], avoid: ['protective','aggressive'],
    age: ['young','adult'], experience: 'experienced'
  },
  {
    bio: 'פנסיונרים אוהבי חיות. מחפשים חיה מבוגרת לחבר שקט בבית.',
    species: 'any', tags: ['calm','cuddly','quiet'], avoid: ['energetic','playful'],
    age: ['senior','adult'], experience: 'experienced', preferOlder: true
  },
  {
    bio: 'אבא חד-הורי עם ילד קטן. רוצה כלב סבלני שיהיה טוב עם ילדים.',
    species: 'dog', tags: ['good_with_kids','calm','friendly','cuddly'], avoid: ['aggressive','shy'],
    age: ['adult'], experience: 'first_time'
  }
];

const ARCHI_MESSAGES = {
  morning_no_animals: ['בוקר טוב! המקלט שקט, אולי יבואו חיות חדשות 🌅'],
  morning_general:    ['בוקר טוב! בוא נתחיל יום חדש 🐾','איזה יום יפה היום!','מקווה שיהיו אימוצים מוצלחים היום ❤️'],
  visitor_arrived:    ['מבקר חדש! לך תראה אותם 👋','מישהו בדלת! בוא נראה מה הוא רוצה','אורח חדש מחכה'],
  great_match:        ['מושלם! התאמה נהדרת 🎉','איזה אימוץ מוצלח!','כל הכבוד, זוג מושלם 💕'],
  bad_match:          ['אהמ... זה לא היה אידיאלי 😅','בפעם הבאה נצליח יותר','קרא טוב יותר את הפרופיל'],
  level_up:           ['רמה חדשה! המקלט גדל 🎊','כל הכבוד, התקדמת!','איזה הישג!'],
  low_money:          ['הכסף נגמר... תזהר 💸','צריך להרוויח יותר','אולי לעצור עם הקניות?'],
  animal_sick:        ['חיה לא מרגישה טוב 🤒','מישהו צריך וטרינר','שים לב לבריאות שלהם'],
  evening:            ['יום מוצלח!','עוד יום עבר, מתקדמים 🌙','בוא נסכם'],
  empty:              ['הכל בסדר 🐾'],
  street_search:      ['יצאנו לחפש! 🔍','מחפשים בשכונה...','תמיד אפשר למצוא מישהו צריך בית 🐾'],
  campaign_start:     ['קמפיין פרסום! 📢 יגיעו יותר מבקרים','הרשתות מדברות על המקלט שלנו!'],
  open_day:           ['יום אימוץ פתוח! 🎉 בואו כולם','היום אנחנו פתוחים לכולם!'],
};

// ────────────── STATE ──────────────

const game = {
  user:        null,
  money:       STARTING_MONEY,
  day:         1,
  level:       1,
  reputation:  50,
  animals:     [],
  visitors:    [],
  upgrades:    { catRoom:false, vetClinic:false, playYard:false, volunteers:false, cafe:false },
  totalAdoptions:    0,
  perfectMatches:    0,
  failedAdoptions:   0,
  dayStats: { income:0, expenses:0, adoptions:0 },
  dayPhase:        'morning',     // 'morning' | 'day' | 'evening'
  phaseTime:       0,
  visitorTimer:    0,
  paused:          false,
  speed:           1,             // 1 or 2
  nextAnimalId:    1,
  nextVisitorId:   1,
  dayOps:          { campaign:false, openDay:false },
  campaignActive:  false,
  openDayActive:   false,
};

let lastTick = 0;

// ────────────── UTILS ──────────────

const $  = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const rand = (min, max) => Math.floor(Math.random()*(max-min+1))+min;
const choice = arr => arr[Math.floor(Math.random()*arr.length)];
const pickN = (arr, n) => {
  const c = [...arr]; const r = [];
  for (let i=0; i<n && c.length; i++) r.push(c.splice(Math.floor(Math.random()*c.length),1)[0]);
  return r;
};

async function hashPassword(plain) {
  const enc = new TextEncoder().encode(plain + '_archi_salt');
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// ────────────── AUTH + PERSISTENCE ──────────────

function getUsers()      { return JSON.parse(localStorage.getItem('archi_users')||'{}'); }
function setUsers(u)     { localStorage.setItem('archi_users', JSON.stringify(u)); }
function getSession()    { return localStorage.getItem('archi_session'); }
function setSession(u)   { localStorage.setItem('archi_session', u); }
function clearSession()  { localStorage.removeItem('archi_session'); }
function saveKey(user)   { return 'archi_save_'+user; }

async function trySignup(user, pass) {
  user = user.trim();
  if (user.length < 2) throw new Error('שם משתמש קצר מדי');
  if (pass.length < 3) throw new Error('סיסמה קצרה מדי');
  const users = getUsers();
  if (users[user]) throw new Error('שם משתמש כבר תפוס');
  users[user] = { passwordHash: await hashPassword(pass), createdAt: Date.now() };
  setUsers(users);
  return user;
}

async function tryLogin(user, pass) {
  user = user.trim();
  const users = getUsers();
  if (!users[user]) throw new Error('משתמש לא קיים');
  const hash = await hashPassword(pass);
  if (users[user].passwordHash !== hash) throw new Error('סיסמה שגויה');
  return user;
}

function saveGame() {
  if (!game.user) return;
  const snap = {
    money: game.money, day: game.day, level: game.level,
    reputation: game.reputation, animals: game.animals,
    upgrades: game.upgrades,
    totalAdoptions: game.totalAdoptions, perfectMatches: game.perfectMatches,
    failedAdoptions: game.failedAdoptions,
    nextAnimalId: game.nextAnimalId,
    savedAt: Date.now()
  };
  localStorage.setItem(saveKey(game.user), JSON.stringify(snap));
}

function loadGame(user) {
  const raw = localStorage.getItem(saveKey(user));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function resetGameState() {
  game.money       = STARTING_MONEY;
  game.day         = 1;
  game.level       = 1;
  game.reputation  = 50;
  game.animals     = [];
  game.visitors    = [];
  game.upgrades    = { catRoom:false, vetClinic:false, playYard:false, volunteers:false, cafe:false };
  game.totalAdoptions = 0;
  game.perfectMatches = 0;
  game.failedAdoptions = 0;
  game.nextAnimalId = 1;
  game.nextVisitorId = 1;
  game.dayPhase = 'morning';
  game.phaseTime = 0;
  game.visitorTimer = 0;
  game.dayStats = { income:0, expenses:0, adoptions:0 };
  game.dayOps = { campaign:false, openDay:false };
  game.campaignActive = false;
  game.openDayActive = false;
  // start with a few animals
  for (let i = 0; i < STARTING_ANIMALS; i++) {
    game.animals.push(generateAnimal());
  }
  // ARCHI is always there as mascot — bonus animal that's not adoptable would be cool, but skip for now
}

// ────────────── ANIMAL GENERATION ──────────────

function generateAnimal(opts = {}) {
  const species = opts.species || (Math.random() < 0.6 ? 'dog' : 'cat');
  const ageRoll = Math.random();
  const age = ageRoll < 0.25 ? (species==='dog'?'puppy':'puppy') :
              ageRoll < 0.6  ? 'young' :
              ageRoll < 0.85 ? 'adult' : 'senior';

  const personality = pickN(PERSONALITIES, rand(2, 3));
  const compatTags = [];

  // Generate compat tags from personality + randomness
  if (personality.includes('friendly') || personality.includes('playful')) compatTags.push('good_with_kids','good_with_pets');
  if (personality.includes('calm') || personality.includes('cuddly')) compatTags.push('quiet','calm');
  if (personality.includes('energetic')) compatTags.push('needs_yard','energetic');
  if (personality.includes('lazy') || personality.includes('cuddly')) compatTags.push('apartment_ok');
  if (personality.includes('shy')) compatTags.push('quiet','shy');
  if (personality.includes('protective')) compatTags.push('protective');
  if (personality.includes('independent')) compatTags.push('apartment_ok','independent');
  if (personality.includes('curious')) compatTags.push('curious');
  if (Math.random() < 0.6) compatTags.push(species==='dog' ? 'needs_yard' : 'apartment_ok');

  const fur = choice(FUR_COLORS[species]);
  const energyBase = age === 'puppy' ? 90 : age === 'young' ? 75 : age === 'adult' ? 55 : 35;

  return {
    id: game.nextAnimalId++,
    species,
    name: choice(species==='dog' ? DOG_NAMES : CAT_NAMES),
    breed: choice(species==='dog' ? DOG_BREEDS : CAT_BREEDS),
    age,
    fur,
    personality,
    compatTags: [...new Set(compatTags)],
    stats: {
      health:    rand(70, 95),
      happiness: rand(50, 80),
      trust:     rand(30, 60),
      training:  rand(10, 40),
      energy:    energyBase + rand(-10, 10)
    },
    daysInShelter: 0,
    isNew: true,
    sick: false,
    arrivalStory: choice(ARRIVAL_STORIES),
    todayActions: { fed:false, played:false, trained:false, vet:false, groomed:false, walked:false, advertised:false, photographed:false }
  };
}

// ────────────── VISITOR GENERATION ──────────────

function generateVisitor() {
  const profile = choice(VISITOR_PROFILES);
  return {
    id: game.nextVisitorId++,
    name: choice(VISITOR_NAMES),
    avatar: choice(VISITOR_AVATARS),
    profile,
    patience: 100,    // drops over 30s
    arrivedAt: Date.now()
  };
}

function calculateMatch(animal, visitor) {
  const p = visitor.profile;
  let score = 50; // baseline
  let reasons = [];

  // Species
  if (p.species !== 'any' && p.species !== animal.species) {
    score -= 30; reasons.push(`רצה ${p.species==='dog'?'כלב':'חתול'}`);
  } else if (p.species !== 'any') {
    score += 10;
  }

  // Age
  if (p.age && p.age.includes(animal.age)) score += 10;
  else if (p.age) { score -= 10; reasons.push('גיל לא מתאים'); }

  // Wanted tags
  for (const tag of p.tags) {
    if (animal.compatTags.includes(tag) || animal.personality.includes(tag)) {
      score += 8;
    }
  }

  // Avoided tags
  for (const tag of (p.avoid || [])) {
    if (animal.compatTags.includes(tag) || animal.personality.includes(tag)) {
      score -= 12; reasons.push(`לא רצה ${tag}`);
    }
  }

  // Health threshold
  if (p.healthMin && animal.stats.health < p.healthMin) {
    score -= 20; reasons.push('בריאות נמוכה');
  }
  if (animal.sick && !p.allowSick) {
    score -= 25; reasons.push('חיה חולה');
  }

  // Groomed animals present better
  if (animal.compatTags.includes('groomed')) score += 6;

  // Happiness affects how the animal "presents"
  if (animal.stats.happiness < 30) score -= 10;
  if (animal.stats.happiness > 80) score += 5;

  // Trust matters
  if (animal.stats.trust < 30 && p.experience === 'first_time') {
    score -= 15; reasons.push('דורש ניסיון');
  }

  return { score: Math.max(0, Math.min(100, score)), reasons };
}

// ────────────── ANIMAL CARE ACTIONS ──────────────

function feedAnimal(a) {
  if (a.todayActions.fed) return showToast('כבר האכלת היום', 'warn');
  const cost = FOOD_COST[a.species];
  if (game.money < cost) return showToast('אין מספיק כסף', 'danger');
  game.money -= cost;
  game.dayStats.expenses += cost;
  a.todayActions.fed = true;
  a.stats.health    = Math.min(100, a.stats.health + 5);
  a.stats.happiness = Math.min(100, a.stats.happiness + 3);
  a.stats.trust     = Math.min(100, a.stats.trust + 2);
  showFloatMoney(-cost);
  showHeart();
  saveGame();
  refreshUI();
}

function playWithAnimal(a) {
  if (a.todayActions.played) return showToast('כבר שיחקת היום', 'warn');
  a.todayActions.played = true;
  a.stats.happiness = Math.min(100, a.stats.happiness + 15);
  a.stats.trust     = Math.min(100, a.stats.trust + 5);
  a.stats.energy    = Math.max(0,   a.stats.energy - 5);
  showHeart();
  saveGame();
  refreshUI();
}

function trainAnimal(a) {
  if (a.todayActions.trained) return showToast('כבר אימנת היום', 'warn');
  const cost = 30;
  if (game.money < cost) return showToast('אין מספיק כסף', 'danger');
  game.money -= cost;
  game.dayStats.expenses += cost;
  a.todayActions.trained = true;
  a.stats.training = Math.min(100, a.stats.training + 10);
  a.stats.trust    = Math.min(100, a.stats.trust + 3);
  showFloatMoney(-cost);
  saveGame();
  refreshUI();
}

function groomAnimal(a) {
  if (a.todayActions.groomed) return showToast('כבר טיפחת היום', 'warn');
  a.todayActions.groomed = true;
  a.stats.happiness = Math.min(100, a.stats.happiness + 12);
  a.stats.trust     = Math.min(100, a.stats.trust + 5);
  if (!a.compatTags.includes('groomed')) a.compatTags.push('groomed');
  showHeart();
  showToast(`${a.name} נראה מדהים! ✨`, 'success');
  saveGame();
  refreshUI();
}

function walkAnimal(a) {
  if (a.todayActions.walked) return showToast('כבר יצאתם לטיול היום', 'warn');
  a.todayActions.walked = true;
  a.stats.happiness = Math.min(100, a.stats.happiness + 10);
  a.stats.health    = Math.min(100, a.stats.health + 3);
  a.stats.trust     = Math.min(100, a.stats.trust + 4);
  a.stats.energy    = Math.min(100, a.stats.energy + 5);
  showHeart();
  showToast(`${a.name} נהנה מהטיול! 🌳`, 'success');
  saveGame();
  refreshUI();
}

function advertiseAnimal(a) {
  if (a.todayActions.advertised) return showToast('כבר פרסמת היום', 'warn');
  const cost = 50;
  if (game.money < cost) return showToast('אין מספיק כסף', 'danger');
  game.money -= cost;
  game.dayStats.expenses += cost;
  a.todayActions.advertised = true;
  // Spawn a visitor soon
  game.visitorTimer = Math.max(game.visitorTimer, visitorSpawnInterval() * 0.85);
  game.reputation = Math.min(100, game.reputation + 1);
  showFloatMoney(-cost);
  showToast(`${a.name} פורסם ברשתות! 📸`, 'success');
  saveGame();
  refreshUI();
}

function generateTargetedVisitor(animal) {
  return {
    id: game.nextVisitorId++,
    name: choice(VISITOR_NAMES),
    avatar: choice(VISITOR_AVATARS),
    profile: {
      species: animal.species,
      tags: [...animal.personality.slice(0, 2), ...animal.compatTags.filter(t => t !== 'groomed').slice(0, 2)],
      avoid: [],
      age: [animal.age],
      experience: 'experienced',
      bio: 'ראה את ' + animal.name + ' ברשתות וחייב להכיר! מחפש בדיוק ' + (animal.species === 'dog' ? 'כלב' : 'חתול') + ' כזה.',
    },
    patience: 130,
    arrivedAt: Date.now()
  };
}

function photographAnimal(a) {
  if (a.todayActions.photographed) return showToast('כבר צולם היום', 'warn');
  const cost = 80;
  if (game.money < cost) return showToast('אין מספיק כסף', 'danger');
  if (game.dayPhase !== 'day') return showToast('צילום זמין רק ביום', 'warn');
  if (game.visitors.length >= effectiveMaxVisitors()) return showToast('המקלט מלא במבקרים', 'warn');
  game.money -= cost;
  game.dayStats.expenses += cost;
  a.todayActions.photographed = true;
  const targeted = generateTargetedVisitor(a);
  game.visitors.push(targeted);
  showFloatMoney(-cost);
  showHeart();
  showToast(`${a.name} צולם! מבקר מיוחד בדרך 📸`, 'success');
  saveGame();
  refreshUI();
  openAnimalModal(a.id);
}

function vetAnimal(a) {
  if (a.todayActions.vet) return showToast('כבר טופל היום', 'warn');
  const cost = game.upgrades.vetClinic ? 100 : 200;
  if (game.money < cost) return showToast('אין מספיק כסף', 'danger');
  game.money -= cost;
  game.dayStats.expenses += cost;
  a.todayActions.vet = true;
  a.stats.health = Math.min(100, a.stats.health + 30);
  a.sick = false;
  showFloatMoney(-cost);
  showToast(`${a.name} מטופל ובריא!`, 'success');
  saveGame();
  refreshUI();
}

// ────────────── DAILY OPS ──────────────

function runAdCampaign() {
  const cost = 200;
  if (game.money < cost) return showToast('אין מספיק כסף', 'danger');
  if (game.dayOps.campaign) return showToast('קמפיין כבר פעיל היום', 'warn');
  game.money -= cost;
  game.dayStats.expenses += cost;
  game.dayOps.campaign = true;
  game.campaignActive = true;
  game.reputation = Math.min(100, game.reputation + 10);
  showFloatMoney(-cost);
  showToast('📢 קמפיין פעיל! מבקרים מגיעים מהר יותר', 'success');
  showArchi(choice(ARCHI_MESSAGES.campaign_start));
  saveGame();
  refreshUI();
}

function runOpenDay() {
  const cost = 400;
  if (game.money < cost) return showToast('אין מספיק כסף', 'danger');
  if (game.dayOps.openDay) return showToast('יום פתוח כבר פעיל היום', 'warn');
  game.money -= cost;
  game.dayStats.expenses += cost;
  game.dayOps.openDay = true;
  game.openDayActive = true;
  // Spawn 2 visitors immediately
  if (game.animals.length > 0) {
    for (let i = 0; i < 2; i++) {
      if (game.visitors.length < effectiveMaxVisitors()) {
        game.visitors.push(generateVisitor());
      }
    }
  }
  showFloatMoney(-cost);
  showToast('🎉 יום אימוץ פתוח! מקום ל-6 מבקרים', 'success');
  showArchi(choice(ARCHI_MESSAGES.open_day));
  saveGame();
  refreshUI();
}

function generateStreetAnimal() {
  const a = generateAnimal();
  a.stats.health    = rand(30, 60);
  a.stats.trust     = rand(5, 25);
  a.stats.happiness = rand(20, 50);
  const STREET_STORIES = [
    'נמצא ליד פח זבל בגשם, רועד ומפחד',
    'שוטט ברחוב שבועות, לבד ורעב',
    'נמצא ישן מתחת למכונית, ללא צווארון',
    'מישהו השאיר אותו קשור לעמוד, חיכה שעות',
    'נמצא פצוע ליד כביש, קיבל עזרה ראשונה'
  ];
  a.arrivalStory = choice(STREET_STORIES);
  a.isStreet = true;
  return a;
}

function showStreetSearchModal(found) {
  const capacity = shelterCapacity();
  const current  = game.animals.length;
  const body = $('#streetModalBody');
  body.innerHTML = `
    <h2>🔍 חיפוש ברחוב</h2>
    <div style="text-align:center; color:var(--brown); font-size:13px; margin-bottom:8px;">
      נמצאו ${found.length} חיות • קיבולת: ${current}/${capacity}
    </div>
    <div class="street-animals-grid" id="streetAnimalsGrid">
      ${found.map((a, idx) => `
        <div class="street-animal-card" id="streetCard${idx}">
          ${animalSVG(a)}
          <div class="animal-name">${a.name}</div>
          <div class="animal-info">${a.breed} • ${ageLabel(a.age)}</div>
          <div class="animal-bio" style="font-size:11px; margin:4px 0;">${a.arrivalStory}</div>
          <div class="animal-stats-mini">
            ${miniStat('❤️', a.stats.health)}
            ${miniStat('😊', a.stats.happiness)}
          </div>
          <button class="rescue-btn" id="rescueBtn${idx}" ${current >= capacity ? 'disabled' : ''}>
            ${current >= capacity ? 'מלא 🏠' : 'הצל! 🏠'}
          </button>
        </div>
      `).join('')}
    </div>
  `;
  found.forEach((a, idx) => {
    const btn = body.querySelector(`#rescueBtn${idx}`);
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (game.animals.length >= shelterCapacity()) {
        showToast('המקלט מלא!', 'danger');
        return;
      }
      game.animals.push(a);
      btn.disabled = true;
      btn.textContent = 'הוצל! ✅';
      const card = body.querySelector(`#streetCard${idx}`);
      if (card) card.classList.add('rescued');
      showToast(`${a.name} הוצל! ❤️`, 'success');
      showHeart();
      saveGame();
      refreshUI();
    });
  });
  openModal('streetModal');
}

function runStreetSearch() {
  if (game.dayPhase !== 'day') return showToast('חיפוש ברחוב זמין רק ביום', 'warn');
  const cost = 100;
  if (game.money < cost) return showToast('אין מספיק כסף', 'danger');
  if (game.animals.length >= shelterCapacity()) return showToast('המקלט מלא!', 'danger');
  game.money -= cost;
  game.dayStats.expenses += cost;
  showFloatMoney(-cost);
  showArchi(choice(ARCHI_MESSAGES.street_search));
  const count = rand(1, 3);
  const found = [];
  for (let i = 0; i < count; i++) found.push(generateStreetAnimal());
  saveGame();
  refreshUI();
  showStreetSearchModal(found);
}

// ────────────── DAILY OPS BAR UI ──────────────

function renderDailyOps() {
  const bar = $('#dailyOpsBar');
  if (!bar) return;
  const shelterFull = game.animals.length >= shelterCapacity();
  const isDay = game.dayPhase === 'day';
  bar.innerHTML = `
    <button class="ops-btn ${game.dayOps.campaign ? 'active' : ''}" id="opsCampaign"
      ${game.dayOps.campaign || game.money < 200 ? 'disabled' : ''}>
      📢 קמפיין פרסום
      <span class="ops-cost">${game.dayOps.campaign ? '✓ פעיל' : '₪200'}</span>
    </button>
    <button class="ops-btn ${game.dayOps.openDay ? 'active' : ''}" id="opsOpenDay"
      ${game.dayOps.openDay || game.money < 400 ? 'disabled' : ''}>
      🎉 יום אימוץ פתוח
      <span class="ops-cost">${game.dayOps.openDay ? '✓ פעיל' : '₪400'}</span>
    </button>
    <button class="ops-btn" id="opsStreetSearch"
      ${!isDay || game.money < 100 || shelterFull ? 'disabled' : ''}
      title="${!isDay ? 'זמין רק ביום' : shelterFull ? 'המקלט מלא' : 'חפש חיות ברחוב'}">
      🔍 חיפוש ברחוב
      <span class="ops-cost">₪100</span>
    </button>
  `;
  bar.querySelector('#opsCampaign').addEventListener('click', runAdCampaign);
  bar.querySelector('#opsOpenDay').addEventListener('click', runOpenDay);
  bar.querySelector('#opsStreetSearch').addEventListener('click', runStreetSearch);
}

// ────────────── ADOPTION ──────────────

function attemptAdoption(animalId, visitorId) {
  const a = game.animals.find(x => x.id === animalId);
  const v = game.visitors.find(x => x.id === visitorId);
  if (!a || !v) return;
  const m = calculateMatch(a, v);

  // Calculate price based on match
  let price;
  let category;
  if (m.score >= 80) { price = 800 + rand(0, 700); category = 'great'; }
  else if (m.score >= 60) { price = 300 + rand(0, 300); category = 'good'; }
  else { price = 0; category = 'bad'; }

  // Show match result modal step 2
  showMatchResult(a, v, m, price, category);
}

function confirmAdoption(animalId, visitorId, price, category) {
  const a = game.animals.find(x => x.id === animalId);
  const v = game.visitors.find(x => x.id === visitorId);
  if (!a || !v) return;

  if (category === 'bad') {
    // visitor leaves angry
    game.visitors = game.visitors.filter(x => x.id !== visitorId);
    game.reputation = Math.max(0, game.reputation - 5);
    game.failedAdoptions++;
    showToast('המבקר עזב מאוכזב 😞', 'danger');
    showArchi(choice(ARCHI_MESSAGES.bad_match));
    closeModal('visitorModal');
    saveGame();
    refreshUI();
    return;
  }

  // Successful adoption
  game.money += price;
  game.dayStats.income += price;
  game.dayStats.adoptions++;
  game.totalAdoptions++;
  if (category === 'great') {
    game.perfectMatches++;
    game.reputation = Math.min(100, game.reputation + 4);
  } else {
    game.reputation = Math.min(100, game.reputation + 2);
  }

  // Remove animal + visitor
  game.animals  = game.animals.filter(x => x.id !== animalId);
  game.visitors = game.visitors.filter(x => x.id !== visitorId);

  showFloatMoney(price);
  showHeart();
  showHeart();
  showToast(`${a.name} מצא בית! +₪${price}`, 'success');
  showArchi(choice(ARCHI_MESSAGES.great_match));

  checkLevelUp();
  closeModal('visitorModal');
  saveGame();
  refreshUI();
}

// ────────────── LEVEL UP ──────────────

const LEVEL_UNLOCKS = {
  3:  { key:'catRoom',    label:'חדר חתולים נפרד 🐱', desc:'יותר מקום לחתולים' },
  5:  { key:'vetClinic',  label:'מרפאה וטרינרית 🏥', desc:'חצי מהעלות הוטרינרית' },
  7:  { key:'playYard',   label:'חצר משחקים 🌳', desc:'שמחה לא דועכת מהר' },
  10: { key:'volunteers', label:'מתנדבים 🙋', desc:'חיות מטופלות חלקית אוטומטית' },
  15: { key:'cafe',       label:'קפה למבקרים ☕', desc:'יותר תרומות יומיות' },
};

function checkLevelUp() {
  const newLevel = Math.floor(game.totalAdoptions / 3) + 1;
  if (newLevel > game.level) {
    game.level = newLevel;
    showToast(`🎊 רמה ${game.level}!`, 'success');
    showArchi(choice(ARCHI_MESSAGES.level_up));
    const unlock = LEVEL_UNLOCKS[game.level];
    if (unlock) {
      game.upgrades[unlock.key] = true;
      setTimeout(() => showToast(`🔓 ${unlock.label}`, 'success'), 1200);
    }
  }
}

// ────────────── DAY PHASES ──────────────

function tick(now) {
  if (!game.user) { lastTick = now; requestAnimationFrame(tick); return; }
  const delta = (now - lastTick) * (game.paused ? 0 : game.speed);
  lastTick = now;

  game.phaseTime += delta;

  if (game.dayPhase === 'morning') {
    if (game.phaseTime >= PHASE_MORNING_MS) startDayPhase();
  } else if (game.dayPhase === 'day') {
    game.visitorTimer += delta;
    if (game.visitorTimer >= visitorSpawnInterval() && game.visitors.length < effectiveMaxVisitors()) {
      spawnVisitor();
      game.visitorTimer = 0;
    }
    // Visitor patience drain
    for (const v of game.visitors) {
      v.patience -= (delta / 30000) * 100; // 30s patience
    }
    // Remove impatient visitors
    const before = game.visitors.length;
    game.visitors = game.visitors.filter(v => {
      if (v.patience <= 0) {
        game.reputation = Math.max(0, game.reputation - 3);
        return false;
      }
      return true;
    });
    if (game.visitors.length < before) {
      showToast('מבקר עזב בלי לאמץ 😔', 'warn');
      refreshUI();
    }

    if (game.phaseTime >= PHASE_MORNING_MS + PHASE_DAY_MS) endDayPhase();
  } else if (game.dayPhase === 'evening') {
    if (game.phaseTime >= DAY_LENGTH_MS) showDayEnd();
  }

  updateProgress();
  requestAnimationFrame(tick);
}

function visitorSpawnInterval() {
  const repFactor = 0.8 + (game.reputation / 200);  // 0.8 - 1.3
  return (VISITOR_INTERVAL / repFactor) * (game.campaignActive ? 0.5 : 1);
}

function effectiveMaxVisitors() {
  return MAX_VISITORS + (game.openDayActive ? 2 : 0);
}

function startMorning() {
  game.dayPhase = 'morning';
  game.phaseTime = 0;
  game.dayStats = { income:0, expenses:0, adoptions:0 };
  game.visitors = [];
  game.visitorTimer = 0;
  game.dayOps = { campaign:false, openDay:false };
  game.campaignActive = false;
  game.openDayActive = false;

  // Reset daily flags
  for (const a of game.animals) {
    a.todayActions = { fed:false, played:false, trained:false, vet:false, groomed:false, walked:false, advertised:false, photographed:false };
    a.daysInShelter++;
  }

  // Maybe new animals arrive
  const incoming = rand(0, 2) + (game.day % 5 === 0 ? 1 : 0);
  for (let i = 0; i < incoming; i++) {
    if (game.animals.length < shelterCapacity()) {
      game.animals.push(generateAnimal());
    }
  }

  // Daily decay
  for (const a of game.animals) {
    a.stats.happiness = Math.max(0, a.stats.happiness - (game.upgrades.playYard ? 6 : 10));
    a.stats.health    = Math.max(0, a.stats.health - 2);
    if (game.upgrades.volunteers && Math.random() < 0.5) {
      a.stats.happiness = Math.min(100, a.stats.happiness + 8);
    }
    if (a.stats.health < 30 && Math.random() < 0.3) a.sick = true;
    if (a.daysInShelter > 1) a.isNew = false;
  }

  // ARCHI greeting
  showArchi(choice(game.animals.length === 0 ? ARCHI_MESSAGES.morning_no_animals : ARCHI_MESSAGES.morning_general));
}

function startDayPhase() {
  game.dayPhase = 'day';
  // First visitor often arrives quickly
  game.visitorTimer = visitorSpawnInterval() * 0.5;
  renderDailyOps();
}

function endDayPhase() {
  game.dayPhase = 'evening';
  game.visitors = [];
  renderDailyOps();

  // Daily expenses
  let foodCost = 0;
  for (const a of game.animals) foodCost += FOOD_COST[a.species];
  let staffCost = 200 + (game.upgrades.cafe ? 100 : 0);
  let donations = Math.floor((game.reputation / 100) * (50 + Math.random() * 150) * (game.upgrades.cafe ? 1.5 : 1));

  game.money += donations;
  game.money -= foodCost + staffCost;
  game.dayStats.income += donations;
  game.dayStats.expenses += foodCost + staffCost;

  showArchi(choice(ARCHI_MESSAGES.evening));
}

function shelterCapacity() {
  return 8 + (game.upgrades.catRoom ? 5 : 0) + Math.floor(game.level / 5) * 2;
}

function showDayEnd() {
  $('#dayEndBody').innerHTML = `
    <div class="day-end-row income">
      <span>💰 הכנסות</span><span>+₪${game.dayStats.income}</span>
    </div>
    <div class="day-end-row expense">
      <span>💸 הוצאות</span><span>-₪${game.dayStats.expenses}</span>
    </div>
    <div class="day-end-row total">
      <span>📊 רווח</span><span>${game.dayStats.income - game.dayStats.expenses >= 0 ? '+' : ''}₪${game.dayStats.income - game.dayStats.expenses}</span>
    </div>
    <div class="day-end-row">
      <span>🏠 אימוצים היום</span><span>${game.dayStats.adoptions}</span>
    </div>
    <div class="day-end-row">
      <span>❤️ מוניטין</span><span>${game.reputation}/100</span>
    </div>
    <div class="day-end-row">
      <span>🐾 חיות במקלט</span><span>${game.animals.length} / ${shelterCapacity()}</span>
    </div>
  `;
  openModal('dayEndModal');
  saveGame();
}

function nextDay() {
  game.day++;
  closeModal('dayEndModal');
  startMorning();
  saveGame();
  refreshUI();
}

// ────────────── UI RENDERING ──────────────

function refreshUI() {
  $('#money').textContent      = game.money;
  $('#day').textContent        = game.day;
  $('#level').textContent      = game.level;
  $('#reputation').textContent = game.reputation;
  $('#animalCount').textContent = game.animals.length;
  $('#visitorCount').textContent = game.visitors.length;

  renderAnimals();
  renderVisitors();
  renderDailyOps();
}

function updateProgress() {
  const pct = (game.phaseTime / DAY_LENGTH_MS) * 100;
  $('#dayProgress').style.width = Math.min(100, pct) + '%';
  const labels = { morning: '🌅 בוקר', day: '☀️ יום', evening: '🌙 ערב' };
  $('#phaseLabel').textContent = labels[game.dayPhase];
}

function renderAnimals() {
  const grid = $('#animalsGrid');
  if (game.animals.length === 0) {
    grid.innerHTML = '<p class="empty-msg">אין חיות במקלט - בקרוב יגיעו 🐾</p>';
    return;
  }
  grid.innerHTML = game.animals.map(a => `
    <div class="animal-card" data-id="${a.id}">
      ${a.isNew ? '<span class="new-badge">חדש!</span>' : ''}
      <span class="species-badge">${a.species==='dog'?'🐶':'🐱'}</span>
      ${animalSVG(a)}
      <div class="animal-name">${a.name}</div>
      <div class="animal-info">${a.breed} • ${ageLabel(a.age)}</div>
      <div class="animal-stats-mini">
        ${miniStat('❤️', a.stats.health)}
        ${miniStat('😊', a.stats.happiness)}
        ${a.sick ? '<span class="stat-mini low">🤒</span>' : ''}
      </div>
    </div>
  `).join('');
  grid.querySelectorAll('.animal-card').forEach(el => {
    el.addEventListener('click', () => {
      const id = parseInt(el.dataset.id);
      openAnimalModal(id);
    });
  });
}

function ageLabel(age) {
  return { puppy:'גור', young:'צעיר', adult:'מבוגר', senior:'זקן' }[age] || age;
}

function miniStat(icon, val) {
  const cls = val < 30 ? 'low' : val < 60 ? 'medium' : 'high';
  return `<span class="stat-mini ${cls}">${icon}${val}</span>`;
}

function animalSVG(a) {
  const isDog = a.species === 'dog';
  const body  = a.fur.body;
  const acc   = a.fur.accent;
  // Simple cute SVG
  if (isDog) {
    return `<svg class="animal-svg" viewBox="0 0 100 100">
      <ellipse cx="50" cy="60" rx="32" ry="28" fill="${body}"/>
      <ellipse cx="50" cy="68" rx="13" ry="16" fill="${acc}"/>
      <ellipse cx="28" cy="42" rx="9" ry="14" fill="${body}" transform="rotate(-20 28 42)"/>
      <ellipse cx="72" cy="42" rx="9" ry="14" fill="${body}" transform="rotate(20 72 42)"/>
      <ellipse cx="55" cy="56" rx="11" ry="8" fill="${acc}"/>
      <ellipse cx="58" cy="51" rx="3.5" ry="2.8" fill="#333"/>
      <circle cx="40" cy="44" r="4.5" fill="#fff"/>
      <circle cx="62" cy="42" r="4.5" fill="#fff"/>
      <circle cx="41" cy="45" r="2.8" fill="#222"/>
      <circle cx="63" cy="43" r="2.8" fill="#222"/>
      <circle cx="42" cy="44" r="0.9" fill="#fff"/>
      <circle cx="64" cy="42" r="0.9" fill="#fff"/>
    </svg>`;
  }
  // Cat
  return `<svg class="animal-svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="62" rx="30" ry="26" fill="${body}"/>
    <ellipse cx="50" cy="70" rx="11" ry="13" fill="${acc}"/>
    <polygon points="25,40 30,18 42,32" fill="${body}"/>
    <polygon points="75,40 70,18 58,32" fill="${body}"/>
    <polygon points="28,38 31,24 38,32" fill="${acc}"/>
    <polygon points="72,38 69,24 62,32" fill="${acc}"/>
    <ellipse cx="50" cy="58" rx="8" ry="6" fill="${acc}"/>
    <polygon points="50,52 47,57 53,57" fill="#FF8A80"/>
    <line x1="50" y1="57" x2="50" y2="62" stroke="#333" stroke-width="1"/>
    <circle cx="40" cy="46" r="5" fill="#fff"/>
    <circle cx="60" cy="46" r="5" fill="#fff"/>
    <ellipse cx="40" cy="46" rx="2" ry="4" fill="#2E7D32"/>
    <ellipse cx="60" cy="46" rx="2" ry="4" fill="#2E7D32"/>
    <circle cx="40" cy="45" r="0.8" fill="#fff"/>
    <circle cx="60" cy="45" r="0.8" fill="#fff"/>
    <line x1="40" y1="62" x2="28" y2="60" stroke="#888" stroke-width="0.8"/>
    <line x1="40" y1="64" x2="28" y2="64" stroke="#888" stroke-width="0.8"/>
    <line x1="60" y1="62" x2="72" y2="60" stroke="#888" stroke-width="0.8"/>
    <line x1="60" y1="64" x2="72" y2="64" stroke="#888" stroke-width="0.8"/>
  </svg>`;
}

function renderVisitors() {
  const list = $('#visitorsList');
  if (game.visitors.length === 0) {
    list.innerHTML = '<p class="empty-msg">אין מבקרים כרגע 🌸</p>';
    return;
  }
  list.innerHTML = game.visitors.map(v => {
    const p = v.profile;
    const patClass = v.patience < 30 ? 'danger' : v.patience < 60 ? 'warn' : '';
    return `
      <div class="visitor-card" data-id="${v.id}">
        <div class="visitor-header">
          <div class="visitor-avatar">${v.avatar}</div>
          <div class="visitor-name">${v.name}</div>
        </div>
        <div class="visitor-bio">${p.bio}</div>
        <div class="visitor-tags">
          ${p.species !== 'any' ? `<span class="tag">${p.species==='dog'?'🐶 כלב':'🐱 חתול'}</span>` : '<span class="tag">🐾 גמיש</span>'}
          ${p.experience === 'first_time' ? '<span class="tag">🌱 פעם ראשונה</span>' : ''}
          ${p.special ? '<span class="tag">💝 לב גדול</span>' : ''}
        </div>
        <div class="visitor-patience"><div class="patience-fill ${patClass}" style="width:${v.patience}%"></div></div>
      </div>
    `;
  }).join('');
  list.querySelectorAll('.visitor-card').forEach(el => {
    el.addEventListener('click', () => openVisitorModal(parseInt(el.dataset.id)));
  });
}

function openAnimalModal(id) {
  const a = game.animals.find(x => x.id === id);
  if (!a) return;
  const body = $('#animalModalBody');
  body.innerHTML = `
    <h2>${a.species==='dog'?'🐶':'🐱'} ${a.name}</h2>
    <div style="text-align:center; color:var(--brown); font-size:13px;">${a.breed} • ${ageLabel(a.age)} • ${a.daysInShelter} ימים במקלט</div>
    <div style="display:flex; justify-content:center; margin:8px 0;">${animalSVG(a).replace('animal-svg','animal-modal-svg')}</div>
    <div class="animal-bio">${a.arrivalStory}</div>
    <div class="stats-grid">
      ${statBar('❤️ בריאות', a.stats.health, '#E57373')}
      ${statBar('😊 שמחה',   a.stats.happiness, '#FFB74D')}
      ${statBar('🤝 אמון',   a.stats.trust, '#64B5F6')}
      ${statBar('🎓 אילוף',  a.stats.training, '#81C784')}
    </div>
    <div class="tags-row">
      ${a.personality.map(p => `<span class="tag">${personalityLabel(p)}</span>`).join('')}
      ${a.sick ? '<span class="tag" style="background:#FFCDD2">🤒 חולה</span>' : ''}
    </div>
    <div class="action-row">
      <button class="action-btn" data-act="feed" ${a.todayActions.fed ? 'disabled' : ''}>
        🍖 האכלה <span class="cost">₪${FOOD_COST[a.species]}</span>
      </button>
      <button class="action-btn" data-act="play" ${a.todayActions.played ? 'disabled' : ''}>
        🎾 משחק <span class="cost">חינם</span>
      </button>
      <button class="action-btn" data-act="train" ${a.todayActions.trained ? 'disabled' : ''}>
        🎓 אילוף <span class="cost">₪30</span>
      </button>
      <button class="action-btn" data-act="groom" ${a.todayActions.groomed ? 'disabled' : ''}>
        ✂️ טיפוח <span class="cost">חינם</span>
      </button>
      <button class="action-btn" data-act="walk" ${a.todayActions.walked ? 'disabled' : ''}>
        🌳 טיול <span class="cost">חינם</span>
      </button>
      <button class="action-btn" data-act="advertise" ${a.todayActions.advertised ? 'disabled' : ''}>
        📸 פרסום <span class="cost">₪50</span>
      </button>
      <button class="action-btn" data-act="photograph" ${a.todayActions.photographed ? 'disabled' : ''}>
        📸 צילום <span class="cost">₪80</span>
      </button>
      <button class="action-btn" data-act="vet" ${a.todayActions.vet ? 'disabled' : ''} style="grid-column: span 2;">
        🏥 וטרינר <span class="cost">₪${game.upgrades.vetClinic ? 100 : 200}</span>
      </button>
    </div>
  `;
  body.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.act;
      if (act === 'feed')        feedAnimal(a);
      if (act === 'play')        playWithAnimal(a);
      if (act === 'train')       trainAnimal(a);
      if (act === 'vet')         vetAnimal(a);
      if (act === 'groom')       groomAnimal(a);
      if (act === 'walk')        walkAnimal(a);
      if (act === 'advertise')   advertiseAnimal(a);
      if (act === 'photograph')  photographAnimal(a);
      else if (act !== 'photograph') openAnimalModal(a.id); // refresh
    });
  });
  openModal('animalModal');
}

function statBar(label, val, color) {
  return `<div class="stat-row">
    <div class="stat-row-label">${label} ${val}</div>
    <div class="stat-bar"><div class="stat-bar-fill" style="width:${val}%; background:${color}"></div></div>
  </div>`;
}

function personalityLabel(p) {
  return {
    friendly:'ידידותי',shy:'ביישן',playful:'שובב',lazy:'עצלן',
    cuddly:'מתחבק',independent:'עצמאי',protective:'מגן',curious:'סקרן',
    calm:'רגוע',energetic:'אנרגטי',aggressive:'אגרסיבי',
    groomed:'מטופח ✨'
  }[p] || p;
}

function openVisitorModal(visitorId) {
  const v = game.visitors.find(x => x.id === visitorId);
  if (!v) return;
  const p = v.profile;
  const body = $('#visitorModalBody');
  body.innerHTML = `
    <h2>${v.avatar} ${v.name}</h2>
    <div class="visitor-card-big">
      <div class="visitor-bio-big">"${p.bio}"</div>
      <div class="visitor-tags">
        ${p.species !== 'any' ? `<span class="tag">${p.species==='dog'?'🐶 רוצה כלב':'🐱 רוצה חתול'}</span>` : '<span class="tag">🐾 גמיש</span>'}
        ${p.tags.map(t => `<span class="tag">${tagLabel(t)}</span>`).join('')}
        ${p.experience === 'first_time' ? '<span class="tag">🌱 ראשון</span>' : '<span class="tag">⭐ מנוסה</span>'}
      </div>
    </div>
    <div class="match-instruction">בחר חיה שתתאים ל${v.name} 🐾</div>
    <div class="modal-animals-grid" id="matchGrid">
      ${game.animals.map(a => `
        <div class="animal-card selectable" data-aid="${a.id}">
          <span class="species-badge">${a.species==='dog'?'🐶':'🐱'}</span>
          ${animalSVG(a)}
          <div class="animal-name">${a.name}</div>
          <div class="animal-info">${ageLabel(a.age)}</div>
        </div>
      `).join('') || '<p class="empty-msg">אין חיות במקלט</p>'}
    </div>
  `;
  body.querySelectorAll('.animal-card').forEach(el => {
    el.addEventListener('click', () => {
      const aid = parseInt(el.dataset.aid);
      attemptAdoption(aid, v.id);
    });
  });
  openModal('visitorModal');
}

function tagLabel(t) {
  return {
    good_with_kids:'ילדים', good_with_pets:'חיות אחרות',
    apartment_ok:'דירה', needs_yard:'חצר',
    quiet:'שקט', calm:'רגוע',
    friendly:'ידידותי', cuddly:'מתחבק', shy:'ביישן',
    playful:'שובב', energetic:'אנרגטי', lazy:'נינוח',
    independent:'עצמאי', protective:'מגן', curious:'סקרן',
    groomed:'מטופח ✨'
  }[t] || t;
}

function showMatchResult(animal, visitor, m, price, category) {
  const body = $('#visitorModalBody');
  const labels = { great:'התאמה מצוינת! 💕', good:'התאמה סבירה 👍', bad:'לא מתאים 😬' };
  body.innerHTML = `
    <h2>${visitor.avatar} ${visitor.name} & ${animal.name} ${animal.species==='dog'?'🐶':'🐱'}</h2>
    <div class="match-result ${category}">${labels[category]} (${m.score}%)</div>
    ${m.reasons.length ? `<div class="animal-bio"><strong>הערות:</strong> ${m.reasons.join(' • ')}</div>` : ''}
    ${category === 'bad'
      ? `<div style="text-align:center; color:var(--brown); font-size:14px; margin-bottom:12px;">המבקר יעזוב מאוכזב והמוניטין ירד.</div>`
      : `<div style="text-align:center; color:var(--brown); font-size:14px; margin-bottom:12px;">סכום אימוץ: <strong>₪${price}</strong></div>`
    }
    <div class="confirm-row">
      <button class="btn-secondary" id="cancelMatch">חזרה</button>
      <button class="btn-primary" id="confirmMatch" style="flex:1.5;">
        ${category === 'bad' ? 'בכל זאת' : 'אישור אימוץ ❤️'}
      </button>
    </div>
  `;
  $('#cancelMatch').addEventListener('click', () => openVisitorModal(visitor.id));
  $('#confirmMatch').addEventListener('click', () => confirmAdoption(animal.id, visitor.id, price, category));
}

function spawnVisitor() {
  if (game.animals.length === 0) return; // no point
  game.visitors.push(generateVisitor());
  showArchi(choice(ARCHI_MESSAGES.visitor_arrived));
  refreshUI();
}

// ────────────── UI EFFECTS ──────────────

function showToast(text, kind='success') {
  const t = document.createElement('div');
  t.className = 'toast ' + kind;
  t.textContent = text;
  $('#toastContainer').appendChild(t);
  setTimeout(() => { t.classList.add('fade-out'); }, 2400);
  setTimeout(() => t.remove(), 2800);
}

let archiTimer = null;
function showArchi(text) {
  const bubble = $('#archiBubble');
  bubble.textContent = text;
  bubble.classList.add('visible');
  clearTimeout(archiTimer);
  archiTimer = setTimeout(() => bubble.classList.remove('visible'), 4000);
}

function showFloatMoney(amount) {
  const f = document.createElement('div');
  f.className = 'money-float' + (amount < 0 ? ' negative' : '');
  f.textContent = (amount > 0 ? '+' : '') + '₪' + amount;
  f.style.left = (40 + Math.random() * 80) + '%';
  f.style.top  = '20%';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 1300);
}

function showHeart() {
  const h = document.createElement('div');
  h.className = 'heart-float';
  h.textContent = choice(['❤️','💕','💖','💝']);
  h.style.left = (30 + Math.random() * 40) + '%';
  h.style.top  = (40 + Math.random() * 30) + '%';
  document.body.appendChild(h);
  setTimeout(() => h.remove(), 1600);
}

function openModal(id)  { $('#'+id).classList.remove('hidden'); }
function closeModal(id) { $('#'+id).classList.add('hidden'); }

// ────────────── EVENT WIRING ──────────────

function setupAuthScreen() {
  let mode = 'login';
  $$('.tab-btn').forEach(b => {
    b.addEventListener('click', () => {
      $$('.tab-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      mode = b.dataset.tab;
      $('#authSubmit').textContent = mode === 'login' ? 'כניסה 🐾' : 'הרשמה 🌸';
      $('#authError').textContent = '';
    });
  });

  $('#authForm').addEventListener('submit', async e => {
    e.preventDefault();
    const user = $('#authUser').value;
    const pass = $('#authPass').value;
    $('#authError').textContent = '';
    try {
      const username = mode === 'login' ? await tryLogin(user, pass) : await trySignup(user, pass);
      setSession(username);
      enterGame(username);
    } catch (err) {
      $('#authError').textContent = err.message;
    }
  });
}

function setupGameControls() {
  $('#logoutBtn').addEventListener('click', () => {
    saveGame();
    clearSession();
    location.reload();
  });
  $('#pauseBtn').addEventListener('click', () => {
    game.paused = !game.paused;
    $('#pauseBtn').textContent = game.paused ? '▶️' : '⏸️';
  });
  $('#speedBtn').addEventListener('click', () => {
    game.speed = game.speed === 1 ? 2 : 1;
    $('#speedBtn').textContent = game.speed === 2 ? '🐇' : '🐢';
  });
  $('#nextDayBtn').addEventListener('click', nextDay);
  $$('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.modal').classList.add('hidden'));
  });

  window.addEventListener('beforeunload', saveGame);
}

function enterGame(username) {
  game.user = username;
  const saved = loadGame(username);
  if (saved) {
    Object.assign(game, saved);
    game.visitors = [];
    game.dayPhase = 'morning';
    game.phaseTime = 0;
    game.visitorTimer = 0;
    game.dayStats = { income:0, expenses:0, adoptions:0 };
    game.paused = false;
    game.speed = 1;
    game.dayOps = game.dayOps || { campaign:false, openDay:false };
    game.campaignActive = false;
    game.openDayActive = false;
    showToast(`ברוך השוב, ${username}!`, 'success');
  } else {
    resetGameState();
    showToast(`שלום ${username}, מתחילים מקלט חדש 🐾`, 'success');
  }
  $('#authScreen').classList.add('hidden');
  $('#gameScreen').classList.remove('hidden');
  startMorning();
  refreshUI();
}

// ────────────── BOOTSTRAP ──────────────

function init() {
  setupAuthScreen();
  setupGameControls();

  const session = getSession();
  if (session && getUsers()[session]) {
    enterGame(session);
  }
  requestAnimationFrame(t => { lastTick = t; tick(t); });
}

init();
