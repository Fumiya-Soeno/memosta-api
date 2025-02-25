import * as PIXI from "pixi.js";
import { UnitText } from "../../types/UnitText";
import { DamageText, showDamageText } from "../utils/DamageTextUtil";
import {
  handleSpiralShotAttack,
  updateSpiralShotEffects,
  SpiralShotEffect,
} from "./SpiralShot";

/**
 * getNearestTarget
 * 攻撃者から見て最も近いターゲット（自分自身は除外）を返すヘルパー関数
 */
function getNearestTarget(
  attacker: UnitText,
  targets: UnitText[]
): UnitText | null {
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

/**
 * processTeamSpiralShotAttacks
 * 2フレームごとに、skill_name が "スパイラルショット" のユニットから
 * 一番近い敵（対象チーム）に向けてスパイラルショット攻撃を発動し、
 * 発射エフェクトの更新も行います。
 *
 * PixiCanvas.tsx側ではこの関数を1行で呼び出せば処理が完結します。
 */
export function processTeamSpiralShotAttacks(params: {
  counter: number;
  app: PIXI.Application;
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  spiralShotEffects: SpiralShotEffect[];
  updateTargetHP: (target: UnitText, damage: number) => void;
  damageTexts: DamageText[];
}) {
  // 2フレームごとに攻撃発動
  if (params.counter % 2 === 0) {
    // 友軍側（敵ターゲットを狙う）
    params.allyUnits
      .filter((ally) => ally.unit.skill_name === "スパイラルショット")
      .forEach((ally) => {
        const target = getNearestTarget(ally, params.enemyUnits);
        if (target) {
          handleSpiralShotAttack({
            app: params.app,
            texts: [ally],
            spiralShotEffects: params.spiralShotEffects,
            target,
          });
        }
      });

    // 敵側（友軍ターゲットを狙う）
    params.enemyUnits
      .filter((enemy) => enemy.unit.skill_name === "スパイラルショット")
      .forEach((enemy) => {
        const target = getNearestTarget(enemy, params.allyUnits);
        if (target) {
          handleSpiralShotAttack({
            app: params.app,
            texts: [enemy],
            spiralShotEffects: params.spiralShotEffects,
            target,
          });
        }
      });
  }

  // エフェクトの更新
  updateSpiralShotEffects({
    app: params.app,
    spiralShotEffects: params.spiralShotEffects,
    updateTargetHP: params.updateTargetHP,
    damageTexts: params.damageTexts,
  });
}
