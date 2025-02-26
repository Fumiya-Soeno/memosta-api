"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Template } from "../../src/app/components/common/Template";
import { fetchApi } from "../helpers/api";

const NewUnit = () => {
  const [unitName, setUnitName] = useState<string>("");
  const [error, setError] = useState<string>("");
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

    fetchApi(
      "/unit/create",
      "POST",
      (result: any) => {
        router.push(`/unit/edit?id=${result.unitId}`);
      },
      (error: unknown) => {
        console.error("APIエラー:", error);
      },
      { name: unitName } // POSTボディとしてユニット名を送信
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
            className="ml-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            登録
          </button>
        </div>
        {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
      </div>
    </Template>
  );
};

export default NewUnit;
