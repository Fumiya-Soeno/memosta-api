"use client";

import React, { useMemo, useState } from "react";

/**
 * ナイトレイン: 1日目/2日目 から 3日目ボス候補を推定するUI
 * -----------------------------------------------------------
 * ✅ 挙動
 *  - 1日目ボスを選ぶ → その時点での 3日目候補 を一覧表示
 *  - 2日目ドロップダウンは 1日目を選ぶまで非活性
 *  - 1日目を選ぶと、2日目の選択肢は「起こり得る候補が先頭に並び、それ以外(ありえないパターン) も選択可」※その場合の3日目は「ナメレス」と判定
 *  - 2日目を選ぶと、3日目候補を更に絞り込み
 *
 * 🗂 データ構造
 *  mapping: Record<Day1, Record<Day2, Day3[]>>
 *  例) mapping["亜人/鈴玉狩り"]["忌み鬼 / ツリーガード"] = ["グラディウス"]
 *
 * 🔧 使い方
 *  - 下の DEFAULT_MAPPING をあなたの表に合わせて更新してください。
 *  - 1日目・2日目・3日目の候補名は完全一致で管理します。
 */

type Day1 = string;
type Day2 = string;
type Day3 = string;

type Mapping = Record<Day1, Record<Day2, Day3[]>>;

// ---- ここをあなたの最新リストで埋めてね！ ------------------------------
// 画像から読み取れた一部のみ例として入れてあるよ。足りない分はどんどん追加OK。
// 重複は自動でユニーク化されるから、遠慮なく配列へ。
const DEFAULT_MAPPING: Mapping = {
  // 亜人 / 鈴玉狩り
  "亜人/鈴玉狩り": {
    忌み鬼: ["グラディウス"],
    ツリーガード: ["グラディウス"],
  },

  // 王族の幽鬼
  王族の幽鬼: {
    "坩堝&黄金カバ": ["リブラ"],
    死儀礼の鳥: ["リブラ"],
    神肌のふたり: ["リブラ"],
    僻地の宿将: ["フルゴール"],
    竜人兵: ["フルゴール"],
    無名の王: ["フルゴール", "ナメレス"],
  },

  // 接ぎ木の君主
  接ぎ木の君主: {
    神肌のふたり: ["マリス", "カリゴ"], // 両パターンあり
    降る星の成獣: ["マリス"],
    ツリーガード: ["マリス", "ナメレス"],
    竜のツリーガード: ["カリゴ"],
    冷たい谷の踊り子: ["カリゴ", "ナメレス"],
  },

  // 英雄のガーゴイル
  英雄のガーゴイル: {
    "坩堝&黄金カバ": ["エデレ"],
    僻地の宿将: ["エデレ"],
    古竜: ["エデレ"],
    溶鉄デーモン: ["エデレ"],
    ツリーガード: ["マリス"],
    神肌のふたり: ["マリス"],
    降る星の成獣: ["マリス"],
  },

  // 夜の騎兵
  夜の騎兵: {
    僻地の宿将: ["エデレ", "フルゴール", "ナメレス"], // 両候補
    古竜: ["エデレ"],
    "坩堝&黄金カバ": ["エデレ"],
    竜人兵: ["フルゴール", "ナメレス"],
    無名の王: ["フルゴール"],
  },

  // 溶鉄デーモン
  溶鉄デーモン: {
    竜のツリーガード: ["グノスター", "カリゴ"],
    竜人兵: ["グノスター"],
    大土竜: ["グノスター", "ナメレス"],
    冷たい谷の踊り子: ["カリゴ"],
    神肌のふたり: ["カリゴ", "マリス"],
    ツリーガード: ["マリス"],
    降る星の成獣: ["マリス"],
  },

  // 戦場の宿将
  戦場の宿将: {
    神肌のふたり: ["リブラ"],
    "坩堝&黄金カバ": ["リブラ", "ナメレス"],
    古竜: ["リブラ"],
    死儀礼の鳥: ["リブラ", "ナメレス"],
    竜のツリーガード: ["グノスター"],
    竜人兵: ["グノスター"],
    大土竜: ["グノスター", "ナメレス"],
  },

  // 貪食ドラゴン
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

  // ミミズ顔
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

  // 公のフレイディア
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

  // ティビアの呼び舟
  ティビアの呼び舟: {
    竜のツリーガード: ["グノスター", "カリゴ"],
    大土竜: ["グノスター"],
    竜人兵: ["グノスター"],
    冷たい谷の踊り子: ["カリゴ"],
    神肌のふたり: ["カリゴ", "リブラ"],
    "坩堝&黄金カバ": ["リブラ"],
    死儀礼の鳥: ["リブラ"],
  },

  // 百足のデーモン
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

  // 爛れた樹霊
  爛れた樹霊: {
    竜のツリーガード: ["グノスター", "カリゴ"],
    大土竜: ["グノスター"],
    竜人兵: ["グノスター"],
    冷たい谷の踊り子: ["カリゴ"],
    神肌のふたり: ["カリゴ", "ナメレス"],
  },
};

// -------------------------------------------------------------------------

const uniq = <T,>(arr: T[]): T[] => Array.from(new Set(arr));

const allDay1 = Object.keys(DEFAULT_MAPPING).sort();

const getAllDay2 = (mapping: Mapping): Day2[] =>
  uniq(Object.values(mapping).flatMap((m2) => Object.keys(m2 || {}))).sort();

const getDay2Options = (mapping: Mapping, day1?: Day1) => {
  const all2 = getAllDay2(mapping);
  if (!day1) return all2; // 1日目未選択なら全候補を提示
  const valids = Object.keys(mapping[day1] || {});
  const invalids = all2.filter((d) => !valids.includes(d));
  // 起こり得る候補を先頭、その後に“選ぶとナメレス”候補
  return [...valids.sort(), ...invalids.sort()];
};

const getDay3ByDay1 = (mapping: Mapping, day1?: Day1) => {
  if (!day1) return [] as Day3[];
  const m2 = mapping[day1] || {};
  const all = Object.values(m2).flat();
  return uniq(all).sort();
};

const getDay3ByDay1Day2 = (mapping: Mapping, day1?: Day1, day2?: Day2) => {
  // day1/day2 が揃っていれば、
  //  1) 正常な組み合わせ → 候補一覧
  //  2) 未定義(ありえない) → 「ナメレス」を返す
  if (!day1 || !day2) return [] as Day3[];
  const list = mapping[day1]?.[day2];
  if (!list) return ["ナメレス"];
  return uniq(list).sort();
};

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 10px",
      fontSize: 14,
      borderRadius: 9999,
      border: "1px solid var(--border, #e5e7eb)",
      background: "var(--bg, #0b0b0c)",
      color: "var(--fg, #fff)",
      margin: 4,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section style={{ marginTop: 24 }}>
    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</h2>
    <div
      style={{
        padding: 16,
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        background: "#0f1115",
      }}
    >
      {children}
    </div>
  </section>
);

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "160px 1fr",
      gap: 12,
      alignItems: "center",
      marginBottom: 12,
    }}
  >
    <div style={{ color: "#9ca3af", fontSize: 13 }}>{label}</div>
    <div>{children}</div>
  </div>
);

const Select: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement> & { width?: number }
> = ({ width = 320, children, ...props }) => (
  <select
    {...props}
    style={{
      width,
      padding: "10px 12px",
      borderRadius: 10,
      border: "1px solid #374151",
      background: props.disabled ? "#111827" : "#0b0b0c",
      color: props.disabled ? "#6b7280" : "#fff",
      outline: "none",
    }}
  >
    {children}
  </select>
);

const Hint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 8 }}>{children}</p>
);

const ResetButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "8px 12px",
      borderRadius: 10,
      border: "1px solid #374151",
      background: "#111827",
      color: "#fff",
      cursor: "pointer",
    }}
  >
    クリア
  </button>
);

const Bosses: React.FC<{ mapping?: Mapping }> = ({
  mapping = DEFAULT_MAPPING,
}) => {
  const [day1, setDay1] = useState<Day1 | "">("");
  const [day2, setDay2] = useState<Day2 | "">("");

  const day2Options = useMemo(
    () => getDay2Options(mapping, day1 || undefined),
    [mapping, day1]
  );

  const day3CandidatesByDay1 = useMemo(
    () => getDay3ByDay1(mapping, day1 || undefined),
    [mapping, day1]
  );

  const day3CandidatesByBoth = useMemo(
    () => getDay3ByDay1Day2(mapping, day1 || undefined, day2 || undefined),
    [mapping, day1, day2]
  );

  const reset = () => {
    setDay1("");
    setDay2("");
  };

  const candidates = day2 ? day3CandidatesByBoth : day3CandidatesByDay1;

  return (
    <div style={{ maxWidth: 880, margin: "32px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
        ナイトレイン: 3日目ボス推定ツール
      </h1>

      <Section title="入力">
        <Row label="1日目ボス">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Select
              value={day1}
              onChange={(e) => {
                setDay1(e.target.value);
                setDay2(""); // 1日目が変わったら2日目はリセット
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
            </Select>
            <ResetButton onClick={reset} />
          </div>
        </Row>

        <Row label="2日目ボス">
          <Select
            disabled={!day1}
            value={day2}
            onChange={(e) => setDay2(e.target.value)}
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
          </Select>
        </Row>
      </Section>

      <Section title="3日目ボスの候補">
        {!day1 && candidates.length === 0 && (
          <p style={{ color: "#9ca3af" }}>まず 1日目ボス を選んでね。</p>
        )}
        {day1 && candidates.length === 0 && (
          <p style={{ color: "#fda4af" }}>
            該当データが見つからないよ。DEFAULT_MAPPING を確認してね。
          </p>
        )}
        {candidates.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {candidates.map((name) => (
              <Badge key={name}>{name}</Badge>
            ))}
          </div>
        )}
        <Hint>
          {day1 && !day2
            ? "※ 1日目のみ確定時点での候補一覧だよ"
            : day1 && day2
            ? "※ 1日目+2日目の組み合わせから導かれる候補だよ"
            : ""}
        </Hint>
      </Section>
    </div>
  );
};

export default Bosses;
