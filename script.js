/* ============================================================
   NOVA — a fully working AI chat.
   Every reply comes live from the Claude API. Nothing is faked.
   ============================================================ */

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL   = "claude-sonnet-4-6";

const SYSTEM = `You are Nova — a sharp, warm AI assistant living inside a sleek chat website.
You are excellent at programming: when asked for code, write complete, working code inside fenced markdown blocks with the correct language tag.
You are also great at math, writing, explaining hard ideas simply, and brainstorming.
Be direct and friendly. Always format responses in Markdown. Match your length to the task — short for simple questions, thorough for complex ones.`;

const messages = [];          // full conversation memory {role, content}
let busy = false;

const thread   = document.getElementById("thread");
const scroller = document.getElementById("scroller");
const input    = document.getElementById("input");
const sendBtn  = document.getElementById("send");

/* ---------- hero / empty state ---------- */
function buildHero(){
  const h = document.createElement("div");
  h.className = "hero";
  h.id = "hero";
  h.innerHTML = `
    <h1>N<span class="star" aria-label="O"></span>VA</h1>
    <p>A real AI, live in your browser. It writes code, fixes bugs, explains anything, and remembers the whole conversation.</p>
    <div class="chips">
      <button class="chip">🐍 Code a snake game in Python</button>
      <button class="chip">🕳️ Explain black holes simply</button>
      <button class="chip">🐞 Find the bug: <code>for(i=0;i<10;i--)</code></button>
      <button class="chip">✍️ Write a two-sentence horror story</button>
    </div>`;
  h.querySelectorAll(".chip").forEach(c =>
    c.addEventListener("click", () => sendMessage(c.textContent.trim()))
  );
  thread.appendChild(h);
}
buildHero();

/* ---------- rendering helpers ---------- */
function scrollDown(){
  scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
}

function renderMarkdown(text){
  if (window.marked && window.DOMPurify){
    marked.setOptions({ gfm: true, breaks: true });
    return DOMPurify.sanitize(marked.parse(text));
  }
  const esc = text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  return "<p>" + esc.replace(/\n/g,"<br>") + "</p>";
}

function enhance(el){
  el.querySelectorAll("pre").forEach(pre => {
    const code = pre.querySelector("code");
    if (code && window.hljs){ try { hljs.highlightElement(code); } catch(e){} }
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = "copy";
    btn.addEventListener("click", () => {
      navigator.clipboard.writeText(code ? code.innerText : pre.innerText);
      btn.textContent = "copied ✓";
      setTimeout(() => btn.textContent = "copy", 1400);
    });
    pre.appendChild(btn);
  });
  el.querySelectorAll("a").forEach(a => { a.target = "_blank"; a.rel = "noopener"; });
}

function addUser(text){
  const d = document.createElement("div");
  d.className = "msg user";
  d.textContent = text;
  thread.appendChild(d);
  scrollDown();
}

function addBot(text){
  const d = document.createElement("div");
  d.className = "msg bot";
  d.innerHTML = `<div class="star" aria-hidden="true"></div>
                 <div class="content"><div class="who">Nova</div></div>`;
  const body = document.createElement("div");
  body.innerHTML = renderMarkdown(text);
  enhance(body);
  d.querySelector(".content").appendChild(body);
  thread.appendChild(d);
  scrollDown();
}

function addThinking(){
  const d = document.createElement("div");
  d.className = "msg bot";
  d.innerHTML = `<div class="star thinking" aria-hidden="true"></div>
                 <div class="content"><div class="who">Nova</div>
                 <div class="thinking-label">thinking</div></div>`;
  thread.appendChild(d);
  scrollDown();
  return d;
}

function addError(msg){
  const d = document.createElement("div");
  d.className = "msg bot err";
  d.innerHTML = `<div class="star" aria-hidden="true" style="filter:grayscale(.6)"></div>
                 <div class="content"><div class="who">Signal lost</div></div>`;
  const p = document.createElement("p");
  p.textContent = msg + " — check your connection and try again.";
  const retry = document.createElement("button");
  retry.className = "retry";
  retry.textContent = "Retry";
  retry.addEventListener("click", () => { d.remove(); requestReply(); });
  d.querySelector(".content").append(p, retry);
  thread.appendChild(d);
  scrollDown();
}

/* ---------- the actual AI call ---------- */
async function requestReply(){
  busy = true;
  sendBtn.disabled = true;
  const typing = addThinking();

  try {
    // keep the last 40 turns; history must start on a user turn
    let history = messages.slice(-40);
    while (history.length && history[0].role !== "user") history.shift();

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: SYSTEM,
        messages: history
      })
    });

    const data = await res.json();
    if (!res.ok || data.error){
      throw new Error(data?.error?.message || "Request failed (" + res.status + ")");
    }

    const reply = (data.content || [])
      .map(b => b.type === "text" ? b.text : "")
      .filter(Boolean)
      .join("\n\n") || "…";

    messages.push({ role: "assistant", content: reply });
    typing.remove();
    addBot(reply);

  } catch (err){
    typing.remove();
    addError(err.message || "Something went wrong");
  } finally {
    busy = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

function sendMessage(text){
  text = (text || "").trim();
  if (!text || busy) return;
  document.getElementById("hero")?.remove();
  addUser(text);
  messages.push({ role: "user", content: text });
  input.value = "";
  input.style.height = "auto";
  requestReply();
}

/* ---------- composer wiring ---------- */
sendBtn.addEventListener("click", () => sendMessage(input.value));

input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    sendMessage(input.value);
  }
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 170) + "px";
});

document.getElementById("newChat").addEventListener("click", () => {
  messages.length = 0;
  thread.innerHTML = "";
  buildHero();
  input.focus();
});

input.focus();
