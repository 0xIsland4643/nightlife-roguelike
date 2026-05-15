import { useState, useEffect, useCallback, useRef } from "react";

// ─── COLOR SYSTEM ───────────────────────────────────────────────
const C = {
  bg0: "#050508",
  bg1: "#0a0a0f",
  bg2: "#111118",
  bg3: "#1a1a24",
  gold: "#c9a84c",
  goldLight: "#e8c96a",
  goldDim: "#7a6230",
  neon: "#ff6b9d",
  neonBlue: "#4fc3f7",
  neonGreen: "#69f0ae",
  neonPurple: "#ce93d8",
  text: "#e8e0d0",
  textMuted: "#8a8070",
  textDim: "#4a4540",
  red: "#ef5350",
  amber: "#ffb74d",
  glass: "rgba(255,255,255,0.04)",
  glassBorder: "rgba(255,255,255,0.08)",
  goldBorder: "rgba(201,168,76,0.3)",
};

// ─── GAME DATA ────────────────────────────────────────────────────

const LOCATIONS = [
  { id: "club_n17", name: "N17夜店", type: "club", desc: "灯光昏暗，音乐震耳欲聋" },
  { id: "ktv_box", name: "KTV包厢", type: "ktv", desc: "镜面墙壁，麦克风永远不够用" },
  { id: "bar_counter", name: "酒吧吧台", type: "bar", desc: "调酒师面无表情地调着酒" },
  { id: "bbq_street", name: "深夜烧烤摊", type: "outdoor", desc: "油烟弥漫，生命在此刻真实" },
  { id: "badminton", name: "24H羽毛球馆", type: "sports", desc: "凌晨四点，球场灯光刺眼" },
  { id: "police_station", name: "某派出所门口", type: "danger", desc: "你也不知道怎么到这里的" },
  { id: "mystery_ktv", name: "神秘KTV", type: "mystery", desc: "没有招牌，但有人带路" },
  { id: "hospital", name: "急诊室走廊", type: "hospital", desc: "荧光灯，消毒水味" },
  { id: "rooftop", name: "某楼顶", type: "outdoor", desc: "城市灯光尽收眼底" },
  { id: "stranger_car", name: "不认识的车里", type: "mystery", desc: "你不知道要去哪里" },
];

const NPCS = {
  zhang_zong: {
    id: "zhang_zong", name: "张总", age: 40, icon: "🏥",
    desc: "家里开诊所，夜场情报中心",
    style: "老油条·情报流",
    baseAttitude: 60,
    drunkStyle: "电话不断，情报满天飞",
    catchphrases: ["这个场我熟。", "今天六部状态不错。", "我问一下经理。", "新开的场子，我带你们去。", "直接走，别墨迹。"],
    specialMechanic: "情报网络",
    relations: { qian_fu_ge: 70, wen_ge: 75, li_ge: 80 },
    drunkThreshold: 60,
  },
  qian_fu_ge: {
    id: "qian_fu_ge", name: "前夫哥", age: 30, icon: "💼",
    desc: "体制内，Sigma男，能花钱解决的事不投入感情",
    style: "效率流·高冷型",
    baseAttitude: 50,
    drunkStyle: "闷酒，抽烟，想561",
    catchphrases: ["多少钱。", "直接来。", "别浪费时间。", "买单了。", "先走了。"],
    specialMechanic: "561心魔",
    relations: { zhang_zong: 70, wen_ge: 65, li_ge: 60 },
    drunkThreshold: 80,
    weakness: "561",
  },
  wen_ge: {
    id: "wen_ge", name: "文哥", age: 30, icon: "💉",
    desc: "医生，鼻梁很挺，夜店战神",
    style: "续航型·桃花流",
    baseAttitude: 70,
    drunkStyle: "状态越来越好，还在约下一局",
    catchphrases: ["问题不大。", "还能继续。", "我明天还上班。", "没事，我行的。", "先去哪里？"],
    specialMechanic: "无限续航",
    relations: { zhang_zong: 75, qian_fu_ge: 65, li_ge: 70 },
    drunkThreshold: 90,
  },
  li_ge: {
    id: "li_ge", name: "李哥", age: 33, icon: "🕸️",
    desc: "人脉中心，说要收但总是出现",
    style: "落幕感·老玩家",
    baseAttitude: 65,
    drunkStyle: "阳台抽烟，开始说以前",
    catchphrases: ["以前不是这样的。", "差不多该收了。", "最后一场。", "年轻的时候…", "算了，喝一杯。"],
    specialMechanic: "戒断失败",
    relations: { zhang_zong: 80, qian_fu_ge: 60, wen_ge: 70 },
    drunkThreshold: 55,
  },
  william: {
    id: "william", name: "威廉", age: 30, icon: "🧢",
    desc: "室内设计师，常戴鸭舌帽，渣男人设",
    style: "氛围感·调情流",
    baseAttitude: 65,
    drunkStyle: "话变多，帽子歪了，还在聊氛围",
    catchphrases: ["氛围最重要。", "别上头。", "我只是陪你聊聊天。", "你懂我意思吗？", "帽子不能摘。"],
    specialMechanic: "帽子滤镜",
    relations: { li_ge: 75, hang_shao: 70 },
    drunkThreshold: 65,
  },
  hang_shao: {
    id: "hang_shao", name: "航少", age: 30, icon: "✈️",
    desc: "产品经理，酒量极差，喝多就氪金",
    style: "情绪消费型",
    baseAttitude: 70,
    drunkStyle: "强制心动模式，疯狂买单",
    catchphrases: ["今晚我安排。", "她绝对对我有意思。", "钱不重要。", "来，走一个！", "再来一瓶！"],
    specialMechanic: "强制心动",
    relations: { william: 70, xiao_kun: 75, da_huang: 65 },
    drunkThreshold: 30,
  },
  xiao_kun: {
    id: "xiao_kun", name: "小困", age: 25, icon: "🌙",
    desc: "机场贵宾，纯情，有贼心没贼胆",
    style: "深情废物型",
    baseAttitude: 70,
    drunkStyle: "开始聊人生，聊宠物，聊情绪价值",
    catchphrases: ["你平时累吗？", "其实你挺不容易的。", "我是不是不适合这种地方。", "猫今天等我回家。", "算了，再坐一会儿。"],
    specialMechanic: "纯爱模式",
    relations: { da_huang: 90, hang_shao: 75 },
    drunkThreshold: 45,
  },
  da_huang: {
    id: "da_huang", name: "大黄", age: 28, icon: "🟡",
    desc: "最疯的人，荤段子机关枪，越喝越兴奋",
    style: "混沌核心·奇妙冒险",
    baseAttitude: 75,
    drunkStyle: "奇妙冒险模式，路边认兄弟",
    catchphrases: ["今天必须喝到位。", "别睡！继续！", "这把高端局。", "哥几个感情深！", "再来！"],
    specialMechanic: "奇妙冒险",
    relations: { xiao_kun: 90, hang_shao: 65, william: 60 },
    drunkThreshold: 95,
  },
  bo_bo: {
    id: "bo_bo", name: "啵啵", age: 43, icon: "💋",
    desc: "张总朋友，老派大叔，喜欢氛围上头",
    style: "老派浪漫主义",
    baseAttitude: 60,
    drunkStyle: "沉浸暧昧，进入自己的世界",
    catchphrases: ["感觉到了最重要。", "嘴巴是有感情的。", "今晚氛围真好。", "慢歌来一首。", "哥今天状态不错。"],
    specialMechanic: "氛围上头",
    relations: { zhang_zong: 85 },
    drunkThreshold: 50,
  },
  xin_xin: {
    id: "xin_xin", name: "欣欣", age: 26, icon: "🎤",
    desc: "六部销冠，情商极高，唱歌极难听",
    style: "业务满级·歌声灾难",
    baseAttitude: 55,
    catchphrases: ["今晚哥哥们照顾我哈~", "要不要来一首？", "这首歌我最拿手了~"],
    specialMechanic: "销冠光环",
    relations: { wen_ge: 85, zhang_zong: 65 },
    drunkThreshold: 70,
  },
  liu_261: {
    id: "liu_261", name: "261", age: 25, icon: "🔥",
    desc: "体育生，火辣，和张总相爱相杀",
    style: "互怼型·张总意难平",
    baseAttitude: 50,
    catchphrases: ["你又来啊？", "你行不行啊。", "烦死了。", "好吧，就这一杯。"],
    specialMechanic: "相爱相杀",
    relations: { zhang_zong: 40 },
    drunkThreshold: 75,
  },
  liu_561: {
    id: "liu_561", name: "561", age: 27, icon: "🌹",
    desc: "前夫哥心魔，极限拉扯大师",
    style: "情绪黑洞·拉扯流",
    baseAttitude: 45,
    catchphrases: ["你懂我的。", "我没有那个意思…", "你别多想。", "…"],
    specialMechanic: "心魔拉扯",
    relations: { qian_fu_ge: 20 },
    drunkThreshold: 60,
  },
};

// ─── EVENTS DATABASE ─────────────────────────────────────────────

const EARLY_EVENTS = [
  {
    id: "ev_opening",
    title: "九点，局正式开始",
    text: "张总发来定位：「N17，六部，我跟经理说好了。」前夫哥回了一个「?」。文哥说「问题不大」。大家陆续到了。包厢里灯光暧昧，第一瓶就位。",
    location: "ktv_box",
    time: 21,
    npcs: ["zhang_zong", "qian_fu_ge", "wen_ge"],
    options: [
      { text: "端杯，先走一个", effects: { 酒量: -5, 意识: -5, 情绪: +10, 发疯值: +3 }, npcBonus: { zhang_zong: +5, wen_ge: +5 }, next: "你端起第一杯，感受到酒精顺喉而下。今晚，开始了。" },
      { text: "慢慢来，先看看状态", effects: { 意识: +5, 社会体面: +5 }, next: "你观望着，感受今晚的气氛。张总已经在打电话问经理要不要加人了。" },
      { text: "直接问今晚什么阵容", effects: { 情绪: +5, 夜场传说度: +3 }, npcBonus: { zhang_zong: +10 }, next: "张总露出了满意的表情，掏出手机开始汇报情报。" },
    ],
    weight: 100,
  },
  {
    id: "ev_zhang_intel",
    title: "张总情报来了",
    text: "张总接了个电话，挂掉后神秘一笑：「七部有个新来的，刚从杭州过来，状态不错。六部经理说今晚有活动，折扣很大。」前夫哥看了看表，没说话。",
    location: "ktv_box",
    time: 21,
    npcs: ["zhang_zong", "qian_fu_ge"],
    options: [
      { text: "听张总安排，去七部看看", effects: { 财力: -200, 情绪: +15, 夜场传说度: +5 }, npcBonus: { zhang_zong: +15 }, next: "张总立刻拨通了经理的电话。" },
      { text: "就在六部待着，省钱", effects: { 财力: 0, 意识: +5 }, npcBonus: { qian_fu_ge: +5 }, next: "前夫哥对你点了点头，表示认同。" },
      { text: "无所谓，跟着走就行", effects: { 情绪: +5, 发疯值: +5 }, next: "随波逐流，也是一种人生态度。" },
    ],
    weight: 80,
  },
  {
    id: "ev_drink_battle",
    title: "大黄发难：感情深一口闷",
    text: "大黄举起杯：「哥几个感情深！」小困已经开始拒绝了，但架不住大黄的眼神。航少直接说「来」。文哥已经满上了。",
    location: "ktv_box",
    time: 22,
    npcs: ["da_huang", "xiao_kun", "hang_shao", "wen_ge"],
    options: [
      { text: "跟上，一口闷", effects: { 酒量: -10, 意识: -10, 情绪: +15, 发疯值: +8 }, npcBonus: { da_huang: +15, hang_shao: +10 }, next: "大黄大喊「好！」拍了你肩膀三下。小困用复杂的眼神看着你。" },
      { text: "意思意思，抿一口", effects: { 酒量: -3, 意识: -3, 社会体面: -5 }, npcBonus: { xiao_kun: +5 }, next: "大黄瞪了你一眼，但没说什么。" },
      { text: "以茶代酒，笑着举杯", effects: { 意识: +5, 社会体面: +10, 魅力: +5 }, next: "出乎意料地，众人接受了。有时候气势比酒量更重要。" },
    ],
    weight: 85,
  },
  {
    id: "ev_ktv_mic",
    title: "抢麦事件",
    text: "欣欣拿起麦克风开口——那声音，穿透力极强，就是不太好听。但她本人毫无察觉，沉浸在自己的世界里。文哥微笑着鼓掌。大黄已经开始寻找第二支麦克风。",
    location: "ktv_box",
    time: 22,
    npcs: ["xin_xin", "wen_ge", "da_huang"],
    options: [
      { text: "加入，组成灾难二重唱", effects: { 情绪: +20, 社会体面: -15, 发疯值: +10, 夜场传说度: +8 }, npcBonus: { da_huang: +20, xin_xin: +15 }, next: "包厢里响起了热烈的笑声和掌声。这一刻，你选择了快乐。" },
      { text: "礼貌鼓掌，保持微笑", effects: { 社会体面: +10, 魅力: +5 }, npcBonus: { xin_xin: +10 }, next: "欣欣向你投来感激的眼神。职业素养是存在的。" },
      { text: "借口接电话，溜出包厢", effects: { 意识: +5, 社会体面: +5, 情绪: -5 }, next: "走廊里凉爽的空气让你清醒了一些。" },
    ],
    weight: 70,
  },
  {
    id: "ev_william_charm",
    title: "威廉的帽子外交",
    text: "威廉把帽子稍微歪了歪，开始和旁边女生聊天。氛围感这种东西，真的玄学。小困在一旁若有所思地喝着饮料。",
    location: "ktv_box",
    time: 22,
    npcs: ["william", "xiao_kun"],
    options: [
      { text: "学威廉，也去搭话", effects: { 魅力: +10, 桃花债: +5, 情绪: +10, 发疯值: +5 }, npcBonus: { william: +10 }, next: "威廉向你比了个OK的手势。帽子滤镜可能有传染性。" },
      { text: "和小困聊聊人生", effects: { 兄弟信任度: +10, 情绪稳定度: +10, 情绪: +5 }, npcBonus: { xiao_kun: +15 }, next: "小困说「你平时累吗？」突然你有点想认真回答这个问题。" },
      { text: "自己喝酒，观察众生", effects: { 酒量: -5, 意识: -5, 夜场传说度: +5, 发疯值: +3 }, next: "一个人喝酒，反而有种奇异的清醒感。" },
    ],
    weight: 75,
  },
  {
    id: "ev_qianfuge_561",
    title: "561来了",
    text: "561出现在走廊里。前夫哥的表情没变，但他已经默默把手机正面朝下放在了桌上。张总低声说「来了」。",
    location: "ktv_box",
    time: 23,
    npcs: ["qian_fu_ge", "liu_561", "zhang_zong"],
    options: [
      { text: "假装没看见，继续聊天", effects: { 情绪稳定度: +10, 兄弟信任度: +5 }, npcBonus: { qian_fu_ge: +10 }, next: "你保持了风度。前夫哥看了你一眼，什么都没说。" },
      { text: "问前夫哥「你还好吗」", effects: { 兄弟信任度: +20, 情绪: +5 }, npcBonus: { qian_fu_ge: +20 }, next: "前夫哥顿了一下，说「行」。但他的眼神里有什么东西松动了。" },
      { text: "给前夫哥续上酒", effects: { 兄弟信任度: +15, 酒量: -5, 情绪: +5 }, npcBonus: { qian_fu_ge: +15, liu_561: -10 }, next: "前夫哥接过酒，仰头喝了。没有多说一个字。" },
      { text: "直接去和561打招呼", effects: { 夜场传说度: +8, 兄弟信任度: -15, 桃花债: +10 }, npcBonus: { qian_fu_ge: -20, liu_561: +15 }, next: "现场气氛微妙地变了。前夫哥的眼神有点不对。你可能踩了雷。" },
    ],
    weight: 65,
  },
  {
    id: "ev_lige_balcony",
    title: "李哥去阳台抽烟",
    text: "李哥拿起烟默默走向阳台。你跟了过去。城市的灯光在远处闪烁，他点上烟，沉默了很久，说：「以前不是这样的。」",
    location: "ktv_box",
    time: 23,
    npcs: ["li_ge"],
    options: [
      { text: "「怎么不一样了？」", effects: { 兄弟信任度: +15, 情绪: +10, 情绪稳定度: +5 }, npcBonus: { li_ge: +20 }, next: "李哥抽了一口烟：「以前的人不一样。场子没变，人变了。」" },
      { text: "点一根，陪他沉默", effects: { 酒量: -3, 兄弟信任度: +20, 发疯值: +5 }, npcBonus: { li_ge: +25 }, next: "有时候不说话比说话更有用。李哥拍了拍你的肩膀。" },
      { text: "「差不多收了吧？」", effects: { 情绪稳定度: +5, 兄弟信任度: -5 }, npcBonus: { li_ge: -10 }, next: "李哥苦笑一下：「就是收不了才难受。」" },
    ],
    weight: 70,
  },
  {
    id: "ev_bo_bo_appear",
    title: "啵啵和张总来了",
    text: "张总带来了啵啵。啵啵今晚状态看起来很好，说了句「今晚氛围真好」，然后就开始专注于氛围建设事业了。",
    location: "ktv_box",
    time: 22,
    npcs: ["bo_bo", "zhang_zong"],
    options: [
      { text: "配合啵啵的氛围", effects: { 情绪: +15, 社会体面: -5, 发疯值: +8 }, npcBonus: { bo_bo: +20 }, next: "啵啵说「这小子行」，把酒递给了你。" },
      { text: "和张总聊场子情报", effects: { 夜场传说度: +10, 财力: -100 }, npcBonus: { zhang_zong: +15 }, next: "张总压低声音开始汇报今晚的信息。" },
    ],
    weight: 60,
  },
];

const LATE_EVENTS = [
  {
    id: "ev_midnight_emo",
    title: "凌晨过了，情绪来了",
    text: "音乐变慢了。或者是你的感知变慢了。不知道谁放了一首老歌。李哥已经在角落里发呆了。大黄还在说话，但你已经听不清他说什么。",
    location: "ktv_box",
    time: 1,
    npcs: ["li_ge", "da_huang"],
    options: [
      { text: "继续喝，用酒精压住情绪", effects: { 酒量: -15, 意识: -15, 情绪: +10, 发疯值: +15, 情绪稳定度: -10 }, next: "酒是有用的，至少在它起效的时候。" },
      { text: "出去吹风，清醒一下", effects: { 意识: +10, 情绪: -5, 情绪稳定度: +10 }, next: "夜风冷了很多。你站在门口，突然不知道自己在这里做什么。" },
      { text: "找人聊天，分散注意力", effects: { 兄弟信任度: +10, 情绪稳定度: +5, 魅力: +5 }, npcBonus: { li_ge: +15 }, next: "你坐到李哥旁边，两个人开始胡说八道。" },
    ],
    weight: 85,
    minTime: 1,
  },
  {
    id: "ev_hang_shao_broke",
    title: "航少开始氪金了",
    text: "航少喝了不知道几杯，眼神已经飘了。他把手机递给你：「帮我看一下她是不是对我有意思。」屏幕上是他和某个女生的聊天记录，最后一条是她发的「哦」。",
    location: "ktv_box",
    time: 0,
    npcs: ["hang_shao"],
    options: [
      { text: "「有意思，你追吧」", effects: { 兄弟信任度: -10, 情绪: +10 }, npcBonus: { hang_shao: +20 }, next: "航少眼睛亮了。你心里有点愧疚，但愧疚不超过三秒。" },
      { text: "「哦就是哦，别多想」", effects: { 兄弟信任度: +20, 情绪稳定度: +5 }, npcBonus: { hang_shao: -10 }, next: "航少沉默了一会儿，说「你说得对」，然后又喝了一杯。" },
      { text: "直接帮他转账表白", effects: { 财力: -300, 夜场传说度: +15, 兄弟信任度: +10, 发疯值: +20 }, npcBonus: { hang_shao: +30 }, next: "「发出去了。」航少目瞪口呆地看着你。历史在此刻被书写。" },
    ],
    weight: 75,
    minTime: 0,
  },
  {
    id: "ev_wen_ge_energy",
    title: "文哥：我明天还上班",
    text: "凌晨一点。文哥状态依然满格。他放下杯子说：「刚才接了个电话，七部那边有认识的，要不要过去？」",
    location: "ktv_box",
    time: 1,
    npcs: ["wen_ge"],
    options: [
      { text: "跟文哥去七部", effects: { 财力: -400, 意识: -10, 情绪: +20, 夜场传说度: +15, 发疯值: +10 }, npcBonus: { wen_ge: +20 }, next: "文哥已经在打车了。「走！」", nextLocation: "club_n17" },
      { text: "不去了，在这里待着", effects: { 财力: 0, 意识: +5, 社会体面: +10 }, next: "文哥点点头，一个人出发了。你看着他消失在走廊，有种错过了什么的感觉。" },
    ],
    weight: 70,
    minTime: 1,
  },
  {
    id: "ev_da_huang_philosophy",
    title: "大黄的哲学时刻",
    text: "凌晨两点。大黄突然安静了。他看着天花板说：「你们说，我们在这里喝酒是为了什么？」所有人都愣了。这个问题太深刻了，没有人准备好。",
    location: "ktv_box",
    time: 2,
    npcs: ["da_huang", "xiao_kun"],
    options: [
      { text: "「不知道，但继续喝」", effects: { 酒量: -10, 发疯值: +15, 情绪: +10 }, npcBonus: { da_huang: +15 }, next: "大黄拍桌子：「说得对！」哲学时刻结束。" },
      { text: "认真回答：「逃避现实」", effects: { 情绪稳定度: -10, 情绪: -5, 兄弟信任度: +15 }, npcBonus: { xiao_kun: +20 }, next: "小困用惊讶的眼神看着你。房间里安静了三秒。" },
      { text: "「为了这一刻」", effects: { 夜场传说度: +20, 魅力: +10, 情绪: +15, 发疯值: +5 }, npcBonus: { da_huang: +25 }, next: "大黄沉默，然后举起杯：「哥，这句话说得好。」" },
    ],
    weight: 80,
    minTime: 2,
  },
];

const CHAOS_EVENTS = [
  {
    id: "ev_badminton",
    title: "文哥提议：去打羽毛球",
    text: "凌晨三点半。文哥突然说：「走，打羽毛球去。24小时的，五分钟车程。」没有人觉得这是正常的，但所有人都在穿鞋。",
    location: "ktv_box",
    time: 3,
    npcs: ["wen_ge", "da_huang"],
    options: [
      { text: "去！羽毛球！", effects: { 意识: +10, 情绪: +25, 夜场传说度: +20, 发疯值: +25 }, npcBonus: { wen_ge: +20, da_huang: +20 }, next: "你们打了两个小时羽毛球。文哥还是赢的。他说他明天还上班。", nextLocation: "badminton", nextEvent: "ev_dawn_badminton" },
      { text: "太离谱了，你先睡", effects: { 意识: +20, 社会体面: +10, 情绪: -10 }, next: "你一个人打车回家。路上你思考这个夜晚到底意味着什么。" },
    ],
    weight: 80,
    minTime: 3,
    isChaos: true,
  },
  {
    id: "ev_police_station",
    title: "派出所门口",
    text: "你也不知道怎么到这里的。大黄在门口蹲着，说「哥，我没事，就是路过」。警察叔叔表情管理很到位。张总已经在打电话了。",
    location: "police_station",
    time: 4,
    npcs: ["da_huang", "zhang_zong"],
    options: [
      { text: "保持镇定，配合处理", effects: { 意识: +10, 社会体面: -20, 情绪稳定度: +10 }, npcBonus: { zhang_zong: +15 }, next: "张总很快联系到了熟人。事情解决了，但你获得了一个故事。" },
      { text: "开始胡言乱语", effects: { 社会体面: -40, 发疯值: +30, 夜场传说度: +25 }, next: "这不是一个好主意，但它成了一个传说。" },
    ],
    weight: 50,
    minTime: 4,
    isChaos: true,
  },
  {
    id: "ev_mystery_car",
    title: "不认识的车",
    text: "有人说上车，你就上了。司机不认识，旁边的人也不认识。大黄说「这哥们儿是我兄弟」。你们要去一个你不知道在哪里的地方。",
    location: "stranger_car",
    time: 4,
    npcs: ["da_huang"],
    options: [
      { text: "随遇而安，继续", effects: { 发疯值: +30, 夜场传说度: +25, 情绪: +20, 社会体面: -15 }, npcBonus: { da_huang: +20 }, next: "车开了很久。最后你们到了一个烧烤摊。人生就是这样。", nextLocation: "bbq_street" },
      { text: "跳车，只是打车走", effects: { 意识: +15, 社会体面: +10, 情绪: -10 }, next: "你在路边等了二十分钟才打到车。回家路上开始总结今晚。" },
    ],
    weight: 60,
    minTime: 4,
    isChaos: true,
  },
  {
    id: "ev_bbq_philosophy",
    title: "深夜烧烤：人生哲学局",
    text: "烧烤摊，凌晨四点。烟熏火燎。李哥对着啤酒说：「你们说，这种日子能过多久？」大黄说「一直过」。前夫哥喝了口酒，没说话。",
    location: "bbq_street",
    time: 4,
    npcs: ["li_ge", "da_huang", "qian_fu_ge"],
    options: [
      { text: "「过一天是一天」", effects: { 情绪: +15, 发疯值: +10, 夜场传说度: +10 }, next: "李哥举杯。这是这一晚上他第一次真正笑了。" },
      { text: "「迟早要停的」", effects: { 情绪稳定度: +10, 情绪: -5, 兄弟信任度: +10 }, npcBonus: { li_ge: +15 }, next: "沉默。然后前夫哥说「说得对」。这是今晚他说话最少的一次。" },
      { text: "「管他呢，再来一串」", effects: { 财力: -50, 情绪: +20, 发疯值: +15 }, next: "烧烤摊老板眼神里有一种超脱世俗的平静。" },
    ],
    weight: 75,
    minTime: 4,
    isChaos: true,
  },
  {
    id: "ev_dawn",
    title: "天亮了",
    text: "东边开始泛白。大黄还没睡。文哥说他要去医院准备交班了。李哥最后一根烟抽完，站起来说「收了」。城市开始苏醒，你们还没睡着。",
    location: "bbq_street",
    time: 5,
    npcs: ["da_huang", "wen_ge", "li_ge"],
    options: [
      { text: "直接去上班", effects: { 夜场传说度: +30, 社会体面: -10, 意识: -10 }, next: "你去了公司。同事问你眼睛怎么这么红。你说「风吹的」。" },
      { text: "打车回家睡觉", effects: { 意识: +20, 情绪: +10 }, next: "你倒在床上，三秒钟就睡着了。" },
      { text: "和大黄再喝一杯庆祝日出", effects: { 酒量: -10, 发疯值: +20, 夜场传说度: +25, 意识: -10 }, npcBonus: { da_huang: +20 }, next: "你们看着日出喝了最后一杯。大黄说「哥，今天赚了」。" },
    ],
    weight: 100,
    minTime: 5,
    isChaos: true,
  },
  {
    id: "ev_dawn_badminton",
    title: "羽毛球馆的日出",
    text: "窗外天色渐白，球馆里的灯反而没那么刺眼了。文哥发球，你追球，大黄在旁边喝着运动饮料假装看比赛。这一刻，荒诞得很真实。",
    location: "badminton",
    time: 5,
    npcs: ["wen_ge", "da_huang"],
    options: [
      { text: "坚持打到真正天亮", effects: { 夜场传说度: +40, 情绪: +20, 意识: -15, 发疯值: +15 }, next: "早上六点，你们还在打。这个故事你会讲很多年。" },
      { text: "躺在球场地板上歇一会儿", effects: { 意识: +10, 情绪: +25, 兄弟信任度: +20 }, next: "文哥说「行，歇会儿」。大黄已经鼾声大作。" },
    ],
    weight: 100,
    minTime: 5,
    isChaos: true,
  },
];

const ALL_EVENTS = [...EARLY_EVENTS, ...LATE_EVENTS, ...CHAOS_EVENTS];

// ─── ENDINGS ─────────────────────────────────────────────────────

const ENDINGS = [
  {
    id: "end_safe_home",
    title: "平安回家",
    icon: "🏠",
    desc: "你在合理的时间打车回家，安全躺平。理智的选择。",
    condition: (s) => s.time <= 2 && s.attrs.意识 >= 60 && s.attrs.社会体面 >= 70,
    rarity: "common",
  },
  {
    id: "end_legend",
    title: "夜场传说",
    icon: "👑",
    desc: "你的名字将被记录在夜场史册。至少大黄是这么说的。",
    condition: (s) => s.attrs.夜场传说度 >= 60,
    rarity: "rare",
  },
  {
    id: "end_blackout",
    title: "彻底断片",
    icon: "⬛",
    desc: "你不记得发生了什么。大家也不打算告诉你。",
    condition: (s) => s.attrs.意识 <= 20,
    rarity: "common",
  },
  {
    id: "end_badminton_sunrise",
    title: "羽毛球馆看日出",
    icon: "🏸",
    desc: "凌晨五点，球馆，文哥还在打。这就是夜场的终极形态。",
    condition: (s) => s.visitedLocations.includes("badminton") && s.time >= 5,
    rarity: "rare",
  },
  {
    id: "end_police",
    title: "派出所度过凌晨",
    icon: "🚔",
    desc: "一个你不打算发朋友圈的故事，但你会记一辈子。",
    condition: (s) => s.visitedLocations.includes("police_station"),
    rarity: "epic",
  },
  {
    id: "end_sigma",
    title: "Sigma独行",
    icon: "🧊",
    desc: "你高效买单，高效离开。前夫哥说「这小子行」。",
    condition: (s) => s.attrs.社会体面 >= 90 && s.attrs.财力 >= 600 && s.time <= 23,
    rarity: "rare",
  },
  {
    id: "end_philosophy",
    title: "凌晨哲学家",
    icon: "🌙",
    desc: "你和大黄在烧烤摊聊了三个小时人生，没有结论，但很爽。",
    condition: (s) => s.visitedLocations.includes("bbq_street") && s.attrs.情绪稳定度 <= 40,
    rarity: "uncommon",
  },
  {
    id: "end_brother",
    title: "铁子情深",
    icon: "🤝",
    desc: "你和兄弟们的感情在今晚升华了。明天又是普通人。",
    condition: (s) => s.attrs.兄弟信任度 >= 80,
    rarity: "uncommon",
  },
  {
    id: "end_crazy",
    title: "发疯传说",
    icon: "🌀",
    desc: "你今晚说的话，将成为日后酒局的经典段子。",
    condition: (s) => s.attrs.发疯值 >= 80,
    rarity: "epic",
  },
  {
    id: "end_broke",
    title: "人财两空",
    icon: "💸",
    desc: "钱花光了，人也没了状态。但至少你活着。",
    condition: (s) => s.attrs.财力 <= 200,
    rarity: "common",
  },
  {
    id: "end_work_next_day",
    title: "没有睡觉直接上班",
    icon: "💼",
    desc: "早上八点，你坐在工位上，眼睛里有一片沙漠。",
    condition: (s) => s.time >= 6 && s.attrs.意识 >= 40,
    rarity: "uncommon",
  },
  {
    id: "end_hospital",
    title: "急诊室的早晨",
    icon: "🏥",
    desc: "你不是最严重的病人，但你是最尴尬的那个。",
    condition: (s) => s.visitedLocations.includes("hospital"),
    rarity: "epic",
  },
  {
    id: "end_romance",
    title: "桃花债上身",
    icon: "🌸",
    desc: "今晚的某个选择让你欠下了感情债。还不还，是另一个故事。",
    condition: (s) => s.attrs.桃花债 >= 30,
    rarity: "uncommon",
  },
  {
    id: "end_mystery_destination",
    title: "不知道去了哪里",
    icon: "❓",
    desc: "你上了一辆不认识的车，去了一个不认识的地方。人生如此。",
    condition: (s) => s.visitedLocations.includes("stranger_car"),
    rarity: "epic",
  },
  {
    id: "end_normal",
    title: "又是普通的一晚上",
    icon: "🌃",
    desc: "没有什么特别发生。或者什么都发生了，但今天不想记录。",
    condition: (s) => true,
    rarity: "common",
  },
];

// ─── GAME LOGIC ───────────────────────────────────────────────────

const INITIAL_STATE = {
  phase: "start",
  time: 21,
  location: "ktv_box",
  visitedLocations: ["ktv_box"],
  attrs: {
    酒量: 50, 意识: 100, 魅力: 50, 财力: 1000, 情绪: 70, 社会体面: 100,
    发疯值: 0, 桃花债: 0, 夜场传说度: 0, 情绪稳定度: 80, 兄弟信任度: 50,
  },
  npcRelations: Object.fromEntries(Object.keys(NPCS).map((k) => [k, NPCS[k].baseAttitude])),
  npcStates: Object.fromEntries(Object.keys(NPCS).map((k) => [k, { drunk: 0, present: false }])),
  currentEvent: null,
  eventLog: [],
  usedEvents: [],
  chaosMode: false,
  ending: null,
};

function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

function applyEffects(attrs, effects) {
  const next = { ...attrs };
  for (const [k, v] of Object.entries(effects)) {
    if (k in next) {
      if (k === "财力") next[k] = Math.max(0, next[k] + v);
      else next[k] = clamp(next[k] + v);
    }
  }
  return next;
}

function getAvailableEvents(state) {
  const { time, chaosMode, usedEvents } = state;
  // linearHour: 21=0, 22=1, 23=2, 0=3, 1=4, 2=5, 3=6, 4=7, 5=8, 6=9
  const linearHour = time >= 21 ? time - 21 : time + 3;
  return ALL_EVENTS.filter((e) => {
    if (usedEvents.includes(e.id)) return false;
    if (e.isChaos && !chaosMode) return false;
    if (!e.isChaos && chaosMode && Math.random() > 0.3) return false;
    if (e.minTime !== undefined) {
      const eLinear = e.minTime >= 21 ? e.minTime - 21 : e.minTime + 3;
      if (linearHour < eLinear) return false;
    }
    return true;
  });
}

function pickEvent(state) {
  const available = getAvailableEvents(state);
  if (available.length === 0) return CHAOS_EVENTS[4]; // dawn
  const weights = available.map((e) => e.weight || 50);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < available.length; i++) {
    r -= weights[i];
    if (r <= 0) return available[i];
  }
  return available[available.length - 1];
}

function getPresent(event) {
  return event?.npcs?.slice(0, 4) || [];
}

function determineEnding(state) {
  for (const ending of ENDINGS) {
    if (ending.id !== "end_normal" && ending.condition(state)) return ending;
  }
  return ENDINGS[ENDINGS.length - 1];
}

// ─── COMPONENTS ───────────────────────────────────────────────────

function Scanlines() {
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1000,
      background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
    }} />
  );
}

function GlowOrb({ x, y, color, size = 300 }) {
  return (
    <div style={{
      position: "fixed", left: x, top: y, width: size, height: size,
      borderRadius: "50%", background: color, filter: "blur(120px)",
      opacity: 0.12, pointerEvents: "none", zIndex: 0, transform: "translate(-50%,-50%)",
    }} />
  );
}

function NeonText({ children, color = C.gold, size = 14, weight = 400, glow = true }) {
  return (
    <span style={{
      color, fontSize: size, fontWeight: weight,
      textShadow: glow ? `0 0 10px ${color}60, 0 0 20px ${color}30` : "none",
      fontFamily: "'Courier New', monospace",
    }}>{children}</span>
  );
}

function GlassCard({ children, style = {}, onClick, highlight = false }) {
  return (
    <div onClick={onClick} style={{
      background: highlight ? `rgba(201,168,76,0.06)` : C.glass,
      border: `1px solid ${highlight ? C.goldBorder : C.glassBorder}`,
      borderRadius: 12,
      backdropFilter: "blur(12px)",
      padding: "12px 16px",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s",
      ...style,
    }}>
      {children}
    </div>
  );
}

function AttrBar({ label, value, max = 100, color = C.gold, small = false }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ marginBottom: small ? 6 : 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: small ? 10 : 11, color: C.textMuted, fontFamily: "monospace" }}>{label}</span>
        <span style={{ fontSize: small ? 10 : 11, color, fontFamily: "monospace" }}>{typeof value === "number" ? Math.round(value) : value}</span>
      </div>
      <div style={{ height: small ? 3 : 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 4,
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          boxShadow: `0 0 6px ${color}60`,
          transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}

function TimeDisplay({ time, chaosMode }) {
  const h = time;
  const hStr = h.toString().padStart(2, "0");
  const label = chaosMode ? "⚡ 续摊模式" : (h >= 21 ? "夜局进行中" : h === 0 ? "午夜·失控边缘" : h <= 2 ? "深夜失控中" : "夜局进行中");
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontSize: 28, fontFamily: "'Courier New', monospace", fontWeight: 700,
        color: chaosMode ? C.neon : C.gold,
        textShadow: `0 0 20px ${chaosMode ? C.neon : C.gold}80`,
        letterSpacing: 4,
      }}>{hStr}:00</div>
      <div style={{ fontSize: 11, color: chaosMode ? C.neon : C.goldDim, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function NPCCard({ npcId, relation, state }) {
  const npc = NPCS[npcId];
  if (!npc) return null;
  const isPresent = state.npcStates[npcId]?.present;
  const relColor = relation >= 70 ? C.neonGreen : relation >= 40 ? C.amber : C.red;
  return (
    <GlassCard style={{ marginBottom: 6, opacity: isPresent ? 1 : 0.5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16 }}>{npc.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: C.text, fontFamily: "monospace" }}>{npc.name}</span>
            {isPresent && <span style={{ fontSize: 9, color: C.neonGreen, background: "rgba(105,240,174,0.1)", borderRadius: 4, padding: "1px 5px" }}>在场</span>}
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${relation}%`, background: relColor, borderRadius: 2, transition: "width 0.4s" }} />
          </div>
        </div>
      </div>
      {isPresent && <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4, fontStyle: "italic" }}>{npc.style}</div>}
    </GlassCard>
  );
}

function OptionButton({ option, onClick, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${hovered ? C.goldBorder : C.glassBorder}`,
        borderRadius: 10,
        padding: "10px 14px",
        cursor: "pointer",
        transition: "all 0.2s",
        marginBottom: 8,
        transform: hovered ? "translateX(4px)" : "none",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{
          fontSize: 10, color: C.gold, fontFamily: "monospace", fontWeight: 700,
          background: "rgba(201,168,76,0.15)", borderRadius: 4, padding: "2px 6px", flexShrink: 0, marginTop: 1,
        }}>0{index + 1}</span>
        <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5, fontFamily: "monospace" }}>{option.text}</span>
      </div>
    </div>
  );
}

function EventPanel({ event, onChoice, result }) {
  if (!event && !result) return null;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {event && (
        <>
          <div style={{
            fontSize: 11, color: C.goldDim, fontFamily: "monospace", letterSpacing: 2,
            textTransform: "uppercase", marginBottom: 8,
          }}>
            ◆ {event.title}
          </div>
          <GlassCard style={{ marginBottom: 12, flex: "none" }}>
            <p style={{
              fontSize: 13, color: C.text, lineHeight: 1.8, fontFamily: "monospace",
              margin: 0, whiteSpace: "pre-wrap",
            }}>{event.text}</p>
            {event.npcs && event.npcs.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {event.npcs.slice(0, 4).map(id => (
                  <span key={id} style={{
                    fontSize: 10, background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${C.glassBorder}`, borderRadius: 4, padding: "2px 8px", color: C.textMuted,
                  }}>{NPCS[id]?.icon} {NPCS[id]?.name}</span>
                ))}
              </div>
            )}
          </GlassCard>
          {!result && (
            <div style={{ flex: 1, overflow: "auto" }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8, fontFamily: "monospace" }}>— 你的选择 —</div>
              {event.options.map((opt, i) => (
                <OptionButton key={i} option={opt} index={i} onClick={() => onChoice(opt)} />
              ))}
            </div>
          )}
        </>
      )}
      {result && (
        <GlassCard highlight style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: C.gold, marginBottom: 6, fontFamily: "monospace" }}>► 结果</div>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.8, fontFamily: "monospace", margin: 0 }}>{result}</p>
        </GlassCard>
      )}
    </div>
  );
}

function LogEntry({ entry }) {
  return (
    <div style={{
      padding: "6px 0",
      borderBottom: `1px solid ${C.glassBorder}`,
      fontSize: 11, color: C.textMuted, fontFamily: "monospace", lineHeight: 1.6,
    }}>
      <span style={{ color: C.goldDim }}>[{entry.time.toString().padStart(2,"0")}:00]</span> {entry.text}
    </div>
  );
}

function StartScreen({ onStart }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setTimeout(() => setReady(true), 500); }, []);
  return (
    <div style={{
      minHeight: "100vh", background: C.bg0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden",
    }}>
      <GlowOrb x="30%" y="30%" color={C.gold} size={400} />
      <GlowOrb x="70%" y="70%" color={C.neon} size={300} />
      <Scanlines />
      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{
          fontSize: 72, fontWeight: 900, fontFamily: "'Courier New', monospace",
          color: C.gold, textShadow: `0 0 40px ${C.gold}80, 0 0 80px ${C.gold}40`,
          letterSpacing: 16, marginBottom: 8,
          opacity: ready ? 1 : 0, transition: "opacity 1s",
        }}>N17</div>
        <div style={{
          fontSize: 14, color: C.textMuted, letterSpacing: 6, fontFamily: "monospace",
          marginBottom: 48, opacity: ready ? 1 : 0, transition: "opacity 1.5s",
        }}>深夜商K · 文字肉鸽</div>
        <div style={{
          fontSize: 11, color: C.textDim, fontFamily: "monospace", lineHeight: 2,
          marginBottom: 40, maxWidth: 400,
          opacity: ready ? 1 : 0, transition: "opacity 2s",
        }}>
          晚上9点 → 次日早上6点<br/>
          一局酒，N种结局<br/>
          凌晨3点后进入【续摊模式】
        </div>
        <div
          onClick={onStart}
          style={{
            display: "inline-block",
            padding: "14px 48px",
            background: "rgba(201,168,76,0.1)",
            border: `1px solid ${C.goldBorder}`,
            borderRadius: 8,
            color: C.gold,
            fontSize: 14,
            fontFamily: "monospace",
            letterSpacing: 4,
            cursor: "pointer",
            textShadow: `0 0 10px ${C.gold}60`,
            boxShadow: `0 0 20px rgba(201,168,76,0.1)`,
            opacity: ready ? 1 : 0, transition: "opacity 2.5s",
          }}
        >出发</div>
        <div style={{ marginTop: 60, fontSize: 10, color: C.textDim, fontFamily: "monospace" }}>
          铁三角 · 前夫哥 · 文哥 · 张总 — 等你入局
        </div>
      </div>
    </div>
  );
}

function EndingScreen({ ending, state, onRestart }) {
  const rarityColor = { common: C.textMuted, uncommon: C.neonBlue, rare: C.gold, epic: C.neon };
  return (
    <div style={{
      minHeight: "100vh", background: C.bg0, display: "flex", alignItems: "center",
      justifyContent: "center", flexDirection: "column", position: "relative",
    }}>
      <GlowOrb x="50%" y="40%" color={C.gold} size={500} />
      <Scanlines />
      <div style={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: 480, padding: "0 24px" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{ending.icon}</div>
        <div style={{ fontSize: 10, color: rarityColor[ending.rarity], fontFamily: "monospace", letterSpacing: 3, marginBottom: 8 }}>
          {ending.rarity.toUpperCase()} ENDING
        </div>
        <div style={{
          fontSize: 28, color: C.gold, fontFamily: "'Courier New', monospace", fontWeight: 700,
          textShadow: `0 0 20px ${C.gold}60`, marginBottom: 20,
        }}>{ending.title}</div>
        <p style={{ fontSize: 14, color: C.text, fontFamily: "monospace", lineHeight: 1.8, marginBottom: 32 }}>
          {ending.desc}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 32 }}>
          {[
            ["夜场传说度", state.attrs.夜场传说度, C.gold],
            ["兄弟信任度", state.attrs.兄弟信任度, C.neonGreen],
            ["发疯值", state.attrs.发疯值, C.neon],
          ].map(([k, v, c]) => (
            <GlassCard key={k} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, color: c, fontFamily: "monospace", fontWeight: 700 }}>{Math.round(v)}</div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{k}</div>
            </GlassCard>
          ))}
        </div>
        <div
          onClick={onRestart}
          style={{
            display: "inline-block", padding: "12px 40px",
            background: "rgba(201,168,76,0.1)", border: `1px solid ${C.goldBorder}`,
            borderRadius: 8, color: C.gold, fontSize: 13, fontFamily: "monospace",
            cursor: "pointer", letterSpacing: 3,
          }}
        >再来一局</div>
      </div>
    </div>
  );
}

// ─── MAIN GAME ────────────────────────────────────────────────────

export default function N17() {
  const [state, setState] = useState(INITIAL_STATE);
  const [result, setResult] = useState(null);
  const [showLog, setShowLog] = useState(false);
  const [pendingNext, setPendingNext] = useState(false);
  const logRef = useRef(null);

  const startGame = useCallback(() => {
    const newState = { ...INITIAL_STATE, phase: "play" };
    const firstEvent = ALL_EVENTS.find(e => e.id === "ev_opening");
    newState.currentEvent = firstEvent;
    newState.usedEvents = ["ev_opening"];
    const presentNpcs = getPresent(firstEvent);
    newState.npcStates = { ...newState.npcStates };
    presentNpcs.forEach(id => { if (newState.npcStates[id]) newState.npcStates[id] = { ...newState.npcStates[id], present: true }; });
    setState(newState);
    setResult(null);
  }, []);

  const handleChoice = useCallback((option) => {
    if (result) return;
    setState(prev => {
      const next = { ...prev };
      next.attrs = applyEffects(prev.attrs, option.effects || {});
      if (option.npcBonus) {
        next.npcRelations = { ...prev.npcRelations };
        for (const [k, v] of Object.entries(option.npcBonus)) {
          if (k in next.npcRelations) next.npcRelations[k] = clamp(next.npcRelations[k] + v);
        }
      }
      next.eventLog = [...prev.eventLog, { time: prev.time, text: `[${prev.currentEvent?.title}] ${option.text}` }];
      if (option.nextLocation) {
        next.location = option.nextLocation;
        if (!next.visitedLocations.includes(option.nextLocation)) {
          next.visitedLocations = [...prev.visitedLocations, option.nextLocation];
        }
      }
      return next;
    });
    setResult(option.next || "时间推进。");
    setPendingNext(true);
  }, [result]);

  const advanceTime = useCallback(() => {
    if (!pendingNext) return;
    setPendingNext(false);
    setResult(null);
    setState(prev => {
      // Time runs 21→22→23→0→1→2→3→4→5→6
      const nextTime = prev.time === 23 ? 0 : prev.time + 1;
      // chaosMode = after midnight AND past 3am (0,1,2,3,4,5 but only >=3 counts as chaos)
      const isAfterMidnight = nextTime <= 6; // 0,1,2,3,4,5,6
      const chaosMode = isAfterMidnight && nextTime >= 3; // only 3,4,5,6
      // Check ending: game ends at 6am or if unconscious
      const nextState = { ...prev, time: nextTime, chaosMode };
      if (nextTime === 6 || prev.attrs.意识 <= 5) {
        const ending = determineEnding(nextState);
        return { ...nextState, phase: "end", ending };
      }
      // Reset NPC presence
      const npcStates = Object.fromEntries(Object.keys(NPCS).map(k => [k, { drunk: prev.npcStates[k]?.drunk || 0, present: false }]));
      const event = pickEvent(nextState);
      const newUsed = event ? [...prev.usedEvents, event.id] : prev.usedEvents;
      const presentNpcs = getPresent(event);
      presentNpcs.forEach(id => { if (npcStates[id]) npcStates[id] = { ...npcStates[id], present: true }; });
      // Passive drunk increase
      const attrs = { ...prev.attrs };
      if (attrs.发疯值 > 50) attrs.意识 = Math.max(0, attrs.意识 - 5);
      return { ...nextState, currentEvent: event, usedEvents: newUsed, npcStates, attrs };
    });
  }, [pendingNext]);

  const restart = useCallback(() => {
    setState(INITIAL_STATE);
    setResult(null);
    setPendingNext(false);
  }, []);

  if (state.phase === "start") return <StartScreen onStart={startGame} />;
  if (state.phase === "end") return <EndingScreen ending={state.ending} state={state} onRestart={restart} />;

  const loc = LOCATIONS.find(l => l.id === state.location) || LOCATIONS[0];
  const visibleNpcs = Object.keys(NPCS).slice(0, 8);
  const primaryAttrs = [
    ["酒量", state.attrs.酒量, C.amber],
    ["意识", state.attrs.意识, C.neonBlue],
    ["魅力", state.attrs.魅力, C.neonPurple],
    ["社会体面", state.attrs.社会体面, C.neonGreen],
    ["情绪", state.attrs.情绪, C.neon],
  ];
  const hiddenAttrs = [
    ["发疯值", state.attrs.发疯值, C.red],
    ["桃花债", state.attrs.桃花债, C.neon],
    ["夜场传说度", state.attrs.夜场传说度, C.gold],
    ["情绪稳定度", state.attrs.情绪稳定度, C.neonGreen],
    ["兄弟信任度", state.attrs.兄弟信任度, C.neonBlue],
  ];

  return (
    <div style={{
      minHeight: "100vh", background: C.bg0, color: C.text,
      fontFamily: "'Courier New', monospace", position: "relative", overflow: "hidden",
    }}>
      <GlowOrb x="15%" y="20%" color={state.chaosMode ? C.neon : C.gold} size={350} />
      <GlowOrb x="85%" y="70%" color={state.chaosMode ? C.neonPurple : C.goldDim} size={300} />
      <Scanlines />

      {/* HEADER */}
      <div style={{
        position: "relative", zIndex: 10,
        borderBottom: `1px solid ${state.chaosMode ? "rgba(255,107,157,0.3)" : C.glassBorder}`,
        background: "rgba(5,5,8,0.9)", backdropFilter: "blur(20px)",
        padding: "12px 24px",
        display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 16,
      }}>
        <div>
          <NeonText size={22} weight={900} color={state.chaosMode ? C.neon : C.gold}>N17</NeonText>
          <span style={{ fontSize: 11, color: C.textDim, marginLeft: 12 }}>深夜商K · 文字肉鸽</span>
        </div>
        <TimeDisplay time={state.time} chaosMode={state.chaosMode} />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: state.chaosMode ? C.neon : C.gold }}>
            {state.chaosMode ? "⚡ " : "📍 "}{loc.name}
          </div>
          <div style={{ fontSize: 10, color: C.textMuted }}>{loc.desc}</div>
          <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>💴 {Math.round(state.attrs.财力)}</div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr 200px",
        gap: 0,
        height: "calc(100vh - 65px)",
        position: "relative", zIndex: 5,
      }}>

        {/* LEFT PANEL: PLAYER ATTRS */}
        <div style={{
          borderRight: `1px solid ${C.glassBorder}`,
          padding: "16px 12px",
          overflow: "auto",
          background: "rgba(10,10,15,0.5)",
        }}>
          <div style={{ fontSize: 10, color: C.goldDim, letterSpacing: 2, marginBottom: 12 }}>▸ 玩家属性</div>
          {primaryAttrs.map(([k, v, c]) => (
            <AttrBar key={k} label={k} value={v} color={c} />
          ))}
          <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 2, margin: "16px 0 8px" }}>▸ 隐藏属性</div>
          {hiddenAttrs.map(([k, v, c]) => (
            <AttrBar key={k} label={k} value={v} color={c} small />
          ))}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10, color: C.textDim, marginBottom: 6 }}>场地解锁</div>
            {state.visitedLocations.map(id => {
              const l = LOCATIONS.find(x => x.id === id);
              return l ? (
                <div key={id} style={{ fontSize: 10, color: C.textMuted, marginBottom: 3 }}>✓ {l.name}</div>
              ) : null;
            })}
          </div>
        </div>

        {/* CENTER PANEL: EVENT */}
        <div style={{
          display: "flex", flexDirection: "column",
          padding: "20px",
          overflow: "auto",
          background: "rgba(8,8,12,0.6)",
        }}>
          {state.chaosMode && (
            <div style={{
              textAlign: "center", padding: "6px", marginBottom: 12,
              background: "rgba(255,107,157,0.08)", border: `1px solid rgba(255,107,157,0.3)`,
              borderRadius: 6, fontSize: 11, color: C.neon,
            }}>
              ⚡ 续摊模式 · 现实开始变形
            </div>
          )}
          <EventPanel
            event={state.currentEvent}
            onChoice={handleChoice}
            result={result}
          />
          {pendingNext && (
            <div
              onClick={advanceTime}
              style={{
                marginTop: 16, padding: "12px", textAlign: "center",
                background: "rgba(201,168,76,0.08)", border: `1px solid ${C.goldBorder}`,
                borderRadius: 8, cursor: "pointer", color: C.gold, fontSize: 13,
                animation: "pulse 2s infinite",
              }}
            >
              ▶ 时间继续推进（{state.time + 1 > 23 ? "0" : state.time + 1}:00）
            </div>
          )}
          {/* LOG TOGGLE */}
          <div style={{ marginTop: 16 }}>
            <div
              onClick={() => setShowLog(!showLog)}
              style={{ fontSize: 10, color: C.textDim, cursor: "pointer", marginBottom: 8 }}
            >
              {showLog ? "▼" : "▶"} 事件记录 ({state.eventLog.length})
            </div>
            {showLog && (
              <div ref={logRef} style={{ maxHeight: 120, overflow: "auto" }}>
                {state.eventLog.slice(-10).reverse().map((e, i) => (
                  <LogEntry key={i} entry={e} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: NPCs */}
        <div style={{
          borderLeft: `1px solid ${C.glassBorder}`,
          padding: "16px 10px",
          overflow: "auto",
          background: "rgba(10,10,15,0.5)",
        }}>
          <div style={{ fontSize: 10, color: C.goldDim, letterSpacing: 2, marginBottom: 12 }}>▸ 在场人物</div>
          {visibleNpcs.map(id => (
            <NPCCard
              key={id}
              npcId={id}
              relation={state.npcRelations[id] || 50}
              state={state}
            />
          ))}
          <div style={{ fontSize: 10, color: C.goldDim, letterSpacing: 2, margin: "12px 0 8px" }}>▸ 女NPC</div>
          {["xin_xin", "liu_261", "liu_561"].map(id => (
            <NPCCard key={id} npcId={id} relation={state.npcRelations[id] || 50} state={state} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; box-shadow: 0 0 15px rgba(201,168,76,0.3); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.glassBorder}; border-radius: 2px; }
      `}</style>
    </div>
  );
}
