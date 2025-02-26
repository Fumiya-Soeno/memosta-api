import * as PIXI from "pixi.js";
import { DamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText";
import { handleRegenAttack } from "./Regen";

/**
 * processTeamRegenAttacks
 * Every 10 frames, for each unit (from both teams) that has special_name "リジェネ",
 * calls handleRegenAttack to recover HP and display a healing text.
 *
 * @param params.app         PIXI.Application instance.
 * @param params.allyUnits   Array of UnitText for the ally team.
 * @param params.enemyUnits  Array of UnitText for the enemy team.
 * @param params.damageTexts Array for displaying healing text.
 * @param params.counter     Current frame counter.
 */
export function processTeamRegenAttacks(params: {
  app: PIXI.Application;
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  damageTexts: DamageText[];
  counter: number;
}): void {
  if (params.counter % 15 !== 0) return;

  // Process ally units
  params.allyUnits.forEach((unit) => {
    if (unit.unit.special_name === "リジェネ") {
      handleRegenAttack({
        app: params.app,
        unit,
        damageTexts: params.damageTexts,
      });
    }
  });

  // Process enemy units
  params.enemyUnits.forEach((unit) => {
    if (unit.unit.special_name === "リジェネ") {
      handleRegenAttack({
        app: params.app,
        unit,
        damageTexts: params.damageTexts,
      });
    }
  });
}
