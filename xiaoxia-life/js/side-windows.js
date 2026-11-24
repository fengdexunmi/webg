// Real Interactive Side Windows:
// 1) Handwritten Attendance Sheet, 2) Magnified Textbook Reader, 3) Graded Exam Paper,
// 4) Library Bookshelf & Reader + Pomodoro, 5) Stadium Workout, 6) Campus Mall, 7) Digital Life Log + Export

import { TEXTBOOKS, EXAM_PAPER, LIBRARY_BOOKS, MALL_ITEMS, LAB_SKILLS, LAB_PRESET_TASKS, CANTEEN_MENU } from './data.js';

export class SideWorkspace {
  constructor(bodyEl, callbacks) {
    this.bodyEl = bodyEl;
    this.cb = callbacks; // { onLog, onToast, onStats, onSwitchPanel, onWalkTo, onSpeech }
    this.activePanel = 'checkin';

    // Persistent real user state
    this.state = this._loadState();
    this.pomoTimer = null;
    this.pomoRunning = false;
    this.pomoSec = 25 * 60;
    this.docImportMode = 'textbook'; // 'textbook' | 'library'
    this.labRunning = false;
    this.labSelectedSkills = new Set(['skill-campus', 'skill-mcp', 'skill-eval']);
    this.labTaskText = LAB_PRESET_TASKS[0];
    this.labSteps = [];

    const fileInput = document.getElementById('docFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        this._handleDocImport(e.target.files?.[0]);
        e.target.value = '';
      });
    }
  }

  _loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem('xiaoxiaLife.v2') || 'null');
      if (saved) return saved;
    } catch {}
    return {
      signedToday: false,
      signatureDataUrl: '',
      signedAt: '',
      currentBookId: 'agent_loop',
      highlights: {},
      notes: {
        agent_loop: 'Agentic Loop 必须设置显式完成判据与 MaxSteps 护栏，配合 SKILL 渐进式披露控制上下文窗口长度。',
      },
      customDocs: [],
      examAnswers: {},
      examScore: null,
      selectedLibBookId: LIBRARY_BOOKS[0].id,
      libPageIdx: 0,
      customBooks: [],
      wallet: 260,
      hoopsMade: 0,
      runKm: 0,
      labRuns: 0,
      mealsToday: 0,
      logs: [
        { time: '07:30', tag: '作息', text: '在梅园402宿舍上床下桌起床洗漱，整理好《AI Agent 与 Loop》教材与笔记本电脑。' },
        { time: '07:45', tag: '日程', text: '查看第 8 教学周课表：上午逸夫楼AI课 + AI实验室跑 Loop，中午紫荆园食堂，下午图书馆自习。' },
      ],
    };
  }

  _saveState() {
    try {
      localStorage.setItem('xiaoxiaLife.v2', JSON.stringify(this.state));
    } catch {}
    this.cb.onLogCount?.(this.state.logs.length);
  }

  addLog(tag, text, extra = {}) {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.state.logs.unshift({ time, tag, text, ...extra });
    if (this.state.logs.length > 80) this.state.logs.length = 80;
    this._saveState();
    if (this.activePanel === 'lifelog') this.render();
  }

  setPanel(panelId, opts = {}) {
    this.activePanel = panelId;
    if (opts.courseId && TEXTBOOKS[opts.courseId]) {
      this.state.currentBookId = opts.courseId;
    }
    document.querySelectorAll('#sideTabs .side-tab').forEach((b) => {
      b.classList.toggle('active', b.dataset.panel === panelId);
    });
    this.render();
  }

  render() {
    switch (this.activePanel) {
      case 'checkin':
        this._renderCheckin();
        break;
      case 'textbook':
        this._renderTextbook();
        break;
      case 'exam':
        this._renderExam();
        break;
      case 'lab':
        this._renderLab();
        break;
      case 'library':
        this._renderLibrary();
        break;
      case 'canteen':
        this._renderCanteen();
        break;
      case 'stadium':
        this._renderStadium();
        break;
      case 'mall':
        this._renderMall();
        break;
      case 'lifelog':
      default:
        this._renderLifeLog();
        break;
    }
  }

  // ==================== 1. 真实签到纸放大窗口 ====================
  _renderCheckin() {
    const today = new Date().toLocaleDateString('zh-CN');
    const signed = this.state.signedToday;

    this.bodyEl.innerHTML = `
      <div class="paper-sheet">
        ${signed ? `<div class="stamp-badge">已准时签到</div>` : ''}
        <h3 class="sheet-title">2026–2027 学年课堂考勤签到表</h3>
        <div class="sheet-meta">课程：AI Agent 架构与 Agentic Loop ｜ 地点：逸夫教学楼 302 ｜ 日期：${today}</div>

        <table class="checkin-table">
          <thead>
            <tr><th>序号</th><th>学号</th><th>姓名</th><th>本人手写签名</th><th>状态</th></tr>
          </thead>
          <tbody>
            <tr><td>01</td><td>2025040215</td><td>陈默</td><td class="fake-handwriting">陈默</td><td>✅ 已签</td></tr>
            <tr><td>02</td><td>2025040216</td><td>苏晚晚</td><td class="fake-handwriting">苏晚晚</td><td>✅ 已签</td></tr>
            <tr><td>03</td><td>2025040217</td><td>陆阿凯</td><td class="fake-handwriting">陆阿凯</td><td>✅ 已签</td></tr>
            <tr class="me-row">
              <td><strong>04</strong></td>
              <td><strong>2025040218</strong></td>
              <td><strong>林小夏</strong></td>
              <td id="xiaoxiaSigCell">
                ${signed && this.state.signatureDataUrl
                  ? `<img src="${this.state.signatureDataUrl}" alt="林小夏手写签名" style="max-height:28px;vertical-align:middle;">`
                  : '<span style="color:#d97706;font-weight:700;">待手写签名 ↓</span>'}
              </td>
              <td>${signed ? `<span style="color:#15803d;font-weight:700;">✅ ${this.state.signedAt}</span>` : '⏳ 待签'}</td>
            </tr>
          </tbody>
        </table>

        <div class="sig-box-wrap">
          <div class="sig-label">
            <span>✍️ 请在下方签到格用鼠标/触控手写「林小夏」</span>
            <button type="button" class="secondary-btn" id="btnClearSig" style="padding:2px 8px;font-size:11px;">重写</button>
          </div>
          <canvas id="sigCanvas" width="380" height="110"></canvas>
          <div class="btn-row">
            <button type="button" class="secondary-btn" id="btnAutoSign">✨ 小夏自动签字</button>
            <button type="button" class="primary-btn" id="btnSubmitSign">✅ 确认提交签到</button>
            <button type="button" class="secondary-btn" id="btnNextToClass">📖 翻开教材上课 →</button>
          </div>
        </div>
      </div>
    `;

    const cv = document.getElementById('sigCanvas');
    const ctx = cv.getContext('2d');
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let drawing = false;
    let hasInk = false;

    const getPt = (e) => {
      const r = cv.getBoundingClientRect();
      return [(e.clientX - r.left) * (cv.width / r.width), (e.clientY - r.top) * (cv.height / r.height)];
    };

    cv.addEventListener('pointerdown', (e) => {
      drawing = true;
      hasInk = true;
      const [x, y] = getPt(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const [x, y] = getPt(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    });
    const stop = () => { drawing = false; };
    cv.addEventListener('pointerup', stop);
    cv.addEventListener('pointercancel', stop);

    document.getElementById('btnClearSig').addEventListener('click', () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      hasInk = false;
    });

    document.getElementById('btnAutoSign').addEventListener('click', () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.save();
      ctx.fillStyle = '#1e3a8a';
      ctx.font = "italic 700 44px 'Noto Serif SC', serif";
      ctx.fillText('林小夏', 112, 68);
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(106, 80);
      ctx.quadraticCurveTo(188, 72, 266, 82);
      ctx.stroke();
      ctx.restore();
      hasInk = true;
      this.cb.onToast?.('已书写签名「林小夏」，点击确认提交即可归档');
    });

    document.getElementById('btnSubmitSign').addEventListener('click', () => {
      if (!hasInk) {
        this.cb.onToast?.('请先手写签名，或点击「小夏自动签字」');
        return;
      }
      const now = new Date();
      const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      this.state.signedToday = true;
      this.state.signedAt = ts;
      this.state.signatureDataUrl = cv.toDataURL('image/png');
      this.addLog('课堂签到', `在逸夫教学楼 302《AI Agent 架构与 Loop》考勤纸完成手写签到（${ts}）。`, {
        sigUrl: this.state.signatureDataUrl,
      });
      this.cb.onStats?.({ focus: 6, mood: 4 });
      this.cb.onSpeech?.('签到纸签好啦！字迹挺工整的嘛～马上翻开 AI 教材准备上课！');
      this.cb.onToast?.('课堂签到成功，手写签字已存入数字人生记录！');
      this.render();
    });

    document.getElementById('btnNextToClass').addEventListener('click', () => {
      this.setPanel('textbook');
    });
  }

  // ==================== 2. 真实 AI 教材文档放大窗口 ====================
  _renderTextbook() {
    const allDocs = { ...TEXTBOOKS };
    for (const d of this.state.customDocs) allDocs[d.id] = d;
    const doc = allDocs[this.state.currentBookId] || TEXTBOOKS.agent_loop;
    const hlSet = new Set(this.state.highlights[doc.id] || []);
    const savedNote = this.state.notes[doc.id] || '';
    const sections = doc.sections || (doc.paragraphs || []).map((p, i) => ({ id: `p${i}`, heading: '', formula: '', body: p }));

    this.bodyEl.innerHTML = `
      <div class="doc-toolbar">
        <select id="textbookSelect" class="doc-select">
          ${Object.values(allDocs).map((d) => `<option value="${d.id}" ${d.id === doc.id ? 'selected' : ''}>📖 ${d.title || d.course}</option>`).join('')}
        </select>
        <div style="display:flex;gap:6px;">
          <button type="button" class="secondary-btn" id="btnImportDoc">📥 导入教材</button>
          <button type="button" class="secondary-btn" id="btnGoExam">📝 随堂考试 →</button>
        </div>
      </div>

      <div class="paper-sheet">
        <h3 class="sheet-title">${doc.title || doc.course}</h3>
        <div class="sheet-meta">${doc.chapter}<br>${doc.course || doc.room || ''} ${doc.author ? '｜ ' + doc.author : ''}</div>

        <div style="font-size:11px;color:#b45309;margin-bottom:8px;font-weight:700;">💡 点击任意正文段落即可用黄色荧光笔划重点并自动记录：</div>
        <div id="textbookParas">
          ${sections.map((sec, idx) => `
            ${sec.heading ? `<div style="font-size:13px;font-weight:800;color:#0f172a;margin:10px 0 4px;">${sec.heading}</div>` : ''}
            ${sec.formula ? `<div class="formula-box"><strong>核心公式：</strong><code>${sec.formula}</code></div>` : ''}
            <p class="book-para ${hlSet.has(idx) ? 'highlighted' : ''}" data-idx="${idx}">${sec.body}</p>
          `).join('')}
        </div>

        <label style="display:block;font-size:12px;font-weight:700;margin-top:12px;">✍️ 课堂实时笔记（自动保存至数字人生）：</label>
        <textarea id="classNoteArea" class="note-box" rows="3" placeholder="写下关于 Agent Loop / SKILL / MCP 的重点或思考...">${savedNote}</textarea>
        <div class="btn-row">
          <button type="button" class="primary-btn" id="btnSaveClassNote">💾 保存课堂笔记到人生记录</button>
        </div>
      </div>
    `;

    document.getElementById('textbookSelect').addEventListener('change', (e) => {
      this.state.currentBookId = e.target.value;
      this._saveState();
      this.render();
    });

    document.getElementById('btnImportDoc').addEventListener('click', () => {
      this.docImportMode = 'textbook';
      document.getElementById('docFileInput').click();
    });

    document.getElementById('btnGoExam').addEventListener('click', () => this.setPanel('exam'));

    document.querySelectorAll('#textbookParas .book-para').forEach((pEl) => {
      pEl.addEventListener('click', () => {
        const idx = parseInt(pEl.dataset.idx, 10);
        const list = new Set(this.state.highlights[doc.id] || []);
        if (list.has(idx)) list.delete(idx);
        else {
          list.add(idx);
          this.cb.onStats?.({ focus: 3 });
        }
        this.state.highlights[doc.id] = Array.from(list);
        this._saveState();
        pEl.classList.toggle('highlighted', list.has(idx));
      });
    });

    document.getElementById('btnSaveClassNote').addEventListener('click', () => {
      const val = document.getElementById('classNoteArea').value.trim();
      this.state.notes[doc.id] = val;
      if (val) {
        this.addLog('课堂笔记', `《${doc.course}》笔记：${val}`);
        this.cb.onStats?.({ focus: 8, mood: 3 });
        this.cb.onSpeech?.('这段重点记下来了！期末复习翻开就一目了然～');
        this.cb.onToast?.('课堂笔记已归档至林小夏数字人生记录！');
      } else {
        this._saveState();
      }
    });
  }

  // ==================== 3. 真实考试试卷放大窗口 ====================
  _renderExam() {
    const score = this.state.examScore;
    this.bodyEl.innerHTML = `
      <div class="paper-sheet exam-paper">
        ${score !== null ? `<div class="stamp-badge">${score} 分</div>` : ''}
        <h3 class="sheet-title">${EXAM_PAPER.title}</h3>
        <div class="sheet-meta">${EXAM_PAPER.meta}</div>

        <form id="examForm">
          ${EXAM_PAPER.questions.map((q) => {
            const picked = this.state.examAnswers[q.id];
            return `
              <div class="exam-q">
                <div class="exam-q-title">${q.stem} <span style="color:#64748b;font-weight:500;">(${q.score}分)</span></div>
                ${q.options.map((opt) => `
                  <label class="exam-opt">
                    <input type="radio" name="${q.id}" value="${opt.key}" ${picked === opt.key ? 'checked' : ''}>
                    <span><strong>${opt.key}.</strong> ${opt.text}</span>
                    ${score !== null && opt.key === q.answer ? '<strong style="color:#15803d;margin-left:auto;">✓ 正确答案</strong>' : ''}
                  </label>
                `).join('')}
                ${score !== null && q.explain ? `<div style="font-size:11.5px;color:#0f766e;background:#f0fdfa;padding:6px 9px;border-radius:7px;margin-top:5px;">💡 解析：${q.explain}</div>` : ''}
              </div>
            `;
          }).join('')}
          <div class="btn-row">
            <button type="submit" class="primary-btn">📮 交卷并红笔批改</button>
            <button type="button" class="secondary-btn" id="btnResetExam">重新作答</button>
          </div>
        </form>
      </div>
    `;

    document.getElementById('examForm').addEventListener('submit', (e) => {
      e.preventDefault();
      let total = 0;
      const fd = new FormData(e.currentTarget);
      for (const q of EXAM_PAPER.questions) {
        const val = fd.get(q.id) || '';
        this.state.examAnswers[q.id] = val;
        if (val === q.answer) total += q.score;
      }
      this.state.examScore = total;
      const grade = total >= 90 ? 'A+' : total >= 75 ? 'B+' : '加油';
      this.addLog('真实考试', `完成${EXAM_PAPER.title}，成绩：${total} 分（${grade}）。`);
      this.cb.onStats?.({ focus: 10, mood: total >= 75 ? 10 : -4, energy: -6 });
      this.cb.onSpeech?.(total >= 75 ? `耶！AI Agent 期中测验拿了 ${total} 分！去实验室跑个 Loop 庆祝一下～` : `考了 ${total} 分，解析我都记下来了，再复习一遍 SKILL 与 Loop！`);
      this.cb.onToast?.(`试卷批改完成：${total} 分，已记入学习档案！`);
      this.render();
    });

    document.getElementById('btnResetExam').addEventListener('click', () => {
      this.state.examAnswers = {};
      this.state.examScore = null;
      this._saveState();
      this.render();
    });
  }

  // ==================== 3.5 AI 智能体实验室 · Agent Loop & SKILL 调试台 ====================
  _renderLab() {
    this.bodyEl.innerHTML = `
      <div class="paper-sheet">
        <h3 class="sheet-title">🧪 AI 智能体实验室 · Agentic Loop 调试台</h3>
        <div class="sheet-meta">创新楼 B204 ｜ 已完成实验运行：<strong>${this.state.labRuns || 0} 次</strong></div>

        <div style="font-size:12px;font-weight:700;margin-bottom:6px;">1. 选择要渐进式挂载的 SKILL 技能包：</div>
        <div class="lab-skill-chips">
          ${LAB_SKILLS.map((sk) => `
            <button type="button" class="lab-skill-chip ${this.labSelectedSkills.has(sk.id) ? 'on' : ''}" data-sk="${sk.id}">
              <span>${this.labSelectedSkills.has(sk.id) ? '☑' : '☐'}</span>
              <div><strong>${sk.name}</strong><span>${sk.desc}</span></div>
            </button>
          `).join('')}
        </div>

        <div style="font-size:12px;font-weight:700;margin-bottom:6px;">2. 输入或点选实验任务（Prompt）：</div>
        <textarea id="labTaskInput" class="note-box" rows="2">${this.labTaskText}</textarea>
        <div class="btn-row" style="margin-top:8px;">
          <button type="button" class="primary-btn" id="btnRunLoop" ${this.labRunning ? 'disabled' : ''}>
            ${this.labRunning ? '⏳ Agent Loop 执行中...' : '▶ 运行 Agentic Loop'}
          </button>
          <button type="button" class="secondary-btn" id="btnNextLabPreset">🎲 换个实验题</button>
        </div>

        <div class="lab-console" id="labConsole">
          ${this.labSteps.length
            ? this.labSteps.map((s) => `<div class="lab-step ${s.cls}">${s.text}</div>`).join('')
            : '<div style="color:#64748b;">// 点击「运行 Agentic Loop」，观察 Observe → Think → Load SKILL → Act → Reflect 完整执行轨迹...</div>'}
        </div>
      </div>
    `;

    this.bodyEl.querySelectorAll('.lab-skill-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.sk;
        if (this.labSelectedSkills.has(id)) this.labSelectedSkills.delete(id);
        else this.labSelectedSkills.add(id);
        this.render();
      });
    });

    const inputEl = document.getElementById('labTaskInput');
    inputEl.addEventListener('input', () => { this.labTaskText = inputEl.value; });

    document.getElementById('btnNextLabPreset').addEventListener('click', () => {
      const idx = (LAB_PRESET_TASKS.indexOf(this.labTaskText) + 1) % LAB_PRESET_TASKS.length;
      this.labTaskText = LAB_PRESET_TASKS[idx];
      this.render();
    });

    document.getElementById('btnRunLoop').addEventListener('click', () => {
      if (this.labRunning) return;
      const skills = Array.from(this.labSelectedSkills);
      const task = (this.labTaskText || LAB_PRESET_TASKS[0]).trim();
      this.labRunning = true;
      this.labSteps = [];
      this.render();

      const trace = [
        { cls: 'think', text: `[Step 1 · Think] 解析任务目标：「${task.slice(0, 36)}${task.length > 36 ? '...' : ''}」` },
        { cls: 'act', text: `[Step 2 · Load SKILL] 渐进式披露加载 ${skills.length ? skills.join(', ') : 'base-reasoning-skill'} 的 SKILL.md` },
        { cls: 'obs', text: `[Step 3 · MCP Call & Observe] 调用本地工具并回收结构化 Observation（耗时 0.42s，Token 占用 -38%）` },
        { cls: 'think', text: `[Step 4 · Reflect] 自检校验 Stop Condition：无重复报错、覆盖全部要点、幻觉检查 PASS` },
        { cls: 'done', text: `[Step 5 · Done ✓] Agentic Loop 在 4 步内稳定收敛！实验报告已自动归档至人生记录。` },
      ];

      trace.forEach((step, idx) => {
        setTimeout(() => {
          this.labSteps.push(step);
          const con = document.getElementById('labConsole');
          if (con) {
            con.innerHTML = this.labSteps.map((s) => `<div class="lab-step ${s.cls}">${s.text}</div>`).join('');
            con.scrollTop = con.scrollHeight;
          }
          if (idx === trace.length - 1) {
            this.labRunning = false;
            this.state.labRuns = (this.state.labRuns || 0) + 1;
            this.addLog('AI 实验室', `在创新楼 B204 跑通 Agent Loop（挂载 ${skills.length || 1} 个 SKILL）：${task.slice(0, 42)}`);
            this.cb.onStats?.({ focus: 9, mood: 6, energy: -4 });
            this.cb.onSpeech?.('太棒啦！这条 Agentic Loop 4 步就稳定收敛通过 Eval 了！');
            this.cb.onToast?.('Agent Loop 实验运行成功，已写入数字人生档案！');
            this.render();
          }
        }, 320 * (idx + 1));
      });
    });
  }

  // ==================== 4.5 紫荆园食堂 · 校园干饭点餐台 ====================
  _renderCanteen() {
    this.bodyEl.innerHTML = `
      <div class="paper-sheet">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h3 class="sheet-title" style="margin:0;">🍜 紫荆园食堂二楼</h3>
          <span style="font-weight:900;color:#ea580c;font-size:15px;">校园卡：¥${this.state.wallet.toFixed(2)}</span>
        </div>
        <div class="sheet-meta" style="text-align:left;margin-bottom:12px;">
          一楼经典自选 / 二楼铁板麻辣烫 · 今日已干饭 <strong>${this.state.mealsToday || 0} 顿</strong>（点击窗口点餐并记入账本）
        </div>
        <div class="mall-grid">
          ${CANTEEN_MENU.map((item) => `
            <div class="mall-item">
              <span class="canteen-badge">${item.window}</span>
              <div style="font-size:24px;">${item.icon}</div>
              <div style="font-weight:700;font-size:13px;margin-top:4px;">${item.name}</div>
              <div class="mall-price">¥${item.price}</div>
              <div style="font-size:11px;color:#64748b;margin-bottom:6px;">精力 +${item.energy} · 心情 +${item.mood}</div>
              <button type="button" class="primary-btn" style="width:100%;padding:6px 8px;font-size:12px;" data-meal="${item.id}">刷卡打饭</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.bodyEl.querySelectorAll('[data-meal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = CANTEEN_MENU.find((m) => m.id === btn.dataset.meal);
        if (!item) return;
        if (this.state.wallet < item.price) {
          this.cb.onToast?.('校园卡余额不足啦～');
          return;
        }
        this.state.wallet -= item.price;
        this.state.mealsToday = (this.state.mealsToday || 0) + 1;
        this.addLog('食堂干饭', `在紫荆园食堂（${item.window}）吃了「${item.name}」（-¥${item.price}，余额 ¥${this.state.wallet.toFixed(2)}）。`);
        this.cb.onStats?.({ energy: item.energy, mood: item.mood });
        this.cb.onSpeech?.(`哇，${item.name}热乎乎的超好吃！精力瞬间回满，下午继续冲 AI 实验！`);
        this.cb.onToast?.(`刷卡成功：${item.name}（-¥${item.price}）`);
        this.render();
      });
    });
  }

  // ==================== 4. 图书馆自习 · 真实选书与番茄钟窗口 ====================
  _renderLibrary() {
    const books = [...LIBRARY_BOOKS, ...this.state.customBooks];
    const activeBook = books.find((b) => b.id === this.state.selectedLibBookId) || books[0];
    const pageIdx = Math.min(this.state.libPageIdx, activeBook.pages.length - 1);
    const mm = String(Math.floor(this.pomoSec / 60)).padStart(2, '0');
    const ss = String(this.pomoSec % 60).padStart(2, '0');

    this.bodyEl.innerHTML = `
      <div class="pomo-box">
        <div>
          <div style="font-size:11px;color:#94a3b8;">图书馆伴学番茄钟</div>
          <div class="pomo-time" id="pomoClock">${mm}:${ss}</div>
        </div>
        <div style="display:flex;gap:6px;">
          <button type="button" class="secondary-btn" id="btnPomoToggle">${this.pomoRunning ? '⏸ 暂停' : '▶ 开始自习'}</button>
          <button type="button" class="secondary-btn" id="btnImportBook">📥 导入图书</button>
        </div>
      </div>

      <div style="font-size:12px;font-weight:700;margin-bottom:7px;">📚 中心图书馆三楼书架（点选图书翻阅）：</div>
      <div class="bookshelf-grid">
        ${books.map((b) => `
          <button type="button" class="book-card ${b.id === activeBook.id ? 'active' : ''}" data-book="${b.id}">
            <div class="book-spine">${b.tag || b.category || 'AI 精选'}</div>
            <div class="book-name">${b.title.startsWith('《') ? b.title : `《${b.title}》`}</div>
            <div class="book-author">${b.author}</div>
          </button>
        `).join('')}
      </div>

      <div class="paper-sheet">
        <h3 class="sheet-title">${activeBook.title.startsWith('《') ? activeBook.title : `《${activeBook.title}》`}</h3>
        <div class="sheet-meta">${activeBook.author} · 第 ${pageIdx + 1} / ${activeBook.pages.length} 页</div>
        <p class="book-para" style="cursor:default;">${activeBook.pages[pageIdx]}</p>
        <div class="btn-row" style="justify-content:space-between;">
          <div style="display:flex;gap:6px;">
            <button type="button" class="secondary-btn" id="btnPrevPage">← 上一页</button>
            <button type="button" class="secondary-btn" id="btnNextPage">下一页 →</button>
          </div>
          <button type="button" class="primary-btn" id="btnQuoteBook">✨ 摘录进人生记录</button>
        </div>
      </div>
    `;

    document.querySelectorAll('.book-card').forEach((card) => {
      card.addEventListener('click', () => {
        this.state.selectedLibBookId = card.dataset.book;
        this.state.libPageIdx = 0;
        this._saveState();
        this.cb.onSpeech?.(`从书架取下了《${books.find((x) => x.id === card.dataset.book)?.title}》，慢慢读几页～`);
        this.render();
      });
    });

    document.getElementById('btnImportBook').addEventListener('click', () => {
      this.docImportMode = 'library';
      document.getElementById('docFileInput').click();
    });

    document.getElementById('btnPrevPage').addEventListener('click', () => {
      this.state.libPageIdx = Math.max(0, pageIdx - 1);
      this.render();
    });
    document.getElementById('btnNextPage').addEventListener('click', () => {
      this.state.libPageIdx = (pageIdx + 1) % activeBook.pages.length;
      this.render();
    });

    document.getElementById('btnQuoteBook').addEventListener('click', () => {
      this.addLog('读书摘录', `在中心图书馆阅读《${activeBook.title}》摘录：“${activeBook.pages[pageIdx].slice(0, 62)}...”`);
      this.cb.onStats?.({ focus: 8, mood: 6 });
      this.cb.onToast?.('已摘录到林小夏的数字人生记录！');
    });

    document.getElementById('btnPomoToggle').addEventListener('click', () => {
      this.pomoRunning = !this.pomoRunning;
      clearInterval(this.pomoTimer);
      if (this.pomoRunning) {
        this.cb.onSpeech?.('25 分钟图书馆伴学番茄钟开始！我们一起沉浸专注～');
        this.pomoTimer = setInterval(() => {
          this.pomoSec = Math.max(0, this.pomoSec - 1);
          const el = document.getElementById('pomoClock');
          if (el) el.textContent = `${String(Math.floor(this.pomoSec / 60)).padStart(2, '0')}:${String(this.pomoSec % 60).padStart(2, '0')}`;
          if (this.pomoSec === 0) {
            clearInterval(this.pomoTimer);
            this.pomoRunning = false;
            this.pomoSec = 25 * 60;
            this.addLog('图书馆自习', '完成 1 个 25 分钟图书馆专注番茄钟！');
            this.cb.onToast?.('🎉 25 分钟伴学番茄钟完成，已写入人生记录！');
          }
        }, 1000);
      }
      this.render();
    });
  }

  // ==================== 5. 体育场运动打卡窗口 ====================
  _renderStadium() {
    this.bodyEl.innerHTML = `
      <div class="paper-sheet">
        <h3 class="sheet-title">🏟 南区体育场 · 今日运动记录</h3>
        <div class="sheet-meta">林小夏正在手绘球场进行投篮热身与体能训练</div>
        <div class="stats-grid" style="grid-template-columns:repeat(2,1fr);margin-bottom:14px;">
          <div class="stat-pill vitality" style="padding:12px;">
            <strong style="font-size:22px;">${this.state.hoopsMade} 球</strong>
            <span>今日投篮命中</span>
          </div>
          <div class="stat-pill energy" style="padding:12px;">
            <strong style="font-size:22px;">${this.state.runKm.toFixed(1)} km</strong>
            <span>操场慢跑里程</span>
          </div>
        </div>
        <div class="btn-row">
          <button type="button" class="primary-btn" id="btnShootPack">🏀 投一组十球（打卡）</button>
          <button type="button" class="secondary-btn" id="btnRunPack">🏃‍♀️ 操场慢跑 1.5km</button>
        </div>
      </div>
    `;

    document.getElementById('btnShootPack').addEventListener('click', () => {
      const made = 7 + Math.floor(Math.random() * 4);
      this.state.hoopsMade += made;
      this.addLog('体育运动', `在南区体育场2号球场完成一组十球投篮，命中 ${made}/10 球！`);
      this.cb.onStats?.({ vitality: 12, mood: 8, energy: -6 });
      this.cb.onSpeech?.(`唰！这组投进了 ${made} 个球，出点汗整个人都轻松啦！`);
      this.cb.onToast?.(`运动打卡成功：命中 ${made} 球！`);
      this.render();
    });

    document.getElementById('btnRunPack').addEventListener('click', () => {
      this.state.runKm += 1.5;
      this.addLog('体育运动', `在体育场塑胶跑道慢跑 1.5km（今日累计 ${this.state.runKm.toFixed(1)}km）。`);
      this.cb.onStats?.({ vitality: 10, mood: 6, energy: -8 });
      this.cb.onSpeech?.('晚风吹着跑完 1.5 公里，配速稳稳的！');
      this.render();
    });
  }

  // ==================== 6. 大学城购物中心窗口 ====================
  _renderMall() {
    this.bodyEl.innerHTML = `
      <div class="paper-sheet">
        <h3 class="sheet-title">🛍 大学城购物中心 · 休闲消费</h3>
        <div class="sheet-meta">本周零花钱余额：<strong style="color:#b45309;">¥${this.state.wallet.toFixed(2)}</strong></div>
        <div class="shop-grid">
          ${MALL_ITEMS.map((item) => `
            <button type="button" class="shop-item" data-buy="${item.id}">
              <div style="font-size:20px;">${item.icon}</div>
              <div style="font-size:13px;font-weight:800;">${item.name}</div>
              <div style="font-size:11px;color:#b45309;font-weight:700;">¥${item.price} · ${item.effect}</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    document.querySelectorAll('.shop-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = MALL_ITEMS.find((x) => x.id === btn.dataset.buy);
        if (!item) return;
        if (this.state.wallet < item.price) {
          this.cb.onToast?.('本周零花钱余额不足啦！');
          return;
        }
        this.state.wallet -= item.price;
        this.addLog('校园消费', `在大学城购物中心购买了 ${item.icon} ${item.name}（-¥${item.price}，余额 ¥${this.state.wallet}）。`);
        this.cb.onStats?.(item.stats);
        this.cb.onSpeech?.(`买到了 ${item.icon} ${item.name}！逛大学城购物中心好治愈呀～`);
        this.cb.onToast?.(`已记账：${item.name} -¥${item.price}`);
        this.render();
      });
    });
  }

  // ==================== 7. 数字人生真实记录时间轴 + 导出 ====================
  _renderLifeLog() {
    this.bodyEl.innerHTML = `
      <div class="doc-toolbar">
        <strong style="font-size:13.5px;">📓 林小夏的真实数字人生档案（${this.state.logs.length} 条）</strong>
        <button type="button" class="primary-btn" id="btnExportLog" style="padding:6px 10px;font-size:11.5px;">📥 导出日记 (.md)</button>
      </div>
      <div class="log-list">
        ${this.state.logs.map((item) => `
          <div class="log-entry">
            <div class="log-head">
              <strong>[${item.tag}]</strong>
              <span>${item.time}</span>
            </div>
            <div>${item.text}</div>
            ${item.sigUrl ? `<img class="log-sig-img" src="${item.sigUrl}" alt="手写签到留存">` : ''}
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('btnExportLog').addEventListener('click', () => {
      const md = [
        `# 林小夏的数字人生记录 (${new Date().toLocaleDateString('zh-CN')})`,
        '',
        ...this.state.logs.map((l) => `- **${l.time} [${l.tag}]** ${l.text}`),
      ].join('\n');
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lin-xiaoxia-life-log.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      this.cb.onToast?.('已导出 Markdown 数字人生记录！');
    });
  }

  async _handleDocImport(file) {
    if (!file) return;
    const text = await file.text();
    const paras = text.split(/\r?\n\s*\r?\n/).map((s) => s.trim()).filter(Boolean);
    if (!paras.length) return;
    const id = 'custom_' + Date.now();
    if (this.docImportMode === 'library') {
      this.state.customBooks.push({ id, category: '本地导入', title: file.name.replace(/\.(txt|md|markdown)$/i, ''), author: '我的书架', pages: paras });
      this.state.selectedLibBookId = id;
      this.state.libPageIdx = 0;
      this.addLog('图书馆选书', `导入本地图书《${file.name}》并开始在图书馆自习阅读。`);
    } else {
      this.state.customDocs.push({ id, course: file.name, chapter: '本地导入学习文档', room: '自定义学习资料', formula: '', paragraphs: paras });
      this.state.currentBookId = id;
      this.addLog('教材导入', `导入本地教材《${file.name}》用于课堂学习。`);
    }
    this._saveState();
    this.cb.onToast?.(`已导入：${file.name}`);
    this.render();
  }
}
