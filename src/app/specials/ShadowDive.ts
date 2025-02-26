// specials/ShadowDive.ts
import * as PIXI from "pixi.js";
import { UnitText } from "../../types/UnitText";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";

export interface ShadowDiveEffect {
  graphics: PIXI.Graphics;
  age: number; // Age in frames (0 to 30)
  damage: number;
  team: "ally" | "enemy";
}

/**
 * handleShadowDiveAttack
 * For a given unit with special_name "シャドウダイブ", this function:
 * 1. Finds the nearest enemy.
 * 2. Teleports the caster behind that enemy.
 * 3. Creates a black crescent slash effect at the enemy,
 *    oriented according to the relative positions at the time of the attack.
 * 4. Immediately applies 500% damage to the enemy and displays damage text.
 */
export function handleShadowDiveAttack(params: {
  app: PIXI.Application;
  unit: UnitText;
  enemyUnits: UnitText[];
  shadowDiveEffects: ShadowDiveEffect[];
  damageTexts: DamageText[];
  updateTargetHP: (target: UnitText, damage: number) => void;
}): void {
  // Find the nearest enemy.
  let nearest: UnitText | null = null;
  let minDist = Infinity;
  for (const enemy of params.enemyUnits) {
    const dx = enemy.text.x - params.unit.text.x;
    const dy = enemy.text.y - params.unit.text.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      minDist = dist;
      nearest = enemy;
    }
  }
  if (!nearest) return;

  // Calculate the angle from the caster to the enemy.
  const angleRad = Math.atan2(
    nearest.text.y - params.unit.text.y,
    nearest.text.x - params.unit.text.x
  );

  // Teleport the caster behind the enemy.
  const offset = 30; // Distance behind enemy
  const newX = nearest.text.x - Math.cos(angleRad) * offset;
  const newY = nearest.text.y - Math.sin(angleRad) * offset;
  params.unit.text.x = newX;
  params.unit.text.y = newY;

  // Calculate damage (500% of caster's attack).
  const damage = params.unit.unit.attack * 5.0;

  // Create a black crescent slash effect.
  const effectGfx = new PIXI.Graphics();
  effectGfx.beginFill(0x000000);
  // Draw a crescent using two arcs (outer and inner) to form a crescent shape.
  const outerRadius = 40;
  const innerRadius = 20;
  effectGfx.moveTo(
    outerRadius * Math.cos((210 * Math.PI) / 180),
    outerRadius * Math.sin((210 * Math.PI) / 180)
  );
  effectGfx.arc(
    0,
    0,
    outerRadius,
    (210 * Math.PI) / 180,
    (330 * Math.PI) / 180
  );
  effectGfx.lineTo(
    innerRadius * Math.cos((330 * Math.PI) / 180),
    innerRadius * Math.sin((330 * Math.PI) / 180)
  );
  effectGfx.arc(
    0,
    0,
    innerRadius,
    (330 * Math.PI) / 180,
    (210 * Math.PI) / 180,
    true
  );
  effectGfx.closePath();
  effectGfx.endFill();

  // Position the effect at the enemy's location and set its rotation based on the calculated angle.
  effectGfx.x = nearest.text.x;
  effectGfx.y = nearest.text.y;
  effectGfx.rotation = angleRad;
  params.app.stage.addChild(effectGfx);

  // Immediately apply damage to the enemy.
  params.updateTargetHP(nearest, damage);
  showDamageText({
    app: params.app,
    damage: damage,
    basePosition: { x: nearest.text.x, y: nearest.text.y },
    damageTexts: params.damageTexts,
  });

  // Create a ShadowDiveEffect to manage the fade-out over 30 frames.
  const shadowEffect: ShadowDiveEffect = {
    graphics: effectGfx,
    age: 0,
    damage,
    team: params.unit.unit.team,
  };
  params.shadowDiveEffects.push(shadowEffect);
}
