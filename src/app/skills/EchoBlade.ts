import * as PIXI from "pixi.js";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText";

// 型定義：エコーブレード（衝撃波）エフェクト
export interface EchoBladeEffect {
  graphics: PIXI.Graphics;
  vx: number;
  vy: number;
  lifetime: number;
  damage: number;
  team: "ally" | "enemy";
}

// ヘルパー：2点間の距離計算
function distanceBetween(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * handleEchoBladeAttack
 * 7フレームごとに、special_name が "エコーブレード" のユニットから、
 * 対象（targetContainer で指定された位置）へ攻撃を発動します。
 * 発射時の自身の位置とターゲット位置を結ぶ直線の角度に合わせて衝撃波エフェクトを回転・発射します。
 */
export function handleEchoBladeAttack(params: {
  app: PIXI.Application;
  texts: UnitText[];
  targetContainer: PIXI.Container;
  echoBladeEffects: EchoBladeEffect[];
}) {
  // texts[0] を攻撃発射元として処理
  const attacker = params.texts[0];
  if (!attacker || attacker.unit.skill_name !== "エコーブレード") return;
  const attackerPos = { x: attacker.text.x, y: attacker.text.y };

  // ターゲット位置は targetContainer から取得
  const bounds = params.targetContainer.getBounds();
  let targetPos = { x: params.targetContainer.x, y: params.targetContainer.y };
  if (bounds.width !== 0 || bounds.height !== 0) {
    targetPos = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };
  }

  const dx = targetPos.x - attackerPos.x;
  const dy = targetPos.y - attackerPos.y;
  const attackAngle = Math.atan2(dy, dx);

  // 衝撃波攻撃エフェクト（30%ダメージ、ゆっくり移動）
  const shock = new PIXI.Graphics();
  shock.lineStyle(2, 0x0000ff, 1);
  shock.beginFill(0x0000ff, 0.5);
  // 三日月型エフェクト：弧を -45°～45° で描画
  shock.arc(0, 0, 60, (-45 * Math.PI) / 180, (45 * Math.PI) / 180);
  shock.endFill();
  shock.rotation = attackAngle;
  shock.x = attackerPos.x;
  shock.y = attackerPos.y;
  params.app.stage.addChild(shock);
  const shockSpeed = 4;
  const shockVx = shockSpeed * Math.cos(attackAngle);
  const shockVy = shockSpeed * Math.sin(attackAngle);
  const shockDamage = attacker.unit.attack * 0.3;
  params.echoBladeEffects.push({
    graphics: shock,
    vx: shockVx,
    vy: shockVy,
    lifetime: 600, // 600フレーム（必要に応じて調整）
    damage: shockDamage,
    team: attacker.team,
  });
}

/**
 * updateEchoBladeEffects
 * 各衝撃波エフェクトを毎フレーム更新し、発射元の反対チームのユニットに対して衝突判定を行い、ダメージを与えます。
 * ダメージテキストは showDamageText を利用して表示します。
 */
export function updateEchoBladeEffects(params: {
  app: PIXI.Application;
  echoBladeEffects: EchoBladeEffect[];
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  updateTargetHP: (target: UnitText, damage: number) => void;
  damageTexts: DamageText[];
}) {
  const {
    app,
    echoBladeEffects,
    allyUnits,
    enemyUnits,
    updateTargetHP,
    damageTexts,
  } = params;
  echoBladeEffects.forEach((effect, i) => {
    effect.lifetime--;
    effect.graphics.x += effect.vx;
    effect.graphics.y += effect.vy;
    const targets = effect.team === "ally" ? enemyUnits : allyUnits;
    targets.forEach((target) => {
      const d = distanceBetween(
        { x: effect.graphics.x, y: effect.graphics.y },
        { x: target.text.x, y: target.text.y }
      );
      if (d < 60) {
        updateTargetHP(target, effect.damage);
        showDamageText({
          app,
          damage: effect.damage,
          basePosition: { x: target.text.x, y: target.text.y },
          damageTexts,
        });
      }
    });
    if (effect.lifetime <= 0) {
      app.stage.removeChild(effect.graphics);
      echoBladeEffects.splice(i, 1);
    }
  });
}
