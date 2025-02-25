import * as PIXI from "pixi.js";
import { DamageText } from "../utils/DamageTextUtil";
import { UnitText } from "@/types/UnitText";
import {
  EarthquakeEffect,
  handleEarthquakeAttack,
  updateEarthquakeEffects,
} from "./Earthquake";

/**
 * processTeamEarthquakeAttacks
 *
 * 100フレームごとに、各チーム内の special_name が「アースクエイク」のユニットからアースクエイク攻撃を発動し、
 * その後、発生済みのエフェクトを更新します。更新処理では、最初の2フレームで攻撃ダメージを与え、徐々にフェードアウトさせます。
 *
 * @param params.app              PIXI.Application
 * @param params.allyUnits        味方側の UnitText 配列
 * @param params.enemyUnits       敵側の UnitText 配列
 * @param params.earthquakeEffects 発生中の EarthquakeEffect 配列
 * @param params.damageTexts      DamageText 配列
 * @param params.counter          現在のフレームカウンター
 * @param params.updateTargetHP   対象ユニットのHP更新用コールバック（対象とダメージを受け取る）
 */
export function processTeamEarthquakeAttacks(params: {
  app: PIXI.Application;
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  earthquakeEffects: EarthquakeEffect[];
  damageTexts: DamageText[];
  counter: number;
  updateTargetHP: (target: UnitText, damage: number) => void;
}): void {
  // 攻撃フェーズ: 100フレームごとに攻撃を発動
  if (params.counter % 100 === 0) {
    // 味方側の「アースクエイク」ユニット
    params.allyUnits
      .filter((u) => u.unit.special_name === "アースクエイク")
      .forEach((u) => {
        handleEarthquakeAttack({
          app: params.app,
          texts: [u],
          earthquakeEffects: params.earthquakeEffects,
        });
      });
    // 敵側も同様
    params.enemyUnits
      .filter((u) => u.unit.special_name === "アースクエイク")
      .forEach((u) => {
        handleEarthquakeAttack({
          app: params.app,
          texts: [u],
          earthquakeEffects: params.earthquakeEffects,
        });
      });
  }
  // 更新フェーズ: 発生中のエフェクトを毎フレーム更新
  updateEarthquakeEffects({
    app: params.app,
    earthquakeEffects: params.earthquakeEffects,
    allyUnits: params.allyUnits,
    enemyUnits: params.enemyUnits,
    updateTargetHP: params.updateTargetHP,
    damageTexts: params.damageTexts,
  });
}
