import * as PIXI from "pixi.js";
import { UnitText } from "../../types/UnitText";
import { DamageText, showDamageText } from "../utils/DamageTextUtil";
import {
  handleEchoBladeAttack,
  updateEchoBladeEffects,
  EchoBladeEffect,
} from "./EchoBlade";

/**
 * getNearestTarget
 * 指定した攻撃者から最も近いターゲットを返します（攻撃者自身は除外）。
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
 * processTeamEchoBladeAttacks
 * 7フレームごとに、味方・敵両チームから skill_name が「エコーブレード」のユニットが
 * 最も近い相手に対してエコーブレード攻撃を発動し、エフェクトの更新も行います。
 * PixiCanvas.tsx上ではこれを1行で呼び出せます。
 */
export function processTeamEchoBladeAttacks(params: {
  app: PIXI.Application;
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  echoBladeEffects: EchoBladeEffect[];
  updateTargetHP: (target: UnitText, damage: number) => void;
  damageTexts: DamageText[];
  attackFrame: number;
}) {
  if (params.attackFrame % 7 !== 0) {
    // 7フレーム周期以外は更新のみ
    updateEchoBladeEffects({
      app: params.app,
      echoBladeEffects: params.echoBladeEffects,
      allyUnits: params.allyUnits,
      enemyUnits: params.enemyUnits,
      updateTargetHP: params.updateTargetHP,
      damageTexts: params.damageTexts,
    });
    return;
  }
  // 味方側のエコーブレード攻撃
  params.allyUnits
    .filter((ally) => ally.unit.skill_name === "エコーブレード")
    .forEach((ally) => {
      const target = getNearestTarget(ally, params.enemyUnits);
      if (target) {
        const targetContainer = new PIXI.Container();
        targetContainer.x = target.text.x;
        targetContainer.y = target.text.y;
        handleEchoBladeAttack({
          app: params.app,
          texts: [ally],
          targetContainer: targetContainer,
          echoBladeEffects: params.echoBladeEffects,
        });
      }
    });
  // 敵側のエコーブレード攻撃
  params.enemyUnits
    .filter((enemy) => enemy.unit.skill_name === "エコーブレード")
    .forEach((enemy) => {
      const target = getNearestTarget(enemy, params.allyUnits);
      if (target) {
        const targetContainer = new PIXI.Container();
        targetContainer.x = target.text.x;
        targetContainer.y = target.text.y;
        handleEchoBladeAttack({
          app: params.app,
          texts: [enemy],
          targetContainer: targetContainer,
          echoBladeEffects: params.echoBladeEffects,
        });
      }
    });
  // 更新エフェクト（攻撃後は更新処理も実行）
  updateEchoBladeEffects({
    app: params.app,
    echoBladeEffects: params.echoBladeEffects,
    allyUnits: params.allyUnits,
    enemyUnits: params.enemyUnits,
    updateTargetHP: params.updateTargetHP,
    damageTexts: params.damageTexts,
  });
}
