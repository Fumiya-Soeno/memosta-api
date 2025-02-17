// specials/PoisonFog.ts
import * as PIXI from "pixi.js";
import { DamageText } from "../skills/LockOnLaser"; // 共通の型を再利用可能なら

export interface PoisonFog {
  graphics: PIXI.Graphics;
  age: number;
  lifetime: number;
  damage: number;
  pos: { x: number; y: number };
}

/**
 * 毒霧を発生させる
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
  // 毒霧エフェクト：直径10px（半径5px）ではなく、ここでは見やすさのため大きめに描画（例：半径40px）
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
 * 毒霧エフェクトの更新処理
 * 生成された毒霧エフェクトは、毎フレーム age を更新し、
 * 経過に応じて alpha 値を下げ、最終的に透明化して消滅します。
 * また、サンドバッグ中心との衝突判定でダメージを与えます。
 */
export function updatePoisonFogs(params: {
  app: PIXI.Application;
  poisonFogs: PoisonFog[];
  sandbagContainer: PIXI.Container;
  currentHPRef: { current: number };
  updateHPBar: () => void;
  damageTexts: DamageText[];
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
    // 徐々に透明になるように alpha を更新（初期0.7から線形に0へ）
    fog.graphics.alpha = 0.7 * (1 - fog.age / fog.lifetime);

    // 衝突判定：毒霧の中心からサンドバッグ中心までの距離が半径40px以内なら攻撃
    const dx = sandbagCenter.x - fog.pos.x;
    const dy = sandbagCenter.y - fog.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 100) {
      currentHPRef.current = Math.max(currentHPRef.current - fog.damage, 0);
      updateHPBar();

      const dmgText = new PIXI.Text(
        fog.damage.toFixed(1),
        new PIXI.TextStyle({
          fontSize: 16,
          fill: 0xff0000,
          fontWeight: "bold",
        })
      );
      dmgText.anchor.set(0.5);
      const randomOffsetX = Math.random() * 40 - 20;
      const randomOffsetY = Math.random() * 40 - 20;
      const startX = sandbagCenter.x + randomOffsetX;
      const startY = sandbagCenter.y + randomOffsetY;
      dmgText.x = startX;
      dmgText.y = startY;
      app.stage.addChild(dmgText);
      damageTexts.push({
        text: dmgText,
        age: 0,
        lifetime: 30,
        startX,
        startY,
        hVel: Math.random() * 2 - 1,
        peakHeight: 20,
      });
    }
    if (fog.age >= fog.lifetime) {
      app.stage.removeChild(fog.graphics);
      poisonFogs.splice(i, 1);
    }
  }
}
