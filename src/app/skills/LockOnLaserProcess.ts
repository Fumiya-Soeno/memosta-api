import * as PIXI from "pixi.js";
import { UnitText } from "../../types/UnitText";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";
import { Laser, handleLockOnLaserAttack } from "./LockOnLaser";

function getNearestTarget(
  attacker: UnitText,
  targets: UnitText[]
): UnitText | null {
  const validTargets = targets.filter((t) => t !== attacker);
  if (validTargets.length === 0) return null;
  let nearest = validTargets[0];
  let minDist = Math.hypot(
    attacker.text.x - nearest.text.x,
    attacker.text.y - nearest.text.y
  );
  for (const t of validTargets) {
    const d = Math.hypot(
      attacker.text.x - t.text.x,
      attacker.text.y - t.text.y
    );
    if (d < minDist) {
      minDist = d;
      nearest = t;
    }
  }
  return nearest;
}

export function processLockOnLaserAttack(
  attackFrame: number,
  attacker: UnitText,
  targets: UnitText[],
  app: PIXI.Application,
  damageTexts: DamageText[],
  lasers: Laser[]
) {
  if (attackFrame % 5 !== 0) return;
  if (attacker.unit.skill_name !== "ロックオンレーザー") return;
  const target = getNearestTarget(attacker, targets);
  if (!target) return;
  const targetContainer = new PIXI.Container();
  targetContainer.x = target.text.x;
  targetContainer.y = target.text.y;
  handleLockOnLaserAttack({
    app,
    texts: [attacker],
    sandbagContainer: targetContainer,
    currentHPRef: { current: target.hp },
    updateHPBar: () => {},
    damageTexts,
    lasers,
  });
  const dmg = attacker.unit.attack * 0.4;
  target.hp = Math.max(target.hp - dmg, 0);
  showDamageText({
    app,
    damage: dmg,
    basePosition: { x: target.text.x, y: target.text.y },
    damageTexts,
  });
}

/**
 * processTeamLockOnLaserAttacks
 * 友軍と敵の双方からロックオンレーザー攻撃を実行します。
 */
export function processTeamLockOnLaserAttacks(
  attackFrame: number,
  allies: UnitText[],
  enemies: UnitText[],
  app: PIXI.Application,
  damageTexts: DamageText[],
  lasers: Laser[]
) {
  allies.forEach((ally) => {
    processLockOnLaserAttack(
      attackFrame,
      ally,
      enemies,
      app,
      damageTexts,
      lasers
    );
  });
  enemies.forEach((enemy) => {
    processLockOnLaserAttack(
      attackFrame,
      enemy,
      allies,
      app,
      damageTexts,
      lasers
    );
  });
}

/**
 * updateLasers
 * レーザーの lifetime を減少させ、寿命が尽きたレーザーはステージから削除し、配列から除去します。
 *
 * @param app PIXI.Application のインスタンス
 * @param lasers 更新対象のレーザー配列
 */
export function updateLasers(app: PIXI.Application, lasers: Laser[]): void {
  for (let i = lasers.length - 1; i >= 0; i--) {
    const laser = lasers[i];
    laser.lifetime -= 1;
    if (laser.lifetime <= 0) {
      app.stage.removeChild(laser.graphics);
      lasers.splice(i, 1);
    }
  }
}
