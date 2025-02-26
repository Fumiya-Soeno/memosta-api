// specials/Meteor.ts
import * as PIXI from "pixi.js";
import { UnitText } from "../../types/UnitText";

export interface MeteorEffect {
  graphics: PIXI.Graphics;
  age: number;
  fallingDuration: number; // Number of frames for falling (20 frames)
  damage: number; // 300% of the unit's attack
  team: "ally" | "enemy"; // The triggering unit's team
  exploded: boolean; // Flag to indicate if explosion phase has started
}

/**
 * handleMeteorAttack
 * Triggers a meteor attack for the given unit.
 * The meteor starts as a small circle (50px diameter) above the screen
 * and falls toward the center over a duration of fallingDuration frames.
 * When falling is complete, the meteor transitions into an explosion that expands and fades.
 */
export function handleMeteorAttack(params: {
  app: PIXI.Application;
  unit: UnitText;
  meteorEffects: MeteorEffect[];
}): void {
  const startX = params.app.screen.width / 2;
  const startY = -50; // Start with a small circle above the screen
  const targetY = params.app.screen.height / 2;
  const fallingDuration = 20;
  const damage = params.unit.unit.attack * 7.0; // 700% damage
  const team = params.unit.unit.team;

  // Create a small meteor graphic (circle with radius 25 => 50px diameter)
  const meteorGraphic = new PIXI.Graphics();
  meteorGraphic.beginFill(0xffa500, 0.8);
  meteorGraphic.drawCircle(0, 0, 25);
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
    exploded: false,
  };
  params.meteorEffects.push(effect);
}
