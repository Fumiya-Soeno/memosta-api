// specials/Earthquake.ts
import * as PIXI from "pixi.js";
import { DamageText } from "../skills/LockOnLaser"; // 必要に応じて共通型を再利用

export interface EarthquakeEffect {
  graphics: PIXI.Graphics;
  age: number;
  lifetime: number;
  damage: number;
}

export interface EarthquakeUnit {
  text: PIXI.Text;
  unit: {
    special_name: string;
    attack: number;
  };
}

/**
 * handleEarthquakeAttack
 * special_name が "アースクエイク" のユニットを対象として、100フレームごとに画面全体に
 * 威力50%の地震攻撃を発生させる。ここでは全画面を覆うオーバーレイを生成し、
 * 最初の2フレームに毎フレーム攻撃ダメージを与える。
 */
export function handleEarthquakeAttack(params: {
  app: PIXI.Application;
  texts: EarthquakeUnit[];
  earthquakeEffects: EarthquakeEffect[];
}) {
  const attacker = params.texts.find(
    (ut) => ut.unit.special_name === "アースクエイク"
  );
  if (!attacker) return;
  const damage = attacker.unit.attack * 2.0;
  // 全画面を覆うオーバーレイを生成
  const overlay = new PIXI.Graphics();
  overlay.beginFill(0x555555, 1);
  overlay.drawRect(0, 0, params.app.screen.width, params.app.screen.height);
  overlay.endFill();
  overlay.alpha = 1;
  params.app.stage.addChild(overlay);
  // lifetime: 20フレーム程度（必要に応じて調整）
  params.earthquakeEffects.push({
    graphics: overlay,
    age: 0,
    lifetime: 20,
    damage,
  });
}

/**
 * updateEarthquakeEffects
 * 各 EarthquakeEffect を毎フレーム更新し、最初の2フレームは攻撃ダメージを与えた後、
 * 残りの期間はフェードアウトして消滅する。攻撃判定は全画面に対して行われるため、
 * サンドバッグへのダメージ処理も実施する。
 */
export function updateEarthquakeEffects(params: {
  app: PIXI.Application;
  earthquakeEffects: EarthquakeEffect[];
  sandbagContainer: PIXI.Container;
  currentHPRef: { current: number };
  updateHPBar: () => void;
  damageTexts: DamageText[];
}) {
  const {
    app,
    earthquakeEffects,
    sandbagContainer,
    currentHPRef,
    updateHPBar,
    damageTexts,
  } = params;
  const sbBounds = sandbagContainer.getBounds();
  const sandbagCenter = {
    x: sbBounds.x + sbBounds.width / 2,
    y: sbBounds.y + sbBounds.height / 2,
  };

  for (let i = earthquakeEffects.length - 1; i >= 0; i--) {
    const eq = earthquakeEffects[i];
    eq.age++;
    // 攻撃判定：最初の2フレームに毎フレームダメージを与える
    if (eq.age <= 2) {
      currentHPRef.current = Math.max(currentHPRef.current - eq.damage, 0);
      updateHPBar();
      const dmgText = new PIXI.Text(
        eq.damage.toFixed(1),
        new PIXI.TextStyle({
          fontSize: 16,
          fill: 0xff0000,
          fontWeight: "bold",
        })
      );
      dmgText.anchor.set(0.5);
      dmgText.x = sandbagCenter.x;
      dmgText.y = sandbagCenter.y;
      app.stage.addChild(dmgText);
      damageTexts.push({
        text: dmgText,
        age: 0,
        lifetime: 30,
        startX: sandbagCenter.x,
        startY: sandbagCenter.y,
        hVel: 0,
        peakHeight: 20,
      });
    }
    // フェードアウトフェーズ：alpha を線形に低下
    eq.graphics.alpha = 1 - eq.age / eq.lifetime;
    if (eq.age >= eq.lifetime) {
      app.stage.removeChild(eq.graphics);
      earthquakeEffects.splice(i, 1);
    }
  }
}
