// sidepanel.js - OTT Chat Logic

let messages = [];
const API_URL = 'http://localhost:8000/chat';

const elements = {
  messagesEl: document.getElementById('messages'),
  inputEl: document.getElementById('message-input'),
  sendBtn: document.getElementById('send-btn'),
  clearBtn: document.getElementById('clear-btn'),
  themeToggle: document.getElementById('theme-toggle'),
  loadingEl: document.getElementById('loading')
};

elements.sendBtn.addEventListener('click', sendMessage);
elements.inputEl.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

elements.clearBtn.addEventListener('click', () => {
  messages = [];
  renderMessages();
});

elements.themeToggle.addEventListener('click', toggleTheme);

// Init theme
const savedTheme = localStorage.getItem('theme') || 'auto';
if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
}

// Send message
async function sendMessage() {
  const text = elements.inputEl.value.trim();
  if (!text) return;

  // Add user message
  messages.push({ role: 'user', content: text });
  elements.inputEl.value = '';
  renderMessages();
  showLoading(true);
  elements.sendBtn.disabled = true;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    messages.push({ role: 'assistant', content: data.response, contexts: data.contexts || [] });
    renderMessages();
  } catch (error) {
    console.error('Chat error:', error);
    messages.push({ role: 'assistant', content: `Error: ${error.message}. Is backend running on localhost:8000?` });
    renderMessages();
  } finally {
    showLoading(false);
    elements.sendBtn.disabled = false;
    elements.inputEl.focus();
  }
}

function renderMessages() {
  elements.messagesEl.innerHTML = messages.map(msg => createMessageHtml(msg)).join('');
  elements.messagesEl.scrollTop = elements.messagesEl.scrollHeight;
}

function createMessageHtml(msg) {
  const isUser = msg.role === 'user';
  let html = `<div class="message ${isUser ? 'user' : 'bot'}">
    <div class="message-content">${escapeHtml(msg.content)}</div>`;

  if (msg.contexts && msg.contexts.length) {
    html += `<div class="contexts">${msg.contexts.length} contexts used</div>`;
  }

  html += '</div>';
  return html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showLoading(show) {
  elements.loadingEl.classList.toggle('hidden', !show);
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  elements.themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
}

// Auto-focus input
elements.inputEl.focus();
