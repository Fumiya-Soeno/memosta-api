import * as PIXI from "pixi.js";
import { showDamageText } from "../utils/DamageTextUtil";

export interface PenetratingSpreadBullet {
  graphics: PIXI.Graphics;
  vx: number;
  vy: number;
  damage: number;
  team: "ally" | "enemy";
}

const power = 1.0;

/**
 * handlePenetratingSpreadAttack
 * skill_name が「貫通拡散弾」のユニットすべてから、16方向に弾を発射します。
 * 各弾は視認性向上のため、黒いアウトライン付きで半径2px の円として描画され、
 * 発射元のチーム情報を bullet.team に設定します。
 */
export function handlePenetratingSpreadAttack(params: {
  app: PIXI.Application;
  texts: {
    text: PIXI.Text;
    unit: { skill_name: string; attack: number };
    team: "ally" | "enemy";
  }[];
  spreadBullets: PenetratingSpreadBullet[];
}) {
  // texts から skill_name が「貫通拡散弾」のユニットすべてを処理
  params.texts.forEach((ut) => {
    if (ut.unit.skill_name !== "貫通拡散弾") return;
    const startPos = { x: ut.text.x, y: ut.text.y };
    const damage = ut.unit.attack * power;
    const bulletSpeed = 3;
    const bulletCount = 32;
    const angleIncrement = (2 * Math.PI) / bulletCount;
    for (let i = 0; i < bulletCount; i++) {
      const angle = i * angleIncrement;
      const vx = bulletSpeed * Math.cos(angle);
      const vy = bulletSpeed * Math.sin(angle);
      const bulletGfx = new PIXI.Graphics();
      bulletGfx.lineStyle(1, 0x000000, 1);
      bulletGfx.beginFill(0x00ffff);
      bulletGfx.drawCircle(0, 0, 2);
      bulletGfx.endFill();
      bulletGfx.x = startPos.x;
      bulletGfx.y = startPos.y;
      params.app.stage.addChild(bulletGfx);
      params.spreadBullets.push({
        graphics: bulletGfx,
        vx,
        vy,
        damage,
        team: ut.team,
      });
    }
  });
}

/**
 * updatePenetratingSpreadBullets
 * 各弾を毎フレーム更新し、移動および攻撃判定を行います。
 * bullet.team に基づき、対象となる敵側のユニットリスト (allyUnits または enemyUnits) と衝突判定を行い、
 * ダメージが発生した場合は showDamageText を利用してダメージ表示を行います。
 * また、画面端に出た弾は削除します。
 */
export function updatePenetratingSpreadBullets(params: {
  app: PIXI.Application;
  spreadBullets: PenetratingSpreadBullet[];
  allyUnits: { text: PIXI.Text; hp: number }[];
  enemyUnits: { text: PIXI.Text; hp: number }[];
  updateTargetHP: (target: any, damage: number) => void;
  damageTexts: any[]; // DamageText[]
}) {
  const {
    app,
    spreadBullets,
    allyUnits,
    enemyUnits,
    updateTargetHP,
    damageTexts,
  } = params;
  // 衝突判定の閾値
  const collisionThreshold = 10;
  for (let i = spreadBullets.length - 1; i >= 0; i--) {
    const bullet = spreadBullets[i];
    bullet.graphics.x += bullet.vx;
    bullet.graphics.y += bullet.vy;
    // 対象リストを bullet.team に応じて選択
    const targets = bullet.team === "ally" ? enemyUnits : allyUnits;
    targets.forEach((target) => {
      const dx = bullet.graphics.x - target.text.x;
      const dy = bullet.graphics.y - target.text.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < collisionThreshold) {
        updateTargetHP(target, bullet.damage);
        showDamageText({
          app,
          damage: bullet.damage,
          basePosition: { x: target.text.x, y: target.text.y },
          damageTexts,
        });
      }
    });
    if (
      bullet.graphics.x < 0 ||
      bullet.graphics.x > app.screen.width ||
      bullet.graphics.y < 0 ||
      bullet.graphics.y > app.screen.height
    ) {
      app.stage.removeChild(bullet.graphics);
      spreadBullets.splice(i, 1);
    }
  }
}
