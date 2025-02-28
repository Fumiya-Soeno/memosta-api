"use client";

import { useEffect, useState, Suspense } from "react";
import { Template } from "./components/common/Template";
import { PixiCanvas } from "./components/PixiCanvas";
import { fetchApi } from "../../helpers/api";

export default function Home() {
  const [winRows, setWinRows] = useState<
    { id: number; win_rate: number; name: string; win: number; loss: number }[]
  >([]);
  const [newRows, setNewRows] = useState<
    { id: number; win_rate: number; name: string; win: number; loss: number }[]
  >([]);

  useEffect(() => {
    fetchApi(
      "/wins/show",
      "GET",
      (result: any) => {
        setWinRows(result.rows);
        setNewRows(result.rowsNew);
      },
      () => {}
    );
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Template>
        {/* 外側コンテナでモバイルは縦並び、デスクトップは横並びに */}
        <div className="flex flex-col md:flex-row gap-2">
          {/* PixiCanvas */}
          <PixiCanvas width={400} height={600} backgroundColor={0xffffff} />

          {/* ランキング部分を横並びにするためのコンテナ */}
          <div className="flex flex-row gap-2 md:ml-2">
            {/* 新着ユニット10選 */}
            <div className="flex flex-col gap-2">
              <p className="text-xs text-center">新着ユニット10選</p>
              {newRows.map((row, index) => (
                <div
                  key={row.id}
                  className="p-2 border rounded-lg cursor-pointer shadow-md hover:bg-gray-100 transition"
                  onClick={() => (window.location.href = `/?id=${row.id}`)}
                >
                  <p className="text-xs font-bold">
                    No.{index + 1} {row.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    勝率{(row.win_rate * 100).toFixed(1)}%({row.win}勝{row.loss}
                    敗)
                  </p>
                </div>
              ))}
            </div>

            {/* 全国ランキング 勝率TOP10 */}
            <div className="flex flex-col gap-2">
              <p className="text-xs text-center">全国ランキング 勝率TOP10</p>
              {winRows.map((row, index) => (
                <div
                  key={row.id}
                  className="p-2 border rounded-lg cursor-pointer shadow-md hover:bg-gray-100 transition"
                  onClick={() => (window.location.href = `/?id=${row.id}`)}
                >
                  <p className="text-xs font-bold">
                    {index + 1}位 {row.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    勝率{(row.win_rate * 100).toFixed(1)}%({row.win}勝{row.loss}
                    敗)
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Template>
    </Suspense>
  );
}
