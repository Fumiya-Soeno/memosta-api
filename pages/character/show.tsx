"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Template } from "../../src/app/components/common/Template";
import { fetchApi } from "../../helpers/api";
import BarIndicator from "../../src/app/components/unit/BarIndicator";
import VectorIndicator from "../../src/app/components/unit/VectorIndicator";
import Icon from "../../src/app/components/unit/Icon";
import { UnitDataType } from "../../src/types/unit";

const ShowCharacter = () => {
  const searchParams = useSearchParams();
  const name = searchParams?.get("name") || "";
  const [charData, setCharData] = useState<any | null>(null);

  useEffect(() => {
    if (!name) return;

    fetchApi(
      `/character/show?name=${name}`,
      "GET",
      (result: { char: UnitDataType }) => {
        console.log("取得データ:", result.char);
        setCharData(result.char);
      },
      (error: unknown) => {
        // ✅ `error` の型を `unknown` にして安全に処理
        console.error("APIエラー:", error);
      }
    );
  }, [name]);

  return (
    <Template>
      <div className="w-full flex flex-col items-center justify-center h-[calc(100vh-60px)]">
        <div className="m-6">
          <span className={`inline-block text-6xl`}>{charData?.name}</span>
        </div>

        <div className="flex mb-4">
          <div>
            <BarIndicator
              label="LIFE"
              value={Number(charData?.life) / 10}
              barColor="bg-green-500"
            />
            <BarIndicator
              label="ATK"
              value={Number(charData?.attack)}
              barColor="bg-red-500"
            />
            <BarIndicator
              label="SPD"
              value={Number(charData?.speed)}
              barColor="bg-blue-500"
            />
          </div>
          <div className="flex ml-4">
            <span>VEC</span>
            <VectorIndicator arrow={charData?.vector ?? 0} />
          </div>
        </div>

        <div className="flex gap-4 mt-2">
          <div>
            <Icon name={charData?.skill_name ?? ""} />
            <div className="text-sm text-center mt-2">
              {charData?.skill_name}
            </div>
            <div className="text-xs max-w-52 mt-2">{charData?.skill_desc}</div>
          </div>
          <div>
            <Icon name={charData?.special_name ?? ""} />
            <div className="text-sm text-center mt-2">
              {charData?.special_name}
            </div>
            <div className="text-xs max-w-52 mt-2">
              {charData?.special_desc}
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
};

export default ShowCharacter;
