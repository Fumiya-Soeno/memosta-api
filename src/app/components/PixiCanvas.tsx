"use client";

import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";

import { UnitDataType } from "../../types/unit";
import { fetchApi } from "../../../pages/helpers/api";

interface PixiCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: number;
}

interface UnitText {
  text: PIXI.Text;
  unit: UnitDataType;
  vx: number;
  vy: number;
}

// レーザーオブジェクトの型（ロックオンレーザー用）
interface Laser {
  graphics: PIXI.Graphics;
  lifetime: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
  damage: number;
}

// 十字バースト用の爆発オブジェクトの型
interface CrossBurst {
  graphics: PIXI.Graphics;
  age: number;
  expansionFrames: number;
  fadeFrames: number;
  maxRadius: number;
  damage: number;
  pos: { x: number; y: number };
}

// ダメージ表示用オブジェクトの型
interface DamageText {
  text: PIXI.Text;
  age: number;
  lifetime: number;
  startX: number;
  startY: number;
  hVel: number; // 水平ドリフト(px/frame)
  peakHeight: number; // アーチの高さ
}

export function PixiCanvas({
  width = 400,
  height = 600,
  backgroundColor = 0xffffff,
}: PixiCanvasProps) {
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const textsRef = useRef<UnitText[]>([]);
  const animationStartedRef = useRef(false);

  // 攻撃用フレームカウンター（全攻撃共通）
  const attackFrameCounter = useRef(0);
  // 発射中のレーザー（ロックオンレーザー）を管理
  const lasersRef = useRef<Laser[]>([]);
  // 発生中の十字バースト爆発を管理
  const crossBurstsRef = useRef<CrossBurst[]>([]);
  // ダメージ表示用オブジェクトを管理
  const damageTextsRef = useRef<DamageText[]>([]);

  // サンドバッグ用のrefとHP管理
  const sandbagContainerRef = useRef<PIXI.Container | null>(null);
  const sandbagHPBarRef = useRef<PIXI.Graphics | null>(null);
  const sandbagTextRef = useRef<PIXI.Text | null>(null);
  const currentHPRef = useRef(100);

  const HP_BAR_WIDTH = 20;
  const HP_BAR_HEIGHT = 1;

  const [unitData, setUnitData] = useState<UnitDataType[] | null>(null);
  const [unitId, setUnitId] = useState<number | null>(null);

  // HPバー更新関数（サンドバッグ用）
  const updateHPBar = () => {
    const hpBar = sandbagHPBarRef.current;
    const sandbagText = sandbagTextRef.current;
    if (!hpBar || !sandbagText) return;
    hpBar.clear();
    const maxHP = 100;
    const currentHP = currentHPRef.current;
    const hpRatio = currentHP / maxHP;
    const greenWidth = HP_BAR_WIDTH * hpRatio;
    hpBar.beginFill(0x00ff00);
    hpBar.drawRect(
      -HP_BAR_WIDTH / 2,
      sandbagText.height / 2 + 5,
      greenWidth,
      HP_BAR_HEIGHT
    );
    hpBar.endFill();
    hpBar.beginFill(0xff0000);
    hpBar.drawRect(
      -HP_BAR_WIDTH / 2 + greenWidth,
      sandbagText.height / 2 + 5,
      HP_BAR_WIDTH - greenWidth,
      HP_BAR_HEIGHT
    );
    hpBar.endFill();
  };

  // ヘルパー：点と線分間の最短距離を求める（ロックオンレーザー用）
  const pointToLineDistance = (
    point: { x: number; y: number },
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number }
  ) => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = len_sq !== 0 ? dot / len_sq : -1;
    let nearestX, nearestY;
    if (param < 0) {
      nearestX = lineStart.x;
      nearestY = lineStart.y;
    } else if (param > 1) {
      nearestX = lineEnd.x;
      nearestY = lineEnd.y;
    } else {
      nearestX = lineStart.x + param * C;
      nearestY = lineStart.y + param * D;
    }
    const dx = point.x - nearestX;
    const dy = point.y - nearestY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  useEffect(() => {
    const app = new PIXI.Application({
      width,
      height,
      backgroundColor,
    });
    if (pixiContainerRef.current) {
      pixiContainerRef.current.appendChild(app.view);
    }
    appRef.current = app;

    // サンドバッグの作成
    const sandbagContainer = new PIXI.Container();
    const sandbagTextStyle = new PIXI.TextStyle({
      fontSize: 20,
      fill: 0x000000,
      fontWeight: "bold",
    });
    const sandbagText = new PIXI.Text("●", sandbagTextStyle);
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

    textsRef.current.forEach((ut) => {
      app.stage.removeChild(ut.text);
    });
    textsRef.current = [];

    const textStyle = new PIXI.TextStyle({
      fontSize: 20,
      fill: 0x000000,
      fontWeight: "bold",
    });

    const unitTexts: UnitText[] = sortedUnits.map((unit) => {
      const text = new PIXI.Text(unit.name, textStyle);
      text.anchor.set(0.5);
      const angle = ((unit.vector + 180) * Math.PI) / 180;
      const vx = unit.speed * Math.cos(angle);
      const vy = unit.speed * Math.sin(angle);
      return { text, unit, vx, vy };
    });

    const totalWidth = unitTexts.reduce((sum, ut) => sum + ut.text.width, 0);
    const leftEdge = app.screen.width / 2 - totalWidth / 2;
    let currentX = leftEdge;
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
      // キャラクターの移動更新（ラッピング付き）
      textsRef.current.forEach((ut) => {
        ut.text.x += ut.vx;
        ut.text.y += ut.vy;
        if (ut.text.x < 0) ut.text.x = app.screen.width;
        else if (ut.text.x > app.screen.width) ut.text.x = 0;
        if (ut.text.y < 0) ut.text.y = app.screen.height;
        else if (ut.text.y > app.screen.height) ut.text.y = 0;
      });

      attackFrameCounter.current++;

      // ★ ロックオンレーザー攻撃（.skill_name === "ロックオンレーザー"）は既存の実装通り
      if (attackFrameCounter.current % 5 === 0) {
        const attackerUnit = textsRef.current.find(
          (ut) => ut.unit.skill_name === "ロックオンレーザー"
        );
        if (attackerUnit && sandbagContainerRef.current) {
          const attackerPos = {
            x: attackerUnit.text.x,
            y: attackerUnit.text.y,
          };
          const sandbagContainer = sandbagContainerRef.current;
          const sandbagBounds = sandbagContainer.getBounds();
          const sandbagCenter = {
            x: sandbagBounds.x + sandbagBounds.width / 2,
            y: sandbagBounds.y + sandbagBounds.height / 2,
          };
          const dx = sandbagCenter.x - attackerPos.x;
          const dy = sandbagCenter.y - attackerPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const ndx = dx / dist;
          const ndy = dy / dist;
          const farPoint = {
            x: attackerPos.x + ndx * 1000,
            y: attackerPos.y + ndy * 1000,
          };

          const laserGfx = new PIXI.Graphics();
          laserGfx.lineStyle(3, 0x0000ff, 1);
          laserGfx.moveTo(attackerPos.x, attackerPos.y);
          laserGfx.lineTo(farPoint.x, farPoint.y);
          app.stage.addChild(laserGfx);

          const damage = attackerUnit.unit.attack * 0.4;
          lasersRef.current.push({
            graphics: laserGfx,
            lifetime: 3,
            start: { ...attackerPos },
            end: { ...farPoint },
            damage,
          });

          const distance = pointToLineDistance(
            sandbagCenter,
            attackerPos,
            farPoint
          );
          if (distance < 10) {
            currentHPRef.current = Math.max(currentHPRef.current - damage, 0);
            updateHPBar();

            const dmgText = new PIXI.Text(
              damage.toFixed(1),
              new PIXI.TextStyle({
                fontSize: 16,
                fill: 0xff0000,
                fontWeight: "bold",
              })
            );
            dmgText.anchor.set(0.5);
            const randomOffsetX = Math.random() * 40 - 20;
            const randomOffsetY = Math.random() * 40 - 20;
            const startX = sandbagCenter.x + randomOffsetX;
            const startY = sandbagCenter.y + randomOffsetY;
            dmgText.x = startX;
            dmgText.y = startY;
            app.stage.addChild(dmgText);
            damageTextsRef.current.push({
              text: dmgText,
              age: 0,
              lifetime: 30,
              startX,
              startY,
              hVel: Math.random() * 2 - 1,
              peakHeight: 20,
            });
          }
        }
      }

      // ★ 十字バースト攻撃（.skill_name === "十字バースト"）を3フレームごとに発動
      // ※ 発射エフェクトはキャラクター中心から外側に向かって、6フレームかけて半径0→maxRadiusまで拡大、
      //   拡大完了後、fadeFrames（例：9フレーム）かけて透明化し消滅します。
      if (attackFrameCounter.current % 9 === 0) {
        const attackerUnit = textsRef.current.find(
          (ut) => ut.unit.skill_name === "十字バースト"
        );
        if (attackerUnit) {
          const attackerPos = {
            x: attackerUnit.text.x,
            y: attackerUnit.text.y,
          };
          // 4方向（上、下、左、右）に対して発射
          const directions = [
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
          ];
          const explosionOffset = 60; // 発射方向のオフセット（爆発発生位置）
          const damage = attackerUnit.unit.attack * 0.8;
          const expansionFrames = 6;
          const fadeFrames = 9;
          directions.forEach(({ dx, dy }) => {
            const pos = {
              x: attackerPos.x + dx * explosionOffset,
              y: attackerPos.y + dy * explosionOffset,
            };
            const explosion = new PIXI.Graphics();
            // 初期は半径0で描画
            explosion.beginFill(0xffa500);
            explosion.drawCircle(0, 0, 0);
            explosion.endFill();
            explosion.x = pos.x;
            explosion.y = pos.y;
            app.stage.addChild(explosion);
            crossBurstsRef.current.push({
              graphics: explosion,
              age: 0,
              expansionFrames,
              fadeFrames,
              maxRadius: 30,
              damage,
              pos,
            });
          });
        }
      }

      // レーザー（ロックオンレーザー）の更新
      for (let i = lasersRef.current.length - 1; i >= 0; i--) {
        const laser = lasersRef.current[i];
        laser.lifetime -= 1;
        if (laser.lifetime <= 0) {
          app.stage.removeChild(laser.graphics);
          lasersRef.current.splice(i, 1);
        }
      }

      // 十字バーストの爆発更新と衝突判定
      for (let i = crossBurstsRef.current.length - 1; i >= 0; i--) {
        const burst = crossBurstsRef.current[i];
        burst.age++;
        const appStage = app.stage;
        // 拡大フェーズ：age ≤ expansionFrames
        if (burst.age <= burst.expansionFrames) {
          const currentRadius =
            burst.maxRadius * (burst.age / burst.expansionFrames);
          burst.graphics.clear();
          burst.graphics.beginFill(0xffa500);
          burst.graphics.drawCircle(0, 0, currentRadius);
          burst.graphics.endFill();
          // 攻撃判定：拡大フェーズ中のみ（例：爆発半径 + サンドバッグの概ね半径10px以内）
          if (sandbagContainerRef.current) {
            const sandbagBounds = sandbagContainerRef.current.getBounds();
            const sandbagCenter = {
              x: sandbagBounds.x + sandbagBounds.width / 2,
              y: sandbagBounds.y + sandbagBounds.height / 2,
            };
            const dx = sandbagCenter.x - burst.pos.x;
            const dy = sandbagCenter.y - burst.pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < currentRadius + 10) {
              currentHPRef.current = Math.max(
                currentHPRef.current - burst.damage,
                0
              );
              updateHPBar();

              const dmgText = new PIXI.Text(
                burst.damage.toFixed(1),
                new PIXI.TextStyle({
                  fontSize: 16,
                  fill: 0xff0000,
                  fontWeight: "bold",
                })
              );
              dmgText.anchor.set(0.5);
              const randomOffsetX = Math.random() * 40 - 20;
              const randomOffsetY = Math.random() * 40 - 20;
              const startX = sandbagCenter.x + randomOffsetX;
              const startY = sandbagCenter.y + randomOffsetY;
              dmgText.x = startX;
              dmgText.y = startY;
              app.stage.addChild(dmgText);
              damageTextsRef.current.push({
                text: dmgText,
                age: 0,
                lifetime: 30,
                startX,
                startY,
                hVel: Math.random() * 2 - 1,
                peakHeight: 20,
              });
            }
          }
        } else {
          // フェードアウトフェーズ
          const fadeAge = burst.age - burst.expansionFrames;
          const alpha = 1 - fadeAge / burst.fadeFrames;
          burst.graphics.alpha = alpha;
        }
        if (burst.age >= burst.expansionFrames + burst.fadeFrames) {
          app.stage.removeChild(burst.graphics);
          crossBurstsRef.current.splice(i, 1);
        }
      }

      // ダメージ表示テキストの更新
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
