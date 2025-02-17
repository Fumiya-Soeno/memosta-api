// skills/CrossBurst.ts
import * as PIXI from "pixi.js";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";
import { UnitText } from "./LockOnLaser";

export interface CrossBurst {
  graphics: PIXI.Graphics;
  age: number;
  expansionFrames: number;
  fadeFrames: number;
  maxRadius: number;
  damage: number;
  pos: { x: number; y: number };
}

/**
 * handleCrossBurstAttack
 * special_name が "十字バースト" のユニットから、上下左右4方向に爆発エフェクトを発生させます。
 * 各爆発は初期は半径0で描画され、expansionFrames かけて最大半径 (ここでは30px) まで拡大します。
 */
export function handleCrossBurstAttack(params: {
  app: PIXI.Application;
  texts: UnitText[];
  crossBursts: CrossBurst[];
}) {
  const { app, texts, crossBursts } = params;
  const attackerUnit = texts.find(
    (ut) => ut.unit.skill_name === "十字バースト"
  );
  if (!attackerUnit) return;
  const attackerPos = { x: attackerUnit.text.x, y: attackerUnit.text.y };
  const directions = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];
  const explosionOffset = 60; // 発射方向のオフセット
  const damage = attackerUnit.unit.attack * 0.8;
  const expansionFrames = 6;
  const fadeFrames = 9;
  directions.forEach(({ dx, dy }) => {
    const pos = {
      x: attackerPos.x + dx * explosionOffset,
      y: attackerPos.y + dy * explosionOffset,
    };
    const explosion = new PIXI.Graphics();
    // 初期は半径0で描画
    explosion.beginFill(0xffa500);
    explosion.drawCircle(0, 0, 0);
    explosion.endFill();
    explosion.x = pos.x;
    explosion.y = pos.y;
    app.stage.addChild(explosion);
    crossBursts.push({
      graphics: explosion,
      age: 0,
      expansionFrames,
      fadeFrames,
      maxRadius: 30,
      damage,
      pos,
    });
  });
}

/**
 * updateCrossBursts
 * 毎フレーム、各爆発エフェクトを更新します。
 * 拡大フェーズ中は、エフェクトの半径が線形に拡大し、同時にサンドバッグとの衝突判定を行います。
 * 衝突判定によりダメージが与えられた場合は、showDamageText 関数を呼び出してダメージ表示を行います。
 * 拡大フェーズ終了後は、fadeFrames かけてエフェクトをフェードアウトさせ、寿命が切れたら削除します。
 */
export function updateCrossBursts(params: {
  app: PIXI.Application;
  crossBursts: CrossBurst[];
  sandbagContainer: PIXI.Container;
  currentHPRef: { current: number };
  updateHPBar: () => void;
  damageTexts: DamageText[];
}) {
  const {
    app,
    crossBursts,
    sandbagContainer,
    currentHPRef,
    updateHPBar,
    damageTexts,
  } = params;
  const sandbagBounds = sandbagContainer.getBounds();
  const sandbagCenter = {
    x: sandbagBounds.x + sandbagBounds.width / 2,
    y: sandbagBounds.y + sandbagBounds.height / 2,
  };

  for (let i = crossBursts.length - 1; i >= 0; i--) {
    const burst = crossBursts[i];
    burst.age++;
    if (burst.age <= burst.expansionFrames) {
      const currentRadius =
        burst.maxRadius * (burst.age / burst.expansionFrames);
      burst.graphics.clear();
      burst.graphics.beginFill(0xffa500);
      burst.graphics.drawCircle(0, 0, currentRadius);
      burst.graphics.endFill();
      // 攻撃判定：拡大フェーズ中のみ
      const dx = sandbagCenter.x - burst.pos.x;
      const dy = sandbagCenter.y - burst.pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < currentRadius + 10) {
        currentHPRef.current = Math.max(currentHPRef.current - burst.damage, 0);
        updateHPBar();
        showDamageText({
          app,
          damage: burst.damage,
          basePosition: sandbagCenter,
          damageTexts,
        });
      }
    } else {
      // フェードアウトフェーズ：alpha を線形に低下
      const fadeAge = burst.age - burst.expansionFrames;
      const alpha = 1 - fadeAge / burst.fadeFrames;
      burst.graphics.alpha = alpha;
    }
    if (burst.age >= burst.expansionFrames + burst.fadeFrames) {
      app.stage.removeChild(burst.graphics);
      crossBursts.splice(i, 1);
    }
  }
}
