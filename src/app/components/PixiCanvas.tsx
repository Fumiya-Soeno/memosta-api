"use client";

import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { fetchApi } from "../../../pages/helpers/api";
import { UnitDataType } from "../../types/unit";
import { DamageText } from "../utils/DamageTextUtil";

// Skill and special effect imports
import { UnitText as LaserUnitText, Laser } from "../skills/LockOnLaser";
import { processTeamLockOnLaserAttacks } from "../skills/LockOnLaserProcess";
import { processTeamCrossBurstAttacks } from "../skills/CrossBurstProcess";
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
import {
  handleBlitzShockAttack,
  updateBlitzShockEffects,
  BlitzShockEffect,
} from "../skills/BlitzShock";
import {
  handleSpiralShotAttack,
  updateSpiralShotEffects,
  SpiralShotEffect,
} from "../skills/SpiralShot";
import {
  handleFlameEdgeAttack,
  updateFlameEdgeEffects,
  FlameEdgeEffect,
} from "../skills/FlameEdge";
import {
  handleLorenzBurstAttack,
  updateLorenzBurstEffects,
  LorenzBurstEffect,
} from "../skills/LorenzBurst";

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
    skill_name: "十字バースト",
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

function getFarthestTarget(
  attacker: ExtendedUnitText,
  targets: ExtendedUnitText[]
): ExtendedUnitText | null {
  if (targets.length === 0) return null;
  let farthest = targets[0];
  let maxDist = Math.hypot(
    attacker.text.x - farthest.text.x,
    attacker.text.y - farthest.text.y
  );
  for (const t of targets) {
    const d = Math.hypot(
      attacker.text.x - t.text.x,
      attacker.text.y - t.text.y
    );
    if (d > maxDist) {
      maxDist = d;
      farthest = t;
    }
  }
  return farthest;
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
  const crossBurstsRef = useRef<CrossBurst[]>([]);
  const spreadBulletsRef = useRef<PenetratingSpreadBullet[]>([]);
  const poisonFogsRef = useRef<PoisonFog[]>([]);
  const earthquakeEffectsRef = useRef<EarthquakeEffect[]>([]);
  const powerUpEffectsRef = useRef<PowerUpEffect[]>([]);
  const echoBladeEffectsRef = useRef<EchoBladeEffect[]>([]);
  const guardianFallEffectsRef = useRef<GuardianFallEffect[]>([]);
  const blitzShockEffectsRef = useRef<BlitzShockEffect[]>([]);
  const spiralShotEffectsRef = useRef<SpiralShotEffect[]>([]);
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

      processTeamLockOnLaserAttacks(
        attackFrameCounter.current,
        allyTextsRef.current,
        enemyTextsRef.current,
        app,
        damageTextsRef.current,
        lasersRef.current
      );

      processTeamCrossBurstAttacks({
        app,
        allies: allyTextsRef.current,
        enemies: enemyTextsRef.current,
        crossBursts: crossBurstsRef.current,
        damageTexts: damageTextsRef.current,
        counter: attackFrameCounter.current,
      });

      // 貫通拡散弾攻撃
      if (attackFrameCounter.current % 10 === 0) {
        [allyTextsRef, enemyTextsRef].forEach((textRef) => {
          // skill_name が "貫通拡散弾" のユニットのみ処理
          // （process内でフィルタリングも行っています）
          // ここでは各ユニットグループごとに1行で呼び出す
          // ※同様の形で他スキルも処理する
          import("../skills/PenetratingSpread").then(
            ({ handlePenetratingSpreadAttack }) => {
              handlePenetratingSpreadAttack({
                app,
                texts: textRef.current.filter(
                  (ut) => ut.unit.skill_name === "貫通拡散弾"
                ),
                spreadBullets: spreadBulletsRef.current,
              });
            }
          );
        });
      }
      updatePenetratingSpreadBullets({
        app,
        spreadBullets: spreadBulletsRef.current,
        allyUnits: allyTextsRef.current,
        enemyUnits: enemyTextsRef.current,
        updateTargetHP: (target, damage) => {
          target.hp = Math.max(target.hp - damage, 0);
        },
        damageTexts: damageTextsRef.current,
      });

      // エコーブレード攻撃
      if (attackFrameCounter.current % 7 === 0) {
        allyTextsRef.current
          .filter((ally) => ally.unit.skill_name === "エコーブレード")
          .forEach((ally) => {
            const target = getNearestTarget(ally, enemyTextsRef.current);
            if (target) {
              const targetContainer = new PIXI.Container();
              targetContainer.x = target.text.x;
              targetContainer.y = target.text.y;
              handleEchoBladeAttack({
                app,
                texts: [ally],
                targetContainer,
                echoBladeEffects: echoBladeEffectsRef.current,
              });
            }
          });
        enemyTextsRef.current
          .filter((enemy) => enemy.unit.skill_name === "エコーブレード")
          .forEach((enemy) => {
            const target = getNearestTarget(enemy, allyTextsRef.current);
            if (target) {
              const targetContainer = new PIXI.Container();
              targetContainer.x = target.text.x;
              targetContainer.y = target.text.y;
              handleEchoBladeAttack({
                app,
                texts: [enemy],
                targetContainer,
                echoBladeEffects: echoBladeEffectsRef.current,
              });
            }
          });
      }
      updateEchoBladeEffects({
        app,
        echoBladeEffects: echoBladeEffectsRef.current,
        allyUnits: allyTextsRef.current,
        enemyUnits: enemyTextsRef.current,
        updateTargetHP: (target, dmg) => {
          target.hp = Math.max(target.hp - dmg, 0);
        },
        damageTexts: damageTextsRef.current,
      });

      // ガーディアンフォール攻撃
      if (attackFrameCounter.current % 6 === 0) {
        allyTextsRef.current
          .filter((ally) => ally.unit.skill_name === "ガーディアンフォール")
          .forEach((ally) => {
            const target = getNearestTarget(ally, enemyTextsRef.current);
            if (target) {
              handleGuardianFallAttack({
                app,
                texts: [ally],
                guardianEffects: guardianFallEffectsRef.current,
              });
            }
          });
        enemyTextsRef.current
          .filter((enemy) => enemy.unit.skill_name === "ガーディアンフォール")
          .forEach((enemy) => {
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
        allyUnits: allyTextsRef.current,
        enemyUnits: enemyTextsRef.current,
        updateTargetHP: (target, damage) => {
          target.hp = Math.max(target.hp - damage, 0);
        },
        damageTexts: damageTextsRef.current,
      });

      // ブリッツショック攻撃
      if (attackFrameCounter.current % 7 === 0) {
        allyTextsRef.current
          .filter((ally) => ally.unit.skill_name === "ブリッツショック")
          .forEach((ally) => {
            const farthest = getFarthestTarget(ally, enemyTextsRef.current);
            if (farthest) {
              handleBlitzShockAttack({
                app,
                texts: [ally],
                blitzShockEffects: blitzShockEffectsRef.current,
                farthestTarget: farthest,
              });
            }
          });
        enemyTextsRef.current
          .filter((enemy) => enemy.unit.skill_name === "ブリッツショック")
          .forEach((enemy) => {
            const farthest = getFarthestTarget(enemy, allyTextsRef.current);
            if (farthest) {
              handleBlitzShockAttack({
                app,
                texts: [enemy],
                blitzShockEffects: blitzShockEffectsRef.current,
                farthestTarget: farthest,
              });
            }
          });
      }
      updateBlitzShockEffects({
        app,
        blitzShockEffects: blitzShockEffectsRef.current,
        allyUnits: allyTextsRef.current,
        enemyUnits: enemyTextsRef.current,
        updateTargetHP: (target, dmg) => {
          target.hp = Math.max(target.hp - dmg, 0);
        },
        damageTexts: damageTextsRef.current,
      });

      // スパイラルショット攻撃（2フレームごと）
      if (attackFrameCounter.current % 2 === 0) {
        allyTextsRef.current
          .filter((ally) => ally.unit.skill_name === "スパイラルショット")
          .forEach((ally) => {
            const target = getNearestTarget(ally, enemyTextsRef.current);
            if (target) {
              handleSpiralShotAttack({
                app,
                texts: [ally],
                spiralShotEffects: spiralShotEffectsRef.current,
                target,
              });
            }
          });
        enemyTextsRef.current
          .filter((enemy) => enemy.unit.skill_name === "スパイラルショット")
          .forEach((enemy) => {
            const target = getNearestTarget(enemy, allyTextsRef.current);
            if (target) {
              handleSpiralShotAttack({
                app,
                texts: [enemy],
                spiralShotEffects: spiralShotEffectsRef.current,
                target,
              });
            }
          });
      }
      updateSpiralShotEffects({
        app,
        spiralShotEffects: spiralShotEffectsRef.current,
        updateTargetHP: (target, dmg) => {
          target.hp = Math.max(target.hp - dmg, 0);
        },
        damageTexts: damageTextsRef.current,
      });

      // ローレンツバースト攻撃（12フレームごと）
      if (attackFrameCounter.current % 12 === 0) {
        allyTextsRef.current
          .filter((ally) => ally.unit.skill_name === "ローレンツバースト")
          .forEach((ally) => {
            handleLorenzBurstAttack({
              app,
              texts: [ally],
              lorenzBurstEffects: lorenzBurstEffectsRef.current,
            });
          });
        enemyTextsRef.current
          .filter((enemy) => enemy.unit.skill_name === "ローレンツバースト")
          .forEach((enemy) => {
            handleLorenzBurstAttack({
              app,
              texts: [enemy],
              lorenzBurstEffects: lorenzBurstEffectsRef.current,
            });
          });
      }
      updateLorenzBurstEffects({
        app,
        lorenzBurstEffects: lorenzBurstEffectsRef.current,
        allyUnits: allyTextsRef.current,
        enemyUnits: enemyTextsRef.current,
        updateTargetHP: (target, dmg) => {
          target.hp = Math.max(target.hp - dmg, 0);
        },
        damageTexts: damageTextsRef.current,
      });

      // フレイムエッジ攻撃（8フレームごと）
      if (attackFrameCounter.current % 8 === 0) {
        allyTextsRef.current
          .filter((ally) => ally.unit.skill_name === "フレイムエッジ")
          .forEach((ally) => {
            const target = getNearestTarget(ally, enemyTextsRef.current);
            if (target) {
              handleFlameEdgeAttack({
                app,
                texts: [ally],
                flameEdgeEffects: flameEdgeEffectsRef.current,
                target,
              });
            }
          });
        enemyTextsRef.current
          .filter((enemy) => enemy.unit.skill_name === "フレイムエッジ")
          .forEach((enemy) => {
            const target = getNearestTarget(enemy, allyTextsRef.current);
            if (target) {
              handleFlameEdgeAttack({
                app,
                texts: [enemy],
                flameEdgeEffects: flameEdgeEffectsRef.current,
                target,
              });
            }
          });
      }
      updateFlameEdgeEffects({
        app,
        flameEdgeEffects: flameEdgeEffectsRef.current,
        updateTargetHP: (target, dmg) => {
          target.hp = Math.max(target.hp - dmg, 0);
        },
        damageTexts: damageTextsRef.current,
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
