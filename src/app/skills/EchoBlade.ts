// skills/EchoBlade.ts
import * as PIXI from "pixi.js";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";
import { ExtendedUnitText } from "../components/PixiCanvas";

// 型定義：エコーブレード（衝撃波）エフェクト
export interface EchoBladeEffect {
  graphics: PIXI.Graphics;
  vx: number;
  vy: number;
  lifetime: number;
  damage: number;
}

// ヘルパー：2点間の距離計算
function distanceBetween(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * handleEchoBladeAttack
 * 7フレームごとに、special_name が "エコーブレード" のユニットから、対象（サンドバッグ）の方向へ
 * 1. 斬撃攻撃エフェクト（60%ダメージ、三日月型エフェクト）を発生し即時ダメージを与える。
 * 2. 同方向に衝撃波エフェクト（30%ダメージ、ゆっくり移動、貫通性あり）を発射する。
 * 発射時の自身の位置とターゲット位置を結ぶ直線の角度に合わせて各エフェクトを回転させます。
 */
export function handleEchoBladeAttack(params: {
  app: PIXI.Application;
  texts: ExtendedUnitText[];
  sandbagContainer: PIXI.Container;
  echoBladeEffects: EchoBladeEffect[];
}) {
  // 対象ユニットとして special_name が "エコーブレード" のものを検索
  const attacker = params.texts.find(
    (ut) => ut.unit.skill_name === "エコーブレード"
  );
  if (!attacker) return;
  const attackerPos = { x: attacker.text.x, y: attacker.text.y };

  // サンドバッグの中心を取得
  const sbBounds = params.sandbagContainer.getBounds();
  const targetPos = {
    x: sbBounds.x + sbBounds.width / 2,
    y: sbBounds.y + sbBounds.height / 2,
  };

  // 方向ベクトルと角度を計算
  const dx = targetPos.x - attackerPos.x;
  const dy = targetPos.y - attackerPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const attackAngle = Math.atan2(dy, dx);

  // ① 斬撃攻撃エフェクト（即時ダメージ、60%）
  const slash = new PIXI.Graphics();
  slash.lineStyle(4, 0xff0000, 1);
  // 三日月型エフェクト：弧を -45°～45° で描画
  slash.arc(0, 0, 40, (-45 * Math.PI) / 180, (45 * Math.PI) / 180);
  // 発射時の自身とターゲットを結ぶ角度に合わせて回転
  slash.rotation = attackAngle;
  slash.x = attackerPos.x;
  slash.y = attackerPos.y;
  params.app.stage.addChild(slash);
  const slashDamage = attacker.unit.attack * 0.6;
  // 斬撃エフェクトは3フレーム後に除去
  setTimeout(() => {
    params.app.stage.removeChild(slash);
  }, 50);

  // 斬撃による即時ダメージ処理（※実際の判定タイミングは用途に応じて調整可能）

  // ② 衝撃波攻撃エフェクト（30%ダメージ、ゆっくり移動）
  const shock = new PIXI.Graphics();
  shock.lineStyle(2, 0x0000ff, 1);
  shock.beginFill(0x0000ff, 0.5);
  // 三日月型エフェクト：弧を -45°～45° で描画
  shock.arc(0, 0, 20, (-45 * Math.PI) / 180, (45 * Math.PI) / 180);
  shock.endFill();
  // 回転を発射時の角度に合わせる
  shock.rotation = attackAngle;
  shock.x = attackerPos.x;
  shock.y = attackerPos.y;
  params.app.stage.addChild(shock);
  // 衝撃波パラメータ：速度 2px/frame、lifetime 60フレーム、30%ダメージ
  const shockVx = 2 * Math.cos(attackAngle);
  const shockVy = 2 * Math.sin(attackAngle);
  const shockDamage = attacker.unit.attack * 0.3;
  // ※ここでは lifetime を 60 に設定していますが、必要に応じて調整してください
  params.echoBladeEffects.push({
    graphics: shock,
    vx: shockVx,
    vy: shockVy,
    lifetime: 60,
    damage: shockDamage,
  });
}

/**
 * updateEchoBladeEffects
 * 各衝撃波エフェクトを毎フレーム更新し、対象（サンドバッグ）との衝突判定でダメージを与えます。
 * ダメージテキストは汎用関数 showDamageText を利用して表示します。
 */
export function updateEchoBladeEffects(params: {
  app: PIXI.Application;
  echoBladeEffects: EchoBladeEffect[];
  sandbagContainer: PIXI.Container;
  currentHPRef: { current: number };
  updateHPBar: () => void;
  damageTexts: DamageText[];
}) {
  const {
    app,
    echoBladeEffects,
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

  for (let i = echoBladeEffects.length - 1; i >= 0; i--) {
    const effect = echoBladeEffects[i];
    effect.lifetime--;
    effect.graphics.x += effect.vx;
    effect.graphics.y += effect.vy;
    // 衝突判定：衝撃波の中心とサンドバッグ中心との距離が10px未満ならダメージ
    const d = distanceBetween(
      { x: effect.graphics.x, y: effect.graphics.y },
      sandbagCenter
    );
    if (d < 10) {
      currentHPRef.current = Math.max(currentHPRef.current - effect.damage, 0);
      updateHPBar();
      showDamageText({
        app,
        damage: effect.damage,
        basePosition: sandbagCenter,
        damageTexts,
      });
    }
    if (effect.lifetime <= 0) {
      app.stage.removeChild(effect.graphics);
      echoBladeEffects.splice(i, 1);
    }
  }
}
