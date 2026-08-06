/* ================= THE GROUNDS =================
   Cookie Clicker's building panel: every forge building you own shows up as a
   sprite standing on the landscape, and the crowd grows as you buy more.

   One row per building type, cheapest along the grass at the bottom and the
   expensive ones stacked back toward the mountains. Rows only appear once you
   own something, so this starts as an empty valley and fills in.

   Reads FORGE and FORGE_ART from sprites.js/game.js. Adds nothing to
   index.html — the panel builds itself under the arena. */
(function(){
'use strict';

const MAX_PER_ROW = 20;     // beyond this the row shows a ×N badge instead
const SCALE       = 1.7;    // sprite pixels to screen pixels on the front row
const DEPTH       = .965;   // each row back is slightly smaller
const POLL_MS     = 350;

let scene, empty, panel, sig='';

function ready(){
  return typeof FORGE!=='undefined' && typeof FORGE_ART!=='undefined'
      && typeof S!=='undefined' && Array.isArray(S.forge);
}

function build(){
  const arena=document.querySelector('.arena');
  if(!arena) return false;

  panel=document.createElement('div');
  panel.className='grounds'; panel.id='grounds';
  if(typeof IMG_GROUND!=='undefined') panel.style.backgroundImage='url('+IMG_GROUND+')';

  scene=document.createElement('div');
  scene.className='gscene';

  empty=document.createElement('div');
  empty.className='gempty';
  empty.textContent='Nothing stands here yet. Buy something in the Forge.';

  panel.appendChild(scene); panel.appendChild(empty);
  arena.parentNode.insertBefore(panel, arena.nextSibling);
  return true;
}

/* A cheap fingerprint of what's built, so we only redraw when it changes —
   this polls four times a second and the DOM work is not free. */
function signature(){ return S.forge.join(','); }

function paint(){
  const owned=[];
  FORGE.forEach((f,b)=>{ if(S.forge[b]>0) owned.push(b); });

  empty.hidden = owned.length>0;
  scene.innerHTML='';
  if(!owned.length) return;

  /* highest tier at the back, so the row order reads as distance */
  owned.slice().reverse().forEach((b,depth)=>{
    const art=FORGE_ART[b]; if(!art) return;
    const n=S.forge[b];
    const k=SCALE*Math.pow(DEPTH, depth);
    const w=Math.round(art.w*k), h=Math.round(art.h*k);

    const row=document.createElement('div');
    row.className='growrow';
    row.style.setProperty('--h', h+'px');

    const show=Math.min(n, MAX_PER_ROW);
    /* crowd them together once a row fills up, rather than letting it overflow */
    const squeeze = show>10 ? Math.round((show-10)*(w*.035)) : 0;
    for(let i=0;i<show;i++){
      const im=document.createElement('img');
      im.src=art.img; im.alt=''; im.draggable=false;
      im.width=w; im.height=h;
      im.style.marginLeft = i? (-squeeze+'px') : '0';
      /* a little vertical stagger stops a row of identical sprites reading as
         a single wallpaper strip */
      im.style.transform='translateY('+((i%3)-1)+'px)';
      im.style.zIndex=String(100-i);
      row.appendChild(im);
    }
    if(n>MAX_PER_ROW){
      const more=document.createElement('span');
      more.className='gmore'; more.textContent='×'+n;
      row.appendChild(more);
    }
    const tag=document.createElement('span');
    tag.className='gname'; tag.textContent=FORGE[b].n+' ×'+n;
    row.appendChild(tag);

    scene.appendChild(row);
  });
}

function tick(){
  if(!ready()) return;
  const s=signature();
  if(s!==sig){ sig=s; paint(); }
}

function start(){
  if(!build()) return;
  tick();
  setInterval(tick, POLL_MS);
}
if(document.readyState==='loading') addEventListener('DOMContentLoaded',start);
else start();

})();
