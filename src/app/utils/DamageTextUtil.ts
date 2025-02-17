import * as PIXI from "pixi.js";

export interface DamageText {
  text: PIXI.Text;
  age: number;
  lifetime: number;
  startX: number;
  startY: number;
  hVel: number;
  peakHeight: number;
}

/**
 * showDamageText
 * 指定の位置を基準に、ダメージテキストを生成しステージに追加します。
 * デフォルトでは lifetime: 30フレーム、ランダムオフセット ±20px、水平ドリフト -1～+1px/frame、peakHeight 20px で表示します。
 */
export function showDamageText(params: {
  app: PIXI.Application;
  damage: number;
  basePosition: { x: number; y: number };
  damageTexts: DamageText[];
  lifetime?: number;
  offsetRange?: number;
  hVelRange?: number;
  peakHeight?: number;
}): void {
  const {
    app,
    damage,
    basePosition,
    damageTexts,
    lifetime = 30,
    offsetRange = 20,
    hVelRange = 2,
    peakHeight = 20,
  } = params;

  const dmgText = new PIXI.Text(
    damage.toFixed(1),
    new PIXI.TextStyle({
      fontSize: 16,
      fill: 0xff0000,
      fontWeight: "bold",
    })
  );
  dmgText.anchor.set(0.5);
  const randomOffsetX = Math.random() * (offsetRange * 2) - offsetRange;
  const randomOffsetY = Math.random() * (offsetRange * 2) - offsetRange;
  const startX = basePosition.x + randomOffsetX;
  const startY = basePosition.y + randomOffsetY;
  dmgText.x = startX;
  dmgText.y = startY;
  app.stage.addChild(dmgText);
  damageTexts.push({
    text: dmgText,
    age: 0,
    lifetime,
    startX,
    startY,
    hVel: Math.random() * hVelRange - hVelRange / 2,
    peakHeight,
  });
}
