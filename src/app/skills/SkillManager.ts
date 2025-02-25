import * as PIXI from "pixi.js";
import { processTeamLockOnLaserAttacks } from "./LockOnLaserProcess";
import { processTeamCrossBurstAttacks } from "./CrossBurstProcess";
import { processTeamPenetratingSpreadAttacks } from "./PenetratingSpreadProcess";
import { processTeamEchoBladeAttacks } from "./EchoBladeProcess";
import { processTeamGuardianFallAttacks } from "./GuardianFallProcess";
import { processTeamBlitzShockAttacks } from "./BlitzShockProcess";
import { processTeamSpiralShotAttacks } from "./SpiralShotProcess";
import { processTeamFlameEdgeAttacks } from "./FlameEdgeProcess";
import { processTeamLorenzBurstAttacks } from "./LorenzBurstProcess";
import { processTeamParabolicLauncherAttacks } from "./ParabolicLauncherProcess";

export class SkillManager {
  constructor(
    public app: PIXI.Application,
    public allyUnits: any[],
    public enemyUnits: any[],
    public lasers: any[],
    public crossBursts: any[],
    public spreadBullets: any[],
    public echoBladeEffects: any[],
    public guardianEffects: any[],
    public blitzShockEffects: any[],
    public spiralShotEffects: any[],
    public flameEdgeEffects: any[],
    public lorenzBurstEffects: any[],
    public parabolicLauncherEffects: any[],
    public damageTexts: any[],
    public counter: number
  ) {}

  update() {
    processTeamLockOnLaserAttacks(
      this.counter,
      this.allyUnits,
      this.enemyUnits,
      this.app,
      this.damageTexts,
      this.lasers
    );
    processTeamCrossBurstAttacks({
      app: this.app,
      allies: this.allyUnits,
      enemies: this.enemyUnits,
      crossBursts: this.crossBursts,
      damageTexts: this.damageTexts,
      counter: this.counter,
    });
    processTeamPenetratingSpreadAttacks({
      app: this.app,
      allyUnits: this.allyUnits,
      enemyUnits: this.enemyUnits,
      spreadBullets: this.spreadBullets,
      updateTargetHP: (target: any, dmg: number) => {
        target.hp = Math.max(target.hp - dmg, 0);
      },
      damageTexts: this.damageTexts,
      counter: this.counter,
    });
    processTeamEchoBladeAttacks({
      app: this.app,
      allyUnits: this.allyUnits,
      enemyUnits: this.enemyUnits,
      echoBladeEffects: this.echoBladeEffects,
      updateTargetHP: (target: any, dmg: number) => {
        target.hp = Math.max(target.hp - dmg, 0);
      },
      damageTexts: this.damageTexts,
      attackFrame: this.counter,
    });
    processTeamGuardianFallAttacks({
      app: this.app,
      allyUnits: this.allyUnits,
      enemyUnits: this.enemyUnits,
      guardianEffects: this.guardianEffects,
      updateTargetHP: (target: any, dmg: number) => {
        target.hp = Math.max(target.hp - dmg, 0);
      },
      damageTexts: this.damageTexts,
      counter: this.counter,
    });
    processTeamBlitzShockAttacks({
      app: this.app,
      allyUnits: this.allyUnits,
      enemyUnits: this.enemyUnits,
      blitzShockEffects: this.blitzShockEffects,
      damageTexts: this.damageTexts,
      counter: this.counter,
      updateTargetHP: (target: any, dmg: number) => {
        target.hp = Math.max(target.hp - dmg, 0);
      },
    });
    processTeamSpiralShotAttacks({
      counter: this.counter,
      app: this.app,
      allyUnits: this.allyUnits,
      enemyUnits: this.enemyUnits,
      spiralShotEffects: this.spiralShotEffects,
      updateTargetHP: (target: any, dmg: number) => {
        target.hp = Math.max(target.hp - dmg, 0);
      },
      damageTexts: this.damageTexts,
    });
    processTeamFlameEdgeAttacks({
      app: this.app,
      allyUnits: this.allyUnits,
      enemyUnits: this.enemyUnits,
      flameEdgeEffects: this.flameEdgeEffects,
      updateTargetHP: (target: any, dmg: number) => {
        target.hp = Math.max(target.hp - dmg, 0);
      },
      damageTexts: this.damageTexts,
      attackFrame: this.counter,
    });
    processTeamLorenzBurstAttacks({
      counter: this.counter,
      app: this.app,
      allyUnits: this.allyUnits,
      enemyUnits: this.enemyUnits,
      lorenzBurstEffects: this.lorenzBurstEffects,
      updateTargetHP: (target: any, dmg: number) => {
        target.hp = Math.max(target.hp - dmg, 0);
      },
      damageTexts: this.damageTexts,
    });
    processTeamParabolicLauncherAttacks({
      app: this.app,
      allyUnits: this.allyUnits,
      enemyUnits: this.enemyUnits,
      parabolicLauncherEffects: this.parabolicLauncherEffects,
      damageTexts: this.damageTexts,
      counter: this.counter,
      updateTargetHP: (target: any, dmg: number) => {
        target.hp = Math.max(target.hp - dmg, 0);
      },
    });
  }
}
