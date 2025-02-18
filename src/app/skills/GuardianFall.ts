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
 * special_name が "ガーディアンフォール" のユニットから、10フレームごとに天空から隕石を召喚します。
 * 隕石は攻撃者の現在位置を基準とした固定の10地点オフセットのうち、順番に選ばれます。
 * 隕石は、着地位置（targetY）まで落下し、着地時に直径80px の爆発エフェクトに切り替わり、
 * 爆発の持続期間中（5フレーム）に攻撃判定を行い、攻撃力の90%のダメージを与えます。
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

  // 選ばれたオフセット（ループで決定）
  const offset = offsets[guardianFallIndex];
  guardianFallIndex = (guardianFallIndex + 1) % offsets.length;

  // 発射位置：攻撃者の位置を基準にオフセット分ずらした位置を「着地目標」とする
  const targetX = attacker.text.x + offset.dx;
  const targetY = attacker.text.y + offset.dy;
  // 隕石は、着地目標の上方150pxから落下開始
  const startY = targetY - 150;
  const meteor = new PIXI.Graphics();
  // 隕石は小規模な灰色の円（半径10px）
  meteor.beginFill(0x888888);
  meteor.drawCircle(0, 0, 10);
  meteor.endFill();
  meteor.x = targetX;
  meteor.y = startY;
  params.app.stage.addChild(meteor);
  const damage = attacker.unit.attack * 2.0;
  // fallingSpeed: 10px/frame
  params.guardianEffects.push({
    graphics: meteor,
    targetY,
    fallingSpeed: 10,
    damage,
    isExploded: false,
    lifetime: 0,
  });
}

/**
 * updateGuardianFallEffects
 * 各隕石エフェクトを毎フレーム更新します。
 * 落下中は y 座標を下方へ更新し、着地目標に到達したら爆発エフェクトに切り替えます。
 * 爆発エフェクトは5フレーム持続中にサンドバッグへの攻撃判定を行い、ダメージテキストは
 * showDamageText を利用して表示します。
 */
export function updateGuardianFallEffects(params: {
  app: PIXI.Application;
  guardianEffects: GuardianFallEffect[];
  sandbagContainer: PIXI.Container;
  currentHPRef: { current: number };
  updateHPBar: () => void;
  damageTexts: DamageText[];
}) {
  const {
    app,
    guardianEffects,
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

  for (let i = guardianEffects.length - 1; i >= 0; i--) {
    const effect = guardianEffects[i];
    if (!effect.isExploded) {
      // 落下中： y 座標を下方へ更新
      effect.graphics.y += effect.fallingSpeed;
      // 目標に到達したら爆発エフェクトに切り替え
      if (effect.graphics.y >= effect.targetY) {
        effect.isExploded = true;
        effect.graphics.clear();
        effect.graphics.beginFill(0xff6600, 1);
        effect.graphics.drawCircle(0, 0, 40); // 直径80px の爆発
        effect.graphics.endFill();
        // 爆発効果の lifetime を 5 フレームに設定
        effect.lifetime = 5;
      }
    } else {
      // 爆発エフェクト中： lifetime を減少し、攻撃判定を実施
      effect.lifetime--;
      // 衝突判定：爆発中心からサンドバッグ中心との距離が 40px + 10px 以下ならダメージ
      const dx = sandbagCenter.x - effect.graphics.x;
      const dy = sandbagCenter.y - effect.graphics.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 50) {
        currentHPRef.current = Math.max(
          currentHPRef.current - effect.damage,
          0
        );
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
        guardianEffects.splice(i, 1);
      }
    }
  }
}
