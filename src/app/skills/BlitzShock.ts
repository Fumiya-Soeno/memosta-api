// skills/BlitzShock.ts
import * as PIXI from "pixi.js";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText";

export interface BlitzShockEffect {
  graphics: PIXI.Graphics;
  startX: number;
  startY: number;
  targetY: number;
  fallingSpeed: number;
  isStruck: boolean;
  lifetime: number; // impact phase lifetime (frames)
  damage: number;
  team: "ally" | "enemy";
}

/**
 * Helper function to draw a jagged blue lightning bolt.
 * Draws a polyline from (0,0) to (0, totalLength) with random horizontal deviations.
 * The graphics object's origin is at (0,0) and should be positioned externally.
 */
function drawJaggedLine(graphics: PIXI.Graphics, totalLength: number): void {
  graphics.clear();
  // Set line style: blue color, thickness 4.
  graphics.lineStyle(4, 0x0000ff, 1);
  const segments = 6;
  const segmentLength = totalLength / segments;
  graphics.moveTo(0, 0);
  let currentX = 0;
  for (let i = 1; i <= segments; i++) {
    const nextY = segmentLength * i;
    // Random horizontal deviation between -5 and 5.
    const deviation = (Math.random() - 0.5) * 10;
    currentX += deviation;
    graphics.lineTo(currentX, nextY);
  }
}

/**
 * handleBlitzShockAttack
 * 7フレームごとに、skill_name が "ブリッツショック" のユニットから、
 * 一番遠い敵ユニットの位置へ向けて、空から青い雷（落雷）を落とすエフェクトを発射します。
 * 落下フェーズは10フレームで、落下後は3フレームの衝撃フェーズで攻撃判定を行います。
 */
export function handleBlitzShockAttack(params: {
  app: PIXI.Application;
  texts: UnitText[]; // 発射元（通常は1体）
  blitzShockEffects: BlitzShockEffect[];
  farthestTarget: UnitText;
}) {
  const attacker = params.texts[0];
  if (!attacker || attacker.unit.skill_name !== "ブリッツショック") return;

  // 落雷対象の X 座標は farthestTarget のものを使用
  const targetX = params.farthestTarget.text.x;
  const targetY = params.farthestTarget.text.y;

  // 開始位置：画面上部 (y = -50) で、X座標は対象と同じ
  const startX = targetX;
  const startY = -50;

  // 落下フェーズは10フレームで完了するように fallingSpeed を計算
  const fallingSpeed = (targetY - startY) / 10;

  // 雷エフェクト用の Graphics を生成し、初期は jagged line を描画（現在は長さ0）
  const bolt = new PIXI.Graphics();
  drawJaggedLine(bolt, 0);
  bolt.x = startX;
  bolt.y = startY;
  params.app.stage.addChild(bolt);

  const effect: BlitzShockEffect = {
    graphics: bolt,
    startX,
    startY,
    targetY,
    fallingSpeed,
    isStruck: false,
    lifetime: 0,
    damage: attacker.unit.attack * 0.5,
    team: attacker.team,
  };

  params.blitzShockEffects.push(effect);
}

/**
 * updateBlitzShockEffects
 * 各ブリッツショックエフェクトを毎フレーム更新します。
 * 落下中は、y 座標を fallingSpeed 分だけ更新し、落下距離に応じた jagged line を再描画します。
 * 落下が完了すると、impact フェーズに移行し、爆発エフェクトとして青い円（半径20px）を描画し、
 * 3フレーム持続して対象との衝突判定およびダメージ処理を行います。影響フェーズ中は、scale と alpha でリッチな効果を付与します。
 */
export function updateBlitzShockEffects(params: {
  app: PIXI.Application;
  blitzShockEffects: BlitzShockEffect[];
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  updateTargetHP: (target: UnitText, damage: number) => void;
  damageTexts: DamageText[];
}) {
  const {
    app,
    blitzShockEffects,
    allyUnits,
    enemyUnits,
    updateTargetHP,
    damageTexts,
  } = params;

  blitzShockEffects.forEach((effect, i) => {
    if (!effect.isStruck) {
      // Falling phase: update y position.
      effect.graphics.y += effect.fallingSpeed;
      // Current falling distance
      const currentLength = effect.graphics.y - effect.startY;
      drawJaggedLine(effect.graphics, currentLength);
      // To center the impact, adjust: when the falling bolt is nearly at targetY, force y to targetY.
      if (effect.graphics.y + currentLength / 2 >= effect.targetY) {
        effect.graphics.y = effect.targetY;
        effect.isStruck = true;
        effect.graphics.clear();
        // Draw impact effect: blue circle of radius 20.
        effect.graphics.beginFill(0x0000ff, 1);
        effect.graphics.drawCircle(0, 0, 60);
        effect.graphics.endFill();
        // Set impact phase lifetime to 3 frames.
        effect.lifetime = 3;
      }
    } else {
      // Impact phase: update explosion effect.
      const totalImpactDuration = 3;
      const progress = 1 - effect.lifetime / totalImpactDuration; // 0 -> 1
      const scaleFactor = 1 + progress * 0.5; // Scale up to 1.5x
      effect.graphics.scale.set(scaleFactor);
      effect.graphics.alpha = 1 - progress;

      // Collision detection: check if any target from the opposite team is within 20px.
      const explosionCenter = { x: effect.graphics.x, y: effect.graphics.y };
      const targets = effect.team === "ally" ? enemyUnits : allyUnits;
      targets.forEach((target) => {
        const dx = target.text.x - explosionCenter.x;
        const dy = target.text.y - explosionCenter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 60) {
          updateTargetHP(target, effect.damage);
          showDamageText({
            app,
            damage: effect.damage,
            basePosition: { x: target.text.x, y: target.text.y },
            damageTexts,
          });
        }
      });
      effect.lifetime--;
      if (effect.lifetime <= 0) {
        app.stage.removeChild(effect.graphics);
        blitzShockEffects.splice(i, 1);
      }
    }
  });
}
