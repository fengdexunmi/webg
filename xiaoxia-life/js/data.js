// Real Campus Data for 《林小夏的数字人生》
// 7 Hand-Drawn Campus Buildings (Outdoor + Indoor), AI Agent / SKILL / Loop Curriculum,
// Real Attendance Sheet, AI Textbooks, Exam Paper, AI Lab Loop Simulator, Canteen Menu, Library & Mall

export const BUILDINGS = {
  dorm: {
    id: 'dorm',
    name: '梅园 402 宿舍',
    shortName: '梅园宿舍',
    icon: '🏠',
    x: 240,
    width: 240,
    height: 215,
    accent: '#f59e0b',
    defaultPanel: 'lifelog',
    defaultPose: 'idle',
    indoorTitle: '梅园 402 宿舍 · 上床下桌小窝',
    indoorHint: '手绘上床下桌、暖光台灯与日记书桌，睡醒后出门沿林荫道去上课吧～',
    speech: '回到梅园402啦！上床下桌暖烘烘的，整理一下今天的 AI 笔记和数字人生档案～',
  },
  teaching: {
    id: 'teaching',
    name: '逸夫教学楼 302',
    shortName: '逸夫教学楼',
    icon: '🏫',
    x: 780,
    width: 280,
    height: 235,
    accent: '#2563eb',
    defaultPanel: 'checkin',
    defaultPose: 'study',
    indoorTitle: '逸夫楼 302 阶梯教室 · AI Agent 课堂',
    indoorHint: '黑板上画着 Agentic Loop 流程图，请在右侧先完成纸质考勤签到，再翻开教材听课！',
    speech: '坐到逸夫楼302前三排啦！快在右侧签到纸上签个名，再翻开《AI Agent 与 Loop》教材～',
  },
  lab: {
    id: 'lab',
    name: 'AI 智能体实验室',
    shortName: 'AI 实验室',
    icon: '🧪',
    x: 1320,
    width: 265,
    height: 225,
    accent: '#0891b2',
    defaultPanel: 'lab',
    defaultPose: 'study',
    indoorTitle: '创新楼 B204 · AI Agent & SKILL 实验室',
    indoorHint: '双联屏工作站与 GPU 算力机柜已就绪，在右侧挂载 SKILL 跑一轮真实 Agent Loop 吧！',
    speech: '来到 AI 实验室！双屏显卡已经热好身，快来右侧挂载 SKILL 跑通一条 Agent Loop！',
  },
  library: {
    id: 'library',
    name: '中心图书馆三楼',
    shortName: '中心图书馆',
    icon: '📚',
    x: 1860,
    width: 270,
    height: 245,
    accent: '#0d9488',
    defaultPanel: 'library',
    defaultPose: 'read',
    indoorTitle: '中心图书馆三楼 · 落地窗自习区',
    indoorHint: '木质书架墙与阳光落地窗，小橘猫在窗台打盹～在右侧选一本 AI 好书开启番茄钟！',
    speech: '图书馆三楼靠窗位超安静！小橘猫还在打盹，在右侧书架挑本书开启伴学番茄钟吧～',
  },
  canteen: {
    id: 'canteen',
    name: '紫荆园食堂二楼',
    shortName: '紫荆园食堂',
    icon: '🍜',
    x: 2400,
    width: 255,
    height: 215,
    accent: '#ea580c',
    defaultPanel: 'canteen',
    defaultPose: 'idle',
    indoorTitle: '紫荆园食堂二楼 · 烟火干饭大厅',
    indoorHint: '打菜窗口热气腾腾，在右侧窗口点一份校园美食补充精力与好心情吧！',
    speech: '好香呀！紫荆园食堂二楼的照烧鸡排和麻辣烫出锅啦，快在右侧点餐干饭～',
  },
  stadium: {
    id: 'stadium',
    name: '南区体育场·2号球场',
    shortName: '体育场',
    icon: '🏀',
    x: 2940,
    width: 275,
    height: 215,
    accent: '#e11d48',
    defaultPanel: 'stadium',
    defaultPose: 'shoot',
    indoorTitle: '南区体育场 · 2号阳光半场',
    indoorHint: '写完 Agent 代码也要动起来！在右侧投篮或慢跑打卡，活力瞬间拉满！',
    speech: '换上球鞋到2号球场啦！在右侧点「投一组十球」或「慢跑打卡」，把活力值拉满！',
  },
  mall: {
    id: 'mall',
    name: '大学城购物中心',
    shortName: '购物中心',
    icon: '🛍',
    x: 3480,
    width: 275,
    height: 228,
    accent: '#7c3aed',
    defaultPanel: 'mall',
    defaultPose: 'wave',
    indoorTitle: '大学城购物中心 · 奶茶与文创中庭',
    indoorHint: '逛逛校园文创与奶茶吧台，犒劳努力学习 AI 的自己，消费自动记入生活账本～',
    speech: '逛到大学城购物中心啦！在右侧挑杯生椰冰拿铁或实用小物，犒劳一下自己吧～',
  },
};

export const BUILDING_ORDER = ['dorm', 'teaching', 'lab', 'library', 'canteen', 'stadium', 'mall'];

export const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// 真实中国大学生「人工智能与智能体工程（大二）」每日日程与周课表
export const SCHEDULE_SLOTS = [
  {
    id: 's1',
    label: '07:30-07:55',
    range: [450, 475],
    cells: [
      { title: '起床洗漱出发', bldg: 'dorm', panel: 'lifelog' },
      { title: '起床洗漱出发', bldg: 'dorm', panel: 'lifelog' },
      { title: '起床洗漱出发', bldg: 'dorm', panel: 'lifelog' },
      { title: '起床洗漱出发', bldg: 'dorm', panel: 'lifelog' },
      { title: '起床洗漱出发', bldg: 'dorm', panel: 'lifelog' },
      { title: '周末自然醒', bldg: 'dorm', panel: 'lifelog' },
      { title: '周末赖床充电', bldg: 'dorm', panel: 'lifelog' },
    ],
  },
  {
    id: 's2',
    label: '08:00-09:40',
    range: [480, 580],
    cells: [
      { title: 'AI Agent与Loop', bldg: 'teaching', panel: 'checkin', courseId: 'agent_loop' },
      { title: 'SKILL与MCP工程', bldg: 'teaching', panel: 'checkin', courseId: 'skill_mcp' },
      { title: 'AI Agent与Loop', bldg: 'teaching', panel: 'textbook', courseId: 'agent_loop' },
      { title: 'Agent期中测验', bldg: 'teaching', panel: 'exam', courseId: 'agent_loop' },
      { title: 'SKILL与MCP工程', bldg: 'teaching', panel: 'checkin', courseId: 'skill_mcp' },
      { title: '图书馆读论文', bldg: 'library', panel: 'library' },
      { title: '体育场晨练投篮', bldg: 'stadium', panel: 'stadium' },
    ],
  },
  {
    id: 's3',
    label: '10:00-11:40',
    range: [600, 700],
    cells: [
      { title: 'Agent Loop上机', bldg: 'lab', panel: 'lab' },
      { title: 'SKILL编排实验', bldg: 'lab', panel: 'lab' },
      { title: '上下文工程实战', bldg: 'lab', panel: 'lab' },
      { title: '多Agent协作实验', bldg: 'lab', panel: 'lab' },
      { title: '图书馆复盘笔记', bldg: 'library', panel: 'library' },
      { title: '购物中心逛街', bldg: 'mall', panel: 'mall' },
      { title: '中心图书馆自习', bldg: 'library', panel: 'library' },
    ],
  },
  {
    id: 's4',
    label: '11:50-13:30',
    range: [710, 810],
    cells: [
      { title: '紫荆园食堂午餐', bldg: 'canteen', panel: 'canteen' },
      { title: '紫荆园食堂午餐', bldg: 'canteen', panel: 'canteen' },
      { title: '紫荆园食堂午餐', bldg: 'canteen', panel: 'canteen' },
      { title: '紫荆园食堂午餐', bldg: 'canteen', panel: 'canteen' },
      { title: '紫荆园食堂午餐', bldg: 'canteen', panel: 'canteen' },
      { title: '食堂改善伙食', bldg: 'canteen', panel: 'canteen' },
      { title: '食堂热面早午餐', bldg: 'canteen', panel: 'canteen' },
    ],
  },
  {
    id: 's5',
    label: '14:00-16:30',
    range: [840, 990],
    cells: [
      { title: '图书馆AI自习', bldg: 'library', panel: 'library' },
      { title: 'Agent Loop调优', bldg: 'lab', panel: 'lab' },
      { title: 'SKILL专题精讲', bldg: 'teaching', panel: 'textbook', courseId: 'skill_mcp' },
      { title: '图书馆番茄伴学', bldg: 'library', panel: 'library' },
      { title: '随堂模拟考试', bldg: 'teaching', panel: 'exam', courseId: 'agent_loop' },
      { title: '体育场篮球赛', bldg: 'stadium', panel: 'stadium' },
      { title: '大学城喝奶茶', bldg: 'mall', panel: 'mall' },
    ],
  },
  {
    id: 's6',
    label: '17:00-18:45',
    range: [1020, 1125],
    cells: [
      { title: '操场投篮与慢跑', bldg: 'stadium', panel: 'stadium' },
      { title: '紫荆园食堂晚餐', bldg: 'canteen', panel: 'canteen' },
      { title: '操场投篮与慢跑', bldg: 'stadium', panel: 'stadium' },
      { title: '购物中心补给', bldg: 'mall', panel: 'mall' },
      { title: '紫荆园食堂聚餐', bldg: 'canteen', panel: 'canteen' },
      { title: '紫荆园食堂晚餐', bldg: 'canteen', panel: 'canteen' },
      { title: '操场落日散步', bldg: 'stadium', panel: 'stadium' },
    ],
  },
  {
    id: 's7',
    label: '19:15-21:30',
    range: [1155, 1290],
    cells: [
      { title: '图书馆晚间自习', bldg: 'library', panel: 'library' },
      { title: 'AI实验室刷Eval', bldg: 'lab', panel: 'lab' },
      { title: '图书馆晚间自习', bldg: 'library', panel: 'library' },
      { title: '实验室调试MCP', bldg: 'lab', panel: 'lab' },
      { title: '购物中心放松', bldg: 'mall', panel: 'mall' },
      { title: '宿舍整理复盘', bldg: 'dorm', panel: 'lifelog' },
      { title: '宿舍规划下周', bldg: 'dorm', panel: 'lifelog' },
    ],
  },
];

// 真实纸质签到表同行名单
export const ATTENDANCE_ROSTER = [
  { seat: '01', sid: '2025040201', name: '陈思远', status: 'signed', time: '07:54' },
  { seat: '02', sid: '2025040207', name: '周语桐', status: 'signed', time: '07:56' },
  { seat: '03', sid: '2025040212', name: '许嘉豪', status: 'signed', time: '07:57' },
  { seat: '04', sid: '2025040218', name: '林小夏', status: 'self', time: '--:--' },
  { seat: '05', sid: '2025040223', name: '沈知微', status: 'signed', time: '07:58' },
];

// AI 核心教材文档（SKILL / Agent / Loop / MCP / Context Engineering）
export const TEXTBOOKS = {
  agent_loop: {
    id: 'agent_loop',
    title: '《AI Agent 系统架构与 Agentic Loop 实战》',
    course: 'AI Agent 架构与 Loop · 逸夫楼 302',
    author: '人工智能学院 · 智能体工程教研室',
    chapter: '第 3 章 · Agentic Loop 闭环与上下文工程（Context Engineering）',
    sections: [
      {
        id: 'al-1',
        heading: '3.1 什么是 Agentic Loop（智能体执行闭环）？',
        body: '传统单轮问答只执行一次 Prompt → Completion，而真正的 AI Agent 围绕一个持续迭代的 Agentic Loop 运行：每一轮依次经历 Observe（观察环境与工具返回）→ Think（基于目标规划下一步）→ Act（调用工具/执行动作）→ Reflect（校验结果是否达成完成条件）。只有当完成条件满足、需要用户决策或达到安全步数上限时，循环才会收敛退出。',
      },
      {
        id: 'al-2',
        heading: '3.2 Loop 收敛公式与停止条件（Stop Condition）',
        formula: 'State(t+1) = Observe(Act(Think(State(t), Memory, Tools)))   until  Done(State) ∨ t ≥ MaxSteps',
        body: '工程实践中必须为 Agent Loop 设计三重防死循环护栏：① 显式完成判据（例如单测全部通过或校验器返回 PASS）；② 重复动作检测（连续两次相同报错参数自动触发反思或切换策略）；③ Token 与步数预算上限（MaxSteps / Budget Cap），防止失控消耗。',
      },
      {
        id: 'al-3',
        heading: '3.3 上下文工程（Context Engineering）与记忆分层',
        body: '大模型上下文窗口是 Agent 最宝贵的“工作内存”。优秀的 Context Engineering 将信息分为四层：系统指令层（System Rules）、按需挂载的技能层（Active SKILLs）、短期工作流轨迹（Recent Tool Observations）以及持久化外部记忆（Vector/Markdown Memory）。当对话变长时，通过结构化摘要（Compaction）保留关键决策与文件路径，清理冗余日志噪音。',
      },
    ],
  },
  skill_mcp: {
    id: 'skill_mcp',
    title: '《SKILL 技能系统、Tool Use 与 MCP 协议工程》',
    course: 'SKILL 与 MCP 工具工程 · 逸夫楼 302',
    author: '人工智能学院 · 开源生态与协议教研室',
    chapter: '第 2 章 · SKILL.md 渐进式披露与 MCP 标准化工具编排',
    sections: [
      {
        id: 'sm-1',
        heading: '2.1 SKILL 的核心设计：声明式能力封装与渐进式披露',
        body: 'SKILL（技能包）将某一领域的最佳实践、工作流规范、参考文档与可执行脚本打包在一个独立目录中（核心入口为 SKILL.md）。为了不撑爆上下文窗口，Agent 采用“渐进式披露（Progressive Disclosure）”：平时仅在系统提示中保留每个 SKILL 的简短 name 与 description；只有当用户任务命中该技能时，才按需读取完整的 SKILL.md 与 scripts/，实现高扩展性与低 Token 开销的平衡。',
      },
      {
        id: 'sm-2',
        heading: '2.2 Tool Use 与 MCP（Model Context Protocol）协议',
        formula: 'Agent Host  <── JSON-RPC 2.0 ──>  MCP Server  ──>  Tools / Resources / Prompts',
        body: '早期每个 Agent 框架都要为数据库、浏览器、GitHub 单独写一套插件胶水代码（M × N 集成困境）。MCP 通过统一的客户端-服务端协议，将工具（Tools）、只读资源（Resources）和提示模板（Prompts）标准化暴露，让任意合规 Agent 即插即用地安全调用外部能力。',
      },
      {
        id: 'sm-3',
        heading: '2.3 Multi-Agent 分治与 Eval 评测闭环',
        body: '面对复杂长链路任务，主 Agent（Coordinator）可将独立子任务委派给专职 Subagent（如研究型、浏览器操作型、代码验证型），避免单一上下文污染；同时用自动化 Eval 基准持续度量任务完成率、工具调用准确率与端到端延迟，驱动 Prompt 与 SKILL 的持续迭代。',
      },
    ],
  },
};

// 真实 AI 课程随堂测验试卷（支持红笔自动批改）
export const EXAM_PAPER = {
  id: 'midterm-ai-agent-2026',
  title: '《人工智能与 AI Agent 工程》期中随堂测验（A卷）',
  meta: '考试时间：45 分钟 · 满分：100 分 · 考生：林小夏（2025040218）',
  questions: [
    {
      id: 'q1',
      score: 25,
      stem: '1. 在标准的 Agentic Loop 执行闭环中，最核心的四阶段流转顺序是？',
      options: [
        { key: 'A', text: 'Train → Deploy → Log → Restart' },
        { key: 'B', text: 'Observe → Think → Act → Reflect（持续循环直至满足停止条件）' },
        { key: 'C', text: 'Prompt → Output → Exit（单轮直接结束）' },
        { key: 'D', text: 'Tokenize → Embed → Sort → Print' },
      ],
      answer: 'B',
      explain: 'Agent 与普通单轮对话的本质区别在于能够观察工具返回结果、反思并多轮迭代直到任务达成。',
    },
    {
      id: 'q2',
      score: 25,
      stem: '2. SKILL 系统采用“渐进式披露（Progressive Disclosure）”架构的主要工程目的是？',
      options: [
        { key: 'A', text: '把所有 SKILL 的全文一次性全部塞进 System Prompt' },
        { key: 'B', text: '禁止 Agent 读取任何外部脚本和参考资料' },
        { key: 'C', text: '平时仅暴露简短描述，命中任务时再按需加载完整 SKILL.md，兼顾扩展性与上下文窗口效率' },
        { key: 'D', text: '将模型权重文件压缩为图片格式' },
      ],
      answer: 'C',
      explain: '按需加载 SKILL.md 可避免无关技能占用宝贵的 Context Window，同时保持技能库无限扩展。',
    },
    {
      id: 'q3',
      score: 25,
      stem: '3. MCP（Model Context Protocol）协议在 AI Agent 生态中解决的核心痛点是？',
      options: [
        { key: 'A', text: '统一 Agent 与外部工具/数据源的接入标准，消除 M × N 重复适配胶水代码' },
        { key: 'B', text: '替代显卡硬件进行矩阵乘法计算' },
        { key: 'C', text: '强制所有网页改用纯文本排版' },
        { key: 'D', text: '自动绕过所有权限校验与沙箱边界' },
      ],
      answer: 'A',
      explain: 'MCP 用标准化的 Tools / Resources / Prompts 协议连接各类 Host 与 Server，实现即插即用。',
    },
    {
      id: 'q4',
      score: 25,
      stem: '4. 当 Agent Loop 连续两次调用同一工具均报相同错误时，最佳实践是？',
      options: [
        { key: 'A', text: '无限重试直到耗尽全部 Token 预算' },
        { key: 'B', text: '立即清空用户的全部本地文件' },
        { key: 'C', text: '触发 Reflect 反思、分析报错根因并调整参数/切换策略，必要时向用户汇报阻塞点' },
        { key: 'D', text: '假装工具执行成功并编造一个结果' },
      ],
      answer: 'C',
      explain: '良好的停止条件与反思护栏能避免死循环与幻觉编造，是生产级 Agent 可靠性的关键。',
    },
  ],
};

// AI 实验室：真实可运行的 Agent Loop & SKILL 模拟器数据
export const LAB_SKILLS = [
  { id: 'skill-campus', name: 'campus-schedule-skill', desc: '读取实时课表与教室位置' },
  { id: 'skill-rag', name: 'rag-paper-search', desc: '检索实验室论文向量库' },
  { id: 'skill-mcp', name: 'mcp-code-sandbox', desc: '通过 MCP 运行单测与校验代码' },
  { id: 'skill-eval', name: 'agent-eval-judge', desc: '对输出进行自动评分与幻觉检查' },
];

export const LAB_PRESET_TASKS = [
  '帮林小夏总结《Agentic Loop》第3章重点，并生成 3 条自测题存入学习档案',
  '排查 SKILL.md 加载超长上下文的问题，给出渐进式披露重构方案并通过单测',
  '对比 MCP Server 与传统 Function Calling 的差异，输出一页实验报告',
];

// 紫荆园食堂真实校园菜单
export const CANTEEN_MENU = [
  { id: 'ct1', icon: '🍛', name: '照烧脆皮鸡排饭', window: '二楼 · 铁板烧窗', price: 16, energy: 26, mood: 10 },
  { id: 'ct2', icon: '🍲', name: '川味自选麻辣烫', window: '二楼 · 飘香汤锅', price: 18, energy: 28, mood: 14 },
  { id: 'ct3', icon: '🍅', name: '番茄滑蛋盖浇饭', window: '一楼 · 经典自选', price: 13, energy: 22, mood: 8 },
  { id: 'ct4', icon: '🍜', name: '兰州手拉牛肉面', window: '一楼 · 面点窗口', price: 14, energy: 24, mood: 9 },
  { id: 'ct5', icon: '🥟', name: '鲜肉小笼包 + 现磨豆浆', window: '一楼 · 晨间点心', price: 9, energy: 18, mood: 7 },
  { id: 'ct6', icon: '🥭', name: '现切芒果酸奶杯', window: '二楼 · 轻食水果吧', price: 12, energy: 12, mood: 15 },
];

// 中心图书馆书架（AI 工程 + 经典通识）
export const LIBRARY_BOOKS = [
  {
    id: 'bk-ai-eng',
    title: '《AI Engineering》',
    author: 'Chip Huyen',
    tag: 'AI 系统工程',
    coverColor: '#dbeafe',
    pages: [
      '第 1 页 · 基于基础模型构建应用时，工程重心正从“从零预训练模型”转向“上下文工程、评估体系（Eval）与可靠的 Agent 编排架构”。',
      '第 2 页 · 没有可靠 Eval 的 Prompt 调优就像蒙眼开车。把真实业务失败案例沉淀为自动化回归测试集，是提升 AI 系统稳定性的第一杠杆。',
    ],
  },
  {
    id: 'bk-agent-patterns',
    title: '《Agentic Design Patterns》',
    author: 'Andrew Ng 等',
    tag: '智能体设计模式',
    coverColor: '#ccfbf1',
    pages: [
      '第 1 页 · 四大核心智能体设计模式：Reflection（自我反思）、Tool Use（工具调用）、Planning（任务规划）与 Multi-Agent Collaboration（多智能体协作）。',
      '第 2 页 · 实验表明，让轻量模型配合多轮 Reflection + Tool Feedback 的 Agentic Loop，往往能在编码与推理基准上超越单次零样本的大模型。',
    ],
  },
  {
    id: 'bk-hands-on-llm',
    title: '《图解大语言模型》',
    author: 'Jay Alammar',
    tag: '大模型原理',
    coverColor: '#fef3c7',
    pages: [
      '第 1 页 · Transformer 通过自注意力机制并行计算每个 Token 与上下文其他 Token 的相关性，使模型能够捕捉长距离语义依赖。',
      '第 2 页 · 结合检索增强生成（RAG）与结构化工具调用，模型可以将外部实时知识无缝融入当前推理上下文。',
    ],
  },
  {
    id: 'bk-design',
    title: '《设计心理学》',
    author: '唐·诺曼',
    tag: '人机交互',
    coverColor: '#f3e8ff',
    pages: [
      '第 1 页 · 好的交互设计具备“可视性”与“即时反馈”。在 AI 产品中，让用户看清 Agent 正在思考什么、调用了哪个 SKILL，是建立信任的关键。',
      '第 2 页 · 概念模型越贴近人的日常直觉（例如真实校园街道、签到纸与笔记本），用户越能自然投入而无需额外学习成本。',
    ],
  },
];

// 大学城购物中心商品
export const MALL_ITEMS = [
  { id: 'm1', icon: '☕', name: '生椰冰拿铁（少冰）', price: 16, energy: 14, mood: 10 },
  { id: 'm2', icon: '🧋', name: '茉莉奶绿（三分糖）', price: 14, energy: 10, mood: 14 },
  { id: 'm3', icon: '📓', name: 'AI 架构手账笔记本', price: 24, focus: 8, mood: 8 },
  { id: 'm4', icon: '🎧', name: '降噪蓝牙耳机清洁套装', price: 19, focus: 6, mood: 6 },
  { id: 'm5', icon: '🧦', name: '透气篮球运动袜', price: 18, vitality: 10, mood: 6 },
  { id: 'm6', icon: '🍓', name: '草莓奶油泡芙盒', price: 22, energy: 16, mood: 15 },
];
