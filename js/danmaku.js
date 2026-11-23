// Live Stream Floating Danmaku & Interactive Chat Panel

const VIEWER_NAMES = [
  '三分球小王子', '校门口煎饼果子', '摸鱼观察员', '晚风吹过球场',
  '机械键盘爱好者', '库里迷弟', '考研加油站', '快乐投篮手',
  '前排吃瓜群众', '熬夜看直播', '体院小师弟', '晴天打球去',
];

export class DanmakuSystem {
  constructor(onUserMessage) {
    this.layer = document.getElementById('danmakuLayer');
    this.panel = document.getElementById('chatPanel');
    this.messagesEl = document.getElementById('chatMessages');
    this.form = document.getElementById('chatForm');
    this.input = document.getElementById('chatInput');
    this.hotTag = document.getElementById('chatHotTag');

    this.onUserMessage = onUserMessage;
    this.enabled = false;
    this.hotScore = 9.8;
    this.ambientTimer = 0;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const txt = this.input.value.trim();
      if (!txt) return;
      this.input.value = '';
      this.push('我', txt, { isUser: true, hot: true });
      if (this.onUserMessage) this.onUserMessage(txt);
    });
  }

  setEnabled(flag) {
    this.enabled = flag;
    this.panel.classList.toggle('collapsed', !flag);
    if (!flag) {
      this.layer.innerHTML = '';
    }
  }

  push(user, text, opts = {}) {
    if (!text) return;
    // Append to chat panel history
    const div = document.createElement('div');
    div.className = `chat-msg${opts.isUser ? ' me' : ''}`;
    const u = document.createElement('span');
    u.className = 'u';
    u.textContent = `${user}:`;
    div.appendChild(u);
    div.appendChild(document.createTextNode(text));
    this.messagesEl.appendChild(div);
    while (this.messagesEl.children.length > 40) {
      this.messagesEl.firstChild.remove();
    }
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;

    // Update heat counter
    this.hotScore = Math.min(99.9, this.hotScore + (opts.hot ? 0.3 : 0.1));
    this.hotTag.textContent = `热度 ${this.hotScore.toFixed(1)}w`;

    // Floating danmaku bullet if enabled
    if (!this.enabled) return;
    const item = document.createElement('div');
    item.className = `dm-item${opts.hot ? ' hot' : ''}${opts.isUser ? ' user' : ''}`;
    item.textContent = opts.isUser ? `★ ${text}` : text;
    const topPct = 14 + Math.random() * 44;
    const dur = 6.5 + Math.random() * 3.2;
    item.style.top = `${topPct}%`;
    item.style.animationDuration = `${dur}s`;
    this.layer.appendChild(item);
    setTimeout(() => item.remove(), dur * 1000 + 200);
  }

  pushViewer(text, hot = false) {
    const name = VIEWER_NAMES[Math.floor(Math.random() * VIEWER_NAMES.length)];
    this.push(name, text, { hot });
  }

  tickAmbient(dt, persona) {
    if (!this.enabled || !persona?.danmaku?.ambient) return;
    this.ambientTimer -= dt;
    if (this.ambientTimer <= 0) {
      this.ambientTimer = 3.2 + Math.random() * 4.5;
      const list = persona.danmaku.ambient;
      const line = list[Math.floor(Math.random() * list.length)];
      this.pushViewer(line, false);
    }
  }
}
