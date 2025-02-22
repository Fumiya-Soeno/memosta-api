import * as PIXI from "pixi.js";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";
import { ExtendedUnitText } from "../components/PixiCanvas";

export interface GuardianFallEffect {
  graphics: PIXI.Graphics;
  targetY: number;
  fallingSpeed: number;
  damage: number;
  isExploded: boolean;
  lifetime: number; // 爆発エフェクトの持続フレーム数
  team: "ally" | "enemy"; // 発射元の所属チーム
}

// 固定の10地点オフセット（攻撃者の現在位置を基準）
const offsets = [
  { dx: -100, dy: -50 },
  { dx: -50, dy: -80 },
  { dx: 0, dy: -100 },
  { dx: 50, dy: -80 },
  { dx: 100, dy: -50 },
  { dx: 100, dy: 0 },
  { dx: 50, dy: 50 },
  { dx: 0, dy: 80 },
  { dx: -50, dy: 50 },
  { dx: -100, dy: 0 },
];
let guardianFallIndex = 0;

/**
 * handleGuardianFallAttack
 * special_name が "ガーディアンフォール" のユニットから、6フレームごとに天空から隕石を召喚します。
 * 隕石は発射元の位置を基準とした固定の10地点オフセットを順番に利用し、落下して着地時に爆発エフェクトに切り替わります。
 * 爆発ダメージは攻撃力の90%とし、発射元の所属チームを effect.team に設定します。
 */
export function handleGuardianFallAttack(params: {
  app: PIXI.Application;
  texts: ExtendedUnitText[];
  guardianEffects: GuardianFallEffect[];
}) {
  const attacker = params.texts.find(
    (ut) => ut.unit.skill_name === "ガーディアンフォール"
  );
  if (!attacker) return;

  const offset = offsets[guardianFallIndex];
  guardianFallIndex = (guardianFallIndex + 1) % offsets.length;

  const targetX = attacker.text.x + offset.dx;
  const targetY = attacker.text.y + offset.dy;
  const startY = targetY - 150; // 隕石は着地目標の上方150pxから落下開始
  const meteor = new PIXI.Graphics();
  meteor.beginFill(0x888888);
  meteor.drawCircle(0, 0, 10);
  meteor.endFill();
  meteor.x = targetX;
  meteor.y = startY;
  params.app.stage.addChild(meteor);

  const damage = attacker.unit.attack * 0.9;
  params.guardianEffects.push({
    graphics: meteor,
    targetY,
    fallingSpeed: 10, // 10px/frame
    damage,
    isExploded: false,
    lifetime: 0,
    team: attacker.team,
  });
}

/**
 * updateGuardianFallEffects
 * 各隕石エフェクトを毎フレーム更新します。
 * 落下中は y 座標を下方へ更新し、着地目標に到達したら爆発エフェクトに切り替えます。
 * 爆発エフェクトは5フレーム持続中に、発射元の反対側のユニットに対して衝突判定を行いダメージを与えます。
 * ダメージテキストは showDamageText を利用して表示します。
 */
export function updateGuardianFallEffects(params: {
  app: PIXI.Application;
  guardianEffects: GuardianFallEffect[];
  allyUnits: ExtendedUnitText[];
  enemyUnits: ExtendedUnitText[];
  updateTargetHP: (target: ExtendedUnitText, damage: number) => void;
  damageTexts: DamageText[];
}) {
  const {
    app,
    guardianEffects,
    allyUnits,
    enemyUnits,
    updateTargetHP,
    damageTexts,
  } = params;
  guardianEffects.forEach((effect, i) => {
    if (!effect.isExploded) {
      effect.graphics.y += effect.fallingSpeed;
      if (effect.graphics.y >= effect.targetY) {
        effect.isExploded = true;
        effect.graphics.clear();
        effect.graphics.beginFill(0xff6600, 1);
        effect.graphics.drawCircle(0, 0, 40); // 直径80px の爆発エフェクト
        effect.graphics.endFill();
        effect.lifetime = 5;
      }
    } else {
      effect.lifetime--;
      const explosionCenter = { x: effect.graphics.x, y: effect.graphics.y };
      const targets = effect.team === "ally" ? enemyUnits : allyUnits;
      targets.forEach((target) => {
        const dx = target.text.x - explosionCenter.x;
        const dy = target.text.y - explosionCenter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 50) {
          updateTargetHP(target, effect.damage);
          showDamageText({
            app,
            damage: effect.damage,
            basePosition: { x: target.text.x, y: target.text.y },
            damageTexts,
          });
        }
      });
      if (effect.lifetime <= 0) {
        app.stage.removeChild(effect.graphics);
        guardianEffects.splice(i, 1);
      }
    }
  });
}
