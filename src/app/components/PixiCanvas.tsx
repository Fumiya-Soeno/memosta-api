"use client";

import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { fetchApi } from "../../../pages/helpers/api";
import { UnitDataType } from "../../types/unit";
import { DamageText } from "../utils/DamageTextUtil";

// 各スキル・必殺技のインポート
import {
  handleLockOnLaserAttack,
  UnitText as LaserUnitText,
  Laser,
} from "../skills/LockOnLaser";
import {
  handleCrossBurstAttack,
  updateCrossBursts,
  CrossBurst,
} from "../skills/CrossBurst";
import {
  handlePenetratingSpreadAttack,
  updatePenetratingSpreadBullets,
  PenetratingSpreadBullet,
} from "../skills/PenetratingSpread";
import {
  handlePoisonFogAttack,
  updatePoisonFogs,
  PoisonFog,
} from "../specials/PoisonFog";
import {
  handleEarthquakeAttack,
  updateEarthquakeEffects,
  EarthquakeEffect,
  EarthquakeUnit,
} from "../specials/Earthquake";
import {
  handlePowerUpAttack,
  updatePowerUpEffects,
  PowerUpEffect,
} from "../specials/PowerUp";
import {
  handleEchoBladeAttack,
  updateEchoBladeEffects,
  EchoBladeEffect,
} from "../skills/EchoBlade";
import {
  handleGuardianFallAttack,
  updateGuardianFallEffects,
  GuardianFallEffect,
} from "../skills/GuardianFall";

// サンドバッグ関連のインポート
import {
  createSandbag,
  updateHPBar as updateSandbagHPBar,
  Sandbag,
  SANDBAG_MAX_HP,
} from "../sandbag/Sandbag";

interface PixiCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: number;
}

// ExtendedUnitText にパワーアップ用のプロパティを追加
export interface ExtendedUnitText extends LaserUnitText {
  vx: number;
  vy: number;
  powerUpMultiplier: number; // 通常は 1.0、バフ中は 1.3
  baseAttack: number; // 元の攻撃力
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
  const spreadBulletsRef = useRef<PenetratingSpreadBullet[]>([]);
  const poisonFogsRef = useRef<PoisonFog[]>([]);
  const earthquakeEffectsRef = useRef<EarthquakeEffect[]>([]);
  const powerUpEffectsRef = useRef<PowerUpEffect[]>([]);
  const echoBladeEffectsRef = useRef<EchoBladeEffect[]>([]);
  const guardianFallEffectsRef = useRef<GuardianFallEffect[]>([]);
  const damageTextsRef = useRef<DamageText[]>([]);

  // サンドバッグ関連
  const sandbagDataRef = useRef<Sandbag | null>(null);

  const currentHPRef = useRef(SANDBAG_MAX_HP);

  const [unitData, setUnitData] = useState<UnitDataType[] | null>(null);
  const [unitId, setUnitId] = useState<number | null>(null);

  // PIXI Application とサンドバッグの生成
  useEffect(() => {
    const app = new PIXI.Application({ width, height, backgroundColor });
    if (pixiContainerRef.current) {
      pixiContainerRef.current.appendChild(app.view);
    }
    appRef.current = app;

    // サンドバッグ作成（画面中央上部）
    const sandbag = createSandbag(
      app,
      app.screen.width / 2,
      app.screen.height / 4
    );
    sandbagDataRef.current = sandbag;
    updateSandbagHPBar(sandbag, currentHPRef.current);

    fetchApi("/active_unit/show", "GET", (result) => {
      const id = result?.rows[0]?.unit_id;
      if (id) setUnitId(id);
    });

    return () => {
      app.destroy(true, true);
    };
  }, [width, height, backgroundColor]);

  // APIからユニットデータ取得
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

  // ユニットテキストの生成
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
      return {
        text,
        unit,
        vx,
        vy,
        powerUpMultiplier: 1.0,
        baseAttack: unit.attack,
      };
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

  // メインのアニメーション処理
  const handleStart = () => {
    const app = appRef.current;
    if (!app || animationStartedRef.current) return;
    animationStartedRef.current = true;

    app.ticker.add(() => {
      // ユニットテキストの移動更新（画面端ラッピング）
      textsRef.current.forEach((ut) => {
        ut.text.x += ut.vx;
        ut.text.y += ut.vy;
        if (ut.text.x < 0) ut.text.x = app.screen.width;
        else if (ut.text.x > app.screen.width) ut.text.x = 0;
        if (ut.text.y < 0) ut.text.y = app.screen.height;
        else if (ut.text.y > app.screen.height) ut.text.y = 0;
        // パワーアップ中なら攻撃力を更新
        if (ut.unit.special_name === "パワーアップ") {
          ut.unit.attack = ut.baseAttack * ut.powerUpMultiplier;
        }
      });
      attackFrameCounter.current++;

      // ロックオンレーザー攻撃（5フレームごと）
      if (attackFrameCounter.current % 5 === 0) {
        handleLockOnLaserAttack({
          app,
          texts: textsRef.current,
          sandbagContainer: sandbagDataRef.current!.container,
          currentHPRef,
          updateHPBar: () =>
            updateSandbagHPBar(sandbagDataRef.current!, currentHPRef.current),
          damageTexts: damageTextsRef.current,
          lasers: lasersRef.current,
        });
      }

      // 十字バースト攻撃（9フレームごと）
      if (attackFrameCounter.current % 9 === 0) {
        handleCrossBurstAttack({
          app,
          texts: textsRef.current,
          crossBursts: crossBurstsRef.current,
        });
      }
      updateCrossBursts({
        app,
        crossBursts: crossBurstsRef.current,
        sandbagContainer: sandbagDataRef.current!.container,
        currentHPRef,
        updateHPBar: () =>
          updateSandbagHPBar(sandbagDataRef.current!, currentHPRef.current),
        damageTexts: damageTextsRef.current,
      });

      // 貫通拡散弾攻撃（10フレームごと）
      if (attackFrameCounter.current % 10 === 0) {
        handlePenetratingSpreadAttack({
          app,
          texts: textsRef.current,
          spreadBullets: spreadBulletsRef.current,
        });
      }
      updatePenetratingSpreadBullets({
        app,
        spreadBullets: spreadBulletsRef.current,
        sandbagContainer: sandbagDataRef.current!.container,
        currentHPRef,
        updateHPBar: () =>
          updateSandbagHPBar(sandbagDataRef.current!, currentHPRef.current),
        damageTexts: damageTextsRef.current,
      });

      // 毒霧攻撃（special_name === "毒霧"、80フレームごと）
      if (attackFrameCounter.current % 80 === 0) {
        handlePoisonFogAttack({
          app,
          texts: textsRef.current,
          poisonFogs: poisonFogsRef.current,
        });
      }
      updatePoisonFogs({
        app,
        poisonFogs: poisonFogsRef.current,
        sandbagContainer: sandbagDataRef.current!.container,
        currentHPRef,
        updateHPBar: () =>
          updateSandbagHPBar(sandbagDataRef.current!, currentHPRef.current),
        damageTexts: damageTextsRef.current,
      });

      // アースクエイク攻撃（special_name === "アースクエイク"、100フレームごと）
      if (attackFrameCounter.current % 100 === 0) {
        handleEarthquakeAttack({
          app,
          texts: textsRef.current as unknown as EarthquakeUnit[],
          earthquakeEffects: earthquakeEffectsRef.current,
        });
      }
      updateEarthquakeEffects({
        app,
        earthquakeEffects: earthquakeEffectsRef.current,
        sandbagContainer: sandbagDataRef.current!.container,
        currentHPRef,
        updateHPBar: () =>
          updateSandbagHPBar(sandbagDataRef.current!, currentHPRef.current),
        damageTexts: damageTextsRef.current,
      });

      // エコーブレード攻撃（skill_name === "エコーブレード"、15フレームごと）
      if (attackFrameCounter.current % 15 === 0) {
        handleEchoBladeAttack({
          app,
          texts: textsRef.current,
          sandbagContainer: sandbagDataRef.current!.container,
          echoBladeEffects: echoBladeEffectsRef.current,
        });
      }
      updateEchoBladeEffects({
        app,
        echoBladeEffects: echoBladeEffectsRef.current,
        sandbagContainer: sandbagDataRef.current!.container,
        currentHPRef,
        updateHPBar: () =>
          updateSandbagHPBar(sandbagDataRef.current!, currentHPRef.current),
        damageTexts: damageTextsRef.current,
      });

      // ガーディアンフォール攻撃（skill_name === "ガーディアンフォール"、6フレームごと）
      if (attackFrameCounter.current % 6 === 0) {
        // ガーディアンフォールの隕石召喚
        handleGuardianFallAttack({
          app,
          texts: textsRef.current,
          guardianEffects: guardianFallEffectsRef.current,
        });
      }
      updateGuardianFallEffects({
        app,
        guardianEffects: guardianFallEffectsRef.current,
        sandbagContainer: sandbagDataRef.current!.container,
        currentHPRef,
        updateHPBar: () =>
          updateSandbagHPBar(sandbagDataRef.current!, currentHPRef.current),
        damageTexts: damageTextsRef.current,
      });

      // パワーアップ攻撃（special_name === "パワーアップ"、40フレームごと）
      if (attackFrameCounter.current % 40 === 0) {
        handlePowerUpAttack({
          app,
          texts: textsRef.current,
          powerUpEffects: powerUpEffectsRef.current,
        });
      }
      updatePowerUpEffects({
        powerUpEffects: powerUpEffectsRef.current,
      });

      // 各レーザーの更新
      for (let i = lasersRef.current.length - 1; i >= 0; i--) {
        const laser = lasersRef.current[i];
        laser.lifetime -= 1;
        if (laser.lifetime <= 0) {
          app.stage.removeChild(laser.graphics);
          lasersRef.current.splice(i, 1);
        }
      }
      // ダメージ表示の更新
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
