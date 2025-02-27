import * as PIXI from "pixi.js";
import { UnitText } from "../../types/UnitText";
import { DamageText, showDamageText } from "../utils/DamageTextUtil";

export interface ParabolicLauncherEffect {
  graphics: PIXI.Graphics;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  currentFrame: number;
  flightTime: number; // 飛行フェーズのフレーム数（例: 10）
  impactTime: number; // 着弾後のインパクトフェーズのフレーム数（例: 3）
  damage: number;
  impact: boolean;
  team: "ally" | "enemy";
}

/**
 * handleParabolicLauncherAttack
 * 発射元ユニットから最も近い敵ユニットへ放物線軌道の攻撃エフェクトを生成します。
 * エフェクトは 10 フレームで飛行し、着弾後 3 フレームのインパクトフェーズでダメージ判定を行います。
 */
export function handleParabolicLauncherAttack(params: {
  app: PIXI.Application;
  texts: UnitText[];
  target: UnitText;
  parabolicLauncherEffects: ParabolicLauncherEffect[];
}) {
  const attacker = params.texts[0];
  if (!attacker || attacker.unit.skill_name !== "パラボリックランチャー")
    return;
  const startX = attacker.text.x;
  const startY = attacker.text.y;
  const targetX = params.target.text.x;
  const targetY = params.target.text.y;
  const damage = attacker.unit.attack * 0.7;
  const effectGraphic = new PIXI.Graphics();
  effectGraphic.beginFill(0xff0000);
  // 円の直径 30px → 半径15px
  effectGraphic.drawCircle(0, 0, 15);
  effectGraphic.endFill();
  effectGraphic.x = startX;
  effectGraphic.y = startY;
  params.app.stage.addChild(effectGraphic);
  const effect: ParabolicLauncherEffect = {
    graphics: effectGraphic,
    startX,
    startY,
    targetX,
    targetY,
    currentFrame: 0,
    flightTime: 10,
    impactTime: 3,
    damage,
    impact: false,
    team: attacker.team,
  };
  params.parabolicLauncherEffects.push(effect);
}

/**
 * updateParabolicLauncherEffects
 * 各パラボリックランチャーエフェクトを更新します。
 * ・飛行フェーズでは放物線軌道に沿って移動
 * ・飛行終了後、インパクトフェーズに移行し、ターゲット近傍にダメージを与えた上でフェードアウトします。
 */
export function updateParabolicLauncherEffects(params: {
  app: PIXI.Application;
  parabolicLauncherEffects: ParabolicLauncherEffect[];
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  updateTargetHP: (target: UnitText, damage: number) => void;
  damageTexts: DamageText[];
}) {
  const effects = params.parabolicLauncherEffects;
  for (let i = effects.length - 1; i >= 0; i--) {
    const eff = effects[i];
    eff.currentFrame++;
    if (!eff.impact) {
      if (eff.currentFrame <= eff.flightTime) {
        // 飛行フェーズ
        const t = eff.currentFrame / eff.flightTime;
        const newX = eff.startX + (eff.targetX - eff.startX) * t;
        const newY = eff.startY + (eff.targetY - eff.startY) * t;
        // 放物線: 上方にアーチ状に上がるように (最大高さを 200px として)
        const offset = 200 * t * (1 - t);
        eff.graphics.x = newX;
        eff.graphics.y = newY - offset;
      } else {
        // 飛行フェーズ終了 → インパクトフェーズに移行
        eff.impact = true;
        eff.currentFrame = 0;
        eff.graphics.clear();
        eff.graphics.beginFill(0xffa500, 1);
        // インパクト効果：半径20px の円
        eff.graphics.drawCircle(0, 0, 100);
        eff.graphics.endFill();
      }
    } else {
      // インパクトフェーズ：ターゲット位置付近でフェードアウト
      const progress = eff.currentFrame / eff.impactTime;
      eff.graphics.alpha = 1 - progress;
      // 初回インパクト時に衝突判定（1フレーム目のみ）
      if (eff.currentFrame === 1) {
        const targets =
          eff.team === "ally" ? params.enemyUnits : params.allyUnits;
        targets.forEach((target) => {
          const dx = target.text.x - eff.targetX;
          const dy = target.text.y - eff.targetY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            params.updateTargetHP(target, eff.damage);
            showDamageText({
              app: params.app,
              damage: eff.damage,
              basePosition: { x: target.text.x, y: target.text.y },
              damageTexts: params.damageTexts,
            });
          }
        });
      }
      if (eff.currentFrame >= eff.impactTime) {
        params.app.stage.removeChild(eff.graphics);
        effects.splice(i, 1);
      }
    }
  }
}
