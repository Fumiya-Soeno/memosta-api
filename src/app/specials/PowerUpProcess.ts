import * as PIXI from "pixi.js";
import {
  handlePowerUpAttack,
  updatePowerUpEffects,
  PowerUpEffect,
} from "./PowerUp";
import { DamageText } from "../utils/DamageTextUtil";
import { UnitText } from "@/types/UnitText"; // ※実際の型定義に合わせて調整

/**
 * processTeamPowerUpAttacks
 *
 * 40フレームごとに、各チーム内で special_name が「パワーアップ」のユニットから
 * パワーアップ攻撃を発動し、その後発生中のエフェクトを更新します。
 *
 * @param params.app              PIXI.Application
 * @param params.allyUnits        味方ユニットの配列
 * @param params.enemyUnits       敵ユニットの配列
 * @param params.powerUpEffects   発生中のパワーアップエフェクトの配列
 * @param params.counter          現在のフレームカウンター
 */
export function processTeamPowerUpAttacks(params: {
  app: PIXI.Application;
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  powerUpEffects: PowerUpEffect[];
  counter: number;
}): void {
  if (params.counter % 40 === 0) {
    // 味方側の「パワーアップ」対象
    params.allyUnits.forEach((ally) => {
      if (ally.unit.special_name === "パワーアップ") {
        handlePowerUpAttack({
          app: params.app,
          texts: [ally],
          powerUpEffects: params.powerUpEffects,
        });
      }
    });
    // 敵側の「パワーアップ」対象
    params.enemyUnits.forEach((enemy) => {
      if (enemy.unit.special_name === "パワーアップ") {
        handlePowerUpAttack({
          app: params.app,
          texts: [enemy],
          powerUpEffects: params.powerUpEffects,
        });
      }
    });
  }
  // エフェクトの更新
  updatePowerUpEffects({
    powerUpEffects: params.powerUpEffects,
  });
}
