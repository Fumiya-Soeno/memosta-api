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
} from "../../lib/mapping";

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
  const allDay1 = getAllDay1();

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
              <option value="">{day1 ? "選択" : "選択してください"}</option>
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
              const v = e.target.value as Day2 | "";
              setDay2(v);
              // 2日目を未選択に戻しても raid は維持（要件的に自然）
              setRaid("");
            }}
          >
            <option value="">
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
            <option value="">
              {day1 ? "選択してください" : "1日目を先に選んでね"}
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
