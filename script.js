/* ============ NOVA — script.js (v2, powered by Puter.js) ============
   Real Claude on a real website. No API key needed — Puter.js handles it.
   Each visitor signs in to a free Puter account the first time they chat.
==================================================================== */

const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT =
  "You are Nova, a sharp, friendly AI living on the FreshFun website. " +
  "You are great at explaining things simply and at writing and debugging code. " +
  "Always put code inside markdown code fences with the language name. " +
  "Keep answers clear and not too long unless the person asks for more.";

const WELCOME_HTML = `
  <div class="welcome" id="welcome">
    <span class="orb orb-lg" aria-hidden="true"></span>
    <h1>Hey — I'm Nova.</h1>
    <p class="sub">A real AI, live on this site. Ask about code, space, homework, anything.</p>
    <div class="chips">
      <button class="chip" type="button">🪐 Explain black holes like I'm 10</button>
      <button class="chip" type="button">🐞 Find the bug: for(i=0;i&lt;10;i--)</button>
      <button class="chip" type="button">✨ Invent a tiny web game idea</button>
    </div>
    <p class="hint">Your first message opens a quick free Puter sign-in — that's what keeps Nova free.</p>
  </div>`;

// ---------- state ----------
let history = [];        // [{role:"user"|"assistant", content:string}]
let streaming = false;
let sessionId = 0;       // bumps on "new chat" so old streams stop cleanly

// ---------- elements ----------
const chat    = document.getElementById("chat");
const input   = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const newBtn  = document.getElementById("newChatBtn");

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

  // While streaming, temporarily close an unfinished code fence
  const fenceCount = (s.match(/```/g) || []).length;
  if (live && fenceCount % 2 === 1) s += "\n```";

  // Pull code blocks out first
  const blocks = [];
  s = s.replace(/```(\w*)[ \t]*\n?([\s\S]*?)```/g, (m, lang, code) => {
    blocks.push({ lang: lang || "code", code: code.replace(/\n$/, "") });
    return "\u0000B" + (blocks.length - 1) + "\u0000";
  });

  // Inline formatting on the rest
  let html = esc(s)
    .replace(/`([^`\n]+)`/g, '<code class="inline">$1</code>')
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|\s)\*(\S[^*\n]*?\S|\S)\*(?=[\s.,!?)]|$)/g, "$1<em>$2</em>")
    .replace(/^#{1,4}\s+(.+)$/gm, '<span class="md-h">$1</span>')
    .replace(/^[-*]\s+(.+)$/gm, '<span class="md-li">$1</span>');

  // Paragraphs
  html = html
    .split(/\n{2,}/)
    .map(p => "<p>" + p.replace(/\n/g, "<br>") + "</p>")
    .join("");

  // Put code blocks back
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

// ---------- building messages ----------
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
    '<span class="orb" aria-hidden="true"></span>' +
    '<div class="msg-inner"><div class="msg-body streaming">' +
    '<span class="dots"><i></i><i></i><i></i></span>' +
    "</div></div>";
  chat.appendChild(el);
  scrollToEnd();
  return el;
}

function friendlyError(err) {
  const msg = String((err && (err.message || err.error || err)) || "").toLowerCase();
  if (msg.includes("auth") || msg.includes("cancel") || msg.includes("sign") || msg.includes("popup")) {
    return "Sign-in was closed — hit Retry and finish the quick free Puter sign-in.";
  }
  if (msg.includes("load") || msg.includes("network") || msg.includes("fetch") || !navigator.onLine) {
    return "Load failed — check your connection and try again.";
  }
  return "Something glitched between here and the stars. Try again.";
}

function addErrorBlock(err) {
  const el = document.createElement("div");
  el.className = "msg ai error";
  el.innerHTML =
    '<span class="orb" aria-hidden="true"></span>' +
    '<div class="msg-inner">' +
      '<div class="err-label">SIGNAL LOST</div>' +
      '<p class="err-text">' + esc(friendlyError(err)) + "</p>" +
      '<button class="retry-btn" type="button">Retry</button>' +
    "</div>";
  el.querySelector(".retry-btn").addEventListener("click", () => {
    el.remove();
    requestReply();
  });
  chat.appendChild(el);
  scrollToEnd();
}

// ---------- talking to the AI ----------
async function requestReply() {
  const myId = sessionId;
  const shell = addAssistantShell();
  const body = shell.querySelector(".msg-body");
  setBusy(true);

  let full = "";
  try {
    if (typeof puter === "undefined") {
      throw new Error("network: Puter.js did not load");
    }

    const stream = await puter.ai.chat(
      [{ role: "system", content: SYSTEM_PROMPT }, ...history],
      { model: MODEL, stream: true }
    );

    for await (const part of stream) {
      if (myId !== sessionId) return; // user started a new chat
      const t = (part && part.text) ? part.text : "";
      if (t) {
        full += t;
        const stick = nearBottom();
        body.innerHTML = renderMarkdown(full, true);
        if (stick) scrollToEnd();
      }
    }

    if (myId !== sessionId) return;
    if (!full.trim()) throw new Error("empty response");

    body.classList.remove("streaming");
    body.innerHTML = renderMarkdown(full, false);
    history.push({ role: "assistant", content: full });
  } catch (err) {
    if (myId !== sessionId) return;
    console.error("Nova error:", err);
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

// suggestion chips + copy buttons (delegated)
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
chat.innerHTML = WELCOME_HTML;
