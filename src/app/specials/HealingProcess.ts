import * as PIXI from "pixi.js";
import { DamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText";
import { handleHealingAttack } from "./Healing";

/**
 * processTeamHealingAttacks
 * Every 30 frames, for each unit (from both teams) with special_name "ヒーリング",
 * calls handleHealingAttack to heal all allied units.
 *
 * @param params.app         PIXI.Application instance.
 * @param params.allyUnits   Array of UnitText for the ally team.
 * @param params.enemyUnits  Array of UnitText for the enemy team.
 * @param params.damageTexts Array for displaying healing text.
 * @param params.counter     Current frame counter.
 */
export function processTeamHealingAttacks(params: {
  app: PIXI.Application;
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  damageTexts: DamageText[];
  counter: number;
}): void {
  if (params.counter % 30 !== 0) return;

  // Process healing for ally team
  params.allyUnits.forEach((unit) => {
    if (unit.unit.special_name === "ヒーリング") {
      handleHealingAttack({
        app: params.app,
        caster: unit,
        allyUnits: params.allyUnits,
        damageTexts: params.damageTexts,
      });
    }
  });

  // Process healing for enemy team
  params.enemyUnits.forEach((unit) => {
    if (unit.unit.special_name === "ヒーリング") {
      handleHealingAttack({
        app: params.app,
        caster: unit,
        allyUnits: params.enemyUnits,
        damageTexts: params.damageTexts,
      });
    }
  });
}
