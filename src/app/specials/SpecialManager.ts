// specials/SpecialManager.ts
import * as PIXI from "pixi.js";
import { processTeamPoisonFogAttacks } from "./PoisonFogProcess";
import { processTeamEarthquakeAttacks } from "./EarthquakeProcess";
import { processTeamPowerUpAttacks } from "./PowerUpProcess";
import { processTeamDamageWallAttacks } from "./DamageWallProcess";
import { processTeamMeteorAttacks } from "./MeteorProcess";
import { processTeamRegenAttacks } from "./RegenProcess";
import { processTeamHealingAttacks } from "./HealingProcess";
import { processTeamShadowDiveAttacks } from "./ShadowDiveProcess";
import { processTeamVortexBreakAttacks } from "./VortexBreakProcess";
import { processTeamDoppelgangerAttacks } from "./DoppelgangerProcess";

export class SpecialManager {
  constructor(
    public app: PIXI.Application,
    public allyUnits: any[],
    public enemyUnits: any[],
    public poisonFogs: any[],
    public earthquakeEffects: any[],
    public powerUpEffects: any[],
    public damageWallEffects: any[],
    public meteorEffects: any[],
    public regenEffects: any[],
    public healingEffects: any[],
    public shadowDiveEffects: any[],
    public vortexBreakEffects: any[],
    public doppelgangerUnits: any[],
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
    processTeamDamageWallAttacks({
      app: this.app,
      allyUnits: this.allyUnits,
      enemyUnits: this.enemyUnits,
      damageWallEffects: this.damageWallEffects,
      damageTexts: this.damageTexts,
      counter: this.counter,
      updateTargetHP: (target: any, dmg: number) => {
        target.hp = Math.max(target.hp - dmg, 0);
      },
    });
    processTeamMeteorAttacks({
      app: this.app,
      allyUnits: this.allyUnits,
      enemyUnits: this.enemyUnits,
      meteorEffects: this.meteorEffects,
      damageTexts: this.damageTexts,
      counter: this.counter,
      updateTargetHP: (target: any, dmg: number) => {
        target.hp = Math.max(target.hp - dmg, 0);
      },
    });
    processTeamRegenAttacks({
      app: this.app,
      allyUnits: this.allyUnits,
      enemyUnits: this.enemyUnits,
      damageTexts: this.damageTexts,
      counter: this.counter,
    });
    processTeamHealingAttacks({
      app: this.app,
      allyUnits: this.allyUnits,
      enemyUnits: this.enemyUnits,
      damageTexts: this.damageTexts,
      counter: this.counter,
    });
    processTeamShadowDiveAttacks({
      app: this.app,
      allyUnits: this.allyUnits,
      enemyUnits: this.enemyUnits,
      shadowDiveEffects: this.shadowDiveEffects,
      damageTexts: this.damageTexts,
      counter: this.counter,
      updateTargetHP: (target: any, dmg: number) => {
        target.hp = Math.max(target.hp - dmg, 0);
      },
    });
    processTeamVortexBreakAttacks({
      app: this.app,
      allyUnits: this.allyUnits,
      enemyUnits: this.enemyUnits,
      vortexBreakEffects: this.vortexBreakEffects,
      damageTexts: this.damageTexts,
      counter: this.counter,
      updateTargetHP: (target: any, dmg: number) => {
        target.hp = Math.max(target.hp - dmg, 0);
      },
    });
    processTeamDoppelgangerAttacks({
      app: this.app,
      allyUnits: this.allyUnits,
      enemyUnits: this.enemyUnits,
      doppelgangerUnits: this.doppelgangerUnits,
      counter: this.counter,
    });
  }
}
