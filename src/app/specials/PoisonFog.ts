// specials/PoisonFog.ts
import * as PIXI from "pixi.js";
import { showDamageText } from "../utils/DamageTextUtil";

export interface PoisonFog {
  graphics: PIXI.Graphics;
  age: number;
  lifetime: number;
  damage: number;
  pos: { x: number; y: number };
}

/**
 * handlePoisonFogAttack
 * special_name が "毒霧" のユニットを対象とし、ユニットの現在位置を中心に毒霧エフェクトを生成します。
 * ダメージは攻撃力の10%とします。
 */
export function handlePoisonFogAttack(params: {
  app: PIXI.Application;
  texts: { text: PIXI.Text; unit: { special_name: string; attack: number } }[];
  poisonFogs: PoisonFog[];
}) {
  const attacker = params.texts.find((ut) => ut.unit.special_name === "毒霧");
  if (!attacker) return;
  const startPos = { x: attacker.text.x, y: attacker.text.y };
  const damage = attacker.unit.attack * 0.1;
  // 毒霧エフェクト：ここでは見やすさのため、半径100pxの円形エフェクトとして描画
  const fogGfx = new PIXI.Graphics();
  fogGfx.beginFill(0x9933cc, 0.7);
  fogGfx.drawCircle(0, 0, 100);
  fogGfx.endFill();
  fogGfx.x = startPos.x;
  fogGfx.y = startPos.y;
  params.app.stage.addChild(fogGfx);
  params.poisonFogs.push({
    graphics: fogGfx,
    age: 0,
    lifetime: 180,
    damage,
    pos: { ...startPos },
  });
}

/**
 * updatePoisonFogs
 * 毒霧エフェクトの更新処理:
 * 毎フレーム、age を更新し、初期の透明度 0.7 から線形に 0 へフェードアウトさせます。
 * また、サンドバッグ中心との距離が 100px 内なら攻撃を与え、ダメージテキストは
 * 汎用関数 showDamageText を利用して表示します。
 */
export function updatePoisonFogs(params: {
  app: PIXI.Application;
  poisonFogs: PoisonFog[];
  sandbagContainer: PIXI.Container;
  currentHPRef: { current: number };
  updateHPBar: () => void;
  damageTexts: any[]; // DamageText[] としても可
}) {
  const {
    app,
    poisonFogs,
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

  for (let i = poisonFogs.length - 1; i >= 0; i--) {
    const fog = poisonFogs[i];
    fog.age++;
    // 徐々に透明になるように alpha を更新（初期 0.7 から線形に 0 へ）
    fog.graphics.alpha = 0.7 * (1 - fog.age / fog.lifetime);

    // 衝突判定：毒霧の中心からサンドバッグ中心までの距離が 100px 内なら攻撃
    const dx = sandbagCenter.x - fog.pos.x;
    const dy = sandbagCenter.y - fog.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 100) {
      currentHPRef.current = Math.max(currentHPRef.current - fog.damage, 0);
      updateHPBar();
      showDamageText({
        app,
        damage: fog.damage,
        basePosition: sandbagCenter,
        damageTexts,
      });
    }
    if (fog.age >= fog.lifetime) {
      app.stage.removeChild(fog.graphics);
      poisonFogs.splice(i, 1);
    }
  }
}
