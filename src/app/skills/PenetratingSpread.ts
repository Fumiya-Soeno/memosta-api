// skills/PenetratingSpread.ts
import * as PIXI from "pixi.js";
import { showDamageText } from "../utils/DamageTextUtil";

export interface PenetratingSpreadBullet {
  graphics: PIXI.Graphics;
  vx: number;
  vy: number;
  damage: number;
}

/**
 * handlePenetratingSpreadAttack
 * skill_name が「貫通拡散弾」のユニットを対象として、16方向に弾を発射します。
 * 各弾は視認性向上のため、白いアウトライン付きで半径2pxの円として描画されます。
 */
export function handlePenetratingSpreadAttack(params: {
  app: PIXI.Application;
  texts: { text: PIXI.Text; unit: { skill_name: string; attack: number } }[];
  spreadBullets: PenetratingSpreadBullet[];
}) {
  const attacker = params.texts.find(
    (ut) => ut.unit.skill_name === "貫通拡散弾"
  );
  if (!attacker) return;
  const startPos = { x: attacker.text.x, y: attacker.text.y };
  const damage = attacker.unit.attack * 0.35;
  const bulletSpeed = 5;
  const bulletCount = 16;
  const angleIncrement = (2 * Math.PI) / bulletCount;

  for (let i = 0; i < bulletCount; i++) {
    const angle = i * angleIncrement;
    const vx = bulletSpeed * Math.cos(angle);
    const vy = bulletSpeed * Math.sin(angle);
    // 弾の描画（視認性向上のため、黒いアウトライン付き、半径2に変更）
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
    });
  }
}

/**
 * updatePenetratingSpreadBullets
 * 各弾を毎フレーム更新し、移動および攻撃判定を行います。
 * 衝突判定で、サンドバッグ中心との距離が10px未満の場合、showDamageText を利用してダメージ表示を行います。
 * また、画面外に出た弾は削除します。
 */
export function updatePenetratingSpreadBullets(params: {
  app: PIXI.Application;
  spreadBullets: PenetratingSpreadBullet[];
  sandbagContainer: PIXI.Container;
  currentHPRef: { current: number };
  updateHPBar: () => void;
  damageTexts: any[]; // DamageText[] としても良い
}) {
  const {
    app,
    spreadBullets,
    sandbagContainer,
    currentHPRef,
    updateHPBar,
    damageTexts,
  } = params;
  // サンドバッグの中心位置を取得
  const sbBounds = sandbagContainer.getBounds();
  const sandbagCenter = {
    x: sbBounds.x + sbBounds.width / 2,
    y: sbBounds.y + sbBounds.height / 2,
  };

  for (let i = spreadBullets.length - 1; i >= 0; i--) {
    const bullet = spreadBullets[i];
    // 移動更新
    bullet.graphics.x += bullet.vx;
    bullet.graphics.y += bullet.vy;
    // 衝突判定：弾の中心とサンドバッグ中心の距離が10px未満ならヒット
    const dx = bullet.graphics.x - sandbagCenter.x;
    const dy = bullet.graphics.y - sandbagCenter.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 10) {
      // 毎フレームダメージを与える（弾は貫通するため削除しない）
      currentHPRef.current = Math.max(currentHPRef.current - bullet.damage, 0);
      updateHPBar();
      // 汎用関数を使用してダメージテキストを表示
      showDamageText({
        app,
        damage: bullet.damage,
        basePosition: sandbagCenter,
        damageTexts,
      });
    }
    // 画面端チェック：弾が画面外に出たら削除
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
