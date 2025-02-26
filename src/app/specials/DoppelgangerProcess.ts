// specials/DoppelgangerProcess.ts
import * as PIXI from "pixi.js";
import { UnitText } from "../../types/UnitText";
import { handleDoppelgangerAttack } from "./Doppelganger";

/**
 * processTeamDoppelgangerAttacks
 * Every 200 frames, if a unit with special_name "ドッペルゲンガー" is found (ally units are preferred),
 * and if no duplicate is already present for that team, spawn a duplicate unit.
 * The duplicate is added to the same team’s unit array as well as to the doppelganger tracking array.
 */
export function processTeamDoppelgangerAttacks(params: {
  app: PIXI.Application;
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  doppelgangerUnits: UnitText[];
  counter: number;
}): void {
  if (params.counter % 100 !== 0) return;

  // Try to trigger for ally units first.
  const triggerAlly = params.allyUnits.find(
    (u) => u.unit.special_name === "ドッペルゲンガー"
  );
  if (triggerAlly) {
    const duplicate = handleDoppelgangerAttack({
      app: params.app,
      unit: triggerAlly,
      doppelgangerUnits: params.doppelgangerUnits,
    });
    if (duplicate) {
      params.allyUnits.push(duplicate);
      params.doppelgangerUnits.push(duplicate);
    }
  } else {
    // Otherwise, check enemy units.
    const triggerEnemy = params.enemyUnits.find(
      (u) => u.unit.special_name === "ドッペルゲンガー"
    );
    if (triggerEnemy) {
      const duplicate = handleDoppelgangerAttack({
        app: params.app,
        unit: triggerEnemy,
        doppelgangerUnits: params.doppelgangerUnits,
      });
      if (duplicate) {
        params.enemyUnits.push(duplicate);
        params.doppelgangerUnits.push(duplicate);
      }
    }
  }
}
