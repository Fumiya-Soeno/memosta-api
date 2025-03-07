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

  // HPバー表示用のPIXI.Graphicsをrefで保持
  const enemyHPBarRef = useRef<PIXI.Graphics | null>(null);
  const allyHPBarRef = useRef<PIXI.Graphics | null>(null);

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
    if (
      !allyData ||
      !enemyData ||
      allyData.length === 0 ||
      enemyData.length === 0
    )
      return;

    const startScreenContainer = new PIXI.Container();
    app.stage.addChild(startScreenContainer);

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

    let blinkCounter = 0;
    const blinkTicker = (delta: number) => {
      blinkCounter += delta;
      const alpha = 0.5 + 0.5 * Math.sin(blinkCounter * 0.1);
      band.alpha = alpha;
    };
    app.ticker.add(blinkTicker);

    startScreenContainer.eventMode = "dynamic";
    startScreenContainer.on("pointerdown", () => {
      if (
        allyTextsRef.current.length === 0 ||
        enemyTextsRef.current.length === 0
      )
        return;
      app.ticker.remove(blinkTicker);
      app.stage.removeChild(startScreenContainer);
      handleStart();
    });
  }, [allyData, enemyData]);

  const handleStart = () => {
    const app = appRef.current;
    if (!app || animationStartedRef.current) return;
    animationStartedRef.current = true;

    // HPバー（幅300px, 高さ5px）の作成
    const enemyHPBar = new PIXI.Graphics();
    enemyHPBar.x = (app.screen.width - 300) / 2;
    enemyHPBar.y = 20; // 画面上部
    app.stage.addChild(enemyHPBar);
    enemyHPBarRef.current = enemyHPBar;

    const allyHPBar = new PIXI.Graphics();
    allyHPBar.x = (app.screen.width - 300) / 2;
    allyHPBar.y = app.screen.height - 20 - 5; // 画面下部
    app.stage.addChild(allyHPBar);
    allyHPBarRef.current = allyHPBar;

    // タイマー表示用テキストの作成（右上、10pxマージン）
    const timerStyle = new PIXI.TextStyle({
      fontSize: 16,
      fill: 0x000000,
    });
    const timerText = new PIXI.Text("10.0", timerStyle);
    // 右上に配置（アンカー右上）
    timerText.anchor.set(1, 0);
    timerText.x = app.screen.width - 10;
    timerText.y = 10;
    app.stage.addChild(timerText);

    // ゲーム開始時刻を記録
    const startTime = Date.now();

    app.ticker.add(() => {
      // ユニットの移動更新と個別HPバー更新
      [...allyTextsRef.current, ...enemyTextsRef.current].forEach((ut) => {
        ut.text.x += ut.vx;
        ut.text.y += ut.vy;
        if (ut.text.x < 0) ut.text.x = app.screen.width;
        else if (ut.text.x > app.screen.width) ut.text.x = 0;
        if (ut.text.y < 0) ut.text.y = app.screen.height;
        else if (ut.text.y > app.screen.height) ut.text.y = 0;
        updateUnitHPBar(ut);
      });

      // 死亡ユニットの除去
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

      updateDamageTexts(app, damageTextsRef.current);

      // 残り時間の計算（開始からの経過時間）
      const elapsed = (Date.now() - startTime) / 1000;
      const remainingTime = Math.max(10 - elapsed, 0);
      timerText.text = remainingTime.toFixed(1);

      // 総体力と各グループの最大HPを計算
      const totalEnemyHP = enemyTextsRef.current.reduce(
        (sum, ut) => sum + ut.hp,
        0
      );
      const totalAllyHP = allyTextsRef.current.reduce(
        (sum, ut) => sum + ut.hp,
        0
      );
      const totalEnemyMaxHP = enemyTextsRef.current.reduce(
        (sum, ut) => sum + (ut.maxHp !== undefined ? ut.maxHp : ut.hp),
        0
      );
      const totalAllyMaxHP = allyTextsRef.current.reduce(
        (sum, ut) => sum + (ut.maxHp !== undefined ? ut.maxHp : ut.hp),
        0
      );
      const enemyRatio =
        totalEnemyMaxHP > 0 ? totalEnemyHP / totalEnemyMaxHP : 0;
      const allyRatio = totalAllyMaxHP > 0 ? totalAllyHP / totalAllyMaxHP : 0;

      // 敵HPバー更新
      if (enemyHPBarRef.current) {
        enemyHPBarRef.current.clear();
        enemyHPBarRef.current.beginFill(0xaaaaaa);
        enemyHPBarRef.current.drawRect(0, 0, 300, 5);
        enemyHPBarRef.current.endFill();
        enemyHPBarRef.current.beginFill(0x00ff00);
        enemyHPBarRef.current.drawRect(0, 0, 300 * enemyRatio, 5);
        enemyHPBarRef.current.endFill();
      }

      // 友軍HPバー更新
      if (allyHPBarRef.current) {
        allyHPBarRef.current.clear();
        allyHPBarRef.current.beginFill(0xaaaaaa);
        allyHPBarRef.current.drawRect(0, 0, 300, 5);
        allyHPBarRef.current.endFill();
        allyHPBarRef.current.beginFill(0x00ff00);
        allyHPBarRef.current.drawRect(0, 0, 300 * allyRatio, 5);
        allyHPBarRef.current.endFill();
      }

      // 勝敗判定：ユニットが全滅または時間切れの場合
      if (
        allyTextsRef.current.length === 0 ||
        enemyTextsRef.current.length === 0 ||
        remainingTime <= 0
      ) {
        app.ticker.stop();
        let outcome = "";
        if (remainingTime <= 0) {
          outcome = "DRAW!";
        } else if (allyTextsRef.current.length > 0) {
          outcome = "YOU WINS!!";
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

        const outcomeText = new PIXI.Text(outcome, bigStyle);
        outcomeText.anchor.set(0.5);
        outcomeText.x = app.screen.width / 2;
        outcomeText.y = app.screen.height / 2 - 40;

        const vsMessage = `(YOU) ${allyUnitNameRef.current}  vs  ${enemyUnitNameRef.current}`;
        const vsText = new PIXI.Text(vsMessage, vsTextStyle);
        vsText.anchor.set(0.5);
        vsText.x = app.screen.width / 2;
        vsText.y = app.screen.height / 2;

        const clickText = new PIXI.Text("クリックで次のバトルへ", smallStyle);
        clickText.anchor.set(0.5);
        clickText.x = app.screen.width / 2;
        clickText.y = app.screen.height / 2 + 40;
        clickText.eventMode = "dynamic";
        clickText.on("pointerdown", () => {
          redirectRandomUnfortUnit(unitId);
        });

        const band = new PIXI.Graphics();
        band.beginFill(0x000000, 0.9);
        const paddingX = 200;
        const paddingY = 10;
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

        const underline = new PIXI.Graphics();
        underline.lineStyle(2, 0x4444ff, 1);
        underline.moveTo(
          clickText.x - clickText.width / 2,
          clickText.y + clickText.height / 2 + 2
        );
        underline.lineTo(
          clickText.x + clickText.width / 2,
          clickText.y + clickText.height / 2 + 2
        );
        underline.eventMode = "none";

        app.stage.addChild(band, outcomeText, vsText, clickText, underline);
      }
    });
  };

  return <div ref={pixiContainerRef} />;
}
