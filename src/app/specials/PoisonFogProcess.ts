// specials/PoisonFogProcess.ts
import * as PIXI from "pixi.js";
import { DamageText, showDamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText"; // ※各ユニットのテキスト情報用の型
import {
  handlePoisonFogAttack,
  updatePoisonFogs,
  PoisonFog,
} from "./PoisonFog";

/**
 * processTeamPoisonFogAttacks
 *
 * ・攻撃フェーズ: 80フレームごとに、各チーム内で special_name が「毒霧」のユニットから
 *   毒霧エフェクトを発生させます。
 * ・更新フェーズ: 発生済みの毒霧エフェクトを更新し、発射元の反対チームのユニットと衝突した場合に
 *   ダメージを与え、ダメージテキストを表示します。
 *
 * ※ updateTargetHP は対象ユニットの HP を更新するためのコールバック関数です。
 */
export function processTeamPoisonFogAttacks(params: {
  app: PIXI.Application;
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  poisonFogs: PoisonFog[];
  damageTexts: DamageText[];
  counter: number;
  updateTargetHP: (target: UnitText, damage: number) => void;
}): void {
  // 攻撃フェーズ: 80フレームごとに発動
  if (params.counter % 80 === 0) {
    const allyPoisonUnits = params.allyUnits.filter(
      (u) => u.unit.special_name === "毒霧"
    );
    const enemyPoisonUnits = params.enemyUnits.filter(
      (u) => u.unit.special_name === "毒霧"
    );
    if (allyPoisonUnits.length > 0) {
      handlePoisonFogAttack({
        app: params.app,
        texts: allyPoisonUnits,
        poisonFogs: params.poisonFogs,
      });
    }
    if (enemyPoisonUnits.length > 0) {
      handlePoisonFogAttack({
        app: params.app,
        texts: enemyPoisonUnits,
        poisonFogs: params.poisonFogs,
      });
    }
  }

  // 更新フェーズ: 毎フレーム、発生済みの毒霧エフェクトを更新し、
  // 発射元の反対チームのユニットのみを対象にダメージ判定を行う
  updateTeamPoisonFogs({
    app: params.app,
    poisonFogs: params.poisonFogs,
    allyUnits: params.allyUnits,
    enemyUnits: params.enemyUnits,
    updateTargetHP: params.updateTargetHP,
    damageTexts: params.damageTexts,
  });
}

/**
 * updateTeamPoisonFogs
 *
 * 各毒霧エフェクトの age を更新し、透明度を初期値0.7から線形に0へフェードアウトさせます。
 * 発射元のチーム情報（fog.team）に応じて、対象となるユニットリストを選択し（味方なら敵、敵なら味方）、
 * 対象との距離が 100px 未満の場合にダメージとダメージテキストを適用します。
 */
export function updateTeamPoisonFogs(params: {
  app: PIXI.Application;
  poisonFogs: PoisonFog[];
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  updateTargetHP: (target: UnitText, damage: number) => void;
  damageTexts: DamageText[];
}): void {
  params.poisonFogs.forEach((fog, i) => {
    fog.age++;
    fog.graphics.alpha = 0.7 * (1 - fog.age / fog.lifetime);

    // 発射元のチームに応じ、対象となるユニットは反対チームのみ
    const targets = fog.team === "ally" ? params.enemyUnits : params.allyUnits;
    targets.forEach((target) => {
      const dx = target.text.x - fog.pos.x;
      const dy = target.text.y - fog.pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 100) {
        params.updateTargetHP(target, fog.damage);
        showDamageText({
          app: params.app,
          damage: fog.damage,
          basePosition: { x: target.text.x, y: target.text.y },
          damageTexts: params.damageTexts,
        });
      }
    });

    if (fog.age >= fog.lifetime) {
      params.app.stage.removeChild(fog.graphics);
      params.poisonFogs.splice(i, 1);
    }
  });
}
