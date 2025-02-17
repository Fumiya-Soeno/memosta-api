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
  const textsRef = useRef<UnitText[]>([]);
  const animationStartedRef = useRef(false);

  // サンドバッグ用のrefとHP管理
  const sandbagContainerRef = useRef<PIXI.Container | null>(null);
  const sandbagHPBarRef = useRef<PIXI.Graphics | null>(null);
  const currentHPRef = useRef(100);

  const [unitData, setUnitData] = useState<UnitDataType[] | null>(null);
  const [unitId, setUnitId] = useState<number | null>(null);

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

    // サンドバッグの作成
    const sandbagContainer = new PIXI.Container();
    // サンドバッグのテキスト（フォントサイズ20で作成）
    const sandbagTextStyle = new PIXI.TextStyle({
      fontSize: 20,
      fill: 0x000000,
      fontWeight: "bold",
    });
    const sandbagText = new PIXI.Text("●", sandbagTextStyle);
    sandbagText.anchor.set(0.5);
    sandbagContainer.addChild(sandbagText);

    // HPバー用のGraphicsオブジェクト
    const hpBar = new PIXI.Graphics();
    sandbagContainer.addChild(hpBar);

    // サンドバッグは画面上部中央に配置（Y座標は任意調整）
    sandbagContainer.x = app.screen.width / 2;
    sandbagContainer.y = app.screen.height / 4;
    app.stage.addChild(sandbagContainer);

    sandbagContainerRef.current = sandbagContainer;
    sandbagHPBarRef.current = hpBar;

    // HPバーの定数
    const HP_BAR_WIDTH = 20;
    const HP_BAR_HEIGHT = 1;

    // HPバー更新関数
    const updateHPBar = () => {
      if (!hpBar) return;
      hpBar.clear();
      const maxHP = 100;
      const currentHP = currentHPRef.current;
      const hpRatio = currentHP / maxHP;
      const greenWidth = HP_BAR_WIDTH * hpRatio;
      // 緑部分（残量）
      hpBar.beginFill(0x00ff00);
      hpBar.drawRect(
        -HP_BAR_WIDTH / 2,
        sandbagText.height / 2 + 5,
        greenWidth,
        HP_BAR_HEIGHT
      );
      hpBar.endFill();
      // 赤部分（減少分）
      hpBar.beginFill(0xff0000);
      hpBar.drawRect(
        -HP_BAR_WIDTH / 2 + greenWidth,
        sandbagText.height / 2 + 5,
        HP_BAR_WIDTH - greenWidth,
        HP_BAR_HEIGHT
      );
      hpBar.endFill();
    };

    updateHPBar();

    // APIでactive_unit/showからunitIdを取得
    fetchApi("/active_unit/show", "GET", (result) => {
      const id = result?.rows[0]?.unit_id;
      if (id) setUnitId(id);
    });

    return () => {
      app.destroy(true, true);
    };
  }, [width, height, backgroundColor]);

  // unitId取得後にunit/edit APIを実行
  useEffect(() => {
    if (unitId === null) return;
    fetchApi(
      `/unit/edit?unitId=${unitId}`,
      "GET",
      (result: { records: UnitDataType[] }) => {
        setUnitData(result.records);
      },
      (error: unknown) => {
        console.error("APIエラー:", error);
      }
    );
  }, [unitId]);

  // unitDataが取得されたら、各ユニットのPIXI.Textオブジェクトを生成し中央揃えで配置
  useEffect(() => {
    if (!unitData) return;
    const app = appRef.current;
    if (!app) return;

    const sortedUnits = [...unitData].sort((a, b) => a.position - b.position);

    textsRef.current.forEach((ut) => {
      app.stage.removeChild(ut.text);
    });
    textsRef.current = [];

    const textStyle = new PIXI.TextStyle({
      fontSize: 20,
      fill: 0x000000,
      fontWeight: "bold",
    });

    const unitTexts: UnitText[] = sortedUnits.map((unit) => {
      const text = new PIXI.Text(unit.name, textStyle);
      text.anchor.set(0.5);
      // APIのvectorに180°加算して進行方向を反転
      const angle = ((unit.vector + 180) * Math.PI) / 180;
      const vx = unit.speed * Math.cos(angle);
      const vy = unit.speed * Math.sin(angle);
      return { text, unit, vx, vy };
    });

    const totalWidth = unitTexts.reduce((sum, ut) => sum + ut.text.width, 0);
    const leftEdge = app.screen.width / 2 - totalWidth / 2;
    let currentX = leftEdge;
    unitTexts.forEach((ut) => {
      ut.text.x = currentX + ut.text.width / 2;
      ut.text.y = (app.screen.height * 3) / 4;
      currentX += ut.text.width;
      app.stage.addChild(ut.text);
    });

    textsRef.current = unitTexts;
  }, [unitData, width, height]);

  const handleStart = () => {
    const app = appRef.current;
    if (!app || animationStartedRef.current) return;
    animationStartedRef.current = true;

    // 各キャラクターの移動を開始（ラッピング処理付き）
    app.ticker.add(() => {
      textsRef.current.forEach((ut) => {
        ut.text.x += ut.vx;
        ut.text.y += ut.vy;

        if (ut.text.x < 0) ut.text.x = app.screen.width;
        else if (ut.text.x > app.screen.width) ut.text.x = 0;

        if (ut.text.y < 0) ut.text.y = app.screen.height;
        else if (ut.text.y > app.screen.height) ut.text.y = 0;
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
