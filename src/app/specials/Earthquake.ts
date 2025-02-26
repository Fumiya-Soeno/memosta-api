import * as PIXI from "pixi.js";
import { showDamageText } from "../utils/DamageTextUtil";
import { UnitText } from "@/types/UnitText";

export interface EarthquakeEffect {
  graphics: PIXI.Graphics;
  age: number;
  lifetime: number;
  damage: number;
  team: "ally" | "enemy"; // Triggering unit's team
}

/**
 * handleEarthquakeAttack
 * For units with special_name "アースクエイク", every 100 frames,
 * an earthquake attack is triggered that covers the entire screen.
 * The overlay is applied for the first 2 frames to damage only units on the opposite team.
 */
export function handleEarthquakeAttack(params: {
  app: PIXI.Application;
  texts: UnitText[];
  earthquakeEffects: EarthquakeEffect[];
}): void {
  params.texts.forEach((attacker) => {
    if (attacker.unit.special_name !== "アースクエイク") return;
    const damage = attacker.unit.attack * 2.0;
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x555555, 1);
    overlay.drawRect(0, 0, params.app.screen.width, params.app.screen.height);
    overlay.endFill();
    overlay.alpha = 1;
    params.app.stage.addChild(overlay);
    // FIX: Use attacker.team (top-level) rather than attacker.unit.team
    params.earthquakeEffects.push({
      graphics: overlay,
      age: 0,
      lifetime: 20,
      damage,
      team: attacker.team,
    });
  });
}

/**
 * updateEarthquakeEffects
 * Updates each EarthquakeEffect every frame.
 * For the first 2 frames, damage is applied to units on the opposite team.
 * Then the overlay fades out and is removed.
 */
export function updateEarthquakeEffects(params: {
  app: PIXI.Application;
  earthquakeEffects: EarthquakeEffect[];
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  updateTargetHP: (target: UnitText, damage: number) => void;
  damageTexts: any[]; // DamageText[]
}): void {
  const {
    app,
    earthquakeEffects,
    allyUnits,
    enemyUnits,
    updateTargetHP,
    damageTexts,
  } = params;
  earthquakeEffects.forEach((eq, i) => {
    eq.age++;
    // Determine targets: if the triggering team is ally, damage enemy units; otherwise, damage ally units.
    const targets = eq.team === "ally" ? enemyUnits : allyUnits;
    if (eq.age <= 2) {
      targets.forEach((target: UnitText) => {
        updateTargetHP(target, eq.damage);
        showDamageText({
          app,
          damage: eq.damage,
          basePosition: { x: target.text.x, y: target.text.y },
          damageTexts,
          lifetime: 30,
        });
      });
    }
    eq.graphics.alpha = 1 - eq.age / eq.lifetime;
    if (eq.age >= eq.lifetime) {
      app.stage.removeChild(eq.graphics);
      earthquakeEffects.splice(i, 1);
    }
  });
}
