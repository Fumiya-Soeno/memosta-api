"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Template } from "./components/common/Template";
import { PixiCanvas } from "./components/PixiCanvas";
import { fetchApi } from "../../helpers/api";

export default function Home() {
  const [rows, setRows] = useState<
    { id: number; win_rate: number; name: string; win: number }[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    fetchApi(
      "/wins/show",
      "GET",
      (result: any) => {
        setRows(result.rows);
      },
      () => {}
    );
  }, []);

  return (
    <Template>
      <div className="flex gap-4">
        {/* PixiCanvas */}
        <PixiCanvas width={400} height={600} backgroundColor={0xffffff} />

        {/* ランキング表示 */}
        <div className="flex flex-col gap-2">
          <p className="text-xs">全国ランキング 勝率TOP10</p>
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="p-2 border rounded-lg cursor-pointer shadow-md hover:bg-gray-100 transition"
              onClick={() => (window.location.href = `/?id=${row.id}`)}
            >
              <p className="text-xs font-bold">
                {index + 1}位 {row.name}
              </p>
              <p className="text-xs text-gray-600">
                勝率{(row.win_rate * 100).toFixed(1)}%/{row.win}勝
              </p>
            </div>
          ))}
        </div>
      </div>
    </Template>
  );
}
