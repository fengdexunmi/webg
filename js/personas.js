// AI Personas & Player Modes for Ten Balls Live Studio

export const SWEET_CHARGE = 0.592; // Empirically verified dead-center of the 0.58-0.60 swish window for AX=188 -> RIM=487.35

export const PERSONAS = {
  campus_girl: {
    id: 'campus_girl',
    name: '林小夏',
    title: '校园运动美女',
    roomTitle: '林小夏 · 校园运动直播间',
    emoji: '🏀',
    desc: '校队三分女神 · 稳健俏皮',
    isAI: true,
    baseViewers: 2680,
    accessory: 'ponytail', // High swinging ponytail + warm yellow headband
    accentColor: '#f59e0b',
    outfitPalette: {
      hair: '#2a1f1c',
      skin: '#fde0cc',
      jacket: '#ffffff',
      stripe: '#f59e0b',
      ribbon: '#fcd34d',
      roomWall: '#f7efe3',
      desk: '#e6c9a2',
      keycap: '#fffaf0',
    },
    photos: {
      idle: 'assets/campus_girl_idle.png',
      press: 'assets/campus_girl_press.png',
      cheer: 'assets/campus_girl_cheer.png',
      miss: 'assets/campus_girl_miss.png',
    },
    ai: {
      // Slightly human-calibrated accuracy (~80-86% make rate, high swish rate)
      targetCharge: SWEET_CHARGE,
      bias: 0.0,
      jitter: 0.026,          // Standard deviation of release error
      streakTighten: 0.0025,  // Gets locked-in during streaks
      nervesAtSix: 0.012,     // Slight excitement jitter on 6+ streak
      thinkDelay: [0.36, 0.72],
      preferDownswing: 0.14,  // Sometimes waits for bounce-back on meter for drama
      missRecovery: 0.7,      // Focuses harder right after a miss
    },
    tts: { rate: 1.12, pitch: 1.25 },
    lines: {
      intro: [
        '哈喽直播间的宝子们！小夏今天挑战十球投篮，看看能进几个空心～',
        '刚下体育课回来，手还热乎着呢，空格键准备就绪！',
        '今天目标是破 40 分！弹幕扣 666 给我加个精准 buff 吧！',
      ],
      charge: [
        '深呼吸…稳住蓄力条…',
        '嗯哼，感觉就在 58% 附近！',
        '轻按空格，看我这波完美弧线～',
        '手别抖手别抖，找准甜蜜点！',
        '这次我要瞄一个纯空心！',
      ],
      swish: [
        '哇！纯空心三分入网！听这刷网声也太解压了吧！',
        '空心！！这手感简直拉满，弹幕刷起来～',
        '唰的一声！校女篮射手不是白叫的吧哈哈！',
        '漂亮！丝滑空心，空格键已经被我拿捏了！',
      ],
      made: [
        '耶！稳稳颠进去了，2 分到手～',
        '擦板也能进！运气也是实力的一部分嘛～',
        '进啦进啦！继续保持这个节奏！',
        '稳住！手感越来越顺了！',
      ],
      streak: [
        '三连中双倍积分开启！！直播间气氛燥起来！',
        '哇啊啊连进停不下来啦，蓄力条变快了我也稳得住！',
        '已经手感发烫了！六连三倍冲冲冲！',
      ],
      miss: [
        '哎呀呀打铁了！刚刚按多了一丢丢…下球必进！',
        '呜呜刷筐而出了，键盘别背锅是我手滑啦哈哈～',
        '没事没事，微调一下力度，下一球找回场子！',
        '哐当一声…这篮筐今天是不是偷偷变小了呀？',
      ],
      endHigh: [
        '哇塞这轮发挥太棒啦！快截屏留念，休息两秒马上开下一局！',
        '超高分拿下！谢谢直播间宝子们的加油，我们继续冲新纪录！',
      ],
      endMid: [
        '成绩还不错耶～感觉下一轮能把空心率再拉高一点！',
        '手感热起来了，马上再来一轮挑战更高分！',
      ],
      endLow: [
        '哈哈这局纯属热身！看我下一轮认真模式全进！',
      ],
    },
    danmaku: {
      swish: ['空心！！学姐太准了吧', '这刷网声好治愈', '校篮球队长实锤了', '66666 空格键大师', '这弧线绝绝子！'],
      made: ['稳稳拿下！', '这球颠得真听话哈哈', '小夏加油！！', '手感在线！'],
      streak: ['三连中双倍积分！起飞！', '手感滚烫🔥🔥🔥', '蓄力条加速了还能进太强了', '主播开挂了吧（狗头）'],
      miss: ['哈哈哈哈打铁少女', '差一点点好可惜！', '键盘：这锅我不背', '稳住下球必空心！'],
      ambient: ['刚进直播间，主播好甜！', '这游戏是 Goofy Fish 的投篮诶', '小窗看按空格键好有代入感', '前排打卡！支持小夏', '能不能挑战一下 50 分？'],
    },
  },

  basketball_bro: {
    id: 'basketball_bro',
    name: '陈默',
    title: '爱投篮的哥哥',
    roomTitle: '陈默学长 · 篮球定点特训',
    emoji: '🔥',
    desc: '球场冷面射手 · 空心达人',
    isAI: true,
    baseViewers: 1940,
    accessory: 'headband', // Sporty headband + wrist band
    accentColor: '#2563eb',
    outfitPalette: {
      hair: '#1c2026',
      skin: '#f2ccb0',
      jacket: '#1e3a5f',
      stripe: '#ffffff',
      ribbon: '#3b82f6',
      roomWall: '#edf1f7',
      desk: '#c7b299',
      keycap: '#e2e8f0',
    },
    photos: {
      idle: 'assets/brother_idle.png',
      press: 'assets/brother_press.png',
      cheer: 'assets/brother_cheer.png',
      miss: 'assets/brother_miss.png',
    },
    ai: {
      targetCharge: SWEET_CHARGE,
      bias: 0.002,
      jitter: 0.019,         // Very steady shooter (~86-92% make rate)
      streakTighten: 0.003,
      nervesAtSix: 0.006,
      thinkDelay: [0.45, 0.85],
      preferDownswing: 0.08,
      missRecovery: 0.65,
    },
    tts: { rate: 1.0, pitch: 0.86 },
    lines: {
      intro: [
        '欢迎来到球场训练营，我是陈默。十颗球，看重的是出手节奏。',
        '练完投篮回来开两把十球，带大家找找空心的感觉。',
      ],
      charge: [
        '压腕，稳住 58% 的发力点。',
        '呼吸放缓，注意上一球的刻度标记。',
        '好节奏，准备出手。',
      ],
      swish: [
        '空心。力量和抛物线刚刚好。',
        '唰网入袋，就是这个 55 度角的手感。',
        '干净利落的 3 分，继续保持。',
      ],
      made: [
        '进了，稍微擦了点框，下一球再收一点力。',
        '稳稳命中，基本功不能丢。',
      ],
      streak: [
        '连中状态来了，球场节奏已锁定。',
        '双倍积分拿下，越快越要冷静。',
      ],
      miss: [
        '短了一点点，刚才松手早了 20 毫秒。',
        '打铁正常，调整一下刻度，下一球补回来。',
      ],
      endHigh: [
        '这轮命中率挺满意，继续保持这个手感开下一组。',
      ],
      endMid: [
        '中规中矩，下一轮争取多拿几个纯空心。',
      ],
      endLow: [
        '手感还没完全打开，再来一轮找回准星。',
      ],
    },
    danmaku: {
      swish: ['学长太稳了！！', '教科书级空心球', '陈哥这手真像装了瞄准镜', '帅炸了！'],
      made: ['稳如老狗', '这球很有把握', '球场哥哥好帅'],
      streak: ['连中机器启动！', '倍率拉满了卧槽', '这才是真正的投篮哥'],
      miss: ['罕见打铁！截屏留念', '微调一下马上进', '没事哥哥下一球稳进'],
      ambient: ['爱投篮的哥哥终于上线了', '看这按空格的节奏太稳了', '学长教教我怎么压腕', '前排学习投篮'],
    },
  },

  sports_boy: {
    id: 'sports_boy',
    name: '阿凯',
    title: '元气体育生',
    roomTitle: '阿凯 · 热血暴扣投篮屋',
    emoji: '⚡',
    desc: '节奏飞快 · 热血连击型',
    isAI: true,
    baseViewers: 1520,
    accessory: 'spiky', // Spiky hair + athletic headband
    accentColor: '#ea580c',
    outfitPalette: {
      hair: '#1f1b18',
      skin: '#ecc2a0',
      jacket: '#ea580c',
      stripe: '#fef08a',
      ribbon: '#ffffff',
      roomWall: '#fff4eb',
      desk: '#d6b48c',
      keycap: '#f8fafc',
    },
    photos: {
      idle: 'assets/athlete_idle.png',
      press: 'assets/athlete_idle.png',
      cheer: 'assets/athlete_idle.png',
      miss: 'assets/athlete_idle.png',
    },
    ai: {
      targetCharge: SWEET_CHARGE + 0.005,
      bias: 0.004,
      jitter: 0.036,         // Wild & energetic (~70-78% make, explosive streaks)
      streakTighten: 0.004,
      nervesAtSix: 0.02,
      thinkDelay: [0.18, 0.42],
      preferDownswing: 0.04,
      missRecovery: 0.85,
    },
    tts: { rate: 1.22, pitch: 1.0 },
    lines: {
      intro: [
        '兄弟们冲呀！阿凯极速十球挑战，主打一个出手快准狠！',
        '刚跑完 3000 米精力爆棚，看我速通十连中！',
      ],
      charge: [
        '蓄力——走你！',
        '干脆利落，就现在！',
        '全神贯注，发射！',
      ],
      swish: [
        '嗷呜！！直接穿网空心！爽翻了！',
        'BOOM！三分空心，这球帅不帅！',
      ],
      made: [
        'nice！进了就算好球！',
        '哈哈哈打板也进，血赚！',
      ],
      streak: [
        '燃起来了燃起来了！连击翻倍冲呀！',
        '无敌手感！谁能拦得住我！',
      ],
      miss: [
        '哈哈哈劲儿使大了！差点把篮板砸穿！',
        '哎哟打铁了！再来再来，越挫越勇！',
      ],
      endHigh: ['破纪录冲锋成功！根本停不下来，继续下一轮！'],
      endMid: ['不错不错！下一把直接拉满！'],
      endLow: ['哈哈热身完毕，这把认真了！'],
    },
    danmaku: {
      swish: ['热血空心！！', '阿凯出手太快了', '帅呆了兄弟'],
      made: ['冲冲冲！', '好球！', '体育生力量感拉满'],
      streak: ['着火了着火了🔥🔥', '起飞啦！'],
      miss: ['力气太大啦哈哈', '篮板：我做错了什么', '哈哈哈好欢乐'],
      ambient: ['这哥们精力真旺盛', '速通十球太爽了', '弹幕加油刷起来'],
    },
  },

  chill_scholar: {
    id: 'chill_scholar',
    name: '晚晚',
    title: '佛系学霸',
    roomTitle: '晚晚 · 物理系摸鱼投篮',
    emoji: '👓',
    desc: '嘴上随缘 · 暗算抛物线',
    isAI: true,
    baseViewers: 1830,
    accessory: 'glasses', // Round thin glasses + bob hair
    accentColor: '#0d9488',
    outfitPalette: {
      hair: '#242228',
      skin: '#fce5d4',
      jacket: '#f3efe6',
      stripe: '#0d9488',
      ribbon: '#94a3b8',
      roomWall: '#f2f5f3',
      desk: '#dfd2be',
      keycap: '#ffffff',
    },
    photos: {
      idle: 'assets/scholar_idle.png',
      press: 'assets/scholar_idle.png',
      cheer: 'assets/scholar_idle.png',
      miss: 'assets/scholar_idle.png',
    },
    ai: {
      targetCharge: SWEET_CHARGE - 0.001,
      bias: 0.0,
      jitter: 0.022,
      streakTighten: 0.002,
      nervesAtSix: 0.005,
      thinkDelay: [0.5, 0.95],
      preferDownswing: 0.25, // Likes calmly watching one swing before releasing
      missRecovery: 0.6,
    },
    tts: { rate: 0.96, pitch: 1.12 },
    lines: {
      intro: [
        '写完高数摸五分钟鱼…根据重力 g=1017，58% 力度理论上刚好空心。',
        '佛系打一轮十球，进不进随缘，但物理不会骗人。',
      ],
      charge: [
        '初速度约 611，55 度抛物线，计算完毕。',
        '随缘按一下空格…嗯，就是现在。',
        '等它滑到黄金区间再松手。',
      ],
      swish: [
        '嗯，空心。牛顿力学诚不欺我。',
        '完美落入误差带内，3 分到手。',
      ],
      made: [
        '碰框进的，也算符合预期。',
        '2 分，稳妥。',
      ],
      streak: [
        '哦，已经连中触发倍率了呀，继续保持平滑输出。',
      ],
      miss: [
        '唔，空气阻力…哦这里没空气阻力，那就是手抖误差。',
        '略微偏离理论值，下一球修正 0.02。',
      ],
      endHigh: ['实验数据非常漂亮，再测一组样本吧。'],
      endMid: ['稳定发挥，符合正态分布。'],
      endLow: ['样本方差偏大，需要重新校准手感。'],
    },
    danmaku: {
      swish: ['物理外挂实锤！', '嘴上说佛系实际心算抛物线', '晚晚太可爱了哈哈'],
      made: ['牛顿点了个赞', '淡定拿分'],
      streak: ['学霸连击太吓人了', '这冷静的解说笑死我'],
      miss: ['哈哈哈哈手抖误差', '牛顿：这锅我不背'],
      ambient: ['摸鱼直播间最舒服了', '物理系降维打击投篮游戏', '晚晚今天题写完了吗'],
    },
  },

  human: {
    id: 'human',
    name: '你自己',
    title: '手动亲自上阵',
    roomTitle: '玩家实况 · 手动操作模式',
    emoji: '🎮',
    desc: '按空格键或鼠标长按蓄力投篮',
    isAI: false,
    baseViewers: 1200,
    accessory: 'none',
    accentColor: '#1f2329',
    outfitPalette: {
      hair: '#2a1f1c',
      skin: '#fde0cc',
      jacket: '#ffffff',
      stripe: '#f59e0b',
      ribbon: '#fcd34d',
      roomWall: '#f7efe3',
      desk: '#e6c9a2',
      keycap: '#fffaf0',
    },
    photos: {
      idle: 'assets/campus_girl_idle.png',
      press: 'assets/campus_girl_press.png',
      cheer: 'assets/campus_girl_cheer.png',
      miss: 'assets/campus_girl_miss.png',
    },
    ai: null,
    tts: { rate: 1.08, pitch: 1.18 },
    lines: {
      intro: ['现在交给你亲自上场！长按屏幕或空格键蓄力，松手投篮！'],
      charge: ['蓄力中…瞄准 58% 附近松手！'],
      swish: ['哇！你这记纯空心太帅了吧！！', '好准！小夏在旁边给你疯狂打 call！'],
      made: ['漂亮！稳稳命中！', 'Nice！节奏感很好！'],
      streak: ['连进翻倍了！！主播地位不保啦哈哈！'],
      miss: ['差一点点！看蓄力条上的小刻度微调一下～'],
      endHigh: ['大神级别发挥！甘拜下风！'],
      endMid: ['打得很稳呀，再来一局冲新高！'],
      endLow: ['多试两球找到 58% 力度点就超准啦！'],
    },
    danmaku: {
      swish: ['水友亲自上阵好准！！', '空心6666', '高手在民间'],
      made: ['稳！', '好球好球'],
      streak: ['连中大佬！！', '带飞直播间！'],
      miss: ['哈哈再来一球！', '差一点点好可惜'],
      ambient: ['手动模式更有挑战性', '按空格的手感超还原'],
    },
  },
};

export const PERSONA_ORDER = ['campus_girl', 'basketball_bro', 'sports_boy', 'chill_scholar', 'human'];

export function pickRandom(arr) {
  if (!arr || !arr.length) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}
