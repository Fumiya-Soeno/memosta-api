"use client";

import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { fetchApi } from "../../../pages/helpers/api";
import { UnitDataType } from "../../types/unit";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";

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

// サンドバッグ関連のインポート（今回は「敵ユニット」や「友軍ユニット」を配置するため、個々のユニットとして扱います）
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

// ExtendedUnitText に、パワーアップ用のプロパティやHP、所属チーム情報を追加
export interface ExtendedUnitText extends LaserUnitText {
  vx: number;
  vy: number;
  powerUpMultiplier: number; // 通常は1.0、バフ中は1.3
  baseAttack: number; // 元の攻撃力
  hp: number;
  maxHp: number;
  team: "ally" | "enemy";
  hpBar: PIXI.Graphics;
}

// 仮の敵ユニットデータ（将来的にはAPIから取得）
const enemyData: UnitDataType[] = [
  // {
  //   name: "あ",
  //   life: 50,
  //   attack: 3,
  //   speed: 4,
  //   vector: 30,
  //   position: 1,
  //   element_name: "火",
  //   skill_name: "十字バースト",
  //   special_name: "パワーアップ",
  // },
  {
    name: "い",
    life: 30,
    attack: 4,
    speed: 7,
    vector: 60,
    position: 2,
    element_name: "水",
    skill_name: "ロックオンレーザー",
    special_name: "毒霧",
  },
  // {
  //   name: "う",
  //   life: 35,
  //   attack: 8,
  //   speed: 3,
  //   vector: 90,
  //   position: 3,
  //   element_name: "木",
  //   skill_name: "貫通拡散弾",
  //   special_name: "アースクエイク",
  // },
];

export function PixiCanvas({
  width = 400,
  height = 600,
  backgroundColor = 0xffffff,
}: PixiCanvasProps) {
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const allyTextsRef = useRef<ExtendedUnitText[]>([]);
  const enemyTextsRef = useRef<ExtendedUnitText[]>([]);
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

  // 旧サンドバッグ用 currentHPRef（今回は各ユニット個別管理するので参考用）
  const currentHPRef = useRef(SANDBAG_MAX_HP);

  // 友軍ユニット（API取得）と敵ユニット（仮ハードコード）の状態
  const [allyData, setAllyData] = useState<UnitDataType[] | null>(null);
  const [unitId, setUnitId] = useState<number | null>(null);
  const [enemyDataState, setEnemyDataState] =
    useState<UnitDataType[]>(enemyData);

  // PIXI Application の生成
  useEffect(() => {
    const app = new PIXI.Application({ width, height, backgroundColor });
    if (pixiContainerRef.current) {
      pixiContainerRef.current.appendChild(app.view);
    }
    appRef.current = app;

    // 友軍ユニットデータは API から取得
    fetchApi("/active_unit/show", "GET", (result) => {
      const id = result?.rows[0]?.unit_id;
      if (id) setUnitId(id);
    });

    return () => {
      app.destroy(true, true);
    };
  }, [width, height, backgroundColor]);

  // APIから友軍ユニットデータ取得
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

  // 友軍ユニットテキストおよびHPバーの生成
  useEffect(() => {
    if (!allyData) return;
    const app = appRef.current;
    if (!app) return;
    const sortedAllies = [...allyData].sort((a, b) => a.position - b.position);
    allyTextsRef.current.forEach((ut) => {
      app.stage.removeChild(ut.text);
      app.stage.removeChild(ut.hpBar);
    });
    allyTextsRef.current = [];
    const textStyle = { fontSize: 20, fill: 0x000000, fontWeight: "bold" };
    const allyTexts: ExtendedUnitText[] = sortedAllies.map((unit) => {
      const text = new PIXI.Text(unit.name, textStyle);
      text.anchor.set(0.5);
      const angle = ((unit.vector + 180) * Math.PI) / 180;
      const vx = unit.speed * Math.cos(angle);
      const vy = unit.speed * Math.sin(angle);
      const hpBar = new PIXI.Graphics();
      app.stage.addChild(hpBar);
      return {
        text,
        unit,
        vx,
        vy,
        powerUpMultiplier: 1.0,
        baseAttack: unit.attack,
        hp: unit.life,
        maxHp: unit.life,
        team: "ally",
        hpBar,
      };
    });
    const totalWidth = allyTexts.reduce((sum, ut) => sum + ut.text.width, 0);
    let currentX = app.screen.width / 2 - totalWidth / 2;
    allyTexts.forEach((ut) => {
      ut.text.x = currentX + ut.text.width / 2;
      ut.text.y = (app.screen.height * 3) / 4;
      currentX += ut.text.width;
      app.stage.addChild(ut.text);
    });
    allyTextsRef.current = allyTexts;
  }, [allyData, width, height]);

  // 敵ユニットテキストおよびHPバーの生成
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    const sortedEnemies = [...enemyDataState].sort(
      (a, b) => a.position - b.position
    );
    enemyTextsRef.current.forEach((ut) => {
      app.stage.removeChild(ut.text);
      app.stage.removeChild(ut.hpBar);
    });
    enemyTextsRef.current = [];
    const textStyle = { fontSize: 20, fill: 0xff0000, fontWeight: "bold" };
    const enemyTexts: ExtendedUnitText[] = sortedEnemies.map((unit) => {
      const text = new PIXI.Text(unit.name, textStyle);
      text.anchor.set(0.5);
      const angle = (unit.vector * Math.PI) / 180;
      const vx = unit.speed * Math.cos(angle);
      const vy = unit.speed * Math.sin(angle);
      const hpBar = new PIXI.Graphics();
      app.stage.addChild(hpBar);
      return {
        text,
        unit,
        vx,
        vy,
        powerUpMultiplier: 1.0,
        baseAttack: unit.attack,
        hp: unit.life,
        maxHp: unit.life,
        team: "enemy",
        hpBar,
      };
    });
    const totalWidth = enemyTexts.reduce((sum, ut) => sum + ut.text.width, 0);
    let currentX = app.screen.width / 2 - totalWidth / 2;
    enemyTexts.forEach((ut) => {
      ut.text.x = currentX + ut.text.width / 2;
      ut.text.y = app.screen.height / 4;
      currentX += ut.text.width;
      app.stage.addChild(ut.text);
    });
    enemyTextsRef.current = enemyTexts;
  }, [enemyDataState, width, height]);

  // ヘルパー：最も近いターゲットを取得（attacker自身は除外）
  function getNearestTarget(
    attacker: ExtendedUnitText,
    targets: ExtendedUnitText[]
  ): ExtendedUnitText | null {
    const validTargets = targets.filter((t) => t !== attacker);
    if (validTargets.length === 0) return null;
    let nearest = validTargets[0];
    let minDist = Math.hypot(
      attacker.text.x - nearest.text.x,
      attacker.text.y - nearest.text.y
    );
    for (const t of validTargets) {
      const d = Math.hypot(
        attacker.text.x - t.text.x,
        attacker.text.y - t.text.y
      );
      if (d < minDist) {
        minDist = d;
        nearest = t;
      }
    }
    return nearest;
  }

  // ヘルパー：各ユニットのHPバーを更新
  function updateUnitHPBar(unit: ExtendedUnitText) {
    const barWidth = 30;
    const barHeight = 4;
    const ratio = unit.hp / unit.maxHp;
    unit.hpBar.clear();
    unit.hpBar.beginFill(0x00ff00);
    unit.hpBar.drawRect(
      unit.text.x - barWidth / 2,
      unit.text.y + 10,
      barWidth * ratio,
      barHeight
    );
    unit.hpBar.endFill();
    unit.hpBar.beginFill(0xff0000);
    unit.hpBar.drawRect(
      unit.text.x - barWidth / 2 + barWidth * ratio,
      unit.text.y + 10,
      barWidth * (1 - ratio),
      barHeight
    );
    unit.hpBar.endFill();
  }

  // メインのアニメーション処理
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

      // HPが0以下のユニットは退場
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

      if (attackFrameCounter.current % 5 === 0) {
        allyTextsRef.current.forEach((ally) => {
          // ロックオンレーザー以外はスキップする
          if (ally.unit.skill_name !== "ロックオンレーザー") return;
          const target = getNearestTarget(ally, enemyTextsRef.current);
          if (target) {
            const targetContainer = new PIXI.Container();
            targetContainer.x = target.text.x;
            targetContainer.y = target.text.y;
            handleLockOnLaserAttack({
              app,
              texts: [ally],
              sandbagContainer: targetContainer,
              currentHPRef: { current: target.hp },
              updateHPBar: () => {
                // 敵ユニットのHPバー更新処理（必要なら実装）
              },
              damageTexts: damageTextsRef.current,
              lasers: lasersRef.current,
            });
            const dmg = ally.unit.attack * 0.4;
            target.hp = Math.max(target.hp - dmg, 0);
            showDamageText({
              app,
              damage: dmg,
              basePosition: { x: target.text.x, y: target.text.y },
              damageTexts: damageTextsRef.current,
            });
          }
        });
      }

      // 例：敵ユニットの攻撃（ロックオンレーザー攻撃、5フレームごと）
      if (attackFrameCounter.current % 5 === 0) {
        enemyTextsRef.current.forEach((enemy) => {
          // ロックオンレーザー以外はスキップする
          if (enemy.unit.skill_name !== "ロックオンレーザー") return;
          const target = getNearestTarget(enemy, allyTextsRef.current);
          if (target) {
            const targetContainer = new PIXI.Container();
            targetContainer.x = target.text.x;
            targetContainer.y = target.text.y;
            handleLockOnLaserAttack({
              app,
              texts: [enemy],
              sandbagContainer: targetContainer,
              currentHPRef: { current: target.hp },
              updateHPBar: () => {
                // 味方ユニットのHPバー更新処理（必要なら実装）
              },
              damageTexts: damageTextsRef.current,
              lasers: lasersRef.current,
            });
            const dmg = enemy.unit.attack * 0.4;
            target.hp = Math.max(target.hp - dmg, 0);
            showDamageText({
              app,
              damage: dmg,
              basePosition: { x: target.text.x, y: target.text.y },
              damageTexts: damageTextsRef.current,
            });
          }
        });
      }

      // ※ 他のスキルについても、各攻撃側のユニットから getNearestTarget() を用いて対象を決定し、各スキル関数を呼び出す

      // エコーブレード攻撃（skill_name === "エコーブレード"、7フレームごと）
      if (attackFrameCounter.current % 7 === 0) {
        allyTextsRef.current.forEach((ally) => {
          const target = getNearestTarget(ally, enemyTextsRef.current);
          if (target) {
            const targetContainer = new PIXI.Container();
            targetContainer.x = target.text.x;
            targetContainer.y = target.text.y;
            handleEchoBladeAttack({
              app,
              texts: [ally],
              sandbagContainer: targetContainer,
              echoBladeEffects: echoBladeEffectsRef.current,
            });
          }
        });
        enemyTextsRef.current.forEach((enemy) => {
          const target = getNearestTarget(enemy, allyTextsRef.current);
          if (target) {
            const targetContainer = new PIXI.Container();
            targetContainer.x = target.text.x;
            targetContainer.y = target.text.y;
            handleEchoBladeAttack({
              app,
              texts: [enemy],
              sandbagContainer: targetContainer,
              echoBladeEffects: echoBladeEffectsRef.current,
            });
          }
        });
      }
      updateEchoBladeEffects({
        app,
        echoBladeEffects: echoBladeEffectsRef.current,
        sandbagContainer: {
          getBounds: () => ({ x: 0, y: 0, width: 0, height: 0 }),
        } as any,
        currentHPRef,
        updateHPBar: () => {},
        damageTexts: damageTextsRef.current,
      });

      // ガーディアンフォール攻撃（skill_name === "ガーディアンフォール"、6フレームごと）
      if (attackFrameCounter.current % 6 === 0) {
        allyTextsRef.current.forEach((ally) => {
          const target = getNearestTarget(ally, enemyTextsRef.current);
          if (target) {
            handleGuardianFallAttack({
              app,
              texts: [ally],
              guardianEffects: guardianFallEffectsRef.current,
            });
          }
        });
        enemyTextsRef.current.forEach((enemy) => {
          const target = getNearestTarget(enemy, allyTextsRef.current);
          if (target) {
            handleGuardianFallAttack({
              app,
              texts: [enemy],
              guardianEffects: guardianFallEffectsRef.current,
            });
          }
        });
      }
      updateGuardianFallEffects({
        app,
        guardianEffects: guardianFallEffectsRef.current,
        sandbagContainer: {
          getBounds: () => ({ x: 0, y: 0, width: 0, height: 0 }),
        } as any,
        currentHPRef,
        updateHPBar: () => {},
        damageTexts: damageTextsRef.current,
      });

      // パワーアップ攻撃（special_name === "パワーアップ"、40フレームごと）
      if (attackFrameCounter.current % 40 === 0) {
        allyTextsRef.current.forEach((ally) => {
          if (ally.unit.special_name === "パワーアップ") {
            handlePowerUpAttack({
              app,
              texts: [ally],
              powerUpEffects: powerUpEffectsRef.current,
            });
          }
        });
        enemyTextsRef.current.forEach((enemy) => {
          if (enemy.unit.special_name === "パワーアップ") {
            handlePowerUpAttack({
              app,
              texts: [enemy],
              powerUpEffects: powerUpEffectsRef.current,
            });
          }
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
