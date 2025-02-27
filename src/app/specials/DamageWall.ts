// specials/DamageWall.ts
import * as PIXI from "pixi.js";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText";

export interface DamageWallEffect {
  sprite: PIXI.TilingSprite;
  remaining: number; // 残存フレーム数
  damage: number; // 1フレームごとに与えるダメージ
  team: "ally" | "enemy"; // 発動者のチーム
}

/**
 * handleDamageWallAttack
 * 指定のユニット（発動者）の攻撃力を元に、
 * 画面全体の各壁面に沿って、スプライトを用いた派手なダメージウォールエフェクトを生成します。
 * 壁面の太さは 20px、効果持続は 20 フレーム、ダメージは攻撃力の 200% とします。
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
  const team = unit.team;

  // 作業用グラフィックでパターンを描画し、テクスチャ生成
  const patternGraphics = new PIXI.Graphics();
  // 背景となる半透明オレンジ色の矩形
  patternGraphics.beginFill(0xff4500, 0.5);
  patternGraphics.drawRect(0, 0, wallThickness, wallThickness);
  patternGraphics.endFill();
  // 対角線のラインを描画（黄色）
  patternGraphics.lineStyle(2, 0xffff00, 1);
  patternGraphics.moveTo(0, 0);
  patternGraphics.lineTo(wallThickness, wallThickness);
  patternGraphics.moveTo(wallThickness, 0);
  patternGraphics.lineTo(0, wallThickness);
  const patternTexture = app.renderer.generateTexture(patternGraphics);

  // top wall
  const topWall = new PIXI.TilingSprite(
    patternTexture,
    app.screen.width,
    wallThickness
  );
  topWall.y = 0;
  app.stage.addChild(topWall);
  damageWallEffects.push({
    sprite: topWall,
    remaining: lifetime,
    damage,
    team,
  });

  // bottom wall
  const bottomWall = new PIXI.TilingSprite(
    patternTexture,
    app.screen.width,
    wallThickness
  );
  bottomWall.y = app.screen.height - wallThickness;
  app.stage.addChild(bottomWall);
  damageWallEffects.push({
    sprite: bottomWall,
    remaining: lifetime,
    damage,
    team,
  });

  // left wall
  const leftWall = new PIXI.TilingSprite(
    patternTexture,
    wallThickness,
    app.screen.height
  );
  leftWall.x = 0;
  app.stage.addChild(leftWall);
  damageWallEffects.push({
    sprite: leftWall,
    remaining: lifetime,
    damage,
    team,
  });

  // right wall
  const rightWall = new PIXI.TilingSprite(
    patternTexture,
    wallThickness,
    app.screen.height
  );
  rightWall.x = app.screen.width - wallThickness;
  app.stage.addChild(rightWall);
  damageWallEffects.push({
    sprite: rightWall,
    remaining: lifetime,
    damage,
    team,
  });
}

/**
 * updateDamageWallEffects
 * 各ダメージウォールエフェクトの残存時間を毎フレーム更新し、
 * 発動者のチームと反対のユニットが壁域に侵入している場合にダメージを与え、ダメージテキストを表示します。
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
  const wallThickness = 20;

  for (let i = damageWallEffects.length - 1; i >= 0; i--) {
    const wall = damageWallEffects[i];
    wall.remaining--;

    // 対象は、発動者のチームと反対のユニットのみ
    const targets = wall.team === "ally" ? params.enemyUnits : params.allyUnits;
    targets.forEach((unit) => {
      const x = unit.text.x;
      const y = unit.text.y;
      let colliding = false;
      if (y <= wallThickness) colliding = true;
      if (y >= app.screen.height - wallThickness) colliding = true;
      if (x <= wallThickness) colliding = true;
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
      app.stage.removeChild(wall.sprite);
      damageWallEffects.splice(i, 1);
    }
  }
}
