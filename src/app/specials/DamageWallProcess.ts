// specials/DamageWallProcess.ts
import * as PIXI from "pixi.js";
import { DamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText";
import {
  handleDamageWallAttack,
  updateDamageWallEffects,
  DamageWallEffect,
} from "./DamageWall";

/**
 * processTeamDamageWallAttacks
 *
 * 100フレームごとに、味方または敵のユニットの中から special_name が「ダメージウォール」
 * を持つユニットがいれば、ダメージウォールを発生させ、その後既存のエフェクトを更新します。
 *
 * @param params.app              PIXI.Application
 * @param params.allyUnits        味方ユニットの配列（UnitTextとして扱う）
 * @param params.enemyUnits       敵ユニットの配列（UnitTextとして扱う）
 * @param params.damageWallEffects 発生中のダメージウォールエフェクトの配列
 * @param params.damageTexts      ダメージテキストの配列
 * @param params.counter          現在のフレームカウンター
 * @param params.updateTargetHP   対象ユニットのHPを更新するコールバック
 */
export function processTeamDamageWallAttacks(params: {
  app: PIXI.Application;
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  damageWallEffects: DamageWallEffect[];
  damageTexts: DamageText[];
  counter: number;
  updateTargetHP: (target: UnitText, damage: number) => void;
}): void {
  // 発動タイミング: 100フレームごとに発動
  if (params.counter % 100 === 0) {
    // 味方側の「ダメージウォール」を持つユニットを全て処理
    params.allyUnits
      .filter((u) => u.unit.special_name === "ダメージウォール")
      .forEach((u) => {
        handleDamageWallAttack({
          app: params.app,
          unit: u,
          damageWallEffects: params.damageWallEffects,
        });
      });
    // 敵側の「ダメージウォール」を持つユニットを全て処理
    params.enemyUnits
      .filter((u) => u.unit.special_name === "ダメージウォール")
      .forEach((u) => {
        handleDamageWallAttack({
          app: params.app,
          unit: u,
          damageWallEffects: params.damageWallEffects,
        });
      });
  }

  // 更新フェーズ: 既存のダメージウォール効果を更新
  updateDamageWallEffects({
    app: params.app,
    damageWallEffects: params.damageWallEffects,
    allyUnits: params.allyUnits,
    enemyUnits: params.enemyUnits,
    updateTargetHP: params.updateTargetHP,
    damageTexts: params.damageTexts,
  });
}
