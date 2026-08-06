/* ================= CHROMATIC CLICKER — CO-OP =================
   Two-player presence over WebRTC. One player opens a room and gets a code, the
   other types it in; from then on each side sees the other's blade swinging on
   the opposite side of the orb, plus their live numbers.

   Nothing here touches either economy. Every packet is display-only, which also
   means none of it is trustworthy — the admin console can mint chroma, so treat
   a friend's numbers as decoration, never as a score.

   Loads after game.js and reads its globals (S, D, SWORDS, fmt, $). It adds no
   markup to index.html: the button, the panel, the second blade and the status
   strip are all built here. */
(function(){
'use strict';

/* Set above 0 to give both players a shared bonus while connected — .15 is
   +15% to all chroma. Left at 0 so co-op starts out purely cosmetic. */
const CO_OP_BONUS = 0;

const ALPHABET  = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // no O/0, no I/1
const PREFIX    = 'chromaclicker-';
const SYNC_MS   = 400;      // how often we push our own numbers
const SWING_MS  = 80;       // swing packets throttled to ~12/s
const STALE_MS  = 9000;     // silence this long and we call them gone
const NAME_KEY  = 'cc-coop-name';

let peer=null, conn=null, myCode=null, mateName='Friend';
let friend=null, syncTimer=null, lastSwing=0, opening=false;

const connected = () => !!(conn && conn.open);

/* ---------- tiny storage helper: the game already survives blocked storage,
     so a name we can't persist is a shrug, not an error ---------- */
function remember(v){ try{ localStorage.setItem(NAME_KEY,v); }catch(e){} }
function recall(){ try{ return localStorage.getItem(NAME_KEY)||''; }catch(e){ return ''; } }

function code(n){
  let s=''; const a=new Uint32Array(n);
  (crypto&&crypto.getRandomValues) ? crypto.getRandomValues(a)
                                   : a.forEach((_,i)=>a[i]=Math.random()*4294967296);
  for(let i=0;i<n;i++) s+=ALPHABET[a[i]%ALPHABET.length];
  return s;
}
function say(msg){ if(typeof toast==='function') toast(msg); }

/* ================= DOM ================= */
let btn, panel, strip, blade2, blade2Img;

function build(){
  /* button, dropped in beside Save / Reset */
  const bar=document.querySelector('.topbtns');
  btn=document.createElement('button');
  btn.className='tbtn'; btn.id='coopBtn'; btn.textContent='Co-op';
  btn.addEventListener('click',openPanel);
  if(bar) bar.appendChild(btn);

  /* the friend's blade, mirrored across the orb from yours */
  const wrap=document.querySelector('.orbwrap');
  if(wrap){
    blade2=document.createElement('div');
    blade2.className='blade mate'; blade2.id='blade2'; blade2.hidden=true;
    blade2Img=document.createElement('img');
    blade2Img.alt=''; blade2Img.draggable=false;
    blade2.appendChild(blade2Img);
    wrap.appendChild(blade2);
  }

  /* status strip under the arena */
  const card=document.querySelector('.col-orb .card');
  if(card){
    strip=document.createElement('div');
    strip.className='coopbar'; strip.hidden=true;
    card.appendChild(strip);
  }

  /* the create / join panel, styled off the existing password gate */
  panel=document.createElement('div');
  panel.className='pwrap'; panel.id='coopWrap'; panel.hidden=true;
  panel.innerHTML=`
    <div class="pwbox coopbox">
      <h3>Co-op</h3>
      <p>Open a room and share the code, or type a friend's code to join them.
         You both keep your own save — this only shows you each other.</p>
      <input id="coopName" type="text" maxlength="14" autocomplete="off"
             spellcheck="false" placeholder="Your name">
      <div class="coopsplit">
        <div>
          <div class="eyebrow">Open a room</div>
          <button class="tbtn primary wide" id="coopHost">Create a room</button>
          <div class="coopcode" id="coopCode" hidden></div>
        </div>
        <div>
          <div class="eyebrow">Join a friend</div>
          <input id="coopJoin" type="text" maxlength="5" autocomplete="off"
                 autocapitalize="characters" spellcheck="false"
                 enterkeyhint="go" placeholder="Room code">
          <button class="tbtn wide" id="coopGo">Join</button>
        </div>
      </div>
      <div class="pwerr" id="coopErr" hidden></div>
      <div class="pwrow">
        <button class="tbtn" id="coopLeave" hidden>Leave room</button>
        <button class="tbtn" id="coopClose">Close</button>
      </div>
    </div>`;
  document.body.appendChild(panel);

  panel.querySelector('#coopClose').addEventListener('click',()=>panel.hidden=true);
  panel.querySelector('#coopHost') .addEventListener('click',host);
  panel.querySelector('#coopGo')   .addEventListener('click',join);
  panel.querySelector('#coopLeave').addEventListener('click',leave);
  panel.querySelector('#coopJoin').addEventListener('keydown',e=>{ if(e.key==='Enter') join(); });
  panel.querySelector('#coopName').addEventListener('change',e=>remember(e.target.value.trim()));
  panel.addEventListener('click',e=>{ if(e.target===panel) panel.hidden=true; });
}

function openPanel(){
  panel.hidden=false;
  panel.querySelector('#coopName').value = recall();
  panel.querySelector('#coopLeave').hidden = !(peer||conn);
  err('');
  if(!myCode) panel.querySelector('#coopJoin').focus();
}
function err(t){
  const e=panel.querySelector('#coopErr');
  e.hidden=!t; e.textContent=t||'';
}
function myName(){
  const v=(panel.querySelector('#coopName').value||'').trim();
  if(v) remember(v);
  return v || 'Someone';
}

/* ================= PEER ================= */
function ensurePeerLib(){
  if(typeof Peer!=='undefined') return true;
  err('The co-op library did not load. Check the PeerJS script tag in index.html, '
     +'and that you are not offline.');
  return false;
}

function host(){
  if(!ensurePeerLib() || opening) return;
  opening=true; err('Opening a room…');
  tearDown();
  const c=code(5);
  peer=new Peer(PREFIX+c, {debug:0});
  peer.on('open',()=>{
    opening=false; myCode=c;
    const box=panel.querySelector('#coopCode');
    box.hidden=false; box.textContent=c;
    panel.querySelector('#coopLeave').hidden=false;
    err(''); paintStrip();
    say('Room '+c+' is open — share the code');
  });
  peer.on('connection', c2=>{
    /* one guest at a time: a second knock gets turned away rather than
       silently stealing the slot from whoever is already here */
    if(connected()){ try{ c2.close(); }catch(e){} return; }
    wire(c2);
  });
  peer.on('error', e=>{
    opening=false;
    if(e && e.type==='unavailable-id'){ host(); return; }   // code collided, roll again
    err(readable(e));
  });
}

function join(){
  if(!ensurePeerLib() || opening) return;
  const want=(panel.querySelector('#coopJoin').value||'').trim().toUpperCase();
  if(want.length!==5){ err('A room code is 5 characters.'); return; }
  opening=true; err('Connecting…');
  tearDown();
  peer=new Peer({debug:0});
  peer.on('open',()=>{
    const c=peer.connect(PREFIX+want, {reliable:true});
    if(!c){ opening=false; err('Could not start the connection.'); return; }
    wire(c);
    /* a code for a room nobody opened never errors, it just never answers */
    setTimeout(()=>{ if(!connected()){ opening=false; err('No room answered on '+want+'.'); } },12000);
  });
  peer.on('error', e=>{ opening=false; err(readable(e)); });
}

function readable(e){
  const t=e&&e.type;
  if(t==='peer-unavailable') return 'No room with that code is open right now.';
  if(t==='network'||t==='server-error') return 'Could not reach the matchmaking server.';
  if(t==='browser-incompatible') return 'This browser cannot do peer connections.';
  if(t==='webrtc') return 'The connection failed — one of you may be on a locked-down network.';
  return 'Connection problem'+(t?' ('+t+')':'')+'.';
}

function wire(c){
  conn=c;
  c.on('open',()=>{
    opening=false;
    friend={name:'Friend', sword:0, chroma:0, cps:0, per:0, owned:1, last:Date.now()};
    send({t:'hi', n:myName()});
    pushState();
    clearInterval(syncTimer); syncTimer=setInterval(pushState, SYNC_MS);
    panel.querySelector('#coopLeave').hidden=false;
    err(''); panel.hidden=true;
    say('Connected — you are grinding together');
    paintStrip(); paintMate();
  });
  c.on('data', onData);
  c.on('close', ()=>{ say(mateName+' left the room'); dropFriend(); });
  c.on('error', ()=>{ dropFriend(); });
}

function send(o){ if(connected()){ try{ conn.send(o); }catch(e){} } }

function pushState(){
  if(!connected()) return;
  send({ t:'st',
         sw: S.sword,
         ch: S.chroma,
         cps: D.cps||0,
         per: D.perClick||0,
         ow: (S.owned||[]).length });
  if(friend && Date.now()-friend.last>STALE_MS) paintStrip(true);
}

function onData(m){
  if(!m || typeof m!=='object') return;
  if(!friend) friend={name:'Friend',sword:0,chroma:0,cps:0,per:0,owned:1,last:0};
  friend.last=Date.now();
  if(m.t==='hi'){
    mateName = String(m.n||'Friend').slice(0,14);
    friend.name=mateName;
    send({t:'hi2', n:myName()});
    paintStrip();
  } else if(m.t==='hi2'){
    mateName = String(m.n||'Friend').slice(0,14);
    friend.name=mateName; paintStrip();
  } else if(m.t==='st'){
    const sw=+m.sw;
    const changed = friend.sword!==sw;
    friend.sword  = (Number.isInteger(sw)&&sw>=0&&sw<SWORDS.length) ? sw : 0;
    friend.chroma = +m.ch||0;
    friend.cps    = +m.cps||0;
    friend.per    = +m.per||0;
    friend.owned  = +m.ow||1;
    if(changed) paintMate();
    paintStrip();
  } else if(m.t==='sw'){
    swingMate();
  }
}

function dropFriend(){
  clearInterval(syncTimer); syncTimer=null;
  try{ if(conn) conn.close(); }catch(e){}
  conn=null; friend=null;
  paintStrip(); paintMate();
  if(panel) panel.querySelector('#coopLeave').hidden = !peer;
}
function tearDown(){
  clearInterval(syncTimer); syncTimer=null;
  try{ if(conn) conn.close(); }catch(e){}
  try{ if(peer) peer.destroy(); }catch(e){}
  conn=null; peer=null; friend=null; myCode=null;
  const box=panel&&panel.querySelector('#coopCode');
  if(box){ box.hidden=true; box.textContent=''; }
}
function leave(){
  tearDown(); paintStrip(); paintMate();
  panel.querySelector('#coopLeave').hidden=true;
  err(''); say('Left the room');
}

/* ================= PAINT ================= */
function paintMate(){
  if(!blade2) return;
  if(!friend){ blade2.hidden=true; return; }
  const w=SWORDS[friend.sword]||SWORDS[0];
  blade2.hidden=false;
  blade2Img.src=w.img;
  blade2Img.style.filter=w.fil;
  blade2.classList.toggle('pixel', !!w.px);
  blade2.classList.toggle('tall',  !!w.tall);
  blade2.classList.toggle('big',   !!w.big);
  /* the mate blade is the player's blade mirrored, so every orientation the
     sword carries has to invert too or it ends up pointing away from the orb */
  blade2.classList.toggle('mateflip', !!w.flip);
  blade2.style.setProperty('--tilt', (-(w.tilt||0))+'deg');
  blade2.style.setProperty('--flipx', w.flip?1:-1);
}
function swingMate(){
  if(!blade2||blade2.hidden) return;
  blade2.classList.remove('swing'); void blade2.offsetWidth; blade2.classList.add('swing');
  clearTimeout(swingMate._t);
  swingMate._t=setTimeout(()=>blade2.classList.remove('swing'),600);
}
function paintStrip(stale){
  if(!strip) return;
  if(!friend && !myCode){ strip.hidden=true; if(btn) btn.textContent='Co-op'; return; }
  strip.hidden=false;
  if(friend){
    const w=SWORDS[friend.sword]||SWORDS[0];
    const quiet = stale || (Date.now()-friend.last>STALE_MS);
    btn.textContent='Co-op ●';
    strip.className='coopbar'+(quiet?' quiet':'');
    strip.innerHTML=`
      <span class="dot"></span>
      <b>${esc(friend.name)}</b>
      <span class="sw" style="color:${w.col}">${w.n}</span>
      <span class="n">${fmt(friend.chroma)} chroma</span>
      <span class="n">${fmt(friend.cps)} /s</span>
      ${quiet?'<span class="n">no signal</span>':''}`;
  } else {
    btn.textContent='Co-op ○';
    strip.className='coopbar waiting';
    strip.innerHTML=`<span class="dot"></span>Room <b>${myCode}</b> — waiting for someone to join`;
  }
}
function esc(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

/* ================= HOOKS ================= */
/* Rather than edit the click handler, watch the blade for the class the game
   already adds on every registered strike. That way frenzy taps, keyboard
   strikes and anything added later all broadcast for free. */
function watchSwings(){
  const el=document.getElementById('blade');
  if(!el||!window.MutationObserver) return;
  new MutationObserver(()=>{
    if(!el.classList.contains('swing')) return;
    const now=performance.now();
    if(now-lastSwing<SWING_MS) return;
    lastSwing=now; send({t:'sw'});
  }).observe(el,{attributes:true, attributeFilter:['class']});
}

/* Optional shared bonus. recompute() is a global function declaration, so
   reassigning it here reroutes every call the game already makes. */
if(CO_OP_BONUS>0 && typeof recompute==='function'){
  const base=recompute;
  recompute=function(){
    base();
    if(connected()){
      const m=1+CO_OP_BONUS;
      D.allMult*=m; D.perClick*=m; D.cps*=m;
    }
  };
}

addEventListener('beforeunload',()=>{ try{ if(peer) peer.destroy(); }catch(e){} });

function start(){ build(); watchSwings(); }
if(document.readyState==='loading') addEventListener('DOMContentLoaded',start);
else start();

})();
