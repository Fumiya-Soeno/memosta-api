import * as PIXI from "pixi.js";
import { ExtendedUnitText } from "../components/PixiCanvas";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";
import { Laser, handleLockOnLaserAttack } from "./LockOnLaser";

function getNearestTarget(
  attacker: ExtendedUnitText,
  targets: ExtendedUnitText[]
): ExtendedUnitText | null {
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
  attacker: ExtendedUnitText,
  targets: ExtendedUnitText[],
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
  allies: ExtendedUnitText[],
  enemies: ExtendedUnitText[],
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
