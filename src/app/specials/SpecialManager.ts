// SpecialManager.ts
import * as PIXI from "pixi.js";
import { processTeamPoisonFogAttacks } from "./PoisonFogProcess";
import { processTeamEarthquakeAttacks } from "./EarthquakeProcess";
import { processTeamPowerUpAttacks } from "./PowerUpProcess";

export class SpecialManager {
  constructor(
    public app: PIXI.Application,
    public allyUnits: any[],
    public enemyUnits: any[],
    public poisonFogs: any[],
    public earthquakeEffects: any[],
    public powerUpEffects: any[],
    public damageTexts: any[],
    public counter: number
  ) {}

  update() {
    processTeamPoisonFogAttacks({
      app: this.app,
      allyUnits: this.allyUnits,
      enemyUnits: this.enemyUnits,
      poisonFogs: this.poisonFogs,
      damageTexts: this.damageTexts,
      counter: this.counter,
      updateTargetHP: (target: any, dmg: number) => {
        target.hp = Math.max(target.hp - dmg, 0);
      },
    });
    processTeamEarthquakeAttacks({
      app: this.app,
      allyUnits: this.allyUnits,
      enemyUnits: this.enemyUnits,
      earthquakeEffects: this.earthquakeEffects,
      damageTexts: this.damageTexts,
      counter: this.counter,
      updateTargetHP: (target: any, dmg: number) => {
        target.hp = Math.max(target.hp - dmg, 0);
      },
    });
    processTeamPowerUpAttacks({
      app: this.app,
      allyUnits: this.allyUnits,
      enemyUnits: this.enemyUnits,
      powerUpEffects: this.powerUpEffects,
      counter: this.counter,
    });
  }
}
