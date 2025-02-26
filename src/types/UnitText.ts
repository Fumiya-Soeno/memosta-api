import * as PIXI from "pixi.js";

export interface UnitText {
  // ユニットの表示用テキスト
  text: PIXI.Text;
  // ユニットの基本情報（必要なプロパティを含めます）
  unit: {
    skill_name: string;
    attack: number;
    special_name?: string;
    // 他に必要なプロパティがあれば追加可能
    [key: string]: any;
  };
  // 移動速度
  vx: number;
  vy: number;
  // バフ等による攻撃力倍率
  powerUpMultiplier: number;
  // 基本攻撃力
  baseAttack: number;
  // 現在のHP
  hp: number;
  // 最大HP
  maxHp: number;
  // 所属チーム
  team: "ally" | "enemy";
  // HPバー表示用のグラフィックスオブジェクト
  hpBar: PIXI.Graphics;
  isDuplicate: boolean;
}
