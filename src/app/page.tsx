"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Template } from "./components/common/Template";
import { PixiCanvas } from "./components/PixiCanvas";
import { fetchApi } from "../../pages/helpers/api";

export default function Home() {
  const [rows, setRows] = useState<{ ID: number; win_rate: number }[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchApi("/wins/show", "GET", (result: any) => {
      setRows(result.rows);
    });
  }, []);

  return (
    <Template>
      <div className="flex gap-4">
        {/* PixiCanvas */}
        <PixiCanvas width={400} height={600} backgroundColor={0xffffff} />

        {/* ランキング表示 */}
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div
              key={row.id}
              className="p-4 border rounded-lg cursor-pointer shadow-md hover:bg-gray-100 transition"
              onClick={() => (window.location.href = `/?id=${row.id}`)}
            >
              <p className="text-lg font-bold">ID: {row.id}</p>
              <p className="text-sm text-gray-600">
                勝率: {(row.win_rate * 100).toFixed(2)}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </Template>
  );
}
