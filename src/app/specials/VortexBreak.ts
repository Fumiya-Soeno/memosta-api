// specials/VortexBreak.ts
import * as PIXI from "pixi.js";
import { UnitText } from "../../types/UnitText";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";

export interface VortexBreakEffect {
  graphics: PIXI.Graphics;
  startX: number;
  startY: number;
  initialOffset: number; // Unique offset (in radians) for this projectile
  baseAngle: number; // Base direction (in radians)
  speed: number;
  spiralRate: number; // How quickly the spiral rotates over time
  age: number;
  lifetime: number; // Total frames the projectile lives
  damage: number;
  team: "ally" | "enemy";
}

/**
 * handleVortexBreakAttack
 * When a unit with special_name "ボルテックスブレイク" attacks,
 * this function spawns multiple projectiles (12 here) from the unit’s position.
 * Each projectile gets a unique initial angular offset so that, together, they form a swirling burst.
 */
export function handleVortexBreakAttack(params: {
  app: PIXI.Application;
  unit: UnitText;
  vortexBreakEffects: VortexBreakEffect[];
}): void {
  if (params.unit.unit.special_name !== "ボルテックスブレイク") return;

  const numProjectiles = 12;
  const startX = params.unit.text.x;
  const startY = params.unit.text.y;
  // We want the projectiles to initially move upward; set base angle to -90°.
  const baseAngle = -Math.PI / 2;
  const speed = 3; // Adjust as needed
  const spiralRate = 0.1; // How fast the spiral rotates
  const lifetime = 100; // Projectile lifetime in frames
  const damage = params.unit.unit.attack * 2; // 200% damage
  const team = params.unit.team;

  for (let i = 0; i < numProjectiles; i++) {
    const initialOffset = (2 * Math.PI * i) / numProjectiles;

    // Create a projectile graphic (a circle of radius 10)
    const gfx = new PIXI.Graphics();
    gfx.beginFill(0x8a2be2, 0.9); // Purple with 90% opacity
    gfx.drawCircle(0, 0, 10);
    gfx.endFill();
    gfx.x = startX;
    gfx.y = startY;
    params.app.stage.addChild(gfx);

    const effect: VortexBreakEffect = {
      graphics: gfx,
      startX,
      startY,
      initialOffset,
      baseAngle,
      speed,
      spiralRate,
      age: 0,
      lifetime,
      damage,
      team,
    };

    params.vortexBreakEffects.push(effect);
  }
}

/**
 * updateVortexBreakEffect
 * Updates a single vortex break projectile:
 * - It advances the projectile along a spiral trajectory.
 * - It checks for collision with enemy units (i.e. those on the opposite team).
 * - If a collision is detected (within a 20px threshold), damage is applied.
 * - When the projectile’s lifetime is reached, it is removed from the stage.
 */
export function updateVortexBreakEffect(params: {
  app: PIXI.Application;
  effect: VortexBreakEffect;
  targetUnits: UnitText[]; // The appropriate target units (enemy if caster is ally; ally if caster is enemy)
  updateTargetHP: (target: UnitText, damage: number) => void;
  damageTexts: DamageText[];
}): void {
  const collisionThreshold = 20; // in pixels
  params.effect.age++;
  const t = params.effect.age;

  // Calculate the distance traveled from the start
  const distance = params.effect.speed * t;
  // Effective angle: base angle + spiral rotation over time + initial offset
  const angle =
    params.effect.baseAngle +
    params.effect.spiralRate * t +
    params.effect.initialOffset;

  const newX = params.effect.startX + distance * Math.cos(angle);
  const newY = params.effect.startY + distance * Math.sin(angle);
  params.effect.graphics.x = newX;
  params.effect.graphics.y = newY;

  // Check for collision with each target unit (only those on the opposite team)
  params.targetUnits.forEach((unit) => {
    const dx = unit.text.x - newX;
    const dy = unit.text.y - newY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < collisionThreshold) {
      params.updateTargetHP(unit, params.effect.damage);
      showDamageText({
        app: params.app,
        damage: params.effect.damage,
        basePosition: { x: unit.text.x, y: unit.text.y },
        damageTexts: params.damageTexts,
      });
    }
  });

  if (params.effect.age >= params.effect.lifetime) {
    params.app.stage.removeChild(params.effect.graphics);
  }
}
