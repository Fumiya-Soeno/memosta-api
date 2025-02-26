import * as PIXI from "pixi.js";
import { UnitText } from "../../types/UnitText";
import { DamageText } from "../utils/DamageTextUtil";

/**
 * handleHealingAttack
 * For a given unit (of type UnitText) with special_name "ヒーリング",
 * heals every allied unit (including itself) by 45% of the caster’s attack.
 * A healing text is displayed in green with a positive value.
 */
export function handleHealingAttack(params: {
  app: PIXI.Application;
  caster: UnitText;
  allyUnits: UnitText[];
  damageTexts: DamageText[];
}): void {
  if (params.caster.unit.special_name !== "ヒーリング") return;
  const healAmount = params.caster.unit.attack * 0.45;

  params.allyUnits.forEach((unit) => {
    // Increase HP but do not exceed maxHp
    unit.hp = Math.min(unit.hp + healAmount, unit.maxHp);

    // Create a healing text (green, positive value)
    const healingText = new PIXI.Text(
      "+" + healAmount.toFixed(1),
      new PIXI.TextStyle({
        fontSize: 16,
        fill: 0x00ff00, // green
        fontWeight: "bold",
      })
    );
    healingText.anchor.set(0.5);
    // Apply a small random offset for a dynamic feel
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    healingText.x = unit.text.x + offsetX;
    healingText.y = unit.text.y + offsetY;
    params.app.stage.addChild(healingText);

    // Create a DamageText object for healing; note that healing values are positive
    params.damageTexts.push({
      text: healingText,
      age: 0,
      lifetime: 30,
      startX: healingText.x,
      startY: healingText.y,
      hVel: Math.random() * 2 - 1,
      peakHeight: 20,
    });
  });
}
