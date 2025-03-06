// skills/LorenzBurst.ts
import * as PIXI from "pixi.js";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText";

export interface LorenzBurstEffect {
  graphics: PIXI.Graphics;
  centerX: number;
  centerY: number;
  lifetime: number; // starts at 4 frames and counts down
  damage: number;
  team: "ally" | "enemy";
}

/**
 * handleLorenzBurstAttack
 * Every 12 frames, if a unit’s skill_name is "ローレンツバースト", an electric attack effect is generated
 * at the unit’s position. The effect covers a circle of approximately 50px in diameter and
 * deals damage equal to 20% of the unit's attack. The effect lasts for 4 frames.
 */
export function handleLorenzBurstAttack(params: {
  app: PIXI.Application;
  texts: UnitText[];
  lorenzBurstEffects: LorenzBurstEffect[];
}) {
  // Find a unit with the "ローレンツバースト" skill.
  const attacker = params.texts.find(
    (ut) => ut.unit.skill_name === "ローレンツバースト"
  );
  if (!attacker) return;

  const centerX = attacker.text.x;
  const centerY = attacker.text.y;
  const damage = attacker.unit.attack * 0.2;

  const effect: LorenzBurstEffect = {
    graphics: new PIXI.Graphics(),
    centerX,
    centerY,
    lifetime: 10,
    damage,
    team: attacker.team,
  };

  effect.graphics.x = centerX;
  effect.graphics.y = centerY;
  effect.graphics.alpha = 1;
  // Ensure that the effect is drawn behind other objects.
  params.app.stage.sortableChildren = true;
  effect.graphics.zIndex = 0;
  params.app.stage.addChild(effect.graphics);
  params.app.stage.sortChildren();

  params.lorenzBurstEffects.push(effect);
}

/**
 * updateLorenzBurstEffects
 * Each LorenzBurstEffect is updated every frame. The effect is drawn as a dynamic,
 * random polyline within a circle of radius ~25px (i.e. 50px diameter). The effect fades out over 4 frames.
 * If any target from the opposite team is within the circle, damage is applied.
 */
export function updateLorenzBurstEffects(params: {
  app: PIXI.Application;
  lorenzBurstEffects: LorenzBurstEffect[];
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  updateTargetHP: (target: UnitText, damage: number) => void;
  damageTexts: DamageText[];
}) {
  const { app, lorenzBurstEffects, updateTargetHP, damageTexts } = params;
  const radius = 150; // 50px diameter
  lorenzBurstEffects.forEach((effect, index) => {
    // Decrease lifetime and fade out.
    effect.lifetime--;
    effect.graphics.alpha = effect.lifetime / 4;

    // Clear the graphics and redraw a "Lorenz-like" electric pattern.
    effect.graphics.clear();
    effect.graphics.lineStyle(3, 0x0000ff, effect.graphics.alpha);
    const numPoints = 10;
    let points: { x: number; y: number }[] = [];
    for (let i = 0; i < numPoints; i++) {
      let angle = (i / numPoints) * 2 * Math.PI;
      // Add small random deviation.
      angle += (Math.random() - 0.5) * 0.3;
      const r = radius + (Math.random() - 0.5) * 5;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      points.push({ x, y });
    }
    if (points.length > 0) {
      effect.graphics.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        effect.graphics.lineTo(points[i].x, points[i].y);
      }
      effect.graphics.lineTo(points[0].x, points[0].y);
    }

    // Collision detection: for units of opposite team within the circle.
    const targets =
      effect.team === "ally" ? params.enemyUnits : params.allyUnits;
    targets.forEach((target) => {
      const dx = target.text.x - effect.centerX;
      const dy = target.text.y - effect.centerY;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < radius) {
        updateTargetHP(target, effect.damage);
        showDamageText({
          app,
          damage: effect.damage,
          basePosition: { x: target.text.x, y: target.text.y },
          damageTexts,
        });
      }
    });

    if (effect.lifetime <= 0) {
      app.stage.removeChild(effect.graphics);
      lorenzBurstEffects.splice(index, 1);
    }
  });
}
