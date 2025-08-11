export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export interface KanjiExample {
  word: string;
  reading: string;
  meaning: string;
}

export interface KanjiEntry {
  char: string;
  level: JLPTLevel;
  meanings: string[];
  onyomi: string[];
  kunyomi: string[];
  examples: KanjiExample[];
}

export const JLPT_LEVELS: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];

export const getKanjiStrokeOrderUrl = (kanji: string) => {
  const cp = kanji.codePointAt(0) ?? 0;
  const hex = cp.toString(16).padStart(5, "0");
  return `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
};

export const KANJI_DATA: KanjiEntry[] = [
  // N5
  {
    char: "日",
    level: "N5",
    meanings: ["sun", "day"],
    onyomi: ["ニチ", "ジツ"],
    kunyomi: ["ひ", "-び", "-か"],
    examples: [
      { word: "日本", reading: "にほん", meaning: "Japan" },
      { word: "日曜日", reading: "にちようび", meaning: "Sunday" },
    ],
  },
  {
    char: "本",
    level: "N5",
    meanings: ["book", "origin"],
    onyomi: ["ホン"],
    kunyomi: ["もと"],
    examples: [
      { word: "本", reading: "ほん", meaning: "book" },
      { word: "日本", reading: "にほん", meaning: "Japan" },
    ],
  },
  {
    char: "人",
    level: "N5",
    meanings: ["person"],
    onyomi: ["ジン", "ニン"],
    kunyomi: ["ひと"],
    examples: [
      { word: "人", reading: "ひと", meaning: "person" },
      { word: "日本人", reading: "にほんじん", meaning: "Japanese person" },
    ],
  },
  // N4
  {
    char: "食",
    level: "N4",
    meanings: ["eat", "food"],
    onyomi: ["ショク", "ジキ"],
    kunyomi: ["く.う", "く.らう", "た.べる"],
    examples: [
      { word: "食べる", reading: "たべる", meaning: "to eat" },
      { word: "食事", reading: "しょくじ", meaning: "meal" },
    ],
  },
  {
    char: "飲",
    level: "N4",
    meanings: ["drink"],
    onyomi: ["イン"],
    kunyomi: ["の.む"],
    examples: [
      { word: "飲む", reading: "のむ", meaning: "to drink" },
      { word: "飲料", reading: "いんりょう", meaning: "beverage" },
    ],
  },
  // N3
  {
    char: "速",
    level: "N3",
    meanings: ["fast", "quick"],
    onyomi: ["ソク"],
    kunyomi: ["はや.い", "はや.める"],
    examples: [
      { word: "速度", reading: "そくど", meaning: "speed" },
      { word: "高速", reading: "こうそく", meaning: "high speed" },
    ],
  },
  {
    char: "旅",
    level: "N3",
    meanings: ["travel", "trip"],
    onyomi: ["リョ"],
    kunyomi: ["たび"],
    examples: [
      { word: "旅行", reading: "りょこう", meaning: "travel" },
      { word: "旅館", reading: "りょかん", meaning: "traditional inn" },
    ],
  },
  // N2
  {
    char: "経",
    level: "N2",
    meanings: ["pass through", "experience"],
    onyomi: ["ケイ", "キョウ"],
    kunyomi: ["へ.る"],
    examples: [
      { word: "経験", reading: "けいけん", meaning: "experience" },
      { word: "経済", reading: "けいざい", meaning: "economy" },
    ],
  },
  {
    char: "練",
    level: "N2",
    meanings: ["practice", "train"],
    onyomi: ["レン"],
    kunyomi: ["ね.る"],
    examples: [
      { word: "練習", reading: "れんしゅう", meaning: "practice" },
      { word: "訓練", reading: "くんれん", meaning: "training" },
    ],
  },
  // N1
  {
    char: "企",
    level: "N1",
    meanings: ["plan", "scheme"],
    onyomi: ["キ"],
    kunyomi: ["くわだ.てる"],
    examples: [
      { word: "企業", reading: "きぎょう", meaning: "enterprise" },
      { word: "企画", reading: "きかく", meaning: "planning" },
    ],
  },
  {
    char: "購",
    level: "N1",
    meanings: ["purchase"],
    onyomi: ["コウ"],
    kunyomi: [],
    examples: [
      { word: "購入", reading: "こうにゅう", meaning: "purchase" },
      { word: "購買", reading: "こうばい", meaning: "buying" },
    ],
  },
];
