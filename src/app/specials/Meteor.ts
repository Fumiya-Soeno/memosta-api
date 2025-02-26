// specials/Meteor.ts
import * as PIXI from "pixi.js";
import { UnitText } from "../../types/UnitText";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";

export interface MeteorEffect {
  graphics: PIXI.Graphics;
  age: number;
  fallingDuration: number; // Duration (in frames) for falling phase (20 frames)
  damage: number; // Damage to apply on impact (300% of attack)
  team: "ally" | "enemy"; // Triggering unit's team
}

/**
 * handleMeteorAttack
 * Triggers a meteor attack for a given unit.
 * The meteor effect starts above the screen (y = -150) and falls to the center of the screen.
 * Once falling is complete (after 20 frames), it deals damage (300% of the unit’s attack)
 * to all units from the opposite team within a 300px diameter circle (radius 150) at the center.
 * The effect then gradually fades out.
 */
export function handleMeteorAttack(params: {
  app: PIXI.Application;
  unit: UnitText;
  meteorEffects: MeteorEffect[];
}): void {
  const startX = params.app.screen.width / 2;
  const startY = -150; // Start above the screen
  const targetY = params.app.screen.height / 2;
  const fallingDuration = 20;
  const damage = params.unit.unit.attack * 3.0; // 300% damage
  const team = params.unit.unit.team;

  // Create a meteor graphic: a circle with radius 150 (300px diameter)
  const meteorGraphic = new PIXI.Graphics();
  meteorGraphic.beginFill(0xffa500, 0.8); // Bright orange with 80% opacity
  meteorGraphic.drawCircle(0, 0, 150);
  meteorGraphic.endFill();
  meteorGraphic.x = startX;
  meteorGraphic.y = startY;
  params.app.stage.addChild(meteorGraphic);

  const effect: MeteorEffect = {
    graphics: meteorGraphic,
    age: 0,
    fallingDuration,
    damage,
    team,
  };
  params.meteorEffects.push(effect);
}
