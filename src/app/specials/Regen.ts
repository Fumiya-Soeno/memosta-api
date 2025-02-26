import * as PIXI from "pixi.js";
import { UnitText } from "../../types/UnitText";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";

/**
 * handleRegenAttack
 * For a given unit (of type UnitText) with special_name "リジェネ",
 * recovers HP equal to 10% of the unit’s attack, but not exceeding max HP.
 * A healing text is displayed in green (via showDamageText, which interprets negative damage as healing).
 */
export function handleRegenAttack(params: {
  app: PIXI.Application;
  unit: UnitText;
  damageTexts: DamageText[];
}): void {
  if (params.unit.unit.special_name !== "リジェネ") return;
  const healAmount = params.unit.unit.attack * 0.45;
  params.unit.hp = Math.min(params.unit.hp + healAmount, params.unit.maxHp);
  showDamageText({
    app: params.app,
    damage: -healAmount,
    basePosition: { x: params.unit.text.x, y: params.unit.text.y },
    damageTexts: params.damageTexts,
  });
}
