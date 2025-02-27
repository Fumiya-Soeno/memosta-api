"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Template } from "../../src/app/components/common/Template";
import { fetchApi } from "../helpers/api";
import { joinedCharactersName, charNameColorClasses } from "../helpers/unit";
import BarIndicator from "../../src/app/components/unit/BarIndicator";
import VectorIndicator from "../../src/app/components/unit/VectorIndicator";
import Icon from "../../src/app/components/unit/Icon";
import { UnitDataType } from "../../src/types/unit";

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
        <h1 className="text-2xl font-bold">ユニット詳細</h1>
        <div className="m-6">
          {unitData?.map((char: UnitDataType, index: number) => (
            <span
              key={index}
              className={`inline-block cursor-pointer text-5xl ${
                char.position === activeChar?.position
                  ? "underline decoration-gray-600 decoration-2"
                  : "opacity-60"
              } ${
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

        <div className="flex mb-4">
          <div>
            <BarIndicator
              label="LIFE"
              value={Number(activeChar?.life) / 10}
              barColor="bg-green-500"
            />
            <BarIndicator
              label="ATK"
              value={Number(activeChar?.attack)}
              barColor="bg-red-500"
            />
            <BarIndicator
              label="SPD"
              value={Number(activeChar?.speed)}
              barColor="bg-blue-500"
            />
          </div>
          <div className="flex ml-4">
            <span>VEC</span>
            <VectorIndicator arrow={activeChar?.vector ?? 0} />
          </div>
        </div>

        <div className="flex gap-4">
          <div>
            <Icon name={activeChar?.skill_name}></Icon>
            <div className="text-center">SKILL</div>
            <div className="text-center text-xs">{activeChar?.skill_name}</div>
          </div>
          <div>
            <Icon name={activeChar?.special_name}></Icon>
            <div className="text-center">SPECIAL</div>
            <div className="text-center text-xs">
              {activeChar?.special_name}
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
};

export default EditUnit;
