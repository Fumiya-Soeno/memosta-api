// skills/CrossBurst.ts
import * as PIXI from "pixi.js";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText";

export interface CrossBurst {
  graphics: PIXI.Graphics;
  age: number;
  expansionFrames: number;
  fadeFrames: number;
  maxRadius: number;
  damage: number;
  pos: { x: number; y: number };
  team: "ally" | "enemy"; // 発射元の所属チームを追加
}

/**
 * handleCrossBurstAttack
 * special_name が "十字バースト" のユニットすべてから、上下左右4方向に爆発エフェクトを発生させます。
 * 各爆発は初期は半径0で描画され、expansionFrames かけて最大半径 (30px) まで拡大します。
 * 発射元の所属チームは、後の衝突判定で対象となる相手ユニットを決定するために使います。
 */
export function handleCrossBurstAttack(params: {
  app: PIXI.Application;
  texts: UnitText[];
  crossBursts: CrossBurst[];
}) {
  const { app, texts, crossBursts } = params;
  // texts からスキルが「十字バースト」のユニットをすべて処理する
  texts.forEach((ut) => {
    if (ut.unit.skill_name === "十字バースト") {
      const attackerPos = { x: ut.text.x, y: ut.text.y };
      const directions = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
      ];
      const explosionOffset = 60; // 発射方向のオフセット
      const damage = ut.unit.attack * 0.8;
      const expansionFrames = 6;
      const fadeFrames = 9;
      // 発射元の所属チームを保持
      const team = (ut as any).team as "ally" | "enemy";
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
          team,
        });
      });
    }
  });
}

/**
 * updateCrossBursts
 * 毎フレーム、各爆発エフェクトを更新します。
 * 拡大フェーズ中は、エフェクトの半径が線形に拡大し、同時に相手チームへの衝突判定を行います。
 * 対象に衝突した場合は、showDamageText を呼び出してダメージ表示を行います。
 * 拡大フェーズ終了後は、fadeFrames かけてエフェクトをフェードアウトさせ、寿命が切れたら削除します。
 */
export function updateCrossBursts(params: {
  app: PIXI.Application;
  crossBursts: CrossBurst[];
  allyUnits: any[]; // ExtendedUnitText[]（味方ユニット）
  enemyUnits: any[]; // ExtendedUnitText[]（敵ユニット）
  damageTexts: DamageText[];
}) {
  const { app, crossBursts, allyUnits, enemyUnits, damageTexts } = params;
  // 各エフェクトごとに、発射元チームの反対側のユニットリストを対象とする
  crossBursts.forEach((burst, i) => {
    burst.age++;
    if (burst.age <= burst.expansionFrames) {
      const currentRadius =
        burst.maxRadius * (burst.age / burst.expansionFrames);
      burst.graphics.clear();
      burst.graphics.beginFill(0xffa500);
      burst.graphics.drawCircle(0, 0, currentRadius);
      burst.graphics.endFill();
      const targets = burst.team === "ally" ? enemyUnits : allyUnits;
      targets.forEach((target: any) => {
        const dx = target.text.x - burst.pos.x;
        const dy = target.text.y - burst.pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < currentRadius + 10) {
          target.hp = Math.max(target.hp - burst.damage, 0);
          showDamageText({
            app,
            damage: burst.damage,
            basePosition: { x: target.text.x, y: target.text.y },
            damageTexts,
          });
        }
      });
    } else {
      const fadeAge = burst.age - burst.expansionFrames;
      const alpha = 1 - fadeAge / burst.fadeFrames;
      burst.graphics.alpha = alpha;
    }
    if (burst.age >= burst.expansionFrames + burst.fadeFrames) {
      app.stage.removeChild(burst.graphics);
      crossBursts.splice(i, 1);
    }
  });
}
