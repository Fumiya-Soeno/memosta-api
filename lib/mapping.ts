// lib/mapping.ts

/** 型 */
export type Day1 = string;
export type Day2 = string;
export type Day3 = string;
export type Mapping = Record<Day1, Record<Day2, Day3[]>>;

/** 小物ユーティリティ */
export const uniq = <T>(arr: T[]) => Array.from(new Set(arr));

/** Day1×Day2→Day3 */
export const DEFAULT_MAPPING: Mapping = {
  "亜人/鈴玉狩り": { 忌み鬼: ["グラディウス"], ツリーガード: ["グラディウス"] },
  王族の幽鬼: {
    "坩堝&黄金カバ": ["リブラ"],
    死儀礼の鳥: ["リブラ"],
    神肌のふたり: ["リブラ"],
    僻地の宿将: ["フルゴール"],
    竜人兵: ["フルゴール"],
    無名の王: ["フルゴール", "ナメレス"],
  },
  接ぎ木の君主: {
    神肌のふたり: ["マリス", "カリゴ"],
    降る星の成獣: ["マリス"],
    ツリーガード: ["マリス", "ナメレス"],
    竜のツリーガード: ["カリゴ"],
    冷たい谷の踊り子: ["カリゴ", "ナメレス"],
  },
  英雄のガーゴイル: {
    "坩堝&黄金カバ": ["エデレ"],
    僻地の宿将: ["エデレ"],
    古竜: ["エデレ"],
    溶鉄デーモン: ["エデレ"],
    ツリーガード: ["マリス"],
    神肌のふたり: ["マリス"],
    降る星の成獣: ["マリス"],
  },
  夜の騎兵: {
    僻地の宿将: ["エデレ", "フルゴール", "ナメレス"],
    古竜: ["エデレ"],
    "坩堝&黄金カバ": ["エデレ"],
    竜人兵: ["フルゴール", "ナメレス"],
    無名の王: ["フルゴール"],
  },
  溶鉄デーモン: {
    竜のツリーガード: ["グノスター", "カリゴ"],
    竜人兵: ["グノスター"],
    大土竜: ["グノスター", "ナメレス"],
    冷たい谷の踊り子: ["カリゴ"],
    神肌のふたり: ["カリゴ", "マリス"],
    ツリーガード: ["マリス"],
    降る星の成獣: ["マリス"],
  },
  戦場の宿将: {
    神肌のふたり: ["リブラ"],
    "坩堝&黄金カバ": ["リブラ", "ナメレス"],
    古竜: ["リブラ"],
    死儀礼の鳥: ["リブラ", "ナメレス"],
    竜のツリーガード: ["グノスター"],
    竜人兵: ["グノスター"],
    大土竜: ["グノスター", "ナメレス"],
  },
  貪食ドラゴン: {
    僻地の宿将: ["エデレ", "フルゴール"],
    "坩堝&黄金カバ": ["エデレ"],
    古竜: ["エデレ", "ナメレス"],
    竜人兵: ["フルゴール"],
    無名の王: ["フルゴール", "ナメレス"],
    ツリーガード: ["マリス"],
    神肌のふたり: ["マリス"],
    降る星の成獣: ["マリス"],
  },
  ミミズ顔: {
    僻地の宿将: ["エデレ", "フルゴール"],
    "坩堝&黄金カバ": ["エデレ"],
    古竜: ["エデレ"],
    竜人兵: ["フルゴール"],
    無名の王: ["フルゴール"],
    ツリーガード: ["マリス"],
    神肌のふたり: ["マリス"],
    降る星の成獣: ["マリス"],
  },
  公のフレイディア: {
    "坩堝&黄金カバ": ["エデレ", "リブラ"],
    僻地の宿将: ["エデレ"],
    竜人兵: ["エデレ"],
    古竜: ["エデレ", "ナメレス"],
    死儀礼の鳥: ["リブラ"],
    竜のツリーガード: ["カリゴ"],
    神肌のふたり: ["カリゴ"],
    冷たい谷の踊り子: ["カリゴ", "ナメレス"],
  },
  ティビアの呼び舟: {
    竜のツリーガード: ["グノスター", "カリゴ"],
    大土竜: ["グノスター"],
    竜人兵: ["グノスター"],
    冷たい谷の踊り子: ["カリゴ"],
    神肌のふたり: ["カリゴ", "リブラ"],
    "坩堝&黄金カバ": ["リブラ"],
    死儀礼の鳥: ["リブラ"],
  },
  百足のデーモン: {
    竜人兵: ["グノスター", "フルゴール"],
    竜のツリーガード: ["グノスター"],
    大土竜: ["グノスター"],
    僻地の宿将: ["フルゴール"],
    無名の王: ["フルゴール", "ナメレス"],
    "坩堝&黄金カバ": ["リブラ"],
    死儀礼の鳥: ["リブラ"],
    神肌のふたり: ["リブラ"],
  },
  爛れた樹霊: {
    竜のツリーガード: ["グノスター", "カリゴ"],
    大土竜: ["グノスター"],
    竜人兵: ["グノスター"],
    冷たい谷の踊り子: ["カリゴ"],
    神肌のふたり: ["カリゴ", "ナメレス"],
  },
};

/** 発生イベント → 発生する出撃（常夜の王含む） */
export const RAID_EVENT_TO_DAY3: Record<string, Day3[]> = {
  歩く霊廟: ["兆し", "カリゴ"],
  隕石: ["三つ首の獣", "エデレ", "カリゴ"],
  狂い火: ["グノスター", "リブラ"],
  古の魔術師塔: ["グノスター", "リブラ"],
  夜の勢力: ["三つ首の獣", "兆し", "フルゴール"],
  新たな夜の脅威: ["エデレ", "フルゴール"],
  忌み鬼: ["グノスター", "エデレ", "ナメレス"],
  巨大な水泡: ["グノスター", "カリゴ", "ナメレス"],
  蟲の大群: ["マリス", "リブラ", "ナメレス"],
  悪魔の呪い: ["フルゴール", "カリゴ", "ナメレス"],
};

/** 集合取得系ユーティリティ */
export const getAllDay1 = () => Object.keys(DEFAULT_MAPPING).sort();

export const getAllDay2 = (mapping: Mapping): Day2[] =>
  uniq(Object.values(mapping).flatMap((m2) => Object.keys(m2 || {}))).sort();

export const getDay2Options = (mapping: Mapping, day1?: Day1) => {
  const all2 = getAllDay2(mapping);
  if (!day1) return all2;
  const valids = Object.keys(mapping[day1] || {});
  const invalids = all2.filter((d) => !valids.includes(d));
  return [...valids.sort(), ...invalids.sort()];
};

export const getDay3ByDay1 = (mapping: Mapping, day1?: Day1) => {
  if (!day1) return [] as Day3[];
  return uniq(Object.values(mapping[day1] || {}).flat()).sort();
};

export const getDay3ByDay1Day2 = (
  mapping: Mapping,
  day1?: Day1,
  day2?: Day2
) => {
  if (!day1 || !day2) return [] as Day3[];
  const list = mapping[day1]?.[day2];
  return list ? uniq(list).sort() : (["ナメレス"] as Day3[]);
};

export type Day12Pair = { day1: Day1; day2: Day2 };
export type ReverseIndex = Record<Day3, Day12Pair[]>;

/** 逆引きインデックス作成: Day3 -> [{day1, day2}] */
export const buildReverseIndex = (mapping: Mapping): ReverseIndex => {
  const idx: ReverseIndex = {};
  for (const [d1, m2] of Object.entries(mapping)) {
    for (const [d2, arr] of Object.entries(m2 || {})) {
      for (const d3 of arr || []) {
        (idx[d3] ||= []).push({ day1: d1, day2: d2 });
      }
    }
  }
  // 重複除去＆安定ソート（見た目のため）
  for (const k of Object.keys(idx)) {
    const seen = new Set<string>();
    idx[k] = idx[k]
      .filter((p) => {
        const key = `${p.day1}__${p.day2}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) =>
        a.day1 === b.day1
          ? a.day2.localeCompare(b.day2)
          : a.day1.localeCompare(b.day1)
      );
  }
  return idx;
};

/** Day3 から Day1 候補だけを取得 */
export const getDay1CandidatesForDay3 = (
  rev: ReverseIndex,
  day3?: Day3
): Day1[] => {
  if (!day3 || !rev[day3]) return [];
  return Array.from(new Set(rev[day3].map((p) => p.day1))).sort();
};

/** Day3 + Day1 から Day2 候補を取得 */
export const getDay2CandidatesForDay3Day1 = (
  rev: ReverseIndex,
  day3?: Day3,
  day1?: Day1
): Day2[] => {
  if (!day3 || !day1 || !rev[day3]) return [];
  return Array.from(
    new Set(rev[day3].filter((p) => p.day1 === day1).map((p) => p.day2))
  ).sort();
};
