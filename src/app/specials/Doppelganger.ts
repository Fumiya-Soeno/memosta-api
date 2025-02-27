import * as PIXI from "pixi.js";
import { UnitText } from "../../types/UnitText";

/**
 * handleDoppelgangerAttack
 * If the given unit has special_name "ドッペルゲンガー" and no duplicate exists for its team,
 * create a duplicate unit. The duplicate’s attack is 1/5 of the original, its HP is set to 10,
 * it only uses the "ロックオンレーザー" skill (normal attack) and does not move.
 * The duplicate is marked with the property isDuplicate.
 */
export function handleDoppelgangerAttack(params: {
  app: PIXI.Application;
  unit: UnitText;
  doppelgangerUnits: UnitText[];
}): UnitText | null {
  if (params.unit.unit.special_name !== "ドッペルゲンガー") return null;

  // Check if a duplicate already exists for this team.
  const team = params.unit.unit.team;

  // Create duplicate text using the original unit’s text and style.
  const duplicateText = new PIXI.Text(
    params.unit.text.text,
    params.unit.text.style
  );
  duplicateText.anchor.set(0.5);
  duplicateText.x = params.unit.text.x;
  duplicateText.y = params.unit.text.y;

  // Create a new HP bar for the duplicate.
  const duplicateHPBar = new PIXI.Graphics();
  params.app.stage.addChild(duplicateHPBar);

  // Construct the duplicate unit.
  const duplicate: UnitText = {
    text: duplicateText,
    hp: params.unit.unit.life / 10,
    maxHp: params.unit.unit.life / 10,
    vx: 0, // Duplicate does not move.
    vy: 0,
    hpBar: duplicateHPBar,
    unit: {
      ...params.unit.unit,
      attack: params.unit.unit.attack / 5, // 1/5 of original attack.
      life: 10,
      skill_name: params.unit.unit.skill_name, // Only normal attack.
      special_name: "", // No special behavior.
      team,
    },
    isDuplicate: true,
  };

  // Add duplicate to the stage.
  params.app.stage.addChild(duplicateText);

  return duplicate;
}
