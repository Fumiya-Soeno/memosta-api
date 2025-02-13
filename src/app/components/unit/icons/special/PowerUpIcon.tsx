import React from "react";

const PowerUpIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 背景用のラジアルグラデーション */}
        <radialGradient id="powerGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" /> {/* ゴールド */}
          <stop offset="100%" stopColor="#FF8C00" /> {/* ダークオレンジ */}
        </radialGradient>
        {/* グロー（発光）フィルター */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 背景の円（グラデーションと外枠） */}
      <circle
        cx="40"
        cy="40"
        r="38"
        fill="url(#powerGradient)"
        stroke="#FF8C00"
        strokeWidth="2"
      />

      {/* 中央のプラス記号 */}
      {/* 縦の長方形 */}
      <rect
        x="37"
        y="25"
        width="6"
        height="30"
        fill="#FFF"
        filter="url(#glow)"
      />
      {/* 横の長方形 */}
      <rect
        x="25"
        y="37"
        width="30"
        height="6"
        fill="#FFF"
        filter="url(#glow)"
      />

      {/* 装飾的なスパーク（任意の演出） */}
      <circle
        cx="20"
        cy="20"
        r="2"
        fill="#FFF"
        filter="url(#glow)"
        opacity="0.8"
      />
      <circle
        cx="60"
        cy="20"
        r="2"
        fill="#FFF"
        filter="url(#glow)"
        opacity="0.8"
      />
      <circle
        cx="20"
        cy="60"
        r="2"
        fill="#FFF"
        filter="url(#glow)"
        opacity="0.8"
      />
      <circle
        cx="60"
        cy="60"
        r="2"
        fill="#FFF"
        filter="url(#glow)"
        opacity="0.8"
      />
    </svg>
  );
};

export default PowerUpIcon;
