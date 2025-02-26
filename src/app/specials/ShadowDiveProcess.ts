// specials/ShadowDiveProcess.ts
import * as PIXI from "pixi.js";
import { DamageText, showDamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText";
import { ShadowDiveEffect, handleShadowDiveAttack } from "./ShadowDive";

/**
 * processTeamShadowDiveAttacks
 *
 * Every 150 frames, for each unit with special_name "シャドウダイブ",
 * trigger the shadow dive attack, then update any active shadow dive effects.
 * The effect lasts 30 frames, during which it fades out.
 */
export function processTeamShadowDiveAttacks(params: {
  app: PIXI.Application;
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  shadowDiveEffects: ShadowDiveEffect[];
  damageTexts: DamageText[];
  counter: number;
  updateTargetHP: (target: UnitText, damage: number) => void;
}): void {
  if (params.counter % 150 === 0) {
    // Process ally units with "シャドウダイブ"
    params.allyUnits.forEach((unit) => {
      if (unit.unit.special_name === "シャドウダイブ") {
        handleShadowDiveAttack({
          app: params.app,
          unit,
          enemyUnits: params.enemyUnits,
          shadowDiveEffects: params.shadowDiveEffects,
          damageTexts: params.damageTexts,
          updateTargetHP: params.updateTargetHP,
        });
      }
    });
    // Process enemy units with "シャドウダイブ"
    params.enemyUnits.forEach((unit) => {
      if (unit.unit.special_name === "シャドウダイブ") {
        handleShadowDiveAttack({
          app: params.app,
          unit,
          enemyUnits: params.allyUnits,
          shadowDiveEffects: params.shadowDiveEffects,
          damageTexts: params.damageTexts,
          updateTargetHP: params.updateTargetHP,
        });
      }
    });
  }

  // Update active shadow dive effects: fade out over 30 frames.
  const totalDuration = 30;
  for (let i = params.shadowDiveEffects.length - 1; i >= 0; i--) {
    const effect = params.shadowDiveEffects[i];
    effect.age++;
    effect.graphics.alpha = 1 - effect.age / totalDuration;
    if (effect.age >= totalDuration) {
      params.app.stage.removeChild(effect.graphics);
      params.shadowDiveEffects.splice(i, 1);
    }
  }
}
