// skills/LockOnLaser.ts
import * as PIXI from "pixi.js";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText";

export interface Laser {
  graphics: PIXI.Graphics;
  lifetime: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
  damage: number;
}

export function pointToLineDistance(
  point: { x: number; y: number },
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number }
): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;
  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  const param = len_sq !== 0 ? dot / len_sq : -1;
  let nearestX, nearestY;
  if (param < 0) {
    nearestX = lineStart.x;
    nearestY = lineStart.y;
  } else if (param > 1) {
    nearestX = lineEnd.x;
    nearestY = lineEnd.y;
  } else {
    nearestX = lineStart.x + param * C;
    nearestY = lineStart.y + param * D;
  }
  const dx = point.x - nearestX;
  const dy = point.y - nearestY;
  return Math.sqrt(dx * dx + dy * dy);
}

export function handleLockOnLaserAttack(params: {
  app: PIXI.Application;
  texts: UnitText[];
  sandbagContainer: PIXI.Container;
  currentHPRef: { current: number };
  updateHPBar: () => void;
  damageTexts: DamageText[];
  lasers: Laser[];
}) {
  const {
    app,
    texts,
    sandbagContainer,
    currentHPRef,
    updateHPBar,
    damageTexts,
    lasers,
  } = params;
  const attackerUnit = texts.find(
    (ut) => ut.unit.skill_name === "ロックオンレーザー"
  );
  if (!attackerUnit) return;
  const attackerPos = { x: attackerUnit.text.x, y: attackerUnit.text.y };

  // ターゲットの位置を、sandbagContainer から取得
  const bounds = sandbagContainer.getBounds();
  let targetX, targetY;
  if (bounds.width === 0 && bounds.height === 0) {
    // getBounds() でサイズが得られない場合は、container の x,y を利用
    targetX = sandbagContainer.x;
    targetY = sandbagContainer.y;
  } else {
    targetX = bounds.x + bounds.width / 2;
    targetY = bounds.y + bounds.height / 2;
  }
  const sandbagCenter = { x: targetX, y: targetY };

  const dx = sandbagCenter.x - attackerPos.x;
  const dy = sandbagCenter.y - attackerPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ndx = dx / dist;
  const ndy = dy / dist;
  const farPoint = {
    x: attackerPos.x + ndx * 1000,
    y: attackerPos.y + ndy * 1000,
  };

  const laserGfx = new PIXI.Graphics();
  laserGfx.lineStyle(30, 0x0000ff, 1);
  laserGfx.moveTo(attackerPos.x, attackerPos.y);
  laserGfx.lineTo(farPoint.x, farPoint.y);
  app.stage.addChild(laserGfx);

  const damage = attackerUnit.unit.attack * 0.4;
  lasers.push({
    graphics: laserGfx,
    lifetime: 3,
    start: { ...attackerPos },
    end: { ...farPoint },
    damage,
  });

  const distance = pointToLineDistance(sandbagCenter, attackerPos, farPoint);
  if (distance < 10) {
    currentHPRef.current = Math.max(currentHPRef.current - damage, 0);
    updateHPBar();
    showDamageText({
      app,
      damage,
      basePosition: sandbagCenter,
      damageTexts,
    });
  }
}
