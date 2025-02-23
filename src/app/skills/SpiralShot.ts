// skills/SpiralShot.ts
import * as PIXI from "pixi.js";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";
import { ExtendedUnitText } from "../components/PixiCanvas";

export interface SpiralShotEffect {
  graphics: PIXI.Graphics;
  startX: number;
  startY: number;
  baseAngle: number;
  speed: number;
  spiralMagnitude: number;
  spiralRate: number;
  age: number;
  lifetime: number;
  impact: boolean;
  damage: number;
  team: "ally" | "enemy";
  target?: ExtendedUnitText; // 発射時に決定したターゲット
}

/**
 * handleSpiralShotAttack
 * 7フレームごとに、skill_name が "スパイラルショット" のユニットから、
 * 一番近い敵ユニットへ向けて螺旋状の弾を発射します。
 * 弾のダメージは攻撃力の65%です。
 */
export function handleSpiralShotAttack(params: {
  app: PIXI.Application;
  texts: ExtendedUnitText[];
  spiralShotEffects: SpiralShotEffect[];
  target: ExtendedUnitText;
}) {
  const attacker = params.texts[0];
  if (!attacker || attacker.unit.skill_name !== "スパイラルショット") return;

  const attackerPos = { x: attacker.text.x, y: attacker.text.y };
  const targetPos = { x: params.target.text.x, y: params.target.text.y };
  const dx = targetPos.x - attackerPos.x;
  const dy = targetPos.y - attackerPos.y;
  const baseAngle = Math.atan2(dy, dx);

  // パラメータ設定（例：速度8, spiralMagnitude 3, spiralRate 0.3, lifetime 30フレーム）
  const speed = 3;
  const spiralMagnitude = 2;
  const spiralRate = 0.3;
  const lifetime = 80;
  const damage = attacker.unit.attack * 0.65;

  const effectGraphics = new PIXI.Graphics();
  // 初期状態は小さな青い円
  effectGraphics.beginFill(0x0000ff);
  effectGraphics.drawCircle(0, 0, 5);
  effectGraphics.endFill();
  effectGraphics.x = attackerPos.x;
  effectGraphics.y = attackerPos.y;
  params.app.stage.addChild(effectGraphics);

  const effect: SpiralShotEffect = {
    graphics: effectGraphics,
    startX: attackerPos.x,
    startY: attackerPos.y,
    baseAngle,
    speed,
    spiralMagnitude,
    spiralRate,
    age: 0,
    lifetime,
    impact: false,
    damage,
    team: attacker.team,
    target: params.target,
  };
  params.spiralShotEffects.push(effect);
}

/**
 * updateSpiralShotEffects
 * 各スパイラルショットエフェクトを毎フレーム更新します。
 * 落下中は、螺旋状の軌道を計算して位置を更新し、ターゲットとの衝突判定で impact 状態に切り替え、
 * その後、3フレーム持続してダメージを与えます。
 */
export function updateSpiralShotEffects(params: {
  app: PIXI.Application;
  spiralShotEffects: SpiralShotEffect[];
  updateTargetHP: (target: ExtendedUnitText, damage: number) => void;
  damageTexts: DamageText[];
}) {
  const { app, spiralShotEffects, updateTargetHP, damageTexts } = params;
  spiralShotEffects.forEach((effect, i) => {
    if (!effect.impact) {
      effect.age++;
      // 螺旋状軌道の計算
      const t = effect.age;
      const forwardDist = effect.speed * t;
      const offset = effect.spiralMagnitude * t;
      const newX =
        effect.startX +
        forwardDist * Math.cos(effect.baseAngle) +
        offset *
          Math.cos(effect.baseAngle + Math.PI / 2 + effect.spiralRate * t);
      const newY =
        effect.startY +
        forwardDist * Math.sin(effect.baseAngle) +
        offset *
          Math.sin(effect.baseAngle + Math.PI / 2 + effect.spiralRate * t);
      effect.graphics.x = newX;
      effect.graphics.y = newY;

      // 衝突判定：ターゲットが設定されている場合、距離が10px未満なら impact に切り替え
      if (effect.target) {
        const dx = effect.graphics.x - effect.target.text.x;
        const dy = effect.graphics.y - effect.target.text.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 10) {
          effect.impact = true;
          effect.lifetime = 3; // impact フェーズを3フレームに設定
          effect.graphics.clear();
          // Impact 表現：大きな青い円（半径10px）を描画
          effect.graphics.beginFill(0x0000ff);
          effect.graphics.drawCircle(0, 0, 10);
          effect.graphics.endFill();
        }
      }
      if (effect.age >= effect.lifetime && !effect.impact) {
        app.stage.removeChild(effect.graphics);
        spiralShotEffects.splice(i, 1);
      }
    } else {
      // Impact フェーズ中：適用中は scale と alpha でフェードアウト効果を付与
      const totalImpactDuration = 3;
      const progress = 1 - effect.lifetime / totalImpactDuration;
      const scaleFactor = 1 + progress * 0.5; // 最大1.5倍
      effect.graphics.scale.set(scaleFactor);
      effect.graphics.alpha = 1 - progress;
      // 衝突判定：ターゲットがまだ設定されていれば、衝突範囲（半径10px以内）でダメージ適用
      if (effect.target) {
        const dx = effect.graphics.x - effect.target.text.x;
        const dy = effect.graphics.y - effect.target.text.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 10) {
          updateTargetHP(effect.target, effect.damage);
          showDamageText({
            app,
            damage: effect.damage,
            basePosition: { x: effect.target.text.x, y: effect.target.text.y },
            damageTexts,
          });
        }
      }
      effect.lifetime--;
      if (effect.lifetime <= 0) {
        app.stage.removeChild(effect.graphics);
        spiralShotEffects.splice(i, 1);
      }
    }
  });
}
