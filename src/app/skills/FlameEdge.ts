// skills/FlameEdge.ts
import * as PIXI from "pixi.js";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText";

export interface FlameEdgeEffect {
  graphics: PIXI.Graphics;
  startX: number;
  startY: number;
  currentLength: number;
  maxLength: number;
  growthRate: number;
  directionAngle: number;
  impact: boolean;
  lifetime: number; // impact phase lifetime (frames)
  damage: number;
  target: UnitText;
  team: "ally" | "enemy";
}

const power = 6.0;
const range = 100;

/**
 * Helper function: Draw one crescent-shaped segment.
 * 外側弧と内側弧を描画し、三日月状のエフェクトを表現します。
 */
function drawCrescent(graphics: PIXI.Graphics, radius: number): void {
  graphics.beginFill(0xff4500);
  // 外側の弧: 45°～135°
  graphics.arc(0, 0, radius, (45 * Math.PI) / 180, (135 * Math.PI) / 180);
  // 内側の弧: 135°～45°（反時計回り）
  graphics.arc(
    0,
    0,
    radius * 0.6,
    (135 * Math.PI) / 180,
    (45 * Math.PI) / 180,
    true
  );
  graphics.endFill();
}

/**
 * handleFlameEdgeAttack
 * 8フレームごとに、skill_name が "フレイムエッジ" のユニットから、最も近い敵ユニットに向けて
 * 発射元からターゲット方向へ伸びるエフェクトを生成します。エフェクトは発生地点から徐々に延び、
 * 最終的に maxLength（ここでは250px）に達すると impact フェーズに移行し、3フレーム持続してダメージ判定を行います。
 */
export function handleFlameEdgeAttack(params: {
  app: PIXI.Application;
  texts: UnitText[];
  flameEdgeEffects: FlameEdgeEffect[];
  target: UnitText;
}) {
  const attacker = params.texts[0];
  if (!attacker || attacker.unit.skill_name !== "フレイムエッジ") return;
  const startX = attacker.text.x;
  const startY = attacker.text.y;
  const dx = params.target.text.x - startX;
  const dy = params.target.text.y - startY;
  const directionAngle = Math.atan2(dy, dx);

  const effect: FlameEdgeEffect = {
    graphics: new PIXI.Graphics(),
    startX,
    startY,
    currentLength: 0,
    maxLength: 250,
    growthRate: 90, // extensionフェーズで毎フレーム伸びる量
    directionAngle,
    impact: false,
    lifetime: 0,
    damage: attacker.unit.attack * power,
    target: params.target,
    team: attacker.team,
  };

  // 初期位置・回転設定
  effect.graphics.x = startX;
  effect.graphics.y = startY;
  effect.graphics.rotation = directionAngle;
  // 透明度50%に設定
  effect.graphics.alpha = 0.5;
  params.app.stage.addChild(effect.graphics);
  params.flameEdgeEffects.push(effect);
}

/**
 * updateFlameEdgeEffects
 * 各 FlameEdgeEffect を毎フレーム更新します。
 * extension フェーズでは、currentLength を増加させ、発射元から現在の長さに沿って複数の三日月状セグメントを描画します。
 * currentLength が maxLength に達すると impact フェーズに移行し、3フレーム持続中に対象との衝突判定を行い、
 * エフェクトがフェードアウトして消滅します。
 */
export function updateFlameEdgeEffects(params: {
  app: PIXI.Application;
  flameEdgeEffects: FlameEdgeEffect[];
  updateTargetHP: (target: UnitText, damage: number) => void;
  damageTexts: DamageText[];
}) {
  const { app, flameEdgeEffects, updateTargetHP, damageTexts } = params;

  flameEdgeEffects.forEach((effect, i) => {
    if (!effect.impact) {
      // Extension phase: Increase currentLength gradually.
      if (effect.currentLength < effect.maxLength) {
        effect.currentLength += effect.growthRate;
        if (effect.currentLength >= effect.maxLength) {
          effect.currentLength = effect.maxLength;
          // Transition to impact phase: set lifetime (3 frames).
          effect.impact = true;
          effect.lifetime = 3;
        }
      }
      effect.graphics.clear();
      // extension時は、透明度50%で描画
      effect.graphics.alpha = 0.5;
      const segmentSpacing = 10;
      const numSegments = Math.floor(effect.currentLength / segmentSpacing);
      for (let j = 0; j < numSegments; j++) {
        const posX =
          effect.startX + j * segmentSpacing * Math.cos(effect.directionAngle);
        const posY =
          effect.startY + j * segmentSpacing * Math.sin(effect.directionAngle);
        const segment = new PIXI.Graphics();
        drawCrescent(segment, range);
        segment.x = posX;
        segment.y = posY;
        segment.rotation = effect.directionAngle;
        // 各セグメントも透明度50%
        segment.alpha = 0.5;
        app.stage.addChild(segment);
        setTimeout(() => {
          app.stage.removeChild(segment);
        }, 16);
      }
    } else {
      // Impact phase: Apply fade-out and scale-up effects.
      const totalImpactDuration = 3;
      const progress = 1 - effect.lifetime / totalImpactDuration;
      const scaleFactor = 1 + progress * 0.5; // 最大1.5倍
      effect.graphics.scale.set(scaleFactor);
      // impactフェーズでも、最初は透明度50%から線形にフェードアウト
      effect.graphics.alpha = 0.5 * (1 - progress);

      // 衝突判定：エフェクトの先端（startX + currentLength）とターゲットとの距離が一定範囲内ならダメージ
      const endX =
        effect.startX + effect.currentLength * Math.cos(effect.directionAngle);
      const endY =
        effect.startY + effect.currentLength * Math.sin(effect.directionAngle);
      const dx = effect.target.text.x - endX;
      const dy = effect.target.text.y - endY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < range) {
        updateTargetHP(effect.target, effect.damage);
        showDamageText({
          app,
          damage: effect.damage,
          basePosition: { x: effect.target.text.x, y: effect.target.text.y },
          damageTexts,
        });
      }
      effect.lifetime--;
      if (effect.lifetime <= 0) {
        app.stage.removeChild(effect.graphics);
        flameEdgeEffects.splice(i, 1);
      }
    }
  });
}
