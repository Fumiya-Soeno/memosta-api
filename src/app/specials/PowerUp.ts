import * as PIXI from "pixi.js";
import { UnitText } from "@/types/UnitText"; // ※実際の型定義に合わせて調整してください

export interface PowerUpEffect {
  unitText: UnitText;
  remaining: number;
  effect: PIXI.Graphics;
}

/**
 * handlePowerUpAttack
 * 100フレームごとに、special_name が "パワーアップ" のユニットに対して
 * 攻撃力上昇（30%上昇、60フレーム持続）のバフ効果と、周囲に見やすいエフェクトを表示します。
 * ここでは、ユニットの攻撃力を baseAttack に対して1.3倍に更新します。
 */
export function handlePowerUpAttack(params: {
  app: PIXI.Application;
  texts: UnitText[];
  powerUpEffects: PowerUpEffect[];
}) {
  params.texts.forEach((ut) => {
    if (ut.unit.special_name === "パワーアップ") {
      // すでに効果が付与されている場合は何もしない
      const existing = params.powerUpEffects.find((pe) => pe.unitText === ut);
      if (!existing) {
        // バフ効果：攻撃力上昇倍率を1.3に設定（※baseAttackはもともとの攻撃力）
        ut.unit.attack = ut.baseAttack * 1.3;
        ut.powerUpMultiplier = 1.3;
        // 視覚エフェクトの作成（白背景でも見やすいオーラ）
        const effect = new PIXI.Graphics();
        // 太めのオレンジ色アウトラインと、半透明のオレンジ色塗りでオーラを描画
        effect.lineStyle(4, 0xffa500, 1);
        effect.beginFill(0xffe066, 0.4);
        effect.drawCircle(0, 0, 35);
        effect.endFill();
        // 初期位置は対象ユニットの現在位置
        effect.x = ut.text.x;
        effect.y = ut.text.y;
        params.app.stage.addChild(effect);
        // 効果を登録（60フレーム持続）
        params.powerUpEffects.push({ unitText: ut, remaining: 60, effect });
      }
    }
  });
}

/**
 * updatePowerUpEffects
 * 毎フレーム、各バフ効果の残存時間を減少させ、効果中はエフェクトの位置とスケールを更新し、
 * 残存時間がなくなったら解除します。解除時に、ユニットの攻撃力を baseAttack に戻します。
 */
export function updatePowerUpEffects(params: {
  powerUpEffects: PowerUpEffect[];
}) {
  for (let i = params.powerUpEffects.length - 1; i >= 0; i--) {
    const effectObj = params.powerUpEffects[i];
    effectObj.remaining--;
    // エフェクトの位置を対象ユニットに合わせる
    effectObj.effect.x = effectObj.unitText.text.x;
    effectObj.effect.y = effectObj.unitText.text.y;
    // 軽いパルス効果（スケール変化）
    const scale = 1 + 0.1 * Math.sin((effectObj.remaining * Math.PI) / 5);
    effectObj.effect.scale.set(scale);
    if (effectObj.remaining <= 0) {
      // 効果解除：倍率を元に戻す
      effectObj.unitText.unit.attack = effectObj.unitText.baseAttack;
      effectObj.unitText.powerUpMultiplier = 1.0;
      if (effectObj.effect.parent) {
        effectObj.effect.parent.removeChild(effectObj.effect);
      }
      params.powerUpEffects.splice(i, 1);
    }
  }
}
