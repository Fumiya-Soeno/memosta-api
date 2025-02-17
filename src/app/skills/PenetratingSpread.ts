// attacks/PenetratingSpread.ts
import * as PIXI from "pixi.js";
import { DamageText } from "./LockOnLaser"; // 共通の型を再利用できる場合

// 貫通拡散弾用の弾オブジェクトの型
export interface PenetratingSpreadBullet {
  graphics: PIXI.Graphics;
  vx: number;
  vy: number;
  damage: number;
}

// 16方向に弾を発射する処理
export function handlePenetratingSpreadAttack(params: {
  app: PIXI.Application;
  texts: { text: PIXI.Text; unit: { skill_name: string; attack: number } }[];
  spreadBullets: PenetratingSpreadBullet[];
}) {
  // skill_name が「貫通拡散弾」のユニットを対象とする
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
    // 弾の描画（視認性向上のため、白いアウトライン付き、半径2に変更）
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

// 弾の更新処理（移動、攻撃判定、画面端での削除）
export function updatePenetratingSpreadBullets(params: {
  app: PIXI.Application;
  spreadBullets: PenetratingSpreadBullet[];
  sandbagContainer: PIXI.Container;
  currentHPRef: { current: number };
  updateHPBar: () => void;
  damageTexts: DamageText[];
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
    // 衝突判定：ここでは弾の中心とサンドバッグ中心の距離が 10px 未満ならヒットとする
    const dx = bullet.graphics.x - sandbagCenter.x;
    const dy = bullet.graphics.y - sandbagCenter.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 10) {
      // 毎フレームダメージを与える（貫通するため弾は消えない）
      currentHPRef.current = Math.max(currentHPRef.current - bullet.damage, 0);
      updateHPBar();
      // ダメージ表示
      const dmgText = new PIXI.Text(
        bullet.damage.toFixed(1),
        new PIXI.TextStyle({
          fontSize: 16,
          fill: 0xff0000,
          fontWeight: "bold",
        })
      );
      dmgText.anchor.set(0.5);
      const randomOffsetX = Math.random() * 40 - 20;
      const randomOffsetY = Math.random() * 40 - 20;
      const startX = sandbagCenter.x + randomOffsetX;
      const startY = sandbagCenter.y + randomOffsetY;
      dmgText.x = startX;
      dmgText.y = startY;
      app.stage.addChild(dmgText);
      damageTexts.push({
        text: dmgText,
        age: 0,
        lifetime: 30,
        startX,
        startY,
        hVel: Math.random() * 2 - 1,
        peakHeight: 20,
      });
    }
    // 画面端チェック（弾の中心が画面外に出たら削除）
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
