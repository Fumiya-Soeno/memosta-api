import * as PIXI from "pixi.js";
import { ExtendedUnitText } from "../components/PixiCanvas";
import { DamageText, showDamageText } from "../utils/DamageTextUtil";
import {
  handleLorenzBurstAttack,
  updateLorenzBurstEffects,
  LorenzBurstEffect,
} from "./LorenzBurst";

/**
 * processTeamLorenzBurstAttacks
 * 12フレームごとに、skill_name が "ローレンツバースト" のユニット（友軍・敵双方）から攻撃を発動し、
 * エフェクトの更新を行います。
 * PixiCanvas.tsx側では、この関数を1行で呼び出すだけでローレンツバースト処理が実行されます。
 */
export function processTeamLorenzBurstAttacks(params: {
  counter: number;
  app: PIXI.Application;
  allyUnits: ExtendedUnitText[];
  enemyUnits: ExtendedUnitText[];
  lorenzBurstEffects: LorenzBurstEffect[];
  updateTargetHP: (target: ExtendedUnitText, dmg: number) => void;
  damageTexts: DamageText[];
}) {
  if (params.counter % 12 === 0) {
    // 友軍側の処理
    params.allyUnits
      .filter((ally) => ally.unit.skill_name === "ローレンツバースト")
      .forEach((ally) => {
        handleLorenzBurstAttack({
          app: params.app,
          texts: [ally],
          lorenzBurstEffects: params.lorenzBurstEffects,
        });
      });
    // 敵側の処理
    params.enemyUnits
      .filter((enemy) => enemy.unit.skill_name === "ローレンツバースト")
      .forEach((enemy) => {
        handleLorenzBurstAttack({
          app: params.app,
          texts: [enemy],
          lorenzBurstEffects: params.lorenzBurstEffects,
        });
      });
  }

  // エフェクトの更新
  updateLorenzBurstEffects({
    app: params.app,
    lorenzBurstEffects: params.lorenzBurstEffects,
    allyUnits: params.allyUnits,
    enemyUnits: params.enemyUnits,
    updateTargetHP: params.updateTargetHP,
    damageTexts: params.damageTexts,
  });
}
