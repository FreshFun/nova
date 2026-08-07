/* ================= THE NEWS PLATE =================
   A line of forge-floor gossip across the top, swapped every few seconds.

   Half the lines are fixed flavour and half are written from live state, so the
   bar notices what you are actually doing — the sword in your hand, the number
   of cauldrons on the grass, whether a buff is burning. A ticker that never
   references the game reads as wallpaper after a minute.

   Builds its own DOM. Loads after game.js so it can read S, D, SWORDS and FORGE. */
(function(){
'use strict';

const HOLD_MS = 9000;
const FADE_MS = 450;

let bar, line, idx = -1, recent = [];

/* ---------- helpers ---------- */
const has = () => typeof S !== 'undefined' && typeof SWORDS !== 'undefined';
const num = n => (typeof fmt === 'function' ? fmt(n) : Math.floor(n));
const sword = () => (has() && SWORDS[S.sword]) ? SWORDS[S.sword].n : 'a blunt thing';
const owns = b => (has() && S.forge && S.forge[b]) || 0;
const totalBuildings = () => has() && S.forge ? S.forge.reduce((a,c)=>a+c,0) : 0;
const buildingsOwned = () => has() && S.forge ? S.forge.filter(c=>c>0).length : 0;
function busiest(){
  if(!has() || !S.forge) return null;
  let best=-1, n=0;
  S.forge.forEach((c,b)=>{ if(c>n){ n=c; best=b; } });
  return best<0 || !n ? null : {name:FORGE[best].n, n};
}
const plural = (n, w) => n === 1 ? w : (w.endsWith('s') ? w : w + 's');

/* ---------- the lines ----------
   Written as functions so they read live state at the moment they are shown.
   Returning null means "not applicable right now" and the picker moves on. */
const LINES = [
  () => 'Apprentice asks whether the orb is edible. Nobody stops him.',
  () => 'Smiths agree the orb is load-bearing. No one knows what it holds up.',
  () => `Someone has been polishing ${sword()} instead of using it.`,
  () => `${sword()} left leaning against the good anvil again.`,
  () => 'Guild reminds members that quenching in the drinking water is discouraged.',
  () => 'Local mountain unmoved by recent events.',
  () => 'The lake declines to comment.',
  () => 'Bellows rota posted. Bellows rota ignored.',
  () => 'Third apprentice this month lost to curiosity about molten things.',
  () => 'A moth has entered the forge. The moth is winning.',
  () => 'Colour reportedly escaping through the roof. Roof denies this.',
  () => 'Study finds striking the orb is 100% effective at producing chroma.',
  () => 'Prices at the exchange described as "made up entirely".',
  () => 'Nobody has seen the floor of this place in some years.',
  () => 'Reminder: the anvils are not for sitting on.',
  () => 'Hammer missing. Suspicion falls on everyone.',
  () => 'The spectrum remains stubbornly finite.',
  () => 'Rumour of a colour beyond the last one. Rumour denied, loudly.',

  /* state-aware */
  () => { const b = busiest();
          return b && b.n >= 5 ? `${b.n} ${plural(b.n, b.name)} now running. The noise is constant.` : null; },
  () => { const b = busiest();
          return b && b.n >= 25 ? `Neighbours have stopped asking about the ${b.name.toLowerCase()}s.` : null; },
  () => { const n = totalBuildings();
          return n >= 40 ? `${n} machines on the grass. The grass has given up.` : null; },
  () => { const n = buildingsOwned();
          return n >= 6 ? `${n} kinds of machine out there and not one of them labelled.` : null; },
  () => (typeof D !== 'undefined' && D.cps > 0)
        ? `Forge putting out ${num(D.cps)} chroma a second, unsupervised.` : null,
  () => (has() && S.clicks > 500) ? `${num(S.clicks)} strikes logged. Wrist unavailable for comment.` : null,
  () => (has() && S.crits > 100) ? `${num(S.crits)} clean hits so far. Beginner's luck, sustained.` : null,
  () => (has() && S.motes > 10) ? `${num(S.motes)} motes caught. None of them asked to be.` : null,
  () => (has() && S.owned && S.owned.length >= 5)
        ? `${S.owned.length} blades in the rack, one of them in use.` : null,
  () => (has() && S.total > 1e12) ? 'Accountant has resigned. Numbers cited.' : null,
  () => (typeof D !== 'undefined' && D.combo) ? 'EVERYTHING IS ON FIRE AND THAT IS THE INTENDED OUTCOME.' : null,
  () => (typeof D !== 'undefined' && D.fury > 1) ? 'Blade is drinking straight from the forge. Let it.' : null,
  () => (typeof D !== 'undefined' && D.frenzy > 1) ? 'The air has gone bright. Keep striking.' : null,
  () => (has() && totalBuildings() === 0) ? 'Grass outside remains empty. Suspiciously empty.' : null,
  () => (has() && S.sword === 0) ? 'Someone is still swinging the starter blade. Bold.' : null
];

/* ---------- rotation ---------- */
function pick(){
  /* try a handful of times for a line that applies and has not just run */
  for(let attempt = 0; attempt < 24; attempt++){
    const i = Math.floor(Math.random() * LINES.length);
    if(i === idx || recent.indexOf(i) !== -1) continue;
    const text = LINES[i]();
    if(!text) continue;
    idx = i;
    recent.push(i);
    if(recent.length > 8) recent.shift();
    return text;
  }
  return 'The forge continues.';
}

function swap(){
  if(!line) return;
  const next = pick();
  line.classList.add('fading');
  setTimeout(()=>{
    line.textContent = next;
    line.classList.remove('fading');
  }, FADE_MS);
}

function build(){
  const shell = document.querySelector('.shell');
  const header = document.querySelector('.top');
  if(!shell || !header) return false;

  bar = document.createElement('div');
  bar.className = 'news';
  bar.innerHTML = '<span class="plate">Forge floor</span><span class="line"></span>';
  shell.insertBefore(bar, header.nextSibling);
  line = bar.querySelector('.line');

  /* tapping it pulls the next line, for anyone who wants to read them all */
  bar.addEventListener('click', swap);

  line.textContent = pick();
  return true;
}

function start(){
  if(!build()) return;
  setInterval(swap, HOLD_MS);
}
if(document.readyState === 'loading') addEventListener('DOMContentLoaded', start);
else start();

})();
