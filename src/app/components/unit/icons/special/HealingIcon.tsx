import React from "react";

const HealingIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 柔らかな青緑のラジアルグラデーション */}
        <radialGradient id="healingGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e0f7fa" />
          <stop offset="100%" stopColor="#80deea" />
        </radialGradient>
        {/* グロー（発光）効果 */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 背景の円 */}
      <circle
        cx="40"
        cy="40"
        r="38"
        fill="url(#healingGradient)"
        stroke="#4dd0e1"
        strokeWidth="2"
      />

      {/* 味方全体の回復を示す回復オーラ（破線のリング） */}
      <circle
        cx="40"
        cy="40"
        r="30"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeDasharray="4 2"
        filter="url(#glow)"
      />

      {/* 味方を表す小さな円（上下左右） */}
      <circle cx="40" cy="10" r="4" fill="#ffffff" filter="url(#glow)" />
      <circle cx="70" cy="40" r="4" fill="#ffffff" filter="url(#glow)" />
      <circle cx="40" cy="70" r="4" fill="#ffffff" filter="url(#glow)" />
      <circle cx="10" cy="40" r="4" fill="#ffffff" filter="url(#glow)" />

      {/* 中央のプラス記号（回復の象徴） */}
      {/* 縦の長方形 */}
      <rect
        x="38"
        y="32"
        width="4"
        height="16"
        fill="#ffffff"
        filter="url(#glow)"
      />
      {/* 横の長方形 */}
      <rect
        x="32"
        y="38"
        width="16"
        height="4"
        fill="#ffffff"
        filter="url(#glow)"
      />
    </svg>
  );
};

export default HealingIcon;
