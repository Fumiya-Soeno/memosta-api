"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ ルーティング用
import { Template } from "../../src/app/components/common/Template";
import { fetchApi } from "../helpers/api";

const Unit = () => {
  const [units, setUnits] = useState([]); // ✅ データを保存するステート
  const router = useRouter(); // ✅ ルーターの取得

  useEffect(() => {
    fetchApi(
      "/unit/show",
      "GET",
      (result) => {
        setUnits(result.rows); // ✅ API のデータを state に保存
      },
      (error) => {
        console.error("APIエラー:", error);
      }
    );
  }, []);

  // ✅ カードクリック時に `/unit/edit?id={id}` へ遷移
  const handleCardClick = (id: number) => {
    router.push(`/unit/edit?id=${id}`);
  };

  return (
    <Template>
      <div className="w-full h-[calc(100vh-60px)] flex justify-center">
        <div className="w-full max-w-xl h-full overflow-y-auto p-4">
          <ul className="w-full space-y-4">
            {units.length > 0 ? (
              units.map((unit) => (
                <li
                  key={unit.id}
                  onClick={() => handleCardClick(unit.id)} // ✅ クリックで遷移
                  className="w-full h-16 bg-white shadow-lg rounded-lg flex items-center justify-center text-gray-800 text-lg cursor-pointer hover:bg-gray-100 transition"
                >
                  {unit.name}
                </li>
              ))
            ) : (
              <li className="w-full text-center text-gray-500">
                データがありません
              </li>
            )}
          </ul>
        </div>
      </div>
    </Template>
  );
};

export default Unit;
