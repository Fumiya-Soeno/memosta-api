// specials/VortexBreakProcess.ts
import * as PIXI from "pixi.js";
import { DamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText";
import {
  VortexBreakEffect,
  handleVortexBreakAttack,
  updateVortexBreakEffect,
} from "./VortexBreak";

/**
 * processTeamVortexBreakAttacks
 * Every 120 frames, if a unit with special_name "ボルテックスブレイク" is found
 * (ally units are preferred), trigger the vortex break attack.
 * Then update all active vortex break effects.
 */
export function processTeamVortexBreakAttacks(params: {
  app: PIXI.Application;
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  vortexBreakEffects: VortexBreakEffect[];
  damageTexts: DamageText[];
  counter: number;
  updateTargetHP: (target: UnitText, damage: number) => void;
}): void {
  // Trigger attack every 120 frames.
  if (params.counter % 120 === 0) {
    params.allyUnits
      .filter((u) => u.unit.special_name === "ボルテックスブレイク")
      .forEach((u) => {
        handleVortexBreakAttack({
          app: params.app,
          unit: u,
          vortexBreakEffects: params.vortexBreakEffects,
        });
      });
    params.enemyUnits
      .filter((u) => u.unit.special_name === "ボルテックスブレイク")
      .forEach((u) => {
        handleVortexBreakAttack({
          app: params.app,
          unit: u,
          vortexBreakEffects: params.vortexBreakEffects,
        });
      });
  }

  // Update each active vortex break projectile.
  for (let i = params.vortexBreakEffects.length - 1; i >= 0; i--) {
    const effect = params.vortexBreakEffects[i];
    // Choose the correct target array based on the effect's team.
    const targetUnits =
      effect.team === "ally" ? params.enemyUnits : params.allyUnits;
    updateVortexBreakEffect({
      app: params.app,
      effect,
      targetUnits,
      updateTargetHP: params.updateTargetHP,
      damageTexts: params.damageTexts,
    });
    if (effect.age >= effect.lifetime) {
      params.vortexBreakEffects.splice(i, 1);
    }
  }
}
