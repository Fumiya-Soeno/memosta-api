"use client";

import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { fetchApi } from "../../../helpers/api";

import { useSearchParams } from "next/navigation";

import { UnitDataType } from "../../types/unit";
import { DamageText, updateDamageTexts } from "../utils/DamageTextUtil";
import { updateUnitHPBar } from "../utils/updateHPBar";
import { createUnitTexts } from "../helpers/UnitTextHelper";

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
  const [enemyUnitId, setEnemyUnitId] = useState<number | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const app = new PIXI.Application({ width, height, backgroundColor });
    if (pixiContainerRef.current) {
      pixiContainerRef.current.appendChild(app.view as HTMLCanvasElement);
    }
    appRef.current = app;
    fetchApi(
      "/active_unit/show",
      "GET",
      (result: any) => {
        const id = result?.rows[0]?.unit_id;
        if (id) setUnitId(id);
      },
      () => {}
    );
    return () => {
      app.destroy(true, true);
    };
  }, [width, height, backgroundColor]);

  // allyDataの取得
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

  // URLの?idパラメータからenemyUnitIdを取得
  useEffect(() => {
    const paramsUnitId = Number(searchParams?.get("id"));
    if (paramsUnitId) {
      setEnemyUnitId(paramsUnitId);
    }
  }, [searchParams]);

  // id指定がない場合、Pixi画面上にメッセージを表示
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    // URLにidパラメータが存在しなければ
    if (!searchParams?.get("id")) {
      const style = new PIXI.TextStyle({
        fontSize: 12,
        fill: 0x000000,
        fontWeight: "bold",
        align: "center",
      });
      const message = new PIXI.Text("戦うユニットを選んで下さい", style);
      message.anchor.set(0.5);
      message.x = app.screen.width / 2;
      message.y = app.screen.height / 4;
      app.stage.addChild(message);
    }
  }, [searchParams]);

  // 味方ユニットテキストの生成と配置
  useEffect(() => {
    if (!allyData) return;
    const app = appRef.current;
    if (!app || allyTextsRef.current.length !== 0) return;
    allyTextsRef.current = createUnitTexts(app, allyData, true);
  }, [allyData, width, height]);

  // 敵ユニットテキストの生成と配置
  useEffect(() => {
    if (!enemyData) return;
    const app = appRef.current;
    if (!app || enemyTextsRef.current.length !== 0) return;
    enemyTextsRef.current = createUnitTexts(app, enemyData, false);
    if (!enemyUnitId) setEnemyUnitId(enemyTextsRef.current[0].unit.id);
  }, [enemyData, width, height]);

  // enemyDataの取得（idが指定されている場合のみ）
  useEffect(() => {
    if (!enemyUnitId) return;
    const queryParams = `?id=${enemyUnitId}`;
    fetchApi(
      "/enemy_unit/show" + queryParams,
      "GET",
      (result: { records: UnitDataType[] }) => {
        setEnemyData(result.records);
      },
      (error: unknown) => {
        console.error("APIエラー:", error);
      }
    );
  }, [enemyUnitId]);

  // allyData, enemyDataが取得できたら「Click to Start」のスタート画面を表示
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    // allyDataとenemyDataがnullでなく、かつどちらもlengthが0でない場合のみ
    if (
      !allyData ||
      !enemyData ||
      allyData.length === 0 ||
      enemyData.length === 0
    )
      return;

    // スタート画面用コンテナを作成
    const startScreenContainer = new PIXI.Container();
    app.stage.addChild(startScreenContainer);

    // 黒い帯（矩形）の作成
    const band = new PIXI.Graphics();
    band.beginFill(0x000000);
    const bandWidth = app.screen.width;
    const bandHeight = 70;
    band.drawRect(
      0,
      app.screen.height / 2 - bandHeight / 2,
      bandWidth,
      bandHeight
    );
    band.endFill();
    startScreenContainer.addChild(band);

    // 「Click to Start」テキストの作成
    const style = new PIXI.TextStyle({
      fontSize: 24,
      fill: 0xffffff,
      fontWeight: "bold",
      align: "center",
    });
    const startText = new PIXI.Text("Click to Start", style);
    startText.anchor.set(0.5);
    startText.x = app.screen.width / 2;
    startText.y = app.screen.height / 2;
    startScreenContainer.addChild(startText);

    // 点滅効果: bandのα値を変化させる
    let blinkCounter = 0;
    const blinkTicker = (delta: number) => {
      blinkCounter += delta;
      const alpha = 0.5 + 0.5 * Math.sin(blinkCounter * 0.1);
      band.alpha = alpha;
    };
    app.ticker.add(blinkTicker);

    // スタート画面にインタラクティブ設定を追加し、クリック時にhandleStartを実行
    startScreenContainer.eventMode = "dynamic";
    startScreenContainer.on("pointerdown", () => {
      app.ticker.remove(blinkTicker);
      app.stage.removeChild(startScreenContainer);
      handleStart();
    });
  }, [allyData, enemyData]);

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

      // 勝敗判定
      if (
        allyTextsRef.current.length === 0 ||
        enemyTextsRef.current.length === 0
      ) {
        app.ticker.stop();
        let winMessage = "";
        if (allyTextsRef.current.length > 0) {
          winMessage = `${allyTextsRef.current[0].unitName}\nWINS!!`;
          fetchApi(
            "/wins/create",
            "POST",
            (result: any) => {
              console.log(result);
            },
            (error: unknown) => {
              console.error("APIエラー:", error);
            },
            { winner: unitId, loser: enemyUnitId }
          );
        } else if (enemyTextsRef.current.length > 0) {
          winMessage = `${enemyTextsRef.current[0].unitName}\nWINS!!`;
          fetchApi(
            "/wins/create",
            "POST",
            (result: any) => {
              console.log(result);
            },
            (error: unknown) => {
              console.error("APIエラー:", error);
            },
            { winner: enemyUnitId, loser: unitId }
          );
        } else {
          winMessage = "DRAW!";
        }
        const style = new PIXI.TextStyle({
          fontSize: 24,
          fill: 0xffffff,
          fontWeight: "bold",
          align: "center",
        });
        const winText = new PIXI.Text(winMessage, style);
        winText.anchor.set(0.5);
        winText.x = app.screen.width / 2;
        winText.y = app.screen.height / 2;

        // 黒い半透明の帯をwinTextの背景に作成
        const band = new PIXI.Graphics();
        band.beginFill(0x000000, 0.5);
        const paddingX = 200;
        const paddingY = 10;
        band.drawRect(
          winText.x - winText.width / 2 - paddingX,
          winText.y - winText.height / 2 - paddingY,
          winText.width + paddingX * 2,
          winText.height + paddingY * 2
        );
        band.endFill();

        app.stage.addChild(band);
        app.stage.addChild(winText);
      }
    });
  };

  return <div ref={pixiContainerRef} />;
}
