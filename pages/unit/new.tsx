"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Template } from "../../src/app/components/common/Template";
import { fetchApi } from "../../helpers/api";
import { setActiveUnitIdClient } from "../../helpers/activeUnitHelper";

// 登録中のオーバーレイコンポーネント
const LoadingOverlay = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-70 z-10">
    <svg
      className="animate-spin h-10 w-10 text-blue-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      ></path>
    </svg>
    <p className="mt-4 text-lg text-blue-500">登録中...</p>
  </div>
);

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

    // Perspective API のチェック（サーバーサイドの API 経由）
    try {
      const response = await fetch("/api/perspective-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: unitName }),
      });
      const data = await response.json();
      if (data.toxicity && data.toxicity > 0.3) {
        setError(
          `毒性0.3以上の単語は使用不可(毒性: ${data.toxicity.toFixed(2)})`
        );
        return;
      }
    } catch (err) {
      console.error("Perspective API エラー", err);
      setError("システムエラーが発生しました");
      return;
    }

    // エラーがなければエラー状態をクリアし、ローディング開始
    setError("");
    setIsLoading(true);

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
      {/* relative にしてオーバーレイが正しく配置されるように */}
      <div className="relative w-full flex flex-col items-center justify-center h-[calc(100vh-60px)]">
        <h1 className="text-2xl font-bold mb-4">ユニット登録</h1>
        <div className="flex items-center">
          <input
            type="text"
            className="text-gray-600 border border-gray-300 rounded px-2 py-1"
            placeholder="ユニット名を入力"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            disabled={isLoading}
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
          {error && <div className="mt-2 text-red-500 text-xs">{error}</div>}
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
        {isLoading && <LoadingOverlay />}
      </div>
    </Template>
  );
};

export default NewUnit;
