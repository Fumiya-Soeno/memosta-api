"use client";

import React, { useEffect, useState } from "react";
import { Template } from "../../src/app/components/common/Template";
import { fetchApi } from "../../helpers/api";

const SearchCharacter = () => {
  const [skills, setSkills] = useState([]);
  const [specials, setSpecials] = useState([]);

  const setPulldown = () => {
    fetchApi(
      "/unit/pulldown",
      "GET",
      async (result: any) => {
        const rows = result.rows;
        setSkills(rows.skills);
        setSpecials(rows.specials);
      },
      (error: unknown) => {
        console.error("Pulldown取得エラー:", error);
      }
    );
  };

  useEffect(() => {
    setPulldown();
  }, []);

  const handleSearchUnit = () => {
    fetchApi(
      "/unit/search",
      "POST",
      async (result: any) => {},
      (error: unknown) => {},
      {
        // body
      }
    );
  };

  const handleSkillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("選択されたスキル:", e.target.value);
  };

  const handleSpecialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("選択された特殊:", e.target.value);
  };

  return (
    <Template>
      <div className="flex space-x-4">
        <div className="flex items-center">
          <label htmlFor="life" className="mr-2">
            HP
          </label>
          <select
            name="life"
            id="life"
            onChange={() => {}}
            className="text-black w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value=""></option>
            {[...Array(10)].map((i: number, index: number) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
                {index !== 9 && "以上"}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <label htmlFor="life" className="mr-2 break-keep">
            攻撃力
          </label>
          <select
            name="attack"
            id="attack"
            onChange={() => {}}
            className="text-black w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value=""></option>
            {[...Array(10)].map((i: number, index: number) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
                {index !== 9 && "以上"}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center">
          <label htmlFor="life" className="mr-2 break-keep">
            スピード
          </label>
          <select
            name="speed"
            id="speed"
            onChange={() => {}}
            className="text-black w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value=""></option>
            {[...Array(11)].map((i: number, index: number) => (
              <option key={index} value={index}>
                {index}
                {index !== 10 && "以上"}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex space-x-4">
        <div>
          <select
            name="skills"
            id="skills"
            onChange={handleSkillChange}
            className="text-black w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">通常技(SKILL)</option>
            {skills.map((skill: any, index: number) => (
              <option key={index} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            name="specials"
            id="specials"
            onChange={handleSpecialChange}
            className="text-black w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">必殺技(SPECIAL)</option>
            {specials.map((special: any, index: number) => (
              <option key={index} value={special.id}>
                {special.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Template>
  );
};

export default SearchCharacter;
