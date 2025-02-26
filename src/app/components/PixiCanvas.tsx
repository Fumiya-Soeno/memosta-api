"use client";

import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { fetchApi } from "../../../pages/helpers/api";
import { UnitDataType } from "../../types/unit";
import { DamageText, updateDamageTexts } from "../utils/DamageTextUtil";
import { updateUnitHPBar } from "../utils/updateHPBar";
import { createUnitTexts } from "../helpers/UnitTextHelper";

import CanvasContainer from "../components/CanvasContainer";

import { SkillManager } from "../skills/SkillManager";
import { SpecialManager } from "../specials/SpecialManager";

interface PixiCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: number;
}

export function PixiCanvas({
  width = 400,
  height = 600,
  backgroundColor = 0xffffff,
}: PixiCanvasProps) {
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const allyTextsRef = useRef<any[]>([]);
  const enemyTextsRef = useRef<any[]>([]);
  const animationStartedRef = useRef(false);

  const attackFrameCounter = useRef(0);

  const lasersRef = useRef<any[]>([]);
  const crossBurstsRef = useRef<any[]>([]);
  const spreadBulletsRef = useRef<any[]>([]);
  const echoBladeEffectsRef = useRef<any[]>([]);
  const guardianFallEffectsRef = useRef<any[]>([]);
  const blitzShockEffectsRef = useRef<any[]>([]);
  const spiralShotEffectsRef = useRef<any[]>([]);
  const flameEdgeEffectsRef = useRef<any[]>([]);
  const lorenzBurstEffectsRef = useRef<any[]>([]);
  const parabolicLauncherEffects = useRef<any[]>([]);

  const poisonFogsRef = useRef<any[]>([]);
  const earthquakeEffectsRef = useRef<any[]>([]);
  const powerUpEffectsRef = useRef<any[]>([]);
  const damageWallEffectsRef = useRef<any[]>([]);
  const meteorEffectsRef = useRef<any[]>([]);
  const regenEffectsRef = useRef<any[]>([]);
  const healingEffectsRef = useRef<any[]>([]);
  const shadowDiveEffectsRef = useRef<any[]>([]);
  const vortexBreakEffectsRef = useRef<any[]>([]);
  const doppelgangerEffectsRef = useRef<any[]>([]);

  const damageTextsRef = useRef<DamageText[]>([]);

  const [allyData, setAllyData] = useState<UnitDataType[] | null>(null);
  const [enemyData, setEnemyData] = useState<UnitDataType[] | null>(null);

  const [unitId, setUnitId] = useState<number | null>(null);

  useEffect(() => {
    const app = new PIXI.Application({ width, height, backgroundColor });
    if (pixiContainerRef.current) {
      pixiContainerRef.current.appendChild(app.view);
    }
    appRef.current = app;
    fetchApi("/active_unit/show", "GET", (result: any) => {
      const id = result?.rows[0]?.unit_id;
      if (id) setUnitId(id);
    });
    return () => {
      app.destroy(true, true);
    };
  }, [width, height, backgroundColor]);

  useEffect(() => {
    if (unitId === null) return;
    fetchApi(
      `/unit/edit?unitId=${unitId}`,
      "GET",
      (result: { records: UnitDataType[] }) => {
        setAllyData(result.records);
      },
      (error: unknown) => {
        console.error("APIエラー:", error);
      }
    );
  }, [unitId]);

  useEffect(() => {
    fetchApi(
      "/enemy_unit/show",
      "GET",
      (result: { records: UnitDataType[] }) => {
        setEnemyData(result.records);
      },
      (error: unknown) => {
        console.error("APIエラー:", error);
      }
    );
  }, []);

  // 味方ユニットテキストの生成と配置
  useEffect(() => {
    if (!allyData) return;
    const app = appRef.current;
    if (!app) return;
    // 既存の味方テキストを削除
    allyTextsRef.current.forEach((ut) => {
      app.stage.removeChild(ut.text);
      app.stage.removeChild(ut.hpBar);
    });
    // ヘルパー関数を使用して味方テキストを作成
    allyTextsRef.current = createUnitTexts(app, allyData, true);
  }, [allyData, width, height]);

  // 敵ユニットテキストの生成と配置
  useEffect(() => {
    if (!enemyData) return;
    const app = appRef.current;
    if (!app) return;
    // 既存の敵テキストを削除
    enemyTextsRef.current.forEach((ut) => {
      app.stage.removeChild(ut.text);
      app.stage.removeChild(ut.hpBar);
    });
    // ヘルパー関数を使用して敵テキストを作成
    enemyTextsRef.current = createUnitTexts(app, enemyData, false);
  }, [enemyData, width, height]);

  const handleStart = () => {
    const app = appRef.current;
    if (!app || animationStartedRef.current) return;
    animationStartedRef.current = true;
    app.ticker.add(() => {
      // ユニットの移動更新とHPバー更新
      [...allyTextsRef.current, ...enemyTextsRef.current].forEach((ut) => {
        ut.text.x += ut.vx;
        ut.text.y += ut.vy;
        if (ut.text.x < 0) ut.text.x = app.screen.width;
        else if (ut.text.x > app.screen.width) ut.text.x = 0;
        if (ut.text.y < 0) ut.text.y = app.screen.height;
        else if (ut.text.y > app.screen.height) ut.text.y = 0;
        updateUnitHPBar(ut);
      });

      allyTextsRef.current = allyTextsRef.current.filter((ut) => {
        if (ut.hp <= 0) {
          app.stage.removeChild(ut.text);
          app.stage.removeChild(ut.hpBar);
          return false;
        }
        return true;
      });
      enemyTextsRef.current = enemyTextsRef.current.filter((ut) => {
        if (ut.hp <= 0) {
          app.stage.removeChild(ut.text);
          app.stage.removeChild(ut.hpBar);
          return false;
        }
        return true;
      });

      attackFrameCounter.current++;

      const skillManager = new SkillManager(
        app,
        allyTextsRef.current,
        enemyTextsRef.current,
        lasersRef.current,
        crossBurstsRef.current,
        spreadBulletsRef.current,
        echoBladeEffectsRef.current,
        guardianFallEffectsRef.current,
        blitzShockEffectsRef.current,
        spiralShotEffectsRef.current,
        flameEdgeEffectsRef.current,
        lorenzBurstEffectsRef.current,
        parabolicLauncherEffects.current,
        damageTextsRef.current,
        attackFrameCounter.current
      );
      const specialManager = new SpecialManager(
        app,
        allyTextsRef.current,
        enemyTextsRef.current,
        poisonFogsRef.current,
        earthquakeEffectsRef.current,
        powerUpEffectsRef.current,
        damageWallEffectsRef.current,
        meteorEffectsRef.current,
        regenEffectsRef.current,
        healingEffectsRef.current,
        shadowDiveEffectsRef.current,
        vortexBreakEffectsRef.current,
        doppelgangerEffectsRef.current,
        damageTextsRef.current,
        attackFrameCounter.current
      );

      skillManager.counter = attackFrameCounter.current;
      skillManager.update();
      specialManager.counter = attackFrameCounter.current;
      specialManager.update();

      // ダメージ表示の更新
      updateDamageTexts(app, damageTextsRef.current);
    });
  };

  return <CanvasContainer ref={pixiContainerRef} onStart={handleStart} />;
}
