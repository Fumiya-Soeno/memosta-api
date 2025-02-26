"use client";

import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { fetchApi } from "../../../pages/helpers/api";
import { UnitDataType } from "../../types/unit";
import { DamageText, updateDamageTexts } from "../utils/DamageTextUtil";
import { updateUnitHPBar } from "../utils/updateHPBar";

import CanvasContainer from "../components/CanvasContainer";

import { SkillManager } from "../skills/SkillManager";
import { SpecialManager } from "../specials/SpecialManager";

interface PixiCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: number;
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
    skill_name: "",
    special_name: "メテオ",
  },
];

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
  const crossBurstsRef = useRef<any[]>([]); // CrossBurst型略
  const spreadBulletsRef = useRef<any[]>([]); // PenetratingSpreadBullet型略
  const echoBladeEffectsRef = useRef<any[]>([]); // EchoBladeEffect型略
  const guardianFallEffectsRef = useRef<any[]>([]); // GuardianFallEffect型略
  const blitzShockEffectsRef = useRef<any[]>([]); // BlitzShockEffect型略
  const spiralShotEffectsRef = useRef<any[]>([]); // SpiralShotEffect型略
  const flameEdgeEffectsRef = useRef<any[]>([]);
  const lorenzBurstEffectsRef = useRef<any[]>([]);
  const parabolicLauncherEffects = useRef<any[]>([]);

  const poisonFogsRef = useRef<any[]>([]); // PoisonFog型略
  const earthquakeEffectsRef = useRef<any[]>([]); // EarthquakeEffect型略
  const powerUpEffectsRef = useRef<any[]>([]); // PowerUpEffect型略
  const damageWallEffectsRef = useRef<any[]>([]);
  const meteorEffectsRef = useRef<any[]>([]);

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
    const allyTexts: any[] = sortedAllies.map((unit) => {
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
    const enemyTexts: any[] = sortedEnemies.map((unit) => {
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
