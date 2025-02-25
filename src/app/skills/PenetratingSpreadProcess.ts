import * as PIXI from "pixi.js";
import { showDamageText, DamageText } from "../utils/DamageTextUtil";
import { UnitText } from "../../types/UnitText";
import {
  PenetratingSpreadBullet,
  handlePenetratingSpreadAttack,
  updatePenetratingSpreadBullets,
} from "./PenetratingSpread";

// 拡張：各弾に所属チーム情報を付加する
export interface TeamPenetratingSpreadBullet extends PenetratingSpreadBullet {
  team: "ally" | "enemy";
}

/**
 * handleTeamPenetratingSpreadAttack
 * 各チームのユニット（skill_name が「貫通拡散弾」のもの）から弾を発射し、発射した弾には
 * 所属チーム情報を設定します。
 */
export function handleTeamPenetratingSpreadAttack(params: {
  app: PIXI.Application;
  teamUnits: UnitText[];
  spreadBullets: TeamPenetratingSpreadBullet[];
}) {
  const units = params.teamUnits.filter(
    (u) => u.unit.skill_name === "貫通拡散弾"
  );
  if (units.length === 0) return;
  units.forEach((unit) => {
    handlePenetratingSpreadAttack({
      app: params.app,
      texts: [unit],
      spreadBullets: params.spreadBullets,
    });
    // 新たに追加された弾は常に16個（handlePenetratingSpreadAttackで発射）
    const bulletCount = 16;
    const startIndex = params.spreadBullets.length - bulletCount;
    for (let i = startIndex; i < params.spreadBullets.length; i++) {
      params.spreadBullets[i].team = unit.team;
    }
  });
}

/**
 * updateTeamPenetratingSpreadBullets
 * 各弾を毎フレーム更新し、相手チームのユニットとの衝突判定を行います。
 */
export function updateTeamPenetratingSpreadBullets(params: {
  app: PIXI.Application;
  spreadBullets: TeamPenetratingSpreadBullet[];
  allyTargets: UnitText[];
  enemyTargets: UnitText[];
  updateTargetHP: (target: UnitText, damage: number) => void;
  damageTexts: DamageText[];
}) {
  const { app, spreadBullets, updateTargetHP, damageTexts } = params;
  for (let i = spreadBullets.length - 1; i >= 0; i--) {
    const bullet = spreadBullets[i];
    bullet.graphics.x += bullet.vx;
    bullet.graphics.y += bullet.vy;
    // 衝突対象は、bullet.team が "ally" の場合は敵ユニット、"enemy" の場合は味方ユニット
    const targets =
      bullet.team === "ally" ? params.enemyTargets : params.allyTargets;
    targets.forEach((target) => {
      const dx = bullet.graphics.x - target.text.x;
      const dy = bullet.graphics.y - target.text.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 10) {
        updateTargetHP(target, bullet.damage);
        showDamageText({
          app,
          damage: bullet.damage,
          basePosition: { x: target.text.x, y: target.text.y },
          damageTexts,
        });
      }
    });
    // 画面外に出た弾は削除
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

/**
 * processTeamPenetratingSpreadAttacks
 * 友軍、敵ユニットそれぞれから貫通拡散弾攻撃を発動し、弾の更新処理を実行します。
 * PixiCanvas.tsx上からはこの関数を1行で呼び出すだけで処理が完結します。
 */
export function processTeamPenetratingSpreadAttacks(params: {
  app: PIXI.Application;
  allyUnits: UnitText[];
  enemyUnits: UnitText[];
  spreadBullets: TeamPenetratingSpreadBullet[];
  updateTargetHP: (target: UnitText, damage: number) => void;
  damageTexts: DamageText[];
  counter: number;
}) {
  if (params.counter % 10 === 0) {
    // 各チームから攻撃発動
    handleTeamPenetratingSpreadAttack({
      app: params.app,
      teamUnits: params.allyUnits,
      spreadBullets: params.spreadBullets,
    });
    handleTeamPenetratingSpreadAttack({
      app: params.app,
      teamUnits: params.enemyUnits,
      spreadBullets: params.spreadBullets,
    });
  }
  // 発射後、各弾の更新と衝突判定
  updateTeamPenetratingSpreadBullets({
    app: params.app,
    spreadBullets: params.spreadBullets,
    allyTargets: params.allyUnits,
    enemyTargets: params.enemyUnits,
    updateTargetHP: params.updateTargetHP,
    damageTexts: params.damageTexts,
  });
}
