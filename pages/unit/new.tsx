"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Template } from "../../src/app/components/common/Template";
import { fetchApi } from "../../helpers/api";
import { setActiveUnitIdClient } from "../../helpers/activeUnitHelper";

async function getWordMultiplier(unitName: string): Promise<number> {
  const url = `https://ja.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(
    unitName
  )}`;
  const response = await fetch(url);
  const data = await response.json();
  const hitCount = data.query.searchinfo.totalhits;

  // 上限・下限でクランプ（制限）
  if (hitCount <= 0) {
    return 1.0;
  } else if (hitCount >= 200000) {
    return 2.0;
  }

  // 対数スケールで計算
  // --- 例：自然対数 ---
  const ratio = Math.log(hitCount + 1) / Math.log(200000 + 1);
  // --- 例：常用対数(10)を使う場合 ---
  // const ratio = Math.log10(hitCount + 1) / Math.log10(200000 + 1);

  const multiplier = 1.0 + ratio; // 1.0 〜 2.0 の範囲
  return multiplier;
}

const NewUnit = () => {
  const [unitName, setUnitName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleCreateUnit = async () => {
    // ユニット名のバリデーション
    if (!unitName.trim()) {
      setError("ユニット名を入力してください");
      return;
    }
    if (unitName.length > 12) {
      setError("ユニット名は12文字以内で入力してください");
      return;
    }
    // 絵文字が含まれているかチェック (Extended Pictographic は多くの絵文字をカバー)
    const emojiRegex = /\p{Extended_Pictographic}/u;
    if (emojiRegex.test(unitName)) {
      setError("絵文字は入力できません");
      return;
    }

    // エラーがなければエラー状態をクリア
    setError("");

    console.log(await getWordMultiplier(unitName));

    return;
    fetchApi(
      "/unit/create",
      "POST",
      async (result: any) => {
        setActiveUnitIdClient(result.unitId);
        router.push(`/?id=${result.unitId10th}`);
      },
      (error: unknown) => {
        setIsLoading(false);
        console.error("APIエラー:", error);
      },
      { name: unitName }
    );
  };

  return (
    <Template>
      <div className="w-full flex flex-col items-center justify-center h-[calc(100vh-60px)]">
        <h1 className="text-2xl font-bold mb-4">ユニット登録</h1>
        <div className="flex items-center">
          <input
            type="text"
            className="text-gray-600 border border-gray-300 rounded px-2 py-1"
            placeholder="ユニット名を入力"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
          />
          <button
            onClick={handleCreateUnit}
            disabled={isLoading}
            className={`ml-2 px-4 py-1 rounded ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            登録
          </button>
        </div>
        <div className="mt-3 text-center">
          <p className="text-sm">
            ↑適当に文字列を入れて登録してみよう！
            <br />
            (12文字以内)
          </p>
          {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
          <br />
          <p>▪️ゲーム説明▪️</p>
          <p className="text-xs text-left mt-1">
            色んな文字を戦わせることができるゲーム。
            <br />
            自分のお気に入りの単語を登録してみよう！
            <br />
            勝率が高いと全国ランキングに乗るぞ！！
            <br />
            自分の最強ユニットをランクインさせよう！
          </p>
        </div>
      </div>
    </Template>
  );
};

export default NewUnit;
