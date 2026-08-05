/* ================= CHROMATIC CLICKER ================= */
'use strict';

/* Number formatting lives at the very top on purpose: the achievement list is
   built at load time and names itself with fmt(), so SUF has to already be
   initialised by then. Declared any lower it lands in the temporal dead zone
   and takes the entire script down before a single sprite is painted. */
/* ================= NUMBER FORMAT ================= */
const SUF=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc','Ud','Dd'];
function fmt(n){
  if(!isFinite(n)) return '∞';
  const sign = n<0 ? '−' : ''; n = Math.abs(n);
  if(n<1000) return sign + ((n<10 && n%1!==0) ? n.toFixed(1) : Math.floor(n).toLocaleString());
  let t=0; while(n>=1000 && t<SUF.length-1){n/=1000;t++;}
  return sign + (n<10?n.toFixed(2):n<100?n.toFixed(1):Math.floor(n))+SUF[t];
}
function forgeCost(i){
  return Math.ceil(FORGE[i].cost * Math.pow(1.15, S.forge[i]) * (D.buildCost||1));
}


/* ---- colorize filters applied to the steel blade sprite ---- */
const F = {
  plain: 'none',
  tide : 'drop-shadow(0 0 11px rgba(47,227,255,.6))',
  noct : 'drop-shadow(0 0 13px rgba(176,107,255,.7))',
  myth : 'drop-shadow(0 0 13px rgba(168,192,232,.75))',
  tne  : 'drop-shadow(0 0 15px rgba(125,255,92,.7))',
  mura : 'drop-shadow(0 0 17px rgba(255,46,77,.85))',
  terra: 'drop-shadow(0 0 15px rgba(126,232,96,.75))',
  volc : 'drop-shadow(0 0 17px rgba(255,140,40,.85))',
  hell : 'drop-shadow(0 0 17px rgba(214,32,48,.85))',
  excal: 'drop-shadow(0 0 18px rgba(150,200,255,.8))',
  exo  : 'drop-shadow(0 0 20px rgba(120,255,236,.85))',
  behold:'drop-shadow(0 0 26px rgba(255,120,255,.9))',
  star : 'drop-shadow(0 0 16px rgba(255,79,216,.85))',
  titan: 'drop-shadow(0 0 15px rgba(170,180,255,.8))',
  tex  : 'drop-shadow(0 0 18px rgba(255,215,140,.85))',
  chroma:'drop-shadow(0 0 20px rgba(190,140,255,.85))'
};

/* ---- SWORDS: base click power + passive perks ---- */
const SWORDS = [
  {n:'Wooden Sword',      img:IMG_WOOD1,    px:true, fil:F.plain, cost:0,      pow:1,     col:'#c8a06a', d:'Where every swordsman starts.'},
  {n:'Copper Sword',      img:IMG_COPPER,   px:true, fil:F.plain, cost:200,    pow:8,     col:'#fc9982', d:'Soft metal, hard swing. It will patina.'},
  {n:'Stone Sword',       img:IMG_STONE,    px:true, fil:F.plain, cost:6e3,    pow:70,    col:'#b9b6b2', d:'Chipped from the quarry floor.', crit:4},
  {n:'Ruby Sword',        img:IMG_RED,      px:true, fil:F.plain, cost:150e3,  pow:900,   col:'#ff5a5a', d:'Drinks light and gives none back.', crit:6, forge:30},
  {n:'Emerald Sword',     img:IMG_GREEN,    px:true, fil:F.plain, cost:7e6,    pow:12e3,  col:'#5cf08a', d:'Grown, not forged. Still growing.', all:15, critdmg:2},
  {n:'Diamond Sword',     img:IMG_DIAMOND,  px:true, fil:F.tide,  cost:450e6,  pow:220e3, col:'#2fe3ff', d:'The glint never stops moving.', crit:12, critdmg:3},
  {n:'Cobalt Sword',      img:IMG_PURPLE,   px:true, fil:F.noct,  cost:45e9,   pow:6e6,   col:'#b06bff', d:'Sharpest in the hour before dawn.', all:70, forge:100, crit:8, critdmg:4},
  {n:'Mythril Sword',     img:IMG_MYTHRIL,  px:true, fil:F.myth,  cost:3e12,   pow:1.2e8, col:'#a8c0e8', d:'Lighter than air, heavier than consequence.', crit:10, forge:150},
  {n:"True Night's Edge", img:IMG_TNE,      px:true, fil:F.tne,   cost:250e12, pow:3e9,   col:'#7dff5c', d:'Every blade that came before it, fused into one.', all:120, critdmg:6},
  {n:'Star Wrath',             img:IMG_STARWRATH, px:true, fil:F.star, cost:3e15, pow:1.45e10, col:'#ff4fd8', d:'Pulled down out of the sky, still falling.',
   all:38, critdmg:3, sfx:'starwrath'},
  {n:'Terra Blade',            img:IMG_TERRA,    px:true, fil:F.terra,  cost:4e16, pow:7e10,  col:'#7ee860', d:'Every blade you ever owned, remembered at once.',
   all:40, crit:6, sfx:'terra'},
  {n:'Volcano',                img:IMG_VOLCANO,  px:true, fil:F.volc,   cost:4e18,   pow:1.6e12, col:'#ff8c28', d:'The blade is the eruption. The handle is an afterthought.',
   forge:45, critdmg:3, sfx:'fire'},
  {n:'Titanium Sword',         img:IMG_TITANIUM, px:true, fil:F.titan,  cost:1.7e19,  pow:4.6e12, col:'#b9c2f5', d:'Does not bend, does not dull, does not care.',
   forge:50, crit:5, sfx:'titanium'},
  {n:'True Excalibur',         img:IMG_TRUEXCAL, px:true, fil:F.tex,    cost:7e19,    pow:1.3e13, col:'#ffd98a', d:'The one the stories were actually about.',
   all:50, critdmg:4, sfx:'mythic'},
  {n:"Hell's Judgement",       img:IMG_HELL,     px:true, fil:F.hell,   cost:3e20,   pow:3.8e13, col:'#d62030', d:'Sentence first. Trial never.',
   all:45, crit:6, sfx:'hell'},
  {n:'Murasama',               img:IMG_MURASAMA, px:true, fil:F.mura,   cost:1.6e22,   pow:9e14,  col:'#ff2e4d', d:'Never sheathed. The arcs along the edge never stop.',
   forge:55, crit:8, critdmg:4, sfx:'electric', tall:true, big:true, flip:true, tilt:-18},
  {n:'Iridescent Excalibur',   img:IMG_EXCAL,    px:true, fil:F.excal,  cost:2e24,   pow:2.2e16, col:'#9cc8ff', d:'Drawn from the stone, then from the sky.',
   all:60, critdmg:5, sfx:'holy'},
  {n:'Prismatic Blade',        img:IMG_CHROMA,   px:true, fil:F.chroma, cost:5e25, pow:1.1e17, col:'#c08cff', d:'The whole spectrum, folded into one curve.',
   all:65, crit:8, sfx:'chroma', tall:true, big:true, tilt:-16},
  {n:'Exoblade',               img:IMG_EXO,      px:true, fil:F.exo,    cost:3e26,   pow:6e17, col:'#78ffec', d:'Forged outside the universe, brought in through a crack.',
   all:75, forge:75, sfx:'cosmic'},
  {n:'B E H O L D',            img:IMG_BEHOLD,   px:true, fil:F.behold, cost:1.4e28,   pow:1.4e19, col:'#ff78ff', d:'There is nothing after this one.',
   all:120, forge:120, crit:10, critdmg:8, sfx:'behold', big:true}
];
const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'];

/* ---- FORGE: idle chroma per second ---- */
const FORGE = [
  {n:'Constant-Click',   g:'/',  cost:30,     cps:.3,    d:'Clicks the orb for you, forever. The cheapest way to earn without touching the screen.'},
  {n:'Apprentice Smith', g:'#',  cost:320,    cps:3,     d:'Automatic income. Each one earns about 10x a Constant-Click.'},
  {n:'Prism Anvil',      g:'◆',  cost:4200,   cps:26,    d:'Automatic income. Each one earns about 9x an apprentice smith.'},
  {n:'Rune Furnace',     g:'✦',  cost:55e3,   cps:190,   d:'Automatic income. Each one earns about 7x a prism anvil.'},
  {n:'Astral Kiln',      g:'◈',  cost:750e3,  cps:1500,  d:'Automatic income. Each one earns about 8x a rune furnace.'},
  {n:'Chroma Reactor',   g:'⬡',  cost:11e6,   cps:12e3,  d:'Automatic income. Each one earns about 8x an astral kiln.'},
  {n:'Starforge',        g:'✷',  cost:180e6,  cps:105e3, d:'Automatic income. Each one earns about 9x a chroma reactor.'},
  {n:'Singularity Anvil',g:'●',  cost:3.4e9,  cps:900e3, d:'Automatic income. Each one earns about 9x a starforge.'},
  {n:'Spectrum Loom',    g:'▤',  cost:75e9,   cps:8.2e6, d:'Automatic income. Each one earns about 9x a singularity anvil.'},
  {n:'The First Colour', g:'✧',  cost:1.6e12, cps:78e6,  d:'Automatic income. Each one earns about 9x a spectrum loom.'},
  {n:'Chromasmith Choir',g:'♫',  cost:4e13,   cps:800e6, d:'Automatic income. Each one earns about 10x the first colour.'},
  {n:'Nova Crucible',    g:'✺',  cost:2e15,   cps:1.6e10,d:'Automatic income. Each one earns about 20x a chromasmith choir.'},
  {n:'Continuum Press',  g:'⧉',  cost:1e17,   cps:350e9, d:'Automatic income. Each one earns about 22x a nova crucible.'},
  {n:'The Unmade Anvil', g:'◉',  cost:6e18,   cps:8.5e12,d:'Automatic income. Each one earns about 24x a continuum press.'},
  {n:'Godspring',        g:'✵',  cost:4e20,   cps:240e12,d:'Automatic income. Each one earns about 28x the unmade anvil.'},
  {n:'Aleph Kiln',       g:'⟁',  cost:3e22,   cps:7.5e15,d:'Automatic income. Each one earns about 31x a godspring.'},
  {n:'The Long Noon',    g:'☀',  cost:2.5e24, cps:2.6e17,d:'Automatic income. The strongest earner in the forge.'}
];

/* ---- RUNES: one-time upgrades ---- */
const RUNES = [
  {n:'Honing Oil',         cost:800,    tag:'Clicks',     d:'Doubles the chroma you get from every orb click.',                       f:s=>s.clickMult*=2},
  {n:'Bellows',            cost:5e3,    tag:'Forge',      d:'Doubles everything your forge earns per second.',                        f:s=>s.forgeMult*=2},
  {n:'Rune Etching',       cost:30e3,   tag:'Clicks',     d:'Doubles click chroma a second time, on top of Honing Oil.',              f:s=>s.clickMult*=2},
  {n:'Focused Strikes',    cost:120e3,  tag:'Crits',      d:'Adds 6% crit chance. A crit multiplies that single click.',              f:s=>s.crit+=6},
  {n:'Ley Conduit',        cost:600e3,  tag:'Forge',      d:'Multiplies forge income by 2.5.',                                        f:s=>s.forgeMult*=2.5},
  {n:'Prism Lens',         cost:3e6,    tag:'Clicks',     d:'Triples the chroma you get from every click.',                           f:s=>s.clickMult*=3},
  {n:"Executioner's Edge", cost:14e6,   tag:'Crits',      d:'Crits hit 3x harder, added to your current crit power.',                 f:s=>s.critDmg+=3},
  {n:'Chromatic Attunement',cost:90e6,  tag:'Everything', d:'Multiplies all chroma by 1.6 — clicks and forge together.',              f:s=>s.allMult*=1.6},
  {n:'Starlight Quench',   cost:700e6,  tag:'Forge',      d:'Triples forge income.',                                                  f:s=>s.forgeMult*=3},
  {n:'Resonant Core',      cost:5e9,    tag:'Clicks',     d:'Quadruples the chroma you get from every click.',                        f:s=>s.clickMult*=4},
  {n:'Absolute Focus',     cost:40e9,   tag:'Crits',      d:'Adds 10% crit chance.',                                                  f:s=>s.crit+=10},
  {n:'Mote Magnetism',     cost:300e9,  tag:'Motes',      d:'Halves the 5-15 minute wait between prism motes.',          f:s=>s.moteRate=.5},
  {n:'Spectrum Overdrive', cost:4e12,   tag:'Everything', d:'Multiplies all chroma by 2.5 — clicks and forge together.',              f:s=>s.allMult*=2.5},
  {n:'The Last Wavelength',cost:60e12,  tag:'Everything', d:'Multiplies all chroma by 3 and adds 3x to crit power.',                  f:s=>{s.allMult*=3;s.critDmg+=3}},
  {n:'Prism Cascade',      cost:900e12, tag:'Everything', d:'Multiplies all chroma by 2.',                                            f:s=>s.allMult*=2},
  {n:'Ninefold Edge',      cost:9e16,   tag:'Clicks',     d:'Multiplies click chroma by 3.',                                          f:s=>s.clickMult*=3},
  {n:'Eternal Bellows',    cost:8e18,   tag:'Forge',      d:'Multiplies forge income by 3.',                                          f:s=>s.forgeMult*=3},
  {n:'The Final Colour',   cost:6e20,   tag:'Everything', d:'Multiplies all chroma by 2.5 and adds 4x to crit power.',                f:s=>{s.allMult*=2.5;s.critDmg+=4}}
];

/* ================= BUILDING TIERS =================
   The thing that makes Cookie Clicker's shop never empty: every building has its
   own upgrade ladder, unlocked by owning enough of it. Each rung doubles that one
   building. Seventeen buildings x six rungs = 102 purchasables that arrive
   staggered right through a run, so there is nearly always something turning
   affordable in the next thirty seconds. */
const BTIER = [
  {at:10,  f:60,     n:'Honed'},
  {at:25,  f:520,    n:'Tempered'},
  {at:50,  f:16e3,   n:'Runebound'},
  {at:100, f:1.8e7,  n:'Ascendant'},
  {at:150, f:1.9e10, n:'Transcendent'},
  {at:200, f:2e13,   n:'Absolute'}
];
/* stable id so a save survives the roster changing under it */
const btId    = (b,t) => b+':'+t;
const btCost  = (b,t) => Math.ceil(FORGE[b].cost * BTIER[t].f * (D.buildCost||1));
const btHas   = (b,t) => (S.btier||[]).includes(btId(b,t));
const btCount = b => BTIER.reduce((a,_,t)=>a+(btHas(b,t)?1:0),0);

/* ---- the Constant-Click ladder ----
   Clicking dies in every idle game unless it scales with the rest of the board.
   Cookie Clicker fixes this with Thousand Fingers; this is the same idea. Each
   Constant-Click earns extra for every OTHER forge building you own, so a big
   idle empire quietly makes your first building matter again. */
const FINGERS = [
  {n:'Second Hand',      cost:9e3,   add:.05,
   d:'Each Constant-Click earns +0.05/s for every other forge building you own.'},
  {n:'Restless Hands',   cost:450e3, add:.5,
   d:'Each Constant-Click earns a further +0.5/s per other building.'},
  {n:'Hundred Hands',    cost:24e6,  add:6,
   d:'Each Constant-Click earns a further +6/s per other building.'},
  {n:'Blurred Hands',    cost:3e9,   add:70,
   d:'Each Constant-Click earns a further +70/s per other building.'},
  {n:'Ten Thousand Hands',cost:900e12,add:9e3,
   d:'Each Constant-Click earns a further +9K/s per other building.'},
  {n:'The Unseen Hand',  cost:2e18,  add:12e6,
   d:'Each Constant-Click earns a further +12M/s per other building.'}
];
const fingerBonus = () => {
  const others = S.forge.reduce((a,c,i)=>i?a+c:a, 0);
  return (S.fingers||[]).reduce((a,i)=>a+(FINGERS[i]?FINGERS[i].add:0),0) * others;
};

/* ================= REFRACTION (PRESTIGE) =================
   The wall this game used to hit: you bought B E H O L D and there was nothing
   after it. Refracting shatters the run — chroma, forge, runes and the sword
   rack all go back to zero — and pays out Prism Shards scaled off every point of
   chroma you have ever earned, across every run.

   Two separate numbers, the way Cookie Clicker splits prestige level from
   heavenly chips: `refr` is your lifetime shard count and never falls, so the
   permanent multiplier it grants can't be spent away. `shards` is the loose
   change you actually pay the Afterglow with.

   Cube root, so each further shard costs eight times the chroma of the last —
   that's what stops a long run from trivialising the next one. */
const REFR_BASE = 1e12;              // chroma-ever per first shard
const REFR_OPEN = 1e12;              // tab appears once you've earned this much
const shardsAt  = ever => Math.floor(Math.cbrt(Math.max(0, ever) / REFR_BASE));

/* lifetime chroma without touching a single `S.total +=` site: each refraction
   banks the finished run into totalBase and zeroes the live counter */
const totalEver = () => (S.totalBase || 0) + S.total;
const shardsReady = () => Math.max(0, shardsAt(totalEver()) - (S.refr || 0));
const refrOpen = () => totalEver() >= REFR_OPEN || (S.refr || 0) > 0;

/* ---- AFTERGLOW: permanent upgrades bought with shards ---- */
const AFTER = [
  {n:'Afterimage',        cost:1,   tag:'Head start',
   d:'Every refraction from now on begins with 500K chroma already in hand.',
   f:P=>P.startChroma+=500e3},
  {n:'Muscle Memory',     cost:3,   tag:'Clicks',
   d:'Your arm remembers the swing. Triples click chroma in every run.',
   f:P=>P.clickMult*=3},
  {n:'Banked Heat',       cost:6,   tag:'Away',
   d:'The forge keeps 80% of its output while you are away, instead of half.',
   f:P=>P.offRate=Math.max(P.offRate,.8)},
  {n:'The Long Vault',    cost:12,  tag:'Away',
   d:'Away earnings keep accruing for a full day instead of eight hours.',
   f:P=>P.offCap=Math.max(P.offCap,24)},
  {n:'Shard Resonance',   cost:20,  tag:'Shards',
   d:'Every Prism Shard you own is worth +1.5% all chroma instead of +1%.',
   f:P=>P.shardWorth=.015},
  {n:'Mote Memory',       cost:35,  tag:'Motes',
   d:'Prism motes fall twice as often, in every run, forever.',
   f:P=>P.moteRate*=.5},
  {n:'Kept Edge',         cost:60,  tag:'Head start',
   d:'Refracting no longer takes your swords. The whole rack carries over.',
   f:P=>P.keepSwords=true},
  {n:'Forge Memory',      cost:110, tag:'Head start',
   d:'Begin every refraction with 15 of each of the first six forge buildings.',
   f:P=>P.startForge=Math.max(P.startForge,15)},
  {n:'Prismbind',         cost:200, tag:'Everything',
   d:'All chroma ×3, permanently, on top of everything else.',
   f:P=>P.allMult*=3},
  {n:'The Unbroken Light',cost:400, tag:'Everything',
   d:'All chroma ×5 and +5 crit power. Nothing is louder than this.',
   f:P=>{P.allMult*=5; P.critDmgAdd+=5}}
];

function afterEffects(){
  const P = {allMult:1, clickMult:1, moteRate:1, critDmgAdd:0, shardWorth:.01,
             offRate:0, offCap:0, startChroma:0, startForge:0, keepSwords:false};
  (S.after||[]).forEach(i=>{ if(AFTER[i]) AFTER[i].f(P); });
  return P;
}

/* what the shard count is actually multiplying by right now */
function refrBonus(){
  const P = D.after || afterEffects();
  return 1 + (S.refr || 0) * P.shardWorth;
}

function refract(){
  const gain = shardsReady();
  if(gain <= 0) return false;
  const P = afterEffects();

  S.totalBase = totalEver();          // bank the finished run
  S.refr   = shardsAt(S.totalBase);   // lifetime count — only ever climbs
  S.shards = (S.shards || 0) + gain;

  /* the run itself goes back to nothing */
  S.total  = 0;
  S.chroma = P.startChroma;
  S.forge  = new Array(FORGE.length).fill(0);
  if(P.startForge) for(let i=0;i<6 && i<FORGE.length;i++) S.forge[i] = P.startForge;
  S.runes  = [];
  /* building ladders are run upgrades, so they go with the run — deeds and
     the burst counter are lifetime records and stay */
  S.btier  = [];
  S.fingers= [];
  S.dim    = [];
  if(!P.keepSwords){ S.owned = [0]; S.sword = 0; }
  /* holdings are indexed off the income of the run that bought them, so they
     have to clear — otherwise old shares cash out at old-run prices */
  S.mkt = freshMarket();
  S.frenzyUntil = 0; S.furyUntil = 0; S.furyPow = 1;
  S.treeCd = 0;                        // the tree itself carries over

  buildDimmers();
  recompute(); checkAch(); paintBlade(); paintHUD(); paintShop(); markDirty();
  return gain;
}


/* ================= ACHIEVEMENTS & MILK =================
   Every deed is worth a permanent slice of production, so the completionist
   track and the power track are the same track — which is exactly why Cookie
   Clicker's achievements feel like progress instead of badges. */
const MILK_PER = .02;                      // all chroma, per deed earned
const MILK = [
  {at:0,   n:'Clear Light'},   {at:.06, n:'Pale Rose'},
  {at:.14, n:'Amber'},         {at:.24, n:'Verdant'},
  {at:.34, n:'Cyan'},          {at:.44, n:'Cobalt'},
  {at:.54, n:'Violet'},        {at:.64, n:'Crimson'},
  {at:.74, n:'Gold'},          {at:.84, n:'Iridescent'},
  {at:.92, n:'Prismatic'},     {at:1,   n:'The Whole Spectrum'}
];
function milkTier(){
  const f = ACH.length ? (S.ach||[]).length/ACH.length : 0;
  let m = MILK[0];
  MILK.forEach(t=>{ if(f>=t.at) m=t; });
  return {name:m.n, frac:f};
}

const ACH = (()=>{
  const A=[], add=(id,n,cat,d,test)=>A.push({id,n,cat,d,test});
  const step = n => n.toLocaleString();

  [1e3,1e5,1e7,1e9,1e12,1e15,1e18,1e21,1e24,1e27,1e30,1e33].forEach((v,k)=>
    add('chr'+k, `Chroma ${fmt(v)}`, 'Chroma',
      `Earn ${fmt(v)} chroma in one refraction.`, ()=>S.total>=v));

  [100,1e3,1e4,5e4,1e5,5e5,1e6,5e6,25e6].forEach((v,k)=>
    add('clk'+k, `${fmt(v)} strikes`, 'Strikes',
      `Strike the orb ${step(v)} times.`, ()=>S.clicks>=v));

  [10,250,5e3,5e4,5e5,5e6,5e7].forEach((v,k)=>
    add('crt'+k, `${fmt(v)} crits`, 'Strikes',
      `Land ${step(v)} critical hits.`, ()=>S.crits>=v));

  [5,8,10,13,16].forEach((v,k)=>
    add('cps'+k, `${v} strikes a second`, 'Strikes',
      `Reach ${v} clicks per second.`, ()=>(S.bestCps||0)>=v));

  [100,1e4,1e6,1e9,1e12,1e15,1e18,1e21,1e24,1e27].forEach((v,k)=>
    add('for'+k, `Forge ${fmt(v)}/s`, 'Forge',
      `Reach ${fmt(v)} chroma per second.`, ()=>D.cps>=v));

  /* the bulk of the list: seven rungs on every building, exactly the way
     Cookie Clicker paces its own building achievements */
  FORGE.forEach((f,b)=>{
    [1,10,25,50,100,150,200].forEach((n,k)=>
      add(`b${b}_${k}`, `${n} \u00d7 ${f.n}`, 'Forge',
        `Own ${step(n)} ${f.n}${n===1?'':'s'}.`, ()=>S.forge[b]>=n));
  });

  [50,200,500,1e3,2e3,3400].forEach((v,k)=>
    add('all'+k, `${step(v)} buildings`, 'Forge',
      `Own ${step(v)} forge buildings at once.`,
      ()=>S.forge.reduce((a,c)=>a+c,0)>=v));

  SWORDS.forEach((w,i)=>
    add('sw'+i, w.n, 'Armory', `Forge the ${w.n}.`, ()=>S.owned.includes(i)));

  [1,5,10,14,RUNES.length].forEach((v,k)=>
    add('rn'+k, `${v} rune${v===1?'':'s'}`, 'Runes',
      `Bind ${v} rune${v===1?'':'s'} in one refraction.`, ()=>S.runes.length>=v));

  [1,5,25,100,500,2e3,1e4].forEach((v,k)=>
    add('mt'+k, `${step(v)} mote${v===1?'':'s'}`, 'Motes',
      `Catch ${step(v)} prism motes.`, ()=>S.motes>=v));

  [1,10,50,250,1e3].forEach((v,k)=>
    add('dm'+k, `${step(v)} burst`, 'Dimmers',
      `Burst ${step(v)} dimmer${v===1?'':'s'}.`, ()=>(S.bursts||0)>=v));

  [1e6,1e9,1e12,1e16,1e20].forEach((v,k)=>
    add('mk'+k, `${fmt(v)} realised`, 'Exchange',
      `Realise ${fmt(v)} chroma of trading profit.`, ()=>(S.mkt.realised||0)>=v));

  [1,2,3].forEach((v,k)=>
    add('tr'+k, `${v} slotted`, 'Tree',
      `Fill ${v} Prism Tree slot${v===1?'':'s'}.`, ()=>(D.tree?D.tree.filled:0)>=v));

  [1,3,10,25,50].forEach((v,k)=>
    add('rf'+k, `${v} refraction${v===1?'':'s'}`, 'Refraction',
      `Refract ${v} time${v===1?'':'s'}.`, ()=>(S.refractions||0)>=v));

  [1,10,100,1e3,1e4,1e5].forEach((v,k)=>
    add('sh'+k, `${step(v)} shard${v===1?'':'s'}`, 'Refraction',
      `Hold ${step(v)} lifetime prism shard${v===1?'':'s'}.`, ()=>(S.refr||0)>=v));

  [1,5,AFTER.length].forEach((v,k)=>
    add('ag'+k, `${v} afterglow`, 'Refraction',
      `Keep ${v} Afterglow upgrade${v===1?'':'s'}.`, ()=>(S.after||[]).length>=v));

  /* every rung of every ladder bought */
  add('btAll', 'Every ladder climbed', 'Forge',
    'Own every building tier upgrade at once.',
    ()=>(S.btier||[]).length >= FORGE.length*BTIER.length);
  add('fgAll', 'Every hand', 'Forge',
    'Buy the whole Constant-Click line.',
    ()=>(S.fingers||[]).length >= FINGERS.length);

  return A;
})();
const achById = Object.fromEntries(ACH.map(a=>[a.id,a]));

let achQueue=[], achFlush=null;
function checkAch(){
  const have = new Set(S.ach||[]);
  let got=0;
  for(const a of ACH){
    if(have.has(a.id)) continue;
    let ok=false;
    try{ ok=!!a.test(); }catch(e){}
    if(ok){ S.ach.push(a.id); achQueue.push(a.n); got++; }
  }
  if(!got) return;
  recompute(); paintHUD();
  /* a refraction or a big purchase can trip a dozen at once — one toast, not
     twelve stacked on top of each other */
  clearTimeout(achFlush);
  achFlush=setTimeout(()=>{
    const q=achQueue; achQueue=[];
    if(!q.length) return;
    SFX.rune();
    toast(q.length===1 ? `Deed earned — ${q[0]}`
                       : `${q.length} deeds earned — ${q.slice(0,2).join(', ')} and more`);
    markDirty();
  }, 260);
}


/* ================= THE SPECTRUM EXCHANGE =================
   Motes are the capital here, chroma is the payout. A share costs motes in
   proportion to its price — cheap pigments cost fewer motes — and sells for
   chroma at whatever the price has become. Flipping instantly is always a small
   loss after the fee, so the only way to profit is to buy a pigment while it sits
   below its usual level and sell it above. The exchange is what turns a slow
   trickle of motes into real income. */
const PIG = [
  {n:'Cinder',   sym:'CIN', col:'#ff6b4a', base:52, vol:.075, d:'Burnt orange, scraped from spent forges. Moves with the heat.'},
  {n:'Verdant',  sym:'VRD', col:'#7ee860', base:44, vol:.052, d:'The steady one. Small swings, few surprises.'},
  {n:'Azure',    sym:'AZR', col:'#2fe3ff', base:66, vol:.095, d:'Expensive and restless. Traders love it and lose to it.'},
  {n:'Obsidian', sym:'OBS', col:'#b06bff', base:38, vol:.135, d:'Nobody agrees on what sets its price. It moves anyway.'}
];
const MKT_TICK  = 5000;   // ms between price moves
const MKT_FEE   = .02;    // taken on every sale
const MKT_UNLOCK= 5e8;    // total chroma earned before the floor opens
const PAR       = 50;     // a share at this price costs exactly one mote

/* ================= THE PRISM TREE =================
   Three slots, five powers. Every power is a real buff paired with a real cost,
   and both scale with how deep you slot it — the Crown gives everything and takes
   everything, the Root barely does either. Swapping costs chroma and locks the
   tree briefly, so a placement is a decision rather than a toggle. */
const SLOTS = [
  {n:'Crown', k:1,  d:'Full strength. The whole blessing and the whole cost.'},
  {n:'Bough', k:.6, d:'Six tenths of the blessing, six tenths of the cost.'},
  {n:'Root',  k:.3, d:'Three tenths of each. A cheap way to borrow a little.'}
];
const TREE_UNLOCK = 5e11;
const TREE_CD     = 90e3;  // ms lock after any change

const pct = v => Math.round(v*100)+'%';
const GODS = [
  {n:'Electric', g:'⚡', col:'#ffd166',
   d:'Current runs through every building at once. Your sword arm goes numb.',
   up:k=>`Forge output ×${(1+1.5*k).toFixed(2)}`,
   dn:k=>`Click power ×${(1-.5*k).toFixed(2)}`,
   f:(T,k)=>{ T.forgeMult*=1+1.5*k; T.clickMult*=1-.5*k; }},

  {n:'Flame', g:'✷', col:'#ff8c28',
   d:'Every strike lands like an eruption. Burns twice as bright, half as long.',
   up:k=>`Click power ×${(1+2*k).toFixed(2)} · frenzy strikes ×${(2+3*k).toFixed(1)}`,
   dn:k=>`Forge output ×${(1-.4*k).toFixed(2)} · frenzies last ${pct(1-.5*k)} as long`,
   f:(T,k)=>{ T.clickMult*=1+2*k; T.frenzyPow+=3*k; T.forgeMult*=1-.4*k; T.frenzyDur*=1-.5*k; }},

  {n:'Quake', g:'◉', col:'#7ee860',
   d:'The ground gives up its metal cheaply. Nothing you swing lands clean.',
   up:k=>`Forge buildings cost ${pct(.35*k)} less`,
   dn:k=>k>=1?'Crits never land':`Crit chance ×${(1-k).toFixed(2)}`,
   f:(T,k)=>{ T.buildCost*=1-.35*k; T.critMult*=1-k; }},

  {n:'Void', g:'●', col:'#b06bff',
   d:'It works hardest when nobody is watching. It resents being watched.',
   up:k=>`Away earnings ${pct(.5+.5*k)} rate, up to ${Math.round(8+8*k)}h`,
   dn:k=>`All chroma while you're here ×${(1-.3*k).toFixed(2)}`,
   f:(T,k)=>{ T.offRate=Math.max(T.offRate,.5+.5*k); T.offCap=Math.max(T.offCap,8+8*k); T.allMult*=1-.3*k; }},

  {n:'Light', g:'✧', col:'#2fe3ff',
   d:'Motes fall like rain, and each one lands heavier. None of them ever catch fire.',
   up:k=>`Motes ${(1/(1-.5*k)).toFixed(1)}x as often · surges ×${(1+2*k).toFixed(2)} · banked ×${(1+k).toFixed(2)} · vault ×${(1+k).toFixed(2)}`,
   dn:k=>k>=1?'Motes never ignite — no frenzy, no fury':`Frenzy and fury ${pct(1-k)} as likely`,
   f:(T,k)=>{ T.moteRate*=1-.5*k; T.moteGain*=1+2*k; T.vault*=1+k; T.frenzyOdds*=1-k; }}
];

/* ================= SOUND =================
   Everything is synthesised with the Web Audio API — no audio files to load. */
const SFX = (()=>{
  let ctx=null, master=null, noise=null, lastSlash=0;
  const st={on:true};
  function ac(){
    try{
      if(!ctx){
        const C = window.AudioContext||window.webkitAudioContext;
        if(!C) return null;
        ctx = new C();
        master = ctx.createGain(); master.gain.value=.5;
        const comp = ctx.createDynamicsCompressor();
        master.connect(comp).connect(ctx.destination);
      }
      if(ctx.state==='suspended') ctx.resume();
      return ctx;
    }catch(e){ return null; }
  }
  function noiseBuf(c){
    if(noise) return noise;
    const n=Math.floor(c.sampleRate*.6), b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0);
    for(let i=0;i<n;i++) d[i]=Math.random()*2-1;
    return (noise=b);
  }
  function tone(c,{type='sine',f=440,f2=0,at=0,dur=.2,vol=.2}){
    const o=c.createOscillator(), g=c.createGain(), t0=c.currentTime+at;
    o.type=type;
    o.frequency.setValueAtTime(f,t0);
    if(f2) o.frequency.exponentialRampToValueAtTime(Math.max(f2,1),t0+dur);
    g.gain.setValueAtTime(.0001,t0);
    g.gain.exponentialRampToValueAtTime(vol,t0+.01);
    g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    o.connect(g).connect(master); o.start(t0); o.stop(t0+dur+.03);
  }
  function swoosh(c,{at=0,dur=.18,vol=.25,f=2600,f2=480,q=1.2}){
    const src=c.createBufferSource(); src.buffer=noiseBuf(c);
    const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=q;
    const g=c.createGain(), t0=c.currentTime+at;
    bp.frequency.setValueAtTime(f,t0);
    bp.frequency.exponentialRampToValueAtTime(f2,t0+dur);
    g.gain.setValueAtTime(.0001,t0);
    g.gain.exponentialRampToValueAtTime(vol,t0+.014);
    g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    src.connect(bp).connect(g).connect(master); src.start(t0); src.stop(t0+dur+.03);
  }
  /* arcing-current slash: detuned saw cluster that jumps pitch, plus a crackle burst */
  function electric(c,crit){
    const t=c.currentTime, dur=crit?.34:.2;
    for(let v=0; v<3; v++){
      const o=c.createOscillator(), g=c.createGain();
      o.type = v===2 ? 'square' : 'sawtooth';
      const t0=t+v*.011;
      o.frequency.setValueAtTime(90+v*40, t0);
      const steps=crit?9:6;
      for(let k=1;k<=steps;k++) o.frequency.setValueAtTime(240+Math.random()*2600, t0+k*(dur/steps));
      g.gain.setValueAtTime(.0001,t0);
      g.gain.exponentialRampToValueAtTime(crit?.11:.075, t0+.008);
      g.gain.exponentialRampToValueAtTime(.0001, t0+dur);
      o.connect(g).connect(master); o.start(t0); o.stop(t0+dur+.03);
    }
    const src=c.createBufferSource(); src.buffer=noiseBuf(c);
    const hp=c.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=2400;
    const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=6;
    bp.frequency.setValueAtTime(5200,t);
    bp.frequency.exponentialRampToValueAtTime(1400,t+dur);
    const g2=c.createGain();
    g2.gain.setValueAtTime(.0001,t);
    g2.gain.exponentialRampToValueAtTime(crit?.26:.17,t+.01);
    g2.gain.exponentialRampToValueAtTime(.0001,t+dur);
    src.connect(hp).connect(bp).connect(g2).connect(master); src.start(t); src.stop(t+dur+.03);
    tone(c,{type:'sine',f:crit?180:150,f2:60,dur:.16,vol:.12});
    if(crit) tone(c,{type:'sawtooth',f:2400,f2:180,at:.05,dur:.3,vol:.07});
  }
  /* ---- one signature sound per high-tier blade ---- */
  function terraSlash(c,crit){                    // crystalline, growing, alive
    const t=c.currentTime;
    swoosh(c,{dur:.2,vol:.14,f:3000,f2:900,q:2.4});
    [659.25,987.77,1318.51,1975.53].forEach((f,i)=>
      tone(c,{type:'sine',f,at:i*.045,dur:crit?.75:.45,vol:crit?.11:.08}));
    tone(c,{type:'triangle',f:329.63,dur:.5,vol:.07});
    if(crit) tone(c,{type:'sine',f:2637,at:.18,dur:.8,vol:.07});
  }
  function fireSlash(c,crit){                     // roaring updraft + crackle
    const dur=crit?.5:.32, t=c.currentTime;
    const src=c.createBufferSource(); src.buffer=noiseBuf(c);
    const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.Q.value=3;
    lp.frequency.setValueAtTime(4200,t); lp.frequency.exponentialRampToValueAtTime(260,t+dur);
    const g=c.createGain();
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(crit?.34:.24,t+.03);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    src.connect(lp).connect(g).connect(master); src.start(t); src.stop(t+dur+.03);
    tone(c,{type:'sine',f:70,f2:38,dur:dur+.15,vol:.2});         // rumble
    for(let i=0;i<(crit?7:4);i++)                                 // embers popping
      tone(c,{type:'square',f:900+Math.random()*1800,at:.04+Math.random()*dur*.7,dur:.05,vol:.035});
  }
  function hellSlash(c,crit){                     // a verdict, downward
    const dur=crit?.6:.4;
    [58,58.6,87].forEach((f,i)=>
      tone(c,{type:'sawtooth',f,f2:f*.45,at:i*.014,dur,vol:crit?.15:.11}));
    tone(c,{type:'square',f:233.08,f2:110,dur:dur*.7,vol:.07});
    swoosh(c,{dur:.26,vol:.2,f:1500,f2:180,q:1.6});
    if(crit) tone(c,{type:'sawtooth',f:1174,f2:130,at:.06,dur:.45,vol:.07});
  }
  function holySlash(c,crit){                     // a major chord, opened wide
    swoosh(c,{dur:.22,vol:.13,f:4200,f2:1400,q:2});
    [523.25,659.25,783.99,1046.5].forEach(f=>
      tone(c,{type:'triangle',f,dur:crit?.9:.55,vol:crit?.1:.075}));
    tone(c,{type:'sine',f:2093,at:.09,dur:.7,vol:.07});
    if(crit) [1318.51,1567.98,2093].forEach((f,i)=>
      tone(c,{type:'sine',f,at:.14+i*.05,dur:.8,vol:.06}));
  }
  function cosmicSlash(c,crit){                   // something arriving from outside
    const dur=crit?.7:.45;
    tone(c,{type:'sine',f:42,f2:26,dur:dur+.2,vol:.24});
    tone(c,{type:'sawtooth',f:120,f2:2400,dur,vol:.09});
    tone(c,{type:'triangle',f:1760,f2:440,at:.05,dur,vol:.07});
    const src=c.createBufferSource(); src.buffer=noiseBuf(c);
    const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=1.4;
    const t=c.currentTime;
    bp.frequency.setValueAtTime(400,t); bp.frequency.exponentialRampToValueAtTime(7000,t+dur);
    const g=c.createGain();
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.14,t+dur*.7);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur+.1);
    src.connect(bp).connect(g).connect(master); src.start(t); src.stop(t+dur+.15);
  }
  function beholdSlash(c,crit){                   // the last sound in the game
    const dur=crit?1.1:.75;
    tone(c,{type:'sine',f:33,f2:20,dur:dur+.3,vol:.3});                 // sub
    [65.41,98,130.81,196,261.63].forEach((f,i)=>                        // vast open cluster
      tone(c,{type:'sawtooth',f,at:i*.02,dur,vol:.07}));
    [523.25,783.99,1046.5,1567.98,2093].forEach((f,i)=>                 // shimmering tail
      tone(c,{type:'sine',f,at:.1+i*.055,dur:dur+.4,vol:.06}));
    const src=c.createBufferSource(); src.buffer=noiseBuf(c);
    const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=.8;
    const t=c.currentTime;
    bp.frequency.setValueAtTime(180,t); bp.frequency.exponentialRampToValueAtTime(9000,t+dur*.8);
    const g=c.createGain();
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(crit?.24:.17,t+dur*.6);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur+.2);
    src.connect(bp).connect(g).connect(master); src.start(t); src.stop(t+dur+.25);
  }
  function chromaSlash(c,crit){                   // every semitone, in order, fast
    const base=261.63, steps=crit?16:12;
    for(let i=0;i<steps;i++)
      tone(c,{type:'triangle', f:base*Math.pow(2,i/12), at:i*.026,
              dur:.5, vol:.055+ i*.002});
    const t=c.currentTime, dur=crit?.55:.38;
    const src=c.createBufferSource(); src.buffer=noiseBuf(c);
    const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=3.5;
    bp.frequency.setValueAtTime(700,t); bp.frequency.exponentialRampToValueAtTime(8000,t+dur);
    const g=c.createGain();
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.15,t+dur*.6);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur+.05);
    src.connect(bp).connect(g).connect(master); src.start(t); src.stop(t+dur+.1);
    tone(c,{type:'sine',f:base*4,at:steps*.026,dur:.7,vol:.09});
    if(crit) for(let i=0;i<10;i++)                 // and back down again
      tone(c,{type:'sine', f:base*8/Math.pow(2,i/12), at:.42+i*.022, dur:.4, vol:.05});
  }
  function starwrathSlash(c,crit){                // a bell struck by something landing
    const t=c.currentTime;
    /* the impact: short lowpassed noise body over a sub thud */
    const src=c.createBufferSource(); src.buffer=noiseBuf(c);
    const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.Q.value=1.2;
    lp.frequency.setValueAtTime(1800,t); lp.frequency.exponentialRampToValueAtTime(200,t+.14);
    const g=c.createGain();
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(crit?.3:.21,t+.006);
    g.gain.exponentialRampToValueAtTime(.0001,t+.16);
    src.connect(lp).connect(g).connect(master); src.start(t); src.stop(t+.2);
    tone(c,{type:'sine',f:120,f2:44,dur:.24,vol:.26});
    /* the chime: bell partials, slightly stretched so it rings rather than hums */
    [1046.5,1571,2093,3139.5].forEach((f,i)=>
      tone(c,{type:'sine',f,at:.012+i*.008,dur:crit?1:.62,vol:(crit?.1:.075)-i*.012}));
    if(crit){                                     // a second star lands behind it
      tone(c,{type:'sine',f:1318.51,at:.16,dur:.9,vol:.07});
      tone(c,{type:'sine',f:4186,f2:1046,at:.2,dur:.6,vol:.045});
    }
  }
  function titaniumSlash(c,crit){                 // heavy metal, all attack
    const t=c.currentTime;
    swoosh(c,{dur:crit?.14:.09, vol:crit?.32:.24, f:5200, f2:900, q:3.2});
    /* inharmonic partials are what make struck metal read as metal */
    [1,2.76,5.4,8.93].forEach((r,i)=>
      tone(c,{type:i<2?'square':'triangle', f:330*r, f2:330*r*.86,
              at:i*.004, dur:(crit?.3:.18)/(1+i*.35), vol:(crit?.1:.075)/(1+i*.7)}));
    tone(c,{type:'sine',f:96,f2:52,dur:.13,vol:.24});   // the weight behind it
    if(crit) tone(c,{type:'square',f:2640,f2:1320,at:.03,dur:.16,vol:.05});
  }
  function mythicSlash(c,crit){                   // slow swell, choir underneath
    const t=c.currentTime, dur=crit?1.15:.8, atk=crit?.22:.16;
    /* detuned pairs on a wide major chord, faded in rather than struck */
    [261.63,392,523.25,659.25,783.99].forEach((f,i)=>{
      [-4,4].forEach(det=>{
        const o=c.createOscillator(), g=c.createGain(), t0=t+i*.02;
        o.type='triangle';
        o.frequency.setValueAtTime(f,t0);
        o.detune.setValueAtTime(det,t0);
        g.gain.setValueAtTime(.0001,t0);
        g.gain.linearRampToValueAtTime(.045,t0+atk);       // the swell
        g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
        o.connect(g).connect(master); o.start(t0); o.stop(t0+dur+.05);
      });
    });
    swoosh(c,{dur:.3,vol:.1,f:3800,f2:1200,q:1.8});
    tone(c,{type:'sine',f:130.81,f2:98,dur:dur+.2,vol:.16});   // the floor under it
    tone(c,{type:'sine',f:1567.98,at:atk,dur:dur*.8,vol:.06});
    if(crit) [1046.5,1318.51,1567.98,2093].forEach((f,i)=>
      tone(c,{type:'sine',f,at:.3+i*.07,dur:.9,vol:.05}));
  }
  const KINDS={ electric, terra:terraSlash, fire:fireSlash, hell:hellSlash,
                holy:holySlash, cosmic:cosmicSlash, behold:beholdSlash, chroma:chromaSlash,
                starwrath:starwrathSlash, titanium:titaniumSlash, mythic:mythicSlash };

  function arp(c,notes,{step=.06,dur=.22,vol=.13,type='triangle'}={}){
    notes.forEach((f,i)=>tone(c,{type,f,at:i*step,dur,vol}));
  }
  return {
    get on(){ return st.on; },
    set on(v){ st.on=v; if(v) ac(); },
    unlock(){ ac(); },
    /* blade through the orb */
    slash(crit,tier,kind){
      if(!st.on) return; const c=ac(); if(!c) return;
      const now=performance.now(); if(now-lastSlash<45) return; lastSlash=now;
      if(kind && KINDS[kind]) return KINDS[kind](c,crit);
      const p = 1 + tier*.07;                       // higher tiers ring brighter
      swoosh(c,{dur:crit?.26:.15, vol:crit?.3:.19, f:2300*p, f2:400, q:crit?2.2:1.1});
      tone(c,{type:'triangle', f:820*p, f2:260*p, dur:crit?.28:.11, vol:crit?.15:.06});
      if(crit){
        tone(c,{type:'square', f:1760, f2:2640, at:.02, dur:.2, vol:.05});
        tone(c,{type:'sine',   f:2637, at:.05, dur:.35, vol:.08});
      }
    },
    /* forge / rune purchase */
    buy(){ if(!st.on) return; const c=ac(); if(!c) return;
      arp(c,[523.25,783.99],{step:.055,dur:.18,vol:.15});
      tone(c,{type:'sine',f:1046.5,at:.1,dur:.3,vol:.1}); },
    /* new sword forged */
    sword(){ if(!st.on) return; const c=ac(); if(!c) return;
      swoosh(c,{dur:.3,vol:.2,f:3200,f2:600,q:1.6});
      arp(c,[523.25,659.25,783.99,1046.5],{step:.075,dur:.4,vol:.14});
      tone(c,{type:'sine',f:1567.98,at:.3,dur:.7,vol:.09}); },
    /* rune bound */
    rune(){ if(!st.on) return; const c=ac(); if(!c) return;
      tone(c,{type:'sine',f:392,dur:.9,vol:.14});
      tone(c,{type:'sine',f:587.33,at:.05,dur:.85,vol:.11});
      tone(c,{type:'triangle',f:1174.66,at:.1,dur:.6,vol:.06}); },
    /* prism mote caught */
    mote(){ if(!st.on) return; const c=ac(); if(!c) return;
      arp(c,[880,1174.66,1567.98,2093],{step:.05,dur:.3,vol:.12,type:'sine'}); },
    /* frenzy begins */
    frenzy(){ if(!st.on) return; const c=ac(); if(!c) return;
      tone(c,{type:'sawtooth',f:110,f2:880,dur:.6,vol:.12});
      arp(c,[523.25,659.25,830.61,1046.5,1318.51],{step:.07,dur:.5,vol:.1}); },
    /* mote expired unclaimed */
    fizzle(){ if(!st.on) return; const c=ac(); if(!c) return;
      tone(c,{type:'sine',f:740,f2:180,dur:.42,vol:.07}); }
  };
})();

/* ================= STATE ================= */
function freshMarket(){
  return { p:PIG.map(g=>g.base), dr:[0,0,0,0], hold:[0,0,0,0], cost:[0,0,0,0],
           hist:PIG.map(g=>[g.base]), anchor:0, realised:0 };
}
const S = {
  v:6, mute:false, ts:0, dev:false, god:false, chroma:0, total:0, clicks:0, crits:0, motes:0,
  moteBank:0, bestCps:0,
  /* prestige: totalBase is every finished run's chroma, refr is the lifetime
     shard count that drives the multiplier, shards is the spendable balance */
  totalBase:0, refr:0, shards:0, after:[], refractions:0,
  btier:[], fingers:[], ach:[], bursts:0,
  sword:0, owned:[0], forge:new Array(FORGE.length).fill(0), runes:[],
  frenzyUntil:0, frenzyPow:2, furyUntil:0, furyPow:1,
  dim:[],
  tree:[null,null,null], treeCd:0,
  mkt:freshMarket()
};
let tab = 'armory';

/* every slotted power, folded into one set of multipliers */
function treeEffects(){
  const T = {clickMult:1, forgeMult:1, allMult:1, critMult:1, critDmgMult:1, critDmgAdd:0,
             buildCost:1, moteRate:1, moteGain:1, vault:1, offRate:.5, offCap:8,
             frenzyPow:0, frenzyDur:1, frenzyOdds:1, filled:0};
  (S.tree||[]).forEach((gi,slot)=>{
    if(gi==null || !GODS[gi] || !SLOTS[slot]) return;
    T.filled++; GODS[gi].f(T, SLOTS[slot].k);
  });
  return T;
}

/* derived */
const D = {};
function recompute(){
  const s = {clickMult:1, forgeMult:1, allMult:1, crit:0, critDmg:2, moteRate:1};
  S.runes.forEach(i=>RUNES[i].f(s));
  // sword perks from every owned sword (collection bonus), equipped gives full power
  let forgeBonus=0, allBonus=0;
  S.owned.forEach(i=>{
    const w=SWORDS[i];
    if(w.crit) s.crit+=w.crit;
    if(w.critdmg) s.critDmg+=w.critdmg;
    if(w.forge) forgeBonus+=w.forge;
    if(w.all) allBonus+=w.all;
  });
  const T = D.tree = treeEffects();
  const P = D.after = afterEffects();
  /* Milk: every deed earned is a permanent slice of all production, so chasing
     the list and chasing the number are the same activity. */
  D.milkName  = milkTier().name;
  D.milkFrac  = milkTier().frac;
  D.milk      = 1 + (S.ach||[]).length * MILK_PER;
  /* Shards multiply everything. This is the whole point of a refraction: the
     next run outruns the last one from the first click. */
  D.refrMult  = 1 + (S.refr||0) * P.shardWorth;
  D.allMult   = s.allMult * (1+allBonus/100) * T.allMult * P.allMult * D.refrMult * D.milk;
  D.forgeMult = s.forgeMult * (1+forgeBonus/100) * T.forgeMult;
  D.crit      = Math.min(s.crit * T.critMult, 60);
  D.critDmg   = Math.max(1, (s.critDmg + T.critDmgAdd + P.critDmgAdd) * T.critDmgMult);
  D.moteRate  = s.moteRate * T.moteRate * P.moteRate;
  D.buildCost = T.buildCost;
  D.offRate   = Math.max(T.offRate, P.offRate);
  D.offCap    = Math.max(T.offCap,  P.offCap);
  D.perClick  = SWORDS[S.sword].pow * s.clickMult * P.clickMult * D.allMult * T.clickMult;
  /* per-building output: base rate, doubled once per tier upgrade owned, with
     the Constant-Click line adding a slice of the rest of the board */
  D.bmult = FORGE.map((_,b)=>Math.pow(2, btCount(b)));
  D.hands = fingerBonus();
  D.each  = FORGE.map((f,b)=>(f.cps + (b===0 ? D.hands : 0)) * D.bmult[b]);
  D.cps   = S.forge.reduce((a,c,b)=>a + c*D.each[b], 0) * D.forgeMult * D.allMult;
  D.frenzy    = Date.now() < S.frenzyUntil ? (S.frenzyPow||2) : 1;
  D.fury      = Date.now() < S.furyUntil   ? (S.furyPow||1)  : 1;
  D.combo     = D.frenzy>1 && D.fury>1;
  /* the exchange indexes off your best-ever income so it never goes stale.
     One mote spent at par and sold back at par is worth PAR * unit chroma. */
  S.mkt.anchor = Math.max(S.mkt.anchor||0, D.cps, D.perClick*2);
  D.unit      = Math.max(S.mkt.anchor, 250);
  D.vault     = Math.floor((12 + S.owned.length) * T.vault);
}

/* ---- exchange helpers ---- */
const motePrice = i => S.mkt.p[i] / PAR;                 // motes per share
const sharePay  = i => S.mkt.p[i] * D.unit;              // chroma per share, before fee
const parValue  = motes => motes * PAR * D.unit;         // what those motes were worth going in
const vaultValue = () => S.mkt.hold.reduce((a,n,i)=>a + n*sharePay(i)*(1-MKT_FEE), 0);
const treeUnlocked = () => totalEver() >= TREE_UNLOCK;
const mktUnlocked  = () => totalEver() >= MKT_UNLOCK;
function swapCost(){ return Math.max(25e3, D.cps*90); }

function mktStep(n){
  const m=S.mkt, hot = D.frenzy>1 ? 1.8 : 1;
  for(let s=0;s<n;s++){
    PIG.forEach((g,i)=>{
      m.dr[i] = m.dr[i]*.88 + (Math.random()-.5)*.9;          // momentum that decays
      let p = m.p[i] * (1 + m.dr[i]*.012 + (Math.random()-.5)*g.vol*hot);
      p += (g.base - p)*.022;                                  // pulled home slowly
      m.p[i] = Math.min(240, Math.max(4, p));
      const h=m.hist[i]; h.push(+m.p[i].toFixed(2)); if(h.length>26) h.shift();
    });
  }
}
setInterval(()=>{
  if(!mktUnlocked()) return;
  mktStep(1);
  if(tab==='market') paintShop();
}, MKT_TICK);

/* ================= DOM ================= */
const $ = id => document.getElementById(id);
const orbEl=$('orb'), fxEl=$('fx'), bladeEl=$('blade'), bladeImg=$('bladeImg');
$('orbImg').src = IMG_ORB;

/* ================= RENDER ================= */
function paintBlade(){
  const w = SWORDS[S.sword];
  bladeImg.src = w.img;
  bladeImg.style.filter = w.fil;
  bladeEl.classList.toggle('pixel', w.px);
  bladeEl.classList.toggle('tall', !!w.tall);
  bladeEl.classList.toggle('big',  !!w.big);
  bladeEl.classList.toggle('flip', !!w.flip);
  bladeEl.style.setProperty('--tilt', (w.tilt||0)+'deg');
  bladeEl.style.setProperty('--flipx', w.flip?-1:1);
  const ico=$('eqIco');
  ico.className = 'ico'+(w.px?' pixel':'');
  ico.innerHTML = `<img src="${w.img}" style="filter:${w.fil}" alt="">`;
  $('eqName').textContent = w.n;
  $('eqTier').textContent = 'Tier '+ROMAN[S.sword];
}
function paintHUD(){
  $('chromaNum').textContent = S.god ? '\u221E' : fmt(S.chroma);
  $('rPer').textContent = fmt(D.perClick*D.frenzy*D.fury + (D.fury>1 ? D.cps*FURY_TAP*D.frenzy : 0));
  $('rSec').textContent = fmt(D.cps*(1-drainFrac()));
  $('sTotal').textContent = fmt(S.total);
  /* "Chroma earned" drops to zero on a refraction, so once you've refracted the
     panel also carries the number that never resets */
  const erow=$('rowEver');
  if(erow){
    erow.hidden = !(S.totalBase>0);
    if(!erow.hidden) $('sEver').textContent = fmt(totalEver());
  }
  $('sClicks').textContent = S.clicks.toLocaleString();
  $('sCrits').textContent = S.crits.toLocaleString();
  $('sCC').textContent = D.crit.toFixed(0)+'%';
  $('sCD').textContent = D.critDmg.toFixed(0)+'x';
  $('sSw').textContent = S.owned.length+' / '+SWORDS.length;
  $('sForge').textContent = fmt(D.cps*(1-drainFrac()))+' /s';
  const drow=$('rowDim');
  if(drow){
    drow.hidden = !dimUnlocked();
    if(!drow.hidden) $('sDim').textContent = S.dim.length+' · '+fmt(dimStored());
  }
  $('sMotes').textContent = S.motes;
  const cr = clickRate();
  const clk = $('rClk');
  if(clk){
    clk.textContent = cr.toFixed(1);
    const chip = clk.parentElement;
    if(chip) chip.classList.toggle('hot', cr >= 8);
  }
  const bst = $('sBest');
  if(bst) bst.textContent = (S.bestCps||0).toFixed(1)+' /s';
  const mrow=$('rowMkt'), trow=$('rowTree');
  const brow=$('rowBank');
  if(brow){
    brow.hidden = !mktUnlocked();
    if(!brow.hidden) $('sBank').textContent = S.moteBank.toFixed(2);
  }
  if(mrow){
    mrow.hidden = !mktUnlocked();
    if(!mrow.hidden) $('sMkt').textContent = fmt(vaultValue());
  }
  if(trow){
    trow.hidden = !treeUnlocked();
    if(!trow.hidden) $('sTree').textContent = (D.tree?D.tree.filled:0)+' / 3';
  }
  const rrow=$('rowRefr'), rmul=$('rowRmul');
  if(rrow){
    rrow.hidden = !refrOpen();
    if(!rrow.hidden){
      const ready=shardsReady();
      $('sRefr').textContent = (S.shards||0).toLocaleString() + (ready>0 ? ` (+${ready})` : '');
    }
  }
  if(rmul){
    rmul.hidden = !refrOpen();
    if(!rmul.hidden) $('sRmul').textContent = '×'+refrBonus().toFixed(2);
  }
  const arow=$('sAch'), mrow2=$('sMilk');
  if(arow) arow.textContent = (S.ach||[]).length+' / '+ACH.length;
  if(mrow2) mrow2.textContent = (D.milkName||'Clear Light')+' ×'+(D.milk||1).toFixed(2);
}

function row({ico,name,desc,perk,price,sub,cls,onclick,disabled}){
  const b=document.createElement('button');
  b.className='item '+(cls||'');
  b.disabled=!!disabled;
  b.innerHTML = `${ico}
    <div><div class="nm2">${name}</div>
      <div class="dsc">${desc}</div>
      ${perk?`<div class="perk">${perk}</div>`:''}</div>
    <div class="price${disabled?' no':''}">${price}${sub?`<small>${sub}</small>`:''}</div>`;
  if(onclick) b.addEventListener('click',onclick);
  return b;
}

function paintShop(){
  const box=$('shop');
  const keepScroll=box.scrollTop;
  box.innerHTML='';
  if(tab==='armory'){
    SWORDS.forEach((w,i)=>{
      const have=S.owned.includes(i), eq=S.sword===i;
      const afford=S.chroma>=w.cost;
      const perks=[];
      if(w.crit) perks.push('+'+w.crit+'% crit chance');
      if(w.critdmg) perks.push('+'+w.critdmg+'x crit power');
      if(w.forge) perks.push('+'+w.forge+'% forge output');
      if(w.all) perks.push('+'+w.all+'% all chroma');
      box.appendChild(row({
        ico:`<div class="ico${w.px?' pixel':''}"><img src="${w.img}" style="filter:${w.fil}" alt=""></div>`,
        name:`<span style="color:${w.col}">${ROMAN[i]}</span> &nbsp;${w.n}`,
        desc:w.d,
        perk:perks.length?'⟡ '+perks.join(' · '):'',
        price: eq?'Equipped' : have?'Equip' : fmt(w.cost),
        sub: eq||have?'' : fmt(w.pow)+' / strike',
        cls: eq?'equip':have?'owned':(afford?'':'locked'),
        disabled: !have && !afford,
        onclick:()=>{
          if(have){ S.sword=i; SFX.slash(false,i,w.sfx); }
          else if(S.chroma>=w.cost){ S.chroma-=w.cost; S.owned.push(i); S.sword=i; SFX.sword(); toast(`${w.n} forged — tier ${ROMAN[i]} unlocked`); }
          else return;
          recompute(); paintBlade(); paintHUD(); paintShop(); markDirty();
        }
      }));
    });
  }
  if(tab==='forge'){
    /* Upgrades first — this is the shelf that keeps the shop from ever being
       empty, so it wants to be the first thing you see when you open the tab. */
    let ups=0;
    FINGERS.forEach((h,i)=>{
      if((S.fingers||[]).includes(i)) return;
      if(i>0 && !(S.fingers||[]).includes(i-1)) return;      // strictly in order
      if(S.forge[0]<1) return;
      const afford=S.chroma>=h.cost; ups++;
      box.appendChild(row({
        ico:`<div class="ico"><span class="glyph">✋</span></div>`,
        name:h.n, desc:h.d, perk:'⟡ Constant-Click · scales with your whole forge',
        price:fmt(h.cost), sub:'one-time',
        cls:afford?'':'locked', disabled:!afford,
        onclick:()=>{ if(S.chroma<h.cost)return; S.chroma-=h.cost; S.fingers.push(i);
          SFX.rune(); toast(`${h.n} — your Constant-Clicks now feed on the whole forge`);
          recompute(); paintHUD(); paintShop(); checkAch(); markDirty(); }
      }));
    });
    FORGE.forEach((f,b)=>{
      BTIER.forEach((t,ti)=>{
        if(btHas(b,ti)) return;
        if(S.forge[b] < t.at) return;                        // not earned yet
        const c=btCost(b,ti), afford=S.chroma>=c; ups++;
        box.appendChild(row({
          ico:`<div class="ico"><span class="glyph">${f.g}</span></div>`,
          name:`${t.n} ${f.n}`,
          desc:`Your ${f.n}s work twice as hard. Unlocked by owning ${t.at}.`,
          perk:`⟡ ${f.n} output ×2 — now ×${Math.pow(2,btCount(b)+1)} in total`,
          price:fmt(c), sub:'one-time',
          cls:afford?'':'locked', disabled:!afford,
          onclick:()=>{ const cc=btCost(b,ti); if(S.chroma<cc)return;
            S.chroma-=cc; S.btier.push(btId(b,ti)); SFX.rune();
            toast(`${t.n} ${f.n} — output doubled`);
            recompute(); paintHUD(); paintShop(); checkAch(); markDirty(); }
        }));
      });
    });
    if(ups){
      const sep=document.createElement('div');
      sep.className='eyebrow'; sep.textContent='Buildings';
      box.appendChild(sep);
    }
    FORGE.forEach((f,i)=>{
      const c=forgeCost(i), afford=S.chroma>=c;
      const visible = i===0 || S.forge[i-1]>0 || S.total>=FORGE[i].cost*.35;
      if(!visible) return;
      const each=D.each[i]*D.forgeMult*D.allMult, mine=each*S.forge[i];
      const share=D.cps>0?Math.round(mine/D.cps*100):0;
      const tiers=btCount(i);
      box.appendChild(row({
        ico:`<div class="ico"><span class="glyph">${f.g}</span></div>`,
        name:f.n+(S.forge[i]?` <span style="color:var(--cyan);font-family:var(--mono);font-size:12px">×${S.forge[i]}</span>`:'')
             +(tiers?` <span style="color:var(--gold);font-family:var(--mono);font-size:11px">▲${tiers}</span>`:''),
        desc:f.d,
        perk:`⟡ ${fmt(each)} chroma/s each`+(S.forge[i]?` · yours make ${fmt(mine)}/s, ${share}% of your income`:''),
        price:fmt(c), sub:'buy one',
        cls:afford?'':'locked', disabled:!afford,
        onclick:()=>{ const cc=forgeCost(i); if(S.chroma<cc)return;
          S.chroma-=cc; S.forge[i]++; SFX.buy(); recompute(); paintHUD(); paintShop(); checkAch(); markDirty(); }
      }));
    });
    if(!box.children.length) box.innerHTML='<div class="empty">The forge is cold.<br>Earn 30 chroma to buy your first whetstone.</div>';
  }
  if(tab==='runes'){
    let shown=0;
    RUNES.forEach((r,i)=>{
      if(S.runes.includes(i)) return;
      if(S.total < r.cost*.25) return;
      shown++;
      const afford=S.chroma>=r.cost;
      box.appendChild(row({
        ico:`<div class="ico"><span class="glyph">⟡</span></div>`,
        name:r.n, desc:r.d, perk:'⟡ Affects: '+r.tag, price:fmt(r.cost), sub:'one-time, permanent',
        cls:afford?'':'locked', disabled:!afford,
        onclick:()=>{ if(S.chroma<r.cost)return; S.chroma-=r.cost; S.runes.push(i); SFX.rune();
          toast(`Rune bound — ${r.d}`); recompute(); paintHUD(); paintShop(); markDirty(); }
      }));
    });
    if(!shown) box.innerHTML=`<div class="empty">No runes within reach yet.<br>${S.runes.length} bound so far — keep striking.</div>`;
  }
  if(tab==='market') paintMarket(box);
  if(tab==='tree')   paintTree(box);
  if(tab==='prism')  paintPrism(box);
  if(tab==='deeds')  paintDeeds(box);
  box.scrollTop=keepScroll;
}

/* ================= DEEDS PANEL ================= */
function paintDeeds(box){
  const have=new Set(S.ach||[]);
  const m=milkTier();
  const head=document.createElement('div');
  head.className='refrhead ready';
  head.innerHTML=`
    <div class="rtop">
      <div><span>Deeds</span><b>${have.size} / ${ACH.length}</b></div>
      <div><span>Milk</span><b class="up">${m.name}</b></div>
      <div><span>All chroma</span><b class="up">×${D.milk.toFixed(2)}</b></div>
      <div><span>Next deed</span><b>+${(MILK_PER*100).toFixed(0)}%</b></div>
    </div>
    <div class="milkbar"><i style="width:${(m.frac*100).toFixed(1)}%"></i></div>
    <div class="rwarn">Every deed permanently multiplies all chroma. They survive
      refraction — the list only ever grows.</div>`;
  box.appendChild(head);

  /* group by category, earned first within each */
  const cats=[];
  ACH.forEach(a=>{ if(!cats.includes(a.cat)) cats.push(a.cat); });
  cats.forEach(cat=>{
    const list=ACH.filter(a=>a.cat===cat);
    const got=list.filter(a=>have.has(a.id)).length;
    const eb=document.createElement('div');
    eb.className='eyebrow';
    eb.textContent=`${cat} · ${got} / ${list.length}`;
    box.appendChild(eb);

    const grid=document.createElement('div');
    grid.className='deedgrid';
    list.forEach(a=>{
      const on=have.has(a.id);
      const d=document.createElement('div');
      d.className='deed'+(on?' on':'');
      d.title=on ? a.d : 'Locked — '+a.d;
      d.innerHTML=`<b>${on?a.n:'???'}</b><em>${a.d}</em>`;
      grid.appendChild(d);
    });
    box.appendChild(grid);
  });
}

/* ================= REFRACTION PANEL ================= */
function paintPrism(box){
  if(!refrOpen()){
    box.innerHTML=`<div class="empty">The orb is still whole.<br>
      Earn ${fmt(REFR_OPEN)} chroma in total to learn how to break it.</div>`;
    return;
  }
  const ready = shardsReady();
  const P = D.after || afterEffects();
  const nextAt = Math.pow((S.refr||0)+ready+1, 3) * REFR_BASE;
  const spent = (S.after||[]).reduce((a,i)=>a+AFTER[i].cost,0);

  const head=document.createElement('div');
  head.className='refrhead'+(ready>0?' ready':'');
  head.innerHTML=`
    <div class="rtop">
      <div><span>Prism Shards</span><b>${(S.shards||0).toLocaleString()}</b></div>
      <div><span>Lifetime shards</span><b>${(S.refr||0).toLocaleString()}</b></div>
      <div><span>All chroma</span><b class="up">×${refrBonus().toFixed(2)}</b></div>
      <div><span>Refractions</span><b>${(S.refractions||0).toLocaleString()}</b></div>
    </div>
    <div class="rnote">Lifetime chroma <b>${fmt(totalEver())}</b> · next shard at <b>${fmt(nextAt)}</b></div>
    <button class="rbtn" id="refrGo"${ready>0?'':' disabled'}>
      ${ready>0 ? `Refract for ${ready.toLocaleString()} shard${ready===1?'':'s'}` : 'Nothing to refract yet'}
    </button>
    <div class="rwarn">Resets chroma, the forge, runes, dimmers${P.keepSwords?'':' and your swords'} and clears the
      exchange floor. Keeps the Prism Tree, your shards, and everything below.</div>`;
  box.appendChild(head);

  head.querySelector('#refrGo').addEventListener('click',()=>{
    const n=shardsReady(); if(n<=0) return;
    const lost = P.keepSwords ? 'the run' : 'the run and your sword rack';
    if(!confirm(`Refract now?\n\nYou gain ${n} Prism Shard${n===1?'':'s'} and lose ${lost}.\nThis cannot be undone.`)) return;
    S.refractions=(S.refractions||0)+1;
    const got=refract();
    SFX.rune();
    toast(`Refracted — +${got} shard${got===1?'':'s'}, all chroma now ×${refrBonus().toFixed(2)}`);
  });

  const eyebrow=document.createElement('div');
  eyebrow.className='eyebrow';
  eyebrow.textContent=`Afterglow · ${(S.after||[]).length} / ${AFTER.length} kept`;
  box.appendChild(eyebrow);

  AFTER.forEach((u,i)=>{
    const have=(S.after||[]).includes(i);
    const afford=(S.shards||0)>=u.cost;
    box.appendChild(row({
      ico:`<div class="ico"><span class="glyph">${have?'◆':'◇'}</span></div>`,
      name:u.n, desc:u.d, perk:'◈ '+u.tag,
      price: have ? 'kept' : u.cost.toLocaleString(),
      sub: have ? 'permanent' : `shard${u.cost===1?'':'s'}`,
      cls: have ? 'owned' : (afford ? '' : 'locked'),
      disabled: have || !afford,
      onclick: have ? null : ()=>{
        if((S.shards||0) < u.cost) return;
        S.shards-=u.cost; S.after.push(i); SFX.rune();
        toast(`Afterglow kept — ${u.n}`);
        recompute(); paintBlade(); paintHUD(); paintShop(); markDirty();
      }
    }));
  });
  if(spent>0){
    const n=document.createElement('div');
    n.className='mnote';
    n.textContent='Spending shards never lowers your multiplier — that runs off your lifetime count, which only ever climbs.';
    box.appendChild(n);
  }
}

/* ================= EXCHANGE PANEL ================= */
function spark(i){
  const h=S.mkt.hist[i];
  if(!h || h.length<2) return '';
  const lo=Math.min(...h), hi=Math.max(...h), rng=(hi-lo)||1;
  const pts=h.map((v,k)=>`${(k/(h.length-1)*100).toFixed(1)},${(25-(v-lo)/rng*22).toFixed(1)}`).join(' ');
  const up=h[h.length-1]>=h[0];
  return `<svg class="spark" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
    <polyline points="${pts}" fill="none" stroke="${up?'#7ee860':'#ff5a7a'}"
      stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`;
}

function buyShares(i,n){
  const per=motePrice(i), room=D.vault-S.mkt.hold[i];
  n=Math.min(n, room, Math.floor((S.moteBank+1e-9)/per));
  if(n<1){ toast(room<1?'No vault space for '+PIG[i].sym:'Not enough motes'); return; }
  const spend=n*per;
  S.moteBank=Math.max(0,S.moteBank-spend);
  S.mkt.hold[i]+=n; S.mkt.cost[i]+=spend;
  SFX.buy(); toast(`${n} ${PIG[i].sym} at ${S.mkt.p[i].toFixed(1)} — ${spend.toFixed(2)} motes`);
  recompute(); paintHUD(); paintShop(); markDirty();
}
function sellShares(i,n){
  n=Math.min(n, S.mkt.hold[i]);
  if(n<1){ toast('You hold no '+PIG[i].sym); return; }
  const net=n*sharePay(i)*(1-MKT_FEE);
  const motesIn=S.mkt.cost[i]*(n/S.mkt.hold[i]);
  const gain=net-parValue(motesIn);
  S.mkt.hold[i]-=n; S.mkt.cost[i]-=motesIn;
  if(S.mkt.hold[i]<=0){ S.mkt.hold[i]=0; S.mkt.cost[i]=0; }
  S.chroma+=net; S.total+=net; S.mkt.realised+=gain;
  SFX.buy();
  toast(`Sold ${n} ${PIG[i].sym} for ${fmt(net)} chroma — ${gain>=0?'+':'−'}${fmt(Math.abs(gain))} on entry`);
  recompute(); paintHUD(); paintShop(); markDirty();
}

function paintMarket(box){
  if(!mktUnlocked()){
    box.innerHTML=`<div class="empty">The exchange floor is closed to you.<br>
      Earn ${fmt(MKT_UNLOCK)} chroma in total to be let in.<br>
      <span style="color:var(--dim)">${fmt(totalEver())} so far</span></div>`;
    return;
  }
  const head=document.createElement('div');
  head.className='mhead';
  head.innerHTML=`
    <div><span>Motes</span><b class="mb-big">${S.moteBank.toFixed(2)}</b></div>
    <div><span>Par mote</span><b>${fmt(PAR*D.unit)}</b></div>
    <div><span>Fee</span><b>${Math.round(MKT_FEE*100)}%</b></div>
    <div><span>Profit</span><b class="${S.mkt.realised>=0?'up':'dn'}">${S.mkt.realised>=0?'+':'−'}${fmt(Math.abs(S.mkt.realised))}</b></div>`;
  box.appendChild(head);

  PIG.forEach((g,i)=>{
    const h=S.mkt.hist[i]||[], prev=h.length>1?h[h.length-2]:S.mkt.p[i];
    const chg=((S.mkt.p[i]-prev)/(prev||1))*100;
    const per=motePrice(i), held=S.mkt.hold[i];
    const entry=held? S.mkt.cost[i]*PAR/held : 0;
    const net=held*sharePay(i)*(1-MKT_FEE), pl=net-parValue(S.mkt.cost[i]);
    const rel=(S.mkt.p[i]/g.base-1)*100;
    const el=document.createElement('div');
    el.className='mrow';
    el.innerHTML=`
      <div class="mtop">
        <div class="mname">
          <span class="msym" style="color:${g.col}">${g.sym}</span>
          <b>${g.n}</b>
          <em>${g.d}</em>
        </div>
        <div class="mprice">
          <b>${S.mkt.p[i].toFixed(1)}</b>
          <span class="${chg>=0?'up':'dn'}">${chg>=0?'▲':'▼'} ${Math.abs(chg).toFixed(1)}%</span>
          <span class="mrel">${rel>=0?'+':''}${rel.toFixed(0)}% vs usual</span>
        </div>
      </div>
      ${spark(i)}
      <div class="mheld">
        <span>${per.toFixed(2)} motes per share · sells for ${fmt(sharePay(i)*(1-MKT_FEE))}</span>
        ${held?`<span>Holding <b>${held}</b>/${D.vault} · entered at ${entry.toFixed(1)} ·
                <span class="${pl>=0?'up':'dn'}">${pl>=0?'+':'−'}${fmt(Math.abs(pl))}</span></span>`
              :`<span>No position · room for ${D.vault}</span>`}
      </div>
      <div class="mbtns">
        <button class="mb buy"  data-a="b1">Buy 1</button>
        <button class="mb buy"  data-a="b5">Buy 5</button>
        <button class="mb buy"  data-a="bm">Buy max</button>
        <button class="mb sell" data-a="s5">Sell 5</button>
        <button class="mb sell" data-a="sa">Sell all</button>
      </div>`;
    const acts={ b1:()=>buyShares(i,1), b5:()=>buyShares(i,5), bm:()=>buyShares(i,D.vault),
                 s5:()=>sellShares(i,5), sa:()=>sellShares(i,S.mkt.hold[i]) };
    el.querySelectorAll('.mb').forEach(b=>b.addEventListener('click',()=>acts[b.dataset.a]()));
    box.appendChild(el);
  });

  const note=document.createElement('div');
  note.className='mnote';
  note.innerHTML=`Motes buy shares, chroma comes back out. A share costs its price in motes, so cheap pigments cost less to enter — buying and selling at the same price always loses the ${Math.round(MKT_FEE*100)}% fee. Prices drift back toward their usual level over time. Vault space grows with every sword you forge.`;
  box.appendChild(note);
}

/* ================= PRISM TREE PANEL ================= */
function placeGod(gi,slot){
  const cost=swapCost(), now=Date.now();
  if(now < S.treeCd){ toast('The tree is still settling'); return; }
  if(S.chroma < cost && !S.god){ toast(`Needs ${fmt(cost)} chroma to move the tree`); return; }
  if(!S.god) S.chroma-=cost;
  const cur=S.tree.indexOf(gi);
  if(cur>=0) S.tree[cur]=null;              // moving, not cloning
  S.tree[slot]=gi;
  S.treeCd=now+TREE_CD;
  SFX.rune();
  toast(`${GODS[gi].n} takes the ${SLOTS[slot].n.toLowerCase()}`);
  recompute(); paintHUD(); paintShop(); markDirty();
}
function clearSlot(slot){
  const now=Date.now();
  if(now < S.treeCd){ toast('The tree is still settling'); return; }
  if(S.tree[slot]==null) return;
  const n=GODS[S.tree[slot]].n;
  S.tree[slot]=null; S.treeCd=now+TREE_CD;
  SFX.fizzle(); toast(`${n} released`);
  recompute(); paintHUD(); paintShop(); markDirty();
}

function paintTree(box){
  if(!treeUnlocked()){
    box.innerHTML=`<div class="empty">The Prism Tree has not grown for you yet.<br>
      Earn ${fmt(TREE_UNLOCK)} chroma in total to reach it.<br>
      <span style="color:var(--dim)">${fmt(totalEver())} so far</span></div>`;
    return;
  }
  const now=Date.now(), locked=now<S.treeCd, wait=Math.ceil((S.treeCd-now)/1000);
  const cost=swapCost();

  const slots=document.createElement('div');
  slots.className='slotgrid';
  SLOTS.forEach((sl,i)=>{
    const gi=S.tree[i], g=gi!=null?GODS[gi]:null;
    const d=document.createElement('div');
    d.className='slot'+(g?' full':'');
    if(g) d.style.setProperty('--gc', g.col);
    d.innerHTML=`
      <div class="slabel">${sl.n} · ${Math.round(sl.k*100)}%</div>
      <div class="sglyph">${g?g.g:'—'}</div>
      <div class="sname">${g?g.n:'Empty'}</div>
      ${g?`<button class="srm">Release</button>`:''}`;
    const rm=d.querySelector('.srm');
    if(rm) rm.addEventListener('click',()=>clearSlot(i));
    slots.appendChild(d);
  });
  box.appendChild(slots);

  const bar=document.createElement('div');
  bar.className='tbar'+(locked?' cd':'');
  bar.innerHTML = locked
    ? `Tree settling — ${wait}s until it can be moved again`
    : `Moving the tree costs <b>${fmt(cost)}</b> chroma and locks it for ${TREE_CD/1000}s`;
  box.appendChild(bar);

  GODS.forEach((g,gi)=>{
    const at=S.tree.indexOf(gi);
    const el=document.createElement('div');
    el.className='god'+(at>=0?' on':'');
    el.style.setProperty('--gc', g.col);
    el.innerHTML=`
      <div class="gtop">
        <div class="gglyph">${g.g}</div>
        <div>
          <div class="gname">${g.n}${at>=0?` <span class="gat">${SLOTS[at].n}</span>`:''}</div>
          <div class="gdsc">${g.d}</div>
        </div>
      </div>
      <div class="geff">
        ${SLOTS.map(sl=>`<div class="gline"><span class="gk">${sl.n}</span>
          <span class="gup">+ ${g.up(sl.k)}</span>
          <span class="gdn">− ${g.dn(sl.k)}</span></div>`).join('')}
      </div>
      <div class="gbtns">
        ${SLOTS.map((sl,i)=>`<button class="gb" data-s="${i}"
          ${(locked||at===i)?'disabled':''}>${at===i?'Slotted':'To '+sl.n}</button>`).join('')}
      </div>`;
    el.querySelectorAll('.gb').forEach(b=>b.addEventListener('click',()=>placeGod(gi,+b.dataset.s)));
    box.appendChild(el);
  });
}

/* ================= CLICKING ================= */
/* Clicks per second, measured over a rolling two-second window so the reading
   is steady rather than jittery. Only samples with real weight behind them are
   allowed to set a new record. */
const CPS_WINDOW = 2000;
let clickTimes = [];
function clickRate(){
  const now = performance.now(), cut = now - CPS_WINDOW;
  while(clickTimes.length && clickTimes[0] < cut) clickTimes.shift();
  if(!clickTimes.length) return 0;
  /* measured against the span the clicks actually cover, so a one-second burst
     reads its real speed instead of being halved by the window */
  const span = Math.max(.35, (now - clickTimes[0])/1000);
  return clickTimes.length / span;
}
/* ---- mobile plumbing ------------------------------------------------- */
const FX_MAX = 46;                       // live pop/shard nodes allowed at once
let _rect=null;
function orbRect(){
  if(!_rect) _rect = orbEl.getBoundingClientRect();
  return _rect;
}
const dropRect = () => { _rect=null; };
addEventListener('resize', dropRect, {passive:true});
addEventListener('scroll', dropRect, {passive:true});
addEventListener('orientationchange', ()=>{ dropRect(); setTimeout(dropRect,300); });
if(window.visualViewport){
  visualViewport.addEventListener('resize', dropRect);
  visualViewport.addEventListener('scroll', dropRect);
}

/* iOS ignores user-scalable=no. Double-tap zoom is handled properly by
   `touch-action:manipulation` in the CSS (blocking touchend here would also
   cancel the synthetic click and make motes uncatchable). Pinch-zoom gestures
   still need swallowing explicitly. */
addEventListener('gesturestart',  e=>e.preventDefault(), {passive:false});
addEventListener('gesturechange', e=>e.preventDefault(), {passive:false});

/* The shop rebuilds its whole DOM on a timer. If that lands between your finger
   going down and coming up, the node you pressed is destroyed and the click
   never fires — which is why buying things on a phone felt like it randomly
   ignored you. We hold off repainting while a finger is down. */
let _touchUntil=0;
const busyTouching = () => Date.now() < _touchUntil;
addEventListener('pointerdown', ()=>{ _touchUntil=Date.now()+700; }, {passive:true});
addEventListener('pointerup',   ()=>{ _touchUntil=Date.now()+250; }, {passive:true});

let hitT=null;
function strike(x,y){
  recompute();
  clickTimes.push(performance.now());
  /* a record needs a real sample behind it — eight clicks spread over most of a
     second — so a stray double-tap can't post an absurd number */
  if(clickTimes.length>=8 && (performance.now()-clickTimes[0])>=800){
    const r=clickRate();
    if(r>(S.bestCps||0)) S.bestCps=r;
  }
  const isCrit = Math.random()*100 < D.crit;
  let gain = D.perClick * D.frenzy * D.fury;
  /* a raging blade siphons the forge — this is what keeps fury worth chasing
     once buildings have left raw click power far behind */
  if(D.fury>1) gain += D.cps * FURY_TAP * D.frenzy;
  gain *= (isCrit ? D.critDmg : 1);
  S.chroma+=gain; S.total+=gain; S.clicks++; if(isCrit) S.crits++;

  orbEl.classList.remove('hit'); void orbEl.offsetWidth; orbEl.classList.add('hit');
  bladeEl.classList.remove('swing'); void bladeEl.offsetWidth; bladeEl.classList.add('swing');
  const num=$('chromaNum'); num.classList.remove('bump'); void num.offsetWidth; num.classList.add('bump');
  clearTimeout(hitT); hitT=setTimeout(()=>{
    orbEl.classList.remove('hit'); bladeEl.classList.remove('swing'); num.classList.remove('bump');
  },600);

  /* getBoundingClientRect() forces a synchronous layout. Calling it inside the
     click handler meant every tap flushed the whole page's layout — at 10 taps a
     second on a phone that alone is enough to drop frames. Cached instead, and
     invalidated whenever the layout can actually change. */
  const r=orbRect();
  const px = x!=null ? x-r.left : r.width*(.35+Math.random()*.3);
  const py = y!=null ? y-r.top  : r.height*(.35+Math.random()*.3);

  /* Hard ceiling on live particles. Each pop/shard is an animated DOM node that
     lives for ~1s, so a fast player was asking a phone to composite 100+ of them
     at once. Past the cap we keep the number popup and drop the confetti. */
  const busy = fxEl.childElementCount;
  if(busy < FX_MAX){
    const pop=document.createElement('div');
    pop.className='pop'+(isCrit?' crit':'');
    pop.style.cssText=`left:${px}px;top:${py}px;color:${isCrit?'':SWORDS[S.sword].col}`;
    pop.textContent=(isCrit?'CRIT ':'+')+fmt(gain);
    fxEl.appendChild(pop); setTimeout(()=>pop.remove(),1000);
  }

  const n = busy > FX_MAX*.6 ? 0 : (isCrit?11:6);
  for(let i=0;i<n;i++){
    const s=document.createElement('div'); s.className='shard';
    const a=Math.random()*Math.PI*2, dist=45+Math.random()*80;
    s.style.cssText=`left:${px}px;top:${py}px;background:${isCrit?'#ffd166':SWORDS[S.sword].col};
      --dx:${Math.cos(a)*dist}px;--dy:${Math.sin(a)*dist}px;--rot:${Math.random()*720-360}deg`;
    fxEl.appendChild(s); setTimeout(()=>s.remove(),800);
  }
  SFX.slash(isCrit, S.sword, SWORDS[S.sword].sfx);
  paintHUD(); if(tab!=='forge') schedulePaint();
}
let paintQueued=false;
function schedulePaint(){ if(paintQueued)return; paintQueued=true;
  setTimeout(()=>{
    paintQueued=false;
    /* if a finger is still down, let the 900ms sweeper pick it up rather than
       destroying the node the user is pressing */
    if(busyTouching()) return;
    paintShop();
  },260); }

window.addEventListener('pointerdown',()=>SFX.unlock(),{once:true});
/* every button strikes — left, right and middle — so you can alternate fingers.
   The browser menus that normally ride along are cancelled on the orb only. */
orbEl.addEventListener('pointerdown',e=>{ e.preventDefault(); strike(e.clientX,e.clientY); });
orbEl.addEventListener('contextmenu',e=>e.preventDefault());
orbEl.addEventListener('auxclick',e=>e.preventDefault());
orbEl.addEventListener('dragstart',e=>e.preventDefault());
orbEl.addEventListener('keydown',e=>{ if(e.key===' '||e.key==='Enter'){e.preventDefault();strike();} });

/* ================= PRISM MOTES =================
   Golden-cookie style timing: nothing can spawn for the first 5 minutes, then
   the per-tick chance climbs with the 5th power of elapsed time, so spawns land
   heavily in the back half of the 5-15 minute window. On screen for 13 seconds. */
const MOTE_MIN=300e3, MOTE_MAX=900e3, MOTE_LIFE=13000, MOTE_TICK=250;
let moteSince=Date.now(), moteLive=false;

function moteWindow(){
  const r = D.moteRate||1;                 // Mote Magnetism halves both ends
  return [MOTE_MIN*r, MOTE_MAX*r];
}
function moteTick(){
  if(moteLive || document.hidden) return;
  const [lo,hi]=moteWindow();
  const t=Date.now()-moteSince;
  if(t<lo) return;
  const curve = x => Math.pow(Math.min(1,Math.max(0,(x-lo)/(hi-lo))), 5);
  const a=curve(t), b=curve(t+MOTE_TICK);
  // convert the rising cumulative curve into this tick's spawn chance
  const p = b>=1 ? 1 : (b-a)/(1-a);
  if(Math.random()<p) spawnMote();
}
setInterval(moteTick, MOTE_TICK);

function spawnMote(flavour){
  if(moteLive) return;
  moteLive=true;
  const T=D.tree||{frenzyOdds:1};
  /* Ember motes ignite the blade instead of the forge. Light snuffs them out
     along with frenzies — that tree keeps the rain and gives up the fire. */
  const ember = flavour ? flavour==='ember' : (Math.random() < .28*T.frenzyOdds);
  const b=document.createElement('button');
  b.className='mote'+(ember?' ember':'');
  b.setAttribute('aria-label', ember?'Catch the ember mote':'Catch the prism mote');
  /* vw/vh put motes in a box that changes size whenever the mobile URL bar
     slides, so a mote could drift off-screen — or land under the toast stack or
     the admin button — and become uncatchable. Placed in real viewport pixels,
     inset far enough that the whole 64-72px sprite stays reachable. */
  const size = innerWidth < 820 ? 64 : 72;
  const vv   = window.visualViewport;
  const vw   = vv ? vv.width  : innerWidth;
  const vh   = vv ? vv.height : innerHeight;
  const padX = 12, padTop = 70, padBot = 116;      // header / toasts / admin fab
  const maxX = Math.max(padX, vw - size - padX);
  const maxY = Math.max(padTop, vh - size - padBot);
  b.style.left = (padX + Math.random()*(maxX-padX)) + 'px';
  b.style.top  = (padTop + Math.random()*(maxY-padTop)) + 'px';
  b.style.setProperty('--life', MOTE_LIFE+'ms');
  b.style.setProperty('--mote-img', 'url("'+IMG_MOTE+'")');
  let gone=false;
  const kill=()=>{ if(gone) return; gone=true; b.remove(); moteLive=false; moteSince=Date.now(); };
  const expire=setTimeout(()=>{ SFX.fizzle(); kill(); }, MOTE_LIFE);
  b.addEventListener('click',()=>{
    if(gone) return;
    clearTimeout(expire); S.motes++; SFX.mote();
    const T=D.tree||{moteGain:1,frenzyPow:0,frenzyDur:1,frenzyOdds:1};
    const banked=1+(T.moteGain-1)/2;   // trading capital grows at half the surge rate
    S.moteBank+=banked;
    const wasFrenzied = Date.now() < S.frenzyUntil;
    const wasFurious  = Date.now() < S.furyUntil;

    if(ember){
      /* Blade fury: short, violent, and it multiplies with an active frenzy */
      S.furyPow=FURY_POW; S.furyUntil=Date.now()+FURY_MS; SFX.frenzy();
      startBanner('fury', FURY_MS);
      toast(`Blade fury — strikes ×${FURY_POW} and drink from the forge, ${FURY_MS/1000}s`);
      if(wasFrenzied) announceCombo();
    } else if(Math.random() < .5*T.frenzyOdds){
      const ms=Math.round(90000*T.frenzyDur), pow=+(2+T.frenzyPow).toFixed(1);
      S.frenzyPow=pow; S.frenzyUntil=Date.now()+ms; SFX.frenzy();
      toast(`Prism frenzy — strikes ×${pow} for ${Math.round(ms/1000)}s`);
      document.body.classList.add('frenzied');
      const bar=document.createElement('div'); bar.className='frenzy'; document.body.appendChild(bar);
      setTimeout(()=>{document.body.classList.remove('frenzied');bar.remove();paintHUD();},ms);
      if(wasFurious) announceCombo();
    } else {
      const bonus = Math.max((D.perClick*3 + D.cps)*300, 60) * T.moteGain;  // ~5 min of play-rate income
      S.chroma+=bonus; S.total+=bonus; toast(`Chroma surge — +${fmt(bonus)}`);
    }
    if(mktUnlocked()) setTimeout(()=>toast(`+${banked.toFixed(2)} motes banked — ${S.moteBank.toFixed(2)} to trade`),700);
    recompute(); paintHUD(); paintShop(); markDirty(); kill();
  });
  document.body.appendChild(b);
  clampMote(b);
}

/* Rotating the phone shrinks the viewport under any mote already in flight.
   Pull it back inside so it stays catchable instead of sitting off the edge. */
function clampMote(b){
  const fix=()=>{
    if(!b.isConnected) return;
    const vv=window.visualViewport;
    const vw=vv?vv.width:innerWidth, vh=vv?vv.height:innerHeight;
    const w=b.offsetWidth||64, h=b.offsetHeight||64;
    b.style.left = Math.min(parseFloat(b.style.left)||0, Math.max(12, vw-w-12))+'px';
    b.style.top  = Math.min(parseFloat(b.style.top) ||0, Math.max(70, vh-h-116))+'px';
  };
  addEventListener('resize', fix, {passive:true});
  addEventListener('orientationchange', ()=>setTimeout(fix,300));
}

/* the fury banner, and the moment both are running at once */
const FURY_POW=12, FURY_MS=12000, FURY_TAP=.6;  // each strike also drinks 0.6s of forge output
function startBanner(cls, ms){
  document.body.classList.add('furious');
  const bar=document.createElement('div'); bar.className='frenzy '+cls; document.body.appendChild(bar);
  bar.style.setProperty('--life', ms+'ms');
  setTimeout(()=>{ document.body.classList.remove('furious'); bar.remove(); paintHUD(); }, ms);
}
function announceCombo(){
  recompute();
  const mult=(D.frenzy*D.fury).toFixed(0);
  document.body.classList.add('combo');
  setTimeout(()=>document.body.classList.remove('combo'), 4000);
  const c=document.createElement('div'); c.className='comboflash';
  c.innerHTML=`<b>COMBO</b><span>strikes ×${mult}</span>`;
  document.body.appendChild(c);
  setTimeout(()=>c.remove(), 2600);
  SFX.frenzy();
}

/* ================= DIMMERS =================
   They fasten onto the orb and drink the forge dry — but they don't destroy what
   they take, they hoard it. Strike one three times and it bursts, paying back far
   more than it swallowed. The right play is to let them feed and cash them in,
   which means deliberately watching your income fall for a while. */
const DIM_MAX=6, DIM_DRAIN=.06, DIM_PAY=1.7, DIM_HITS=3;
const DIM_UNLOCK=2e9, DIM_WAIT_MIN=45e3, DIM_WAIT_MAX=120e3;
const dimUnlocked = () => totalEver() >= DIM_UNLOCK;
const drainFrac  = () => Math.min(.6, S.dim.length*DIM_DRAIN);
const dimStored  = () => S.dim.reduce((a,d)=>a+d.s,0);

let dimSince=Date.now(), dimTarget=DIM_WAIT_MIN+Math.random()*(DIM_WAIT_MAX-DIM_WAIT_MIN);
let dimEls=[];

function attachDimmer(){
  if(S.dim.length>=DIM_MAX) return;
  const used=S.dim.map(d=>d.a);
  const free=[0,1,2,3,4,5].filter(i=>!used.includes(i));
  const a = free.length ? free[Math.floor(Math.random()*free.length)] : 0;
  S.dim.push({s:0, h:0, a});
  SFX.fizzle(); buildDimmers(); markDirty();
  if(S.dim.length===1) toast('Something has fastened onto the orb');
}
function hitDimmer(i){
  /* `i` may be stale: the listener was bound with the index the dimmer had when
     it was built, but S.dim gets spliced whenever one bursts, so every dimmer
     after it shifted down and you ended up hitting the wrong one. Re-derive the
     live index from the element instead. */
  if(typeof i!=='number'){ i=dimEls.indexOf(i); }
  if(i<0) return;
  const d=S.dim[i]; if(!d) return;
  d.h++;
  const el=dimEls[i];
  if(el){ el.classList.remove('struck'); void el.offsetWidth; el.classList.add('struck');
          el.dataset.cracks=String(Math.min(d.h,DIM_HITS)); }
  SFX.slash(false, S.sword, SWORDS[S.sword].sfx);
  if(d.h>=DIM_HITS){
    const pay=d.s*DIM_PAY;
    S.chroma+=pay; S.total+=pay; S.bursts=(S.bursts||0)+1;
    S.dim.splice(i,1);
    SFX.mote();
    toast(`Dimmer burst — +${fmt(pay)} chroma`);
    if(el){ el.classList.add('burst'); const gone=el; dimEls.splice(i,1);
            setTimeout(()=>gone.remove(),420); buildDimmers(true); }
    recompute(); paintHUD(); markDirty();
  }
}
function buildDimmers(skipRemove){
  const wrap=orbEl;
  /* skipRemove used to mean "append new ones and leave the old ones in the DOM",
     which stacked a fresh set of dimmers on top of the previous set every time
     one burst — that's the pile of flickering blades on the orb. Now it only
     spares the element currently playing its burst animation; everything else
     is cleared, including any orphans left over from an earlier save. */
  wrap.querySelectorAll('.dimmer').forEach(e=>{
    if(skipRemove && e.classList.contains('burst')) return;
    e.remove();
  });
  dimEls=[];
  S.dim.forEach((d,i)=>{
    const el=document.createElement('button');
    el.className='dimmer';
    el.type='button';
    el.setAttribute('aria-label','Strike the dimmer');
    el.style.setProperty('--ang', (d.a*60+18)+'deg');
    el.dataset.cracks=String(Math.min(d.h,DIM_HITS));
    el.style.setProperty('--dimg','url("'+IMG_DIM+'")');
    el.innerHTML='<i class="dfill"></i>';
    el.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); hitDimmer(el); });
    el.addEventListener('contextmenu',e=>e.preventDefault());
    wrap.appendChild(el);
    dimEls.push(el);
  });
  paintDimmers();
}
function paintDimmers(){
  const ref = Math.max(D.cps*90, 1);
  S.dim.forEach((d,i)=>{
    const el=dimEls[i]; if(!el) return;
    const f=Math.min(1, d.s/ref);
    el.style.setProperty('--fill', f.toFixed(3));
    el.style.setProperty('--gorge', (1+f*.35).toFixed(3));
    el.title = `Holding ${fmt(d.s)} chroma — bursts for ${fmt(d.s*DIM_PAY)} after ${DIM_HITS-d.h} more hit${DIM_HITS-d.h===1?'':'s'}`;
  });
  orbEl.classList.toggle('dimmed', S.dim.length>0);
}
setInterval(()=>{
  if(!dimUnlocked() || document.hidden) return;
  if(S.dim.length>=DIM_MAX){ dimSince=Date.now(); return; }
  if(Date.now()-dimSince < dimTarget) return;
  dimSince=Date.now();
  dimTarget=DIM_WAIT_MIN+Math.random()*(DIM_WAIT_MAX-DIM_WAIT_MIN);
  attachDimmer();
}, 1000);

/* ================= TOASTS ================= */
function toast(msg){
  const t=document.createElement('div'); t.className='toast'; t.textContent=msg;
  $('toasts').appendChild(t);
  setTimeout(()=>{t.style.transition='opacity .4s';t.style.opacity='0';setTimeout(()=>t.remove(),400);},2600);
}

/* ================= LOOP ================= */
let last=Date.now();
setInterval(()=>{
  const now=Date.now(), dt=(now-last)/1000; last=now;
  recompute();
  if(D.cps>0){
    const g=D.cps*dt;
    const dr=S.dim.length ? g*drainFrac() : 0;
    if(dr>0){ const each=dr/S.dim.length; S.dim.forEach(d=>d.s+=each); }
    const keep=g-dr; S.chroma+=keep; S.total+=keep;   // drained chroma isn't earned until it bursts
  }
  if(S.dim.length) paintDimmers();
  if(S.god && S.chroma<1e30) S.chroma=1e30;
  paintHUD();
},100);
setInterval(()=>{
  if(document.hidden) return;
  checkAch();
  if(busyTouching()) return;   // never yank the DOM mid-tap
  paintShop();
}, 900);

/* ================= SAVE ================= */
/* ================= SAVING =================
   Writes to every storage backend available in this environment and, on load,
   takes whichever copy is newest. That way progress survives a refresh whether
   the game is running inside a host app or opened straight from a file. */
const KEY='chromatic-clicker-save';

const Store = (()=>{
  const backends=[];
  let probed=false;
  async function detect(){
    if(probed) return backends;
    probed=true;
    // 1. host-provided key/value storage
    try{
      if(window.storage && typeof window.storage.set==='function'){
        await window.storage.set(KEY+':probe','1',false);
        backends.push({ id:'cloud',
          read : async()=>{ const r=await window.storage.get(KEY,false); return r&&r.value||null; },
          write: async v=>{ await window.storage.set(KEY,v,false); },
          wipe : async()=>{ await window.storage.delete(KEY,false); } });
      }
    }catch(e){}
    // 2. the browser's own storage — this is what catches a plain page refresh
    try{
      const p=KEY+':probe';
      window.localStorage.setItem(p,'1'); window.localStorage.removeItem(p);
      backends.push({ id:'browser',
        read : async()=>window.localStorage.getItem(KEY),
        write: async v=>window.localStorage.setItem(KEY,v),
        writeSync: v=>window.localStorage.setItem(KEY,v),
        wipe : async()=>window.localStorage.removeItem(KEY) });
    }catch(e){}
    return backends;
  }
  return {
    detect,
    get list(){ return backends; },
    async write(v){ let ok=false;
      for(const b of backends){ try{ await b.write(v); ok=true; }catch(e){} }
      return ok; },
    writeSync(v){ for(const b of backends){ if(b.writeSync){ try{ b.writeSync(v); }catch(e){} } } },
    async readNewest(){
      let best=null;
      for(const b of backends){
        try{ const raw=await b.read(); if(!raw) continue;
          const o=JSON.parse(raw);
          if(!best || (o.ts||0)>(best.ts||0)) best=o;
        }catch(e){}
      }
      return best; },
    async wipe(){ for(const b of backends){ try{ await b.wipe(); }catch(e){} } }
  };
})();

let saveState='idle', lastSaved=0, saving=false, dirty=false;
function snapshot(){ S.ts=Date.now(); return JSON.stringify(S); }

async function save(quiet){
  if(saving){ dirty=true; return; }
  saving=true;
  try{
    await Store.detect();
    if(!Store.list.length){
      saveState='off'; paintSaveStatus();
      if(!quiet) toast('This browser is blocking storage — progress can’t be saved');
      return;
    }
    const ok = await Store.write(snapshot());
    saveState = ok?'ok':'err';
    if(ok) lastSaved=Date.now();
    paintSaveStatus();
    if(!quiet) toast(ok?'Progress saved':'Could not save progress');
  }catch(e){ saveState='err'; paintSaveStatus(); if(!quiet) toast('Could not save progress'); }
  finally{ saving=false; if(dirty){ dirty=false; setTimeout(()=>save(true),300); } }
}
/* synchronous write — the async one may not finish while the tab is closing */
function saveNow(){ try{ Store.writeSync(snapshot()); lastSaved=Date.now(); }catch(e){} save(true); }
function markDirty(){ save(true); }

function paintSaveStatus(){
  const el=$('saveStatus'); if(!el) return;
  if(saveState==='off'){ el.textContent='Storage blocked — progress can’t be saved here'; return; }
  if(saveState==='err'){ el.textContent='Last save failed — retrying'; return; }
  if(!lastSaved){ el.textContent='Autosave on'; return; }
  const a=Math.round((Date.now()-lastSaved)/1000);
  el.textContent = (a<3?'Saved just now':'Saved '+a+'s ago');
}
setInterval(paintSaveStatus,1000);

async function load(){
  await Store.detect();
  if(!Store.list.length){ saveState='off'; paintSaveStatus(); return; }
  let o=null;
  try{ o=await Store.readNewest(); }catch(e){}
  saveState='ok'; lastSaved=Date.now();
  if(!o){ paintSaveStatus(); return; }
  try{
    Object.assign(S,o);
    if(!o.v){ // old 15-sword roster: keep every other stat, rescale the sword collection
      const best=Math.min(Math.floor(Math.max(0,...(o.owned||[0]))*(SWORDS.length-1)/14), SWORDS.length-1);
      S.owned=[]; for(let i=0;i<=best;i++) S.owned.push(i);
      S.sword=best;
    }
    S.v=6;
    /* Saves made before refraction existed have no lifetime counter, so their
       whole history becomes run one — they arrive with shards already waiting,
       which is the right reward for a long save. */
    const num = (v,d)=> (isFinite(+v) && +v>=0) ? +v : d;
    S.totalBase  = num(o.totalBase, 0);
    S.refr       = Math.floor(num(o.refr, 0));
    S.shards     = Math.floor(num(o.shards, 0));
    S.refractions= Math.floor(num(o.refractions, 0));
    S.after      = Array.isArray(o.after)
      ? [...new Set(o.after.filter(i=>Number.isInteger(i) && i>=0 && i<AFTER.length))]
      : [];
    /* a shard count can never exceed what the lifetime total could have paid for */
    S.refr = Math.min(S.refr, shardsAt(S.totalBase + num(o.total,0)));
    const spent = S.after.reduce((a,i)=>a+AFTER[i].cost, 0);
    S.shards = Math.min(S.shards, Math.max(0, S.refr - spent));
    /* new arrays: drop anything that no longer exists in the roster, dedupe */
    const validIds = new Set();
    FORGE.forEach((_,b)=>BTIER.forEach((_,t)=>validIds.add(btId(b,t))));
    S.btier   = Array.isArray(o.btier) ? [...new Set(o.btier.filter(x=>validIds.has(x)))] : [];
    S.fingers = Array.isArray(o.fingers)
      ? [...new Set(o.fingers.filter(i=>Number.isInteger(i)&&i>=0&&i<FINGERS.length))] : [];
    S.ach     = Array.isArray(o.ach)
      ? [...new Set(o.ach.filter(x=>typeof x==='string' && achById[x]))] : [];
    S.bursts  = Math.floor(num(o.bursts, 0));
    /* saves from before the tree and the exchange simply arrive without them */
    const t=Array.isArray(o.tree)?o.tree:[];
    S.tree=[0,1,2].map(i=>{ const g=t[i]; return (Number.isInteger(g)&&GODS[g])?g:null; });
    S.tree.forEach((g,i)=>{ if(g!=null && S.tree.indexOf(g)!==i) S.tree[i]=null; }); // no duplicates
    S.treeCd=0;
    const m=o.mkt&&typeof o.mkt==='object'?o.mkt:{}, f=freshMarket();
    S.mkt={
      p    : PIG.map((g,i)=>{ const v=+(m.p||[])[i]; return isFinite(v)&&v>0?Math.min(240,Math.max(4,v)):g.base; }),
      dr   : PIG.map((_,i)=>{ const v=+(m.dr||[])[i]; return isFinite(v)?v:0; }),
      hold : PIG.map((_,i)=>{ const v=Math.floor(+(m.hold||[])[i]); return isFinite(v)&&v>0?v:0; }),
      cost : PIG.map((_,i)=>{ const v=+(m.cost||[])[i]; return isFinite(v)&&v>0?v:0; }),
      hist : PIG.map((g,i)=>{ const h=(m.hist||[])[i]; return Array.isArray(h)&&h.length?h.slice(-26):[g.base]; }),
      anchor: isFinite(+m.anchor)&&+m.anchor>0 ? +m.anchor : 0,
      realised: isFinite(+m.realised) ? +m.realised : 0
    };
    if(!(S.frenzyPow>=2)) S.frenzyPow=2;
    S.moteBank = (isFinite(+o.moteBank) && +o.moteBank>0) ? +o.moteBank : 0;
    S.bestCps  = (isFinite(+o.bestCps)  && +o.bestCps>0)  ? +o.bestCps  : 0;
    S.furyUntil=0; S.furyPow=1;
    const taken=new Set();
    S.dim = (Array.isArray(o.dim)?o.dim:[])
      .filter(d=>d && typeof d==='object')
      .slice(0,DIM_MAX)
      .map(d=>{
        let a = (Number.isInteger(+d.a) && +d.a>=0 && +d.a<DIM_MAX) ? +d.a : -1;
        if(a<0 || taken.has(a)){ a=0; while(a<DIM_MAX && taken.has(a)) a++; }
        taken.add(a);
        return {
          s: (isFinite(+d.s) && +d.s>0) ? +d.s : 0,
          h: (Number.isInteger(+d.h) && +d.h>0) ? Math.min(+d.h, DIM_HITS-1) : 0,
          a
        };
      })
      .filter(d=>d.a<DIM_MAX);
    /* the exchange used to trade in chroma — clear any positions bought that way */
    if((o.v||0) < 4){ S.mkt.hold=[0,0,0,0]; S.mkt.cost=[0,0,0,0]; S.mkt.realised=0; }
    /* v6 slotted Star Wrath in at index 9 and Titanium Sword + True Excalibur in
       at 12 and 13, so every blade above True Night's Edge moved up. Without this
       remap a save reopens holding whatever now sits at its old index — someone
       who earned Murasama would find Hell's Judgement in their hand. Saves with
       no version at all took the rescale branch above and are already correct. */
    if((o.v||0) >= 1 && (o.v||0) < 6){
      const SHIFT6=[0,1,2,3,4,5,6,7,8,10,11,14,15,16,17,18,19];
      const moved = i => (Number.isInteger(i) && i>=0 && i<SHIFT6.length) ? SHIFT6[i] : 0;
      S.owned = (Array.isArray(o.owned) ? o.owned : [0]).map(moved);
      S.sword = moved(o.sword);
    }
    S.forge = (o.forge||[]).concat(new Array(FORGE.length).fill(0)).slice(0,FORGE.length);
    S.owned = (S.owned||[]).filter(i=>i>=0&&i<SWORDS.length);
    if(!S.owned.length) S.owned=[0];
    if(!(S.sword>=0&&S.sword<SWORDS.length)||!S.owned.includes(S.sword)) S.sword=S.owned[S.owned.length-1];
    S.runes=(o.runes||[]).filter(i=>i>=0&&i<RUNES.length);
    S.frenzyUntil=0;

    /* the forge keeps working while you're gone — Void decides how well */
    recompute();
    const away = Math.max(0,(Date.now()-(o.ts||Date.now()))/1000);
    if(mktUnlocked()) mktStep(Math.min(Math.floor(away*1000/MKT_TICK), 240));   // the floor kept trading
    let earned = D.cps * Math.min(away, (D.offCap||8)*3600) * (D.offRate||.5);
    if(S.dim.length){                       // they kept drinking in the dark
      const dr=earned*drainFrac(), each=dr/S.dim.length;
      S.dim.forEach(d=>d.s+=each); earned-=dr;
    }
    if(away>60 && earned>0){
      S.chroma+=earned; S.total+=earned;
      const h=Math.floor(away/3600), m=Math.round(away%3600/60);
      setTimeout(()=>toast(`The forge ran for ${h?h+'h ':''}${m}m — +${fmt(earned)} chroma`),1100);
    }
    paintSaveStatus();
    toast('Welcome back — progress restored');
  }catch(e){}
}

$('saveBtn').addEventListener('click',()=>save(false));
$('wipeBtn').addEventListener('click',async()=>{
  if(!confirm('Erase all progress and start over? This cannot be undone.')) return;
  Object.assign(S,{v:6,mute:S.mute,ts:0,dev:false,god:false,chroma:0,total:0,clicks:0,crits:0,motes:0,moteBank:0,bestCps:0,sword:0,owned:[0],
    totalBase:0,refr:0,shards:0,after:[],refractions:0,btier:[],fingers:[],ach:[],bursts:0,
    forge:new Array(FORGE.length).fill(0),runes:[],frenzyUntil:0,frenzyPow:2,furyUntil:0,furyPow:1,dim:[],
    tree:[null,null,null],treeCd:0,mkt:freshMarket()});
  await Store.wipe();
  lastSaved=0; saveState='ok';
  Dev.paint(); $('devPanel').hidden=true;
  recompute(); paintBlade(); paintHUD(); paintShop(); toast('Progress erased');
});

setInterval(()=>save(true),5000);
window.addEventListener('pagehide',saveNow);
window.addEventListener('beforeunload',saveNow);
window.addEventListener('blur',()=>save(true));
document.addEventListener('visibilitychange',()=>{ if(document.hidden) saveNow(); else save(true); });

/* ================= SOUND TOGGLE ================= */
function paintMute(){ $('muteBtn').textContent = 'Sound: '+(S.mute?'off':'on'); }
$('muteBtn').addEventListener('click',()=>{
  S.mute=!S.mute; SFX.on=!S.mute; paintMute();
  if(!S.mute) SFX.buy();
  markDirty();
});

/* ================= TABS ================= */
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));
  t.classList.add('on'); tab=t.dataset.tab; paintShop();
}));


/* ================= OWNER CONSOLE =================
   Unlock with the Konami code on a keyboard, or seven quick taps on the word
   CHROMA on a touchscreen. Everything here is client-side. */
const Dev = (()=>{
  const panel=$('devPanel');
  function paint(){
    $('devInfState').textContent = S.god?'on':'off';
    paintFab();
  }
  function open(){
    const first = !S.dev;
    S.dev=true; panel.hidden=false; paint(); markDirty();
    if(first){ SFX.rune(); toast('Admin panel unlocked'); }
  }
  const ACTIONS = {
    inf(){ S.god=!S.god; if(!S.god) S.chroma=Math.min(S.chroma,1e30);
           toast('Infinite chroma '+(S.god?'on':'off')); },
    m1(){ grant(1e6); }, m2(){ grant(1e9); }, m3(){ grant(1e15); },
    x1000(){ grant(Math.max(S.chroma,1000)*999); },
    swords(){ S.owned=SWORDS.map((_,i)=>i); S.sword=SWORDS.length-1;
              paintBlade(); SFX.sword(); toast('Every sword unlocked'); },
    runes(){ S.runes=RUNES.map((_,i)=>i); SFX.rune(); toast('Every rune bound'); },
    forge(){ S.forge=S.forge.map(n=>n+10); SFX.buy(); toast('+10 of every forge building'); },
    frenzy(){ S.frenzyPow=+(2+((D.tree&&D.tree.frenzyPow)||0)).toFixed(1);
              S.frenzyUntil=Date.now()+60000; SFX.frenzy(); toast(`Frenzy — strikes ×${S.frenzyPow} for 60s`);
              document.body.classList.add('frenzied');
              const bar=document.createElement('div'); bar.className='frenzy'; document.body.appendChild(bar);
              setTimeout(()=>{document.body.classList.remove('frenzied');bar.remove();},60000); },
    mote(){ spawnMote(); toast('Mote spawned'); },
    open(){ if(totalEver()<TREE_UNLOCK*1.05){ const n=TREE_UNLOCK*1.05-totalEver(); S.chroma+=n; S.total+=n; }
            SFX.rune(); toast('Exchange and Prism Tree opened'); },
    shake(){ mktStep(14); toast('The market has been shaken'); },
    motes(){ S.moteBank+=50; SFX.mote(); toast('+50 motes banked'); },
    ember(){ spawnMote('ember'); toast('Ember mote spawned'); },
    dimmer(){ if(totalEver()<DIM_UNLOCK){const n=DIM_UNLOCK-totalEver();S.chroma+=n;S.total+=n;}
              attachDimmer(); },
    gorge(){ const f=Math.max(D.cps*90,1); S.dim.forEach(d=>d.s+=f); paintDimmers();
             toast('Dimmers gorged'); },
    shards(){ S.shards=(S.shards||0)+250; S.refr=(S.refr||0)+250;
              S.totalBase=Math.max(S.totalBase||0, Math.pow(S.refr,3)*REFR_BASE);
              SFX.rune(); toast('+250 prism shards'); },
    refr(){ const n=shardsReady();
               if(n<=0){ toast('Nothing to refract — earn more chroma first'); return; }
               S.refractions=(S.refractions||0)+1; refract(); toast(`Refracted — +${n} shards`); },
    lock(){ S.god=false; S.dev=false; panel.hidden=true; paintFab(); toast('Admin panel locked'); }
  };
  function grant(n){ S.chroma+=n; S.total+=n; SFX.buy(); toast('+'+fmt(n)+' chroma'); }

  panel.querySelectorAll('[data-dev]').forEach(b=>b.addEventListener('click',()=>{
    ACTIONS[b.dataset.dev](); recompute(); paintHUD(); paintShop(); paint(); markDirty();
  }));
  $('devClose').addEventListener('click',()=>{ panel.hidden=true; });

  /* ---- admin button + password gate ---- */
  const PASS='CHROMAFRESHFUNZERO';
  const fab=$('adminFab'), wrap=$('pwWrap'), box=$('pwBox'), input=$('pwInput'), err=$('pwErr');

  function paintFab(){
    fab.classList.toggle('on', !!S.dev);
    fab.textContent = S.dev ? 'Admin panel' : 'Admin panel';
  }
  function askPassword(){
    wrap.hidden=false; err.hidden=true; input.value='';
    setTimeout(()=>input.focus(),60);
  }
  function closeGate(){ wrap.hidden=true; input.value=''; err.hidden=true; }
  function tryUnlock(){
    if(input.value.trim().toUpperCase()===PASS){ closeGate(); open(); paintFab(); }
    else{
      err.hidden=false; input.select();
      box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
    }
  }

  fab.addEventListener('click',()=>{
    if(S.dev){ panel.hidden=!panel.hidden; paint(); }   // already unlocked: just toggle
    else askPassword();
  });
  $('pwGo').addEventListener('click',tryUnlock);
  $('pwCancel').addEventListener('click',closeGate);
  input.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); tryUnlock(); } });
  wrap.addEventListener('click',e=>{ if(e.target===wrap) closeGate(); });

  return { paint(){ paintFab(); }, lockUI(){ paintFab(); closeGate(); } };
})();

/* ================= BOOT ================= */
(async()=>{
  await load();
  SFX.on=!S.mute; paintMute(); Dev.paint();
  recompute(); paintBlade(); paintHUD(); paintShop(); buildDimmers(); moteSince=Date.now();
})();
