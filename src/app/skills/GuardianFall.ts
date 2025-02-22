// skills/GuardianFall.ts
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
  team: "ally" | "enemy";
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
// モジュール内でループするためのインデックス
let guardianFallIndex = 0;

/**
 * handleGuardianFallAttack
 * special_name が "ガーディアンフォール" のユニットから、6フレームごとに天空から隕石を召喚します。
 * 隕石は攻撃者の現在位置を基準とした固定の10地点オフセットを順次利用し、着地位置（targetY）に向けて落下します。
 * 着地後、爆発エフェクトに切り替わり、爆発の持続期間中に発射元の反対側のユニットに対して攻撃判定を行います。
 * 爆発ダメージは攻撃力の90%です。
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

  // ループで固定のオフセットを選択
  const offset = offsets[guardianFallIndex];
  guardianFallIndex = (guardianFallIndex + 1) % offsets.length;

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
  // 対象ユニットは、発射元の反対側のチーム
  guardianEffects.forEach((effect, i) => {
    if (!effect.isExploded) {
      // 落下中： y 座標を下げる
      effect.graphics.y += effect.fallingSpeed;
      if (effect.graphics.y >= effect.targetY) {
        // 着地 -> 爆発エフェクトに切り替え
        effect.isExploded = true;
        effect.graphics.clear();
        // 初期爆発エフェクト：直径80px（半径40px）を描画
        effect.graphics.beginFill(0xff6600, 1);
        effect.graphics.drawCircle(0, 0, 40);
        effect.graphics.endFill();
        // 爆発効果の持続時間を 20 フレームに設定（リッチなフェードアウト用）
        effect.lifetime = 20;
      }
    } else {
      // 爆発エフェクト中：フェードアウトと拡大効果を適用
      const totalDuration = 20;
      const progress = 1 - effect.lifetime / totalDuration; // 0→1
      effect.graphics.alpha = 1 - progress; // 透明度線形減少
      const scaleFactor = 1 + progress * 0.5; // 最大で1.5倍に拡大
      effect.graphics.scale.set(scaleFactor);
      // 攻撃判定：爆発中心から対象ユニットとの距離が50px未満ならダメージ
      const explosionCenter = { x: effect.graphics.x, y: effect.graphics.y };
      const targets = effect.team === "ally" ? enemyUnits : allyUnits;
      targets.forEach((target) => {
        const dx = target.text.x - explosionCenter.x;
        const dy = target.text.y - explosionCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 50) {
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
