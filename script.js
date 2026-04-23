const MAX_LOG_LINES = 140;
const BATTLE_TICK_MS = 180;

const SAVE_VERSION = 1;
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
  ether: { id: "ether", name: "エーテル", nameJa: "エーテル", category: "consumable", effectType: "heal_mp", healAmount: 0, cooldown: 7, description: "MPを少量回復。", descriptionJa: "MPを少量回復。", autoUsable: false, buyPrice: 28, sellPrice: 14 },
  hiPotion: { id: "hiPotion", name: "ハイポーション", nameJa: "ハイポーション", category: "consumable", effectType: "heal_hp", healAmount: 70, cooldown: 8, description: "HPを中回復。", descriptionJa: "HPを中回復。", autoUsable: true, buyPrice: 45, sellPrice: 22 },
  antidote: { id: "antidote", name: "毒消し", category: "consumable", description: "毒を治療。", buyPrice: 24, sellPrice: 12 },
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
  "hiPotion",
  "antidote",
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
  failedDish: { id: "failedDish", name: "焦げた料理", category: "crafted", description: "失敗した料理", buyPrice: 0, sellPrice: 3 }
});

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
  rulacia: { id: "rulacia", name: "火の国 ルーラシア", mapId: "volcano", unlockByFieldBossStage: "3-10" }
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
  }
};

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
  if (!["grassland", "desert", "sea", "volcano"].includes(stage.mapId)) {
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

  return {
    ...enemy,
    hp: Math.max(1, Math.floor(enemy.hp * hpMultiplier)),
    attack: Math.max(1, Math.floor(enemy.attack * attackMultiplier)),
    defense: Math.max(0, Math.floor(enemy.defense * defenseMultiplier)),
    speed: Math.max(1, Math.floor(enemy.speed * speedMultiplier)),
    intelligence: Math.max(1, Math.floor(enemy.intelligence * (1 + stageStep * 0.015))),
    luck: Math.max(1, Math.floor(enemy.luck * (1 + stageStep * 0.01)))
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
    isBoss
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
  return {
    ...base,
    damageRate: typeof base.damageRate === "number" ? Number((base.damageRate * gimmickScale).toFixed(4)) : base.damageRate,
    attackBoost: typeof base.attackBoost === "number" ? Number((base.attackBoost * (1 + stageStep * 0.01)).toFixed(4)) : base.attackBoost
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
      stages[stageId] = {
        id: stageId,
        mapId: map.id,
        mapName: map.name,
        stageNo: i,
        recommendedLevel: recommended,
        normalEnemyPool: map.normalEnemyPool,
        bossEnemy: i >= 8 ? map.normalEnemyPool[map.normalEnemyPool.length - 1] : null,
        fieldBoss: i === 10 ? map.fieldBoss : null,
        isFieldBossStage: i === 10,
        targetKills: i === 10 ? 1 : 10
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
const GUILD_QUEST_RANK_MAP_WEIGHTS = {
  D: { grassland: 1.0, desert: 0, sea: 0, volcano: 0 },
  C: { grassland: 0.45, desert: 0.55, sea: 0, volcano: 0 },
  B: { grassland: 0.2, desert: 0.45, sea: 0.35, volcano: 0 },
  A: { grassland: 0.1, desert: 0.25, sea: 0.4, volcano: 0.25 },
  S: { grassland: 0.05, desert: 0.2, sea: 0.3, volcano: 0.45 }
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
  { id: "th_bison", category: "boss", title: "ベヒモスバイソン初見で轢かれた", visibleIf: { minStage: "1-10" }, responseSetId: "boss_bison" },
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
  battleSpeedMultiplier: 1,
  unlockedBattleSpeedOptions: [1],
  unlockedTitles: [],
  activeTitles: [],
  titleLimit: 1,
  titleLimitBase: 1,
  titleLimitBonus: 0,
  titleLimitUpgradeLevel: 0,
  unlockedTitleLimitUpgrades: [],
  titleEffects: createDefaultTitleEffects(),
  unlockedTowns: ["balladore"],
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
    systemSubTab: "save"
  },
  titleRuntime: {
    reviveBuffPending: false,
    reviveAttackBuffUntil: 0,
    reviveProtectionUntil: 0,
    firstBattleProtectionUsed: false
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
    bleedTakenCount: 0
  },
  guild: {
    rank: "D",
    points: 0,
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
    workshopTab: "craft"
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
    subJobId: null,
    subJob: null,
    subJobUnlocked: false,
    productionJob: "apothecary",
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
    lastAutoSaveAt: 0,
    pendingAutoSaveTrigger: null
  }
};

const app = document.getElementById("app");

state.autoUseItems = normalizeAutoUseItems(state.autoUseItems);

Object.keys(STAGE_DATA).forEach((stageId) => {
  state.stageProgressById[stageId] = { kills: 0, target: STAGE_DATA[stageId].targetKills, cleared: false };
});

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
  state.player.mainJobId = job.id;
  state.player.mainJob = job.name;
  Object.assign(state.player, {
    maxHp: job.baseStats.hp,
    hp: job.baseStats.hp,
    maxMp: job.baseStats.mp,
    mp: job.baseStats.mp,
    attack: job.baseStats.attack,
    defense: job.baseStats.defense,
    speed: job.baseStats.speed,
    intelligence: job.baseStats.intelligence,
    luck: job.baseStats.luck
  });
  state.player.equippedSkills = (state.world.skills[job.id] || []).slice(0, 4).map((s) => s.id);
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
  const activeNames = state.activeTitles.map((id) => getTitleById(id)?.name).filter(Boolean);
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
        <div class="hud-item">ループ: <strong>${state.loop.loopCount}</strong> / titleLimit <strong>${getCurrentTitleLimit()}</strong></div>
        <div class="hud-item">職: ${escapeHtml(state.player.mainJob || "未設定")} / サブ: ${escapeHtml(state.player.subJob || (state.player.subJobUnlocked ? "未設定" : "未解放"))} / 生産: ${escapeHtml(PRODUCTION_JOB_PATHS[state.player.productionJob]?.stages?.[state.player.productionJobStage] || state.player.productionJob || "未設定")}</div>
        <div class="hud-item">HP/MP: <strong>${Math.floor(state.player.hp)}/${Math.floor(getEffectivePlayerStat("maxHp"))}</strong> / <strong>${Math.floor(state.player.mp)}/${Math.floor(getEffectivePlayerStat("maxMp"))}</strong></div>
        <div class="hud-item">重量: <strong>${weightInfo.totalWeight}/${weightInfo.capacity}</strong> (${weightInfo.rankLabel}) / TAG: ${escapeHtml((effective.buildTags || []).join(", ") || "なし")}</div>
        <div class="hud-item">ON称号: <strong>${state.activeTitles.length}/${getCurrentTitleLimit()}</strong> ${activeNames.length ? escapeHtml(activeNames.join(" / ")) : "なし"}</div>
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
  container.innerHTML = `
    <div class="main-header">
      <h2>冒険</h2>
      <span class="tiny">現在の町: ${escapeHtml(TOWN_DATA[state.currentTown].name)}</span>
    </div>
    <div class="card adventure-summary">
      <p>現在マップ: <strong>${escapeHtml(MAP_DATA[state.currentMap].name)}</strong> (${MAP_DATA[state.currentMap].recommendedLevel})</p>
      <p>現在ステージ: <strong>${escapeHtml(state.currentStage)}</strong> / 撃破数 ${state.currentStageKillCount}/${state.currentStageTargetKills}</p>
      <p>次解放ステージ: <strong>${escapeHtml(nextStage || "なし")}</strong></p>
      <p>フィールドボス撃破: ${state.fieldBossCleared.length} / 4</p>
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
  const buttons = Object.values(TOWN_DATA)
    .map((town) => {
      const unlocked = state.unlockedTowns.includes(town.id);
      return `<button class="btn town-btn ${state.currentTown === town.id ? "active" : ""}" data-town-id="${town.id}" ${unlocked ? "" : "disabled"}>${town.name}${unlocked ? "" : " (LOCK)"}</button>`;
    })
    .join("");
  return `
    <div class="card" style="margin-top:10px;">
      <h4>町選択</h4>
      <p class="tiny">解放済み町: ${escapeHtml(state.unlockedTowns.map((id) => TOWN_DATA[id].name).join(" / "))}</p>
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
  if (!state.unlockedTowns.includes(townId)) {
    addLog("未解放の町です。");
    return;
  }
  if (state.currentTown !== townId) {
    pushNavigationHistory();
  }
  state.currentTown = townId;
  state.currentMap = TOWN_DATA[townId].mapId;
  state.player.currentTown = TOWN_DATA[townId].name;
  state.stats.townVisitCount += 1;
  state.stats.viewSwitchCount += 1;
  checkTitleUnlocks("townVisit");
  checkTitleUnlocks("viewSwitch");
  const firstStage = getFirstSelectableStage(state.currentMap);
  if (firstStage) {
    selectStage(firstStage, false);
  }
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
    if (buff.speedMultiplier) {
      applyEffect("player", "title_start_speed", { stat: "speed", multiplier: 1 + buff.speedMultiplier, durationMs: buff.durationSec * 1000 });
    }
    if (buff.damageReduction) {
      applyEffect("player", "title_start_reduction", { stat: "damageReduction", multiplier: buff.damageReduction, durationMs: buff.durationSec * 1000 });
    }
  }
  if (state.titleEffects.randomBattleStartBuff) {
    const pick = Math.floor(Math.random() * 3);
    const buff = state.titleEffects.randomBattleStartBuff;
    if (pick === 0) {
      applyEffect("player", "title_random_attack", { stat: "attack", multiplier: 1 + (buff.power || 0.15), durationMs: (buff.durationSec || 15) * 1000 });
      addLog("称号効果: ランダム攻撃バフ発動");
    } else if (pick === 1) {
      applyEffect("player", "title_random_defense", { stat: "defense", multiplier: 1 + (buff.power || 0.15), durationMs: (buff.durationSec || 15) * 1000 });
      addLog("称号効果: ランダム防御バフ発動");
    } else {
      applyEffect("player", "title_random_speed", { stat: "speed", multiplier: 1 + (buff.power || 0.15), durationMs: (buff.durationSec || 15) * 1000 });
      addLog("称号効果: ランダム速度バフ発動");
    }
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

  if (stage.isFieldBossStage) {
    master = getScaledEnemyStats(stage.fieldBoss, stage.mapId, stage.id, true);
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
    showBattleSpecialPopup(`フィールドボス出現: ${master.name}`);
    showCenterPopup({ text: `BOSS: ${master.name}`, type: "important" });
  }
}

function rollUniqueEncounter() {
  if (!state.battle.isActive) {
    return false;
  }
  const stage = STAGE_DATA[state.battle.stageId];
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
  if (state.titleEffects.stageRegenPerMinute <= 0) {
    return;
  }
  const maxHp = getEffectivePlayerStat("maxHp");
  const perTick = (maxHp * state.titleEffects.stageRegenPerMinute) / (60 * (1000 / BATTLE_TICK_MS));
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

  let hitChance = 0.88 + state.titleEffects.accuracyBonus - state.battle.enemy.speed * 0.0012;
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
  const damage = isCrit ? Math.floor(base * 1.5) : base;
  applyDamage("player", damage, isCrit ? "会心の一撃" : "通常攻撃", isCrit);
}

function enemyAction() {
  if (!state.battle.enemy || state.battle.enemy.hp <= 0) {
    return;
  }
  const uniqueProfile = getCurrentUniqueCombatProfile();
  const effective = getEffectivePlayerStats();
  const evadeBonus = state.titleEffects.evadeByRegion[STAGE_DATA[state.battle.stageId].mapId] || 0;
  let hitChance = (0.92 * getEnemyAccuracyMultiplier()) - evadeBonus - effective.evasion;
  if (uniqueProfile?.hitBonus) {
    hitChance += uniqueProfile.hitBonus;
  }
  if (Math.random() > hitChance) {
    addLog(`${state.battle.enemy.name} の通常攻撃を受けた。`);
    return;
  }
  let reduction = getDamageReductionMultiplier();
  if (state.titleEffects.lowHpDamageReduction > 0 && state.battle.playerCurrentHp <= effective.maxHp * 0.2) {
    reduction *= 1 - state.titleEffects.lowHpDamageReduction;
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
  const baseDamage = Math.max(1, Math.floor(raw * uniqueMul * (isCrit ? 1.7 : 1)));
  const hits = uniqueProfile && Math.random() < (uniqueProfile.multiHitChance || 0)
    ? 1 + Math.floor(Math.random() * Math.max(1, uniqueProfile.multiHitMax || 1))
    : 1;
  for (let i = 0; i < hits; i += 1) {
    const damage = Math.max(1, Math.floor(baseDamage * reduction));
    applyDamage("enemy", damage, isCrit ? `会心攻撃 ${i + 1}Hit` : `通常攻撃 ${i + 1}Hit`);
    if (state.battle.playerCurrentHp <= 0) {
      break;
    }
  }
}

function useSkill(skill) {
  const display = getSkillDisplayData(skill.id);
  const skillName = display?.nameJa || skill.nameJa || skill.name || skill.id;
  const mpCost = Math.max(0, Math.floor(skill.mpCost * (1 - state.titleEffects.mpCostReduction)));
  if (state.battle.playerCurrentMp < mpCost) {
    return;
  }
  triggerSkillVisualEffect(skill.id);
  state.battle.playerCurrentMp -= mpCost;
  state.skillCooldowns[skill.id] = Date.now() + Math.floor(skill.cooldownMs / state.battleSpeedMultiplier);

  if (skill.type === "magicAttack") {
    state.stats.spellUseCount += 1;
    checkTitleUnlocks("afterSpellUse");
  }
  if (skill.type === "heal") {
    state.stats.healSkillUseCount += 1;
    checkTitleUnlocks("afterHealSkillUse");
  }

  if (skill.type === "attack" || skill.type === "magicAttack") {
    applyDamage("player", calculateSkillDamage(skill), skillName);
    return;
  }
  if (skill.type === "multiAttack") {
    const hits = skill.hits || 2;
    for (let i = 0; i < hits; i += 1) {
      if (!state.battle.enemy || state.battle.enemy.hp <= 0) {
        break;
      }
      applyDamage("player", Math.max(1, Math.floor(calculateSkillDamage(skill))), `${skillName} ${i + 1}Hit`);
    }
    return;
  }
  if (skill.type === "heal") {
    const healMul = 1 + state.titleEffects.healMultiplier;
    const heal = Math.max(8, Math.floor((getEffectivePlayerStat("maxHp") * skill.healRatio + getEffectivePlayerStat("intelligence") * 0.4) * healMul));
    state.battle.playerCurrentHp = Math.min(getEffectivePlayerStat("maxHp"), state.battle.playerCurrentHp + heal);
    addLog(`回復: ${skillName} で ${heal}`);
    return;
  }
  if (skill.type === "buff") {
    applyEffect("player", skill.id, { ...skill.effect, sourceSkillId: skill.id, displayNameJa: skillName, kind: "buff" });
    addLog(`バフ発動: ${skillName}`);
    return;
  }
  if (skill.type === "debuff") {
    applyEffect("enemy", skill.id, { ...skill.effect, sourceSkillId: skill.id, displayNameJa: skillName, kind: "debuff" });
    addLog(`デバフ付与: ${skillName}`);
    return;
  }
  if (skill.type === "attackDebuff") {
    applyDamage("player", calculateSkillDamage(skill), skillName);
    applyEffect("enemy", skill.id, { ...skill.effect, sourceSkillId: skill.id, displayNameJa: skillName, kind: "debuff" });
  }
}

function applyDamage(source, amount, actionName, isCrit = false) {
  if (!state.battle.enemy) {
    return;
  }
  if (source === "player") {
    let damage = applyPlayerDamageBonuses(amount, state.battle.enemy);
    state.battle.enemy.hp = Math.max(0, state.battle.enemy.hp - damage);
    state.battle.recentActionText = `${actionName} -> ${state.battle.enemy.name} に ${damage} ダメージ`;
    addLog(`${actionName}: ${state.battle.enemy.name} に ${damage} ダメージ`);
    if (state.battle.enemy.hp <= 0) {
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
  state.battle.playerCurrentHp = Math.max(0, state.battle.playerCurrentHp - amount);
  state.battle.stageDamageTaken = (state.battle.stageDamageTaken || 0) + amount;
  state.stats.damageTakenTotal += amount;
  if (Math.random() < 0.03) state.stats.poisonTakenCount += 1;
  if (Math.random() < 0.02) state.stats.paralyzeTakenCount += 1;
  if (Math.random() < 0.03) state.stats.burnTakenCount += 1;
  if (Math.random() < 0.025) state.stats.bleedTakenCount += 1;
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

  state.stats.totalWins += 1;
  state.stats.currentWinStreak += 1;
  state.stats.totalConsecutiveWinsBest = Math.max(state.stats.totalConsecutiveWinsBest || 0, state.stats.currentWinStreak);
  state.stats.totalKills += 1;
  state.stats.enemyKillCounts[enemy.id] = (state.stats.enemyKillCounts[enemy.id] || 0) + 1;
  state.stats.winsByRegion[stage.mapId] = (state.stats.winsByRegion[stage.mapId] || 0) + 1;
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
  if (currentWeight.slotsFilled >= 6) {
    state.stats.fullEquipWins += 1;
  }
  if (currentWeight.totalWeight > currentWeight.capacity) {
    state.stats.overweightWins += 1;
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
  addLog(`フィールドボス撃破: ${stageId}`);

  recordBossFirstTryResult(stageId, true);
  if (!state.player.equipmentSlots.weapon1 && !state.player.equipmentSlots.weapon2) {
    state.stats.noWeaponBossKills += 1;
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
    unlockTown("akamatsu");
  } else if (stageId === "3-10") {
    unlockTown("rulacia");
  } else if (stageId === "4-10") {
    addLog("火山4-10をクリア。現段階の到達点です。");
    state.loop.clearedGame = true;
    if (!state.unlockedEndings.includes("normal_end")) {
      state.unlockedEndings.push("normal_end");
      addLog("エンディング解放: normal_end");
    }
    if (LOW_TIER_MAIN_JOBS.includes(state.player.mainJobId)) {
      state.stats.loopClearWithLowTierJob += 1;
    }
    if (state.player.productionJobStage >= 3 || state.stats.totalCrafts >= 300) {
      state.stats.loopClearWithProductionFocus += 1;
    }
    checkEndgameTitleConditions();
    checkTitleUnlocks("afterGameClear");
    prepareLoopResult();
    state.screen = "clearResult";
  }
  if (!state.player.subJobId) {
    state.stats.subJoblessBossClears += 1;
  }
  applyLoopUnlocks();
  checkEndgameTitleConditions();
  autoSaveIfNeeded("bossClear");
}

function unlockTown(townId) {
  if (state.unlockedTowns.includes(townId)) {
    return;
  }
  state.unlockedTowns.push(townId);
  state.stats.townUnlockCount += 1;
  addLog(`町解放: ${TOWN_DATA[townId].name}`);
  showBattleSpecialPopup(`町解放: ${TOWN_DATA[townId].name}`);
  showCenterPopup({ text: `新町解放: ${TOWN_DATA[townId].name}`, type: "important" });
  autoSaveIfNeeded("bossClear");
}

function handleUniqueVictory(enemy) {
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
  checkTitleUnlocks("afterUniqueKill");
}

function handleDefeat() {
  const stage = STAGE_DATA[state.battle.stageId];
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

  state.stats.totalDeaths += 1;
  state.stats.currentWinStreak = 0;
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
    checkTitleUnlocks("afterLevelUp");
  }
}

function unlockSubJob() {
  if (state.player.subJobUnlocked || state.player.level < 100) {
    return;
  }
  state.player.subJobUnlocked = true;
  state.stats.subJobUnlockedAt = state.player.level;
  addLog("サブジョブが解放されました。神殿で設定できます。");
  showBattleSpecialPopup("サブジョブ解放");
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
  if (!state.unlockedTitles.includes(titleId)) {
    addLog("未取得称号はセットできません。");
    return;
  }
  const title = getTitleById(titleId);
  const idx = state.activeTitles.indexOf(titleId);
  if (idx >= 0) {
    state.activeTitles.splice(idx, 1);
    state.stats.titleToggleCount += 1;
    addLog(`称号OFF: ${title.name}`);
    recalculateTitleEffects();
    refreshPlayerDerivedStats();
    checkTitleUnlocks("afterToggleTitle");
    render();
    return;
  }
  if (state.activeTitles.length >= getCurrentTitleLimit()) {
    addLog("これ以上セットできません。");
    return;
  }
  state.activeTitles.push(titleId);
  state.stats.titleToggleCount += 1;
  addLog(`称号ON: ${title.name}`);
  recalculateTitleEffects();
  refreshPlayerDerivedStats();
  checkTitleUnlocks("afterToggleTitle");
  render();
}

function getCurrentTitleLimit() {
  const effectBonus = Math.max(0, Math.floor(state.titleEffects.titleLimitBonus || 0));
  const total = state.titleLimitBase + state.titleLimitUpgradeLevel + state.titleLimitBonus + effectBonus;
  return Math.max(1, total);
}

function unlockTitleLimitUpgrade(sourceLabel) {
  if (state.unlockedTitleLimitUpgrades.includes(sourceLabel)) {
    return;
  }
  state.unlockedTitleLimitUpgrades.push(sourceLabel);
  state.titleLimitUpgradeLevel += 1;
  state.loop.persistentStats.maxTitleLimitReached = Math.max(state.loop.persistentStats.maxTitleLimitReached || 1, getCurrentTitleLimit());
  addLog(`称号装備上限が更新: ${getCurrentTitleLimit()}`, "title", { important: true });
  showCenterPopup({ text: `titleLimit ${getCurrentTitleLimit()} 解放`, type: "important" });
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
  const level = state.titleLimitUpgradeLevel || 0;
  if (level < 1) return "ループ1到達";
  if (level < 2) return "ループ3到達";
  if (level < 3) return "ループ5到達";
  if (!state.unlockedTitles.includes("third_cycle_heretic")) return "称号「三巡目の異端」を取得";
  if (!state.unlockedTitles.includes("endless_adventurer")) return "称号「終わりなき冒険者」を取得";
  return "今後のフェーズで拡張予定";
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
  const next = createDefaultTitleEffects();
  state.activeTitles.forEach((titleId) => {
    const title = getTitleById(titleId);
    if (!title?.effect) {
      return;
    }
    mergeTitleEffect(next, title.effect);
  });
  if (state.unlockedTitles.includes("nameless_wanderer") && state.activeTitles.length === 0) {
    next.conditionalBonusNoTitle = { allStatsFlat: 1 };
  }
  if (state.activeTitles.length === 0) {
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
  if (typeof effect.accuracyBonus === "number") {
    target.accuracyBonus += effect.accuracyBonus;
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
  if (eq.category === "weapon") {
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
  const mul = getEquipmentQualityMultiplier(quality);
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
  const rule = WEIGHT_RULES.find((row) => totalWeight >= row.min && totalWeight <= row.max) || WEIGHT_RULES[WEIGHT_RULES.length - 1];
  return {
    totalWeight,
    capacity,
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
    mods.speedMultiplier -= extra;
    mods.evasionBonus -= extra * 0.5;
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
  if (LOW_TIER_MAIN_JOBS.includes(state.player.mainJobId) && state.loop.clearedGame) {
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

function getEffectivePlayerStats() {
  const sub = state.player.subJobId ? SUB_JOB_BONUS_DATA[state.player.subJobId] || {} : {};
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
  if (state.titleEffects.lowTierJobBonus > 0 && LOW_TIER_MAIN_JOBS.includes(state.player.mainJobId)) {
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

  ["maxHp", "maxMp", "attack", "defense", "speed", "intelligence", "luck"].forEach((stat) => {
    const effects = state.activeEffects.filter((effect) => effect.target === "player" && effect.stat === stat);
    effects.forEach((effect) => {
      stats[stat] *= effect.multiplier;
    });
  });

  stats.evasion = clamp(0.01, 0.75, stats.evasion);
  stats.critRate = clamp(0.01, 0.95, stats.critRate);
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
  const speciesBonus = state.titleEffects.damageToSpecies[enemy.species] || 0;
  if (speciesBonus > 0) {
    damage = Math.floor(damage * (1 + speciesBonus));
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
  if (state.player.mainJobId && state.world.skills[state.player.mainJobId]) {
    list.push(...state.world.skills[state.player.mainJobId]);
  }
  if (state.player.subJobId && state.world.skills[state.player.subJobId]) {
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
  return {
    id: skill.id,
    nameJa: skill.nameJa || skill.name || skill.id,
    descriptionJa: skill.descriptionJa || SKILL_DESC_BY_ID[skill.id] || "説明未設定",
    mpCost: skill.mpCost ?? 0,
    cooldown: skill.cooldown ?? Math.floor((skill.cooldownMs || 0) / 1000),
    cooldownMs: skill.cooldownMs || (skill.cooldown || 0) * 1000,
    category: skill.category || SKILL_TYPE_LABEL_JA[skill.type] || "その他",
    effectType: skill.effectType || skill.type,
    jobId:
      state.player.mainJobId && (state.world.skills[state.player.mainJobId] || []).some((s) => s.id === skill.id)
        ? state.player.mainJobId
        : state.player.subJobId && (state.world.skills[state.player.subJobId] || []).some((s) => s.id === skill.id)
          ? state.player.subJobId
          : null,
    raw: skill
  };
}

function getEquippedSkills() {
  if (!Array.isArray(state.player.equippedSkills)) {
    state.player.equippedSkills = [null, null, null, null];
  }
  if (state.player.mainJobId && state.player.equippedSkills.every((id) => !id)) {
    state.player.equippedSkills = (state.world.skills[state.player.mainJobId] || []).slice(0, 4).map((s) => s.id);
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
    const needMp = Math.max(0, Math.floor(skill.mpCost * (1 - (state.titleEffects.mpCostReduction || 0))));
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
  if (skill.type === "magicAttack") {
    return Math.max(1, Math.floor(getEffectivePlayerStat("intelligence") * skill.power + state.player.level - enemyDef * 0.35));
  }
  return Math.max(1, Math.floor(getEffectivePlayerStat("attack") * skill.power - enemyDef * 0.6));
}

function renderBattleView() {
  const stage = STAGE_DATA[state.battle.stageId || state.currentStage];
  const enemy = state.battle.enemy;
  const stats = getEffectivePlayerStats();
  const classes = `${state.battle.isFieldBossBattle ? "boss-encounter" : ""} ${state.battle.isUniqueBattle ? "unique-encounter" : ""}`;

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
        <p class="tiny">回避 ${(stats.evasion * 100).toFixed(1)}% / 会心 ${(stats.critRate * 100).toFixed(1)}%</p>
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

function renderGuildView(container) {
  const facilityButtons = [["reception", "受付"], ["shop", "ショップ"], ["temple", "神殿"], ["workshop", "工房"]]
    .map(([id, label]) => `<button class="btn guild-menu-btn ${state.guild.selectedFacility === id ? "active" : ""}" data-facility="${id}">${label}</button>`)
    .join("");

  let content = "";
  if (state.guild.selectedFacility === "reception") {
    content = renderQuestBoard();
  } else if (state.guild.selectedFacility === "shop") {
    content = renderShopView();
  } else if (state.guild.selectedFacility === "temple") {
    content = renderTempleView();
  } else {
    content = renderWorkshopLayout();
  }

  container.innerHTML = `
    <div class="main-header"><h2>ギルド</h2><span class="tiny">ランク ${state.guild.rank} / GP ${state.guild.points}</span></div>
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
  const mapDepth = Math.max(0, ["grassland", "desert", "sea", "volcano"].indexOf(mapId));
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

function generateQuestForRankAndMap(rank, mapId) {
  const unlockedMaps = getUnlockedGuildMaps();
  const available = getAvailableQuestTemplates(rank, unlockedMaps);
  const candidates = available.filter((row) => row.mapId === "all" || row.mapId === mapId);
  const pool = candidates.length ? candidates : available;
  if (!pool.length) {
    return null;
  }
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

function refreshGuildQuests(force = false) {
  state.guild.guildQuestPool = Array.isArray(state.guild.guildQuestPool) ? state.guild.guildQuestPool : [];
  state.guild.questRepeatLevels = state.guild.questRepeatLevels || {};
  state.guild.clearedQuestHistory = Array.isArray(state.guild.clearedQuestHistory) ? state.guild.clearedQuestHistory : [];
  state.guild.guildQuestStats = state.guild.guildQuestStats || { generated: 0, completed: 0, claimed: 0, refreshed: 0 };
  if (force || state.guild.guildQuestPool.length === 0) {
    generateGuildQuestPool();
  }
  let guard = 0;
  while (state.guild.guildQuestPool.length < GUILD_QUEST_BOARD_SIZE && guard < 80) {
    guard += 1;
    const rank = rollQuestRankForGuild();
    const mapId = pickWeightedMapForGuildRank(rank, getUnlockedGuildMaps());
    const quest = generateQuestForRankAndMap(rank, mapId);
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
  return `<h3>受付</h3><p class="tiny">受注中: ${state.guild.activeQuestIds.length}/${state.guild.maxActiveQuests} / 依頼補充: 常時</p><div class="quest-grid">${cards}${loopCards}</div>`;
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

function renderShopView() {
  const cards = [...new Set(SHOP_ITEM_IDS)].map((itemId) => {
    const item = ITEM_DATA[itemId];
    const own = getInventoryCount(itemId);
    return `
      <div class="shop-card">
        <h4>${item.name}</h4>
        <p class="tiny">${item.description}</p>
        <p class="tiny">カテゴリ: ${item.category}</p>
        <p class="tiny">買値: ${item.buyPrice} / 売値: ${Math.floor(getSellPrice(item))} / 所持: ${own}</p>
        <div class="title-row">
          <button class="btn shop-buy-btn" data-item-id="${item.id}">購入</button>
          <button class="btn shop-sell-btn" data-item-id="${item.id}" ${own > 0 ? "" : "disabled"}>売却</button>
        </div>
      </div>
    `;
  }).join("");
  return `<h3>ショップ</h3><p class="tiny">所持GOLD: ${state.player.gold}G</p><div class="shop-grid">${cards}</div>`;
}

function buyItem(itemId) {
  const item = ITEM_DATA[itemId];
  if (!item || item.buyPrice <= 0) {
    return;
  }
  if (state.player.gold < item.buyPrice) {
    addLog(`購入失敗: ${item.name} の所持GOLDが不足。`);
    return;
  }
  state.player.gold -= item.buyPrice;
  addItem(itemId, 1);
  state.stats.totalShopTrades += 1;
  addLog(`ショップ購入: ${item.name} x1`);
  checkTitleUnlocks("afterShopTrade");
  render();
}

function sellItem(itemId) {
  const item = ITEM_DATA[itemId];
  if (!item || getInventoryCount(itemId) <= 0) {
    return;
  }
  if (!removeItem(itemId, 1)) {
    return;
  }
  const sell = Math.floor(getSellPrice(item));
  state.player.gold += sell;
  state.stats.totalShopTrades += 1;
  addLog(`ショップ売却: ${item.name} x1 (+${sell}G)`);
  checkTitleUnlocks("afterShopTrade");
  render();
}

function getSellPrice(item) {
  let sell = (item.sellPrice || 0) * (1 + state.titleEffects.sellPriceMultiplier);
  if (item.id === "grilledMeat" && state.titleEffects.cookedSellMultiplier > 0) {
    sell *= 1 + state.titleEffects.cookedSellMultiplier;
  }
  return sell;
}

function renderTempleView() {
  const productionLabels = { apothecary: "薬師", blacksmith: "鍛冶師", cook: "調理人" };
  const productionButtons = Object.keys(productionLabels)
    .map((job) => `<button class="btn production-select-btn ${state.player.productionJob === job ? "active" : ""}" data-production-job="${job}">${productionLabels[job]}</button>`)
    .join("");
  const subButtons = Object.values(JOB_DATA.main)
    .map((job) => `<button class="btn subjob-select-btn ${state.player.subJobId === job.id ? "active" : ""}" data-sub-job-id="${job.id}" ${state.player.subJobUnlocked ? "" : "disabled"}>${job.name}</button>`)
    .join("");
  return `
    <h3>神殿</h3>
    <p>メインジョブ: <strong>${state.player.mainJob || "未設定"}</strong></p>
    <p>サブジョブ: <strong>${state.player.subJob || (state.player.subJobUnlocked ? "未設定" : "未解放")}</strong></p>
    <p>生産ジョブ: <strong>${state.player.productionJob}</strong> / 段階 <strong>${PRODUCTION_JOB_PATHS[state.player.productionJob].stages[state.player.productionJobStage]}</strong></p>
    <p class="tiny">生産Lv ${state.player.productionJobLevel} / EXP ${state.player.productionJobExp}</p>
    <div class="guild-facility-grid">${productionButtons}</div>
    <p class="tiny">サブジョブはレベル100で解放されます。</p>
    <div class="guild-facility-grid">${subButtons}</div>
  `;
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
  state.stats.productionJobHistory[jobName] = (state.stats.productionJobHistory[jobName] || 0) + 1;
  addLog(`神殿: 生産ジョブを ${jobName} に設定しました。`);
  render();
}

function selectSubJob(jobId) {
  if (!state.player.subJobUnlocked) {
    addLog("サブジョブはまだ解放されていません。");
    return;
  }
  const job = JOB_DATA.main[jobId];
  if (!job) {
    return;
  }
  state.player.subJobId = job.id;
  state.player.subJob = job.name;
  refreshPlayerDerivedStats();
  addLog(`神殿: サブジョブを ${job.name} に設定しました。`);
  render();
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
    .map((slot) => slot.itemId);
  const enhanceCards =
    equipIds.length > 0
      ? equipIds
          .map((itemId) => {
            const lv = getEnhanceLevel(itemId);
            const cap = getEnhanceMaxLevel(itemId);
            const capReached = isEnhanceCapReached(itemId);
            const cost = getEnhanceCost(itemId);
            const rate = Math.floor(getEnhanceSuccessRate(itemId) * 100);
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
            return `<div class="shop-card"><h4>${getEquipmentDisplayName(itemId)}</h4><p class="tiny">強化段階: ${capText}</p><p class="tiny">費用: ${cost} / 成功率: ${rate}%</p><p class="tiny">${changedKeys || "強化で変化なし"}</p><button class="btn enhance-btn" data-item-id="${itemId}" ${state.player.gold >= cost && !capReached ? "" : "disabled"}>${capReached ? "上限到達" : "強化"}</button></div>`;
          })
          .join("")
      : "<p class='tiny'>強化できる装備がありません。</p>";

  return `
    <h3>工房</h3>
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
      const unlocked = stage >= recipe.requiredStage;
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
          <p class="tiny">必要段階: ${recipe.requiredStage + 1} / 素材: ${materialText || "なし"} / 費用: ${cost}</p>
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
  const stageName = path.stages[state.player.productionJobStage] || path.stages[0];
  const nextReq = PRODUCTION_STAGE_REQUIREMENTS[Math.min(path.stages.length - 1, state.player.productionJobStage + 1)];
  const currentCrafts = state.player.productionProgress[state.player.productionJob]?.crafts || 0;
  return `
    <div class="card">
      <h4>${state.player.productionJob} (${path.type})</h4>
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
  }
  checkProductionRelatedTitles();
  refreshPlayerDerivedStats();
  render();
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

function gainProductionExp(amount) {
  state.player.productionJobExp += amount;
  state.stats.totalCraftExp += amount;
  while (state.player.productionJobExp >= productionExpToNextLevel()) {
    state.player.productionJobExp -= productionExpToNextLevel();
    state.player.productionJobLevel += 1;
    addLog(`生産Lvアップ: ${state.player.productionJobLevel}`);
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
  const bonus = {
    successRate:
      stage * 0.015 +
      Math.floor(level / 20) * 0.01 +
      state.titleEffects.craftSuccessBonus +
      Math.min(0.08, state.loop.loopCount * BALANCE_CONFIG.crafting.perLoopSuccessBonus),
    greatRate: stage * 0.008 + (productionType === "cooking" ? state.titleEffects.cookGreatSuccessRateBonus : 0),
    highRate: stage * 0.01,
    godRate:
      stage >= 3
        ? 0.002 + stage * 0.001 + Math.min(0.02, state.loop.loopCount * BALANCE_CONFIG.crafting.perLoopGodBonus)
        : 0
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

function updateGuildRank() {
  const old = state.guild.rank;
  let current = old;
  GUILD_RANK_THRESHOLDS.forEach((row) => {
    if (state.guild.points >= row.required) {
      current = row.rank;
    }
  });
  if (current !== old) {
    state.guild.rank = current;
    addLog(`ギルドランクアップ: ${old} -> ${current}`);
  }
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
  if (condition.unlockedEnding && !state.unlockedEndings.includes(condition.unlockedEnding)) {
    return false;
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
  const effective = getEffectivePlayerStats();
  const rows = [
    ["名前", state.player.name],
    ["レベル", state.player.level],
    ["経験値", `${state.player.exp} / ${expToNextLevel()}`],
    ["所持金", `${state.player.gold}G`],
    ["メインジョブ", state.player.mainJob || "未設定"],
    ["サブジョブ", state.player.subJob || (state.player.subJobUnlocked ? "未設定" : "未解放")],
    ["生産ジョブ", `${state.player.productionJob} (${PRODUCTION_JOB_PATHS[state.player.productionJob].stages[state.player.productionJobStage]})`],
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
    ["称号装備上限", `${getCurrentTitleLimit()}`],
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
    ["現在重量", `${calculateWeightInfo(effective.attack).totalWeight} / ${calculateWeightInfo(effective.attack).capacity}`],
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
        ? `<div class="info-grid">${rows.map(([label, value]) => `<div class="card"><h4>${escapeHtml(label)}</h4><p>${escapeHtml(value)}</p></div>`).join("")}</div>`
        : state.statusSubTab === "titles"
        ? renderTitleCatalogLayout()
        : state.statusSubTab === "equipment"
          ? renderEquipmentLayout()
          : renderSkillSetupView()
    }
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
    unique_theorist: { current: state.stats.totalUniqueTypesDefeated, target: 5, label: "ユニーク種類" }
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
  return list;
}

function renderTitleCatalog() {
  const filtered = filterTitleCatalog({
    category: state.titleCatalogFilter,
    status: state.titleCatalogStatusFilter,
    effect: state.titleCatalogEffectFilter,
    search: state.titleCatalogSearch
  });
  const list = sortTitleCatalog(state.titleCatalogSortMode, filtered);
  const cards = list
    .map((title) => {
      const unlocked = state.unlockedTitles.includes(title.id);
      const active = state.activeTitles.includes(title.id);
      const hidden = title.isHidden && !unlocked;
      const progress = renderTitleProgress(title.id);
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
            <button class="btn title-toggle-btn ${active ? "active" : ""}" data-title-id="${title.id}" ${unlocked ? "" : "disabled"}>${active ? "OFF" : "ON"}</button>
          </div>
        </div>
      `;
    })
    .join("");
  return `
    <div class="card" style="margin-bottom:10px;">
      <p>装備中: <strong>${state.activeTitles.length}/${getCurrentTitleLimit()}</strong></p>
      <p class="tiny">解放倍率: ${state.unlockedBattleSpeedOptions.map((s) => `${s}x`).join(" / ")}</p>
      <p class="tiny">ループ ${state.loop.loopCount} / titleLimit強化 ${state.titleLimitUpgradeLevel}</p>
      ${renderTitleCatalogFilters()}
    </div>
    <div class="title-grid">${cards}</div>
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
  if (!state.ui.selectedEquipmentSlotId) {
    state.ui.selectedEquipmentSlotId = "weapon1";
  }
  const selectedSlot = EQUIPMENT_SLOTS.find((slot) => slot.id === state.ui.selectedEquipmentSlotId) || EQUIPMENT_SLOTS[0];
  const candidateList = state.player.inventory
    .filter((entry) => (EQUIPMENT_DATA[entry.itemId]?.category || "") === selectedSlot.category)
    .map((entry) => {
      const eq = EQUIPMENT_DATA[entry.itemId];
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
      <p class="tiny">重量補正: ATK ${Math.floor(weightInfo.baseModifiers.attackMultiplier * 100)}% / DEF ${Math.floor(weightInfo.baseModifiers.defenseMultiplier * 100)}% / SPD ${Math.floor(weightInfo.baseModifiers.speedMultiplier * 100)}% / EVA ${Math.floor(weightInfo.baseModifiers.evasionBonus * 100)}%</p>
      <p class="tiny">ビルドタグ: ${(effective.buildTags || []).join(", ") || "なし"}</p>
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
  render();
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
  render();
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
        <p class="tiny">状態: ${slot.isEnabled ? "有効" : "無効"} / 発動条件 HP${slot.hpThresholdPercent}%以下</p>
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
  const runState = {
    screen: state.screen,
    introIndex: state.introIndex,
    currentTab: state.currentTab,
    statusSubTab: state.statusSubTab,
    currentTown: state.currentTown,
    currentMap: state.currentMap,
    currentStage: state.currentStage,
    currentStageKillCount: state.currentStageKillCount,
    currentStageTargetKills: state.currentStageTargetKills,
    autoUseItems: deepCopyPlain(state.autoUseItems),
    unlockedTowns: deepCopyPlain(state.unlockedTowns),
    clearedStages: deepCopyPlain(state.clearedStages),
    fieldBossCleared: deepCopyPlain(state.fieldBossCleared),
    stageProgressById: deepCopyPlain(state.stageProgressById),
    battleSpeedMultiplier: state.battleSpeedMultiplier,
    unlockedBattleSpeedOptions: deepCopyPlain(state.unlockedBattleSpeedOptions),
    unlockedTitles: deepCopyPlain(state.unlockedTitles),
    activeTitles: deepCopyPlain(state.activeTitles),
    board: deepCopyPlain(state.board),
    guild: deepCopyPlain(state.guild),
    player: deepCopyPlain(state.player),
    stats: deepCopyPlain(state.stats),
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
  state.currentTown = run.currentTown || state.currentTown;
  state.currentMap = run.currentMap || state.currentMap;
  state.currentStage = run.currentStage || state.currentStage;
  state.currentStageKillCount = run.currentStageKillCount || 0;
  state.currentStageTargetKills = run.currentStageTargetKills || STAGE_DATA[state.currentStage]?.targetKills || 10;
  state.autoUseItems = normalizeAutoUseItems(run.autoUseItems || state.autoUseItems);
  state.unlockedTowns = Array.isArray(run.unlockedTowns) ? run.unlockedTowns : state.unlockedTowns;
  state.clearedStages = Array.isArray(run.clearedStages) ? run.clearedStages : state.clearedStages;
  state.fieldBossCleared = Array.isArray(run.fieldBossCleared) ? run.fieldBossCleared : state.fieldBossCleared;
  state.stageProgressById = run.stageProgressById || state.stageProgressById;
  state.battleSpeedMultiplier = run.battleSpeedMultiplier || 1;
  state.unlockedBattleSpeedOptions = Array.isArray(run.unlockedBattleSpeedOptions) ? run.unlockedBattleSpeedOptions : [1];
  state.unlockedTitles = Array.isArray(run.unlockedTitles) ? run.unlockedTitles : [];
  state.activeTitles = Array.isArray(run.activeTitles) ? run.activeTitles : [];
  state.board = { ...state.board, ...(run.board || {}) };
  state.guild = { ...state.guild, ...(run.guild || {}) };
  state.player = { ...state.player, ...(run.player || {}) };
  state.stats = { ...state.stats, ...(run.stats || {}) };
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
  updateBoardThreadsFromProgress();
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
  return Object.values(ITEM_DATA).filter((item) => item.autoUsable && item.effectType === "heal_hp");
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
  if (hpRate > slot.hpThresholdPercent) {
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
  const heal = calculateHpConsumableHeal(item.id, 1);
  const maxHp = getEffectivePlayerStat("maxHp");
  const before = state.battle.playerCurrentHp;
  state.battle.playerCurrentHp = Math.min(maxHp, state.battle.playerCurrentHp + heal);
  state.player.hp = Math.min(maxHp, state.battle.playerCurrentHp);
  const cooldownSec = Number(item.cooldown || 0);
  slot.cooldownUntil = Date.now() + cooldownSec * 1000;
  slot.cooldownRemaining = cooldownSec;
  slot.lastUsedAt = Date.now();
  state.battle.autoItemGlobalCooldownUntil = Date.now() + 700;
  state.battle.itemUsedInStage = true;
  triggerAutoItemVisualEffect(idx);
  addLog(`${getItemNameJa(item.id)}を自動使用した！ HPが${Math.floor(state.battle.playerCurrentHp - before)}回復した`);
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
  const maxHp = getEffectivePlayerStat("maxHp");
  const maxMp = getEffectivePlayerStat("maxMp");
  let used = false;

  if (baseId === "potion") {
    const heal = calculateHpConsumableHeal(baseId, qualityMul);
    if (state.battle.isActive) state.battle.playerCurrentHp = Math.min(maxHp, state.battle.playerCurrentHp + heal);
    state.player.hp = Math.min(maxHp, state.player.hp + heal);
    addLog(`アイテム使用: ${getItemNameJa(baseId)}でHP+${heal}`);
    used = true;
  } else if (baseId === "hiPotion") {
    const heal = calculateHpConsumableHeal(baseId, qualityMul);
    if (state.battle.isActive) state.battle.playerCurrentHp = Math.min(maxHp, state.battle.playerCurrentHp + heal);
    state.player.hp = Math.min(maxHp, state.player.hp + heal);
    addLog(`アイテム使用: ${getItemNameJa(baseId)}でHP+${heal}`);
    used = true;
  } else if (baseId === "ether") {
    const mp = Math.max(10, Math.floor(maxMp * 0.25 * qualityMul));
    if (state.battle.isActive) state.battle.playerCurrentMp = Math.min(maxMp, state.battle.playerCurrentMp + mp);
    state.player.mp = Math.min(maxMp, state.player.mp + mp);
    addLog(`アイテム使用: エーテルでMP+${mp}`);
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
        render();
      });
    }
    const battleBackBtn = document.getElementById("battle-back-btn");
    if (battleBackBtn) {
      battleBackBtn.addEventListener("click", () => {
        state.stats.returnButtonCount += 1;
        checkTitleUnlocks("afterBack");
        state.battle.status = "待機";
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
    document.querySelectorAll(".production-select-btn").forEach((btn) => btn.addEventListener("click", () => selectProductionJob(btn.dataset.productionJob)));
    document.querySelectorAll(".subjob-select-btn").forEach((btn) => btn.addEventListener("click", () => selectSubJob(btn.dataset.subJobId)));
    document.querySelectorAll(".workshop-tab-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const tab = btn.dataset.workshopTab;
        if (!tab || tab === state.guild.workshopTab) {
          return;
        }
        pushNavigationHistory();
        state.guild.workshopTab = tab;
        render();
      })
    );
    document.querySelectorAll(".craft-btn").forEach((btn) => btn.addEventListener("click", () => craftItem(btn.dataset.recipeId)));
    document.querySelectorAll(".craft-batch-btn").forEach((btn) =>
      btn.addEventListener("click", () => craftRecipe(btn.dataset.recipeId, Number(btn.dataset.craftQty || 1)))
    );
    document.querySelectorAll(".enhance-btn").forEach((btn) => btn.addEventListener("click", () => enhanceEquipment(btn.dataset.itemId)));
    const gatherBtn = document.getElementById("gather-materials-btn");
    if (gatherBtn) {
      gatherBtn.addEventListener("click", () => gatherMaterials(state.currentMap));
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
    document.querySelectorAll(".title-filter-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const filter = btn.dataset.titleFilter;
        if (!filter || filter === state.titleCatalogFilter) {
          return;
        }
        state.titleCatalogFilter = filter;
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
        render();
      })
    );
    const sortSelect = document.getElementById("title-sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        state.titleCatalogSortMode = sortSelect.value || "default";
        render();
      });
    }
    const searchInput = document.getElementById("title-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.titleCatalogSearch = searchInput.value || "";
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
        render();
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
  state.activeTitles = [];
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
  state.unlockedTowns = ["balladore"];
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
  state.runtime.loopStartedAt = Date.now();
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
  state.player.subJobId = null;
  state.player.subJob = null;
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
  state.player.productionJobLevel = 1;
  state.player.productionJobExp = 0;
  state.player.productionJobStage = 0;
  state.player.productionProgress = {
    apothecary: { level: 1, exp: 0, stage: 0, crafts: 0 },
    blacksmith: { level: 1, exp: 0, stage: 0, crafts: 0 },
    cook: { level: 1, exp: 0, stage: 0, crafts: 0 }
  };
  if (state.player.mainJobId && JOB_DATA.main[state.player.mainJobId]) {
    const job = JOB_DATA.main[state.player.mainJobId];
    state.player.mainJob = job.name;
    state.player.maxHp = job.baseStats.hp;
    state.player.hp = job.baseStats.hp;
    state.player.maxMp = job.baseStats.mp;
    state.player.mp = job.baseStats.mp;
    state.player.attack = job.baseStats.attack;
    state.player.defense = job.baseStats.defense;
    state.player.speed = job.baseStats.speed;
    state.player.intelligence = job.baseStats.intelligence;
    state.player.luck = job.baseStats.luck;
    state.player.equippedSkills = (state.world.skills[state.player.mainJobId] || []).slice(0, 4).map((s) => s.id);
  } else {
    state.player.equippedSkills = [null, null, null, null];
  }
  state.player.currentTown = TOWN_DATA.balladore.name;
  state.guild.rank = "D";
  state.guild.points = 0;
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

