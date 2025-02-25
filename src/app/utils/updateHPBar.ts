import * as PIXI from "pixi.js";

/**
 * updateUnitHPBar
 * ユニットの HPバーを更新します。
 * @param unit - 更新対象のユニット。unit.text, unit.hp, unit.maxHp, unit.hpBar を持つこと
 */
export function updateUnitHPBar(unit: {
  text: PIXI.Text;
  hp: number;
  maxHp: number;
  hpBar: PIXI.Graphics;
}): void {
  const barWidth = 30;
  const barHeight = 4;
  const ratio = unit.hp / unit.maxHp;
  unit.hpBar.clear();
  unit.hpBar.beginFill(0x00ff00);
  unit.hpBar.drawRect(
    unit.text.x - barWidth / 2,
    unit.text.y + 10,
    barWidth * ratio,
    barHeight
  );
  unit.hpBar.endFill();
  unit.hpBar.beginFill(0xff0000);
  unit.hpBar.drawRect(
    unit.text.x - barWidth / 2 + barWidth * ratio,
    unit.text.y + 10,
    barWidth * (1 - ratio),
    barHeight
  );
  unit.hpBar.endFill();
}
