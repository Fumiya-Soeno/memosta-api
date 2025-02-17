// components/PixiCanvas.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { fetchApi } from "../../../pages/helpers/api";
import { UnitDataType } from "../../types/unit";

// インポート
import {
  handleLockOnLaserAttack,
  UnitText as LaserUnitText,
  Laser,
  DamageText,
} from "../skills/LockOnLaser";
import {
  handleCrossBurstAttack,
  updateCrossBursts,
  CrossBurst,
} from "../skills/CrossBurst";

interface PixiCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: number;
}

interface ExtendedUnitText extends LaserUnitText {
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
  const textsRef = useRef<ExtendedUnitText[]>([]);
  const animationStartedRef = useRef(false);

  const attackFrameCounter = useRef(0);
  const lasersRef = useRef<Laser[]>([]);
  const crossBurstsRef = useRef<CrossBurst[]>([]);
  const damageTextsRef = useRef<DamageText[]>([]);

  const sandbagContainerRef = useRef<PIXI.Container | null>(null);
  const sandbagHPBarRef = useRef<PIXI.Graphics | null>(null);
  const sandbagTextRef = useRef<PIXI.Text | null>(null);
  const currentHPRef = useRef(100);

  const [unitData, setUnitData] = useState<UnitDataType[] | null>(null);
  const [unitId, setUnitId] = useState<number | null>(null);

  const updateHPBar = () => {
    const hpBar = sandbagHPBarRef.current;
    const sandbagText = sandbagTextRef.current;
    if (!hpBar || !sandbagText) return;
    hpBar.clear();
    const maxHP = 100;
    const currentHP = currentHPRef.current;
    const hpRatio = currentHP / maxHP;
    const greenWidth = 20 * hpRatio;
    hpBar.beginFill(0x00ff00);
    hpBar.drawRect(-10, sandbagText.height / 2 + 5, greenWidth, 1);
    hpBar.endFill();
    hpBar.beginFill(0xff0000);
    hpBar.drawRect(
      -10 + greenWidth,
      sandbagText.height / 2 + 5,
      20 - greenWidth,
      1
    );
    hpBar.endFill();
  };

  // 以下 unitId, unitData の取得などはこれまでと同様

  useEffect(() => {
    const app = new PIXI.Application({ width, height, backgroundColor });
    if (pixiContainerRef.current) {
      pixiContainerRef.current.appendChild(app.view);
    }
    appRef.current = app;

    // サンドバッグ作成
    const sandbagContainer = new PIXI.Container();
    const sandbagText = new PIXI.Text("●", {
      fontSize: 20,
      fill: 0x000000,
      fontWeight: "bold",
    });
    sandbagText.anchor.set(0.5);
    sandbagContainer.addChild(sandbagText);
    sandbagTextRef.current = sandbagText;
    const hpBar = new PIXI.Graphics();
    sandbagContainer.addChild(hpBar);
    sandbagContainer.x = app.screen.width / 2;
    sandbagContainer.y = app.screen.height / 4;
    app.stage.addChild(sandbagContainer);
    sandbagContainerRef.current = sandbagContainer;
    sandbagHPBarRef.current = hpBar;
    updateHPBar();

    fetchApi("/active_unit/show", "GET", (result) => {
      const id = result?.rows[0]?.unit_id;
      if (id) setUnitId(id);
    });

    return () => app.destroy(true, true);
  }, [width, height, backgroundColor]);

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

  useEffect(() => {
    if (!unitData) return;
    const app = appRef.current;
    if (!app) return;
    const sortedUnits = [...unitData].sort((a, b) => a.position - b.position);
    textsRef.current.forEach((ut) => app.stage.removeChild(ut.text));
    textsRef.current = [];
    const textStyle = { fontSize: 20, fill: 0x000000, fontWeight: "bold" };
    const unitTexts: ExtendedUnitText[] = sortedUnits.map((unit) => {
      const text = new PIXI.Text(unit.name, textStyle);
      text.anchor.set(0.5);
      const angle = ((unit.vector + 180) * Math.PI) / 180;
      const vx = unit.speed * Math.cos(angle);
      const vy = unit.speed * Math.sin(angle);
      return { text, unit, vx, vy };
    });
    const totalWidth = unitTexts.reduce((sum, ut) => sum + ut.text.width, 0);
    let currentX = app.screen.width / 2 - totalWidth / 2;
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

    app.ticker.add(() => {
      textsRef.current.forEach((ut) => {
        ut.text.x += ut.vx;
        ut.text.y += ut.vy;
        if (ut.text.x < 0) ut.text.x = app.screen.width;
        else if (ut.text.x > app.screen.width) ut.text.x = 0;
        if (ut.text.y < 0) ut.text.y = app.screen.height;
        else if (ut.text.y > app.screen.height) ut.text.y = 0;
      });

      attackFrameCounter.current++;

      // ロックオンレーザー攻撃の呼び出し
      if (attackFrameCounter.current % 5 === 0) {
        handleLockOnLaserAttack({
          app,
          texts: textsRef.current,
          sandbagContainer: sandbagContainerRef.current!,
          currentHPRef,
          updateHPBar,
          damageTexts: damageTextsRef.current,
          lasers: lasersRef.current,
        });
      }

      // 十字バースト発射
      if (attackFrameCounter.current % 9 === 0) {
        // 発射（爆発エフェクト生成）は別ファイルの関数で処理
        handleCrossBurstAttack({
          app,
          texts: textsRef.current,
          crossBursts: crossBurstsRef.current,
        });
      }

      // 各十字バーストエフェクトの更新
      updateCrossBursts({
        app,
        crossBursts: crossBurstsRef.current,
        sandbagContainer: sandbagContainerRef.current!,
        currentHPRef,
        updateHPBar,
        damageTexts: damageTextsRef.current,
      });

      // レーザーとダメージ表示の更新処理（これまでと同様）
      for (let i = lasersRef.current.length - 1; i >= 0; i--) {
        const laser = lasersRef.current[i];
        laser.lifetime -= 1;
        if (laser.lifetime <= 0) {
          app.stage.removeChild(laser.graphics);
          lasersRef.current.splice(i, 1);
        }
      }
      for (let i = damageTextsRef.current.length - 1; i >= 0; i--) {
        const dt = damageTextsRef.current[i];
        dt.age++;
        const progress = dt.age / dt.lifetime;
        dt.text.alpha = 1 - progress;
        dt.text.x = dt.startX + dt.hVel * dt.age;
        dt.text.y = dt.startY - 4 * dt.peakHeight * progress * (1 - progress);
        if (dt.age >= dt.lifetime) {
          app.stage.removeChild(dt.text);
          damageTextsRef.current.splice(i, 1);
        }
      }
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
