import React from "react";

const FlameEdgeIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 火属性をイメージしたグラデーション */}
        <linearGradient id="flameGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff4500" /> {/* オレンジレッド */}
          <stop offset="100%" stopColor="#ffd700" /> {/* ゴールド */}
        </linearGradient>
        {/* 三日月型（刃）の形状を作るためのマスク */}
        <mask id="crescentMask">
          <rect x="0" y="0" width="80" height="80" fill="white" />
          {/* 内側の黒い円で外側の円の一部を隠す */}
          <circle cx="40" cy="40" r="25" fill="black" />
        </mask>
        {/* グロー（発光）効果 */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* 背景用の暗めのラジアルグラデーション */}
        <radialGradient id="backgroundGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2c3e50" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
      </defs>

      {/* 背景の円 */}
      <circle
        cx="40"
        cy="40"
        r="38"
        fill="url(#backgroundGradient)"
        stroke="#111"
        strokeWidth="2"
      />

      {/* フレイムエッジの三日月型刃：右方向へずらすことで攻撃方向（＝敵に向かう）を示唆 */}
      <circle
        cx="50"
        cy="40"
        r="30"
        fill="url(#flameGradient)"
        mask="url(#crescentMask)"
        filter="url(#glow)"
      />
    </svg>
  );
};

export default FlameEdgeIcon;
