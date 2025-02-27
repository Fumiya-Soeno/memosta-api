"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Template } from "../../src/app/components/common/Template";
import { fetchApi } from "../helpers/api";

const NewUnit = () => {
  const [unitName, setUnitName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false); // 追加: ローディング状態
  const router = useRouter();

  const handleCreateUnit = () => {
    // ユニット名のバリデーション
    if (!unitName.trim()) {
      setError("ユニット名を入力してください");
      return;
    }
    if (unitName.length > 12) {
      setError("ユニット名は12文字以内で入力してください");
      return;
    }
    // エラーがなければエラー状態をクリア
    setError("");
    setIsLoading(true); // API コール前に無効化

    fetchApi(
      "/unit/create",
      "POST",
      (result: any) => {
        router.push("/");
      },
      (error: unknown) => {
        setIsLoading(false); // エラー発生時は解除
        console.error("APIエラー:", error);
      },
      { name: unitName } // POST ボディとしてユニット名を送信
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
            disabled={isLoading} // ローディング中は無効化
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
        {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
      </div>
    </Template>
  );
};

export default NewUnit;
