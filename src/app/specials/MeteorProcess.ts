// specials/MeteorProcess.ts
import * as PIXI from "pixi.js";
import { DamageText, showDamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText";
import { MeteorEffect, handleMeteorAttack } from "./Meteor";

/**
 * processTeamMeteorAttacks
 *
 * Every 120 frames, if a unit with special_name "メテオ" exists (ally side is preferred),
 * a meteor attack is triggered via handleMeteorAttack.
 * Then, the existing meteor effects are updated.
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
  // Trigger meteor attack every 120 frames
  if (params.counter % 120 === 0) {
    // Prefer ally side
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

  // Update existing meteor effects
  updateTeamMeteorEffects({
    app: params.app,
    meteorEffects: params.meteorEffects,
    damageTexts: params.damageTexts,
    updateTargetHP: params.updateTargetHP,
    // Only target units from the opposite team
    allyUnits: params.allyUnits,
    enemyUnits: params.enemyUnits,
  });
}

/**
 * updateTeamMeteorEffects
 *
 * For each meteor effect:
 * - During the falling phase (first 20 frames), the meteor falls from y = -150 to the screen center.
 * - After falling is complete, damage is applied only to units from the opposite team within a 150px radius of the center.
 *   The meteor then fades out gradually.
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
    if (effect.age <= effect.fallingDuration) {
      // Falling phase: interpolate y-position
      const progress = effect.age / effect.fallingDuration;
      effect.graphics.y = -150 + progress * (targetY + 150);
    } else {
      // Impact phase: apply damage only to units from the opposite team
      const explosionCenter = { x: params.app.screen.width / 2, y: targetY };
      const targets =
        effect.team === "ally" ? params.enemyUnits : params.allyUnits;
      targets.forEach((unit) => {
        const dx = unit.text.x - explosionCenter.x;
        const dy = unit.text.y - explosionCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= 150) {
          params.updateTargetHP(unit, effect.damage);
          showDamageText({
            app: params.app,
            damage: effect.damage,
            basePosition: { x: unit.text.x, y: unit.text.y },
            damageTexts: params.damageTexts,
          });
        }
      });
      // Fade out the meteor effect gradually
      effect.graphics.alpha *= 0.9;
      if (effect.graphics.alpha < 0.1) {
        params.app.stage.removeChild(effect.graphics);
        params.meteorEffects.splice(i, 1);
      }
    }
  }
}
