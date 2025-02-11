"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Template } from "../../src/app/components/common/Template";
import { fetchApi } from "../helpers/api";
import { joinedCharactersName, charNameColorClasses } from "../helpers/unit";

// ✅ ユニットのデータ型を定義
interface UnitDataType {
  id: number;
  name: string;
  element_name: string;
}

const EditUnit = () => {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id") || ""; // ✅ `null` の可能性を除外
  const [unitData, setUnitData] = useState<UnitDataType[] | null>(null); // ✅ 型を明示
  const [activeChar, setActiveChar] = useState<UnitDataType | null>(null);
  const [unitName, setUnitName] = useState<string>("");

  useEffect(() => {
    if (!id) return;

    fetchApi(
      `/unit/edit?unitId=${id}`,
      "GET",
      (result: { records: UnitDataType[] }) => {
        // ✅ `result` の型を明示
        console.log("取得データ:", result);
        setUnitData(result.records);
        setActiveChar(result.records[0] || null);

        const joinedName = joinedCharactersName(result.records)[0]?.name || "";
        setUnitName(joinedName);
      },
      (error: unknown) => {
        // ✅ `error` の型を `unknown` にして安全に処理
        console.error("APIエラー:", error);
      }
    );
  }, [id]);

  return (
    <Template>
      <div className="w-full flex flex-col items-center justify-center h-[calc(100vh-60px)]">
        <h1 className="text-2xl font-bold">ユニット編集</h1>
        <p className="text-lg text-gray-600">ID: {id}</p>

        {/* ✅ onChange を追加して編集可能にする */}
        <input
          type="text"
          className="text-gray-600 border border-gray-300 rounded px-2 py-1"
          value={unitName}
          onChange={(e) => setUnitName(e.target.value)}
        />

        <div className="m-6">
          {unitData?.map((char: UnitDataType, index: number) => (
            <span
              key={index}
              className={`inline-block cursor-pointer text-5xl ${
                charNameColorClasses[
                  char.element_name as keyof typeof charNameColorClasses
                ] || ""
              }`}
              onClick={() => setActiveChar(char)}
            >
              {char.name}
            </span>
          )) || ""}
        </div>

        {activeChar ? (
          <pre className="bg-gray-100 p-4 rounded text-black">
            {JSON.stringify(activeChar, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500">読み込み中...</p>
        )}
      </div>
    </Template>
  );
};

export default EditUnit;
