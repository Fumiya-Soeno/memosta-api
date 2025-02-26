"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Template } from "../../src/app/components/common/Template";
import { fetchApi } from "../helpers/api";

interface UnitDataType {
  id: number;
  name: string;
  // その他必要なプロパティを追加（例：vector, position, speed など）
}

const Unit = () => {
  const [units, setUnits] = useState<UnitDataType[]>([]);
  const [activeUnitId, setActiveUnitId] = useState<number | null>(null);
  const router = useRouter();

  // ユニット一覧とアクティブユニットを取得
  useEffect(() => {
    fetchApi(
      "/unit/show",
      "GET",
      (result: { rows: UnitDataType[] }) => {
        setUnits(result.rows);
        // ユニット一覧取得後、アクティブユニットを取得
        fetchApi(
          "/active_unit/show",
          "GET",
          (result: { rows: { unit_id: number }[] }) => {
            const activeId = result.rows[0]?.unit_id;
            setActiveUnitId(activeId);
          },
          (error: unknown) => {
            console.error("active_unit/show APIエラー:", error);
          }
        );
      },
      (error: unknown) => {
        console.error("unit/show APIエラー:", error);
      }
    );
  }, []);

  // ユニットカードクリック時は編集画面へ遷移
  const handleCardClick = (id: number) => {
    router.push(`/unit/edit?id=${id}`);
  };

  // 「Set Active」ボタンでアクティブユニットを変更
  const handleSetActive = (unitId: number) => {
    fetchApi(
      "/active_unit/update",
      "POST",
      (result: any) => {
        console.log("Active unit updated:", result);
        setActiveUnitId(unitId);
      },
      (error: unknown) => {
        console.error("active_unit/update APIエラー:", error);
      },
      { unitId }
    );
  };

  // 「削除」ボタンでユニットを削除
  const handleDelete = (id: number) => {
    fetchApi(
      "/unit/delete",
      "DELETE",
      (result: any) => {
        console.log("Unit deleted:", result);
        setUnits((prev) => prev.filter((unit) => unit.id !== id));
        // Optionally clear active unit if deleted
        if (activeUnitId === id) {
          setActiveUnitId(null);
        }
      },
      (error: unknown) => {
        console.error("unit/delete APIエラー:", error);
      },
      { unitId: id } // Set body.unitId to the unit's id
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
                  <div>
                    {unit.name}{" "}
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
                    {activeUnitId !== unit.id && (
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
