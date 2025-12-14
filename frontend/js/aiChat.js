// ================================
// AI CHAT UI
// ================================
const btn = document.createElement("button");
btn.className = "ai-btn";
btn.innerText = "💬";
document.body.appendChild(btn);

const drawer = document.createElement("div");
drawer.className = "ai-drawer";
drawer.innerHTML = `
  <div class="ai-header">
    <span>🤖 Dhan₹ekha AI</span>
    <button id="aiClose">✕</button>
  </div>

  <div id="aiMessages" class="ai-messages"></div>

  <div class="ai-input-box">
    <input id="aiInput" placeholder="Ask about your expenses..." />
    <button id="aiSend">➤</button>
  </div>
`;
document.body.appendChild(drawer);

// 🔒 Force closed on load
drawer.classList.remove("open");

// Toggle drawer
btn.onclick = () => {
  drawer.classList.toggle("open");
};

// Close drawer
document.getElementById("aiClose").onclick = () => {
  drawer.classList.remove("open");
};

const messagesEl = document.getElementById("aiMessages");
const inputEl = document.getElementById("aiInput");
const sendBtn = document.getElementById("aiSend");

// Auto-scroll
function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Add message
function addMessage(text, type = "ai") {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerHTML = text;
  messagesEl.appendChild(div);
  scrollToBottom();
}

// Typing indicator
function showTyping() {
  const div = document.createElement("div");
  div.className = "msg ai typing";
  div.innerText = "AI is thinking...";
  div.id = "aiTyping";
  messagesEl.appendChild(div);
  scrollToBottom();
}

function hideTyping() {
  const t = document.getElementById("aiTyping");
  if (t) t.remove();
}

// Send message
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  addMessage(text, "user");
  inputEl.value = "";
  showTyping();

  try {
    const res = await fetch("/api/ai/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({ query: text })
    });

    const data = await res.json();
    hideTyping();
    addMessage(data.reply, "ai");

  } catch (err) {
    hideTyping();
    addMessage("❌ Something went wrong. Try again.", "ai");
  }
}

// Events
sendBtn.onclick = sendMessage;
inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});
