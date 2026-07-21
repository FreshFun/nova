/* ============ QUANTUM — script.js ============
   Two engines, one chat:
   • Quantum 2.0 — Claude via Puter.js (smart; visitors do a one-time free Puter sign-in)
   • Energy 1.0  — Pollinations (basic; totally keyless, no sign-in at all)
   If Quantum runs out of juice, the error offers a one-tap switch to Energy.
============================================== */

const MODEL_Q = "claude-sonnet-4-6";

const SYSTEM_PROMPT =
  "You are Quantum, a sharp, electric-minded AI living on the FreshFun website. " +
  "You are great at explaining things simply and at writing and debugging code. " +
  "Always put code inside markdown code fences with the language name. " +
  "Keep answers clear and not too long unless the person asks for more.";

const WELCOME_HTML = `
  <div class="welcome" id="welcome">
    <span class="core core-lg" aria-hidden="true"></span>
    <h1>Hey — I'm Quantum.</h1>
    <p class="sub">Two engines, one chat. Quantum 2.0 runs on Claude for the smart stuff; Energy 1.0 is the free backup. Flip between them up top.</p>
    <div class="chips">
      <button class="chip" type="button">⚡ Explain electricity like I'm 10</button>
      <button class="chip" type="button">🐞 Find the bug: for(i=0;i&lt;10;i--)</button>
      <button class="chip" type="button">🎮 Invent a tiny web game idea</button>
    </div>
    <p class="hint">Quantum 2.0 asks for a quick free Puter sign-in on your first message. Energy 1.0 needs nothing.</p>
  </div>`;

// ---------- state ----------
let mode = "quantum";    // "quantum" | "energy"
let history = [];        // [{role:"user"|"assistant", content:string}]
let streaming = false;
let sessionId = 0;

// ---------- elements ----------
const chat    = document.getElementById("chat");
const input   = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const newBtn  = document.getElementById("newChatBtn");
const qBtn    = document.getElementById("modeQuantum");
const eBtn    = document.getElementById("modeEnergy");
const tagline = document.getElementById("tagline");

// ---------- helpers ----------
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function nearBottom() {
  return chat.scrollHeight - chat.scrollTop - chat.clientHeight < 150;
}
function scrollToEnd() {
  chat.scrollTop = chat.scrollHeight;
}
function setBusy(b) {
  streaming = b;
  sendBtn.disabled = b;
}

// ---------- tiny markdown renderer (safe: escapes all HTML) ----------
function renderMarkdown(src, live) {
  let s = src;

  const fenceCount = (s.match(/```/g) || []).length;
  if (live && fenceCount % 2 === 1) s += "\n```";

  const blocks = [];
  s = s.replace(/```(\w*)[ \t]*\n?([\s\S]*?)```/g, (m, lang, code) => {
    blocks.push({ lang: lang || "code", code: code.replace(/\n$/, "") });
    return "\u0000B" + (blocks.length - 1) + "\u0000";
  });

  let html = esc(s)
    .replace(/`([^`\n]+)`/g, '<code class="inline">$1</code>')
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|\s)\*(\S[^*\n]*?\S|\S)\*(?=[\s.,!?)]|$)/g, "$1<em>$2</em>")
    .replace(/^#{1,4}\s+(.+)$/gm, '<span class="md-h">$1</span>')
    .replace(/^[-*]\s+(.+)$/gm, '<span class="md-li">$1</span>');

  html = html
    .split(/\n{2,}/)
    .map(p => "<p>" + p.replace(/\n/g, "<br>") + "</p>")
    .join("");

  html = html.replace(/(?:<p>)?\u0000B(\d+)\u0000(?:<\/p>)?/g, (m, i) => {
    const b = blocks[+i];
    return (
      '<div class="code-block">' +
        '<div class="code-head"><span class="code-lang">' + esc(b.lang) + "</span>" +
        '<button class="copy-btn" type="button">Copy</button></div>' +
        "<pre><code>" + esc(b.code) + "</code></pre>" +
      "</div>"
    );
  });

  return html;
}

// ---------- message building ----------
function addUserBubble(text) {
  const el = document.createElement("div");
  el.className = "msg user";
  el.textContent = text;
  chat.appendChild(el);
  scrollToEnd();
}

function addAssistantShell() {
  const el = document.createElement("div");
  el.className = "msg ai";
  el.innerHTML =
    '<span class="core" aria-hidden="true"></span>' +
    '<div class="msg-inner"><div class="msg-body streaming">' +
    '<span class="dots"><i></i><i></i><i></i></span>' +
    "</div></div>";
  chat.appendChild(el);
  scrollToEnd();
  return el;
}

function addModeNote() {
  const el = document.createElement("div");
  el.className = "mode-note";
  el.textContent = mode === "quantum" ? "⚡ SWITCHED TO QUANTUM 2.0" : "🔋 SWITCHED TO ENERGY 1.0";
  chat.appendChild(el);
  scrollToEnd();
}

function isOutOfJuice(msg) {
  return /insufficient|funds|credit|balance|usage|quota|limit|402/.test(msg);
}

function friendlyError(err) {
  const msg = String((err && (err.message || err.error || err)) || "").toLowerCase();
  if (mode === "quantum" && isOutOfJuice(msg)) {
    return "Quantum 2.0 is out of juice for this account — switch to Energy 1.0, or top up in Puter.";
  }
  if (msg.includes("auth") || msg.includes("cancel") || msg.includes("sign") || msg.includes("popup")) {
    return "Sign-in was closed — hit Retry and finish the quick free Puter sign-in.";
  }
  if (msg.includes("load") || msg.includes("network") || msg.includes("fetch") || !navigator.onLine) {
    return "Load failed — check your connection and try again.";
  }
  return "Something shorted out mid-thought. Try again.";
}

function addErrorBlock(err) {
  const el = document.createElement("div");
  el.className = "msg ai error";
  const offerSwitch = mode === "quantum";
  el.innerHTML =
    '<span class="core" aria-hidden="true"></span>' +
    '<div class="msg-inner">' +
      '<div class="err-label">POWER LOSS</div>' +
      '<p class="err-text">' + esc(friendlyError(err)) + "</p>" +
      '<div class="err-actions">' +
        '<button class="retry-btn" type="button">Retry</button>' +
        (offerSwitch ? '<button class="alt-btn" type="button">Use Energy 1.0</button>' : "") +
      "</div>" +
    "</div>";
  el.querySelector(".retry-btn").addEventListener("click", () => {
    el.remove();
    requestReply();
  });
  const alt = el.querySelector(".alt-btn");
  if (alt) alt.addEventListener("click", () => {
    el.remove();
    setMode("energy");
    requestReply();
  });
  chat.appendChild(el);
  scrollToEnd();
}

// ---------- engine A: Quantum 2.0 (Claude via Puter) ----------
async function askQuantum(onToken, cancelled) {
  if (typeof puter === "undefined") {
    throw new Error("network: Puter.js did not load");
  }
  const stream = await puter.ai.chat(
    [{ role: "system", content: SYSTEM_PROMPT }, ...history],
    { model: MODEL_Q, stream: true }
  );
  for await (const part of stream) {
    if (cancelled()) return;
    const t = (part && part.text) ? part.text : "";
    if (t) onToken(t);
  }
}

// ---------- engine B: Energy 1.0 (Pollinations, keyless) ----------
function buildEnergyPrompt() {
  let convo = "";
  for (const m of history.slice(-8)) {
    convo += (m.role === "user" ? "User: " : "Quantum: ") + m.content + "\n";
  }
  if (convo.length > 1600) convo = convo.slice(-1600);
  return SYSTEM_PROMPT + "\n\nConversation so far:\n" + convo + "\nReply as Quantum:";
}

async function askEnergy() {
  const prompt = encodeURIComponent(buildEnergyPrompt());
  const urls = [
    "https://gen.pollinations.ai/text/" + prompt,
    "https://text.pollinations.ai/" + prompt
  ];
  let lastErr = null;
  for (const u of urls) {
    try {
      const res = await fetch(u);
      if (!res.ok) throw new Error("network " + res.status);
      const text = (await res.text()).trim();
      if (!text) throw new Error("empty response");
      return text;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("network");
}

// ---------- the reply loop ----------
async function requestReply() {
  const myId = sessionId;
  const shell = addAssistantShell();
  const body = shell.querySelector(".msg-body");
  setBusy(true);

  let full = "";
  const onToken = t => {
    full += t;
    const stick = nearBottom();
    body.innerHTML = renderMarkdown(full, true);
    if (stick) scrollToEnd();
  };

  try {
    if (mode === "quantum") {
      await askQuantum(onToken, () => myId !== sessionId);
    } else {
      const text = await askEnergy();
      if (myId !== sessionId) return;
      onToken(text);
    }

    if (myId !== sessionId) return;
    if (!full.trim()) throw new Error("empty response");

    body.classList.remove("streaming");
    body.innerHTML = renderMarkdown(full, false);
    history.push({ role: "assistant", content: full });
  } catch (err) {
    if (myId !== sessionId) return;
    console.error("Quantum error:", err);
    shell.remove();
    addErrorBlock(err);
  } finally {
    if (myId === sessionId) setBusy(false);
  }
}

function sendMessage(text) {
  const clean = text.trim();
  if (!clean || streaming) return;

  const welcome = document.getElementById("welcome");
  if (welcome) welcome.remove();

  history.push({ role: "user", content: clean });
  addUserBubble(clean);
  input.value = "";
  input.style.height = "auto";
  requestReply();
}

// ---------- mode switching ----------
function setMode(next, silent) {
  if (mode === next) return;
  mode = next;
  document.body.classList.toggle("mode-quantum", mode === "quantum");
  document.body.classList.toggle("mode-energy", mode === "energy");
  qBtn.classList.toggle("active", mode === "quantum");
  eBtn.classList.toggle("active", mode === "energy");
  tagline.textContent = mode === "quantum"
    ? "Quantum 2.0 — powered by Claude"
    : "Energy 1.0 — free backup engine";
  try { localStorage.setItem("quantum-mode", mode); } catch (e) {}
  if (!silent && !document.getElementById("welcome")) addModeNote();
}

// ---------- new chat ----------
function newChat() {
  sessionId++;
  history = [];
  setBusy(false);
  chat.innerHTML = WELCOME_HTML;
  input.focus();
}

// ---------- events ----------
sendBtn.addEventListener("click", () => sendMessage(input.value));

input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    sendMessage(input.value);
  }
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 160) + "px";
});

newBtn.addEventListener("click", newChat);
qBtn.addEventListener("click", () => setMode("quantum"));
eBtn.addEventListener("click", () => setMode("energy"));

chat.addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  if (chip) { sendMessage(chip.textContent); return; }

  const btn = e.target.closest(".copy-btn");
  if (btn) {
    const code = btn.closest(".code-block").querySelector("code");
    navigator.clipboard.writeText(code.innerText).then(() => {
      btn.textContent = "Copied ✓";
      setTimeout(() => (btn.textContent = "Copy"), 1400);
    });
  }
});

// ---------- go ----------
try {
  const saved = localStorage.getItem("quantum-mode");
  if (saved === "energy") setMode("energy", true);
} catch (e) {}
chat.innerHTML = WELCOME_HTML;
