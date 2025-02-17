// attacks/LockOnLaser.ts
import * as PIXI from "pixi.js";

export interface UnitText {
  text: PIXI.Text;
  unit: {
    skill_name: string;
    attack: number;
  };
}

export interface Laser {
  graphics: PIXI.Graphics;
  lifetime: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
  damage: number;
}

export interface DamageText {
  text: PIXI.Text;
  age: number;
  lifetime: number;
  startX: number;
  startY: number;
  hVel: number;
  peakHeight: number;
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
  const sandbagBounds = sandbagContainer.getBounds();
  const sandbagCenter = {
    x: sandbagBounds.x + sandbagBounds.width / 2,
    y: sandbagBounds.y + sandbagBounds.height / 2,
  };
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
  laserGfx.lineStyle(3, 0x0000ff, 1);
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

    const dmgText = new PIXI.Text(
      damage.toFixed(1),
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
}
