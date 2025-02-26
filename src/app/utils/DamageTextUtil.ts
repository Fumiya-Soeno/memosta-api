// DamageTextUtil.ts
import * as PIXI from "pixi.js";

export interface DamageText {
  text: PIXI.Text;
  age: number;
  lifetime: number;
  startX: number;
  startY: number;
  hVel: number;
  peakHeight: number;
}

/**
 * showDamageText
 * Generates a damage text at the specified base position and adds it to the stage.
 * Defaults: lifetime: 30 frames, random offset ±20px, horizontal drift -1 to +1 px/frame, peakHeight 20px.
 * If a negative damage value is provided, it is treated as healing:
 * - The text is colored green.
 * - A plus sign is prepended.
 * - A fixed horizontal velocity is used so that the healing text animates.
 */
export function showDamageText(params: {
  app: PIXI.Application;
  damage: number;
  basePosition: { x: number; y: number };
  damageTexts: DamageText[];
  lifetime?: number;
  offsetRange?: number;
  hVelRange?: number;
  peakHeight?: number;
}): void {
  const {
    app,
    damage,
    basePosition,
    damageTexts,
    lifetime = 30,
    offsetRange = 20,
    hVelRange = 2,
    peakHeight = 20,
  } = params;

  const isHealing = damage < 0;
  const textColor = isHealing ? 0x00ff00 : 0xff0000;
  const displayValue = isHealing
    ? Math.abs(damage).toFixed(1)
    : damage.toFixed(1);

  const dmgText = new PIXI.Text(
    displayValue,
    new PIXI.TextStyle({
      fontSize: 16,
      fill: textColor,
      fontWeight: "bold",
    })
  );
  dmgText.anchor.set(0.5);

  const randomOffsetX = Math.random() * (offsetRange * 2) - offsetRange;
  const randomOffsetY = Math.random() * (offsetRange * 2) - offsetRange;
  const startX = basePosition.x + randomOffsetX;
  const startY = basePosition.y + randomOffsetY;
  dmgText.x = startX;
  dmgText.y = startY;
  app.stage.addChild(dmgText);

  // For healing text, force a non-zero horizontal velocity (e.g., 1)
  const hVel = isHealing ? 1 : Math.random() * hVelRange - hVelRange / 2;

  damageTexts.push({
    text: dmgText,
    age: 0,
    lifetime,
    startX,
    startY,
    hVel,
    peakHeight,
  });
}

/**
 * updateDamageTexts
 * Updates each damage text's age and adjusts its alpha and position based on its progress.
 * Once a text's lifetime is exceeded, it is removed from the stage and the array.
 *
 * @param app PIXI.Application instance
 * @param damageTexts Array of DamageText objects
 */
export function updateDamageTexts(
  app: PIXI.Application,
  damageTexts: DamageText[]
): void {
  for (let i = damageTexts.length - 1; i >= 0; i--) {
    const dt = damageTexts[i];
    dt.age++;
    const progress = dt.age / dt.lifetime;
    dt.text.alpha = 1 - progress;
    dt.text.x = dt.startX + dt.hVel * dt.age;
    dt.text.y = dt.startY - 4 * dt.peakHeight * progress * (1 - progress);
    if (dt.age >= dt.lifetime) {
      app.stage.removeChild(dt.text);
      damageTexts.splice(i, 1);
    }
  }
}
