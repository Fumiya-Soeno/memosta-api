"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Template } from "../../src/app/components/common/Template";
import { fetchApi } from "../../helpers/api";
import { SelectField, Option } from "./components/SelectField";

const generateOptions = (start: number, count: number): Option[] => {
  return Array.from({ length: count }, (_, index) => {
    const value = index + start;
    const label = index === count - 1 ? String(value) : `${value}以上`;
    return { value, label };
  });
};

const SearchCharacter = () => {
  const [skills, setSkills] = useState<Option[]>([]);
  const [specials, setSpecials] = useState<Option[]>([]);

  const fetchPulldownOptions = () => {
    fetchApi(
      "/unit/pulldown",
      "GET",
      (result: any) => {
        const rows = result.rows;
        const skillOptions = rows.skills.map((skill: any) => ({
          value: skill.id,
          label: skill.name,
        }));
        const specialOptions = rows.specials.map((special: any) => ({
          value: special.id,
          label: special.name,
        }));
        setSkills(skillOptions);
        setSpecials(specialOptions);
      },
      (error: unknown) => {
        console.error("Pulldown取得エラー:", error);
      }
    );
  };

  useEffect(() => {
    fetchPulldownOptions();
  }, []);

  const handleSearchUnit = () => {
    fetchApi(
      "/unit/search",
      "POST",
      (result: any) => {
        // 検索結果処理
      },
      (error: unknown) => {
        // エラー処理
      },
      {
        // リクエストボディ
      }
    );
  };

  const handleSkillChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      console.log("選択されたスキル:", e.target.value);
    },
    []
  );

  const handleSpecialChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      console.log("選択された特殊:", e.target.value);
    },
    []
  );

  // 数値オプションの生成（先頭に空の選択肢を追加）
  const lifeOptions: Option[] = [
    { value: "", label: "" },
    ...generateOptions(1, 10),
  ];
  const attackOptions: Option[] = [
    { value: "", label: "" },
    ...generateOptions(1, 10),
  ];
  const speedOptions: Option[] = [
    { value: "", label: "" },
    ...generateOptions(0, 11),
  ];

  return (
    <Template>
      <div className="flex space-x-4">
        <SelectField
          id="life"
          name="life"
          label="HP"
          options={lifeOptions}
          onChange={() => {}}
        />
        <SelectField
          id="attack"
          name="attack"
          label="攻撃力"
          options={attackOptions}
          onChange={() => {}}
        />
        <SelectField
          id="speed"
          name="speed"
          label="スピード"
          options={speedOptions}
          onChange={() => {}}
        />
      </div>
      <div className="flex space-x-4 mt-4">
        <SelectField
          id="skills"
          name="skills"
          options={[{ value: "", label: "通常技(SKILL)" }, ...skills]}
          onChange={handleSkillChange}
        />
        <SelectField
          id="specials"
          name="specials"
          options={[{ value: "", label: "必殺技(SPECIAL)" }, ...specials]}
          onChange={handleSpecialChange}
        />
      </div>
    </Template>
  );
};

export default SearchCharacter;
