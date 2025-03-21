import * as PIXI from "pixi.js";
import { UnitText } from "../../types/UnitText";
import { DamageText, showDamageText } from "../utils/DamageTextUtil";
import {
  GuardianFallEffect,
  handleGuardianFallAttack,
  updateGuardianFallEffects,
} from "./GuardianFall";

/**
 * getNearestTarget
 * 攻撃者から最も近いターゲットを返します（攻撃者自身は除外）。
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
 * processTeamGuardianFallAttacks
 * 6フレームごとに、味方および敵チームのうち、skill_name が "ガーディアンフォール" のユニットから
 * 対象（最も近い相手）に対してガーディアンフォール攻撃を発動し、
 * 継続的なエフェクト更新も行います。
 *
 * PixiCanvas.tsx側ではこの関数を1行で呼び出すだけで処理が完結します。
 */
export function processTeamGuardianFallAttacks(params: {
  app: PIXI.Application;
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  guardianEffects: GuardianFallEffect[];
  updateTargetHP: (target: UnitText, damage: number) => void;
  damageTexts: DamageText[];
  counter: number;
}) {
  // 攻撃発動タイミング：3フレームごと
  if (params.counter % 3 === 0) {
    // 味方側
    params.allyUnits
      .filter((ally) => ally.unit.skill_name === "ガーディアンフォール")
      .forEach((ally) => {
        const target = getNearestTarget(ally, params.enemyUnits);
        if (target) {
          handleGuardianFallAttack({
            app: params.app,
            texts: [ally],
            guardianEffects: params.guardianEffects,
          });
        }
      });
    // 敵側
    params.enemyUnits
      .filter((enemy) => enemy.unit.skill_name === "ガーディアンフォール")
      .forEach((enemy) => {
        const target = getNearestTarget(enemy, params.allyUnits);
        if (target) {
          handleGuardianFallAttack({
            app: params.app,
            texts: [enemy],
            guardianEffects: params.guardianEffects,
          });
        }
      });
  }
  // 継続的なエフェクト更新
  updateGuardianFallEffects({
    app: params.app,
    guardianEffects: params.guardianEffects,
    allyUnits: params.allyUnits,
    enemyUnits: params.enemyUnits,
    updateTargetHP: params.updateTargetHP,
    damageTexts: params.damageTexts,
  });
}
