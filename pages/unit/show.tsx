"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Template } from "../../src/app/components/common/Template";
import { fetchApi } from "../../helpers/api";
import {
  getActiveUnitId,
  setActiveUnitIdClient,
} from "../../helpers/activeUnitHelper";

interface UnitDataType {
  id: number;
  name: string;
}

const Unit = () => {
  const [units, setUnits] = useState<UnitDataType[]>([]);
  const [activeUnitId, setActiveUnitId] = useState<number | null>(null);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const router = useRouter();

  // ブラウザがlocalhostで接続されているか判定
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLocalhost(window.location.hostname === "localhost");
    }
  }, []);

  // ユニット一覧を取得
  useEffect(() => {
    fetchApi(
      "/unit/show",
      "GET",
      (result: { rows: UnitDataType[] }) => {
        setUnits(result.rows);
        // 初回表示時、localStorageに保存されているアクティブユニットIDを読み込み、
        // なければ最初のユニットIDを使用する
        const storedActiveId = getActiveUnitId();
        if (storedActiveId) {
          setActiveUnitId(storedActiveId);
        } else if (result.rows.length > 0) {
          setActiveUnitId(result.rows[0].id);
          setActiveUnitIdClient(result.rows[0].id);
        }
      },
      (error: unknown) => {
        console.error("unit/show APIエラー:", error);
      }
    );
  }, []);

  // ユニットカードクリックで編集画面へ遷移
  const handleCardClick = (id: number) => {
    router.push(`/unit/edit?id=${id}`);
  };

  // 「Set Active」ボタンでアクティブユニットをクライアント側で更新
  const handleSetActive = (unitId: number) => {
    setActiveUnitIdClient(unitId);
    setActiveUnitId(unitId);
  };

  // 「削除」ボタンでユニットを削除
  const handleDelete = (id: number) => {
    fetchApi(
      "/unit/delete",
      "DELETE",
      (result: any) => {
        console.log("Unit deleted:", result);
        setUnits((prev) => prev.filter((unit) => unit.id !== id));
        // アクティブユニットが削除された場合は、クリアする
        if (activeUnitId === id) {
          setActiveUnitId(null);
          localStorage.removeItem("activeUnitId");
        }
      },
      (error: unknown) => {
        console.error("unit/delete APIエラー:", error);
      },
      { unitId: id } // リクエストボディに { unitId: id } を送信
    );
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
                  onClick={() => handleCardClick(unit.id)}
                  className="w-full h-16 bg-white shadow-lg rounded-lg flex items-center justify-between text-gray-800 text-lg cursor-pointer hover:bg-gray-100 transition px-4"
                >
                  <div className="text-sm md:text-base">
                    <span>{unit.name} </span>
                    {activeUnitId === unit.id && (
                      <span className="text-blue-500 font-bold">(Active)</span>
                    )}
                  </div>
                  <div className="space-x-2">
                    {activeUnitId !== unit.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetActive(unit.id);
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Set Active
                      </button>
                    )}
                    {activeUnitId !== unit.id && isLocalhost && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(unit.id);
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        削除
                      </button>
                    )}
                  </div>
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
