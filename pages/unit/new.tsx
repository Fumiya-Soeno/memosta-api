"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Template } from "../../src/app/components/common/Template";
import { fetchApi } from "../../helpers/api";
import { setActiveUnitIdClient } from "../../helpers/activeUnitHelper";
import { bannedRegex } from "../../helpers/bannedRegex";

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
    setIsLoading(true);

    // 禁止ワードのチェック（例：暴力、差別、下品など）
    if (bannedRegex.test(unitName)) {
      setError("暴力や差別、下品なワードは使用できません");
      return;
    }

    // エラーがなければエラー状態をクリア
    setError("");

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
