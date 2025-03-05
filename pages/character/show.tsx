"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Template } from "../../src/app/components/common/Template";
import { fetchApi } from "../../helpers/api";
import { UnitDataType } from "../../src/types/unit";
import { CharacterDetails } from "../../src/app/components/character/CharacterDetails";

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
        console.error("APIエラー:", error);
      }
    );
  }, [name]);

  return (
    <Template>
      <CharacterDetails charData={charData} />
    </Template>
  );
};

export default ShowCharacter;
