const MAX_LOG_LINES = 140;
const BATTLE_TICK_MS = 180;

const JOB_DATA = {
  main: {
    swordman: { id: "swordman", name: "蜑｣螢ｫ", description: "蜑咲ｷ壹〒謌ｦ縺・ｿ第磁閨ｷ縲・, baseStats: { hp: 120, mp: 30, attack: 16, defense: 14, speed: 10, intelligence: 8, luck: 10 } },
    ninja: { id: "ninja", name: "蠢崎・, description: "邏譌ｩ縺暮㍾隕悶・謚蟾ｧ閨ｷ縲・, baseStats: { hp: 95, mp: 40, attack: 13, defense: 10, speed: 18, intelligence: 9, luck: 12 } },
    mage: { id: "mage", name: "鬲碑｡灘ｸｫ", description: "鬮倡↓蜉幃ｭ疲ｳ戊・縲・, baseStats: { hp: 80, mp: 95, attack: 9, defense: 8, speed: 9, intelligence: 20, luck: 11 } },
    cleric: { id: "cleric", name: "蜒ｧ萓ｶ", description: "蝗槫ｾｩ縺ｨ陬懷勧縺ｫ髟ｷ縺代ｋ縲・, baseStats: { hp: 105, mp: 80, attack: 8, defense: 12, speed: 9, intelligence: 16, luck: 13 } }
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
    { id: "slash", name: "譁ｬ謦・, type: "attack", mpCost: 4, cooldownMs: 2600, power: 1.25 },
    { id: "double_slash", name: "騾｣謦・, type: "multiAttack", mpCost: 7, cooldownMs: 4600, power: 0.82, hits: 2 },
    { id: "iron_stance", name: "髦ｲ蠕｡縺ｮ讒九∴", type: "buff", mpCost: 6, cooldownMs: 9000, effect: { stat: "defense", multiplier: 1.2, durationMs: 5000 } },
    { id: "fighting_spirit", name: "豌怜粋縺・, type: "buff", mpCost: 6, cooldownMs: 9000, effect: { stat: "attack", multiplier: 1.2, durationMs: 5000 } }
  ],
  ninja: [
    { id: "kunai_throw", name: "闍ｦ辟｡謚輔￡", type: "attack", mpCost: 4, cooldownMs: 2400, power: 1.2 },
    { id: "venom_blade", name: "豈貞・", type: "attackDebuff", mpCost: 7, cooldownMs: 6200, power: 1.15, effect: { stat: "enemyAttack", multiplier: 0.88, durationMs: 5000 } },
    { id: "stealth", name: "髫蟇・, type: "buff", mpCost: 6, cooldownMs: 8800, effect: { stat: "damageReduction", multiplier: 0.75, durationMs: 5000 } },
    { id: "smoke_bomb", name: "辣咏脂", type: "debuff", mpCost: 6, cooldownMs: 8800, effect: { stat: "enemyAccuracy", multiplier: 0.75, durationMs: 5000 } }
  ],
  mage: [
    { id: "fire", name: "繝輔ぃ繧､繧｢", type: "magicAttack", mpCost: 6, cooldownMs: 2500, power: 1.3 },
    { id: "ice", name: "繧｢繧､繧ｹ", type: "magicAttack", mpCost: 6, cooldownMs: 2500, power: 1.25 },
    { id: "thunder", name: "繧ｵ繝ｳ繝繝ｼ", type: "magicAttack", mpCost: 8, cooldownMs: 3300, power: 1.4 },
    { id: "magic_boost", name: "繝槭ず繝・け繝悶・繧ｹ繝・, type: "buff", mpCost: 7, cooldownMs: 9000, effect: { stat: "intelligence", multiplier: 1.2, durationMs: 5000 } }
  ],
  cleric: [
    { id: "heal", name: "繝偵・繝ｫ", type: "heal", mpCost: 6, cooldownMs: 3400, healRatio: 0.2 },
    { id: "cure", name: "繧ｭ繝･繧｢", type: "heal", mpCost: 5, cooldownMs: 2800, healRatio: 0.12 },
    { id: "protect", name: "繝励Ο繝・け繝・, type: "buff", mpCost: 7, cooldownMs: 9000, effect: { stat: "defense", multiplier: 1.2, durationMs: 5000 } },
    { id: "holy", name: "繝帙・繝ｪ繝ｼ", type: "magicAttack", mpCost: 8, cooldownMs: 3600, power: 1.35 }
  ]
};

const EQUIPMENT_DATA = {
  woodSword: {
    id: "woodSword",
    name: "譛ｨ蜑｣",
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
    description: "謇ｱ縺・ｄ縺吶＞譛ｨ陬ｽ縺ｮ蜑｣縲・
  },
  ironSword: {
    id: "ironSword",
    name: "驩・殴",
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
    description: "鬮伜ｨ∝鴨縺縺碁㍾縺・ｨ呎ｺ門殴縲・
  },
  apprenticeStaff: {
    id: "apprenticeStaff",
    name: "隕狗ｿ偵＞縺ｮ譚・,
    category: "weapon",
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
    description: "鬲碑｡灘ｸｫ蜷代￠縺ｮ霆ｽ縺・摶縲・
  },
  shadowDagger: {
    id: "shadowDagger",
    name: "蠖ｱ謇薙■遏ｭ蛻",
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
    description: "謇区焚驥崎ｦ悶・霆ｽ驥冗洒蛻縲・
  },
  dullHammer: {
    id: "dullHammer",
    name: "驤埼延繝上Φ繝槭・",
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
    description: "驥阪＆縺ｧ謚ｼ縺怜・繧矩・驥肴ｭｦ蝎ｨ縲・
  },
  trainingSpear: {
    id: "trainingSpear",
    name: "邱ｴ鄙堤畑讒・,
    category: "weapon",
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
    description: "繧ｯ繧ｻ縺悟ｰ代↑縺・ｨ呎ｺ匁ｧ阪・
  },
  leatherCap: {
    id: "leatherCap",
    name: "髱ｩ縺ｮ蟶ｽ蟄・,
    category: "armor",
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
    description: "霆ｽ驥上〒謇ｱ縺・ｄ縺吶＞鬆ｭ髦ｲ蜈ｷ縲・
  },
  noviceRobe: {
    id: "noviceRobe",
    name: "隕狗ｿ偵＞縺ｮ繝ｭ繝ｼ繝・,
    category: "armor",
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
    description: "邁｡邏縺ｪ豕戊｡｣縲・
  },
  leatherArmor: {
    id: "leatherArmor",
    name: "髱ｩ骼ｧ",
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
    description: "讓呎ｺ也噪縺ｪ螳滓姶逕ｨ髦ｲ蜈ｷ縲・
  },
  ironChest: {
    id: "ironChest",
    name: "驩・・閭ｸ蠖薙※",
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
    description: "鬮倬亟蠕｡縺ｮ驥崎｣・抜縲・
  },
  travelerCloak: {
    id: "travelerCloak",
    name: "譌・ｺｺ縺ｮ螟門･・,
    category: "armor",
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
    description: "霆ｽ陬・ン繝ｫ繝牙髄縺代・螟門･励・
  },
  heavyShoulder: {
    id: "heavyShoulder",
    name: "驥肴姶螢ｫ縺ｮ閧ｩ蠖薙※",
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
    description: "驥崎｣・音蛹悶・荳贋ｽ埼亟蜈ｷ縲・
  },
  swiftRing: {
    id: "swiftRing",
    name: "菫願ｶｳ縺ｮ謖・ｼｪ",
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
    description: "騾溷ｺｦ迚ｹ蛹悶・霆ｽ驥上い繧ｯ繧ｻ縲・
  },
  prayerNecklace: {
    id: "prayerNecklace",
    name: "逾医ｊ縺ｮ鬥夜｣ｾ繧・,
    category: "accessory",
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
    description: "蜒ｧ萓ｶ蜷代￠縺ｮ陬懷勧繧｢繧ｯ繧ｻ縲・
  },
  manaEarring: {
    id: "manaEarring",
    name: "鬲泌鴨縺ｮ閠ｳ鬟ｾ繧・,
    category: "accessory",
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
    description: "鬲泌鴨繧貞ｺ穂ｸ翫￡縺吶ｋ閠ｳ鬟ｾ繧翫・
  },
  guardBracelet: {
    id: "guardBracelet",
    name: "螳医ｊ縺ｮ閻戊ｼｪ",
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
    description: "髦ｲ蠕｡蟇・ｊ縺ｮ閻戊ｼｪ縲・
  },
  merchantCharm: {
    id: "merchantCharm",
    name: "蝠・ｺｺ縺ｮ隴ｷ隨ｦ",
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
    description: "驥鷹°繧貞ｼ輔″蟇・○繧玖ｭｷ隨ｦ縲・
  },
  luckyFeather: {
    id: "luckyFeather",
    name: "蟷ｸ驕九・鄒ｽ鬟ｾ繧・,
    category: "accessory",
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
    description: "蟷ｸ驕九ｒ鬮倥ａ繧狗ｾｽ鬟ｾ繧翫・
  }
};

const ITEM_DATA = {
  potion: { id: "potion", name: "繝昴・繧ｷ繝ｧ繝ｳ", category: "consumable", description: "HP繧貞ｰ鷹㍼蝗槫ｾｩ縲・, buyPrice: 18, sellPrice: 9 },
  ether: { id: "ether", name: "繧ｨ繝ｼ繝・Ν", category: "consumable", description: "MP繧貞ｰ鷹㍼蝗槫ｾｩ縲・, buyPrice: 28, sellPrice: 14 },
  hiPotion: { id: "hiPotion", name: "繝上う繝昴・繧ｷ繝ｧ繝ｳ", category: "consumable", description: "HP繧剃ｸｭ蝗槫ｾｩ縲・, buyPrice: 45, sellPrice: 22 },
  antidote: { id: "antidote", name: "豈呈ｶ医＠", category: "consumable", description: "豈偵ｒ豐ｻ逋ゅ・, buyPrice: 24, sellPrice: 12 },
  herb: { id: "herb", name: "阮ｬ闕・, category: "material", description: "蝗槫ｾｩ阮ｬ邏譚舌・, buyPrice: 10, sellPrice: 5 },
  grilledMeat: { id: "grilledMeat", name: "辟ｼ縺崎ｉ", category: "crafted", description: "鬥吶・縺励＞譁咏炊縲・, buyPrice: 0, sellPrice: 16 },
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
  fineHerb: { id: "fineHerb", name: "荳願ｳｪ縺ｪ阮ｬ闕・, category: "material", description: "蜩∬ｳｪ縺ｮ鬮倥＞阮ｬ闕峨・, buyPrice: 26, sellPrice: 11 },
  poisonSting: { id: "poisonSting", name: "豈帝・", category: "material", description: "豈呈ｧ繧呈戟縺､驥昴・, buyPrice: 28, sellPrice: 12 },
  beastMeat: { id: "beastMeat", name: "迯｣閧・, category: "material", description: "荳闊ｬ逧・↑閧臥ｴ譚舌・, buyPrice: 20, sellPrice: 9 },
  fineMeat: { id: "fineMeat", name: "荳願ｳｪ縺ｪ迯｣閧・, category: "material", description: "蟶悟ｰ代↑鬮倡ｴ夊ｉ縲・, buyPrice: 40, sellPrice: 18 },
  ironOre: { id: "ironOre", name: "驩・桶遏ｳ", category: "material", description: "骰帛・逕ｨ邏譚舌・, buyPrice: 24, sellPrice: 10 },
  wood: { id: "wood", name: "譛ｨ譚・, category: "material", description: "譛ｨ蟾･繝ｻ骰帛・邏譚舌・, buyPrice: 14, sellPrice: 6 },
  manaStone: { id: "manaStone", name: "鬲泌鴨遏ｳ", category: "material", description: "鬲泌鴨縺悟ｮｿ繧狗浹縲・, buyPrice: 34, sellPrice: 15 },
  fireCrystal: { id: "fireCrystal", name: "轤守ｵ先匕", category: "material", description: "辭ｱ繧呈戟縺､邨先匕縲・, buyPrice: 44, sellPrice: 20 },
  waterShard: { id: "waterShard", name: "豌ｴ譎ｶ迚・, category: "material", description: "騾上″騾壹ｋ邨先匕迚・・, buyPrice: 30, sellPrice: 13 },
  crystalShard: { id: "crystalShard", name: "豌ｴ譎ｶ迚・, category: "material", description: "鬮倡ｴ泌ｺｦ縺ｮ邨先匕迚・・, buyPrice: 38, sellPrice: 17 },
  attackTonic: { id: "attackTonic", name: "謾ｻ謦・ヰ繝戊脈", category: "consumable", description: "謌ｦ髣倬幕蟋区凾縺ｮ謾ｻ謦・ｒ蠑ｷ蛹悶・, buyPrice: 0, sellPrice: 32 },
  defenseTonic: { id: "defenseTonic", name: "髦ｲ蠕｡繝舌ヵ阮ｬ", category: "consumable", description: "髦ｲ蠕｡繧貞ｼｷ蛹悶☆繧玖脈縲・, buyPrice: 0, sellPrice: 32 },
  speedTonic: { id: "speedTonic", name: "騾溷ｺｦ阮ｬ", category: "consumable", description: "騾溷ｺｦ繧貞ｼｷ蛹悶☆繧玖脈縲・, buyPrice: 0, sellPrice: 32 },
  regenPotion: { id: "regenPotion", name: "邯咏ｶ壼屓蠕ｩ阮ｬ", category: "consumable", description: "HP繧堤ｶ咏ｶ壼屓蠕ｩ縺吶ｋ阮ｬ縲・, buyPrice: 0, sellPrice: 35 },
  vegeSoup: { id: "vegeSoup", name: "驥手除繧ｹ繝ｼ繝・, category: "crafted", description: "謖∫ｶ壼屓蠕ｩ蟇・ｊ縺ｮ譁咏炊縲・, buyPrice: 0, sellPrice: 24 },
  gourmetMeat: { id: "gourmetMeat", name: "雎ｪ闖ｯ閧画侭逅・, category: "crafted", description: "鬮倡ｴ壹ヰ繝墓侭逅・・, buyPrice: 0, sellPrice: 48 },
  failedDish: { id: "failedDish", name: "辟ｦ縺偵◆譁咏炊", category: "crafted", description: "螟ｱ謨励＠縺ｦ縺励∪縺｣縺滓侭逅・・, buyPrice: 0, sellPrice: 3 }
});

const EQUIPMENT_SLOTS = [
  { id: "weapon1", label: "豁ｦ蝎ｨ1", category: "weapon", index: 0 },
  { id: "weapon2", label: "豁ｦ蝎ｨ2", category: "weapon", index: 1 },
  { id: "armor1", label: "髦ｲ蜈ｷ1", category: "armor", index: 0 },
  { id: "armor2", label: "髦ｲ蜈ｷ2", category: "armor", index: 1 },
  { id: "accessory1", label: "繧｢繧ｯ繧ｻ1", category: "accessory", index: 0 },
  { id: "accessory2", label: "繧｢繧ｯ繧ｻ2", category: "accessory", index: 1 }
];

const WEIGHT_RULES = [
  { rank: "light", label: "霆ｽ驥・, min: 0, max: 19, modifiers: { attackMultiplier: 0, defenseMultiplier: 0, speedMultiplier: 0.1, evasionBonus: 0.05 } },
  { rank: "standard", label: "讓呎ｺ・, min: 20, max: 39, modifiers: { attackMultiplier: 0, defenseMultiplier: 0, speedMultiplier: 0, evasionBonus: 0 } },
  { rank: "heavy", label: "驥崎｣・, min: 40, max: 59, modifiers: { attackMultiplier: 0, defenseMultiplier: 0.1, speedMultiplier: -0.08, evasionBonus: -0.05 } },
  { rank: "overweight", label: "驕守ｩ崎ｼ・, min: 60, max: 79, modifiers: { attackMultiplier: 0.05, defenseMultiplier: 0.2, speedMultiplier: -0.18, evasionBonus: -0.12 } },
  { rank: "extreme", label: "讌ｵ髯宣℃遨崎ｼ・, min: 80, max: Infinity, modifiers: { attackMultiplier: 0.1, defenseMultiplier: 0.3, speedMultiplier: -0.3, evasionBonus: -0.2 } }
];

const TOWN_DATA = {
  balladore: { id: "balladore", name: "邇句嵜 繝舌Λ繝ｼ繝峨・繝ｫ", mapId: "grassland", unlockByFieldBossStage: null },
  dustria: { id: "dustria", name: "遐よｼ縺ｮ蝗ｽ 繝繧ｹ繝医Μ繧｢", mapId: "desert", unlockByFieldBossStage: "1-10" },
  akamatsu: { id: "akamatsu", name: "豬ｷ縺ｮ蝗ｽ 襍､譫ｩ", mapId: "sea", unlockByFieldBossStage: "2-10" },
  rulacia: { id: "rulacia", name: "轣ｫ縺ｮ蝗ｽ 繝ｫ繝ｼ繝ｩ繧ｷ繧｢", mapId: "volcano", unlockByFieldBossStage: "3-10" }
};

const MAP_DATA = {
  grassland: {
    id: "grassland",
    mapIndex: 1,
    name: "闕牙次繝槭ャ繝・,
    region: "闕牙次",
    recommendedLevel: "1-40",
    normalEnemyPool: ["slime", "grassWolf", "hornRabbit", "greenBee", "killerBoar", "manEaterFlower", "greatBoar"],
    fieldBoss: "behemothBison",
    bossGimmick: { type: "charge", triggerSec: 7, warning: "繝吶ヲ繝｢繧ｹ繝舌う繧ｽ繝ｳ縺檎ｪ・ｲ縺ｮ菴灘兇繧貞叙縺｣縺滂ｼ・, damageRate: 0.42, hint: "髦ｲ蠕｡邉ｻ繝舌ヵ縺ｧ霆ｽ貂帙〒縺阪ｋ縲・ }
  },
  desert: {
    id: "desert",
    mapIndex: 2,
    name: "遐よｼ繝槭ャ繝・,
    region: "遐よｼ",
    recommendedLevel: "30-80",
    normalEnemyPool: ["sandWorm", "desertScorpion", "dustLizard", "mummyFighter", "camelBandit", "sandGolem", "wormDevourer"],
    fieldBoss: "duneHydra",
    bossGimmick: { type: "poisonMist", triggerSec: 8, warning: "繝・Η繝ｼ繝ｳ繝偵ラ繝ｩ縺梧ｯ帝悸繧貞瑞縺榊・縺励◆・・, damageRate: 0.08, durationSec: 10, hint: "遏ｭ譛滓ｱｺ謌ｦ縺梧怏蜉ｹ縲・ }
  },
  sea: {
    id: "sea",
    mapIndex: 3,
    name: "豬ｷ繝槭ャ繝・,
    region: "豬ｷ",
    recommendedLevel: "70-130",
    normalEnemyPool: ["seaSerpent", "blueCrab", "aquaSlime", "killerShell", "marineHarpy", "deepJelly", "tidalKnight"],
    fieldBoss: "leviathan",
    bossGimmick: { type: "periodicBurst", triggerSec: 9, warning: "繝ｪ繝ｴ繧｡繧､繧｢繧ｵ繝ｳ縺梧ｰｴ豬√ヶ繝ｬ繧ｹ繧貞精縺・ｾｼ繧・・, damageRate: 0.36, hint: "莠亥・蠕後・繧ｿ繝ｼ繝ｳ縺ｯ隕∵ｳｨ諢上・ }
  },
  volcano: {
    id: "volcano",
    mapIndex: 4,
    name: "轣ｫ螻ｱ繝槭ャ繝・,
    region: "轣ｫ螻ｱ",
    recommendedLevel: "120-200",
    normalEnemyPool: ["flameBat", "lavaSlime", "magmaLizard", "scorchWolf", "ignisGolem", "fireElemental", "magmaTurtle"],
    fieldBoss: "volkazard",
    bossGimmick: { type: "enrage", triggerHpRate: 0.45, warning: "繝ｴ繧ｩ繝ｫ繧ｫ繧ｶ繝ｼ繝峨′諤偵ｊ迢ゅ▲縺滂ｼ・, attackBoost: 1.4, hint: "蠕悟濠縺ｮ陲ｫ繝繝｡蠅怜刈縺ｫ豕ｨ諢上・ }
  }
};

function enemyTemplate(base) {
  return { mp: 0, rarity: "common", skills: [], aiType: "normal", dropTable: [], ...base };
}

const ENEMY_DATA = {
  slime: enemyTemplate({ id: "slime", name: "繧ｹ繝ｩ繧､繝", species: "slime", region: "grassland", hp: 42, attack: 8, defense: 4, speed: 9, intelligence: 3, luck: 6, exp: 8, gold: 6 }),
  grassWolf: enemyTemplate({ id: "grassWolf", name: "繧ｰ繝ｩ繧ｹ繧ｦ繝ｫ繝・, species: "beast", region: "grassland", hp: 58, attack: 11, defense: 6, speed: 13, intelligence: 5, luck: 8, exp: 11, gold: 8 }),
  hornRabbit: enemyTemplate({ id: "hornRabbit", name: "繝帙・繝ｳ繝ｩ繝薙ャ繝・, species: "beast", region: "grassland", hp: 50, attack: 10, defense: 5, speed: 14, intelligence: 4, luck: 10, exp: 10, gold: 7 }),
  greenBee: enemyTemplate({ id: "greenBee", name: "繧ｰ繝ｪ繝ｼ繝ｳ繝薙・", species: "insect", region: "grassland", hp: 46, attack: 9, defense: 5, speed: 12, intelligence: 4, luck: 9, exp: 10, gold: 7 }),
  killerBoar: enemyTemplate({ id: "killerBoar", name: "繧ｭ繝ｩ繝ｼ繝懊い", species: "beast", region: "grassland", hp: 72, attack: 15, defense: 9, speed: 9, intelligence: 4, luck: 8, exp: 14, gold: 10 }),
  manEaterFlower: enemyTemplate({ id: "manEaterFlower", name: "繝槭Φ繧､繝ｼ繧ｿ繝ｼ繝輔Λ繝ｯ繝ｼ", species: "plant", region: "grassland", hp: 78, attack: 14, defense: 10, speed: 8, intelligence: 7, luck: 7, exp: 16, gold: 11 }),
  greatBoar: enemyTemplate({ id: "greatBoar", name: "繧ｰ繝ｬ繝ｼ繝医・繧｢", species: "beast", region: "grassland", rarity: "elite", hp: 120, attack: 20, defense: 14, speed: 11, intelligence: 7, luck: 8, exp: 28, gold: 22 }),
  behemothBison: enemyTemplate({ id: "behemothBison", name: "闕牙次縺ｮ隕・・繝吶ヲ繝｢繧ｹ繝舌う繧ｽ繝ｳ", species: "boss", region: "grassland", rarity: "fieldBoss", hp: 520, attack: 44, defense: 28, speed: 16, intelligence: 16, luck: 14, exp: 420, gold: 340, aiType: "boss" }),

  sandWorm: enemyTemplate({ id: "sandWorm", name: "繧ｵ繝ｳ繝峨Ρ繝ｼ繝", species: "worm", region: "desert", hp: 210, attack: 32, defense: 18, speed: 14, intelligence: 9, luck: 10, exp: 42, gold: 32 }),
  desertScorpion: enemyTemplate({ id: "desertScorpion", name: "繝・じ繝ｼ繝医せ繧ｳ繝ｼ繝斐が繝ｳ", species: "insect", region: "desert", hp: 190, attack: 34, defense: 17, speed: 18, intelligence: 10, luck: 12, exp: 43, gold: 33 }),
  dustLizard: enemyTemplate({ id: "dustLizard", name: "繝繧ｹ繝医Μ繧ｶ繝ｼ繝・, species: "reptile", region: "desert", hp: 205, attack: 30, defense: 20, speed: 15, intelligence: 11, luck: 11, exp: 44, gold: 34 }),
  mummyFighter: enemyTemplate({ id: "mummyFighter", name: "繝溘う繝ｩ繝輔ぃ繧､繧ｿ繝ｼ", species: "undead", region: "desert", hp: 230, attack: 36, defense: 22, speed: 12, intelligence: 12, luck: 10, exp: 48, gold: 38 }),
  camelBandit: enemyTemplate({ id: "camelBandit", name: "繧ｭ繝｣繝｡繝ｫ繝舌Φ繝・ぅ繝・ヨ", species: "humanoid", region: "desert", hp: 220, attack: 38, defense: 21, speed: 16, intelligence: 12, luck: 12, exp: 50, gold: 40 }),
  sandGolem: enemyTemplate({ id: "sandGolem", name: "繧ｵ繝ｳ繝峨ざ繝ｼ繝ｬ繝", species: "golem", region: "desert", hp: 280, attack: 40, defense: 28, speed: 9, intelligence: 8, luck: 9, exp: 56, gold: 45 }),
  wormDevourer: enemyTemplate({ id: "wormDevourer", name: "繝ｯ繝ｼ繝繝・ヰ繧ｦ繧｢", species: "worm", region: "desert", rarity: "elite", hp: 340, attack: 48, defense: 30, speed: 12, intelligence: 11, luck: 10, exp: 78, gold: 65 }),
  duneHydra: enemyTemplate({ id: "duneHydra", name: "遐よｵｷ縺ｮ證ｴ蜷・繝・Η繝ｼ繝ｳ繝偵ラ繝ｩ", species: "boss", region: "desert", rarity: "fieldBoss", hp: 1150, attack: 82, defense: 55, speed: 22, intelligence: 26, luck: 18, exp: 1100, gold: 950, aiType: "boss" }),

  seaSerpent: enemyTemplate({ id: "seaSerpent", name: "繧ｷ繝ｼ繧ｵ繝ｼ繝壹Φ繝・, species: "serpent", region: "sea", hp: 560, attack: 76, defense: 48, speed: 24, intelligence: 24, luck: 16, exp: 130, gold: 110 }),
  blueCrab: enemyTemplate({ id: "blueCrab", name: "繝悶Ν繝ｼ繧ｯ繝ｩ繝・, species: "crustacean", region: "sea", hp: 620, attack: 70, defense: 56, speed: 17, intelligence: 18, luck: 14, exp: 125, gold: 105 }),
  aquaSlime: enemyTemplate({ id: "aquaSlime", name: "繧｢繧ｯ繧｢繧ｹ繝ｩ繧､繝", species: "slime", region: "sea", hp: 540, attack: 68, defense: 44, speed: 21, intelligence: 25, luck: 17, exp: 122, gold: 102 }),
  killerShell: enemyTemplate({ id: "killerShell", name: "繧ｭ繝ｩ繝ｼ繧ｷ繧ｧ繝ｫ", species: "shell", region: "sea", hp: 650, attack: 74, defense: 60, speed: 15, intelligence: 19, luck: 14, exp: 135, gold: 108 }),
  marineHarpy: enemyTemplate({ id: "marineHarpy", name: "繝槭Μ繝ｳ繝上・繝斐・", species: "flying", region: "sea", hp: 570, attack: 79, defense: 46, speed: 27, intelligence: 24, luck: 18, exp: 138, gold: 112 }),
  deepJelly: enemyTemplate({ id: "deepJelly", name: "繝・ぅ繝ｼ繝励ず繧ｧ繝ｪ繝ｼ", species: "jelly", region: "sea", hp: 600, attack: 72, defense: 52, speed: 20, intelligence: 28, luck: 16, exp: 140, gold: 114 }),
  tidalKnight: enemyTemplate({ id: "tidalKnight", name: "繧ｿ繧､繝繝ｫ繝翫う繝・, species: "humanoid", region: "sea", rarity: "elite", hp: 760, attack: 92, defense: 65, speed: 23, intelligence: 30, luck: 19, exp: 190, gold: 160 }),
  leviathan: enemyTemplate({ id: "leviathan", name: "闥ｼ豬ｷ邇・繝ｪ繝ｴ繧｡繧､繧｢繧ｵ繝ｳ", species: "boss", region: "sea", rarity: "fieldBoss", hp: 2400, attack: 150, defense: 95, speed: 32, intelligence: 48, luck: 25, exp: 2600, gold: 2100, aiType: "boss" }),

  flameBat: enemyTemplate({ id: "flameBat", name: "繝輔Ξ繧､繝繝舌ャ繝・, species: "flying", region: "volcano", hp: 980, attack: 125, defense: 70, speed: 38, intelligence: 35, luck: 20, exp: 260, gold: 220 }),
  lavaSlime: enemyTemplate({ id: "lavaSlime", name: "繝ｩ繝ｴ繧｡繧ｹ繝ｩ繧､繝", species: "slime", region: "volcano", hp: 1100, attack: 128, defense: 82, speed: 26, intelligence: 36, luck: 20, exp: 275, gold: 230 }),
  magmaLizard: enemyTemplate({ id: "magmaLizard", name: "繝槭げ繝槭Μ繧ｶ繝ｼ繝・, species: "reptile", region: "volcano", hp: 1200, attack: 135, defense: 88, speed: 28, intelligence: 34, luck: 21, exp: 290, gold: 240 }),
  scorchWolf: enemyTemplate({ id: "scorchWolf", name: "繧ｹ繧ｳ繝ｼ繝√え繝ｫ繝・, species: "beast", region: "volcano", hp: 1160, attack: 142, defense: 80, speed: 35, intelligence: 32, luck: 22, exp: 300, gold: 245 }),
  ignisGolem: enemyTemplate({ id: "ignisGolem", name: "繧､繧ｰ繝九せ繧ｴ繝ｼ繝ｬ繝", species: "golem", region: "volcano", hp: 1450, attack: 150, defense: 112, speed: 18, intelligence: 28, luck: 18, exp: 330, gold: 280 }),
  fireElemental: enemyTemplate({ id: "fireElemental", name: "繝輔ぃ繧､繧｢繧ｨ繝ｬ繝｡繝ｳ繧ｿ繝ｫ", species: "elemental", region: "volcano", hp: 1260, attack: 148, defense: 90, speed: 34, intelligence: 44, luck: 24, exp: 335, gold: 285 }),
  magmaTurtle: enemyTemplate({ id: "magmaTurtle", name: "繝槭げ繝槭ち繝ｼ繝医Ν", species: "reptile", region: "volcano", rarity: "elite", hp: 1680, attack: 160, defense: 125, speed: 16, intelligence: 30, luck: 19, exp: 420, gold: 350 }),
  volkazard: enemyTemplate({ id: "volkazard", name: "轤守剛遶・繝ｴ繧ｩ繝ｫ繧ｫ繧ｶ繝ｼ繝・, species: "boss", region: "volcano", rarity: "fieldBoss", hp: 4200, attack: 238, defense: 150, speed: 40, intelligence: 62, luck: 30, exp: 5200, gold: 4300, aiType: "boss" })
};

const UNIQUE_ENEMY_DATA = {
  fenrir: enemyTemplate({ id: "fenrir", name: "繝輔ぉ繝ｳ繝ｪ繝ｫ", species: "unique", region: "all", rarity: "unique", hp: 2800, attack: 210, defense: 120, speed: 52, intelligence: 40, luck: 26, exp: 3800, gold: 3200, aiType: "unique" }),
  jormungand: enemyTemplate({ id: "jormungand", name: "繝ｨ繝ｫ繝繝ｳ繧ｬ繝ｳ繝・, species: "unique", region: "all", rarity: "unique", hp: 3200, attack: 225, defense: 145, speed: 30, intelligence: 55, luck: 28, exp: 4200, gold: 3600, aiType: "unique" }),
  cerberus: enemyTemplate({ id: "cerberus", name: "繧ｱ繝ｫ繝吶Ο繧ｹ", species: "unique", region: "all", rarity: "unique", hp: 3000, attack: 240, defense: 135, speed: 38, intelligence: 42, luck: 30, exp: 4300, gold: 3700, aiType: "unique" }),
  griffon: enemyTemplate({ id: "griffon", name: "繧ｰ繝ｪ繝輔か繝ｳ", species: "unique", region: "all", rarity: "unique", hp: 2900, attack: 205, defense: 128, speed: 50, intelligence: 44, luck: 32, exp: 4000, gold: 3500, aiType: "unique" }),
  minotauros: enemyTemplate({ id: "minotauros", name: "繝溘ヮ繧ｿ繧ｦ繝ｭ繧ｹ", species: "unique", region: "all", rarity: "unique", hp: 3400, attack: 255, defense: 160, speed: 24, intelligence: 35, luck: 27, exp: 4500, gold: 3900, aiType: "unique" }),
  phoenix: enemyTemplate({ id: "phoenix", name: "魑ｳ蜃ｰ", species: "unique", region: "all", rarity: "unique", hp: 3100, attack: 220, defense: 132, speed: 48, intelligence: 62, luck: 35, exp: 4600, gold: 4000, aiType: "unique" }),
  kirin: enemyTemplate({ id: "kirin", name: "鮗帝ｺ・, species: "unique", region: "all", rarity: "unique", hp: 3300, attack: 232, defense: 140, speed: 44, intelligence: 58, luck: 34, exp: 4700, gold: 4100, aiType: "unique" })
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

const QUEST_DATA = [
  { id: "quest_slime_5", name: "闕牙次縺ｮ貂・祉", description: "繧ｹ繝ｩ繧､繝繧・菴楢ｨ惹ｼ舌☆繧・, reward: { gold: 80, guildPoints: 35 }, checker: () => (state.stats.enemyKillCounts.slime || 0) >= 5 },
  { id: "quest_wolf_3", name: "迢ｼ鬧・勁萓晞ｼ", description: "繧ｰ繝ｩ繧ｹ繧ｦ繝ｫ繝輔ｒ3菴楢ｨ惹ｼ舌☆繧・, reward: { gold: 120, guildPoints: 45 }, checker: () => (state.stats.enemyKillCounts.grassWolf || 0) >= 3 },
  { id: "quest_win_3", name: "螳滓姶險鍋ｷｴ", description: "謌ｦ髣倥↓3蝗槫享蛻ｩ縺吶ｋ", reward: { gold: 90, guildPoints: 30 }, checker: () => state.stats.totalWins >= 3 }
];

const GUILD_RANK_THRESHOLDS = [
  { rank: "D", required: 0 },
  { rank: "C", required: 100 },
  { rank: "B", required: 300 },
  { rank: "A", required: 700 },
  { rank: "S", required: 1500 }
];

const WORKSHOP_RECIPES = {
  "阮ｬ蟶ｫ": [{ id: "craft_potion", itemId: "potion", costGold: 10, successRate: 0.9, materials: [{ itemId: "herb", qty: 1 }] }],
  骰帛・蟶ｫ: [
    { id: "craft_wood_sword", itemId: "woodSword", costGold: 28, successRate: 0.86, materials: [] },
    { id: "craft_iron_sword", itemId: "ironSword", costGold: 70, successRate: 0.74, materials: [{ itemId: "herb", qty: 1 }] },
    { id: "craft_leather_armor", itemId: "leatherArmor", costGold: 62, successRate: 0.78, materials: [] },
    { id: "craft_guard_bracelet", itemId: "guardBracelet", costGold: 68, successRate: 0.72, materials: [] }
  ],
  "隱ｿ逅・ｺｺ": [{ id: "craft_grilled_meat", itemId: "grilledMeat", costGold: 14, successRate: 0.88, materials: [] }]
};

const PRODUCTION_JOB_PATHS = {
  阮ｬ蟶ｫ: { type: "alchemy", stages: ["阮ｬ蟶ｫ", "骭ｬ驥題｡灘ｸｫ", "螟ｧ骭ｬ驥題｡灘ｸｫ", "骭ｬ驥醍視", "骭ｬ驥醍･・] },
  骰帛・蟶ｫ: { type: "smith", stages: ["骰帛・蟶ｫ", "骰帛・閨ｷ莠ｺ", "繝吶ユ繝ｩ繝ｳ骰帛・蟶ｫ", "骰帛・邇・, "骰帛・逾・] },
  隱ｿ逅・ｺｺ: { type: "cooking", stages: ["隱ｿ逅・ｺｺ", "繧ｷ繧ｧ繝・, "繧ｹ繝ｼ繧ｷ繧ｧ繝・, "繧ｰ繝ｩ繝ｳ繧ｷ繧ｧ繝・, "繝槭せ繧ｿ繝ｼ繧ｷ繧ｧ繝・] }
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
    name: "繝昴・繧ｷ繝ｧ繝ｳ",
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
    description: "蝓ｺ譛ｬ蝗槫ｾｩ阮ｬ"
  },
  {
    id: "rx_hi_potion",
    name: "繝上う繝昴・繧ｷ繝ｧ繝ｳ",
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
    description: "荳贋ｽ榊屓蠕ｩ阮ｬ"
  },
  {
    id: "rx_antidote",
    name: "豈呈ｶ医＠",
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
    description: "豈定ｧ｣髯､阮ｬ"
  },
  {
    id: "rx_attack_tonic",
    name: "謾ｻ謦・ヰ繝戊脈",
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
    description: "謾ｻ謦・ｼｷ蛹冶脈"
  },
  {
    id: "rx_wood_sword",
    name: "譛ｨ蜑｣",
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
    description: "蜈･髢豁ｦ蝎ｨ"
  },
  {
    id: "rx_iron_sword",
    name: "驩・殴",
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
    description: "讓呎ｺ匁ｭｦ蝎ｨ"
  },
  {
    id: "rx_iron_chest",
    name: "驩・・閭ｸ蠖薙※",
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
    description: "驥崎｣・亟蜈ｷ"
  },
  {
    id: "rx_guard_bracelet",
    name: "螳医ｊ縺ｮ閻戊ｼｪ",
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
    description: "髦ｲ蠕｡繧｢繧ｯ繧ｻ"
  },
  {
    id: "rx_grilled_meat",
    name: "辟ｼ縺崎ｉ",
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
    description: "蝓ｺ譛ｬ譁咏炊"
  },
  {
    id: "rx_vege_soup",
    name: "驥手除繧ｹ繝ｼ繝・,
    productionType: "cooking",
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
    description: "謖∫ｶ壼梛譁咏炊"
  },
  {
    id: "rx_gourmet_meat",
    name: "雎ｪ闖ｯ閧画侭逅・,
    productionType: "cooking",
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
    description: "鬮俶ｧ閭ｽ譁咏炊"
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
  { id: "grass_observer", name: "闕峨・繧峨・隕ｳ蟇溯・, conditionDescription: "闕牙次繝槭ャ繝励〒30遘剃ｽ輔ｂ縺励↑縺・, effectDescription: "闕牙次縺ｧ蝗樣∩+1%", effect: { evadeByRegion: { grassland: 0.01 } }, trigger: ["secondTick"] },
  { id: "deep_breath", name: "蛻晏ｿ・・・豺ｱ蜻ｼ蜷ｸ", conditionDescription: "蛻昴Ο繧ｰ繧､繝ｳ蠕・蛻・俣謌ｦ髣倥＠縺ｪ縺・, effectDescription: "蛻晄姶髣倥・陲ｫ繝繝｡-3%", effect: { firstBattleDamageReduction: 0.03 }, trigger: ["secondTick", "battleStart"] },
  { id: "coin_talent", name: "蟆城姦諡ｾ縺・・謇崎・", conditionDescription: "1G繧・0蝗樊鏡縺・, effectDescription: "謌ｦ髣伜ｾ隈OLD+1%", effect: { goldMultiplier: 0.01 }, trigger: ["afterBattle", "afterKill"] },
  { id: "miss_master", name: "遨ｺ謖ｯ繧翫・驕比ｺｺ", conditionDescription: "謾ｻ謦・ｒ30蝗槫､悶☆", effectDescription: "蜻ｽ荳ｭ+1%", effect: { accuracyBonus: 0.01 }, trigger: ["afterMiss"] },
  { id: "pain_hardened", name: "逞帙∩縺ｫ諷｣繧後◆閠・, conditionDescription: "邏ｯ險・000繝繝｡繝ｼ繧ｸ陲ｫ蠑ｾ", effectDescription: "髦ｲ蠕｡+1%", effect: { defenseMultiplier: 0.01 }, trigger: ["afterDamageTaken"] },
  { id: "edge_survivor", name: "縺弱ｊ縺弱ｊ逕溷ｭ倩・, conditionDescription: "HP1譯√〒3蝗槫享蛻ｩ", effectDescription: "HP10%莉･荳区凾縲・亟蠕｡+2%", effect: { lowHpDefenseMultiplier: 0.02 }, trigger: ["afterBattle"] },
  { id: "first_gather", name: "縺ｯ縺倥ａ縺ｦ縺ｮ謗｡蜿・, conditionDescription: "邏譚舌ｒ10蛟矩寔繧√ｋ", effectDescription: "謗｡蜿夜㍼+1%", effect: { gatherMultiplier: 0.01 }, trigger: ["afterGather"] },
  { id: "slime_scholar", name: "繧ｹ繝ｩ繧､繝遐皮ｩｶ螳ｶ", conditionDescription: "繧ｹ繝ｩ繧､繝50菴捺茶遐ｴ", effectDescription: "繧ｹ繝ｩ繧､繝邉ｻ縺ｸ縺ｮ繝繝｡繝ｼ繧ｸ+3%", effect: { damageToSpecies: { slime: 0.03 } }, trigger: ["afterKill"] },
  { id: "errand_mood", name: "縺翫▽縺九＞豌怜・", conditionDescription: "繧ｮ繝ｫ繝我ｾ晞ｼ5蝗樣＃謌・, effectDescription: "繧ｮ繝ｫ繝峨・繧､繝ｳ繝育佐蠕鈴㍼+2%", effect: { guildPointMultiplier: 0.02 }, trigger: ["afterQuestClaim"] },
  { id: "smith_friend", name: "縺｡繧・＞骰帛・螂ｽ縺・, conditionDescription: "蟾･謌ｿ縺ｧ5蝗槫ｼｷ蛹・, effectDescription: "蠑ｷ蛹冶ｲｻ逕ｨ-1%", effect: { enhanceCostReduction: 0.01 }, trigger: ["afterEnhance"] },
  { id: "cook_friend", name: "縺｡繧・＞譁咏炊螂ｽ縺・, conditionDescription: "譁咏炊繧・蛟倶ｽ懊ｋ", effectDescription: "譁咏炊縺ｮ螢ｲ蛟､+2%", effect: { cookedSellMultiplier: 0.02 }, trigger: ["afterCraft"] },
  { id: "alchemy_friend", name: "縺｡繧・＞骭ｬ驥大･ｽ縺・, conditionDescription: "繝昴・繧ｷ繝ｧ繝ｳ繧・0蛟倶ｽ懊ｋ", effectDescription: "繝昴・繧ｷ繝ｧ繝ｳ菴懈・譎ゅ↓菴守｢ｺ邇・〒+1", effect: { potionCraftBonusChance: 0.12 }, trigger: ["afterCraft"] },
  { id: "mass_producer", name: "驥冗肇閨ｷ莠ｺ", conditionDescription: "蜷後§繧｢繧､繝・Β繧・0蛟倶ｽ懊ｋ", effectDescription: "逕溽肇譎ゅ・0%縺ｧ霑ｽ蜉菴懈・", effect: { extraCraftChance: 0.1 }, trigger: ["afterCraft"] },
  { id: "workshop_regular", name: "蟾･謌ｿ縺ｮ蟶ｸ騾｣", conditionDescription: "蟾･謌ｿ髢｢騾｣陦悟虚繧貞粋險・0蝗・, effectDescription: "蟾･謌ｿ雋ｻ逕ｨ-10%", effect: { workshopCostReduction: 0.1 }, trigger: ["afterCraft", "afterEnhance"] },
  { id: "production_serious", name: "逕溽肇閨ｷ縺ｮ譛ｬ豌・, conditionDescription: "逕溽肇閨ｷ繝ｬ繝吶Ν100蛻ｰ驕・, effectDescription: "蜩∬ｳｪ1谿ｵ髫惹ｸ頑・邇・20%", effect: { qualityStepUpChance: 0.2 }, trigger: ["afterProductionExp"] },
  { id: "forge_ruler", name: "骰帛・蝣ｴ縺ｮ謾ｯ驟崎・, conditionDescription: "陬・ｙ繧・00蝗槫ｼｷ蛹・, effectDescription: "蠑ｷ蛹匁・蜉溽紫+15%", effect: { smithEnhanceBonus: 0.15 }, trigger: ["afterEnhance"] },
  { id: "alchemy_seeker", name: "骭ｬ驥代・謗｢遨ｶ閠・, conditionDescription: "繝昴・繧ｷ繝ｧ繝ｳ繧・00蛟倶ｽ懈・", effectDescription: "繝昴・繧ｷ繝ｧ繝ｳ邉ｻ蜉ｹ譫憺㍼+20%", effect: { alchemyEffectBonus: 0.2 }, trigger: ["afterCraft"] },
  { id: "master_chef_title", name: "邨ｶ蜩∬ｪｿ逅・ｺｺ", conditionDescription: "譁咏炊繧・00蝗樊・蜉・, effectDescription: "譁咏炊繝舌ヵ謖∫ｶ・30%", effect: { cookingDurationBonus: 0.3 }, trigger: ["afterCraft"] },
  { id: "chant_trainee", name: "隧蜚ｱ縺ｮ邱ｴ鄙堤函", conditionDescription: "鬲疲ｳ輔ｒ100蝗樔ｽｿ縺・, effectDescription: "MP豸郁ｲｻ-1%", effect: { mpCostReduction: 0.01 }, trigger: ["afterSpellUse"] },
  { id: "prayer_trainee", name: "逾医ｊ縺ｮ邱ｴ鄙堤函", conditionDescription: "蝗槫ｾｩ繧ｹ繧ｭ繝ｫ50蝗樔ｽｿ逕ｨ", effectDescription: "蝗槫ｾｩ驥・2%", effect: { healMultiplier: 0.02 }, trigger: ["afterHealSkillUse"] },
  { id: "trade_basics", name: "螢ｲ雋ｷ縺ｮ蝓ｺ譛ｬ", conditionDescription: "繧ｷ繝ｧ繝・・螢ｲ雋ｷ20蝗・, effectDescription: "螢ｲ蛟､+1%", effect: { sellPriceMultiplier: 0.01 }, trigger: ["afterShopTrade"] },
  {
    id: "overweight_adventurer",
    name: "驕守ｩ崎ｼ峨・蜀帝匱閠・,
    conditionDescription: "蜈ｨ陬・ｙ譫繧貞沂繧√◆迥ｶ諷九〒50蜍・,
    effectDescription: "驥埼㍼繝壹リ繝ｫ繝・ぅ-20%",
    effect: { weightPenaltyReduction: 0.2 },
    trigger: ["afterBattle", "afterEquipmentChange"]
  },
  {
    id: "load_breaker",
    name: "遨崎ｼ臥ｪ∫ｴ閠・,
    conditionDescription: "驥埼㍼雜・℃迥ｶ諷九〒100蜍・,
    effectDescription: "驥埼㍼繝壹リ繝ｫ繝・ぅ蜊頑ｸ・,
    effect: { weightPenaltyReduction: 0.5 },
    trigger: ["afterBattle", "afterEquipmentChange"]
  },
  { id: "nameless_wanderer", name: "辟｡蜷阪・譌・ｺｺ", conditionDescription: "遘ｰ蜿ｷ譛ｪ陬・ｙ縺ｧ100謌ｦ", effectDescription: "遘ｰ蜿ｷ譛ｪ陬・ｙ譎ゅ∝・閭ｽ蜉・1", effect: { conditionalBonusNoTitle: { allStatsFlat: 1 } }, trigger: ["afterBattle", "battleStart"] }
];

const CHEAT_TITLES = [
  { id: "first_death", name: "蛻晏屓豁ｻ莠｡閠・, conditionDescription: "蛻昴ａ縺ｦ謌ｦ髣倅ｸ崎・", effectDescription: "蠕ｩ豢ｻ蠕御ｸ螳壽凾髢・謾ｻ謦・10%", effect: { battleStartBuff: { attackMultiplier: 0.1, durationSec: 30 } }, trigger: ["afterDefeat", "battleStart"] },
  { id: "survival_will", name: "逕滄ｄ縺ｮ蝓ｷ蠢ｵ", conditionDescription: "蜈ｨ貊・ｯｸ蜑阪°繧・蝗槫享蛻ｩ", effectDescription: "HP20%莉･荳九〒陲ｫ繝繝｡-10%", effect: { lowHpDamageReduction: 0.1 }, trigger: ["afterBattle"] },
  { id: "barehand_boss", name: "邏謇区茶遐ｴ閠・, conditionDescription: "豁ｦ蝎ｨ縺ｪ縺励〒繝懊せ1菴捺茶遐ｴ", effectDescription: "蝓ｺ遉取判謦・8%縲∵ｭｦ蝎ｨ縺ｪ縺玲凾縺輔ｉ縺ｫ+5%", effect: { attackMultiplier: 0.08, noWeaponAttackBonus: 0.05 }, trigger: ["afterFieldBossClear"] },
  { id: "cook_fail_100", name: "譁咏炊螟ｱ謨礼卆騾｣", conditionDescription: "譁咏炊100蝗槫､ｱ謨・, effectDescription: "譁咏炊縺ｮ螟ｧ謌仙粥邇・15%", effect: { cookGreatSuccessRateBonus: 0.15 }, trigger: ["afterCraft"] },
  { id: "no_supply_clear", name: "辟｡陬懃ｵｦ雕冗ｴ閠・, conditionDescription: "繧｢繧､繝・Β譛ｪ菴ｿ逕ｨ縺ｧ1繧ｹ繝・・繧ｸ繧ｯ繝ｪ繧｢", effectDescription: "繧ｹ繝・・繧ｸ荳ｭ縲∬・辟ｶ蝗槫ｾｩ+5%/蛻・, effect: { stageRegenPerMinute: 0.05 }, trigger: ["afterStageClear"] },
  { id: "no_rest_march", name: "莨代∪縺壹・騾ｲ霆・, conditionDescription: "莨第・縺ｪ縺・繧ｹ繝・・繧ｸ騾｣邯夂ｪ∫ｴ", effectDescription: "謌ｦ髣倬幕蟋区凾縲・溷ｺｦ+10%", effect: { battleStartBuff: { speedMultiplier: 0.1, durationSec: 15 } }, trigger: ["afterStageClear"] },
  { id: "first_kill_breaker", name: "蛻晁ｦ区ｮｺ縺礼ｪ∫ｴ閠・, conditionDescription: "蛻晄倦謌ｦ繝懊せ縺ｫ5蝗槫享蛻ｩ", effectDescription: "繝懊せ縺ｸ縺ｮ繝繝｡繝ｼ繧ｸ+10%", effect: { damageToBoss: 0.1 }, trigger: ["afterFieldBossClear"] },
  { id: "streak_demon", name: "騾｣謌ｦ縺ｮ鬯ｼ", conditionDescription: "蟶ｰ驍・○縺・00騾｣蜍・, effectDescription: "騾｣謌ｦ荳ｭ縲∵判謦・溷ｺｦ+10%", effect: { speedMultiplier: 0.1 }, trigger: ["afterBattle"] },
  { id: "last_critical", name: "譛蠕後・荳謦・, conditionDescription: "繝懊せ縺ｫ莨壼ｿ・ヨ繝峨Γ5蝗・, effectDescription: "莨壼ｿ・紫+8%", effect: { critRateBonus: 0.08 }, trigger: ["afterFieldBossClear"] },
  { id: "defense_sage", name: "螳医ｊ縺ｮ豎る％閠・, conditionDescription: "髦ｲ蠕｡迚ｹ蛹悶〒繝懊せ10菴捺茶遐ｴ", effectDescription: "髦ｲ蠕｡縺ｮ30%繧呈判謦・↓蜉邂・, effect: { defenseToAttackRatio: 0.3 }, trigger: ["afterFieldBossClear"] },
  { id: "title_idle_60", name: "隕倶ｸ翫￡繧玖・, conditionDescription: "繧ｿ繧､繝医Ν逕ｻ髱｢縺ｧ60遘呈叛鄂ｮ", effectDescription: "縺ｪ縺・, effect: {}, trigger: ["secondTick"] },
  { id: "back_button_fan", name: "謌ｻ繧九・繧ｿ繝ｳ諢帛･ｽ螳ｶ", conditionDescription: "謌ｻ繧九・繧ｿ繝ｳ繧・00蝗樊款縺・, effectDescription: "縺ｪ縺・, effect: {}, trigger: ["afterBack"] },
  { id: "clock_hobby", name: "譎りｨ郁・莠ｺ縺斐▲縺・, conditionDescription: "繧ｿ繧､繝槭・繧剃ｸｭ騾泌濠遶ｯ縺ｫ縺・§繧・, effectDescription: "縺ｪ縺・, effect: {}, trigger: ["timerClick"] },
  { id: "grassland_resident", name: "闕牙次蝨ｨ菴・, conditionDescription: "闕牙次1-1繧・00蜻ｨ", effectDescription: "縺ｪ縺・, effect: {}, trigger: ["afterStageClear"] },
  { id: "silent_warrior", name: "辟｡髻ｳ縺ｮ謌ｦ螢ｫ", conditionDescription: "BGM OFF縺ｧ100謌ｦ", effectDescription: "縺ｪ縺・, effect: {}, trigger: ["afterBattle"] },
  { id: "nobody", name: "菴戊・〒繧ゅ↑縺・, conditionDescription: "遘ｰ蜿ｷ蝗ｳ髑代ｒ50蝗樣幕縺・, effectDescription: "縺ｪ縺・, effect: {}, trigger: ["openTitleCatalog"], isHidden: true },
  { id: "time_nibbler", name: "譎ゅｒ縺九§繧玖・, conditionDescription: "繧ｿ繧､繝槭・繧・蝗樊款縺・, effectDescription: "1.5蛟埼溯ｧ｣謾ｾ", effect: { unlockBattleSpeed: [1.5] }, trigger: ["timerClick"], isHidden: true },
  { id: "time_keeper_1", name: "譎ゅｒ蛻ｻ縺ｿ縺苓・", conditionDescription: "繧ｿ繧､繝槭・繧・蝗樊款縺・, effectDescription: "2蛟埼溯ｧ｣謾ｾ", effect: { unlockBattleSpeed: [2] }, trigger: ["timerClick"], isHidden: true },
  { id: "time_keeper_2", name: "譎ゅｒ蛻ｻ縺ｿ縺苓・", conditionDescription: "繧ｿ繧､繝槭・繧・0蝗樊款縺・, effectDescription: "3蛟埼溯ｧ｣謾ｾ", effect: { unlockBattleSpeed: [3] }, trigger: ["timerClick"], isHidden: true },
  {
    id: "time_keeper_3",
    name: "譎ゅｒ蛻ｻ縺ｿ縺苓・",
    conditionDescription: "繧ｿ繧､繝槭・繧・0蝗樊款縺励∵凾繧貞綾縺ｿ縺苓・繧貞叙蠕・,
    effectDescription: "4蛟埼溯ｧ｣謾ｾ / 蛟埼滉ｸｭ EXP+10%",
    effect: { unlockBattleSpeed: [4], speedModeBonus: { expMultiplier: 0.1, minSpeed: 1.5 } },
    trigger: ["timerClick"],
    isHidden: true
  },
  {
    id: "time_lord",
    name: "譎ゅ・謾ｯ驟崎・,
    conditionDescription: "繧ｿ繧､繝槭・120蝗樊款縺・+ 2蜻ｨ逶ｮ蛻ｰ驕・+ 譎ゅｒ蛻ｻ縺ｿ縺苓・繧貞叙蠕・,
    effectDescription: "5蛟埼溯ｧ｣謾ｾ / 蛟埼滉ｸｭ EXP+25% / 蜈ｨ菴馴溷ｺｦ荳頑・",
    effect: { unlockBattleSpeed: [5], speedModeBonus: { expMultiplier: 0.25, minSpeed: 1.5 }, speedMultiplier: 0.1 },
    trigger: ["timerClick", "afterLoopStart"],
    isHidden: true
  },
  {
    id: "unfavored_king",
    name: "荳埼∞閨ｷ縺ｮ邇・,
    conditionDescription: "荳埼∞閨ｷ謇ｱ縺・・繝｡繧､繝ｳ繧ｸ繝ｧ繝悶〒迴ｾ谿ｵ髫弱け繝ｪ繧｢",
    effectDescription: "繝｡繧､繝ｳ陬懈ｭ｣+40% / 繧ｵ繝冶｣懈ｭ｣+30%",
    effect: { allStatsMultiplier: 0.4, noSubJobBonus: 0.3 },
    trigger: ["afterGameClear"],
    isHidden: true
  },
  {
    id: "production_is_main",
    name: "逕溽肇縺梧悽菴・,
    conditionDescription: "逕溽肇陦悟虚繧帝㍾縺ｭ縺溽憾諷九〒迴ｾ谿ｵ髫弱け繝ｪ繧｢",
    effectDescription: "逕溽肇謌仙粥邇・20% / 蠑ｷ蛹匁・蜉溽紫+20%",
    effect: { craftSuccessBonus: 0.2, enhanceSuccessBonus: 0.2 },
    trigger: ["afterGameClear"],
    isHidden: true
  },
  {
    id: "one_man_army",
    name: "荳鬨主ｽ灘鴻",
    conditionDescription: "繧ｵ繝悶ず繝ｧ繝匁悴險ｭ螳壹〒邨ら乢繝懊せ鄒､繧呈茶遐ｴ",
    effectDescription: "繧ｵ繝悶ず繝ｧ繝悶↑縺玲凾縲∝､ｧ蟷・ｼｷ蛹・,
    effect: { noSubJobBonus: 0.35 },
    trigger: ["afterFieldBossClear", "afterGameClear"],
    isHidden: true
  },
  {
    id: "infinite_seeker",
    name: "辟｡髯舌・謗｢遨ｶ閠・,
    conditionDescription: "邏ｯ險域姶髣倥・逕溽肇繝ｻ繝ｬ繝吶Ν縺ｮ隍・粋驕疲・",
    effectDescription: "EXP+30% / GOLD+30% / 逕溽肇謌仙粥+20% / 蠑ｷ蛹匁・蜉・20%",
    effect: { expMultiplier: 0.3, goldMultiplier: 0.3, craftSuccessBonus: 0.2, enhanceSuccessBonus: 0.2 },
    trigger: ["afterBattle", "afterCraft", "afterLevelUp"],
    isHidden: true
  },
  {
    id: "anti_first_trap",
    name: "蛻晁ｦ区ｮｺ縺励ｒ谿ｺ縺呵・,
    conditionDescription: "蛻晁ｦ九・繧ｹ繧剃ｸ螳壽焚繝弱・繧ｳ繝ｳ繝・ぅ繝九Η繝ｼ謦・ｴ",
    effectDescription: "繝懊せ謌ｦ髢句ｹ墓凾縲∽ｸ弱ム繝｡+30% / 陲ｫ繝繝｡-30%",
    effect: { bossDamageBonus: 0.3, battleStartBuff: { damageReduction: 0.7, durationSec: 18 } },
    trigger: ["afterFieldBossClear"],
    isHidden: true
  },
  {
    id: "carry_beyond",
    name: "遨崎ｼ峨・蜷代％縺・・",
    conditionDescription: "讌ｵ髯宣℃遨崎ｼ峨〒鬮倬屮譏灘ｺｦ繧ｨ繝ｪ繧｢雕冗ｴ",
    effectDescription: "驥埼㍼繝壹リ繝ｫ繝・ぅ辟｡蜉ｹ / 陬・ｙ譫謨ｰ縺ｫ蠢懊§縺ｦ謾ｻ髦ｲ荳頑・",
    effect: { ignoreWeightPenalty: true, slotFillAttackDefenseBonus: 0.03 },
    trigger: ["afterGameClear"],
    isHidden: true
  },
  {
    id: "beyond_death",
    name: "豁ｻ繧定ｶ翫∴縺苓・,
    conditionDescription: "謌ｦ髣倅ｸ崎・螟壽焚縺ｮ縺ｾ縺ｾ繧ｯ繝ｪ繧｢",
    effectDescription: "蠕ｩ蟶ｰ譎ゅ↓遏ｭ譎る俣辟｡謨ｵ邏夊ｻｽ貂・,
    effect: { reviveBuff: { damageReduction: 0.4, durationSec: 8 } },
    trigger: ["afterGameClear", "afterDefeat"],
    isHidden: true
  },
  {
    id: "dev_unexpected",
    name: "驕句霧諠ｳ螳壼､・,
    conditionDescription: "諠ｳ螳壼､悶ン繝ｫ繝画擅莉ｶ繧定､・焚驕疲・",
    effectDescription: "遘ｰ蜿ｷ蜷梧凾ON謨ｰ+1 / 繝ｬ繧｢驕ｭ驕・紫荳頑・",
    effect: { titleLimitBonus: 1, uniqueEncounterRateBonus: 0.01 },
    trigger: ["afterGameClear"],
    isHidden: true
  }
];

const UNIQUE_TITLES = [
  { id: "unique_fenrir", name: "邨よ忰繧定ｶ翫∴縺苓・, conditionDescription: "繝輔ぉ繝ｳ繝ｪ繝ｫ謦・ｴ", effectDescription: "蟇ｾ繝ｦ繝九・繧ｯ荳弱ム繝｡+5%", effect: { damageToUnique: 0.05 }, trigger: ["afterUniqueKill"], uniqueId: "fenrir" },
  { id: "unique_jormungand", name: "豈呈ｵｷ雕冗ｴ閠・, conditionDescription: "繝ｨ繝ｫ繝繝ｳ繧ｬ繝ｳ繝画茶遐ｴ", effectDescription: "蟇ｾ繝ｦ繝九・繧ｯ荳弱ム繝｡+5%", effect: { damageToUnique: 0.05 }, trigger: ["afterUniqueKill"], uniqueId: "jormungand" },
  { id: "unique_cerberus", name: "蜀･蠎懊・髢遐ｴ繧・, conditionDescription: "繧ｱ繝ｫ繝吶Ο繧ｹ謦・ｴ", effectDescription: "蟇ｾ繝ｦ繝九・繧ｯ荳弱ム繝｡+5%", effect: { damageToUnique: 0.05 }, trigger: ["afterUniqueKill"], uniqueId: "cerberus" },
  { id: "unique_griffon", name: "逾樣溘・鄙ｼ謚倥ｊ", conditionDescription: "繧ｰ繝ｪ繝輔か繝ｳ謦・ｴ", effectDescription: "蟇ｾ繝ｦ繝九・繧ｯ荳弱ム繝｡+5%", effect: { damageToUnique: 0.05 }, trigger: ["afterUniqueKill"], uniqueId: "griffon" },
  { id: "unique_minotauros", name: "霑ｷ螳ｮ縺ｮ遐ｴ螢願・, conditionDescription: "繝溘ヮ繧ｿ繧ｦ繝ｭ繧ｹ謦・ｴ", effectDescription: "蟇ｾ繝ｦ繝九・繧ｯ荳弱ム繝｡+5%", effect: { damageToUnique: 0.05 }, trigger: ["afterUniqueKill"], uniqueId: "minotauros" },
  { id: "unique_phoenix", name: "霈ｪ蟒ｻ譁ｭ縺｡", conditionDescription: "魑ｳ蜃ｰ謦・ｴ", effectDescription: "蟇ｾ繝ｦ繝九・繧ｯ荳弱ム繝｡+5%", effect: { damageToUnique: 0.05 }, trigger: ["afterUniqueKill"], uniqueId: "phoenix" },
  { id: "unique_kirin", name: "螟ｩ髮ｷ雕冗ｴ閠・, conditionDescription: "鮗帝ｺ滓茶遐ｴ", effectDescription: "蟇ｾ繝ｦ繝九・繧ｯ荳弱ム繝｡+5%", effect: { damageToUnique: 0.05 }, trigger: ["afterUniqueKill"], uniqueId: "kirin" },
  { id: "god_slayer", name: "逾樊ｮｺ縺・, conditionDescription: "繝ｦ繝九・繧ｯ7菴薙☆縺ｹ縺ｦ謦・ｴ", effectDescription: "蜈ｨ閭ｽ蜉・25% / 繝ｦ繝九・繧ｯ荳弱ム繝｡+50% / 驕ｭ驕・紫荳頑・", effect: { allStatsMultiplier: 0.25, damageToUnique: 0.5, uniqueEncounterRateBonus: 0.004 }, trigger: ["afterUniqueKill"], isHidden: true }
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
  { id: "rare_hunter_nose", name: "繝ｬ繧｢迢ｩ繧翫・蝸・ｦ・, category: "normal", description: "蟶悟ｰ代↑豌鈴・繧貞羅縺主叙繧玖・, conditionDescription: "繝ｦ繝九・繧ｯ繝｢繝ｳ繧ｹ繧ｿ繝ｼ縺ｫ1蝗樣・驕・, effectDescription: "繝ｦ繝九・繧ｯ驕ｭ驕・紫+0.2%", effect: { uniqueEncounterRateBonus: 0.002 }, trigger: ["afterBattle", "afterUniqueKill"], requirements: [{ type: "statAtLeast", key: "uniqueEncounterCount", value: 1 }], tier: "rare", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "chain_champion_200", name: "騾｣謌ｦ隕・・, category: "cheat", description: "200騾｣蜍昴ｒ驕疲・縺励◆閠・, conditionDescription: "200騾｣蜍・, effectDescription: "謌ｦ髣倬幕蟋区凾繝ｩ繝ｳ繝繝繝舌ヵ", effect: { randomBattleStartBuff: { durationSec: 18, power: 0.2 } }, trigger: ["afterBattle", "battleStart"], customCheckerId: "chain_champion_200", tier: "epic", canCarryOver: true, carryOverType: "direct" },
  { id: "no_damage_strider", name: "辟｡蛯ｷ縺ｮ雕冗ｴ閠・, category: "normal", description: "荳蛻・｢ｫ蠑ｾ縺帙★騾ｲ繧閠・, conditionDescription: "1繧ｹ繝・・繧ｸ繧偵ヮ繝ｼ繝繝｡繝ｼ繧ｸ繧ｯ繝ｪ繧｢", effectDescription: "謌ｦ髣倬幕蟋九°繧我ｸ螳壽凾髢・蝗樣∩+20%", effect: { battleStartBuff: { speedMultiplier: 0.1, durationSec: 15 }, evadeByRegion: { grassland: 0.2, desert: 0.2, sea: 0.2, volcano: 0.2 } }, trigger: ["afterStageClear", "battleStart"], requirements: [{ type: "statAtLeast", key: "totalNoDamageStageClears", value: 1 }], tier: "rare", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "exp_seeker_1000", name: "邨碁ｨ薙・豎る％閠・, category: "normal", description: "蜊・姶縺ｮ譫懊※縺ｫ霎ｿ繧顔捩縺・, conditionDescription: "邏ｯ險・000謌ｦ", effectDescription: "蜿門ｾ礼ｵ碁ｨ灘､+15%", effect: { expMultiplier: 0.15 }, trigger: ["afterBattle"], requirements: [{ type: "statAtLeast", key: "totalBattles", value: 1000 }], tier: "rare", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "gold_harvester_million", name: "鮟・≡蝗槫庶閠・, category: "normal", description: "蟇後ｒ蝗槫庶縺礼ｶ壹￠繧玖・, conditionDescription: "邏ｯ險・00荳⑧迯ｲ蠕・, effectDescription: "迯ｲ蠕宥OLD+20%", effect: { goldMultiplier: 0.2 }, trigger: ["afterBattle", "afterShopTrade", "afterQuestClaim"], requirements: [{ type: "statAtLeast", key: "totalGoldLifetime", value: 1000000 }], tier: "epic", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "ailment_behemoth", name: "逡ｰ蟶ｸ閠先ｧ縺ｮ諤ｪ迚ｩ", category: "normal", description: "逡ｰ蟶ｸ繧呈ｵｴ縺ｳ邯壹￠縺滓ｪ迚ｩ", conditionDescription: "豈・鮗ｻ逞ｺ/轣ｫ蛯ｷ/蜃ｺ陦繧貞推50蝗槫女縺代ｋ", effectDescription: "迥ｶ諷狗焚蟶ｸ閠先ｧ+25%", effect: { statusAilmentResist: 0.25 }, trigger: ["afterBattle", "afterDamageTaken"], customCheckerId: "ailment_behemoth", tier: "epic", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "loop_predator", name: "蜻ｨ蝗樊黒鬟溯・, category: "cheat", description: "蜻ｨ蝗槭ｒ驥阪・縺ｦ荳也阜繧帝｣溘ｉ縺・, conditionDescription: "3蜻ｨ莉･荳翫°縺､繝懊せ蛻晁ｦ狗ｪ∫ｴ蜷郁ｨ・0蝗・, effectDescription: "蜈ｨ閭ｽ蜉・12% / 繝懊せ荳弱ム繝｡+18%", effect: { allStatsMultiplier: 0.12, bossDamageBonus: 0.18 }, trigger: ["afterGameClear", "afterFieldBossClear"], customCheckerId: "loop_predator", tier: "legend", canCarryOver: true, carryOverType: "direct" },
  { id: "title_combo_breaker", name: "遘ｰ蜿ｷ繧ｳ繝ｳ繝懃ｴ繧・, category: "cheat", description: "遘ｰ蜿ｷ縺ｮ邨・∩蜷医ｏ縺帙ｒ螢翫＠縺溯・, conditionDescription: "遘ｰ蜿ｷ繧ｳ繝ｳ繝懊ｒ25遞ｮ鬘櫁ｩｦ縺・, effectDescription: "遘ｰ蜿ｷON譎・蜈ｨ閭ｽ蜉・8%", effect: { allStatsMultiplier: 0.08 }, trigger: ["afterBattle", "afterLoopStart", "afterToggleTitle"], requirements: [{ type: "statAtLeast", key: "totalTitleCombosTried", value: 25 }], tier: "epic", canCarryOver: true, carryOverType: "direct" },
  { id: "unexpected_architect", name: "驕句霧諠ｳ螳壼､悶・謾ｹ", category: "cheat", description: "諠ｳ螳壼､悶ン繝ｫ繝峨ｒ邨・∩荳翫￡縺溯・, conditionDescription: "諠ｳ螳壼､悶ち繧ｰ繧・遞ｮ莉･荳雁酔譎る＃謌・, effectDescription: "繝ｬ繧｢驕ｭ驕・紫+2% / 繝懊せ荳弱ム繝｡+25%", effect: { uniqueEncounterRateBonus: 0.02, bossDamageBonus: 0.25 }, trigger: ["afterBattle", "afterGameClear"], customCheckerId: "unexpected_architect", tier: "legend", canCarryOver: true, carryOverType: "direct", isHidden: true },
  { id: "speed_ritualist", name: "騾溷ｺｦ蜆蠑上・陦楢・, category: "cheat", description: "鬮伜咲紫縺ｮ譎る俣縺ｫ蜿悶ｊ諞代°繧後◆閠・, conditionDescription: "4x莉･荳翫ｒ300遘剃ｻ･荳贋ｽｿ逕ｨ", effectDescription: "蛟埼滉ｸｭ EXP+12%", effect: { speedModeBonus: { expMultiplier: 0.12, minSpeed: 1.5 } }, trigger: ["timerClick", "afterBattle"], customCheckerId: "speed_ritualist", tier: "epic", canCarryOver: true, carryOverType: "direct" },
  { id: "unique_theorist", name: "繝ｦ繝九・繧ｯ逕滓・蟄ｦ閠・, category: "normal", description: "荳・ｽ薙・霆瑚ｷ｡繧定ｾｿ繧玖・, conditionDescription: "繝ｦ繝九・繧ｯ遞ｮ鬘樊茶遐ｴ謨ｰ5莉･荳・, effectDescription: "繝ｦ繝九・繧ｯ縺ｸ縺ｮ荳弱ム繝｡+20%", effect: { uniqueDamageBonus: 0.2 }, trigger: ["afterUniqueKill"], requirements: [{ type: "statAtLeast", key: "totalUniqueTypesDefeated", value: 5 }], tier: "rare", canCarryOver: false, carryOverType: "recordOnly" },
  { id: "crafted_boss_bane", name: "蟾･闃ｸ豁ｦ陬・・隕・・, category: "cheat", description: "閾ｪ菴懆｣・ｙ縺ｧ繝懊せ繧貞ｱ縺｣縺溯・, conditionDescription: "繧ｯ繝ｩ繝輔ヨ陬・ｙ縺ｧ繝懊せ繧・0菴捺茶遐ｴ", effectDescription: "繧ｯ繝ｩ繝輔ヨ陬・ｙ陬懈ｭ｣+25%", effect: { craftedGearBonus: 0.25 }, trigger: ["afterFieldBossClear", "afterBattle"], requirements: [{ type: "statAtLeast", key: "craftedGearBossKillCount", value: 10 }], tier: "epic", canCarryOver: true, carryOverType: "direct" },
  { id: "loop_conditional_core", name: "霈ｪ蟒ｻ縺ｮ荳ｭ譬ｸ", category: "cheat", description: "蜻ｨ蝗槭ｒ驥阪・繧九⊇縺ｩ蠑ｷ縺ｾ繧・, conditionDescription: "2蜻ｨ莉･荳翫〒隗｣謾ｾ", effectDescription: "繝ｫ繝ｼ繝玲焚縺ｫ蠢懊§縺ｦ蜈ｨ閭ｽ蜉帑ｸ頑・", effect: { conditionalBuffByLoop: { perLoopAllStatsMultiplier: 0.03, maxLoopBonus: 0.21 } }, trigger: ["afterLoopStart", "afterGameClear"], requirements: [{ type: "loopAtLeast", value: 2 }], tier: "legend", canCarryOver: true, carryOverType: "direct" },
  { id: "low_tier_emperor", name: "荳埼∞閨ｷ逧・, category: "cheat", description: "譛荳倶ｽ崎・繧呈･ｵ繧√◆逧・, conditionDescription: "荳埼∞閨ｷ繧ｯ繝ｪ繧｢2蝗・, effectDescription: "荳埼∞閨ｷ譎・蜈ｨ閭ｽ蜉・22%", effect: { lowTierJobBonus: 0.22 }, trigger: ["afterGameClear"], requirements: [{ type: "statAtLeast", key: "loopClearWithLowTierJob", value: 2 }], tier: "legend", canCarryOver: true, carryOverType: "direct", isHidden: true }
];

TITLE_DATA.push(...PHASE10_TITLES);

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
  dev_unexpected: () => evaluateExploitTags().length >= 4
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

const BOARD_BASE_THREADS = [
  { id: "th_bee", title: "縲先ご蝣ｱ縲題拷蜴溘・陷ゅ′蠑ｷ縺吶℃繧・, body: "髢句ｹ輔〒蛻ｺ縺輔ｌ繧九→蝨ｰ蜻ｳ縺ｫ逞帙＞縲ょ屓驕ｿ蝙九〒陦後￥縺ｹ縺搾ｼ・, minProgressStage: "1-1" },
  { id: "th_job", title: "蛻晏ｿ・・♀縺吶☆繧∬・縺ゅｋ・・, body: "蜑｣螢ｫ螳牙ｮ夲ｼ溷ｿ崎・・蝗樣∩繧よｰ励↓縺ｪ繧九・, minProgressStage: "1-1" },
  { id: "th_1g", title: "1G諡ｾ縺・ｶ壹￠縺ｦ繧倶ｺｺ縺・ｋ・・, body: "蟆城姦諡ｾ縺・ｧｰ蜿ｷ縺｣縺ｦ譛ｬ蠖薙↓縺ゅｋ縺ｮ縺区､懆ｨｼ荳ｭ縲・, minProgressStage: "1-1" },
  { id: "th_cook_fail", title: "譁咏炊100蝗槫､ｱ謨励＠縺溘ｄ縺､縺翫ｋ・・, body: "騾・↓謇崎・縺ゅｋ縺｣縺ｦ蝎ゅ・, minProgressStage: "1-1" },
  { id: "th_black_wolf", title: "萓九・鮟偵＞迢ｼ隕九◆繧薙□縺・, body: "繝ｦ繝九・繧ｯ縺｣縺ｽ縺・ｦ九◆逶ｮ縺縺｣縺溘る・驕・紫菴弱☆縺弱・, minProgressStage: "1-3" },
  { id: "th_prod_endgame", title: "逕溽肇閨ｷ縺｣縺ｦ邨ら乢縺ｧ繧ょｼｷ縺・・・・, body: "骰帛・縺ｨ譁咏炊縺ｩ縺｣縺｡繧貞・縺ｫ荳翫￡繧九°謔ｩ繧縲・, minProgressStage: "1-5" },
  { id: "th_unfavored", title: "荳埼∞閨ｷ縺｣縺ｦ譛ｬ蠖薙↓荳埼∞縺ｪ縺ｮ・・, body: "遘ｰ蜿ｷ縺ｧ縺ｲ縺｣縺上ｊ霑斐ｋ隱ｬ縺ゅｋ縲・, minProgressStage: "1-6" },
  { id: "th_timer", title: "譎る俣縺ｮ陦ｨ遉ｺ謚ｼ縺励※繧九ｄ縺､菴輔＠縺ｦ繧九・・・, body: "謚ｼ縺吶→菴輔°縺ゅｋ縺｣縺ｦ閨槭＞縺溘・, minProgressStage: "1-1" },
  { id: "th_title_idle", title: "繧ｿ繧､繝医Ν逕ｻ髱｢縺ｧ謾ｾ鄂ｮ縺励※縺溘ｉ菴輔°縺ゅ▲縺滂ｼ・, body: "魑･縺碁｣帙・縺縺代§繧・↑縺・▲縺ｦ蝎ゅ・, minProgressStage: "1-1" }
];

const INTRO_MESSAGES = [
  { speaker: "邂｡逅・I: AURORA", text: "謗･邯壹ｒ遒ｺ隱阪＠縺ｾ縺励◆縲ゅｈ縺・％縺昴∽ｻｮ諠ｳ荳也阜縲翫い繝ｼ繝ｫ繝ｻ繝ｦ繝九ヰ繝ｼ繧ｹ縲九∈縲・ },
  { speaker: "邂｡逅・I: AURORA", text: "縺薙・荳也阜縺ｧ縺ｯ縲∝・髯ｺ繝ｻ逕溽肇繝ｻ遘ｰ蜿ｷ蜿朱寔縺ｫ繧医▲縺ｦ縺ゅ↑縺溘・迚ｩ隱槭′蠎・′繧翫∪縺吶・ },
  { speaker: "邂｡逅・I: AURORA", text: "縺ｾ縺壹・蛻晄悄繧ｸ繝ｧ繝悶ｒ驕ｸ謚槭＠縺ｦ縺上□縺輔＞縲る∈謚槫・螳ｹ縺ｯ蠕後⊇縺ｩ逾樊ｮｿ縺ｧ螟画峩蜿ｯ閭ｽ縺ｫ縺ｪ繧倶ｺ亥ｮ壹〒縺吶・ }
];

const MAIN_TABS = [
  { id: "adventure", label: "蜀帝匱" },
  { id: "guild", label: "繧ｮ繝ｫ繝・ },
  { id: "board", label: "謗ｲ遉ｺ譚ｿ" },
  { id: "status", label: "繧ｹ繝・・繧ｿ繧ｹ" },
  { id: "items", label: "繧｢繧､繝・Β" }
];

const LOW_TIER_MAIN_JOBS = ["cleric"];

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
    selectedThreadId: null
  },
  settings: {
    bgmOn: true
  },
  loop: {
    clearedGame: false,
    loopCount: 0,
    carryOverCandidates: [],
    selectedCarryOverTitleIds: [],
    carryOverLimit: 1,
    carriedTitles: [],
    titleHistory: [],
    persistentStats: {
      totalLoops: 0,
      totalPlaytime: 0,
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
      totalBossFirstTryWins: 0
    },
    carryUniqueRecords: true,
    loopSummaries: []
  },
  ui: {
    titlePopupTimeoutId: null,
    battleSpecialPopupTimeoutId: null,
    titleScreenIdleTimerStartedAt: Date.now(),
    clearResultShown: false,
    navigationHistory: [],
    selectedEquipmentSlotId: "weapon1"
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
    completedQuestIds: [],
    claimedQuestIds: [],
    maxActiveQuests: 3,
    workshopTab: "craft"
  },
  battle: {
    isActive: false,
    stageId: null,
    status: "蠕・ｩ・,
    playerCurrentHp: 0,
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
    critFinishThisBoss: false
    ,
    stageDamageTaken: 0
  },
  player: {
    name: "繝励Ξ繧､繝､繝ｼ",
    level: 1,
    exp: 0,
    gold: 100,
    mainJobId: null,
    mainJob: null,
    subJobId: null,
    subJob: null,
    subJobUnlocked: false,
    productionJob: "阮ｬ蟶ｫ",
    productionJobLevel: 1,
    productionJobExp: 0,
    productionJobStage: 0,
    productionProgress: {
      阮ｬ蟶ｫ: { level: 1, exp: 0, stage: 0, crafts: 0 },
      骰帛・蟶ｫ: { level: 1, exp: 0, stage: 0, crafts: 0 },
      隱ｿ逅・ｺｺ: { level: 1, exp: 0, stage: 0, crafts: 0 }
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
    exploitTags: []
  }
};

const app = document.getElementById("app");

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

function addLog(text) {
  state.player.logs.push({ at: nowTimeText(), text });
  if (state.player.logs.length > MAX_LOG_LINES) {
    state.player.logs = state.player.logs.slice(-MAX_LOG_LINES);
  }
  if (state.screen === "game") {
    renderLogPanel();
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
    boardSelectedThreadId: state.board.selectedThreadId || null
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
    a.boardSelectedThreadId === b.boardSelectedThreadId
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
    state.battle.status = "蠕・ｩ・;
    addLog("謌ｦ髣倥ｒ荳ｭ譁ｭ縺励※逶ｴ蜑阪・逕ｻ髱｢縺ｸ謌ｻ繧翫∪縺吶・);
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
    addLog("縺薙ｌ莉･荳頑綾繧後ｋ逕ｻ髱｢縺後≠繧翫∪縺帙ｓ縲・);
    render();
    return;
  }
  applyNavigationSnapshot(previous);
  addLog("荳縺､蜑阪・逕ｻ髱｢縺ｫ謌ｻ繧翫∪縺励◆縲・);
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
  app.innerHTML = `
    <section class="screen title-screen">
      <p class="subtitle">繝悶Λ繧ｦ繧ｶ繧ｷ繝ｳ繧ｰ繝ｫ繝励Ξ繧､RPG</p>
      <h1 class="game-title">繧ｿ繧､繝医Ν縺ｯ縺ｩ縺｣縺九〒隕九◆縺薙→縺ゅｋMMORPG</h1>
      <p class="subtitle">隕九◆縺薙→縺ゅｋ荳也阜縺ｧ縲∬ｦ九◆縺薙→縺ｪ縺・黄隱槭ｒ縺ｯ縺倥ａ繧医≧縲・/p>
      <button id="start-btn" class="btn btn-primary">縺ｯ縺倥ａ繧・/button>
    </section>
  `;
  document.getElementById("start-btn").addEventListener("click", () => {
    state.screen = "intro";
    state.introIndex = 0;
    addLog("繧ｲ繝ｼ繝髢句ｧ九よ磁邯壹す繝ｼ繧ｱ繝ｳ繧ｹ繧帝幕蟋九＠縺ｾ縺励◆縲・);
    render();
  });
}

function renderIntroScreen() {
  const message = INTRO_MESSAGES[state.introIndex];
  const isLast = state.introIndex >= INTRO_MESSAGES.length - 1;
  app.innerHTML = `
    <section class="screen intro-box">
      <h2>蟆主・繧､繝吶Φ繝・/h2>
      <div class="panel">
        <h3 class="speaker">${escapeHtml(message.speaker)}</h3>
        <p class="message">${escapeHtml(message.text)}</p>
      </div>
      <div><button id="intro-next-btn" class="btn btn-primary">${isLast ? "繧ｸ繝ｧ繝夜∈謚槭∈" : "谺｡縺ｸ"}</button></div>
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
    .map((job) => `<div class="job-card"><h3>${job.name}</h3><p>${job.description}</p><button class="btn job-select-btn" data-job-id="${job.id}">縺薙・繧ｸ繝ｧ繝悶〒髢句ｧ・/button></div>`)
    .join("");
  app.innerHTML = `
    <section class="screen job-box">
      <h2>蛻晄悄繧ｸ繝ｧ繝夜∈謚・/h2>
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
  recalculateTitleEffects();
  state.screen = "game";
  state.currentTab = "adventure";
  addLog(`蛻晄悄繧ｸ繝ｧ繝悶ｒ驕ｸ謚・ ${job.name}`);
  render();
}

function renderGameScreen() {
  const activeNames = state.activeTitles.map((id) => getTitleById(id)?.name).filter(Boolean);
  const speedOptions = state.unlockedBattleSpeedOptions.map((s) => `${s}x`).join(" / ");
  const effective = getEffectivePlayerStats();
  const weightInfo = effective.weightInfo;
  app.innerHTML = `
    <section class="game-layout-wrap">
      <div class="hud-top panel">
        <button id="timer-button" class="btn timer-btn">1:00 (${state.battleSpeedMultiplier}x)</button>
        <button id="bgm-toggle-btn" class="btn">${state.settings.bgmOn ? "BGM:ON" : "BGM:OFF"}</button>
        <div class="hud-item">逕ｺ: <strong>${escapeHtml(TOWN_DATA[state.currentTown].name)}</strong></div>
        <div class="hud-item">繝ｫ繝ｼ繝・ <strong>${state.loop.loopCount}</strong></div>
        <div class="hud-item">繧ｮ繝ｫ繝・ <strong>${state.guild.rank}</strong> (${state.guild.points}pt)</div>
        <div class="hud-item">謇謖；: <strong>${state.player.gold}</strong></div>
        <div class="hud-item">ON遘ｰ蜿ｷ: <strong>${state.activeTitles.length}/${getCurrentTitleLimit()}</strong> ${activeNames.length ? escapeHtml(activeNames.join(" / ")) : "縺ｪ縺・}</div>
        <div class="hud-item">繧ｸ繝ｧ繝・ ${escapeHtml(state.player.mainJob || "譛ｪ險ｭ螳・)} / 繧ｵ繝・ ${escapeHtml(state.player.subJob || (state.player.subJobUnlocked ? "譛ｪ險ｭ螳・ : "譛ｪ隗｣謾ｾ"))}</div>
        <div class="hud-item">隗｣謾ｾ蛟咲紫: ${escapeHtml(speedOptions)}</div>
        <div class="hud-item">驥埼㍼: <strong>${weightInfo.totalWeight}/${weightInfo.capacity}</strong> (${weightInfo.rankLabel})</div>
        <div class="hud-item">繝薙Ν繝・ ${escapeHtml((effective.buildTags || []).join(", ") || "縺ｪ縺・)}</div>
      </div>

      <section class="screen game-layout">
        <aside class="log-panel">
          <h3 class="panel-title">繝ｭ繧ｰ</h3>
          <ul id="log-list" class="log-list"></ul>
        </aside>
        <main class="main-panel">
          <div class="back-wrap"><button id="back-to-title-btn" class="btn">荳縺､蜑阪↓謌ｻ繧・/button></div>
          <div id="main-view" class="main-view"></div>
        </main>
        <nav class="bottom-panel">
          ${MAIN_TABS.map((tab) => `<button class="btn tab-btn ${state.currentTab === tab.id ? "active" : ""}" data-tab-id="${tab.id}">${tab.label}</button>`).join("")}
        </nav>
      </section>

      <div id="title-unlock-popup" class="title-popup"></div>
      <div id="battle-special-popup" class="title-popup special-popup"></div>
    </section>
  `;
  renderLogPanel();
  renderMainView();
  bindGameEvents();
}

function renderLogPanel() {
  const logList = document.getElementById("log-list");
  if (!logList) {
    return;
  }
  logList.innerHTML = state.player.logs.map((log) => `<li><span class="log-time">[${escapeHtml(log.at)}]</span>${escapeHtml(log.text)}</li>`).join("");
  logList.scrollTop = logList.scrollHeight;
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
  renderItemsView(container);
}

function renderAdventureView(container) {
  if (state.battle.isActive || isBattleResultState()) {
    container.innerHTML = renderBattleView();
    return;
  }
  const nextStage = getNextUnlockableStage(state.currentMap);
  container.innerHTML = `
    <div class="main-header">
      <h2>蜀帝匱</h2>
      <span class="tiny">迴ｾ蝨ｨ縺ｮ逕ｺ: ${escapeHtml(TOWN_DATA[state.currentTown].name)}</span>
    </div>
    <div class="card adventure-summary">
      <p>迴ｾ蝨ｨ繝槭ャ繝・ <strong>${escapeHtml(MAP_DATA[state.currentMap].name)}</strong> (${MAP_DATA[state.currentMap].recommendedLevel})</p>
      <p>迴ｾ蝨ｨ繧ｹ繝・・繧ｸ: <strong>${escapeHtml(state.currentStage)}</strong> / 騾ｲ陦・ ${state.currentStageKillCount}/${state.currentStageTargetKills}</p>
      <p>谺｡隗｣謾ｾ繧ｹ繝・・繧ｸ: <strong>${escapeHtml(nextStage || "螳御ｺ・)}</strong></p>
      <p>繝輔ぅ繝ｼ繝ｫ繝峨・繧ｹ蛻ｰ驕・ ${state.fieldBossCleared.length} / 4</p>
    </div>
    ${renderTownSelector()}
    ${renderStageList()}
    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
      <button id="start-stage-battle-btn" class="btn btn-primary">謌ｦ髣倬幕蟋・/button>
    </div>
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
      <h4>霆｢遘ｻ髢</h4>
      <p class="tiny">隗｣謾ｾ貂医∩逕ｺ: ${escapeHtml(state.unlockedTowns.map((id) => TOWN_DATA[id].name).join(" / "))}</p>
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
    stageButtons.push(
      `<button class="btn stage-select-btn ${state.currentStage === stageId ? "active" : ""}" data-stage-id="${stageId}" ${unlocked ? "" : "disabled"}>
      ${stageId}${stage.isFieldBossStage ? " [BOSS]" : ""}
      <span class="tiny">${unlocked ? `${progress.kills}/${progress.target}` : "LOCK"}</span>
      </button>`
    );
  }
  return `<div class="card" style="margin-top:10px;"><h4>繧ｹ繝・・繧ｸ荳隕ｧ (${map.name})</h4><div class="stage-grid">${stageButtons.join("")}</div></div>`;
}

function selectTown(townId) {
  if (!state.unlockedTowns.includes(townId)) {
    addLog("譛ｪ隗｣謾ｾ縺ｮ逕ｺ縺ｧ縺吶・);
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
  addLog(`霆｢遘ｻ髢襍ｷ蜍・ ${TOWN_DATA[townId].name}縺ｸ遘ｻ蜍輔Ａ);
  render();
}

function selectStage(stageId, shouldRender = true) {
  if (!isStageUnlocked(stageId)) {
    addLog("譛ｪ隗｣謾ｾ繧ｹ繝・・繧ｸ縺ｧ縺吶・);
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
  addLog(`繧ｹ繝・・繧ｸ驕ｸ謚・ ${stageId}`);
  if (shouldRender) {
    render();
  }
}

function startStageBattle() {
  if (state.battle.isActive) {
    return;
  }
  const stage = STAGE_DATA[state.currentStage];
  const progress = getStageProgress(stage.id);
  if (progress.cleared) {
    addLog("繧ｯ繝ｪ繧｢貂医∩繧ｹ繝・・繧ｸ縺ｧ縺吶・);
    return;
  }
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
      addLog("遘ｰ蜿ｷ蜉ｹ譫・ 蛻晏屓豁ｻ莠｡閠・′逋ｺ蜍輔・0遘帝俣 謾ｻ謦・10%縲・);
    }
    if (state.unlockedTitles.includes("beyond_death")) {
      const revive = getTitleById("beyond_death")?.effect?.reviveBuff;
      if (revive) {
        state.titleRuntime.reviveProtectionUntil = Date.now() + revive.durationSec * 1000;
        addLog("遘ｰ蜿ｷ蜉ｹ譫・ 豁ｻ繧定ｶ翫∴縺苓・′逋ｺ蜍輔ょｾｩ蟶ｰ逶ｴ蠕後・菫晁ｭｷ迥ｶ諷九・);
      }
    }
    state.titleRuntime.reviveBuffPending = false;
  }
  recalculateTitleEffects();
  state.stats.totalBattles += 1;
  checkEndgameTitleConditions();
  state.stats.battlesByRegion[stage.mapId] = (state.stats.battlesByRegion[stage.mapId] || 0) + 1;
  state.runtime.bossAttemptCounts[stage.id] = (state.runtime.bossAttemptCounts[stage.id] || 0) + (stage.isFieldBossStage ? 1 : 0);

  const effective = getEffectivePlayerStats();
  state.battle = {
    isActive: true,
    stageId: stage.id,
    status: "謌ｦ髣倅ｸｭ",
    playerCurrentHp: Math.max(1, Math.min(effective.maxHp, state.player.hp)),
    playerCurrentMp: Math.max(0, Math.min(effective.maxMp, state.player.mp)),
    enemy: null,
    intervalId: null,
    playerNextActionAt: Date.now() + Math.floor(420 / state.battleSpeedMultiplier),
    enemyNextActionAt: Date.now() + Math.floor(680 / state.battleSpeedMultiplier),
    skillRotationIndex: 0,
    recentActionText: "謌ｦ髣倬幕蟋・,
    pendingSpawnAt: 0,
    isFieldBossBattle: stage.isFieldBossStage,
    isUniqueBattle: false,
    stageKillCount: progress.kills,
    stageTargetKills: stage.targetKills,
    itemUsedInStage: false,
    gimmick: { warnedAt: 0, triggered: false, extra: {} },
    critFinishThisBoss: false,
    stageDamageTaken: 0
  };

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
      addLog("遘ｰ蜿ｷ蜉ｹ譫・ 繝ｩ繝ｳ繝繝謾ｻ謦・ヰ繝慕匱蜍・);
    } else if (pick === 1) {
      applyEffect("player", "title_random_defense", { stat: "defense", multiplier: 1 + (buff.power || 0.15), durationMs: (buff.durationSec || 15) * 1000 });
      addLog("遘ｰ蜿ｷ蜉ｹ譫・ 繝ｩ繝ｳ繝繝髦ｲ蠕｡繝舌ヵ逋ｺ蜍・);
    } else {
      applyEffect("player", "title_random_speed", { stat: "speed", multiplier: 1 + (buff.power || 0.15), durationMs: (buff.durationSec || 15) * 1000 });
      addLog("遘ｰ蜿ｷ蜉ｹ譫・ 繝ｩ繝ｳ繝繝騾溷ｺｦ繝舌ヵ逋ｺ蜍・);
    }
  }

  addLog(`謌ｦ髣倬幕蟋・ ${stage.id} (${progress.kills}/${progress.target})`);
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
    master = state.world.enemies[stage.fieldBoss];
  } else if (rollUniqueEncounter()) {
    master = spawnUniqueEnemy();
    state.battle.isUniqueBattle = true;
    state.battle.isFieldBossBattle = false;
  } else {
    const pool = stage.normalEnemyPool;
    const enemyId = pool[Math.floor(Math.random() * pool.length)];
    master = state.world.enemies[enemyId];
  }

  state.battle.enemy = { ...master, maxHp: master.hp, hp: master.hp, maxMp: master.mp, mp: master.mp };
  state.battle.playerNextActionAt = Date.now() + Math.floor(360 / state.battleSpeedMultiplier);
  state.battle.enemyNextActionAt = Date.now() + Math.floor(580 / state.battleSpeedMultiplier);
  state.battle.recentActionText = `${master.name} 縺檎樟繧後◆`;
  addLog(`謨ｵ蜃ｺ迴ｾ: ${master.name}`);

  if (state.battle.isUniqueBattle) {
    showBattleSpecialPopup(`繝ｦ繝九・繧ｯ蜃ｺ迴ｾ: ${master.name}`);
  } else if (state.battle.isFieldBossBattle) {
    showBattleSpecialPopup(`繝輔ぅ繝ｼ繝ｫ繝峨・繧ｹ蜃ｺ迴ｾ: ${master.name}`);
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
  return Math.random() < 0.001 + luckBonus + titleBonus;
}

function spawnUniqueEnemy() {
  const all = Object.values(state.world.uniqueEnemies);
  const selected = all[Math.floor(Math.random() * all.length)];
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
    addLog("遘ｰ蜿ｷ蜉ｹ譫・ 蛻晏屓豁ｻ莠｡閠・・謾ｻ謦・ヰ繝慕ｵゆｺ・・);
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

  handleBossGimmickPhase();

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
  const map = MAP_DATA[stage.mapId];
  if (!map.bossGimmick) {
    return;
  }
  triggerBossGimmick(map.bossGimmick);
}

function triggerBossGimmick(gimmick) {
  const now = Date.now();
  if (gimmick.type === "charge") {
    if (!state.battle.gimmick.warnedAt) {
      state.battle.gimmick.warnedAt = now;
      addLog(`縲蝉ｺ亥・縲・{gimmick.warning} 繝偵Φ繝・ ${gimmick.hint}`);
      return;
    }
    if (!state.battle.gimmick.triggered && now - state.battle.gimmick.warnedAt >= gimmick.triggerSec * 1000) {
      state.battle.gimmick.triggered = true;
      const dmg = Math.max(1, Math.floor(getEffectivePlayerStat("maxHp") * gimmick.damageRate * getDamageReductionMultiplier()));
      applyDamage("enemy", dmg, "遯・ｲ");
      addLog("縲舌ぐ繝溘ャ繧ｯ縲醍ｪ・ｲ縺檎峩謦・＠縺滂ｼ・);
    }
    return;
  }

  if (gimmick.type === "poisonMist") {
    if (!state.battle.gimmick.warnedAt) {
      state.battle.gimmick.warnedAt = now;
      addLog(`縲蝉ｺ亥・縲・{gimmick.warning} 繝偵Φ繝・ ${gimmick.hint}`);
      return;
    }
    if (!state.battle.gimmick.extra.poisonActive && now - state.battle.gimmick.warnedAt >= gimmick.triggerSec * 1000) {
      state.battle.gimmick.extra.poisonActive = true;
      state.battle.gimmick.extra.poisonEndAt = now + gimmick.durationSec * 1000;
      addLog("縲舌ぐ繝溘ャ繧ｯ縲第ｯ帝悸繝輔ぉ繝ｼ繧ｺ遯∝・縲らｶ咏ｶ壹ム繝｡繝ｼ繧ｸ逋ｺ逕溘・);
    }
    if (state.battle.gimmick.extra.poisonActive) {
      if (!state.battle.gimmick.extra.lastPoisonTick || now - state.battle.gimmick.extra.lastPoisonTick >= 1000) {
        state.battle.gimmick.extra.lastPoisonTick = now;
        const dmg = Math.max(1, Math.floor(getEffectivePlayerStat("maxHp") * gimmick.damageRate));
        applyDamage("enemy", dmg, "豈帝悸");
      }
      if (now >= state.battle.gimmick.extra.poisonEndAt) {
        state.battle.gimmick.extra.poisonActive = false;
        addLog("縲舌ぐ繝溘ャ繧ｯ縲第ｯ帝悸縺梧匐繧後◆縲・);
      }
    }
    return;
  }

  if (gimmick.type === "periodicBurst") {
    if (!state.battle.gimmick.extra.nextBurstAt) {
      state.battle.gimmick.extra.nextBurstAt = now + gimmick.triggerSec * 1000;
      addLog(`縲蝉ｺ亥・縲・{gimmick.warning} 繝偵Φ繝・ ${gimmick.hint}`);
      return;
    }
    if (now >= state.battle.gimmick.extra.nextBurstAt) {
      const dmg = Math.max(1, Math.floor(getEffectivePlayerStat("maxHp") * gimmick.damageRate * getDamageReductionMultiplier()));
      applyDamage("enemy", dmg, "豌ｴ豬√ヶ繝ｬ繧ｹ");
      addLog("縲舌ぐ繝溘ャ繧ｯ縲第ｰｴ豬√ヶ繝ｬ繧ｹ縺檎ず陬ゑｼ・);
      state.battle.gimmick.extra.nextBurstAt = now + gimmick.triggerSec * 1000;
    }
    return;
  }

  if (gimmick.type === "enrage") {
    if (!state.battle.gimmick.triggered && state.battle.enemy.hp <= state.battle.enemy.maxHp * gimmick.triggerHpRate) {
      state.battle.gimmick.triggered = true;
      state.battle.enemy.attack = Math.floor(state.battle.enemy.attack * gimmick.attackBoost);
      addLog(`縲蝉ｺ亥・縲・{gimmick.warning} 繝偵Φ繝・ ${gimmick.hint}`);
      addLog("縲舌ぐ繝溘ャ繧ｯ縲第偵ｊ迥ｶ諷九〒謾ｻ謦・鴨縺御ｸ頑・・・);
    }
  }
}

function playerAction() {
  if (!state.battle.enemy || state.battle.enemy.hp <= 0) {
    return;
  }
  const effective = getEffectivePlayerStats();

  const skill = pickUsableSkill();
  if (skill) {
    useSkill(skill);
    return;
  }

  const hitChance = 0.88 + state.titleEffects.accuracyBonus - state.battle.enemy.speed * 0.0012;
  if (Math.random() > hitChance) {
    state.stats.attacksMissed += 1;
    state.battle.recentActionText = "騾壼ｸｸ謾ｻ謦・・蝗樣∩縺輔ｌ縺・;
    addLog("騾壼ｸｸ謾ｻ謦・・蝗樣∩縺輔ｌ縺溘・);
    checkTitleUnlocks("afterMiss");
    return;
  }

  const critChance = effective.critRate;
  const isCrit = Math.random() < critChance;
  const base = Math.max(1, Math.floor(effective.attack - state.battle.enemy.defense * 0.6));
  const damage = isCrit ? Math.floor(base * 1.5) : base;
  applyDamage("player", damage, isCrit ? "莨壼ｿ・・荳謦・ : "騾壼ｸｸ謾ｻ謦・, isCrit);
}

function enemyAction() {
  if (!state.battle.enemy || state.battle.enemy.hp <= 0) {
    return;
  }
  const effective = getEffectivePlayerStats();
  const evadeBonus = state.titleEffects.evadeByRegion[STAGE_DATA[state.battle.stageId].mapId] || 0;
  const hitChance = (0.92 * getEnemyAccuracyMultiplier()) - evadeBonus - effective.evasion;
  if (Math.random() > hitChance) {
    addLog(`${state.battle.enemy.name} 縺ｮ謾ｻ謦・・螟悶ｌ縺溘Ａ);
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
  const damage = Math.max(1, Math.floor(raw * reduction));
  applyDamage("enemy", damage, "騾壼ｸｸ謾ｻ謦・);
}

function useSkill(skill) {
  const mpCost = Math.max(0, Math.floor(skill.mpCost * (1 - state.titleEffects.mpCostReduction)));
  if (state.battle.playerCurrentMp < mpCost) {
    return;
  }
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
    applyDamage("player", calculateSkillDamage(skill), skill.name);
    return;
  }
  if (skill.type === "multiAttack") {
    const hits = skill.hits || 2;
    for (let i = 0; i < hits; i += 1) {
      if (!state.battle.enemy || state.battle.enemy.hp <= 0) {
        break;
      }
      applyDamage("player", Math.max(1, Math.floor(calculateSkillDamage(skill))), `${skill.name} ${i + 1}謦・岼`);
    }
    return;
  }
  if (skill.type === "heal") {
    const healMul = 1 + state.titleEffects.healMultiplier;
    const heal = Math.max(8, Math.floor((getEffectivePlayerStat("maxHp") * skill.healRatio + getEffectivePlayerStat("intelligence") * 0.4) * healMul));
    state.battle.playerCurrentHp = Math.min(getEffectivePlayerStat("maxHp"), state.battle.playerCurrentHp + heal);
    addLog(`蝗槫ｾｩ: ${skill.name} 縺ｧ ${heal}`);
    return;
  }
  if (skill.type === "buff") {
    applyEffect("player", skill.id, skill.effect);
    addLog(`繝舌ヵ逋ｺ蜍・ ${skill.name}`);
    return;
  }
  if (skill.type === "debuff") {
    applyEffect("enemy", skill.id, skill.effect);
    addLog(`繝・ヰ繝慕匱蜍・ ${skill.name}`);
    return;
  }
  if (skill.type === "attackDebuff") {
    applyDamage("player", calculateSkillDamage(skill), skill.name);
    applyEffect("enemy", skill.id, skill.effect);
  }
}

function applyDamage(source, amount, actionName, isCrit = false) {
  if (!state.battle.enemy) {
    return;
  }
  if (source === "player") {
    let damage = applyPlayerDamageBonuses(amount, state.battle.enemy);
    state.battle.enemy.hp = Math.max(0, state.battle.enemy.hp - damage);
    state.battle.recentActionText = `${actionName} -> ${state.battle.enemy.name} 縺ｫ ${damage} 繝繝｡繝ｼ繧ｸ`;
    addLog(`${actionName}: ${state.battle.enemy.name} 縺ｫ ${damage} 繝繝｡繝ｼ繧ｸ`);
    if (state.battle.enemy.hp <= 0) {
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
  addLog(`陲ｫ繝繝｡繝ｼ繧ｸ: ${amount}`);
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

  addLog(`謨ｵ謦・ｴ: ${enemy.name}`);
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
  prog.cleared = true;
  prog.kills = prog.target;
  if (!state.clearedStages.includes(stageId)) {
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
  addLog(`繧ｹ繝・・繧ｸ繧ｯ繝ｪ繧｢: ${stageId} / 繝懊・繝翫せ EXP+${bonusExp}, GOLD+${bonusGold}`);
  checkLevelUp();

  if (stage.isFieldBossStage) {
    handleFieldBossClear(stageId);
  }

  state.currentStageKillCount = prog.kills;
  state.currentStageTargetKills = prog.target;
  state.battle.isActive = false;
  state.battle.status = "繧ｹ繝・・繧ｸ繧ｯ繝ｪ繧｢";
  state.battle.enemy = null;
  stopBattleLoop();
  checkTitleUnlocks("afterStageClear");
  checkTitleUnlocks("afterBattle");
  render();
}

function handleFieldBossClear(stageId) {
  if (!state.fieldBossCleared.includes(stageId)) {
    state.fieldBossCleared.push(stageId);
  }
  state.stats.fieldBossKillCount += 1;
  addLog(`繝輔ぅ繝ｼ繝ｫ繝峨・繧ｹ險惹ｼ仙ｮ御ｺ・ ${stageId}`);

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
    addLog("轣ｫ螻ｱ4-10雕冗ｴ縲ら樟谿ｵ髫弱け繝ｪ繧｢・・);
    state.loop.clearedGame = true;
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
  checkEndgameTitleConditions();
}

function unlockTown(townId) {
  if (state.unlockedTowns.includes(townId)) {
    return;
  }
  state.unlockedTowns.push(townId);
  state.stats.townUnlockCount += 1;
  addLog(`逕ｺ隗｣謾ｾ: ${TOWN_DATA[townId].name}`);
  showBattleSpecialPopup(`逕ｺ隗｣謾ｾ: ${TOWN_DATA[townId].name}`);
}

function handleUniqueVictory(enemy) {
  state.uniqueKillCount += 1;
  state.stats.uniqueKillCount += 1;
  state.stats.uniqueKillById[enemy.id] = (state.stats.uniqueKillById[enemy.id] || 0) + 1;
  if (!state.uniqueDefeatedIds.includes(enemy.id)) {
    state.uniqueDefeatedIds.push(enemy.id);
    state.stats.totalUniqueTypesDefeated = state.uniqueDefeatedIds.length;
  }
  const uniqueBonusExp = Math.floor(enemy.exp * 0.5);
  const uniqueBonusGold = Math.floor(enemy.gold * 0.5);
  state.player.exp += uniqueBonusExp;
  state.player.gold += uniqueBonusGold;
  state.stats.totalGoldEarned += uniqueBonusGold;
  state.stats.totalGoldLifetime += uniqueBonusGold;

  const skillTag = `unique_skill_${enemy.id}`;
  if (!state.unlockedUniqueSkills.includes(skillTag)) {
    state.unlockedUniqueSkills.push(skillTag);
  }
  addLog(`繝ｦ繝九・繧ｯ謦・ｴ: ${enemy.name} / 霑ｽ蜉蝣ｱ驟ｬ EXP+${uniqueBonusExp}, GOLD+${uniqueBonusGold}`);
  checkTitleUnlocks("afterUniqueKill");
}

function handleDefeat() {
  const stage = STAGE_DATA[state.battle.stageId];
  if (stage?.isFieldBossStage) {
    recordBossFirstTryResult(stage.id, false);
  }

  state.stats.totalDeaths += 1;
  state.stats.currentWinStreak = 0;
  state.titleRuntime.reviveBuffPending = true;
  state.battle.isActive = false;
  state.battle.status = "謨怜圏";
  state.battle.enemy = null;
  state.player.hp = state.player.maxHp;
  state.player.mp = state.player.maxMp;
  addLog("謨怜圏縲ら伴縺ｸ蟶ｰ驍・・);
  checkTitleUnlocks("afterDefeat");
  checkTitleUnlocks("afterBattle");
  stopBattleLoop();
  render();
}

function gainRewards(enemy) {
  const speedExpBonus = getSpeedModeExpBonus();
  const expGain = Math.floor(enemy.exp * (1 + state.titleEffects.expMultiplier + speedExpBonus));
  const goldGain = Math.floor(enemy.gold * (1 + state.titleEffects.goldMultiplier));
  state.player.exp += expGain;
  state.player.gold += goldGain;
  state.stats.totalGoldEarned += goldGain;
  state.stats.totalGoldLifetime += goldGain;
  addLog(`EXP迯ｲ蠕・ +${expGain}`);
  addLog(`GOLD迯ｲ蠕・ +${goldGain}`);

  if (Math.random() < 0.35) {
    state.player.gold += 1;
    state.stats.totalGoldEarned += 1;
    state.stats.totalGoldLifetime += 1;
    state.stats.oneGoldPickupCount += 1;
    addLog("1G繧呈鏡縺｣縺溘・);
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
    addLog(`邏譚仙・謇・ ${ITEM_DATA[drop.itemId]?.name || drop.itemId}`);
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
    addLog(`繝ｬ繝吶Ν繧｢繝・・: Lv.${state.player.level}`);
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
  addLog("繧ｵ繝悶ず繝ｧ繝冶ｧ｣謾ｾ・∫･樊ｮｿ縺ｧ驕ｸ謚槭〒縺阪∪縺吶・);
  showBattleSpecialPopup("繧ｵ繝悶ず繝ｧ繝冶ｧ｣謾ｾ");
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
  speed_ritualist: () => state.stats.highestBattleSpeedUnlocked >= 4 && state.stats.speedModeSeconds >= 300
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
  addLog(`遘ｰ蜿ｷ蜿門ｾ・ ${title.name}`);
  showTitleUnlockPopup(title);
}

function toggleTitle(titleId) {
  if (!state.unlockedTitles.includes(titleId)) {
    addLog("譛ｪ蜿門ｾ礼ｧｰ蜿ｷ縺ｯ陬・ｙ縺ｧ縺阪∪縺帙ｓ縲・);
    return;
  }
  const title = getTitleById(titleId);
  const idx = state.activeTitles.indexOf(titleId);
  if (idx >= 0) {
    state.activeTitles.splice(idx, 1);
    state.stats.titleToggleCount += 1;
    addLog(`遘ｰ蜿ｷOFF: ${title.name}`);
    recalculateTitleEffects();
    checkTitleUnlocks("afterToggleTitle");
    render();
    return;
  }
  if (state.activeTitles.length >= getCurrentTitleLimit()) {
    addLog("縺薙ｌ莉･荳翫そ繝・ヨ縺ｧ縺阪∪縺帙ｓ縲・);
    return;
  }
  state.activeTitles.push(titleId);
  state.stats.titleToggleCount += 1;
  addLog(`遘ｰ蜿ｷON: ${title.name}`);
  recalculateTitleEffects();
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
  addLog(`遘ｰ蜿ｷ陬・ｙ荳企剞縺悟｢怜刈: ${getCurrentTitleLimit()}`);
}

function applyLoopTitleLimitUpgrades() {
  if (state.loop.loopCount >= 1) {
    unlockTitleLimitUpgrade("loop_1_limit");
  }
  if (state.loop.loopCount >= 3) {
    unlockTitleLimitUpgrade("loop_3_limit");
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
  return state.player.equipmentEnhancements[itemId] || 0;
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
    totalWeight: 0
  };
  EQUIPMENT_SLOTS.forEach((slot) => {
    const eq = getEquippedItem(slot.id);
    if (!eq) {
      return;
    }
    const enhanceLv = getEnhanceLevel(eq.id);
    const enhanceMul = 1 + enhanceLv * 0.05;
    const craftedMul =
      (eq.specialTags || []).some((tag) => ["crafted_bonus", "god_quality", "alchemy_masterpiece", "smith_masterpiece", "culinary_masterpiece"].includes(tag))
        ? 1 + (state.titleEffects.craftedGearBonus || 0)
        : 1;
    const slotMul = slot.id === "weapon2" ? 0.6 : 1;
    total.attack += (eq.attack || 0) * enhanceMul * craftedMul * slotMul;
    total.defense += (eq.defense || 0) * enhanceMul * craftedMul * slotMul;
    total.speed += (eq.speed || 0) * enhanceMul * craftedMul * slotMul;
    total.intelligence += (eq.intelligence || 0) * enhanceMul * craftedMul * slotMul;
    total.luck += (eq.luck || 0) * enhanceMul * craftedMul * slotMul;
    total.hp += (eq.hp || 0) * enhanceMul * craftedMul * slotMul;
    total.mp += (eq.mp || 0) * enhanceMul * craftedMul * slotMul;
    total.totalWeight += (eq.weight || 0) + enhanceLv * 0.2;
    if ((eq.specialTags || []).includes("speed")) {
      total.evasionBonus += 0.01 * slotMul;
    }
    if ((eq.specialTags || []).includes("lucky")) {
      total.critBonus += 0.01 * slotMul;
    }
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

function applyPlayerDamageBonuses(baseDamage, enemy) {
  let damage = baseDamage;
  const speciesBonus = state.titleEffects.damageToSpecies[enemy.species] || 0;
  if (speciesBonus > 0) {
    damage = Math.floor(damage * (1 + speciesBonus));
  }
  if (enemy.rarity === "fieldBoss") {
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
  state.activeEffects.push({ target, fromSkillId, stat: effectData.stat, multiplier: effectData.multiplier, expiresAt: now + effectData.durationMs });
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
  return Math.max(100, Math.floor(clamp(650, 2000, 1680 - (state.battle.enemy?.speed || 0) * 28) / state.battleSpeedMultiplier));
}

function pickUsableSkill() {
  const skills = getCurrentSkillList();
  if (!skills.length) {
    return null;
  }
  const now = Date.now();
  for (let i = 0; i < skills.length; i += 1) {
    const index = (state.battle.skillRotationIndex + i) % skills.length;
    const skill = skills[index];
    const readyAt = state.skillCooldowns[skill.id] || 0;
    if (state.battle.playerCurrentMp >= skill.mpCost && now >= readyAt) {
      state.battle.skillRotationIndex = (index + 1) % skills.length;
      return skill;
    }
  }
  return null;
}

function getCurrentSkillList() {
  if (!state.player.mainJobId) {
    return [];
  }
  return state.world.skills[state.player.mainJobId] || [];
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
      <h2>謌ｦ髣倡判髱｢</h2>
      <span class="tiny">逕ｺ: ${escapeHtml(TOWN_DATA[state.currentTown].name)} / 繧ｹ繝・・繧ｸ: ${stage.id}</span>
    </div>
    <div class="card battle-top-info ${classes}">
      <p>謌ｦ髣倡憾諷・ <strong>${escapeHtml(state.battle.status)}</strong></p>
      <p>騾ｲ陦・ <strong>${state.battle.stageKillCount} / ${state.battle.stageTargetKills}</strong></p>
      <p class="tiny">逶ｴ霑題｡悟虚: ${escapeHtml(state.battle.recentActionText || "蠕・ｩ滉ｸｭ")}</p>
      <p class="tiny">蛟咲紫: ${state.battleSpeedMultiplier}x</p>
      <p class="tiny">驥埼㍼: ${stats.weightInfo.totalWeight}/${stats.weightInfo.capacity} (${stats.weightInfo.rankLabel}) / TAG: ${(stats.buildTags || []).join(", ") || "縺ｪ縺・}</p>
    </div>
    <div class="battle-grid">
      <section class="card battle-actor player-side">
        <h4>${escapeHtml(state.player.name)} (${escapeHtml(state.player.mainJob || "譛ｪ險ｭ螳・)})</h4>
        <p class="tiny">HP ${Math.floor(state.battle.playerCurrentHp)} / ${Math.floor(stats.maxHp)}</p>
        <div class="bar hp-bar"><div style="width:${toPercent(state.battle.playerCurrentHp, stats.maxHp)}%"></div></div>
        <p class="tiny">MP ${Math.floor(state.battle.playerCurrentMp)} / ${Math.floor(stats.maxMp)}</p>
        <div class="bar mp-bar"><div style="width:${toPercent(state.battle.playerCurrentMp, stats.maxMp)}%"></div></div>
        <p class="tiny">蝗樣∩ ${(stats.evasion * 100).toFixed(1)}% / 莨壼ｿ・${(stats.critRate * 100).toFixed(1)}%</p>
      </section>
      <section class="card battle-actor enemy-side ${classes}">
        <h4>${escapeHtml(enemy ? enemy.name : "謨ｵ謗｢邏｢荳ｭ...")}</h4>
        <p class="tiny">HP ${Math.floor(enemy?.hp || 0)} / ${Math.floor(enemy?.maxHp || 1)}</p>
        <div class="bar enemy-hp-bar"><div style="width:${toPercent(enemy?.hp || 0, enemy?.maxHp || 1)}%"></div></div>
      </section>
    </div>
    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
      ${!state.battle.isActive && state.battle.status === "繧ｹ繝・・繧ｸ繧ｯ繝ｪ繧｢" ? `<button id="next-stage-btn" class="btn btn-primary">谺｡縺ｮ繧ｹ繝・・繧ｸ縺ｸ騾ｲ繧</button>` : ""}
      ${!state.battle.isActive ? `<button id="return-town-btn" class="btn">逕ｺ縺ｸ謌ｻ繧・/button><button id="battle-back-btn" class="btn">繧ｹ繝・・繧ｸ荳隕ｧ縺ｸ</button>` : ""}
    </div>
  `;
}

function renderGuildView(container) {
  const facilityButtons = [["reception", "蜿嶺ｻ・], ["shop", "繧ｷ繝ｧ繝・・"], ["temple", "逾樊ｮｿ"], ["workshop", "蟾･謌ｿ"]]
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
    content = renderWorkshopView();
  }

  container.innerHTML = `
    <div class="main-header"><h2>繧ｮ繝ｫ繝・/h2><span class="tiny">繝ｩ繝ｳ繧ｯ ${state.guild.rank} / GP ${state.guild.points}</span></div>
    <div class="guild-facility-grid">${facilityButtons}</div>
    <div class="card guild-content">${content}</div>
  `;
}

function renderQuestBoard() {
  checkQuestCompletion();
  const cards = state.world.quests
    .map((quest) => {
      const accepted = state.guild.activeQuestIds.includes(quest.id);
      const completed = state.guild.completedQuestIds.includes(quest.id);
      const claimed = state.guild.claimedQuestIds.includes(quest.id);
      return `
        <div class="quest-card">
          <h4>${quest.name}</h4>
          <p class="tiny">${quest.description}</p>
          <p class="tiny">蝣ｱ驟ｬ: ${quest.reward.gold}G / ${quest.reward.guildPoints}GP</p>
          <div class="title-row">
            <span class="tiny">${claimed ? "蜿怜叙貂医∩" : completed ? "驕疲・貂医∩" : accepted ? "蜿玲ｳｨ荳ｭ" : "譛ｪ蜿玲ｳｨ"}</span>
            ${
              claimed
                ? ""
                : completed
                ? `<button class="btn quest-claim-btn" data-quest-id="${quest.id}">蝣ｱ驟ｬ蜿怜叙</button>`
                : accepted
                ? `<button class="btn" disabled>騾ｲ陦御ｸｭ</button>`
                : `<button class="btn quest-accept-btn" data-quest-id="${quest.id}">蜿玲ｳｨ</button>`
            }
          </div>
        </div>
      `;
    })
    .join("");
  return `<h3>蜿嶺ｻ・/h3><p class="tiny">蜿玲ｳｨ荳ｭ: ${state.guild.activeQuestIds.length}/${state.guild.maxActiveQuests}</p><div class="quest-grid">${cards}</div>`;
}

function acceptQuest(questId) {
  if (state.guild.activeQuestIds.includes(questId) || state.guild.claimedQuestIds.includes(questId)) {
    return;
  }
  if (state.guild.activeQuestIds.length >= state.guild.maxActiveQuests) {
    addLog("萓晞ｼ蜿玲ｳｨ螟ｱ謨・ 荳企剞縺ｧ縺吶・);
    return;
  }
  state.guild.activeQuestIds.push(questId);
  addLog(`萓晞ｼ蜿玲ｳｨ: ${getQuestById(questId).name}`);
  render();
}

function claimQuestReward(questId) {
  if (!state.guild.completedQuestIds.includes(questId) || state.guild.claimedQuestIds.includes(questId)) {
    return;
  }
  const quest = getQuestById(questId);
  state.guild.claimedQuestIds.push(questId);
  state.guild.activeQuestIds = state.guild.activeQuestIds.filter((id) => id !== questId);
  const gp = Math.floor(quest.reward.guildPoints * (1 + state.titleEffects.guildPointMultiplier));
  state.player.gold += quest.reward.gold;
  state.guild.points += gp;
  state.stats.guildPointsEarned += gp;
  state.stats.guildQuestCompleted += 1;
  addLog(`萓晞ｼ驕疲・: ${quest.name} / +${quest.reward.gold}G, +${gp}GP`);
  updateGuildRank();
  checkTitleUnlocks("afterQuestClaim");
  render();
}

function checkQuestCompletion() {
  state.guild.activeQuestIds.forEach((questId) => {
    const quest = getQuestById(questId);
    if (!quest) {
      return;
    }
    if (quest.checker() && !state.guild.completedQuestIds.includes(questId)) {
      state.guild.completedQuestIds.push(questId);
      addLog(`萓晞ｼ驕疲・譚｡莉ｶ繧呈ｺ縺溘＠縺・ ${quest.name}`);
    }
  });
}

function renderShopView() {
  const cards = [...new Set(SHOP_ITEM_IDS)].map((itemId) => {
    const item = ITEM_DATA[itemId];
    const own = getInventoryCount(itemId);
    return `
      <div class="shop-card">
        <h4>${item.name}</h4>
        <p class="tiny">${item.description}</p>
        <p class="tiny">蛻・｡・ ${item.category}</p>
        <p class="tiny">雋ｷ蛟､: ${item.buyPrice} / 螢ｲ蛟､: ${Math.floor(getSellPrice(item))} / 謇謖・ ${own}</p>
        <div class="title-row">
          <button class="btn shop-buy-btn" data-item-id="${item.id}">雉ｼ蜈･</button>
          <button class="btn shop-sell-btn" data-item-id="${item.id}" ${own > 0 ? "" : "disabled"}>螢ｲ蜊ｴ</button>
        </div>
      </div>
    `;
  }).join("");
  return `<h3>繧ｷ繝ｧ繝・・</h3><p class="tiny">謇謖・≡: ${state.player.gold}G</p><div class="shop-grid">${cards}</div>`;
}

function buyItem(itemId) {
  const item = ITEM_DATA[itemId];
  if (!item || item.buyPrice <= 0) {
    return;
  }
  if (state.player.gold < item.buyPrice) {
    addLog(`雉ｼ蜈･螟ｱ謨・ ${item.name} 縺ｮ謇謖・≡荳崎ｶｳ縲Ａ);
    return;
  }
  state.player.gold -= item.buyPrice;
  addItem(itemId, 1);
  state.stats.totalShopTrades += 1;
  addLog(`繧ｷ繝ｧ繝・・雉ｼ蜈･: ${item.name} x1`);
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
  addLog(`繧ｷ繝ｧ繝・・螢ｲ蜊ｴ: ${item.name} x1 (+${sell}G)`);
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
  const productionButtons = ["阮ｬ蟶ｫ", "骰帛・蟶ｫ", "隱ｿ逅・ｺｺ"]
    .map((job) => `<button class="btn production-select-btn ${state.player.productionJob === job ? "active" : ""}" data-production-job="${job}">${job}</button>`)
    .join("");
  const subButtons = Object.values(JOB_DATA.main)
    .map((job) => `<button class="btn subjob-select-btn ${state.player.subJobId === job.id ? "active" : ""}" data-sub-job-id="${job.id}" ${state.player.subJobUnlocked ? "" : "disabled"}>${job.name}</button>`)
    .join("");
  return `
    <h3>逾樊ｮｿ</h3>
    <p>繝｡繧､繝ｳ繧ｸ繝ｧ繝・ <strong>${state.player.mainJob || "譛ｪ險ｭ螳・}</strong></p>
    <p>繧ｵ繝悶ず繝ｧ繝・ <strong>${state.player.subJob || (state.player.subJobUnlocked ? "譛ｪ險ｭ螳・ : "譛ｪ隗｣謾ｾ")}</strong></p>
    <p>逕溽肇繧ｸ繝ｧ繝・ <strong>${state.player.productionJob}</strong> / 谿ｵ髫・ <strong>${PRODUCTION_JOB_PATHS[state.player.productionJob].stages[state.player.productionJobStage]}</strong></p>
    <p class="tiny">逕溽肇Lv ${state.player.productionJobLevel} / EXP ${state.player.productionJobExp}</p>
    <div class="guild-facility-grid">${productionButtons}</div>
    <p class="tiny">繧ｵ繝悶ず繝ｧ繝夜∈謚橸ｼ・v100隗｣謾ｾ・・/p>
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
  addLog(`逾樊ｮｿ: 逕溽肇繧ｸ繝ｧ繝悶ｒ ${jobName} 縺ｫ險ｭ螳壹Ａ);
  render();
}

function selectSubJob(jobId) {
  if (!state.player.subJobUnlocked) {
    addLog("繧ｵ繝悶ず繝ｧ繝匁悴隗｣謾ｾ縲・);
    return;
  }
  const job = JOB_DATA.main[jobId];
  if (!job) {
    return;
  }
  state.player.subJobId = job.id;
  state.player.subJob = job.name;
  addLog(`逾樊ｮｿ: 繧ｵ繝悶ず繝ｧ繝悶ｒ ${job.name} 縺ｫ險ｭ螳壹Ａ);
  render();
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
            const lv = state.player.equipmentEnhancements[itemId] || 0;
            const cost = getEnhanceCost(itemId);
            const rate = Math.floor(getEnhanceSuccessRate(itemId) * 100);
            return `<div class="shop-card"><h4>${ITEM_DATA[itemId].name} +${lv}</h4><p class="tiny">雋ｻ逕ｨ: ${cost} / 謌仙粥邇・ ${rate}%</p><button class="btn enhance-btn" data-item-id="${itemId}" ${state.player.gold >= cost ? "" : "disabled"}>蠑ｷ蛹・/button></div>`;
          })
          .join("")
      : "<p class='tiny'>蠑ｷ蛹門ｯｾ雎｡陬・ｙ縺後≠繧翫∪縺帙ｓ縲・/p>";

  return `
    <h3>蟾･謌ｿ</h3>
    <div class="status-tabs">
      <button class="btn workshop-tab-btn ${state.guild.workshopTab === "craft" ? "active" : ""}" data-workshop-tab="craft">逕溽肇</button>
      <button class="btn workshop-tab-btn ${state.guild.workshopTab === "enhance" ? "active" : ""}" data-workshop-tab="enhance">蠑ｷ蛹・/button>
      <button class="btn workshop-tab-btn ${state.guild.workshopTab === "recipes" ? "active" : ""}" data-workshop-tab="recipes">繝ｬ繧ｷ繝比ｸ隕ｧ</button>
      <button class="btn workshop-tab-btn ${state.guild.workshopTab === "jobInfo" ? "active" : ""}" data-workshop-tab="jobInfo">逕溽肇閨ｷ諠・ｱ</button>
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
    <div style="margin-top:10px;"><button id="gather-materials-btn" class="btn">謗｡蜿悶☆繧・/button></div>
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
          return `${ITEM_DATA[m.itemId]?.name || m.itemId} ${owned}/${m.qty}${ok ? "" : " (荳崎ｶｳ)"}`;
        })
        .join(" / ");
      const rates = rollCraftResult(recipe, state.player, true);
      const cost = Math.floor(recipe.goldCost * (1 - state.titleEffects.workshopCostReduction));
      return `
        <div class="shop-card">
          <h4>${recipe.name}</h4>
          <p class="tiny">${recipe.description}</p>
          <p class="tiny">蠢・ｦ∵ｮｵ髫・ ${recipe.requiredStage + 1} / 邏譚・ ${materialText || "縺ｪ縺・} / 蠢・ｦ；: ${cost}</p>
          <p class="tiny">謌仙粥 ${Math.floor(rates.success * 100)}% / 螟ｧ謌仙粥 ${Math.floor(rates.great * 100)}% / 鬮伜刀雉ｪ ${Math.floor(rates.high * 100)}% / 逾槫刀雉ｪ ${Math.floor(rates.god * 100)}%</p>
          ${
            unlocked
              ? `<div class="title-row"><button class="btn craft-btn" data-recipe-id="${recipe.id}">1蝗・/button><button class="btn craft-batch-btn" data-recipe-id="${recipe.id}" data-craft-qty="5">5蝗・/button><button class="btn craft-batch-btn" data-recipe-id="${recipe.id}" data-craft-qty="10">10蝗・/button></div>`
              : "<p class='tiny'>譛ｪ隗｣謾ｾ繝ｬ繧ｷ繝・/p>"
          }
        </div>
      `;
    })
    .join("");
  return `<div class="shop-grid">${cards || "<p class='tiny'>繝ｬ繧ｷ繝斐↑縺・/p>"}</div>`;
}

function renderProductionJobInfo() {
  const path = PRODUCTION_JOB_PATHS[state.player.productionJob];
  const stageName = path.stages[state.player.productionJobStage] || path.stages[0];
  const nextReq = PRODUCTION_STAGE_REQUIREMENTS[Math.min(path.stages.length - 1, state.player.productionJobStage + 1)];
  const currentCrafts = state.player.productionProgress[state.player.productionJob]?.crafts || 0;
  return `
    <div class="card">
      <h4>${state.player.productionJob} (${path.type})</h4>
      <p>谿ｵ髫・ ${stageName} (${state.player.productionJobStage + 1}/${path.stages.length})</p>
      <p>逕溽肇Lv: ${state.player.productionJobLevel} / EXP: ${state.player.productionJobExp} / 谺｡Lv: ${productionExpToNextLevel()}</p>
      <p class="tiny">谺｡騾ｲ蛹匁擅莉ｶ: Lv${nextReq?.level ?? "-"} / 縺薙・閨ｷ縺ｮ逕溽肇${nextReq?.crafts ?? "-"}蝗・/p>
      <p class="tiny">縺薙・閨ｷ縺ｮ邏ｯ險育函逕｣蝗樊焚: ${currentCrafts}</p>
      <p class="tiny">邏ｯ險育函逕｣EXP: ${state.stats.totalCraftExp}</p>
      <p class="tiny">蜩∬ｳｪ邨ｱ險・ 謌仙粥 ${state.stats.craftSuccessCount} / 螟ｱ謨・${state.stats.craftFailureCount} / 螟ｧ謌仙粥 ${state.stats.craftGreatSuccessCount} / 鬮伜刀雉ｪ ${state.stats.craftHighQualityCount} / 逾槫刀雉ｪ ${state.stats.craftGodQualityCount}</p>
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
    addLog("迴ｾ蝨ｨ縺ｮ逕溽肇閨ｷ縺ｧ縺ｯ縺薙・繝ｬ繧ｷ繝斐ｒ菴懈・縺ｧ縺阪∪縺帙ｓ縲・);
    return;
  }
  if (state.player.productionJobStage < recipe.requiredStage) {
    addLog("逕溽肇谿ｵ髫弱′荳崎ｶｳ縺励※縺・∪縺吶・);
    return;
  }
  for (let i = 0; i < quantity; i += 1) {
    const actualCost = Math.floor(recipe.goldCost * (1 - state.titleEffects.workshopCostReduction));
    if (!canCraftRecipe({ ...recipe, costGold: actualCost })) {
      if (i === 0) {
        addLog("逕溽肇螟ｱ謨・ 邏譚舌∪縺溘・G荳崎ｶｳ縲・);
      }
      break;
    }
    state.player.gold -= actualCost;
    recipe.materials.forEach((m) => removeItem(m.itemId, m.qty));
    const result = rollCraftResult(recipe, state.player, false);
    applyCraftQuality(result, recipe);
  }
  checkProductionRelatedTitles();
  render();
}

function craftItem(recipeId) {
  craftRecipe(recipeId, 1);
}

function craftEquipment(itemId) {
  const recipe = RECIPE_DATA.find((r) => r.resultItemId === itemId && r.productionType === "smith");
  if (!recipe) {
    addLog("縺薙・陬・ｙ縺ｯ蟾･謌ｿ縺ｧ菴懈・縺ｧ縺阪∪縺帙ｓ縲・);
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
      addLog("譁咏炊螟ｱ謨・ 辟ｦ縺偵◆譁咏炊縺後〒縺阪◆縲・);
    } else {
      addLog(`逕溽肇螟ｱ謨・ ${recipe.name}`);
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
  addLog(`逕溽肇謌仙粥[${result.quality}]: ${instance.name} x${result.amount}`);
  gainProductionExp(result.expGain);
}

function gainProductionExp(amount) {
  state.player.productionJobExp += amount;
  state.stats.totalCraftExp += amount;
  while (state.player.productionJobExp >= productionExpToNextLevel()) {
    state.player.productionJobExp -= productionExpToNextLevel();
    state.player.productionJobLevel += 1;
    addLog(`逕溽肇Lv繧｢繝・・: ${state.player.productionJobLevel}`);
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
      addLog(`逕溽肇閨ｷ騾ｲ蛹・ ${path.stages[nextStage]}`);
    } else {
      break;
    }
  }
}

function getProductionBonuses(productionType) {
  const stage = state.player.productionJobStage || 0;
  const level = state.player.productionJobLevel || 1;
  const bonus = {
    successRate: stage * 0.015 + Math.floor(level / 20) * 0.01 + state.titleEffects.craftSuccessBonus,
    greatRate: stage * 0.008 + (productionType === "cooking" ? state.titleEffects.cookGreatSuccessRateBonus : 0),
    highRate: stage * 0.01,
    godRate: stage >= 3 ? 0.002 + stage * 0.001 : 0
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
  addLog(`謗｡蜿・ ${ITEM_DATA[pick.itemId]?.name || pick.itemId} 繧貞・謇九Ａ);
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
  const cost = getEnhanceCost(itemId);
  if (state.player.gold < cost) {
    addLog("蠑ｷ蛹門､ｱ謨・ G荳崎ｶｳ縲・);
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
    state.stats.enhanceSuccessCount += 1;
    addLog(`蠑ｷ蛹匁・蜉・ ${ITEM_DATA[itemId].name} +${state.player.equipmentEnhancements[itemId]}`);
  } else {
    addLog(`蠑ｷ蛹門､ｱ謨・ ${ITEM_DATA[itemId].name} 縺ｯ謐ｮ縺育ｽｮ縺港);
  }
  if (isSmith) {
    gainProductionExp(6);
  }
  checkProductionRelatedTitles();
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
  const lv = state.player.equipmentEnhancements[itemId] || 0;
  const base = 20 + lv * 15;
  return Math.max(1, Math.floor(base * (1 - state.titleEffects.enhanceCostReduction - state.titleEffects.workshopCostReduction)));
}

function getEnhanceSuccessRate(itemId) {
  const lv = state.player.equipmentEnhancements[itemId] || 0;
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
    addLog(`繧ｮ繝ｫ繝峨Λ繝ｳ繧ｯ繧｢繝・・: ${old} -> ${current}`);
  }
}

function renderBoardView(container) {
  updateBoardThreadsFromProgress();
  updateBoardThreadsFromTitles();
  const listHtml = state.board.threads
    .map((thread) => {
      const openedCount = state.stats.threadOpenedCounts[thread.id] || 0;
      return `<button class="btn board-thread-btn ${state.board.selectedThreadId === thread.id ? "active" : ""}" data-thread-id="${thread.id}">${thread.title}<span class="tiny">髢ｲ隕ｧ ${openedCount}</span></button>`;
    })
    .join("");

  const selected = state.board.threads.find((t) => t.id === state.board.selectedThreadId);
  container.innerHTML = `
    <div class="main-header">
      <h2>謗ｲ遉ｺ譚ｿ</h2>
      <span class="tiny">髢ｲ隕ｧ蝗樊焚: ${state.stats.boardViewedCount}</span>
    </div>
    <div class="board-layout">
      <div class="board-thread-list">${listHtml}</div>
      <div class="card board-thread-view">
        ${
          selected
            ? `<h4>${escapeHtml(selected.title)}</h4><p class="tiny">${escapeHtml(selected.body)}</p>`
            : `<p class="tiny">繧ｹ繝ｬ繝・ラ繧帝∈謚槭＠縺ｦ縺上□縺輔＞縲・/p>`
        }
      </div>
    </div>
  `;
}

function updateBoardThreadsFromTitles() {
  if (!Array.isArray(state.board.threads)) {
    state.board.threads = [];
  }
  const extraByTitles = [];
  const has = (id) => state.unlockedTitles.includes(id);
  if (has("unfavored_king") || has("low_tier_emperor")) {
    extraByTitles.push({ id: "th_low_tier_clear", title: "荳埼∞閨ｷ繧ｯ繝ｪ繧｢縺励◆繧・▽縺・ｋ・・, body: "譛霑代・繧､繝翫・閨ｷ縺ｮ繧ｯ繝ｪ繧｢蝣ｱ蜻翫′蠅励∴縺ｦ繧九ゅン繝ｫ繝牙・譛画ｱゅ・縲・ });
  }
  if ((state.stats.godQualityCraftCount || 0) > 0) {
    extraByTitles.push({ id: "th_god_quality", title: "逾槫刀雉ｪ縺｣縺ｦ驛ｽ蟶ゆｼ晁ｪｬ縺倥ｃ縺ｪ縺・・・・, body: `逾槫刀雉ｪ蝣ｱ蜻・ ${(state.stats.godQualityCraftCount || 0)} 莉ｶ縲Ａ });
  }
  if ((state.uniqueDefeatedIds || []).length >= 4) {
    extraByTitles.push({ id: "th_unique7", title: "荳・ｽ鍋岼縺ｮ繝ｦ繝九・繧ｯ隕九▽縺九ｉ繧・, body: `迴ｾ蝨ｨ ${(state.uniqueDefeatedIds || []).length}/7縲る・驕・紫邉ｻ遘ｰ蜿ｷ繧定ｩｦ縺帙Ａ });
  }
  if (has("dev_unexpected") || has("unexpected_architect")) {
    extraByTitles.push({ id: "th_unexpected_build", title: "縺昴・陬・ｙ讒区・縲・°蝟ｶ諠ｳ螳壹＠縺ｦ繧具ｼ・, body: "諠ｳ螳壼､悶ち繧ｰ繧堤ｩ阪・縺ｻ縺ｩ螟峨↑蠑ｷ縺輔↓縺ｪ繧九ｉ縺励＞縲・ });
  }
  if ((state.stats.cookingCraftCount || 0) >= 50) {
    extraByTitles.push({ id: "th_cook_only", title: "譁咏炊縺縺代〒繝懊せ蛟偵☆繧・▽蜃ｺ縺ｦ縺阪※闕・, body: "隱ｿ逅・ヰ繝輔→遘ｰ蜿ｷ縺ｮ蝎帙∩蜷医ｏ縺帙′蠑ｷ縺吶℃繧倶ｻｶ縲・ });
  }
  if ((state.stats.highestBattleSpeedUnlocked || 1) >= 5) {
    extraByTitles.push({ id: "th_5x", title: "蛟埼・蛟阪∪縺ｧ陦後▲縺溘ｄ縺､縺・ｋ・・, body: "5x隗｣謾ｾ蠕後・蜻ｨ蝗樣溷ｺｦ縺悟挨繧ｲ繝ｼ繝縲・ });
  }
  if ((state.stats.totalTitleCombosTried || 0) >= 20) {
    extraByTitles.push({ id: "th_title_break", title: "繧ｿ繧､繝医Ν荳縺､縺ｧ繧ｲ繝ｼ繝螟峨ｏ繧翫☆縺弱□繧・, body: "邨ら乢遘ｰ蜿ｷON/OFF縺ｧ謌ｦ豕輔′荳ｸ縺斐→螟峨ｏ繧九・ });
  }
  if ((state.stats.noItemStageClearCount || 0) >= 3 && state.currentMap === "volcano") {
    extraByTitles.push({ id: "th_nosupply_volcano", title: "辟｡陬懃ｵｦ縺ｧ轣ｫ螻ｱ謚懊￠縺溘ｓ縺縺代←", body: "繝舌ヵ邯ｭ謖√→陲ｫ蠑ｾ邂｡逅・〒繧ｮ繝ｪ騾壹ｋ繧峨＠縺・・ });
  }
  const merged = [...state.board.threads];
  extraByTitles.forEach((thread) => {
    if (!merged.some((t) => t.id === thread.id)) {
      merged.push(thread);
    }
  });
  state.board.threads = merged;
}

function generateBoardThreads() {
  return BOARD_BASE_THREADS.map((thread) => ({ ...thread }));
}

function updateBoardThreadsFromProgress() {
  const all = generateBoardThreads();
  const visible = all.filter((thread) => isStageReached(thread.minProgressStage || "1-1"));
  const extra = [];
  if (state.uniqueDefeatedIds.length > 0) {
    extra.push({ id: "th_unique", title: "縺ゅ・繝ｦ繝九・繧ｯ蛟偵＠縺溘ｄ縺､縺・ｋ・・, body: `險惹ｼ仙ｱ蜻翫′蠅励∴縺ｦ繧九ら樟蝨ｨ ${state.uniqueDefeatedIds.length}/7 菴薙Ａ });
  }
  if (state.loop.clearedGame) {
    extra.push({ id: "th_clear", title: "4-10遯∫ｴ蝣ｱ蜻翫せ繝ｬ", body: "迴ｾ谿ｵ髫弱け繝ｪ繧｢閠・′蠅怜刈荳ｭ縲よｬ｡縺ｯ蜻ｨ蝗樊ｺ門ｙ繧峨＠縺・・ });
  }
  state.board.threads = [...visible, ...extra];
  if (!state.board.selectedThreadId || !state.board.threads.some((thread) => thread.id === state.board.selectedThreadId)) {
    state.board.selectedThreadId = state.board.threads[0]?.id || null;
  }
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
  checkTitleUnlocks("afterBoardView");
  render();
}

function renderStatusView(container) {
  const effective = getEffectivePlayerStats();
  const rows = [
    ["蜷榊燕", state.player.name],
    ["繝ｬ繝吶Ν", state.player.level],
    ["邨碁ｨ灘､", `${state.player.exp} / ${expToNextLevel()}`],
    ["謇謖・≡", `${state.player.gold}G`],
    ["繝｡繧､繝ｳ繧ｸ繝ｧ繝・, state.player.mainJob || "譛ｪ險ｭ螳・],
    ["繧ｵ繝悶ず繝ｧ繝・, state.player.subJob || (state.player.subJobUnlocked ? "譛ｪ險ｭ螳・ : "譛ｪ隗｣謾ｾ")],
    ["逕溽肇繧ｸ繝ｧ繝・, `${state.player.productionJob} (${PRODUCTION_JOB_PATHS[state.player.productionJob].stages[state.player.productionJobStage]})`],
    ["逕溽肇Lv", `${state.player.productionJobLevel} / EXP ${state.player.productionJobExp}`],
    ["HP", `${Math.floor(state.player.hp)} / ${Math.floor(effective.maxHp)}`],
    ["MP", `${Math.floor(state.player.mp)} / ${Math.floor(effective.maxMp)}`],
    ["謾ｻ謦・, `${state.player.attack} -> ${Math.floor(effective.attack)}`],
    ["髦ｲ蠕｡", `${state.player.defense} -> ${Math.floor(effective.defense)}`],
    ["騾溷ｺｦ", `${state.player.speed} -> ${Math.floor(effective.speed)}`],
    ["遏･諱ｵ", `${state.player.intelligence} -> ${Math.floor(effective.intelligence)}`],
    ["驕・, `${state.player.luck} -> ${Math.floor(effective.luck)}`],
    ["蛻ｰ驕・, state.stats.highestReachedStage],
    ["繝ｦ繝九・繧ｯ險惹ｼ・, `${state.stats.uniqueKillCount} / 驕ｭ驕・${state.stats.uniqueEncounterCount}`],
    ["迴ｾ蝨ｨ繝ｫ繝ｼ繝・, `${state.loop.loopCount}`],
    ["遘ｰ蜿ｷ陬・ｙ荳企剞", `${getCurrentTitleLimit()}`],
    ["蛟埼滉ｽｿ逕ｨ譎る俣", `${state.stats.speedModeSeconds}s`],
    ["騾夂ｮ励Ν繝ｼ繝・, `${state.loop.persistentStats.totalLoops || 0}`],
    ["騾夂ｮ苓ｨ惹ｼ・, `${state.loop.persistentStats.totalBossKillsLifetime || 0} (繝懊せ)`],
    ["騾夂ｮ励Θ繝九・繧ｯ", `${state.loop.persistentStats.totalUniqueKillsLifetime || 0}`],
    ["騾夂ｮ礼佐蠕宥", `${state.loop.persistentStats.totalGoldEarnedLifetime || 0}`],
    ["迴ｾ蝨ｨ驥埼㍼", `${calculateWeightInfo(effective.attack).totalWeight} / ${calculateWeightInfo(effective.attack).capacity}`],
    ["逕溽肇謌仙粥/螟ｱ謨・, `${state.stats.craftSuccessCount} / ${state.stats.craftFailureCount}`],
    ["鬮伜刀雉ｪ/逾槫刀雉ｪ", `${state.stats.craftHighQualityCount} / ${state.stats.craftGodQualityCount}`],
    ["想定外タグ", `${(state.runtime.exploitTags || []).join(", ") || "なし"}`],
    ["称号コンボ試行", `${state.stats.totalTitleCombosTried}`],
    ["速度解放", `${state.stats.highestBattleSpeedUnlocked}x`]
  ];

  container.innerHTML = `
    <div class="main-header"><h2>繧ｹ繝・・繧ｿ繧ｹ</h2><span class="tiny">騾ｲ陦梧ュ蝣ｱ縺ｨ遘ｰ蜿ｷ</span></div>
    <div class="status-tabs">
      <button class="btn status-subtab-btn ${state.statusSubTab === "profile" ? "active" : ""}" data-status-tab="profile">蝓ｺ譛ｬ諠・ｱ</button>
      <button class="btn status-subtab-btn ${state.statusSubTab === "titles" ? "active" : ""}" data-status-tab="titles">遘ｰ蜿ｷ蝗ｳ髑・/button>
      <button class="btn status-subtab-btn ${state.statusSubTab === "equipment" ? "active" : ""}" data-status-tab="equipment">陬・ｙ</button>
    </div>
    ${
      state.statusSubTab === "profile"
        ? `<div class="info-grid">${rows.map(([label, value]) => `<div class="card"><h4>${escapeHtml(label)}</h4><p>${escapeHtml(value)}</p></div>`).join("")}</div>`
        : state.statusSubTab === "titles"
        ? renderTitleCatalog()
        : renderEquipmentView()
    }
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
      return `
        <div class="shop-card">
          <h4>${eq.name} x${entry.quantity}</h4>
          <p class="tiny">${eq.description}</p>
          <p class="tiny">ATK ${eq.attack} / DEF ${eq.defense} / SPD ${eq.speed} / INT ${eq.intelligence} / LUK ${eq.luck} / HP ${eq.hp} / MP ${eq.mp}</p>
          <p class="tiny">驥埼㍼ ${eq.weight} / 繝ｬ繧｢ ${eq.rarity}</p>
          <p class="tiny">${preview}</p>
          <div class="title-row">
            <button class="btn equip-item-btn" data-equip-item-id="${eq.id}" data-equip-slot-id="${selectedSlot.id}" ${canEquip ? "" : "disabled"}>陬・ｙ</button>
            <button class="btn equip-preview-btn" data-preview-item-id="${eq.id}" data-preview-slot-id="${selectedSlot.id}">豈碑ｼ・/button>
          </div>
        </div>
      `;
    })
    .join("");

  const slotCards = EQUIPMENT_SLOTS.map((slot) => {
    const item = getEquippedItem(slot.id);
    const lv = item ? getEnhanceLevel(item.id) : 0;
    return `
      <div class="card ${state.ui.selectedEquipmentSlotId === slot.id ? "active-title" : ""}">
        <h4>${slot.label}</h4>
        <p class="tiny">${item ? `${item.name} +${lv}` : "譛ｪ陬・ｙ"}</p>
        <div class="title-row">
          <button class="btn equipment-slot-btn" data-slot-id="${slot.id}">蛟呵｣懆｡ｨ遉ｺ</button>
          <button class="btn unequip-btn" data-slot-id="${slot.id}" ${item ? "" : "disabled"}>隗｣髯､</button>
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="card" style="margin-bottom:10px;">
      <p>邱城㍾驥・/ 險ｱ螳ｹ驥埼㍼: <strong>${weightInfo.totalWeight} / ${weightInfo.capacity}</strong> (雜・℃ ${weightInfo.overBy})</p>
      <p class="tiny">驥埼㍼繝ｩ繝ｳ繧ｯ: ${weightInfo.rankLabel} / 陬・ｙ譫: ${weightInfo.slotsFilled}/6</p>
      <p class="tiny">驥埼㍼陬懈ｭ｣: ATK ${Math.floor(weightInfo.baseModifiers.attackMultiplier * 100)}% / DEF ${Math.floor(weightInfo.baseModifiers.defenseMultiplier * 100)}% / SPD ${Math.floor(weightInfo.baseModifiers.speedMultiplier * 100)}% / EVA ${Math.floor(weightInfo.baseModifiers.evasionBonus * 100)}%</p>
      <p class="tiny">繝薙Ν繝峨ち繧ｰ: ${(effective.buildTags || []).join(", ") || "縺ｪ縺・}</p>
    </div>
    <div class="info-grid">${slotCards}</div>
    <div class="card" style="margin-top:10px;">
      <h4>陬・ｙ蛟呵｣・(${selectedSlot.label})</h4>
      <div class="shop-grid">${candidateList || "<p class='tiny'>蛟呵｣懊↑縺・/p>"}</div>
    </div>
  `;
}

function renderEquipmentComparison(itemId, slotId) {
  const item = EQUIPMENT_DATA[itemId];
  const current = getEquippedItem(slotId);
  if (!item) {
    return "";
  }
  const keys = ["attack", "defense", "speed", "intelligence", "luck", "hp", "mp", "weight"];
  const diffText = keys
    .map((key) => {
      const a = item[key] || 0;
      const b = current?.[key] || 0;
      const diff = a - b;
      if (diff === 0) {
        return null;
      }
      return `${key.toUpperCase()} ${diff > 0 ? "+" : ""}${diff}`;
    })
    .filter(Boolean)
    .join(" / ");
  return diffText || "蟾ｮ蛻・↑縺・;
}

function equipItem(itemId, slotId) {
  const slot = EQUIPMENT_SLOTS.find((s) => s.id === slotId);
  const item = EQUIPMENT_DATA[itemId];
  if (!slot || !item || slot.category !== item.category) {
    addLog("陬・ｙ螟ｱ謨・ 繧ｹ繝ｭ繝・ヨ縺ｨ陬・ｙ繧ｫ繝・ざ繝ｪ縺御ｸ閾ｴ縺励∪縺帙ｓ縲・);
    return;
  }
  const own = getInventoryCount(itemId);
  const equippedCount = getEquippedCountByItem(itemId);
  if (own <= equippedCount) {
    addLog("陬・ｙ螟ｱ謨・ 謇謖∵焚縺御ｸ崎ｶｳ縺励※縺・∪縺吶・);
    return;
  }
  state.player.equipmentSlots[slotId] = itemId;
  state.player.equippedWeaponId = state.player.equipmentSlots.weapon1 || null;
  state.player.equippedArmorId = state.player.equipmentSlots.armor1 || null;
  state.player.equippedHeadId = state.player.equipmentSlots.armor2 || null;
  state.stats.totalEquipChanges += 1;
  state.stats.equipmentSlotUsageCounts[slotId] = (state.stats.equipmentSlotUsageCounts[slotId] || 0) + 1;
  state.ui.selectedEquipmentSlotId = slotId;
  addLog(`陬・ｙ螟画峩: ${slot.label} 縺ｫ ${item.name} 繧定｣・ｙ縲Ａ);
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
  addLog(`陬・ｙ隗｣髯､: ${slot.label} (${item?.name || "陬・ｙ"})`);
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
          ? `<button class="btn use-item-btn" data-item-id="${slot.itemId}" ${slot.quantity <= 0 ? "disabled" : ""}>菴ｿ縺・/button>`
          : "";
      return `<div class="card"><h4>${item?.name || slot.itemId} x${slot.quantity}</h4><p class="tiny">${item?.category || "unknown"}${equipped > 0 ? ` / 陬・ｙ荳ｭ ${equipped}` : ""}</p>${actionBtn}</div>`;
    })
    .join("");
  container.innerHTML = `
    <div class="main-header"><h2>繧｢繧､繝・Β</h2><span class="tiny">繧､繝ｳ繝吶Φ繝医Μ</span></div>
    <div class="inventory-grid">${cards || "<div class='card'><p>繧､繝ｳ繝吶Φ繝医Μ縺ｯ遨ｺ縺ｧ縺吶・/p></div>"}</div>
  `;
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
    const heal = Math.max(12, Math.floor(maxHp * 0.18 * qualityMul));
    if (state.battle.isActive) state.battle.playerCurrentHp = Math.min(maxHp, state.battle.playerCurrentHp + heal);
    state.player.hp = Math.min(maxHp, state.player.hp + heal);
    addLog(`繧｢繧､繝・Β菴ｿ逕ｨ: 繝昴・繧ｷ繝ｧ繝ｳ縺ｧHP+${heal}`);
    used = true;
  } else if (baseId === "hiPotion") {
    const heal = Math.max(24, Math.floor(maxHp * 0.32 * qualityMul));
    if (state.battle.isActive) state.battle.playerCurrentHp = Math.min(maxHp, state.battle.playerCurrentHp + heal);
    state.player.hp = Math.min(maxHp, state.player.hp + heal);
    addLog(`繧｢繧､繝・Β菴ｿ逕ｨ: 繝上う繝昴・繧ｷ繝ｧ繝ｳ縺ｧHP+${heal}`);
    used = true;
  } else if (baseId === "ether") {
    const mp = Math.max(10, Math.floor(maxMp * 0.25 * qualityMul));
    if (state.battle.isActive) state.battle.playerCurrentMp = Math.min(maxMp, state.battle.playerCurrentMp + mp);
    state.player.mp = Math.min(maxMp, state.player.mp + mp);
    addLog(`繧｢繧､繝・Β菴ｿ逕ｨ: 繧ｨ繝ｼ繝・Ν縺ｧMP+${mp}`);
    used = true;
  } else if (baseId === "attackTonic") {
    applyEffect("player", `item_${baseId}`, { stat: "attack", multiplier: 1 + 0.12 * qualityMul, durationMs: Math.floor(70000 * qualityMul) });
    addLog("繧｢繧､繝・Β菴ｿ逕ｨ: 謾ｻ謦・ヰ繝戊脈縺ｧ謾ｻ謦・鴨荳頑・");
    used = true;
  } else if (baseId === "defenseTonic") {
    applyEffect("player", `item_${baseId}`, { stat: "defense", multiplier: 1 + 0.12 * qualityMul, durationMs: Math.floor(70000 * qualityMul) });
    addLog("繧｢繧､繝・Β菴ｿ逕ｨ: 髦ｲ蠕｡繝舌ヵ阮ｬ縺ｧ髦ｲ蠕｡蜉帑ｸ頑・");
    used = true;
  } else if (baseId === "speedTonic") {
    applyEffect("player", `item_${baseId}`, { stat: "speed", multiplier: 1 + 0.12 * qualityMul, durationMs: Math.floor(70000 * qualityMul) });
    addLog("繧｢繧､繝・Β菴ｿ逕ｨ: 騾溷ｺｦ阮ｬ縺ｧ騾溷ｺｦ荳頑・");
    used = true;
  } else if (baseId === "grilledMeat") {
    applyEffect("player", `food_${baseId}`, { stat: "attack", multiplier: 1 + 0.1 * qualityMul, durationMs: Math.floor(90000 * qualityMul * (1 + state.titleEffects.cookingDurationBonus)) });
    addLog("譁咏炊蜉ｹ譫・ 辟ｼ縺崎ｉ縺ｧ謾ｻ謦・鴨荳頑・");
    used = true;
  } else if (baseId === "vegeSoup") {
    applyEffect("player", `food_${baseId}`, { stat: "defense", multiplier: 1 + 0.1 * qualityMul, durationMs: Math.floor(100000 * qualityMul * (1 + state.titleEffects.cookingDurationBonus)) });
    addLog("譁咏炊蜉ｹ譫・ 驥手除繧ｹ繝ｼ繝励〒髦ｲ蠕｡蜉帑ｸ頑・");
    used = true;
  } else if (baseId === "gourmetMeat") {
    applyEffect("player", `food_${baseId}_atk`, { stat: "attack", multiplier: 1 + 0.12 * qualityMul, durationMs: Math.floor(120000 * qualityMul * (1 + state.titleEffects.cookingDurationBonus)) });
    applyEffect("player", `food_${baseId}_spd`, { stat: "speed", multiplier: 1 + 0.12 * qualityMul, durationMs: Math.floor(120000 * qualityMul * (1 + state.titleEffects.cookingDurationBonus)) });
    addLog("譁咏炊蜉ｹ譫・ 雎ｪ闖ｯ閧画侭逅・〒謾ｻ謦・騾溷ｺｦ荳頑・");
    used = true;
  } else if (baseId === "failedDish") {
    addLog("辟ｦ縺偵◆譁咏炊繧帝｣溘∋縺溪ｦ菴輔ｂ襍ｷ縺阪↑縺九▲縺溘・);
    used = true;
  }

  if (!used) {
    addItem(itemId, 1);
    addLog("縺薙・繧｢繧､繝・Β縺ｯ縺ｾ縺菴ｿ逕ｨ縺ｧ縺阪∪縺帙ｓ縲・);
  } else if (state.battle.isActive) {
    state.battle.itemUsedInStage = true;
  }
  render();
}

function handleSecondTick() {
  state.loop.persistentStats.totalPlaytime = (state.loop.persistentStats.totalPlaytime || 0) + 1;
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
  }
}

function bindGameEvents() {
  const timerBtn = document.getElementById("timer-button");
  if (timerBtn) {
    timerBtn.addEventListener("click", handleTimerClick);
  }
  const bgmBtn = document.getElementById("bgm-toggle-btn");
  if (bgmBtn) {
    bgmBtn.addEventListener("click", () => {
      state.settings.bgmOn = !state.settings.bgmOn;
      addLog(`BGM險ｭ螳・ ${state.settings.bgmOn ? "ON" : "OFF"}`);
      render();
    });
  }
  const backBtn = document.getElementById("back-to-title-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      state.stats.returnButtonCount += 1;
      checkTitleUnlocks("afterBack");
      goBackOneView();
    });
  }

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tabId;
      if (!tabId || tabId === state.currentTab) {
        return;
      }
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
      addLog(`繝｡繧､繝ｳ繝｡繝九Η繝ｼ蛻・崛: ${tabLabel(tabId)}`);
      render();
    });
  });

  if (state.currentTab === "adventure") {
    document.querySelectorAll(".town-btn").forEach((btn) => btn.addEventListener("click", () => selectTown(btn.dataset.townId)));
    document.querySelectorAll(".stage-select-btn").forEach((btn) => btn.addEventListener("click", () => selectStage(btn.dataset.stageId)));
    const startBtn = document.getElementById("start-stage-battle-btn");
    if (startBtn) {
      startBtn.addEventListener("click", startStageBattle);
    }
    const nextBtn = document.getElementById("next-stage-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const next = getNextStageId(state.currentStage);
        if (next && isStageUnlocked(next)) {
          selectStage(next);
        } else {
          addLog("谺｡繧ｹ繝・・繧ｸ縺ｯ譛ｪ隗｣謾ｾ縺ｧ縺吶・);
        }
      });
    }
    const returnBtn = document.getElementById("return-town-btn");
    if (returnBtn) {
      returnBtn.addEventListener("click", () => {
        state.stats.returnButtonCount += 1;
        checkTitleUnlocks("afterBack");
        state.battle.status = "蠕・ｩ・;
        state.stats.noRestStageClearStreak = 0;
        render();
      });
    }
    const battleBackBtn = document.getElementById("battle-back-btn");
    if (battleBackBtn) {
      battleBackBtn.addEventListener("click", () => {
        state.stats.returnButtonCount += 1;
        checkTitleUnlocks("afterBack");
        state.battle.status = "蠕・ｩ・;
        render();
      });
    }
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
        addLog(`繧ｮ繝ｫ繝画命險ｭ蛻・崛: ${facility}`);
        render();
      });
    });
    document.querySelectorAll(".quest-accept-btn").forEach((btn) => btn.addEventListener("click", () => acceptQuest(btn.dataset.questId)));
    document.querySelectorAll(".quest-claim-btn").forEach((btn) => btn.addEventListener("click", () => claimQuestReward(btn.dataset.questId)));
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
        addLog(`豈碑ｼ・ ${renderEquipmentComparison(itemId, slotId)}`);
      })
    );
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
    render();
    return;
  }
  state.battleSpeedMultiplier = nextMultiplier;
  addLog(`蛟咲紫蛻・崛: ${old}x -> ${nextMultiplier}x`);
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
  addLog(`譎りｨ医↓隗ｦ繧後◆縲・${state.stats.timerClickCount}蝗・`);
  checkTitleUnlocks("timerClick");
  updateUnlockedBattleSpeeds();
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
  return state.battle.status === "繧ｹ繝・・繧ｸ繧ｯ繝ｪ繧｢" || state.battle.status === "謨怜圏";
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
  checkTitleUnlocks("afterGameClear");
  state.loop.carryOverCandidates = buildCarryOverCandidates();
  state.loop.carryOverLimit = 1 + Math.min(2, Math.floor(state.loop.loopCount / 2));
  state.loop.selectedCarryOverTitleIds = (state.loop.carryOverCandidates.recommended || []).slice(0, state.loop.carryOverLimit);
  recordLoopSummary();
  state.loop.persistentStats = getPersistentStateSnapshot();
}

function checkEndgameTitleConditions() {
  evaluateBuildTags();
  evaluateExploitTags();
  checkUnexpectedBuildConditions();
  ["afterGameClear", "afterFieldBossClear", "afterBattle"].forEach((trigger) => checkTitleUnlocks(trigger));
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
    mainJob: state.player.mainJob || "譛ｪ險ｭ螳・,
    productionJob: state.player.productionJob || "譛ｪ險ｭ螳・,
    firstTryBossWins: state.stats.firstTryBossWins,
    speedModeSeconds: state.stats.speedModeSeconds,
    elapsedSec,
    buildTags: [...state.runtime.buildTags]
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
  state.loop.persistentStats.bestLoopLevel = Math.max(state.loop.persistentStats.bestLoopLevel || 1, state.player.level);
  state.loop.persistentStats.bestLoopClearTime = state.loop.persistentStats.bestLoopClearTime ? Math.min(state.loop.persistentStats.bestLoopClearTime, elapsedSec) : elapsedSec;
  state.loop.persistentStats.maxTitleLimitReached = Math.max(state.loop.persistentStats.maxTitleLimitReached || 1, getCurrentTitleLimit());
}

function getPersistentStateSnapshot() {
  return {
    ...state.loop.persistentStats,
    totalLoops: state.loop.persistentStats.totalLoops || 0,
    maxTitleLimitReached: state.loop.persistentStats.maxTitleLimitReached || getCurrentTitleLimit()
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
  const carry = state.loop.carryOverCandidates;
  const last = state.loop.loopSummaries[state.loop.loopSummaries.length - 1];
  const speedRate =
    last && last.elapsedSec > 0
      ? `${Math.floor((last.speedModeSeconds / Math.max(1, last.elapsedSec)) * 100)}%`
      : "0%";
  app.innerHTML = `
    <section class="screen title-screen">
      <h1 class="game-title">迴ｾ谿ｵ髫弱け繝ｪ繧｢</h1>
      <p class="subtitle">轣ｫ螻ｱ4-10繧堤ｪ∫ｴ縲・蜻ｨ逶ｮ縺ｮ貅門ｙ縺梧紛縺・∪縺励◆縲・/p>
      <div class="panel loop-summary-panel">
        <p>蜻ｨ蝗樊焚: ${state.loop.loopCount}</p>
        <p>譛邨ゅΞ繝吶Ν: ${state.player.level}</p>
        <p>謦・ｴ謨ｰ: ${state.stats.totalKills}</p>
        <p>繝ｦ繝九・繧ｯ險惹ｼ先焚: ${state.stats.uniqueKillCount}</p>
        <p>蜿門ｾ礼ｧｰ蜿ｷ謨ｰ: ${state.unlockedTitles.length}</p>
        <p>菴ｿ逕ｨ繧ｸ繝ｧ繝・ ${state.player.mainJob || "譛ｪ險ｭ螳・} / 逕溽肇: ${state.player.productionJob}</p>
        <p>繝懊せ蛻晁ｦ狗ｪ∫ｴ謨ｰ: ${state.stats.firstTryBossWins}</p>
        <p>蛟埼滉ｽｿ逕ｨ邇・ ${speedRate}</p>
        <p>謖∬ｾｼ蛟呵｣・繝√・繝・: ${(carry.recommended || []).length}</p>
        <p>迴ｾ蝨ｨtitleLimit: ${getCurrentTitleLimit()}</p>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
        <button id="to-carryover-btn" class="btn btn-primary">遘ｰ蜿ｷ蠑輔″邯吶℃驕ｸ謚槭∈</button>
        <button id="back-from-clear-btn" class="btn">蜀帝匱縺ｸ謌ｻ繧・/button>
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
      <h1 class="game-title">遘ｰ蜿ｷ蠑輔″邯吶℃驕ｸ謚・/h1>
      <p class="subtitle">謖√■霎ｼ縺ｿ蜿ｯ閭ｽ謨ｰ: ${state.loop.selectedCarryOverTitleIds.length} / ${state.loop.carryOverLimit}</p>
      <div class="panel carryover-panel">
        <p>繝ｫ繝ｼ繝・ ${state.loop.loopCount} -> ${state.loop.loopCount + 1}</p>
        <p>蠑慕ｶ吝呵｣・ ${(carry.carryable || []).length}莉ｶ (cheat蜆ｪ蜈・</p>
        <p>迴ｾ蝨ｨtitleLimit: ${getCurrentTitleLimit()}</p>
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
        <button id="confirm-carryover-btn" class="btn btn-primary">2蜻ｨ逶ｮ縺ｸ騾ｲ繧</button>
        <button id="back-loop-result-btn" class="btn">繝ｪ繧ｶ繝ｫ繝医∈謌ｻ繧・/button>
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
    addLog("縺薙ｌ莉･荳翫・謖√■霎ｼ繧√∪縺帙ｓ縲・);
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
  updateUnlockedBattleSpeeds();
}

function resetForNewLoop() {
  stopBattleLoop();
  state.loop.clearedGame = false;
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
  state.activeEffects = [];
  state.skillCooldowns = {};
  state.runtime.bossAttemptCounts = {};
  state.runtime.buildTags = [];
  state.runtime.exploitTags = [];
  state.runtime.loopStartedAt = Date.now();
  state.battle = {
    isActive: false,
    stageId: null,
    status: "蠕・ｩ・,
    playerCurrentHp: 0,
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
    critFinishThisBoss: false,
    stageDamageTaken: 0
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
  state.player.productionJob = "阮ｬ蟶ｫ";
  state.player.productionJobLevel = 1;
  state.player.productionJobExp = 0;
  state.player.productionJobStage = 0;
  state.player.productionProgress = {
    阮ｬ蟶ｫ: { level: 1, exp: 0, stage: 0, crafts: 0 },
    骰帛・蟶ｫ: { level: 1, exp: 0, stage: 0, crafts: 0 },
    隱ｿ逅・ｺｺ: { level: 1, exp: 0, stage: 0, crafts: 0 }
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
  }
  state.player.currentTown = TOWN_DATA.balladore.name;
  state.guild.rank = "D";
  state.guild.points = 0;
  state.guild.activeQuestIds = [];
  state.guild.completedQuestIds = [];
  state.guild.claimedQuestIds = [];
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
  state.stats.totalTitleCombosTried = 0;
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
  applyCarryOverSelections();
  state.loop.loopCount += 1;
  resetForNewLoop();
  applyLoopTitleLimitUpgrades();
  recalculateTitleEffects();
  updateUnlockedBattleSpeeds();
  checkTitleUnlocks("afterLoopStart");
  addLog(`蜻ｨ蝗樣幕蟋・ ${state.loop.loopCount}蜻ｨ逶ｮ`);
  state.screen = "game";
  state.currentTab = "adventure";
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
  popup.textContent = `譁ｰ縺溘↑遘ｰ蜿ｷ繧堤佐蠕暦ｼ・{title.name}`;
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
  return state.world.quests.find((quest) => quest.id === questId) || null;
}

function expToNextLevel() {
  return state.player.level * 22;
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

setInterval(handleSecondTick, 1000);

recalculateTitleEffects();
applyLoopTitleLimitUpgrades();
updateUnlockedBattleSpeeds();
updateBoardThreadsFromProgress();
render();

