import * as PIXI from "pixi.js";
import { DamageText } from "../utils/DamageTextUtil";
import { UnitText } from "./LockOnLaser";
import {
  handleCrossBurstAttack,
  updateCrossBursts,
  CrossBurst,
} from "./CrossBurst";

/**
 * processTeamCrossBurstAttacks
 * 友軍と敵ユニットの両方から十字バースト攻撃を発動し、エフェクトを更新します。
 * PixiCanvas.tsxからはこの関数を1行で呼び出すだけで処理が実行されます。
 */
export function processTeamCrossBurstAttacks(params: {
  app: PIXI.Application;
  allies: UnitText[];
  enemies: UnitText[];
  crossBursts: CrossBurst[];
  damageTexts: DamageText[];
  counter: number;
}) {
  if (params.counter % 9 === 0) {
    const texts = [...params.allies, ...params.enemies];
    // 攻撃エフェクト生成
    handleCrossBurstAttack({
      app: params.app,
      texts,
      crossBursts: params.crossBursts,
    });
  }
  // エフェクトの更新処理（拡大フェーズとフェードアウトフェーズ）
  updateCrossBursts({
    app: params.app,
    allyUnits: params.allies,
    enemyUnits: params.enemies,
    crossBursts: params.crossBursts,
    damageTexts: params.damageTexts,
  });
}
