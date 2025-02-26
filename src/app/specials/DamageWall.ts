import * as PIXI from "pixi.js";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText";

export interface DamageWallEffect {
  graphics: PIXI.Graphics;
  remaining: number; // 残存フレーム数
  damage: number; // 1フレームごとに与えるダメージ
  team: "ally" | "enemy"; // 発生させたユニットのチーム
}

/**
 * handleDamageWallAttack
 * 指定のユニット（発動者）の攻撃力を元に、
 * 画面全体の各壁面に沿ってダメージウォールエフェクトを生成します。
 * 壁面の太さは 3px、効果持続は 20 フレーム、ダメージは攻撃力の 200% とします。
 */
export function handleDamageWallAttack(params: {
  app: PIXI.Application;
  unit: UnitText;
  damageWallEffects: DamageWallEffect[];
}): void {
  const { app, unit, damageWallEffects } = params;
  const wallThickness = 20;
  const lifetime = 20;
  const damage = unit.unit.attack * 2.0; // 200% のダメージ
  const team = unit.unit.team; // 発動者のチーム

  // top wall
  const topWall = new PIXI.Graphics();
  topWall.beginFill(0xff0000);
  topWall.drawRect(0, 0, app.screen.width, wallThickness);
  topWall.endFill();
  app.stage.addChild(topWall);
  damageWallEffects.push({
    graphics: topWall,
    remaining: lifetime,
    damage,
    team,
  });

  // bottom wall
  const bottomWall = new PIXI.Graphics();
  bottomWall.beginFill(0xff0000);
  bottomWall.drawRect(
    0,
    app.screen.height - wallThickness,
    app.screen.width,
    wallThickness
  );
  bottomWall.endFill();
  app.stage.addChild(bottomWall);
  damageWallEffects.push({
    graphics: bottomWall,
    remaining: lifetime,
    damage,
    team,
  });

  // left wall
  const leftWall = new PIXI.Graphics();
  leftWall.beginFill(0xff0000);
  leftWall.drawRect(0, 0, wallThickness, app.screen.height);
  leftWall.endFill();
  app.stage.addChild(leftWall);
  damageWallEffects.push({
    graphics: leftWall,
    remaining: lifetime,
    damage,
    team,
  });

  // right wall
  const rightWall = new PIXI.Graphics();
  rightWall.beginFill(0xff0000);
  rightWall.drawRect(
    app.screen.width - wallThickness,
    0,
    wallThickness,
    app.screen.height
  );
  rightWall.endFill();
  app.stage.addChild(rightWall);
  damageWallEffects.push({
    graphics: rightWall,
    remaining: lifetime,
    damage,
    team,
  });
}

/**
 * updateDamageWallEffects
 * 毎フレーム、各ダメージウォールエフェクトの残存時間を減らし、
 * 発生した壁エリアに対して、反対チームのユニットにのみダメージを与え、ダメージテキストを表示します。
 */
export function updateDamageWallEffects(params: {
  app: PIXI.Application;
  damageWallEffects: DamageWallEffect[];
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  updateTargetHP: (target: UnitText, damage: number) => void;
  damageTexts: DamageText[];
}): void {
  const { app, damageWallEffects, updateTargetHP, damageTexts } = params;

  // ここで、反対チームのユニットのみを対象とする
  damageWallEffects.forEach((wall, i) => {
    wall.remaining--;

    // 対象となるユニットは、発生元のチームと反対のユニットのみ
    const targets = wall.team === "ally" ? params.enemyUnits : params.allyUnits;
    targets.forEach((unit) => {
      const x = unit.text.x;
      const y = unit.text.y;
      let colliding = false;
      const wallThickness = 20;
      // top
      if (y <= wallThickness) colliding = true;
      // bottom
      if (y >= app.screen.height - wallThickness) colliding = true;
      // left
      if (x <= wallThickness) colliding = true;
      // right
      if (x >= app.screen.width - wallThickness) colliding = true;

      if (colliding) {
        updateTargetHP(unit, wall.damage);
        showDamageText({
          app,
          damage: wall.damage,
          basePosition: { x: unit.text.x, y: unit.text.y },
          damageTexts,
        });
      }
    });

    if (wall.remaining <= 0) {
      app.stage.removeChild(wall.graphics);
      damageWallEffects.splice(i, 1);
    }
  });
}
