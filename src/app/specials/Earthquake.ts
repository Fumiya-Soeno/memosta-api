import * as PIXI from "pixi.js";
import { showDamageText } from "../utils/DamageTextUtil";
import { UnitText } from "@/types/UnitText";

export interface EarthquakeEffect {
  graphics: PIXI.Graphics;
  age: number;
  lifetime: number;
  damage: number;
  team: "ally" | "enemy"; // 発射元のチーム
}

/**
 * handleEarthquakeAttack
 * special_name が "アースクエイク" のユニットを対象として、100フレームごとに画面全体に
 * 威力50%の地震攻撃を発生させる。全画面を覆うオーバーレイを生成し、最初の2フレームに
 * 発射元の反対側のユニットに攻撃ダメージを与える。
 */
export function handleEarthquakeAttack(params: {
  app: PIXI.Application;
  texts: UnitText[];
  earthquakeEffects: EarthquakeEffect[];
}) {
  params.texts.forEach((attacker) => {
    if (attacker.unit.special_name !== "アースクエイク") return;
    const damage = attacker.unit.attack * 2.0;
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x555555, 1);
    overlay.drawRect(0, 0, params.app.screen.width, params.app.screen.height);
    overlay.endFill();
    overlay.alpha = 1;
    params.app.stage.addChild(overlay);
    params.earthquakeEffects.push({
      graphics: overlay,
      age: 0,
      lifetime: 20,
      damage,
      team: attacker.unit.team,
    });
  });
}

/**
 * updateEarthquakeEffects
 * 各 EarthquakeEffect を毎フレーム更新し、最初の2フレームは発射元の反対側のユニットに
 * 攻撃ダメージを与え、その後フェードアウトして消滅します。ダメージテキストの表示は
 * 汎用関数 showDamageText を利用します。
 */
export function updateEarthquakeEffects(params: {
  app: PIXI.Application;
  earthquakeEffects: EarthquakeEffect[];
  allyUnits: any[]; // ExtendedUnitText[]（友軍ユニット）
  enemyUnits: any[]; // ExtendedUnitText[]（敵ユニット）
  updateTargetHP: (target: any, damage: number) => void;
  damageTexts: any[]; // DamageText[]
}) {
  const {
    app,
    earthquakeEffects,
    allyUnits,
    enemyUnits,
    updateTargetHP,
    damageTexts,
  } = params;
  earthquakeEffects.forEach((eq, i) => {
    eq.age++;
    // 対象となるユニットは、発射元の反対側のチーム
    const targets = eq.team === "ally" ? enemyUnits : allyUnits;
    if (eq.age <= 2) {
      targets.forEach((target: any) => {
        updateTargetHP(target, eq.damage);
        showDamageText({
          app,
          damage: eq.damage,
          basePosition: { x: target.text.x, y: target.text.y },
          damageTexts,
          lifetime: 30,
        });
      });
    }
    eq.graphics.alpha = 1 - eq.age / eq.lifetime;
    if (eq.age >= eq.lifetime) {
      app.stage.removeChild(eq.graphics);
      earthquakeEffects.splice(i, 1);
    }
  });
}
