// UnitTextHelper.ts
import * as PIXI from "pixi.js";
import { ITextStyle } from "pixi.js";
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
export async function createUnitTexts(
  app: PIXI.Application,
  units: UnitDataType[],
  isAlly: boolean
): Promise<UnitText[]> {
  // 敵軍の場合も表示順を反転するが、検索用文字列は元の順序にする
  // 表示用のソート：味方は位置昇順、敵は位置降順
  const sortedUnits = isAlly
    ? [...units].sort((a, b) => a.position - b.position)
    : [...units].sort((a, b) => b.position - a.position);

  // 検索用の文字列は元の順序のユニット名を結合
  const searchUnitName = units.map((unit) => unit.name).join("");

  // 表示用の文字列はソート済みのユニット名を結合
  const concatenatedUnitName = sortedUnits.map((unit) => unit.name).join("");

  // ユニットの文字最大重複回数
  const unitNameDuplicateCount =
    getMaxCharacterDuplicateCount(concatenatedUnitName);

  // 文字重複による倍率(重複が多いほど弱くなる)
  let unitNameDuplicateMultiplier = 1;
  const maxUnitNameDuplicateMultiplier = 0.05;
  if (concatenatedUnitName.length > 1) {
    unitNameDuplicateMultiplier =
      1 -
      (Math.log10(unitNameDuplicateCount) / Math.log10(12)) *
        (1 - maxUnitNameDuplicateMultiplier);
  }

  // 記号が入っているとユニットパワー1/10
  let incluteASCIIMultiplier = 1;
  const incluteASCIIRegex =
    /[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E\uFF01-\uFF5E]/;
  if (incluteASCIIRegex.test(searchUnitName)) {
    incluteASCIIMultiplier = 0.01;
  }

  // テキストのスタイル設定
  const textStyle: Partial<ITextStyle> = isAlly
    ? { fontSize: 20, fill: 0x000000, fontWeight: "bold" }
    : { fontSize: 20, fill: 0xff0000, fontWeight: "bold" };

  // 文字数が少ないほど1文字が強くなり、文字数が多いほど1文字が弱くなる
  const unitMultiplier = 6 / units.length;

  // Wikipedia APIの検索結果が多いほど強くなる倍率を、検索用の文字列で取得する
  const wordMultiplier = await getWordMultiplier(searchUnitName);

  const unitPower =
    unitNameDuplicateMultiplier *
    unitMultiplier *
    wordMultiplier *
    incluteASCIIMultiplier;
  console.log(searchUnitName, unitPower / unitMultiplier);

  // 各ユニットから UnitText オブジェクトを生成
  const unitTexts: UnitText[] = sortedUnits.map((unit, index) => {
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
      baseAttack: unit.attack * unitPower,
      hp: unit.life * unitPower,
      maxHp: unit.life * unitPower,
      team: isAlly ? "ally" : "enemy",
      hpBar,
      unitName: "", // 初期値として空文字
      isDuplicate: false, // 追加: 重複しているかのフラグ（初期値 false）
      id: unit.id,
    };
  });

  // 各 UnitText オブジェクトに unitName プロパティとして格納
  // 味方はそのまま、敵の場合は表示用に反転
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

/**
 * ユニット名文字列中で最も多く出現する文字の出現回数を返す関数
 * @param unitName - ユニット名の文字列（例："ああいあ"）
 * @returns 最大の重複数（例：3）
 */
function getMaxCharacterDuplicateCount(unitName: string): number {
  const charCounts: Record<string, number> = {};
  for (const char of unitName) {
    charCounts[char] = (charCounts[char] || 0) + 1;
  }
  return Math.max(...Object.values(charCounts));
}

// Wikipedia検索APIの検索結果が多いほど強くなる
async function getWordMultiplier(unitName: string): Promise<number> {
  const MIN_MULTIPLIER = 0.01;
  const MAX_MULTIPLIER = 5.0;
  const MAX_HIT = 300000;

  const url = `https://ja.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(
    unitName
  )}`;
  const response = await fetch(url);
  const data = await response.json();
  const hitCount = data.query.searchinfo.totalhits;

  if (hitCount <= 0) {
    return MIN_MULTIPLIER;
  } else if (hitCount >= MAX_HIT) {
    return MAX_MULTIPLIER;
  }

  const ratio = Math.log10(hitCount + 1) / Math.log10(MAX_HIT + 1);
  const multiplier = MIN_MULTIPLIER + ratio * (MAX_MULTIPLIER - MIN_MULTIPLIER);
  return multiplier;
}
