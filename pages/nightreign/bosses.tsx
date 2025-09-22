"use client";

import React, { useMemo, useState } from "react";

/** 型 */
type Day1 = string;
type Day2 = string;
type Day3 = string;
type Mapping = Record<Day1, Record<Day2, Day3[]>>;

/** Day1×Day2→Day3 */
const DEFAULT_MAPPING: Mapping = {
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
const RAID_EVENT_TO_DAY3: Record<string, Day3[]> = {
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

/** 小物ユーティリティ */
const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));
const allDay1 = Object.keys(DEFAULT_MAPPING).sort();
const getAllDay2 = (mapping: Mapping): Day2[] =>
  uniq(Object.values(mapping).flatMap((m2) => Object.keys(m2 || {}))).sort();

const getDay2Options = (mapping: Mapping, day1?: Day1) => {
  const all2 = getAllDay2(mapping);
  if (!day1) return all2;
  const valids = Object.keys(mapping[day1] || {});
  const invalids = all2.filter((d) => !valids.includes(d));
  return [...valids.sort(), ...invalids.sort()];
};

const getDay3ByDay1 = (mapping: Mapping, day1?: Day1) => {
  if (!day1) return [] as Day3[];
  return uniq(Object.values(mapping[day1] || {}).flat()).sort();
};

const getDay3ByDay1Day2 = (mapping: Mapping, day1?: Day1, day2?: Day2) => {
  if (!day1 || !day2) return [] as Day3[];
  const list = mapping[day1]?.[day2];
  return list ? uniq(list).sort() : (["ナメレス"] as Day3[]);
};

/** プレゼンテーション部品（Tailwind） */
const Card: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="mt-6">
    <h2 className="text-base md:text-lg font-bold mb-2">{title}</h2>
    <div className="p-4 md:p-5 rounded-xl border border-zinc-700 bg-zinc-900/70">
      {children}
    </div>
  </section>
);

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-center gap-3 mb-3">
    <div className="text-zinc-400 text-xs md:text-sm">{label}</div>
    <div>{children}</div>
  </div>
);

const SelectBase: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  className = "",
  ...props
}) => (
  <select
    {...props}
    className={`w-full md:w-[320px] min-h-10 rounded-lg border border-zinc-700 bg-zinc-950 text-white px-3 py-2 outline-none disabled:bg-zinc-900 disabled:text-zinc-500 ${className}`}
  />
);

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-zinc-700 bg-zinc-900 text-white text-sm leading-none m-1">
    {children}
  </span>
);

const Hint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[11.5px] md:text-xs text-zinc-400 mt-2">{children}</p>
);

const ResetButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="min-h-10 px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-white"
  >
    クリア
  </button>
);

/** メイン */
const Bosses: React.FC<{ mapping?: Mapping }> = ({
  mapping = DEFAULT_MAPPING,
}) => {
  const [day1, setDay1] = useState<Day1 | "">("");
  const [day2, setDay2] = useState<Day2 | "">("");
  const [raid, setRaid] = useState<string | "">("");

  const day2Options = useMemo(
    () => getDay2Options(mapping, day1 || undefined),
    [mapping, day1]
  );
  const day3ByDay1 = useMemo(
    () => getDay3ByDay1(mapping, day1 || undefined),
    [mapping, day1]
  );
  const day3ByBoth = useMemo(
    () => getDay3ByDay1Day2(mapping, day1 || undefined, day2 || undefined),
    [mapping, day1, day2]
  );

  const reset = () => {
    setDay1("");
    setDay2("");
    setRaid("");
  };

  const baseCandidates = day2 ? day3ByBoth : day3ByDay1;
  const finalCandidates = useMemo(() => {
    if (!raid) return baseCandidates;
    const set = new Set((RAID_EVENT_TO_DAY3[raid] || []) as Day3[]);
    return baseCandidates.filter((c) => set.has(c));
  }, [baseCandidates, raid]);

  const allRaids = Object.keys(RAID_EVENT_TO_DAY3);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 my-4 md:my-8">
      <h1 className="text-xl md:text-2xl font-extrabold mb-2 leading-tight">
        ナイトレイン: 3日目ボス推定ツール
      </h1>

      <Card title="入力">
        <Row label="1日目ボス">
          <div className="flex flex-col md:flex-row gap-3 md:gap-3 w-full">
            <SelectBase
              value={day1}
              onChange={(e) => {
                setDay1(e.target.value);
                setDay2("");
                setRaid("");
              }}
            >
              <option value="" disabled>
                選択してください
              </option>
              {allDay1.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </SelectBase>
            <div className="md:w-auto w-full">
              <ResetButton onClick={reset} />
            </div>
          </div>
        </Row>

        <Row label="2日目ボス">
          <SelectBase
            disabled={!day1}
            value={day2}
            onChange={(e) => {
              setDay2(e.target.value);
              setRaid("");
            }}
          >
            <option value="" disabled>
              {day1 ? "選択してください" : "1日目を先に選んでね"}
            </option>
            {day2Options.map((d2) => {
              const valid = day1
                ? Boolean((mapping as Mapping)[day1 as Day1]?.[d2])
                : true;
              return (
                <option key={d2} value={d2}>
                  {valid ? d2 : `${d2}（選ぶとナメレス）`}
                </option>
              );
            })}
          </SelectBase>
        </Row>

        <Row label="発生イベント">
          <SelectBase
            disabled={!day1}
            value={raid}
            onChange={(e) => setRaid(e.target.value)}
          >
            <option value="" disabled>
              {day1 ? "（任意）イベントを選択" : "1日目を先に選んでね"}
            </option>
            {allRaids.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </SelectBase>
        </Row>
      </Card>

      <Card title="3日目ボスの候補">
        {!day1 && baseCandidates.length === 0 && (
          <p className="text-zinc-400 text-sm">まず 1日目ボス を選んでね。</p>
        )}

        {day1 && raid && finalCandidates.length === 0 && (
          <p className="text-pink-300 text-sm">
            イベント「{raid}
            」の観測からは該当候補がなかったよ。マッピングや入力を見直してみてね。
          </p>
        )}

        {finalCandidates.length > 0 && (
          <div className="flex flex-wrap -mx-1">
            {finalCandidates.map((name) => (
              <Badge key={name}>{name}</Badge>
            ))}
          </div>
        )}

        <Hint>
          {!day1
            ? ""
            : !day2 && !raid
            ? "※ 1日目のみ確定時点での候補一覧だよ"
            : day1 && day2 && !raid
            ? "※ 1日目+2日目の組み合わせから導かれる候補だよ"
            : "※ 発生イベントでさらに絞り込んだ候補だよ"}
        </Hint>
      </Card>
    </div>
  );
};

export default Bosses;
