import * as PIXI from "pixi.js";
import { showDamageText } from "../utils/DamageTextUtil";

export interface PoisonFog {
  graphics: PIXI.Graphics;
  age: number;
  lifetime: number;
  damage: number;
  pos: { x: number; y: number };
  team: "ally" | "enemy";
}

/**
 * handlePoisonFogAttack
 * special_name が "毒霧" のユニットすべてに対して、ユニットの現在位置を中心に毒霧エフェクトを生成します。
 * ダメージは攻撃力の10%とし、発射元のチーム情報を付与します。
 */
export function handlePoisonFogAttack(params: {
  app: PIXI.Application;
  texts: {
    text: PIXI.Text;
    unit: { special_name: string; attack: number };
    team: "ally" | "enemy";
  }[];
  poisonFogs: PoisonFog[];
}) {
  params.texts.forEach((attacker) => {
    if (attacker.unit.special_name !== "毒霧") return;
    const startPos = { x: attacker.text.x, y: attacker.text.y };
    const damage = attacker.unit.attack * 0.1;
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
      team: attacker.team,
    });
  });
}

/**
 * updatePoisonFogs
 * 毒霧エフェクトの更新処理:
 * 毎フレーム、age を更新し、初期の透明度 0.7 から線形に 0 へフェードアウトさせます。
 * また、発射元のチームに応じ、対象となる反対チームのユニットとの衝突判定を行い、
 * ダメージテキストは showDamageText を利用して表示します。
 */
export function updatePoisonFogs(params: {
  app: PIXI.Application;
  poisonFogs: PoisonFog[];
  allyUnits: any[]; // ExtendedUnitText[]（友軍ユニット）
  enemyUnits: any[]; // ExtendedUnitText[]（敵ユニット）
  updateTargetHP: (target: any, damage: number) => void;
  damageTexts: any[]; // DamageText[]
}) {
  const {
    app,
    poisonFogs,
    allyUnits,
    enemyUnits,
    updateTargetHP,
    damageTexts,
  } = params;
  poisonFogs.forEach((fog, i) => {
    fog.age++;
    fog.graphics.alpha = 0.7 * (1 - fog.age / fog.lifetime);
    // 発射元のチームに応じ、対象リストを選択
    const targets = fog.team === "ally" ? enemyUnits : allyUnits;
    targets.forEach((target) => {
      const dx = target.text.x - fog.pos.x;
      const dy = target.text.y - fog.pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 100) {
        updateTargetHP(target, fog.damage);
        showDamageText({
          app,
          damage: fog.damage,
          basePosition: { x: target.text.x, y: target.text.y },
          damageTexts,
        });
      }
    });
    if (fog.age >= fog.lifetime) {
      app.stage.removeChild(fog.graphics);
      poisonFogs.splice(i, 1);
    }
  });
}
