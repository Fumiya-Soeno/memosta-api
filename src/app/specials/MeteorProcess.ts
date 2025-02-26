// specials/MeteorProcess.ts
import * as PIXI from "pixi.js";
import { DamageText, showDamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText";
import { MeteorEffect, handleMeteorAttack } from "./Meteor";

/**
 * processTeamMeteorAttacks
 *
 * Every 120 frames, if any unit with special_name "メテオ" exists (ally side is preferred),
 * a meteor attack is triggered via handleMeteorAttack.
 * Then, existing meteor effects are updated:
 * During the falling phase (first 20 frames), the meteor moves from y = -150 to the screen center.
 * Once falling is complete, units within a 300px diameter area around the center receive damage.
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
    allyUnits: params.allyUnits,
    enemyUnits: params.enemyUnits,
  });
}

/**
 * updateTeamMeteorEffects
 *
 * For each meteor effect:
 * - During the falling phase (first 20 frames), interpolate the y-position from start to the screen center.
 * - Once falling is complete, apply damage to all units within a 150px radius of the center,
 *   then gradually fade out the meteor effect.
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
      // Impact phase: apply damage to all units within radius 150 of the center
      const explosionCenter = { x: params.app.screen.width / 2, y: targetY };
      const allUnits = [...params.allyUnits, ...params.enemyUnits];
      allUnits.forEach((unit) => {
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
