"use client";

import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";

import { UnitDataType } from "../../types/unit";
import { fetchApi } from "../../../pages/helpers/api";

interface PixiCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: number;
}

interface UnitText {
  text: PIXI.Text;
  unit: UnitDataType;
  vx: number;
  vy: number;
}

export function PixiCanvas({
  width = 400,
  height = 600,
  backgroundColor = 0xffffff,
}: PixiCanvasProps) {
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  // 各ユニットのテキスト情報と速度情報をまとめるためのref
  const textsRef = useRef<UnitText[]>([]);
  const animationStartedRef = useRef(false);

  // APIからユニットデータを取得（型を明示）
  const [unitData, setUnitData] = useState<UnitDataType[] | null>(null);

  useEffect(() => {
    const app = new PIXI.Application({
      width,
      height,
      backgroundColor,
    });
    if (pixiContainerRef.current) {
      pixiContainerRef.current.appendChild(app.view);
    }
    appRef.current = app;

    // APIからユニットデータを取得
    fetchApi(
      `/unit/edit?unitId=2`,
      "GET",
      (result: { records: UnitDataType[] }) => {
        setUnitData(result.records);
      },
      (error: unknown) => {
        console.error("APIエラー:", error);
      }
    );

    return () => {
      app.destroy(true, true);
    };
  }, [width, height, backgroundColor]);

  // unitDataが取得されたら、各ユニットのPIXI.Textオブジェクトを生成し、中央揃えで配置する
  useEffect(() => {
    if (!unitData) return;
    const app = appRef.current;
    if (!app) return;

    // position順にソート（小さい順）
    const sortedUnits = [...unitData].sort((a, b) => a.position - b.position);

    // すでにあるテキストがあれば削除
    textsRef.current.forEach((ut) => {
      app.stage.removeChild(ut.text);
    });
    textsRef.current = [];

    // 共通のテキストスタイル
    const textStyle = new PIXI.TextStyle({
      fontSize: 20,
      fill: 0x000000,
      fontWeight: "bold",
    });

    // 各ユニットのテキストオブジェクトを生成し、速度計算
    const unitTexts: UnitText[] = sortedUnits.map((unit) => {
      const text = new PIXI.Text(unit.name, textStyle);
      text.anchor.set(0.5);
      // APIのvectorに180°を加えることで、進行方向を反転させる
      const angle = ((unit.vector + 180) * Math.PI) / 180;
      const vx = unit.speed * Math.cos(angle);
      const vy = unit.speed * Math.sin(angle);
      return { text, unit, vx, vy };
    });

    // 全テキストの合計幅を計算し、中央揃えのための左端位置を決定
    const totalWidth = unitTexts.reduce((sum, ut) => sum + ut.text.width, 0);
    const leftEdge = app.screen.width / 2 - totalWidth / 2;
    let currentX = leftEdge;
    unitTexts.forEach((ut) => {
      // 各文字の中心位置は、現在のX位置＋半分の幅
      ut.text.x = currentX + ut.text.width / 2;
      ut.text.y = app.screen.height / 2;
      currentX += ut.text.width;
      app.stage.addChild(ut.text);
    });

    textsRef.current = unitTexts;
  }, [unitData, width, height]);

  const handleStart = () => {
    const app = appRef.current;
    if (!app) return;
    if (animationStartedRef.current) return; // 二重登録防止
    animationStartedRef.current = true;

    // tickerにより毎フレーム、各ユニットのテキストを移動
    app.ticker.add(() => {
      textsRef.current.forEach((ut) => {
        ut.text.x += ut.vx;
        ut.text.y += ut.vy;

        // 横方向のラッピング処理
        if (ut.text.x < 0) {
          ut.text.x = app.screen.width;
        } else if (ut.text.x > app.screen.width) {
          ut.text.x = 0;
        }
        // 縦方向のラッピング処理
        if (ut.text.y < 0) {
          ut.text.y = app.screen.height;
        } else if (ut.text.y > app.screen.height) {
          ut.text.y = 0;
        }
      });
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div ref={pixiContainerRef} className="mb-4" />
      <button
        onClick={handleStart}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Start
      </button>
    </div>
  );
}
