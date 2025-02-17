import * as PIXI from "pixi.js";

export interface Sandbag {
  container: PIXI.Container;
  text: PIXI.Text;
  hpBar: PIXI.Graphics;
}

export const SANDBAG_MAX_HP = 1000;

/**
 * createSandbag
 * 指定された座標 (x, y) にサンドバッグ（● と HPバー）を生成し、ステージに追加します。
 */
export function createSandbag(
  app: PIXI.Application,
  x: number,
  y: number
): Sandbag {
  const container = new PIXI.Container();
  const text = new PIXI.Text("●", {
    fontSize: 20,
    fill: 0x000000,
    fontWeight: "bold",
  });
  text.anchor.set(0.5);
  container.addChild(text);

  const hpBar = new PIXI.Graphics();
  container.addChild(hpBar);

  container.x = x;
  container.y = y;
  app.stage.addChild(container);

  return { container, text, hpBar };
}

/**
 * updateHPBar
 * サンドバッグの HPバーを更新します。currentHP が最大値（maxHP）に対してどの程度残っているかを表示します。
 */
export function updateHPBar(
  sandbag: Sandbag,
  currentHP: number,
  maxHP: number = SANDBAG_MAX_HP
): void {
  const { hpBar, text } = sandbag;
  hpBar.clear();
  const hpRatio = currentHP / maxHP;
  const greenWidth = 20 * hpRatio;
  hpBar.beginFill(0x00ff00);
  hpBar.drawRect(-10, text.height / 2 + 5, greenWidth, 1);
  hpBar.endFill();
  hpBar.beginFill(0xff0000);
  hpBar.drawRect(-10 + greenWidth, text.height / 2 + 5, 20 - greenWidth, 1);
  hpBar.endFill();
}
