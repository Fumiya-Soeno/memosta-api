"use client";

import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { fetchApi } from "../../../pages/helpers/api";
import { UnitDataType } from "../../types/unit";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";

// Skill and special effect imports
import { UnitText as LaserUnitText, Laser } from "../skills/LockOnLaser";
import { processTeamLockOnLaserAttacks } from "../skills/LockOnLaserProcess";
import { processTeamCrossBurstAttacks } from "../skills/CrossBurstProcess";
import { processTeamPenetratingSpreadAttacks } from "../skills/PenetratingSpreadProcess";
import { processTeamEchoBladeAttacks } from "../skills/EchoBladeProcess";
import { processTeamGuardianFallAttacks } from "../skills/GuardianFallProcess";
import { processTeamBlitzShockAttacks } from "../skills/BlitzShockProcess";
import { processTeamSpiralShotAttacks } from "../skills/SpiralShotProcess";
import { processTeamFlameEdgeAttacks } from "../skills/FlameEdgeProcess";
import { processTeamLorenzBurstAttacks } from "../skills/LorenzBurstProcess";

interface PixiCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: number;
}

// ExtendedUnitText に追加プロパティを定義
export interface ExtendedUnitText extends LaserUnitText {
  vx: number;
  vy: number;
  powerUpMultiplier: number;
  baseAttack: number;
  hp: number;
  maxHp: number;
  team: "ally" | "enemy";
  hpBar: PIXI.Graphics;
}

// 仮の敵ユニットデータ（将来的にはAPIから取得）
const enemyData: UnitDataType[] = [
  {
    name: "あ",
    life: 50,
    attack: 3,
    speed: 4,
    vector: 30,
    position: 1,
    element_name: "火",
    skill_name: "フレイムエッジ",
    special_name: "",
  },
];

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
  const crossBurstsRef = useRef<any[]>([]); // CrossBurst型略
  const spreadBulletsRef = useRef<any[]>([]); // PenetratingSpreadBullet型略
  const poisonFogsRef = useRef<any[]>([]); // PoisonFog型略
  const earthquakeEffectsRef = useRef<any[]>([]); // EarthquakeEffect型略
  const powerUpEffectsRef = useRef<any[]>([]); // PowerUpEffect型略
  const echoBladeEffectsRef = useRef<any[]>([]); // EchoBladeEffect型略
  const guardianFallEffectsRef = useRef<any[]>([]); // GuardianFallEffect型略
  const blitzShockEffectsRef = useRef<any[]>([]); // BlitzShockEffect型略
  const spiralShotEffectsRef = useRef<any[]>([]); // SpiralShotEffect型略
  const flameEdgeEffectsRef = useRef<FlameEdgeEffect[]>([]);
  const lorenzBurstEffectsRef = useRef<LorenzBurstEffect[]>([]);
  const damageTextsRef = useRef<DamageText[]>([]);

  const [allyData, setAllyData] = useState<UnitDataType[] | null>(null);
  const [unitId, setUnitId] = useState<number | null>(null);
  const [enemyDataState, setEnemyDataState] =
    useState<UnitDataType[]>(enemyData);

  useEffect(() => {
    const app = new PIXI.Application({ width, height, backgroundColor });
    if (pixiContainerRef.current) {
      pixiContainerRef.current.appendChild(app.view);
    }
    appRef.current = app;
    fetchApi("/active_unit/show", "GET", (result) => {
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

  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    const sortedEnemies = [...enemyDataState].sort(
      (a, b) => b.position - a.position
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

      // 各チームのロックオンレーザー攻撃
      processTeamLockOnLaserAttacks(
        attackFrameCounter.current,
        allyTextsRef.current,
        enemyTextsRef.current,
        app,
        damageTextsRef.current,
        lasersRef.current
      );

      // 十字バースト攻撃
      processTeamCrossBurstAttacks({
        app,
        allies: allyTextsRef.current,
        enemies: enemyTextsRef.current,
        crossBursts: crossBurstsRef.current,
        damageTexts: damageTextsRef.current,
        counter: attackFrameCounter.current,
      });

      // 貫通拡散弾攻撃
      processTeamPenetratingSpreadAttacks({
        app,
        allyUnits: allyTextsRef.current,
        enemyUnits: enemyTextsRef.current,
        spreadBullets: spreadBulletsRef.current,
        updateTargetHP: (target, dmg) => {
          target.hp = Math.max(target.hp - dmg, 0);
        },
        damageTexts: damageTextsRef.current,
        counter: attackFrameCounter.current,
      });

      // エコーブレード攻撃
      processTeamEchoBladeAttacks({
        app,
        allyUnits: allyTextsRef.current,
        enemyUnits: enemyTextsRef.current,
        echoBladeEffects: echoBladeEffectsRef.current,
        updateTargetHP: (target, dmg) => {
          target.hp = Math.max(target.hp - dmg, 0);
        },
        damageTexts: damageTextsRef.current,
        attackFrame: attackFrameCounter.current,
      });

      // ガーディアンフォール攻撃
      processTeamGuardianFallAttacks({
        app,
        allyUnits: allyTextsRef.current,
        enemyUnits: enemyTextsRef.current,
        guardianEffects: guardianFallEffectsRef.current,
        updateTargetHP: (target, dmg) => {
          target.hp = Math.max(target.hp - dmg, 0);
        },
        damageTexts: damageTextsRef.current,
        counter: attackFrameCounter.current,
      });

      // ブリッツショック攻撃
      processTeamBlitzShockAttacks({
        app,
        allyUnits: allyTextsRef.current,
        enemyUnits: enemyTextsRef.current,
        blitzShockEffects: blitzShockEffectsRef.current,
        damageTexts: damageTextsRef.current,
        counter: attackFrameCounter.current,
        updateTargetHP: (target, dmg) => {
          target.hp = Math.max(target.hp - dmg, 0);
        },
      });

      // スパイラルショット攻撃
      processTeamSpiralShotAttacks({
        counter: attackFrameCounter.current,
        app,
        allyUnits: allyTextsRef.current,
        enemyUnits: enemyTextsRef.current,
        spiralShotEffects: spiralShotEffectsRef.current,
        updateTargetHP: (target, dmg) => {
          target.hp = Math.max(target.hp - dmg, 0);
        },
        damageTexts: damageTextsRef.current,
      });

      // ローレンツバースト攻撃
      processTeamLorenzBurstAttacks({
        counter: attackFrameCounter.current,
        app,
        allyUnits: allyTextsRef.current,
        enemyUnits: enemyTextsRef.current,
        lorenzBurstEffects: lorenzBurstEffectsRef.current,
        updateTargetHP: (target, dmg) => {
          target.hp = Math.max(target.hp - dmg, 0);
        },
        damageTexts: damageTextsRef.current,
      });

      // フレイムエッジ攻撃（プロセス関数に逃がす）
      processTeamFlameEdgeAttacks({
        app,
        allyUnits: allyTextsRef.current,
        enemyUnits: enemyTextsRef.current,
        flameEdgeEffects: flameEdgeEffectsRef.current,
        updateTargetHP: (target, dmg) => {
          target.hp = Math.max(target.hp - dmg, 0);
        },
        damageTexts: damageTextsRef.current,
        attackFrame: attackFrameCounter.current,
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
