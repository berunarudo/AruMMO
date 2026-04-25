const MAX_LOG_LINES = 140;
const BATTLE_TICK_MS = 180;

const SAVE_VERSION = 4;
const AUTO_SAVE_INTERVAL_MS = 120000;
const STORAGE_KEYS = {
  MAIN: "mmorpg_save_main",
  BACKUP: "mmorpg_save_backup",
  SETTINGS: "mmorpg_settings",
  PERSISTENT: "mmorpg_persistent",
  META: "mmorpg_meta"
};

const BALANCE_CONFIG = {
  reward: {
    baseExpMultiplier: 1.0,
    baseGoldMultiplier: 1.0,
    perLoopBonus: 0.12,
    maxLoopBonus: 0.8
  },
  encounter: {
    uniqueBaseRate: 0.0012,
    perLoopBonus: 0.00025,
    maxRate: 0.01
  },
  progression: {
    expCurveBase: 20,
    expCurvePerLevel: 24
  },
  crafting: {
    perLoopSuccessBonus: 0.006,
    perLoopGodBonus: 0.0015
  },
  titleLimit: {
    loop1: 1,
    loop3: 1,
    loop5: 1
  }
};

const NEVEREND_ACCESS_DATA = {
  ticketItemId: "neverendTicket",
  defaultTicketPrice: 1000000,
  postVolcanoTicketPrice: 100
};

const NEVEREND_CHIP_EXCHANGE_DATA = {
  buyRateGoldPerChip: 1,
  sellRateGoldPerChip: 0.94
};

const NEVEREND_ROULETTE_RULES = {
  minBet: 1000,
  maxBet: 120000,
  hitChance: 0.2,
  payoutMultiplier: 4.2
};

const NEVEREND_VIP_ROULETTE_RULES = {
  minBet: 10000,
  maxBet: 600000,
  hitChance: 0.16,
  payoutMultiplier: 6.0,
  crashChance: 0.12,
  crashLossRate: 0.4
};

const NEVEREND_TOWN_MODE_DATA = {
  reception: "カジノ",
  shop: "オークション",
  temple: "ルーレット",
  workshop: "VIP"
};

const OTHERWORLD_UNLOCK_RULES = {
  keyItemId: "otherworldKey",
  requiredUniqueIds: ["fenrir", "jormungand", "cerberus", "griffon", "minotauros", "phoenix", "kirin"],
  defaultLevelCap: 200,
  kingRecognizedLevelCap: 300,
  protagonistLevelCap: 9999
};

const OTHERWORLD_STAGE_BOSS_DATA = {
  "6-1": "behemothBisonReborn",
  "6-2": "duneHydraAbyss",
  "6-3": "leviathanOvertide",
  "6-4": "volkazardInferno",
  "6-5": "protocol3",
  "6-6": "awakenedBehemothBison",
  "6-7": "awakenedDuneHydra",
  "6-8": "awakenedLeviathan",
  "6-9": "awakenedProtocol3",
  "6-10": "otherworldKing"
};

const OTHERWORLD_SUPPORT_LOG_DATA = [
  "行け、そこまで行ったなら勝てる",
  "浪漫侍: 剣を振れ、主人公",
  "AKA.ベル: 避けろじゃない、進め",
  "守り神しめ鯖: もう折れるな、ここからは祈りじゃなく意志だ",
  "紅の魔術師: 勝て。世界の結末を更新しろ",
  "総合スレ民: うおおおおお",
  "お前ならやれる",
  "ここまで見てきたんだ、終わらせてくれ",
  "今だけは全員お前の味方だ"
];

const OTHERWORLD_ENDING_CHEER_LOG_DATA = [
  "総合スレ: お疲れ様でしたあああああ",
  "浪漫侍: 主人公、お前の勝ちだ",
  "紅の魔術師: 世界線更新、完了",
  "AKA.ベル: 最高のラストだった",
  "守り神しめ鯖: よく帰ってきた、ありがとう",
  "考察班: ここに到達したの、ガチで偉業",
  "攻略班: 異界の王撃破報告、確認",
  "全員: 世界は救われた"
];

function hasClearedVolcano() {
  return Array.isArray(state.fieldBossCleared) && state.fieldBossCleared.includes("4-10");
}

function getNeverendTicketPrice() {
  return hasClearedVolcano() ? NEVEREND_ACCESS_DATA.postVolcanoTicketPrice : NEVEREND_ACCESS_DATA.defaultTicketPrice;
}

function canEnterNeverend(current = state) {
  return !!(current.neverendUnlocked || current.hasNeverendTicket || (Array.isArray(current.unlockedTowns) && current.unlockedTowns.includes("neverend")));
}

function isNeverendTownActive() {
  return state.currentTown === "neverend";
}

function hasOtherworldKey(current = state) {
  return getInventoryCount(OTHERWORLD_UNLOCK_RULES.keyItemId) > 0 || !!current.hasOtherworldKey;
}

function hasAllUniqueDefeated(current = state) {
  return OTHERWORLD_UNLOCK_RULES.requiredUniqueIds.every((id) => (current.uniqueDefeatedIds || []).includes(id));
}

function canEnterOtherworld(current = state) {
  return !!(current.otherworldUnlocked || hasOtherworldKey(current) || hasAllUniqueDefeated(current) || (Array.isArray(current.unlockedTowns) && current.unlockedTowns.includes("otherworld")));
}

function isOtherworldStage(stageId = state?.battle?.stageId) {
  const stage = STAGE_DATA?.[stageId];
  return !!stage && stage.mapId === "otherworld";
}

function isOtherworldKingBattle() {
  return !!state.battle?.isActive && state.battle?.enemy?.id === "otherworldKing";
}

function hasTitleUnlocked(titleId) {
  return Array.isArray(state.unlockedTitles) && state.unlockedTitles.includes(titleId);
}

function getPlayerLevelCap() {
  if (hasTitleUnlocked("protagonist")) return OTHERWORLD_UNLOCK_RULES.protagonistLevelCap;
  if (hasTitleUnlocked("acknowledged_by_king") || (state.otherworldLevelCapBonus || 0) >= 100) return OTHERWORLD_UNLOCK_RULES.kingRecognizedLevelCap;
  return OTHERWORLD_UNLOCK_RULES.defaultLevelCap;
}

function canPlayerStayAtOneHpInOtherworldKingBattle() {
  return isOtherworldKingBattle() && hasTitleUnlocked("fate_redeemer");
}

function shouldUseOtherworldSupportLog() {
  return !!state.otherworldKingSupportLogMode || (isOtherworldKingBattle() && hasTitleUnlocked("fate_redeemer"));
}

function pushOtherworldSupportLog(force = false) {
  if (!shouldUseOtherworldSupportLog() && !force) return;
  if (!force && Math.random() > 0.35) return;
  addLog(weightedPick(OTHERWORLD_SUPPORT_LOG_DATA) || OTHERWORLD_SUPPORT_LOG_DATA[0], "board", { important: true });
}

function createDefaultNeverendUiState() {
  return {
    rouletteNumber: 1,
    vipRouletteNumber: 1
  };
}

function createDefaultAuctionRefreshState() {
  return {
    seed: 1,
    lastRefreshAt: 0,
    refreshCount: 0
  };
}

function createDefaultRouletteStats() {
  return {
    spins: 0,
    wins: 0,
    vipSpins: 0,
    vipWins: 0,
    chipsWon: 0,
    chipsLost: 0
  };
}

function ensureNeverendState() {
  if (typeof state.hasNeverendTicket !== "boolean") state.hasNeverendTicket = false;
  if (typeof state.neverendUnlocked !== "boolean") state.neverendUnlocked = false;
  if (typeof state.neverendVipUnlocked !== "boolean") state.neverendVipUnlocked = false;
  if (!Number.isFinite(Number(state.chips))) state.chips = 0;
  state.chips = Math.max(0, Math.floor(Number(state.chips || 0)));
  state.neverendBossClearFlags = state.neverendBossClearFlags && typeof state.neverendBossClearFlags === "object" ? state.neverendBossClearFlags : {};
  state.auctionRefreshState = state.auctionRefreshState && typeof state.auctionRefreshState === "object"
    ? { ...createDefaultAuctionRefreshState(), ...state.auctionRefreshState }
    : createDefaultAuctionRefreshState();
  state.rouletteStats = state.rouletteStats && typeof state.rouletteStats === "object"
    ? { ...createDefaultRouletteStats(), ...state.rouletteStats }
    : createDefaultRouletteStats();
  state.neverendUi = state.neverendUi && typeof state.neverendUi === "object"
    ? { ...createDefaultNeverendUiState(), ...state.neverendUi }
    : createDefaultNeverendUiState();
}

function ensureOtherworldState() {
  if (typeof state.otherworldUnlocked !== "boolean") state.otherworldUnlocked = false;
  if (typeof state.otherworldKingDefeatCount !== "number") state.otherworldKingDefeatCount = 0;
  if (typeof state.otherworldKingFirstDefeatRewardClaimed !== "boolean") state.otherworldKingFirstDefeatRewardClaimed = false;
  if (typeof state.otherworldKingTenDefeatRewardClaimed !== "boolean") state.otherworldKingTenDefeatRewardClaimed = false;
  if (typeof state.otherworldKingHundredDefeatRewardClaimed !== "boolean") state.otherworldKingHundredDefeatRewardClaimed = false;
  if (typeof state.otherworldKingCleared !== "boolean") state.otherworldKingCleared = false;
  if (typeof state.otherworldKingSupportLogMode !== "boolean") state.otherworldKingSupportLogMode = false;
  if (typeof state.otherworldLevelCapBonus !== "number") state.otherworldLevelCapBonus = 0;
  if (typeof state.otherworldNormalTitleSlotBonus !== "number") state.otherworldNormalTitleSlotBonus = 0;
  if (typeof state.otherworldCheatTitleSlotBonus !== "number") state.otherworldCheatTitleSlotBonus = 0;
  if (typeof state.hasProtagonistTitle !== "boolean") state.hasProtagonistTitle = false;
  if (typeof state.endingUnlocked !== "boolean") state.endingUnlocked = false;
  state.otherworldKingDefeatCount = Math.max(0, Math.floor(state.otherworldKingDefeatCount || 0));
  state.otherworldLevelCapBonus = Math.max(0, Math.floor(state.otherworldLevelCapBonus || 0));
  state.otherworldNormalTitleSlotBonus = Math.max(0, Math.floor(state.otherworldNormalTitleSlotBonus || 0));
  state.otherworldCheatTitleSlotBonus = Math.max(0, Math.floor(state.otherworldCheatTitleSlotBonus || 0));
  if (hasOtherworldKey(state)) state.hasOtherworldKey = true;
}

function unlockOtherworldAccess(options = {}) {
  ensureOtherworldState();
  const { silent = false, reason = "" } = options;
  if (state.otherworldUnlocked) return false;
  state.otherworldUnlocked = true;
  if (!state.unlockedTowns.includes("otherworld")) {
    state.unlockedTowns.push("otherworld");
  }
  if (!silent) {
    addLog(`異界への道が開いた。${reason ? ` (${reason})` : ""}`, "important", { important: true });
    showCenterPopup({ text: "異界 解放", type: "important" });
  }
  return true;
}

function syncOtherworldUnlockState(options = {}) {
  ensureOtherworldState();
  const silent = !!options.silent;
  let reason = "";
  if (hasOtherworldKey(state)) reason = "異界のカギ";
  if (hasAllUniqueDefeated(state) && !reason) reason = "ユニーク全撃破";
  if (reason) {
    unlockOtherworldAccess({ silent, reason });
  }
}

function unlockNeverendAccess(options = {}) {
  ensureNeverendState();
  const { silent = false, fromTicket = false } = options;
  state.hasNeverendTicket = true;
  state.neverendUnlocked = true;
  if (!state.unlockedTowns.includes("neverend")) {
    if (silent) {
      state.unlockedTowns.push("neverend");
    } else {
      unlockTown("neverend");
    }
  }
  if (!silent) {
    addLog(fromTicket ? "天空都市ネバーエンドの入場権を取得した。" : "天空都市ネバーエンドへの入場が解放された。");
  }
}

const TITLE_SLOT_RULES = {
  normal: {
    baseDefault: 1,
    maxBaseFromPrestige: 2,
    tierBonusByTier: { 1: 0, 2: 1, 3: 2, 4: 2, 5: 2 }
  },
  cheat: {
    baseDefault: 1,
    maxBaseFromPrestige: 2,
    tierBonusByTier: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 2 }
  }
};

const JOB_DATA = {
  main: {
    swordman: { id: "swordman", name: "剣士", description: "近接で戦う基本職。", baseStats: { hp: 120, mp: 30, attack: 16, defense: 14, speed: 10, intelligence: 8, luck: 10 } },
    ninja: { id: "ninja", name: "忍者", description: "高速行動が得意な職。", baseStats: { hp: 95, mp: 40, attack: 13, defense: 10, speed: 18, intelligence: 9, luck: 12 } },
    mage: { id: "mage", name: "魔術師", description: "魔法火力に秀でた職。", baseStats: { hp: 80, mp: 95, attack: 9, defense: 8, speed: 9, intelligence: 20, luck: 11 } },
    cleric: { id: "cleric", name: "僧侶", description: "回復と支援が得意な職。", baseStats: { hp: 105, mp: 80, attack: 8, defense: 12, speed: 9, intelligence: 16, luck: 13 } }
  }
};

const SUB_JOB_BONUS_DATA = {
  swordman: { attack: 3, defense: 1 },
  ninja: { speed: 3, luck: 1 },
  mage: { intelligence: 3, mp: 8 },
  cleric: { defense: 2, mp: 10 }
};

const SKILL_DATA = {
  swordman: [
    { id: "slash", name: "斬撃", type: "attack", mpCost: 4, cooldownMs: 2600, power: 1.25 },
    { id: "double_slash", name: "連撃", type: "multiAttack", mpCost: 7, cooldownMs: 4600, power: 0.82, hits: 2 },
    { id: "iron_stance", name: "防御の構え", type: "buff", mpCost: 6, cooldownMs: 9000, effect: { stat: "defense", multiplier: 1.2, durationMs: 5000 } },
    { id: "fighting_spirit", name: "気合い", type: "buff", mpCost: 6, cooldownMs: 9000, effect: { stat: "attack", multiplier: 1.2, durationMs: 5000 } }
  ],
  ninja: [
    { id: "kunai_throw", name: "苦無投げ", type: "attack", mpCost: 4, cooldownMs: 2400, power: 1.2 },
    { id: "venom_blade", name: "毒刃", type: "attackDebuff", mpCost: 7, cooldownMs: 6200, power: 1.15, effect: { stat: "enemyAttack", multiplier: 0.88, durationMs: 5000 } },
    { id: "stealth", name: "隠密", type: "buff", mpCost: 6, cooldownMs: 8800, effect: { stat: "damageReduction", multiplier: 0.75, durationMs: 5000 } },
    { id: "smoke_bomb", name: "煙玉", type: "debuff", mpCost: 6, cooldownMs: 8800, effect: { stat: "enemyAccuracy", multiplier: 0.75, durationMs: 5000 } }
  ],
  mage: [
    { id: "fire", name: "ファイア", type: "magicAttack", mpCost: 6, cooldownMs: 2500, power: 1.3 },
    { id: "ice", name: "アイス", type: "magicAttack", mpCost: 6, cooldownMs: 2500, power: 1.25 },
    { id: "thunder", name: "サンダー", type: "magicAttack", mpCost: 8, cooldownMs: 3300, power: 1.4 },
    { id: "magic_boost", name: "マジックブースト", type: "buff", mpCost: 7, cooldownMs: 9000, effect: { stat: "intelligence", multiplier: 1.2, durationMs: 5000 } }
  ],
  cleric: [
    { id: "heal", name: "ヒール", type: "heal", mpCost: 6, cooldownMs: 3400, healRatio: 0.2 },
    { id: "cure", name: "キュア", type: "heal", mpCost: 5, cooldownMs: 2800, healRatio: 0.12 },
    { id: "protect", name: "プロテクト", type: "buff", mpCost: 7, cooldownMs: 9000, effect: { stat: "defense", multiplier: 1.2, durationMs: 5000 } },
    { id: "holy", name: "ホーリー", type: "magicAttack", mpCost: 8, cooldownMs: 3600, power: 1.35 }
  ]
};

const SKILL_TYPE_LABEL_JA = {
  attack: "物理攻撃",
  multiAttack: "連続攻撃",
  magicAttack: "魔法攻撃",
  buff: "自己強化",
  debuff: "弱体",
  heal: "回復",
  attackDebuff: "攻撃+弱体"
};

const SKILL_DESC_BY_ID = {
  slash: "単体に物理ダメージを与える基本技",
  double_slash: "素早く2連撃する",
  iron_stance: "一定時間、防御力を強化する",
  fighting_spirit: "一定時間、攻撃力を強化する",
  kunai_throw: "苦無を投げて敵を攻撃する",
  venom_blade: "攻撃しつつ敵攻撃力を下げる",
  stealth: "一定時間、被ダメージを軽減する",
  smoke_bomb: "敵の命中率を下げる",
  fire: "炎属性の魔法攻撃",
  ice: "氷属性の魔法攻撃",
  thunder: "雷属性の魔法攻撃",
  magic_boost: "一定時間、知性を強化する",
  heal: "HPを回復する",
  cure: "小回復で体勢を立て直す",
  protect: "一定時間、防御力を強化する",
  holy: "聖属性の魔法攻撃"
};

const JOB_EVOLUTION_SKILL_DATA = {
  swordmaster: [
    { id: "hien_slash", nameJa: "飛燕斬り", descriptionJa: "鋭い斬り上げで単体を攻撃", type: "attack", mpCost: 8, cooldownMs: 3600, power: 1.55 },
    { id: "triple_slash", nameJa: "三連斬", descriptionJa: "3連続で斬りつける", type: "multiAttack", mpCost: 12, cooldownMs: 6200, power: 0.9, hits: 3 },
    { id: "mikiri", nameJa: "見切り", descriptionJa: "回避を高める集中", type: "buff", mpCost: 9, cooldownMs: 9400, effect: { stat: "speed", multiplier: 1.18, durationMs: 6000 } },
    { id: "touki_release", nameJa: "闘気解放", descriptionJa: "攻撃力を大きく引き上げる", type: "buff", mpCost: 11, cooldownMs: 9800, effect: { stat: "attack", multiplier: 1.24, durationMs: 6000 } }
  ],
  swordking: [
    { id: "ouga_slash", nameJa: "王牙斬", descriptionJa: "王者の一撃で敵を断つ", type: "attack", mpCost: 12, cooldownMs: 4200, power: 1.8 },
    { id: "sword_pressure", nameJa: "剣圧", descriptionJa: "剣圧で連撃する", type: "multiAttack", mpCost: 14, cooldownMs: 7000, power: 0.98, hits: 3 },
    { id: "ironwall", nameJa: "鉄壁", descriptionJa: "防御を厚くする", type: "buff", mpCost: 12, cooldownMs: 10000, effect: { stat: "defense", multiplier: 1.3, durationMs: 6500 } },
    { id: "kings_aura", nameJa: "王の覇気", descriptionJa: "攻防を同時に引き上げる", type: "buff", mpCost: 14, cooldownMs: 11000, effect: { stat: "attack", multiplier: 1.28, durationMs: 6500 } }
  ],
  swordsaint: [
    { id: "muku_issen", nameJa: "無空一閃", descriptionJa: "空を裂く一閃", type: "attack", mpCost: 16, cooldownMs: 4600, power: 2.05 },
    { id: "senjin_ranbu", nameJa: "千刃乱舞", descriptionJa: "高速多段の乱舞", type: "multiAttack", mpCost: 18, cooldownMs: 7600, power: 1.02, hits: 4 },
    { id: "shingan", nameJa: "心眼", descriptionJa: "攻撃を見切り被害を抑える", type: "buff", mpCost: 14, cooldownMs: 11000, effect: { stat: "damageReduction", multiplier: 0.72, durationMs: 7000 } },
    { id: "seikenki", nameJa: "聖剣気", descriptionJa: "攻撃速度を高める", type: "buff", mpCost: 15, cooldownMs: 11500, effect: { stat: "speed", multiplier: 1.24, durationMs: 7000 } }
  ],
  swordgod: [
    { id: "shinmetsu_zan", nameJa: "神滅斬", descriptionJa: "神速の極大斬撃", type: "attack", mpCost: 20, cooldownMs: 5000, power: 2.35 },
    { id: "tendant_kenbu", nameJa: "天断剣舞", descriptionJa: "連続剣舞で敵を断つ", type: "multiAttack", mpCost: 22, cooldownMs: 8200, power: 1.08, hits: 4 },
    { id: "shinsai", nameJa: "神域", descriptionJa: "被ダメージを大きく軽減", type: "buff", mpCost: 18, cooldownMs: 12000, effect: { stat: "damageReduction", multiplier: 0.64, durationMs: 7500 } },
    { id: "kengod_descend", nameJa: "剣神降臨", descriptionJa: "攻撃を極限まで高める", type: "buff", mpCost: 20, cooldownMs: 13000, effect: { stat: "attack", multiplier: 1.36, durationMs: 7500 } }
  ],

  chunin: [
    { id: "shuriken_barrage", nameJa: "手裏剣乱射", descriptionJa: "手裏剣を連続投擲する", type: "multiAttack", mpCost: 10, cooldownMs: 6000, power: 0.88, hits: 3 },
    { id: "paralyze_venom_blade", nameJa: "麻痺毒刃", descriptionJa: "攻撃しつつ敵攻撃を弱体化", type: "attackDebuff", mpCost: 11, cooldownMs: 6800, power: 1.35, effect: { stat: "enemyAttack", multiplier: 0.82, durationMs: 6000 } },
    { id: "shadow_run", nameJa: "影走り", descriptionJa: "速度を高める", type: "buff", mpCost: 9, cooldownMs: 9000, effect: { stat: "speed", multiplier: 1.25, durationMs: 6500 } },
    { id: "clone_art", nameJa: "分身", descriptionJa: "回避用の分身を作る", type: "buff", mpCost: 10, cooldownMs: 9200, effect: { stat: "damageReduction", multiplier: 0.78, durationMs: 6500 } }
  ],
  jonin: [
    { id: "shadow_bind", nameJa: "影縫い", descriptionJa: "高精度の刺突攻撃", type: "attack", mpCost: 12, cooldownMs: 4200, power: 1.72 },
    { id: "ninja_ranreikage", nameJa: "忍法・乱れ影", descriptionJa: "影の連撃を浴びせる", type: "multiAttack", mpCost: 14, cooldownMs: 7000, power: 0.96, hits: 3 },
    { id: "utsusemi", nameJa: "空蝉", descriptionJa: "被ダメージを軽減する", type: "buff", mpCost: 12, cooldownMs: 10000, effect: { stat: "damageReduction", multiplier: 0.7, durationMs: 7000 } },
    { id: "ninki_boost", nameJa: "忍気活性", descriptionJa: "攻撃を底上げする", type: "buff", mpCost: 12, cooldownMs: 9800, effect: { stat: "attack", multiplier: 1.2, durationMs: 7000 } }
  ],
  oboro: [
    { id: "oboro_moon", nameJa: "朧月", descriptionJa: "朧の太刀で一閃", type: "attack", mpCost: 15, cooldownMs: 4600, power: 1.98 },
    { id: "phantom_combo", nameJa: "幻影連殺", descriptionJa: "幻影の多段連撃", type: "multiAttack", mpCost: 17, cooldownMs: 7600, power: 1.02, hits: 4 },
    { id: "oboro_hide", nameJa: "朧隠れ", descriptionJa: "敵命中率を大きく下げる", type: "debuff", mpCost: 14, cooldownMs: 11000, effect: { stat: "enemyAccuracy", multiplier: 0.62, durationMs: 7000 } },
    { id: "night_fog", nameJa: "夜霧", descriptionJa: "夜霧で自らを守る", type: "buff", mpCost: 14, cooldownMs: 11000, effect: { stat: "damageReduction", multiplier: 0.66, durationMs: 7000 } }
  ],
  shadowgod: [
    { id: "final_shadow", nameJa: "終影", descriptionJa: "影神の終撃", type: "attack", mpCost: 19, cooldownMs: 5000, power: 2.28 },
    { id: "manei_shuriken", nameJa: "万影手裏剣", descriptionJa: "膨大な手裏剣を放つ", type: "multiAttack", mpCost: 21, cooldownMs: 8200, power: 1.06, hits: 4 },
    { id: "kamikakushi", nameJa: "神隠し", descriptionJa: "敵命中を著しく低下", type: "debuff", mpCost: 17, cooldownMs: 12000, effect: { stat: "enemyAccuracy", multiplier: 0.55, durationMs: 7500 } },
    { id: "shadowgod_form", nameJa: "影神化", descriptionJa: "攻速と攻撃を同時強化", type: "buff", mpCost: 18, cooldownMs: 12400, effect: { stat: "speed", multiplier: 1.32, durationMs: 7500 } }
  ],

  archmage: [
    { id: "flame_burst", nameJa: "フレイムバースト", descriptionJa: "高火力の炎魔法", type: "magicAttack", mpCost: 12, cooldownMs: 3600, power: 1.72 },
    { id: "ice_lance", nameJa: "アイスランス", descriptionJa: "鋭い氷槍を放つ", type: "magicAttack", mpCost: 12, cooldownMs: 3600, power: 1.68 },
    { id: "lightning_chain", nameJa: "ライトニングチェイン", descriptionJa: "連鎖雷撃を放つ", type: "multiAttack", mpCost: 15, cooldownMs: 6800, power: 0.94, hits: 3 },
    { id: "mana_focus", nameJa: "魔力集中", descriptionJa: "知性を大きく強化", type: "buff", mpCost: 11, cooldownMs: 9800, effect: { stat: "intelligence", multiplier: 1.28, durationMs: 6500 } }
  ],
  sage: [
    { id: "meteor_flare", nameJa: "メテオフレア", descriptionJa: "隕火で焼き払う", type: "magicAttack", mpCost: 16, cooldownMs: 4200, power: 2.02 },
    { id: "absolute_zero", nameJa: "アブソリュートゼロ", descriptionJa: "絶対零度の魔法", type: "magicAttack", mpCost: 16, cooldownMs: 4200, power: 1.98 },
    { id: "raitei_geki", nameJa: "雷帝撃", descriptionJa: "雷帝の連撃", type: "multiAttack", mpCost: 18, cooldownMs: 7400, power: 1, hits: 3 },
    { id: "sages_wisdom", nameJa: "賢者の叡智", descriptionJa: "知性とMP効率を高める", type: "buff", mpCost: 14, cooldownMs: 10600, effect: { stat: "intelligence", multiplier: 1.34, durationMs: 7000 } }
  ],
  grandsage: [
    { id: "element_nova", nameJa: "エレメントノヴァ", descriptionJa: "属性爆発を起こす", type: "magicAttack", mpCost: 20, cooldownMs: 4700, power: 2.25 },
    { id: "dimension_spear", nameJa: "次元槍", descriptionJa: "次元を穿つ魔槍", type: "magicAttack", mpCost: 20, cooldownMs: 4700, power: 2.18 },
    { id: "mana_barrier", nameJa: "魔力障壁", descriptionJa: "被ダメージを軽減する障壁", type: "buff", mpCost: 16, cooldownMs: 11200, effect: { stat: "damageReduction", multiplier: 0.7, durationMs: 7200 } },
    { id: "grandsage_cast", nameJa: "大賢者の詠唱", descriptionJa: "詠唱加速の集中", type: "buff", mpCost: 16, cooldownMs: 11200, effect: { stat: "speed", multiplier: 1.2, durationMs: 7200 } }
  ],
  demonmage: [
    { id: "end_flame", nameJa: "終焉の業火", descriptionJa: "終焉級の炎撃", type: "magicAttack", mpCost: 24, cooldownMs: 5200, power: 2.52 },
    { id: "absolute_frozen_world", nameJa: "絶対凍界", descriptionJa: "凍界を展開する", type: "magicAttack", mpCost: 24, cooldownMs: 5200, power: 2.46 },
    { id: "judgement_thunder", nameJa: "神雷審判", descriptionJa: "神雷の連鎖裁き", type: "multiAttack", mpCost: 25, cooldownMs: 8600, power: 1.1, hits: 4 },
    { id: "demonmanifest", nameJa: "魔神顕現", descriptionJa: "魔力を限界まで解放", type: "buff", mpCost: 20, cooldownMs: 12400, effect: { stat: "intelligence", multiplier: 1.42, durationMs: 7600 } }
  ],

  priest: [
    { id: "high_heal", nameJa: "ハイヒール", descriptionJa: "大きくHPを回復", type: "heal", mpCost: 11, cooldownMs: 3600, healRatio: 0.3 },
    { id: "refresh", nameJa: "リフレッシュ", descriptionJa: "小回復で立て直す", type: "heal", mpCost: 8, cooldownMs: 3100, healRatio: 0.18 },
    { id: "bless", nameJa: "ブレス", descriptionJa: "守りを高める祝福", type: "buff", mpCost: 10, cooldownMs: 9800, effect: { stat: "defense", multiplier: 1.26, durationMs: 6500 } },
    { id: "holy_ray", nameJa: "ホーリーレイ", descriptionJa: "聖光の魔法攻撃", type: "magicAttack", mpCost: 13, cooldownMs: 3800, power: 1.64 }
  ],
  highpriest: [
    { id: "heal_rain", nameJa: "ヒールレイン", descriptionJa: "大回復を降らせる", type: "heal", mpCost: 14, cooldownMs: 4000, healRatio: 0.36 },
    { id: "recover", nameJa: "リカバー", descriptionJa: "連続回復で安定化", type: "heal", mpCost: 10, cooldownMs: 3400, healRatio: 0.22 },
    { id: "saint_guard", nameJa: "セイントガード", descriptionJa: "高倍率防御バフ", type: "buff", mpCost: 12, cooldownMs: 10400, effect: { stat: "defense", multiplier: 1.34, durationMs: 7000 } },
    { id: "judgement", nameJa: "ジャッジメント", descriptionJa: "裁きの聖光", type: "magicAttack", mpCost: 15, cooldownMs: 4200, power: 1.88 }
  ],
  cardinal: [
    { id: "grand_heal", nameJa: "グランドヒール", descriptionJa: "強力な回復術", type: "heal", mpCost: 17, cooldownMs: 4400, healRatio: 0.43 },
    { id: "resurrect", nameJa: "リザレクト", descriptionJa: "戦線再生の奇跡回復", type: "heal", mpCost: 20, cooldownMs: 9000, healRatio: 0.55 },
    { id: "sanctuary", nameJa: "聖域", descriptionJa: "被ダメージを大幅軽減", type: "buff", mpCost: 15, cooldownMs: 11200, effect: { stat: "damageReduction", multiplier: 0.68, durationMs: 7200 } },
    { id: "holy_punish", nameJa: "神罰の光", descriptionJa: "高威力聖属性攻撃", type: "magicAttack", mpCost: 18, cooldownMs: 4600, power: 2.05 }
  ],
  saint: [
    { id: "miracle", nameJa: "奇跡", descriptionJa: "超高効率の回復術", type: "heal", mpCost: 22, cooldownMs: 4600, healRatio: 0.52 },
    { id: "full_resurrect", nameJa: "完全蘇生", descriptionJa: "圧倒的再生回復", type: "heal", mpCost: 24, cooldownMs: 9800, healRatio: 0.66 },
    { id: "saints_blessing", nameJa: "聖者の加護", descriptionJa: "聖なる護りで被害を抑える", type: "buff", mpCost: 17, cooldownMs: 11800, effect: { stat: "damageReduction", multiplier: 0.6, durationMs: 7600 } },
    { id: "last_holy_light", nameJa: "終末の聖光", descriptionJa: "聖なる終撃", type: "magicAttack", mpCost: 21, cooldownMs: 5200, power: 2.3 }
  ]
};
Object.assign(SKILL_DATA, JOB_EVOLUTION_SKILL_DATA);

const OVERHEAL_DEFENSE_BUFF_PREFIX = "overheal_defense_stack";
const OVERHEAL_DEFENSE_STACK_LIMIT = 6;
const OVERHEAL_DEFENSE_STACK_MULTIPLIER = 1.03;
const OVERHEAL_DEFENSE_DURATION_MS = 15000;
const PRIEST_OVERHEAL_EXTRA_DEFENSE_BUFF_PREFIX = "priest_overheal_extra_defense_stack";
const PRIEST_OVERHEAL_EXTRA_DEFENSE_STACK_LIMIT = 3;
const PRIEST_OVERHEAL_EXTRA_DEFENSE_STACK_MULTIPLIER = 1.05;
const NINJA_DEBUFF_ATTACK_BUFF_PREFIX = "ninja_debuff_attack_stack";
const NINJA_DEBUFF_ATTACK_STACK_LIMIT = 6;
const NINJA_DEBUFF_ATTACK_STACK_MULTIPLIER = 1.02;
const NINJA_DEBUFF_ATTACK_DURATION_MS = 15000;
const NINJA_TITLE_TOOL_MASTER_BUFF_PREFIX = "ninja_title_tool_master_stack";
const NINJA_TITLE_TOOL_MASTER_STACK_LIMIT = 3;
const NINJA_TITLE_TOOL_MASTER_STACK_MULTIPLIER = 1.03;
const NINJA_TITLE_MERCILESS_BUFF_PREFIX = "ninja_title_merciless_stack";
const NINJA_TITLE_MERCILESS_STACK_LIMIT = 3;
const NINJA_TITLE_MERCILESS_STACK_MULTIPLIER = 1.02;
const NINJA_TITLE_DEBUFF_STACK_DURATION_MS = 15000;
const MAGE_ATTACK_MP_RECOVERY_RATIO = 0.015;
const MAGE_ATTACK_MP_RECOVERY_FLAT = 2;
const SWORDSMAN_BUFF_HEAL_RATIO = 0.012;
const SWORDSMAN_BUFF_HEAL_FLAT = 6;

function normalizeSkillData() {
  Object.keys(SKILL_DATA).forEach((jobId) => {
    SKILL_DATA[jobId] = SKILL_DATA[jobId].map((skill) => ({
      ...skill,
      nameJa: skill.nameJa || skill.name || skill.id,
      descriptionJa: skill.descriptionJa || SKILL_DESC_BY_ID[skill.id] || "効果不明のスキル",
      cooldown: typeof skill.cooldown === "number" ? skill.cooldown : Number((skill.cooldownMs || 0) / 1000),
      category: skill.category || SKILL_TYPE_LABEL_JA[skill.type] || "その他",
      effectType: skill.effectType || skill.type
    }));
  });
}

normalizeSkillData();

const SKILL_INDEX_BY_ID = {};
Object.values(SKILL_DATA).forEach((list) => {
  (list || []).forEach((skill) => {
    if (skill?.id) {
      SKILL_INDEX_BY_ID[skill.id] = skill;
    }
  });
});

const EQUIPMENT_DATA = {
  woodSword: {
    id: "woodSword",
    name: "木剣",
    category: "weapon",
    rarity: "common",
    attack: 6,
    defense: 0,
    speed: 0,
    intelligence: 0,
    luck: 0,
    hp: 0,
    mp: 0,
    weight: 8,
    specialTags: ["starter"],
    enhanceLevel: 0,
    price: 80,
    sellPrice: 32,
    description: "見習い向けの木製の剣。"
  },
  ironSword: {
    id: "ironSword",
    name: "鉄剣",
    category: "weapon",
    rarity: "uncommon",
    attack: 12,
    defense: 1,
    speed: -1,
    intelligence: 0,
    luck: 0,
    hp: 0,
    mp: 0,
    weight: 14,
    specialTags: ["melee", "heavy"],
    enhanceLevel: 0,
    price: 220,
    sellPrice: 88,
    description: "重量がある標準的な剣。"
  },
  apprenticeStaff: {
    id: "apprenticeStaff",
    name: "見習いの杖", category: "weapon",
    rarity: "common",
    attack: 3,
    defense: 0,
    speed: 0,
    intelligence: 8,
    luck: 1,
    hp: 0,
    mp: 6,
    weight: 7,
    specialTags: ["magic"],
    enhanceLevel: 0,
    price: 200,
    sellPrice: 80,
    description: "魔術師向けの基礎杖。"
  },
  shadowDagger: {
    id: "shadowDagger",
    name: "影打ち短刀",
    category: "weapon",
    rarity: "rare",
    attack: 8,
    defense: 0,
    speed: 4,
    intelligence: 0,
    luck: 3,
    hp: 0,
    mp: 0,
    weight: 5,
    specialTags: ["dual_wield", "speed"],
    enhanceLevel: 0,
    price: 260,
    sellPrice: 104,
    description: "小回りに優れた短刀。"
  },
  dullHammer: {
    id: "dullHammer",
    name: "鈍鉄ハンマー",
    category: "weapon",
    rarity: "uncommon",
    attack: 16,
    defense: 3,
    speed: -3,
    intelligence: 0,
    luck: 0,
    hp: 0,
    mp: 0,
    weight: 20,
    specialTags: ["heavy", "crusher"],
    enhanceLevel: 0,
    price: 300,
    sellPrice: 120,
    description: "重さで押し切る打撃武器。"
  },
  trainingSpear: {
    id: "trainingSpear",
    name: "練習用槍", category: "weapon",
    rarity: "common",
    attack: 10,
    defense: 1,
    speed: 1,
    intelligence: 0,
    luck: 1,
    hp: 0,
    mp: 0,
    weight: 11,
    specialTags: ["balanced"],
    enhanceLevel: 0,
    price: 170,
    sellPrice: 68,
    description: "癖が少ない入門槍。"
  },
  leatherCap: {
    id: "leatherCap",
    name: "革の帽子", category: "armor",
    rarity: "common",
    attack: 0,
    defense: 3,
    speed: 1,
    intelligence: 0,
    luck: 1,
    hp: 8,
    mp: 0,
    weight: 4,
    specialTags: ["light_armor"],
    enhanceLevel: 0,
    price: 70,
    sellPrice: 28,
    description: "軽量で扱いやすい頭装備。"
  },
  noviceRobe: {
    id: "noviceRobe",
    name: "見習いのローブ", category: "armor",
    rarity: "common",
    attack: 0,
    defense: 4,
    speed: 0,
    intelligence: 2,
    luck: 0,
    hp: 12,
    mp: 8,
    weight: 6,
    specialTags: ["magic_armor"],
    enhanceLevel: 0,
    price: 95,
    sellPrice: 38,
    description: "魔力制御を助けるローブ。"
  },
  leatherArmor: {
    id: "leatherArmor",
    name: "革鎧",
    category: "armor",
    rarity: "uncommon",
    attack: 0,
    defense: 8,
    speed: -1,
    intelligence: 0,
    luck: 0,
    hp: 20,
    mp: 0,
    weight: 13,
    specialTags: ["mid_armor"],
    enhanceLevel: 0,
    price: 180,
    sellPrice: 72,
    description: "標準的な胴防具。"
  },
  ironChest: {
    id: "ironChest",
    name: "鉄の胸当て",
    category: "armor",
    rarity: "uncommon",
    attack: 0,
    defense: 14,
    speed: -3,
    intelligence: 0,
    luck: 0,
    hp: 28,
    mp: 0,
    weight: 22,
    specialTags: ["heavy_armor", "defense_build"],
    enhanceLevel: 0,
    price: 290,
    sellPrice: 116,
    description: "防御寄りの重装。"
  },
  travelerCloak: {
    id: "travelerCloak",
    name: "旅人の外套", category: "armor",
    rarity: "common",
    attack: 0,
    defense: 5,
    speed: 2,
    intelligence: 1,
    luck: 2,
    hp: 10,
    mp: 4,
    weight: 7,
    specialTags: ["speed_build"],
    enhanceLevel: 0,
    price: 140,
    sellPrice: 56,
    description: "機動力を確保しやすい外套。"
  },
  heavyShoulder: {
    id: "heavyShoulder",
    name: "重戦士の肩当て",
    category: "armor",
    rarity: "rare",
    attack: 2,
    defense: 16,
    speed: -4,
    intelligence: 0,
    luck: 0,
    hp: 30,
    mp: 0,
    weight: 24,
    specialTags: ["heavy_armor", "defense_build"],
    enhanceLevel: 0,
    price: 340,
    sellPrice: 136,
    description: "高防御の上位防具。"
  },
  swiftRing: {
    id: "swiftRing",
    name: "俊足の指輪",
    category: "accessory",
    rarity: "uncommon",
    attack: 0,
    defense: 0,
    speed: 4,
    intelligence: 0,
    luck: 1,
    hp: 0,
    mp: 0,
    weight: 1,
    specialTags: ["speed_build", "accessory_focus"],
    enhanceLevel: 0,
    price: 160,
    sellPrice: 64,
    description: "速度特化アクセ。"
  },
  prayerNecklace: {
    id: "prayerNecklace",
    name: "祈りの首飾り", category: "accessory",
    rarity: "uncommon",
    attack: 0,
    defense: 1,
    speed: 0,
    intelligence: 2,
    luck: 1,
    hp: 6,
    mp: 10,
    weight: 2,
    specialTags: ["support", "accessory_focus"],
    enhanceLevel: 0,
    price: 170,
    sellPrice: 68,
    description: "支援向けアクセサリー。"
  },
  manaEarring: {
    id: "manaEarring",
    name: "魔力の耳飾り", category: "accessory",
    rarity: "rare",
    attack: 0,
    defense: 0,
    speed: 0,
    intelligence: 5,
    luck: 1,
    hp: 0,
    mp: 16,
    weight: 1,
    specialTags: ["magic_build", "accessory_focus"],
    enhanceLevel: 0,
    price: 230,
    sellPrice: 92,
    description: "魔力を底上げする耳飾り。"
  },
  guardBracelet: {
    id: "guardBracelet",
    name: "守りの腕輪",
    category: "accessory",
    rarity: "uncommon",
    attack: 0,
    defense: 5,
    speed: -1,
    intelligence: 0,
    luck: 0,
    hp: 12,
    mp: 0,
    weight: 3,
    specialTags: ["defense_build"],
    enhanceLevel: 0,
    price: 180,
    sellPrice: 72,
    description: "防御寄りの腕輪。"
  },
  merchantCharm: {
    id: "merchantCharm",
    name: "商人の護符",
    category: "accessory",
    rarity: "rare",
    attack: 0,
    defense: 0,
    speed: 0,
    intelligence: 0,
    luck: 4,
    hp: 0,
    mp: 0,
    weight: 1,
    specialTags: ["gold_boost", "accessory_focus"],
    enhanceLevel: 0,
    price: 210,
    sellPrice: 84,
    description: "売買向きの護符。"
  },
  luckyFeather: {
    id: "luckyFeather",
    name: "幸運の羽飾り", category: "accessory",
    rarity: "rare",
    attack: 0,
    defense: 0,
    speed: 2,
    intelligence: 1,
    luck: 5,
    hp: 0,
    mp: 4,
    weight: 1,
    specialTags: ["lucky", "accessory_focus"],
    enhanceLevel: 0,
    price: 240,
    sellPrice: 96,
    description: "幸運を高める羽飾り。"
  }
};

const ITEM_DATA = {
  potion: { id: "potion", name: "ポーション", nameJa: "ポーション", category: "consumable", effectType: "heal_hp", healAmount: 30, cooldown: 5, description: "HPを少量回復。", descriptionJa: "HPを少量回復。", autoUsable: true, buyPrice: 18, sellPrice: 9 },
  ether: { id: "ether", name: "エーテル", nameJa: "エーテル", category: "consumable", effectType: "heal_mp", healAmount: 0, cooldown: 7, description: "MPを少量回復。", descriptionJa: "MPを少量回復。", autoUsable: true, buyPrice: 28, sellPrice: 14 },
  hiEther: { id: "hiEther", name: "ハイエーテル", nameJa: "ハイエーテル", category: "consumable", effectType: "heal_mp", healAmount: 0, cooldown: 10, description: "MPを中回復。", descriptionJa: "MPを中回復。", autoUsable: true, buyPrice: 72, sellPrice: 36 },
  hiPotion: { id: "hiPotion", name: "ハイポーション", nameJa: "ハイポーション", category: "consumable", effectType: "heal_hp", healAmount: 70, cooldown: 8, description: "HPを中回復。", descriptionJa: "HPを中回復。", autoUsable: true, buyPrice: 45, sellPrice: 22 },
  antidote: { id: "antidote", name: "毒消し", category: "consumable", description: "毒を治療。", buyPrice: 24, sellPrice: 12 },
  neverendTicket: { id: "neverendTicket", name: "天空都市入場券", category: "special", description: "天空都市ネバーエンドへの入場権。", buyPrice: NEVEREND_ACCESS_DATA.defaultTicketPrice, sellPrice: 0 },
  herb: { id: "herb", name: "薬草", category: "material", description: "回復薬素材。", buyPrice: 10, sellPrice: 5 },
  grilledMeat: { id: "grilledMeat", name: "焼き肉", category: "crafted", description: "香ばしい料理。", buyPrice: 0, sellPrice: 16 },
  ...Object.fromEntries(
    Object.values(EQUIPMENT_DATA).map((eq) => [
      eq.id,
      {
        id: eq.id,
        name: eq.name,
        category: eq.category,
        description: eq.description,
        buyPrice: eq.price,
        sellPrice: eq.sellPrice
      }
    ])
  )
};

const SHOP_ITEM_IDS = [
  "potion",
  "ether",
  "hiPotion",
  "hiEther",
  "antidote",
  "neverendTicket",
  "herb",
  "woodSword",
  "ironSword",
  "apprenticeStaff",
  "shadowDagger",
  "trainingSpear",
  "leatherCap",
  "noviceRobe",
  "leatherArmor",
  "ironChest",
  "travelerCloak",
  "swiftRing",
  "guardBracelet",
  "herb",
  "fineHerb",
  "beastMeat",
  "ironOre",
  "wood",
  "manaStone"
];

Object.assign(ITEM_DATA, {
  fineHerb: { id: "fineHerb", name: "上質な薬草", category: "material", description: "品質の高い薬草", buyPrice: 26, sellPrice: 11 },
  poisonSting: { id: "poisonSting", name: "毒針", category: "material", description: "虫系素材", buyPrice: 28, sellPrice: 12 },
  beastMeat: { id: "beastMeat", name: "獣肉", category: "material", description: "一般的な肉素材", buyPrice: 20, sellPrice: 9 },
  fineMeat: { id: "fineMeat", name: "上質な獣肉", category: "material", description: "希少な肉素材", buyPrice: 40, sellPrice: 18 },
  ironOre: { id: "ironOre", name: "鉄鉱石", category: "material", description: "鍛冶素材", buyPrice: 24, sellPrice: 10 },
  wood: { id: "wood", name: "木材", category: "material", description: "加工しやすい素材", buyPrice: 14, sellPrice: 6 },
  manaStone: { id: "manaStone", name: "魔力石", category: "material", description: "魔力を含む鉱石", buyPrice: 34, sellPrice: 15 },
  fireCrystal: { id: "fireCrystal", name: "炎結晶", category: "material", description: "高温の結晶", buyPrice: 44, sellPrice: 20 },
  waterShard: { id: "waterShard", name: "水晶片", category: "material", description: "水属性の結晶片", buyPrice: 30, sellPrice: 13 },
  crystalShard: { id: "crystalShard", name: "結晶片", category: "material", description: "加工用の結晶", buyPrice: 38, sellPrice: 17 },
  warpedCore: { id: "warpedCore", name: "歪んだ核片", category: "material", description: "周回高難易度で得られる異質な核", buyPrice: 0, sellPrice: 180 },
  rebirthSeal: { id: "rebirthSeal", name: "再臨の証", category: "material", description: "再臨ボス撃破の証", buyPrice: 0, sellPrice: 140 },
  deepShard: { id: "deepShard", name: "深層の欠片", category: "material", description: "深層領域で見つかる破片", buyPrice: 0, sellPrice: 160 },
  mythFragment: { id: "mythFragment", name: "神話断章", category: "material", description: "神話級の残滓", buyPrice: 0, sellPrice: 220 },
  outsideRecord: { id: "outsideRecord", name: "運営外記録", category: "material", description: "世界の外を示す異常ログ", buyPrice: 0, sellPrice: 260 },
  attackTonic: { id: "attackTonic", name: "攻撃バフ薬", category: "consumable", description: "攻撃力を一時強化", buyPrice: 0, sellPrice: 32 },
  defenseTonic: { id: "defenseTonic", name: "防御バフ薬", category: "consumable", description: "防御力を一時強化", buyPrice: 0, sellPrice: 32 },
  speedTonic: { id: "speedTonic", name: "速度薬", category: "consumable", description: "速度を一時強化", buyPrice: 0, sellPrice: 32 },
  regenPotion: { id: "regenPotion", name: "継続回復薬", category: "consumable", description: "一定時間回復", buyPrice: 0, sellPrice: 35 },
  vegeSoup: { id: "vegeSoup", name: "野菜スープ", category: "crafted", description: "体に優しい料理", buyPrice: 0, sellPrice: 24 },
  gourmetMeat: { id: "gourmetMeat", name: "豪華肉料理", category: "crafted", description: "高級なバフ料理", buyPrice: 0, sellPrice: 48 },
  failedDish: { id: "failedDish", name: "焦げた料理", category: "crafted", description: "失敗した料理", buyPrice: 0, sellPrice: 3 },
  hydraScale: { id: "hydraScale", name: "ヒドラ鱗", category: "material", description: "砂海ヒドラの鱗片", buyPrice: 0, sellPrice: 140 },
  leviathanFin: { id: "leviathanFin", name: "リヴァイア鰭", category: "material", description: "蒼海王の巨大な鰭", buyPrice: 0, sellPrice: 220 },
  volkaCore: { id: "volkaCore", name: "ヴォルカ核", category: "material", description: "炎獄竜の灼熱核", buyPrice: 0, sellPrice: 340 }
  ,
  controlBoard: { id: "controlBoard", name: "制御基板", category: "material", description: "機械都市の中枢制御基板", buyPrice: 0, sellPrice: 420, neverendExclusive: true },
  overclockCircuit: { id: "overclockCircuit", name: "オーバークロック回路", category: "material", description: "暴走制御用の高熱回路", buyPrice: 0, sellPrice: 540, neverendExclusive: true },
  collapseArmorShard: { id: "collapseArmorShard", name: "崩壊装甲片", category: "material", description: "高密度装甲の破断片", buyPrice: 0, sellPrice: 680, neverendExclusive: true },
  skyFurnaceCore: { id: "skyFurnaceCore", name: "天空炉心", category: "material", description: "天空都市炉の心臓部", buyPrice: 0, sellPrice: 960, neverendExclusive: true },
  divineSteelBase: { id: "divineSteelBase", name: "神鉄の素地", category: "material", description: "神鉄加工の中間素材", buyPrice: 0, sellPrice: 520, neverendExclusive: true },
  emptyAetherBoard: { id: "emptyAetherBoard", name: "空魔導基板", category: "material", description: "空属性導線を刻んだ基板", buyPrice: 0, sellPrice: 560, neverendExclusive: true },
  blessingCircuit: { id: "blessingCircuit", name: "祝福回路", category: "material", description: "安定化祝福が刻まれた回路", buyPrice: 0, sellPrice: 640, neverendExclusive: true },
  royalCatalyst: { id: "royalCatalyst", name: "王家の触媒", category: "material", description: "王家印の高純度触媒", buyPrice: 0, sellPrice: 780, neverendExclusive: true },
  kingsElixir: { id: "kingsElixir", name: "王の秘薬", category: "consumable", effectType: "heal_hp", healAmount: 180, cooldown: 12, description: "王都級の再生をもたらす秘薬", buyPrice: 0, sellPrice: 900, neverendExclusive: true },
  angelElixir: { id: "angelElixir", name: "天使の霊薬", category: "consumable", effectType: "heal_hp", healAmount: 360, cooldown: 16, description: "戦闘不能寸前から立て直す霊薬", buyPrice: 0, sellPrice: 1300, neverendExclusive: true },
  berserkStim: { id: "berserkStim", name: "暴走促進剤", category: "consumable", description: "攻撃性を極限まで高める危険薬", buyPrice: 0, sellPrice: 1600, neverendExclusive: true },
  fullRebootDrug: { id: "fullRebootDrug", name: "完全再起動薬", category: "consumable", effectType: "heal_hp", healAmount: 520, cooldown: 20, description: "身体機能を初期化し全快を狙う", buyPrice: 0, sellPrice: 2100, neverendExclusive: true },
  otherworldKey: { id: "otherworldKey", name: "異界のカギ", category: "special", description: "この世のものとは思えないカギ", buyPrice: 0, sellPrice: 0, neverendExclusive: true, futureFlag: "otherworld_key_owned" }
});

const REGIONAL_EQUIPMENT_DEFS = [
  { id: "sandbladeLongsword", name: "砂刃の長剣", category: "weapon", unlockTown: "dustria", rarity: "rare", attack: 24, defense: 2, speed: 1, intelligence: 0, luck: 2, hp: 0, mp: 0, weight: 16, price: 980, sellPrice: 392, specialTags: ["melee", "desert", "accuracy"], description: "砂漠戦向けに命中性を調整した長剣。" },
  { id: "quicksandTwinblades", name: "流砂の双刃", category: "weapon", unlockTown: "dustria", rarity: "rare", attack: 20, defense: 0, speed: 7, intelligence: 0, luck: 4, hp: 0, mp: 0, weight: 11, price: 1040, sellPrice: 416, specialTags: ["dual_wield", "desert", "speed"], description: "流砂のように連撃を刻む二刀向け双刃。" },
  { id: "ruinbreakerGreatsword", name: "遺跡破りの大剣", category: "weapon", unlockTown: "dustria", rarity: "epic", attack: 34, defense: 5, speed: -5, intelligence: 0, luck: 0, hp: 8, mp: 0, weight: 28, price: 1320, sellPrice: 528, specialTags: ["heavy", "crusher", "desert"], description: "遺跡守護種を割るために鍛えられた重剣。" },
  { id: "sandrunnerKunai", name: "砂走りの苦無", category: "weapon", unlockTown: "dustria", rarity: "rare", attack: 18, defense: 0, speed: 8, intelligence: 0, luck: 3, hp: 0, mp: 0, weight: 7, price: 920, sellPrice: 368, specialTags: ["speed", "desert", "ninja"], description: "砂上でも失速しにくい軽量苦無。" },
  { id: "banditBaneDagger", name: "盗賊喰らいの短刀", category: "weapon", unlockTown: "dustria", rarity: "rare", attack: 21, defense: 0, speed: 5, intelligence: 0, luck: 6, hp: 0, mp: 0, weight: 8, price: 980, sellPrice: 392, specialTags: ["lucky", "desert", "critical"], description: "奇襲対策を意識した会心寄り短刀。" },
  { id: "drywindStaff", name: "乾風の杖", category: "weapon", unlockTown: "dustria", rarity: "rare", attack: 8, defense: 1, speed: 1, intelligence: 20, luck: 2, hp: 0, mp: 16, weight: 10, price: 1180, sellPrice: 472, specialTags: ["magic", "desert", "mp_efficiency"], description: "乾いた風で詠唱を補助する砂漠向け杖。" },
  { id: "mirageRod", name: "陽炎のロッド", category: "weapon", unlockTown: "dustria", rarity: "rare", attack: 9, defense: 0, speed: 4, intelligence: 17, luck: 3, hp: 0, mp: 12, weight: 8, price: 1120, sellPrice: 448, specialTags: ["magic", "speed", "desert"], description: "陽炎を纏い、単体魔法の回転を高めるロッド。" },
  { id: "pilgrimHolyStaff", name: "巡礼者の聖杖", category: "weapon", unlockTown: "dustria", rarity: "rare", attack: 10, defense: 3, speed: 1, intelligence: 18, luck: 4, hp: 16, mp: 18, weight: 12, price: 1240, sellPrice: 496, specialTags: ["support", "desert", "cleric"], description: "毒地帯の巡礼で使われる継戦型の聖杖。" },
  { id: "sandprayerMace", name: "砂祈のメイス", category: "weapon", unlockTown: "dustria", rarity: "rare", attack: 15, defense: 9, speed: -1, intelligence: 11, luck: 2, hp: 20, mp: 10, weight: 18, price: 1260, sellPrice: 504, specialTags: ["support", "defense_build", "desert"], description: "防御を重視した僧侶向けメイス。" },
  { id: "sandScarf", name: "サンドスカーフ", category: "armor", unlockTown: "dustria", rarity: "uncommon", attack: 0, defense: 10, speed: 2, intelligence: 0, luck: 2, hp: 14, mp: 0, weight: 8, price: 740, sellPrice: 296, specialTags: ["light_armor", "desert", "accuracy"], description: "砂嵐を防ぎ命中を補助する防具。" },
  { id: "wanderingDuneMantle", name: "遊砂の外套", category: "armor", unlockTown: "dustria", rarity: "rare", attack: 0, defense: 7, speed: 5, intelligence: 2, luck: 2, hp: 8, mp: 6, weight: 7, price: 860, sellPrice: 344, specialTags: ["speed_build", "desert"], description: "回避を重視した軽装外套。" },
  { id: "ruinwardenArmor", name: "遺跡守りの鎧", category: "armor", unlockTown: "dustria", rarity: "epic", attack: 1, defense: 22, speed: -4, intelligence: 0, luck: 0, hp: 34, mp: 0, weight: 30, price: 1380, sellPrice: 552, specialTags: ["heavy_armor", "defense_build", "desert"], description: "重装と耐性を両立した遺跡護衛鎧。" },
  { id: "dryboneGauntlet", name: "乾骨の護手", category: "armor", unlockTown: "dustria", rarity: "rare", attack: 1, defense: 12, speed: 0, intelligence: 0, luck: 1, hp: 18, mp: 0, weight: 12, price: 930, sellPrice: 372, specialTags: ["mid_armor", "desert", "anti_crit"], description: "会心事故を抑える砂漠護手。" },
  { id: "scorpionCharm", name: "スコーピオンチャーム", category: "accessory", unlockTown: "dustria", rarity: "rare", attack: 0, defense: 4, speed: 1, intelligence: 0, luck: 2, hp: 14, mp: 0, weight: 2, price: 820, sellPrice: 328, specialTags: ["support", "desert", "poison_resist"], description: "毒耐性を大きく高める護符。" },
  { id: "antiBanditTalisman", name: "盗賊除けの護符", category: "accessory", unlockTown: "dustria", rarity: "rare", attack: 0, defense: 3, speed: 1, intelligence: 0, luck: 4, hp: 10, mp: 0, weight: 2, price: 840, sellPrice: 336, specialTags: ["gold_boost", "desert", "anti_thief"], description: "奇襲と金銭被害を抑える守り札。" },
  { id: "mirageRing", name: "陽炎の指輪", category: "accessory", unlockTown: "dustria", rarity: "rare", attack: 0, defense: 0, speed: 3, intelligence: 1, luck: 4, hp: 0, mp: 6, weight: 1, price: 860, sellPrice: 344, specialTags: ["speed", "lucky", "desert"], description: "回避と会心を底上げする砂漠リング。" },
  { id: "quicksandAnklet", name: "流砂の足輪", category: "accessory", unlockTown: "dustria", rarity: "rare", attack: 0, defense: -2, speed: 6, intelligence: 0, luck: 1, hp: 0, mp: 0, weight: 1, price: 780, sellPrice: 312, specialTags: ["speed_build", "desert"], description: "防御を捨てて機動力を得る足輪。" },

  { id: "tideslashSaber", name: "潮斬りのサーベル", category: "weapon", unlockTown: "akamatsu", rarity: "epic", attack: 40, defense: 4, speed: 3, intelligence: 0, luck: 3, hp: 0, mp: 0, weight: 20, price: 2200, sellPrice: 880, specialTags: ["melee", "sea", "balanced"], description: "海棲種との戦闘に合わせた均衡型サーベル。" },
  { id: "abyssbreakerGreatsword", name: "深海砕きの大剣", category: "weapon", unlockTown: "akamatsu", rarity: "epic", attack: 56, defense: 8, speed: -6, intelligence: 0, luck: 0, hp: 14, mp: 0, weight: 34, price: 2560, sellPrice: 1024, specialTags: ["heavy", "crusher", "sea"], description: "甲殻種を砕くことに特化した深海大剣。" },
  { id: "tideKnightTwinSwords", name: "潮騎士の双剣", category: "weapon", unlockTown: "akamatsu", rarity: "epic", attack: 42, defense: 1, speed: 8, intelligence: 0, luck: 5, hp: 0, mp: 0, weight: 16, price: 2380, sellPrice: 952, specialTags: ["dual_wield", "speed", "sea"], description: "多段向けの潮騎士流双剣。" },
  { id: "searoarDagger", name: "海鳴りの短刀", category: "weapon", unlockTown: "akamatsu", rarity: "epic", attack: 38, defense: 1, speed: 10, intelligence: 0, luck: 4, hp: 0, mp: 0, weight: 13, price: 2240, sellPrice: 896, specialTags: ["speed", "sea", "shock_resist"], description: "海鳴りの衝撃をまとった高速短刀。" },
  { id: "waveShadowShuriken", name: "波影の手裏剣", category: "weapon", unlockTown: "akamatsu", rarity: "epic", attack: 36, defense: 0, speed: 9, intelligence: 2, luck: 5, hp: 0, mp: 4, weight: 11, price: 2180, sellPrice: 872, specialTags: ["speed", "sea", "multi_hit"], description: "回避敵への命中を重視した投擲武器。" },
  { id: "abyssTreasureStaff", name: "深海の宝杖", category: "weapon", unlockTown: "akamatsu", rarity: "epic", attack: 14, defense: 2, speed: 1, intelligence: 36, luck: 3, hp: 0, mp: 30, weight: 14, price: 2680, sellPrice: 1072, specialTags: ["magic", "sea", "mp_boost"], description: "氷雷系の術式に適した高知性杖。" },
  { id: "tidalWand", name: "潮流のワンド", category: "weapon", unlockTown: "akamatsu", rarity: "epic", attack: 12, defense: 1, speed: 6, intelligence: 30, luck: 4, hp: 0, mp: 22, weight: 12, price: 2520, sellPrice: 1008, specialTags: ["magic", "speed", "sea"], description: "詠唱回転を重視した潮流ワンド。" },
  { id: "seaprayerHolyStaff", name: "海祈の聖杖", category: "weapon", unlockTown: "akamatsu", rarity: "epic", attack: 15, defense: 5, speed: 2, intelligence: 31, luck: 4, hp: 24, mp: 28, weight: 16, price: 2760, sellPrice: 1104, specialTags: ["support", "sea", "cleric"], description: "全体回復運用向けの海域聖杖。" },
  { id: "pearlPriestStaff", name: "真珠の司祭杖", category: "weapon", unlockTown: "akamatsu", rarity: "epic", attack: 13, defense: 7, speed: 1, intelligence: 28, luck: 5, hp: 28, mp: 26, weight: 17, price: 2720, sellPrice: 1088, specialTags: ["support", "defense_build", "sea"], description: "過剰回復シナジー向けの司祭杖。" },
  { id: "seashellArmor", name: "シーシェルアーマー", category: "armor", unlockTown: "akamatsu", rarity: "epic", attack: 0, defense: 24, speed: -1, intelligence: 1, luck: 0, hp: 36, mp: 8, weight: 26, price: 2100, sellPrice: 840, specialTags: ["mid_armor", "sea"], description: "高防御と水域適性を持つ甲殻鎧。" },
  { id: "marineRobe", name: "マリンローブ", category: "armor", unlockTown: "akamatsu", rarity: "epic", attack: 0, defense: 17, speed: 1, intelligence: 8, luck: 1, hp: 24, mp: 24, weight: 17, price: 2020, sellPrice: 808, specialTags: ["magic_armor", "sea"], description: "魔防重視の海域法衣。" },
  { id: "seabreezeCoat", name: "潮風のコート", category: "armor", unlockTown: "akamatsu", rarity: "epic", attack: 1, defense: 13, speed: 6, intelligence: 3, luck: 2, hp: 18, mp: 10, weight: 13, price: 1980, sellPrice: 792, specialTags: ["speed_build", "sea"], description: "速度と回避を両立する軽量コート。" },
  { id: "abyssKnightArmor", name: "深海騎士の鎧", category: "armor", unlockTown: "akamatsu", rarity: "legend", attack: 2, defense: 32, speed: -5, intelligence: 2, luck: 0, hp: 52, mp: 16, weight: 38, price: 2920, sellPrice: 1168, specialTags: ["heavy_armor", "defense_build", "sea"], description: "深海ボスを想定した重装鎧。" },
  { id: "pearlNecklaceSea", name: "真珠の首飾り", category: "accessory", unlockTown: "akamatsu", rarity: "epic", attack: 0, defense: 2, speed: 1, intelligence: 4, luck: 2, hp: 10, mp: 24, weight: 2, price: 1680, sellPrice: 672, specialTags: ["support", "sea", "mp_boost"], description: "MPと回復効率を補助する真珠飾り。" },
  { id: "jellyWardCharm", name: "クラゲ除けの護符", category: "accessory", unlockTown: "akamatsu", rarity: "epic", attack: 0, defense: 4, speed: 1, intelligence: 0, luck: 1, hp: 16, mp: 8, weight: 2, price: 1620, sellPrice: 648, specialTags: ["support", "sea", "shock_resist"], description: "麻痺・感電事故を抑える護符。" },
  { id: "tidalBracelet", name: "潮流の腕輪", category: "accessory", unlockTown: "akamatsu", rarity: "epic", attack: 2, defense: 1, speed: 4, intelligence: 3, luck: 1, hp: 8, mp: 12, weight: 2, price: 1640, sellPrice: 656, specialTags: ["speed", "sea", "skill_cycle"], description: "スキル回転率を意識した腕輪。" },
  { id: "seaSnakeFangOrnament", name: "海蛇の牙飾り", category: "accessory", unlockTown: "akamatsu", rarity: "epic", attack: 4, defense: 0, speed: 3, intelligence: 0, luck: 4, hp: 0, mp: 0, weight: 2, price: 1700, sellPrice: 680, specialTags: ["lucky", "sea", "ailment_offense"], description: "毒・出血付与寄りの尖った牙飾り。" },

  { id: "scorchsteelGreatsword", name: "灼鋼の大剣", category: "weapon", unlockTown: "rulacia", rarity: "legend", attack: 76, defense: 10, speed: -6, intelligence: 0, luck: 3, hp: 22, mp: 0, weight: 44, price: 4200, sellPrice: 1680, specialTags: ["heavy", "crusher", "volcano"], description: "終盤の殴り合いを制する高火力大剣。" },
  { id: "flamebreakerAxe", name: "炎砕きの戦斧", category: "weapon", unlockTown: "rulacia", rarity: "legend", attack: 92, defense: 14, speed: -10, intelligence: 0, luck: 1, hp: 30, mp: 0, weight: 52, price: 4680, sellPrice: 1872, specialTags: ["heavy", "boss_damage", "volcano"], description: "速度を捨てた超火力ボス狩り戦斧。" },
  { id: "crimsonTwinblades", name: "紅蓮双刃", category: "weapon", unlockTown: "rulacia", rarity: "legend", attack: 68, defense: 2, speed: 12, intelligence: 0, luck: 6, hp: 0, mp: 0, weight: 22, price: 4360, sellPrice: 1744, specialTags: ["dual_wield", "speed", "volcano"], description: "多段運用に特化した高回転双刃。" },
  { id: "fireShadowKunai", name: "火影の苦無", category: "weapon", unlockTown: "rulacia", rarity: "legend", attack: 62, defense: 1, speed: 14, intelligence: 0, luck: 5, hp: 0, mp: 0, weight: 16, price: 4080, sellPrice: 1632, specialTags: ["speed", "lucky", "volcano"], description: "火山地帯でも機動力を保つ忍具。" },
  { id: "scorchingDarkBlade", name: "灼熱の暗刃", category: "weapon", unlockTown: "rulacia", rarity: "legend", attack: 74, defense: 1, speed: 8, intelligence: 0, luck: 6, hp: 0, mp: 0, weight: 20, price: 4320, sellPrice: 1728, specialTags: ["lucky", "volcano", "single_target"], description: "単体処理能力に寄せた灼熱暗刃。" },
  { id: "volcanicCoreStaff", name: "火山核の杖", category: "weapon", unlockTown: "rulacia", rarity: "legend", attack: 20, defense: 3, speed: 0, intelligence: 56, luck: 4, hp: 0, mp: 42, weight: 20, price: 4820, sellPrice: 1928, specialTags: ["magic", "volcano", "fire_magic"], description: "火属性火力を引き上げる終盤術杖。" },
  { id: "seraphicRod", name: "熾天のロッド", category: "weapon", unlockTown: "rulacia", rarity: "legend", attack: 18, defense: 2, speed: 8, intelligence: 50, luck: 5, hp: 0, mp: 34, weight: 17, price: 4700, sellPrice: 1880, specialTags: ["magic", "speed", "volcano"], description: "全体魔法運用向けの高火力ロッド。" },
  { id: "holyflameStaff", name: "聖火の司杖", category: "weapon", unlockTown: "rulacia", rarity: "legend", attack: 20, defense: 9, speed: 2, intelligence: 46, luck: 5, hp: 38, mp: 42, weight: 24, price: 4960, sellPrice: 1984, specialTags: ["support", "cleric", "volcano"], description: "回復と過剰回復シナジーを伸ばす司杖。" },
  { id: "radiantMace", name: "熾光のメイス", category: "weapon", unlockTown: "rulacia", rarity: "legend", attack: 34, defense: 18, speed: -1, intelligence: 24, luck: 2, hp: 44, mp: 20, weight: 30, price: 4880, sellPrice: 1952, specialTags: ["support", "defense_build", "volcano"], description: "被ダメ軽減寄りの殴れる聖職メイス。" },
  { id: "fireproofHeavyArmor", name: "耐火の重鎧", category: "armor", unlockTown: "rulacia", rarity: "legend", attack: 1, defense: 40, speed: -6, intelligence: 0, luck: 0, hp: 64, mp: 4, weight: 48, price: 4200, sellPrice: 1680, specialTags: ["heavy_armor", "defense_build", "volcano"], description: "火山前線の物理戦を支える耐火重鎧。" },
  { id: "scorchbaneRobe", name: "灼熱断ちの法衣", category: "armor", unlockTown: "rulacia", rarity: "legend", attack: 0, defense: 28, speed: 0, intelligence: 10, luck: 1, hp: 34, mp: 36, weight: 24, price: 3960, sellPrice: 1584, specialTags: ["magic_armor", "volcano"], description: "魔防とMPを重視した火山法衣。" },
  { id: "crimsonMantle", name: "紅蓮外套", category: "armor", unlockTown: "rulacia", rarity: "legend", attack: 8, defense: 20, speed: 4, intelligence: 2, luck: 2, hp: 26, mp: 10, weight: 20, price: 3880, sellPrice: 1552, specialTags: ["speed_build", "volcano"], description: "攻撃寄りの終盤軽装外套。" },
  { id: "infernoKnightArmor", name: "炎獄騎士の鎧", category: "armor", unlockTown: "rulacia", rarity: "mythic", attack: 3, defense: 48, speed: -7, intelligence: 4, luck: 0, hp: 82, mp: 24, weight: 58, price: 5600, sellPrice: 2240, specialTags: ["heavy_armor", "defense_build", "volcano"], description: "防御・魔防・HPを兼ねる終盤最上位鎧。" },
  { id: "fireDragonRing", name: "火竜の指輪", category: "accessory", unlockTown: "rulacia", rarity: "legend", attack: 8, defense: 3, speed: 1, intelligence: 4, luck: 2, hp: 14, mp: 12, weight: 3, price: 3180, sellPrice: 1272, specialTags: ["magic", "volcano", "fire_magic"], description: "火属性火力と火山耐性を同時に伸ばす指輪。" },
  { id: "lavaCoreNecklace", name: "熔岩核の首飾り", category: "accessory", unlockTown: "rulacia", rarity: "legend", attack: 2, defense: 10, speed: -2, intelligence: 1, luck: 1, hp: 40, mp: 10, weight: 4, price: 3060, sellPrice: 1224, specialTags: ["defense_build", "volcano"], description: "HPと防御を稼ぐ重厚な首飾り。" },
  { id: "ashenBracelet", name: "灰燼の腕輪", category: "accessory", unlockTown: "rulacia", rarity: "legend", attack: 12, defense: 1, speed: 2, intelligence: 0, luck: 2, hp: 0, mp: -4, weight: 3, price: 3120, sellPrice: 1248, specialTags: ["volcano", "aggressive"], description: "攻撃を伸ばす代わりに扱いづらい尖り腕輪。" },
  { id: "indomitableTalisman", name: "不屈の護符", category: "accessory", unlockTown: "rulacia", rarity: "legend", attack: 1, defense: 9, speed: 0, intelligence: 2, luck: 2, hp: 24, mp: 8, weight: 3, price: 3240, sellPrice: 1296, specialTags: ["support", "defense_build", "volcano"], description: "低HP時の耐久を支えるボス戦向け護符。" },

  { id: "hydraScaleBlade", name: "ヒドラスケイルブレード", category: "weapon", unlockTown: "dustria", rarity: "legend", attack: 48, defense: 8, speed: 2, intelligence: 0, luck: 4, hp: 18, mp: 0, weight: 24, price: 3200, sellPrice: 1280, specialTags: ["desert", "boss_series", "poison_resist"], description: "ヒドラ鱗を鍛えた砂漠終盤向け大剣。" },
  { id: "hydraScaleMail", name: "ヒドラスケイルメイル", category: "armor", unlockTown: "dustria", rarity: "legend", attack: 1, defense: 30, speed: -2, intelligence: 0, luck: 0, hp: 46, mp: 6, weight: 34, price: 3080, sellPrice: 1232, specialTags: ["desert", "boss_series", "defense_build"], description: "毒耐性に優れたヒドラ鱗防具。" },
  { id: "hydraScaleCharm", name: "ヒドラスケイルチャーム", category: "accessory", unlockTown: "dustria", rarity: "legend", attack: 2, defense: 7, speed: 1, intelligence: 1, luck: 3, hp: 18, mp: 8, weight: 3, price: 2640, sellPrice: 1056, specialTags: ["desert", "boss_series", "poison_resist"], description: "多段被弾の事故を抑えるヒドラ護符。" },
  { id: "leviathiaTrident", name: "リヴァイアトライデント", category: "weapon", unlockTown: "akamatsu", rarity: "mythic", attack: 66, defense: 10, speed: 3, intelligence: 12, luck: 3, hp: 20, mp: 20, weight: 30, price: 5200, sellPrice: 2080, specialTags: ["sea", "boss_series", "magic"], description: "リヴァイア素材で作る魔法適性の高い槍杖。" },
  { id: "leviathiaVestment", name: "リヴァイアヴェストメント", category: "armor", unlockTown: "akamatsu", rarity: "mythic", attack: 0, defense: 36, speed: -1, intelligence: 12, luck: 2, hp: 48, mp: 34, weight: 30, price: 4980, sellPrice: 1992, specialTags: ["sea", "boss_series", "magic_armor"], description: "MP/知性/防御を高水準で備える上位防具。" },
  { id: "leviathiaSigil", name: "リヴァイアシジル", category: "accessory", unlockTown: "akamatsu", rarity: "mythic", attack: 3, defense: 7, speed: 2, intelligence: 8, luck: 3, hp: 14, mp: 24, weight: 3, price: 4360, sellPrice: 1744, specialTags: ["sea", "boss_series", "support"], description: "海域上位ビルド向けの封印紋章。" },
  { id: "volcaDestroyer", name: "ヴォルカデストロイヤー", category: "weapon", unlockTown: "rulacia", rarity: "mythic", attack: 108, defense: 18, speed: -9, intelligence: 0, luck: 4, hp: 40, mp: 0, weight: 64, price: 7600, sellPrice: 3040, specialTags: ["volcano", "boss_series", "heavy"], description: "高攻撃高防御を両立したヴォルカ武器。" },
  { id: "volcaBulwark", name: "ヴォルカブルワーク", category: "armor", unlockTown: "rulacia", rarity: "mythic", attack: 2, defense: 60, speed: -8, intelligence: 2, luck: 0, hp: 96, mp: 20, weight: 70, price: 7800, sellPrice: 3120, specialTags: ["volcano", "boss_series", "defense_build", "heavy_armor"], description: "超重量だが圧倒的耐久を誇る最上位防具。" },
  { id: "volcaCrest", name: "ヴォルカクレスト", category: "accessory", unlockTown: "rulacia", rarity: "mythic", attack: 10, defense: 10, speed: -1, intelligence: 4, luck: 4, hp: 32, mp: 16, weight: 4, price: 5980, sellPrice: 2392, specialTags: ["volcano", "boss_series", "boss_damage"], description: "火耐性と殴り合い性能を伸ばす頂点護章。" }
];

function registerRegionalEquipment(defs, options = {}) {
  const addToShop = options.addToShop !== false;
  defs.forEach((eq) => {
    EQUIPMENT_DATA[eq.id] = {
      id: eq.id,
      name: eq.name,
      category: eq.category,
      rarity: eq.rarity || "rare",
      attack: eq.attack || 0,
      defense: eq.defense || 0,
      speed: eq.speed || 0,
      intelligence: eq.intelligence || 0,
      luck: eq.luck || 0,
      hp: eq.hp || 0,
      mp: eq.mp || 0,
      weight: eq.weight || 0,
      specialTags: eq.specialTags || [],
      enhanceLevel: 0,
      price: eq.price || 0,
      sellPrice: eq.sellPrice || 0,
      description: eq.description || "",
      unlockTown: eq.unlockTown || null,
      neverendExclusive: !!eq.neverendExclusive
    };
    ITEM_DATA[eq.id] = {
      id: eq.id,
      name: eq.name,
      category: eq.category,
      description: eq.description || "",
      buyPrice: eq.price || 0,
      sellPrice: eq.sellPrice || 0,
      unlockTown: eq.unlockTown || null,
      neverendExclusive: !!eq.neverendExclusive
    };
    if (addToShop && !SHOP_ITEM_IDS.includes(eq.id)) {
      SHOP_ITEM_IDS.push(eq.id);
    }
  });
}

registerRegionalEquipment(REGIONAL_EQUIPMENT_DEFS);

const NEVEREND_AUCTION_EQUIPMENT_DEFS = [
  { id: "reversalGreatsword", name: "逆転の大剣", category: "weapon", unlockTown: "neverend", rarity: "mythic", attack: 138, defense: -16, speed: 6, intelligence: 0, luck: 7, hp: 0, mp: 0, weight: 46, price: 0, sellPrice: 6600, specialTags: ["neverend", "high_risk", "execution"], description: "防御を捨てるほど火力が伸びる逆転型大剣。", neverendExclusive: true },
  { id: "voidEaterTwins", name: "空欄喰らいの双刃", category: "weapon", unlockTown: "neverend", rarity: "mythic", attack: 112, defense: 0, speed: 22, intelligence: 0, luck: 12, hp: -22, mp: 0, weight: 26, price: 0, sellPrice: 7200, specialTags: ["neverend", "multi_hit", "high_risk"], description: "隙間を裂く超高速双刃。", neverendExclusive: true },
  { id: "overloadRod", name: "オーバーロードロッド", category: "weapon", unlockTown: "neverend", rarity: "mythic", attack: 30, defense: 2, speed: 4, intelligence: 96, luck: 8, hp: 0, mp: 78, weight: 24, price: 0, sellPrice: 7600, specialTags: ["neverend", "magic", "overclock"], description: "高負荷詠唱で術火力を押し上げるロッド。", neverendExclusive: true },
  { id: "grailCrusherMace", name: "聖杯砕きのメイス", category: "weapon", unlockTown: "neverend", rarity: "mythic", attack: 88, defense: 28, speed: -4, intelligence: 40, luck: 4, hp: 60, mp: 20, weight: 40, price: 0, sellPrice: 7500, specialTags: ["neverend", "support", "boss_damage"], description: "祈りごと叩き割る重聖メイス。", neverendExclusive: true },
  { id: "goldfangKunai", name: "黄金牙の苦無", category: "weapon", unlockTown: "neverend", rarity: "mythic", attack: 98, defense: 2, speed: 24, intelligence: 0, luck: 22, hp: 0, mp: 0, weight: 16, price: 0, sellPrice: 7300, specialTags: ["neverend", "lucky", "speed"], description: "会心時に爆発力が跳ねる苦無。", neverendExclusive: true },
  { id: "crackedExcalibur", name: "ひび割れたエクスカリバー", category: "weapon", unlockTown: "neverend", rarity: "mythic", attack: 168, defense: 8, speed: -12, intelligence: 0, luck: 0, hp: -80, mp: 0, weight: 66, price: 0, sellPrice: 11000, specialTags: ["neverend", "ultra_risk", "burst"], description: "扱いは難しいが瞬間火力は規格外。", neverendExclusive: true },

  { id: "cursedHeavyArmor", name: "呪縛の重鎧", category: "armor", unlockTown: "neverend", rarity: "mythic", attack: 2, defense: 88, speed: -12, intelligence: 0, luck: 0, hp: 136, mp: -20, weight: 86, price: 0, sellPrice: 8600, specialTags: ["neverend", "heavy_armor", "high_risk"], description: "圧倒的耐久と引き換えに機動を奪う。", neverendExclusive: true },
  { id: "mirageMantleNeo", name: "蜃気楼の外套", category: "armor", unlockTown: "neverend", rarity: "mythic", attack: 10, defense: 42, speed: 18, intelligence: 14, luck: 10, hp: 24, mp: 32, weight: 28, price: 0, sellPrice: 7900, specialTags: ["neverend", "speed_build", "evasion"], description: "幻像を重ねて被弾を散らす外套。", neverendExclusive: true },
  { id: "gamblerRobe", name: "賭博師の法衣", category: "armor", unlockTown: "neverend", rarity: "mythic", attack: 0, defense: 34, speed: 10, intelligence: 28, luck: 24, hp: 8, mp: 44, weight: 20, price: 0, sellPrice: 8200, specialTags: ["neverend", "lucky", "magic_armor"], description: "運が良ければ極めて強い賭博法衣。", neverendExclusive: true },
  { id: "refusalWorkwear", name: "終業拒否の作業服", category: "armor", unlockTown: "neverend", rarity: "mythic", attack: 4, defense: 64, speed: 6, intelligence: 8, luck: 4, hp: 88, mp: 12, weight: 42, price: 0, sellPrice: 8000, specialTags: ["neverend", "defense_build", "sustain"], description: "長期戦でしぶとく粘る作業服。", neverendExclusive: true },
  { id: "unbrokenFormal", name: "崩れぬ礼装", category: "armor", unlockTown: "neverend", rarity: "mythic", attack: 6, defense: 56, speed: 8, intelligence: 18, luck: 10, hp: 66, mp: 28, weight: 34, price: 0, sellPrice: 8700, specialTags: ["neverend", "balanced", "elite"], description: "攻防を崩さない上位礼装。", neverendExclusive: true },

  { id: "luckyRuinRing", name: "幸運破産の指輪", category: "accessory", unlockTown: "neverend", rarity: "mythic", attack: 10, defense: -6, speed: 8, intelligence: 4, luck: 30, hp: 0, mp: 0, weight: 2, price: 0, sellPrice: 7000, specialTags: ["neverend", "lucky", "high_risk"], description: "超高幸運だが防御事故が起こりやすい。", neverendExclusive: true },
  { id: "chainBattleNecklace", name: "連戦中毒の首飾り", category: "accessory", unlockTown: "neverend", rarity: "mythic", attack: 14, defense: 4, speed: 10, intelligence: 2, luck: 8, hp: 34, mp: 10, weight: 3, price: 0, sellPrice: 7400, specialTags: ["neverend", "aggressive", "sustain"], description: "連戦時の火力維持に特化した首飾り。", neverendExclusive: true },
  { id: "adversityEmblem", name: "逆境の徽章", category: "accessory", unlockTown: "neverend", rarity: "mythic", attack: 8, defense: 8, speed: 6, intelligence: 8, luck: 8, hp: 42, mp: 20, weight: 3, price: 0, sellPrice: 7600, specialTags: ["neverend", "boss_damage", "balanced"], description: "劣勢で真価を発揮する徽章。", neverendExclusive: true },
  { id: "runawayReactorCharm", name: "暴走炉の護符", category: "accessory", unlockTown: "neverend", rarity: "mythic", attack: 20, defense: 0, speed: 4, intelligence: 18, luck: 4, hp: 0, mp: 24, weight: 4, price: 0, sellPrice: 7800, specialTags: ["neverend", "overclock", "burst"], description: "攻撃偏重の暴走炉護符。", neverendExclusive: true },
  { id: "outControlUnit", name: "制御外ユニット", category: "accessory", unlockTown: "neverend", rarity: "mythic", attack: 26, defense: -10, speed: 16, intelligence: 10, luck: 12, hp: -20, mp: 16, weight: 4, price: 0, sellPrice: 9800, specialTags: ["neverend", "ultra_risk", "speed"], description: "制御不能な代わりに性能は規格外。", neverendExclusive: true }
];

registerRegionalEquipment(NEVEREND_AUCTION_EQUIPMENT_DEFS, { addToShop: false });

const NEVEREND_AUCTION_ITEM_TABLE = [
  { id: "auction_reversalGreatsword", itemId: "reversalGreatsword", chipPrice: 30000, category: "weapon", neverendExclusive: true },
  { id: "auction_voidEaterTwins", itemId: "voidEaterTwins", chipPrice: 50000, category: "weapon", neverendExclusive: true },
  { id: "auction_overloadRod", itemId: "overloadRod", chipPrice: 100000, category: "weapon", neverendExclusive: true },
  { id: "auction_grailCrusherMace", itemId: "grailCrusherMace", chipPrice: 90000, category: "weapon", neverendExclusive: true },
  { id: "auction_goldfangKunai", itemId: "goldfangKunai", chipPrice: 85000, category: "weapon", neverendExclusive: true },
  { id: "auction_crackedExcalibur", itemId: "crackedExcalibur", chipPrice: 500000, category: "weapon", neverendExclusive: true },

  { id: "auction_cursedHeavyArmor", itemId: "cursedHeavyArmor", chipPrice: 120000, category: "armor", neverendExclusive: true },
  { id: "auction_mirageMantleNeo", itemId: "mirageMantleNeo", chipPrice: 100000, category: "armor", neverendExclusive: true },
  { id: "auction_gamblerRobe", itemId: "gamblerRobe", chipPrice: 100000, category: "armor", neverendExclusive: true },
  { id: "auction_refusalWorkwear", itemId: "refusalWorkwear", chipPrice: 110000, category: "armor", neverendExclusive: true },
  { id: "auction_unbrokenFormal", itemId: "unbrokenFormal", chipPrice: 130000, category: "armor", neverendExclusive: true },

  { id: "auction_luckyRuinRing", itemId: "luckyRuinRing", chipPrice: 100000, category: "accessory", neverendExclusive: true },
  { id: "auction_chainBattleNecklace", itemId: "chainBattleNecklace", chipPrice: 100000, category: "accessory", neverendExclusive: true },
  { id: "auction_adversityEmblem", itemId: "adversityEmblem", chipPrice: 120000, category: "accessory", neverendExclusive: true },
  { id: "auction_runawayReactorCharm", itemId: "runawayReactorCharm", chipPrice: 150000, category: "accessory", neverendExclusive: true },
  { id: "auction_outControlUnit", itemId: "outControlUnit", chipPrice: 300000, category: "accessory", neverendExclusive: true },

  { id: "auction_divineSteelBase", itemId: "divineSteelBase", chipPrice: 10000, category: "material", neverendExclusive: true },
  { id: "auction_emptyAetherBoard", itemId: "emptyAetherBoard", chipPrice: 30000, category: "material", neverendExclusive: true },
  { id: "auction_collapseArmorShard", itemId: "collapseArmorShard", chipPrice: 50000, category: "material", neverendExclusive: true },
  { id: "auction_blessingCircuit", itemId: "blessingCircuit", chipPrice: 100000, category: "material", neverendExclusive: true },
  { id: "auction_royalCatalyst", itemId: "royalCatalyst", chipPrice: 300000, category: "material", neverendExclusive: true },

  { id: "auction_kingsElixir", itemId: "kingsElixir", chipPrice: 10000, category: "consumable", neverendExclusive: true },
  { id: "auction_angelElixir", itemId: "angelElixir", chipPrice: 30000, category: "consumable", neverendExclusive: true },
  { id: "auction_berserkStim", itemId: "berserkStim", chipPrice: 50000, category: "consumable", neverendExclusive: true },
  { id: "auction_fullRebootDrug", itemId: "fullRebootDrug", chipPrice: 100000, category: "consumable", neverendExclusive: true },
  { id: "auction_otherworldKey", itemId: "otherworldKey", chipPrice: 1000000, category: "special", neverendExclusive: true }
];

function normalizeItemData() {
  Object.keys(ITEM_DATA).forEach((itemId) => {
    const item = ITEM_DATA[itemId];
    ITEM_DATA[itemId] = {
      ...item,
      id: item.id || itemId,
      nameJa: item.nameJa || item.name || itemId,
      descriptionJa: item.descriptionJa || item.description || "説明未設定",
      effectType: item.effectType || "none",
      healAmount: Number.isFinite(item.healAmount) ? item.healAmount : 0,
      cooldown: Number.isFinite(item.cooldown) ? item.cooldown : 0,
      autoUsable: !!item.autoUsable
    };
  });
}

normalizeItemData();

const AUTO_USE_SLOT_COUNT = 3;
const AUTO_USE_HP_THRESHOLD_OPTIONS = [90, 75, 50, 40, 30, 25, 20, 10];

function createDefaultAutoUseItems() {
  return [
    { slot: 0, itemId: "potion", hpThresholdPercent: 50, isEnabled: true, cooldownRemaining: 0, cooldownUntil: 0, lastUsedAt: 0 },
    { slot: 1, itemId: "hiPotion", hpThresholdPercent: 25, isEnabled: true, cooldownRemaining: 0, cooldownUntil: 0, lastUsedAt: 0 },
    { slot: 2, itemId: null, hpThresholdPercent: 10, isEnabled: false, cooldownRemaining: 0, cooldownUntil: 0, lastUsedAt: 0 }
  ];
}

function normalizeAutoUseItems(value) {
  const defaults = createDefaultAutoUseItems();
  const rows = Array.isArray(value) ? value : [];
  return defaults.map((base, idx) => {
    const row = rows[idx] || {};
    const threshold = Number(row.hpThresholdPercent);
    return {
      ...base,
      ...row,
      slot: idx,
      itemId: row.itemId || base.itemId,
      hpThresholdPercent: AUTO_USE_HP_THRESHOLD_OPTIONS.includes(threshold) ? threshold : base.hpThresholdPercent,
      isEnabled: typeof row.isEnabled === "boolean" ? row.isEnabled : base.isEnabled,
      cooldownRemaining: Number(row.cooldownRemaining) > 0 ? Number(row.cooldownRemaining) : 0,
      cooldownUntil: Number(row.cooldownUntil) > 0 ? Number(row.cooldownUntil) : 0,
      lastUsedAt: Number(row.lastUsedAt) > 0 ? Number(row.lastUsedAt) : 0
    };
  });
}

const EQUIPMENT_SLOTS = [
  { id: "weapon1", label: "武器1", category: "weapon", index: 0 },
  { id: "weapon2", label: "武器2", category: "weapon", index: 1 },
  { id: "armor1", label: "防具1", category: "armor", index: 0 },
  { id: "armor2", label: "防具2", category: "armor", index: 1 },
  { id: "accessory1", label: "アクセ1", category: "accessory", index: 0 },
  { id: "accessory2", label: "アクセ2", category: "accessory", index: 1 }
];

const WEIGHT_RULES = [
  { rank: "light", label: "軽量", min: 0, max: 19, modifiers: { attackMultiplier: 0, defenseMultiplier: 0, speedMultiplier: 0.1, evasionBonus: 0.05 } },
  { rank: "standard", label: "標準", min: 20, max: 39, modifiers: { attackMultiplier: 0, defenseMultiplier: 0, speedMultiplier: 0, evasionBonus: 0 } },
  { rank: "heavy", label: "重装", min: 40, max: 59, modifiers: { attackMultiplier: 0, defenseMultiplier: 0.1, speedMultiplier: -0.08, evasionBonus: -0.05 } },
  { rank: "overweight", label: "過積載", min: 60, max: 79, modifiers: { attackMultiplier: 0.05, defenseMultiplier: 0.2, speedMultiplier: -0.18, evasionBonus: -0.12 } },
  { rank: "extreme", label: "極限過積載", min: 80, max: Infinity, modifiers: { attackMultiplier: 0.1, defenseMultiplier: 0.3, speedMultiplier: -0.3, evasionBonus: -0.2 } }
];

const TOWN_DATA = {
  balladore: { id: "balladore", name: "王国 バラードール", mapId: "grassland", unlockByFieldBossStage: null },
  dustria: { id: "dustria", name: "砂漠の国 ダストリア", mapId: "desert", unlockByFieldBossStage: "1-10" },
  akamatsu: { id: "akamatsu", name: "海の国 赤枩", mapId: "sea", unlockByFieldBossStage: "2-10" },
  rulacia: { id: "rulacia", name: "火の国 ルーラシア", mapId: "volcano", unlockByFieldBossStage: "3-10" },
  neverend: { id: "neverend", name: "天空都市ネバーエンド", mapId: "neverend", unlockByFieldBossStage: null },
  otherworld: { id: "otherworld", name: "異界", mapId: "otherworld", unlockByFieldBossStage: null }
};

const MAP_DATA = {
  grassland: {
    id: "grassland",
    mapIndex: 1,
    name: "草原マップ",
    region: "草原",
    recommendedLevel: "1-40",
    normalEnemyPool: ["slime", "grassWolf", "hornRabbit", "greenBee", "killerBoar", "manEaterFlower", "greatBoar"],
    fieldBoss: "behemothBison",
    bossGimmick: { type: "charge", triggerSec: 7, warning: "ベヒモスバイソンが突進の構え!", damageRate: 0.42, hint: "防御バフで受けると安全" }
  },
  desert: {
    id: "desert",
    mapIndex: 2,
    name: "砂漠マップ",
    region: "砂漠",
    recommendedLevel: "30-80",
    normalEnemyPool: ["sandWorm", "desertScorpion", "dustLizard", "mummyFighter", "camelBandit", "sandGolem", "wormDevourer"],
    fieldBoss: "duneHydra",
    bossGimmick: { type: "poisonMist", triggerSec: 8, warning: "デューンヒドラが毒霧を展開!", damageRate: 0.08, durationSec: 10, hint: "短期決戦で押し切ろう" }
  },
  sea: {
    id: "sea",
    mapIndex: 3,
    name: "海マップ",
    region: "海",
    recommendedLevel: "70-130",
    normalEnemyPool: ["seaSerpent", "blueCrab", "aquaSlime", "killerShell", "marineHarpy", "deepJelly", "tidalKnight"],
    fieldBoss: "leviathan",
    bossGimmick: { type: "periodicBurst", triggerSec: 9, warning: "リヴァイアサンが水流ブレスを放つ!", damageRate: 0.36, hint: "被弾前に防御を固める" }
  },
  volcano: {
    id: "volcano",
    mapIndex: 4,
    name: "火山マップ",
    region: "火山",
    recommendedLevel: "120-200",
    normalEnemyPool: ["flameBat", "lavaSlime", "magmaLizard", "scorchWolf", "ignisGolem", "fireElemental", "magmaTurtle"],
    fieldBoss: "volkazard",
    bossGimmick: { type: "enrage", triggerHpRate: 0.45, warning: "ヴォルカザードが怒り狂った!", attackBoost: 1.35, hint: "終盤はバフで押し切る" }
  },
  neverend: {
    id: "neverend",
    mapIndex: 5,
    name: "天空都市ネバーエンド",
    region: "天空",
    recommendedLevel: "200-320",
    normalEnemyPool: ["skygearDrone", "autoTurret", "metalHound", "bladeWorker", "repairUnit", "heavyFrame", "plasmaCore", "dataEater", "guardianArm", "hollowEnforcer", "signalCore", "overloadFrame"],
    fieldBoss: "protocol3",
    bossGimmick: { type: "protocol3Core", triggerHpRate: 0.3, warning: "Protocol3 が過熱し、制御崩壊モードへ移行した!", hint: "終盤は危険だが装甲が緩む。押し切れ。" }
  },
  otherworld: {
    id: "otherworld",
    mapIndex: 6,
    name: "異界",
    region: "異界",
    recommendedLevel: "260-420",
    normalEnemyPool: ["riftGnawer", "hollowWalker", "fragmentBeast", "abyssHand", "facelessPredator", "collapseEye", "lifelineReaper"],
    fieldBoss: "otherworldKing",
    bossGimmick: { type: "otherworldKing", triggerHpRate: 0.5, warning: "異界の王が世界法則を捻じ曲げる。", hint: "敗北すら糧にしろ。" }
  }
};

const REGION_BOSS_TITLE_SLOT_REWARD_DATA = {
  grassland: { stageId: "1-10", bossId: "behemothBison", label: "草原突破", reward: { normal: 1, cheat: 1 } },
  desert: { stageId: "2-10", bossId: "duneHydra", label: "砂漠突破", reward: { normal: 1, cheat: 1 } },
  sea: { stageId: "3-10", bossId: "leviathan", label: "海域突破", reward: { normal: 1, cheat: 1 } },
  volcano: { stageId: "4-10", bossId: "volkazard", label: "火山突破", reward: { normal: 1, cheat: 1 } }
};

const CHEAT_TITLE_SLOT_SHOP_OFFERS = [
  { id: "cheat_slot_plus_1", label: "チート称号枠増加1", requiredTownId: "dustria", requiredMapId: "desert", price: 10000, bonus: 1 },
  { id: "cheat_slot_plus_2", label: "チート称号枠増加2", requiredTownId: "akamatsu", requiredMapId: "sea", price: 50000, bonus: 1 },
  { id: "cheat_slot_plus_3", label: "チート称号枠増加3", requiredTownId: "rulacia", requiredMapId: "volcano", price: 100000, bonus: 1 }
];

function createDefaultRegionBossSlotRewardState() {
  const base = {};
  Object.keys(REGION_BOSS_TITLE_SLOT_REWARD_DATA).forEach((regionId) => {
    base[regionId] = false;
  });
  return base;
}

function createDefaultCheatTitleSlotShopState() {
  const base = {};
  CHEAT_TITLE_SLOT_SHOP_OFFERS.forEach((offer) => {
    base[offer.id] = false;
  });
  return base;
}

function normalizeCheatTitleSlotShopState(source) {
  const normalized = createDefaultCheatTitleSlotShopState();
  if (!source || typeof source !== "object") {
    return normalized;
  }
  Object.keys(normalized).forEach((offerId) => {
    normalized[offerId] = !!source[offerId];
  });
  return normalized;
}

function isCheatTitleSlotOfferUnlocked(offer) {
  if (!offer) return false;
  if (offer.requiredTownId && !state.unlockedTowns.includes(offer.requiredTownId)) {
    return false;
  }
  return true;
}

function getCheatTitleShopSlotBonus() {
  state.cheatTitleSlotShopPurchases = normalizeCheatTitleSlotShopState(state.cheatTitleSlotShopPurchases);
  return CHEAT_TITLE_SLOT_SHOP_OFFERS.reduce((acc, offer) => {
    if (!state.cheatTitleSlotShopPurchases[offer.id]) {
      return acc;
    }
    return acc + Number(offer.bonus || 0);
  }, 0);
}

function purchaseCheatTitleSlotOffer(offerId) {
  const offer = CHEAT_TITLE_SLOT_SHOP_OFFERS.find((row) => row.id === offerId);
  if (!offer) {
    return;
  }
  state.cheatTitleSlotShopPurchases = normalizeCheatTitleSlotShopState(state.cheatTitleSlotShopPurchases);
  if (state.cheatTitleSlotShopPurchases[offer.id]) {
    addLog(`${offer.label} は購入済みです。`);
    return;
  }
  if (!isCheatTitleSlotOfferUnlocked(offer)) {
    addLog(`${offer.label} は ${TOWN_DATA[offer.requiredTownId]?.name || offer.requiredMapId} 到達後に購入可能です。`);
    return;
  }
  if (state.player.gold < offer.price) {
    addLog(`所持金不足: ${offer.label} には ${offer.price}G 必要です。`);
    return;
  }
  state.player.gold -= offer.price;
  state.cheatTitleSlotShopPurchases[offer.id] = true;
  recalculateTitleEffects();
  refreshPlayerDerivedStats();
  addLog(`ギルドショップ購入: ${offer.label} を購入。チート称号枠 +${offer.bonus}`);
  render();
}

function normalizeRegionBossSlotRewardState(source) {
  const normalized = createDefaultRegionBossSlotRewardState();
  if (!source || typeof source !== "object") {
    return normalized;
  }
  Object.keys(normalized).forEach((regionId) => {
    normalized[regionId] = !!source[regionId];
  });
  return normalized;
}

function inferRegionBossSlotRewardsFromFieldBossCleared(fieldBossCleared) {
  const inferred = createDefaultRegionBossSlotRewardState();
  if (!Array.isArray(fieldBossCleared)) {
    return inferred;
  }
  Object.entries(REGION_BOSS_TITLE_SLOT_REWARD_DATA).forEach(([regionId, row]) => {
    if (row?.stageId && fieldBossCleared.includes(row.stageId)) {
      inferred[regionId] = true;
    }
  });
  return inferred;
}

function hasClaimedBossTitleSlotReward(regionId) {
  const normalized = normalizeRegionBossSlotRewardState(state.clearedRegionBossSlotRewards);
  state.clearedRegionBossSlotRewards = normalized;
  return !!normalized[regionId];
}

function getBossClearTitleSlotBonus() {
  const normalized = normalizeRegionBossSlotRewardState(state.clearedRegionBossSlotRewards);
  state.clearedRegionBossSlotRewards = normalized;
  const bonus = { normal: 0, cheat: 0 };
  Object.entries(REGION_BOSS_TITLE_SLOT_REWARD_DATA).forEach(([regionId, row]) => {
    if (!normalized[regionId]) {
      return;
    }
    bonus.normal += Number(row?.reward?.normal || 0);
    bonus.cheat += Number(row?.reward?.cheat || 0);
  });
  return bonus;
}

function claimBossTitleSlotReward(regionId) {
  const row = REGION_BOSS_TITLE_SLOT_REWARD_DATA[regionId];
  if (!row) {
    return null;
  }
  if (hasClaimedBossTitleSlotReward(regionId)) {
    return null;
  }
  state.clearedRegionBossSlotRewards = normalizeRegionBossSlotRewardState(state.clearedRegionBossSlotRewards);
  state.clearedRegionBossSlotRewards[regionId] = true;
  const reward = {
    normal: Number(row?.reward?.normal || 0),
    cheat: Number(row?.reward?.cheat || 0)
  };
  recalculateTitleEffects();
  return { regionId, label: row.label || regionId, reward };
}

const SHOP_REGION_TABS = [
  { id: "grassland", label: "草原" },
  { id: "desert", label: "砂漠" },
  { id: "sea", label: "海" },
  { id: "volcano", label: "火山" },
  { id: "neverend", label: "天空都市" },
  { id: "otherworld", label: "異界" }
];

const MAP_SCALING_DATA = {
  grassland: {
    mapBaseMultiplier: 1.65,
    attackBaseMultiplier: 1.7,
    defenseBaseMultiplier: 1.45,
    speedBaseMultiplier: 1.03,
    hpScalePerStage: 0.08,
    attackScalePerStage: 0.07,
    defenseScalePerStage: 0.06,
    speedScalePerStage: 0.008,
    stageCurveByIndex: [0.72, 0.88, 1.0, 1.12, 1.24, 1.38, 1.52, 1.67, 1.83, 2.0],
    bossBonusMultiplier: 1.55,
    bossAttackMultiplier: 1.2,
    bossDefenseMultiplier: 1.14,
    bossSpeedMultiplier: 1.08,
    gimmickDamageMultiplier: 1.25,
    gimmickScalePerStage: 0.025
  },
  desert: {
    mapBaseMultiplier: 2.15,
    attackBaseMultiplier: 1.95,
    defenseBaseMultiplier: 1.68,
    speedBaseMultiplier: 1.05,
    hpScalePerStage: 0.1,
    attackScalePerStage: 0.085,
    defenseScalePerStage: 0.07,
    speedScalePerStage: 0.011,
    bossBonusMultiplier: 1.65,
    bossAttackMultiplier: 1.24,
    bossDefenseMultiplier: 1.18,
    bossSpeedMultiplier: 1.11,
    gimmickDamageMultiplier: 1.35,
    gimmickScalePerStage: 0.03
  },
  sea: {
    mapBaseMultiplier: 2.35,
    attackBaseMultiplier: 2.12,
    defenseBaseMultiplier: 1.82,
    speedBaseMultiplier: 1.06,
    hpScalePerStage: 0.115,
    attackScalePerStage: 0.1,
    defenseScalePerStage: 0.082,
    speedScalePerStage: 0.013,
    bossBonusMultiplier: 1.75,
    bossAttackMultiplier: 1.28,
    bossDefenseMultiplier: 1.22,
    bossSpeedMultiplier: 1.14,
    gimmickDamageMultiplier: 1.48,
    gimmickScalePerStage: 0.035
  },
  volcano: {
    mapBaseMultiplier: 2.55,
    attackBaseMultiplier: 2.3,
    defenseBaseMultiplier: 1.95,
    speedBaseMultiplier: 1.07,
    hpScalePerStage: 0.13,
    attackScalePerStage: 0.115,
    defenseScalePerStage: 0.094,
    speedScalePerStage: 0.015,
    bossBonusMultiplier: 1.9,
    bossAttackMultiplier: 1.32,
    bossDefenseMultiplier: 1.27,
    bossSpeedMultiplier: 1.18,
    gimmickDamageMultiplier: 1.62,
    gimmickScalePerStage: 0.04
  },
  neverend: {
    mapBaseMultiplier: 2.9,
    attackBaseMultiplier: 2.85,
    defenseBaseMultiplier: 2.52,
    speedBaseMultiplier: 1.09,
    hpScalePerStage: 0.11,
    attackScalePerStage: 0.13,
    defenseScalePerStage: 0.1,
    speedScalePerStage: 0.018,
    bossBonusMultiplier: 2.08,
    bossAttackMultiplier: 1.42,
    bossDefenseMultiplier: 1.36,
    bossSpeedMultiplier: 1.24,
    gimmickDamageMultiplier: 1.85,
    gimmickScalePerStage: 0.05
  },
  otherworld: {
    mapBaseMultiplier: 3.55,
    attackBaseMultiplier: 3.62,
    defenseBaseMultiplier: 3.18,
    speedBaseMultiplier: 1.2,
    hpScalePerStage: 0.12,
    attackScalePerStage: 0.14,
    defenseScalePerStage: 0.11,
    speedScalePerStage: 0.02,
    bossBonusMultiplier: 2.35,
    bossAttackMultiplier: 1.58,
    bossDefenseMultiplier: 1.46,
    bossSpeedMultiplier: 1.33,
    gimmickDamageMultiplier: 2.0,
    gimmickScalePerStage: 0.06
  },
  default: {
    mapBaseMultiplier: 1,
    attackBaseMultiplier: 1,
    defenseBaseMultiplier: 1,
    speedBaseMultiplier: 1,
    hpScalePerStage: 0,
    attackScalePerStage: 0,
    defenseScalePerStage: 0,
    speedScalePerStage: 0,
    bossBonusMultiplier: 1,
    bossAttackMultiplier: 1,
    bossDefenseMultiplier: 1,
    bossSpeedMultiplier: 1,
    gimmickDamageMultiplier: 1,
    gimmickScalePerStage: 0
  }
};

const ADVENTURE_REGION_BALANCE_CONFIG = {
  desert: {
    regionBase: { hp: 1.18, attack: 1.24, defense: 1.2, speed: 1.03, intelligence: 1.05, luck: 1.04 },
    stageGrowth: { hp: 0.016, attack: 0.018, defense: 0.015, speed: 0.003, intelligence: 0.004, luck: 0.003 },
    lateStageSpike: { fromStage: 7, hp: 1.08, attack: 1.1, defense: 1.08, speed: 1.03, intelligence: 1.04, luck: 1.03 },
    stageBossCandidate: { fromStage: 8, hp: 1.1, attack: 1.12, defense: 1.1, speed: 1.03, intelligence: 1.04, luck: 1.03 },
    fieldBoss: { hp: 1.12, attack: 1.1, defense: 1.1, speed: 1.03, intelligence: 1.04, luck: 1.03 },
    gimmick: { damageMultiplier: 1.14, attackBoostMultiplier: 1.06 },
    enemySpecific: {
      sandWorm: { hp: 1.16, attack: 1.2, defense: 1.08, speed: 1.03, intelligence: 1, luck: 1.02 },
      desertScorpion: { hp: 1.12, attack: 1.24, defense: 1.06, speed: 1.07, intelligence: 1.04, luck: 1.08 },
      sandGolem: { hp: 1.24, attack: 1.16, defense: 1.24, speed: 0.98, intelligence: 1.02, luck: 1 },
      scorpionLord: { hp: 1.18, attack: 1.22, defense: 1.12, speed: 1.06, intelligence: 1.04, luck: 1.06 },
      wormDevourer: { hp: 1.24, attack: 1.23, defense: 1.17, speed: 1.02, intelligence: 1.05, luck: 1.04 },
      duneHydra: { hp: 1.14, attack: 1.12, defense: 1.12, speed: 1.05, intelligence: 1.08, luck: 1.06 }
    }
  },
  sea: {
    regionBase: { hp: 1.3, attack: 1.33, defense: 1.34, speed: 1.04, intelligence: 1.1, luck: 1.06 },
    stageGrowth: { hp: 0.02, attack: 0.022, defense: 0.02, speed: 0.0035, intelligence: 0.005, luck: 0.0035 },
    lateStageSpike: { fromStage: 7, hp: 1.12, attack: 1.14, defense: 1.13, speed: 1.04, intelligence: 1.06, luck: 1.04 },
    stageBossCandidate: { fromStage: 8, hp: 1.12, attack: 1.14, defense: 1.12, speed: 1.04, intelligence: 1.05, luck: 1.04 },
    fieldBoss: { hp: 1.14, attack: 1.12, defense: 1.12, speed: 1.04, intelligence: 1.06, luck: 1.05 },
    gimmick: { damageMultiplier: 1.22, attackBoostMultiplier: 1.08 },
    enemySpecific: {
      blueCrab: { hp: 1.24, attack: 1.12, defense: 1.3, speed: 0.98, intelligence: 1.02, luck: 1.02 },
      killerShell: { hp: 1.23, attack: 1.16, defense: 1.32, speed: 0.97, intelligence: 1.04, luck: 1.02 },
      deepJelly: { hp: 1.18, attack: 1.2, defense: 1.16, speed: 1.04, intelligence: 1.16, luck: 1.05 },
      krakenSpawn: { hp: 1.24, attack: 1.24, defense: 1.2, speed: 1.04, intelligence: 1.1, luck: 1.04 },
      tidalKnight: { hp: 1.24, attack: 1.24, defense: 1.2, speed: 1.07, intelligence: 1.1, luck: 1.06 },
      leviathan: { hp: 1.16, attack: 1.14, defense: 1.14, speed: 1.06, intelligence: 1.1, luck: 1.08 }
    }
  },
  volcano: {
    regionBase: { hp: 1.42, attack: 1.46, defense: 1.43, speed: 1.05, intelligence: 1.12, luck: 1.08 },
    stageGrowth: { hp: 0.025, attack: 0.028, defense: 0.024, speed: 0.004, intelligence: 0.006, luck: 0.004 },
    lateStageSpike: { fromStage: 7, hp: 1.16, attack: 1.2, defense: 1.16, speed: 1.05, intelligence: 1.08, luck: 1.06 },
    stageBossCandidate: { fromStage: 8, hp: 1.14, attack: 1.16, defense: 1.14, speed: 1.05, intelligence: 1.06, luck: 1.05 },
    fieldBoss: { hp: 1.16, attack: 1.15, defense: 1.14, speed: 1.05, intelligence: 1.08, luck: 1.07 },
    gimmick: { damageMultiplier: 1.3, attackBoostMultiplier: 1.1 },
    enemySpecific: {
      scorchWolf: { hp: 1.16, attack: 1.24, defense: 1.12, speed: 1.08, intelligence: 1.03, luck: 1.05 },
      ignisGolem: { hp: 1.28, attack: 1.2, defense: 1.28, speed: 0.97, intelligence: 1.03, luck: 1.01 },
      fireElemental: { hp: 1.2, attack: 1.25, defense: 1.14, speed: 1.06, intelligence: 1.16, luck: 1.06 },
      blazeDemon: { hp: 1.24, attack: 1.28, defense: 1.2, speed: 1.06, intelligence: 1.12, luck: 1.06 },
      magmaTurtle: { hp: 1.32, attack: 1.2, defense: 1.32, speed: 0.95, intelligence: 1.04, luck: 1.02 },
      volkazard: { hp: 1.18, attack: 1.16, defense: 1.16, speed: 1.08, intelligence: 1.1, luck: 1.08 }
    }
  },
  neverend: {
    regionBase: { hp: 1.08, attack: 1.62, defense: 1.66, speed: 1.14, intelligence: 1.18, luck: 1.12 },
    stageGrowth: { hp: 0.008, attack: 0.018, defense: 0.016, speed: 0.006, intelligence: 0.007, luck: 0.005 },
    lateStageSpike: { fromStage: 7, hp: 1.06, attack: 1.18, defense: 1.16, speed: 1.1, intelligence: 1.12, luck: 1.08 },
    stageBossCandidate: { fromStage: 8, hp: 1.06, attack: 1.14, defense: 1.12, speed: 1.08, intelligence: 1.1, luck: 1.08 },
    fieldBoss: { hp: 1.08, attack: 1.2, defense: 1.22, speed: 1.13, intelligence: 1.14, luck: 1.1 },
    gimmick: { damageMultiplier: 1.45, attackBoostMultiplier: 1.2 },
    enemySpecific: {
      skygearDrone: { hp: 0.96, attack: 1.18, defense: 1.12, speed: 1.2, intelligence: 1.06, luck: 1.08 },
      autoTurret: { hp: 0.92, attack: 1.22, defense: 1.32, speed: 0.9, intelligence: 1.08, luck: 1.04 },
      metalHound: { hp: 1.0, attack: 1.2, defense: 1.14, speed: 1.22, intelligence: 1.02, luck: 1.08 },
      bladeWorker: { hp: 0.95, attack: 1.24, defense: 1.14, speed: 1.24, intelligence: 1.06, luck: 1.1 },
      repairUnit: { hp: 0.9, attack: 1.02, defense: 1.18, speed: 1.1, intelligence: 1.26, luck: 1.06 },
      heavyFrame: { hp: 1.2, attack: 1.28, defense: 1.4, speed: 0.86, intelligence: 1.05, luck: 1.02 },
      plasmaCore: { hp: 0.86, attack: 1.34, defense: 1.08, speed: 1.16, intelligence: 1.32, luck: 1.1 },
      dataEater: { hp: 0.88, attack: 1.22, defense: 1.12, speed: 1.18, intelligence: 1.28, luck: 1.12 },
      guardianArm: { hp: 1.12, attack: 1.3, defense: 1.42, speed: 0.92, intelligence: 1.1, luck: 1.04 },
      overloadFrame: { hp: 1.18, attack: 1.36, defense: 1.4, speed: 0.95, intelligence: 1.14, luck: 1.06 },
      protocol3: { hp: 1.05, attack: 1.38, defense: 1.45, speed: 1.16, intelligence: 1.18, luck: 1.1 }
    }
  },
  otherworld: {
    regionBase: { hp: 1.3, attack: 1.86, defense: 1.62, speed: 1.22, intelligence: 1.28, luck: 1.2 },
    stageGrowth: { hp: 0.016, attack: 0.022, defense: 0.018, speed: 0.008, intelligence: 0.01, luck: 0.008 },
    lateStageSpike: { fromStage: 6, hp: 1.08, attack: 1.2, defense: 1.16, speed: 1.12, intelligence: 1.1, luck: 1.08 },
    stageBossCandidate: { fromStage: 1, hp: 1.0, attack: 1.0, defense: 1.0, speed: 1.0, intelligence: 1.0, luck: 1.0 },
    fieldBoss: { hp: 1.18, attack: 1.36, defense: 1.26, speed: 1.18, intelligence: 1.22, luck: 1.14 },
    gimmick: { damageMultiplier: 1.6, attackBoostMultiplier: 1.28 },
    enemySpecific: {
      otherworldKing: { hp: 1.2, attack: 1.4, defense: 1.34, speed: 1.22, intelligence: 1.28, luck: 1.2 },
      awakenedProtocol3: { hp: 1.14, attack: 1.34, defense: 1.3, speed: 1.2, intelligence: 1.24, luck: 1.16 }
    }
  }
};

function multiplyStatMultipliers(target, values) {
  if (!values) {
    return;
  }
  ["hp", "attack", "defense", "speed", "intelligence", "luck"].forEach((key) => {
    if (typeof values[key] === "number") {
      target[key] *= values[key];
    }
  });
}

function getAdventureRegionStatMultipliers(enemy, stageData) {
  const base = { hp: 1, attack: 1, defense: 1, speed: 1, intelligence: 1, luck: 1 };
  if (!enemy || !stageData || !["desert", "sea", "volcano", "neverend", "otherworld"].includes(stageData.mapId)) {
    return base;
  }
  const config = ADVENTURE_REGION_BALANCE_CONFIG[stageData.mapId];
  if (!config) {
    return base;
  }
  const stageStep = Math.max(0, Number(stageData.stageIndex || 1) - 1);
  multiplyStatMultipliers(base, config.regionBase);
  if (config.stageGrowth) {
    multiplyStatMultipliers(base, {
      hp: 1 + stageStep * (config.stageGrowth.hp || 0),
      attack: 1 + stageStep * (config.stageGrowth.attack || 0),
      defense: 1 + stageStep * (config.stageGrowth.defense || 0),
      speed: 1 + stageStep * (config.stageGrowth.speed || 0),
      intelligence: 1 + stageStep * (config.stageGrowth.intelligence || 0),
      luck: 1 + stageStep * (config.stageGrowth.luck || 0)
    });
  }
  if (!stageData.isBoss && config.lateStageSpike && Number(stageData.stageIndex || 1) >= Number(config.lateStageSpike.fromStage || 99)) {
    multiplyStatMultipliers(base, config.lateStageSpike);
  }
  if (stageData.isBoss) {
    multiplyStatMultipliers(base, config.fieldBoss);
  } else if (
    config.stageBossCandidate &&
    Number(stageData.stageIndex || 1) >= Number(config.stageBossCandidate.fromStage || 99) &&
    stageData.stageBossCandidateId &&
    enemy.id === stageData.stageBossCandidateId
  ) {
    multiplyStatMultipliers(base, config.stageBossCandidate);
  }
  if (config.enemySpecific?.[enemy.id]) {
    multiplyStatMultipliers(base, config.enemySpecific[enemy.id]);
  }
  return base;
}

function getMapScalingData(mapId) {
  return MAP_SCALING_DATA[mapId] || MAP_SCALING_DATA.default;
}

function getStageIndex(stageId) {
  const stage = STAGE_DATA[stageId];
  if (stage && Number.isFinite(stage.stageNo)) {
    return Math.max(1, Math.min(10, stage.stageNo));
  }
  const raw = String(stageId || "").split("-")[1];
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return 1;
  }
  return Math.max(1, Math.min(10, parsed));
}

function isMainAdventureStage(stageId) {
  const stage = STAGE_DATA[stageId];
  if (!stage) {
    return false;
  }
  if (!["grassland", "desert", "sea", "volcano", "neverend", "otherworld"].includes(stage.mapId)) {
    return false;
  }
  return stage.stageNo >= 1 && stage.stageNo <= 10;
}

function applyStageScalingToEnemy(enemy, stageData) {
  if (!enemy) {
    return null;
  }
  if (enemy.rarity === "unique" || enemy.aiType === "unique") {
    return { ...enemy };
  }
  const mapScaling = getMapScalingData(stageData.mapId);
  const stageStep = Math.max(0, stageData.stageIndex - 1);
  const isBoss = !!stageData.isBoss;
  const bossMultiplier = isBoss ? mapScaling.bossBonusMultiplier : 1;

  const stageCurve = Array.isArray(mapScaling.stageCurveByIndex) ? mapScaling.stageCurveByIndex : null;
  const curveValue = stageCurve ? stageCurve[Math.max(0, Math.min(stageCurve.length - 1, stageData.stageIndex - 1))] : null;
  const hpStageMultiplier = curveValue ?? (1 + stageStep * mapScaling.hpScalePerStage);
  const attackStageMultiplier = curveValue ?? (1 + stageStep * mapScaling.attackScalePerStage);
  const defenseStageMultiplier = curveValue ?? (1 + stageStep * mapScaling.defenseScalePerStage);
  const speedStageRaw = curveValue ?? (1 + stageStep * mapScaling.speedScalePerStage);
  const speedStageMultiplier = clamp(0.96, 1.35, 1 + (speedStageRaw - 1) * 0.5);

  const hpMultiplier = mapScaling.mapBaseMultiplier * hpStageMultiplier * bossMultiplier;
  const attackMultiplier = mapScaling.attackBaseMultiplier * attackStageMultiplier * (isBoss ? mapScaling.bossAttackMultiplier : 1);
  const defenseMultiplier = mapScaling.defenseBaseMultiplier * defenseStageMultiplier * (isBoss ? mapScaling.bossDefenseMultiplier : 1);
  const speedMultiplier = mapScaling.speedBaseMultiplier * speedStageMultiplier * (isBoss ? mapScaling.bossSpeedMultiplier : 1);
  const regionBalanceMultiplier = getAdventureRegionStatMultipliers(enemy, stageData);

  return {
    ...enemy,
    hp: Math.max(1, Math.floor(enemy.hp * hpMultiplier * regionBalanceMultiplier.hp)),
    attack: Math.max(1, Math.floor(enemy.attack * attackMultiplier * regionBalanceMultiplier.attack)),
    defense: Math.max(0, Math.floor(enemy.defense * defenseMultiplier * regionBalanceMultiplier.defense)),
    speed: Math.max(1, Math.floor(enemy.speed * speedMultiplier * regionBalanceMultiplier.speed)),
    intelligence: Math.max(1, Math.floor(enemy.intelligence * (1 + stageStep * 0.015) * regionBalanceMultiplier.intelligence)),
    luck: Math.max(1, Math.floor(enemy.luck * (1 + stageStep * 0.01) * regionBalanceMultiplier.luck))
  };
}

function getScaledEnemyStats(enemyId, currentMapId, currentStageId, isBoss = false) {
  const source = state.world.enemies[enemyId] || ENEMY_DATA[enemyId];
  if (!source) {
    return null;
  }
  if (!isMainAdventureStage(currentStageId)) {
    return { ...source };
  }
  const stageData = {
    mapId: currentMapId,
    stageId: currentStageId,
    stageIndex: getStageIndex(currentStageId),
    isBoss,
    stageBossCandidateId: STAGE_DATA[currentStageId]?.bossEnemy || null
  };
  return applyStageScalingToEnemy(source, stageData);
}

function getScaledBossGimmick(stageId, mapId) {
  if (!isMainAdventureStage(stageId)) {
    return STAGE_DATA[stageId]?.bossGimmick || MAP_DATA[mapId]?.bossGimmick || null;
  }
  const base = STAGE_DATA[stageId]?.bossGimmick || MAP_DATA[mapId]?.bossGimmick;
  if (!base) {
    return null;
  }
  const mapScaling = getMapScalingData(mapId);
  const stageStep = Math.max(0, getStageIndex(stageId) - 1);
  const gimmickScale = mapScaling.gimmickDamageMultiplier * (1 + stageStep * mapScaling.gimmickScalePerStage);
  const regionGimmick = ADVENTURE_REGION_BALANCE_CONFIG[mapId]?.gimmick || null;
  const damageRateScale = gimmickScale * (regionGimmick?.damageMultiplier || 1);
  const attackBoostScale = (1 + stageStep * 0.01) * (regionGimmick?.attackBoostMultiplier || 1);
  return {
    ...base,
    damageRate: typeof base.damageRate === "number" ? Number((base.damageRate * damageRateScale).toFixed(4)) : base.damageRate,
    attackBoost: typeof base.attackBoost === "number" ? Number((base.attackBoost * attackBoostScale).toFixed(4)) : base.attackBoost
  };
}

const UNIQUE_MONSTER_PROFILES = {
  fenrir: {
    uniqueBaseMultiplier: { hp: 4.8, attack: 3.8, defense: 2.8, speed: 2.2, exp: 3.2, gold: 3.1 },
    uniqueBossTier: "mythic_predator",
    actionIntervalMultiplier: 0.75,
    hitBonus: 0.08,
    critRate: 0.2,
    damageMultiplier: 1.28,
    multiHitChance: 0.26,
    multiHitMax: 2,
    gimmickProfile: { type: "fenrir_rampage" }
  },
  jormungand: {
    uniqueBaseMultiplier: { hp: 5.3, attack: 3.4, defense: 3.3, speed: 1.7, exp: 3.5, gold: 3.3 },
    uniqueBossTier: "mythic_world_serpent",
    actionIntervalMultiplier: 0.82,
    hitBonus: 0.05,
    critRate: 0.12,
    damageMultiplier: 1.26,
    multiHitChance: 0.16,
    multiHitMax: 2,
    gimmickProfile: { type: "jormungand_venom" }
  },
  cerberus: {
    uniqueBaseMultiplier: { hp: 4.9, attack: 4, defense: 2.9, speed: 2.05, exp: 3.6, gold: 3.5 },
    uniqueBossTier: "mythic_hellhound",
    actionIntervalMultiplier: 0.76,
    hitBonus: 0.07,
    critRate: 0.18,
    damageMultiplier: 1.3,
    multiHitChance: 0.36,
    multiHitMax: 3,
    gimmickProfile: { type: "cerberus_inferno" }
  },
  griffon: {
    uniqueBaseMultiplier: { hp: 4.7, attack: 3.55, defense: 2.85, speed: 2.35, exp: 3.3, gold: 3.2 },
    uniqueBossTier: "mythic_sky_king",
    actionIntervalMultiplier: 0.72,
    hitBonus: 0.09,
    critRate: 0.24,
    damageMultiplier: 1.22,
    playerHitPenalty: 0.08,
    multiHitChance: 0.21,
    multiHitMax: 2,
    gimmickProfile: { type: "griffon_dive" }
  },
  minotauros: {
    uniqueBaseMultiplier: { hp: 5.1, attack: 4.4, defense: 3.45, speed: 1.45, exp: 3.8, gold: 3.6 },
    uniqueBossTier: "mythic_labyrinth_tyrant",
    actionIntervalMultiplier: 0.9,
    hitBonus: 0.04,
    critRate: 0.12,
    damageMultiplier: 1.48,
    multiHitChance: 0.12,
    multiHitMax: 2,
    gimmickProfile: { type: "minotauros_crush" }
  },
  phoenix: {
    uniqueBaseMultiplier: { hp: 5.2, attack: 3.45, defense: 3, speed: 2.1, exp: 3.9, gold: 3.7 },
    uniqueBossTier: "mythic_immortal_flame",
    actionIntervalMultiplier: 0.78,
    hitBonus: 0.07,
    critRate: 0.17,
    damageMultiplier: 1.24,
    multiHitChance: 0.22,
    multiHitMax: 2,
    gimmickProfile: { type: "phoenix_rebirth" }
  },
  kirin: {
    uniqueBaseMultiplier: { hp: 5, attack: 4.05, defense: 3.1, speed: 2.28, exp: 4, gold: 3.8 },
    uniqueBossTier: "mythic_thunder_beast",
    actionIntervalMultiplier: 0.74,
    hitBonus: 0.08,
    critRate: 0.22,
    damageMultiplier: 1.34,
    multiHitChance: 0.28,
    multiHitMax: 2,
    gimmickProfile: { type: "kirin_thunder" }
  }
};

function getUniqueProfile(uniqueId) {
  return UNIQUE_MONSTER_PROFILES[uniqueId] || {
    uniqueBaseMultiplier: { hp: 4, attack: 3.2, defense: 2.6, speed: 1.8, exp: 3, gold: 3 },
    uniqueBossTier: "mythic",
    actionIntervalMultiplier: 0.8,
    hitBonus: 0.05,
    critRate: 0.1,
    damageMultiplier: 1.2,
    multiHitChance: 0.15,
    multiHitMax: 2,
    gimmickProfile: { type: "generic_unique" }
  };
}

function getUniqueEnemyStats(uniqueId) {
  const source = state.world.uniqueEnemies[uniqueId] || UNIQUE_ENEMY_DATA[uniqueId];
  if (!source) {
    return null;
  }
  const profile = getUniqueProfile(uniqueId);
  const m = profile.uniqueBaseMultiplier || {};
  const scaled = {
    ...source,
    hp: Math.max(1, Math.floor(source.hp * (m.hp || 1))),
    attack: Math.max(1, Math.floor(source.attack * (m.attack || 1))),
    defense: Math.max(0, Math.floor(source.defense * (m.defense || 1))),
    speed: Math.max(1, Math.floor(source.speed * (m.speed || 1))),
    intelligence: Math.max(1, Math.floor(source.intelligence * 1.5)),
    luck: Math.max(1, Math.floor(source.luck * 1.35)),
    exp: Math.max(1, Math.floor(source.exp * (m.exp || 1))),
    gold: Math.max(1, Math.floor(source.gold * (m.gold || 1))),
    uniqueBossTier: profile.uniqueBossTier,
    uniqueGimmickProfile: profile.gimmickProfile || { type: "generic_unique" },
    uniqueCombatProfile: profile
  };
  return scaled;
}

function getCurrentUniqueCombatProfile() {
  if (!state.battle.isUniqueBattle || !state.battle.enemy) {
    return null;
  }
  return state.battle.uniqueCombatProfile || state.battle.enemy.uniqueCombatProfile || getUniqueProfile(state.battle.enemy.id);
}

function enemyTemplate(base) {
  return { mp: 0, rarity: "common", skills: [], aiType: "normal", dropTable: [], ...base };
}

const ENEMY_DATA = {
  slime: enemyTemplate({ id: "slime", name: "スライム", species: "slime", region: "grassland", hp: 42, attack: 8, defense: 4, speed: 9, intelligence: 3, luck: 6, exp: 8, gold: 6 }),
  grassWolf: enemyTemplate({ id: "grassWolf", name: "グラスウルフ", species: "beast", region: "grassland", hp: 58, attack: 11, defense: 6, speed: 13, intelligence: 5, luck: 8, exp: 11, gold: 8 }),
  hornRabbit: enemyTemplate({ id: "hornRabbit", name: "ホーンラビット", species: "beast", region: "grassland", hp: 50, attack: 10, defense: 5, speed: 14, intelligence: 4, luck: 10, exp: 10, gold: 7 }),
  greenBee: enemyTemplate({ id: "greenBee", name: "グリーンビー", species: "insect", region: "grassland", hp: 46, attack: 9, defense: 5, speed: 12, intelligence: 4, luck: 9, exp: 10, gold: 7 }),
  killerBoar: enemyTemplate({ id: "killerBoar", name: "キラーボア", species: "beast", region: "grassland", hp: 72, attack: 15, defense: 9, speed: 9, intelligence: 4, luck: 8, exp: 14, gold: 10 }),
  manEaterFlower: enemyTemplate({ id: "manEaterFlower", name: "マンイーターフラワー", species: "plant", region: "grassland", hp: 78, attack: 14, defense: 10, speed: 8, intelligence: 7, luck: 7, exp: 16, gold: 11 }),
  greatBoar: enemyTemplate({ id: "greatBoar", name: "グレートボア", species: "beast", region: "grassland", rarity: "elite", hp: 120, attack: 20, defense: 14, speed: 11, intelligence: 7, luck: 8, exp: 28, gold: 22 }),
  behemothBison: enemyTemplate({ id: "behemothBison", name: "草原の覇者 ベヒモスバイソン", species: "boss", region: "grassland", rarity: "fieldBoss", hp: 520, attack: 44, defense: 28, speed: 16, intelligence: 16, luck: 14, exp: 420, gold: 340, aiType: "boss" }),

  sandWorm: enemyTemplate({ id: "sandWorm", name: "サンドワーム", species: "worm", region: "desert", hp: 210, attack: 32, defense: 18, speed: 14, intelligence: 9, luck: 10, exp: 42, gold: 32 }),
  desertScorpion: enemyTemplate({ id: "desertScorpion", name: "デザートスコーピオン", species: "insect", region: "desert", hp: 190, attack: 34, defense: 17, speed: 18, intelligence: 10, luck: 12, exp: 43, gold: 33 }),
  dustLizard: enemyTemplate({ id: "dustLizard", name: "ダストリザード", species: "reptile", region: "desert", hp: 205, attack: 30, defense: 20, speed: 15, intelligence: 11, luck: 11, exp: 44, gold: 34 }),
  mummyFighter: enemyTemplate({ id: "mummyFighter", name: "ミイラファイター", species: "undead", region: "desert", hp: 230, attack: 36, defense: 22, speed: 12, intelligence: 12, luck: 10, exp: 48, gold: 38 }),
  camelBandit: enemyTemplate({ id: "camelBandit", name: "キャメルバンディット", species: "humanoid", region: "desert", hp: 220, attack: 38, defense: 21, speed: 16, intelligence: 12, luck: 12, exp: 50, gold: 40 }),
  sandGolem: enemyTemplate({ id: "sandGolem", name: "サンドゴーレム", species: "golem", region: "desert", hp: 280, attack: 40, defense: 28, speed: 9, intelligence: 8, luck: 9, exp: 56, gold: 45 }),
  wormDevourer: enemyTemplate({ id: "wormDevourer", name: "ワームデバウア", species: "worm", region: "desert", rarity: "elite", hp: 340, attack: 48, defense: 30, speed: 12, intelligence: 11, luck: 10, exp: 78, gold: 65 }),
  duneHydra: enemyTemplate({ id: "duneHydra", name: "砂海の暴君 デューンヒドラ", species: "boss", region: "desert", rarity: "fieldBoss", hp: 1150, attack: 82, defense: 55, speed: 22, intelligence: 26, luck: 18, exp: 1100, gold: 950, aiType: "boss" }),

  seaSerpent: enemyTemplate({ id: "seaSerpent", name: "シーサーペント", species: "serpent", region: "sea", hp: 560, attack: 76, defense: 48, speed: 24, intelligence: 24, luck: 16, exp: 130, gold: 110 }),
  blueCrab: enemyTemplate({ id: "blueCrab", name: "ブルークラブ", species: "crustacean", region: "sea", hp: 620, attack: 70, defense: 56, speed: 17, intelligence: 18, luck: 14, exp: 125, gold: 105 }),
  aquaSlime: enemyTemplate({ id: "aquaSlime", name: "アクアスライム", species: "slime", region: "sea", hp: 540, attack: 68, defense: 44, speed: 21, intelligence: 25, luck: 17, exp: 122, gold: 102 }),
  killerShell: enemyTemplate({ id: "killerShell", name: "キラーシェル", species: "shell", region: "sea", hp: 650, attack: 74, defense: 60, speed: 15, intelligence: 19, luck: 14, exp: 135, gold: 108 }),
  marineHarpy: enemyTemplate({ id: "marineHarpy", name: "マリンハーピー", species: "flying", region: "sea", hp: 570, attack: 79, defense: 46, speed: 27, intelligence: 24, luck: 18, exp: 138, gold: 112 }),
  deepJelly: enemyTemplate({ id: "deepJelly", name: "ディープジェリー", species: "jelly", region: "sea", hp: 600, attack: 72, defense: 52, speed: 20, intelligence: 28, luck: 16, exp: 140, gold: 114 }),
  tidalKnight: enemyTemplate({ id: "tidalKnight", name: "タイダルナイト", species: "humanoid", region: "sea", rarity: "elite", hp: 760, attack: 92, defense: 65, speed: 23, intelligence: 30, luck: 19, exp: 190, gold: 160 }),
  leviathan: enemyTemplate({ id: "leviathan", name: "蒼海王 リヴァイアサン", species: "boss", region: "sea", rarity: "fieldBoss", hp: 2400, attack: 150, defense: 95, speed: 32, intelligence: 48, luck: 25, exp: 2600, gold: 2100, aiType: "boss" }),

  flameBat: enemyTemplate({ id: "flameBat", name: "フレイムバット", species: "flying", region: "volcano", hp: 980, attack: 125, defense: 70, speed: 38, intelligence: 35, luck: 20, exp: 260, gold: 220 }),
  lavaSlime: enemyTemplate({ id: "lavaSlime", name: "ラヴァスライム", species: "slime", region: "volcano", hp: 1100, attack: 128, defense: 82, speed: 26, intelligence: 36, luck: 20, exp: 275, gold: 230 }),
  magmaLizard: enemyTemplate({ id: "magmaLizard", name: "マグマリザード", species: "reptile", region: "volcano", hp: 1200, attack: 135, defense: 88, speed: 28, intelligence: 34, luck: 21, exp: 290, gold: 240 }),
  scorchWolf: enemyTemplate({ id: "scorchWolf", name: "スコーチウルフ", species: "beast", region: "volcano", hp: 1160, attack: 142, defense: 80, speed: 35, intelligence: 32, luck: 22, exp: 300, gold: 245 }),
  ignisGolem: enemyTemplate({ id: "ignisGolem", name: "イグニスゴーレム", species: "golem", region: "volcano", hp: 1450, attack: 150, defense: 112, speed: 18, intelligence: 28, luck: 18, exp: 330, gold: 280 }),
  fireElemental: enemyTemplate({ id: "fireElemental", name: "ファイアエレメンタル", species: "elemental", region: "volcano", hp: 1260, attack: 148, defense: 90, speed: 34, intelligence: 44, luck: 24, exp: 335, gold: 285 }),
  magmaTurtle: enemyTemplate({ id: "magmaTurtle", name: "マグマタートル", species: "reptile", region: "volcano", rarity: "elite", hp: 1680, attack: 160, defense: 125, speed: 16, intelligence: 30, luck: 19, exp: 420, gold: 350 }),
  volkazard: enemyTemplate({ id: "volkazard", name: "炎獄竜 ヴォルカザード", species: "boss", region: "volcano", rarity: "fieldBoss", hp: 4200, attack: 238, defense: 150, speed: 40, intelligence: 62, luck: 30, exp: 5200, gold: 4300, aiType: "boss" }),

  skygearDrone: enemyTemplate({ id: "skygearDrone", name: "スカイギア・ドローン", species: "machine", region: "neverend", hp: 2100, attack: 420, defense: 360, speed: 108, intelligence: 82, luck: 35, exp: 2300, gold: 2600 }),
  autoTurret: enemyTemplate({ id: "autoTurret", name: "オートタレット", species: "machine", region: "neverend", hp: 2400, attack: 520, defense: 440, speed: 52, intelligence: 88, luck: 30, exp: 2700, gold: 3000 }),
  metalHound: enemyTemplate({ id: "metalHound", name: "メタルハウンド", species: "machine", region: "neverend", hp: 2200, attack: 480, defense: 390, speed: 116, intelligence: 78, luck: 34, exp: 2450, gold: 2800 }),
  bladeWorker: enemyTemplate({ id: "bladeWorker", name: "ブレードワーカー", species: "machine", region: "neverend", hp: 2000, attack: 560, defense: 370, speed: 122, intelligence: 84, luck: 36, exp: 2500, gold: 2920 }),
  repairUnit: enemyTemplate({ id: "repairUnit", name: "リペアユニット", species: "machine", region: "neverend", hp: 1900, attack: 300, defense: 420, speed: 95, intelligence: 120, luck: 32, exp: 2400, gold: 2850 }),
  heavyFrame: enemyTemplate({ id: "heavyFrame", name: "ヘヴィフレーム", species: "machine", region: "neverend", rarity: "elite", hp: 2900, attack: 620, defense: 560, speed: 48, intelligence: 92, luck: 28, exp: 3200, gold: 3900 }),
  plasmaCore: enemyTemplate({ id: "plasmaCore", name: "プラズマコア", species: "machine", region: "neverend", hp: 1700, attack: 660, defense: 340, speed: 102, intelligence: 132, luck: 40, exp: 3150, gold: 3600 }),
  dataEater: enemyTemplate({ id: "dataEater", name: "データイーター", species: "machine", region: "neverend", hp: 1850, attack: 520, defense: 360, speed: 98, intelligence: 126, luck: 44, exp: 3000, gold: 3420 }),

  guardianArm: enemyTemplate({ id: "guardianArm", name: "ガーディアン・アーム", species: "machine", region: "neverend", rarity: "elite", hp: 3200, attack: 680, defense: 590, speed: 62, intelligence: 96, luck: 32, exp: 3800, gold: 4300 }),
  hollowEnforcer: enemyTemplate({ id: "hollowEnforcer", name: "ホロウ・エンフォーサー", species: "machine", region: "neverend", rarity: "elite", hp: 2700, attack: 720, defense: 500, speed: 84, intelligence: 110, luck: 36, exp: 4000, gold: 4450 }),
  signalCore: enemyTemplate({ id: "signalCore", name: "シグナル・コア", species: "machine", region: "neverend", rarity: "elite", hp: 2500, attack: 760, defense: 480, speed: 90, intelligence: 136, luck: 42, exp: 4100, gold: 4600 }),
  overloadFrame: enemyTemplate({ id: "overloadFrame", name: "オーバーロード・フレーム", species: "machine", region: "neverend", rarity: "elite", hp: 3800, attack: 820, defense: 660, speed: 72, intelligence: 120, luck: 40, exp: 6200, gold: 7000, aiType: "boss" }),
  protocol3: enemyTemplate({ id: "protocol3", name: "Protocol3", species: "machineBoss", region: "neverend", rarity: "fieldBoss", hp: 9800, attack: 980, defense: 900, speed: 128, intelligence: 156, luck: 54, exp: 22000, gold: 26000, aiType: "boss" }),

  riftGnawer: enemyTemplate({ id: "riftGnawer", name: "歪み喰らい", species: "otherworld", region: "otherworld", hp: 6200, attack: 1180, defense: 760, speed: 132, intelligence: 150, luck: 62, exp: 18000, gold: 15000 }),
  hollowWalker: enemyTemplate({ id: "hollowWalker", name: "虚ろ歩き", species: "otherworld", region: "otherworld", hp: 7000, attack: 1120, defense: 860, speed: 120, intelligence: 142, luck: 60, exp: 19000, gold: 16000 }),
  fragmentBeast: enemyTemplate({ id: "fragmentBeast", name: "断章獣", species: "otherworld", region: "otherworld", hp: 7600, attack: 1260, defense: 900, speed: 116, intelligence: 138, luck: 58, exp: 20500, gold: 17000 }),
  abyssHand: enemyTemplate({ id: "abyssHand", name: "深淵の手", species: "otherworld", region: "otherworld", hp: 6400, attack: 1320, defense: 780, speed: 136, intelligence: 165, luck: 66, exp: 21000, gold: 17500 }),
  facelessPredator: enemyTemplate({ id: "facelessPredator", name: "無貌の捕食者", species: "otherworld", region: "otherworld", hp: 8100, attack: 1360, defense: 940, speed: 128, intelligence: 156, luck: 68, exp: 22800, gold: 18800 }),
  collapseEye: enemyTemplate({ id: "collapseEye", name: "崩界の眼", species: "otherworld", region: "otherworld", hp: 5800, attack: 1480, defense: 740, speed: 142, intelligence: 172, luck: 70, exp: 23000, gold: 19000 }),
  lifelineReaper: enemyTemplate({ id: "lifelineReaper", name: "命脈断ち", species: "otherworld", region: "otherworld", hp: 7200, attack: 1420, defense: 880, speed: 138, intelligence: 168, luck: 72, exp: 24000, gold: 20000 }),

  awakenedBehemothBison: enemyTemplate({ id: "awakenedBehemothBison", name: "覚醒ベヒモスバイソン", species: "otherworldBoss", region: "otherworld", rarity: "boss", hp: 22000, attack: 1650, defense: 1220, speed: 136, intelligence: 180, luck: 78, exp: 52000, gold: 42000, aiType: "boss" }),
  awakenedDuneHydra: enemyTemplate({ id: "awakenedDuneHydra", name: "覚醒デューンヒドラ", species: "otherworldBoss", region: "otherworld", rarity: "boss", hp: 26000, attack: 1780, defense: 1320, speed: 144, intelligence: 188, luck: 82, exp: 56000, gold: 45000, aiType: "boss" }),
  awakenedLeviathan: enemyTemplate({ id: "awakenedLeviathan", name: "覚醒リヴァイアサン", species: "otherworldBoss", region: "otherworld", rarity: "boss", hp: 30000, attack: 1940, defense: 1420, speed: 152, intelligence: 202, luck: 86, exp: 62000, gold: 50000, aiType: "boss" }),
  awakenedVolkazard: enemyTemplate({ id: "awakenedVolkazard", name: "覚醒ヴォルカザード", species: "otherworldBoss", region: "otherworld", rarity: "boss", hp: 34000, attack: 2100, defense: 1560, speed: 160, intelligence: 214, luck: 90, exp: 68000, gold: 56000, aiType: "boss" }),
  awakenedProtocol3: enemyTemplate({ id: "awakenedProtocol3", name: "覚醒Protocol3", species: "otherworldBoss", region: "otherworld", rarity: "boss", hp: 36000, attack: 2280, defense: 1680, speed: 172, intelligence: 228, luck: 94, exp: 76000, gold: 64000, aiType: "boss" }),
  otherworldKing: enemyTemplate({ id: "otherworldKing", name: "異界の王", species: "otherworldKing", region: "otherworld", rarity: "fieldBoss", hp: 88000, attack: 3300, defense: 2400, speed: 208, intelligence: 280, luck: 120, exp: 180000, gold: 120000, aiType: "boss" }),

  behemothBisonReborn: enemyTemplate({ id: "behemothBisonReborn", name: "ベヒモスバイソン・再臨", species: "boss", region: "grassland", rarity: "loopBoss", hp: 1600, attack: 118, defense: 74, speed: 28, intelligence: 22, luck: 18, exp: 2200, gold: 1800, aiType: "boss" }),
  duneHydraAbyss: enemyTemplate({ id: "duneHydraAbyss", name: "デューンヒドラ・深層種", species: "boss", region: "desert", rarity: "loopBoss", hp: 3200, attack: 186, defense: 118, speed: 34, intelligence: 46, luck: 24, exp: 4800, gold: 3900, aiType: "boss" }),
  leviathanOvertide: enemyTemplate({ id: "leviathanOvertide", name: "リヴァイアサン・暴走潮王", species: "boss", region: "sea", rarity: "loopBoss", hp: 6200, attack: 318, defense: 200, speed: 42, intelligence: 72, luck: 32, exp: 8800, gold: 7300, aiType: "boss" }),
  volkazardInferno: enemyTemplate({ id: "volkazardInferno", name: "ヴォルカザード・獄炎形態", species: "boss", region: "volcano", rarity: "loopBoss", hp: 9800, attack: 460, defense: 300, speed: 56, intelligence: 88, luck: 40, exp: 14000, gold: 12000, aiType: "boss" }),

  watcher_of_time: enemyTemplate({ id: "watcher_of_time", name: "時界の監視者", species: "finalBoss", region: "final", rarity: "finalBoss", hp: 14000, attack: 620, defense: 380, speed: 65, intelligence: 120, luck: 48, exp: 25000, gold: 22000, aiType: "boss" }),
  beast_of_fragment: enemyTemplate({ id: "beast_of_fragment", name: "断章の獣", species: "finalBoss", region: "final", rarity: "finalBoss", hp: 16800, attack: 690, defense: 430, speed: 60, intelligence: 130, luck: 52, exp: 30000, gold: 26000, aiType: "boss" }),
  anomaly_converger: enemyTemplate({ id: "anomaly_converger", name: "想定外収束体", species: "finalBoss", region: "final", rarity: "finalBoss", hp: 19000, attack: 760, defense: 470, speed: 70, intelligence: 138, luck: 56, exp: 36000, gold: 32000, aiType: "boss" }),
  myth_eater: enemyTemplate({ id: "myth_eater", name: "神話喰らい", species: "finalBoss", region: "final", rarity: "finalBoss", hp: 22000, attack: 840, defense: 520, speed: 74, intelligence: 150, luck: 60, exp: 42000, gold: 38000, aiType: "boss" }),
  inverted_record: enemyTemplate({ id: "inverted_record", name: "反転した自分自身の記録", species: "finalBoss", region: "final", rarity: "finalBoss", hp: 24500, attack: 900, defense: 580, speed: 78, intelligence: 160, luck: 65, exp: 50000, gold: 45000, aiType: "boss" })
};

const UNIQUE_ENEMY_DATA = {
  fenrir: enemyTemplate({ id: "fenrir", name: "フェンリル", species: "unique", region: "all", rarity: "unique", hp: 2800, attack: 210, defense: 120, speed: 52, intelligence: 40, luck: 26, exp: 3800, gold: 3200, aiType: "unique" }),
  jormungand: enemyTemplate({ id: "jormungand", name: "ヨルムンガンド", species: "unique", region: "all", rarity: "unique", hp: 3200, attack: 225, defense: 145, speed: 30, intelligence: 55, luck: 28, exp: 4200, gold: 3600, aiType: "unique" }),
  cerberus: enemyTemplate({ id: "cerberus", name: "ケルベロス", species: "unique", region: "all", rarity: "unique", hp: 3000, attack: 240, defense: 135, speed: 38, intelligence: 42, luck: 30, exp: 4300, gold: 3700, aiType: "unique" }),
  griffon: enemyTemplate({ id: "griffon", name: "グリフォン", species: "unique", region: "all", rarity: "unique", hp: 2900, attack: 205, defense: 128, speed: 50, intelligence: 44, luck: 32, exp: 4000, gold: 3500, aiType: "unique" }),
  minotauros: enemyTemplate({ id: "minotauros", name: "ミノタウロス", species: "unique", region: "all", rarity: "unique", hp: 3400, attack: 255, defense: 160, speed: 24, intelligence: 35, luck: 27, exp: 4500, gold: 3900, aiType: "unique" }),
  phoenix: enemyTemplate({ id: "phoenix", name: "鳳凰", species: "unique", region: "all", rarity: "unique", hp: 3100, attack: 220, defense: 132, speed: 48, intelligence: 62, luck: 35, exp: 4600, gold: 4000, aiType: "unique" }),
  kirin: enemyTemplate({ id: "kirin", name: "麒麟", species: "unique", region: "all", rarity: "unique", hp: 3300, attack: 232, defense: 140, speed: 44, intelligence: 58, luck: 34, exp: 4700, gold: 4100, aiType: "unique" })
};

function buildStageData() {
  const stages = {};
  Object.values(MAP_DATA).forEach((map) => {
    for (let i = 1; i <= 10; i += 1) {
      const stageId = `${map.mapIndex}-${i}`;
      const lvMin = Number(map.recommendedLevel.split("-")[0]);
      const lvMax = Number(map.recommendedLevel.split("-")[1]);
      const recommended = Math.floor(lvMin + ((lvMax - lvMin) * (i - 1)) / 9);
      const isOtherworld = map.id === "otherworld";
      const stageBossEnemyId = isOtherworld ? OTHERWORLD_STAGE_BOSS_DATA[stageId] || null : null;
      const targetKills = isOtherworld ? (i === 10 ? 1 : 6) : (i === 10 ? 1 : 10);
      stages[stageId] = {
        id: stageId,
        mapId: map.id,
        mapName: map.name,
        stageNo: i,
        recommendedLevel: recommended,
        normalEnemyPool: map.normalEnemyPool,
        bossEnemy: isOtherworld ? stageBossEnemyId : (i >= 8 ? map.normalEnemyPool[map.normalEnemyPool.length - 1] : null),
        fieldBoss: i === 10 ? (isOtherworld ? stageBossEnemyId : map.fieldBoss) : null,
        isFieldBossStage: i === 10,
        targetKills,
        hasStageBoss: isOtherworld && i < 10,
        stageBossEnemyId,
        disableUniqueEncounter: isOtherworld
      };
    }
  });
  return stages;
}

const STAGE_DATA = buildStageData();

const LOOP_FEATURE_DEFS = [
  { id: "loop_quests", name: "周回限定依頼", requiredLoop: 1, description: "周回勢向けの高報酬依頼を解放" },
  { id: "loop_challenge_basic", name: "再挑戦カテゴリ", requiredLoop: 1, description: "追憶・再臨カテゴリへ挑戦可能" },
  { id: "enhanced_boss", name: "強化版ボス挑戦", requiredLoop: 2, description: "再臨ボスへの挑戦が可能" },
  { id: "high_difficulty_map", name: "高難易度マップ", requiredLoop: 2, description: "深層・歪みマップの土台解放" },
  { id: "anomaly_trials", name: "異常ビルド試練", requiredLoop: 3, description: "想定外ビルド向け挑戦が解放" },
  { id: "endless_arc_seed", name: "終盤周回導線", requiredLoop: 4, description: "真エンド/裏要素の前提フラグを解放" }
];

const LOOP_CHALLENGE_DATA = [
  {
    id: "memory_grassland",
    stageId: "LC-1",
    name: "追憶の草原",
    category: "再戦",
    mapId: "grassland",
    bossId: "behemothBisonReborn",
    requiredLoop: 1,
    requiredFieldBossStage: "1-10",
    rewards: { exp: 1800, gold: 1400, specialItemId: "rebirthSeal", specialFlag: "memory_grassland_clear" },
    gimmickScale: 1.15
  },
  {
    id: "collapse_desert",
    stageId: "LC-2",
    name: "崩壊砂界",
    category: "高難易度",
    mapId: "desert",
    bossId: "duneHydraAbyss",
    requiredLoop: 2,
    requiredFieldBossStage: "2-10",
    rewards: { exp: 3200, gold: 2600, specialItemId: "deepShard", specialFlag: "collapse_desert_clear" },
    gimmickScale: 1.22
  },
  {
    id: "deep_sea",
    stageId: "LC-3",
    name: "深層海域",
    category: "深層",
    mapId: "sea",
    bossId: "leviathanOvertide",
    requiredLoop: 2,
    requiredFieldBossStage: "3-10",
    rewards: { exp: 5200, gold: 4300, specialItemId: "mythFragment", specialFlag: "deep_sea_clear" },
    gimmickScale: 1.3
  },
  {
    id: "inferno_return",
    stageId: "LC-4",
    name: "灼熱再臨火山",
    category: "再臨",
    mapId: "volcano",
    bossId: "volkazardInferno",
    requiredLoop: 3,
    requiredFieldBossStage: "4-10",
    rewards: { exp: 9000, gold: 7600, specialItemId: "warpedCore", specialFlag: "inferno_return_clear" },
    gimmickScale: 1.4
  }
];

const ENDING_TYPES = ["normal_end", "true_end", "hidden_end", "chaos_end", "broken_world_end", "unfinished_end"];

const FINAL_CONTENT_DATA = [
  { id: "deepest_memory", stageId: "FC-1", name: "深層の最奥", category: "final", required: { trueEndEligible: true }, bossId: "watcher_of_time", endingType: "true_end" },
  { id: "myth_remnant", stageId: "FC-2", name: "神話の残滓", category: "final", required: { trueEndEligible: true, loopAtLeast: 3 }, bossId: "myth_eater", endingType: "true_end" },
  { id: "outside_archive", stageId: "FC-3", name: "運営記録外領域", category: "final", required: { hiddenEndEligible: true }, bossId: "anomaly_converger", endingType: "hidden_end" },
  { id: "rift_of_time", stageId: "FC-4", name: "時の狭間", category: "final", required: { chaosEndEligible: true }, bossId: "beast_of_fragment", endingType: "chaos_end" },
  { id: "broken_loop_core", stageId: "FC-5", name: "崩壊した周回領域", category: "final", required: { chaosEndEligible: true, loopAtLeast: 4 }, bossId: "inverted_record", endingType: "broken_world_end" }
];

const FINAL_BOSS_DATA = [
  {
    id: "watcher_of_time",
    name: "時界の監視者",
    unlockCondition: { finalContentId: "deepest_memory" },
    gimmickProfile: { phaseCount: 2, notes: "予兆短縮・速度干渉" },
    clearRewardFlags: ["final_watcher_clear"],
    relatedEndingType: "true_end"
  },
  {
    id: "myth_eater",
    name: "神話喰らい",
    unlockCondition: { finalContentId: "myth_remnant" },
    gimmickProfile: { phaseCount: 3, notes: "高威力連打・耐久チェック" },
    clearRewardFlags: ["final_myth_clear"],
    relatedEndingType: "true_end"
  },
  {
    id: "anomaly_converger",
    name: "想定外収束体",
    unlockCondition: { finalContentId: "outside_archive" },
    gimmickProfile: { phaseCount: 3, notes: "ビルド反転・被補正阻害" },
    clearRewardFlags: ["final_anomaly_clear"],
    relatedEndingType: "hidden_end"
  },
  {
    id: "beast_of_fragment",
    name: "断章の獣",
    unlockCondition: { finalContentId: "rift_of_time" },
    gimmickProfile: { phaseCount: 3, notes: "時間断章・周期即死圧" },
    clearRewardFlags: ["final_fragment_clear"],
    relatedEndingType: "chaos_end"
  },
  {
    id: "inverted_record",
    name: "反転した自分自身の記録",
    unlockCondition: { finalContentId: "broken_loop_core" },
    gimmickProfile: { phaseCount: 4, notes: "自己記録模倣・超高難易度" },
    clearRewardFlags: ["final_inverted_clear"],
    relatedEndingType: "broken_world_end"
  }
];

function buildLoopChallengeStages() {
  const rows = {};
  LOOP_CHALLENGE_DATA.forEach((challenge, idx) => {
    const map = MAP_DATA[challenge.mapId];
    rows[challenge.stageId] = {
      id: challenge.stageId,
      mapId: challenge.mapId,
      mapName: `${map.name} / ${challenge.category}`,
      stageNo: 90 + idx,
      recommendedLevel: Number(map.recommendedLevel.split("-")[1]) + challenge.requiredLoop * 20,
      normalEnemyPool: [],
      bossEnemy: challenge.bossId,
      fieldBoss: challenge.bossId,
      isFieldBossStage: true,
      targetKills: 1,
      loopChallengeId: challenge.id,
      bossGimmick: map.bossGimmick
        ? {
            ...map.bossGimmick,
            damageRate: map.bossGimmick.damageRate ? map.bossGimmick.damageRate * challenge.gimmickScale : map.bossGimmick.damageRate,
            attackBoost: map.bossGimmick.attackBoost ? map.bossGimmick.attackBoost * (1 + (challenge.gimmickScale - 1) * 0.5) : map.bossGimmick.attackBoost
          }
        : null
    };
  });
  return rows;
}

Object.assign(STAGE_DATA, buildLoopChallengeStages());

function buildFinalStages() {
  const rows = {};
  FINAL_CONTENT_DATA.forEach((content, idx) => {
    rows[content.stageId] = {
      id: content.stageId,
      mapId: "final",
      mapName: content.name,
      stageNo: 200 + idx,
      recommendedLevel: 220 + idx * 20,
      normalEnemyPool: [],
      bossEnemy: content.bossId,
      fieldBoss: content.bossId,
      isFieldBossStage: true,
      targetKills: 1,
      finalContentId: content.id,
      finalBossId: content.bossId,
      bossGimmick: {
        type: "periodicBurst",
        triggerSec: Math.max(4, 8 - Math.min(3, idx)),
        warning: `${FINAL_BOSS_DATA.find((b) => b.id === content.bossId)?.name || "最終ボス"} が異常波動を溜めている!`,
        damageRate: 0.3 + idx * 0.05,
        hint: "防御バフと短期決戦の両立が必要"
      }
    };
  });
  return rows;
}

Object.assign(STAGE_DATA, buildFinalStages());

const QUEST_DATA = [
  { id: "quest_slime_5", name: "スライム討伐", description: "スライムを5体倒す", reward: { gold: 80, guildPoints: 35 }, checker: () => (state.stats.enemyKillCounts.slime || 0) >= 5 },
  { id: "quest_wolf_3", name: "狼の駆除", description: "グラスウルフを3体倒す", reward: { gold: 120, guildPoints: 45 }, checker: () => (state.stats.enemyKillCounts.grassWolf || 0) >= 3 },
  { id: "quest_win_3", name: "連戦訓練", description: "戦闘で3回勝利する", reward: { gold: 90, guildPoints: 30 }, checker: () => state.stats.totalWins >= 3 }
];

const GUILD_QUEST_BOARD_SIZE = 8;
const GUILD_RANK_ORDER = ["D", "C", "B", "A", "S"];
const GUILD_REGION_RANK_CAP = {
  grassland: "C",
  desert: "B",
  sea: "A",
  volcano: "S",
  neverend: "S",
  otherworld: "S"
};
const GUILD_RANK_TITLE_SLOT_BONUS = {
  D: { normal: 0, cheat: 0 },
  C: { normal: 1, cheat: 0 },
  B: { normal: 2, cheat: 1 },
  A: { normal: 3, cheat: 1 },
  S: { normal: 3, cheat: 2 }
};
const GUILD_QUEST_RANK_MAP_WEIGHTS = {
  D: { grassland: 1.0, desert: 0, sea: 0, volcano: 0, neverend: 0, otherworld: 0 },
  C: { grassland: 0.45, desert: 0.55, sea: 0, volcano: 0, neverend: 0, otherworld: 0 },
  B: { grassland: 0.2, desert: 0.45, sea: 0.35, volcano: 0, neverend: 0, otherworld: 0 },
  A: { grassland: 0.1, desert: 0.25, sea: 0.4, volcano: 0.25, neverend: 0, otherworld: 0 },
  S: { grassland: 0.04, desert: 0.16, sea: 0.24, volcano: 0.36, neverend: 0.14, otherworld: 0.06 }
};

const GUILD_QUEST_TEMPLATE_DATA = [
  { templateId: "grass_slime_hunt", familyId: "grass_slime_hunt", rankMin: "D", rankMax: "C", mapId: "grassland", templateType: "kill_enemy", targetId: "slime", baseCount: 5, countStep: 5, baseGold: 80, goldStep: 25, baseGp: 10, gpStep: 3, baseName: "草原の掃除", descriptionTemplate: "スライムを{count}体討伐" },
  { templateId: "grass_wolf_hunt", familyId: "grass_wolf_hunt", rankMin: "D", rankMax: "C", mapId: "grassland", templateType: "kill_enemy", targetId: "grassWolf", baseCount: 3, countStep: 3, baseGold: 100, goldStep: 28, baseGp: 12, gpStep: 3, baseName: "狼の追い払い", descriptionTemplate: "グラスウルフを{count}体討伐" },
  { templateId: "grass_rabbit_hunt", familyId: "grass_rabbit_hunt", rankMin: "D", rankMax: "C", mapId: "grassland", templateType: "kill_enemy", targetId: "hornRabbit", baseCount: 4, countStep: 4, baseGold: 90, goldStep: 24, baseGp: 11, gpStep: 3, baseName: "角ウサギ注意報", descriptionTemplate: "ホーンラビットを{count}体討伐" },
  { templateId: "grass_bee_hunt", familyId: "grass_bee_hunt", rankMin: "D", rankMax: "C", mapId: "grassland", templateType: "kill_enemy", targetId: "greenBee", baseCount: 2, countStep: 2, baseGold: 120, goldStep: 30, baseGp: 16, gpStep: 4, baseName: "毒蜂の駆除", descriptionTemplate: "グリーンビーを{count}体討伐" },
  { templateId: "grass_region_total", familyId: "grass_region_total", rankMin: "D", rankMax: "B", mapId: "grassland", templateType: "kill_region_total", regionId: "grassland", baseCount: 10, countStep: 10, baseGold: 130, goldStep: 34, baseGp: 15, gpStep: 4, baseName: "草原巡回任務", descriptionTemplate: "草原の敵を合計{count}体討伐" },
  { templateId: "grass_herb_gather", familyId: "grass_herb_gather", rankMin: "D", rankMax: "C", mapId: "grassland", templateType: "gather_material", targetId: "herb", baseCount: 5, countStep: 3, baseGold: 70, goldStep: 20, baseGp: 8, gpStep: 2, baseName: "初歩の採取支援", descriptionTemplate: "薬草を{count}個集める" },

  { templateId: "desert_worm_hunt", familyId: "desert_worm_hunt", rankMin: "C", rankMax: "B", mapId: "desert", templateType: "kill_enemy", targetId: "sandWorm", baseCount: 4, countStep: 4, baseGold: 180, goldStep: 48, baseGp: 22, gpStep: 5, baseName: "砂中の脅威", descriptionTemplate: "サンドワームを{count}体討伐" },
  { templateId: "desert_scorp_hunt", familyId: "desert_scorp_hunt", rankMin: "C", rankMax: "B", mapId: "desert", templateType: "kill_enemy", targetId: "desertScorpion", baseCount: 5, countStep: 3, baseGold: 190, goldStep: 50, baseGp: 24, gpStep: 5, baseName: "毒針駆除依頼", descriptionTemplate: "デザートスコーピオンを{count}体討伐" },
  { templateId: "desert_lizard_hunt", familyId: "desert_lizard_hunt", rankMin: "C", rankMax: "B", mapId: "desert", templateType: "kill_enemy", targetId: "dustLizard", baseCount: 5, countStep: 3, baseGold: 200, goldStep: 52, baseGp: 24, gpStep: 5, baseName: "砂影追跡", descriptionTemplate: "ダストリザードを{count}体討伐" },
  { templateId: "desert_mummy_hunt", familyId: "desert_mummy_hunt", rankMin: "C", rankMax: "B", mapId: "desert", templateType: "kill_enemy", targetId: "mummyFighter", baseCount: 3, countStep: 3, baseGold: 220, goldStep: 55, baseGp: 26, gpStep: 6, baseName: "遺跡前哨任務", descriptionTemplate: "ミイラファイターを{count}体討伐" },
  { templateId: "desert_bandit_hunt", familyId: "desert_bandit_hunt", rankMin: "C", rankMax: "B", mapId: "desert", templateType: "kill_enemy", targetId: "camelBandit", baseCount: 4, countStep: 3, baseGold: 230, goldStep: 58, baseGp: 27, gpStep: 6, baseName: "盗賊駆除協力", descriptionTemplate: "キャメルバンディットを{count}体討伐" },
  { templateId: "desert_region_total", familyId: "desert_region_total", rankMin: "C", rankMax: "B", mapId: "desert", templateType: "kill_region_total", regionId: "desert", baseCount: 15, countStep: 10, baseGold: 240, goldStep: 62, baseGp: 28, gpStep: 7, baseName: "砂漠巡回任務", descriptionTemplate: "砂漠の敵を合計{count}体討伐" },
  { templateId: "desert_heavy_mix", familyId: "desert_heavy_mix", rankMin: "B", rankMax: "A", mapId: "desert", templateType: "kill_enemy_mix", mixTargets: [{ targetId: "sandGolem", count: 2 }, { targetId: "wormDevourer", count: 1 }], mixStep: 1, baseGold: 420, goldStep: 95, baseGp: 50, gpStep: 10, baseName: "砂漠の強敵討伐", descriptionTemplate: "サンドゴーレム{countA}体、ワームデバウア{countB}体討伐" },

  { templateId: "sea_serpent_hunt", familyId: "sea_serpent_hunt", rankMin: "A", rankMax: "S", mapId: "sea", templateType: "kill_enemy", targetId: "seaSerpent", baseCount: 6, countStep: 4, baseGold: 480, goldStep: 110, baseGp: 55, gpStep: 10, baseName: "潮騒の蛇討伐", descriptionTemplate: "シーサーペントを{count}体討伐" },
  { templateId: "sea_crab_hunt", familyId: "sea_crab_hunt", rankMin: "A", rankMax: "S", mapId: "sea", templateType: "kill_enemy", targetId: "blueCrab", baseCount: 6, countStep: 4, baseGold: 500, goldStep: 112, baseGp: 58, gpStep: 10, baseName: "海岸防衛", descriptionTemplate: "ブルークラブを{count}体討伐" },
  { templateId: "sea_jelly_hunt", familyId: "sea_jelly_hunt", rankMin: "A", rankMax: "S", mapId: "sea", templateType: "kill_enemy", targetId: "deepJelly", baseCount: 5, countStep: 3, baseGold: 520, goldStep: 116, baseGp: 60, gpStep: 10, baseName: "深海電流注意報", descriptionTemplate: "ディープジェリーを{count}体討伐" },
  { templateId: "sea_harpy_hunt", familyId: "sea_harpy_hunt", rankMin: "A", rankMax: "S", mapId: "sea", templateType: "kill_enemy", targetId: "marineHarpy", baseCount: 5, countStep: 3, baseGold: 510, goldStep: 114, baseGp: 59, gpStep: 10, baseName: "空海の厄介者", descriptionTemplate: "マリンハーピーを{count}体討伐" },
  { templateId: "sea_region_total", familyId: "sea_region_total", rankMin: "A", rankMax: "S", mapId: "sea", templateType: "kill_region_total", regionId: "sea", baseCount: 35, countStep: 15, baseGold: 560, goldStep: 125, baseGp: 65, gpStep: 12, baseName: "海域制圧依頼", descriptionTemplate: "海の敵を合計{count}体討伐" },
  { templateId: "sea_knight_hunt", familyId: "sea_knight_hunt", rankMin: "A", rankMax: "S", mapId: "sea", templateType: "kill_enemy", targetId: "tidalKnight", baseCount: 2, countStep: 2, baseGold: 620, goldStep: 142, baseGp: 72, gpStep: 14, baseName: "遺跡騎士への挑戦", descriptionTemplate: "タイダルナイトを{count}体討伐" },

  { templateId: "vol_flame_magma_mix", familyId: "vol_flame_magma_mix", rankMin: "S", rankMax: "S", mapId: "volcano", templateType: "kill_enemy_mix", mixTargets: [{ targetId: "flameBat", count: 8 }, { targetId: "magmaLizard", count: 8 }], mixStep: 2, baseGold: 800, goldStep: 190, baseGp: 90, gpStep: 16, baseName: "灼熱掃討任務", descriptionTemplate: "フレイムバット{countA}体、マグマリザード{countB}体討伐" },
  { templateId: "vol_golem_hunt", familyId: "vol_golem_hunt", rankMin: "S", rankMax: "S", mapId: "volcano", templateType: "kill_enemy", targetId: "ignisGolem", baseCount: 4, countStep: 2, baseGold: 900, goldStep: 210, baseGp: 100, gpStep: 18, baseName: "溶岩地帯の巨兵", descriptionTemplate: "イグニスゴーレムを{count}体討伐" },
  { templateId: "vol_elemental_hunt", familyId: "vol_elemental_hunt", rankMin: "S", rankMax: "S", mapId: "volcano", templateType: "kill_enemy", targetId: "fireElemental", baseCount: 5, countStep: 2, baseGold: 880, goldStep: 205, baseGp: 98, gpStep: 18, baseName: "炎霊鎮圧依頼", descriptionTemplate: "ファイアエレメンタルを{count}体討伐" },
  { templateId: "vol_region_total", familyId: "vol_region_total", rankMin: "S", rankMax: "S", mapId: "volcano", templateType: "kill_region_total", regionId: "volcano", baseCount: 50, countStep: 20, baseGold: 950, goldStep: 225, baseGp: 110, gpStep: 20, baseName: "火山前線維持", descriptionTemplate: "火山の敵を合計{count}体討伐" },
  { templateId: "vol_turtle_hunt", familyId: "vol_turtle_hunt", rankMin: "S", rankMax: "S", mapId: "volcano", templateType: "kill_enemy", targetId: "magmaTurtle", baseCount: 2, countStep: 1, baseGold: 1100, goldStep: 240, baseGp: 125, gpStep: 22, baseName: "溶岩甲羅破壊任務", descriptionTemplate: "マグマタートルを{count}体討伐" },

  { templateId: "boss_grass_special", familyId: "boss_grass_special", rankMin: "A", rankMax: "S", mapId: "grassland", templateType: "kill_boss", targetId: "behemothBison", baseCount: 1, countStep: 0, baseGold: 1500, goldStep: 420, baseGp: 150, gpStep: 28, baseName: "草原討伐特務", descriptionTemplate: "ベヒモスバイソンを1体討伐" },
  { templateId: "boss_desert_special", familyId: "boss_desert_special", rankMin: "A", rankMax: "S", mapId: "desert", templateType: "kill_boss", targetId: "duneHydra", baseCount: 1, countStep: 0, baseGold: 2500, goldStep: 560, baseGp: 220, gpStep: 34, baseName: "砂海制圧特務", descriptionTemplate: "デューンヒドラを1体討伐" },
  { templateId: "boss_sea_special", familyId: "boss_sea_special", rankMin: "S", rankMax: "S", mapId: "sea", templateType: "kill_boss", targetId: "leviathan", baseCount: 1, countStep: 0, baseGold: 4000, goldStep: 800, baseGp: 300, gpStep: 40, baseName: "蒼海掃滅特務", descriptionTemplate: "リヴァイアサンを1体討伐" },
  { templateId: "boss_volcano_special", familyId: "boss_volcano_special", rankMin: "S", rankMax: "S", mapId: "volcano", templateType: "kill_boss", targetId: "volkazard", baseCount: 1, countStep: 0, baseGold: 6000, goldStep: 1100, baseGp: 420, gpStep: 55, baseName: "炎獄鎮圧特務", descriptionTemplate: "ヴォルカザードを1体討伐" },

  { templateId: "global_win_battles", familyId: "global_win_battles", rankMin: "C", rankMax: "S", mapId: "all", templateType: "win_battles", baseCount: 6, countStep: 4, baseGold: 210, goldStep: 60, baseGp: 20, gpStep: 6, baseName: "連戦支援任務", descriptionTemplate: "戦闘に{count}回勝利する" },
  { templateId: "global_craft_times", familyId: "global_craft_times", rankMin: "B", rankMax: "S", mapId: "all", templateType: "craft_times", baseCount: 5, countStep: 4, baseGold: 260, goldStep: 70, baseGp: 24, gpStep: 7, baseName: "工房連携任務", descriptionTemplate: "工房で{count}回生産する" }
];

function guildRankScore(rank) {
  return Math.max(0, GUILD_RANK_ORDER.indexOf(rank || "D"));
}

function normalizeGuildRank(rank) {
  return GUILD_RANK_ORDER.includes(rank) ? rank : "D";
}

function getGuildRankRequirement(rank) {
  return Number(GUILD_RANK_THRESHOLDS.find((row) => row.rank === rank)?.required || 0);
}

function getNextGuildRank(rank) {
  const idx = guildRankScore(rank);
  if (idx >= GUILD_RANK_ORDER.length - 1) {
    return null;
  }
  return GUILD_RANK_ORDER[idx + 1] || null;
}

function getCurrentGuildRegionId() {
  return state.currentMap || TOWN_DATA[state.currentTown]?.mapId || "grassland";
}

function getMaxGuildRankByRegion(regionId = getCurrentGuildRegionId()) {
  return normalizeGuildRank(GUILD_REGION_RANK_CAP[regionId] || "D");
}

function getMaxGuildRankByProgress() {
  const unlockedMaps = getUnlockedGuildMaps();
  let cap = "D";
  unlockedMaps.forEach((mapId) => {
    const rowCap = getMaxGuildRankByRegion(mapId);
    if (guildRankScore(rowCap) > guildRankScore(cap)) {
      cap = rowCap;
    }
  });
  return cap;
}

function getGuildRankTitleSlotBonus(rank = state.guild.rank) {
  const row = GUILD_RANK_TITLE_SLOT_BONUS[normalizeGuildRank(rank)] || GUILD_RANK_TITLE_SLOT_BONUS.D;
  return {
    normal: Number(row.normal || 0),
    cheat: Number(row.cheat || 0)
  };
}

function syncGuildRankTitleSlotBonus(rank = state.guild.rank) {
  const bonus = getGuildRankTitleSlotBonus(rank);
  state.guild.guildRankNormalTitleSlotBonus = bonus.normal;
  state.guild.guildRankCheatTitleSlotBonus = bonus.cheat;
  return bonus;
}

function getRankUnlockRegionForRank(rank) {
  const target = normalizeGuildRank(rank);
  const found = Object.entries(GUILD_REGION_RANK_CAP).find(([, cap]) => guildRankScore(cap) >= guildRankScore(target));
  return found?.[0] || "volcano";
}

function getGuildRankDisplayInfo() {
  const rank = normalizeGuildRank(state.guild.rank);
  const points = Number(state.guild.points || 0);
  const currentRegion = getCurrentGuildRegionId();
  const currentRegionCap = getMaxGuildRankByRegion(currentRegion);
  const progressCap = getMaxGuildRankByProgress();
  const nextRank = getNextGuildRank(rank);
  const atHardCap = rank === "S";
  const nextRequiredPoints = nextRank ? getGuildRankRequirement(nextRank) : null;
  const pointsToNext = nextRequiredPoints == null ? 0 : Math.max(0, nextRequiredPoints - points);
  const blockedByRegion = !atHardCap && nextRank && guildRankScore(nextRank) > guildRankScore(progressCap);
  const unlockRegionId = blockedByRegion ? getRankUnlockRegionForRank(nextRank) : null;
  return {
    rank,
    points,
    currentRegion,
    currentRegionCap,
    progressCap,
    nextRank,
    nextRequiredPoints,
    pointsToNext,
    blockedByRegion,
    unlockRegionId
  };
}

function rankInRange(rank, minRank, maxRank) {
  const v = guildRankScore(rank);
  return v >= guildRankScore(minRank) && v <= guildRankScore(maxRank);
}

function formatQuestTierSuffix(repeatLevel) {
  const numerals = ["I", "II", "III", "IV", "V"];
  if (repeatLevel <= 0) return "";
  return repeatLevel < numerals.length ? numerals[repeatLevel] : `+${repeatLevel}`;
}

function getUnlockedGuildMaps() {
  const maps = Object.values(TOWN_DATA)
    .filter((town) => state.unlockedTowns.includes(town.id))
    .map((town) => town.mapId);
  return [...new Set(maps)];
}

function getRegionEnemyKillTotal(regionId) {
  return Object.entries(state.stats.enemyKillCounts || {}).reduce((acc, [enemyId, count]) => {
    const enemy = ENEMY_DATA[enemyId];
    if (enemy?.region === regionId) {
      return acc + (count || 0);
    }
    return acc;
  }, 0);
}

function createQuestProgressSnapshot(quest) {
  if (!quest) {
    return null;
  }
  if (quest.templateType === "kill_enemy" || quest.templateType === "kill_boss") {
    return { enemyKills: state.stats.enemyKillCounts?.[quest.targetId] || 0 };
  }
  if (quest.templateType === "kill_region_total") {
    return { regionKills: getRegionEnemyKillTotal(quest.regionId) };
  }
  if (quest.templateType === "win_battles") {
    return { totalWins: state.stats.totalWins || 0 };
  }
  if (quest.templateType === "gather_material") {
    return { gathered: state.stats.gatheredMaterialCounts?.[quest.targetId] || 0 };
  }
  if (quest.templateType === "craft_times") {
    return { totalCrafts: state.stats.totalCrafts || 0 };
  }
  if (quest.templateType === "kill_enemy_mix") {
    const mixKills = {};
    (quest.mixTargets || []).forEach((row) => {
      mixKills[row.targetId] = state.stats.enemyKillCounts?.[row.targetId] || 0;
    });
    return { mixKills };
  }
  return null;
}

function getQuestProgress(quest, options = {}) {
  if (!quest) {
    return { current: 0, target: 1 };
  }
  const accepted = options.accepted ?? state.guild.activeQuestIds.includes(quest.id);
  const baseline = quest.progressStart || null;
  if (!accepted && !options.includeLifetime) {
    if (quest.templateType === "kill_enemy_mix") {
      const target = (quest.mixTargets || []).reduce((acc, row) => acc + row.targetCount, 0);
      return { current: 0, target, rows: (quest.mixTargets || []).map((row) => ({ current: 0, target: row.targetCount })) };
    }
    return { current: 0, target: quest.targetCount || 1 };
  }
  if (quest.templateType === "kill_enemy" || quest.templateType === "kill_boss") {
    const total = state.stats.enemyKillCounts?.[quest.targetId] || 0;
    const start = baseline?.enemyKills || 0;
    return { current: Math.max(0, total - start), target: quest.targetCount };
  }
  if (quest.templateType === "kill_region_total") {
    const total = getRegionEnemyKillTotal(quest.regionId);
    const start = baseline?.regionKills || 0;
    return { current: Math.max(0, total - start), target: quest.targetCount };
  }
  if (quest.templateType === "win_battles") {
    const total = state.stats.totalWins || 0;
    const start = baseline?.totalWins || 0;
    return { current: Math.max(0, total - start), target: quest.targetCount };
  }
  if (quest.templateType === "gather_material") {
    const total = state.stats.gatheredMaterialCounts?.[quest.targetId] || 0;
    const start = baseline?.gathered || 0;
    return { current: Math.max(0, total - start), target: quest.targetCount };
  }
  if (quest.templateType === "craft_times") {
    const total = state.stats.totalCrafts || 0;
    const start = baseline?.totalCrafts || 0;
    return { current: Math.max(0, total - start), target: quest.targetCount };
  }
  if (quest.templateType === "kill_enemy_mix") {
    const rows = (quest.mixTargets || []).map((row) => ({
      current: Math.max(0, (state.stats.enemyKillCounts?.[row.targetId] || 0) - (baseline?.mixKills?.[row.targetId] || 0)),
      target: row.targetCount
    }));
    const current = rows.reduce((acc, row) => acc + Math.min(row.current, row.target), 0);
    const target = rows.reduce((acc, row) => acc + row.target, 0);
    return { current, target, rows };
  }
  return { current: 0, target: quest.targetCount || 1 };
}

const LOOP_QUEST_DATA = [
  { id: "lq_enhanced_2", name: "再臨兆候調査", description: "強化版ボスを2体撃破", reward: { gold: 1600, guildPoints: 180, itemId: "rebirthSeal" }, checker: () => (state.stats.enhancedBossKillCount || 0) >= 2, requiredLoop: 1 },
  { id: "lq_challenge_3", name: "深層踏破報告", description: "高難易度挑戦を3回クリア", reward: { gold: 2800, guildPoints: 260, itemId: "deepShard" }, checker: () => (state.stats.loopChallengeClearCount || 0) >= 3, requiredLoop: 2 },
  { id: "lq_anomaly", name: "異常構成検証", description: "想定外タグを4種以上達成", reward: { gold: 3600, guildPoints: 320, itemId: "outsideRecord" }, checker: () => evaluateExploitTags().length >= 4, requiredLoop: 3 }
];

const GUILD_RANK_THRESHOLDS = [
  { rank: "D", required: 0 },
  { rank: "C", required: 100 },
  { rank: "B", required: 300 },
  { rank: "A", required: 700 },
  { rank: "S", required: 1500 }
];

const WORKSHOP_RECIPES = {};

const PRODUCTION_JOB_PATHS = {
  apothecary: { type: "alchemy", stages: ["薬師", "錬金術師", "大錬金術師", "錬金王", "錬金神"] },
  blacksmith: { type: "smith", stages: ["鍛冶師", "鍛冶職人", "ベテラン鍛冶師", "鍛冶王", "鍛冶神"] },
  cook: { type: "cooking", stages: ["調理人", "シェフ", "スーシェフ", "グランシェフ", "マスターシェフ"] }
};

const PRODUCTION_STAGE_REQUIREMENTS = [
  { level: 1, crafts: 0 },
  { level: 20, crafts: 40 },
  { level: 45, crafts: 120 },
  { level: 75, crafts: 260 },
  { level: 100, crafts: 500 }
];

const RECIPE_DATA = [
  {
    id: "rx_potion",
    name: "ポーション",
    productionType: "alchemy",
    requiredStage: 0,
    materials: [{ itemId: "herb", qty: 1 }],
    goldCost: 10,
    resultItemId: "potion",
    baseSuccessRate: 0.9,
    greatSuccessRate: 0.07,
    highQualityRate: 0.06,
    godQualityRate: 0.004,
    expGain: 8,
    tags: ["potion"],
    description: "基本回復薬"
  },
  {
    id: "rx_hi_potion",
    name: "ハイポーション",
    productionType: "alchemy",
    requiredStage: 1,
    materials: [{ itemId: "herb", qty: 2 }, { itemId: "fineHerb", qty: 1 }],
    goldCost: 26,
    resultItemId: "hiPotion",
    baseSuccessRate: 0.82,
    greatSuccessRate: 0.08,
    highQualityRate: 0.08,
    godQualityRate: 0.006,
    expGain: 16,
    tags: ["potion"],
    description: "上位回復薬"
  },
  {
    id: "rx_ether",
    name: "エーテル",
    productionType: "alchemy",
    requiredStage: 1,
    materials: [{ itemId: "herb", qty: 1 }, { itemId: "manaStone", qty: 1 }],
    goldCost: 24,
    resultItemId: "ether",
    baseSuccessRate: 0.84,
    greatSuccessRate: 0.08,
    highQualityRate: 0.08,
    godQualityRate: 0.005,
    expGain: 15,
    tags: ["ether"],
    description: "MP回復薬"
  },
  {
    id: "rx_hi_ether",
    name: "ハイエーテル",
    productionType: "alchemy",
    requiredStage: 2,
    materials: [{ itemId: "fineHerb", qty: 1 }, { itemId: "manaStone", qty: 2 }, { itemId: "crystalShard", qty: 1 }],
    goldCost: 54,
    resultItemId: "hiEther",
    baseSuccessRate: 0.78,
    greatSuccessRate: 0.1,
    highQualityRate: 0.1,
    godQualityRate: 0.01,
    expGain: 30,
    tags: ["ether"],
    description: "上位MP回復薬"
  },
  {
    id: "rx_antidote",
    name: "毒消し",
    productionType: "alchemy",
    requiredStage: 1,
    materials: [{ itemId: "herb", qty: 1 }, { itemId: "poisonSting", qty: 1 }],
    goldCost: 18,
    resultItemId: "antidote",
    baseSuccessRate: 0.84,
    greatSuccessRate: 0.08,
    highQualityRate: 0.07,
    godQualityRate: 0.005,
    expGain: 14,
    tags: ["antidote"],
    description: "毒を回復する薬"
  },
  {
    id: "rx_attack_tonic",
    name: "攻撃バフ薬",
    productionType: "alchemy",
    requiredStage: 2,
    materials: [{ itemId: "fineHerb", qty: 1 }, { itemId: "manaStone", qty: 1 }],
    goldCost: 40,
    resultItemId: "attackTonic",
    baseSuccessRate: 0.76,
    greatSuccessRate: 0.1,
    highQualityRate: 0.1,
    godQualityRate: 0.01,
    expGain: 28,
    tags: ["buff"],
    description: "攻撃力を一時強化"
  },
  {
    id: "rx_wood_sword",
    name: "木剣",
    productionType: "smith",
    requiredStage: 0,
    materials: [{ itemId: "wood", qty: 2 }],
    goldCost: 28,
    resultItemId: "woodSword",
    baseSuccessRate: 0.86,
    greatSuccessRate: 0.08,
    highQualityRate: 0.07,
    godQualityRate: 0.004,
    expGain: 10,
    tags: ["weapon"],
    description: "入門武器"
  },
  {
    id: "rx_iron_sword",
    name: "鉄剣",
    productionType: "smith",
    requiredStage: 1,
    materials: [{ itemId: "ironOre", qty: 2 }, { itemId: "wood", qty: 1 }],
    goldCost: 72,
    resultItemId: "ironSword",
    baseSuccessRate: 0.74,
    greatSuccessRate: 0.1,
    highQualityRate: 0.12,
    godQualityRate: 0.012,
    expGain: 24,
    tags: ["weapon"],
    description: "標準的な剣"
  },
  {
    id: "rx_iron_chest",
    name: "鉄の胸当て",
    productionType: "smith",
    requiredStage: 2,
    materials: [{ itemId: "ironOre", qty: 3 }, { itemId: "fireCrystal", qty: 1 }],
    goldCost: 120,
    resultItemId: "ironChest",
    baseSuccessRate: 0.66,
    greatSuccessRate: 0.11,
    highQualityRate: 0.14,
    godQualityRate: 0.015,
    expGain: 40,
    tags: ["armor"],
    description: "防御寄り防具"
  },
  {
    id: "rx_guard_bracelet",
    name: "守りの腕輪",
    productionType: "smith",
    requiredStage: 2,
    materials: [{ itemId: "manaStone", qty: 1 }, { itemId: "ironOre", qty: 1 }],
    goldCost: 90,
    resultItemId: "guardBracelet",
    baseSuccessRate: 0.72,
    greatSuccessRate: 0.1,
    highQualityRate: 0.12,
    godQualityRate: 0.012,
    expGain: 30,
    tags: ["accessory"],
    description: "防御系アクセ"
  },
  {
    id: "rx_grilled_meat",
    name: "焼き肉",
    productionType: "cooking",
    requiredStage: 0,
    materials: [{ itemId: "beastMeat", qty: 1 }],
    goldCost: 14,
    resultItemId: "grilledMeat",
    baseSuccessRate: 0.88,
    greatSuccessRate: 0.1,
    highQualityRate: 0.08,
    godQualityRate: 0.004,
    expGain: 9,
    tags: ["food"],
    description: "基本料理"
  },
  {
    id: "rx_vege_soup",
    name: "野菜スープ", productionType: "cooking",
    requiredStage: 1,
    materials: [{ itemId: "herb", qty: 1 }, { itemId: "beastMeat", qty: 1 }],
    goldCost: 22,
    resultItemId: "vegeSoup",
    baseSuccessRate: 0.84,
    greatSuccessRate: 0.11,
    highQualityRate: 0.1,
    godQualityRate: 0.008,
    expGain: 18,
    tags: ["food", "buff"],
    description: "体力回復料理"
  },
  {
    id: "rx_gourmet_meat",
    name: "豪華肉料理", productionType: "cooking",
    requiredStage: 2,
    materials: [{ itemId: "fineMeat", qty: 2 }, { itemId: "crystalShard", qty: 1 }],
    goldCost: 60,
    resultItemId: "gourmetMeat",
    baseSuccessRate: 0.7,
    greatSuccessRate: 0.14,
    highQualityRate: 0.15,
    godQualityRate: 0.015,
    expGain: 36,
    tags: ["food", "buff", "rare"],
    description: "高級バフ料理"
  }
];

const DESERT_RECIPE_ITEM_IDS = [
  "sandbladeLongsword", "quicksandTwinblades", "ruinbreakerGreatsword", "sandrunnerKunai", "banditBaneDagger",
  "drywindStaff", "mirageRod", "pilgrimHolyStaff", "sandprayerMace",
  "sandScarf", "wanderingDuneMantle", "ruinwardenArmor", "dryboneGauntlet",
  "scorpionCharm", "antiBanditTalisman", "mirageRing", "quicksandAnklet"
];
const SEA_RECIPE_ITEM_IDS = [
  "tideslashSaber", "abyssbreakerGreatsword", "tideKnightTwinSwords", "searoarDagger", "waveShadowShuriken",
  "abyssTreasureStaff", "tidalWand", "seaprayerHolyStaff", "pearlPriestStaff",
  "seashellArmor", "marineRobe", "seabreezeCoat", "abyssKnightArmor",
  "pearlNecklaceSea", "jellyWardCharm", "tidalBracelet", "seaSnakeFangOrnament"
];
const VOLCANO_RECIPE_ITEM_IDS = [
  "scorchsteelGreatsword", "flamebreakerAxe", "crimsonTwinblades", "fireShadowKunai", "scorchingDarkBlade",
  "volcanicCoreStaff", "seraphicRod", "holyflameStaff", "radiantMace",
  "fireproofHeavyArmor", "scorchbaneRobe", "crimsonMantle", "infernoKnightArmor",
  "fireDragonRing", "lavaCoreNecklace", "ashenBracelet", "indomitableTalisman"
];

const BOSS_RECIPE_DEFS = [
  { id: "hydraScaleBlade", requiredTown: "dustria", requiredBossStage: "2-10", material: "hydraScale" },
  { id: "hydraScaleMail", requiredTown: "dustria", requiredBossStage: "2-10", material: "hydraScale" },
  { id: "hydraScaleCharm", requiredTown: "dustria", requiredBossStage: "2-10", material: "hydraScale" },
  { id: "leviathiaTrident", requiredTown: "akamatsu", requiredBossStage: "3-10", material: "leviathanFin" },
  { id: "leviathiaVestment", requiredTown: "akamatsu", requiredBossStage: "3-10", material: "leviathanFin" },
  { id: "leviathiaSigil", requiredTown: "akamatsu", requiredBossStage: "3-10", material: "leviathanFin" },
  { id: "volcaDestroyer", requiredTown: "rulacia", requiredBossStage: "4-10", material: "volkaCore" },
  { id: "volcaBulwark", requiredTown: "rulacia", requiredBossStage: "4-10", material: "volkaCore" },
  { id: "volcaCrest", requiredTown: "rulacia", requiredBossStage: "4-10", material: "volkaCore" }
];

function buildRegionalEquipmentRecipe(itemId, requiredTown) {
  const eq = EQUIPMENT_DATA[itemId];
  if (!eq) {
    return null;
  }
  const regionStage = requiredTown === "dustria" ? 2 : requiredTown === "akamatsu" ? 3 : 4;
  const baseMaterialsByRegion = {
    dustria: [{ itemId: "ironOre", qty: 2 }, { itemId: "manaStone", qty: 1 }, { itemId: "poisonSting", qty: 1 }],
    akamatsu: [{ itemId: "waterShard", qty: 2 }, { itemId: "crystalShard", qty: 1 }, { itemId: "fineMeat", qty: 1 }],
    rulacia: [{ itemId: "fireCrystal", qty: 2 }, { itemId: "ironOre", qty: 2 }, { itemId: "manaStone", qty: 1 }]
  };
  const mats = [...(baseMaterialsByRegion[requiredTown] || [{ itemId: "ironOre", qty: 1 }])];
  if (eq.category === "weapon") mats.push({ itemId: "wood", qty: 1 });
  if (eq.category === "armor") mats.push({ itemId: "ironOre", qty: 1 });
  if (eq.category === "accessory") mats.push({ itemId: "manaStone", qty: 1 });
  return {
    id: `rx_${itemId}`,
    name: eq.name,
    productionType: "smith",
    requiredStage: regionStage,
    requiredTown,
    materials: mats,
    goldCost: Math.max(80, Math.floor((eq.price || 0) * 0.38)),
    resultItemId: itemId,
    baseSuccessRate: requiredTown === "rulacia" ? 0.52 : requiredTown === "akamatsu" ? 0.6 : 0.68,
    greatSuccessRate: 0.1,
    highQualityRate: 0.14,
    godQualityRate: requiredTown === "rulacia" ? 0.025 : 0.018,
    expGain: requiredTown === "rulacia" ? 88 : requiredTown === "akamatsu" ? 62 : 44,
    tags: [eq.category, "regional", requiredTown],
    description: `${requiredTown === "dustria" ? "砂漠" : requiredTown === "akamatsu" ? "海域" : "火山"}装備`
  };
}

function buildBossEquipmentRecipe(def) {
  const eq = EQUIPMENT_DATA[def.id];
  if (!eq) {
    return null;
  }
  return {
    id: `rx_${def.id}`,
    name: eq.name,
    productionType: "smith",
    requiredStage: 4,
    requiredTown: def.requiredTown,
    requiredBossStage: def.requiredBossStage,
    unlockMaterial: def.material,
    materials: [{ itemId: def.material, qty: 2 }, { itemId: "fireCrystal", qty: 2 }, { itemId: "manaStone", qty: 2 }, { itemId: "crystalShard", qty: 2 }],
    goldCost: Math.max(220, Math.floor((eq.price || 0) * 0.45)),
    resultItemId: def.id,
    baseSuccessRate: 0.48,
    greatSuccessRate: 0.11,
    highQualityRate: 0.18,
    godQualityRate: 0.04,
    expGain: 110,
    tags: [eq.category, "boss_series", def.requiredTown],
    description: "地域ボス素材装備"
  };
}

const REGIONAL_SMITH_RECIPES = [
  ...DESERT_RECIPE_ITEM_IDS.map((id) => buildRegionalEquipmentRecipe(id, "dustria")),
  ...SEA_RECIPE_ITEM_IDS.map((id) => buildRegionalEquipmentRecipe(id, "akamatsu")),
  ...VOLCANO_RECIPE_ITEM_IDS.map((id) => buildRegionalEquipmentRecipe(id, "rulacia")),
  ...BOSS_RECIPE_DEFS.map((def) => buildBossEquipmentRecipe(def))
].filter(Boolean);

RECIPE_DATA.push(...REGIONAL_SMITH_RECIPES);

const REGION_GATHER_TABLE = {
  grassland: [
    { itemId: "herb", weight: 42 },
    { itemId: "fineHerb", weight: 16 },
    { itemId: "beastMeat", weight: 22 },
    { itemId: "wood", weight: 20 }
  ],
  desert: [
    { itemId: "ironOre", weight: 30 },
    { itemId: "manaStone", weight: 20 },
    { itemId: "poisonSting", weight: 22 },
    { itemId: "wood", weight: 8 }
  ],
  sea: [
    { itemId: "beastMeat", weight: 20 },
    { itemId: "fineMeat", weight: 20 },
    { itemId: "crystalShard", weight: 22 },
    { itemId: "waterShard", weight: 25 }
  ],
  volcano: [
    { itemId: "fireCrystal", weight: 26 },
    { itemId: "ironOre", weight: 24 },
    { itemId: "manaStone", weight: 18 },
    { itemId: "crystalShard", weight: 16 }
  ],
  neverend: [
    { itemId: "controlBoard", weight: 28 },
    { itemId: "overclockCircuit", weight: 24 },
    { itemId: "collapseArmorShard", weight: 20 },
    { itemId: "skyFurnaceCore", weight: 10 },
    { itemId: "blessingCircuit", weight: 18 }
  ]
};

const NORMAL_TITLES = [
  { id: "grass_observer", name: "草むらの観察者", conditionDescription: "草原で30秒待機する", effectDescription: "草原で回避+1%", effect: { evadeByRegion: { grassland: 0.01 } }, trigger: ["secondTick"] },
  { id: "deep_breath", name: "初心者の深呼吸", conditionDescription: "開始後5分間戦闘しない", effectDescription: "初戦の被ダメ-3%", effect: { firstBattleDamageReduction: 0.03 }, trigger: ["secondTick", "battleStart"] },
  { id: "coin_talent", name: "小銭拾いの才能", conditionDescription: "1G拾いを50回行う", effectDescription: "獲得GOLD+1%", effect: { goldMultiplier: 0.01 }, trigger: ["afterBattle", "afterKill"] },
  { id: "miss_master", name: "空振りの達人", conditionDescription: "攻撃を30回外す", effectDescription: "命中+1%", effect: { accuracyBonus: 0.01 }, trigger: ["afterMiss"] },
  { id: "pain_hardened", name: "痛みに慣れた者", conditionDescription: "累計1000ダメージ受ける", effectDescription: "防御+1%", effect: { defenseMultiplier: 0.01 }, trigger: ["afterDamageTaken"] },
  { id: "edge_survivor", name: "ぎりぎり生存者", conditionDescription: "HP1桁で3回勝利", effectDescription: "HP10%以下で防御+2%", effect: { lowHpDefenseMultiplier: 0.02 }, trigger: ["afterBattle"] },
  { id: "first_gather", name: "はじめての採取", conditionDescription: "素材を10個集める", effectDescription: "採取量+1%", effect: { gatherMultiplier: 0.01 }, trigger: ["afterGather"] },
  { id: "slime_scholar", name: "スライム研究家", conditionDescription: "スライムを50体倒す", effectDescription: "スライム系ダメージ+3%", effect: { damageToSpecies: { slime: 0.03 } }, trigger: ["afterKill"] },
  { id: "errand_mood", name: "おつかい気分", conditionDescription: "依頼を5回達成", effectDescription: "ギルドpt+2%", effect: { guildPointMultiplier: 0.02 }, trigger: ["afterQuestClaim"] },
  { id: "smith_friend", name: "ちょい鍛冶好き", conditionDescription: "強化を5回行う", effectDescription: "強化費用-1%", effect: { enhanceCostReduction: 0.01 }, trigger: ["afterEnhance"] },
  { id: "cook_friend", name: "ちょい料理好き", conditionDescription: "料理を5個作る", effectDescription: "料理売値+2%", effect: { cookedSellMultiplier: 0.02 }, trigger: ["afterCraft"] },
  { id: "alchemy_friend", name: "ちょい錬金好き", conditionDescription: "ポーションを10個作る", effectDescription: "ポーション作成時に追加生成", effect: { potionCraftBonusChance: 0.12 }, trigger: ["afterCraft"] },
  { id: "mass_producer", name: "量産職人", conditionDescription: "同一アイテムを30個作る", effectDescription: "10%で追加作成", effect: { extraCraftChance: 0.1 }, trigger: ["afterCraft"] },
  { id: "workshop_regular", name: "工房の常連", conditionDescription: "工房利用50回", effectDescription: "工房費用-10%", effect: { workshopCostReduction: 0.1 }, trigger: ["afterCraft", "afterEnhance"] },
  { id: "workshop_commuter", name: "工房通い", description: "工房に足しげく通ううちに、手際が少し良くなった。", conditionDescription: "生産ジョブで工房のボタンを100回押す", effectDescription: "生産EXP+10%", effect: { productionExpRateBonus: 0.1 }, trigger: ["workshopAction"] },
  { id: "workshop_maniac", name: "工房狂い", description: "もはや工房そのものが生活圏。生産の伸びが目に見えて違う。", conditionDescription: "生産ジョブで工房のボタンを1000回押す", effectDescription: "生産EXP+20%", effect: { productionExpRateBonus: 0.2 }, trigger: ["workshopAction"] },
  { id: "production_serious", name: "生産職の本気", conditionDescription: "生産Lv100到達", effectDescription: "品質1段階上昇率+20%", effect: { qualityStepUpChance: 0.2 }, trigger: ["afterProductionExp"] },
  { id: "forge_ruler", name: "鍛冶場の支配者", conditionDescription: "強化100回", effectDescription: "強化成功率+15%", effect: { smithEnhanceBonus: 0.15 }, trigger: ["afterEnhance"] },
  { id: "alchemy_seeker", name: "錬金の探究者", conditionDescription: "ポーション200個作成", effectDescription: "ポーション効果+20%", effect: { alchemyEffectBonus: 0.2 }, trigger: ["afterCraft"] },
  { id: "master_chef_title", name: "絶品調理人", conditionDescription: "料理100回成功", effectDescription: "料理バフ時間+30%", effect: { cookingDurationBonus: 0.3 }, trigger: ["afterCraft"] },
  { id: "chant_trainee", name: "詠唱の練習生", conditionDescription: "魔法を100回使う", effectDescription: "MP消費-1%", effect: { mpCostReduction: 0.01 }, trigger: ["afterSpellUse"] },
  { id: "prayer_trainee", name: "祈りの練習生", conditionDescription: "回復スキル50回使用", effectDescription: "回復量+2%", effect: { healMultiplier: 0.02 }, trigger: ["afterHealSkillUse"] },
  { id: "trade_basics", name: "売買の基本", conditionDescription: "売買20回", effectDescription: "売値+1%", effect: { sellPriceMultiplier: 0.01 }, trigger: ["afterShopTrade"] },
  { id: "overweight_adventurer", name: "過積載の冒険者", conditionDescription: "全装備枠を埋めて50勝", effectDescription: "重量ペナルティ-20%", effect: { weightPenaltyReduction: 0.2 }, trigger: ["afterBattle", "afterEquipmentChange"] },
  { id: "load_breaker", name: "積載突破者", conditionDescription: "超過重量で100勝", effectDescription: "重量ペナルティ半減", effect: { weightPenaltyReduction: 0.5 }, trigger: ["afterBattle", "afterEquipmentChange"] },
  { id: "nameless_wanderer", name: "無名の旅人", conditionDescription: "称号未装備で100戦", effectDescription: "称号未装備時に全能力+1", effect: { conditionalBonusNoTitle: { allStatsFlat: 1 } }, trigger: ["afterBattle", "battleStart"] }
];

const CHEAT_TITLES = [
  { id: "first_death", name: "初回死亡者", conditionDescription: "初めて戦闘不能になる", effectDescription: "復帰後攻撃+10%", effect: { battleStartBuff: { attackMultiplier: 0.1, durationSec: 30 } }, trigger: ["afterDefeat", "battleStart"] },
  { id: "survival_will", name: "生還の執念", conditionDescription: "瀕死勝利を3回達成", effectDescription: "低HP時の被ダメ-10%", effect: { lowHpDamageReduction: 0.1 }, trigger: ["afterBattle"] },
  { id: "barehand_boss", name: "素手撃破者", conditionDescription: "武器なしでボス撃破", effectDescription: "攻撃+8%/素手時+5%", effect: { attackMultiplier: 0.08, noWeaponAttackBonus: 0.05 }, trigger: ["afterFieldBossClear"] },
  { id: "cook_fail_100", name: "料理失敗百連", conditionDescription: "料理失敗100回", effectDescription: "料理大成功率+15%", effect: { cookGreatSuccessRateBonus: 0.15 }, trigger: ["afterCraft"] },
  { id: "no_supply_clear", name: "無補給踏破者", conditionDescription: "アイテム未使用でステージクリア", effectDescription: "自然回復+5%/分", effect: { stageRegenPerMinute: 0.05 }, trigger: ["afterStageClear"] },
  { id: "no_rest_march", name: "休まずの進軍", conditionDescription: "休憩なしで3ステージ突破", effectDescription: "戦闘開始時速度+10%", effect: { battleStartBuff: { speedMultiplier: 0.1, durationSec: 15 } }, trigger: ["afterStageClear"] },
  { id: "first_kill_breaker", name: "初見殺し突破者", conditionDescription: "初見ボス勝利5回", effectDescription: "ボスダメージ+10%", effect: { damageToBoss: 0.1 }, trigger: ["afterFieldBossClear"] },
  { id: "streak_demon", name: "連戦の鬼", conditionDescription: "100連勝達成", effectDescription: "速度+10%", effect: { speedMultiplier: 0.1 }, trigger: ["afterBattle"] },
  { id: "last_critical", name: "最後の一撃", conditionDescription: "ボスに会心トドメ5回", effectDescription: "会心率+8%", effect: { critRateBonus: 0.08 }, trigger: ["afterFieldBossClear"] },
  { id: "defense_sage", name: "守りの求道者", conditionDescription: "防御ビルドでボス10撃破", effectDescription: "防御30%を攻撃へ加算", effect: { defenseToAttackRatio: 0.3 }, trigger: ["afterFieldBossClear"] },
  { id: "serious_priest", name: "真面目な僧侶", conditionDescription: "僧侶でヘルプボタンを100回押す", effectDescription: "過剰回復防御バフ発生時、追加で防御+5%(3スタック/別枠)", effect: { priestOverhealExtraDefenseStackSerious: true }, trigger: ["helpToggle"] },
  { id: "too_serious_priest", name: "真面目過ぎる僧侶", conditionDescription: "僧侶で設定を保存する", effectDescription: "過剰回復防御バフ発生時、追加で防御+5%(3スタック/別枠)", effect: { priestOverhealExtraDefenseStackTooSerious: true }, trigger: ["settingsSave"] },
  { id: "awakened_priest", name: "目覚めた僧侶", conditionDescription: "僧侶で砂漠突破ボスを撃破", effectDescription: "30%で被ダメージ半減", effect: { priestDamageHalfChance: 0.3 }, trigger: ["afterFieldBossClear", "afterBattle"] },
  { id: "gankimari_priest", name: "ガンギマリ僧侶", conditionDescription: "僧侶で回復スキル4枠セットのまま砂漠ボス撃破", effectDescription: "30%で回復量2倍", effect: { priestHealDoubleChance: 0.3 }, trigger: ["afterFieldBossClear", "afterBattle"] },
  { id: "vampire_swordsman", name: "吸血剣士", conditionDescription: "剣士でボスを10体撃破", effectDescription: "30%で与ダメの50%をHP吸収", effect: { swordsmanLifestealChance: 0.3, swordsmanLifestealRatio: 0.5 }, trigger: ["afterFieldBossClear", "afterBattle"] },
  { id: "doublecharge_swordsman", name: "倍倍剣士", conditionDescription: "剣士で砂漠のボスを撃破", effectDescription: "攻撃時30%でチャージ獲得。次の攻撃が2倍", effect: { swordsmanChargeChance: 0.3, swordsmanChargeDamageMultiplier: 2 }, trigger: ["afterFieldBossClear", "afterBattle"] },
  { id: "flash_swordsman", name: "閃光の剣士", conditionDescription: "剣士で回避率を50%以上にする", effectDescription: "攻撃時に回避率上昇バフ付与(単一枠)", effect: { swordsmanFlashEvasionOnHit: true }, trigger: ["afterBattle", "afterEquipmentChange", "battleStart"] },
  { id: "swordwolf", name: "剣狼", conditionDescription: "剣士で防具なしで砂漠ボス撃破", effectDescription: "攻撃時10%で反射準備。次被弾時に30%反射", effect: { swordsmanReflectReadyChance: 0.1, swordsmanReflectRate: 0.3 }, trigger: ["afterFieldBossClear", "afterBattle"] },
  { id: "one_spell", name: "ワンスペル", conditionDescription: "魔術師で1スキル構成のまま砂漠ボス撃破", effectDescription: "スキル1枠時、スキルダメージ上昇", effect: { mageSingleSkillDamageBonus: 0.35 }, trigger: ["afterFieldBossClear", "afterBattle"] },
  { id: "quatre_spell", name: "クワトルスペル", conditionDescription: "魔術師で攻撃スキル4枠のまま砂漠ボス撃破", effectDescription: "スキル4枠時、スキルダメージ上昇", effect: { mageFourSkillDamageBonus: 0.28 }, trigger: ["afterFieldBossClear", "afterBattle"] },
  { id: "full_boost", name: "フルブースト", conditionDescription: "魔術師でバフスキル4枠のまま砂漠ボス撃破", effectDescription: "バフ系スキル効果を強化", effect: { mageBuffSkillAmplify: 0.35 }, trigger: ["afterFieldBossClear", "afterBattle"] },
  { id: "sacrifice", name: "サクリファイス", conditionDescription: "魔術師でボスに10回敗北", effectDescription: "攻撃2倍。代わりに攻撃毎にHPを消費", effect: { mageSacrificeAttackMultiplier: 2, mageSacrificeSelfHpRate: 0.1 }, trigger: ["afterDefeat", "afterBattle"] },
  { id: "four_blade_style", name: "四刀流", conditionDescription: "剣士+剣士で砂漠突破ボスを撃破", effectDescription: "攻撃時30%で追加攻撃", effect: { comboDoubleStrikeChance: 0.3 }, trigger: ["afterFieldBossClear", "afterBattle"] },
  { id: "magic_swordsman", name: "魔剣士", conditionDescription: "剣士+魔術師で砂漠突破ボスを撃破", effectDescription: "戦闘開始時ランダムバフを2回付与", effect: { comboBattleStartRandomBuff: { power: 0.2, durationSec: 18 }, comboBattleStartRandomBuffCount: 2 }, trigger: ["afterFieldBossClear", "afterBattle", "battleStart"] },
  { id: "swordwolf_2", name: "剣狼2", conditionDescription: "剣士+忍者で砂漠突破ボスを撃破", effectDescription: "攻撃時20%で反射準備。次被弾時に30%反射", effect: { comboReflectReadyChance: 0.2, comboReflectRate: 0.3 }, trigger: ["afterFieldBossClear", "afterBattle"] },
  { id: "holy_knight", name: "聖騎士", conditionDescription: "剣士+僧侶で砂漠突破ボスを撃破", effectDescription: "戦闘開始時3秒間無敵", effect: { comboBattleStartInvincibleMs: 3000 }, trigger: ["afterFieldBossClear", "afterBattle", "battleStart"] },
  { id: "quad_cast", name: "四重詠唱", conditionDescription: "魔術師+魔術師で砂漠突破ボスを撃破", effectDescription: "攻撃時30%で追加攻撃", effect: { comboDoubleStrikeChance: 0.3 }, trigger: ["afterFieldBossClear", "afterBattle"] },
  { id: "ma_nin", name: "魔忍", conditionDescription: "魔術師+忍者で砂漠突破ボスを撃破", effectDescription: "デバフ系スキル効果を強化", effect: { comboDebuffSkillAmplify: 0.35 }, trigger: ["afterFieldBossClear", "afterBattle"] },
  { id: "inquisitor", name: "異端審問官", conditionDescription: "魔術師+僧侶で砂漠突破ボスを撃破", effectDescription: "バフ系スキル効果を強化", effect: { comboBuffSkillAmplify: 0.35 }, trigger: ["afterFieldBossClear", "afterBattle"] },
  { id: "nin_nin", name: "忍忍", conditionDescription: "忍者+忍者で砂漠突破ボスを撃破", effectDescription: "攻撃時30%で追加攻撃", effect: { comboDoubleStrikeChance: 0.3 }, trigger: ["afterFieldBossClear", "afterBattle"] },
  { id: "tsujigiri_heal", name: "辻切ヒール", conditionDescription: "忍者+僧侶で砂漠突破ボスを撃破", effectDescription: "回避率が高いほど回復量上昇", effect: { comboEvasionHealScaling: 0.8 }, trigger: ["afterFieldBossClear", "afterBattle"] },
  { id: "true_healer", name: "真のヒーラー", conditionDescription: "僧侶+僧侶で砂漠突破ボスを撃破", effectDescription: "攻撃時30%で追加攻撃", effect: { comboDoubleStrikeChance: 0.3 }, trigger: ["afterFieldBossClear", "afterBattle"] },
  { id: "title_idle_60", name: "見上げる者", conditionDescription: "タイトル画面で60秒待機", effectDescription: "効果なし", effect: {}, trigger: ["secondTick"] },
  { id: "back_button_fan", name: "戻るボタン愛好家", conditionDescription: "戻るボタンを100回押す", effectDescription: "効果なし", effect: {}, trigger: ["afterBack"] },
  { id: "clock_hobby", name: "時計職人ごっこ", conditionDescription: "タイマーを21回押す", effectDescription: "効果なし", effect: {}, trigger: ["timerClick"] },
  { id: "grassland_resident", name: "草原在住", conditionDescription: "草原1-1を100周する", effectDescription: "効果なし", effect: {}, trigger: ["afterStageClear"] },
  { id: "silent_warrior", name: "無音の戦士", conditionDescription: "BGM OFFで100戦", effectDescription: "効果なし", effect: {}, trigger: ["afterBattle"] },
  { id: "nobody", name: "何者でもない", conditionDescription: "称号図鑑を50回開く", effectDescription: "効果なし", effect: {}, trigger: ["openTitleCatalog"], isHidden: true },
  { id: "time_nibbler", name: "時をかじる者", conditionDescription: "タイマーを3回押す", effectDescription: "1.5x解放", effect: { unlockBattleSpeed: [1.5] }, trigger: ["timerClick"], isHidden: true },
  { id: "time_keeper_1", name: "時を刻みし者1", conditionDescription: "タイマーを5回押す", effectDescription: "2x解放", effect: { unlockBattleSpeed: [2] }, trigger: ["timerClick"], isHidden: true },
  { id: "time_keeper_2", name: "時を刻みし者2", conditionDescription: "タイマーを20回押す", effectDescription: "3x解放", effect: { unlockBattleSpeed: [3] }, trigger: ["timerClick"], isHidden: true },
  { id: "time_keeper_3", name: "時を刻みし者3", conditionDescription: "タイマーを60回押す", effectDescription: "4x解放/倍速中EXP+10%", effect: { unlockBattleSpeed: [4], speedModeBonus: { expMultiplier: 0.1, minSpeed: 1.5 } }, trigger: ["timerClick"], isHidden: true },
  { id: "time_lord", name: "時の支配者", conditionDescription: "タイマー120回+2周目", effectDescription: "5x解放/倍速中EXP+25%", effect: { unlockBattleSpeed: [5], speedModeBonus: { expMultiplier: 0.25, minSpeed: 1.5 }, speedMultiplier: 0.1 }, trigger: ["timerClick", "afterLoopStart"], isHidden: true },
  { id: "workshop_lodger", name: "工房暮らし", description: "工房に住んでいるのではと思われるほど居ついた者の称号。", conditionDescription: "生産ジョブで工房に3分滞在する", effectDescription: "生産EXP+30%", effect: { productionExpRateBonus: 0.3 }, trigger: ["workshopStayTick"] },
  { id: "workshop_overtime", name: "残業", description: "工房に残り続けた者だけが知る、無駄のない手順。", conditionDescription: "生産ジョブで工房に10分滞在する", effectDescription: "品質向上時、35%で素材を1つ返却", effect: { qualityMaterialRefundChance: 0.35 }, trigger: ["workshopStayTick"] },
  { id: "unfavored_king", name: "不遇職の王", conditionDescription: "不遇職でゲームクリア", effectDescription: "メイン+40%/サブ+30%", effect: { allStatsMultiplier: 0.4, noSubJobBonus: 0.3 }, trigger: ["afterGameClear"], isHidden: true },
  { id: "production_is_main", name: "生産が本体", conditionDescription: "生産特化で終盤突破", effectDescription: "生産+20%/強化+20%", effect: { craftSuccessBonus: 0.2, enhanceSuccessBonus: 0.2 }, trigger: ["afterGameClear"], isHidden: true },
  { id: "one_man_army", name: "一騎当千", conditionDescription: "サブ未設定で終盤突破", effectDescription: "サブなし時に大幅強化", effect: { noSubJobBonus: 0.35 }, trigger: ["afterFieldBossClear", "afterGameClear"], isHidden: true },
  { id: "infinite_seeker", name: "無限の探究者", conditionDescription: "戦闘/生産/周回の複合達成", effectDescription: "EXP+30%/G+30%/生産+20%/強化+20%", effect: { expMultiplier: 0.3, goldMultiplier: 0.3, craftSuccessBonus: 0.2, enhanceSuccessBonus: 0.2 }, trigger: ["afterBattle", "afterCraft", "afterLevelUp"], isHidden: true },
  { id: "anti_first_trap", name: "初見殺しを殺す者", conditionDescription: "初見ボス突破を8回達成", effectDescription: "ボス戦で被ダメ-30%/与ダメ+30%", effect: { bossDamageBonus: 0.3, battleStartBuff: { damageReduction: 0.7, durationSec: 18 } }, trigger: ["afterFieldBossClear"], isHidden: true },
  { id: "carry_beyond", name: "積載の向こう側", conditionDescription: "極限過積載で高難易度踏破", effectDescription: "重量ペナルティ無効+スロット補正", effect: { ignoreWeightPenalty: true, slotFillAttackDefenseBonus: 0.03 }, trigger: ["afterGameClear"], isHidden: true },
  { id: "beyond_death", name: "死を越えし者", conditionDescription: "多数死亡状態でクリア", effectDescription: "復帰時に防護バフ", effect: { reviveBuff: { damageReduction: 0.4, durationSec: 8 } }, trigger: ["afterGameClear", "afterDefeat"], isHidden: true },
  { id: "dev_unexpected", name: "運営想定外", conditionDescription: "想定外ビルドを複数達成", effectDescription: "同時ON+1/レア遭遇率上昇", effect: { titleLimitBonus: 1, uniqueEncounterRateBonus: 0.01 }, trigger: ["afterGameClear"], isHidden: true }
];

const UNIQUE_TITLES = [
  { id: "unique_fenrir", name: "神狼狩り", conditionDescription: "フェンリルを撃破", effectDescription: "ユニーク特攻+5%", effect: { damageToUnique: 0.05 }, trigger: ["afterUniqueKill"], uniqueId: "fenrir" },
  { id: "unique_jormungand", name: "大蛇殺し", conditionDescription: "ヨルムンガンドを撃破", effectDescription: "ユニーク特攻+5%", effect: { damageToUnique: 0.05 }, trigger: ["afterUniqueKill"], uniqueId: "jormungand" },
  { id: "unique_cerberus", name: "三頭魔犬討伐者", conditionDescription: "ケルベロスを撃破", effectDescription: "ユニーク特攻+5%", effect: { damageToUnique: 0.05 }, trigger: ["afterUniqueKill"], uniqueId: "cerberus" },
  { id: "unique_griffon", name: "神速の翼折り", conditionDescription: "グリフォンを撃破", effectDescription: "ユニーク特攻+5%", effect: { damageToUnique: 0.05 }, trigger: ["afterUniqueKill"], uniqueId: "griffon" },
  { id: "unique_minotauros", name: "迷宮の破壊者", conditionDescription: "ミノタウロスを撃破", effectDescription: "ユニーク特攻+5%", effect: { damageToUnique: 0.05 }, trigger: ["afterUniqueKill"], uniqueId: "minotauros" },
  { id: "unique_phoenix", name: "輪廻断ち", conditionDescription: "鳳凰を撃破", effectDescription: "ユニーク特攻+5%", effect: { damageToUnique: 0.05 }, trigger: ["afterUniqueKill"], uniqueId: "phoenix" },
  { id: "unique_kirin", name: "天雷踏破者", conditionDescription: "麒麟を撃破", effectDescription: "ユニーク特攻+5%", effect: { damageToUnique: 0.05 }, trigger: ["afterUniqueKill"], uniqueId: "kirin" },
  { id: "god_slayer", name: "神殺し", conditionDescription: "ユニーク7体を全撃破", effectDescription: "全能力+25%/ユニーク特攻+50%/遭遇率上昇", effect: { allStatsMultiplier: 0.25, damageToUnique: 0.5, uniqueEncounterRateBonus: 0.004 }, trigger: ["afterUniqueKill"], isHidden: true }
];

const TITLE_DATA = [
  ...NORMAL_TITLES.map((t) => ({ category: "normal", description: t.name, isHidden: false, canCarryOver: false, carryOverType: "recordOnly", ...t })),
  ...CHEAT_TITLES.map((t) => ({ category: "cheat", description: t.name, isHidden: false, canCarryOver: true, carryOverType: "direct", ...t })),
  ...UNIQUE_TITLES.map((t) => ({ category: "cheat", description: t.name, isHidden: false, canCarryOver: true, carryOverType: "direct", ...t }))
];

const TITLE_CHECKERS = {
  grass_observer: () => state.stats.idleGrasslandSeconds >= 30,
  deep_breath: () => state.stats.noBattleSinceLoginSeconds >= 300,
  coin_talent: () => state.stats.oneGoldPickupCount >= 50,
  miss_master: () => state.stats.attacksMissed >= 30,
  pain_hardened: () => state.stats.damageTakenTotal >= 1000,
  edge_survivor: () => state.stats.hpOneDigitWins >= 3,
  first_gather: () => state.stats.totalGatheredMaterials >= 10,
  slime_scholar: () => (state.stats.enemyKillCounts.slime || 0) >= 50,
  errand_mood: () => state.stats.guildQuestCompleted >= 5,
  smith_friend: () => state.stats.smithEnhanceCount >= 5,
  cook_friend: () => state.stats.cookingCraftCount >= 5,
  alchemy_friend: () => (state.stats.producedItemCounts.potion || 0) >= 10,
  mass_producer: () => Object.values(state.stats.producedItemCounts).some((count) => count >= 30),
  workshop_regular: () => state.stats.totalEnhances + state.stats.totalCrafts >= 50,
  workshop_commuter: () => (state.stats.productionWorkshopButtonPressCount || 0) >= 100,
  workshop_maniac: () => (state.stats.productionWorkshopButtonPressCount || 0) >= 1000,
  workshop_lodger: () => (state.stats.productionWorkshopStaySeconds || 0) >= 180,
  workshop_overtime: () => (state.stats.productionWorkshopStaySeconds || 0) >= 600,
  production_serious: () => state.player.productionJobLevel >= 100 || state.player.productionJobStage >= 4,
  forge_ruler: () => state.stats.totalEnhances >= 100,
  alchemy_seeker: () => (state.stats.producedItemCounts.potion || 0) >= 200,
  master_chef_title: () => ((state.stats.producedItemCounts.grilledMeat || 0) + (state.stats.producedItemCounts.vegeSoup || 0) + (state.stats.producedItemCounts.gourmetMeat || 0)) >= 100,
  chant_trainee: () => state.stats.spellUseCount >= 100,
  prayer_trainee: () => state.stats.healSkillUseCount >= 50,
  trade_basics: () => state.stats.totalShopTrades >= 20,
  overweight_adventurer: () => state.stats.fullEquipWins >= 50,
  load_breaker: () => state.stats.overweightWins >= 100,
  nameless_wanderer: () => state.stats.noTitleBattleStreak >= 100,

  first_death: () => state.stats.totalDeaths >= 1,
  survival_will: () => state.stats.nearDeathWins >= 3,
  barehand_boss: () => state.stats.noWeaponBossKills >= 1,
  cook_fail_100: () => state.stats.cookingFailureCount >= 100,
  no_supply_clear: () => state.stats.noItemStageClearCount >= 1,
  no_rest_march: () => state.stats.noRestStageClearStreak >= 3,
  first_kill_breaker: () => state.stats.firstTryBossWins >= 5,
  streak_demon: () => state.stats.currentWinStreak >= 100,
  last_critical: () => state.stats.bossCritFinishCount >= 5,
  defense_sage: () => state.stats.defenseBuildBossKills >= 10,
  serious_priest: () => (state.stats.priestHelpToggleCount || 0) >= 100,
  too_serious_priest: () => (state.stats.priestSettingsSaveCount || 0) >= 1,
  awakened_priest: () => (state.stats.priestDesertBossClearCount || 0) >= 1,
  gankimari_priest: () => (state.stats.priestDesertBossWithFourHealsCount || 0) >= 1,
  vampire_swordsman: () => (state.stats.swordsmanBossKillCount || 0) >= 10,
  doublecharge_swordsman: () => (state.stats.swordsmanDesertBossClearCount || 0) >= 1,
  flash_swordsman: () => getCurrentMainBattleLineId() === "swordsman_line" && (getEffectivePlayerStats().evasion || 0) >= 0.5,
  swordwolf: () => (state.stats.swordsmanNoArmorDesertBossClearCount || 0) >= 1,
  one_spell: () => (state.stats.mageDesertBossSingleSkillClearCount || 0) >= 1,
  quatre_spell: () => (state.stats.mageDesertBossFourAttackSkillsClearCount || 0) >= 1,
  full_boost: () => (state.stats.mageDesertBossFourBuffSkillsClearCount || 0) >= 1,
  sacrifice: () => (state.stats.mageBossDefeatCount || 0) >= 10,
  four_blade_style: () => (state.stats.comboDesertBossClear_swordsman_swordsman || 0) >= 1,
  magic_swordsman: () => (state.stats.comboDesertBossClear_mage_swordsman || 0) >= 1,
  swordwolf_2: () => (state.stats.comboDesertBossClear_ninja_swordsman || 0) >= 1,
  holy_knight: () => (state.stats.comboDesertBossClear_priest_swordsman || 0) >= 1,
  quad_cast: () => (state.stats.comboDesertBossClear_mage_mage || 0) >= 1,
  ma_nin: () => (state.stats.comboDesertBossClear_mage_ninja || 0) >= 1,
  inquisitor: () => (state.stats.comboDesertBossClear_mage_priest || 0) >= 1,
  nin_nin: () => (state.stats.comboDesertBossClear_ninja_ninja || 0) >= 1,
  tsujigiri_heal: () => (state.stats.comboDesertBossClear_ninja_priest || 0) >= 1,
  true_healer: () => (state.stats.comboDesertBossClear_priest_priest || 0) >= 1,
  title_idle_60: () => state.stats.titleScreenIdleSeconds >= 60,
  back_button_fan: () => state.stats.returnButtonCount >= 100,
  clock_hobby: () => state.stats.timerClickCount >= 21,
  grassland_resident: () => (state.stats.stageRepeatCounts["1-1"] || 0) >= 100,
  silent_warrior: () => state.stats.bgmOffBattleCount >= 100,
  nobody: () => state.stats.titleCatalogOpened >= 50,
  time_nibbler: () => state.stats.timerClickCount >= 3,
  time_keeper_1: () => state.stats.timerClickCount >= 5,
  time_keeper_2: () => state.stats.timerClickCount >= 20 && state.unlockedTitles.includes("time_keeper_1"),
  time_keeper_3: () => state.stats.timerClickCount >= 60 && state.unlockedTitles.includes("time_keeper_2"),
  time_lord: () => state.stats.timerClickCount >= 120 && state.unlockedTitles.includes("time_keeper_3") && state.loop.loopCount >= 1,

  unfavored_king: () => state.runtime.buildTags.includes("unfavored_main_clear"),
  production_is_main: () => state.runtime.buildTags.includes("production_main_clear"),
  one_man_army: () => state.runtime.buildTags.includes("no_subjob_late_boss"),
  infinite_seeker: () => state.runtime.buildTags.includes("infinite_grind"),
  anti_first_trap: () => state.stats.firstTryBossWins >= 8,
  carry_beyond: () => state.stats.extremeOverweightClears >= 1,
  beyond_death: () => state.stats.totalDeaths >= 30 && state.loop.clearedGame,
  dev_unexpected: () => state.runtime.buildTags.length >= 4,

  unique_fenrir: () => state.uniqueDefeatedIds.includes("fenrir"),
  unique_jormungand: () => state.uniqueDefeatedIds.includes("jormungand"),
  unique_cerberus: () => state.uniqueDefeatedIds.includes("cerberus"),
  unique_griffon: () => state.uniqueDefeatedIds.includes("griffon"),
  unique_minotauros: () => state.uniqueDefeatedIds.includes("minotauros"),
  unique_phoenix: () => state.uniqueDefeatedIds.includes("phoenix"),
  unique_kirin: () => state.uniqueDefeatedIds.includes("kirin"),
  god_slayer: () => ["fenrir", "jormungand", "cerberus", "griffon", "minotauros", "phoenix", "kirin"].every((id) => state.uniqueDefeatedIds.includes(id))
};

const PHASE10_TITLES = [
  { id: "rare_hunter_nose", name: "レア狩りの嗅覚", category: "normal", description: "僅かな異変を嗅ぎ分ける感覚", conditionDescription: "ユニーク遭遇を1回達成", effectDescription: "ユニーク遭遇率+0.2%", effect: { uniqueEncounterRateBonus: 0.002 }, trigger: ["afterBattle", "afterUniqueKill"], requirements: [{ type: "statAtLeast", key: "uniqueEncounterCount", value: 1 }], tier: "rare", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "chain_champion_200", name: "連戦覇者", category: "cheat", description: "200連勝を達成した者", conditionDescription: "200連勝", effectDescription: "戦闘開始時ランダムバフ", effect: { randomBattleStartBuff: { durationSec: 18, power: 0.2 } }, trigger: ["afterBattle", "battleStart"], customCheckerId: "chain_champion_200", tier: "epic", canCarryOver: true, carryOverType: "direct" },
  { id: "no_damage_strider", name: "無傷の踏破者", category: "normal", description: "一度も被弾せず踏破した者", conditionDescription: "1ステージをノーダメージクリア", effectDescription: "戦闘開始から一定時間回避+20%", effect: { battleStartBuff: { speedMultiplier: 0.1, durationSec: 15 }, evadeByRegion: { grassland: 0.2, desert: 0.2, sea: 0.2, volcano: 0.2 } }, trigger: ["afterStageClear", "battleStart"], requirements: [{ type: "statAtLeast", key: "totalNoDamageStageClears", value: 1 }], tier: "rare", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "exp_seeker_1000", name: "経験の求道者", category: "normal", description: "経験を求め続けた者", conditionDescription: "累計1000戦", effectDescription: "獲得経験値+15%", effect: { expMultiplier: 0.15 }, trigger: ["afterBattle"], requirements: [{ type: "statAtLeast", key: "totalBattles", value: 1000 }], tier: "rare", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "gold_harvester_million", name: "黄金回収者", category: "normal", description: "莫大な金を集めた者", conditionDescription: "累計100万G獲得", effectDescription: "獲得GOLD+20%", effect: { goldMultiplier: 0.2 }, trigger: ["afterBattle", "afterShopTrade", "afterQuestClaim"], requirements: [{ type: "statAtLeast", key: "totalGoldLifetime", value: 1000000 }], tier: "epic", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "ailment_behemoth", name: "異常耐性の怪物", category: "normal", description: "状態異常を受け続けた怪物", conditionDescription: "毒/麻痺/火傷/出血を各50回", effectDescription: "状態異常耐性+25%", effect: { statusAilmentResist: 0.25 }, trigger: ["afterBattle", "afterDamageTaken"], customCheckerId: "ailment_behemoth", tier: "epic", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "loop_predator", name: "周回の狩人", category: "cheat", description: "周回を重ねて力を伸ばす者", conditionDescription: "3周以上かつボス初見突破10回", effectDescription: "全能力+12% / ボスダメ+18%", effect: { allStatsMultiplier: 0.12, bossDamageBonus: 0.18 }, trigger: ["afterGameClear", "afterFieldBossClear"], customCheckerId: "loop_predator", tier: "legend", canCarryOver: true, carryOverType: "direct" },
  { id: "title_combo_breaker", name: "称号コンボ破り", category: "cheat", description: "称号の組み合わせを極めた者", conditionDescription: "称号コンボを25回試す", effectDescription: "称号ON時全能力+8%", effect: { allStatsMultiplier: 0.08 }, trigger: ["afterBattle", "afterLoopStart", "afterToggleTitle"], requirements: [{ type: "statAtLeast", key: "totalTitleCombosTried", value: 25 }], tier: "epic", canCarryOver: true, carryOverType: "direct" },
  { id: "unexpected_architect", name: "運営想定外の設計者", category: "cheat", description: "想定外ビルドを組み上げた者", conditionDescription: "想定外タグを一定以上達成", effectDescription: "レア遭遇率+2% / ボスダメ+25%", effect: { uniqueEncounterRateBonus: 0.02, bossDamageBonus: 0.25 }, trigger: ["afterBattle", "afterGameClear"], customCheckerId: "unexpected_architect", tier: "legend", canCarryOver: true, carryOverType: "direct", isHidden: true },
  { id: "speed_ritualist", name: "速度儀式の実践者", category: "cheat", description: "高速状態を使いこなした者", conditionDescription: "4x以上を300秒利用", effectDescription: "倍速中EXP+12%", effect: { speedModeBonus: { expMultiplier: 0.12, minSpeed: 1.5 } }, trigger: ["timerClick", "afterBattle"], customCheckerId: "speed_ritualist", tier: "epic", canCarryOver: true, carryOverType: "direct" },
  { id: "unique_theorist", name: "ユニーク理論家", category: "normal", description: "ユニークの性質を解析した者", conditionDescription: "ユニーク種別撃破5種", effectDescription: "ユニークへの与ダメ+20%", effect: { uniqueDamageBonus: 0.2 }, trigger: ["afterUniqueKill"], requirements: [{ type: "statAtLeast", key: "totalUniqueTypesDefeated", value: 5 }], tier: "rare", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "crafted_boss_bane", name: "クラフト装備の覇者", category: "cheat", description: "自作装備でボスを屠った者", conditionDescription: "クラフト装備でボス10体撃破", effectDescription: "クラフト装備補正+25%", effect: { craftedGearBonus: 0.25 }, trigger: ["afterFieldBossClear", "afterBattle"], requirements: [{ type: "statAtLeast", key: "craftedGearBossKillCount", value: 10 }], tier: "epic", canCarryOver: true, carryOverType: "direct" },
  { id: "loop_conditional_core", name: "輪廻の中核", category: "cheat", description: "周回を重ねるほど強くなる者", conditionDescription: "2周以上で解放", effectDescription: "ループ数に応じて全能力上昇", effect: { conditionalBuffByLoop: { perLoopAllStatsMultiplier: 0.03, maxLoopBonus: 0.21 } }, trigger: ["afterLoopStart", "afterGameClear"], requirements: [{ type: "loopAtLeast", value: 2 }], tier: "legend", canCarryOver: true, carryOverType: "direct" },
  { id: "low_tier_emperor", name: "不遇職帝", category: "cheat", description: "最下位職で連続クリアした帝王", conditionDescription: "不遇職クリア2回", effectDescription: "不遇職時全能力+22%", effect: { lowTierJobBonus: 0.22 }, trigger: ["afterGameClear"], requirements: [{ type: "statAtLeast", key: "loopClearWithLowTierJob", value: 2 }], tier: "legend", canCarryOver: true, carryOverType: "direct", isHidden: true }
];

TITLE_DATA.push(...PHASE10_TITLES);

const PHASE12_LOOP_TITLES = [
  { id: "reborn_traveler", name: "再誕の旅人", category: "cheat", description: "新たな輪廻へ踏み出した旅人", conditionDescription: "2周目到達", effectDescription: "周回開始時の基礎能力+8%", effect: { allStatsMultiplier: 0.08 }, trigger: ["afterLoopStart"], requirements: [{ type: "loopAtLeast", value: 1 }], tier: "rare", canCarryOver: true, carryOverType: "direct" },
  { id: "second_cycle_conqueror", name: "二巡目の覇者", category: "cheat", description: "二巡目を制した者", conditionDescription: "2周目クリア", effectDescription: "EXP+10% / GOLD+10%", effect: { expMultiplier: 0.1, goldMultiplier: 0.1 }, trigger: ["afterGameClear"], customCheckerId: "second_cycle_conqueror", tier: "epic", canCarryOver: true, carryOverType: "direct" },
  { id: "third_cycle_heretic", name: "三巡目の異端", category: "cheat", description: "三巡目に至った異端者", conditionDescription: "3周目到達", effectDescription: "称号上限強化の土台", effect: { titleLimitBonus: 1 }, trigger: ["afterLoopStart"], requirements: [{ type: "loopAtLeast", value: 2 }], tier: "epic", canCarryOver: true, carryOverType: "direct" },
  { id: "loop_seeker", name: "周回の求道者", category: "cheat", description: "周回と複合攻略を重ねる者", conditionDescription: "3周以上 + 強化ボス2体撃破", effectDescription: "倍速中EXP+8% / ボスダメ+8%", effect: { speedModeBonus: { expMultiplier: 0.08, minSpeed: 1.5 }, bossDamageBonus: 0.08 }, trigger: ["afterEnhancedBossClear", "afterLoopStart"], customCheckerId: "loop_seeker", tier: "epic", canCarryOver: true, carryOverType: "direct" },
  { id: "deep_strider", name: "深層踏破者", category: "cheat", description: "高難易度の深層を越えた者", conditionDescription: "高難易度ステージを初回クリア", effectDescription: "ボスダメージ+12%", effect: { bossDamageBonus: 0.12 }, trigger: ["afterSpecialChallengeClear"], requirements: [{ type: "statAtLeast", key: "highDifficultyStageClearCount", value: 1 }], tier: "rare", canCarryOver: true, carryOverType: "direct" },
  { id: "reborn_slayer", name: "再臨殺し", category: "cheat", description: "再臨ボス狩りの達人", conditionDescription: "強化版ボスを3体撃破", effectDescription: "強化ボスへの与ダメ+20%", effect: { damageToBoss: 0.2 }, trigger: ["afterEnhancedBossClear"], requirements: [{ type: "statAtLeast", key: "enhancedBossKillCount", value: 3 }], tier: "legend", canCarryOver: true, carryOverType: "direct" },
  { id: "endless_adventurer", name: "終わりなき冒険者", category: "cheat", description: "周回を重ね続ける者", conditionDescription: "4周到達", effectDescription: "周回開始時恩恵+ titleLimit拡張土台", effect: { allStatsMultiplier: 0.1, titleLimitBonus: 1 }, trigger: ["afterLoopStart"], requirements: [{ type: "loopAtLeast", value: 4 }], tier: "legend", canCarryOver: true, carryOverType: "direct", isHidden: true },
  { id: "broken_equilibrium", name: "壊れた均衡", category: "cheat", description: "高難易度で想定外ビルドを成立させた者", conditionDescription: "高難易度勝利 + 想定外タグ4種以上", effectDescription: "全能力+12% / レア遭遇率+1%", effect: { allStatsMultiplier: 0.12, uniqueEncounterRateBonus: 0.01 }, trigger: ["afterEnhancedBossClear", "afterSpecialChallengeClear"], customCheckerId: "broken_equilibrium", tier: "legend", canCarryOver: true, carryOverType: "direct", isHidden: true }
];

TITLE_DATA.push(...PHASE12_LOOP_TITLES);

Object.assign(TITLE_CHECKERS, {
  rare_hunter_nose: () => (state.stats.uniqueEncounterCount || 0) >= 1,
  no_damage_strider: () => (state.stats.totalNoDamageStageClears || 0) >= 1,
  exp_seeker_1000: () => (state.stats.totalBattles || 0) >= 1000,
  gold_harvester_million: () => (state.stats.totalGoldLifetime || 0) >= 1000000,
  chain_champion_200: () => (state.stats.totalConsecutiveWinsBest || 0) >= 200,
  unique_theorist: () => (state.stats.totalUniqueTypesDefeated || 0) >= 5,
  crafted_boss_bane: () => (state.stats.craftedGearBossKillCount || 0) >= 10,
  title_combo_breaker: () => (state.stats.totalTitleCombosTried || 0) >= 25,
  loop_conditional_core: () => state.loop.loopCount >= 2,
  low_tier_emperor: () => (state.stats.loopClearWithLowTierJob || 0) >= 2,
  dev_unexpected: () => evaluateExploitTags().length >= 4,
  reborn_traveler: () => state.loop.loopCount >= 1,
  second_cycle_conqueror: () => state.loop.loopCount >= 1 && state.loop.clearedGame,
  third_cycle_heretic: () => state.loop.loopCount >= 2,
  loop_seeker: () => state.loop.loopCount >= 3 && (state.stats.enhancedBossKillCount || 0) >= 2,
  deep_strider: () => (state.stats.highDifficultyStageClearCount || 0) >= 1,
  reborn_slayer: () => (state.stats.enhancedBossKillCount || 0) >= 3,
  endless_adventurer: () => state.loop.loopCount >= 4,
  broken_equilibrium: () => (state.stats.highDifficultyStageClearCount || 0) >= 1 && evaluateExploitTags().length >= 4
});

const PHASE13_EXTRA_CHEAT_TITLES = [
  {
    id: "adversity_breaker",
    name: "逆境踏破者",
    category: "cheat",
    description: "危険域で強くなる中堅チート称号",
    conditionDescription: "HP30%以下でボス撃破10回",
    effectDescription: "HP50%以下で与ダメ+12% / 被ダメ-8%",
    effect: { lowHpConditionalCombat: { hpThreshold: 0.5, attackMultiplier: 0.12, damageReduction: 0.08 } },
    trigger: ["afterFieldBossClear", "afterBattle"],
    customCheckerId: "adversity_breaker",
    tier: "epic",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "long_run_maintainer",
    name: "連戦整備士",
    category: "cheat",
    description: "長期連戦に最適化した整備者",
    conditionDescription: "帰還せず150連勝",
    effectDescription: "自然回復+6%/分 / 戦闘開始時防御+8%(15秒)",
    effect: { stageRegenPerMinute: 0.06, battleStartBuff: { defenseMultiplier: 0.08, durationSec: 15 } },
    trigger: ["afterBattle"],
    customCheckerId: "long_run_maintainer",
    tier: "epic",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "abyss_observer",
    name: "深淵観測者",
    category: "cheat",
    description: "海の異常環境を観測し尽くした者",
    conditionDescription: "海で特殊敵を一定数撃破",
    effectDescription: "感電/麻痺/拘束耐性+20% / 海で与ダメ+10%",
    effect: { statusResistByType: { shock: 0.2, paralyze: 0.2, bind: 0.2 }, regionDamageBonus: { sea: 0.1 } },
    trigger: ["afterKill", "afterBattle"],
    customCheckerId: "abyss_observer",
    tier: "epic",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "lava_conqueror_spirit",
    name: "溶岩越えの覇気",
    category: "cheat",
    description: "火傷を押し切って前進する覇気",
    conditionDescription: "火山で火傷状態のまま50勝",
    effectDescription: "火傷耐性+25% / 火傷中も攻撃+10%",
    effect: { statusResistByType: { burn: 0.25 }, burnConditionalAttackMultiplier: 0.1, ignoreBurnAttackPenalty: true },
    trigger: ["afterBattle", "afterKill"],
    customCheckerId: "lava_conqueror_spirit",
    tier: "legend",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "dual_slot_ruler",
    name: "双枠の支配者",
    category: "cheat",
    description: "ノーマル枠運用を極めた支配者",
    conditionDescription: "ノーマル称号を上限装備状態で100勝",
    effectDescription: "装備中ノーマル称号1つにつき攻撃/防御+3%(最大15%)",
    effect: { perNormalEquippedAttackDefenseBonus: 0.03, perNormalEquippedAttackDefenseBonusCap: 0.15 },
    trigger: ["afterBattle", "afterKill"],
    customCheckerId: "dual_slot_ruler",
    tier: "legend",
    canCarryOver: true,
    carryOverType: "direct"
  }
];

const PHASE13_EXTRA_NORMAL_TITLES = [
  { id: "desert_sand_veteran", name: "砂塵慣れの者", category: "normal", description: "砂塵環境に慣れた戦士", conditionDescription: "砂漠で100勝", effectDescription: "砂漠で命中+4% / 毒耐性+8%", effect: { regionAccuracyBonus: { desert: 0.04 }, statusResistByType: { poison: 0.08 } }, trigger: ["afterBattle"], customCheckerId: "desert_sand_veteran", tier: "rare", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "drought_resister", name: "乾きに抗う者", category: "normal", description: "休まず砂漠を越える者", conditionDescription: "砂漠で休憩なし3ステージ突破", effectDescription: "砂漠で自然回復+4%/分 / 防御+3%", effect: { regionStageRegenPerMinute: { desert: 0.04 }, regionStatMultiplier: { desert: { defense: 1.03 } } }, trigger: ["afterStageClear"], customCheckerId: "drought_resister", tier: "rare", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "sea_roar_savant", name: "海鳴りの理解者", category: "normal", description: "潮流と雷鳴を読み切る者", conditionDescription: "海で100勝", effectDescription: "感電耐性+10% / 海で被ダメ-5%", effect: { statusResistByType: { shock: 0.1 }, regionDamageReduction: { sea: 0.05 } }, trigger: ["afterBattle"], customCheckerId: "sea_roar_savant", tier: "rare", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "azure_flow_step", name: "蒼流の歩法", category: "normal", description: "海流に合わせて躱す歩法", conditionDescription: "海で回避50回成功", effectDescription: "海で回避+4% / 速度+3%", effect: { evadeByRegion: { sea: 0.04 }, regionStatMultiplier: { sea: { speed: 1.03 } } }, trigger: ["afterBattle", "afterMiss"], customCheckerId: "azure_flow_step", tier: "rare", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "heat_adaptor", name: "灼熱順応者", category: "normal", description: "灼熱域へ順応した冒険者", conditionDescription: "火山で100勝", effectDescription: "火傷耐性+10% / 火山で最大HP+5%", effect: { statusResistByType: { burn: 0.1 }, regionStatMultiplier: { volcano: { maxHp: 1.05 } } }, trigger: ["afterBattle"], customCheckerId: "heat_adaptor", tier: "rare", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "flame_wall_knowhow", name: "炎壁の心得", category: "normal", description: "防御術式を積み上げた心得", conditionDescription: "火山で防御系スキル100回", effectDescription: "火山で被ダメ-5% / 火属性耐性+8%", effect: { regionDamageReduction: { volcano: 0.05 }, statusResistByType: { burn: 0.08 } }, trigger: ["afterBattle", "afterSpellUse"], customCheckerId: "flame_wall_knowhow", tier: "rare", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "blade_stack", name: "刃の積み重ね", category: "normal", description: "鍛え続けた刃の記録", conditionDescription: "武器強化30回", effectDescription: "武器強化値1ごとに攻撃+0.8%(最大8%)", effect: { weaponEnhanceAttackPerLevel: 0.008, weaponEnhanceAttackMax: 0.08 }, trigger: ["afterEnhance"], customCheckerId: "blade_stack", tier: "rare", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "guard_stack", name: "守りの積み重ね", category: "normal", description: "守具を磨き続けた証", conditionDescription: "防具強化30回", effectDescription: "防具強化値1ごとに防御+0.8%(最大8%)", effect: { armorEnhanceDefensePerLevel: 0.008, armorEnhanceDefenseMax: 0.08 }, trigger: ["afterEnhance"], customCheckerId: "guard_stack", tier: "rare", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "artisan_judgement", name: "職人の見極め", category: "normal", description: "品質の差を見抜く目", conditionDescription: "高品質装備10個", effectDescription: "装備品質補正+10%", effect: { equipmentQualityEffectBonus: 0.1 }, trigger: ["afterCraft"], customCheckerId: "artisan_judgement", tier: "rare", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "lightweight_tactician", name: "軽量戦術家", category: "normal", description: "軽装で戦場を制御する者", conditionDescription: "重量50%未満で200勝", effectDescription: "重量50%未満で速度+8% / 回避+5%", effect: { weightConditionalBonuses: { light: { thresholdRatio: 0.5, speedMultiplier: 0.08, evasionBonus: 0.05 } } }, trigger: ["afterBattle"], customCheckerId: "lightweight_tactician", tier: "epic", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "heavy_frontline", name: "重装戦線", category: "normal", description: "重装で前線を維持する者", conditionDescription: "重量80%以上で100勝", effectDescription: "重量80%以上で防御+10% / 被ダメ-4%", effect: { weightConditionalBonuses: { heavy: { thresholdRatio: 0.8, defenseMultiplier: 0.1, damageReduction: 0.04 } } }, trigger: ["afterBattle"], customCheckerId: "heavy_frontline", tier: "epic", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "healing_afterglow", name: "癒しの余波", category: "normal", description: "過剰回復を戦術へ変える者", conditionDescription: "HP満タン回復50回", effectDescription: "過剰回復変換率+10%", effect: { overhealConversionBonus: 0.1 }, trigger: ["afterHealSkillUse", "afterBattle"], customCheckerId: "healing_afterglow", tier: "epic", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "prayer_bastion", name: "祈りの防壁", category: "normal", description: "祈りで防壁を築く聖職者", conditionDescription: "過剰回復防壁で5000吸収", effectDescription: "過剰回復発生中、防御+8%", effect: { overhealActiveDefenseMultiplier: 0.08 }, trigger: ["afterBattle", "afterHealSkillUse"], customCheckerId: "prayer_bastion", tier: "epic", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "spell_linker", name: "術式連結者", category: "normal", description: "術式の連結を極めた者", conditionDescription: "魔法で200回トドメ", effectDescription: "スキル回転率+5% / MP消費-4%", effect: { skillCooldownRecovery: 0.05, mpCostReduction: 0.04 }, trigger: ["afterBattle", "afterKill"], customCheckerId: "spell_linker", tier: "epic", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "shadow_critical_edge", name: "影差す急所", category: "normal", description: "急所を重ねる狩人", conditionDescription: "会心トドメ100回", effectDescription: "会心率+5% / 会心ダメージ+8%", effect: { critRateBonus: 0.05, critDamageBonus: 0.08 }, trigger: ["afterBattle", "afterKill"], customCheckerId: "shadow_critical_edge", tier: "epic", canCarryOver: false, carryOverType: "recordOnly" }
];

TITLE_DATA.push(...PHASE13_EXTRA_CHEAT_TITLES, ...PHASE13_EXTRA_NORMAL_TITLES);

Object.assign(TITLE_CHECKERS, {
  adversity_breaker: () => (state.stats.lowHpBossKillCount || 0) >= 10,
  long_run_maintainer: () => (state.stats.currentWinStreak || 0) >= 150,
  abyss_observer: () => (state.stats.seaSpecialEnemyKillCount || 0) >= 90,
  lava_conqueror_spirit: () => (state.stats.volcanoBurnWinCount || 0) >= 50,
  dual_slot_ruler: () => (state.stats.normalSlotsFullBattleWins || 0) >= 100,
  desert_sand_veteran: () => (state.stats.winsByRegion?.desert || 0) >= 100,
  drought_resister: () => (state.stats.desertNoRestStageClearStreak || 0) >= 3,
  sea_roar_savant: () => (state.stats.winsByRegion?.sea || 0) >= 100,
  azure_flow_step: () => (state.stats.seaEvadeSuccessCount || 0) >= 50,
  heat_adaptor: () => (state.stats.winsByRegion?.volcano || 0) >= 100,
  flame_wall_knowhow: () => (state.stats.volcanoDefenseSkillUseCount || 0) >= 100,
  blade_stack: () => (state.stats.weaponEnhanceCount || 0) >= 30,
  guard_stack: () => (state.stats.armorEnhanceCount || 0) >= 30,
  artisan_judgement: () => ((state.stats.craftHighQualityCount || 0) + (state.stats.craftGodQualityCount || 0)) >= 10,
  lightweight_tactician: () => (state.stats.lightWeightWinCount || 0) >= 200,
  heavy_frontline: () => (state.stats.heavyWeightWinCount || 0) >= 100,
  healing_afterglow: () => (state.stats.fullHpHealCastCount || 0) >= 50,
  prayer_bastion: () => (state.stats.overhealConvertedTotal || 0) >= 5000,
  spell_linker: () => (state.stats.magicFinishCount || 0) >= 200,
  shadow_critical_edge: () => (state.stats.critFinishCountAll || 0) >= 100
});

const PHASE14_SPECIAL_CHEAT_TITLES = [
  {
    id: "pilgrim_no_return",
    name: "帰らぬ巡礼者",
    category: "cheat",
    description: "帰還せず進み続けた巡礼者",
    conditionDescription: "帰還なしで草原/砂漠/海を各1ステージ突破",
    effectDescription: "連戦中 与ダメ+12% / 被ダメ-10% / 自然回復+5%/分",
    effect: { noReturnCombatBonus: { attackMultiplier: 0.12, damageReduction: 0.1, stageRegenPerMinute: 0.05 } },
    trigger: ["afterStageClear", "afterBattle"],
    customCheckerId: "pilgrim_no_return",
    tier: "legend",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "stack_aesthetics",
    name: "積みの美学",
    category: "cheat",
    description: "重装と称号を積み上げた者",
    conditionDescription: "ノーマル上限装備かつ重量80%以上で100勝",
    effectDescription: "装備称号1つごとに攻撃/防御+4%(最大20%)",
    effect: { perEquippedAttackDefenseBonus: 0.04, perEquippedAttackDefenseBonusCap: 0.2 },
    trigger: ["afterBattle", "afterKill"],
    customCheckerId: "stack_aesthetics",
    tier: "legend",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "blank_slot_master",
    name: "空欄の達人",
    category: "cheat",
    description: "不完全な構成を極めた達人",
    conditionDescription: "スキル枠を1つ空けてボス20体撃破",
    effectDescription: "スキル枠不足時 スキル威力+20% / 回転率+10%",
    effect: { skillPowerIfSkillSlotOpen: 0.2, skillCooldownRecoveryIfSkillSlotOpen: 0.1 },
    trigger: ["afterFieldBossClear", "afterBattle"],
    customCheckerId: "blank_slot_master",
    tier: "legend",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "reckless_observer",
    name: "命知らずの観測者",
    category: "cheat",
    description: "神話級の観測を続ける者",
    conditionDescription: "ユニーク10遭遇 + 逃走せず完走1回以上",
    effectDescription: "ユニーク与ダメ+25% / 回避+8% / 遭遇率微増",
    effect: { damageToUnique: 0.25, uniqueEncounterRateBonus: 0.002, evadeByRegion: { grassland: 0.08, desert: 0.08, sea: 0.08, volcano: 0.08, final: 0.08 } },
    trigger: ["afterBattle", "afterUniqueKill"],
    customCheckerId: "reckless_observer",
    tier: "legend",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "dev_cry",
    name: "運営泣かせ",
    category: "cheat",
    description: "想定外育成を完走した者",
    conditionDescription: "不遇職系称号装備 + 生産高段階 + 高難易度ボス撃破",
    effectDescription: "不遇職補正+20% / 生産装備+25% / ボス与ダメ+15%",
    effect: { lowTierJobBonus: 0.2, craftedGearBonus: 0.25, bossDamageBonus: 0.15 },
    trigger: ["afterSpecialChallengeClear", "afterEnhancedBossClear", "afterGameClear", "afterToggleTitle"],
    customCheckerId: "dev_cry",
    tier: "legend",
    canCarryOver: true,
    carryOverType: "direct",
    isHidden: true
  }
];

TITLE_DATA.push(...PHASE14_SPECIAL_CHEAT_TITLES);

Object.assign(TITLE_CHECKERS, {
  pilgrim_no_return: () => {
    const flags = state.stats.noReturnRegionClears || {};
    return !!state.stats.noReturnExpeditionActive && !!flags.grassland && !!flags.desert && !!flags.sea;
  },
  stack_aesthetics: () => (state.stats.fullNormalHeavyWinCount || 0) >= 100,
  blank_slot_master: () => (state.stats.bossKillWithEmptySkillSlots || 0) >= 20,
  reckless_observer: () => (state.stats.uniqueEncounterCount || 0) >= 10 && (state.stats.uniqueNoRetreatResolveCount || 0) >= 1,
  dev_cry: () => {
    const underdogEquipped = ["unfavored_king", "low_tier_emperor"].some((id) => (state.activeTitles || []).includes(id));
    const prodOk = (state.player.productionJobStage || 0) >= 4 || (state.player.productionJobLevel || 0) >= 120;
    const highBossOk = (state.stats.enhancedBossKillCount || 0) >= 1 || (state.stats.loopChallengeClearCount || 0) >= 1;
    return underdogEquipped && prodOk && highBossOk;
  }
});

const PHASE15_TITLE_EXPANSION_CHEAT = [
  {
    id: "basic_master",
    name: "基本の達人",
    category: "cheat",
    description: "草原連勝で基礎を極めた者",
    conditionDescription: "草原で100連勝",
    effectDescription: "スキルダメージがまあまあ上昇",
    effect: { skillDamageMultiplier: 0.12 },
    trigger: ["afterBattle"],
    customCheckerId: "basic_master",
    tier: "epic",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "basic_god",
    name: "基本の神",
    category: "cheat",
    description: "草原連勝を神域まで積み上げた者",
    conditionDescription: "草原で1000連勝",
    effectDescription: "スキルダメージが結構上昇",
    effect: { skillDamageMultiplier: 0.24 },
    trigger: ["afterBattle"],
    customCheckerId: "basic_god",
    tier: "legend",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "single_blade_master",
    name: "一刀流の達人",
    category: "cheat",
    description: "一刀運用でボスを斬り伏せた剣士",
    conditionDescription: "剣士系で武器1枠のみ装備してボス撃破",
    effectDescription: "剣士系スキルダメージ上昇",
    effect: { swordsmanSkillDamageMultiplier: 0.18 },
    trigger: ["afterFieldBossClear"],
    customCheckerId: "single_blade_master",
    tier: "epic",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "dual_cast",
    name: "二重詠唱",
    category: "cheat",
    description: "二本運用で詠唱を重ねた魔術師",
    conditionDescription: "魔術師系で武器2枠装備してボス撃破",
    effectDescription: "魔術スキルダメージ上昇",
    effect: { mageSkillDamageMultiplier: 0.2 },
    trigger: ["afterFieldBossClear"],
    customCheckerId: "dual_cast",
    tier: "epic",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "tool_master",
    name: "道具の達人",
    category: "cheat",
    description: "武器なしで弱体を積み重ねる忍",
    conditionDescription: "忍者系で武器なしデバフ付与100回",
    effectDescription: "デバフ付与時に与ダメ上昇(3% x 3)",
    effect: {},
    trigger: ["afterBattle", "afterKill"],
    customCheckerId: "tool_master",
    tier: "legend",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "stealth_master",
    name: "隠密の達人",
    category: "cheat",
    description: "無手でボスを落とした隠密",
    conditionDescription: "忍者系で武器なしボス撃破",
    effectDescription: "回避率+25%",
    effect: { evadeByRegion: { grassland: 0.25, desert: 0.25, sea: 0.25, volcano: 0.25, final: 0.25 } },
    trigger: ["afterFieldBossClear"],
    customCheckerId: "stealth_master",
    tier: "legend",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "nonstealth_ninja",
    name: "忍ばない忍者",
    category: "cheat",
    description: "回避を捨てて殴り合いを選んだ忍",
    conditionDescription: "忍者系で回避10%以下の状態でボス敗北",
    effectDescription: "回避10%以下時 被ダメ軽減 + 与ダメ上昇",
    effect: { ninjaLowEvasionConditional: { threshold: 0.1, attackMultiplier: 0.12, damageReduction: 0.1 } },
    trigger: ["afterDefeat"],
    customCheckerId: "nonstealth_ninja",
    tier: "legend",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "wannabe_ninja",
    name: "忍びたい忍者",
    category: "cheat",
    description: "草原で何度も鍛え直した未熟な忍",
    conditionDescription: "忍者系で1-1に100回敗北",
    effectDescription: "回避率+15%",
    effect: { evadeByRegion: { grassland: 0.15, desert: 0.15, sea: 0.15, volcano: 0.15, final: 0.15 } },
    trigger: ["afterDefeat"],
    customCheckerId: "wannabe_ninja",
    tier: "epic",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "merciless_ninja",
    name: "容赦ない忍者",
    category: "cheat",
    description: "草原で弱体を刻み続けた忍",
    conditionDescription: "忍者系で草原デバフ付与100回",
    effectDescription: "デバフ付与時に与ダメ上昇(2% x 3)",
    effect: {},
    trigger: ["afterBattle", "afterKill"],
    customCheckerId: "merciless_ninja",
    tier: "epic",
    canCarryOver: true,
    carryOverType: "direct"
  }
];

const PHASE15_TITLE_EXPANSION_NORMAL = [
  {
    id: "physical_cleric",
    name: "物理型僧侶",
    category: "normal",
    description: "祈らず殴る僧侶の流派",
    conditionDescription: "僧侶系でスキル未セットのまま100体撃破",
    effectDescription: "僧侶の非回復スキルダメージ上昇",
    effect: { priestNonHealSkillDamageMultiplier: 0.08 },
    trigger: ["afterKill", "afterBattle"],
    customCheckerId: "physical_cleric",
    tier: "rare",
    canCarryOver: false,
    carryOverType: "recordOnly"
  },
  {
    id: "cold_priest",
    name: "冷徹な僧侶",
    category: "normal",
    description: "癒しを捨てた実戦派僧侶",
    conditionDescription: "僧侶系で回復スキル未装備で50勝",
    effectDescription: "攻撃スキルダメージ上昇",
    effect: { priestOffensiveSkillDamageMultiplier: 0.06 },
    trigger: ["afterBattle", "afterKill"],
    customCheckerId: "cold_priest",
    tier: "rare",
    canCarryOver: false,
    carryOverType: "recordOnly"
  },
  {
    id: "radical_priest",
    name: "過激な僧侶",
    category: "normal",
    description: "攻撃術だけで進軍する僧侶",
    conditionDescription: "僧侶系で攻撃スキルのみ装備で50勝",
    effectDescription: "攻撃スキルダメージ上昇",
    effect: { priestOffensiveSkillDamageMultiplier: 0.08 },
    trigger: ["afterBattle", "afterKill"],
    customCheckerId: "radical_priest",
    tier: "epic",
    canCarryOver: false,
    carryOverType: "recordOnly"
  }
];

TITLE_DATA.push(...PHASE15_TITLE_EXPANSION_CHEAT, ...PHASE15_TITLE_EXPANSION_NORMAL);

Object.assign(TITLE_CHECKERS, {
  basic_master: () => (state.stats.grasslandWinStreakBest || 0) >= 100,
  basic_god: () => (state.stats.grasslandWinStreakBest || 0) >= 1000,
  single_blade_master: () => (state.stats.swordsmanSingleWeaponBossKillCount || 0) >= 1,
  dual_cast: () => (state.stats.mageDualWeaponBossKillCount || 0) >= 1,
  tool_master: () => (state.stats.ninjaNoWeaponDebuffApplyCount || 0) >= 100,
  stealth_master: () => (state.stats.ninjaNoWeaponBossKillCount || 0) >= 1,
  nonstealth_ninja: () => (state.stats.ninjaLowEvasionBossDefeatCount || 0) >= 1,
  wannabe_ninja: () => (state.stats.ninjaStage11DefeatCount || 0) >= 100,
  merciless_ninja: () => (state.stats.ninjaGrasslandDebuffApplyCount || 0) >= 100,
  physical_cleric: () => (state.stats.priestNoSkillKillCount || 0) >= 100,
  cold_priest: () => (state.stats.priestNoHealWinCount || 0) >= 50,
  radical_priest: () => (state.stats.priestOnlyOffenseWinCount || 0) >= 50
});

const PHASE16_MIDGAME_SERIES_NORMAL = [
  {
    id: "sandsea_conqueror",
    name: "砂海突破者",
    category: "normal",
    description: "砂漠の壁を越えた中盤の実力者",
    conditionDescription: "砂漠の地域突破ボスを撃破",
    effectDescription: "攻撃+10% / 防御+10% / 毒耐性+15%",
    effect: { attackMultiplier: 0.1, defenseMultiplier: 0.1, statusResistByType: { poison: 0.15 } },
    trigger: ["afterFieldBossClear"],
    customCheckerId: "sandsea_conqueror",
    tier: "epic",
    canCarryOver: false,
    carryOverType: "recordOnly"
  },
  {
    id: "sea_route_breaker",
    name: "海域踏破者",
    category: "normal",
    description: "海の重圧を押し切った踏破者",
    conditionDescription: "海マップ3-10のフィールドボスを撃破",
    effectDescription: "最大HP+12% / 感電・麻痺耐性+15%",
    effect: { regionStatMultiplier: { grassland: { maxHp: 1.12 }, desert: { maxHp: 1.12 }, sea: { maxHp: 1.12 }, volcano: { maxHp: 1.12 }, final: { maxHp: 1.12 } }, statusResistByType: { shock: 0.15, paralyze: 0.15 } },
    trigger: ["afterFieldBossClear"],
    customCheckerId: "sea_route_breaker",
    tier: "epic",
    canCarryOver: false,
    carryOverType: "recordOnly"
  },
  {
    id: "veteran_adventurer_300",
    name: "百戦の冒険者",
    category: "normal",
    description: "実戦経験を積み重ねた熟練者",
    conditionDescription: "累計300勝",
    effectDescription: "経験値+10% / GOLD+10%",
    effect: { expMultiplier: 0.1, goldMultiplier: 0.1 },
    trigger: ["afterBattle"],
    customCheckerId: "veteran_adventurer_300",
    tier: "rare",
    canCarryOver: false,
    carryOverType: "recordOnly"
  },
  {
    id: "enhance_habituated",
    name: "強化慣れ",
    category: "normal",
    description: "強化工程に慣れた装備育成者",
    conditionDescription: "装備を累計30回強化",
    effectDescription: "強化成功率+12%",
    effect: { enhanceSuccessBonus: 0.12 },
    trigger: ["afterEnhance"],
    customCheckerId: "enhance_habituated",
    tier: "rare",
    canCarryOver: false,
    carryOverType: "recordOnly"
  },
  {
    id: "workshop_proven",
    name: "工房の実力者",
    category: "normal",
    description: "工房で結果を出し続ける実務家",
    conditionDescription: "生産職レベル50到達",
    effectDescription: "生産成功率+10% / 高品質率+8%",
    effect: { craftSuccessBonus: 0.1, qualityStepUpChance: 0.08 },
    trigger: ["afterProductionExp", "afterCraft"],
    customCheckerId: "workshop_proven",
    tier: "rare",
    canCarryOver: false,
    carryOverType: "recordOnly"
  },
  {
    id: "first_sight_overcome",
    name: "初見越え",
    category: "normal",
    description: "草原と砂漠の初見殺しを越えた者",
    conditionDescription: "草原・砂漠ボスを撃破",
    effectDescription: "ボスへの与ダメージ+15%",
    effect: { damageToBoss: 0.15 },
    trigger: ["afterFieldBossClear"],
    customCheckerId: "first_sight_overcome",
    tier: "epic",
    canCarryOver: false,
    carryOverType: "recordOnly"
  },
  {
    id: "prayer_adept",
    name: "祈りの熟練者",
    category: "normal",
    description: "回復運用を極めた癒し手",
    conditionDescription: "回復スキルを300回使用",
    effectDescription: "回復量+12% / 過剰回復変換率+10%",
    effect: { healMultiplier: 0.12, overhealConversionBonus: 0.1 },
    trigger: ["afterHealSkillUse", "afterBattle"],
    customCheckerId: "prayer_adept",
    tier: "epic",
    canCarryOver: false,
    carryOverType: "recordOnly"
  },
  {
    id: "formula_controller",
    name: "術式制御者",
    category: "normal",
    description: "魔力運用を安定化させた術者",
    conditionDescription: "魔法スキルを500回使用",
    effectDescription: "MP消費-8% / スキル威力+10%",
    effect: { mpCostReduction: 0.08, mageSkillDamageMultiplier: 0.1 },
    trigger: ["afterSpellUse", "afterBattle"],
    customCheckerId: "formula_controller",
    tier: "epic",
    canCarryOver: false,
    carryOverType: "recordOnly"
  },
  {
    id: "vital_spot_knower",
    name: "急所を知る者",
    category: "normal",
    description: "会心で仕留める精度を得た者",
    conditionDescription: "会心で50回トドメ",
    effectDescription: "会心率+8% / 会心ダメージ+10%",
    effect: { critRateBonus: 0.08, critDamageBonus: 0.1 },
    trigger: ["afterKill", "afterBattle"],
    customCheckerId: "vital_spot_knower",
    tier: "epic",
    canCarryOver: false,
    carryOverType: "recordOnly"
  },
  {
    id: "guild_journey_veteran",
    name: "依頼の熟練者",
    category: "normal",
    description: "依頼導線を回し続ける冒険者",
    conditionDescription: "ギルド依頼を30回達成",
    effectDescription: "ギルドポイント+15% / GOLD+10%",
    effect: { guildPointMultiplier: 0.15, goldMultiplier: 0.1 },
    trigger: ["afterQuestClaim"],
    customCheckerId: "guild_journey_veteran",
    tier: "rare",
    canCarryOver: false,
    carryOverType: "recordOnly"
  },
  {
    id: "town_crossing",
    name: "町を渡る者",
    category: "normal",
    description: "複数地域を巡って経験を積んだ者",
    conditionDescription: "草原・砂漠・海の町をすべて解放",
    effectDescription: "全能力+6%",
    effect: { allStatsMultiplier: 0.06 },
    trigger: ["afterFieldBossClear", "townVisit"],
    customCheckerId: "town_crossing",
    tier: "rare",
    canCarryOver: false,
    carryOverType: "recordOnly"
  },
  {
    id: "dual_path_scholar",
    name: "双系統の理解者",
    category: "normal",
    description: "戦闘と生産を両立した理解者",
    conditionDescription: "戦闘ジョブLv50かつ生産ジョブLv50",
    effectDescription: "戦闘時全能力+6% / 生産経験値+10%",
    effect: { allStatsMultiplier: 0.06, productionExpRateBonus: 0.1 },
    trigger: ["afterLevelUp", "afterProductionExp"],
    customCheckerId: "dual_path_scholar",
    tier: "epic",
    canCarryOver: false,
    carryOverType: "recordOnly"
  },
  {
    id: "wall_breaker_mid",
    name: "壁を越える者",
    category: "normal",
    description: "砂漠突破後に海で鍛え上げた者",
    conditionDescription: "砂漠ボス撃破後、海マップで50勝",
    effectDescription: "ボス与ダメ+10% / 回避+6% / 防御+6%",
    effect: { damageToBoss: 0.1, defenseMultiplier: 0.06, evadeByRegion: { grassland: 0.06, desert: 0.06, sea: 0.06, volcano: 0.06, final: 0.06 } },
    trigger: ["afterBattle", "afterFieldBossClear"],
    customCheckerId: "wall_breaker_mid",
    tier: "epic",
    canCarryOver: false,
    carryOverType: "recordOnly"
  },
  {
    id: "workshop_operator",
    name: "工房実務者",
    category: "normal",
    description: "工房稼働を継続して実務を回す者",
    conditionDescription: "生産を合計200回行う",
    effectDescription: "生産成功率+10% / 高品質率+8%",
    effect: { craftSuccessBonus: 0.1, qualityStepUpChance: 0.08 },
    trigger: ["afterCraft"],
    customCheckerId: "workshop_operator",
    tier: "rare",
    canCarryOver: false,
    carryOverType: "recordOnly"
  },
  {
    id: "regional_local",
    name: "地域馴染み",
    category: "normal",
    description: "複数地域の戦場に適応した者",
    conditionDescription: "草原・砂漠・海でそれぞれ100勝",
    effectDescription: "全能力+8%",
    effect: { allStatsMultiplier: 0.08 },
    trigger: ["afterBattle"],
    customCheckerId: "regional_local",
    tier: "epic",
    canCarryOver: false,
    carryOverType: "recordOnly"
  },
  {
    id: "money_craft_mid",
    name: "稼ぎの心得",
    category: "normal",
    description: "中盤金策の要点を掴んだ者",
    conditionDescription: "累計20万GOLD獲得",
    effectDescription: "獲得GOLD+15%",
    effect: { goldMultiplier: 0.15 },
    trigger: ["afterBattle", "afterQuestClaim", "afterShopTrade"],
    customCheckerId: "money_craft_mid",
    tier: "rare",
    canCarryOver: false,
    carryOverType: "recordOnly"
  }
];

const PHASE16_MIDGAME_SERIES_CHEAT = [
  {
    id: "chain_breaker_50",
    name: "連戦突破者",
    category: "cheat",
    description: "帰還せず連戦を突破した強行者",
    conditionDescription: "帰還せずに50連勝",
    effectDescription: "連戦中 攻撃+10% / 自然回復+5%/分",
    effect: { noReturnCombatBonus: { attackMultiplier: 0.1, stageRegenPerMinute: 0.05 } },
    trigger: ["afterBattle"],
    customCheckerId: "chain_breaker_50",
    tier: "epic",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "unyielding_survivor",
    name: "不屈の生還者",
    category: "cheat",
    description: "逆境から勝ちを重ねた生還者",
    conditionDescription: "瀕死勝利を20回達成",
    effectDescription: "HP50%以下で攻撃+15% / 被ダメ-10%",
    effect: { lowHpConditionalCombat: { hpThreshold: 0.5, attackMultiplier: 0.15, damageReduction: 0.1 } },
    trigger: ["afterBattle"],
    customCheckerId: "unyielding_survivor",
    tier: "epic",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "maintenance_expert",
    name: "手入れの達人",
    category: "cheat",
    description: "装備育成を仕上げる整備の達人",
    conditionDescription: "同一装備+7以上を3つ達成",
    effectDescription: "強化成功率+15%",
    effect: { enhanceSuccessBonus: 0.15 },
    trigger: ["afterEnhance"],
    customCheckerId: "maintenance_expert",
    tier: "legend",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "chain_veteran_70",
    name: "連戦熟達者",
    category: "cheat",
    description: "長期連戦に適応した熟達者",
    conditionDescription: "帰還せずに70連勝",
    effectDescription: "連戦中 攻撃+12% / 自然回復+6%/分",
    effect: { noReturnCombatBonus: { attackMultiplier: 0.12, stageRegenPerMinute: 0.06 } },
    trigger: ["afterBattle"],
    customCheckerId: "chain_veteran_70",
    tier: "legend",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "critical_hunter_80",
    name: "会心の狩人",
    category: "cheat",
    description: "急所狙いを極めた狩人",
    conditionDescription: "会心で80回トドメ",
    effectDescription: "会心率+8% / 会心ダメージ+12%",
    effect: { critRateBonus: 0.08, critDamageBonus: 0.12 },
    trigger: ["afterKill", "afterBattle"],
    customCheckerId: "critical_hunter_80",
    tier: "epic",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "defense_believer",
    name: "防壁の信徒",
    category: "cheat",
    description: "防壁維持に特化した耐久信徒",
    conditionDescription: "防御系スキルを200回使用",
    effectDescription: "防御+12%",
    effect: { defenseMultiplier: 0.12 },
    trigger: ["afterSpellUse", "afterBattle"],
    customCheckerId: "defense_believer",
    tier: "epic",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "healing_preparedness",
    name: "癒しの備え",
    category: "cheat",
    description: "過剰回復を戦術へ昇華した僧",
    conditionDescription: "HP満タン時に回復スキルを100回使用",
    effectDescription: "過剰回復変換率+15% / 回復量+8%",
    effect: { overhealConversionBonus: 0.15, healMultiplier: 0.08 },
    trigger: ["afterHealSkillUse", "afterBattle"],
    customCheckerId: "healing_preparedness",
    tier: "epic",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "endure_runner",
    name: "耐える者",
    category: "cheat",
    description: "危険域で勝ち筋を拾い続ける者",
    conditionDescription: "瀕死勝利を30回達成",
    effectDescription: "HP50%以下で防御+12% / 回避+5%",
    effect: {
      lowHpConditionalCombat: { hpThreshold: 0.5, damageReduction: 0.12 },
      evadeByRegion: { grassland: 0.05, desert: 0.05, sea: 0.05, volcano: 0.05, final: 0.05 }
    },
    trigger: ["afterBattle"],
    customCheckerId: "endure_runner",
    tier: "legend",
    canCarryOver: true,
    carryOverType: "direct"
  },
  {
    id: "wall_ready",
    name: "壁越えの準備",
    category: "cheat",
    description: "海域攻略前の準備を終えた者",
    conditionDescription: "砂漠ボス撃破後、海マップで200勝",
    effectDescription: "ボス与ダメ+12% / 最大HP+10%",
    effect: { damageToBoss: 0.12, regionStatMultiplier: { grassland: { maxHp: 1.1 }, desert: { maxHp: 1.1 }, sea: { maxHp: 1.1 }, volcano: { maxHp: 1.1 }, final: { maxHp: 1.1 } } },
    trigger: ["afterBattle", "afterFieldBossClear"],
    customCheckerId: "wall_ready",
    tier: "legend",
    canCarryOver: true,
    carryOverType: "direct"
  }
];

TITLE_DATA.push(...PHASE16_MIDGAME_SERIES_NORMAL, ...PHASE16_MIDGAME_SERIES_CHEAT);

Object.assign(TITLE_CHECKERS, {
  sandsea_conqueror: () => state.fieldBossCleared.includes("2-10"),
  sea_route_breaker: () => state.fieldBossCleared.includes("3-10"),
  veteran_adventurer_300: () => (state.stats.totalWins || 0) >= 300,
  enhance_habituated: () => (state.stats.totalEnhances || 0) >= 30,
  workshop_proven: () => (state.player.productionJobLevel || 0) >= 50,
  first_sight_overcome: () => state.fieldBossCleared.includes("1-10") && state.fieldBossCleared.includes("2-10"),
  prayer_adept: () => (state.stats.healSkillUseCount || 0) >= 300,
  formula_controller: () => (state.stats.spellUseCount || 0) >= 500,
  vital_spot_knower: () => (state.stats.critFinishCountAll || 0) >= 50,
  guild_journey_veteran: () => (state.stats.guildQuestCompleted || 0) >= 30,
  town_crossing: () => ["balladore", "dustoria", "akamatsu"].every((id) => state.unlockedTowns.includes(id)),
  dual_path_scholar: () => (state.player.level || 0) >= 50 && (state.player.productionJobLevel || 0) >= 50,
  wall_breaker_mid: () => state.fieldBossCleared.includes("2-10") && (state.stats.winsByRegion?.sea || 0) >= 50,
  workshop_operator: () => (state.stats.totalCrafts || 0) >= 200,
  regional_local: () =>
    (state.stats.winsByRegion?.grassland || 0) >= 100 &&
    (state.stats.winsByRegion?.desert || 0) >= 100 &&
    (state.stats.winsByRegion?.sea || 0) >= 100,
  money_craft_mid: () => ((state.loop.persistentStats?.totalGoldEarnedLifetime || 0) + (state.stats.totalGoldEarned || 0)) >= 200000,

  chain_breaker_50: () => (state.stats.totalConsecutiveWinsBest || 0) >= 50,
  unyielding_survivor: () => (state.stats.nearDeathWins || 0) >= 20,
  maintenance_expert: () => Object.values(state.player.equipmentEnhancements || {}).filter((value) => Number(value || 0) >= 7).length >= 3,
  chain_veteran_70: () => (state.stats.totalConsecutiveWinsBest || 0) >= 70,
  critical_hunter_80: () => (state.stats.critFinishCountAll || 0) >= 80,
  defense_believer: () => (state.stats.volcanoDefenseSkillUseCount || 0) >= 200,
  healing_preparedness: () => (state.stats.fullHpHealCastCount || 0) >= 100,
  endure_runner: () => (state.stats.nearDeathWins || 0) >= 30,
  wall_ready: () => state.fieldBossCleared.includes("2-10") && (state.stats.winsByRegion?.sea || 0) >= 200
});

function applyPhase10TitleBalance() {
  const patch = (id, effectPatch) => {
    const title = TITLE_DATA.find((t) => t.id === id);
    if (!title) return;
    title.effect = { ...(title.effect || {}), ...effectPatch };
  };
  patch("unfavored_king", { lowTierJobBonus: 0.4 });
  patch("production_is_main", { craftedGearBonus: 1.0, qualityStepUpChance: 0.2 });
  patch("one_man_army", { noSubJobBonus: 0.4, bossDamageBonus: 0.2 });
  patch("infinite_seeker", { craftSuccessBonus: 0.2, enhanceSuccessBonus: 0.2 });
  patch("anti_first_trap", { bossDamageBonus: 0.3, battleStartBuff: { damageReduction: 0.7, durationSec: 18 } });
  patch("carry_beyond", { ignoreWeightPenalty: true, slotFillAttackDefenseBonus: 0.03, overweightBonus: 0.1 });
  patch("beyond_death", { reviveBuff: { damageReduction: 0.35, durationSec: 10 }, allStatsMultiplier: 0.08 });
  patch("god_slayer", { allStatsMultiplier: 0.25, uniqueDamageBonus: 0.5, uniqueEncounterRateBonus: 0.01 });
  patch("time_keeper_3", { unlockBattleSpeed: [4], speedModeBonus: { expMultiplier: 0.1, minSpeed: 1.5 } });
  patch("time_lord", { unlockBattleSpeed: [5], speedModeBonus: { expMultiplier: 0.25, minSpeed: 1.5 }, speedMultiplier: 0.12 });
  patch("dev_unexpected", { titleLimitBonus: 1, uniqueEncounterRateBonus: 0.015, conditionalBuffByLoop: { perLoopAllStatsMultiplier: 0.02, maxLoopBonus: 0.2 } });
}

applyPhase10TitleBalance();

function applyEndingAffinities() {
  const mapping = {
    god_slayer: ["true_route", "mastery_route"],
    dev_unexpected: ["hidden_route", "chaos_route"],
    time_lord: ["true_route", "chaos_route"],
    infinite_seeker: ["mastery_route", "true_route"],
    production_is_main: ["hidden_route", "mastery_route"],
    unfavored_king: ["hidden_route"],
    one_man_army: ["hidden_route"],
    anti_first_trap: ["true_route"],
    carry_beyond: ["chaos_route"],
    beyond_death: ["chaos_route"]
  };
  Object.entries(mapping).forEach(([id, tags]) => {
    const title = TITLE_DATA.find((row) => row.id === id);
    if (!title) return;
    title.endingAffinity = tags;
    title.endingTag = tags[0] || null;
  });
}

applyEndingAffinities();

const BOARD_CATEGORIES = [
  { id: "all", label: "すべて" },
  { id: "beginner", label: "初心者" },
  { id: "theory", label: "考察" },
  { id: "strategy", label: "攻略" },
  { id: "boss", label: "ボス" },
  { id: "unique", label: "ユニーク" },
  { id: "production", label: "生産" },
  { id: "title", label: "称号" },
  { id: "build", label: "ビルド" },
  { id: "legend", label: "都市伝説" },
  { id: "meme", label: "ネタ" },
  { id: "loop", label: "周回勢" },
  { id: "chat", label: "雑談" }
];

const BOARD_CHARACTER_PROFILES = {
  romanSamurai: { id: "romanSamurai", name: "浪漫侍", role: "剣士系上位勢", style: "重装と武器強化を軸に安定攻略を語る。" },
  crimsonMage: { id: "crimsonMage", name: "紅の魔術師", role: "魔術師系上位勢", style: "MP管理と単体高火力の最適化を好む。" },
  akaBell: { id: "akaBell", name: "AKA.ベル", role: "忍者系上位勢", style: "回避と会心を絡めた変則ビルドを推す。" },
  shimeSaba: { id: "shimeSaba", name: "守り神しめ鯖", role: "僧侶系上位勢", style: "過剰回復と防御シナジーの安定構築が得意。" }
};

const BOARD_RESPONSE_SETS = {
  starter_job: [
    { author: "剣しか勝たん", body: "最初は剣士が無難。戦闘の基礎を覚えやすい。", tone: "guide" },
    { author: "影歩き", body: "忍者は速度が気持ちいいけど、序盤のHP管理が難しい。", tone: "guide" },
    { author: "無課金仙人", body: "好きな職で始めるのが一番長続きするぞ。", tone: "chat" }
  ],
  bee_warning: [
    { author: "毒蜂アンチ", body: "蜂は命中が高い。序盤は防御バフを優先していい。", tone: "hint", isHint: true },
    { author: "草原在住", body: "軽装で避けるか、重装で受けるかで安定度が変わる。", tone: "hint", isHint: true },
    { author: "鍛冶100年", body: "装備更新だけでも体感かなり楽になる。", tone: "guide" }
  ],
  slime_meaning: [
    { author: "草原在住", body: "スライム狩りは地味だけど称号条件と素材が進む。", tone: "hint", isHint: true },
    { author: "七体目未発見", body: "序盤でスライム研究家を目指すのはあり。", tone: "guide" },
    { author: "バフ飯研究所", body: "金策としても悪くない。", tone: "chat" }
  ],
  timer_meta: [
    { author: "時計の民", body: "あの表示、時計じゃなくて試されてるボタンだぞ。", tone: "hint", isHint: true },
    { author: "影歩き", body: "一定回数で何か起きるのはガチ。", tone: "hint", isHint: true },
    { author: "無課金仙人", body: "押しすぎると生活リズムが壊れる。", tone: "meme" }
  ],
  title_idle: [
    { author: "見上げる者", body: "タイトル放置は本当に称号ある。最初に気付いた人すごい。", tone: "legend" },
    { author: "草原在住", body: "放置中にログ見てると世界観が深まる。", tone: "chat" }
  ],
  dual_wield: [
    { author: "剣しか勝たん", body: "二刀はロマン。2本目の補正が減衰するから装備厳選必須。", tone: "hint", isHint: true },
    { author: "不遇職警察", body: "片手+防具厚めの方が安定する場面は多い。", tone: "guide" },
    { author: "影歩き", body: "速度寄りビルドなら二刀のテンポが気持ちいい。", tone: "chat" }
  ],
  desert_toxic: [
    { author: "毒蜂アンチ", body: "砂漠は継続ダメージ対策がないと長期戦で崩れる。", tone: "hint", isHint: true },
    { author: "バフ飯研究所", body: "防御薬と回復薬をケチらないのが近道。", tone: "guide" }
  ],
  sea_jelly: [
    { author: "七体目未発見", body: "海はクラゲとシェルでテンポ崩される。速度が欲しい。", tone: "hint", isHint: true },
    { author: "草原在住", body: "海は回避寄りか高火力短期決戦が楽。", tone: "guide" }
  ],
  volcano_wall: [
    { author: "不遇職警察", body: "火山は防御だけだと押し切られる。攻守バランス大事。", tone: "guide" },
    { author: "鍛冶100年", body: "装備強化の差が一番出るエリア。", tone: "hint", isHint: true }
  ],
  boss_bison: [
    { author: "草原在住", body: "ベヒモスは突進予兆が出たら防御寄りに切り替えると生存率が上がる。", tone: "hint", isHint: true, important: true },
    { author: "毒蜂アンチ", body: "初見は轢かれて当然。2回目から勝てばいい。", tone: "chat" }
  ],
  bison_loss_streak: [
    { author: "守り神 しめ鯖", body: "1-10で沼ったら、称号は「連戦覇者」と「異常耐性の怪物」がいい。継戦力が目に見えて変わる。", tone: "hint", isHint: true, important: true },
    { author: "不遇職警察", body: "敗北回数が増えるなら、火力一点より耐性と安定を優先した方が勝率が上がる。", tone: "guide" }
  ],
  boss_leviathan: [
    { author: "影歩き", body: "ブレス前のログは見逃すな。強攻撃前に軽減を合わせる。", tone: "hint", isHint: true, important: true },
    { author: "無課金仙人", body: "海ボスは速度より継戦力。", tone: "guide" }
  ],
  boss_volcazard: [
    { author: "鍛冶100年", body: "終盤ボスは怒り後の被ダメが段違い。短期決戦か軽減重ねが有効。", tone: "hint", isHint: true, important: true },
    { author: "バフ飯研究所", body: "料理バフを入れると安定が一段上がる。", tone: "guide" }
  ],
  unique_rumor: [
    { author: "七体目未発見", body: "黒い狼見た。ログに特別演出が出た。", tone: "legend" },
    { author: "神品質まだ？", body: "遭遇率めちゃ低い。運だけじゃない気もする。", tone: "hint", isHint: true },
    { author: "無課金仙人", body: "見たことない勢と見た勢で毎回荒れるスレ。", tone: "meme" }
  ],
  production_power: [
    { author: "鍛冶100年", body: "鍛冶は高品質装備が出始めると世界変わる。", tone: "guide" },
    { author: "バフ飯研究所", body: "調理は安定感担当。終盤の攻略速度が違う。", tone: "guide" },
    { author: "神品質まだ？", body: "神品質は都市伝説じゃなかった。", tone: "legend" }
  ],
  cook_fail: [
    { author: "焦げ飯の王", body: "料理失敗100回で本番って聞いたが本当か？", tone: "meme" },
    { author: "バフ飯研究所", body: "失敗ログも称号条件になるから記録しとくといい。", tone: "hint", isHint: true }
  ],
  overweight_truth: [
    { author: "重装至上主義", body: "過積載=弱いは早計。防御ボーナスを活かせば突破力が出る。", tone: "hint", isHint: true },
    { author: "影歩き", body: "極端に重いと速度ペナが痛い。称号で緩和できる。", tone: "hint", isHint: true }
  ],
  no_weapon: [
    { author: "素手勢見習い", body: "素手ボス撃破称号は本当にある。火力より構成勝負。", tone: "hint", isHint: true },
    { author: "剣しか勝たん", body: "やる意味が分からないけど、やる価値はあるらしい。", tone: "meme" }
  ],
  speed_unlock: [
    { author: "時計の民", body: "2倍速解放したら周回効率が跳ねる。", tone: "guide" },
    { author: "無課金仙人", body: "高速ほど判断ミスが増える。ログはちゃんと見ろ。", tone: "hint", isHint: true }
  ],
  title_limit: [
    { author: "称号コレクター", body: "titleLimitが増えるとビルドの自由度が別ゲー。", tone: "guide" },
    { author: "不遇職警察", body: "周回で伸ばしてからが本番。", tone: "loop" }
  ],
  loop_carry: [
    { author: "周回勢A", body: "2周目持ち込みはチート称号を優先が安定。", tone: "guide" },
    { author: "周回勢B", body: "序盤加速なら速度系、終盤攻略ならボス系。", tone: "guide" }
  ],
  endgame_titles: [
    { author: "七体目未発見", body: "無限の探究者の条件、重すぎるけど達成感はすごい。", tone: "loop" },
    { author: "運営監視班", body: "運営想定外は複合条件の塊。狙って取る称号。", tone: "hint", isHint: true, important: true }
  ],
  chat_town: [
    { author: "草原在住", body: "町移動してるだけでなんか楽しいの分かる。", tone: "chat" },
    { author: "無課金仙人", body: "転移門の演出、地味に好き。", tone: "chat" }
  ],
  meme_nothing: [
    { author: "何者でもない", body: "何者でもない取ったのに何もない。", tone: "meme" },
    { author: "時計の民", body: "それが報酬です。", tone: "meme" }
  ],
  myth_godslayer: [
    { author: "神話踏破候補", body: "七体全部倒すと神殺しが出るって噂、ついに確認された。", tone: "legend", important: true },
    { author: "無課金仙人", body: "ここまで来ると別ゲーム。", tone: "loop" }
  ],
  story_grassland_clear: [
    { author: "草原在住", body: "草原ボスの演出、討伐より『通すか止めるか』みたいに見えた。", tone: "theory", important: true },
    { author: "運営監視班", body: "女神のセリフだけ妙に生っぽい。AI台本感が薄いんだよな。", tone: "theory" },
    { author: "無課金仙人", body: "このゲーム、妙に現実感あるの怖い。", tone: "chat" }
  ],
  story_desert_clear: [
    { author: "遺跡ガチ勢", body: "砂漠遺跡の壁面、生活圏の記録っぽい。背景画像の解像度じゃない。", tone: "theory", important: true },
    { author: "七体目未発見", body: "ユニークって災厄扱いだけど、封印側の役目も持ってないか？", tone: "theory" },
    { author: "運営監視班", body: "ラグナロクって単語、ログで拾える箇所が増えてる。", tone: "theory" }
  ],
  story_sea_clear: [
    { author: "海域観測班", body: "海の暴走個体、ただ強いんじゃなくて均衡が崩れてる挙動に見える。", tone: "theory", important: true },
    { author: "AKA.ベル", body: "均衡ワード出始めてから敵の行動パターンまで不穏。", tone: "theory" },
    { author: "守り神しめ鯖", body: "修復してるつもりで刺激してる可能性、否定しきれない。", tone: "theory" }
  ],
  story_volcano_clear: [
    { author: "壁画スクショ勢", body: "火山壁画、どう見ても『神殺し』儀式の図だろ。", tone: "theory", important: true },
    { author: "浪漫侍", body: "ここからはレベルより構成。称号複合で耐久ライン作れ。", tone: "guide" },
    { author: "紅の魔術師", body: "機械文明の予告が露骨。次マップは対策の質で差が付く。", tone: "guide" }
  ],
  story_neverend_arrive: [
    { author: "運営監視班", body: "カジノやオークション、ネタ施設じゃなく旧文明の娯楽層っぽい。", tone: "theory", important: true },
    { author: "遺跡ガチ勢", body: "ネバーエンドは遊園地に見えて兵器管理都市の残骸だと思う。", tone: "theory" },
    { author: "紅の魔術師", body: "機械敵は高防御高火力低HP。短期決戦前提で詠唱回しを組め。", tone: "guide" }
  ],
  story_unique_collapse: [
    { author: "運営監視班", body: "ユニーク全撃破後に空の挙動が変わった。これ討伐コンプが正解じゃない。", tone: "theory", important: true },
    { author: "守り神しめ鯖", body: "守護者を倒し切った結果、栓が外れた説が現実味を帯びてきた。", tone: "theory", important: true },
    { author: "七体目未発見", body: "異界の怪物って単語、ついにログに出たんだが。", tone: "legend" }
  ],
  operator_theory: [
    { author: "運営監視班", body: "運営会社の痕跡が薄すぎる。最初から神話側の偽装組織じゃないか？", tone: "theory", important: true },
    { author: "草原在住", body: "最初の女神、案内役NPCってより本物の神格っぽい反応がある。", tone: "theory" },
    { author: "無課金仙人", body: "つまり俺ら、ゲームしてるつもりで別世界の復興手伝ってる？", tone: "chat" }
  ],
  swordsman_meta_builds: [
    { author: BOARD_CHARACTER_PROFILES.romanSamurai.name, body: "剣士は武器強化と重装で土台を作れ。砂漠以降は耐久称号を混ぜると安定する。", tone: "guide", important: true },
    { author: BOARD_CHARACTER_PROFILES.romanSamurai.name, body: "火力一本より『ボス特攻+軽減』の複合が勝率を伸ばす。", tone: "guide" },
    { author: "不遇職警察", body: "草原30前後、砂漠50前後を目安に強化ラインを越えると別ゲー。", tone: "hint", isHint: true }
  ],
  mage_meta_builds: [
    { author: BOARD_CHARACTER_PROFILES.crimsonMage.name, body: "海以降は範囲より単体高火力。MP回復手段を2枚積んで回転を止めない。", tone: "guide", important: true },
    { author: BOARD_CHARACTER_PROFILES.crimsonMage.name, body: "称号はMP効率系+単体火力系を複合。火山ボスで差が出る。", tone: "guide" },
    { author: "バフ飯研究所", body: "魔術師は料理バフで詠唱事故が減る。", tone: "hint", isHint: true }
  ],
  ninja_meta_builds: [
    { author: BOARD_CHARACTER_PROFILES.akaBell.name, body: "忍者はサブ僧侶が安定。自己強化+命中デバフで回避が回る。", tone: "guide", important: true },
    { author: BOARD_CHARACTER_PROFILES.akaBell.name, body: "会心型は楽しいが、海以降は被弾一発が重い。回避称号を1枠入れろ。", tone: "guide" },
    { author: "影歩き", body: "軽装の強みは行動回数。手数で押し切る。", tone: "hint", isHint: true }
  ],
  priest_meta_builds: [
    { author: BOARD_CHARACTER_PROFILES.shimeSaba.name, body: "僧侶は回復2枚+防御支援で基盤を作って、サブ攻撃系で詰めるのが丸い。", tone: "guide", important: true },
    { author: BOARD_CHARACTER_PROFILES.shimeSaba.name, body: "過剰回復ビルドは長期戦で真価。火山以降の事故率が目に見えて下がる。", tone: "guide" },
    { author: "真面目な僧侶", body: "守り切る構成は最終的に火力にも繋がる。", tone: "chat" }
  ],
  title_research_lab: [
    { author: "称号コレクター", body: "地域馴染み+壁を越える者は海攻略の定番。", tone: "hint", isHint: true, important: true },
    { author: "運営監視班", body: "火山はチート称号の複合次第。単純レベル差より構成差が出る。", tone: "guide" },
    { author: "浪漫侍", body: "剣士は防御寄り称号1枠で事故死が激減する。", tone: "guide" }
  ],
  map_boss_route_notes: [
    { author: "攻略班テンプレ職人", body: "草原ボスはLv30前後で武器強化優先。", tone: "hint", isHint: true },
    { author: "攻略班テンプレ職人", body: "砂漠ボスはLv50前後+称号枠拡張が目安。", tone: "hint", isHint: true },
    { author: "攻略班テンプレ職人", body: "海は『壁を越える者』『地域馴染み』が安定。", tone: "hint", isHint: true },
    { author: "攻略班テンプレ職人", body: "火山はチート称号の組み合わせで突破率が変わる。", tone: "hint", isHint: true }
  ],
  neverend_strategy_notes: [
    { author: "紅の魔術師", body: "Protocol3は三連撃対策が最優先。軽減と回復タイミングを合わせる。", tone: "guide", important: true },
    { author: "浪漫侍", body: "激怒後は被ダメも通る。守り切るより削り切りに切り替えろ。", tone: "guide" },
    { author: "AKA.ベル", body: "機械敵は低HPだから先手で落とす構成が刺さる。", tone: "hint", isHint: true }
  ],
  neverend_economy_notes: [
    { author: "市場観測班", body: "カジノはGOLD→チップの入口。オークションは高額一点狙いが基本。", tone: "guide" },
    { author: "守り神しめ鯖", body: "ルーレットは欲張ると溶ける。収支ラインを決めて撤退しろ。", tone: "hint", isHint: true },
    { author: "無課金仙人", body: "VIPは夢あるけど地獄もある。勝ち逃げ推奨。", tone: "chat" }
  ]
};

const BOARD_THREAD_DEFS = [
  { id: "th_job", category: "beginner", title: "【初心者向け】最初に選ぶならどの職？", visibleIf: { minStage: "1-1" }, responseSetId: "starter_job" },
  { id: "th_bee", category: "beginner", title: "草原の蜂、序盤にしては強くない？", visibleIf: { minStage: "1-1" }, responseSetId: "bee_warning" },
  { id: "th_slime", category: "beginner", title: "スライム狩りって意味ある？", visibleIf: { minStage: "1-1" }, responseSetId: "slime_meaning" },
  { id: "th_potion", category: "beginner", title: "ポーション節約したい", visibleIf: { minStage: "1-1" }, responseSetId: "slime_meaning" },
  { id: "th_workshop_early", category: "beginner", title: "工房って序盤から触るべき？", visibleIf: { minStage: "1-1" }, responseSetId: "production_power" },
  { id: "th_town_walk", category: "chat", title: "町移動ばっかしてるけど楽しい", visibleIf: { minStage: "1-1" }, responseSetId: "chat_town" },
  { id: "th_timer", category: "legend", title: "タイマー押してるやつ、何してるの？", visibleIf: { minStage: "1-1" }, responseSetId: "timer_meta", variantSelector: "timer_meta" },
  { id: "th_title_idle", category: "legend", title: "タイトル画面で放置したら何かある？", visibleIf: { minStage: "1-1" }, responseSetId: "title_idle" },
  { id: "th_visual", category: "chat", title: "このゲーム、見た目装備ないの？", visibleIf: { minStage: "1-1" }, responseSetId: "chat_town" },
  { id: "th_dual", category: "build", title: "武器2本持ちって強いの？", visibleIf: { minStage: "1-1" }, responseSetId: "dual_wield", variantSelector: "dual_focus" },
  { id: "th_desert", category: "strategy", title: "砂漠の毒きつすぎ問題", visibleIf: { unlockedTown: "dustria" }, responseSetId: "desert_toxic" },
  { id: "th_sea", category: "strategy", title: "海マップのクラゲ許せん", visibleIf: { unlockedTown: "akamatsu" }, responseSetId: "sea_jelly" },
  { id: "th_volcano", category: "strategy", title: "火山のゴーレム硬すぎる", visibleIf: { unlockedTown: "rulacia" }, responseSetId: "volcano_wall" },
  { id: "th_story_grassland", category: "theory", title: "草原ボス、討伐演出が妙に不穏だった件", visibleIf: { fieldBossCleared: "1-10" }, responseSetId: "story_grassland_clear" },
  { id: "th_story_desert", category: "theory", title: "砂漠遺跡ってただの背景じゃなくない？", visibleIf: { fieldBossCleared: "2-10" }, responseSetId: "story_desert_clear" },
  { id: "th_story_sea", category: "theory", title: "海以降の敵、世界バグみたいな挙動してる", visibleIf: { fieldBossCleared: "3-10" }, responseSetId: "story_sea_clear" },
  { id: "th_story_volcano", category: "theory", title: "火山壁画の神殺し図、見たやついる？", visibleIf: { fieldBossCleared: "4-10" }, responseSetId: "story_volcano_clear" },
  { id: "th_operator_theory", category: "theory", title: "運営会社と女神、設定以上の違和感がある", visibleIf: { fieldBossCleared: "2-10" }, responseSetId: "operator_theory" },
  { id: "th_bison", category: "boss", title: "ベヒモスバイソン初見で轢かれた", visibleIf: { minStage: "1-10" }, responseSetId: "boss_bison" },
  { id: "th_bison_loss10", category: "boss", title: "【1-10】10連敗したんだが、何を直せばいい？", visibleIf: { all: [{ minStage: "1-10" }, { stageDefeatsAtLeast: { stageId: "1-10", count: 10 } }] }, responseSetId: "bison_loss_streak" },
  { id: "th_leviathan", category: "boss", title: "リヴァイアサンのブレスどうすんの？", visibleIf: { minStage: "3-10" }, responseSetId: "boss_leviathan" },
  { id: "th_volcazard", category: "boss", title: "ヴォルカザード怒り入ってから別ゲーじゃね？", visibleIf: { minStage: "4-10" }, responseSetId: "boss_volcazard" },
  { id: "th_firsttrap", category: "boss", title: "初見殺し突破者って本当に取れるの？", visibleIf: { minStage: "2-10" }, responseSetId: "boss_bison", variantSelector: "firsttrap_meta" },
  { id: "th_unique_wolf", category: "unique", title: "例の黒い狼見たやついる？", visibleIf: { minStage: "1-3" }, responseSetId: "unique_rumor", variantSelector: "unique_hunt" },
  { id: "th_unique_snake", category: "unique", title: "蛇みたいなやつに全滅させられた", visibleIf: { uniqueEncounterAtLeast: 1 }, responseSetId: "unique_rumor", variantSelector: "unique_hunt" },
  { id: "th_unique_golden", category: "unique", title: "空飛ぶ金色のやつ、あれ何？", visibleIf: { uniqueEncounterAtLeast: 2 }, responseSetId: "unique_rumor", variantSelector: "unique_hunt" },
  { id: "th_unique_last", category: "unique", title: "七体目だけ見つからん", visibleIf: { uniqueTypesAtLeast: 4 }, responseSetId: "unique_rumor", variantSelector: "unique_hunt" },
  { id: "th_godslayer", category: "unique", title: "神殺しって本当に存在するの？", visibleIf: { uniqueTypesAtLeast: 6 }, unlockedBy: { titleAny: ["god_slayer"] }, responseSetId: "myth_godslayer" },
  { id: "th_prod_late", category: "production", title: "鍛冶って終盤でも息してる？", visibleIf: { totalCraftsAtLeast: 20 }, responseSetId: "production_power", variantSelector: "production_hype" },
  { id: "th_cook100", category: "production", title: "料理100回失敗したんだが", visibleIf: { craftFailureAtLeast: 20 }, responseSetId: "cook_fail" },
  { id: "th_alchemy", category: "production", title: "薬師の秘薬、壊れてない？", visibleIf: { titleAny: ["production_is_main", "alchemy_explorer"] }, responseSetId: "production_power" },
  { id: "th_godq", category: "production", title: "神品質って都市伝説じゃないの？", visibleIf: { godQualityAtLeast: 1 }, responseSetId: "production_power", variantSelector: "production_hype" },
  { id: "th_main_prod", category: "production", title: "生産職が本体って本当だったわ", visibleIf: { titleAny: ["production_is_main"] }, responseSetId: "production_power" },
  { id: "th_title_lab", category: "title", title: "称号研究所: 地域別おすすめを共有しよう", visibleIf: { fieldBossCleared: "2-10" }, responseSetId: "title_research_lab" },
  { id: "th_boss_route_notes", category: "boss", title: "マップボス攻略メモを積み上げるスレ", visibleIf: { fieldBossCleared: "1-10" }, responseSetId: "map_boss_route_notes" },
  { id: "th_job_swordsman", category: "build", title: "剣士系ビルド相談所", visibleIf: { fieldBossCleared: "2-10" }, responseSetId: "swordsman_meta_builds" },
  { id: "th_job_mage", category: "build", title: "魔術師系ビルド相談所", visibleIf: { fieldBossCleared: "2-10" }, responseSetId: "mage_meta_builds" },
  { id: "th_job_ninja", category: "build", title: "忍者系ビルド相談所", visibleIf: { fieldBossCleared: "2-10" }, responseSetId: "ninja_meta_builds" },
  { id: "th_job_priest", category: "build", title: "僧侶系ビルド相談所", visibleIf: { fieldBossCleared: "2-10" }, responseSetId: "priest_meta_builds" },
  { id: "th_heavy", category: "build", title: "重装が弱いと思ってた俺が悪かった", visibleIf: { buildTag: "heavy_build" }, responseSetId: "overweight_truth" },
  { id: "th_overweight", category: "build", title: "過積載で火山抜けた人いる？", visibleIf: { buildTagAny: ["overweight_build", "extreme_overweight"] }, responseSetId: "overweight_truth" },
  { id: "th_noweapon", category: "build", title: "武器なしでボス倒した変態おる？", visibleIf: { buildTag: "no_weapon" }, responseSetId: "no_weapon" },
  { id: "th_accessory", category: "build", title: "アクセ6枠ほしい", visibleIf: { minStage: "1-1" }, responseSetId: "dual_wield" },
  { id: "th_dual2", category: "build", title: "二刀流ってロマン枠？ ガチ枠？", visibleIf: { buildTag: "dual_wield" }, responseSetId: "dual_wield", variantSelector: "dual_focus" },
  { id: "th_speed2", category: "title", title: "2倍速解放したら世界変わった", visibleIf: { speedUnlockedAtLeast: 2 }, responseSetId: "speed_unlock", variantSelector: "timer_meta" },
  { id: "th_speed5", category: "title", title: "5倍速まで行ったやついる？", visibleIf: { speedUnlockedAtLeast: 5 }, responseSetId: "speed_unlock", variantSelector: "timer_meta" },
  { id: "th_nobody", category: "meme", title: "何者でもない取ったのに本当に何もない", visibleIf: { titleAny: ["nobody_special"] }, responseSetId: "meme_nothing" },
  { id: "th_unexpected", category: "title", title: "運営想定外って何やれば取れるの？", visibleIf: { titleAny: ["dev_unexpected", "unexpected_architect"] }, responseSetId: "endgame_titles", variantSelector: "unexpected_meta" },
  { id: "th_loopcarry", category: "loop", title: "2周目何持ち込む？", visibleIf: { loopAtLeast: 1 }, responseSetId: "loop_carry", variantSelector: "loop_chat" },
  { id: "th_limit", category: "loop", title: "titleLimit増えたら別ゲーになった", visibleIf: { titleLimitAtLeast: 2 }, responseSetId: "title_limit", variantSelector: "loop_chat" },
  { id: "th_unfavored", category: "loop", title: "不遇職の王って誰で取った？", visibleIf: { titleAny: ["unfavored_king", "low_tier_emperor"] }, responseSetId: "endgame_titles" },
  { id: "th_oneman", category: "loop", title: "一騎当千、サブなしでやる価値ある？", visibleIf: { titleAny: ["one_man_army"] }, responseSetId: "endgame_titles" },
  { id: "th_infinite", category: "loop", title: "無限の探究者、条件重すぎ", visibleIf: { titleAny: ["infinite_seeker"] }, responseSetId: "endgame_titles" },
  { id: "th_board_meta", category: "chat", title: "掲示板見てると世界が変わる気がする", visibleIf: { boardReadAtLeast: 10 }, responseSetId: "chat_town" },
  { id: "th_loop_challenge_open", category: "loop", title: "追憶カテゴリ解放されたんだが", visibleIf: { featureUnlocked: "loop_challenge_basic" }, responseSetId: "loop_carry", variantSelector: "loop_chat" },
  { id: "th_reborn_boss", category: "boss", title: "再臨ボス、通常ボスの顔してない", visibleIf: { featureUnlocked: "enhanced_boss" }, responseSetId: "endgame_titles" },
  { id: "th_story_neverend", category: "theory", title: "ネバーエンド、娯楽都市に見えて終末遺跡すぎる", visibleIf: { worldStateFlag: "neverendArrived" }, responseSetId: "story_neverend_arrive" },
  { id: "th_neverend_strategy", category: "strategy", title: "天空都市攻略: 機械敵とProtocol3対策", visibleIf: { worldStateFlag: "neverendArrived" }, responseSetId: "neverend_strategy_notes" },
  { id: "th_neverend_economy", category: "strategy", title: "天空都市のギャンブル/オークション情報共有", visibleIf: { worldStateFlag: "neverendArrived" }, responseSetId: "neverend_economy_notes" },
  { id: "th_protocol3_identity", category: "theory", title: "Protocol3って対ユニーク兵器では？", visibleIf: { worldStateFlag: "protocol3Slayer" }, responseSetId: "story_neverend_arrive" },
  { id: "th_unique_balance_break", category: "unique", title: "ユニーク全撃破後、空がおかしい", visibleIf: { uniqueTypesAtLeast: 7 }, responseSetId: "story_unique_collapse" },
  { id: "th_deep_clear", category: "loop", title: "深層踏破者ってここで取れる？", visibleIf: { specialChallengeClearAtLeast: 1 }, responseSetId: "endgame_titles" },
  { id: "th_loop4", category: "legend", title: "4周目から空気変わりすぎだろ", visibleIf: { loopAtLeast: 4 }, responseSetId: "myth_godslayer" },
  { id: "th_true_route", category: "legend", title: "神話の残滓に道が開いたってマジ？", visibleIf: { endingEligible: "true" }, responseSetId: "myth_godslayer" },
  { id: "th_hidden_route", category: "legend", title: "見えてはいけない領域があるらしい", visibleIf: { endingEligible: "hidden" }, responseSetId: "endgame_titles" },
  { id: "th_chaos_route", category: "legend", title: "周回領域が壊れ始めてる", visibleIf: { endingEligible: "chaos" }, responseSetId: "endgame_titles" },
  { id: "th_final_open", category: "boss", title: "最終解放コンテンツ出たやつ集合", visibleIf: { finalContentUnlocked: true }, responseSetId: "endgame_titles" },
  { id: "th_true_end_clear", category: "loop", title: "真エンド見た人いる？", visibleIf: { unlockedEnding: "true_end" }, responseSetId: "myth_godslayer" },
  { id: "th_hidden_end_clear", category: "loop", title: "裏エンド、世界観が別物すぎる", visibleIf: { unlockedEnding: "hidden_end" }, responseSetId: "endgame_titles" },
  { id: "th_chaos_end_clear", category: "loop", title: "混沌エンド行ったら掲示板まで壊れた", visibleIf: { unlockedEnding: "chaos_end" }, responseSetId: "endgame_titles" }
];

const STORY_FRAGMENTS = {
  grassland_clear: {
    id: "grassland_clear",
    title: "草原の違和感",
    logText: "女神の声は機械音声ではない。ベヒモスは侵入者を止めるように立ちはだかった。",
    helpText: "草原: 守護者は本当に敵だったのか？"
  },
  desert_clear: {
    id: "desert_clear",
    title: "砂塵の記録",
    logText: "砂漠遺跡には滅びた人類文明の痕跡が残る。ラグナロクという語が断片的に見える。",
    helpText: "砂漠: 遺跡は過去戦争の記録庫かもしれない。"
  },
  sea_clear: {
    id: "sea_clear",
    title: "均衡の揺らぎ",
    logText: "海域の暴走は災害というより均衡崩壊の兆候。ユニークは調和側という説が浮上する。",
    helpText: "海: 俺たちは修復者か、刺激者か。"
  },
  volcano_clear: {
    id: "volcano_clear",
    title: "神殺しの影",
    logText: "火山壁画は人類の神殺し計画を示していた。次に待つのは兵器文明の残骸だ。",
    helpText: "火山: ラグナロクは神話ではなく戦争だった。"
  },
  neverend_enter: {
    id: "neverend_enter",
    title: "天空都市ネバーエンド",
    logText: "ネバーエンドは娯楽と兵器が混ざった人類文明の残り香。誰かの帰還を待つ都市。",
    helpText: "天空都市: 娯楽施設は旧文明の記憶装置。"
  },
  protocol3_clear: {
    id: "protocol3_clear",
    title: "対ユニーク兵器",
    logText: "Protocol3 はユニーク討伐のために造られた残存兵器。役目を失ったまま稼働し続けている。",
    helpText: "Protocol3: 人類は守るために世界を壊した。"
  },
  unique_all_clear: {
    id: "unique_all_clear",
    title: "栓の崩壊",
    logText: "七体のユニークが消え、空が裂ける。異界の怪物という名だけがログに残された。",
    helpText: "全ユニーク撃破: 守護者を倒した代償が始まる。"
  }
};

const STORY_UNLOCK_CONDITIONS = {
  grassland_clear: { fieldBossCleared: "1-10" },
  desert_clear: { fieldBossCleared: "2-10" },
  sea_clear: { fieldBossCleared: "3-10" },
  volcano_clear: { fieldBossCleared: "4-10" },
  neverend_enter: { worldStateFlag: "neverendArrived" },
  protocol3_clear: { worldStateFlag: "protocol3Slayer" },
  unique_all_clear: { uniqueTypesAtLeast: 7 }
};

const INTRO_MESSAGES = [
  { speaker: "管理AI: AURORA", text: "ようこそ、冒険者プロトコルへ。" },
  { speaker: "管理AI: AURORA", text: "この世界では称号と選択があなたの運命を変えます。" },
  { speaker: "管理AI: AURORA", text: "まずは初期ジョブを選び、最初の一歩を踏み出しましょう。" }
];

const MAIN_TABS = [
  { id: "adventure", label: "冒険" },
  { id: "guild", label: "ギルド" },
  { id: "board", label: "掲示板" },
  { id: "status", label: "ステータス" },
  { id: "items", label: "アイテム" },
  { id: "system", label: "システム" }
];

const LOW_TIER_MAIN_JOBS = ["cleric"];
const JOB_SYSTEM_RULES = {
  subJobUnlockLevel: 20,
  freeJobChangeLevel: 100
};
const JOB_EVOLUTION_LEVELS = [1, 50, 100, 150, 200];

const JOB_LINE_DATA = {
  swordsman_line: ["swordman", "swordmaster", "swordking", "swordsaint", "swordgod"],
  ninja_line: ["ninja", "chunin", "jonin", "oboro", "shadowgod"],
  mage_line: ["mage", "archmage", "sage", "grandsage", "demonmage"],
  priest_line: ["cleric", "priest", "highpriest", "cardinal", "saint"],
  alchemist_line: ["apothecary", "alchemist", "great_alchemist", "alchemy_king", "alchemy_god"],
  blacksmith_line: ["blacksmith", "smith_artisan", "veteran_blacksmith", "smith_king", "smith_god"],
  cook_line: ["cook", "chef", "sous_chef", "grand_chef", "master_chef"]
};

const BATTLE_JOB_EVOLUTION_DATA = {
  swordman: { id: "swordman", nameJa: "剣士", baseLineId: "swordsman_line", tier: 1, requiredLevel: 1, requiredProductionLevel: null, statGrowthBonus: { hp: 1.02, mp: 1, attack: 1.04, defense: 1.02, speed: 1.01, intelligence: 1, luck: 1 }, passiveBonus: { critRate: 0.005 }, skillList: ["slash", "double_slash", "iron_stance", "fighting_spirit"], descriptionJa: "近接戦闘の基本職。", jobType: "battle" },
  swordmaster: { id: "swordmaster", nameJa: "剣豪", baseLineId: "swordsman_line", tier: 2, requiredLevel: 50, requiredProductionLevel: null, statGrowthBonus: { hp: 1.04, mp: 1.01, attack: 1.09, defense: 1.04, speed: 1.03, intelligence: 1, luck: 1.01 }, passiveBonus: { critRate: 0.015, accuracyBonus: 0.02 }, skillList: ["hien_slash", "triple_slash", "mikiri", "touki_release"], descriptionJa: "剣士の上位職。手数と鋭さに優れる。", jobType: "battle" },
  swordking: { id: "swordking", nameJa: "剣王", baseLineId: "swordsman_line", tier: 3, requiredLevel: 100, requiredProductionLevel: null, statGrowthBonus: { hp: 1.07, mp: 1.02, attack: 1.14, defense: 1.08, speed: 1.05, intelligence: 1.01, luck: 1.02 }, passiveBonus: { critRate: 0.025, accuracyBonus: 0.04, damageReduction: 0.03 }, skillList: ["ouga_slash", "sword_pressure", "ironwall", "kings_aura"], descriptionJa: "王者の剣圧で戦場を制圧する。", jobType: "battle" },
  swordsaint: { id: "swordsaint", nameJa: "剣聖", baseLineId: "swordsman_line", tier: 4, requiredLevel: 150, requiredProductionLevel: null, statGrowthBonus: { hp: 1.1, mp: 1.03, attack: 1.19, defense: 1.11, speed: 1.08, intelligence: 1.02, luck: 1.03 }, passiveBonus: { critRate: 0.04, accuracyBonus: 0.06, damageReduction: 0.05 }, skillList: ["muku_issen", "senjin_ranbu", "shingan", "seikenki"], descriptionJa: "極致の剣技で攻防を兼ねる聖域職。", jobType: "battle" },
  swordgod: { id: "swordgod", nameJa: "剣神", baseLineId: "swordsman_line", tier: 5, requiredLevel: 200, requiredProductionLevel: null, statGrowthBonus: { hp: 1.14, mp: 1.05, attack: 1.24, defense: 1.15, speed: 1.1, intelligence: 1.03, luck: 1.05 }, passiveBonus: { critRate: 0.06, accuracyBonus: 0.08, damageReduction: 0.08 }, skillList: ["shinmetsu_zan", "tendant_kenbu", "shinsai", "kengod_descend"], descriptionJa: "剣そのものと化した最上位職。", jobType: "battle" },

  ninja: { id: "ninja", nameJa: "忍者", baseLineId: "ninja_line", tier: 1, requiredLevel: 1, requiredProductionLevel: null, statGrowthBonus: { hp: 1, mp: 1, attack: 1.02, defense: 1, speed: 1.05, intelligence: 1, luck: 1.02 }, passiveBonus: { critRate: 0.01, evasionBonus: 0.01 }, skillList: ["kunai_throw", "venom_blade", "stealth", "smoke_bomb"], descriptionJa: "高機動と奇襲を得意とする。", jobType: "battle" },
  chunin: { id: "chunin", nameJa: "中忍", baseLineId: "ninja_line", tier: 2, requiredLevel: 50, requiredProductionLevel: null, statGrowthBonus: { hp: 1.01, mp: 1.01, attack: 1.05, defense: 1.01, speed: 1.1, intelligence: 1, luck: 1.04 }, passiveBonus: { critRate: 0.02, evasionBonus: 0.02 }, skillList: ["shuriken_barrage", "paralyze_venom_blade", "shadow_run", "clone_art"], descriptionJa: "機動戦を極めた中堅忍。", jobType: "battle" },
  jonin: { id: "jonin", nameJa: "上忍", baseLineId: "ninja_line", tier: 3, requiredLevel: 100, requiredProductionLevel: null, statGrowthBonus: { hp: 1.03, mp: 1.02, attack: 1.08, defense: 1.03, speed: 1.15, intelligence: 1.01, luck: 1.06 }, passiveBonus: { critRate: 0.03, evasionBonus: 0.03, accuracyBonus: 0.03 }, skillList: ["shadow_bind", "ninja_ranreikage", "utsusemi", "ninki_boost"], descriptionJa: "影術と生存術を両立する上忍。", jobType: "battle" },
  oboro: { id: "oboro", nameJa: "朧", baseLineId: "ninja_line", tier: 4, requiredLevel: 150, requiredProductionLevel: null, statGrowthBonus: { hp: 1.05, mp: 1.03, attack: 1.11, defense: 1.05, speed: 1.19, intelligence: 1.03, luck: 1.08 }, passiveBonus: { critRate: 0.045, evasionBonus: 0.045, accuracyBonus: 0.04 }, skillList: ["oboro_moon", "phantom_combo", "oboro_hide", "night_fog"], descriptionJa: "幻惑と連殺で敵陣を崩す。", jobType: "battle" },
  shadowgod: { id: "shadowgod", nameJa: "影神", baseLineId: "ninja_line", tier: 5, requiredLevel: 200, requiredProductionLevel: null, statGrowthBonus: { hp: 1.08, mp: 1.05, attack: 1.15, defense: 1.07, speed: 1.24, intelligence: 1.04, luck: 1.1 }, passiveBonus: { critRate: 0.06, evasionBonus: 0.06, accuracyBonus: 0.05 }, skillList: ["final_shadow", "manei_shuriken", "kamikakushi", "shadowgod_form"], descriptionJa: "影を支配する神域の忍。", jobType: "battle" },

  mage: { id: "mage", nameJa: "魔術師", baseLineId: "mage_line", tier: 1, requiredLevel: 1, requiredProductionLevel: null, statGrowthBonus: { hp: 1, mp: 1.04, attack: 1, defense: 1, speed: 1, intelligence: 1.06, luck: 1 }, passiveBonus: { spellPower: 0.04, mpCostReduction: 0.02 }, skillList: ["fire", "ice", "thunder", "magic_boost"], descriptionJa: "属性魔法の基礎を扱う術者。", jobType: "battle" },
  archmage: { id: "archmage", nameJa: "大魔術師", baseLineId: "mage_line", tier: 2, requiredLevel: 50, requiredProductionLevel: null, statGrowthBonus: { hp: 1.01, mp: 1.08, attack: 1, defense: 1.01, speed: 1.01, intelligence: 1.11, luck: 1.01 }, passiveBonus: { spellPower: 0.08, mpCostReduction: 0.03 }, skillList: ["flame_burst", "ice_lance", "lightning_chain", "mana_focus"], descriptionJa: "高位詠唱に到達した魔導職。", jobType: "battle" },
  sage: { id: "sage", nameJa: "賢者", baseLineId: "mage_line", tier: 3, requiredLevel: 100, requiredProductionLevel: null, statGrowthBonus: { hp: 1.03, mp: 1.12, attack: 1.01, defense: 1.03, speed: 1.02, intelligence: 1.16, luck: 1.03 }, passiveBonus: { spellPower: 0.12, mpCostReduction: 0.04 }, skillList: ["meteor_flare", "absolute_zero", "raitei_geki", "sages_wisdom"], descriptionJa: "大魔法を安定運用できる知の到達点。", jobType: "battle" },
  grandsage: { id: "grandsage", nameJa: "大賢者", baseLineId: "mage_line", tier: 4, requiredLevel: 150, requiredProductionLevel: null, statGrowthBonus: { hp: 1.05, mp: 1.16, attack: 1.02, defense: 1.05, speed: 1.03, intelligence: 1.21, luck: 1.05 }, passiveBonus: { spellPower: 0.17, mpCostReduction: 0.06 }, skillList: ["element_nova", "dimension_spear", "mana_barrier", "grandsage_cast"], descriptionJa: "多属性と障壁を自在に扱う極術者。", jobType: "battle" },
  demonmage: { id: "demonmage", nameJa: "魔神", baseLineId: "mage_line", tier: 5, requiredLevel: 200, requiredProductionLevel: null, statGrowthBonus: { hp: 1.08, mp: 1.22, attack: 1.03, defense: 1.07, speed: 1.05, intelligence: 1.26, luck: 1.07 }, passiveBonus: { spellPower: 0.24, mpCostReduction: 0.08 }, skillList: ["end_flame", "absolute_frozen_world", "judgement_thunder", "demonmanifest"], descriptionJa: "終焉級術式を扱う最終魔導職。", jobType: "battle" },

  cleric: { id: "cleric", nameJa: "僧侶", baseLineId: "priest_line", tier: 1, requiredLevel: 1, requiredProductionLevel: null, statGrowthBonus: { hp: 1.02, mp: 1.05, attack: 1, defense: 1.03, speed: 1, intelligence: 1.03, luck: 1.01 }, passiveBonus: { healPower: 0.05, damageReduction: 0.02 }, skillList: ["heal", "cure", "protect", "holy"], descriptionJa: "回復と支援を担う聖職。", jobType: "battle" },
  priest: { id: "priest", nameJa: "司祭", baseLineId: "priest_line", tier: 2, requiredLevel: 50, requiredProductionLevel: null, statGrowthBonus: { hp: 1.04, mp: 1.09, attack: 1, defense: 1.06, speed: 1.01, intelligence: 1.06, luck: 1.02 }, passiveBonus: { healPower: 0.1, damageReduction: 0.03 }, skillList: ["high_heal", "refresh", "bless", "holy_ray"], descriptionJa: "回復循環を強化した上位聖職。", jobType: "battle" },
  highpriest: { id: "highpriest", nameJa: "大司祭", baseLineId: "priest_line", tier: 3, requiredLevel: 100, requiredProductionLevel: null, statGrowthBonus: { hp: 1.07, mp: 1.13, attack: 1.01, defense: 1.09, speed: 1.02, intelligence: 1.09, luck: 1.03 }, passiveBonus: { healPower: 0.15, damageReduction: 0.04 }, skillList: ["heal_rain", "recover", "saint_guard", "judgement"], descriptionJa: "広域支援に優れる聖堂の主力。", jobType: "battle" },
  cardinal: { id: "cardinal", nameJa: "枢機卿", baseLineId: "priest_line", tier: 4, requiredLevel: 150, requiredProductionLevel: null, statGrowthBonus: { hp: 1.1, mp: 1.18, attack: 1.02, defense: 1.12, speed: 1.03, intelligence: 1.12, luck: 1.05 }, passiveBonus: { healPower: 0.21, damageReduction: 0.06 }, skillList: ["grand_heal", "resurrect", "sanctuary", "holy_punish"], descriptionJa: "蘇生と聖域で前線を維持する高位聖職。", jobType: "battle" },
  saint: { id: "saint", nameJa: "聖人", baseLineId: "priest_line", tier: 5, requiredLevel: 200, requiredProductionLevel: null, statGrowthBonus: { hp: 1.14, mp: 1.24, attack: 1.03, defense: 1.16, speed: 1.04, intelligence: 1.16, luck: 1.07 }, passiveBonus: { healPower: 0.28, damageReduction: 0.08 }, skillList: ["miracle", "full_resurrect", "saints_blessing", "last_holy_light"], descriptionJa: "奇跡級支援を実現する最終聖職。", jobType: "battle" }
};

const PRODUCTION_JOB_EVOLUTION_DATA = {
  apothecary: { id: "apothecary", nameJa: "薬師", baseLineId: "alchemist_line", tier: 1, requiredLevel: null, requiredProductionLevel: 1, statGrowthBonus: {}, passiveBonus: {}, skillList: [], descriptionJa: "基礎薬学を扱う生産職。", jobType: "production", productionBonus: { craftSuccessRate: 0.01, highQualityRate: 0.005, divineQualityRate: 0.001, productionExpRate: 0.03 } },
  alchemist: { id: "alchemist", nameJa: "錬金術師", baseLineId: "alchemist_line", tier: 2, requiredLevel: null, requiredProductionLevel: 50, statGrowthBonus: {}, passiveBonus: {}, skillList: [], descriptionJa: "調合成功率が高い上位薬師。", jobType: "production", productionBonus: { craftSuccessRate: 0.03, highQualityRate: 0.015, divineQualityRate: 0.003, productionExpRate: 0.08 } },
  great_alchemist: { id: "great_alchemist", nameJa: "大錬金術師", baseLineId: "alchemist_line", tier: 3, requiredLevel: null, requiredProductionLevel: 100, statGrowthBonus: {}, passiveBonus: {}, skillList: [], descriptionJa: "高品質生成を安定させる。", jobType: "production", productionBonus: { craftSuccessRate: 0.05, highQualityRate: 0.025, divineQualityRate: 0.006, productionExpRate: 0.12 } },
  alchemy_king: { id: "alchemy_king", nameJa: "錬金王", baseLineId: "alchemist_line", tier: 4, requiredLevel: null, requiredProductionLevel: 150, statGrowthBonus: {}, passiveBonus: {}, skillList: [], descriptionJa: "神品質の到達率を引き上げる。", jobType: "production", productionBonus: { craftSuccessRate: 0.07, highQualityRate: 0.035, divineQualityRate: 0.01, productionExpRate: 0.16 } },
  alchemy_god: { id: "alchemy_god", nameJa: "錬金神", baseLineId: "alchemist_line", tier: 5, requiredLevel: null, requiredProductionLevel: 200, statGrowthBonus: {}, passiveBonus: {}, skillList: [], descriptionJa: "錬金術を極めた神域職。", jobType: "production", productionBonus: { craftSuccessRate: 0.1, highQualityRate: 0.05, divineQualityRate: 0.015, productionExpRate: 0.22 } },

  blacksmith: { id: "blacksmith", nameJa: "鍛冶師", baseLineId: "blacksmith_line", tier: 1, requiredLevel: null, requiredProductionLevel: 1, statGrowthBonus: {}, passiveBonus: {}, skillList: [], descriptionJa: "装備生産の基本を担う。", jobType: "production", productionBonus: { craftSuccessRate: 0.01, highQualityRate: 0.01, divineQualityRate: 0.0015, productionExpRate: 0.03 } },
  smith_artisan: { id: "smith_artisan", nameJa: "鍛冶職人", baseLineId: "blacksmith_line", tier: 2, requiredLevel: null, requiredProductionLevel: 50, statGrowthBonus: {}, passiveBonus: {}, skillList: [], descriptionJa: "品質管理に優れる鍛冶職。", jobType: "production", productionBonus: { craftSuccessRate: 0.03, highQualityRate: 0.02, divineQualityRate: 0.004, productionExpRate: 0.08 } },
  veteran_blacksmith: { id: "veteran_blacksmith", nameJa: "ベテラン鍛冶師", baseLineId: "blacksmith_line", tier: 3, requiredLevel: null, requiredProductionLevel: 100, statGrowthBonus: {}, passiveBonus: {}, skillList: [], descriptionJa: "高品質鍛造を量産できる。", jobType: "production", productionBonus: { craftSuccessRate: 0.05, highQualityRate: 0.03, divineQualityRate: 0.007, productionExpRate: 0.12 } },
  smith_king: { id: "smith_king", nameJa: "鍛冶王", baseLineId: "blacksmith_line", tier: 4, requiredLevel: null, requiredProductionLevel: 150, statGrowthBonus: {}, passiveBonus: {}, skillList: [], descriptionJa: "神品質鍛造の名手。", jobType: "production", productionBonus: { craftSuccessRate: 0.07, highQualityRate: 0.04, divineQualityRate: 0.012, productionExpRate: 0.16 } },
  smith_god: { id: "smith_god", nameJa: "鍛冶神", baseLineId: "blacksmith_line", tier: 5, requiredLevel: null, requiredProductionLevel: 200, statGrowthBonus: {}, passiveBonus: {}, skillList: [], descriptionJa: "鍛冶を極めた神域職。", jobType: "production", productionBonus: { craftSuccessRate: 0.1, highQualityRate: 0.055, divineQualityRate: 0.018, productionExpRate: 0.22 } },

  cook: { id: "cook", nameJa: "調理人", baseLineId: "cook_line", tier: 1, requiredLevel: null, requiredProductionLevel: 1, statGrowthBonus: {}, passiveBonus: {}, skillList: [], descriptionJa: "調理の基本職。", jobType: "production", productionBonus: { craftSuccessRate: 0.01, highQualityRate: 0.008, divineQualityRate: 0.001, productionExpRate: 0.03 } },
  chef: { id: "chef", nameJa: "シェフ", baseLineId: "cook_line", tier: 2, requiredLevel: null, requiredProductionLevel: 50, statGrowthBonus: {}, passiveBonus: {}, skillList: [], descriptionJa: "料理品質を安定させる。", jobType: "production", productionBonus: { craftSuccessRate: 0.03, highQualityRate: 0.018, divineQualityRate: 0.003, productionExpRate: 0.08 } },
  sous_chef: { id: "sous_chef", nameJa: "スーシェフ", baseLineId: "cook_line", tier: 3, requiredLevel: null, requiredProductionLevel: 100, statGrowthBonus: {}, passiveBonus: {}, skillList: [], descriptionJa: "高品質料理を量産できる。", jobType: "production", productionBonus: { craftSuccessRate: 0.05, highQualityRate: 0.028, divineQualityRate: 0.006, productionExpRate: 0.12 } },
  grand_chef: { id: "grand_chef", nameJa: "グランシェフ", baseLineId: "cook_line", tier: 4, requiredLevel: null, requiredProductionLevel: 150, statGrowthBonus: {}, passiveBonus: {}, skillList: [], descriptionJa: "極上料理で戦況を支える。", jobType: "production", productionBonus: { craftSuccessRate: 0.07, highQualityRate: 0.04, divineQualityRate: 0.01, productionExpRate: 0.16 } },
  master_chef: { id: "master_chef", nameJa: "マスターシェフ", baseLineId: "cook_line", tier: 5, requiredLevel: null, requiredProductionLevel: 200, statGrowthBonus: {}, passiveBonus: {}, skillList: [], descriptionJa: "究極の料理を生み出す神域職。", jobType: "production", productionBonus: { craftSuccessRate: 0.1, highQualityRate: 0.052, divineQualityRate: 0.016, productionExpRate: 0.22 } }
};

const JOB_EVOLUTION_DATA = { ...BATTLE_JOB_EVOLUTION_DATA, ...PRODUCTION_JOB_EVOLUTION_DATA };

const PRODUCTION_JOB_LABELS = {
  apothecary: "薬師",
  blacksmith: "鍛冶師",
  cook: "調理人"
};

function getJobDataById(jobId) {
  if (!jobId) return null;
  if (JOB_EVOLUTION_DATA[jobId]) {
    return JOB_EVOLUTION_DATA[jobId];
  }
  const base = JOB_DATA.main[jobId];
  if (!base) {
    return null;
  }
  const lineMap = {
    swordman: "swordsman_line",
    ninja: "ninja_line",
    mage: "mage_line",
    cleric: "priest_line"
  };
  return {
    id: base.id,
    nameJa: base.name,
    baseLineId: lineMap[base.id] || `${base.id}_line`,
    tier: 1,
    requiredLevel: 1,
    requiredProductionLevel: null,
    statGrowthBonus: { hp: 1, mp: 1, attack: 1, defense: 1, speed: 1, intelligence: 1, luck: 1 },
    passiveBonus: {},
    skillList: (SKILL_DATA[base.id] || []).map((s) => s.id),
    descriptionJa: base.description || "",
    jobType: "battle"
  };
}

function getJobLineById(lineId) {
  return JOB_LINE_DATA[lineId] || [];
}

function getCurrentJobTierByLineAndId(lineId, jobId) {
  const line = getJobLineById(lineId);
  const idx = line.indexOf(jobId);
  return idx >= 0 ? idx + 1 : 1;
}

function getJobIdByTier(lineId, tier) {
  const line = getJobLineById(lineId);
  return line[Math.max(0, Math.min(line.length - 1, tier - 1))] || null;
}

function getNextJobId(lineId, currentTier) {
  const line = getJobLineById(lineId);
  return line[currentTier] || null;
}

function ensureUnlockedSkillsState() {
  if (!state.unlockedSkills || typeof state.unlockedSkills !== "object") {
    state.unlockedSkills = { battle: {} };
  }
  if (!state.unlockedSkills.battle || typeof state.unlockedSkills.battle !== "object") {
    state.unlockedSkills.battle = {};
  }
  return state.unlockedSkills;
}

function unlockSkillIdsForLine(lineId, skillIds) {
  if (!lineId || !Array.isArray(skillIds)) {
    return [];
  }
  ensureUnlockedSkillsState();
  const prev = state.unlockedSkills.battle[lineId] || [];
  const merged = [...new Set([...prev, ...skillIds.filter(Boolean)])];
  state.unlockedSkills.battle[lineId] = merged;
  return merged.filter((id) => !prev.includes(id));
}

function getUnlockedSkillIdsForLine(lineId) {
  ensureUnlockedSkillsState();
  return [...(state.unlockedSkills.battle[lineId] || [])];
}

function getUnlockedSkillNamesForLine(lineId) {
  return getUnlockedSkillIdsForLine(lineId).map((id) => SKILL_INDEX_BY_ID[id]?.nameJa || id);
}

function ensureJobEvolutionFlags() {
  if (!state.jobEvolutionFlags || typeof state.jobEvolutionFlags !== "object") {
    state.jobEvolutionFlags = {};
  }
  if (!state.jobEvolutionFlags.main) state.jobEvolutionFlags.main = {};
  if (!state.jobEvolutionFlags.sub) state.jobEvolutionFlags.sub = {};
  if (!state.jobEvolutionFlags.production) state.jobEvolutionFlags.production = {};
}

const LOG_CATEGORIES = ["battle", "title", "craft", "board", "loop", "important", "system"];
const LOG_CATEGORY_LABELS = {
  all: "すべて",
  battle: "戦闘",
  title: "称号",
  craft: "生産",
  board: "掲示板",
  loop: "周回",
  important: "重要",
  system: "システム"
};

const state = {
  screen: "title",
  introIndex: 0,
  currentTab: "adventure",
  statusSubTab: "profile",
  titleCatalogFilter: "all",
  titleCatalogStatusFilter: "all",
  titleCatalogEffectFilter: "all",
  titleCatalogSortMode: "default",
  titleCatalogSearch: "",
  titleCatalogPageNormal: 1,
  titleCatalogPageCheat: 1,
  titleFavorites: {},
  equipmentFavorites: {},
  battleSpeedMultiplier: 1,
  unlockedBattleSpeedOptions: [1],
  unlockedTitles: [],
  activeTitles: [],
  equippedNormalTitleIds: [],
  equippedCheatTitleIds: [],
  titleLimit: 1,
  titleLimitBase: 1,
  titleLimitBonus: 0,
  titleLimitUpgradeLevel: 0,
  unlockedTitleLimitUpgrades: [],
  baseNormalTitleSlots: 1,
  baseCheatTitleSlots: 1,
  normalTitleTierBonus: 0,
  cheatTitleTierBonus: 0,
  maxNormalTitleSlots: 1,
  maxCheatTitleSlots: 1,
  titleSlotUnlocks: {
    normalBasePlus: 0,
    cheatBasePlus: 0,
    normalBaseUnlocked: false,
    cheatBaseUnlocked: false,
    normalCanUpgrade: true,
    cheatCanUpgrade: true
  },
  clearedRegionBossSlotRewards: createDefaultRegionBossSlotRewardState(),
  cheatTitleSlotShopPurchases: createDefaultCheatTitleSlotShopState(),
  bossClearNormalTitleSlotBonus: 0,
  bossClearCheatTitleSlotBonus: 0,
  cheatTitleShopSlotBonus: 0,
  titleEffects: createDefaultTitleEffects(),
  unlockedTowns: ["balladore"],
  hasNeverendTicket: false,
  neverendUnlocked: false,
  neverendVipUnlocked: false,
  chips: 0,
  neverendBossClearFlags: {},
  auctionRefreshState: createDefaultAuctionRefreshState(),
  rouletteStats: createDefaultRouletteStats(),
  neverendUi: createDefaultNeverendUiState(),
  clearedStages: [],
  currentTown: "balladore",
  currentMap: TOWN_DATA.balladore.mapId,
  currentStage: "1-1",
  currentStageKillCount: 0,
  currentStageTargetKills: STAGE_DATA["1-1"].targetKills,
  autoUseItems: createDefaultAutoUseItems(),
  fieldBossCleared: [],
  uniqueDefeatedIds: [],
  uniqueEncounterCount: 0,
  uniqueKillCount: 0,
  unlockedUniqueSkills: [],
  stageProgressById: {},
  skillCooldowns: {},
  activeEffects: [],
  board: {
    threads: [],
    selectedThreadId: null,
    selectedCategory: "all",
    sortMode: "new",
    searchText: "",
    unreadOnly: false,
    unlockedThreadIds: [],
    readThreadIds: [],
    newThreadIds: [],
    lastOpenedAtById: {},
    dynamicVariantHistory: {}
  },
  settings: {
    bgmOn: true,
    notificationLevel: "normal",
    speedEffectEmphasis: true,
    lightweightMode: false,
    saveConfirmDialog: false
  },
  loop: {
    clearedGame: false,
    loopCount: 0,
    unlockedFeatures: [],
    loopRewardFlags: {},
    loopBossKillFlags: {},
    specialChallengeClearFlags: {},
    persistentUnlocks: {},
    unlockedLoopChallengeIds: [],
    carryOverCandidates: [],
    selectedCarryOverTitleIds: [],
    carryOverLimit: 1,
    carriedTitles: [],
    titleHistory: [],
    persistentStats: {
      totalLoops: 0,
      totalPlaytime: 0,
      lifetimePlaytime: 0,
      totalTitlesUnlockedLifetime: 0,
      totalBossKillsLifetime: 0,
      totalUniqueKillsLifetime: 0,
      totalCraftsLifetime: 0,
      totalGoldEarnedLifetime: 0,
      totalDeathsLifetime: 0,
      totalTimerClicksLifetime: 0,
      bestLoopLevel: 1,
      bestLoopClearTime: 0,
      maxTitleLimitReached: 1,
      totalGoldLifetime: 0,
      totalCraftsLifetime: 0,
      totalEnhancesLifetime: 0,
      totalBossFirstTryWins: 0,
      totalLoopBossKillsLifetime: 0,
      highestLoopReached: 0,
      maxTitleLimitUnlocked: 1,
      persistentUnlockFlags: {},
      unlockedEndings: [],
      worldAnomalyLevel: 0
    },
    carryUniqueRecords: true,
    loopSummaries: []
  },
  unlockedEndings: [],
  endingProgressFlags: {},
  trueEndEligible: false,
  hiddenEndEligible: false,
  chaosEndEligible: false,
  finalContentUnlocked: false,
  finalBossFlags: {},
  worldStateFlags: {},
  jobEvolutionFlags: {
    main: { canEvolve: false, hasUnread: false, targetJobId: null, manualWaiting: false, autoEvolved: false },
    sub: { canEvolve: false, hasUnread: false, targetJobId: null, manualWaiting: false, autoEvolved: false },
    production: { canEvolve: false, hasUnread: false, targetJobId: null, manualWaiting: false, autoEvolved: false }
  },
  unlockedSkills: { battle: {} },
  ui: {
    titlePopupTimeoutId: null,
    battleSpecialPopupTimeoutId: null,
    titleScreenIdleTimerStartedAt: Date.now(),
    clearResultShown: false,
    navigationHistory: [],
    selectedEquipmentSlotId: "weapon1",
    logFilter: "all",
    logAutoScroll: true,
    toastQueue: [],
    toastSeq: 0,
    centerPopupTimeoutId: null,
    centerPopup: null,
    helpOpen: false,
    topHudCollapsed: false,
    autoItemVisualEffects: {},
    lastMainTab: "adventure",
    selectedSkillSlot: 0,
    skillVisualEffects: {},
    systemSubTab: "save",
    titleCatalogSummaryCollapsed: false
  },
  titleRuntime: {
    reviveBuffPending: false,
    reviveAttackBuffUntil: 0,
    reviveProtectionUntil: 0,
    firstBattleProtectionUsed: false,
    swordsmanChargeReady: false,
    swordsmanReflectReady: false,
    flashSwordsmanEvasionUntil: 0,
    comboReflectReady: false,
    comboInvincibleUntil: 0,
    comboExtraStrikeDepth: 0
  },
  stats: {
    totalBattles: 0,
    totalWins: 0,
    totalDeaths: 0,
    totalKills: 0,
    enemyKillCounts: {},
    damageTakenTotal: 0,
    titleCatalogOpened: 0,
    titleToggleCount: 0,
    timerClickCount: 0,
    totalGoldEarned: 0,
    oneGoldPickupCount: 0,
    totalShopTrades: 0,
    totalCrafts: 0,
    craftFailures: 0,
    totalEnhances: 0,
    totalCraftExp: 0,
    craftCountByType: {},
    craftCountByRecipe: {},
    craftSuccessCount: 0,
    craftFailureCount: 0,
    craftGreatSuccessCount: 0,
    craftHighQualityCount: 0,
    craftGodQualityCount: 0,
    enhanceSuccessCount: 0,
    producedItemCounts: {},
    gatheredMaterialCounts: {},
    guildQuestCompleted: 0,
    guildPointsEarned: 0,
    townVisitCount: 0,
    viewSwitchCount: 0,
    noTitleBattleStreak: 0,
    stageClearCount: 0,
    stageClearById: {},
    fieldBossKillCount: 0,
    townUnlockCount: 0,
    uniqueEncounterCount: 0,
    uniqueKillCount: 0,
    uniqueKillById: {},
    battlesByRegion: {},
    winsByRegion: {},
    highestReachedStage: "1-1",
    subJobUnlockedAt: null,
    idleGrasslandSeconds: 0,
    titleScreenIdleSeconds: 0,
    noBattleSinceLoginSeconds: 0,
    currentLoopPlaytime: 0,
    attacksMissed: 0,
    hpOneDigitWins: 0,
    totalGatheredMaterials: 0,
    smithEnhanceCount: 0,
    cookingCraftCount: 0,
    cookingFailureCount: 0,
    spellUseCount: 0,
    healSkillUseCount: 0,
    noItemStageClearCount: 0,
    noRestStageClearStreak: 0,
    returnButtonCount: 0,
    bgmOffBattleCount: 0,
    stageRepeatCounts: {},
    defeatsByStage: {},
    firstTryBossWins: 0,
    bossCritFinishCount: 0,
    defenseBuildBossKills: 0,
    noWeaponBossKills: 0,
    subJoblessBossClears: 0,
    speedModeSeconds: 0,
    mainJobUsage: {},
    productionJobHistory: {},
    titleComboHistory: {},
    equipmentBuildHistory: {},
    fullEquipWins: 0,
    overweightWins: 0,
    extremeOverweightClears: 0,
    equipmentSlotUsageCounts: {},
    maxWeightReached: 0,
    totalEquipChanges: 0,
    boardViewedCount: 0,
    threadOpenedCounts: {},
    boardThreadUnlockCount: 0,
    boardThreadReadCount: 0,
    boardCategoryViewCounts: {},
    boardReactionFlags: {},
    boardHintSeenFlags: {},
    boardDynamicVariantHistory: {},
    nearDeathWins: 0,
    currentWinStreak: 0,
    loopClearWithLowTierJob: 0,
    loopClearWithProductionFocus: 0,
    noSubJobBossKillCount: 0,
    craftedGearBossKillCount: 0,
    godQualityCraftCount: 0,
    unexpectedBuildMatchCount: 0,
    totalUniqueTypesDefeated: 0,
    highestBattleSpeedUnlocked: 1,
    totalBossFirstTryWins: 0,
    totalNoDamageStageClears: 0,
    totalConsecutiveWinsBest: 0,
    totalGoldLifetime: 0,
    totalCraftsLifetime: 0,
    totalEnhancesLifetime: 0,
    totalTitleCombosTried: 0,
    highestLoopReached: 0,
    loopChallengeClearCount: 0,
    enhancedBossKillCount: 0,
    highDifficultyStageClearCount: 0,
    loopOnlyTitleCount: 0,
    maxTitleLimitUnlocked: 1,
    specialChallengeAttempts: 0,
    specialChallengeWins: 0,
    persistentUnlockFlags: {},
    totalLoopBossKillsLifetime: 0,
    endingEligibilityFlags: {},
    trueRouteProgress: 0,
    hiddenRouteProgress: 0,
    chaosRouteProgress: 0,
    finalContentClearFlags: {},
    finalBossAttemptCounts: {},
    finalBossClearCounts: {},
    endingHintSeenFlags: {},
    worldAnomalyLevel: 0,
    poisonTakenCount: 0,
    paralyzeTakenCount: 0,
    burnTakenCount: 0,
    bleedTakenCount: 0,
    lowHpBossKillCount: 0,
    seaSpecialEnemyKillCount: 0,
    volcanoBurnWinCount: 0,
    seaEvadeSuccessCount: 0,
    volcanoDefenseSkillUseCount: 0,
    weaponEnhanceCount: 0,
    armorEnhanceCount: 0,
    lightWeightWinCount: 0,
    heavyWeightWinCount: 0,
    fullHpHealCastCount: 0,
    overhealConvertedTotal: 0,
    magicFinishCount: 0,
    critFinishCountAll: 0,
    normalSlotsFullBattleWins: 0,
    desertNoRestStageClearStreak: 0,
    fullNormalHeavyWinCount: 0,
    bossKillWithEmptySkillSlots: 0,
    uniqueNoRetreatResolveCount: 0,
    uniqueRetreatCount: 0,
    noReturnExpeditionActive: true,
    noReturnRegionClears: {},
    grasslandWinStreakCurrent: 0,
    grasslandWinStreakBest: 0,
    swordsmanSingleWeaponBossKillCount: 0,
    mageDualWeaponBossKillCount: 0,
    ninjaNoWeaponDebuffApplyCount: 0,
    ninjaGrasslandDebuffApplyCount: 0,
    ninjaNoWeaponBossKillCount: 0,
    ninjaLowEvasionBossDefeatCount: 0,
    ninjaStage11DefeatCount: 0,
    priestNoSkillKillCount: 0,
    priestNoHealWinCount: 0,
    priestOnlyOffenseWinCount: 0,
    priestHelpToggleCount: 0,
    priestSettingsSaveCount: 0,
    priestDesertBossClearCount: 0,
    priestDesertBossWithFourHealsCount: 0,
    swordsmanBossKillCount: 0,
    swordsmanDesertBossClearCount: 0,
    swordsmanNoArmorDesertBossClearCount: 0,
    mageDesertBossSingleSkillClearCount: 0,
    mageDesertBossFourAttackSkillsClearCount: 0,
    mageDesertBossFourBuffSkillsClearCount: 0,
    mageBossDefeatCount: 0,
    comboDesertBossClear_swordsman_swordsman: 0,
    comboDesertBossClear_mage_swordsman: 0,
    comboDesertBossClear_ninja_swordsman: 0,
    comboDesertBossClear_priest_swordsman: 0,
    comboDesertBossClear_mage_mage: 0,
    comboDesertBossClear_mage_ninja: 0,
    comboDesertBossClear_mage_priest: 0,
    comboDesertBossClear_ninja_ninja: 0,
    comboDesertBossClear_ninja_priest: 0,
    comboDesertBossClear_priest_priest: 0,
    productionWorkshopButtonPressCount: 0,
    productionWorkshopStaySeconds: 0,
    productionWorkshopStayMs: 0
  },
  guild: {
    rank: "D",
    points: 0,
    guildRankNormalTitleSlotBonus: 0,
    guildRankCheatTitleSlotBonus: 0,
    guildQuestLastGeneratedRegion: "grassland",
    guildQuestRefreshVersion: 0,
    lastRankCapNoticeKey: "",
    selectedFacility: "reception",
    activeQuestIds: [],
    activeGuildQuests: [],
    completedQuestIds: [],
    claimedQuestIds: [],
    guildQuestPool: [],
    clearedQuestHistory: [],
    questRepeatLevels: {},
    questGenerationSeed: 1,
    guildQuestStats: { generated: 0, completed: 0, claimed: 0, refreshed: 0 },
    maxActiveQuests: 3,
    workshopTab: "craft",
    shopRegionTab: "grassland",
    shopMode: "buy"
  },
  battle: {
    isActive: false,
    stageId: null,
    status: "待機中", playerCurrentHp: 0,
    playerCurrentMp: 0,
    enemy: null,
    intervalId: null,
    playerNextActionAt: 0,
    enemyNextActionAt: 0,
    skillRotationIndex: 0,
    recentActionText: "",
    pendingSpawnAt: 0,
    isFieldBossBattle: false,
    isUniqueBattle: false,
    stageKillCount: 0,
    stageTargetKills: 0,
    itemUsedInStage: false,
    gimmick: {
      warnedAt: 0,
      triggered: false,
      extra: {}
    },
    scaledBossGimmick: null,
    uniqueGimmickProfile: null,
    uniqueCombatProfile: null,
    critFinishThisBoss: false
    ,
    stageDamageTaken: 0,
    loopChallengeId: null,
    autoItemGlobalCooldownUntil: 0
  },
  player: {
    name: "プレイヤー",
    level: 1,
    exp: 0,
    gold: 100,
    mainJobId: null,
    mainJob: null,
    mainJobBaseId: null,
    mainJobTier: 1,
    mainJobCurrentId: null,
    subJobId: null,
    subJob: null,
    subJobBaseId: null,
    subJobTier: 1,
    subJobCurrentId: null,
    subJobUnlocked: false,
    productionJob: "apothecary",
    productionJobBaseId: "apothecary",
    productionJobTier: 1,
    productionJobCurrentId: "apothecary",
    productionJobLevel: 1,
    productionJobExp: 0,
    productionJobStage: 0,
    productionProgress: {
      apothecary: { level: 1, exp: 0, stage: 0, crafts: 0 },
      blacksmith: { level: 1, exp: 0, stage: 0, crafts: 0 },
      cook: { level: 1, exp: 0, stage: 0, crafts: 0 }
    },
    maxHp: 100,
    hp: 100,
    maxMp: 30,
    mp: 30,
    attack: 10,
    defense: 10,
    speed: 10,
    intelligence: 10,
    luck: 10,
    currentTown: TOWN_DATA.balladore.name,
    equippedWeaponId: "woodSword",
    equippedArmorId: "leatherCap",
    equippedHeadId: "noviceRobe",
    equipmentSlots: {
      weapon1: "woodSword",
      weapon2: null,
      armor1: "leatherCap",
      armor2: "noviceRobe",
      accessory1: null,
      accessory2: null
    },
    weightCapacityBase: 40,
    inventory: [
      { itemId: "potion", quantity: 3 },
      { itemId: "ether", quantity: 1 },
      { itemId: "herb", quantity: 6 },
      { itemId: "woodSword", quantity: 1 },
      { itemId: "leatherCap", quantity: 1 },
      { itemId: "noviceRobe", quantity: 1 },
      { itemId: "swiftRing", quantity: 1 },
      { itemId: "shadowDagger", quantity: 1 }
    ],
    equipmentEnhancements: {},
    craftedItemInstances: [],
    equippedSkills: [null, null, null, null],
    logs: []
  },
  world: {
    towns: TOWN_DATA,
    maps: MAP_DATA,
    stages: STAGE_DATA,
    enemies: ENEMY_DATA,
    uniqueEnemies: UNIQUE_ENEMY_DATA,
    jobs: JOB_DATA,
    jobLines: JOB_LINE_DATA,
    jobEvolution: JOB_EVOLUTION_DATA,
    subJobBonus: SUB_JOB_BONUS_DATA,
    items: ITEM_DATA,
    skills: SKILL_DATA,
    titles: TITLE_DATA,
    quests: QUEST_DATA
  },
  runtime: {
    bossAttemptCounts: {},
    loopStartedAt: Date.now(),
    buildTags: [],
    exploitTags: [],
    lastHitMeta: null,
    lastAutoSaveAt: 0,
    pendingAutoSaveTrigger: null
  }
};

const app = document.getElementById("app");

state.autoUseItems = normalizeAutoUseItems(state.autoUseItems);

Object.keys(STAGE_DATA).forEach((stageId) => {
  state.stageProgressById[stageId] = { kills: 0, target: STAGE_DATA[stageId].targetKills, cleared: false };
});
initializeJobEvolutionState({ silent: true });
ensureTitleSlotState();

function createDefaultTitleEffects() {
  return {
    allStatsFlat: 0,
    allStatsMultiplier: 0,
    attackMultiplier: 0,
    defenseMultiplier: 0,
    goldMultiplier: 0,
    expMultiplier: 0,
    damageToSpecies: {},
    damageToBoss: 0,
    damageToUnique: 0,
    uniqueDamageBonus: 0,
    uniqueEncounterRateBonus: 0,
    critRateBonus: 0,
    speedMultiplier: 0,
    battleStartBuff: null,
    conditionalBonusNoTitle: null,
    unlockBattleSpeed: [],
    speedModeBonus: null,
    craftSuccessBonus: 0,
    enhanceSuccessBonus: 0,
    bossDamageBonus: 0,
    reviveBuff: null,
    noSubJobBonus: 0,
    lowTierJobBonus: 0,
    craftedGearBonus: 0,
    overweightBonus: 0,
    titleLimitBonus: 0,
    weightPenaltyReduction: 0,
    ignoreWeightPenalty: false,
    slotFillAttackDefenseBonus: 0,
    potionCraftBonusChance: 0,
    extraCraftChance: 0,
    workshopCostReduction: 0,
    qualityStepUpChance: 0,
    smithEnhanceBonus: 0,
    alchemyEffectBonus: 0,
    cookingDurationBonus: 0,
    conditionalBuffByLoop: null,
    conditionalBuffByNoTitle: null,
    randomBattleStartBuff: null,
    statusAilmentResist: 0,
    accuracyBonus: 0,
    statusResistByType: {},
    regionDamageBonus: {},
    regionDamageReduction: {},
    regionAccuracyBonus: {},
    regionStageRegenPerMinute: {},
    regionStatMultiplier: {},
    lowHpConditionalCombat: null,
    burnConditionalAttackMultiplier: 0,
    ignoreBurnAttackPenalty: false,
    perNormalEquippedAttackDefenseBonus: 0,
    perNormalEquippedAttackDefenseBonusCap: 0.15,
    weaponEnhanceAttackPerLevel: 0,
    weaponEnhanceAttackMax: 0,
    armorEnhanceDefensePerLevel: 0,
    armorEnhanceDefenseMax: 0,
    equipmentQualityEffectBonus: 0,
    weightConditionalBonuses: {},
    overhealConversionBonus: 0,
    overhealActiveDefenseMultiplier: 0,
    skillCooldownRecovery: 0,
    skillPowerIfSkillSlotOpen: 0,
    skillCooldownRecoveryIfSkillSlotOpen: 0,
    critDamageBonus: 0,
    perEquippedAttackDefenseBonus: 0,
    perEquippedAttackDefenseBonusCap: 0.2,
    noReturnCombatBonus: null,
    skillDamageMultiplier: 0,
    swordsmanSkillDamageMultiplier: 0,
    mageSkillDamageMultiplier: 0,
    priestNonHealSkillDamageMultiplier: 0,
    priestOffensiveSkillDamageMultiplier: 0,
    priestOverhealExtraDefenseStackSerious: false,
    priestOverhealExtraDefenseStackTooSerious: false,
    priestDamageHalfChance: 0,
    priestHealDoubleChance: 0,
    swordsmanLifestealChance: 0,
    swordsmanLifestealRatio: 0,
    swordsmanChargeChance: 0,
    swordsmanChargeDamageMultiplier: 1,
    swordsmanFlashEvasionOnHit: false,
    swordsmanReflectReadyChance: 0,
    swordsmanReflectRate: 0,
    mageSingleSkillDamageBonus: 0,
    mageFourSkillDamageBonus: 0,
    mageBuffSkillAmplify: 0,
    mageSacrificeAttackMultiplier: 1,
    mageSacrificeSelfHpRate: 0,
    comboDoubleStrikeChance: 0,
    comboBattleStartRandomBuff: null,
    comboBattleStartRandomBuffCount: 0,
    comboReflectReadyChance: 0,
    comboReflectRate: 0,
    comboBattleStartInvincibleMs: 0,
    comboDebuffSkillAmplify: 0,
    comboBuffSkillAmplify: 0,
    comboEvasionHealScaling: 0,
    ninjaLowEvasionConditional: null,
    evadeByRegion: {},
    firstBattleDamageReduction: 0,
    lowHpDefenseMultiplier: 0,
    lowHpDamageReduction: 0,
    gatherMultiplier: 0,
    guildPointMultiplier: 0,
    enhanceCostReduction: 0,
    cookedSellMultiplier: 0,
    mpCostReduction: 0,
    healMultiplier: 0,
    sellPriceMultiplier: 0,
    productionExpRateBonus: 0,
    qualityMaterialRefundChance: 0,
    defenseToAttackRatio: 0,
    noWeaponAttackBonus: 0,
    stageRegenPerMinute: 0,
    cookGreatSuccessRateBonus: 0
  };
}

function nowTimeText() {
  return new Date().toLocaleTimeString("ja-JP", { hour12: false });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function inferLogCategory(text) {
  const normalized = String(text || "");
  if (/称号|titleLimit|装備上限/.test(normalized)) return "title";
  if (/生産|工房|強化|品質|レシピ|素材|作成/.test(normalized)) return "craft";
  if (/掲示板|スレッド/.test(normalized)) return "board";
  if (/周回|ループ|引き継ぎ|エンディング|最終領域/.test(normalized)) return "loop";
  if (/ボス|ユニーク|解放|神品質|警告|予兆|ギミック/.test(normalized)) return "important";
  if (/戦闘|敵|ダメージ|撃破|勝利|敗北|ステージ|EXP|GOLD|回復/.test(normalized)) return "battle";
  return "system";
}

function addLog(text, category = "auto", options = {}) {
  const resolvedCategory = category === "auto" ? inferLogCategory(text) : category;
  const important = !!options.important || resolvedCategory === "important";
  state.player.logs.push({ at: nowTimeText(), text, category: resolvedCategory, important });
  if (state.player.logs.length > MAX_LOG_LINES) {
    state.player.logs = state.player.logs.slice(-MAX_LOG_LINES);
  }
  if (important && state.screen === "game") {
    showToast(text, resolvedCategory);
  }
  if (state.screen === "game") {
    renderLogPanel();
    renderNotifications();
  }
}

function createNavigationSnapshot() {
  return {
    screen: state.screen,
    currentTab: state.currentTab,
    statusSubTab: state.statusSubTab,
    guildFacility: state.guild.selectedFacility,
    guildWorkshopTab: state.guild.workshopTab,
    guildShopRegionTab: state.guild.shopRegionTab,
    guildShopMode: state.guild.shopMode || "buy",
    currentTown: state.currentTown,
    currentMap: state.currentMap,
    currentStage: state.currentStage,
    boardSelectedThreadId: state.board.selectedThreadId || null,
    boardCategory: state.board.selectedCategory || "all",
    boardSortMode: state.board.sortMode || "new",
    boardSearchText: state.board.searchText || "",
    boardUnreadOnly: !!state.board.unreadOnly
  };
}

function isSameNavigationSnapshot(a, b) {
  if (!a || !b) {
    return false;
  }
  return (
    a.screen === b.screen &&
    a.currentTab === b.currentTab &&
    a.statusSubTab === b.statusSubTab &&
    a.guildFacility === b.guildFacility &&
    a.guildWorkshopTab === b.guildWorkshopTab &&
    a.guildShopRegionTab === b.guildShopRegionTab &&
    a.guildShopMode === b.guildShopMode &&
    a.currentTown === b.currentTown &&
    a.currentMap === b.currentMap &&
    a.currentStage === b.currentStage &&
    a.boardSelectedThreadId === b.boardSelectedThreadId &&
    a.boardCategory === b.boardCategory &&
    a.boardSortMode === b.boardSortMode &&
    a.boardSearchText === b.boardSearchText &&
    a.boardUnreadOnly === b.boardUnreadOnly
  );
}

function pushNavigationHistory() {
  if (state.screen !== "game") {
    return;
  }
  const snapshot = createNavigationSnapshot();
  const history = state.ui.navigationHistory;
  const last = history[history.length - 1];
  if (!last || !isSameNavigationSnapshot(last, snapshot)) {
    history.push(snapshot);
    if (history.length > 50) {
      history.shift();
    }
  }
}

function applyNavigationSnapshot(snapshot) {
  state.screen = snapshot.screen || "game";
  state.currentTab = snapshot.currentTab || "adventure";
  state.statusSubTab = snapshot.statusSubTab || "profile";
  state.guild.selectedFacility = snapshot.guildFacility || "reception";
  state.guild.workshopTab = snapshot.guildWorkshopTab || "craft";
  state.guild.shopRegionTab = SHOP_REGION_TABS.some((tab) => tab.id === snapshot.guildShopRegionTab) ? snapshot.guildShopRegionTab : "grassland";
  state.guild.shopMode = snapshot.guildShopMode === "sell" ? "sell" : "buy";
  state.currentTown = snapshot.currentTown || state.currentTown;
  state.currentMap = snapshot.currentMap || state.currentMap;
  state.currentStage = snapshot.currentStage || state.currentStage;
  state.board.selectedThreadId = snapshot.boardSelectedThreadId || state.board.selectedThreadId;
  state.board.selectedCategory = snapshot.boardCategory || state.board.selectedCategory || "all";
  state.board.sortMode = snapshot.boardSortMode || state.board.sortMode || "new";
  state.board.searchText = snapshot.boardSearchText ?? state.board.searchText ?? "";
  state.board.unreadOnly = typeof snapshot.boardUnreadOnly === "boolean" ? snapshot.boardUnreadOnly : !!state.board.unreadOnly;
  state.player.currentTown = TOWN_DATA[state.currentTown]?.name || state.player.currentTown;

  const stage = STAGE_DATA[state.currentStage];
  if (stage) {
    state.currentStageKillCount = getStageProgress(stage.id).kills;
    state.currentStageTargetKills = stage.targetKills;
  }
}

function goBackOneView() {
  if (state.battle.isActive) {
    stopBattleLoop();
    state.battle.isActive = false;
    state.battle.status = "待機";
    addLog("戦闘を中断して前の画面に戻ります。");
  }

  const current = createNavigationSnapshot();
  while (
    state.ui.navigationHistory.length > 0 &&
    isSameNavigationSnapshot(state.ui.navigationHistory[state.ui.navigationHistory.length - 1], current)
  ) {
    state.ui.navigationHistory.pop();
  }

  const previous = state.ui.navigationHistory.pop();
  if (!previous) {
    addLog("これ以上戻れる画面がありません。");
    render();
    return;
  }
  applyNavigationSnapshot(previous);
  addLog("一つ前の画面へ戻りました。");
  render();
}

function render() {
  if (state.screen === "title") {
    renderTitleScreen();
    return;
  }
  if (state.screen === "intro") {
    renderIntroScreen();
    return;
  }
  if (state.screen === "jobSelect") {
    renderJobSelectScreen();
    return;
  }
  if (state.screen === "clearResult") {
    renderLoopResultView();
    return;
  }
  if (state.screen === "carryOverSelection") {
    renderCarryOverSelectionView();
    return;
  }
  renderGameScreen();
}

function renderPreservingWindowScroll() {
  const scrollY = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
  render();
  requestAnimationFrame(() => {
    window.scrollTo(0, scrollY);
  });
}

function renderTitleScreen() {
  const hasSave = !!safeLoadJson(STORAGE_KEYS.MAIN) || !!safeLoadJson(STORAGE_KEYS.BACKUP);
  app.innerHTML = `
    <section class="screen title-screen">
      <p class="subtitle">ブラウザシングルプレイRPG</p>
      <h1 class="game-title">どっかで見たことあるMMORPG</h1>
      <p class="subtitle">なろう系MMOの世界へようこそ。</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
        <button id="continue-btn" class="btn btn-primary" ${hasSave ? "" : "disabled"}>続きから</button>
        <button id="start-btn" class="btn">最初から</button>
        <button id="title-settings-btn" class="btn">設定</button>
        <button id="title-data-btn" class="btn">データ管理</button>
      </div>
    </section>
  `;
  const continueBtn = document.getElementById("continue-btn");
  if (continueBtn) {
    continueBtn.addEventListener("click", () => {
      const ok = loadGame();
      if (ok) {
        addLog("セーブデータをロードしました。");
        state.screen = "game";
      }
      render();
    });
  }
  document.getElementById("start-btn").addEventListener("click", () => {
    state.screen = "intro";
    state.introIndex = 0;
    addLog("ゲーム開始。導入シーケンスを開始しました。");
    render();
  });
  const settingsBtn = document.getElementById("title-settings-btn");
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      state.screen = "game";
      state.currentTab = "system";
      state.ui.systemSubTab = "settings";
      render();
    });
  }
  const dataBtn = document.getElementById("title-data-btn");
  if (dataBtn) {
    dataBtn.addEventListener("click", () => {
      state.screen = "game";
      state.currentTab = "system";
      state.ui.systemSubTab = "save";
      render();
    });
  }
}

function renderIntroScreen() {
  const message = INTRO_MESSAGES[state.introIndex];
  const isLast = state.introIndex >= INTRO_MESSAGES.length - 1;
  app.innerHTML = `
    <section class="screen intro-box">
      <h2>導入イベント</h2>
      <div class="panel">
        <h3 class="speaker">${escapeHtml(message.speaker)}</h3>
        <p class="message">${escapeHtml(message.text)}</p>
      </div>
      <div><button id="intro-next-btn" class="btn btn-primary">${isLast ? "ジョブ選択へ" : "次へ"}</button></div>
    </section>
  `;
  document.getElementById("intro-next-btn").addEventListener("click", () => {
    if (!isLast) {
      state.introIndex += 1;
      render();
      return;
    }
    state.screen = "jobSelect";
    render();
  });
}

function renderJobSelectScreen() {
  const cards = Object.values(JOB_DATA.main)
    .map((job) => `<div class="job-card"><h3>${job.name}</h3><p>${job.description}</p><button class="btn job-select-btn" data-job-id="${job.id}">このジョブで開始</button></div>`)
    .join("");
  app.innerHTML = `
    <section class="screen job-box">
      <h2>初期ジョブ選択</h2>
      <div class="job-grid">${cards}</div>
    </section>
  `;
  document.querySelectorAll(".job-select-btn").forEach((btn) => btn.addEventListener("click", () => chooseMainJob(btn.dataset.jobId)));
}

function chooseMainJob(jobId) {
  const job = JOB_DATA.main[jobId];
  if (!job) {
    return;
  }
  syncMainJobState(job.id, 1, job.id, true);
  initializeJobEvolutionState({ silent: true });
  state.player.equippedSkills = getUnlockedSkillIdsForLine(getJobDataById(job.id)?.baseLineId).slice(0, 4);
  recalculateTitleEffects();
  refreshPlayerDerivedStats();
  applyLoopUnlocks();
  applyLoopTitleLimitUpgrades();
  state.screen = "game";
  state.currentTab = "adventure";
  addLog(`初期ジョブを選択: ${job.name}`);
  render();
}

function renderGameScreen() {
  applyLoopUnlocks();
  app.innerHTML = `
    <section class="game-layout-wrap">
      ${renderTopBar()}
      ${renderNotifications()}

      <section class="screen game-layout">
        <aside class="log-panel">
          <h3 class="panel-title">ログ</h3>
          ${renderLogFilters()}
          <ul id="log-list" class="log-list"></ul>
        </aside>
        <main class="main-panel">
          <div class="back-wrap"><button id="back-to-title-btn" class="btn">一つ前に戻る</button></div>
          <div id="main-view" class="main-view"></div>
        </main>
        <nav class="bottom-panel">
          ${MAIN_TABS.map((tab) => `<button class="btn tab-btn ${state.currentTab === tab.id ? "active" : ""}" data-tab-id="${tab.id}">${tab.label}</button>`).join("")}
        </nav>
      </section>

      <div id="title-unlock-popup" class="title-popup"></div>
      <div id="battle-special-popup" class="title-popup special-popup"></div>
      <div id="center-popup" class="center-popup"></div>
      <div id="toast-stack" class="toast-stack"></div>
      ${renderHelpPanel()}
    </section>
  `;
  renderLogPanel();
  renderMainView();
  renderNotifications();
  bindGameEvents();
}

function renderTopBar() {
  ensureNeverendState();
  ensureOtherworldState();
  syncOtherworldUnlockState({ silent: true });
  ensureTitleSlotState();
  const activeNames = getCombinedEquippedTitleIds().map((id) => getTitleById(id)?.name).filter(Boolean);
  const normalCount = state.equippedNormalTitleIds.length;
  const cheatCount = state.equippedCheatTitleIds.length;
  const effective = getEffectivePlayerStats();
  const weightInfo = effective.weightInfo;
  const stageLabel = STAGE_DATA[state.currentStage]?.name || state.currentStage;
  const collapsed = !!state.ui.topHudCollapsed;
  if (collapsed) {
    return `
      <div class="hud-top panel collapsed">
        <div class="hud-actions">
          <button id="topbar-toggle-btn" class="btn">開く</button>
        </div>
      </div>
    `;
  }
  return `
    <div class="hud-top panel">
      <div class="hud-actions">
        ${renderSpeedControl()}
        <button id="bgm-toggle-btn" class="btn">${state.settings.bgmOn ? "BGM:ON" : "BGM:OFF"}</button>
        <button id="help-toggle-btn" class="btn">${state.ui.helpOpen ? "ヘルプを閉じる" : "ヘルプ"}</button>
        <button id="topbar-toggle-btn" class="btn">閉じる</button>
      </div>
      <div class="hud-stats">
        <div class="hud-item">町: <strong>${escapeHtml(TOWN_DATA[state.currentTown].name)}</strong></div>
        <div class="hud-item">MAP/STAGE: <strong>${escapeHtml(state.currentMap)}</strong> / <strong>${escapeHtml(stageLabel)}</strong></div>
        <div class="hud-item">GOLD: <strong>${state.player.gold}</strong></div>
        <div class="hud-item">チップ: <strong>${state.chips}</strong></div>
        <div class="hud-item">ループ: <strong>${state.loop.loopCount}</strong> / titleLimit <strong>${getCurrentTitleLimit()}</strong></div>
        <div class="hud-item">職: ${escapeHtml(state.player.mainJob || "未設定")} / サブ: ${escapeHtml(state.player.subJob || (state.player.subJobUnlocked ? "未設定" : "未解放"))} / 生産: ${escapeHtml(getJobDataById(state.player.productionJobCurrentId || state.player.productionJobBaseId || state.player.productionJob)?.nameJa || PRODUCTION_JOB_PATHS[state.player.productionJob]?.stages?.[state.player.productionJobStage] || state.player.productionJob || "未設定")}</div>
        <div class="hud-item">HP/MP: <strong>${Math.floor(state.player.hp)}/${Math.floor(getEffectivePlayerStat("maxHp"))}</strong> / <strong>${Math.floor(state.player.mp)}/${Math.floor(getEffectivePlayerStat("maxMp"))}</strong></div>
        <div class="hud-item">重量: <strong>${weightInfo.totalWeight}/${weightInfo.capacity}</strong> (${weightInfo.rankLabel}) / TAG: ${escapeHtml((effective.buildTags || []).join(", ") || "なし")}</div>
        <div class="hud-item">ON称号: N <strong>${normalCount}/${state.maxNormalTitleSlots}</strong> / C <strong>${cheatCount}/${state.maxCheatTitleSlots}</strong> ${activeNames.length ? escapeHtml(activeNames.join(" / ")) : "なし"}</div>
      </div>
    </div>
  `;
}

function renderSpeedControl() {
  const chips = state.unlockedBattleSpeedOptions
    .map((speed) => `<button class="btn speed-chip ${state.battleSpeedMultiplier === speed ? "active" : ""}" data-speed-value="${speed}">${speed}x</button>`)
    .join("");
  return `
    <div class="speed-control-wrap">
      <button id="timer-button" class="btn timer-btn">1:00 (${state.battleSpeedMultiplier}x)</button>
      <div class="speed-chip-list">${chips}</div>
    </div>
  `;
}

function renderHelpPanel() {
  if (!state.ui.helpOpen) {
    return "";
  }
  const unlockedStory = getUnlockedStoryFragmentIds();
  const storyLines = unlockedStory.length
    ? unlockedStory
        .slice(-3)
        .map((id) => STORY_FRAGMENTS[id]?.helpText)
        .filter(Boolean)
        .map((text) => `<p class="tiny">物語: ${escapeHtml(text)}</p>`)
        .join("")
    : `<p class="tiny">物語: ボス討伐と掲示板閲覧で断片が解放されます。</p>`;
  return `
    <div id="help-panel" class="help-panel show">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <h4 style="margin:0;">ヘルプ</h4>
        <button id="help-close-btn" class="btn">閉じる</button>
      </div>
      <p class="tiny">倍速: 上部の倍率ボタンで切替できます。</p>
      <p class="tiny">称号: ステータス→称号図鑑でON/OFF。</p>
      <p class="tiny">重量: 装備タブで総重量/許容重量を確認。</p>
      <p class="tiny">周回: 4-10クリア後にリザルトから次周回へ。</p>
      ${storyLines}
    </div>
  `;
}

function getTopNotificationCount() {
  return {
    titles: Math.max(0, (state.unlockedTitles.length || 0) - (state.loop.carriedTitles?.length || 0)),
    board: (state.board.newThreadIds || []).length,
    unlocks: Object.keys(state.loop.persistentUnlocks || {}).length
  };
}

function renderNotifications() {
  const counts = getTopNotificationCount();
  const panel = document.getElementById("top-notifications");
  const inner = `
    <span class="tiny">新着</span>
    <span class="notify-chip">称号 ${counts.titles}</span>
    <span class="notify-chip">掲示板 ${counts.board}</span>
    <span class="notify-chip">解放 ${counts.unlocks}</span>
  `;
  const html = `
    <div class="top-notifications panel" id="top-notifications">
      ${inner}
    </div>
  `;
  if (panel) {
    panel.innerHTML = inner;
  }
  return html;
}

function renderLogFilters() {
  return `
    <div class="log-toolbar">
      <div class="log-filter-row">
        <button class="btn log-filter-btn ${state.ui.logFilter === "all" ? "active" : ""}" data-log-filter="all">${LOG_CATEGORY_LABELS.all}</button>
        ${LOG_CATEGORIES.map((cat) => `<button class="btn log-filter-btn ${state.ui.logFilter === cat ? "active" : ""}" data-log-filter="${cat}">${LOG_CATEGORY_LABELS[cat]}</button>`).join("")}
      </div>
      <div class="log-filter-row">
        <label class="tiny"><input id="log-autoscroll-toggle" type="checkbox" ${state.ui.logAutoScroll ? "checked" : ""}/> 自動スクロール</label>
        <button id="log-clear-btn" class="btn">ログクリア</button>
      </div>
    </div>
  `;
}

function renderLogPanel() {
  const logList = document.getElementById("log-list");
  if (!logList) {
    return;
  }
  const filtered = state.ui.logFilter === "all"
    ? state.player.logs
    : state.player.logs.filter((log) => (log.category || "system") === state.ui.logFilter);
  logList.innerHTML = filtered
    .map((log) => `<li class="log-${escapeHtml(log.category || "system")} ${log.important ? "important" : ""}"><span class="log-time">[${escapeHtml(log.at)}]</span>${escapeHtml(log.text)}</li>`)
    .join("");
  if (state.ui.logAutoScroll) {
    logList.scrollTop = logList.scrollHeight;
  }
}

function showToast(message, type = "system") {
  if (state.settings.notificationLevel === "low" && type !== "important") {
    return;
  }
  const toast = {
    id: `toast_${Date.now()}_${state.ui.toastSeq += 1}`,
    message: String(message),
    type
  };
  state.ui.toastQueue = [...(state.ui.toastQueue || []), toast].slice(-4);
  const stack = document.getElementById("toast-stack");
  if (stack) {
    stack.innerHTML = state.ui.toastQueue.map((row) => `<div class="toast-item ${escapeHtml(row.type)}">${escapeHtml(row.message)}</div>`).join("");
  }
  setTimeout(() => {
    state.ui.toastQueue = (state.ui.toastQueue || []).filter((row) => row.id !== toast.id);
    const node = document.getElementById("toast-stack");
    if (node) {
      node.innerHTML = state.ui.toastQueue.map((row) => `<div class="toast-item ${escapeHtml(row.type)}">${escapeHtml(row.message)}</div>`).join("");
    }
  }, 2400);
}

function showCenterPopup(data) {
  const node = document.getElementById("center-popup");
  if (!node) {
    return;
  }
  const text = typeof data === "string" ? data : (data?.text || "");
  const kind = typeof data === "string" ? "event" : (data?.type || "event");
  node.textContent = text;
  node.className = `center-popup show ${kind}`;
  if (state.ui.centerPopupTimeoutId) {
    clearTimeout(state.ui.centerPopupTimeoutId);
  }
  state.ui.centerPopupTimeoutId = setTimeout(() => {
    const popup = document.getElementById("center-popup");
    if (popup) {
      popup.className = "center-popup";
    }
  }, 1800);
}

function toggleHelpPanel() {
  state.ui.helpOpen = !state.ui.helpOpen;
  if (getCurrentMainBattleLineId() === "priest_line") {
    state.stats.priestHelpToggleCount = (state.stats.priestHelpToggleCount || 0) + 1;
    checkTitleUnlocks("helpToggle");
  }
  render();
}

function closeHelpPanel(shouldRender = true) {
  if (!state.ui.helpOpen) {
    return;
  }
  state.ui.helpOpen = false;
  if (shouldRender) {
    render();
  }
}

function toggleTopHudPanel() {
  state.ui.topHudCollapsed = !state.ui.topHudCollapsed;
  render();
}

function renderMainView() {
  const container = document.getElementById("main-view");
  if (!container) {
    return;
  }
  if (state.currentTab === "adventure") {
    renderAdventureView(container);
    return;
  }
  if (state.currentTab === "guild") {
    renderGuildView(container);
    return;
  }
  if (state.currentTab === "board") {
    renderBoardView(container);
    return;
  }
  if (state.currentTab === "status") {
    renderStatusView(container);
    return;
  }
  if (state.currentTab === "system") {
    renderSystemView(container);
    return;
  }
  renderItemsView(container);
}

function renderAdventureView(container) {
  applyLoopUnlocks();
  updateBoardThreadsFromEndingProgress();
  if (state.battle.isActive || isBattleResultState()) {
    container.innerHTML = renderBattleView();
    return;
  }
  const nextStage = getNextUnlockableStage(state.currentMap);
  const totalFieldBoss = Object.values(MAP_DATA).filter((map) => !!map.fieldBoss).length;
  container.innerHTML = `
    <div class="main-header">
      <h2>冒険</h2>
      <span class="tiny">現在の町: ${escapeHtml(TOWN_DATA[state.currentTown].name)}</span>
    </div>
    <div class="card adventure-summary">
      <p>現在マップ: <strong>${escapeHtml(MAP_DATA[state.currentMap].name)}</strong> (${MAP_DATA[state.currentMap].recommendedLevel})</p>
      <p>現在ステージ: <strong>${escapeHtml(state.currentStage)}</strong> / 撃破数 ${state.currentStageKillCount}/${state.currentStageTargetKills}</p>
      <p>次解放ステージ: <strong>${escapeHtml(nextStage || "なし")}</strong></p>
      <p>フィールドボス撃破: ${state.fieldBossCleared.length} / ${totalFieldBoss}</p>
    </div>
    ${renderTownSelector()}
    ${renderStageList()}
    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
      <button id="start-stage-battle-btn" class="btn btn-primary">戦闘開始</button>
    </div>
    ${isFeatureUnlocked("loop_challenge_basic") ? renderLoopChallengeView() : ""}
    ${renderLoopSummaryPanel()}
    ${renderEndingProgressPanel()}
    ${renderFinalContentView()}
  `;
}

function renderTownSelector() {
  ensureNeverendState();
  ensureOtherworldState();
  syncOtherworldUnlockState({ silent: true });
  const buttons = Object.values(TOWN_DATA)
    .map((town) => {
      const unlocked =
        town.id === "neverend"
          ? canEnterNeverend()
          : town.id === "otherworld"
            ? canEnterOtherworld()
            : state.unlockedTowns.includes(town.id);
      const lockLabel =
        town.id === "neverend"
          ? " (入場券が必要)"
          : town.id === "otherworld"
            ? " (異界のカギ or ユニーク全撃破)"
            : " (LOCK)";
      return `<button class="btn town-btn ${state.currentTown === town.id ? "active" : ""}" data-town-id="${town.id}" ${unlocked ? "" : "disabled"}>${town.name}${unlocked ? "" : lockLabel}</button>`;
    })
    .join("");
  const unlockedTownNames = state.unlockedTowns
    .map((id) => TOWN_DATA[id]?.name)
    .filter(Boolean);
  if (canEnterNeverend() && !unlockedTownNames.includes(TOWN_DATA.neverend.name)) {
    unlockedTownNames.push(TOWN_DATA.neverend.name);
  }
  if (canEnterOtherworld() && !unlockedTownNames.includes(TOWN_DATA.otherworld.name)) {
    unlockedTownNames.push(TOWN_DATA.otherworld.name);
  }
  return `
    <div class="card" style="margin-top:10px;">
      <h4>町選択</h4>
      <p class="tiny">解放済み町: ${escapeHtml(unlockedTownNames.join(" / "))}</p>
      <div class="town-grid">${buttons}</div>
    </div>
  `;
}

function renderStageList() {
  const map = MAP_DATA[state.currentMap];
  const stageButtons = [];
  for (let i = 1; i <= 10; i += 1) {
    const stageId = `${map.mapIndex}-${i}`;
    const stage = STAGE_DATA[stageId];
    const progress = getStageProgress(stageId);
    const unlocked = isStageUnlocked(stageId);
    const statusLabel = !unlocked
      ? "未解放"
      : state.currentStage === stageId
        ? "現在挑戦中"
        : progress.cleared
          ? "クリア済み"
          : "挑戦可能";
    const detailLabel = !unlocked ? "LOCK" : progress.cleared ? "再挑戦可能" : `${progress.kills}/${progress.target}`;
    stageButtons.push(
      `<button class="btn stage-select-btn ${state.currentStage === stageId ? "active" : ""}" data-stage-id="${stageId}" ${unlocked ? "" : "disabled"}>
      ${stageId}${stage.isFieldBossStage ? " [BOSS]" : ""}
      <span class="tiny">${statusLabel} / ${detailLabel}</span>
      </button>`
    );
  }
  return `<div class="card" style="margin-top:10px;"><h4>ステージ一覧 (${map.name})</h4><div class="stage-grid">${stageButtons.join("")}</div></div>`;
}

function resetStageProgressForNewStage(stageId) {
  const progress = getStageProgress(stageId);
  if (!progress) {
    return;
  }
  progress.kills = 0;
  state.currentStageKillCount = 0;
  state.currentStageTargetKills = progress.target;
}

function retryClearedStage(stageId, shouldRender = true) {
  if (!isStageUnlocked(stageId)) {
    addLog("未解放のステージです。");
    return;
  }
  selectStage(stageId, false, true);
  resetStageProgressForNewStage(stageId);
  if (getStageProgress(stageId).cleared) {
    addLog(`再挑戦ステージを準備: ${stageId}`);
  }
  if (shouldRender) {
    render();
  }
}

function goToNextStage() {
  const current = state.currentStage;
  const next = getNextStageId(current);
  if (!next) {
    addLog("このマップで進める次ステージはありません。");
    return;
  }
  const currentProgress = getStageProgress(current);
  if (currentProgress) {
    currentProgress.cleared = true;
  }
  selectStage(next, false, true);
  resetStageProgressForNewStage(next);
  state.battle.status = "待機";
  addLog(`次ステージへ移動: ${next} (撃破数をリセット)`);
  render();
}

function renderLoopSummaryPanel() {
  const clear = state.loop.clearedGame ? "達成" : "未達";
  const carry = (state.loop.carriedTitles || []).map((id) => getTitleById(id)?.name).filter(Boolean).slice(0, 3).join(" / ");
  return `
    <div class="card" style="margin-top:10px;">
      <h4>周回サマリー</h4>
      <p class="tiny">現在ループ: ${state.loop.loopCount} / 現段階クリア: ${clear}</p>
      <p class="tiny">持ち込み称号: ${carry || "なし"}</p>
      <p class="tiny">次のtitleLimit条件: ${escapeHtml(getNextTitleLimitCondition())}</p>
    </div>
  `;
}

function renderEndingProgressPanel() {
  return renderEndingProgressView();
}

function selectTown(townId) {
  ensureNeverendState();
  ensureOtherworldState();
  syncOtherworldUnlockState({ silent: true });
  if (townId === "neverend" && canEnterNeverend() && !state.unlockedTowns.includes("neverend")) {
    state.unlockedTowns.push("neverend");
  }
  if (townId === "otherworld" && canEnterOtherworld() && !state.unlockedTowns.includes("otherworld")) {
    state.unlockedTowns.push("otherworld");
    state.otherworldUnlocked = true;
  }
  const townUnlocked =
    townId === "neverend"
      ? canEnterNeverend()
      : townId === "otherworld"
        ? canEnterOtherworld()
        : state.unlockedTowns.includes(townId);
  if (!townUnlocked) {
    addLog("未解放の町です。");
    return;
  }
  const prevMapId = state.currentMap;
  if (state.currentTown !== townId) {
    pushNavigationHistory();
  }
  state.currentTown = townId;
  state.currentMap = TOWN_DATA[townId].mapId;
  state.player.currentTown = TOWN_DATA[townId].name;
  if (townId === "neverend") {
    state.worldStateFlags = { ...(state.worldStateFlags || {}), neverendArrived: true };
  } else if (townId === "otherworld") {
    state.worldStateFlags = { ...(state.worldStateFlags || {}), otherworldArrived: true };
    state.otherworldUnlocked = true;
    showCenterPopup({ text: "異界へ到達した", type: "important" });
    addLog("異界到達: 世界の綻びの先へ踏み込んだ。", "important", { important: true });
  }
  state.stats.townVisitCount += 1;
  state.stats.viewSwitchCount += 1;
  checkTitleUnlocks("townVisit");
  checkTitleUnlocks("viewSwitch");
  const firstStage = getFirstSelectableStage(state.currentMap);
  if (firstStage) {
    selectStage(firstStage, false);
  }
  if (prevMapId !== state.currentMap) {
    refreshGuildQuestsForCurrentTown(true);
  }
  syncStoryProgress();
  updateBoardThreadsFromProgress();
  addLog(`転移門を使って ${TOWN_DATA[townId].name} へ移動した。`);
  autoSaveIfNeeded("townMove");
  render();
}

function selectStage(stageId, shouldRender = true, bypassUnlockCheck = false) {
  if (!bypassUnlockCheck && !isStageUnlocked(stageId)) {
    addLog("未解放のステージです。");
    return;
  }
  if (state.currentStage !== stageId) {
    pushNavigationHistory();
  }
  const stage = STAGE_DATA[stageId];
  state.currentMap = stage.mapId;
  state.currentStage = stageId;
  state.currentStageKillCount = getStageProgress(stageId).kills;
  state.currentStageTargetKills = stage.targetKills;
  state.stats.highestReachedStage = maxStageId(state.stats.highestReachedStage, stageId);
  addLog(`ステージ選択: ${stageId}`);
  if (shouldRender) {
    render();
  }
}

function startStageBattle() {
  if (state.battle.isActive) {
    return;
  }
  closeHelpPanel(false);
  const stage = STAGE_DATA[state.currentStage];
  const progress = getStageProgress(stage.id);
  checkTitleUnlocks("battleStart");
  if (state.activeTitles.length === 0) {
    state.stats.noTitleBattleStreak += 1;
  } else {
    state.stats.noTitleBattleStreak = 0;
  }
  if (!state.settings.bgmOn) {
    state.stats.bgmOffBattleCount += 1;
  }
  if (state.player.mainJobId) {
    state.stats.mainJobUsage[state.player.mainJobId] = (state.stats.mainJobUsage[state.player.mainJobId] || 0) + 1;
  }
  if (state.player.productionJob) {
    state.stats.productionJobHistory[state.player.productionJob] = (state.stats.productionJobHistory[state.player.productionJob] || 0) + 1;
  }
  if (state.activeTitles.length > 0) {
    const comboKey = [...state.activeTitles].sort().join("+");
    const seen = state.stats.titleComboHistory[comboKey] || 0;
    state.stats.titleComboHistory[comboKey] = seen + 1;
    if (seen === 0) {
      state.stats.totalTitleCombosTried += 1;
    }
  }
  if (state.titleRuntime.reviveBuffPending) {
    if (state.unlockedTitles.includes("first_death")) {
      state.titleRuntime.reviveAttackBuffUntil = Date.now() + 30000;
      addLog("称号効果: 復活後30秒 攻撃+10%");
    }
    if (state.unlockedTitles.includes("beyond_death")) {
      const revive = getTitleById("beyond_death")?.effect?.reviveBuff;
      if (revive) {
        state.titleRuntime.reviveProtectionUntil = Date.now() + revive.durationSec * 1000;
        addLog("称号効果: 復活保護が発動しました。");
      }
    }
    state.titleRuntime.reviveBuffPending = false;
  }
  state.titleRuntime.swordsmanChargeReady = false;
  state.titleRuntime.swordsmanReflectReady = false;
  state.titleRuntime.flashSwordsmanEvasionUntil = 0;
  state.titleRuntime.comboReflectReady = false;
  state.titleRuntime.comboInvincibleUntil = 0;
  state.titleRuntime.comboExtraStrikeDepth = 0;
  recalculateTitleEffects();
  state.ui.autoItemVisualEffects = {};
  state.stats.totalBattles += 1;
  checkEndgameTitleConditions();
  state.stats.battlesByRegion[stage.mapId] = (state.stats.battlesByRegion[stage.mapId] || 0) + 1;
  state.runtime.bossAttemptCounts[stage.id] = (state.runtime.bossAttemptCounts[stage.id] || 0) + (stage.isFieldBossStage ? 1 : 0);

  const effective = getEffectivePlayerStats();
  state.battle = {
    isActive: true,
    stageId: stage.id,
    status: "戦闘中",
    playerCurrentHp: Math.max(1, Math.min(effective.maxHp, state.player.hp)),
    playerCurrentMp: Math.max(0, Math.min(effective.maxMp, state.player.mp)),
    enemy: null,
    intervalId: null,
    playerNextActionAt: Date.now() + Math.floor(420 / state.battleSpeedMultiplier),
    enemyNextActionAt: Date.now() + Math.floor(680 / state.battleSpeedMultiplier),
    skillRotationIndex: 0,
    recentActionText: "戦闘開始", pendingSpawnAt: 0,
    isFieldBossBattle: stage.isFieldBossStage,
    isUniqueBattle: false,
    stageKillCount: progress.cleared && !stage.loopChallengeId ? 0 : progress.kills,
    stageTargetKills: stage.targetKills,
    itemUsedInStage: false,
    gimmick: { warnedAt: 0, triggered: false, extra: {} },
    scaledBossGimmick: null,
    uniqueGimmickProfile: null,
    uniqueCombatProfile: null,
    critFinishThisBoss: false,
    stageDamageTaken: 0,
    loopChallengeId: stage.loopChallengeId || null
  };
  state.battle.autoItemGlobalCooldownUntil = 0;

  if (state.titleEffects.battleStartBuff) {
    const buff = state.titleEffects.battleStartBuff;
    if (buff.attackMultiplier) {
      applyEffect("player", "title_start_attack", { stat: "attack", multiplier: 1 + buff.attackMultiplier, durationMs: buff.durationSec * 1000 });
    }
    if (buff.defenseMultiplier) {
      applyEffect("player", "title_start_defense", { stat: "defense", multiplier: 1 + buff.defenseMultiplier, durationMs: buff.durationSec * 1000 });
    }
    if (buff.speedMultiplier) {
      applyEffect("player", "title_start_speed", { stat: "speed", multiplier: 1 + buff.speedMultiplier, durationMs: buff.durationSec * 1000 });
    }
    if (buff.damageReduction) {
      applyEffect("player", "title_start_reduction", { stat: "damageReduction", multiplier: buff.damageReduction, durationMs: buff.durationSec * 1000 });
    }
  }
  if (state.titleEffects.randomBattleStartBuff) {
    applyRandomBattleStartBuffOnce(state.titleEffects.randomBattleStartBuff, "称号効果");
  }
  if (state.titleEffects.comboBattleStartRandomBuff && state.titleEffects.comboBattleStartRandomBuffCount > 0) {
    const loopCount = Math.max(1, Math.floor(state.titleEffects.comboBattleStartRandomBuffCount));
    for (let i = 0; i < loopCount; i += 1) {
      applyRandomBattleStartBuffOnce(state.titleEffects.comboBattleStartRandomBuff, "魔剣士");
    }
  }
  if (state.titleEffects.comboBattleStartInvincibleMs > 0) {
    state.titleRuntime.comboInvincibleUntil = Date.now() + state.titleEffects.comboBattleStartInvincibleMs;
    addLog(`聖騎士: ${Math.floor(state.titleEffects.comboBattleStartInvincibleMs / 1000)}秒間無敵`);
  }

  addLog(`戦闘開始: ${stage.id} (${state.battle.stageKillCount}/${progress.target})`);
  spawnStageEnemy();
  render();
  state.battle.intervalId = setInterval(updateBattle, BATTLE_TICK_MS);
}

function spawnStageEnemy() {
  const stage = STAGE_DATA[state.battle.stageId];
  if (!stage) {
    return;
  }
  let master = null;
  state.battle.isUniqueBattle = false;
  state.battle.isFieldBossBattle = stage.isFieldBossStage;
  state.battle.gimmick = { warnedAt: 0, triggered: false, extra: {} };
  const stageKillCount = Math.max(0, Number(state.battle.stageKillCount || 0));
  const stageTargetKills = Math.max(1, Number(state.battle.stageTargetKills || stage.targetKills || 1));
  const shouldSpawnStageBoss = !!stage.hasStageBoss && !!stage.stageBossEnemyId && stageKillCount >= stageTargetKills - 1;

  if (stage.isFieldBossStage) {
    master = getScaledEnemyStats(stage.fieldBoss, stage.mapId, stage.id, true);
  } else if (shouldSpawnStageBoss) {
    master = getScaledEnemyStats(stage.stageBossEnemyId, stage.mapId, stage.id, true);
    state.battle.isFieldBossBattle = true;
  } else if (rollUniqueEncounter()) {
    master = spawnUniqueEnemy();
    state.battle.isUniqueBattle = true;
    state.battle.isFieldBossBattle = false;
  } else {
    const pool = stage.normalEnemyPool;
    const enemyId = pool[Math.floor(Math.random() * pool.length)];
    master = getScaledEnemyStats(enemyId, stage.mapId, stage.id, false);
  }

  if (!master) {
    addLog("敵データの読み込みに失敗しました。");
    state.battle.isActive = false;
    state.battle.status = "待機";
    stopBattleLoop();
    return;
  }

  state.battle.scaledBossGimmick = state.battle.isFieldBossBattle && !state.battle.isUniqueBattle
    ? getScaledBossGimmick(stage.id, stage.mapId)
    : null;
  state.battle.uniqueGimmickProfile = state.battle.isUniqueBattle ? (master.uniqueGimmickProfile || null) : null;
  state.battle.uniqueCombatProfile = state.battle.isUniqueBattle ? (master.uniqueCombatProfile || null) : null;
  state.battle.enemy = { ...master, maxHp: master.hp, hp: master.hp, maxMp: master.mp, mp: master.mp };
  state.battle.playerNextActionAt = Date.now() + Math.floor(360 / state.battleSpeedMultiplier);
  state.battle.enemyNextActionAt = Date.now() + Math.floor(580 / state.battleSpeedMultiplier);
  state.battle.recentActionText = `${master.name} が現れた`;
  addLog(`敵出現: ${master.name}`);

  if (state.battle.isUniqueBattle) {
    showBattleSpecialPopup(`ユニーク出現: ${master.name}`);
    showCenterPopup({ text: `ユニーク遭遇: ${master.name}`, type: "important" });
  } else if (state.battle.isFieldBossBattle) {
    showBattleSpecialPopup(`${shouldSpawnStageBoss && !stage.isFieldBossStage ? "ステージボス出現" : "フィールドボス出現"}: ${master.name}`);
    showCenterPopup({ text: `BOSS: ${master.name}`, type: "important" });
    if (stage.mapId === "otherworld" && String(master.name || "").includes("覚醒")) {
      addLog(`異界補正: ${master.name} が再演された。`, "important", { important: true });
    }
  }
}

function rollUniqueEncounter() {
  if (!state.battle.isActive) {
    return false;
  }
  const stage = STAGE_DATA[state.battle.stageId];
  if (!stage || stage.disableUniqueEncounter) {
    return false;
  }
  if (stage.isFieldBossStage) {
    return false;
  }
  const luckBonus = Math.min(0.001, getEffectivePlayerStat("luck") * 0.000002);
  const titleBonus = state.titleEffects.uniqueEncounterRateBonus || 0;
  const loopBonus = Math.min(BALANCE_CONFIG.encounter.maxRate, state.loop.loopCount * BALANCE_CONFIG.encounter.perLoopBonus);
  const rate = Math.min(BALANCE_CONFIG.encounter.maxRate, BALANCE_CONFIG.encounter.uniqueBaseRate + loopBonus + luckBonus + titleBonus);
  return Math.random() < rate;
}

function spawnUniqueEnemy() {
  const ids = Object.keys(state.world.uniqueEnemies || UNIQUE_ENEMY_DATA);
  const selectedId = ids[Math.floor(Math.random() * ids.length)];
  const selected = getUniqueEnemyStats(selectedId);
  state.uniqueEncounterCount += 1;
  state.stats.uniqueEncounterCount += 1;
  return selected;
}

function updateBattle() {
  if (!state.battle.isActive) {
    return;
  }
  const now = Date.now();
  applyPassiveStageRegen();

  if (state.titleRuntime.reviveAttackBuffUntil > 0 && now >= state.titleRuntime.reviveAttackBuffUntil) {
    state.titleRuntime.reviveAttackBuffUntil = 0;
    recalculateTitleEffects();
    addLog("称号効果: 復活後の攻撃バフが終了");
  }
  removeExpiredEffects();

  if (!state.battle.enemy && state.battle.pendingSpawnAt > 0 && now >= state.battle.pendingSpawnAt) {
    state.battle.pendingSpawnAt = 0;
    spawnStageEnemy();
    return;
  }
  if (!state.battle.enemy) {
    return;
  }

  checkAutoUseItems();
  handleBossGimmickPhase();
  handleUniqueGimmickPhase();

  if (now >= state.battle.playerNextActionAt && state.battle.enemy.hp > 0) {
    playerAction();
    state.battle.playerNextActionAt = now + getPlayerActionInterval();
  }
  if (state.battle.isActive && state.battle.enemy && state.battle.enemy.hp > 0 && now >= state.battle.enemyNextActionAt) {
    enemyAction();
    state.battle.enemyNextActionAt = now + getEnemyActionInterval();
  }

  if (state.currentTab === "adventure") {
    renderMainView();
    bindGameEvents();
  }
}

function applyPassiveStageRegen() {
  if (!state.battle.isActive) {
    return;
  }
  const regionId = STAGE_DATA[state.battle.stageId]?.mapId || state.currentMap || "grassland";
  let totalRegenPerMinute = (state.titleEffects.stageRegenPerMinute || 0) + (state.titleEffects.regionStageRegenPerMinute?.[regionId] || 0);
  if (state.titleEffects.noReturnCombatBonus && state.stats.noReturnExpeditionActive) {
    totalRegenPerMinute += state.titleEffects.noReturnCombatBonus.stageRegenPerMinute || 0;
  }
  if (totalRegenPerMinute <= 0) {
    return;
  }
  const maxHp = getEffectivePlayerStat("maxHp");
  const perTick = (maxHp * totalRegenPerMinute) / (60 * (1000 / BATTLE_TICK_MS));
  state.battle.playerCurrentHp = Math.min(maxHp, state.battle.playerCurrentHp + perTick);
}

function handleBossGimmickPhase() {
  if (!state.battle.isFieldBossBattle || !state.battle.enemy) {
    return;
  }
  const stage = STAGE_DATA[state.battle.stageId];
  const gimmick = state.battle.scaledBossGimmick || stage.bossGimmick || MAP_DATA[stage.mapId]?.bossGimmick;
  if (!gimmick) {
    return;
  }
  triggerBossGimmick(gimmick);
}

function handleUniqueGimmickPhase() {
  if (!state.battle.isUniqueBattle || !state.battle.enemy) {
    return;
  }
  const profile = state.battle.uniqueGimmickProfile || { type: "generic_unique" };
  triggerUniqueGimmick(profile);
}

function triggerUniqueGimmick(profile) {
  const now = Date.now();
  const type = profile.type || "generic_unique";
  const extra = state.battle.gimmick.extra;
  const enemy = state.battle.enemy;
  if (!enemy) {
    return;
  }

  if (type === "fenrir_rampage") {
    if (!extra.uniqueWarned) {
      extra.uniqueWarned = true;
      addLog("【神話級】フェンリルの殺気が戦場を凍らせた。");
    }
    const hpRate = enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 1;
    const baseSpeed = extra.baseSpeed || enemy.speed;
    extra.baseSpeed = baseSpeed;
    const rageScale = 1 + (1 - hpRate) * 1.1;
    enemy.speed = Math.max(baseSpeed, Math.floor(baseSpeed * rageScale));
    if (hpRate <= 0.35 && (!extra.lastRampageAt || now - extra.lastRampageAt >= 6000)) {
      extra.lastRampageAt = now;
      const dmg = Math.max(1, Math.floor(getEffectivePlayerStat("maxHp") * 0.24 * getDamageReductionMultiplier()));
      applyDamage("enemy", dmg, "終焉の連牙");
    }
    return;
  }

  if (type === "jormungand_venom") {
    if (!extra.uniqueWarned) {
      extra.uniqueWarned = true;
      addLog("【神話級】ヨルムンガンドが致死毒の霧を纏った。");
    }
    if (!extra.lastPoisonAt || now - extra.lastPoisonAt >= 1000) {
      extra.lastPoisonAt = now;
      extra.poisonStacks = Math.min(18, (extra.poisonStacks || 0) + 1);
      const rate = 0.045 + extra.poisonStacks * 0.0045;
      const dmg = Math.max(1, Math.floor(getEffectivePlayerStat("maxHp") * rate));
      applyDamage("enemy", dmg, "終末毒");
    }
    return;
  }

  if (type === "cerberus_inferno") {
    if (!extra.uniqueWarned) {
      extra.uniqueWarned = true;
      addLog("【神話級】ケルベロスが三つの咆哮で炎を散らした。");
    }
    if (!extra.lastInfernoAt || now - extra.lastInfernoAt >= 7000) {
      extra.lastInfernoAt = now;
      for (let i = 0; i < 3; i += 1) {
        const hit = Math.max(1, Math.floor(getEffectivePlayerStat("maxHp") * 0.085 * getDamageReductionMultiplier()));
        applyDamage("enemy", hit, `獄炎牙 ${i + 1}段`);
      }
    }
    return;
  }

  if (type === "griffon_dive") {
    if (!extra.uniqueWarned) {
      extra.uniqueWarned = true;
      addLog("【神話級】グリフォンが上空へ舞い、狙いを定めている。");
    }
    if (!extra.lastDiveAt || now - extra.lastDiveAt >= 9000) {
      extra.lastDiveAt = now;
      extra.playerAimPenaltyUntil = now + 4500;
      const dmg = Math.max(1, Math.floor(getEffectivePlayerStat("maxHp") * 0.27 * getDamageReductionMultiplier()));
      applyDamage("enemy", dmg, "神速急降下");
    }
    return;
  }

  if (type === "minotauros_crush") {
    if (!extra.uniqueWarned) {
      extra.uniqueWarned = true;
      addLog("【神話級】ミノタウロスが大斧を地面に叩きつける。");
    }
    if (!extra.lastCrushAt || now - extra.lastCrushAt >= 8200) {
      extra.lastCrushAt = now;
      const dmg = Math.max(1, Math.floor(getEffectivePlayerStat("maxHp") * 0.34 * getDamageReductionMultiplier()));
      applyDamage("enemy", dmg, "迷宮断砕");
    }
    if (!extra.rageTriggered && enemy.hp <= enemy.maxHp * 0.5) {
      extra.rageTriggered = true;
      enemy.attack = Math.floor(enemy.attack * 1.22);
      addLog("[神話級ギミック] ミノタウロスが狂戦士化した。");
    }
    return;
  }

  if (type === "phoenix_rebirth") {
    if (!extra.uniqueWarned) {
      extra.uniqueWarned = true;
      addLog("【神話級】鳳凰の炎が再生の気配を帯びる。");
    }
    if (!extra.lastRegenAt || now - extra.lastRegenAt >= 1000) {
      extra.lastRegenAt = now;
      const heal = Math.max(1, Math.floor(enemy.maxHp * 0.016));
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal);
    }
    if (!extra.lastPhoenixFlameAt || now - extra.lastPhoenixFlameAt >= 6000) {
      extra.lastPhoenixFlameAt = now;
      const dmg = Math.max(1, Math.floor(getEffectivePlayerStat("maxHp") * 0.12 * getDamageReductionMultiplier()));
      applyDamage("enemy", dmg, "不死鳥の炎");
    }
    return;
  }

  if (type === "kirin_thunder") {
    if (!extra.uniqueWarned) {
      extra.uniqueWarned = true;
      addLog("【神話級】麒麟の雷光が視界を裂く。");
    }
    if (!extra.lastThunderAt || now - extra.lastThunderAt >= 7000) {
      extra.lastThunderAt = now;
      const dmg = Math.max(1, Math.floor(getEffectivePlayerStat("maxHp") * 0.25 * getDamageReductionMultiplier()));
      applyDamage("enemy", dmg, "天雷轟閃");
      state.battle.playerNextActionAt = Math.max(state.battle.playerNextActionAt, now + 520);
    }
    return;
  }
}

function triggerBossGimmick(gimmick) {
  const now = Date.now();
  if (gimmick.type === "charge") {
    if (!state.battle.gimmick.warnedAt) {
      state.battle.gimmick.warnedAt = now;
      addLog(`【予兆】${gimmick.warning} ヒント: ${gimmick.hint}`);
      return;
    }
    if (!state.battle.gimmick.triggered && now - state.battle.gimmick.warnedAt >= gimmick.triggerSec * 1000) {
      state.battle.gimmick.triggered = true;
      const dmg = Math.max(1, Math.floor(getEffectivePlayerStat("maxHp") * gimmick.damageRate * getDamageReductionMultiplier()));
      applyDamage("enemy", dmg, "突進");
      addLog("[ギミック] 突進攻撃が炸裂した");
    }
    return;
  }

  if (gimmick.type === "poisonMist") {
    if (!state.battle.gimmick.warnedAt) {
      state.battle.gimmick.warnedAt = now;
      addLog(`【予兆】${gimmick.warning} ヒント: ${gimmick.hint}`);
      return;
    }
    if (!state.battle.gimmick.extra.poisonActive && now - state.battle.gimmick.warnedAt >= gimmick.triggerSec * 1000) {
      state.battle.gimmick.extra.poisonActive = true;
      state.battle.gimmick.extra.poisonEndAt = now + gimmick.durationSec * 1000;
      addLog("[ギミック] 毒霧フェーズ開始。継続ダメージに注意");
    }
    if (state.battle.gimmick.extra.poisonActive) {
      if (!state.battle.gimmick.extra.lastPoisonTick || now - state.battle.gimmick.extra.lastPoisonTick >= 1000) {
        state.battle.gimmick.extra.lastPoisonTick = now;
        const dmg = Math.max(1, Math.floor(getEffectivePlayerStat("maxHp") * gimmick.damageRate));
        applyDamage("enemy", dmg, "毒霧");
      }
      if (now >= state.battle.gimmick.extra.poisonEndAt) {
        state.battle.gimmick.extra.poisonActive = false;
        addLog("[ギミック] 毒霧フェーズ終了");
      }
    }
    return;
  }

  if (gimmick.type === "periodicBurst") {
    if (!state.battle.gimmick.extra.nextBurstAt) {
      state.battle.gimmick.extra.nextBurstAt = now + gimmick.triggerSec * 1000;
      addLog(`【予兆】${gimmick.warning} ヒント: ${gimmick.hint}`);
      return;
    }
    if (now >= state.battle.gimmick.extra.nextBurstAt) {
      const dmg = Math.max(1, Math.floor(getEffectivePlayerStat("maxHp") * gimmick.damageRate * getDamageReductionMultiplier()));
      applyDamage("enemy", dmg, "水流ブレス");
      addLog("[ギミック] 水流ブレスが襲いかかった");
      state.battle.gimmick.extra.nextBurstAt = now + gimmick.triggerSec * 1000;
    }
    return;
  }

  if (gimmick.type === "enrage") {
    if (!state.battle.gimmick.triggered && state.battle.enemy.hp <= state.battle.enemy.maxHp * gimmick.triggerHpRate) {
      state.battle.gimmick.triggered = true;
      state.battle.enemy.attack = Math.floor(state.battle.enemy.attack * gimmick.attackBoost);
      addLog(`【予兆】${gimmick.warning} ヒント: ${gimmick.hint}`);
      addLog("[ギミック] ボスが怒り状態に入った");
    }
    return;
  }

  if (gimmick.type === "protocol3Core") {
    if (!state.battle.gimmick.warnedAt) {
      state.battle.gimmick.warnedAt = now;
      addLog(`【予兆】${gimmick.warning} ヒント: ${gimmick.hint}`);
      return;
    }
    if (!state.battle.gimmick.triggered && state.battle.enemy.hp <= state.battle.enemy.maxHp * gimmick.triggerHpRate) {
      state.battle.gimmick.triggered = true;
      addLog("[ギミック] Protocol3がコア過熱状態へ。後半フェーズが開始。");
    }
  }
}

function playerAction() {
  if (!state.battle.enemy || state.battle.enemy.hp <= 0) {
    return;
  }
  const effective = getEffectivePlayerStats();
  const uniqueProfile = getCurrentUniqueCombatProfile();

  const skill = pickUsableSkill();
  if (skill) {
    useSkill(skill);
    return;
  }

  let hitChance = 0.88 + state.titleEffects.accuracyBonus + (getActiveBattleJobBonuses().combat.accuracyBonus || 0) - state.battle.enemy.speed * 0.0012;
  if (uniqueProfile?.playerHitPenalty) {
    hitChance -= uniqueProfile.playerHitPenalty;
  }
  if (state.battle.gimmick.extra.playerAimPenaltyUntil && Date.now() < state.battle.gimmick.extra.playerAimPenaltyUntil) {
    hitChance -= 0.07;
  }
  if (Math.random() > hitChance) {
    state.stats.attacksMissed += 1;
    state.battle.recentActionText = "通常攻撃が外れた";
    addLog("通常攻撃が外れた。");
    checkTitleUnlocks("afterMiss");
    return;
  }

  const critChance = effective.critRate;
  const isCrit = Math.random() < critChance;
  const base = Math.max(1, Math.floor(effective.attack - state.battle.enemy.defense * 0.6));
  const critMul = 1.5 * (1 + (state.titleEffects.critDamageBonus || 0));
  const damage = isCrit ? Math.floor(base * critMul) : base;
  state.runtime.lastHitMeta = { source: "normal", isCrit };
  applyDamage("player", damage, isCrit ? "会心の一撃" : "通常攻撃", isCrit);
  recoverMpFromMageAttack("魔術師特性");
}

function enemyAction() {
  if (!state.battle.enemy || state.battle.enemy.hp <= 0) {
    return;
  }
  if (state.battle.enemy.id === "protocol3") {
    enemyActionProtocol3();
    return;
  }
  const uniqueProfile = getCurrentUniqueCombatProfile();
  const effective = getEffectivePlayerStats();
  const regionId = STAGE_DATA[state.battle.stageId]?.mapId || state.currentMap || "grassland";
  const effectiveEvasion = getCappedEffectiveEvasion(effective, regionId);
  let hitChance = (0.92 * getEnemyAccuracyMultiplier()) - effectiveEvasion;
  if (uniqueProfile?.hitBonus) {
    hitChance += uniqueProfile.hitBonus;
  }
  if (Math.random() > hitChance) {
    if (STAGE_DATA[state.battle.stageId]?.mapId === "sea") {
      state.stats.seaEvadeSuccessCount = (state.stats.seaEvadeSuccessCount || 0) + 1;
    }
    addLog(`${state.battle.enemy.name} の通常攻撃を受けた。`);
    return;
  }
  let reduction = getDamageReductionMultiplier();
  reduction *= effective.damageReductionMultiplier || 1;
  const regionReduction = state.titleEffects.regionDamageReduction?.[regionId] || 0;
  if (regionReduction > 0) {
    reduction *= 1 - regionReduction;
  }
  if (state.titleEffects.lowHpDamageReduction > 0 && state.battle.playerCurrentHp <= effective.maxHp * 0.2) {
    reduction *= 1 - state.titleEffects.lowHpDamageReduction;
  }
  if (state.titleEffects.lowHpConditionalCombat?.damageReduction && state.battle.playerCurrentHp <= effective.maxHp * (state.titleEffects.lowHpConditionalCombat.hpThreshold || 0.5)) {
    reduction *= 1 - state.titleEffects.lowHpConditionalCombat.damageReduction;
  }
  if (!state.titleRuntime.firstBattleProtectionUsed && state.titleEffects.firstBattleDamageReduction > 0 && state.stats.totalBattles <= 1) {
    reduction *= 1 - state.titleEffects.firstBattleDamageReduction;
  }
  if (Date.now() < state.titleRuntime.reviveProtectionUntil) {
    reduction *= 0.4;
  }
  const raw = Math.max(1, Math.floor(state.battle.enemy.attack - effective.defense * 0.55));
  const isCrit = !!uniqueProfile && Math.random() < (uniqueProfile.critRate || 0);
  const uniqueMul = uniqueProfile?.damageMultiplier || 1;
  let roleMul = 1;
  let forcedHits = null;
  let forcedCritChance = uniqueProfile?.critRate || 0;
  if (!uniqueProfile && regionId === "neverend") {
    const enemyId = state.battle.enemy.id;
    if (enemyId === "skygearDrone") {
      roleMul = 0.9;
      forcedHits = Math.random() < 0.45 ? 2 : 1;
    } else if (enemyId === "autoTurret") {
      roleMul = 1.28;
    } else if (enemyId === "metalHound") {
      roleMul = 0.82;
      forcedHits = Math.random() < 0.4 ? 3 : 2;
    } else if (enemyId === "bladeWorker") {
      roleMul = 0.95;
      forcedHits = Math.random() < 0.55 ? 3 : 2;
    } else if (enemyId === "repairUnit") {
      if (Math.random() < 0.42) {
        const heal = Math.max(1, Math.floor(state.battle.enemy.maxHp * 0.18));
        state.battle.enemy.hp = Math.min(state.battle.enemy.maxHp, state.battle.enemy.hp + heal);
        addLog("リペアユニットが自己修復を実行した。");
        return;
      }
      roleMul = 0.78;
    } else if (enemyId === "heavyFrame") {
      roleMul = 1.34;
    } else if (enemyId === "plasmaCore") {
      roleMul = Math.random() < 0.24 ? 1.7 : 1.08;
      forcedCritChance = 0.14;
    } else if (enemyId === "dataEater") {
      roleMul = 1.08;
      if (Math.random() < 0.3) {
        state.battle.playerNextActionAt += 260;
        addLog("データイーターが演算妨害を仕掛けた。");
      }
    } else if (enemyId === "guardianArm") {
      roleMul = 1.3;
      forcedHits = Math.random() < 0.42 ? 2 : 1;
    } else if (enemyId === "hollowEnforcer") {
      roleMul = 1.25;
      forcedCritChance = 0.2;
      forcedHits = 2;
    } else if (enemyId === "signalCore") {
      roleMul = 1.16;
      if (Math.random() < 0.35) {
        state.battle.gimmick.extra.playerAimPenaltyUntil = Date.now() + 2600;
      }
    } else if (enemyId === "overloadFrame") {
      roleMul = 1.22;
      forcedHits = Math.random() < 0.55 ? 3 : 2;
      forcedCritChance = 0.18;
    }
  }
  const finalCrit = uniqueProfile ? isCrit : Math.random() < forcedCritChance;
  const baseDamage = Math.max(1, Math.floor(raw * uniqueMul * roleMul * (finalCrit ? 1.7 : 1)));
  const hits = uniqueProfile && Math.random() < (uniqueProfile.multiHitChance || 0)
    ? 1 + Math.floor(Math.random() * Math.max(1, uniqueProfile.multiHitMax || 1))
    : forcedHits || 1;
  for (let i = 0; i < hits; i += 1) {
    let damage = Math.max(1, Math.floor(baseDamage * reduction));
    if (state.titleEffects.priestDamageHalfChance > 0 && Math.random() < state.titleEffects.priestDamageHalfChance) {
      damage = Math.max(1, Math.floor(damage * 0.5));
      addLog("目覚めた僧侶: 被ダメージ半減が発動");
    }
    applyDamage("enemy", damage, finalCrit ? `会心攻撃 ${i + 1}Hit` : `通常攻撃 ${i + 1}Hit`);
    if (state.battle.playerCurrentHp <= 0) {
      break;
    }
  }
}

function enemyActionProtocol3() {
  const enemy = state.battle.enemy;
  if (!enemy) return;
  const extra = state.battle.gimmick.extra;
  const now = Date.now();
  if (!extra.protocol3Init) {
    extra.protocol3Init = true;
    extra.protocol3BaseAttack = enemy.attack;
    extra.protocol3BaseDefense = enemy.defense;
    extra.protocol3BaseSpeed = enemy.speed;
    extra.protocol3Rage = false;
    extra.protocol3TargetLockUntil = 0;
    extra.protocol3DamageTakenMultiplier = 1;
  }
  const hpRate = enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 1;
  if (!extra.protocol3Rage && hpRate <= 0.3) {
    extra.protocol3Rage = true;
    enemy.attack = Math.floor(extra.protocol3BaseAttack * 1.62);
    enemy.speed = Math.floor(extra.protocol3BaseSpeed * 1.25);
    enemy.defense = Math.floor(extra.protocol3BaseDefense * 0.72);
    extra.protocol3DamageTakenMultiplier = 1.36;
    addLog("Protocol3 が激怒状態へ移行。火力が激増し、装甲が脆化した。");
  }
  const enraged = !!extra.protocol3Rage;
  const normalActions = [
    { id: "tri_burst", weight: 28 },
    { id: "pulse_cannon", weight: 24 },
    { id: "armor_deploy", weight: 16 },
    { id: "target_lock", weight: 16 },
    { id: "cool_restart", weight: 16 }
  ];
  const enragedActions = [
    { id: "overclock", weight: 16 },
    { id: "break_burst", weight: 28 },
    { id: "control_break", weight: 18 },
    { id: "ignition", weight: 22 },
    { id: "tri_burst", weight: 16 }
  ];
  const action = weightedPick(enraged ? enragedActions : normalActions)?.id || "tri_burst";
  if (action === "armor_deploy") {
    enemy.defense = Math.min(Math.floor(extra.protocol3BaseDefense * 1.42), Math.floor(enemy.defense * 1.18));
    addLog("Protocol3: 装甲展開（防御上昇）");
    return;
  }
  if (action === "target_lock") {
    extra.protocol3TargetLockUntil = now + 5000;
    addLog("Protocol3: ターゲットロック（命中・会心上昇）");
    return;
  }
  if (action === "cool_restart") {
    state.activeEffects = state.activeEffects.filter((effect) => !(effect.target === "enemy" && ["enemyAttack", "enemyAccuracy", "defense", "speed"].includes(effect.stat)));
    enemy.defense = Math.max(enemy.defense, Math.floor(extra.protocol3BaseDefense * (enraged ? 0.72 : 1)));
    addLog("Protocol3: 冷却再起動（弱体一部解除）");
    return;
  }
  if (action === "overclock") {
    enemy.attack = Math.floor(enemy.attack * 1.12);
    enemy.speed = Math.floor(enemy.speed * 1.08);
    addLog("Protocol3: オーバークロック（攻撃・速度上昇）");
    return;
  }
  if (action === "control_break") {
    enemy.attack = Math.floor(enemy.attack * 1.15);
    enemy.defense = Math.max(1, Math.floor(enemy.defense * 0.86));
    extra.protocol3DamageTakenMultiplier = Math.max(extra.protocol3DamageTakenMultiplier || 1, 1.45);
    addLog("Protocol3: 制御崩壊（与ダメ上昇 / 被ダメ上昇）");
    return;
  }
  if (action === "pulse_cannon") {
    protocol3Strike({ label: "パルスキャノン", hits: 1, power: 1.52, critBonus: 0.08 });
    return;
  }
  if (action === "break_burst") {
    protocol3Strike({ label: "ブレイクバースト", hits: 3, power: 0.88, critBonus: 0.12, applyDefenseBreakChance: 0.22 });
    return;
  }
  if (action === "ignition") {
    protocol3Strike({ label: "プロトコル・イグニッション", hits: 1, power: 2.2, critBonus: 0.18 });
    return;
  }
  protocol3Strike({ label: "トライバースト", hits: 3, power: 0.82, critBonus: 0.1 });
}

function protocol3Strike(options) {
  const enemy = state.battle.enemy;
  if (!enemy) return;
  const effective = getEffectivePlayerStats();
  const regionId = STAGE_DATA[state.battle.stageId]?.mapId || state.currentMap || "grassland";
  const evasion = getCappedEffectiveEvasion(effective, regionId);
  const extra = state.battle.gimmick.extra;
  const lockOn = (extra.protocol3TargetLockUntil || 0) > Date.now();
  let hitChance = (0.92 * getEnemyAccuracyMultiplier()) - evasion + (lockOn ? 0.18 : 0);
  hitChance = clamp(0.45, 0.99, hitChance);
  let reduction = getDamageReductionMultiplier();
  reduction *= effective.damageReductionMultiplier || 1;
  const regionReduction = state.titleEffects.regionDamageReduction?.[regionId] || 0;
  if (regionReduction > 0) reduction *= 1 - regionReduction;
  const hits = Math.max(1, Math.floor(options.hits || 1));
  for (let i = 0; i < hits; i += 1) {
    if (!state.battle.isActive || state.battle.playerCurrentHp <= 0) {
      return;
    }
    if (Math.random() > hitChance) {
      addLog(`Protocol3の${options.label} ${i + 1}段目を回避した。`);
      continue;
    }
    const critChance = (options.critBonus || 0) + (lockOn ? 0.12 : 0);
    const isCrit = Math.random() < critChance;
    const raw = Math.max(1, Math.floor(enemy.attack * (options.power || 1) - effective.defense * 0.52));
    let damage = Math.max(1, Math.floor(raw * reduction * (isCrit ? 1.62 : 1)));
    if (state.titleEffects.priestDamageHalfChance > 0 && Math.random() < state.titleEffects.priestDamageHalfChance) {
      damage = Math.max(1, Math.floor(damage * 0.5));
      addLog("目覚めた僧侶: 被ダメージ半減が発動");
    }
    applyDamage("enemy", damage, isCrit ? `${options.label} 会心` : `${options.label} ${i + 1}段`);
    if (options.applyDefenseBreakChance && Math.random() < options.applyDefenseBreakChance) {
      applyEffect("player", "protocol3_break", { stat: "defense", multiplier: 0.88, durationMs: 4200, displayNameJa: "防御破壊" });
      addLog("Protocol3の破壊信号で防御が低下した。");
    }
  }
}

function useSkill(skill) {
  const display = getSkillDisplayData(skill.id);
  const skillName = display?.nameJa || skill.nameJa || skill.name || skill.id;
  const mpCost = Math.max(0, Math.floor(skill.mpCost * (1 - getTotalMpCostReduction())));
  if (state.battle.playerCurrentMp < mpCost) {
    return;
  }
  triggerSkillVisualEffect(skill.id);
  state.battle.playerCurrentMp -= mpCost;
  const equippedSkillCount = getEquippedSkills().length;
  const hasOpenSkillSlot = equippedSkillCount < 4;
  const conditionalRecovery = hasOpenSkillSlot ? (state.titleEffects.skillCooldownRecoveryIfSkillSlotOpen || 0) : 0;
  const cooldownRecovery = Math.max(0, (state.titleEffects.skillCooldownRecovery || 0) + conditionalRecovery);
  const cooldownScale = Math.max(0.5, 1 - cooldownRecovery);
  state.skillCooldowns[skill.id] = Date.now() + Math.floor((skill.cooldownMs * cooldownScale) / state.battleSpeedMultiplier);

  if (skill.type === "magicAttack") {
    state.stats.spellUseCount += 1;
    checkTitleUnlocks("afterSpellUse");
  }
  if (skill.type === "heal") {
    state.stats.healSkillUseCount += 1;
    checkTitleUnlocks("afterHealSkillUse");
  }

  if (skill.type === "attack" || skill.type === "magicAttack") {
    state.runtime.lastHitMeta = { source: "skill", skillType: skill.type, skillId: skill.id, isCrit: false };
    applyDamage("player", calculateSkillDamage(skill), skillName);
    recoverMpFromMageAttack(skillName);
    return;
  }
  if (skill.type === "multiAttack") {
    state.runtime.lastHitMeta = { source: "skill", skillType: skill.type, skillId: skill.id, isCrit: false };
    const hits = skill.hits || 2;
    for (let i = 0; i < hits; i += 1) {
      if (!state.battle.enemy || state.battle.enemy.hp <= 0) {
        break;
      }
      applyDamage("player", Math.max(1, Math.floor(calculateSkillDamage(skill))), `${skillName} ${i + 1}Hit`);
    }
    recoverMpFromMageAttack(skillName);
    return;
  }
  if (skill.type === "heal") {
    const maxHp = getEffectivePlayerStat("maxHp");
    const beforeHp = state.battle.isActive ? state.battle.playerCurrentHp : state.player.hp;
    if (beforeHp >= maxHp) {
      state.stats.fullHpHealCastCount = (state.stats.fullHpHealCastCount || 0) + 1;
    }
    const healMul = (1 + state.titleEffects.healMultiplier) * (getEffectivePlayerStats().healPowerMultiplier || 1);
    let heal = Math.max(8, Math.floor((getEffectivePlayerStat("maxHp") * skill.healRatio + getEffectivePlayerStat("intelligence") * 0.4) * healMul));
    if (state.titleEffects.comboEvasionHealScaling > 0) {
      const effective = getEffectivePlayerStats();
      const regionId = STAGE_DATA[state.battle.stageId]?.mapId || state.currentMap || "grassland";
      const evasion = getCappedEffectiveEvasion(effective, regionId);
      heal = Math.max(1, Math.floor(heal * (1 + evasion * state.titleEffects.comboEvasionHealScaling)));
    }
    if (state.titleEffects.priestHealDoubleChance > 0 && Math.random() < state.titleEffects.priestHealDoubleChance) {
      heal *= 2;
      addLog("ガンギマリ僧侶: 回復量2倍が発動");
    }
    const result = applyHealing(heal, skillName, true);
    addLog(`回復: ${skillName} で ${result.actualHeal}`);
    return;
  }
  if (skill.type === "buff") {
    if (state.battle.isActive && STAGE_DATA[state.battle.stageId]?.mapId === "volcano" && skill.effect?.stat === "defense") {
      state.stats.volcanoDefenseSkillUseCount = (state.stats.volcanoDefenseSkillUseCount || 0) + 1;
    }
    const effectData = { ...skill.effect };
    const buffAmp = (state.titleEffects.mageBuffSkillAmplify || 0) + (state.titleEffects.comboBuffSkillAmplify || 0);
    if (buffAmp > 0) {
      const amp = buffAmp;
      if (typeof effectData.multiplier === "number") {
        if (effectData.multiplier >= 1) {
          effectData.multiplier = 1 + (effectData.multiplier - 1) * (1 + amp);
        } else {
          const reduced = (1 - effectData.multiplier) * (1 + amp);
          effectData.multiplier = Math.max(0.2, 1 - reduced);
        }
      }
    }
    applyEffect("player", skill.id, { ...effectData, sourceSkillId: skill.id, displayNameJa: skillName, kind: "buff" });
    addLog(`バフ発動: ${skillName}`);
    recoverHpFromSwordsmanBuff(skillName);
    return;
  }
  if (skill.type === "debuff") {
    const effectData = { ...skill.effect };
    if (state.titleEffects.comboDebuffSkillAmplify > 0 && typeof effectData.multiplier === "number") {
      if (effectData.multiplier >= 1) {
        effectData.multiplier = 1 + (effectData.multiplier - 1) * (1 + state.titleEffects.comboDebuffSkillAmplify);
      } else {
        const reduced = (1 - effectData.multiplier) * (1 + state.titleEffects.comboDebuffSkillAmplify);
        effectData.multiplier = Math.max(0.1, 1 - reduced);
      }
    }
    applyEffect("enemy", skill.id, { ...effectData, sourceSkillId: skill.id, displayNameJa: skillName, kind: "debuff" });
    addLog(`デバフ付与: ${skillName}`);
    recordNinjaDebuffApply();
    addNinjaDebuffAttackStack();
    addNinjaTitleDebuffStacks();
    return;
  }
  if (skill.type === "attackDebuff") {
    state.runtime.lastHitMeta = { source: "skill", skillType: skill.type, skillId: skill.id, isCrit: false };
    applyDamage("player", calculateSkillDamage(skill), skillName);
    const effectData = { ...skill.effect };
    if (state.titleEffects.comboDebuffSkillAmplify > 0 && typeof effectData.multiplier === "number") {
      if (effectData.multiplier >= 1) {
        effectData.multiplier = 1 + (effectData.multiplier - 1) * (1 + state.titleEffects.comboDebuffSkillAmplify);
      } else {
        const reduced = (1 - effectData.multiplier) * (1 + state.titleEffects.comboDebuffSkillAmplify);
        effectData.multiplier = Math.max(0.1, 1 - reduced);
      }
    }
    applyEffect("enemy", skill.id, { ...effectData, sourceSkillId: skill.id, displayNameJa: skillName, kind: "debuff" });
    recoverMpFromMageAttack(skillName);
    recordNinjaDebuffApply();
    addNinjaDebuffAttackStack();
    addNinjaTitleDebuffStacks();
  }
}

function applyDamage(source, amount, actionName, isCrit = false) {
  if (!state.battle.enemy) {
    return;
  }
  if (source === "player") {
    let damage = applyPlayerDamageBonuses(amount, state.battle.enemy);
    if (state.battle.enemy.id === "protocol3") {
      const mul = Number(state.battle.gimmick?.extra?.protocol3DamageTakenMultiplier || 1);
      damage = Math.max(1, Math.floor(damage * mul));
    }
    if (state.titleRuntime.swordsmanChargeReady) {
      const chargeMul = Math.max(1, Number(state.titleEffects.swordsmanChargeDamageMultiplier || 2));
      damage = Math.max(1, Math.floor(damage * chargeMul));
      state.titleRuntime.swordsmanChargeReady = false;
      addLog("倍倍剣士: チャージ解放で与ダメージ増幅");
    }
    if (state.titleEffects.mageSacrificeAttackMultiplier > 1) {
      damage = Math.max(1, Math.floor(damage * state.titleEffects.mageSacrificeAttackMultiplier));
    }
    state.battle.enemy.hp = Math.max(0, state.battle.enemy.hp - damage);
    state.battle.recentActionText = `${actionName} -> ${state.battle.enemy.name} に ${damage} ダメージ`;
    addLog(`${actionName}: ${state.battle.enemy.name} に ${damage} ダメージ`);
    if (state.titleEffects.swordsmanLifestealChance > 0 && Math.random() < state.titleEffects.swordsmanLifestealChance) {
      const drain = Math.max(1, Math.floor(damage * Math.max(0, Number(state.titleEffects.swordsmanLifestealRatio || 0.5))));
      const drainResult = applyHealing(drain, "吸血剣士", false);
      if (drainResult.actualHeal > 0) {
        addLog(`吸血剣士: HP +${Math.floor(drainResult.actualHeal)}`);
      }
    }
    if (state.titleEffects.swordsmanFlashEvasionOnHit) {
      const active = Date.now() < (state.titleRuntime.flashSwordsmanEvasionUntil || 0);
      state.titleRuntime.flashSwordsmanEvasionUntil = Date.now() + 6000;
      if (!active) {
        addLog("閃光の剣士: 回避バフ発動");
      }
    }
    if (!state.titleRuntime.swordsmanChargeReady && state.titleEffects.swordsmanChargeChance > 0 && Math.random() < state.titleEffects.swordsmanChargeChance) {
      state.titleRuntime.swordsmanChargeReady = true;
      addLog("倍倍剣士: チャージ獲得");
    }
    if (!state.titleRuntime.swordsmanReflectReady && state.titleEffects.swordsmanReflectReadyChance > 0 && Math.random() < state.titleEffects.swordsmanReflectReadyChance) {
      state.titleRuntime.swordsmanReflectReady = true;
      addLog("剣狼: 反射準備完了");
    }
    if (!state.titleRuntime.comboReflectReady && state.titleEffects.comboReflectReadyChance > 0 && Math.random() < state.titleEffects.comboReflectReadyChance) {
      state.titleRuntime.comboReflectReady = true;
      addLog("剣狼2: 反射準備完了");
    }
    const extraStrikeChance = clamp(0, 0.95, Number(state.titleEffects.comboDoubleStrikeChance || 0));
    if (extraStrikeChance > 0 && state.battle.enemy.hp > 0 && (state.titleRuntime.comboExtraStrikeDepth || 0) <= 0 && Math.random() < extraStrikeChance) {
      state.titleRuntime.comboExtraStrikeDepth = 1;
      addLog("複合称号: 追加攻撃が発動");
      applyDamage("player", damage, `${actionName} 追撃`, isCrit);
      state.titleRuntime.comboExtraStrikeDepth = 0;
      if (!state.battle.enemy || state.battle.enemy.hp <= 0) {
        return;
      }
    }
    if (state.titleEffects.mageSacrificeSelfHpRate > 0) {
      const selfDamage = Math.max(1, Math.floor(getEffectivePlayerStat("maxHp") * state.titleEffects.mageSacrificeSelfHpRate));
      state.battle.playerCurrentHp = Math.max(0, state.battle.playerCurrentHp - selfDamage);
      addLog(`サクリファイス: 反動ダメージ ${selfDamage}`);
      if (state.battle.playerCurrentHp <= 0) {
        handleDefeat();
        return;
      }
    }
    if (state.battle.enemy.hp <= 0) {
      const meta = state.runtime.lastHitMeta || {};
      if (meta.isCrit) {
        state.stats.critFinishCountAll = (state.stats.critFinishCountAll || 0) + 1;
      }
      if (meta.source === "skill" && meta.skillType === "magicAttack") {
        state.stats.magicFinishCount = (state.stats.magicFinishCount || 0) + 1;
      }
      state.runtime.lastHitMeta = null;
      if (
        state.battle.isUniqueBattle &&
        state.battle.enemy.id === "phoenix" &&
        !state.battle.gimmick.extra.phoenixReborn
      ) {
        state.battle.gimmick.extra.phoenixReborn = true;
        state.battle.enemy.hp = Math.floor(state.battle.enemy.maxHp * 0.48);
        state.battle.enemy.attack = Math.floor(state.battle.enemy.attack * 1.2);
        state.battle.enemy.speed = Math.floor(state.battle.enemy.speed * 1.12);
        addLog("[神話級ギミック] 鳳凰が灰の中から再誕した。");
        return;
      }
      if (isCrit && state.battle.isFieldBossBattle) {
        state.stats.bossCritFinishCount += 1;
      }
      handleEnemyDefeated();
    }
    return;
  }
  if (Date.now() < (state.titleRuntime.comboInvincibleUntil || 0)) {
    addLog("聖騎士: 無敵で攻撃を無効化");
    return;
  }
  state.battle.playerCurrentHp = Math.max(0, state.battle.playerCurrentHp - amount);
  state.battle.stageDamageTaken = (state.battle.stageDamageTaken || 0) + amount;
  state.stats.damageTakenTotal += amount;
  if (state.titleRuntime.swordsmanReflectReady && state.titleEffects.swordsmanReflectRate > 0 && state.battle.enemy?.hp > 0) {
    const reflected = Math.max(1, Math.floor(amount * state.titleEffects.swordsmanReflectRate));
    state.titleRuntime.swordsmanReflectReady = false;
    state.battle.enemy.hp = Math.max(0, state.battle.enemy.hp - reflected);
    addLog(`剣狼: 反射ダメージ ${reflected}`);
    if (state.battle.enemy.hp <= 0) {
      handleEnemyDefeated();
      return;
    }
  }
  if (state.titleRuntime.comboReflectReady && state.titleEffects.comboReflectRate > 0 && state.battle.enemy?.hp > 0) {
    const reflected = Math.max(1, Math.floor(amount * state.titleEffects.comboReflectRate));
    state.titleRuntime.comboReflectReady = false;
    state.battle.enemy.hp = Math.max(0, state.battle.enemy.hp - reflected);
    addLog(`剣狼2: 反射ダメージ ${reflected}`);
    if (state.battle.enemy.hp <= 0) {
      handleEnemyDefeated();
      return;
    }
  }
  if (Math.random() < 0.03 * (1 - getStatusResistBonus("poison"))) state.stats.poisonTakenCount += 1;
  if (Math.random() < 0.02 * (1 - getStatusResistBonus("paralyze"))) state.stats.paralyzeTakenCount += 1;
  if (Math.random() < 0.03 * (1 - getStatusResistBonus("burn"))) {
    state.stats.burnTakenCount += 1;
    state.battle.gimmick.extra.playerBurnedThisBattle = true;
  }
  if (Math.random() < 0.025 * (1 - getStatusResistBonus("bleed"))) state.stats.bleedTakenCount += 1;
  checkTitleUnlocks("afterDamageTaken");
  addLog(`被ダメージ: ${amount}`);
  if (state.battle.playerCurrentHp <= 0) {
    handleDefeat();
  }
}

function handleEnemyDefeated() {
  const enemy = state.battle.enemy;
  if (!enemy) {
    return;
  }
  const stage = STAGE_DATA[state.battle.stageId];
  const mapId = stage?.mapId || "grassland";

  state.stats.totalWins += 1;
  state.stats.currentWinStreak += 1;
  state.stats.totalConsecutiveWinsBest = Math.max(state.stats.totalConsecutiveWinsBest || 0, state.stats.currentWinStreak);
  state.stats.totalKills += 1;
  state.stats.enemyKillCounts[enemy.id] = (state.stats.enemyKillCounts[enemy.id] || 0) + 1;
  state.stats.winsByRegion[stage.mapId] = (state.stats.winsByRegion[stage.mapId] || 0) + 1;
  if (mapId === "grassland") {
    state.stats.grasslandWinStreakCurrent = (state.stats.grasslandWinStreakCurrent || 0) + 1;
    state.stats.grasslandWinStreakBest = Math.max(state.stats.grasslandWinStreakBest || 0, state.stats.grasslandWinStreakCurrent);
  } else {
    state.stats.grasslandWinStreakCurrent = 0;
  }
  state.battle.stageKillCount += 1;
  const prog = getStageProgress(stage.id);
  prog.kills = state.battle.stageKillCount;
  state.currentStageKillCount = prog.kills;
  state.currentStageTargetKills = prog.target;

  if (state.battle.playerCurrentHp <= 9) {
    state.stats.hpOneDigitWins += 1;
  }
  if (state.battle.playerCurrentHp <= getEffectivePlayerStat("maxHp") * 0.2) {
    state.stats.nearDeathWins += 1;
  }
  const currentWeight = calculateWeightInfo(getEffectivePlayerStat("attack"));
  const weightRatio = currentWeight.capacity > 0 ? currentWeight.totalWeight / currentWeight.capacity : 0;
  if (weightRatio < 0.5) {
    state.stats.lightWeightWinCount = (state.stats.lightWeightWinCount || 0) + 1;
  }
  if (weightRatio >= 0.8) {
    state.stats.heavyWeightWinCount = (state.stats.heavyWeightWinCount || 0) + 1;
  }
  if (currentWeight.slotsFilled >= 6) {
    state.stats.fullEquipWins += 1;
  }
  if ((state.equippedNormalTitleIds || []).length >= (state.maxNormalTitleSlots || 0)) {
    state.stats.normalSlotsFullBattleWins = (state.stats.normalSlotsFullBattleWins || 0) + 1;
    if (weightRatio >= 0.8) {
      state.stats.fullNormalHeavyWinCount = (state.stats.fullNormalHeavyWinCount || 0) + 1;
    }
  }
  if (currentWeight.totalWeight > currentWeight.capacity) {
    state.stats.overweightWins += 1;
  }
  if (mapId === "sea" && ["blueCrab", "killerShell", "deepJelly", "krakenSpawn", "tidalKnight", "leviathan"].includes(enemy.id)) {
    state.stats.seaSpecialEnemyKillCount = (state.stats.seaSpecialEnemyKillCount || 0) + 1;
  }
  if (mapId === "volcano" && state.battle.gimmick?.extra?.playerBurnedThisBattle) {
    state.stats.volcanoBurnWinCount = (state.stats.volcanoBurnWinCount || 0) + 1;
  }
  if (getCurrentMainBattleLineId() === "priest_line") {
    const equippedSkills = getEquippedSkills();
    if (equippedSkills.length === 0) {
      state.stats.priestNoSkillKillCount = (state.stats.priestNoSkillKillCount || 0) + 1;
    }
    if (equippedSkills.length > 0 && equippedSkills.every((skill) => skill.type !== "heal")) {
      state.stats.priestNoHealWinCount = (state.stats.priestNoHealWinCount || 0) + 1;
    }
    if (
      equippedSkills.length > 0 &&
      equippedSkills.every((skill) => ["attack", "magicAttack", "multiAttack", "attackDebuff"].includes(skill.type))
    ) {
      state.stats.priestOnlyOffenseWinCount = (state.stats.priestOnlyOffenseWinCount || 0) + 1;
    }
  }
  if (state.battle.isUniqueBattle) {
    handleUniqueVictory(enemy);
  }

  addLog(`敵撃破: ${enemy.name}`);
  gainRewards(enemy);
  checkQuestCompletion();
  checkTitleUnlocks("afterKill");
  checkEquipmentRelatedTitles();

  if (state.battle.stageKillCount >= state.battle.stageTargetKills) {
    handleStageClear();
    return;
  }
  state.battle.enemy = null;
  state.battle.pendingSpawnAt = Date.now() + Math.floor(900 / state.battleSpeedMultiplier);
}

function handleStageClear() {
  const stageId = state.battle.stageId;
  const stage = STAGE_DATA[stageId];
  if (state.stats.noReturnExpeditionActive && ["grassland", "desert", "sea"].includes(stage.mapId)) {
    state.stats.noReturnRegionClears = { ...(state.stats.noReturnRegionClears || {}), [stage.mapId]: true };
  }
  const prog = getStageProgress(stageId);
  prog.cleared = !stage.loopChallengeId;
  prog.kills = stage.loopChallengeId ? 0 : prog.target;
  if (!state.clearedStages.includes(stageId) && !stage.loopChallengeId) {
    state.clearedStages.push(stageId);
  }
  state.stats.stageClearCount += 1;
  state.stats.stageClearById[stageId] = (state.stats.stageClearById[stageId] || 0) + 1;
  state.stats.stageRepeatCounts[stageId] = (state.stats.stageRepeatCounts[stageId] || 0) + 1;
  const clearWeight = calculateWeightInfo(getEffectivePlayerStat("attack"));
  if (clearWeight.rank === "extreme" && (stage.mapId === "volcano" || stage.recommendedLevel >= 120)) {
    state.stats.extremeOverweightClears += 1;
  }

  if (!state.battle.itemUsedInStage) {
    state.stats.noItemStageClearCount += 1;
    if (stage.mapId === "desert") {
      state.stats.desertNoRestStageClearStreak = (state.stats.desertNoRestStageClearStreak || 0) + 1;
    } else {
      state.stats.desertNoRestStageClearStreak = 0;
    }
  } else if (stage.mapId === "desert") {
    state.stats.desertNoRestStageClearStreak = 0;
  }
  if ((state.battle.stageDamageTaken || 0) <= 0) {
    state.stats.totalNoDamageStageClears += 1;
  }
  state.stats.noRestStageClearStreak += 1;

  const bonusExp = stage.isFieldBossStage ? Math.floor(stage.recommendedLevel * 16) : Math.floor(stage.recommendedLevel * 4);
  const bonusGold = stage.isFieldBossStage ? Math.floor(stage.recommendedLevel * 12) : Math.floor(stage.recommendedLevel * 3);
  const speedExpBonus = getSpeedModeExpBonus();
  state.player.exp += Math.floor(bonusExp * (1 + state.titleEffects.expMultiplier + speedExpBonus));
  state.player.gold += Math.floor(bonusGold * (1 + state.titleEffects.goldMultiplier));
  state.stats.totalGoldEarned += Math.floor(bonusGold * (1 + state.titleEffects.goldMultiplier));
  addLog(`ステージクリア: ${stageId} / ボーナス EXP+${bonusExp}, GOLD+${bonusGold}`);
  showCenterPopup({ text: `ステージクリア ${stageId}`, type: stage.isFieldBossStage ? "important" : "event" });
  checkLevelUp();

  if (stage.isFieldBossStage) {
    handleFieldBossClear(stageId);
  }

  state.currentStageKillCount = stage.loopChallengeId ? 0 : prog.kills;
  state.currentStageTargetKills = prog.target;
  state.battle.isActive = false;
  state.battle.status = "ステージクリア";
  state.battle.enemy = null;
  stopBattleLoop();
  checkTitleUnlocks("afterStageClear");
  checkTitleUnlocks("afterBattle");
  autoSaveIfNeeded("stageClear");
  render();
}

function handleFieldBossClear(stageId) {
  const stage = STAGE_DATA[stageId];
  if (stage?.finalContentId) {
    addLog(`最終ボス撃破: ${stageId}`);
    handleFinalBossVictory();
    updateBoardThreadsFromEndingProgress();
    checkLoopOnlyTitles("afterFinalBossClear");
    autoSaveIfNeeded("bossClear");
    return;
  }
  if (stage?.loopChallengeId) {
    addLog(`周回ボス撃破: ${stageId}`);
    handleEnhancedBossVictory();
    applyLoopUnlocks();
    checkLoopOnlyTitles("afterSpecialChallengeClear");
    autoSaveIfNeeded("bossClear");
    return;
  }

  if (!state.fieldBossCleared.includes(stageId)) {
    state.fieldBossCleared.push(stageId);
  }
  state.stats.fieldBossKillCount += 1;
  if (getEquippedSkills().length < 4) {
    state.stats.bossKillWithEmptySkillSlots = (state.stats.bossKillWithEmptySkillSlots || 0) + 1;
  }
  if (state.battle.playerCurrentHp <= getEffectivePlayerStat("maxHp") * 0.3) {
    state.stats.lowHpBossKillCount = (state.stats.lowHpBossKillCount || 0) + 1;
  }
  addLog(`フィールドボス撃破: ${stageId}`);
  const slotReward = stage?.mapId ? claimBossTitleSlotReward(stage.mapId) : null;
  if (slotReward) {
    addLog(`${slotReward.label}報酬！ ノーマル称号枠+${slotReward.reward.normal} / チート称号枠+${slotReward.reward.cheat}`);
    addLog("称号ビルドの幅が広がった！");
    showCenterPopup({ text: `${slotReward.label}: 称号枠+${slotReward.reward.normal}/+${slotReward.reward.cheat}`, type: "important" });
  }

  recordBossFirstTryResult(stageId, true);
  if (!state.player.equipmentSlots.weapon1 && !state.player.equipmentSlots.weapon2) {
    state.stats.noWeaponBossKills += 1;
  }
  const mainLineId = getCurrentMainBattleLineId();
  const subLineId = getCurrentSubBattleLineId();
  const comboKey = getBattleLinePairKey(mainLineId, subLineId);
  const weaponCount = getEquippedWeaponCount();
  if (mainLineId === "swordsman_line") {
    state.stats.swordsmanBossKillCount = (state.stats.swordsmanBossKillCount || 0) + 1;
  }
  if (stageId === "2-10" && mainLineId === "swordsman_line") {
    state.stats.swordsmanDesertBossClearCount = (state.stats.swordsmanDesertBossClearCount || 0) + 1;
    if (!state.player.equipmentSlots.armor1 && !state.player.equipmentSlots.armor2) {
      state.stats.swordsmanNoArmorDesertBossClearCount = (state.stats.swordsmanNoArmorDesertBossClearCount || 0) + 1;
    }
  }
  if (stageId === "2-10" && mainLineId === "mage_line") {
    const equippedSkills = getEquippedSkills();
    if (equippedSkills.length === 1) {
      state.stats.mageDesertBossSingleSkillClearCount = (state.stats.mageDesertBossSingleSkillClearCount || 0) + 1;
    }
    if (equippedSkills.length === 4 && equippedSkills.every((skill) => ["attack", "magicAttack", "multiAttack", "attackDebuff"].includes(skill?.type))) {
      state.stats.mageDesertBossFourAttackSkillsClearCount = (state.stats.mageDesertBossFourAttackSkillsClearCount || 0) + 1;
    }
    if (equippedSkills.length === 4 && equippedSkills.every((skill) => skill?.type === "buff")) {
      state.stats.mageDesertBossFourBuffSkillsClearCount = (state.stats.mageDesertBossFourBuffSkillsClearCount || 0) + 1;
    }
  }
  if (stageId === "2-10" && comboKey) {
    if (comboKey === "swordsman_line|swordsman_line") state.stats.comboDesertBossClear_swordsman_swordsman = (state.stats.comboDesertBossClear_swordsman_swordsman || 0) + 1;
    if (comboKey === "mage_line|swordsman_line") state.stats.comboDesertBossClear_mage_swordsman = (state.stats.comboDesertBossClear_mage_swordsman || 0) + 1;
    if (comboKey === "ninja_line|swordsman_line") state.stats.comboDesertBossClear_ninja_swordsman = (state.stats.comboDesertBossClear_ninja_swordsman || 0) + 1;
    if (comboKey === "priest_line|swordsman_line") state.stats.comboDesertBossClear_priest_swordsman = (state.stats.comboDesertBossClear_priest_swordsman || 0) + 1;
    if (comboKey === "mage_line|mage_line") state.stats.comboDesertBossClear_mage_mage = (state.stats.comboDesertBossClear_mage_mage || 0) + 1;
    if (comboKey === "mage_line|ninja_line") state.stats.comboDesertBossClear_mage_ninja = (state.stats.comboDesertBossClear_mage_ninja || 0) + 1;
    if (comboKey === "mage_line|priest_line") state.stats.comboDesertBossClear_mage_priest = (state.stats.comboDesertBossClear_mage_priest || 0) + 1;
    if (comboKey === "ninja_line|ninja_line") state.stats.comboDesertBossClear_ninja_ninja = (state.stats.comboDesertBossClear_ninja_ninja || 0) + 1;
    if (comboKey === "ninja_line|priest_line") state.stats.comboDesertBossClear_ninja_priest = (state.stats.comboDesertBossClear_ninja_priest || 0) + 1;
    if (comboKey === "priest_line|priest_line") state.stats.comboDesertBossClear_priest_priest = (state.stats.comboDesertBossClear_priest_priest || 0) + 1;
  }
  if (mainLineId === "swordsman_line" && weaponCount === 1) {
    state.stats.swordsmanSingleWeaponBossKillCount = (state.stats.swordsmanSingleWeaponBossKillCount || 0) + 1;
  }
  if (mainLineId === "mage_line" && weaponCount >= 2) {
    state.stats.mageDualWeaponBossKillCount = (state.stats.mageDualWeaponBossKillCount || 0) + 1;
  }
  if (mainLineId === "ninja_line" && weaponCount === 0) {
    state.stats.ninjaNoWeaponBossKillCount = (state.stats.ninjaNoWeaponBossKillCount || 0) + 1;
  }
  if (!state.player.subJobId) {
    state.stats.noSubJobBossKillCount += 1;
  }
  const equippedIds = Object.values(state.player.equipmentSlots || {}).filter(Boolean);
  const craftedBossBuild = equippedIds.some((id) => {
    const eq = EQUIPMENT_DATA[id];
    return eq && (eq.specialTags || []).some((tag) => ["crafted_bonus", "god_quality", "alchemy_masterpiece", "smith_masterpiece", "culinary_masterpiece"].includes(tag));
  });
  if (craftedBossBuild) {
    state.stats.craftedGearBossKillCount += 1;
  }
  if (getEffectivePlayerStat("defense") > getEffectivePlayerStat("attack") * 1.3) {
    state.stats.defenseBuildBossKills += 1;
  }

  if (stageId === "1-10") {
    unlockTown("dustria");
  } else if (stageId === "2-10") {
    if (getCurrentMainBattleLineId() === "priest_line") {
      state.stats.priestDesertBossClearCount = (state.stats.priestDesertBossClearCount || 0) + 1;
      const equippedSkills = getEquippedSkills();
      if (equippedSkills.length >= 4 && equippedSkills.slice(0, 4).every((skill) => skill?.type === "heal")) {
        state.stats.priestDesertBossWithFourHealsCount = (state.stats.priestDesertBossWithFourHealsCount || 0) + 1;
      }
    }
    addItem("hydraScale", 2);
    addLog("ボス素材獲得: ヒドラ鱗 x2");
    unlockTown("akamatsu");
  } else if (stageId === "3-10") {
    addItem("leviathanFin", 2);
    addLog("ボス素材獲得: リヴァイア鰭 x2");
    unlockTown("rulacia");
  } else if (stageId === "4-10") {
    addItem("volkaCore", 2);
    addLog("ボス素材獲得: ヴォルカ核 x2");
    addLog("火山4-10をクリア。現段階の到達点です。");
    state.loop.clearedGame = true;
    if (!state.unlockedEndings.includes("normal_end")) {
      state.unlockedEndings.push("normal_end");
      addLog("エンディング解放: normal_end");
    }
    if (LOW_TIER_MAIN_JOBS.includes(state.player.mainJobBaseId || state.player.mainJobId)) {
      state.stats.loopClearWithLowTierJob += 1;
    }
    if (state.player.productionJobStage >= 3 || state.stats.totalCrafts >= 300) {
      state.stats.loopClearWithProductionFocus += 1;
    }
    checkEndgameTitleConditions();
    checkTitleUnlocks("afterGameClear");
    prepareLoopResult();
    state.screen = "clearResult";
  } else if (stageId === "5-10") {
    addItem("controlBoard", 2);
    addItem("overclockCircuit", 2);
    addItem("collapseArmorShard", 2);
    addItem("skyFurnaceCore", 1);
    state.neverendBossClearFlags = { ...(state.neverendBossClearFlags || {}), protocol3: true };
    state.worldStateFlags = { ...(state.worldStateFlags || {}), protocol3Slayer: true };
    state.neverendVipUnlocked = true;
    addLog("Protocol3撃破報酬: 制御基板x2 / オーバークロック回路x2 / 崩壊装甲片x2 / 天空炉心x1");
    addLog("称号獲得: Protocol3撃破者");
    showCenterPopup({ text: "Protocol3撃破: VIP解放", type: "important" });
  }
  if (!state.player.subJobId) {
    state.stats.subJoblessBossClears += 1;
  }
  syncStoryProgress();
  updateBoardThreadsFromProgress();
  applyLoopUnlocks();
  checkEndgameTitleConditions();
  autoSaveIfNeeded("bossClear");
}

function unlockTown(townId) {
  if (state.unlockedTowns.includes(townId)) {
    return;
  }
  state.unlockedTowns.push(townId);
  updateGuildRank({ silent: false, refreshOnChange: true });
  state.stats.townUnlockCount += 1;
  addLog(`町解放: ${TOWN_DATA[townId].name}`);
  showBattleSpecialPopup(`町解放: ${TOWN_DATA[townId].name}`);
  showCenterPopup({ text: `新町解放: ${TOWN_DATA[townId].name}`, type: "important" });
  autoSaveIfNeeded("bossClear");
}

function handleUniqueVictory(enemy) {
  state.stats.uniqueNoRetreatResolveCount = (state.stats.uniqueNoRetreatResolveCount || 0) + 1;
  state.uniqueKillCount += 1;
  state.stats.uniqueKillCount += 1;
  state.stats.uniqueKillById[enemy.id] = (state.stats.uniqueKillById[enemy.id] || 0) + 1;
  if (!state.uniqueDefeatedIds.includes(enemy.id)) {
    state.uniqueDefeatedIds.push(enemy.id);
    state.stats.totalUniqueTypesDefeated = state.uniqueDefeatedIds.length;
  }
  const uniqueBonusExp = Math.floor(enemy.exp * 1.0);
  const uniqueBonusGold = Math.floor(enemy.gold * 0.9);
  state.player.exp += uniqueBonusExp;
  state.player.gold += uniqueBonusGold;
  state.stats.totalGoldEarned += uniqueBonusGold;
  state.stats.totalGoldLifetime += uniqueBonusGold;

  const skillTag = `unique_skill_${enemy.id}`;
  if (!state.unlockedUniqueSkills.includes(skillTag)) {
    state.unlockedUniqueSkills.push(skillTag);
  }
  addLog(`ユニーク撃破: ${enemy.name} / 特別報酬 EXP+${uniqueBonusExp}, GOLD+${uniqueBonusGold}`);
  showToast(`ユニーク撃破: ${enemy.name}`, "important");
  syncStoryProgress();
  updateBoardThreadsFromProgress();
  checkTitleUnlocks("afterUniqueKill");
}

function handleDefeat() {
  const stage = STAGE_DATA[state.battle.stageId];
  const wasUniqueBattle = !!state.battle.isUniqueBattle;
  if (stage?.finalContentId) {
    state.currentMap = TOWN_DATA[state.currentTown]?.mapId || "grassland";
    const fallbackStage = getFirstSelectableStage(state.currentMap) || state.currentStage;
    if (fallbackStage && STAGE_DATA[fallbackStage]) {
      state.currentStage = fallbackStage;
      state.currentStageKillCount = getStageProgress(fallbackStage).kills;
      state.currentStageTargetKills = getStageProgress(fallbackStage).target;
    }
    addLog("最終領域から離脱しました。");
  }
  if (stage?.loopChallengeId) {
    addLog("高難易度挑戦失敗。再挑戦可能です。");
    const fallbackStage = getFirstSelectableStage(stage.mapId) || state.currentStage;
    if (fallbackStage && STAGE_DATA[fallbackStage]) {
      state.currentStage = fallbackStage;
      state.currentStageKillCount = getStageProgress(fallbackStage).kills;
      state.currentStageTargetKills = getStageProgress(fallbackStage).target;
    }
  }
  if (stage?.isFieldBossStage) {
    recordBossFirstTryResult(stage.id, false);
  }

  const defeatStageId = state.battle.stageId;
  const mainLineId = getCurrentMainBattleLineId();
  const effective = getEffectivePlayerStats();
  state.stats.totalDeaths += 1;
  if (wasUniqueBattle) {
    state.stats.uniqueNoRetreatResolveCount = (state.stats.uniqueNoRetreatResolveCount || 0) + 1;
  }
  if (defeatStageId) {
    state.stats.defeatsByStage = state.stats.defeatsByStage || {};
    state.stats.defeatsByStage[defeatStageId] = (state.stats.defeatsByStage[defeatStageId] || 0) + 1;
  }
  if (mainLineId === "ninja_line" && stage?.isFieldBossStage && (effective.evasion || 0) <= 0.1) {
    state.stats.ninjaLowEvasionBossDefeatCount = (state.stats.ninjaLowEvasionBossDefeatCount || 0) + 1;
  }
  if (mainLineId === "mage_line" && stage?.isFieldBossStage) {
    state.stats.mageBossDefeatCount = (state.stats.mageBossDefeatCount || 0) + 1;
  }
  if (mainLineId === "ninja_line" && defeatStageId === "1-1") {
    state.stats.ninjaStage11DefeatCount = (state.stats.ninjaStage11DefeatCount || 0) + 1;
  }
  state.stats.currentWinStreak = 0;
  state.stats.grasslandWinStreakCurrent = 0;
  state.stats.noReturnExpeditionActive = false;
  state.stats.noReturnRegionClears = {};
  state.titleRuntime.swordsmanChargeReady = false;
  state.titleRuntime.swordsmanReflectReady = false;
  state.titleRuntime.flashSwordsmanEvasionUntil = 0;
  state.titleRuntime.comboReflectReady = false;
  state.titleRuntime.comboInvincibleUntil = 0;
  state.titleRuntime.comboExtraStrikeDepth = 0;
  state.titleRuntime.reviveBuffPending = true;
  state.battle.isActive = false;
  state.battle.status = "敗北";
  state.battle.enemy = null;
  state.player.hp = state.player.maxHp;
  state.player.mp = state.player.maxMp;
  addLog("敗北。町へ戻ります。");
  showCenterPopup({ text: "敗北 / 町へ帰還", type: "important" });
  checkTitleUnlocks("afterDefeat");
  checkTitleUnlocks("afterBattle");
  stopBattleLoop();
  render();
}

function gainRewards(enemy) {
  const speedExpBonus = getSpeedModeExpBonus();
  const loopBonus = Math.min(BALANCE_CONFIG.reward.maxLoopBonus, state.loop.loopCount * BALANCE_CONFIG.reward.perLoopBonus);
  const expGain = Math.floor(enemy.exp * BALANCE_CONFIG.reward.baseExpMultiplier * (1 + loopBonus + state.titleEffects.expMultiplier + speedExpBonus));
  const goldGain = Math.floor(enemy.gold * BALANCE_CONFIG.reward.baseGoldMultiplier * (1 + loopBonus + state.titleEffects.goldMultiplier));
  state.player.exp += expGain;
  state.player.gold += goldGain;
  state.stats.totalGoldEarned += goldGain;
  state.stats.totalGoldLifetime += goldGain;
  addLog(`EXP獲得 +${expGain}`);
  addLog(`GOLD獲得 +${goldGain}`);

  if (Math.random() < 0.35) {
    state.player.gold += 1;
    state.stats.totalGoldEarned += 1;
    state.stats.totalGoldLifetime += 1;
    state.stats.oneGoldPickupCount += 1;
    addLog("1G拾った。");
  }
  if (Math.random() < 0.2) {
    addItem("herb", 1);
    state.stats.totalGatheredMaterials += 1;
    state.stats.gatheredMaterialCounts.herb = (state.stats.gatheredMaterialCounts.herb || 0) + 1;
    checkTitleUnlocks("afterGather");
  }
  const stage = STAGE_DATA[state.battle.stageId];
  if (stage && Math.random() < 0.25) {
    const drop = weightedPick(REGION_GATHER_TABLE[stage.mapId] || REGION_GATHER_TABLE.grassland);
    addItem(drop.itemId, 1);
    state.stats.gatheredMaterialCounts[drop.itemId] = (state.stats.gatheredMaterialCounts[drop.itemId] || 0) + 1;
    addLog(`素材獲得: ${ITEM_DATA[drop.itemId]?.name || drop.itemId}`);
  }
  checkLevelUp();
}

function checkLevelUp() {
  let leveled = false;
  while (state.player.exp >= expToNextLevel()) {
    state.player.exp -= expToNextLevel();
    state.player.level += 1;
    state.player.maxHp += 8;
    state.player.maxMp += 5;
    state.player.attack += 2;
    state.player.defense += 2;
    state.player.speed += 1;
    state.player.intelligence += 1;
    state.player.luck += 1;
    leveled = true;
  }
  if (leveled) {
    state.player.hp = state.player.maxHp;
    state.player.mp = state.player.maxMp;
    if (state.battle.isActive) {
      state.battle.playerCurrentHp = getEffectivePlayerStat("maxHp");
      state.battle.playerCurrentMp = getEffectivePlayerStat("maxMp");
    }
    addLog(`レベルアップ: Lv.${state.player.level}`);
    showCenterPopup({ text: `Level Up! Lv.${state.player.level}`, type: "event" });
    unlockSubJob();
    refreshJobEvolutionFlags();
    if (state.jobEvolutionFlags.main.canEvolve || state.jobEvolutionFlags.sub.canEvolve) {
      addLog("神殿で戦闘ジョブ進化が可能です。");
      showBattleSpecialPopup("ジョブ進化可能");
    }
    checkTitleUnlocks("afterLevelUp");
  }
}

function canFreeJobChange() {
  return (state.player.level || 0) >= JOB_SYSTEM_RULES.freeJobChangeLevel;
}

function unlockSubJob(options = {}) {
  const silent = !!options.silent;
  if (state.player.subJobUnlocked || state.player.level < JOB_SYSTEM_RULES.subJobUnlockLevel) {
    return;
  }
  state.player.subJobUnlocked = true;
  state.stats.subJobUnlockedAt = state.player.level;
  if (!silent) {
    addLog("サブジョブが解放されました。神殿で設定できます。");
    showBattleSpecialPopup("サブジョブ解放");
  }
}

function getBattleJobTierScaling(value, isSubJob = false) {
  if (!Number.isFinite(value)) {
    return isSubJob ? 0 : 1;
  }
  if (!isSubJob) {
    return value;
  }
  if (value >= 1) {
    return 1 + (value - 1) * 0.45;
  }
  return value;
}

function getBattleJobEvolutionInfo(slotKey = "main") {
  const baseId = slotKey === "sub" ? state.player.subJobBaseId : state.player.mainJobBaseId;
  const tier = Number(slotKey === "sub" ? state.player.subJobTier : state.player.mainJobTier) || 1;
  if (!baseId) {
    return { canEvolve: false, nextJob: null };
  }
  const baseData = getJobDataById(baseId);
  const lineId = baseData?.baseLineId;
  const nextJobId = getNextJobId(lineId, tier);
  const nextJob = nextJobId ? getJobDataById(nextJobId) : null;
  if (!nextJob || nextJob.jobType !== "battle") {
    return { canEvolve: false, nextJob: null };
  }
  const canEvolve = (state.player.level || 1) >= (nextJob.requiredLevel || 9999);
  return { canEvolve, nextJob, lineId };
}

function getProductionJobEvolutionInfo() {
  const baseId = state.player.productionJobBaseId || state.player.productionJob || "apothecary";
  const tier = Number(state.player.productionJobTier || 1);
  const baseData = getJobDataById(baseId);
  const lineId = baseData?.baseLineId;
  const nextJobId = getNextJobId(lineId, tier);
  const nextJob = nextJobId ? getJobDataById(nextJobId) : null;
  if (!nextJob || nextJob.jobType !== "production") {
    return { canEvolve: false, nextJob: null };
  }
  const canEvolve = (state.player.productionJobLevel || 1) >= (nextJob.requiredProductionLevel || 9999);
  return { canEvolve, nextJob, lineId };
}

function unlockBattleSkillsThroughTier(lineId, tier) {
  const line = getJobLineById(lineId);
  const newlyUnlocked = [];
  for (let i = 0; i < Math.min(line.length, tier); i += 1) {
    const jobId = line[i];
    const job = getJobDataById(jobId);
    if (!job) continue;
    const added = unlockSkillIdsForLine(lineId, job.skillList || []);
    newlyUnlocked.push(...added);
  }
  return [...new Set(newlyUnlocked)];
}

function syncMainJobState(baseId, tier = 1, currentId = null, resetBaseStats = false) {
  const baseData = getJobDataById(baseId);
  if (!baseData) {
    return;
  }
  const lineId = baseData.baseLineId;
  const safeTier = Math.max(1, Number(tier) || 1);
  const resolvedCurrentId = currentId || getJobIdByTier(lineId, safeTier) || baseId;
  const currentJob = getJobDataById(resolvedCurrentId) || baseData;
  state.player.mainJobBaseId = baseId;
  state.player.mainJobTier = safeTier;
  state.player.mainJobCurrentId = currentJob.id;
  state.player.mainJobId = currentJob.id;
  state.player.mainJob = currentJob.nameJa || currentJob.name || currentJob.id;
  unlockBattleSkillsThroughTier(lineId, safeTier);
  if (resetBaseStats) {
    const baseStats = JOB_DATA.main[baseId]?.baseStats;
    if (baseStats) {
      Object.assign(state.player, {
        maxHp: baseStats.hp,
        hp: baseStats.hp,
        maxMp: baseStats.mp,
        mp: baseStats.mp,
        attack: baseStats.attack,
        defense: baseStats.defense,
        speed: baseStats.speed,
        intelligence: baseStats.intelligence,
        luck: baseStats.luck
      });
    }
  }
}

function syncSubJobState(baseId, tier = 1, currentId = null) {
  if (!baseId) {
    state.player.subJobBaseId = null;
    state.player.subJobTier = 1;
    state.player.subJobCurrentId = null;
    state.player.subJobId = null;
    state.player.subJob = null;
    return;
  }
  const baseData = getJobDataById(baseId);
  if (!baseData) {
    return;
  }
  const lineId = baseData.baseLineId;
  const safeTier = Math.max(1, Number(tier) || 1);
  const resolvedCurrentId = currentId || getJobIdByTier(lineId, safeTier) || baseId;
  const currentJob = getJobDataById(resolvedCurrentId) || baseData;
  state.player.subJobBaseId = baseId;
  state.player.subJobTier = safeTier;
  state.player.subJobCurrentId = currentJob.id;
  state.player.subJobId = currentJob.id;
  state.player.subJob = currentJob.nameJa || currentJob.name || currentJob.id;
  unlockBattleSkillsThroughTier(lineId, safeTier);
}

function syncProductionJobEvolutionState(baseId, tier = 1, currentId = null) {
  const safeBaseId = baseId || state.player.productionJob || "apothecary";
  const baseData = getJobDataById(safeBaseId);
  if (!baseData) {
    return;
  }
  const lineId = baseData.baseLineId;
  const safeTier = Math.max(1, Number(tier) || 1);
  const resolvedCurrentId = currentId || getJobIdByTier(lineId, safeTier) || safeBaseId;
  const currentJob = getJobDataById(resolvedCurrentId) || baseData;
  state.player.productionJobBaseId = safeBaseId;
  state.player.productionJobTier = safeTier;
  state.player.productionJobCurrentId = currentJob.id;
  state.player.productionJob = safeBaseId;
}

function refreshJobEvolutionFlags() {
  ensureJobEvolutionFlags();
  const main = getBattleJobEvolutionInfo("main");
  const sub = getBattleJobEvolutionInfo("sub");
  const prod = getProductionJobEvolutionInfo();
  state.jobEvolutionFlags.main = {
    canEvolve: !!main.canEvolve,
    hasUnread: !!main.canEvolve,
    targetJobId: main.nextJob?.id || null,
    manualWaiting: !!main.canEvolve,
    autoEvolved: false
  };
  state.jobEvolutionFlags.sub = {
    canEvolve: !!sub.canEvolve,
    hasUnread: !!sub.canEvolve,
    targetJobId: sub.nextJob?.id || null,
    manualWaiting: !!sub.canEvolve,
    autoEvolved: false
  };
  state.jobEvolutionFlags.production = {
    canEvolve: !!prod.canEvolve,
    hasUnread: !!prod.canEvolve,
    targetJobId: prod.nextJob?.id || null,
    manualWaiting: !!prod.canEvolve,
    autoEvolved: false
  };
}

function initializeJobEvolutionState(options = {}) {
  const silent = !!options.silent;
  ensureUnlockedSkillsState();
  ensureJobEvolutionFlags();

  if (state.player.mainJobId) {
    const currentMain = getJobDataById(state.player.mainJobCurrentId || state.player.mainJobId) || getJobDataById(state.player.mainJobId);
    const lineId = currentMain?.baseLineId;
    const baseId = state.player.mainJobBaseId || getJobLineById(lineId)[0] || state.player.mainJobId;
    const tier = state.player.mainJobTier || getCurrentJobTierByLineAndId(lineId, currentMain?.id || state.player.mainJobId);
    syncMainJobState(baseId, tier, currentMain?.id || state.player.mainJobId, false);
  }
  if (state.player.subJobId) {
    const currentSub = getJobDataById(state.player.subJobCurrentId || state.player.subJobId) || getJobDataById(state.player.subJobId);
    const lineId = currentSub?.baseLineId;
    const baseId = state.player.subJobBaseId || getJobLineById(lineId)[0] || state.player.subJobId;
    const tier = state.player.subJobTier || getCurrentJobTierByLineAndId(lineId, currentSub?.id || state.player.subJobId);
    syncSubJobState(baseId, tier, currentSub?.id || state.player.subJobId);
  }

  syncProductionJobEvolutionState(
    state.player.productionJobBaseId || state.player.productionJob || "apothecary",
    state.player.productionJobTier || 1,
    state.player.productionJobCurrentId || null
  );
  unlockSubJob({ silent: true });
  refreshJobEvolutionFlags();
  if (!silent && (state.jobEvolutionFlags.main.canEvolve || state.jobEvolutionFlags.sub.canEvolve || state.jobEvolutionFlags.production.canEvolve)) {
    addLog("神殿でジョブ進化が可能です。");
  }
}

function evolveBattleJob(slotKey = "main") {
  const info = getBattleJobEvolutionInfo(slotKey);
  if (!info.nextJob || !info.canEvolve) {
    addLog("進化条件を満たしていません。");
    return;
  }
  const nextJob = info.nextJob;
  const beforeName = slotKey === "sub" ? (state.player.subJob || "未設定") : (state.player.mainJob || "未設定");
  const nextTier = nextJob.tier || 1;
  const newlyUnlocked = unlockBattleSkillsThroughTier(info.lineId, nextTier);

  if (slotKey === "sub") {
    syncSubJobState(state.player.subJobBaseId, nextTier, nextJob.id);
  } else {
    syncMainJobState(state.player.mainJobBaseId, nextTier, nextJob.id, false);
  }
  refreshPlayerDerivedStats();
  refreshJobEvolutionFlags();

  const unlockedNames = newlyUnlocked.map((id) => SKILL_INDEX_BY_ID[id]?.nameJa || id);
  addLog(`${beforeName}は${nextJob.nameJa}へ進化した！`);
  if (unlockedNames.length > 0) {
    addLog(`新スキル解放: ${unlockedNames.join(" / ")}`);
  }
  showCenterPopup({ text: `${beforeName} -> ${nextJob.nameJa}`, type: "important" });
  showBattleSpecialPopup(`進化: ${nextJob.nameJa}`);
  render();
}

function evolveProductionJob() {
  const info = getProductionJobEvolutionInfo();
  if (!info.nextJob || !info.canEvolve) {
    addLog("生産ジョブの進化条件を満たしていません。");
    return;
  }
  const before = getJobDataById(state.player.productionJobCurrentId || state.player.productionJobBaseId || state.player.productionJob);
  const beforeName = before?.nameJa || PRODUCTION_JOB_LABELS[state.player.productionJob] || state.player.productionJob;
  syncProductionJobEvolutionState(state.player.productionJobBaseId || state.player.productionJob, info.nextJob.tier || 1, info.nextJob.id);
  refreshJobEvolutionFlags();
  addLog(`${beforeName}は${info.nextJob.nameJa}へ進化した！`);
  showCenterPopup({ text: `${beforeName} -> ${info.nextJob.nameJa}`, type: "important" });
  showBattleSpecialPopup(`生産進化: ${info.nextJob.nameJa}`);
  render();
}

const TITLE_CUSTOM_CHECKERS = {
  chain_champion_200: () => state.stats.currentWinStreak >= 200 || state.stats.totalConsecutiveWinsBest >= 200,
  ailment_behemoth: () =>
    (state.stats.poisonTakenCount || 0) >= 50 &&
    (state.stats.paralyzeTakenCount || 0) >= 50 &&
    (state.stats.burnTakenCount || 0) >= 50 &&
    (state.stats.bleedTakenCount || 0) >= 50,
  loop_predator: () => state.loop.loopCount >= 3 && state.stats.totalBossFirstTryWins >= 10,
  unexpected_architect: () => evaluateExploitTags().length >= 6,
  speed_ritualist: () => state.stats.highestBattleSpeedUnlocked >= 4 && state.stats.speedModeSeconds >= 300,
  second_cycle_conqueror: () => state.loop.loopCount >= 1 && state.loop.clearedGame,
  loop_seeker: () => state.loop.loopCount >= 3 && (state.stats.enhancedBossKillCount || 0) >= 2,
  broken_equilibrium: () => (state.stats.highDifficultyStageClearCount || 0) >= 1 && evaluateExploitTags().length >= 4
};

function getValueByPath(root, path) {
  if (!path) return undefined;
  return String(path)
    .split(".")
    .reduce((acc, key) => (acc && typeof acc === "object" ? acc[key] : undefined), root);
}

function evaluateRequirement(requirement) {
  if (!requirement) {
    return false;
  }
  if (requirement.type === "statAtLeast") {
    const value = Number(getValueByPath(state.stats, requirement.key) || 0);
    return value >= Number(requirement.value || 0);
  }
  if (requirement.type === "loopAtLeast") {
    return state.loop.loopCount >= Number(requirement.value || 0);
  }
  if (requirement.type === "titleUnlocked") {
    return state.unlockedTitles.includes(requirement.id);
  }
  return false;
}

function evaluateTitleUnlockCondition(title) {
  const checker = TITLE_CHECKERS[title.id];
  const custom = title.customCheckerId ? TITLE_CUSTOM_CHECKERS[title.customCheckerId] : null;
  const reqs = Array.isArray(title.requirements) ? title.requirements.every((req) => evaluateRequirement(req)) : true;
  const groups = Array.isArray(title.requirementGroups)
    ? title.requirementGroups.some((group) => Array.isArray(group) && group.every((req) => evaluateRequirement(req)))
    : true;
  const checkerOk = checker ? checker() : true;
  const customOk = custom ? custom() : true;
  return checkerOk && customOk && reqs && groups;
}

function checkTitleUnlocks(triggerType) {
  let unlockedAny = false;
  state.world.titles.forEach((title) => {
    if (state.unlockedTitles.includes(title.id)) {
      return;
    }
    const triggers = Array.isArray(title.trigger) ? title.trigger : [title.trigger];
    if (!triggers.includes(triggerType)) {
      return;
    }
    if (evaluateTitleUnlockCondition(title)) {
      unlockTitle(title.id);
      unlockedAny = true;
    }
  });
  if (unlockedAny) {
    recalculateTitleEffects();
    updateUnlockedBattleSpeeds();
    updateBoardThreadsFromProgress();
    updateBoardThreadsFromTitles();
  }
}

function getTitleCategory(titleId) {
  const title = getTitleById(titleId);
  return title?.category === "cheat" ? "cheat" : "normal";
}

function getTitleSlotTierValue() {
  const tier = Number(state.player.mainJobTier) || 1;
  return Math.max(1, Math.min(5, tier));
}

function getTitleTierBonusByCategory(category, tier = getTitleSlotTierValue()) {
  const rule = TITLE_SLOT_RULES[category];
  if (!rule) return 0;
  return Number(rule.tierBonusByTier?.[tier] ?? 0) || 0;
}

function getEquippedTitleIdsByCategory(category) {
  return category === "cheat" ? state.equippedCheatTitleIds : state.equippedNormalTitleIds;
}

function getCombinedEquippedTitleIds() {
  return [...new Set([...(state.equippedNormalTitleIds || []), ...(state.equippedCheatTitleIds || [])])];
}

function rebuildEquippedTitleBucketsFromActiveTitles() {
  const normal = [];
  const cheat = [];
  const source = Array.isArray(state.activeTitles) ? state.activeTitles : [];
  source.forEach((id) => {
    if (!id) return;
    if (!getTitleById(id)) return;
    if (!state.unlockedTitles.includes(id)) return;
    if (getTitleCategory(id) === "cheat") {
      if (!cheat.includes(id)) cheat.push(id);
    } else if (!normal.includes(id)) {
      normal.push(id);
    }
  });
  state.equippedNormalTitleIds = normal;
  state.equippedCheatTitleIds = cheat;
}

function syncLegacyActiveTitles() {
  state.activeTitles = getCombinedEquippedTitleIds();
}

function recalculateTitleSlotCaps() {
  const tier = getTitleSlotTierValue();
  const bossClearBonus = getBossClearTitleSlotBonus();
  const guildRankBonus = syncGuildRankTitleSlotBonus();
  const cheatShopBonus = getCheatTitleShopSlotBonus();
  state.normalTitleTierBonus = getTitleTierBonusByCategory("normal", tier);
  state.cheatTitleTierBonus = getTitleTierBonusByCategory("cheat", tier);
  state.bossClearNormalTitleSlotBonus = bossClearBonus.normal;
  state.bossClearCheatTitleSlotBonus = bossClearBonus.cheat;
  state.cheatTitleShopSlotBonus = cheatShopBonus;
  state.maxNormalTitleSlots = Math.max(
    1,
    (state.baseNormalTitleSlots || 1) +
      state.bossClearNormalTitleSlotBonus +
      state.normalTitleTierBonus +
      guildRankBonus.normal
  );
  state.maxCheatTitleSlots = Math.max(
    1,
    (state.baseCheatTitleSlots || 1) +
      state.bossClearCheatTitleSlotBonus +
      state.cheatTitleTierBonus +
      guildRankBonus.cheat +
      cheatShopBonus
  );
}

function normalizeEquippedTitleSlots(options = {}) {
  const logOnTrim = options.logOnTrim !== false;
  const removed = [];
  const normalizeByCategory = (category) => {
    const titleIds = getEquippedTitleIdsByCategory(category);
    const max = category === "cheat" ? state.maxCheatTitleSlots : state.maxNormalTitleSlots;
    const normalized = [];
    titleIds.forEach((id) => {
      if (!id || normalized.includes(id)) return;
      if (!getTitleById(id)) return;
      if (!state.unlockedTitles.includes(id)) return;
      if (getTitleCategory(id) !== category) return;
      normalized.push(id);
    });
    if (normalized.length > max) {
      removed.push(...normalized.slice(max));
    }
    if (category === "cheat") {
      state.equippedCheatTitleIds = normalized.slice(0, max);
    } else {
      state.equippedNormalTitleIds = normalized.slice(0, max);
    }
  };
  normalizeByCategory("normal");
  normalizeByCategory("cheat");
  syncLegacyActiveTitles();
  if (removed.length > 0 && logOnTrim) {
    const names = removed.map((id) => getTitleById(id)?.name || id).join(" / ");
    addLog(`称号枠上限を超えたため自動解除: ${names}`);
  }
  return removed;
}

function applyTitleSlotUnlocksFromLoop() {
  const unlocks = state.titleSlotUnlocks || {};
  const normalPlus = Math.max(0, Math.min(1, Number(unlocks.normalBasePlus || 0)));
  const cheatPlus = Math.max(0, Math.min(1, Number(unlocks.cheatBasePlus || 0)));
  const unlockedNormal = normalPlus >= 1 || state.loop.loopCount >= 1;
  const unlockedCheat = cheatPlus >= 1 || state.loop.loopCount >= 3;
  unlocks.normalBaseUnlocked = unlockedNormal;
  unlocks.cheatBaseUnlocked = unlockedCheat;
  unlocks.normalCanUpgrade = !unlockedNormal;
  unlocks.cheatCanUpgrade = !unlockedCheat;
  unlocks.normalBasePlus = unlockedNormal ? 1 : 0;
  unlocks.cheatBasePlus = unlockedCheat ? 1 : 0;
  state.titleSlotUnlocks = unlocks;
  const normalBase = TITLE_SLOT_RULES.normal.baseDefault + unlocks.normalBasePlus;
  const cheatBase = TITLE_SLOT_RULES.cheat.baseDefault + unlocks.cheatBasePlus;
  state.baseNormalTitleSlots = Math.min(TITLE_SLOT_RULES.normal.maxBaseFromPrestige, normalBase);
  state.baseCheatTitleSlots = Math.min(TITLE_SLOT_RULES.cheat.maxBaseFromPrestige, cheatBase);
}

function ensureTitleSlotState() {
  if (!Array.isArray(state.unlockedTitles)) state.unlockedTitles = [];
  if (!Array.isArray(state.activeTitles)) state.activeTitles = [];
  if (!Array.isArray(state.equippedNormalTitleIds)) state.equippedNormalTitleIds = [];
  if (!Array.isArray(state.equippedCheatTitleIds)) state.equippedCheatTitleIds = [];
  if (!state.titleSlotUnlocks || typeof state.titleSlotUnlocks !== "object") {
    state.titleSlotUnlocks = {};
  }
  if (typeof state.titleSlotUnlocks.normalBasePlus !== "number") state.titleSlotUnlocks.normalBasePlus = 0;
  if (typeof state.titleSlotUnlocks.cheatBasePlus !== "number") state.titleSlotUnlocks.cheatBasePlus = 0;
  state.clearedRegionBossSlotRewards = normalizeRegionBossSlotRewardState(state.clearedRegionBossSlotRewards);
  state.cheatTitleSlotShopPurchases = normalizeCheatTitleSlotShopState(state.cheatTitleSlotShopPurchases);
  if (typeof state.bossClearNormalTitleSlotBonus !== "number") state.bossClearNormalTitleSlotBonus = 0;
  if (typeof state.bossClearCheatTitleSlotBonus !== "number") state.bossClearCheatTitleSlotBonus = 0;
  if (typeof state.cheatTitleShopSlotBonus !== "number") state.cheatTitleShopSlotBonus = 0;
  if (typeof state.guild?.guildRankNormalTitleSlotBonus !== "number") state.guild.guildRankNormalTitleSlotBonus = 0;
  if (typeof state.guild?.guildRankCheatTitleSlotBonus !== "number") state.guild.guildRankCheatTitleSlotBonus = 0;
  if (state.activeTitles.length > 0) {
    rebuildEquippedTitleBucketsFromActiveTitles();
  } else if (state.equippedNormalTitleIds.length > 0 || state.equippedCheatTitleIds.length > 0) {
    normalizeEquippedTitleSlots({ logOnTrim: false });
    syncLegacyActiveTitles();
  }
  applyTitleSlotUnlocksFromLoop();
  recalculateTitleSlotCaps();
  normalizeEquippedTitleSlots({ logOnTrim: false });
}

function getMaxTitleSlots(category) {
  ensureTitleSlotState();
  return category === "cheat" ? state.maxCheatTitleSlots : state.maxNormalTitleSlots;
}

function canEquipTitle(titleId) {
  ensureTitleSlotState();
  const category = getTitleCategory(titleId);
  const equippedCount = (state.activeTitles || []).filter((id) => id && getTitleById(id) && state.unlockedTitles.includes(id) && getTitleCategory(id) === category).length;
  if ((state.activeTitles || []).includes(titleId)) return true;
  return equippedCount < getMaxTitleSlots(category);
}

function unlockTitle(titleId) {
  if (state.unlockedTitles.includes(titleId)) {
    return;
  }
  const title = getTitleById(titleId);
  if (!title) {
    return;
  }
  state.unlockedTitles.push(titleId);
  if (!state.loop.titleHistory.includes(titleId)) {
    state.loop.titleHistory.push(titleId);
  }
  applyLoopTitleLimitUpgrades();
  addLog(`新たな称号を獲得: ${title.name}`, "title", { important: true });
  showTitleUnlockPopup(title);
  showCenterPopup({ text: `称号獲得: ${title.name}`, type: "title" });
  autoSaveIfNeeded("titleUnlock");
}

function toggleTitle(titleId) {
  try {
    if (!state.unlockedTitles.includes(titleId)) {
      addLog("未取得称号はセットできません。");
      return;
    }
    ensureTitleSlotState();
    const title = getTitleById(titleId);
    if (!title) {
      addLog(`称号データが見つかりません: ${titleId}`);
      return;
    }
    const category = getTitleCategory(titleId);
    const idx = state.activeTitles.indexOf(titleId);
    if (idx >= 0) {
      state.activeTitles.splice(idx, 1);
      rebuildEquippedTitleBucketsFromActiveTitles();
      state.stats.titleToggleCount += 1;
      addLog(`称号OFF: ${title.name}`);
      recalculateTitleEffects();
      refreshPlayerDerivedStats();
      checkTitleUnlocks("afterToggleTitle");
      renderPreservingWindowScroll();
      return;
    }
    if (!canEquipTitle(titleId)) {
      addLog(`${category === "cheat" ? "チート" : "ノーマル"}称号枠が上限です。`);
      return;
    }
    state.activeTitles.push(titleId);
    rebuildEquippedTitleBucketsFromActiveTitles();
    state.stats.titleToggleCount += 1;
    addLog(`称号ON: ${title.name}`);
    recalculateTitleEffects();
    refreshPlayerDerivedStats();
    checkTitleUnlocks("afterToggleTitle");
    renderPreservingWindowScroll();
  } catch (error) {
    console.error("[title] toggleTitle failed", { titleId, error });
    addLog("称号切替でエラーが発生しました。リロード後に再度お試しください。");
  }
}

function getCurrentTitleLimit() {
  ensureTitleSlotState();
  return Math.max(1, (state.maxNormalTitleSlots || 0) + (state.maxCheatTitleSlots || 0));
}

function unlockTitleLimitUpgrade(sourceLabel) {
  if (state.unlockedTitleLimitUpgrades.includes(sourceLabel)) {
    return;
  }
  state.unlockedTitleLimitUpgrades.push(sourceLabel);
  state.titleLimitUpgradeLevel += 1;
  state.loop.persistentStats.maxTitleLimitReached = Math.max(state.loop.persistentStats.maxTitleLimitReached || 1, getCurrentTitleLimit());
}

function applyLoopTitleLimitUpgrades() {
  if (state.loop.loopCount >= 1) {
    for (let i = 0; i < BALANCE_CONFIG.titleLimit.loop1; i += 1) {
      unlockTitleLimitUpgrade(`loop_1_limit_${i}`);
    }
  }
  if (state.loop.loopCount >= 3) {
    for (let i = 0; i < BALANCE_CONFIG.titleLimit.loop3; i += 1) {
      unlockTitleLimitUpgrade(`loop_3_limit_${i}`);
    }
  }
  if (state.loop.loopCount >= 5) {
    for (let i = 0; i < BALANCE_CONFIG.titleLimit.loop5; i += 1) {
      unlockTitleLimitUpgrade(`loop_5_limit_${i}`);
    }
  }
  if (state.unlockedTitles.includes("third_cycle_heretic")) {
    unlockTitleLimitUpgrade("title_third_cycle_heretic");
  }
  if (state.unlockedTitles.includes("endless_adventurer")) {
    unlockTitleLimitUpgrade("title_endless_adventurer");
  }
  applyTitleSlotUnlocksFromLoop();
  recalculateTitleSlotCaps();
  normalizeEquippedTitleSlots({ logOnTrim: false });
  state.stats.maxTitleLimitUnlocked = Math.max(state.stats.maxTitleLimitUnlocked || 1, getCurrentTitleLimit());
  state.loop.persistentStats.maxTitleLimitUnlocked = Math.max(state.loop.persistentStats.maxTitleLimitUnlocked || 1, getCurrentTitleLimit());
}

function getLoopUnlocks(loopCount = state.loop.loopCount) {
  const unlocked = LOOP_FEATURE_DEFS.filter((row) => loopCount >= row.requiredLoop);
  return {
    loopCount,
    unlockedFeatureIds: unlocked.map((row) => row.id),
    unlockedFeatures: unlocked
  };
}

function isFeatureUnlocked(featureId) {
  return (state.loop.unlockedFeatures || []).includes(featureId);
}

function applyLoopUnlocks() {
  const result = getLoopUnlocks(state.loop.loopCount);
  if (!Array.isArray(state.loop.unlockedFeatures)) {
    state.loop.unlockedFeatures = [];
  }
  const before = new Set(state.loop.unlockedFeatures);
  result.unlockedFeatureIds.forEach((id) => before.add(id));
  const merged = [...before];
  const newly = merged.filter((id) => !state.loop.unlockedFeatures.includes(id));
  state.loop.unlockedFeatures = merged;
  if (newly.length > 0) {
    newly.forEach((id) => {
      const row = LOOP_FEATURE_DEFS.find((f) => f.id === id);
      addLog(`周回解放: ${row?.name || id}`);
    });
  }
  const unlockableChallenges = LOOP_CHALLENGE_DATA.filter((ch) => state.loop.loopCount >= ch.requiredLoop && state.fieldBossCleared.includes(ch.requiredFieldBossStage));
  unlockableChallenges.forEach((ch) => unlockLoopChallenge(ch.id));
  state.stats.highestLoopReached = Math.max(state.stats.highestLoopReached || 0, state.loop.loopCount);
  state.loop.persistentStats.highestLoopReached = Math.max(state.loop.persistentStats.highestLoopReached || 0, state.loop.loopCount);
  state.stats.persistentUnlockFlags = { ...(state.stats.persistentUnlockFlags || {}), ...(state.loop.persistentUnlocks || {}) };
  state.loop.persistentStats.persistentUnlockFlags = { ...(state.loop.persistentStats.persistentUnlockFlags || {}), ...(state.loop.persistentUnlocks || {}) };
  checkTrueEndEligibility();
  checkHiddenEndEligibility();
  checkChaosEndEligibility();
  unlockFinalContent();
}

function unlockLoopChallenge(challengeId) {
  if (!Array.isArray(state.loop.unlockedLoopChallengeIds)) {
    state.loop.unlockedLoopChallengeIds = [];
  }
  if (state.loop.unlockedLoopChallengeIds.includes(challengeId)) {
    return;
  }
  state.loop.unlockedLoopChallengeIds.push(challengeId);
  const challenge = LOOP_CHALLENGE_DATA.find((row) => row.id === challengeId);
  if (challenge) {
    addLog(`高難易度挑戦解放: ${challenge.name}`);
  }
}

function getNextTitleLimitCondition() {
  ensureTitleSlotState();
  const tier = getTitleSlotTierValue();
  if (!state.titleSlotUnlocks.normalBaseUnlocked) return "周回1で初期ノーマル枠+1";
  if (!state.titleSlotUnlocks.cheatBaseUnlocked) return "周回3で初期チート枠+1";
  if (tier < 2) return "Tier2でノーマル枠+1";
  if (tier < 3) return "Tier3でノーマル枠+1";
  if (tier < 4) return "Tier4でチート枠+1";
  if (tier < 5) return "Tier5でチート枠+1";
  return "称号枠は全解放済み";
}

function renderLoopUnlockSummary() {
  const unlocked = (state.loop.unlockedFeatures || [])
    .map((id) => LOOP_FEATURE_DEFS.find((row) => row.id === id)?.name || id)
    .join(" / ");
  return `
    <div class="card" style="margin-top:10px;">
      <h4>周回解放サマリー</h4>
      <p>現在ループ: <strong>${state.loop.loopCount}</strong> / 最高到達: <strong>${state.stats.highestLoopReached || 0}</strong></p>
      <p>titleLimit: <strong>${getCurrentTitleLimit()}</strong> / 次解放条件: <strong>${escapeHtml(getNextTitleLimitCondition())}</strong></p>
      <p class="tiny">解放機能: ${escapeHtml(unlocked || "なし")}</p>
    </div>
  `;
}

function renderHighDifficultyMapView() {
  const cards = LOOP_CHALLENGE_DATA.map((challenge) => {
    const unlocked = (state.loop.unlockedLoopChallengeIds || []).includes(challenge.id);
    const cleared = !!state.loop.specialChallengeClearFlags?.[challenge.id];
    const stage = STAGE_DATA[challenge.stageId];
    const boss = ENEMY_DATA[challenge.bossId];
    const canStart = unlocked && !state.battle.isActive;
    return `
      <div class="shop-card">
        <h4>${challenge.name}</h4>
        <p class="tiny">カテゴリ: ${challenge.category} / 必要周回: ${challenge.requiredLoop}</p>
        <p class="tiny">推奨Lv: ${stage?.recommendedLevel || "-"} / 対象ボス: ${boss?.name || challenge.bossId}</p>
        <p class="tiny">報酬: EXP+${challenge.rewards.exp} / GOLD+${challenge.rewards.gold} / ${ITEM_DATA[challenge.rewards.specialItemId]?.name || challenge.rewards.specialItemId}</p>
        <p class="tiny">${cleared ? "クリア済み" : unlocked ? "挑戦可能" : "未解放"}</p>
        <button class="btn loop-challenge-start-btn" data-loop-challenge-id="${challenge.id}" ${canStart ? "" : "disabled"}>挑戦する</button>
      </div>
    `;
  }).join("");
  return `<div class="card" style="margin-top:10px;"><h4>周回限定高難易度</h4><div class="shop-grid">${cards}</div></div>`;
}

function renderLoopChallengeView() {
  return `
    ${renderLoopUnlockSummary()}
    ${renderHighDifficultyMapView()}
  `;
}

function startEnhancedBossBattle(bossId) {
  const challenge = LOOP_CHALLENGE_DATA.find((row) => row.bossId === bossId && (state.loop.unlockedLoopChallengeIds || []).includes(row.id));
  if (!challenge) {
    addLog("この強化ボスは未解放です。");
    return;
  }
  state.stats.specialChallengeAttempts = (state.stats.specialChallengeAttempts || 0) + 1;
  state.currentMap = challenge.mapId;
  state.currentStage = challenge.stageId;
  state.currentStageKillCount = 0;
  state.currentStageTargetKills = 1;
  state.stats.viewSwitchCount += 1;
  addLog(`高難易度挑戦開始: ${challenge.name}`);
  startStageBattle();
}

function handleEnhancedBossVictory() {
  const challengeId = state.battle.loopChallengeId;
  const challenge = LOOP_CHALLENGE_DATA.find((row) => row.id === challengeId);
  if (!challenge) {
    return;
  }
  state.loop.loopBossKillFlags = { ...(state.loop.loopBossKillFlags || {}), [challenge.bossId]: true };
  state.loop.specialChallengeClearFlags = { ...(state.loop.specialChallengeClearFlags || {}), [challenge.id]: true };
  state.loop.loopRewardFlags = { ...(state.loop.loopRewardFlags || {}), [challenge.rewards.specialFlag]: true };
  state.loop.persistentUnlocks = { ...(state.loop.persistentUnlocks || {}), [challenge.rewards.specialFlag]: true };

  state.stats.enhancedBossKillCount = (state.stats.enhancedBossKillCount || 0) + 1;
  state.stats.highDifficultyStageClearCount = (state.stats.highDifficultyStageClearCount || 0) + 1;
  state.stats.loopChallengeClearCount = (state.stats.loopChallengeClearCount || 0) + 1;
  state.stats.specialChallengeWins = (state.stats.specialChallengeWins || 0) + 1;
  state.stats.totalLoopBossKillsLifetime = (state.stats.totalLoopBossKillsLifetime || 0) + 1;
  state.loop.persistentStats.totalLoopBossKillsLifetime = (state.loop.persistentStats.totalLoopBossKillsLifetime || 0) + 1;

  state.player.exp += challenge.rewards.exp;
  state.player.gold += challenge.rewards.gold;
  state.stats.totalGoldEarned += challenge.rewards.gold;
  addItem(challenge.rewards.specialItemId, 1);
  addLog(`高難易度クリア: ${challenge.name} / EXP+${challenge.rewards.exp}, GOLD+${challenge.rewards.gold}, ${ITEM_DATA[challenge.rewards.specialItemId]?.name || challenge.rewards.specialItemId} x1`);
  showBattleSpecialPopup(`挑戦達成: ${challenge.name}`);
  if (state.loop.loopCount >= 4 && challenge.id === "inferno_return") {
    state.loop.persistentUnlocks.endless_arc_seed = true;
    addItem("outsideRecord", 1);
    addLog("異常記録を取得: 運営外記録");
  }
  const fallbackStage = getFirstSelectableStage(challenge.mapId) || state.currentStage;
  if (fallbackStage && STAGE_DATA[fallbackStage]) {
    state.currentStage = fallbackStage;
    state.currentStageKillCount = getStageProgress(fallbackStage).kills;
    state.currentStageTargetKills = getStageProgress(fallbackStage).target;
  }
  checkLoopOnlyTitles("afterEnhancedBossClear");
}

function checkLoopOnlyTitles(triggerType = "afterLoopProgress") {
  checkTitleUnlocks(triggerType);
  state.stats.loopOnlyTitleCount = state.unlockedTitles.filter((id) => PHASE12_LOOP_TITLES.some((t) => t.id === id)).length;
}

function getEndingRouteProgress() {
  const trueChecks = [
    { id: "unique7", ok: (state.uniqueDefeatedIds || []).length >= 7 },
    { id: "god_slayer", ok: state.unlockedTitles.includes("god_slayer") },
    { id: "loop2", ok: state.loop.loopCount >= 2 },
    { id: "enhanced2", ok: (state.stats.enhancedBossKillCount || 0) >= 2 },
    { id: "endgame_titles", ok: ["time_lord", "infinite_seeker", "anti_first_trap", "god_slayer"].filter((id) => state.unlockedTitles.includes(id)).length >= 2 },
    { id: "title_limit", ok: getCurrentTitleLimit() >= 3 },
    { id: "time_upper", ok: state.unlockedTitles.includes("time_keeper_3") || state.unlockedTitles.includes("time_lord") }
  ];
  const hiddenChecks = [
    { id: "unexpected", ok: state.unlockedTitles.includes("dev_unexpected") || state.unlockedTitles.includes("unexpected_architect") },
    { id: "high_diff", ok: (state.stats.highDifficultyStageClearCount || 0) >= 1 },
    { id: "odd_titles", ok: ["production_is_main", "unfavored_king", "one_man_army"].filter((id) => state.unlockedTitles.includes(id)).length >= 2 },
    { id: "exploit_tags", ok: evaluateExploitTags().length >= 4 },
    { id: "loop3", ok: state.loop.loopCount >= 3 },
    { id: "timer_extreme", ok: state.unlockedTitles.includes("time_lord") }
  ];
  const chaosChecks = [
    { id: "unexpected", ok: state.unlockedTitles.includes("dev_unexpected") },
    { id: "broken_eq", ok: state.unlockedTitles.includes("broken_equilibrium") },
    { id: "loop4", ok: state.loop.loopCount >= 4 },
    { id: "high_diff3", ok: (state.stats.loopChallengeClearCount || 0) >= 3 },
    { id: "anomaly_trial", ok: isFeatureUnlocked("anomaly_trials") },
    { id: "outside_record", ok: getInventoryCount("outsideRecord") >= 1 || !!state.loop.persistentUnlocks.endless_arc_seed }
  ];
  const count = (rows) => rows.reduce((acc, row) => acc + (row.ok ? 1 : 0), 0);
  return {
    true: { checks: trueChecks, current: count(trueChecks), total: trueChecks.length },
    hidden: { checks: hiddenChecks, current: count(hiddenChecks), total: hiddenChecks.length },
    chaos: { checks: chaosChecks, current: count(chaosChecks), total: chaosChecks.length }
  };
}

function checkTrueEndEligibility() {
  const progress = getEndingRouteProgress().true;
  state.stats.trueRouteProgress = progress.current;
  const eligible = progress.current >= progress.total;
  state.trueEndEligible = eligible;
  state.endingProgressFlags.true_route_ready = eligible;
  return eligible;
}

function checkHiddenEndEligibility() {
  const progress = getEndingRouteProgress().hidden;
  state.stats.hiddenRouteProgress = progress.current;
  const eligible = progress.current >= progress.total;
  state.hiddenEndEligible = eligible;
  state.endingProgressFlags.hidden_route_ready = eligible;
  return eligible;
}

function checkChaosEndEligibility() {
  const progress = getEndingRouteProgress().chaos;
  state.stats.chaosRouteProgress = progress.current;
  const eligible = progress.current >= progress.total;
  state.chaosEndEligible = eligible;
  state.endingProgressFlags.chaos_route_ready = eligible;
  return eligible;
}

function triggerWorldAnomalyEffects() {
  const score =
    (state.trueEndEligible ? 1 : 0) +
    (state.hiddenEndEligible ? 1 : 0) +
    (state.chaosEndEligible ? 2 : 0) +
    ((state.stats.highDifficultyStageClearCount || 0) >= 2 ? 1 : 0);
  const nextLevel = clamp(0, 5, score);
  const prev = state.stats.worldAnomalyLevel || 0;
  state.stats.worldAnomalyLevel = nextLevel;
  state.worldStateFlags.anomalyLevel = nextLevel;
  state.loop.persistentStats.worldAnomalyLevel = Math.max(state.loop.persistentStats.worldAnomalyLevel || 0, nextLevel);
  if (nextLevel > prev) {
    addLog(`世界異変レベル上昇: ${prev} -> ${nextLevel}`);
    autoSaveIfNeeded("endingProgress");
  }
}

function unlockFinalContent() {
  const unlocked = {};
  FINAL_CONTENT_DATA.forEach((content) => {
    const req = content.required || {};
    const ok =
      (req.trueEndEligible ? state.trueEndEligible : true) &&
      (req.hiddenEndEligible ? state.hiddenEndEligible : true) &&
      (req.chaosEndEligible ? state.chaosEndEligible : true) &&
      (req.loopAtLeast ? state.loop.loopCount >= req.loopAtLeast : true);
    if (ok) {
      unlocked[content.id] = true;
    }
  });
  const before = Object.keys(state.finalBossFlags || {}).length;
  state.finalBossFlags = { ...(state.finalBossFlags || {}), ...unlocked };
  state.finalContentUnlocked = Object.keys(state.finalBossFlags).length > 0;
  state.endingProgressFlags.final_content_unlocked = state.finalContentUnlocked;
  if (state.finalContentUnlocked && before === 0) {
    addLog("最終解放コンテンツが出現した。");
    showBattleSpecialPopup("最終解放: 新領域開放");
    autoSaveIfNeeded("endingProgress");
  }
}

function renderEndingProgressView() {
  const progress = getEndingRouteProgress();
  state.stats.endingHintSeenFlags = {
    ...(state.stats.endingHintSeenFlags || {}),
    trueRoute: progress.true.current > 0,
    hiddenRoute: progress.hidden.current > 0,
    chaosRoute: progress.chaos.current > 0
  };
  return `
    <div class="card" style="margin-top:10px;">
      <h4>エンディング進捗</h4>
      <p>真エンド条件: <strong>${progress.true.current} / ${progress.true.total}</strong> ${state.trueEndEligible ? "(到達可能)" : "(未達)"}</p>
      <p>裏エンド条件: <strong>${progress.hidden.current} / ${progress.hidden.total}</strong> ${state.hiddenEndEligible ? "(到達可能)" : "(未達)"}</p>
      <p>混沌エンド条件: <strong>${progress.chaos.current} / ${progress.chaos.total}</strong> ${state.chaosEndEligible ? "(到達可能)" : "(未達)"}</p>
      <p class="tiny">ヒント: ${escapeHtml(getEndingHintText())}</p>
    </div>
  `;
}

function getEndingHintText() {
  if (!state.trueEndEligible) {
    return "神話級の討伐と上位称号の収集が足りない。";
  }
  if (!state.hiddenEndEligible) {
    return "想定外ビルドの痕跡がまだ薄い。";
  }
  if (!state.chaosEndEligible) {
    return "時間と異常の先に、まだ見えていない道がある。";
  }
  return "最終領域が開く。記録の最奥へ。";
}

function renderFinalContentView() {
  if (!state.finalContentUnlocked) {
    return "";
  }
  const cards = FINAL_CONTENT_DATA.map((content) => {
    const unlocked = !!state.finalBossFlags?.[content.id];
    const cleared = !!state.stats.finalContentClearFlags?.[content.id];
    const boss = FINAL_BOSS_DATA.find((row) => row.id === content.bossId);
    return `
      <div class="shop-card">
        <h4>${content.name}</h4>
        <p class="tiny">関連エンド: ${content.endingType}</p>
        <p class="tiny">最終ボス: ${boss?.name || content.bossId}</p>
        <p class="tiny">状態: ${cleared ? "踏破済み" : unlocked ? "挑戦可能" : "条件未達"}</p>
        <button class="btn final-boss-start-btn" data-final-boss-id="${content.bossId}" ${unlocked && !state.battle.isActive ? "" : "disabled"}>挑戦する</button>
      </div>
    `;
  }).join("");
  return `<div class="card" style="margin-top:10px;"><h4>最終解放コンテンツ</h4><div class="shop-grid">${cards}</div></div>`;
}

function startFinalBossBattle(finalBossId) {
  const content = FINAL_CONTENT_DATA.find((row) => row.bossId === finalBossId);
  if (!content || !state.finalBossFlags?.[content.id]) {
    addLog("この最終ボスはまだ解放されていません。");
    return;
  }
  state.currentMap = "final";
  state.currentStage = content.stageId;
  state.currentStageKillCount = 0;
  state.currentStageTargetKills = 1;
  state.stats.finalBossAttemptCounts[finalBossId] = (state.stats.finalBossAttemptCounts[finalBossId] || 0) + 1;
  addLog(`最終解放ボス戦開始: ${FINAL_BOSS_DATA.find((b) => b.id === finalBossId)?.name || finalBossId}`);
  startStageBattle();
}

function handleFinalBossVictory() {
  const stage = STAGE_DATA[state.battle.stageId];
  if (!stage?.finalContentId || !stage.finalBossId) {
    return;
  }
  const contentId = stage.finalContentId;
  const bossId = stage.finalBossId;
  state.stats.finalBossClearCounts[bossId] = (state.stats.finalBossClearCounts[bossId] || 0) + 1;
  state.stats.finalContentClearFlags = { ...(state.stats.finalContentClearFlags || {}), [contentId]: true };
  state.loop.persistentUnlocks[`final_${contentId}_clear`] = true;

  const boss = FINAL_BOSS_DATA.find((row) => row.id === bossId);
  (boss?.clearRewardFlags || []).forEach((flag) => {
    state.endingProgressFlags[flag] = true;
    state.loop.persistentUnlocks[flag] = true;
  });

  const endingType = determineEndingType();
  if (endingType && !state.unlockedEndings.includes(endingType)) {
    state.unlockedEndings.push(endingType);
    addLog(`新エンディング解放: ${endingType}`);
  }
  state.loop.persistentStats.unlockedEndings = [...new Set([...(state.loop.persistentStats.unlockedEndings || []), ...state.unlockedEndings])];
  state.currentMap = TOWN_DATA[state.currentTown]?.mapId || "grassland";
  const fallbackStage = getFirstSelectableStage(state.currentMap) || state.currentStage;
  if (fallbackStage && STAGE_DATA[fallbackStage]) {
    state.currentStage = fallbackStage;
    state.currentStageKillCount = getStageProgress(fallbackStage).kills;
    state.currentStageTargetKills = getStageProgress(fallbackStage).target;
  }
  addLog(`最終解放コンテンツ踏破: ${contentId}`);
  showBattleSpecialPopup(`エンド分岐進行: ${endingType || "unfinished_end"}`);
}

function determineEndingType() {
  checkTrueEndEligibility();
  checkHiddenEndEligibility();
  checkChaosEndEligibility();
  const clearCount = Object.keys(state.stats.finalContentClearFlags || {}).filter((id) => state.stats.finalContentClearFlags[id]).length;
  if (state.chaosEndEligible && clearCount >= 2) return "chaos_end";
  if (state.hiddenEndEligible && state.trueEndEligible && clearCount >= 2) return "broken_world_end";
  if (state.hiddenEndEligible && clearCount >= 1) return "hidden_end";
  if (state.trueEndEligible && clearCount >= 1) return "true_end";
  if (state.loop.clearedGame) return "normal_end";
  return "unfinished_end";
}

function updateBoardThreadsFromEndingProgress() {
  checkTrueEndEligibility();
  checkHiddenEndEligibility();
  checkChaosEndEligibility();
  triggerWorldAnomalyEffects();
  unlockFinalContent();
  state.stats.endingEligibilityFlags = {
    trueEnd: state.trueEndEligible,
    hiddenEnd: state.hiddenEndEligible,
    chaosEnd: state.chaosEndEligible,
    finalContentUnlocked: state.finalContentUnlocked
  };
  if (state.trueEndEligible) {
    state.worldStateFlags.board_true_route = true;
  }
  if (state.hiddenEndEligible) {
    state.worldStateFlags.board_hidden_route = true;
  }
  if (state.chaosEndEligible) {
    state.worldStateFlags.board_chaos_route = true;
  }
}

function recalculateTitleEffects() {
  ensureTitleSlotState();
  const next = createDefaultTitleEffects();
  const equippedTitles = getCombinedEquippedTitleIds();
  equippedTitles.forEach((titleId) => {
    const title = getTitleById(titleId);
    if (!title?.effect) {
      return;
    }
    mergeTitleEffect(next, title.effect);
  });
  if (state.unlockedTitles.includes("nameless_wanderer") && equippedTitles.length === 0) {
    next.conditionalBonusNoTitle = { allStatsFlat: 1 };
  }
  if (equippedTitles.length === 0) {
    next.conditionalBuffByNoTitle = { allStatsMultiplier: 0.03 };
  }
  if (state.unlockedTitles.includes("first_death") && Date.now() < state.titleRuntime.reviveAttackBuffUntil) {
    next.attackMultiplier += 0.1;
  }
  state.titleEffects = next;
}

function mergeTitleEffect(target, effect) {
  if (typeof effect.allStatsFlat === "number") {
    target.allStatsFlat += effect.allStatsFlat;
  }
  if (typeof effect.allStatsMultiplier === "number") {
    target.allStatsMultiplier += effect.allStatsMultiplier;
  }
  if (typeof effect.attackMultiplier === "number") {
    target.attackMultiplier += effect.attackMultiplier;
  }
  if (typeof effect.defenseMultiplier === "number") {
    target.defenseMultiplier += effect.defenseMultiplier;
  }
  if (typeof effect.goldMultiplier === "number") {
    target.goldMultiplier += effect.goldMultiplier;
  }
  if (typeof effect.expMultiplier === "number") {
    target.expMultiplier += effect.expMultiplier;
  }
  if (typeof effect.damageToBoss === "number") {
    target.damageToBoss += effect.damageToBoss;
  }
  if (typeof effect.damageToUnique === "number") {
    target.damageToUnique += effect.damageToUnique;
  }
  if (typeof effect.uniqueDamageBonus === "number") {
    target.uniqueDamageBonus += effect.uniqueDamageBonus;
  }
  if (typeof effect.uniqueEncounterRateBonus === "number") {
    target.uniqueEncounterRateBonus += effect.uniqueEncounterRateBonus;
  }
  if (typeof effect.critRateBonus === "number") {
    target.critRateBonus += effect.critRateBonus;
  }
  if (typeof effect.speedMultiplier === "number") {
    target.speedMultiplier += effect.speedMultiplier;
  }
  if (typeof effect.sellPriceMultiplier === "number") {
    target.sellPriceMultiplier += effect.sellPriceMultiplier;
  }
  if (typeof effect.productionExpRateBonus === "number") {
    target.productionExpRateBonus += effect.productionExpRateBonus;
  }
  if (typeof effect.qualityMaterialRefundChance === "number") {
    target.qualityMaterialRefundChance += effect.qualityMaterialRefundChance;
  }
  if (typeof effect.accuracyBonus === "number") {
    target.accuracyBonus += effect.accuracyBonus;
  }
  if (typeof effect.critDamageBonus === "number") {
    target.critDamageBonus += effect.critDamageBonus;
  }
  if (typeof effect.skillCooldownRecovery === "number") {
    target.skillCooldownRecovery += effect.skillCooldownRecovery;
  }
  if (typeof effect.skillPowerIfSkillSlotOpen === "number") {
    target.skillPowerIfSkillSlotOpen += effect.skillPowerIfSkillSlotOpen;
  }
  if (typeof effect.skillDamageMultiplier === "number") {
    target.skillDamageMultiplier += effect.skillDamageMultiplier;
  }
  if (typeof effect.swordsmanSkillDamageMultiplier === "number") {
    target.swordsmanSkillDamageMultiplier += effect.swordsmanSkillDamageMultiplier;
  }
  if (typeof effect.mageSkillDamageMultiplier === "number") {
    target.mageSkillDamageMultiplier += effect.mageSkillDamageMultiplier;
  }
  if (typeof effect.priestNonHealSkillDamageMultiplier === "number") {
    target.priestNonHealSkillDamageMultiplier += effect.priestNonHealSkillDamageMultiplier;
  }
  if (typeof effect.priestOffensiveSkillDamageMultiplier === "number") {
    target.priestOffensiveSkillDamageMultiplier += effect.priestOffensiveSkillDamageMultiplier;
  }
  if (typeof effect.priestOverhealExtraDefenseStackSerious === "boolean") {
    target.priestOverhealExtraDefenseStackSerious = target.priestOverhealExtraDefenseStackSerious || effect.priestOverhealExtraDefenseStackSerious;
  }
  if (typeof effect.priestOverhealExtraDefenseStackTooSerious === "boolean") {
    target.priestOverhealExtraDefenseStackTooSerious = target.priestOverhealExtraDefenseStackTooSerious || effect.priestOverhealExtraDefenseStackTooSerious;
  }
  if (typeof effect.priestDamageHalfChance === "number") {
    target.priestDamageHalfChance += effect.priestDamageHalfChance;
  }
  if (typeof effect.priestHealDoubleChance === "number") {
    target.priestHealDoubleChance += effect.priestHealDoubleChance;
  }
  if (typeof effect.swordsmanLifestealChance === "number") {
    target.swordsmanLifestealChance += effect.swordsmanLifestealChance;
  }
  if (typeof effect.swordsmanLifestealRatio === "number") {
    target.swordsmanLifestealRatio += effect.swordsmanLifestealRatio;
  }
  if (typeof effect.swordsmanChargeChance === "number") {
    target.swordsmanChargeChance += effect.swordsmanChargeChance;
  }
  if (typeof effect.swordsmanChargeDamageMultiplier === "number") {
    target.swordsmanChargeDamageMultiplier = Math.max(target.swordsmanChargeDamageMultiplier || 1, effect.swordsmanChargeDamageMultiplier);
  }
  if (typeof effect.swordsmanFlashEvasionOnHit === "boolean") {
    target.swordsmanFlashEvasionOnHit = target.swordsmanFlashEvasionOnHit || effect.swordsmanFlashEvasionOnHit;
  }
  if (typeof effect.swordsmanReflectReadyChance === "number") {
    target.swordsmanReflectReadyChance += effect.swordsmanReflectReadyChance;
  }
  if (typeof effect.swordsmanReflectRate === "number") {
    target.swordsmanReflectRate += effect.swordsmanReflectRate;
  }
  if (typeof effect.mageSingleSkillDamageBonus === "number") {
    target.mageSingleSkillDamageBonus += effect.mageSingleSkillDamageBonus;
  }
  if (typeof effect.mageFourSkillDamageBonus === "number") {
    target.mageFourSkillDamageBonus += effect.mageFourSkillDamageBonus;
  }
  if (typeof effect.mageBuffSkillAmplify === "number") {
    target.mageBuffSkillAmplify += effect.mageBuffSkillAmplify;
  }
  if (typeof effect.mageSacrificeAttackMultiplier === "number") {
    target.mageSacrificeAttackMultiplier = Math.max(target.mageSacrificeAttackMultiplier || 1, effect.mageSacrificeAttackMultiplier);
  }
  if (typeof effect.mageSacrificeSelfHpRate === "number") {
    target.mageSacrificeSelfHpRate += effect.mageSacrificeSelfHpRate;
  }
  if (typeof effect.comboDoubleStrikeChance === "number") {
    target.comboDoubleStrikeChance += effect.comboDoubleStrikeChance;
  }
  if (effect.comboBattleStartRandomBuff) {
    target.comboBattleStartRandomBuff = effect.comboBattleStartRandomBuff;
  }
  if (typeof effect.comboBattleStartRandomBuffCount === "number") {
    target.comboBattleStartRandomBuffCount += effect.comboBattleStartRandomBuffCount;
  }
  if (typeof effect.comboReflectReadyChance === "number") {
    target.comboReflectReadyChance += effect.comboReflectReadyChance;
  }
  if (typeof effect.comboReflectRate === "number") {
    target.comboReflectRate += effect.comboReflectRate;
  }
  if (typeof effect.comboBattleStartInvincibleMs === "number") {
    target.comboBattleStartInvincibleMs = Math.max(target.comboBattleStartInvincibleMs || 0, effect.comboBattleStartInvincibleMs);
  }
  if (typeof effect.comboDebuffSkillAmplify === "number") {
    target.comboDebuffSkillAmplify += effect.comboDebuffSkillAmplify;
  }
  if (typeof effect.comboBuffSkillAmplify === "number") {
    target.comboBuffSkillAmplify += effect.comboBuffSkillAmplify;
  }
  if (typeof effect.comboEvasionHealScaling === "number") {
    target.comboEvasionHealScaling += effect.comboEvasionHealScaling;
  }
  if (typeof effect.skillCooldownRecoveryIfSkillSlotOpen === "number") {
    target.skillCooldownRecoveryIfSkillSlotOpen += effect.skillCooldownRecoveryIfSkillSlotOpen;
  }
  if (typeof effect.overhealConversionBonus === "number") {
    target.overhealConversionBonus += effect.overhealConversionBonus;
  }
  if (typeof effect.overhealActiveDefenseMultiplier === "number") {
    target.overhealActiveDefenseMultiplier += effect.overhealActiveDefenseMultiplier;
  }
  if (typeof effect.weaponEnhanceAttackPerLevel === "number") {
    target.weaponEnhanceAttackPerLevel += effect.weaponEnhanceAttackPerLevel;
  }
  if (typeof effect.weaponEnhanceAttackMax === "number") {
    target.weaponEnhanceAttackMax = Math.max(target.weaponEnhanceAttackMax || 0, effect.weaponEnhanceAttackMax);
  }
  if (typeof effect.armorEnhanceDefensePerLevel === "number") {
    target.armorEnhanceDefensePerLevel += effect.armorEnhanceDefensePerLevel;
  }
  if (typeof effect.armorEnhanceDefenseMax === "number") {
    target.armorEnhanceDefenseMax = Math.max(target.armorEnhanceDefenseMax || 0, effect.armorEnhanceDefenseMax);
  }
  if (typeof effect.equipmentQualityEffectBonus === "number") {
    target.equipmentQualityEffectBonus += effect.equipmentQualityEffectBonus;
  }
  if (typeof effect.perNormalEquippedAttackDefenseBonus === "number") {
    target.perNormalEquippedAttackDefenseBonus += effect.perNormalEquippedAttackDefenseBonus;
  }
  if (typeof effect.perNormalEquippedAttackDefenseBonusCap === "number") {
    target.perNormalEquippedAttackDefenseBonusCap = Math.max(target.perNormalEquippedAttackDefenseBonusCap || 0, effect.perNormalEquippedAttackDefenseBonusCap);
  }
  if (typeof effect.perEquippedAttackDefenseBonus === "number") {
    target.perEquippedAttackDefenseBonus += effect.perEquippedAttackDefenseBonus;
  }
  if (typeof effect.perEquippedAttackDefenseBonusCap === "number") {
    target.perEquippedAttackDefenseBonusCap = Math.max(target.perEquippedAttackDefenseBonusCap || 0, effect.perEquippedAttackDefenseBonusCap);
  }
  if (effect.noReturnCombatBonus) {
    target.noReturnCombatBonus = {
      attackMultiplier: (target.noReturnCombatBonus?.attackMultiplier || 0) + (effect.noReturnCombatBonus.attackMultiplier || 0),
      damageReduction: (target.noReturnCombatBonus?.damageReduction || 0) + (effect.noReturnCombatBonus.damageReduction || 0),
      stageRegenPerMinute: (target.noReturnCombatBonus?.stageRegenPerMinute || 0) + (effect.noReturnCombatBonus.stageRegenPerMinute || 0)
    };
  }
  if (typeof effect.burnConditionalAttackMultiplier === "number") {
    target.burnConditionalAttackMultiplier += effect.burnConditionalAttackMultiplier;
  }
  if (typeof effect.ignoreBurnAttackPenalty === "boolean") {
    target.ignoreBurnAttackPenalty = target.ignoreBurnAttackPenalty || effect.ignoreBurnAttackPenalty;
  }
  if (effect.lowHpConditionalCombat) {
    target.lowHpConditionalCombat = {
      hpThreshold: Math.max(target.lowHpConditionalCombat?.hpThreshold || 0, effect.lowHpConditionalCombat.hpThreshold || 0),
      attackMultiplier: (target.lowHpConditionalCombat?.attackMultiplier || 0) + (effect.lowHpConditionalCombat.attackMultiplier || 0),
      damageReduction: (target.lowHpConditionalCombat?.damageReduction || 0) + (effect.lowHpConditionalCombat.damageReduction || 0)
    };
  }
  if (effect.ninjaLowEvasionConditional) {
    target.ninjaLowEvasionConditional = {
      threshold: Math.max(target.ninjaLowEvasionConditional?.threshold || 0, effect.ninjaLowEvasionConditional.threshold || 0),
      attackMultiplier: (target.ninjaLowEvasionConditional?.attackMultiplier || 0) + (effect.ninjaLowEvasionConditional.attackMultiplier || 0),
      damageReduction: (target.ninjaLowEvasionConditional?.damageReduction || 0) + (effect.ninjaLowEvasionConditional.damageReduction || 0)
    };
  }
  if (effect.statusResistByType) {
    Object.entries(effect.statusResistByType).forEach(([key, bonus]) => {
      target.statusResistByType[key] = (target.statusResistByType[key] || 0) + bonus;
    });
  }
  if (effect.regionDamageBonus) {
    Object.entries(effect.regionDamageBonus).forEach(([key, bonus]) => {
      target.regionDamageBonus[key] = (target.regionDamageBonus[key] || 0) + bonus;
    });
  }
  if (effect.regionDamageReduction) {
    Object.entries(effect.regionDamageReduction).forEach(([key, bonus]) => {
      target.regionDamageReduction[key] = (target.regionDamageReduction[key] || 0) + bonus;
    });
  }
  if (effect.regionAccuracyBonus) {
    Object.entries(effect.regionAccuracyBonus).forEach(([key, bonus]) => {
      target.regionAccuracyBonus[key] = (target.regionAccuracyBonus[key] || 0) + bonus;
    });
  }
  if (effect.regionStageRegenPerMinute) {
    Object.entries(effect.regionStageRegenPerMinute).forEach(([key, bonus]) => {
      target.regionStageRegenPerMinute[key] = (target.regionStageRegenPerMinute[key] || 0) + bonus;
    });
  }
  if (effect.regionStatMultiplier) {
    Object.entries(effect.regionStatMultiplier).forEach(([region, stats]) => {
      if (!target.regionStatMultiplier[region]) {
        target.regionStatMultiplier[region] = {};
      }
      Object.entries(stats || {}).forEach(([stat, mul]) => {
        const prev = target.regionStatMultiplier[region][stat] || 1;
        target.regionStatMultiplier[region][stat] = prev * mul;
      });
    });
  }
  if (effect.weightConditionalBonuses) {
    target.weightConditionalBonuses = { ...(target.weightConditionalBonuses || {}), ...(effect.weightConditionalBonuses || {}) };
  }
  if (typeof effect.firstBattleDamageReduction === "number") {
    target.firstBattleDamageReduction += effect.firstBattleDamageReduction;
  }
  if (typeof effect.lowHpDefenseMultiplier === "number") {
    target.lowHpDefenseMultiplier += effect.lowHpDefenseMultiplier;
  }
  if (typeof effect.lowHpDamageReduction === "number") {
    target.lowHpDamageReduction += effect.lowHpDamageReduction;
  }
  if (typeof effect.gatherMultiplier === "number") {
    target.gatherMultiplier += effect.gatherMultiplier;
  }
  if (typeof effect.guildPointMultiplier === "number") {
    target.guildPointMultiplier += effect.guildPointMultiplier;
  }
  if (typeof effect.enhanceCostReduction === "number") {
    target.enhanceCostReduction += effect.enhanceCostReduction;
  }
  if (typeof effect.cookedSellMultiplier === "number") {
    target.cookedSellMultiplier += effect.cookedSellMultiplier;
  }
  if (typeof effect.mpCostReduction === "number") {
    target.mpCostReduction += effect.mpCostReduction;
  }
  if (typeof effect.healMultiplier === "number") {
    target.healMultiplier += effect.healMultiplier;
  }
  if (typeof effect.defenseToAttackRatio === "number") {
    target.defenseToAttackRatio += effect.defenseToAttackRatio;
  }
  if (typeof effect.noWeaponAttackBonus === "number") {
    target.noWeaponAttackBonus += effect.noWeaponAttackBonus;
  }
  if (typeof effect.stageRegenPerMinute === "number") {
    target.stageRegenPerMinute += effect.stageRegenPerMinute;
  }
  if (typeof effect.cookGreatSuccessRateBonus === "number") {
    target.cookGreatSuccessRateBonus += effect.cookGreatSuccessRateBonus;
  }
  if (effect.damageToSpecies) {
    Object.entries(effect.damageToSpecies).forEach(([species, bonus]) => {
      target.damageToSpecies[species] = (target.damageToSpecies[species] || 0) + bonus;
    });
  }
  if (effect.evadeByRegion) {
    Object.entries(effect.evadeByRegion).forEach(([region, bonus]) => {
      target.evadeByRegion[region] = (target.evadeByRegion[region] || 0) + bonus;
    });
  }
  if (effect.battleStartBuff) {
    target.battleStartBuff = effect.battleStartBuff;
  }
  if (effect.conditionalBonusNoTitle) {
    target.conditionalBonusNoTitle = effect.conditionalBonusNoTitle;
  }
  if (effect.unlockBattleSpeed) {
    target.unlockBattleSpeed = target.unlockBattleSpeed.concat(effect.unlockBattleSpeed);
  }
  if (effect.speedModeBonus) {
    if (!target.speedModeBonus) {
      target.speedModeBonus = { ...effect.speedModeBonus };
    } else {
      target.speedModeBonus = {
        minSpeed: Math.min(target.speedModeBonus.minSpeed || 1, effect.speedModeBonus.minSpeed || 1),
        expMultiplier: Math.max(target.speedModeBonus.expMultiplier || 0, effect.speedModeBonus.expMultiplier || 0)
      };
    }
  }
  if (typeof effect.craftSuccessBonus === "number") {
    target.craftSuccessBonus += effect.craftSuccessBonus;
  }
  if (typeof effect.enhanceSuccessBonus === "number") {
    target.enhanceSuccessBonus += effect.enhanceSuccessBonus;
  }
  if (typeof effect.bossDamageBonus === "number") {
    target.bossDamageBonus += effect.bossDamageBonus;
  }
  if (effect.reviveBuff) {
    target.reviveBuff = effect.reviveBuff;
  }
  if (typeof effect.noSubJobBonus === "number") {
    target.noSubJobBonus += effect.noSubJobBonus;
  }
  if (typeof effect.lowTierJobBonus === "number") {
    target.lowTierJobBonus += effect.lowTierJobBonus;
  }
  if (typeof effect.craftedGearBonus === "number") {
    target.craftedGearBonus += effect.craftedGearBonus;
  }
  if (typeof effect.overweightBonus === "number") {
    target.overweightBonus += effect.overweightBonus;
  }
  if (typeof effect.titleLimitBonus === "number") {
    target.titleLimitBonus += effect.titleLimitBonus;
  }
  if (typeof effect.weightPenaltyReduction === "number") {
    target.weightPenaltyReduction += effect.weightPenaltyReduction;
  }
  if (typeof effect.ignoreWeightPenalty === "boolean") {
    target.ignoreWeightPenalty = target.ignoreWeightPenalty || effect.ignoreWeightPenalty;
  }
  if (typeof effect.slotFillAttackDefenseBonus === "number") {
    target.slotFillAttackDefenseBonus += effect.slotFillAttackDefenseBonus;
  }
  if (typeof effect.potionCraftBonusChance === "number") {
    target.potionCraftBonusChance += effect.potionCraftBonusChance;
  }
  if (typeof effect.extraCraftChance === "number") {
    target.extraCraftChance += effect.extraCraftChance;
  }
  if (typeof effect.workshopCostReduction === "number") {
    target.workshopCostReduction += effect.workshopCostReduction;
  }
  if (typeof effect.qualityStepUpChance === "number") {
    target.qualityStepUpChance += effect.qualityStepUpChance;
  }
  if (typeof effect.smithEnhanceBonus === "number") {
    target.smithEnhanceBonus += effect.smithEnhanceBonus;
  }
  if (typeof effect.alchemyEffectBonus === "number") {
    target.alchemyEffectBonus += effect.alchemyEffectBonus;
  }
  if (typeof effect.cookingDurationBonus === "number") {
    target.cookingDurationBonus += effect.cookingDurationBonus;
  }
  if (effect.conditionalBuffByLoop) {
    target.conditionalBuffByLoop = effect.conditionalBuffByLoop;
  }
  if (effect.conditionalBuffByNoTitle) {
    target.conditionalBuffByNoTitle = effect.conditionalBuffByNoTitle;
  }
  if (effect.randomBattleStartBuff) {
    target.randomBattleStartBuff = effect.randomBattleStartBuff;
  }
  if (typeof effect.statusAilmentResist === "number") {
    target.statusAilmentResist += effect.statusAilmentResist;
  }
}

function getEquipmentById(itemId) {
  return EQUIPMENT_DATA[itemId] || null;
}

function getEquippedItem(slotId) {
  const itemId = state.player.equipmentSlots?.[slotId];
  return itemId ? getEquipmentById(itemId) : null;
}

function getEnhanceLevel(itemId) {
  const fromPlayer = state.player.equipmentEnhancements[itemId];
  if (typeof fromPlayer === "number") {
    return fromPlayer;
  }
  return Number(EQUIPMENT_DATA[itemId]?.enhanceLevel || 0);
}

function getEnhanceMaxLevel(itemId) {
  const eq = EQUIPMENT_DATA[itemId];
  if (!eq) {
    return Number.POSITIVE_INFINITY;
  }
  if (["weapon", "armor", "accessory"].includes(eq.category)) {
    return Math.max(1, Math.floor(state.player.level || 1));
  }
  return Number.POSITIVE_INFINITY;
}

function isEnhanceCapReached(itemId) {
  return getEnhanceLevel(itemId) >= getEnhanceMaxLevel(itemId);
}

function syncEquipmentEnhancementCache() {
  Object.keys(EQUIPMENT_DATA).forEach((itemId) => {
    EQUIPMENT_DATA[itemId].enhanceLevel = getEnhanceLevel(itemId);
  });
}

function getEquipmentBaseStats(itemId) {
  const eq = EQUIPMENT_DATA[itemId];
  if (!eq) {
    return null;
  }
  return {
    attack: eq.attack || 0,
    defense: eq.defense || 0,
    speed: eq.speed || 0,
    intelligence: eq.intelligence || 0,
    luck: eq.luck || 0,
    hp: eq.hp || 0,
    mp: eq.mp || 0,
    weight: eq.weight || 0
  };
}

function getEquipmentQualityMultiplier(quality) {
  if (quality === "great") return 1.08;
  if (quality === "high") return 1.18;
  if (quality === "god") return 1.35;
  return 1;
}

function applyQualityBonus(baseStats, quality) {
  const baseMul = getEquipmentQualityMultiplier(quality);
  const qualityEffectBonus = Math.max(0, state.titleEffects?.equipmentQualityEffectBonus || 0);
  const mul = 1 + (baseMul - 1) * (1 + qualityEffectBonus);
  if (mul <= 1) {
    return {
      bonus: { attack: 0, defense: 0, speed: 0, intelligence: 0, luck: 0, hp: 0, mp: 0, weight: 0 },
      stats: { ...baseStats }
    };
  }
  const stats = { ...baseStats };
  ["attack", "defense", "speed", "intelligence", "luck", "hp", "mp"].forEach((key) => {
    stats[key] = Math.floor(stats[key] * mul);
  });
  if (quality === "god") {
    stats.weight += 1;
  }
  return {
    bonus: {
      attack: stats.attack - baseStats.attack,
      defense: stats.defense - baseStats.defense,
      speed: stats.speed - baseStats.speed,
      intelligence: stats.intelligence - baseStats.intelligence,
      luck: stats.luck - baseStats.luck,
      hp: stats.hp - baseStats.hp,
      mp: stats.mp - baseStats.mp,
      weight: stats.weight - baseStats.weight
    },
    stats
  };
}

function applyEnhancementBonus(baseStats, enhanceLevel, category) {
  const lv = Math.max(0, Number(enhanceLevel) || 0);
  const bonus = { attack: 0, defense: 0, speed: 0, intelligence: 0, luck: 0, hp: 0, mp: 0, weight: 0 };
  if (lv <= 0) {
    return bonus;
  }

  if (category === "weapon") {
    const atkPerLv = Math.max(1, Math.ceil(Math.max(1, baseStats.attack) * 0.12));
    bonus.attack += atkPerLv * lv;
    if (baseStats.speed > 0) bonus.speed += Math.floor((lv + 1) / 2);
    if (baseStats.intelligence > 0) bonus.intelligence += Math.floor((lv + 1) / 2);
    if (baseStats.luck > 0) bonus.luck += Math.floor((lv + 2) / 3);
  } else if (category === "armor") {
    const defPerLv = Math.max(1, Math.ceil(Math.max(1, baseStats.defense) * 0.1));
    bonus.defense += defPerLv * lv;
    const hpPerLv = Math.max(1, Math.ceil(Math.max(baseStats.hp, baseStats.defense * 2, 10) * 0.04));
    bonus.hp += hpPerLv * lv;
    if (baseStats.mp > 0) bonus.mp += Math.floor((lv + 1) / 2);
  } else if (category === "accessory") {
    ["attack", "defense", "speed", "intelligence", "luck", "hp", "mp"].forEach((key) => {
      if (baseStats[key] > 0) {
        bonus[key] += Math.max(1, Math.ceil(baseStats[key] * 0.08)) * lv;
      }
    });
  } else {
    ["attack", "defense", "speed", "intelligence", "luck", "hp", "mp"].forEach((key) => {
      if (baseStats[key] > 0) {
        bonus[key] += Math.max(1, Math.ceil(baseStats[key] * 0.06)) * lv;
      }
    });
  }

  bonus.weight = Number((lv * 0.2).toFixed(2));
  return bonus;
}

function createEquipmentInstanceFromItemId(itemId) {
  if (!itemId || !EQUIPMENT_DATA[itemId]) {
    return null;
  }
  const parsed = parseQualityItemId(itemId);
  const runtimeEq = EQUIPMENT_DATA[itemId];
  const baseEq = EQUIPMENT_DATA[parsed.baseId] || runtimeEq;
  return {
    itemId,
    baseItemId: baseEq.id,
    quality: parsed.quality || "normal",
    category: runtimeEq.category || baseEq.category,
    enhanceLevel: getEnhanceLevel(itemId),
    specialTags: [...new Set([...(baseEq.specialTags || []), ...(runtimeEq.specialTags || [])])]
  };
}

function getEnhancedEquipmentStats(equipmentInstance) {
  if (!equipmentInstance) {
    return null;
  }
  const baseStats = getEquipmentBaseStats(equipmentInstance.baseItemId) || getEquipmentBaseStats(equipmentInstance.itemId);
  if (!baseStats) {
    return null;
  }
  const qualityStep = applyQualityBonus(baseStats, equipmentInstance.quality);
  const enhancementBonus = applyEnhancementBonus(qualityStep.stats, equipmentInstance.enhanceLevel, equipmentInstance.category);
  const finalStats = {
    attack: qualityStep.stats.attack + enhancementBonus.attack,
    defense: qualityStep.stats.defense + enhancementBonus.defense,
    speed: qualityStep.stats.speed + enhancementBonus.speed,
    intelligence: qualityStep.stats.intelligence + enhancementBonus.intelligence,
    luck: qualityStep.stats.luck + enhancementBonus.luck,
    hp: qualityStep.stats.hp + enhancementBonus.hp,
    mp: qualityStep.stats.mp + enhancementBonus.mp,
    weight: qualityStep.stats.weight + enhancementBonus.weight
  };

  const specialTagBonus = { evasionBonus: 0, critBonus: 0 };
  if ((equipmentInstance.specialTags || []).includes("speed")) {
    specialTagBonus.evasionBonus += 0.01;
  }
  if ((equipmentInstance.specialTags || []).includes("lucky")) {
    specialTagBonus.critBonus += 0.01;
  }

  return {
    baseStats,
    qualityBonus: qualityStep.bonus,
    qualityStats: qualityStep.stats,
    enhancementBonus,
    specialTagBonus,
    finalStats: {
      ...finalStats,
      evasionBonus: specialTagBonus.evasionBonus,
      critBonus: specialTagBonus.critBonus
    }
  };
}

function calculateEquipmentStats() {
  const total = {
    attack: 0,
    defense: 0,
    speed: 0,
    intelligence: 0,
    luck: 0,
    hp: 0,
    mp: 0,
    evasionBonus: 0,
    critBonus: 0,
    totalWeight: 0,
    breakdownBySlot: {}
  };
  EQUIPMENT_SLOTS.forEach((slot) => {
    const instance = createEquipmentInstanceFromItemId(state.player.equipmentSlots?.[slot.id]);
    if (!instance) {
      return;
    }
    const calc = getEnhancedEquipmentStats(instance);
    if (!calc) {
      return;
    }
    const craftedMul =
      (instance.specialTags || []).some((tag) => ["crafted_bonus", "god_quality", "alchemy_masterpiece", "smith_masterpiece", "culinary_masterpiece"].includes(tag))
        ? 1 + (state.titleEffects.craftedGearBonus || 0)
        : 1;
    const slotMul = slot.id === "weapon2" ? 0.6 : 1;
    const final = calc.finalStats;
    total.attack += final.attack * craftedMul * slotMul;
    total.defense += final.defense * craftedMul * slotMul;
    total.speed += final.speed * craftedMul * slotMul;
    total.intelligence += final.intelligence * craftedMul * slotMul;
    total.luck += final.luck * craftedMul * slotMul;
    total.hp += final.hp * craftedMul * slotMul;
    total.mp += final.mp * craftedMul * slotMul;
    total.totalWeight += final.weight;
    total.evasionBonus += (final.evasionBonus || 0) * slotMul;
    total.critBonus += (final.critBonus || 0) * slotMul;
    total.breakdownBySlot[slot.id] = {
      itemId: instance.itemId,
      baseItemId: instance.baseItemId,
      quality: instance.quality,
      enhanceLevel: instance.enhanceLevel,
      craftedMul,
      slotMul,
      ...calc
    };
  });
  return total;
}

function calculateWeightInfo(attackForCapacity = state.player.attack) {
  const equip = calculateEquipmentStats();
  const totalWeight = Math.floor(equip.totalWeight);
  const capacity = state.player.weightCapacityBase + Math.floor(Math.max(0, attackForCapacity) / 5);
  const overBy = Math.max(0, totalWeight - capacity);
  const loadPercent = capacity > 0 ? Math.floor((totalWeight / capacity) * 100) : (totalWeight > 0 ? Infinity : 0);
  const rule = WEIGHT_RULES.find((row) => loadPercent >= row.min && loadPercent <= row.max) || WEIGHT_RULES[WEIGHT_RULES.length - 1];
  return {
    totalWeight,
    capacity,
    loadPercent,
    overBy,
    rank: rule.rank,
    rankLabel: rule.label,
    baseModifiers: { ...rule.modifiers },
    slotsFilled: Object.values(state.player.equipmentSlots || {}).filter(Boolean).length
  };
}

function getWeightPenaltyModifiers(weightInfo) {
  const mods = { ...weightInfo.baseModifiers };
  if (state.titleEffects.ignoreWeightPenalty) {
    return { attackMultiplier: Math.max(0, mods.attackMultiplier), defenseMultiplier: Math.max(0, mods.defenseMultiplier), speedMultiplier: 0, evasionBonus: 0 };
  }
  const reduction = clamp(0, 0.9, state.titleEffects.weightPenaltyReduction || 0);
  if (mods.speedMultiplier < 0) {
    mods.speedMultiplier *= 1 - reduction;
  }
  if (mods.evasionBonus < 0) {
    mods.evasionBonus *= 1 - reduction;
  }
  if (weightInfo.overBy > 0) {
    const extra = Math.min(0.4, weightInfo.overBy * 0.01);
    const reducedExtra = extra * (1 - reduction);
    mods.speedMultiplier -= reducedExtra;
    mods.evasionBonus -= reducedExtra * 0.5;
  }
  return mods;
}

function evaluateBuildTags(weightInfo = calculateWeightInfo(state.player.attack)) {
  const tags = [];
  if (weightInfo.rank === "light") {
    tags.push("light_build");
  }
  if (weightInfo.rank === "heavy") {
    tags.push("heavy_build");
  }
  if (["overweight", "extreme"].includes(weightInfo.rank)) {
    tags.push("overweight_build");
  }
  if (weightInfo.rank === "extreme") {
    tags.push("extreme_overweight");
  }

  const slots = state.player.equipmentSlots || {};
  if (slots.weapon1 && slots.weapon2) {
    tags.push("dual_wield");
  }
  if (!slots.weapon1 && !slots.weapon2) {
    tags.push("no_weapon");
  }
  const accessoryCount = ["accessory1", "accessory2"].filter((id) => Boolean(slots[id])).length;
  if (accessoryCount >= 2) {
    tags.push("accessory_focus");
  }
  const stats = calculateEquipmentStats();
  if (stats.defense > stats.attack * 1.2) {
    tags.push("defense_build");
  }
  if (stats.intelligence >= stats.attack * 0.9) {
    tags.push("magic_build");
  }
  if (stats.speed >= 8) {
    tags.push("speed_build");
  }

  const phase7Tags = [];
  if (LOW_TIER_MAIN_JOBS.includes(state.player.mainJobBaseId || state.player.mainJobId) && state.loop.clearedGame) {
    phase7Tags.push("unfavored_main_clear");
    phase7Tags.push("low_tier_job_clear");
  }
  if (state.stats.totalCrafts >= 120 && state.loop.clearedGame) {
    phase7Tags.push("production_main_clear");
  }
  if ((state.stats.craftedGearBossKillCount || 0) >= 1) {
    phase7Tags.push("crafted_gear_boss_kill");
  }
  if (!state.player.subJobId && state.stats.subJoblessBossClears >= 3) {
    phase7Tags.push("no_subjob_late_boss");
    if (state.loop.clearedGame) {
      phase7Tags.push("no_subjob_clear");
    }
  }
  if (state.stats.totalBattles >= 500 && state.stats.totalCrafts >= 80 && state.player.level >= 120) {
    phase7Tags.push("infinite_grind");
  }
  if (state.stats.totalEnhances >= 60 && state.loop.clearedGame) {
    phase7Tags.push("heavy_enhance_clear");
  }
  if (state.stats.timerClickCount >= 60 && state.stats.titleCatalogOpened >= 50) {
    phase7Tags.push("meta_timer_title");
  }
  if (state.stats.uniqueKillCount >= 7) {
    phase7Tags.push("myth_unique_slayer");
    phase7Tags.push("unique_hunter");
  }
  if (state.stats.totalTitleCombosTried >= 12) {
    phase7Tags.push("title_combo_breaker");
  }
  if ((state.stats.godQualityCraftCount || 0) >= 5) {
    phase7Tags.push("god_quality_dependency");
  }
  if (state.stats.highestBattleSpeedUnlocked >= 4) {
    phase7Tags.push("extreme_speed_mode_user");
  }
  if (["overweight", "extreme"].includes(weightInfo.rank) && state.loop.clearedGame) {
    phase7Tags.push("overweight_high_clear");
  }
  state.runtime.buildTags = [...new Set([...tags, ...phase7Tags])];
  return state.runtime.buildTags;
}

function evaluateExploitTags() {
  const tags = [];
  const buildTags = state.runtime.buildTags || evaluateBuildTags();
  if (buildTags.includes("low_tier_job_clear")) tags.push("low_tier_job_clear");
  if (buildTags.includes("production_main_clear")) tags.push("production_main_clear");
  if (buildTags.includes("no_subjob_clear")) tags.push("no_subjob_clear");
  if (buildTags.includes("overweight_high_clear")) tags.push("overweight_high_clear");
  if ((state.stats.noWeaponBossKills || 0) >= 1) tags.push("no_weapon_boss_kill");
  if (state.stats.highestBattleSpeedUnlocked >= 4 || state.stats.speedModeSeconds >= 1200) tags.push("extreme_speed_mode_user");
  if ((state.stats.uniqueKillCount || 0) >= 7) tags.push("unique_hunter");
  if ((state.stats.totalTitleCombosTried || 0) >= 25) tags.push("title_combo_breaker");
  if ((state.stats.godQualityCraftCount || 0) >= 10) tags.push("god_quality_dependency");
  if ((state.stats.totalBattles || 0) >= 700 && (state.stats.totalCrafts || 0) >= 250 && (state.stats.totalEnhances || 0) >= 120) {
    tags.push("multi_system_synergy");
  }
  state.runtime.exploitTags = [...new Set(tags)];
  return state.runtime.exploitTags;
}

function checkUnexpectedBuildConditions() {
  const tags = evaluateExploitTags();
  if (tags.length >= 4) {
    state.stats.unexpectedBuildMatchCount = Math.max(state.stats.unexpectedBuildMatchCount || 0, tags.length);
    return true;
  }
  return false;
}

function getActiveBattleJobBonuses() {
  const main = getJobDataById(state.player.mainJobCurrentId || state.player.mainJobId);
  const sub = getJobDataById(state.player.subJobCurrentId || state.player.subJobId);
  const statsMul = { hp: 1, mp: 1, attack: 1, defense: 1, speed: 1, intelligence: 1, luck: 1 };
  const combat = { critRate: 0, evasionBonus: 0, spellPower: 0, healPower: 0, mpCostReduction: 0, damageReduction: 0, accuracyBonus: 0 };

  const apply = (job, isSub = false) => {
    if (!job) return;
    const growth = job.statGrowthBonus || {};
    statsMul.hp *= getBattleJobTierScaling(growth.hp || 1, isSub);
    statsMul.mp *= getBattleJobTierScaling(growth.mp || 1, isSub);
    statsMul.attack *= getBattleJobTierScaling(growth.attack || 1, isSub);
    statsMul.defense *= getBattleJobTierScaling(growth.defense || 1, isSub);
    statsMul.speed *= getBattleJobTierScaling(growth.speed || 1, isSub);
    statsMul.intelligence *= getBattleJobTierScaling(growth.intelligence || 1, isSub);
    statsMul.luck *= getBattleJobTierScaling(growth.luck || 1, isSub);
    const passive = job.passiveBonus || {};
    const scale = isSub ? 0.45 : 1;
    combat.critRate += (passive.critRate || 0) * scale;
    combat.evasionBonus += (passive.evasionBonus || 0) * scale;
    combat.spellPower += (passive.spellPower || 0) * scale;
    combat.healPower += (passive.healPower || 0) * scale;
    combat.mpCostReduction += (passive.mpCostReduction || 0) * scale;
    combat.damageReduction += (passive.damageReduction || 0) * scale;
    combat.accuracyBonus += (passive.accuracyBonus || 0) * scale;
  };

  apply(main, false);
  apply(sub, true);
  return { statsMul, combat };
}

function getTotalMpCostReduction() {
  const jobBonus = getActiveBattleJobBonuses().combat.mpCostReduction || 0;
  return clamp(0, 0.8, (state.titleEffects.mpCostReduction || 0) + jobBonus);
}

function getCurrentCombatRegionId() {
  if (state.battle?.isActive && state.battle.stageId && STAGE_DATA[state.battle.stageId]) {
    return STAGE_DATA[state.battle.stageId].mapId;
  }
  return state.currentMap || "grassland";
}

function getStatusResistBonus(type) {
  const generic = state.titleEffects.statusAilmentResist || 0;
  const typed = state.titleEffects.statusResistByType?.[type] || 0;
  return clamp(0, 0.9, generic + typed);
}

function getEffectivePlayerStats() {
  const sub = state.player.subJobId ? SUB_JOB_BONUS_DATA[state.player.subJobBaseId || state.player.subJobId] || {} : {};
  const jobBonus = getActiveBattleJobBonuses();
  const base = {
    maxHp: state.player.maxHp,
    maxMp: state.player.maxMp,
    attack: state.player.attack,
    defense: state.player.defense,
    speed: state.player.speed,
    intelligence: state.player.intelligence,
    luck: state.player.luck,
    evasion: 0.02 + state.player.luck * 0.0012,
    critRate: 0.04
  };

  base.maxMp += sub.mp || 0;
  base.attack += sub.attack || 0;
  base.defense += sub.defense || 0;
  base.speed += sub.speed || 0;
  base.intelligence += sub.intelligence || 0;
  base.luck += sub.luck || 0;
  base.maxHp *= jobBonus.statsMul.hp;
  base.maxMp *= jobBonus.statsMul.mp;
  base.attack *= jobBonus.statsMul.attack;
  base.defense *= jobBonus.statsMul.defense;
  base.speed *= jobBonus.statsMul.speed;
  base.intelligence *= jobBonus.statsMul.intelligence;
  base.luck *= jobBonus.statsMul.luck;
  base.evasion += jobBonus.combat.evasionBonus || 0;
  base.critRate += jobBonus.combat.critRate || 0;

  const equipStats = calculateEquipmentStats();
  const afterEquip = {
    maxHp: base.maxHp + equipStats.hp,
    maxMp: base.maxMp + equipStats.mp,
    attack: base.attack + equipStats.attack,
    defense: base.defense + equipStats.defense,
    speed: base.speed + equipStats.speed,
    intelligence: base.intelligence + equipStats.intelligence,
    luck: base.luck + equipStats.luck,
    evasion: base.evasion + equipStats.evasionBonus,
    critRate: base.critRate + equipStats.critBonus
  };

  const weightInfo = calculateWeightInfo(afterEquip.attack);
  const weightMods = getWeightPenaltyModifiers(weightInfo);
  const slotsFilled = Object.values(state.player.equipmentSlots || {}).filter(Boolean).length;
  const regionId = getCurrentCombatRegionId();
  const slotScale = state.titleEffects.slotFillAttackDefenseBonus > 0 ? slotsFilled * state.titleEffects.slotFillAttackDefenseBonus : 0;

  const stats = {
    maxHp: afterEquip.maxHp + state.titleEffects.allStatsFlat,
    maxMp: afterEquip.maxMp + state.titleEffects.allStatsFlat,
    attack: afterEquip.attack + state.titleEffects.allStatsFlat,
    defense: afterEquip.defense + state.titleEffects.allStatsFlat,
    speed: afterEquip.speed + state.titleEffects.allStatsFlat,
    intelligence: afterEquip.intelligence + state.titleEffects.allStatsFlat,
    luck: afterEquip.luck + state.titleEffects.allStatsFlat,
    evasion: afterEquip.evasion,
    critRate: afterEquip.critRate + state.titleEffects.critRateBonus
  };

  if (state.titleEffects.conditionalBonusNoTitle && state.activeTitles.length === 0) {
    const plus = state.titleEffects.conditionalBonusNoTitle.allStatsFlat || 0;
    stats.maxHp += plus;
    stats.maxMp += plus;
    stats.attack += plus;
    stats.defense += plus;
    stats.speed += plus;
    stats.intelligence += plus;
    stats.luck += plus;
  }
  if (state.titleEffects.conditionalBuffByNoTitle && state.activeTitles.length === 0) {
    const noTitleMul = 1 + (state.titleEffects.conditionalBuffByNoTitle.allStatsMultiplier || 0);
    stats.maxHp *= noTitleMul;
    stats.maxMp *= noTitleMul;
    stats.attack *= noTitleMul;
    stats.defense *= noTitleMul;
    stats.speed *= noTitleMul;
    stats.intelligence *= noTitleMul;
    stats.luck *= noTitleMul;
  }

  if (!state.player.subJobId && state.titleEffects.noSubJobBonus > 0) {
    const mul = 1 + state.titleEffects.noSubJobBonus;
    stats.maxHp *= mul;
    stats.maxMp *= mul;
    stats.attack *= mul;
    stats.defense *= mul;
    stats.speed *= mul;
    stats.intelligence *= mul;
    stats.luck *= mul;
  }
  if (state.titleEffects.lowTierJobBonus > 0 && LOW_TIER_MAIN_JOBS.includes(state.player.mainJobBaseId || state.player.mainJobId)) {
    const mul = 1 + state.titleEffects.lowTierJobBonus;
    stats.maxHp *= mul;
    stats.maxMp *= mul;
    stats.attack *= mul;
    stats.defense *= mul;
    stats.speed *= mul;
    stats.intelligence *= mul;
    stats.luck *= mul;
  }

  stats.attack *= (1 + state.titleEffects.attackMultiplier + weightMods.attackMultiplier + slotScale);
  stats.defense *= (1 + state.titleEffects.defenseMultiplier + weightMods.defenseMultiplier + slotScale);
  stats.speed *= (1 + state.titleEffects.speedMultiplier + weightMods.speedMultiplier);
  stats.evasion += weightMods.evasionBonus;
  if (["overweight", "extreme"].includes(weightInfo.rank) && state.titleEffects.overweightBonus > 0) {
    stats.attack *= 1 + state.titleEffects.overweightBonus;
    stats.defense *= 1 + state.titleEffects.overweightBonus;
  }

  if (state.player.equipmentSlots?.weapon1 == null && state.player.equipmentSlots?.weapon2 == null && state.titleEffects.noWeaponAttackBonus > 0) {
    stats.attack *= 1 + state.titleEffects.noWeaponAttackBonus;
  }
  if (state.titleEffects.defenseToAttackRatio > 0) {
    stats.attack += stats.defense * state.titleEffects.defenseToAttackRatio;
  }

  if (state.titleEffects.lowHpDefenseMultiplier > 0 && state.battle.isActive && state.battle.playerCurrentHp <= stats.maxHp * 0.1) {
    stats.defense *= 1 + state.titleEffects.lowHpDefenseMultiplier;
  }
  if (state.titleEffects.lowHpConditionalCombat && state.battle.isActive) {
    const cond = state.titleEffects.lowHpConditionalCombat;
    if (state.battle.playerCurrentHp <= stats.maxHp * (cond.hpThreshold || 0.5)) {
      stats.attack *= 1 + (cond.attackMultiplier || 0);
    }
  }
  if (state.titleEffects.ninjaLowEvasionConditional && getCurrentMainBattleLineId() === "ninja_line") {
    const cond = state.titleEffects.ninjaLowEvasionConditional;
    const threshold = Number(cond.threshold || 0.1);
    if (stats.evasion <= threshold) {
      stats.attack *= 1 + Number(cond.attackMultiplier || 0);
      extraDamageReductionMultiplier *= 1 - Number(cond.damageReduction || 0);
    }
  }
  if (state.titleEffects.burnConditionalAttackMultiplier > 0 && state.battle.isActive && state.battle.gimmick?.extra?.playerBurnedThisBattle) {
    stats.attack *= 1 + state.titleEffects.burnConditionalAttackMultiplier;
  }
  if (state.titleEffects.allStatsMultiplier > 0) {
    const mul = 1 + state.titleEffects.allStatsMultiplier;
    stats.maxHp *= mul;
    stats.maxMp *= mul;
    stats.attack *= mul;
    stats.defense *= mul;
    stats.speed *= mul;
    stats.intelligence *= mul;
    stats.luck *= mul;
  }
  if (state.titleEffects.conditionalBuffByLoop) {
    const perLoop = state.titleEffects.conditionalBuffByLoop.perLoopAllStatsMultiplier || 0;
    const maxLoopBonus = state.titleEffects.conditionalBuffByLoop.maxLoopBonus || 0;
    const loopMul = 1 + Math.min(maxLoopBonus, state.loop.loopCount * perLoop);
    stats.maxHp *= loopMul;
    stats.maxMp *= loopMul;
    stats.attack *= loopMul;
    stats.defense *= loopMul;
    stats.speed *= loopMul;
    stats.intelligence *= loopMul;
    stats.luck *= loopMul;
  }
  const regionStats = state.titleEffects.regionStatMultiplier?.[regionId];
  if (regionStats) {
    if (regionStats.maxHp) stats.maxHp *= regionStats.maxHp;
    if (regionStats.maxMp) stats.maxMp *= regionStats.maxMp;
    if (regionStats.attack) stats.attack *= regionStats.attack;
    if (regionStats.defense) stats.defense *= regionStats.defense;
    if (regionStats.speed) stats.speed *= regionStats.speed;
    if (regionStats.intelligence) stats.intelligence *= regionStats.intelligence;
    if (regionStats.luck) stats.luck *= regionStats.luck;
  }
  if (state.titleEffects.perNormalEquippedAttackDefenseBonus > 0) {
    const count = Math.max(0, (state.equippedNormalTitleIds || []).length);
    const cap = state.titleEffects.perNormalEquippedAttackDefenseBonusCap || 0.15;
    const bonus = Math.min(cap, count * state.titleEffects.perNormalEquippedAttackDefenseBonus);
    stats.attack *= 1 + bonus;
    stats.defense *= 1 + bonus;
  }
  if (state.titleEffects.perEquippedAttackDefenseBonus > 0) {
    const equippedCount = Math.max(0, (state.activeTitles || []).filter((id) => !!getTitleById(id)).length);
    const cap = state.titleEffects.perEquippedAttackDefenseBonusCap || 0.2;
    const bonus = Math.min(cap, equippedCount * state.titleEffects.perEquippedAttackDefenseBonus);
    stats.attack *= 1 + bonus;
    stats.defense *= 1 + bonus;
  }
  if (state.titleEffects.weaponEnhanceAttackPerLevel > 0 || state.titleEffects.armorEnhanceDefensePerLevel > 0) {
    const breakdown = equipStats.breakdownBySlot || {};
    let weaponEnh = 0;
    let armorEnh = 0;
    Object.values(breakdown).forEach((row) => {
      const lv = Number(row?.enhanceLevel || 0);
      const category = EQUIPMENT_DATA[row?.baseItemId || row?.itemId]?.category;
      if (!category || lv <= 0) return;
      if (category === "weapon") weaponEnh += lv;
      if (category === "armor") armorEnh += lv;
    });
    if (state.titleEffects.weaponEnhanceAttackPerLevel > 0) {
      const maxBonus = state.titleEffects.weaponEnhanceAttackMax || 0.08;
      const atkBonus = Math.min(maxBonus, weaponEnh * state.titleEffects.weaponEnhanceAttackPerLevel);
      stats.attack *= 1 + atkBonus;
    }
    if (state.titleEffects.armorEnhanceDefensePerLevel > 0) {
      const maxBonus = state.titleEffects.armorEnhanceDefenseMax || 0.08;
      const defBonus = Math.min(maxBonus, armorEnh * state.titleEffects.armorEnhanceDefensePerLevel);
      stats.defense *= 1 + defBonus;
    }
  }
  const weightRatio = weightInfo.capacity > 0 ? weightInfo.totalWeight / weightInfo.capacity : 0;
  const lightBonus = state.titleEffects.weightConditionalBonuses?.light;
  if (lightBonus && weightRatio < Number(lightBonus.thresholdRatio || 0.5)) {
    stats.speed *= 1 + Number(lightBonus.speedMultiplier || 0);
    stats.evasion += Number(lightBonus.evasionBonus || 0);
  }
  const heavyBonus = state.titleEffects.weightConditionalBonuses?.heavy;
  let extraDamageReductionMultiplier = 1;
  if (heavyBonus && weightRatio >= Number(heavyBonus.thresholdRatio || 0.8)) {
    stats.defense *= 1 + Number(heavyBonus.defenseMultiplier || 0);
    extraDamageReductionMultiplier *= 1 - Number(heavyBonus.damageReduction || 0);
  }
  if (state.titleEffects.noReturnCombatBonus && state.stats.noReturnExpeditionActive) {
    const noReturn = state.titleEffects.noReturnCombatBonus;
    stats.attack *= 1 + (noReturn.attackMultiplier || 0);
    extraDamageReductionMultiplier *= 1 - (noReturn.damageReduction || 0);
  }
  if (state.titleEffects.overhealActiveDefenseMultiplier > 0) {
    const hasOverhealBuff = state.activeEffects.some((effect) => effect.target === "player" && typeof effect.fromSkillId === "string" && effect.fromSkillId.startsWith(OVERHEAL_DEFENSE_BUFF_PREFIX));
    if (hasOverhealBuff) {
      stats.defense *= 1 + state.titleEffects.overhealActiveDefenseMultiplier;
    }
  }

  ["maxHp", "maxMp", "attack", "defense", "speed", "intelligence", "luck"].forEach((stat) => {
    const effects = state.activeEffects.filter((effect) => effect.target === "player" && effect.stat === stat);
    effects.forEach((effect) => {
      stats[stat] *= effect.multiplier;
    });
  });

  if (Date.now() < (state.titleRuntime.flashSwordsmanEvasionUntil || 0)) {
    stats.evasion += 0.08;
  }

  stats.evasion = clamp(0.01, 0.75, stats.evasion);
  stats.critRate = clamp(0.01, 0.95, stats.critRate);
  stats.magicPowerMultiplier = 1 + (jobBonus.combat.spellPower || 0);
  stats.healPowerMultiplier = 1 + (jobBonus.combat.healPower || 0);
  stats.damageReductionMultiplier = (1 - (jobBonus.combat.damageReduction || 0)) * extraDamageReductionMultiplier;
  stats.accuracyBonus = (stats.accuracyBonus || 0) + (jobBonus.combat.accuracyBonus || 0) + (state.titleEffects.regionAccuracyBonus?.[regionId] || 0);
  stats.weightInfo = weightInfo;
  stats.weightModifiers = weightMods;
  stats.equipmentStats = equipStats;
  stats.buildTags = evaluateBuildTags(weightInfo);
  state.stats.maxWeightReached = Math.max(state.stats.maxWeightReached || 0, weightInfo.totalWeight);
  return stats;
}

function getEffectivePlayerStat(stat) {
  return getEffectivePlayerStats()[stat] ?? 0;
}

function refreshPlayerDerivedStats() {
  const effective = getEffectivePlayerStats();
  state.player.hp = Math.max(0, Math.min(state.player.hp, effective.maxHp));
  state.player.mp = Math.max(0, Math.min(state.player.mp, effective.maxMp));
  if (state.battle.isActive) {
    state.battle.playerCurrentHp = Math.max(0, Math.min(state.battle.playerCurrentHp, effective.maxHp));
    state.battle.playerCurrentMp = Math.max(0, Math.min(state.battle.playerCurrentMp, effective.maxMp));
  }
  return effective;
}

function applyPlayerDamageBonuses(baseDamage, enemy) {
  let damage = baseDamage;
  const regionId = STAGE_DATA[state.battle.stageId]?.mapId || state.currentMap || "grassland";
  const speciesBonus = state.titleEffects.damageToSpecies[enemy.species] || 0;
  if (speciesBonus > 0) {
    damage = Math.floor(damage * (1 + speciesBonus));
  }
  const regionBonus = state.titleEffects.regionDamageBonus?.[regionId] || 0;
  if (regionBonus > 0) {
    damage = Math.floor(damage * (1 + regionBonus));
  }
  if (enemy.rarity === "fieldBoss" || enemy.rarity === "loopBoss" || enemy.rarity === "finalBoss") {
    damage = Math.floor(damage * (1 + state.titleEffects.damageToBoss + state.titleEffects.bossDamageBonus));
  }
  if (enemy.rarity === "unique") {
    damage = Math.floor(damage * (1 + state.titleEffects.damageToUnique + state.titleEffects.uniqueDamageBonus));
  }
  return Math.max(1, damage);
}

function getSpeedModeExpBonus() {
  const bonus = state.titleEffects.speedModeBonus;
  if (!bonus) {
    return 0;
  }
  const minSpeed = bonus.minSpeed || 1.5;
  if (state.battleSpeedMultiplier < minSpeed) {
    return 0;
  }
  return bonus.expMultiplier || 0;
}

function applyEffect(target, fromSkillId, effectData) {
  if (!effectData) {
    return;
  }
  const now = Date.now();
  state.activeEffects = state.activeEffects.filter((effect) => !(effect.target === target && effect.fromSkillId === fromSkillId));
  state.activeEffects.push({
    target,
    fromSkillId,
    sourceSkillId: effectData.sourceSkillId || fromSkillId,
    displayNameJa: effectData.displayNameJa || getSkillDisplayData(effectData.sourceSkillId || fromSkillId)?.nameJa || fromSkillId,
    kind: effectData.kind || effectData.stat || "effect",
    stat: effectData.stat,
    multiplier: effectData.multiplier,
    expiresAt: now + effectData.durationMs
  });
}

function removeExpiredEffects() {
  const now = Date.now();
  state.activeEffects = state.activeEffects.filter((effect) => effect.expiresAt > now);
}

function getCurrentMainBattleLineId() {
  const mainData = getJobDataById(state.player.mainJobCurrentId || state.player.mainJobId);
  return mainData?.baseLineId || null;
}

function getCurrentSubBattleLineId() {
  if (!state.player.subJobId) {
    return null;
  }
  const subData = getJobDataById(state.player.subJobCurrentId || state.player.subJobId);
  return subData?.baseLineId || null;
}

function getBattleLinePairKey(lineA, lineB) {
  if (!lineA || !lineB) {
    return null;
  }
  return [lineA, lineB].sort().join("|");
}

function applyRandomBattleStartBuffOnce(effect, sourceLabel = "称号効果") {
  if (!effect) {
    return false;
  }
  const pick = Math.floor(Math.random() * 3);
  if (pick === 0) {
    applyEffect("player", "title_random_attack", { stat: "attack", multiplier: 1 + (effect.power || 0.15), durationMs: (effect.durationSec || 15) * 1000 });
    addLog(`${sourceLabel}: ランダム攻撃バフ発動`);
    return true;
  }
  if (pick === 1) {
    applyEffect("player", "title_random_defense", { stat: "defense", multiplier: 1 + (effect.power || 0.15), durationMs: (effect.durationSec || 15) * 1000 });
    addLog(`${sourceLabel}: ランダム防御バフ発動`);
    return true;
  }
  applyEffect("player", "title_random_speed", { stat: "speed", multiplier: 1 + (effect.power || 0.15), durationMs: (effect.durationSec || 15) * 1000 });
  addLog(`${sourceLabel}: ランダム速度バフ発動`);
  return true;
}

function getEquippedWeaponCount() {
  let count = 0;
  if (state.player.equipmentSlots?.weapon1) count += 1;
  if (state.player.equipmentSlots?.weapon2) count += 1;
  return count;
}

function recordNinjaDebuffApply() {
  if (getCurrentMainBattleLineId() !== "ninja_line") {
    return;
  }
  if (getEquippedWeaponCount() === 0) {
    state.stats.ninjaNoWeaponDebuffApplyCount = (state.stats.ninjaNoWeaponDebuffApplyCount || 0) + 1;
  }
  const regionId = getCurrentCombatRegionId();
  if (regionId === "grassland") {
    state.stats.ninjaGrasslandDebuffApplyCount = (state.stats.ninjaGrasslandDebuffApplyCount || 0) + 1;
  }
}

function recoverMpFromMageAttack(sourceName = "魔術師特性") {
  if (!state.battle.isActive || getCurrentMainBattleLineId() !== "mage_line") {
    return;
  }
  const effective = getEffectivePlayerStats();
  const recover = Math.max(1, Math.floor(effective.maxMp * MAGE_ATTACK_MP_RECOVERY_RATIO + MAGE_ATTACK_MP_RECOVERY_FLAT));
  const before = state.battle.playerCurrentMp;
  const after = Math.min(effective.maxMp, before + recover);
  const gained = Math.max(0, after - before);
  if (gained <= 0) {
    return;
  }
  state.battle.playerCurrentMp = after;
  state.player.mp = after;
  addLog(`${sourceName}: MP +${gained}`);
}

function recoverHpFromSwordsmanBuff(sourceName = "剣士特性") {
  if (!state.battle.isActive || getCurrentMainBattleLineId() !== "swordsman_line") {
    return;
  }
  const effective = getEffectivePlayerStats();
  const heal = Math.max(1, Math.floor(effective.maxHp * SWORDSMAN_BUFF_HEAL_RATIO + SWORDSMAN_BUFF_HEAL_FLAT));
  const result = applyHealing(heal, sourceName, false);
  if (result.actualHeal > 0) {
    addLog(`剣士特性: HP +${result.actualHeal}`);
  }
}

function addNinjaDebuffAttackStack() {
  if (!state.battle.isActive || getCurrentMainBattleLineId() !== "ninja_line") {
    return;
  }
  removeExpiredEffects();
  const now = Date.now();
  const activeStacks = state.activeEffects
    .filter((effect) => effect.target === "player" && typeof effect.fromSkillId === "string" && effect.fromSkillId.startsWith(NINJA_DEBUFF_ATTACK_BUFF_PREFIX))
    .sort((a, b) => a.expiresAt - b.expiresAt);
  if (activeStacks.length >= NINJA_DEBUFF_ATTACK_STACK_LIMIT) {
    const removeCount = activeStacks.length - NINJA_DEBUFF_ATTACK_STACK_LIMIT + 1;
    const removeSet = new Set(activeStacks.slice(0, removeCount));
    state.activeEffects = state.activeEffects.filter((effect) => !removeSet.has(effect));
  }
  state.activeEffects.push({
    target: "player",
    fromSkillId: `${NINJA_DEBUFF_ATTACK_BUFF_PREFIX}_${now}_${Math.floor(Math.random() * 100000)}`,
    sourceSkillId: "ninja_debuff_attack",
    displayNameJa: "忍術追撃",
    kind: "buff",
    stat: "attack",
    multiplier: NINJA_DEBUFF_ATTACK_STACK_MULTIPLIER,
    expiresAt: now + NINJA_DEBUFF_ATTACK_DURATION_MS
  });
  const stackCount = state.activeEffects.filter((effect) => effect.target === "player" && typeof effect.fromSkillId === "string" && effect.fromSkillId.startsWith(NINJA_DEBUFF_ATTACK_BUFF_PREFIX)).length;
  addLog(`忍者特性: 与ダメ強化 ${stackCount}/${NINJA_DEBUFF_ATTACK_STACK_LIMIT}`);
}

function addNinjaDebuffTitleStack(prefix, limit, multiplier, sourceSkillId, displayName) {
  removeExpiredEffects();
  const now = Date.now();
  const activeStacks = state.activeEffects
    .filter((effect) => effect.target === "player" && typeof effect.fromSkillId === "string" && effect.fromSkillId.startsWith(prefix))
    .sort((a, b) => a.expiresAt - b.expiresAt);
  if (activeStacks.length >= limit) {
    const removeCount = activeStacks.length - limit + 1;
    const removeSet = new Set(activeStacks.slice(0, removeCount));
    state.activeEffects = state.activeEffects.filter((effect) => !removeSet.has(effect));
  }
  state.activeEffects.push({
    target: "player",
    fromSkillId: `${prefix}_${now}_${Math.floor(Math.random() * 100000)}`,
    sourceSkillId,
    displayNameJa: displayName,
    kind: "buff",
    stat: "attack",
    multiplier,
    expiresAt: now + NINJA_TITLE_DEBUFF_STACK_DURATION_MS
  });
  const stackCount = state.activeEffects.filter((effect) => effect.target === "player" && typeof effect.fromSkillId === "string" && effect.fromSkillId.startsWith(prefix)).length;
  addLog(`${displayName}: 与ダメ強化 ${stackCount}/${limit}`);
}

function addNinjaTitleDebuffStacks() {
  if (!state.battle.isActive || getCurrentMainBattleLineId() !== "ninja_line") {
    return;
  }
  if ((state.activeTitles || []).includes("tool_master")) {
    addNinjaDebuffTitleStack(
      NINJA_TITLE_TOOL_MASTER_BUFF_PREFIX,
      NINJA_TITLE_TOOL_MASTER_STACK_LIMIT,
      NINJA_TITLE_TOOL_MASTER_STACK_MULTIPLIER,
      "tool_master_stack",
      "道具の達人"
    );
  }
  if ((state.activeTitles || []).includes("merciless_ninja")) {
    addNinjaDebuffTitleStack(
      NINJA_TITLE_MERCILESS_BUFF_PREFIX,
      NINJA_TITLE_MERCILESS_STACK_LIMIT,
      NINJA_TITLE_MERCILESS_STACK_MULTIPLIER,
      "merciless_ninja_stack",
      "容赦ない忍者"
    );
  }
}

function addOverhealDefenseStack() {
  removeExpiredEffects();
  const now = Date.now();
  const activeStacks = state.activeEffects
    .filter((effect) => effect.target === "player" && typeof effect.fromSkillId === "string" && effect.fromSkillId.startsWith(OVERHEAL_DEFENSE_BUFF_PREFIX))
    .sort((a, b) => a.expiresAt - b.expiresAt);
  if (activeStacks.length >= OVERHEAL_DEFENSE_STACK_LIMIT) {
    const removeCount = activeStacks.length - OVERHEAL_DEFENSE_STACK_LIMIT + 1;
    const removeSet = new Set(activeStacks.slice(0, removeCount));
    state.activeEffects = state.activeEffects.filter((effect) => !removeSet.has(effect));
  }
  state.activeEffects.push({
    target: "player",
    fromSkillId: `${OVERHEAL_DEFENSE_BUFF_PREFIX}_${now}_${Math.floor(Math.random() * 100000)}`,
    sourceSkillId: "overheal_defense",
    displayNameJa: "過剰回復防御",
    kind: "buff",
    stat: "defense",
    multiplier: OVERHEAL_DEFENSE_STACK_MULTIPLIER,
    expiresAt: now + OVERHEAL_DEFENSE_DURATION_MS
  });
  const stackCount = state.activeEffects.filter((effect) => effect.target === "player" && typeof effect.fromSkillId === "string" && effect.fromSkillId.startsWith(OVERHEAL_DEFENSE_BUFF_PREFIX)).length;
  addLog(`過剰回復: 防御バフ ${stackCount}/${OVERHEAL_DEFENSE_STACK_LIMIT}`);
}

function addPriestOverhealExtraDefenseStack(sourceKey, displayName) {
  removeExpiredEffects();
  const now = Date.now();
  const prefix = `${PRIEST_OVERHEAL_EXTRA_DEFENSE_BUFF_PREFIX}_${sourceKey}`;
  const activeStacks = state.activeEffects
    .filter((effect) => effect.target === "player" && typeof effect.fromSkillId === "string" && effect.fromSkillId.startsWith(prefix))
    .sort((a, b) => a.expiresAt - b.expiresAt);
  if (activeStacks.length >= PRIEST_OVERHEAL_EXTRA_DEFENSE_STACK_LIMIT) {
    const removeCount = activeStacks.length - PRIEST_OVERHEAL_EXTRA_DEFENSE_STACK_LIMIT + 1;
    const removeSet = new Set(activeStacks.slice(0, removeCount));
    state.activeEffects = state.activeEffects.filter((effect) => !removeSet.has(effect));
  }
  state.activeEffects.push({
    target: "player",
    fromSkillId: `${prefix}_${now}_${Math.floor(Math.random() * 100000)}`,
    sourceSkillId: `priest_overheal_extra_${sourceKey}`,
    displayNameJa: displayName,
    kind: "buff",
    stat: "defense",
    multiplier: PRIEST_OVERHEAL_EXTRA_DEFENSE_STACK_MULTIPLIER,
    expiresAt: now + OVERHEAL_DEFENSE_DURATION_MS
  });
}

function applyHealing(healAmount, sourceName, enableOverhealDefenseBuff = true) {
  const maxHp = getEffectivePlayerStat("maxHp");
  const before = state.battle.isActive ? state.battle.playerCurrentHp : state.player.hp;
  const safeBefore = Math.max(0, Math.min(maxHp, Number(before || 0)));
  const afterRaw = safeBefore + Math.max(0, Math.floor(healAmount));
  const after = Math.min(maxHp, afterRaw);
  const actualHeal = Math.max(0, after - safeBefore);
  const overflow = Math.max(0, afterRaw - maxHp);
  if (state.battle.isActive) {
    state.battle.playerCurrentHp = after;
  }
  state.player.hp = after;
  if (overflow > 0) {
    state.stats.overhealConvertedTotal = (state.stats.overhealConvertedTotal || 0) + overflow;
  }
  if (enableOverhealDefenseBuff && state.battle.isActive && overflow > 0) {
    addOverhealDefenseStack();
    if (state.titleEffects.priestOverhealExtraDefenseStackSerious) {
      addPriestOverhealExtraDefenseStack("serious", "真面目な僧侶");
    }
    if (state.titleEffects.priestOverhealExtraDefenseStackTooSerious) {
      addPriestOverhealExtraDefenseStack("too_serious", "真面目過ぎる僧侶");
    }
    if (state.titleEffects.overhealConversionBonus > 0 && Math.random() < state.titleEffects.overhealConversionBonus) {
      addOverhealDefenseStack();
    }
    if (sourceName) {
      addLog(`過剰回復発動: ${sourceName}`);
    }
  }
  return { actualHeal, overflow };
}

function getDamageReductionMultiplier() {
  const effects = state.activeEffects.filter((e) => e.target === "player" && e.stat === "damageReduction");
  let mult = 1;
  effects.forEach((e) => {
    mult *= e.multiplier;
  });
  return mult;
}

function getEnemyAccuracyMultiplier() {
  const effects = state.activeEffects.filter((e) => e.target === "enemy" && e.stat === "enemyAccuracy");
  let mult = 1;
  effects.forEach((e) => {
    mult *= e.multiplier;
  });
  return mult;
}

function getPlayerActionInterval() {
  return Math.max(100, Math.floor(clamp(560, 1800, 1520 - getEffectivePlayerStat("speed") * 30) / state.battleSpeedMultiplier));
}

function getEnemyActionInterval() {
  const base = Math.max(100, Math.floor(clamp(650, 2000, 1680 - (state.battle.enemy?.speed || 0) * 28) / state.battleSpeedMultiplier));
  const uniqueProfile = getCurrentUniqueCombatProfile();
  if (uniqueProfile?.actionIntervalMultiplier) {
    return Math.max(80, Math.floor(base * uniqueProfile.actionIntervalMultiplier));
  }
  return base;
}

function getAvailableSkillPool() {
  const list = [];
  const mainData = getJobDataById(state.player.mainJobCurrentId || state.player.mainJobId);
  const subData = getJobDataById(state.player.subJobCurrentId || state.player.subJobId);
  if (mainData?.baseLineId) {
    getUnlockedSkillIdsForLine(mainData.baseLineId).forEach((id) => {
      const skill = SKILL_INDEX_BY_ID[id];
      if (skill) list.push(skill);
    });
  } else if (state.player.mainJobId && state.world.skills[state.player.mainJobId]) {
    list.push(...state.world.skills[state.player.mainJobId]);
  }
  if (subData?.baseLineId) {
    getUnlockedSkillIdsForLine(subData.baseLineId).forEach((id) => {
      const skill = SKILL_INDEX_BY_ID[id];
      if (skill) list.push(skill);
    });
  } else if (state.player.subJobId && state.world.skills[state.player.subJobId]) {
    list.push(...state.world.skills[state.player.subJobId]);
  }
  const map = new Map();
  list.forEach((skill) => {
    if (!map.has(skill.id)) {
      map.set(skill.id, skill);
    }
  });
  return [...map.values()];
}

function getSkillDisplayData(skillId) {
  if (!skillId) {
    return null;
  }
  const all = getAvailableSkillPool();
  const skill = all.find((row) => row.id === skillId);
  if (!skill) {
    return null;
  }
  const mainData = getJobDataById(state.player.mainJobCurrentId || state.player.mainJobId);
  const subData = getJobDataById(state.player.subJobCurrentId || state.player.subJobId);
  const mainLineIds = mainData?.baseLineId ? getUnlockedSkillIdsForLine(mainData.baseLineId) : [];
  const subLineIds = subData?.baseLineId ? getUnlockedSkillIdsForLine(subData.baseLineId) : [];
  return {
    id: skill.id,
    nameJa: skill.nameJa || skill.name || skill.id,
    descriptionJa: skill.descriptionJa || SKILL_DESC_BY_ID[skill.id] || "説明未設定",
    mpCost: skill.mpCost ?? 0,
    cooldown: skill.cooldown ?? Math.floor((skill.cooldownMs || 0) / 1000),
    cooldownMs: skill.cooldownMs || (skill.cooldown || 0) * 1000,
    category: skill.category || SKILL_TYPE_LABEL_JA[skill.type] || "その他",
    effectType: skill.effectType || skill.type,
    jobId: mainLineIds.includes(skill.id) ? state.player.mainJobCurrentId || state.player.mainJobId : subLineIds.includes(skill.id) ? state.player.subJobCurrentId || state.player.subJobId : null,
    raw: skill
  };
}

function getEquippedSkills() {
  if (!Array.isArray(state.player.equippedSkills)) {
    state.player.equippedSkills = [null, null, null, null];
  }
  if (state.player.mainJobId && state.player.equippedSkills.every((id) => !id)) {
    const lineId = getJobDataById(state.player.mainJobCurrentId || state.player.mainJobId)?.baseLineId;
    state.player.equippedSkills = (lineId ? getUnlockedSkillIdsForLine(lineId) : (state.world.skills[state.player.mainJobId] || []).map((s) => s.id)).slice(0, 4);
  }
  const result = state.player.equippedSkills
    .slice(0, 4)
    .map((id) => getSkillDisplayData(id)?.raw || null)
    .filter(Boolean);
  return result;
}

function equipSkill(skillId, slotIndex) {
  const idx = Number(slotIndex);
  if (!Number.isInteger(idx) || idx < 0 || idx > 3) {
    return;
  }
  const data = getSkillDisplayData(skillId);
  if (!data) {
    return;
  }
  if (!Array.isArray(state.player.equippedSkills)) {
    state.player.equippedSkills = [null, null, null, null];
  }
  state.player.equippedSkills[idx] = data.id;
  addLog(`スキルセット: スロット${idx + 1} に ${data.nameJa}`);
}

function unequipSkill(slotIndex) {
  const idx = Number(slotIndex);
  if (!Number.isInteger(idx) || idx < 0 || idx > 3) {
    return;
  }
  if (!Array.isArray(state.player.equippedSkills)) {
    state.player.equippedSkills = [null, null, null, null];
  }
  const oldId = state.player.equippedSkills[idx];
  state.player.equippedSkills[idx] = null;
  if (oldId) {
    addLog(`スキル解除: スロット${idx + 1}`);
  }
}

function getSkillCooldownRemaining(skillId) {
  const until = state.skillCooldowns[skillId] || 0;
  return Math.max(0, until - Date.now());
}

function getSkillCurrentState(skillId) {
  const skill = getSkillDisplayData(skillId);
  if (!skill) {
    return { code: "unset", label: "未セット" };
  }
  const active = (state.activeEffects || []).some((e) => e.sourceSkillId === skillId && e.expiresAt > Date.now());
  if (active) {
    return { code: "active", label: "発動中" };
  }
  const cd = getSkillCooldownRemaining(skillId);
  if (cd > 0) {
    return { code: "cooldown", label: `CT ${(cd / 1000).toFixed(1)}s` };
  }
  const currentMp = state.battle?.isActive ? state.battle.playerCurrentMp : state.player.mp;
  const needMp = Math.max(0, Math.floor(skill.mpCost * (1 - (state.titleEffects.mpCostReduction || 0))));
  if ((currentMp || 0) < needMp) {
    return { code: "mp_lack", label: "MP不足" };
  }
  return { code: "ready", label: "準備完了" };
}

function triggerSkillVisualEffect(skillId) {
  if (!skillId) return;
  if (!state.settings.speedEffectEmphasis || state.settings.lightweightMode) {
    return;
  }
  state.ui.skillVisualEffects = {
    ...(state.ui.skillVisualEffects || {}),
    [skillId]: Date.now() + 450
  };
}

function pickUsableSkill() {
  const skills = getEquippedSkills();
  if (!skills.length) {
    return null;
  }
  const now = Date.now();
  for (let i = 0; i < skills.length; i += 1) {
    const index = (state.battle.skillRotationIndex + i) % skills.length;
    const skill = skills[index];
    const readyAt = state.skillCooldowns[skill.id] || 0;
    const needMp = Math.max(0, Math.floor(skill.mpCost * (1 - getTotalMpCostReduction())));
    if (state.battle.playerCurrentMp >= needMp && now >= readyAt) {
      state.battle.skillRotationIndex = (index + 1) % skills.length;
      return skill;
    }
  }
  return null;
}

function getCurrentSkillList() {
  return getEquippedSkills();
}

function calculateSkillDamage(skill) {
  const enemyDef = state.battle.enemy ? state.battle.enemy.defense : 0;
  const equippedSkillCount = getEquippedSkills().length;
  const hasOpenSkillSlot = equippedSkillCount < 4;
  const slotOpenMul = hasOpenSkillSlot ? 1 + (state.titleEffects.skillPowerIfSkillSlotOpen || 0) : 1;
  const mainLineId = getCurrentMainBattleLineId();
  let skillMul = slotOpenMul * (1 + (state.titleEffects.skillDamageMultiplier || 0));
  if (mainLineId === "swordsman_line") {
    skillMul *= 1 + (state.titleEffects.swordsmanSkillDamageMultiplier || 0);
  }
  if (mainLineId === "mage_line" && skill.type === "magicAttack") {
    skillMul *= 1 + (state.titleEffects.mageSkillDamageMultiplier || 0);
  }
  if (mainLineId === "priest_line") {
    if (skill.type !== "heal") {
      skillMul *= 1 + (state.titleEffects.priestNonHealSkillDamageMultiplier || 0);
    }
    if (["attack", "magicAttack", "multiAttack", "attackDebuff"].includes(skill.type)) {
      skillMul *= 1 + (state.titleEffects.priestOffensiveSkillDamageMultiplier || 0);
    }
  }
  if (mainLineId === "mage_line") {
    if (equippedSkillCount === 1 && state.titleEffects.mageSingleSkillDamageBonus > 0) {
      skillMul *= 1 + state.titleEffects.mageSingleSkillDamageBonus;
    }
    if (equippedSkillCount >= 4 && state.titleEffects.mageFourSkillDamageBonus > 0) {
      skillMul *= 1 + state.titleEffects.mageFourSkillDamageBonus;
    }
  }
  if (skill.type === "magicAttack") {
    const jobMul = getEffectivePlayerStats().magicPowerMultiplier || 1;
    return Math.max(1, Math.floor((getEffectivePlayerStat("intelligence") * skill.power + state.player.level - enemyDef * 0.35) * jobMul * skillMul));
  }
  return Math.max(1, Math.floor((getEffectivePlayerStat("attack") * skill.power - enemyDef * 0.6) * skillMul));
}

function renderBattleView() {
  const stage = STAGE_DATA[state.battle.stageId || state.currentStage];
  const enemy = state.battle.enemy;
  const stats = getEffectivePlayerStats();
  const classes = `${state.battle.isFieldBossBattle ? "boss-encounter" : ""} ${state.battle.isUniqueBattle ? "unique-encounter" : ""}`;
  const mapId = stage?.mapId || state.currentMap || "grassland";
  const effectiveEvasion = getCappedEffectiveEvasion(stats, mapId);
  const effectiveCritRate = Math.max(0, stats.critRate);

  return `
    <div class="main-header">
      <h2>戦闘画面</h2>
      <span class="tiny">町: ${escapeHtml(TOWN_DATA[state.currentTown].name)} / ステージ: ${stage.id}</span>
    </div>
    <div class="card battle-top-info ${classes}">
      <p>戦闘状態: <strong>${escapeHtml(state.battle.status)}</strong></p>
      <p>撃破数: <strong>${state.battle.stageKillCount} / ${state.battle.stageTargetKills}</strong></p>
      <p class="tiny">直近行動: ${escapeHtml(state.battle.recentActionText || "待機中")}</p>
      <p class="tiny">倍率: ${state.battleSpeedMultiplier}x</p>
      <p class="tiny">重量: ${stats.weightInfo.totalWeight}/${stats.weightInfo.capacity} (${stats.weightInfo.rankLabel}) / TAG: ${(stats.buildTags || []).join(", ") || "なし"}</p>
      ${renderBattleEffects()}
    </div>
    <div class="battle-grid">
      <section class="card battle-actor player-side">
        <h4>${escapeHtml(state.player.name)} Lv.${state.player.level} (${escapeHtml(state.player.mainJob || "未設定")})</h4>
        <p class="tiny">HP ${Math.floor(state.battle.playerCurrentHp)} / ${Math.floor(stats.maxHp)}</p>
        <div class="bar hp-bar"><div style="width:${toPercent(state.battle.playerCurrentHp, stats.maxHp)}%"></div></div>
        <p class="tiny">MP ${Math.floor(state.battle.playerCurrentMp)} / ${Math.floor(stats.maxMp)}</p>
        <div class="bar mp-bar"><div style="width:${toPercent(state.battle.playerCurrentMp, stats.maxMp)}%"></div></div>
        <p class="tiny">実効回避 ${(effectiveEvasion * 100).toFixed(1)}% / 実効会心 ${(effectiveCritRate * 100).toFixed(1)}%</p>
      </section>
      <section class="card battle-actor enemy-side ${classes}">
        <h4>${escapeHtml(enemy ? enemy.name : "敵を探索中...")}</h4>
        <p class="tiny">HP ${Math.floor(enemy?.hp || 0)} / ${Math.floor(enemy?.maxHp || 1)}</p>
        <div class="bar enemy-hp-bar"><div style="width:${toPercent(enemy?.hp || 0, enemy?.maxHp || 1)}%"></div></div>
      </section>
    </div>
    ${renderBattleSkillPanel()}
    ${renderBattleAutoItemPanel()}
    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
      ${!state.battle.isActive && state.battle.status === "ステージクリア" && getNextStageId(state.currentStage) ? `<button id="next-stage-btn" class="btn btn-primary">次のステージへ進む</button>` : ""}
      ${!state.battle.isActive ? `<button id="return-town-btn" class="btn">町へ戻る</button><button id="battle-back-btn" class="btn">ステージ一覧へ</button>` : ""}
    </div>
  `;
}

function renderBattleEffects() {
  const now = Date.now();
  const active = (state.activeEffects || []).filter((effect) => effect.target === "player" && effect.expiresAt > now);
  if (!active.length) {
    return `<p class="tiny">現在効果中: なし</p>`;
  }
  const kindMap = { buff: "強化", debuff: "弱体", damageReduction: "被ダメ軽減", attack: "攻撃上昇", defense: "防御上昇", speed: "速度上昇", intelligence: "知性上昇" };
  const labels = active
    .map((effect) => {
      const remain = Math.max(0, (effect.expiresAt - now) / 1000);
      const name = effect.displayNameJa || getSkillDisplayData(effect.sourceSkillId)?.nameJa || effect.fromSkillId;
      const kind = kindMap[effect.kind] || kindMap[effect.stat] || "効果";
      return `${name}(${kind}) ${remain.toFixed(1)}秒`;
    })
    .join(" / ");
  return `<p class="tiny">現在効果中: ${escapeHtml(labels)}</p>`;
}

function renderBattleSkillPanel() {
  const slots = Array.from({ length: 4 }, (_, idx) => {
    const skillId = (state.player.equippedSkills || [])[idx] || null;
    if (!skillId) {
      return `<div class="skill-card unset"><p class="tiny">Slot ${idx + 1}</p><strong>未セット</strong><p class="tiny">スキル設定でセットしてください</p></div>`;
    }
    const data = getSkillDisplayData(skillId);
    if (!data) {
      return `<div class="skill-card unset"><p class="tiny">Slot ${idx + 1}</p><strong>不明スキル</strong></div>`;
    }
    const stateData = getSkillCurrentState(skillId);
    const cdMs = getSkillCooldownRemaining(skillId);
    const cdPercent = data.cooldownMs > 0 ? Math.max(0, Math.min(100, 100 - Math.floor((cdMs / data.cooldownMs) * 100))) : 100;
    const effectUntil = (state.ui.skillVisualEffects || {})[skillId] || 0;
    const flashing = effectUntil > Date.now();
    return `
      <div class="skill-card ${stateData.code} ${flashing ? "firing" : ""}">
        <div class="title-row">
          <strong>${escapeHtml(data.nameJa)}</strong>
          <span class="tiny">Slot ${idx + 1}</span>
        </div>
        <p class="tiny">${escapeHtml(data.descriptionJa)}</p>
        <p class="tiny">MP ${data.mpCost} / CT ${data.cooldown}s / ${escapeHtml(data.category)}</p>
        <div class="skill-cd-bar"><div style="width:${cdPercent}%"></div></div>
        <p class="tiny skill-state">${escapeHtml(stateData.label)}</p>
      </div>
    `;
  }).join("");
  return `
    <div class="card battle-skill-panel">
      <h4>セット中スキル</h4>
      <div class="battle-skill-grid">${slots}</div>
    </div>
  `;
}

function renderBattleAutoItemPanel() {
  const slots = state.autoUseItems.map((_, idx) => {
    const s = getAutoUseItemState(idx);
    const itemName = s.item ? getItemNameJa(s.item.id) : "未設定";
    const cooldownSec = s.cooldownMs > 0 ? (s.cooldownMs / 1000).toFixed(1) : "0.0";
    return `
      <div class="auto-item-card ${escapeHtml(s.code)}">
        <div class="title-row">
          <strong>Slot ${idx + 1}: ${escapeHtml(itemName)}</strong>
          <span class="tiny">${s.slot?.isEnabled ? "有効" : "無効"}</span>
        </div>
        <p class="tiny">発動条件: HP ${s.threshold}%以下</p>
        <p class="tiny">残り個数: ${s.count}</p>
        <p class="tiny">CT: ${cooldownSec}s</p>
        <p class="tiny auto-item-state">${escapeHtml(s.label)}</p>
      </div>
    `;
  }).join("");
  return `
    <div class="card battle-auto-item-panel">
      <h4>自動使用アイテム</h4>
      <div class="battle-auto-item-grid">${slots}</div>
    </div>
  `;
}

function renderActiveEffectsPanel() {
  const now = Date.now();
  const active = (state.activeEffects || []).filter((effect) => effect.target === "player" && effect.expiresAt > now);
  if (!active.length) {
    return `<div class="card"><h4>現在効果中</h4><p class="tiny">なし</p></div>`;
  }
  const rows = active
    .map((effect) => {
      const remain = Math.max(0, (effect.expiresAt - now) / 1000);
      const label = effect.displayNameJa || getSkillDisplayData(effect.sourceSkillId)?.nameJa || effect.fromSkillId;
      const kindMap = { buff: "強化", debuff: "弱体", damageReduction: "被ダメ軽減", attack: "攻撃上昇", defense: "防御上昇", speed: "速度上昇", intelligence: "知性上昇" };
      const kind = kindMap[effect.kind] || kindMap[effect.stat] || "効果";
      return `<span class="battle-effect-chip"><strong>${escapeHtml(label)}</strong> (${escapeHtml(String(kind))}) 残り ${remain.toFixed(1)}秒</span>`;
    })
    .join("");
  return `
    <div class="card">
      <h4>現在効果中</h4>
      <div class="battle-effect-row">${rows}</div>
    </div>
  `;
}

function getNeverendFacilityLabel(id, fallback) {
  if (!isNeverendTownActive()) {
    return fallback;
  }
  return NEVEREND_TOWN_MODE_DATA[id] || fallback;
}

function exchangeGoldToChips(goldAmount) {
  ensureNeverendState();
  const amount = Math.max(0, Math.floor(Number(goldAmount || 0)));
  if (amount <= 0) {
    addLog("交換失敗: 交換額が不正です。");
    return;
  }
  if (state.player.gold < amount) {
    addLog("交換失敗: GOLD不足。");
    return;
  }
  const chips = Math.max(1, Math.floor(amount / Math.max(1e-9, NEVEREND_CHIP_EXCHANGE_DATA.buyRateGoldPerChip)));
  state.player.gold -= amount;
  state.chips += chips;
  addLog(`カジノ交換: ${amount}G -> ${chips}チップ`);
  render();
}

function exchangeChipsToGold(chipAmount) {
  ensureNeverendState();
  const amount = Math.max(0, Math.floor(Number(chipAmount || 0)));
  if (amount <= 0) {
    addLog("交換失敗: 交換額が不正です。");
    return;
  }
  if (state.chips < amount) {
    addLog("交換失敗: チップ不足。");
    return;
  }
  const gold = Math.max(1, Math.floor(amount * NEVEREND_CHIP_EXCHANGE_DATA.sellRateGoldPerChip));
  state.chips -= amount;
  state.player.gold += gold;
  addLog(`カジノ交換: ${amount}チップ -> ${gold}G`);
  render();
}

function getAuctionItemById(auctionId) {
  return NEVEREND_AUCTION_ITEM_TABLE.find((row) => row.id === auctionId);
}

function calculateAuctionSellPrice(itemId) {
  const parsed = parseQualityItemId(itemId);
  const baseId = parsed.baseId;
  const quality = parsed.quality || "normal";
  const item = ITEM_DATA[baseId] || ITEM_DATA[itemId];
  const eq = EQUIPMENT_DATA[baseId] || EQUIPMENT_DATA[itemId];
  const baseSell = Math.max(1, Number(item?.sellPrice || eq?.sellPrice || 1));
  let multiplier = 3.4;
  if (item?.category === "crafted") multiplier += 0.6;
  if (quality === "great") multiplier += 0.9;
  if (quality === "high") multiplier += 1.5;
  if (quality === "god") multiplier += 2.8;
  const tags = eq?.specialTags || [];
  if (tags.includes("god_quality")) multiplier += 1.6;
  if (tags.includes("high_quality")) multiplier += 0.8;
  if (tags.includes("neverend")) multiplier += 0.9;
  if (tags.includes("boss_series")) multiplier += 0.7;
  return Math.max(50, Math.floor(baseSell * multiplier));
}

function canAuctionSellItem(itemId) {
  const parsed = parseQualityItemId(itemId);
  const baseId = parsed.baseId;
  const quality = parsed.quality || "normal";
  const item = ITEM_DATA[baseId] || ITEM_DATA[itemId];
  if (!item) return false;
  if (quality !== "normal") return true;
  if (item.category === "crafted") return true;
  const eq = EQUIPMENT_DATA[baseId] || EQUIPMENT_DATA[itemId];
  if (!eq) return false;
  const tags = eq.specialTags || [];
  return tags.includes("crafted_bonus") || tags.includes("god_quality") || tags.includes("high_quality") || tags.includes("great_success") || tags.includes("neverend");
}

function buyAuctionItem(auctionId) {
  ensureNeverendState();
  const row = getAuctionItemById(auctionId);
  if (!row) return;
  if (state.chips < row.chipPrice) {
    addLog(`オークション購入失敗: ${ITEM_DATA[row.itemId]?.name || row.itemId} のチップ不足。`);
    return;
  }
  state.chips -= row.chipPrice;
  addItem(row.itemId, 1);
  addLog(`オークション落札: ${ITEM_DATA[row.itemId]?.name || row.itemId} x1 (-${row.chipPrice}チップ)`);
  render();
}

function sellAuctionItem(itemId) {
  ensureNeverendState();
  if (!canAuctionSellItem(itemId) || getInventoryCount(itemId) <= 0) {
    addLog("オークション売却失敗: 売却対象外です。");
    return;
  }
  if (!removeItem(itemId, 1)) {
    return;
  }
  const price = calculateAuctionSellPrice(itemId);
  state.chips += price;
  addLog(`オークション売却: ${ITEM_DATA[itemId]?.name || itemId} x1 (+${price}チップ)`);
  render();
}

function setRouletteNumber(number, vip = false) {
  ensureNeverendState();
  const n = Math.min(5, Math.max(1, Math.floor(Number(number || 1))));
  if (vip) {
    state.neverendUi.vipRouletteNumber = n;
  } else {
    state.neverendUi.rouletteNumber = n;
  }
  renderPreservingWindowScroll();
}

function spinNeverendRoulette(vip = false) {
  ensureNeverendState();
  const rules = vip ? NEVEREND_VIP_ROULETTE_RULES : NEVEREND_ROULETTE_RULES;
  if (vip && !state.neverendVipUnlocked) {
    addLog("VIP未解放: Protocol3を撃破すると解放されます。");
    return;
  }
  const betInputId = vip ? "vip-roulette-bet-input" : "roulette-bet-input";
  const betInput = document.getElementById(betInputId);
  const bet = Math.max(rules.minBet, Math.min(rules.maxBet, Math.floor(Number(betInput?.value || rules.minBet))));
  if (state.chips < bet) {
    addLog("ルーレット失敗: チップ不足。");
    return;
  }
  const selected = vip ? state.neverendUi.vipRouletteNumber : state.neverendUi.rouletteNumber;
  const rolled = 1 + Math.floor(Math.random() * 5);
  state.chips -= bet;
  let totalGain = 0;
  let won = false;
  const hit = rolled === selected && Math.random() < rules.hitChance;
  if (hit) {
    totalGain = Math.floor(bet * rules.payoutMultiplier);
    state.chips += totalGain;
    won = true;
  }
  if (vip && !won && Math.random() < rules.crashChance) {
    const extraLoss = Math.min(state.chips, Math.floor(bet * rules.crashLossRate));
    state.chips -= extraLoss;
    state.rouletteStats.chipsLost += extraLoss;
    addLog(`VIP暴落: 追加で${extraLoss}チップを失った。`);
  }
  if (vip) {
    state.rouletteStats.vipSpins += 1;
    if (won) state.rouletteStats.vipWins += 1;
  } else {
    state.rouletteStats.spins += 1;
    if (won) state.rouletteStats.wins += 1;
  }
  state.rouletteStats.chipsLost += bet;
  state.rouletteStats.chipsWon += totalGain;
  addLog(`${vip ? "VIP" : "ルーレット"}: 予想${selected} / 結果${rolled} / ${won ? `的中 +${totalGain}チップ` : `ハズレ -${bet}チップ`}`);
  render();
}

function renderNeverendCasinoView() {
  ensureNeverendState();
  const rates = `購入: 1チップ=${NEVEREND_CHIP_EXCHANGE_DATA.buyRateGoldPerChip}G / 売却: 1チップ=${NEVEREND_CHIP_EXCHANGE_DATA.sellRateGoldPerChip.toFixed(2)}G`;
  return `
    <h3>カジノ</h3>
    <p class="tiny">所持GOLD: ${state.player.gold} / 所持チップ: ${state.chips}</p>
    <p class="tiny">${rates}</p>
    <div class="shop-grid">
      ${[1000, 10000, 50000].map((gold) => `<div class="shop-card"><h4>${gold}G -> チップ交換</h4><button class="btn casino-buy-chip-btn" data-gold="${gold}" ${state.player.gold >= gold ? "" : "disabled"}>交換</button></div>`).join("")}
      ${[1000, 10000, 50000].map((chip) => `<div class="shop-card"><h4>${chip}チップ -> GOLD換金</h4><button class="btn casino-sell-chip-btn" data-chip="${chip}" ${state.chips >= chip ? "" : "disabled"}>換金</button></div>`).join("")}
    </div>
  `;
}

function renderNeverendAuctionView() {
  ensureNeverendState();
  const activeMode = state.guild.shopMode === "sell" ? "sell" : "buy";
  const modeButtons = `
    <button class="btn shop-mode-tab-btn ${activeMode === "buy" ? "active" : ""}" data-shop-mode="buy">落札</button>
    <button class="btn shop-mode-tab-btn ${activeMode === "sell" ? "active" : ""}" data-shop-mode="sell">出品</button>
  `;
  const buyCards = NEVEREND_AUCTION_ITEM_TABLE
    .map((row) => {
      const item = ITEM_DATA[row.itemId];
      const name = item?.name || row.itemId;
      return `
        <div class="shop-card">
          <h4>${escapeHtml(name)}</h4>
          <p class="tiny">${escapeHtml(item?.description || "説明なし")}</p>
          <p class="tiny">価格: ${row.chipPrice}チップ</p>
          <button class="btn auction-buy-chip-btn" data-auction-id="${row.id}" ${state.chips >= row.chipPrice ? "" : "disabled"}>落札</button>
        </div>
      `;
    })
    .join("");
  const sellCards = state.player.inventory
    .filter((slot) => canAuctionSellItem(slot.itemId) && slot.quantity > 0)
    .map((slot) => {
      const item = ITEM_DATA[slot.itemId];
      const price = calculateAuctionSellPrice(slot.itemId);
      return `
        <div class="shop-card">
          <h4>${escapeHtml(item?.name || slot.itemId)}</h4>
          <p class="tiny">${escapeHtml(item?.description || "説明なし")}</p>
          <p class="tiny">所持: ${slot.quantity} / 売却額: ${price}チップ</p>
          <button class="btn auction-sell-chip-btn" data-item-id="${slot.itemId}">出品売却</button>
        </div>
      `;
    })
    .join("");
  return `
    <div class="title-row"><h3>オークション</h3><div class="status-tabs">${modeButtons}</div></div>
    <p class="tiny">所持チップ: ${state.chips} / 通常ショップとは別経済です。</p>
    <div class="shop-grid">${activeMode === "buy" ? (buyCards || "<p class='tiny'>出品なし</p>") : (sellCards || "<p class='tiny'>売却可能なクラフト品がありません。</p>")}</div>
  `;
}

function renderNeverendRouletteView() {
  ensureNeverendState();
  const selected = state.neverendUi.rouletteNumber;
  const stat = state.rouletteStats;
  const winRate = stat.spins > 0 ? Math.floor((stat.wins / stat.spins) * 1000) / 10 : 0;
  return `
    <h3>ルーレット</h3>
    <p class="tiny">所持チップ: ${state.chips}</p>
    <p class="tiny">的中率20% / 的中配当${NEVEREND_ROULETTE_RULES.payoutMultiplier}倍（元手込み） / ベット${NEVEREND_ROULETTE_RULES.minBet}-${NEVEREND_ROULETTE_RULES.maxBet}</p>
    <div class="status-tabs">${[1, 2, 3, 4, 5].map((n) => `<button class="btn roulette-number-btn ${selected === n ? "active" : ""}" data-number="${n}" data-vip="0">${n}</button>`).join("")}</div>
    <div class="title-row">
      <input id="roulette-bet-input" type="number" min="${NEVEREND_ROULETTE_RULES.minBet}" max="${NEVEREND_ROULETTE_RULES.maxBet}" step="1000" value="${NEVEREND_ROULETTE_RULES.minBet}" />
      <button class="btn" id="roulette-spin-btn">回す</button>
    </div>
    <p class="tiny">通常統計: ${stat.spins}回 / 勝利${stat.wins}回 / 勝率${winRate}%</p>
  `;
}

function renderNeverendVipView() {
  ensureNeverendState();
  if (!state.neverendVipUnlocked) {
    return `
      <h3>VIP</h3>
      <p class="tiny">VIPは未解放です。Protocol3を撃破すると解放されます。</p>
    `;
  }
  const selected = state.neverendUi.vipRouletteNumber;
  const stat = state.rouletteStats;
  const winRate = stat.vipSpins > 0 ? Math.floor((stat.vipWins / stat.vipSpins) * 1000) / 10 : 0;
  return `
    <h3>VIP</h3>
    <p class="tiny">所持チップ: ${state.chips}</p>
    <p class="tiny">VIP配当${NEVEREND_VIP_ROULETTE_RULES.payoutMultiplier}倍 / 的中率16% / 暴落率12% / ベット${NEVEREND_VIP_ROULETTE_RULES.minBet}-${NEVEREND_VIP_ROULETTE_RULES.maxBet}</p>
    <div class="status-tabs">${[1, 2, 3, 4, 5].map((n) => `<button class="btn roulette-number-btn ${selected === n ? "active" : ""}" data-number="${n}" data-vip="1">${n}</button>`).join("")}</div>
    <div class="title-row">
      <input id="vip-roulette-bet-input" type="number" min="${NEVEREND_VIP_ROULETTE_RULES.minBet}" max="${NEVEREND_VIP_ROULETTE_RULES.maxBet}" step="10000" value="${NEVEREND_VIP_ROULETTE_RULES.minBet}" />
      <button class="btn btn-primary" id="vip-spin-btn">VIPベット</button>
    </div>
    <p class="tiny">VIP統計: ${stat.vipSpins}回 / 勝利${stat.vipWins}回 / 勝率${winRate}%</p>
  `;
}

function renderGuildView(container) {
  ensureNeverendState();
  const rankInfo = getGuildRankDisplayInfo();
  const nextLine = rankInfo.nextRank
    ? `次ランク ${rankInfo.nextRank}: ${rankInfo.nextRequiredPoints}GP（あと${rankInfo.pointsToNext}GP）`
    : "Sランク到達済み";
  const capLine = rankInfo.blockedByRegion
    ? `地域制限中: ${MAP_DATA[rankInfo.unlockRegionId]?.name || rankInfo.unlockRegionId} 到達で ${rankInfo.nextRank} 解放`
    : `地域上限: ${rankInfo.currentRegionCap}（現在到達上限 ${rankInfo.progressCap}）`;
  const facilityButtons = [["reception", "受付"], ["shop", "ショップ"], ["temple", "神殿"], ["workshop", "工房"]]
    .map(([id, label]) => `<button class="btn guild-menu-btn ${state.guild.selectedFacility === id ? "active" : ""}" data-facility="${id}">${getNeverendFacilityLabel(id, label)}</button>`)
    .join("");

  let content = "";
  if (isNeverendTownActive()) {
    if (state.guild.selectedFacility === "reception") {
      content = renderNeverendCasinoView();
    } else if (state.guild.selectedFacility === "shop") {
      content = renderNeverendAuctionView();
    } else if (state.guild.selectedFacility === "temple") {
      content = renderNeverendRouletteView();
    } else {
      content = renderNeverendVipView();
    }
  } else {
    if (state.guild.selectedFacility === "reception") {
      content = renderQuestBoard();
    } else if (state.guild.selectedFacility === "shop") {
      content = renderShopView();
    } else if (state.guild.selectedFacility === "temple") {
      content = renderTempleView();
    } else {
      content = renderWorkshopLayout();
    }
  }

  container.innerHTML = `
    <div class="main-header"><h2>${isNeverendTownActive() ? "天空都市ネバーエンド" : "ギルド"}</h2><span class="tiny">ランク ${state.guild.rank} / GP ${state.guild.points}</span></div>
    <div class="card" style="margin-bottom:10px;">
      <p class="tiny">${escapeHtml(nextLine)}</p>
      <p class="tiny">${escapeHtml(capLine)}</p>
    </div>
    <div class="guild-facility-grid">${facilityButtons}</div>
    <div class="card guild-content">${content}</div>
  `;
}

function getQuestRepeatLevel(questFamilyId) {
  return Number(state.guild.questRepeatLevels?.[questFamilyId] || 0);
}

function increaseQuestRepeatLevel(questFamilyId) {
  const current = getQuestRepeatLevel(questFamilyId);
  state.guild.questRepeatLevels = { ...(state.guild.questRepeatLevels || {}), [questFamilyId]: current + 1 };
}

function getAvailableQuestTemplates(rank, unlockedMaps) {
  return GUILD_QUEST_TEMPLATE_DATA.filter((template) => {
    if (!rankInRange(rank, template.rankMin, template.rankMax)) {
      return false;
    }
    if (template.mapId === "all") {
      return true;
    }
    return unlockedMaps.includes(template.mapId);
  });
}

function pickWeightedMapForGuildRank(rank, unlockedMaps) {
  const weights = GUILD_QUEST_RANK_MAP_WEIGHTS[rank] || GUILD_QUEST_RANK_MAP_WEIGHTS.D;
  const entries = unlockedMaps
    .map((mapId) => ({ mapId, weight: Number(weights[mapId] || 0.01) }))
    .filter((row) => row.weight > 0);
  if (!entries.length) {
    return unlockedMaps[0] || state.currentMap || "grassland";
  }
  const total = entries.reduce((acc, row) => acc + row.weight, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < entries.length; i += 1) {
    roll -= entries[i].weight;
    if (roll <= 0) {
      return entries[i].mapId;
    }
  }
  return entries[0].mapId;
}

function rollQuestRankForGuild() {
  const currentIdx = guildRankScore(state.guild.rank);
  const roll = Math.random();
  if (currentIdx <= 0) return "D";
  if (roll < 0.68) return GUILD_RANK_ORDER[currentIdx];
  if (roll < 0.9) return GUILD_RANK_ORDER[Math.max(0, currentIdx - 1)];
  return GUILD_RANK_ORDER[Math.max(0, currentIdx - 2)];
}

function buildQuestFromTemplate(templateId, params) {
  const template = GUILD_QUEST_TEMPLATE_DATA.find((row) => row.templateId === templateId);
  if (!template) {
    return null;
  }
  const rank = params.rank || state.guild.rank;
  const rankScore = guildRankScore(rank);
  const repeatLevel = Math.max(0, Number(params.repeatLevel || 0));
  const mapId = template.mapId === "all" ? (params.mapId || state.currentMap || "grassland") : template.mapId;
  const mapDepth = Math.max(0, ["grassland", "desert", "sea", "volcano", "neverend"].indexOf(mapId));
  const mapScale = 1 + mapDepth * 0.22;
  const rankScale = 1 + rankScore * 0.16;
  const suffix = formatQuestTierSuffix(repeatLevel);

  let targetCount = 1;
  let description = template.descriptionTemplate || "";
  let mixTargets = null;
  if (template.templateType === "kill_enemy_mix") {
    mixTargets = (template.mixTargets || []).map((row, idx) => {
      const amount = Math.max(1, row.count + repeatLevel * (template.mixStep || 1) + Math.floor(rankScore * 0.5));
      description = description.replaceAll(idx === 0 ? "{countA}" : "{countB}", String(amount));
      return { targetId: row.targetId, targetCount: amount };
    });
    targetCount = mixTargets.reduce((acc, row) => acc + row.targetCount, 0);
  } else if (template.templateType === "kill_boss") {
    targetCount = 1;
  } else {
    targetCount = Math.max(1, Math.floor((template.baseCount + repeatLevel * template.countStep) * (1 + rankScore * 0.08)));
    description = description.replaceAll("{count}", String(targetCount));
  }

  const rewardGold = Math.max(20, Math.floor((template.baseGold + repeatLevel * template.goldStep) * rankScale * mapScale));
  const rewardGuildPoints = Math.max(2, Math.floor((template.baseGp + repeatLevel * template.gpStep) * (1 + rankScore * 0.12) * (1 + mapDepth * 0.14)));
  const questId = `gq_${template.familyId}_${state.guild.questGenerationSeed++}`;
  state.guild.guildQuestStats.generated = (state.guild.guildQuestStats.generated || 0) + 1;

  return {
    id: questId,
    familyId: template.familyId,
    templateId: template.templateId,
    templateType: template.templateType,
    mapId,
    regionId: template.regionId || mapId,
    targetId: template.targetId || null,
    targetCount,
    mixTargets,
    repeatLevel,
    difficultyTier: rank,
    isEnhanced: repeatLevel > 0,
    name: `${template.baseName}${suffix ? ` ${suffix}` : ""}`,
    description,
    reward: { gold: rewardGold, guildPoints: rewardGuildPoints },
    progressStart: null,
    generatedAt: Date.now()
  };
}

function generateQuestForRankAndMap(rank, mapId, options = {}) {
  const unlockedMaps = getUnlockedGuildMaps();
  const allowGlobal = options.allowGlobal !== false;
  const strictMap = options.strictMap === true;
  const mapPoolByRank = GUILD_QUEST_TEMPLATE_DATA.filter((row) => {
    if (!rankInRange(rank, row.rankMin, row.rankMax)) return false;
    if (row.mapId === "all") return allowGlobal;
    return row.mapId === mapId && unlockedMaps.includes(row.mapId);
  });
  const fallbackByRank = strictMap
    ? mapPoolByRank
    : getAvailableQuestTemplates(rank, unlockedMaps).filter((row) => allowGlobal || row.mapId !== "all");
  const mapPoolIgnoreRank = GUILD_QUEST_TEMPLATE_DATA.filter((row) => {
    if (row.mapId === "all") return allowGlobal;
    return row.mapId === mapId && unlockedMaps.includes(row.mapId);
  });
  const pool = mapPoolByRank.length
    ? mapPoolByRank
    : fallbackByRank.length
      ? fallbackByRank
      : mapPoolIgnoreRank;
  if (!pool.length) return null;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const repeatLevel = getQuestRepeatLevel(pick.familyId);
  return buildQuestFromTemplate(pick.templateId, { rank, mapId, repeatLevel });
}

function generateGuildQuestPool() {
  const unlockedMaps = getUnlockedGuildMaps();
  const targetSize = GUILD_QUEST_BOARD_SIZE;
  const quests = [];
  const seenFamilies = {};
  let guard = 0;
  while (quests.length < targetSize && guard < 120) {
    guard += 1;
    const rank = rollQuestRankForGuild();
    const mapId = Math.random() < 0.58 ? (state.currentMap || unlockedMaps[0] || "grassland") : pickWeightedMapForGuildRank(rank, unlockedMaps);
    const quest = generateQuestForRankAndMap(rank, mapId);
    if (!quest) {
      continue;
    }
    const dupCount = seenFamilies[quest.familyId] || 0;
    if (dupCount >= 2) {
      continue;
    }
    seenFamilies[quest.familyId] = dupCount + 1;
    quests.push(quest);
  }
  state.guild.guildQuestPool = quests;
}

function refreshGuildQuestsForCurrentTown(force = false) {
  state.guild.guildQuestPool = Array.isArray(state.guild.guildQuestPool) ? state.guild.guildQuestPool : [];
  state.guild.questRepeatLevels = state.guild.questRepeatLevels || {};
  state.guild.clearedQuestHistory = Array.isArray(state.guild.clearedQuestHistory) ? state.guild.clearedQuestHistory : [];
  state.guild.guildQuestStats = state.guild.guildQuestStats || { generated: 0, completed: 0, claimed: 0, refreshed: 0 };
  const targetMapId = getCurrentGuildRegionId();
  const activeIds = new Set(Array.isArray(state.guild.activeQuestIds) ? state.guild.activeQuestIds : []);
  const keepActive = state.guild.guildQuestPool.filter((quest) => activeIds.has(quest.id));
  const quests = [...keepActive];
  const seenFamilies = {};
  quests.forEach((quest) => {
    seenFamilies[quest.familyId] = (seenFamilies[quest.familyId] || 0) + 1;
  });
  let guard = 0;
  while (quests.length < GUILD_QUEST_BOARD_SIZE && guard < 200) {
    guard += 1;
    const rank = force ? state.guild.rank : rollQuestRankForGuild();
    const quest = generateQuestForRankAndMap(rank, targetMapId, { strictMap: true, allowGlobal: true });
    if (!quest) continue;
    const dupCount = seenFamilies[quest.familyId] || 0;
    if (dupCount >= 2) continue;
    seenFamilies[quest.familyId] = dupCount + 1;
    quests.push(quest);
  }
  state.guild.guildQuestPool = quests;
  state.guild.activeQuestIds.forEach((questId) => {
    const quest = state.guild.guildQuestPool.find((row) => row.id === questId);
    if (quest && !quest.progressStart) {
      quest.progressStart = createQuestProgressSnapshot(quest);
    }
  });
  state.guild.guildQuestLastGeneratedRegion = targetMapId;
  state.guild.guildQuestRefreshVersion = Number(state.guild.guildQuestRefreshVersion || 0) + 1;
  state.guild.guildQuestStats.refreshed = (state.guild.guildQuestStats.refreshed || 0) + 1;
  state.guild.activeGuildQuests = [...state.guild.activeQuestIds];
}

function refreshGuildQuests(force = false) {
  state.guild.guildQuestPool = Array.isArray(state.guild.guildQuestPool) ? state.guild.guildQuestPool : [];
  state.guild.questRepeatLevels = state.guild.questRepeatLevels || {};
  state.guild.clearedQuestHistory = Array.isArray(state.guild.clearedQuestHistory) ? state.guild.clearedQuestHistory : [];
  state.guild.guildQuestStats = state.guild.guildQuestStats || { generated: 0, completed: 0, claimed: 0, refreshed: 0 };
  if (typeof state.guild.guildQuestLastGeneratedRegion !== "string" || !state.guild.guildQuestLastGeneratedRegion) {
    state.guild.guildQuestLastGeneratedRegion = getCurrentGuildRegionId();
  }
  if (force || state.guild.guildQuestPool.length === 0 || state.guild.guildQuestLastGeneratedRegion !== getCurrentGuildRegionId()) {
    refreshGuildQuestsForCurrentTown(force);
    return;
  }
  let guard = 0;
  while (state.guild.guildQuestPool.length < GUILD_QUEST_BOARD_SIZE && guard < 80) {
    guard += 1;
    const rank = state.guild.rank || rollQuestRankForGuild();
    const quest = generateQuestForRankAndMap(rank, getCurrentGuildRegionId(), { strictMap: true, allowGlobal: true });
    if (!quest) {
      continue;
    }
    state.guild.guildQuestPool.push(quest);
  }
  state.guild.activeQuestIds.forEach((questId) => {
    const quest = state.guild.guildQuestPool.find((row) => row.id === questId);
    if (quest && !quest.progressStart) {
      quest.progressStart = createQuestProgressSnapshot(quest);
    }
  });
  state.guild.guildQuestLastGeneratedRegion = getCurrentGuildRegionId();
  state.guild.guildQuestRefreshVersion = Number(state.guild.guildQuestRefreshVersion || 0) + 1;
  state.guild.guildQuestStats.refreshed = (state.guild.guildQuestStats.refreshed || 0) + 1;
  state.guild.activeGuildQuests = [...state.guild.activeQuestIds];
}

function completeQuestAndRegenerate(questId) {
  const quest = getQuestById(questId);
  if (!quest) {
    return;
  }
  increaseQuestRepeatLevel(quest.familyId);
  state.guild.clearedQuestHistory = [
    ...(state.guild.clearedQuestHistory || []),
    {
      questId: quest.id,
      familyId: quest.familyId,
      repeatLevel: quest.repeatLevel || 0,
      rank: quest.difficultyTier || state.guild.rank,
      mapId: quest.mapId || "grassland",
      clearedAt: Date.now()
    }
  ].slice(-120);
  state.guild.guildQuestPool = state.guild.guildQuestPool.filter((row) => row.id !== questId);
  state.guild.completedQuestIds = state.guild.completedQuestIds.filter((id) => id !== questId);
  state.guild.claimedQuestIds = state.guild.claimedQuestIds.filter((id) => id !== questId);
  state.guild.activeQuestIds = state.guild.activeQuestIds.filter((id) => id !== questId);
  state.guild.activeGuildQuests = [...state.guild.activeQuestIds];
  state.guild.guildQuestStats.completed = (state.guild.guildQuestStats.completed || 0) + 1;
  refreshGuildQuests(false);
}

function renderQuestBoard() {
  checkQuestCompletion();
  const rankInfo = getGuildRankDisplayInfo();
  const capNote = rankInfo.blockedByRegion
    ? `この地域ではこれ以上ランクアップできません。${MAP_DATA[rankInfo.unlockRegionId]?.name || rankInfo.unlockRegionId} 到達で ${rankInfo.nextRank} ランク解放`
    : "地域条件を満たしています。";
  const nextNote = rankInfo.nextRank
    ? `次ランク ${rankInfo.nextRank}: ${rankInfo.nextRequiredPoints}GP（あと${rankInfo.pointsToNext}GP）`
    : "Sランクに到達済みです。";
  const loopCards = isFeatureUnlocked("loop_quests")
    ? LOOP_QUEST_DATA.filter((q) => state.loop.loopCount >= q.requiredLoop)
        .map((quest) => {
          const claimed = !!state.loop.loopRewardFlags?.[`loopQuest_${quest.id}`];
          const done = quest.checker();
          return `
            <div class="quest-card">
              <h4>[周回限定] ${quest.name}</h4>
              <p class="tiny">${quest.description}</p>
              <p class="tiny">報酬: ${quest.reward.gold}G / ${quest.reward.guildPoints}GP / ${ITEM_DATA[quest.reward.itemId]?.name || quest.reward.itemId}</p>
              <div class="title-row">
                <span class="tiny">${claimed ? "受取済み" : done ? "達成済み" : "進行中"}</span>
                <button class="btn loop-quest-claim-btn" data-loop-quest-id="${quest.id}" ${done && !claimed ? "" : "disabled"}>受取</button>
              </div>
            </div>
          `;
        })
        .join("")
    : "";

  const cards = state.guild.guildQuestPool
    .map((quest) => {
      const accepted = state.guild.activeQuestIds.includes(quest.id);
      const completed = state.guild.completedQuestIds.includes(quest.id);
      const claimed = state.guild.claimedQuestIds.includes(quest.id);
      const progress = getQuestProgress(quest, { accepted });
      return `
        <div class="quest-card">
          <h4>${quest.name}</h4>
          <p class="tiny">${quest.description}</p>
          <p class="tiny">進捗: ${Math.min(progress.current, progress.target)} / ${progress.target}</p>
          <p class="tiny">地域: ${MAP_DATA[quest.mapId]?.name || quest.mapId} / 難易度: ${quest.difficultyTier}${quest.isEnhanced ? " / 強化版" : ""}</p>
          <p class="tiny">報酬: ${quest.reward.gold}G / ${quest.reward.guildPoints}GP</p>
          <div class="title-row">
            <span class="tiny">${claimed ? "受取済み" : completed ? "達成済み" : accepted ? "受注中" : "未受注"}</span>
            ${
              claimed
                ? ""
                : completed
                ? `<button class="btn quest-claim-btn" data-quest-id="${quest.id}">報酬受取</button>`
                : accepted
                ? `<button class="btn" disabled>進行中</button>`
                : `<button class="btn quest-accept-btn" data-quest-id="${quest.id}">受注</button>`
            }
          </div>
        </div>
      `;
    })
    .join("");
  return `
    <h3>受付</h3>
    <p class="tiny">受注中: ${state.guild.activeQuestIds.length}/${state.guild.maxActiveQuests} / 依頼補充: 常時 / 依頼地域: ${MAP_DATA[getCurrentGuildRegionId()]?.name || getCurrentGuildRegionId()}</p>
    <p class="tiny">現在ランク ${state.guild.rank} / GP ${state.guild.points} / 地域上限 ${rankInfo.currentRegionCap}</p>
    <p class="tiny">${escapeHtml(nextNote)}</p>
    <p class="tiny">${escapeHtml(capNote)}</p>
    <div class="quest-grid">${cards}${loopCards}</div>
  `;
}

function claimLoopQuestReward(loopQuestId) {
  const quest = LOOP_QUEST_DATA.find((row) => row.id === loopQuestId);
  if (!quest || state.loop.loopCount < quest.requiredLoop) {
    return;
  }
  const flag = `loopQuest_${quest.id}`;
  if (state.loop.loopRewardFlags?.[flag]) {
    return;
  }
  if (!quest.checker()) {
    addLog("周回限定依頼はまだ達成していません。");
    return;
  }
  state.loop.loopRewardFlags = { ...(state.loop.loopRewardFlags || {}), [flag]: true };
  const gp = Math.floor(quest.reward.guildPoints * (1 + state.titleEffects.guildPointMultiplier));
  state.player.gold += quest.reward.gold;
  state.guild.points += gp;
  addItem(quest.reward.itemId, 1);
  state.stats.guildPointsEarned += gp;
  state.stats.guildQuestCompleted += 1;
  updateGuildRank();
  addLog(`周回依頼報酬: ${quest.name} / +${quest.reward.gold}G, +${gp}GP, ${ITEM_DATA[quest.reward.itemId]?.name || quest.reward.itemId} x1`);
  checkLoopOnlyTitles("afterLoopProgress");
  render();
}

function acceptQuest(questId) {
  if (state.guild.activeQuestIds.includes(questId) || state.guild.claimedQuestIds.includes(questId)) {
    return;
  }
  const quest = getQuestById(questId);
  if (!quest) {
    return;
  }
  if (state.guild.activeQuestIds.length >= state.guild.maxActiveQuests) {
    addLog("受注枠が上限です。");
    return;
  }
  state.guild.activeQuestIds.push(questId);
  quest.progressStart = createQuestProgressSnapshot(quest);
  state.guild.activeGuildQuests = [...state.guild.activeQuestIds];
  addLog(`依頼受注: ${quest.name}`);
  render();
}

function claimQuestReward(questId) {
  if (!state.guild.completedQuestIds.includes(questId) || state.guild.claimedQuestIds.includes(questId)) {
    return;
  }
  const quest = getQuestById(questId);
  if (!quest) {
    return;
  }
  state.guild.claimedQuestIds.push(questId);
  state.guild.guildQuestStats.claimed = (state.guild.guildQuestStats.claimed || 0) + 1;
  const gp = Math.floor(quest.reward.guildPoints * (1 + state.titleEffects.guildPointMultiplier));
  state.player.gold += quest.reward.gold;
  state.guild.points += gp;
  state.stats.guildPointsEarned += gp;
  state.stats.guildQuestCompleted += 1;
  addLog(`報酬受取: ${quest.name} / +${quest.reward.gold}G, +${gp}GP`);
  updateGuildRank();
  completeQuestAndRegenerate(questId);
  checkTitleUnlocks("afterQuestClaim");
  render();
}

function checkQuestCompletion() {
  refreshGuildQuests(false);
  state.guild.activeQuestIds = state.guild.activeQuestIds.filter((questId) => !!getQuestById(questId));
  state.guild.activeQuestIds.forEach((questId) => {
    const quest = getQuestById(questId);
    if (!quest) {
      return;
    }
    const progress = getQuestProgress(quest);
    if (progress.current >= progress.target && !state.guild.completedQuestIds.includes(questId)) {
      state.guild.completedQuestIds.push(questId);
      addLog(`依頼達成: ${quest.name}`);
    }
  });
  state.guild.activeGuildQuests = [...state.guild.activeQuestIds];
}

function isTownUnlockedForContent(requiredTownId) {
  if (!requiredTownId || requiredTownId === "balladore") {
    return true;
  }
  return state.unlockedTowns.includes(requiredTownId);
}

function getItemRequiredTown(itemId) {
  const eq = EQUIPMENT_DATA[itemId];
  if (eq?.unlockTown) {
    return eq.unlockTown;
  }
  const item = ITEM_DATA[itemId];
  if (item?.unlockTown) {
    return item.unlockTown;
  }
  return null;
}

function getMapBossStageId(mapId) {
  const map = MAP_DATA[mapId];
  if (!map) {
    return null;
  }
  return `${map.mapIndex}-10`;
}

function getItemShopMapId(itemId) {
  const reqTown = getItemRequiredTown(itemId);
  if (reqTown && TOWN_DATA[reqTown]?.mapId) {
    return TOWN_DATA[reqTown].mapId;
  }
  return "grassland";
}

function getItemRequiredFieldBossStage(itemId) {
  const eq = EQUIPMENT_DATA[itemId];
  if (!eq) {
    return null;
  }
  const tags = eq.specialTags || [];
  if (!tags.includes("boss_series")) {
    return null;
  }
  return getMapBossStageId(getItemShopMapId(itemId));
}

function isItemShopUnlocked(itemId) {
  const townOk = isTownUnlockedForContent(getItemRequiredTown(itemId));
  if (!townOk) {
    return false;
  }
  const requiredBossStage = getItemRequiredFieldBossStage(itemId);
  if (requiredBossStage && !state.fieldBossCleared.includes(requiredBossStage)) {
    return false;
  }
  return true;
}

function renderShopBuyView(activeRegion) {
  const itemCards = [...new Set(SHOP_ITEM_IDS)]
    .filter((itemId) => getItemShopMapId(itemId) === activeRegion)
    .map((itemId) => {
      const item = ITEM_DATA[itemId];
      if (!item) {
        return "";
      }
      const unlocked = isItemShopUnlocked(itemId);
      const own = getInventoryCount(itemId);
      const reqTown = getItemRequiredTown(itemId);
      const reqBossStage = getItemRequiredFieldBossStage(itemId);
      const buyPrice = itemId === NEVEREND_ACCESS_DATA.ticketItemId ? getNeverendTicketPrice() : item.buyPrice;
      const reqText = [
        reqTown ? `町解放: ${TOWN_DATA[reqTown]?.name || reqTown}` : null,
        reqBossStage ? `ボス解放: ${reqBossStage}` : null,
        itemId === NEVEREND_ACCESS_DATA.ticketItemId && hasClearedVolcano() ? "火山突破割引: 有効" : null
      ].filter(Boolean).join(" / ");
      const lockText = unlocked ? "購入可" : "未解放";
      const alreadyOwned = itemId === NEVEREND_ACCESS_DATA.ticketItemId && canEnterNeverend();
      const canBuy = unlocked && buyPrice > 0 && !alreadyOwned;
      return `
        <div class="shop-card">
          <h4>${item.name}</h4>
          <p class="tiny">${item.description}</p>
          <p class="tiny">カテゴリ: ${item.category}${reqText ? ` / ${reqText}` : ""}</p>
          <p class="tiny">買値: ${buyPrice} / 売値: ${Math.floor(getSellPrice(item))} / 所持: ${own}</p>
          <p class="tiny">状態: ${alreadyOwned ? "解放済み" : lockText}</p>
          <div class="title-row">
            <button class="btn shop-buy-btn" data-item-id="${item.id}" ${canBuy ? "" : "disabled"}>${alreadyOwned ? "解放済み" : "購入"}</button>
          </div>
        </div>
      `;
    })
    .join("");
  const cheatSlotCards = CHEAT_TITLE_SLOT_SHOP_OFFERS
    .filter((offer) => offer.requiredMapId === activeRegion)
    .map((offer) => {
      const purchased = !!state.cheatTitleSlotShopPurchases?.[offer.id];
      const unlocked = isCheatTitleSlotOfferUnlocked(offer);
      const canBuy = unlocked && !purchased && state.player.gold >= offer.price;
      const reqLabel = TOWN_DATA[offer.requiredTownId]?.name || offer.requiredMapId;
      const status = purchased ? "購入済み" : unlocked ? "購入可能" : `未解放 (${reqLabel} 到達で解放)`;
      return `
        <div class="shop-card">
          <h4>${offer.label}</h4>
          <p class="tiny">効果: チート称号枠 +${offer.bonus}（直接反映）</p>
          <p class="tiny">価格: ${offer.price}G</p>
          <p class="tiny">状態: ${status}</p>
          <button class="btn cheat-slot-offer-buy-btn" data-cheat-slot-offer-id="${offer.id}" ${canBuy ? "" : "disabled"}>
            ${purchased ? "購入済み" : "購入"}
          </button>
        </div>
      `;
    })
    .join("");
  const cards = `${itemCards}${cheatSlotCards}`;
  return `<div class="shop-grid">${cards || "<p class='tiny'>この地域で販売中の商品はありません。</p>"}</div>`;
}

function canSellItem(item) {
  if (!item) {
    return false;
  }
  const sellPrice = Math.floor(getSellPrice(item));
  return sellPrice > 0;
}

function renderShopSellView() {
  const cards = state.player.inventory
    .map((slot) => {
      const item = ITEM_DATA[slot.itemId];
      if (!item) {
        return "";
      }
      const sellPrice = Math.floor(getSellPrice(item));
      const sellable = canSellItem(item);
      return `
        <div class="shop-card">
          <h4>${item.nameJa || item.name || slot.itemId}</h4>
          <p class="tiny">${item.description || "説明なし"}</p>
          <p class="tiny">カテゴリ: ${item.category || "unknown"} / 所持: ${slot.quantity}</p>
          <p class="tiny">売却価格: ${sellable ? `${sellPrice}G` : "売却不可"}</p>
          <div class="title-row">
            <button class="btn shop-sell-btn" data-item-id="${item.id}" ${sellable && slot.quantity > 0 ? "" : "disabled"}>売る</button>
          </div>
        </div>
      `;
    })
    .join("");
  return `<p class="tiny">所持アイテムから1個ずつ売却できます。ショップ外では売却できません。</p><div class="shop-grid">${cards || "<p class='tiny'>売却できるアイテムがありません。</p>"}</div>`;
}

function renderShopView() {
  const activeRegion = SHOP_REGION_TABS.some((tab) => tab.id === state.guild.shopRegionTab) ? state.guild.shopRegionTab : "grassland";
  const activeMode = state.guild.shopMode === "sell" ? "sell" : "buy";
  const modeButtons = `
    <button class="btn shop-mode-tab-btn ${activeMode === "buy" ? "active" : ""}" data-shop-mode="buy">購入</button>
    <button class="btn shop-mode-tab-btn ${activeMode === "sell" ? "active" : ""}" data-shop-mode="sell">売却</button>
  `;
  const regionButtons = SHOP_REGION_TABS
    .map((tab) => `<button class="btn shop-region-tab-btn ${activeRegion === tab.id ? "active" : ""}" data-shop-region="${tab.id}">${tab.label}</button>`)
    .join("");
  const body = activeMode === "buy" ? renderShopBuyView(activeRegion) : renderShopSellView();
  return `
    <div class="title-row"><h3>ショップ</h3><div class="status-tabs">${modeButtons}</div></div>
    <p class="tiny">所持GOLD: ${state.player.gold}G</p>
    ${activeMode === "buy" ? `<div class="status-tabs">${regionButtons}</div>` : ""}
    ${body}
  `;
}

function buyItem(itemId) {
  ensureNeverendState();
  const item = ITEM_DATA[itemId];
  const buyPrice = itemId === NEVEREND_ACCESS_DATA.ticketItemId ? getNeverendTicketPrice() : item?.buyPrice;
  if (!item || buyPrice <= 0) {
    return;
  }
  if (itemId === NEVEREND_ACCESS_DATA.ticketItemId && canEnterNeverend()) {
    addLog("天空都市ネバーエンド入場券はすでに所持しています。");
    return;
  }
  const requiredTown = getItemRequiredTown(itemId);
  if (!isTownUnlockedForContent(requiredTown)) {
    addLog(`この商品は ${TOWN_DATA[requiredTown]?.name || requiredTown} 解放後に購入できます。`);
    return;
  }
  const requiredBossStage = getItemRequiredFieldBossStage(itemId);
  if (requiredBossStage && !state.fieldBossCleared.includes(requiredBossStage)) {
    addLog(`この商品は ${requiredBossStage} のボス撃破後に購入できます。`);
    return;
  }
  if (state.player.gold < buyPrice) {
    addLog(`購入失敗: ${item.name} の所持GOLDが不足。`);
    return;
  }
  state.player.gold -= buyPrice;
  addItem(itemId, 1);
  if (itemId === NEVEREND_ACCESS_DATA.ticketItemId) {
    unlockNeverendAccess({ fromTicket: true });
  }
  state.stats.totalShopTrades += 1;
  addLog(`ショップ購入: ${item.name} x1`);
  checkTitleUnlocks("afterShopTrade");
  render();
}

function sellItem(itemId, quantity = 1, options = {}) {
  const inShopSellMode = state.currentTab === "guild" && state.guild.selectedFacility === "shop" && state.guild.shopMode === "sell";
  if (!options.force && !inShopSellMode) {
    addLog("売却はショップの「売却」タブでのみ行えます。");
    return;
  }
  const item = ITEM_DATA[itemId];
  if (!item || !canSellItem(item) || getInventoryCount(itemId) <= 0) {
    return;
  }
  const qty = Math.max(1, Math.floor(quantity || 1));
  if (!removeItem(itemId, qty)) {
    return;
  }
  const sell = Math.floor(getSellPrice(item)) * qty;
  state.player.gold += Math.max(0, sell);
  state.stats.totalShopTrades += 1;
  addLog(`ショップ売却: ${item.name} x${qty} (+${sell}G)`);
  checkTitleUnlocks("afterShopTrade");
  render();
}

function getSellPrice(item) {
  const baseSell = Number.isFinite(item.sellPrice) ? item.sellPrice : Math.floor((item.buyPrice || 0) * 0.5);
  let sell = baseSell * (1 + state.titleEffects.sellPriceMultiplier);
  if (item.id === "grilledMeat" && state.titleEffects.cookedSellMultiplier > 0) {
    sell *= 1 + state.titleEffects.cookedSellMultiplier;
  }
  return sell;
}

function renderTempleView() {
  const productionButtons = Object.keys(PRODUCTION_JOB_LABELS)
    .map((job) => `<button class="btn production-select-btn ${state.player.productionJob === job ? "active" : ""}" data-production-job="${job}">${PRODUCTION_JOB_LABELS[job]}</button>`)
    .join("");
  const mainChangeUnlocked = canFreeJobChange();
  const mainButtons = Object.values(JOB_DATA.main)
    .map((job) => `<button class="btn mainjob-select-btn ${state.player.mainJobBaseId === job.id ? "active" : ""}" data-main-job-id="${job.id}" ${mainChangeUnlocked ? "" : "disabled"}>${job.name}</button>`)
    .join("");
  const subChangeUnlocked = canFreeJobChange();
  const subButtons = Object.values(JOB_DATA.main)
    .map((job) => {
      const lockedByLevel = !state.player.subJobUnlocked;
      const lockedByRule = !subChangeUnlocked && !!state.player.subJobBaseId && state.player.subJobBaseId !== job.id;
      const disabled = lockedByLevel || lockedByRule;
      return `<button class="btn subjob-select-btn ${state.player.subJobBaseId === job.id ? "active" : ""}" data-sub-job-id="${job.id}" ${disabled ? "disabled" : ""}>${job.name}</button>`;
    })
    .join("");
  const mainInfo = getBattleJobEvolutionInfo("main");
  const subInfo = getBattleJobEvolutionInfo("sub");
  const prodInfo = getProductionJobEvolutionInfo();
  const mainCurrent = getJobDataById(state.player.mainJobCurrentId || state.player.mainJobId);
  const subCurrent = getJobDataById(state.player.subJobCurrentId || state.player.subJobId);
  const prodCurrent = getJobDataById(state.player.productionJobCurrentId || state.player.productionJobBaseId || state.player.productionJob);
  const mainLineId = mainCurrent?.baseLineId;
  const subLineId = subCurrent?.baseLineId;
  const subJobGuide = !state.player.subJobUnlocked
    ? `サブジョブはレベル${JOB_SYSTEM_RULES.subJobUnlockLevel}で解放されます。`
    : !subChangeUnlocked
      ? `サブジョブはレベル${JOB_SYSTEM_RULES.subJobUnlockLevel}で解放済みです。変更はレベル${JOB_SYSTEM_RULES.freeJobChangeLevel}で解放されます。`
      : `レベル${JOB_SYSTEM_RULES.freeJobChangeLevel}到達: メイン/サブジョブを自由変更できます。`;
  const mainUnlockedSkills = mainLineId ? getUnlockedSkillNamesForLine(mainLineId).join(" / ") : "なし";
  const subUnlockedSkills = subLineId ? getUnlockedSkillNamesForLine(subLineId).join(" / ") : "なし";
  const productionJobName = prodCurrent?.nameJa || PRODUCTION_JOB_LABELS[state.player.productionJob] || state.player.productionJob;

  return `
    <h3>神殿</h3>
    <p>メインジョブ: <strong>${state.player.mainJob || "未設定"}</strong> / 段階 <strong>${state.player.mainJobTier || 1}</strong></p>
    <p class="tiny">${mainCurrent?.descriptionJa || ""}</p>
    <p class="tiny">次進化: ${mainInfo.nextJob ? `${mainInfo.nextJob.nameJa} (Lv.${mainInfo.nextJob.requiredLevel})` : "なし"} / 状態: ${mainInfo.canEvolve ? "進化可能" : "未達成"}</p>
    ${mainInfo.canEvolve ? '<button class="btn evolve-main-job-btn">メインジョブを進化する</button>' : ""}
    <p class="tiny">解放済み上位スキル(メイン系統): ${mainUnlockedSkills || "なし"}</p>
    <p>サブジョブ: <strong>${state.player.subJob || (state.player.subJobUnlocked ? "未設定" : "未解放")}</strong> / 段階 <strong>${state.player.subJobId ? state.player.subJobTier || 1 : "-"}</strong></p>
    <p class="tiny">${subCurrent?.descriptionJa || ""}</p>
    <p class="tiny">次進化: ${subInfo.nextJob ? `${subInfo.nextJob.nameJa} (Lv.${subInfo.nextJob.requiredLevel})` : "なし"} / 状態: ${subInfo.canEvolve ? "進化可能" : "未達成"}</p>
    ${subInfo.canEvolve ? '<button class="btn evolve-sub-job-btn">サブジョブを進化する</button>' : ""}
    <p class="tiny">解放済み上位スキル(サブ系統): ${subUnlockedSkills || "なし"}</p>
    <p>生産ジョブ: <strong>${productionJobName}</strong> / 段階 <strong>${state.player.productionJobTier || 1}</strong> / 生産段階 <strong>${PRODUCTION_JOB_PATHS[state.player.productionJob].stages[state.player.productionJobStage]}</strong></p>
    <p class="tiny">${prodCurrent?.descriptionJa || ""}</p>
    <p class="tiny">生産Lv ${state.player.productionJobLevel} / EXP ${state.player.productionJobExp}</p>
    <p class="tiny">次進化: ${prodInfo.nextJob ? `${prodInfo.nextJob.nameJa} (生産Lv.${prodInfo.nextJob.requiredProductionLevel})` : "なし"} / 状態: ${prodInfo.canEvolve ? "進化可能" : "未達成"}</p>
    ${prodInfo.canEvolve ? '<button class="btn evolve-production-job-btn">生産ジョブを進化する</button>' : ""}
    <p class="tiny">メインジョブ変更: レベル${JOB_SYSTEM_RULES.freeJobChangeLevel}で解放</p>
    <div class="guild-facility-grid">${mainButtons}</div>
    <div class="guild-facility-grid">${productionButtons}</div>
    <p class="tiny">${subJobGuide}</p>
    <div class="guild-facility-grid">${subButtons}</div>
  `;
}

function selectMainJobFromTemple(jobId) {
  if (!canFreeJobChange()) {
    addLog(`メインジョブ変更はレベル${JOB_SYSTEM_RULES.freeJobChangeLevel}で解放されます。`);
    return;
  }
  const job = JOB_DATA.main[jobId];
  if (!job) {
    return;
  }
  syncMainJobState(job.id, 1, job.id, true);
  initializeJobEvolutionState({ silent: true });
  const mainLineId = getJobDataById(job.id)?.baseLineId;
  state.player.equippedSkills = getUnlockedSkillIdsForLine(mainLineId).slice(0, 4);
  recalculateTitleEffects();
  refreshPlayerDerivedStats();
  addLog(`神殿: メインジョブを ${job.name} に変更しました。進化段階は1に初期化されます。`);
  render();
}

function selectProductionJob(jobName) {
  const current = state.player.productionJob;
  if (current) {
    const currentProgress = state.player.productionProgress[current] || { level: 1, exp: 0, stage: 0, crafts: 0 };
    state.player.productionProgress[current] = {
      level: state.player.productionJobLevel,
      exp: state.player.productionJobExp,
      stage: state.player.productionJobStage,
      crafts: currentProgress.crafts || 0
    };
  }
  state.player.productionJob = jobName;
  const progress = state.player.productionProgress[jobName] || { level: 1, exp: 0, stage: 0, crafts: 0 };
  state.player.productionJobLevel = progress.level;
  state.player.productionJobExp = progress.exp;
  state.player.productionJobStage = progress.stage;
  syncProductionJobEvolutionState(jobName, 1, jobName);
  refreshJobEvolutionFlags();
  state.stats.productionJobHistory[jobName] = (state.stats.productionJobHistory[jobName] || 0) + 1;
  addLog(`神殿: 生産ジョブを ${PRODUCTION_JOB_LABELS[jobName] || jobName} に設定しました。進化段階は1に初期化されます。`);
  render();
}

function selectSubJob(jobId) {
  if (!state.player.subJobUnlocked) {
    addLog(`サブジョブはレベル${JOB_SYSTEM_RULES.subJobUnlockLevel}で解放されます。`);
    return;
  }
  if (!canFreeJobChange() && state.player.subJobId && state.player.subJobId !== jobId) {
    addLog(`サブジョブ変更はレベル${JOB_SYSTEM_RULES.freeJobChangeLevel}で解放されます。`);
    return;
  }
  const job = JOB_DATA.main[jobId];
  if (!job) {
    return;
  }
  syncSubJobState(job.id, 1, job.id);
  refreshJobEvolutionFlags();
  refreshPlayerDerivedStats();
  addLog(`神殿: サブジョブを ${job.name} に設定しました。進化段階は1です。`);
  render();
}

function isProductionWorkshopContext() {
  return (
    state.currentTab === "guild" &&
    state.guild.selectedFacility === "workshop" &&
    !isNeverendTownActive() &&
    !!PRODUCTION_JOB_PATHS[state.player.productionJob]
  );
}

function recordProductionWorkshopButtonPress() {
  if (!isProductionWorkshopContext()) {
    return;
  }
  state.stats.productionWorkshopButtonPressCount = (state.stats.productionWorkshopButtonPressCount || 0) + 1;
  checkTitleUnlocks("workshopAction");
}

function renderWorkshopLayout() {
  return `
    <div class="workshop-layout">
      ${renderWorkshopView()}
    </div>
  `;
}

function renderWorkshopView() {
  const recipePane = renderRecipeList();
  const jobInfoPane = renderProductionJobInfo();
  const equipIds = state.player.inventory
    .filter((slot) => ["weapon", "armor", "accessory"].includes(ITEM_DATA[slot.itemId]?.category))
    .map((slot) => slot.itemId)
    .sort((a, b) => {
      const af = isEquipmentFavorited(a) ? 1 : 0;
      const bf = isEquipmentFavorited(b) ? 1 : 0;
      if (af !== bf) return bf - af;
      return getEquipmentDisplayName(a).localeCompare(getEquipmentDisplayName(b), "ja");
    });
  const enhanceCards =
    equipIds.length > 0
      ? equipIds
          .map((itemId) => {
            const lv = getEnhanceLevel(itemId);
            const cap = getEnhanceMaxLevel(itemId);
            const capReached = isEnhanceCapReached(itemId);
            const cost = getEnhanceCost(itemId);
            const rate = Math.floor(getEnhanceSuccessRate(itemId) * 100);
            const fav = isEquipmentFavorited(itemId);
            const titleEnhanceBonusPct = Math.floor((state.titleEffects.enhanceSuccessBonus || 0) * 1000) / 10;
            const smithEnhanceBonusPct = Math.floor((state.titleEffects.smithEnhanceBonus || 0) * 1000) / 10;
            const current = getEnhancedEquipmentStats(createEquipmentInstanceFromItemId(itemId));
            const next = getEnhancedEquipmentStats({ ...(createEquipmentInstanceFromItemId(itemId) || {}), enhanceLevel: lv + 1 });
            const changedKeys = ["attack", "defense", "hp", "mp", "speed", "intelligence", "luck"]
              .filter((key) => Math.floor(next?.finalStats?.[key] || 0) !== Math.floor(current?.finalStats?.[key] || 0))
              .map((key) => {
                const before = Math.floor(current?.finalStats?.[key] || 0);
                const after = Math.floor(next?.finalStats?.[key] || 0);
                return `${key.toUpperCase()} ${before}→${after}`;
              })
              .join(" / ");
            const capText = Number.isFinite(cap) ? `${lv}/${cap}` : `${lv}/∞`;
            return `<div class="shop-card"><h4>${getEquipmentDisplayName(itemId)}</h4><p class="tiny">強化段階: ${capText}</p><p class="tiny">費用: ${cost} / 成功率: ${rate}%</p><p class="tiny">成功率補正: 称号+${titleEnhanceBonusPct}% / 鍛冶+${smithEnhanceBonusPct}%</p><p class="tiny">${changedKeys || "強化で変化なし"}</p><div class="title-row"><button class="btn equipment-favorite-btn ${fav ? "active" : ""}" data-equipment-favorite-id="${itemId}">${fav ? "★" : "☆"}</button><button class="btn enhance-btn" data-item-id="${itemId}" ${state.player.gold >= cost && !capReached ? "" : "disabled"}>${capReached ? "上限到達" : "強化"}</button></div></div>`;
          })
          .join("")
      : "<p class='tiny'>強化できる装備がありません。</p>";

  return `
    <h3>工房</h3>
    <p class="tiny">お気に入り(☆)装備は強化候補の上部に固定されます。</p>
    <div class="status-tabs">
      <button class="btn workshop-tab-btn ${state.guild.workshopTab === "craft" ? "active" : ""}" data-workshop-tab="craft">生産</button>
      <button class="btn workshop-tab-btn ${state.guild.workshopTab === "enhance" ? "active" : ""}" data-workshop-tab="enhance">強化</button>
      <button class="btn workshop-tab-btn ${state.guild.workshopTab === "recipes" ? "active" : ""}" data-workshop-tab="recipes">レシピ一覧</button>
      <button class="btn workshop-tab-btn ${state.guild.workshopTab === "jobInfo" ? "active" : ""}" data-workshop-tab="jobInfo">生産職情報</button>
    </div>
    ${
      state.guild.workshopTab === "craft"
        ? recipePane
        : state.guild.workshopTab === "enhance"
        ? `<div class="shop-grid">${enhanceCards}</div>`
        : state.guild.workshopTab === "recipes"
        ? renderRecipeList(true)
        : jobInfoPane
    }
    <div style="margin-top:10px;"><button id="gather-materials-btn" class="btn">採取する</button></div>
  `;
}

function renderRecipeList(showAll = false) {
  const pType = PRODUCTION_JOB_PATHS[state.player.productionJob]?.type || "alchemy";
  const stage = state.player.productionJobStage || 0;
  const list = RECIPE_DATA.filter((recipe) => (showAll ? true : recipe.productionType === pType));
  const cards = list
    .map((recipe) => {
      const unlockTownOk = isTownUnlockedForContent(recipe.requiredTown);
      const unlockBossOk =
        !recipe.requiredBossStage ||
        state.fieldBossCleared.includes(recipe.requiredBossStage) ||
        (recipe.unlockMaterial && getInventoryCount(recipe.unlockMaterial) > 0);
      const unlocked = stage >= recipe.requiredStage && unlockTownOk && unlockBossOk;
      const materialText = recipe.materials
        .map((m) => {
          const owned = getInventoryCount(m.itemId);
          const ok = owned >= m.qty;
          return `${ITEM_DATA[m.itemId]?.name || m.itemId} ${owned}/${m.qty}${ok ? "" : " (不足)"}`;
        })
        .join(" / ");
      const rates = rollCraftResult(recipe, state.player, true);
      const cost = Math.floor(recipe.goldCost * (1 - state.titleEffects.workshopCostReduction));
      return `
        <div class="shop-card">
          <h4>${recipe.name}</h4>
          <p class="tiny">${recipe.description}</p>
          <p class="tiny">必要段階: ${recipe.requiredStage + 1}${recipe.requiredTown ? ` / 必要地域: ${TOWN_DATA[recipe.requiredTown]?.name || recipe.requiredTown}` : ""}${recipe.requiredBossStage ? ` / 必要撃破: ${recipe.requiredBossStage}` : ""}${recipe.unlockMaterial ? ` / 解放素材: ${ITEM_DATA[recipe.unlockMaterial]?.name || recipe.unlockMaterial}` : ""} / 素材: ${materialText || "なし"} / 費用: ${cost}</p>
          <p class="tiny">成功 ${Math.floor(rates.success * 100)}% / 大成功 ${Math.floor(rates.great * 100)}% / 高品質 ${Math.floor(rates.high * 100)}% / 神品質 ${Math.floor(rates.god * 100)}%</p>
          ${
            unlocked
              ? `<div class="title-row"><button class="btn craft-btn" data-recipe-id="${recipe.id}">1回</button><button class="btn craft-batch-btn" data-recipe-id="${recipe.id}" data-craft-qty="5">5回</button><button class="btn craft-batch-btn" data-recipe-id="${recipe.id}" data-craft-qty="10">10回</button></div>`
              : "<p class='tiny'>未解放レシピ</p>"
          }
        </div>
      `;
    })
    .join("");
  return `<div class="shop-grid">${cards || "<p class='tiny'>レシピなし</p>"}</div>`;
}

function renderProductionJobInfo() {
  const path = PRODUCTION_JOB_PATHS[state.player.productionJob];
  const evo = getJobDataById(state.player.productionJobCurrentId || state.player.productionJobBaseId || state.player.productionJob);
  const stageName = path.stages[state.player.productionJobStage] || path.stages[0];
  const nextReq = PRODUCTION_STAGE_REQUIREMENTS[Math.min(path.stages.length - 1, state.player.productionJobStage + 1)];
  const currentCrafts = state.player.productionProgress[state.player.productionJob]?.crafts || 0;
  return `
    <div class="card">
      <h4>${evo?.nameJa || state.player.productionJob} (${path.type})</h4>
      <p>進化段階: Tier ${state.player.productionJobTier || 1} / 次進化条件: 生産Lv ${getProductionJobEvolutionInfo().nextJob?.requiredProductionLevel || "-"}</p>
      <p>段階: ${stageName} (${state.player.productionJobStage + 1}/${path.stages.length})</p>
      <p>生産Lv: ${state.player.productionJobLevel} / EXP: ${state.player.productionJobExp} / 次Lv: ${productionExpToNextLevel()}</p>
      <p class="tiny">次段階条件: Lv${nextReq?.level ?? "-"} / 生産回数${nextReq?.crafts ?? "-"}回</p>
      <p class="tiny">この職の生産回数: ${currentCrafts}</p>
      <p class="tiny">累計生産EXP: ${state.stats.totalCraftExp}</p>
      <p class="tiny">品質統計: 成功 ${state.stats.craftSuccessCount} / 失敗 ${state.stats.craftFailureCount} / 大成功 ${state.stats.craftGreatSuccessCount} / 高品質 ${state.stats.craftHighQualityCount} / 神品質 ${state.stats.craftGodQualityCount}</p>
    </div>
  `;
}

function craftRecipe(recipeId, quantity = 1) {
  const recipe = RECIPE_DATA.find((r) => r.id === recipeId);
  if (!recipe) {
    return;
  }
  const pType = PRODUCTION_JOB_PATHS[state.player.productionJob]?.type;
  if (recipe.productionType !== pType) {
    addLog("現在の生産職ではこのレシピを作成できません。");
    return;
  }
  if (state.player.productionJobStage < recipe.requiredStage) {
    addLog("生産職段階が不足しています。");
    return;
  }
  if (!isTownUnlockedForContent(recipe.requiredTown)) {
    addLog("必要地域に到達していないため作成できません。");
    return;
  }
  if (
    recipe.requiredBossStage &&
    !state.fieldBossCleared.includes(recipe.requiredBossStage) &&
    !(recipe.unlockMaterial && getInventoryCount(recipe.unlockMaterial) > 0)
  ) {
    addLog("必要な地域ボスを撃破していないため作成できません。");
    return;
  }
  for (let i = 0; i < quantity; i += 1) {
    const actualCost = Math.floor(recipe.goldCost * (1 - state.titleEffects.workshopCostReduction));
    if (!canCraftRecipe({ ...recipe, costGold: actualCost })) {
      if (i === 0) {
        addLog("生産失敗: 素材またはGOLDが不足しています。");
      }
      break;
    }
    state.player.gold -= actualCost;
    recipe.materials.forEach((m) => removeItem(m.itemId, m.qty));
    const result = rollCraftResult(recipe, state.player, false);
    applyCraftQuality(result, recipe);
    applyQualityMaterialRefund(recipe, result);
  }
  checkProductionRelatedTitles();
  refreshPlayerDerivedStats();
  renderPreservingWindowScroll();
}

function craftItem(recipeId) {
  craftRecipe(recipeId, 1);
}

function craftEquipment(itemId) {
  const recipe = RECIPE_DATA.find((r) => r.resultItemId === itemId && r.productionType === "smith");
  if (!recipe) {
    addLog("この装備は工房で作成できません。");
    return;
  }
  craftRecipe(recipe.id, 1);
}

function rollCraftResult(recipe, playerData, onlyRate = false) {
  const bonus = getProductionBonuses(recipe.productionType);
  const success = clamp(0.05, 0.995, recipe.baseSuccessRate + bonus.successRate);
  const great = clamp(0, 0.95, recipe.greatSuccessRate + bonus.greatRate);
  const high = clamp(0, 0.9, recipe.highQualityRate + bonus.highRate);
  const god = clamp(0, 0.3, recipe.godQualityRate + bonus.godRate);
  if (onlyRate) {
    return { success, great, high, god };
  }
  const roll = Math.random();
  if (roll > success) {
    return { quality: "failure", amount: 1, expGain: Math.floor(recipe.expGain * 0.4) };
  }
  let quality = "normal";
  const qualityRoll = Math.random();
  if (qualityRoll < god) quality = "god";
  else if (qualityRoll < god + high) quality = "high";
  else if (qualityRoll < god + high + great) quality = "great";
  if (Math.random() < state.titleEffects.qualityStepUpChance) {
    if (quality === "normal") quality = "great";
    else if (quality === "great") quality = "high";
    else if (quality === "high") quality = "god";
  }
  let amount = quality === "great" ? 2 : 1;
  if (Math.random() < state.titleEffects.extraCraftChance) {
    amount += 1;
  }
  if (recipe.tags.includes("potion") && Math.random() < state.titleEffects.potionCraftBonusChance) {
    amount += 1;
  }
  if (recipe.tags.includes("potion") && state.titleEffects.alchemyEffectBonus > 0 && Math.random() < state.titleEffects.alchemyEffectBonus) {
    amount += 1;
  }
  return {
    quality,
    amount,
    expGain:
      recipe.expGain +
      (quality === "god" ? recipe.expGain : quality === "high" ? Math.floor(recipe.expGain * 0.5) : quality === "great" ? Math.floor(recipe.expGain * 0.25) : 0)
  };
}

function applyCraftQuality(result, recipe) {
  const currentJob = state.player.productionJob;
  const progress = state.player.productionProgress[currentJob] || { level: 1, exp: 0, stage: 0, crafts: 0 };
  progress.crafts = (progress.crafts || 0) + 1;
  state.player.productionProgress[currentJob] = progress;
  state.stats.totalCrafts += 1;
  state.stats.totalCraftsLifetime += 1;
  state.stats.craftCountByRecipe[recipe.id] = (state.stats.craftCountByRecipe[recipe.id] || 0) + 1;
  state.stats.craftCountByType[recipe.productionType] = (state.stats.craftCountByType[recipe.productionType] || 0) + 1;
  if (recipe.productionType === "alchemy") state.stats.alchemyCraftCount += 1;
  if (recipe.productionType === "smith") state.stats.smithCraftCount += 1;
  if (recipe.productionType === "cooking") state.stats.cookingCraftCount += 1;

  if (result.quality === "failure") {
    state.stats.craftFailureCount += 1;
    state.stats.craftFailures += 1;
    if (recipe.productionType === "cooking") {
      state.stats.cookingFailureCount += 1;
      addItem("failedDish", 1);
      addLog("料理失敗: 焦げた料理ができた。");
    } else {
  addLog(`生産失敗: ${recipe.name}`);
    }
    gainProductionExp(Math.max(1, Math.floor(result.expGain * 0.5)));
    return;
  }

  state.stats.craftSuccessCount += 1;
  if (result.quality === "great") state.stats.craftGreatSuccessCount += 1;
  if (result.quality === "high") state.stats.craftHighQualityCount += 1;
  if (result.quality === "god") {
    state.stats.craftGodQualityCount += 1;
    state.stats.godQualityCraftCount += 1;
  }
  const instance = createCraftedItemInstance(recipe.resultItemId, result.quality);
  addItem(instance.id, result.amount);
  state.stats.producedItemCounts[recipe.resultItemId] = (state.stats.producedItemCounts[recipe.resultItemId] || 0) + result.amount;
  addLog(`生産成功[${result.quality}]: ${instance.name} x${result.amount}`);
  gainProductionExp(result.expGain);
}

function applyQualityMaterialRefund(recipe, result) {
  if (!recipe || !result) {
    return;
  }
  if (!["great", "high", "god"].includes(result.quality)) {
    return;
  }
  const refundChance = clamp(0, 0.9, state.titleEffects.qualityMaterialRefundChance || 0);
  if (refundChance <= 0 || Math.random() >= refundChance) {
    return;
  }
  const materials = (recipe.materials || []).filter((m) => m.qty > 0);
  if (!materials.length) {
    return;
  }
  const pick = materials[Math.floor(Math.random() * materials.length)];
  addItem(pick.itemId, 1);
  addLog(`残業効果: ${ITEM_DATA[pick.itemId]?.name || pick.itemId} を1個節約した。`);
}

function gainProductionExp(amount) {
  const pJob = getJobDataById(state.player.productionJobCurrentId || state.player.productionJobBaseId || state.player.productionJob);
  const expMul = 1 + (pJob?.productionBonus?.productionExpRate || 0) + (state.titleEffects.productionExpRateBonus || 0);
  const gained = Math.max(1, Math.floor(amount * expMul));
  state.player.productionJobExp += gained;
  state.stats.totalCraftExp += gained;
  while (state.player.productionJobExp >= productionExpToNextLevel()) {
    state.player.productionJobExp -= productionExpToNextLevel();
    state.player.productionJobLevel += 1;
    addLog(`生産Lvアップ: ${state.player.productionJobLevel}`);
  }
  refreshJobEvolutionFlags();
  if (state.jobEvolutionFlags.production.canEvolve) {
    addLog("神殿で生産ジョブ進化が可能です。");
  }
  checkProductionStageUp();
  state.player.productionProgress[state.player.productionJob] = {
    level: state.player.productionJobLevel,
    exp: state.player.productionJobExp,
    stage: state.player.productionJobStage,
    crafts: state.player.productionProgress[state.player.productionJob]?.crafts || 0
  };
  checkTitleUnlocks("afterProductionExp");
}

function checkProductionStageUp() {
  const path = PRODUCTION_JOB_PATHS[state.player.productionJob];
  if (!path) {
    return;
  }
  const currentCrafts = state.player.productionProgress[state.player.productionJob]?.crafts || 0;
  while (state.player.productionJobStage < path.stages.length - 1) {
    const nextStage = state.player.productionJobStage + 1;
    const req = PRODUCTION_STAGE_REQUIREMENTS[nextStage];
    if (!req) {
      break;
    }
    if (state.player.productionJobLevel >= req.level && currentCrafts >= req.crafts) {
      state.player.productionJobStage = nextStage;
      addLog(`生産職段階アップ: ${path.stages[nextStage]}`);
    } else {
      break;
    }
  }
}

function getProductionBonuses(productionType) {
  const stage = state.player.productionJobStage || 0;
  const level = state.player.productionJobLevel || 1;
  const pJob = getJobDataById(state.player.productionJobCurrentId || state.player.productionJobBaseId || state.player.productionJob);
  const evo = pJob?.productionBonus || {};
  const bonus = {
    successRate:
      stage * 0.015 +
      Math.floor(level / 20) * 0.01 +
      state.titleEffects.craftSuccessBonus +
      Math.min(0.08, state.loop.loopCount * BALANCE_CONFIG.crafting.perLoopSuccessBonus) +
      (evo.craftSuccessRate || 0),
    greatRate: stage * 0.008 + (productionType === "cooking" ? state.titleEffects.cookGreatSuccessRateBonus : 0),
    highRate: stage * 0.01 + (evo.highQualityRate || 0),
    godRate:
      stage >= 3
        ? 0.002 + stage * 0.001 + Math.min(0.02, state.loop.loopCount * BALANCE_CONFIG.crafting.perLoopGodBonus) + (evo.divineQualityRate || 0)
        : (evo.divineQualityRate || 0) * 0.5
  };
  if (productionType === "smith") {
    bonus.highRate += 0.02;
    bonus.godRate += 0.002;
  }
  if (productionType === "alchemy") {
    bonus.successRate += 0.02;
  }
  if (productionType === "cooking") {
    bonus.greatRate += 0.02;
  }
  return bonus;
}

function gatherMaterials(regionId = state.currentMap) {
  const table = REGION_GATHER_TABLE[regionId] || REGION_GATHER_TABLE.grassland;
  const pick = weightedPick(table);
  addItem(pick.itemId, 1);
  state.stats.totalGatheredMaterials += 1;
  state.stats.gatheredMaterialCounts[pick.itemId] = (state.stats.gatheredMaterialCounts[pick.itemId] || 0) + 1;
  addLog(`採取: ${ITEM_DATA[pick.itemId]?.name || pick.itemId} を入手。`);
  checkTitleUnlocks("afterGather");
  render();
}

function weightedPick(table) {
  const sum = table.reduce((acc, row) => acc + row.weight, 0);
  let roll = Math.random() * sum;
  for (const row of table) {
    roll -= row.weight;
    if (roll <= 0) {
      return row;
    }
  }
  return table[0];
}

function checkProductionRelatedTitles() {
  checkTitleUnlocks("afterCraft");
  checkTitleUnlocks("afterEnhance");
}

function createCraftedItemInstance(baseItemId, quality) {
  if (quality === "normal") {
    return { id: baseItemId, name: ITEM_DATA[baseItemId]?.name || baseItemId, quality };
  }
  const baseEq = EQUIPMENT_DATA[baseItemId];
  if (baseEq) {
    const id = `${baseItemId}__${quality}`;
    if (!EQUIPMENT_DATA[id]) {
      const mult = quality === "great" ? 1.08 : quality === "high" ? 1.18 : 1.35;
      const tag = quality === "god" ? "god_quality" : quality === "high" ? "high_quality" : "great_success";
      EQUIPMENT_DATA[id] = {
        ...baseEq,
        id,
        name: `${baseEq.name}[${quality}]`,
        attack: Math.floor(baseEq.attack * mult),
        defense: Math.floor(baseEq.defense * mult),
        speed: Math.floor(baseEq.speed * mult),
        intelligence: Math.floor(baseEq.intelligence * mult),
        luck: Math.floor(baseEq.luck * mult),
        hp: Math.floor(baseEq.hp * mult),
        mp: Math.floor(baseEq.mp * mult),
        specialTags: [...new Set([...(baseEq.specialTags || []), "crafted_bonus", tag])]
      };
      ITEM_DATA[id] = {
        id,
        name: EQUIPMENT_DATA[id].name,
        category: baseEq.category,
        description: `${baseEq.description} (${quality})`,
        buyPrice: 0,
        sellPrice: Math.floor((baseEq.sellPrice || 0) * mult)
      };
    }
    return { id, name: EQUIPMENT_DATA[id].name, quality };
  }
  const id = `${baseItemId}__${quality}`;
  if (!ITEM_DATA[id]) {
    const base = ITEM_DATA[baseItemId];
    ITEM_DATA[id] = {
      ...base,
      id,
      name: `${base?.name || baseItemId}[${quality}]`,
      sellPrice: Math.floor((base?.sellPrice || 0) * (quality === "god" ? 2 : quality === "high" ? 1.5 : 1.2))
    };
  }
  return { id, name: ITEM_DATA[id].name, quality };
}

function enhanceItem(itemId) {
  if (getInventoryCount(itemId) <= 0) {
    return;
  }
  if (isEnhanceCapReached(itemId)) {
    const cap = getEnhanceMaxLevel(itemId);
    const capText = Number.isFinite(cap) ? cap : "∞";
    addLog(`強化不可: ${ITEM_DATA[itemId]?.name || itemId} は現在の強化上限(+${capText})に到達しています。`);
    return;
  }
  const cost = getEnhanceCost(itemId);
  if (state.player.gold < cost) {
    addLog("強化失敗: GOLD不足。");
    return;
  }
  state.player.gold -= cost;
  state.stats.totalEnhances += 1;
  state.stats.totalEnhancesLifetime += 1;
  state.stats.smithEnhanceCount += 1;
  const enhanceCategory = EQUIPMENT_DATA[itemId]?.category;
  if (enhanceCategory === "weapon") {
    state.stats.weaponEnhanceCount = (state.stats.weaponEnhanceCount || 0) + 1;
  } else if (enhanceCategory === "armor") {
    state.stats.armorEnhanceCount = (state.stats.armorEnhanceCount || 0) + 1;
  }
  const isSmith = PRODUCTION_JOB_PATHS[state.player.productionJob]?.type === "smith";
  const success = Math.random() <= getEnhanceSuccessRate(itemId);
  const enhanceLevel = (state.player.equipmentEnhancements[itemId] || 0) + (success ? 1 : 0);
  const buildKey = `${itemId}_lv${Math.floor(enhanceLevel / 3)}`;
  state.stats.equipmentBuildHistory[buildKey] = (state.stats.equipmentBuildHistory[buildKey] || 0) + 1;
  if (success) {
    state.player.equipmentEnhancements[itemId] = (state.player.equipmentEnhancements[itemId] || 0) + 1;
    if (EQUIPMENT_DATA[itemId]) {
      EQUIPMENT_DATA[itemId].enhanceLevel = state.player.equipmentEnhancements[itemId];
    }
    state.stats.enhanceSuccessCount += 1;
    const detail = getEnhancedEquipmentStats(createEquipmentInstanceFromItemId(itemId));
    addLog(`強化成功: ${getEquipmentDisplayName(itemId)}`);
    if (detail) {
      console.log("[enhance-debug]", itemId, {
        baseStats: detail.baseStats,
        qualityBonus: detail.qualityBonus,
        enhancementBonus: detail.enhancementBonus,
        finalStats: detail.finalStats
      });
    }
  } else {
    addLog(`強化失敗: ${ITEM_DATA[itemId]?.name || itemId} の強化に失敗しました。`);
  }
  if (isSmith) {
    gainProductionExp(6);
  }
  checkProductionRelatedTitles();
  refreshPlayerDerivedStats();
  render();
}

function enhanceEquipment(itemId) {
  enhanceItem(itemId);
}

function canCraftRecipe(recipe) {
  const cost = recipe.costGold ?? recipe.goldCost ?? 0;
  if (state.player.gold < cost) {
    return false;
  }
  return recipe.materials.every((m) => getInventoryCount(m.itemId) >= m.qty);
}

function getEnhanceCost(itemId) {
  const lv = getEnhanceLevel(itemId);
  const base = 20 + lv * 15;
  return Math.max(1, Math.floor(base * (1 - state.titleEffects.enhanceCostReduction - state.titleEffects.workshopCostReduction)));
}

function getEnhanceSuccessRate(itemId) {
  const lv = getEnhanceLevel(itemId);
  if (isEnhanceCapReached(itemId)) {
    return 0;
  }
  return clamp(0.35, 0.98, 0.85 - lv * 0.08 + state.titleEffects.enhanceSuccessBonus + state.titleEffects.smithEnhanceBonus);
}

function updateGuildRank(options = {}) {
  const silent = options.silent === true;
  const refreshOnChange = options.refreshOnChange !== false;
  const old = normalizeGuildRank(state.guild.rank);
  let pointsRank = "D";
  GUILD_RANK_THRESHOLDS.forEach((row) => {
    if (state.guild.points >= row.required) {
      pointsRank = row.rank;
    }
  });
  const progressCap = getMaxGuildRankByProgress();
  let current = pointsRank;
  if (guildRankScore(current) > guildRankScore(progressCap)) {
    current = progressCap;
  }
  state.guild.rank = current;
  syncGuildRankTitleSlotBonus(current);
  const cappedByRegion = guildRankScore(pointsRank) > guildRankScore(progressCap);
  const nextFromCap = getNextGuildRank(progressCap);
  const capNoticeKey = cappedByRegion && nextFromCap ? `${progressCap}->${nextFromCap}` : "";
  if (!silent && cappedByRegion && capNoticeKey && state.guild.lastRankCapNoticeKey !== capNoticeKey) {
    const unlockRegionId = getRankUnlockRegionForRank(nextFromCap);
    addLog(`地域到達条件でランク上限中: ${progressCap}（${MAP_DATA[unlockRegionId]?.name || unlockRegionId} 到達で ${nextFromCap} 解放）`);
  }
  state.guild.lastRankCapNoticeKey = capNoticeKey;
  if (current !== old) {
    if (!silent) {
      addLog(`ギルドランクアップ: ${old} -> ${current}`);
    }
    recalculateTitleSlotCaps();
    normalizeEquippedTitleSlots({ logOnTrim: !silent });
    if (refreshOnChange) {
      refreshGuildQuestsForCurrentTown(true);
    }
  }
  return current;
}

function evaluateBoardCondition(condition) {
  if (!condition) {
    return true;
  }
  if (Array.isArray(condition.all)) {
    return condition.all.every((c) => evaluateBoardCondition(c));
  }
  if (Array.isArray(condition.any)) {
    return condition.any.some((c) => evaluateBoardCondition(c));
  }
  if (condition.minStage && !isStageReached(condition.minStage)) {
    return false;
  }
  if (condition.unlockedTown && !state.unlockedTowns.includes(condition.unlockedTown)) {
    return false;
  }
  if (condition.fieldBossCleared && !state.fieldBossCleared.includes(condition.fieldBossCleared)) {
    return false;
  }
  if (condition.loopAtLeast && state.loop.loopCount < condition.loopAtLeast) {
    return false;
  }
  if (condition.titleId && !state.unlockedTitles.includes(condition.titleId)) {
    return false;
  }
  if (Array.isArray(condition.titleAny) && !condition.titleAny.some((id) => state.unlockedTitles.includes(id))) {
    return false;
  }
  if (condition.uniqueEncounterAtLeast && (state.stats.uniqueEncounterCount || 0) < condition.uniqueEncounterAtLeast) {
    return false;
  }
  if (condition.uniqueKillAtLeast && (state.stats.uniqueKillCount || 0) < condition.uniqueKillAtLeast) {
    return false;
  }
  if (condition.uniqueTypesAtLeast && (state.uniqueDefeatedIds || []).length < condition.uniqueTypesAtLeast) {
    return false;
  }
  if (condition.totalCraftsAtLeast && (state.stats.totalCrafts || 0) < condition.totalCraftsAtLeast) {
    return false;
  }
  if (condition.craftFailureAtLeast && (state.stats.craftFailureCount || 0) < condition.craftFailureAtLeast) {
    return false;
  }
  if (condition.godQualityAtLeast && (state.stats.godQualityCraftCount || 0) < condition.godQualityAtLeast) {
    return false;
  }
  if (condition.speedUnlockedAtLeast && Math.max(1, ...state.unlockedBattleSpeedOptions) < condition.speedUnlockedAtLeast) {
    return false;
  }
  if (condition.titleLimitAtLeast && getCurrentTitleLimit() < condition.titleLimitAtLeast) {
    return false;
  }
  if (condition.featureUnlocked && !isFeatureUnlocked(condition.featureUnlocked)) {
    return false;
  }
  if (condition.specialChallengeClearAtLeast && (state.stats.loopChallengeClearCount || 0) < condition.specialChallengeClearAtLeast) {
    return false;
  }
  if (condition.endingEligible === "true" && !state.trueEndEligible) {
    return false;
  }
  if (condition.endingEligible === "hidden" && !state.hiddenEndEligible) {
    return false;
  }
  if (condition.endingEligible === "chaos" && !state.chaosEndEligible) {
    return false;
  }
  if (condition.finalContentUnlocked && !state.finalContentUnlocked) {
    return false;
  }
  if (condition.worldStateFlag && !state.worldStateFlags?.[condition.worldStateFlag]) {
    return false;
  }
  if (condition.storyFragment) {
    const flagKey = `story_fragment_${condition.storyFragment}`;
    if (!state.worldStateFlags?.[flagKey]) {
      return false;
    }
  }
  if (condition.unlockedEnding && !state.unlockedEndings.includes(condition.unlockedEnding)) {
    return false;
  }
  if (condition.stageDefeatsAtLeast) {
    const rule = condition.stageDefeatsAtLeast;
    const stageId = typeof rule === "string" ? rule : rule.stageId;
    const minDefeats = Math.max(1, Number(typeof rule === "number" ? rule : rule.count) || 1);
    if (!stageId || (state.stats.defeatsByStage?.[stageId] || 0) < minDefeats) {
      return false;
    }
  }
  if (condition.boardReadAtLeast && (state.stats.boardThreadReadCount || 0) < condition.boardReadAtLeast) {
    return false;
  }
  if (condition.buildTag && !(state.runtime.buildTags || []).includes(condition.buildTag)) {
    return false;
  }
  if (Array.isArray(condition.buildTagAny) && !condition.buildTagAny.some((tag) => (state.runtime.buildTags || []).includes(tag))) {
    return false;
  }
  return true;
}

function getStoryFragmentFlagKey(fragmentId) {
  return `story_fragment_${fragmentId}`;
}

function getUnlockedStoryFragmentIds() {
  return Object.keys(STORY_FRAGMENTS).filter((id) => !!state.worldStateFlags?.[getStoryFragmentFlagKey(id)]);
}

function unlockStoryFragment(fragmentId, options = {}) {
  const fragment = STORY_FRAGMENTS[fragmentId];
  if (!fragment) return false;
  const flagKey = getStoryFragmentFlagKey(fragmentId);
  if (state.worldStateFlags?.[flagKey]) {
    return false;
  }
  state.worldStateFlags = { ...(state.worldStateFlags || {}), [flagKey]: true };
  if (!options.silent) {
    addLog(`物語断片解放: ${fragment.title} / ${fragment.logText}`, "important", { important: true });
  }
  return true;
}

function syncStoryProgress(options = {}) {
  const silent = !!options.silent;
  const skipBoardRefresh = !!options.skipBoardRefresh;
  let unlockedAny = false;
  Object.entries(STORY_UNLOCK_CONDITIONS).forEach(([fragmentId, condition]) => {
    if (evaluateBoardCondition(condition)) {
      if (unlockStoryFragment(fragmentId, { silent })) {
        unlockedAny = true;
      }
    }
  });
  if ((state.uniqueDefeatedIds || []).length >= 7 && !state.worldStateFlags?.otherworldThreatAwakened) {
    state.worldStateFlags = { ...(state.worldStateFlags || {}), otherworldThreatAwakened: true };
    if (!silent) {
      addLog("異変: 世界の均衡が崩壊し、異界由来の脈動が観測された。", "important", { important: true });
      showCenterPopup({ text: "異変発生: 異界の怪物の兆候", type: "important" });
    }
  }
  if (unlockedAny && !skipBoardRefresh) {
    unlockBoardThreadsFromProgress();
    state.board.threads = getVisibleBoardThreads();
  }
  return unlockedAny;
}

function resolveThreadVariant(thread, currentState = state) {
  const maxSpeed = Math.max(1, ...(currentState.unlockedBattleSpeedOptions || [1]));
  const uniqueCount = (currentState.uniqueDefeatedIds || []).length;
  const loopCount = currentState.loop.loopCount || 0;
  const variants = {
    timer_meta: () => {
      if (maxSpeed >= 5) return { title: "5倍速の向こう側、見えた？", extraResponses: [{ author: "時計の民", body: "5xは便利だけど、戦闘ログの予兆を見落とすな。", tone: "hint", isHint: true }] };
      if (maxSpeed >= 3) return { title: "時間の表示押してたら世界が加速した", extraResponses: [{ author: "時計の民", body: "3x以上はもう別ゲー。周回勢の入口。", tone: "loop" }] };
      return { title: thread.title, extraResponses: [] };
    },
    unique_hunt: () => ({
      title: uniqueCount >= 7 ? "七体討伐報告会場" : thread.title,
      extraResponses: [{ author: "七体目未発見", body: `ユニーク進捗 ${uniqueCount}/7。運よりも試行回数。`, tone: "hint", isHint: true }]
    }),
    production_hype: () => {
      if ((currentState.stats.godQualityCraftCount || 0) > 0) {
        return { title: "神品質って都市伝説じゃなかった", extraResponses: [{ author: "神品質まだ？", body: `神品質作成回数: ${currentState.stats.godQualityCraftCount}。`, tone: "legend" }] };
      }
      return { title: thread.title, extraResponses: [] };
    },
    dual_focus: () => ({
      title: (currentState.runtime.buildTags || []).includes("dual_wield") ? "二刀流ってロマン枠？ ガチ枠？【現役二刀勢】" : thread.title,
      extraResponses: [{ author: "剣しか勝たん", body: "2本目の減衰を前提に、特殊タグ重視で選ぶと伸びる。", tone: "hint", isHint: true }]
    }),
    firsttrap_meta: () => ({
      title: (currentState.stats.firstTryBossWins || 0) >= 3 ? "初見殺し突破者、実在した" : thread.title,
      extraResponses: [{ author: "不遇職警察", body: "初見突破は予兆ログを読む癖だけで勝率が上がる。", tone: "hint", isHint: true }]
    }),
    loop_chat: () => ({
      title: loopCount >= 3 ? `${thread.title}【${loopCount}周勢】` : thread.title,
      extraResponses: [{ author: "周回勢B", body: `ループ ${loopCount} だと称号の組み合わせ研究が楽しい。`, tone: "loop" }]
    }),
    unexpected_meta: () => ({
      title: currentState.unlockedTitles.includes("dev_unexpected") ? "運営想定外、踏んだやつ集合" : thread.title,
      extraResponses: [{ author: "運営監視班", body: `想定外タグ: ${(currentState.runtime.exploitTags || []).join(", ") || "未検出"}`, tone: "hint", isHint: true, important: true }]
    })
  };
  const resolver = thread.variantSelector ? variants[thread.variantSelector] : null;
  const resolved = resolver ? resolver() : null;
  return resolved || { title: thread.title, extraResponses: [] };
}

function getThreadResponses(threadId, currentState = state) {
  const thread = BOARD_THREAD_DEFS.find((row) => row.id === threadId);
  if (!thread) {
    return [];
  }
  const base = [...(BOARD_RESPONSE_SETS[thread.responseSetId] || [])];
  const variant = resolveThreadVariant(thread, currentState);
  const dynamic = [];
  if ((currentState.stats.highestBattleSpeedUnlocked || 1) >= 2 && thread.id === "th_timer") {
    dynamic.push({ author: "時計の民", body: "倍率解放は称号条件と連動してる。押すだけじゃなく進行も大事。", tone: "hint", isHint: true });
  }
  if ((currentState.stats.godQualityCraftCount || 0) >= 1 && ["th_prod_late", "th_godq"].includes(thread.id)) {
    dynamic.push({ author: "鍛冶100年", body: "高品質以上を狙うなら生産段階を上げてから一気に回す。", tone: "hint", isHint: true });
  }
  if ((currentState.runtime.buildTags || []).includes("overweight_build") && ["th_heavy", "th_overweight"].includes(thread.id)) {
    dynamic.push({ author: "重装至上主義", body: "重量ペナルティ緩和称号と組み合わせると世界が変わる。", tone: "hint", isHint: true, important: true });
  }
  if ((currentState.runtime.buildTags || []).includes("no_weapon") && thread.id === "th_noweapon") {
    dynamic.push({ author: "素手勢見習い", body: "素手撃破者は武器未装備時の補正が本体。", tone: "hint", isHint: true, important: true });
  }
  if ((currentState.unlockedTitles || []).includes("production_is_main") && thread.id === "th_main_prod") {
    dynamic.push({ author: "バフ飯研究所", body: "生産が本体を取ると装備と消耗品の価値観が変わる。", tone: "guide", important: true });
  }

  const merged = [...base, ...(variant.extraResponses || []), ...dynamic];
  return merged.map((res, idx) => ({ ...res, no: idx + 1 }));
}

function generateBoardThreads() {
  return BOARD_THREAD_DEFS.map((thread, idx) => {
    const variant = resolveThreadVariant(thread, state);
    const responses = getThreadResponses(thread.id, state);
    const openedCount = state.stats.threadOpenedCounts[thread.id] || 0;
    const isUnread = (state.board.newThreadIds || []).includes(thread.id) || !(state.board.readThreadIds || []).includes(thread.id);
    const hotScore = responses.length * 2 + openedCount + (isUnread ? 6 : 0) + ((state.loop.loopCount || 0) >= 1 ? 2 : 0);
    const updatedText = openedCount > 8 ? "さっき" : openedCount > 3 ? "最近" : "少し前";
    return {
      ...thread,
      title: variant.title || thread.title,
      rawTitle: thread.title,
      responses,
      replyCount: responses.length,
      openedCount,
      isUnread,
      hotScore,
      sortSeed: 1000 - idx,
      updatedText
    };
  });
}

function getVisibleBoardThreads() {
  const all = generateBoardThreads();
  const unlocked = new Set(state.board.unlockedThreadIds || []);
  return all
    .filter((thread) => unlocked.has(thread.id))
    .filter((thread) => (state.board.selectedCategory || "all") === "all" || thread.category === state.board.selectedCategory)
    .filter((thread) => !state.board.unreadOnly || thread.isUnread)
    .filter((thread) => {
      const q = (state.board.searchText || "").trim();
      if (!q) return true;
      return thread.title.includes(q) || thread.responses.some((res) => String(res.body || "").includes(q) || String(res.author || "").includes(q));
    })
    .sort((a, b) => {
      if (state.board.sortMode === "popular") {
        return b.openedCount - a.openedCount || b.replyCount - a.replyCount || b.sortSeed - a.sortSeed;
      }
      if (state.board.sortMode === "hot") {
        return b.hotScore - a.hotScore || b.replyCount - a.replyCount || b.sortSeed - a.sortSeed;
      }
      return b.sortSeed - a.sortSeed || b.replyCount - a.replyCount;
    });
}

function unlockBoardThreadsFromProgress() {
  if (!Array.isArray(state.board.unlockedThreadIds)) state.board.unlockedThreadIds = [];
  if (!Array.isArray(state.board.newThreadIds)) state.board.newThreadIds = [];
  const before = new Set(state.board.unlockedThreadIds);
  const unlockable = BOARD_THREAD_DEFS.filter((thread) => evaluateBoardCondition(thread.visibleIf) && evaluateBoardCondition(thread.unlockedBy));
  unlockable.forEach((thread) => before.add(thread.id));
  const after = [...before];
  const newly = after.filter((id) => !state.board.unlockedThreadIds.includes(id));
  if (newly.length > 0) {
    state.board.newThreadIds = [...new Set([...(state.board.newThreadIds || []), ...newly])];
    state.stats.boardThreadUnlockCount = (state.stats.boardThreadUnlockCount || 0) + newly.length;
    addLog(`掲示板に新規スレッド ${newly.length} 件が追加されました。`);
  }
  state.board.unlockedThreadIds = after;
}

function updateBoardThreadsFromProgress() {
  syncOtherworldUnlockState({ silent: true });
  syncStoryProgress({ skipBoardRefresh: true });
  applyLoopUnlocks();
  updateBoardThreadsFromEndingProgress();
  unlockBoardThreadsFromProgress();
  state.board.threads = getVisibleBoardThreads();
  if (!state.board.selectedThreadId || !state.board.threads.some((thread) => thread.id === state.board.selectedThreadId)) {
    state.board.selectedThreadId = state.board.threads[0]?.id || null;
  }
}

function updateBoardThreadsFromTitles() {
  unlockBoardThreadsFromProgress();
}

function updateBoardThreadsFromBuildTags() {
  evaluateBuildTags(calculateWeightInfo(state.player.attack));
  unlockBoardThreadsFromProgress();
}

function markThreadAsRead(threadId) {
  if (!threadId) return;
  if (!Array.isArray(state.board.readThreadIds)) state.board.readThreadIds = [];
  if (!state.board.readThreadIds.includes(threadId)) {
    state.board.readThreadIds.push(threadId);
    state.stats.boardThreadReadCount = (state.stats.boardThreadReadCount || 0) + 1;
  }
  state.board.newThreadIds = (state.board.newThreadIds || []).filter((id) => id !== threadId);
  const now = Date.now();
  state.board.lastOpenedAtById = { ...(state.board.lastOpenedAtById || {}), [threadId]: now };
  const thread = BOARD_THREAD_DEFS.find((t) => t.id === threadId);
  const variant = thread ? resolveThreadVariant(thread, state) : null;
  if (variant?.title) {
    state.board.dynamicVariantHistory = { ...(state.board.dynamicVariantHistory || {}), [threadId]: variant.title };
    state.stats.boardDynamicVariantHistory = { ...(state.stats.boardDynamicVariantHistory || {}), [threadId]: variant.title };
  }
  const hasHint = getThreadResponses(threadId, state).some((res) => res.isHint);
  if (hasHint) {
    state.stats.boardHintSeenFlags = { ...(state.stats.boardHintSeenFlags || {}), [threadId]: true };
  }
}

function getBoardHintFlags() {
  return { ...(state.stats.boardHintSeenFlags || {}) };
}

function renderBoardCategories() {
  const categoryButtons = BOARD_CATEGORIES.map((cat) => {
    const active = (state.board.selectedCategory || "all") === cat.id;
    const count =
      cat.id === "all"
        ? (state.board.unlockedThreadIds || []).length
        : BOARD_THREAD_DEFS.filter((thread) => thread.category === cat.id && (state.board.unlockedThreadIds || []).includes(thread.id)).length;
    return `<button class="btn board-category-btn ${active ? "active" : ""}" data-board-category="${cat.id}">${cat.label}<span class="tiny">${count}</span></button>`;
  }).join("");
  return `
    <div class="board-toolbar card">
      <div class="board-categories">${categoryButtons}</div>
      <div class="board-tools">
        <select id="board-sort-select" class="title-sort-select">
          <option value="new" ${state.board.sortMode === "new" ? "selected" : ""}>新着順</option>
          <option value="popular" ${state.board.sortMode === "popular" ? "selected" : ""}>人気順</option>
          <option value="hot" ${state.board.sortMode === "hot" ? "selected" : ""}>話題順</option>
        </select>
        <label class="tiny"><input id="board-unread-toggle" type="checkbox" ${state.board.unreadOnly ? "checked" : ""}/> 未読のみ</label>
        <input id="board-search-input" class="title-search-input" type="text" placeholder="スレ検索" value="${escapeHtml(state.board.searchText || "")}" />
      </div>
    </div>
  `;
}

function renderBoardThreadList(threads) {
  if (threads.length === 0) {
    return `<div class="board-thread-list"><p class="tiny">表示できるスレッドがありません。</p></div>`;
  }
  const list = threads
    .map((thread) => {
      const active = state.board.selectedThreadId === thread.id;
      const isNew = (state.board.newThreadIds || []).includes(thread.id);
      const unreadClass = thread.isUnread ? "unread" : "";
      const cat = BOARD_CATEGORIES.find((row) => row.id === thread.category)?.label || thread.category;
      return `
        <button class="btn board-thread-btn ${active ? "active" : ""} ${unreadClass}" data-thread-id="${thread.id}">
          <span class="thread-main">
            <span class="thread-title">${escapeHtml(thread.title)}</span>
            <span class="thread-meta">
              <span class="badge-cat">${escapeHtml(cat)}</span>
              <span class="tiny">レス ${thread.replyCount}</span>
              <span class="tiny">閲覧 ${thread.openedCount}</span>
              <span class="tiny">更新 ${thread.updatedText}</span>
              ${isNew ? `<span class="board-new-badge">NEW</span>` : ``}
            </span>
          </span>
        </button>
      `;
    })
    .join("");
  return `<div class="board-thread-list">${list}</div>`;
}

function renderBoardThreadDetail(threadId) {
  const thread = state.board.threads.find((row) => row.id === threadId);
  if (!thread) {
    return `<div class="card board-thread-view"><p class="tiny">スレッドを選択してください。</p></div>`;
  }
  const cat = BOARD_CATEGORIES.find((row) => row.id === thread.category)?.label || thread.category;
  const posts = thread.responses
    .map((res) => {
      const important = res.important ? "important" : "";
      const hint = res.isHint ? "hint" : "";
      return `
        <article class="board-post ${important} ${hint}">
          <div class="board-post-head">
            <strong>${escapeHtml(res.author || "名無し")}</strong>
            <span class="tiny">#${res.no}</span>
          </div>
          <p>${escapeHtml(res.body || "")}</p>
        </article>
      `;
    })
    .join("");
  return `
    <div class="card board-thread-view">
      <h4>${escapeHtml(thread.title)}</h4>
      <div class="board-thread-info tiny">
        <span>カテゴリ: ${escapeHtml(cat)}</span>
        <span>レス数: ${thread.replyCount}</span>
        <span>閲覧: ${thread.openedCount}</span>
      </div>
      <div class="board-post-list">${posts}</div>
    </div>
  `;
}

function renderBoardView(container) {
  updateBoardThreadsFromProgress();
  updateBoardThreadsFromTitles();
  updateBoardThreadsFromBuildTags();
  state.board.threads = getVisibleBoardThreads();
  const selectedId = state.board.selectedThreadId && state.board.threads.some((t) => t.id === state.board.selectedThreadId)
    ? state.board.selectedThreadId
    : state.board.threads[0]?.id || null;
  state.board.selectedThreadId = selectedId;
  container.innerHTML = renderBoardLayout(selectedId);
}

function renderBoardLayout(selectedId) {
  return `
    <div class="main-header">
      <h2>掲示板</h2>
      <span class="tiny">スレッド ${(state.board.unlockedThreadIds || []).length} / 閲覧 ${state.stats.boardViewedCount} / 未読 ${(state.board.newThreadIds || []).length}</span>
    </div>
    ${renderBoardCategories()}
    <div class="board-layout">
      ${renderBoardThreadList(state.board.threads)}
      ${renderBoardThreadDetail(selectedId)}
    </div>
  `;
}

function openBoardThread(threadId) {
  if (!state.board.threads.some((thread) => thread.id === threadId)) {
    return;
  }
  if (state.board.selectedThreadId !== threadId) {
    pushNavigationHistory();
  }
  state.board.selectedThreadId = threadId;
  state.stats.threadOpenedCounts[threadId] = (state.stats.threadOpenedCounts[threadId] || 0) + 1;
  state.stats.boardViewedCount += 1;
  markThreadAsRead(threadId);
  state.stats.boardReactionFlags = { ...(state.stats.boardReactionFlags || {}), [`opened_${threadId}`]: true };
  checkTitleUnlocks("afterBoardView");
  render();
}

function renderStatusView(container) {
  ensureTitleSlotState();
  const effective = getEffectivePlayerStats();
  const effectiveWeightInfo = effective.weightInfo || calculateWeightInfo(effective.attack);
  const effectiveWeightMods = effective.weightModifiers || getWeightPenaltyModifiers(effectiveWeightInfo);
  const weightPenaltyReductionRate = clamp(0, 0.9, Number(state.titleEffects.weightPenaltyReduction || 0));
  const rows = [
    ["名前", state.player.name],
    ["レベル", state.player.level],
    ["経験値", `${state.player.exp} / ${expToNextLevel()}`],
    ["所持金", `${state.player.gold}G`],
    ["メインジョブ", `${state.player.mainJob || "未設定"} (Tier ${state.player.mainJobTier || 1})`],
    ["サブジョブ", `${state.player.subJob || (state.player.subJobUnlocked ? "未設定" : "未解放")}${state.player.subJobId ? ` (Tier ${state.player.subJobTier || 1})` : ""}`],
    ["生産ジョブ", `${getJobDataById(state.player.productionJobCurrentId || state.player.productionJobBaseId || state.player.productionJob)?.nameJa || state.player.productionJob} (Tier ${state.player.productionJobTier || 1}) / ${PRODUCTION_JOB_PATHS[state.player.productionJob].stages[state.player.productionJobStage]}`],
    ["生産Lv", `${state.player.productionJobLevel} / EXP ${state.player.productionJobExp}`],
    ["HP", `${Math.floor(state.player.hp)} / ${Math.floor(effective.maxHp)}`],
    ["MP", `${Math.floor(state.player.mp)} / ${Math.floor(effective.maxMp)}`],
    ["攻撃", `${state.player.attack} -> ${Math.floor(effective.attack)}`],
    ["防御", `${state.player.defense} -> ${Math.floor(effective.defense)}`],
    ["速度", `${state.player.speed} -> ${Math.floor(effective.speed)}`],
    ["知性", `${state.player.intelligence} -> ${Math.floor(effective.intelligence)}`],
    ["運", `${state.player.luck} -> ${Math.floor(effective.luck)}`],
    ["最高到達", state.stats.highestReachedStage],
    ["ユニーク討伐", `${state.stats.uniqueKillCount} / 遭遇${state.stats.uniqueEncounterCount}`],
    ["周回ループ", `${state.loop.loopCount}`],
    ["ノーマル称号枠", `${state.equippedNormalTitleIds.length} / ${state.maxNormalTitleSlots}`],
    ["チート称号枠", `${state.equippedCheatTitleIds.length} / ${state.maxCheatTitleSlots}`],
    ["称号装備上限(互換)", `${getCurrentTitleLimit()}`],
    ["次上限条件", `${getNextTitleLimitCondition()}`],
    ["周回挑戦クリア", `${state.stats.loopChallengeClearCount}`],
    ["強化ボス撃破", `${state.stats.enhancedBossKillCount}`],
    ["倍速使用時間", `${state.stats.speedModeSeconds}s`],
    ["累計ループ", `${state.loop.persistentStats.totalLoops || 0}`],
    ["累計ボス撃破", `${state.loop.persistentStats.totalBossKillsLifetime || 0} (ボス)`],
    ["累計周回ボス", `${state.loop.persistentStats.totalLoopBossKillsLifetime || 0}`],
    ["解放エンディング", `${(state.unlockedEndings || []).join(" / ") || "なし"}`],
    ["世界異変レベル", `${state.stats.worldAnomalyLevel || 0}`],
    ["累計ユニーク", `${state.loop.persistentStats.totalUniqueKillsLifetime || 0}`],
    ["累計獲得GOLD", `${state.loop.persistentStats.totalGoldEarnedLifetime || 0}`],
    ["現在重量", `${effectiveWeightInfo.totalWeight} / ${effectiveWeightInfo.capacity} (${effectiveWeightInfo.rankLabel})`],
    [
      "重量補正(実適用)",
      `ATK ${(effectiveWeightMods.attackMultiplier * 100).toFixed(1)}% / DEF ${(effectiveWeightMods.defenseMultiplier * 100).toFixed(1)}% / SPD ${(effectiveWeightMods.speedMultiplier * 100).toFixed(1)}% / EVA ${(effectiveWeightMods.evasionBonus * 100).toFixed(1)}%`
    ],
    ["重量ペナルティ軽減", state.titleEffects.ignoreWeightPenalty ? "無効化(100%)" : `${(weightPenaltyReductionRate * 100).toFixed(1)}%`],
    ["強化成功率補正", `称号 +${Math.floor((state.titleEffects.enhanceSuccessBonus || 0) * 1000) / 10}% / 鍛冶 +${Math.floor((state.titleEffects.smithEnhanceBonus || 0) * 1000) / 10}%`],
    ["生産成功/失敗", `${state.stats.craftSuccessCount} / ${state.stats.craftFailureCount}`],
    ["高品質/神品質", `${state.stats.craftHighQualityCount} / ${state.stats.craftGodQualityCount}`],
    ["想定外タグ", `${(state.runtime.exploitTags || []).join(", ") || "なし"}`],
    ["称号コンボ試行", `${state.stats.totalTitleCombosTried}`],
    ["速度解放", `${state.stats.highestBattleSpeedUnlocked}x`]
  ];

  container.innerHTML = `
    <div class="main-header"><h2>ステータス</h2><span class="tiny">進行情報と称号</span></div>
    <div class="status-tabs">
      <button class="btn status-subtab-btn ${state.statusSubTab === "profile" ? "active" : ""}" data-status-tab="profile">基本情報</button>
      <button class="btn status-subtab-btn ${state.statusSubTab === "titles" ? "active" : ""}" data-status-tab="titles">称号図鑑</button>
      <button class="btn status-subtab-btn ${state.statusSubTab === "equipment" ? "active" : ""}" data-status-tab="equipment">装備</button>
      <button class="btn status-subtab-btn ${state.statusSubTab === "skills" ? "active" : ""}" data-status-tab="skills">スキル設定</button>
    </div>
    ${
      state.statusSubTab === "profile"
        ? `<div class="info-grid">${rows.map(([label, value]) => `<div class="card"><h4>${escapeHtml(label)}</h4><p>${escapeHtml(value)}</p></div>`).join("")}</div>${renderActiveTitleEffectsSummary()}`
        : state.statusSubTab === "titles"
        ? renderTitleCatalogLayout()
        : state.statusSubTab === "equipment"
          ? renderEquipmentLayout()
          : renderSkillSetupView()
    }
  `;
}

function renderActiveTitleEffectsSummary() {
  const equippedIds = getCombinedEquippedTitleIds();
  if (!equippedIds.length) {
    return `
      <div class="card" style="margin-top:10px;">
        <h4>装備中称号の効果</h4>
        <p class="tiny">現在、称号は装備されていません。</p>
      </div>
    `;
  }
  const rows = equippedIds
    .map((id) => getTitleById(id))
    .filter(Boolean)
    .map((title) => {
      const cat = title.category === "cheat" ? "チート" : "ノーマル";
      const desc = title.effectDescription || "効果説明なし";
      return `<p class="tiny"><strong>[${escapeHtml(cat)}] ${escapeHtml(title.name)}</strong>: ${escapeHtml(desc)}</p>`;
    })
    .join("");
  return `
    <div class="card" style="margin-top:10px;">
      <h4>装備中称号の効果</h4>
      ${rows}
    </div>
  `;
}

function renderEquippedSkillsPanel() {
  const equipped = state.player.equippedSkills || [null, null, null, null];
  return `
    <div class="card">
      <h4>現在セット中スキル（4枠）</h4>
      <div class="skill-setup-grid">
        ${equipped
          .map((skillId, idx) => {
            const data = getSkillDisplayData(skillId);
            return `
              <div class="skill-slot-card ${state.ui.selectedSkillSlot === idx ? "active-title" : ""}">
                <p class="tiny">スロット ${idx + 1}</p>
                <strong>${escapeHtml(data?.nameJa || "未セット")}</strong>
                <p class="tiny">${escapeHtml(data?.descriptionJa || "クリックで対象スロットを選択")}</p>
                <p class="tiny">${data ? `MP ${data.mpCost} / CT ${data.cooldown}s / ${data.category}` : ""}</p>
                <div class="title-row">
                  <button class="btn skill-slot-select-btn" data-skill-slot-index="${idx}">この枠にセット</button>
                  <button class="btn skill-unequip-btn" data-skill-slot-index="${idx}" ${data ? "" : "disabled"}>解除</button>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderSkillSetupView() {
  const available = getAvailableSkillPool();
  const selectedSlot = Number(state.ui.selectedSkillSlot || 0);
  return `
    <div class="skill-setup-layout">
      ${renderEquippedSkillsPanel()}
      <div class="card">
        <h4>使用可能スキル</h4>
        <p class="tiny">選択中スロット: ${selectedSlot + 1}</p>
        <div class="skill-setup-grid">
          ${available
            .map((skill) => {
              const d = getSkillDisplayData(skill.id);
              const owner = d.jobId ? JOB_DATA.main[d.jobId]?.name || d.jobId : "不明";
              return `
                <div class="skill-pool-card">
                  <strong>${escapeHtml(d.nameJa)}</strong>
                  <p class="tiny">${escapeHtml(d.descriptionJa)}</p>
                  <p class="tiny">MP ${d.mpCost} / CT ${d.cooldown}s</p>
                  <p class="tiny">所属: ${escapeHtml(owner)} / 種別: ${escapeHtml(d.category)}</p>
                  <button class="btn skill-equip-btn" data-skill-id="${d.id}">スロット${selectedSlot + 1}へセット</button>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function getTitleProgress(titleId) {
  const progressMap = {
    god_slayer: { current: state.uniqueDefeatedIds.length, target: 7, label: "ユニーク撃破" },
    exp_seeker_1000: { current: state.stats.totalBattles, target: 1000, label: "累計戦闘" },
    gold_harvester_million: { current: state.stats.totalGoldLifetime, target: 1000000, label: "累計GOLD" },
    mass_producer: { current: Math.max(0, ...Object.values(state.stats.producedItemCounts || {})), target: 30, label: "同一生産数" },
    chain_champion_200: { current: state.stats.totalConsecutiveWinsBest, target: 200, label: "連勝" },
    crafted_boss_bane: { current: state.stats.craftedGearBossKillCount, target: 10, label: "クラフト装備ボス撃破" },
    loop_predator: { current: state.loop.loopCount, target: 3, label: "ループ" },
    speed_ritualist: { current: state.stats.speedModeSeconds, target: 300, label: "高速秒数" },
    rare_hunter_nose: { current: state.stats.uniqueEncounterCount, target: 1, label: "ユニーク遭遇" },
    title_combo_breaker: { current: state.stats.totalTitleCombosTried, target: 25, label: "称号コンボ数" },
    unique_theorist: { current: state.stats.totalUniqueTypesDefeated, target: 5, label: "ユニーク種類" },
    workshop_commuter: { current: state.stats.productionWorkshopButtonPressCount || 0, target: 100, label: "工房ボタン" },
    workshop_maniac: { current: state.stats.productionWorkshopButtonPressCount || 0, target: 1000, label: "工房ボタン" },
    workshop_lodger: { current: state.stats.productionWorkshopStaySeconds || 0, target: 180, label: "工房滞在秒" },
    workshop_overtime: { current: state.stats.productionWorkshopStaySeconds || 0, target: 600, label: "工房滞在秒" }
  };
  const p = progressMap[titleId];
  if (!p) return null;
  return { ...p, percent: clamp(0, 100, Math.floor((p.current / Math.max(1, p.target)) * 100)) };
}

function renderTitleProgress(titleId) {
  const p = getTitleProgress(titleId);
  if (!p) return "";
  return `<p class="tiny">進捗: ${p.label} ${p.current}/${p.target} (${p.percent}%)</p>`;
}

function renderTitleCatalogFilters() {
  return `
    <div class="status-tabs">
      <button class="btn title-filter-btn ${state.titleCatalogFilter === "all" ? "active" : ""}" data-title-filter="all">all</button>
      <button class="btn title-filter-btn ${state.titleCatalogFilter === "normal" ? "active" : ""}" data-title-filter="normal">normal</button>
      <button class="btn title-filter-btn ${state.titleCatalogFilter === "cheat" ? "active" : ""}" data-title-filter="cheat">cheat</button>
      <button class="btn title-status-filter-btn ${state.titleCatalogStatusFilter === "all" ? "active" : ""}" data-title-status-filter="all">状態:all</button>
      <button class="btn title-status-filter-btn ${state.titleCatalogStatusFilter === "unlocked" ? "active" : ""}" data-title-status-filter="unlocked">取得済</button>
      <button class="btn title-status-filter-btn ${state.titleCatalogStatusFilter === "locked" ? "active" : ""}" data-title-status-filter="locked">未取得</button>
      <button class="btn title-effect-filter-btn ${state.titleCatalogEffectFilter === "all" ? "active" : ""}" data-title-effect-filter="all">効果:all</button>
      <button class="btn title-effect-filter-btn ${state.titleCatalogEffectFilter === "hasEffect" ? "active" : ""}" data-title-effect-filter="hasEffect">効果あり</button>
      <button class="btn title-effect-filter-btn ${state.titleCatalogEffectFilter === "noEffect" ? "active" : ""}" data-title-effect-filter="noEffect">効果なし</button>
    </div>
    <div class="title-row">
      <input id="title-search-input" class="title-search-input" placeholder="称号名検索" value="${escapeHtml(state.titleCatalogSearch || "")}" />
      <select id="title-sort-select" class="title-sort-select">
        <option value="default" ${state.titleCatalogSortMode === "default" ? "selected" : ""}>並び:標準</option>
        <option value="name" ${state.titleCatalogSortMode === "name" ? "selected" : ""}>名前順</option>
        <option value="unlock" ${state.titleCatalogSortMode === "unlock" ? "selected" : ""}>取得順</option>
        <option value="tier" ${state.titleCatalogSortMode === "tier" ? "selected" : ""}>レア度順</option>
      </select>
    </div>
  `;
}

function filterTitleCatalog(options = {}) {
  return state.world.titles.filter((title) => {
    const unlocked = state.unlockedTitles.includes(title.id);
    const byCategory = options.category === "all" || title.category === options.category;
    const byStatus = options.status === "all" || (options.status === "unlocked" ? unlocked : !unlocked);
    const hasEffect = title.effect && Object.keys(title.effect).length > 0;
    const byEffect = options.effect === "all" || (options.effect === "hasEffect" ? hasEffect : !hasEffect);
    const q = (options.search || "").trim().toLowerCase();
    const bySearch = !q || String(title.name || "").toLowerCase().includes(q) || String(title.id || "").toLowerCase().includes(q);
    return byCategory && byStatus && byEffect && bySearch;
  });
}

function isTitleFavorited(titleId) {
  return !!state.titleFavorites?.[titleId];
}

function toggleTitleFavorite(titleId) {
  if (!titleId) return;
  state.titleFavorites = { ...(state.titleFavorites || {}), [titleId]: !isTitleFavorited(titleId) };
}

function isEquipmentFavorited(itemId) {
  return !!state.equipmentFavorites?.[itemId];
}

function toggleEquipmentFavorite(itemId) {
  if (!itemId) return;
  state.equipmentFavorites = { ...(state.equipmentFavorites || {}), [itemId]: !isEquipmentFavorited(itemId) };
}

function sortTitleCatalog(mode, titles) {
  const list = [...titles];
  if (mode === "name") {
    list.sort((a, b) => String(a.name).localeCompare(String(b.name), "ja"));
  } else if (mode === "unlock") {
    list.sort((a, b) => {
      const ai = state.unlockedTitles.indexOf(a.id);
      const bi = state.unlockedTitles.indexOf(b.id);
      const av = ai < 0 ? Number.MAX_SAFE_INTEGER : ai;
      const bv = bi < 0 ? Number.MAX_SAFE_INTEGER : bi;
      return av - bv;
    });
  } else if (mode === "tier") {
    const weight = { legend: 3, epic: 2, rare: 1 };
    list.sort((a, b) => (weight[b.tier] || 0) - (weight[a.tier] || 0));
  }
  list.sort((a, b) => {
    const af = isTitleFavorited(a.id) ? 1 : 0;
    const bf = isTitleFavorited(b.id) ? 1 : 0;
    return bf - af;
  });
  return list;
}

function renderTitleCatalog() {
  ensureTitleSlotState();
  const summaryCollapsed = !!state.ui.titleCatalogSummaryCollapsed;
  const filtered = filterTitleCatalog({
    category: state.titleCatalogFilter,
    status: state.titleCatalogStatusFilter,
    effect: state.titleCatalogEffectFilter,
    search: state.titleCatalogSearch
  });
  const list = sortTitleCatalog(state.titleCatalogSortMode, filtered);
  const equippedIds = getCombinedEquippedTitleIds();
  const pageSize = 60;
  const buildCards = (titles) =>
    titles
      .map((title) => {
        const unlocked = state.unlockedTitles.includes(title.id);
        const active = equippedIds.includes(title.id);
        const hidden = title.isHidden && !unlocked;
        const progress = renderTitleProgress(title.id);
        const fav = isTitleFavorited(title.id);
        return `
          <div class="title-card ${unlocked ? "unlocked" : "locked"} ${active ? "active-title" : ""}">
            <div class="title-row">
              <h4>${hidden ? "？？？" : title.name}</h4>
              <span class="tiny">${hidden ? "???" : `${title.category}${title.tier ? ` / ${title.tier}` : ""}`}</span>
            </div>
            <p class="tiny">${hidden ? "未発見の称号です。" : title.description}</p>
            <p class="tiny">条件: ${hidden ? "条件未公開" : title.conditionDescription}</p>
            <p class="tiny">効果: ${hidden ? "効果未公開" : title.effectDescription}</p>
            ${hidden ? "" : progress}
            <p class="tiny">周回持込: ${hidden ? "不明" : title.canCarryOver ? `可 (${title.carryOverType})` : `不可 (${title.carryOverType || "none"})`}</p>
            <div class="title-row">
              <span class="tiny">${unlocked ? "取得済み" : "未取得"}</span>
              <div style="display:flex;gap:6px;">
                <button class="btn title-favorite-btn ${fav ? "active" : ""}" data-title-favorite-id="${title.id}" ${hidden ? "disabled" : ""}>${fav ? "★" : "☆"}</button>
                <button class="btn title-toggle-btn ${active ? "active" : ""}" data-title-id="${title.id}" ${unlocked ? "" : "disabled"}>${active ? "OFF" : "ON"}</button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  const renderSection = (category, label, pageKey) => {
    const sectionList = list.filter((title) => title.category === category);
    const totalPages = Math.max(1, Math.ceil(sectionList.length / pageSize));
    const currentPage = Math.min(Math.max(1, Number(state[pageKey] || 1)), totalPages);
    state[pageKey] = currentPage;
    const start = (currentPage - 1) * pageSize;
    const pageList = sectionList.slice(start, start + pageSize);
    if (!sectionList.length) {
      return "";
    }
    return `
      <div class="card" style="margin-top:10px;">
        <div class="title-row">
          <h4>${label}</h4>
          <span class="tiny">${sectionList.length}件 / ${currentPage} / ${totalPages}ページ</span>
        </div>
        <div class="title-row" style="margin-bottom:8px;">
          <button class="btn title-page-btn" data-title-page-key="${pageKey}" data-title-page-delta="-1" ${currentPage <= 1 ? "disabled" : ""}>前へ</button>
          <button class="btn title-page-btn" data-title-page-key="${pageKey}" data-title-page-delta="1" ${currentPage >= totalPages ? "disabled" : ""}>次へ</button>
        </div>
        <div class="title-grid">${buildCards(pageList)}</div>
      </div>
    `;
  };
  const normalEquippedNames = state.equippedNormalTitleIds.map((id) => getTitleById(id)?.name || id).join(" / ");
  const cheatEquippedNames = state.equippedCheatTitleIds.map((id) => getTitleById(id)?.name || id).join(" / ");
  const normalTierHint =
    state.normalTitleTierBonus < 2 ? `Tier${state.normalTitleTierBonus === 0 ? 2 : 3}でノーマル+1` : "ノーマルTier解放は最大";
  const cheatTierHint =
    state.cheatTitleTierBonus === 0
      ? "Tier4でチート+1"
      : state.cheatTitleTierBonus === 1
        ? "Tier5でチート+1"
        : "チートTier解放は最大";
  const normalLoopHint = state.titleSlotUnlocks.normalBaseUnlocked ? "周回で初期ノーマル+1解放済み" : "周回1で初期ノーマル+1";
  const cheatLoopHint = state.titleSlotUnlocks.cheatBaseUnlocked ? "周回で初期チート+1解放済み" : "周回3で初期チート+1";
  const baseNormal = TITLE_SLOT_RULES.normal.baseDefault;
  const baseCheat = TITLE_SLOT_RULES.cheat.baseDefault;
  const loopNormal = Math.max(0, Number(state.titleSlotUnlocks?.normalBasePlus || 0));
  const loopCheat = Math.max(0, Number(state.titleSlotUnlocks?.cheatBasePlus || 0));
  const bossNormal = Math.max(0, Number(state.bossClearNormalTitleSlotBonus || 0));
  const bossCheat = Math.max(0, Number(state.bossClearCheatTitleSlotBonus || 0));
  const cheatShop = Math.max(0, Number(state.cheatTitleShopSlotBonus || 0));
  const tierNormal = Math.max(0, Number(state.normalTitleTierBonus || 0));
  const tierCheat = Math.max(0, Number(state.cheatTitleTierBonus || 0));
  const guildNormal = Math.max(0, Number(state.guild?.guildRankNormalTitleSlotBonus || 0));
  const guildCheat = Math.max(0, Number(state.guild?.guildRankCheatTitleSlotBonus || 0));
  return `
    <div class="card" style="margin-bottom:10px;">
      <div class="title-row">
        <h4>称号サマリー</h4>
        <button class="btn title-summary-toggle-btn">${summaryCollapsed ? "開く" : "閉じる"}</button>
      </div>
      <p>ノーマル称号: <strong>${state.equippedNormalTitleIds.length}/${state.maxNormalTitleSlots}</strong></p>
      <p>チート称号: <strong>${state.equippedCheatTitleIds.length}/${state.maxCheatTitleSlots}</strong></p>
      ${
        summaryCollapsed
          ? ""
          : `
      <p class="tiny">内訳(N): 初期${baseNormal} + 周回${loopNormal} + 地域突破${bossNormal} + Tier${tierNormal} + ギルドランク${guildNormal}</p>
      <p class="tiny">内訳(C): 初期${baseCheat} + 周回${loopCheat} + 地域突破${bossCheat} + Tier${tierCheat} + ギルドランク${guildCheat} + 神殿購入${cheatShop}</p>
      <p class="tiny">ノーマル装備中: ${escapeHtml(normalEquippedNames || "なし")}</p>
      <p class="tiny">チート装備中: ${escapeHtml(cheatEquippedNames || "なし")}</p>
      <p class="tiny">解放条件: ${escapeHtml(normalTierHint)} / ${escapeHtml(cheatTierHint)}</p>
      <p class="tiny">周回枠: ${escapeHtml(normalLoopHint)} / ${escapeHtml(cheatLoopHint)}</p>
      <p class="tiny">解放倍率: ${state.unlockedBattleSpeedOptions.map((s) => `${s}x`).join(" / ")}</p>
      <p class="tiny">ループ ${state.loop.loopCount} / 次解放: ${escapeHtml(getNextTitleLimitCondition())}</p>
      <p class="tiny">お気に入り(☆)を付けた称号は各カテゴリの先頭に固定されます。</p>
      ${renderTitleCatalogFilters()}
      `
      }
    </div>
    ${renderSection("normal", "ノーマル称号", "titleCatalogPageNormal")}
    ${renderSection("cheat", "チート称号", "titleCatalogPageCheat")}
  `;
}

function renderTitleCatalogLayout() {
  return `
    <div class="title-layout">
      ${renderTitleCatalog()}
    </div>
  `;
}

function renderEquipmentLayout() {
  return `
    <div class="equipment-layout">
      ${renderEquipmentView()}
    </div>
  `;
}

function getEquipmentDisplayName(itemId) {
  const eq = EQUIPMENT_DATA[itemId];
  if (!eq) {
    return itemId || "不明装備";
  }
  const lv = getEnhanceLevel(itemId);
  return `${eq.name}${lv > 0 ? ` +${lv}` : ""}`;
}

function formatEquipmentStatSummary(stats) {
  return `ATK ${Math.floor(stats.attack)} / DEF ${Math.floor(stats.defense)} / SPD ${Math.floor(stats.speed)} / INT ${Math.floor(stats.intelligence)} / LUK ${Math.floor(stats.luck)} / HP ${Math.floor(stats.hp)} / MP ${Math.floor(stats.mp)}`;
}

function getEquipmentSlotContribution(itemId, slotId) {
  const detail = getEnhancedEquipmentStats(createEquipmentInstanceFromItemId(itemId));
  if (!detail) {
    return null;
  }
  const tags = createEquipmentInstanceFromItemId(itemId)?.specialTags || [];
  const craftedMul = tags.some((tag) => ["crafted_bonus", "god_quality", "alchemy_masterpiece", "smith_masterpiece", "culinary_masterpiece"].includes(tag))
    ? 1 + (state.titleEffects.craftedGearBonus || 0)
    : 1;
  const slotMul = slotId === "weapon2" ? 0.6 : 1;
  return {
    attack: detail.finalStats.attack * craftedMul * slotMul,
    defense: detail.finalStats.defense * craftedMul * slotMul,
    speed: detail.finalStats.speed * craftedMul * slotMul,
    intelligence: detail.finalStats.intelligence * craftedMul * slotMul,
    luck: detail.finalStats.luck * craftedMul * slotMul,
    hp: detail.finalStats.hp * craftedMul * slotMul,
    mp: detail.finalStats.mp * craftedMul * slotMul,
    weight: detail.finalStats.weight
  };
}

function buildEquipmentComparisonText(candidateItemId, currentItemId, slotId) {
  const cand = getEquipmentSlotContribution(candidateItemId, slotId);
  if (!cand || !slotId) {
    return "比較不可";
  }
  const current = currentItemId ? getEquipmentSlotContribution(currentItemId, slotId) : null;
  const keys = ["attack", "defense", "speed", "intelligence", "luck", "hp", "mp", "weight"];
  const diffText = keys
    .map((key) => {
      const a = cand[key] || 0;
      const b = current?.[key] || 0;
      const diff = a - b;
      if (Math.abs(diff) < 0.0001) {
        return null;
      }
      const shown = Number.isInteger(diff) ? diff : Number(diff.toFixed(1));
      return `${key.toUpperCase()} ${shown > 0 ? "+" : ""}${shown}`;
    })
    .filter(Boolean)
    .join(" / ");
  return diffText || "変化なし";
}

function renderEquipmentView() {
  const effective = getEffectivePlayerStats();
  const weightInfo = effective.weightInfo || calculateWeightInfo(effective.attack);
  const effectiveWeightMods = effective.weightModifiers || getWeightPenaltyModifiers(weightInfo);
  const weightPenaltyReductionRate = clamp(0, 0.9, Number(state.titleEffects.weightPenaltyReduction || 0));
  const fmtSignedPct = (value) => {
    const n = Number(value || 0) * 100;
    const sign = n > 0 ? "+" : "";
    return `${sign}${n.toFixed(1)}%`;
  };
  if (!state.ui.selectedEquipmentSlotId) {
    state.ui.selectedEquipmentSlotId = "weapon1";
  }
  const selectedSlot = EQUIPMENT_SLOTS.find((slot) => slot.id === state.ui.selectedEquipmentSlotId) || EQUIPMENT_SLOTS[0];
  const sortedEntries = [...state.player.inventory]
    .filter((entry) => (EQUIPMENT_DATA[entry.itemId]?.category || "") === selectedSlot.category)
    .sort((a, b) => {
      const af = isEquipmentFavorited(a.itemId) ? 1 : 0;
      const bf = isEquipmentFavorited(b.itemId) ? 1 : 0;
      if (af !== bf) return bf - af;
      return getEquipmentDisplayName(a.itemId).localeCompare(getEquipmentDisplayName(b.itemId), "ja");
    });
  const candidateList = sortedEntries
    .filter((entry) => (EQUIPMENT_DATA[entry.itemId]?.category || "") === selectedSlot.category)
    .map((entry) => {
      const eq = EQUIPMENT_DATA[entry.itemId];
      const fav = isEquipmentFavorited(eq.id);
      const equippedCount = getEquippedCountByItem(entry.itemId);
      const canEquip = entry.quantity > equippedCount;
      const preview = renderEquipmentComparison(eq.id, selectedSlot.id);
      const detail = getEnhancedEquipmentStats(createEquipmentInstanceFromItemId(eq.id));
      const base = detail?.baseStats || { attack: 0, defense: 0, speed: 0, intelligence: 0, luck: 0, hp: 0, mp: 0 };
      const enh = detail?.enhancementBonus || { attack: 0, defense: 0, speed: 0, intelligence: 0, luck: 0, hp: 0, mp: 0 };
      const fin = detail?.finalStats || { attack: 0, defense: 0, speed: 0, intelligence: 0, luck: 0, hp: 0, mp: 0, weight: eq.weight || 0 };
      return `
        <div class="shop-card">
          <h4>${getEquipmentDisplayName(eq.id)} x${entry.quantity}</h4>
          <p class="tiny">${eq.description}</p>
          <p class="tiny">${formatEquipmentStatSummary(fin)}</p>
          <p class="tiny">基礎値: ATK ${base.attack}${enh.attack ? ` (+${enh.attack})` : ""} / DEF ${base.defense}${enh.defense ? ` (+${enh.defense})` : ""} / SPD ${base.speed}${enh.speed ? ` (+${enh.speed})` : ""}</p>
          <p class="tiny">INT ${base.intelligence}${enh.intelligence ? ` (+${enh.intelligence})` : ""} / LUK ${base.luck}${enh.luck ? ` (+${enh.luck})` : ""} / HP ${base.hp}${enh.hp ? ` (+${enh.hp})` : ""} / MP ${base.mp}${enh.mp ? ` (+${enh.mp})` : ""}</p>
          <p class="tiny">重量 ${Number(fin.weight.toFixed(1))} / レア ${eq.rarity}</p>
          <p class="tiny">${preview}</p>
          <div class="title-row">
            <button class="btn equipment-favorite-btn ${fav ? "active" : ""}" data-equipment-favorite-id="${eq.id}">${fav ? "★" : "☆"}</button>
            <button class="btn equip-item-btn" data-equip-item-id="${eq.id}" data-equip-slot-id="${selectedSlot.id}" ${canEquip ? "" : "disabled"}>装備</button>
            <button class="btn equip-preview-btn" data-preview-item-id="${eq.id}" data-preview-slot-id="${selectedSlot.id}">比較</button>
          </div>
        </div>
      `;
    })
    .join("");

  const slotCards = EQUIPMENT_SLOTS.map((slot) => {
    const item = getEquippedItem(slot.id);
    const displayName = item ? getEquipmentDisplayName(item.id) : "未装備";
    const calc = item ? getEnhancedEquipmentStats(createEquipmentInstanceFromItemId(item.id)) : null;
    return `
      <div class="card ${state.ui.selectedEquipmentSlotId === slot.id ? "active-title" : ""}">
        <h4>${slot.label}</h4>
        <p class="tiny">${displayName}</p>
        <p class="tiny">${calc ? formatEquipmentStatSummary(calc.finalStats) : "ステータス補正なし"}</p>
        <div class="title-row">
          <button class="btn equipment-slot-btn" data-slot-id="${slot.id}">候補表示</button>
          <button class="btn unequip-btn" data-slot-id="${slot.id}" ${item ? "" : "disabled"}>解除</button>
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="card" style="margin-bottom:10px;">
      <p>総重量 / 許容重量: <strong>${weightInfo.totalWeight} / ${weightInfo.capacity}</strong> (超過 ${weightInfo.overBy})</p>
      <p class="tiny">重量ランク: ${weightInfo.rankLabel} / 装備枠使用: ${weightInfo.slotsFilled}/6</p>
      <p class="tiny">重量補正(基礎): ATK ${fmtSignedPct(weightInfo.baseModifiers.attackMultiplier)} / DEF ${fmtSignedPct(weightInfo.baseModifiers.defenseMultiplier)} / SPD ${fmtSignedPct(weightInfo.baseModifiers.speedMultiplier)} / EVA ${fmtSignedPct(weightInfo.baseModifiers.evasionBonus)}</p>
      <p class="tiny">重量補正(実適用): ATK ${fmtSignedPct(effectiveWeightMods.attackMultiplier)} / DEF ${fmtSignedPct(effectiveWeightMods.defenseMultiplier)} / SPD ${fmtSignedPct(effectiveWeightMods.speedMultiplier)} / EVA ${fmtSignedPct(effectiveWeightMods.evasionBonus)}</p>
      <p class="tiny">重量ペナルティ軽減: ${state.titleEffects.ignoreWeightPenalty ? "無効化(100%)" : `${(weightPenaltyReductionRate * 100).toFixed(1)}%`}</p>
      <p class="tiny">ビルドタグ: ${(effective.buildTags || []).join(", ") || "なし"}</p>
      <p class="tiny">お気に入り(☆)を付けた装備は候補上部に固定されます。</p>
    </div>
    <div class="info-grid">${slotCards}</div>
    <div class="card" style="margin-top:10px;">
      <h4>装備候補 (${selectedSlot.label})</h4>
      <div class="shop-grid">${candidateList || "<p class='tiny'>候補なし</p>"}</div>
    </div>
  `;
}

function renderEquipmentComparison(itemId, slotId) {
  const item = EQUIPMENT_DATA[itemId];
  if (!item) {
    return "";
  }
  const currentItemId = state.player.equipmentSlots?.[slotId] || null;
  return buildEquipmentComparisonText(itemId, currentItemId, slotId);
}

function equipItem(itemId, slotId) {
  const slot = EQUIPMENT_SLOTS.find((s) => s.id === slotId);
  const item = EQUIPMENT_DATA[itemId];
  if (!slot || !item || slot.category !== item.category) {
    addLog("装備失敗: スロットと装備カテゴリが一致しません。");
    return;
  }
  const own = getInventoryCount(itemId);
  const equippedCount = getEquippedCountByItem(itemId);
  if (own <= equippedCount) {
    addLog("装備失敗: 所持数が不足しています。");
    return;
  }
  state.player.equipmentSlots[slotId] = itemId;
  state.player.equippedWeaponId = state.player.equipmentSlots.weapon1 || null;
  state.player.equippedArmorId = state.player.equipmentSlots.armor1 || null;
  state.player.equippedHeadId = state.player.equipmentSlots.armor2 || null;
  state.stats.totalEquipChanges += 1;
  state.stats.equipmentSlotUsageCounts[slotId] = (state.stats.equipmentSlotUsageCounts[slotId] || 0) + 1;
  state.ui.selectedEquipmentSlotId = slotId;
  refreshPlayerDerivedStats();
  addLog(`装備変更: ${slot.label} に ${getEquipmentDisplayName(item.id)} を装備。`);
  checkEquipmentRelatedTitles();
  renderPreservingWindowScroll();
}

function unequipItem(slotId) {
  const slot = EQUIPMENT_SLOTS.find((s) => s.id === slotId);
  if (!slot || !state.player.equipmentSlots[slotId]) {
    return;
  }
  const item = EQUIPMENT_DATA[state.player.equipmentSlots[slotId]];
  state.player.equipmentSlots[slotId] = null;
  state.player.equippedWeaponId = state.player.equipmentSlots.weapon1 || null;
  state.player.equippedArmorId = state.player.equipmentSlots.armor1 || null;
  state.player.equippedHeadId = state.player.equipmentSlots.armor2 || null;
  state.stats.totalEquipChanges += 1;
  refreshPlayerDerivedStats();
  addLog(`装備解除: ${slot.label} (${item?.name || "装備"})`);
  checkEquipmentRelatedTitles();
  renderPreservingWindowScroll();
}

function getEquippedCountByItem(itemId) {
  return Object.values(state.player.equipmentSlots || {}).filter((id) => id === itemId).length;
}

function checkEquipmentRelatedTitles() {
  evaluateBuildTags(calculateWeightInfo(state.player.attack));
  evaluateExploitTags();
  checkTitleUnlocks("afterEquipmentChange");
}

function renderItemsView(container) {
  const cards = state.player.inventory
    .map((slot) => {
      const item = ITEM_DATA[slot.itemId];
      const equipped = getEquippedCountByItem(slot.itemId);
      const actionBtn =
        item && ["consumable", "crafted"].includes(item.category)
          ? `<button class="btn use-item-btn" data-item-id="${slot.itemId}" ${slot.quantity <= 0 ? "disabled" : ""}>使用</button>`
          : "";
      return `<div class="card"><h4>${item?.nameJa || item?.name || slot.itemId} x${slot.quantity}</h4><p class="tiny">${item?.category || "unknown"}${equipped > 0 ? ` / 装備中 ${equipped}` : ""}</p>${actionBtn}</div>`;
    })
    .join("");
  container.innerHTML = `
    <div class="main-header"><h2>アイテム</h2><span class="tiny">インベントリ</span></div>
    ${renderAutoUseItemSetupView()}
    <div class="inventory-grid">${cards || "<div class='card'><p>インベントリは空です。</p></div>"}</div>
  `;
}

function renderAutoUseItemSetupView() {
  const options = getAutoUsableItemList();
  const rows = state.autoUseItems.map((slot, idx) => {
    const item = slot.itemId ? ITEM_DATA[slot.itemId] : null;
    const count = slot.itemId ? getRemainingItemCount(slot.itemId) : 0;
    const thresholdOptions = AUTO_USE_HP_THRESHOLD_OPTIONS
      .map((value) => `<option value="${value}" ${slot.hpThresholdPercent === value ? "selected" : ""}>${value}%</option>`)
      .join("");
    const itemOptions = [`<option value="">未設定</option>`]
      .concat(options.map((row) => `<option value="${row.id}" ${slot.itemId === row.id ? "selected" : ""}>${escapeHtml(getItemNameJa(row.id))}</option>`))
      .join("");
    return `
      <div class="auto-item-setup-card">
        <div class="title-row">
          <h4>自動使用 Slot ${idx + 1}</h4>
          <button class="btn auto-item-toggle-btn ${slot.isEnabled ? "active" : ""}" data-auto-slot-index="${idx}">
            ${slot.isEnabled ? "有効" : "無効"}
          </button>
        </div>
        <label class="tiny">アイテム
          <select class="title-sort-select auto-item-select" data-auto-slot-index="${idx}">
            ${itemOptions}
          </select>
        </label>
        <label class="tiny">発動条件
          <select class="title-sort-select auto-item-threshold-select" data-auto-slot-index="${idx}">
            ${thresholdOptions}
          </select>
        </label>
        <p class="tiny">セット中: ${item ? escapeHtml(getItemNameJa(item.id)) : "未設定"} / 所持 ${count}</p>
        <p class="tiny">回復量: ${item ? `${item.healAmount || 0}` : "-"} / CT: ${item ? `${item.cooldown || 0}s` : "-"}</p>
        <p class="tiny">状態: ${slot.isEnabled ? "有効" : "無効"} / 発動条件 HP/MP ${slot.hpThresholdPercent}%以下</p>
      </div>
    `;
  }).join("");
  return `
    <div class="card auto-item-setup-panel" style="margin-bottom:10px;">
      <h4>自動回復アイテム設定</h4>
      <p class="tiny">上の枠から順に判定し、条件を満たした最初の1つだけ自動使用します。</p>
      <div class="battle-auto-item-grid">${rows}</div>
    </div>
  `;
}

function renderSystemView(container) {
  const summary = exportSaveSummary();
  container.innerHTML = `
    <div class="main-header"><h2>システム</h2><span class="tiny">セーブ / 設定 / データ管理</span></div>
    <div class="status-tabs">
      <button class="btn system-subtab-btn ${state.ui.systemSubTab === "save" ? "active" : ""}" data-system-tab="save">セーブ管理</button>
      <button class="btn system-subtab-btn ${state.ui.systemSubTab === "settings" ? "active" : ""}" data-system-tab="settings">設定</button>
    </div>
    ${
      state.ui.systemSubTab === "settings"
        ? renderSettingsView()
        : renderSaveLoadView(summary)
    }
  `;
}

function renderSaveLoadView(summary = exportSaveSummary()) {
  return `
    <div class="card">
      <h4>セーブ概要</h4>
      <p class="tiny">Lv ${summary.level} / ${summary.town} / ${summary.stage}</p>
      <p class="tiny">ループ ${summary.loopCount} / 称号 ${summary.titleCount} / 倍率 ${summary.speeds}</p>
      <p class="tiny">総プレイ時間 ${summary.playtimeSec}s / 現在周回 ${summary.currentLoopPlaytimeSec}s</p>
      <p class="tiny">最終保存 ${summary.savedAt}</p>
      <p class="tiny">titleLimit ${summary.titleLimit}</p>
    </div>
    <div class="card" style="margin-top:10px;">
      <div class="title-row">
        <button id="manual-save-btn" class="btn btn-primary">手動セーブ</button>
        <button id="manual-load-btn" class="btn">ロード</button>
        <button id="backup-load-btn" class="btn">バックアップ復元</button>
      </div>
      <div class="title-row" style="margin-top:8px;">
        <button id="reset-run-btn" class="btn">現在周回のみ初期化</button>
        <button id="reset-all-btn" class="btn">全データ初期化</button>
        <button id="go-title-btn" class="btn">タイトルへ戻る</button>
      </div>
      <p class="tiny" style="margin-top:8px;">オートセーブ: ステージクリア/ボス撃破/町移動/称号獲得/2分ごと</p>
    </div>
  `;
}

function renderSettingsView() {
  return `
    <div class="card">
      <h4>設定</h4>
      <div class="guild-grid">
        <label class="tiny"><input id="setting-bgm" type="checkbox" ${state.settings.bgmOn ? "checked" : ""}/> BGM ON</label>
        <label class="tiny"><input id="setting-log-autoscroll" type="checkbox" ${state.ui.logAutoScroll ? "checked" : ""}/> ログ自動スクロール</label>
        <label class="tiny"><input id="setting-help" type="checkbox" ${state.ui.helpOpen ? "checked" : ""}/> ヘルプ表示</label>
        <label class="tiny"><input id="setting-speed-emphasis" type="checkbox" ${state.settings.speedEffectEmphasis ? "checked" : ""}/> 倍速演出強調</label>
        <label class="tiny"><input id="setting-lightweight" type="checkbox" ${state.settings.lightweightMode ? "checked" : ""}/> 軽量表示モード</label>
        <label class="tiny"><input id="setting-save-confirm" type="checkbox" ${state.settings.saveConfirmDialog ? "checked" : ""}/> セーブ確認ダイアログ</label>
      </div>
      <div style="margin-top:10px;">
        <label class="tiny">通知量
          <select id="setting-notification-level" class="title-sort-select">
            <option value="low" ${state.settings.notificationLevel === "low" ? "selected" : ""}>少なめ</option>
            <option value="normal" ${state.settings.notificationLevel === "normal" ? "selected" : ""}>標準</option>
            <option value="high" ${state.settings.notificationLevel === "high" ? "selected" : ""}>多め</option>
          </select>
        </label>
      </div>
      <div style="margin-top:10px;">
        <button id="save-settings-btn" class="btn btn-primary">設定を保存</button>
      </div>
    </div>
  `;
}

function safeLoadJson(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[save] JSON parse error for ${key}`, error);
    return null;
  }
}

function safeSaveJson(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn(`[save] write error for ${key}`, error);
    return false;
  }
}

function deepCopyPlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function splitRunAndPersistentState() {
  ensureTitleSlotState();
  const runState = {
    screen: state.screen,
    introIndex: state.introIndex,
    currentTab: state.currentTab,
    statusSubTab: state.statusSubTab,
    titleCatalogFilter: state.titleCatalogFilter,
    titleCatalogStatusFilter: state.titleCatalogStatusFilter,
    titleCatalogEffectFilter: state.titleCatalogEffectFilter,
    titleCatalogSortMode: state.titleCatalogSortMode,
    titleCatalogSearch: state.titleCatalogSearch,
    titleCatalogPageNormal: state.titleCatalogPageNormal,
    titleCatalogPageCheat: state.titleCatalogPageCheat,
    titleFavorites: deepCopyPlain(state.titleFavorites || {}),
    equipmentFavorites: deepCopyPlain(state.equipmentFavorites || {}),
    currentTown: state.currentTown,
    currentMap: state.currentMap,
    currentStage: state.currentStage,
    currentStageKillCount: state.currentStageKillCount,
    currentStageTargetKills: state.currentStageTargetKills,
    autoUseItems: deepCopyPlain(state.autoUseItems),
    unlockedTowns: deepCopyPlain(state.unlockedTowns),
    hasNeverendTicket: !!state.hasNeverendTicket,
    neverendUnlocked: !!state.neverendUnlocked,
    neverendVipUnlocked: !!state.neverendVipUnlocked,
    chips: Math.max(0, Math.floor(Number(state.chips || 0))),
    neverendBossClearFlags: deepCopyPlain(state.neverendBossClearFlags || {}),
    auctionRefreshState: deepCopyPlain(state.auctionRefreshState || createDefaultAuctionRefreshState()),
    rouletteStats: deepCopyPlain(state.rouletteStats || createDefaultRouletteStats()),
    neverendUi: deepCopyPlain(state.neverendUi || createDefaultNeverendUiState()),
    clearedStages: deepCopyPlain(state.clearedStages),
    fieldBossCleared: deepCopyPlain(state.fieldBossCleared),
    stageProgressById: deepCopyPlain(state.stageProgressById),
    battleSpeedMultiplier: state.battleSpeedMultiplier,
    unlockedBattleSpeedOptions: deepCopyPlain(state.unlockedBattleSpeedOptions),
    unlockedTitles: deepCopyPlain(state.unlockedTitles),
    activeTitles: deepCopyPlain(state.activeTitles),
    equippedNormalTitleIds: deepCopyPlain(state.equippedNormalTitleIds),
    equippedCheatTitleIds: deepCopyPlain(state.equippedCheatTitleIds),
    baseNormalTitleSlots: state.baseNormalTitleSlots,
    baseCheatTitleSlots: state.baseCheatTitleSlots,
    normalTitleTierBonus: state.normalTitleTierBonus,
    cheatTitleTierBonus: state.cheatTitleTierBonus,
    maxNormalTitleSlots: state.maxNormalTitleSlots,
    maxCheatTitleSlots: state.maxCheatTitleSlots,
    titleSlotUnlocks: deepCopyPlain(state.titleSlotUnlocks),
    board: deepCopyPlain(state.board),
    guild: deepCopyPlain(state.guild),
    player: deepCopyPlain(state.player),
    stats: deepCopyPlain(state.stats),
    jobEvolutionFlags: deepCopyPlain(state.jobEvolutionFlags),
    unlockedSkills: deepCopyPlain(state.unlockedSkills),
    quests: {
      active: deepCopyPlain(state.guild.activeQuestIds),
      completed: deepCopyPlain(state.guild.completedQuestIds),
      claimed: deepCopyPlain(state.guild.claimedQuestIds)
    }
  };

  const persistentState = {
    loop: {
      loopCount: state.loop.loopCount,
      carriedTitles: deepCopyPlain(state.loop.carriedTitles),
      unlockedFeatures: deepCopyPlain(state.loop.unlockedFeatures),
      loopRewardFlags: deepCopyPlain(state.loop.loopRewardFlags),
      loopBossKillFlags: deepCopyPlain(state.loop.loopBossKillFlags),
      specialChallengeClearFlags: deepCopyPlain(state.loop.specialChallengeClearFlags),
      persistentUnlocks: deepCopyPlain(state.loop.persistentUnlocks),
      unlockedLoopChallengeIds: deepCopyPlain(state.loop.unlockedLoopChallengeIds),
      persistentStats: deepCopyPlain(state.loop.persistentStats),
      titleHistory: deepCopyPlain(state.loop.titleHistory)
    },
    titleLimit: {
      base: state.titleLimitBase,
      bonus: state.titleLimitBonus,
      upgradeLevel: state.titleLimitUpgradeLevel,
      unlockedUpgrades: deepCopyPlain(state.unlockedTitleLimitUpgrades)
    },
    titleSlotUpgrades: {
      normalBasePlus: state.titleSlotUnlocks?.normalBasePlus || 0,
      cheatBasePlus: state.titleSlotUnlocks?.cheatBasePlus || 0,
      clearedRegionBossSlotRewards: deepCopyPlain(state.clearedRegionBossSlotRewards || createDefaultRegionBossSlotRewardState()),
      cheatTitleSlotShopPurchases: deepCopyPlain(state.cheatTitleSlotShopPurchases || createDefaultCheatTitleSlotShopState())
    },
    endings: {
      unlockedEndings: deepCopyPlain(state.unlockedEndings),
      finalContentUnlocked: state.finalContentUnlocked,
      finalBossFlags: deepCopyPlain(state.finalBossFlags),
      endingProgressFlags: deepCopyPlain(state.endingProgressFlags),
      worldStateFlags: deepCopyPlain(state.worldStateFlags)
    },
    unique: {
      uniqueDefeatedIds: deepCopyPlain(state.uniqueDefeatedIds),
      uniqueEncounterCount: state.uniqueEncounterCount,
      uniqueKillCount: state.uniqueKillCount,
      unlockedUniqueSkills: deepCopyPlain(state.unlockedUniqueSkills)
    }
  };

  const settingsState = {
    settings: deepCopyPlain(state.settings),
    ui: {
      logAutoScroll: state.ui.logAutoScroll,
      logFilter: state.ui.logFilter,
      helpOpen: state.ui.helpOpen,
      topHudCollapsed: state.ui.topHudCollapsed,
      lastMainTab: state.ui.lastMainTab,
      systemSubTab: state.ui.systemSubTab
    }
  };
  return { runState, persistentState, settingsState };
}

function buildSavePayload() {
  const { runState, persistentState, settingsState } = splitRunAndPersistentState();
  return {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    runState,
    persistentState,
    settingsState
  };
}

function validateSaveData(data) {
  if (!data || typeof data !== "object") return false;
  if (!data.runState || !data.persistentState || !data.settingsState) return false;
  if (typeof data.version !== "number") return false;
  return true;
}

function migrateSaveData(data) {
  if (!data || typeof data !== "object") return null;
  const migrated = { ...data };
  if (typeof migrated.version !== "number") {
    migrated.version = 0;
  }
  if (migrated.version < SAVE_VERSION) {
    migrated.version = SAVE_VERSION;
  }
  return migrated;
}

function applyLoadedState(payload) {
  const data = migrateSaveData(payload);
  if (!validateSaveData(data)) {
    return false;
  }
  const run = data.runState;
  const persistent = data.persistentState;
  const settings = data.settingsState;

  state.screen = run.screen || "game";
  state.introIndex = run.introIndex || 0;
  state.currentTab = run.currentTab || "adventure";
  state.statusSubTab = run.statusSubTab || "profile";
  state.titleCatalogFilter = run.titleCatalogFilter || "all";
  state.titleCatalogStatusFilter = run.titleCatalogStatusFilter || "all";
  state.titleCatalogEffectFilter = run.titleCatalogEffectFilter || "all";
  state.titleCatalogSortMode = run.titleCatalogSortMode || "default";
  state.titleCatalogSearch = run.titleCatalogSearch || "";
  state.titleCatalogPageNormal = Math.max(1, Number(run.titleCatalogPageNormal || 1));
  state.titleCatalogPageCheat = Math.max(1, Number(run.titleCatalogPageCheat || 1));
  state.titleFavorites = run.titleFavorites && typeof run.titleFavorites === "object" ? run.titleFavorites : {};
  state.equipmentFavorites = run.equipmentFavorites && typeof run.equipmentFavorites === "object" ? run.equipmentFavorites : {};
  state.currentTown = run.currentTown || state.currentTown;
  state.currentMap = run.currentMap || state.currentMap;
  state.currentStage = run.currentStage || state.currentStage;
  state.currentStageKillCount = run.currentStageKillCount || 0;
  state.currentStageTargetKills = run.currentStageTargetKills || STAGE_DATA[state.currentStage]?.targetKills || 10;
  state.autoUseItems = normalizeAutoUseItems(run.autoUseItems || state.autoUseItems);
  state.unlockedTowns = Array.isArray(run.unlockedTowns) ? run.unlockedTowns : state.unlockedTowns;
  state.hasNeverendTicket = !!run.hasNeverendTicket;
  state.neverendUnlocked = !!run.neverendUnlocked;
  state.neverendVipUnlocked = !!run.neverendVipUnlocked;
  state.chips = Math.max(0, Math.floor(Number(run.chips || 0)));
  state.neverendBossClearFlags = run.neverendBossClearFlags && typeof run.neverendBossClearFlags === "object" ? run.neverendBossClearFlags : {};
  state.auctionRefreshState = run.auctionRefreshState && typeof run.auctionRefreshState === "object"
    ? { ...createDefaultAuctionRefreshState(), ...run.auctionRefreshState }
    : createDefaultAuctionRefreshState();
  state.rouletteStats = run.rouletteStats && typeof run.rouletteStats === "object"
    ? { ...createDefaultRouletteStats(), ...run.rouletteStats }
    : createDefaultRouletteStats();
  state.neverendUi = run.neverendUi && typeof run.neverendUi === "object"
    ? { ...createDefaultNeverendUiState(), ...run.neverendUi }
    : createDefaultNeverendUiState();
  state.clearedStages = Array.isArray(run.clearedStages) ? run.clearedStages : state.clearedStages;
  state.fieldBossCleared = Array.isArray(run.fieldBossCleared) ? run.fieldBossCleared : state.fieldBossCleared;
  state.stageProgressById = run.stageProgressById || state.stageProgressById;
  state.battleSpeedMultiplier = run.battleSpeedMultiplier || 1;
  state.unlockedBattleSpeedOptions = Array.isArray(run.unlockedBattleSpeedOptions) ? run.unlockedBattleSpeedOptions : [1];
  state.unlockedTitles = Array.isArray(run.unlockedTitles) ? run.unlockedTitles : [];
  state.activeTitles = Array.isArray(run.activeTitles) ? run.activeTitles : [];
  state.equippedNormalTitleIds = Array.isArray(run.equippedNormalTitleIds) ? run.equippedNormalTitleIds : [];
  state.equippedCheatTitleIds = Array.isArray(run.equippedCheatTitleIds) ? run.equippedCheatTitleIds : [];
  state.baseNormalTitleSlots = Number(run.baseNormalTitleSlots || state.baseNormalTitleSlots || TITLE_SLOT_RULES.normal.baseDefault);
  state.baseCheatTitleSlots = Number(run.baseCheatTitleSlots || state.baseCheatTitleSlots || TITLE_SLOT_RULES.cheat.baseDefault);
  state.normalTitleTierBonus = Number(run.normalTitleTierBonus || state.normalTitleTierBonus || 0);
  state.cheatTitleTierBonus = Number(run.cheatTitleTierBonus || state.cheatTitleTierBonus || 0);
  state.maxNormalTitleSlots = Number(run.maxNormalTitleSlots || state.maxNormalTitleSlots || TITLE_SLOT_RULES.normal.baseDefault);
  state.maxCheatTitleSlots = Number(run.maxCheatTitleSlots || state.maxCheatTitleSlots || TITLE_SLOT_RULES.cheat.baseDefault);
  state.titleSlotUnlocks = { ...(state.titleSlotUnlocks || {}), ...(run.titleSlotUnlocks || {}) };
  state.board = { ...state.board, ...(run.board || {}) };
  state.guild = { ...state.guild, ...(run.guild || {}) };
  state.player = { ...state.player, ...(run.player || {}) };
  state.stats = { ...state.stats, ...(run.stats || {}) };
  if (typeof state.stats.noReturnExpeditionActive !== "boolean") state.stats.noReturnExpeditionActive = true;
  if (!state.stats.noReturnRegionClears || typeof state.stats.noReturnRegionClears !== "object") state.stats.noReturnRegionClears = {};
  if (typeof state.stats.fullNormalHeavyWinCount !== "number") state.stats.fullNormalHeavyWinCount = 0;
  if (typeof state.stats.bossKillWithEmptySkillSlots !== "number") state.stats.bossKillWithEmptySkillSlots = 0;
  if (typeof state.stats.uniqueNoRetreatResolveCount !== "number") state.stats.uniqueNoRetreatResolveCount = 0;
  if (typeof state.stats.uniqueRetreatCount !== "number") state.stats.uniqueRetreatCount = 0;
  if (typeof state.stats.grasslandWinStreakCurrent !== "number") state.stats.grasslandWinStreakCurrent = 0;
  if (typeof state.stats.grasslandWinStreakBest !== "number") state.stats.grasslandWinStreakBest = 0;
  if (typeof state.stats.swordsmanSingleWeaponBossKillCount !== "number") state.stats.swordsmanSingleWeaponBossKillCount = 0;
  if (typeof state.stats.mageDualWeaponBossKillCount !== "number") state.stats.mageDualWeaponBossKillCount = 0;
  if (typeof state.stats.ninjaNoWeaponDebuffApplyCount !== "number") state.stats.ninjaNoWeaponDebuffApplyCount = 0;
  if (typeof state.stats.ninjaGrasslandDebuffApplyCount !== "number") state.stats.ninjaGrasslandDebuffApplyCount = 0;
  if (typeof state.stats.ninjaNoWeaponBossKillCount !== "number") state.stats.ninjaNoWeaponBossKillCount = 0;
  if (typeof state.stats.ninjaLowEvasionBossDefeatCount !== "number") state.stats.ninjaLowEvasionBossDefeatCount = 0;
  if (typeof state.stats.ninjaStage11DefeatCount !== "number") state.stats.ninjaStage11DefeatCount = 0;
  if (typeof state.stats.priestNoSkillKillCount !== "number") state.stats.priestNoSkillKillCount = 0;
  if (typeof state.stats.priestNoHealWinCount !== "number") state.stats.priestNoHealWinCount = 0;
  if (typeof state.stats.priestOnlyOffenseWinCount !== "number") state.stats.priestOnlyOffenseWinCount = 0;
  if (typeof state.stats.priestHelpToggleCount !== "number") state.stats.priestHelpToggleCount = 0;
  if (typeof state.stats.priestSettingsSaveCount !== "number") state.stats.priestSettingsSaveCount = 0;
  if (typeof state.stats.priestDesertBossClearCount !== "number") state.stats.priestDesertBossClearCount = 0;
  if (typeof state.stats.priestDesertBossWithFourHealsCount !== "number") state.stats.priestDesertBossWithFourHealsCount = 0;
  if (typeof state.stats.swordsmanBossKillCount !== "number") state.stats.swordsmanBossKillCount = 0;
  if (typeof state.stats.swordsmanDesertBossClearCount !== "number") state.stats.swordsmanDesertBossClearCount = 0;
  if (typeof state.stats.swordsmanNoArmorDesertBossClearCount !== "number") state.stats.swordsmanNoArmorDesertBossClearCount = 0;
  if (typeof state.stats.mageDesertBossSingleSkillClearCount !== "number") state.stats.mageDesertBossSingleSkillClearCount = 0;
  if (typeof state.stats.mageDesertBossFourAttackSkillsClearCount !== "number") state.stats.mageDesertBossFourAttackSkillsClearCount = 0;
  if (typeof state.stats.mageDesertBossFourBuffSkillsClearCount !== "number") state.stats.mageDesertBossFourBuffSkillsClearCount = 0;
  if (typeof state.stats.mageBossDefeatCount !== "number") state.stats.mageBossDefeatCount = 0;
  if (typeof state.stats.comboDesertBossClear_swordsman_swordsman !== "number") state.stats.comboDesertBossClear_swordsman_swordsman = 0;
  if (typeof state.stats.comboDesertBossClear_mage_swordsman !== "number") state.stats.comboDesertBossClear_mage_swordsman = 0;
  if (typeof state.stats.comboDesertBossClear_ninja_swordsman !== "number") state.stats.comboDesertBossClear_ninja_swordsman = 0;
  if (typeof state.stats.comboDesertBossClear_priest_swordsman !== "number") state.stats.comboDesertBossClear_priest_swordsman = 0;
  if (typeof state.stats.comboDesertBossClear_mage_mage !== "number") state.stats.comboDesertBossClear_mage_mage = 0;
  if (typeof state.stats.comboDesertBossClear_mage_ninja !== "number") state.stats.comboDesertBossClear_mage_ninja = 0;
  if (typeof state.stats.comboDesertBossClear_mage_priest !== "number") state.stats.comboDesertBossClear_mage_priest = 0;
  if (typeof state.stats.comboDesertBossClear_ninja_ninja !== "number") state.stats.comboDesertBossClear_ninja_ninja = 0;
  if (typeof state.stats.comboDesertBossClear_ninja_priest !== "number") state.stats.comboDesertBossClear_ninja_priest = 0;
  if (typeof state.stats.comboDesertBossClear_priest_priest !== "number") state.stats.comboDesertBossClear_priest_priest = 0;
  if (typeof state.stats.productionWorkshopButtonPressCount !== "number") state.stats.productionWorkshopButtonPressCount = 0;
  if (typeof state.stats.productionWorkshopStaySeconds !== "number") state.stats.productionWorkshopStaySeconds = 0;
  if (typeof state.stats.productionWorkshopStayMs !== "number") state.stats.productionWorkshopStayMs = 0;
  state.jobEvolutionFlags = { ...state.jobEvolutionFlags, ...(run.jobEvolutionFlags || {}) };
  state.unlockedSkills = { ...state.unlockedSkills, ...(run.unlockedSkills || {}) };
  state.stats.defeatsByStage = state.stats.defeatsByStage || {};
  state.guild.activeQuestIds = run.quests?.active || state.guild.activeQuestIds;
  state.guild.completedQuestIds = run.quests?.completed || state.guild.completedQuestIds;
  state.guild.claimedQuestIds = run.quests?.claimed || state.guild.claimedQuestIds;
  state.guild.activeGuildQuests = Array.isArray(state.guild.activeGuildQuests) && state.guild.activeGuildQuests.length
    ? state.guild.activeGuildQuests
    : [...state.guild.activeQuestIds];
  state.guild.guildQuestPool = Array.isArray(state.guild.guildQuestPool) ? state.guild.guildQuestPool : [];
  state.guild.clearedQuestHistory = Array.isArray(state.guild.clearedQuestHistory) ? state.guild.clearedQuestHistory : [];
  state.guild.questRepeatLevels = state.guild.questRepeatLevels || {};
  state.guild.questGenerationSeed = Number(state.guild.questGenerationSeed) > 0 ? Number(state.guild.questGenerationSeed) : 1;
  state.guild.guildQuestStats = {
    generated: Number(state.guild.guildQuestStats?.generated || 0),
    completed: Number(state.guild.guildQuestStats?.completed || 0),
    claimed: Number(state.guild.guildQuestStats?.claimed || 0),
    refreshed: Number(state.guild.guildQuestStats?.refreshed || 0)
  };
  state.guild.rank = normalizeGuildRank(state.guild.rank);
  state.guild.points = Number(state.guild.points || 0);
  state.guild.guildQuestLastGeneratedRegion = typeof state.guild.guildQuestLastGeneratedRegion === "string" && state.guild.guildQuestLastGeneratedRegion
    ? state.guild.guildQuestLastGeneratedRegion
    : getCurrentGuildRegionId();
  state.guild.guildQuestRefreshVersion = Number(state.guild.guildQuestRefreshVersion || 0);
  state.guild.guildRankNormalTitleSlotBonus = Number(state.guild.guildRankNormalTitleSlotBonus || 0);
  state.guild.guildRankCheatTitleSlotBonus = Number(state.guild.guildRankCheatTitleSlotBonus || 0);
  state.guild.lastRankCapNoticeKey = typeof state.guild.lastRankCapNoticeKey === "string" ? state.guild.lastRankCapNoticeKey : "";
  state.guild.shopRegionTab = SHOP_REGION_TABS.some((tab) => tab.id === state.guild.shopRegionTab) ? state.guild.shopRegionTab : "grassland";
  state.guild.shopMode = state.guild.shopMode === "sell" ? "sell" : "buy";
  ensureNeverendState();
  if (state.hasNeverendTicket || state.neverendUnlocked) {
    unlockNeverendAccess({ silent: true });
  }
  if (state.currentTown === "neverend" && !canEnterNeverend()) {
    state.currentTown = "balladore";
    state.currentMap = TOWN_DATA.balladore.mapId;
  }

  state.loop.loopCount = persistent.loop?.loopCount || 0;
  state.loop.carriedTitles = persistent.loop?.carriedTitles || [];
  state.loop.unlockedFeatures = persistent.loop?.unlockedFeatures || [];
  state.loop.loopRewardFlags = persistent.loop?.loopRewardFlags || {};
  state.loop.loopBossKillFlags = persistent.loop?.loopBossKillFlags || {};
  state.loop.specialChallengeClearFlags = persistent.loop?.specialChallengeClearFlags || {};
  state.loop.persistentUnlocks = persistent.loop?.persistentUnlocks || {};
  state.loop.unlockedLoopChallengeIds = persistent.loop?.unlockedLoopChallengeIds || [];
  state.loop.persistentStats = { ...state.loop.persistentStats, ...(persistent.loop?.persistentStats || {}) };
  state.loop.titleHistory = persistent.loop?.titleHistory || [];
  state.titleLimitBase = persistent.titleLimit?.base ?? state.titleLimitBase;
  state.titleLimitBonus = persistent.titleLimit?.bonus ?? state.titleLimitBonus;
  state.titleLimitUpgradeLevel = persistent.titleLimit?.upgradeLevel ?? state.titleLimitUpgradeLevel;
  state.unlockedTitleLimitUpgrades = persistent.titleLimit?.unlockedUpgrades || [];
  state.titleSlotUnlocks = {
    ...(state.titleSlotUnlocks || {}),
    normalBasePlus: Number(persistent.titleSlotUpgrades?.normalBasePlus ?? state.titleSlotUnlocks?.normalBasePlus ?? 0),
    cheatBasePlus: Number(persistent.titleSlotUpgrades?.cheatBasePlus ?? state.titleSlotUnlocks?.cheatBasePlus ?? 0)
  };
  state.clearedRegionBossSlotRewards = normalizeRegionBossSlotRewardState(
    persistent.titleSlotUpgrades?.clearedRegionBossSlotRewards ??
      inferRegionBossSlotRewardsFromFieldBossCleared(state.fieldBossCleared)
  );
  state.cheatTitleSlotShopPurchases = normalizeCheatTitleSlotShopState(
    persistent.titleSlotUpgrades?.cheatTitleSlotShopPurchases ?? state.cheatTitleSlotShopPurchases
  );
  state.unlockedEndings = persistent.endings?.unlockedEndings || [];
  state.finalContentUnlocked = !!persistent.endings?.finalContentUnlocked;
  state.finalBossFlags = persistent.endings?.finalBossFlags || {};
  state.endingProgressFlags = persistent.endings?.endingProgressFlags || {};
  state.worldStateFlags = persistent.endings?.worldStateFlags || {};
  state.uniqueDefeatedIds = persistent.unique?.uniqueDefeatedIds || [];
  state.uniqueEncounterCount = persistent.unique?.uniqueEncounterCount || 0;
  state.uniqueKillCount = persistent.unique?.uniqueKillCount || 0;
  state.unlockedUniqueSkills = persistent.unique?.unlockedUniqueSkills || [];

  state.settings = { ...state.settings, ...(settings.settings || {}) };
  state.ui.logAutoScroll = settings.ui?.logAutoScroll ?? state.ui.logAutoScroll;
  state.ui.logFilter = settings.ui?.logFilter || state.ui.logFilter;
  state.ui.helpOpen = settings.ui?.helpOpen ?? state.ui.helpOpen;
  state.ui.topHudCollapsed = settings.ui?.topHudCollapsed ?? state.ui.topHudCollapsed;
  state.ui.lastMainTab = settings.ui?.lastMainTab || state.ui.lastMainTab;
  state.ui.systemSubTab = settings.ui?.systemSubTab || state.ui.systemSubTab;
  syncEquipmentEnhancementCache();

  stopBattleLoop();
  state.battle.isActive = false;
  state.battle.status = "待機中";
  state.activeEffects = [];
  state.skillCooldowns = {};
  state.ui.autoItemVisualEffects = {};
  applyLoopUnlocks();
  applyLoopTitleLimitUpgrades();
  updateGuildRank({ silent: true, refreshOnChange: false });
  ensureTitleSlotState();
  normalizeEquippedTitleSlots({ logOnTrim: false });
  syncStoryProgress({ silent: true, skipBoardRefresh: true });
  updateBoardThreadsFromProgress();
  initializeJobEvolutionState({ silent: true });
  recalculateTitleEffects();
  refreshPlayerDerivedStats();
  updateUnlockedBattleSpeeds();
  return true;
}

function saveGame(mode = "manual") {
  if (mode === "manual" && state.settings.saveConfirmDialog) {
    const okConfirm = window.confirm("現在の進行を保存しますか？");
    if (!okConfirm) {
      return false;
    }
  }
  if (state.battle.isActive) {
    if (mode === "manual") {
      addLog("戦闘中はセーブできません。戦闘終了後に実行してください。");
      render();
    }
    return false;
  }
  const payload = buildSavePayload();
  const okMain = safeSaveJson(STORAGE_KEYS.MAIN, payload);
  const okBackup = safeSaveJson(STORAGE_KEYS.BACKUP, payload);
  safeSaveJson(STORAGE_KEYS.SETTINGS, payload.settingsState);
  safeSaveJson(STORAGE_KEYS.PERSISTENT, payload.persistentState);
  safeSaveJson(STORAGE_KEYS.META, { version: SAVE_VERSION, savedAt: payload.savedAt, mode });
  if (okMain && okBackup) {
    state.runtime.lastAutoSaveAt = Date.now();
    if (mode === "manual") {
      showToast("セーブしました。", "important");
      addLog("手動セーブ完了。");
    }
    return true;
  }
  addLog("セーブに失敗しました。ストレージ容量を確認してください。");
  return false;
}

function loadGame() {
  const main = safeLoadJson(STORAGE_KEYS.MAIN);
  if (main && applyLoadedState(main)) {
    showToast("ロード成功", "important");
    return true;
  }
  return loadBackupGame();
}

function loadBackupGame() {
  const backup = safeLoadJson(STORAGE_KEYS.BACKUP);
  if (backup && applyLoadedState(backup)) {
    addLog("バックアップから復元しました。");
    showToast("バックアップ復元", "important");
    return true;
  }
  addLog("復元可能なセーブデータがありません。");
  return false;
}

function resetRunState() {
  localStorage.removeItem(STORAGE_KEYS.MAIN);
  localStorage.removeItem(STORAGE_KEYS.BACKUP);
  addLog("現在周回データを初期化しました。");
  location.reload();
}

function resetAllData() {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  addLog("全データを初期化しました。");
  location.reload();
}

function exportSaveSummary() {
  const payload = safeLoadJson(STORAGE_KEYS.MAIN);
  if (!payload || !payload.runState) {
    return {
      level: state.player.level,
      town: TOWN_DATA[state.currentTown]?.name || "不明",
      stage: state.currentStage,
      loopCount: state.loop.loopCount,
      titleCount: state.unlockedTitles.length,
      playtimeSec: state.loop.persistentStats.totalPlaytime || 0,
      currentLoopPlaytimeSec: state.stats.currentLoopPlaytime || 0,
      savedAt: "未保存",
      speeds: (state.unlockedBattleSpeedOptions || [1]).join("x / ") + "x",
      titleLimit: getCurrentTitleLimit()
    };
  }
  return {
    level: payload.runState.player?.level || 1,
    town: TOWN_DATA[payload.runState.currentTown]?.name || payload.runState.currentTown || "不明",
    stage: payload.runState.currentStage || "1-1",
    loopCount: payload.persistentState?.loop?.loopCount || 0,
    titleCount: (payload.runState.unlockedTitles || []).length,
    playtimeSec: payload.persistentState?.loop?.persistentStats?.totalPlaytime || 0,
    currentLoopPlaytimeSec: payload.runState?.stats?.currentLoopPlaytime || 0,
    savedAt: payload.savedAt || "不明",
    speeds: ((payload.runState.unlockedBattleSpeedOptions || [1]).map((s) => `${s}x`).join(" / ")),
    titleLimit:
      ((payload.runState?.maxNormalTitleSlots ?? 0) + (payload.runState?.maxCheatTitleSlots ?? 0)) ||
      ((payload.persistentState?.titleLimit?.base ?? 1) +
        (payload.persistentState?.titleLimit?.bonus ?? 0) +
        (payload.persistentState?.titleLimit?.upgradeLevel ?? 0))
  };
}

function autoSaveIfNeeded(triggerType = "timer") {
  const triggers = new Set(["stageClear", "bossClear", "townMove", "titleUnlock", "loopStart", "endingProgress", "timer"]);
  if (!triggers.has(triggerType)) {
    return;
  }
  const now = Date.now();
  if (triggerType === "timer" && now - (state.runtime.lastAutoSaveAt || 0) < AUTO_SAVE_INTERVAL_MS) {
    return;
  }
  if (state.battle.isActive) {
    return;
  }
  saveGame("auto");
}

function parseQualityItemId(itemId) {
  const parts = String(itemId).split("__");
  if (parts.length >= 2) {
    return { baseId: parts[0], quality: parts[1] };
  }
  return { baseId: itemId, quality: "normal" };
}

function getQualityMultiplier(quality) {
  if (quality === "great") return 1.15;
  if (quality === "high") return 1.3;
  if (quality === "god") return 1.6;
  return 1;
}

function getItemNameJa(itemId) {
  const baseId = parseQualityItemId(itemId).baseId;
  const item = ITEM_DATA[baseId] || ITEM_DATA[itemId];
  return item?.nameJa || item?.name || baseId || itemId;
}

function getRemainingItemCount(itemId) {
  return getInventoryCount(itemId);
}

function consumeItem(itemId) {
  return removeItem(itemId, 1);
}

function getAutoUsableItemList() {
  return Object.values(ITEM_DATA).filter((item) => item.autoUsable);
}

function calculateHpConsumableHeal(baseId, qualityMul = 1) {
  const maxHp = getEffectivePlayerStat("maxHp");
  const item = ITEM_DATA[baseId];
  if (baseId === "potion") {
    return Math.max(item?.healAmount || 12, Math.floor(maxHp * 0.18 * qualityMul));
  }
  if (baseId === "hiPotion") {
    return Math.max(item?.healAmount || 24, Math.floor(maxHp * 0.32 * qualityMul));
  }
  if (item?.effectType === "heal_hp") {
    return Math.max(1, Math.floor((item.healAmount || 0) * qualityMul));
  }
  return 0;
}

function getAutoItemCooldownRemaining(slotIndex) {
  const slot = state.autoUseItems[slotIndex];
  if (!slot) {
    return 0;
  }
  const remaining = Math.max(0, (slot.cooldownUntil || 0) - Date.now());
  slot.cooldownRemaining = Math.ceil(remaining / 1000);
  return remaining;
}

function getAutoUseItemState(slotIndex) {
  const slot = state.autoUseItems[slotIndex];
  if (!slot) {
    return { code: "invalid", label: "無効", slot: null, item: null, count: 0, threshold: 0, cooldownMs: 0 };
  }
  const item = slot.itemId ? ITEM_DATA[slot.itemId] : null;
  const count = slot.itemId ? getRemainingItemCount(slot.itemId) : 0;
  const cooldownMs = getAutoItemCooldownRemaining(slotIndex);
  const hpRate = state.battle?.isActive
    ? (state.battle.playerCurrentHp / Math.max(1, getEffectivePlayerStat("maxHp"))) * 100
    : 100;
  const mpRate = state.battle?.isActive
    ? (state.battle.playerCurrentMp / Math.max(1, getEffectivePlayerStat("maxMp"))) * 100
    : 100;
  const conditionRate = item?.effectType === "heal_mp" ? mpRate : hpRate;
  const firedUntil = (state.ui.autoItemVisualEffects || {})[String(slotIndex)] || 0;
  if (!slot.isEnabled) {
    return { code: "disabled", label: "無効", slot, item, count, threshold: slot.hpThresholdPercent, cooldownMs };
  }
  if (!item) {
    return { code: "no_item", label: "未設定", slot, item, count, threshold: slot.hpThresholdPercent, cooldownMs };
  }
  if (firedUntil > Date.now()) {
    return { code: "fired", label: "今使った", slot, item, count, threshold: slot.hpThresholdPercent, cooldownMs };
  }
  if (count <= 0) {
    return { code: "out_of_stock", label: "在庫切れ", slot, item, count, threshold: slot.hpThresholdPercent, cooldownMs };
  }
  if (cooldownMs > 0) {
    return { code: "cooldown", label: `クールタイム ${(cooldownMs / 1000).toFixed(1)}秒`, slot, item, count, threshold: slot.hpThresholdPercent, cooldownMs };
  }
  if (!state.battle?.isActive) {
    return { code: "standby", label: "待機中", slot, item, count, threshold: slot.hpThresholdPercent, cooldownMs };
  }
  if (conditionRate > slot.hpThresholdPercent) {
    return { code: "condition_not_met", label: "条件未達", slot, item, count, threshold: slot.hpThresholdPercent, cooldownMs };
  }
  return { code: "usable", label: "使用可能", slot, item, count, threshold: slot.hpThresholdPercent, cooldownMs };
}

function triggerAutoItemVisualEffect(slotIndex) {
  state.ui.autoItemVisualEffects = {
    ...(state.ui.autoItemVisualEffects || {}),
    [String(slotIndex)]: Date.now() + 900
  };
}

function setAutoUseItem(slotIndex, itemId) {
  const idx = Number(slotIndex);
  if (!Number.isInteger(idx) || idx < 0 || idx >= AUTO_USE_SLOT_COUNT) {
    return;
  }
  const row = state.autoUseItems[idx];
  const value = itemId && ITEM_DATA[itemId]?.autoUsable ? itemId : null;
  row.itemId = value;
  row.cooldownRemaining = 0;
  row.cooldownUntil = 0;
  row.lastUsedAt = 0;
  addLog(`自動使用設定: スロット${idx + 1} を ${value ? getItemNameJa(value) : "未設定"} に変更`);
}

function setAutoUseThreshold(slotIndex, percent) {
  const idx = Number(slotIndex);
  const p = Number(percent);
  if (!Number.isInteger(idx) || idx < 0 || idx >= AUTO_USE_SLOT_COUNT) {
    return;
  }
  if (!AUTO_USE_HP_THRESHOLD_OPTIONS.includes(p)) {
    return;
  }
  state.autoUseItems[idx].hpThresholdPercent = p;
  addLog(`自動使用設定: スロット${idx + 1} の条件をHP${p}%以下に変更`);
}

function toggleAutoUseItem(slotIndex) {
  const idx = Number(slotIndex);
  if (!Number.isInteger(idx) || idx < 0 || idx >= AUTO_USE_SLOT_COUNT) {
    return;
  }
  state.autoUseItems[idx].isEnabled = !state.autoUseItems[idx].isEnabled;
  addLog(`自動使用設定: スロット${idx + 1} を ${state.autoUseItems[idx].isEnabled ? "有効" : "無効"} に変更`);
}

function tryUseAutoItem(slotIndex) {
  const idx = Number(slotIndex);
  const stateData = getAutoUseItemState(idx);
  if (stateData.code !== "usable") {
    return false;
  }
  const slot = state.autoUseItems[idx];
  const item = stateData.item;
  if (!slot || !item || !consumeItem(item.id)) {
    return false;
  }
  if (item.effectType === "heal_mp") {
    const maxMp = getEffectivePlayerStat("maxMp");
    const mp = item.id === "hiEther"
      ? Math.max(20, Math.floor(maxMp * 0.5))
      : Math.max(10, Math.floor(maxMp * 0.25));
    if (state.battle.isActive) state.battle.playerCurrentMp = Math.min(maxMp, state.battle.playerCurrentMp + mp);
    state.player.mp = Math.min(maxMp, state.player.mp + mp);
    addLog(`${getItemNameJa(item.id)}を自動使用した！ MPが${mp}回復した`);
  } else {
    const heal = calculateHpConsumableHeal(item.id, 1);
    const result = applyHealing(heal, getItemNameJa(item.id), true);
    addLog(`${getItemNameJa(item.id)}を自動使用した！ HPが${Math.floor(result.actualHeal)}回復した`);
  }
  const cooldownSec = Number(item.cooldown || 0);
  slot.cooldownUntil = Date.now() + cooldownSec * 1000;
  slot.cooldownRemaining = cooldownSec;
  slot.lastUsedAt = Date.now();
  state.battle.autoItemGlobalCooldownUntil = Date.now() + 700;
  state.battle.itemUsedInStage = true;
  triggerAutoItemVisualEffect(idx);
  return true;
}

function checkAutoUseItems() {
  if (!state.battle?.isActive || state.battle.playerCurrentHp <= 0) {
    return false;
  }
  if ((state.battle.autoItemGlobalCooldownUntil || 0) > Date.now()) {
    return false;
  }
  for (let idx = 0; idx < AUTO_USE_SLOT_COUNT; idx += 1) {
    if (tryUseAutoItem(idx)) {
      return true;
    }
  }
  return false;
}

function useInventoryItem(itemId) {
  if (!removeItem(itemId, 1)) {
    return;
  }
  const parsed = parseQualityItemId(itemId);
  const baseId = parsed.baseId;
  const qualityMul = getQualityMultiplier(parsed.quality);
  const maxMp = getEffectivePlayerStat("maxMp");
  let used = false;

  if (baseId === "potion") {
    const heal = calculateHpConsumableHeal(baseId, qualityMul);
    const result = applyHealing(heal, getItemNameJa(baseId), true);
    addLog(`アイテム使用: ${getItemNameJa(baseId)}でHP+${result.actualHeal}`);
    used = true;
  } else if (baseId === "hiPotion") {
    const heal = calculateHpConsumableHeal(baseId, qualityMul);
    const result = applyHealing(heal, getItemNameJa(baseId), true);
    addLog(`アイテム使用: ${getItemNameJa(baseId)}でHP+${result.actualHeal}`);
    used = true;
  } else if (baseId === "ether") {
    const mp = Math.max(10, Math.floor(maxMp * 0.25 * qualityMul));
    if (state.battle.isActive) state.battle.playerCurrentMp = Math.min(maxMp, state.battle.playerCurrentMp + mp);
    state.player.mp = Math.min(maxMp, state.player.mp + mp);
    addLog(`アイテム使用: エーテルでMP+${mp}`);
    used = true;
  } else if (baseId === "hiEther") {
    const mp = Math.max(20, Math.floor(maxMp * 0.5 * qualityMul));
    if (state.battle.isActive) state.battle.playerCurrentMp = Math.min(maxMp, state.battle.playerCurrentMp + mp);
    state.player.mp = Math.min(maxMp, state.player.mp + mp);
    addLog(`アイテム使用: ハイエーテルでMP+${mp}`);
    used = true;
  } else if (baseId === "attackTonic") {
    applyEffect("player", `item_${baseId}`, { stat: "attack", multiplier: 1 + 0.12 * qualityMul, durationMs: Math.floor(70000 * qualityMul) });
    addLog("アイテム使用: 攻撃バフ薬で攻撃上昇");
    used = true;
  } else if (baseId === "defenseTonic") {
    applyEffect("player", `item_${baseId}`, { stat: "defense", multiplier: 1 + 0.12 * qualityMul, durationMs: Math.floor(70000 * qualityMul) });
    addLog("アイテム使用: 防御バフ薬で防御上昇");
    used = true;
  } else if (baseId === "speedTonic") {
    applyEffect("player", `item_${baseId}`, { stat: "speed", multiplier: 1 + 0.12 * qualityMul, durationMs: Math.floor(70000 * qualityMul) });
    addLog("アイテム使用: 速度薬で速度上昇");
    used = true;
  } else if (baseId === "grilledMeat") {
    applyEffect("player", `food_${baseId}`, { stat: "attack", multiplier: 1 + 0.1 * qualityMul, durationMs: Math.floor(90000 * qualityMul * (1 + state.titleEffects.cookingDurationBonus)) });
    addLog("料理効果: 焼き肉で攻撃上昇");
    used = true;
  } else if (baseId === "vegeSoup") {
    applyEffect("player", `food_${baseId}`, { stat: "defense", multiplier: 1 + 0.1 * qualityMul, durationMs: Math.floor(100000 * qualityMul * (1 + state.titleEffects.cookingDurationBonus)) });
    addLog("料理効果: 野菜スープで防御上昇");
    used = true;
  } else if (baseId === "gourmetMeat") {
    applyEffect("player", `food_${baseId}_atk`, { stat: "attack", multiplier: 1 + 0.12 * qualityMul, durationMs: Math.floor(120000 * qualityMul * (1 + state.titleEffects.cookingDurationBonus)) });
    applyEffect("player", `food_${baseId}_spd`, { stat: "speed", multiplier: 1 + 0.12 * qualityMul, durationMs: Math.floor(120000 * qualityMul * (1 + state.titleEffects.cookingDurationBonus)) });
    addLog("料理効果: 豪華肉料理で攻撃・速度上昇");
    used = true;
  } else if (baseId === "failedDish") {
    addLog("焦げた料理を食べた。何も起きなかった。");
    used = true;
  } else if (baseId === "kingsElixir") {
    const heal = calculateHpConsumableHeal(baseId, Math.max(1.35, qualityMul));
    const result = applyHealing(heal, getItemNameJa(baseId), true);
    addLog(`アイテム使用: 王の秘薬でHP+${result.actualHeal}`);
    used = true;
  } else if (baseId === "angelElixir") {
    const heal = calculateHpConsumableHeal(baseId, Math.max(1.8, qualityMul));
    const result = applyHealing(heal, getItemNameJa(baseId), true);
    if (state.battle.isActive) {
      const mp = Math.max(30, Math.floor(maxMp * 0.45));
      state.battle.playerCurrentMp = Math.min(maxMp, state.battle.playerCurrentMp + mp);
      state.player.mp = Math.min(maxMp, state.player.mp + mp);
      addLog(`アイテム使用: 天使の霊薬でHP+${result.actualHeal}, MP+${mp}`);
    } else {
      addLog(`アイテム使用: 天使の霊薬でHP+${result.actualHeal}`);
    }
    used = true;
  } else if (baseId === "berserkStim") {
    applyEffect("player", `item_${baseId}_atk`, { stat: "attack", multiplier: 1.28, durationMs: 90000 });
    applyEffect("player", `item_${baseId}_def`, { stat: "defense", multiplier: 0.84, durationMs: 90000 });
    addLog("アイテム使用: 暴走促進剤で攻撃上昇 / 防御低下");
    used = true;
  } else if (baseId === "fullRebootDrug") {
    const heal = Math.max(1, Math.floor(getEffectivePlayerStat("maxHp") * 0.95));
    const result = applyHealing(heal, getItemNameJa(baseId), true);
    if (state.battle.isActive) {
      state.battle.playerCurrentMp = getEffectivePlayerStat("maxMp");
    }
    state.player.mp = getEffectivePlayerStat("maxMp");
    addLog(`アイテム使用: 完全再起動薬でHP+${result.actualHeal}, MP全快`);
    used = true;
  }

  if (!used) {
    addItem(itemId, 1);
    addLog("このアイテムはまだ使用できません。");
  } else if (state.battle.isActive) {
    state.battle.itemUsedInStage = true;
  }
  render();
}

function handleSecondTick() {
  state.loop.persistentStats.totalPlaytime = (state.loop.persistentStats.totalPlaytime || 0) + 1;
  state.loop.persistentStats.lifetimePlaytime = (state.loop.persistentStats.lifetimePlaytime || 0) + 1;
  state.stats.currentLoopPlaytime = (state.stats.currentLoopPlaytime || 0) + 1;
  if (state.screen === "title") {
    state.stats.titleScreenIdleSeconds += 1;
    checkTitleUnlocks("secondTick");
  }
  if (state.screen === "game") {
    if (!state.battle.isActive) {
      state.stats.noBattleSinceLoginSeconds += 1;
    }
    if (state.currentTab === "adventure" && state.currentMap === "grassland" && !state.battle.isActive) {
      state.stats.idleGrasslandSeconds += 1;
      checkTitleUnlocks("secondTick");
    }
    if (state.battleSpeedMultiplier > 1) {
      state.stats.speedModeSeconds += 1;
    }
    if (isProductionWorkshopContext()) {
      state.stats.productionWorkshopStaySeconds = (state.stats.productionWorkshopStaySeconds || 0) + 1;
      state.stats.productionWorkshopStayMs = (state.stats.productionWorkshopStayMs || 0) + 1000;
      checkTitleUnlocks("workshopStayTick");
    }
    autoSaveIfNeeded("timer");
  }
}

function bindGameEvents() {
  const timerBtn = document.getElementById("timer-button");
  if (timerBtn) {
    timerBtn.addEventListener("click", handleTimerClick);
  }
  document.querySelectorAll(".speed-chip").forEach((btn) =>
    btn.addEventListener("click", () => {
      const value = Number(btn.dataset.speedValue || 1);
      applyBattleSpeed(value);
    })
  );
  const bgmBtn = document.getElementById("bgm-toggle-btn");
  if (bgmBtn) {
    bgmBtn.addEventListener("click", () => {
      state.settings.bgmOn = !state.settings.bgmOn;
      addLog(`BGM設定: ${state.settings.bgmOn ? "ON" : "OFF"}`);
      safeSaveJson(STORAGE_KEYS.SETTINGS, buildSavePayload().settingsState);
      render();
    });
  }
  const helpBtn = document.getElementById("help-toggle-btn");
  if (helpBtn) {
    helpBtn.addEventListener("click", toggleHelpPanel);
  }
  const topbarToggleBtn = document.getElementById("topbar-toggle-btn");
  if (topbarToggleBtn) {
    topbarToggleBtn.addEventListener("click", toggleTopHudPanel);
  }
  const helpCloseBtn = document.getElementById("help-close-btn");
  if (helpCloseBtn) {
    helpCloseBtn.addEventListener("click", () => closeHelpPanel(true));
  }
  const backBtn = document.getElementById("back-to-title-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      state.stats.returnButtonCount += 1;
      checkTitleUnlocks("afterBack");
      goBackOneView();
    });
  }
  document.querySelectorAll(".log-filter-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      const filter = btn.dataset.logFilter || "all";
      if (state.ui.logFilter === filter) return;
      state.ui.logFilter = filter;
      render();
    })
  );
  const logAuto = document.getElementById("log-autoscroll-toggle");
  if (logAuto) {
    logAuto.addEventListener("change", () => {
      state.ui.logAutoScroll = !!logAuto.checked;
      renderLogPanel();
    });
  }
  const logClearBtn = document.getElementById("log-clear-btn");
  if (logClearBtn) {
    logClearBtn.addEventListener("click", () => {
      state.player.logs = [];
      addLog("ログをクリアしました。", "system");
      render();
    });
  }

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tabId;
      if (!tabId || tabId === state.currentTab) {
        return;
      }
      if (state.ui.helpOpen) {
        closeHelpPanel(false);
      }
      state.ui.lastMainTab = tabId;
      pushNavigationHistory();
      state.currentTab = tabId;
      state.stats.viewSwitchCount += 1;
      if (tabId === "guild" || tabId === "status" || tabId === "board") {
        state.stats.townVisitCount += 1;
        checkTitleUnlocks("townVisit");
      }
      checkTitleUnlocks("viewSwitch");
      if (tabId === "status" && state.statusSubTab === "titles") {
        openTitleCatalog();
      }
      if (tabId === "board") {
        state.stats.boardViewedCount += 1;
        checkTitleUnlocks("afterBoardView");
      }
      addLog(`メインメニュー切替: ${tabLabel(tabId)}`);
      render();
    });
  });

  if (state.currentTab === "adventure") {
    document.querySelectorAll(".town-btn").forEach((btn) => btn.addEventListener("click", () => selectTown(btn.dataset.townId)));
    document.querySelectorAll(".stage-select-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const stageId = btn.dataset.stageId;
        if (!stageId) {
          return;
        }
        const progress = getStageProgress(stageId);
        if (progress?.cleared) {
          retryClearedStage(stageId);
          return;
        }
        selectStage(stageId);
      })
    );
    const startBtn = document.getElementById("start-stage-battle-btn");
    if (startBtn) {
      startBtn.addEventListener("click", startStageBattle);
    }
    const nextBtn = document.getElementById("next-stage-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", goToNextStage);
    }
    const returnBtn = document.getElementById("return-town-btn");
    if (returnBtn) {
      returnBtn.addEventListener("click", () => {
        state.stats.returnButtonCount += 1;
        checkTitleUnlocks("afterBack");
        state.battle.status = "待機";
        state.stats.noRestStageClearStreak = 0;
        state.stats.desertNoRestStageClearStreak = 0;
        state.stats.noReturnExpeditionActive = false;
        state.stats.noReturnRegionClears = {};
        if (state.battle.isActive && state.battle.isUniqueBattle) {
          state.stats.uniqueRetreatCount = (state.stats.uniqueRetreatCount || 0) + 1;
        }
        render();
      });
    }
    const battleBackBtn = document.getElementById("battle-back-btn");
    if (battleBackBtn) {
      battleBackBtn.addEventListener("click", () => {
        state.stats.returnButtonCount += 1;
        checkTitleUnlocks("afterBack");
        state.battle.status = "待機";
        state.stats.noReturnExpeditionActive = false;
        state.stats.noReturnRegionClears = {};
        if (state.battle.isActive && state.battle.isUniqueBattle) {
          state.stats.uniqueRetreatCount = (state.stats.uniqueRetreatCount || 0) + 1;
        }
        render();
      });
    }
    document.querySelectorAll(".loop-challenge-start-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const challengeId = btn.dataset.loopChallengeId;
        const challenge = LOOP_CHALLENGE_DATA.find((row) => row.id === challengeId);
        if (!challenge) {
          return;
        }
        startEnhancedBossBattle(challenge.bossId);
      })
    );
    document.querySelectorAll(".final-boss-start-btn").forEach((btn) =>
      btn.addEventListener("click", () => startFinalBossBattle(btn.dataset.finalBossId))
    );
  }

  if (state.currentTab === "guild") {
    document.querySelectorAll(".guild-menu-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const facility = btn.dataset.facility;
        if (!facility || facility === state.guild.selectedFacility) {
          return;
        }
        pushNavigationHistory();
        state.guild.selectedFacility = facility;
        addLog(`ギルド施設切替: ${facility}`);
        render();
      });
    });
    document.querySelectorAll(".quest-accept-btn").forEach((btn) => btn.addEventListener("click", () => acceptQuest(btn.dataset.questId)));
    document.querySelectorAll(".quest-claim-btn").forEach((btn) => btn.addEventListener("click", () => claimQuestReward(btn.dataset.questId)));
    document.querySelectorAll(".loop-quest-claim-btn").forEach((btn) =>
      btn.addEventListener("click", () => claimLoopQuestReward(btn.dataset.loopQuestId))
    );
    document.querySelectorAll(".shop-buy-btn").forEach((btn) => btn.addEventListener("click", () => buyItem(btn.dataset.itemId)));
    document.querySelectorAll(".shop-sell-btn").forEach((btn) => btn.addEventListener("click", () => sellItem(btn.dataset.itemId)));
    document.querySelectorAll(".shop-mode-tab-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const mode = btn.dataset.shopMode;
        if (!["buy", "sell"].includes(mode) || mode === state.guild.shopMode) {
          return;
        }
        pushNavigationHistory();
        state.guild.shopMode = mode;
        render();
      })
    );
    document.querySelectorAll(".shop-region-tab-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const region = btn.dataset.shopRegion;
        if (!SHOP_REGION_TABS.some((tab) => tab.id === region) || region === state.guild.shopRegionTab) {
          return;
        }
        pushNavigationHistory();
        state.guild.shopRegionTab = region;
        render();
      })
    );
    document.querySelectorAll(".mainjob-select-btn").forEach((btn) => btn.addEventListener("click", () => selectMainJobFromTemple(btn.dataset.mainJobId)));
    document.querySelectorAll(".production-select-btn").forEach((btn) => btn.addEventListener("click", () => selectProductionJob(btn.dataset.productionJob)));
    document.querySelectorAll(".subjob-select-btn").forEach((btn) => btn.addEventListener("click", () => selectSubJob(btn.dataset.subJobId)));
    document.querySelectorAll(".evolve-main-job-btn").forEach((btn) => btn.addEventListener("click", () => evolveBattleJob("main")));
    document.querySelectorAll(".evolve-sub-job-btn").forEach((btn) => btn.addEventListener("click", () => evolveBattleJob("sub")));
    document.querySelectorAll(".evolve-production-job-btn").forEach((btn) => btn.addEventListener("click", () => evolveProductionJob()));
    document.querySelectorAll(".cheat-slot-offer-buy-btn").forEach((btn) =>
      btn.addEventListener("click", () => purchaseCheatTitleSlotOffer(btn.dataset.cheatSlotOfferId))
    );
    document.querySelectorAll(".workshop-tab-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const tab = btn.dataset.workshopTab;
        if (tab) {
          recordProductionWorkshopButtonPress();
        }
        if (!tab || tab === state.guild.workshopTab) {
          return;
        }
        pushNavigationHistory();
        state.guild.workshopTab = tab;
        render();
      })
    );
    document.querySelectorAll(".craft-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        recordProductionWorkshopButtonPress();
        craftItem(btn.dataset.recipeId);
      })
    );
    document.querySelectorAll(".craft-batch-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        recordProductionWorkshopButtonPress();
        craftRecipe(btn.dataset.recipeId, Number(btn.dataset.craftQty || 1));
      })
    );
    document.querySelectorAll(".enhance-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        recordProductionWorkshopButtonPress();
        enhanceEquipment(btn.dataset.itemId);
      })
    );
    document.querySelectorAll(".equipment-favorite-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        toggleEquipmentFavorite(btn.dataset.equipmentFavoriteId);
        renderPreservingWindowScroll();
      })
    );
    const gatherBtn = document.getElementById("gather-materials-btn");
    if (gatherBtn) {
      gatherBtn.addEventListener("click", () => {
        recordProductionWorkshopButtonPress();
        gatherMaterials(state.currentMap);
      });
    }
    document.querySelectorAll(".casino-buy-chip-btn").forEach((btn) =>
      btn.addEventListener("click", () => exchangeGoldToChips(Number(btn.dataset.gold || 0)))
    );
    document.querySelectorAll(".casino-sell-chip-btn").forEach((btn) =>
      btn.addEventListener("click", () => exchangeChipsToGold(Number(btn.dataset.chip || 0)))
    );
    document.querySelectorAll(".auction-buy-chip-btn").forEach((btn) =>
      btn.addEventListener("click", () => buyAuctionItem(btn.dataset.auctionId))
    );
    document.querySelectorAll(".auction-sell-chip-btn").forEach((btn) =>
      btn.addEventListener("click", () => sellAuctionItem(btn.dataset.itemId))
    );
    document.querySelectorAll(".roulette-number-btn").forEach((btn) =>
      btn.addEventListener("click", () => setRouletteNumber(Number(btn.dataset.number || 1), btn.dataset.vip === "1"))
    );
    const rouletteSpinBtn = document.getElementById("roulette-spin-btn");
    if (rouletteSpinBtn) {
      rouletteSpinBtn.addEventListener("click", () => spinNeverendRoulette(false));
    }
    const vipSpinBtn = document.getElementById("vip-spin-btn");
    if (vipSpinBtn) {
      vipSpinBtn.addEventListener("click", () => spinNeverendRoulette(true));
    }
  }

  if (state.currentTab === "board") {
    document.querySelectorAll(".board-category-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const category = btn.dataset.boardCategory || "all";
        if (category === state.board.selectedCategory) {
          return;
        }
        pushNavigationHistory();
        state.board.selectedCategory = category;
        state.stats.boardCategoryViewCounts[category] = (state.stats.boardCategoryViewCounts[category] || 0) + 1;
        render();
      })
    );
    const sortSelect = document.getElementById("board-sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        state.board.sortMode = sortSelect.value || "new";
        render();
      });
    }
    const unreadToggle = document.getElementById("board-unread-toggle");
    if (unreadToggle) {
      unreadToggle.addEventListener("change", () => {
        state.board.unreadOnly = !!unreadToggle.checked;
        render();
      });
    }
    const searchInput = document.getElementById("board-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.board.searchText = searchInput.value || "";
        render();
      });
    }
    document.querySelectorAll(".board-thread-btn").forEach((btn) => btn.addEventListener("click", () => openBoardThread(btn.dataset.threadId)));
  }

  if (state.currentTab === "status") {
    document.querySelectorAll(".status-subtab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.statusTab;
        if (!tab || tab === state.statusSubTab) {
          return;
        }
        pushNavigationHistory();
        state.statusSubTab = tab;
        if (tab === "titles") {
          openTitleCatalog();
        }
        render();
      });
    });
    document.querySelectorAll(".title-toggle-btn").forEach((btn) => btn.addEventListener("click", () => toggleTitle(btn.dataset.titleId)));
    const titleSummaryToggleBtn = document.querySelector(".title-summary-toggle-btn");
    if (titleSummaryToggleBtn) {
      titleSummaryToggleBtn.addEventListener("click", () => {
        state.ui.titleCatalogSummaryCollapsed = !state.ui.titleCatalogSummaryCollapsed;
        renderPreservingWindowScroll();
      });
    }
    document.querySelectorAll(".title-favorite-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        toggleTitleFavorite(btn.dataset.titleFavoriteId);
        renderPreservingWindowScroll();
      })
    );
    document.querySelectorAll(".title-page-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const key = btn.dataset.titlePageKey;
        const delta = Number(btn.dataset.titlePageDelta || 0);
        if (!key || !Number.isFinite(delta) || delta === 0) {
          return;
        }
        state[key] = Math.max(1, Number(state[key] || 1) + delta);
        renderPreservingWindowScroll();
      })
    );
    document.querySelectorAll(".title-filter-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const filter = btn.dataset.titleFilter;
        if (!filter || filter === state.titleCatalogFilter) {
          return;
        }
        state.titleCatalogFilter = filter;
        state.titleCatalogPageNormal = 1;
        state.titleCatalogPageCheat = 1;
        render();
      })
    );
    document.querySelectorAll(".title-status-filter-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const filter = btn.dataset.titleStatusFilter;
        if (!filter || filter === state.titleCatalogStatusFilter) {
          return;
        }
        state.titleCatalogStatusFilter = filter;
        state.titleCatalogPageNormal = 1;
        state.titleCatalogPageCheat = 1;
        render();
      })
    );
    document.querySelectorAll(".title-effect-filter-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const filter = btn.dataset.titleEffectFilter;
        if (!filter || filter === state.titleCatalogEffectFilter) {
          return;
        }
        state.titleCatalogEffectFilter = filter;
        state.titleCatalogPageNormal = 1;
        state.titleCatalogPageCheat = 1;
        render();
      })
    );
    const sortSelect = document.getElementById("title-sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        state.titleCatalogSortMode = sortSelect.value || "default";
        state.titleCatalogPageNormal = 1;
        state.titleCatalogPageCheat = 1;
        render();
      });
    }
    const searchInput = document.getElementById("title-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.titleCatalogSearch = searchInput.value || "";
        state.titleCatalogPageNormal = 1;
        state.titleCatalogPageCheat = 1;
        render();
      });
    }
    document.querySelectorAll(".equipment-slot-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const slotId = btn.dataset.slotId;
        if (!slotId) {
          return;
        }
        state.ui.selectedEquipmentSlotId = slotId;
        renderPreservingWindowScroll();
      })
    );
    document.querySelectorAll(".equipment-favorite-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        toggleEquipmentFavorite(btn.dataset.equipmentFavoriteId);
        renderPreservingWindowScroll();
      })
    );
    document.querySelectorAll(".equip-item-btn").forEach((btn) =>
      btn.addEventListener("click", () => equipItem(btn.dataset.equipItemId, btn.dataset.equipSlotId))
    );
    document.querySelectorAll(".unequip-btn").forEach((btn) =>
      btn.addEventListener("click", () => unequipItem(btn.dataset.slotId))
    );
    document.querySelectorAll(".equip-preview-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const slotId = btn.dataset.previewSlotId;
        const itemId = btn.dataset.previewItemId;
        if (!slotId || !itemId) {
          return;
        }
        const currentItemId = state.player.equipmentSlots?.[slotId] || null;
        const currentName = currentItemId ? getEquipmentDisplayName(currentItemId) : "未装備";
        const candName = getEquipmentDisplayName(itemId);
        const currentStats = currentItemId ? getEquipmentSlotContribution(currentItemId, slotId) : null;
        const candStats = getEquipmentSlotContribution(itemId, slotId);
        const currentAtk = Math.floor(currentStats?.attack || 0);
        const candAtk = Math.floor(candStats?.attack || 0);
        addLog(`装備比較[${slotId}] 現在: ${currentName} 攻撃${currentAtk} / 候補: ${candName} 攻撃${candAtk} / 差分: ${renderEquipmentComparison(itemId, slotId)}`);
      })
    );
    document.querySelectorAll(".skill-slot-select-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.skillSlotIndex || 0);
        state.ui.selectedSkillSlot = idx;
        render();
      })
    );
    document.querySelectorAll(".skill-equip-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const skillId = btn.dataset.skillId;
        equipSkill(skillId, state.ui.selectedSkillSlot || 0);
        render();
      })
    );
    document.querySelectorAll(".skill-unequip-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.skillSlotIndex || 0);
        unequipSkill(idx);
        render();
      })
    );
  }

  if (state.currentTab === "items") {
    document.querySelectorAll(".use-item-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const itemId = btn.dataset.itemId;
        if (!itemId) {
          return;
        }
        useInventoryItem(itemId);
      })
    );
    document.querySelectorAll(".auto-item-select").forEach((select) =>
      select.addEventListener("change", () => {
        const idx = Number(select.dataset.autoSlotIndex || -1);
        setAutoUseItem(idx, select.value || null);
        render();
      })
    );
    document.querySelectorAll(".auto-item-threshold-select").forEach((select) =>
      select.addEventListener("change", () => {
        const idx = Number(select.dataset.autoSlotIndex || -1);
        setAutoUseThreshold(idx, Number(select.value || 0));
        render();
      })
    );
    document.querySelectorAll(".auto-item-toggle-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.autoSlotIndex || -1);
        toggleAutoUseItem(idx);
        render();
      })
    );
  }

  if (state.currentTab === "system") {
    document.querySelectorAll(".system-subtab-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const tab = btn.dataset.systemTab;
        if (!tab || tab === state.ui.systemSubTab) return;
        state.ui.systemSubTab = tab;
        render();
      })
    );
    const manualSaveBtn = document.getElementById("manual-save-btn");
    if (manualSaveBtn) {
      manualSaveBtn.addEventListener("click", () => saveGame("manual"));
    }
    const manualLoadBtn = document.getElementById("manual-load-btn");
    if (manualLoadBtn) {
      manualLoadBtn.addEventListener("click", () => {
        loadGame();
        render();
      });
    }
    const backupLoadBtn = document.getElementById("backup-load-btn");
    if (backupLoadBtn) {
      backupLoadBtn.addEventListener("click", () => {
        loadBackupGame();
        render();
      });
    }
    const resetRunBtn = document.getElementById("reset-run-btn");
    if (resetRunBtn) {
      resetRunBtn.addEventListener("click", () => resetRunState());
    }
    const resetAllBtn = document.getElementById("reset-all-btn");
    if (resetAllBtn) {
      resetAllBtn.addEventListener("click", () => resetAllData());
    }
    const goTitleBtn = document.getElementById("go-title-btn");
    if (goTitleBtn) {
      goTitleBtn.addEventListener("click", () => {
        state.screen = "title";
        render();
      });
    }
    const saveSettingsBtn = document.getElementById("save-settings-btn");
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener("click", () => {
        const bgm = document.getElementById("setting-bgm");
        const autoLog = document.getElementById("setting-log-autoscroll");
        const help = document.getElementById("setting-help");
        const speedFx = document.getElementById("setting-speed-emphasis");
        const light = document.getElementById("setting-lightweight");
        const saveConfirm = document.getElementById("setting-save-confirm");
        const notify = document.getElementById("setting-notification-level");
        state.settings.bgmOn = !!bgm?.checked;
        state.ui.logAutoScroll = !!autoLog?.checked;
        state.ui.helpOpen = !!help?.checked;
        state.settings.speedEffectEmphasis = !!speedFx?.checked;
        state.settings.lightweightMode = !!light?.checked;
        state.settings.saveConfirmDialog = !!saveConfirm?.checked;
        state.settings.notificationLevel = notify?.value || "normal";
        const payload = buildSavePayload();
        safeSaveJson(STORAGE_KEYS.SETTINGS, payload.settingsState);
        if (getCurrentMainBattleLineId() === "priest_line") {
          state.stats.priestSettingsSaveCount = (state.stats.priestSettingsSaveCount || 0) + 1;
          checkTitleUnlocks("settingsSave");
        }
        addLog("設定を保存しました。");
        showToast("設定保存", "important");
        render();
      });
    }
  }
}

function cycleBattleSpeed() {
  const options = state.unlockedBattleSpeedOptions;
  const idx = options.indexOf(state.battleSpeedMultiplier);
  const next = options[(idx + 1) % options.length];
  applyBattleSpeed(next);
}

function applyBattleSpeed(nextMultiplier) {
  const old = state.battleSpeedMultiplier;
  if (nextMultiplier <= 0 || old === nextMultiplier) {
    renderNotifications();
    return;
  }
  state.battleSpeedMultiplier = nextMultiplier;
  addLog(`倍率切替: ${old}x -> ${nextMultiplier}x`, "important", { important: true });
  showToast(`速度 ${nextMultiplier}x`, "important");
  if (state.battle.isActive) {
    const now = Date.now();
    const remap = (target) => {
      const remain = Math.max(0, target - now);
      return now + Math.max(60, Math.floor((remain * old) / nextMultiplier));
    };
    state.battle.playerNextActionAt = remap(state.battle.playerNextActionAt);
    state.battle.enemyNextActionAt = remap(state.battle.enemyNextActionAt);
    if (state.battle.pendingSpawnAt > now) {
      state.battle.pendingSpawnAt = remap(state.battle.pendingSpawnAt);
    }
  }
  render();
}

function handleTimerClick() {
  state.stats.timerClickCount += 1;
  addLog(`タイマーを押した (${state.stats.timerClickCount}回)`);
  checkTitleUnlocks("timerClick");
  updateUnlockedBattleSpeeds();
  showCenterPopup({ text: `時流同期: ${state.stats.timerClickCount}回`, type: "important" });
  cycleBattleSpeed();
}

function updateUnlockedBattleSpeeds() {
  const options = [1];
  if (state.unlockedTitles.includes("time_nibbler")) {
    options.push(1.5);
  }
  if (state.unlockedTitles.includes("time_keeper_1")) {
    options.push(2);
  }
  if (state.unlockedTitles.includes("time_keeper_2")) {
    options.push(3);
  }
  if (state.unlockedTitles.includes("time_keeper_3")) {
    options.push(4);
  }
  if (state.unlockedTitles.includes("time_lord")) {
    options.push(5);
  }
  state.unlockedBattleSpeedOptions = [...new Set(options)].sort((a, b) => a - b);
  state.stats.highestBattleSpeedUnlocked = Math.max(state.stats.highestBattleSpeedUnlocked || 1, ...state.unlockedBattleSpeedOptions);
  if (!state.unlockedBattleSpeedOptions.includes(state.battleSpeedMultiplier)) {
    state.battleSpeedMultiplier = 1;
  }
}

function updateBattleSpeedUnlocks() {
  updateUnlockedBattleSpeeds();
}

function isStageUnlocked(stageId) {
  const stage = STAGE_DATA[stageId];
  if (!stage) {
    return false;
  }
  if (stage.finalContentId) {
    return !!state.finalBossFlags?.[stage.finalContentId];
  }
  if (stage.loopChallengeId) {
    return (state.loop.unlockedLoopChallengeIds || []).includes(stage.loopChallengeId);
  }
  const town = Object.values(TOWN_DATA).find((entry) => entry.mapId === stage.mapId);
  if (!town || !state.unlockedTowns.includes(town.id)) {
    return false;
  }
  if (stage.stageNo === 1) {
    return true;
  }
  const prevId = `${MAP_DATA[stage.mapId].mapIndex}-${stage.stageNo - 1}`;
  return getStageProgress(prevId).cleared;
}

function getFirstSelectableStage(mapId) {
  const mapIndex = MAP_DATA[mapId].mapIndex;
  for (let i = 1; i <= 10; i += 1) {
    const id = `${mapIndex}-${i}`;
    if (isStageUnlocked(id) && !getStageProgress(id).cleared) {
      return id;
    }
  }
  for (let i = 1; i <= 10; i += 1) {
    const id = `${mapIndex}-${i}`;
    if (isStageUnlocked(id)) {
      return id;
    }
  }
  return null;
}

function getNextUnlockableStage(mapId) {
  const mapIndex = MAP_DATA[mapId].mapIndex;
  for (let i = 1; i <= 10; i += 1) {
    const id = `${mapIndex}-${i}`;
    if (isStageUnlocked(id) && !getStageProgress(id).cleared) {
      return id;
    }
  }
  return null;
}

function getNextStageId(stageId) {
  const stage = STAGE_DATA[stageId];
  if (!stage || stage.stageNo >= 10) {
    return null;
  }
  return `${MAP_DATA[stage.mapId].mapIndex}-${stage.stageNo + 1}`;
}

function getStageProgress(stageId) {
  if (!state.stageProgressById[stageId] && STAGE_DATA[stageId]) {
    state.stageProgressById[stageId] = { kills: 0, target: STAGE_DATA[stageId].targetKills, cleared: false };
  }
  return state.stageProgressById[stageId];
}

function maxStageId(a, b) {
  const score = (id) => {
    const [m, s] = String(id).split("-").map((n) => Number(n));
    return m * 100 + s;
  };
  return score(a) >= score(b) ? a : b;
}

function isStageReached(stageId) {
  const stage = STAGE_DATA[stageId];
  if (!stage) {
    return false;
  }
  return state.clearedStages.includes(stageId) || state.currentStage === stageId || maxStageId(state.stats.highestReachedStage, stageId) === state.stats.highestReachedStage;
}

function isBattleResultState() {
  return state.battle.status === "ステージクリア" || state.battle.status === "敗北";
}

function getInventoryCount(itemId) {
  const slot = state.player.inventory.find((entry) => entry.itemId === itemId);
  return slot ? slot.quantity : 0;
}

function addItem(itemId, qty) {
  if (qty <= 0) {
    return;
  }
  const slot = state.player.inventory.find((entry) => entry.itemId === itemId);
  if (slot) {
    slot.quantity += qty;
  } else {
    state.player.inventory.push({ itemId, quantity: qty });
  }
}

function removeItem(itemId, qty) {
  const slot = state.player.inventory.find((entry) => entry.itemId === itemId);
  if (!slot || slot.quantity < qty) {
    return false;
  }
  slot.quantity -= qty;
  if (slot.quantity <= 0) {
    state.player.inventory = state.player.inventory.filter((entry) => entry !== slot);
  }
  return true;
}

function recordBossFirstTryResult(stageId, won) {
  const attempts = state.runtime.bossAttemptCounts[stageId] || 1;
  if (attempts === 1 && won) {
    state.stats.firstTryBossWins += 1;
    state.stats.totalBossFirstTryWins += 1;
  }
}

function prepareLoopResult() {
  checkEndgameTitleConditions();
  updateBoardThreadsFromEndingProgress();
  checkTitleUnlocks("afterGameClear");
  state.loop.carryOverCandidates = buildCarryOverCandidates();
  state.loop.carryOverLimit = 1 + Math.min(2, Math.floor(state.loop.loopCount / 2));
  state.loop.selectedCarryOverTitleIds = (state.loop.carryOverCandidates.recommended || []).slice(0, state.loop.carryOverLimit);
  recordLoopSummary();
  state.loop.persistentStats = getPersistentStateSnapshot();
  autoSaveIfNeeded("endingProgress");
}

function checkEndgameTitleConditions() {
  evaluateBuildTags();
  evaluateExploitTags();
  checkUnexpectedBuildConditions();
  updateBoardThreadsFromEndingProgress();
  ["afterGameClear", "afterFieldBossClear", "afterBattle"].forEach((trigger) => checkTitleUnlocks(trigger));
  checkLoopOnlyTitles("afterLoopProgress");
}

function recordLoopSummary() {
  const now = Date.now();
  const elapsedSec = Math.floor((now - (state.runtime.loopStartedAt || now)) / 1000);
  const summary = {
    loop: state.loop.loopCount,
    level: state.player.level,
    kills: state.stats.totalKills,
    uniqueKills: state.stats.uniqueKillCount,
    titleCount: state.unlockedTitles.length,
    mainJob: state.player.mainJob || "未設定",
    productionJob: state.player.productionJob || "未設定",
    firstTryBossWins: state.stats.firstTryBossWins,
    speedModeSeconds: state.stats.speedModeSeconds,
    elapsedSec,
    buildTags: [...state.runtime.buildTags],
    endingType: determineEndingType(),
    finalBossClears: { ...(state.stats.finalBossClearCounts || {}) }
  };
  state.loop.loopSummaries.push(summary);
  state.loop.persistentStats.totalLoops = (state.loop.persistentStats.totalLoops || 0) + 1;
  state.loop.persistentStats.totalTitlesUnlockedLifetime = Math.max(state.loop.persistentStats.totalTitlesUnlockedLifetime || 0, state.loop.titleHistory.length);
  state.loop.persistentStats.totalBossKillsLifetime = (state.loop.persistentStats.totalBossKillsLifetime || 0) + state.stats.fieldBossKillCount;
  state.loop.persistentStats.totalUniqueKillsLifetime = (state.loop.persistentStats.totalUniqueKillsLifetime || 0) + state.stats.uniqueKillCount;
  state.loop.persistentStats.totalCraftsLifetime = (state.loop.persistentStats.totalCraftsLifetime || 0) + state.stats.totalCrafts;
  state.loop.persistentStats.totalEnhancesLifetime = (state.loop.persistentStats.totalEnhancesLifetime || 0) + state.stats.totalEnhances;
  state.loop.persistentStats.totalGoldEarnedLifetime = (state.loop.persistentStats.totalGoldEarnedLifetime || 0) + state.stats.totalGoldEarned;
  state.loop.persistentStats.totalGoldLifetime = (state.loop.persistentStats.totalGoldLifetime || 0) + state.stats.totalGoldEarned;
  state.loop.persistentStats.totalDeathsLifetime = (state.loop.persistentStats.totalDeathsLifetime || 0) + state.stats.totalDeaths;
  state.loop.persistentStats.totalTimerClicksLifetime = (state.loop.persistentStats.totalTimerClicksLifetime || 0) + state.stats.timerClickCount;
  state.loop.persistentStats.totalBossFirstTryWins = (state.loop.persistentStats.totalBossFirstTryWins || 0) + state.stats.totalBossFirstTryWins;
  state.loop.persistentStats.totalLoopBossKillsLifetime = (state.loop.persistentStats.totalLoopBossKillsLifetime || 0) + (state.stats.enhancedBossKillCount || 0);
  state.loop.persistentStats.highestLoopReached = Math.max(state.loop.persistentStats.highestLoopReached || 0, state.loop.loopCount);
  state.loop.persistentStats.bestLoopLevel = Math.max(state.loop.persistentStats.bestLoopLevel || 1, state.player.level);
  state.loop.persistentStats.bestLoopClearTime = state.loop.persistentStats.bestLoopClearTime ? Math.min(state.loop.persistentStats.bestLoopClearTime, elapsedSec) : elapsedSec;
  state.loop.persistentStats.maxTitleLimitReached = Math.max(state.loop.persistentStats.maxTitleLimitReached || 1, getCurrentTitleLimit());
  state.loop.persistentStats.maxTitleLimitUnlocked = Math.max(state.loop.persistentStats.maxTitleLimitUnlocked || 1, getCurrentTitleLimit());
  state.loop.persistentStats.persistentUnlockFlags = { ...(state.loop.persistentStats.persistentUnlockFlags || {}), ...(state.loop.persistentUnlocks || {}) };
  state.loop.persistentStats.unlockedEndings = [...new Set([...(state.loop.persistentStats.unlockedEndings || []), ...(state.unlockedEndings || [])])];
}

function getPersistentStateSnapshot() {
  return {
    ...state.loop.persistentStats,
    totalLoops: state.loop.persistentStats.totalLoops || 0,
    maxTitleLimitReached: state.loop.persistentStats.maxTitleLimitReached || getCurrentTitleLimit(),
    unlockedEndings: [...new Set([...(state.loop.persistentStats.unlockedEndings || []), ...(state.unlockedEndings || [])])],
    persistentUnlockFlags: { ...(state.loop.persistentStats.persistentUnlockFlags || {}), ...(state.loop.persistentUnlocks || {}) }
  };
}

function loadPersistentStateSnapshot(snapshot) {
  if (!snapshot) {
    return;
  }
  state.loop.persistentStats = {
    ...state.loop.persistentStats,
    ...snapshot
  };
  if (Array.isArray(snapshot.unlockedEndings)) {
    state.unlockedEndings = [...new Set([...(state.unlockedEndings || []), ...snapshot.unlockedEndings])];
  }
  state.loop.persistentUnlocks = { ...(state.loop.persistentUnlocks || {}), ...(snapshot.persistentUnlockFlags || {}) };
}

function buildCarryOverCandidates() {
  const normal = state.unlockedTitles.filter((id) => {
    const title = getTitleById(id);
    return title?.category === "normal";
  });
  const cheat = state.unlockedTitles.filter((id) => {
    const title = getTitleById(id);
    return title?.category === "cheat";
  });
  const carryable = state.unlockedTitles.filter((id) => {
    const title = getTitleById(id);
    return title?.canCarryOver;
  });
  return {
    normal,
    cheat,
    carryable,
    recommended: carryable.filter((id) => getTitleById(id)?.category === "cheat")
  };
}

function renderLoopResultView() {
  applyLoopUnlocks();
  updateBoardThreadsFromEndingProgress();
  const carry = state.loop.carryOverCandidates;
  const last = state.loop.loopSummaries[state.loop.loopSummaries.length - 1];
  const endingType = determineEndingType();
  const speedRate =
    last && last.elapsedSec > 0
      ? `${Math.floor((last.speedModeSeconds / Math.max(1, last.elapsedSec)) * 100)}%`
      : "0%";
  app.innerHTML = `
    <section class="screen title-screen">
      <h1 class="game-title">クリアリザルト</h1>
      <p class="subtitle">火山4-10クリア。次周回へ進めます。</p>
      <div class="panel loop-summary-panel">
        <p>周回数: ${state.loop.loopCount}</p>
        <p>最終レベル: ${state.player.level}</p>
        <p>撃破数: ${state.stats.totalKills}</p>
        <p>ユニーク討伐数: ${state.stats.uniqueKillCount}</p>
        <p>取得称号数: ${state.unlockedTitles.length}</p>
        <p>使用ジョブ: ${state.player.mainJob || "未設定"} / 生産: ${state.player.productionJob}</p>
        <p>ボス初見撃破数: ${state.stats.firstTryBossWins}</p>
        <p>倍速使用率: ${speedRate}</p>
        <p>持ち込み推奨称号: ${(carry.recommended || []).length}</p>
        <p>現在titleLimit: ${getCurrentTitleLimit()}</p>
        <p>次titleLimit条件: ${getNextTitleLimitCondition()}</p>
        <p>強化版ボス撃破: ${state.stats.enhancedBossKillCount || 0}</p>
        <p>高難易度クリア: ${state.stats.loopChallengeClearCount || 0}</p>
        <p>現在到達エンド候補: ${endingType}</p>
        <p>解放済みエンド: ${(state.unlockedEndings || []).join(" / ") || "なし"}</p>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
        <button id="to-carryover-btn" class="btn btn-primary">引き継ぎ称号を選ぶ</button>
        <button id="back-from-clear-btn" class="btn">町へ戻る</button>
      </div>
    </section>
  `;
  document.getElementById("to-carryover-btn").addEventListener("click", () => {
    state.screen = "carryOverSelection";
    render();
  });
  document.getElementById("back-from-clear-btn").addEventListener("click", () => {
    state.screen = "game";
    state.currentTab = "adventure";
    render();
  });
}

function renderClearResultView() {
  renderLoopResultView();
}

function renderCarryOverSelectionView() {
  const carry = state.loop.carryOverCandidates;
  app.innerHTML = `
    <section class="screen title-screen">
      <h1 class="game-title">引き継ぎ称号選択</h1>
      <p class="subtitle">選択可能数: ${state.loop.selectedCarryOverTitleIds.length} / ${state.loop.carryOverLimit}</p>
      <div class="panel carryover-panel">
        <p>ループ ${state.loop.loopCount} -> ${state.loop.loopCount + 1}</p>
        <p>候補数: ${(carry.carryable || []).length}件 (主にcheat)</p>
        <p>現在titleLimit: ${getCurrentTitleLimit()}</p>
        <div class="carry-grid">
          ${(carry.carryable || [])
            .map((titleId) => {
              const title = getTitleById(titleId);
              const selected = state.loop.selectedCarryOverTitleIds.includes(titleId);
              return `<button class="btn carry-title-btn ${selected ? "active" : ""}" data-carry-title-id="${titleId}">${title.name}<span class="tiny">${title.category} / ${title.carryOverType}</span></button>`;
            })
            .join("")}
        </div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
        <button id="confirm-carryover-btn" class="btn btn-primary">2周目へ進む</button>
        <button id="back-loop-result-btn" class="btn">リザルトへ戻る</button>
      </div>
    </section>
  `;
  document.querySelectorAll(".carry-title-btn").forEach((btn) =>
    btn.addEventListener("click", () => toggleCarryOverTitle(btn.dataset.carryTitleId))
  );
  document.getElementById("confirm-carryover-btn").addEventListener("click", confirmCarryOverSelection);
  document.getElementById("back-loop-result-btn").addEventListener("click", () => {
    state.screen = "clearResult";
    render();
  });
}

function toggleCarryOverTitle(titleId) {
  if (!titleId) {
    return;
  }
  const title = getTitleById(titleId);
  if (!title?.canCarryOver) {
    return;
  }
  const idx = state.loop.selectedCarryOverTitleIds.indexOf(titleId);
  if (idx >= 0) {
    state.loop.selectedCarryOverTitleIds.splice(idx, 1);
    render();
    return;
  }
  if (state.loop.selectedCarryOverTitleIds.length >= state.loop.carryOverLimit) {
    addLog("これ以上は選択できません。");
    render();
    return;
  }
  state.loop.selectedCarryOverTitleIds.push(titleId);
  render();
}

function confirmCarryOverSelection() {
  startNewLoop();
}

function applyCarryOverSelections() {
  const selected = [...state.loop.selectedCarryOverTitleIds];
  const timerTitles = ["time_nibbler", "time_keeper_1", "time_keeper_2", "time_keeper_3", "time_lord"].filter((id) =>
    state.loop.titleHistory.includes(id)
  );
  state.loop.carriedTitles = selected;
  state.unlockedTitles = [...new Set([...selected, ...timerTitles])];
  state.equippedNormalTitleIds = [];
  state.equippedCheatTitleIds = [];
  syncLegacyActiveTitles();
  recalculateTitleEffects();
  refreshPlayerDerivedStats();
  updateUnlockedBattleSpeeds();
}

function resetForNewLoop() {
  stopBattleLoop();
  state.loop.clearedGame = false;
  state.loop.unlockedFeatures = [];
  state.loop.loopRewardFlags = {};
  state.loop.loopBossKillFlags = {};
  state.loop.specialChallengeClearFlags = {};
  state.loop.unlockedLoopChallengeIds = [];
  state.loop.carryOverCandidates = [];
  state.loop.selectedCarryOverTitleIds = [];
  state.screen = "game";
  state.currentTab = "adventure";
  state.statusSubTab = "profile";
  state.titleCatalogFilter = "all";
  state.titleCatalogStatusFilter = "all";
  state.titleCatalogEffectFilter = "all";
  state.titleCatalogSortMode = "default";
  state.titleCatalogSearch = "";
  state.titleCatalogPageNormal = 1;
  state.titleCatalogPageCheat = 1;
  state.unlockedTowns = ["balladore"];
  state.hasNeverendTicket = false;
  state.neverendUnlocked = false;
  state.neverendVipUnlocked = false;
  state.chips = 0;
  state.neverendBossClearFlags = {};
  state.auctionRefreshState = createDefaultAuctionRefreshState();
  state.rouletteStats = createDefaultRouletteStats();
  state.neverendUi = createDefaultNeverendUiState();
  state.currentTown = "balladore";
  state.currentMap = TOWN_DATA.balladore.mapId;
  state.currentStage = "1-1";
  state.currentStageKillCount = 0;
  state.currentStageTargetKills = STAGE_DATA["1-1"].targetKills;
  state.clearedStages = [];
  state.fieldBossCleared = [];
  state.board.selectedThreadId = null;
  state.board.selectedCategory = "all";
  state.board.sortMode = "new";
  state.board.searchText = "";
  state.board.unreadOnly = false;
  state.board.unlockedThreadIds = [];
  state.board.readThreadIds = [];
  state.board.newThreadIds = [];
  state.board.lastOpenedAtById = {};
  state.board.dynamicVariantHistory = {};
  state.trueEndEligible = false;
  state.hiddenEndEligible = false;
  state.chaosEndEligible = false;
  state.finalContentUnlocked = false;
  state.finalBossFlags = {};
  state.worldStateFlags = {};
  state.endingProgressFlags = {};
  state.activeEffects = [];
  state.skillCooldowns = {};
  state.runtime.bossAttemptCounts = {};
  state.runtime.buildTags = [];
  state.runtime.exploitTags = [];
  state.runtime.lastHitMeta = null;
  state.runtime.loopStartedAt = Date.now();
  state.unlockedSkills = { battle: {} };
  state.jobEvolutionFlags = {
    main: { canEvolve: false, hasUnread: false, targetJobId: null, manualWaiting: false, autoEvolved: false },
    sub: { canEvolve: false, hasUnread: false, targetJobId: null, manualWaiting: false, autoEvolved: false },
    production: { canEvolve: false, hasUnread: false, targetJobId: null, manualWaiting: false, autoEvolved: false }
  };
  state.battle = {
    isActive: false,
    stageId: null,
    status: "待機中", playerCurrentHp: 0,
    playerCurrentMp: 0,
    enemy: null,
    intervalId: null,
    playerNextActionAt: 0,
    enemyNextActionAt: 0,
    skillRotationIndex: 0,
    recentActionText: "",
    pendingSpawnAt: 0,
    isFieldBossBattle: false,
    isUniqueBattle: false,
    stageKillCount: 0,
    stageTargetKills: 0,
    itemUsedInStage: false,
    gimmick: { warnedAt: 0, triggered: false, extra: {} },
    scaledBossGimmick: null,
    uniqueGimmickProfile: null,
    uniqueCombatProfile: null,
    critFinishThisBoss: false,
    stageDamageTaken: 0,
    loopChallengeId: null,
    autoItemGlobalCooldownUntil: 0
  };
  Object.keys(STAGE_DATA).forEach((stageId) => {
    state.stageProgressById[stageId] = { kills: 0, target: STAGE_DATA[stageId].targetKills, cleared: false };
  });
  state.player.level = 1;
  state.player.exp = 0;
  state.player.gold = 100;
  state.player.mainJobTier = 1;
  state.player.mainJobCurrentId = state.player.mainJobBaseId || state.player.mainJobId || null;
  state.player.subJobId = null;
  state.player.subJob = null;
  state.player.subJobBaseId = null;
  state.player.subJobTier = 1;
  state.player.subJobCurrentId = null;
  state.player.subJobUnlocked = false;
  state.player.equipmentEnhancements = {};
  syncEquipmentEnhancementCache();
  state.player.equipmentSlots = {
    weapon1: "woodSword",
    weapon2: null,
    armor1: "leatherCap",
    armor2: "noviceRobe",
    accessory1: null,
    accessory2: null
  };
  state.player.equippedWeaponId = state.player.equipmentSlots.weapon1;
  state.player.equippedArmorId = state.player.equipmentSlots.armor1;
  state.player.equippedHeadId = state.player.equipmentSlots.armor2;
  state.player.inventory = [
    { itemId: "potion", quantity: 3 },
    { itemId: "ether", quantity: 1 },
    { itemId: "herb", quantity: 6 },
    { itemId: "woodSword", quantity: 1 },
    { itemId: "leatherCap", quantity: 1 },
    { itemId: "noviceRobe", quantity: 1 }
  ];
  state.player.productionJob = "apothecary";
  state.player.productionJobBaseId = "apothecary";
  state.player.productionJobTier = 1;
  state.player.productionJobCurrentId = "apothecary";
  state.player.productionJobLevel = 1;
  state.player.productionJobExp = 0;
  state.player.productionJobStage = 0;
  state.player.productionProgress = {
    apothecary: { level: 1, exp: 0, stage: 0, crafts: 0 },
    blacksmith: { level: 1, exp: 0, stage: 0, crafts: 0 },
    cook: { level: 1, exp: 0, stage: 0, crafts: 0 }
  };
  const mainBaseId = state.player.mainJobBaseId || state.player.mainJobId;
  if (mainBaseId && JOB_DATA.main[mainBaseId]) {
    syncMainJobState(mainBaseId, 1, mainBaseId, true);
    initializeJobEvolutionState({ silent: true });
    const lineId = getJobDataById(mainBaseId)?.baseLineId;
    state.player.equippedSkills = getUnlockedSkillIdsForLine(lineId).slice(0, 4);
  } else {
    state.player.equippedSkills = [null, null, null, null];
  }
  state.player.currentTown = TOWN_DATA.balladore.name;
  state.guild.rank = "D";
  state.guild.points = 0;
  state.guild.guildRankNormalTitleSlotBonus = 0;
  state.guild.guildRankCheatTitleSlotBonus = 0;
  state.guild.guildQuestLastGeneratedRegion = "grassland";
  state.guild.guildQuestRefreshVersion = 0;
  state.guild.lastRankCapNoticeKey = "";
  state.guild.activeQuestIds = [];
  state.guild.activeGuildQuests = [];
  state.guild.completedQuestIds = [];
  state.guild.claimedQuestIds = [];
  state.guild.guildQuestPool = [];
  state.guild.clearedQuestHistory = [];
  state.guild.questRepeatLevels = {};
  state.guild.questGenerationSeed = 1;
  state.guild.guildQuestStats = { generated: 0, completed: 0, claimed: 0, refreshed: 0 };
  state.guild.selectedFacility = "reception";
  state.guild.workshopTab = "craft";
  state.guild.shopRegionTab = "grassland";
  state.guild.shopMode = "buy";

  state.stats.totalBattles = 0;
  state.stats.totalWins = 0;
  state.stats.totalDeaths = 0;
  state.stats.totalKills = 0;
  state.stats.enemyKillCounts = {};
  state.stats.damageTakenTotal = 0;
  state.stats.totalCraftExp = 0;
  state.stats.craftCountByType = {};
  state.stats.craftCountByRecipe = {};
  state.stats.craftSuccessCount = 0;
  state.stats.craftFailureCount = 0;
  state.stats.craftGreatSuccessCount = 0;
  state.stats.craftHighQualityCount = 0;
  state.stats.craftGodQualityCount = 0;
  state.stats.enhanceSuccessCount = 0;
  state.stats.producedItemCounts = {};
  state.stats.gatheredMaterialCounts = {};
  state.stats.noTitleBattleStreak = 0;
  state.stats.stageClearCount = 0;
  state.stats.stageClearById = {};
  state.stats.fieldBossKillCount = 0;
  state.stats.uniqueEncounterCount = 0;
  state.stats.uniqueKillCount = 0;
  state.stats.uniqueKillById = {};
  state.stats.battlesByRegion = {};
  state.stats.winsByRegion = {};
  state.stats.highestReachedStage = "1-1";
  state.stats.subJobUnlockedAt = null;
  state.stats.idleGrasslandSeconds = 0;
  state.stats.noBattleSinceLoginSeconds = 0;
  state.stats.currentLoopPlaytime = 0;
  state.stats.hpOneDigitWins = 0;
  state.stats.noItemStageClearCount = 0;
  state.stats.noRestStageClearStreak = 0;
  state.stats.stageRepeatCounts = {};
  state.stats.defeatsByStage = {};
  state.stats.firstTryBossWins = 0;
  state.stats.bossCritFinishCount = 0;
  state.stats.defenseBuildBossKills = 0;
  state.stats.noWeaponBossKills = 0;
  state.stats.subJoblessBossClears = 0;
  state.stats.nearDeathWins = 0;
  state.stats.currentWinStreak = 0;
  state.stats.speedModeSeconds = 0;
  state.stats.mainJobUsage = {};
  state.stats.titleComboHistory = {};
  state.stats.equipmentBuildHistory = {};
  state.stats.fullEquipWins = 0;
  state.stats.overweightWins = 0;
  state.stats.extremeOverweightClears = 0;
  state.stats.equipmentSlotUsageCounts = {};
  state.stats.maxWeightReached = 0;
  state.stats.totalEquipChanges = 0;
  state.stats.boardViewedCount = 0;
  state.stats.threadOpenedCounts = {};
  state.stats.boardThreadUnlockCount = 0;
  state.stats.boardThreadReadCount = 0;
  state.stats.boardCategoryViewCounts = {};
  state.stats.boardReactionFlags = {};
  state.stats.boardHintSeenFlags = {};
  state.stats.boardDynamicVariantHistory = {};
  state.stats.loopClearWithLowTierJob = 0;
  state.stats.loopClearWithProductionFocus = 0;
  state.stats.noSubJobBossKillCount = 0;
  state.stats.craftedGearBossKillCount = 0;
  state.stats.godQualityCraftCount = 0;
  state.stats.unexpectedBuildMatchCount = 0;
  state.stats.totalUniqueTypesDefeated = state.uniqueDefeatedIds.length || 0;
  state.stats.highestBattleSpeedUnlocked = Math.max(1, ...state.unlockedBattleSpeedOptions);
  state.stats.totalBossFirstTryWins = 0;
  state.stats.totalNoDamageStageClears = 0;
  state.stats.totalConsecutiveWinsBest = 0;
  state.stats.totalGoldLifetime = state.loop.persistentStats.totalGoldLifetime || state.stats.totalGoldLifetime || 0;
  state.stats.totalCraftsLifetime = state.loop.persistentStats.totalCraftsLifetime || state.stats.totalCraftsLifetime || 0;
  state.stats.totalEnhancesLifetime = state.loop.persistentStats.totalEnhancesLifetime || state.stats.totalEnhancesLifetime || 0;
  state.stats.totalLoopBossKillsLifetime = state.loop.persistentStats.totalLoopBossKillsLifetime || state.stats.totalLoopBossKillsLifetime || 0;
  state.stats.totalTitleCombosTried = 0;
  state.stats.highestLoopReached = Math.max(state.stats.highestLoopReached || 0, state.loop.loopCount);
  state.stats.loopChallengeClearCount = 0;
  state.stats.enhancedBossKillCount = 0;
  state.stats.highDifficultyStageClearCount = 0;
  state.stats.loopOnlyTitleCount = 0;
  state.stats.maxTitleLimitUnlocked = Math.max(state.stats.maxTitleLimitUnlocked || 1, getCurrentTitleLimit());
  state.stats.specialChallengeAttempts = 0;
  state.stats.specialChallengeWins = 0;
  state.stats.persistentUnlockFlags = { ...(state.loop.persistentUnlocks || {}) };
  state.stats.totalLoopBossKillsLifetime = state.loop.persistentStats.totalLoopBossKillsLifetime || state.stats.totalLoopBossKillsLifetime || 0;
  state.stats.endingEligibilityFlags = {};
  state.stats.trueRouteProgress = 0;
  state.stats.hiddenRouteProgress = 0;
  state.stats.chaosRouteProgress = 0;
  state.stats.finalContentClearFlags = {};
  state.stats.finalBossAttemptCounts = {};
  state.stats.finalBossClearCounts = {};
  state.stats.endingHintSeenFlags = {};
  state.stats.worldAnomalyLevel = 0;
  state.stats.poisonTakenCount = 0;
  state.stats.paralyzeTakenCount = 0;
  state.stats.burnTakenCount = 0;
  state.stats.bleedTakenCount = 0;
  state.stats.lowHpBossKillCount = 0;
  state.stats.seaSpecialEnemyKillCount = 0;
  state.stats.volcanoBurnWinCount = 0;
  state.stats.seaEvadeSuccessCount = 0;
  state.stats.volcanoDefenseSkillUseCount = 0;
  state.stats.weaponEnhanceCount = 0;
  state.stats.armorEnhanceCount = 0;
  state.stats.lightWeightWinCount = 0;
  state.stats.heavyWeightWinCount = 0;
  state.stats.fullHpHealCastCount = 0;
  state.stats.overhealConvertedTotal = 0;
  state.stats.magicFinishCount = 0;
  state.stats.critFinishCountAll = 0;
  state.stats.normalSlotsFullBattleWins = 0;
  state.stats.desertNoRestStageClearStreak = 0;
  state.stats.fullNormalHeavyWinCount = 0;
  state.stats.bossKillWithEmptySkillSlots = 0;
  state.stats.uniqueNoRetreatResolveCount = 0;
  state.stats.uniqueRetreatCount = 0;
  state.stats.noReturnExpeditionActive = true;
  state.stats.noReturnRegionClears = {};
  state.stats.grasslandWinStreakCurrent = 0;
  state.stats.grasslandWinStreakBest = 0;
  state.stats.swordsmanSingleWeaponBossKillCount = 0;
  state.stats.mageDualWeaponBossKillCount = 0;
  state.stats.ninjaNoWeaponDebuffApplyCount = 0;
  state.stats.ninjaGrasslandDebuffApplyCount = 0;
  state.stats.ninjaNoWeaponBossKillCount = 0;
  state.stats.ninjaLowEvasionBossDefeatCount = 0;
  state.stats.ninjaStage11DefeatCount = 0;
  state.stats.priestNoSkillKillCount = 0;
  state.stats.priestNoHealWinCount = 0;
  state.stats.priestOnlyOffenseWinCount = 0;
  state.stats.priestHelpToggleCount = 0;
  state.stats.priestSettingsSaveCount = 0;
  state.stats.priestDesertBossClearCount = 0;
  state.stats.priestDesertBossWithFourHealsCount = 0;
  state.stats.swordsmanBossKillCount = 0;
  state.stats.swordsmanDesertBossClearCount = 0;
  state.stats.swordsmanNoArmorDesertBossClearCount = 0;
  state.stats.mageDesertBossSingleSkillClearCount = 0;
  state.stats.mageDesertBossFourAttackSkillsClearCount = 0;
  state.stats.mageDesertBossFourBuffSkillsClearCount = 0;
  state.stats.mageBossDefeatCount = 0;
  state.stats.comboDesertBossClear_swordsman_swordsman = 0;
  state.stats.comboDesertBossClear_mage_swordsman = 0;
  state.stats.comboDesertBossClear_ninja_swordsman = 0;
  state.stats.comboDesertBossClear_priest_swordsman = 0;
  state.stats.comboDesertBossClear_mage_mage = 0;
  state.stats.comboDesertBossClear_mage_ninja = 0;
  state.stats.comboDesertBossClear_mage_priest = 0;
  state.stats.comboDesertBossClear_ninja_ninja = 0;
  state.stats.comboDesertBossClear_ninja_priest = 0;
  state.stats.comboDesertBossClear_priest_priest = 0;
  state.stats.productionWorkshopButtonPressCount = 0;
  state.stats.productionWorkshopStaySeconds = 0;
  state.stats.productionWorkshopStayMs = 0;
  state.titleRuntime.swordsmanChargeReady = false;
  state.titleRuntime.swordsmanReflectReady = false;
  state.titleRuntime.flashSwordsmanEvasionUntil = 0;

  if (!state.loop.carryUniqueRecords) {
    state.uniqueDefeatedIds = [];
    state.uniqueEncounterCount = 0;
    state.uniqueKillCount = 0;
    state.unlockedUniqueSkills = [];
  }
}

function startNewLoop() {
  autoSaveIfNeeded("loopStart");
  applyCarryOverSelections();
  state.loop.loopCount += 1;
  resetForNewLoop();
  applyLoopUnlocks();
  applyLoopTitleLimitUpgrades();
  recalculateTitleEffects();
  updateUnlockedBattleSpeeds();
  checkLoopOnlyTitles("afterLoopStart");
  addLog(`周回開始: ${state.loop.loopCount}周目`);
  showCenterPopup({ text: `周回開始 ${state.loop.loopCount}周目`, type: "loop" });
  state.screen = "game";
  state.currentTab = "adventure";
  autoSaveIfNeeded("loopStart");
  render();
}

function openTitleCatalog() {
  state.stats.titleCatalogOpened += 1;
  checkTitleUnlocks("openTitleCatalog");
}

function showTitleUnlockPopup(title) {
  const popup = document.getElementById("title-unlock-popup");
  if (!popup) {
    return;
  }
  popup.textContent = `新たな称号を獲得: ${title.name}`;
  popup.classList.add("show");
  if (state.ui.titlePopupTimeoutId) {
    clearTimeout(state.ui.titlePopupTimeoutId);
  }
  state.ui.titlePopupTimeoutId = setTimeout(() => {
    const node = document.getElementById("title-unlock-popup");
    if (node) {
      node.classList.remove("show");
    }
  }, 2200);
}

function showBattleSpecialPopup(text) {
  const popup = document.getElementById("battle-special-popup");
  if (!popup) {
    return;
  }
  popup.textContent = text;
  popup.classList.add("show");
  if (state.ui.battleSpecialPopupTimeoutId) {
    clearTimeout(state.ui.battleSpecialPopupTimeoutId);
  }
  state.ui.battleSpecialPopupTimeoutId = setTimeout(() => {
    const node = document.getElementById("battle-special-popup");
    if (node) {
      node.classList.remove("show");
    }
  }, 2400);
}

function stopBattleLoop() {
  if (state.battle.intervalId) {
    clearInterval(state.battle.intervalId);
    state.battle.intervalId = null;
  }
}

function getTitleById(titleId) {
  return state.world.titles.find((title) => title.id === titleId) || null;
}

function getQuestById(questId) {
  const dynamic = (state.guild.guildQuestPool || []).find((quest) => quest.id === questId);
  if (dynamic) {
    return dynamic;
  }
  return state.world.quests.find((quest) => quest.id === questId) || null;
}

function expToNextLevel() {
  return BALANCE_CONFIG.progression.expCurveBase + state.player.level * BALANCE_CONFIG.progression.expCurvePerLevel;
}

function productionExpToNextLevel() {
  return Math.max(20, state.player.productionJobLevel * 16);
}

function toPercent(value, max) {
  if (max <= 0) {
    return 0;
  }
  return clamp(0, 100, (value / max) * 100);
}

function getCappedEffectiveEvasion(stats, regionId) {
  const base = Number(stats?.evasion || 0);
  const regionBonus = Number(state.titleEffects.evadeByRegion?.[regionId] || 0);
  return clamp(0, 0.75, base + regionBonus);
}

function clamp(min, max, value) {
  return Math.min(max, Math.max(min, value));
}

function tabLabel(tabId) {
  return MAIN_TABS.find((tab) => tab.id === tabId)?.label || tabId;
}

function bootstrapStoredPreferences() {
  const settings = safeLoadJson(STORAGE_KEYS.SETTINGS);
  if (settings?.settings) {
    state.settings = { ...state.settings, ...settings.settings };
  }
  if (settings?.ui) {
    state.ui.logAutoScroll = settings.ui.logAutoScroll ?? state.ui.logAutoScroll;
    state.ui.logFilter = settings.ui.logFilter || state.ui.logFilter;
    state.ui.helpOpen = settings.ui.helpOpen ?? state.ui.helpOpen;
    state.ui.topHudCollapsed = settings.ui.topHudCollapsed ?? state.ui.topHudCollapsed;
    state.ui.lastMainTab = settings.ui.lastMainTab || state.ui.lastMainTab;
    state.ui.systemSubTab = settings.ui.systemSubTab || state.ui.systemSubTab;
  }
  const persistent = safeLoadJson(STORAGE_KEYS.PERSISTENT);
  if (persistent?.loop?.persistentStats) {
    loadPersistentStateSnapshot(persistent.loop.persistentStats);
  }
}

setInterval(handleSecondTick, 1000);

bootstrapStoredPreferences();
recalculateTitleEffects();
applyLoopUnlocks();
applyLoopTitleLimitUpgrades();
updateUnlockedBattleSpeeds();
updateBoardThreadsFromProgress();
refreshGuildQuests(false);
render();
