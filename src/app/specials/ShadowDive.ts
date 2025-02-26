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
 * 3. Creates a black crescent slash effect at the enemy, rotated based on the relative positions.
 * 4. Immediately applies 500% damage to the enemy and displays damage text.
 * 5. Leaves behind 10 ghost images (残像) of the unit's text along the path.
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

  // Save the original position for ghost images.
  const originalX = params.unit.text.x;
  const originalY = params.unit.text.y;

  // Teleport the caster behind the enemy.
  const offset = 30; // Distance behind enemy
  const newX = nearest.text.x - Math.cos(angleRad) * offset;
  const newY = nearest.text.y - Math.sin(angleRad) * offset;
  params.unit.text.x = newX;
  params.unit.text.y = newY;

  // Create ghost images (残像) along the path.
  const numGhosts = 10;
  for (let i = 1; i <= numGhosts; i++) {
    // Clone the unit's text.
    const ghost = new PIXI.Text(params.unit.text.text, params.unit.text.style);
    ghost.anchor.set(0.5);
    // Interpolate position between the original and new positions.
    ghost.x = originalX + ((newX - originalX) * i) / (numGhosts + 1);
    ghost.y = originalY + ((newY - originalY) * i) / (numGhosts + 1);
    // Set a fading alpha (ghosts get fainter along the trail).
    ghost.alpha = 0.5 * (1 - i / (numGhosts + 1));
    params.app.stage.addChild(ghost);
    // Remove the ghost after ~30 frames (at 60 FPS, 30 frames ≈ 500ms)
    setTimeout(() => {
      if (ghost.parent) ghost.parent.removeChild(ghost);
    }, 500);
  }

  // Calculate damage (500% of caster's attack).
  const damage = params.unit.unit.attack * 5.0;

  // Create a black crescent slash effect.
  const effectGfx = new PIXI.Graphics();
  effectGfx.beginFill(0x000000);
  // Draw a crescent shape using two arcs (outer and inner)
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

  // Position the effect at the enemy's location and rotate it based on the angle.
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
