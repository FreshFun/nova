/* ================= DIAGNOSTIC =================
   Temporary. Loads first, catches any script that fails to load or parse, and
   prints the result on screen — phones make the browser console effectively
   unreachable, so the page has to report on itself.

   Delete this file and its <script> tag once the problem is found. */
(function(){
'use strict';

const problems = [];

/* Fires for both "404, never arrived" and "arrived but threw while parsing".
   Capture phase, because resource errors do not bubble. */
addEventListener('error', function(e){
  if(e.target && e.target.tagName === 'SCRIPT'){
    problems.push('FAILED TO LOAD: ' + (e.target.getAttribute('src') || 'inline'));
  } else if(e.message){
    problems.push('ERROR: ' + e.message + (e.filename ? ' @ ' + e.filename.split('/').pop() : '')
                  + (e.lineno ? ':' + e.lineno : ''));
  }
  render();
}, true);

function has(name){
  try { return typeof eval(name) !== 'undefined'; } catch(err){ return false; }
}

let box;
function render(){
  if(!box){
    box = document.createElement('div');
    box.style.cssText =
      'position:fixed;left:0;right:0;bottom:0;z-index:99999;max-height:52vh;overflow:auto;'
      +'background:#12071f;color:#eee;border-top:2px solid #ff4fd8;padding:10px 12px;'
      +'font:11px/1.5 monospace;white-space:pre-wrap;word-break:break-word';
    box.addEventListener('click', ()=>box.remove());
    (document.body || document.documentElement).appendChild(box);
  }
  const checks = [
    ['sprites.js  → IMG_ORB',      'IMG_ORB'],
    ['sprites2.js → IMG_STARWRATH','IMG_STARWRATH'],
    ['sprites2.js → IMG_GROUND',   'IMG_GROUND'],
    ['sprites2.js → FORGE_ART',    'FORGE_ART'],
    ['game.js     → FORGE',        'FORGE'],
    ['game.js     → SWORDS',       'SWORDS'],
    ['game.js     → S',            'S'],
    ['coop.js     → Peer (CDN)',   'Peer']
  ];
  let out = 'DIAGNOSTIC  (tap to dismiss)\n\n';
  checks.forEach(([label,name])=>{
    out += (has(name) ? '  ok    ' : '  MISSING  ') + label + '\n';
  });
  if(has('FORGE_ART')){
    try { out += '\n  FORGE_ART entries: ' + FORGE_ART.length; } catch(e){}
  }
  if(has('FORGE')){
    try { out += '\n  FORGE entries: ' + FORGE.length + '  first: ' + FORGE[0].n; } catch(e){}
  }
  out += '\n\n' + (problems.length ? problems.join('\n') : '  no script errors caught');
  box.textContent = out;
}

/* run after everything else has had its chance */
addEventListener('load', ()=>setTimeout(render, 400));
if(document.readyState === 'complete') setTimeout(render, 400);

})();
