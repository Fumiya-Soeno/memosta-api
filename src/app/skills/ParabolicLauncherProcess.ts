import * as PIXI from "pixi.js";
import { UnitText } from "../../types/UnitText";
import { DamageText } from "../utils/DamageTextUtil";
import {
  handleParabolicLauncherAttack,
  updateParabolicLauncherEffects,
  ParabolicLauncherEffect,
} from "./ParabolicLauncher";

/**
 * processTeamParabolicLauncherAttacks
 *
 * 10フレームごとに、各チームの「パラボリックランチャー」攻撃対象から最も近い敵を選定し、
 * 放物線軌道のエフェクトを発生させ、その後エフェクトを更新します。
 *
 * @param params.app                PIXI.Application
 * @param params.allyUnits          味方ユニットの配列（各要素は UnitText 型）
 * @param params.enemyUnits         敵ユニットの配列
 * @param params.parabolicLauncherEffects  発生中のパラボリックランチャーエフェクトの配列
 * @param params.damageTexts        発生中のダメージテキストの配列
 * @param params.counter            現在のフレームカウンター
 * @param params.updateTargetHP     対象ユニットの HP 更新コールバック
 */
export function processTeamParabolicLauncherAttacks(params: {
  app: PIXI.Application;
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  parabolicLauncherEffects: ParabolicLauncherEffect[];
  damageTexts: DamageText[];
  counter: number;
  updateTargetHP: (target: UnitText, damage: number) => void;
}): void {
  if (params.counter % 10 === 0) {
    // 味方側
    params.allyUnits
      .filter((unit) => unit.unit.skill_name === "パラボリックランチャー")
      .forEach((attacker) => {
        const target = getNearestTarget(attacker, params.enemyUnits);
        if (target) {
          handleParabolicLauncherAttack({
            app: params.app,
            texts: [attacker],
            target,
            parabolicLauncherEffects: params.parabolicLauncherEffects,
          });
        }
      });
    // 敵側
    params.enemyUnits
      .filter((unit) => unit.unit.skill_name === "パラボリックランチャー")
      .forEach((attacker) => {
        const target = getNearestTarget(attacker, params.allyUnits);
        if (target) {
          handleParabolicLauncherAttack({
            app: params.app,
            texts: [attacker],
            target,
            parabolicLauncherEffects: params.parabolicLauncherEffects,
          });
        }
      });
  }
  updateParabolicLauncherEffects({
    app: params.app,
    parabolicLauncherEffects: params.parabolicLauncherEffects,
    allyUnits: params.allyUnits,
    enemyUnits: params.enemyUnits,
    updateTargetHP: params.updateTargetHP,
    damageTexts: params.damageTexts,
  });
}

/**
 * getNearestTarget
 *
 * 指定した attacker から最も近いターゲット（attacker 自身を除く）を返します。
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
