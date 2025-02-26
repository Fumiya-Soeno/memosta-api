// specials/Doppelganger.ts
import * as PIXI from "pixi.js";
import { UnitText } from "../../types/UnitText";

/**
 * handleDoppelgangerAttack
 * If the provided unit has special_name "ドッペルゲンガー" and no duplicate is already on the field,
 * this function creates a duplicate unit. The duplicate’s attack is 1/5 of the original,
 * its HP is set to 1000, its speed is 1, and its skill is changed to "ロックオンレーザー".
 * A new property "isDuplicate" is added to mark it as a duplicate.
 */
export function handleDoppelgangerAttack(params: {
  app: PIXI.Application;
  unit: UnitText;
  doppelgangerUnits: UnitText[];
}): UnitText | null {
  if (params.unit.unit.special_name !== "ドッペルゲンガー") return null;

  // Check if a duplicate already exists for this team.
  const team = params.unit.unit.team;
  const existing = params.doppelgangerUnits.find(
    (u) => u.isDuplicate === true && u.unit.team === team
  );
  if (existing) return null;

  // Create a new PIXI.Text for the duplicate (using the original's text content and style)
  const duplicateText = new PIXI.Text(
    params.unit.text.text,
    params.unit.text.style
  );
  duplicateText.anchor.set(0.5);
  duplicateText.x = params.unit.text.x;
  duplicateText.y = params.unit.text.y;

  // Create a new HP bar for the duplicate.
  const duplicateHPBar = new PIXI.Graphics();

  // Clone the unit data and modify it for the duplicate.
  const duplicateUnit: UnitText = {
    text: duplicateText,
    hp: 30,
    maxHp: 30,
    vx: 0,
    vy: 0,
    hpBar: duplicateHPBar,
    // Copy unit properties and override attack, life, and special skill.
    unit: {
      ...params.unit.unit,
      attack: params.unit.unit.attack / 5,
      life: 30,
      skill_name: params.unit.unit.skill_name,
      special_name: "", // No further duplication
      vector: params.unit.unit.vector,
      team, // keep same team
    },
    // Mark as duplicate so that it isn’t duplicated again.
    isDuplicate: true,
  };

  // Add the duplicate's visual elements to the stage.
  params.app.stage.addChild(duplicateHPBar);
  params.app.stage.addChild(duplicateText);

  return duplicateUnit;
}
