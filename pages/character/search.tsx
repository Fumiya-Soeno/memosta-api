"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Template } from "../../src/app/components/common/Template";
import { fetchApi } from "../../helpers/api";
import { SelectField, Option } from "./components/SelectField";
import { CharacterDetails } from "./components/CharacterDetails";

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
  const [searchLife, setSearchLife] = useState<number | null>(null);
  const [searchAttack, setSearchAttack] = useState<number | null>(null);
  const [searchSpeed, setSearchSpeed] = useState<number | null>(null);
  const [searchSkill, setSearchSkill] = useState<number | null>(null);
  const [searchSpecial, setSearchSpecial] = useState<number | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);

  // プルダウン用のオプション取得
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

  // search APIを呼び出す共通関数
  const performSearch = useCallback(
    (
      life: number | null,
      attack: number | null,
      speed: number | null,
      skill: number | null,
      special: number | null
    ) => {
      const requestBody: {
        searchLife?: number;
        searchAttack?: number;
        searchSpeed?: number;
        searchSkill?: number;
        searchSpecial?: number;
      } = {};

      if (life !== null) {
        requestBody.searchLife = life;
      }
      if (attack !== null) {
        requestBody.searchAttack = attack;
      }
      if (speed !== null) {
        requestBody.searchSpeed = speed;
      }
      if (skill !== null) {
        requestBody.searchSkill = skill;
      }
      if (special !== null) {
        requestBody.searchSpecial = special;
      }

      fetchApi(
        "/character/search",
        "POST",
        (result: any) => {
          console.log("Search result:", result);
          setResults(result.rows);
          setVisibleCount(10); // 新規検索時は表示件数をリセット
        },
        (error: unknown) => {
          console.error("Search API エラー:", error);
        },
        requestBody
      );
    },
    []
  );

  // 各ステータスのonChangeハンドラ
  const handleLifeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value === "" ? null : Number(e.target.value);
      setSearchLife(value);
      performSearch(
        value,
        searchAttack,
        searchSpeed,
        searchSkill,
        searchSpecial
      );
    },
    [searchAttack, searchSpeed, searchSkill, searchSpecial, performSearch]
  );

  const handleAttackChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value === "" ? null : Number(e.target.value);
      setSearchAttack(value);
      performSearch(searchLife, value, searchSpeed, searchSkill, searchSpecial);
    },
    [searchLife, searchSpeed, searchSkill, searchSpecial, performSearch]
  );

  const handleSpeedChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value === "" ? null : Number(e.target.value);
      setSearchSpeed(value);
      performSearch(
        searchLife,
        searchAttack,
        value,
        searchSkill,
        searchSpecial
      );
    },
    [searchLife, searchAttack, searchSkill, searchSpecial, performSearch]
  );

  const handleSkillChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value === "" ? null : Number(e.target.value);
      setSearchSkill(value);
      performSearch(
        searchLife,
        searchAttack,
        searchSpeed,
        value,
        searchSpecial
      );
    },
    [searchLife, searchAttack, searchSpeed, searchSpecial, performSearch]
  );

  const handleSpecialChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value === "" ? null : Number(e.target.value);
      setSearchSpecial(value);
      performSearch(searchLife, searchAttack, searchSpeed, searchSkill, value);
    },
    [searchLife, searchAttack, searchSpeed, searchSkill, performSearch]
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
      <div className="flex flex-col min-h-screen">
        {/* 固定された検索フィールド */}
        <div className="sticky top-0 z-10 p-4 bg-black border-b border-gray-600">
          <div className="space-y-4">
            <div className="flex space-x-4">
              <SelectField
                id="life"
                name="life"
                label="HP"
                options={lifeOptions}
                onChange={handleLifeChange}
              />
              <SelectField
                id="attack"
                name="attack"
                label="攻撃力"
                options={attackOptions}
                onChange={handleAttackChange}
              />
              <SelectField
                id="speed"
                name="speed"
                label="スピード"
                options={speedOptions}
                onChange={handleSpeedChange}
              />
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
          </div>
        </div>

        {/* 検索結果（キャラクター一覧） */}
        <div className="p-4 inline-block">
          {results.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.slice(0, visibleCount).map((charData) => (
                  <CharacterDetails key={charData.id} charData={charData} />
                ))}
              </div>
              {/* もっと表示ボタン（残り件数がある場合のみ表示） */}
              {visibleCount < results.length && (
                <div className="mt-4 text-center">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => setVisibleCount(visibleCount + 10)}
                  >
                    もっと表示
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Template>
  );
};

export default SearchCharacter;
