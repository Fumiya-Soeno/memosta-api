import * as PIXI from "pixi.js";
import { UnitText } from "../../types/UnitText";
import { handleDoppelgangerAttack } from "./Doppelganger";

/**
 * processTeamDoppelgangerAttacks
 * Every 100 frames, for each unit (first checking ally units, then enemy units)
 * with special_name "ドッペルゲンガー", if no duplicate exists for that team,
 * spawn a duplicate unit. The duplicate is added to both the team's unit array
 * and to the doppelganger tracking array.
 */
export function processTeamDoppelgangerAttacks(params: {
  app: PIXI.Application;
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  doppelgangerUnits: UnitText[];
  counter: number;
}): void {
  if (params.counter % 200 !== 0) return;

  // Process ally units.
  params.allyUnits
    .filter((u) => u.unit.special_name === "ドッペルゲンガー")
    .forEach((u) => {
      const duplicate = handleDoppelgangerAttack({
        app: params.app,
        unit: u,
        doppelgangerUnits: params.doppelgangerUnits,
      });
      if (duplicate) {
        params.allyUnits.push(duplicate);
        params.doppelgangerUnits.push(duplicate);
      }
    });

  // Process enemy units.
  params.enemyUnits
    .filter((u) => u.unit.special_name === "ドッペルゲンガー")
    .forEach((u) => {
      const duplicate = handleDoppelgangerAttack({
        app: params.app,
        unit: u,
        doppelgangerUnits: params.doppelgangerUnits,
      });
      if (duplicate) {
        params.enemyUnits.push(duplicate);
        params.doppelgangerUnits.push(duplicate);
      }
    });
}
