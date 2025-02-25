import * as PIXI from "pixi.js";
import { UnitText } from "../../types/UnitText";
import { DamageText, showDamageText } from "../utils/DamageTextUtil";
import {
  handleBlitzShockAttack,
  updateBlitzShockEffects,
  BlitzShockEffect,
} from "./BlitzShock";

/**
 * getFarthestTarget
 * 攻撃者から見て最も遠いターゲットを返します（攻撃者自身は除外）。
 */
function getFarthestTarget(
  attacker: UnitText,
  targets: UnitText[]
): UnitText | null {
  if (targets.length === 0) return null;
  let farthest = targets[0];
  let maxDist = Math.hypot(
    attacker.text.x - farthest.text.x,
    attacker.text.y - farthest.text.y
  );
  for (const t of targets) {
    const d = Math.hypot(
      attacker.text.x - t.text.x,
      attacker.text.y - t.text.y
    );
    if (d > maxDist) {
      maxDist = d;
      farthest = t;
    }
  }
  return farthest;
}

/**
 * processTeamBlitzShockAttacks
 * 7フレームごとに、各チーム（味方・敵）で、skill_name が "ブリッツショック" のユニットから
 * 最も遠いターゲットに向けたブリッツショック攻撃を発動し、同時にエフェクトの更新も行います。
 *
 * PixiCanvas.tsx側ではこの関数を1行で呼び出すだけで処理が完結します。
 */
export function processTeamBlitzShockAttacks(params: {
  app: PIXI.Application;
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  blitzShockEffects: BlitzShockEffect[];
  damageTexts: DamageText[];
  counter: number;
  updateTargetHP: (target: UnitText, damage: number) => void;
}) {
  if (params.counter % 7 === 0) {
    // 味方側：攻撃対象は敵ユニット
    params.allyUnits
      .filter((ally) => ally.unit.skill_name === "ブリッツショック")
      .forEach((ally) => {
        const farthest = getFarthestTarget(ally, params.enemyUnits);
        if (farthest) {
          handleBlitzShockAttack({
            app: params.app,
            texts: [ally],
            blitzShockEffects: params.blitzShockEffects,
            farthestTarget: farthest,
          });
        }
      });

    // 敵側：攻撃対象は味方ユニット
    params.enemyUnits
      .filter((enemy) => enemy.unit.skill_name === "ブリッツショック")
      .forEach((enemy) => {
        const farthest = getFarthestTarget(enemy, params.allyUnits);
        if (farthest) {
          handleBlitzShockAttack({
            app: params.app,
            texts: [enemy],
            blitzShockEffects: params.blitzShockEffects,
            farthestTarget: farthest,
          });
        }
      });
  }

  updateBlitzShockEffects({
    app: params.app,
    blitzShockEffects: params.blitzShockEffects,
    allyUnits: params.allyUnits,
    enemyUnits: params.enemyUnits,
    updateTargetHP: params.updateTargetHP,
    damageTexts: params.damageTexts,
  });
}
