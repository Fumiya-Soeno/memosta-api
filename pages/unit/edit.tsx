"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Template } from "../../src/app/components/common/Template";
import { fetchApi } from "../helpers/api";
import { joinedCharactersName } from "../helpers/unit";

const EditUnit = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // ✅ URLの `id` を取得
  const [unitData, setUnitData] = useState(null); // ✅ ユニットデータ用の state
  const [unitName, setUnitName] = useState("");

  useEffect(() => {
    if (!id) return; // ✅ `id` が取得できない場合はリクエストを実行しない

    fetchApi(
      `/unit/edit?unitId=${id}`, // ✅ `unitId` をクエリとして渡す
      "GET",
      (result) => {
        console.log("取得データ:", result);
        setUnitData(result.records);

        const joinedName = joinedCharactersName(result.records)[0].name;
        setUnitName(joinedName);
      },
      (error) => {
        console.error("APIエラー:", error);
      }
    );
  }, [id]); // ✅ `id` が変更されたときに再取得

  return (
    <Template>
      <div className="w-full flex flex-col items-center justify-center h-[calc(100vh-60px)]">
        <h1 className="text-2xl font-bold">ユニット編集</h1>
        <p className="text-lg text-gray-600">ID: {id}</p>

        {/* ✅ onChangeを追加して編集可能にする */}
        <input
          type="text"
          className="text-gray-600 border border-gray-300 rounded px-2 py-1"
          value={unitName}
          onChange={(e) => setUnitName(e.target.value)} // 🔥 これを追加
        />

        <div>
          {Array.from({ length: 12 }, (_, index) => (
            <span key={index} className="inline-block text-gray-600">
              ○
            </span>
          ))}
        </div>

        {unitData ? (
          <pre className="bg-gray-100 p-4 rounded text-black">
            {JSON.stringify(unitData, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500">読み込み中...</p>
        )}
      </div>
    </Template>
  );
};

export default EditUnit;
