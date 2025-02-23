// skills/BlitzShock.ts
import * as PIXI from "pixi.js";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";
import { ExtendedUnitText } from "../components/PixiCanvas";

export interface BlitzShockEffect {
  graphics: PIXI.Graphics;
  startY: number; // 落下開始位置（画面上部など）
  targetY: number; // 着地点（対象ユニットのY座標）
  fallingSpeed: number; // 落下速度(px/frame)
  isStruck: boolean; // 落下完了し衝撃フェーズに入ったか
  lifetime: number; // 衝撃フェーズの残りフレーム数
  damage: number; // 衝撃ダメージ（攻撃力の50%）
  team: "ally" | "enemy"; // 発射元の所属
}

/**
 * handleBlitzShockAttack
 * 7フレームごとに、skill_name が "ブリッツショック" のユニットから、一番遠い敵ユニットの位置へ
 * 空から落雷するエフェクトを発射します。エフェクトは、開始位置から対象位置へ向けて10フレームかけて落下し、
 * 着弾後、約3フレーム持続する衝撃フェーズで半径20px の爆発エフェクトを表示し、ダメージを与えます。
 */
export function handleBlitzShockAttack(params: {
  app: PIXI.Application;
  texts: ExtendedUnitText[]; // 発射元（通常は1体）
  blitzShockEffects: BlitzShockEffect[];
  farthestTarget: ExtendedUnitText;
}) {
  const attacker = params.texts[0];
  if (!attacker || attacker.unit.skill_name !== "ブリッツショック") return;

  // 落雷対象のXは、最も遠い敵ユニットのX座標、YはそのY座標
  const targetX = params.farthestTarget.text.x;
  const targetY = params.farthestTarget.text.y;

  // 落下開始位置は、画面上部（例えば y = -50）で、X座標は対象と同じ
  const startY = -50;
  const startX = targetX;

  const bolt = new PIXI.Graphics();
  // 初期は小さな雷の円（半径5px）で表示
  bolt.beginFill(0xffff00);
  bolt.drawCircle(0, 0, 5);
  bolt.endFill();
  bolt.x = startX;
  bolt.y = startY;
  params.app.stage.addChild(bolt);

  // ダメージは攻撃力の50%
  const damage = attacker.unit.attack * 0.5;
  // 落下フェーズを10フレームで完了するよう fallingSpeed を計算
  const fallingSpeed = (targetY - startY) / 10;

  params.blitzShockEffects.push({
    graphics: bolt,
    startY,
    targetY,
    fallingSpeed,
    isStruck: false,
    lifetime: 0, // 落下完了後、衝撃フェーズに入ると3フレームに設定
    damage,
    team: attacker.team,
  });
}

/**
 * updateBlitzShockEffects
 * 各ブリッツショックエフェクトを毎フレーム更新します。
 * 落下中は、y 座標を fallingSpeed ずつ増加させ、対象Yに到達したら落下完了として衝撃フェーズに移行します。
 * 衝撃フェーズでは、対象周辺に半径20pxの爆発エフェクトを表示し、3フレーム持続中に対象との衝突判定でダメージを与えます。
 */
export function updateBlitzShockEffects(params: {
  app: PIXI.Application;
  blitzShockEffects: BlitzShockEffect[];
  allyUnits: ExtendedUnitText[];
  enemyUnits: ExtendedUnitText[];
  updateTargetHP: (target: ExtendedUnitText, damage: number) => void;
  damageTexts: DamageText[];
}) {
  const {
    app,
    blitzShockEffects,
    allyUnits,
    enemyUnits,
    updateTargetHP,
    damageTexts,
  } = params;

  blitzShockEffects.forEach((effect, i) => {
    if (!effect.isStruck) {
      // 落下中
      effect.graphics.y += effect.fallingSpeed;
      if (effect.graphics.y >= effect.targetY) {
        // 落下完了 -> 衝撃フェーズへ
        effect.isStruck = true;
        effect.graphics.clear();
        // 衝撃フェーズは、半径20px の爆発エフェクトを表示
        effect.graphics.beginFill(0x00aaff, 1);
        effect.graphics.drawCircle(0, 0, 80);
        effect.graphics.endFill();
        // 衝撃フェーズの持続時間を 3 フレームに設定
        effect.lifetime = 3;
      }
    } else {
      // 衝撃フェーズ中：対象ユニットとの衝突判定
      const explosionCenter = { x: effect.graphics.x, y: effect.graphics.y };
      const targets = effect.team === "ally" ? enemyUnits : allyUnits;
      targets.forEach((target) => {
        const dx = target.text.x - explosionCenter.x;
        const dy = target.text.y - explosionCenter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
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
        blitzShockEffects.splice(i, 1);
      }
    }
  });
}
