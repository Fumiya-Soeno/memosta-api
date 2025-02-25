import * as PIXI from "pixi.js";
import { ExtendedUnitText } from "../components/PixiCanvas";
import { DamageText, showDamageText } from "../utils/DamageTextUtil";
import {
  handleFlameEdgeAttack,
  updateFlameEdgeEffects,
  FlameEdgeEffect,
} from "./FlameEdge";

/**
 * Helper function: Get the nearest target for FlameEdge attack.
 */
function getNearestTargetFlameEdge(
  attacker: ExtendedUnitText,
  targets: ExtendedUnitText[]
): ExtendedUnitText | null {
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
 * processTeamFlameEdgeAttacks
 * 8フレームごとに、skill_name が "フレイムエッジ" のユニット（友軍・敵双方）から
 * 最も近い敵（または味方）に向けたフレイムエッジ攻撃を発動し、エフェクトの更新も行います。
 * PixiCanvas.tsx上では、この関数を1行で呼び出すだけです。
 */
export function processTeamFlameEdgeAttacks(params: {
  app: PIXI.Application;
  allyUnits: ExtendedUnitText[];
  enemyUnits: ExtendedUnitText[];
  flameEdgeEffects: FlameEdgeEffect[];
  updateTargetHP: (target: ExtendedUnitText, damage: number) => void;
  damageTexts: DamageText[];
  attackFrame: number;
}) {
  if (params.attackFrame % 8 === 0) {
    // 友軍側の処理
    params.allyUnits
      .filter((ally) => ally.unit.skill_name === "フレイムエッジ")
      .forEach((ally) => {
        const target = getNearestTargetFlameEdge(ally, params.enemyUnits);
        if (target) {
          handleFlameEdgeAttack({
            app: params.app,
            texts: [ally],
            flameEdgeEffects: params.flameEdgeEffects,
            target,
          });
        }
      });

    // 敵側の処理
    params.enemyUnits
      .filter((enemy) => enemy.unit.skill_name === "フレイムエッジ")
      .forEach((enemy) => {
        const target = getNearestTargetFlameEdge(enemy, params.allyUnits);
        if (target) {
          handleFlameEdgeAttack({
            app: params.app,
            texts: [enemy],
            flameEdgeEffects: params.flameEdgeEffects,
            target,
          });
        }
      });
  }

  // エフェクトの更新
  updateFlameEdgeEffects({
    app: params.app,
    flameEdgeEffects: params.flameEdgeEffects,
    updateTargetHP: params.updateTargetHP,
    damageTexts: params.damageTexts,
  });
}
