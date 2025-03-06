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

import { getActiveUnitId } from "../../../helpers/activeUnitHelper";

interface PixiCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: number;
}

async function redirectRandomUnfortUnit(unitId: number | null) {
  if (!unitId) return;
  fetchApi(
    `/enemy_unit/unfought?id=${unitId}`,
    "GET",
    (result: { unitId: number }) => {
      window.location.href = `/?id=${result.unitId}`;
    },
    (error: unknown) => {
      console.error("APIエラー:", error);
    }
  );
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

  const [allyUnitName, setAllyUnitName] = useState<string>("");
  const allyUnitNameRef = useRef<string>("");

  const [enemyUnitName, setEnemyUnitName] = useState<string>("");
  const enemyUnitNameRef = useRef<string>("");

  useEffect(() => {
    const app = new PIXI.Application({ width, height, backgroundColor });

    // PixiCanvasをスクロール可能にする
    app.renderer.plugins.interaction.autoPreventDefault = false;
    if (app.renderer.view.style) app.renderer.view.style.touchAction = "auto";

    if (pixiContainerRef.current) {
      pixiContainerRef.current.appendChild(app.view as HTMLCanvasElement);
    }
    appRef.current = app;
    setUnitId(getActiveUnitId());
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

  const placeEmptyUnitText = () => {
    const app = appRef.current;
    if (!app) return;
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
  };

  // id指定がない場合、Pixi画面上にメッセージを表示
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    // URLにidパラメータが存在しなければ
    if (!searchParams?.get("id")) placeEmptyUnitText();
  }, [searchParams]);

  // 味方ユニットテキストの生成と配置（非同期に対応）
  useEffect(() => {
    if (!allyData) return;
    const app = appRef.current;
    if (!app || allyTextsRef.current.length !== 0) return;
    (async () => {
      allyTextsRef.current = await createUnitTexts(app, allyData, true);
      const newName = allyTextsRef.current[0].unitName;
      setAllyUnitName(newName);
      allyUnitNameRef.current = newName;
    })();
  }, [allyData, width, height]);

  // 敵ユニットテキストの生成と配置（非同期に対応）
  useEffect(() => {
    if (!enemyData) return;
    const app = appRef.current;
    if (!app || enemyTextsRef.current.length !== 0) return;
    (async () => {
      enemyTextsRef.current = await createUnitTexts(app, enemyData, false);
      if (!enemyUnitId) setEnemyUnitId(enemyTextsRef.current[0].unit.id);
      const newName = enemyTextsRef.current[0]?.unitName ?? "";
      if (newName === "") placeEmptyUnitText();
      setEnemyUnitName(newName);
      enemyUnitNameRef.current = newName;
    })();
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
        let outcome = "";
        if (allyTextsRef.current.length > 0) {
          outcome = "YOU WINS!!";
          // 同名ユニットの場合は勝敗登録しない
          if (allyUnitNameRef.current !== enemyUnitNameRef.current) {
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
          }
        } else if (enemyTextsRef.current.length > 0) {
          outcome = "YOU LOSE";
          // 同名ユニットの場合は勝敗登録しない
          if (allyUnitNameRef.current !== enemyUnitNameRef.current) {
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
          }
        } else {
          outcome = "DRAW!";
        }

        // テキストスタイルの定義
        const bigStyle = new PIXI.TextStyle({
          fontSize: 24,
          fill: 0xffffff,
          fontWeight: "bold",
          align: "center",
        });
        const vsTextStyle = new PIXI.TextStyle({
          fontSize: 14,
          fill: 0xeeeeee,
          align: "center",
        });
        const smallStyle = new PIXI.TextStyle({
          fontSize: 22,
          fill: 0x4444ff,
          fontWeight: "bold",
          align: "center",
        });

        // 1行目：勝敗結果
        const outcomeText = new PIXI.Text(outcome, bigStyle);
        outcomeText.anchor.set(0.5);
        outcomeText.x = app.screen.width / 2;
        outcomeText.y = app.screen.height / 2 - 40;

        // 2行目：自軍 VS 敵軍
        const vsMessage = `(YOU) ${allyUnitNameRef.current}  vs  ${enemyUnitNameRef.current}`;
        const vsText = new PIXI.Text(vsMessage, vsTextStyle);
        vsText.anchor.set(0.5);
        vsText.x = app.screen.width / 2;
        vsText.y = app.screen.height / 2;

        // 3行目：次のバトルへの案内
        const clickText = new PIXI.Text("クリックで次のバトルへ", smallStyle);
        clickText.anchor.set(0.5);
        clickText.x = app.screen.width / 2;
        clickText.y = app.screen.height / 2 + 40;
        clickText.eventMode = "dynamic";
        clickText.on("pointerdown", () => {
          redirectRandomUnfortUnit(unitId);
        });

        // クリック可能な背景用（半透明の帯）を追加（必要に応じて）
        const band = new PIXI.Graphics();
        band.beginFill(0x000000, 0.9);
        const paddingX = 200;
        const paddingY = 10;
        // 背景は全テキストを囲むように計算
        band.drawRect(
          outcomeText.x -
            Math.max(outcomeText.width, vsText.width, clickText.width) / 2 -
            paddingX,
          outcomeText.y - outcomeText.height - paddingY,
          Math.max(outcomeText.width, vsText.width, clickText.width) +
            paddingX * 2,
          outcomeText.height + vsText.height + clickText.height + paddingY * 9
        );
        band.endFill();
        band.eventMode = "dynamic";
        band.on("pointerdown", () => {
          redirectRandomUnfortUnit(unitId);
        });

        // 下線を描画
        const underline = new PIXI.Graphics();
        underline.lineStyle(2, 0x4444ff, 1); // 線の太さ2px、色はsmallStyleのfillに合わせる
        // 下線はclickTextの下部中央に合わせる
        underline.moveTo(
          clickText.x - clickText.width / 2,
          clickText.y + clickText.height / 2 + 2
        );
        underline.lineTo(
          clickText.x + clickText.width / 2,
          clickText.y + clickText.height / 2 + 2
        );
        underline.eventMode = "none"; // クリックイベントが重ならないように設定

        // ステージに追加
        app.stage.addChild(band, outcomeText, vsText, clickText, underline);
      }
    });
  };

  return <div ref={pixiContainerRef} />;
}
