// skills/GuardianFall.ts
import * as PIXI from "pixi.js";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText";

export interface GuardianFallEffect {
  graphics: PIXI.Graphics;
  targetY: number;
  fallingSpeed: number;
  damage: number;
  isExploded: boolean;
  lifetime: number; // 爆発エフェクトの持続フレーム数
  team: "ally" | "enemy";
}

const range = 60;

// 固定の20地点オフセット（攻撃者の現在位置を基準）
const numPoints = 20;
const radius = 100; // 円の半径（必要に応じて調整）
const offsets = Array.from({ length: numPoints }, (_, i) => {
  const angle = (i * (360 / numPoints) * Math.PI) / 180;
  return { dx: radius * Math.cos(angle), dy: radius * Math.sin(angle) };
});

// 友軍用と敵用のインデックスを別々に管理（敵は半分シフト）
let allyGuardianFallIndex = 0;
let enemyGuardianFallIndex = 0;

/**
 * handleGuardianFallAttack
 * special_name が "ガーディアンフォール" のユニットから、6フレームごとに天空から隕石を召喚します。
 * 隕石は攻撃者の現在位置を基準とした固定のオフセットを順次利用し、着地位置（targetY）に向けて落下します。
 * 着地後、爆発エフェクトに切り替わり、爆発効果の持続期間中に発射元の反対側のユニットに対して攻撃判定を行います。
 * 爆発ダメージは攻撃力の90%です。
 */
export function handleGuardianFallAttack(params: {
  app: PIXI.Application;
  texts: UnitText[];
  guardianEffects: GuardianFallEffect[];
}) {
  const attacker = params.texts.find(
    (ut) => ut.unit.skill_name === "ガーディアンフォール"
  );
  if (!attacker) return;

  let offset;
  if (attacker.team === "ally") {
    offset = offsets[allyGuardianFallIndex];
    allyGuardianFallIndex = (allyGuardianFallIndex + 1) % offsets.length;
  } else {
    // 敵の場合は、半分ずらす（offset index + numPoints/2）
    offset = offsets[(enemyGuardianFallIndex + numPoints / 2) % numPoints];
    enemyGuardianFallIndex = (enemyGuardianFallIndex + 1) % offsets.length;
  }

  // 発射位置：攻撃者の位置からオフセット分ずらした位置を着地目標とする
  const targetX = attacker.text.x + offset.dx;
  const targetY = attacker.text.y + offset.dy;
  // 隕石は着地目標の上方150pxから落下開始
  const startY = targetY - 150;
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
 * 落下中は y 座標を下方へ更新し、着地位置に到達したら爆発エフェクトに切り替えます。
 * 爆発エフェクトは、時間経過とともに alpha と scale が変化するリッチな表現となり、
 * 発射元の反対側のユニットに対して攻撃判定を行います。
 */
export function updateGuardianFallEffects(params: {
  app: PIXI.Application;
  guardianEffects: GuardianFallEffect[];
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  updateTargetHP: (target: UnitText, damage: number) => void;
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
  // それぞれのエフェクトについて処理
  guardianEffects.forEach((effect, i) => {
    if (!effect.isExploded) {
      effect.graphics.y += effect.fallingSpeed;
      if (effect.graphics.y >= effect.targetY) {
        effect.isExploded = true;
        effect.graphics.clear();
        // 初期爆発エフェクト：直径100px（半径50px）のエフェクトを描画
        effect.graphics.beginFill(0xff6600, 1);
        effect.graphics.drawCircle(0, 0, range);
        effect.graphics.endFill();
        // 爆発効果の持続時間を 20 フレームに設定（リッチなフェードアウト用）
        effect.lifetime = 20;
      }
    } else {
      const totalDuration = 20;
      const progress = 1 - effect.lifetime / totalDuration; // 0→1
      effect.graphics.alpha = 1 - progress;
      const scaleFactor = 1 + progress * 0.5; // 最大1.5倍に拡大
      effect.graphics.scale.set(scaleFactor);
      // 攻撃判定：発射元の反対側のユニットに対して行う
      const explosionCenter = { x: effect.graphics.x, y: effect.graphics.y };
      const targets = effect.team === "ally" ? enemyUnits : allyUnits;
      targets.forEach((target) => {
        const dx = target.text.x - explosionCenter.x;
        const dy = target.text.y - explosionCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < range) {
          updateTargetHP(target, effect.damage);
          showDamageText({
            app,
            damage: effect.damage,
            basePosition: { x: target.text.x, y: target.text.y },
            damageTexts,
          });
        }
      });
      effect.lifetime--;
      if (effect.lifetime <= 0) {
        app.stage.removeChild(effect.graphics);
        guardianEffects.splice(i, 1);
      }
    }
  });
}
