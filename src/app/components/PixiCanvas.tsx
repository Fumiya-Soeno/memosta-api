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

// レーザーオブジェクトの型
interface Laser {
  graphics: PIXI.Graphics;
  lifetime: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
  damage: number;
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

  // 攻撃用フレームカウンター
  const attackFrameCounter = useRef(0);
  // 発射中のレーザーを管理
  const lasersRef = useRef<Laser[]>([]);
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
    // 緑部分（残量）
    hpBar.beginFill(0x00ff00);
    hpBar.drawRect(
      -HP_BAR_WIDTH / 2,
      sandbagText.height / 2 + 5,
      greenWidth,
      HP_BAR_HEIGHT
    );
    hpBar.endFill();
    // 赤部分（減少分）
    hpBar.beginFill(0xff0000);
    hpBar.drawRect(
      -HP_BAR_WIDTH / 2 + greenWidth,
      sandbagText.height / 2 + 5,
      HP_BAR_WIDTH - greenWidth,
      HP_BAR_HEIGHT
    );
    hpBar.endFill();
  };

  // ヘルパー：点と線分間の最短距離を求める
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
    // サンドバッグのテキスト（フォントサイズ20）
    const sandbagTextStyle = new PIXI.TextStyle({
      fontSize: 20,
      fill: 0x000000,
      fontWeight: "bold",
    });
    const sandbagText = new PIXI.Text("●", sandbagTextStyle);
    sandbagText.anchor.set(0.5);
    sandbagContainer.addChild(sandbagText);
    sandbagTextRef.current = sandbagText;

    // HPバー用のGraphicsオブジェクト
    const hpBar = new PIXI.Graphics();
    sandbagContainer.addChild(hpBar);

    // サンドバッグは画面上部中央に配置（Y座標は調整可能）
    sandbagContainer.x = app.screen.width / 2;
    sandbagContainer.y = app.screen.height / 4;
    app.stage.addChild(sandbagContainer);

    sandbagContainerRef.current = sandbagContainer;
    sandbagHPBarRef.current = hpBar;
    updateHPBar();

    // APIで active_unit/show から unitId を取得
    fetchApi("/active_unit/show", "GET", (result) => {
      const id = result?.rows[0]?.unit_id;
      if (id) setUnitId(id);
    });

    return () => {
      app.destroy(true, true);
    };
  }, [width, height, backgroundColor]);

  // unitId取得後に unit/edit API を実行
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

  // unitDataが取得されたら、各ユニットのPIXI.Textオブジェクトを生成し中央揃えで配置
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
      // APIのvectorに180°加算して進行方向を反転
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
      // 配置は画面下部（例：3/4位置）
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
      // 各キャラクターの移動更新（ラッピング付き）
      textsRef.current.forEach((ut) => {
        ut.text.x += ut.vx;
        ut.text.y += ut.vy;
        if (ut.text.x < 0) ut.text.x = app.screen.width;
        else if (ut.text.x > app.screen.width) ut.text.x = 0;
        if (ut.text.y < 0) ut.text.y = app.screen.height;
        else if (ut.text.y > app.screen.height) ut.text.y = 0;
      });

      // 攻撃用フレームカウンター更新
      attackFrameCounter.current++;

      // 5フレームごとに、.skill_nameが「ロックオンレーザー」のユニットが攻撃を発動
      if (attackFrameCounter.current % 5 === 0) {
        const attackerUnit = textsRef.current.find(
          (ut) => ut.unit.skill_name === "ロックオンレーザー"
        );
        if (attackerUnit && sandbagContainerRef.current) {
          const attackerPos = {
            x: attackerUnit.text.x,
            y: attackerUnit.text.y,
          };
          // サンドバッグの中心位置（コンテナの位置が基準）
          const sandbagContainer = sandbagContainerRef.current;
          const sandbagBounds = sandbagContainer.getBounds();
          const sandbagCenter = {
            x: sandbagBounds.x + sandbagBounds.width / 2,
            y: sandbagBounds.y + sandbagBounds.height / 2,
          };

          // 攻撃対象（サンドバッグ）とのベクトルを算出し正規化
          const dx = sandbagCenter.x - attackerPos.x;
          const dy = sandbagCenter.y - attackerPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const ndx = dx / dist;
          const ndy = dy / dist;
          // 仮の遠方点（画面外まで延長）
          const farPoint = {
            x: attackerPos.x + ndx * 1000,
            y: attackerPos.y + ndy * 1000,
          };

          // レーザーの描画（3px太さ、青色）
          const laserGfx = new PIXI.Graphics();
          laserGfx.lineStyle(3, 0x0000ff, 1);
          laserGfx.moveTo(attackerPos.x, attackerPos.y);
          laserGfx.lineTo(farPoint.x, farPoint.y);
          app.stage.addChild(laserGfx);

          // 攻撃ユニットの攻撃力に基づくダメージ（40%）
          const damage = attackerUnit.unit.attack * 0.4;
          // レーザーオブジェクトを生成（寿命3フレーム）
          lasersRef.current.push({
            graphics: laserGfx,
            lifetime: 3,
            start: { ...attackerPos },
            end: { ...farPoint },
            damage,
          });

          // レーザーのヒット判定として、サンドバッグ中心から線分までの距離が10px未満の場合とする
          const distance = pointToLineDistance(
            sandbagCenter,
            attackerPos,
            farPoint
          );
          if (distance < 10) {
            currentHPRef.current = Math.max(currentHPRef.current - damage, 0);
            updateHPBar();

            // ダメージ表示テキストの生成
            const dmgText = new PIXI.Text(
              damage.toFixed(1),
              new PIXI.TextStyle({
                fontSize: 16,
                fill: 0xff0000,
                fontWeight: "bold",
              })
            );
            dmgText.anchor.set(0.5);
            // サンドバッグ中心から±20pxのランダムなオフセットを付与
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
              lifetime: 30, // 30フレームでフェードアウト
              startX,
              startY,
              hVel: Math.random() * 2 - 1, // 水平ドリフト（-1〜+1px/frame）
              peakHeight: 20, // アーチの高さ
            });
          }
        }
      }

      // 発射中のレーザーの更新
      for (let i = lasersRef.current.length - 1; i >= 0; i--) {
        const laser = lasersRef.current[i];
        laser.lifetime -= 1;
        if (laser.lifetime <= 0) {
          app.stage.removeChild(laser.graphics);
          lasersRef.current.splice(i, 1);
        }
      }

      // ダメージ表示テキストの更新
      for (let i = damageTextsRef.current.length - 1; i >= 0; i--) {
        const dt = damageTextsRef.current[i];
        dt.age++;
        const progress = dt.age / dt.lifetime;
        dt.text.alpha = 1 - progress;
        // 横方向は一定の水平ドリフト
        dt.text.x = dt.startX + dt.hVel * dt.age;
        // 垂直方向はパラボリックな上昇（山なりの弧）
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
