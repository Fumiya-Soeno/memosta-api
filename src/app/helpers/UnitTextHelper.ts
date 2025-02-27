// UnitTextHelper.ts
import * as PIXI from "pixi.js";
import { UnitDataType } from "../../types/unit";
import { UnitText } from "../../types/UnitText";

/**
 * createUnitTexts
 * 指定されたユニットデータから、PIXI.Text と HPバー（PIXI.Graphics）を生成し、画面上に配置します。
 *
 * @param app - PIXI.Application インスタンス
 * @param units - ユニットデータの配列
 * @param isAlly - trueの場合は味方ユニット用、falseの場合は敵ユニット用の設定を適用
 * @returns 生成された UnitText オブジェクトの配列
 */
export function createUnitTexts(
  app: PIXI.Application,
  units: UnitDataType[],
  isAlly: boolean
): UnitText[] {
  // 味方は位置昇順、敵は位置降順でソート
  const sortedUnits = isAlly
    ? [...units].sort((a, b) => a.position - b.position)
    : [...units].sort((a, b) => b.position - a.position);

  // テキストのスタイル設定
  const textStyle = isAlly
    ? { fontSize: 20, fill: 0x000000, fontWeight: "bold" }
    : { fontSize: 20, fill: 0xff0000, fontWeight: "bold" };

  // 各ユニットから UnitText オブジェクトを生成

  const unitMultiplier = 6 / units.length;

  const unitTexts: UnitText[] = sortedUnits.map((unit) => {
    const text = new PIXI.Text(unit.name, textStyle);
    text.anchor.set(0.5);
    // 味方は向きを反転（+180度）する
    const angle = isAlly
      ? ((unit.vector + 180) * Math.PI) / 180
      : (unit.vector * Math.PI) / 180;
    const vx = unit.speed * Math.cos(angle);
    const vy = unit.speed * Math.sin(angle);
    const hpBar = new PIXI.Graphics();
    app.stage.addChild(hpBar);

    return {
      text,
      unit,
      vx,
      vy,
      powerUpMultiplier: 1.0,
      baseAttack: unit.attack * unitMultiplier,
      hp: unit.life * unitMultiplier,
      maxHp: unit.life * unitMultiplier,
      team: isAlly ? "ally" : "enemy",
      hpBar,
      unitName: "", // 初期値として空文字
    };
  });

  // ここで全ユニットの name を結合して1つの文字列にする
  const concatenatedUnitName = sortedUnits.map((unit) => unit.name).join("");
  // 各 UnitText オブジェクトに unitName プロパティとして格納
  unitTexts.forEach((ut) => {
    ut.unitName = isAlly
      ? concatenatedUnitName
      : concatenatedUnitName.split("").reverse().join("");
  });

  // 配置するテキストの合計幅を計算し、中央揃えの x 座標を決定
  const totalWidth = unitTexts.reduce((sum, ut) => sum + ut.text.width, 0);
  let currentX = app.screen.width / 2 - totalWidth / 2;
  unitTexts.forEach((ut) => {
    ut.text.x = currentX + ut.text.width / 2;
    ut.text.y = isAlly ? (app.screen.height * 3) / 4 : app.screen.height / 4;
    currentX += ut.text.width;
    app.stage.addChild(ut.text);
  });

  return unitTexts;
}
