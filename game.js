/* ================= CHROMATIC CLICKER ================= */
'use strict';

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
  {n:'Terra Blade',            img:IMG_TERRA,    px:true, fil:F.terra,  cost:4e16, pow:7e10,  col:'#7ee860', d:'Every blade you ever owned, remembered at once.',
   all:40, crit:6, sfx:'terra'},
  {n:'Volcano',                img:IMG_VOLCANO,  px:true, fil:F.volc,   cost:4e18,   pow:1.6e12, col:'#ff8c28', d:'The blade is the eruption. The handle is an afterthought.',
   forge:45, critdmg:3, sfx:'fire'},
  {n:"Hell's Judgement",       img:IMG_HELL,     px:true, fil:F.hell,   cost:3e20,   pow:3.8e13, col:'#d62030', d:'Sentence first. Trial never.',
   all:45, crit:6, sfx:'hell'},
  {n:'Murasama',               img:IMG_MURASAMA, px:true, fil:F.mura,   cost:1.6e22,   pow:9e14,  col:'#ff2e4d', d:'Never sheathed. The arcs along the edge never stop.',
   forge:55, crit:8, critdmg:4, sfx:'electric', tall:true, big:true, flip:true, tilt:-18},
  {n:'Iridescent Excalibur',   img:IMG_EXCAL,    px:true, fil:F.excal,  cost:2e24,   pow:2.2e16, col:'#9cc8ff', d:'Drawn from the stone, then from the sky.',
   all:60, critdmg:5, sfx:'holy'},
  {n:'Prismatic Blade',        img:IMG_CHROMA,   px:true, fil:F.chroma, cost:5e25, pow:1.1e17, col:'#c08cff', d:'The whole spectrum, folded into one curve.',
   all:65, crit:8, sfx:'chroma', tall:true, big:true, tilt:-16},
  {n:"God's Exoblade",         img:IMG_EXO,      px:true, fil:F.exo,    cost:3e26,   pow:6e17, col:'#78ffec', d:'Forged outside the universe, brought in through a crack.',
   all:75, forge:75, sfx:'cosmic'},
  {n:'B E H O L D',            img:IMG_BEHOLD,   px:true, fil:F.behold, cost:1.4e28,   pow:1.4e19, col:'#ff78ff', d:'There is nothing after this one.',
   all:120, forge:120, crit:10, critdmg:8, sfx:'behold', big:true}
];
const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII'];

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
  const KINDS={ electric, terra:terraSlash, fire:fireSlash, hell:hellSlash,
                holy:holySlash, cosmic:cosmicSlash, behold:beholdSlash, chroma:chromaSlash };

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
const S = {
  v:2, mute:false, ts:0, dev:false, god:false, chroma:0, total:0, clicks:0, crits:0, motes:0,
  sword:0, owned:[0], forge:new Array(FORGE.length).fill(0), runes:[],
  frenzyUntil:0
};
let tab = 'armory';

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
  D.allMult   = s.allMult * (1+allBonus/100);
  D.forgeMult = s.forgeMult * (1+forgeBonus/100);
  D.crit      = Math.min(s.crit, 60);
  D.critDmg   = s.critDmg;
  D.moteRate  = s.moteRate;
  D.perClick  = SWORDS[S.sword].pow * s.clickMult * D.allMult;
  D.cps       = S.forge.reduce((a,c,i)=>a+c*FORGE[i].cps,0) * D.forgeMult * D.allMult;
  D.frenzy    = Date.now() < S.frenzyUntil ? 2 : 1;
}

/* ================= NUMBER FORMAT ================= */
const SUF=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc','Ud','Dd'];
function fmt(n){
  if(!isFinite(n)) return '∞';
  if(n<1000) return (n<10 && n%1!==0) ? n.toFixed(1) : Math.floor(n).toLocaleString();
  let t=0; while(n>=1000 && t<SUF.length-1){n/=1000;t++;}
  return (n<10?n.toFixed(2):n<100?n.toFixed(1):Math.floor(n))+SUF[t];
}
function forgeCost(i){ return Math.ceil(FORGE[i].cost * Math.pow(1.15, S.forge[i])); }

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
  $('rPer').textContent = fmt(D.perClick*D.frenzy);
  $('rSec').textContent = fmt(D.cps);
  $('sTotal').textContent = fmt(S.total);
  $('sClicks').textContent = S.clicks.toLocaleString();
  $('sCrits').textContent = S.crits.toLocaleString();
  $('sCC').textContent = D.crit.toFixed(0)+'%';
  $('sCD').textContent = D.critDmg.toFixed(0)+'x';
  $('sSw').textContent = S.owned.length+' / '+SWORDS.length;
  $('sForge').textContent = fmt(D.cps)+' /s';
  $('sMotes').textContent = S.motes;
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
    FORGE.forEach((f,i)=>{
      const c=forgeCost(i), afford=S.chroma>=c;
      const visible = i===0 || S.forge[i-1]>0 || S.total>=FORGE[i].cost*.35;
      if(!visible) return;
      const each=f.cps*D.forgeMult*D.allMult, mine=each*S.forge[i];
      const share=D.cps>0?Math.round(mine/D.cps*100):0;
      box.appendChild(row({
        ico:`<div class="ico"><span class="glyph">${f.g}</span></div>`,
        name:f.n+(S.forge[i]?` <span style="color:var(--cyan);font-family:var(--mono);font-size:12px">×${S.forge[i]}</span>`:''),
        desc:f.d,
        perk:`⟡ ${fmt(each)} chroma/s each`+(S.forge[i]?` · yours make ${fmt(mine)}/s, ${share}% of your income`:''),
        price:fmt(c), sub:'buy one',
        cls:afford?'':'locked', disabled:!afford,
        onclick:()=>{ const cc=forgeCost(i); if(S.chroma<cc)return;
          S.chroma-=cc; S.forge[i]++; SFX.buy(); recompute(); paintHUD(); paintShop(); markDirty(); }
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
  box.scrollTop=keepScroll;
}

/* ================= CLICKING ================= */
let hitT=null;
function strike(x,y){
  recompute();
  const isCrit = Math.random()*100 < D.crit;
  let gain = D.perClick * D.frenzy * (isCrit ? D.critDmg : 1);
  S.chroma+=gain; S.total+=gain; S.clicks++; if(isCrit) S.crits++;

  orbEl.classList.remove('hit'); void orbEl.offsetWidth; orbEl.classList.add('hit');
  bladeEl.classList.remove('swing'); void bladeEl.offsetWidth; bladeEl.classList.add('swing');
  const num=$('chromaNum'); num.classList.remove('bump'); void num.offsetWidth; num.classList.add('bump');
  clearTimeout(hitT); hitT=setTimeout(()=>{
    orbEl.classList.remove('hit'); bladeEl.classList.remove('swing'); num.classList.remove('bump');
  },600);

  const r=orbEl.getBoundingClientRect();
  const px = x!=null ? x-r.left : r.width*(.35+Math.random()*.3);
  const py = y!=null ? y-r.top  : r.height*(.35+Math.random()*.3);

  const pop=document.createElement('div');
  pop.className='pop'+(isCrit?' crit':'');
  pop.style.cssText=`left:${px}px;top:${py}px;color:${isCrit?'':SWORDS[S.sword].col}`;
  pop.textContent=(isCrit?'CRIT ':'+')+fmt(gain);
  fxEl.appendChild(pop); setTimeout(()=>pop.remove(),1000);

  const n = isCrit?11:6;
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
  setTimeout(()=>{paintQueued=false;paintShop();},260); }

window.addEventListener('pointerdown',()=>SFX.unlock(),{once:true});
orbEl.addEventListener('pointerdown',e=>{e.preventDefault();strike(e.clientX,e.clientY)});
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

function spawnMote(){
  if(moteLive) return;
  moteLive=true;
  const b=document.createElement('button');
  b.className='mote'; b.setAttribute('aria-label','Catch the prism mote');
  b.style.left = (8+Math.random()*76)+'vw';
  b.style.top  = (14+Math.random()*64)+'vh';
  b.style.setProperty('--life', MOTE_LIFE+'ms');
  b.style.setProperty('--mote-img', 'url("'+IMG_MOTE+'")');
  let gone=false;
  const kill=()=>{ if(gone) return; gone=true; b.remove(); moteLive=false; moteSince=Date.now(); };
  const expire=setTimeout(()=>{ SFX.fizzle(); kill(); }, MOTE_LIFE);
  b.addEventListener('click',()=>{
    if(gone) return;
    clearTimeout(expire); S.motes++; SFX.mote();
    if(Math.random()<.5){
      const bonus = Math.max((D.perClick*3 + D.cps)*300, 60);   // ~5 min of play-rate income
      S.chroma+=bonus; S.total+=bonus; toast(`Chroma surge — +${fmt(bonus)}`);
    } else {
      S.frenzyUntil = Date.now()+90000; SFX.frenzy(); toast('Prism frenzy — strikes ×2 for 90s');
      document.body.classList.add('frenzied');
      const bar=document.createElement('div'); bar.className='frenzy'; document.body.appendChild(bar);
      setTimeout(()=>{document.body.classList.remove('frenzied');bar.remove();paintHUD();},90000);
    }
    recompute(); paintHUD(); paintShop(); markDirty(); kill();
  });
  document.body.appendChild(b);
}

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
  if(D.cps>0){ const g=D.cps*dt; S.chroma+=g; S.total+=g; }
  if(S.god && S.chroma<1e30) S.chroma=1e30;
  paintHUD();
},100);
setInterval(paintShop, 900);

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
    S.v=2;
    S.forge = (o.forge||[]).concat(new Array(FORGE.length).fill(0)).slice(0,FORGE.length);
    S.owned = (S.owned||[]).filter(i=>i>=0&&i<SWORDS.length);
    if(!S.owned.length) S.owned=[0];
    if(!(S.sword>=0&&S.sword<SWORDS.length)||!S.owned.includes(S.sword)) S.sword=S.owned[S.owned.length-1];
    S.runes=(o.runes||[]).filter(i=>i>=0&&i<RUNES.length);
    S.frenzyUntil=0;

    /* the forge keeps working while you're gone, at half rate, up to 8 hours */
    recompute();
    const away = Math.max(0,(Date.now()-(o.ts||Date.now()))/1000);
    const earned = D.cps * Math.min(away, 8*3600) * .5;
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
  Object.assign(S,{v:2,mute:S.mute,ts:0,dev:false,god:false,chroma:0,total:0,clicks:0,crits:0,motes:0,sword:0,owned:[0],
    forge:new Array(FORGE.length).fill(0),runes:[],frenzyUntil:0});
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
    frenzy(){ S.frenzyUntil=Date.now()+60000; SFX.frenzy(); toast('Frenzy — strikes ×2 for 60s');
              document.body.classList.add('frenzied');
              const bar=document.createElement('div'); bar.className='frenzy'; document.body.appendChild(bar);
              setTimeout(()=>{document.body.classList.remove('frenzied');bar.remove();},60000); },
    mote(){ spawnMote(); toast('Mote spawned'); },
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
  recompute(); paintBlade(); paintHUD(); paintShop(); moteSince=Date.now();
})();
