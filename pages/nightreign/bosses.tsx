"use client";

import React, { useMemo, useState } from "react";
import {
  type Mapping,
  type Day1,
  type Day2,
  type Day3,
  DEFAULT_MAPPING,
  RAID_EVENT_TO_DAY3,
  getAllDay1,
  getDay2Options,
  getDay3ByDay1,
  getDay3ByDay1Day2,
  buildReverseIndex,
  getDay1CandidatesForDay3,
  getDay2CandidatesForDay3Day1,
} from "../../lib/mapping";

/** 逆引きで使う 3日目ボス8体（UI用） */
const DAY3_BOSSES: Day3[] = [
  "グラディウス",
  "エデレ",
  "グノスター",
  "フルゴール",
  "マリス",
  "リブラ",
  "カリゴ",
  "ナメレス",
];

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

/** シンプルなタブ */
const Tabs: React.FC<{
  mode: "forward" | "reverse";
  onChange: (v: "forward" | "reverse") => void;
}> = ({ mode, onChange }) => {
  const base = "px-3 py-2 rounded-lg border text-sm md:text-base transition";
  const active = "bg-zinc-200 text-zinc-900 border-zinc-300";
  const inactive = "bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800";
  return (
    <div className="inline-flex gap-2">
      <button
        className={`${base} ${mode === "forward" ? active : inactive}`}
        onClick={() => onChange("forward")}
      >
        順引き
      </button>
      <button
        className={`${base} ${mode === "reverse" ? active : inactive}`}
        onClick={() => onChange("reverse")}
      >
        逆引き
      </button>
    </div>
  );
};

/** メイン */
const Bosses: React.FC<{ mapping?: Mapping }> = ({
  mapping = DEFAULT_MAPPING,
}) => {
  // ▼ タブ状態
  const [mode, setMode] = useState<"forward" | "reverse">("forward");

  // ▼ 順引き用 state（既存）
  const [day1, setDay1] = useState<Day1 | "">("");
  const [day2, setDay2] = useState<Day2 | "">("");
  const [raid, setRaid] = useState<string | "">("");

  // ▼ 逆引き用 state（追加）
  const [day3Rev, setDay3Rev] = useState<Day3 | "">("");
  const [day1Rev, setDay1Rev] = useState<Day1 | "">("");

  // ▼ 逆引きインデックス（mapping に依存）
  const reverseIndex = useMemo(() => buildReverseIndex(mapping), [mapping]);

  // ▼ 逆引き: Day1/Day2 候補
  const day1RevOptions = useMemo(
    () => getDay1CandidatesForDay3(reverseIndex, day3Rev || undefined),
    [reverseIndex, day3Rev]
  );
  const day2RevOptions = useMemo(
    () =>
      getDay2CandidatesForDay3Day1(
        reverseIndex,
        day3Rev || undefined,
        day1Rev || undefined
      ),
    [reverseIndex, day3Rev, day1Rev]
  );

  // ▼ 逆引き: ペア一覧（Day3のみ、またはDay3+Day1で絞り込み）
  const pairsForView = useMemo(() => {
    if (!day3Rev) return [];
    const base = reverseIndex[day3Rev] || [];
    return day1Rev ? base.filter((p) => p.day1 === day1Rev) : base;
  }, [reverseIndex, day3Rev, day1Rev]);

  // ▼ 順引きの計算（既存）
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

  const resetForward = () => {
    setDay1("");
    setDay2("");
    setRaid("");
  };
  const resetReverse = () => {
    setDay3Rev("");
    setDay1Rev("");
  };

  const baseCandidates = day2 ? day3ByBoth : day3ByDay1;
  const finalCandidates = useMemo(() => {
    if (!raid) return baseCandidates;
    const set = new Set((RAID_EVENT_TO_DAY3[raid] || []) as Day3[]);
    return baseCandidates.filter((c) => set.has(c));
  }, [baseCandidates, raid]);

  const allRaids = Object.keys(RAID_EVENT_TO_DAY3);
  const allDay1 = getAllDay1();

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 my-4 md:my-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-extrabold mb-2 leading-tight">
          ナイトレイン: 3日目ボス推定ツール
        </h1>
        <Tabs mode={mode} onChange={setMode} />
      </div>

      {/* ===== 順引きタブ（既存） ===== */}
      {mode === "forward" && (
        <>
          <Card title="入力（順引き）">
            <Row label="1日目ボス">
              <div className="flex flex-col md:flex-row gap-3 md:gap-3 w-full">
                <SelectBase
                  value={day1}
                  onChange={(e) => {
                    const v = e.target.value as Day1 | "";
                    setDay1(v);
                    // 1日目を未選択に戻したら 2日目/イベントもクリア
                    if (v === "") {
                      setDay2("");
                      setRaid("");
                    } else {
                      setDay2("");
                      setRaid("");
                    }
                  }}
                >
                  <option value="">
                    {day1 ? "（未選択に戻す）" : "選択してください"}
                  </option>
                  {allDay1.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </SelectBase>
                <div className="md:w-auto w-full">
                  <ResetButton onClick={resetForward} />
                </div>
              </div>
            </Row>

            <Row label="2日目ボス">
              <SelectBase
                disabled={!day1}
                value={day2}
                onChange={(e) => {
                  const v = e.target.value as Day2 | "";
                  setDay2(v);
                  // 2日目を未選択に戻しても raid は維持（要件的に自然）
                  setRaid("");
                }}
              >
                <option value="">
                  {day1 ? "（未選択に戻す）" : "1日目を先に選んでね"}
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
                <option value="">
                  {day1 ? "（未選択に戻す）" : "1日目を先に選んでね"}
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
              <p className="text-zinc-400 text-sm">
                まず 1日目ボス を選んでね。
              </p>
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
        </>
      )}

      {/* ===== 逆引きタブ（実装） ===== */}
      {mode === "reverse" && (
        <>
          <Card title="入力（逆引き）">
            <Row label="3日目ボス">
              <div className="flex flex-col md:flex-row gap-3 md:gap-3 w-full">
                <SelectBase
                  value={day3Rev}
                  onChange={(e) => {
                    const v = e.target.value as Day3 | "";
                    setDay3Rev(v);
                    // 3日目変更時は Day1 絞り込みをリセット
                    setDay1Rev("");
                  }}
                >
                  <option value="">
                    {day3Rev ? "（未選択に戻す）" : "選択してください"}
                  </option>
                  {DAY3_BOSSES.map((d3) => (
                    <option key={d3} value={d3}>
                      {d3}
                    </option>
                  ))}
                </SelectBase>
                <div className="md:w-auto w-full">
                  <ResetButton onClick={resetReverse} />
                </div>
              </div>
            </Row>

            <Row label="1日目ボス（任意で絞り込み）">
              <SelectBase
                disabled={!day3Rev}
                value={day1Rev}
                onChange={(e) => setDay1Rev(e.target.value as Day1 | "")}
              >
                <option value="">
                  {day3Rev ? "（未選択に戻す）" : "3日目を先に選んでね"}
                </option>
                {day1RevOptions.map((d1) => (
                  <option key={d1} value={d1}>
                    {d1}
                  </option>
                ))}
              </SelectBase>
            </Row>
          </Card>

          <Card title="候補（逆引き結果）">
            {!day3Rev && (
              <p className="text-zinc-400 text-sm">
                3日目ボスを選ぶと、1・2日目の候補が出るよ。
              </p>
            )}

            {day3Rev && (
              <>
                {/* Day1 候補 */}
                <div className="mb-4">
                  <div className="text-zinc-400 text-xs md:text-sm mb-1">
                    Day1 候補
                  </div>
                  {day1RevOptions.length ? (
                    <div className="flex flex-wrap -mx-1">
                      {day1RevOptions.map((d1) => (
                        <Badge key={d1}>{d1}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-400 text-sm">なし</p>
                  )}
                </div>

                {/* Day2 候補（Day1で絞った場合のみ表示） */}
                {day1Rev && (
                  <div className="mb-4">
                    <div className="text-zinc-400 text-xs md:text-sm mb-1">
                      Day2 候補（Day1: {day1Rev}）
                    </div>
                    {day2RevOptions.length ? (
                      <div className="flex flex-wrap -mx-1">
                        {day2RevOptions.map((d2) => (
                          <Badge key={d2}>{d2}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-400 text-sm">なし</p>
                    )}
                  </div>
                )}

                {/* ペア一覧 */}
                <div className="mt-2">
                  <div className="text-zinc-400 text-xs md:text-sm mb-1">
                    Day1 × Day2 の組み合わせ
                    {day1Rev ? `（Day1: ${day1Rev} で絞り込み）` : ""}
                  </div>
                  {pairsForView.length ? (
                    <ul className="text-sm leading-6">
                      {pairsForView.map((p, i) => (
                        <li key={`${p.day1}__${p.day2}__${i}`}>
                          ・{p.day1} → {p.day2}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-zinc-400 text-sm">該当なし</p>
                  )}
                </div>

                <Hint>
                  3日目「{day3Rev}」に到達し得る Day1/Day2 を表示してるよ。 Day1
                  を選ぶと Day2 が絞れるよ。
                </Hint>
              </>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default Bosses;
