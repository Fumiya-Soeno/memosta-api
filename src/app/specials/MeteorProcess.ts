// specials/MeteorProcess.ts
import * as PIXI from "pixi.js";
import { DamageText, showDamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText";
import { MeteorEffect, handleMeteorAttack } from "./Meteor";

/**
 * processTeamMeteorAttacks
 * Every 120 frames, if a unit with special_name "メテオ" exists (ally side is preferred),
 * a meteor attack is triggered. Then, all active meteor effects are updated.
 */
export function processTeamMeteorAttacks(params: {
  app: PIXI.Application;
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  meteorEffects: MeteorEffect[];
  damageTexts: DamageText[];
  counter: number;
  updateTargetHP: (target: UnitText, damage: number) => void;
}): void {
  if (params.counter % 80 === 0) {
    const triggerAlly = params.allyUnits.find(
      (u) => u.unit.special_name === "メテオ"
    );
    if (triggerAlly) {
      handleMeteorAttack({
        app: params.app,
        unit: triggerAlly,
        meteorEffects: params.meteorEffects,
      });
    } else {
      const triggerEnemy = params.enemyUnits.find(
        (u) => u.unit.special_name === "メテオ"
      );
      if (triggerEnemy) {
        handleMeteorAttack({
          app: params.app,
          unit: triggerEnemy,
          meteorEffects: params.meteorEffects,
        });
      }
    }
  }

  updateTeamMeteorEffects({
    app: params.app,
    meteorEffects: params.meteorEffects,
    damageTexts: params.damageTexts,
    updateTargetHP: params.updateTargetHP,
    allyUnits: params.allyUnits,
    enemyUnits: params.enemyUnits,
  });
}

/**
 * updateTeamMeteorEffects
 * For each meteor effect:
 * - In the falling phase (first fallingDuration frames), the meteor's y-position is interpolated.
 * - After falling is complete, the effect transitions to an explosion phase where the graphic expands and fades.
 *   At mid-explosion, damage is applied only to units on the opposite team within the explosion radius.
 */
function updateTeamMeteorEffects(params: {
  app: PIXI.Application;
  meteorEffects: MeteorEffect[];
  damageTexts: DamageText[];
  updateTargetHP: (target: UnitText, damage: number) => void;
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
}): void {
  const targetY = params.app.screen.height / 2;
  for (let i = params.meteorEffects.length - 1; i >= 0; i--) {
    const effect = params.meteorEffects[i];
    effect.age++;
    if (!effect.exploded) {
      // Falling phase
      if (effect.age <= effect.fallingDuration) {
        const progress = effect.age / effect.fallingDuration;
        effect.graphics.y = -50 + progress * (targetY + 50);
      } else {
        // Transition to explosion phase
        effect.exploded = true;
        effect.age = 0; // reset age for explosion phase
        effect.graphics.clear();
      }
    } else {
      // Explosion phase: expand from radius 25 to 150 over 20 frames
      const explosionDuration = 20;
      const progress = effect.age / explosionDuration;
      const radius = 25 + progress * (150 - 25);
      effect.graphics.clear();
      effect.graphics.beginFill(0xffa500, 0.8 * (1 - progress));
      effect.graphics.drawCircle(0, 0, radius);
      effect.graphics.endFill();

      // At half of explosion duration, apply damage to opposite team within the explosion radius
      if (effect.age === Math.floor(explosionDuration / 2)) {
        const explosionCenter = { x: params.app.screen.width / 2, y: targetY };
        const targets =
          effect.team === "ally" ? params.enemyUnits : params.allyUnits;
        targets.forEach((unit) => {
          const dx = unit.text.x - explosionCenter.x;
          const dy = unit.text.y - explosionCenter.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= radius) {
            params.updateTargetHP(unit, effect.damage);
            showDamageText({
              app: params.app,
              damage: effect.damage,
              basePosition: { x: unit.text.x, y: unit.text.y },
              damageTexts: params.damageTexts,
            });
          }
        });
      }

      // Fade out and remove when finished
      if (effect.age >= explosionDuration) {
        params.app.stage.removeChild(effect.graphics);
        params.meteorEffects.splice(i, 1);
      }
    }
  }
}
