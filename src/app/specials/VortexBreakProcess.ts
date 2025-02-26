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
    // Prefer ally units; if none found, check enemy units.
    const triggerAlly = params.allyUnits.find(
      (u) => u.unit.special_name === "ボルテックスブレイク"
    );
    if (triggerAlly) {
      handleVortexBreakAttack({
        app: params.app,
        unit: triggerAlly,
        vortexBreakEffects: params.vortexBreakEffects,
      });
    } else {
      const triggerEnemy = params.enemyUnits.find(
        (u) => u.unit.special_name === "ボルテックスブレイク"
      );
      if (triggerEnemy) {
        handleVortexBreakAttack({
          app: params.app,
          unit: triggerEnemy,
          vortexBreakEffects: params.vortexBreakEffects,
        });
      }
    }
  }

  // Update each active vortex break projectile.
  for (let i = params.vortexBreakEffects.length - 1; i >= 0; i--) {
    const effect = params.vortexBreakEffects[i];
    // Choose the correct target array based on the effect team.
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
